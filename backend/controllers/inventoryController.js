const mongoose = require("mongoose");
const {
  Category,
  Warehouse,
  Product,
  ReorderRule,
  InventoryDocument,
  StockMovement
} = require("../models/Inventory");
const { calculateSuggestedOrder, matchesInventoryFilters, normalizeOperationLines } = require("../utils/inventoryLogic");

const fail = (status, message) => Object.assign(new Error(message), { status });

const endpoint = (handler, successStatus = 200) => async (req, res) => {
  try {
    const result = await handler(req);
    res.status(successStatus).json(result);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A record with that code or name already exists." });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Inventory API error:", error.message);
    res.status(error.status || 500).json({ message: error.status ? error.message : "Inventory request failed." });
  }
};

const requireManager = (user) => {
  if (user.role !== "inventory_manager") throw fail(403, "Inventory Manager access is required.");
};

const productResponse = (product) => {
  const stockByLocation = product.stockByLocation || [];
  return {
    id: String(product._id),
    sku: product.sku,
    name: product.name,
    category: product.category,
    uom: product.uom,
    stock: stockByLocation.reduce((total, row) => total + row.quantity, 0),
    stockByLocation,
    reorderPoint: product.reorderPoint
  };
};

const documentLines = (document) => document.lines?.length
  ? document.lines.map((line) => ({
    productId: String(line.product),
    product: line.productName,
    sku: line.sku,
    category: line.category,
    quantity: line.quantity
  }))
  : [{
    productId: String(document.product),
    product: document.productName,
    sku: document.sku,
    category: document.category,
    quantity: document.type === "Adjustment" ? document.countedQuantity : document.quantity
  }];

const documentResponse = (document) => {
  const lines = documentLines(document);
  return {
    id: document.reference,
    _id: String(document._id),
    type: document.type,
    partner: document.partner || document.reason || "",
    warehouse: document.warehouse || document.sourceLocation || "",
    sourceLocation: document.sourceLocation,
    destinationLocation: document.destinationLocation,
    product: lines.length === 1 ? lines[0].product : `${lines.length} products`,
    productId: lines[0].productId,
    sku: lines.length === 1 ? lines[0].sku : `${lines.length} items`,
    category: lines.length === 1 ? lines[0].category : "Multiple",
    lines,
    quantity: lines.reduce((sum, line) => sum + line.quantity, 0),
    countedQuantity: document.countedQuantity,
    reason: document.reason,
    status: document.status,
    date: new Date(document.date).toISOString().slice(0, 10)
  };
};

const getFilters = endpoint(async () => {
  const [categories, warehouses] = await Promise.all([
    Category.find().sort({ name: 1 }).select("name -_id").lean(),
    Warehouse.find().sort({ name: 1 }).select("name -_id").lean()
  ]);
  return { categories: categories.map((row) => row.name), warehouses: warehouses.map((row) => row.name) };
});

const getCategories = endpoint(async () => ({
  categories: await Category.find().sort({ name: 1 }).lean()
}));

const createCategory = endpoint(async (req) => {
  requireManager(req.user);
  const name = String(req.body.name || "").trim();
  if (!name) throw fail(400, "Category name is required.");
  const category = await Category.create({ name });
  return { category };
}, 201);

const updateCategory = endpoint(async (req) => {
  requireManager(req.user);
  const name = String(req.body.name || "").trim();
  if (!name) throw fail(400, "Category name is required.");
  const session = await mongoose.startSession();
  let updatedCategory;
  try {
    await session.withTransaction(async () => {
      const category = await Category.findById(req.params.id).session(session);
      if (!category) throw fail(404, "Category not found.");
      const previousName = category.name;
      category.name = name;
      await category.save({ session });
      await Promise.all([
        Product.updateMany({ category: previousName }, { category: name }, { session }),
        InventoryDocument.updateMany({ category: previousName }, { category: name }, { session }),
        InventoryDocument.updateMany(
          { "lines.category": previousName },
          { $set: { "lines.$[line].category": name } },
          { arrayFilters: [{ "line.category": previousName }], session }
        )
      ]);
      updatedCategory = category.toObject();
    });
  } finally {
    await session.endSession();
  }
  return { category: updatedCategory };
});

const deleteCategory = endpoint(async (req) => {
  requireManager(req.user);
  const category = await Category.findById(req.params.id);
  if (!category) throw fail(404, "Category not found.");
  if (await Product.exists({ category: category.name })) throw fail(409, "Move or remove products in this category before deleting it.");
  if (await InventoryDocument.exists({ $or: [{ category: category.name }, { "lines.category": category.name }] })) {
    throw fail(409, "This category is used by operation history and cannot be deleted.");
  }
  await category.deleteOne();
  return { message: "Category deleted." };
});

const getProducts = endpoint(async (req) => {
  const products = await Product.find().sort({ name: 1 }).lean();
  const category = req.query.category;
  const search = String(req.query.search || "").trim().toLowerCase();
  return {
    products: products.map(productResponse).filter((product) => {
      if (category && category !== "all" && product.category !== category) return false;
      return !search || `${product.sku} ${product.name} ${product.category}`.toLowerCase().includes(search);
    })
  };
});

const createProduct = endpoint(async (req) => {
  requireManager(req.user);
  const { sku, name, category, uom, reorderPoint = 0, stock = 0, location = "Main Warehouse" } = req.body;
  if (!sku || !name || !category || !uom) throw fail(400, "SKU, name, category, and unit are required.");
  const categoryRecord = await Category.findOne({ name: category.trim() });
  if (!categoryRecord) throw fail(400, "Choose a valid product category.");
  const product = await Product.create({
    sku,
    name,
    category: categoryRecord.name,
    uom,
    reorderPoint: Number(reorderPoint),
    stockByLocation: location ? [{ location, quantity: Number(stock) || 0 }] : []
  });
  return { product: productResponse(product) };
}, 201);

const updateProduct = endpoint(async (req) => {
  requireManager(req.user);
  const { name, category, uom, reorderPoint } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (category !== undefined) {
    if (!(await Category.exists({ name: category }))) throw fail(400, "Choose a valid product category.");
    update.category = category;
  }
  if (uom !== undefined) update.uom = uom;
  if (reorderPoint !== undefined) update.reorderPoint = Number(reorderPoint);
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!product) throw fail(404, "Product not found.");
  return { product: productResponse(product) };
});

const getReorderRules = endpoint(async () => {
  const rules = await ReorderRule.find().populate("product", "sku name uom category stockByLocation").sort({ location: 1 }).lean();
  return {
    rules: rules.map((rule) => ({
      id: String(rule._id),
      productId: String(rule.product._id),
      sku: rule.product.sku,
      product: rule.product.name,
      category: rule.product.category,
      uom: rule.product.uom,
      location: rule.location,
      onHand: rule.product.stockByLocation.find((row) => row.location === rule.location)?.quantity || 0,
      reorderAt: rule.reorderAt,
      targetStock: rule.targetStock,
      suggestedOrder: calculateSuggestedOrder(
        rule.product.stockByLocation.find((row) => row.location === rule.location)?.quantity || 0,
        rule.reorderAt,
        rule.targetStock
      )
    }))
  };
});

const saveReorderRule = endpoint(async (req) => {
  requireManager(req.user);
  const { productId, location, reorderAt, targetStock } = req.body;
  if (!mongoose.isValidObjectId(productId) || !location) throw fail(400, "Choose a product and location.");
  const numericReorderAt = Number(reorderAt);
  const numericTargetStock = Number(targetStock);
  if (!Number.isFinite(numericReorderAt) || !Number.isFinite(numericTargetStock) || numericReorderAt < 0 || numericTargetStock < numericReorderAt) {
    throw fail(400, "Target stock must be greater than or equal to the reorder threshold.");
  }
  if (!(await Product.exists({ _id: productId }))) throw fail(404, "Product not found.");
  if (!(await Warehouse.exists({ name: location }))) throw fail(400, "Choose a valid warehouse or location.");
  const rule = await ReorderRule.findOneAndUpdate(
    { product: productId, location },
    { product: productId, location, reorderAt: numericReorderAt, targetStock: numericTargetStock },
    { upsert: true, returnDocument: "after", runValidators: true }
  );
  return { rule: { id: String(rule._id), productId: String(rule.product), location, reorderAt: rule.reorderAt, targetStock: rule.targetStock } };
}, 201);

const deleteReorderRule = endpoint(async (req) => {
  requireManager(req.user);
  const rule = await ReorderRule.findByIdAndDelete(req.params.id);
  if (!rule) throw fail(404, "Reorder rule not found.");
  return { message: "Reorder rule deleted." };
});

const getWarehouses = endpoint(async () => ({ warehouses: await Warehouse.find().sort({ name: 1 }).lean() }));

const createWarehouse = endpoint(async (req) => {
  requireManager(req.user);
  const { name, code, kind = "warehouse", parentWarehouse = "" } = req.body;
  if (!name || !code) throw fail(400, "Warehouse name and code are required.");
  if (!["warehouse", "location"].includes(kind)) throw fail(400, "Choose a valid entry type.");
  if (kind === "location" && (!parentWarehouse || !(await Warehouse.exists({ name: parentWarehouse, kind: "warehouse" })))) {
    throw fail(400, "Choose a valid parent warehouse for this location.");
  }
  const warehouse = await Warehouse.create({ name, code, kind, parentWarehouse: kind === "location" ? parentWarehouse : "" });
  return { warehouse };
}, 201);

const updateWarehouse = endpoint(async (req) => {
  requireManager(req.user);
  const { name, code, kind, parentWarehouse = "" } = req.body;
  if (!name || !code || !["warehouse", "location"].includes(kind)) throw fail(400, "Name, code, and a valid entry type are required.");
  if (kind === "location" && (!parentWarehouse || !(await Warehouse.exists({ name: parentWarehouse, kind: "warehouse", _id: { $ne: req.params.id } })))) {
    throw fail(400, "Choose a valid parent warehouse for this location.");
  }
  const entry = await Warehouse.findById(req.params.id);
  if (!entry) throw fail(404, "Warehouse or location not found.");
  if (entry.kind === "warehouse" && kind === "location" && await Warehouse.exists({ parentWarehouse: entry.name })) {
    throw fail(409, "A warehouse with child locations cannot be changed into a location.");
  }
  if (kind === "location" && parentWarehouse === name.trim()) throw fail(400, "A location cannot be its own parent warehouse.");
  const previousName = entry.name;
  entry.name = name;
  entry.code = code;
  entry.kind = kind;
  entry.parentWarehouse = kind === "location" ? parentWarehouse : "";
  await entry.save();
  if (previousName !== entry.name) {
    await Promise.all([
      Product.updateMany({ "stockByLocation.location": previousName }, { $set: { "stockByLocation.$[row].location": entry.name } }, { arrayFilters: [{ "row.location": previousName }] }),
      ReorderRule.updateMany({ location: previousName }, { location: entry.name }),
      InventoryDocument.updateMany({ warehouse: previousName }, { warehouse: entry.name }),
      InventoryDocument.updateMany({ sourceLocation: previousName }, { sourceLocation: entry.name }),
      InventoryDocument.updateMany({ destinationLocation: previousName }, { destinationLocation: entry.name }),
      StockMovement.updateMany({ from: previousName }, { from: entry.name }),
      StockMovement.updateMany({ to: previousName }, { to: entry.name }),
      Warehouse.updateMany({ parentWarehouse: previousName }, { parentWarehouse: entry.name })
    ]);
  }
  return { warehouse: entry };
});

const deleteWarehouse = endpoint(async (req) => {
  requireManager(req.user);
  const entry = await Warehouse.findById(req.params.id);
  if (!entry) throw fail(404, "Warehouse or location not found.");
  if (entry.kind === "warehouse" && await Warehouse.exists({ parentWarehouse: entry.name })) {
    throw fail(409, "Move or remove child locations before deleting this warehouse.");
  }
  const [usedByProducts, usedByDocuments, usedByMoves] = await Promise.all([
    Product.exists({ "stockByLocation.location": entry.name }),
    InventoryDocument.exists({ $or: [{ warehouse: entry.name }, { sourceLocation: entry.name }, { destinationLocation: entry.name }] }),
    StockMovement.exists({ $or: [{ from: entry.name }, { to: entry.name }] })
  ]);
  if (usedByProducts || usedByDocuments || usedByMoves) throw fail(409, "This location is referenced by stock or operation history and cannot be deleted.");
  await entry.deleteOne();
  return { message: "Warehouse or location deleted." };
});

const getDocuments = endpoint(async (req) => {
  const documents = await InventoryDocument.find().sort({ date: -1, createdAt: -1 }).lean();
  return {
    documents: documents.map(documentResponse).filter((document) => matchesInventoryFilters(document, req.query))
  };
});

const nextReference = async (type) => {
  const prefixes = { Receipt: "RCP", Delivery: "DLV", Internal: "INT", Adjustment: "ADJ" };
  const prefix = prefixes[type];
  const count = await InventoryDocument.countDocuments({ type });
  return `${prefix}-${String(count + 1).padStart(4, "0")}-${Date.now().toString().slice(-5)}`;
};

const createDocument = endpoint(async (req) => {
  const { type, productId, quantity, lines: requestLines, warehouse, sourceLocation, destinationLocation, partner, reason, countedQuantity } = req.body;
  if (!["Receipt", "Delivery", "Internal", "Adjustment"].includes(type)) throw fail(400, "Choose a valid operation type.");
  if (["Receipt", "Delivery"].includes(type)) requireManager(req.user);
  const inputLines = Array.isArray(requestLines) && requestLines.length
    ? requestLines
    : [{ productId, quantity: type === "Adjustment" ? countedQuantity : quantity }];
  const normalizedLines = [];
  const validatedLines = normalizeOperationLines(inputLines, type);
  for (const line of validatedLines) {
    if (!mongoose.isValidObjectId(line.productId)) throw fail(400, "Choose a valid product for every operation line.");
    const product = await Product.findById(line.productId);
    if (!product) throw fail(404, "A product in this operation was not found.");
    normalizedLines.push({ product: product._id, productName: product.name, sku: product.sku, category: product.category, quantity: line.quantity });
  }
  const firstLine = normalizedLines[0];
  if (type === "Internal" && (!sourceLocation || !destinationLocation || sourceLocation === destinationLocation)) {
    throw fail(400, "Choose different source and destination locations.");
  }
  if (["Receipt", "Delivery", "Adjustment"].includes(type) && !warehouse) throw fail(400, "Choose a warehouse or location.");
  const document = await InventoryDocument.create({
    reference: await nextReference(type),
    type,
    partner: partner || "",
    warehouse: warehouse || sourceLocation || "",
    sourceLocation: sourceLocation || "",
    destinationLocation: destinationLocation || "",
    product: firstLine.product,
    productName: firstLine.productName,
    sku: firstLine.sku,
    category: firstLine.category,
    quantity: type === "Adjustment" ? 0 : normalizedLines.reduce((sum, line) => sum + line.quantity, 0),
    countedQuantity: type === "Adjustment" ? firstLine.quantity : undefined,
    lines: normalizedLines,
    reason: reason || "",
    status: "Draft"
  });
  return { document: documentResponse(document) };
}, 201);

const getLocationQuantity = (product, location) => product.stockByLocation.find((row) => row.location === location)?.quantity || 0;

const setLocationQuantity = (product, location, quantity) => {
  let row = product.stockByLocation.find((entry) => entry.location === location);
  if (!row) {
    row = { location, quantity: 0 };
    product.stockByLocation.push(row);
  }
  row.quantity = quantity;
};

const applyDocument = async (document, session) => {
  const movements = [];
  for (const line of documentLines(document)) {
    const product = await Product.findById(line.productId).session(session);
    if (!product) throw fail(404, "A product in this operation no longer exists.");
    if (document.type === "Receipt") {
      const location = document.warehouse;
      setLocationQuantity(product, location, getLocationQuantity(product, location) + line.quantity);
      movements.push({ product, quantity: line.quantity, from: "Supplier", to: location });
    } else if (document.type === "Delivery") {
      const location = document.warehouse;
      const current = getLocationQuantity(product, location);
      if (current < line.quantity) throw fail(400, `Insufficient stock for ${product.name} at ${location}. Available: ${current}.`);
      setLocationQuantity(product, location, current - line.quantity);
      movements.push({ product, quantity: -line.quantity, from: location, to: document.partner || "Customer" });
    } else if (document.type === "Internal") {
      const current = getLocationQuantity(product, document.sourceLocation);
      if (current < line.quantity) throw fail(400, `Insufficient stock for ${product.name} at ${document.sourceLocation}. Available: ${current}.`);
      setLocationQuantity(product, document.sourceLocation, current - line.quantity);
      setLocationQuantity(product, document.destinationLocation, getLocationQuantity(product, document.destinationLocation) + line.quantity);
      movements.push({ product, quantity: -line.quantity, from: document.sourceLocation, to: document.destinationLocation });
      movements.push({ product, quantity: line.quantity, from: document.sourceLocation, to: document.destinationLocation });
    } else {
      const location = document.warehouse;
      const current = getLocationQuantity(product, location);
      const difference = line.quantity - current;
      setLocationQuantity(product, location, line.quantity);
      if (difference !== 0) movements.push({ product, quantity: difference, from: location, to: location });
    }
    await product.save({ session });
  }
  if (movements.length) {
    await StockMovement.insertMany(movements.map((movement) => ({
      reference: document.reference,
      ...movement,
      product: movement.product._id,
      productName: movement.product.name,
      sku: movement.product.sku,
      type: document.type,
      date: new Date()
    })), { session });
  }
};

const updateDocumentStatus = endpoint(async (req) => {
  const { status } = req.body;
  if (!["Draft", "Waiting", "Ready", "Done", "Canceled"].includes(status)) throw fail(400, "Choose a valid status.");
  const session = await mongoose.startSession();
  let savedDocument;
  try {
    await session.withTransaction(async () => {
      const document = await InventoryDocument.findById(req.params.id).session(session);
      if (!document) throw fail(404, "Operation not found.");
      if (["Done", "Canceled"].includes(document.status) && status !== document.status) {
        throw fail(400, "A completed or canceled operation cannot be changed.");
      }
      if (status === "Done" && !document.appliedAt) {
        await applyDocument(document, session);
        document.appliedAt = new Date();
      }
      document.status = status;
      await document.save({ session });
      savedDocument = document.toObject();
    });
  } finally {
    await session.endSession();
  }
  return { document: documentResponse(savedDocument) };
});

const getMoves = endpoint(async (req) => {
  const moves = await StockMovement.find().sort({ date: -1, createdAt: -1 }).lean();
  const { type, status, warehouse, category, search = "" } = req.query;
  const needle = String(search).trim().toLowerCase();
  const productIds = [...new Set(moves.map((move) => String(move.product)))];
  const references = [...new Set(moves.map((move) => move.reference))];
  const [products, documents] = await Promise.all([
    Product.find({ _id: { $in: productIds } }).select("category").lean(),
    InventoryDocument.find({ reference: { $in: references } }).select("reference type status").lean()
  ]);
  const categoryByProductId = new Map(products.map((product) => [String(product._id), product.category]));
  const documentByReference = new Map(documents.map((document) => [document.reference, document]));
  const results = [];
  for (const move of moves) {
    const productCategory = categoryByProductId.get(String(move.product)) || "";
    const document = documentByReference.get(move.reference);
    if (!matchesInventoryFilters({
      reference: move.reference,
      type: document?.type || move.type,
      status: document?.status || "Done",
      category: productCategory,
      product: move.productName,
      sku: move.sku,
      from: move.from,
      to: move.to
    }, req.query)) continue;
    results.push({
      id: `MV-${String(move._id).slice(-6).toUpperCase()}`,
      product: move.productName,
      sku: move.sku,
      qty: `${move.quantity > 0 ? "+" : ""}${move.quantity}`,
      from: move.from,
      to: move.to,
      ref: move.reference,
      category: productCategory,
      type: document?.type || move.type,
      status: document?.status || "Done",
      date: new Date(move.date).toISOString().slice(0, 16).replace("T", " ")
    });
  }
  return { moves: results };
});

const getDashboard = endpoint(async (req) => {
  const { type, status, warehouse, category, search = "" } = req.query;
  const [productDocs, documentDocs, allDocuments, moveDocs] = await Promise.all([
    Product.find().lean(),
    InventoryDocument.find().sort({ date: -1 }).limit(20).lean(),
    InventoryDocument.find().select("reference type status warehouse sourceLocation destinationLocation category lines").lean(),
    StockMovement.find({ date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).lean()
  ]);
  const products = productDocs.map(productResponse)
    .filter((product) => (!category || category === "all" || product.category === category)
      && (!search || `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(String(search).trim().toLowerCase())))
    .map((product) => warehouse && warehouse !== "all"
      ? { ...product, stock: product.stockByLocation.find((row) => row.location === warehouse)?.quantity || 0 }
      : product);
  const documents = documentDocs.map(documentResponse).filter((document) => matchesInventoryFilters(document, req.query));
  const matchingDocuments = allDocuments.filter((document) => matchesInventoryFilters(document, req.query));
  const moveReferences = await InventoryDocument.find({ reference: { $in: moveDocs.map((move) => move.reference) } }).select("reference type status").lean();
  const moveByReference = new Map(moveReferences.map((document) => [document.reference, document]));
  const filteredMoves = moveDocs.filter((move) => {
    const document = moveByReference.get(move.reference);
    const productCategory = productDocs.find((product) => String(product._id) === String(move.product))?.category || "";
    return matchesInventoryFilters({
      reference: move.reference,
      type: document?.type || move.type,
      status: document?.status || "Done",
      category: productCategory,
      product: move.productName,
      sku: move.sku,
      from: move.from,
      to: move.to
    }, req.query);
  });
  const attentionProducts = products.filter((product) => product.stock <= product.reorderPoint)
    .sort((a, b) => (a.reorderPoint ? a.stock / a.reorderPoint : 0) - (b.reorderPoint ? b.stock / b.reorderPoint : 0));
  const kpis = [
    { label: "Total Products in Stock", value: products.reduce((total, product) => total + product.stock, 0).toLocaleString(), tone: "default" },
    { label: "Low Stock Items", value: products.filter((product) => product.stock > 0 && product.stock <= product.reorderPoint).length, tone: "warning" },
    { label: "Out of Stock", value: products.filter((product) => product.stock === 0).length, tone: "danger" },
    { label: "Pending Receipts", value: matchingDocuments.filter((document) => document.type === "Receipt" && ["Draft", "Waiting", "Ready"].includes(document.status)).length, tone: "default" },
    { label: "Pending Deliveries", value: matchingDocuments.filter((document) => document.type === "Delivery" && ["Draft", "Waiting", "Ready"].includes(document.status)).length, tone: "default" },
    { label: "Transfers Scheduled", value: matchingDocuments.filter((document) => document.type === "Internal" && ["Draft", "Waiting", "Ready"].includes(document.status)).length, tone: "default" }
  ];
  const activity = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const dayMoves = filteredMoves.filter((move) => new Date(move.date).toDateString() === day.toDateString());
    return {
      day: new Intl.DateTimeFormat("en", { weekday: "short" }).format(day),
      incoming: dayMoves.filter((move) => move.quantity > 0).reduce((sum, move) => sum + move.quantity, 0),
      outgoing: Math.abs(dayMoves.filter((move) => move.quantity < 0).reduce((sum, move) => sum + move.quantity, 0))
    };
  });
  return { kpis, documents, products, attentionProducts, activity };
});

module.exports = {
  getFilters,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  createProduct,
  updateProduct,
  getReorderRules,
  saveReorderRule,
  deleteReorderRule,
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getDocuments,
  createDocument,
  updateDocumentStatus,
  getMoves,
  getDashboard
};
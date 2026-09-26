const mongoose = require("mongoose");
const {
  Category,
  Warehouse,
  Product,
  InventoryDocument,
  StockMovement
} = require("../models/Inventory");

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

const documentResponse = (document) => ({
  id: document.reference,
  _id: String(document._id),
  type: document.type,
  partner: document.partner || document.reason || "",
  warehouse: document.warehouse || document.sourceLocation || "",
  sourceLocation: document.sourceLocation,
  destinationLocation: document.destinationLocation,
  product: document.productName,
  productId: String(document.product),
  sku: document.sku,
  category: document.category,
  quantity: document.quantity,
  countedQuantity: document.countedQuantity,
  reason: document.reason,
  status: document.status,
  date: new Date(document.date).toISOString().slice(0, 10)
});

const getFilters = endpoint(async () => {
  const [categories, warehouses] = await Promise.all([
    Category.find().sort({ name: 1 }).select("name -_id").lean(),
    Warehouse.find().sort({ name: 1 }).select("name -_id").lean()
  ]);
  return { categories: categories.map((row) => row.name), warehouses: warehouses.map((row) => row.name) };
});

const getCategories = endpoint(async () => ({
  categories: (await Category.find().sort({ name: 1 }).select("name -_id").lean()).map((row) => row.name)
}));

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

const getWarehouses = endpoint(async () => ({ warehouses: await Warehouse.find().sort({ name: 1 }).lean() }));

const createWarehouse = endpoint(async (req) => {
  requireManager(req.user);
  const { name, code } = req.body;
  if (!name || !code) throw fail(400, "Warehouse name and code are required.");
  const warehouse = await Warehouse.create({ name, code });
  return { warehouse };
}, 201);

const getDocuments = endpoint(async (req) => {
  const documents = await InventoryDocument.find().sort({ date: -1, createdAt: -1 }).lean();
  const { type, status, warehouse, category, search = "" } = req.query;
  const needle = String(search).trim().toLowerCase();
  return {
    documents: documents.map(documentResponse).filter((document) => {
      if (type && type !== "all" && document.type !== type) return false;
      if (status && status !== "all" && document.status !== status) return false;
      if (warehouse && warehouse !== "all" && ![document.warehouse, document.sourceLocation, document.destinationLocation].includes(warehouse)) return false;
      if (category && category !== "all" && document.category !== category) return false;
      return !needle || `${document.id} ${document.partner} ${document.warehouse} ${document.product} ${document.sku}`.toLowerCase().includes(needle);
    })
  };
});

const nextReference = async (type) => {
  const prefixes = { Receipt: "RCP", Delivery: "DLV", Internal: "INT", Adjustment: "ADJ" };
  const prefix = prefixes[type];
  const count = await InventoryDocument.countDocuments({ type });
  return `${prefix}-${String(count + 1).padStart(4, "0")}-${Date.now().toString().slice(-5)}`;
};

const createDocument = endpoint(async (req) => {
  const { type, productId, quantity, warehouse, sourceLocation, destinationLocation, partner, reason, countedQuantity } = req.body;
  if (!["Receipt", "Delivery", "Internal", "Adjustment"].includes(type)) throw fail(400, "Choose a valid operation type.");
  if (["Receipt", "Delivery"].includes(type)) requireManager(req.user);
  if (!productId || !mongoose.isValidObjectId(productId)) throw fail(400, "Choose a valid product.");
  const product = await Product.findById(productId);
  if (!product) throw fail(404, "Product not found.");
  if (type === "Internal" && (!sourceLocation || !destinationLocation || sourceLocation === destinationLocation)) {
    throw fail(400, "Choose different source and destination locations.");
  }
  if (["Receipt", "Delivery", "Adjustment"].includes(type) && !warehouse) throw fail(400, "Choose a warehouse or location.");
  const numericQuantity = Number(quantity);
  const numericCount = Number(countedQuantity);
  if (type === "Adjustment" ? !Number.isFinite(numericCount) || numericCount < 0 : !Number.isFinite(numericQuantity) || numericQuantity <= 0) {
    throw fail(400, type === "Adjustment" ? "Enter a valid counted quantity." : "Enter a quantity greater than zero.");
  }
  const document = await InventoryDocument.create({
    reference: await nextReference(type),
    type,
    partner: partner || "",
    warehouse: warehouse || sourceLocation || "",
    sourceLocation: sourceLocation || "",
    destinationLocation: destinationLocation || "",
    product: product._id,
    productName: product.name,
    sku: product.sku,
    category: product.category,
    quantity: type === "Adjustment" ? 0 : numericQuantity,
    countedQuantity: type === "Adjustment" ? numericCount : undefined,
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
  const product = await Product.findById(document.product).session(session);
  if (!product) throw fail(404, "The product for this operation no longer exists.");
  const movements = [];
  if (document.type === "Receipt") {
    const location = document.warehouse;
    setLocationQuantity(product, location, getLocationQuantity(product, location) + document.quantity);
    movements.push({ quantity: document.quantity, from: "Supplier", to: location });
  } else if (document.type === "Delivery") {
    const location = document.warehouse;
    const current = getLocationQuantity(product, location);
    if (current < document.quantity) throw fail(400, `Insufficient stock at ${location}. Available: ${current}.`);
    setLocationQuantity(product, location, current - document.quantity);
    movements.push({ quantity: -document.quantity, from: location, to: document.partner || "Customer" });
  } else if (document.type === "Internal") {
    const current = getLocationQuantity(product, document.sourceLocation);
    if (current < document.quantity) throw fail(400, `Insufficient stock at ${document.sourceLocation}. Available: ${current}.`);
    setLocationQuantity(product, document.sourceLocation, current - document.quantity);
    setLocationQuantity(product, document.destinationLocation, getLocationQuantity(product, document.destinationLocation) + document.quantity);
    movements.push({ quantity: -document.quantity, from: document.sourceLocation, to: document.destinationLocation });
    movements.push({ quantity: document.quantity, from: document.sourceLocation, to: document.destinationLocation });
  } else {
    const location = document.warehouse;
    const current = getLocationQuantity(product, location);
    const difference = document.countedQuantity - current;
    setLocationQuantity(product, location, document.countedQuantity);
    if (difference !== 0) movements.push({ quantity: difference, from: location, to: location });
  }
  await product.save({ session });
  if (movements.length) {
    await StockMovement.insertMany(movements.map((movement) => ({
      reference: document.reference,
      product: product._id,
      productName: product.name,
      sku: product.sku,
      type: document.type,
      date: new Date(),
      ...movement
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
  const { warehouse, category, search = "" } = req.query;
  const needle = String(search).trim().toLowerCase();
  const productIds = [...new Set(moves.map((move) => String(move.product)))];
  const products = await Product.find({ _id: { $in: productIds } }).select("category").lean();
  const categoryByProductId = new Map(products.map((product) => [String(product._id), product.category]));
  const results = [];
  for (const move of moves) {
    const productCategory = categoryByProductId.get(String(move.product)) || "";
    if (category && category !== "all" && productCategory !== category) continue;
    if (warehouse && warehouse !== "all" && ![move.from, move.to].includes(warehouse)) continue;
    if (needle && !`${move.reference} ${move.productName} ${move.sku} ${move.from} ${move.to}`.toLowerCase().includes(needle)) continue;
    results.push({
      id: `MV-${String(move._id).slice(-6).toUpperCase()}`,
      product: move.productName,
      sku: move.sku,
      qty: `${move.quantity > 0 ? "+" : ""}${move.quantity}`,
      from: move.from,
      to: move.to,
      ref: move.reference,
      category: productCategory,
      type: move.type,
      date: new Date(move.date).toISOString().slice(0, 16).replace("T", " ")
    });
  }
  return { moves: results };
});

const getDashboard = endpoint(async () => {
  const [productDocs, documentDocs, allDocuments, moveDocs] = await Promise.all([
    Product.find().lean(),
    InventoryDocument.find().sort({ date: -1 }).limit(20).lean(),
    InventoryDocument.find().select("type status").lean(),
    StockMovement.find({ date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }).lean()
  ]);
  const products = productDocs.map(productResponse);
  const documents = documentDocs.map(documentResponse);
  const attentionProducts = products.filter((product) => product.stock <= product.reorderPoint)
    .sort((a, b) => (a.reorderPoint ? a.stock / a.reorderPoint : 0) - (b.reorderPoint ? b.stock / b.reorderPoint : 0));
  const kpis = [
    { label: "Total Products in Stock", value: products.reduce((total, product) => total + product.stock, 0).toLocaleString(), tone: "default" },
    { label: "Low Stock Items", value: products.filter((product) => product.stock > 0 && product.stock <= product.reorderPoint).length, tone: "warning" },
    { label: "Out of Stock", value: products.filter((product) => product.stock === 0).length, tone: "danger" },
    { label: "Pending Receipts", value: allDocuments.filter((document) => document.type === "Receipt" && ["Draft", "Waiting", "Ready"].includes(document.status)).length, tone: "default" },
    { label: "Pending Deliveries", value: allDocuments.filter((document) => document.type === "Delivery" && ["Draft", "Waiting", "Ready"].includes(document.status)).length, tone: "default" },
    { label: "Transfers Scheduled", value: allDocuments.filter((document) => document.type === "Internal" && ["Draft", "Waiting", "Ready"].includes(document.status)).length, tone: "default" }
  ];
  const activity = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const dayMoves = moveDocs.filter((move) => new Date(move.date).toDateString() === day.toDateString());
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
  getProducts,
  createProduct,
  updateProduct,
  getWarehouses,
  createWarehouse,
  getDocuments,
  createDocument,
  updateDocumentStatus,
  getMoves,
  getDashboard
};
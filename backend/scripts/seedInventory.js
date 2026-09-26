const dotenv = require("dotenv");
const mongoose = require("mongoose");
const {
  Category,
  Warehouse,
  Product,
  ReorderRule,
  InventoryDocument,
  StockMovement
} = require("../models/Inventory");

dotenv.config();

const categories = ["Raw Materials", "Fasteners", "Finished Goods", "Packaging"];
const warehouses = [
  { name: "Main Warehouse", code: "MAIN", kind: "warehouse", parentWarehouse: "" },
  { name: "Production Floor", code: "PROD", kind: "warehouse", parentWarehouse: "" },
  { name: "Warehouse 2", code: "WH2", kind: "warehouse", parentWarehouse: "" },
  { name: "Rack A", code: "RACKA", kind: "location", parentWarehouse: "Main Warehouse" },
  { name: "Rack B", code: "RACKB", kind: "location", parentWarehouse: "Main Warehouse" }
];
const products = [
  { sku: "STL-ROD-08", name: "Steel Rods 8mm", category: "Raw Materials", uom: "kg", reorderPoint: 100, stockByLocation: [{ location: "Main Warehouse", quantity: 350 }, { location: "Production Floor", quantity: 20 }, { location: "Warehouse 2", quantity: 50 }] },
  { sku: "CHR-OAK-14", name: "Oak Chair Frame", category: "Finished Goods", uom: "pcs", reorderPoint: 40, stockByLocation: [{ location: "Main Warehouse", quantity: 32 }] },
  { sku: "BLT-M6-20", name: "M6 Bolt 20mm", category: "Fasteners", uom: "pcs", reorderPoint: 500, stockByLocation: [{ location: "Rack A", quantity: 0 }] },
  { sku: "BOX-CRD-L", name: "Cardboard Box - Large", category: "Packaging", uom: "pcs", reorderPoint: 150, stockByLocation: [{ location: "Main Warehouse", quantity: 210 }] },
  { sku: "STL-SHT-02", name: "Steel Sheet 2mm", category: "Raw Materials", uom: "kg", reorderPoint: 100, stockByLocation: [{ location: "Main Warehouse", quantity: 88 }] }
];
const reorderRules = [
  { sku: "STL-ROD-08", location: "Main Warehouse", reorderAt: 100, targetStock: 200 },
  { sku: "CHR-OAK-14", location: "Main Warehouse", reorderAt: 40, targetStock: 80 },
  { sku: "BLT-M6-20", location: "Rack A", reorderAt: 500, targetStock: 1000 },
  { sku: "BOX-CRD-L", location: "Main Warehouse", reorderAt: 150, targetStock: 300 },
  { sku: "STL-SHT-02", location: "Main Warehouse", reorderAt: 100, targetStock: 200 }
];

const documents = [
  { reference: "RCP-0231", type: "Receipt", partner: "Bansal Steel Co.", warehouse: "Main Warehouse", sku: "STL-ROD-08", quantity: 50, status: "Waiting", date: "2026-09-24" },
  { reference: "DLV-0417", type: "Delivery", partner: "Urban Furniture Ltd.", warehouse: "Main Warehouse", sku: "CHR-OAK-14", quantity: 10, status: "Ready", date: "2026-09-25" },
  { reference: "INT-0093", type: "Internal", partner: "Main Warehouse → Production Floor", warehouse: "Main Warehouse", sourceLocation: "Main Warehouse", destinationLocation: "Production Floor", sku: "STL-ROD-08", quantity: 20, status: "Done", date: "2026-09-25", appliedAt: "2026-09-25" },
  { reference: "ADJ-0022", type: "Adjustment", partner: "Cycle Count #14", warehouse: "Rack A", sku: "BLT-M6-20", quantity: 0, countedQuantity: 91, reason: "Cycle count", status: "Draft", date: "2026-09-26" },
  { reference: "RCP-0230", type: "Receipt", partner: "Bansal Steel Co.", warehouse: "Warehouse 2", sku: "STL-ROD-08", quantity: 50, status: "Done", date: "2026-09-22", appliedAt: "2026-09-22" },
  { reference: "DLV-0416", type: "Delivery", partner: "Craft Interiors", warehouse: "Main Warehouse", sku: "CHR-OAK-14", quantity: 10, status: "Canceled", date: "2026-09-21" },
  { reference: "DLV-0415", type: "Delivery", partner: "Urban Furniture Ltd.", warehouse: "Main Warehouse", sku: "CHR-OAK-14", quantity: 10, status: "Done", date: "2026-09-20", appliedAt: "2026-09-20" },
  { reference: "ADJ-0021", type: "Adjustment", partner: "Damaged stock count", warehouse: "Rack A", sku: "BLT-M6-20", quantity: 0, countedQuantity: 0, reason: "Damaged", status: "Done", date: "2026-09-19", appliedAt: "2026-09-19" }
];

const movements = [
  { reference: "RCP-0230", sku: "STL-ROD-08", quantity: 50, from: "Supplier", to: "Warehouse 2", type: "Receipt", date: "2026-09-22" },
  { reference: "INT-0093", sku: "STL-ROD-08", quantity: -20, from: "Main Warehouse", to: "Production Floor", type: "Internal", date: "2026-09-25" },
  { reference: "INT-0093", sku: "STL-ROD-08", quantity: 20, from: "Main Warehouse", to: "Production Floor", type: "Internal", date: "2026-09-25" },
  { reference: "DLV-0415", sku: "CHR-OAK-14", quantity: -10, from: "Main Warehouse", to: "Urban Furniture Ltd.", type: "Delivery", date: "2026-09-20" },
  { reference: "ADJ-0021", sku: "BLT-M6-20", quantity: -3, from: "Rack A", to: "Damaged", type: "Adjustment", date: "2026-09-19" }
];

async function seedInventory() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const name of categories) {
    await Category.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }
  for (const warehouse of warehouses) {
    const { code, ...details } = warehouse;
    await Warehouse.updateOne({ code }, { $set: details, $setOnInsert: { code } }, { upsert: true });
  }

  const productsBySku = new Map();
  for (const product of products) {
    const savedProduct = await Product.findOneAndUpdate(
      { sku: product.sku },
      { $setOnInsert: product },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    productsBySku.set(product.sku, savedProduct);
  }

  for (const rule of reorderRules) {
    const product = productsBySku.get(rule.sku);
    await ReorderRule.updateOne(
      { product: product._id, location: rule.location },
      { $setOnInsert: { product: product._id, location: rule.location, reorderAt: rule.reorderAt, targetStock: rule.targetStock } },
      { upsert: true }
    );
  }

  for (const document of documents) {
    const product = productsBySku.get(document.sku);
    const { sku, ...values } = document;
    await InventoryDocument.updateOne(
      { reference: document.reference },
      {
        $setOnInsert: {
          ...values,
          product: product._id,
          productName: product.name,
          sku,
          category: product.category,
          date: new Date(document.date),
          appliedAt: document.appliedAt ? new Date(document.appliedAt) : null
        }
      },
      { upsert: true }
    );
  }

  for (const movement of movements) {
    const product = productsBySku.get(movement.sku);
    await StockMovement.updateOne(
      { reference: movement.reference, sku: movement.sku, quantity: movement.quantity, type: movement.type },
      {
        $setOnInsert: {
          ...movement,
          product: product._id,
          productName: product.name,
          date: new Date(movement.date)
        }
      },
      { upsert: true }
    );
  }

  const summary = await Promise.all([
    Category.countDocuments(),
    Warehouse.countDocuments(),
    Product.countDocuments(),
    InventoryDocument.countDocuments(),
    StockMovement.countDocuments()
  ]);
  console.log(JSON.stringify({ categories: summary[0], warehouses: summary[1], products: summary[2], documents: summary[3], movements: summary[4] }));
  await mongoose.disconnect();
}

seedInventory().catch(async (error) => {
  console.error("Inventory seed failed:", error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
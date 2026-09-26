const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    kind: { type: String, enum: ["warehouse", "location"], default: "warehouse" },
    parentWarehouse: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    uom: { type: String, required: true, trim: true },
    reorderPoint: { type: Number, default: 0, min: 0 },
    stockByLocation: [{
      location: { type: String, required: true, trim: true },
      quantity: { type: Number, default: 0, min: 0 }
    }]
  },
  { timestamps: true }
);

const reorderRuleSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    location: { type: String, required: true, trim: true },
    reorderAt: { type: Number, required: true, min: 0 },
    targetStock: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);
reorderRuleSchema.index({ product: 1, location: 1 }, { unique: true });

const operationLineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const inventoryDocumentSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ["Receipt", "Delivery", "Internal", "Adjustment"] },
    partner: { type: String, default: "", trim: true },
    warehouse: { type: String, default: "", trim: true },
    sourceLocation: { type: String, default: "", trim: true },
    destinationLocation: { type: String, default: "", trim: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    lines: { type: [operationLineSchema], default: [] },
    countedQuantity: { type: Number, min: 0 },
    reason: { type: String, default: "", trim: true },
    status: { type: String, enum: ["Draft", "Waiting", "Ready", "Done", "Canceled"], default: "Draft" },
    date: { type: Date, default: Date.now },
    appliedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const stockMovementSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true },
    from: { type: String, default: "" },
    to: { type: String, default: "" },
    type: { type: String, required: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = {
  Category: mongoose.models.Category || mongoose.model("Category", categorySchema),
  Warehouse: mongoose.models.Warehouse || mongoose.model("Warehouse", warehouseSchema),
  Product: mongoose.models.Product || mongoose.model("Product", productSchema),
  ReorderRule: mongoose.models.ReorderRule || mongoose.model("ReorderRule", reorderRuleSchema),
  InventoryDocument: mongoose.models.InventoryDocument || mongoose.model("InventoryDocument", inventoryDocumentSchema),
  StockMovement: mongoose.models.StockMovement || mongoose.model("StockMovement", stockMovementSchema)
};
const express = require("express");
const protect = require("../middleware/authMiddleware");
const inventory = require("../controllers/inventoryController");

const router = express.Router();

router.use(protect);
router.get("/filters", inventory.getFilters);
router.get("/categories", inventory.getCategories);
router.post("/categories", inventory.createCategory);
router.put("/categories/:id", inventory.updateCategory);
router.delete("/categories/:id", inventory.deleteCategory);
router.get("/products", inventory.getProducts);
router.post("/products", inventory.createProduct);
router.put("/products/:id", inventory.updateProduct);
router.get("/reorder-rules", inventory.getReorderRules);
router.post("/reorder-rules", inventory.saveReorderRule);
router.delete("/reorder-rules/:id", inventory.deleteReorderRule);
router.get("/warehouses", inventory.getWarehouses);
router.post("/warehouses", inventory.createWarehouse);
router.put("/warehouses/:id", inventory.updateWarehouse);
router.delete("/warehouses/:id", inventory.deleteWarehouse);
router.get("/documents", inventory.getDocuments);
router.post("/documents", inventory.createDocument);
router.patch("/documents/:id/status", inventory.updateDocumentStatus);
router.get("/moves", inventory.getMoves);
router.get("/dashboard", inventory.getDashboard);

module.exports = router;
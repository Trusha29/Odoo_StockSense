const invalidInput = (message) => Object.assign(new Error(message), { status: 400 });

const normalizeOperationLines = (lines, type) => {
  if (!Array.isArray(lines) || lines.length === 0) throw invalidInput("An operation must contain at least one product line.");
  const seenProducts = new Set();
  return lines.map((line) => {
    if (!line.productId) throw invalidInput("Choose a product for every operation line.");
    const productId = String(line.productId);
    if (seenProducts.has(productId)) throw invalidInput("Each product can only appear once per operation.");
    seenProducts.add(productId);
    const quantity = Number(line.quantity);
    if (!Number.isFinite(quantity) || (type === "Adjustment" ? quantity < 0 : quantity <= 0)) {
      throw invalidInput(type === "Adjustment" ? "Enter a valid counted quantity for every product." : "Enter a quantity greater than zero for every product.");
    }
    return { ...line, productId, quantity };
  });
};

const calculateSuggestedOrder = (onHand, reorderAt, targetStock) => (
  onHand <= reorderAt ? Math.max(0, targetStock - onHand) : 0
);

const matchesInventoryFilters = (record, filters = {}) => {
  if (filters.type && filters.type !== "all" && record.type !== filters.type) return false;
  if (filters.status && filters.status !== "all" && record.status !== filters.status) return false;
  if (filters.warehouse && filters.warehouse !== "all" && ![
    record.warehouse,
    record.sourceLocation,
    record.destinationLocation,
    record.from,
    record.to
  ].includes(filters.warehouse)) return false;
  const lines = record.lines?.length ? record.lines : [{ category: record.category, product: record.product, sku: record.sku }];
  if (filters.category && filters.category !== "all" && !lines.some((line) => line.category === filters.category)) return false;
  const search = String(filters.search || "").trim().toLowerCase();
  const lineText = lines.map((line) => `${line.product || ""} ${line.sku || ""}`).join(" ");
  const recordText = `${record.id || record.reference || ""} ${record.partner || ""} ${record.product || ""} ${record.sku || ""} ${lineText}`.toLowerCase();
  return !search || recordText.includes(search);
};

module.exports = { normalizeOperationLines, calculateSuggestedOrder, matchesInventoryFilters };
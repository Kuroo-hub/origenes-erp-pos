import assert from "node:assert/strict";
import test from "node:test";

process.env.DB_HOST ||= "localhost";
process.env.DB_PORT ||= "5432";
process.env.DB_NAME ||= "origenes_test";
process.env.DB_USER ||= "postgres";
process.env.DB_PASSWORD ||= "dummy";
process.env.JWT_SECRET ||= "test-secret-with-at-least-32-characters";
process.env.JWT_EXPIRES_IN ||= "15m";

const {
    normalizePurchasePayload,
    validatePurchaseDetails,
    calculatePurchaseTotals,
    validateDueDate,
    validateQuantity
} = await import("../src/modules/purchases/core/purchasesService.js");

test("normalizePurchasePayload acepta snake_case y camelCase", () => {
    const payload = normalizePurchasePayload({
        supplier_id: 3,
        branchId: 2,
        invoice_number: "FAC-010",
        dueDate: "2026-12-01",
        status: "pending",
        details: []
    });

    assert.equal(payload.supplierId, 3);
    assert.equal(payload.branchId, 2);
    assert.equal(payload.invoiceNumber, "FAC-010");
    assert.equal(payload.dueDate, "2026-12-01");
    assert.equal(payload.status, "pending");
});

test("calculatePurchaseTotals calcula IVA y total en centavos", () => {
    const details = validatePurchaseDetails([
        {
            ingredient_id: 1,
            quantity: "10000",
            unit_cost: "0.0060"
        }
    ]);

    const totals = calculatePurchaseTotals(details);

    assert.equal(totals.subtotalCents, 6000n);
    assert.equal(totals.vatCents, 780n);
    assert.equal(totals.totalCents, 6780n);
    assert.equal(totals.subtotal, "60.00");
    assert.equal(totals.vat, "7.80");
    assert.equal(totals.total, "67.80");
    assert.equal(totals.lines[0].subtotal, "60.00");
});

test("validateQuantity rechaza más de 3 decimales", () => {
    assert.throws(
        () => validateQuantity("1.0001"),
        /cantidad debe ser mayor a cero con hasta 3 decimales/
    );
});

test("validateDueDate rechaza fechas inexistentes", () => {
    assert.equal(validateDueDate("2026-12-31"), "2026-12-31");
    assert.throws(() => validateDueDate("2026-02-30"), /fecha de vencimiento no es válida/);
});

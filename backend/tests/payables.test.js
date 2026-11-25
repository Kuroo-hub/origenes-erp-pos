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
    normalizePaymentPayload,
    validatePaymentAmount,
    validatePaymentMethod,
    validatePaymentReference,
    toCents,
    formatCents
} = await import("../src/modules/purchases/payables/payablesService.js");

test("normalizePaymentPayload acepta payment_method y paymentMethod", () => {
    assert.deepEqual(
        normalizePaymentPayload({ payment_method: "cash", reference: "TRX-1" }),
        { amount: undefined, paymentMethod: "cash", reference: "TRX-1" }
    );

    assert.equal(normalizePaymentPayload({ paymentMethod: "CHECK" }).paymentMethod, "CHECK");
});

test("validatePaymentAmount valida formato y monto positivo", () => {
    assert.equal(validatePaymentAmount("100.50"), "100.50");
    assert.throws(() => validatePaymentAmount("0"), /mayor a cero/);
    assert.throws(() => validatePaymentAmount("1.001"), /hasta 2 decimales/);
});

test("validatePaymentMethod solo acepta CASH, TRANSFER y CHECK", () => {
    assert.equal(validatePaymentMethod(" transfer "), "TRANSFER");
    assert.throws(() => validatePaymentMethod("CARD"), /CASH, TRANSFER o CHECK/);
});

test("validatePaymentReference normaliza referencias vacías", () => {
    assert.equal(validatePaymentReference("  TRX-1  "), "TRX-1");
    assert.equal(validatePaymentReference(""), null);
    assert.throws(() => validatePaymentReference("a".repeat(151)), /150 caracteres/);
});

test("toCents y formatCents conservan montos de 2 decimales", () => {
    assert.equal(toCents("226.05"), 22605n);
    assert.equal(formatCents(22605n), "226.05");
    assert.equal(formatCents(0n), "0.00");
});

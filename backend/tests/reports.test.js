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
    parseBranchFilter,
    mapBranches,
    mapTopProducts,
    mapPayables
} = await import("../src/modules/sales/reports/reportsService.js");

test("parseBranchFilter acepta ausente, ALL y numéricos positivos", () => {
    assert.equal(parseBranchFilter(undefined), null);
    assert.equal(parseBranchFilter(null), null);
    assert.equal(parseBranchFilter("ALL"), null);
    assert.equal(parseBranchFilter("2"), 2);
    assert.equal(parseBranchFilter(3), 3);
});

test("parseBranchFilter rechaza valores inválidos", () => {
    assert.throws(() => parseBranchFilter("0"), /ID de sucursal no válido/);
    assert.throws(() => parseBranchFilter("-1"), /ID de sucursal no válido/);
    assert.throws(() => parseBranchFilter("abc"), /ID de sucursal no válido/);
    assert.throws(() => parseBranchFilter({}), /ID de sucursal no válido/);
});

test("mapBranches convierte agregados a números", () => {
    const [branch] = mapBranches([{
        branch_id: 1,
        name: "Centro",
        address: "San Salvador",
        monthly_revenue: "14850.50",
        monthly_expenses: "4920.00",
        orders_count: "642",
        active_staff: "12",
        low_stock_alerts: "4",
        cash_open: true
    }]);

    assert.equal(branch.monthly_revenue, 14850.5);
    assert.equal(branch.monthly_expenses, 4920);
    assert.equal(branch.orders_count, 642);
    assert.equal(branch.active_staff, 12);
    assert.equal(branch.low_stock_alerts, 4);
    assert.equal(branch.cash_open, true);
});

test("mapTopProducts y mapPayables conservan la forma del dashboard", () => {
    const [product] = mapTopProducts([{
        product_id: 5,
        name: "Horchata",
        category: "RESELL",
        units_sold: "415",
        revenue: "933.75"
    }]);
    const [payable] = mapPayables([{
        payable_id: 2,
        branch_id: 1,
        branch_name: "Centro",
        supplier_name: "Proveedor",
        invoice_number: "FAC-002",
        due_date: "2026-11-30",
        total: "226.00",
        outstanding_amount: "226.00",
        status: "PENDING"
    }]);

    assert.deepEqual(product, {
        product_id: 5,
        name: "Horchata",
        category: "RESELL",
        units_sold: 415,
        revenue: 933.75
    });
    assert.equal(payable.total, 226);
    assert.equal(payable.outstanding_amount, 226);
    assert.equal(payable.due_date, "2026-11-30");
});

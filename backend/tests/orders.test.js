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
    parseDeliveryBranchFilter,
    parseOrderId,
    validateDeliveryStatus,
    validateDeliveryTransition,
    derivePaymentStatus,
    mapDeliveryOrder,
    mapDeliveryStatusUpdate
} = await import("../src/modules/sales/orders/ordersService.js");

test("parseOrderId acepta ORD-<n> y <n>", () => {
    assert.equal(parseOrderId("ORD-3048"), 3048);
    assert.equal(parseOrderId(" 3049 "), 3049);
    assert.equal(parseOrderId(3050), 3050);
});

test("parseOrderId rechaza formatos inválidos", () => {
    assert.throws(() => parseOrderId("ORD-"), /ID de orden no válido/);
    assert.throws(() => parseOrderId("ABC-1"), /ID de orden no válido/);
    assert.throws(() => parseOrderId("0"), /ID de orden no válido/);
});

test("parseDeliveryBranchFilter usa ALL como todas las sucursales", () => {
    assert.equal(parseDeliveryBranchFilter(undefined), null);
    assert.equal(parseDeliveryBranchFilter("ALL"), null);
    assert.equal(parseDeliveryBranchFilter(2), 2);
    assert.throws(() => parseDeliveryBranchFilter("x"), /ID de sucursal no válido/);
});

test("validateDeliveryStatus solo acepta los tres estados", () => {
    assert.equal(validateDeliveryStatus("READY"), "READY");
    assert.equal(validateDeliveryStatus("IN_TRANSIT"), "IN_TRANSIT");
    assert.equal(validateDeliveryStatus("DELIVERED"), "DELIVERED");
    assert.throws(
        () => validateDeliveryStatus("CANCELLED"),
        /Estado de entrega no válido/
    );
});

test("validateDeliveryTransition permite solo avanzar un paso", () => {
    assert.equal(validateDeliveryTransition("READY", "IN_TRANSIT"), "IN_TRANSIT");
    assert.equal(validateDeliveryTransition("IN_TRANSIT", "DELIVERED"), "DELIVERED");

    assert.throws(
        () => validateDeliveryTransition("READY", "READY"),
        (error) => error.statusCode === 409
    );
    assert.throws(
        () => validateDeliveryTransition("DELIVERED", "READY"),
        (error) => error.statusCode === 409
    );
    assert.throws(
        () => validateDeliveryTransition("READY", "DELIVERED"),
        (error) => error.statusCode === 409
    );
});

test("derivePaymentStatus prioriza entrega y luego método de pago", () => {
    assert.equal(derivePaymentStatus("DELIVERED", "CASH"), "COLLECTED");
    assert.equal(derivePaymentStatus("READY", "CASH"), "PENDING_COLLECTION");
    assert.equal(derivePaymentStatus("IN_TRANSIT", "CARD"), "PAID_ONLINE");
});

test("mapDeliveryOrder produce la forma de DeliveryMocks", () => {
    const order = mapDeliveryOrder({
        order_id: "ORD-1",
        invoice_id: 1,
        branch_id: 1,
        customer_name: "Cliente mostrador",
        customer_phone: "7845-1290",
        origen: "Por llamada",
        delivery_address: "Calle Principal",
        address_reference: "Portón negro",
        items: [{ name: "Pollo a la plancha", quantity: 1, price: 7.5 }],
        total_amount: "11.02",
        payment_method: "CASH",
        delivery_status: "READY",
        created_at: "19:40"
    });

    assert.deepEqual(order, {
        order_id: "ORD-1",
        invoice_id: 1,
        branch_id: 1,
        customer_name: "Cliente mostrador",
        customer_phone: "7845-1290",
        origen: "Por llamada",
        delivery_address: "Calle Principal",
        address_reference: "Portón negro",
        items: [{ name: "Pollo a la plancha", quantity: 1, price: 7.5 }],
        total_amount: 11.02,
        payment_method: "CASH",
        payment_status: "PENDING_COLLECTION",
        delivery_status: "READY",
        created_at: "19:40",
        fromCashier: false
    });
});

test("mapDeliveryStatusUpdate deriva payment_status", () => {
    assert.deepEqual(
        mapDeliveryStatusUpdate({
            invoice_id: 7,
            branch_id: 2,
            delivery_status: "IN_TRANSIT",
            payment_method: "CARD"
        }),
        {
            order_id: "ORD-7",
            invoice_id: 7,
            branch_id: 2,
            delivery_status: "IN_TRANSIT",
            payment_status: "PAID_ONLINE"
        }
    );
});

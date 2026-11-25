-- =====================================================
-- PRODUCT CATALOG
-- 15 PREPARED PRODUCTS
-- =====================================================

INSERT INTO product (name, description, product_type, price)
VALUES
('Pollo a la plancha', 'Grilled chicken with rice and vegetables', 'PREPARED', 7.50),
('Hamburguesa clasica', 'Classic hamburger', 'PREPARED', 5.50),
('Carne asada con papas', 'Grilled beef with potatoes', 'PREPARED', 8.50),
('Tacos de carne', 'Beef tacos', 'PREPARED', 4.50),
('Camaron al ajillo', 'Garlic shrimp', 'PREPARED', 9.50),
('Desayuno tipico salvadoreño', 'Traditional Salvadoran breakfast', 'PREPARED', 6.00),
('Omelette', 'Ham and cheese omelette', 'PREPARED', 4.75),
('Lomo de cerdo', 'Pork loin with potatoes', 'PREPARED', 8.00),

-- DRINKS

('Limonada', 'Fresh lemonade', 'PREPARED', 2.00),
('Jugo naranja', 'Fresh orange juice', 'PREPARED', 2.25),
('Horchata salvadoreña', 'Traditional Salvadoran horchata', 'PREPARED', 2.25),
('Batido de fresa', 'Strawberry milkshake', 'PREPARED', 3.25),

-- DESSERTS

('Pastel de chocolate', 'Chocolate cake', 'PREPARED', 3.50),
('Flan', 'Vanilla flan', 'PREPARED', 2.75),
('Cheesecake Fresa', 'Strawberry cheesecake', 'PREPARED', 3.75);

-- =====================================================
-- INGREDIENTS AND PACKAGING
-- =====================================================

INSERT INTO ingredient (name, ingredient_type, unit)
VALUES

-- MEAT AND PROTEIN
('Chicken', 'RAW_MATERIAL', 'g'),
('Ground beef', 'RAW_MATERIAL', 'g'),
('Beef', 'RAW_MATERIAL', 'g'),
('Shrimp', 'RAW_MATERIAL', 'g'),
('Pork', 'RAW_MATERIAL', 'g'),
('Eggs', 'RAW_MATERIAL', 'unit'),
('Ham', 'RAW_MATERIAL', 'g'),

-- VEGETABLES AND FRUITS
('Rice', 'RAW_MATERIAL', 'g'),
('Broccoli', 'RAW_MATERIAL', 'g'),
('Carrot', 'RAW_MATERIAL', 'g'),
('Lettuce', 'RAW_MATERIAL', 'g'),
('Salad', 'RAW_MATERIAL', 'g'),
('Tomato', 'RAW_MATERIAL', 'g'),
('Onion', 'RAW_MATERIAL', 'g'),
('Cilantro', 'RAW_MATERIAL', 'g'),
('Potato', 'RAW_MATERIAL', 'g'),
('Potato (unit)', 'RAW_MATERIAL', 'unit'),
('Garlic', 'RAW_MATERIAL', 'g'),
('Plantain', 'RAW_MATERIAL', 'g'),
('Beans', 'RAW_MATERIAL', 'g'),
('Tortillas', 'RAW_MATERIAL', 'unit'),
('Lemons', 'RAW_MATERIAL', 'unit'),
('Oranges', 'RAW_MATERIAL', 'unit'),
('Strawberries', 'RAW_MATERIAL', 'g'),

-- DAIRY AND OTHER INGREDIENTS
('Cheese', 'RAW_MATERIAL', 'g'),
('Cream', 'RAW_MATERIAL', 'ml'),
('Milk', 'RAW_MATERIAL', 'ml'),
('Butter', 'RAW_MATERIAL', 'g'),
('Mayonnaise', 'RAW_MATERIAL', 'g'),
('Vanilla ice cream', 'RAW_MATERIAL', 'g'),
('Cream cheese', 'RAW_MATERIAL', 'g'),
('Flour', 'RAW_MATERIAL', 'g'),
('Sugar', 'RAW_MATERIAL', 'g'),
('Cocoa powder', 'RAW_MATERIAL', 'g'),
('Vanilla extract', 'RAW_MATERIAL', 'ml'),
('Cookies', 'RAW_MATERIAL', 'g'),
('Hamburger bun', 'RAW_MATERIAL', 'unit'),
('Horchata mix', 'RAW_MATERIAL', 'g'),
('Water', 'RAW_MATERIAL', 'ml'),
('Ice', 'RAW_MATERIAL', 'g'),
('Oil', 'RAW_MATERIAL', 'ml'),
('Salt and pepper', 'RAW_MATERIAL', 'g'),

-- PACKAGING AND SERVICE MATERIALS
('Large flat plate', 'PACKAGING', 'unit'),
('Medium flat plate', 'PACKAGING', 'unit'),
('Small dessert plate', 'PACKAGING', 'unit'),
('Small dessert bowl', 'PACKAGING', 'unit'),
('Serving basket', 'PACKAGING', 'unit'),
('Wax paper', 'PACKAGING', 'unit'),
('Fork', 'PACKAGING', 'unit'),
('Knife', 'PACKAGING', 'unit'),
('Serrated knife', 'PACKAGING', 'unit'),
('Spoon', 'PACKAGING', 'unit'),
('Dessert fork', 'PACKAGING', 'unit'),
('Small dessert spoon', 'PACKAGING', 'unit'),
('Napkin', 'PACKAGING', 'unit'),
('Wet wipe', 'PACKAGING', 'unit'),
('Large glass 16 oz', 'PACKAGING', 'unit'),
('Medium glass 12 oz', 'PACKAGING', 'unit'),
('Straw', 'PACKAGING', 'unit'),
('Thick straw', 'PACKAGING', 'unit'),
('Long spoon', 'PACKAGING', 'unit'),
('Coaster', 'PACKAGING', 'unit');


-- =====================================================
-- PRODUCT RECIPES
-- QUANTITIES PER PRODUCT UNIT
-- =====================================================

INSERT INTO product_ingredient (product_id, ingredient_id, quantity)
SELECT
    p.product_id,
    i.ingredient_id,
    r.quantity
FROM (
    VALUES

    -- 1. POLLO A LA PLANCHA
    ('Pollo a la plancha', 'Chicken', 200),
    ('Pollo a la plancha', 'Rice', 100),
    ('Pollo a la plancha', 'Broccoli', 50),
    ('Pollo a la plancha', 'Carrot', 50),
    ('Pollo a la plancha', 'Oil', 15),
    ('Pollo a la plancha', 'Salt and pepper', 3),
    ('Pollo a la plancha', 'Large flat plate', 1),
    ('Pollo a la plancha', 'Fork', 1),
    ('Pollo a la plancha', 'Knife', 1),
    ('Pollo a la plancha', 'Napkin', 2),

    -- 2. HAMBURGUESA CLASICA
    ('Hamburguesa clasica', 'Hamburger bun', 1),
    ('Hamburguesa clasica', 'Ground beef', 150),
    ('Hamburguesa clasica', 'Cheese', 25),
    ('Hamburguesa clasica', 'Lettuce', 20),
    ('Hamburguesa clasica', 'Tomato', 30),
    ('Hamburguesa clasica', 'Mayonnaise', 15),
    ('Hamburguesa clasica', 'Potato (unit)', 4),
    ('Hamburguesa clasica', 'Medium flat plate', 1),
    ('Hamburguesa clasica', 'Fork', 1),
    ('Hamburguesa clasica', 'Knife', 1),
    ('Hamburguesa clasica', 'Napkin', 3),

    -- 3. CARNE ASADA CON PAPAS
    ('Carne asada con papas', 'Beef', 220),
    ('Carne asada con papas', 'Potato', 180),
    ('Carne asada con papas', 'Salad', 80),
    ('Carne asada con papas', 'Garlic', 5),
    ('Carne asada con papas', 'Oil', 20),
    ('Carne asada con papas', 'Salt and pepper', 3),
    ('Carne asada con papas', 'Large flat plate', 1),
    ('Carne asada con papas', 'Fork', 1),
    ('Carne asada con papas', 'Serrated knife', 1),
    ('Carne asada con papas', 'Napkin', 2),

    -- 4. TACOS DE CARNE
    ('Tacos de carne', 'Beef', 150),
    ('Tacos de carne', 'Tortillas', 3),
    ('Tacos de carne', 'Onion', 30),
    ('Tacos de carne', 'Tomato', 50),
    ('Tacos de carne', 'Cilantro', 10),
    ('Tacos de carne', 'Oil', 10),
    ('Tacos de carne', 'Medium flat plate', 1),
    ('Tacos de carne', 'Fork', 1),
    ('Tacos de carne', 'Napkin', 3),

    -- 5. CAMARON AL AJILLO
    ('Camaron al ajillo', 'Shrimp', 180),
    ('Camaron al ajillo', 'Rice', 100),
    ('Camaron al ajillo', 'Garlic', 10),
    ('Camaron al ajillo', 'Butter', 25),
    ('Camaron al ajillo', 'Cilantro', 10),
    ('Camaron al ajillo', 'Oil', 10),
    ('Camaron al ajillo', 'Large flat plate', 1),
    ('Camaron al ajillo', 'Fork', 1),
    ('Camaron al ajillo', 'Knife', 1),
    ('Camaron al ajillo', 'Napkin', 3),
    ('Camaron al ajillo', 'Wet wipe', 1),

    -- 6. DESAYUNO TIPICO SALVADOREÑO
    ('Desayuno tipico salvadoreño', 'Eggs', 2),
    ('Desayuno tipico salvadoreño', 'Beans', 120),
    ('Desayuno tipico salvadoreño', 'Plantain', 100),
    ('Desayuno tipico salvadoreño', 'Cream', 30),
    ('Desayuno tipico salvadoreño', 'Cheese', 40),
    ('Desayuno tipico salvadoreño', 'Tortillas', 3),
    ('Desayuno tipico salvadoreño', 'Oil', 20),
    ('Desayuno tipico salvadoreño', 'Large flat plate', 1),
    ('Desayuno tipico salvadoreño', 'Fork', 1),
    ('Desayuno tipico salvadoreño', 'Knife', 1),
    ('Desayuno tipico salvadoreño', 'Spoon', 1),
    ('Desayuno tipico salvadoreño', 'Napkin', 2),

    -- 7. OMELETTE
    ('Omelette', 'Eggs', 3),
    ('Omelette', 'Ham', 50),
    ('Omelette', 'Cheese', 40),
    ('Omelette', 'Tomato', 30),
    ('Omelette', 'Onion', 20),
    ('Omelette', 'Butter', 15),
    ('Omelette', 'Salt and pepper', 3),
    ('Omelette', 'Medium flat plate', 1),
    ('Omelette', 'Fork', 1),
    ('Omelette', 'Knife', 1),
    ('Omelette', 'Napkin', 2),

    -- 8. LOMO DE CERDO
    ('Lomo de cerdo', 'Pork', 200),
    ('Lomo de cerdo', 'Onion', 30),
    ('Lomo de cerdo', 'Butter', 15),
    ('Lomo de cerdo', 'Potato (unit)', 4),
    ('Lomo de cerdo', 'Salt and pepper', 3),
    ('Lomo de cerdo', 'Large flat plate', 1),
    ('Lomo de cerdo', 'Fork', 1),
    ('Lomo de cerdo', 'Serrated knife', 1),
    ('Lomo de cerdo', 'Napkin', 2),

    -- 9. LIMONADA
    ('Limonada', 'Lemons', 3),
    ('Limonada', 'Water', 300),
    ('Limonada', 'Sugar', 30),
    ('Limonada', 'Ice', 100),
    ('Limonada', 'Large glass 16 oz', 1),
    ('Limonada', 'Straw', 1),
    ('Limonada', 'Coaster', 1),

    -- 10. JUGO NARANJA
    ('Jugo naranja', 'Oranges', 4),
    ('Jugo naranja', 'Water', 100),
    ('Jugo naranja', 'Sugar', 15),
    ('Jugo naranja', 'Ice', 100),
    ('Jugo naranja', 'Medium glass 12 oz', 1),
    ('Jugo naranja', 'Straw', 1),
    ('Jugo naranja', 'Coaster', 1),

    -- 11. HORCHATA SALVADOREÑA
    ('Horchata salvadoreña', 'Horchata mix', 40),
    ('Horchata salvadoreña', 'Water', 300),
    ('Horchata salvadoreña', 'Milk', 50),
    ('Horchata salvadoreña', 'Sugar', 20),
    ('Horchata salvadoreña', 'Ice', 100),
    ('Horchata salvadoreña', 'Large glass 16 oz', 1),
    ('Horchata salvadoreña', 'Straw', 1),
    ('Horchata salvadoreña', 'Coaster', 1),

    -- 12. BATIDO DE FRESA
    ('Batido de fresa', 'Strawberries', 120),
    ('Batido de fresa', 'Milk', 250),
    ('Batido de fresa', 'Sugar', 25),
    ('Batido de fresa', 'Vanilla ice cream', 50),
    ('Batido de fresa', 'Ice', 50),
    ('Batido de fresa', 'Large glass 16 oz', 1),
    ('Batido de fresa', 'Thick straw', 1),
    ('Batido de fresa', 'Long spoon', 1),
    ('Batido de fresa', 'Napkin', 1),

    -- 13. PASTEL DE CHOCOLATE
    ('Pastel de chocolate', 'Flour', 60),
    ('Pastel de chocolate', 'Sugar', 50),
    ('Pastel de chocolate', 'Eggs', 1),
    ('Pastel de chocolate', 'Cocoa powder', 15),
    ('Pastel de chocolate', 'Milk', 40),
    ('Pastel de chocolate', 'Butter', 25),
    ('Pastel de chocolate', 'Small dessert plate', 1),
    ('Pastel de chocolate', 'Dessert fork', 1),
    ('Pastel de chocolate', 'Napkin', 2),

    -- 14. FLAN
    ('Flan', 'Milk', 150),
    ('Flan', 'Eggs', 1),
    ('Flan', 'Sugar', 40),
    ('Flan', 'Vanilla extract', 5),
    ('Flan', 'Small dessert bowl', 1),
    ('Flan', 'Small dessert spoon', 1),
    ('Flan', 'Napkin', 2),

    -- 15. CHEESECAKE FRESA
    ('Cheesecake Fresa', 'Cream cheese', 100),
    ('Cheesecake Fresa', 'Cookies', 50),
    ('Cheesecake Fresa', 'Butter', 20),
    ('Cheesecake Fresa', 'Sugar', 30),
    ('Cheesecake Fresa', 'Strawberries', 50),
    ('Cheesecake Fresa', 'Cream', 30),
    ('Cheesecake Fresa', 'Small dessert plate', 1),
    ('Cheesecake Fresa', 'Dessert fork', 1),
    ('Cheesecake Fresa', 'Napkin', 2)

) AS r(product_name, ingredient_name, quantity)

JOIN product p
    ON p.name = r.product_name

JOIN ingredient i
    ON i.name = r.ingredient_name;


-- =====================================================
-- BRANCHES
-- =====================================================

INSERT INTO branch (name, address, phone)
VALUES
('Sucursal San Salvador', 'Boulevard de los Héroes, San Salvador', '2222-1000'),
('Sucursal Santa Ana', 'Avenida Independencia, Santa Ana', '2444-2000');


-- =====================================================
-- EMPLOYEES AND LOGINS
-- Password for every demo employee: Origenes123!
-- =====================================================

INSERT INTO employee (
    email,
    password_hash,
    role,
    branch_id,
    full_name,
    job_title,
    hire_date,
    base_salary
)
VALUES
    ('admin@origenessv.com', crypt('Origenes123!', gen_salt('bf')), 'ADMINISTRATOR', 1, 'Ana Martínez', 'Administradora General', CAST('2022-01-10' AS DATE), 1800.00),
    ('gerente@origenessv.com', crypt('Origenes123!', gen_salt('bf')), 'MANAGER', 1, 'Carlos Pérez', 'Gerente de Sucursal', CAST('2022-03-15' AS DATE), 1500.00),
    ('empleado@origenessv.com', crypt('Origenes123!', gen_salt('bf')), 'EMPLOYEE', 1, 'María López', 'Cajera', CAST('2023-06-01' AS DATE), 500.00),
    ('rrhh@origenessv.com', crypt('Origenes123!', gen_salt('bf')), 'HR', 1, 'José Ramírez', 'Encargado de Recursos Humanos', CAST('2022-08-20' AS DATE), 1200.00),
    ('inventario@origenessv.com', crypt('Origenes123!', gen_salt('bf')), 'INVENTORY_MANAGER', 2, 'Luis Gómez', 'Encargado de Inventario', CAST('2023-02-10' AS DATE), 900.00);


-- =====================================================
-- CUSTOMER
-- =====================================================

INSERT INTO customer (
    full_name,
    tax_id,
    registration_number,
    business_name,
    economic_activity,
    tax_address
)
VALUES
(
    'Cliente Demo',
    '0614-150590-101-5',
    'NRC-100001',
    'Cliente Demo, S.A. de C.V.',
    'Comercio al por menor',
    'San Salvador, El Salvador'
);


-- =====================================================
-- CASH REGISTERS AND DOCUMENT SEQUENCES
-- =====================================================

INSERT INTO cash_register (branch_id, name)
VALUES
(1, 'Caja Principal'),
(1, 'Caja 2'),
(2, 'Caja Principal');

INSERT INTO document_sequence (branch_id, document_type, last_number)
SELECT
    b.branch_id,
    d.document_type,
    0
FROM branch b
CROSS JOIN (VALUES ('FINAL_CONSUMER'), ('CREDIT_TAX')) AS d(document_type);


-- =====================================================
-- INITIAL BRANCH INVENTORY (BRANCH 1)
-- =====================================================

INSERT INTO branch_inventory (branch_id, ingredient_id, quantity, minimum_stock)
SELECT
    1,
    i.ingredient_id,
    CASE i.unit WHEN 'unit' THEN 100 ELSE 5000 END,
    CASE i.unit WHEN 'unit' THEN 10 ELSE 500 END
FROM ingredient i;


-- =====================================================
-- SUPPLIERS
-- =====================================================

INSERT INTO supplier (name, email, phone, address, tax_id)
VALUES
('Distribuidora La Cosecha', 'ventas@lacosecha.com', '2223-3344', 'Mercado Central, San Salvador', '0614-010120-102-3'),
('Carnes El Buen Corte', 'pedidos@buencorte.com', '2455-6677', 'Santa Ana, El Salvador', '0614-050520-103-8'),
('Empaques y Servicio SV', 'contacto@empaquessv.com', '2266-8899', 'Soyapango, San Salvador', '0614-090920-104-2');


-- =====================================================
-- PAYROLL
-- =====================================================

INSERT INTO payroll (start_date, end_date, payment_date, status)
VALUES
('2026-10-01', '2026-10-15', '2026-10-16', 'PAID'),
('2026-10-16', '2026-10-31', '2026-11-01', 'PROCESSED'),
('2026-11-01', '2026-11-15', NULL, 'DRAFT');

INSERT INTO payroll_detail (
    payroll_id,
    employee_id,
    gross_salary,
    isss_deduction,
    afp_deduction,
    income_tax,
    other_deductions,
    net_salary
)
SELECT
    p.payroll_id,
    e.employee_id,
    ROUND(e.base_salary / 2, 2),
    ROUND(e.base_salary / 2 * 0.03, 2),
    ROUND(e.base_salary / 2 * 0.0725, 2),
    0.00,
    0.00,
    ROUND(
        e.base_salary / 2
        - ROUND(e.base_salary / 2 * 0.03, 2)
        - ROUND(e.base_salary / 2 * 0.0725, 2),
        2
    )
FROM payroll p
CROSS JOIN employee e
WHERE p.status = 'PAID';


-- =====================================================
-- PURCHASES
-- =====================================================

INSERT INTO purchase (
    supplier_id,
    branch_id,
    employee_id,
    invoice_number,
    purchase_date,
    subtotal,
    vat,
    total,
    status
)
VALUES
(1, 1, (SELECT employee_id FROM employee WHERE email = 'inventario@origenessv.com'), 'FAC-001', '2026-11-15 09:00', 150.00, 19.50, 169.50, 'PAID'),
(2, 1, (SELECT employee_id FROM employee WHERE email = 'inventario@origenessv.com'), 'FAC-002', '2026-11-16 10:30', 200.00, 26.00, 226.00, 'PENDING'),
(3, 2, (SELECT employee_id FROM employee WHERE email = 'inventario@origenessv.com'), 'FAC-003', '2026-11-17 11:15', 100.00, 13.00, 113.00, 'PENDING');

INSERT INTO purchase_detail (purchase_id, ingredient_id, quantity, unit_cost, subtotal)
SELECT
    v.purchase_id,
    i.ingredient_id,
    v.quantity,
    v.unit_cost,
    v.subtotal
FROM (
    VALUES
    (1, 'Chicken', 10000, 0.0060, 60.00),
    (1, 'Rice', 20000, 0.0015, 30.00),
    (1, 'Beans', 10000, 0.0020, 20.00),
    (1, 'Oil', 5000, 0.0080, 40.00),
    (2, 'Beef', 20000, 0.0080, 160.00),
    (2, 'Pork', 5000, 0.0080, 40.00),
    (3, 'Napkin', 2000, 0.0200, 40.00),
    (3, 'Large flat plate', 300, 0.1000, 30.00),
    (3, 'Fork', 600, 0.0500, 30.00)
) AS v(purchase_id, ingredient_name, quantity, unit_cost, subtotal)
JOIN ingredient i
    ON i.name = v.ingredient_name;

INSERT INTO accounts_payable (purchase_id, outstanding_amount, due_date, status)
VALUES
(1, 0.00, '2026-11-30', 'PAID'),
(2, 226.00, '2026-12-05', 'PENDING'),
(3, 63.00, '2026-12-10', 'PARTIAL');

INSERT INTO supplier_payment (payable_id, amount, payment_date, payment_method, reference)
VALUES
(1, 169.50, '2026-11-20 15:00', 'TRANSFER', 'TRX-1001'),
(3, 50.00, '2026-11-22 16:30', 'CASH', NULL);


-- =====================================================
-- CASH SHIFTS
-- =====================================================

INSERT INTO cash_shift (
    cash_register_id,
    employee_id,
    opening_date,
    closing_date,
    opening_amount,
    closing_amount,
    status
)
VALUES
(1, (SELECT employee_id FROM employee WHERE email = 'empleado@origenessv.com'), '2026-11-17 08:00', '2026-11-17 17:00', 100.00, 426.47, 'CLOSED'),
(1, (SELECT employee_id FROM employee WHERE email = 'empleado@origenessv.com'), '2026-11-18 08:00', NULL, 100.00, NULL, 'OPEN');


-- =====================================================
-- INVOICES AND PAYMENTS
-- =====================================================

INSERT INTO invoice (
    customer_id,
    branch_id,
    employee_id,
    document_type,
    consecutive_number,
    control_number,
    generation_code,
    reception_stamp,
    issue_date,
    subtotal,
    vat,
    total,
    status
)
VALUES
(1, 1, (SELECT employee_id FROM employee WHERE email = 'empleado@origenessv.com'), 'CREDIT_TAX', 1, 'DTE-01-0001', '11111111-1111-1111-1111-111111111111', 'REC-2026-0001', '2026-11-17 12:30', 9.50, 1.24, 10.74, 'PAID'),
(NULL, 1, (SELECT employee_id FROM employee WHERE email = 'empleado@origenessv.com'), 'FINAL_CONSUMER', 1, 'DTE-FC-0001', '22222222-2222-2222-2222-222222222222', 'REC-2026-0002', '2026-11-17 13:10', 13.25, 1.72, 14.97, 'PAID');

INSERT INTO invoice_detail (invoice_id, product_id, quantity, unit_price, subtotal)
SELECT
    v.invoice_id,
    p.product_id,
    v.quantity,
    v.unit_price,
    v.subtotal
FROM (
    VALUES
    (1, 'Pollo a la plancha', 1, 7.50, 7.50),
    (1, 'Limonada', 1, 2.00, 2.00),
    (2, 'Hamburguesa clasica', 2, 5.50, 11.00),
    (2, 'Jugo naranja', 1, 2.25, 2.25)
) AS v(invoice_id, product_name, quantity, unit_price, subtotal)
JOIN product p
    ON p.name = v.product_name;

INSERT INTO sale_payment (invoice_id, shift_id, payment_method, amount, reference, payment_date)
VALUES
(1, 1, 'CARD', 10.74, 'TRX-CARD-001', '2026-11-17 12:35'),
(2, 1, 'CASH', 14.97, NULL, '2026-11-17 13:15');

INSERT INTO cash_movement (shift_id, movement_type, description, amount, created_at)
VALUES
(1, 'INCOME', 'Pago de factura contado', 14.97, '2026-11-17 13:15'),
(1, 'EXPENSE', 'Compra de hielo', 3.50, '2026-11-17 10:00'),
(1, 'EXPENSE', 'Propina repartidor', 2.00, '2026-11-17 15:30'),
(2, 'INCOME', 'Venta mostrador', 6.50, '2026-11-18 09:45');

UPDATE document_sequence
SET last_number = 1
WHERE branch_id = 1
  AND document_type IN ('FINAL_CONSUMER', 'CREDIT_TAX');


-- =====================================================
-- INVENTORY MOVEMENTS
-- =====================================================

INSERT INTO inventory_movement (
    branch_id,
    ingredient_id,
    employee_id,
    movement_type,
    quantity,
    reason,
    created_at
)
SELECT
    1,
    i.ingredient_id,
    e.employee_id,
    v.movement_type,
    v.quantity,
    v.reason,
    CAST(v.created_at AS TIMESTAMP)
FROM (
    VALUES
    ('Chicken', 'IN', 10000, 'Compra factura FAC-001', '2026-11-15 09:00'),
    ('Rice', 'IN', 20000, 'Compra factura FAC-001', '2026-11-15 09:00'),
    ('Beans', 'IN', 10000, 'Compra factura FAC-001', '2026-11-15 09:00'),
    ('Oil', 'IN', 5000, 'Compra factura FAC-001', '2026-11-15 09:00'),
    ('Chicken', 'CONSUMPTION', 200, 'Consumo por venta', '2026-11-17 13:15'),
    ('Rice', 'CONSUMPTION', 100, 'Consumo por venta', '2026-11-17 13:15'),
    ('Potato', 'ADJUSTMENT', 500, 'Ajuste por merma', '2026-11-17 17:00')
) AS v(ingredient_name, movement_type, quantity, reason, created_at)
JOIN ingredient i
    ON i.name = v.ingredient_name
CROSS JOIN employee e
WHERE e.email = 'inventario@origenessv.com';
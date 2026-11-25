-- =====================================================
-- ORIGENES SV - POSTGRESQL
-- Commercial and Administrative Management System
-- =====================================================

CREATE DATABASE origenessv;

-- Connect to origenessv before executing the rest (psql meta-command).
\c origenessv

-- Required for bcrypt password hashing (crypt/gen_salt).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. BRANCHES AND EMPLOYEES
-- =====================================================

CREATE TABLE branch (
    branch_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE employee (
    employee_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branch(branch_id),

    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(30) NOT NULL CHECK (
        role IN (
            'ADMINISTRATOR',
            'MANAGER',
            'EMPLOYEE',
            'HR',
            'INVENTORY_MANAGER'
        )
    ),

    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    full_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL,
    base_salary NUMERIC(12,2) NOT NULL
);

CREATE TABLE customer (
    customer_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,
    tax_id VARCHAR(20),
    registration_number VARCHAR(20),
    business_name VARCHAR(150),
    economic_activity VARCHAR(150),
    tax_address VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- =====================================================
-- 2. HUMAN RESOURCES AND PAYROLL
-- =====================================================

CREATE TABLE payroll (
    payroll_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('DRAFT', 'PROCESSED', 'PAID')
    ),
    CHECK (end_date >= start_date)
);

CREATE TABLE payroll_detail (
    payroll_detail_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payroll_id INTEGER NOT NULL REFERENCES payroll(payroll_id),
    employee_id INTEGER NOT NULL REFERENCES employee(employee_id),

    gross_salary NUMERIC(12,2) NOT NULL,
    isss_deduction NUMERIC(12,2) NOT NULL,
    afp_deduction NUMERIC(12,2) NOT NULL,
    income_tax NUMERIC(12,2) NOT NULL,
    other_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_salary NUMERIC(12,2) NOT NULL,

    UNIQUE (payroll_id, employee_id)
);


-- =====================================================
-- 3. PRODUCTS, RECIPES AND INVENTORY
-- =====================================================

CREATE TABLE ingredient (
    ingredient_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,

    ingredient_type VARCHAR(30) NOT NULL CHECK (
        ingredient_type IN ('RAW_MATERIAL', 'PACKAGING', 'RESALE')
    ),

    unit VARCHAR(30) NOT NULL
);

CREATE TABLE product (
    product_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,

    product_type VARCHAR(20) NOT NULL CHECK (
        product_type IN ('PREPARED', 'RESELL')
    ),

    resale_ingredient_id INTEGER REFERENCES ingredient(ingredient_id),

    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,

    CHECK (
        (product_type = 'RESELL' AND resale_ingredient_id IS NOT NULL)
        OR
        (product_type = 'PREPARED' AND resale_ingredient_id IS NULL)
    )
);

-- Each row represents an ingredient or material
-- required to prepare one unit of a product.

CREATE TABLE product_ingredient (
    product_id INTEGER NOT NULL REFERENCES product(product_id),
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(ingredient_id),
    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),

    PRIMARY KEY (product_id, ingredient_id)
);

CREATE TABLE branch_inventory (
    inventory_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branch(branch_id),
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(ingredient_id),

    quantity NUMERIC(12,3) NOT NULL DEFAULT 0
        CHECK (quantity >= 0),

    minimum_stock NUMERIC(12,3) NOT NULL DEFAULT 0
        CHECK (minimum_stock >= 0),

    UNIQUE (branch_id, ingredient_id)
);

CREATE TABLE inventory_movement (
    movement_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branch(branch_id),
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(ingredient_id),
    employee_id INTEGER REFERENCES employee(employee_id),

    movement_type VARCHAR(20) NOT NULL CHECK (
        movement_type IN ('IN', 'OUT', 'CONSUMPTION', 'ADJUSTMENT')
    ),

    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- =====================================================
-- 4. SUPPLIERS AND PURCHASES
-- =====================================================

CREATE TABLE supplier (
    supplier_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    address VARCHAR(255),
    tax_id VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE purchase (
    purchase_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES supplier(supplier_id),
    branch_id INTEGER NOT NULL REFERENCES branch(branch_id),
    employee_id INTEGER NOT NULL REFERENCES employee(employee_id),

    invoice_number VARCHAR(50),
    purchase_date TIMESTAMP NOT NULL DEFAULT NOW(),

    subtotal NUMERIC(12,2) NOT NULL,
    vat NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,

    status VARCHAR(20) NOT NULL CHECK (
        status IN ('PENDING', 'PAID', 'CANCELLED')
    )
);

CREATE TABLE purchase_detail (
    purchase_detail_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    purchase_id INTEGER NOT NULL REFERENCES purchase(purchase_id),
    ingredient_id INTEGER NOT NULL REFERENCES ingredient(ingredient_id),

    quantity NUMERIC(12,3) NOT NULL CHECK (quantity > 0),
    unit_cost NUMERIC(12,4) NOT NULL CHECK (unit_cost >= 0),
    subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE accounts_payable (
    payable_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    purchase_id INTEGER NOT NULL UNIQUE REFERENCES purchase(purchase_id),

    outstanding_amount NUMERIC(12,2) NOT NULL,
    due_date DATE,

    status VARCHAR(20) NOT NULL CHECK (
        status IN ('PENDING', 'PARTIAL', 'PAID')
    )
);

CREATE TABLE supplier_payment (
    supplier_payment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payable_id INTEGER NOT NULL REFERENCES accounts_payable(payable_id),

    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP NOT NULL DEFAULT NOW(),
    payment_method VARCHAR(30) NOT NULL,
    reference VARCHAR(150)
);


-- =====================================================
-- 5. SALES AND INVOICING
-- =====================================================

CREATE TABLE document_sequence (
    sequence_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branch(branch_id),

    document_type VARCHAR(30) NOT NULL CHECK (
        document_type IN ('FINAL_CONSUMER', 'CREDIT_TAX')
    ),

    last_number BIGINT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    UNIQUE (branch_id, document_type)
);

CREATE TABLE invoice (
    invoice_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_id INTEGER REFERENCES customer(customer_id),
    branch_id INTEGER NOT NULL REFERENCES branch(branch_id),
    employee_id INTEGER NOT NULL REFERENCES employee(employee_id),

    document_type VARCHAR(30) NOT NULL CHECK (
        document_type IN ('FINAL_CONSUMER', 'CREDIT_TAX')
    ),

    consecutive_number BIGINT NOT NULL,
    control_number VARCHAR(100) UNIQUE,
    generation_code UUID UNIQUE,
    reception_stamp VARCHAR(150),

    issue_date TIMESTAMP NOT NULL DEFAULT NOW(),

    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    vat NUMERIC(12,2) NOT NULL CHECK (vat >= 0),
    total NUMERIC(12,2) NOT NULL CHECK (total >= 0),

    status VARCHAR(20) NOT NULL CHECK (
        status IN ('PENDING', 'PAID', 'CANCELLED')
    ),

    UNIQUE (branch_id, document_type, consecutive_number)
);

CREATE TABLE invoice_detail (
    invoice_detail_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoice(invoice_id),
    product_id INTEGER NOT NULL REFERENCES product(product_id),

    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12,2) NOT NULL
);


-- =====================================================
-- 6. CASH REGISTER AND PAYMENTS
-- =====================================================

CREATE TABLE cash_register (
    cash_register_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branch(branch_id),
    name VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE cash_shift (
    shift_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cash_register_id INTEGER NOT NULL REFERENCES cash_register(cash_register_id),
    employee_id INTEGER NOT NULL REFERENCES employee(employee_id),

    opening_date TIMESTAMP NOT NULL DEFAULT NOW(),
    closing_date TIMESTAMP,

    opening_amount NUMERIC(12,2) NOT NULL,
    closing_amount NUMERIC(12,2),

    status VARCHAR(20) NOT NULL CHECK (
        status IN ('OPEN', 'CLOSED')
    )
);

CREATE TABLE sale_payment (
    payment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoice(invoice_id),
    shift_id INTEGER NOT NULL REFERENCES cash_shift(shift_id),

    payment_method VARCHAR(30) NOT NULL CHECK (
        payment_method IN ('CASH', 'CARD', 'BITCOIN', 'CHIVO')
    ),

    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    reference VARCHAR(150),
    payment_date TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE cash_movement (
    cash_movement_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    shift_id INTEGER NOT NULL REFERENCES cash_shift(shift_id),

    movement_type VARCHAR(20) NOT NULL CHECK (
        movement_type IN ('INCOME', 'EXPENSE')
    ),

    description VARCHAR(150),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
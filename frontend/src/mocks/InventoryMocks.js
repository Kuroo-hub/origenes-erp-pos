export const INITIAL_INVENTORY_MOCK = [
  // Sucursal 1: Centro Histórico
  { inventory_id: 1, branch_id: 1, ingredient_id: 1, name: 'Chicken', ingredient_type: 'RAW_MATERIAL', unit: 'g', quantity: 9800, minimum_stock: 1500 },
  { inventory_id: 2, branch_id: 1, ingredient_id: 2, name: 'Ground beef', ingredient_type: 'RAW_MATERIAL', unit: 'g', quantity: 5000, minimum_stock: 1000 },
  { inventory_id: 3, branch_id: 1, ingredient_id: 3, name: 'Beef', ingredient_type: 'RAW_MATERIAL', unit: 'g', quantity: 450, minimum_stock: 1000 }, // Alerta stock mínimo
  { inventory_id: 4, branch_id: 1, ingredient_id: 4, name: 'Shrimp', ingredient_type: 'RAW_MATERIAL', unit: 'g', quantity: 3200, minimum_stock: 800 },
  { inventory_id: 5, branch_id: 1, ingredient_id: 6, name: 'Eggs', ingredient_type: 'RAW_MATERIAL', unit: 'unit', quantity: 12, minimum_stock: 24 }, // Alerta stock mínimo
  { inventory_id: 6, branch_id: 1, ingredient_id: 8, name: 'Rice', ingredient_type: 'RAW_MATERIAL', unit: 'g', quantity: 19900, minimum_stock: 2000 },
  { inventory_id: 7, branch_id: 1, ingredient_id: 16, name: 'Potato', ingredient_type: 'RAW_MATERIAL', unit: 'g', quantity: 4500, minimum_stock: 1000 },
  { inventory_id: 8, branch_id: 1, ingredient_id: 22, name: 'Lemons', ingredient_type: 'RAW_MATERIAL', unit: 'unit', quantity: 85, minimum_stock: 20 },
  { inventory_id: 9, branch_id: 1, ingredient_id: 27, name: 'Milk', ingredient_type: 'RAW_MATERIAL', unit: 'ml', quantity: 5000, minimum_stock: 1000 },
  { inventory_id: 10, branch_id: 1, ingredient_id: 43, name: 'Large flat plate', ingredient_type: 'PACKAGING', unit: 'unit', quantity: 98, minimum_stock: 20 },
  { inventory_id: 11, branch_id: 1, ingredient_id: 55, name: 'Napkin', ingredient_type: 'PACKAGING', unit: 'unit', quantity: 15, minimum_stock: 50 }, // Alerta stock mínimo
  { inventory_id: 12, branch_id: 1, ingredient_id: 57, name: 'Large glass 16 oz', ingredient_type: 'PACKAGING', unit: 'unit', quantity: 0, minimum_stock: 25 }, // Agotado

  // Sucursal 2: Santa Ana
  { inventory_id: 13, branch_id: 2, ingredient_id: 1, name: 'Chicken', ingredient_type: 'RAW_MATERIAL', unit: 'g', quantity: 6000, minimum_stock: 1200 },
  { inventory_id: 14, branch_id: 2, ingredient_id: 3, name: 'Beef', ingredient_type: 'RAW_MATERIAL', unit: 'g', quantity: 4500, minimum_stock: 1000 },
  { inventory_id: 15, branch_id: 2, ingredient_id: 43, name: 'Large flat plate', ingredient_type: 'PACKAGING', unit: 'unit', quantity: 300, minimum_stock: 30 },
  { inventory_id: 16, branch_id: 2, ingredient_id: 49, name: 'Fork', ingredient_type: 'PACKAGING', unit: 'unit', quantity: 25, minimum_stock: 50 }, // Alerta stock mínimo
  { inventory_id: 17, branch_id: 2, ingredient_id: 55, name: 'Napkin', ingredient_type: 'PACKAGING', unit: 'unit', quantity: 2000, minimum_stock: 100 },

  // Sucursal 3: San Miguel
  { inventory_id: 18, branch_id: 3, ingredient_id: 1, name: 'Chicken', ingredient_type: 'RAW_MATERIAL', unit: 'g', quantity: 3400, minimum_stock: 900 },
  { inventory_id: 19, branch_id: 3, ingredient_id: 8, name: 'Rice', ingredient_type: 'RAW_MATERIAL', unit: 'g', quantity: 8100, minimum_stock: 1200 },
  { inventory_id: 20, branch_id: 3, ingredient_id: 27, name: 'Milk', ingredient_type: 'RAW_MATERIAL', unit: 'ml', quantity: 4200, minimum_stock: 800 },
  { inventory_id: 21, branch_id: 3, ingredient_id: 43, name: 'Large flat plate', ingredient_type: 'PACKAGING', unit: 'unit', quantity: 180, minimum_stock: 40 },
];

export const INITIAL_PURCHASES_MOCK = [
  {
    purchase_id: 1,
    payable_id: 1,
    branch_id: 1,
    supplier_name: 'Distribuidora La Cosecha',
    invoice_number: 'FAC-001',
    purchase_date: '2026-11-15 09:00',
    subtotal: 150.0,
    vat: 19.5,
    total: 169.5,
    outstanding_amount: 0.0,
    status: 'PAID',
  },
  {
    purchase_id: 2,
    payable_id: 2,
    branch_id: 1,
    supplier_name: 'Carnes El Buen Corte',
    invoice_number: 'FAC-002',
    purchase_date: '2026-11-16 10:30',
    subtotal: 200.0,
    vat: 26.0,
    total: 226.0,
    outstanding_amount: 226.0,
    status: 'PENDING',
  },
  {
    purchase_id: 3,
    payable_id: 3,
    branch_id: 2,
    supplier_name: 'Empaques y Servicio SV',
    invoice_number: 'FAC-003',
    purchase_date: '2026-11-17 11:15',
    subtotal: 100.0,
    vat: 13.0,
    total: 113.0,
    outstanding_amount: 63.0,
    status: 'PARTIAL',
  },
  {
    purchase_id: 4,
    payable_id: 5,
    branch_id: 3,
    supplier_name: 'Bebidas Orientales',
    invoice_number: 'FAC-005',
    purchase_date: '2026-11-18 08:45',
    subtotal: 166.0,
    vat: 21.58,
    total: 187.58,
    outstanding_amount: 187.58,
    status: 'PENDING',
  },
];

export const INITIAL_MOVEMENTS_MOCK = [
  { movement_id: 1, branch_id: 1, ingredient_name: 'Chicken', unit: 'g', movement_type: 'IN', quantity: 10000, reason: 'Compra factura FAC-001', created_at: '2026-11-15 09:00', user_email: 'inventario@origenessv.com' },
  { movement_id: 2, branch_id: 1, ingredient_name: 'Rice', unit: 'g', movement_type: 'IN', quantity: 20000, reason: 'Compra factura FAC-001', created_at: '2026-11-15 09:00', user_email: 'inventario@origenessv.com' },
  { movement_id: 3, branch_id: 1, ingredient_name: 'Chicken', unit: 'g', movement_type: 'CONSUMPTION', quantity: 200, reason: 'Consumo por venta (Pollo a la plancha)', created_at: '2026-11-17 13:15', user_email: 'empleado@origenessv.com' },
  { movement_id: 4, branch_id: 1, ingredient_name: 'Rice', unit: 'g', movement_type: 'CONSUMPTION', quantity: 100, reason: 'Consumo por venta (Pollo a la plancha)', created_at: '2026-11-17 13:15', user_email: 'empleado@origenessv.com' },
  { movement_id: 5, branch_id: 1, ingredient_name: 'Potato', unit: 'g', movement_type: 'ADJUSTMENT', quantity: 500, reason: 'Ajuste por merma', created_at: '2026-11-17 17:00', user_email: 'inventario@origenessv.com' },
  { movement_id: 6, branch_id: 2, ingredient_name: 'Napkin', unit: 'unit', movement_type: 'IN', quantity: 2000, reason: 'Compra factura FAC-003', created_at: '2026-11-17 11:15', user_email: 'inventario@origenessv.com' },
  { movement_id: 7, branch_id: 3, ingredient_name: 'Chicken', unit: 'g', movement_type: 'IN', quantity: 4000, reason: 'Compra factura FAC-005', created_at: '2026-11-18 08:45', user_email: 'inventario@origenessv.com' },
];
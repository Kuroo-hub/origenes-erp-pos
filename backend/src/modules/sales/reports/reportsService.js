import { createError } from "../../../utils/errors.js";
import { parseBranchFilter } from "../../../utils/validation.js";
import {
    findDashboardBranches,
    findTopProducts,
    findPayables
} from "./reportsDao.js";

export { parseBranchFilter };

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function mapBranches(rows) {
    return rows.map((row) => ({
        branch_id: Number(row.branch_id),
        name: row.name,
        address: row.address,
        monthly_revenue: toNumber(row.monthly_revenue),
        monthly_expenses: toNumber(row.monthly_expenses),
        orders_count: toNumber(row.orders_count),
        active_staff: toNumber(row.active_staff),
        low_stock_alerts: toNumber(row.low_stock_alerts),
        cash_open: Boolean(row.cash_open)
    }));
}

export function mapTopProducts(rows) {
    return rows.map((row) => ({
        product_id: Number(row.product_id),
        name: row.name,
        category: row.category,
        units_sold: toNumber(row.units_sold),
        revenue: toNumber(row.revenue)
    }));
}

export function mapPayables(rows) {
    return rows.map((row) => ({
        payable_id: Number(row.payable_id),
        branch_id: Number(row.branch_id),
        branch_name: row.branch_name,
        supplier_name: row.supplier_name,
        invoice_number: row.invoice_number,
        due_date: row.due_date ?? null,
        total: toNumber(row.total),
        outstanding_amount: toNumber(row.outstanding_amount),
        status: row.status
    }));
}

export async function getDashboardService(branchId) {
    const parsedBranchId = parseBranchFilter(branchId);

    const [branches, topProducts, payables] = await Promise.all([
        findDashboardBranches(parsedBranchId),
        findTopProducts(parsedBranchId),
        findPayables(parsedBranchId)
    ]);

    return {
        branches: mapBranches(branches),
        top_products: mapTopProducts(topProducts),
        payables: mapPayables(payables)
    };
}

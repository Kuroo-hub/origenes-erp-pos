import { pool } from "../../config/database.js";

export async function findAllEmployees() {
    const result = await pool.query(`
        SELECT
            e.employee_id AS "employeeId",
            e.full_name AS "fullName",
            e.job_title AS "jobTitle",
            e.hire_date AS "hireDate",
            e.base_salary AS "baseSalary",
            e.email,
            e.role,
            e.active,
            b.branch_id AS "branchId",
            b.name AS "branchName"
        FROM employee e
        INNER JOIN branch b ON b.branch_id = e.branch_id
        ORDER BY e.full_name ASC
    `);

    return result.rows;
}

export async function findEmployeeById(employeeId) {
    const result = await pool.query(`
        SELECT
            e.employee_id AS "employeeId",
            e.full_name AS "fullName",
            e.job_title AS "jobTitle",
            e.hire_date AS "hireDate",
            e.base_salary AS "baseSalary",
            e.email,
            e.role,
            e.active,
            b.branch_id AS "branchId",
            b.name AS "branchName",
            b.address AS "branchAddress",
            b.phone AS "branchPhone"
        FROM employee e
        INNER JOIN branch b ON b.branch_id = e.branch_id
        WHERE e.employee_id = $1
    `, [employeeId]);

    return result.rows[0] ?? null;
}

export async function findPayrollPerformanceByEmployeeId(employeeId) {
    const result = await pool.query(`
        SELECT
            COUNT(pd.payroll_detail_id)::INTEGER AS "payrollCount",
            COALESCE(SUM(pd.gross_salary), 0) AS "totalGrossSalary",
            COALESCE(SUM(pd.net_salary), 0) AS "totalNetSalary",
            COALESCE(AVG(pd.net_salary), 0) AS "averageNetSalary",
            MAX(p.end_date) AS "lastPayrollPeriodEnd",
            MAX(p.payment_date) AS "lastPaymentDate"
        FROM payroll_detail pd
        INNER JOIN payroll p ON p.payroll_id = pd.payroll_id
        WHERE pd.employee_id = $1
          AND p.status IN ('PROCESSED', 'PAID')
    `, [employeeId]);

    return result.rows[0];
}

export async function findActiveEmployeesForPayroll(client) {
    const result = await client.query(`
        SELECT
            e.employee_id AS "employeeId",
            e.full_name AS "fullName",
            e.base_salary AS "baseSalary"
        FROM employee e
        WHERE e.active = TRUE
        ORDER BY e.employee_id ASC
    `);

    return result.rows;
}

export async function findPayrollByPeriod(client, startDate, endDate) {
    const result = await client.query(`
        SELECT payroll_id AS "payrollId"
        FROM payroll
        WHERE start_date = $1 AND end_date = $2
        FOR UPDATE
    `, [startDate, endDate]);

    return result.rows[0] ?? null;
}

export async function createPayroll(client, { startDate, endDate, paymentDate }) {
    const result = await client.query(`
        INSERT INTO payroll (start_date, end_date, payment_date, status)
        VALUES ($1, $2, $3, 'PROCESSED')
        RETURNING
            payroll_id AS "payrollId",
            start_date AS "startDate",
            end_date AS "endDate",
            payment_date AS "paymentDate",
            status
    `, [startDate, endDate, paymentDate]);

    return result.rows[0];
}

export async function createPayrollDetail(client, payrollId, employeeId, amounts) {
    const result = await client.query(`
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING payroll_detail_id AS "payrollDetailId"
    `, [
        payrollId,
        employeeId,
        amounts.grossSalary,
        amounts.isssDeduction,
        amounts.afpDeduction,
        amounts.incomeTax,
        amounts.otherDeductions,
        amounts.netSalary
    ]);

    return result.rows[0];
}

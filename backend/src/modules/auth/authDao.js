import { pool } from "../../config/database.js";

export async function authenticateEmployee(email, password) {
    const result = await pool.query(
         `SELECT employee_id AS "employeeId",
                 email,
                 role,
                 branch_id AS "branchId",
                 full_name AS "fullName",
                 job_title AS "jobTitle"
          FROM employee
          WHERE email = $1
            AND active = TRUE
            AND password_hash = crypt($2, password_hash)`,
        [email, password]
    );

    return result.rows[0] ?? null;
}

export async function findActiveEmployeeById(employeeId) {
    const result = await pool.query(
         `SELECT employee_id AS "employeeId",
                 email,
                 role,
                 branch_id AS "branchId",
                 full_name AS "fullName",
                 job_title AS "jobTitle"
          FROM employee
          WHERE employee_id = $1
            AND active = TRUE`,
        [employeeId]
    );

    return result.rows[0] ?? null;
}

export async function findActiveBranchById(branchId) {
    const result = await pool.query(
        `SELECT branch_id AS "branchId"
         FROM branch
         WHERE branch_id = $1
           AND active = TRUE`,
        [branchId]
    );

    return result.rows[0] ?? null;
}

export async function findEmployeeByEmail(email) {
    const result = await pool.query(
        `SELECT employee_id AS "employeeId",
                active
         FROM employee
         WHERE email = $1`,
        [email]
    );

    return result.rows[0] ?? null;
}

export async function createEmployee(employee) {
    const result = await pool.query(
        `INSERT INTO employee (
            branch_id,
            email,
            password_hash,
            role,
            full_name,
            job_title,
            hire_date,
            base_salary
         )
         VALUES (
            $1,
            $2,
            crypt($3, gen_salt('bf')),
            $4,
            $5,
            $6,
            $7,
            $8
         )
         RETURNING employee_id AS "employeeId",
                   email,
                   role,
                   branch_id AS "branchId",
                   full_name AS "fullName",
                   job_title AS "jobTitle",
                   hire_date AS "hireDate",
                   base_salary AS "baseSalary",
                   active,
                   created_at AS "createdAt"`,
        [
            employee.branchId,
            employee.email,
            employee.password,
            employee.role,
            employee.fullName,
            employee.jobTitle,
            employee.hireDate,
            employee.baseSalary
        ]
    );

    return result.rows[0];
}


const ISSS_RATE = 0.03;
const ISSS_BIWEEKLY_CAP = 15;
const AFP_RATE = 0.0725;

function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateIncomeTax(taxableBase) {
    if (taxableBase <= 275) {
        return 0;
    }

    if (taxableBase <= 447.62) {
        return (taxableBase - 275) * 0.10 + 8.83;
    }

    if (taxableBase <= 1019.05) {
        return (taxableBase - 447.62) * 0.20 + 30.00;
    }

    return (taxableBase - 1019.05) * 0.30 + 144.28;
}

export function calculateBiweeklyPayroll(
    baseSalary,
    otherDeductions = 0,
    bonus = 0
) {
    const monthlySalary = Number(baseSalary);
    const additionalDeductions = Number(otherDeductions);
    const employeeBonus = Number(bonus);

    if (!Number.isFinite(monthlySalary) || monthlySalary < 0) {
        throw new Error("El salario base debe ser un monto válido.");
    }

    if (!Number.isFinite(additionalDeductions) || additionalDeductions < 0) {
        throw new Error("Las otras deducciones deben ser un monto válido.");
    }

    if (!Number.isFinite(employeeBonus) || employeeBonus < 0) {
        throw new Error("El bono debe ser un monto válido.");
    }

    const baseBiweeklySalary = roundMoney(monthlySalary / 2);
    const bonusAmount = roundMoney(employeeBonus);
    const grossSalary = roundMoney(baseBiweeklySalary + bonusAmount);

    const isssDeduction = roundMoney(
        Math.min(grossSalary * ISSS_RATE, ISSS_BIWEEKLY_CAP)
    );

    const afpDeduction = roundMoney(grossSalary * AFP_RATE);

    const taxableBase = roundMoney(
        grossSalary - isssDeduction - afpDeduction
    );

    const incomeTax = roundMoney(calculateIncomeTax(taxableBase));

    const netSalary = roundMoney(
        grossSalary -
        isssDeduction -
        afpDeduction -
        incomeTax -
        additionalDeductions
    );

    if (netSalary < 0) {
        throw new Error(
            "Las deducciones superan el salario disponible del empleado."
        );
    }

    return {
        baseBiweeklySalary,
        bonusAmount,
        grossSalary,
        isssDeduction,
        afpDeduction,
        incomeTax,
        otherDeductions: roundMoney(additionalDeductions),
        netSalary
    };
}

import { resolveBranchId } from "../../../utils/branchAccess.js";
import { getDashboardService } from "./reportsService.js";

export async function getDashboardController(req, res) {
    const dashboard = await getDashboardService(resolveBranchId(req, req.query.branchId));

    return res.status(200).json({
        success: true,
        data: dashboard
    });
}

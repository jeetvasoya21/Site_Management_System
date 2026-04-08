import Finance from "../models/finance.model.js";

const upsertFinanceRecord = async (filter, payload) =>
  Finance.findOneAndUpdate(
    filter,
    {
      ...payload,
      paymentStatus: payload.paymentStatus || "Pending",
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

export const syncAttendanceFinance = async ({ attendance, worker }) => {
  if (!attendance?.laborCost) {
    await Finance.deleteOne({ attendanceId: attendance._id });
    return null;
  }

  return upsertFinanceRecord(
    { attendanceId: attendance._id },
    {
      projectId: attendance.projectId,
      costCategory: "Labor",
      date: attendance.date,
      amount: attendance.laborCost,
      description: `Attendance labor for ${worker?.name || "worker"}`,
      source: "attendance",
      workerId: attendance.workerId,
      attendanceId: attendance._id,
      notes: `Rate ${attendance.usedRate || 0} (${attendance.usedRateType || "N/A"})`,
    }
  );
};

export const syncProcurementFinance = async ({ purchaseOrder }) =>
  upsertFinanceRecord(
    { procurementId: purchaseOrder._id },
    {
      projectId: purchaseOrder.projectId,
      costCategory: "Material",
      date: purchaseOrder.createdAt || new Date(),
      amount: purchaseOrder.totalCost,
      description: `Procurement ${purchaseOrder._id}`,
      source: "procurement",
      procurementId: purchaseOrder._id,
      vendorId: purchaseOrder.vendorId,
      itemId: purchaseOrder.itemId,
    }
  );

export const syncMaterialIssueFinance = async ({ materialIssue, item }) =>
  upsertFinanceRecord(
    { materialIssueId: materialIssue._id },
    {
      projectId: materialIssue.projectId,
      costCategory: "Material",
      date: materialIssue.issuedAt,
      amount: Number(materialIssue.quantity) * Number(item.unitCost),
      description: `Material issue: ${item.itemName} (${materialIssue.quantity} ${item.uom})`,
      source: "material_issue",
      materialIssueId: materialIssue._id,
      itemId: materialIssue.itemId,
      taskId: materialIssue.taskId || null,
    }
  );

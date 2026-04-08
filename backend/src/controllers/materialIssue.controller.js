import MaterialIssue from "../models/materialIssue.model.js";
import Item from "../models/item.model.js";
import Task from "../models/task.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { syncMaterialIssueFinance } from "../services/financeAutomation.service.js";

export const getAll = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  const filter = {};
  if (projectId) filter.projectId = projectId;

  const issues = await MaterialIssue.find(filter)
    .populate("projectId", "projectName")
    .populate("taskId", "taskName")
    .populate("itemId", "itemName uom unitCost")
    .populate("issuedBy", "name")
    .sort({ issuedAt: -1 });

  res.json({ success: true, data: issues });
});

export const create = asyncHandler(async (req, res) => {
  const { itemId, quantity, taskId } = req.body;
  const qty = Number(quantity);

  const item = await Item.findById(itemId);
  if (!item) {
    throw new AppError("Item not found", 404);
  }
  if (item.currentStock < qty) {
    throw new AppError(`Insufficient stock. Available: ${item.currentStock}`, 400);
  }

  item.currentStock = Math.max(0, item.currentStock - qty);
  await item.save();

  const issue = await MaterialIssue.create({
    ...req.body,
    quantity: qty,
    issuedBy: req.user._id,
    issuedAt: new Date(),
  });

  await syncMaterialIssueFinance({ materialIssue: issue, item });

  if (taskId) {
    await Task.findByIdAndUpdate(taskId, {
      $push: { materialsUsed: { itemId, quantity: qty } },
    });
  }

  const populated = await MaterialIssue.findById(issue._id)
    .populate("projectId", "projectName")
    .populate("itemId", "itemName uom")
    .populate("issuedBy", "name");

  res.status(201).json({ success: true, data: populated });
});

import mongoose from "mongoose";
import Finance from "../models/finance.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAll = asyncHandler(async (req, res) => {
  const { projectId, costCategory, paymentStatus } = req.query;
  const filter = {};
  if (projectId) filter.projectId = projectId;
  if (costCategory) filter.costCategory = costCategory;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const records = await Finance.find(filter)
    .populate("projectId", "projectName")
    .populate("workerId", "name")
    .populate("vendorId", "vendorName")
    .populate("itemId", "itemName")
    .sort({ date: -1 });

  res.json({ success: true, data: records });
});

export const create = asyncHandler(async (req, res) => {
  const record = await Finance.create({
    ...req.body,
    source: req.body.source || "manual",
  });

  res.status(201).json({ success: true, data: record });
});

export const update = asyncHandler(async (req, res) => {
  const record = await Finance.findById(req.params.id);
  if (!record) {
    throw new AppError("Finance record not found", 404);
  }

  if (record.source !== "manual") {
    throw new AppError("Automated finance records cannot be edited manually", 409);
  }

  Object.assign(record, req.body);
  await record.save();

  res.json({ success: true, data: record });
});

export const remove = asyncHandler(async (req, res) => {
  const record = await Finance.findById(req.params.id);
  if (!record) {
    throw new AppError("Finance record not found", 404);
  }

  if (record.source !== "manual") {
    throw new AppError("Automated finance records cannot be deleted manually", 409);
  }

  await record.deleteOne();
  res.json({ success: true, message: "Finance record deleted" });
});

export const getProjectSummary = asyncHandler(async (req, res) => {
  const summary = await Finance.aggregate([
    { $group: { _id: "$projectId", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
    {
      $lookup: { from: "projects", localField: "_id", foreignField: "_id", as: "project" },
    },
    { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        projectName: "$project.projectName",
        budget: "$project.budget",
        totalAmount: 1,
        count: 1,
        budgetUtilizationPct: {
          $cond: [
            { $gt: ["$project.budget", 0] },
            { $multiply: [{ $divide: ["$totalAmount", "$project.budget"] }, 100] },
            0,
          ],
        },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  res.json({ success: true, data: summary });
});

export const getCategorySummary = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  const match = {};
  if (projectId) {
    match.projectId = new mongoose.Types.ObjectId(projectId);
  }

  const summary = await Finance.aggregate([
    { $match: match },
    { $group: { _id: "$costCategory", totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { totalAmount: -1 } },
  ]);

  res.json({ success: true, data: summary });
});

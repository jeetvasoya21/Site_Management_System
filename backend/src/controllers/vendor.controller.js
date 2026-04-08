import Vendor from "../models/vendor.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAll = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) filter.vendorName = { $regex: search, $options: "i" };

  const vendors = await Vendor.find(filter).sort({ vendorName: 1 });
  res.json({ success: true, data: vendors });
});

export const getById = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  res.json({ success: true, data: vendor });
});

export const create = asyncHandler(async (req, res) => {
  const vendor = await Vendor.create(req.body);
  res.status(201).json({ success: true, data: vendor });
});

export const update = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  res.json({ success: true, data: vendor });
});

export const remove = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndDelete(req.params.id);
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  res.json({ success: true, message: "Vendor deleted" });
});

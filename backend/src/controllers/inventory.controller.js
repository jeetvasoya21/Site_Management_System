import Item from "../models/item.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAll = asyncHandler(async (req, res) => {
  const { category, search, lowStock } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (search) filter.itemName = { $regex: search, $options: "i" };
  if (lowStock === true) filter.$expr = { $lt: ["$currentStock", "$minStockQty"] };

  const items = await Item.find(filter).sort({ itemName: 1 });
  res.json({ success: true, data: items });
});

export const getById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  res.json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const item = await Item.create(req.body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  res.json({ success: true, data: item });
});

export const addStock = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  item.currentStock += Number(req.body.quantity);
  await item.save();
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) {
    throw new AppError("Item not found", 404);
  }

  res.json({ success: true, message: "Item deleted" });
});

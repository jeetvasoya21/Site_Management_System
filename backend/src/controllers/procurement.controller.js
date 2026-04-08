import PurchaseOrder from "../models/purchaseOrder.model.js";
import Item from "../models/item.model.js";
import Finance from "../models/finance.model.js";
import Notification from "../models/notification.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { syncProcurementFinance } from "../services/financeAutomation.service.js";

export const getAll = asyncHandler(async (req, res) => {
  const { projectId, deliveryStatus } = req.query;
  const filter = {};
  if (projectId) filter.projectId = projectId;
  if (deliveryStatus) filter.deliveryStatus = deliveryStatus;

  const orders = await PurchaseOrder.find(filter)
    .populate("projectId", "projectName")
    .populate("vendorId", "vendorName")
    .populate("itemId", "itemName uom")
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: orders });
});

export const create = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.create({ ...req.body, createdBy: req.user._id });

  await syncProcurementFinance({ purchaseOrder: po });

  await Notification.create({
    type: "procurement_delivery",
    severity: "medium",
    title: "PO created",
    message: "New purchase order created for project.",
  });

  if (po.deliveryStatus === "delivered") {
    await Item.findByIdAndUpdate(po.itemId, { $inc: { currentStock: po.quantity } });
  }

  const populated = await PurchaseOrder.findById(po._id)
    .populate("projectId", "projectName")
    .populate("vendorId", "vendorName")
    .populate("itemId", "itemName uom");

  res.status(201).json({ success: true, data: populated });
});

export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { deliveryStatus } = req.body;
  const po = await PurchaseOrder.findById(req.params.id);
  if (!po) {
    throw new AppError("Purchase order not found", 404);
  }

  const wasDelivered = po.deliveryStatus === "delivered";
  const nowDelivered = deliveryStatus === "delivered";

  po.deliveryStatus = deliveryStatus;
  if (nowDelivered) po.deliveredAt = new Date();
  await po.save();
  await syncProcurementFinance({ purchaseOrder: po });

  if (!wasDelivered && nowDelivered) {
    await Item.findByIdAndUpdate(po.itemId, { $inc: { currentStock: po.quantity } });
    await Notification.create({
      type: "procurement_delivery",
      severity: "low",
      title: "PO delivered",
      message: `Purchase order ${po._id} has been delivered.`,
    });
  }

  res.json({ success: true, data: po });
});

export const remove = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.findByIdAndDelete(req.params.id);
  if (!po) {
    throw new AppError("Purchase order not found", 404);
  }

  await Finance.deleteOne({ procurementId: po._id });

  res.json({ success: true, message: "Purchase order deleted" });
});

import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item ID is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    totalCost: {
      type: Number,
      default: 0,
      min: [0, "Total cost cannot be negative"],
    },
    deliveryStatus: {
      type: String,
      enum: ["ordered", "shipped", "delivered", "cancelled"],
      default: "ordered",
    },
    expectedDelivery: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

purchaseOrderSchema.pre("validate", function (next) {
  this.totalCost = Number(this.quantity || 0) * Number(this.unitPrice || 0);
  next();
});

purchaseOrderSchema.index({ projectId: 1 });
purchaseOrderSchema.index({ deliveryStatus: 1 });
purchaseOrderSchema.index({ vendorId: 1, projectId: 1 });

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrder;

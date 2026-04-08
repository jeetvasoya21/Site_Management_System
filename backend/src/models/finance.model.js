import mongoose from "mongoose";

const financeSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    costCategory: {
      type: String,
      enum: ["Labor", "Material", "Equipment", "Overhead", "Other"],
      required: [true, "Cost category is required"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Overdue", "Cancelled"],
      default: "Pending",
    },
    source: {
      type: String,
      enum: ["manual", "automation", "attendance", "procurement", "material_issue"],
      default: "manual",
    },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", default: null },
    attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", default: null },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", default: null },
    procurementId: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", default: null },
    materialIssueId: { type: mongoose.Schema.Types.ObjectId, ref: "MaterialIssue", default: null },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", default: null },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

financeSchema.index({ projectId: 1 });
financeSchema.index({ costCategory: 1 });
financeSchema.index({ date: -1 });
financeSchema.index({ attendanceId: 1 }, { unique: true, sparse: true });
financeSchema.index({ procurementId: 1 }, { unique: true, sparse: true });
financeSchema.index({ materialIssueId: 1 }, { unique: true, sparse: true });

const Finance = mongoose.model("Finance", financeSchema);
export default Finance;

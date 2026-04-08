import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "Worker ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    status: {
      type: String,
      enum: ["Present", "Half Day", "Absent"],
      required: [true, "Status is required"],
    },
    hoursWorked: {
      type: Number,
      default: 0,
      min: 0,
      max: 24,
    },
    usedRateType: {
      type: String,
      enum: ["Daily", "Hourly"],
      default: "Daily",
    },
    usedRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    laborCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Unique constraint: one attendance record per worker per day
attendanceSchema.index({ projectId: 1, workerId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ projectId: 1 });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;

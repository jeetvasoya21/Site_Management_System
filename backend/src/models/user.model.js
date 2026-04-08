import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const refreshSessionSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: "unknown",
      trim: true,
    },
    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Project_Manager", "Site_Engineer", "Storekeeper", "Worker"],
      default: "Site_Engineer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    refreshSessions: {
      type: [refreshSessionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.pruneExpiredSessions = function () {
  this.refreshSessions = this.refreshSessions.filter(
    (session) => session.expiresAt > new Date()
  );
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

userSchema.index({ role: 1 });
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;

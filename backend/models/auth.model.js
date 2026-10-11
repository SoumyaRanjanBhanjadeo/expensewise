const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const authSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [
        function () {
          return this.provider === "email";
        },
        "Password is required",
      ],
      select: false,
    },
    provider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    avatar: {
      type: String,
      default: null,
    },
    biometricLogin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

authSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

authSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidatePassword, this.password);
};

authSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

authSchema.index({ deletedAt: 1 });

module.exports = mongoose.model("User", authSchema);

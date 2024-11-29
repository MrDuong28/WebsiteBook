const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, default: "", unique: true, required: true },
    phone: { type: String, default: "" },
    username: { type: String, default: "" },
    password: { type: String, required: true },
    role: { type: String, default: "" },
    status: { type: String, default: "noactive" },
    image: {
      type: String,
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);

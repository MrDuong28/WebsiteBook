const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pendingcomplaint",
  },
  image: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const complaintModel = mongoose.model("complaintModel", complaintSchema);
module.exports = complaintModel;

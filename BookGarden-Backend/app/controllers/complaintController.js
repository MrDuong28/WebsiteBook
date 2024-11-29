const complaintModel = require("../models/complaintModel");
const Order = require("../models/order");

// Gửi khiếu nại đơn hàng
const createComplaint = async (req, res) => {
  try {
    const { orderId, reason, description } = req.body;

    // Kiểm tra xem đơn hàng có tồn tại không
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Tạo khiếu nại mới
    const complaint = new complaintModel({
      orderId,
      reason,
      description,
      status: "pending", // Khiếu nại mới sẽ ở trạng thái "đang chờ xử lý"
    });

    await complaint.save();

    res.status(201).json({ message: "Gửi khiếu nại thành công", complaint });
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

module.exports = { createComplaint };

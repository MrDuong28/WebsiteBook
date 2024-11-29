const express = require("express");
const router = express.Router();
const complaintModel = require("../models/complaintModel"); // Đảm bảo bạn import đúng mô hình

router.get("/complaint/:id", async (req, res) => {
  try {
    const complaint = await complaintModel.findOne({
      orderId: req.params.orderId,
    });
    if (!complaint) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khiếu nại với đơn hàng này" });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu khiếu nại" });
  }
});

module.exports = router;

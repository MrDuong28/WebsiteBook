const OrderModel = require("../models/order");
const _const = require("../config/constant");
const jwt = require("jsonwebtoken");
const Product = require("../models/product");
const User = require("../models/user");
const nodemailer = require("nodemailer");
require("dotenv").config();

const orderController = {
  getAllOrder: async (req, res) => {
    try {
      const page = req.body.page || 1;
      const limit = req.body.limit || 10;

      const options = {
        page: page,
        limit: limit,
        populate: "user",
      };

      const orderList = await OrderModel.paginate({}, options);
      res.status(200).json({ data: orderList });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getOrderById: async (req, res) => {
    try {
      const data = await OrderModel.findById(req.params.id).populate({
        path: "products.product",
      });
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  createOrder: async (req, res) => {
    try {
      const insufficientStockProducts = [];

      // Tạo đơn hàng mới
      const order = new OrderModel({
        user: req.body.userId,
        products: req.body.products,
        description: req.body.description,
        orderTotal: req.body.orderTotal,
        billing: req.body.billing,
        address: req.body.address,
        status: req.body.status,
      });

      // Kiểm tra tồn kho sản phẩm
      for (const productItem of req.body.products) {
        const productId = productItem.product;
        const stock = productItem.stock;

        // Tìm sản phẩm trong cơ sở dữ liệu
        const product = await Product.findById(productId);

        if (!product || product.stock < stock) {
          insufficientStockProducts.push({
            productId,
            stock: product ? product.stock : 0,
          });
        }

        if (insufficientStockProducts.length > 0) {
          return res.status(200).json({
            error: "Insufficient stock for one or more products.",
            insufficientStockProducts,
          });
        }

        // Cập nhật tồn kho sản phẩm
        if (product) {
          product.stock -= stock;
          await product.save();
        }
      }

      const orderList = await order.save();

      // Lấy thông tin người dùng
      const user = await User.findById(req.body.userId);
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      // Soạn email thông báo
      const emailContent = `
        Xin chào ${user.username || "Khách hàng"},

        Đơn hàng của bạn đã được đặt thành công! Chi tiết đơn hàng:

        - Tổng giá trị: ${req.body.orderTotal}
        - Địa chỉ giao hàng: ${req.body.address}
        - Phương thức thanh toán: ${req.body.billing}

        Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi!

        Trân trọng,
        Đội ngũ cửa hàng
      `;

      // Cấu hình Nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // Đọc email từ biến môi trường
          pass: process.env.EMAIL_PASS, // Đọc mật khẩu từ biến môi trường
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Xác nhận đặt hàng thành công",
        text: emailContent,
      };

      // Gửi email
      await transporter.sendMail(mailOptions);

      // Trả về phản hồi thành công
      res.status(200).json(orderList);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const orderList = await OrderModel.findByIdAndDelete(req.params.id);
      if (!orderList) {
        return res.status(200).json("Order does not exist");
      }
      res.status(200).json("Delete order success");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateOrder: async (req, res) => {
    const id = req.params.id;
    const { status, description, address } = req.body;

    try {
      // Cập nhật trạng thái đơn hàng
      const order = await OrderModel.findByIdAndUpdate(
        id,
        { status, description, address },
        { new: true }
      ).populate("user"); // Lấy thông tin người dùng liên quan

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Lấy thông tin người dùng
      const user = order.user;
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      // Soạn nội dung email thông báo
      const emailContent = `
        Xin chào ${user.username || "Khách hàng"},
        
        Đơn hàng của bạn đã được cập nhật trạng thái mới:
        
        - Mã đơn hàng: ${order._id}
        - Trạng thái hiện tại: ${status}
        
        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
        
        Trân trọng,
        BookGarden
      `;

      // Cấu hình Nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // Đọc email từ biến môi trường
          pass: process.env.EMAIL_PASS, // Đọc mật khẩu từ biến môi trường
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Cập nhật trạng thái đơn hàng",
        text: emailContent,
      };

      // Gửi email
      await transporter.sendMail(mailOptions);

      // Trả về phản hồi thành công
      res.status(200).json(order);
    } catch (err) {
      console.error("Error updating order:", err.message);
      res.status(500).json(err);
    }
  },

  searchOrderByName: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
      populate: "user",
    };

    const name = req.query.name;

    try {
      const orderList = await OrderModel.paginate(
        { billing: { $regex: `.*${name}.*`, $options: "i" } },
        options
      );

      res.status(200).json({ data: orderList });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getOrderByUser: async (req, res) => {
    try {
      const decodedToken = jwt.verify(
        req.headers.authorization,
        _const.JWT_ACCESS_KEY
      );
      const orders = await OrderModel.find({
        user: decodedToken.user._id,
      }).populate("products.product"); // Chỉ lấy tên và giá sản phẩm
      res.status(200).json({ data: orders });
    } catch (err) {
      res.status(401).send("Unauthorized");
    }
  },
};

module.exports = orderController;

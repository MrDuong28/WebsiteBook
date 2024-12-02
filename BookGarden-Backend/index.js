const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();
const path = require("path");
const DB_MONGO = require("./app/config/db.config");
const _CONST = require("./app/config/constant");
// const { sendEmailNotification } = require('./app/kafka/consumer');
const nodemailer = require("nodemailer");
require("dotenv").config();
//router
const authRoute = require("./app/routers/auth");
const userRoute = require("./app/routers/user");
const productRoute = require("./app/routers/product");
const categoryRoute = require("./app/routers/category");
const authorRoute = require("./app/routers/author");
const pulisherRoute = require("./app/routers/pulisher");
const uploadFileRoute = require("./app/routers/uploadFile");
const newsRoute = require("./app/routers/news");
const orderRoute = require("./app/routers/order");
const statisticalRoute = require("./app/routers/statistical");
const paymentRoute = require("./app/routers/paypal");
const contactRoute = require("./app/routers/contact");
const complaintModel = require("./app/models/complaintModel");
const { request } = require("http");
const order = require("./app/models/order");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

mongoose
  .connect(DB_MONGO.URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB.");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/author", authorRoute);
app.use("/api/pulisher", pulisherRoute);
app.use("/api/uploadFile", uploadFileRoute);
app.use("/api/news", newsRoute);
app.use("/api/statistical", statisticalRoute);
app.use("/api/order", orderRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/contacts", contactRoute);
app.use("/uploads", express.static("uploads"));
// sendEmailNotification();
app.get("/api/complaint/:id", async (req, res) => {
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
app.get("/api/complaint", async (req, res) => {
  try {
    const complaint = await complaintModel
      .find({})
      .populate([{ path: "user" }, { path: "orderId" }]);
    if (!complaint) {
      return res.status(404).json({ message: "Không tìm thấy khiếu nại " });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu khiếu nại" });
  }
});
app.post("/api/create-complaint", async (req, res) => {
  try {
    const complaint = await complaintModel.create(req.body);
    await order.findByIdAndUpdate(
      req.body.orderId,
      {
        $set: {
          status: "pendingcomplaint",
        },
      },
      {
        new: true,
      }
    );
    return res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/api/update-complaint/:id", async (req, res) => {
  try {
    const data = await complaintModel.findById(req.params.id).populate("user");
    const complaint = await complaintModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: req.query.status,
        },
      },
      {
        new: true,
      }
    );
    if (req.query.status) {
      await order.findByIdAndUpdate(
        data.orderId,
        {
          $set: {
            status: req.query.status,
          },
        },
        {
          new: true,
        }
      );
    }
    // Route DELETE để hủy khiếu nại
    app.delete("/api/complaint/:id", async (req, res) => {
      try {
        const complaint = await complaintModel.findById(req.params.id); // Tìm khiếu nại theo id

        if (!complaint) {
          return res.status(404).json({ message: "Không tìm thấy khiếu nại" });
        }

        // Kiểm tra trạng thái của khiếu nại, chỉ cho phép hủy khiếu nại với trạng thái 'pendingcomplaint'
        if (complaint.status !== "pendingcomplaint") {
          return res.status(400).json({
            message:
              "Không thể hủy khiếu nại này vì trạng thái không phải 'pendingcomplaint'",
          });
        }

        // Cập nhật trạng thái đơn hàng tương ứng (nếu có)
        await order.findByIdAndUpdate(
          complaint.orderId,
          {
            $set: {
              status: "completed", // Hoặc trạng thái nào đó tương ứng với việc hủy khiếu nại
            },
          },
          {
            new: true,
          }
        );

        // Xóa khiếu nại
        await complaint.remove();

        res.status(200).json({ message: "Hủy khiếu nại thành công" });
      } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa khiếu nại", error });
      }
    });

    const emailContent = `
        Xin chào ${"Khách hàng"},

        Khiếu nại của bạn đã được cập nhật trạng thái mới: ${req.query.status}

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
      to: data.user.email,
      subject: "Cập nhật trạng thái khiếu nại",
      text: emailContent,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);
    return res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
const PORT = process.env.PORT || _CONST.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

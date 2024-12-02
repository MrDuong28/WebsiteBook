const UserModel = require("../models/user");
const bcrypt = require("bcryptjs");
const _const = require("../config/constant");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const userController = {
  getAllUser: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
    };

    try {
      const users = await UserModel.paginate({}, options);
      res.status(200).json({ data: users });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  createUser: async (req, res) => {
    try {
      const email = await UserModel.findOne({ email: req.body.email });
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      if (!email) {
        const newUser = await new UserModel({
          email: req.body.email,
          phone: req.body.phone,
          username: req.body.username,
          password: hashed,
          role: req.body.role,
          status: req.body.status,
        });

        const user = await newUser.save();
        res.status(200).json(user);
      } else {
        res.status(400).json("User already exists");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await UserModel.findByIdAndRemove(req.params.id);
      res.status(200).json("Delete success");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateUser: async (req, res) => {
    const _id = req.params.id;
    const { username, email, password, role, phone, status } = req.body;
    try {
      const user = await UserModel.findByIdAndUpdate(
        _id,
        { username, email, password, role, phone, status },
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json("Update success");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },

  logout: async (req, res) => {
    try {
    } catch (err) {
      res.status(500).json(err);
    }
  },

  searchUserByEmail: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
    };

    const email = req.query.email;

    try {
      const productList = await UserModel.paginate(
        { email: { $regex: `.*${email}.*`, $options: "i" } },
        options
      );

      res.status(200).json({ data: productList });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getProfile: async (req, res) => {
    jwt.verify(
      req.headers.authorization,
      _const.JWT_ACCESS_KEY,
      (err, decodedToken) => {
        if (err) {
          // Xử lý lỗi
          res.status(401).send("Unauthorized");
        } else {
          res.status(200).json(decodedToken);
        }
      }
    );
  },

  getProfileById: async (req, res) => {
    const userId = req.params.id; // Lấy userId từ request params

    try {
      const user = await UserModel.findById(userId); // Tìm kiếm người dùng theo userId
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Trả về thông tin người dùng nếu tìm thấy
      res.status(200).json({ data: user });
    } catch (err) {
      // Xử lý lỗi nếu có
      res.status(500).json({ message: err.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const token = crypto.randomBytes(20).toString("hex");
      console.log(req.body.email);

      const user = await UserModel.findOne({ email: req.body.email });
      console.log(user);

      if (!user) {
        return res
          .status(400)
          .json({ message: "Unregistered account!", status: false });
      }

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // Thời gian hết hạn sau 1 giờ
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",

        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Reset Password",
        html: `Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Vui lòng nhấn vào <a href="http://localhost:3500/reset-password/${token}">Reset Password</a> để đặt lại mật khẩu mới.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ message: "Failed to send reset email!", status: false });
        }
        console.log(`Email sent: ${info.response}`);
        res.status(200).json({ message: "Reset email sent!", status: true });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  resetPassword: async (req, res) => {
    try {
      const token = req.body.token;

      // Tìm mã xác thực trong cơ sở dữ liệu
      const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired token!", status: false });
      }

      // Cập nhật mật khẩu cho người dùng
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res
        .status(200)
        .json({ message: "Password reset successful!", status: true });
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  changeUserRole: async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    try {
      // Kiểm tra xem người dùng có tồn tại không
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Cập nhật vai trò cho người dùng
      user.role = role;
      await user.save();

      return res
        .status(200)
        .json({ message: "Role updated successfully", user });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Failed to update role", error: err });
    }
  },
};

module.exports = userController;

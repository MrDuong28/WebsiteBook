const ProductModel = require("../models/product");
const CategoryModel = require("../models/category");
const AuthorModel = require("../models/author");
const PulisherModel = require("../models/pulisher");
const OrderModel = require("../models/order");
const jwt = require("jsonwebtoken");
const _const = require("../config/constant");

// Hàm tính cosine similarity giữa hai sản phẩm
const calculateCosineSimilarity = (product1, product2) => {
  // Chuyển đổi các đặc trưng của sản phẩm thành vector
  const vector1 = [product1.price]; // Sử dụng giá làm đặc trưng
  const vector2 = [product2.price];

  // Tính tổng tích của hai vector
  let dotProduct = 0;
  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
  }

  // Tính độ dài của vector
  const magnitude1 = Math.sqrt(
    vector1.reduce((sum, value) => sum + Math.pow(value, 2), 0)
  );
  const magnitude2 = Math.sqrt(
    vector2.reduce((sum, value) => sum + Math.pow(value, 2), 0)
  );

  // Tính cosine similarity
  const similarity = dotProduct / (magnitude1 * magnitude2);
  return similarity;
};

const productController = {
  getAllProduct: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
      populate: [
        { path: "category", select: "name" }, // Populate category
        { path: "author", select: "name" }, // Populate author
        { path: "pulisher", select: "name" }, // Populate author
      ],
    };

    try {
      const products = await ProductModel.paginate({}, options);
      res.status(200).json({ data: products });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getProductById: (req, res) => {
    try {
      res.status(200).json(res);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  createProduct: async (req, res) => {
    const {
      name,
      price,
      description,
      category,
      image,
      salePrice,
      year,
      stock,
      slide,
      pages,
      weight,
      size,
      form,
      author,
      pulisher,
      status,
    } = req.body;

    const product = new ProductModel({
      name,
      price,
      description,
      category,
      image,
      salePrice,
      year,
      stock,
      slide,
      pages,
      weight,
      size,
      form,
      author,
      pulisher,
      status,
    });

    try {
      // Kiểm tra category
      const checkCategory = await CategoryModel.findById(category);
      if (!checkCategory) {
        return res.status(400).json({ error: "Invalid category" });
      }
      // Kiểm tra author
      const checkAuthor = await AuthorModel.findById(author);
      if (!checkAuthor) {
        return res.status(400).json({ error: "Invalid author" });
      }
      // Kiểm tra pulisher
      const checkPulisher = await PulisherModel.findById(pulisher);
      if (!checkPulisher) {
        return res.status(400).json({ error: "Invalid pulisher" });
      }
      // Lưu sản phẩm nếu tất cả đều hợp lệ
      const newProduct = await product.save();
      return res.status(200).json(newProduct);
    } catch (err) {
      return res.status(500).json({ error: "Something broke!" });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const product = await ProductModel.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(200).json("Product does not exist");
      }
      res.status(200).json("Delete product success");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateProduct: async (req, res) => {
    const id = req.params.id;
    const {
      name,
      price,
      description,
      category,
      image,
      salePrice,
      year,
      stock,
      pages,
      weight,
      size,
      form,
      author,
      pulisher,
      status,
    } = req.body;

    try {
      const product = await ProductModel.findByIdAndUpdate(
        id,
        {
          name,
          price,
          description,
          category,
          image,
          salePrice,
          year,
          stock,
          pages,
          weight,
          size,
          form,
          pulisher,
          author,
          status,
        },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  searchCateByName: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
    };

    const name = req.query.name;

    try {
      const productList = await ProductModel.paginate(
        { name: { $regex: `.*${name}.*`, $options: "i" } },
        options
      );

      res.status(200).json({ data: productList });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  searchAuthorByName: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
    };

    const name = req.query.name;

    try {
      const productList = await ProductModel.paginate(
        { name: { $regex: `.*${name}.*`, $options: "i" } },
        options
      );

      res.status(200).json({ data: productList });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createReviews: async (req, res) => {
    try {
      const { comment, rating } = req.body;
      const { user } = req;
      const productId = req.params.id;
      const decodedToken = jwt.verify(
        req.headers.authorization,
        _const.JWT_ACCESS_KEY
      );
      // Kiểm tra xem người dùng đã đặt sản phẩm này chưa
      const order = await OrderModel.findOne({
        user: decodedToken.user._id,
        "products.product": productId,
      });
      if (!order) {
        return res.status(201).json("Bạn chưa mua sản phẩm này");
      }

      // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
      const existingReview = await ReviewModel.findOne({
        user: decodedToken.user._id,
        product: productId,
      });
      if (existingReview) {
        return res.status(201).json("Bạn đã đánh giá sản phẩm này");
      }

      // Tạo mới đánh giá sản phẩm
      const review = new ReviewModel({
        user: decodedToken.user._id,
        product: productId,
        comment,
        rating,
      });
      await review.save();

      res.status(201).json("thành công");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  },

  // Hàm tính cosine similarity giữa hai sản phẩm
  calculateCosineSimilarity: (product1, product2) => {
    // Chuyển đổi các đặc trưng của sản phẩm thành vector
    const vector1 = [product1.price, product1.stock]; // Ví dụ: sử dụng giá và số lượng làm đặc trưng
    const vector2 = [product2.price, product2.stock];

    // Tính tổng tích của hai vector
    let dotProduct = 0;
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
    }

    // Tính độ dài của vector
    const magnitude1 = Math.sqrt(
      vector1.reduce((sum, value) => sum + Math.pow(value, 2), 0)
    );
    const magnitude2 = Math.sqrt(
      vector2.reduce((sum, value) => sum + Math.pow(value, 2), 0)
    );

    // Tính cosine similarity
    const similarity = dotProduct / (magnitude1 * magnitude2);
    return similarity;
  },

  // API khuyến nghị sản phẩm dựa trên sản phẩm đã chọn
  recommendProducts: async (req, res) => {
    try {
      const productId = req.params.id;

      // Tìm sản phẩm đã chọn trong CSDL
      const selectedProduct = await ProductModel.findById(productId);

      if (!selectedProduct) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }

      // Lấy tất cả sản phẩm khác trong CSDL
      const allProducts = await ProductModel.find({ _id: { $ne: productId } });

      // Tính toán cosine similarity giữa sản phẩm đã chọn và các sản phẩm khác
      const recommendations = allProducts.map((product) => ({
        product,
        similarity: calculateCosineSimilarity(selectedProduct, product),
      }));

      // Sắp xếp danh sách khuyến nghị theo độ tương đồng giảm dần
      recommendations.sort((a, b) => b.similarity - a.similarity);

      // Chỉ lấy top 5 sản phẩm khuyến nghị
      const topRecommendations = recommendations
        .slice(0, 5)
        .map((item) => item.product);

      return res.json({ recommendations: topRecommendations });
    } catch (error) {
      console.error("Error recommending products:", error);
      return res.status(500).json({ message: "Lỗi máy chủ" });
    }
  },

  getSearchPrice: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;
    const minPrice = req.body.minPrice; // Giá tối thiểu
    const maxPrice = req.body.maxPrice; // Giá tối đa

    const query = {};

    // Thêm điều kiện tìm kiếm theo giá vào query nếu có giá trị minPrice và maxPrice
    if (minPrice !== undefined && maxPrice !== undefined) {
      query.$and = [
        { price: { $gte: minPrice } },
        { price: { $lte: maxPrice } },
      ];
    }

    const options = {
      page: page,
      limit: limit,
      populate: [
        { path: "category", select: "name" }, // Populate category với trường 'name'
        { path: "author", select: "name" }, // Populate author với trường 'name'
        { path: "pulisher", select: "name" }, // Populate pulisher với trường 'name'
      ],
    };

    try {
      const products = await ProductModel.paginate(query, options);
      res.status(200).json({ data: products });
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = productController;

const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      default: 0,
    },
    year: {
      type: Number,
      require: true,
    },
    stock: {
      type: Number,
      require: true,
    },
    pages: {
      type: Number,
      require: true,
    },
    weight: {
      type: Number,
      require: true,
    },
    size: {
      type: String,
      require: true,
    },
    form: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
    },
    pulisher: {
      type: String,
    },
    slide: {
      type: [String],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    pulisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pulisher",
      required: true,
    },
    // url_book: {
    //   type: String,
    // },
    // audioUrl: {
    //   type: String,
    // },
    status: {
      type: String,
      enum: ["Available", "Unvailable"],
      default: "Available",
    },
  },
  { timestamps: true },
  { collection: "product" }
);

ProductSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Product", ProductSchema);

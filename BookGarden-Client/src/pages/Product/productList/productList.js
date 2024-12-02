import React, { useEffect, useState } from "react";
import { Spin, Card, List, Breadcrumb, Slider } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import { useHistory, useParams, useRouteMatch } from "react-router-dom";
import productApi from "../../../apis/productApi";
import triangleTopRight from "../../../assets/icon/Triangle-Top-Right.svg";
import { numberWithCommas } from "../../../utils/common";
import "./productList.css"; // Giữ lại nếu cần thiết

const ProductList = () => {
  const [productDetail, setProductDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000000]); // Default price range from 0 to 1,000,000

  const { id } = useParams();
  const history = useHistory();
  const match = useRouteMatch();

  // Xử lý điều hướng khi nhấn vào sản phẩm
  const handleReadMore = (productId) => {
    history.push("/product-detail/" + productId);
    window.scrollTo(0, 0);
  };

  // Xử lý khi chọn danh mục
  const handleCategoryDetails = async (categoryId) => {
    const newPath = match.url.replace(/\/[^/]+$/, `/${categoryId}`);
    history.push(newPath);
    window.scrollTo(0, 0);
    setSelectedCategory(categoryId); // Cập nhật danh mục đã chọn

    fetchProducts(categoryId, priceRange); // Gọi lại API với priceRange
  };

  // Fetch sản phẩm với các tham số lọc
  const fetchProducts = async (categoryId = id, priceRange) => {
    try {
      setLoading(true);
      const response = await productApi.getProductsByCategory(
        {
          page: 1,
          limit: 100,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
        },
        categoryId
      );
      setProductDetail(response?.data?.docs || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  // Lấy dữ liệu sản phẩm và danh mục ban đầu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách sản phẩm từ API (không lọc theo danh mục)
        const productResponse = await productApi.getListProducts({
          page: 1,
          limit: 100, // Lấy 100 sản phẩm hoặc có thể thay đổi theo ý muốn
        });

        // Lấy danh mục sản phẩm từ API
        const categoryResponse = await productApi.getCategory({
          limit: 50,
          page: 1,
        });

        // Cập nhật dữ liệu vào state
        setProductDetail(productResponse.data.docs || []);
        setCategories(categoryResponse.data.docs || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch products or categories:", error);
        setLoading(false);
      }
    };

    // Kiểm tra nếu có `id` trong URL để tải sản phẩm theo danh mục ngay từ đầu
    if (id) {
      handleCategoryDetails(id); // Nếu có ID danh mục trong URL, gọi API để lấy sản phẩm theo danh mục đó
    } else {
      fetchData(); // Nếu không có danh mục, tải sản phẩm mặc định
    }
    window.scrollTo(0, 0);
  }, [id]); // Gọi lại khi ID trong URL thay đổi

  // Thay đổi mức giá lọc
  const handlePriceChange = (value) => {
    setPriceRange(value);
    fetchProducts(selectedCategory, value); // Gọi lại API với giá lọc mới
  };

  return (
    <div>
      <Spin spinning={loading}>
        <Card className="container_details">
          {/* Breadcrumb */}
          <div className="ml-2 mb-4 mt-2">
            <Breadcrumb>
              <Breadcrumb.Item href="http://localhost:3500/home">
                Trang chủ
              </Breadcrumb.Item>
              <Breadcrumb.Item>Sản phẩm</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/* Layout chứa Sidebar và Content */}
          <div className="flex flex-col lg:flex-row mt-5">
            {/* Bộ lọc và Danh mục - Bên trái */}
            <div
              className="w-full lg:w-1/4 p-5 mb-6 lg:mb-0 bg-gray-50 rounded-lg shadow-md"
              style={{ backgroundColor: "#f8f8f8" }}
            >
              {/* Danh mục */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-6">Danh mục</h3>
                {categories.map((category) => (
                  <div
                    key={category._id}
                    onClick={() => handleCategoryDetails(category._id)}
                    className={`cursor-pointer p-3 rounded-md bg-white shadow-md hover:bg-green-100 transition-colors mb-4 ${
                      selectedCategory === category._id ? "bg-green-100" : ""
                    }`}
                  >
                    <div className="text-sm font-semibold">{category.name}</div>
                  </div>
                ))}
              </div>

              {/* Bộ lọc theo giá */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4">Lọc theo giá</h3>
                <Slider
                  range
                  min={0}
                  max={1000000}
                  step={10000}
                  defaultValue={priceRange}
                  onChange={handlePriceChange}
                  tipFormatter={(value) => `${numberWithCommas(value)} đ`}
                />
                <div className="text-sm mt-2">
                  <span>{numberWithCommas(priceRange[0])} đ</span> -{" "}
                  <span>{numberWithCommas(priceRange[1])} đ</span>
                </div>
              </div>
            </div>

            {/* Content - Danh sách sản phẩm */}
            <div className="w-full lg:w-3/4 p-2 ">
              <div>
                <List
                  grid={{
                    gutter: 16,
                    column: 4, // Hiển thị 4 cột
                  }}
                  dataSource={productDetail} // Hiển thị các sản phẩm theo danh mục
                  renderItem={(item) => (
                    <List.Item>
                      <div
                        className="show-product"
                        onClick={() => handleReadMore(item._id)}
                      >
                        {item.image ? (
                          <img className="image-product" src={item.image} />
                        ) : (
                          <img
                            className="image-product"
                            src={require("../../../assets/image/NoImageAvailable.jpg")}
                          />
                        )}
                        <div className="wrapper-products">
                          <Paragraph
                            className="title-product"
                            ellipsis={{ rows: 2 }}
                          >
                            {item.name}
                          </Paragraph>
                          {!item?.audioUrl && (
                            <div className="price-amount">
                              <React.Fragment>
                                {item?.salePrice === item?.price ? (
                                  <Paragraph className="price-product">
                                    {numberWithCommas(item.salePrice)} đ
                                  </Paragraph>
                                ) : (
                                  <React.Fragment>
                                    <Paragraph className="price-product">
                                      {item?.salePrice &&
                                        numberWithCommas(item.salePrice)}{" "}
                                      đ
                                    </Paragraph>
                                    <Paragraph className="price-cross">
                                      {item.price &&
                                        numberWithCommas(item.price)}{" "}
                                      đ
                                    </Paragraph>
                                  </React.Fragment>
                                )}
                              </React.Fragment>
                            </div>
                          )}
                        </div>
                      </div>
                      {item?.status === "Unavailable" ||
                      (item?.status === "Discontinued" && !item?.audioUrl) ? (
                        <Paragraph
                          className="badge"
                          style={{ position: "absolute", top: 10, left: 9 }}
                        >
                          {item?.status === "Unavailable" ? (
                            <span>Hết hàng</span>
                          ) : (
                            <span>Ngừng kinh doanh</span>
                          )}
                          <img src={triangleTopRight} alt="Triangle" />
                        </Paragraph>
                      ) : (
                        item?.salePrice !== item?.price && (
                          <Paragraph
                            className="badge"
                            style={{ position: "absolute", top: 10, left: 9 }}
                          >
                            <span>Giảm giá</span>
                            <img src={triangleTopRight} alt="Triangle" />
                          </Paragraph>
                        )
                      )}
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default ProductList;

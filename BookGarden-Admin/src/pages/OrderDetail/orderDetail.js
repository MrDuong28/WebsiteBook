import React, { useState, useEffect } from "react";
import "./orderDetail.css";
import {
  Col,
  Row,
  Typography,
  Spin,
  Button,
  Card,
  Badge,
  Empty,
  Input,
  Space,
  Form,
  Pagination,
  Modal,
  Popconfirm,
  notification,
  BackTop,
  Tag,
  Breadcrumb,
  Select,
  Table,
} from "antd";
import {
  DeleteOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  EditOutlined,
} from "@ant-design/icons";
import orderApi from "../../apis/orderApi";
import { useHistory, useParams } from "react-router-dom";
import { DateTime } from "../../utils/dateTime";
import ProductList from "../ProductList/productList";
import axiosClient from "../../apis/axiosClient";
import { PageHeader } from "@ant-design/pro-layout";
import moment from "moment";
const { Option } = Select;
const { confirm } = Modal;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
const { Title } = Typography;

const OrderDetail = () => {
  const [order, setOrder] = useState([]);
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [total, setTotalList] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const { id } = useParams();

  const history = useHistory();

  const showModal = () => {
    setOpenModalCreate(true);
  };

  const handleOkUser = async (values) => {
    setLoading(true);
    try {
      const categoryList = {
        name: values.name,
        description: values.description,
        slug: values.slug,
      };
      await axiosClient.post("/category", categoryList).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description: "Tạo danh mục thất bại",
          });
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Tạo danh mục thành công",
          });
          setOpenModalCreate(false);
          handleCategoryList();
        }
      });
      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateOrder = async (values) => {
    console.log(values);
    setLoading(true);
    try {
      const categoryList = {
        description: values.description,
        status: values.status,
      };
      await axiosClient.put("/order/" + id, categoryList).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description: "Cập nhật thất bại",
          });
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Cập nhật thành công",
          });
          setOpenModalUpdate(false);
          handleCategoryList();
        }
      });
      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = (type) => {
    if (type === "create") {
      setOpenModalCreate(false);
    } else {
      setOpenModalUpdate(false);
    }
    console.log("Clicked cancel button");
  };

  const handleCategoryList = async () => {
    try {
      await orderApi.getListOrder({ page: 1, limit: 10000 }).then((res) => {
        setTotalList(res.totalDocs);
        setOrder(res.data.docs);
        setLoading(false);
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      await orderApi.deleteOrder(id).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description: "Xóa danh mục thất bại",
          });
          setLoading(false);
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Xóa danh mục thành công",
          });
          setCurrentPage(1);
          handleCategoryList();
          setLoading(false);
        }
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleDetailView = (id) => {
    history.push("/category-detail/" + id);
  };

  const handleEditOrder = (id) => {
    setOpenModalUpdate(true);
    (async () => {
      try {
        const response = await orderApi.getDetailOrder(id);
        console.log(response);
        form2.setFieldsValue({
          status: response.status,
          address: response.address,
          description: response.description,
          orderTotal: response.orderTotal,
          products: response.products,
          user: response.user,
          billing: response.billing,
        });
        console.log(form2);
        setLoading(false);
      } catch (error) {
        throw error;
      }
    })();
  };

  const handleFilter = async (name) => {
    try {
      const res = await orderApi.searchOrder(name);
      setTotalList(res.totalDocs);
      setOrder(res.data.docs);
    } catch (error) {
      console.log("search to fetch category list:" + error);
    }
  };

  function NoData() {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const columns = [
    {
      title: "ID",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Tên",
      dataIndex: "user",
      key: "user",
      render: (text, record) => <a>{text.username}</a>,
    },
    {
      title: "Email",
      dataIndex: "user",
      key: "user",
      render: (text, record) => <a>{text.email}</a>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "orderTotal",
      key: "orderTotal",
      render: (text) => (
        <a>
          {text?.toLocaleString("vi", { style: "currency", currency: "VND" })}
        </a>
      ),
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "billing",
      key: "billing",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (slugs) => (
        <span>
          {slugs === "rejected" ? (
            <Tag style={{ width: 95, textAlign: "center" }} color="red">
              Đã hủy
            </Tag>
          ) : slugs === "approved" ? (
            <Tag
              style={{ width: 95, textAlign: "center" }}
              color="geekblue"
              key={slugs}
            >
              Vận chuyển
            </Tag>
          ) : slugs === "final" ? (
            <Tag color="green" style={{ width: 95, textAlign: "center" }}>
              Đã giao
            </Tag>
          ) : (
            <Tag color="blue" style={{ width: 95, textAlign: "center" }}>
              Đợi xác nhận
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div>
          <Row>
            <Button
              size="small"
              icon={<EditOutlined />}
              style={{ width: 150, borderRadius: 15, height: 30 }}
              onClick={() => handleEditOrder(record._id)}
            >
              {"Chỉnh sửa"}
            </Button>
            <div style={{ marginLeft: 10 }}>
              <Popconfirm
                title="Bạn có chắc chắn xóa đơn hàng này?"
                onConfirm={() => handleDeleteCategory(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  style={{ width: 150, borderRadius: 15, height: 30 }}
                >
                  {"Xóa"}
                </Button>
              </Popconfirm>
            </div>
          </Row>
        </div>
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        await orderApi.getDetailOrder(id).then((res) => {
          console.log(res);
          setTotalList(res.totalDocs);
          setOrder(res);
          setLoading(false);
        });
      } catch (error) {
        console.log("Failed to fetch event list:" + error);
      }
    })();
  }, []);
  return (
    <div>
      <Spin spinning={loading}>
        <div className="container">
          <div style={{ marginTop: 20 }}>
            <Breadcrumb>
              <Breadcrumb.Item href="">
                <HomeOutlined />
              </Breadcrumb.Item>
              <Breadcrumb.Item href="">
                <ShoppingCartOutlined />
                <span>Chi tiết đơn hàng</span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="order-details">
            <h2>Chi tiết đơn hàng</h2>
            <div className="order-info">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Người dùng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng đơn hàng</th>
                    <th>Địa chỉ</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Mô tả</th>
                    <th>Ngày tạo</th>
                    <th>Ngày cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{order._id}</td>
                    <td>{order.user}</td>
                    <td>
                      <div className="order-products">
                        {order?.products?.map((product, index) => (
                          <div key={index} className="product-item">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="product-image"
                            />
                            <div className="product-details">
                              <span className="product-name">
                                {product.name}
                              </span>
                              <span className="product-stock">
                                Số lượng: {product.stock}
                              </span>
                              <div className="product-price">
                                Đơn giá: {product.salePrice * product.stock}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td>{order.orderTotal}</td>
                    <td>{order.address}</td>
                    <td>{order.billing}</td>
                    <td>{order.status}</td>
                    <td>{order.description}</td>
                    <td>
                      {moment(order.createdAt).format("DD/MM/YYYY HH:mm")}
                    </td>
                    <td>
                      {moment(order.updatedAt).format("DD/MM/YYYY HH:mm")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <BackTop style={{ textAlign: "right" }} />
      </Spin>
    </div>
  );
};

export default OrderDetail;

import {
  Breadcrumb,
  Button,
  Card,
  Divider,
  Modal,
  Spin,
  Table,
  Tag,
  notification,
} from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import axiosClient from "../../../apis/axiosClient";
import eventApi from "../../../apis/eventApi";
import productApi from "../../../apis/productApi";
import "./cartHistory.css";

const CartHistory = () => {
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const complaints = searchParams.get("complaints");
  const handleCancelOrder = (order) => {
    console.log(order);
    Modal.confirm({
      title: "Xác nhận hủy đơn hàng",
      content: "Bạn có chắc muốn hủy đơn hàng này?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk() {
        handleUpdateOrder(order._id);
      },
    });
  };
  const handleConfirmOrder = async (order) => {
    Modal.confirm({
      title: "Xác nhận đơn hàng",
      content: "Bạn có chắc muốn xác nhận đơn hàng này?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          // Cập nhật trạng thái của đơn hàng
          const updatedOrder = {
            status: "final", // Thay đổi trạng thái thành 'final'
          };

          await axiosClient.put(`/order/${order._id}`, updatedOrder);

          notification["success"]({
            message: "Thông báo",
            description: "Đơn hàng đã được xác nhận thành công!",
          });

          handleList(); // Cập nhật lại danh sách đơn hàng
        } catch (error) {
          notification["error"]({
            message: "Lỗi",
            description: "Đã xảy ra lỗi khi xác nhận đơn hàng.",
          });
        }
      },
    });
  };
  const handleUpdateOrder = async (id) => {
    setLoading(true);
    try {
      const categoryList = {
        description: "Khách hàng hủy đơn hàng!",
        status: "rejected",
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
        }
      });

      handleList();
      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const columns = [
    {
      title: <div className="text-center">Thông tin sản phẩm</div>,
      dataIndex: "products",
      key: "productInfo",
      render: (products) => (
        <div className="">
          {products.map((item, index) => (
            <div key={index} className="product-info">
              <div className="product-item ">
                <img
                  src={item.product?.image}
                  alt={item.product?.name}
                  className="product-image "
                />
              </div>
              <h3 className="product-name-1">{item.product?.name}</h3>
              <div className="product-price">
                Giá gốc:
                {item?.product?.salePrice?.toLocaleString("vi", {
                  style: "currency",
                  currency: "VND",
                })}
              </div>
              <div className="product-stock">Số lượng: {item?.stock}</div>
              <div className="product-total">
                Tổng tiền:
                {(item?.product?.salePrice * item.stock).toLocaleString("vi", {
                  style: "currency",
                  currency: "VND",
                })}
              </div>
              {index !== products.length - 1 && <Divider />}
            </div>
          ))}
        </div>
      ),
    },

    {
      title: <div className="text-center">Tổng đơn hàng</div>,
      dataIndex: "orderTotal",
      key: "orderTotal",
      render: (products) => (
        <div className="text-center">
          {products?.toLocaleString("vi", {
            style: "currency",
            currency: "VND",
          })}
        </div>
      ),
    },

    {
      title: <div className="text-center">Địa chỉ</div>,
      dataIndex: "address",
      key: "address",
      render: (address) => <div className="text-center">{address}</div>,
    },

    {
      title: <div className="text-center">Hình thức thanh toán</div>,
      dataIndex: "billing",
      key: "billing",
      render: (billing) => <div className="text-center">{billing}</div>,
    },

    {
      title: <div className="text-center">Trạng thái</div>,
      dataIndex: "status",
      key: "status",
      render: (slugs) => (
        <span className="flex justify-center items-center w-full text-center">
          {slugs === "rejected" ? (
            <div className="status bg-red-500 text-white py-1 px-4 rounded-full font-semibold">
              Đã hủy
            </div>
          ) : slugs === "shipping" ? (
            <div className="status bg-blue-500 text-white py-1 px-4 rounded-full font-semibold">
              Đang vận chuyển
            </div>
          ) : slugs === "shipped successfully" ? (
            <div className="status bg-indigo-500 text-white py-1 px-4 rounded-full font-semibold">
              Đã giao
            </div>
          ) : slugs === "final" ? (
            <div className="status bg-green-500 text-white py-1 px-4 rounded-full font-semibold">
              Hoàn thành
            </div>
          ) : slugs === "confirmed" ? (
            <div className="status bg-blue-600 text-white py-1 px-4 rounded-full font-semibold">
              Đã xác nhận
            </div>
          ) : (
            <div className="status bg-gray-500 text-white py-1 px-4 rounded-full font-semibold">
              Đợi xác nhận
            </div>
          )}
        </span>
      ),
    },

    {
      title: <div className="text-center">Ngày đặt</div>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span className="text-center">
          {moment(createdAt).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },

    {
      title: <div className="text-center">Action</div>,
      dataIndex: "order",
      key: "order",
      render: (text, record) => (
        <div className="text-center">
          {record.status === "shipped successfully" && (
            <button
              className="px-4 py-2 text-white font-semibold rounded bg-green-500 hover:bg-green-600 mt-3"
              onClick={() => handleConfirmOrder(record)}
            >
              Xác nhận đơn hàng
            </button>
          )}
          {/* Nút Xác nhận đơn hàng chỉ khi trạng thái là "shipped successfully" */}
          {record.status === "shipped successfully" && (
            <button
              className="px-4 py-2 text-white font-semibold rounded bg-yellow-500 hover:bg-yellow-600 mt-3"
              onClick={() => {
                // Hiển thị Modal xác nhận
                Modal.confirm({
                  title: "Xác nhận khiếu nại/Hoàn hàng",
                  content:
                    "Bạn có chắc chắn muốn khiếu nại/hoàn hàng đơn hàng này?",
                  okText: "Xác nhận",
                  cancelText: "Hủy",
                  onOk() {
                    // Sau khi xác nhận, chuyển hướng tới trang khiếu nại
                    history.push(`/complaint/${record._id}`);

                    // Hiển thị thông báo thành công
                  },
                  onCancel() {
                    // Nếu người dùng hủy bỏ, không làm gì
                  },
                });
              }}
            >
              Khiếu nại/Hoàn hàng
            </button>
          )}

          <button
            className={`px-4 py-2 text-white font-semibold rounded mt-3 ${
              record.status === "pending" || record.status === "confirmed"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={() => handleCancelOrder(record)}
            disabled={
              !(record.status === "pending" || record.status === "confirmed")
            } // Chỉ hoạt động khi trạng thái là "pending" hoặc "confirmed"
          >
            Hủy đơn hàng
          </button>
        </div>
      ),
    },
  ];
  const handleCancelComplaint = async (complaint) => {
    // Kiểm tra nếu trạng thái là 'pendingcomplaint'
    if (complaint.status !== "pendingcomplaint") {
      notification["error"]({
        message: "Không thể hủy khiếu nại",
        description: 'Chỉ khiếu nại có trạng thái "Đang chờ" mới có thể hủy.',
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận hủy khiếu nại",
      content: "Bạn có chắc muốn hủy khiếu nại này?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          console.log("Complaint Data:", complaint);
          console.log("Order ID:", complaint._id);

          const updateComplaint = { status: "canceledcomplaint" };
          await axiosClient.put(`/complaint/${complaint._id}`, updateComplaint);

          // Khôi phục trạng thái đơn hàng (giả sử trạng thái ban đầu là "final")
          const updateOrder = { status: "final" }; // Thay thế trạng thái phù hợp
          await axiosClient.put(`/order/${complaint._id}`, updateOrder);

          notification["success"]({
            message: "Thông báo",
            description:
              "Hủy khiếu nại thành công và đơn hàng đã được khôi phục.",
          });

          handleList(); // Cập nhật lại danh sách hiển thị
          setLoading(false);
        } catch (error) {
          notification["error"]({
            message: "Thông báo",
            description: "Đã xảy ra lỗi khi hủy khiếu nại.",
          });
          setLoading(false);
        }
      },
    });
  };

  const columnsComplain = [
    {
      title: <div className="text-center">Thông tin sản phẩm</div>,
      dataIndex: "products",
      key: "productInfo",
      render: (products) => (
        <div className="">
          {products.map((item, index) => (
            <div key={index} className="product-info">
              <div className="product-item ">
                <img
                  src={item.product?.image}
                  alt={item.product?.name}
                  className="product-image "
                />
              </div>
              <h3 className="product-name-1">{item.product?.name}</h3>
              <div className="product-price">
                Giá gốc:
                {item?.product?.salePrice?.toLocaleString("vi", {
                  style: "currency",
                  currency: "VND",
                })}
              </div>
              <div className="product-stock">Số lượng: {item?.stock}</div>
              <div className="product-total">
                Tổng tiền:
                {(item?.product?.salePrice * item.stock).toLocaleString("vi", {
                  style: "currency",
                  currency: "VND",
                })}
              </div>
              {index !== products.length - 1 && <Divider />}
            </div>
          ))}
        </div>
      ),
    },

    {
      title: <div className="text-center">Tổng đơn hàng</div>,
      dataIndex: "orderTotal",
      key: "orderTotal",
      render: (products) => (
        <div className="text-center">
          {products?.toLocaleString("vi", {
            style: "currency",
            currency: "VND",
          })}
        </div>
      ),
    },

    {
      title: <div className="text-center">Địa chỉ</div>,
      dataIndex: "address",
      key: "address",
      render: (address) => <div className="text-center">{address}</div>,
    },

    {
      title: <div className="text-center">Hình thức thanh toán</div>,
      dataIndex: "billing",
      key: "billing",
      render: (billing) => <div className="text-center">{billing}</div>,
    },

    {
      title: <div className="text-center">Trạng thái</div>,
      dataIndex: "status",
      key: "status",
      render: (slugs) => {
        const checkStatus = {
          finalcomplaint: "Đã hoàn thành",
          pendingcomplaint: "Đang chờ",
          acceptcomplaint: "Đã duyệt",
          refundcomplaint: "Đang hoàn trả",
        };
        return (
          <span className="flex justify-center items-center w-full text-center">
            {checkStatus[slugs]}
          </span>
        );
      },
    },

    {
      title: <div className="text-center">Ngày đặt</div>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span className="text-center">
          {moment(createdAt).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
    {
      title: <div className="text-center">Action</div>,
      dataIndex: "complaintAction",
      key: "complaintAction",
      render: (text, record) => (
        <div className="text-center">
          <button
            className={`px-4 py-2 text-white font-semibold rounded ${
              record.status === "pendingcomplaint"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={() => handleCancelComplaint(record)}
            disabled={record.status !== "pendingcomplaint"} // Chỉ khả dụng nếu trạng thái là "pendingcomplaint"
          >
            Hủy khiếu nại
          </button>
        </div>
      ),
    },
  ];
  const handleList = () => {
    (async () => {
      try {
        await productApi.getOrderByUser().then((item) => {
          console.log(item);
          setOrderList(item);
        });
        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
  };

  useEffect(() => {
    handleList();
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <Spin spinning={false}>
        <Card className="container_details">
          <div className="product_detail">
            <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
              <Breadcrumb>
                <Breadcrumb.Item href="http://localhost:3500/home">
                  <span>Trang chủ</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <span>
                    {complaints ? "Quản lý khiếu nại" : "Quản lý đơn hàng"}
                  </span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <div className="container" style={{ marginBottom: 30 }}>
              <br></br>
              <Card>
                <Table
                  columns={complaints ? columnsComplain : columns}
                  dataSource={
                    complaints
                      ? orderList.data
                          ?.filter(
                            (ic) =>
                              ic.status === "finalcomplaint" ||
                              ic.status === "pendingcomplaint" ||
                              ic.status === "acceptcomplaint" ||
                              ic.status === "refundcomplaint"
                          )
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt)
                          ) // Sắp xếp mới nhất
                      : orderList.data
                          ?.filter(
                            (ic) =>
                              ic.status !== "finalcomplaint" &&
                              ic.status !== "pendingcomplaint" &&
                              ic.status !== "acceptcomplaint" &&
                              ic.status !== "refundcomplaint"
                          )
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt)
                          ) // Sắp xếp mới nhất
                  }
                  rowKey="_id"
                  pagination={{ position: ["bottomCenter"] }}
                />
              </Card>
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default CartHistory;

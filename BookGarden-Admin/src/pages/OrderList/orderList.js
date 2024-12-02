import React, { useState, useEffect } from "react";
import "./orderList.css";
import {
  Col,
  Row,
  Typography,
  Spin,
  Input,
  Button,
  notification,
  Breadcrumb,
  Select,
  Table,
  Form,
} from "antd";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import orderApi from "../../apis/orderApi";
import { useHistory } from "react-router-dom";
import axiosClient from "../../apis/axiosClient";
import { PageHeader } from "@ant-design/pro-layout";
const { Option } = Select;
const { Title } = Typography;

const OrderList = () => {
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const history = useHistory();

  const handleUpdateStatus = async (value, record) => {
    setLoading(true);
    try {
      const categoryList = {
        status: value,
      };
      await axiosClient
        .put(`/order/${record._id}`, categoryList)
        .then((response) => {
          if (response === undefined) {
            notification["error"]({
              message: `Thông báo`,
              description: "Cập nhật trạng thái thất bại",
            });
          } else {
            notification["success"]({
              message: `Thông báo`,
              description: "Cập nhật trạng thái thành công",
            });
            setOrder((prevOrder) =>
              prevOrder.map((o) =>
                o._id === record._id ? { ...o, status: value } : o
              )
            );
          }
        });
      setLoading(false);
    } catch (error) {
      console.error("Failed to update order status:", error);
      setLoading(false);
    }
  };

  const handleCategoryList = async () => {
    try {
      await orderApi.getListOrder({ page: 1, limit: 10000 }).then((res) => {
        setOrder(res.data.docs);
        setLoading(false);
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleFilter = async (name) => {
    try {
      const res = await orderApi.searchOrder(name);
      setOrder(res.data.docs);
    } catch (error) {
      console.log("search to fetch category list:" + error);
    }
  };

  const handleViewOrder = (orderId) => {
    history.push(`/order-details/${orderId}`);
  };

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
      render: (text) => <a>{text?.username}</a>,
    },
    {
      title: "Email",
      dataIndex: "user",
      key: "user",
      render: (text) => <a>{text?.email}</a>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "user",
      key: "user",
      render: (text) => <a>{text?.phone}</a>,
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
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleUpdateStatus(value, record)}
          style={{ width: 160 }}
        >
          <Option value="pending" disabled={status !== "pending"}>
            Đợi xác nhận
          </Option>
          <Option value="confirmed" disabled={status !== "pending"}>
            Đã xác nhận
          </Option>
          <Option value="shipping" disabled={status !== "confirmed"}>
            Đang vận chuyển
          </Option>
          <Option value="final" disabled={status !== "shipping"}>
            Giao hàng thành công
          </Option>
          <Option value="returned" disabled={status !== "final"}>
            Đã hoàn trả
          </Option>
          <Option value="rejected" disabled={status !== "pending"}>
            Đã hủy
          </Option>
        </Select>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          style={{
            width: 150,
            borderRadius: 5,
            height: 30,
            marginTop: 5,
            backgroundColor: "#3399ff",
          }}
          type="primary"
          onClick={() => handleViewOrder(record._id)}
        >
          {"Xem"}
        </Button>
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        await orderApi.getListOrder({ page: 1, limit: 10000 }).then((res) => {
          setOrder(res.data.docs);
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
                <span>Quản lý đơn hàng</span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div style={{ marginTop: 20 }}>
            <div id="my__event_container__list">
              <PageHeader subTitle="" style={{ fontSize: 14 }}>
                <Row>
                  <Col span="18">
                    <Input
                      placeholder="Tìm kiếm"
                      allowClear
                      onChange={handleFilter}
                      style={{ width: 300 }}
                    />
                  </Col>
                </Row>
              </PageHeader>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <Table
              columns={columns}
              pagination={{ position: ["bottomCenter"] }}
              dataSource={order}
              scroll={{ x: 1500 }}
            />
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default OrderList;

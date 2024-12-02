import React, { useState, useEffect } from "react";
import styles from "./pay.css";
import axiosClient from "../../../apis/axiosClient";
import { useParams } from "react-router-dom";
import eventApi from "../../../apis/eventApi";
import userApi from "../../../apis/userApi";
import productApi from "../../../apis/productApi";
import { useHistory } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Row, Tag, Spin, Card } from "antd";
import { DateTime } from "../../../utils/dateTime";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  Typography,
  Button,
  Steps,
  Breadcrumb,
  Modal,
  notification,
  Form,
  Input,
  Select,
  Radio,
} from "antd";
import { LeftSquareOutlined } from "@ant-design/icons";

import Slider from "react-slick";
import axios from "axios";

const { Meta } = Card;
const { Option } = Select;

const { Title } = Typography;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
const { TextArea } = Input;

const Pay = () => {
  const [productDetail, setProductDetail] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderTotal, setOrderTotal] = useState([]);
  const [visible, setVisible] = useState(false);
  const [dataForm, setDataForm] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get("paymentId");
  const [lengthForm, setLengthForm] = useState();
  const [form] = Form.useForm();
  const [template_feedback, setTemplateFeedback] = useState();
  let { id } = useParams();
  const history = useHistory();
  const [showModal, setShowModal] = useState(false);
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const hideModal = () => {
    setVisible(false);
  };
  const [totalFee, setTotalFee] = useState(0);

  const accountCreate = async (values) => {
    console.log(values, "values");
    if (values.billing === "paypal") {
      localStorage.setItem("description", values.description);
      localStorage.setItem("address", values.address);
      try {
        const approvalUrl = await handlePayment(values);
        console.log(approvalUrl);
        if (approvalUrl) {
          window.location.href = approvalUrl; // Chuyển hướng đến URL thanh toán PayPal
        } else {
          notification["error"]({
            message: `Thông báo`,
            description: "Thanh toán thất bại",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        notification["error"]({
          message: `Thông báo`,
          description: "Thanh toán thất bại",
        });
      }
    } else {
      try {
        const formatData = {
          userId: userData._id,
          address: values.address,
          billing: values.billing,
          description: values.description,
          status: "pending",
          products: productDetail,
          orderTotal: Number(totalPrice) + Number(totalFee),
        };

        console.log(formatData);
        await axiosClient.post("/order", formatData).then((response) => {
          console.log(response);
          if (
            response.error === "Insufficient stock for one or more products."
          ) {
            return notification["error"]({
              message: `Thông báo`,
              description: "Sản phẩm đã hết hàng!",
            });
          }

          if (response == undefined) {
            notification["error"]({
              message: `Thông báo`,
              description: "Đặt hàng thất bại",
            });
          } else {
            notification["success"]({
              message: `Thông báo`,
              description: "Đặt hàng thành công",
            });
            form.resetFields();
            history.push("/final-pay");
            localStorage.removeItem("cart");
            localStorage.removeItem("cartLength");
          }
        });
      } catch (error) {
        throw error;
      }
      setTimeout(function () {
        setLoading(false);
      }, 1000);
    }
  };

  const handlePayment = async (values) => {
    try {
      const productPayment = {
        price: "800",
        description: values.bookingDetails,
        return_url: "http://localhost:3500" + location.pathname,
        cancel_url: "http://localhost:3500" + location.pathname,
      };
      const response = await axiosClient.post("/payment/pay", productPayment);
      if (response.approvalUrl) {
        localStorage.setItem("session_paypal", response.accessToken);
        return response.approvalUrl; // Trả về URL thanh toán
      } else {
        notification["error"]({
          message: `Thông báo`,
          description: "Thanh toán thất bại",
        });
        return null;
      }
    } catch (error) {
      throw error;
    }
  };

  const handleModalConfirm = async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const paymentId = queryParams.get("paymentId");
      // const token = queryParams.get('token');
      const PayerID = queryParams.get("PayerID");
      const token = localStorage.getItem("session_paypal");
      const description = localStorage.getItem("description");
      const address = localStorage.getItem("address");

      // Gọi API executePayment để thực hiện thanh toán
      const response = await axiosClient.get("/payment/executePayment", {
        params: {
          paymentId,
          token,
          PayerID,
        },
      });

      console.log(response);

      if (response) {
        const local = localStorage.getItem("user");
        const currentUser = JSON.parse(local);

        const formatData = {
          userId: currentUser._id,
          address: address,
          billing: "paypal",
          description: description,
          status: "pending",
          products: productDetail,
          orderTotal: Number(totalPrice) + Number(totalFee),
        };

        console.log(formatData);
        await axiosClient.post("/order", formatData).then((response) => {
          console.log(response);
          if (response == undefined) {
            notification["error"]({
              message: `Thông báo`,
              description: "Đặt hàng thất bại",
            });
          } else {
            notification["success"]({
              message: `Thông báo`,
              description: "Đặt hàng thành công",
            });
            form.resetFields();
            history.push("/final-pay");
            localStorage.removeItem("cart");
            localStorage.removeItem("cartLength");
          }
        });
        notification["success"]({
          message: `Thông báo`,
          description: "Thanh toán thành công",
        });

        setShowModal(false);
      } else {
        notification["error"]({
          message: `Thông báo`,
          description: "Thanh toán thất bại",
        });
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error executing payment:", error);
      // Xử lý lỗi
    }
  };

  const CancelPay = () => {
    form.resetFields();
    history.push("/cart");
  };
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.salePrice * item.stock,
    0
  );
  useEffect(() => {
    (async () => {
      try {
        if (paymentId) {
          setShowModal(true);
        }

        await productApi.getDetailProduct(id).then((item) => {
          setProductDetail(item);
        });
        const local = localStorage.getItem("user");
        const user = JSON.parse(local);
        console.log(user);
        form.setFieldsValue({
          name: user.username,
          email: user.email,
          phone: user.phone,
        });
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        console.log(cart);

        const transformedData = cart.map(
          ({ _id: product, stock, salePrice, price }) => ({
            product,
            stock,
            salePrice,
            price,
          })
        );
        let totalPrice = 0;

        for (let i = 0; i < transformedData.length; i++) {
          let product = transformedData[i];
          console.log(product);
          let price = product.salePrice * product.stock;
          totalPrice += price;
        }

        setOrderTotal(totalPrice);
        setProductDetail(transformedData);
        console.log(transformedData);
        setUserData(user);
        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
    window.scrollTo(0, 0);
  }, []);
  const [tinh, setTinh] = useState([]); // Danh sách tỉnh
  const [huyen, setHuyen] = useState([]); // Danh sách huyện
  const [xa, setXa] = useState([]); // Danh sách xã
  const [idXa, setIdXa] = useState(null);
  const [idHuyen2, setIdHuyen] = useState(null);

  const fetchTinh = async () => {
    try {
      const response = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {
          headers: {
            token: "11acfacb-a8a1-11ef-a094-f28ffa88cdab",
          },
        }
      );
      console.log(response, "response");
      setTinh(response.data.data);
    } catch (error) {
      console.error("Lỗi khi tải tỉnh:", error);
    }
  };
  const onGetPrice = async (idx) => {
    // setIdXa(idx);
    await fetchPrice(idx);
  };
  const fetchHuyen = async (idTinh) => {
    try {
      setLoading(true);

      const response = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
        {
          params: {
            province_id: idTinh,
          },
          headers: {
            token: "11acfacb-a8a1-11ef-a094-f28ffa88cdab",
          },
        }
      );
      setHuyen(response.data.data);
      setXa([]); // Reset xã khi chọn tỉnh mới
    } finally {
      setLoading(false);
    }
  };

  const fetchXa = async (idHuyen) => {
    try {
      setLoading(true);
      setIdHuyen(idHuyen);

      const response = await axios.get(
        "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        {
          params: {
            district_id: idHuyen,
          },
          headers: {
            token: "11acfacb-a8a1-11ef-a094-f28ffa88cdab",
          },
        }
      );
      setXa(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrice = async (cc) => {
    try {
      setLoading(true);
      const dataPayload = {
        service_type_id: 2,
        from_district_id: 1442,
        from_ward_code: "21211",
        to_district_id: idHuyen2,
        to_ward_code: cc,
        height: 1,
        length: 1,
        weight: 1,
        width: 1,
        insurance_value: 0,
        coupon: null,
        items: [
          {
            name: "TEST1",
            stock: 1,
            height: 1,
            weight: 1,
            length: 1,
            width: 1,
          },
        ],
      };
      const response = await axios.post(
        "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        dataPayload,
        {
          headers: {
            token: "11acfacb-a8a1-11ef-a094-f28ffa88cdab",
            shop_id: "5472459",
          },
        }
      );
      console.log(response?.data?.data?.total, "responseresponseresponse");
      setTotalFee(response?.data?.data?.total);
      // setXa(response.data.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTinh();
  }, []);
  return (
    <div class="py-5">
      <Spin spinning={false}>
        <Card className="container">
          <div className="product_detail">
            <div style={{ marginLeft: 5, marginBottom: 10, marginTop: 10 }}>
              <Breadcrumb>
                <Breadcrumb.Item href="http://localhost:3500/cart">
                  <LeftSquareOutlined style={{ fontSize: "24px" }} />
                  <span> Quay lại giỏ hàng</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <span>Thanh toán</span>
                </Breadcrumb.Item>
              </Breadcrumb>

              <div className="payment_progress">
                <Steps
                  current={1}
                  percent={60}
                  items={[
                    {
                      title: "Chọn sản phẩm",
                    },
                    {
                      title: "Thanh toán",
                    },
                    {
                      title: "Hoàn thành",
                    },
                  ]}
                />
              </div>

              <div className="information_pay">
                <Form
                  form={form}
                  onFinish={accountCreate}
                  name="eventCreate"
                  layout="vertical"
                  initialValues={{
                    residence: ["zhejiang", "hangzhou", "xihu"],
                    prefix: "86",
                  }}
                  scrollToFirstError
                >
                  <Form.Item
                    name="name"
                    label="Tên"
                    hasFeedback
                    style={{ marginBottom: 10 }}
                  >
                    <Input placeholder="Tên" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email"
                    hasFeedback
                    style={{ marginBottom: 10 }}
                  >
                    <Input disabled placeholder="Email" />
                  </Form.Item>

                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    hasFeedback
                    style={{ marginBottom: 10 }}
                  >
                    <Input placeholder="Số điện thoại" />
                  </Form.Item>

                  <Form.Item
                    name="address5"
                    label=" Tỉnh/Thành"
                    hasFeedback
                    style={{ marginBottom: 15 }}
                  >
                    {/* <Input placeholder="Địa chỉ" /> */}
                    <div className="mb-4">
                      <Select
                        placeholder="Chọn Tỉnh/Thành"
                        className="w-full"
                        allowClear
                        onChange={(e) => fetchHuyen(e)}
                      >
                        {tinh.map((item) => {
                          return (
                            <Option
                              style={{ color: "black" }}
                              className="text-black"
                              key={item.ProvinceID}
                              value={item.ProvinceID}
                            >
                              <p style={{ color: "black" }}>
                                {item.ProvinceName}
                              </p>
                            </Option>
                          );
                        })}
                      </Select>
                    </div>
                  </Form.Item>
                  <Form.Item
                    name="address2"
                    label="Quận/Huyện"
                    hasFeedback
                    style={{ marginBottom: 15 }}
                  >
                    <div className="mb-4">
                      <Select
                        placeholder="Chọn Quận/Huyện"
                        className="w-full"
                        allowClear
                        onChange={(e) => fetchXa(e)}
                        disabled={!huyen.length}
                      >
                        {huyen.map((item) => (
                          <Option key={item.DistrictID} value={item.DistrictID}>
                            {item.DistrictName}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Form.Item>
                  <Form.Item
                    name="address3"
                    label="Xã/Phường"
                    hasFeedback
                    style={{ marginBottom: 15 }}
                  >
                    <div className="mb-4">
                      <Select
                        placeholder="Chọn Xã/Phường"
                        className="w-full"
                        allowClear
                        onChange={(e) => {
                          onGetPrice(e);
                        }}
                        disabled={!xa.length}
                      >
                        {xa.map((item) => (
                          <Option key={item.WardCode} value={item.WardCode}>
                            {item.WardName}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Form.Item>

                  <p>Phí ship</p>
                  <p className="font-bold text-black text-xl">
                    {" "}
                    {totalFee?.toLocaleString()} VND
                  </p>
                  <p>Tổng tiền ( bao gồm phí ship)</p>
                  <p className="font-bold text-black text-xl">
                    {" "}
                    {(
                      Number(totalPrice) + Number(totalFee)
                    )?.toLocaleString()}{" "}
                    VND
                  </p>
                  {/* <Form.Item
                    name="total"
                    label="Tổng tiền ( bao gồm phí ship)"
                    hasFeedback
                    style={{ marginBottom: 10 }}
                  >
                    <Input
                      disabled
                      defaultValue={
                        totalFee != 0
                          ? Number(totalPrice) + Number(totalFee)
                          : 0
                      }
                      placeholder="Số điện thoại"
                    />
                  </Form.Item> */}
                  <Form.Item
                    name="address"
                    label=" Nhập chi tiết số nhà , ngách ngõ "
                    hasFeedback
                    style={{ marginBottom: 15 }}
                  >
                    <Input placeholder="Chi tiết Địa chỉ" />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="Lưu ý cho đơn hàng"
                    hasFeedback
                    style={{ marginBottom: 15 }}
                  >
                    <Input.TextArea rows={4} placeholder="Lưu ý" />
                  </Form.Item>

                  <Form.Item
                    name="billing"
                    label="Phương thức thanh toán"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn phương thức thanh toán!",
                      },
                    ]}
                    style={{ marginBottom: 10 }}
                  >
                    <Radio.Group>
                      <Radio value={"cod"}>COD</Radio>
                      <Radio value={"paypal"}>PAYPAL</Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      style={{
                        background: "#FF8000",
                        color: "#FFFFFF",
                        float: "right",
                        marginTop: 20,
                        marginLeft: 8,
                      }}
                      htmlType="submit"
                    >
                      Hoàn thành
                    </Button>
                    <Button
                      style={{
                        background: "#FF8000",
                        color: "#FFFFFF",
                        float: "right",
                        marginTop: 20,
                      }}
                      onClick={CancelPay}
                    >
                      Trở về
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </Card>
        <Modal
          visible={showModal}
          onOk={handleModalConfirm}
          onCancel={() => setShowModal(false)}
        >
          <p>Bạn có chắc chắn muốn xác nhận thanh toán ?</p>
        </Modal>
      </Spin>
    </div>
  );
};

export default Pay;

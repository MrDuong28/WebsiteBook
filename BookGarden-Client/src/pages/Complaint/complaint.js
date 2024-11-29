import React, { useEffect, useState } from "react";
import {
  Form,
  Select,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  notification,
} from "antd"; // Import notification từ antd
import { useParams } from "react-router-dom";
import axiosClient from "../../apis/axiosClient";
import productApi from "../../apis/productApi";
import { Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const Complaint = () => {
  const { id } = useParams(); // Lấy id từ URL

  const [order, setOrder] = useState(null);
  const [complaint, setComplaint] = useState(null); // Để lưu thông tin khiếu nại
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [arrayImage, setArrayImage] = useState([]);
  // Lấy thông tin đơn hàng từ API
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axiosClient.get(`/order/${id}`);
        console.log(response, "response");
        setOrder(response);
      } catch (error) {
        setError("Lỗi khi tải dữ liệu đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    const fetchComplaintDetails = async () => {
      try {
        const response = await axiosClient.get(`/complaint/${id}`); // Lấy thông tin khiếu nại theo orderId
        console.log(response, "response");
        setComplaint(response.data);
      } catch (error) {
        setError("Lỗi khi tải thông tin khiếu nại.");
      }
    };

    fetchOrderDetails();
    fetchComplaintDetails();
  }, [id]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const handleUploadChange = async ({ file, fileList }) => {
    setFileList(fileList);
    if (file.status === "uploading" && file.originFileObj) {
      const isAlreadyUploaded = uploadedFiles.some(
        (uploadedFile) => uploadedFile.uid === file.uid
      );
      if (isAlreadyUploaded) return;
      try {
        const formData = new FormData();
        formData.append("image", file.originFileObj);

        const response = await fetch("http://localhost:3100/api/uploadFile", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (response.ok) {
          setUploadedFiles((prev) => [
            ...prev,
            { uid: file.uid, url: result.image_url },
          ]);
          setArrayImage((prevUrls) => [...prevUrls, result.image_url]);

          message.success(`${file.name} đã upload thành công!`);
        } else {
          message.error(`${file.name} upload thất bại: ${result?.message}`);
        }
      } catch (error) {
        console.error("Lỗi upload:", error);
        message.error("Upload ảnh thất bại.");
      }
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const onFinish = async (values) => {
    const newDataPayload = {
      ...values,
      image: arrayImage,
      user: user?._id,
      orderId: id,
    };
    try {
      await axiosClient.post("/create-complaint", newDataPayload);
      notification.success({ message: "Khách hàng khiếu nại thành công!" });
      setFileList([]);
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } catch (error) {
      notification.error({ message: "Lỗi khi gửi khiếu nại." });
    }
  };
  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <Spin spinning={loading}>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card style={{ border: "none" }} bodyStyle={{ padding: "20px" }}>
                <Title level={4}>Đơn hàng đã chọn</Title>
                {order ? (
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Card
                        style={{ border: "none" }}
                        bodyStyle={{ padding: "20px" }}
                      >
                        <Row gutter={[16, 16]}>
                          {order.products && order.products.length > 0 ? (
                            order.products.map((item, index) => (
                              <Col key={index} span={24}>
                                <Row gutter={[16, 16]}>
                                  <Col span={4}>
                                    <img
                                      src={
                                        item.product?.image ||
                                        "https://via.placeholder.com/100"
                                      }
                                      alt={item.product?.name || "Product"}
                                      style={{
                                        width: "100%",
                                        borderRadius: "5px",
                                      }}
                                    />
                                  </Col>
                                  <Col span={20}>
                                    <Text
                                      style={{
                                        display: "block",
                                        fontSize: "16px",
                                      }}
                                    >
                                      {item.product?.name ||
                                        "Tên sản phẩm không khả dụng"}
                                    </Text>
                                    <Text
                                      style={{
                                        color: "#999",
                                        display: "block",
                                      }}
                                    >
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html:
                                            item.product?.description ||
                                            "Mô tả không khả dụng",
                                        }}
                                      />
                                    </Text>
                                    <Text
                                      style={{
                                        color: "#28a745",
                                        display: "block",
                                      }}
                                    >
                                      {order.status ||
                                        "Trạng thái không xác định"}
                                    </Text>
                                    <Text
                                      style={{
                                        display: "block",
                                        marginTop: "10px",
                                      }}
                                    >
                                      <del
                                        style={{
                                          color: "#999",
                                          marginRight: "8px",
                                        }}
                                      >
                                        {item.product?.originalPrice?.toLocaleString(
                                          "vi-VN",
                                          {
                                            style: "currency",
                                            currency: "VND",
                                          }
                                        )}
                                      </del>
                                      {item.product?.salePrice?.toLocaleString(
                                        "vi-VN",
                                        {
                                          style: "currency",
                                          currency: "VND",
                                        }
                                      )}
                                    </Text>
                                  </Col>
                                </Row>
                              </Col>
                            ))
                          ) : (
                            <Text style={{}}>
                              Không có sản phẩm trong đơn hàng.
                            </Text>
                          )}
                        </Row>
                      </Card>
                    </Col>
                  </Row>
                ) : (
                  <Text style={{}}>Không tìm thấy thông tin đơn hàng.</Text>
                )}
              </Card>
            </Col>

            {/* Hiển thị khiếu nại */}
            {complaint && (
              <Col span={24}>
                <Card
                  style={{ border: "none" }}
                  bodyStyle={{ padding: "20px" }}
                >
                  <Title level={4} style={{}}>
                    Thông tin khiếu nại
                  </Title>
                  <Text style={{ display: "block" }}>
                    <strong>Lý do:</strong> {complaint.reason}
                  </Text>
                  <Text style={{ display: "block" }}>
                    <strong>Mô tả:</strong> {complaint.description}
                  </Text>
                </Card>
              </Col>
            )}

            {/* Form gửi khiếu nại mới */}
            <Col span={24}>
              <Card style={{ border: "none" }} bodyStyle={{ padding: "20px" }}>
                <Title level={4}>Chọn sản phẩm cần Trả hàng và Hoàn tiền</Title>
                <Form layout="vertical" onFinish={onFinish}>
                  <Form.Item
                    name="reason"
                    label={<Text>* Lý do:</Text>}
                    rules={[
                      { required: true, message: "Vui lòng chọn lý do!" },
                    ]}
                  >
                    <Select placeholder="Chọn Lý Do">
                      <Option value="wrong-item">Giao sai hàng</Option>
                      <Option value="damaged">Sản phẩm bị hư hỏng</Option>
                      <Option value="other">Khác</Option>
                    </Select>
                  </Form.Item>

                  {/* Thêm phần chọn phương án */}
                  <Form.Item
                    name="option"
                    label={<Text>Phương án:</Text>}
                    rules={[
                      { required: true, message: "Vui lòng chọn phương án!" },
                    ]}
                  >
                    <Select placeholder="Chọn phương án">
                      <Option value="return-refund">
                        Hoàn hàng - Trả tiền
                      </Option>
                      <Option value="refund-only">Chỉ trả tiền</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label={<Text>Mô tả:</Text>}
                    rules={[
                      { required: true, message: "Vui lòng nhập mô tả!" },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Chi tiết vấn đề bạn gặp phải"
                      maxLength={2000}
                    />
                  </Form.Item>
                  <Form.Item label={<Text>Ảnh minh họa:</Text>}>
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={handleUploadChange}
                      multiple={true} // Cho phép upload nhiều file
                      maxCount={3} // Giới hạn tối đa 3 file
                      style={{
                        borderColor: "#28a745", // Màu xanh lá cây
                      }}
                    >
                      {fileList.length >= 3 ? null : (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Tải lên</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{
                        backgroundColor: "#28a745",
                        border: "none",
                        mt: 2,
                      }}
                    >
                      Gửi khiếu nại
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default Complaint;

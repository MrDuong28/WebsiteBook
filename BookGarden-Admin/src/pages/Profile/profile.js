import {
  FormOutlined,
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Card, Col, Divider, Row, Spin, Typography } from "antd";
import React, { useEffect, useState } from "react";
import userApi from "../../apis/userApi";
import "./profile.css";

const { Title, Text } = Typography;

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await userApi.getProfile();
        setUserData(response.user);
        setLoading(false);
      } catch (error) {
        console.log("Failed to fetch profile user:" + error);
      }
    })();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Spin spinning={loading}>
        <div style={{ marginTop: 20, marginLeft: 24 }}>
          <Breadcrumb>
            <Breadcrumb.Item href="">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="">
              <FormOutlined />
              <span>Trang cá nhân</span>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div>
          <Row justify="center" style={{ marginTop: 40 }}>
            {/* Profile Card */}
            <Col span={12}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                <div>
                  <img
                    src={
                      userData.image ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6FfegZtXuygiQ-sFo1N7QBBE-Eqj9Ic5-Dw&s"
                    }
                    alt="Avatar"
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      border: "4px solid #1890ff",
                      objectFit: "cover",
                      marginBottom: 20,
                    }}
                  />
                </div>
                <Title level={3} style={{ marginBottom: 5 }}>
                  {userData.username || "Tên người dùng"}
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  {userData.email || "Email không khả dụng"}
                </Text>
                <Divider style={{ margin: "20px 0" }} />
                <Row gutter={16} justify="center">
                  <Col span={8}>
                    <div>
                      <UserOutlined
                        style={{ fontSize: 20, color: "#1890ff" }}
                      />
                      <Text style={{ display: "block", marginTop: 5 }}>
                        {userData.role || "Vai trò"}
                      </Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <PhoneOutlined
                        style={{ fontSize: 20, color: "#1890ff" }}
                      />
                      <Text style={{ display: "block", marginTop: 5 }}>
                        {userData.phone || "Số điện thoại"}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </Spin>
    </div>
  );
};

export default Profile;

import { PhoneOutlined, SafetyOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Input, Modal, Spin, notification } from "antd";
import React, { useEffect, useState } from "react";
import userApi from "../../apis/userApi";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editedUserData, setEditedUserData] = useState({});

  const handleEditProfile = () => {
    setEditedUserData(userData);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSave = async () => {
    console.log(editedUserData);
    const local = localStorage.getItem("user");
    const user = JSON.parse(local);
    editedUserData._id = user?._id;
    try {
      const response = await userApi.updateProfile(editedUserData);
      if (response) {
        const response = await userApi.getProfileById(user?._id);
        setUserData(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
        window.location.reload();
      }
      notification.success({ message: "Cập nhật thông tin thành công" });
      setIsModalVisible(false);
    } catch (error) {
      console.log("Failed to update profile:", error);
      notification.error({ message: "Có lỗi xảy ra khi cập nhật thông tin" });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const local = localStorage.getItem("user");
        const user = JSON.parse(local);
        setUserData(user);
      } catch (error) {
        console.log("Failed to fetch profile user:" + error);
      }
    })();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <Spin spinning={loading}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
            <div className="flex justify-center p-4">
              <img
                src="https://api.dicebear.com/7.x/miniavs/svg?seed=2"
                className="w-36 h-36 rounded-full border-4 border-gray-300"
              />
            </div>
            <div className="text-center p-4">
              <h2 className="text-2xl font-bold text-gray-700">
                {userData.username}
              </h2>
              <p className="text-sm text-gray-500">{userData.email}</p>
              <Divider className="my-4" />

              <div className="grid grid-cols-1 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <PhoneOutlined className="text-2xl text-gray-600 text-center" />
                  <p className="mt-1 text-sm">{userData.phone}</p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="primary"
                  onClick={handleEditProfile}
                  className="bg-blue-500 text-white  rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Chỉnh sửa profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Spin>

      <Modal
        title="Chỉnh sửa profile"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSave}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={editedUserData}
          onValuesChange={(changedValues, allValues) => {
            setEditedUserData(allValues);
          }}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter your email" }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Please enter your phone number" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;

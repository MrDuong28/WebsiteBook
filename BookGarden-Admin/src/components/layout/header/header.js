import React, { useEffect, useState } from "react";
import "./header.css";
import MenuDropdown from "../../DropdownMenu/dropdownMenu";
import {
  Layout,
  Dropdown,
  Badge,
  Row,
  Col,
  Popover,
  Modal,
  List,
  Avatar,
  Menu,
} from "antd";
import {
  TranslationOutlined,
  BellOutlined,
  NotificationTwoTone,
} from "@ant-design/icons";
import userApi from "../../../apis/userApi";
import en from "../../../assets/image/en.png";
import vn from "../../../assets/image/vn.png";

const { Header } = Layout;

function Topbar() {
  const [countNotification, setCountNotification] = useState(0);
  const [notification, setNotification] = useState([]);
  const [visible, setVisible] = useState(false);
  const [visiblePopover, setVisiblePopover] = useState(false);
  const [titleNotification, setTitleNotification] = useState("");
  const [contentNotification, setContentNotification] = useState("");

  const handleNotification = (valuesContent, valuesTitile) => {
    setVisible(true);
    setVisiblePopover(visible !== visible);
    setContentNotification(valuesContent);
    setTitleNotification(valuesTitile);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleVisibleChange = (visible) => {
    setVisiblePopover(visible);
  };

  const content = (
    <div>
      {notification.map((values, index) => {
        return (
          <div>
            <List.Item style={{ padding: 0, margin: 0 }}>
              <List.Item.Meta
                style={{ width: 250, margin: 0 }}
                avatar={
                  <NotificationTwoTone
                    style={{ fontSize: "20px", color: "#08c" }}
                  />
                }
                title={
                  <a
                    onClick={() =>
                      handleNotification(values.content, values.title)
                    }
                  >
                    {values.title}
                  </a>
                }
                description={
                  <p
                    className="fixLine"
                    dangerouslySetInnerHTML={{ __html: values.content }}
                  ></p>
                }
              />
            </List.Item>
          </div>
        );
      })}
    </div>
  );

  const menu = (
    <Menu>
      <Menu.Item key="1" style={{ display: "flex", alignItems: "center" }}>
        <img
          alt=""
          style={{
            background: "#FFFFFF",
            float: "left",
            width: 35,
            height: 18,
            marginRight: 8,
          }}
          src={vn}
        />
        <a target="_blank" rel="noopener noreferrer">
          VIỆT NAM
        </a>
      </Menu.Item>
      <Menu.Item key="2" style={{ display: "flex", alignItems: "center" }}>
        <img
          alt=""
          style={{
            background: "#FFFFFF",
            float: "left",
            width: 35,
            height: 18,
            marginRight: 8,
          }}
          src={en}
        />
        <a target="_blank" rel="noopener noreferrer">
          ENGLISH
        </a>
      </Menu.Item>
    </Menu>
  );

  const TransalteSwitch = () => {
    return (
      <Dropdown key="more" overlay={menu} placement="bottomCenter" arrow>
        <div
          style={{
            paddingLeft: 10,
            paddingRight: 10,
            cursor: "pointer",
          }}
          className="container"
        >
          <TranslationOutlined />
        </div>
      </Dropdown>
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await userApi.pingRole();
        console.log(response.role);
      } catch (error) {
        console.log("Failed to fetch event list:" + error);
      }
    })();
  }, []);

  return (
    <div
      className="header"
      style={{ background: "#FFFFF", padding: 0, margin: 0 }}
    >
      <div>
        <Row
          className="header"
          style={{
            background: "#FFFFFF",
            top: 0,
            position: "fixed",
            left: 0,
            display: "flex",
            width: "100%",
            padding: 0,
            zIndex: 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Col span={10}>
            <div
              style={{
                position: "relative",
                display: "flex",
                paddingTop: 3,
                paddingBottom: 3,
                alignItems: "center",
                marginLeft: 8,
              }}
            >
              <Row justify="center">
                <Col style={{ marginLeft: 50 }}>
                  <a href="#">
                    <img
                      style={{
                        height: 55,
                        width: 55,
                        paddingTop: 5,
                        paddingBottom: 5,
                      }}
                      alt=""
                      src="/logo.png"
                    />
                  </a>
                </Col>
              </Row>
            </div>
          </Col>
          <Col span={6} offset={8}>
            <div
              style={{
                display: "flex",
                padding: 5,
                justifyContent: "center",
                flexDirection: "row",
                float: "right",
                alignItems: "center",
                marginRight: 48,
              }}
            >
              <Row>
                <MenuDropdown key="image" />
              </Row>
              <Row></Row>
            </div>
          </Col>
        </Row>
        <Modal
          title={titleNotification}
          visible={visible}
          onOk={handleOk}
          onCancel={handleOk}
          cancelButtonProps={{ style: { display: "none" } }}
        >
          <p dangerouslySetInnerHTML={{ __html: contentNotification }}></p>
        </Modal>
      </div>
    </div>
  );
}

export default Topbar;

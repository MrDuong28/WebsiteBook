import React, { useEffect, useState } from "react";
import styles from "./header.module.css";
import DropdownAvatar from "../../DropdownMenu/dropdownMenu";
import { useHistory, NavLink } from "react-router-dom";
import {
  Layout,
  Avatar,
  Badge,
  Row,
  Col,
  List,
  Popover,
  Modal,
  Drawer,
  Select,
} from "antd";
import {
  BellOutlined,
  NotificationTwoTone,
  BarsOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axiosClient from "../../../apis/axiosClient";

const { Option } = Select;

const { Header } = Layout;

function Topbar() {
  const [countNotification, setCountNotification] = useState(0);
  const [notification, setNotification] = useState([]);
  const [visible, setVisible] = useState(false);
  const [visiblePopover, setVisiblePopover] = useState(false);
  const [titleNotification, setTitleNotification] = useState("");
  const [contentNotification, setContentNotification] = useState("");
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [userData, setUserData] = useState([]);
  const [cart, setCart] = useState();

  const history = useHistory();

  const handleLink = (link) => {
    setVisibleDrawer(false);
    history.push(link);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const showDrawer = () => {
    setVisibleDrawer(true);
  };

  const onClose = () => {
    setVisibleDrawer(false);
  };

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectOptions, setSelectOptions] = useState([]);

  const handleSelectChange = async (value) => {
    setSelectedOption(value);
    console.log(value);
    history.push("/product-detail/" + value);
    window.location.reload();
  };

  const updateSelectOptions = (newOptions) => {
    const updatedOptions = newOptions.map((option) => ({
      value: option._id,
      label: option.name,
    }));

    setSelectOptions(updatedOptions);
  };

  const handleSearch = async (value) => {
    try {
      const response = await axiosClient.get(
        `/product/searchByName?name=${value}`
      );
      const data = response.data;

      updateSelectOptions(data.docs);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const local = localStorage.getItem("user");
        const user = JSON.parse(local);
        const cart = localStorage.getItem("cartLength");
        console.log(cart);
        setCart(cart);
        setUserData(user);
      } catch (error) {
        console.log("Failed to fetch profile user:" + error);
      }
    })();
  }, []);

  return (
    <Header style={{ background: "green" }} className={styles.header}>
      <div className="">
        <img
          style={{
            color: "#000000",
            fontSize: 15,
            width: 200,
            cursor: "pointer",
          }}
          src="/logo.png"
          onClick={() => handleLink("/home")}
        ></img>
      </div>
      <BarsOutlined className={styles.bars} onClick={showDrawer} />
      <div className={styles.navmenu} style={{ marginLeft: 20 }}>
        <NavLink className={styles.navlink} to="/home" activeStyle>
          Trang chủ
        </NavLink>
        <NavLink className={styles.navlink} to="/product-list" activeStyle>
          Sản phẩm
        </NavLink>

        <NavLink className={styles.navlink} to="/news" activeStyle>
          Tin tức
        </NavLink>
        <NavLink className={styles.navlink} to="/contact" activeStyle>
          Liên hệ
        </NavLink>
        <Select
          showSearch
          style={{ marginLeft: 20, width: 300 }}
          placeholder="Bạn tìm gì..."
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label?.toLowerCase() ?? "").includes(input.toLowerCase())
          }
          filterSort={(optionA, optionB) =>
            optionA?.label
              ?.toLowerCase()
              .localeCompare(optionB?.label?.toLowerCase())
          }
          options={selectOptions}
          onChange={handleSelectChange}
          onSearch={handleSearch}
        />
      </div>
      <div className={styles.logBtn}>
        <div
          style={{
            position: "relative",
            display: "flex",
            float: "right",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <Row>
            <Col onClick={() => handleLink("/cart")}>
              <p
                style={{
                  marginRight: 10,
                  padding: 30,
                  margin: 0,
                  fontSize: "14px",
                  color: "#FFFFFF",
                }}
              >
                Giỏ hàng{" "}
                <ShoppingCartOutlined
                  style={{ fontSize: "32px", color: "#FFFFFF" }}
                />
                {cart}
              </p>
            </Col>
            <Col>
              <Badge
                style={{ marginLeft: 10 }}
                overflowCount={9999}
                count={userData?.score > 0 ? userData?.score : 0}
              />
            </Col>
          </Row>

          <Row>
            <DropdownAvatar key="avatar" />
            <p
              style={{
                marginRight: 10,
                padding: 0,
                margin: 0,
                color: "#FFFFFF",
              }}
            >
              <UserOutlined style={{ fontSize: "28px", color: "#FFFFFF" }} />
            </p>
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
    </Header>
  );
}

export default Topbar;

import React, { useEffect, useState } from "react";
import "./sidebar.css";
import { Layout, Menu } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import {
  UserOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  FormOutlined,
  EditOutlined,
  DiffOutlined,
  CloudUploadOutlined,
  UnorderedListOutlined,
  FolderOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { SubMenu } = Menu;
const { Sider } = Layout;

function Sidebar() {
  const history = useHistory();
  const location = useLocation();

  const menuSidebarAdmin = [
    {
      key: "dashboard",
      title: "Dashboard",
      link: "/dashboard",
      icon: <DashboardOutlined />,
    },
    {
      key: "account-management",
      title: "Quản Lý Tài Khoản",
      link: "/account-management",
      icon: <UserOutlined />,
    },
    {
      key: "product-list",
      title: "Quản lý sản phẩm",
      link: "/product-list",
      icon: <FormOutlined />,
    },

    {
      key: "order-list",
      title: "Quản lý đơn hàng",
      link: "/order-list",
      icon: <ShoppingCartOutlined />,
    },

    {
      key: "kl-list",
      title: "Quản lý khiếu nại",
      link: "/complaint-list",
      icon: <ExclamationCircleOutlined />,
    },
    {
      key: "news-list",
      title: "Tin tức",
      link: "/news-list",
      icon: <DiffOutlined />,
    },
  ];

  const categorySubMenu = [
    {
      key: "category-list",
      title: "Danh mục sản phẩm",
      link: "/category-list",
      icon: <FolderOutlined />,
    },
    {
      key: "author-list",
      title: "Tác giả",
      link: "/author-list",
      icon: <EditOutlined />,
    },
    {
      key: "pulisher-list",
      title: "Nhà xuất bản",
      link: "/pulisher-list",
      icon: <CloudUploadOutlined />,
    },
  ];

  const navigate = (link, key) => {
    history.push(link);
  };

  useEffect(() => {});

  return (
    <Sider
      className={"ant-layout-sider-trigger"}
      width={215}
      style={{
        position: "fixed",
        top: 65,
        height: "100%",
        left: 0,
        padding: 0,
        zIndex: 1,
        marginTop: 0,
        boxShadow: " 0 1px 4px -1px rgb(0 0 0 / 15%)",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={location.pathname.split("/")}
        defaultOpenKeys={["product-categories"]}
        style={{ height: "100%", borderRight: 0, backgroundColor: "#FFFFFF" }}
        theme="light"
      >
        {/* Danh sách sản phẩm */}
        {menuSidebarAdmin.map((map) => (
          <Menu.Item
            onClick={() => navigate(map.link, map.key)}
            key={map.key}
            icon={map.icon}
            className="customeClass"
          >
            {map.title}
          </Menu.Item>
        ))}

        {/* Dropdown for category-related items */}
        <SubMenu
          key="product-categories"
          icon={<UnorderedListOutlined />}
          title="Quản lý danh mục"
        >
          {categorySubMenu.map((map) => (
            <Menu.Item
              onClick={() => navigate(map.link, map.key)}
              key={map.key}
              icon={map.icon}
            >
              {map.title}
            </Menu.Item>
          ))}
        </SubMenu>
      </Menu>
    </Sider>
  );
}

export default Sidebar;

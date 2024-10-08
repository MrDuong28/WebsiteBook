import React, { useState, useEffect } from "react";
import "./newsDetai.css";
import { DatePicker, Input, Spin, Breadcrumb } from "antd";
import { Card, notification } from "antd";
import { useHistory } from "react-router-dom";
import axiosClient from "../../apis/axiosClient";
import productApi from "../../apis/productApi";
import { BrowserRouter as Router, Route, useParams } from "react-router-dom";

// const { Search } = Input;

const NewsDetai = () => {
  const [news, setNews] = useState([]);
  let history = useHistory();
  const { id } = useParams();

  //   const onFinish = async (values) => {
  //     var today = new Date();
  //     var dd = String(today.getDate()).padStart(2, "0");
  //     var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  //     var yyyy = today.getFullYear();
  //     var date = yyyy + "-" + mm + "-" + dd;

  //     try {
  //       const formatData = {
  //         email: values.email,
  //         username: values.username,
  //         password: values.password,
  //         phone: values.phoneNo,
  //         role: "isClient",
  //         status: "actived",
  //       };
  //       await axiosClient
  //         .post("http://localhost:3100/api/auth/register", formatData)
  //         .then((response) => {
  //           console.log(response);
  //           if (response === "Email is exist") {
  //             return notification["error"]({
  //               message: "Thông báo",
  //               description: "Email đã tồn tại",
  //             });
  //           }
  //           if (response === undefined) {
  //             notification["error"]({
  //               message: "Thông báo",
  //               description: "Đăng ký thất bại",
  //             });
  //           } else {
  //             notification["success"]({
  //               message: "Thông báo",
  //               description: "Đăng kí thành công",
  //             });
  //             setTimeout(function () {
  //               history.push("/login");
  //             }, 1000);
  //           }
  //         });
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  useEffect(() => {
    (async () => {
      try {
        await productApi.getNewDetail(id).then((item) => {
          console.log(item.data);
          setNews(item.data);
        });
      } catch (error) {
        console.log("Failed to fetch event detail:" + error);
      }
    })();
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
                <Breadcrumb.Item href="http://localhost:3500/news">
                  <span>Tin tức</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="">
                  <span>{news.name}</span>
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <hr></hr>
            <div class="pt-5-container">
              <div class="newsdetaititle">{news.name}</div>
              <div dangerouslySetInnerHTML={{ __html: news.description }}></div>
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default NewsDetai;

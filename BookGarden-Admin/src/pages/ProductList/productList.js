import {
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  HomeOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@ant-design/pro-layout";
import {
  BackTop,
  Breadcrumb,
  Button,
  Col,
  Drawer,
  Form,
  Checkbox,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Upload,
  message,
  notification,
} from "antd";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import axiosClient from "../../apis/axiosClient";
import newsApi from "../../apis/newsApi";
import productApi from "../../apis/productsApi";
import uploadFileApi from "../../apis/uploadFileApi";
import "./productList.css";
const { confirm } = Modal;
const { Option } = Select;
const { Title } = Typography;
const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";

const ProductList = () => {
  const [product, setProduct] = useState([]);
  const [category, setCategoryList] = useState([]);
  const [author, setAuthorList] = useState([]);
  const [pulisher, setPulisherList] = useState([]);

  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [image, setImage] = useState();

  const [newsList, setNewsList] = useState([]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [totalEvent, setTotalEvent] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [description, setDescription] = useState();
  const [total, setTotalList] = useState(false);
  const [id, setId] = useState();
  const [visible, setVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [bookUrl, setBookUrl] = useState([]);

  const history = useHistory();

  const showModal = () => {
    setOpenModalCreate(true);
  };

  const handleOkUser = async (values) => {
    setLoading(true);
    try {
      var formData = new FormData();
      formData.append("image", image);

      await axiosClient
        .post("/uploadFile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          const categoryList = {
            name: values.name,
            price: values.price,
            description: description,
            category: values.category,
            image: response.image_url,
            slide: images,
            salePrice: values.salePrice,
            year: values.year,
            stock: values.stock,
            pages: values.pages,
            weight: values.weight,
            size: values.size,
            form: values.form,
            author: values.author,
            pulisher: values.pulisher,
            status: values.status,
          };

          return axiosClient.post("/product", categoryList).then((response) => {
            if (response === undefined) {
              notification["error"]({
                message: `Thông báo`,
                description: "Tạo sản phẩm thất bại",
              });
            } else {
              notification["success"]({
                message: `Thông báo`,
                description: "Tạo sản phẩm thành công",
              });
              setImages([]);
              setOpenModalCreate(false);
              handleProductList();
            }
          });
        });

      setLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const handleImageUpload = async (info) => {
    const image = info.file;
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axiosClient
        .post("/uploadFile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          const imageUrl = response.image_url;
          console.log(imageUrl);
          // Lưu trữ URL hình ảnh trong trạng thái của thành phần
          setImages((prevImages) => [...prevImages, imageUrl]);

          console.log(images);
          message.success(`${info.file.name} đã được tải lên thành công!`);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateProduct = async (values) => {
    setLoading(true);
    try {
      if (image) {
        var formData = new FormData();
        formData.append("image", image);

        await axiosClient
          .post("/uploadFile", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            const categoryList = {
              name: values.name,
              description: description,
              price: values.price,
              category: values.category,
              image: response.image_url,
              salePrice: values.salePrice,
              year: values.year,
              stock: values.stock,
              pages: values.pages,
              weight: values.weight,
              size: values.size,
              form: values.form,
              status: values.status,

              author: values.author,
              pulisher: values.pulisher,
            };

            return axiosClient
              .put("/product/" + id, categoryList)
              .then((response) => {
                if (response === undefined) {
                  notification["error"]({
                    message: `Thông báo`,
                    description: "Chỉnh sửa sản phẩm thất bại",
                  });
                  setLoading(false);
                } else {
                  notification["success"]({
                    message: `Thông báo`,
                    description: "Chỉnh sửa sản phẩm thành công",
                  });
                  setOpenModalUpdate(false);
                  handleProductList();
                  setLoading(false);
                }
              });
          });
      } else {
        // Nếu image không tồn tại, chỉ gọi API put
        const categoryList = {
          name: values.name,
          description: description,
          price: values.price,
          category: values.category,
          salePrice: values.salePrice,
          year: values.year,
          stock: values.stock,
          pages: values.pages,
          weight: values.weight,
          size: values.size,
          form: values.form,
          status: values.status,
          author: values.author,
          pulisher: values.pulisher,
        };

        return axiosClient
          .put("/product/" + id, categoryList)
          .then((response) => {
            if (response === undefined) {
              notification["error"]({
                message: `Thông báo`,
                description: "Chỉnh sửa sản phẩm thất bại",
              });
              setLoading(false);
            } else {
              notification["success"]({
                message: `Thông báo`,
                description: "Chỉnh sửa sản phẩm thành công",
              });
              setOpenModalUpdate(false);
              handleProductList();
              setLoading(false);
            }
          });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = (type) => {
    if (type === "create") {
      setOpenModalCreate(false);
    } else {
      setOpenModalUpdate(false);
    }
    console.log("Clicked cancel button");
  };

  const handleProductList = async () => {
    try {
      await productApi
        .getListProducts({ page: 1, limit: 10000 })
        .then((res) => {
          console.log(res);
          setProduct(res.data.docs);
          setLoading(false);
        });
    } catch (error) {
      console.log("Failed to fetch product list:" + error);
    }
  };

  const handleDeleteCategory = async (id) => {
    setLoading(true);
    try {
      await productApi.deleteProduct(id).then((response) => {
        if (response === undefined) {
          notification["error"]({
            message: `Thông báo`,
            description: "Xóa sản phẩm thất bại",
          });
          setLoading(false);
        } else {
          notification["success"]({
            message: `Thông báo`,
            description: "Xóa sản phẩm thành công",
          });
          setCurrentPage(1);
          handleProductList();
          setLoading(false);
        }
      });
    } catch (error) {
      console.log("Failed to fetch event list:" + error);
    }
  };

  const handleChangeImage = (event) => {
    setImage(event.target.files[0]);
  };

  const handleProductEdit = (id) => {
    setOpenModalUpdate(true);
    (async () => {
      try {
        const response = await productApi.getDetailProduct(id);
        console.log(response);
        setId(id);
        form2.setFieldsValue({
          name: response.product.name,
          price: response.product.price,
          category: response?.product.category?._id,
          author: response?.product.author?._id,
          pulisher: response?.product.pulisher?._id,
          status: response.product.status,
          year: response.product.year,
          stock: response.product.stock,
          pages: response.product.pages,
          weight: response.product.weight,
          size: response.product.size,
          form: response.product.form,
          salePrice: response.product.salePrice,
        });

        console.log(form2);
        setDescription(response.product.description);
        setLoading(false);
      } catch (error) {
        throw error;
      }
    })();
  };

  const handleFilter = async (name) => {
    try {
      const res = await productApi.searchProduct(name);
      setTotalList(res.totalDocs);
      setProduct(res.data.docs);
    } catch (error) {
      console.log("search to fetch category list:" + error);
    }
  };

  const handleChange = (content) => {
    console.log(content);
    setDescription(content);
  };

  const columns = [
    {
      title: "ID",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => <img src={image} style={{ height: 80 }} />,
      width: "10%",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Giá gốc",
      key: "price",
      dataIndex: "price",
      render: (slugs) => (
        <span>
          <div>
            {slugs?.toLocaleString("vi", {
              style: "currency",
              currency: "VND",
            })}
          </div>
        </span>
      ),
    },
    {
      title: "Giá giảm",
      key: "salePrice",
      dataIndex: "salePrice",
      render: (salePrice) => (
        <span>
          <Tag color="red" key={salePrice}>
            {salePrice?.toLocaleString("vi", {
              style: "currency",
              currency: "VND",
            })}
          </Tag>
        </span>
      ),
    },
    {
      title: "Năm xuất bản",
      key: "year",
      dataIndex: "year",
    },

    {
      title: "Số lượng",
      key: "stock",
      dataIndex: "stock",
      render: (stock) => (
        <span>
          <Tag color="green" key={stock}>
            {stock}
          </Tag>
        </span>
      ),
    },
    {
      title: "Số trang",
      key: "pages",
      dataIndex: "pages",
    },
    {
      title: "Trọng lượng",
      key: "weight",
      dataIndex: "weight",
      render: (weight) => (
        <span>
          <Tag color="green" key={weight}>
            {weight} gr
          </Tag>
        </span>
      ),
    },

    {
      title: "Kích thước",
      key: "size",
      dataIndex: "size",
      render: (text) => text,
    },

    {
      title: "Bìa sách",
      key: "form",
      dataIndex: "form",
    },

    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (res) => <span>{res?.name}</span>,
    },
    {
      title: "Tác giả ",
      dataIndex: "author",
      key: "author",
      render: (res) => <span>{res?.name}</span>,
    },
    {
      title: "Nhà xuất bản",
      dataIndex: "pulisher",
      key: "pulisher",
      render: (res) => <span>{res?.name}</span>,
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span>
          {status === "Available" ? (
            <Tag color="green">Còn hàng</Tag>
          ) : status === "Unavailable" ? (
            <Tag color="red">Hết hàng</Tag>
          ) : (
            <Tag color="yellow">Ngừng kinh doanh</Tag>
          )}
        </span>
      ),
    },

    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div>
          <Row>
            <div className="groupButton">
              <Button
                size="small"
                icon={<EditOutlined />}
                style={{
                  width: 150,
                  borderRadius: 5,
                  height: 30,
                  marginTop: 5,
                  backgroundColor: "green",
                }}
                type="primary"
                onClick={() => handleProductEdit(record._id)}
              >
                {"Chỉnh sửa"}
              </Button>
              <div style={{ marginTop: 5 }}>
                <Popconfirm
                  title="Bạn có chắc chắn xóa sản phẩm này?"
                  onConfirm={() => handleDeleteCategory(record._id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    className="btn-hover"
                    style={{
                      width: 150,
                      borderRadius: 5,
                      height: 30,
                      backgroundColor: "red",
                    }}
                    type="primary"
                  >
                    {"Xóa"}
                  </Button>
                </Popconfirm>
              </div>
            </div>
          </Row>
        </div>
      ),
    },
  ];

  const handleOpen = () => {
    setVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      form.resetFields();
      handleOkUser(values);
      setVisible(false);
    });
  };

  useEffect(() => {
    (async () => {
      try {
        await productApi
          .getListProducts({ page: 1, limit: 10000 })
          .then((res) => {
            console.log(res);
            setTotalList(res.totalDocs);
            setProduct(res.data.docs);
            setLoading(false);
          });

        await productApi
          .getListCategory({ page: 1, limit: 10000 })
          .then((res) => {
            console.log(res);
            setCategoryList(res.data.docs);
            setLoading(false);
          });
        await productApi
          .getListAuthor({ page: 1, limit: 10000 })
          .then((res) => {
            console.log(res);
            setAuthorList(res.data.docs);
            setLoading(false);
          });
        await productApi
          .getListPulisher({ page: 1, limit: 10000 })
          .then((res) => {
            console.log(res);
            setPulisherList(res.data.docs);
            setLoading(false);
          });
      } catch (error) {
        console.log("Failed to fetch event list:" + error);
      }
    })();
  }, []);

  // Định nghĩa state để theo dõi trạng thái của checkbox
  const [showPromotion, setShowPromotion] = useState(false);

  // Xử lý sự kiện khi checkbox được thay đổi
  const handleShowPromotionChange = (e) => {
    setShowPromotion(e.target.checked);
  };

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
                <FormOutlined />
                <span>Danh sách sản phẩm</span>
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
                  <Col span="6">
                    <Row justify="end">
                      <Space>
                        <Button
                          className="btn-hover"
                          onClick={handleOpen}
                          icon={<PlusOutlined />}
                          style={{ marginLeft: 10 }}
                          type="primary"
                        >
                          Tạo sản phẩm
                        </Button>
                      </Space>
                    </Row>
                  </Col>
                </Row>
              </PageHeader>
            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <Table
              columns={columns}
              dataSource={product}
              pagination={{ position: ["bottomCenter"] }}
            />
          </div>
        </div>

        <Drawer
          title="Tạo sản phẩm mới"
          visible={visible}
          onClose={() => setVisible(false)}
          width={1000}
          footer={
            <div
              style={{
                textAlign: "right",
              }}
            >
              <Button
                onClick={() => setVisible(false)}
                style={{ marginRight: 8 }}
                type="primary"
              >
                Hủy
              </Button>
              <Button onClick={handleSubmit} type="primary">
                Hoàn thành
              </Button>
            </div>
          }
        >
          <Form
            form={form}
            name="eventCreate"
            layout="vertical"
            initialValues={{
              residence: ["zhejiang", "hangzhou", "xihu"],
              prefix: "86",
            }}
            scrollToFirstError
          >
            <Spin spinning={loading}>
              <Form.Item
                name="name"
                label="Tên"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên!",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Tên" />
              </Form.Item>
              {!showPromotion && (
                <>
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn trạng thái!",
                      },
                    ]}
                    style={{ marginBottom: 10 }}
                  >
                    <Select placeholder="Chọn trạng thái">
                      <Select.Option value="Available">Còn hàng</Select.Option>
                      <Select.Option value="Unavailable">
                        Hết hàng
                      </Select.Option>
                      <Select.Option value="Discontinued">
                        Ngừng kinh doanh
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="price"
                    label="Giá gốc"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giá gốc!",
                      },
                    ]}
                    style={{ marginBottom: 10 }}
                  >
                    <Input placeholder="Giá gốc" type="number" />
                  </Form.Item>

                  <Form.Item
                    name="salePrice"
                    label="Giá giảm"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập giá giảm!",
                      },
                    ]}
                    style={{ marginBottom: 10 }}
                  >
                    <Input placeholder="Giá giảm" type="number" />
                  </Form.Item>
                </>
              )}
              <Form.Item
                name="year"
                label="Năm xuất bản"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập năm xuất bản",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Năm xuất bản" type="number" />
              </Form.Item>
              <Form.Item
                name="stock"
                label="Số lượng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập Số lượng",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Số lượng" type="number" />
              </Form.Item>
              <Form.Item
                name="pages"
                label="Số trang"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số trang",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Số trang" type="number" />
              </Form.Item>

              <Form.Item
                name="weight"
                label="Trọng lượng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập trọng lượng",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Trọng lượng" type="number" />
              </Form.Item>
              <Form.Item
                name="size"
                label="kích thước"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập kích thước",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Kích thước" type="text" />
              </Form.Item>
              <Form.Item
                name="form"
                label="Hình thức"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn hình thức",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select placeholder="Chọn form">
                  <Select.Option value="Bìa cứng">Bìa cứng</Select.Option>
                  <Select.Option value="Bìa mềm">Bìa mềm</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="image"
                label="Ảnh"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập chọn ảnh!",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <input
                  type="file"
                  onChange={handleChangeImage}
                  id="avatar"
                  name="file"
                  accept="image/png, image/jpeg"
                />
              </Form.Item>

              <Form.Item
                name="images"
                label="Hình ảnh slide"
                style={{ marginBottom: 10 }}
              >
                <Upload
                  name="images"
                  listType="picture-card"
                  showUploadList={true}
                  beforeUpload={() => false}
                  onChange={handleImageUpload}
                  multiple
                >
                  <Button icon={<UploadOutlined />}>Tải lên</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                name="category"
                label="Danh mục"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn danh mục!",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select
                  style={{ width: "100%" }}
                  tokenSeparators={[","]}
                  placeholder="Danh mục"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {category.map((item, index) => {
                    return (
                      <Option value={item._id} key={index}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                name="author"
                label="Author"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn tác giả!",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select
                  style={{ width: "100%" }}
                  tokenSeparators={[","]}
                  placeholder="Author"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {author.map((item, index) => {
                    return (
                      <Option value={item._id} key={index}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>

              <Form.Item
                name="pulisher"
                label="Pulisher"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn pulisher!",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select
                  style={{ width: "100%" }}
                  tokenSeparators={[","]}
                  placeholder="Pulisher"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {pulisher.map((item, index) => {
                    return (
                      <Option value={item._id} key={index}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mô tả!",
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <SunEditor
                  lang="en"
                  placeholder="Content"
                  onChange={handleChange}
                  setOptions={{
                    buttonList: [
                      ["undo", "redo"],
                      ["font", "fontSize"],
                      // ['paragraphStyle', 'blockquote'],
                      [
                        "bold",
                        "underline",
                        "italic",
                        "strike",
                        "subscript",
                        "superscript",
                      ],
                      ["fontColor", "hiliteColor"],
                      ["align", "list", "lineHeight"],
                      ["outdent", "indent"],

                      ["table", "horizontalRule", "link", "image", "video"],
                      // ['math'] //You must add the 'katex' library at options to use the 'math' plugin.
                      // ['imageGallery'], // You must add the "imageGalleryUrl".
                      // ["fullScreen", "showBlocks", "codeView"],
                      ["preview", "print"],
                      ["removeFormat"],

                      // ['save', 'template'],
                      // '/', Line break
                    ],
                    fontSize: [8, 10, 14, 18, 24], // Or Array of button list, eg. [['font', 'align'], ['image']]
                    defaultTag: "div",
                    minHeight: "500px",
                    showPathLabel: false,
                    attributesWhitelist: {
                      all: "style",
                      table: "cellpadding|width|cellspacing|height|style",
                      tr: "valign|style",
                      td: "styleinsert|height|style",
                      img: "title|alt|src|style",
                    },
                  }}
                />
              </Form.Item>
            </Spin>
          </Form>
        </Drawer>

        <Drawer
          title="Chỉnh sửa sản phẩm"
          visible={openModalUpdate}
          onClose={() => handleCancel("update")}
          width={1000}
          footer={
            <div
              style={{
                textAlign: "right",
              }}
            >
              <Button
                onClick={() => {
                  form2
                    .validateFields()
                    .then((values) => {
                      form2.resetFields();
                      handleUpdateProduct(values);
                    })
                    .catch((info) => {
                      console.log("Validate Failed:", info);
                    });
                }}
                type="primary"
                style={{ marginRight: 8 }}
              >
                Hoàn thành
              </Button>
              <Button onClick={() => handleCancel("update")}>Hủy</Button>
            </div>
          }
        >
          <Form
            form={form2}
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
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Tên" />
            </Form.Item>

            {!showPromotion && (
              <>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn trạng thái!",
                    },
                  ]}
                  style={{ marginBottom: 10 }}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Select.Option value="Available">Còn hàng</Select.Option>
                    <Select.Option value="Unavailable">Hết hàng</Select.Option>
                    <Select.Option value="Discontinued">
                      Ngừng kinh doanh
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="price"
                  label="Giá gốc"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập giá gốc!",
                    },
                  ]}
                  style={{ marginBottom: 10 }}
                >
                  <Input placeholder="Giá gốc" type="number" />
                </Form.Item>

                <Form.Item
                  name="salePrice"
                  label="Giá giảm"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập giá gốc!",
                    },
                  ]}
                  style={{ marginBottom: 10 }}
                >
                  <Input placeholder="Giá giảm" type="number" />
                </Form.Item>
              </>
            )}
            <Form.Item
              name="year"
              label="Năm xuất bản"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập năm xuất bản",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Năm xuất bản" type="number" />
            </Form.Item>
            <Form.Item
              name="stock"
              label="Số lượng"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập Số lượng",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Số lượng" type="number" />
            </Form.Item>
            <Form.Item
              name="pages"
              label="Số trang"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số trang",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Số trang" type="number" />
            </Form.Item>
            <Form.Item
              name="weight"
              label="Trọng lượng"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập trọng lượng",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Trọng lượng" type="number" />
            </Form.Item>
            <Form.Item
              name="size"
              label="kích thước"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập kích thước",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Kích thước" type="text" />
            </Form.Item>
            <Form.Item
              name="form"
              label="Hình thức"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn hình thức",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Select placeholder="Chọn form">
                <Select.Option value="Bìa cứng">Bìa cứng</Select.Option>
                <Select.Option value="Bìa mềm">Bìa mềm</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="image"
              label="Ảnh sản phẩm"
              style={{ marginBottom: 10 }}
            >
              <input
                type="file"
                onChange={handleChangeImage}
                id="avatar"
                name="file"
                accept="image/png, image/jpeg"
              />
            </Form.Item>

            <Form.Item
              name="images"
              label="Hình ảnh slide"
              style={{ marginBottom: 10 }}
            >
              <Upload
                name="images"
                listType="picture-card"
                showUploadList={true}
                beforeUpload={() => false}
                onChange={handleImageUpload}
                multiple
              >
                <Button icon={<UploadOutlined />}>Tải lên</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              name="category"
              label="Danh mục"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn danh mục!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Select
                style={{ width: "100%" }}
                tokenSeparators={[","]}
                placeholder="Danh mục"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {category.map((item, index) => {
                  return (
                    <Option value={item?._id} key={index}>
                      {item?.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item
              name="author"
              label="Tác giả"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn tác giả!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Select
                style={{ width: "100%" }}
                tokenSeparators={[","]}
                placeholder="Author"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {author.map((item, index) => {
                  return (
                    <Option value={item._id} key={index}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item
              name="pulisher"
              label="Pulisher"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn pulisher!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Select
                style={{ width: "100%" }}
                tokenSeparators={[","]}
                placeholder="Pulisher"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {pulisher.map((item, index) => {
                  return (
                    <Option value={item._id} key={index}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mô tả!",
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <SunEditor
                lang="en"
                placeholder="Content"
                onChange={handleChange}
                setContents={description}
                setOptions={{
                  buttonList: [
                    ["undo", "redo"],
                    ["font", "fontSize"],
                    // ['paragraphStyle', 'blockquote'],
                    [
                      "bold",
                      "underline",
                      "italic",
                      "strike",
                      "subscript",
                      "superscript",
                    ],
                    ["fontColor", "hiliteColor"],
                    ["align", "list", "lineHeight"],
                    ["outdent", "indent"],

                    ["table", "horizontalRule", "link", "image", "video"],
                    // ['math'] //You must add the 'katex' library at options to use the 'math' plugin.
                    // ['imageGallery'], // You must add the "imageGalleryUrl".
                    // ["fullScreen", "showBlocks", "codeView"],
                    ["preview", "print"],
                    ["removeFormat"],

                    // ['save', 'template'],
                    // '/', Line break
                  ],
                  fontSize: [8, 10, 14, 18, 24], // Or Array of button list, eg. [['font', 'align'], ['image']]
                  defaultTag: "div",
                  minHeight: "500px",
                  showPathLabel: false,
                  attributesWhitelist: {
                    all: "style",
                    table: "cellpadding|width|cellspacing|height|style",
                    tr: "valign|style",
                    td: "styleinsert|height|style",
                    img: "title|alt|src|style",
                  },
                }}
              />
            </Form.Item>
          </Form>
        </Drawer>

        <BackTop style={{ textAlign: "right" }} />
      </Spin>
    </div>
  );
};

export default ProductList;

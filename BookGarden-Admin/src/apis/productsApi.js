import axiosClient from "./axiosClient";

const productApi = {
  /*Danh sách api category */

  createCategory(data) {
    const url = "/category/search";
    return axiosClient.post(url, data);
  },
  getDetailCategory(id) {
    const url = "/category/" + id;
    return axiosClient.get(url);
  },
  getComplaint() {
    const url = "/complaint";
    return axiosClient.get(url);
  },
  getListCategory(data) {
    const url = "/category/search";
    if (!data.page || !data.limit) {
      data.limit = 10;
      data.page = 1;
    }
    return axiosClient.post(url, data);
  },
  deleteCategory(id) {
    const url = "/category/" + id;
    return axiosClient.delete(url);
  },
  searchCategory(name) {
    const params = {
      name: name.target.value,
    };
    const url = "/category/searchByName";
    return axiosClient.get(url, { params });
  },

  /*Danh sách api author */

  createAuthor(data) {
    const url = "/author/search";
    return axiosClient.post(url, data);
  },
  getDetailAuthor(id) {
    const url = "/author/" + id;
    return axiosClient.get(url);
  },
  getListAuthor(data) {
    const url = "/author/search";
    if (!data.page || !data.limit) {
      data.limit = 10;
      data.page = 1;
    }
    return axiosClient.post(url, data);
  },
  deleteAuthor(id) {
    const url = "/author/" + id;
    return axiosClient.delete(url);
  },
  searchAuthor(name) {
    const params = {
      name: name.target.value,
    };
    const url = "/author/searchByName";
    return axiosClient.get(url, { params });
  },

  /*Danh sách api pulisher */

  createPulisher(data) {
    const url = "/pulisher/search";
    return axiosClient.post(url, data);
  },
  getDetailPulisher(id) {
    const url = "/pulisher/" + id;
    return axiosClient.get(url);
  },
  getListPulisher(data) {
    const url = "/pulisher/search";
    if (!data.page || !data.limit) {
      data.limit = 10;
      data.page = 1;
    }
    return axiosClient.post(url, data);
  },
  deletePulisher(id) {
    const url = "/pulisher/" + id;
    return axiosClient.delete(url);
  },
  searchPulisher(name) {
    const params = {
      name: name.target.value,
    };
    const url = "/pulisher/searchByName";
    return axiosClient.get(url, { params });
  },

  /*Danh sách api product */

  createProduct(data) {
    const url = "/product/search";
    return axiosClient.post(url, data);
  },
  getDetailProduct(id) {
    const url = "/product/" + id;
    return axiosClient.get(url);
  },
  getListProducts(data) {
    const url = "/product/search";
    if (!data.page || !data.limit) {
      data.limit = 10;
      data.page = 1;
    }
    return axiosClient.post(url, data);
  },
  deleteProduct(id) {
    const url = "/product/" + id;
    return axiosClient.delete(url);
  },

  uploadImage() {
    const url = "/upload/uploadfile";
    return axiosClient.post(url);
  },
  searchProduct(name) {
    const params = {
      name: name.target.value,
    };
    const url = "/product/searchByName";
    return axiosClient.get(url, { params });
  },
};

export default productApi;

import axiosClient from "./axiosClient";

const userApi = {
  login(email, password) {
    const url = "/auth/login";
    return axiosClient
      .post(url, {
        email,
        password,
      })
      .then((response) => {
        console.log(response);
        if (response) {
          localStorage.setItem("client", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
        }
        return response;
      });
  },
  logout(data) {
    const url = "/user/logout";
    return axiosClient.get(url);
  },
  pingRole() {
    const url = "/user/ping_role";
    return axiosClient.get(url);
  },
  getProfile() {
    const url = "/user/profile";
    return axiosClient.get(url);
  },
  getProfileById(id) {
    const url = "/user/profile/" + id;
    return axiosClient.get(url);
  },
  updateProfile(editedUserData) {
    const url = "/user/" + editedUserData._id;
    return axiosClient.put(url, editedUserData);
  },
  forgotPassword(data) {
    const url = "/user/forgot-password";
    return axiosClient.post(url, data);
  },
};

export default userApi;

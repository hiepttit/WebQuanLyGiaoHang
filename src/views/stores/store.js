import { setStore, getStore, removeItem } from '../../components/config/utils.js'
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
import { ref } from "@vue/composition-api";


const user = getStore('user');
const LoginUser = ref("");

LoginUser.value = user;

async function get(...args) {
  //inject token
  if (user && user.token) {
    !args[1] && (args[1] = {});
    !args[1].headers && (args[1].headers = {});
    args[1].headers.Authorization = "Bearer " + user.token;
  }
  
  let resp = await window.fetch(...args);
  // if (resp.status === 401) alert("Sai tên đăng nhập hoặc mật khẩu");
  // resp.status === 401 && user && removeItem('user');   
  if (resp.status !== 200) throw resp;
  return resp;
}

const api = {
  get,
  post(url, data, type) {
    let option = {
      method: "POST"
    };

    if (type && (type == "application/x-www-form-urlencoded" || "multipart/form-data")) {
      option.body = data;
      return get(url, option);
    }

    if (typeof data === "object") {
      option.body = JSON.stringify(data);
      option.headers = {
        "Content-Type": "application/json"
      };
    } else {
      option.body = data;
      option.headers = {
        "Content-Type": "text/plain"
      };
    }
    return get(url, option);
  },
  delete(url) {
    return get(url, {
      method: "DELETE"
    });
  },
  patch(url, data) {
    return get(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  },
  put(url, data) {
    return get(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  }
};
export default {
  curUser: LoginUser,
  api,
  setLoginUser(res) {
    setStore('user', res);
    LoginUser.value = user;
  },
  async login(model) {
    let resp = await api.post("http://localhost:49811/api/authenticate/login", model);   
      if (resp && resp.status == 200) {
        let data = await resp.json();
        if (data && data.token) {
          setStore('user', data);
          LoginUser.value = user;
          return;
        }
        throw data.errorCode || data.message;
      } else {
        throw "LoginFailed";
      }
  },
}
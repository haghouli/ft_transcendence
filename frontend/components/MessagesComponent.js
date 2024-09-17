import { fetchData } from "../utilities/fetch.js";
import user from "../utilities/user.js";
import { BACKEND_BASED_URL, getCookie, COOKIE_NAME } from "../utilities/var.js";


export default class MessagesComponent {
  constructor(message) {
    this.cssPath = "./css/Chat.css";
    this.message = message;
  }

  getCssPath = () => {
    return this.cssPath;
  };


  init() {

  }

  render() {

    if (this.message.message_user.id == user.data.id) {
      return `<div class="msg_container received">
        <div class="img_cont_msg">
            <img src="${BACKEND_BASED_URL}${this.message.message_user.avatar}" class="user_img_msg">
        </div>
        <div class="msg_cotainer">
            ${this.message.message_content}
        </div>
      </div>`
    } else {
      return `
        <div class="msg_container sent">
          <div class="msg_cotainer_send">
          ${this.message.message_content}
          </div>
          <div class="img_cont_msg">
              <img src="${BACKEND_BASED_URL}${this.message.message_user.avatar}" class="user_img_msg">
          </div>
        </div>`
    }
  }
}

import { BACKEND_BASED_URL, getChatRoomSocket } from "../utilities/var.js";

export default class ChatRooms {
  constructor(chatRoom, messagesRender) {
    this.chatRoom = chatRoom;
    this.cssPath = "./css/Chat.css";
    this.messagesRender = messagesRender;
  }

  getCssPath = () => {
    return this.cssPath;
  };

  init() {
    document
      .getElementById(`room_${this.chatRoom.id}`)
      .addEventListener("click", () => {
        this.messagesRender(this.chatRoom.id);
        chatSocket = getChatRoomSocket(this.chatRoom.id);
        chatRoom = this.chatRoom;

        document.getElementById('chat_room_reciever').innerHTML = `
          <div class="img_cont">
            <img src="${BACKEND_BASED_URL}${this.chatRoom.user.avatar}" class="user_img">
            <span class="${ this.chatRoom.user.is_online ? "online_icon" : "online_icon offline"}"></span>
          </div>
          <div class="user_info">
            <span>${this.chatRoom.user.username}</span>
            <p>1767 Messages</p>
          </div>
          <div class="video_cam">
            <span><i class="fas fa-video"></i></span>
            <span><i class="fas fa-phone"></i></span>
          </div>
        `
      });
  }

  render() {

    return `
      <li class="active" id="room_${this.chatRoom.id}">
          <div class="contact">
              <div class="img_cont">
                  <img src="${BACKEND_BASED_URL}${this.chatRoom.user.avatar}" class="user_img">
                  <span class="${ this.chatRoom.user.is_online ? "online_icon" : "online_icon offline"}"></span>
              </div>
              <div class="user_info">
                  <span>${this.chatRoom.user.username}</span>
                  <p>${ this.chatRoom.user.is_online ? "online" : "offline"}</p>
              </div>
          </div>
      </li>
    `;
  }
}

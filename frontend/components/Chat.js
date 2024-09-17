import { getChatRoomSocket, httpGet } from "../utilities/var.js";
import ChatRooms from "./ChatRooms.js";
import MessagesComponent from "./MessagesComponent.js";

const getFirstChatRoom = (chatRooms) => {
  if(chatRooms.length == 0)
    return -1;
  return chatRooms[0];
}

const sendMessage = () => {
  const messageInput = document.getElementById('message_content');
  const message_content = messageInput.value;
  if(message_content == '') {
    alert('message empty');
    return;
  }

  if (chatSocket.readyState === WebSocket.OPEN) {
    chatSocket.send(JSON.stringify({
        'message': message_content,
        'sender_id': user.data.id,
    }));
  } else {
    console.error('WebSocket connection is not open.');
  }

  messageInput.value = "";
}

const messagesRender = async (id) => {
  const chatRoomMessages = await httpGet(`/api/chat_rooms/room/messages/last_20/${id}`);

  const renderPromises2 = chatRoomMessages.map(async (item) => {
    const component = new MessagesComponent(item);
    const renderedContent = await component.render();
    return { renderedContent, component };
  });

  const renderedResults2 = await Promise.all(renderPromises2);
  const content2 = renderedResults2.map((result) => result.renderedContent).join("");
  const components2 = renderedResults2.map((result) => result.component);

  document.getElementById("scroll2").innerHTML = content2;

  components2.forEach((component) => component.init());
}

const renderChatRooms = async (chatRooms) => {

  const renderPromises = chatRooms.map(async (item) => {
    const component = new ChatRooms(item, messagesRender);
    const renderedContent = await component.render();
    return { renderedContent, component };
  });

  const renderedResults = await Promise.all(renderPromises);
  const content = renderedResults
    .map((result) => result.renderedContent)
    .join("");
  
  const components = renderedResults.map((result) => result.component);
  document.getElementById("scroll").innerHTML = content;
  components.forEach((component) => component.init());

}

export default class chatComponent {
  constructor() {
    this.cssPath = "./css/Chat.css";
    this.userChatRooms = null;
  }

  getCssPath = () => {
    return this.cssPath;
  };

  addEvent = () => {
    const actionMenuBtn = document.getElementById("action_menu_btn");
    const actionMenu = document.querySelector(".action_menu");

    actionMenuBtn.addEventListener("click", () => {
      actionMenu.style.display = actionMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
      if (
        !actionMenu.contains(event.target) &&
        !actionMenuBtn.contains(event.target)
      ) {
        actionMenu.style.display = "none";
      }
    });
  };

  async init() {
    this.addEvent();

    // fill the chat rooms and the message at the start
    this.userChatRooms = await httpGet(`/api/users/user/chat_rooms/${user.data.id}`);
    renderChatRooms(this.userChatRooms);
    const first = getFirstChatRoom(this.userChatRooms);
    if(first != -1) {
      messagesRender(first.id);
      chatSocket = getChatRoomSocket(first.id);
      window.chatRoom = first;
    }

    document.getElementById('send_message').addEventListener('click', () => {
      sendMessage();
    })

    // search room 
    document.getElementById('room-search-btn').addEventListener('click', ()=> {
      const value = document.getElementById('room-search').value;
      const filteredChatRooms = this.userChatRooms.filter(item => item.user.username.toLowerCase().includes(value.toLowerCase()))
      renderChatRooms(filteredChatRooms);
    })
  }

  async render() {
    return `
        <div class="chat">
            <div class="contacts-part">
                <div class="contact-part-header">
                    <div class="contact-header">
                        <input type="text" class="input" name="txt" placeholder="Search..." id="room-search">
                        <div class="contact-search-icon" id="room-search-btn">
                            <i class="bi bi-search" id="searchIcon"></i>
                        </div> 
                    </div>
                </div>
                <div class="contact-body">
                    <ul class="contacts" id="scroll">

                    </ul>
                </div>
                <div class="add-fr">
                    <div class="button">
                        <span class="plus">+</span>
                        <span class="text">Add Friend</span>
                    </div>
                </div>
            </div>
            <div class="messages-part">
              <div class="msg_head">
                    <div class="msg_header_info" id="chat_room_reciever">
                        
                    </div>
                    <div id="action_menu_container">
                        <span id="action_menu_btn"><i class="bi bi-three-dots-vertical"></i></span>
                        <div class="action_menu">
                            <ul>
                                <li><i class="fas fa-user-circle"></i> View profile</li>
                                <li><i class="fas fa-users"></i> Add to close friends</li>
                                <li><i class="fas fa-plus"></i> Add to group</li>
                                <li><i class="fa-solid fa-ban"></i> Block</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="msg_card_body" id="scroll2">
     
                </div>
                <div class="new_msg">
                    <div class="input-group">
                        <textarea name="" class="type_msg" placeholder="Type your message..." id="message_content"></textarea>
                        <button class="send_btn" type="button" id="send_message"><i class="bi bi-send-fill"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;
  }
}

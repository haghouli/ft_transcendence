import { createElement } from '../utilities/genrateHtml.js'
import chatObject from "../ComponentsObjects/ChatObject.js";

export default class chatComponent {
    constructor(){
        this.chatRooms = [];
        this.chat_room = null;
        this.friendship = null;
        this.currentUser = null;
        this.handler = new chatObject(this);
        this.chatSocket = userWebSocket;
    }

    async init() {
        // this.addEvent();
        this.handler.addriend();
        this.handler.Responsive();
        this.handler.addUserSocketListener();
        this.handler.fillChatRooms();

        const messageSection = document.getElementById('messages-div');
        const myDiv = createElement('div', {class: 'message-empty'}, [`${i18next.t('chat.emptyMessages')}`]);
        messageSection.appendChild(myDiv);

        this.handler.chatRoomSearch();
    }

    closeup() {
        this.chatRooms = [];
        this.chat_room = null;
        this.friendship = null;
        this.currentUser = null;
        this.handler = null;
        this.chatScocket = null;
    }

    async render() {
        return `
            <div class="chat">
                <div class="contacts-part">
                    <div class="contact-part-header">
                        <div class="contact-header">
                            <input type="text" id="chat-room-search" class="input" name="txt" placeholder="${i18next.t('search')}">
                            <div class="contact-search-icon" id="search-section">
                                <i class="bi bi-search" id="searchIcon"></i>
                            </div> 
                        </div>
                    </div>
                    <ul class="contacts scroll" id="contacts">
                        
                    </ul>
                    <div class="add-fr">
                        <div class="button" id="toggleButton">
                            <span class="plus" id="plusIcon"><i class="fas fa-plus"></i></span>
                        </div>
                    </div>
                </div>
                <div class="messages-saver" >
                    <div id="messages-div" class="messages-part">
                        <div class="chatHead">

                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
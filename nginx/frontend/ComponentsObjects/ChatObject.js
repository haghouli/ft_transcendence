import { httpGet, httpPost, navigate, getCookie, formatTime, logout } from "../utilities/utiles.js";
import { BACKEND_BASED_URL, COOKIE_NAME, DEFAULT_GAME_COOKIE } from "../utilities/constants.js";
import { createElement } from '../utilities/genrateHtml.js'
import { errorAlert, infoAlert, botAlert, worningAlert } from "../utilities/alerts.js";
import { refreshAccessToken } from "../utilities/utiles.js";
import { fillNotificationBarr } from '../components/MainComponent.js'

const banUser = async (friend_id) => {
    try {
        const token = getCookie(COOKIE_NAME);
        if(token) {
            const response = await fetch(`${BACKEND_BASED_URL}/api/users/user/ban_user2/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({
                    user_2: friend_id,
                })
            });
    
            if(response.status == 200) {
                return true;
            }
            if(response.status === 401)
            {
                await refreshAccessToken();
                return await banUser(friend_id);
            }
            errorAlert(i18next.t('alerts.errorOccures'));
            return false;
    
        }   else {
            errorAlert(i18next.t('alerts.error'));
            logout();
        }
    }catch {
        logout();
    }
}

const unbanUser = async (friend_id) => {
    try {
        const token = getCookie(COOKIE_NAME);
        if(token) {
            const response = await fetch(`${BACKEND_BASED_URL}/api/users/user/unban_user/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }, body: JSON.stringify({
                    user_2: friend_id,
                })
            });
    
            if(response.status == 200)
                return true;
            if(response.status === 401)
            {
                await refreshAccessToken();
                return await unbanUser(friend_id);
            }
            errorAlert(i18next.t('alerts.errorOccures'));
            return false;
    
        } else {
            errorAlert(i18next.t('alerts.error'));
            logout();
        }

    }catch {
        logout();
    }
}

const getFriendShip = async (id) => {
    const friendship = await httpGet(`/api/users/user/friend_ship/${id}`)
    return friendship;
}

const getChatRoomMessages =  async (chatroom_id) => {
    const messages = await httpGet(`/api/chat_rooms/room/messages/${chatroom_id}`);
    return messages;
}

const getFriends = async (user_id) => {
    const friends = await httpGet(`/api/users/user/friends/${user_id}`);
    return friends;
}

const  getChatRooms =  async (user_id) => {
    const chatRooms = await httpGet(`/api/users/user/chat_rooms/${user_id}`);
    return chatRooms;
}

const createChatRoom = async (user2_id) => {
    const bodyData =  {user2 : user2_id};
    try {
        const token = await getCookie(COOKIE_NAME);
        if (token !== "") {
            const response = await fetch(`${BACKEND_BASED_URL}/api/chat_rooms/room/`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify(bodyData),
            }
            );
            const data = await response.json();
            if (response.status === 200) {
                infoAlert(i18next.t('alerts.chatRoomCreateSuccess'));
                return data;
            }
            if(response.status === 401)
            {
                await refreshAccessToken();
                return await httpPost(url, bodyData);
            }
            if(response.status === 409) {
                worningAlert(i18next.t('alerts.chatExist'));
                return null;
            }
            return null;
        } else {
            logout();
            return null;
        }
    } catch {
        logout();
        return null;
    }
}

export default class chatComponent {

    constructor(object) {
        this.object = object;
    }

    sendPLayRequest() {
        const message = {
            'message_content': 'play request sended',
            'send_date': new Date(),
            'message_user': user.data,
        }
        const senderCard = this.createSenderCard(message)
        document.getElementById('messages-body').appendChild(senderCard);

        if(this.object.chatSocket.readyState === WebSocket.OPEN) {
            
            this.object.chatSocket.send(JSON.stringify({
                'action': 'play_request',
                'message': 'new play request',
                'sender_id': user.data.id,
                'reciever_id': this.object.currentUser.id
            }))
        }
    }

    async blockUser() {
        await banUser(this.object.currentUser.id);
        this.object.friendship = await getFriendShip(this.object.currentUser.id);
        const chatHead = document.getElementById('chat-head');
        const MessageInput = document.getElementById('chat-bottom');
        this.fillChatHead(chatHead);
        this.fillMessageSendInput(MessageInput);
    }

    async deblockUser() {
        await unbanUser(this.object.currentUser.id);
        this.object.friendship = await getFriendShip(this.object.currentUser.id);
        const chatHead = document.getElementById('chat-head');
        const MessageInput = document.getElementById('chat-bottom');
        this.fillChatHead(chatHead);
        this.fillMessageSendInput(MessageInput);
    }

    createHeadToggle = () => {
        const i = createElement('i', {class: 'bi bi-three-dots-vertical'}, []);
        const span = createElement('span', {id: 'action_menu_btn'}, [i]);
    
        const viewProfileIcon = createElement('i', {class: 'fa fa-user-circle'}, []);
        const sendPlayRequestIcone = createElement('i', {class: 'fa-solid fa-gamepad'}, []);
        const banIcon = createElement('i', {class: 'fa-solid fa-ban'}, []);
        const unbanIcon = createElement('i', {class: 'fa-solid fa-ban'}, []);
    
        const liViewProfile = createElement('li', {}, [viewProfileIcon, `${i18next.t('chat.viewProfile')}`]);
        const liSendPlayRequest = createElement('li', {}, [sendPlayRequestIcone, `${i18next.t('chat.sendPlayReq')}`]);
    
        liViewProfile.addEventListener('click', ()=> {
            if(this.object.chat_room.chat_type == 1) {
                return;
            }
            if(!this.object.friendship || this.object.friendship.status == -1) {
                return;
            }
            navigate(`/profile?id=${this.object.currentUser.id}`);
        })
        
        liSendPlayRequest.addEventListener('click', () => {
            if(this.object.chat_room.chat_type == 1) {
                return;
            }
            if(!this.object.friendship || this.object.friendship.status == -1) {
                return;
            }
            this.sendPLayRequest();
        })
        
        const liBlock = createElement('li', {}, [banIcon, `${i18next.t('chat.block')}`]);
        liBlock.addEventListener('click',  async () => {
            if(this.object.chat_room.chat_type == 1) {
                return;
            }
            if(!this.object.friendship || this.object.friendship.status == -1) {
                return;
            }
            this.blockUser();
        })
        
        const liDeblock = createElement('li', {}, [unbanIcon, `${i18next.t('chat.deblock')}`]);
        liDeblock.addEventListener('click', async () => {
            if(this.object.chat_room.chat_type == 1) {
                return;
            }
            if(this.object.friendship.banner_id != user.data.id
            && (!this.object.friendship || this.object.friendship.status == -1)) {
                return;
            }
            this.deblockUser();
        })

        const li = !this.object.friendship || this.object.friendship.status == 0 || this.object.friendship.status == -1  ? liDeblock : liBlock;
    
        const ul = createElement('ul', {}, [liViewProfile, li, liSendPlayRequest]);
        const div1 = createElement('div', {class: 'action_menu'}, [ul]);
    
        const div2 = createElement('div', {id: 'action_menu_container'}, [span, div1]);
    
        div2.addEventListener('click', () => {
            div1.style.display = div1.style.display === 'block' ? 'none' : 'block';});
    
            // Close the menu if clicked outside
            div1.addEventListener('click', (event) => {
            if (!div1.contains(event.target) && !div2.contains(event.target)) {
                div1.style.display = 'none';
            }
        });
    
        return div2;
    }
    
    createChatFriendCard = (user) => {
    
        const image = createElement('img', {src: `${BACKEND_BASED_URL}${user.avatar}`, class: 'user_img'}, []);
        const span = createElement('span', {}, [`${user.username}`]);
    
        const i = createElement('i', {class: 'bi bi-plus-circle'}, []);
    
        const div1 = createElement('div', {class: 'saver'}, [image, span]);
        const div2 = createElement('div', {class: 'icon'}, [i]);
        const li = createElement('li', {class: 'friend'}, [div1, div2]);
    
        i.addEventListener('click', () => {
            createChatRoom(user.id);
        })
    
        return li;
    }
    
    createSenderCard = (message) => {

        const formatedTime = formatTime(message.send_date);
    
        const span = createElement('span', {class: 'msg_time_send'}, [`${formatedTime}`]);

        const imagePath = this.object.chat_room.chat_type == 1 ? '../../assets/robot.png' : `${BACKEND_BASED_URL}${message.message_user.avatar}`;

        const image = createElement('img', {class: 'user_img_msg', src: `${imagePath}`});
    
        const div1 = createElement('div', {class: 'msg_cotainer_send'}, [`${message.message_content}`, span]);
        const div2 = createElement('div', {class: 'img_cont_msg'}, [image]);
    
        const messageContainer = createElement('div', {class: 'msg_container sent'}, [div1, div2]);
    
        return messageContainer;
    }
    
    createRecieverCard = (message) => {
        const formatedTime = formatTime(message.send_date);

        const span = createElement('span', {class: 'msg_time'}, [`${formatedTime}`]);
        const image = createElement('img', {class: 'user_img_msg', src: `${BACKEND_BASED_URL}${message.message_user.avatar}`});
    
        const div1 = createElement('div', {class: 'msg_cotainer'}, [`${message.message_content}`, span]);
        const div2 = createElement('div', {class: 'img_cont_msg'}, [image]);
    
        const messageContainer = createElement('div', {class: 'msg_container received'}, [div2, div1]);
    
        return messageContainer;
    }
    
    createMessages = async (messagesContainerBody, ChatRoomMessages) => {
        ChatRoomMessages.map(item => {
            const element = user.data.id == item.message_user.id ? this.createSenderCard(item) : this.createRecieverCard(item);
            messagesContainerBody.appendChild(element);
        })
    }

    fillChatHead(messageHead) {
        messageHead.textContent = '';
        let stateClass = ''

        this.object.currentUser.is_online ? stateClass = 'online_icon' :stateClass = 'offline'

        const currentUserImage = this.object.chat_room.user.id == user.data.id ? '../../assets/robot.png' : `${BACKEND_BASED_URL}${this.object.currentUser.avatar}`;
        const name = this.object.chat_room.user.id == user.data.id ? 'Bot' :  this.object.currentUser.username;
    
        const image = createElement('img', {class: 'user_img', src: currentUserImage}, []);
        const span1 = createElement('span', {class: stateClass});
    
        const span2 = createElement('span', {}, [`${name}`]);
        // const p = createElement('p', [], ['1767 Messages']);
    
        const imageContent = createElement('div', {class: 'img_cont'}, [image, span1]);
        const userInfo = createElement('div', {class: 'user_info'}, [span2]);
    
        const messageHeadInfo = createElement('div', {class: 'msg_header_info'}, [imageContent, userInfo]);
    
        const headTogle = this.createHeadToggle(this.object.currentUser);
    
        
        if(!this.object.friendship || this.object.friendship.status == 0 || this.object.friendship.status == -1) {
            if(!this.object.friendship || this.object.friendship.status == 0 || this.object.friendship.banner_id == this.object.chat_room.user.id) {
                messageHead.style.pointerEvents = 'none';
                messageHead.style.opacity = '0.5';
            }
        } else {
            messageHead.style.pointerEvents = 'initial';
            messageHead.style.opacity = '1';
        }
    
        messageHead.appendChild(messageHeadInfo);
        
        //chaeck of bot
        if(this.object.chat_room.chat_type != 1) {
            messageHead.appendChild(headTogle);
        }
    }
    
    createChatHead = () => {
        const messageHead = createElement('div', {class: 'msg_head', id: "chat-head"}, []);
        this.fillChatHead(messageHead);
        return messageHead;
    }

    fillMessageSendInput = (divInput) => {

        divInput.textContent = '';
    
        const i = createElement('i', {class: "bi bi-send-fill"}, []);
    
        const textArea = createElement('textarea', {name: "", class: 'type_msg', id:'message-send-content', placeholder: `${i18next.t('chat.tapeYourMessaege')}`});
        const btn = createElement('button', {class: 'send_btn', type: 'button'}, [i]);
    
        const div1 = createElement('div', {class: 'input-group'}, [textArea, btn]);

        btn.addEventListener('click', ()=> {
            if(this.object.chat_room.chat_type == 1) {
                return;
            }
            if(!this.object.friendship || this.object.friendship.status == -1) {
                return;
            }
            const inputValue = textArea.value;
            if(
                this.object.chatSocket.readyState === WebSocket.OPEN) {
                if(inputValue == '')
                    return;
                
                this.object.chatSocket.send(JSON.stringify({
                    'message': inputValue,
                    'sender_id': user.data.id,
                    'reciever_id': this.object.currentUser.id,
                    'action': 'chatting',
                }))
                
                const message = {
                    'message_content': inputValue,
                    'send_date': new Date(),
                    'message_user': user.data,
                }
                
                const messagesContainerBody = document.getElementById('messages-body');
                const element = user.data.id == message.message_user.id ? this.createSenderCard(message) : this.createRecieverCard(message);
                messagesContainerBody.appendChild(element);
                textArea.value = '';
            }
        })
        
        if(!this.object.friendship || this.object.friendship.status == 0 || this.object.friendship.status == -1) {
            divInput.style.pointerEvents = 'none';
            divInput.style.opacity = '0.5';
        } else {
            divInput.style.pointerEvents = 'initial';
            divInput.style.opacity = '1';
        }

        divInput.appendChild(div1);
    }
    
    createMessageSendInput = () => {
        const divInput = createElement('div', {class: 'new_msg', id: "chat-bottom"});
        this.fillMessageSendInput(divInput);
        return divInput;
    }

    createGameInvitation() {


        const br = createElement('br', {}, []);
        const p = createElement('p', {}, ['GameRequest', br, `${i18next.t('chat.acceptChallenge')}`]);

        
        const btn1 = createElement('button', {id: 'acceptBtn'}, [`${i18next.t('chat.accept')}`]);
        const btn2 = createElement('button', {id: 'declineBtn'}, [`${i18next.t('chat.decline')}`]);
        const div10 = createElement('div', {class: 'chat_btns'}, [btn1, btn2]);
        const div = createElement('div', {class: 'game-request', id: 'gameRequest'}, [p, div10]);
                        
        btn1.addEventListener('click', () => {
            this.playRequestAccept(div);
        })
        
        btn2.addEventListener('click', () => {
            div.remove();
        })

        setTimeout(() => {
            div.remove();
        }, 3000);

        return div;
    }

    createMessagesBody = async () => {
        if(!this.object.chat_room)
            return;

        this.object.friendship = await getFriendShip(this.object.chat_room.user.id);
    
        const messagesDiv = document.getElementById('messages-div');
        messagesDiv.textContent = '';
        
        const chatHead = this.createChatHead(this.object.chat_room.user);
        

        const messagesContainerBody = createElement('div', {class: 'msg_card_body scroll', id: 'messages-body'}, [/*gameInvitaion*/]);

        const ChatRoomMessages = await getChatRoomMessages(this.object.chat_room.id);
        this.createMessages(messagesContainerBody, ChatRoomMessages);
    
        // create message send input
        const messageSendSection = this.createMessageSendInput();
        
        messagesDiv.appendChild(chatHead);
        messagesDiv.appendChild(messagesContainerBody);
        messagesDiv.appendChild(messageSendSection);
    }
    
    createChatRoomCard = (chat_room) => {
    
        const statusText = chat_room.user.is_online ? i18next.t('chat.online') : i18next.t('chat.offline') ;
        const statusClass = chat_room.user.is_online ? 'online_icon' : 'offline';

        const currentUserImage = chat_room.user.id == user.data.id ? '../../assets/robot.png' : `${BACKEND_BASED_URL}${chat_room.user.avatar}`;
        const image = createElement('img', {class: 'user_img', src: currentUserImage}, []);
        const span1 = createElement('span', {class: statusClass}, []);
        
        const name = chat_room.user.id == user.data.id ? 'Bot' :  chat_room.user.username;
        const span2 = createElement('span', {}, [`${name}`]);
        const p = createElement('p', {}, [statusText]);
        
        const div1 = createElement('contact', {class: 'img_cont'}, [image, span1]);
        const div2 = createElement('contact', {class: 'user_info'}, [span2, p]);
    
        const div3 = createElement('contact', {class: 'contact'}, [div1, div2]);
        const li = createElement('li', {class: 'active'}, [div3]);
    
        li.addEventListener('click', () => {
            if (window.innerWidth <= 800 || window.innerWidth < 1100) {
                // Hide the contacts part
                document.querySelector('.contacts-part').style.display = 'none';
    
                // Show the messages part
                document.querySelector('.messages-saver').style.display = 'flex';
    
                const userName = event.currentTarget.querySelector('.user_info span').textContent.trim();
    
                // Update the URL by appending the username
                const currentUrl = window.location.href.split('#')[0];
                window.history.pushState({}, '', `${currentUrl}#/chat?name=${encodeURIComponent(userName)}`);
            }
        });
    
        li.addEventListener('click', async () => {
            this.object.chat_room = chat_room;
            if(!this.object.currentUser || this.object.chat_room.user.id != this.object.currentUser.id) {
                this.object.currentUser = chat_room.user;
                this.createMessagesBody();
            }
        })
    
        return li;
    }

    fillChatRooms = async () => {
        this.object.chatRooms = await  getChatRooms(user.data.id);

        const contactsList = document.getElementById('contacts');

        contactsList.textContent = "";

        const plusSpan = document.getElementById('plusIcon');

        const searchKey = document.getElementById('chat-room-search').value;
        contactsList.textContent = '';

        const filteredChatRooms = this.object.chatRooms.filter(
            item =>  item.user.username.includes(searchKey)
        );
    
        filteredChatRooms.map((item) => {
            const chatRoomCard = this.createChatRoomCard(item);
            contactsList.appendChild(chatRoomCard);
        })
        plusSpan.innerHTML = '<i class="fas fa-plus"></i>';
    }
    
    fillChatFriends = async (contactsList, plusSpan) => {
        contactsList.textContent = '';
        const friends = await getFriends(user.data.id);
        friends.map((item) => {
            const friendCard = this.createChatFriendCard(item);
            contactsList.appendChild(friendCard);
        })
        plusSpan.innerHTML = '<i class="fas fa-times"></i>';
    }

    addEvent = () => {
        const actionMenuBtn = document.getElementById('action_menu_btn');
        const actionMenu = document.querySelector('.action_menu');

        actionMenuBtn.addEventListener('click', () => {
            actionMenu.style.display = actionMenu.style.display === 'block' ? 'none' : 'block';            });

            // Close the menu if clicked outside
            document.addEventListener('click', (event) => {
            if (!actionMenu.contains(event.target) && !actionMenuBtn.contains(event.target)) {
                actionMenu.style.display = 'none';
            }
        });
    }
     
    addriend = () => { 
        document.getElementById('toggleButton').addEventListener('click', async () => {
            const contactsList = document.getElementById('contacts');
            const plusSpan = document.getElementById('plusIcon');
            const textSpan = document.querySelector('.text');
            const isAddingFriend = plusSpan.querySelector('i').classList.contains('fa-plus');

            if (isAddingFriend) {
               this.fillChatFriends(contactsList, plusSpan);
            } else {
                this.fillChatRooms(contactsList, plusSpan);
            }
        });
    }
    
    chatRoomSearch = () => {
        document.getElementById('search-section').addEventListener('click', () => {
            const contactsList = document.getElementById('contacts');
            const plusSpan = document.getElementById('plusIcon');
            this.fillChatRooms(contactsList, plusSpan);
        })
    }

    // Responsive = () => {
    //     const handleContactClick = () => {
    //         if (window.innerWidth <= 800) {
    //             // Hide the contacts part
    //             document.querySelector('.contacts-part').style.display = 'none';
    //             // Show the messages part
    //             document.querySelector('.messages-saver').style.display = 'flex';

    //             const userName = event.currentTarget.querySelector('.user_info span').textContent.trim();
    
    //             // Update the URL by appending the username
    //             const currentUrl = window.location.href.split('#')[0];
    //             window.history.pushState({}, '', `${currentUrl}#/chat/${encodeURIComponent(userName)}`);
    //         }
    //     };

    //     // Select all contact list items
    //     const contactItems = document.querySelectorAll('.contacts .active');

    //     // Add event listener to each contact item
    //     contactItems.forEach(contact => {
    //         contact.addEventListener('click', handleContactClick);
    //     });
    // }

    Responsive = () => {
        const contactPart = document.querySelector('.contacts-part');
        const messagepart = document.querySelector('.messages-saver');

        const handleContactClick = () => {
            if (window.innerWidth <= 820 || window.innerWidth <= 1099) {
                document.querySelector('.contacts-part').style.display = 'none';
                document.querySelector('.messages-saver').style.display = 'flex';

                const userName = event.currentTarget.querySelector('.user_info span').textContent.trim();
    
                // Update the URL by appending the username
                const currentUrl = window.location.href.split('#')[0];
                window.history.pushState({}, '', `${currentUrl}#/chat/${encodeURIComponent(userName)}`);
            }
            else{
                document.querySelector('.contacts-part').style.display = 'flex';
                document.querySelector('.messages-saver').style.display = 'flex';
            }
        };

        const contactItems = document.querySelectorAll('.contacts .active');

        contactItems.forEach(contact => {
            contact.addEventListener('click', handleContactClick);
        });

        window.addEventListener('resize', () => {
            if (contactPart && messagepart)
            {
                
                const Contactstyle = window.getComputedStyle(contactPart);
                const messagesStyle = window.getComputedStyle(messagepart);
    
                if (window.innerWidth <= 1099){
                    if (Contactstyle.display === 'flex')
                        messagepart.style = 'none';
                    else if (window.innerWidth > 1099)
                    {
                        contactPart.style = 'none'
                        messagepart.style = 'flex';
                    }
                }
    
                else{
                    const contactPart2 = document.querySelector('.contacts-part');
                    const messagepart2 = document.querySelector('.messages-saver');
                    if (contactPart2 != null && messagepart2 != null)
                    {
                        contactPart2.style.display = 'flex';
                        messagepart2.style.display = 'flex';
                    }
                }
            }
        });
    }


    playRequestAccept(messageContainer) {
        messageContainer.remove();
        
        this.object.chatSocket.send(JSON.stringify({
            'sender_id': user.data.id,
            'reciever_id': this.object.currentUser.id,
            'action': 'play_request_accepted',
            'message': 'request accepted',
        }))
        // navigate('/game/tictactoe/remote');
        const slectedGame = getCookie(DEFAULT_GAME_COOKIE);
        if(slectedGame == "tictactoe") {
            navigate('/game/tictactoe/remote');
        }else {
            navigate('/game/online/match');
        }
    }

    createPlayRequestMessageCard(message) {

        const image = createElement('img', {class: 'user_img_msg', src: `${BACKEND_BASED_URL}${message.message_user.avatar}`});
    
        const acceptBtn = createElement('button', {class: 'play-request-accept-btn'}, ['Accept']);
        const refuseBtn = createElement('button', {class: 'play-request-refuse-btn'}, ['Refuse']);
    
        const div1 = createElement('div', {class: 'msg_cotainer'}, [acceptBtn, refuseBtn]);
        const div2 = createElement('div', {class: 'img_cont_msg'}, [image]);

        const messageContainer = createElement('div', {class: 'msg_container received'}, [div2, div1]);
        
        acceptBtn.addEventListener('click', () => {
           this.playRequestAccept(messageContainer);
        })

        refuseBtn.addEventListener('click', () => {
            messageContainer.remove();
        })
        return messageContainer;
    }

    async chatBanSocketAction(data) {
        if(this.object.friendship && this.object.friendship.id == data.message) {
            this.object.friendship = await getFriendShip(this.object.chat_room.user.id);
            const chatHead = document.getElementById('chat-head');
            const MessageInput = document.getElementById('chat-bottom');
            this.fillChatHead(chatHead);
            this.fillMessageSendInput(MessageInput);
        }
    }

    chatNewMessageSocketAction(data) {
        if(!this.object.currentUser)
            return ;
        const messagesContainerBody = document.getElementById('messages-body');

        const message_content = data.message;

        const message = {
            'message_content': message_content,
            'send_date': new Date(),
            'message_user': this.object.currentUser,
        }

        const element = user.data.id == message.message_user.id ? this.createSenderCard(message) : this.createRecieverCard(message);
        messagesContainerBody.appendChild(element);
    }

    chatPlayRequestSocketAction() {
        if(!this.object.currentUser)
            return;
        
        // const message = {
        //     'send_date': new Date(),
        //     'message_user': this.object.currentUser,
        // }

        // const element = this.createPlayRequestMessageCard();
        const element = this.createGameInvitation();

        setTimeout(() => {
            element.remove()
        }, 5000);

        document.getElementById('messages-body').appendChild(element);
    }

    addUserSocketListener = () => {
        if(!this.object.chatSocket || 
            this.object.chatSocket.readyState !== WebSocket.OPEN)
            return;
        
        this.object.chatSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if(data.action == "chat_ban") {
                this.chatBanSocketAction(data);
            } else if(data.action == "new_chatroom") {
                this.fillChatRooms();
            } else if(data.action == "new_message") {
               this.chatNewMessageSocketAction(data);
            } else if(data.action == "play_request") {
               this.chatPlayRequestSocketAction();
            } else if(data.action == 'play_request_accepted') {
                const slectedGame = getCookie(DEFAULT_GAME_COOKIE);
                if(slectedGame == "tictactoe") {
                    navigate('/game/tictactoe/remote');
                }else {
                    navigate('/game/online/match');
                }
            } else if(data.action == "new_friendship" || data.action == "delete_friendship") {
                fillNotificationBarr();
            } else if(data.action == "bot_message") {
                this.chatNewMessageSocketAction(data);
                botAlert(data.message);
            }
        }
    }
}
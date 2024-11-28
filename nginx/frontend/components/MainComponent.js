import HomeComponent from "../components/Home.js";
import user from "../utilities/user.js";
import { BACKEND_BASED_URL, COOKIE_NAME, BACKEND_BASED_SOCKET_URL, LANG_COOKIE } from '../utilities/constants.js'
import { getCookie, parseJwt, httpGet, logout, setCookie } from '../utilities/utiles.js'
import { errorAlert, infoAlert, botAlert } from "../utilities/alerts.js";
import { createOnlineUserCard, createNotificationCard, createSearchUserCard, createElement } from "../utilities/genrateHtml.js";
import { refreshAccessToken } from "../utilities/utiles.js";
import { checkToken } from '../js/app.js'

const getAllUsers = async () => {
    const allUsers = httpGet('/api/users/');
    return allUsers;
}

const getPandingFriendRequests = async () => {
    const pandingFriendRequests = await httpGet(`/api/users/user/me/panding_friend_requests/`);
    if(pandingFriendRequests) {
        notification_counter = Object.keys(pandingFriendRequests).length
    }
    return pandingFriendRequests;
}

export const fillNotificationBarr = async () => {
    const notifications_section = document.getElementById('notifications-section');
    notifications_section.textContent= '';

    const pandigFriendRequests = await getPandingFriendRequests();
    notification_counter = Object.keys(pandigFriendRequests).length;
    pandigFriendRequests.map((item) => {
        const pandig_friend_request = createNotificationCard(item);
        notifications_section.appendChild(pandig_friend_request);
    });

    document.getElementById('notifes').textContent = notification_counter;
}

const fillSearchBar  = async  () => {
    const searchInput = document.getElementById('search-input');
    const userInfo = document.getElementById('user-info');
    
    const users = await getAllUsers();
    
    userInfo.textContent = '';
    const filteredUsers = users.filter(usr => 
        usr.username.toLowerCase().includes(searchInput.value.toLowerCase())
    );
    
    filteredUsers.map(item => {
        const searchUserAncore = createSearchUserCard(item);
        userInfo.appendChild(searchUserAncore);
    })
}

const addEvents = () => {
    const notBtn = document.querySelector('.notification');
    const notList = document.querySelector('.notifi-box');

    notBtn.addEventListener('click', () => {
        notList.classList.toggle('active');
    });

    // Hide  notfication list if clicking outside
    document.addEventListener('click', (event) => {
      if (!notBtn.contains(event.target) && !notList.contains(event.target)) {
        notList.classList.remove('active');
      }
    });

    //searchBar
    const searchInput = document.getElementById('search-input');
    const userInfo = document.getElementById('user-info');

    searchInput.addEventListener('input', () => {
        if (searchInput.value) {
            userInfo.classList.add('active');
            fillSearchBar();
        } else {
            userInfo.classList.remove('active');
        }
    });

    // Hide  search bar if clicking outside
    document.addEventListener('click', (event) => {
        if (!searchInput.contains(event.target) && !userInfo.contains(event.target)) {
            userInfo.classList.remove('active');
        }
    });
}

const getOnlineUsers = async () => {
    const online_users = await httpGet(`/api/users/user/online_friends/${user.data.id}`);
    return online_users;
}

const logOut = () => {
    document.getElementById('logout')
    .addEventListener('click', () => {
        logout();
    });

    document.getElementById('logout2')
    .addEventListener('click', () => {
        logout();
    });
}


export const updateUserTopBarData = () => {
    const span = createElement('span', {style: "color: #DC5F00;"}, [user.data.username]);
    document.getElementById('main-usericon').src = `${BACKEND_BASED_URL}${user.data.avatar}`;
    const welcomSection = document.getElementById('main-user-name');
    welcomSection.textContent = `${i18next.t('welcome')}, `;
    welcomSection.appendChild(span);

    document.getElementById('search-input').placeholder = i18next.t('search');

    document.getElementById('notfication-text').textContent = i18next.t('notification');
}

export const setUserData = async () => {
    
    updateUserTopBarData();

    const online_users_section = document.getElementById('online-users');

    online_users_section.textContent = '';

    const onlineUser = await getOnlineUsers();
    
    onlineUser.map((item) => {
        const online_user_card = createOnlineUserCard(item);
        online_users_section.appendChild(online_user_card);
    });

    logOut();
}

const connectSocket = async () => {
    try {
        const res = await checkToken();
        if(res == false)
            return;

        const socket = new WebSocket(`${BACKEND_BASED_SOCKET_URL}/ws/online/?id=${user.data.id}`)

        socket.onopen = (event) => {
            
        };

        socket.onclose = (event) => {
            
        }

        socket.onerror = (event) => {
            
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if(data.action == "new_friendship" || data.action == "delete_friendship") {
                fillNotificationBarr();
            } else if(data.action == "bot_message") {
                botAlert(data.message);
            }
        }

        return socket;

    } catch(error) {
        return null;
    }
}

export default class MainComponent {
    constructor() {
        
    }


    async init(){
        userWebSocket = await connectSocket();
        await setUserData();
        await fillSearchBar();
        fillNotificationBarr();
        // this.test();
        addEvents();
    }

    closeup() {
           
    }
    
    async render() {
        return `
            <section class="game_section" id="main-page">
            <div class="left">
                    <div class="left-top">
                        <div class="logo">
                            <img src="./images/_-removebg.png" alt="Logo">
                        </div>
                        <div class="dash-icons">
                            <a href="#/"><i class="fa-sharp fa-solid fa-house-user"></i></a>
                            <a href="#/profile"><i class="fa-solid fa-address-card"></i></a>
                            <a href="#/chat"><i class="fa-solid fa-message"></i></a>
                            <a href="#/settings"><i class="fa-solid fa-screwdriver-wrench"></i></a>
                            <i class="fa-solid fa-right-from-bracket left-out" id="logout"></i>
                        </div>
                    </div>
                    <div class="logout">
                        <i class="fa-solid fa-right-from-bracket" id="logout2"></i>
                    </div>
                </div>
                <div class="middle">
                    <div class="header">
                        <div class="user-div">
                            <h1 id="main-user-name"></h1>
                        </div>
                        <div class="second-logo">
                            <img src="./images/_-removebg.png" alt="Logo">
                        </div>
                        <div class="light-dark-not">
                        <div class="big-div">
                            <div class="search-box">
                            <input type="text" id="search-input" class="input" name="txt">
                            <div class="search-icon">
                                <i class="bi bi-search" id="searchIcon"></i>
                            </div> 
                            </div>
                            <div class="user-info" id="user-info">
                            
                            </div>

                        </div>
                            <div class="notification">
                                <div class="not-icon" id="not-icon">
                                    <i class="bi bi-bell-fill"></i>
                                </div>
                                <div class="notifi-box" id="box">
                                    <div class="box-header">
                                            <div class="notif_box">
                                                <h2 class="title" id="notfication-text" ></h2>
                                                <span id="notifes"></span>
                                            </div>
                                            
                                    </div>
                                    <div class="box-main" id="notifications-section">
                                        
                                    </div>
                            </div>
                            </div>
                    
                            <div class="user" id="user">
                            <a href="#/profile">
                                <img src="./images/sackboy.png" alt="User Picture" class="profile-pic" id="main-usericon">
                            </a>
                            </div>
                        </div>
                    </div>
                    <div class="spa">
                
                    </div>
                </div>
                <div class="right">
                    <i class="bi bi-people" id="right-icon"></i>
                    <div class="online-users" id="online-users">
                    
                </div>
                </div>
            </section>
        `;
    }
}
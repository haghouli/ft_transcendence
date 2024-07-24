import { fetchData } from  "../utilities/fetch.js";

export default class chatComponent {
    constructor(){
        this.cssPath = "./css/Chat.css";
    }

    getCssPath = () => {
        return this.cssPath;
    }
    
    addEvent = () => {
        const actionMenuBtn = document.getElementById('action_menu_btn');
            console.log(actionMenuBtn);
            const actionMenu = document.querySelector('.action_menu');

            actionMenuBtn.addEventListener('click', () => {
                console.log('hdhdhdhdhdhdhdhd');
                actionMenu.style.display = actionMenu.style.display === 'block' ? 'none' : 'block';
            });

            // Close the menu if clicked outside
            document.addEventListener('click', (event) => {
                if (!actionMenu.contains(event.target) && !actionMenuBtn.contains(event.target)) {
                    actionMenu.style.display = 'none';
                }
            });
    }
    

    init() {
        this.addEvent();  
    }

    async render() {
        return `
                        <div class="chat">
                        <div class="contacts-part">
                            <div class="contact-part-header">
                                <div class="contact-header">
                                    <input type="text" class="input" name="txt" placeholder="Search...">
                                    <div class="contact-search-icon">
                                        <i class="bi bi-search" id="searchIcon"></i>
                                    </div> 
                                </div>
                            </div>
                            <div class="contact-body">
                                <ul class="contacts" id="scroll">
                                    <li class="active">
                                        <div class="contact">
                                            <div class="img_cont">
                                                <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img">
                                                <span class="online_icon"></span>
                                            </div>
                                            <div class="user_info">
                                                <span>Khalid Charif</span>
                                                <p>Online</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="active">
                                        <div class="contact">
                                            <div class="img_cont">
                                                <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img">
                                                <span class="online_icon"></span>
                                            </div>
                                            <div class="user_info">
                                                <span>Khalid Charif</span>
                                                <p>Online</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="active">
                                        <div class="contact">
                                            <div class="img_cont">
                                                <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img">
                                                <span class="online_icon"></span>
                                            </div>
                                            <div class="user_info">
                                                <span>Khalid Charif</span>
                                                <p>Online</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="active">
                                        <div class="contact">
                                            <div class="img_cont">
                                                <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img">
                                                <span class="online_icon"></span>
                                            </div>
                                            <div class="user_info">
                                                <span>Khalid Charif</span>
                                                <p>Online</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="active">
                                        <div class="contact">
                                            <div class="img_cont">
                                                <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img">
                                                <span class="online_icon"></span>
                                            </div>
                                            <div class="user_info">
                                                <span>Khalid Charif</span>
                                                <p>Online</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="active">
                                        <div class="contact">
                                            <div class="img_cont">
                                                <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img">
                                                <span class="online_icon"></span>
                                            </div>
                                            <div class="user_info">
                                                <span>Khalid Charif</span>
                                                <p>Online</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="active">
                                        <div class="contact">
                                            <div class="img_cont">
                                                <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img">
                                                <span class="online_icon"></span>
                                            </div>
                                            <div class="user_info">
                                                <span>Khalid Charif</span>
                                                <p>Online</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="active">
                                        <div class="contact">
                                            <div class="img_cont">
                                                <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img">
                                                <span class="online_icon"></span>
                                            </div>
                                            <div class="user_info">
                                                <span>Khalid Charif</span>
                                                <p>Online</p>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="contact">
                                            <div class="img_cont">
                                                <img src="https://2.bp.blogspot.com/-8ytYF7cfPkQ/WkPe1-rtrcI/AAAAAAAAGqU/FGfTDVgkcIwmOTtjLka51vineFBExJuSACLcBGAs/s320/31.jpg" class="user_img">
                                                <span class="online_icon offline"></span>
                                            </div>
                                            <div class="user_info">
                                                <span>Chaymae Naim</span>
                                                <p>Left 7 mins ago</p>
                                            </div>
                                        </div>
                                    </li>
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
                                <div class="msg_header_info">
                                    <div class="img_cont">
                                        <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img">
                                        <span class="online_icon"></span>
                                    </div>
                                    <div class="user_info">
                                        <span>Khalid Charif</span>
                                        <p>1767 Messages</p>
                                    </div>
                                    <div class="video_cam">
                                        <span><i class="fas fa-video"></i></span>
                                        <span><i class="fas fa-phone"></i></span>
                                    </div>
                                </div>
                                <!-- <div class="user" id="user">
                                    <img src="./images/sackboy.png" alt="User Picture" class="profile-pic">
                                    <div class="logout-bar" id="logoutBar">
                                        <h4>mtadlaou</h4>
                                    </div>
                                </div> -->
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
                            <div class="msg_card_body" id="scroll">
                                <div class="msg_container received">
                                    <div class="img_cont_msg">
                                        <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img_msg">
                                    </div>
                                    <div class="msg_cotainer">
                                        Hi, how are you samim?
                                        <span class="msg_time">8:40 AM, Today</span>
                                    </div>
                                </div>
                                <div class="msg_container sent">
                                    <div class="msg_cotainer_send">
                                        Hi Khalid i am good tnx how about you?
                                        <span class="msg_time_send">8:55 AM, Today</span>
                                    </div>
                                    <div class="img_cont_msg">
                                        <img src="https://avatars.hsoubcdn.com/ed57f9e6329993084a436b89498b6088?s=256" class="user_img_msg">
                                    </div>
                                </div>
                                <div class="msg_container received">
                                    <div class="img_cont_msg">
                                        <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img_msg">
                                    </div>
                                    <div class="msg_cotainer">
                                        I am good too, thank you for your chat template
                                        <span class="msg_time">9:00 AM, Today</span>
                                    </div>
                                </div>
                                <div class="msg_container sent">
                                    <div class="msg_cotainer_send">
                                        Hi Khalid i am good tnx how about you?
                                        <span class="msg_time_send">8:55 AM, Today</span>
                                    </div>
                                    <div class="img_cont_msg">
                                        <img src="https://avatars.hsoubcdn.com/ed57f9e6329993084a436b89498b6088?s=256" class="user_img_msg">
                                    </div>
                                </div>
                                <div class="msg_container received">
                                    <div class="img_cont_msg">
                                        <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img_msg">
                                    </div>
                                    <div class="msg_cotainer">
                                        I am good too, thank you for your chat template
                                        <span class="msg_time">9:00 AM, Today</span>
                                    </div>
                                </div>
                                <div class="msg_container sent">
                                    <div class="msg_cotainer_send">
                                        Hi Khalid i am good tnx how about you?
                                        <span class="msg_time_send">8:55 AM, Today</span>
                                    </div>
                                    <div class="img_cont_msg">
                                        <img src="https://avatars.hsoubcdn.com/ed57f9e6329993084a436b89498b6088?s=256" class="user_img_msg">
                                    </div>
                                </div>
                                <div class="msg_container received">
                                    <div class="img_cont_msg">
                                        <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img_msg">
                                    </div>
                                    <div class="msg_cotainer">
                                        I am good too, thank you for your chat template
                                        <span class="msg_time">9:00 AM, Today</span>
                                    </div>
                                </div>
                                <div class="msg_container sent">
                                    <div class="msg_cotainer_send">
                                        You are welcome
                                        <span class="msg_time_send">9:05 AM, Today</span>
                                    </div>
                                    <div class="img_cont_msg">
                                        <img src="https://avatars.hsoubcdn.com/ed57f9e6329993084a436b89498b6088?s=256" class="user_img_msg">
                                    </div>
                                </div>
                                <div class="msg_container received">
                                    <div class="img_cont_msg">
                                        <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img_msg">
                                    </div>
                                    <div class="msg_cotainer">
                                        I am looking for your next templates
                                        <span class="msg_time">9:07 AM, Today</span>
                                    </div>
                                </div>
                                <div class="msg_container sent">
                                    <div class="msg_cotainer_send">
                                        Ok, thank you have a good day
                                        <span class="msg_time_send">9:10 AM, Today</span>
                                    </div>
                                    <div class="img_cont_msg">
                                        <img src="https://avatars.hsoubcdn.com/ed57f9e6329993084a436b89498b6088?s=256" class="user_img_msg">
                                    </div>
                                </div>
                                <div class="msg_container received">
                                    <div class="img_cont_msg">
                                        <img src="https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg" class="user_img_msg">
                                    </div>
                                    <div class="msg_cotainer">
                                        Bye, see you
                                        <span class="msg_time">9:12 AM, Today</span>
                                    </div>
                                </div>
                            </div>
                            <div class="new_msg">
                                <div class="input-group">
                                    <textarea name="" class="type_msg" placeholder="Type your message..."></textarea>
                                    <button class="send_btn" type="button"><i class="bi bi-send-fill"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
        `;
    }
}
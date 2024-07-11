import { fetchData } from  "../utilities/fetch.js";
import { BACKEND_BASE_URL } from "../utilities/var.js";

export default class ProfileComponent {
    constructor(){
        this.cssPath = "./css/Profile.css";
    }

    getCssPath = () => {
        return this.cssPath;
    }

    async fetchDataAsync() {
        console.log('fetchdata')
        try {
            const data = await fetchData('../api/data.json');
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    init() {
        document.getElementById('profile-image').src = `${BACKEND_BASE_URL}${user.data.avatar}`;
        document.getElementById('profile-username').textContent = user.data.username;
    }
    
    async render() {
        return `
                <div id="prof">
                    <div class="prof-img">
                        <div class="prof-img-img">
                            <img src="./images/avatar.png" id="profile-image" alt="">
                        </div>
                        <h1 id="profile-username">jon Doe</h1>
                    </div>
                    <div class="rank">
                        <div class="info">
                            <div class="rank-info">
                                <h1>Win</h1>
                                <h1>15</h1>
                            </div>
                            <div class="rank-info">
                                <h1>Loses</h1>
                                <h1>6</h1>
                            </div>
                            <div class="rank-info">
                                <h1>total</h1>
                                <h1>50</h1>
                            </div>
                        </div>
                        <div class="level-bar">
                            <div class="level-fill"></div>
                            <span class="level-text">Level 10%</span>
                        </div>
                    </div>
                </div>
                <h4>Your achievement</h4>
                <div class="line"></div>
                <div class="users">
                    <div class="saver">
                        <h3>Player</h3>
                    </div>
                    <div class="saver">
                        <h3>GamePlayed</h3>
                    </div>
                    <div class="saver">
                        <h3>level</h3>
                    </div>
                    <div class="saver">
                        <h3>status</h3>
                    </div> 
                </div>
                <div class="achiev-user">
                    <div class="saver">
                        <div class="user-pict">
                        <img src="./images/assassins.png" alt="">
                        <h3>john dDoe</h3>
                    </div>
                    </div>
                    <div class="saver">
                        <h3>20 </h3>
                    </div> 
                    <div class="saver">
                        <h3>60%</h3>
                    </div> 
                    <div class="saver">
                        <h3>active</h3>
                    </div> 
                </div>
                <div class="achiev-user">
                    <div class="saver">
                        <div class="user-pict">
                        <img src="./images/assassins.png" alt="">
                        <h3>john dDoe</h3>
                    </div>
                    </div>
                    <div class="saver">
                        <h3>20 </h3>
                    </div> 
                    <div class="saver">
                        <h3>60%</h3>
                    </div> 
                    <div class="saver">
                        <h3>active</h3>
                    </div> 
                </div>
                <div class="achiev-user">
                    <div class="saver">
                        <div class="user-pict">
                        <img src="./images/assassins.png" alt="">
                        <h3>john dDoe</h3>
                    </div>
                    </div>
                    <div class="saver">
                        <h3>20 </h3>
                    </div> 
                    <div class="saver">
                        <h3>60%</h3>
                    </div> 
                    <div class="saver">
                        <h3>active</h3>
                    </div> 
                </div>
                <div class="achiev-user">
                    <div class="saver">
                        <div class="user-pict">
                        <img src="./images/assassins.png" alt="">
                        <h3>john dDoe</h3>
                    </div>
                    </div>
                    <div class="saver">
                        <h3>20 </h3>
                    </div> 
                    <div class="saver">
                        <h3>60%</h3>
                    </div> 
                    <div class="saver">
                        <h3>active</h3>
                    </div> 
                </div>
                <div class="achiev-user">
                    <div class="saver">
                        <div class="user-pict">
                        <img src="./images/assassins.png" alt="">
                        <h3>john dDoe</h3>
                    </div>
                    </div>
                    <div class="saver">
                        <h3>20 </h3>
                    </div> 
                    <div class="saver">
                        <h3>60%</h3>
                    </div> 
                    <div class="saver">
                        <h3>active</h3>
                    </div> 
                </div>
                <div class="achiev-user">
                    <div class="saver">
                        <div class="user-pict">
                        <img src="./images/assassins.png" alt="">
                        <h3>mtadlaou</h3>
                    </div>
                    </div>
                    <div class="saver">
                        <h3>20 </h3>
                    </div> 
                    <div class="saver">
                        <h3>60%</h3>
                    </div> 
                    <div class="saver">
                        <h3>active</h3>
                    </div> 
                </div>
                <!-- <div class="achiev-user"></div>
                <div class="achiev-user"></div>
                <div class="achiev-user"></div> -->
        `;
    }
}
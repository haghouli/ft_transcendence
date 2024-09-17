import { BACKEND_BASED_URL, httpGet } from "../utilities/var.js";


export default class ProfileComponent {
    constructor(){
        this.cssPath = "./css/Profile.css";
        this.user_socre = null;
    }

    getCssPath = () => {
        return this.cssPath;
    }

    renderScore = async () => {
        this.user_score = await httpGet(`/api/users/user/score/${user.data.id}`);
        this.user_score ?
        document.getElementById('user-score').innerHTML = `
             <div class="rank-info">
                <h1>Wins</h1>
                <h1>15</h1>
            </div>
            <div class="rank-info">
                <h1>Loses</h1>
                <h1>5</h1>
            </div>
            <div class="rank-info">
                <h1>played</h1>
                <h1>${this.user_score.number_matches}</h1>
            </div> 
        ` : document.getElementById('user-score').innerHTML = `
             <div class="rank-info">
                <h1>Wins</h1>
                <h1>0</h1>
            </div>
            <div class="rank-info">
                <h1>Loses</h1>
                <h1>0</h1>
            </div>
            <div class="rank-info">
                <h1>played</h1>
                <h1>0</h1>
            </div> 
        `
    }


    async init() {
        this.renderScore();
    }
    
    async render() {
        return `
                   <div class="profile-body">
                           <div class="pr-up"> 
                                <!-- <img src="./images/sky.avif" alt=""> -->
                           </div>
                           <div class="pr-down">
                                <div class="uer-pr-image">
                                    <img src="${BACKEND_BASED_URL}${user.data.avatar}" alt="">
                                </div>
                                <div class="void"> </div>
                                <div class="user-pr-info">
                                    <div class="info">
                                        <div class="user-pr-login">
                                            <h1>${user.data.username}</h1>
                                        </div>
                                        <div class="rank-container" id="user-score">
                                           
                                        </div>
                                    </div>
                                    <div class="level-bar">
                                        <div class="level-fill"></div>
                                        <span class="level-text">Level 10%</span>
                                    </div>
                                </div>
                           </div>
                    </div>
                    <div class="game-status">
                        <div class="game-container">
                            <h1>match history data</h1>
                        </div>
                        <div class="game-container">
                            <h1> leaderboard </h1>
                        </div>
                        <div class="game-container">
                            <h1>achievements</h1>
                        </div>
                    </div>
        `;
    }
}
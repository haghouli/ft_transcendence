import { fetchData } from  "../utilities/fetch.js";

export default class ProfileComponent {
    constructor(){
        this.cssPath = "./css/Profile.css";
    }

    getCssPath = () => {
        return this.cssPath;
    }


    init() {
        
    }
    
    async render() {
        return `
                   <div class="profile-body">
                           <div class="pr-up"> 
                                <!-- <img src="./images/sky.avif" alt=""> -->
                           </div>
                           <div class="pr-down">
                                <div class="uer-pr-image">
                                    <img src="./images/avatar.png" alt="">
                                </div>
                                <div class="void"> </div>
                                <div class="user-pr-info">
                                    <div class="info">
                                        <div class="user-pr-login">
                                            <h1>mtadlaou</h1>
                                        </div>
                                        <div class="rank-container">
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
                                                <h1>20</h1>
                                            </div>
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
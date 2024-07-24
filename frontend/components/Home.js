import { fetchData } from  "../utilities/fetch.js";
import user from "../utilities/user.js";

export default class HomeComponent {
    constructor() {
        this.cssPath = "./css/Home.css";
        this.firstname = 'aa';
        this.lastname = 'aa';
    }

    getCssPath = () => {
        return this.cssPath;
    }

    logOutFunc() {
        document.getElementById('logout').addEventListener('click', () => {
            user.islogged = false;
            window.history.pushState({}, "", "#/login")
            window.dispatchEvent(new Event('hashchange'));
        });
    }

    init(){
        this.logOutFunc();
    }
    
    async render() {
        return `
                     <div class="spa-left">
                        <div class="main-image">
                            <div class="play-image"> 
                                <img src="./images/image.png" alt="" class="main-image-img">
                                <h1>Welcome to Our Game</h1>
                                <p>welcome to enjoy your time width your friends <br>
                                feel ree to try what you want</p>
                                <a href="#/game" class="play-now">Play Now</a>
                            </div>
                            <div class="fr-rank">
                                <!-- <h6>Top 3 Players</h6>
                                <h1>player 1</h1>
                                <h1>player 2</h1>
                                <h1>player 3</h1>
                                <h1>player 3</h1> -->
                            </div>
                        </div>
                        <!-- <h1 >game Mode</h1> -->
                        <div class="side-images">
                            <div class="modes">
                                <h1>Game Modes</h1>
                            </div>
                            <div class="image-collection">
                                <div class="side-images-img" id="paly-ai">
                                   <h1>Play With <br><span>AI</span><br>Mode</h1>
                                </div>
                                <div class="side-images-img" id="tour">
                                    <h1>Play<br><span>Tournament</span><br>Mode</h1>
                                </div>
                                <div class="side-images-img" id="game">
                                   <h1>Play<br><span>Game</span><br>Mode</h1>
                                </div>
                            </div>
                        </div>
                    </div>
        `;
    }
}
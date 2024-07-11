import { fetchData } from  "../utilities/fetch.js";
import user from "../utilities/user.js";
import { BACKEND_BASE_URL, TOKEN } from '../utilities/var.js'


const logout = () => {
    localStorage.removeItem(TOKEN)
    window.history.pushState({}, "", "#/login")
    user.data = null
    user.islogged = false
}

export default class HomeComponent {
    constructor() {
        this.cssPath = "./css/Home.css";
        this.username = user.data.username;
        this.avatar = user.data.avatar;
    }

    getCssPath = () => {
        return this.cssPath;
    }

    init(){
        const userName = document.getElementById('user_name');
        const image = document.getElementById("user-image");

        document.getElementById("logout-btn").addEventListener('click', () => {
            logout();
        })
        
        image.src = `${BACKEND_BASE_URL}${this.avatar}`;
        userName.textContent = this.username ;
    
    }
    
    async render() {
        return `
           <div class="main-image">
                <h1>Welcome to Our Game</h1>
                <a href="#/game" class="play-now">Play Now</a>
                </div>
                <div class="side-images">
                    <div class="side-images-img">
                       <h1>Play With <br><span>AI</span></h1>
                    </div>
                    <div class="side-images-img">
                        <h1>Play<br><span>tournament</span></h1>
                    </div>
                    <div class="side-images-img">
                       <h1>Play<br><span>Game</span></h1>
                    </div>
                </div>
                <div class="user-info">
                    <h2 style="font-size: 20px;">Join a tournament</h2>
                    <!-- <h1>information</h1>
                    <h1>information</h1>
                    <h1>information</h1>
                    <h1>information</h1>
                    <h1>information</h1>
                    <h1>information</h1>
                    <h1>information</h1> -->
                </div>
            </div>
        `;
    }
}
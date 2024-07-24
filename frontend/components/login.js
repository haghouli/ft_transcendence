import { getIsLogged, setIsLogged } from "../utilities/var.js";
import Framework from "../js/framework.js";

export default class loginComponent {
    constructor() {
        this.cssPath = "./css/Login.css";
    }

    getCssPath = () => {
        return this.cssPath;
    }

    logOutFunc() {
        document.getElementsByClassName('logout').addEventListener('click', () => {
            user.islogged = false;
            window.history.pushState({}, "", "#/login")
            window.dispatchEvent(new Event('hashchange'));
        });
    }
   
    init(){
        document.getElementById('btn').addEventListener('click', () => {
            user.islogged = true;
            window.history.pushState({}, "", "#/")
            window.dispatchEvent(new Event('hashchange'));
        });

       
    }
    
    async render() {
        return `
            <h1>Login here!</h1>
            <button id="btn">Login Intra</button>
        `;
    }
}
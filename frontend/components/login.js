import { BACKEND_BASED_URL, setCookie, COOKIE_NAME } from "../utilities/var.js";

const login = async (username, password) => {

    const response = await fetch(`${BACKEND_BASED_URL}/api/token/`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        }, body: JSON.stringify({
            username: username,
            password: password,
        }),
    })

    const data = await response.json();
    if(response.status == 200) {
        setCookie(COOKIE_NAME, data.access, 1);
    } else {
        alert('wrong username or password');
    }
}

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
            document.cookie = COOKIE_NAME+'=; Max-Age=-99999999;';  
        });
    }
   
    init(){
        document.getElementById('btn').addEventListener('click', () => {
            window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-7442b875083283b731c9dc5d4f86a28e615632e18b679667bd0714bbdbbad09f&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2Fapi%2Fintra_callback%2F&response_type=code';
        });

        document.getElementById('login-btn').addEventListener('click', () => {

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if(username == '' || password == '') {
                alert('empty username or [password');
                return;
            }
            login(username, password);
        })
    }
    
    async render() {
        return `
            <h1>Login here!</h1>
            <button id="btn">Login Intra</button>
            <label>username<label>
            <input type="text" id="username"/>
            <label>passeword<label>
            <input type="password" id="password"/>
            <button id="login-btn">Login</button>
        `;
    }
}
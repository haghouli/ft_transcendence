import { getIsLogged, setIsLogged , BACKEND_BASE_URL, TOKEN, jwtDecode, setCookie } from "../utilities/var.js";
import Framework from "../js/framework.js";

const getQuerryStrings = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    urlParams.has("code") ? intraLogin(code) : console.log('code not found.')
}


const intraLogin = async (code) => {
    let response = await fetch(`${BACKEND_BASE_URL}/api/intra_login/`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code: code,
        }),
    })
  
    let data = await response.json()
    if(response.status === 200) {
        // localStorage.setItem(TOKEN, JSON.stringify(data.tokens))
        setCookie(TOKEN,JSON.stringify(data.tokens) ,60)
        user.islogged = true;
        user.data = data.user;
        window.history.pushState({}, "", "#/")
        window.dispatchEvent(new Event('hashchange'));
    } else {
        console.log('login failed');
    }
}

export default class loginComponent {
    constructor() {
        this.cssPath = "./css/Login.css";
        // getQuerryStrings();
    }

    getCssPath = () => {
        return this.cssPath;
    }

    // loginClickHandler = async (username, password) => {

    //     let response = await fetch(`${BACKEND_BASE_URL}/api/token/`, {
    //       method: 'POST',
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         username: username,
    //         password: password,
    //       }),
    //     })
    
    //     let data = await response.json()
    //     if(response.status === 200) {
    //         localStorage.setItem(TOKEN, JSON.stringify(data))
    //         user.islogged = true;
    //         user.data = jwtDecode(data.access)
    //         // console.log(user.data)
    //         // console.log(data)
    //         window.history.pushState({}, "", "#/")
    //         window.dispatchEvent(new Event('hashchange'));
    //     } else {
    //       alert('somtehing went wrong')
    //     }
    
    // }

    intraLoginClickHandler = () => {
        const alinkUrl = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-7442b875083283b731c9dc5d4f86a28e615632e18b679667bd0714bbdbbad09f&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2Fapi%2Fintra_callback%2F&response_type=code";
        window.location.href = alinkUrl;
    }
   
    init(){
        document.getElementById('btn').addEventListener('click', () => {
            this.intraLoginClickHandler();
        });
    }
    
    async render() {
        return `
            <h1>Login here!</h1>
            <button id="btn">Login Intra</button>
        `;
    }
}
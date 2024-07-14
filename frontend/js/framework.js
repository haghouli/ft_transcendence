import NotFoundComponent from "../components/Notfound.js";
import { getIsLogged, setIsLogged, BACKEND_BASE_URL, TOKEN,  getCookie } from "../utilities/var.js";
import updateCss from "../utilities/updateCss.js";
import { fetchData } from "../utilities/fetch.js";


// hicham code
// *****************************************************
const checkToken = async () => {

    const token = JSON.parse(getCookie(TOKEN));
    if (token !== null) {
        const response = await fetch(`${BACKEND_BASE_URL}/api/token/verify/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.access}`,
            },
        });
        const data = await response.json();
        if (response.status === 200) {
            user.islogged = true;
            user.data = data;
        }
    }
};

const startSocket = () => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/online/?id=${user.data.id}`)

    socket.onclose = function(e) {
        console.log('Chat socket closed unexpectedly');
    };

    socket.onmessage = function(e) {
        alert('you have a new notification')
        console.log('you have a new notification')
    };

}

// *****************************************************

export default class Framework {
    constructor() {
        this.routes = {};
    }
    route(path, component) {
        this.routes[path] = component;
    }
    
    start() {
        const navigateTo = async () => {
            
            // hicham code
            // *****************************************************
            await checkToken();
            if(user.islogged)
                startSocket()
            // *****************************************************
        
            let path = user.islogged ? window.location.hash.slice(1) : '/login';

            if (path === '/login' && !user.islogged) {
                window.history.pushState({}, "", "#/login");
            } else if (path === '/login' && user.islogged) {
                path = "/";
                window.history.pushState({}, "", "#/")
            }
            const component = this.routes[path] || NotFoundComponent;
            const appContainer = document.querySelector('.middle');
            const newComponent = new component();
            await updateCss(newComponent.getCssPath());
            appContainer.innerHTML = await newComponent.render();
            newComponent.init();
        };
        window.addEventListener('hashchange', navigateTo);
        navigateTo();
    }
}
import NotFoundComponent from "../components/Notfound.js";
import { getCookie, logout, parseJwt } from "../utilities/utiles.js";
import { REFRESH_TOKEN, TWOFA_COOKIE } from "../utilities/constants.js";
import { errorAlert, infoAlert } from "../utilities/alerts.js";
import TwofaPage from "../components/TwofaPage.js";

import LoadingComponent from "../components/LoadingPage.js";
import MainComponent from "../components/MainComponent.js";
import loginComponent from "../components/login.js";

let currentComponent = null;

export default class Framework {
    constructor() {
        this.routes = {};
    }
    
    route(path, component) {
        this.routes[path] = component;
    }

    async renderLogin() {
        const loginContainer = document.querySelector('#mainPage');
        const login = new loginComponent();
        loginContainer.innerHTML = await login.render();
        login.init();
    }

    async renderMainPage() {
        const mainPageContainer = document.querySelector('#mainPage');
        const mainComponent = new MainComponent();
        mainPageContainer.innerHTML = await mainComponent.render();
        await mainComponent.init();
    }

    async renderTwofa() {
        const mainPageContainer = document.querySelector('#mainPage');
        const mainComponent = new TwofaPage();
        mainPageContainer.innerHTML = await mainComponent.render();
        mainComponent.init();
    }

    start() {

        const navigateTo = async () => {

            let path = window.location.hash.slice(1);

            
            if (path.includes("?")) {
                const [pathPart, queryStringPart] = path.split("?");
                path = pathPart;
                queryString = queryStringPart;
            } else {
                queryString = null;
            }
            
            path = user.islogged ? path : `/login?${queryString}`;

            const refresh_cookie = getCookie(REFRESH_TOKEN);
            const twoFaResult = parseJwt(refresh_cookie);

            if (path === '/login' && !user.islogged) {
                window.history.pushState({}, "", "#/login");
            } else if (path === '/login' && user.islogged) {
                path = "/";
                window.history.pushState({}, "", "#/");
            }

            if (!user.islogged) {
                await this.renderLogin();
            } else if (twoFaResult && user.islogged && (twoFaResult.is_2af_active || !user.data.is_confirmed)) {
                await this.renderTwofa();
            } else {
                if(!refresh_cookie) {
                    errorAlert('invalid user credentials');
                    logout();
                    await this.renderLogin();
                } else {
                    if (isFirstLogin) {
                        await this.renderMainPage();
                        isFirstLogin = false;
                    }
                    if (path  == "")
                        path = "/";
                    if(currentComponent) {
                        currentComponent.closeup();
                    }
                    const component = this.routes[path] || NotFoundComponent;
                    const appContainer = document.querySelector('.spa');
                    const newComponent = new component();
                    appContainer.innerHTML = await newComponent.render();
                    currentComponent = newComponent;
                    newComponent.init();
                }
            }
        };
        window.addEventListener('hashchange', navigateTo);
        navigateTo();
    }
}
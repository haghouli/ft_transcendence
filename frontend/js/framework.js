import NotFoundComponent from "../components/Notfound.js";
import { getIsLogged, setIsLogged } from "../utilities/var.js";
import updateCss from "../utilities/updateCss.js";
import { fetchData } from "../utilities/fetch.js";

export default class Framework {
    constructor() {
        this.routes = {};
    }
    route(path, component) {
        this.routes[path] = component;
    }
    
    start() {
        const navigateTo = async () => {
            //user is valid
            let path = user.islogged ? window.location.hash.slice(1) : '/login';
            console.log(`path: ${path}`)
            if (path === '/login' && !user.islogged) {
                window.history.pushState({}, "", "#/login");
            } else if (path === '/login' && user.islogged) {
                path = "/";
                window.history.pushState({}, "", "#/")
            }
            const component = this.routes[path] || NotFoundComponent;
            const appContainer = document.querySelector('.spa');
            const newComponent = new component();
            await fetchData('../api/data.json');
            await updateCss(newComponent.getCssPath());
            appContainer.innerHTML = await newComponent.render();
            newComponent.init();
        };
        window.addEventListener('hashchange', navigateTo);
        navigateTo();
    }
}
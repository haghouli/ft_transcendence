import NotFoundComponent from "../components/Notfound.js";
import updateCss from "../utilities/updateCss.js";
import { BACKEND_BASED_URL, httpGet } from '../utilities/var.js'

const fillData = async () => {
    document.getElementById('user-name').innerText = user.data.username;
    document.getElementById('user-avatar').src = `${BACKEND_BASED_URL}${user.data.avatar}`;
    // const online_users = await httpGet(`/api/users/user/online_friends/${user.data.id}`);
    // let s = '';
    // online_users.map(item => {
    //     s += `
    //         <div class="fr-img">
    //             <img src="${BACKEND_BASED_URL}${item.avatar}" alt="">
    //             <span class="online_icon"></span>
    //         </div>
    //     `
    // })
    // document.getElementById('online-users').innerHTML = s;

}

export default class Framework {
    constructor() {
        this.routes = {};   
    }

    route(path, component) {
        this.routes[path] = component;
    }

    start() {
        const navigateTo = async () => {
            let path = user.islogged ? window.location.hash.slice(1) : '/login';
            if (path == '/' || path == '') {
                path = '/';
                window.history.pushState({}, "", "#/");
            }
            if (path === '/login' && !user.islogged) {
                window.history.pushState({}, "", "#/login");
            } else if (path === '/login' && user.islogged) {
                path = "/";
                window.history.pushState({}, "", "#/")
            }
            if (user.islogged)
                fillData();
            const component = this.routes[path] || NotFoundComponent;
            const appContainer = document.querySelector('.spa');
            const newComponent = new component();
            console.log(newComponent.getCssPath());
            await updateCss(newComponent.getCssPath());
            appContainer.innerHTML = await newComponent.render();
            newComponent.init();
        };
        window.addEventListener('hashchange', navigateTo);
        navigateTo();
    }
}
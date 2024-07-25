import { fetchData } from  "../utilities/fetch.js";

export default class NotFoundComponent {
    constructor(){
        this.cssPath = "./css/Notfound.css";
    }

    getCssPath = () => {
        return this.cssPath;
    }

    async fetchDataAsync() {
    }

    init(){  
    }

    async render() {
        return `<h1>404 - Not Found</h1>`;
    }
}
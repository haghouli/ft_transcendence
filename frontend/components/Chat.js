import { fetchData } from  "../utilities/fetch.js";

export default class chatComponent {
    constructor(){
        this.cssPath = "./css/Chat.css";
    }

    getCssPath = () => {
        return this.cssPath;
    }
    
    async fetchDataAsync() {
        try {
            const data = await fetchData('../api/data.json');
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    init(){
    }

    async render() {
        return `
            <h1 id="jilali">Chat Area</h1>
            <p>This is the chat page.</p>
        `;
    }
}
import { fetchData } from  "../utilities/fetch.js";

export default class LoadingComponent {
    constructor(){
        
    }


    async fetchDataAsync() {
    }

    init(){  
      
    }

    async render() {
        return `
            <div class="load-middle">
                <div class="bar bar1"></div>
                <div class="bar bar2"></div>
                <div class="bar bar3"></div>
                <div class="bar bar4"></div>
                <div class="bar bar5"></div>
                <div class="bar bar6"></div>
                <div class="bar bar7"></div>
                <div class="bar bar8"></div>
            </div>

        `;
    }
}
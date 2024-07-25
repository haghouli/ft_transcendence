
export default class TestComponent {
    constructor(id, name, image, is_online) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.is_online = is_online;
        this.cssPath = "./css/Chat.css";
    }

    getCssPath = () => {
        return this.cssPath;
    }

    addEvent = () => {
       document.getElementById(`scroll_${this.id}`).addEventListener('click',() => {
            console.log(this.id)
       })

    }

    init(){
        this.addEvent();
    }
    
    async render() {
        return `
            <ul class="contacts" id="scroll_${this.id}">
                <li class="active">
                    <div class="contact">
                        <div class="img_cont">
                            <img src="${this.image}" class="user_img">
                            <span class="online_icon"></span>
                        </div>
                        <div class="user_info">
                            <span>${this.name}</span>
                            <p>${this.is_online}</p>
                        </div>
                    </div>
                </li>
            </ul>
        `;
    }
}
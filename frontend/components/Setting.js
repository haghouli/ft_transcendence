import { fetchData } from "../utilities/fetch.js";
import { editField } from "../utilities/edit.js";

export default class SettingsComponent {
    constructor() {
        this.cssPath = "./css/Settings.css";
    }

    getCssPath() {
        return this.cssPath;
    }

    editFunc () {
        const btns = document.getElementsByClassName('edit-btn');
        const btnArray = [...btns];
        btnArray.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Edit button clicked');
                editField(btn.getAttribute('data-target'));
            });
        });
    }

    init() {
        this.editFunc();
        
    }

    async render() {
        return `
                  <div class="spa-left">
                        <div class="spa-left-imgname">
                            <div class="img-set-user">
                                <img src="./images/avatar.png" alt="">
                            </div>
                            <h1>mtadlaou</h1>
                        </div>
                        <button class="pr-btn">Edit Profile</button>
                    </div>
                    <div class="spa-right">
                        <div class="user-info-el">
                            <h3>First Name</h3>
                            <div class="input-container">
                                <input type="text" name="first_name" id="first_name" value="Mouhcin" readonly>
                                <button class="edit-btn" data-target="first_name">Edit</button>
                            </div>
                        </div>
                        <div class="user-info-el">
                            <h3>Last Name</h3>
                            <div class="input-container">
                                <input type="text" name="last_name" id="last_name" value="Tadlaoui" readonly>
                                <button class="edit-btn" data-target="last_name">Edit</button>
                            </div>
                        </div>
                        <div class="user-info-el">
                            <h3>Your Email</h3>
                            <div class="input-container">
                                <input type="text" name="email" id="email" value="Mouhcin@example.com" readonly>
                                <button class="edit-btn" data-target="email">Edit</button>
                            </div>
                        </div>
                        <div class="user-info-el">
                            <h3>Phone Number</h3>
                            <div class="input-container">
                                <input type="text" name="phone_number" id="phone_number" value="106 11 30 90 80" readonly>
                                <button class="edit-btn" data-target="phone_number">Edit</button>
                            </div>
                        </div>
                        <div class="save-cancel">
                            <button class="spa-right-btn">Update</button>
                            <button class="spa-right-btn">Cancel</button>
                        </div>
                    </div>
                  
        `;
    }
}

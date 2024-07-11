import { fetchData } from "../utilities/fetch.js";
import { editField } from "../utilities/edit.js";

export default class SettingsComponent {
    constructor() {
        this.cssPath = "./css/Settings.css";
    }

    getCssPath() {
        return this.cssPath;
    }

    async fetchDataAsync() {
        // console.log('Fetching data...');
        try {
            const data = await fetchData('../api/data.json');
            // console.log('Data fetched:', data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    init() {

        const btns = document.getElementsByClassName('edit-btn');
        const btnArray = [...btns];
        btnArray.forEach(btn => {
            btn.addEventListener('click', () => {
                // console.log('Edit button clicked');
                editField(btn.getAttribute('data-target'));
            });
        });
    }

    async render() {
        return `
            <div id="prof">
                <div class="prof-img">
                    <div class="prof-img-img">
                        <img src="./images/avatar.png" alt="">
                        <i class="bi bi-plus-circle-fill"></i>
                    </div>
                    <h1>jon Doe</h1>
                </div>
            </div>
            <div class="user-info">
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
                        <input type="text" name="last_name" id="last_name" value="tadlaoui" readonly>
                        <button class="edit-btn" data-target="last_name">Edit</button>
                    </div>
                </div>
                <div class="user-info-el">
                    <h3>Your Email</h3>
                    <div class="input-container">
                        <input type="text" name="email" id="email" value="Mohcin@example.com" readonly>
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
            </div>
        `;
    }
}

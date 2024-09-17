import { editField } from "../utilities/edit.js";
import {BACKEND_BASED_URL, COOKIE_NAME, getCookie} from "../utilities/var.js"

const updateUser = async () => {
    const username = user.data.username;
    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone_number').value;

    if(first_name == '' || last_name == '', email == '', phone == '') {
        alert('an field is empty');
        return;
    }

    const token = getCookie(COOKIE_NAME);

    if(token != '') {
        const response = await fetch(`${BACKEND_BASED_URL}/api/users/user/${user.data.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify( {
                'username': username,
                'first_name': first_name,
                'last_name': last_name,
                'email': email,
            }),
        })
        const data = await response.json();
        if(response.status == 200) {
            user.data = data;
        }
        console.log(data);
    }
}

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
                editField(btn.getAttribute('data-target'));
            });
        });
    }

    init() {
        this.editFunc();
        document.getElementById('update-btn').addEventListener('click', () => {
            updateUser();
        })
    }

    async render() {
        return `
                  <div class="spa-left">
                        <div class="spa-left-imgname">
                            <div class="img-set-user">
                                <img src="${BACKEND_BASED_URL}${user.data.avatar}" alt="">
                            </div>
                            <h1>${user.data.username}</h1>
                        </div>
                        <button class="pr-btn">Edit Profile</button>
                    </div>
                    <div class="spa-right">
                        <div class="user-info-el">
                            <h3>First Name</h3>
                            <div class="input-container">
                                <input type="text" name="first_name" id="first_name" value="${user.data.first_name}" readonly>
                                <button class="edit-btn" data-target="first_name">Edit</button>
                            </div>
                        </div>
                        <div class="user-info-el">
                            <h3>Last Name</h3>
                            <div class="input-container">
                                <input type="text" name="last_name" id="last_name" value="${user.data.last_name}" readonly>
                                <button class="edit-btn" data-target="last_name">Edit</button>
                            </div>
                        </div>
                        <div class="user-info-el">
                            <h3>Your Email</h3>
                            <div class="input-container">
                                <input type="text" name="email" id="email" value="${user.data.email}" readonly>
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
                            <button class="spa-right-btn" id="update-btn">Update</button>
                            <button class="spa-right-btn">Cancel</button>
                        </div>
                    </div>
                  
        `;
    }
}

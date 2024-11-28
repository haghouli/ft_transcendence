import { getCookie, httpPost, navigate, setCookie }  from '../utilities/utiles.js'
import { BACKEND_BASED_URL, COOKIE_NAME, LANG_COOKIE, DEFAULT_BOARD_COLOR_COOKIE, DEFAULT_GAME_COOKIE }  from '../utilities/constants.js'
import { errorAlert, infoAlert, worningAlert } from '../utilities/alerts.js';
import { updateUserTopBarData } from '../components/MainComponent.js';
import { setLanguage } from '../js/app.js';
import { createElement } from '../utilities/genrateHtml.js';
import { refreshAccessToken } from "../utilities/utiles.js";

const disable2fa = async () => {
    const token = getCookie(COOKIE_NAME);
    try {
        if(token) {
            const response = await fetch(`${BACKEND_BASED_URL}/api/disable2fa/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if(response.status == 200) {
                infoAlert(i18next.t("alerts.efaDisable"));
                user.data.is_2af_active = false;
                return true;
            }
            if(response.status === 401)
            {
                await refreshAccessToken();
                return await disable2fa(); 
            }
            errorAlert(i18next.t('alerts.efaDisableError'));
            return false
        } else {
            navigate('/login');
        }

    }catch {
        navigate('/login');
    }
}

const enable2fa = async () => {
    const token = getCookie(COOKIE_NAME);
    try {
        if(token) {
            const response = await fetch(`${BACKEND_BASED_URL}/api/enable2fa/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if(response.status == 200) {
                infoAlert(i18next.t('alerts.efaEnableSucces'));
                user.data.is_2af_active = true;
                return true;
            }
            if(response.status === 401)
            {
                await refreshAccessToken();
                return await enable2fa(); 
            }
            errorAlert(i18next.t('alerts.efaEnableError'));
            return false
        } else {
            navigate('/login');
        }

    }catch {
        navigate('/login');
    }
}

const updateUser = async (data) => {
    try {
        const token = getCookie(COOKIE_NAME);
        if(token) {
            const response = await fetch(`${BACKEND_BASED_URL}/api/users/user/${user.data.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'application/json',
                }, body : data,
            });
    
            const resData = await response.json();
    
            if(response.status == 200) {
                infoAlert(i18next.t('alerts.updateSuccess'));
                user.data = resData;
                return true;
            }
            if(response.status === 401)
            {
                await refreshAccessToken();
                return await updateUser(data); 
            }
            errorAlert(i18next.t('alerts.updateError'));
            return false
        } else {
            navigate('/login');
        }

    }catch {
        navigate('/login');
    }
}

export default class SettingsComponent {
    constructor() {
        this.cssPath = "./css/Settings.css";
    }

    getCssPath() {
        return this.cssPath;
    }

    changeLang = (lng) => {
        i18next.changeLanguage(lng, async (err, t) => {
            setCookie(LANG_COOKIE, lng, 360);
            updateUserTopBarData();
            document.querySelector('.spa').innerHTML = await this.render();
            this.init();
        });
    }

    profileBar = () => {
            const profileBtn = document.getElementById('profile-btn');
            const securityBtn = document.getElementById('security-btn');


            profileBtn.addEventListener('click', () => {
                securityBtn.classList.remove('active');
                profileBtn.classList.add('active'); 
            });

            securityBtn.addEventListener('click', () => {
                profileBtn.classList.remove('active'); 
                securityBtn.classList.add('active');
            });

            profileBtn.classList.add('active');
    }

    gamesBar = () => {
        const pingpongBtn = document.getElementById('pingpong');
            const tictacBtn = document.getElementById('tictac');

            pingpongBtn.addEventListener('click', () => {
                tictacBtn.classList.remove('active');
                pingpongBtn.classList.add('active');
            });

            tictacBtn.addEventListener('click', () => {
                pingpongBtn.classList.remove('active');
                tictacBtn.classList.add('active');
            });

            // pingpongBtn.classList.add('active');
    }

    switchView () {
        const profileBtn = document.getElementById('profile-btn');
        const securityBtn = document.getElementById('security-btn');
        const profileInfo = document.getElementById('profile-info');
        const securityInfo = document.getElementById('security-info');
        const togglePasswordIcons = document.querySelectorAll('.toggle-password');

        // Show profile by default
        profileInfo.style.display = 'block';
        securityInfo.style.display = 'none';

        // Function to switch views
        function switchView(activeBtn, inactiveBtn, showDiv, hideDiv) {
            activeBtn.classList.add('active');
            inactiveBtn.classList.remove('active');
            showDiv.style.display = 'block';
            hideDiv.style.display = 'none';
        }

        profileBtn.addEventListener('click', () => {
            switchView(profileBtn, securityBtn, profileInfo, securityInfo);
        });

        securityBtn.addEventListener('click', () => {
            switchView(securityBtn, profileBtn, securityInfo, profileInfo);
        });

        // Toggle password visibility
        togglePasswordIcons.forEach(icon => {
            icon.addEventListener('click', function() {
                const targetInput = document.getElementById(this.getAttribute('data-target'));
                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    this.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    targetInput.type = 'password';
                    this.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        });

    }

    languageColor() {
        document.querySelectorAll('.language_element').forEach(element => {
        element.addEventListener('click', function() {
                document.querySelectorAll('.language_element').forEach(el => {
                    el.classList.remove('selected');
                });
                this.classList.add('selected');
            });
        });

        document.querySelectorAll('.dash_color').forEach(element => {
        element.addEventListener('click', function() {
                document.querySelectorAll('.dash_color').forEach(el => {
                    el.classList.remove('selected');
                });
                this.classList.add('selected');
            });
        });

        document.querySelectorAll('.games-bar').forEach(element => {
        element.addEventListener('click', function() {
                document.querySelectorAll('.games-bar').forEach(el => {
                    el.classList.remove('selected');
                });
                this.classList.add('selected');
            });
        });
    }

    settREsponsive(){
        const gamelink = document.querySelector('.game-link');
        const profilelink = document.querySelector('.profile-link');
        const gamesSett = document.querySelector('.games-sett');
        const userSett = document.querySelector('.user-sett');
        let firstTime = true;


        const handleContactClick = (sectionToDisplay, sectionToHide) => {
            sectionToHide.style.display = 'none';
            sectionToDisplay.style.display = 'flex';
        };
        // Handling responsive design for smaller screens
        const updateSettingsView = () => {
            const width = window.innerWidth;
            if (width <= 820 || width <= 1024) {
                profilelink.style.display = 'flex';
                gamelink.style.display = 'flex';
                if (firstTime === true) {
                    gamesSett.style.display = 'none';
                    firstTime = false;
                }
                else{
                    const style = window.getComputedStyle(userSett);
                    if (style.display === 'flex')
                        gamesSett.style.display = 'none';
                    else
                        gamesSett.style.display = 'flex';
                }

                gamelink.addEventListener('click', () => handleContactClick(gamesSett, userSett));
                profilelink.addEventListener('click', () => handleContactClick(userSett, gamesSett));
            } else {
                profilelink.style.display = 'none';
                gamelink.style.display = 'none';
                gamesSett.style.display = 'flex';
                userSett.style.display = 'flex';
            }
        };

        window.addEventListener('resize', updateSettingsView);
        updateSettingsView();
    }

    setUserUpdateEventListener() {
        document.getElementById('updateUserData-btn').addEventListener('click', async () => {
            const first_name = document.getElementById('first_name').value;
            const last_name = document.getElementById('last_name').value;
            const username = document.getElementById('username').value;

            if(first_name == '' || last_name== '' || username == '') {
                infoAlert(i18next.t('alerts.emptyFields'));
                return;
            }
    
            const formData = new FormData();
            formData.append('first_name', first_name);
            formData.append('last_name', last_name);
            formData.append('username', username);
            formData.append('email', user.data.email);
    
            const res = await updateUser(formData);
            if(res) {
                updateUserTopBarData();
            }
        })
    }

    setChangePasswordEventListener() {
        document.getElementById('changePassword-btn').addEventListener('click', async () => {
            const old_password = document.getElementById('old_password').value;
            const new_password = document.getElementById('new_password').value;

            
            if(old_password == '' || new_password == '') {
                worningAlert(i18next.t('alerts.emptyFields'));
                return;
            }

            if(old_password == new_password) {
                worningAlert(i18next.t('alerts.noChanges'));
                return;
            }

            const data = {
                old_password: old_password,
                new_password: new_password,
            }

            const res = await httpPost("/api/change_password/", data);
            if(!res) {
                worningAlert(i18next.t('alerts.changePassError'));
            } else {
                infoAlert(i18next.t('alerts.changePassSuccess'));
            }
        })
    }

    addDefaultGameEventListner() {

        const lang = getCookie(DEFAULT_GAME_COOKIE);
        if(lang == 'pingpong') {
            document.getElementById('pingpong').classList.add('active');
        } else if(lang == 'tictactoe') {
            document.getElementById('tictac').classList.add('active');
        }
    
        document.getElementById('pingpong')
        .addEventListener('click', () => {
            setCookie(DEFAULT_GAME_COOKIE, 'pingpong', 360);
        })

        document.getElementById('tictac')
        .addEventListener('click', () => {
            setCookie(DEFAULT_GAME_COOKIE, 'tictactoe', 360);
        })
    }

    addColorChangeEventListner() {

        const lang = getCookie(DEFAULT_BOARD_COLOR_COOKIE);
        if(lang == 'b') {
            document.getElementById('first_color').classList.add('selected');
        } else if(lang == 'bl') {
            document.getElementById('second_color').classList.add('selected');
        } else {
            document.getElementById('last_color').classList.add('selected');
        }
    
        document.getElementById('first_color')
        .addEventListener('click', () => {
            setCookie(DEFAULT_BOARD_COLOR_COOKIE, 'b', 360);
        })

        document.getElementById('second_color')
        .addEventListener('click', () => {
            setCookie(DEFAULT_BOARD_COLOR_COOKIE, 'bl', 360);
        })

        document.getElementById('last_color')
        .addEventListener('click', () => {
            setCookie(DEFAULT_BOARD_COLOR_COOKIE, 'g', 360);
        })
    }

    addLangChangeEventLisner() {

        const lang = getCookie(LANG_COOKIE);
        if(lang == 'fr') {
            document.getElementById('frensh-lang').classList.add('selected');
        } else if(lang == 'ar') {
            document.getElementById('arabic-lang').classList.add('selected');
        } else {
            document.getElementById('english-lang').classList.add('selected');
        }

        document.getElementById('english-lang').addEventListener('click', async ()=> {
            this.changeLang("en");
        });

        document.getElementById('frensh-lang').addEventListener('click', async ()=> {
            this.changeLang("fr");
        });

        document.getElementById('arabic-lang').addEventListener('click', async ()=> {
            this.changeLang("ar");
        });
    }

    switch2faBtn() {
        const section =  document.getElementById('2fa-section');
        section.textContent = '';
        const child = user.data.is_2af_active ? this.createDisable2FABtn() : this.createEnable2FABtn();
        section.appendChild(child);
    }

    createEnable2FABtn() {
        const i = createElement('i', {class: 'fa-sharp fa-solid fa-shield-check'}, []);
        const btn = createElement('button', {class: 'f_auth_btn'}, [i, `${i18next.t('settings.enable2fa')}`])
        const div = createElement('div', {class: 'user-info-el-down'}, [btn]);

        div.addEventListener('click', async () => {
            await enable2fa();
            this.switch2faBtn();
        })

        return div;
    }

    createDisable2FABtn() {
        const i = createElement('i', {class: 'fa-sharp fa-solid fa-shield-check'}, []);
        const btn = createElement('button', {class: 'f_auth_btn'}, [i, `${i18next.t('settings.disable2fa')}`])
        const div = createElement('div', {class: 'user-info-el-down'}, [btn]);

        div.addEventListener('click', async () => {
            await disable2fa();
            this.switch2faBtn();
        })

        return div;
    }

    addUploadImageEvent() {
        const avatarImage = document.getElementById('userAvatar');
        const fileInput = document.getElementById('fileInput');
    
        avatarImage.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async function(e) {
                    
                    const formData = new FormData();
                    formData.append('first_name', user.data.first_name);
                    formData.append('last_name', user.data.last_name);
                    formData.append('username', user.data.username);
                    formData.append('email', user.data.email);
                    formData.append('avatar', file);
                    
                    const res = await updateUser(formData);
                    if(res) {
                        avatarImage.src = e.target.result;
                        updateUserTopBarData();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    

    init() {
        this.profileBar();
        this.gamesBar();
        this.switchView();
        this.languageColor();
        this.settREsponsive();

        this.setUserUpdateEventListener();
        this.setChangePasswordEventListener();

        this.addLangChangeEventLisner();
        this.addColorChangeEventListner();
        this.addDefaultGameEventListner()
    
        this.switch2faBtn();
        this.addUploadImageEvent();

        document.getElementById('save-game-settings-btn')
        .addEventListener('click', () => {
            infoAlert(i18next.t('alerts.gameSettingsUpdate'));
        });
    }

    closeup() {
        
    }

    async render() {
        return `
            <div class="settings">
                <div class="user-sett">
                    <h2 class="game-link link">${i18next.t('settings.gameSettings')}<i class="fa-solid fa-arrow-right"></i></h2>
                    <div class="setting-image">
                        <img src="../assets/profilebackground2.jpg" alt="" class="sett-image">
                        <img src="${BACKEND_BASED_URL}${user.data.avatar}" alt="" class="sett-user-img" id="userAvatar">
                        <input type="file" id="fileInput" accept=".jpg, .jpeg, .png">
                    </div>
                    <div class="sett-user-info">
                        <div class="setti-bar">
                            <div class="sett-user-bar" id="profile-btn">${i18next.t('settings.profile')}</div>
                            <div class="sett-user-bar" id="security-btn">${i18next.t('settings.security')}</div>
                        </div>
                        <!-- Initially Visible -->
                        <div class="sett-info" id="profile-info">
                            <div class="setting-info-up">
                                <div class="user-info-el">
                                    <h3 class="sett_tag">${i18next.t('settings.firstName')}</h3>
                                    <div class="input-container">
                                        <i class="fas fa-user"></i>
                                        <input type="text" name="first_name" id="first_name" value="${user.data.first_name}">
                                    </div>
                                </div>
                                <div class="user-info-el">
                                    <h3 class="sett_tag">${i18next.t('settings.lastName')}</h3>
                                    <div class="input-container">
                                        <i class="fas fa-user"></i>
                                        <input type="text" name="last_name" id="last_name" value="${user.data.last_name}">
                                    </div>
                                </div>
                            </div>
                            <div class="setting-info-down">
                                <div class="user-info-el-down">
                                    <h3 class="sett_tag">${i18next.t('settings.username')}</h3>
                                    <div class="input-container">
                                        <i class="fas fa-at"></i>
                                        <input type="text" name="username" id="username" value="${user.data.username}">
                                    </div>
                                </div>
                            </div>
                            <div class="save" id="updateUserData-btn">
                                <i class="fa-solid fa-check"></i>
                                <button class="save_btn">${i18next.t('settings.saveChanges')}</button>
                            </div>
                        </div>

                        <!-- Initially Hidden  -->
                        <div class="sett-info" id="security-info">
                            <div class="setting-info-up">
                                <div class="user-info-el ${user.data.register_method == 1 ? "disable" : ""}">
                                    <h3 class="sett_tag">${i18next.t('settings.oldPwd')}</h3>
                                    <div class="input-container">
                                        <i class="fas fa-lock"></i>
                                        <input type="password" name="old_password" id="old_password">
                                        <i class="fas fa-eye toggle-password" data-target="old_password"></i>
                                    </div>
                                </div>
                                <div class="user-info-el ${user.data.register_method == 1 ? "disable" : ""}">
                                    <h3 class="sett_tag">${i18next.t('settings.newPwd')}</h3>
                                    <div class="input-container">
                                        <i class="fas fa-lock"></i>
                                        <input type="password" name="new_password" id="new_password">
                                        <i class="fas fa-eye toggle-password" data-target="new_password"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="save ${user.data.register_method == 1 ? "disable" : ""}" id="changePassword-btn">
                                <i class="fa-solid fa-check"></i>
                                <button class="save_btn">${i18next.t('settings.updatePwd')}</button>
                            </div>
                            <div class="setting-info-down" id="2fa-section">
                                <!-- <div class="user-info-el-down" id="activate2fa-btn">
                                    <button class="f_auth_btn">
                                        <i class="fa-sharp fa-solid fa-shield-check"></i>
                                        ${i18next.t('settings.enable2fa')}
                                    </button>
                                </div> -->
                            </div>
                        </div>
                    </div>
                </div> 
                <div class="games-sett">
                    <h2 class="profile-link link"><i class="fa-solid fa-arrow-left"></i>${i18next.t('settings.profileAccount')}</h2>
                    <div class="game_sett-title">
                        <h1>${i18next.t('settings.gameSettings')}</h1> 
                    </div>
                    <div class="game_sett-body">
                        <div class="default_game">
                            <h2 class="game_tag">${i18next.t('settings.defaultGame')}</h2>
                            <div class="games_container">
                                <div class="games-bar" id="pingpong">Ping Pong</div>
                                <div class="games-bar" id="tictac">Tic Tac Toe</div>
                            </div>
                        </div>
                        <div class="default_languages">
                            <h2 class="game_tag">${i18next.t('settings.defaultLanguages')}</h2>
                            <div class="languages">
                                <div class="language_element" id="english-lang">🇺🇸 <span>English</span></div>
                                <div class="language_element" id="frensh-lang">🇫🇷 <span>Français</span></div>
                                <div class="language_element" id="arabic-lang">🇲🇦 <span>العربية</span></div>
                            </div>
                        </div>
                        <div class="default_color">
                            <h2 class="game_tag">${i18next.t('settings.defaultBoardColor')}</h2>
                            <div class="dash_colors_container">
                                <div class="dash_color" id="first_color">
                                    <i class="fas fa-check icon"></i>
                                </div>
                                <div class="dash_color" id="second_color">
                                    <i class="fas fa-check icon"></i>
                                </div>
                                <div class="dash_color" id="last_color">
                                    <i class="fas fa-check icon"></i>
                                </div>
                            </div>
                        </div>
                        <div class="save" id="save-game-settings-btn">
                            <i class="fa-solid fa-check"></i>
                            <button class="save_btn">${i18next.t('settings.updateSettings')}</button>
                        </div>
                    </div>
                </div>
            </div>
                  
        `;
    }
}

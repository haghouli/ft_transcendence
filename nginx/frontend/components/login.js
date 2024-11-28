import { errorAlert, worningAlert, infoAlert } from '../utilities/alerts.js'
import { BACKEND_BASED_URL, COOKIE_NAME, REFRESH_TOKEN, TWOFA_COOKIE, INTRA_URL } from '../utilities/constants.js'
import { setCookie, navigate, getQueryParams } from '../utilities/utiles.js'
import { renderTwofa } from '../utilities/utiles.js';
import { createElement } from '../utilities/genrateHtml.js'


const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{12,}$/;

const login = async (username, password) => {

    try {
        const response = await fetch(`${BACKEND_BASED_URL}/api/login/`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            }, body: JSON.stringify({
                username: username,
                password: password,
            }),
        })

        const data = await response.json();

        if(response.status == 200) {
            setCookie(COOKIE_NAME, data.token.access, 60);
            setCookie(REFRESH_TOKEN, data.token.refresh, 60);
            infoAlert(i18next.t('alerts.loginSuccess'));
            user.islogged = true;
            user.data = data.user;
            setCookie(TWOFA_COOKIE, user.data.is_2af_active,  60);
            if(user.data.is_2af_active) {
                await renderTwofa();
            } else {
                navigate('/');
            }
        } else {
            document.getElementById('login-btn').textContent = `${i18next.t('login.submit')}`;
            errorAlert(i18next.t("alerts.wrongUsernameOrPass"));
        }
    } catch(error) {
        document.getElementById('login-btn').textContent = `${i18next.t('login.submit')}`;
        errorAlert(i18next.t('alerts.loginError'));
    }
}

const register = async () => {
    const arr = ['first_name', 'last_name', 'username', 'email', 'password']
    let domObjects = {}
    arr.forEach(item => {
        domObjects[item] = document.getElementById(`register-${item}`);
        document.getElementById(`register-${item}-span`).textContent = '';
    })

    for(const key in domObjects) {
        const element = domObjects[key];
        if(element.value == '' || element.value.trim() == '') {
            document.getElementById(`register-${key}-span`)
            .textContent = 'This field should not be empty';
        }
    }

    if (!passwordPattern.test(domObjects['password'].value)) {
        document.getElementById(`register-password-span`)
        .textContent='password should cantain atlest 12 character mixed with numbers and special characters';
    }

    try {
        const requestdata = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name: domObjects['first_name'].value,
                last_name: domObjects['last_name'].value,
                username: domObjects['username'].value,
                email: domObjects['email'].value,
                password: domObjects['password'].value,
            })
        }

        const response = await fetch(`${BACKEND_BASED_URL}/api/register/`, requestdata)
        const data = await response.json();
        if(response.status == 200) {
            user.islogged = true;
            user.data = data.user;
            setCookie(COOKIE_NAME, data.token.access, 60);
            setCookie(REFRESH_TOKEN, data.token.refresh, 60);
            await renderTwofa();
        } else if(response.status == 500) {
            errorAlert(data.error);
        } else {
            for(const key in data.error) {
                document.getElementById(`register-${key}-span`)
                .textContent = data.error[key];
            }
            document.getElementById('register-btn').textContent = i18next.t('register.register');
        }
    } catch (error) {
        errorAlert('Error occures');
        document.getElementById('register-btn').textContent = i18next.t('register.register');
    }
}

export default class loginComponent {
    constructor() {
        this.cssPath = "./css/Login.css";
        this.selectedPage = 'login';
        const pageQuerry = getQueryParams('page');
        if(pageQuerry)
            this.selectedPage = pageQuerry;
    }

    getCssPath = () => {
        return this.cssPath;
    }
    
    toHome(){
        document.getElementById('btn').addEventListener('click', () => {
            user.islogged = true;
            window.history.pushState({}, "", "#/")
            window.dispatchEvent(new Event('hashchange'));
        });
    }

    spaDiv = () => {
        const spaDiv = document.querySelector('.spa');
        spaDiv.style.display = 'flex';
        spaDiv.style.flexDirection = 'column';
    }
    
    signToGame = () =>{
         // Select the login and sign-up form containers
         const loginForm = document.querySelector('.login-form');
         const signUpForm = document.querySelector('.sign-up-form');

         // Select the links to toggle between forms
         const signUpLink = document.querySelector('#sign-up-link');
         const loginLink = document.querySelector('#login-link');

         // Add event listener to show the sign-up form when "Sign UP" is clicked
         signUpLink.addEventListener('click', (e) => {
            e.preventDefault();  // Prevent the default anchor behavior
            this.selectedPage = 'register';
            loginForm.style.display = 'none';  // Hide login form
            signUpForm.style.display = 'block';  // Show sign-up form
            navigate('/login?page=register');
         });

         // Add event listener to show the login form when "Login" is clicked
         loginLink.addEventListener('click', (e) => {
            e.preventDefault();  // Prevent the default anchor behavior
            this.selectedPage = 'login';
            signUpForm.style.display = 'none';  // Hide sign-up form
            loginForm.style.display = 'block';  // Show login form
            navigate('/login?page=login');
         });
    }

    createInputSpanComponent(divClassName, inputId, inputPlaceHolder, spanId, btnType) {

        const input = createElement('input', {type: btnType, placeholder: inputPlaceHolder, id: inputId}, []);
        const span = createElement('span', {id: spanId}, []);
        const div = createElement('div', {class: divClassName}, [input, span])

        return div;
    }

    createLoginButton() {
        const btn = createElement('button', {class:"opacity", id:"login-btn"}, [i18next.t('login.submit')]); 
        btn.addEventListener('click', () => {
            btn.innerHTML = '<span class="loader"></span>';

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if(username == '' || password == '') {
                if(username == '')
                    document.getElementById('login-username-span')
                    .textContent = 'username section should not be empty';
                if(password == '')
                    document.getElementById('login-password-span')
                    .textContent = 'password section should not be empty';
                btn.textContent = i18next.t('login.submit');

                return;
            }
            login(username, password);
        })
        return btn;
    }


    createIntraLoginButton() {
        const btn = createElement('button', {class:"opacity", id:"intra-login-btn"}, [i18next.t('login.intraLogin')]); 
        btn.addEventListener('click', async () => {
            btn.innerHTML = '<span class="loader"></span>';
            window.location.href = INTRA_URL;
            btn.innerHTML = i18next.t('login.submit');
        })

        return btn;
    }

    createRegisterBtn() {
        const btn = createElement('button', {class:"opacity", id:"register-btn"}, [i18next.t('register.register')]); 
        btn.addEventListener('click', () => {
            btn.innerHTML = '<span class="loader"></span>';
            register();
        })
        return btn;
    }

    createIntraRegisterBtn() {
        // <button class="opacity" id="intra-register-btn" >${i18next.t('register.intraRegister')}</button>
        const btn = createElement('button', {class:"opacity", id:"intra-register-btn"}, [i18next.t('register.intraRegister')]);
        btn.addEventListener('click', () => {
            btn.innerHTML = '<span class="loader"></span>';
            window.location.href = INTRA_URL;
            btn.innerHTML = i18next.t('register.register');
        })
        return btn;
    }

    createLoginComponent() {
        const loginContainer = document.getElementById('login-inputs-container');

        const div1 = this.createInputSpanComponent('login-username-section', 'username', i18next.t('login.username'), 'login-username-span', 'text');
        const div2 = this.createInputSpanComponent('login-password-section', 'password', i18next.t('login.password'), 'login-password-span', 'password');
        const loginBtn = this.createLoginButton();
        const seperator = createElement('div', {class: 'separator'}, [i18next.t('login.or')]);
        const intraLoginBtn = this.createIntraLoginButton();

        loginContainer.appendChild(div1);
        loginContainer.appendChild(div2);
        loginContainer.append(loginBtn);
        loginContainer.append(seperator);
        loginContainer.append(intraLoginBtn);
    }

    createRegisterComponent() {

        const registerConatiner = document.getElementById('register-inputs-container');

        const div1 = this.createInputSpanComponent('register-span', 'register-first_name', i18next.t('register.firstName'), 'register-first_name-span', 'text');
        const div2 = this.createInputSpanComponent('register-span', 'register-last_name', i18next.t('register.lastName'), 'register-last_name-span', 'text');
        const div3 = this.createInputSpanComponent('register-span', 'register-username', i18next.t('login.username'), 'register-username-span', 'text');
        const div4 = this.createInputSpanComponent('register-span', 'register-email', i18next.t('register.emailAddress'), 'register-email-span', 'text');
        const div5 = this.createInputSpanComponent('register-span', 'register-password', i18next.t('login.password'), 'register-password-span', 'password');


        const registerBtn = this.createRegisterBtn();
        const seperator = createElement('div', {class: 'separator'}, [i18next.t('login.or')]);
        const intraRegisterBtn = this.createIntraRegisterBtn();

        registerConatiner.appendChild(div1);
        registerConatiner.appendChild(div2);
        registerConatiner.appendChild(div3);
        registerConatiner.appendChild(div4);
        registerConatiner.appendChild(div5);

        registerConatiner.append(registerBtn);
        registerConatiner.append(seperator);
        registerConatiner.append(intraRegisterBtn);
    }

    selectThePage() {
        const loginForm = document.querySelector('.login-form');
        const signUpForm = document.querySelector('.sign-up-form');
    
        if(this.selectedPage == 'register') {
            loginForm.style.display = 'none';
            signUpForm.style.display = 'block';
        } else {
            signUpForm.style.display = 'none';
            loginForm.style.display = 'block';
        }
    }

    init(){
        this.createLoginComponent();
        this.createRegisterComponent();
        this.signToGame()
        this.selectThePage();

        if(queryString != null) {
            const message = getQueryParams("message");
            if(message)
                 worningAlert(message);
        }
    }

    closeup() {
        
    }
    
    async render() {
        return `
            <div class="login-container">
                <!-- Login Form -->
                <div class="form-container login-form">
                    <h1 class="opacity">${i18next.t('login.login')}</h1>
                    <div class="form" id="login-inputs-container">
                        
                    </div>
                    <div class="register-forget opacity">
                        <a href="#" id="sign-up-link">${i18next.t('login.dontHaveAccout')}<span>${i18next.t('login.singnUp')}</span></a>
                    </div>
                </div>
        
                <!-- Sign-Up Form (Initially Hidden) -->
                <div class="form-container sign-up-form" style="display: none;">
                    <h1 class="opacity">${i18next.t('register.signUp')}</h1>
                    <div class="form" id="register-inputs-container">
                        <!-- <div class="register-span">
                            <input type="text" id="register-first_name" placeholder="${i18next.t('register.firstName')}" />
                            <span id="register-first_name-span"></span>
                        </div>
                        <div class="register-span">
                            <input type="text" id="register-last_name" placeholder="${i18next.t('register.lastName')}" />
                            <span id="register-last_name-span"></span>
                        </div>
                        <div class="register-span">
                            <input type="text" id="register-username" placeholder="${i18next.t('login.username')}" />
                            <span id="register-username-span"></span>
                        </div>
                        <div class="register-span">
                            <input type="text" id="register-email" placeholder="${i18next.t('register.emailAddress')}" />
                            <span id="register-email-span"></span>
                        </div>
                        <div class="register-span">
                            <input type="password" id="register-password" placeholder="${i18next.t('login.password')}" />
                            <span id="register-password-span"></span>
                        </div>
                        <button class="opacity" id="register-btn" >${i18next.t('register.register')}</button>
                        <div class="separator">${i18next.t('login.or')}</div>
                        <button class="opacity" id="intra-register-btn" >${i18next.t('register.intraRegister')}</button> -->
                    </div>
                    <div class="register-forget opacity">
                        <a href="#" id="login-link">${i18next.t('register.alreadyHaveAccount')}<span>${i18next.t('register.login')}</span></a>
                    </div>
                </div>
            </div>
        `;
    }
}
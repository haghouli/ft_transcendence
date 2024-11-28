import { errorAlert, worningAlert, infoAlert } from '../utilities/alerts.js'
import { BACKEND_BASED_URL, COOKIE_NAME, REFRESH_TOKEN, TWOFA_COOKIE } from '../utilities/constants.js'
import { setCookie, navigate, getCookie, logout } from '../utilities/utiles.js'
import { refreshAccessToken } from "../utilities/utiles.js";


const sendEmail = async () => {
    try {
        const token = getCookie(COOKIE_NAME);
        if(token) {
            try {
                const response = await fetch(`${BACKEND_BASED_URL}/api/send_mail/`, {
                    method: 'GET',
                    headers : {
                        'Authorization' : `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if(response.status == 200) {
                    infoAlert(i18next.t('alerts.messageSended'));
                } else if(response.status === 401) {
                    await refreshAccessToken();
                    return await sendEmail(); 
                } else {
                    errorAlert(i18next.t('alerts.invalidCode'));
                }
            }catch(error) {
                errorAlert(error)
            }
        }
    }catch {
        navigate('/login');
    }
}

const confirmeCode =  async (digits) => {
    try {
        const token = getCookie(COOKIE_NAME);
        if(token) {
            const response = await fetch(`${BACKEND_BASED_URL}/api/validate_code/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: digits,
                }),
            })
    
            const data = await response.json();
            if(response.status == 200) {
                await setCookie(COOKIE_NAME, data.access, 60);
                await setCookie(REFRESH_TOKEN,data.refresh, 60);
                user.islogged = true;
                user.data = data.user;
                infoAlert(`${i18next.t('alerts.welcome')} ${user.data.username}`);
                await navigate('/');
            } else if(response.status === 401) {
                await refreshAccessToken();
                return await confirmeCode(digits);
            } 
            else {
                errorAlert(i18next.t('alerts.invalidCode'));
            }
        }
    }catch {
        navigate('/login');
    }
}

export default class TwofaPage {
    constructor(){
        this.cssPath = "./css/Notfound.css";
        sendEmail();
    }

    getCssPath = () => {
        return this.cssPath;
    }

    async fetchDataAsync() {
    }

    init(){

        document.getElementById('cancel').addEventListener('click', (e) => {
            logout();
        })


        document.getElementById('resend-btn').addEventListener('click', (e) => {
            e.preventDefault();
            sendEmail();
        })
        
        document.getElementById('confirme').addEventListener('click', (e) => {
            const inputs = document.querySelectorAll('.form-control');
            let digits = '';
            inputs.forEach(input => {
                digits += input.value;
            });
            confirmeCode(digits);
        })
    }

    closeup() { }

    // i18next.t('twofapage')

    async render() {
        return `
            <div class="verification-container">
                <img src="./images/2FA.png" alt="2FA Image">
                <h4>${i18next.t('twofapage.header')}</h4>

                <div class="otp-inputs">
                    <input type="text" maxlength="1" class="form-control">
                    <input type="text" maxlength="1" class="form-control">
                    <input type="text" maxlength="1" class="form-control">
                    <input type="text" maxlength="1" class="form-control">
                    <input type="text" maxlength="1" class="form-control">
                    <input type="text" maxlength="1" class="form-control">
                </div>

                <div class="button-group">
                    <button type="submit" class="btn" id="confirme">${i18next.t('twofapage.verify')}</button>
                    <button type="button" class="btn" id="cancel">${i18next.t('twofapage.cancle')}</button>
                </div>

                <div class="resend-text">
                    <p>${i18next.t('twofapage.notreciev')} <a href="#" class="T_link" id="resend-btn">${i18next.t('twofapage.resend')}</a></p>
                </div>
            </div>
        `;
    }
}
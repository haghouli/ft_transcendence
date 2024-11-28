import HomeComponent from "../components/Home.js";
import ChatComponent from "../components/Chat.js";
import TwofaPage from "../components/TwofaPage.js";
import Framework from "./framework.js";
import ProfileComponent from "../components/Profile.js";
import SettingsComponent from "../components/Setting.js";
import loginComponent from "../components/login.js";
import user from "../utilities/user.js";
import { BACKEND_BASED_URL, COOKIE_NAME, BACKEND_BASED_SOCKET_URL, LANG_COOKIE, DEFAULT_BOARD_COLOR_COOKIE, DEFAULT_GAME_COOKIE } from '../utilities/constants.js'
import { getCookie, httpGet, logout, setCookie } from '../utilities/utiles.js'
import { createOnlineUserCard, createNotificationCard, createSearchUserCard, createElement } from "../utilities/genrateHtml.js";
import { refreshAccessToken } from "../utilities/utiles.js";

import Main from "../components/TictactoeComponents/Main.js";
import GameRemote from "../components/TictactoeComponents/GameRemote.js";
import TicTAcToeAiDificulty from "../components/TictactoeComponents/TicTAcToeAiDificulty.js";
import TicTacToeLocal from "../components/TictactoeComponents/TicTacTooLocal.js";

/************ Pong Game Components *************** */
import { game_dashboard } from "../components/GameComponents/GameMenu.js";
import { LocalGameComponent } from "../components/GameComponents/CustomizeGame.js";
import { GamePage } from "../components/GameComponents/PlayGame.js"
import { TournamentBoard } from "../components/GameComponents/Tournament.js"
import { JoinTournament } from "../components/GameComponents/PlayersJoin.js"
import { PlayersReady } from "../components/GameComponents/PlayersReady.js"
import { RemoteMatch } from "../components/GameComponents/RemoteGame.js"
import { MultiPlayer } from "../components/GameComponents/MultiPlayers.js"
import {ServerErrorComponent} from '../components/GameComponents/serverError.js'



import LoadingComponent from "../components/LoadingPage.js";


export const checkToken = async () => {
    try {
        const token = getCookie(COOKIE_NAME);
        if(token) {
            const response = await fetch(`${BACKEND_BASED_URL}/api/token/verify/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            const data = await response.json();
            if(response.status === 200) {
                user.islogged = true;
                user.data = data;
            } else if(response.status === 401) {
                const res = await refreshAccessToken();
                if(res === false)
                    return false;
                return await checkToken();
            }
            else {
                return false;
            }
        }
    } catch {
        logout();
    }
}

export const setLanguage = async (lang) => {
    const lng = lang == null ?  "en" : lang;

    await i18next
    .use(i18nextHttpBackend)
    .init({
        lng: lng,
        fallbackLng: lng,
        backend: {
            loadPath: '../languages/{{lng}}.json'
        }
    }, (err, t) => { });
}

const checkCookies = async () => {
    const langCookie = getCookie(LANG_COOKIE)
    if(!langCookie) {
        setCookie(LANG_COOKIE, "en", 360);
        await setLanguage("en");
    } else {
        await setLanguage(langCookie);
    }

    const boardColorCookie = getCookie(DEFAULT_BOARD_COLOR_COOKIE)
    if(!boardColorCookie) {
        setCookie(DEFAULT_BOARD_COLOR_COOKIE, "bl", 360);
    }

    const defaultGameCookie = getCookie(DEFAULT_GAME_COOKIE)
    if(!defaultGameCookie) {
        setCookie(DEFAULT_GAME_COOKIE, "pingpong", 360);
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function onLoadPromise() {
    return new Promise(resolve => {
        window.onload = function () {
            resolve();
        };
    });
}

async function init() {
    const LoadingComponentContainer = document.querySelector('#mainPage');
    const LoadingComponentHTML = new LoadingComponent().render();
    LoadingComponentContainer.innerHTML = await LoadingComponentHTML;
    await onLoadPromise();
    await sleep(1000);
}

await init();

window.user = user;
window.chatSocket = null;
window.userWebSocket = null;
window.queryString = "";
window.notification_counter = 0;
window.gameWebsocket = null;
window.isFirstLogin = true;

await checkCookies();
await checkToken();


const app = new Framework();

app.route('/', HomeComponent);
app.route('/chat', ChatComponent);
app.route('/profile', ProfileComponent);
app.route('/settings', SettingsComponent);
// app.route('/login', loginComponent);
// app.route('/login/confirme', TwofaPage);
app.route('/game/tictactoe', Main);
app.route('/game/tictactoe/local', TicTacToeLocal);
app.route('/game/tictactoe/remote', GameRemote);
app.route('/game/tictactoe/vs_ai', TicTAcToeAiDificulty);
/*****************Pong Game Routes*************** */

app.route('/game', game_dashboard);
app.route('/game/localgame', LocalGameComponent);
app.route('/game/match', GamePage);
app.route('/game/tournament/board', TournamentBoard);
app.route('/game/tournament/join', JoinTournament);
app.route('/game/tournament/startMatch', PlayersReady);
app.route('/game/online/match', RemoteMatch);
app.route('/game/MultiPlayersMatch', MultiPlayer);
app.route('/Http500', ServerErrorComponent);


app.start();
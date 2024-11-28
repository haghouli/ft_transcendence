import { errorAlert, infoAlert } from "../utilities/alerts.js";
import { getCookie, getQueryParams, httpGet, httpPost, navigate } from "../utilities/utiles.js";
import { createElement } from '../utilities/genrateHtml.js'
import { BACKEND_BASED_URL, COOKIE_NAME, DEFAULT_GAME_COOKIE } from "../utilities/constants.js";
import {createUserMatchesHistoryCard} from '../utilities/genrateHtml.js'
import { refreshAccessToken } from "../utilities/utiles.js";


function percentToDegrees(percent) {
    if (percent < 0 || percent > 100) {
        throw new Error("Percentage must be between 0 and 100.");
    }
    return percent * 3.6;
}

const acceptFriendRequest = async (friendship_id) => {
    try {
        const token = getCookie(COOKIE_NAME);
        if(token) {
            const response = await fetch(`${BACKEND_BASED_URL}/api/users/user/accept_friend_request/${friendship_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization' : `Bearer ${token}`,
                },
            })

            if(response.status == 200) {
                infoAlert(i18next.t('alerts.friendShipAccept'));
                return true;
            }
            if(response.status === 401)
            {
                await refreshAccessToken();
                return await acceptFriendRequest(friendship_id); 
            }
            errorAlert(i18next.t('alerts.friendShipAcceptError'));
            return false;
        } else {
            navigate('/login');
        }
    } catch {
        navigate('/login');
    }
}

const removeFriendRequest = async (friendship_id) => {
    try {
        const token = getCookie(COOKIE_NAME);
        if(token) {
            const response = await fetch(`${BACKEND_BASED_URL}/api/users/user/delete_friend_request/${friendship_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization' : `Bearer ${token}`,
                },
            })
            if(response.status == 200){
                infoAlert(i18next.t('alerts.friendShipReject'));
                return true;
            }
            if(response.status === 401)
            {
                await refreshAccessToken();
                return await removeFriendRequest(friendship_id);
            }
            errorAlert(i18next.t('alerts.friendShipRejectError'));
            return false;
        } else {
            navigate('/login');
        }
    }catch {
        navigate('/login');
    }
}

const sendFriendRequest = async (reciever_id) => {
    const data = {reciever_id : reciever_id};
    const res = await httpPost(`/api/users/user/send_friend_request/`, data);
    if(res) {
        infoAlert(i18next.t('alerts.sendRequestSucess'));
        return true;
    } else {
        errorAlert(i18next.t('alerts.sendRequestError'));
        return false;
    }
}

const getFriendShip = async (id) => {
    const friendship = await httpGet(`/api/users/user/friend_ship/${id}`)
    return friendship;
}

const getUser = (user_id) => {
    const current_user = httpGet(`/api/users/user/${user_id}`);
    return current_user;
}

const getUserScore = (user_id) => {
    const selectedGame = getCookie(DEFAULT_GAME_COOKIE);
    const route = selectedGame == 'tictactoe' ? `/api/users/user/tictactoe/score/${user_id}` : `/api/users/user/score/${user_id}`;
    const current_user_score = httpGet(route);
    return current_user_score;
}

const getUserGames = (user_id) => {
    const selectedGame = getCookie(DEFAULT_GAME_COOKIE);
    const route = selectedGame == 'tictactoe' ? `/api/users/user/tictactoe/matches/${user_id}` : `/api/users/user/matches/${user_id}`;
    const current_user_games = httpGet(route);
    return current_user_games;
}


const addEvent = async (btn, current_user, friend_ship, callback) => {
    btn.addEventListener('click', async () => {
        const res = await callback(friend_ship.id);
        if(res) {
            btn.remove();
            btnSwitch(current_user);
        }
    })
    document.getElementById('profile-user-btns').appendChild(btn);
}

const btnSwitch = async (current_user) => {
    const friend_ship = await getFriendShip(current_user.id);

    if(friend_ship) {
        if(friend_ship.status == -1 && friend_ship.banner_id == user.data_id) {
            const unbanBtn = createElement('button', {class: 'pr-btn', id: 'removeBtn'}, [`${i18next.t('profile.unban')}`])
            await addEvent(unbanBtn, current_user, friend_ship, removeFriendRequest);
        } else if(friend_ship.friend_ship_sender.id == user.data.id && friend_ship.status == 0) {
            const cancelBtn = createElement('button', {class: 'pr-btn', id: 'removeBtn'}, [`${i18next.t('profile.cancleRequest')}`])
            await addEvent(cancelBtn, current_user, friend_ship, removeFriendRequest);
        } else if(friend_ship.friend_ship_sender.id == user.data.id && friend_ship.status == 1) {
            const removeBtn = createElement('button', {class: 'pr-btn', id: 'removeBtn'}, [`${i18next.t('profile.remove')}`]);
            await addEvent(removeBtn ,current_user, friend_ship,removeFriendRequest);
            document.getElementById('profile-user-btns').appendChild(removeBtn);
        } else if(friend_ship.friend_ship_sender.id != user.data.id && friend_ship.status == 0) {
            const acceptBtn = createElement('button', {class: 'pr-btn', id: 'removeBtn'}, [`${i18next.t('profile.acceptRequest')}`])
            await addEvent(acceptBtn, current_user, friend_ship,acceptFriendRequest);
            const rejectBtn = createElement('button', {class: 'pr-btn', id: 'removeBtn'}, [`${i18next.t('profile.rejectRequest')}`])
            await addEvent(rejectBtn, current_user, friend_ship,removeFriendRequest);
        } else if(friend_ship.friend_ship_sender.id != user.data.id && friend_ship.status == 1) {
            const removeBtn = createElement('button', {class: 'pr-btn', id: 'removeBtn'}, [`${i18next.t('profile.remove')}`])
            await addEvent(removeBtn, current_user, friend_ship, removeFriendRequest);
        }
    } else {
        const addBtn = createElement('button', {class: 'pr-btn', id: 'addBtn'}, [`${i18next.t('profile.addFriend')}`]);
        
        addBtn.addEventListener('click', async (e) => {
            const res = await sendFriendRequest(current_user.id);
            if(res) {
                addBtn.remove();
                await btnSwitch(current_user);
            }
        })
        document.getElementById('profile-user-btns').appendChild(addBtn);
    }
}

const fillProfileData = (current_user) => {
    const userProfileImage = createElement('img', {src: `${BACKEND_BASED_URL}${current_user.avatar}`, atl: ''});
    document.getElementById('user-profile-image').appendChild(userProfileImage);
    const userProfileUsername = createElement('h1', {}, [current_user.username]);
    document.getElementById('user-profile-username').appendChild(userProfileUsername);

    if(current_user.id != user.data.id) {
        btnSwitch(current_user);
    }
}

const addPieChart = (userScore) => {

    const div = createElement('div', {class: 'pie'}, []);
    if(userScore.number_matches == 0) {
        div.style.backgroundImage = `conic-gradient(
            white 0deg,
            white 360deg
        )`;
    } else {        
        const numberDraws = userScore.number_matches - userScore.number_wins - userScore.numbers_losers;
        const winPercent = percentToDegrees((userScore.number_wins * 100) / userScore.number_matches);
        const losePercent = percentToDegrees((userScore.numbers_losers * 100) / userScore.number_matches);
        const drawsPercent = percentToDegrees((numberDraws * 100) / userScore.number_matches);
    
    
        div.style.backgroundImage = `conic-gradient(
            green ${winPercent}deg,
            red ${winPercent}deg ${winPercent + losePercent}deg,
            gray ${winPercent + losePercent}deg ${winPercent + losePercent + drawsPercent}deg
        )`;
    }

    document.getElementById('pie-chart')
    .appendChild(div);
}

const fillUserScore = async (current_user) => {
    const userScore = await getUserScore(current_user.id);

    const levelBar = document.getElementById('level-fill');
    if(userScore.number_matches != 0) {

        const numberPointes = userScore.points_number;
        const res = numberPointes / 20;
        document.getElementById('user-level').textContent = `${i18next.t('profile.level')} ${Math.floor(res)}`;
        const decimalPart = res - Math.floor(res);
        levelBar.style.width = `${decimalPart * 100}%`;

        document.getElementById('winnes-label').textContent = userScore.number_wins;
        document.getElementById('losses-label').textContent = userScore.numbers_losers;
        document.getElementById('games-label').textContent = userScore.number_matches;

        const win_rate = Math.floor((userScore.number_wins * 100) / userScore.number_matches);
        document.getElementById('winrate-label').textContent = `${win_rate}%` ;

    } else {
        document.getElementById('winnes-label').textContent = 0;
        document.getElementById('losses-label').textContent = 0;
        document.getElementById('games-label').textContent = 0;
        document.getElementById('winrate-label').textContent = `${0}%`;
        levelBar.style.width = `${0}%`;
    }
    addPieChart(userScore);
    
}

const fillMatcheHistory = async (current_user) => {
    const userMatches = await getUserGames(current_user.id);
    userMatches.map(item => {
        const matchHistoryCard = createUserMatchesHistoryCard(item);
        document.getElementById('matches-history').appendChild(matchHistoryCard);
    })
}

export default class ProfileComponent {
    constructor(){
        
        const id = getQueryParams('id')
        id != null ? this.user_id = id : this.user_id = user.data.id;
        this.cssPath = "./css/Profile.css";
    }
    
    fillPageData = async () => {
        let current_user = await getUser(this.user_id);
        if(!current_user) 
            current_user = user.data;
        fillProfileData(current_user);
        await fillUserScore(current_user);
        await fillMatcheHistory(current_user);
    }

    getCssPath = () => {
        return this.cssPath;
    }

    spaDiv = () => {
        const spaDiv = document.querySelector('.spa');
        spaDiv.style.display = 'flex';
        spaDiv.style.flexDirection = 'column';
    }

    async init() {
       this.spaDiv();
       await this.fillPageData();
    }
    

    closeup() {
        
    }

    async render() {
        return `
            <div class="profile">
                <div class="pr-up">
                    <div class="pr-image">
                        <div class="pr-image-up"> </div>
                        <div class="pr-image-down">
                            <div class="pr-user-image" id="user-profile-image">
                                <!-- <img src="./images/avatar.png" alt="" > -->
                            </div>
                            <div class="pr-user-name" id="user-profile-username">
                                <!-- <h1>mtadlaou</h1> -->
                            </div>
                            <div class="pr-user-btns" id="profile-user-btns">
                                <!-- <button class="pr-btn" id="addBtn">Add Friend</button>
                                <button class="pr-btn" id="removeBtn">Remove</button> -->
                            </div>
                            <div class="pr-user-level">
                                <h1 id="user-level" >Level 0</h1>
                                <div class="level-bar">
                                    <div class="level-fill" id="level-fill">
                                    </div>
                                    <!-- <span class="level-text">Level 10%</span> -->
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="pr-info">
                        <div class="pr-info-user">
                            <div class="pr-info-user-left">
                                <div class="stat-box">
                                    <div class="stat-label">${i18next.t('profile.wins')}</div>
                                    <div class="stat-number" id="winnes-label">0</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-label">${i18next.t('profile.losses')}</div>
                                    <div class="stat-number" id="losses-label">0</div>
                                </div>
                            </div>
                            <div class="pr-info-user-right">
                                <div class="stat-box">
                                    <div class="stat-label">${i18next.t('profile.gamesPlayed')}</div>
                                    <div class="stat-number" id="games-label">0</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-label">${i18next.t('profile.winRate')}</div>
                                    <div class="stat-number" id="winrate-label">0</div>
                                </div>
                            </div>
                        </div>
                        <div class="pr-info-rank">
                            <div class="statictics-header">
                                ${i18next.t('profile.gamePlayStatistics')}
                            </div>
                            <div class="statictics-body" id="pie-chart">

                            </div>
                            <div class="statictics-footer">
                                <div class="statistics-footer-span wins">
                                    ${i18next.t('profile.win')}
                                </div>
                                <div class="statistics-footer-span loses">
                                    ${i18next.t('profile.lose')}
                                </div>
                                <div class="statistics-footer-span draws">
                                    ${i18next.t('profile.draw')}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <div class="pr-down">
                    <div class="match-title">${i18next.t('profile.gamesHistory')}</div>
                    <div class="matches-container" id="matches-history">
                        <!-- <div class="match-result">
                            <div class="player-info">
                                <img src="./images/avatar.png" alt="Player 1" class="player-img">
                                <div class="player winner">Player 1</div>
                            </div>
                            <div class="score">10 - 5</div>
                            <div class="player-info right-div">
                                <div class="player loser">Player 2</div>
                                <img src="./images/avatar.png" alt="Player 2" class="player-img">
                            </div>
                        </div> -->
                    </div>
                </div>
            </div>
        `;
    }
}
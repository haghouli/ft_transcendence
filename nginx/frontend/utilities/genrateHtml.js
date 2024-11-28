import { errorAlert, infoAlert } from "./alerts.js";
import { BACKEND_BASED_URL, COOKIE_NAME, BACKEND_BASED_SOCKET_URL } from "./constants.js";
import { httpPost, getCookie, httpGet, formatTime } from "./utiles.js";
import { refreshAccessToken } from "./utiles.js";


const getChatRoomMessages =  async (chatroom_id) => {
    const messages = await httpGet(`/api/chat_rooms/room/messages/${chatroom_id}`);
    return messages;
}

const acceptFriend = async (id, element) => {
    const token = getCookie(COOKIE_NAME);
    try {
        if (token !== "") {
            const response = await fetch(`${BACKEND_BASED_URL}/api/users/user/accept_friend_request/${id}`, {
                method: "Put",
                headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                },
            });
    
            const data = await response.json();
            if(response.status == 200) {
                element.remove();
            } else if(response.status === 401) {
                await refreshAccessToken();
                return await acceptFriend(id, element);
            } else {
                errorAlert(i18next.t('alerts.acceptFriendShip'));
            }
        } else {
            errorAlert(i18next.t('alerts.acceptFriendShip'));
        }

    }catch {
        navigate('/login');
    }
}

const refuseFriend = async (id, element) => {
    try {
        const token = getCookie(COOKIE_NAME);
        if (token !== "") {
            const response = await fetch(`${BACKEND_BASED_URL}/api/users/user/delete_friend_request/${id}`, {
                method: "DELETE",
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json', 
                },
            });
        
            const data = await response.json();
            if(response.status == 200) {
                element.remove();
            } else if(response.status === 401) {
                await refreshAccessToken();
                return await refuseFriend(id, element); 
            } else {
                errorAlert(i18next.t('alerts.refuseFriendShipError'));
            }
        } else {
            errorAlert(i18next.t('alerts.refuseFriendShipError'));
        }

    }catch {
        navigate('/login');
    }

}

export function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            element.setAttribute(key, attributes[key]);
        }
    }

    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });

    return element;
}


export const createOnlineUserCard = (user) => {
    const image = createElement('img', {src: `${BACKEND_BASED_URL}${user.avatar}`, alt: ''});
    const span = user.status == true ? createElement('span', {class: 'offline'}) : createElement('span', {class: 'online_icon'});
    const ancore = createElement('a', {href: `#/profile?id=${user.id}`, class: 'fr-img'}, [image, span]);
    return ancore;
}

export const createSearchUserCard = (user) => {
    const image = createElement('img', {src: `${BACKEND_BASED_URL}${user.avatar}`, alt: 'User Avatar'});
    const div1 = createElement('div', {class: 'user-image'}, [image]);
    const div2 = createElement('div', {class: 'username'}, [`${user.username}`]);
    const div3 = createElement('div', {class: 'level'}, [`Level: ${user.level}`]);
    const div4 = createElement('div', {class: 'user-text'}, [div2, div3]);
    const ancore = createElement('a', {class: 'user-info-saver', href: `#/profile?id=${user.id}`}, [div1, div4]);

    return ancore;
}


export const createTopFiveElements = (user, idx) => {
    const span2 = createElement('span', {class: 'name'}, [user.username]);
    const span3 = createElement('span', {class: 'level'}, [`Level ${user.level}`]);
    const div1 = createElement('div', {class: "top-player-info"}, [span2, span3]);
    const image1 = createElement('img', {src: `${BACKEND_BASED_URL}${user.avatar}`, alt: 'Player'});
    const span1 = createElement('span', {class: 'player-rank'}, [`#${idx + 1}`]);
    const li = createElement('li', {class: 'top-player'}, [span1, image1, div1]);
    const ul = createElement('ul', {class: 'player-list'}, [li]);

    return ul;
}

export const createUserMatchesHistoryCard = (match) => {

    const player1Image = createElement('img', {class: 'player-img', src: `${BACKEND_BASED_URL}${match.player1.avatar}`, alt: 'Player 1'});
    const player2Image = createElement('img', {class: 'player-img', src: `${BACKEND_BASED_URL}${match.player2.avatar}`, alt: 'Player 2'});
    const player1Dive = createElement('div', {class: 'player_profile winner'}, [match.player1.username]);
    const player2Dive = createElement('div', {class: 'player_profile  loser'}, [match.player2.username]);
    const Player1InfoDive = createElement('div', {class: 'player-info'}, [player1Image, player1Dive]);
    const Player2InfoDive = createElement('div', {class: 'player-info right-div'}, [player2Dive, player2Image]);
    const scoreDive = createElement('div', {class: 'score'}, [`${match.player1_score} - ${match.player2_score}`]);

    const matchDateFormated = formatTime(match.start_date);

    const matchDate = createElement('div', {class: 'match-date'}, [`${matchDateFormated}`]);

    const matchCard = createElement('div', {class: 'match-result'}, [Player1InfoDive, scoreDive, Player2InfoDive, matchDate]);

    return matchCard;
}

export const createNotificationCard = (friendRequest) => {

    const image = createElement('img', {src: `${BACKEND_BASED_URL}${friendRequest.user.avatar}`, alt: ''},);
    const strong = createElement('strong', {}, [friendRequest.user.username]);
    const descriptionDiv = createElement('div', {class: 'description'}, [image, strong]);

    const i1 = createElement('i', {class: 'fa-solid fa-check', id: 'accept-btn'});
    const i2 = createElement('i', {class: 'fa-solid fa-x', id: 'refuse-btn'});
    
    const btnsDiv = createElement('div', {class: 'not-btn'}, [i1, i2]);

    const notificationDiv = createElement('div', {class: 'notif_card unread'}, [descriptionDiv, btnsDiv]);

    i1.addEventListener('click' , () => {
        acceptFriend(friendRequest.id, notificationDiv);
        notification_counter--;
        document.getElementById('notifes').textContent = notification_counter;
    })

    i2.addEventListener('click' , () => {
        refuseFriend(friendRequest.id, notificationDiv);
        notification_counter--;
        document.getElementById('notifes').textContent = notification_counter;
    })

    return notificationDiv;
}

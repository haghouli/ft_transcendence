import { BACKEND_BASED_URL } from "../../utilities/constants.js";
import resultPage from "./resultPage.js";
import { setTheBoardColor } from '../../utilities/utiles.js'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default class TicTacToeRemote {

    constructor(isTurnToplay, c,  gameWebsocket, player1, player2) {

        this.gameWebsocket = gameWebsocket;
        this.currentPlayer = c;
        this.isMyTurn = isTurnToplay;
        this.player1 = player1;
        this.player2 = player2;
        this.navigate_route = '/game/tictactoe/remote';

        gameWebsocket.onmessage = async (e) => {
            const data = JSON.parse(e.data);
            if(data.action == "send_index") {
                document.getElementById(`cell_${data.idx}`).textContent = data.c;
                if(data.c == "X") {
                    document.getElementById('local-player2-span').classList.add('selected');
                    document.getElementById('local-player1-span').classList.remove('selected');
                } else {
                    document.getElementById('local-player1-span').classList.add('selected');
                    document.getElementById('local-player2-span').classList.remove('selected');
                }
                if(this.currentPlayer == data.c) {
                    this.isMyTurn = false
                } else {
                    this.isMyTurn = true;
                }
            } else if(data.action == "draw") {
                document.getElementById(`cell_${data.idx}`).textContent = data.c;
                const resPage = new resultPage(data.message, this.navigate_route);
                document.getElementById('remote-game').innerHTML = resPage.render();
            } else if(data.action == "disconnection") {
                const resPage = new resultPage(i18next.t('tictactoe.oppDisconnect'), this.navigate_route);
                document.getElementById('remote-game').innerHTML = resPage.render();
                resPage.init();
            }else  if (data.action == "winne_state") {
                document.getElementById(`cell_${data.idx}`).textContent = data.c;
                const str = data.c == this.currentPlayer ? i18next.t('tictactoe.youWin') : i18next.t('tictactoe.youLose') ;
                const resPage = new resultPage(str, this.navigate_route);
                document.getElementById('remote-game').innerHTML = resPage.render();
                resPage.init();
            }
        }
    }

    closeup() {
        
    }


    makeMove(idx) {
        if(!this.isMyTurn)
            return;

        this.gameWebsocket.send(JSON.stringify({
            'idx': idx,
            'c': this.currentPlayer,
            'action': 'send_index',
            'message': 'send index'
        }))
    }

    setTimer() {
        let couter = 30;
        const timer = document.getElementById('timer');
        setInterval(() => {
            timer.textContent = couter;
            couter--;
        }, 1000)
    }

    init() {
        const oppUser = user.data.id == this.player1.id ? this.player2.username : this.player1.username;
        userWebSocket.send(JSON.stringify({
            'message': `you start new match against ${oppUser}`,
            'sender_id': user.data.id,
            'reciever_id': user.data.id,
            'action': 'bot_message',
        }))

        for(let i = 0; i < 9; i++) {
            document.getElementById(`cell_${i}`)
            .addEventListener('click', (e) => {
                this.makeMove(i);
            })
        }
        setTheBoardColor();
    }

    async render() {
        return `
             <div class="tic-tac-toe" id="local-game">
                <div class="local-player">
                    <div class="local-game-avatar-div selected" id="local-player1-span">
                        <img src="${BACKEND_BASED_URL}${this.player1.avatar}" />
                    </div>
                    <span>${ this.player1.username == user.data.username ? i18next.t('tictactoe.you') : this.player1.username}</span>
                </div>
                <div class="local-mid-section">
                    <div class="tictactoe-board">
                        <div class="cell" id="cell_0"></div>
                        <div class="cell" id="cell_1"></div>
                        <div class="cell" id="cell_2"></div>
                        <div class="cell" id="cell_3"></div>
                        <div class="cell" id="cell_4"></div>
                        <div class="cell" id="cell_5"></div>
                        <div class="cell" id="cell_6"></div>
                        <div class="cell" id="cell_7"></div>
                        <div class="cell" id="cell_8"></div>
                    </div>
                </div>
                <div class="local-player">
                    <div class="local-game-avatar-div" id="local-player2-span">
                        <img src="${BACKEND_BASED_URL}${this.player2.avatar}" />
                    </div>
                    <span>${this.player2.username == user.data.username ? i18next.t('tictactoe.you') : this.player2.username}</span>
                </div>
            </div>
        `
    }
}
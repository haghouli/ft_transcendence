import { BACKEND_BASED_URL, BACKEND_BASED_SOCKET_URL } from "../../utilities/constants.js";
import TicTacToeRemote from "./TicTacToeRemote.js";
import { refreshAccessToken } from "../../utilities/utiles.js";
import { checkToken } from "../../js/app.js";


export default class GameRemote {

    connectGameSocket = async () =>{
        const res = await checkToken();
        if(res == false)
            return;
        this.gameWebsocket = new WebSocket(`${BACKEND_BASED_SOCKET_URL}/ws/mackmakingsocket/`);
    
        this.gameWebsocket.onopen = () => {
           
        }

        this.gameWebsocket.onclose = (e) => {
            
        }

        this.gameWebsocket.onmessage = async (e) => {
            const data = JSON.parse(e.data)
            if(data.action == 'match_found') {
                const tictactoeRmote = new TicTacToeRemote(
                    data.turn_to_play,
                    data.c,
                    this.gameWebsocket,
                    data.player1,
                    data.player2,
                );
                document.getElementById('remote-game')
                .innerHTML = await tictactoeRmote.render();
                tictactoeRmote.init();
            }
        }
    }

    constructor() {
        this.gameWebsocket = null;
        this.connectGameSocket();
    }

    init(){

    }

    closeup() {
        if(this.gameWebsocket.readyState == WebSocket.OPEN)
            this.gameWebsocket.close();
    }

    async render() {
        return `
            <div class="tic-tac-toe-remote" id="remote-game">
                <div class="looking-for-game-div">
                    <div class="looking-for-game-div-player">
                        <div class="local-game-avatar-div selected" id="local-player1-span">
                            <img src="${BACKEND_BASED_URL}${user.data.avatar}" />
                        </div>
                        <span>${i18next.t('tictactoe.you')}</span>
                    </div>

                    <div class="looking-for-game-div-player test">
                        <div class="local-game-avatar-div selected" id="local-player1-span">
                            <img src="../../assets/gameAvatar.jpg" />
                        </div>
                        <span>${i18next.t('tictactoe.looking')}</span>
                    </div>
                </div>
            </div>
        `
    }

}
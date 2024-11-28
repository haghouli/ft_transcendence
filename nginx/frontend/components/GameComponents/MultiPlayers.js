import { navigate, getCookie } from "../../utilities/utiles.js";
import { render, gameOver, handel_prematch }  from "../../utilities/gameUtiles.js";
import { BACKEND_BASED_SOCKET_URL, DEFAULT_BOARD_COLOR_COOKIE } from "../../utilities/constants.js";
import { checkToken } from "../../js/app.js"

export class MultiPlayer {
    constructor()
    {
        const cookieValue = getCookie(DEFAULT_BOARD_COLOR_COOKIE);
        this.color = '#03346E'
      
        if(cookieValue == 'b') {
            this.color = 'black';
        } else if(cookieValue == 'g') {
            this.color = 'rgb(36, 94, 36)';
        }
        this.matchtSockcet = null
    }
    closeup(){
        if (this.matchtSockcet && this.matchtSockcet.readyState == WebSocket.OPEN)
            this.matchtSockcet.close()
        document.removeEventListener("keydown", this.update);
    }
    async init(){
        const res = await checkToken();
        if(res == false)
            return;

        let url = `${BACKEND_BASED_SOCKET_URL}/ws/localSingle/multi`;
        this.matchtSockcet = new WebSocket(url);
        this.update = this.update.bind(this);

        this.matchtSockcet.onopen = async event=>
        {
            
        const lplayerScore = document.getElementById ("player1Score");
        const rplayerScore =  document.getElementById("player2Score");
        const tplayerScore =  document.getElementById("player3Score");
        if (lplayerScore)
            lplayerScore.textContent = "player 1 : 0";
        if (rplayerScore)
            rplayerScore.textContent = "player 2 : 0" ;
        if (tplayerScore)
            tplayerScore.textContent = "player 3 : 0"
        }
 
        this.matchtSockcet.onmessage = async event=>{
            const data = JSON.parse(event.data);
            
            if (data.action == "startGame")
            {
                document.addEventListener("keydown", this.update)

                // await handel_prematch()
                if (this.matchtSockcet.readyState == WebSocket.OPEN){
                    this.matchtSockcet.send(JSON.stringify({
                        'action' : 'startGame',
                    }))
                }
            }
            
            if (data.action == 'changes')
            {
                const page =  window.location.hash.slice(1)
                if (page == "/game/MultiPlayersMatch")
                {
                    const game_state = data.game_state
                    await  this.startGame(game_state)
                }
            }
            if (data.action == 'gameOver') {
                let winner = 'player01';
                if (data.game_state.rplayer.score > data.game_state.lplayer.score)
                    winner = "Player02"
                if (data.game_state.tplayer.score > data.game_state.rplayer.score)
                    winner = "Player03"
                gameOver(winner + `${i18next.t('pongGame.win')}`, this.color)
                
            }
        }
    }


    update(event)
    {  
        if (this.matchtSockcet.readyState == WebSocket.OPEN){
            this.matchtSockcet.send(JSON.stringify({
                'action' : 'move_player',
                'key': event.key
            }))
        }
    }
    
    async startGame(game_state)
    {
        this.lplayer = game_state.lplayer;
        this.rplayer = game_state.rplayer;
        this.tplayer = game_state.tplayer;
        this.net = game_state.net;;
        this.ball = game_state.ball;
        this.table = game_state.table;

        const lplayerScore = document.getElementById ("player1Score");
        const rplayerScore =  document.getElementById("player2Score");
        const tplayerScore =  document.getElementById("player3Score");
        if (lplayerScore)
            lplayerScore.textContent = "player 1 : " + game_state.lplayer.score;
        if (rplayerScore)
            rplayerScore.textContent = "player 2 : " + game_state.rplayer.score;
        if (tplayerScore)
            tplayerScore.textContent = "player 3 : " + game_state.tplayer.score;

        const contai = document.querySelector(".game_container-multi");
        if (contai)
        {
            if (window.innerWidth >= 900)
            {
                contai.style.width = '900px';
                contai.style.height = '900px';
                
            }
            else{
                contai.style.width = window.innerWidth + 'px';
                contai.style.height = window.innerWidth + 'px';

            }
        }
        this.table.color = this.color
        render(this.lplayer, this.rplayer,this.ball, this.table, null, this.tplayer)
    }
    
    async render(){
        return `
        <div class="game_body">
                <div class="game_container-multi">
                    <div class="playerName-multi player3Name-multi">
                        <!--<div>Player3</div>-->
                        <div class="keys-multi" id="topInfo"><span class="key-multi">W</span> ${i18next.t('pongGame.moveRight')}, <span class="key-multi">S</span>${i18next.t('pongGame.moveLeft')}</div>
                        <div id="player3Score"></div>
                        </div>
                    <div class="game_section-multi">
                        <!-- Left Player (Player 1) -->
                        <div class="playerName-multi player1Name-multi">
                            <!--<div>Player1</div> -->
                            <div class="keys-multi" id="rightInfo"><span class="key-multi">W</span> ${i18next.t('pongGame.moveUp')}, <span class="key-multi">S</span> ${i18next.t('pongGame.moveDown')}</div>
                            <div id="player1Score"></div>
                    </div>

                        <!-- Game Canvas -->
                            <canvas class="game-multi" id='table-multi'></canvas>
                        <!-- Right Player (Player 2) -->
                        <div class="playerName-multi player2Name-multi">
                            <div id="player2Score"></div>
                            <div class="keys-multi" id="leftInfo"><span class="key-multi">⬆</span> ${i18next.t('pongGame.moveUp')}, <span class="key-multi">⬇</span> ${i18next.t('pongGame.moveDown')}</div>
                            <!--<div>Player2</div> -->
                        </div>
                    </div>
                    <div class="playerName-multi player4Name-multi"></div>
                    <!-- Start Message -->
                    <div class="start_message" id="start_message" style="display:none">
                        <span id="timeToStart"></span>
                    </div>
                    <div id="endGameScreen" style="display:none">
                        <div id="winMessage">${i18next.t('pongGame.win')}</div>
                        <button id="playAgainBtn" class="buttonKey"><span id="key-eff">(r)&nbsp;</span>${i18next.t('pongGame.playAgain')}</button>
                        <button class="buttonKey" id="menuBtn" ><span class="key-eff">(esc)&nbsp;</span>${i18next.t('pongGame.mainMenu')}</button>
                        <button class="buttonKey" id="tecTacBtn">${i18next.t('pongGame.playTicTacToe')}</button>
                    </div>
                </div>
            </div>`;
    }
}
import { navigate, getCookie } from "../../utilities/utiles.js"
import { stopPulseAnimation, sleep, handel_prematch, setPlayersScore, setPlayersValues, gameOver }  from "../../utilities/gameUtiles.js";
import { startPulseAnimation, scaleAnimation , goHome, playeAgain, tectac, actionEvent }  from "../../utilities/gameUtiles.js";
import { render }  from "../../utilities/gameUtiles.js";
import { BACKEND_BASED_SOCKET_URL, BACKEND_BASED_URL, DEFAULT_BOARD_COLOR_COOKIE } from "../../utilities/constants.js";
import { checkToken } from "../../js/app.js"

export class RemoteMatch
{
    constructor(){
        this.matchingSocket = null
    }

    closeup(){
        if (this.matchingSocket && this.matchingSocket.readyState == WebSocket.OPEN)
            this.matchingSocket.close()
        document.removeEventListener("keydown", this.update);
        document.removeEventListener("keyup", actionEvent);
    }

    async init(){
    
        const res = await checkToken();
        if(res == false)
            return;

        let url = `${BACKEND_BASED_SOCKET_URL}/ws/socket-server/`
        this.matchingSocket = new WebSocket(url);
        this.update = this.update.bind(this);
        
        let player1Name;
        let player2Name;
        let vs;
        let opponentCart;

        let lPlayerImage;
        let rPlayerImage;
        let cartLplayerImage
        let cartRplayerImage

        /************ */
        const cookieValue = getCookie(DEFAULT_BOARD_COLOR_COOKIE);
        this.color = '#03346E'
      
        if(cookieValue == 'b') {
            this.color = 'black';
        } else if(cookieValue == 'g') {
            this.color = 'rgb(36, 94, 36)';
        }
        /************ */

        this.matchingSocket.onmessage = async event=> {
            let data = JSON.parse(event.data);
            
            if (data.status == 'waiting_opponent')
            {
                player1Name  = document.querySelector('#player1>.name_block');
                player2Name  = document.querySelector('#player2>.name_block');
                lPlayerImage = document.getElementById("lplayer_img");
                rPlayerImage = document.getElementById("rplayer_img");
                cartLplayerImage =  document.querySelector(".player1-cart>.image_block>.image");
                cartRplayerImage = document.querySelector(".player2-cart>.image_block>.image");
                const carts = Array.from(document.getElementsByClassName('players_carts'));

                vs  = document.querySelector('.vs');
                const table = document.getElementById("table")
                if (table)
                    table.style.background = this.color
                carts.push(vs);
                carts.forEach(cart => {
                    if (cart) {
                      cart.style.display = 'flex';
                    }
                  });
                this.ID = data.player.username
                if (data.order == 1)
                {
                    opponentCart  = document.querySelector('#player2>.image_block')
                    player1Name.textContent = data.player.username;
                    player2Name.textContent = `${i18next.t('pongGame.looking')}`;
                    cartLplayerImage.style.backgroundImage =  `url(${BACKEND_BASED_URL}${data.player.avatar})`;
                    cartRplayerImage.style.backgroundImage = "url(../assets/avatar2.png)";
                }
                else{
                    opponentCart  = document.querySelector('#player1>.image_block')
                    player2Name.textContent = data.player.username;
                    player1Name.textContent = `${i18next.t('pongGame.looking')}`;
                    cartRplayerImage.style.backgroundImage =  `url(${BACKEND_BASED_URL}${data.player.avatar})`;
                    cartLplayerImage.style.backgroundImage = "url(../assets/avatar1.png)";
                }
                startPulseAnimation(opponentCart);
            }
            if (data.status == 'http500'){
                navigate("/Http500")
            }
            if (data.status == 'game_resumed'){
                this.update(this.matchingSocket)
                const lplayer = data.player1;
                const rplayer = data.player2;
                this.ID = data.player.username
                setPlayersValues(lplayer.username, rplayer.username, null)
                lPlayerImage = document.getElementById("lplayer_img");
                rPlayerImage = document.getElementById("rplayer_img");
                if (lPlayerImage && rPlayerImage)
                {
                    lPlayerImage.style.backgroundImage = `url(${BACKEND_BASED_URL}${lplayer.avatar})`
                    rPlayerImage.style.backgroundImage = `url(${BACKEND_BASED_URL}${rplayer.avatar})`
                }
                document.addEventListener("keydown", this.update)
                this.GaveUpCase(this.matchingSocket)
            }

            if (data.status == "setPlayers")
            {
                handel_prematch(data.player1, data.player1, data.message)
            }
            if (data.status == 'players_matched') {
                
                let lplayer = data.player1
                let rplayer = data.player2

                //set images for player card 2 seconds
                cartLplayerImage.style.backgroundImage = `url(${BACKEND_BASED_URL}${lplayer.avatar})`
                cartRplayerImage.style.backgroundImage = `url(${BACKEND_BASED_URL}${rplayer.avatar})`
                await sleep(2000);
                stopPulseAnimation(opponentCart);
                player1Name.textContent = data.player1.username;
                player2Name.textContent = data.player2.username;
                lPlayerImage.style.backgroundImage = `url(${BACKEND_BASED_URL}${lplayer.avatar})`
                rPlayerImage.style.backgroundImage = `url(${BACKEND_BASED_URL}${rplayer.avatar})`
                const carts = Array.from(document.getElementsByClassName('players_carts'));
                vs  = document.querySelector('.vs');
                carts.push(vs);
                await sleep(2000)   ;
                carts.forEach(cart => {
                    if (cart) { // Check if cart is not null or undefined
                        cart.remove()
                    }
                    });
                document.addEventListener("keydown", this.update)
                await handel_prematch(lplayer.username, rplayer.username);
                if (this.matchingSocket.readyState  == WebSocket.OPEN)
                {
                    this.matchingSocket.send(JSON.stringify({
                        'action': 'start_match'
                    }))
                }
                    
                this.GaveUpCase(this.matchingSocket)
            }
            if (data.action == 'changes') {
                const page =  window.location.hash.slice(1)
                const canva = document.getElementById("table")
                if (page == "/game/online/match" && canva){
                    this.player = data.player;
                    this.opponent = data.opponent;
                    this.net = data.net;
                    this.ball = data.ball;
                    this.table = data.table;
                    this.table.color = this.color;
                    
                    setPlayersScore(data.player.score, data.opponent.score)
                    canva.width = table.width
                    canva.height = table.height
                    render( this.player,  this.opponent, this.ball, this.table, this.net)
                }
            }
            if (data.action == 'game_over') {
             
                    if (data.winner == this.ID)
                        gameOver(`${i18next.t('pongGame.youWon')}`, this.color, this.update)
                    else
                        gameOver(`${i18next.t('pongGame.youLose')}`, this.color, this.update)
                    const elem = document.querySelector(".GavingUp-container")
                    if (elem)
                        elem.remove();
                }

            if (data.status == 'leaving') {

                const giveUpBtn = document.getElementById("giveUp");
                if (giveUpBtn)
                {
                    giveUpBtn.removeEventListener("click", this.handleGiveUp);
                    giveUpBtn.remove()
                }
                if (data.left_player == this.ID)
                    await navigate("/game");
                else{
                    gameOver(`${i18next.t('pongGame.oppLeft')}`, this.color, this.update)
                    }
                }
            if (data.status == 'changes') {
                const gameData = data.data;
            }
        };
    }


    ID = ""
    player = {}
    opponent = {}
    net = {}
    ball = {}
    table = {}

    update(event)
    {  
        if (this.matchingSocket.readyState  == WebSocket.OPEN)
        {
            this.matchingSocket.send(JSON.stringify({

                'key': event.key
            }))
        }
    }
    
    removeGaveUpEvents(){
        const giveUpBtn = document.getElementById("giveUp");
        const cancelBtn =  document.querySelector(".cancel-button");
        const confirmBtn =  document.querySelector(".confirm-button");
        giveUpBtn.removeEventListener("click", this.handleGiveUp);
        cancelBtn.removeEventListener("click", this.hanelCancelling);
        confirmBtn.removeEventListener("click", this.handelConfirming);
        const confirmContainer =  document.querySelector(".GavingUp-container");
        if (giveUpBtn && cancelBtn && confirmBtn && confirmContainer)
        {
            confirmContainer.style.display = 'none'
            giveUpBtn.removeEventListener("click", this.handleGiveUp);
            cancelBtn.removeEventListener("click", this.hanelCancelling);
            confirmBtn.removeEventListener("click", this.handelConfirming);
        }
    }

    hanelCancelling(){
        const giveUpBtn = document.getElementById("giveUp");
        const cancelBtn =  document.querySelector(".cancel-button");
        const confirmBtn =  document.querySelector(".confirm-button");
        const confirmContainer =  document.querySelector(".GavingUp-container");
        if (giveUpBtn && cancelBtn && confirmBtn && confirmContainer)
        {
            confirmContainer.style.display = 'none'
            giveUpBtn.removeEventListener("click", this.handleGiveUp);
            cancelBtn.removeEventListener("click", this.hanelCancelling);
            confirmBtn.removeEventListener("click", this.handelConfirming);
        }
    }

    GaveUpCase(socket) {
        const giveUpBtn = document.getElementById("giveUp");
        // Define the handler with socket in scope
        const handleGiveUp =() => {
            const confirmationDiv = document.querySelector(".GavingUp-container");
            confirmationDiv.style.display = 'flex';
            const confirmBtn = document.querySelector(".confirm-button");
            const cancelBtn = document.querySelector(".cancel-button");
            if (cancelBtn && confirmBtn)
            {
                cancelBtn.addEventListener("click", this.hanelCancelling);
                const handelConfirming = () =>{
                    const item =  document.querySelector(".GavingUp-container");
                    item.style.display = 'none' 
                    if (this.matchingSocket.readyState  == WebSocket.OPEN)
                    {
                        socket.send(JSON.stringify({
                            action: 'gave_up'
                        }));
                    }
                    this.removeGaveUpEvents();
                    // navigate('/');

                }
                confirmBtn.addEventListener("click", handelConfirming);
                this.handelConfirming = handelConfirming;
            }
        }
    
        // Add event listener
        if (giveUpBtn) {
            giveUpBtn.addEventListener("click", handleGiveUp);
            this.handleGiveUp = handleGiveUp;
        }
    }

    async render(){
        return `
        <div class="game_body-custom">
            <div class="game_container">
                <div class="playersInfo">
                    <div class="player_img" id="lplayer_img" style="order: 1;"></div>
                    <div class="player_img" id="rplayer_img" style="order: 4";></div>

                    <div class="player_info" id="lplayer_info" style="order: 2">
                        <div class="player_name" id="lplayer_name">-------</div>
                        <div class="player_score" id="lplayer_score">0</div>
                    </div>

                    <div class="player_info" id="rplayer_info" style="order: 3">
                        <div class="player_name" id="rplayer_name"  style="order: 2">-------</div>
                        <div class="player_score" id="rplayer_score"  style="order: 1">0</div>
                    </div>

                </div>
                <div class="separate"></div>
                <div class="game">
                    <canvas id='table'></canvas>
                    <div class="players_carts player1-cart" id="player1" style="display: none;">
                        <div class="image_block">
                            <div class="image player1-image"></div>
                        </div>
                        <div class="name_block">Ayoub</div>
                    </div>
                    
                    <div class="players_carts player2-cart" id="player2" style="display: none;">
                        <div class="image_block">
                            <div class="image player2-image"></div>
                        </div>
                        <div class="name_block">${i18next.t('pongGame.looking')}</div>
                        <!-- <div class="name_block">Ayoub</div> -->
                        </div>
                        <div class="vs" style="display : none">${i18next.t('pongGame.vs')}</div>
                    <div class="players_message" style="display: none;">
                            <div>
                                <span>5</span>
                            </div>
                    </div>
                    <div class="GavingUp-container" style="display: none;">
                        <div class="GavingUp-box">
                            <div class="GavingUp-title">${i18next.t('pongGame.giveUp')}</div>
                            <div class="GavingUp-message">${i18next.t('pongGame.youWillLose')}</div>
                            <div class="GavingUp-buttons">
                                <button class="GavingUp-button confirm-button">${i18next.t('pongGame.confirm')}</button>
                                <button class="GavingUp-button cancel-button">${i18next.t('pongGame.cancel')}</button>
                            </div>
                        </div>
                    </div>
                    <div class="end_message" style="display : none">
                        <div class="result"></div>
                    </div>

                    <div class="players_message" id = "timer" style="display: none;"></div>
                    <div class="start_message" style="display : none">
                        <div id="timeToStart"></div>
                    </div>

                    <div id="endGameScreen" style="display: none;" class="player1WonMessagePosition">
                        <div id="winMessage">${i18next.t('pongGame.win')}</div>
                        <button id="playAgainBtn" class="buttonKey" ><span class="key-eff">(r)&nbsp;</span>${i18next.t('pongGame.playAgain')}</button>
                        <button class="buttonKey" id="menuBtn"><span class="key-eff">(esc)&nbsp;</span>${i18next.t('pongGame.mainMenu')}</button>
                        <button id="tecTacBtn" class="buttonKey">${i18next.t('pongGame.playTicTacToe')}</button>
                    </div>
                    <button id="giveUp" >${i18next.t('pongGame.exit')}</button>
                </div>
            
            </div>

        </div>
    </div>`;
        }
    }
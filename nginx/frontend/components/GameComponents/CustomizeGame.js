import * as  gameUtiles from "../../utilities/gameUtiles.js";
import {playeAgain, goHome, tectac, actionEvent}  from "../../utilities/gameUtiles.js";
import { navigate } from "../../utilities/utiles.js"
import { page } from "../gamePage.js"
import { checkToken } from "../../js/app.js"
import { BACKEND_BASED_SOCKET_URL } from '../../utilities/constants.js'

export class LocalGameComponent {

    gameState = {
        selectedTable : null,
        selectedPaddel : {
            player1 : null,
            player2 : null
        },
        playerName : {
            player1 : null,
            player2 : null,
        },
    };
    lplayer = {}
    rplayer = {}
    net = {}
    ball = {}
    table = {}

    constructor(){
        this.matchtSockcet = null
    }

    async init() {
        const res = await checkToken();
        if(res == false)
            return;
        let url = `${BACKEND_BASED_SOCKET_URL}/ws/localSingle/default`;
        this.matchtSockcet = new WebSocket(url);
        this.update = this.update.bind(this);
        this.matchtSockcet.onopen = async event=>
        {
            this.initGame()
            await this.handelStartBtn(this.matchtSockcet);
        }
        this.matchtSockcet.onmessage = async event=>{
            const data = JSON.parse(event.data);
            if (data.action == 'startGame'){
                document.addEventListener("keydown", this.update)
            }
            if (data.action == 'changes'){
                const page =  window.location.hash.slice(1)
                if (page == "/game/localgame")
                {
                    const game_state = data.game_state
                    await  this.startGame(game_state)
                }
            }
            if (data.action == 'gameOver') {
                let rplayer = data.game_state.rplayer;
                let winner = this.gameState.playerName['player1'] //default lplayer
                if (rplayer.score > winner.score)
                    winner = this.gameState.playerName['player2']
               gameUtiles.gameOver(winner + `${i18next.t('pongGame.win')}`, this.gameState.selectedTable)
            }
            if (data.action == 'leaving') {
                navigate('/game/localgame');
            }
        }
    }
    closeup(){
        if (this.matchtSockcet && this.matchtSockcet.readyState == WebSocket.OPEN)
            this.matchtSockcet.close()
        document.removeEventListener("keydown", this.update);
        document.removeEventListener("keyup", actionEvent);
    }

    actionEvent(event)
    {
        if (event.key == "Escape")
        {
            navigate("/");
            document.removeEventListener("keydown", this.actionEvent);
        }
        if (event.key == "r"){
            navigate("/game/localgame");
            document.removeEventListener("keydown", this.actionEvent);
        }
    }


    update(event)
    {  
        if (this.matchtSockcet.readyState  == WebSocket.OPEN){
            this.matchtSockcet.send(JSON.stringify({
                'action' : 'move_player',
                'key': event.key
            }))
        }
    }
    
    async handelStartGame(socket)   
    {
        gameUtiles.navigateGame(page())
        const table = document.getElementById("table");
        if (table)
            table.style.background = this.gameState.selectedTable;
        await gameUtiles.handel_prematch(this.gameState.playerName['player1'], this.gameState.playerName['player2'])
        if (this.matchtSockcet.readyState  == WebSocket.OPEN)
        {
            socket.send(JSON.stringify({
                'action' : 'startGame',
            }))
        }
    }
    
    async startGame(game_state)
    {
        this.lplayer = game_state.lplayer;
        this.rplayer = game_state.rplayer;
        this.net = game_state.net;;
        this.ball = game_state.ball;
        this.table = game_state.table;
        this.table.color = this.gameState.selectedTable
        this.lplayer.color = this.gameState.selectedPaddel.player1
        this.rplayer.color = this.gameState.selectedPaddel.player2
        const lplayerScore = document.getElementById("rplayer_score");
        const rplayerScore =  document.getElementById("lplayer_score");
        const rplayerName = document.getElementById("rplayer_name")
        const lplayerName = document.getElementById("lplayer_name")
        const table = document.getElementById("table")
        // if (table)
        // {
        //     table.style.width = '100%';
        //     table.style.height = "100%";
        // }
        if (lplayerName)
            lplayerName.textContent = this.gameState.playerName.player1
        if (rplayerName)
            rplayerName.textContent = this.gameState.playerName.player2
        if (rplayerScore)
            rplayerScore.textContent = game_state.lplayer.score;
        if (lplayerScore)
            lplayerScore.textContent = game_state.rplayer.score;
        gameUtiles.render(this.lplayer, this.rplayer,this.ball, this.table, this.net)
    }
    
    async handelStartBtn(webSocket){
        const startBtn = document.getElementById('startGame');
        if (startBtn)
        {
            startBtn.addEventListener('click', async (event)=>{
                if (!startBtn.disabled)
                    await this.handelStartGame(webSocket)
            })
        }
    }

// Utility to handle table selection
    handleTableClick(tables) {
        tables.forEach(table => {
            table.addEventListener('click', event=> {
                tables.forEach(t => t.classList.remove('selectedTable')); // Remove 'selected' from all tables
                event.currentTarget.classList.add('selectedTable'); // Add 'selected' to the clicked table
                this.gameState.selectedTable = this.setColor(event.currentTarget.getAttribute('data-value')); // Log the data-value attribute
            });
        });
    }

    // Initialize tables
    initTables() {
        const tables = document.getElementsByClassName('tables');
        if (tables.length > 0) {
            tables[0].classList.add('selectedTable'); // Select the first table by default
            this.gameState.selectedTable = this.setColor(tables[0].getAttribute('data-value')) // Set table color by default
            this.handleTableClick(Array.from(tables)); // Convert to array and set up event listeners
        }
    }

    playersReady(player1, player2)
    {
        return (player1.textContent != 'Ready' && player2.textContent != 'Ready')
    }

    toggleStartGameBtn(enable)
    {
        let startGameBtn = document.getElementById('startGame')
        if (enable){
            startGameBtn.disabled = false  // set button as enabled
            startGameBtn.addEventListener('mouseover' , this.handleMouseOver); 
            startGameBtn.addEventListener('mouseout' , this.handleMouseOut);  
            startGameBtn.style.opacity = '1'
        } else {
            startGameBtn.removeEventListener('mouseover', this.handleMouseOver);
            startGameBtn.removeEventListener('mouseout', this.handleMouseOut);
            startGameBtn.disabled = true  // set button as enabled
            startGameBtn.style.opacity = '0.25'
        }
    }
    // Utility for handling paddles click
    paddleClickHandler(paddles, player) {
        return event=> {
            paddles.forEach(paddle => paddle.classList.remove('selectedPaddle'));
            event.currentTarget.classList.add('selectedPaddle');
            this.gameState.selectedPaddel[player] = this.setColor(event.currentTarget.getAttribute('data-value'));
        }
    }

    // Utility for adding/removing hover effect
    togglePaddleHover(paddles, enable) {
        paddles.forEach(paddle => {
            if (enable) {
                paddle.addEventListener('mouseover', this.handleMouseOver);
                paddle.addEventListener('mouseout', this.handleMouseOut);
            } else {
                paddle.removeEventListener('mouseover', this.handleMouseOver);
                paddle.removeEventListener('mouseout', this.handleMouseOut);
            }
        });
    }

    // Generalized Ready Handler for both players
    // handlePlayerReady(paddles, inputField, readyBtn, otherReadyBtn, playerSelector, clickHandler) {
    //     if (readyBtn.getAttribute("data-value") === "Ready") {
            
    //         if (inputField.value == '')
    //             inputField.value =  inputField.getAttribute('id')
    //         this.gameState.playerName[playerSelector] = inputField.value
    //         this.togglePaddleHover(paddles, false);  // Disable hover effect
    //         inputField.disabled = true;
    //         inputField.style.border = "none";
    //         inputField.style.opacity = '0.25'
    //         readyBtn.getAttribute("data-value") = "Cancel";
    //         readyBtn.textContent = "Cancel";
    //         paddles.forEach(paddel=>paddel.style.opacity = '0.25')
    //         paddles.forEach(paddle => paddle.removeEventListener('click', clickHandler));
    //     } else {
    //         this.togglePaddleHover(paddles, true);  // Enable hover effect
    //         inputField.disabled = false;
    //         inputField.style.border = "solid 1px #666673";
    //         inputField.style.opacity = '1'
    //         readyBtn.getAttribute("data-value") = "Ready";
    //         readyBtn.textContent = "Ready";
    //         paddles.forEach(paddel=>paddel.style.opacity = '1')
    //         paddles.forEach(paddle => paddle.addEventListener('click', clickHandler));
    //     }
    //     this.toggleStartGameBtn(this.playersReady(readyBtn, otherReadyBtn));
    // }
    
    handlePlayerReady(paddles, inputField, readyBtn, otherReadyBtn, playerSelector, clickHandler) {
    
        if (readyBtn.getAttribute("data-value") === "Ready") {
            
            if (inputField.value === '')
                inputField.value = inputField.getAttribute('id');
            this.gameState.playerName[playerSelector] = inputField.value;
            this.togglePaddleHover(paddles, false);  // Disable hover effect
            inputField.disabled = true;
            inputField.style.border = "none";
            inputField.style.opacity = '0.25';
            readyBtn.setAttribute("data-value", "Cancel");  // Use setAttribute here
            const cancel = i18next.t('pongGame.cancel')
            readyBtn.textContent = `${cancel}`;
            paddles.forEach(paddle => paddle.style.opacity = '0.25');
            paddles.forEach(paddle => paddle.removeEventListener('click', clickHandler));
        } else {
            this.togglePaddleHover(paddles, true);  // Enable hover effect
            inputField.disabled = false;
            inputField.style.border = "solid 1px #666673";
            inputField.style.opacity = '1';
            readyBtn.setAttribute("data-value", "Ready");  // Use setAttribute here
            
            const ready = i18next.t('pongGame.ready')
            readyBtn.textContent = ready;
            paddles.forEach(paddle => paddle.style.opacity = '1');
            paddles.forEach(paddle => paddle.addEventListener('click', clickHandler));
        }
        this.toggleStartGameBtn(this.playersReady(readyBtn, otherReadyBtn));
    }
    
    // Hover effect handlers
    handleMouseOver() {
        this.style.opacity = '0.75';
    }
    
    handleMouseOut() {
        this.style.opacity = '1';
    }
    
    // Initialize paddles for both players
    initPaddles(playerSelector, selectedClass) {
        const paddles = Array.from(document.querySelectorAll(`.${playerSelector} > .paddles > div`));
        paddles[0].classList.add(selectedClass);  // Mark the first paddle as selected
        this.gameState.selectedPaddel[playerSelector] = this.setColor(paddles[0].getAttribute('data-value'))
        return paddles;
    }
    
    // Set Color depend paddels selected
    setColor(paddlName)
    {
        const colorsMap ={
            'ice'		: '#1E90FF',
            'blood'		: '#F35969',
            'basic'		: '#D9D9D9',
            'classic'	: '#000000',
            'standard'	: '#00008B',
            'foot' 	    : '#245e24'
        }
        return colorsMap[paddlName]
    }
    
    // Initialize the game
    initGame() {
        const lPlayerPaddles = this.initPaddles("player1", 'selectedPaddle');
        const rPlayerPaddles = this.initPaddles("player2", 'selectedPaddle');
    
        const lPlayerReadyBtn = document.querySelector(".player1 > button");
        const rPlayerReadyBtn = document.querySelector(".player2 > button");
        const lInputText = document.querySelector(".player1 input");
        const rInputText = document.querySelector(".player2 input");
    
        const lClickHandler = this.paddleClickHandler(lPlayerPaddles, 'player1');
        const rClickHandler = this.paddleClickHandler(rPlayerPaddles, 'player2');
    
        lPlayerPaddles.forEach(paddle => paddle.addEventListener('click', lClickHandler));
        rPlayerPaddles.forEach(paddle => paddle.addEventListener('click', rClickHandler));
    
        this.togglePaddleHover(lPlayerPaddles, true);
        this.togglePaddleHover(rPlayerPaddles, true);
        this.toggleStartGameBtn(false)
        // toggleStartGameBtn(playersReady(lPlayerReadyBtn, rPlayerReadyBtn))
        lPlayerReadyBtn.addEventListener('click', () => this.handlePlayerReady(lPlayerPaddles, lInputText, lPlayerReadyBtn, rPlayerReadyBtn, 'player1', lClickHandler));
        rPlayerReadyBtn.addEventListener('click', () => this.handlePlayerReady(rPlayerPaddles, rInputText, rPlayerReadyBtn, lPlayerReadyBtn, 'player2',  rClickHandler));
        this.initTables(); // Initialize tables
    }
    
    // Call the initialization     // initGame();
    
    async render(){
        return `
        <div class="game_body">
            <div class="page_container">
                <div class="single-titles">
                    <div class="oneVone"> ${i18next.t('pongGame.1vs1')}</div>
                    <div class="custom">${i18next.t('pongGame.custumizeGame')}</div>
                </div>
                    <div class="blocks">
                        <div class="customTable">
                            <div class="customTabelTitle single-title">${i18next.t('pongGame.chooseTable')}</div>
                            <div class="classicTbl tables" data-value="classic">
                                <div class="table">
                                    <div class="lpaddle"></div>
                                    <div class="rpaddle"></div>
                                    <div class="ball"></div>
                                    <div class="net"></div>
                                </div>
                                <div class="type">${i18next.t('pongGame.classic')}</div>
                            </div>

                            <div class="standardTbl tables" data-value="standard">
                                <div class="table">
                                    <div class="lpaddle"></div>
                                    <div class="rpaddle"></div>
                                    <div class="ball"></div>
                                    <div class="net"></div></div>
                                <div class="type">${i18next.t('pongGame.standard')}</div>
                            </div>

                                <div class="footballTbl tables" data-value="foot">
                                    <div class="table">
                                        <div class="lpaddle"></div>
                                        <div class="rpaddle"></div>
                                        <div class="ball"></div>
                                        <div class="net"></div></div>
                                    <div class="type">${i18next.t('pongGame.football')}</div>
                                </div>
                        </div>

                        <div class="customPlayers">
                                <div class="customPlayersTitle single-title">${i18next.t('pongGame.customizePlayer')}</div>
                                <div class="players">
                                    <div class="player1 player">
                                        <div class="player-title">${i18next.t('pongGame.player1')}</div>
                                        <input type="text" class="playerName" placeholder="Alias/name" id ='player01'>
                                        <div class="choosePaddle">${i18next.t('pongGame.choosePaddle')}</div>
                                        <div class="paddles">
                                            <div class="basic" data-value="basic"><div></div></div>
                                            <div class="blood" data-value="blood"><div></div></div>
                                            <div class="ice" data-value="ice"><div></div></div>
                                        </div>
                                        <button data-value="Ready">${i18next.t('pongGame.ready')}</button>
                                    </div>
                                    <div class="player2 player">
                                        <div class="player-title">${i18next.t('pongGame.player2')} </div>
                                        <input type="text" class="playerName" placeholder="Alias/name" id ='player02'>
                                        <div class="choosePaddle">${i18next.t('pongGame.choosePaddle')}</div>
                                        <div class="paddles">
                                            <div class="basic" data-value="basic"><div></div></div>
                                            <div class="blood" data-value="blood"><div></div></div>
                                            <div class="ice" data-value="ice"><div></div></div>
                                        </div>
                                        <button data-value="Ready">${i18next.t('pongGame.ready')}</button>
                                    </div>
                                </div>
                                <button id="startGame" disabled> ${i18next.t('pongGame.startGame')}</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        `
    }

}
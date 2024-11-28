import { navigate, getCookie } from "../../utilities/utiles.js";
import * as  gameUtiles from "../../utilities/gameUtiles.js";
import { page } from "../gamePage.js"
import { BACKEND_BASED_SOCKET_URL, DEFAULT_BOARD_COLOR_COOKIE } from "../../utilities/constants.js";
import { checkToken } from "../../js/app.js"

export class JoinTournament {
    countPlayers = 0
    isCancelled = false;

    constructor(){
        const cookieValue = getCookie(DEFAULT_BOARD_COLOR_COOKIE);
        this.color = '#03346E'
      
        if(cookieValue == 'b') {
            this.color = 'black';
        } else if(cookieValue == 'g') {
            this.color = 'rgb(36, 94, 36)';
        }
        this.tournamentSockcet = null

    }

   
    closeup(){
        if (this.tournamentSockcet.close() && this.tournamentSockcet.readyState == WebSocket.OPEN)
            this.tournamentSockcet.close()
        document.removeEventListener("keydown", this.update);
    }

    async init(){
        
        const res = await checkToken();
        if(res == false)
            return;
        
        let url = `${BACKEND_BASED_SOCKET_URL}/ws/localTournament/` + 'tour4' + '/'
        this.tournamentSockcet = new WebSocket(url);
        this.update = this.update.bind(this);

        this.tournamentSockcet.onopen = event=> {
            let countPlayers = document.getElementById('countPlayers')
            let type = document.getElementById('tourType')
            if (countPlayers && type){
                countPlayers.textContent = this.countPlayers;
                type.textContent = "4" ;//this.getPlayersNumber("tour4");
            }
        };
    
        this.tournamentSockcet.onmessage = async event=> {
            let data = JSON.parse(event.data);
            const game_state = data.game_state

            if (data.status == "userFound"){
                this.handelErrorUserFound();
            }

            if (data.status == 'players_ready')
            {
                const player1 = data.currentMatch[0];
                const player2 = data.currentMatch[1];
                gameUtiles.notifyBot(`${player1} VS ${player2}`)
                await gameUtiles.tournament_board(data.tournament_stats)
                await this.handelTournamentStart(this.tournamentSockcet, data)
            }

            if (data.status == 'render')
            {
               let lplayer_score =  document.getElementById('lplayer_score');
               let rplayer_score = document.getElementById('rplayer_score')
               if (lplayer_score && rplayer_score)
               {
                    lplayer_score.textContent = game_state.lplayer.score
                    rplayer_score.textContent = game_state.rplayer.score
               }
                game_state.table.color = this.color
                gameUtiles.render(game_state.lplayer, game_state.rplayer, game_state.ball, game_state.table, game_state.net);
            }

            if (data.status == 'game_over') {  
                document.removeEventListener("keydown", this.update);
                const player1 = data.currentMatch[0];
                const player2 = data.currentMatch[1];
                gameUtiles.notifyBot(`${player1} VS ${player2}`)
                await gameUtiles.tournament_board(data.tournament_stats)
                this.handelTournamentStart(this.tournamentSockcet, data)
            }
            if (data.status == 'next_tour'){
                if (this.tournamentSockcet.readyState  == WebSocket.OPEN)
                {
                    this.tournamentSockcet.send(JSON.stringify({
                        'action' : 'next_tour',
                    })) 
                }
            }
            if (data.status == 'tournament_finiched'){
                document.removeEventListener("keydown", this.update);
                let winner = data.winner;

                gameUtiles.notifyBot(`${winner} is the champion, Congratulation`)
                await gameUtiles.tournament_board(data.tournament_stats)
                let nextMatchDiv = document.querySelector(".next-match");
                const champion = document.querySelector('.champion-name');
                const championName = document.querySelector('.username_round3');
                if (champion && championName)
                {
                    championName.textContent = winner;
                    champion.style.display = "flex"
                }
                if (nextMatchDiv)
                {
                    nextMatchDiv.remove()
                }
            }
        }
        this.userJoin(this.tournamentSockcet)    
    }

    update(event)
    {
        if (this.tournamentSockcet.readyState  == WebSocket.OPEN)
        {
            this.tournamentSockcet.send(JSON.stringify({
                'action'  : "move_player",
                'key': event.key
            }))
        }
    }

    async start_match(socket, data)
    {
            await gameUtiles.navigateGame(page())
            await this.preparingMatch()
            let lplayer = document.getElementById('lplayer_name')
            let rplayer = document.getElementById('rplayer_name')
            if(lplayer && rplayer){
                rplayer.textContent = data.currentMatch[0];
                lplayer.textContent = data.currentMatch[1];
            }
            document.addEventListener("keydown", this.update);
            if (this.tournamentSockcet.readyState  == WebSocket.OPEN)
            {
                socket.send(JSON.stringify({
                    'action' : 'start_match',
                }));
            }
    }

    async preparingMatch()
    {
        let timer = document.getElementById('timer')
        if (timer)
        {
            timer.style.display = "flex"
            for (let i = 3; i > 0; i--)
            {
                timer.textContent = i
                await gameUtiles.sleep(1000)
            }
            timer.remove()
        }
    }

    handelErrorUserFound(){
        let nicknameField = document.getElementById('nickname')
        const inputSection = document.querySelector('.input-section');
        inputSection.classList.add('found');
        this.countPlayers -= 1;
        document.getElementById('countPlayers').textContent = this.countPlayers;
        nicknameField.style.border= '2px solid red';
    }

    userJoin(socket){

        let joinBtn = document.getElementById('join')
        let nicknameField = document.getElementById('nickname')
        const inputSection = document.querySelector('.input-section');
        nicknameField.addEventListener('input', function() {
            if (nicknameField.value.trim() !== "") {
                nicknameField.style.border= "none";
                inputSection.classList.remove('empty');
                inputSection.classList.remove('found');
            }
        });
        if (joinBtn)
        {
            joinBtn.onclick = event=>{
                if (nicknameField.value == '')
                {
                    inputSection.classList.add('empty');
                    nicknameField.style.border= '2px solid red';
                }
                else{
                    this.countPlayers += 1;
                    document.getElementById('countPlayers').textContent = this.countPlayers;
                    if (this.tournamentSockcet.readyState  == WebSocket.OPEN)
                    {
                        socket.send(JSON.stringify({
                            'action' : 'player_joined', 
                            'user' : nicknameField.value
                        }))
                    } 
                    if (nicknameField){
                        nicknameField.value = ''
                    }
                }
                nicknameField.focus()
            }    
        }
    }
    
    handelTournamentStart(socket, data)
    {
        let start = document.getElementById("start")
        let lplayer = document.getElementById('lplayer_name')
        let rplayer =  document.getElementById('rplayer_name')
        const champion = document.querySelector(".champion-name");
        if (champion)
        {
            champion.style.display = "none"
        }
        if (lplayer && rplayer){
            lplayer.textContent = data.currentMatch[0] // left player
            rplayer.textContent =  data.currentMatch[1] // right player
        }
        if (start)
        {
            start.addEventListener("click", async event=>{
                await this.start_match(socket, data)
            })
        }
    }

    async render(){
        return `
        <div class="game_body">
            <div class="tournament-container">
                <h1 class="tournamentJoin-title">${i18next.t('pongGame.joinTheTour')}</h1>
                <div class="input-section">
                    <input type="text" id="nickname" class="player-input" placeholder="${i18next.t('pongGame.enterName')}" />
                    <button class="join-btn" id='join'>${i18next.t('pongGame.join')}</button>
                </div>
                <p class="player-count">${i18next.t('pongGame.playeresJoin')}: <span id="countPlayers">0</span>/<span id="tourType">4</span></p>
                <ul class="player-list">
                    <!-- Joined player names will be shown here -->
                </ul>
            </div>
        </div>
        `;
    }
}
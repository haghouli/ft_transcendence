import { navigate } from "../../utilities/utiles.js"

export class game_dashboard {

    constructor() {
    }
   
    closeup(){
       
    }

    init() {
        let oneVSoneBtn = document.getElementById('local_button')
        let MultiPlayersBtn = document.getElementById('multi_button')
        // let leftBar = document.querySelector('.left')
        // let rightBar = document.querySelector('.right')
        // leftBar.style.display = 'none'
        // rightBar.style.display = 'none'

        let singleBtn = document.getElementById('online_button')
        let tourBtn = document.getElementById('tour_button')
        let tourRemoteBtn = document.getElementById('Remot_tour_button')

        if (singleBtn) {
            singleBtn.addEventListener("click",async event =>{
                await navigate("/game/online/match")
                    // matchMakingHandling();
            } )
        }
        if (tourBtn) {

            tourBtn.addEventListener("click", event=>{
                navigate("/game/tournament/join")
                // remoteTour.handelRemoteTournament()
                // utils.changeContent(page.choiseTournamentPage());
                // localT.handelTournament()
            });
        }
        if (oneVSoneBtn)
        { 
            oneVSoneBtn.addEventListener("click", event=> {
            // singleLocal.singleMatchHandle();
            // utils.changeContent(page.singleMatchPage());
            // sigleLocal.initGame()
                navigate('/game/localgame');
            });
        }
        if (MultiPlayersBtn){
            MultiPlayersBtn.addEventListener("click", event=> {
            // singleLocal.singleMatchHandle();
            // utils.changeContent(page.singleMatchPage());
            // sigleLocal.initGame()
                navigate('/game/MultiPlayersMatch');
            });
        }
    
        
    }

    async render() {
        return `
               <div class="game_body">
            <section class="game_board">
                <div class="title">${i18next.t('pongGame.chooseGameMode')}</div>
                <div class="choose_buttons">
                    <div class="choose_button_seprarator">
                        <div class="type_button" id="local_button">
                            <img src="./assets/Game-On.jpg" alt="Background Image">
                            <div class="G_content">
                                <h1>${i18next.t('pongGame.localMatch')}</h1>
                                <p>${i18next.t('pongGame.connectAndComplete')}</p>
                                <button class="G_button">${i18next.t('pongGame.startPlay')}</button>
                            </div>
                        </div>
                        <div class="type_button" id="online_button">
                            <img src="./assets/Game-On.jpg" alt="Background Image">
                            <div class="G_content">
                                <h1>${i18next.t('pongGame.onlineMatch')}</h1>
                                <p>${i18next.t('pongGame.playLocally')}</p>
                                <button class="G_button">${i18next.t('pongGame.startPlay')}</button>
                            </div>
                        </div>
                    </div>
                    <div class="choose_button_seprarator">
                        <div class="type_button" id="tour_button">
                            <img src="./assets/Game-On.jpg" alt="Background Image">
                            <div class="G_content">
                                <h1>${i18next.t('pongGame.createTour')}</h1>
                                <p>${i18next.t('pongGame.CompleteIn')}</p>
                                <button class="G_button">${i18next.t('pongGame.startPlay')}</button>
                            </div>
                        </div>
                        <div class="type_button" id="multi_button">
                            <img src="./assets/Game-On.jpg" alt="Background Image">
                            <div class="G_content">
                                <h1>${i18next.t('pongGame.3Players')}</h1>
                                <p>${i18next.t('pongGame.challengeFriend')}</p>
                                <button class="G_button">${i18next.t('pongGame.startPlay')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        `;
    }

}

import { DEFAULT_GAME_COOKIE } from "../../utilities/constants.js";
import { getCookie, navigate } from "../../utilities/utiles.js";

export default class Main {

    constructor() {
       
    }

    init() {
        const cookie = getCookie(DEFAULT_GAME_COOKIE);
        
        document.getElementById('tictactoe-local-play-btn')
        .addEventListener('click', async ()=> {
            navigate('/game/tictactoe/local')
        })

        document.getElementById('tictactoe-ai-play-btn')
        .addEventListener('click', async ()=> {
            navigate('/game/tictactoe/vs_ai')
        })
        
        document.getElementById('tictactoe-findopp-play-btn')
        .addEventListener('click', async ()=> {
            navigate('/game/tictactoe/remote')
        })
    }

    closeup() {
        
    }

    async render() {
        return `
            <div class="tic-tac-toe-main">
                <div class="tictactoe-game-mode">
                    ${i18next.t('tictactoe.gameMode')}
                </div>
                <div class="tictactoe-game-mode-cards">

                    <div class="side-images-img" id="tour">
                        <img src="../../assets/tic.avif" alt="Background Image">
                        <div class="content">
                            <h1>${i18next.t('tictactoe.playFriend')}</h1>
                            <p>${i18next.t('home.areYouReady')}</p>
                            <button class="h_button" id="tictactoe-local-play-btn">${i18next.t('home.startPlay')}</button>
                        </div>
                    </div>
                    <div class="side-images-img" id="tour">
                        <img src="../../assets/xo2.jpg" alt="Background Image">
                        <div class="content">
                            <h1>${i18next.t('tictactoe.playVsAi')}</h1>
                            <p>${i18next.t('home.areYouReady')}</p>
                            <button class="h_button" id="tictactoe-ai-play-btn">${i18next.t('home.startPlay')}</button>
                        </div>
                    </div>
                    <div class="side-images-img" id="game">
                        <img src="../../assets/tac.webp" alt="Background Image">
                        <div class="content">
                            <h1>${i18next.t('tictactoe.findOpp')}</h1>
                            <p>${i18next.t('home.areYouReady')}</p>
                            <button class="h_button" id="tictactoe-findopp-play-btn">${i18next.t('home.startPlay')}</button>
                        </div>
                    </div>

                </div>
            </div>  
        `
    }
}
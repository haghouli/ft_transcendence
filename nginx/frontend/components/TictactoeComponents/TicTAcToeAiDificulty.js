import TicTacToeVsAi from "./TicTacToeVsAi.js"



export default class TicTAcToeAiDificulty {
    
    init() {

        document.getElementById('easy-btn')
        .addEventListener('click', async () => {
            const vsAi = new TicTacToeVsAi(2);
            document.getElementById('vs-ai-section')
            .innerHTML = await vsAi.render()
            vsAi.init();
        })

        document.getElementById('hard-btn')
        .addEventListener('click', async () => {
            const vsAi = new TicTacToeVsAi(100);
            document.getElementById('vs-ai-section')
            .innerHTML = await vsAi.render()
            vsAi.init();
        })
        
    }

    closeup() {
        
    }

    async render() {
        return `
            <div class="tic-tac-toe-vs-ai" id="vs-ai-section">
               <!--<button class="difficulty-btn easy" id="easy-btn">EASY</button>
               <button class="difficulty-btn hard" id="hard-btn">HARD</button> -->

               <div class="tictactoe-game-mode-cards">
                    <div class="game-card" id="easy-btn">
                        <div class="game-card-outside">
                            ${i18next.t('tictactoe.easy')}
                        </div>
                    </div>
                    <div class="game-card" id="hard-btn">
                        <div class="game-card-outside">
                            ${i18next.t('tictactoe.hard')}
                        </div>
                    </div>
                </div>
            </div>  
        `
    }
}
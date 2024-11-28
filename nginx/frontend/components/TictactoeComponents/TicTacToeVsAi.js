import { BACKEND_BASED_URL, DEFAULT_BOARD_COLOR_COOKIE } from '../../utilities/constants.js'
import { getCookie } from '../../utilities/utiles.js';
import resultPage from './resultPage.js';
import { setTheBoardColor } from '../../utilities/utiles.js'

export default class TicTacToeVsAi {
    

    constructor(depth) {

        this.depth = depth;
        this.navigate_route = '/game/tictactoe/vs_ai';

        this.winnerState = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],

            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],

            [0, 4, 8],
            [2, 4, 6],
        ]
        this.grid = [
            '.', '.', '.', 
            '.', '.', '.',
            '.', '.', '.',
        ]
    }

    getAvailableMoves = () => {
        let arr = [];
        this.grid.forEach((item, idx) => {
            if(item == '.')
                arr.push(idx);
        })
        return arr;
    }

    miniMax = (h, isMaximizer) => {
        if(h <= 0)
            return {'score': 0, 'bestMove': 0};
        const res = this.hasWinner()

        if(res !== false) 
            return {'score': res, 'bestMove': 0};

        const availableMoves = this.getAvailableMoves();
        let idx = -1;
        if(isMaximizer) {
            let value = -Infinity;

            availableMoves.forEach(item => {

                this.grid[item] = 'O';
                const minimaxRes = this.miniMax(h-1, false).score;

                if(minimaxRes == 1) {
                    this.grid[item] = '.';
                    value = 1;
                    idx = item;
                    return {'score': 1, 'bestMove': item}
                }

                if(value < minimaxRes) {
                    value = minimaxRes;
                    idx = item;
                }
                this.grid[item] = '.';
            })
            return {'score': value, 'bestMove': idx};
        } else {
            let value = Infinity;
            availableMoves.forEach(item => {
                this.grid[item] = 'X';
                const minimaxRes = this.miniMax(h-1, true).score;

                if(minimaxRes == -1) {
                    this.grid[item] = '.';
                    value = -1;
                    idx = item;
                    return {'score': -1, 'bestMove': item}
                }

                if(value > minimaxRes) {
                    value = minimaxRes;
                    idx = item;
                }
                this.grid[item] = '.';
            })
            return {'score': value, 'bestMove': idx};
        }
    }

    hasMovesLeft() {
        try {
            this.grid.forEach(item => {
                if(item == '.') {
                    throw true;
                }
            })
            return false;
        } catch {
            return true;
        }
    }

    hasWinner() {
        try {
            this.winnerState.forEach(combination => {
                const [a, b, c] = combination;
                if(this.grid[a] === 'X' && this.grid[b] === 'X' && this.grid[c] === 'X')
                    throw -1;
                
                if(this.grid[a] === 'O' && this.grid[b] === 'O' && this.grid[c] === 'O')
                    throw 1;
            })
            if(!this.hasMovesLeft())
                throw 0;
            return false;
        } catch(e) {
            return e;
        }
    }

    makeMove(idx, target) {
        const cellValue = this.grid[idx];
        if(cellValue != '.') {
            return;
        }
        this.grid[idx] = 'X';
        target.textContent = 'X';
        
        const gameResult = this.hasWinner();

        if(gameResult === 0) {
            const drawPage = new resultPage(i18next.t('tictactoe.draw') , this.navigate_route);
            document.getElementById('vs-ai-section').innerHTML = drawPage.render();
            drawPage.init();
            return;
        }
        else if(gameResult !== false) {
            const winPage = new resultPage(i18next.t('tictactoe.youWin') , this.navigate_route);
            document.getElementById('vs-ai-section').innerHTML = winPage.render();
            winPage.init();
            return;
        }
        const res = this.miniMax(this.depth, true)
        this.grid[res.bestMove] = 'O';
        document.getElementById(`cell_${res.bestMove}`).textContent = 'O';
        const winner = this.hasWinner();
        if(winner === 1) {
            const losePage = new resultPage(i18next.t('tictactoe.youLose') , this.navigate_route);
            document.getElementById('vs-ai-section').innerHTML = losePage.render();
            losePage.init();
        } else if(winner === 0) {
            const drawPage = new resultPage(i18next.t('tictactoe.draw') , this.navigate_route);
            document.getElementById('vs-ai-section').innerHTML = drawPage.render();
            drawPage.init();
        }

    }

    init() {
        for(let i = 0; i < 9; i++) {
            document.getElementById(`cell_${i}`)
            .addEventListener('click', (e) => {
                this.makeMove(i, e.target);
            })
        }

        setTheBoardColor();

    }

    closeup() {
        this.depth = null;
        this.winnerState = null;
        this.grid = null;
    }

    async render() {
        return `
            <div class="tic-tac-toe" id="local-game">
                <div class="local-player">
                    <div class="local-game-avatar-div selected" id="local-player1-span">
                        <img src="${BACKEND_BASED_URL}${user.data.avatar}" />
                    </div>
                    <span>${i18next.t('tictactoe.you')}</span>
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
                        <img src="../../assets/robot.png" />
                    </div>
                    <span>${i18next.t('tictactoe.bot') }</span>
                </div>
            </div> 
        `
    }
}
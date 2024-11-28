import resultPage from "./resultPage.js";
import { setTheBoardColor } from '../../utilities/utiles.js'

export default class TicTacToeLocal {

    constructor(/*player1_name, player2_name, selectedX, selectedO*/) {

        this.navigate_route = '/game/tictactoe/local';
        this.currentPlayer = 'X';
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

    hasMovesLeft() {
        try {
            this.grid.forEach(item => {
                if(item == '.') {
                    throw '';
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
                if(this.grid[a] === 'X' && this.grid[b] === 'X' && this.grid[c] === 'X'
                || this.grid[a] === 'O' && this.grid[b] === 'O' && this.grid[c] === 'O')
                    throw true;
            })
            return false;
        } catch(e) {
            return true;
        }
    }

    makeMove(idx, target) {
        const cellValue = this.grid[idx];
        if(cellValue != '.') {
            return;
        }
        this.grid[idx] = this.currentPlayer;
        // if(this.currentPlayer == 'X')
        //     target.innerHTML = `<img src='${this.selectedX}' />`;
        // else
        //     target.innerHTML = `<img src='${this.selectedO}' />`;
        target.innerHTML = this.currentPlayer;
        if(this.hasWinner()) {
            // const winner_name = this.currentPlayer === 'X' ? this.player1_name : this.player2_name;
            const resPage = new resultPage(
                `${i18next.t('tictactoe.gameOverPlayWinStart')} ${this.currentPlayer} ${i18next.t('tictactoe.gameOverPlayWinEnd')}`,
                this.navigate_route
            );
            document.getElementById('local-game')
            .innerHTML = resPage.render();
            resPage.init();
            return;
        }
        if(!this.hasMovesLeft()) {
            const resPage = new resultPage(i18next.t('tictactoe.gameOverDraw'), this.navigate_route);
            document.getElementById('local-game').innerHTML = resPage.render();
            resPage.init();
            return true;
        }
        this.currentPlayer = this.currentPlayer == 'X' ? 'O' : 'X';
        if(this.currentPlayer == 'X') {
            document.getElementById('local-player1-span').classList.add('selected');
            document.getElementById('local-player2-span').classList.remove('selected');
        } else {
            document.getElementById('local-player2-span').classList.add('selected');
            document.getElementById('local-player1-span').classList.remove('selected');
        }
        return false;
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
        
    }

    async render() {
        return `
            <div class="tic-tac-toe" id="local-game">
                <div class="local-player">
                    <div class="local-game-avatar-div selected" id="local-player1-span">
                        <img src="../../assets/gameAvatar.jpg" />
                    </div>
                    <span>${i18next.t('tictactoe.player1')}</span>
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
                        <img src="../../assets/gameAvatar.jpg" />
                    </div>
                    <span>${i18next.t('tictactoe.player2')}</span>
                </div>
            </div>  
        `
    }
}
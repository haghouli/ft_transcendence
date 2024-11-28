import TicTacToeComponent from "./TicTacTooLocal.js";

export default class GameLocal {

    constructor() {
        this.selectedX = '../../assets/x1.png';
        this.selectedO = '../../assets/o1.png';
    }

    addShapeSelectEvemtListner() {
        const x_elements = document.querySelectorAll('.shape-select-span.x');
        x_elements.forEach(item  => {
            
            item.addEventListener('click', () => {

                x_elements.forEach(item2 => {
                    item2.classList.remove('selected');
                });
    

                this.selectedX = item.children[0].src;
                item.classList.add('selected');
            })
        })

        const o_elements = document.querySelectorAll('.shape-select-span.o');
        o_elements.forEach(item  => {
            item.addEventListener('click', () => {
            
                o_elements.forEach(item2 => {
                    item2.classList.remove('selected');
                });

                this.selectedO = item.children[0].src;
                item.classList.add('selected');
            })
        })
    }


    init() {
        this.addShapeSelectEvemtListner();
        document.getElementById('start-local-game-btn').addEventListener('click', async () => {

            const player1_name = document.getElementById('user1-input').value;
            const player2_name = document.getElementById('user2-input').value;

            const tictactoe = new TicTacToeComponent(player1_name, player2_name, this.selectedX, this.selectedO);
            document.getElementById('local-game').innerHTML = await tictactoe.render();
            tictactoe.init();
        })
    }

    closeup() {
        this.selectedX = null;
        this.selectedO = null;
    }

    async render() {
        return `
            <div class="tic-tac-toe-localplay" id="local-game">
                <div class="players-option-section">
                    <div class="player-game-option">
                        <div class="player-username-option">
                            <label>PLAYER 1 NAME</label>
                            <input type="text" id="user1-input" placeholder="name 1 ..."/>
                        </div>
                        <div class="shape-select">
                            <div class="shape-select-span x selected">
                                <img src="../../assets/x1.png" >
                            </div>
                            <div class="shape-select-span x">
                                <img src="../../assets/x2.png" >
                            </div>
                            <div class="shape-select-span x">
                                <img src="../../assets/x3.png" >
                            </div>
                        </div>
                    </div>
                    <div class="player-game-option">
                        <div class="player-game-option">
                            <div class="player-username-option">
                                <label>PLAYER 2 NAME</label>
                                <input type="text" id="user2-input" placeholder="name 2 ..."/>
                            </div>
                            <div class="shape-select">
                                <div class="shape-select-span o selected">
                                    <img src="../../assets/o1.png" >
                                </div>
                                <div class="shape-select-span o">
                                    <img src="../../assets/o2.png" >
                                </div>
                                <div class="shape-select-span o">
                                    <img src="../../assets/o3.png" >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="player-game-section">
                    <button id="start-local-game-btn">
                        Play Game
                    </button>
                </div>

            </div>  
        `
    }
}
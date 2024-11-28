import { navigate } from "../../utilities/utiles.js"

export default class resultPage  {
    

    constructor(result_message, navigate_route) {
        this.result_message = result_message;
        this.navigate_route = navigate_route;
    }

    init() {
        document.getElementById('play-again-btn')
        .addEventListener('click', () => {
            navigate(this.navigate_route);
        })

        document.getElementById('back-btn')
        .addEventListener('click', () => {
            navigate('/game/tictactoe');
        })
    }

    closeupp() { }


    render() {
        return (
        `   <div class="resutl-div">
                <div class="result-top-div">
                    <h1>${this.result_message}</h1>
                </div>
                <div class="result-bot-div">
                    <button id="play-again-btn">${i18next.t('tictactoe.playAgain')}</button>
                    <button id="back-btn">${i18next.t('tictactoe.back')}</button>
                </div>
            </div>
            `
        )
    }

}
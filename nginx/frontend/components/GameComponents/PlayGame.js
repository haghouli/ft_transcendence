
export class GamePage {

    init(){
        const playerCarts = Array.from(document.getElementsByClassName("players_carts"))
            playerCarts.forEach(cart => {
                cart.style.opacity = '0'
            });
        const vs = document.querySelector(".vs") 
        if (vs)
            vs.style.opacity = '0'

    //   let carts = Array.from(document.querySelectorAll(".players_carts, .vs"))

    //   carts.forEach(element => {
    //     element.style.opacity = "0"
    //   });

    }
    closeup()
    {
        
    }
    
    async render(){
        return `
            
        <div class="game_body">
            <div class="game_container">
                <div class="playersInfo">
                    <div class="player_img" id="lplayer_img" style="order: 1;"></div>
                    <div class="player_img" id="rplayer_img" style="order: 4";></div>

                    <div class="player_info" id="lplayer_info" style="order: 2">
                        <div class="player_name" id="lplayer_name">Ankote Ayoub</div>
                        <div class="player_score" id="lplayer_score">11</div>
                    </div>

                    <div class="player_info" id="rplayer_info" style="order: 3">
                        <div class="player_name" id="rplayer_name"  style="order: 2">Ayoub belhadj</div>
                        <div class="player_score" id="rplayer_score"  style="order: 1">9</div>
                    </div>

                </div>
                <div class="separate"></div>
                <div class="game">
                    <canvas id='table'></canvas>
                    <div class="players_carts player1" id="player1" style="display: none;">
                        <div class="image_block">
                            <div class="image player1-image"></div>
                        </div>
                        <div class="name_block">Ayoub</div>
                    </div>
                    
                    <div class="players_carts player2" id="player2" style="display: none;">
                        <div class="image_block">
                            <div class="image player2-image"></div>
                        </div>
                        <div class="name_block">${i18next.t('pongGame.looking')}</div>
                        <!-- <div class="name_block">Ayoub</div> -->
                    </div>
                    <div class="players_message" style="display: none;">
                        <div>
                            <span>5</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>`;
    }
        
}
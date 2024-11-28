
export class PlayersReady {

    init()
    {
        
    }
    
    closeup()
    {
        
    }
    Playersreadiness(socket)
    {
        let lPlayerStatus = false // not ready
        let rPlayerStatus = false
        let rPlayerReadyBtn = document.getElementById('right-button')
        let lPlayerReadyBtn = document.getElementById('left-button')
    
        if (lPlayerReadyBtn) {
            lPlayerReadyBtn.addEventListener('click', async event=> {
                this.readyButton(lPlayerStatus, lPlayerReadyBtn)
                lPlayerStatus = !lPlayerStatus
                isCancelled = true; 
                await start_match(lPlayerStatus, rPlayerStatus, socket)
            });
        }
        if (rPlayerReadyBtn) 
        {
            rPlayerReadyBtn.addEventListener('click', async event=>
            {
                readyButton(rPlayerStatus, rPlayerReadyBtn)
                rPlayerStatus = !rPlayerStatus
                // Left player cancelled the match
                isCancelled = true; 
                await start_match(lPlayerStatus, rPlayerStatus, socket)
            });
        }
    }

    async render(){
        return `
            <div class="game_body">
                <div class="game_container">

                   <div class="players_carts player1-cart" id="player1" >
                        <div class="image_block">
                            <div class="image player1-image"></div>
                        </div>
                        <div class="name_block">Ayoub</div>
                        <button class="ready-button" id="right-button">${i18next.t('pongGame.ready')}</button>
                    </div>
                    
                    <div class="players_carts player2-cart" id="player2" >
                        <div class="image_block">
                            <div class="image player2-image"></div>
                        </div>
                        <div class="name_block">${i18next.t('pongGame.looking')}</div>
                        <button class="ready-button" id="left-button">${i18next.t('pongGame.ready')}</button>
                        <!-- <div class="name_block">Ayoub</div> -->
                        </div>
                        <div class="vs" style="display : none">${i18next.t('pongGame.vs')}</div>
                    </div>             
                </div>
            </div>
            
        `;
        }

    }
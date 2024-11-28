


export class TournamentBoard {
    init(){

    }
    closeup()
    {
        
    }

    async render(){
        return `
        <div class="game_body">
            <section class="tournament">
                <div class="tour_divisions">
                    <div class="div div1">
                        <div class="player_round1 player1 lplayer">
                            <div class="col1">
                                <div class="username_round1 username" id = "player1">${i18next.t('pongGame.wainting')}</div>
                            </div>
                        </div>

                        <div class="player_round1 player2 lplayer">
                            <div class="col1">
                                <div class="username_round1 username" id = "player2">${i18next.t('pongGame.wainting')}</div>
                            </div>
                        </div>
                    </div>

                    <div class="div div2">

                        <div class="player_round2 player1">
                            <div class="col1">
                                <div class="username_round2 username" id = "player11"></div>
                            </div>
                        </div>
                    </div>

                    <div class="div div3">
                        <div class="tournament_title">${i18next.t('pongGame.pongGameTour')}</div>
                        <div class="trophy"></div>
                        <div class="username_round3 winner"></div>
                        <!-- <div class="champion_str">${i18next.t('pongGame.champion')}</div> -->
                    <!-- <input class="users_field" type="text" placeholder="username/nickname" id="nickname">-->
                        <button id="start">${i18next.t('pongGame.start')}</button>
                    </div>

                    <div class="div div4">

                        <div class="player_round2 player1">
                            <div class="col1">
                                <div class="username_round2 username" id = "player1"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="div div5">
                        <div class="player_round1 player1 rplayer">
                            <div class="col1">
                                <div class="username_round1 username" id = "player3">${i18next.t('pongGame.wainting')}</div>
                            </div>
                        </div>

                        <div class="player_round1 player2 rplayer">
                            <div class="col1">
                                <div class="username_round1 username" id = "player4">${i18next.t('pongGame.wainting')}</div>
                            </div>
                        </div>

                    </div>

                </div>
            </section>
        </div>
        `
    }
};

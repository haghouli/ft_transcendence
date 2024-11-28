// Draw shapes & text functions'
// import * as page from './pages.js' 
import { navigate } from "../../utilities/utiles.js";

export function changeContent(newContent) {
        document.getElementById('page').innerHTML = newContent;
};

let ctx = null
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawRoundedRect(x, y, width, height, color, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill(); // Apply the fill color
}


export function drawBall(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

export function drawText(text, x, y, color) {
    if (!ctx)
    {
        const canv = document.getElementById("table");
        canv.width = table.width 
        canv.height = table.height
        if (canv)
            ctx = canv.getContext("2d");
    }
    ctx.fillStyle = color;
    ctx.font = "14px fantasy";
    ctx.fillText(text, x, y);
}

function drawNet(table, net) {
    for (let i = 0; i <= table.height; i += 40) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

function drawPlayer(player) {
    drawRoundedRect(player.x,player.y, player.width, player.height, player.color, 0)
    // drawRect(player.x, player.y, player.width, player.height, player.color);
}

export async function render(lplayer, rplayer, ball, table, net = null, tplayer = null) {
    // Clear the cenves
    // if (!ctx)
    // {
    let canv = document.getElementById("table");
    if ((tplayer != null)){
        canv = document.getElementById("table-multi");
    }
    if (canv){
        canv.width = table.width 
        canv.height = table.height
        if (canv)
            ctx = canv.getContext("2d");
        // }
        drawRect(0, 0, table.width, table.height, table.color);
        // Draw Net
        if (net != null)
            drawNet(table, net);
        //Drawthe ball
        drawBall(ball.x, ball.y, ball.radius, ball.color)
            //Draw players
        drawPlayer(lplayer)
        drawPlayer(rplayer)
        if (tplayer != null) 
            
            drawPlayer(tplayer) 

    } 

        //display scors

}

export async function renderMulti(lplayer, rplayer, tplayer, ball, table) {
    // Clear the cenves
    // if (!ctx)
    // {
    const canv = document.getElementById("table");
    canv.width = table.width 
    canv.height = table.height
    if (canv)
        ctx = canv.getContext("2d");
    // }
    drawRect(0, 0, table.width, table.height, table.color);
    // Draw Net
    //Drawthe ball
    drawBall(ball.x, ball.y, ball.radius, ball.color)
        //Draw players
    drawPlayer(lplayer)
    drawPlayer(rplayer)
    drawPlayer(tplayer)
        //display scors

}



export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// export function setPlayersValues(player1, player2){
//     let lplayer_name = document.getElementById('lplayer_name')
//     let rplayer_name = document.getElementById('rplayer_name')
//     if (lplayer_name && rplayer_name){
//         lplayer_name.textContent = player1
//         rplayer_name.textContent = player2
//     }
// }


export function setPlayersValues(player1, player2, player3 = null){
    let lplayer_name = document.getElementById('lplayer_name')
    let rplayer_name = document.getElementById('rplayer_name')
    if (player3){
        let tplayer_name = document.getElementById('tplayer_name')
        if (tplayer_name)
            tplayer_name.textContent = player3
    }
    if (lplayer_name && rplayer_name){
        lplayer_name.textContent = player1
        rplayer_name.textContent = player2
    }
}


export  function setPlayersScore(lplayer_score, rplayer_score){
    let lplayer_score_div = document.getElementById('lplayer_score')
    let rplayer_score_div = document.getElementById('rplayer_score')

    if (lplayer_score_div && rplayer_score_div){
        lplayer_score_div.textContent = lplayer_score
        rplayer_score_div.textContent = rplayer_score
    }
}



// export async function handel_prematch(lplayerName, rplayerName){
//     setPlayersValues(lplayerName, rplayerName)
//     let message  = document.getElementById('start_message')
//     if (message)
//     {
//         message.style.display = "block"
//         message.innerHTML = '<div>The match is going to  start at</div> <spane id="timeToStart"></spane>'
//     }
//     let timer= document.getElementById('timeToStart')
//     if(timer){
//         for (let i = 3; i > 0; i --){
//             timer.textContent = i;
//             await sleep(1000)
//         }
//     }
//     if(message)
//         message.style.display="none"
// }



export async function handel_prematch(lplayerName = null, rplayerName = null, tplayerName= null ){
    const leaveBtn = document.getElementById("giveUp");
    if (leaveBtn)
        leaveBtn.style.display = "flex"
    if (tplayerName)
        setPlayersValues(lplayerName, rplayerName, tplayerName)
    else if (lplayerName && (rplayerName))
        setPlayersValues(lplayerName, rplayerName)
    let message  = document.querySelector('.start_message')
    if (message)
        message.style.display = "flex"
    let timer= document.getElementById('timeToStart')
    if(timer){
        for (let i = 3; i > 0; i --){
            timer.textContent = i;
            await sleep(1000)
        }
    }
    if(message)
        message.remove()
}
export function gameOver(message, color, func)
{
    const winMessage =  document.getElementById("winMessage");
    const endGameScreen =  document.getElementById("endGameScreen");
    const playAgainBtn = document.getElementById("playAgainBtn");
    const menuBtn = document.getElementById("menuBtn");
    const tecTacBtn = document.getElementById("tecTacBtn");
    if (endGameScreen && winMessage)
    { 
        endGameScreen.style.background = color
        const endGameScreenChilds = Array.from(endGameScreen.children);
        endGameScreenChilds.forEach(child=>{
            child.style.background = color
        })
        endGameScreen.style.display = "flex";
        winMessage.textContent = message;
        const leaveBtn = document.getElementById("giveUp");
        if (leaveBtn)
            leaveBtn.style.display = "flex"
    }

    if (playAgainBtn)
        playAgainBtn.addEventListener("click", playeAgain);
    if (menuBtn)
        menuBtn.addEventListener("click", goHome);
    if (tecTacBtn)
        tecTacBtn.addEventListener("click", tectac);
    document.addEventListener("keyup", actionEvent)
    document.removeEventListener("keydown", func)
}

export function actionEvent(event)
{
    if (event.key == "Escape")
    {
        navigate("/game");
        document.removeEventListener("keydown", this.actionEvent);
    }
    if (event.key == "r"){
        navigate(window.location.hash.slice(1))
        document.removeEventListener("keydown", this.actionEvent);
    }
}

export function goHome()
{
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn)
        menuBtn.removeEventListener("click", goHome);
    navigate("/game")
}

export function playeAgain()
{
    const playAgainBtn = document.getElementById("playAgainBtn");
    const page =  window.location.hash.slice(1)
    if (playAgainBtn)
        playAgainBtn.removeEventListener("click", playeAgain);
    navigate(page)
}

export function tectac()
{
    const tecTacBtn = document.getElementById("tecTacBtn");
    if (tecTacBtn)
        playAgainBtn.removeEventListener("click", tectac);
    navigate("/game/tictactoe")



}


// export function handel_prematch(lplayerName, rplayerName){
//     setPlayersValues(lplayerName, rplayerName)
//     let message  = document.getElementById('start_message')
//     if (message)
//     {
//         if (timer == '0'){
//             message.style.display = 'none'
//             return;
//         }
//         console.log("Message")
//         message.style.display = "block"
//         message.innerHTML = '<div>The match is going to  start at</div> <spane id="timeToStart"></spane>'
//     }
//     let timerDiv= document.getElementById('timeToStart')
//     if (timerDiv)
//         timerDiv.innerHTML = timer
// }

const waitingAnimation = document.querySelector('#player2>.image_block');
let scale = 0.8;
let increasing = true;
let opacity = 0.3;
let animationId; 


function pulseAnimation(element) {
    function animate(){
        if (increasing) {
            scale += 0.01;
            opacity += 0.01; 
            if (scale >= 1) increasing = false;
        } else {
            scale -= 0.01; 
            opacity -= 0.01;  
            if (scale <= 0.8) increasing = true;
        }
        element.style.transform = `scale(${scale})`;
        element.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        animationId = requestAnimationFrame(animate);
        }
        animate();
}

export function startPulseAnimation(element) {
    
    if (!animationId) {
        pulseAnimation(element)
    }
}

export function scaleAnimation(element){
    element.animate(
        [
          { transform: 'scale(0)' },
          { transform: 'scale(1)' }
        ],
        {
          duration: 500,      // Animation duration in milliseconds
        //   fill: 'forwards',   // Retain the scaled-up state after animation
          easing: 'ease-in-out' // Smooth easing
        }
      );
}

export function stopPulseAnimation(element) {
    element.style.transform = `scale(1)`;
    element.style.backgroundColor = `rgba(255, 255, 255, 1)`;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null; 
    }
}

// export function  movePlayer()
// {
//     document.addEventListener("keydown", (event) => {  
//         Sockcet.send(JSON.stringify({
//             'action' : 'move_player',
//             'key': event.key
//         }))
//     });
// }

function tournamentPage()
{
    return `
       <div class="game_body">
        <section class="tournament">
            <div class="tournament-title">${i18next.t('pongGame.pongGameTour')}</div>
            <div class="tour_divisions">

                <div class="round-div round-div1">
                    <div class="player_round1 player1 lplayer">
                        <div class="col1" id="player1">
                            <div class="username_round1 username">------</div>
                        </div>
                    </div>

                    <div class="player_round1 player2 lplayer">
                        <div class="col1">
                            <div class="username_round1 username" id = "player2">------</div>
                        </div>
                    </div>
                </div>

                <div class="round-div div2">

                    <div class="player_round2 player1">
                        <div class="col1">
                            <div class="username_round2 username" id = "player11">------</div>
                        </div>
                    </div>
                </div>

                <div class="round-div div3">
                    <div class="trophy"></div>
                    <div class="champion_str">${i18next.t('pongGame.champion')}</div>
                    <div class="champion-name">
                        🏆&nbsp;<span class="username_round3"> ------ </span>&nbsp;🏆
                    </div>
                    <!-- <button class="home-button">${i18next.t('pongGame.home')}</button> -->
                 </div>

                <div class="round-div div4">

                    <div class="player_round2 player1">
                        <div class="col1">
                            <div class="username_round2 username" id = "player1">------</div>
                        </div>
                    </div>
                </div>
                
                <div class="round-div div5">
                    <div class="player_round1 player1 rplayer">
                        <div class="col1">
                            <div class="username_round1 username"  id = "player3">------</div>
                        </div>
                    </div>

                    <div class="player_round1 player2 rplayer">
                        <div class="col1">
                            <div class="username_round1 username" id = "player4">------</div>
                        </div>
                    </div>

                </div>
                <div class="next-match">
                    <div class="next-title">${i18next.t('pongGame.nextMatch')}</div>
                    <div class="nexts-divs">
                        <div class="next-player1 next-player" id = "lplayer_name"> <div class="username">Ali</div> </div>
                        <div class="next-vs">${i18next.t('pongGame.vs')}</div>
                        <div class="next-player2 next-player usename" id = "rplayer_name"><div class="username">Ahmed</div></div>
                    </div>
                    <button class="next-button" id = "start">${i18next.t('pongGame.start')}</button>
                </div>

            </div>
        </section>
    </div> 
        `
    }



export async function tournament_board(tours)
{
    // await navigate("/game/tournament/board")
    navigateGame(tournamentPage())
    let  cptTour = 1;
    let toursObjs = {}
    let objectsCpt = 0;
    while (cptTour - 1 < Object.keys(tours).length)
    {
        let tourClassName = 'username_round' + cptTour;
        toursObjs = document.getElementsByClassName(tourClassName)
        if (toursObjs.length)
        {
            for (let i = 0; i < tours[cptTour - 1].length; i++)
            {
                
                if (toursObjs[objectsCpt]){
                    toursObjs[objectsCpt++].textContent = tours[cptTour - 1][i][0];
                    if (tours[cptTour - 1][i].length == 2)
                        toursObjs[objectsCpt++].textContent = tours[cptTour - 1][i][1];
                }
            }
        }
        cptTour++;
        objectsCpt =  0;
    }
}

export function navigateGame(page)
{
    const spa = document.querySelector(".spa")
    if (spa)
        spa.innerHTML = page
}

// export default gameUtils;


export function notifyBot(message)
{
    if(userWebSocket.readyState == WebSocket.OPEN) {

        userWebSocket.send(JSON.stringify({
            'message': message,
            'sender_id': user.data.id,
            'reciever_id': user.data.id,
            'action': 'bot_message',
        }))
    }
}
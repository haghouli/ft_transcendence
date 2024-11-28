import { getCookie, httpGet, navigate } from "../utilities/utiles.js";
import { createElement } from '../utilities/genrateHtml.js'
import { createTopFiveElements } from '../utilities/genrateHtml.js'
import { DEFAULT_GAME_COOKIE } from "../utilities/constants.js";
import { infoAlert, worningAlert } from "../utilities/alerts.js";


const getTopFivePlayers = async () => {
    const selectedGame = getCookie(DEFAULT_GAME_COOKIE);
    const route = selectedGame == 'tictactoe' ? '/api/users/tictactoe/top_five/' : '/api/users/top_five/';
    const topFive = await httpGet(route);
    return topFive;
}

export default class HomeComponent {
    constructor() {
        this.cssPath = "./css/Home.css";
        this.firstname = 'aa';
        this.lastname = 'aa';
        this.users = [];
        this.selectedGame = getCookie(DEFAULT_GAME_COOKIE)
        this.currentPath = '/#/game';
        if(this.selectedGame == 'tictactoe') {
            this.currentPath = '/#/game/tictactoe';
        }
    }

    getCssPath = () => {
        return this.cssPath;
    }

    spaDiv = () => {
        document.querySelector('.header').style.display = 'flex';
        document.querySelector('.right').style.display = 'flex';
        document.querySelector('.left').style.display = 'flex';

        const spaDiv = document.querySelector('.spa');
        spaDiv.style.display = 'flex';
        spaDiv.style.flexDirection = 'row';
    }

    imageSlide() {
        let currentIndex = 0;
        const slides = document.querySelectorAll('.slide');
      
        function showNextSlide() {
          slides[currentIndex].classList.remove('active');
        
          currentIndex = (currentIndex + 1) % slides.length;
      
          slides[currentIndex].classList.add('active');
        }
      
        setInterval(showNextSlide, 3000); // Adjust interval as needed
    }

    
    fillTopPlayers = async () => {
        const topFive = await getTopFivePlayers();

        const topPlayserSection = document.getElementById('top-players-section');

        const myDiv = createElement('div', {class: "top-title"}, [`${i18next.t('home.topPlayers')}`]);
        topPlayserSection.appendChild(myDiv);

        topFive.map((item, idx) => {
            const player = createTopFiveElements(item, idx);
            topPlayserSection.appendChild(player);
        });
    }

    addPlayEventListners() {
        const cookie = getCookie(DEFAULT_GAME_COOKIE);
        document.getElementById('local-play-btn')
        .addEventListener('click', () => {
            if(cookie == 'tictactoe') {
                navigate('/game/tictactoe/local');
            } else {
                navigate('/game/localgame');
            }
        });

        document.getElementById('ai-play-btn')
        .addEventListener('click', () => {
            // navigate('/game/tictactoe/vs_ai');
            if(cookie == 'tictactoe') {
                navigate('/game/tictactoe/local');
            } else {
                // navigate('/game');

                worningAlert(i18next.t('alerts.invalidSelectedGame'));
            }
        });

        document.getElementById('tournnament-play-btn')
        .addEventListener('click', () => {
            if(cookie == 'tictactoe') {
                worningAlert(i18next.t('alerts.invalidSelectedGame'));
            } else {
                navigate('/game/tournament/join');
            }
        });
    }

    async init(){
        this.fillTopPlayers();
        this.spaDiv();
        this.imageSlide();
        this.addPlayEventListners();
    }

    closeup() {
        
    }
    
    async render() {
        return `
            <div class="home">
                
                    <div class="main-image">
                    <!--<div class="play-image">
                        <h1>${i18next.t('home.welcome1')}</h1>
                        <p>${i18next.t('home.welcome2')}<br>
                        ${i18next.t('home.welcome3')}</p>
                        <a href="#/game/tictactoe" class="play-now">${i18next.t('home.playNow')}</a>
                    </div>-->

                    <div class="play-image"> 
                        <div class="slide active">
                            <img src="./images/b.webp" alt="First Image">
                        </div>
                        <div class="slide">
                            <img src="./images/b1.jpg" alt="Second Image">
                        </div>
                        <div class="slide">
                            <img src="images/b2.jpg" alt="Third Image">
                        </div>
                            <div class="h_content">
                            <h1>${i18next.t('home.welcome1')}</h1>
                            <p>${i18next.t('home.welcome2')}<br>
                            ${i18next.t('home.welcome3')}</p>
                            <a href="${this.currentPath}" class="play-now">${i18next.t('home.playNow')}</a>
                        </div>
                    </div>

                    <div class="top-players-box" id="top-players-section">
                        
                    </div>
                </div>
                <!-- <h1 >game Mode</h1> -->
                <div class="side-images">
                    <div class="modes">
                        <h1>${i18next.t('home.gameModes')}</h1>
                    </div>
                    <div class="image-collection">
                        <div class="side-images-img" id="tour">
                             <img src="./images/l.jpg" alt="Background Image">
                            <div class="content">
                                <h1>${i18next.t('home.local')}</h1>
                                <p>${i18next.t('home.areYouReady')}</p>
                                <button class="h_button" id="local-play-btn">${i18next.t('home.startPlay')}</button>
                            </div>
                        </div>
                        <div class="side-images-img" id="tour">
                            <img src="./images/a.webp" alt="Background Image">
                            <div class="content">
                                <h1>${i18next.t('home.Ai')}</h1>
                                <p>${i18next.t('home.areYouReady')}</p>
                                <button class="h_button" id="ai-play-btn">${i18next.t('home.startPlay')}</button>
                            </div>
                        </div>
                        <div class="side-images-img" id="game">
                             <img src="./images/t.jpg" alt="Background Image">
                            <div class="content">
                                <h1>${i18next.t('home.tournement')}</h1>
                                <p>${i18next.t('home.areYouReady')}</p>
                                <button class="h_button" id="tournnament-play-btn">${i18next.t('home.startPlay')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
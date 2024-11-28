import { createElement } from "./genrateHtml.js";

const createDive = (iconeName, message, color) => {

    const myDive = document.createElement('div');
    myDive.className = 'custom-alert';

    const myDive2 = document.createElement('div');
    myDive2.className = 'alert-top';

    const myDive3 = document.createElement('div');
    myDive3.className = 'alert-bottom';
    
    const myDive4 =  document.createElement('div');
    myDive4.className = "alert-bottom-color";
    myDive4.style.backgroundColor = color;
    myDive3.appendChild(myDive4);

    const myIcone = document.createElement('i');
    myIcone.className = `fa-solid ${iconeName}`;
    const myPara = document.createElement('span');
    myPara.textContent = message;

    myDive2.appendChild(myIcone);
    myDive2.appendChild(myPara);

    myDive.appendChild(myDive2);
    myDive.appendChild(myDive3);

    return myDive;
}

export const infoAlert = (message) => {

    const alerts = document.getElementById('alerts');
    const myDive = createDive('fa-circle-check', message, 'green');
    alerts.appendChild(myDive)
    setTimeout(() => {
       myDive.remove();
    }, 3000);
}

export const worningAlert = (message) => {

    const alerts = document.getElementById('alerts');
    const myDive = createDive('fa-circle-exclamation', message, 'orange');
    alerts.appendChild(myDive);
    setTimeout(() => {
       myDive.remove();
    }, 3000);
}

export const errorAlert = (message) => {

    const alerts = document.getElementById('alerts');
    const myDive = createDive('fa-circle-xmark', message, 'red');
    alerts.appendChild(myDive);
    setTimeout(() => {
       myDive.remove();
    }, 3000);
}

export const botAlert = (message) => {

    const image = createElement('img', {src: './assets/robot.png'}, []);
    const div5 = createElement('div', {class: 'bot-image-section'}, [image])

    const h6 = createElement('h6', {}, ['Bot']);
    const div7 = createElement('div', {class: 'bot-name-section'}, [h6]);

    const div4 = createElement('div', {class: 'bot-info'}, [div5, div7]);
    const p = createElement('p', {}, [`${message}`]);
    const div6 = createElement('div', {class: 'bot-messsage'}, [p]);


    const div2 = createElement('div', {class: 'bot-alert-top'}, [div4, div6]);
    const div3 = createElement('div', {class: 'bot-alert-bot'}, []);

    const div1 = createElement('div', {class: 'bot-alert'}, [div2, div3])

    const alerts = document.getElementById('alerts');

    alerts.appendChild(div1);

    setTimeout(() => {
        div1.remove();
    }, 3000);
}
export const BACKEND_BASED_URL = 'http://127.0.0.1:8000'
export const COOKIE_NAME = 'my_token'
import MessagesComponent from "../components/MessagesComponent.js";
import updateCss from "../utilities/updateCss.js";

export const getChatRoomSocket = (room_id) => {

  const chatSocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${room_id}/?id=${user.data.id}`);
  
  chatSocket.onopen = function(e) {
    console.log('socket opened');
  };
  chatSocket.onclose = function(e) {
    console.log('Chat socket closed unexpectedly');
  };

  chatSocket.onmessage = async  (e) => {
    const data = JSON.parse(e.data);
    const messages = data.messages;

    const renderPromises = messages.map(async (item) => {
      const component = new MessagesComponent(item);
      await updateCss(component.getCssPath());
      const renderedContent = await component.render();
      return { renderedContent, component };
    });
  
    const renderedResults = await Promise.all(renderPromises);
  
    const content2 = renderedResults.map((result) => result.renderedContent).join("");
    const components2 = renderedResults.map((result) => result.component);
  
    document.getElementById("scroll2").innerHTML = content2;
  
    components2.forEach((component) => component.init());

  };

  return chatSocket;
}

export function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}





/*************************************
 ************* http methods **********
 *************************************/

export const httpGet = async (url) => {

  const token = getCookie(COOKIE_NAME);
  if (token !== "") {
    const response = await fetch(`${BACKEND_BASED_URL}${url}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (response.status === 200) {
      return data;
    }
    return null;
  }
}

export const httpPost = async (url, bodyData) => {

  const token = getCookie(COOKIE_NAME);
  if (token !== "") {
    const response = await fetch(`${BACKEND_BASED_URL}${url}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(bodyData),
      }
    );
    const data = await response.json();
    if (response.status === 200) {
      return data;
    }
    return null;
  }
}


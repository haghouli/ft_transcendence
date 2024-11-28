import { errorAlert, worningAlert, infoAlert } from './alerts.js'
import { BACKEND_BASED_URL, COOKIE_NAME, REFRESH_TOKEN, DEFAULT_BOARD_COLOR_COOKIE } from './constants.js'
import TwofaPage from "../components/TwofaPage.js";

const blackListRefreshToken = async () => {
  try {
    const refreshToken = getCookie(REFRESH_TOKEN);

    if(refreshToken) {
      await fetch(`${BACKEND_BASED_URL}/api/token/blacklist/`, {
        method: 'POST', 
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          'refresh': refreshToken,
        })
      })
    }
  } catch {
  }
}

export const navigate = (path) => {
  window.history.pushState({}, "", `#${path}`)
  window.dispatchEvent(new Event('hashchange'));
}

export const logout = () => {
  user.islogged = false;
  user.data = null;


  if(userWebSocket && userWebSocket.readyState === userWebSocket.OPEN) {
    userWebSocket.close(1000, 'Closing the connection');
  }

  blackListRefreshToken();

  document.cookie = COOKIE_NAME + '=; Max-Age=0; path=/';
  document.cookie = REFRESH_TOKEN + '=; Max-Age=0; path=/';

  isFirstLogin = true;
  window.history.pushState({}, "", "#/login");
  window.dispatchEvent(new Event('hashchange')); 
}

export async function refreshAccessToken() {
  try {
    const refreshToken = getCookie(REFRESH_TOKEN);
  
    if(!refreshToken) {
      logout();
      return false;
    }
    
    const response = await fetch(`${BACKEND_BASED_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'refresh': refreshToken
        })
    });
    
    if (response.ok) {
      const data = await response.json();
      setCookie(COOKIE_NAME, data.access, 60);
      return true;
    } else {
      logout();
      return false;
    }
  } catch {
    logout();
    return false;
  }
}

export const formatTime = (date) => {

  const time = new Date(date);
  const time_now = new Date();

  const diffInMs = time_now - time;
  const diffInHours = diffInMs / (1000 * 60 * 60);


  if (diffInHours < 24) {
      return `Today, ${time.toLocaleTimeString([], { date, hour: '2-digit', minute: '2-digit' })}`
  } else {
      return time.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
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
  return null;
}

export function setCookie(cname, cvalue, exdays, sameSite = 'Lax') {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires=" + d.toUTCString();
  let cookieString = `${cname}=${cvalue}; ${expires}; path=/; SameSite=${sameSite}`;

  if (sameSite === 'None') {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;
}

export const httpGet = async (url) => {
  try {
    const token = await getCookie(COOKIE_NAME);
    if (token !== "") {
      const requestData = {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      }
      const response = await fetch(`${BACKEND_BASED_URL}${url}`, requestData);
      const data = await response.json();
      if (response.status === 200) {
        return data;
      }
      if(response.status === 401)
      {
        await refreshAccessToken();
        return await httpGet(url); 
      }
      return null;
    }
  } catch (error){
    logout();
    return null;
  }
}
  
export const httpPost = async (url, bodyData) => {
  try {
    const token = await getCookie(COOKIE_NAME);
    if (token !== "") {
      const response = await fetch(`${BACKEND_BASED_URL}${url}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify(bodyData),
      });
      const data = await response.json();
      if (response.status === 200) {
        return data;
      }
      if(response.status === 401)
      {
        await refreshAccessToken();
        return await httpPost(url, bodyData);
      }
      return null;
    } else {
      navigate('/login');
      return null;
    }
  } catch {
    logout();
  }
}

export const parseJwt = (token) => {
  try {
    if(!token)
      return null;
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const getQueryParams = (param) => {
  if(queryString == null)
    return null;
  const params = queryString.split('&');

  if (params.length === 0 || (params.length === 1 && params[0] === ''))
      return null;

  const paramsObject = {};

  params.forEach(param => {
      const [key, value] = param.split('=');
      paramsObject[decodeURIComponent(key)] = decodeURIComponent(value);
  });

  if(param in paramsObject)
      return paramsObject[param];
  return null;
}

export const  renderTwofa  = async () => {
  const mainPageContainer = document.querySelector('#mainPage');
  const mainComponent = new TwofaPage();
  mainPageContainer.innerHTML = await mainComponent.render();
  mainComponent.init();
}


export const setTheBoardColor = () => {
  const cookieValue = getCookie(DEFAULT_BOARD_COLOR_COOKIE);
  let color = '#03346E'

  if(cookieValue == 'b') {
      color = 'black';
  } else if(cookieValue == 'g') {
      color = 'rgb(36, 94, 36)';
  }

  const cells = Array.from(document.getElementsByClassName('cell'));
  cells.forEach(item => {
      item.style.backgroundColor = color;  // Change 'blue' to any color you want
  });
}
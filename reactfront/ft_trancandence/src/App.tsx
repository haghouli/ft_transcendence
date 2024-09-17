import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useState, useEffect, useRef } from 'react';
import { useCookies } from 'react-cookie'
import axios from 'axios';
import { BACKEND_BASE_URL, COOKIE_NAME } from './utiles/constents'
import { userContext } from './utiles/Contexts/UserContext'
import { UserState  } from './utiles/constents'
import Otp from './pages/Otp';
import { jwtDecode } from "jwt-decode";
import { socketContext } from './utiles/Contexts/socketContext';

interface jwtContent {
  first_name: string,
  last_name: string,
  username: string,
  is_2af_active: boolean,
}

function App() {

  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NAME]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserState>()
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [is2Frequired, setIs2Frequired] = useState(false);

  const websocket = useRef<WebSocket | null>(null);

  const startWebSocket = () => {
    websocket.current = new WebSocket('ws://127.0.0.1:8000/ws/online/');

    websocket.current.onclose = () => {
      console.log('main socket closed')
    }
    websocket.current.onopen = () => {
      console.log('main socket opened');
    }

    // websocket.current.onmessage = (e) => {
    //   const data = JSON.parse(e.data);
    //   if(data.action == 'new_message'){
    //     alert('you have a new messsage');
    //   }
    // }
  }


  useEffect(()=> {

    const token: string = cookies[COOKIE_NAME];
    if(!token) {
      setIsLoading(false);
      return;
    }
    const decoded : jwtContent = jwtDecode(token);
    if(decoded.is_2af_active)
      setIs2Frequired(true)
    axios.get(`${BACKEND_BASE_URL}/api/token/verify/`, {
      headers : {
        'Authorization' : `Bearer ${token}`
      },
    }).then(res => {
      setUser(res.data)
      setIsLoggedIn(true);
      setIsLoading(false);
      startWebSocket()
    }).catch(err => {
      setIsLoading(false)
    })
  }, [])


  if(isLoading) {
    return <div className='flex items-center justify-center w-full h-full text-white text-[20px]'>
      laoding...
    </div>
  }

  return (
    <div className="w-full h-full bg-bg_color">
      <userContext.Provider value={{ user, setUser, isLoggedIn, setIsLoggedIn }}>
        { !isLoggedIn ?
          <Login/>
          : <>
            { is2Frequired ? <Otp/> : 
              <socketContext.Provider value={websocket.current}>
              <Dashboard/>
              </socketContext.Provider>
            }
          </>
        }
      </userContext.Provider>
    </div>
  );
}

export default App;

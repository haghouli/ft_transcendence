import HomeIcon from '@mui/icons-material/Home';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ChatIcon from '@mui/icons-material/Chat';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link } from 'react-router-dom'
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import  { COOKIE_NAME } from '../utiles/constents' 
import { useCookies } from 'react-cookie'
import { useContext } from 'react';
import { userContext } from '../utiles/Contexts/UserContext';

const Sidebar = () => {

  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_NAME]);

  const {setIsLoggedIn} = useContext(userContext);

  const navigate = useNavigate()

  const logout = () => {
    removeCookie(COOKIE_NAME)
    navigate('/login')
    setIsLoggedIn(false);
  }

  return (
    <div className='py-[50px]'>
      <div className="flex justify-center items-center w-[50px] h-[400px] bg-color2 rounded-[50px] mb-[60px]">
        <ul>
          <li>
            <Link to="/">
              <HomeIcon className='text-white scale-[1.6] my-[20px] cursor-pointer'/>
            </Link>
          </li>
          <li>
            <Link to="/profile">
              <AccountBoxIcon className='text-white scale-[1.6] my-[20px] cursor-pointer'/>
            </Link>
          </li>
          <li>
            <Link to="/messages">
              <ChatIcon className='text-white scale-[1.6] my-[20px] cursor-pointer'/>
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex justify-center items-center w-[50px] bg-color2 rounded-[50px] mt-[100px]">
        <ul>
          <li>
            <Brightness4Icon className='text-white scale-[1.6] my-[15px] cursor-pointer'/>
          </li>
          <li>
            <Brightness7Icon className='text-white scale-[1.6] my-[15px] cursor-pointer'/>
          </li>
        </ul>
      </div>
      <div className="flex justify-center items-center w-[50px] bg-color2 rounded-[50px] mt-[100px]">
        <ul>
          <li>
            <LogoutIcon
              className='text-white scale-[1.6] my-[15px] cursor-pointer'
              onClick={logout}
            />
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
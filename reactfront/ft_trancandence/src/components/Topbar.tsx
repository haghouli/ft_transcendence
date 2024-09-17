import React, { useContext, useEffect, useState } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { UserContextType, userContext } from '../utiles/Contexts/UserContext';
import { BACKEND_BASE_URL, COOKIE_NAME, Users } from '../utiles/constents'
import { socketContext } from '../utiles/Contexts/socketContext';
import { UserState } from '../utiles/constents';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';


const Topbar: React.FC = () => {

    const [cookies, setCookies, removeCookies] = useCookies()

    const navigate = useNavigate();

    const [toggle, setToggle] = useState<boolean>(false);

    const { user } : UserContextType  =  useContext(userContext)

    const [Focus, setFocus] = useState<boolean>(false);

    // const { websocket }  = useContext(socketContext);

    const [notifications, setNotifications] = useState<string []>([]);

    const [users, setUsers] = useState<UserState []> ([])
    const [filteredUsers, setFilteredUsers] = useState<UserState []> ([])


    const filterUsers = (searchValue: string) => {
        const filtered : UserState [] = users.filter(e => e.username.includes(searchValue))
        setFilteredUsers(filtered);
    }

    useEffect(() => {
        const token : string = cookies[COOKIE_NAME];
        axios.get(`${BACKEND_BASE_URL}/api/users/`, {
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        }).then(res => {
            setUsers(res.data);
            setFilteredUsers(res.data);
        }).catch(err => {
            console.log(err);
        })
    }, [])


  return (
    <div className='flex w-full h-[80px]'>
        <div className="flex items-center w-3/4 sm:w-1/2 h-full">
            <div className='flex justify-center items-center w-1/4 h-full text-white text-[25px]'>
                LOGO
            </div>
            <div className='flex items-center w-3/4 h-full px-[20px]'>
                <div className='flex w-full border-[1px] h-[40px] rounded-[20px] border-white overflow-hidden bg-color2'
                    onFocus={ ()=> setFocus(true)}
                    onBlur={() => setFocus(false)}
                >
                    <div className='flex w-[20%] justify-center items-center lg:w-[10%]'>
                        <SearchOutlinedIcon
                            className='cursor-pointer text-white'
                        />
                    </div>
                    
                    <div className={`w-[300px] bg-gray-700 absolute top-[60px] max-h-[200px] rounded-[10px] overflow-scroll hidden-scrollbar ${Focus ? '' : 'hidden'}`}>
                        {
                            filteredUsers.map((item , idx) => {
                                return(
                                    <div
                                        key={idx}
                                        className='flex items-center h-[50px] m-[4px] bg-black rounded-[10px] cursor-pointer'
                                        onClick={() => navigate(`/profile/?id=${item.id}`)}
                                    >
                                        <div className='h-[40px] w-[40px]  rounded-[50%] overflow-hidden ml-[10px]'>
                                            <img src={`${BACKEND_BASE_URL}${item.avatar}`} alt="" className='w-full h-full object-cover'/>
                                        </div>
                                        <div className='text-white pl-[10px]'>
                                            {item.username}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <input
                        type="text"
                        className='h-full w-[80%] lg:w-[90%] focus:outline-none text-white bg-transparent'
                        onChange={ (e) => filterUsers(e.target.value) }
                    />
                </div>
            </div>
        </div>
        <div className="flex justify-end items-center w-1/2 h-full">
            <SettingsIcon
                className='text-white cursor-pointer scale-[1.4] mr-5'
            />
            <NotificationsIcon
                className='text-white cursor-pointer scale-[1.4] mr-5'
                onClick={ ()=>setToggle(!toggle) }
            />
            <div
                className={`${!toggle ? 'hidden' : '' } absolute w-[200px] min-h-[100px] max-h-[200px] bg-gray-700 top-[55px] rounded-[10px] z-10 overflow-scroll hidden-scrollbar p-[10px]`}
            >
                {/* <div className='flex justify-center items-center w-full text-white bg-red-600'>
                    No notifications
                </div> */}
                <div className='flex justify-center items-center w-full h-[40px] text-white bg-red-600 mb-[2px] rounded-[5px] cursor pointer'>
                    1
                </div>
            </div>
            <div className='w-[40px] h-[40px] cursor-pointer mr-5'>
                <img
                    src={`${BACKEND_BASE_URL}${user?.avatar}`}
                    className='w-full h-full rounded-[50%] object-cover'
                />
            </div>
        </div>
    </div>
  )
}

export default Topbar
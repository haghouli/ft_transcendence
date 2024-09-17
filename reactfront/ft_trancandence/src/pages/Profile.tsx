import React, { useEffect, useState } from 'react'
import { BACKEND_BASE_URL, UserState, COOKIE_NAME } from '../utiles/constents'
import { useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import { userContext } from '../utiles/Contexts/UserContext'
import axios from 'axios'
import { useCookies } from 'react-cookie'

const Profile = () => {

  const { user } = useContext(userContext)

  const [cookies, setCookie, removeCookie] = useCookies();

  const [userProfile, setUserProfile] = useState<UserState>();

  const [searchParames] = useSearchParams();

  useEffect(() => {

    const id = searchParames.get('id');
    if(id == null || parseInt(id) == null) {
      setUserProfile(user)
      return;
    }

    const token : string = cookies[COOKIE_NAME];
    axios.get(`${BACKEND_BASE_URL}/api/users/user/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(res => {
      setUserProfile(res.data)
    }).catch(err => {
      console.log(err);
    })
  })

  if(!userProfile) {
    return(
      <div className='flex items-center justify-center w-full h-[700px]'>
        <p className='text-[25px] text-white'>User Not Found</p>
      </div>
    )
  }

  return (
    <div className='w-full p-[20px]'>
        <div className='min-h-[400px] rounded-[20px] bg-blue-400 m-[10px] bg-color2 flex-col overflow-hidden '>
            <div className="flex flex-col md:flex-row w-full h-1/2 text-white">
              <div className="h-[200px] md:w-1/4 m-[10px] flex flex-col md:flex-row justify-center items-center ">
                <div className='w-[150px] h-[150px] rounded-[50%] overflow-hidden border-[2px] border-white'>
                  <img src={`${BACKEND_BASE_URL}${userProfile?.avatar}`} alt="avatar" className='e-full h-full object-cover'/>
                </div>
              </div>
            </div>
        </div>
        <div className='h-[200px] rounded-[20px] bg-blue-400 m-[10px] bg-color2'>
          
        </div>
        <div className='h-[300px] rounded-[20px] bg-blue-400 m-[10px] bg-color2'>
          
        </div>
    </div>
  )
}

export default Profile
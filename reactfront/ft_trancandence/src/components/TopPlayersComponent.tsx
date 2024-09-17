import React from 'react'
import user_pic from '../assets/user.jpg'
import { User } from '../utiles/constents'

interface TopPlayersComponentProps {
    idx: number;
    item: User,
}

const TopPlayersComponent : React.FC<TopPlayersComponentProps> = ({item, idx}) => {
  return (
    <div className='flex items-center h-[50px] mb-[8px]'>
        <div className='flex w-[30px] h-full justify-center items-center'>
            {idx + 1}
        </div>
        <div className='w-[40px] h-[40px] bg-red-400 overflow-hidden rounded-[50%]'>
            <img src={user_pic} alt="user_pic" className='w-full h-full'/>
        </div>
        <div className='flex flex-col pl-[15px]'>
            <div className="h-1/2">{item.username}</div>
            <div className="h-1/2 text-[10px]">{item.follows} game</div>
        </div>
    </div>
  )
}

export default TopPlayersComponent
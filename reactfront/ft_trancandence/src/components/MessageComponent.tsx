import React, { useContext } from 'react'
import { Message } from '../utiles/constents'
import { BACKEND_BASE_URL } from '../utiles/constents'
import { userContext } from '../utiles/Contexts/UserContext';

interface MessageComponentProps {
    message: Message,
}

const MessageComponent: React.FC<MessageComponentProps> = ({message}) => {

    const { user } = useContext(userContext);

  return (
    message.message_user.id == user?.id ?
    <div
        // key={idx}
        className="flex justify-end items-center w-full px-[20px] py-[10px]">
        <span
            className="bg-blue-400 flex items-center justify-center px-[20px] py-[5px]  rounded-[20px] text-[18px]">
            { message.message_content }
        </span>
        <div className="min-w-[40px] max-w-[40px] h-[40px] overflow-hidden rounded-[50%] ml-[10px]">
            <img src={`${BACKEND_BASE_URL}${message.message_user.avatar}`} alt="" className="w-full h-full"/>
        </div>
    </div> :
    <div
        // key={idx}
        className="flex items-center w-full px-[20px] py-[10px]">
        <div className="min-w-[40px] max-w-[40px] h-[40px] overflow-hidden rounded-[50%] mr-[10px]">
            <img src={`${BACKEND_BASE_URL}${message.message_user.avatar}`} alt="" className="w-full h-full"/>
        </div>
        <span
            className="bg-white flex items-center justify-center px-[20px] py-[5px] rounded-[20px] text-[18px]">
            { message.message_content }
        </span>
    </div>
  )
}

export default MessageComponent
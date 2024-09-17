import React, { useContext, useEffect, useState, useRef } from "react"
import { UserState } from "../utiles/constents"
import axios from "axios"
import { BACKEND_BASE_URL, COOKIE_NAME, Message, MessagesComponentProps } from "../utiles/constents"
import { useCookies } from "react-cookie"
import { userContext } from "../utiles/Contexts/UserContext"
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate } from "react-router-dom"
import MessageComponent from "./MessageComponent"
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const MessagesComponent : React.FC<MessagesComponentProps> = ({ chatRoom }) => {

    const [cookies, setCookie, removeCookie] = useCookies();
    
    const [messages, setMessages] = useState<Message []>([])
    const [message, setMessage] = useState<string>('');
    const [isClicked, setIsClicked] = useState<boolean>(false);
    const [chatStatus, setChatStatus] = useState<boolean>(chatRoom.chat_status);

    const navigate = useNavigate();

    const webSocket = useRef<WebSocket | null>(null)

    const { user } = useContext(userContext)
    
    
    const StartWebsocket = () => {
        if(webSocket.current === null)
            return;
        if(webSocket.current.OPEN) {
            webSocket.current.onopen = () => {
                console.log('socket opend');
            };
            
            webSocket.current.onclose = () => {
                console.log('socket closed');
            };

            webSocket.current.onmessage = (e) => {
                const data = JSON.parse(e.data)
                if(data.action == "chatting")
                    setMessages(data.messages);
                else if(data.action == "block")
                    setChatStatus(false);
                else if(data.action == "deblock")
                    setChatStatus(true);
            };
        }
    }

    const sendMessage = () => {
        if(message === '')
            return;
        if(webSocket.current === null)
            return;
        if(webSocket.current.OPEN) {
            webSocket.current.send(JSON.stringify({
                'message': message,
                'sender_id': user?.id,
                'action': 'chatting',
            }));
        } else {
            console.log('socket is closed');
        }
    }


    const blockUser = () => {
        const token : string = cookies[COOKIE_NAME];

        axios.put(`${BACKEND_BASE_URL}/api/users/user/chat_block/`, {
            chat_room_id: chatRoom.id,
        }, {
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        }).then(res => {
            console.log('user banner successfully');
            setChatStatus(false);
            if(webSocket) {
                console.log('socket action');
                webSocket.current?.send(JSON.stringify({
                    'action' : 'block',
                    'message': 'block user',
                    'sender_id': user?.id,
                }))
            } else {
                console.log('socket not opened')
            }
        }).catch(err => {
            console.log(err.data);
        })
    }

    const deblockUser = () => {
        const token : string = cookies[COOKIE_NAME];

        axios.put(`${BACKEND_BASE_URL}/api/users/user/chat_deblock/`, {
            chat_room_id: chatRoom.id,
        }, {
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        }).then(res => {
            console.log('user banner successfully')
            setChatStatus(true);
            if(webSocket) {
                console.log('socket action');
                webSocket.current?.send(JSON.stringify({
                    'action' : 'deblock',
                    'message': 'deblock user',
                    'sender_id': user?.id,
                }))
            } else {
                console.log('socket not opened')
            }
        }).catch(err => {
            console.log(err.data);
        })
    } 

    
    useEffect(() => {
        
        const token : string = cookies[COOKIE_NAME]
        axios.get(`${BACKEND_BASE_URL}/api/chat_rooms/room/messages/${chatRoom.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            setMessages(res.data)
        }).catch(err => {
            console.log(err);
        })
        
        if(chatStatus) {
            webSocket.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${chatRoom.id}/`);
            StartWebsocket()
        }
    }, [chatRoom])


  return (
    <div className={`w-full h-full ${(!chatStatus && chatRoom.banner_id != user?.id) ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center w-full h-[10%] py-[10px] px-[30px] bg-gray-800">
            <div className="w-[90%] flex items-center">
                <div className="h-full">
                    <ArrowBackIosIcon
                        className="text-white scale-[1.5] cursor-pointer"
                    />
                </div>
                <div className='bg-gray-200 max-w-[55px] min-w-[55px]  h-[55px] rounded-[50%] overflow-hidden'>
                    <img src={`${BACKEND_BASE_URL}${chatRoom.user.avatar}`} alt="" className="w-full h-full object-cover"/>
                </div>
                <div className="text-[20px] text-white pl-[10px]">
                    {user?.username}
                </div>
            </div>
            <div className="flex items-center justify-end w-[10%] h-full">
                <MoreVertIcon
                    className="text-white scale-[1.5] cursor-pointer"
                    onClick={()=>setIsClicked( !isClicked )}
                />
                <div className={`${!isClicked ? "hidden" : ''} w-[140px] h-[80px] absolute bg-gray-700 top-[210px] rounded-[5px] overflow-hidden p-[5px]`}>
                    <ul className="w-full h-full ">
                        <li
                            className="flex items-center h-1/2 text-white cursor-pointer"
                            onClick={() => navigate(`/profile/?id=${chatRoom.user.id}`)}
                        >
                            <AccountCircleIcon/>
                            <p className="pl-[5px]">See profile</p>
                        </li>
                        { chatStatus ? 
                        <li 
                            className="flex items-center h-1/2 text-white cursor-pointer"
                            onClick={blockUser}
                        >
                            <BlockIcon />
                            <p className="pl-[5px]">Block user</p>
                        </li> : <li
                            className="flex items-center h-1/2 text-white cursor-pointer"
                            onClick={deblockUser}
                        >
                            <BlockIcon />
                            <p className="pl-[5px]">Deblock user</p>
                        </li>
                        }
                    </ul>
                </div>
            </div>
            
        </div>
        <div className="hide w-full h-[80%] overflow-scroll hidden-scrollbar">
            {
                messages.map((item, idx) => {
                    return (
                        <MessageComponent message={item} />
                    )
                })
            }
        </div>
        <div className="flex items-center justify-center w-full h-[10%]  p-[10px] bg-gray-800">
            <textarea
                className="h-full w-[90%] outline-none p-[10px] rounded-[10px] hidden-scrollbar"
                onChange={(e) => setMessage(e.target.value)}
                disabled={!chatStatus}
            >
            </textarea>
            <div className="flex items-center justify-center h-full w-[10%] cursor-pointer">
                <SendIcon onClick={sendMessage} className="text-white scale-[1.5]"/>
            </div>
        </div>
    </div>
  )
}

export default MessagesComponent
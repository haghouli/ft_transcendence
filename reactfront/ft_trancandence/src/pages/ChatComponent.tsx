import { useState, useEffect, useContext } from "react"
import { userContext } from "../utiles/Contexts/UserContext"
import { UserState, chatRoom } from "../utiles/constents"
import axios from "axios"
import { useCookies } from "react-cookie"
import { COOKIE_NAME, BACKEND_BASE_URL } from "../utiles/constents"
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import MessagesComponent from "../components/MessagesComponent"

const ChatComponent = () => {

    const [cookies, setCookie, removeCookie] = useCookies()

    const { user } = useContext(userContext)

    const [chatRooms, setChatRooms] = useState<chatRoom []>([])
    const [selectedChatRoom, setSelectedChatRoom] = useState<chatRoom>();
    const [filtredChatRooms, setFiltredChatRooms] = useState<chatRoom []>([]);
    const [searchWord, setSearchWord] = useState<string>('');

    const filterChatRooms = () => {
        const filteredChatRooms: chatRoom[] = chatRooms.filter(item => item.user.username.includes(searchWord));
        setFiltredChatRooms(filteredChatRooms);
    }


    useEffect( ()=> {
        const token : string = cookies[COOKIE_NAME]
        if(token == '') {
            alert('cookie token not exist');
            return;
        }

        axios.get(`${BACKEND_BASE_URL}/api/users/user/chat_rooms/${user?.id}`, {
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        })
        .then(res => {
            setChatRooms(res.data)
            setFiltredChatRooms(res.data)
        }).catch(err => {
            console.log(err)
        })
    }, [])


  return (
    <div className='flex justify-center items-center w-full p-[20px] md:px-[10%]'>
        <div className={`${selectedChatRoom != undefined ? 'hidden' : ''} w-full md:block md:w-2/5 h-[700px] bg-color2 rounded-[20px] m-[20px] overflow-hidden`}>
            <div className="flex justify-center items-center w-full h-[10%]">
                <div className="flex h-[40px] rounded-[10px] w-[90%] overflow-hidden">
                    <input
                        type="text"
                        className="w-[80%] outline-none p-[20px] bg-gray-700 text-white"
                        onChange={(e) => setSearchWord( e.target.value )}
                    />
                    <div className="flex w-[20%] h-full bg-gray-700 flex justify-center items-center">
                        <SearchOutlinedIcon
                            className="text-white cursor-pointer"
                            onClick={filterChatRooms}
                        />
                    </div>
                </div>
            </div>
            <div className="w-full h-[90%] p-[20px] overflow-scroll hidden-scrollbar">
                
                {
                    filtredChatRooms.map(item => {
                        return (
                            <div
                                className={`flex w-full h-[60px] p-[5px] cursor-pointer hover:bg-black ${selectedChatRoom?.id == item.id ? "bg-black" :  ''}`}
                                onClick={()=> setSelectedChatRoom(item)}
                                key={item.id}
                            >
                                <div className="bg-green-500 max-w-[50px] min-w-[50px]  h-50px rounded-[50%] overflow-hidden">
                                    <img src={`${BACKEND_BASE_URL}${item.user.avatar}`} alt="profile-image" className="w-full h-full object-fit" />
                                </div>
                                <div className="flex flex-col justify-center h-50px px-[10px] text-white">
                                    <p className="text-[23px]">{item.user.username}</p>
                                    <p className="text-[10px]">loged in last 2h</p>
                                </div>
                            </div>
                        )
                    })
                }
                
            </div>
        </div>
        <div className={` ${selectedChatRoom == undefined ? 'hidden' : '' } w-full md:flex md:w-3/5 h-[700px] bg-color2 rounded-[20px] overflow-hidden`}>
            { 
                selectedChatRoom ? <MessagesComponent chatRoom={selectedChatRoom} /> : <></>
            }
        </div>
    </div>
  )
}

export default ChatComponent
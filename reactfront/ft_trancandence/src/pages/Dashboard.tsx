import Topbar from "../components/Topbar"
import Sidebar from "../components/Sidebar"
import Home from "./Home"
import ChatComponent from "./ChatComponent"
import Profile from "./Profile"
import Login from "./Login"
import NotFound from "./NotFound"
import { BrowserRouter as Rounter, Routes, Route } from 'react-router-dom'
import { useContext } from "react"
import { userContext } from "../utiles/Contexts/UserContext"
import GameComponent from "./GameComponent"

const Dashboard = () => {

  const { isLoggedIn } = useContext(userContext)

  return (
    <div className="container mx-auto h-full px-[15px]">
      {!isLoggedIn ?
        <Routes>
            <Route path="/login" element={<Login/>}/>
        </Routes>
      :
      <>
        <Topbar/>
        <div className="flex w-full">
            <Sidebar/>
            <Routes>
              <Route path="/game" element={<GameComponent/>}/>
              <Route path="/" element={<Home/>} />
              <Route path="/profile" element={<Profile/>}/>
              <Route path="/messages" element={<ChatComponent/>}/>
              <Route path="*" element={<NotFound/>}/>
            </Routes>
        </div>
      </>
      }
    </div>
  )
}

export default Dashboard
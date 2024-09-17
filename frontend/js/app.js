import HomeComponent from "../components/Home.js";
import ChatComponent from "../components/Chat.js";
import Framework from "./framework.js";
import ProfileComponent from "../components/Profile.js";
import SettingsComponent from "../components/Setting.js";
import loginComponent from "../components/login.js";
import user from "../utilities/user.js";
import { BACKEND_BASED_URL, COOKIE_NAME, getCookie } from "../utilities/var.js";


const connectSocket = () => {
    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/online/?id=${user.data.id}`)

    socket.onclose = (event) => {
        console.log('socket connected');
    };

    socket.onclose = (event) => {
        console.log('socket disconnected');
    }
}

const checkToken = async () => {

    const token = getCookie(COOKIE_NAME);
    if(token !== "") {
        const response = await fetch(`${BACKEND_BASED_URL}/api/token/verify/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        const data = await response.json();
        if(response.status === 200) {
            user.islogged = true;
            user.data = data;
        }
    }
}

window.user = user;
window.chatSocket = null;
window.chatRoom = null;

await checkToken();
if(user.islogged)
    await connectSocket();

const app = new Framework();

app.route('/', HomeComponent);
app.route('/chat', ChatComponent);
app.route('/Profile', ProfileComponent);
app.route('/Settings', SettingsComponent);
app.route('/login', loginComponent);

app.start();


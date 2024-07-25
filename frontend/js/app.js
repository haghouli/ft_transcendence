import HomeComponent from "../components/Home.js";
import ChatComponent from "../components/Chat.js";
import Framework from "./framework.js";
import ProfileComponent from "../components/Profile.js";
import SettingsComponent from "../components/Setting.js";
import loginComponent from "../components/login.js";
import user from "../utilities/user.js";


const app = new Framework();
window.user = user;

app.route('/', HomeComponent);
app.route('/chat', ChatComponent);
app.route('/Profile', ProfileComponent);
app.route('/Settings', SettingsComponent);
app.route('/login', loginComponent);

app.start();


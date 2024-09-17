import axios from 'axios';
import { ToastContainer, toast } from 'react-custom-alert';
import { BACKEND_BASE_URL } from '../utiles/constents';
import { userContext } from '../utiles/Contexts/UserContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { COOKIE_NAME } from '../utiles/constents';


const Login = () => {

    const [cookies, setCookie, removeCookie] = useCookies()

    const {setUser, setIsLoggedIn} = useContext(userContext);
    const navigate = useNavigate()

    const intraLogin = () => {
        console.log('intra login');
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-7442b875083283b731c9dc5d4f86a28e615632e18b679667bd0714bbdbbad09f&redirect_uri=http%3A%2F%2F127.0.0.1%3A8000%2Fapi%2Fintra_callback%2F&response_type=code';
    }

    const login = (e: any) => {
        e.preventDefault();
        const username : string = e.target.username.value;
        const password : string = e.target.password.value;
        if(username === '' || password == '') {
            alert('Empty user name or password');
            return;
        }
        axios.post(`${BACKEND_BASE_URL}/api/login/`, {
            username: username,
            password: password,
        }).then(res => {
            setUser(res.data.user)
            setIsLoggedIn(true)
            setCookie(COOKIE_NAME, res.data.token)
            navigate('/')
        }).catch(err => {
            alert('Wrong user name or password')
        })
    } 

    return (
        <div className="flex justify-center items-center w-full h-full">
            <div className="flex flex-col w-[400px] h-[500px] bg-gray-100 rounded-md overflow-hidden shadow-lg p-[15px]">
                <div className="flex justify-center items-center h-1/6 w-full">
                    <h1 className="text-[30px]">Sign In</h1>
                </div>
                <div className="flex justify-center item-center h-3/6 p-[12px]">
                    <form className="flex justify-center item-center flex-col w-full h-full" onSubmit={login}>
                        <div className="flex flex-col justify-center items-center h-3/4">
                            <input
                                type="text"
                                name="username"
                                placeholder="username"
                                className="w-full h-[50px] focus:outline-none rounded-md p-[10px] my-[10px] border-[1px] border-black"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="password"
                                className="w-full h-[50px] focus:outline-none rounded-md p-[10px] my-[10px] border-[1px] border-black"
                            />
                        </div>
                        <div className="flex justify-center items-center h-1/4">
                            <input
                                type="submit"
                                value="sign in"
                                className="w-full h-[50px] bg-blue-400 rounded-[30px] hover:bg-blue-500 cursor-pointer border-[0.5px] border-black"
                            />
                        </div>
                    </form>
                </div>

                <div className="flex flex-col justify-center items-center w-full h-2/6 p-[12px]">
                    <div className="flex items-center h-1/4 w-full text-center">
                        <label className="h-1/4 w-full ">OR</label>
                    </div>
                    <div className="flex justify-center items-center h-3/4 w-full">
                        <button
                            className="w-full h-[50px] bg-blue-400 rounded-[30px] hover:bg-blue-500 cursor-pointer border-[0.5px] border-black"
                            onClick={ intraLogin }
                        >
                            Login with intra
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;
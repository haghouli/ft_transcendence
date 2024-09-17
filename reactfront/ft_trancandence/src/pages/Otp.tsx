import { useContext, useEffect, useState } from "react"
import { userContext } from "../utiles/Contexts/UserContext"
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { COOKIE_NAME, BACKEND_BASE_URL } from "../utiles/constents";
import axios from "axios";
import { UserState } from "../utiles/constents";


const Otp = () => {

    const { user, setIsLoggedIn, setUser } = useContext(userContext);
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies();
    const [code, setCode] = useState<string>('');
    let isFirstTime : boolean = true

    const cancel = () => {
        removeCookie(COOKIE_NAME)
        navigate('/login')
        setIsLoggedIn(false)
        setUser(undefined)
    }

    useEffect(() => {
        if(isFirstTime) {
            const token = cookies[COOKIE_NAME];
            isFirstTime=false;
            
            axios.get(`${BACKEND_BASE_URL}/api/send_mail/`, {
                headers : {
                    'Authorization' : `Bearer ${token}`,
                }
            })
            .then(res => {
                isFirstTime=false;
            }).catch(err => {
                console.log(err);
            })
        }
    }, [])

    const verify = () => {
        const token = cookies[COOKIE_NAME];
        axios.post(`${BACKEND_BASE_URL}/api/validate_code/`, {code: code }, 
            {
                headers : {
                    'Authorization' : `Bearer ${token}`,
                }
            }
        ).then(res => {

            setUser(prevUser => prevUser ? {
                ...prevUser,
                is_2af_active: false
            } : undefined);
            
            setCookie(COOKIE_NAME, res.data.token)
            window.location.reload();

            navigate('/')
        }).catch(err => {
            console.log(err);
        })
    }

  return (
    <div className='flex justify-center items-center w-fill h-full'>
        <div className='w-[350px] sm:w-[400px] md:w-[700px] h-[450px] bg-white rounded-[20px] overflow-hidden p-[10px] text-center'>
            <div className='w-full h-1/2 flex flex-col items-center justify-center pt-[80px]'>
                <h1 className='text-[40px]'>Verification</h1>
                <>you will get and 6-digits otp to {user?.email} </>
            </div>
            <div className='w-full h-1/2 flex flex-col items-center '>
                <input
                    type='text' className='text-center border-black border-[1px] w-[300px] h-[35px] rounded-[10px] m-[20px]'
                    onChange={ (e) => setCode(e.target.value) }
                />
                <button
                    className='text-center border-black border-[1px] w-[300px] h-[35px] rounded-[10px] bg-black text-white hover:text-black hover:bg-white m-[20px]'
                    onClick={verify}
                >Verify</button>
                <button
                    className='text-center border-black border-[1px] w-[300px] h-[35px] rounded-[10px] bg-black text-white hover:text-black hover:bg-white '
                    onClick={cancel}
                >Cancel</button>
            </div>
        </div>
    </div>
  )
}

export default Otp
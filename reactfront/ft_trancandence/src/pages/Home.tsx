import gaming_bg from '../assets/gamingbg.jpg'
import { Users } from '../utiles/constents'
import TopPlayersComponent from '../components/TopPlayersComponent'
import oneVone from '../assets/onevone.avif'
import aipic from '../assets/ai.jpg'

const Home = () => {
    return (
        <div className="flex flex-col text-white w-full p-[10px]">
            <div className="flex flex-col lg:flex-row justify-center items-center p-[10px]">
                <div className="w-full lg:w-2/3 h-full rounded-2xl h-[380px] m-[20px] overflow-hidden">
                    <img src={gaming_bg} alt="gaming-bg"  className='w-full h-full object-cover'/>
                </div>
                <div className="w-full lg:w-1/3 h-full rounded-lg bg-color2 h-[380px] rounded-2xl overflow-hidden">
                    <div className='flex items-center h-[15%]  p-[10px]'>
                        <h1 className='text-[40px]'>Top players</h1>
                    </div>
                    <div className='h-[85%] p-[15px]'>
                        {
                            Users.map((item, idx) => {
                                return(
                                    <TopPlayersComponent key={idx} item={item} idx={idx}/>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
            <div className='flex items-center justify-center flex-col lg:flex-row p-[10px]'>
                <div className="w-full my-[20px] lg:m-[20px] lg:w-1/3 h-[280px] bg-red-200  rounded-[20px] overflow-hidden cursor-pointer">
                    <img src={oneVone} alt="gaming-bg"  className='w-full h-full object-cover'/>
                </div>
                <div className="w-full my-[20px] lg:m-[20px] lg:w-1/3 h-[280px] bg-red-300  rounded-[20px] overflow-hidden cursor-pointer">
                    <img src={aipic} alt="gaming-bg"  className='w-full h-full object-cover'/>
                </div>
                <div className="w-full my-[20px] lg:m-[20px] lg:w-1/3 h-[280px] bg-red-400  rounded-[20px] overflow-hidden cursor-pointer">
                    <img src={gaming_bg} alt="gaming-bg"  className='w-full h-full object-cover'/>
                </div>
            </div>
        </div>
    )
} 

export default Home;
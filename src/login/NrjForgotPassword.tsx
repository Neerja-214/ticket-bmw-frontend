import React, { useEffect } from 'react'
import NrjInpto from '../components/reusable/NrjInpto'
import { useState } from 'react';
import { useNavigate } from 'react-router';
import utilities, { createGetApi } from '../utilities/utilities';
import { Toaster } from '../components/reusable/Toaster';
import { useToaster } from '../components/reusable/ToasterContext';

const NrjForgotPassword = () => {
    const navigate = useNavigate();
    const { showToaster, hideToaster } = useToaster();
    const [showMessage, setShowMessage] = useState<any>({message:[]})
    const [email, setEmail] = useState("");
    useEffect(() => {
        sessionStorage.clear();
    }, [0])

    const onChangeEmail = (event: any) => {
        setEmail(event.target.value);
    }

    const sndReq = async () => {
        if (email && email.length > 0) {
            let msg: string = createGetApi("db=nodb|dll=accdll|fnct=c269", email);
            const response = await fetch(msg, {
                method: "GET"
            });
            if (response.ok) {
                const body = await response.json();
                if (body) {
                    if (body[0]) {
                        if (body[0]['Data']) {
                            let msg = body[0]['Data'];
                            if (msg && msg.length > 0) {
                                msg.indexOf('Invalid') > -1 ? showToaster([msg],"error"): showToaster([msg],"success");
                            }

                            //setShowMessage({message:"Invalid Credentials / Error Login In"});
                            // AuthContext(s)
                        }
                    }
                }
                return;
            }

        } else {
            showToaster( ["Enter Email !!"], 'error');
        }
    }

    return (
        <div>
            <section className="bg-gray-50 daark:bg-gray-900">
                <div className="flex flex-col items-center justify-center px-6 py-4 mx-auto md:h-screen lg:py-0">
                    <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 daark:text-white">
                        {/* <img className="w-8 h-8 mr-2" src="https://www.amcservice.info/images/lgg.png" alt="logo" /> */}
                        Central Pollution Control Board
                    </a>
                    <div className="relative w-full bg-white rounded-lg shadow daark:border md:mt-0 sm:max-w-md xl:p-0 daark:bg-gray-800 daark:border-gray-700">
                        {showMessage && showMessage.message.length != 0 &&
                            <Toaster data={showMessage} className={''}></Toaster>
                        }
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl daark:text-white">
                                Forgot Password
                            </h1>
                            <form className="space-y-4 md:space-y-6" action="#">
                                <div>
                                    <label htmlFor="usr" className="block mb-2 text-sm font-medium text-gray-900 daark:text-white">Email</label>
                                    <input type="text" onChange={onChangeEmail} name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 daark:bg-gray-700 daark:border-gray-600 daark:placeholder-gray-400 daark:text-white dark:focus:ring-blue-500 daark:focus:border-blue-500" placeholder="Enter Email Address" required />
                                </div>
                                <button type="button" onClick={sndReq} className="w-full btn btn-outline-primary  text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Confirm</button>
                                <button type="button" onClick={()=>{navigate("/")}} className="w-full border border-white hover:border-black rounded-md font-semibold text-black focus:ring-4 focus:outline-none focus:ring-success-300 font-medium px-5 py-2.5 text-center dark:bg-success-600 dark:hover:bg-success-700 dark:focus:ring-success-800">Go to Login</button>
                            </form>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    )
}

export default React.memo(NrjForgotPassword)
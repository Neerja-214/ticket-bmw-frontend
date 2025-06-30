import React, { useReducer, useState, CSSProperties, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import profile from "../../app/assests/profileOne.png"
import { getLvl, getWho } from "../../utilities/cpcb";
import { useQuery } from "@tanstack/react-query";
import { nrjAxiosRequestBio, nrjAxiosRequestLinux } from "../../Hooks/useNrjAxios";
import { capitalize, getCmpId, postLinux } from "../../utilities/utilities";
import { useToaster } from "../../components/reusable/ToasterContext";


const Topbar = (props: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const { showToaster, hideToaster } = useToaster();

    const [isClicked, setIsClicked] = useState(false);

    const onlogout = () => {
        setIsClicked(true);
        refetchC();
    };

    const { data: dataC, refetch: refetchC } = useQuery({
        queryKey: ['logout'],
        queryFn: logoutApi,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: logoutApiSuccess,
    })

    function logoutApi() {

        let base64Data = sessionStorage.getItem('isLoggedOut') || "";
        let jsonData = atob(base64Data)
        if (jsonData) {
            let data = JSON.parse(jsonData);
            let payload: any = postLinux('M/SSM110041DLCDG6042' + "=" + '22ffd3cb69804c3ba561aee92606f4bc', "logout");
            return nrjAxiosRequestLinux('logout', payload)
        } else {
            showToaster(["Please try again !!!"], 'error');
            setIsClicked(true);
            setTimeout(() => {
                setIsClicked(false);
            }, 15000);
        }


    }

    function logoutApiSuccess(data: any) {
        setIsClicked(false);
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
    }

//Convert to camel case
    const capitalizeFirstLetter = (str: string): string => {
        return str.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
    const user = sessionStorage.getItem("lvl") == 'STT' ? 'SPCB (' + capitalize(getWho()) + ')' : sessionStorage.getItem("lvl") == 'RGD' ? 'RD (' + getWho() + ')' : sessionStorage.getItem("lvl") == 'HCF' ? 'HCF (' + getWho() + ')' : sessionStorage.getItem("lvl") == 'CBWTF' ? 'CBWTF (' + getWho() + ')' : 'CPCB';
    return (
        <>
            <div className="bg-white p-1 mt-1 my-3 flex md:justify-between items-center rounded-lg" style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12)' }}>
                {!props.showSideNav && <div onMouseOver={props.toggleSideNavOn}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="blue"
                        width="26" height="26"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                </div>}

                {/* Breadcrumbs */}
                <div className="text-black md:text-lg ml-2 font-bold">
                    {capitalizeFirstLetter(props.title)}
                </div>
                {/* Spacer */}
                <div className="flex-1 hidden md:block"></div>

                {/* Search Bar */}
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        {/* <input
                            type="text"
                            className="  py-2 px-5 pr-10 focus:outline-none focus:ring focus:border-blue-300 text-sm md:text-base lg:text-lg"
                            placeholder="Search for anything here.."
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                                <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                            </svg>
                        </div> */}
                    </div>

                    {/* Language Dropdown */}
                    <div className="mr-2">
                        <button onClick={toggleDropdown} className="focus:outline-none">
                            <div className="flex items-center space-x-2 cursor-pointer">
                                <img src={profile} alt="" style={{ height: "35px" }} className="px-2" />
                                <div>
                                    <h6 className="text-xs md:text-sm lg:text-base">{user}</h6>
                                </div>
                            </div>
                        </button>
                        {isOpen && (
                            <div className="absolute z-10 right-0 mt-2 w-48 shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                <div className="py-1 ">
                                    {/* {getLvl() == 'CPCB' && <a href="" onClick={()=>navigate('/changePwdRgd')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"> Change Password RGDs</a>}
                                {getLvl() == 'CPCB' && <a href="" onClick={()=>navigate('/changePwdSpcb')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"> Change Password SPCBs</a>}
                                <a href="" onClick={()=>navigate('/changePwd')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"> Change Password</a> */}
                                    <a onClick={onlogout}
                                        className={`block px-4 py-2 text-sm ${isClicked ? 'text-green-500' : 'text-rose-500'} hover:bg-rose-100 hover:text-rose-900`}>
                                        {isClicked ? 'Signing Out...' : 'Sign Out'}</a>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default React.memo(Topbar);
import React, { useReducer, useState } from "react";
import utilities from "../../utilities/utilities";
import logo1 from "../../app/assests/cpcblogo.png";
import { useNavigate } from "react-router";
import { Tooltip } from "@mui/material";
import { getLvl } from "../../utilities/cpcb";


const Sidebar = (props: any) => {
    const hideInState = getLvl() == 'STT'? true : false

    const navigate = useNavigate();
    const setPageTitle = props.setPageTitle;
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [openChrt, setOpenChrt] = useState(false);
    const [open3, setOpen3] = useState(false);
    const [open4, setOpen4] = useState(false);
    const [open5, setOpen5] = useState(false);
    const [open6, setOpen6] = useState(false);


    const toggleOpenOne = () => {
        setOpen1(!open1)
        setOpen2(false)
        setOpenChrt(false);
        setOpen3(false);
        setOpen4(false);
        setOpen5(false);
        setOpen6(false);
    }

    const toggleOpenChart = () => {
        setOpen1(false)
        setOpen2(false)
        setOpenChrt(!openChrt)
        //setOpen3(false)
        setOpen4(false);
        setOpen5(false);
        setOpen6(false);
    }

    const toggleOpenTwo = () => {
        setOpen1(false)
        setOpen2(!open2)
        setOpenChrt(false)
        setOpen3(false)
        setOpen4(false);
        setOpen5(false);
        setOpen6(false);
    }
    const toggleOpenThree = () => {
        setOpen3(!open3);
        setOpen1(false);
        setOpen2(false);
        setOpenChrt(false)
        setOpen4(false);
        setOpen5(false);
        setOpen6(false);
    }

    const toggleOpenFour = () => {
        setOpen4(!open4);
        setOpen1(false);
        setOpen2(false);
        setOpenChrt(false)
        setOpen3(false);
        setOpen5(false);
        setOpen6(false);
    }
    const toggleOpenFive = () => {
        setOpen5(!open5);
        setOpen1(false);
        setOpen2(false);
        setOpenChrt(false)
        setOpen3(false);
        setOpen4(false);
        setOpen6(false);
    }
    const toggleOpenSix = () => {
        setOpen6(!open6);
        setOpen1(false);
        setOpen2(false);
        setOpenChrt(false)
        setOpen3(false);
        setOpen4(false);
        setOpen5(false);
    }


    const navigateToPage = (data: string, description: any,) => {
        navigate(data);
        setPageTitle(description);
        // props.toggleSideNavOff();
    };

    const LiElement = (props: any) => {

        const liElementClicked = (path: string, description: string) => {
            
            if (props.navigateToPage) {
                props.navigateToPage(path, description)
            }
            else if (props.onClickChart) {
                props.onClickChart();
            }
        }


        return (
            <li onClick={() => { liElementClicked(props.data.path, props.data.description) }} 
            className={`flex justify-between items-center text-black hover:text-gray-300 hover:bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8] block py-3 ps-4 
            nav-link ${window.location.pathname.includes(props.data.path) ? "bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8]" : ""}`}>
                <div className={`ml-4 flex items-center ${props.data.path === window.location.pathname ? "text-[#0F6CBD]" : "text-black"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none" className="mr-2">
                        <circle cx="4" cy="4" r="4" fill={props.data.path == window.location.pathname ? "#0F6CBD" : "#D6D8DA"} />
                    </svg>{props.data.name}
                </div>
            </li>
        )
    }


    return (
        <div onMouseLeave={props.toggleSideNavOff} 
        // style={{height:'100vh'}} 
        >
            <div
                className="flex items-center pt-2 flex-shrink-0 text-black mr-6">
                <img src={logo1} alt="" className="mx-2" />
                <span className="text-black font-semibold whitespace-nowrap">
                    Central Pollution Control Board
                </span>
            </div>
            <div className="py-2 mx-3 ">

                {/* <div style={{ transform: 'rotate(180deg)' }}>
                    <Tooltip title="Click to hide side bar">
                        <svg onMouseOver={props.toggleSideNavOff} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0F6CBD" className="bi bi-arrow-right-circle-fill" viewBox="0 0 16 16">
                            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" />
                        </svg>

                    </Tooltip>
                </div> */}

            </div>
            <div onClick={() => navigateToPage("/dashboardvb", "Dashboard")} className={`flex justify-between items-center pr-4 text-black hover:text-gray-300 hover:bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8] block py-3 ps-4 ml-1 nav-link ${window.location.pathname === "/dashboardvb" ? " bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8]" : ""}`}>
                <div className="flex items-center text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill={window.location.pathname === "/dashboardvb" ? "text-[#0F6CBD]" : "text-black"} className="mr-2 bi bi-house-door" viewBox="0 0 16 16">
                        <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146ZM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5Z" />
                    </svg>
                    <span className={window.location.pathname === "/dashboardvb" ? "text-[#0F6CBD]" : "text-black"}>Dashboard</span>
                </div>
            </div>






            {/* **************************************************************************** */}
            <div onClick={() => toggleOpenOne()} className={`flex justify-between items-center pr-4 text-black hover:text-gray-300 hover:bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8] block py-3 ps-4 nav-link`}>
                <a className="flex items-center text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-1">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 10.4H5.80801C5.33243 10.3964 4.87476 10.5692 4.53569 10.8804C4.19662 11.1916 4.00392 11.6158 4 12.0596V18.3407C4.0088 19.2646 4.81811 20.007 5.80801 19.9992H9.04916C9.5247 20.003 9.98242 19.8302 10.3215 19.5189C10.6606 19.2077 10.8533 18.7835 10.8572 18.3396V12.0596C10.8533 11.6158 10.6606 11.1916 10.3215 10.8804C9.98242 10.5692 9.5247 10.3964 9.04916 10.4Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 4.00064H5.80801C4.83801 3.97554 4.02925 4.68786 4 5.59305V6.67456C4.02925 7.57975 4.83801 8.29207 5.80801 8.26696H9.04916C10.0191 8.29207 10.8279 7.57975 10.8572 6.67456V5.59305C10.8279 4.68786 10.0191 3.97554 9.04916 4.00064Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 13.6H18.1907C18.6665 13.6039 19.1244 13.4312 19.4637 13.12C19.8031 12.8087 19.996 12.3844 19.9999 11.9404V5.66033C19.996 5.2165 19.8033 4.7923 19.4642 4.48106C19.1251 4.16982 18.6674 3.99704 18.1919 4.00073H14.9507C14.4752 3.99704 14.0174 4.16982 13.6784 4.48106C13.3393 4.7923 13.1466 5.2165 13.1427 5.66033V11.9404C13.1466 12.3842 13.3393 12.8084 13.6784 13.1196C14.0174 13.4308 14.4752 13.6036 14.9507 13.6Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 19.9993H18.1907C19.1611 20.025 19.9706 19.3125 19.9999 18.4069V17.3253C19.9706 16.4201 19.1618 15.7079 18.1919 15.7329H14.9507C13.9808 15.7079 13.172 16.4201 13.1427 17.3253V18.4058C13.1713 19.3114 13.9803 20.0243 14.9507 19.9993Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Data management

                </a>
                {open1 && <div style={{ transform: 'rotate(180deg)' }}>
                    <svg

                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
                {!open1 && <div>
                    <svg
                        style={{ transform: 'rotate(180)' }}
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
            </div>
            {open1 && <ul className="pt-2 p-0">
                {props.dropdownOne.map((res: any) => (res.hide ? <></> : <LiElement data={res} navigateToPage={navigateToPage}></LiElement>))}
            </ul>}





            {/* *********************************************************** second dropdown ****************************************************** */}



            <div onClick={() => toggleOpenTwo()} className="flex justify-between items-center pr-4 text-black hover:text-gray-300 hover:bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8] block py-3 ps-4 nav-link">

                <a className="flex items-center text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-1">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 10.4H5.80801C5.33243 10.3964 4.87476 10.5692 4.53569 10.8804C4.19662 11.1916 4.00392 11.6158 4 12.0596V18.3407C4.0088 19.2646 4.81811 20.007 5.80801 19.9992H9.04916C9.5247 20.003 9.98242 19.8302 10.3215 19.5189C10.6606 19.2077 10.8533 18.7835 10.8572 18.3396V12.0596C10.8533 11.6158 10.6606 11.1916 10.3215 10.8804C9.98242 10.5692 9.5247 10.3964 9.04916 10.4Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 4.00064H5.80801C4.83801 3.97554 4.02925 4.68786 4 5.59305V6.67456C4.02925 7.57975 4.83801 8.29207 5.80801 8.26696H9.04916C10.0191 8.29207 10.8279 7.57975 10.8572 6.67456V5.59305C10.8279 4.68786 10.0191 3.97554 9.04916 4.00064Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 13.6H18.1907C18.6665 13.6039 19.1244 13.4312 19.4637 13.12C19.8031 12.8087 19.996 12.3844 19.9999 11.9404V5.66033C19.996 5.2165 19.8033 4.7923 19.4642 4.48106C19.1251 4.16982 18.6674 3.99704 18.1919 4.00073H14.9507C14.4752 3.99704 14.0174 4.16982 13.6784 4.48106C13.3393 4.7923 13.1466 5.2165 13.1427 5.66033V11.9404C13.1466 12.3842 13.3393 12.8084 13.6784 13.1196C14.0174 13.4308 14.4752 13.6036 14.9507 13.6Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 19.9993H18.1907C19.1611 20.025 19.9706 19.3125 19.9999 18.4069V17.3253C19.9706 16.4201 19.1618 15.7079 18.1919 15.7329H14.9507C13.9808 15.7079 13.172 16.4201 13.1427 17.3253V18.4058C13.1713 19.3114 13.9803 20.0243 14.9507 19.9993Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Master
                </a>
                {open2 && <div style={{ transform: 'rotate(180deg)' }}>
                    <svg

                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
                {!open2 && <div>
                    <svg
                        style={{ transform: 'rotate(180)' }}
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
            </div>
            {open2 && <ul className="pt-1 p-0">
                {props.dropdownTwo.map((res: any) => (res.hide ? <></> : <LiElement data={res} navigateToPage={navigateToPage}></LiElement>))}
            </ul>}


            {/* ************************************************************* third dropdown ******************************************************** */}



            <div onClick={toggleOpenThree} className="flex justify-between items-center pr-4 text-black hover:text-gray-300 hover:bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8] block py-3 ps-4 nav-link">

                <a className="flex items-center text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-1">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 10.4H5.80801C5.33243 10.3964 4.87476 10.5692 4.53569 10.8804C4.19662 11.1916 4.00392 11.6158 4 12.0596V18.3407C4.0088 19.2646 4.81811 20.007 5.80801 19.9992H9.04916C9.5247 20.003 9.98242 19.8302 10.3215 19.5189C10.6606 19.2077 10.8533 18.7835 10.8572 18.3396V12.0596C10.8533 11.6158 10.6606 11.1916 10.3215 10.8804C9.98242 10.5692 9.5247 10.3964 9.04916 10.4Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 4.00064H5.80801C4.83801 3.97554 4.02925 4.68786 4 5.59305V6.67456C4.02925 7.57975 4.83801 8.29207 5.80801 8.26696H9.04916C10.0191 8.29207 10.8279 7.57975 10.8572 6.67456V5.59305C10.8279 4.68786 10.0191 3.97554 9.04916 4.00064Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 13.6H18.1907C18.6665 13.6039 19.1244 13.4312 19.4637 13.12C19.8031 12.8087 19.996 12.3844 19.9999 11.9404V5.66033C19.996 5.2165 19.8033 4.7923 19.4642 4.48106C19.1251 4.16982 18.6674 3.99704 18.1919 4.00073H14.9507C14.4752 3.99704 14.0174 4.16982 13.6784 4.48106C13.3393 4.7923 13.1466 5.2165 13.1427 5.66033V11.9404C13.1466 12.3842 13.3393 12.8084 13.6784 13.1196C14.0174 13.4308 14.4752 13.6036 14.9507 13.6Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 19.9993H18.1907C19.1611 20.025 19.9706 19.3125 19.9999 18.4069V17.3253C19.9706 16.4201 19.1618 15.7079 18.1919 15.7329H14.9507C13.9808 15.7079 13.172 16.4201 13.1427 17.3253V18.4058C13.1713 19.3114 13.9803 20.0243 14.9507 19.9993Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Mis Reports
                </a>
                {open3 && <div style={{ transform: 'rotate(180deg)' }}>
                    <svg

                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
                {!open3 && <div>
                    <svg
                        style={{ transform: 'rotate(180)' }}
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
            </div>
            {open3 && <ul className="pt-1 p-0">
                {props.dropdownThree.map((res: any) => (res.hide ? <></> : <LiElement data={res} navigateToPage={navigateToPage}></LiElement>))}
            </ul>}

            {open3 && <> <div className="flex items-center text-black hover:text-gray-300 hover:bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8]">
                <div className="w-11/12">

                    <LiElement data={{ name: 'MIS Graphical', path: 'bagWtCntChrt', hide: false, description: 'Mis Report' }} onClickChart={toggleOpenChart}> </LiElement>

                </div>
                <div className={`block py-[21px] ps-4 nav-link ${window.location.pathname.includes('bagWtCntChrt') ? "bg-gradient-to-r from-[#f9eee8] to-[#F9EEE8]" : ""}`}>

                    {openChrt &&

                        <div className="flex justify-center" style={{ transform: 'rotate(180deg)' }}>
                            <svg

                                className="w-2.5 h-2.5"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 10 6"
                            >
                                <path
                                    stroke="#676767"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 4 4 4-4"
                                />
                            </svg>
                        </div>}
                    {!openChrt && <div className="flex justify-center">
                        <svg
                            style={{ transform: 'rotate(180)' }}
                            className="w-2.5 h-2.5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                        >
                            <path
                                stroke="#676767"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 4 4 4-4"
                            />
                        </svg>
                    </div>}
                </div>

            </div>
                {openChrt && <ul className="pt-1 p-0">
                    {props.dropdownChart.map((res: any) => (res.hide ? <></> : <LiElement data={res} navigateToPage={navigateToPage}></LiElement>))}
                </ul>}
        

</>
            }



            <div onClick={() => toggleOpenFour()} className="flex justify-between items-center pr-4 text-black hover:text-gray-300 hover:bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8] block py-3 ps-4 nav-link">

                <a className="flex items-center text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-1">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 10.4H5.80801C5.33243 10.3964 4.87476 10.5692 4.53569 10.8804C4.19662 11.1916 4.00392 11.6158 4 12.0596V18.3407C4.0088 19.2646 4.81811 20.007 5.80801 19.9992H9.04916C9.5247 20.003 9.98242 19.8302 10.3215 19.5189C10.6606 19.2077 10.8533 18.7835 10.8572 18.3396V12.0596C10.8533 11.6158 10.6606 11.1916 10.3215 10.8804C9.98242 10.5692 9.5247 10.3964 9.04916 10.4Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 4.00064H5.80801C4.83801 3.97554 4.02925 4.68786 4 5.59305V6.67456C4.02925 7.57975 4.83801 8.29207 5.80801 8.26696H9.04916C10.0191 8.29207 10.8279 7.57975 10.8572 6.67456V5.59305C10.8279 4.68786 10.0191 3.97554 9.04916 4.00064Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 13.6H18.1907C18.6665 13.6039 19.1244 13.4312 19.4637 13.12C19.8031 12.8087 19.996 12.3844 19.9999 11.9404V5.66033C19.996 5.2165 19.8033 4.7923 19.4642 4.48106C19.1251 4.16982 18.6674 3.99704 18.1919 4.00073H14.9507C14.4752 3.99704 14.0174 4.16982 13.6784 4.48106C13.3393 4.7923 13.1466 5.2165 13.1427 5.66033V11.9404C13.1466 12.3842 13.3393 12.8084 13.6784 13.1196C14.0174 13.4308 14.4752 13.6036 14.9507 13.6Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 19.9993H18.1907C19.1611 20.025 19.9706 19.3125 19.9999 18.4069V17.3253C19.9706 16.4201 19.1618 15.7079 18.1919 15.7329H14.9507C13.9808 15.7079 13.172 16.4201 13.1427 17.3253V18.4058C13.1713 19.3114 13.9803 20.0243 14.9507 19.9993Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Daily Activity
                </a>
                {open4 && <div style={{ transform: 'rotate(180deg)' }}>
                    <svg

                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
                {!open4 && <div>
                    <svg
                        style={{ transform: 'rotate(180)' }}
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
            </div>
            {open4 && <ul className="pt-1 p-0">
                {props.dropdownFour?.map((res: any) => (res.hide ? <></> : <LiElement data={res} navigateToPage={navigateToPage}></LiElement>))}
            </ul>}



            <div onClick={() => toggleOpenFive()} className="flex justify-between items-center pr-4 text-black hover:text-gray-300 hover:bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8] block py-3 ps-4 nav-link">

                <a className="flex items-center text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-1">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 10.4H5.80801C5.33243 10.3964 4.87476 10.5692 4.53569 10.8804C4.19662 11.1916 4.00392 11.6158 4 12.0596V18.3407C4.0088 19.2646 4.81811 20.007 5.80801 19.9992H9.04916C9.5247 20.003 9.98242 19.8302 10.3215 19.5189C10.6606 19.2077 10.8533 18.7835 10.8572 18.3396V12.0596C10.8533 11.6158 10.6606 11.1916 10.3215 10.8804C9.98242 10.5692 9.5247 10.3964 9.04916 10.4Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 4.00064H5.80801C4.83801 3.97554 4.02925 4.68786 4 5.59305V6.67456C4.02925 7.57975 4.83801 8.29207 5.80801 8.26696H9.04916C10.0191 8.29207 10.8279 7.57975 10.8572 6.67456V5.59305C10.8279 4.68786 10.0191 3.97554 9.04916 4.00064Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 13.6H18.1907C18.6665 13.6039 19.1244 13.4312 19.4637 13.12C19.8031 12.8087 19.996 12.3844 19.9999 11.9404V5.66033C19.996 5.2165 19.8033 4.7923 19.4642 4.48106C19.1251 4.16982 18.6674 3.99704 18.1919 4.00073H14.9507C14.4752 3.99704 14.0174 4.16982 13.6784 4.48106C13.3393 4.7923 13.1466 5.2165 13.1427 5.66033V11.9404C13.1466 12.3842 13.3393 12.8084 13.6784 13.1196C14.0174 13.4308 14.4752 13.6036 14.9507 13.6Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 19.9993H18.1907C19.1611 20.025 19.9706 19.3125 19.9999 18.4069V17.3253C19.9706 16.4201 19.1618 15.7079 18.1919 15.7329H14.9507C13.9808 15.7079 13.172 16.4201 13.1427 17.3253V18.4058C13.1713 19.3114 13.9803 20.0243 14.9507 19.9993Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Search
                </a>
                {open5 && <div style={{ transform: 'rotate(180deg)' }}>
                    <svg

                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
                {!open5 && <div>
                    <svg
                        style={{ transform: 'rotate(180)' }}
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
            </div>
            {open5 && <ul className="pt-1 p-0">
                {props.dropdownFive.map((res: any) => (res.hide ? <></> : <LiElement data={res} navigateToPage={navigateToPage}></LiElement>))}
            </ul>}


            <div onClick={() => toggleOpenSix()} className="flex justify-between items-center pr-4 text-black hover:text-gray-300 hover:bg-gradient-to-r from-[#B2D1FF] to-[#F9EEE8] block py-3 ps-4 nav-link">

                <a className="flex items-center text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-1">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 10.4H5.80801C5.33243 10.3964 4.87476 10.5692 4.53569 10.8804C4.19662 11.1916 4.00392 11.6158 4 12.0596V18.3407C4.0088 19.2646 4.81811 20.007 5.80801 19.9992H9.04916C9.5247 20.003 9.98242 19.8302 10.3215 19.5189C10.6606 19.2077 10.8533 18.7835 10.8572 18.3396V12.0596C10.8533 11.6158 10.6606 11.1916 10.3215 10.8804C9.98242 10.5692 9.5247 10.3964 9.04916 10.4Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.04916 4.00064H5.80801C4.83801 3.97554 4.02925 4.68786 4 5.59305V6.67456C4.02925 7.57975 4.83801 8.29207 5.80801 8.26696H9.04916C10.0191 8.29207 10.8279 7.57975 10.8572 6.67456V5.59305C10.8279 4.68786 10.0191 3.97554 9.04916 4.00064Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 13.6H18.1907C18.6665 13.6039 19.1244 13.4312 19.4637 13.12C19.8031 12.8087 19.996 12.3844 19.9999 11.9404V5.66033C19.996 5.2165 19.8033 4.7923 19.4642 4.48106C19.1251 4.16982 18.6674 3.99704 18.1919 4.00073H14.9507C14.4752 3.99704 14.0174 4.16982 13.6784 4.48106C13.3393 4.7923 13.1466 5.2165 13.1427 5.66033V11.9404C13.1466 12.3842 13.3393 12.8084 13.6784 13.1196C14.0174 13.4308 14.4752 13.6036 14.9507 13.6Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.9507 19.9993H18.1907C19.1611 20.025 19.9706 19.3125 19.9999 18.4069V17.3253C19.9706 16.4201 19.1618 15.7079 18.1919 15.7329H14.9507C13.9808 15.7079 13.172 16.4201 13.1427 17.3253V18.4058C13.1713 19.3114 13.9803 20.0243 14.9507 19.9993Z" stroke="#02101D" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Daily Report
                </a>
                {open6 && <div style={{ transform: 'rotate(180deg)' }}>
                    <svg

                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
                {!open6 && <div>
                    <svg
                        style={{ transform: 'rotate(180)' }}
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                    >
                        <path
                            stroke="#676767"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 4 4 4-4"
                        />
                    </svg>
                </div>}
            </div>
            {open6 && <ul className="pt-1 p-0">
                {props.dropdownSix.map((res: any) => (res.hide ? <></> : <LiElement data={res} navigateToPage={navigateToPage}></LiElement>))}
            </ul>}

        </div>
    );
};
export default React.memo(Sidebar);
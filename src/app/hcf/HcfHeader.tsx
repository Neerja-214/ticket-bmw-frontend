import React, { useEffect, useReducer, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetFldName, GetResponseWnds, convertFldValuesToJson, convertFldValuesToString, createGetApi, dataStr_ToArray, getCmpId, getUsrId, postLinux, postLnxSrvr, svLnxSrvr, tellWndsServer, tellWndsServer2 } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";

import { nrjAxiosRequest, nrjAxiosRequestBio, nrjAxiosRequestLinux, useNrjAxios } from '../../Hooks/useNrjAxios';
import { Navigate, useNavigate } from "react-router-dom";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import WtrInput from '../../components/reusable/nw/WtrInput';
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect';
import { validForm } from '../../Hooks/validForm';
import { Toaster } from '../../components/reusable/Toaster';
import NrjRsDt from '../../components/reusable/NrjRsDt';
import SaveIcon from "@mui/icons-material/Save";
import NrjAgGrid from '../../components/reusable/NrjAgGrid';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import moment from 'moment';
import { useToaster } from '../../components/reusable/ToasterContext';

const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  SETGID: "gd",
  NEWFRMDATA: "frmdatanw",
  DISABLE: 'disable'
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  textDts: "",
  mainId: 0,
  errMsg: [],
  openDrwr: false,
  frmData: "",
  gid: "",
};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  trigger: number;
  textDts: string;
  mainId: number;
  errMsg: any;
  openDrwr: boolean;
  frmData: string;
  gid: string;
};

type act = {
  type: string;
  payload: any;
};

const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.MAINID:
      newstate.mainId = action.payload;
      newstate.gid = "";
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.TRIGGER_GRID:
      newstate.triggerG = action.payload;
      return newstate;
    case ACTIONS.TRIGGER_FORM:
      newstate.trigger = action.payload;
      if (action.payload === 1) {
        newstate.textDts = "";
        newstate.frmData = "";
        newstate.mainId = 0;
      }
      return newstate;
    case ACTIONS.NEWROWDATA:
      newstate.nwRow = action.payload;
      newstate.triggerG = 1;
      return newstate;
    case ACTIONS.RANDOM:
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.FORM_DATA:
      let dta: string = "";
      let fldN: any = utilities(2, action.payload, "");
      if (newstate.textDts) {
        dta = newstate.textDts + "=";
        let d: any = utilities(1, dta, fldN);
        if (d) {
          dta = d;
        } else {
          dta = "";
        }
      }
      dta += action.payload;
      newstate.textDts = dta;
      newstate.frmData = dta;
      return newstate;

    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.CHECK_REQ:
      newstate.errMsg = action.payload;
      newstate.openDrwr = true;
      return newstate;
    case ACTIONS.CHECK_REQDONE:
      newstate.errMsg = [];
      newstate.openDrwr = false;
      return newstate;
    case ACTIONS.SETGID:
      newstate.gid = action.payload;
      return newstate;
    case ACTIONS.DISABLE:
      if (action.payload == 1) {
        if (newstate.disableA == 1) {
          newstate.disableA = 0
        } else {
          newstate.disableA = 1
        }
        return newstate
      } else if (action.payload == 2) {
        if (newstate.disableB == 1) {
          newstate.disableB = 0
        } else {
          newstate.disableB = 1
        }
        return newstate
      }
  }
};



const HcfHeader = () => {

  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const [isDropdownOpenProfile, setDropdownOpenProfile] = useState(false);

  const toggleDropdownProfile = () => {
    setDropdownOpenProfile(!isDropdownOpenProfile);
  };


  const [isClicked, setIsClicked] = useState(false);
const { showToaster, hideToaster } = useToaster();
const navigate = useNavigate();


const onlogout = () => {
  setIsClicked(true);
  refetchC();
};

const { data: dataC, refetch: refetchC } = useQuery({
  queryKey: ['logoutHCF'],
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
    let payload: any = postLinux(data.usrnm + "=" + getCmpId(), "logout");
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

  return (
    <>
      <div className="sticky top-1 z-10 bg-white">
        <nav className="py-2 bg-white" >
          <div className="flex items-center justify-between">
            <div className="flex items-center w-3/12">
              <img src="https://eprplastic.cpcb.gov.in/assets/images/header-images/left-header-image.png" alt="Logo" className="h-8 mr-2" />
              <span className="text-sm">Ministry of Environment, Forest and Climate
                Change Government of India</span>
            </div>
            <div className='flex flex-grow items-center'>
              <div className='w-2/12'></div>
              <div className="">
                <h3 className="font-bold whitespace-nowrap text-indigo-800 text-2xl">Centralized Portal for Biomedical Waste
                </h3>
              </div>
            </div>
            <div className="flex items-center">
              <img
                src="https://eprplastic.cpcb.gov.in/assets/images/header-images/right-header-image.png"
                width="30"
                className="img"
                alt="Right Header Image"
              />
              <img
                src="https://eprplastic.cpcb.gov.in/assets/images/header-images/LifeLogo.jpeg"
                width="80"
                className="img mt-2"
                alt="Life Logo"
              />
            </div>
          </div>
        </nav>
        <nav className=" py-2 mb-5" style={{ background: 'linear-gradient(90.29deg, #86c6d9 0%, rgb(215 174 224 / 98%) 100%)' }}>
          <div className="flex items-center justify-end">
            {/* <div className="flex justify-end">
              <div className="relative mr-4">
                <div className="mx-4 flex items-center relative " onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown} onClick={toggleDropdown}>
                  <svg
                    className="h-4 w-4 ml-1 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.5 6.25a.75.75 0 111.5 0v1.5a.75.75 0 01-1.5 0v-1.5zm0 3a.75.75 0 111.5 0v1.5a.75.75 0 01-1.5 0v-1.5zm0 3a.75.75 0 111.5 0v1.5a.75.75 0 01-1.5 0v-1.5zm4.75-4.5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 3a.75.75 0 000 1.5h5.25a.75.75 0 000-1.5H7.25zm0 3a.75.75 0 000 1.5h5.25a.75.75 0 000-1.5H7.25zm0 3a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5z"
                    />
                  </svg>
                  <span className='text-[18px]'>Menu</span>
                  <span className={"mx-1"}>
                    {isDropdownOpen &&
                      <svg
                        style={{ transform: 'rotate(180deg)' }}
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="#000"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    }
                    {!isDropdownOpen &&
                      <svg
                        style={{ transform: 'rotate(180)' }}
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="#000"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    }
                  </span>

                  {isDropdownOpen && <div className="absolute top-[20px]" style={{ width: '200px' }}>
                    <div className="text-black mt-2 bg-slate-100 rounded-lg pt-2  border">
                      <ul>
                        <li className="py-1 px-4 border-b hover:text-lg w-full"><a href='/HcfDetails'>HCF details</a></li>
                        <li className="py-1 px-4 border-b hover:text-lg w-full"><a href='/HcfArDaily'>HCF Annual Report : Daily</a></li>
                        <li className="py-1 px-4 border-b hover:text-lg w-full"><a href='/HcfAr'>HCF Annual Report : Monthly</a></li>
                        <li className="py-1 px-4 border-b hover:text-lg w-full"><a href='/hcfAnnlRpt'>HCF Annual Report Form</a></li>
                        <li className="py-1 px-4 border-b hover:text-lg w-full"><a href='/hcfMonthlyhRpt'>HCF Monthly Report Form</a></li>
                        <li className="py-1 px-4 border-b hover:text-lg w-full"><a href='/hcfAnnlRptFormTab'>HCF Annual Report Form</a></li>
                        <li className="py-1 px-4 border-b hover:text-lg w-full"><a href='/hcfMonthlyhRptFromTab'>HCF Monthly Report Form</a></li>
                      </ul>
                    </div>
                  </div>}

                </div>
              </div>
              <div className="relative">
                <div className="mx-4 flex items-center relative  px-6" onMouseEnter={toggleDropdownProfile} onMouseLeave={toggleDropdownProfile} onClick={toggleDropdownProfile}>
                  <span className='text-[18px]'>Account</span>
                  <span className={"mx-1"}>
                    {isDropdownOpenProfile &&
                      <svg
                        style={{ transform: 'rotate(180deg)' }}
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="#000"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    }
                    {!isDropdownOpenProfile &&
                      <svg
                        style={{ transform: 'rotate(180)' }}
                        className="w-2.5 h-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="#000"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    }
                  </span>

                  {isDropdownOpenProfile && <div className="absolute top-[20px] px-5" style={{ width: '253px', right: '-0.5%' }}>
                    <div className="text-black mt-2 bg-slate-100 rounded-lg pt-2  border">
                      <ul>
                        <li className="py-1 px-4 border-b hover:text-lg w-full"><a href='/ChangePasswordHcf'>Change Password</a></li>
                        <li className="py-1 px-4 border-b text-danger hover:text-lg w-full">
                          <a onClick={onlogout}
                            className={`block px-4 py-2 text-sm ${isClicked ? 'text-green-500' : 'text-rose-500'} hover:bg-rose-100 hover:text-rose-900`}>
                            {isClicked ? 'Signing Out...' : 'Sign Out'}</a>
                        </li>
                      </ul>
                    </div>
                  </div>}

                </div>
              </div>
            </div> */}
          </div>
        </nav>
      </div>


    </>
  );
};
export default React.memo(HcfHeader);
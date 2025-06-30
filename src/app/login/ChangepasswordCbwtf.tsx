import React, { useReducer, useState } from "react";
import axios from "axios";
import { validForm } from "../../Hooks/validForm";
import { useQuery } from "@tanstack/react-query";
// import { Formik, FormikHelpers, FormikProps, Form, Field,FieldProps,} from "formik";
import utilities, {
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  passwordRegex,
} from "../../utilities/utilities";
import {
  Button
} from "@mui/material";
import logo1 from "../../app/assests/cpcblogo.png" //"app/assests/cpcblogo.png"

import { nrjAxios } from "../../Hooks/useNrjAxios";
import { getFldValue } from "../../Hooks/useGetFldValue";
import WtrInput from "../../components/reusable/nw/WtrInput";
import { Toaster } from "../../components/reusable/Toaster";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useEffectOnce } from "react-use";
import HdrDrp from "../HdrDrp";
import HcfHeader from "../hcf/HcfHeader";
import { useToaster } from "../../components/reusable/ToasterContext";

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
  DISABLE: "disable"
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
  disableA: 1,
  disableB: 1,
  disableC: 1,
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
  disableA: number,
  disableB: number,
  disableC: number,
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
      if (action.payload === 0) {
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
      return newstate;

    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
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
      if (newstate.disableA == 1) {
        newstate.disableA = 0
      } else {
        newstate.disableA = 1
      }
      return newstate;
  }
};

interface Values {
  cpcbof: string;
  cntp: string;
}

const ChangePasswordCbwtf = () => {

  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState<any>({ message: [] })
  const reqFlds = [
    { fld: 'usrid', msg: 'Enter User Id', chck:'1[length]' },
    { fld: 'npwd', msg: 'Enter New password', chck: '[psw]' },
    { fld: 'rnpwd', msg: 'Enter New password Again', chck: '[psw]' },
  ];
  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };

  //#############Function calls
  const [strongPasswordMessage, setStrongPasswordMessage] = useState(false);
  const [message, setMessage] = useState("Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character (!$%^&*). It should not contain '@' or '#'.");
  function isPasswordStrong(password: string) {
    return passwordRegex(password)

  }

  const onChangeDts = (data: string) => {
    let value = data.split('][')
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    if (value[0] != 'usrid' && !isPasswordStrong(value[1])) {
      setStrongPasswordMessage(true);
    }
    else {
      setStrongPasswordMessage(false);
    }

  };

  


  const handleSaveClick = () => {
    let username = GetDataValue(state.textDts, 'usrid');
    let npwd = GetDataValue(state.textDts, 'npwd');
    let api: string = createGetApi("db=dummy|dll=dummy|fnct=dummy", `${npwd}=${username}`);
    return nrjAxios({ apiCall: api });
  };
  const { showToaster, hideToaster } = useToaster();
  const saveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);

    let pwd1 = GetDataValue(api, 'npwd');
    let pwd2 = GetDataValue(api, 'rnpwd');
    if (pwd1 != pwd2) {
      showToaster( ["passwords do not match!"], 'error')
      return;
    }
    if (msg && msg[0]) {
      showToaster( msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg })
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetch();
  };

  const svdQry = (data: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    let ech:any;
    let str: string = GetResponseWnds(data)
    if (str) {
      ech = dataStr_ToArray(str);
      if (ech && ech[0]) {
        if(ech[0].msg.indexOf('uccess')>-1){
          showToaster( [ech[0].msg], 'success');
        }
        else{
          showToaster( [ech[0].msg], 'error');
        }
        
        dispatch({ type: ACTIONS.MAINID, payload: Number(ech[0]) });
        
      }
    }
  };



  const { data, refetch } = useQuery({
    queryKey: ["svQry", state.mainId, state.rndm],
    queryFn: handleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });

  function clrFunct() {
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    navigate("/")
  }

   return (
    <>
       {/* <HcfHeader></HcfHeader> */}
      <div className='px-3 pb-10 '>
      <div className="bg-white" style={{ minHeight: '100vh' }}>
        <form className="" action="#">
          <div className="grid grid-cols-3 my-2 gap-4">
            <div className="mb-2">
              <WtrInput
                Label='HCF Label Number'
                fldName='usrid'
                displayFormat="1"
                idText='txtcde'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter HCF Label Number'}
                delayClose={1000}
                placement='bottom'
                ClssName='' ></WtrInput>
            </div>
            <div className="mb-2">
              <WtrInput
                Label='New password'
                displayFormat="1"
                fldName='npwd'
                idText='txtcde'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                unblockSpecialChars={true}
                upprCase={false}
                inputType="password"
                validateFn='[psw]'
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter New password'}
                delayClose={1000}
                placement='bottom'
                ClssName='' ></WtrInput>
            </div>

            <div className="mb-2">
              <WtrInput
                Label='Retype New password'
                displayFormat="1"
                fldName='rnpwd'
                idText='txtcde'
                onChange={onChangeDts}
                dsabld={false}
                inputType="password"
                callFnFocus=''
                unblockSpecialChars={true}
                dsbKey={false}
                upprCase={false}
                validateFn='[psw]'
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter New password'}
                delayClose={1000}
                placement='bottom'
                ClssName='' ></WtrInput>
            </div>
          </div>
          
          {showMessage && showMessage.message.length != 0 ? <div className="relative py-2">
            <Toaster data={showMessage} className={''}></Toaster>
          </div> : <></>}
          <div className="flex justify-center my-7">
            <div className="mx-4">
              <Button
                size="medium"
                style={{ backgroundColor: "#3B71CA",  textTransform: "none"}}
                variant="contained"
                color="success"
                onClick={saveClick}>
                Save
              </Button>
            </div>
            <div className="mx-4">
              <Button
                size="medium"
                style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
                variant="contained"
                color="success"
                disabled={!state.disableA}
                onClick={()=>navigate("/trckbmw")}>
                Cancel
              </Button>
            </div>
          </div>
        </form>

      </div>
      </div>
    </>
   )

};

export default React.memo(ChangePasswordCbwtf);

import React, { useReducer, useState } from "react";
import axios from "axios";
import { validForm } from "../../Hooks/validForm";
import { useQuery } from "@tanstack/react-query";
// import { Formik, FormikHelpers, FormikProps, Form, Field,FieldProps,} from "formik";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  generateRandomStringForPassword,
  getUsrId,
  hashPassword,
  passwordRegex,
  postLinux,
} from "../../utilities/utilities";
import {
  Button
} from "@mui/material";
import logo1 from "../../app/assests/cpcblogo.png" //"app/assests/cpcblogo.png"

import { nrjAxios, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import { getFldValue } from "../../Hooks/useGetFldValue";
import WtrInput from "../../components/reusable/nw/WtrInput";
import { Toaster } from "../../components/reusable/Toaster";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useEffectOnce } from "react-use";
import HdrDrp from "../HdrDrp";
import { useToaster } from "../../components/reusable/ToasterContext";
import { nrjAxiosRequestLinux } from "src/Hooks/useNrjAxios";


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

const ChangePassword = () => {

  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState<any>({ message: [] })
  const [searchParams, setSearchParams] = useSearchParams();
  const reqFlds = [
    { fld: 'usrid', msg: 'Enter User Name', chck: '1[length]' },
    { fld: 'cpwd', msg: 'Enter Old password', chck: '1[length]' },
    { fld: 'npwd', msg: 'Enter New password', chck: '[psw]' },
    { fld: 'rnpwd', msg: 'Enter New password Again', chck: '[psw]' },
  ];
  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };

  //#############Function calls


  const onChangeDts = (data: string) => {
    let value = data.split('][')
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const [showNavigation, setShowNavigation] = useState(true);

  useEffectOnce(() => {
    let path = searchParams.get("login") || '';
    if (path == 'false') {
      setShowNavigation(false);
      sessionStorage.removeItem('who');
    }
  })


  const handleSaveClick = () => {
    let username = GetDataValue(state.textDts, 'usrid');
    let npwd = GetDataValue(state.textDts, 'npwd');
    let what = "update_password"
    let oldpsw = getFldValue(state.textDts, 'cpwd')
    let reTypepwd = GetDataValue(state.textDts, 'rnpwd');
    if (npwd && oldpsw && reTypepwd) {
      npwd = btoa(npwd);
      oldpsw = btoa(oldpsw);
      reTypepwd = btoa(reTypepwd);

      const randomPrefix = generateRandomStringForPassword(10);
      const randomSuffix = generateRandomStringForPassword(25);
      // Combine random strings with the password
      const combinedStringNpwd = randomPrefix + npwd + randomSuffix;
      const combinedStringOldpsw = randomPrefix + oldpsw + randomSuffix;
      const combinedStringreTypepwd = randomPrefix + reTypepwd + randomSuffix;

      // Encode the entire combined string in Base64 again
      npwd = btoa(combinedStringNpwd);
      oldpsw = btoa(combinedStringOldpsw);
      reTypepwd = btoa(combinedStringreTypepwd);
    }

    //   if (npwd !== "" && oldpsw !=="" && reTypepwd) {
    //     // Hash the password using SHA-512
    //     (async () => {
    //       npwd = await hashPassword(npwd); 
    //       oldpsw = await hashPassword(oldpsw);
    //       reTypepwd = await hashPassword(reTypepwd);
    //     })();
    // }
    const payload: any = postLinux(what + '|' + username + '|' + oldpsw + '|' + npwd, "saverecord");
    console.log(payload)
    return nrjAxiosRequestBio("saverecord", payload);
  };
  const { showToaster, hideToaster } = useToaster();

  const saveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);

    let pwd1 = GetDataValue(api, 'npwd');
    let pwd2 = GetDataValue(api, 'rnpwd');
    if (pwd1 != pwd2) {
      showToaster(["passwords do not match!"], 'error')
      return;
    }
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg })
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetch();
  };

  const svdQry = (data: any) => {
    let ech: any;
    if (state.disableA == 0) {
      dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    }

    let dt: any = GetResponseLnx(data);

    if (dt.status == "Success") {
      setShowMessage({ message: ['Password changed successfully!'], type: 'success' });
      // Optional: Wait a moment to let user see message
    setTimeout(async () => {
      try {
        await logoutApi(); // Call your logout API
      } catch (err) {
        console.error("Logout API failed", err);
      } finally {
        // Clear session and redirect to login page
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/login'; // adjust path if needed
      }
    }, 1500); // 1.5 second delay before logout
    }
    else {
      // setShowMessage({ message: ['Something went wrong!! please try again'], type: 'error' });
      setShowMessage({ message: [dt.message || 'Something went wrong!! Please try again'], type: 'error' });
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
    navigate("/dashboardvb")
  }

    function logoutApi() {
      let base64Data = sessionStorage.getItem('isLoggedOut') || "";
      let jsonData = atob(base64Data);
      if (jsonData) {
        let data = JSON.parse(jsonData);
        let payload: any = postLinux('M/SSM110041DLCDG6042' + "=" + '22ffd3cb69804c3ba561aee92606f4bc', "logout");
        return nrjAxiosRequestLinux('logout', payload);
      } else {
        showToaster(["Please try again !!!"], 'error');
      }
    }

  if (showNavigation == true) return (
    <>
      <div className="bg-white" style={{ minHeight: '100vh' }}>
        {/* <div>
          <HdrDrp hideHeader={false}></HdrDrp>
        </div>
        <span className="text-center text-bold text-blue-600/75 my-4">
          <h5>Change Password</h5>
        </span> */}

        <form className="space-y-4 md:space-y-6 px-12" action="#" autoComplete="off">
          <div className="grid grid-cols-2 lg:grid-cols-4 my-2 gap-4 py-12 mt-4">
            <div className="mb-2">
              <WtrInput
                Label='User Name'
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
                speaker={'Enter User Name'}
                delayClose={1000}
                placement='bottom'
                autoComplete="off"
                ClssName='' ></WtrInput>
            </div>
            {/* <div className="mb-2">
              <WtrInput
                displayFormat="1"
                Label="Old Password"
                fldName="cpwd"
                idText="txtcpwd"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                unblockSpecialChars={true}
                upprCase={false}
                validateFn="1[length]"
                allowNumber={false}
                inputType="text"
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={"Enter old password"}
                delayClose={1000}
                showErrorMsgAbsolute={true}
                placement="bottom"
                ClssName=""
              ></WtrInput>
            </div> */}

            <div className="mb-2">
              <WtrInput
                displayFormat="1"
                Label="Old password"
                fldName="cpwd"
                idText="txtcpwd"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                unblockSpecialChars={true}
                upprCase={false}
                validateFn="1[length]"
                allowNumber={false}
                inputType="password"
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                delayClose={1000}
                showErrorMsgAbsolute={true}
                placement="bottom"
                ClssName=""
                speaker={"Enter old password"}
                autoComplete="new-password" // Prevents browser autofill
              ></WtrInput>
            </div>


            <div className="mb-2">
              <WtrInput
                displayFormat="1"
                Label="New password"
                fldName="npwd"
                idText="txtnpwd"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                unblockSpecialChars={true}
                upprCase={false}
                validateFn="1[length]"
                allowNumber={false}
                inputType="password"
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                delayClose={1000}
                showErrorMsgAbsolute={true}
                placement="bottom"
                ClssName=""
                speaker={"Enter New password"}
              ></WtrInput>
            </div>

            <div className="mb-2">
              <WtrInput
                displayFormat="1"
                Label="Retype New password"
                fldName="rnpwd"
                idText="txtrnpwd"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                unblockSpecialChars={true}
                upprCase={false}
                validateFn="[psw]"
                allowNumber={false}
                inputType="password"
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={"Enter Retype New password"}
                delayClose={1000}
                showErrorMsgAbsolute={true}
                placement="bottom"
                ClssName=""
              ></WtrInput>
            </div>
          </div>

          {showMessage && showMessage.message.length != 0 ? <div className="py-2">
            <Toaster data={showMessage} className={''}></Toaster>
          </div> : <></>}
          <div className="flex justify-center my-7">
            <div className="mx-4">
              <Button
                size="medium"
                style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
                variant="contained"
                color="success"
                onClick={saveClick}>
                Save
              </Button>
            </div>
            <div className="mx-3">
              <Button
                size="medium"
                style={{ color: '#3B71CA', backgroundColor: "#fff" , textTransform: "none"}}
                variant="contained"
                color="success"
                disabled={!state.disableA}
                onClick={() => navigate("/dashboardvb")}>
                Cancel
              </Button>
            </div>
          </div>
        </form>

      </div>

    </>)
  else return (
    <>
      <div>
        <section className="bg-gray-50 daark:bg-gray-900">
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a
              href="#"
              className="flex items-center mb-6 text-2xl font-semibold text-gray-900 daark:text-white"
            >
              <img
                className="w-8 h-8 mr-2"
                src={logo1}
                alt="CPCB"
              />
              Central Pollution Board
            </a>
            <div className="w-full bg-white rounded-lg shadow-lg daark:border md:mt-0 sm:max-w-md xl:p-0 daark:bg-gray-800 daark:border-gray-700">
              {/* <Toaster data={showMessage}></Toaster> */}
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl daark:text-white">
                  CBST-BMW
                </h1>
                <form className="space-y-4 md:space-y-6 grid grid-cols-3" action="#">
                  <div className="mb-2">
                    <WtrInput
                      Label='User Name'
                      fldName='usrid'
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
                      speaker={'Enter User Name'}
                      delayClose={1000}
                      placement='bottom'
                      ClssName='' ></WtrInput>
                  </div>
                  <div className="mb-2">
                    <WtrInput
                      displayFormat="1"
                      Label="New password"
                      fldName="nwpsw"
                      idText="txtnwpsw"
                      onChange={onChangeDts}
                      dsabld={false}
                      callFnFocus=""
                      dsbKey={false}
                      unblockSpecialChars={true}
                      upprCase={false}
                      validateFn="[psw]"
                      allowNumber={false}
                      inputType="password"
                      selectedValue={state.frmData}
                      clrFnct={state.trigger}
                      speaker={""}
                      delayClose={1000}
                      showErrorMsgAbsolute={true}
                      placement="bottom"
                      ClssName=""
                    ></WtrInput>
                  </div>

                  <div className="mb-2">
                    <WtrInput
                      displayFormat="1"
                      Label="New password"
                      fldName="nwpsw"
                      idText="txtnwpsw"
                      onChange={onChangeDts}
                      dsabld={false}
                      callFnFocus=""
                      dsbKey={false}
                      unblockSpecialChars={true}
                      upprCase={false}
                      validateFn="[psw]"
                      allowNumber={false}
                      inputType="password"
                      selectedValue={state.frmData}
                      clrFnct={state.trigger}
                      speaker={""}
                      delayClose={1000}
                      showErrorMsgAbsolute={true}
                      placement="bottom"
                      ClssName=""
                    ></WtrInput>
                  </div>
                  {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                    <Toaster data={showMessage} className={''}></Toaster>
                  </div> : <></>}
                  <div className="flex justify-center my-7">
                    <div className="mx-4">
                      <Button
                        size="medium"
                        style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
                        variant="contained"
                        color="success"
                        onClick={saveClick}>
                        disabled={!state.disableA}
                        Save
                      </Button>
                    </div>
                    <div className="mx-4">
                      <Button
                        size="medium"
                        style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
                        variant="contained"
                        color="success"

                        onClick={clrFunct}>
                        Cancel
                      </Button>
                    </div>
                  </div>


                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );


};

export default React.memo(ChangePassword);

import React, { useReducer, useState } from "react";
import { validForm } from "../../Hooks/validForm";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  generateRandomStringForPassword,
  getCmpId,
  getUsrId,
  hashPassword,
  postLinux,
} from "../../utilities/utilities";
import { Button, SvgIcon, Typography } from "@mui/material";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { nrjAxios, nrjAxiosRequestBio, useNrjAxios } from "../../Hooks/useNrjAxios";
import Hdr from "../Hdr";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import { useNavigate } from "react-router";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import { Toaster } from "../../components/reusable/Toaster";
import { getLvl, getWho } from "../../utilities/cpcb";
import WtrInput from "../../components/reusable/nw/WtrInput";
import { useToaster } from "../../components/reusable/ToasterContext";
import { useEffectOnce } from "react-use";

const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chkrdn",
  DISABLE: "disable",
  SETRGDCOMBO: "setRgdCombo",

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
  disableA: 1,
  disableB: 1,
  disableC: 1,
  rgdCombo: "",

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
  disableA: number,
  disableB: number,
  disableC: number,

  rgdCombo: string;

};

type act = {
  type: string;
  payload: any;
};

const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.MAINID:
      newstate.mainId = action.payload;
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
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.RANDOM:
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.FORM_DATA:
      let dtaF: string = "";
      let fldNF: any = utilities(2, action.payload, "");
      if (newstate.textDts) {
        dtaF = newstate.textDts + "=";
        let d: any = utilities(1, dtaF, fldNF);
        if (d) {
          dtaF = d;
        } else {
          dtaF = "";
        }
      }
      dtaF += action.payload;
      newstate.textDts = dtaF;
      newstate.frmData = dtaF;
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
    case ACTIONS.SETRGDCOMBO:
      newstate.rgdCombo = action.payload;
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

//

const ChangePswRgd = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const who: string = getWho() == 'CENTRAL' ? '0' : getWho();
  const reqFlds = [
    { fld: "rgdid", msg: "Select Regional Directorate", chck: "1[length]" },
    { fld: "nwpsw", msg: "Enter a valid password", chck: "[psw]" },
  ];


  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const [isLoading, setIsLoading] = useState("");
  const [encValidation, setEncValidation] = useState("")

  const rowData: any = [];
  const onRowSelected = (data: string) => {
    // alert(data)
  };
  const onButtonClicked = (action: string, rw: any) => {

  }
  const GridLoaded = () => { };

  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  };

  const [rgdValue, setRgdValue] = useState<string>("");

  const onChangeRgd = (data: string) => {
    setRgdValue(getFldValue(data, 'rgdid').split('|')[0])
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const getUserIdPassword = (rgdValue: string) => {
    if (rgdValue) {
      const payload: any = postLinux('RGD' + '=' + rgdValue, "get_login_cred");
      return nrjAxiosRequestBio("get_login_cred", payload);
    } else {
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: `rgdid][=rgd][=usrnm][ =psw][ =` })
    }
  }

  const getUserIdPasswordSuccess = (data: any) => {
    let dt: any = GetResponseLnx(data);
    let rgdValue = getFldValue(state.textDts, 'rgdid').split("|");

    if (dt) {
      if (dt.psw) {
        setEncValidation(dt.psw)
      } else {
        setEncValidation("")
      }
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: `rgdid][${rgdValue[0]}=rgd][${rgdValue[1]}=usrnm][${dt.usernm}=psw][${dt.psw}` })
    }
    else {
      showToaster(['Something went wrong! please try again'], 'error')
    }

  }


  const { data: data1, refetch: refechSaveClick } = useQuery({
    queryKey: ["svQry", rgdValue],
    queryFn: () => getUserIdPassword(rgdValue),
    enabled: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: getUserIdPasswordSuccess,
  });

  useEffectOnce(() => { refechSaveClick() })


  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const HandleSaveClick = () => {
    setIsLoading("Loding Data...")
    let api: string = state.textDts;
    let what = "update_password"
    let usr = getUsrId()
    let usernm = getFldValue(api, 'usrnm')
    let nwpsw = getFldValue(api, 'nwpsw')
    if (nwpsw) {
      nwpsw = btoa(nwpsw);
      const randomPrefix = generateRandomStringForPassword(10);
      const randomSuffix = generateRandomStringForPassword(25);
      // Combine random strings with the password
      const combinedString = randomPrefix + nwpsw + randomSuffix;
      // Encode the entire combined string in Base64 again
      nwpsw = btoa(combinedString);
    }

   


  //   if (nwpsw !== "") {
  //     // Hash the password using SHA-512
  //     (async () => {
  //         nwpsw = await hashPassword(nwpsw); // Wait for the SHA-512 hash
  //     })();
  // }
  
    let payload: any;
    payload = postLinux(what + '=' + usernm + '=' + encValidation + '=' + nwpsw, "saverecord");
    payload["oldpsw"] = encValidation ? encValidation : "";
    payload["nwpsw"]=nwpsw ?nwpsw:''
    return nrjAxiosRequestBio("saverecord", payload);
  };

  const svdQry = (data: any) => {
    setIsLoading("")
    if (state.disableA == 0) {
      dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    }

    let dt: any = GetResponseLnx(data);

    if (dt.status == "Success") {
      setShowMessage({ message: ['Password changed successfully!'], type: 'success' });
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
      setTimeout(() => {
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
        dispatch({ type: ACTIONS.NEWROWDATA, payload: data });
      }, 300);
    }
    else {
      setShowMessage({ message: ['Something went wrong!! please try again'], type: 'error' });
    }
  };

  const { data, refetch } = useQuery({
    queryKey: ["svQry", state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });
  const { showToaster, hideToaster } = useToaster();
  const saveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);

    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetch();
  }

  const GetDataRgd = () => {
    let payload: any = {};
    return nrjAxiosRequestBio('rgdlst', payload);
  };

  const rgdCombo = (datastt: any) => {
    if (datastt && datastt.status == 200 && datastt.data) {
      let i: number = 0;
      let strCmbo: string = "";
      let dt: any = GetResponseLnx(datastt);
      let ary: any = dt.data;
      while (Array.isArray(ary) && i < ary.length) {
        if (strCmbo) {
          strCmbo += "$^";
        }
        strCmbo += "id][" + ary[i]["drpdwn"] + "=";
        strCmbo += "txt][" + ary[i]["drpdwn"];
        i += 1;
      }
      dispatch({ type: ACTIONS.SETRGDCOMBO, payload: strCmbo });
      return;
    }
  };


  const { data: datac, refetch: fetchRgd } = useQuery({
    queryKey: ["GetDataRgd"],
    queryFn: GetDataRgd,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: rgdCombo,
  });

  useEffectOnce(() => {
    fetchRgd();
  })

  return (
    <>
      <div className="bg-white">
        <div className="shadow rounded-lg px-4 pt-4 w-full">
          <div className="grid grid-cols-4 items-center px-5 py-8">
            <div className="">
              <WtrRsSelect
                Label="Regional Directorate"
                fldName="rgdid"
                idText="txtrgdid"
                onChange={onChangeRgd}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                loadOnDemand={state.rgdCombo}
                allwZero={"0"}
                fnctCall={false}
                dbCon={"1"}
                typr={"1"}
                dllName={""}
                fnctName={""}
                parms={'0'}
                allwSrch={true}
                speaker={"Select Regional Directorate"}
                delayClose={1000}
                placement="bottom"
                displayFormat="1"
              ></WtrRsSelect>
            </div>
            <div className="ml-4">
              <WtrInput
                displayFormat="1"
                Label="User Id"
                fldName="usrnm"
                idText="txtusrnm"
                onChange={onChangeDts}
                dsabld={true}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn=""
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={""}
                delayClose={1000}
                placement="bottom"
                ClssName=""
              ></WtrInput>
            </div>

            <div className="ml-4">
              <WtrInput
                displayFormat="1"
                Label="Current password"
                fldName="psw"
                idText="txtpsw"
                inputType="password"
                onChange={onChangeDts}
                dsabld={true}
                callFnFocus=""
                dsbKey={false}
                unblockSpecialChars={true}
                upprCase={false}
                validateFn=""
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={""}
                delayClose={1000}
                placement="bottom"
                ClssName=""
              ></WtrInput>
            </div>

            <div className="ml-4 ">
              <WtrInput
                displayFormat="1"
                Label="New password"
                fldName="nwpsw"
                idText="txtnwpsw"
                inputType="password"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                unblockSpecialChars={true}
                upprCase={false}
                validateFn="[psw]"
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={""}
                delayClose={1000}
                showErrorMsgAbsolute={true}
                placement="bottom"
                ClssName=""
              ></WtrInput>
            </div>
            <div>

            </div>
            <div>

            </div>

          </div>

          <div className="mt-10 flex justify-center w-full pb-12">
            <Button
              size="medium"
              style={{ backgroundColor: "#3490dc", color: '#fff', textTransform: "none" }}
              variant="contained"
              color="success"
              onClick={saveClick}
              className="mx-3"
              disabled={!state.disableA}
            >
              Save
            </Button>
            <div className="mx-4">
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

        </div>
        {showMessage && showMessage.message.length != 0 ? <div className="py-2">
          <Toaster data={showMessage} className={''}></Toaster>
        </div> : <></>}
      </div>

    </>

  );
};

export default React.memo(ChangePswRgd);

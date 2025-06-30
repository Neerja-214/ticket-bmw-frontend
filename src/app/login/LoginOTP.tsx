import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useReducer, useRef, useState } from "react";

import { useGetFldValue } from "../../Hooks/useGetFldValue";
import { useNrjAxios } from "../../Hooks/useNrjAxios";
import { validForm } from "../../Hooks/validForm";
import utilities, { svLnxSrvr, createGetApi } from "../../utilities/utilities";
import NrjInptSlctr from "../../components/reusable/NrjInptSlctr";
import NrjInpto from "../../components/reusable/NrjInpto";
import {
  Accordion,
  Button,
  Card,
  CardContent,
  SvgIcon,
  Typography,
} from "@mui/material";

import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router";
const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  GID: "frmdata",
  FORM_DATA: "setfrmda",
  SETFORM_DATA: "setfrmdata",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
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
      return newstate;
    case ACTIONS.RANDOM:
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.GID:
      newstate.gid = action.payload;
      return newstate;
    case ACTIONS.FORM_DATA:
      newstate.textDts = action.payload;
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
const LoginOTP = () => {
  // sessionStorage.removeItem("cmpid")
  // sessionStorage.removeItem("usrid")

  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate()
  const reqFlds = [{ fld: "eml", msg: "Enter E Mail ID", chck: "length" }];
  const reqFldsB = [{ fld: "otp", msg: "Enter OTP", chck: "length" }];
  
  
  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  };
  //#############Function calls
  const onChangeDts = (data: string) => {
    let dta: string = "";
    let fldN: any = utilities(2, data, "");
    if (state.textDts) {
      // (dta = state), textDts + "=";
      let d: any = utilities(1, dta, fldN);
      if (d) {
        dta = d;
      } else {
        dta = "";
      }
    }
    dta += data;
    dispatch({ type: ACTIONS.FORM_DATA, payload: dta });
  };

  const HandleSaveClick = () => {
    let api: string = state.textDts;
    api = GetDataValue(api, "eml");
    api = createGetApi("dll=accdll|fnct=c254|db=nodb", api + "|" + state.gid);
    return useNrjAxios({ apiCall: api });
  };

  const SaveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    //console.log(msg)
    if (msg && msg[0]) {
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      return;
    }
    HandleSaveClick()
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    refetch();
  };

  const CheckOtp = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFldsB);
    //console.log(msg)
    if (msg && msg[0]) {
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    refetchB();
  };

  const svdQry = (data: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    //ShowToast("E Mail with OTP Sent !!!")
    // let dt: string = "";
    // if (data && data.data && data.data[0] && data.data[0]["Status"]) {
    //   dt = data.data[0]["Status"];
    //   let ech: string[] = dt.split("#");
    //   if (ech && ech[0]) {
    //     dispatch({ type: ACTIONS.MAINID, payload: Number(ech[0]) });
    //     //setMainId(ech[0])
    //   }
    // }
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


  
  const FailedValidation = (msg : string) =>{
    ShowToast(msg)
  }

  const ShowToast = (msg: string) => {
    const options = {
      autoClose: 6000,
      type: toast.TYPE.INFO,
      hideProgressBar: false,
      position: toast.POSITION.TOP_RIGHT,
      pauseOnHover: true,
      progress: 0.2,
      // and so on ...
    };
    toast.success(msg, options);
  };
  const GetData = () => {
    let api: string = state.textDts;
    api = GetDataValue(api, "otp");
    api = createGetApi("dll=accdll|fnct=c255|db=nodb",  state.gid + '|' + api);
    
    return useNrjAxios({ apiCall: api });
  };

  const ShowData = (data: any) => {
    if (data && data.data && data.data[0] && data.data[0]["Data"]) {
      let dt: string = data.data[0]["Data"];
      if (dt.indexOf("][Valid")>-1){
        sessionStorage.setItem("lvl", "100")
        sessionStorage.setItem("lvlofc", "")
        sessionStorage.setItem("mainid", "")
    
        setTimeout(function(){
          navigate("/cntr")
        },800)
        
      }
      //setFrmData(dt);
    }
  };
  const { data: datab, refetch: refetchB } = useQuery({
    queryKey: ["getQry", state.mainId],
    queryFn: GetData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  useEffect(()=>{
    let gid : any;
    gid = utilities(3, "", "")
    let gd : string = gid;
    dispatch({type : ACTIONS.GID, payload : gd});
    sessionStorage.removeItem("cmpid")
    sessionStorage.removeItem("usrid")
  },[0])
  return (
    <div className="w-full flex shadow-lg" style={{backgroundImage:"url('https://e1.pxfuel.com/desktop-wallpaper/407/1022/desktop-wallpaper-website-backgrounds-login-page.jpg')", backgroundSize: "cover", backgroundRepeat: "no-repeat", height:"100vh", justifyContent: "center", alignItems:"center"}}>
      {/* <div className="w-full flex" style={{backgroundColor:"#bdbdbd", height:"100vh", justifyContent: "center", alignItems:"center"}}> */}
        {/* <div>
        <Hdr />
      </div> */}

    <div className="log-in1" style={{ marginTop: "0px", width:"25%"}}>
        <Card className="mt-0">
          <CardContent className="">
            <Typography gutterBottom variant="h5" component="div">
              <span className="log-in flex" style={{justifyContent: "center", alignItems:"center", height:"80px"}}>Sign in CPCB</span>
            </Typography>
          </CardContent>

          <div className="mb-5 flex" style={{justifyContent: "center", alignItems:"center", marginTop: "40px"}}>
          <NrjInpto
            Label="Enter Email ID"
            fldName="eml"
            idText="txteml"
            onChange={onChangeDts}
            dsabld={false}
            callFnFocus=""
            dsbKey={false}
            upprCase={false}
            validateFn="Enter Valid E Mail Address [email]"
            onFailedValidation={FailedValidation}
            allowNumber={false}
            selectedValue={state.frmData}
            clrFnct={state.trigger}
            speaker={"Email"}
            delayClose={1000}
            placement="right"
            ClssName=""
          ></NrjInpto>
        </div>

        <div className="flex" style={{ marginTop: "10px", justifyContent: "center", alignItems:"center" }}>
          <Button
            size="medium"
            style={{ backgroundColor: "#0F8EC6", textAlign: "center", width: "120px", marginBottom: "15px", textTransform: "none" }}
            variant="contained"
            color="success"
            disabled={!state.disableA}

            onClick={SaveClick}
            // startIcon={<SvgIcon></SvgIcon>}
          >
            Get OTP
          </Button>
        </div>

        
        <div className="mb-5 flex" style={{justifyContent: "center", alignItems:"center"}}>
          <NrjInpto
            Label="Enter OTP"
            fldName="otp"
            idText="txtotp"

            onChange={onChangeDts}
            dsabld={false}
            callFnFocus=""
            dsbKey={false}
            upprCase={false}
            validateFn=""
            allowNumber={false}
            selectedValue={state.frmData}
            clrFnct={state.trigger}
          ></NrjInpto>
        </div>
      
        <div className="flex" style={{ marginTop: "10px", justifyContent: "center", alignItems:"center" }}>
          <Button
            size="medium"
            style={{ backgroundColor: "#0F8EC6", textAlign: "center", width: "120px", marginBottom: "35px", textTransform: "none" }}
            variant="contained"
            color="success"
            disabled={!state.disableB}
            onClick={CheckOtp}
            // startIcon={<SvgIcon></SvgIcon>}
          >
            Verify OTP
          </Button>  
        </div>


        </Card>
      </div>
      


        
    </div>
  );
};

export default LoginOTP;


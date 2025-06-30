import React, { useReducer, useState } from "react";
import utilities, {
  cmboStrLrg,
  createGetApi,
  postLinux,
  convertFldValuesToJson,
  convertFldValuesToString,
  GetResponseLnx,
  getCmpId,
  getUsrnm,
  labelRegex,

} from "../../utilities/utilities";

import { useQuery } from "@tanstack/react-query";
import { useEffectOnce } from "react-use";
import { nrjAxiosRequestBio, nrjAxiosRequestLinux, useNrjAxios } from "../../Hooks/useNrjAxios";
import WtrInput from "../../components/reusable/nw/WtrInput";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import SaveIcon from "@mui/icons-material/Save";
import { validForm } from "../../Hooks/validForm";
import { Toaster } from "../../components/reusable/Toaster";

import {
  Button,
  SvgIcon,
} from "@mui/material";
import { useGetFldValue } from "../../Hooks/useGetFldValue";
import RefreshIcon from "@mui/icons-material/Refresh";
import Tooltip from "@mui/material/Tooltip";
import { useToaster } from "../../components/reusable/ToasterContext";
import { getLvl, getWho } from "../../utilities/cpcb";

const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  SETFORM_DATAALL: "setfrmdataall",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  TRIGGER_FORMSLV: "trgfrmslv",
  TRIGGER_PINCD: "trgfrmpnc",
  FORM_DATASLV: "frmdataslv",
  SETSTATE: "sttsel",
  SETGID: "gd",
  DISABLE: "disable",
  NEWFRMDATA: "frmdatanw",
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  triggerpnc: 0,
  triggerSlv: 0,
  triggerCmbo: 0,
  textDts: "",
  textDtsSlv: "",
  mainId: 0,
  errMsg: [],
  openDrwr: false,
  frmData: "",
  mainIdSlv: 0,
  frmDataSlv: "",
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
  triggerpnc: number;
  triggerCmbo: number;
  triggerSlv: number;
  textDts: string;
  textDtsSlv: string;
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
interface SttDetails {
  stt: string;
}



const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.MAINID:
      newstate.mainId = action.payload;
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.TRIGGER_GRID:
      newstate.triggerG = action.payload;
      return newstate;
    case ACTIONS.TRIGGER_FORM:
      newstate.trigger = action.payload;
      newstate.triggerpnc = action.payload;
      if (action.payload === 1) {
        newstate.textDts = "";
        newstate.frmData = "";
        newstate.mainId = 0;
        newstate.gid = "";
      }
      return newstate;
    case ACTIONS.TRIGGER_FORMSLV:
      newstate.trigger = action.payload;
      newstate.triggerpnc = action.payload;
      if (action.payload === 0) {
        newstate.frmData = "";
        newstate.mainId = 0;
        newstate.triggerpnc = 0;
        newstate.gid = "";
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
      return newstate;
    case ACTIONS.FORM_DATASLV:
      let dta: string = "";
      let fldN: any = utilities(2, action.payload, "");
      if (newstate.textDtsSlv) {
        dta = newstate.textDtsSlv + "=";
        let d: any = utilities(1, dta, fldN);
        if (d) {
          dta = d;
        } else {
          dta = "";
        }
      }
      dta += action.payload;
      newstate.textDtsSlv = dta;
      return newstate;
    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;

      return newstate;
    case ACTIONS.SETFORM_DATAALL:
      newstate.frmData = action.payload;
      newstate.textDts = action.payload;
      let d: any = utilities(1, action.payload, "id");
      if (d) {
        newstate.mainId = Number(d);
      }
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
    case ACTIONS.TRIGGER_PINCD:
      newstate.triggerpnc = action.payload;
      return newstate;
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
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

interface Values {
  cpcbof: string;
  cntp: string;
}

const CpchHoPg = () => {
  const initialValues: Values = { cpcbof: "", cntp: "" };

  let pnc: string = "";
  const [state, dispatch] = useReducer(reducer, initialState);
  const [cityList, setCityList] = useState("");
  const [selsttid, setSelSttid] = useState(-1);
  const reqFlds = [
    { fld: "cpcbof", msg: "Enter Name of Board", chck: "8[length]" },
    { fld: "ctyid", msg: "Select City", chck: "1[length]" },
    { fld: "sttid", msg: "Select State", chck: "1[length]" },
    { fld: "phn", msg: "Enter phone number", chck: "[mob]" },
    { fld: "eml", msg: "Enter email address", chck: "[email]" },
  ];

  // const reqFldsB = [
  //   { fld: "cntp", msg: "Enter Name of Contact person", chck: "length" },
  //   { fld: "dsgid", msg: "Select Designation", chck: "number" },
  // ];

  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  };
  //#############Function calls
  const onChangeDts = (data: string) => {
    let dta: string = "";
    let fldN: any = utilities(2, data, "");
    if (data.indexOf("sttid][") === 0) {
      dta = GetDataValue(data, "sttid");
      if (dta.indexOf("|") > -1) {
        let m: string[] = dta.split("|");
        dta = m[0];
      }
      if (dta && Number(dta)) {
        setSelSttid(Number(dta));
        setTimeout(function () {
          refetchD();
        }, 900);
      }

      dta = "";
    } else if (data.indexOf("pnc") > -1) {
      pnc = GetDataValue(data, "pnc");
      if (pnc && pnc.length == 6) {
        refetchF();
      }
    }
    // if (state.textDts) {
    //   dta = state.textDts + "=";
    //   let d: any = utilities(1, dta, fldN);
    //   if (d) {
    //     dta = d;
    //   } else {
    //     dta = "";
    //   }
    // }
    dta += data;
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };
  const GetGid = () => {
    let gd: string = state.gid;
    if (!gd) {
      let g: any = utilities("3", "", "");
      gd = g;
      dispatch({ type: ACTIONS.SETGID, payload: gd });
    }
    return gd;
  };
  const HandleSaveClick = () => {
    let formData:any = state.textDts;
    formData = convertFldValuesToJson(formData);
    formData['cmpid'] = getCmpId()||"";
    formData['usrnm'] = getUsrnm()||"";
    delete formData['_id']
    return nrjAxiosRequestBio("update_cpcb_details", formData)
  };
  const [showMessage, setShowMessage] = useState<any>([])
  const { showToaster, hideToaster } = useToaster();

  const SaveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
   
    if (msg && msg[0]) {
      showToaster( msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    refetch();
  };

  const svdQry = (data: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    let dt:any = GetResponseLnx(data);
    if(dt.status == 'Success'){
      showToaster([dt.message], 'success')
    }
    else{
      showToaster(['Something went wrong! please try again'], 'error')
    }
  };

  const GetCity = () => {
    let msg: string = cmboStrLrg("shrtrm", "790", "1", "", selsttid);
    return useNrjAxios({ apiCall: msg });
  };

  const lstCity = (data: any) => {
    let dt: string = "";

    let d: [] = data;

    if (data.data[0]["Data"]) {
      dt = data.data[0]["Data"];
      let ech: string[] = dt.split("#");
      setCityList(ech[0]);
    }
  };

  const { data: dataD, refetch: refetchD } = useQuery({
    queryKey: ["distrcmbo", selsttid],
    queryFn: GetCity,
    enabled: false,
    // staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: lstCity,
  });

  const { data, refetch } = useQuery({
    queryKey: ["svQry", state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });
  //######################## Select State on Pincode
  const GetState = () => {
    let api: string = createGetApi("db=nodb|dll=x|fnct=a125", pnc + "=stt");
    return useNrjAxios({ apiCall: api });
  };

  const StateSel = (dataF: any) => {
    // console.log(state.textDts + "After Call")
    if (dataF && dataF.data && dataF.data[0] && dataF.data[0]["Data"]) {
      let dtf: string = dataF.data[0]["Data"];
      let m: string[] = dataF.data[0]["Data"].split("|");
      if (m && m.length > 1) {
        dtf = "sttid][" + m[0] + "=stt][" + m[1];
        dispatch({ type: ACTIONS.SETFORM_DATA, payload: dtf });
        dispatch({ type: ACTIONS.FORM_DATA, payload: dtf });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });

        setSelSttid(Number(m[0]));
        setTimeout(function () {
          refetchD();
        }, 900);
      }
    } else {
      // dispatch({ type: ACTIONS.TRIGGER_PINCD, payload: 1 });
      // setTimeout(function () {
      //   dispatch({ type: ACTIONS.TRIGGER_PINCD, payload: 0 });
      // }, 500);
    }
  };

  const { data: dataF, refetch: refetchF } = useQuery({
    queryKey: ["svpn", state.rndm],
    queryFn: GetState,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: StateSel,
  });
  //########################

  //########################Slave

  //#############Function calls
  // const onChangeDtsB = (data: string) => {
  //   //dispatch({ type: ACTIONS.FORM_DATASLV, payload: data });

  //   dispatch({ type: ACTIONS.FORM_DATASLV, payload: data });
  // };
  const GetData = () => {
    let who = sessionStorage.getItem('who')
    let lvl = sessionStorage.getItem('lvl')
    let what = ''
        if (lvl == 'STT') {
            let sttDetails = sessionStorage.getItem('sttDetails')
            if (sttDetails) {
                const parsedSttDetails = JSON.parse(sttDetails) as SttDetails; // Parse and assert type
                who = parsedSttDetails.stt?parsedSttDetails.stt:''; // Access the stt property
            }

        }

    const payload: any = postLinux(lvl + '=' + who + '=' + what , "get_cpcb_details");  
        return nrjAxiosRequestLinux("get_cpcb_details", payload);

  };


  const ShowData = (data: any) => {
    
    if (data && data.data && data.data[0]) {
      let dt: string = data.data[0];
      if (dt) {
       let dataArray = convertFldValuesToString(dt)
       let id: string = GetDataValue(dataArray, "id");

        dispatch({ type: ACTIONS.MAINID, payload: Number(id) });
        // setTimeout(function () {
        //   //Call Contact list
        //   refetchE();
        // }, 500);
        dispatch({ type: ACTIONS.SETFORM_DATAALL, payload: dataArray });

      }
      //setFrmData(dt);
    }else{
     showToaster(["No data received"], "error");
    }
  };


  const { data: datab, refetch: refetchB } = useQuery({
    queryKey: ["getSlvData", state.mainId, state.rndm],
    queryFn: GetData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });


  useEffectOnce(() => {
    refetchB();
  });

  const clrFunct = () => {
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    setTimeout(() => {
      // console.log(state.frmData);
      // console.log(state.textDts);
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    }, 1000)
  }
  let label = "Board"
  if (getLvl() === "RGD") {
    label="Name of regional director"
  }
  else if (getLvl() === "STT") {
    label="Name of nodal officer"
  }


  return (
    <>
  
      <div className="bg-white">
        <div className="container-sm flex justify-end">
        <Tooltip title="Click to clear the old data">
          <Button variant="contained"
            style={{ color: "#3B71CA", backgroundColor: "#fff", textTransform: "none" }}
            onClick={clrFunct}
          >
            <SvgIcon component={RefreshIcon} />
          </Button>
          </Tooltip>
        </div>
        <div className="shadow rounded-lg">

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:m-3 lg:m-5">
            <div className="mb-2 mt-3">
              <WtrInput
                Label="Board"
                fldName="cpcbof"
                idText="txtcpcbof"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn="8[length]"
                allowNumber={false}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
                speaker="Enter Name of Board"
                delayClose={1000}
                placement="right"
                ClssName=""
                ToolTip="Enter Name of board without special characters "
              ></WtrInput>
            </div>
            <div className="mb-1 mt-3">
              <WtrInput
                Label="Address"
                fldName="adra"
                idText="txtadra"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn=""
                allowNumber={false}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
              ></WtrInput>
            </div>
            {/* <div className="mb-1 mt-3">
              <WtrInput
                Label="Address II"
                fldName="adrb"
                idText="txtadrb"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn=""
                allowNumber={false}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
              ></WtrInput>
            </div>
            <div className="mb-1">
              <WtrInput
                Label="Address III"
                fldName="adrc"
                idText="txtadrc"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn=""
                allowNumber={false}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
              ></WtrInput>
            </div> */}
            <div className="mb-1">
              <WtrInput
                Label="Pincode"
                fldName="pnc"
                idText="txtpnc"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                maxLength={6}
                dsbKey={false}
                upprCase={false}
                allowNumber={true}
                selectedValue={state.textDts}
                clrFnct={state.triggerpnc}
              ></WtrInput>
            </div>
            <div className="mb-1">
              <WtrRsSelect
                Label="State/UT"
                fldName="sttid"
                idText="txtsttid"
                onChange={onChangeDts}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
                allwZero="1"
                fnctCall={false}
                dbCon=""
                typr=""
                dllName=""
                fnctName=""
                parms=""
                allwSrch={true}
                speaker="Select the State"
                placement="bottom"
                delayClose={1000}
              ></WtrRsSelect>
            </div>
            <div className="mb-1">
              <WtrRsSelect
                Label="City"
                fldName="ctyid"
                idText="txtctyid"
                onChange={onChangeDts}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
                loadOnDemand={cityList}
                allwZero="1"
                fnctCall={false}
                dbCon=""
                typr=""
                dllName=""
                fnctName=""
                parms=""
                allwSrch={true}
                speaker="Select the City"
                delayClose={1000}
                placement="bottom"
              ></WtrRsSelect>
            </div>
            <div className="mb-1">
              <WtrInput
                Label="Contact person"
                fldName="cntp"
                idText="txtcntp"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn="6[length]"
                allowNumber={false}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
                delayClose={1000}
                speaker=""
                placement="bottom"
                ToolTip="Enter name of contact person without special characters "
              ></WtrInput>
            </div>
            <div className="mb-1">
              <WtrRsSelect
                Label="Designation"
                fldName="dsgid"
                idText="txtdsgid"
                onChange={onChangeDts}
                selectedValue={state.textDts}
                clrFnct={state.triggerCmbo}
                allwZero="1"
                fnctCall={false}
                dbCon=""
                typr=""
                dllName=""
                fnctName=""
                parms=""
                allwSrch={true}
                speaker=""
                delayClose={1000}
                placement="bottom"
              ></WtrRsSelect>
            </div>
            <div className="mb-1">
              <WtrInput
                Label="Phone number"
                fldName="phn"
                idText="txtphn"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn="[mob]"
                speaker="Enter phone number"
                allowNumber={true}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
              ></WtrInput>
            </div>
            <div className="mb-1">
              <WtrInput
                Label="E-mail id"
                fldName="eml"
                idText="txteml"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn="[email]"
                unblockSpecialChars={true}
                speaker="Enter a valid email address"
                allowNumber={false}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
              ></WtrInput>
            </div>
          </div>
          <div className="z-50">
            {showMessage.length != 0 &&
              <Toaster data={showMessage} className={''}></Toaster>
            }
          </div>
          <div className="flex justify-center py-7">
            <div className="mr-4">
              <Button
                size="medium"
                className="bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={!state.disableA}
                onClick={SaveClick}
                style={{ textTransform: "none"}}
              >
                Save
              </Button>
            </div>

            <div>
              {/* <Button
              size="medium"
              style={{ backgroundColor: "#3B71CA" }}
              variant="contained"
              color="success"
              endIcon={<RotateLeftIcon />}
              onClick={ClrFunct}
            >
              Reset
            </Button> */}
            </div>
          </div>

        </div>


      </div>
    </>
  );
};

export default React.memo(CpchHoPg);

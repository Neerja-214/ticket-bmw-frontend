import React, { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, SvgIcon } from "@mui/material";
import utilities, {
  GetResponseWnds,
  clrFldsExcptDrpDt,
  createGetApi,
  dataStr_ToArray,
  getApplicationVersion,
  svLnxSrvr,
} from "../../../utilities/utilities";
import { getFldValue } from "../../../Hooks/useGetFldValue";
import { nrjAxios } from "../../../Hooks/useNrjAxios";
import { validForm } from "../../../Hooks/validForm";
import WtrInput from "../../../components/reusable/nw/WtrInput";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { Toaster } from "../../../components/reusable/Toaster";
import { useNavigate } from "react-router";
import { useEffectOnce } from "react-use";
import HdrDrp from "../../HdrDrp";
import RefreshIcon from "@mui/icons-material/Refresh";
import Tooltip from "@mui/material/Tooltip";
import { useSearchParams } from "react-router-dom";
import { useToaster } from "../../../components/reusable/ToasterContext";

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
  DSBLDTEXT: "dsbld",
  DISABLE: "disable",
  NEWFRMDATA: "frmdatanw",
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
      newstate.gid = ""
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
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.DISABLE:
      if (newstate.disableA == 1) {
        newstate.disableA = 0
      } else {
        newstate.disableA = 1
      }
      return newstate
  }
};
//const [state, dispatch] = useReducer(reducer, initialState);





const Stt_Annlauth = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const isUppercase = sessionStorage.getItem('UpperCase') == '1' ? true : false;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statenm = searchParams.get('name');
  const reqFlds:any[] = [];
  const reqsFlds = [
    { fld: 'totappld', msg: 'Enter Total Number of Occupiers Applied', chck: 'length' },
    { fld: 'totauth', msg: 'Enter Total Number Authorized', chck: 'length' },
    { fld: 'wstgnr', msg: 'Enter Biomedical Waste Generated', chck: 'length' },
    { fld: 'wstgnrbd', msg: 'Enter Biomedical Waste Generated Bedded Hospital', chck: 'length' },
    { fld: 'wstgnrnn', msg: 'Enter Biomedical Waste Generated Non Beded', chck: 'length' },
    { fld: 'wsttrtd', msg: 'Enter Biomedical Waste Treated and Disposed', chck: 'length' }
  ];
  const coldef = [
    { field: 'id', hide: true, width: 0, headerName: '' },
    { field: 'totappld', hide: false, width: 150, headerName: 'Total No of Occupiers Applied' },
    { field: 'totauth', hide: false, width: 150, headerName: 'Total No Authorized' },
    { field: 'totcns', hide: false, width: 150, headerName: 'Total No Under Consideration' },
    { field: 'totrej', hide: false, width: 150, headerName: 'Total No Rejected' },
    { field: 'totnath', hide: false, width: 150, headerName: 'Total No in Operation without Authorization' },
    { field: 'wstgnr', hide: false, width: 150, headerName: 'Total Biomedical Waste Generated Kg/day' },
    { field: 'wstgnrbd', hide: false, width: 150, headerName: 'Total Biomedical Waste Generated Bedded Hospital Kg/day' },
    { field: 'wstgnrnn', hide: false, width: 150, headerName: 'Total Biomedical Waste Generated Non Bedded Kg/day' },
    { field: 'wstgnroth', hide: false, width: 150, headerName: 'Total Biomedical Waste Generated (Other) Kg/day' },
    { field: 'wsttrtd', hide: false, width: 150, headerName: 'Total Biomedical Waste Treated/Disposed Kg/day' },
    { field: 'capthcf', hide: false, width: 150, headerName: 'Health Care Facilities Captive Treatment' },
    { field: 'wsttrtdcpt', hide: false, width: 150, headerName: 'Total Biomedical Waste Treated/Disposed Captive HCF Kg/day' }
  ];




  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const HandleSaveClick = () => {
    let api: string = state.textDts;
    let mid = sessionStorage.getItem('annualrptid') || '';
    api = svLnxSrvr("", api, mid, "shrtrm", "cpc0spcb_auth", state.mainId, "");
    return nrjAxios({ apiCall: api });
  };
  const { showToaster, hideToaster } = useToaster();
  const svClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    showToaster( msg, 'error');
    if (msg && msg[0]) {
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetch();
  };

  const svdQry = (data: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    let ech: any[];
    let rspnse: string = data.data.Status;
    if (rspnse) {
      if (rspnse.indexOf("id][") > -1) {
        setShowMessage({
          message: ["Data Saved Successfully"],
          type: "success",
        });
        ech = rspnse.split("][");
        dispatch({ type: ACTIONS.MAINID, payload: Number(ech[1]) });
        dispatch({type: ACTIONS.TRIGGER_FORM, payload :1})
      }
    }
  };


  const { data, refetch } = useQuery({
    queryKey: ["svQryAnnlcbwtf", state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });
  
  useEffectOnce(() => {
    let oldid: string = sessionStorage.getItem("annualrptid") || "";
    if (oldid) {
      refetchOld();
    }
  });

 const GetList = () => {
   
  let oldid: string = sessionStorage.getItem("annualrptid") || "";
    if (oldid) {
      refetchOld();
    }
 }
  const GetSvData = () => {
    let oldid: string = sessionStorage.getItem("annualrptid") || "";
    let api: string = createGetApi(
      "db=nodb|fnct=102|dll=hospdll",
      oldid + "=slm1046"
    );
    return nrjAxios({ apiCall: api });
  };

  const ShowData = (dataSvd: any) => {
     
    let dt: string = GetResponseWnds(dataSvd);
    if (dt) {
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
    }
  };

  const { data: dataSvd, refetch: refetchOld } = useQuery({
    queryKey: ["svOldannlauth", state.mainId, state.rndm],
    queryFn: GetSvData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  const clrFunct = () => {
    let data: string = state.textDts;
    data = clrFldsExcptDrpDt(data)
    dispatch({ type: ACTIONS.NEWFRMDATA, payload: data })
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    }, 300)
  }

  const nxtClick = () => {
    navigate(`/spcb_dstr?name=${statenm}`);
  };
  const applicationVerion: string = getApplicationVersion();

  document.title = "State: Authorize";
  return (
    <div className="bg-white pb-12">
      {applicationVerion == '1' && <> <div>
        <HdrDrp hideHeader={false}></HdrDrp>
      </div>
      <span className="text-center text-bold text-blue-600/75">
        <h5>State Annual Report: Authorize </h5>
      </span></>}
      <div className="container-sm flex justify-end">

      <Tooltip title="Click to clear the old data">

        <Button variant="contained"
          style={{ color: "#3B71CA", backgroundColor: "#fff" }}
          onClick={clrFunct}
        >
          <SvgIcon component={RefreshIcon} />
        </Button>
        </Tooltip>
      </div>
      <div className="shadow rounded-lg">
        <div>
          <div className="flex justify-content-end mx-5 mt-3 pt-4">
          <Button
                  size="medium"
                  style={{ backgroundColor: "#3B71CA", textTransform: "none", }}
                  variant="contained"
                  color="success"
                  disabled={!state.disableC}
                  onClick={() => {
                    GetList();
                  }}
                >
                  Get old data
                </Button>
          </div>
          <div className="text-lg font-semibold text-center">
              {statenm}
            </div>
          <div className="grid md:grid-cols-1 mt-3 lg:grid-cols-2 ">

            <div className="mb-1">
              <WtrInput
                Label='Total No of Occupiers Applied'
                fldName='totappld'
                idText='txttotappld'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter Total Number of Occupiers Applied'}
                delayClose={1000}
                placement='right'
                ToolTip="Enter whole numbers only"

                ClssName='' ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Total No Authorized'
                fldName='totauth'
                idText='txttotauth'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter Total Number Authorized'}
                delayClose={1000}
                placement='bottom'
                ClssName=''               
                 ToolTip="Enter whole numbers only"
                ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Total No Under Consideration'
                fldName='totcns'
                idText='txttotcns'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn=''
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Total No Rejected'
                fldName='totrej'
                idText='txttotrej'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn=''
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Total No in Operation without Authorization'
                fldName='totnath'
                idText='txttotnath'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn=''
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Total Biomedical Waste Generated Kg/day'
                fldName='wstgnr'
                idText='txtwstgnr'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                allowDecimal={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter Biomedical Waste Generated'}
                delayClose={1000}
                ClssName='' 
                ToolTip="Enter  numbers only"></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Total Biomedical Waste Generated Bedded Hospital Kg/day'
                fldName='wstgnrbd'
                idText='txtwstgnrbd'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                allowDecimal={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter Biomedical Waste Generated Bedded Hospital'}
                delayClose={1000}
                ClssName='' 
                ToolTip="Enter numbers only"></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Total Biomedical Waste Generated Non Bedded Kg/day'
                fldName='wstgnr
                nn'
                idText='txtwstgnrnn'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                allowDecimal={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter Biomedical Waste Generated Non Beded'}
                delayClose={1000}
                ClssName='' 
                ToolTip="Enter numbers only"></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Total Biomedical Waste Generated (Other) Kg/day'
                fldName='wstgnroth'
                idText='txtwstgnroth'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                allowDecimal={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Total Biomedical Waste Treated/Disposed Kg/day'
                fldName='wsttrtd'
                idText='txtwsttrtd'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn=''
                allowNumber={true}
                allowDecimal={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter Biomedical Waste Treated and Disposed'}
                delayClose={1000}
                ClssName='' 
                ToolTip="Enter numbers only"></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Health Care Facilities Captive Treatment'
                fldName='capthcf'
                idText='txtcapthcf'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn=''
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                ToolTip="Enter  numbers only"
              ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label='Total Biomedical Waste Treated/Disposed Captive HCF Kg/day'
                fldName='wsttrtdcpt'
                idText='txtwsttrtdcpt'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                allowDecimal={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                ToolTip="Enter  numbers only"
              ></WtrInput>
            </div>

          </div>
        </div>


        {showMessage && showMessage.message.length != 0 ? <div className="py-2">
          <Toaster data={showMessage} className={''}></Toaster>
        </div> : <></>}
        <div className="flex justify-center py-7">
          <div className="mr-4">
            <Button
              size="medium"
              style={{ color: '#38a169', backgroundColor: "#fff",textTransform: "none", }}
              variant="contained"
              color="success"
              disabled={!state.disableA}
              onClick={() => { navigate('/spcb_cbwtf') }}
            >
              Previous
            </Button>
          </div>
          <div className="mr-4">
            <Button
              size="medium"
              style={{ backgroundColor: "#3B71CA" ,textTransform: "none",}}
              variant="contained"
              color="success"
              disabled={!state.disableA}
              startIcon={<SaveIcon />}
              onClick={svClick}
            >
              Submit
            </Button>
          </div>
          {/* <div className="mr-4">
            <Button
              size="medium"
              style={{ color: "#3B71CA", backgroundColor: "#fff" }}
              variant="contained"
              color="success"
              disabled={!state.disableA}
              startIcon={<SaveIcon />}
              onClick={clrFunct}
            >
              Reset Form
            </Button>
          </div> */}
          <div className="mr-4">
          <Tooltip title="Click to continue">

            <Button
              size="medium"
              style={{ color: '#38a169', backgroundColor: "#fff",textTransform: "none", }}
              variant="contained"
              color="success"
              onClick={nxtClick}>
              Next
            </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}; export default React.memo(Stt_Annlauth);

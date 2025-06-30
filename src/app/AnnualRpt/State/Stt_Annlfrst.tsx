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
import { nrjAxios, useNrjAxios } from "../../../Hooks/useNrjAxios";
import { validForm } from "../../../Hooks/validForm";
import WtrInput from "../../../components/reusable/nw/WtrInput";
import WtrRsSelect from "../../../components/reusable/nw/WtrRsSelect";
import SaveIcon from "@mui/icons-material/Save";
import { Toaster } from "../../../components/reusable/Toaster";
import NrjChkbx from "../../../components/reusable/NrjChkbx";
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
  disableA: number;
  disableB: number;
  disableC: number;
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
      if(action.payload == 1){
        if (newstate.disableA == 1) {
          newstate.disableA = 0;
        } else {
          newstate.disableA = 1;
        }
      }
      else if(action.payload == 2){
        if (newstate.disableB == 1) {
          newstate.disableB = 0;
        } else {
          newstate.disableB = 1;
        }
      }
      
      return newstate;
  }
};
//const [state, dispatch] = useReducer(reducer, initialState);

const Stt_Annlfrst = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const [showMessage1, setShowMessage1] = useState<any>({ message: [] });
  const isUppercase = sessionStorage.getItem("UpperCase") == "1" ? true : false;
  const navigate = useNavigate();
  const reqFlds: any[] = [];
  const [searchParams, setSearchParams] = useSearchParams();
  const statenm = searchParams.get('name');
  const reqsFlds = [
    { fld: "anlstid", msg: "Select State For Report", chck: "number" },
    { fld: "spcorg", msg: "Enter Name of State Organization", chck: "1[length]" },
    { fld: "spcnodf", msg: "Enter Name of Nodal Officer", chck: "1[length]" },
    { fld: "nodfphn", msg: "Enter Contact No. of Nodal Officer", chck: "1[length]" },
    { fld: "nodfeml", msg: "Enter e-mail id of Nodal Officer", chck: "1[length]" },
    { fld: "tothcf", msg: "Enter Total Number of HCF", chck: "1[length]" },
    { fld: "totbdh", msg: "Enter Total Number Bedded of HCF", chck: "1[length]" },
    {
      fld: "totcld",
      msg: "Enter Total Number of Clinical Dispensary",
      chck: "length",
    },
    { fld: "totbeds", msg: "Enter Total No of Beds", chck: "length" },
  ];

  const dt_rpt = searchParams.get('dt');
  const sttid = searchParams.get('id');

  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };

  const onChangeDts = (data: string) => {

    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const HandleSaveClick = () => {
    let api: string = state.textDts;

    let mid = sessionStorage.getItem("annualrptid") || "";
    api = svLnxSrvr("", api, mid, "shrtrm", "cpc0spcb_frst", state.mainId, "");
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
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    refetch();
  };

  const svdQry = (data: any) => {
    if (state.disableB == 0) {
      dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    let ech: any[];
    let rspnse: string = data.data.Status;
    if (rspnse) {
      if (rspnse.indexOf("id][") > -1) {
        setShowMessage({
          message: ["Data Saved Successfully"],
          type: "success",
        });
        ech = rspnse.split("][");
        sessionStorage.setItem("annualrptid", ech[1]);
        dispatch({ type: ACTIONS.MAINID, payload: Number(ech[1]) });
      }
      dispatch({ type: ACTIONS.CHECK_REQ, payload: "Data Update" });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
    }
  };

  const { data, refetch } = useQuery({
    queryKey: ["svQryAnnlfrst", state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });

  const FndDts = () => {

    let api: string = state.textDts;
    api = getFldValue(api, "anlstid")
    if (api) {
      refetchCP()
    }
  }


  const GetCPCB = () => {
    let api: string = state.textDts;
    api = getFldValue(api, "anlstid")
    let ech: any = api.split("|")
    api = ech[1]
    api = createGetApi("db=nodb|fnct=a171|dll=x", api);
    return useNrjAxios({ apiCall: api })
  }

  const MyList = (dataCP: any) => {
    dispatch({ type: ACTIONS.RANDOM, payload: 1 })

  }

  const { data: dataCP, refetch: refetchCP } = useQuery({
    queryKey: ["svCPCB", state.mainId, state.rndm],
    queryFn: GetCPCB,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: MyList,
  });

  useEffectOnce(() => {
    let oldid: string = sessionStorage.getItem("annualrptid") || "";
    if (oldid) {
      refetchOld();
    }
    else{
      refetchOld1();
    }
  });

  const GetSvData = () => {
    let oldid: string = sessionStorage.getItem("annualrptid") || "";
    if (!oldid) {
      dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    }
    let api: string = createGetApi(
      "db=nodb|fnct=102|dll=hospdll",
      oldid + "=sti990"
    );
    return nrjAxios({ apiCall: api });
  };

  const ShowData = (dataSvd: any) => {
    let dt: string = GetResponseWnds(dataSvd);
    if (dt) {
      let anlst: string = getFldValue(dt, "anlst");
      sessionStorage.setItem("anlstid", anlst);
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
      let id: string = getFldValue(dt, "id");
      if (id) {
        dispatch({ type: ACTIONS.MAINID, payload: Number(id) });
        sessionStorage.setItem("annualrptid", id);
      }
    } else {
      setShowMessage1({message:["Something Went Wrong, Can't fetch data right now. Please Try Again!" ]})
      dispatch({ type: ACTIONS.RANDOM, payload: 1 });
      if(state.disableA == 1){
        dispatch({ type: ACTIONS.DISABLE, payload: 1 });
      }
      if(state.disableB == 1){
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
      }
    }
  };

  const { data: dataSvd, refetch: refetchOld } = useQuery({
    queryKey: ["svOld", state.mainId, state.rndm],
    queryFn: GetSvData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  const clrFunct = () => {
    let data: string = state.textDts;
    data = clrFldsExcptDrpDt(data);
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
      dispatch({ type: ACTIONS.NEWFRMDATA, payload: data });
    }, 300);
  };

  const nxtClick = () => {
    navigate(`/spcb_cbwtf?name=${statenm}`);
  };
 
  const GetCreate = () => {
    let api: string = createGetApi("db=nodb|fnct=c277|dll=accdll", sttid + "=" + dt_rpt);
    return nrjAxios({ apiCall: api });
  }

  const { data: dataSvd1, refetch: refetchOld1 } = useQuery({
    queryKey: ["svOldForm1", state.mainId, state.rndm],
    queryFn: GetCreate,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  document.title = "State: Details";
  const applicationVerion: string = getApplicationVersion();


  if(!dt_rpt || !sttid){
    return (<div className="border p-3 bg-white text-lg rounded-lg w-full mt-2" onClick={()=>navigate('/allStateReport')}>
      Click here to select a State. 
    </div>);
  }
  else{

  return (
    <>

      {applicationVerion == '1' && <>  <div>
        <HdrDrp hideHeader={false}></HdrDrp>
      </div>
        <span className="text-center text-bold text-blue-600/75">
          <h5>State Annual Report: Details</h5>
        </span></>}


      <div className="bg-white px-4shadow rounded-lg">
        <>
          <div>
            <div className="flex justify-end">
              <Tooltip title="Click to clear the old data">
                <Button variant="contained"
                  style={{ color: "#3B71CA", backgroundColor: "#fff" ,textTransform: "none" }}
                  onClick={clrFunct}
                >
                  <SvgIcon component={RefreshIcon} />
                </Button>
              </Tooltip>


            </div>
            <div className="text-lg font-semibold text-center">
              {statenm}
            </div>
            {showMessage1 && showMessage1.message.length != 0 ? (
            <div className="py-2">
              <Toaster data={showMessage1} className={""}></Toaster>
            </div>
          ) : (
            <></>
          )}
        
            <div className="grid md:grid-cols-1 mt-3 lg:grid-cols-2 ">
              <div className="mb-1">
                <WtrInput
                  Label="Name of the Organisation"
                  fldName="spcorg"
                  idText="txtspcorg"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn="1[length]"
                  allowNumber={false}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={"Enter Name of State Organization"}
                  delayClose={1000}
                  placement="right"
                  ClssName=""
                  ToolTip="Enter a Name without special character"
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Name of Nodal Officer"
                  fldName="spcnodf"
                  idText="txtspcnodf"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn="1[length]"
                  allowNumber={false}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={"Enter Name of Nodal Officer"}
                  delayClose={1000}
                  placement="bottom"
                  ClssName=""
                  ToolTip="Enter a Name without special character"
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Contact No. of Nodal Officer"
                  fldName="nodfphn"
                  idText="txtnodfphn"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn="[mob]"
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={"Enter Name of Nodal Officer"}
                  delayClose={1000}
                  placement="left"
                  ClssName=""
                  ToolTip="Enter whole numbers only"
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="e-mail id of Nodal Officer"
                  fldName="nodfeml"
                  idText="txtnodfeml"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  unblockSpecialChars={true}
                  upprCase={isUppercase}
                  validateFn="[email]"
                  allowNumber={false}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={"Enter Name of Nodal Officer"}
                  delayClose={1000}
                  ClssName=""
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Total HCF"
                  fldName="tothcf"
                  idText="txttothcf"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn="1[length]"
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={"Enter Total Number of HCF"}
                  delayClose={1000}
                  ClssName=""
                  ToolTip="Enter whole numbers only"
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Total Bedded HCF"
                  fldName="totbdh"
                  idText="txttotbdh"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn="1[length]"
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={"Enter Total Number of HCF"}
                  delayClose={1000}
                  ClssName=""
                  ToolTip="Enter whole numbers only"

                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Total Clinical Dispensary"
                  fldName="totcld"
                  idText="txttotcld"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn="1[length]"
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={"Enter Total Number of Clinical Dispensary"}
                  delayClose={1000}
                  ClssName=""
                  ToolTip="Enter whole numbers only"
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Total Vetinary Institutions"
                  fldName="totvet"
                  idText="txttotvet"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn=""
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  ToolTip="Enter whole numbers only"
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Total Animal Houses"
                  fldName="totanh"
                  idText="txttotanh"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn=""
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  ToolTip="Enter whole numbers only"
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Total Pathology Labs"
                  fldName="totpth"
                  idText="txttotpth"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn=""
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  ToolTip="Enter whole numbers only"
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Total Blood Bank"
                  fldName="totbld"
                  idText="txttotbld"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn=""
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  ToolTip="Enter whole numbers only"

                ></WtrInput>
              </div>


              <div className="mb-1">
                <WtrInput
                  Label="Total Clinical Establishment"
                  fldName="totcln"
                  idText="txttotcln"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn=""
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  ToolTip="Enter whole numbers only"

                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Total Research Institution"
                  fldName="totrsh"
                  idText="txttotrsh"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn=""
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  ToolTip="Enter whole numbers only"

                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Total Ayush Clinic"
                  fldName="totaysh"
                  idText="txttotaysh"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn=""
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  ToolTip="Enter whole numbers only"

                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label="Total No Beds"
                  fldName="totbeds"
                  idText="txttotbeds"
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=""
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn="1[length]"
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={"Enter Total No of Beds"}
                  delayClose={1000}
                  ClssName=""
                  ToolTip="Enter whole numbers only"

                ></WtrInput>
              </div>
            </div>
          </div>

          {showMessage && showMessage.message.length != 0 ? (
            <div className="py-2">
              <Toaster data={showMessage} className={""}></Toaster>
            </div>
          ) : (
            <></>
          )}
          <div className="flex justify-center py-7">
            <div className="mr-4">
              <Button
                size="medium"
                style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
                variant="contained"
                color="success"
                disabled={!state.disableA}
                startIcon={<SaveIcon />}
                onClick={svClick}
              >
                Submit
              </Button>
            </div>
            <div className="">
              <Tooltip title="Click to continue">
                <Button
                  size="medium"
                  style={{ color: '#38a169', backgroundColor: "#fff", textTransform: "none" }}
                  variant="contained"
                  color="success"
                  disabled={!state.disableB}
                  onClick={nxtClick}
                >
                  Next
                </Button>
              </Tooltip>
            </div>
          </div>
        </>
      </div>
    </>
  );
  }
};
export default React.memo(Stt_Annlfrst);

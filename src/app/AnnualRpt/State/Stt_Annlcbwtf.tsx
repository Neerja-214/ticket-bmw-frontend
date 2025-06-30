
import React, { useEffect, useReducer, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Accordion, Alert, Button, SvgIcon } from "@mui/material";
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


const Stt_Annlcbwtf = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const isUppercase = sessionStorage.getItem('UpperCase') == '1' ? true : false;
  const navigate = useNavigate();
  const reqFlds: any[] = [];
  const reqsFlds = [
    { fld: 'cbwtfopr', msg: 'Enter Total CBWTF in Operation', chck: 'length' },
    { fld: 'wsttrt', msg: 'Enter Biomedical Waste Treated', chck: 'length' }
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const statenm = searchParams.get('name');
  const coldef = [
    { field: 'id', hide: true, width: 0, headerName: '' },
    { field: 'cbwtfopr', hide: false, width: 150, headerName: 'Total No CBWTF in Operation' },
    { field: 'cbwtfcns', hide: false, width: 150, headerName: 'Total No CBWTF in Construction' },
    { field: 'wsttrt', hide: false, width: 150, headerName: 'Total Biomedical Waste Treated Kg/day' },
    { field: 'wstath', hide: false, width: 150, headerName: 'Total Biomedical Waste Disposed by Authorized Recycler Kg/day' },
    { field: 'vlthcf', hide: false, width: 150, headerName: 'Total Voilations HCF' },
    { field: 'vltcbtwf', hide: false, width: 150, headerName: 'Total Voilations CBWTF' },
    { field: 'vltothr', hide: false, width: 150, headerName: 'Total Voilations Others' },
    { field: 'shwhcf', hide: false, width: 150, headerName: 'Total Show Cause Notice HCF' },
    { field: 'shwcbtwf', hide: false, width: 150, headerName: 'Total Show Cause Notice CBWTF' },
    { field: 'shwothr', hide: false, width: 150, headerName: 'Total Show Cause Notice Others' },
    { field: 'wrkspyr', hide: false, width: 150, headerName: 'No of Work Shop in Year' },
    { field: 'ocpinlq', hide: false, width: 150, headerName: 'No of Occupier with Liquid Waste Treatment' },
    { field: 'capin', hide: false, width: 150, headerName: 'No of Capitive Incinerator Complying to Norms' },
    { field: 'trnorg', hide: false, width: 150, headerName: 'No of Organized Training' },
    { field: 'biomwst', hide: false, width: 150, headerName: 'No of constituted Bio-medical Waste management Committees' },
    { field: 'anlrp', hide: false, width: 150, headerName: 'No of occupiers submitted Annual Report for the previous calendar year' },
    { field: 'pretr', hide: false, width: 150, headerName: 'No of occupiers practising pre-treatment of lab microbiology' }
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
    api = svLnxSrvr("", api, mid, "shrtrm", "cpc0spcb_cbwtf", state.mainId, "");
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
      }
      dispatch({ type: ACTIONS.CHECK_REQ, payload: "Data Update" });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
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
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    setTimeout(() => {
      let oldid: string = sessionStorage.getItem("annualrptid") || "";
      if (oldid) {
        refetchOld();
      }
    }, 300)
  });

  const GetSvData = () => {
    let oldid: string = sessionStorage.getItem("annualrptid") || "";
    let api: string = createGetApi(
      "db=nodb|fnct=102|dll=hospdll",
      oldid + "=slm1052"
    );
    return nrjAxios({ apiCall: api });
  };

  const ShowData = (dataSvd: any) => {
    let dt: string = GetResponseWnds(dataSvd);
    if (dt) {
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
      dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    }
  };

  const { data: dataSvd, refetch: refetchOld } = useQuery({
    queryKey: ["svOldcbwtf", state.rndm],
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
    navigate(`/spcb_auth?name=${statenm}`);
  };
  document.title = "State: CBWTF";
  const applicationVerion: string = getApplicationVersion();

  return (
    <>
      {applicationVerion == '1' && <> <div>
        <HdrDrp hideHeader={false}></HdrDrp>
      </div>
        <span className="text-center text-bold text-blue-600/75">
          <h5>State Annual Report: CBWTF </h5>
        </span> </>}


      <div className="bg-white">
        <div className="shadow rounded-lg py-1">
          <div>
            <div className="flex justify-end m-2">
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
            <div className="grid md:grid-cols-1 mt-3 lg:grid-cols-2 ">
              <div className="mb-1">
                <WtrInput
                  Label='Total No CBWTF in Operation'
                  fldName='cbwtfopr'
                  idText='txtcbwtfopr'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={false}
                  validateFn='1[length]'
                  allowNumber={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter Total CBWTF in Operation'}
                  delayClose={1000}
                  placement='right' ClssName=''
                  ToolTip="Enter whole numbers only" ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Total No CBWTF in Construction'
                  fldName='cbwtfcns'
                  idText='txtcbwtfcns'
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
                  Label='Total Biomedical Waste Treated Kg/day'
                  fldName='wsttrt'
                  idText='txtwsttrt'
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
                  speaker={'Enter Biomedical Waste Treated'}
                  delayClose={1000}
                  placement='left' ClssName=''
                  ToolTip="Enter numbers only" ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Total Biomedical Waste Disposed by Authorized Recycler Kg/day'
                  fldName='wstath'
                  idText='txtwstath'
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
                  ToolTip="Enter numbers only"
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Total Voilations HCF'
                  fldName='vlthcf'
                  idText='txtvlthcf'
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
                  Label='Total Voilations CBWTF'
                  fldName='vltcbtwf'
                  idText='txtvltcbtwf'
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
                  Label='Total Voilations Others'
                  fldName='vltothr'
                  idText='txtvltothr'
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
                  Label='Total Show Cause Notice HCF'
                  fldName='shwhcf'
                  idText='txtshwhcf'
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
                  Label='Total Show Cause Notice CBWTF'
                  fldName='shwcbtwf'
                  idText='txtshwcbtwf'
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
                  Label='Total Show Cause Notice Others'
                  fldName='shwothr'
                  idText='txtshwothr'
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
                  Label='No of Work Shop in Year'
                  fldName='wrkspyr'
                  idText='txtwrkspyr'
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
                  Label='No of Occupier with Liquid Waste Treatment'
                  fldName='ocpinlq'
                  idText='txtocpinlq'
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
                  Label='No of Capitive Incinerator Complying to Norms'
                  fldName='capin'
                  idText='txtcapin'
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
                  Label='No of Organized Training'
                  fldName='trnorg'
                  idText='txttrnorg'
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
                  Label='No of constituted Bio-medical Waste management Committees'
                  fldName='biomwst'
                  idText='txtbiomwst'
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
                  Label='No of occupiers submitted Annual Report for the previous calendar year'
                  fldName='anlrp'
                  idText='txtanlrp'
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
                  Label='No of occupiers practising pre-treatment of lab microbiology'
                  fldName='pretr'
                  idText='txtpretr'
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
                onClick={() => { navigate('/spcb_frst') }}>
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
                onClick={svClick}>
                Submit
              </Button>
            </div>
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
    </>
  );
}; export default React.memo(Stt_Annlcbwtf);


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
import SaveIcon from "@mui/icons-material/Save";
import { Toaster } from "../../../components/reusable/Toaster";
import { useNavigate } from "react-router";
import { useEffectOnce } from "react-use";
import NrjAgGrid from "../../../components/reusable/NrjAgGrid";
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
  SET_GRIDDATA: "setgriddata"
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
  rowData: []
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
  rowData: any[]
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
    case ACTIONS.SET_GRIDDATA:
      state.rowData = action.payload
      return newstate;
  }
};
//const [state, dispatch] = useReducer(reducer, initialState);





const Stt_Annlcptv = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const isUppercase = sessionStorage.getItem('UpperCase') == '1' ? true : false;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statenm = searchParams.get('name');
  const reqFlds: any[] = [];
  const reqsFlds = [
    { fld: 'hcfcpt', msg: 'Enter Name of Captive HCF', chck: 'length' },
    { fld: 'hcfadd', msg: 'Enter Address HCF', chck: 'length' },
    { fld: 'wstred', msg: 'Enter Biomedical Waste Red Per Day', chck: 'length' },
    { fld: 'wstylw', msg: 'Enter Biomedical Waste Yelow Per Day', chck: 'length' },
    { fld: 'wstwht', msg: 'Enter Biomedical Waste White Per Day', chck: 'length' },
    { fld: 'wstblu', msg: 'Enter Biomedical Waste Blue Per Day', chck: 'length' },
    { fld: 'inccp', msg: 'Enter Incinerator Capacity Per Day', chck: 'length' },
    { fld: 'autcp', msg: 'Enter AutoClave Capacity Per Day', chck: 'length' },
    { fld: 'depcp', msg: 'Enter Deep Burial Capacity Per Day', chck: 'length' },
    { fld: 'othrcp', msg: 'Enter Other Capacity Per Day', chck: 'length' },
    { fld: 'inctrd', msg: 'Enter Incinerator Treated Per Day', chck: 'length' },
    { fld: 'auttrd', msg: 'Enter AutoClave Treated Per Day', chck: 'length' },
    { fld: 'deptrd', msg: 'Enter Deep Treated Per Day', chck: 'length' },
    { fld: 'othrtrd', msg: 'Enter Other Treated Per Day', chck: 'length' }
  ];
  const coldef = [
    { field: 'id', hide: true, width: 0, headerName: '' },
    { field: 'hcfcpt', hide: false, width: 150, headerName: 'HCF', filter: 'agTextColumnFilter' },
    { field: 'hcfadd', hide: false, width: 150, headerName: 'Address' },
    { field: 'wstred', hide: false, width: 150, headerName: 'Red Waste Kg/day' },
    { field: 'wstylw', hide: false, width: 150, headerName: 'Yellow Waste Kg/day' },
    { field: 'wstwht', hide: false, width: 150, headerName: 'White Waste Kg/day' },
    { field: 'wstblu', hide: false, width: 150, headerName: 'Blue Waste Kg/day' },
    { field: 'inccp', hide: false, width: 150, headerName: 'Incinerator Capacity Kg/day' },
    { field: 'autcp', hide: false, width: 150, headerName: 'Autoclave Capacity Kg/day' },
    { field: 'depcp', hide: false, width: 150, headerName: 'Deep Burial Capacity Kg/day' },
    { field: 'othrcp', hide: false, width: 150, headerName: 'Other Capacity Kg/day' },
    { field: 'inctrd', hide: false, width: 150, headerName: 'Incinerator Treated Kg/day' },
    { field: 'auttrd', hide: false, width: 150, headerName: 'Autoclave Treated Kg/day' },
    { field: 'deptrd', hide: false, width: 150, headerName: 'Deep Burial Treated Kg/day' },
    { field: 'othrtrd', hide: false, width: 150, headerName: 'Other Treated Kg/day' }
  ];

  const GridLoaded = () => {
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
  };
  const onRowSelected = (data: string) => { };


  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const HandleSaveClick = () => {
    let api: string = state.textDts;
    let ary = dataStr_ToArray(api);
    dispatch({ type: ACTIONS.NEWROWDATA, payload: ary })
    setTimeout(function () {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 })
    }, 800);
    let mid = sessionStorage.getItem('annualrptid') || '';
    api = svLnxSrvr("", api, mid, "shrtrm", "cpc0spcb_hcfcptv", state.mainId, "");
    return nrjAxios({ apiCall: api });
  };
  const { showToaster, hideToaster } = useToaster();
  const svClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    
    showToaster( msg, 'error');
    if (msg && msg[0]) {
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: "" });
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 })
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 })
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
        refetchOld();
        setShowMessage({
          message: ["Data Saved Successfully"],
          type: "success",
        });
        ech = rspnse.split("][");
        // dispatch({ type: ACTIONS.MAINID, payload: Number(ech[1]) });
        clrFunct();
      }
      dispatch({ type: ACTIONS.CHECK_REQ, payload: "Data Update" });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
    }
  };


  const { data, refetch } = useQuery({
    queryKey: ["svQryAnnlcptv", state.mainId, state.rndm],
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

  const GetSvData = () => {
    let oldid: string = sessionStorage.getItem("annualrptid") || "";
    let api: string = createGetApi(
      "db=nodb|fnct=102|dll=hospdll",
      oldid + "=stm995"
    );
    return nrjAxios({ apiCall: api });
  };

  const ShowData = (dataSvd: any) => {
    let dt: string = GetResponseWnds(dataSvd);
    if (dt) {
      let ary: any = dataStr_ToArray(dt);
      dispatch({ type: ACTIONS.SET_GRIDDATA, payload: ary });
    }
  };

  const { data: dataSvd, refetch: refetchOld } = useQuery({
    queryKey: ["svOldannlhcfcptv", state.mainId, state.rndm],
    queryFn: GetSvData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  // const parentPagination = (data: any) => {
  //   if (
  //     data.api.paginationProxy.totalPages -
  //       data.api.paginationProxy.currentPage <=
  //     1
  //   ) {
  //     refetchOld()
  //   }
  // };
  const clrFunct = () => {
    let data: string = state.textDts;
    data = clrFldsExcptDrpDt(data)
    dispatch({ type: ACTIONS.NEWFRMDATA, payload: data })
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    }, 300)
  }
  const PrintAll = () => {
    refetchPrnt()
  }
  const PrntStt = () => {
    let id: string = sessionStorage.getItem("annualrptid") || "1"
    let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g115", id)
    return useNrjAxios({ apiCall: api })
  }

  const prntWnd = (dataPrnt: any) => {
    let dt: string = GetResponseWnds(dataPrnt)
    if (dt) {
      window.open(dt, "_blank")
    }
  }

  const { data: dataPrnt, refetch: refetchPrnt } = useQuery({
    queryKey: ["svprint", state.rndm],
    queryFn: PrntStt,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: prntWnd,
  });

  document.title = "State: HCF Captive";
  const applicationVerion: string = getApplicationVersion();

  return (
    <>
      {applicationVerion == '1' && <>  <div>
        <HdrDrp hideHeader={false}></HdrDrp>
      </div>
        <span className="text-center text-bold text-blue-600/75">
          <h5>State Annual Report: HCF Captive </h5>
        </span></>}
      <div className="bg-white pb-5 rounded-lg">
        <div className="flex justify-content-end py-3">
          <div className="mx-4">
            <Tooltip title="Click to clear the old data">
              <Button variant="contained"
                className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                style={{ color: "#3B71CA", backgroundColor: "#fff" , textTransform: "none"}}
                onClick={clrFunct}
              >
                <SvgIcon component={RefreshIcon} />
              </Button>
            </Tooltip>
          </div>
          <div className="mr-4">
            <Button
              size="medium"
              className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"

              style={{ color: '#fff', backgroundColor: "#38a169", textTransform: "none" }}
              variant="contained"
              color="success"
              disabled={!state.disableB}
              onClick={PrintAll}
            >
              Generate AR
            </Button>
          </div>
        </div>
        <div className="">
          <div>
            <div className="text-lg font-semibold text-center">
              {statenm}
            </div>
            <div className="grid md:grid-cols-1 mt-3 lg:grid-cols-2 ">
              <div className="mb-1">
                <WtrInput
                  Label='HCF'
                  fldName='hcfcpt'
                  idText='txthcfcpt'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={false}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter Name of Captive HCF'}
                  delayClose={1000}
                  placement='right'
                  ClssName=''
                  ToolTip="Enter name of captive HCF without special characters"
                ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Address'
                  fldName='hcfadd'
                  idText='txthcfadd'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='4[length]'
                  allowNumber={false}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter Address HCF'}
                  delayClose={1000}
                  placement='bottom'
                  ClssName='' ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Red Waste Kg/day'
                  fldName='wstred'
                  idText='txtwstred'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter Biomedical Waste Red Per Day'}
                  delayClose={1000}
                  placement='left'
                  ClssName=''
                  ToolTip="Enter numbers only"></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Yellow Waste Kg/day'
                  fldName='wstylw'
                  idText='txtwstylw'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter Biomedical Waste Yelow Per Day'}
                  delayClose={1000}
                  ToolTip="Enter numbers only"
                  ClssName='' ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='White Waste Kg/day'
                  fldName='wstwht'
                  idText='txtwstwht'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter Biomedical Waste White Per Day'}
                  delayClose={1000}
                  ClssName=''
                  ToolTip="Enter numbers only" ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Blue Waste Kg/day'
                  fldName='wstblu'
                  idText='txtwstblu'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter Biomedical Waste Red Per Day'}
                  delayClose={1000}
                  ClssName=''
                  ToolTip="Enter numbers only"></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Incinerator Capacity Kg/day'
                  fldName='inccp'
                  idText='txtinccp'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter AutoClave Capacity Per Day'}
                  delayClose={1000}
                  ClssName=''
                  ToolTip="Enter numbers only" ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Autoclave Capacity Kg/day'
                  fldName='autcp'
                  idText='txtautcp'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter AutoClave Capacity Per Day'}
                  delayClose={1000}
                  ClssName=''
                  ToolTip="Enter numbers only" ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Deep Burial Capacity Kg/day'
                  fldName='depcp'
                  idText='txtdepcp'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={''}
                  delayClose={1000}
                  ClssName=''
                  ToolTip="Enter numbers only"></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Other Capacity Kg/day'
                  fldName='othrcp'
                  idText='txtothrcp'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter Other Capacity Per Day'}
                  delayClose={1000}
                  ClssName=''
                  ToolTip="Enter numbers only"></WtrInput>
              </div>
              <div className="mb-1">
                <WtrInput
                  Label='Incinerator Treated Kg/day'
                  fldName='inctrd'
                  idText='txtinctrd'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter AutoClave Treated Per Day'}
                  delayClose={1000}
                  ClssName=''
                  ToolTip="Enter numbers only"></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Autoclave Treated Kg/day'
                  fldName='auttrd'
                  idText='txtauttrd'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter AutoClave Treated Per Day'}
                  delayClose={1000}
                  ClssName=''
                  ToolTip="Enter numbers only" ></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Deep Burial Treated Kg/day'
                  fldName='deptrd'
                  idText='txtdeptrd'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter Deep Treated Per Day'}
                  delayClose={1000}
                  ClssName=''
                  ToolTip="Enter numbers only"></WtrInput>
              </div>

              <div className="mb-1">
                <WtrInput
                  Label='Other Treated Kg/day'
                  fldName='othrtrd'
                  idText='txtothrtrd'
                  onChange={onChangeDts}
                  dsabld={false}
                  callFnFocus=''
                  dsbKey={false}
                  upprCase={isUppercase}
                  validateFn='1[length]'
                  allowNumber={true}
                  allowDecimal={true}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  speaker={'Enter Other Treated Per Day'}
                  delayClose={1000}
                  ClssName=''
                  ToolTip="Enter numbers only" ></WtrInput>
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
                style={{ color: '#38a169', backgroundColor: "#fff" ,textTransform: "none",}}
                variant="contained"
                color="success"
                disabled={!state.disableA}
                onClick={() => { navigate('/spcb_dstr') }}
              >

                Previous
              </Button>
            </div>
            <div className="mr-4">
              <Button
                size="medium"
                style={{ backgroundColor: "#3B71CA",textTransform: "none", }}
                variant="contained"
                color="success"
                disabled={!state.disableA}
                startIcon={<SaveIcon />}
                onClick={svClick}
              >
                Submit
              </Button>
            </div>
            {/* <div className="">
          <Button
            size="medium"
            style={{ color: "#3B71CA", backgroundColor:"#fff" }}
            variant="contained"
            color="success"
            disabled={!state.disableA}
            startIcon={<SaveIcon />}
            onClick={clrFunct}
          >
            Reset
          </Button>
        </div> */}

          </div>
          <div
            className="w-11/12 justify-centre ml-10"
            style={{ marginLeft: "25px", marginTop: "25px" }}
          >
            <NrjAgGrid
              onGridLoaded={GridLoaded}
              onRowSelected={onRowSelected}
              colDef={coldef}
              apiCall={""
                //"nodb=rowset=fnct=hospdll=102=cmpid=usrid=a=[lastid]=st398frm=0="
              }
              rowData={[]}
              deleteButton={"Delete"}
              deleteFldNm={"Delete"}
              showDataButton={''}
              showFldNm={'cbtwf'}
              className='ag-theme-alpine-blue ag-theme-alpine'
              trigger={state.triggerG}
              showPagination={true}
              newRowData={state.nwRow}
            ></NrjAgGrid>
          </div>
        </div>
      </div>
    </>
  );
}; export default React.memo(Stt_Annlcptv);

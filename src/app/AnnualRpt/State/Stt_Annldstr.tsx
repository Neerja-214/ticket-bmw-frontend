
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
import WtrRsSelect from "../../../components/reusable/nw/WtrRsSelect";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { Toaster } from "../../../components/reusable/Toaster";
import NrjChkbx from "../../../components/reusable/NrjChkbx";
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
      return newstate;
    case ACTIONS.SET_GRIDDATA:
      state.rowData = action.payload
      return newstate;
  }
};
//const [state, dispatch] = useReducer(reducer, initialState);





const Stt_Annldstr = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const isUppercase = sessionStorage.getItem('UpperCase') == '1' ? true : false;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statenm = searchParams.get('name');
  const reqFlds:any[] = [];
  const reqsFlds = [
    { fld: 'dstr', msg: 'Enter Name of District', chck: 'length' }, 
    { fld: 'gnrt', msg: 'Enter Biomedical Waste Generated Per Day', chck: 'length' }, 
    { fld: 'inccp', msg: 'Enter Incinerator Capacity Kg/day', chck: 'length' }, 
    { fld: 'autcp', msg: 'Enter Autclave Capacity Kg/day', chck: 'length' }, 
    { fld: 'depcp', msg: 'Enter Deep Capacity Kg/day', chck: 'length' }
  ]; 
  const coldef = [
    { field: 'id', hide: true, width: 0, headerName: '' }, 
    { field: 'dstr', hide: false, width: 170, headerName: 'District',filter: 'agTextColumnFilter' }, 
    { field: 'gnrt', hide: false, width: 220, headerName: 'Waste Generated Kg/day' }, 
    { field: 'inccp', hide: false, width: 220, headerName: 'Incinerator Capacity Kg/day' }, 
    { field: 'autcp', hide: false, width: 220, headerName: 'Autoclave Capacity Kg/day' }, 
    { field: 'depcp', hide: false, width: 220, headerName: 'Deep Burial Capacity Kg/day' }
  ];

  const GridLoaded = () => {
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
  };
  const onRowSelected = (data: string) => {  };

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
    dispatch({type: ACTIONS.NEWROWDATA, payload:ary})
    setTimeout(function(){
      dispatch({type: ACTIONS.TRIGGER_GRID, payload:0})
    },800);
    let mid = sessionStorage.getItem('annualrptid') || '';
    api = svLnxSrvr("", api, mid, "shrtrm", "cpc0spcb_dstr", state.mainId, "");
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
          refetchOld();
          setShowMessage({
            message: ["Data Saved Successfully"],
            type: "success",
          });
          ech = rspnse.split("][");
          dispatch({ type: ACTIONS.MAINID, payload: Number(ech[1]) });
          clrFunct();
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
    let oldid: string = sessionStorage.getItem("annualrptid") || "";
    if (oldid) {
      refetchOld();
    }
  });

  const GetSvData = () => {
    let oldid: string = sessionStorage.getItem("annualrptid") || "";
    let api: string = createGetApi(
      "db=nodb|fnct=102|dll=hospdll",
      oldid + "=stm992"
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
    navigate(`/spcb_hcfcptv?name=${statenm}`);
  };
  document.title = "State: District";


  const applicationVerion: string = getApplicationVersion();

  return (
    <>
    {applicationVerion == '1' && <>  <div>
      <HdrDrp hideHeader={false}></HdrDrp>
    </div>
    <span className="text-center text-bold text-blue-600/75">
      <h5>State Annual Report: District </h5>
    </span></>}
    <div className="bg-white shadow rounded-lg pb-5">
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
    <div className=" rounded-lg">
      <div>
      <div className="text-lg font-semibold text-center">
              {statenm}
            </div>
        <div className="grid md:grid-cols-1 mt-3 lg:grid-cols-2 ">
          <div className="mb-1">
            <WtrInput 
              Label='District' 
              fldName='dstr' 
              idText='txtdstr' 
              onChange={onChangeDts} 
              dsabld={false} 
              callFnFocus='' 
              dsbKey={false} 
              upprCase={isUppercase} 
              validateFn='1[length]' 
              allowNumber={false}
              selectedValue={state.frmData} 
              clrFnct={state.trigger} 
              speaker={'Enter Name of District'} 
              delayClose={1000} 
              placement='right' 
              ClssName='' ></WtrInput>
          </div>

          <div className="mb-1">
            <WtrInput 
              Label='Waste Generated Kg/day' 
              fldName='gnrt' 
              idText='txtgnrt'
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
              speaker={'Enter Biomedical Waste Generated Per Day'} 
              delayClose={1000} placement='bottom' ClssName='' 
              ToolTip="Enter numbers only"
              ></WtrInput>
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
              speaker={'Enter Incinerator Capacity Kg/day'} 
              delayClose={1000} placement='left' ClssName=''
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
              speaker={'Enter Autclave Capacity Kg/day'} 
              delayClose={1000} ClssName='' 
              ToolTip="Enter numbers only"></WtrInput>
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
              speaker={'Enter Deep Capacity Kg/day'} 
              delayClose={1000} ClssName='' 
              ToolTip="Enter numbers only"></WtrInput>
          </div>
          <div className="mb-1">
            <WtrInput 
              Label='Any Other Capacity Kg/day' 
              fldName='othrcp' 
              idText='txtothrcp' 
              onChange={onChangeDts} 
              dsabld={false} 
              callFnFocus='' 
              dsbKey={false} 
              upprCase={isUppercase} 
              validateFn='' 
              allowNumber={true} 
              allowDecimal={true}
              selectedValue={state.frmData} 
              clrFnct={state.trigger} 
              speaker={''} 
              delayClose={1000} ClssName=''
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
            style={{ color: '#38a169', backgroundColor: "#fff",textTransform: "none", }}
            variant="contained"
            color="success"
            disabled={!state.disableA}
            onClick={() => { navigate('/spcb_auth') }}
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
        {/* <div className="mr-4">
          <Button
            size="medium"
            style={{ color: "#3B71CA", backgroundColor:"#fff" }}
            variant="contained"
            color="success"
            disabled={!state.disableA}
            startIcon={<SaveIcon />}
            onClick={clrFunct}
          >
            Reset Form
          </Button>
        </div> */}
        <div className="">
        <Tooltip title="Click to continue">

          <Button
            size="medium"
            style={{ color: '#38a169', backgroundColor: "#fff" ,textTransform: "none",}}
            variant="contained"
            color="success"
            onClick={nxtClick}>
            Next
          </Button>
          </Tooltip>
        </div>
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
          rowData={state.rowData}
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
}; export default React.memo(Stt_Annldstr);

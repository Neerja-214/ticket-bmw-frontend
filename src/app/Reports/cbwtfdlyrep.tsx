import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  capitalize,
  createGetApi,
  dataStr_ToArray,
  getStateAbbreviation,
  gridAddToolTipColumn,
  postLinux,
  sortByFld,
  svLnxSrvr,
  trimField,
} from "../../utilities/utilities";
import { useEffect, useReducer, useState } from "react";
import {
  nrjAxios,
  nrjAxiosRequest,
  nrjAxiosRequestBio,
  useNrjAxios,
} from "../../Hooks/useNrjAxios";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import HdrDrp from "../HdrDrp";
import { getLvl, getMyName, getWho } from "../../utilities/cpcb";
import { getLCP } from "web-vitals";
import { escapeLeadingUnderscores } from "typescript";
import { useEffectOnce } from "react-use";
import { Tooltip } from "@mui/material";
import { useDispatch } from "react-redux/es/hooks/useDispatch";
import { useSelector } from "react-redux";
import { Toaster } from "../../components/reusable/Toaster";
import WtrDate from "../../components/reusable/nw/WtrDate";
import { getFldValue } from "../../Hooks/useGetFldValue";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { validForm } from "../../Hooks/validForm";
import { useToaster } from "../../components/reusable/ToasterContext";
import LevelSelector from "../dshbrd/LevelSelector";
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import moment from 'moment';
import {format} from 'date-fns'

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
  DISABLE: "disable",
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
      newstate.triggerG += 10;
      newstate.nwRow = action.payload;
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
      newstate.triggerG = 5;
      return newstate;
    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.CHECK_REQ:
      newstate.errMsg = action.payload;
      newstate.openDrwr = true;
      return newstate;
    case ACTIONS.CHECK_REQDONE:
      newstate.errMsg = "";
      newstate.openDrwr = false;
      return newstate;
    case ACTIONS.SETGID:
      newstate.gid = action.payload;
      return newstate;
    case ACTIONS.DISABLE:
      if (action.payload == 1) {
        if (newstate.disableA == 1) {
          newstate.disableA = 0;
        } else {
          newstate.disableA = 1;
        }
        return newstate;
      } else if (action.payload == 2) {
        if (newstate.disableB == 1) {
          newstate.disableB = 0;
        } else {
          newstate.disableB = 1;
        }
        return newstate;
      } else if (action.payload == 2) {
        if (newstate.disableC == 1) {
          newstate.disableC = 0;
        } else {
          newstate.disableC = 1;
        }
        return newstate;
      }
  }
};

export default function Cbwtfdlyrep() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const GridLoaded = () => { };
  const onRowSelected = (data: string) => {
  };
  const onButtonClicked = (action: string, rw: any) => { };
  const rowData: any[] = [];

  const [isLoading, setIsLoading] = useState("");
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const [level, setLvl] = useState("");
  const [whos, setWho] = useState("");
  const reqFlds = [{ fld: "dt_rptfrm", msg: "Select the From date", chck: "length" }];

  const coldef = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "cbwtfid", hide: true, width: 250, headerName: "CBWTFID" },
    {
      field: "dt_rpt",
      hide: false,
      width: 130,
      headerName: "Date",
      // filter: "agTextColumnFilter",
      valueFormatter: (params:any) => {
        return format(new Date(params.value), 'dd-MMM-yyyy');
      },
    },
    {
      field: "cbwtfnm",
      hide: false,
      width: 250,
      tooltipField: 'cbwtfnm',
       headerName: "Name of CBWTF",
      filter: "agTextColumnFilter",
    },
    { field: "state", hide: false, width: 140, headerName: "State/UT" },
    { field: "rgd", hide: false, width: 180, headerName: "Regional directorate" },
    { field: "cty", hide: true, width: 100, headerName: "City" },
    { field: "hcfcount", hide: false, width: 130, headerName: "No. of HCFs" },
    { field: "beds", hide: false, width: 90, headerName: "Beds" },
    { field: "bedded", hide: false, width: 140, headerName: "Bedded HCFs" },
    { field: "nonbedded", hide: false, width: 165, headerName: "Non bedded HCFs" },
    { field: "bagwt", hide: false, width: 260, headerName: "Weight of collected bags (Kg)" },
    { field: "bagcnt", hide: false, width: 190, headerName: "No. of collected bags" },
    { field: "bagwtfct", hide: false, width: 245, headerName: "Weight of bags at CBWTF (Kg) " },
    { field: "bagcntfct", hide: false, width: 190, headerName: "No. of bags at CBWTF" },
    { field: "vstd", hide: false, width: 130, headerName: "HCFs visited" },
    { field: "notvstd", hide: false, width: 160, headerName: "HCFs not visited" },
    { field: "inacthcf", hide: false, width: 140, headerName: "Inactive HCF" },
    // { field: "hcfcnt", hide: false, width: 120, headerName: "No. of HCFs" },

  ]
// col field name  in pdf file only hide is false  
  const colDefPdf = [
    {
      field: "cbwtfnm",
      hide: false,
      width: 300,
      tooltipField: 'cbwtfnm',
       headerName: "Name of CBWTF",
      filter: "agTextColumnFilter",
    },
    { field: "state", hide: false, width: 200, headerName: "State/UT" },
    { field: "rgd", hide: false, width: 200, headerName: "Regional directorate" },
    { field: "cty", hide: true, width: 100, headerName: "City" },
    { field: "hcfcount", hide: false, width: 120, headerName: "No. of HCFs" },
    { field: "beds", hide: false, width: 110, headerName: "Beds" },
    { field: "bedded", hide: false, width: 140, headerName: "Bedded HCFs" },
    { field: "nonbedded", hide: false, width: 140, headerName: "Non bedded HCFs" },
    { field: "bagwt", hide: false, width: 200, headerName: "Weight of collected bags (in kg)" },
    { field: "bagcnt", hide: false, width: 200, headerName: "No. of collected bags" },
    { field: "bagwtfct", hide: false, width: 200, headerName: "Weight of bags at CBWTF (in kg)" },
    { field: "bagcntfct", hide: false, width: 200, headerName: "No. of bags at CBWTF" },
    { field: "vstd", hide: false, width: 120, headerName: "HCFs visited" },
    { field: "notvstd", hide: false, width: 150, headerName: "HCFs not visited" },
    { field: "inacthcf", hide: false, width: 120, headerName: "Inactive HCF" },
  ]
  //  col widht in pdf  file adjust widht by 95% width
   const pdfColWidth=['15%','5%','8%','5%','5%','5%','5%','5%','5%','5%','5%','5%','5%','5%','7%',]

  const printExcelHeader = ["Date","CBWTF","State", "Regional Directorate", "City", "No. of HCFs", "Beds" , "Bedded HCFs","Non Bedded HCFs","Weight of collected Bags (in kg)", "No. of Collected Bags","Weight Of Bags At CBWTF (in kg)", "No. Of Bags At CBWTF", "HCFs Visited", "HCFs Not Visited","Inactive HCF"]
  const KeyOrder: string[] = ['dt_rpt','cbwtfnm','state','rgd','cty', 'hcfcount','beds','bedded','nonbedded','bagwt','bagcnt','bagwtfct','bagcntfct','vstd','notvstd','inacthcf']
  const excelColWidth = [{wch: 30},{wch: 30},{wch: 30}, {wch: 30}, {wch: 30},{wch: 30},{wch: 30}, {wch: 30}, {wch: 30},{wch: 30},{wch: 30}, {wch: 30}, {wch: 30},{wch: 30}, {wch: 30}]


  const { showToaster, hideToaster } = useToaster();
  const getLst = () => {
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
    setTimeout(() => {
      refetchG();
    }, 300)

  };

  const GetGid = () => {
    let gd: string = state.gid;
    if (!gd) {
      let g: any = utilities(3, "", "");
      gd = g;
      dispatch({ type: ACTIONS.SETGID, payload: gd });
    }
    return gd;
  };


  const GetData = () => {
    setIsLoading("Loading data ...");
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
    }, 400)
    // let lvl: string = getLvl();
    // let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
    let lvl = level
    let who = whos;
    let dateFrm = getFldValue(state.textDts, "dt_rptfrm")
    let dateTo = getFldValue(state.textDts, "dt_rptto")
    if (!dateFrm) {
      dateFrm = moment(Date.now()).format("DD-MMM-yyyy")
      
    } else if(!dateTo){
      dateTo = moment(Date.now()).format("DD-MMM-yyyy")
    }
    let dtFrm = UseMomentDateNmb(dateFrm);
    let dtTo = UseMomentDateNmb(dateTo);
    let  dtwise=true
    // let dtno: string = getFldValue(state.textDts, "dt_rpt");
    let gid: any = GetGid();

    // let api: string = createGetApi(
    //   "db=nodb|dll=xrydll|fnct=a230", dt + '=' + lvl + '=' + who
    // );
   // return useNrjAxios({ apiCall: api });
   let dtno=""

    const payload: any = postLinux(lvl + '=' + who + '=' + dtno + "=" + dtFrm + '=' + dtTo + '=' + dtwise + '=' + gid,'cbwtfdlyrep');  
    return nrjAxiosRequestBio("cbwtfdlyrep", payload);

  };

  

  const ShowGrid = (dataSvd: any) => {

    setIsLoading("");
    // let dt: string = GetResponseWnds(dataSvd);
    let dt: any = GetResponseLnx(dataSvd);
   
     
    if (dt && Array.isArray(dt) && dt.length) {
      let ary: any[] = dt.map(item => ({
        ...item,
        bagwt: item.bagwt ? item.bagwt.toFixed(3):"0.000",bagwtfct:item.bagwtfct ? item.bagwtfct.toFixed(3):"0.000"
        // bagwt: item.bagwt ? Math.round(item.bagwt):"0",bagwtfct:item.bagwtfct ?  Math.round(item.bagwtfct):"0"
    }));
     
    
      let gid: string = "";
      let gd: any = utilities(3, "", "");
      gid = gd;
      ary = trimField(ary, "cbwtfnm")
      ary=trimField(ary,"rgd")
      ary = [...ary].sort((a, b) => a.rgd.localeCompare(b.rgd))
      ary = [...ary].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
      dispatch({ type: ACTIONS.SETGID, payload: gid });
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    }
    else{
        showToaster( [dt], 'error');
    }
  };


  const { data: data2, refetch: refetchG } = useQuery({
    queryKey: ["svQry", "gridDisplay", state.rndm],
    queryFn: GetData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowGrid,
  });

  let ttl: string = "";
  ttl = "Daily Cbwtf Report";

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const Printcbwtf = () => {
     
    let gid: string = state.gid;
    let api: string = createGetApi(
      "db=nodb|dll=dummy|fnct=dummy", gid + "=");
    return useNrjAxios({ apiCall: api });
  };

  const showRpt = (dataPr: any) => {
     
    let dt: string = GetResponseWnds(dataPr);
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    if (dt && dt.indexOf(".pdf") > -1) {
      window.open(dataPr.data[0]["Data"], "_blank");
    } else {
      showToaster( ["Please try again after refreshing the page!"],
        'error')
    }
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  };


  const { data: dataPr, refetch: refetchPr } = useQuery({
    queryKey: ["prntlst", state.rndm],
    queryFn: Printcbwtf,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: showRpt,
  });

  function printClick(data: any) {
    refetchPr();
  }

  const setLvlWhoData = (data: any) => {

    setLvl(data.lvl);
    setWho(data.who);
    onChangeDts(data.dateFrom);
    onChangeDts(data.dateTo);
    
    // clearVariable();
  }

  const svClick = () => {
    // clearVariable();
        getLst()
  };




  const cellClassRulesValues = [
    {
      cellName: 'bagcnt',
      color: 'red-row',
      value: '0',
      colorEntireRow: true
    },
  ]
  return (
    <>
      
            {/* <div className="mt-4">
              <Tooltip title="Select Date of Report">
                <NrjRsDt
                  onChange={onChangeDts}
                  Label=""
                  idText="txtdt_rpt"
                  selectedValue={state.frmData}
                  fldName='dt_rpt'
                  speaker={"select Date "}
                ></NrjRsDt>
              </Tooltip>
            </div> */}
            {/* <div className="flex"> */}
              {/* <div className="  mt-4">
                <Tooltip title="Get list of daily cbwtf report">
                  <button
                    onClick={getLst}
                    className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50">
                    Get Details
                  </button>
                </Tooltip>
              </div> */}
              {/* <div className="  mt-4"> */}
                {/* <Tooltip title="Print list of daily cbwtf report">
                  <button
                    onClick={printClick}
                    className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                  >
                    Print Button
                  </button>
                </Tooltip> */}
              {/* </div>
            </div> */}
            <LevelSelector
        showCbwtf={false}
        levelSelectorData={setLvlWhoData}
        // dateField={true}
        dateFieldFrom={true}
        dateFieldTo={true}
        getListButton={true}
        getListOnclick={svClick}
        printButton={false}
      ></LevelSelector> 
          <div className="mt-2 font-semibold text-lg">{isLoading}</div>
          {showMessage && showMessage.message.length != 0 ? (
            <div className="py-2">
              <Toaster data={showMessage} className={""}></Toaster>
            </div>
          ) : (
            <></>
          )}
         <div className="flex justify-center bg-gray-100">

            <NrjAgGrid
              onGridLoaded={GridLoaded}
              onRowSelected={onRowSelected}
              onButtonClicked={onButtonClicked}
              colDef={coldef}
              apiCall={""}
              rowData={rowData}
              deleteButton={""}
              deleteFldNm={""}
              showDataButton={""}
              showFldNm={""}
              trigger={state.triggerG}
              newRowData={state.nwRow}
              showPagination={true}
              showTooltips={true}
              className="ag-theme-alpine-blue ag-theme-alpine"
              appName="CPCB"
              cellClassRulesValues={cellClassRulesValues}
              showExport={true}
              prependContent={[]}
              KeyOrder={KeyOrder}
              lvl={getLvl()}
              who={getWho()}
              pageTitle={"Daily report of waste of CBWTFs "}
              sortBy={'cbwtfnm'}
              printExcelHeader={printExcelHeader}
              exceColWidth={excelColWidth}
              pdfColWidth={pdfColWidth}
              colDefPdf={colDefPdf}
            ></NrjAgGrid>
          </div>
    </>
  );
}

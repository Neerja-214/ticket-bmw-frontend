import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  gridAddToolTipColumn,
  postLinux,
  svLnxSrvr,
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

export default function LoginFiles() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const GridLoaded = () => { };
  const onRowSelected = (data: string) => {
  };
  const onButtonClicked = (action: string, rw: any) => { };
  const rowData: any[] = [];

  const [isLoading, setIsLoading] = useState("");
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const reqFlds = [{ fld: "dt_rpt", msg: "Select the Date", chck: "length" }];

  const coldef = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "usrnm", hide: false, width: 500, headerName: "User Name" },
    {
      field: "ipadr",
      hide: false,
      width: 300,
      headerName: "IP Address",
    },
    { field: "sts", hide: false, width: 500, headerName: "State/UT" },
   
  ]
  const { showToaster, hideToaster } = useToaster();

  const getLst = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    showToaster( msg, 'error');
    if (msg && msg[0]) {
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
    let lvl: string = getLvl()
    let who: string = getWho()
    let dtno: string = getFldValue(state.textDts, "dt_rpt");
    let gid: any = GetGid();

    // let api: string = createGetApi(
    //   "db=nodb|dll=xrydll|fnct=a230", dt + '=' + lvl + '=' + who
    // );
   // return useNrjAxios({ apiCall: api });

    const payload: any = postLinux(lvl + '=' + who + '=' + dtno + '='+ gid,'dummy');  
    return nrjAxiosRequestBio("dummy", payload);

 
  };

  const ShowGrid = (dataSvd: any) => {

    setIsLoading("");
    // let dt: string = GetResponseWnds(dataSvd);
    let dt: any = GetResponseLnx(dataSvd);
   
     
    if (dt && Array.isArray(dt) && dt.length) {
      let ary: any[] = dt
      // if (ary && ary[0] && ary[0]['rpt']){
      //   dispatch({ type: ACTIONS.SETGID, payload: ary[0]['rpt'] });  
      // }
      let gid: string = "";
      let gd: any = utilities(3, "", "");
      gid = gd;
      dispatch({ type: ACTIONS.SETGID, payload: gid });
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    }
    else{
    showToaster(["No data received"], "error");
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

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  return (
    <>
      <div className="bg-white   ">
        <div className="shadow rounded-lg">
          <div className="col-span-10 flex justify-between">
            <div className="mt-4">
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
            </div>
            <div className="flex">
              <div className="  mt-4">
                <Tooltip title="Get list of daily cbwtf report">
                  <button
                    onClick={getLst}
                    className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50">
                    Get list
                  </button>
                </Tooltip>
              </div>
              <div className="  mt-4">
                {/* <Tooltip title="Print list of daily cbwtf report">
                  <button
                    onClick={printClick}
                    className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                  >
                    Print Button
                  </button>
                </Tooltip> */}
              </div>
            </div>
          </div>
          <div className="mt-2 font-semibold text-lg">{isLoading}</div>
          {showMessage && showMessage.message.length != 0 ? (
            <div className="py-2">
              <Toaster data={showMessage} className={""}></Toaster>
            </div>
          ) : (
            <></>
          )}
          <div className="bg-white shadow rounded-lg px-4 pb-6 pt-4">
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
            ></NrjAgGrid>
          </div>
        </div>
      </div>
    </>
  );
}

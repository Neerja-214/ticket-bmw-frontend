import React, { useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  svLnxSrvr,
} from "../../utilities/utilities";
import { Button, SvgIcon, Tooltip } from "@mui/material";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffectOnce } from "react-use";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios } from "../../Hooks/useNrjAxios";
import { Toaster } from "../../components/reusable/Toaster";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import GetAppIcon from '@mui/icons-material/GetApp';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { validForm } from "../../Hooks/validForm";
import HdrDrp from "../HdrDrp";
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
  NEWFRMDATA: "frmdatanw",
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
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
      return newstate;
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
    case ACTIONS.DISABLE:
      if (newstate.disableA == 1) {
        newstate.disableA = 0
      } else {
        newstate.disableA = 1
      }
      return newstate;
  }
};


const MonthlyHCFsts = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] })
  const [cbwtfnm, setCBwtfnm] = useState<string>("");

  const reqFlds = [{ fld: 'dt', msg: 'Enter Date', chck: 'length' }];


  const coldef = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "dt_wst", hide: false, width: 550, headerName: "Date" },
    { field: "sts", hide: false, width: 850, headerName: "Status" },
  ];

  const [countTillNow, setCountTillNow] = useState<number>(250);
  const GridLoaded = () => { };
  const navigate = useNavigate();
  const onRowSelected = (data: string) => {
  };
  const onButtonClicked = (action: string, rm: any) => { };

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
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

  const { showToaster, hideToaster } = useToaster();

  const getClick = () => {
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
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetch();
  }

  const getData = () => {
     
    let gid = GetGid();
    dispatch({ type: ACTIONS.SETGID, payload: gid })
    let dt = getFldValue(state.textDts, "dt");
    let hcfcod = getFldValue(state.textDts, 'hcfid').split('|')[0];
    let cbwtfid = getFldValue(state.textDts, 'cbwtfid').split('|')[0]
    let api: string = createGetApi("db=nodb|dll=accdll|fnct=c294", `${dt}=${gid}=${hcfcod}=${cbwtfid}`);
    return nrjAxios({ apiCall: api });
  };


  function populateGrid(data: any) {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    let dt: string = GetResponseWnds(data);
    if (dt) {
      let ary: any = dataStr_ToArray(dt);
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      // if (ary && ary.length == 250) {
      //   setCountTillNow(countTillNow + Number(ary.length));
      //   setTimeout(function () {
      //     refetchB();
      //   }, 400)
      // }
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      }, 250);
    }
  }

  const { data, refetch } = useQuery({
    queryKey: ['svQry', state.mainId, state.rndm],
    queryFn: getData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  })

  // const GetDataSec = () => {
  //   let gid = state.gid
  //   let api: string = createGetApi("db=nodb|dll=cntbkdll|fnct=d2", `${gid}=${countTillNow}=250`);
  //   return nrjAxios({ apiCall: api });
  // };

  // const { data: dataB, refetch: refetchB } = useQuery({
  //   queryKey: ['nxtQry', state.rndm],
  //   queryFn: GetDataSec,
  //   enabled: false,
  //   staleTime: Number.POSITIVE_INFINITY,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  //   onSuccess: populateGrid,
  // })



  const PrntRep = () => {
    let gid: string = state.gid
    if (!gid) {
      showToaster( ["populate the data in the grid"], 'error');
      return;
    }
    let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g117", `${gid}=0`);
    return nrjAxios({ apiCall: api });
  };

  const ShowReprtt = (dataC: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    if (dataC && dataC.data && dataC.data[0] && dataC.data[0]["Data"]) {
      window.open(dataC.data[0]["Data"], "_blank")
    }
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  }

  const { data: dataC, refetch: refetchC } = useQuery({
    queryKey: ['prntReports'],
    queryFn: PrntRep,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowReprtt,
  })


  function printClick() {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetchC()
  }

  useEffectOnce(() => {
    let cbwfnm: string = sessionStorage.getItem("cbwtfnm") || ""
    setCBwtfnm(cbwfnm)

  });

  return (
    <>
      <div>
        <HdrDrp hideHeader={false}></HdrDrp>
      </div>
      <div className="bg-white container-lg ">
        <Tooltip title={"Count of HCF Visited by CBWTF"}>
          <span className="text-center text-bold text-blue-600/75 my-4">
            <h5>Monthly Count of HCF visited by {cbwtfnm}</h5>
          </span>
        </Tooltip>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ms-5">
          <div className="mb-2">
            <NrjRsDt
              onChange={onChangeDts}
              format="yyyy-MMM"
              Label="Date"
              idText="txtdt"
              selectedValue={state.frmData}
              fldName='dt'
              speaker={'Enter Date'}
            ></NrjRsDt>
          </div>
          <div>
            <WtrRsSelect
              Label="CBWTF"
              fldName="cbwtfid"
              idText="txtcbwtfid"
              onChange={onChangeDts}
              selectedValue={state.frmData}
              clrFnct={state.trigger}
              allwZero={"0"}
              fnctCall={true}
              dbCon={"nodb"}
              typr={"589"}
              dllName={"xrydll"}
              fnctName={"a172"}
              parms={""}
              allwSrch={true}
              speaker={"Select CBTF"}
              delayClose={1000}
            ></WtrRsSelect>
          </div>
          <div className="mb-2">
            <WtrRsSelect
              Label="Regional Directorate"
              fldName="rgdid"
              idText="txtrgdid"
              onChange={onChangeDts}
              selectedValue={state.frmData}
              clrFnct={state.trigger}
              loadOnDemand={""}
              allwZero={"0"}
              fnctCall={true}
              dbCon={"shrtrm"}
              typr={"844"}
              dllName={"xrydll"}
              fnctName={"a136"}
              parms={""}
              allwSrch={true}
              speaker={"Select Regional Directorate"}
              delayClose={1000}
              placement="bottom"
              displayFormat="1"
            ></WtrRsSelect>
          </div>
          <div>
            <WtrRsSelect
              Label="State"
              fldName="anlstid"
              idText="txtanlstid"
              onChange={onChangeDts}
              selectedValue={state.frmData}
              clrFnct={state.trigger}
              allwZero={"1"}
              fnctCall={false}
              dbCon={"shrtrm"}
              typr={"880"}
              dllName={""}
              fnctName={""}
              parms={""}
              allwSrch={true}
              speaker={"Select the State Code"}
              delayClose={1000}
            ></WtrRsSelect>
          </div>
        </div>
        <div className="flex justify-end mr-5">
          <div className='mx-2'>
            <Button
              size="medium"
              style={{ backgroundColor: "#34c3ff", textTransform: "none" }}
              variant="contained"
              color="success"
              startIcon={<GetAppIcon />}
              disabled={!state.disableA}
              onClick={getClick}>
              Get
            </Button>
          </div>
          <div className='mx-2'>
            <Button
              size="medium"
              style={{ color: "#34c3ff", backgroundColor: "#fff" , textTransform: "none"}}
              variant="contained"
              color="success"
              endIcon={<LocalPrintshopIcon />}
              disabled={!state.disableA}
              onClick={printClick}>
              Print
            </Button>
          </div>
        </div>
        <div className="flex justify-between px-12 mb-2 items-center">
          {/* <div className="text-lg font-semibold">
                        Current Level : {sessionStorage.getItem("drillnm") || "CPCB"}
                    </div> */}
          {/* <Button
                        size="medium"
                        style={{
                            backgroundColor: "#ffff",
                            color: "#3B71CA",
                            border: "1px solid #3B71CA",
                        }}
                        variant="contained"
                        color="success"
                        disabled={!state.disableB}
                        onClick={() => {
                            navigate("/drillRgd?path=hcfvsttoday");
                        }}
                    >
                        <span className="whitespace-nowrap">Change Data Level</span>
                    </Button> */}
        </div>

        <div className="flex justify-centre px-12">
          <NrjAgGrid
            onGridLoaded={GridLoaded}
            onRowSelected={onRowSelected}
            colDef={coldef}
            apiCall={""}
            rowData={[]}
            deleteButton={""}
            deleteFldNm={""}
            showDataButton={''}
            onButtonClicked={() => { }}
            showFldNm={'cbtwf'}
            className='ag-theme-alpine-blue ag-theme-alpine'
            trigger={state.triggerG}
            showPagination={true}
            newRowData={state.nwRow}
          ></NrjAgGrid>
        </div>
      </div>
    </>
  );
};
export default React.memo(MonthlyHCFsts);

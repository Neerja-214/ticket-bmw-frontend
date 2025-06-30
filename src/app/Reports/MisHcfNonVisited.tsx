import React, { useCallback, useEffect, useReducer, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  getApplicationVersion,
  getStateFullFormWho,
  postLinux,
} from "../../utilities/utilities";
import { validForm } from "../../Hooks/validForm";

import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import HdrDrp from "../HdrDrp";
import { nrjAxios, nrjAxiosRequestBio, useNrjAxios } from "../../Hooks/useNrjAxios";
import { Toaster } from "../../components/reusable/Toaster";
import LevelSelector from "../dshbrd/LevelSelector";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { UseMomentDateNmb } from "../../Hooks/useMomentDtArry";
import { Button } from "@mui/material";
import moment from "moment";
import { useToaster } from "../../components/reusable/ToasterContext";
import { getLvl, getWho } from "../../utilities/cpcb";
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
  NEWFRMDATA: "frmdatanw",
  DISABLE: "disable",
  FORM_DATA2: "formdata2",
  SETCOMBOSTRB: "cmbstrB",
  SETCOMBOSTRC: "cmbstrC",
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
  combostrB: "",
  combostrC: "",
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
    case ACTIONS.FORM_DATA2:
      let dta2: string = "";
      let fldN2: any = utilities(2, action.payload, "");
      if (newstate.textDts2) {
        dta2 = newstate.textDts2 + "=";
        let d: any = utilities(1, dta2, fldN2);
        if (d) {
          dta2 = d;
        } else {
          dta2 = "";
        }
      }
      dta2 += action.payload;
      newstate.textDts2 = dta2;
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
    case ACTIONS.SETCOMBOSTRB:
      newstate.combostrB = action.payload;
      return newstate;
    case ACTIONS.SETCOMBOSTRC:
      newstate.combostrC = action.payload;
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
      }
  }
};

const HcfNonVisited = (props: any) => {
  console.log(props,"props")
  const [isLoading, setIsLoading] = useState("");
  const [lvl, setLvl] = useState("");
  const [who, setWho] = useState("");
  const [state, dispatch] = useReducer(reducer, initialState);
  const reqFlds = [{ fld: "dt_rptfrm", msg: "Select the  From date", chck: "length" }];
  const [coldef, setColdef] = useState([
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "cbwtfid", hide: true, width: 150, headerName: "CBWTF Id" },
    {
      field: "dt_rpt",
      hide: false,
      width: 150,
      headerName: "Date",
      // filter: "agTextColumnFilter",
      valueFormatter: (params:any) => {
        return format(new Date(params.value), 'dd-MMM-yyyy');
      },
    },
    {
      field: "cbwtfnm",
      hide: false,
      width: 350,
      tooltipField: 'cbwtfnm',
       headerName: "Name of CBWTF",
      filter: "agTextColumnFilter",
    },

    // { field: "hcfcount", hide: false, width: 180, headerName: "HCF Count" },
    // { field: "bedded", hide: false, width: 180, headerName: "Bedded" },
    // { field: "nonbedded", hide: false, width: 180, headerName: "Non Bedded" },
    // { field: "nvstd", hide: false, width: 180, headerName: "HCF Visited" },
    {
      field: "visitd",
      hide: false,
      width: 180,
      headerName: "HCF Visited",
    },
    {
      field: "notvisitd",
      hide: false,
      width: 180,
      headerName: "HCF Not Visited",
    },
    { field: "cty", hide: false, width: 150, headerName: "City" },
    {
      field: "rgd",
      hide: false,
      width: 180,
      headerName: "Regional directorate",
    },
    { field: "state", hide: false, width: 200, headerName: "State/UT" },
    // { field: "dt_wst", hide: false, width: 200, headerName: "Enter Date" },
  ]);

  const colDefPdf = [{
    field: "cbwtfnm",
    hide: false,
    headerName: "CPCB",
    filter: "agTextColumnFilter",
  },
  { field: "visitd", hide: false, width: 180, headerName: "HCF Visited", },
  { field: "notvisitd", hide: false, width: 180, headerName: "HCF Not Visited", },
  { field: "cty", hide: false, width: 150, headerName: "City" },
  { field: "rgd", hide: false, width: 180, headerName: "Regional directorate", },
  { field: "state", hide: false, width: 200, headerName: "State/UT" },]

  const pdfColWidth = ['20%', '20%', '20%', '10%', '15%', '*']



  const [prependContent, setPrependContent] = useState<any[]>([])


  const getPrependContentValue = (levelValue: string) => {
    return [
      [
        {
          data: {
            value: ' ',
            type: "String",
          },
          mergeAcross: 3
        },
        {
          data: {
            value: 'Count of HCF visited/non-visited ',
            type: "String",
          },
          mergeAcross: 3
        },
      ],
      [
        {
          data: {
            value: ' ',
            type: "String",
          },
          mergeAcross: 3
        },
        {
          data: {
            value: levelValue,
            type: "String",
          },
          mergeAcross: 5
        },
      ],
      [
        {
          data: {
            value: ' ',
            type: "String",
          },
          mergeAcross: 3
        },
        {
          data: {
            value: 'Date: ' + moment(Date.now()).format("DD-MMM-yyyy"),
            type: "String",
          },
          mergeAcross: 5
        },
      ],
      [],
    ]
  };

  const excelColWidth = [{ wch: 50 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }]

  const [printExcelHeader, setPrintExcelHeader] = useState<any[]>([])
  const [keyOrder, setKeyOrder] = useState<any[]>([])

  useEffect(() => {
    let tempOne: any[] = [];
    let tempTwo: any[] = [];
    coldef.forEach((res: any) => {
      if (res.children) {
        let str = res.headerName + " ";
        res.children.forEach((element: any) => {
          tempOne.push(element.field);
          tempTwo.push(str + element.headerName)
        });
      }
      else if (!res['hide']) {
        tempOne.push(res.field);
        tempTwo.push(res.headerName)
      }
    })
    setPrintExcelHeader(tempTwo);
    setKeyOrder(tempOne)
  }, [coldef])




  const coldefPrint = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "cbwtfid", hide: true, width: 150, headerName: "CBWTF Id" },
    {
      field: "cbwtfnm",
      hide: false,
      width: 350,
      tooltipField: 'cbwtfnm',
      headerName: "CPCB",
      filter: "agTextColumnFilter",
    },

    // { field: "hcfcount", hide: false, width: 180, headerName: "HCF Count" },
    // { field: "bedded", hide: false, width: 180, headerName: "Bedded" },
    // { field: "nonbedded", hide: false, width: 180, headerName: "Non Bedded" },
    // { field: "nvstd", hide: false, width: 180, headerName: "HCF Visited" },
    {
      field: "visitd",
      hide: false,
      width: 180,
      headerName: "HCF Visited",
    },
    {
      field: "notvisitd",
      hide: false,
      width: 180,
      headerName: "HCF Not Visited",
    },
    { field: "cty", hide: false, width: 150, headerName: "City" },
    {
      field: "rgd",
      hide: false,
      width: 180,
      headerName: "Regional directorate",
    },
    { field: "state", hide: false, width: 200, headerName: "State/UT" },
  ]
  const [showMessage, setShowMessage] = useState<any>({ message: [] });

  const rowData: any[] = [];
  const onRowSelected = (data: string) => { };
  const GridLoaded = () => { };
  const onButtonClicked = (action: string, rw: any) => { };
  const [totalNV, setTotalNotVisited] = useState(0);
  const [totalV, setTotalVisited] = useState(0);
  const onChangeDts2 = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA2, payload: data });
  };
  const { showToaster, hideToaster } = useToaster();

  const svClick = () => {
    let api: string = state.textDts2;
    let msg: any = validForm(api, reqFlds);
  
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
    dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 })

      refetch();
    }, 400);
  };


  const getList = () => {
    setIsLoading("Loading data...")
    setTotalNotVisited(0);
    setTotalVisited(0);
    let dateFrm = getFldValue(state.textDts2, "dt_rptfrm")
    let dateTo = getFldValue(state.textDts2, "dt_rptto")
    if (!dateFrm) {
      dateFrm = moment(Date.now()).format("DD-MMM-yyyy")

    } else if (!dateTo) {
      dateTo = moment(Date.now()).format("DD-MMM-yyyy")
    }
    let dtFrm = UseMomentDateNmb(dateFrm);
    let dtTo = UseMomentDateNmb(dateTo);
    let dtwise = true
    let dt = state.textDts2;
    let dt_rpt = UseMomentDateNmb(getFldValue(dt, "dt_rpt"));
    // let api: string = createGetApi(
    //   "db=nodb|fnct=a175|dll=xrydll",
    //   lvl + "=" + who + "=" + dt_rpt
    // );
    // return nrjAxios({ apiCall: api });
    // const payload: any = postLinux(lvl + '=' + who + '=' + dt_rpt, 'nonvisited');
    let payload: any = postLinux(lvl + "=" + who + '=' + "" + '=' + dtFrm + '=' + dtTo + '=' + dtwise, 'nonvisited');
    return nrjAxiosRequestBio("hcfnotvst", payload);
  };

  const ShowData = (dataSvd: any) => {
    setIsLoading("")
    dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    let dt: string = GetResponseLnx(dataSvd);
    let totalNotVisited: number = 0
    let totalVisited: number = 0
    if (dt && Array.isArray(dt) && dt.length) {
      let ary: any = dt;
      if (ary) {
        let i: number = 0;
        let bd: number = 0;
        let ntv: number = 0;
        while (i < ary.length) {
          bd = 0;
          ntv = 0;
          if (ary[i]["hcfcount"]) {
            bd = Number(ary[i]["hcfcount"]);
            if (bd > 0) {
              if (ary[i]["notvisitd"]) {
                ntv = Number(ary[i]["notvisitd"]);
                totalNotVisited += ntv
                ary[i]["nvstd"] = bd - ntv;
                totalVisited += bd - ntv
              }
            }
          }
          i++;
        }
        setTotalVisited(totalVisited);
        setTotalNotVisited(totalNotVisited);
      }
      ary = [...ary].sort((a, b) => a.rgd.localeCompare(b.rgd))
      ary = [...ary].sort((a, b) => a.state.localeCompare(b.state))
      ary = [...ary].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    }
    else {
      setShowMessage({ message: [dt], type: 'error' });
    }
  };

  const { data: dataSvd1, refetch: refetch } = useQuery({
    queryKey: ["svOldForm1", state.mainId, state.rndm],
    queryFn: getList,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  const applicationVerion: string = getApplicationVersion();

  const setLvlWhoData = (data: any) => {
    setTotalNotVisited(0);
    setTotalVisited(0);
    setLvl(data.lvl);
    setWho(data.who);
    let levelValue = 'Level: '
    if (data.lvl == "RGD") {
      levelValue += data.who + " " + "REGIONAL DIRECTORATE"
    }
    else if (data.lvl == 'STT') {
      levelValue += "SPCB" + " " + getStateFullFormWho(data.who)
    }
    else if (data.lvl == 'CBWTF') {
      levelValue += 'CBWTF : ' + data.name
    }
    else {
      levelValue += 'CPCB'
    }
    let a = getPrependContentValue(levelValue);
    setPrependContent(a)

    onChangeDts2(data.date)
    onChangeDts2(data.dateFrom);
    onChangeDts2(data.dateTo);
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    let updatedColdef = [...coldef];
    if (data.lvl == "RGD") {
      updatedColdef[3] = { ...updatedColdef[3], headerName: "Board" }
      setColdef(updatedColdef);
    }
    if (data.lvl == "STT") {
      updatedColdef[3] = { ...updatedColdef[3], headerName: "State/UT" }
      setColdef(updatedColdef);
    }
    if (data.lvl === "CPCB") {
      updatedColdef[3] = { ...updatedColdef[3], headerName: "CPCB" };
      setColdef(updatedColdef);
    }
    if (lvl == "CBWTF") {
      updatedColdef[3] = { ...updatedColdef[3], headerName: "CBWTF" };
      setColdef(updatedColdef);
    }
  }

  const PrntRep = () => {
    let gid: string = state.gid;
    if (!gid) {
      showToaster(["populate the data in the grid"], 'error')
      return;
    }
    let api: string = createGetApi("db=nodb|dll=dummy|fnct=dummy", `${gid}=0`);
    return nrjAxios({ apiCall: api });
  };

  const ShowReprtt = (dataC: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    if (dataC && dataC.data && dataC.data[0] && dataC.data[0]["Data"]) {
      window.open(dataC.data[0]["Data"], "_blank");
    } else {
      showToaster(["Please try again after refreshing the page!"],
        'error')
    }
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  };

  const { data: dataC, refetch: refetchC } = useQuery({
    queryKey: ["prntReports"],
    queryFn: PrntRep,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowReprtt,
  });

  function printClick() {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    refetchC();
  }

  // getPdfOnclick(){

  // }
  const [gridApi, setGridApi] = useState()
  // const onGridReady = useCallback((params:any) => {
  //   
  //   setGridApi(params.api);
  // }, [])
  // let gridApi :any;
  return (
    <>
      {applicationVerion == '1' && <> <div>
        <HdrDrp hideHeader={false} formName=""></HdrDrp>
      </div>
        <span className="text-center text-bold mt-3 text-blue-600/75">
          <h5>HCF Not Visited</h5>
        </span></>}
      <LevelSelector
        showCbwtf={false}
        levelSelectorData={setLvlWhoData}
        getListButton={true}
        getListOnclick={svClick}
        // printButton={true}
        // printButtonClick={printClick}
        // dateField={true}
        dateFieldFrom={true}
        dateFieldTo={true}
      ></LevelSelector>

      <div className="">
        <div className="shadow rounded-lg bg-white p-3">
         <div className=" font-semibold text-lg text-center ">{isLoading}</div>
          {showMessage && showMessage.message.length != 0 ? <div className="py-2">
            <Toaster data={showMessage} className={''}></Toaster>
          </div> : <></>}
          {totalV ? <div className="border rounded-lg">
            <div className="p-3">
              <p className="flex font-semibold">
                Total Health Care Units Visited : {totalV}
              </p>
              <p className="flex font-semibold">
                Total Health Care Units Not Visited : {totalNV}
              </p>
            </div>
          </div> : <></>}

          <div className="my-4">

            <NrjAgGrid
              onButtonClicked={onButtonClicked}
              onGridLoaded={GridLoaded}
              onRowSelected={onRowSelected}
              // onCellEdited={OnCellEdited}
              colDef={coldef}
              apiCall={""}
              rowData={rowData}
              deleteButton={""}
              deleteFldNm={""}
              newRowData={state.nwRow}
              trigger={state.triggerG}
              showPagination={true}
              className="ag-theme-alpine-blue ag-theme-alpine"
              // gridApiPdf = {gridApi}
              // onGridReady={onGridReady}
              showExport={true}
              pageTitle={"Count of HCF's visited/non-visited"}
              printExcelHeader={printExcelHeader}
              exceColWidth={excelColWidth}
              KeyOrder={keyOrder}
              lvl={lvl}
              who={who}
              colDefPdf={colDefPdf}
              pdfColWidth={pdfColWidth}
            ></NrjAgGrid>
          </div>
        </div>
      </div>
    </>
  );
};
export default React.memo(HcfNonVisited);

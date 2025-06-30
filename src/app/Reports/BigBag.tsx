import React, { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  getApplicationVersion,
  getCntWtInNumberBigBag,
  getCntWtInNumbers,
  getStateFullFormWho,
  postLinux,
} from "../../utilities/utilities";
import { Box, Tab, Tabs } from "@mui/material";
import { validForm } from "../../Hooks/validForm";

import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import HdrDrp from "../HdrDrp";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios, nrjAxiosRequestBio, useNrjAxios } from "../../Hooks/useNrjAxios";
import { Toaster } from "../../components/reusable/Toaster";
import { useNavigate } from "react-router-dom";
import LevelSelector from "../dshbrd/LevelSelector";
import CustomTabPanel from "./CustomTabPanel";
import { UseMomentDateNmb } from "../../Hooks/useMomentDtArry";
import { useToaster } from "../../components/reusable/ToasterContext";
import moment from "moment";
import { getLvl, getWho } from "../../utilities/cpcb";
import { format } from 'date-fns'

const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  NEWROWDATAB: "newrowB",
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
  nwRowB: [],
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
  nwRowB: any;
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
    case ACTIONS.NEWROWDATAB:
      newstate.triggerG = 1;
      newstate.nwRowB = action.payload;
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

const BigBag = (props: any) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState("")
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mainId, setMainId] = useState("");

  const reqFlds = [{ fld: "dt_rptfrm", msg: "Select the From date", chck: "length" }];
  const [coldef, setColdef] = useState<any[]>(
    [
      { field: "id", hide: true, width: 0, headerName: "" },
      { field: "fltr", hide: true, width: 140, headerName: "CBWTF ID" },
      {
        field: "dt_rpt",
        hide: false,
        width: 140,
        headerName: "Date",
        // filter: "agTextColumnFilter",
        valueFormatter: (params: any) => {
          return format(new Date(params.value), 'dd-MMM-yyyy');
        },
      },
      {
        field: "fltr",
        hide: false,
        width: 200,
        headerName: "CPCB",
        filter: "agTextColumnFilter",
        rowspan: 3
      },
      
      {
        field: "scanned",
        hide: false,
        width: 110,
        headerName: "Scan by",
        filter: "agTextColumnFilter",
      },
      {
        headerName: 'Red',
        children: [
          {
            field: "redcnt",
            hide: false,
           width: 85,
            headerName: "Bag",
            cellStyle: { color: "black", backgroundColor: "#ffcccb" },
            tooltipField: "tpred",
          },
          {
            field: "redwt",
            hide: false,
            width: 140,
            headerName: "Weight (in kg)",
            cellStyle: { color: "black", backgroundColor: "#ffcccb" },
            tooltipField: "tpred",
          },
        ]
      },
      {
        headerName: 'Yellow',
        children: [
          {
            field: "ylwcnt",
            hide: false,
           width: 85,
            headerName: "Bag",
            cellStyle: { color: "black", backgroundColor: "#FDFD97" },
            tooltipField: "tpylw",
          },
          {
            field: "ylwwt",
            hide: false,
            width: 140,
            headerName: " Weight (in kg)",
            cellStyle: { color: "black", backgroundColor: "#FDFD97" },
            tooltipField: "tpylw",
          },
        ]
      },
      {
        headerName: 'White',
        children: [
          {
            field: "whtcnt",
            hide: false,
           width: 85,
            headerName: "Bag",
            tooltipField: "tpwht",
          },
          {
            field: "whtwt",
            hide: false,
            width: 140,
            headerName: "Weight (in kg)",
            tooltipField: "tpwht",
          },]
      },
      {
        headerName: 'Blue',
        children: [
          {
            field: "blucnt",
            hide: false,
           width: 85,
            headerName: "Bag",
            cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
            tooltipField: "tpblu",
          },
          {
            field: "bluwt",
            hide: false,
            width: 140,
            headerName: " Weight (in kg)",
            cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
            tooltipField: "tpblu",
          },
        ]
      },
      {
        headerName: 'Cytotoxic',
        children: [
          {
            field: "cytcnt",
            hide: false,
           width: 85,
            headerName: " Bag",
            cellStyle: { color: "black", backgroundColor: "#FDFD97" },
            tooltipField: "tpcyt",
          },
          {
            field: "cytwt",
            hide: false,
            width: 140,
            headerName: " Weight (in kg)",
            cellStyle: { color: "black", backgroundColor: "#FDFD97" },
            tooltipField: "tpcyt",
          },
        ]
      },
      {
        field: "ttlcnt",
        hide: false,
        width: 120,
        headerName: "Total bags",
        filter: "agTextColumnFilter",
        rowspan: 3
      },
      {
        field: "ttlwt",
        hide: false,
        width: 210,
        headerName: "Total bags weight (in kg)",
        filter: "agTextColumnFilter",
        rowspan: 3
      },
      {
        field: "tbred",
        hide: true,
        headerName: "",
      },
      {
        field: "tbylw",
        hide: true,
        headerName: "",
      },
      {
        field: "tbwht",
        hide: true,
        headerName: "",
      },
      {
        field: "tbblu",
        hide: true,
        headerName: "",
      },
      {
        field: "tbcyt",
        hide: true,
        headerName: "",
      },

      {
        field: "rgd",
        hide: true,
        width: 200,
        headerName: "Regional directorate",
        filter: "agTextColumnFilter",
      },
      {
        field: "state",
        hide: true,
        width: 200,
        headerName: "State/UT",
        filter: "agTextColumnFilter",
      },
      { field: "stt", hide: true, width: 140, headerName: "State/UT" },
    ]);

  const colDefPdf = [
    {
      field: "fltr",
      hide: false,
      width: 250,
      headerName: "CPCB",
      filter: "agTextColumnFilter",
      rowspan: 3
    },
    {
      field: "scanned",
      hide: false,
      width: 200,
      headerName: "Scan by",
      filter: "agTextColumnFilter",
    },
    {
      headerName: 'Red',
      children: [
        {
          field: "redcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
        },
        {
          field: "redwt",
          hide: false,
          width: 140,
          headerName: "Weight (in kg)",
        },
      ]
    },
    {
      headerName: 'Yellow',
      children: [
        {
          field: "ylwcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
        },
        {
          field: "ylwwt",
          hide: false,
          width: 140,
          headerName: " Weight (in kg)",
        },
      ]
    },
    {
      headerName: 'White',
      children: [
        {
          field: "whtcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
        },
        {
          field: "whtwt",
          hide: false,
          width: 140,
          headerName: "Weight (in kg)",
        },]
    },
    {
      headerName: 'Blue',
      children: [
        {
          field: "blucnt",
          hide: false,
         width: 85,
          headerName: "Bag",
        },
        {
          field: "bluwt",
          hide: false,
          width: 140,
          headerName: " Weight (in kg)",
        },
      ]
    },
    {
      headerName: 'Cytotoxic',
      children: [
        {
          field: "cytcnt",
          hide: false,
         width: 85,
          headerName: " Bag",
        },
        {
          field: "cytwt",
          hide: false,
          width: 140,
          headerName: " Weight (in kg)",
        },
      ]
    },
    {
      field: "ttlcnt",
      hide: false,
      width: 120,
      headerName: "Total bags",
    },
    {
      field: "ttlwt",
      hide: false,
      width: 170,
      headerName: "Total Bags Weight",
      filter: "agTextColumnFilter",
    },
  ]

  const pdfColWidth = ['10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%', '10%']


  const excelColWidth = [{ wch: 50 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }]

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



  const [lvl, setLvl] = useState("")
  const [who, setWho] = useState("")
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const rowData: any[] = [];
  const onRowSelected = (data: string) => { };
  const GridLoaded = () => { };
  const onButtonClicked = (action: string, rw: any) => { };

  let cbwtfid = "";
  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };
  const { showToaster, hideToaster } = useToaster();
  const svClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
  
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    setTimeout(() => {
      refetch();
      //refetch2();
    }, 400);
  };


  const getList = (type: any) => {
    handleChange(undefined, 0);
    setIsLoading("Loading data...")
    let dateFrm = getFldValue(state.textDts, "dt_rptfrm")
    let dateTo = getFldValue(state.textDts, "dt_rptto")
    if (!dateFrm) {
      dateFrm = moment(Date.now()).format("DD-MMM-yyyy")

    } else if (!dateTo) {
      dateTo = moment(Date.now()).format("DD-MMM-yyyy")
    }
    let dtFrm = UseMomentDateNmb(dateFrm);
    let dtTo = UseMomentDateNmb(dateTo);
    let dtwise = true
    let gd: any = utilities(3, "", "");
    let gid: string = gd;
    dispatch({ type: ACTIONS.SETGID, payload: gid });
    let payload: any = postLinux(lvl + "=" + who + '=' + "" +  '='+dtFrm + '=' + dtTo + '='+ dtwise + '='+ gid + "=" + type, 'getbigbags');
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    setTimeout(function () {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
    }, 1000);
    return nrjAxiosRequestBio("getbigbags", payload);
  };


  function groupData(ary: any[], filterValue: string) {
    let uniqueAry: any = {};
    let uniqueArySummary: any = {};
    let fltr: string = lvl == 'CPCB' ? 'CPCB' : lvl == 'CBWTF' ? ary[0].cbwtfnm : who;

    ary.forEach((element: any) => {
      if (element !== null && element !== undefined) {
        let data = getCntWtInNumberBigBag(element)
      if (!uniqueAry[element[filterValue]]) {
        uniqueAry[element[filterValue]] = [{ ...data }];
      }
      else {
        let index = -1;
        for (let i = 0; i < uniqueAry[element[filterValue]].length; i++) {
          if (element.scby == uniqueAry[element[filterValue]][i].scby) {
            index = i;
            break;
          }
        }
        if (index >= 0) {
          uniqueAry[element[filterValue]][index] = {
            ...uniqueAry[element[filterValue]][index],
            redcnt: uniqueAry[element[filterValue]][index]['redcnt'] + data.redcnt,
            ylwcnt: uniqueAry[element[filterValue]][index]['ylwcnt'] + data.ylwcnt,
            blucnt: uniqueAry[element[filterValue]][index]['blucnt'] + data.blucnt,
            whtcnt: uniqueAry[element[filterValue]][index]['whtcnt'] + data.whtcnt,
            cytcnt: uniqueAry[element[filterValue]][index]['cytcnt'] + data.cytcnt,
            redwt: uniqueAry[element[filterValue]][index]['redwt'] + data.redwt,
            ylwwt: uniqueAry[element[filterValue]][index]['ylwwt'] + data.ylwwt,
            bluwt: uniqueAry[element[filterValue]][index]['bluwt'] + data.bluwt,
            whtwt: uniqueAry[element[filterValue]][index]['whtwt'] + data.whtwt,
            cytwt: uniqueAry[element[filterValue]][index]['cytwt'] + data.cytwt,
            ttlcnt: uniqueAry[element[filterValue]][index].ttlcnt + data.ttlcnt,
            ttlwt: uniqueAry[element[filterValue]][index].ttlwt + data.ttlwt
          }
        }
        else {
          uniqueAry[element[filterValue]] = [...uniqueAry[element[filterValue]], { ...data }];
        }
      }

      if (!uniqueArySummary[fltr]) {
        uniqueArySummary[fltr] = [{ ...data }]
      }
      else {
        let index = -1;
        for (let i = 0; i < uniqueArySummary[fltr].length; i++) {
          if (element.scby == uniqueArySummary[fltr][i].scby) {
            index = i;
            break;
          }
        }
        if (index >= 0) {
          uniqueArySummary[fltr][index] = {
            ...uniqueArySummary[fltr][index],
            redcnt: uniqueArySummary[fltr][index]['redcnt'] + data.redcnt,
            ylwcnt: uniqueArySummary[fltr][index]['ylwcnt'] + data.ylwcnt,
            blucnt: uniqueArySummary[fltr][index]['blucnt'] + data.blucnt,
            whtcnt: uniqueArySummary[fltr][index]['whtcnt'] + data.whtcnt,
            cytcnt: uniqueArySummary[fltr][index]['cytcnt'] + data.cytcnt,
            redwt: uniqueArySummary[fltr][index]['redwt'] + data.redwt,
            ylwwt: uniqueArySummary[fltr][index]['ylwwt'] + data.ylwwt,
            bluwt: uniqueArySummary[fltr][index]['bluwt'] + data.bluwt,
            whtwt: uniqueArySummary[fltr][index]['whtwt'] + data.whtwt,
            cytwt: uniqueArySummary[fltr][index]['cytwt'] + data.cytwt,
            ttlcnt: uniqueArySummary[fltr][index].ttlcnt + data.ttlcnt,
            ttlwt: uniqueArySummary[fltr][index].ttlwt + data.ttlwt
          }
        }
        else {
          uniqueArySummary[fltr] = [...uniqueArySummary[fltr], { ...data }];
        }
      }
    }
    });
    return [uniqueAry, uniqueArySummary]
  }


  const ShowData = (dataSvd: any) => {
    setIsLoading("")
    let dt: any = GetResponseLnx(dataSvd);
    let ary: any = dataSvd.data;
    let arySummary: any[] = [];
    if (Array.isArray(ary) && ary.length) {
      let filtervalue: string = lvl == 'CPCB' ? 'rgd' : lvl == 'RGD' ? 'state' : 'cbwtfnm'
      let [uniqueAry, uniqueArySummary] = groupData(ary, filtervalue)
      let tempArray: any[] = [];
      let tempArraySummary: any[] = [];
      Object.keys(uniqueAry).forEach((res: any) => {
        uniqueAry[res].forEach((e: any) => {
          let scby: string = e.scby == 'fct' ? 'At CBWTF' : e.scby == 'cbwtf' ? 'Operator' : e.scby == 'hcf' ? 'By HCF' : e.scby;
          tempArray.push({ fltr: res, scanned: scby, ...e,redwt:parseFloat(e.redwt.toFixed(3)),ylwwt:parseFloat(e.ylwwt.toFixed(3)),bluwt:parseFloat(e.bluwt.toFixed(3)),whtwt:parseFloat(e.whtwt.toFixed(3)),cytwt:parseFloat(e.cytwt.toFixed(3)), ttlwt: parseFloat(e.ttlwt.toFixed(3))  });
        })
      })
      Object.keys(uniqueArySummary).forEach((res: any) => {
        uniqueArySummary[res].forEach((e: any) => {
          let scby: string = e.scby == 'fct' ? 'At CBWTF' : e.scby == 'cbwtf' ? 'Operator' : e.scby == 'hcf' ? 'By HCF' : e.scby;
          tempArraySummary.push({ fltr: lvl == 'STT' ? getStateFullFormWho(res) : res, scanned: scby, ...e,redwt:parseFloat(e.redwt.toFixed(3)),ylwwt:parseFloat(e.ylwwt.toFixed(3)),bluwt:parseFloat(e.bluwt.toFixed(3)),whtwt:parseFloat(e.whtwt.toFixed(3)),cytwt:parseFloat(e.cytwt.toFixed(3)), ttlwt: e.ttlwt.toFixed(3) });
        })
      })
      ary = [...tempArray]
      arySummary = [...tempArraySummary]
    }
    else {
      dispatch({ type: ACTIONS.NEWROWDATA, payload: [] });
      showToaster([dt], 'error');
    }
    // setRowData(ary)
    if (Array.isArray(ary) && ary.length > 0) {
      ary = [...ary].sort((a, b) => a.fltr.localeCompare(b.fltr));
    }
    
    dispatch({ type: ACTIONS.NEWROWDATAB, payload: ary });
    dispatch({ type: ACTIONS.NEWROWDATA, payload: arySummary });
  };


  const { data: dataSvd1, refetch: refetch } = useQuery({
    queryKey: ["svOldForm1", state.textDts],
    queryFn: () => getList(1),
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });





  const cellClassRulesValues = [
    {
      cellName: 'dts',
      color: 'yellow-row',
      value: 'Yellow Bags',
      colorEntireRow: true
    },
    {
      cellName: 'dts',
      color: 'red-row',
      value: 'Red Bags',
      colorEntireRow: true
    },
    {
      cellName: 'dts',
      color: 'blue-row',
      value: 'Blue Bags',
      colorEntireRow: true
    },
    {
      cellName: 'dts',
      color: 'white-row',
      value: 'White Bag',
      colorEntireRow: true
    },
    {
      cellName: 'dts',
      color: 'cyt-row',
      value: 'Cytotoxic Bags',
      colorEntireRow: true
    },
    {
      cellName: 'dts',
      color: 'all-row',
      value: 'All Bags',
      colorEntireRow: true
    },
  ]
  const applicationVerion: string = getApplicationVersion();

  const setLvlWhoData = (data: any) => {
    if (lvl == "CBWTF") {
      setValueType(0)
    }
    setLvl(data.lvl);
    setWho(data.who);


    onChangeDts(data.dateFrom);
    onChangeDts(data.dateTo);
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
    let updatedColdef = [...coldef];
    if (data.lvl == "RGD") {
      updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "Board" } : { ...updatedColdef[2], headerName: "State/UT" }; // Update the headerName of the second element
      setColdef(updatedColdef);

    } else if (data.lvl.toUpperCase() == "STT") {
      updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[2], headerName: "CBWTF" }; // Update the headerName of the second element
      setColdef(updatedColdef);
    } else if (data.lvl == "CBWTF") {
      updatedColdef[3] = { ...updatedColdef[3], headerName: "CBWTF" };
      setColdef(updatedColdef);
    } else {
      updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "CPCB" } : { ...updatedColdef[2], headerName: "Board" }; // Update the headerName of the second element
      setColdef(updatedColdef);
    }

  }
  const [valueType, setValueType] = useState(0);
  const handleChange = (event: React.SyntheticEvent | undefined, newValue: number) => {
    setValueType(newValue);
    let updatedColdef = [...coldef];

    if (lvl == "RGD") {
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "Regional directorate" } : { ...updatedColdef[3], headerName: "State/UT" }; // Update the headerName of the second element
      setColdef(updatedColdef);

    } else if (lvl.toUpperCase() == "STT") {
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[3], headerName: "CBWTF" }; // Update the headerName of the second element
      setColdef(updatedColdef);
    } else if (lvl == "CBWTF") {
      updatedColdef[3] = { ...updatedColdef[3], headerName: "CBWTF" };
      setColdef(updatedColdef);
    } else {
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "CPCB" } : { ...updatedColdef[3], headerName: "Regional directorate" };
      // updatedColdef[2] = { ...updatedColdef[2], headerName: "CPCB" }; // Update the headerName of the second element
      setColdef(updatedColdef);
    }
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  return (
    <>
      {applicationVerion == '1' && <>  <div>
        <HdrDrp hideHeader={false} formName=""></HdrDrp>
      </div>
        <span className="text-center text-bold mt-3 text-blue-600/75">
          <h5>List of Waste Bag above 25 Kg </h5>
        </span></>}
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
      <div className="">

        <div className="bg-white shadow rounded-lg px-4 pb-6 pt-3">
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={valueType} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Summary" {...a11yProps(0)} />
                {lvl !== "CBWTF" ? <Tab label="Details" {...a11yProps(1)} /> : null}

              </Tabs>
            </Box>
            <CustomTabPanel value={valueType} index={0}>

              <div>
                <div className="absolute font-semibold text-lg mx-11">{isLoading}</div>
                {showMessage && showMessage.message.length != 0 && <div className="py-2">
                  <Toaster data={showMessage} className={''}></Toaster>
                </div>}
                <NrjAgGrid
                  onButtonClicked={onButtonClicked}
                  onGridLoaded={GridLoaded}
                  onRowSelected={onRowSelected}
                  colDef={coldef}
                  apiCall={""}
                  rowData={rowData}
                  deleteButton={""}
                  deleteFldNm={""}
                  newRowData={state.nwRow}
                  trigger={state.triggerG}
                  showPagination={true}
                  className="ag-theme-alpine-blue ag-theme-alpine"
                  cellClassRulesValues={cellClassRulesValues}
                  appName="CPCB"
                  showExport={true}
                  pageTitle={"List of waste bag above 25 Kg "}
                  printExcelHeader={printExcelHeader}
                  exceColWidth={excelColWidth}
                  KeyOrder={keyOrder}
                  lvl={lvl}
                  who={who}
                  colDefPdf={colDefPdf}
                  pdfColWidth={pdfColWidth}
                ></NrjAgGrid>
              </div>
            </CustomTabPanel>
            {lvl !== "CBWTF" ?
              <CustomTabPanel value={valueType} index={1}>

                <div>
                  <div className="absolute font-semibold text-lg mx-11">{isLoading}</div>
                  {showMessage && showMessage.message.length != 0 && <div className="py-2">
                    <Toaster data={showMessage} className={''}></Toaster>
                  </div>}
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
                    newRowData={state.nwRowB}
                    trigger={state.triggerG}
                    showPagination={true}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    cellClassRulesValues={cellClassRulesValues}
                    appName="CPCB"
                    showExport={true}
                    pageTitle={"List of waste bag above 25 Kg "}
                    printExcelHeader={printExcelHeader}
                    exceColWidth={excelColWidth}
                    KeyOrder={keyOrder}
                    lvl={lvl}
                    who={who}

                  ></NrjAgGrid>
                </div>
              </CustomTabPanel> : null}

          </Box>

        </div>
      </div>
    </>
  );
};
export default React.memo(BigBag);

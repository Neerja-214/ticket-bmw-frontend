import React, { useEffect, useReducer, useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  TotalForTable,
  createGetApi,
  dataStr_ToArray,
  getApplicationVersion,
  getStateFullFormWho,
  postLinux,
} from "../../utilities/utilities";
import { Box, Button, SvgIcon, Tab, Tabs } from "@mui/material";
import { validForm } from "../../Hooks/validForm";

import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { useNavigate } from "react-router-dom";
import HdrDrp from "../HdrDrp";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { getFldValue } from "../../Hooks/useGetFldValue";
import {
  nrjAxios, nrjAxiosRequestBio
} from "../../Hooks/useNrjAxios";
import { Toaster } from "../../components/reusable/Toaster";
import LevelSelector from "../dshbrd/LevelSelector";
import CustomTabPanel from "./CustomTabPanel";
import { UseMomentDateNmb } from "../../Hooks/useMomentDtArry";
import { useToaster } from "../../components/reusable/ToasterContext";
import moment from "moment";
import { getLvl, getWho } from "../../utilities/cpcb";
import {format} from 'date-fns'

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
      newstate.triggerG = 1;
      newstate.nwRow = action.payload;
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

const BagCountLbl = (props: any) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState("")
  const [state, dispatch] = useReducer(reducer, initialState);
  const [lvl, setLvl] = useState("");
  const [who, setWho] = useState("");
  const [total, setTotal] = useState(0)
  const reqFlds = [{ fld: "dt_rptfrm", msg: "Select the  From date", chck: "length" }];
  const [coldef, setColdef] = useState([
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "cbwtfid", hide: true, width: 150, headerName: "CBWTFID" },
    {
      field: "dt_rpt",
      hide: false,
      width: 150,
      headerName: "Date",
      filter: "agTextColumnFilter",
      valueFormatter: (params:any) => {
        let  dateSegments:any[]=[];
         dateSegments = params.value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g);
         let formattedDate = '';
    
         if (dateSegments) {
            for (let i = 0; i < dateSegments.length; i++) {
              const date = new Date(dateSegments[i]);
              if (!isNaN(date.getTime())) {
                formattedDate = format(date, 'dd-MMM-yyyy');
                break; // Stop processing after the first valid date is found
              }
            }
          }
        
          // Return the formatted date
          return formattedDate;
         
      },
    },
    {
      field: "cbwtfnm",
      hide: false,
      width: 350,
       headerName: "Name of CBWTF",
      tooltipField: 'cbwtfnm',
      filter: "agTextColumnFilter",
    },
    { field: "dts", hide: false, width: 210, headerName: "Bags" },
    { field: "stt", hide: true, width: 200, headerName: "State/UT" },
    { field: "state", hide: true, width: 200, headerName: "State/UT" },
    {
      field: "rgd",
      hide: true,
      width: 200,
      headerName: "Regional directorate",
    },
    { field: "lbl", hide: false, width: 250, headerName: "Count (with label)" },
    {
      field: "nolbl",
      hide: false,
      width: 250,
      headerName: "Count (without label)",
    }
  ]);
  const [prependContent, setPrependContent] = useState<any[]>([])


  const getPrependContentValue = (levelValue: string) => {
    return [
      [

        {
          data: {
            value: 'Summary of waste bag with and without label count',
            type: "String",
          },
          mergeAcross: 3
        },
      ],
      [

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
            value: 'Date: ' + moment(Date.now()).format("DD-MMM-yyyy"),
            type: "String",
          },
          mergeAcross: 5
        },
      ],
      [],
    ]
  };

   const [colDefPdf, setColDefPdf] = useState( [
    {
      field: "cbwtfnm",
      hide: false,
      width: 350,
       headerName: "Name of CBWTF",
      tooltipField: 'cbwtfnm',
      filter: "agTextColumnFilter",
     
    },
    { field: "dts", hide: false, width: 300, headerName: "Bags" },
    { field: "lbl", hide: false, width: 250, headerName: "Count (with label)" },
    {
      field: "nolbl",
      hide: false,
      width: 250,
      headerName: "Count (Without Label)",
    }
  ])

  
  const pdfColWidth = ['30%','30%' , '20%',  '20%']


  const excelColWidth = [{wch: 50},{wch: 30},{wch: 30}, {wch: 30}, {wch: 30}]

  const [printExcelHeader, setPrintExcelHeader] = useState<any[]>([])
  const [keyOrder, setKeyOrder] = useState<any[]>([])

  useEffect(()=>{
    let tempOne:any[] = [];
    let tempTwo:any[] = [];
    coldef.forEach((res:any)=>{
      if(res.children){
        let str = res.headerName  + " " ;
        res.children.forEach((element:any) => {
          tempOne.push(element.field);
          tempTwo.push(str + element.headerName)
        });
      }
      else if(!res['hide']){
        tempOne.push(res.field);
        tempTwo.push(res.headerName)
      }
    })
    setPrintExcelHeader(tempTwo);
    setKeyOrder(tempOne)
  },[coldef])



  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const [summaryRowData, setSummaryRowData] = useState<any[]>([])
  const [detailedRowData, setDetailedRowData] = useState<any[]>([])

  const onRowSelected = (data: string) => { };
  const GridLoaded = () => { };

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };
  const { showToaster, hideToaster } = useToaster();

  const getClick = () => {
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
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    setTimeout(() => {
      refetch();
      //refetch2();
    }, 400);
  };


  const getList = (type: number) => {
    setTotal(0)
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

    let gid: any = utilities(3, "", "");
    let gd: string = gid;
    if (type == 1) {
      dispatch({ type: ACTIONS.SETGID, payload: gd });
    } else {
      dispatch({ type: ACTIONS.SETCOMBOSTRB, payload: gd });
    }

    // let smry: string = Type.toString()
    // let api: string = createGetApi(
    //   "db=nodb|dll=xrydll|fnct=a181",
    //   lvl + "=" + who + "=" + dt + "=" + gd + "=" + type
    // );

    // return nrjAxios({ apiCall: api });
    const payload: any = postLinux(lvl + '=' + who + '=' + "" +'=' + dtFrm +'='+ dtTo + '='+ dtwise + '=' + gid, 'mislabel');
    // let payload: any = postLinux(lvl + '=' + who + '=' + "" + '=' + dtFrm gid, 'mislabel');
    return nrjAxiosRequestBio("show_lblCnt", payload);


  };

  // const ShowData = (dataSvd1: any) => {
  //   setIsLoading("")
  //   dispatch({ type: ACTIONS.DISABLE, payload: 1 });
  //   let dt: string = GetResponseWnds(dataSvd1);
  //   let ary: any = [];
  //   if (dt) {
  //     let total = 0
  //     ary = dataStr_ToArray(dt);
  //     ary.map((ech: any) => {
  //       if (ech.dts == "All Bags") {
  //         total += Number(ech.lbl) + Number(ech.nolbl)
  //       }
  //     })
  //     setTotal(total)
  //     if (lvl == "CPCB") {
  //       ary = ary.map((res: any) => {
  //         return { ...res, cbwtfnm: "CPCB" }
  //       })
  //     }
  //   }
  //   if (dt == "" || dataSvd1.data[0].Status == 'Failed') {
  //     showToaster( ['Did not find any Data'], 'success');
  //   }
  //   dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
  //   setTimeout(function () {
  //     dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
  //   }, 800);
  // };

  const colorLabel = [
    ["Blue Bags", 'blulbl', 'blunolbl', 0, 'dt_rpt'],
    ["Yellow Bags", 'ylwlbl', 'ylwnolbl', 1, 'dt_rpt'],
    ["Red Bags", 'redlbl', 'rednolbl', 2, 'dt_rpt'],
    ["White Bags", 'whtlbl', 'whtnolbl', 3, 'dt_rpt'],
    ["Cytotoxic Bags", 'cytlbl', 'cytnolbl', 4, 'dt_rpt'],
    ["All Bags", 'lbl', 'nolbl', 5, 'dt_rpt'],
  ];
  
  const ShowData = (dataSvd1: any) => {
    setIsLoading("");
  
    let dt: any = GetResponseLnx(dataSvd1);
    let ary: any = [];
  
    if (dt && Array.isArray(dt) && dt.length) {
      let total = 0;
      ary = dt;
      let tempSummary: any = {};
      let tempDetailed: any = {};
      let uniqueDates = new Set();
  
      ary.forEach((res: any) => {
        colorLabel.forEach((element: any) => {
          const dateKey = res[element[4]]; // Use date as key
          uniqueDates.add(dateKey); // Track unique dates
  
          // Initialize tempSummary for each date and level
          if (!tempSummary[dateKey]) {
            tempSummary[dateKey] = {};
          }
          if (!tempSummary[dateKey][element[3]]) {
            tempSummary[dateKey][element[3]] = {
              cbwtfnm: lvl === 'CPCB' ? 'CPCB' : lvl === 'STT' ? getStateFullFormWho(who) : lvl === 'CBWTF' ? res.cbwtfnm : who,
              dts: element[0],
              lbl: 0,
              nolbl: 0,
              dt_rpt: dateKey, // Initialize dt_rpt
            };
          }
  
          // Aggregate data for tempSummary
          tempSummary[dateKey][element[3]].lbl += res[element[1]];
          tempSummary[dateKey][element[3]].nolbl += res[element[2]];
  
          // Initialize tempDetailed for each date and level
          if (lvl === 'CPCB') {
            if (!tempDetailed[res.rgd]) {
              tempDetailed[res.rgd] = {};
            }
            if (!tempDetailed[res.rgd][dateKey]) {
              tempDetailed[res.rgd][dateKey] = {};
            }
            if (!tempDetailed[res.rgd][dateKey][element[3]]) {
              tempDetailed[res.rgd][dateKey][element[3]] = {
                cbwtfnm: res.rgd,
                dts: element[0],
                lbl: 0,
                nolbl: 0,
                dt_rpt: dateKey, // Set dt_rpt
              };
            }
            tempDetailed[res.rgd][dateKey][element[3]].lbl += res[element[1]];
            tempDetailed[res.rgd][dateKey][element[3]].nolbl += res[element[2]];
          } else if (lvl === 'RGD') {
            if (!tempDetailed[res.stt]) {
              tempDetailed[res.stt] = {};
            }
            if (!tempDetailed[res.stt][dateKey]) {
              tempDetailed[res.stt][dateKey] = {};
            }
            if (!tempDetailed[res.stt][dateKey][element[3]]) {
              tempDetailed[res.stt][dateKey][element[3]] = {
                cbwtfnm: getStateFullFormWho(res.stt),
                dts: element[0],
                lbl: 0,
                nolbl: 0,
                dt_rpt: dateKey, // Set dt_rpt
              };
            }
            tempDetailed[res.stt][dateKey][element[3]].lbl += res[element[1]];
            tempDetailed[res.stt][dateKey][element[3]].nolbl += res[element[2]];
          } else if (lvl === 'STT') {
            if (!tempDetailed[res.cbwtfnm]) {
              tempDetailed[res.cbwtfnm] = {};
            }
            if (!tempDetailed[res.cbwtfnm][dateKey]) {
              tempDetailed[res.cbwtfnm][dateKey] = {};
            }
            if (!tempDetailed[res.cbwtfnm][dateKey][element[3]]) {
              tempDetailed[res.cbwtfnm][dateKey][element[3]] = {
                cbwtfnm: res.cbwtfnm,
                dts: element[0],
                lbl: 0,
                nolbl: 0,
                dt_rpt: dateKey, // Set dt_rpt
              };
            }
            tempDetailed[res.cbwtfnm][dateKey][element[3]].lbl += res[element[1]];
            tempDetailed[res.cbwtfnm][dateKey][element[3]].nolbl += res[element[2]];
          }
        });
      });
  
      // Flatten tempSummary
      let flattenedSummary: any[] = [];
      uniqueDates.forEach((dateKey: any) => {
        Object.values(tempSummary[dateKey]).forEach((summary: any) => {
          flattenedSummary.push(summary);
        });
      });
  
      // Flatten tempDetailed
      let det: any[] = [];
      Object.values(tempDetailed).forEach((regionObj: any) => {
        Object.values(regionObj).forEach((dateObj: any) => {
          Object.values(dateObj).forEach((detail: any) => {
            det.push(detail);
          });
        });
      });
      det = [...det].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
      flattenedSummary = [...flattenedSummary].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
  
      setDetailedRowData(det);
      setSummaryRowData(flattenedSummary);
  
      flattenedSummary.forEach((ech: any) => {
        total += Number(ech.nolbl) + Number(ech.lbl);
      });
      dispatch({ type: ACTIONS.NEWROWDATAB, payload: flattenedSummary });
      dispatch({ type: ACTIONS.NEWROWDATA, payload: det });
  
      setTotal(Math.floor(total));
    } else {
      showToaster([dt], 'error');
    }
  };
  
  


  const { data: dataSvd1, refetch: refetch } = useQuery({
    queryKey: ["getBagCountLbl", state.rndm],
    queryFn: () => getList(1),
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });


  const PrntRep = () => {
    let gid: string = state.gid;
    if (valueType == 0) {
      gid = state.gid
    } else {
      gid = state.combostrB
    }
    if (!gid) {
      showToaster(["populate the data in the grid"], 'error');
      return;
    }
    let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g127", `5=${gid}=0`);
    return nrjAxios({ apiCall: api });
  };

  const ShowReprtt = (dataC: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    let dt: string = GetResponseWnds(dataC)
    if (dt && dt.indexOf(".pdf") > -1) {
      window.open(dt, "_blank");
    } else {
      showToaster(["Please try again after refreshing the page!"],
        'error')
    }
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  };

  const { data: dataC, refetch: refetchC } = useQuery({
    queryKey: ["prntReports", state.rndm],
    queryFn: PrntRep,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowReprtt,
  });

  // const [Type, setType] = useState<number>(1);

  // const handleTypeChange = (type: any) => {
  //   setType(type);
  //   dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
  // };

  function printClick() {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    refetchC();
  }

  const rowClassRulesValues = {
    numerator: "lbl",
    denominator: "nolbl",
  };

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
      color: 'yellow-row',
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

  const ratio = [
    { maxNumber: 10, minNumber: 0, equalto: 0, color: 'red-row' },
    { maxNumber: 20, minNumber: 10, equalto: 20, color: 'yellow-row' },
    { maxNumber: 50, minNumber: 20, equalto: 50, color: 'blue-row' }
  ]


  const applicationVerion: string = getApplicationVersion();

  const setLvlWhoData = (data: any) => {
    setSummaryRowData([])
    setDetailedRowData([])
    // dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    
    if (lvl == "cbwtf") {
      setValueType(0)
    }
    setTotal(0)
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
    onChangeDts(data.dateFrom);
    onChangeDts(data.dateTo);
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
    let updatedColdef = [...coldef];
    let updateColdefPdf = [...colDefPdf]
    if (data.lvl == "RGD") {
      updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "Board" } : { ...updatedColdef[2], headerName: "State/UT" }; // Update the headerName of the second element
      setColdef(updatedColdef);

      updateColdefPdf[0] = valueType == 0 ? { ...updateColdefPdf[0], headerName: "Board" } : { ...updateColdefPdf[0], headerName: "State/UT" }; // Update the headerName of the second element
      setColDefPdf(updateColdefPdf);
    }
    if (data.lvl == "STT") {
      updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[2], headerName: "CBWTF" }; // Update the headerName of the second element
      setColdef(updatedColdef);

      updateColdefPdf[0] = valueType == 0 ? { ...updateColdefPdf[0], headerName: "State/UT" } : { ...updateColdefPdf[0], headerName: "CBWTF" }; // Update the headerName of the second element
      setColDefPdf(updateColdefPdf);
    }
    if (data.lvl === "CPCB") {
      updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "CPCB" } : { ...updatedColdef[2], headerName: 'Board' }; // Update the headerName of the second element
      setColdef(updatedColdef);

      updateColdefPdf[0] = valueType == 0 ? { ...updateColdefPdf[0], headerName: "CPCB" } : { ...updateColdefPdf[0], headerName: 'Board' }; // Update the headerName of the second element
      setColDefPdf(updateColdefPdf);
    }
    if (data.lvl == "CBWTF") {
      updatedColdef[3] = { ...updatedColdef[3], headerName: "CBWTF" };
      setColdef(updatedColdef);

      updateColdefPdf[0] = { ...updateColdefPdf[0], headerName: "CBWTF" };
      setColDefPdf(updateColdefPdf);
    }
    
  }

  const [valueType, setValueType] = React.useState(0);

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event: React.SyntheticEvent | undefined, newValue: number) => {
    setValueType(newValue);
    let updatedColdef = [...coldef];
    let updatedColdefPdf = [...colDefPdf];

    if (lvl == "RGD") {
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "Board" } : { ...updatedColdef[2], headerName: "State/UT" }; // Update the headerName of the second element
      setColdef(updatedColdef);

      updatedColdefPdf[0] = newValue == 0 ? { ...updatedColdefPdf[0], headerName: "Board" } : { ...updatedColdefPdf[0], headerName: "State/UT" }; // Update the headerName of the second element
      setColDefPdf(updatedColdefPdf);

    } else if (lvl.toUpperCase() == "STT") {
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[2], headerName: "CBWTF" }; // Update the headerName of the second element
      setColdef(updatedColdef);

      updatedColdefPdf[0] = newValue == 0 ? { ...updatedColdefPdf[0], headerName: "State/UT" } : { ...updatedColdefPdf[0], headerName: "CBWTF" }; // Update the headerName of the second element
      setColDefPdf(updatedColdefPdf);
    } else if (lvl == "CBWTF") {
      updatedColdef[3] = { ...updatedColdef[3], headerName: "CBWTF" };
      setColdef(updatedColdef);

      updatedColdefPdf[0] = { ...updatedColdefPdf[0], headerName: "CBWTF" };
      setColDefPdf(updatedColdefPdf);
    } else {
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "CPCB" } : { ...updatedColdef[3], headerName: "Board" };

      // updatedColdef[2] = { ...updatedColdef[2], headerName: "CPCB" }; // Update the headerName of the second element
      setColdef(updatedColdef);

      updatedColdefPdf[0] = newValue == 0 ? { ...updatedColdefPdf[0], headerName: "CPCB" } : { ...updatedColdefPdf[0], headerName: "Board" };
      setColDefPdf(updatedColdefPdf);

    }
  };

  return (
    <>
      {applicationVerion == '1' && <>  <div>
        <HdrDrp hideHeader={false} formName=""></HdrDrp>
      </div>
        <span className="text-center text-bold mt-3 text-blue-600/75">
          <h5>Summary of waste bags with and without label</h5>
        </span></>}
    
      <LevelSelector
        showCbwtf={false}
        levelSelectorData={setLvlWhoData}
        // dateField={true}
        dateFieldFrom={true}
        dateFieldTo={true}
        getListButton={true}
        getListOnclick={getClick}
        printButton={false}
        printButtonClick={printClick}
      ></LevelSelector>
      <div className="">
        <div className="shadow rounded-lg bg-white">
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={valueType} onChange={handleChange} aria-label="basic tabs example">
                <Tab label="Summary" {...a11yProps(0)} />
                {lvl !== "CBWTF" ?
                  <Tab label="Details" {...a11yProps(1)} /> :
                  null}
              </Tabs>
            </Box>
            <CustomTabPanel value={valueType} index={0}>
              {total ? <div className="border rounded-lg">
                <div className="p-3">
                  <div className="flex font-semibold">
                    Total waste bags : {total}
                  </div>
                </div>
              </div> : <></>}
              <div className="font-semibold text-lg mb-2">{isLoading}</div>
              {showMessage && showMessage.message.length != 0 && <div className="py-2">
                <Toaster data={showMessage} className={''}></Toaster>
              </div>}
              <div className=''>

                <NrjAgGrid
                  onGridLoaded={GridLoaded}
                  onRowSelected={onRowSelected}
                  colDef={coldef}
                  apiCall={""}
                  rowData={summaryRowData}
                  deleteButton={""}
                  deleteFldNm={""}
                  showPagination={true}
                  className="ag-theme-alpine-blue ag-theme-alpine"
                  // rowClassRulesValues={rowClassRulesValues}
                  // ratio={ratio}
                  cellClassRulesValues={cellClassRulesValues}
                  showExport={true}
                  pageTitle={"Summary of waste bag with and without Label Count "}
                  printExcelHeader={printExcelHeader}
                  exceColWidth={excelColWidth}
                  KeyOrder={keyOrder}
                  lvl={lvl}
                  who={who}
                  pdfColWidth={pdfColWidth}
                  colDefPdf={colDefPdf}
                  newRowData={state.nwRow}
                  trigger={state.triggerG}
                ></NrjAgGrid>
              </div>
            </CustomTabPanel>
            {lvl !== "CBWTF" ?
              <CustomTabPanel value={valueType} index={1}>
                <div className="font-semibold text-lg mb-2">{isLoading}</div>
                {showMessage && showMessage.message.length != 0 && <div className="py-2">
                  <Toaster data={showMessage} className={''}></Toaster>
                </div>}
                <div className=''>
                  <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    colDef={coldef}
                    apiCall={""}
                    rowData={detailedRowData}
                    deleteButton={""}
                    deleteFldNm={""}
                    showPagination={true}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    // rowClassRulesValues={rowClassRulesValues}
                    // ratio={ratio}
                    cellClassRulesValues={cellClassRulesValues}
                    showExport={true}
                    pageTitle={"Summary of waste bag with and without Label Count "}
                    printExcelHeader={printExcelHeader}
                    exceColWidth={excelColWidth}
                    KeyOrder={keyOrder}
                    lvl={lvl}
                    who={who}
                    pdfColWidth={pdfColWidth}
                    newRowData={state.nwRowB}
                    trigger={state.triggerG}
                    colDefPdf={colDefPdf}
                  ></NrjAgGrid>
                </div>
              </CustomTabPanel> : null}
          </Box>
        </div>
      </div>
    </>
  );
};
export default React.memo(BagCountLbl);

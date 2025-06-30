import { useQuery } from "@tanstack/react-query";
import utilities, {
  createGetApi,
  GetResponseWnds,
  getApplicationVersion,
  postLinux,
  getStateFullFormWho,
  sortArrayByFieldOrder,
} from "../../utilities/utilities";
import { Box, Tab, Tabs } from "@mui/material";
import React, { useEffect, useReducer, useState } from "react";
import {
  nrjAxios, nrjAxiosRequestBio
} from "../../Hooks/useNrjAxios";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { act } from "react-dom/test-utils";
import { Toaster } from "../../components/reusable/Toaster";
import LevelSelector from "../dshbrd/LevelSelector";
import CustomTabPanel from "./CustomTabPanel";
import { useToaster } from "../../components/reusable/ToasterContext";
import moment from "moment";
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { getFldValue } from "../../Hooks/useGetFldValue";
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
  SETFORMAT: "frmt",
  GRIDRECCNT: "grdreccnt",
  SETCOMBOSTR: "cmbstr",
  COMBOLABEL: "cmblabel",
  SETCOMBOSTRB: "cmbstrB",
  SETCOMBOSTRC: "cmbstrC",
  SETBUTTONTEXT: "btntxt",
  DISABLE: "disable",
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
  frmt: 0,
  grdcnt: 0,
  combostr: "",
  cmbLabelA: "CBWTF",
  cmbLabelB: "",
  cmbLabelC: "",
  combostrB: "",
  combostrC: "",
  disableA: 1,
  disableB: 1,
  disableC: 1,
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
  frmt: number;
  grdcnt: number;
  combostr: string;
  cmbLabelA: string;
  cmbLabelB: string;
  cmbLabelC: string;
  combostrB: string;
  combostrC: string;
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
    case ACTIONS.SETBUTTONTEXT:
      if (action.payload == 1) {
        newstate.btnTextA = "Get list";
        newstate.btnTextB = "More..";
      }
      return newstate;
    case ACTIONS.COMBOLABEL:
      if (action.payload == 2) {
        newstate.cmbLabelA = "Regional Directorate";
        newstate.cmbLabelB = "State";
        newstate.cmbLabelC = "CBWTF";
      }
      return newstate;
    case ACTIONS.SETFORMAT:
      newstate.frmt = action.payload;
      return newstate;
    case ACTIONS.GRIDRECCNT:
      newstate.grdcnt = action.payload;
      return newstate;
    case ACTIONS.SETCOMBOSTR:
      newstate.combostr = action.payload;
      return newstate;
    case ACTIONS.SETCOMBOSTRB:
      newstate.combostrB = action.payload;
      return newstate;
    case ACTIONS.SETCOMBOSTRC:
      newstate.combostrC = action.payload;
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
      if (action.payload) {
        if (action.payload.length > 0) {
          newstate.grdcnt += action.payload.length;
        }
      }
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
    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.CHECK_REQ:
      //newstate.errMsg = action.payload;
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
      }
  }
};

const HcfCorrectedList = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const [isLoading, setIsLoading] = useState("");
  const [levelWhoData, setLevelWhoData] = useState({ lvl: "", who: "" });
  const [lvl, setLvl] = useState("");
  const [rowData, setRowData] = useState<any[]>([])
  const [coldef, setColDef] = useState([
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "fltr", hide: true, width: 150, headerName: "CBWTF ID" },
    {
      field: "dt_rpt",
      hide: false,
      width: 150,
      headerName: "Date",
      filter: "agTextColumnFilter",
      valueFormatter: (params: any) => {
        const dateValue = new Date(params.value);
        if (!isNaN(dateValue.getTime())) {
          return format(dateValue, 'dd-MMM-yyyy');
        } else {
          return params.value; // or handle invalid date format as needed
        }
      },
    },
    {
      field: "fltr",
      hide: false,
      width: 250,
      headerName: "CPCB",
      filter: "agTextColumnFilter",
      rowspan: 3
    },
    {
      field: "bdctg",
      hide: false,
      width: 200,
      headerName: "HCF category",
      filter: "agTextColumnFilter",
      rowspan: 3
    },

    {
      field: "scnby",
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
          width: 75,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
        },
        {
          field: "redwt",
          hide: false,
          width: 100,
          headerName: "Weight Kg",
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
          width: 75,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
        },
        {
          field: "ylwwt",
          hide: false,
          width: 100,
          headerName: " Weight Kg",
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
          width: 75,
          headerName: "Bag",
          tooltipField: "tpwht",
        },
        {
          field: "whtwt",
          hide: false,
          width: 100,
          headerName: "Weight Kg",
          tooltipField: "tpwht",
        },]
    },
    {
      headerName: 'Blue',
      children: [
        {
          field: "blucnt",
          hide: false,
          width: 75,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
        },
        {
          field: "bluwt",
          hide: false,
          width: 100,
          headerName: " Weight Kg",
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
          width: 75,
          headerName: " Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
        },
        {
          field: "cytwt",
          hide: false,
          width: 100,
          headerName: " Weight Kg",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
        },
      ]
    },
    {
      field: "ttlcnt",
      hide: false,
      width: 150,
      headerName: "Total bags",
      filter: "agTextColumnFilter",
      rowspan: 3
    },
    {
      field: "ttlwt",
      hide: false,
      width: 250,
      headerName: "Total Bags Weight",
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
    { field: "stt", hide: true, width: 150, headerName: "State/UT" },
  ]);

  const coldefCbwtf = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "fltr", hide: true, width: 150, headerName: "CBWTF ID" },
    {
      field: "dt_rpt",
      hide: false,
      width: 150,
      headerName: "Date",
      filter: "agTextColumnFilter",
      valueFormatter: (params: any) => {
        const dateValue = new Date(params.value);
        if (!isNaN(dateValue.getTime())) {
          return format(dateValue, 'dd-MMM-yyyy');
        } else {
          return params.value; // or handle invalid date format as needed
        }
      },
    },
    {
      field: "cbwtfnm",
      hide: false,
      width: 250,
       headerName: "Name of CBWTF",
      filter: "agTextColumnFilter",
      rowspan: 3
    },
    {
      field: "bdctg",
      hide: false,
      width: 200,
      headerName: "HCF category",
      filter: "agTextColumnFilter",
      rowspan: 3
    },

    {
      field: "scnby",
      hide: false,
      width: 200,
      headerName: "Scan by",
      filter: "agTextColumnFilter",
    },
    {
      headerName: 'Red',
      children: [
        {
          field: "rcnt",
          hide: false,
          width: 75,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
        },
        {
          field: "redwt",
          hide: false,
          width: 100,
          headerName: "Weight Kg",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
        },
      ]
    },
    {
      headerName: 'Yellow',
      children: [
        {
          field: "ycnt",
          hide: false,
          width: 75,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
        },
        {
          field: "ylwwt",
          hide: false,
          width: 100,
          headerName: " Weight Kg",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
        },
      ]
    },
    {
      headerName: 'White',
      children: [
        {
          field: "wcnt",
          hide: false,
          width: 75,
          headerName: "Bag",
          tooltipField: "tpwht",
        },
        {
          field: "whtwt",
          hide: false,
          width: 100,
          headerName: "Weight Kg",
          tooltipField: "tpwht",
        },]
    },
    {
      headerName: 'Blue',
      children: [
        {
          field: "bcnt",
          hide: false,
          width: 75,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
        },
        {
          field: "bluwt",
          hide: false,
          width: 100,
          headerName: " Weight Kg",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
        },
      ]
    },
    {
      headerName: 'Cytotoxic',
      children: [
        {
          field: "ccnt",
          hide: false,
          width: 75,
          headerName: " Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
        },
        {
          field: "cytwt",
          hide: false,
          width: 100,
          headerName: " Weight Kg",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
        },
      ]
    },
    {
      field: "ttlcnt",
      hide: false,
      width: 150,
      headerName: "Total bags",
      filter: "agTextColumnFilter",
      rowspan: 3
    },
    {
      field: "ttlwt",
      hide: false,
      width: 180,
      headerName: "Total Bags Weight",
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
    { field: "stt", hide: true, width: 150, headerName: "State/UT" },
  ]

  const [coldef1, setColDef1] = useState([
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "fltr", hide: true, width: 150, headerName: "CBWTF ID" },
    {
      field: "dt_rpt",
      hide: false,
      width: 150,
      headerName: "Date",
      filter: "agTextColumnFilter",
      valueFormatter: (params: any) => {
        const dateValue = new Date(params.value);
        if (!isNaN(dateValue.getTime())) {
          return format(dateValue, 'dd-MMM-yyyy');
        } else {
          return params.value; // or handle invalid date format as needed
        }
      },
    },
    { field: 'hcfnm', hide: false, width: 250, headerName: 'HCF name' },
    {
      field: "scnby",
      hide: false,
      width: 150,
      headerName: "Scan by",
      filter: "agTextColumnFilter",
    },
    {
      headerName: 'Red',
      children: [
        {
          field: "redcnt",
          hide: false,
          width: 75,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
        },
        {
          field: "redwt",
          hide: false,
          width: 100,
          headerName: "Weight Kg",
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
          width: 75,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
        },
        {
          field: "ylwwt",
          hide: false,
          width: 100,
          headerName: "Weight Kg",
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
          width: 75,
          headerName: "Bag",
          tooltipField: "tpwht",
        },
        {
          field: "whtwt",
          hide: false,
          width: 100,
          headerName: "Weight Kg",
          tooltipField: "tpwht",
        },
      ]
    },
    {
      headerName: 'Blue',
      children: [
        {
          field: "blucnt",
          hide: false,
          width: 75,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
        },
        {
          field: "bluwt",
          hide: false,
          width: 100,
          headerName: "Weight Kg",
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
          width: 75,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
        },
        {
          field: "cytwt",
          hide: false,
          width: 100,
          headerName: "Weight Kg",
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
    },
    {
      field: "ttlwt",
      hide: false,
      width: 150,
      headerName: "Total Bags Weight",
      filter: "agTextColumnFilter",
    },
  ]);

  const onRowSelected = (data: string) => { };

  const GridLoaded = () => { };
  const onButtonClicked = (action: string, rw: any) => { };


  const [newdata, setNewData] = useState([]);
  const [newdata2, setNewData2] = useState([]);
  const [newdataTotal, setNewdataTotal] = useState<Array<{
    fltr: string;
    scnby: string;
    redwt: number;
    bluwt: number;
    ylwwt: number;
    whtwt: number;
    cytwt: number;
    bcnt: number;
    rcnt: number;
    ycnt: number;
    wcnt: number;
    ccnt: number;
  }>>([]);
  const [total, setTotal] = useState<any>({ totalWt: 0, totalCnt: 0 })

  const newArray: {
    fltr: string;
    scnby: string;
    redwt: number;
    bluwt: number;
    ylwwt: number;
    whtwt: number;
    cytwt: number;
    bcnt: number;
    rcnt: number;
    ycnt: number;
    wcnt: number;
    ccnt: number;
    cbwtfnm: string;
    dt_rpt:string
  }[] = [];

  const newArray2: {
    fltr: string;
    scnby: string;
    redwt: number;
    bluwt: number;
    ylwwt: number;
    whtwt: number;
    cytwt: number;
    bcnt: number;
    rcnt: number;
    ycnt: number;
    wcnt: number;
    ccnt: number;
    cbwtfnm: string;
    dt_rpt:string
  }[] = [];
  const { showToaster, hideToaster } = useToaster();

  function populateGrid(data: any) {
    setIsLoading("")
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 })
    // let dt: string = GetResponseWnds(data);
    console.log(data.data.length)
    if (data && data.data && Array.isArray(data.data) && data.data.length>1) {
      let ary: any = data.data
      // if (!isNaN(Number(levelWhoData.who))) {
      //   ary = ary.map((res: any) => {
      //     return {
      //       ...res,
      //       fltr: res.cbwtfnm,
      //     }
      //   })
      // }

      let tempTotal = { totalWt: 0, totalCnt: 0 }

      let totalArySum = ary;

      totalArySum.forEach((obj: any) => {
        const key = obj.fltr;

        let temp = newArray.find((item) => item.fltr === key && item.scnby === obj.scnby);


        if (obj.scnby === 'cbwtf') {
          handleSupervisor(obj, key, temp);
        }
        if (obj.scnby === 'hcf') {
          handleByHCF(obj, key, temp);
        }
        if (obj.scnby === 'fct') {
          handleAtFactory(obj, key, temp);
        }
      });


      setNewdataTotal(newArray.map((res: any) => {
        return { ...res, dt_rpt:res.dt_rpt,ttlcnt: res.bcnt + res.rcnt + res.ccnt + res.wcnt + res.ycnt, ttlwt: Number(res.bluwt + res.redwt + res.cytwt + res.whtwt + res.ylwwt).toFixed(3), bluwt: res.bluwt.toFixed(3), redwt: res.redwt.toFixed(3), ylwwt: res.ylwwt.toFixed(3), whtwt: res.whtwt.toFixed(3), cytwt: res.cytwt.toFixed(3), fltr: levelWhoData.lvl == 'STT' ? getStateFullFormWho(res.fltr) : String(res.fltr).toUpperCase(), scnby: res.scnby == 'fct' ? 'At CBWTF' : res.scnby == 'cbwtf' ? 'Operator' : res.scnby == 'hcf' ? 'By HCF' : res.scnby }
      }))

      console.log(newdataTotal)

      ary = ary.map((res: any) => {
        const bwt = (res.bluwt && !isNaN(Number(res.bluwt))) ? Number(res.bluwt) : 0.000;
        const rwt = (res.redwt && !isNaN(Number(res.redwt))) ? Number(res.redwt) : 0.000;
        const ywt = (res.ylwwt && !isNaN(Number(res.ylwwt))) ? Number(res.ylwwt) : 0.000;
        const wwt = (res.whtwt && !isNaN(Number(res.whtwt))) ? Number(res.whtwt) : 0.000;
        const cwt = (res.cytwt && !isNaN(Number(res.cytwt))) ? Number(res.cytwt) : 0.000;
        const bcnt = (res.blucnt && !isNaN(Number(res.blucnt))) ? Number(res.blucnt) : 0;
        const rcnt = (res.redcnt && !isNaN(Number(res.redcnt))) ? Number(res.redcnt) : 0;
        const ycnt = (res.ylwcnt && !isNaN(Number(res.ylwcnt))) ? Number(res.ylwcnt) : 0;
        const wcnt = (res.whtcnt && !isNaN(Number(res.whtcnt))) ? Number(res.whtcnt) : 0;
        const ccnt = (res.cytcnt && !isNaN(Number(res.cytcnt))) ? Number(res.cytcnt) : 0;
        tempTotal.totalWt += (bwt + rwt + ywt + wwt + cwt)
        tempTotal.totalCnt += (bcnt + rcnt + ycnt + wcnt + ccnt)
        const ttlwt = Number(bwt + rwt + ywt + wwt + cwt).toFixed(3)
        const ttlcnt = Number(bcnt + rcnt + ycnt + wcnt + ccnt)
        let fltr = res.fltr ? levelWhoData.lvl == 'STT' ? getStateFullFormWho(res.fltr) : res.fltr : 'CPCB'
        return { ...res, ttlwt, ttlcnt, bluwt: bwt.toFixed(3), redwt: rwt.toFixed(3), ylwwt: ywt.toFixed(3), whtwt: wwt.toFixed(3), cytwt: cwt.toFixed(3), blucnt: bcnt, redcnt: rcnt, ylwcnt: ycnt, whtcnt: wcnt, cytcnt: ccnt, fltr: fltr == 'cpcb' ? 'CPCB' : fltr, scnby: res.scnby == 'fct' ? 'At CBWTF' : res.scnby == 'cbwtf' ? 'Operator' : res.scnby == 'hcf' ? 'By HCF' : res.scnby, bdctg: res.bdctg == '1' ? 'Below 30 Bedded' : 'Above 30 Bedded',  dt_rpt: res.dt_rpt }
      })


      setTotal(tempTotal)
      // ary = clrNAValue(ary, state.grdcnt);
      // ary = ChangeCase(
      //   ary,
      //   "redcnt#redwt#ylwcnt#ylwwt#whtcnt#whtwt#blucnt#bluwt#cytcnt#cytwt"
      // );
      // ary = gridAddToolTipColumn(
      //   ary,
      //   "tpred",
      //   "Please click on the color to get details of red (Bag) waste Bag for : ",
      //   "",
      //   "fltr"
      // );
      // ary = gridAddToolTipColumn(
      //   ary,
      //   "tpylw",
      //   "Please click on the color to get details of yellow (Bag) waste Bag for : ",
      //   "",
      //   "fltr"
      // );
      // ary = gridAddToolTipColumn(
      //   ary,
      //   "tpwht",
      //   "Please click on the color to get details of white (Bag) waste Bag for : ",
      //   "",
      //   "fltr"
      // );
      // ary = gridAddToolTipColumn(
      //   ary,
      //   "tpblu",
      //   "Please click on the color to get details of blue (Bag) waste Bag for : ",
      //   "",
      //   "fltr"
      // );
      // ary = gridAddToolTipColumn(
      //   ary,
      //   "tpcyt",
      //   "Please click on the color to get details of cytotoxic (Bag) waste Bag for : ",
      //   "",
      //   "fltr"
      // );
      ary = sortArrayByFieldOrder(ary,["hcfnm"])
      // ary = sortArrayByFieldOrder(ary, ["bdctg"]);
      setTimeout(function () {
        dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      }, 800);
      // setNewData(ary);
    }
    else {
      setNewData([]);
      showToaster([data.data], 'error');
      setTimeout(() => {
        showToaster([], 'success');
      }, 5000)
    }


    // if (dt == "" || data.data[0].Status == 'Failed') {
    //   setNewData([]);
    //   showToaster( ['Did not find any Data'], 'success');
    //   setTimeout(() => {
    //     showToaster( [], 'success');
    //   }, 400)
    // }

    return 1;
  }

  function handleSupervisor(obj: any, key: string, temp?: any) {
    if (temp) {
      temp.redwt += Number(obj.redwt);
      temp.bluwt += Number(obj.bluwt);
      temp.ylwwt += Number(obj.ylwwt);
      temp.whtwt += Number(obj.whtwt);
      temp.cytwt += Number(obj.cytwt);
      temp.bcnt += Number(obj.blucnt);
      temp.rcnt += Number(obj.redcnt);
      temp.ycnt += Number(obj.ylwcnt);
      temp.wcnt += Number(obj.whtcnt);
      temp.ccnt += Number(obj.cytcnt);

      //to fixed 3
      temp.redwt = Number(temp.redwt.toFixed(3));
      temp.bluwt = Number(temp.bluwt.toFixed(3));
      temp.ylwwt = Number(temp.ylwwt.toFixed(3));
      temp.whtwt = Number(temp.whtwt.toFixed(3));
      temp.cytwt = Number(temp.cytwt.toFixed(3));
    } else {
      newArray.push({
        cbwtfnm: obj.cbwtfnm,
        fltr: key,
        scnby: obj.scnby,
        redwt: Number(obj.redwt),
        bluwt: Number(obj.bluwt),
        ylwwt: Number(obj.ylwwt),
        whtwt: Number(obj.whtwt),
        cytwt: Number(obj.cytwt),
        bcnt: Number(obj.blucnt),
        rcnt: Number(obj.redcnt),
        ycnt: Number(obj.ylwcnt),
        wcnt: Number(obj.whtcnt),
        ccnt: Number(obj.cytcnt),
        dt_rpt:obj.dt_rpt
      });
    }
  }
  function handleByHCF(obj: any, key: string, temp?: any) {
    if (temp) {
      // Update existing temp
      temp.redwt += Number(obj.redwt);
      temp.bluwt += Number(obj.bluwt);
      temp.ylwwt += Number(obj.ylwwt);
      temp.whtwt += Number(obj.whtwt);
      temp.cytwt += Number(obj.cytwt);
      temp.bcnt += Number(obj.blucnt);
      temp.rcnt += Number(obj.redcnt);
      temp.ycnt += Number(obj.ylwcnt);
      temp.wcnt += Number(obj.whtcnt);
      temp.ccnt += Number(obj.cytcnt);
      //To fixed 3
      temp.redwt = Number(temp.redwt.toFixed(3));
      temp.bluwt = Number(temp.bluwt.toFixed(3));
      temp.ylwwt = Number(temp.ylwwt.toFixed(3));
      temp.whtwt = Number(temp.whtwt.toFixed(3));
      temp.cytwt = Number(temp.cytwt.toFixed(3));
    } else {
      newArray.push({
        cbwtfnm: obj.cbwtfnm,
        fltr: key,
        scnby: obj.scnby,
        redwt: Number(obj.redwt),
        bluwt: Number(obj.bluwt),
        ylwwt: Number(obj.ylwwt),
        whtwt: Number(obj.whtwt),
        cytwt: Number(obj.cytwt),
        bcnt: Number(obj.blucnt),
        rcnt: Number(obj.redcnt),
        ycnt: Number(obj.ylwcnt),
        wcnt: Number(obj.whtcnt),
        ccnt: Number(obj.cytcnt),
        dt_rpt:obj.dt_rpt
      });
    }
  }

  function handleAtFactory(obj: any, key: string, temp?: any) {
    if (temp) {
      temp.redwt += Number(obj.redwt);
      temp.bluwt += Number(obj.bluwt);
      temp.ylwwt += Number(obj.ylwwt);
      temp.whtwt += Number(obj.whtwt);
      temp.cytwt += Number(obj.cytwt);
      temp.bcnt += Number(obj.blucnt);
      temp.rcnt += Number(obj.redcnt);
      temp.ycnt += Number(obj.ylwcnt);
      temp.wcnt += Number(obj.whtcnt);
      temp.ccnt += Number(obj.cytcnt);
      //to fixed 3
      temp.redwt = Number(temp.redwt.toFixed(3));
      temp.bluwt = Number(temp.bluwt.toFixed(3));
      temp.ylwwt = Number(temp.ylwwt.toFixed(3));
      temp.whtwt = Number(temp.whtwt.toFixed(3));
      temp.cytwt = Number(temp.cytwt.toFixed(3));
    } else {
      newArray.push({
        cbwtfnm: obj.cbwtfnm,
        fltr: key,
        scnby: obj.scnby,
        redwt: Number(obj.redwt),
        bluwt: Number(obj.bluwt),
        ylwwt: Number(obj.ylwwt),
        whtwt: Number(obj.whtwt),
        cytwt: Number(obj.cytwt),
        bcnt: Number(obj.blucnt),
        rcnt: Number(obj.redcnt),
        ycnt: Number(obj.ylwcnt),
        wcnt: Number(obj.whtcnt),
        ccnt: Number(obj.cytcnt),
        dt_rpt:obj.dt_rpt
      });
    }
  }

  

  const getGid = () => {
    let gd: any = utilities(3, "", "");
    dispatch({ type: ACTIONS.SETGID, payload: gd });
    return gd;
  };

  

  const getCbwtfWstList = () => {
    handleChange(undefined, 0);
    setIsLoading("Loding Data...")
    let level =lvl;
    let who = levelWhoData.who;
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
    let gid: string = getGid();
    // let api: string = createGetApi(
    //   "db=nodb|dll=xrydll|fnct=a190",
    //   levelWhoData.lvl + "=" + gid + "=" + levelWhoData.who + "=1"
    // );
    // return nrjAxios({ apiCall: api });
    const payload: any = postLinux(level + '=' + who + '=' + "" + '=' + dtFrm + '=' + dtTo + '=' + dtwise + '=' + gid, 'show_CorrectBagsmry');
    // const payload: any = postLinux(levelWhoData.who + '=' + levelWhoData.who + '=' + gid, 'wstdata');
    return nrjAxiosRequestBio("show_CorrectBagsmry", payload);
  };

  
  const { data: data3, refetch: refetchG } = useQuery({
    queryKey: ["getData", levelWhoData],
    queryFn: getCbwtfWstList,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  });

  

  const svClick = () => {

    dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    setTotal({ totalWt: 0, totalCnt: 0 });
    setTimeout(() => {
      refetchG();
      // refetchG2();
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
    }, 400)
  };

  const GetPrnt = (lvl: string) => {
    let gid: string = state.gid;
    if (!gid) {
      showToaster(["populate the data in the grid"], 'error');
      return;
    }
    let api: string = createGetApi(
      "db=nodb|dll=chqdll|fnct=g123",
      gid + "=" + lvl + "=0"
    );
    return nrjAxios({ apiCall: api });
  };

  const showPrnt = (dataC: any) => {
    let dt: string = GetResponseWnds(dataC);

    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    if (dt && dt.indexOf('.pdf') > -1) {
      window.open(dataC.data[0]["Data"], "_blank")
    } else {
      showToaster(["Please try again after refreshing the page!"],
        'error')
    }
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  }

  const { data: dataP, refetch: refetchP } = useQuery({
    queryKey: ["getprint", levelWhoData.lvl],
    queryFn: () => GetPrnt(levelWhoData.lvl),
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: showPrnt,
  });


  function printClick() {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    refetchP()
  }

  const [valueType, setValueType] = useState(0);
  const handleChange = (event: React.SyntheticEvent | undefined, newValue: number) => {
    setValueType(newValue);
    let updatedColdef = [...coldef];
    let updatedColdef1 = [...coldef1];

    if (levelWhoData.lvl == "RGD") {
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "Regional directorate" } : { ...updatedColdef[3], headerName: "State/UT" }; // Update the headerName of the second element
      updatedColdef1[3] = newValue == 0 ? { ...updatedColdef1[3], headerName: "Regional directorate" } : { ...updatedColdef1[3], headerName: "State/UT" }; // Update the headerName of the second element

      setColDef(updatedColdef);
      setColDef1(updatedColdef1);
    } else if (levelWhoData.lvl.toUpperCase() == "STT") {
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[3], headerName: "CBWTF" }; // Update the headerName of the second element
      updatedColdef1[3] = newValue == 0 ? { ...updatedColdef1[3], headerName: "State/UT" } : { ...updatedColdef1[3], headerName: "CBWTF" }; // Update the headerName of the second element

      setColDef(updatedColdef);
      setColDef1(updatedColdef1);
    } else if (levelWhoData.lvl == "CBWTF") {
      updatedColdef[3] = { ...updatedColdef[3], headerName: "CBWTF" };
      updatedColdef1[3] = { ...updatedColdef1[3], headerName: "CBWTF" };

      setColDef(updatedColdef);
      setColDef1(updatedColdef1);
    } else {
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "CPCB" } : { ...updatedColdef[3], headerName: "Regional directorate" };
      updatedColdef1[3] = newValue == 0 ? { ...updatedColdef1[3], headerName: "CPCB" } : { ...updatedColdef1[3], headerName: "Regional directorate" };

      setColDef(updatedColdef);
      setColDef1(updatedColdef1);
    }
  };

  const applicationVerion: string = getApplicationVersion();

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const setLvlWhoData = (data: any) => {
    // let fld: any = utilities(2, data, "");
    // if (fld == 'dt_rptto') {
    // }
    onChangeDts(data.dateFrom);
    onChangeDts(data.dateTo);
    setTotal({ totalWt: 0, totalCnt: 0 });
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
    }, 400)
    setLvl(data.lvl);
    if (lvl == "CBWTF") {
      setValueType(0)
    }
    setLevelWhoData({ lvl: data.lvl, who: data.who });

  }

  const [prependContent, setPrependContent] = useState<any[]>([])


  const getPrependContentValue = (levelValue: string) => {
    return [
      [
        {
          data: {
            value: 'List of Health Care Facility',
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


  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const [filterParameter, setFilterParameter] = useState<any>(null)
  const getFilteredParameter = (data: any) => {
    setFilterParameter(data);
  }

  const [filterParameter1, setFilterParameter1] = useState<any>(null)
  const getFilteredParameter1 = (data: any) => {
    setFilterParameter1(data);
  }

  const excelColWidth = [{ wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]

  const [printExcelHeaderCbwtf, setPrintExcelHeaderCbwtf] = useState<any[]>([])
  const [keyOrderCbwtf, setKeyOrderCbwtf] = useState<any[]>([])
  const [printExcelHeader, setPrintExcelHeader] = useState<any[]>([])
  const [keyOrder, setKeyOrder] = useState<any[]>([])
  const [printExcelHeader1, setPrintExcelHeader1] = useState<any[]>([])
  const [keyOrder1, setKeyOrder1] = useState<any[]>([])


  useEffect(() => {
    let tempOne: any[] = [];
    let tempTwo: any[] = [];
    coldefCbwtf.forEach((res: any) => {
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
    setPrintExcelHeaderCbwtf(tempTwo);
    setKeyOrderCbwtf(tempOne)
    // set current date when component in render first time 
    const today = new Date();
    let str: string = moment(today).format("DD-MMM-yyyy");
    onChangeDts("dt_rptfrm]["+str);
    onChangeDts("dt_rptto]["+str);
  }, [])


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

  useEffect(() => {
    let tempOne: any[] = [];
    let tempTwo: any[] = [];
    coldef1.forEach((res: any) => {
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
    setPrintExcelHeader1(tempTwo);
    setKeyOrder1(tempOne)
  }, [coldef1])


  return (
    <>
      <LevelSelector
        // showCbwtf={false}
        // levelSelectorData={setLvlWhoData}
        // dateFieldFrom={true}
        // dateFieldTo={true}
        // printButton={false}
        // printButtonClick={printClick}
        // getListButton={true}
        // getListOnclick={svClick}
        dateFieldFrom={true}
        dateFieldTo={true}
        levelSelectorData={setLvlWhoData}
        getListButton={true}
        getListOnclick={svClick}
        showToggleButton={false}
      ></LevelSelector>

      <div className="bg-white shadow rounded-lg px-4 pb-6 pt-3">
        <Box sx={{ width: '100%' }}>
          {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={valueType} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Summary" {...a11yProps(0)} />
              {lvl !== "CBWTF" ?
                <Tab label="Details" {...a11yProps(1)} /> :
                null}
            </Tabs>
          </Box> */}
          <CustomTabPanel value={valueType} index={0}>
            <div>
              {total ? <div className="border rounded-lg mb-3">
                <div className="p-3">
                  <div className="flex font-semibold ">
                    <>
                      Total Bags : {total.totalCnt}

                    </>
                    <div className="ml-6">
                      Total Bags Weight : {total.totalWt.toFixed(3)} Kg
                    </div>
                  </div>
                </div>
              </div> : <></>}
              <div className="font-semibold text-lg mx-11">{isLoading}</div>
              {showMessage && showMessage.message.length != 0 && <div className="py-2">
                <Toaster data={showMessage} className={''}></Toaster>
              </div>}
              <div className="my-2">
                <NrjAgGrid
                  onGridLoaded={GridLoaded}
                  onRowSelected={onRowSelected}
                  colDef={coldef1}
                  apiCall={""}
                  height={400}
                  rowData={rowData}
                  deleteButton={""}
                  deleteFldNm={""}
                  showDataButton={""}
                  showApi={''}
                  onButtonClicked={onButtonClicked}
                  showFldNm={"cbtwf"}
                  className="ag-theme-alpine"
                  trigger={state.triggerG}
                  showPagination={true}
                  // parentPaginationChanged={changePage}
                  PageSize={10}
                  appName="CPCB"
                  newRowData={state.nwRow}
                  showTooltips={true}
                  showExport={true}
                  prependContent={prependContent}
                  colDefPrint={coldef1}
                  pageTitle={"List of HCF who sent Correct Info "}
                  printExcelHeader={printExcelHeader1}
                  exceColWidth={excelColWidth}
                  KeyOrder={keyOrder1}
                  lvl={levelWhoData.lvl}
                  who={levelWhoData.who}
                  getFilteredParameter={getFilteredParameter}
                ></NrjAgGrid>
              </div>
            </div>
          </CustomTabPanel >
        </Box>
      </div>


    </>);
};
export default React.memo(HcfCorrectedList);



// waste cbwtf bags comment  code for total count 


// import { useQuery } from "@tanstack/react-query";
// import utilities, {
//   createGetApi,
//   ChangeCase,
//   GetResponseWnds,
//   dataStr_ToArray,
//   gridAddToolTipColumn,
//   getApplicationVersion,
//   postLinux,
//   GetResponseLnx,
//   getStateFullForm,
//   getStateFullFormWho,
//   sortArrayByFieldOrder,
// } from "../../utilities/utilities";
// import { Box, Tab, Tabs } from "@mui/material";
// import React, { useEffect, useReducer, useState } from "react";
// import {
//   nrjAxios, nrjAxiosRequestBio
// } from "../../Hooks/useNrjAxios";
// import NrjAgGrid from "../../components/reusable/NrjAgGrid";
// import { act } from "react-dom/test-utils";
// import HdrDrp from "../HdrDrp";
// import { clrNAValue } from "../../utilities/cpcb";
// import { Toaster } from "../../components/reusable/Toaster";
// import LevelSelector from "../dshbrd/LevelSelector";
// import CustomTabPanel from "./CustomTabPanel";
// import { useToaster } from "../../components/reusable/ToasterContext";
// import moment from "moment";
// import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
// import { getFldValue } from "../../Hooks/useGetFldValue";
// import { format } from 'date-fns'
// const ACTIONS = {
//   TRIGGER_GRID: "grdtrigger",
//   NEWROWDATA: "newrow",
//   NEWROWDATAB: "newrowB",
//   RANDOM: "rndm",
//   TRIGGER_FORM: "trgfrm",
//   FORM_DATA: "frmdata",
//   SETFORM_DATA: "setfrmdata",
//   MAINID: "mnid",
//   CHECK_REQ: "chckreq",
//   CHECK_REQDONE: "chckreqdn",
//   SETGID: "gd",
//   SETFORMAT: "frmt",
//   GRIDRECCNT: "grdreccnt",
//   SETCOMBOSTR: "cmbstr",
//   COMBOLABEL: "cmblabel",
//   SETCOMBOSTRB: "cmbstrB",
//   SETCOMBOSTRC: "cmbstrC",
//   SETBUTTONTEXT: "btntxt",
//   DISABLE: "disable",
// };

// const initialState = {
//   triggerG: 0,
//   nwRow: [],
//   nwRowB: [],
//   rndm: 0,
//   trigger: 0,
//   textDts: "",
//   mainId: 0,
//   errMsg: [],
//   openDrwr: false,
//   frmData: "",
//   gid: "",
//   frmt: 0,
//   grdcnt: 0,
//   combostr: "",
//   cmbLabelA: "CBWTF",
//   cmbLabelB: "",
//   cmbLabelC: "",
//   combostrB: "",
//   combostrC: "",
//   disableA: 1,
//   disableB: 1,
//   disableC: 1,
// };

// type purBill = {
//   triggerG: number;
//   nwRow: any;
//   nwRowB: any;
//   rndm: number;
//   trigger: number;
//   textDts: string;
//   mainId: number;
//   errMsg: any;
//   openDrwr: boolean;
//   frmData: string;
//   gid: string;
//   frmt: number;
//   grdcnt: number;
//   combostr: string;
//   cmbLabelA: string;
//   cmbLabelB: string;
//   cmbLabelC: string;
//   combostrB: string;
//   combostrC: string;
//   disableA: number;
//   disableB: number;
//   disableC: number;
// };

// type act = {
//   type: string;
//   payload: any;
// };

// const reducer = (state: purBill, action: act) => {
//   let newstate: any = { ...state };
//   switch (action.type) {
//     case ACTIONS.MAINID:
//       newstate.mainId = action.payload;
//       return newstate;
//     case ACTIONS.TRIGGER_GRID:
//       newstate.triggerG = action.payload;
//       return newstate;
//     case ACTIONS.SETBUTTONTEXT:
//       if (action.payload == 1) {
//         newstate.btnTextA = "Get list";
//         newstate.btnTextB = "More..";
//       }
//       return newstate;
//     case ACTIONS.COMBOLABEL:
//       if (action.payload == 2) {
//         newstate.cmbLabelA = "Regional Directorate";
//         newstate.cmbLabelB = "State";
//         newstate.cmbLabelC = "CBWTF";
//       }
//       return newstate;
//     case ACTIONS.SETFORMAT:
//       newstate.frmt = action.payload;
//       return newstate;
//     case ACTIONS.GRIDRECCNT:
//       newstate.grdcnt = action.payload;
//       return newstate;
//     case ACTIONS.SETCOMBOSTR:
//       newstate.combostr = action.payload;
//       return newstate;
//     case ACTIONS.SETCOMBOSTRB:
//       newstate.combostrB = action.payload;
//       return newstate;
//     case ACTIONS.SETCOMBOSTRC:
//       newstate.combostrC = action.payload;
//       return newstate;
//     case ACTIONS.TRIGGER_FORM:
//       newstate.trigger = action.payload;
//       if (action.payload === 0) {
//         newstate.textDts = "";
//         newstate.frmData = "";
//         newstate.mainId = 0;
//       }
//       return newstate;
//     case ACTIONS.NEWROWDATA:
//       newstate.triggerG = 1;
//       if (action.payload) {
//         if (action.payload.length > 0) {
//           newstate.grdcnt += action.payload.length;
//         }
//       }
//       newstate.nwRow = action.payload;
//       return newstate;
//     case ACTIONS.NEWROWDATAB:
//       newstate.triggerG = 1;
//       newstate.nwRowB = action.payload;
//       return newstate;
//     case ACTIONS.RANDOM:
//       newstate.rndm += 1;
//       return newstate;
//     case ACTIONS.FORM_DATA:
//       let dta: string = "";
//       let fldN: any = utilities(2, action.payload, "");
//       if (newstate.textDts) {
//         dta = newstate.textDts + "=";
//         let d: any = utilities(1, dta, fldN);
//         if (d) {
//           dta = d;
//         } else {
//           dta = "";
//         }
//       }
//       dta += action.payload;
//       newstate.textDts = dta;
//       return newstate;
//     case ACTIONS.SETFORM_DATA:
//       newstate.frmData = action.payload;
//       newstate.rndm += 1;
//       return newstate;
//     case ACTIONS.CHECK_REQ:
//       //newstate.errMsg = action.payload;
//       newstate.openDrwr = true;
//       return newstate;
//     case ACTIONS.CHECK_REQDONE:
//       newstate.errMsg = "";
//       newstate.openDrwr = false;
//       return newstate;
//     case ACTIONS.SETGID:
//       newstate.gid = action.payload;
//       return newstate;
//     case ACTIONS.DISABLE:
//       if (action.payload == 1) {
//         if (newstate.disableA == 1) {
//           newstate.disableA = 0;
//         } else {
//           newstate.disableA = 1;
//         }
//         return newstate;
//       } else if (action.payload == 2) {
//         if (newstate.disableB == 1) {
//           newstate.disableB = 0;
//         } else {
//           newstate.disableB = 1;
//         }
//         return newstate;
//       }
//   }
// };

// const NewHcfCorrect = (props: any) => {
//   const [state, dispatch] = useReducer(reducer, initialState);
//   const [showMessage, setShowMessage] = useState<any>({ message: [] });
//   const [showMessage1, setShowMessage1] = useState<any>({ message: [] });
//   const [isLoading, setIsLoading] = useState("");
//   const [levelWhoData, setLevelWhoData] = useState({ lvl: "", who: "" });
//   const [lvl, setLvl] = useState("");
//   const [rowData, setRowData] = useState<any[]>([])
//   const [coldef, setColDef] = useState([
//     { field: "id", hide: true, width: 0, headerName: "" },
//     { field: "fltr", hide: true, width: 150, headerName: "CBWTF ID" },
//     {
//       field: "dt_rpt",
//       hide: false,
//       width: 150,
//       headerName: "Date",
//       filter: "agTextColumnFilter",
//       valueFormatter: (params: any) => {
//         const dateValue = new Date(params.value);
//         if (!isNaN(dateValue.getTime())) {
//           return format(dateValue, 'dd-MMM-yyyy');
//         } else {
//           return params.value; // or handle invalid date format as needed
//         }
//       },
//     },
//     {
//       field: "fltr",
//       hide: false,
//       width: 250,
//       headerName: "CPCB",
//       filter: "agTextColumnFilter",
//       rowspan: 3
//     },
//     {
//       field: "bdctg",
//       hide: false,
//       width: 200,
//       headerName: "HCF category",
//       filter: "agTextColumnFilter",
//       rowspan: 3
//     },

//     {
//       field: "scnby",
//       hide: false,
//       width: 200,
//       headerName: "Scan by",
//       filter: "agTextColumnFilter",
//     },
//     {
//       headerName: 'Red',
//       children: [
//         {
//           field: "redcnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           cellStyle: { color: "black", backgroundColor: "#ffcccb" },
//           tooltipField: "tpred",
//         },
//         {
//           field: "redwt",
//           hide: false,
//           width: 100,
//           headerName: "Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#ffcccb" },
//           tooltipField: "tpred",
//         },
//       ]
//     },
//     {
//       headerName: 'Yellow',
//       children: [
//         {
//           field: "ylwcnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpylw",
//         },
//         {
//           field: "ylwwt",
//           hide: false,
//           width: 100,
//           headerName: " Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpylw",
//         },
//       ]
//     },
//     {
//       headerName: 'White',
//       children: [
//         {
//           field: "whtcnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           tooltipField: "tpwht",
//         },
//         {
//           field: "whtwt",
//           hide: false,
//           width: 100,
//           headerName: "Weight Kg",
//           tooltipField: "tpwht",
//         },]
//     },
//     {
//       headerName: 'Blue',
//       children: [
//         {
//           field: "blucnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
//           tooltipField: "tpblu",
//         },
//         {
//           field: "bluwt",
//           hide: false,
//           width: 100,
//           headerName: " Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
//           tooltipField: "tpblu",
//         },
//       ]
//     },
//     {
//       headerName: 'Cytotoxic',
//       children: [
//         {
//           field: "cytcnt",
//           hide: false,
//           width: 75,
//           headerName: " Bag",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpcyt",
//         },
//         {
//           field: "cytwt",
//           hide: false,
//           width: 100,
//           headerName: " Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpcyt",
//         },
//       ]
//     },
//     {
//       field: "ttlcnt",
//       hide: false,
//       width: 150,
//       headerName: "Total bags",
//       filter: "agTextColumnFilter",
//       rowspan: 3
//     },
//     {
//       field: "ttlwt",
//       hide: false,
//       width: 180,
//       headerName: "Total Bags Weight",
//       filter: "agTextColumnFilter",
//       rowspan: 3
//     },
//     {
//       field: "tbred",
//       hide: true,
//       headerName: "",
//     },
//     {
//       field: "tbylw",
//       hide: true,
//       headerName: "",
//     },
//     {
//       field: "tbwht",
//       hide: true,
//       headerName: "",
//     },
//     {
//       field: "tbblu",
//       hide: true,
//       headerName: "",
//     },
//     {
//       field: "tbcyt",
//       hide: true,
//       headerName: "",
//     },

//     {
//       field: "rgd",
//       hide: true,
//       width: 200,
//       headerName: "Regional directorate",
//       filter: "agTextColumnFilter",
//     },
//     {
//       field: "state",
//       hide: true,
//       width: 200,
//       headerName: "State/UT",
//       filter: "agTextColumnFilter",
//     },
//     { field: "stt", hide: true, width: 150, headerName: "State/UT" },
//   ]);

//   const coldefCbwtf = [
//     { field: "id", hide: true, width: 0, headerName: "" },
//     { field: "fltr", hide: true, width: 150, headerName: "CBWTF ID" },
//     {
//       field: "dt_rpt",
//       hide: false,
//       width: 150,
//       headerName: "Date",
//       filter: "agTextColumnFilter",
//       valueFormatter: (params: any) => {
//         const dateValue = new Date(params.value);
//         if (!isNaN(dateValue.getTime())) {
//           return format(dateValue, 'dd-MMM-yyyy');
//         } else {
//           return params.value; // or handle invalid date format as needed
//         }
//       },
//     },
//     {
//       field: "cbwtfnm",
//       hide: false,
//       width: 250,
//        headerName: "Name of CBWTF",
//       filter: "agTextColumnFilter",
//       rowspan: 3
//     },
//     {
//       field: "bdctg",
//       hide: false,
//       width: 200,
//       headerName: "HCF category",
//       filter: "agTextColumnFilter",
//       rowspan: 3
//     },

//     {
//       field: "scnby",
//       hide: false,
//       width: 200,
//       headerName: "Scan by",
//       filter: "agTextColumnFilter",
//     },
//     {
//       headerName: 'Red',
//       children: [
//         {
//           field: "rcnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           cellStyle: { color: "black", backgroundColor: "#ffcccb" },
//           tooltipField: "tpred",
//         },
//         {
//           field: "redwt",
//           hide: false,
//           width: 100,
//           headerName: "Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#ffcccb" },
//           tooltipField: "tpred",
//         },
//       ]
//     },
//     {
//       headerName: 'Yellow',
//       children: [
//         {
//           field: "ycnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpylw",
//         },
//         {
//           field: "ylwwt",
//           hide: false,
//           width: 100,
//           headerName: " Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpylw",
//         },
//       ]
//     },
//     {
//       headerName: 'White',
//       children: [
//         {
//           field: "wcnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           tooltipField: "tpwht",
//         },
//         {
//           field: "whtwt",
//           hide: false,
//           width: 100,
//           headerName: "Weight Kg",
//           tooltipField: "tpwht",
//         },]
//     },
//     {
//       headerName: 'Blue',
//       children: [
//         {
//           field: "bcnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
//           tooltipField: "tpblu",
//         },
//         {
//           field: "bluwt",
//           hide: false,
//           width: 100,
//           headerName: " Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
//           tooltipField: "tpblu",
//         },
//       ]
//     },
//     {
//       headerName: 'Cytotoxic',
//       children: [
//         {
//           field: "ccnt",
//           hide: false,
//           width: 75,
//           headerName: " Bag",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpcyt",
//         },
//         {
//           field: "cytwt",
//           hide: false,
//           width: 100,
//           headerName: " Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpcyt",
//         },
//       ]
//     },
//     {
//       field: "ttlcnt",
//       hide: false,
//       width: 150,
//       headerName: "Total bags",
//       filter: "agTextColumnFilter",
//       rowspan: 3
//     },
//     {
//       field: "ttlwt",
//       hide: false,
//       width: 180,
//       headerName: "Total Bags Weight",
//       filter: "agTextColumnFilter",
//       rowspan: 3
//     },
//     {
//       field: "tbred",
//       hide: true,
//       headerName: "",
//     },
//     {
//       field: "tbylw",
//       hide: true,
//       headerName: "",
//     },
//     {
//       field: "tbwht",
//       hide: true,
//       headerName: "",
//     },
//     {
//       field: "tbblu",
//       hide: true,
//       headerName: "",
//     },
//     {
//       field: "tbcyt",
//       hide: true,
//       headerName: "",
//     },

//     {
//       field: "rgd",
//       hide: true,
//       width: 200,
//       headerName: "Regional directorate",
//       filter: "agTextColumnFilter",
//     },
//     {
//       field: "state",
//       hide: true,
//       width: 200,
//       headerName: "State/UT",
//       filter: "agTextColumnFilter",
//     },
//     { field: "stt", hide: true, width: 150, headerName: "State/UT" },
//   ]

//   const [coldef1, setColDef1] = useState([
//     { field: "id", hide: true, width: 0, headerName: "" },
//     { field: "fltr", hide: true, width: 150, headerName: "CBWTF ID" },
//     {
//       field: "dt_rpt",
//       hide: false,
//       width: 150,
//       headerName: "Date",
//       filter: "agTextColumnFilter",
//       valueFormatter: (params: any) => {
//         const dateValue = new Date(params.value);
//         if (!isNaN(dateValue.getTime())) {
//           return format(dateValue, 'dd-MMM-yyyy');
//         } else {
//           return params.value; // or handle invalid date format as needed
//         }
//       },
//     },
//     { field: 'hcfnm', hide: false, width: 250, headerName: 'HCF Name' },
//     {
//       field: "scnby",
//       hide: false,
//       width: 150,
//       headerName: "Scan by",
//       filter: "agTextColumnFilter",
//     },
//     {
//       headerName: 'Red',
//       children: [
//         {
//           field: "redcnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           cellStyle: { color: "black", backgroundColor: "#ffcccb" },
//           tooltipField: "tpred",
//         },
//         {
//           field: "redwt",
//           hide: false,
//           width: 100,
//           headerName: "Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#ffcccb" },
//           tooltipField: "tpred",
//         },
//       ]
//     },
//     {
//       headerName: 'Yellow',
//       children: [
//         {
//           field: "ylwcnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpylw",
//         },
//         {
//           field: "ylwwt",
//           hide: false,
//           width: 100,
//           headerName: "Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpylw",
//         },
//       ]
//     },
//     {
//       headerName: 'White',
//       children: [
//         {
//           field: "whtcnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           tooltipField: "tpwht",
//         },
//         {
//           field: "whtwt",
//           hide: false,
//           width: 100,
//           headerName: "Weight Kg",
//           tooltipField: "tpwht",
//         },
//       ]
//     },
//     {
//       headerName: 'Blue',
//       children: [
//         {
//           field: "blucnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
//           tooltipField: "tpblu",
//         },
//         {
//           field: "bluwt",
//           hide: false,
//           width: 100,
//           headerName: "Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
//           tooltipField: "tpblu",
//         },
//       ]
//     },
//     {
//       headerName: 'Cytotoxic',
//       children: [
//         {
//           field: "cytcnt",
//           hide: false,
//           width: 75,
//           headerName: "Bag",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpcyt",
//         },
//         {
//           field: "cytwt",
//           hide: false,
//           width: 100,
//           headerName: "Weight Kg",
//           cellStyle: { color: "black", backgroundColor: "#FDFD97" },
//           tooltipField: "tpcyt",
//         },
//       ]
//     },
//     {
//       field: "ttlcnt",
//       hide: false,
//       width: 120,
//       headerName: "Total bags",
//       filter: "agTextColumnFilter",
//     },
//     {
//       field: "ttlwt",
//       hide: false,
//       width: 150,
//       headerName: "Total Bags Weight",
//       filter: "agTextColumnFilter",
//     },
//   ]);

//   const onRowSelected = (data: string) => { };

//   const GridLoaded = () => { };
//   const onButtonClicked = (action: string, rw: any) => { };


//   const [newdata, setNewData] = useState([]);
//   const [newdata2, setNewData2] = useState([]);
//   const [newdataTotal, setNewdataTotal] = useState<Array<{
//     fltr: string;
//     scnby: string;
//     redwt: number;
//     bluwt: number;
//     ylwwt: number;
//     whtwt: number;
//     cytwt: number;
//     bcnt: number;
//     rcnt: number;
//     ycnt: number;
//     wcnt: number;
//     ccnt: number;
//   }>>([]);
//   const [newdataTotal2, setNewdataTotal2] = useState<Array<{
//     fltr: string;
//     scnby: string;
//     redwt: number;
//     bluwt: number;
//     ylwwt: number;
//     whtwt: number;
//     cytwt: number;
//     bcnt: number;
//     rcnt: number;
//     ycnt: number;
//     wcnt: number;
//     ccnt: number;
//   }>>([]);
//   const [total, setTotal] = useState<any>({ totalWt: 0, totalCnt: 0 })

//   const newArray: {
//     fltr: string;
//     scnby: string;
//     redwt: number;
//     bluwt: number;
//     ylwwt: number;
//     whtwt: number;
//     cytwt: number;
//     bcnt: number;
//     rcnt: number;
//     ycnt: number;
//     wcnt: number;
//     ccnt: number;
//     cbwtfnm: string;
//     dt_rpt:string
//   }[] = [];

//   const newArray2: {
//     fltr: string;
//     scnby: string;
//     redwt: number;
//     bluwt: number;
//     ylwwt: number;
//     whtwt: number;
//     cytwt: number;
//     bcnt: number;
//     rcnt: number;
//     ycnt: number;
//     wcnt: number;
//     ccnt: number;
//     cbwtfnm: string;
//     dt_rpt:string
//   }[] = [];
//   const { showToaster, hideToaster } = useToaster();

//   function populateGrid(data: any) {
//     setIsLoading("")
//     dispatch({ type: ACTIONS.DISABLE, payload: 1 });
//     dispatch({ type: ACTIONS.RANDOM, payload: 1 });
//     dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 })
//     // let dt: string = GetResponseWnds(data);

//     if (data && data.data && Array.isArray(data.data) && data.data.length) {
//       let ary: any = data.data
//       // if (!isNaN(Number(levelWhoData.who))) {
//       //   ary = ary.map((res: any) => {
//       //     return {
//       //       ...res,
//       //       fltr: res.cbwtfnm,
//       //     }
//       //   })
//       // }

//       let tempTotal = { totalWt: 0, totalCnt: 0 }

//       let totalArySum = ary;

//       totalArySum.forEach((obj: any) => {
//         const key = obj.fltr;

//         let temp = newArray.find((item) => item.fltr === key && item.scnby === obj.scnby);


//         if (obj.scnby === 'cbwtf') {
//           handleSupervisor(obj, key, temp);
//         }
//         if (obj.scnby === 'hcf') {
//           handleByHCF(obj, key, temp);
//         }
//         if (obj.scnby === 'fct') {
//           handleAtFactory(obj, key, temp);
//         }
//       });


//       setNewdataTotal(newArray.map((res: any) => {
//         return { ...res, dt_rpt:res.dt_rpt,ttlcnt: res.bcnt + res.rcnt + res.ccnt + res.wcnt + res.ycnt, ttlwt: Number(res.bluwt + res.redwt + res.cytwt + res.whtwt + res.ylwwt).toFixed(3), bluwt: res.bluwt.toFixed(3), redwt: res.redwt.toFixed(3), ylwwt: res.ylwwt.toFixed(3), whtwt: res.whtwt.toFixed(3), cytwt: res.cytwt.toFixed(3), fltr: levelWhoData.lvl == 'STT' ? getStateFullFormWho(res.fltr) : String(res.fltr).toUpperCase(), scnby: res.scnby == 'fct' ? 'At CBWTF' : res.scnby == 'cbwtf' ? 'Operator' : res.scnby == 'hcf' ? 'By HCF' : res.scnby }
//       }))

//       console.log(newdataTotal)

//       ary = ary.map((res: any) => {
//         const bwt = (res.bluwt && !isNaN(Number(res.bluwt))) ? Number(res.bluwt) : 0.000;
//         const rwt = (res.redwt && !isNaN(Number(res.redwt))) ? Number(res.redwt) : 0.000;
//         const ywt = (res.ylwwt && !isNaN(Number(res.ylwwt))) ? Number(res.ylwwt) : 0.000;
//         const wwt = (res.whtwt && !isNaN(Number(res.whtwt))) ? Number(res.whtwt) : 0.000;
//         const cwt = (res.cytwt && !isNaN(Number(res.cytwt))) ? Number(res.cytwt) : 0.000;
//         const bcnt = (res.blucnt && !isNaN(Number(res.blucnt))) ? Number(res.blucnt) : 0;
//         const rcnt = (res.redcnt && !isNaN(Number(res.redcnt))) ? Number(res.redcnt) : 0;
//         const ycnt = (res.ylwcnt && !isNaN(Number(res.ylwcnt))) ? Number(res.ylwcnt) : 0;
//         const wcnt = (res.whtcnt && !isNaN(Number(res.whtcnt))) ? Number(res.whtcnt) : 0;
//         const ccnt = (res.cytcnt && !isNaN(Number(res.cytcnt))) ? Number(res.cytcnt) : 0;
//         tempTotal.totalWt += (bwt + rwt + ywt + wwt + cwt)
//         tempTotal.totalCnt += (bcnt + rcnt + ycnt + wcnt + ccnt)
//         const ttlwt = Number(bwt + rwt + ywt + wwt + cwt).toFixed(3)
//         const ttlcnt = Number(bcnt + rcnt + ycnt + wcnt + ccnt)
//         let fltr = res.fltr ? levelWhoData.lvl == 'STT' ? getStateFullFormWho(res.fltr) : res.fltr : 'CPCB'
//         return { ...res, ttlwt, ttlcnt, bluwt: bwt.toFixed(3), redwt: rwt.toFixed(3), ylwwt: ywt.toFixed(3), whtwt: wwt.toFixed(3), cytwt: cwt.toFixed(3), blucnt: bcnt, redcnt: rcnt, ylwcnt: ycnt, whtcnt: wcnt, cytcnt: ccnt, fltr: fltr == 'cpcb' ? 'CPCB' : fltr, scnby: res.scnby == 'fct' ? 'At CBWTF' : res.scnby == 'cbwtf' ? 'Operator' : res.scnby == 'hcf' ? 'By HCF' : res.scnby, bdctg: res.bdctg == '1' ? 'Below 30 Bedded' : 'Above 30 Bedded',  dt_rpt: res.dt_rpt }
//       })


//       setTotal(tempTotal)
//       // ary = clrNAValue(ary, state.grdcnt);
//       // ary = ChangeCase(
//       //   ary,
//       //   "redcnt#redwt#ylwcnt#ylwwt#whtcnt#whtwt#blucnt#bluwt#cytcnt#cytwt"
//       // );
//       // ary = gridAddToolTipColumn(
//       //   ary,
//       //   "tpred",
//       //   "Please click on the color to get details of red (Bag) waste Bag for : ",
//       //   "",
//       //   "fltr"
//       // );
//       // ary = gridAddToolTipColumn(
//       //   ary,
//       //   "tpylw",
//       //   "Please click on the color to get details of yellow (Bag) waste Bag for : ",
//       //   "",
//       //   "fltr"
//       // );
//       // ary = gridAddToolTipColumn(
//       //   ary,
//       //   "tpwht",
//       //   "Please click on the color to get details of white (Bag) waste Bag for : ",
//       //   "",
//       //   "fltr"
//       // );
//       // ary = gridAddToolTipColumn(
//       //   ary,
//       //   "tpblu",
//       //   "Please click on the color to get details of blue (Bag) waste Bag for : ",
//       //   "",
//       //   "fltr"
//       // );
//       // ary = gridAddToolTipColumn(
//       //   ary,
//       //   "tpcyt",
//       //   "Please click on the color to get details of cytotoxic (Bag) waste Bag for : ",
//       //   "",
//       //   "fltr"
//       // );
//       ary = sortArrayByFieldOrder(ary,["hcfnm"])
//       // ary = sortArrayByFieldOrder(ary, ["bdctg"]);
//       setTimeout(function () {
//         dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
//       }, 800);
//       // setNewData(ary);
//     }
//     else {
//       setNewData([]);
//       showToaster([data.data], 'error');
//       setTimeout(() => {
//         showToaster([], 'success');
//       }, 5000)
//     }


//     // if (dt == "" || data.data[0].Status == 'Failed') {
//     //   setNewData([]);
//     //   showToaster( ['Did not find any Data'], 'success');
//     //   setTimeout(() => {
//     //     showToaster( [], 'success');
//     //   }, 400)
//     // }

//     return 1;
//   }

//   function handleSupervisor(obj: any, key: string, temp?: any) {
//     if (temp) {
//       temp.redwt += Number(obj.redwt);
//       temp.bluwt += Number(obj.bluwt);
//       temp.ylwwt += Number(obj.ylwwt);
//       temp.whtwt += Number(obj.whtwt);
//       temp.cytwt += Number(obj.cytwt);
//       temp.bcnt += Number(obj.blucnt);
//       temp.rcnt += Number(obj.redcnt);
//       temp.ycnt += Number(obj.ylwcnt);
//       temp.wcnt += Number(obj.whtcnt);
//       temp.ccnt += Number(obj.cytcnt);

//       //to fixed 3
//       temp.redwt = Number(temp.redwt.toFixed(3));
//       temp.bluwt = Number(temp.bluwt.toFixed(3));
//       temp.ylwwt = Number(temp.ylwwt.toFixed(3));
//       temp.whtwt = Number(temp.whtwt.toFixed(3));
//       temp.cytwt = Number(temp.cytwt.toFixed(3));
//     } else {
//       newArray.push({
//         cbwtfnm: obj.cbwtfnm,
//         fltr: key,
//         scnby: obj.scnby,
//         redwt: Number(obj.redwt),
//         bluwt: Number(obj.bluwt),
//         ylwwt: Number(obj.ylwwt),
//         whtwt: Number(obj.whtwt),
//         cytwt: Number(obj.cytwt),
//         bcnt: Number(obj.blucnt),
//         rcnt: Number(obj.redcnt),
//         ycnt: Number(obj.ylwcnt),
//         wcnt: Number(obj.whtcnt),
//         ccnt: Number(obj.cytcnt),
//         dt_rpt:obj.dt_rpt
//       });
//     }
//   }
//   function handleByHCF(obj: any, key: string, temp?: any) {
//     if (temp) {
//       // Update existing temp
//       temp.redwt += Number(obj.redwt);
//       temp.bluwt += Number(obj.bluwt);
//       temp.ylwwt += Number(obj.ylwwt);
//       temp.whtwt += Number(obj.whtwt);
//       temp.cytwt += Number(obj.cytwt);
//       temp.bcnt += Number(obj.blucnt);
//       temp.rcnt += Number(obj.redcnt);
//       temp.ycnt += Number(obj.ylwcnt);
//       temp.wcnt += Number(obj.whtcnt);
//       temp.ccnt += Number(obj.cytcnt);
//       //To fixed 3
//       temp.redwt = Number(temp.redwt.toFixed(3));
//       temp.bluwt = Number(temp.bluwt.toFixed(3));
//       temp.ylwwt = Number(temp.ylwwt.toFixed(3));
//       temp.whtwt = Number(temp.whtwt.toFixed(3));
//       temp.cytwt = Number(temp.cytwt.toFixed(3));
//     } else {
//       newArray.push({
//         cbwtfnm: obj.cbwtfnm,
//         fltr: key,
//         scnby: obj.scnby,
//         redwt: Number(obj.redwt),
//         bluwt: Number(obj.bluwt),
//         ylwwt: Number(obj.ylwwt),
//         whtwt: Number(obj.whtwt),
//         cytwt: Number(obj.cytwt),
//         bcnt: Number(obj.blucnt),
//         rcnt: Number(obj.redcnt),
//         ycnt: Number(obj.ylwcnt),
//         wcnt: Number(obj.whtcnt),
//         ccnt: Number(obj.cytcnt),
//         dt_rpt:obj.dt_rpt
//       });
//     }
//   }

//   function handleAtFactory(obj: any, key: string, temp?: any) {
//     if (temp) {
//       temp.redwt += Number(obj.redwt);
//       temp.bluwt += Number(obj.bluwt);
//       temp.ylwwt += Number(obj.ylwwt);
//       temp.whtwt += Number(obj.whtwt);
//       temp.cytwt += Number(obj.cytwt);
//       temp.bcnt += Number(obj.blucnt);
//       temp.rcnt += Number(obj.redcnt);
//       temp.ycnt += Number(obj.ylwcnt);
//       temp.wcnt += Number(obj.whtcnt);
//       temp.ccnt += Number(obj.cytcnt);
//       //to fixed 3
//       temp.redwt = Number(temp.redwt.toFixed(3));
//       temp.bluwt = Number(temp.bluwt.toFixed(3));
//       temp.ylwwt = Number(temp.ylwwt.toFixed(3));
//       temp.whtwt = Number(temp.whtwt.toFixed(3));
//       temp.cytwt = Number(temp.cytwt.toFixed(3));
//     } else {
//       newArray.push({
//         cbwtfnm: obj.cbwtfnm,
//         fltr: key,
//         scnby: obj.scnby,
//         redwt: Number(obj.redwt),
//         bluwt: Number(obj.bluwt),
//         ylwwt: Number(obj.ylwwt),
//         whtwt: Number(obj.whtwt),
//         cytwt: Number(obj.cytwt),
//         bcnt: Number(obj.blucnt),
//         rcnt: Number(obj.redcnt),
//         ycnt: Number(obj.ylwcnt),
//         wcnt: Number(obj.whtcnt),
//         ccnt: Number(obj.cytcnt),
//         dt_rpt:obj.dt_rpt
//       });
//     }
//   }

//   function handleSupervisor2(obj: any, key: string, temp?: any) {
//     if (temp) {
//       temp.redwt += Number(obj.redwt);
//       temp.bluwt += Number(obj.bluwt);
//       temp.ylwwt += Number(obj.ylwwt);
//       temp.whtwt += Number(obj.whtwt);
//       temp.cytwt += Number(obj.cytwt);
//       temp.bcnt += Number(obj.blucnt);
//       temp.rcnt += Number(obj.redcnt);
//       temp.ycnt += Number(obj.ylwcnt);
//       temp.wcnt += Number(obj.whtcnt);
//       temp.ccnt += Number(obj.cytcnt);

//       //to fixed 3
//       temp.redwt = Number(temp.redwt.toFixed(3));
//       temp.bluwt = Number(temp.bluwt.toFixed(3));
//       temp.ylwwt = Number(temp.ylwwt.toFixed(3));
//       temp.whtwt = Number(temp.whtwt.toFixed(3));
//       temp.cytwt = Number(temp.cytwt.toFixed(3));
//     } else {
//       newArray2.push({
//         cbwtfnm: obj.cbwtfnm,
//         fltr: key,
//         scnby: obj.scnby,
//         redwt: Number(obj.redwt),
//         bluwt: Number(obj.bluwt),
//         ylwwt: Number(obj.ylwwt),
//         whtwt: Number(obj.whtwt),
//         cytwt: Number(obj.cytwt),
//         bcnt: Number(obj.blucnt),
//         rcnt: Number(obj.redcnt),
//         ycnt: Number(obj.ylwcnt),
//         wcnt: Number(obj.whtcnt),
//         ccnt: Number(obj.cytcnt),
//         dt_rpt :obj.dt_rpt
//       });
//     }
//   }
//   function handleByHCF2(obj: any, key: string, temp?: any) {
//     if (temp) {
//       // Update existing temp
//       temp.redwt += Number(obj.redwt);
//       temp.bluwt += Number(obj.bluwt);
//       temp.ylwwt += Number(obj.ylwwt);
//       temp.whtwt += Number(obj.whtwt);
//       temp.cytwt += Number(obj.cytwt);
//       temp.bcnt += Number(obj.blucnt);
//       temp.rcnt += Number(obj.redcnt);
//       temp.ycnt += Number(obj.ylwcnt);
//       temp.wcnt += Number(obj.whtcnt);
//       temp.ccnt += Number(obj.cytcnt);
//       //To fixed 3
//       temp.redwt = Number(temp.redwt.toFixed(3));
//       temp.bluwt = Number(temp.bluwt.toFixed(3));
//       temp.ylwwt = Number(temp.ylwwt.toFixed(3));
//       temp.whtwt = Number(temp.whtwt.toFixed(3));
//       temp.cytwt = Number(temp.cytwt.toFixed(3));
//     } else {
//       newArray2.push({
//         cbwtfnm: obj.cbwtfnm,
//         fltr: key,
//         scnby: obj.scnby,
//         redwt: Number(obj.redwt),
//         bluwt: Number(obj.bluwt),
//         ylwwt: Number(obj.ylwwt),
//         whtwt: Number(obj.whtwt),
//         cytwt: Number(obj.cytwt),
//         bcnt: Number(obj.blucnt),
//         rcnt: Number(obj.redcnt),
//         ycnt: Number(obj.ylwcnt),
//         wcnt: Number(obj.whtcnt),
//         ccnt: Number(obj.cytcnt),
//         dt_rpt:obj.dt_rpt,
//       });
//     }
//   }

//   function handleAtFactory2(obj: any, key: string, temp?: any) {
//     if (temp) {
//       temp.redwt += Number(obj.redwt);
//       temp.bluwt += Number(obj.bluwt);
//       temp.ylwwt += Number(obj.ylwwt);
//       temp.whtwt += Number(obj.whtwt);
//       temp.cytwt += Number(obj.cytwt);
//       temp.bcnt += Number(obj.blucnt);
//       temp.rcnt += Number(obj.redcnt);
//       temp.ycnt += Number(obj.ylwcnt);
//       temp.wcnt += Number(obj.whtcnt);
//       temp.ccnt += Number(obj.cytcnt);
//       //to fixed 3
//       temp.redwt = Number(temp.redwt.toFixed(3));
//       temp.bluwt = Number(temp.bluwt.toFixed(3));
//       temp.ylwwt = Number(temp.ylwwt.toFixed(3));
//       temp.whtwt = Number(temp.whtwt.toFixed(3));
//       temp.cytwt = Number(temp.cytwt.toFixed(3));
//     } else {
//       newArray2.push({
//         cbwtfnm: obj.cbwtfnm,
//         fltr: key,
//         scnby: obj.scnby,
//         redwt: Number(obj.redwt),
//         bluwt: Number(obj.bluwt),
//         ylwwt: Number(obj.ylwwt),
//         whtwt: Number(obj.whtwt),
//         cytwt: Number(obj.cytwt),
//         bcnt: Number(obj.blucnt),
//         rcnt: Number(obj.redcnt),
//         ycnt: Number(obj.ylwcnt),
//         wcnt: Number(obj.whtcnt),
//         ccnt: Number(obj.cytcnt),
//         dt_rpt:obj.dt_rpt,
//       });
//     }
//   }



//   function populateGrid2(data: any) {
//     setIsLoading("");
//     dispatch({ type: ACTIONS.DISABLE, payload: 1 });
//     dispatch({ type: ACTIONS.RANDOM, payload: 1 });
//     dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 });

//     let dt: any = GetResponseLnx(data);
//     if (dt && Array.isArray(dt) && dt.length) {
//       if (dt) {
//         let ary: any = dt;
//         let totalArySum = ary;

//         totalArySum.forEach((obj: any) => {
//           const key = obj.fltr.toLowerCase();
//           let temp = newArray2.find((item) => item.fltr === key && item.scnby === obj.scnby);

//           if (obj.scnby === 'cbwtf') {
//             handleSupervisor2(obj, key, temp);
//           }
//           if (obj.scnby === 'hcf') {
//             handleByHCF2(obj, key, temp);
//           }
//           if (obj.scnby === 'fct') {
//             handleAtFactory2(obj, key, temp);
//           }
//         });

//         setNewdataTotal2(newArray2.map((res: any) => {
//           return {
            
//             ...res,
//             dt_rpt:res.dt_rpt,
//             ttlcnt: res.bcnt + res.rcnt + res.ccnt + res.wcnt + res.ycnt,
//             ttlwt: Number(res.bluwt + res.redwt + res.cytwt + res.whtwt + res.ylwwt).toFixed(3),
//             fltr: levelWhoData.lvl === 'RGD' ? getStateFullForm(String(res.fltr).toUpperCase()) : String(res.fltr).toUpperCase(),
//             scnby: res.scnby === 'fct' ? 'At CBWTF' : res.scnby === 'cbwtf' ? 'Operator' : res.scnby === 'hcf' ? 'By HCF' : res.scnby,
//           };
//         }));

//         ary = ary.map((res: any) => {
//           const bwt = (res.bluwt && !isNaN(Number(res.bluwt))) ? Number(res.bluwt) : 0.000;
//           const rwt = (res.redwt && !isNaN(Number(res.redwt))) ? Number(res.redwt) : 0.000;
//           const ywt = (res.ylwwt && !isNaN(Number(res.ylwwt))) ? Number(res.ylwwt) : 0.000;
//           const wwt = (res.whtwt && !isNaN(Number(res.whtwt))) ? Number(res.whtwt) : 0.000;
//           const cwt = (res.cytwt && !isNaN(Number(res.cytwt))) ? Number(res.cytwt) : 0.000;
//           const bcnt = (res.blucnt && !isNaN(Number(res.blucnt))) ? Number(res.blucnt) : 0;
//           const rcnt = (res.redcnt && !isNaN(Number(res.redcnt))) ? Number(res.redcnt) : 0;
//           const ycnt = (res.ylwcnt && !isNaN(Number(res.ylwcnt))) ? Number(res.ylwcnt) : 0;
//           const wcnt = (res.whtcnt && !isNaN(Number(res.whtcnt))) ? Number(res.whtcnt) : 0;
//           const ccnt = (res.cytcnt && !isNaN(Number(res.cytcnt))) ? Number(res.cytcnt) : 0;
//           const ttlwt = Number(bwt + rwt + ywt + wwt + cwt).toFixed(3);
//           const ttlcnt = Number(bcnt + rcnt + ycnt + wcnt + ccnt);
//           let fltr = res.fltr ? res.fltr : res.rgd ? res.rgd : res.stt;
//           return {
//             ...res,
//             ttlwt,
//             ttlcnt,
//             bluwt: bwt.toFixed(3),
//             redwt: rwt.toFixed(3),
//             ylwwt: ywt.toFixed(3),
//             whtwt: wwt.toFixed(3),
//             cytwt: cwt.toFixed(3),
//             blucnt: bcnt,
//             rdcnt: rcnt,
//             ylwcnt: ycnt,
//             whtcnt: wcnt,
//             cytcnt: ccnt,
//             fltr: fltr === 'cpcb' ? 'CPCB' : levelWhoData.lvl === 'RGD' ? getStateFullForm(res.fltr) : fltr,
//             scnby: res.scnby === 'fct' ? 'At CBWTF' : res.scnby === 'cbwtf' ? 'Operator' : res.scnby === 'hcf' ? 'By HCF' : res.scnby,
//             bdctg: res.bdctg === '1' ? 'Below 30 Bedded' : 'Above 30 Bedded',
//             dt_rpt: res.dt_rpt // Ensure dt_rpt is set correctly
//           };
//         });

//         ary = clrNAValue(ary, state.grdcnt);
//         ary = ChangeCase(ary, "redcnt#redwt#ylwcnt#ylwwt#whtcnt#whtwt#blucnt#bluwt#cytcnt#cytwt");
//         ary = gridAddToolTipColumn(ary, "tpred", "Please click on the color to get details of red (Bag) waste Bag for : ", "", "fltr");
//         ary = gridAddToolTipColumn(ary, "tpylw", "Please click on the color to get details of yellow (Bag) waste Bag for : ", "", "fltr");
//         ary = gridAddToolTipColumn(ary, "tpwht", "Please click on the color to get details of white (Bag) waste Bag for : ", "", "fltr");
//         ary = gridAddToolTipColumn(ary, "tpblu", "Please click on the color to get details of blue (Bag) waste Bag for : ", "", "fltr");
//         ary = gridAddToolTipColumn(ary, "tpcyt", "Please click on the color to get details of cytotoxic (Bag) waste Bag for : ", "", "fltr");
//         ary = sortArrayByFieldOrder(ary, ["cbwtfnm", "scnby"]);

//         setNewData2(ary);
//       } else {
//         setNewData2([]);
//         showToaster(['dt'], 'error');
//       }
//     }

//     if (dt === "" || data.data[0].Status === 'Failed') {
//       setNewData2([]);
//       showToaster(['Did not find any data for detailed tab'], 'error');
//       setTimeout(() => {
//         showToaster([], 'success');
//       }, 5000);
//     }

//     return 1;
//   }


//   const getGid = () => {
//     let gd: any = utilities(3, "", "");
//     dispatch({ type: ACTIONS.SETGID, payload: gd });
//     return gd;
//   };

//   // const [currentLevel, setCurrentLevel] = useState('');
//   // const [drilllvlState, setDrillLvlState] = useState('');


//   const getCbwtfWstList = () => {
//     // handleChange(undefined, 0);
//     setIsLoading("Loding Data...")
//     let level =lvl;
//     let who = levelWhoData.who;
//     let dateFrm = getFldValue(state.textDts, "dt_rptfrm")
//     let dateTo = getFldValue(state.textDts, "dt_rptto")
//     if (!dateFrm) {
//       dateFrm = moment(Date.now()).format("DD-MMM-yyyy")

//     } else if (!dateTo) {
//       dateTo = moment(Date.now()).format("DD-MMM-yyyy")
//     }
//     let dtFrm = UseMomentDateNmb(dateFrm);
//     let dtTo = UseMomentDateNmb(dateTo);
//     let dtwise = true
//     let gid: string = getGid();
//     // let api: string = createGetApi(
//     //   "db=nodb|dll=xrydll|fnct=a190",
//     //   levelWhoData.lvl + "=" + gid + "=" + levelWhoData.who + "=1"
//     // );
//     // return nrjAxios({ apiCall: api });
//     const payload: any = postLinux(level + '=' + who + '=' + "" + '=' + dtFrm + '=' + dtTo + '=' + dtwise + '=' + gid, 'show_CorrectBagsmry');
//     // const payload: any = postLinux(levelWhoData.who + '=' + levelWhoData.who + '=' + gid, 'wstdata');
//     return nrjAxiosRequestBio("show_CorrectBagsmry", payload);
//   };

//   const getCbwtfWstList2 = () => {
//     if (levelWhoData.lvl != 'CBWTF') {
//       handleChange(undefined, 0);
//       setIsLoading("Loding Data...")
//       let dateFrm = getFldValue(state.textDts, "dt_rptfrm")
//       let dateTo = getFldValue(state.textDts, "dt_rptto")
//       if (!dateFrm) {
//         dateFrm = moment(Date.now()).format("DD-MMM-yyyy")

//       } else if (!dateTo) {
//         dateTo = moment(Date.now()).format("DD-MMM-yyyy")
//       }
//       let dtFrm = UseMomentDateNmb(dateFrm);
//       let dtTo = UseMomentDateNmb(dateTo);
//       let dtwise = true
//       let gid: string = getGid();
//       // let api: string = createGetApi(
//       //   "db=nodb|dll=xrydll|fnct=a190",
//       //   levelWhoData.lvl + "=" + gid + "=" + levelWhoData.who + "=1"
//       // );
//       // return nrjAxios({ apiCall: api });
//       let shrtby = levelWhoData.lvl == 'CPCB' ? "RGD" : levelWhoData.lvl == 'RGD' ? 'STT' : 'CBWTF';
//       const payload: any = postLinux("ALL" + '=' + levelWhoData.lvl + '=' + levelWhoData.who + '=' + dtFrm + '=' + dtTo + '=' + dtwise + '=' + shrtby, 'listwstdata2');
//       return nrjAxiosRequestBio("dshbrd", payload);
//     }
//   };

//   const { data: data3, refetch: refetchG } = useQuery({
//     queryKey: ["g1", levelWhoData],
//     queryFn: getCbwtfWstList,
//     enabled: false,
//     staleTime: Number.POSITIVE_INFINITY,
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//     onSuccess: populateGrid,
//   });

//   const { data: data2, refetch: refetchG2 } = useQuery({
//     queryKey: ["g2", levelWhoData],
//     queryFn: getCbwtfWstList2,
//     enabled: false,
//     staleTime: Number.POSITIVE_INFINITY,
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//     onSuccess: populateGrid2,
//   });

//   const svClick = () => {

//     dispatch({ type: ACTIONS.DISABLE, payload: 2 });
//     dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
//     dispatch({ type: ACTIONS.RANDOM, payload: 1 });
//     setTotal({ totalWt: 0, totalCnt: 0 });
//     setTimeout(() => {
//       refetchG();
//       // refetchG2();
//       dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
//     }, 400)
//   };

//   const GetPrnt = (lvl: string) => {
//     let gid: string = state.gid;
//     if (!gid) {
//       showToaster(["populate the data in the grid"], 'error');
//       return;
//     }
//     let api: string = createGetApi(
//       "db=nodb|dll=chqdll|fnct=g123",
//       gid + "=" + lvl + "=0"
//     );
//     return nrjAxios({ apiCall: api });
//   };

//   const showPrnt = (dataC: any) => {
//     let dt: string = GetResponseWnds(dataC);

//     dispatch({ type: ACTIONS.DISABLE, payload: 1 })
//     if (dt && dt.indexOf('.pdf') > -1) {
//       window.open(dataC.data[0]["Data"], "_blank")
//     } else {
//       showToaster(["Please try again after refreshing the page!"],
//         'error')
//     }
//     dispatch({ type: ACTIONS.RANDOM, payload: 1 });
//   }

//   const { data: dataP, refetch: refetchP } = useQuery({
//     queryKey: ["getprint", levelWhoData.lvl],
//     queryFn: () => GetPrnt(levelWhoData.lvl),
//     enabled: false,
//     staleTime: Number.POSITIVE_INFINITY,
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: false,
//     onSuccess: showPrnt,
//   });


//   function printClick() {
//     dispatch({ type: ACTIONS.DISABLE, payload: 1 });
//     refetchP()
//   }

//   const [valueType, setValueType] = useState(0);
//   const handleChange = (event: React.SyntheticEvent | undefined, newValue: number) => {
//     setValueType(newValue);
//     let updatedColdef = [...coldef];
//     let updatedColdef1 = [...coldef1];

//     if (levelWhoData.lvl == "RGD") {
//       updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "Regional directorate" } : { ...updatedColdef[3], headerName: "State/UT" }; // Update the headerName of the second element
//       updatedColdef1[3] = newValue == 0 ? { ...updatedColdef1[3], headerName: "Regional directorate" } : { ...updatedColdef1[3], headerName: "State/UT" }; // Update the headerName of the second element

//       setColDef(updatedColdef);
//       setColDef1(updatedColdef1);
//     } else if (levelWhoData.lvl.toUpperCase() == "STT") {
//       updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[3], headerName: "CBWTF" }; // Update the headerName of the second element
//       updatedColdef1[3] = newValue == 0 ? { ...updatedColdef1[3], headerName: "State/UT" } : { ...updatedColdef1[3], headerName: "CBWTF" }; // Update the headerName of the second element

//       setColDef(updatedColdef);
//       setColDef1(updatedColdef1);
//     } else if (levelWhoData.lvl == "CBWTF") {
//       updatedColdef[3] = { ...updatedColdef[3], headerName: "CBWTF" };
//       updatedColdef1[3] = { ...updatedColdef1[3], headerName: "CBWTF" };

//       setColDef(updatedColdef);
//       setColDef1(updatedColdef1);
//     } else {
//       updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "CPCB" } : { ...updatedColdef[3], headerName: "Regional directorate" };
//       updatedColdef1[3] = newValue == 0 ? { ...updatedColdef1[3], headerName: "CPCB" } : { ...updatedColdef1[3], headerName: "Regional directorate" };

//       setColDef(updatedColdef);
//       setColDef1(updatedColdef1);
//     }
//   };

//   const applicationVerion: string = getApplicationVersion();

//   const onChangeDts = (data: string) => {
//     dispatch({ type: ACTIONS.FORM_DATA, payload: data });
//   };

//   const setLvlWhoData = (data: any) => {
//     // let fld: any = utilities(2, data, "");
//     // if (fld == 'dt_rptto') {
//     // }
//     onChangeDts(data.dateFrom);
//     onChangeDts(data.dateTo);
//     setTotal({ totalWt: 0, totalCnt: 0 });
//     dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
//     setTimeout(() => {
//       dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
//     }, 400)
//     setLvl(data.lvl);
//     if (lvl == "CBWTF") {
//       setValueType(0)
//     }
//     setLevelWhoData({ lvl: data.lvl, who: data.who });

//   }

//   const [prependContent, setPrependContent] = useState<any[]>([])


//   const getPrependContentValue = (levelValue: string) => {
//     return [
//       [
//         {
//           data: {
//             value: 'List of Health Care Facility',
//             type: "String",
//           },
//           mergeAcross: 3
//         },
//       ],
//       [
//         {
//           data: {
//             value: levelValue,
//             type: "String",
//           },
//           mergeAcross: 5
//         },
//       ],
//       [
//         {
//           data: {
//             value: 'Date: ' + moment(Date.now()).format("DD-MMM-yyyy"),
//             type: "String",
//           },
//           mergeAcross: 5
//         },
//       ],
//       [],
//     ]
//   };


//   function a11yProps(index: number) {
//     return {
//       id: `simple-tab-${index}`,
//       'aria-controls': `simple-tabpanel-${index}`,
//     };
//   }

//   const [filterParameter, setFilterParameter] = useState<any>(null)
//   const getFilteredParameter = (data: any) => {
//     setFilterParameter(data);
//   }

//   const [filterParameter1, setFilterParameter1] = useState<any>(null)
//   const getFilteredParameter1 = (data: any) => {
//     setFilterParameter1(data);
//   }

//   const excelColWidth = [{ wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]

//   const [printExcelHeaderCbwtf, setPrintExcelHeaderCbwtf] = useState<any[]>([])
//   const [keyOrderCbwtf, setKeyOrderCbwtf] = useState<any[]>([])
//   const [printExcelHeader, setPrintExcelHeader] = useState<any[]>([])
//   const [keyOrder, setKeyOrder] = useState<any[]>([])
//   const [printExcelHeader1, setPrintExcelHeader1] = useState<any[]>([])
//   const [keyOrder1, setKeyOrder1] = useState<any[]>([])


//   useEffect(() => {
//     let tempOne: any[] = [];
//     let tempTwo: any[] = [];
//     coldefCbwtf.forEach((res: any) => {
//       if (res.children) {
//         let str = res.headerName + " ";
//         res.children.forEach((element: any) => {
//           tempOne.push(element.field);
//           tempTwo.push(str + element.headerName)
//         });
//       }
//       else if (!res['hide']) {
//         tempOne.push(res.field);
//         tempTwo.push(res.headerName)
//       }
//     })
//     setPrintExcelHeaderCbwtf(tempTwo);
//     setKeyOrderCbwtf(tempOne)
//     // set current date when component in render first time 
//     const today = new Date();
//     let str: string = moment(today).format("DD-MMM-yyyy");
//     onChangeDts("dt_rptfrm]["+str);
//     onChangeDts("dt_rptto]["+str);
//   }, [])


//   useEffect(() => {
//     let tempOne: any[] = [];
//     let tempTwo: any[] = [];
//     coldef.forEach((res: any) => {
//       if (res.children) {
//         let str = res.headerName + " ";
//         res.children.forEach((element: any) => {
//           tempOne.push(element.field);
//           tempTwo.push(str + element.headerName)
//         });
//       }
//       else if (!res['hide']) {
//         tempOne.push(res.field);
//         tempTwo.push(res.headerName)
//       }
//     })
//     setPrintExcelHeader(tempTwo);
//     setKeyOrder(tempOne)
//   }, [coldef])

//   useEffect(() => {
//     let tempOne: any[] = [];
//     let tempTwo: any[] = [];
//     coldef1.forEach((res: any) => {
//       if (res.children) {
//         let str = res.headerName + " ";
//         res.children.forEach((element: any) => {
//           tempOne.push(element.field);
//           tempTwo.push(str + element.headerName)
//         });

//       }
//       else if (!res['hide']) {
//         tempOne.push(res.field);
//         tempTwo.push(res.headerName)
//       }
//     })
//     setPrintExcelHeader1(tempTwo);
//     setKeyOrder1(tempOne)
//   }, [coldef1])


//   return (
//     <>
//       <LevelSelector
//         // showCbwtf={false}
//         // levelSelectorData={setLvlWhoData}
//         // dateFieldFrom={true}
//         // dateFieldTo={true}
//         // printButton={false}
//         // printButtonClick={printClick}
//         // getListButton={true}
//         // getListOnclick={svClick}
//         dateFieldFrom={true}
//         dateFieldTo={true}
//         levelSelectorData={setLvlWhoData}
//         getListButton={true}
//         getListOnclick={svClick}
//         showToggleButton={false}
//       ></LevelSelector>

//       <div className="bg-white shadow rounded-lg px-4 pb-6 pt-3">
//         <Box sx={{ width: '100%' }}>
//           {/* <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//             <Tabs value={valueType} onChange={handleChange} aria-label="basic tabs example">
//               <Tab label="Summary" {...a11yProps(0)} />
//               {lvl !== "CBWTF" ?
//                 <Tab label="Details" {...a11yProps(1)} /> :
//                 null}
//             </Tabs>
//           </Box> */}
//           <CustomTabPanel value={valueType} index={0}>
//             <div>
//               {total ? <div className="border rounded-lg mb-3">
//                 <div className="p-3">
//                   <div className="flex font-semibold ">
//                     <>
//                       Total Bags : {total.totalCnt}

//                     </>
//                     <div className="ml-6">
//                       Total Bags Weight : {total.totalWt.toFixed(3)} Kg
//                     </div>
//                   </div>
//                 </div>
//               </div> : <></>}
//               <div className="font-semibold text-lg mx-11">{isLoading}</div>
//               {showMessage && showMessage.message.length != 0 && <div className="py-2">
//                 <Toaster data={showMessage} className={''}></Toaster>
//               </div>}
//               <div className="my-2">
//                 <NrjAgGrid
//                   onGridLoaded={GridLoaded}
//                   onRowSelected={onRowSelected}
//                   colDef={coldef1}
//                   apiCall={""}
//                   height={400}
//                   rowData={rowData}
//                   deleteButton={""}
//                   deleteFldNm={""}
//                   showDataButton={""}
//                   showApi={''}
//                   onButtonClicked={onButtonClicked}
//                   showFldNm={"cbtwf"}
//                   className="ag-theme-alpine"
//                   trigger={state.triggerG}
//                   showPagination={true}
//                   // parentPaginationChanged={changePage}
//                   PageSize={10}
//                   appName="CPCB"
//                   newRowData={state.nwRow}
//                   showTooltips={true}
//                   showExport={true}
//                   prependContent={prependContent}
//                   colDefPrint={coldef1}
//                   pageTitle={"List of HCF who sent Correct Info "}
//                   printExcelHeader={printExcelHeader1}
//                   exceColWidth={excelColWidth}
//                   KeyOrder={keyOrder1}
//                   lvl={levelWhoData.lvl}
//                   who={levelWhoData.who}
//                   getFilteredParameter={getFilteredParameter}
//                 ></NrjAgGrid>

//               </div>

//               {/* <span className="mt-3 fw-bold text-[16px] flex justify-center text-blue-700">
//                 List of waste bags based on HCF bed strength
//               </span>
//               <NrjAgGrid
//                 onGridLoaded={GridLoaded}
//                 onRowSelected={onRowSelected}
//                 colDef={coldef}
//                 apiCall={""}
//                 rowData={newdata}
//                 deleteButton={""}
//                 deleteFldNm={""}
//                 showDataButton={""}
//                 showApi={""
//                   //"keyname][hcfbdlst>fltr=key][fltr>fltr=path][hcfWasteData=cellclicked][CBWTF$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Red(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Red(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Yellow(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Yellow(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][White(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][White(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Blue(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Blue(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Cytotoxic(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Cytotoxic(Weight Kg)"
//                 }
//                 onButtonClicked={onButtonClicked}
//                 showFldNm={"cbwtf"}
//                 className="ag-theme-alpine-blue ag-theme-alpine"
//                 trigger={state.triggerG}
//                 showPagination={true}
//                 // parentPaginationChanged={changePage}
//                 PageSize={100}
//                 appName="CPCB"
//                 newRowData={state.nwRow}
//                 showTooltips={true}
//                 showExport={true}
//                 pageTitle={"Summarized Waste Bags Data : "}
//                 printExcelHeader={printExcelHeader}
//                 exceColWidth={excelColWidth}
//                 KeyOrder={keyOrder}
//                 lvl={levelWhoData.lvl}
//                 who={levelWhoData.who}
//                 getFilteredParameter={getFilteredParameter}
//               ></NrjAgGrid> */}
//             </div>

//           </CustomTabPanel >
//           {/* {lvl !== "CBWTF" ?
//             <CustomTabPanel value={valueType} index={1}>
//               <div>
//                 <div className="absolute font-semibold text-lg mx-11">{isLoading}</div>
//                 {showMessage1 && showMessage1.message.length != 0 && <div className="py-2">
//                   <Toaster data={showMessage1} className={''}></Toaster>
//                 </div>}
//                 <span className="mt-3 fw-bold text-[16px] flex justify-center text-blue-700">
//                   List of waste bags based on Scan by values
//                 </span>
//                 <div className="my-2">
//                   <NrjAgGrid
//                     onGridLoaded={GridLoaded}
//                     onRowSelected={onRowSelected}
//                     colDef={levelWhoData.lvl == 'STT' ? coldefCbwtf : coldef1}
//                     apiCall={""}
//                     rowData={newdataTotal2}
//                     deleteButton={""}
//                     deleteFldNm={""}
//                     showDataButton={""}
//                     showApi={''}
//                     onButtonClicked={onButtonClicked}
//                     showFldNm={"cbtwf"}
//                     className="ag-theme-alpine-blue ag-theme-alpine"
//                     trigger={state.triggerG}
//                     showPagination={true}
//                     // parentPaginationChanged={changePage}
//                     PageSize={100}
//                     appName="CPCB"
//                     newRowData={state.nwRow}
//                     showTooltips={true}
//                     showExport={true}
//                     pageTitle={"Summarized Waste Bags Data : "}
//                     printExcelHeader={levelWhoData.lvl == 'STT' ? printExcelHeaderCbwtf : printExcelHeader1}
//                     exceColWidth={excelColWidth}
//                     KeyOrder={levelWhoData.lvl == 'STT' ? keyOrderCbwtf : keyOrder1}
//                     lvl={levelWhoData.lvl}
//                     who={levelWhoData.who}
//                     getFilteredParameter={getFilteredParameter}
//                   ></NrjAgGrid>

//                 </div>
//                 <span className="mt-3 fw-bold text-[16px] flex justify-center text-blue-700">
//                   List of waste bags based on HCF bed Category
//                 </span>
//                 <NrjAgGrid
//                   onGridLoaded={GridLoaded}
//                   onRowSelected={onRowSelected}
//                   colDef={levelWhoData.lvl == 'STT' ? coldefCbwtf : coldef}
//                   apiCall={""}
//                   rowData={newdata2}
//                   deleteButton={""}
//                   deleteFldNm={""}
//                   showDataButton={""}
//                   showApi={""
//                     //"keyname][hcfbdlst>fltr=key][fltr>fltr=path][hcfWasteData=cellclicked][CBWTF$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Red(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Red(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Yellow(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Yellow(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][White(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][White(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Blue(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Blue(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Cytotoxic(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Cytotoxic(Weight Kg)"
//                   }
//                   onButtonClicked={onButtonClicked}
//                   showFldNm={"cbtwf"}
//                   className="ag-theme-alpine-blue ag-theme-alpine"
//                   trigger={state.triggerG}
//                   showPagination={true}
//                   // parentPaginationChanged={changePage}
//                   PageSize={100}
//                   appName="CPCB"
//                   newRowData={state.nwRow}
//                   getFilteredParameter={getFilteredParameter1}
//                   showTooltips={true}
//                   showExport={true}
//                   pageTitle={"Summarized Waste Bags Data : "}
//                   printExcelHeader={levelWhoData.lvl == 'STT' ? printExcelHeaderCbwtf : printExcelHeader}
//                   exceColWidth={excelColWidth}
//                   KeyOrder={levelWhoData.lvl == 'STT' ? keyOrderCbwtf : keyOrder}
//                   lvl={levelWhoData.lvl}
//                   who={levelWhoData.who}
//                 ></NrjAgGrid>
//               </div>
//             </CustomTabPanel> : null} */}
//         </Box>
//       </div>


//     </>);
// };
// export default React.memo(NewHcfCorrect);




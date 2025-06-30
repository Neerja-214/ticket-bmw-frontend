import { useQuery } from "@tanstack/react-query";
import utilities, {
  createGetApi,
  ChangeCase,
  GetResponseWnds,
  dataStr_ToArray,
  gridAddToolTipColumn,
  getApplicationVersion,
  postLinux,
  GetResponseLnx,
  getStateFullForm,
  getStateFullFormWho,
  sortArrayByFieldOrder,
  trimField,
  capitalizeTerms,
} from "../../utilities/utilities";
import { Box, Tab, Tabs } from "@mui/material";
import React, { useEffect, useReducer, useState } from "react";
import {
  nrjAxios, nrjAxiosRequestBio
} from "../../Hooks/useNrjAxios";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { act } from "react-dom/test-utils";
import HdrDrp from "../HdrDrp";
import { clrNAValue } from "../../utilities/cpcb";
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

const ListCbwtfWstData = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const [showMessage1, setShowMessage1] = useState<any>({ message: [] });
  const [isLoading, setIsLoading] = useState("");
  const [levelWhoData, setLevelWhoData] = useState({ lvl: "", who: "" });
  const [lvl, setLvl] = useState("");
  const [coldef, setColDef] = useState([
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "fltr1", hide: true, width: 140, headerName: "CBWTF ID" },
    {
      field: "dt_rpt",
      hide: false,
      width: 125,
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
      colId: "dt_rpt"
    },
    {
      field: "fltr",
      hide: false,
      width: 180,
      headerName: "CPCB",
      filter: "agTextColumnFilter",
      rowspan: 3,
      colId: "fltr"
    },
    {
      field: "bdctg",
      hide: false,
      width: 170,
      headerName: "HCF category",
      filter: "agTextColumnFilter",
      rowspan: 3,
      colId: "bdctg"
    },

    {
      field: "scnby",
      hide: false,
      width: 110,
      headerName: "Scan by",
      filter: "agTextColumnFilter",
      colId: "scnby"
    },
    {
      headerName: 'Red',
      resizable: true,
      children: [
        {
          field: "redcnt",
          hide: false,
          width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
          colId: "redcnt",
          resizable: true,
        },
        {
          field: "redwt",
          hide: false,
          width: 140,
          headerName: "Weight (in kg)",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
          colId: "redwt",
          resizable: true,
        },
      ]
    },
    {
      headerName: 'Yellow',
      resizable: true,
      children: [
        {
          field: "ylwcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
          colId: "ylwcnt",
          resizable: true,
        },
        {
          field: "ylwwt",
          hide: false,
          width: 140,
          headerName: " Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
          colId: "ylwwt",
          resizable: true,
        },
      ]
    },
    {
      headerName: 'White',
      resizable: true,
      children: [
        {
          field: "whtcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          tooltipField: "tpwht",
          colId: "whtcnt",
          resizable: true,
        },
        {
          field: "whtwt",
          hide: false,
          width: 140,
          headerName: "Weight (in kg)",
          tooltipField: "tpwht",
          colId: "whtwt",
          resizable: true,
        },]
    },
    {
      headerName: 'Blue',
      resizable: true,
      children: [
        {
          field: "blucnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
          colId: "blucnt",
          resizable: true,
        },
        {
          field: "bluwt",
          hide: false,
          width: 140,
          headerName: " Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
          colId: "bluwt",
          resizable: true,
        },
      ]
    },
    {
      headerName: 'Cytotoxic',
      resizable: true,
      children: [
        {
          field: "cytcnt",
          hide: false,
         width: 85,
          headerName: " Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
          colId: "cytcnt",
          resizable: true,
        },
        {
          field: "cytwt",
          hide: false,
          width: 140,
          headerName: " Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
          colId: "cytwt",
          resizable: true,
        },
      ]
    },
    {
      field: "ttlcnt",
      hide: false,
      width: 120,
      headerName: "Total bags",
      filter: "agTextColumnFilter",
      rowspan: 3,
      colId: "ttlcnt",
    },
    {
      field: "ttlwt",
      hide: false,
      width: 210,
      headerName: "Total bags weight (in kg)",
      filter: "agTextColumnFilter",
      rowspan: 3,
      colId: "ttlwt",
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

  const coldefCbwtf = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "fltr", hide: true, width: 140, headerName: "CBWTF ID" },
    {
      field: "dt_rpt",
      colId: "dt_rpt",
      hide: false,
      width: 125,
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
      rowspan: 3,
      colId: "cbwtfnm",
    },
    // {
    //   field: "bdctg",
    //   hide: false,
    //   width: 200,
    //   headerName: "HCF category",
    //   filter: "agTextColumnFilter",
    //   rowspan: 3
    // },

    {
      field: "scnby",
      hide: false,
      width: 110,
      headerName: "Scan by",
      filter: "agTextColumnFilter",
      colId: "scnby",
    },
    {
      headerName: 'Red',
      resizable: true,
      children: [
        {
          field: "redcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
          colId: "redcnt",
          resizable: true,
        },
        {
          field: "redwt",
          hide: false,
          width: 140,
          headerName: "Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
          colId: "redwt",
          resizable: true,
        },
      ]
    },
    {
      headerName: 'Yellow',
      resizable: true,
      children: [
        {
          field: "ylwcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
          colId: "ylwcnt",
          resizable: true,
        },
        {
          field: "ylwwt",
          hide: false,
          width: 140,
          headerName: " Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
          colId: "ylwwt",
          resizable: true,
        },
      ]
    },
    {
      headerName: 'White',
      resizable: true,
      children: [
        {
          field: "whtcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          tooltipField: "tpwht",
          colId: "whtcnt",
          resizable: true,
        },
        {
          field: "whtwt",
          hide: false,
          width: 140,
          headerName: "Weight  (in kg)",
          tooltipField: "tpwht",
          colId: "whtwt",
          resizable: true,
        },]
    },
    {
      headerName: 'Blue',
      resizable: true,
      children: [
        {
          field: "blucnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
          colId: "blucnt",
          resizable: true,
        },
        {
          field: "bluwt",
          hide: false,
          width: 140,
          headerName: " Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
          colId: "bluwt",
          resizable: true,
        },
      ]
    },
    {
      headerName: 'Cytotoxic',
      resizable: true,
      children: [
        {
          field: "cytcnt",
          hide: false,
         width: 85,
          headerName: " Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
          colId: "cytcnt",
          resizable: true,
        },
        {
          field: "cytwt",
          hide: false,
          width: 140,
          headerName: " Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
          colId: "cytwt",
          resizable: true,
        },
      ]
    },
    {
      field: "ttlcnt",
      hide: false,
      width: 120,
      headerName: "Total bags",
      filter: "agTextColumnFilter",
      rowspan: 3,
      colId: "ttlcnt",
    },
    {
      field: "ttlwt",
      hide: false,
      width: 210,
      headerName: "Total bags weight (in kg)",
      filter: "agTextColumnFilter",
      rowspan: 3,
      colId: "ttlwt",
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
  ]

  const coldefCbwtf1 = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "fltr", hide: true, width: 140, headerName: "CBWTF ID" },
    {
      field: "dt_rpt",
      hide: false,
      width: 125,
      resizable: true,
      colId: "dt_rpt",
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
      rowspan: 3,
      resizable: true,
      colId: "cbwtfnm",
    },
    {
      field: "bdctg",
      hide: false,
      width: 170,
      headerName: "HCF category",
      filter: "agTextColumnFilter",
      rowspan: 3,
      resizable: true,
      colId: "bdctg",
    },

    {
      field: "scnby",
      hide: false,
      width: 110,
      headerName: "Scan by",
      filter: "agTextColumnFilter",
      resizable: true,
      colId: "scnby",
    },
    {
      headerName: 'Red',
      resizable: true,
      children: [
        {
          field: "redcnt",
          hide: false,
          width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
          resizable: true,
          colId: "redcnt",
        },
        {
          field: "redwt",
          hide: false,
          width: 140,
          headerName: "Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
          resizable: true,
          colId: "redwt",
        },
      ]
    },
    {
      headerName: 'Yellow',
      resizable: true,
      children: [
        {
          field: "ylwcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
          resizable: true,
          colId: "ylwcnt",
        },
        {
          field: "ylwwt",
          hide: false,
          width: 140,
          headerName: " Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
          resizable: true,
          colId: "ylwwt",
        },
      ]
    },
    {
      headerName: 'White',
      resizable: true,
      children: [
        {
          field: "whtcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          tooltipField: "tpwht",
          resizable: true,
          colId: "whtcnt",
        },
        {
          field: "whtwt",
          hide: false,
          width: 140,
          headerName: "Weight  (in kg)",
          tooltipField: "tpwht",
          resizable: true,
          colId: "whtwt",
        },]
    },
    {
      headerName: 'Blue',
      resizable: true,
      children: [
        {
          field: "blucnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
          resizable: true,
          colId: "blucnt",
        },
        {
          field: "bluwt",
          hide: false,
          width: 140,
          headerName: " Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
          resizable: true,
          colId: "bluwt",
        },
      ]
    },
    {
      headerName: 'Cytotoxic',
      resizable: true,
      children: [
        {
          field: "cytcnt",
          hide: false,
         width: 85,
          headerName: " Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
          resizable: true,
          colId: "cytcnt",
        },
        {
          field: "cytwt",
          hide: false,
          width: 140,
          headerName: " Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
          resizable: true,
          colId: "cytwt",
        },
      ]
    },
    {
      field: "ttlcnt",
      hide: false,
      width: 120,
      headerName: "Total bags",
      filter: "agTextColumnFilter",
      rowspan: 3,
      colId: "ttlcnt",
    },
    {
      field: "ttlwt",
      hide: false,
      width: 210,
      headerName: "Total bags weight (in kg)",
      filter: "agTextColumnFilter",
      rowspan: 3,
      colId: "ttlwt",
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
  ]

  const [coldef1, setColDef1] = useState([
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "fltr1", hide: true, width: 140, headerName: "CBWTF ID" },
    {
      field: "dt_rpt",
      hide: false,
      resizable: true,
      colId: "dt_rpt",
      width: 125,
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
      resizable: true,
      hide: false,
      width: 180,
      colId: "fltr",
      headerName: "CPCB",
      tooltipField: 'fltr',
      filter: "agTextColumnFilter",
      // rowspan: 3
    },
    // {
    //   field: "bdctg",
    //   hide: false,
    //   width: 200,
    //   headerName: "HCF category",
    //   filter: "agTextColumnFilter",
    //   rowspan: 3
    // },

    {
      field: "scnby",
      hide: false,
      resizable: true,
      colId: "scnby",
      width: 110,
      headerName: "Scan by",
      filter: "agTextColumnFilter",
    },
    {
      headerName: 'Red',
      resizable: true,
      children: [
        {
          field: "redcnt",
          hide: false,
          colId: "redcnt",
         width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
          resizable: true,
        },
        {
          field: "redwt",
          hide: false,
          colId: "redwt",
          width: 140,
          headerName: "Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#ffcccb" },
          tooltipField: "tpred",
        },
      ]
    },
    {
      headerName: 'Yellow',
      resizable: true,
      children: [
        {
          field: "ylwcnt",
          hide: false,
         width: 85,
          colId: "ylwcnt",
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
        },
        {
          field: "ylwwt",
          hide: false,
          width: 140,
          colId: "ylwwt",
          headerName: "Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpylw",
        },
      ]
    },
    {
      headerName: 'White',
      resizable: true,
      children: [
        {
          field: "whtcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          tooltipField: "tpwht",
          colId: "whtcnt",
        },
        {
          field: "whtwt",
          hide: false,
          width: 140,
          headerName: "Weight  (in kg)",
          tooltipField: "tpwht",
          colId: "whtwt",
        },
      ]
    },
    {
      headerName: 'Blue',
      resizable: true,
      children: [
        {
          field: "blucnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
          colId: "blucnt",
        },
        {
          field: "bluwt",
          hide: false,
          width: 140,
          headerName: "Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#ADD8E6" },
          tooltipField: "tpblu",
          colId: "bluwt",
        },
      ]
    },
    {
      headerName: 'Cytotoxic',
      resizable: true,
      children: [
        {
          field: "cytcnt",
          hide: false,
         width: 85,
          headerName: "Bag",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
          colId: "cytcnt",
        },
        {
          field: "cytwt",
          hide: false,
          width: 140,
          headerName: "Weight  (in kg)",
          cellStyle: { color: "black", backgroundColor: "#FDFD97" },
          tooltipField: "tpcyt",
          colId: "cytwt",
        },
      ]
    },
    {
      field: "ttlcnt",
      hide: false,
      width: 120,
      headerName: "Total bags",
      filter: "agTextColumnFilter",
      rowspan: 3,
      colId: "ttlcnt",
    },
    {
      field: "ttlwt",
      hide: false,
      width: 210,
      headerName: "Total bags weight (in kg)",
      filter: "agTextColumnFilter",
      rowspan: 3,
      colId: "ttlwt",
    },
  ]);

  const onRowSelected = (data: string) => { };

  const GridLoaded = () => { };
  const onButtonClicked = (action: string, rw: any) => { };


  const [newdata, setNewData] = useState<any[]>([]);
  const [newdata2, setNewData2] = useState<any[]>([]);
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
  const [newdataTotal2, setNewdataTotal2] = useState<Array<{
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


  const { showToaster, hideToaster } = useToaster();

  function populateGrid(data: any) {
    setIsLoading("")
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 })
    // let dt: string = GetResponseWnds(data);
   
    if (data && data.data && Array.isArray(data.data) && data.data.length) {
      let ary: any = data.data
      if (!isNaN(Number(levelWhoData.who))) {
        ary = ary.map((res: any) => {
          return {
            ...res,
            fltr: res.cbwtfnm,
          }
        })
      }

      let totalArySum = groupData(ary)
      console.log(totalArySum)
      const tempTotal = totalArySum.reduce(
        (total: { totalWt: number; totalCnt: number }, item: any) => {
          total.totalWt += parseFloat(item.ttlwt || '0'); // Convert to float and add
          // total.totalWt += Math.round(parseFloat(item.ttlwt || '0'));
          total.totalCnt += parseInt(item.ttlcnt || '0'); // Convert to integer and add
          return total;
        },
        { totalWt: 0, totalCnt: 0 }
      );

      setTotal({
        totalWt: tempTotal.totalWt.toFixed(3),
        totalCnt: tempTotal.totalCnt
      });
      totalArySum = totalArySum.map((res: any) => ({
        ...res,
        fltr:
          levelWhoData.lvl === "STT"
            ? getStateFullFormWho(res.fltr) // Get state full form if level is 'STT'
            : String(res.fltr).toUpperCase(), // Convert to uppercase if not 'STT'
      }));


      // set data in first table
      setNewdataTotal(totalArySum as Array<{
        dt_rpt: string;
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
        ttlcnt: Number;
        ttlwt: Number;
      }>)


      // ary = trimField(ary, "cbwtfnm")
      // ary = [...ary].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
      let secondTab = groupData(ary, 1)
      secondTab = secondTab.map((res: any) => ({
        ...res,
        fltr:
          levelWhoData.lvl === "STT"
            ? getStateFullFormWho(res.fltr) // Get state full form if level is 'STT'
            : String(res.fltr).toUpperCase(), // Convert to uppercase if not 'STT'
      }));

      // set data in second table
      setNewData(secondTab);
    }
    else {
      setNewData([]);
      showToaster([data.data], 'error');
    }

    return 1;
  }


  const groupData = (data: any, grpbybed: number = 0) => {
    const grouped = data.reduce((acc: any, item: any) => {
      let key = `${item.fltr}-${item.scnby}-${item.dt_rpt}`;
      let scanby = item.scnby === 'fct' ? 'At CBWTF' : item.scnby === 'cbwtf' ? 'Operator' : item.scnby === 'hcf' ? 'By HCF' : item.scnby;


      if (grpbybed > 0) {
        key = `${item.fltr}-${item.scnby}-${item.dt_rpt}-${item.bdctg}`;
      }
      if (!acc[key]) {
        acc[key] = {
          dt_rpt: item.dt_rpt,
          fltr: item.fltr,
          scnby: scanby,
          bdctg: item.bdctg,
          cbwtfnm: item.cbwtfnm || "cbwtfnm",
          ylwwt: 0,
          redwt: 0,
          whtwt: 0,
          bluwt: 0,
          cytwt: 0,
          ylwcnt: 0,
          redcnt: 0,
          whtcnt: 0,
          blucnt: 0,
          cytcnt: 0,
          ttlcnt: 0,
          ttlwt: 0,
        };
      }
      if (grpbybed === 0) {
        if (!acc[key]) {
          acc[key] = {
            dt_rpt: item.dt_rpt,
            fltr: item.fltr,
            scnby: item.scnby,
            ylwwt: 0,
            redwt: 0,
            whtwt: 0,
            bluwt: 0,
            cytwt: 0,
            ylwcnt: 0,
            redcnt: 0,
            whtcnt: 0,
            blucnt: 0,
            cytcnt: 0,
            ttlcnt: 0,
            ttlwt: 0,
          };
        }

      } else {
        if (!acc[key]) {
          acc[key] = {
            dt_rpt: item.dt_rpt,
            fltr: item.fltr,
            scnby: item.scnby,
            bdctg: item.bdctg,
            cbwtfnm: item.cbwtfnm || "cbwtfn",
            ylwwt: 0,
            redwt: 0,
            whtwt: 0,
            bluwt: 0,
            cytwt: 0,
            ylwcnt: 0,
            redcnt: 0,
            whtcnt: 0,
            blucnt: 0,
            cytcnt: 0,
            ttlcnt: 0,
            ttlwt: 0,
          };
        }
      }

      acc[key].ylwwt = (parseFloat(acc[key].ylwwt) + parseFloat(item.ylwwt || 0)).toFixed(3);
      acc[key].redwt = (parseFloat(acc[key].redwt) + parseFloat(item.redwt || 0)).toFixed(3);
      acc[key].whtwt = (parseFloat(acc[key].whtwt) + parseFloat(item.whtwt || 0)).toFixed(3);
      acc[key].bluwt = (parseFloat(acc[key].bluwt) + parseFloat(item.bluwt || 0)).toFixed(3);
      acc[key].cytwt = (parseFloat(acc[key].cytwt) + parseFloat(item.cytwt || 0)).toFixed(3);
      acc[key].ttlwt = (parseFloat(acc[key].redwt) + parseFloat(acc[key].ylwwt) + parseFloat(acc[key].cytwt) + parseFloat(acc[key].whtwt) + parseFloat(acc[key].bluwt)).toFixed(3);

      // acc[key].ylwwt = Math.round(parseFloat(acc[key].ylwwt) + parseFloat(item.ylwwt || 0));
      // acc[key].redwt = Math.round(parseFloat(acc[key].redwt) + parseFloat(item.redwt || 0));
      // acc[key].whtwt = Math.round(parseFloat(acc[key].whtwt) + parseFloat(item.whtwt || 0));
      // acc[key].bluwt = Math.round(parseFloat(acc[key].bluwt) + parseFloat(item.bluwt || 0));
      // acc[key].cytwt = Math.round(parseFloat(acc[key].cytwt) + parseFloat(item.cytwt || 0));
      // acc[key].ttlwt = Math.round(parseFloat(acc[key].redwt) + parseFloat(acc[key].ylwwt) + parseFloat(acc[key].cytwt) + parseFloat(acc[key].whtwt) + parseFloat(acc[key].bluwt));


      acc[key].ylwcnt += parseInt(item.ylwcnt || 0);
      acc[key].redcnt += parseInt(item.redcnt || 0);
      acc[key].whtcnt += parseInt(item.whtcnt || 0);
      acc[key].blucnt += parseInt(item.blucnt || 0);
      acc[key].cytcnt += parseInt(item.cytcnt || 0);

      acc[key].ttlcnt += (parseInt(item.redcnt || 0) + parseInt(item.blucnt || 0) + parseInt(item.whtcnt || 0) + parseInt(item.cytcnt || 0) + parseInt(item.ylwcnt || 0))

      if (grpbybed > 0) {
        if (acc[key].bdctg === 1) {
          acc[key].bdctg = "Below 30 Bedded"
        }
        else if (acc[key].bdctg === 2) {
          acc[key].bdctg = "Above 30 Bedded"
        }
      }

      return acc;
    }, {});
  
    return Object.values(grouped);
  };




  function populateGrid2(data: any) {
    setIsLoading("");
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 });

    let dt: any = GetResponseLnx(data);
    if (dt && Array.isArray(dt) && dt.length) {
      if (dt) {
        let ary: any = dt;
        let totalArySum = groupData(ary)

        totalArySum = trimField(totalArySum, "cbwtfnm")
        ary = [...totalArySum].sort((a: any, b: any) => a.cbwtfnm.localeCompare(b.cbwtfnm))

        ary = ary.map((res: any) => ({
          ...res,
          fltr:
            ["STT", "RGD"].includes(levelWhoData.lvl) // Check if level is 'STT' or 'RD'
              ? getStateFullFormWho(res.fltr) // Get state full form
              : String(res.fltr || "").toUpperCase(), // Convert to uppercase (handle undefined cases)
        }));


        setNewdataTotal2(ary as Array<{
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
        }>)
        let seconTableAr = groupData(ary, 1)
        totalArySum = trimField(seconTableAr, "cbwtfnm")
        seconTableAr = [...seconTableAr].sort((a: any, b: any) => a.cbwtfnm.localeCompare(b.cbwtfnm))
        seconTableAr = seconTableAr.map((res: any) => ({
          ...res,
          fltr:
            levelWhoData.lvl === "STT"
              ? getStateFullFormWho(res.fltr) // Get state full form if level is 'STT'
              : String(res.fltr).toUpperCase(), // Convert to uppercase if not 'STT'
        }));
        setNewData2(seconTableAr)


      } else {
        setNewData2([]);
        showToaster(['dt'], 'error');
      }
    }

    if (dt === "" || data.data[0].Status === 'Failed') {
      setNewData2([]);
      showToaster(['Did not find any data for detailed tab'], 'error');
    }

    return 1;
  }


  const getGid = () => {
    let gd: any = utilities(3, "", "");
    dispatch({ type: ACTIONS.SETGID, payload: gd });
    return gd;
  };

  // const [currentLevel, setCurrentLevel] = useState('');
  // const [drilllvlState, setDrillLvlState] = useState('');


  const getCbwtfWstList = () => {
    handleChange(undefined, 0);
    setIsLoading("Loding Data...")
    let lvl = levelWhoData.who;
    if (lvl == "Select a CBWTF to get data") {
      lvl = "CENTRAL"
    }
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
    const payload: any = postLinux(lvl + '=' + who + '=' + "" + '=' + dtFrm + '=' + dtTo + '=' + dtwise + '=' + gid, 'serialnumber');
    // const payload: any = postLinux(levelWhoData.who + '=' + levelWhoData.who + '=' + gid, 'wstdata');
    return nrjAxiosRequestBio("dshbrd", payload);
  };

  const getCbwtfWstList2 = () => {
    if (levelWhoData.lvl != 'CBWTF') {
      handleChange(undefined, 0);
      setIsLoading("Loding Data...")
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
      let shrtby = levelWhoData.lvl == 'CPCB' ? "RGD" : levelWhoData.lvl == 'RGD' ? 'STT' : 'CBWTF';
      const payload: any = postLinux("ALL" + '=' + levelWhoData.lvl + '=' + levelWhoData.who + '=' + dtFrm + '=' + dtTo + '=' + dtwise + '=' + shrtby, 'listwstdata2');
      return nrjAxiosRequestBio("dshbrd", payload);
    }
  };

  const { data: data3, refetch: refetchG } = useQuery({
    queryKey: ["g1", levelWhoData],
    queryFn: getCbwtfWstList,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  });

  const { data: data2, refetch: refetchG2 } = useQuery({
    queryKey: ["g2", levelWhoData],
    queryFn: getCbwtfWstList2,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid2,
  });

  const svClick = () => {

    dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    setTotal({ totalWt: 0, totalCnt: 0 });
    setTimeout(() => {
      refetchG();
      refetchG2();
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
    }, 400)
  };

  const GetPrnt = (lvl: string) => {
    let gid: string = state.gid;
    if (!gid) {
      showToaster(["Populate the data in the grid"], 'error');
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
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[3], headerName: "Name Of CBWTF" }; // Update the headerName of the second element
      updatedColdef1[3] = newValue == 0 ? { ...updatedColdef1[3], headerName: "State/UT" } : { ...updatedColdef1[3], headerName: "Name Of CBWTF" }; // Update the headerName of the second element

      setColDef(updatedColdef);
      setColDef1(updatedColdef1);
    } else if (levelWhoData.lvl == "CBWTF") {
      updatedColdef[3] = { ...updatedColdef[3], headerName: "Name Of CBWTF" };
      updatedColdef1[3] = { ...updatedColdef1[3], headerName: "Name Of CBWTF" };

      setColDef(updatedColdef);
      setColDef1(updatedColdef1);
    } else {
      updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "CPCB" } : { ...updatedColdef[3], headerName: "Regional directorate" };
      // updatedColdef1[3] = newValue == 0 ? { ...updatedColdef1[3], headerName: "CPCB" } : { ...updatedColdef1[3], headerName: "Regional directorate",width:180 };
      updatedColdef1[3] = newValue == 0 ? { ...updatedColdef1[3], headerName: "CPCB" } : { ...updatedColdef1[3], headerName: "Regional directorate"};
     
      
      
      
    
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
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 })
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

    setNewData([]);
    setNewData2([]);
    setNewdataTotal([]);
    setNewdataTotal2([])

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
    onChangeDts("dt_rptfrm][" + str);
    onChangeDts("dt_rptto][" + str);
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



  const labelText = "Scanned wise waste bag details :";

  return (
    <>
      <LevelSelector
        showCbwtf={false}
        levelSelectorData={setLvlWhoData}
        dateFieldFrom={true}
        dateFieldToForRange={true}
        printButton={false}
        printButtonClick={printClick}
        getListButton={true}
        getListOnclick={svClick}
      ></LevelSelector>

      <div className="bg-white shadow rounded-lg px-4 pb-6 pt-3">
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
            <div>
              {total ?
              <div className="border rounded-lg mb-3">
                <div className="p-3">
                  <div className="flex font-semibold ">
                    <>
                      Total no. of bags : {total.totalCnt}

                    </>
                    <div className="ml-6">
                      Total weight of bags (in kg) : {total.totalWt}
                    </div>
                  </div>
                </div>
              </div> : <></>}
              <div className="font-semibold text-lg mx-11">{isLoading}</div>
              {showMessage && showMessage.message.length != 0 && <div className="py-2">
                <Toaster data={showMessage} className={''}></Toaster>
              </div>}
              {/* <div className="flex justify-center bg-gray-100">
                <NrjAgGrid
                  onGridLoaded={GridLoaded}
                  onRowSelected={onRowSelected}
                  colDef={coldef1}
                  apiCall={""}
                  height={Math.min(newdataTotal.length * 50 + 100, 500)} 
                  rowData={newdataTotal}
                  deleteButton={""}
                  deleteFldNm={""}
                  showDataButton={""}
                  showApi={""}
                  onButtonClicked={onButtonClicked}
                  showFldNm={"cbtwf"}
                  className="ag-theme-alpine"
                  trigger={state.triggerG}
                  showPagination={true}
                  PageSize={100}
                  appName="CPCB"
                  newRowData={state.nwRow}
                  showTooltips={true}
                  showExport={true}
                  prependContent={prependContent}
                  colDefPrint={coldef1}
                  pageTitle={"Summarized Waste Bags Data : "}
                  printExcelHeader={printExcelHeader1}
                  exceColWidth={excelColWidth}
                  KeyOrder={keyOrder1}
                  lvl={levelWhoData.lvl}
                  who={levelWhoData.who}
                  getFilteredParameter={getFilteredParameter}
                />
              </div> */}
              {/* <h3>First Table</h3> */}
              {/* <span className="mt-3 mb-3 ml-3 fw-bold text-[16px] flex justify-left text-black">
                <label>{capitalizeTerms(labelText)}</label>
              </span> */}
              <div className=" mt-3 mb-3 ml-3 flex font-semibold text-[16px]">
                    <>
                     {labelText}

                    </>
                  </div>

              <div className="flex justify-center bg-gray-100">

                <NrjAgGrid
                  onGridLoaded={GridLoaded}
                  onRowSelected={onRowSelected}
                  colDef={coldef1}
                  onButtonClicked={onButtonClicked}
                  apiCall={""}
                  rowData={newdataTotal}
                  deleteButton={""}
                  deleteFldNm={""}
                  showDataButton={""}
                  showApi={""}
                  showFldNm={"cbtwf"}
                  className="ag-theme-alpine"
                  trigger={state.triggerG}
                  showPagination={true}
                  appName="CPCB"
                  newRowData={state.nwRow}
                  showTooltips={true}
                  showExport={true}
                  prependContent={prependContent}
                  colDefPrint={coldef1}
                  pageTitle={"Summarized Waste Bags Data : "}
                  printExcelHeader={printExcelHeader1}
                  exceColWidth={excelColWidth}
                  KeyOrder={keyOrder1}
                  lvl={levelWhoData.lvl}
                  who={levelWhoData.who}
                  getFilteredParameter={getFilteredParameter}
                ></NrjAgGrid>
              </div>

              <div className="my-3">
                {/* <h3>Second Table</h3> */}
                {/* <span className="mt-3 mb-3 ml-3 fw-bold text-[16px] flex justify-left text-black">
                <label>HCF category wised waste bag details</label>
              </span> */}
                 {/* <div className="flex font-semibold text-[16px] ">
                    <>
                    HCF category wised waste bag details

                  </>
                  </div> */}
                 <div className="p-3 mt-3">
                  <div className="flex font-semibold text-[16px] ">
                    <>
                    HCF category wised waste bag details

                    </>
                   
                  </div>
                </div>
                <NrjAgGrid
                  onGridLoaded={GridLoaded}
                  onRowSelected={onRowSelected}
                  colDef={coldef}
                  apiCall={""}
                  rowData={newdata}
                  deleteButton={""}
                  deleteFldNm={""}
                  showDataButton={""}
                  showApi={""
                    //"keyname][hcfbdlst>fltr=key][fltr>fltr=path][hcfWasteData=cellclicked][CBWTF$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Red(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Red(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Yellow(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Yellow(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][White(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][White(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Blue(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Blue(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Cytotoxic(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Cytotoxic(Weight Kg)"
                  }
                  onButtonClicked={onButtonClicked}
                  showFldNm={"cbwtf"}
                  className="ag-theme-alpine-blue ag-theme-alpine"
                  trigger={state.triggerG}
                  showPagination={true}
                  // parentPaginationChanged={changePage}
                  appName="CPCB"
                  newRowData={state.nwRow}
                  showTooltips={true}
                  showExport={true}
                  pageTitle={"Summarized Waste Bags Data : "}
                  printExcelHeader={printExcelHeader}
                  exceColWidth={excelColWidth}
                  KeyOrder={keyOrder}
                  lvl={levelWhoData.lvl}
                  who={levelWhoData.who}
                  getFilteredParameter={getFilteredParameter}
                ></NrjAgGrid>
              </div>
            </div>

          </CustomTabPanel >
          {lvl !== "CBWTF" ?
            <CustomTabPanel value={valueType} index={1}>
              <div>
                <div className="absolute font-semibold text-lg mx-11">{isLoading}</div>
                {showMessage1 && showMessage1.message.length != 0 && <div className="py-2">
                  <Toaster data={showMessage1} className={''}></Toaster>
                </div>}
                {/* <span className="mt-3 fw-bold text-[16px] flex justify-center text-blue-700">
                  List of waste bags based on Scan by values
                </span> */}
               <div className="p-3">
                  <div className="flex font-semibold text-[16px] ">
                    <>
                    {labelText}

                    </>
                   
                  </div>
                </div>


                <div className="flex justify-center bg-gray-100">
                  {/* <h3>first</h3> */}
                  <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    colDef={levelWhoData.lvl == 'STT' ? coldefCbwtf : coldef1}
                    apiCall={""}
                    rowData={newdataTotal2}
                    deleteButton={""}
                    deleteFldNm={""}
                    showDataButton={""}
                    showApi={''}
                    onButtonClicked={onButtonClicked}
                    showFldNm={"cbtwf"}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    trigger={state.triggerG}
                    showPagination={true}
                    // parentPaginationChanged={changePage}
                    // PageSize={100}
                    appName="CPCB"
                    newRowData={state.nwRow}
                    showTooltips={true}
                    showExport={true}
                    pageTitle={"Summarized waste bags data : "}
                    printExcelHeader={levelWhoData.lvl == 'STT' ? printExcelHeaderCbwtf : printExcelHeader1}
                    exceColWidth={excelColWidth}
                    KeyOrder={levelWhoData.lvl == 'STT' ? keyOrderCbwtf : keyOrder1}
                    lvl={levelWhoData.lvl}
                    who={levelWhoData.who}
                    getFilteredParameter={getFilteredParameter}
                  ></NrjAgGrid>

                </div>
                {/* <span className="mt-3 fw-bold text-[16px] flex justify-center text-blue-700">
                  List of waste bags based on HCF bed Category
                </span>
                <div className="flex justify-center bg-gray-100"> */}
                 <div className="p-3 mt-3">
                  <div className="flex font-semibold text-[16px] ">
                    <>
                    HCF category wised waste bag details

                    </>
                   
                  </div>
                </div>
                <div className="my-3">
                  {/* <h3>second</h3> */}
                  <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    colDef={levelWhoData.lvl == 'STT' ? coldefCbwtf1 : coldef}
                    apiCall={""}
                    rowData={newdata2}
                    deleteButton={""}
                    deleteFldNm={""}
                    showDataButton={""}
                    showApi={""
                      //"keyname][hcfbdlst>fltr=key][fltr>fltr=path][hcfWasteData=cellclicked][CBWTF$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Red(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Red(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Yellow(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Yellow(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][White(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][White(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Blue(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Blue(Weight Kg)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Cytotoxic(Bag)$^keyname][cbwtfid>clr>scnby>fltr=key][fltr>field>scnby>fltr=path][clrCbwtfWst=cellclicked][Cytotoxic(Weight Kg)"
                    }
                    onButtonClicked={onButtonClicked}
                    showFldNm={"cbtwf"}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    trigger={state.triggerG}
                    showPagination={true}
                    // parentPaginationChanged={changePage}
                    // PageSize={100}
                    appName="CPCB"
                    newRowData={state.nwRow}
                    getFilteredParameter={getFilteredParameter1}
                    showTooltips={true}
                    showExport={true}
                    pageTitle={"Summarized waste bags data : "}
                    printExcelHeader={levelWhoData.lvl == 'STT' ? printExcelHeaderCbwtf : printExcelHeader}
                    exceColWidth={excelColWidth}
                    KeyOrder={levelWhoData.lvl == 'STT' ? keyOrderCbwtf : keyOrder}
                    lvl={levelWhoData.lvl}
                    who={levelWhoData.who}
                  ></NrjAgGrid>
                </div>
              </div>
            </CustomTabPanel> : null}
        </Box>
      </div>


    </>);
};
export default React.memo(ListCbwtfWstData);


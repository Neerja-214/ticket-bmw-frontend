import React, { useEffect, useReducer, useState } from "react";
import { useEffectOnce } from "react-use";
import { useQuery } from "@tanstack/react-query";
import { getLvl, getWho } from "../../utilities/cpcb";
import { nrjAxios, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import utilities, { GetResponseLnx, capitalize, createGetApi, dataStr_ToArray, getCntWtInNumbers, getStateAbbreviation, getStateFullForm, postLinux } from "../../utilities/utilities";

import { Toaster } from "../../components/reusable/Toaster";
import moment from "moment";
import { UseMomentDateNmb } from "../../Hooks/useMomentDtArry";
import { useToaster } from "../../components/reusable/ToasterContext";
import OnOffToggle from "../MIS/onOffToggle";
import GraphDataTable from "../MIS/grapghDataTable";
import { Modal } from "rsuite";
import { Button } from "@mui/material";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number,
) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];



ChartJS.register(ArcElement, Tooltip, Legend);


const ACTIONS = {
  SETSUMMARY: "grdtrigger",
  SETNAME: "nme",
  SETBUTTON: "btnlbl",
  SETGID: "gd",
  FORM_DATA: "frmdata",
  DISABLE: 'disable'
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  textDts: "",
  gid: "",
  gnrtd: 0,
  disableA: '1',
  calSum: 0,
  ylwgnrtdcnt: 0,
  ylwgnrtdwt: 0,
  rdgnrtdcnt: 0,
  rdgnrtdwt: 0,
  blugnrtdcnt: 0,
  blugnrtdwt: 0,
  whtgnrtdcnt: 0,
  whtgnrtdwt: 0,
  cytgnrtdcnt: 0,
  cytgnrtdwt: 0,
  cltd: 0,
  ylwcltdcnt: 0,
  ylwcltdwt: 0,
  rdcltdcnt: 0,
  rdcltdwt: 0,
  blucltdcnt: 0,
  blucltdwt: 0,
  whtcltdcnt: 0,
  whtcltdwt: 0,
  cytcltdcnt: 0,
  cytcltdwt: 0,
  prcd: 0,
  ylwprcdcnt: 0,
  ylwprcdwt: 0,
  rdprcdcnt: 0,
  rdprcdwt: 0,
  bluprcdcnt: 0,
  bluprcdwt: 0,
  whtprcdcnt: 0,
  whtprcdwt: 0,
  cytprcdcnt: 0,
  cytprcdwt: 0,
  ylwprcdchng: 0,
  rdprcdchng: 0,
  bluprcdchng: 0,
  whtprcdchng: 0,
  cytprcdchng: 0,
  ylwgnrtdchng: 0,
  rdgnrtdchng: 0,
  blugnrtdchng: 0,
  whtgnrtdchng: 0,
  cytgnrtdchng: 0,
  ylwcltdchng: 0,
  rdcltdchng: 0,
  blucltdchng: 0,
  whtcltdchng: 0,
  cytcltdchng: 0,
  hcfvst: 0,
  errapi: 0,
  gnrtcnt: 0,
  cltdcnt: 0,
  prsdcnt: 0,

  // **********************Below***********


  gnrtdBl: 0,
  ylwgnrtdcntBl: 0,
  ylwgnrtdwtBl: 0,
  rdgnrtdcntBl: 0,
  rdgnrtdwtBl: 0,
  blugnrtdcntBl: 0,
  blugnrtdwtBl: 0,
  whtgnrtdcntBl: 0,
  whtgnrtdwtBl: 0,
  cytgnrtdcntBl: 0,
  cytgnrtdwtBl: 0,
  cltdBl: 0,
  ylwcltdcntBl: 0,
  ylwcltdwtBl: 0,
  rdcltdcntBl: 0,
  rdcltdwtBl: 0,
  blucltdcntBl: 0,
  blucltdwtBl: 0,
  whtcltdcntBl: 0,
  whtcltdwtBl: 0,
  cytcltdcntBl: 0,
  cytcltdwtBl: 0,
  prcdBl: 0,
  ylwprcdcntBl: 0,
  ylwprcdwtBl: 0,
  rdprcdcntBl: 0,
  rdprcdwtBl: 0,
  bluprcdcntBl: 0,
  bluprcdwtBl: 0,
  whtprcdcntBl: 0,
  whtprcdwtBl: 0,
  cytprcdcntBl: 0,
  cytprcdwtBl: 0,
  ylwprcdchngBl: 0,
  rdprcdchngBl: 0,
  bluprcdchngBl: 0,
  whtprcdchngBl: 0,
  cytprcdchngBl: 0,
  ylwgnrtdchngBl: 0,
  rdgnrtdchngBl: 0,
  blugnrtdchngBl: 0,
  whtgnrtdchngBl: 0,
  cytgnrtdchngBl: 0,
  ylwcltdchngBl: 0,
  rdcltdchngBl: 0,
  blucltdchngBl: 0,
  whtcltdchngBl: 0,
  cytcltdchngBl: 0,
  gnrtcntBl: 0,
  cltdcntBl: 0,
  prcdcnt: 0,
  prcdcntBl: 0,
  nme: "",
  btn: "CBWTF",
};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  trigger: number;
  textDts: string;
  gid: string;
  gnrtd: number;
  disableA: string;
  ylwgnrtdcnt: number;
  ylwgnrtdwt: number;
  rdgnrtdcnt: number;
  rdgnrtdwt: number;
  blugnrtdcnt: number;
  blugnrtdwt: number;
  whtgnrtdcnt: number;
  whtgnrtdwt: number;
  cytgnrtdcnt: number;
  cytgnrtdwt: number;
  cltd: number;
  calSum: number;
  ylwcltdcnt: number;
  ylwcltdwt: number;
  rdcltdcnt: number;
  rdcltdwt: number;
  blucltdcnt: number;
  blucltdwt: number;
  whtcltdcnt: number;
  whtcltdwt: number;
  cytcltdcnt: number;
  cytcltdwt: number;
  prcd: number;
  ylwprcdcnt: number;
  ylwprcdwt: number;
  rdprcdcnt: number;
  rdprcdwt: number;
  bluprcdcnt: number;
  bluprcdwt: number;
  whtprcdcnt: number;
  whtprcdwt: number;
  cytprcdcnt: number;
  cytprcddwt: number;
  ylwprcdchng: number;
  rdprcdchng: number;
  bluprcdchng: number;
  whtprcdchng: number;
  cytprcdchng: number;
  hcfvst: number;
  errapi: number;
  gnrtcnt: number;
  cltdcnt: number;
  prsdcnt: number;

  // *****************************Below*****************


  gnrtdBl: number;
  ylwgnrtdcntBl: number;
  ylwgnrtdwtBl: number;
  rdgnrtdcntBl: number;
  rdgnrtdwtBl: number;
  blugnrtdcntBl: number;
  blugnrtdwtBl: number;
  whtgnrtdcntBl: number;
  whtgnrtdwtBl: number;
  cytgnrtdcntBl: number;
  cytgnrtdwtBl: number;
  ylwgnrtdchngBl: number;
  rdgnrtdchngBl: number;
  blugnrtdchngBl: number;
  whtgnrtdchngBl: number;
  cytgnrtdchngBl: number;
  cltdBl: number;
  ylwcltdcntBl: number;
  ylwcltdwtBl: number;
  rdcltdcntBl: number;
  rdcltdwtBl: number;
  blucltdcntBl: number;
  blucltdwtBl: number;
  whtcltdcntBl: number;
  whtcltdwtBl: number;
  cytcltdcntBl: number;
  cytcltdwtBl: number;
  ylwcltdchngBl: number;
  rdcltdchngBl: number;
  blucltdchngBl: number;
  whtcltdchngBl: number;
  cytcltdchngBl: number;
  prcdBl: number;
  ylwprcdcntBl: number;
  ylwprcdwtBl: number;
  rdprcdcntBl: number;
  rdprcdwtBl: number;
  bluprcdcntBl: number;
  bluprcdwtBl: number;
  whtprcdcntBl: number;
  whtprcdwtBl: number;
  cytprcdcntBl: number;
  cytprcddwtBl: number;
  ylwprcdchngBl: number;
  rdprcdchngBl: number;
  bluprcdchngBl: number;
  whtprcdchngBl: number;
  cytprcdchngBl: number;
  hcfvstBl: number;
  errapiBl: number;
  gnrtcntBl: number;
  cltdcntBl: number;
  prcdcnt: number;
  prcdcntBl: number;
  nme: string;
  btn: string;
};

type act = {
  type: string;
  payload: any;
};

let indexObject1 = {
  generatedBelow: -1,
  generatedAbove: -1,
  collectedBelow: -1,
  collectedAbove: -1,
  processedBelow: -1,
  processedAbove: -1
}
const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.SETBUTTON:
      newstate.btn = "BAG WISE";
      return newstate;
    case ACTIONS.SETGID:
      newstate.gid = action.payload;
      return newstate;
    case ACTIONS.SETNAME:
      newstate.nme = action.payload;
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
    case ACTIONS.SETSUMMARY:
      let indexObject: any = { ...indexObject1 };
      for (let i = 0; i < action.payload.length; i++) {
        if (action.payload[i].scnby == 'HCF') {
          if (action.payload[i].bdctg == '2') {
            indexObject.generatedAbove = i
          }
          else {
            indexObject.generatedBelow = i
          }
        }
        else if (action.payload[i].scnby == 'Supervisor') {
          if (action.payload[i].bdctg == '2') {
            indexObject.collectedAbove = i
          }
          else {
            indexObject.collectedBelow = i
          }
        }
        else if (action.payload[i].scnby == 'Plant') {
          if (action.payload[i].bdctg == '2') {
            indexObject.processedAbove = i
          }
          else {
            indexObject.processedBelow = i
          }
        }
      }

      if (indexObject.generatedAbove > -1) {
        let data: any = getCntWtInNumbers(action.payload[indexObject.generatedAbove])
        newstate.ylwgnrtdcnt = data.ylwcnt
        newstate.ylwgnrtdwt = data.ylwwt
        newstate.rdgnrtdcnt = data.redcnt;
        newstate.rdgnrtdwt = data.redwt;
        newstate.blugnrtdcnt = data.blucnt;
        newstate.blugnrtdwt = data.bluwt;
        newstate.whtgnrtdcnt = data.whtcnt;
        newstate.whtgnrtdwt = data.whtwt;
        newstate.cytgnrtdcnt = data.cytcnt;
        newstate.cytgnrtdwt = data.cytwt;
        newstate.gnrtd = data.ylwwt + data.redwt + data.bluwt + data.whtwt + data.cytwt
        newstate.gnrtcnt = data.ylwcnt + data.redcnt + data.blucnt + data.whtcnt + data.cytcnt

      }


      if (indexObject.generatedBelow > -1) {
        let data: any = getCntWtInNumbers(action.payload[indexObject.generatedBelow])
        newstate.ylwgnrtdcntBl = data.ylwcnt
        newstate.ylwgnrtdwtBl = data.ylwwt
        newstate.rdgnrtdcntBl = data.redcnt;
        newstate.rdgnrtdwtBl = data.redwt;
        newstate.blugnrtdcntBl = data.blucnt;
        newstate.blugnrtdwtBl = data.bluwt;
        newstate.whtgnrtdcntBl = data.whtcnt;
        newstate.whtgnrtdwtBl = data.whtwt;
        newstate.cytgnrtdcntBl = data.cytcnt;
        newstate.cytgnrtdwtBl = data.cytwt;
        newstate.gnrtdBl = data.ylwwt + data.redwt + data.bluwt + data.whtwt + data.cytwt
        newstate.gnrtcntBl = data.ylwcnt + data.redcnt + data.blucnt + data.whtcnt + data.cytcnt


      }


      if (indexObject.collectedAbove > -1) {
        let data: any = getCntWtInNumbers(action.payload[indexObject.collectedAbove])

        newstate.ylwcltdcnt = data.ylwcnt
        newstate.ylwcltdwt = data.ylwwt
        newstate.rdcltdcnt = data.redcnt;
        newstate.rdcltdwt = data.redwt;
        newstate.blucltdcnt = data.blucnt;
        newstate.blucltdwt = data.bluwt;
        newstate.whtcltdcnt = data.whtcnt;
        newstate.whtcltdwt = data.whtwt;
        newstate.cytcltdcnt = data.cytcnt;
        newstate.cytcltdwt = data.cytwt;
        newstate.cltd = data.ylwwt + data.redwt + data.bluwt + data.whtwt + data.cytwt
        newstate.cltdcnt = data.ylwcnt + data.redcnt + data.blucnt + data.whtcnt + data.cytcnt
      }

      if (indexObject.collectedBelow > -1) {
        let data: any = getCntWtInNumbers(action.payload[indexObject.collectedBelow])

        newstate.ylwcltdcntBl = data.ylwcnt
        newstate.ylwcltdwtBl = data.ylwwt
        newstate.rdcltdcntBl = data.redcnt;
        newstate.rdcltdwtBl = data.redwt;
        newstate.blucltdcntBl = data.blucnt;
        newstate.blucltdwtBl = data.bluwt;
        newstate.whtcltdcntBl = data.whtcnt;
        newstate.whtcltdwtBl = data.whtwt;
        newstate.cytcltdcntBl = data.cytcnt;
        newstate.cytcltdwtBl = data.cytwt;
        newstate.cltdBl = data.ylwwt + data.redwt + data.bluwt + data.whtwt + data.cytwt
        newstate.cltdcntBl = data.ylwcnt + data.redcnt + data.blucnt + data.whtcnt + data.cytcnt
      }
      if (indexObject.processedAbove > -1) {
        let data: any = getCntWtInNumbers(action.payload[indexObject.processedAbove])
        newstate.ylwprcdcnt = data.ylwcnt
        newstate.ylwprcdwt = data.ylwwt
        newstate.rdprcdcnt = data.redcnt;
        newstate.rdprcdwt = data.redwt;
        newstate.bluprcdcnt = data.blucnt;
        newstate.bluprcdwt = data.bluwt;
        newstate.whtprcdcnt = data.whtcnt;
        newstate.whtprcdwt = data.whtwt;
        newstate.cytprcdcnt = data.cytcnt;
        newstate.cytprcdwt = data.cytwt;
        newstate.ylwprcdchng = data.ylwchng
        newstate.rdprcdchng = data.redchng
        newstate.bluprcdchng = data.bluchng
        newstate.whtprcdchng = data.whtchng
        newstate.cytprcdchng = data.cytchng
        newstate.prcd = data.ylwwt + data.redwt + data.bluwt + data.whtwt + data.cytwt
        newstate.prcdcnt = data.ylwcnt + data.redcnt + data.blucnt + data.whtcnt + data.cytcnt

      }

      if (indexObject.processedBelow > -1) {
        let data: any = getCntWtInNumbers(action.payload[indexObject.processedBelow])

        newstate.ylwprcdcntBl = data.ylwcnt
        newstate.ylwprcdwtBl = data.ylwwt
        newstate.rdprcdcntBl = data.redcnt;
        newstate.rdprcdwtBl = data.redwt;
        newstate.bluprcdcntBl = data.blucnt;
        newstate.bluprcdwtBl = data.bluwt;
        newstate.whtprcdcntBl = data.whtcnt;
        newstate.whtprcdwtBl = data.whtwt;
        newstate.cytprcdcntBl = data.cytcnt;
        newstate.cytprcdwtBl = data.cytwt;
        newstate.prcdBl = data.ylwwt + data.redwt + data.bluwt + data.whtwt + data.cytwt
        newstate.prcdcntBl = data.ylwcnt + data.redcnt + data.blucnt + data.whtcnt + data.cytcnt
      }
      newstate.calSum = state.calSum + 1;

      newstate.hcfvst = Number(action.payload["hcfvisited"]).toFixed(0);
      let nm: string = sessionStorage.getItem("cbwtfnm") || "CPCB";
      if (nm == "CPCB") {
        newstate.hcfvst = 57;
      } else {
        newstate.hcfvst = 12;
      }
      newstate.errapi = Number(action.payload["wrngapi"]).toFixed(0);
      return newstate;

    case ACTIONS.DISABLE:
      if (action.payload == 1) {
        if (newstate.disableA == 1) {
          newstate.disableA = 0
        } else {
          newstate.disableA = 1
        }
        return newstate
      } else if (action.payload == 2) {
        if (newstate.disableB == 1) {
          newstate.disableB = 0
        } else {
          newstate.disableB = 1
        }
        return newstate
      }
  }
};

const DashBoardNew = (props: any) => {

  const [isLoading, setIsLoading] = useState("");
  const [state, dispatch] = useReducer(reducer, initialState);
  const lvl: string = getLvl();
  let [time, reTime] = useState("");
  let [date, reDate] = useState("");

  const coldefRgd = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "fltr", hide: true, width: 150, headerName: "CBWTF ID" },
    {
      field: "fltr",
      hide: false,
      width: 180,
     headerName: "Regional directorate",
      tooltipField: 'fltr',
      filter: "agTextColumnFilter",
      rowspan: 3
    },
    {
      headerName: 'Red',
      children: [
        {
          field: "redcnt",
          hide: false,
          width: 66,
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
          width: 66,
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
          width: 66,
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
          width: 66,
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
          width: 66,
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
    }
  ];
  let coldefState = [...coldefRgd]
  coldefState[2] = { ...coldefState[2], headerName: 'State' }
  const coldefCbwtf = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "fltr", hide: true, width: 150, headerName: "CBWTF ID" },
    {
      field: "cbwtfnm",
      hide: false,
      width: 290,
       headerName: "Name of CBWTF",
      tooltipField: 'fltr',
      filter: "agTextColumnFilter",
      rowspan: 3
    },
    {
      field: "state",
      hide: false,
      width: 180,
      headerName: "State/UT",
      tooltipField: 'fltr',
      rowspan: 3
    },
    {
      headerName: 'Red',
      children: [
        {
          field: "redcnt",
          hide: false,
          width: 66,
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
          width: 66,
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
          width: 66,
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
          width: 66,
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
          width: 66,
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
    }
  ];

  type ColorStyle = {
    backgroundColor: string;
    color: string;
  };
  const getColorStyle = (color: string): ColorStyle => {
    const colorStyles: Record<string, ColorStyle> = {
      red: { backgroundColor: 'red', color: 'white' },
      yellow: { backgroundColor: 'yellow', color: 'black' },
      green: { backgroundColor: '#90EE90', color: 'white' },
      blue: { backgroundColor: 'blue', color: 'white' }
    };

    // Normalize the color input to lowercase to handle case insensitivity
    return colorStyles[color.toLowerCase()] || { backgroundColor: 'gray', color: 'white' };
  };
  const GetGid = () => {
    let g: any = utilities(3, "", "");
    dispatch({ type: ACTIONS.SETGID, payload: g });
    return g;
  };

  const getData = () => {

    let gid = GetGid()
    let who: string = getWho();
    who = lvl == 'STT' ? getStateAbbreviation(capitalize(who)) : who;
    let str: string = UseMomentDateNmb(moment(Date.now()).format("DD-MMM-yyyy"));
    let payload: any = postLinux(who + '=' + who + '=' + str + '=' + str + '=' + gid, 'dashboard');
    return nrjAxiosRequestBio("dshbrd_total_period", payload);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      let dte = new Date();
      reTime(dte.toLocaleTimeString());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const ShowData = (data: any) => {

    setIsLoading("");
    if (Array.isArray(data.data) && data.data.length) {
      let ary = data.data;
      let dte = new Date();
      reTime(dte.toLocaleTimeString());
      reDate(`${String(dte.getDate()).padStart(2, '0')}. ${String(dte.getMonth() + 1).padStart(2, '0')}. ${dte.getFullYear()}`);
      dispatch({ type: ACTIONS.SETSUMMARY, payload: ary });
    }
    else {
      showToaster(['No data received'], 'error')
      let dte = new Date();
      reTime(dte.toLocaleTimeString());
    }
  };
  const { showToaster, hideToaster } = useToaster();

  const { data, refetch } = useQuery({
    queryKey: ["dshbrdNew"],
    queryFn: getData,
    enabled: true,
    staleTime: 0,
    refetchInterval: 180000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  const [genWtSum, setGenWtSum] = useState<any>(0);
  const [genCntSum, setGenCntSum] = useState<any>(0);
  const [proCntSum, setProCntSum] = useState<any>(0);
  const [proWtSum, setProWtSum] = useState<any>(0);
  const [colWtSum, setColWtSum] = useState<any>(0);
  const [colCntSum, setColCntSum] = useState<any>(0);
  useEffect(() => {
    setGenWtSum(Math.round(state.gnrtd + state.gnrtdBl));
    setGenCntSum(Math.round(state.gnrtcnt + state.gnrtcntBl))
    setColWtSum(Math.round(state.cltd + state.cltdBl))
    setColCntSum(Math.round(state.cltdcnt + state.cltdcntBl))
    setProWtSum(Math.round(state.prcd + state.prcdBl))
    setProCntSum(Math.round(state.prcdcnt + state.prcdcntBl))
    // setGenWtSum(Number(state.gnrtd + state.gnrtdBl).toFixed(3))
    // setGenCntSum(Number(state.gnrtcnt + state.gnrtcntBl).toFixed(0))
    // setColWtSum(Number(state.cltd + state.cltdBl).toFixed(3))
    // setColCntSum(Number(state.cltdcnt + state.cltdcntBl).toFixed(0))
    // setProWtSum(Number(state.prcd + state.prcdBl).toFixed(3))
    // setProCntSum(Number(state.prcdcnt + state.prcdcntBl).toFixed(0))
  }, [state])
  

  const doughnutOptionsb: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "black",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const dataset = tooltipItem.dataset;
            const total = dataset.data.reduce((acc, val) => acc + (typeof val === "number" ? val : 0), 0);
            const value = tooltipItem.raw as number;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${value} (${percentage}%)`;
          },
        },
      },

    },
    animation: {
      animateRotate: true, // Rotate animation
      animateScale: true, // Scale animation
    },
  };

  const doughnutDatab = {
    labels: ["Yellow", "Red", "Cytotoxic", "Blue", "White"],
    datasets: [
      {
        data: [
          Number(state.ylwgnrtdcnt) + Number(state.ylwgnrtdcntBl),
          Number(state.rdgnrtdcnt) + Number(state.rdgnrtdcntBl),
          Number(state.cytgnrtdcnt) + Number(state.cytgnrtdcntBl),
          Number(state.blugnrtdcnt) + Number(state.blugnrtdcntBl),
          Number(state.whtgnrtdcnt) + Number(state.whtgnrtdcntBl),
        ],
        backgroundColor: ["rgb(255, 205, 86)", "rgb(255, 99, 132)", "#CE93D8", "rgb(54, 162, 235)", "#F1F8E9"],
        hoverOffset: 8,
      },
    ],
  };


  const doughnutOptionCb: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "black",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const dataset = tooltipItem.dataset;
            const total = dataset.data.reduce((acc, val) => acc + (typeof val === "number" ? val : 0), 0);
            const value = tooltipItem.raw as number;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${value}  (${percentage}%)`;
          },
        },
      },

    },
    animation: {
      animateRotate: true, // Rotate animation
      animateScale: true, // Scale animation
    },
  };

  useEffectOnce(() => {
    let nm: string = sessionStorage.getItem("cbwtfnm") || "CPCB";
    if (nm == "CPCB") {
      dispatch({ type: ACTIONS.SETNAME, payload: nm });
    } else {
      dispatch({ type: ACTIONS.SETNAME, payload: nm });
      dispatch({ type: ACTIONS.SETBUTTON, payload: nm });
    }
  });

  const doughnutData = {
    labels: ["Yellow", "Red", "Cytotoxic", "Blue", "White"],
    datasets: [
      {
        data: [
          // Number(state.ylwgnrtdwt) + Number(state.ylwgnrtdwtBl),
          // Number(state.rdgnrtdwt) + Number(state.rdgnrtdwtBl),
          // Number(state.cytgnrtdwt) + Number(state.cytgnrtdwtBl),
          // Number(state.blugnrtdwt) + Number(state.blugnrtdwtBl),
          // Number(state.whtgnrtdwt) + Number(state.whtgnrtdwtBl),
          // parseFloat((Number(state.ylwgnrtdwt) + Number(state.ylwgnrtdwtBl)).toFixed(3)),
          Math.round(Number(state.ylwgnrtdwt) + Number(state.ylwgnrtdwtBl)),
          Math.round((Number(state.rdgnrtdwt) + Number(state.rdgnrtdwtBl))),
          Math.round((Number(state.cytgnrtdwt) + Number(state.cytgnrtdwtBl))),
          Math.round((Number(state.blugnrtdwt) + Number(state.blugnrtdwtBl))),
          Math.round((Number(state.whtgnrtdwt) + Number(state.whtgnrtdwtBl))),
        ],
        backgroundColor: ["rgb(255, 205, 86)", "rgb(255, 99, 132)", "#CE93D8", "rgb(54, 162, 235)", "#F1F8E9"],
        hoverOffset: 4
        // borderColor: ["rgb(255, 205, 86)", "#e74c3c", "#8e44ad", "#3498db", "#bdc3c7"],
        // borderWidth: 1,
      },
    ],
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "black",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        enabled: true, // Show tooltip on hover
        callbacks: {
          label: (tooltipItem) => {
            const total = tooltipItem.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
            const value = tooltipItem.raw;
            const percentage = total ? ((Number(value) / total) * 100).toFixed(1) + "%" : "0%";
            return `Weight: ${value}  (${percentage})`;
          },
        },
      },
    },
  };



 

  const doughnutDataC = {
    labels: ["Yellow", "Red", "Cytotoxic", "Blue", "White"],
    datasets: [
      {
        // data: [
        //   Number(state.ylwcltdwt) + Number(state.ylwcltdwtBl),
        //   Number(state.rdcltdwt) + Number(state.rdcltdwtBl),
        //   Number(state.cytcltdwt) + Number(state.cytcltdwtBl),
        //   Number(state.blucltdwt) + Number(state.blucltdwtBl),
        //   Number(state.whtcltdwt) + Number(state.whtcltdwtBl),
        // ],
        data: [
          Math.round((Number(state.ylwcltdwt) + Number(state.ylwcltdwtBl))),
          Math.round((Number(state.rdcltdwt) + Number(state.rdcltdwtBl))),
          Math.round((Number(state.cytcltdwt) + Number(state.cytcltdwtBl))),
          Math.round((Number(state.blucltdwt) + Number(state.blucltdwtBl))),
          Math.round((Number(state.whtcltdwt) + Number(state.whtcltdwtBl))),
        ],

        backgroundColor: ["rgb(255, 205, 86)", "rgb(255, 99, 132)", "#CE93D8", "rgb(54, 162, 235)", "#F1F8E9"],
        hoverOffset: 8,
      },
    ],
  };

  const doughnutDataCb = {
    labels: ["Yellow", "Red", "Cytotoxic", "Blue", "White"],
    datasets: [
      {
        data: [
          Number(state.ylwcltdcnt) + Number(state.ylwcltdcntBl),
          Number(state.rdcltdcnt) + Number(state.rdcltdcntBl),
          Number(state.cytcltdcnt) + Number(state.cytcltdcntBl),
          Number(state.blucltdcnt) + Number(state.blucltdcntBl),
          Number(state.whtcltdcnt) + Number(state.whtcltdcntBl),
          // parseFloat((Number(state.ylwcltdcnt) + Number(state.ylwcltdcntBl)).toFixed(3)),
          // parseFloat((Number(state.rdcltdcnt) + Number(state.rdcltdcntBl)).toFixed(3)),
          // parseFloat((Number(state.cytcltdcnt) + Number(state.cytcltdcntBl)).toFixed(3)),
          // parseFloat((Number(state.blucltdcnt) + Number(state.blucltdcntBl)).toFixed(3)),
          // parseFloat((Number(state.whtcltdcnt) + Number(state.whtcltdcntBl)).toFixed(3)),
        ],
        backgroundColor: ["rgb(255, 205, 86)", "rgb(255, 99, 132)", "#CE93D8", "rgb(54, 162, 235)", "#F1F8E9"],
        hoverOffset: 8,
      },
    ],
  };
  
  const doughnutDataP = {
    labels: ["Yellow", "Red", "Cytotoxic", "Blue", "White"],
    datasets: [
      {
        data: [
          // Number(state.ylwprcdwt) + Number(state.ylwprcdwtBl),
          // Number(state.rdprcdwt) + Number(state.rdprcdwtBl),
          // Number(state.cytprcdwt) + Number(state.cytprcdwtBl),
          // Number(state.bluprcdwt) + Number(state.bluprcdwt),
          // Number(state.whtprcdwt) + Number(state.whtprcdwtBl),
          Math.round((Number(state.ylwprcdwt) + Number(state.ylwprcdwtBl))),
          Math.round((Number(state.rdprcdwt) + Number(state.rdprcdwtBl))),
          Math.round((Number(state.cytprcdwt) + Number(state.cytprcdwtBl))),
          Math.round((Number(state.bluprcdwt) + Number(state.bluprcdwtBl))),
          Math.round((Number(state.whtprcdwt) + Number(state.whtprcdwtBl))),
        ],
        backgroundColor: ["rgb(255, 205, 86)", "rgb(255, 99, 132)", "#CE93D8", "rgb(54, 162, 235)", "#F1F8E9"],
        hoverOffset: 8,
      },
    ],
  };

  const doughnutDataPb = {
    labels: ["Yellow", "Red", "Cytotoxic", "Blue", "White"],
    datasets: [
      {
        data: [
          Number(state.ylwprcdcnt) + Number(state.ylwprcdcntBl),
          Number(state.rdprcdcnt) + Number(state.rdprcdcntBl),
          Number(state.cytprcdcnt) + Number(state.cytprcdcntBl),
          Number(state.bluprcdcnt) + Number(state.bluprcdcntBl),
          Number(state.whtprcdcnt) + Number(state.whtprcdcntBl),
        ],
        backgroundColor: ["rgb(255, 205, 86)", "rgb(255, 99, 132)", "#CE93D8", "rgb(54, 162, 235)", "#F1F8E9"],
        hoverOffset: 8,
      },
    ],
  };

  

  const [toggleState, setToggleState] = useState(props.toggleState || false);

  useEffect(() => {
    setToggleState(props.toggleState);
  }, [props.toggleState])

  const handleToggleChange = (newState: any) => {
    setToggleState(newState);
  };

  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const [allDataCbwtf, setAllDataCbwtf] = useState<any[]>([])
  const [dataCbwtf, setDataCbwtf] = useState<any[]>([]);
  const [allDataState, setAllDataState] = useState<any[]>([]);
  const [dataState, setDataState] = useState<any[]>([]);

  const [dataRgd, setDataRgd] = useState<any[]>([]);
  const [dataRgdMore, setDataRgdMore] = useState<any[]>([]);
  const [dataStateMore, setDataStateMore] = useState<any[]>([]);
  const [dataCbwtfMore, setDataCbwtfMore] = useState<any[]>([]);

  const getCbwtf1 = () => {
    //setIsLoading("Loading data...");
    const frmdt = UseMomentDateNmb(moment(Date.now()).format("DD-MMM-yyyy"));
    const todt = UseMomentDateNmb(moment(Date.now()).format("DD-MMM-yyyy"));
    const lvl1: string = "ALLCBWTF"
    const lgntyp: string = getLvl();
    let who: string = getWho();
    who = lvl == 'STT' ? getStateAbbreviation(capitalize(who)) : who;
    let gid: any = utilities(3, "", "")
    let gd: string = gid
    dispatch({ type: ACTIONS.SETGID, payload: gd })
    let payload: any = postLinux(lvl1 + '=' + lgntyp + '=' + who + '=' + frmdt + '=' + todt, 'dashboadCbwtf');
    return nrjAxiosRequestBio("dshbrd_total_period", payload);
  }


  const { data: data3, refetch: refetchCbwtf } = useQuery({
    queryKey: ["dshbrdNewCbwtf"],
    queryFn: getCbwtf1,
    enabled: true,
    staleTime: 0,
    refetchInterval: 180000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateCbwtf,
  });


  const getDashboardRgd = () => {
    const lvl: string = getLvl();
    if (lvl != 'STT') {
      const who: string = lvl == 'CPCB' ? 'ALL' : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();

      let shrtby = lvl == 'CPCB' ? "RGD" : lvl == 'RGD' ? 'STT' : 'CBWTF';
      const payload: any = postLinux("ALL" + '=' + lvl + '=' + who + '=' + '' + '=' + '' + "=" + '' + '=' + shrtby, 'listwstdata2');
      return nrjAxiosRequestBio("dshbrd", payload);
    }

  }

  const getCbwtfWstListSpcb2 = () => {

    const lvl: string = getLvl();
    if (lvl != 'STT') {
      const who: string = lvl == 'CPCB' ? 'ALL' : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
      let shrtby = lvl == 'CPCB' ? "RGD" : lvl == 'RGD' ? 'STT' : 'CBWTF';
      const payload: any = postLinux("ALL" + '=' + lvl + '=' + who + '' + '=' + '' + '=' + '' + "=" + '' + '=' + 'STT', 'listwstdata2');
      return nrjAxiosRequestBio("dshbrd", payload);
    }

  }

  const getHcfVisited = () => {
    let lvl: string = getLvl();
    let who: string = lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
    const frmdt = UseMomentDateNmb(moment(Date.now()).format("DD-MMM-yyyy"));
    const payload: any = lvl == 'CPCB' ? postLinux(String(frmdt), 'getHcfVisited') : postLinux(String(frmdt) + '=' + lvl + '=' + who, 'getHcfVisited');
    return nrjAxiosRequestBio("showHCFVistedTdy", payload);
  }

  const [hcfVisited, setHcfVisited] = useState("")
  const populateHcfVisited = (data: any) => {
    setIsLoading("")
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    let dt: any = GetResponseLnx(data);
    if (dt && Array.isArray(dt) && dt.length) {
      let flag = false
      let who: string = lvl == 'CPCB' ? 'CPCB' : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
      for (let el of dt) {
        if (el.fltr == who) {
          flag = true
          setHcfVisited(String(el.visitedcnt));
          break;
        }
      }
      if (!flag) {
        setHcfVisited('0')
      }
    }
    else {

    }
  }

  const { data: data5, refetch: refetchDashboardHCfVisited } = useQuery({
    queryKey: ["dashboardHCFVisited", allDataCbwtf],
    queryFn: getHcfVisited,
    enabled: true,
    staleTime: 0,
    refetchInterval: 180000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateHcfVisited,
  });


  const { data: data2, refetch: refetchDashboardRGD } = useQuery({
    queryKey: ["dashboardRgd"],
    queryFn: getDashboardRgd,
    enabled: true,
    staleTime: 0,
    refetchInterval: 180000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateRgd,
  });

  const { data: data4, refetch: refetchDashboardSpcb } = useQuery({
    queryKey: ["dashboardSpcb"],
    queryFn: getCbwtfWstListSpcb2,
    enabled: true,
    staleTime: 0,
    refetchInterval: 180000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateSpcb,
  });

  const [allDataRgd, setAllDataRgd] = useState<any[]>([]);

  function populateRgd(data: any) {
    setIsLoading("")
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    let dt: any = GetResponseLnx(data);
    if (dt && Array.isArray(dt) && dt.length) {

      let tempArray: any = helperFunction(dt)
      let tempFinal: any = []

      tempArray.forEach((res: any) => {
        tempFinal.push({
          ...res,
          color: String(res.fltr).toUpperCase(),
          weight: Number(res.bluwt) + Number(res.redwt) + Number(res.whtwt) + Number(res.ylwwt) + Number(res.cytwt),
          bags: Number(res.blucnt) + Number(res.redcnt) + Number(res.whtcnt) + Number(res.ylwcnt) + Number(res.cytcnt)
        })
      })

      setAllDataRgd(tempFinal.map((res: any) => {
        return {
          ...res,
          redwt: Number(res.redwt).toFixed(3),
          bluwt: Number(res.bluwt).toFixed(3),
          ylwwt: Number(res.ylwwt).toFixed(3),
          whtwt: Number(res.whtwt).toFixed(3),
          cytwt: Number(res.cytwt).toFixed(3),
        }
      }));
      tempFinal = tempFinal.sort((a: any, b: any) => {
        if (a.weight > b.weight) {
          return -1;
        } else if (a.weight < b.weight) {
          return 1;  // b should come before a
        } else {
          return 0;  // a and b are equal
        }
      });
      setDataRgdMore(tempFinal)
      console.log(tempFinal.slice(0, 5))
      setDataRgd(tempFinal.slice(0, 5))

    }
    else {
      setDataRgd([])
      setDataRgdMore([])
      showToaster(['Did not find any data for detailed tab'], 'error');
      setTimeout(() => {
        showToaster([], 'success');
      }, 5000)
    }
    return 1;
  }

  function populateSpcb(data: any) {
    setIsLoading("")
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    let dt: any = GetResponseLnx(data);
    if (dt && Array.isArray(dt) && dt.length) {
      if (dt) {
        let tempArray: any = helperFunction(dt)
        let tempFinal: any = []

        tempArray.forEach((res: any) => {
          tempFinal.push({
            ...res,
            fltr: String(getStateFullForm(res.fltr)).toUpperCase(),
            color: String(getStateFullForm(res.fltr)).toUpperCase(),
            weight: Number(res.bluwt) + Number(res.redwt) + Number(res.whtwt) + Number(res.ylwwt) + Number(res.cytwt),
            bags: Number(res.blucnt) + Number(res.redcnt) + Number(res.whtcnt) + Number(res.ylwcnt) + Number(res.cytcnt)
          })
        })

        setAllDataState(tempFinal.map((res: any) => {
          return {
            ...res,
            redwt: Number(res.redwt).toFixed(3),
            bluwt: Number(res.bluwt).toFixed(3),
            ylwwt: Number(res.ylwwt).toFixed(3),
            whtwt: Number(res.whtwt).toFixed(3),
            cytwt: Number(res.cytwt).toFixed(3),
          }
        }));
        tempFinal = tempFinal.sort((a: any, b: any) => {
          if (a.weight > b.weight) {
            return -1;
          } else if (a.weight < b.weight) {
            return 1;  // b should come before a
          } else {
            return 0;  // a and b are equal
          }
        });
        setDataStateMore(tempFinal)
        setDataState(tempFinal.slice(0, 5))
      }
      else {
        setDataState([])
      }
    }
    else if (dt == "" || data.data[0].Status == 'Failed') {
      setDataState([])
      setDataStateMore([])
      showToaster(['Did not find any data for state detailed tab'], 'error');
      setTimeout(() => {
        showToaster([], 'success');
      }, 5000)
    }
    return 1;
  }

  function populateCbwtf(data: any) {
    setIsLoading("")
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    let dt: any = GetResponseLnx(data);
    if (dt && Array.isArray(dt) && dt.length) {
      let tempArray: any = helperFunction(dt)
      let tempFinal: any = []

      tempArray.forEach((res: any) => {
        tempFinal.push({
          ...res,
          color: res.cbwtfnm,
          weight: Number(res.bluwt) + Number(res.redwt) + Number(res.whtwt) + Number(res.ylwwt) + Number(res.cytwt),
          bags: Number(res.blucnt) + Number(res.redcnt) + Number(res.whtcnt) + Number(res.ylwcnt) + Number(res.cytcnt)
        })
      })

      setAllDataCbwtf(tempFinal.map((res: any) => {
        return {
          ...res,
          redwt: Number(res.redwt).toFixed(3),
          bluwt: Number(res.bluwt).toFixed(3),
          ylwwt: Number(res.ylwwt).toFixed(3),
          whtwt: Number(res.whtwt).toFixed(3),
          cytwt: Number(res.cytwt).toFixed(3),
        }
      }));
      tempFinal = tempFinal.sort((a: any, b: any) => {
        if (a.weight > b.weight) {
          return -1;
        } else if (a.weight < b.weight) {
          return 1;  // b should come before a
        } else {
          return 0;  // a and b are equal
        }
      });
      setDataCbwtfMore(tempFinal)

      setDataCbwtf(tempFinal.slice(0, 5))
      console.log(tempFinal.slice(0, 5), 'cvfnfn')
    }
    else {
      setDataCbwtf([])
      setDataCbwtfMore([])
      showToaster(['Did not find any data for detailed CBWTF tab'], 'error');
      setTimeout(() => {
        showToaster([], 'success');
      }, 5000)
    }
    return 1;
  }


  function helperFunction(dt: any) {
    let ary: any[] = dt
    let tempArray = new Map();
    ary.forEach((obj: any) => {
      if (obj.scnby === 'fct') {
        const key = obj.fltr.toLowerCase();
        let data = getCntWtInNumbers(obj);
        if (tempArray.has(key)) {
          tempArray.set(key,
            {
              ...obj,
              redwt: tempArray.get(key).redwt + data.redwt,
              bluwt: tempArray.get(key).bluwt + data.bluwt,
              ylwwt: tempArray.get(key).ylwwt + data.ylwwt,
              whtwt: tempArray.get(key).whtwt + data.whtwt,
              cytwt: tempArray.get(key).cytwt + data.cytwt,
              blucnt: tempArray.get(key).blucnt + data.blucnt,
              redcnt: tempArray.get(key).redcnt + data.redcnt,
              ylwcnt: tempArray.get(key).ylwcnt + data.ylwcnt,
              whtcnt: tempArray.get(key).whtcnt + data.whtcnt,
              cytcnt: tempArray.get(key).cytcnt + data.cytcnt,
            }
          )
        }
        else {
          tempArray.set(key,
            {
              ...obj,
              redwt: data.redwt,
              bluwt: data.bluwt,
              ylwwt: data.ylwwt,
              whtwt: data.whtwt,
              cytwt: data.cytwt,
              blucnt: data.blucnt,
              redcnt: data.redcnt,
              ylwcnt: data.ylwcnt,
              whtcnt: data.whtcnt,
              cytcnt: data.cytcnt,
            }
          )
        }
      }
    });
    return tempArray;
  }



  const [open, setOpen] = useState(false);
  const [infoopen, setInfoOpen] = useState(false);
  const [stabiliser, setStabiliser] = useState<boolean>(true);
  const [modalContent, setModalContent] = useState<any[]>([]);
  const [modalTabHead, setModalTabHead] = useState<string>("");
  const handleOpen = (data: any) => {
    if (data == "rgd") {
      setModalTabHead("Regional directorate")
      setModalContent(dataRgdMore);
      console.log(dataRgdMore)
    } else if (data == "stt") {
      setModalContent(dataStateMore);
      setModalTabHead("SPCB/PCC")
    } else if (data == "cbwtf") {
      setModalContent(dataCbwtfMore);
      setModalTabHead("CBWTF")
    } else {
      setModalContent([]);
      setModalTabHead("")
    }
    if (stabiliser) {
      setOpen(true);
      setStabiliser(!stabiliser);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStabiliser(!stabiliser);
  };

  const handleOpenInfo = () => {
    if (stabiliser) {
      setInfoOpen(true);
      setStabiliser(!stabiliser);
    }
  };

  const handleCloseInfo = () => {
    setInfoOpen(false);
    setStabiliser(!stabiliser);
  };

  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null; // Hide popup when closed

  const splitText = (text: any) => {
    const words = text.split(" "); // Split by space
    const mid = Math.ceil(words.length / 2); // Find midpoint
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")]; // Return two parts
  };



  return (
    <>
      {/* <div>
        <button onClick={handleClick}>Show Toast</button>
        <button onClick={hideToaster}>Hide Toast</button>
      </div> */}
      <div className="mt-1 mx-4 pb-5 mb-5">
        <div className="font-semibold text-lg">
          <span className="text-[#6c757d]">Date:</span> {date} <br />
          <span className="text-[#6c757d]">
            <span className="text-red-500 italic font-bold">Live </span>Waste bags collection from midnight 00:00 to
          </span>  {time}
        </div>
        <hr />
        <div className=" font-semibold text-lg text-center ">{isLoading}</div>

        {showMessage && showMessage.message.length != 0 ? <div className="py-2">
          <Toaster data={showMessage} className={''}></Toaster>
        </div> : <></>}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-100 border border-2 py-4 px-3 text-center rounded-lg shadow min-h-[200px]">
            <h5 className="mt-2 font-semibold">Generated</h5>
            <div className="flex p-4 justify-center">
              <div className="w-full flex flex-col gap-2">
                <div className="bg-blue-50 rounded w-full px-4 p-2 flex justify-center items-center">
                  <h4 className="text-center text-lg font-medium flex flex-wrap items-center justify-center gap-1 min-w-0 break-words">
                    <span className="inline-block text-2xl font-medium">{genWtSum}</span>
                    <span className="font-semibold text-[24px] whitespace-nowrap">Kg</span>
                  </h4>
                </div>
                <div className="bg-blue-50 rounded p-2 w-full px-4 flex justify-center items-center">
                  <h4 className="text-center text-lg font-medium flex flex-wrap items-center justify-center gap-1 min-w-0 break-words">
                    <span className="inline-block text-2xl font-medium">{genCntSum}</span>
                    <span className="font-semibold text-[24px] whitespace-nowrap">Bags</span>
                  </h4>
                </div>
              </div>
            </div>

            <span className="text-sm text-gray-800 font-semibold"> 30 bedded HCF & above</span>
          </div>

          <div className="bg-yellow-100 border border-2 py-4 px-3 text-center rounded-lg shadow min-h-[200px]">
            <h5 className="mt-2 font-semibold">Collected</h5>
            <div className="flex p-4 justify-center">
              <div className="w-full flex flex-col gap-2">
                <div className="bg-blue-50 rounded w-full px-4 p-2 flex justify-center items-center">
                  <h4 className="text-center text-lg font-medium flex flex-wrap items-center justify-center gap-1 min-w-0 break-words">
                    <span className="inline-block text-2xl font-medium">{colWtSum}</span>
                    <span className="font-semibold text-[24px] whitespace-nowrap">Kg</span>
                  </h4>
                </div>
                <div className="bg-blue-50 rounded p-2 w-full px-4 flex justify-center items-center">
                  <h4 className="text-center text-lg font-medium flex flex-wrap items-center justify-center gap-1 min-w-0 break-words">
                    <span className="inline-block text-2xl font-medium">{colCntSum}</span>
                    <span className="font-semibold text-[24px] whitespace-nowrap">Bags</span>
                  </h4>
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-800 font-semibold">Below & above 30 bedded HCF</span>
          </div>

          <div className="bg-green-100 border border-2 py-4 px-3 text-center rounded-lg shadow min-h-[200px]">
            <h5 className="mt-2 font-semibold">Processed</h5>
            <div className="flex p-4 justify-center">
              <div className="w-full flex flex-col gap-2">
                <div className="bg-blue-50 rounded w-full px-4 p-2 flex justify-center items-center">
                  <h4 className="text-center text-lg font-medium flex flex-wrap items-center justify-center gap-1 min-w-0 break-words">
                    <span className="inline-block text-2xl font-medium">{proWtSum}</span>
                    <span className="font-semibold text-[24px] whitespace-nowrap">Kg</span>
                  </h4>
                </div>
                <div className="bg-blue-50 rounded p-2 w-full px-4 flex justify-center items-center">
                  <h4 className="text-center text-lg font-medium flex flex-wrap items-center justify-center gap-1 min-w-0 break-words">
                    <span className="inline-block text-2xl font-medium">{proCntSum}</span>
                    <span className="font-semibold text-[24px] whitespace-nowrap">Bags</span>
                  </h4>
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-800 font-semibold">Below & above 30 bedded HCF</span>
          </div>

          <div className="bg-blue-200 border border-2 py-4 px-3 text-center rounded-lg shadow min-h-[200px]">
            <h5 className="mt-2 font-semibold">CBWTF's info</h5>
            <div className="flex p-4 justify-center">
              <div className="w-full">
                <div className="bg-blue-50 rounded w-full px-4 p-2 mb-2">
                  <h4 className="flex items-center justify-center">
                    <span className="font-normal mr-2 text-[16px]">Active vehicle</span> 0
                  </h4>
                </div>
                <div className="bg-blue-50 rounded w-full px-4 p-2">
                  <h4 className="flex items-center justify-center">
                    {hcfVisited} <span className="font-normal ml-2 text-[16px]">HCF visited</span>
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 border-1 rounded-lg">
          {props.toggleState == undefined ? <div className="flex text-[18px] justify-end my-3  p-1 shadow-lg">
            <span className=""></span> Kg
            <OnOffToggle onToggleChange={handleToggleChange} />
            <span className="">Bags</span>
          </div> : <></>}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-6 xl:gap-12 place-items-center">
            <div className="bg-white py-4 px-6 rounded shadow w-full max-w-[700px] min-w-0 h-[500px] 
                xl:max-w-[550px] xl:h-[560px] 
                4k:max-w-[600px] 4k:h-[700px] flex flex-col items-center overflow-hidden">

              <div className="text-center font-semibold m-2">Generated</div>

              <div className="text-center text-xs font-semibold m-2">
                Biomedical waste collection {toggleState ? ': incorrect data' : '(in kg)'}
              </div>

              <div className="flex flex-col items-center justify-center w-full flex-grow">
                <div className="chart-container 
          w-[280px] h-[280px] 
            md:w-[300px] md:h-[330px]  
            xl:w-[380px] xl:h-[380px]  
            2xl:w-[364px] 2xl:h-[400px]  
            4k:w-[500px] 4k:h-[500px]">

                  <Doughnut data={toggleState ? doughnutDatab : doughnutData} options={toggleState ? doughnutOptionsb : doughnutOptions} />
                </div>

                {/* Ensure text appears directly below the graph */}
                <span className="text-sm text-gray-800 font-semibold mt-4">
                  30 Bedded HCF & above
                </span>
              </div>
            </div>


            <div className="bg-white py-4 px-6 rounded shadow w-full max-w-[700px] min-w-0 h-[500px] 
                xl:max-w-[550px] xl:h-[560px] 
                4k:max-w-[600px] 4k:h-[700px] flex flex-col items-center overflow-hidden">
              <div className="text-center font-semibold m-2">Collected</div>
              <div className="text-center text-xs font-semibold m-2">
                Biomedical waste collection {toggleState ? ': incorrect data' : '(in kg)'}
              </div>
              <div className="flex justify-center w-full">
                <div className="chart-container 
                      w-[280px] h-[280px] 
            md:w-[300px] md:h-[330px]  
            xl:w-[380px] xl:h-[380px]  
            2xl:w-[364px] 2xl:h-[400px]  
            4k:w-[500px] 4k:h-[500px]">
                  <Doughnut data={toggleState ? doughnutDataCb : doughnutDataC} options={toggleState ? doughnutOptionCb : doughnutOptionCb} />
                </div>
              </div>
              <span className="text-sm text-gray-800 font-semibold mt-4">Below & above 30 bedded HCF</span>
            </div>


            {/* Chart 3 */}
            <div className="bg-white py-4 px-6 rounded shadow w-full max-w-[700px] min-w-0 h-[500px] 
                xl:max-w-[550px] xl:h-[560px] 
                4k:max-w-[600px] 4k:h-[700px] flex flex-col items-center overflow-hidden">
              <div className="text-center font-semibold m-2">Processed</div>
              <div className="text-center text-xs font-semibold m-2">
                Biomedical waste collection {toggleState ? ': incorrect data' : '(in kg)'}
              </div>
              <div className="flex justify-center w-full">
                <div className="chart-container 
                       w-[280px] h-[280px] 
            md:w-[300px] md:h-[330px]  
            xl:w-[380px] xl:h-[380px]  
            2xl:w-[364px] 2xl:h-[400px]  
            4k:w-[500px] 4k:h-[500px]">
                  <Doughnut data={toggleState ? doughnutDataPb : doughnutDataP} options={toggleState ? doughnutOptionCb : doughnutOptionCb} />
                </div>
              </div>
              <span className="text-sm text-gray-800 font-semibold mt-4">Below & above 30 bedded HCF</span>
            </div>

          </div>

        </div>

        {lvl !== 'STT' && <>
          <hr />
          <div className="flex justify-center font-semibold text-lg">
            <div>Live performance </div>
          </div>
          {/* <div className={`mt-1 grid grid-cols-1 sm:grid-cols-1  md:grid-cols-1   xl:grid-cols-3  4xl:grid-cols-3  gap-4`}> */}
          <div className={`mt-1 grid gap-4 ${lvl === 'CPCB' ? 'xl:grid-cols-3' : 'xl:grid-cols-2' }`}>
            {lvl == 'CPCB' && <div className=" bg-white py-2 px-3  rounded shadow">
              <div className="flex justify-between m-2">
                <h6 className="">
                  Waste processed in
                  CBWTFs (RD wise)
                </h6>
              </div>
              <>

                <div className="m-2 w-full flex justify-center">
                  <TableContainer component={Paper} className="w-full">
                    <Table sx={{ minWidth: 0, width: "100%" }} className="w-full table-fixed">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#1976D2" }}>
                          <TableCell sx={{ color: "white", fontWeight: "bold" }} className="text-xs md:text-sm w-1/4">
                            Regional directorate
                          </TableCell>
                          <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }} className="text-xs md:text-sm w-1/3">
                            Weight (in kg)
                          </TableCell>
                          <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }} className="text-xs md:text-sm w-1/3">
                            No. of bags
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataRgd.map((row) => (
                          <TableRow key={row.fltr}>
                            <TableCell component="th" scope="row" className="text-xs md:text-sm">{row.fltr}</TableCell>
                            <TableCell align="center" className="text-xs md:text-sm">{Math.round(row.weight)}</TableCell>
                            <TableCell align="center" className="text-xs md:text-sm">{row.bags}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>

                {dataRgd.length ? <div className="flex justify-center pt-3">
                  <Button size='small' onClick={() => handleOpen('rgd')} variant="outlined" style={{ textTransform: "none"}}>More</Button>
                </div> : <></>}
              </>

            </div>}

            <div className=" bg-white py-2 px-3  rounded shadow">
              <div className="flex justify-between m-2">
                <h6 className="">
                  Waste processed in CBWTFs (SPCB/PCC wise)
                </h6>
              </div>

              <div className="m-2 w-full flex justify-center">
                <TableContainer component={Paper} className="w-full">
                  <Table sx={{ minWidth: 0, width: "100%" }} className="w-full table-fixed">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#1976D2" }}>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }} className="text-xs md:text-sm w-1/4">
                          SPCB/PCC
                        </TableCell>
                        <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }} className="text-xs md:text-sm w-1/3">
                          Weight (in kg)
                        </TableCell>
                        <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }} className="text-xs md:text-sm w-1/3">
                          No. of bags
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataState.map((row) => (
                        <TableRow key={row.fltr}>
                          <TableCell component="th" scope="row" className="text-xs md:text-sm">{row.fltr}</TableCell>
                          <TableCell align="center" className="text-xs md:text-sm">{Math.round(row.weight)}</TableCell>
                          <TableCell align="center" className="text-xs md:text-sm">{row.bags}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              {dataState.length ? <div className="flex justify-center pt-3">
                <Button size='small' onClick={() => handleOpen('stt')} variant="outlined" style={{ textTransform: "none"}}>More</Button>
              </div> : <></>}
            </div>


            <div className=" bg-white py-2 px-3  rounded shadow">
              <div className="flex justify-between m-2">
                <h6 className="">
                  Waste processed in CBWTFs (CBWTF wise)
                </h6>
              </div>


              <div className="m-2 w-full flex justify-center">
                <TableContainer component={Paper} className="w-full">
                  <Table sx={{ minWidth: 0, width: "100%" }} className="w-full table-fixed">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#1976D2" }}>
                        <TableCell sx={{ color: "white", fontWeight: "bold" }} className="text-xs md:text-sm w-[38%]">
                          CBWTF
                        </TableCell>
                        <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }} className="text-xs md:text-sm w-1/3">
                          Weight (in kg)
                        </TableCell>
                        <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }} className="text-xs md:text-sm w-1/3">
                          No. of bags
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dataCbwtf.map((row) => (
                        <TableRow key={row.cbwtfnm}>
                          <TableCell component="th" scope="row" className="text-xs md:text-sm">
                            {(() => {
                              const parts = splitText(row.cbwtfnm); // Split text into parts
                              return (
                                <>
                                  {parts.map((part: any, index: any) => (
                                    <div key={index}>
                                      {part}
                                      {index === parts.length - 1 && ` (${row.stt})`}
                                      {/* Add (row.stt) only at the end */}
                                    </div>
                                  ))}
                                </>
                              );
                            })()}
                          </TableCell>
                          <TableCell align="center" className="text-xs md:text-sm">{Math.round(row.weight)}</TableCell>
                          <TableCell align="center" className="text-xs md:text-sm">{row.bags}</TableCell>
                        </TableRow>

                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              {dataCbwtf.length ? <div className="flex justify-center pt-3">
                <Button size='small' onClick={() => handleOpen('cbwtf')} variant="outlined" style={{ textTransform: "none"}}>More</Button>
              </div> : <></>}
            </div>
            </div>
         
          <hr />
        </>}
      </div>

      {open && (

        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div
            className="bg-white rounded-lg shadow-lg mx-auto p-4 
                 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 
                 max-h-[90vh] overflow-y-auto"
          >
            <Modal.Header>
              <Modal.Title>
                <div className="font-semibold text-lg sm:text-xl">
                  Waste bags detailed information
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="rounded-lg pb-3 px-4 sm:px-8 lg:px-16 xl:px-20">
                <div className="overflow-x-auto">
                  <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="waste bags table">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#1976D2" }}>
                          {["Regional directorate", "CBWTF", "SPCB/PCC"].includes(modalTabHead) ? (
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>{modalTabHead}</TableCell>
                          ) : (
                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Default value</TableCell>
                          )}
                          <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Weight (in kg)</TableCell>
                          <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>No. of bags</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {modalContent.map((row) => (
                          <TableRow key={row.fltr}>
                            {modalTabHead == "CBWTF" ? (
                              <TableCell component="th" scope="row">{modalTabHead == "CBWTF" ? row.cbwtfnm + " (" + row.stt + ")" : row.cbwtfnm}</TableCell>
                            ) : (
                              <TableCell component="th" scope="row">{row.fltr}</TableCell>
                            )}
                            <TableCell align="right">{Math.round(row.weight)}</TableCell>
                            <TableCell align="right">{row.bags}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button
                onClick={handleClose}
                className="text-sky-500 hover:text-sky-700 underline bg-transparent px-4 py-2"
                style={{ textTransform: "none"}}
              >
                Cancel
              </Button>

            </Modal.Footer>
          </div>
        </div>

      )}
      {infoopen && (
        <Modal open={infoopen} size="full" onClose={handleCloseInfo}>
          <Modal.Header>
            <Modal.Title>
              <div className="font-semibold">
                Details
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div
              className="rounded-lg pb-3 px-[4rem]"
              style={{ backgroundColor: "#fff" }}
            >

              <div>
                <h2>Waste management overview:</h2>

                <h4 style={getColorStyle("green")}>1) Generated</h4>
                <p className="my-4">
                  Shows the waste bags scanned by Health Care Facility with 30 or more Beds.
                  The data is categorized with colors of the bags. Information is in Kg/gm and
                  count of bags.
                </p>

                <h4 style={getColorStyle("green")}>2) Collected</h4>
                <p className="my-4">
                  Shows the waste bags scanned by Common Biomedical Facility with less than 30 Beds.
                  The data is categorized with colors of the bags. Information is in Kg/gm and
                  count of bags.
                </p>

                <h4 style={getColorStyle("green")}>3) Processed</h4>
                <p className="my-4">
                  Shows the waste bags scanned at Common Biomedical Facility(CBWTF).
                  The data is categorized with colors of the bags. Information is in Kg/gm and
                  count of bags.
                </p>

                <h4 style={getColorStyle("yellow")}>Live Performance</h4>
                <p className="my-4">
                  Shows the top five Regional Directorates / State Pollution Boards / Common
                  Biomedical Facilities with the maximum number of bags scanned. It is arranged
                  in alphabetical order.
                </p>
              </div>

            </div>
          </Modal.Body>
          <Modal.Footer>
            {/* <Button variant="contained" color="success"  onClick={handleClose}>
                            Ok
                        </Button> */}
            <Button onClick={handleCloseInfo} style={{ textTransform: "none"}}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      )}
      {(lvl !== 'STT' && lvl !== 'CPCB' && lvl !== 'RGD') ? <>
        <span className="fw-bold text-[16px] flex justify-center text-blue-700">
          Color wise data of processed waste bags
        </span>
        <div className="my-2 px-12">
          <NrjAgGrid
            onGridLoaded={() => { }}
            onRowSelected={() => { }}
            colDef={coldefCbwtf}
            apiCall={""}
            rowData={allDataCbwtf}
            deleteButton={""}
            deleteFldNm={""}
            showDataButton={""}
            showApi={''}
            onButtonClicked={() => { }}
            className="ag-theme-alpine-blue ag-theme-alpine"
            showPagination={true}
            PageSize={100}
            newRowData={[]}
            showTooltips={true}
          ></NrjAgGrid>

        </div>
      </> : <></>
      }



    </>
  );
};

export default React.memo(DashBoardNew);

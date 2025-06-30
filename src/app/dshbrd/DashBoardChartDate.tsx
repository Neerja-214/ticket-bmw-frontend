import React, { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Chart from "react-google-charts";
import GraphDataTable from '../MIS/grapghDataTable';
import OnOffToggle from '../MIS/onOffToggle';
import { nrjAxios, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, dateCheck30Days, getCntWtInNumbers, postLinux } from "../../utilities/utilities";
import { Toaster } from "../../components/reusable/Toaster";
import LevelSelectorOne from "./LevelSelectorOne";
import { Button } from "@mui/material";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { getLvl, getWho } from "../../utilities/cpcb";
import moment from "moment";
import { UseMomentDateNmb } from "../../Hooks/useMomentDtArry";
import { useToaster } from "../../components/reusable/ToasterContext";
import { useEffectOnce } from "react-use";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { input } from "@material-tailwind/react";
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
  ylwgnrtdchng: number;
  rdgnrtdchng: number;
  blugnrtdchng: number;
  whtgnrtdchng: number;
  cytgnrtdchng: number;
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
  ylwcltdchng: number;
  rdcltdchng: number;
  blucltdchng: number;
  whtcltdchng: number;
  cytcltdchng: number;
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
      let dataGenAbv: any = getCntWtInNumbers({})
      if (indexObject.generatedAbove > -1) {
        dataGenAbv = getCntWtInNumbers(action.payload[indexObject.generatedAbove])
      }
      let dataGenBlw: any = getCntWtInNumbers({})
      if (indexObject.generatedBelow > -1) {
        dataGenBlw = getCntWtInNumbers(action.payload[indexObject.generatedBelow])
      }
      newstate.ylwgnrtdcnt = dataGenAbv.ylwcnt
      newstate.ylwgnrtdwt = dataGenAbv.ylwwt
      newstate.rdgnrtdcnt = dataGenAbv.redcnt;
      newstate.rdgnrtdwt = dataGenAbv.redwt;
      newstate.blugnrtdcnt = dataGenAbv.blucnt;
      newstate.blugnrtdwt = dataGenAbv.bluwt;
      newstate.whtgnrtdcnt = dataGenAbv.whtcnt;
      newstate.whtgnrtdwt = dataGenAbv.whtwt;
      newstate.cytgnrtdcnt = dataGenAbv.cytcnt;
      newstate.cytgnrtdwt = dataGenAbv.cytwt;
      newstate.gnrtd = dataGenAbv.ylwwt + dataGenAbv.redwt + dataGenAbv.bluwt + dataGenAbv.whtwt + dataGenAbv.cytwt
      newstate.gnrtcnt = dataGenAbv.ylwcnt + dataGenAbv.redcnt + dataGenAbv.blucnt + dataGenAbv.whtcnt + dataGenAbv.cytcnt


      newstate.ylwgnrtdcntBl = dataGenBlw.ylwcnt
      newstate.ylwgnrtdwtBl = dataGenBlw.ylwwt
      newstate.rdgnrtdcntBl = dataGenBlw.redcnt;
      newstate.rdgnrtdwtBl = dataGenBlw.redwt;
      newstate.blugnrtdcntBl = dataGenBlw.blucnt;
      newstate.blugnrtdwtBl = dataGenBlw.bluwt;
      newstate.whtgnrtdcntBl = dataGenBlw.whtcnt;
      newstate.whtgnrtdwtBl = dataGenBlw.whtwt;
      newstate.cytgnrtdcntBl = dataGenBlw.cytcnt;
      newstate.cytgnrtdwtBl = dataGenBlw.cytwt;
      newstate.gnrtdBl = dataGenBlw.ylwwt + dataGenBlw.redwt + dataGenBlw.bluwt + dataGenBlw.whtwt + dataGenBlw.cytwt
      newstate.gnrtcntBl = dataGenBlw.ylwcnt + dataGenBlw.redcnt + dataGenBlw.blucnt + dataGenBlw.whtcnt + dataGenBlw.cytcnt


      let dataColAbv: any = getCntWtInNumbers({})
      if (indexObject.collectedAbove > -1) {
        dataColAbv = getCntWtInNumbers(action.payload[indexObject.collectedAbove])
      }
      let dataColBlw: any = getCntWtInNumbers({})
      if (indexObject.collectedBelow > -1) {
        dataColBlw = getCntWtInNumbers(action.payload[indexObject.collectedBelow])
      }



      newstate.ylwcltdcnt = dataColAbv.ylwcnt
      newstate.ylwcltdwt = dataColAbv.ylwwt
      newstate.rdcltdcnt = dataColAbv.redcnt;
      newstate.rdcltdwt = dataColAbv.redwt;
      newstate.blucltdcnt = dataColAbv.blucnt;
      newstate.blucltdwt = dataColAbv.bluwt;
      newstate.whtcltdcnt = dataColAbv.whtcnt;
      newstate.whtcltdwt = dataColAbv.whtwt;
      newstate.cytcltdcnt = dataColAbv.cytcnt;
      newstate.cytcltdwt = dataColAbv.cytwt;
      newstate.cltd = dataColAbv.ylwwt + dataColAbv.redwt + dataColAbv.bluwt + dataColAbv.whtwt + dataColAbv.cytwt
      newstate.cltdcnt = dataColAbv.ylwcnt + dataColAbv.redcnt + dataColAbv.blucnt + dataColAbv.whtcnt + dataColAbv.cytcnt

      newstate.ylwcltdcntBl = dataColBlw.ylwcnt
      newstate.ylwcltdwtBl = dataColBlw.ylwwt
      newstate.rdcltdcntBl = dataColBlw.redcnt;
      newstate.rdcltdwtBl = dataColBlw.redwt;
      newstate.blucltdcntBl = dataColBlw.blucnt;
      newstate.blucltdwtBl = dataColBlw.bluwt;
      newstate.whtcltdcntBl = dataColBlw.whtcnt;
      newstate.whtcltdwtBl = dataColBlw.whtwt;
      newstate.cytcltdcntBl = dataColBlw.cytcnt;
      newstate.cytcltdwtBl = dataColBlw.cytwt;
      newstate.cltdBl = dataColBlw.ylwwt + dataColBlw.redwt + dataColBlw.bluwt + dataColBlw.whtwt + dataColBlw.cytwt
      newstate.cltdcntBl = dataColBlw.ylwcnt + dataColBlw.redcnt + dataColBlw.blucnt + dataColBlw.whtcnt + dataColBlw.cytcnt

      let dataProAbv: any = getCntWtInNumbers({})
      if (indexObject.processedAbove > -1) {
        dataProAbv = getCntWtInNumbers(action.payload[indexObject.processedAbove])
      }
      let dataProBlw: any = getCntWtInNumbers({})
      if (indexObject.processedBelow > -1) {
        dataProBlw = getCntWtInNumbers(action.payload[indexObject.processedBelow])
      }


      newstate.ylwprcdcnt = dataProAbv.ylwcnt
      newstate.ylwprcdwt = dataProAbv.ylwwt
      newstate.rdprcdcnt = dataProAbv.redcnt;
      newstate.rdprcdwt = dataProAbv.redwt;
      newstate.bluprcdcnt = dataProAbv.blucnt;
      newstate.bluprcdwt = dataProAbv.bluwt;
      newstate.whtprcdcnt = dataProAbv.whtcnt;
      newstate.whtprcdwt = dataProAbv.whtwt;
      newstate.cytprcdcnt = dataProAbv.cytcnt;
      newstate.cytprcdwt = dataProAbv.cytwt;
      newstate.ylwprcdchng = dataProAbv.ylwchng
      newstate.rdprcdchng = dataProAbv.redchng
      newstate.bluprcdchng = dataProAbv.bluchng
      newstate.whtprcdchng = dataProAbv.whtchng
      newstate.cytprcdchng = dataProAbv.cytchng
      newstate.prcd = dataProAbv.ylwwt + dataProAbv.redwt + dataProAbv.bluwt + dataProAbv.whtwt + dataProAbv.cytwt
      newstate.prcdcnt = dataProAbv.ylwcnt + dataProAbv.redcnt + dataProAbv.blucnt + dataProAbv.whtcnt + dataProAbv.cytcnt


      newstate.ylwprcdcntBl = dataProBlw.ylwcnt
      newstate.ylwprcdwtBl = dataProBlw.ylwwt
      newstate.rdprcdcntBl = dataProBlw.redcnt;
      newstate.rdprcdwtBl = dataProBlw.redwt;
      newstate.bluprcdcntBl = dataProBlw.blucnt;
      newstate.bluprcdwtBl = dataProBlw.bluwt;
      newstate.whtprcdcntBl = dataProBlw.whtcnt;
      newstate.whtprcdwtBl = dataProBlw.whtwt;
      newstate.cytprcdcntBl = dataProBlw.cytcnt;
      newstate.cytprcdwtBl = dataProBlw.cytwt;
      newstate.prcdBl = dataProBlw.ylwwt + dataProBlw.redwt + dataProBlw.bluwt + dataProBlw.whtwt + dataProBlw.cytwt
      newstate.prcdcntBl = dataProBlw.ylwcnt + dataProBlw.redcnt + dataProBlw.blucnt + dataProBlw.whtcnt + dataProBlw.cytcnt

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

const DashBoardChartDate = (props: any) => {
  const [isLoading, setIsLoading] = useState("");
  const [state, dispatch] = useReducer(reducer, initialState);
  const GetGid = () => {
    let g: any = utilities(3, "", "");
    dispatch({ type: ACTIONS.SETGID, payload: g });
    return g;
  };
 
  const cntwtData: any = {
    "ylwwt": 0,
    "redwt": 0,
    "whtwt": 0,
    "bluwt": 0,
    "cytwt": 0,
    "ylwcnt": 0,
    "redcnt": 0,
    "whtcnt": 0,
    "blucnt": 0,
    "cytcnt": 0
  }
  const clearData: any[] = [
    {
      "fltr": "cpcb",
      "bdctg": 2,
      "scnby": "Supervisor",
      ...cntwtData
    },
    {
      "fltr": "cpcb",
      "bdctg": 1,
      "scnby": "Supervisor",
      ...cntwtData
    },
    {
      "fltr": "cpcb",
      "bdctg": 2,
      "scnby": "HCF",
      ...cntwtData
    },
    {
      "fltr": "cpcb",
      "bdctg": 1,
      "scnby": "HCF",
      ...cntwtData
    },
    {
      "fltr": "cpcb",
      "bdctg": 2,
      "scnby": "Plant",
      ...cntwtData
    },
    {
      "fltr": "cpcb",
      "bdctg": 1,
      "scnby": "Plant",
      ...cntwtData
    }
  ]

  const [inputData, setInputData] = useState({ lvl: "", who: "", frmDate: "", toDate: "" })
  const { showToaster, hideToaster } = useToaster();
  const SvClick = () => {
    let msg: any = dateCheck30Days(inputData.frmDate, inputData.toDate)
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      return;
    }
    refetch();
  };

  const getData = () => {

    let gid = GetGid()
    setIsLoading("Data loading...");
    let dt: any = new Date();
    let fromDate: string = inputData.frmDate ? inputData.frmDate : moment(dt).format("DD-MMM-yyyy");
    let toDate: string = inputData.toDate ? inputData.toDate : moment(dt).format("DD-MMM-yyyy");
    fromDate = UseMomentDateNmb(fromDate);
    toDate = UseMomentDateNmb(toDate);
    if (inputData.who) {
      if (inputData.who == "Select a CBWTF to get data") {

        inputData.who = "CENTRAL"
      }

      
      let payload: any = postLinux(inputData.who + '=' + inputData.who + '=' + fromDate + '=' + toDate + '=' + gid, 'dashboard');
      return nrjAxiosRequestBio("dshbrd_total_period", payload);

    }


  };
 

  const ShowData = (data: any) => {
    setIsLoading("")
    // let dt: string = GetResponseWnds(data);
    // let ary: any = dataStr_ToArray(dt);
    let ary: any = GetResponseLnx(data);
    if (ary && Array.isArray(ary) && ary.length) {
      dispatch({ type: ACTIONS.SETSUMMARY, payload: ary });
    }
    else {
      dispatch({ type: ACTIONS.SETSUMMARY, payload: clearData });
      showToaster(['No data received'], 'error')
    }
  };

  const { data, refetch } = useQuery({
    queryKey: ["dshbrd"],
    queryFn:  getData,
    enabled: true,
    staleTime: 0,
    refetchInterval: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });


 

  //   let lvl = levelWhoData.who;
  // if (lvl == "Select a CBWTF to get data") {
  //   lvl = "CENTRAL"
  // }
  // let who = levelWhoData.who;
  // let dateFrm = getFldValue(state.textDts, "dt_rptfrm")
  // let dateTo = getFldValue(state.textDts, "dt_rptto")
  // if (!dateFrm) {
  //   dateFrm = moment(Date.now()).format("DD-MMM-yyyy")

  // } else if (!dateTo) {
  //   dateTo = moment(Date.now()).format("DD-MMM-yyyy")
  // }
  // let dtFrm = UseMomentDateNmb(dateFrm);
  // let dtTo = UseMomentDateNmb(dateTo);
  // let dtwise = true
  // let gid: string = getGid();
 
  // const payload: any = postLinux(lvl + '=' + who + '=' + "" + '=' + dtFrm + '=' + dtTo + '=' + dtwise + '=' + gid, 'serialnumber');

  // return nrjAxiosRequestBio("dshbrd", payload);

  

  const [showMessage, setShowMessage] = useState<any>({ message: [] });

  const PrntRep = () => {
    let gid: string = state.gid
    if (!gid) {
      showToaster(["populate the data in the grid first"], 'error');
      return;
    }
    let dt: string = state.textDts;
    dt = getFldValue(dt, "dt")
    let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g127", `10=${gid}`);
    return nrjAxios({ apiCall: api });
  };

  const ShowReprtt = (dataC: any) => {
    let dt: string = GetResponseWnds(dataC);
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    if (dt && dt.indexOf('.pdf') > -1) {
      //dispatchGlobal(storePrintData(dt))
      window.open(dt, "_blank")
    }
    else {
      showToaster(["Please try again after refreshing the page!"], 'error')
    }

  }




  const [toggleState, setToggleState] = useState(props.toggleState || false);

  useEffect(() => {
    setToggleState(props.toggleState);
  }, [props.toggleState])

  const handleToggleChange = (newState: any) => {
    setToggleState(newState);
  };

  const setLvlWhoData = (data: any) => {
    if (data.shrtby) {
      setInputData({ lvl: data.who, who: data.who, frmDate: data.frmDate, toDate: data.toDate });
    } else {
      setInputData({ lvl: data.lvl, who: data.who, frmDate: data.frmDate, toDate: data.toDate });
    }
   
    dispatch({ type: ACTIONS.SETSUMMARY, payload: clearData });
  }





  const options = {
    pieSliceTextStyle: {
      color: 'black',
    },
    legend: {
      textStyle: {
        color: 'black',
      },
    },
    colors: ["Yellow", "Red", "Yellow", "Blue", "White"],
    title: "Biomedical Waste Collection : Weight",
    is3D: true,
    sliceVisibilityThreshold: 0.000001,


  };
  const optionsb = {
    colors: ["Yellow", "red", "Yellow", "blue", "White"],
    title: "Biomedical Waste Collection : Bags",
    is3D: true,
    sliceVisibilityThreshold: 0.000001,
    pieSliceTextStyle: {
      color: 'black',
    },
    legend: {
      textStyle: {
        color: 'black',
      },
    },

  };

  let datachrt: any = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwgnrtdwt) + Number(state.ylwgnrtdwtBl)],
    ["Red", Number(state.rdgnrtdwt) + Number(state.rdgnrtdwtBl)],
    ["Cytotoxic", Number(state.cytgnrtdwt) + Number(state.cytgnrtdwtBl)],
    ["Blue", Number(state.blugnrtdwt) + Number(state.blugnrtdwtBl)],
    ["White", Number(state.whtgnrtdwt) + Number(state.whtgnrtdwtBl)],

  ];

  const doughnutData = {
    labels: ["Yellow", "Red", "Cytotoxic", "Blue", "White"],
    datasets: [
      {
        // data: [
        //   Number(state.ylwgnrtdwt) + Number(state.ylwgnrtdwtBl),
        //   Number(state.rdgnrtdwt) + Number(state.rdgnrtdwtBl),
        //   Number(state.cytgnrtdwt) + Number(state.cytgnrtdwtBl),
        //   Number(state.blugnrtdwt) + Number(state.blugnrtdwtBl),
        //   Number(state.whtgnrtdwt) + Number(state.whtgnrtdwtBl),
        // ],
        data: [
          parseFloat((Number(state.ylwgnrtdwt) + Number(state.ylwgnrtdwtBl)).toFixed(3)),
          parseFloat((Number(state.rdgnrtdwt) + Number(state.rdgnrtdwtBl)).toFixed(3)),
          parseFloat((Number(state.cytgnrtdwt) + Number(state.cytgnrtdwtBl)).toFixed(3)),
          parseFloat((Number(state.blugnrtdwt) + Number(state.blugnrtdwtBl)).toFixed(3)),
          parseFloat((Number(state.whtgnrtdwt) + Number(state.whtgnrtdwtBl)).toFixed(3)),
        ],
        
        backgroundColor: ["rgb(255, 205, 86)", "rgb(255, 99, 132)", "#CE93D8", "rgb(54, 162, 235)", "#F1F8E9"],
        hoverOffset: 4
        // borderColor: ["rgb(255, 205, 86)", "#e74c3c", "#8e44ad", "#3498db", "#bdc3c7"],
        // borderWidth: 1,
      },
    ],
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
            return `Weight: ${value} (${percentage})`;
          },
        },
      },
    },
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
        ],
        backgroundColor: ["rgb(255, 205, 86)", "rgb(255, 99, 132)", "#CE93D8", "rgb(54, 162, 235)", "#F1F8E9"],
        hoverOffset: 8,
      },
    ],
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
          parseFloat((Number(state.ylwcltdwt) + Number(state.ylwcltdwtBl)).toFixed(3)),
          parseFloat((Number(state.rdcltdwt) + Number(state.rdcltdwtBl)).toFixed(3)),
          parseFloat((Number(state.cytcltdwt) + Number(state.cytcltdwtBl)).toFixed(3)),
          parseFloat((Number(state.blucltdwt) + Number(state.blucltdwtBl)).toFixed(3)),
          parseFloat((Number(state.whtcltdwt) + Number(state.whtcltdwtBl)).toFixed(3)),
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

  const doughnutDataP = {
    labels: ["Yellow", "Red", "Cytotoxic", "Blue", "White"],
    datasets: [
      {
        // data: [
        //   Number(state.ylwprcdwt) + Number(state.ylwprcdwtBl),
        //   Number(state.rdprcdwt) + Number(state.rdprcdwtBl),
        //   Number(state.cytprcdwt) + Number(state.cytprcdwtBl),
        //   Number(state.bluprcdwt) + Number(state.bluprcdwt),
        //   Number(state.whtprcdwt) + Number(state.whtprcdwtBl),
        // ],
        data: [
          parseFloat((Number(state.ylwprcdwt) + Number(state.ylwprcdwtBl)).toFixed(3)),
          parseFloat((Number(state.rdprcdwt) + Number(state.rdprcdwtBl)).toFixed(3)),
          parseFloat((Number(state.cytprcdwt) + Number(state.cytprcdwtBl)).toFixed(3)),
          parseFloat((Number(state.bluprcdwt) + Number(state.bluprcdwtBl)).toFixed(3)),
          parseFloat((Number(state.whtprcdwt) + Number(state.whtprcdwtBl)).toFixed(3)),
        ],
        
        backgroundColor: ["rgb(255, 205, 86)", "rgb(255, 99, 132)", "#CE93D8", "rgb(54, 162, 235)", "#F1F8E9"],
        hoverOffset: 8,
      },
    ],
  };
  let datachrtb: any = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwgnrtdcnt) + Number(state.ylwgnrtdcntBl)],
    ["Red", Number(state.rdgnrtdcnt) + Number(state.rdgnrtdcntBl)],
    ["Cytotoxic", Number(state.cytgnrtdcnt) + Number(state.cytgnrtdcntBl)],
    ["Blue", Number(state.blugnrtdcnt) + Number(state.blugnrtdcntBl)],
    ["White", Number(state.whtgnrtdcnt) + Number(state.whtgnrtdcntBl)],

  ];

  let datachrtC = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwcltdwt) + Number(state.ylwcltdwtBl)],
    ["Red", Number(state.rdcltdwt) + Number(state.rdcltdwtBl)],
    ["Cytotoxic", Number(state.cytcltdwt) + Number(state.cytcltdwtBl)],
    ["Blue", Number(state.blucltdwt) + Number(state.blucltdwtBl)],
    ["White", Number(state.whtcltdwt) + Number(state.whtcltdwtBl)],

  ];
  let datachrtCb = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwcltdcnt) + Number(state.ylwcltdcntBl)],
    ["Red", Number(state.rdcltdcnt) + Number(state.rdcltdcntBl)],
    ["Cytotoxic", Number(state.cytcltdcnt) + Number(state.cytcltdcntBl)],
    ["Blue", Number(state.blucltdcnt) + Number(state.blucltdcntBl)],
    ["White", Number(state.whtcltdcnt) + Number(state.whtcltdcntBl)],
  ];

  let datachrtP = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwprcdwt) + Number(state.ylwprcdwtBl)],
    ["Red", Number(state.rdprcdwt) + Number(state.rdprcdwtBl)],
    ["Cytotoxic", Number(state.cytprcdwt) + Number(state.cytprcdwtBl)],
    ["Blue", Number(state.bluprcdwt) + Number(state.bluprcdwt)],
    ["White", Number(state.whtprcdwt) + Number(state.whtprcdwtBl)],

  ];

  let datachrtPb = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwprcdcnt) + Number(state.ylwprcdcntBl)],
    ["Red", Number(state.rdprcdcnt) + Number(state.rdprcdcntBl)],
    ["Cytotoxic", Number(state.cytprcdcnt) + Number(state.cytprcdcntBl)],
    ["Blue", Number(state.bluprcdcnt) + Number(state.bluprcdcntBl)],
    ["White", Number(state.whtprcdcnt) + Number(state.whtprcdcntBl)],

  ];

  const dataColorG = [
    {
      color: 'Red',
      weight: (Number(state.rdgnrtdwt) + Number(state.rdgnrtdwtBl)).toFixed(3) || 0,
      bags: Number(state.rdgnrtdcnt) + Number(state.rdgnrtdcntBl) || 0,
      percent: Number(state.rdgnrtdchng) + Number(state.rdgnrtdchngBl) || 0,
      parentClass: 'bg-red-700 '
    },
    {
      color: 'Blue',
      weight: (Number(state.blugnrtdwt) + Number(state.blugnrtdwtBl)).toFixed(3) || 0,
      bags: Number(state.blugnrtdcnt) + Number(state.blugnrtdcntBl) || 0,
      percent: Number(state.blugnrtdchng) + Number(state.blugnrtdchngBl) || 0,
      parentClass: 'bg-blue-700 '

    },
    {
      color: 'Yellow',
      weight: (Number(state.ylwgnrtdwt) + Number(state.ylwgnrtdwtBl)).toFixed(3) || 0,
      bags: Number(state.ylwgnrtdcnt) + Number(state.ylwgnrtdcntBl) || 0,
      percent: Number(state.ylwgnrtdchng) + Number(state.ylwgnrtdchngBl) || 0,
      parentClass: 'bg-yellow-300 '

    },
    {
      color: 'Cytotoxic',
      weight: (Number(state.cytgnrtdwt) + Number(state.cytgnrtdwtBl)).toFixed(3) || 0,
      bags: Number(state.cytgnrtdcnt) + Number(state.cytgnrtdcntBl) || 0,
      percent: Number(state.cytgnrtdchng) + Number(state.cytgnrtdchngBl) || 0,
      parentClass: 'bg-yellow-500 '

    },
    {
      color: 'White',
      weight: (Number(state.whtgnrtdwt) + Number(state.whtgnrtdwtBl)).toFixed(3) || 0,
      bags: Number(state.whtgnrtdcnt) + Number(state.whtgnrtdcntBl) || 0,
      percent: Number(state.whtgnrtdchng) + Number(state.whtgnrtdchngBl) || 0,
      parentClass: 'bg-gray-100'
    },
  ];

  const dataColorC = [
    {
      color: 'Red',
      weight: (Number(state.rdcltdwt) + Number(state.rdcltdwtBl)).toFixed(3) || 0,
      bags: Number(state.rdcltdcnt) + Number(state.rdcltdcntBl) || 0,
      percent: Number(state.rdcltdchng) + Number(state.rdcltdchngBl) || 0,
      parentClass: 'bg-red-700 '
    },
    {
      color: 'Blue',
      weight: (Number(state.blucltdwt) + Number(state.blucltdwtBl)).toFixed(3) || 0,
      bags: Number(state.blucltdcnt) + Number(state.blucltdcntBl) || 0,
      percent: Number(state.blucltdchng) + Number(state.blucltdchngBl) || 0,
      parentClass: 'bg-blue-700 '

    },
    {
      color: 'Yellow',
      weight: (Number(state.ylwcltdwt) + Number(state.ylwcltdwtBl)).toFixed(3) || 0,
      bags: Number(state.ylwcltdcnt) + Number(state.ylwcltdcntBl) || 0,
      percent: Number(state.ylwcltdchng) + Number(state.ylwcltdchngBl) || 0,
      parentClass: 'bg-yellow-300 '

    },
    {
      color: 'Cytotoxic',
      weight: (Number(state.cytcltdwt) + Number(state.cytcltdwtBl)).toFixed(3) || 0,
      bags: Number(state.cytcltdcnt) + Number(state.cytcltdcntBl) || 0,
      percent: Number(state.cytcltdchng) + Number(state.cytcltdchngBl) || 0,
      parentClass: 'bg-yellow-500 '

    },
    {
      color: 'White',
      weight: (Number(state.whtcltdwt) + Number(state.whtcltdwtBl)).toFixed(3) || 0,
      bags: Number(state.whtcltdcnt) + Number(state.whtcltdcntBl) || 0,
      percent: Number(state.whtcltdchng) + Number(state.whtcltdchngBl) || 0,
      parentClass: 'bg-gray-100 '

    },
  ];

  const dataColorP = [
    {
      color: 'Red',
      weight: (Number(state.rdprcdwt) + Number(state.rdprcdwtBl)).toFixed(3) || 0,
      bags: Number(state.rdprcdcnt) + Number(state.rdprcdcntBl) || 0,
      percent: Number(state.rdprcdchng) + Number(state.rdprcdchngBl) || 0,
      parentClass: 'bg-red-700 '
    },
    {
      color: 'Blue',
      weight: (Number(state.bluprcdwt) + Number(state.bluprcdwtBl)).toFixed(3) || 0,
      bags: Number(state.bluprcdcnt) + Number(state.bluprcdcntBl) || 0,
      percent: Number(state.bluprcdchng) + Number(state.bluprcdchngBl) || 0,
      parentClass: 'bg-blue-700 '

    },
    {
      color: 'Yellow',
      weight: (Number(state.ylwprcdwt) + Number(state.ylwprcdwtBl)).toFixed(3) || 0,
      bags: Number(state.ylwprcdcnt) + Number(state.ylwprcdcntBl) || 0,
      percent: Number(state.ylwprcdchng) + Number(state.ylwprcdchngBl) || 0,
      parentClass: 'bg-yellow-300 '

    },
    {
      color: 'Cytotoxic',
      weight: (Number(state.cytprcdwt) + Number(state.cytprcdwtBl)).toFixed(3) || 0,
      bags: Number(state.cytprcdcnt) + Number(state.cytprcdcntBl) || 0,
      percent: Number(state.cytprcdchng) + Number(state.cytprcdchngBl) || 0,
      parentClass: 'bg-yellow-500 '

    },
    {
      color: 'White',
      weight: (Number(state.whtprcdwt) + Number(state.whtprcdwtBl)).toFixed(3) || 0,
      bags: Number(state.whtprcdcnt) + Number(state.whtprcdcntBl) || 0,
      percent: Number(state.whtprcdchng) + Number(state.whtprcdchngBl) || 0,
      parentClass: 'bg-gray-100'
    },
  ];







  return (
    <>

      <div className="mt-1 pb-5 mb-5">


        <LevelSelectorOne
          showCbwtf={false}
          levelSelectorData={setLvlWhoData}
          dateField={true}
          getListButton={true}
          getListOnclick={SvClick}
        // showDetailedCombo={true}
        ></LevelSelectorOne>

        {/* <div className=" font-semibold text-lg text-center ">{isLoading}</div> */}

        {showMessage && showMessage.message.length != 0 ? <div className="py-2">
          <Toaster data={showMessage} className={''}></Toaster>
        </div> : <></>}


        {/* <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 ">
          <div className=" bg-white py-2 px-3  rounded shadow">
            <h6 className="m-2">
              Generated
            </h6>


            <div className="flex m-2 justify-between">
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{Number(state.gnrtd + state.gnrtdBl).toFixed(3)} <span className="small text-[18px]"> Kg</span></h5>
              </div>
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{Number(state.gnrtcnt + state.gnrtcntBl).toFixed(0)}<span className="small text-[18px]"> Bags</span></h5>
              </div>
            </div>
          </div>
          <div className=" bg-white py-2 px-3  rounded shadow">
            <h6 className="m-2">
              Collected
            </h6>
            <div className="flex m-2 justify-between">
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{Number(state.cltd + state.cltdBl).toFixed(3)}<span className="small text-[18px]"> Kg</span></h5>
              </div>
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{Number(state.cltdcnt + state.cltdcntBl).toFixed(0)} <span className="small text-[18px]"> Bags</span></h5>
              </div>
            </div>
          </div>
          <div className=" bg-white py-2 px-3  rounded shadow">
            <h6 className="m-2">
              Processed
            </h6>
            <div className="flex m-2 justify-between">
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{Number(state.prcd + state.prcdBl).toFixed(3)} <span className="small text-[18px]"> Kg</span></h5>
              </div>
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{Number(state.prcdcnt + state.prcdcntBl).toFixed(0)} <span className="small text-[18px]"> Bags</span></h5>
              </div>
            </div>
          </div>
        </div> */}

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-red-100 border border-2 py-4 px-3 text-center rounded-lg shadow min-h-[200px]">
            <h5 className="mt-2 font-semibold">Generated</h5>
            <div className="flex p-4 justify-center">
              <div className="w-full">
                <div className="bg-blue-50 rounded w-full px-4 p-2 mb-2">
                  <h4>{(Math.round(Number(state.gnrtd + state.gnrtdBl)))} <span className="font-semibold text-[24px]">Kg</span></h4>
                </div>
                <div className="bg-blue-50 rounded p-2 w-full px-4">
                  <h4>{Number(state.gnrtcnt + state.gnrtcntBl).toFixed(0)} <span className="font-semibold text-[24px]">Bags</span></h4>
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-800 font-semibold">All HCFs</span>
          </div>

          <div className="bg-yellow-100 border border-2 py-4 px-3 text-center rounded-lg shadow min-h-[200px]">
            <h5 className="mt-2 font-semibold">Collected</h5>
            <div className="flex p-4 justify-center">
              <div className="w-full">
                <div className="bg-blue-50 rounded w-full px-4 p-2 mb-2">
                  <h4>{(Math.round(Number(state.cltd + state.cltdBl)))} <span className="font-semibold text-[24px]">Kg</span></h4>
                </div>
                <div className="bg-blue-50 rounded p-2 w-full px-4">
                  <h4>{Number(state.cltdcnt + state.cltdcntBl).toFixed(0)} <span className="font-semibold text-[24px]">Bags</span></h4>
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-800 font-semibold">All HCFs</span>
          </div>

          <div className="bg-green-100 border border-2 py-4 px-3 text-center rounded-lg shadow min-h-[200px]">
            <h5 className="mt-2 font-semibold">Processed</h5>
            <div className="flex p-4 justify-center">
              <div className="w-full">
                <div className="bg-blue-50 rounded w-full px-4 p-2 mb-2">
                  <h4>{(Math.round(Number(state.prcd + state.prcdBl)))} <span className="font-semibold text-[24px]">Kg</span></h4>
                </div>
                <div className="bg-blue-50 rounded p-2 w-full px-4">
                  <h4>{Number(state.prcdcnt + state.prcdcntBl).toFixed(0)} <span className="font-semibold text-[24px]">Bags</span></h4>
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-800 font-semibold">All HCFs</span>
          </div>

        </div>
        {props.toggleState == undefined ? <div className="flex text-[18px] justify-end my-3  p-1 shadow-lg">
          <span className="">Kg</span>
          <OnOffToggle onToggleChange={handleToggleChange} />
          <span className="">Bags</span>
        </div> : <></>}

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4   ">
          <div className=" bg-white py-2 px-3  rounded shadow">
            <div className="text-center font-semibold m-2">Generated</div>
            <div className="text-center text-xs font-semibold m-2">
            Biomedical waste collection {toggleState ? ': bags count ' : '(in kg)'}
            </div>
            {/* <div className=" m-2 ">
              {toggleState ? (<>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"250px"}
                  data={datachrtb}
                  options={optionsb}
                ></Chart>
              </>) : <>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"250px"}
                  data={datachrt}
                  options={options}
                ></Chart>
              </>}
            </div> */}
            <div className=" m-3">
              <Doughnut data={toggleState ? doughnutDatab : doughnutData} options={toggleState ? doughnutOptionsb : doughnutOptions} />
            </div><div>
              <GraphDataTable data={dataColorG} />
            </div>

          </div>
          <div className=" bg-white py-2 px-3  rounded shadow">
          <div className="text-center font-semibold m-2">Collected</div>
            <div className="text-center text-xs font-semibold m-2">
            Biomedical waste collection {toggleState ? ': bags count ' : '(in kg)'}
                                </div>
            {/* <div className="m-2 ">
              {toggleState ? (<>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"250px"}
                  data={datachrtCb}
                  options={optionsb}
                ></Chart>
              </>) : <>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"250px"}
                  data={datachrtC}
                  options={options}
                ></Chart>
              </>}
            </div> */}
            <div className=" m-3">
              <Doughnut data={toggleState ? doughnutDataCb : doughnutDataC} options={toggleState ? doughnutOptionCb : doughnutOptionCb} />

            </div>
            <div>
              <GraphDataTable data={dataColorC} />
            </div>


          </div>
          <div className=" bg-white py-2 px-3  rounded shadow">
          <div className="text-center font-semibold m-2">Processed</div>
            <div className="text-center text-xs font-semibold m-2">
            Biomedical waste collection {toggleState ? ': bags count ' : '(in kg)'}
                   </div>
            <div className="m-2">
              {/* {toggleState ? (<>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"250px"}
                  data={datachrtPb}
                  options={optionsb}
                ></Chart>
              </>) : <>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"250px"}
                  data={datachrtP}
                  options={options}
                ></Chart>
              </>} */}
              <div className=" m-3">
                <Doughnut data={toggleState ? doughnutDataPb : doughnutDataP} options={toggleState ? doughnutOptionCb : doughnutOptionCb} />
              </div>

            </div>
            <div>
              <GraphDataTable data={dataColorP} />
            </div>


          </div>
        </div>

      </div>

    </>
  );
};

export default React.memo(DashBoardChartDate);

import React, { useEffect, useReducer, useState } from "react";
import { useEffectOnce } from "react-use";
import { useQuery } from "@tanstack/react-query";
import Chart from "react-google-charts";
import { getLvl, getWho } from "../../utilities/cpcb";
import GraphDataTable from "./grapghDataTable";
import OnOffToggle from "./onOffToggle";
import { nrjAxios, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import utilities, { GetResponseWnds, createGetApi, dataStr_ToArray, getCntWtInNumbers, postLinux } from "../../utilities/utilities";

import { getFldValue } from "../../Hooks/useGetFldValue";
import { Toaster } from "../../components/reusable/Toaster";
import { Button } from "@mui/material";
import moment from "moment";
import { UseMomentDateNmb } from "../../Hooks/useMomentDtArry";
import { useToaster } from "../../components/reusable/ToasterContext";

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
        else if (action.payload[i].scnby == 'Operator') {
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

const DashBoardClrGrph = (props: any) => {
  const [isLoading, setIsLoading] = useState("");

  const [state, dispatch] = useReducer(reducer, initialState);
  let [time, reTime] = useState("");
  let [date, reDate] = useState("");

  const GetGid = () => {
    let g: any = utilities(3, "", "");
    dispatch({ type: ACTIONS.SETGID, payload: g });
    return g;
  };

  const getData = (data: any) => {
    let gid = GetGid()

    setIsLoading("Data loading...");

    const lvl: string = getLvl();
    const who: string = getWho();
    let str: string = UseMomentDateNmb(moment(Date.now()).format("DD-MMM-yyyy"));
    let payload: any = postLinux(who + '=' + who + '=' + str + '=' + str + '=' + gid, 'dashboard');
    return nrjAxiosRequestBio("dshbrd_total_period", payload);
  };
  const { showToaster, hideToaster } = useToaster();

  const ShowData = (data: any) => {
    setIsLoading("");
   
    // let dt: string = GetResponseWnds(data);
    // let ary: any = dataStr_ToArray(dt);
    if (Array.isArray(data.data) && data.data.length) {
      let ary = data.data;
      let dte = new Date();
      reTime(dte.toLocaleTimeString());
      reDate(`${dte.getDate()}-${dte.getMonth() + 1}-${dte.getFullYear()}`);
      dispatch({ type: ACTIONS.SETSUMMARY, payload: ary });
    }
    else {
      showToaster( ['No data received'], 'error')
    }
  };


  const [bagsType, setBagsType] = useState(3);


  //   useEffect(() => {
  //     //Implementing the setInterval method
  //     const interval = setInterval(function () {
  //       console.log('dashboard api called for ', bagsType);
  //       refetch();
  //     }, 180000);

  //     //Clearing the interval
  //     return () => clearInterval(interval);
  // }, [bagsType]);



  const { data, refetch } = useQuery({
    queryKey: ["dshbrd", bagsType],
    queryFn: () => getData(bagsType),
    enabled: true,
    staleTime: 0,
    refetchInterval: 300000,
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
    if (bagsType == 3) {
      setGenWtSum(Number(state.gnrtd + state.gnrtdBl).toFixed(3))
      setGenCntSum(Number(state.gnrtcnt + state.gnrtcntBl).toFixed(0))
      setColWtSum(Number(state.cltd + state.cltdBl).toFixed(3))
      setColCntSum(Number(state.cltdcnt + state.cltdcntBl).toFixed(0))
      setProWtSum(Number(state.prcd + state.prcdBl).toFixed(3))
      setProCntSum(Number(state.prcdcnt + state.prcdcntBl).toFixed(0))
    }
    if (bagsType == 1) {
      setGenWtSum(Number(state.gnrtdBl).toFixed(3))
      setGenCntSum(Number(state.gnrtcntBl).toFixed(0))
      setColWtSum(Number(state.cltdBl).toFixed(3))
      setColCntSum(Number(state.cltdcntBl).toFixed(0))
      setProWtSum(Number(state.prcdBl).toFixed(3))
      setProCntSum(Number(state.prcdcntBl).toFixed(0))

    }
    if (bagsType == 2) {
      setGenWtSum(Number(state.gnrtd).toFixed(3))
      setGenCntSum(Number(state.gnrtcnt).toFixed(0))
      setColWtSum(Number(state.cltd).toFixed(3))
      setColCntSum(Number(state.cltdcnt).toFixed(0))
      setProWtSum(Number(state.prcd).toFixed(3))
      setProCntSum(Number(state.prcdcnt).toFixed(0))
    }
  }, [state])


  const options = {
    pieSliceTextStyle: {
      color: 'black',
    },
    legend: {
      textStyle: {
        color: 'black',
      },
    },
    colors: ["Yellow", "Red", "Yellow", "Blue", "#f0f0f0"],
    title: "Biomedical Waste Collection : Weight",
    is3D: true,
    sliceVisibilityThreshold: 0.000001,


  };
  const optionsb = {
    colors: ["Yellow", "red", "Yellow", "blue", "#f0f0f0"],
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

  useEffectOnce(() => {
    let nm: string = sessionStorage.getItem("cbwtfnm") || "CPCB";
    if (nm == "CPCB") {
      dispatch({ type: ACTIONS.SETNAME, payload: nm });
    } else {
      dispatch({ type: ACTIONS.SETNAME, payload: nm });
      dispatch({ type: ACTIONS.SETBUTTON, payload: nm });
    }
  });
  

  let datachrt: any = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwgnrtdwt) + Number(state.ylwgnrtdwtBl)],
    ["Red", Number(state.rdgnrtdwt) + Number(state.rdgnrtdwtBl)],
    ["Cytotoxic", Number(state.cytgnrtdwt) + Number(state.cytgnrtdwtBl)],
    ["Blue", Number(state.blugnrtdwt) + Number(state.blugnrtdwtBl)],
    ["White", Number(state.whtgnrtdwt) + Number(state.whtgnrtdwtBl)],

  ];
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



  // ********************************************************Above****************************

  let datachrtAb: any = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwgnrtdwt)],
    ["Red", Number(state.rdgnrtdwt)],
    ["Cytotoxic", Number(state.cytgnrtdwt)],
    ["Blue", Number(state.blugnrtdwt)],
    ["White", Number(state.whtgnrtdwt)],

  ];
  let datachrtbAb: any = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwgnrtdcnt)],
    ["Red", Number(state.rdgnrtdcnt)],
    ["Cytotoxic", Number(state.cytgnrtdcnt)],
    ["Blue", Number(state.blugnrtdcnt)],
    ["White", Number(state.whtgnrtdcnt)],

  ];

  let datachrtCAb = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwcltdwt)],
    ["Red", Number(state.rdcltdwt)],
    ["Cytotoxic", Number(state.cytcltdwt)],
    ["Blue", Number(state.blucltdwt)],
    ["White", Number(state.whtcltdwt)],

  ];
  let datachrtCbAb = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwcltdcnt)],
    ["Red", Number(state.rdcltdcnt)],
    ["Cytotoxic", Number(state.cytcltdcnt)],
    ["Blue", Number(state.blucltdcnt)],
    ["White", Number(state.whtcltdcnt)],
  ];

  let datachrtPAb = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwprcdwt)],
    ["Red", Number(state.rdprcdwt)],
    ["Cytotoxic", Number(state.cytprcdwt)],
    ["Blue", Number(state.bluprcdwt)],
    ["White", Number(state.whtprcdwt)],

  ];

  let datachrtPbAb = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwprcdcnt)],
    ["Red", Number(state.rdprcdcnt)],
    ["Cytotoxic", Number(state.cytprcdcnt)],
    ["Blue", Number(state.bluprcdcnt)],
    ["White", Number(state.whtprcdcnt)],

  ];

  const dataColorGAb = [
    {
      color: 'Red',
      weight: Number(state.rdgnrtdwt).toFixed(3) || 0,
      bags: Number(state.rdgnrtdcnt) || 0,
      percent: Number(state.rdgnrtdchng) || 0,
      parentClass: 'bg-red-700 '
    },
    {
      color: 'Blue',
      weight: Number(state.blugnrtdwt).toFixed(3) || 0,
      bags: Number(state.blugnrtdcnt) || 0,
      percent: Number(state.blugnrtdchng) || 0,
      parentClass: 'bg-blue-700 '

    },
    {
      color: 'Yellow',
      weight: Number(state.ylwgnrtdwt).toFixed(3) || 0,
      bags: Number(state.ylwgnrtdcnt) || 0,
      percent: Number(state.ylwgnrtdchng) || 0,
      parentClass: 'bg-yellow-300 '

    },
    {
      color: 'Cytotoxic',
      weight: Number(state.cytgnrtdwt).toFixed(3) || 0,
      bags: Number(state.cytgnrtdcnt) || 0,
      percent: Number(state.cytgnrtdchng) || 0,
      parentClass: 'bg-yellow-500 '

    },
    {
      color: 'White',
      weight: Number(state.whtgnrtdwt).toFixed(3) || 0,
      bags: Number(state.whtgnrtdcnt) || 0,
      percent: Number(state.whtgnrtdchng) || 0,
      parentClass: 'bg-gray-100'
    },
  ];

  const dataColorCAb = [
    {
      color: 'Red',
      weight: Number(state.rdcltdwt).toFixed(3) || 0,
      bags: Number(state.rdcltdcnt) || 0,
      percent: Number(state.rdcltdchng) || 0,
      parentClass: 'bg-red-700 '
    },
    {
      color: 'Blue',
      weight: Number(state.blucltdwt).toFixed(3) || 0,
      bags: Number(state.blucltdcnt) || 0,
      percent: Number(state.blucltdchng) || 0,
      parentClass: 'bg-blue-700 '

    },
    {
      color: 'Yellow',
      weight: Number(state.ylwcltdwt).toFixed(3) || 0,
      bags: Number(state.ylwcltdcnt) || 0,
      percent: Number(state.ylwcltdchng) || 0,
      parentClass: 'bg-yellow-300 '

    },
    {
      color: 'Cytotoxic',
      weight: Number(state.cytcltdwt).toFixed(3) || 0,
      bags: Number(state.cytcltdcnt) || 0,
      percent: Number(state.cytcltdchng) || 0,
      parentClass: 'bg-yellow-500 '

    },
    {
      color: 'White',
      weight: Number(state.whtcltdwt).toFixed(3) || 0,
      bags: Number(state.whtcltdcnt) || 0,
      percent: Number(state.whtcltdchng) || 0,
      parentClass: 'bg-gray-100 '

    },
  ];

  const dataColorPAb = [
    {
      color: 'Red',
      weight: Number(state.rdprcdwt).toFixed(3) || 0,
      bags: Number(state.rdprcdcnt) || 0,
      percent: Number(state.rdprcdchng) || 0,
      parentClass: 'bg-red-700 '
    },
    {
      color: 'Blue',
      weight: Number(state.bluprcdwt).toFixed(3) || 0,
      bags: Number(state.bluprcdcnt) || 0,
      percent: Number(state.bluprcdchng) || 0,
      parentClass: 'bg-blue-700 '

    },
    {
      color: 'Yellow',
      weight: Number(state.ylwprcdwt).toFixed(3) || 0,
      bags: Number(state.ylwprcdcnt) || 0,
      percent: Number(state.ylwprcdchng) || 0,
      parentClass: 'bg-yellow-300 '

    },
    {
      color: 'Cytotoxic',
      weight: Number(state.cytprcdwt).toFixed(3) || 0,
      bags: Number(state.cytprcdcnt) || 0,
      percent: Number(state.cytprcdchng) || 0,
      parentClass: 'bg-yellow-500 '

    },
    {
      color: 'White',
      weight: Number(state.whtprcdwt).toFixed(3) || 0,
      bags: Number(state.whtprcdcnt) || 0,
      percent: Number(state.whtprcdchng) || 0,
      parentClass: 'bg-gray-100'
    },
  ];



  // ****************************************************************Below*******************************


  let datachrtBl: any = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwgnrtdwtBl)],
    ["Red", Number(state.rdgnrtdwtBl)],
    ["Cytotoxic", Number(state.cytgnrtdwtBl)],
    ["Blue", Number(state.blugnrtdwtBl)],
    ["White", Number(state.whtgnrtdwtBl)],

  ];
  let datachrtbBl: any = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwgnrtdcntBl)],
    ["Red", Number(state.rdgnrtdcntBl)],
    ["Cytotoxic", Number(state.cytgnrtdcntBl)],
    ["Blue", Number(state.blugnrtdcntBl)],
    ["White", Number(state.whtgnrtdcntBl)],

  ];

  let datachrtCBl = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwcltdwtBl)],
    ["Red", Number(state.rdcltdwtBl)],
    ["Cytotoxic", Number(state.cytcltdwtBl)],
    ["Blue", Number(state.blucltdwtBl)],
    ["White", Number(state.whtcltdwtBl)],

  ];
  let datachrtCbBl = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwcltdcntBl)],
    ["Red", Number(state.rdcltdcntBl)],
    ["Cytotoxic", Number(state.cytcltdcntBl)],
    ["Blue", Number(state.blucltdcntBl)],
    ["White", Number(state.whtcltdcntBl)],
  ];

  let datachrtPBl = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwprcdwtBl)],
    ["Red", Number(state.rdprcdwtBl)],
    ["Cytotoxic", Number(state.cytprcdwtBl)],
    ["Blue", Number(state.bluprcdwtBl)],
    ["White", Number(state.whtprcdwtBl)],

  ];

  let datachrtPbBl = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwprcdcntBl)],
    ["Red", Number(state.rdprcdcntBl)],
    ["Cytotoxic", Number(state.cytprcdcntBl)],
    ["Blue", Number(state.bluprcdcntBl)],
    ["White", Number(state.whtprcdcntBl)],

  ];

  const dataColorGBl = [
    {
      color: 'Red',
      weight: Number(state.rdgnrtdwtBl).toFixed(3) || 0,
      bags: Number(state.rdgnrtdcntBl) || 0,
      percent: Number(state.rdgnrtdchngBl) || 0,
      parentClass: 'bg-red-700 '
    },
    {
      color: 'Blue',
      weight: Number(state.blugnrtdwtBl).toFixed(3) || 0,
      bags: Number(state.blugnrtdcntBl) || 0,
      percent: Number(state.blugnrtdchngBl) || 0,
      parentClass: 'bg-blue-700 '

    },
    {
      color: 'Yellow',
      weight: Number(state.ylwgnrtdwtBl).toFixed(3) || 0,
      bags: Number(state.ylwgnrtdcntBl) || 0,
      percent: Number(state.ylwgnrtdchngBl) || 0,
      parentClass: 'bg-yellow-300 '

    },
    {
      color: 'Cytotoxic',
      weight: Number(state.cytgnrtdwtBl).toFixed(3) || 0,
      bags: Number(state.cytgnrtdcntBl) || 0,
      percent: Number(state.cytgnrtdchngBl) || 0,
      parentClass: 'bg-yellow-500 '

    },
    {
      color: 'White',
      weight: Number(state.whtgnrtdwtBl).toFixed(3) || 0,
      bags: Number(state.whtgnrtdcntBl) || 0,
      percent: Number(state.whtgnrtdchngBl) || 0,
      parentClass: 'bg-gray-100'
    },
  ];

  const dataColorCBl = [
    {
      color: 'Red',
      weight: Number(state.rdcltdwtBl).toFixed(3) || 0,
      bags: Number(state.rdcltdcntBl) || 0,
      percent: Number(state.rdcltdchngBl) || 0,
      parentClass: 'bg-red-700 '
    },
    {
      color: 'Blue',
      weight: Number(state.blucltdwtBl).toFixed(3) || 0,
      bags: Number(state.blucltdcntBl) || 0,
      percent: Number(state.blucltdchngBl) || 0,
      parentClass: 'bg-blue-700 '

    },
    {
      color: 'Yellow',
      weight: Number(state.ylwcltdwtBl).toFixed(3) || 0,
      bags: Number(state.ylwcltdcntBl) || 0,
      percent: Number(state.ylwcltdchngBl) || 0,
      parentClass: 'bg-yellow-300 '

    },
    {
      color: 'Cytotoxic',
      weight: Number(state.cytcltdwtBl).toFixed(3) || 0,
      bags: Number(state.cytcltdcntBl) || 0,
      percent: Number(state.cytcltdchngBl) || 0,
      parentClass: 'bg-yellow-500 '

    },
    {
      color: 'White',
      weight: Number(state.whtcltdwtBl).toFixed(3) || 0,
      bags: Number(state.whtcltdcntBl) || 0,
      percent: Number(state.whtcltdchngBl) || 0,
      parentClass: 'bg-gray-100 '

    },
  ];

  const dataColorPBl = [
    {
      color: 'Red',
      weight: Number(state.rdprcdwtBl).toFixed(3) || 0,
      bags: Number(state.rdprcdcntBl) || 0,
      percent: Number(state.rdprcdchngBl) || 0,
      parentClass: 'bg-red-700 '
    },
    {
      color: 'Blue',
      weight: Number(state.bluprcdwtBl).toFixed(3) || 0,
      bags: Number(state.bluprcdcntBl) || 0,
      percent: Number(state.bluprcdchngBl) || 0,
      parentClass: 'bg-blue-700 '

    },
    {
      color: 'Yellow',
      weight: Number(state.ylwprcdwtBl).toFixed(3) || 0,
      bags: Number(state.ylwprcdcntBl) || 0,
      percent: Number(state.ylwprcdchngBl) || 0,
      parentClass: 'bg-yellow-300 '

    },
    {
      color: 'Cytotoxic',
      weight: Number(state.cytprcdwtBl).toFixed(3) || 0,
      bags: Number(state.cytprcdcntBl) || 0,
      percent: Number(state.cytprcdchngBl) || 0,
      parentClass: 'bg-yellow-500 '

    },
    {
      color: 'White',
      weight: Number(state.whtprcdwtBl).toFixed(3) || 0,
      bags: Number(state.whtprcdcntBl) || 0,
      percent: Number(state.whtprcdchngBl) || 0,
      parentClass: 'bg-gray-100'
    },
  ];




  const [toggleState, setToggleState] = useState(props.toggleState || false);

  useEffect(() => {
    setToggleState(props.toggleState);
  }, [props.toggleState])

  const handleToggleChange = (newState: any) => {
    setToggleState(newState);
  };

  const [range, setRange] = useState(0)
  const onChangeRange = (data: string) => {
    setRange(Number(getFldValue(data, 'range')));
  }

  const PrntRep = () => {
    let gid: string = state.gid
    if (!gid) {
      showToaster( ["populate the data in the grid first"], 'error');
      return;
    }
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
      showToaster( ["Please try again after refreshing the page!"], 'error')
    }

  }

  const { data: dataC, refetch: refetchP } = useQuery({
    queryKey: ['DashboardView30', state.gid],
    queryFn: PrntRep,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowReprtt,
  })


  const printClick = () => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    refetchP()
  }

  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  return (
    <>
    
      <div className="mt-1 pb-5 mb-5">
        <div className="justify-between flex">
          <div className="font-semibold text-lg">
            <span className="text-[#6c757d]">Date:</span> {date} <br />
            <span className="text-[#6c757d]">Waste Bags Collection From Midnight 00:00 To </span> {time}
          </div>
          <div className="flex justify-end">
            <div className="mx-3 whitespace-nowrap">
              <Button
                size="medium"
                variant={bagsType == 2 ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setBagsType(2)}
                style={{ textTransform: "none"}}
              // startIcon={<SvgIcon></SvgIcon>}
              >
                Data of 30 above HCF's
              </Button>
            </div>
            <div className="mx-3 whitespace-nowrap">
              <Button
                size="medium"
                variant={bagsType == 1 ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setBagsType(1)}
                style={{ textTransform: "none"}}
              // startIcon={<SvgIcon></SvgIcon>}
              >
                Data of 30 Below HCF's
              </Button>
            </div>

            <div className="mx-2 whitespace-nowrap">
              <Button
                size="medium"
                variant={bagsType == 3 ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setBagsType(3)}
                // startIcon={<SvgIcon></SvgIcon>}
                style={{ textTransform: "none"}}
              >
                All
              </Button>
            </div>

            <div className="mx-2 whitespace-nowrap">
              <Button
                size="medium"
                variant={'contained'}
                color="primary"
                onClick={printClick}
                // startIcon={<SvgIcon></SvgIcon>}
                style={{ textTransform: "none"}}
              >
                Print
              </Button>
            </div>
          </div>
        </div>

        <hr />
        <div className=" font-semibold text-lg text-center ">{isLoading}</div>

        {showMessage && showMessage.message.length != 0 ? <div className="py-2">
          <Toaster data={showMessage} className={''}></Toaster>
        </div> : <></>}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 ">
          <div className=" bg-white py-2 px-3  rounded shadow">
            <h6 className="m-2">
              Generated
            </h6>


            <div className="flex m-2 justify-between">
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{genWtSum} <span className="small text-[18px]"> Kg</span></h5>
              </div>
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{genCntSum}<span className="small text-[18px]"> Bags</span></h5>
              </div>
            </div>
          </div>
          <div className=" bg-white py-2 px-3  rounded shadow">
            <h6 className="m-2">
              Collected
            </h6>
            <div className="flex m-2 justify-between">
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{colWtSum}<span className="small text-[18px]"> Kg</span></h5>
              </div>
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{colCntSum} <span className="small text-[18px]"> Bags</span></h5>
              </div>
            </div>
          </div>
          <div className=" bg-white py-2 px-3  rounded shadow">
            <h6 className="m-2">
              Processed
            </h6>
            <div className="flex m-2 justify-between">
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{proWtSum} <span className="small text-[18px]"> Kg</span></h5>
              </div>
              <div className="bg-blue-100 rounded p-2 px-4">
                <h5>{proCntSum} <span className="small text-[18px]"> Bags</span></h5>
              </div>
            </div>
          </div>
        </div>
        {props.toggleState == undefined ? <div className="flex text-[18px] justify-end my-3  p-1 shadow-lg">
          <span className="">Kg</span>
          <OnOffToggle onToggleChange={handleToggleChange} />
          <span className="">Bags</span>
        </div> : <></>}

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4   ">
          <div className=" bg-white py-2 px-3  rounded shadow">
            <div className="flex justify-between m-2">
              <h6 className="">
                Generated Graph
              </h6>
            </div>
            <>
              <div className=" m-2 ">
                {toggleState ? (<>
                  <Chart
                    chartType="PieChart"
                    width={"100%"}
                    height={"250px"}
                    data={bagsType == 1 ? datachrtbBl : bagsType == 2 ? datachrtbAb : datachrtb }
                    options={optionsb}
                  ></Chart>
                </>) : <>
                  <Chart
                    chartType="PieChart"
                    width={"100%"}
                    height={"250px"}
                    data={bagsType == 1 ? datachrtBl : bagsType == 2 ? datachrtAb : datachrt }
                    options={options}
                  ></Chart>
                </>}
              </div>
              <div>
                <GraphDataTable data={bagsType == 1 ? dataColorGBl : bagsType == 2 ? dataColorGAb : dataColorG } />
              </div>
            </>

          </div>
          <div className=" bg-white py-2 px-3  rounded shadow">
            <div className="flex justify-between m-2">
              <h6 className="">
                Collected Graph
              </h6>
            </div>

            <div className="m-2 ">
              {toggleState ? (<>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"250px"}
                  data={bagsType == 1 ? datachrtCbBl : bagsType == 2 ? datachrtCbAb : datachrtCb}
                  options={optionsb}
                ></Chart>
              </>) : <>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"250px"}
                  data={bagsType == 1 ? datachrtCBl : bagsType == 2 ? datachrtCAb : datachrtC}
                  options={options}
                ></Chart>
              </>}
            </div>
            <div>
              <GraphDataTable data={bagsType == 1 ? dataColorCBl : bagsType == 2 ? dataColorCAb : dataColorC} />
            </div>


          </div>
          <div className=" bg-white py-2 px-3  rounded shadow">
            <div className="flex justify-between m-2">
              <h6 className="">
                Processed Graph
              </h6>
            </div>
            <div className="m-2">
              {toggleState ? (<>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"250px"}
                  data={bagsType == 1 ? datachrtPbBl : bagsType == 2 ? datachrtPbAb : datachrtPb}
                  options={optionsb}
                ></Chart>
              </>) : <>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"250px"}
                  data={bagsType == 1 ? datachrtPBl : bagsType == 2 ? datachrtPAb : datachrtP}
                  options={options}
                ></Chart>
              </>}
            </div>
            <div>
              <GraphDataTable data={bagsType == 1 ? dataColorPBl : bagsType == 2 ? dataColorPAb : dataColorP} />
            </div>

          </div>
        </div>
      </div>

    </>
  );
};

export default React.memo(DashBoardClrGrph);

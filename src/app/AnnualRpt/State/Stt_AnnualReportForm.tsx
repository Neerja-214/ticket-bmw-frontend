import React, { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@mui/material";
import '../../../login/login.css'
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  capitalize,
  capitalizeTerms,
  convertFldValuesToJson,
  convertFldValuesToString,
  getCmpId,
  getStateAbbreviation,
  getUsrnm,
  postLinux,
} from "../../../utilities/utilities";
import { validForm } from "../../../Hooks/validForm";
import WtrInput from "../../../components/reusable/nw/WtrInput";
import SaveIcon from "@mui/icons-material/Save";
import { useEffectOnce } from "react-use";
import { useToaster } from "../../../components/reusable/ToasterContext";
import { getLvl, getWho, control_focus } from "../../../utilities/cpcb";
import { nrjAxiosRequestBio, nrjAxiosRequestLinux } from "../../../Hooks/useNrjAxios";
import { getFldValue } from "../../../Hooks/useGetFldValue";
import WtrRsSelect from "../../../components/reusable/nw/WtrRsSelect";
import { Navigate, useNavigate } from "react-router-dom";

const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  TRIGGER_FORMONE: "trgfrmone",
  TRIGGER_FORM2: "trgfrmtwo",
  TRIGGER_FORM3: "trgfrmthree",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  DSBLDTEXT: "dsbld",
  DISABLE: "disable",
  NEWFRMDATA: "frmdatanw",
  FORM_DATA_DSTR: "frmdatadstr",
  FORM_DATA_NUMBER_OF_DSTR: "frmdatanumberdstr",
  FORM_DATA_HCFCPTV: "frmdataHcfcptv",
  FORM_DATA_CBWTF: "frmdataCBWTF",
  SETSTATECOMBO: "setStateCombo",
  SETRGDCOMBO: "setRgdCombo",


};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  trigger1: 0,
  trigger2: 0,
  trigger4: 0,
  textDts: "",
  textDts1: "",
  textDts2: "",
  textDts3: "",
  textDts4: "",
  mainId: 0,
  errMsg: [],
  openDrwr: false,
  frmData: "",
  disableA: 1,
  disableB: 1,
  disableC: 1,
  stateCombo: "",
  rgdCombo: "",


};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  trigger: number;
  trigger1: number;
  trigger2: number;
  trigger4: number;
  textDts: string;
  textDts1: string;
  textDts2: string;
  textDts3: string;
  textDts4: string;
  mainId: number;
  errMsg: any;
  openDrwr: boolean;
  frmData: string;
  disableA: number,
  disableB: number,
  disableC: number,
  stateCombo: string;
  rgdCombo: string;

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
      newstate.gid = ""
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
    case ACTIONS.TRIGGER_FORMONE:
      newstate.trigger1 = action.payload;
      if (action.payload === 1) {
        newstate.textDts1 = "";
        newstate.frmData1 = "";
        newstate.mainId = 0;
      }
      return newstate;
    case ACTIONS.TRIGGER_FORM2:
      newstate.trigger2 = action.payload;
      if (action.payload === 1) {
        newstate.textDts2 = "";
        newstate.frmDat2 = "";
        newstate.mainId = 0;
      }
      return newstate;
    case ACTIONS.TRIGGER_FORM3:
      newstate.trigger3 = action.payload;
      if (action.payload === 1) {
        newstate.textDts3 = "";
        newstate.frmDat3 = "";
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
    case ACTIONS.SETSTATECOMBO:
      newstate.stateCombo = action.payload;
      return newstate;
    case ACTIONS.SETRGDCOMBO:
      newstate.rgdCombo = action.payload;
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
    case ACTIONS.FORM_DATA_HCFCPTV:
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
    case ACTIONS.FORM_DATA_CBWTF:
      let dta3: string = "";
      let fldN3: any = utilities(2, action.payload, "");
      if (newstate.textDts3) {
        dta3 = newstate.textDts3 + "=";
        let d: any = utilities(1, dta3, fldN3);
        if (d) {
          dta3 = d;
        } else {
          dta3 = "";
        }
      }
      dta3 += action.payload;
      newstate.textDts3 = dta3;
      return newstate;
    case ACTIONS.FORM_DATA_DSTR:
      let dta1: string = "";
      let fldN1: any = utilities(2, action.payload, "");
      if (newstate.textDts1) {
        dta1 = newstate.textDts1 + "=";
        let d: any = utilities(1, dta1, fldN1);
        if (d) {
          dta1 = d;
        } else {
          dta1 = "";
        }
      }
      dta1 += action.payload;
      newstate.textDts1 = dta1;
      return newstate;
    //new state 

    case ACTIONS.FORM_DATA_NUMBER_OF_DSTR:
      let dta4: string = "";
      let fldN4: any = utilities(2, action.payload, "");
      if (newstate.textDts4) {
        dta4 = newstate.textDts4 + "=";
        let d: any = utilities(1, dta4, fldN4);
        if (d) {
          dta4 = d;
        } else {
          dta4 = "";
        }
      }
      dta4 += action.payload;
      newstate.textDts4 = dta4;
      return newstate;

    //  ebd case 
    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.CHECK_REQ:
      newstate.errMsg = action.payload;
      newstate.openDrwr = true;
      return newstate;
    case ACTIONS.CHECK_REQDONE:
      newstate.errMsg = [];
      newstate.openDrwr = false;
      return newstate;
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.DISABLE:
      if (newstate.disableA == 1) {
        newstate.disableA = 0
      } else {
        newstate.disableA = 1
      }
      return newstate
  }
};
//const [state, dispatch] = useReducer(reducer, initialState);





const Stt_AuthorizationAndWaste = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [sttValue, setSttValue] = useState<string>("");
  const [rgdValue, setRgdValue] = useState<string>("");

  const [validationMsg, setValidationMsg] = useState('')
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [hideInState, sethideInState] = useState(getLvl() == 'STT' ? true : false)


  // const hideInState = getLvl() == 'STT' ? true : false;
  const [editaprvlVal, setEditAprvVal] = useState('')
  const [selectedYear, setSelectedYear] = useState<number | string>(""); // Local state for selected year
  const [years, setYears] = useState<number[]>([]); // Store available years

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [currentYear - 1, currentYear]; // Last 3 years
    setYears(yearList); // Set years in state
    setSelectedYear(""); // Set default selected year (two years ago)
  }, []);

  const reqFlds = [
    // { fld: 'dt_year', msg: 'Select Year', chck: '1[length]' },
    { fld: "spcorg", msg: "Enter name of state organization", chck: "1[length]" },
    { fld: "spcnodf", msg: "Enter name of nodal officer", chck: "1[length]" },
    { fld: "nodfphn", msg: "Enter phone of nodal officer", chck: "[mob]" },
    { fld: "nodfeml", msg: "Enter Email of nodal officer", chck: "[email]" },
    { fld: "tothcf", msg: "Enter total Number of HCF", chck: "1[length]" },
    { fld: "totcbwtf", msg: "Enter total Number of CBWTF's", chck: "1[length]" },
    { fld: "totbdh", msg: "Enter Bedded Hospitals and Nursing Homes (Bedded)", chck: "1[length]" },
    // ===========================================================================================

    { fld: "totcld", msg: "Enter total Number of Clinics, Dispensaries", chck: "1[length]" },
    { fld: "totvet", msg: "Enter Total Vetinary Institutions", chck: "1[length]" },
    { fld: "totanh", msg: "Enter Total Animal Houses", chck: "1[length]" },
    { fld: "totpth", msg: "Enter Total Pathological laboratories", chck: "1[length]" },
    { fld: "totbld", msg: "Enter Total Blood Bank", chck: "1[length]" },
    { fld: "totcln", msg: "Enter Total Clinical Establishment", chck: "1[length]" },
    { fld: "totrsh", msg: "Enter Total Research Institution", chck: "1[length]" },
    { fld: "totaysh", msg: "Enter Total Ayush Clinic", chck: "1[length]" },
    { fld: "totbeds", msg: "Enter total Number of beds", chck: "1[length]" },
    { fld: "ocpinlq", msg: "Enter Number of occupiers installed liquid waste treatment facility", chck: "1[length]" },
    { fld: "biomwst", msg: "Enter Number of occupiers constituted BMW management Committees", chck: "1[length]" },
    // ===========================================================================================

    { fld: 'ttlapp', msg: 'Enter Total Number of HCF applied for authorization', chck: '1[length]' },
    { fld: 'ttlgrt', msg: 'Enter Total Number Authorized HCF', chck: '1[length]' },
    { fld: 'totcns', msg: 'Enter Total Number Under Consideration', chck: '1[length]' },
    { fld: 'totrej', msg: 'Enter Total Number Applications Rejected', chck: '1[length]' },
    { fld: 'ttlwth', msg: 'Enter Total Number of HCF in operation without authorization', chck: '1[length]' },

    { fld: 'ttlauthapp', msg: 'Enter Total Number  of Auth HCF out of total HCF', chck: '1[length]' },
    { fld: 'ttlunauthapp', msg: 'Enter Total Number  of Unauth HCF out of total HCF', chck: '1[length]' },
    // ===========================================================================================
    { fld: 'wstgnr', msg: 'Enter Quantity of BMW Generation in (kg/day)', chck: '1[length]' },
    { fld: 'wstgnrbd', msg: 'Enter Biomedical Waste Generated Bedded Hospital', chck: '1[length]' },
    { fld: 'wstgnrnbd', msg: 'Enter Biomedical Waste Generated Non Bedded', chck: '1[length]' },
    { fld: 'wstgnroth', msg: 'Enter Biomedical Waste Treated and Disposed', chck: '1[length]' },
    // ===========================================================================================
    { fld: 'hcfcptv', msg: "Enter Number of HCF's having captive treatment facilities", chck: '1[length]' },
    { fld: 'hcfcptvopr', msg: "Enter Number of captive incinerators operated by HCF's", chck: '1[length]' },
    { fld: 'cptvwst', msg: 'Enter Total BMW treated by captive treatment facilities by HCF in (kg/day)', chck: '1[length]' },
    { fld: 'capin', msg: 'Enter Number of captive incinerators complying to the norms', chck: '1[length]' },
    { fld: 'deepburpits', msg: 'Enter Number of HCF having deep burial pits', chck: '1[length]' },
    // ===========================================================================================
    { fld: 'cbwtfopr', msg: 'Enter Total CBWTF in Operation', chck: '1[length]' },
    { fld: 'cbwtfcns', msg: 'Enter Total Number CBWTF under Construction', chck: '1[length]' },
    { fld: 'wsttrt', msg: 'Enter Biomedical Waste Treated  and Disposed through CBWTF (Kg/day)', chck: '1[length]' },
    { fld: 'ttlcoem', msg: "Enter Number of CBWTF's that have installed OCMS", chck: '1[length]' },
    // { fld: 'monsys', msg: "Enter Number of CBWTF's that have installed Continuous Online Emission Monitoring Systems" },
    { fld: 'oprcbwtf', msg: "Enter Number of Operational CBWTFs" },

    // ===========================================================================================

    { fld: 'ttlbmw', msg: 'Enter Total Biomedical Waste', chck: '1[length]' },
    { fld: 'wstath', msg: 'Enter Total Biomedical Waste Disposed by Authorized Recycler (Kg/day)', chck: '1[length]' },

    // ===========================================================================================
    { fld: 'vlthcf', msg: 'Enter Total Number of Violations by HCF', chck: '1[length]' },
    { fld: 'vltcbtwf', msg: 'Enter Total Number of Violations by CBWTF', chck: '1[length]' },
    { fld: 'vltothr', msg: 'Enter Total Number of Violations by Others', chck: '1[length]' },
    { fld: 'shwhcf', msg: 'Enter Total Show cause notices/directions issued to defaulter HCF', chck: '1[length]' },
    { fld: 'shwcbtwf', msg: 'Enter Total Show cause notices/directions issued to defaulter CBWTF', chck: '1[length]' },
    { fld: 'shwothr', msg: 'Enter Total Show cause notices/directions issued to Others defaulter', chck: '1[length]' },

    // ===========================================================================================

    { fld: 'wrkspyr', msg: 'Enter Number of workshops/trainings conducted during the year', chck: '1[length]' },
    { fld: 'trnorg', msg: 'Enter Number of occupiers organised trainings', chck: '1[length]' },
    { fld: 'anlrp', msg: 'Enter Number of occupiers submitted Annual Report for the previous calendar year', chck: '1[length]' },
    { fld: 'pretr', msg: 'Enter Number of occupiers practising pre-treatment of lab microbiology and Bio-technology waste', chck: '1[length]' },

    // ===========================================================================================
    { fld: 'ttlvhclcol', msg: 'Enter Total Number of transportation vehicles used for collection of BMW on daily basis by the CBWTF', chck: '1[length]' },
    { fld: 'ttlhcfnomem', msg: 'Enter List of HCF not having membership with the CBWTF and neither having captive treatment facilities', chck: '1[length]' },
    { fld: 'ttltrg', msg: 'Enter Number of trainings organised by the Common BMW Treatment Facility operators', chck: '1[length]' },
    { fld: 'ttlnoacc', msg: "Enter Number of Accidents reported by the CBWTF's", chck: '1[length]' },
    // ===========================================================================================
  ];

  const reqFldsDstr = [
    { fld: 'dstr', msg: 'Enter Name of District', chck: '1[length]' },
    { fld: 'gnrt', msg: 'Enter Biomedical Waste Generated per day', chck: '1[length]' },
    { fld: 'inccp', msg: 'Enter Incinerator Capacity (kg/day)', chck: '1[length]' },
    { fld: 'autcp', msg: 'Enter Autclave Capacity (kg/day)', chck: '1[length]' },
    { fld: 'depcp', msg: 'Enter Deep Capacity (kg/day)', chck: '1[length]' }
  ]

  const reqFldNumberDstr = [
    { fld: 'nodstr', msg: 'Enter Number of District', chck: '1[length]' },
  ]
  const reqsFldsHcfCptv = [
    { fld: 'hcfcpt', msg: 'Enter Name of Captive HCF', chck: '1[length]' },
    { fld: 'hcfadd', msg: 'Enter Address HCF', chck: '1[length]' },
    { fld: 'wstred', msg: 'Enter Biomedical Waste Red per day', chck: '1[length]' },
    { fld: 'wstylw', msg: 'Enter Biomedical Waste Yelow per day', chck: '1[length]' },
    { fld: 'wstwht', msg: 'Enter Biomedical Waste White per day', chck: '1[length]' },
    { fld: 'wstblu', msg: 'Enter Biomedical Waste Blue per day', chck: '1[length]' },
    { fld: 'wstcyt', msg: 'Enter Biomedical Waste Cytotoxic per day', chck: '1[length]' },
    { fld: 'inccp', msg: 'Enter Incinerator Capacity per day', chck: '1[length]' },
    { fld: 'autcp', msg: 'Enter AutoClave Capacity per day', chck: '1[length]' },
    { fld: 'depcp', msg: 'Enter Deep Burial Capacity per day', chck: '1[length]' },
    { fld: 'othrcp', msg: 'Enter Other Capacity per day', chck: '1[length]' },
    { fld: 'inctrd', msg: 'Enter Incinerator Treated per day', chck: '1[length]' },
    { fld: 'auttrd', msg: 'Enter AutoClave Treated per day', chck: '1[length]' },
    { fld: 'deptrd', msg: 'Enter Deep Treated per day', chck: '1[length]' },
    { fld: 'othrtrd', msg: 'Enter Other Treated per day', chck: '1[length]' }
  ];

  const reqsFldsCbwtf = [
    { fld: 'nmaddcbwtf', msg: "Name and Address of the CBWTF's", chck: '1[length]' },
    // { fld: 'ashcbwtf', msg: 'Enter Ash Cbwtf', chck: '1[length]' },
    { fld: 'autocbwtf', msg: 'Enter Autoclave Capacity (kg/day)', chck: '1[length]' },
    { fld: 'autonocbwtf', msg: 'Enter Autoclave Capacity Number', chck: '1[length]' },
    { fld: 'autottlcbwtf', msg: 'Enter Autoclave Capacity Total (kg/day)', chck: '1[length]' },
    { fld: 'ctycbwtf', msg: 'Enter Name of the City', chck: '1[length]' },
    { fld: 'cvrcbwtf', msg: 'Enter Coverage Area in KMS', chck: '1[length]' },
    { fld: 'deepcbwtf', msg: 'Enter Deep Burial Pits Capacity (kg/day)', chck: '1[length]' },
    { fld: 'deepnocbwtf', msg: 'Enter Deep Burial Pits Capacity Number', chck: '1[length]' },
    { fld: 'deepttlcbwtf', msg: 'Enter Deep Burial Pits Capacity Total (kg/day)', chck: '1[length]' },
    { fld: 'effcbwtf', msg: 'Enter Effluent Treatment CBWTF Capacity (kg/day)', chck: '1[length]' },
    { fld: 'effnocbwtf', msg: 'Enter Effluent Treatment CBWTF Capacity Number', chck: '1[length]' },
    { fld: 'effttlcbwtf', msg: 'Enter Effluent Treatment CBWTF Capacity Total (kg/day)', chck: '1[length]' },
    // { fld: 'etpcbwtf', msg: 'Enter ETP Sludge ', chck: '1[length]' },
    { fld: 'etpdispcbwtf', msg: 'Enter ETP Sludge  Disposed by', chck: '1[length]' },
    { fld: 'etpqntycbwtf', msg: 'Enter ETP Sludge Quantity', chck: '1[length]' },
    { fld: 'gpscbwtf', msg: 'Enter GPS Coordinates', chck: '1[length]' },
    { fld: 'hydrcbwtf', msg: 'Enter Hydroclave Capacity (kg/day)', chck: '1[length]' },
    { fld: 'hydrnocbwtf', msg: 'Enter Hydroclave Capacity Number', chck: '1[length]' },
    { fld: 'hydrttlcbwtf', msg: 'Enter Hydroclave Capacity Total (kg/day)', chck: '1[length]' },
    { fld: 'inccpcbwtf', msg: 'Enter Incinerator Capacity (kg/day)', chck: '1[length]' },
    { fld: 'inccpnocbwtf', msg: 'Enter Incinerator Capacity Number', chck: '1[length]' },
    { fld: 'inccpttlcbwtf', msg: 'Enter Incinerator Capacity Total (kg/day)', chck: '1[length]' },
    { fld: 'incdispcbwtf', msg: 'Enter Incinerator  Disposed', chck: '1[length]' },
    { fld: 'incqntycbwtf', msg: 'Enter Incinerator Quantity', chck: '1[length]' },
    { fld: 'micrpcbwtf', msg: 'Enter Microwave Capacity (kg/day)', chck: '1[length]' },
    { fld: 'micrpnocbwtf', msg: 'Enter Microwave Capacity Number', chck: '1[length]' },
    { fld: 'micrpttlcbwtf', msg: 'Enter Microwave Capacity Total (kg/day)', chck: '1[length]' },
    { fld: 'othrcpcbwtf', msg: 'Enter Other Capacity (kg/day)', chck: '1[length]' },
    { fld: 'othrcpnocbwtf', msg: 'Enter Other Capacity Number', chck: '1[length]' },
    { fld: 'othrcpttlcbwtf', msg: 'Enter Other Capacity Total (kg/day)', chck: '1[length]' },
    // { fld: 'plscbwtf', msg: 'Enter Plastic Cbwtf', chck: '1[length]' },
    { fld: 'plsdispcbwtf', msg: 'Enter Plastic Disposed by', chck: '1[length]' },
    { fld: 'plsqntycbwtf', msg: 'Enter  Plastic Quantity', chck: '1[length]' },
    { fld: 'psmcbwtf', msg: 'Enter Plasma pyrolysis  Capacity (kg/day)', chck: '1[length]' },
    { fld: 'psmnocbwtf', msg: 'Enter Plasma pyrolysis Capacity Number', chck: '1[length]' },
    { fld: 'psmttlcbwtf', msg: 'Enter Plasma pyrolysis Capacity Total (kg/day)', chck: '1[length]' },
    { fld: 'qntcbwtf', msg: 'Enter Total Quantity of Cbwtf', chck: '1[length]' },
    // { fld: 'shpcbwtf', msg: 'Enter Sharps Cbwtf', chck: '1[length]' },
    { fld: 'shpdispcbwtf', msg: 'Enter Sharps Disposed by', chck: '1[length]' },
    { fld: 'shpqntycbwtf', msg: 'Enter Sharps Quantity', chck: '1[length]' },
    { fld: 'shrcbwtf', msg: 'Enter Shredder Capacity (kg/day)', chck: '1[length]' },
    { fld: 'shrnocbwtf', msg: 'Enter Shredder Capacity Number', chck: '1[length]' },
    { fld: 'shrpcbwtf', msg: 'Enter Sharps Capacity (kg/day)', chck: '1[length]' },
    { fld: 'shrpnocbwtf', msg: 'Enter Shredder Capacity (kg/day)', chck: '1[length]' },
    { fld: 'shrpttlcbwtf', msg: 'Enter Shredder Capacity Total (kg/day)', chck: '1[length]' },
    { fld: 'shrttlcbwtf', msg: 'Enter Sharps Capacity Total (kg/day)', chck: '1[length]' },
    { fld: 'ttlbdcbwtf', msg: 'Enter Total Number of beds Cover', chck: '1[length]' },
    { fld: 'ttlhcfcbwtf', msg: 'Enter Total Number of HCF being Coverd', chck: '1[length]' },
    { fld: 'addresscbwtf', msg: 'Enter Address of CBWTF', chck: '1[length]' },
    { fld: 'contcbwtf', msg: 'Enter Contact PErson Name of CBWTF', chck: '1[length]' },
    { fld: 'telphcbwtf', msg: 'Enter Telephone Number of CBWTF', chck: '[mob]' },
    { fld: 'gpslongcbwtf', msg: 'Enter Total GPS Coordinates', chck: '1[length]' }
  ]

  const [year, setYear] = useState("");
  const [loadOnDemand, setLoadOnDemand] = useState("")
  const [apprvlOption, setApprvlOption] = useState('')
  const navigate = useNavigate();
  const [selectStateName, setSelectSatename] = useState('')
  const [selectrgdName, setSelectRgdName] = useState('')

  useEffectOnce(() => {

    let value1 = new Date().getFullYear()
    setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}`)
    setApprvlOption(`id][1=txt][Yes$^id][2=txt][No`)
    // setOptionComittee("id][1=txt][Yes$^id][2=txt][No")
    if (hideInState) {
      dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board` })
    }
  })

  const GetList = () => {

    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    setTimeout(function () {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
    }, 800);
    let who = '';
    let lvl = 'CPCB';
    let editVal = '1'

    who = selectStateName ? selectStateName : '';
    let usrnm = getUsrnm();
    let cmpid = getCmpId();
    let payload: any = postLinux(lvl + '=' + who + "=" + year + "=state_ar=" + usrnm + '=' + cmpid + '=' + editVal, 'show_AR_filing')
    return nrjAxiosRequestLinux("show_AR_filing", payload);

  }

  // useEffect(()=>{
  //   dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  // },[loadOnDemand])

  const GridLoaded = () => {
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
  };
  const onRowSelected = (data: string) => { };
  const [formDataGet, setFormData] = useState('')
  const [bmwCaptiv, setBmwCaptive] = useState('')
  const [bmwst, setBmWst] = useState('')

  useEffect(() => {
    if (bmwst || bmwCaptiv) {
      let ttlbmw: number = 0
      ttlbmw = ttlbmw + Number(bmwst) + Number(bmwCaptiv)
      dispatch({ type: ACTIONS.FORM_DATA, payload: 'ttlbmw][' + ttlbmw });
    }

  }, [bmwst, bmwCaptiv])

  const onChangeYear = (year: number) => {
    setSelectedYear(year); // Update the local state with the selected year
    // You can also dispatch other actions if needed here

    let select_year_val: any = year
    setYear(select_year_val)
    if (select_year_val == '') {
      setYear('')
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    }
  };


  const onChangeDts = (data: string) => {
    let fldNme: any = utilities(2, data, "");
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    if (fldNme == 'dt_yearid') {
      // let select_year_val: any = getFldValue(data, 'dt_yearid')
      setYear(getFldValue(data, 'dt_yearid').split('|')[0])
      // dispatch({ type: ACTIONS.FORM_DATA, payload: `dt_yearid][${select_year_val}=dt_year][${select_year_val}` });
    }
    if (fldNme == 'edit_apprvlid') {
      setEditAprvVal(getFldValue(data, 'edit_apprvlid').split('|')[1]);
    }

    if (fldNme == 'cptvwst') {
      setBmwCaptive(getFldValue(data, 'cptvwst'))
    }
    if (fldNme == 'wsttrt') {
      setBmWst(getFldValue(data, 'wsttrt'))
    }

    if (fldNme === 'ttlgrt' || fldNme === 'totcns') {
      let authHcf = Number(getFldValue(data, 'ttlapp'));
      let grantedHcf = Number(getFldValue(data, 'ttlgrt'));
      let rejHcf = Number(getFldValue(data, 'totrej'));
      let consHcf = Number(getFldValue(data, 'totcns'));

      // Handle the case where any of the values might be NaN
      if (isNaN(authHcf) || isNaN(grantedHcf) || isNaN(rejHcf) || isNaN(consHcf)) {
        setShowValidationMessage(true);
      } else {
        if (authHcf !== grantedHcf + rejHcf + consHcf) {
          setShowValidationMessage(true);
        } else {
          setShowValidationMessage(false);
        }
      }
    }

  };

  const onChangeDstr = (data: string) => {
    let fldNme: any = utilities(2, data, "");
    // check   field value after decimal point  is alow 3 digit in kg
    dispatch({ type: ACTIONS.FORM_DATA_DSTR, payload: data });
    // const fieldsCheckDecimal = ['gnrt', 'inccp', 'autcp', 'depcp', 'othrcp'];

    // fieldsCheckDecimal.forEach(fld => {

    //   if (fldNme == fld) {
    //     const val = getFldValue(data, fld);
    //     // Check if value includes a decimal point
    //     if (val.includes('.')) {
    //       const parts = val.split('.');
    //       if (parts[1].length <= 3) {
    //         dispatch({ type: ACTIONS.FORM_DATA_DSTR, payload: `${fld}][${val}` });
    //       } else {
    //         showToaster(['in (kg/day) after decimal  only 3 digit allow'], 'error');
    //         // remove last digit when user input  more than 3 digit
    //         const trimmedValue = `${parts[0]}.${parts[1].slice(0, 3)}`;
    //         dispatch({ type: ACTIONS.FORM_DATA_DSTR, payload: `${fld}][${trimmedValue}` })
    //       }
    //     }
    //   }

    // });


  };

  const onChangeNoDstrn = (data: string) => {
    let fld: any = utilities(2, data, "");
    dispatch({ type: ACTIONS.FORM_DATA_NUMBER_OF_DSTR, payload: data });

  }



  const onChangeHcfCptv = (data: string) => {
    let fldNme: any = utilities(2, data, "");
    dispatch({ type: ACTIONS.FORM_DATA_HCFCPTV, payload: data });
    // const fieldsCheckDecimal = ['wstred', 'wstylw', 'wstwht', 'wstblu', 'wstcyt', 'inccp', 'autcp', 'depcp', 'othrcp', 'inctrd', 'auttrd', 'deptrd', 'othrtrd'];
    // // check   field value after decimal point  is alow 3 digit in kg
    // fieldsCheckDecimal.forEach(fld => {
    //   if (fldNme == fld) {
    //     const val = getFldValue(data, fld);
    //     // Check if value includes a decimal point
    //     if (val.includes('.')) {
    //       const parts = val.split('.');
    //       if (parts[1].length <= 3) {
    //         dispatch({ type: ACTIONS.FORM_DATA_HCFCPTV, payload: `${fld}][${val}` });
    //       } else {
    //         showToaster(['in (kg/day) after decimal  only 3 digit allow'], 'error');
    //         // remove last digit when user input  more than 3 digit
    //         const trimmedValue = `${parts[0]}.${parts[1].substring(0, 3)}`;
    //         dispatch({ type: ACTIONS.FORM_DATA_HCFCPTV, payload: `${fld}][${trimmedValue}` })
    //       }
    //     }
    //   }

    // });

  };



  function disabledFieldYearNotSelect() {
    let disabel = false
    if (year !== '') {
      disabel = false
      return disabel
    } else {
      disabel = true
      return disabel
    }
  }

  useEffect(() => {
    disabledFieldYearNotSelect()
  }, [year])

  const onChangeCbwtfCptv = (data: string) => {

    let fldNme: any = utilities(2, data, "");
    dispatch({ type: ACTIONS.FORM_DATA_CBWTF, payload: data });
    // const fieldsCheckDecimal = ['qntcbwtf', 'inccpcbwtf', 'psmcbwtf', 'autocbwtf', 'hydrcbwtf', 'micrpcbwtf', 'shrcbwtf', 'shrpcbwtf', 'deepcbwtf', 'othrcpcbwtf', 'effcbwtf', 'inccpttlcbwtf',
    //   'psmttlcbwtf', 'autottlcbwtf', 'hydrttlcbwtf', 'micrpttlcbwtf', 'shrttlcbwtf', 'shrpttlcbwtf', 'deepttlcbwtf', 'othrcpttlcbwtf', 'effttlcbwtf'
    // ]
    // fieldsCheckDecimal.forEach(fld => {
    //   if (fldNme == fld) {
    //     const val = getFldValue(data, fld);
    //     // Check if value includes a decimal point
    //     if (val.includes('.')) {
    //       const parts = val.split('.');
    //       if (parts[1].length <= 3) {
    //         dispatch({ type: ACTIONS.FORM_DATA_CBWTF, payload: `${fld}][${val}` });
    //       } else {
    //         showToaster(['in (kg/day) after decimal  only 3 digit allow'], 'error');
    //         // remove last digit when user input  more than 3 digit
    //         const trimmedValue = `${parts[0]}.${parts[1].substring(0, 3)}`;
    //         dispatch({ type: ACTIONS.FORM_DATA_CBWTF, payload: `${fld}][${trimmedValue}` })
    //       }
    //     }
    //   }

    // });

  };

  const HandleSaveClick = () => {
    let formData: any = '';

    // if (formDataGet) {
    //   formData = formDataGet;
    // } else {
    formData = state.textDts;
    // }
    formData = convertFldValuesToJson(formData);
    formData['ar_year'] = year;
    formData['cmpid'] = getCmpId() || "";
    formData['usrnm'] = getUsrnm() || "";
    formData['what'] = "state_ar";
    formData['districtData'] = districtBmwData;
    formData['hcfCaptiveData'] = hcfCptvData;
    formData['sttnm'] = getStateAbbreviation(capitalize(getWho()));
    formData['sttname'] = capitalize(getWho())
    formData['sttname'] = capitalize(getWho());
    formData['what'] = 'state_ar';
    formData['cbwtfData'] = cbwtfData;

    fillEmptyValue(formData);
    formData['allow_edit'] = 0;
    return nrjAxiosRequestLinux("AR_filing", formData)
  };

  const fillEmptyValue = (formData: any) => {
    let emptyfld = ["totvet", "totanh", "totpth", "totbld", "totcln", "totrsh", "totaysh", "totcns", "cbwtfcns", "ttlcoem", "wstath", "vlthcf", "vltcbtwf", "vltothr", "shwhcf", "shwcbtwf", "shwothr", "wrkspyr", "ocpinlq", "capin", "deepburpits", "trnorg", "biomwst", "anlrp", "pretr", "oprcbwtf", "ttlbmw", "nodstr"]
    for (const fld of emptyfld) {
      if (!getFldValue(state.textDts, fld)) {
        formData[fld] = '0';
      }
    }
  }

  const { showToaster, hideToaster } = useToaster();

  const svClick = () => {

    let api: string = state.textDts;
    let api1: string = state.textDts1;
    let api2: string = state.textDts2;
    let api3: string = state.textDts3;
    let api4: string = state.textDts4;

    let msg: any = validForm(api, reqFlds);

    if (msg && msg[0]) {
      showToaster(msg, 'error');
      control_focus(msg[0], reqFlds)
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }

    if (Number(getFldValue(api, 'ttlapp')) - Number(getFldValue(api, 'ttlgrt')) < 0) {
      showToaster(['Total Number of HCF applied for authorization could not be lesser than total Number of authorization applied '], 'error');
      return;
    }
    if (Number(getFldValue(api, 'ttlapp')) !== Number(getFldValue(api, 'ttlgrt')) + Number(getFldValue(api, 'totrej')) + Number(getFldValue(api, 'totcns'))) {
      // focus(getFldValue(api, 'ttlapp'))
      showToaster(['Total Number of HCF applied for authorization could  be equal than Total Number of HCF granted authorization  and total Number of authorization rejected or total Number of under Consideration  '], 'error');
      return;
    }
    if (Number(getFldValue(api, 'ttlapp')) - Number(getFldValue(api, 'totrej')) < 0) {
      showToaster(['Total Number of applied authorization cannot be lesser than total Number of authorization rejected '], 'error');
      return;
    }
    if (Number(getFldValue(api, 'ttlapp')) - Number(getFldValue(api, 'ttlwth')) < 0) {
      showToaster(['Total Number of applied authorization cannot be lesser than total Number of HCF in operation without autorization'], 'error');
      return;
    }
    if (Number(getFldValue(api, 'wstgnr')) !== Number(getFldValue(api, 'wstgnrbd')) + Number(getFldValue(api, 'wstgnrnbd')) + Number(getFldValue(api, 'wstgnroth'))) {
      showToaster(['Quantity of BMW Generation in (kg/day) could be equal than Total Biomedical Waste Generated by Bedded Hospital and Total Biomedical Waste Generated by Non Bedded Hospital or Total Biomedical Waste Generated Other (kg/day)'], 'error');
      return;
    }
    if (Number(getFldValue(api, 'wstgnr')) - Number(getFldValue(api, 'wstgnrbd')) < 0) {
      showToaster(['Quantity of BMW Generation (in kg/day) cannot be lesser than Total Biomedical Waste Generated by Bedded Hospital'], 'error');
      return;
    }
    if (Number(getFldValue(api, 'wstgnr')) - Number(getFldValue(api, 'wstgnrnbd')) < 0) {
      showToaster(['Quantity of BMW Generation in (kg/day) cannot be lesser than Total Biomedical Waste Generated by Non Bedded Hospital'], 'error');
      return;
    }
    if (Number(getFldValue(api, 'wstgnr')) - Number(getFldValue(api, 'wstgnroth')) < 0) {
      showToaster(['Quantity of BMW Generation in (kg/day) cannot be lesser than Total Biomedical Waste Generated by Other'], 'error');
      return;
    }
    // if (Number(getFldValue(api, 'wstgnr')) - Number(getFldValue(api, 'wstgnrbd')) < 0) {
    //   showToaster(['Quantity of BMW Generation (in kg/day) cannot be lesser than Total Biomedical Waste Generated Bedded Hospital Kg/day'], 'error');
    //   return;
    // }

    if (Number(getFldValue(api, 'ttlbmw')) !== Number(getFldValue(api, 'cptvwst')) + Number(getFldValue(api, 'wsttrt'))) {
      showToaster(['Total Biomedical Waste could be  equal than sum of Total Biomedical Waste Treated and Disposed through CBWTF (kg/day) or Total BMW treated by captive treatment facilities by HCF in (kg/day) '], 'error');
      return;
    }
    if (Number(getFldValue(api4, 'nodstr')) > Number(districtBmwData.length)) {
      showToaster(['Add district details is Equal to Number of districts mentioned'], 'error');
      return;

    }


    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetch();
  };

  const svdQry = (data: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    let dt: any = GetResponseLnx(data);
    if (dt.status == 'Success') {
      showToaster([dt.message], 'success')
      refetchGetData()
    }
    else {
      showToaster([dt.message ? dt.message : 'Something went wrong! please try again'], 'error')
    }
  };


  const { data, refetch } = useQuery({
    queryKey: ["svQryAnnlcbwtf1", state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });


  // const { data: dataSvdEdiapvl, refetch: refetEdit } = useQuery({
  //   queryKey: ["svOldFormState", editaprvlVal],
  //   queryFn: GetList,
  //   enabled: true,
  //   staleTime: 0,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  // });

  const [editdisabled, SetEditDisbled] = useState(false)

  useEffectOnce(() => {
    if (!hideInState) {

      let data: any = sessionStorage.getItem('sttAnnlRpt');
      if (data) {
        data = JSON.parse(data)
        let _data = convertFldValuesToString(data)
        console.log(_data)
        dispatch({ type: ACTIONS.SETFORM_DATA, payload: _data });
        let districtBmwData = data['districtData']
        let hcfCptvData = data['hcfCaptiveData']
        let cbwtfData = data['cbwtfData']
        let stateName = data['sttname']
        let rgdName = data['rgd']
        let yearSelect = data['dt_yearid'] ? data['dt_yearid'] : ''
        let editAllow = data['allow_edit'] ? data['allow_edit'] : 0
        if (Number(editAllow) == 1) {
          SetEditDisbled(true)

        } else {
          if (!data['sttnm']) {
            SetEditDisbled(true)
          }
        }
        setYear(yearSelect)
        setEditAprvVal(editAllow)
        setSelectSatename(stateName)
        setSelectRgdName(rgdName)

        setDistrictBmwData(districtBmwData);
        setHcfCptvData(hcfCptvData)
        setCbwtfData(cbwtfData)
      }
    } else {

      refetchGetData()
    }
  })


  const GetSvData = (year: string) => {

    let who = getStateAbbreviation(capitalize(getWho()));

    if (hideInState) {
      dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board=dt_yearid][${year}=dt_year][${year}` })
      clrFunct();
      if (year) {
        let payload: any = postLinux('STT=' + who + "=" + year + "=state_ar=" + capitalize(getWho()) + " State Pollution Control Board", 'getSpcbAnnualReport')
        return nrjAxiosRequestLinux("get_AR_filing", payload);
      }
      else {
        clrFunct();
        dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board` })
      }
    }

  };

  const ShowData = (dataSvd: any) => {
    let dt: any = GetResponseLnx(dataSvd);


    if (hideInState) {
      if (year) {

        if (dt.status !== "Failed") {
          dt = convertFldValuesToString(dt)
          dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
          let districtBmwData = dataSvd.data['districtData']
          let hcfCptvData = dataSvd.data['hcfCaptiveData']
          let cbwtfData = dataSvd.data['cbwtfData']
          let editAllow = data['stateedit'] ? data['stateedit'] : 0
          if (Number(editAllow) == 1) {
            SetEditDisbled(true)
          } else {
            if (!data['sttnm']) {
              SetEditDisbled(true)
            } else {
              sethideInState(false)
            }
          }

          setDistrictBmwData(districtBmwData);
          setHcfCptvData(hcfCptvData)
          setCbwtfData(cbwtfData)



        }
        else {
          clrFunct();
          sethideInState(true)
          dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board=dt_yearid][${year}=dt_year][${year}` })
          setDistrictBmwData([]);
          setHcfCptvData([])
          setCbwtfData([])
        }
      }
      else {
        if (Array.isArray(dt)) {
          dispatch({ type: ACTIONS.NEWROWDATA, payload: dt });
        }
        else {
          clrFunct();
          dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board` })
        }
      }
    }

  };

  useEffect(() => {
    if (hideInState) {
      dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board` })
    }
  }, [state.textDts])

  const { data: dataSvd, refetch: refetchGetData } = useQuery({
    queryKey: ["svOldannlauth1", year],
    queryFn: () => GetSvData(year),
    enabled: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  const clrFunct = () => {
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    setDistrictBmwData([]);
    setHcfCptvData([])
    setCbwtfData([])
    // setTimeout(() => {
    //   dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    // }, 300)
  }

  const clrFunctDstr = () => {
    dispatch({ type: ACTIONS.TRIGGER_FORMONE, payload: 1 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORMONE, payload: 0 });
    }, 500)
  }

  const clrFunctHcfCptv = () => {
    dispatch({ type: ACTIONS.TRIGGER_FORM2, payload: 1 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM2, payload: 0 });
    }, 500)
  }

  const clrFunctCbwtfCptv = () => {
    dispatch({ type: ACTIONS.TRIGGER_FORM3, payload: 1 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM3, payload: 0 });
    }, 500)
  }

  const Seperator = (props: any) => {
    return (
      <>
        <div className="my-7">
          <div className="font-semibold" style={{ fontSize: '16px', color: "rgb(50, 21, 125)" }}>
            {/* <div className="font-semibold" style={{ color: '#009ED6' }}> */}
            {props.heading}
            <div className="text-sm text-black">
              {capitalizeTerms(props.smallheading)}
            </div>
          </div>
          <div className="mt-2" style={{ border: '1px solid rgb(81, 52, 152)' }}>
          </div>
        </div>
      </>
    )
  }

  const [districtBmwData, setDistrictBmwData] = useState<any[]>([])

  type districtData = {
    dstr: "",
    gnrt: "",
    inccp: "",
    autcp: "",
    depcp: "",
    othrcp: ""
  }

  const addDstrClick = () => {
    let api: string = state.textDts1;
    let dstrNumber: string = state.textDts4
    let msg: any = validForm(api, reqFldsDstr);
    let errMsg: any = validForm(dstrNumber, reqFldNumberDstr);
    if ((msg && msg[0])) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }
    if ((errMsg && errMsg[0])) {
      showToaster(errMsg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }
    let dataJson: districtData = convertFldValuesToJson(api);
    let dstrNumberJson = convertFldValuesToJson(dstrNumber);
    let foundFlag: boolean = false;
    let indexFound = -1;
    for (let i = 0; i < districtBmwData.length; i++) {
      if (districtBmwData[i].dstr == dataJson.dstr) {
        foundFlag = true;
        indexFound = i;
        break;
      }
    }
    if (foundFlag) {
      let tempDistData = [...districtBmwData];
      tempDistData[indexFound] = { dstr: dataJson.dstr, gnrt: dataJson.gnrt, inccp: dataJson.inccp, autcp: dataJson.autcp, depcp: dataJson.depcp, othrcp: dataJson.othrcp || "0" }
      setDistrictBmwData(tempDistData);
      let localData = { who: getWho(), year: year, data: tempDistData }
      localStorage.setItem('districtData', JSON.stringify(localData))
    }
    else {
      if (Number(dstrNumberJson.nodstr) > Number(districtBmwData.length)) {
        setDistrictBmwData([...districtBmwData, { dstr: dataJson.dstr, gnrt: dataJson.gnrt, inccp: dataJson.inccp, autcp: dataJson.autcp, depcp: dataJson.depcp, othrcp: dataJson.othrcp || "0" }])
        let localData = { who: getWho(), year: year, data: [...districtBmwData, { dstr: dataJson.dstr || "", gnrt: dataJson.gnrt || "0", inccp: dataJson.inccp || "0", autcp: dataJson.autcp || "0", depcp: dataJson.depcp || "0", othrcp: dataJson.othrcp || "0" }] }
        localStorage.setItem('districtData', JSON.stringify(localData))
      } else {
        showToaster(['Add district details is not add  greater than Number of district'], 'error');
      }

    }
    clrFunctDstr();
  }

  const deleteDstrData = (dstr: string) => {
    if (hideInState) {
      let tempData = districtBmwData.filter((res: any) => (res.dstr != dstr))
      let localData = { who: getWho(), year: year, data: tempData }
      localStorage.setItem('districtData', JSON.stringify(localData))
      setDistrictBmwData(tempData);
    }
  }

  useEffect(() => {
    if (localStorage.getItem('districtData')) {
      let tempData = JSON.parse(localStorage.getItem('districtData') || "{}");
      if (tempData) {
        if (tempData.who && tempData.who == getWho() && tempData.year == year) {
          setDistrictBmwData(tempData.data);
        }
      }
    }
  }, [year])

  const [hcfCptvData, setHcfCptvData] = useState<any[]>([])
  const [cbwtfData, setCbwtfData] = useState<any[]>([])


  type hcfCptvDatatype = {
    hcfcpt: "",
    hcfadd: "",
    wstred: "",
    wstylw: "",
    wstwht: "",
    wstcyt: "",
    inccp: "",
    autcp: "",
    depcp: "",
    othrcp: "",
    inctrd: "",
    auttrd: "",
    deptrd: "",
    othrtrd: "",
    wstblu: "",

  }


  type cbwtfCptvDatatype = {
    // ashcbwtf: "",
    autocbwtf: "",
    autonocbwtf: "",
    autottlcbwtf: "",
    ctycbwtf: "",
    cvrcbwtf: "",
    deepcbwtf: "",
    deepnocbwtf: "",
    deepttlcbwtf: "",
    effcbwtf: "",
    effnocbwtf: "",
    effttlcbwtf: "",
    // etpcbwtf: "",
    etpdispcbwtf: "",
    etpqntycbwtf: "",
    gpscbwtf: "",
    hydrcbwtf: "",
    hydrnocbwtf: "",
    hydrttlcbwtf: "",
    inccpcbwtf: "",
    inccpnocbwtf: "",
    inccpttlcbwtf: "",
    incdispcbwtf: "",
    incqntycbwtf: "",
    micrpcbwtf: "",
    micrpnocbwtf: "",
    micrpttlcbwtf: "",
    nmaddcbwtf: "",
    othrcpcbwtf: "",
    othrcpnocbwtf: "",
    othrcpttlcbwtf: "",
    // plscbwtf: "",
    plsdispcbwtf: "",
    plsqntycbwtf: "",
    psmcbwtf: "",
    psmnocbwtf: "",
    psmttlcbwtf: "",
    qntcbwtf: "",
    // shpcbwtf: "",
    shpdispcbwtf: "",
    shpqntycbwtf: "",
    shrcbwtf: "",
    shrnocbwtf: "",
    shrpcbwtf: "",
    shrpnocbwtf: "",
    shrpttlcbwtf: "",
    shrttlcbwtf: "",
    ttlbdcbwtf: "",
    ttlhcfcbwtf: "",
    addresscbwtf: "",
    contcbwtf: "",
    telphcbwtf: "",
    gpslongcbwtf: ""
  }

  const addCbwtfCptvClick = () => {

    let api: string = state.textDts3;
    let msg: any = validForm(api, reqsFldsCbwtf);
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }
    let dataJson: cbwtfCptvDatatype = convertFldValuesToJson(api);
    let foundFlag: boolean = false;
    let indexFound = -1;
    for (let i = 0; i < cbwtfData.length; i++) {
      if (cbwtfData[i].nmaddcbwtf == dataJson.nmaddcbwtf) {
        foundFlag = true;
        indexFound = i;
        break;
      }
    }
    if (foundFlag) {
      let tempDistData = [...cbwtfData];
      tempDistData[indexFound] = {

        // ashcbwtf: dataJson.ashcbwtf || "0",
        autocbwtf: dataJson.autocbwtf || "0",
        autonocbwtf: dataJson.autonocbwtf || "0",
        autottlcbwtf: dataJson.autottlcbwtf || "0",
        ctycbwtf: dataJson.ctycbwtf || "NA",
        cvrcbwtf: dataJson.cvrcbwtf || "NA",
        deepcbwtf: dataJson.deepcbwtf || "0",
        deepnocbwtf: dataJson.deepnocbwtf || "0",
        deepttlcbwtf: dataJson.deepttlcbwtf || "0",
        effcbwtf: dataJson.effcbwtf || "0",
        effnocbwtf: dataJson.effnocbwtf || "0",
        effttlcbwtf: dataJson.effttlcbwtf || "0",
        // etpcbwtf: dataJson.etpcbwtf || "0",
        etpdispcbwtf: dataJson.etpdispcbwtf || "0",
        etpqntycbwtf: dataJson.etpqntycbwtf || "0",
        gpscbwtf: dataJson.gpscbwtf || "0",
        hydrcbwtf: dataJson.hydrcbwtf || "0",
        hydrnocbwtf: dataJson.hydrnocbwtf || "0",
        hydrttlcbwtf: dataJson.hydrttlcbwtf || "0",
        inccpcbwtf: dataJson.inccpcbwtf || "0",
        inccpnocbwtf: dataJson.inccpnocbwtf || "0",
        inccpttlcbwtf: dataJson.inccpttlcbwtf || "0",
        incdispcbwtf: dataJson.incdispcbwtf || "0",
        incqntycbwtf: dataJson.incqntycbwtf || "0",
        micrpcbwtf: dataJson.micrpcbwtf || "0",
        micrpnocbwtf: dataJson.micrpnocbwtf || "0",
        micrpttlcbwtf: dataJson.micrpttlcbwtf || "0",
        nmaddcbwtf: dataJson.nmaddcbwtf || "NA",
        othrcpcbwtf: dataJson.othrcpcbwtf || "0",
        othrcpnocbwtf: dataJson.othrcpnocbwtf || "0",
        othrcpttlcbwtf: dataJson.othrcpttlcbwtf || "0",
        // plscbwtf: dataJson.plscbwtf || "0",
        plsdispcbwtf: dataJson.plsdispcbwtf || "0",
        plsqntycbwtf: dataJson.plsqntycbwtf || "0",
        psmcbwtf: dataJson.psmcbwtf || "0",
        psmnocbwtf: dataJson.psmnocbwtf || "0",
        psmttlcbwtf: dataJson.psmttlcbwtf || "0",
        qntcbwtf: dataJson.qntcbwtf || "0",
        // shpcbwtf: dataJson.shpcbwtf || "0",
        shpdispcbwtf: dataJson.shpdispcbwtf || "0",
        shpqntycbwtf: dataJson.shpqntycbwtf || "0",
        shrcbwtf: dataJson.shrcbwtf || "0",
        shrnocbwtf: dataJson.shrnocbwtf || "0",
        shrpcbwtf: dataJson.shrpcbwtf || "0",
        shrpnocbwtf: dataJson.shrpnocbwtf || "0",
        shrpttlcbwtf: dataJson.shrpttlcbwtf || "0",
        shrttlcbwtf: dataJson.shrttlcbwtf || "0",
        ttlbdcbwtf: dataJson.ttlbdcbwtf || "0",
        ttlhcfcbwtf: dataJson.ttlhcfcbwtf || "0",
        addresscbwtf: dataJson.addresscbwtf || "NA",
        contcbwtf: dataJson.contcbwtf || "NA",
        telphcbwtf: dataJson.telphcbwtf || "NA",
        gpslongcbwtf: dataJson.gpslongcbwtf || "0"
      }
      setCbwtfData(tempDistData);
      let localData = { who: getWho(), year: year, data: tempDistData }
      localStorage.setItem('cbwtfData', JSON.stringify(localData))
    }
    else {
      let finalData: any[] = [...cbwtfData,
      {
        // ashcbwtf: dataJson.ashcbwtf || "0",
        autocbwtf: dataJson.autocbwtf || "0",
        autonocbwtf: dataJson.autonocbwtf || "0",
        autottlcbwtf: dataJson.autottlcbwtf || "0",
        ctycbwtf: dataJson.ctycbwtf || "NA",
        cvrcbwtf: dataJson.cvrcbwtf || "NA",
        deepcbwtf: dataJson.deepcbwtf || "0",
        deepnocbwtf: dataJson.deepnocbwtf || "0",
        deepttlcbwtf: dataJson.deepttlcbwtf || "0",
        effcbwtf: dataJson.effcbwtf || "0",
        effnocbwtf: dataJson.effnocbwtf || "0",
        effttlcbwtf: dataJson.effttlcbwtf || "0",
        // etpcbwtf: dataJson.etpcbwtf || "0",
        etpdispcbwtf: dataJson.etpdispcbwtf || "0",
        etpqntycbwtf: dataJson.etpqntycbwtf || "0",
        gpscbwtf: dataJson.gpscbwtf || "0",
        hydrcbwtf: dataJson.hydrcbwtf || "0",
        hydrnocbwtf: dataJson.hydrnocbwtf || "0",
        hydrttlcbwtf: dataJson.hydrttlcbwtf || "0",
        inccpcbwtf: dataJson.inccpcbwtf || "0",
        inccpnocbwtf: dataJson.inccpnocbwtf || "0",
        inccpttlcbwtf: dataJson.inccpttlcbwtf || "0",
        incdispcbwtf: dataJson.incdispcbwtf || "0",
        incqntycbwtf: dataJson.incqntycbwtf || "0",
        micrpcbwtf: dataJson.micrpcbwtf || "0",
        micrpnocbwtf: dataJson.micrpnocbwtf || "0",
        micrpttlcbwtf: dataJson.micrpttlcbwtf || "0",
        nmaddcbwtf: dataJson.nmaddcbwtf || "NA",
        othrcpcbwtf: dataJson.othrcpcbwtf || "0",
        othrcpnocbwtf: dataJson.othrcpnocbwtf || "0",
        othrcpttlcbwtf: dataJson.othrcpttlcbwtf || "0",
        // plscbwtf: dataJson.plscbwtf || "0",
        plsdispcbwtf: dataJson.plsdispcbwtf || "0",
        plsqntycbwtf: dataJson.plsqntycbwtf || "0",
        psmcbwtf: dataJson.psmcbwtf || "0",
        psmnocbwtf: dataJson.psmnocbwtf || "0",
        psmttlcbwtf: dataJson.psmttlcbwtf || "0",
        qntcbwtf: dataJson.qntcbwtf || "0",
        // shpcbwtf: dataJson.shpcbwtf || "0",
        shpdispcbwtf: dataJson.shpdispcbwtf || "0",
        shpqntycbwtf: dataJson.shpqntycbwtf || "0",
        shrcbwtf: dataJson.shrcbwtf || "0",
        shrnocbwtf: dataJson.shrnocbwtf || "0",
        shrpcbwtf: dataJson.shrpcbwtf || "0",
        shrpnocbwtf: dataJson.shrpnocbwtf || "0",
        shrpttlcbwtf: dataJson.shrpttlcbwtf || "0",
        shrttlcbwtf: dataJson.shrttlcbwtf || "0",
        ttlbdcbwtf: dataJson.ttlbdcbwtf || "0",
        ttlhcfcbwtf: dataJson.ttlhcfcbwtf || "0",
        addresscbwtf: dataJson.addresscbwtf || "NA",
        contcbwtf: dataJson.contcbwtf || "NA",
        telphcbwtf: dataJson.telphcbwtf || "NA",
        gpslongcbwtf: dataJson.gpslongcbwtf || "0"
      }
      ]
      setCbwtfData(finalData)
      let localData = { who: getWho(), year: year, data: finalData }
      localStorage.setItem('cbwtfData', JSON.stringify(localData))
    }
    clrFunctCbwtfCptv();
  }


  const addHcfCptvClick = () => {
    let api: string = state.textDts2;
    let msg: any = validForm(api, reqsFldsHcfCptv);
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }
    let dataJson: hcfCptvDatatype = convertFldValuesToJson(api);
    let foundFlag: boolean = false;
    let indexFound = -1;
    for (let i = 0; i < hcfCptvData.length; i++) {
      if (hcfCptvData[i].hcfcpt == dataJson.hcfcpt) {
        foundFlag = true;
        indexFound = i;
        break;
      }
    }
    if (foundFlag) {
      let tempDistData = [...hcfCptvData];
      tempDistData[indexFound] = {
        hcfcpt: dataJson.hcfcpt || "",
        hcfadd: dataJson.hcfadd || "",
        wstred: dataJson.wstred || "0",
        wstylw: dataJson.wstylw || "0",
        wstwht: dataJson.wstwht || "0",
        wstcyt: dataJson.wstcyt || "0",
        inccp: dataJson.inccp || "0",
        autcp: dataJson.autcp || "0",
        depcp: dataJson.depcp || "0",
        othrcp: dataJson.othrcp || "0",
        inctrd: dataJson.inctrd || "0",
        auttrd: dataJson.auttrd || "0",
        deptrd: dataJson.deptrd || "0",
        othrtrd: dataJson.othrtrd || "0",
        wstblu: dataJson.wstblu || "0",
      }
      setHcfCptvData(tempDistData);
      let localData = { who: getWho(), year: year, data: tempDistData }
      localStorage.setItem('hcfCptvData', JSON.stringify(localData))
    }
    else {
      let finalData: any[] = [...hcfCptvData,
      {
        hcfcpt: dataJson.hcfcpt || "",
        hcfadd: dataJson.hcfadd || "",
        wstred: dataJson.wstred || "0",
        wstylw: dataJson.wstylw || "0",
        wstwht: dataJson.wstwht || "0",
        wstcyt: dataJson.wstcyt || "0",
        inccp: dataJson.inccp || "0",
        autcp: dataJson.autcp || "0",
        depcp: dataJson.depcp || "0",
        othrcp: dataJson.othrcp || "0",
        inctrd: dataJson.inctrd || "0",
        auttrd: dataJson.auttrd || "0",
        deptrd: dataJson.deptrd || "0",
        othrtrd: dataJson.othrtrd || "0",
        wstblu: dataJson.wstblu || "0"
      }
      ]
      setHcfCptvData(finalData)
      let localData = { who: getWho(), year: year, data: finalData }
      localStorage.setItem('hcfCptvData', JSON.stringify(localData))
    }
    clrFunctHcfCptv();
  }

  const deleteHcfCptvData = (dstr: string) => {
    if (hideInState) {
      let tempData = hcfCptvData.filter((res: any) => (res.dstr != dstr))
      let localData = { who: getWho(), year: year, data: tempData }
      localStorage.setItem('hcfCptvData', JSON.stringify(localData))
      setHcfCptvData(tempData);
    }
  }

  useEffect(() => {
    if (localStorage.getItem('hcfCptvData')) {
      let tempData = JSON.parse(localStorage.getItem('hcfCptvData') || "{}");
      if (tempData) {
        if (tempData.who && tempData.who == getWho() && tempData.year == year) {
          setHcfCptvData(tempData.data);
        }
      }
    }

    // refetchB()
  }, [year])

  const deleteCbwtfData = (cbwtf: string) => {
    if (hideInState) {
      let tempData = cbwtfData.filter((res: any) => (res.nmaddcbwtf != cbwtf))
      let localData = { who: getWho(), year: year, data: tempData }
      localStorage.setItem('cbwtfData', JSON.stringify(localData))
      setCbwtfData(tempData);
    }

  }

  useEffect(() => {
    if (localStorage.getItem('cbwtfData')) {
      let tempData = JSON.parse(localStorage.getItem('cbwtfData') || "{}");
      if (tempData) {
        if (tempData.who && tempData.who == getWho() && tempData.year == year) {
          setCbwtfData(tempData.data);
        }
      }
    }
  }, [year])



  const getDataState = () => {

    let payload: any = {};
    if (rgdValue) {
      payload = postLinux(rgdValue, "sttrgd");
    } else {
      payload['cmpid'] = getCmpId() || "";
      payload['usrnm'] = getUsrnm() || "";

    }
    return nrjAxiosRequestBio('sttrgd', payload)

  };
  const sttCombo = (datastt: any) => {

    if (datastt && datastt.status == 200 && datastt.data) {
      let i: number = 0;
      let sttCombo: string = "";
      let dt: string = GetResponseWnds(datastt);
      let ary: any = datastt.data.data;
      let uniqueAry = new Map();
      ary.forEach((element: any) => {
        uniqueAry.set(element.fltr, element);
      });

      uniqueAry.forEach((value: any, keys: any) => {
        if (sttCombo) {
          sttCombo += "$^";
        }
        sttCombo += "id][" + value["fltr"] + "=";
        sttCombo += "txt][" + value["drpdwn"];
      })

      while (i < uniqueAry?.entries.length) {

        i += 1;
      }
      dispatch({ type: ACTIONS.SETSTATECOMBO, payload: sttCombo });
      return;
    }
  };

  const { data: data2, refetch: refetchState } = useQuery({
    queryKey: ["stateGet", rgdValue],
    queryFn: getDataState,
    enabled: true,
    retry: false,
    staleTime: 200,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: sttCombo
  });

  const GetDataRgd = () => {
    let payload: any = {};
    return nrjAxiosRequestBio('rgdlst', payload);
  };

  const rgdCombo = (datastt: any) => {
    if (datastt && datastt.status == 200 && datastt.data) {
      let i: number = 0;
      let strCmbo: string = "";
      let dt: any = GetResponseLnx(datastt);
      let ary: any = dt.data;
      while (Array.isArray(ary) && i < ary.length) {
        if (strCmbo) {
          strCmbo += "$^";
        }
        strCmbo += "id][" + ary[i]["drpdwn"] + "=";
        strCmbo += "txt][" + ary[i]["drpdwn"];
        i += 1;
      }
      dispatch({ type: ACTIONS.SETRGDCOMBO, payload: strCmbo });
      return;
    }
  };


  const { data: datac, refetch: fetchRgd } = useQuery({
    queryKey: ["GetDataRgd"],
    queryFn: GetDataRgd,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: rgdCombo,
  });

  useEffectOnce(() => {
    fetchRgd();
  })

  const onChangeRgd = (data: string) => {

    let fldN: any = utilities(2, data, "");
    if (fldN == 'rgdid') {
      setRgdValue(getFldValue(data, 'rgdid').split('|')[0])
    }
    setSttValue(getFldValue(data, 'sttid').split('|')[0])
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };


  const [isHovered, setIsHovered] = useState(false);

  const handleMouseOver = () => {
    setIsHovered(true);
  };

  const handleMouseOut = () => {
    setIsHovered(false);
  };



  // const { data: datab, refetch: refetchB } = useQuery({
  //   queryKey: ["getQry", year, sttValue],
  //   queryFn: GetData,
  //   enabled: true,
  //   staleTime: Number.POSITIVE_INFINITY,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  //   onSuccess: ShowGetData,
  // });

  return (

    <div className="flex flex-col items-center justify-center  w-full bg-gray-100 p-6 overflow-auto">
      <style>
        {`
        body {
          overflow-x: hidden;
        }
  
        @keyframes marquee {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
  
        .animate-marquee {
          display: inline-block;
          animation: marquee 15s linear infinite;
          white-space: nowrap;
          width: 100%;
          padding-left: 100%;
        }
      `}
      </style>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-center text-black mb-2">
        {capitalizeTerms("SPCB/PCC Annual report")}
      </h1>

      {/* Marquee Line (Fixed Width) */}
      <div className="w-full max-w-8xl overflow-hidden bg-gray-200 py-2">
        <div className="animate-marquee text-lg text-gray-700 font-medium">
          Format for submission of the annual report information on bio-medical waste management...
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white p-5 rounded-lg shadow-md w-full max-w-8xl flex flex-col justify-center items-center">

        {/* Year Selection */}
        {hideInState && <div className="mb-4 w-full">
          <label className="block text-gray-700 font-medium mb-2">Select year</label>
          <div className="flex space-x-4">
            {[2022, 2023, 2024].map((yr) => (
              <label key={yr} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="year"
                  value={yr}
                  checked={Number(year) === yr}
                  onChange={() => setYear(yr.toString())}
                  className="form-radio text-blue-600"
                />
                <span>{yr}</span>
              </label>
            ))}
          </div>
        </div>}

        <div className="w-full flex flex-wrap md:flex-nowrap items-center justify-between gap-x-4">

          {/* Select Regional & SPCB */}
          <div className="w-full md:w-auto flex-1 flex gap-x-4 min-w-0">
            {!hideInState && (
              <>
                <div className="w-auto md:w-1/3 max-w-xs">
                  <WtrRsSelect
                    Label="State/UT"
                    fldName="sttid"
                    idText="txtsttid"
                    onChange={onChangeRgd}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    loadOnDemand={state.stateCombo}
                    allwZero={"0"}
                    fnctCall={true}
                    dbCon={"1"}
                    typr={"1"}
                    dllName={""}
                    fnctName={""}
                    parms={'0'}
                    allwSrch={true}
                    speaker={"Select SPCB"}
                    delayClose={1000}
                    placement="bottom"
                    displayFormat="1"
                    disable={!hideInState}
                  />
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          {!hideInState && (
            <div className="w-full md:w-auto flex justify-end gap-x-4 mt-4 md:mt-0">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                onClick={() => navigate(`/spcb_authorizationAndWasteCp`)}
              >
                Back
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => GetList()}
                disabled={editdisabled}
              >
                Allow edit access
              </button>
            </div>
          )}
        </div>


        <div className="w-full mt-6 overflow-auto">
          <Seperator heading="Part-1 (Summary of information) " />
          <WtrInput
            displayFormat={"3"}
            Label="Name of the SPCB"
            fldName="spcorg"
            idText="txtspcorg"
            onChange={onChangeDts}
            dsabld={true}
            callFnFocus=""
            dsbKey={false}
            validateFn="1[length]"
            blockNumbers={true}
            allowNumber={false}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? "Enter Name of SPCB minimum 5 characters" : ""}
            delayClose={1000}
            placement="right"
            ClssName=""
            ToolTip="Enter a Name without special character"
            sNo={"1.1"}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Name of nodal officer"
            fldName="spcnodf"
            idText="txtspcnodf"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            blockNumbers={true}
            callFnFocus=""
            dsbKey={false}
            validateFn="1[length]"
            allowNumber={false}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? "Enter name of nodal officerr of minimum 5 character" : ""}
            delayClose={1000}
            placement="bottom"
            ClssName=""
            ToolTip="Enter a Name without special character"
            sNo={"1.2"}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Contact no of nodal officer"
            fldName="nodfphn"
            idText="txtnodfphn"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn="[mob]"
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? "Enter contact no. of nodal officer" : ""}
            delayClose={1000}
            placement="left"
            ClssName=""
            ToolTip="Enter whole Number only"
            sNo={"1.3"}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="E-mail id of nodal officer"
            fldName="nodfeml"
            idText="txtnodfeml"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            unblockSpecialChars={true}
            validateFn="[email]"
            allowNumber={false}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? "Enter E-mail id of nodal officer" : ""}
            delayClose={1000}
            ClssName=""
            sNo={"1.4"}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Total number of HCFs"
            fldName="tothcf"
            idText="txttothcf"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn="1[length]"
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? "Enter Total number of HCFs" : ""}
            delayClose={1000}
            ClssName=""
            ToolTip="Enter whole Number only"
            sNo={"1.5"}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Total number of CBWTFs"
            fldName="totcbwtf"
            idText="txttotcbwtf"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn="1[length]"
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? "Enter total number of CBWTFs" : ""}
            delayClose={1000}
            ClssName=""
            ToolTip="Enter whole Number only"
            sNo={"1.6"}

          ></WtrInput>

        </div>

        <div className="w-full mt-6 overflow-auto">
          <Seperator heading="Information of HCFs"></Seperator>
          <WtrInput
            displayFormat={"3"}
            Label="Bedded hospitals and nursing homes (bedded)"
            fldName="totbdh"
            idText="txttotbdh"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn="1[length]"
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? "Enter total Number of HCF" : ''}
            delayClose={1000}
            ClssName=""
            ToolTip="Enter whole Number only"
            sNo={"2.1"}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Clinics and dispensaries"
            fldName="totcld"
            idText="txttotcld"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn="1[length]"
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? "Enter Total Number of Clinical & Dispensary" : ""}
            delayClose={1000}
            ClssName=""
            ToolTip="Enter whole Number only"
            sNo={"2.2"}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Veterinary institutions"
            fldName="totvet"
            idText="txttotvet"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn=""
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            sNo={"2.3"}
            speaker={hideInState ? "Enter Vetinary institutions" : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Animal houses"
            fldName="totanh"
            idText="txttotanh"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn=""
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            sNo={"2.4"}
            speaker={hideInState ? "Enter Animal houses" : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Pathological laboratories"
            fldName="totpth"
            idText="txttotpth"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn=""
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            sNo={"2.5"}
            speaker={hideInState ? "Enter Total Pathological laboratories" : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Blood bank"
            fldName="totbld"
            idText="txttotbld"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn=""
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            sNo={"2.6"}
            speaker={hideInState ? "Enter Blood bank" : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Clinical establishment"
            fldName="totcln"
            idText="txttotcln"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn=""
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            sNo={"2.7"}
            speaker={hideInState ? "Enter Clinical establishment" : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Research institution"
            fldName="totrsh"
            idText="txttotrsh"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn=""
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            sNo={"2.8"}
            speaker={hideInState ? "Enter Research institution" : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Ayush"
            fldName="totaysh"
            idText="txttotaysh"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn=""
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            sNo={"2.9"}
            speaker={hideInState ? "Enter ayush" : ""}

          ></WtrInput>

          <WtrInput
            displayFormat="3"
            Label="Number of beds"
            fldName="totbeds"
            idText="txttotbeds"
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=""
            dsbKey={false}
            validateFn="1[length]"
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? "Enter number of beds" : ""}
            delayClose={1000}
            ClssName=""
            ToolTip="Enter whole Number only"
            sNo={"2.10"}

          ></WtrInput>
          <WtrInput
            displayFormat={"3"}
            Label='Number of occupiers installed liquid waste treatment facility'
            fldName='ocpinlq'
            idText='txtocpinlq'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"2.11"}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            speaker={hideInState ? "Enter number of occupiers installed liquid waste treatment facility" : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Number of occupiers constituted biomedical management committees'
            fldName='biomwst'
            idText='txtbiomwst'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            sNo={"2.12"}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            speaker={hideInState ? "Enter number of occupiers constituted biomedical management committees" : ""}

          ></WtrInput>

        </div>

        <div className="w-full mt-6 overflow-auto">

          <Seperator heading="Authorization status"></Seperator>
          {/*<table className="table table-bordered min-w-full border border-gray-200"> */}
          {/* <thead className="bg-gray-50">
                   <tr className="py-3 bg-gray-100">
                     <th className="border p-3" scope="col">S. Number.</th>
                     <th className="border p-3" scope="col">Particulars</th>
                     <th className="border p-3" scope="col">Details</th>
                   </tr>

                 </thead> */}

          <WtrInput
            displayFormat="3"
            Label='Total number of authorized HCFs out of total HCFs'
            fldName='ttlauthapp'
            idText='txtttlauthapp'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? 'Enter total number of authorized HCFs out of total HCFs' : ""}
            delayClose={1000}
            placement='right'
            ToolTip="Enter whole Number only"
            sNo={"3.1"}

          ></WtrInput>

          <WtrInput
            displayFormat="3"
            Label='Total number of unauthorized HCFs out of total HCFs'
            fldName='ttlunauthapp'
            idText='txtttlunauthapp'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? 'Enter Total number of unauthorized HCFs out of total HCFs' : ""}
            delayClose={1000}
            placement='right'
            ToolTip="Enter whole Number only"
            sNo={"3.2"}

          ></WtrInput>

          <WtrInput
            displayFormat="3"
            Label={`Total number of HCFs applied for authorization ${year ? `(in year ${year})` : ''}`}
            fldName='ttlapp'
            idText='txtttlapp'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? 'Enter total number of HCFs applied for authorization' : ""}
            delayClose={1000}
            placement='right'
            ClssName=''
            ToolTip="Enter whole Number only"
            sNo={"3.3"}

          ></WtrInput>


          <WtrInput
            displayFormat="3"
            Label={`Total number of HCFs granted authorization ${year ? `(in year ${year})` : ''}`}
            fldName='ttlgrt'
            idText='txtttlgrt'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? 'Enter number of HCFs granted authorization' : ''}
            delayClose={1000}
            placement='bottom'
            ClssName=''
            ToolTip="Enter whole Number only"
            sNo={"3.4"}

          ></WtrInput>

          <WtrInput
            Label={`Total number of applications under consideration ${year ? `(in year ${year})` : ''}`}
            displayFormat="3"
            fldName='totcns'
            idText='txttotcns'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            sNo={"3.5"}

            speaker={hideInState ? 'Enter total number of applications under consideration' : ""}
          ></WtrInput>

          <WtrInput
            displayFormat="3"
            Label={`Total number of applications rejected ${year ? `(in year ${year})` : ''}`}
            speaker={hideInState ? 'Enter total number of applications rejected' : ""}
            fldName='totrej'
            idText='txttotrej'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            sNo={"3.6"}

            ToolTip="Enter whole Number only"
          ></WtrInput>

          <WtrInput
            displayFormat="3"
            Label={`Total number of HCFs in operation without authorization ${year ? `(in year ${year})` : ''}`}
            speaker={hideInState ? "Enter total number of HCFs in operation without authorization" : ''}
            fldName='ttlwth'
            idText='txtttlwth'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            sNo={"3.7"}
            ToolTip="Enter whole Number only"
          ></WtrInput>
          {/* </table> */}


        </div>

        <div className="w-full mt-6 overflow-auto">
          <Seperator heading=" Bio-medical waste informartion "></Seperator>

          <WtrInput
            displayFormat={"3"}
            Label='Quantity of biomedical waste generated (kg/day)'
            fldName='wstgnr'
            idText='txtwstgnr'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? 'Enter quantity of biomedical waste generated (kg/day)' : ""}
            delayClose={1000}
            ClssName=''
            noofDecimals={3}
            sNo={"4.1"}

            ToolTip="please enclose District Wise BMW Generation as per Part-2"></WtrInput>
          <WtrInput
            displayFormat={"3"}
            Label='Total biomedical waste generated from bedded HCFs (kg/day)'
            fldName='wstgnrbd'
            idText='txtwstgnrbd'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? 'Enter total biomedical waste generated from bedded HCFs (kg/day)' : ""}
            delayClose={1000}
            ClssName=''
            sNo={"4.2"}
            noofDecimals={3}

            ToolTip="Enter Number only"></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Total biomedical waste generated from non-bedded HCFs (kg/day)'
            fldName='wstgnrnbd'
            idText='txtwstgnrnbd'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? 'Enter total biomedical waste generated from non-bedded HCFs (kg/day)' : ""}
            delayClose={1000}
            sNo={"4.3"}
            ClssName=''
            noofDecimals={3}
            ToolTip="Enter Number only"></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Total biomedical waste generated from other sources (kg/day)'
            speaker={hideInState ? 'Enter total biomedical waste generated from other sources (kg/day)' : ""}
            fldName='wstgnroth'
            idText='txtwstgnroth'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            sNo={"4.4"}
            ToolTip="Enter whole Number only"
            noofDecimals={3}
          ></WtrInput>
          {/* </table> */}

        </div>

        <div className="w-full mt-6 overflow-auto">
          <Seperator heading="Information of captive treatment facilities"></Seperator>
          {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
          {/* <thead className="bg-gray-50">
                     <tr className="py-3 bg-gray-100">
                       <th className="border p-3" scope="col">S. Number.</th>
                       <th className="border p-3" scope="col">Particulars</th>
                       <th className="border p-3" scope="col">Details</th>
                     </tr>

                   </thead> */}
          <WtrInput
            displayFormat="3"
            Label="In case HCFs are having captive treatment facility, provide information regarding the number of HCFs having captive treatment facilities"
            speaker={hideInState ? "Enter Number of HCF's having captive treatment facilitie" : ""}
            fldName='hcfcptv'
            idText='txthcfcptv'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            delayClose={1000}
            placement='right'
            ToolTip="Enter whole Number only"
            sNo={"5.1"}

            ClssName='' ></WtrInput>

          <WtrInput
            displayFormat="3"
            Label="Number of captive incinerators operated by HCFs"
            speaker={hideInState ? "Enter number of captive incinerators operated by HCFs" : ""}
            fldName='hcfcptvopr'
            idText='txthcfcptvopr'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            delayClose={1000}
            placement='bottom'
            sNo={"5.1.1"}
            ClssName=''

            ToolTip="Enter whole Number only"
          ></WtrInput>


          <WtrInput
            displayFormat={"3"}
            Label='NNumber of captive incinerators complying with the norms'
            fldName='capin'
            idText='txtcapin'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"5.1.2"}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"

            speaker={hideInState ? 'Enter number of captive incinerators complying with the norms' : ""}
          ></WtrInput>
          <WtrInput
            displayFormat={"3"}
            Label='Number of HCFs having deep burial pits'
            fldName='deepburpits'
            idText='txtdeepburpits'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"5.1.3"}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            speaker={hideInState ? 'Enter number of HCFs having deep burial pits' : ""}
          ></WtrInput>
          {/* </table> */}

          <WtrInput
            displayFormat="3"
            Label='Total biomedical waste treated in captive treatment facilities (kg/day)'
            fldName='cptvwst'
            idText='txtcptvwst'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? 'Enter total biomedical waste treated in captive treatment facilities (kg/day)' : ""}
            delayClose={1000}
            placement='right'
            ToolTip="Enter whole Number only"
            sNo={"5.2"}
            noofDecimals={3}
            ClssName='' ></WtrInput>

        </div>

        <div className="w-full mt-6 overflow-auto">
          <Seperator heading={`Information of  common bio waste treatment facilities`}></Seperator>
          {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
          {/* <thead className="bg-gray-50">
                     <tr className="py-3 bg-gray-100">
                       <th className="border p-3" scope="col">S. Number.</th>
                       <th className="border p-3" scope="col">Particulars</th>
                       <th className="border p-3" scope="col">Details</th>
                     </tr>

                   </thead> */}

          <WtrInput
            displayFormat={"3"}
            Label='Number of Operational CBWTFs'
            fldName='oprcbwtf'
            idText='txtcbwtfopr'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"6.1"}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            delayClose={1000}
            placement='right'
            speaker={hideInState ? 'Enter number of Operational CBWTFs' : ""}
          ></WtrInput>

          {/* <WtrInput
                   displayFormat={"3"}
                   Label={'Total Number CBWTF in Operation'}
                   fldName='cbwtfopr'
                   idText='txtcbwtfopr'
                   onChange={onChangeDts}
                   dsabld={!hideInState || disabledFieldYearNotSelect()}
                   callFnFocus=''
                   dsbKey={false}
                   upprCase={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   selectedValue={state.textDts}
                   clrFnct={state.trigger}
                   speaker={'Enter Total CBWTF in Operation'}
                   delayClose={1000}
                   sNo={"6.1"}
                   placement='right'
                   ClssName=''
                   ToolTip="Enter whole Number only">
                   </WtrInput> */}

          <WtrInput
            displayFormat={"3"}
            Label='Number of CBWTFs under construction'
            fldName='cbwtfcns'
            idText='txtcbwtfcns'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"6.2"}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            speaker={hideInState ? 'Enter number of CBWTFs under construction' : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Number of CBWTFs having deep burial pits (deep burials are not allowed in CBWTFs)'
            fldName='cbwtfopr'
            idText='txtcbwtfopr'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"6.3"}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            delayClose={1000}
            placement='right'
            speaker={hideInState ? 'Enter number of CBWTFs having deep burial pits (deep burials are not allowed in CBWTFs)' : ""}
          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Total biomedical waste treated and disposed of through CBWTFs (kg/day)'
            fldName='wsttrt'
            idText='txtwsttrt'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn='1[length]'
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={hideInState ? 'Enter total biomedical waste treated and disposed of through CBWTFs (kg/day)' : ""}
            delayClose={1000}
            placement='left' ClssName=''
            sNo={"6.4"}
            noofDecimals={3}
            ToolTip="Enter Number only" ></WtrInput>

          <WtrInput
            displayFormat="3"
            Label="Number of CBWTFs installed COEMS"
            fldName='ttlcoem'
            idText='txtttlcoem'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            sNo={"6.5"}
            speaker={hideInState ? "Enter number of CBWTFs installed COEMS" : ""}
          ></WtrInput>
          {/* <WtrInput
                   displayFormat={"3"}
                   Label="Number of CBWTF's that have installed Continuous COEMS"
                   fldName='monsys'
                   idText='txtmonsys'
                   onChange={onChangeDts}
                   dsabld={!hideInState || disabledFieldYearNotSelect()}
                   callFnFocus=''
                   dsbKey={false}
                   upprCase={false}
                   validateFn=''
                   allowNumber={true}
                   selectedValue={state.frmData}
                   clrFnct={state.trigger}
                   sNo={"6.5"}
                   ToolTip="Enter whole Number only"
                   speaker={"Enter Number of CBWTF's that have installed Continuous COEMS"}

                 ></WtrInput> */}

        </div>

        <div className="w-full mt-6 overflow-auto">

          <Seperator heading={`Biomedical waste treatment & disposal`}></Seperator>


          <WtrInput
            displayFormat={"3"}
            Label='Total biomedical waste treated and disposed of (this value is equal to the sum of points 5.2 and 6.4)'
            fldName='ttlbmw'
            idText='txtwttlbmw'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            sNo={"7.1"}
            ToolTip="Enter Number only"
            speaker={hideInState ? 'Enter total Biomedical Waste Treated' : ""}
          ></WtrInput>
          <WtrInput
            displayFormat={"3"}
            Label='Total treated biomedical waste disposed through authorized recyclers (kg/day)'
            fldName='wstath'
            idText='txtwstath'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            sNo={"7.2"}
            ToolTip="Enter Number only"
            speaker={hideInState ? 'Enter treated biomedical waste disposed through authorized recyclers (kg/day)' : ""}
            noofDecimals={3}
          ></WtrInput>

        </div>


        <div className="w-full mt-6 overflow-auto">
          <Seperator heading={`Violations and action taken `}></Seperator>
          <WtrInput
            displayFormat={"3"}
            Label='Number of HCFs violating BMWM Rules, 2016'
            fldName='vlthcf'
            idText='txtvlthcf'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            sNo={"8.1"}
            ToolTip="Enter whole Number only"
            speaker={hideInState ? 'Enter total Number of HCFs violating BMWM Rules, 2016' : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Number of CBWTFs violating BMWM Rules, 2016'
            fldName='vltcbtwf'
            idText='txtvltcbtwf'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"8.2"}
            clrFnct={state.trigger}
            speaker={hideInState ? 'Enter number of CBWTFs violating BMWM Rules, 2016' : ""}
            ToolTip="Enter whole Number only"

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Number of violations by others'
            fldName='vltothr'
            idText='txtvltothr'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"8.3"}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            speaker={hideInState ? 'Enter number of violations by others' : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Show cause notices/directions issued to number of violating HCFs'
            fldName='shwhcf'
            idText='txtshwhcf'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            sNo={"8.4"}
            ToolTip="Enter whole Number only"
            speaker={hideInState ? 'Enter show cause notices/directions issued to number of violating HCFs' : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Show cause notices/directions issued to number of violating CBWTFs'
            fldName='shwcbtwf'
            idText='txtshwcbtwf'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            sNo={"8.5"}
            ToolTip="Enter whole Number only"
            speaker={hideInState ? 'Enter show cause notices/directions issued to number of violating CBWTFs' : ""}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Number of show cause notices/directions issued to other violators'
            fldName='shwothr'
            idText='txtshwothr'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"8.6"}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"

            speaker={hideInState ? 'Enter number of show cause notices/directions issued to other violators' : ""}
          ></WtrInput>

        </div>


        <div className="w-full mt-6 overflow-auto">
          <Seperator heading={`Other information`}></Seperator>
          <WtrInput
            displayFormat={"3"}
            Label='Number of workshops/trainings conducted during the previous year'
            fldName='wrkspyr'
            idText='txtwrkspyr'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"9.1"}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"

            speaker={hideInState ? 'Enter number of workshops/trainings conducted during the previous year' : ""}
          ></WtrInput>


          <WtrInput
            displayFormat={"3"}
            Label='Number of occupiers organised trainings during the previous year'
            fldName='trnorg'
            idText='txttrnorg'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            sNo={"9.2"}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"
            speaker={hideInState ? 'Enter number of occupiers organised trainings during the previous year' : ""}

          ></WtrInput>


          <WtrInput
            displayFormat={"3"}
            Label='Number of occupiers submitted annual report for the previous year'
            fldName='anlrp'
            idText='txtanlrp'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            sNo={"9.3"}
            clrFnct={state.trigger}
            ToolTip="Enter whole Number only"

            speaker={hideInState ? 'Enter number of occupiers submitted annual report for the previous year' : ""}
          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Number of occupiers practising pre-treatment of lab microbiology and bio-technology waste'
            fldName='pretr'
            idText='txtpretr'
            onChange={onChangeDts}
            dsabld={!hideInState || disabledFieldYearNotSelect()}
            callFnFocus=''
            dsbKey={false}
            upprCase={false}
            validateFn=''
            allowNumber={true}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            sNo={"9.4"}
            ToolTip="Enter whole Number only"
            speaker={hideInState ? 'Enter Number of occupiers practising pre-treatment of lab microbiology and bio-technology waste' : ""}
          ></WtrInput>

        </div>

        <div className="w-full mt-6 overflow-auto">
          {year ? <><Seperator heading={`Part-2: : District-wise bio-medical waste generation (for the previous calendar year ${year}) )`}></Seperator>
          </> : <>
            <Seperator smallheading={year ? "" : "Please select year to enable input field"} heading={`Part-2: District-wise bio-medical waste generation (for the previous calendar year ${year}) )`}> </Seperator>
          </>
          }
          {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
          {/* <thead className="bg-gray-50">
                     <tr className="py-3 bg-gray-100">
                       <th className="border p-3" scope="col">S. Number.</th>
                       <th className="border p-3" scope="col">Particulars</th>
                       <th className="border p-3" scope="col">Details</th>
                     </tr>

                   </thead> */}

          <WtrInput
            displayFormat={"3"}
            Label='Number of districts'
            fldName='nodstr'
            idText='txtnodstr'
            onChange={onChangeNoDstrn}
            dsabld={year && hideInState ? false : true}
            callFnFocus=''
            dsbKey={false}
            validateFn='1[length]'
            allowNumber={true}
            selectedValue={state.textDts4}
            clrFnct={state.trigger4}
            speaker={hideInState ? 'Enter Number of districts' : ""}
            delayClose={1000}
            placement='right'

            sNo={"10.1"}
            ClssName=''
            ToolTip="Enter whole Number only"
          ></WtrInput>
          <WtrInput
            displayFormat={"3"}
            Label='Name of district'
            fldName='dstr'
            idText='txtdstr'
            onChange={onChangeDstr}
            dsabld={year && hideInState ? false : true}
            callFnFocus=''
            dsbKey={false}
            validateFn='1[length]'
            allowNumber={false}
            selectedValue={state.textDts1}
            clrFnct={state.trigger1}
            speaker={hideInState ? 'Enter Name of district' : ""}
            delayClose={1000}
            placement='right'
            blockNumbers={true}
            sNo={"10.1.1"}
            ClssName=''
            ToolTip={"Select Year to enable field"}
          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label='Biomedical waste generated (kg/day)'
            fldName='gnrt'
            idText='txtgnrt'
            onChange={onChangeDstr}
            dsabld={year && hideInState ? false : true}
            callFnFocus=''
            dsbKey={false}
            validateFn='1[length]'
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts1}
            clrFnct={state.trigger1}
            speaker={hideInState ? 'Enter Biomedical Waste Generated per day' : ""}
            sNo={"10.1.2"}
            delayClose={1000} placement='bottom' ClssName=''
            noofDecimals={3}
            ToolTip={"Select Year to enable field"}
          ></WtrInput>

          <div className="border-b border-gray-200 pb-2 mt-2"></div>

          {/* <WtrInput
            displayFormat={"3"}
            Label='No. of incinerators _total incineration capacity (kg/day) required 2 input boxes'
            fldName='inccp'
            idText='txtinccp'
            onChange={onChangeDstr}
            dsabld={year && hideInState ? false : true}
            callFnFocus=''
            dsbKey={false}
            validateFn='1[length]'
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts1}
            clrFnct={state.trigger1}
            speaker={'Enter No. of incinerators _total incineration capacity (kg/day) required 2 input boxes'}
            sNo={"10.1.3"}
            noofDecimals={3}
            delayClose={1000} placement='left' ClssName=''
            ToolTip={"Select Year to enable field"}
          ></WtrInput> */}




          <table className="border-collapse w-full border-b border-gray-200 mb-6 mt-3">
            <tbody>
              <tr>
                <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">10.1.3</td>
                <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                  No. of incinerators _total incineration capacity (kg/day)
                </td>
                <td colSpan={2} className="px-3 w-[50%]">
                  <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                    <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                    <div className="w-1/2 px-2">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="inccp"
                        idText="txtinccp"
                        onChange={onChangeDstr}
                        dsabld={year && hideInState ? false : true}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.textDts1}
                        clrFnct={state.trigger1}
                        noofDecimals={3}
                        delayClose={1000}
                        placement="left"
                        ClssName=""
                        ToolTip={"Select Year to enable field"}
                        placeholder=" No. of incinerators"
                      />
                    </div>
                    <div className="w-1/2 px-2">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="inccpsec"
                        idText="txtinccapsec"
                        onChange={onChangeDts}
                        callFnFocus=""
                        allowDecimal={true}
                        noofDecimals={3}
                        dsabld={year && hideInState ? false : true}
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="total incineration capacity (kg/day)"
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>




          {/* <WtrInput
            displayFormat={"3"}
            Label='No. of autoclaves _total autoclave capacity (kg/day) required 2 input boxes'
            fldName='autcp'
            idText='txtautcp'
            onChange={onChangeDstr}
            dsabld={year && hideInState ? false : true}
            callFnFocus=''
            dsbKey={false}
            validateFn='1[length]'
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts1}
            clrFnct={state.trigger1}
            speaker={'Enter No. of autoclaves _total autoclave capacity (kg/day) '}
            sNo={"10.1.4"}
            delayClose={1000} ClssName=''
            noofDecimals={3}
            ToolTip="Enter Number only"></WtrInput> */}



          <table className="border-collapse w-full border-b border-gray-200 mb-6 mt-3">
            <tbody>
              <tr>
                <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">10.1.4</td>
                <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                  No. of autoclaves _total autoclave capacity (kg/day)
                </td>
                <td colSpan={2} className="px-3 w-[50%]">
                  <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                    <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                    <div className="w-1/2 px-2">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName='autcp'
                        idText='txtautcp'
                        onChange={onChangeDstr}
                        dsabld={year && hideInState ? false : true}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.textDts1}
                        clrFnct={state.trigger1}
                        noofDecimals={3}
                        delayClose={1000}
                        placement="left"
                        ClssName=""
                        ToolTip={"Select Year to enable field"}
                        placeholder=" No. of autoclaves "
                      />
                    </div>
                    <div className="w-1/2 px-2">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName='autcpsec'
                        idText='txtautcpsec'
                        onChange={onChangeDts}
                        callFnFocus=""
                        allowDecimal={true}
                        dsabld={year && hideInState ? false : true}
                        noofDecimals={3}
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="total autoclave capacity (kg/day)"
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>


          {/* <WtrInput
            displayFormat={"3"}
            Label='No. of deep burial pits_deep burial pits capacity (kg/day) required 2 input boxes'
            fldName='depcp'
            idText='txtdepcp'
            onChange={onChangeDstr}
            dsabld={year && hideInState ? false : true}
            callFnFocus=''
            dsbKey={false}
            validateFn='1[length]'
            allowNumber={true}
            allowDecimal={true}
            selectedValue={state.textDts1}
            clrFnct={state.trigger1}
            speaker={'Enter No. of deep burial pits_deep burial pits capacity (kg/day) required 2 input boxes'}
            delayClose={1000} ClssName=''
            sNo={"10.1.5"}
            noofDecimals={3}
            ToolTip="Enter Number only"></WtrInput> */}

          <table className="border-collapse w-full mb-6 mt-3">
            <tbody>
              <tr>
                <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">10.1.5</td>
                <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                  No. of deep burial pits_deep burial pits capacity (kg/day)
                </td>
                <td colSpan={2} className="px-3 w-[50%]">
                  <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                    <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                    <div className="w-1/2 px-2">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName='depcp'
                        idText='txtdepcp'
                        onChange={onChangeDstr}
                        dsabld={year && hideInState ? false : true}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.textDts1}
                        clrFnct={state.trigger1}
                        noofDecimals={3}
                        delayClose={1000}
                        placement="left"
                        ClssName=""
                        ToolTip={"Select Year to enable field"}
                        placeholder="No. of deep burial pits"
                      />
                    </div>
                    <div className="w-1/2 px-2">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName='depcpsec'
                        idText='txtdepcpsec'
                        onChange={onChangeDstr}
                        dsabld={year && hideInState ? false : true}
                        callFnFocus=""
                        allowDecimal={true}
                        noofDecimals={3}
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="deep burial pits capacity (kg/day)"
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <WtrInput
            displayFormat={"3"}
            Label='Any other capacity (kg/day)'
            fldName='othrcp'
            idText='txtothrcp'
            onChange={onChangeDstr}
            dsabld={year && hideInState ? false : true}
            callFnFocus=''
            dsbKey={false}
            validateFn=''
            allowNumber={false}
            allowDecimal={true}
            selectedValue={state.textDts1}
            clrFnct={state.trigger1}
            speaker={hideInState ? 'Enter any other capacity (kg/day)' : ""}
            sNo={"10.1.6"}
            noofDecimals={3}
            delayClose={1000} ClssName=''
            unblockSpecialChars={true}
            ToolTip="Enter Number only" ></WtrInput>
          {/* </table> */}
          {hideInState ? <>
            <div className="flex justify-center py-7">
              <div className="mr-4">
                <Button
                  size="medium"
                  style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
                  variant="contained"
                  color="success"
                  disabled={!state.disableA}
                  startIcon={<SaveIcon />}
                  onClick={addDstrClick}
                >
                  Add details of other district
                </Button>
              </div>
            </div>
          </> : <></>}

        </div>

        <div className="w-full mt-6 overflow-auto">
          {(districtBmwData && districtBmwData.length) ?
            <>
              <Seperator heading={`Part 2: District-wise bio-medical waste generation (for the previous calendar year ${year})`}></Seperator>
              <table className="mt-2">
                <tr className="py-3">
                  <th className="tableHdr">District</th>
                  <th className="tableHdr">Waste generated</th>
                  <th className="tableHdr">Incinerator capacity</th>
                  <th className="tableHdr">Autoclave capacity</th>
                  <th className="tableHdr">Deep <b></b>burial capacity</th>
                  <th className="tableHdr">Any other capacity</th>
                  {hideInState && <th className="tableHdr">Delete</th>}
                </tr>

                {districtBmwData.map((res: any) => (
                  <tr className="backGrey">
                    <td className="tableHdr">{res.dstr}</td>
                    <td className="tableHdr">{res.gnrt}</td>
                    <td className="tableHdr">{res.inccp}</td>
                    <td className="tableHdr">{res.autcp}</td>
                    <td className="tableHdr">{res.depcp}</td>
                    <td className="tableHdr">{res.othrcp}</td>
                    {hideInState && <td className="tableHdr" onClick={() => deleteDstrData(res.dstr)}>Delete</td>}
                  </tr>
                ))}


              </table>
            </>
            : <></>}

        </div>

        <div className="w-full mt-6 overflow-auto">

          <div className="mt-6" style={{ marginTop: '70px' }}>
            {year ? <> <Seperator heading={`Part-3 : Information on HCF having captive treatment facilities (for the previous calendar Year ${year})`}></Seperator></> : <>
              <Seperator smallheading={year ? "" : "Please select year to enable input field"} heading={`Part-3 : Information on HCF having captive treatment facilities (for the previous calendar Year ${year})`}></Seperator>
            </>

            }

            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                     <tr className="py-3 bg-gray-100">
                       <th className="border p-3" scope="col">S. Number.</th>
                       <th className="border p-3" scope="col">Particulars</th>
                       <th className="border p-3" scope="col">Details</th>
                     </tr>

                   </thead> */}
            <WtrInput
              displayFormat={"3"}
              Label='Name of HCF'
              fldName='hcfcpt'
              idText='txthcfcpt'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={false}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              blockNumbers={true}
              speaker={hideInState ? 'Enter Name of Captive HCF' : ""}
              delayClose={1000}
              placement='right'
              ClssName=''
              sNo={"11.1"}

              ToolTip="Enter name of captive HCF without special characters"
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Address'
              fldName='hcfadd'
              idText='txthcfadd'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='4[length]'
              allowNumber={false}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter Address HCF' : ""}
              delayClose={1000}
              sNo={"11.2"}
              placement='bottom'

              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Red category waste (kg/day)'
              fldName='wstred'
              idText='txtwstred'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter biomedical waste red (kg/Day)' : ""}
              delayClose={1000}
              placement='left'
              sNo={"11.3"}
              ClssName=''
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Yellow category waste (Kg/day)'
              fldName='wstylw'
              idText='txtwstylw'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter biomedical waste Yellow (kg/Day)' : ""}
              sNo={"11.4"}
              delayClose={1000}
              ToolTip="Enter Number only"
              noofDecimals={3}
              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='White category waste (kg/day)'
              fldName='wstwht'
              idText='txtwstwht'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter biomedical waste white (kg/Day)' : ""}
              delayClose={1000}
              sNo={"11.5"}
              ClssName=''
              ToolTip="Enter Number only"
              noofDecimals={3}
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Blue category waste (Kg/day)'
              fldName='wstblu'
              idText='txtwstblu'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter biomedical waste blue (kg/Day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"11.6"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Cytotoxic category waste (Kg/day)'
              fldName='wstcyt'
              idText='txtwstcyt'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter biomedical waste cytotoxic (kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"11.7"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Incinerator capacity (Kg/day)'
              fldName='inccp'
              idText='txtinccp'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter incinerator capacity (kg/Day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"11.8"}
              noofDecimals={3}
              ToolTip="Enter Number only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Autoclave capacity (kg/day)'
              fldName='autcp'
              idText='txtautcp'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter autoClave capacity (Kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"11.9"}
              noofDecimals={3}
              ToolTip="Enter Number only" ></WtrInput>
            <div className="border-b border-gray-200 pb-2 mt-2"></div>

            {/* <WtrInput
              displayFormat={"3"}
              Label='No. of deep burial pits_deep burial pits capacity (kg/day) required 2 input boxes'
              fldName='depcp'
              idText='txtdepcp'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter No. of deep burial pits_deep burial pits capacity (kg/day) required 2 input boxes' : ""}
              delayClose={1000}
              sNo={"11.10"}
              ClssName=''
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput> */}


            <table className="border-collapse w-full  mb-6 mt-3">
              <tbody>
                <tr>
                  <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">11.10</td>
                  <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                    No. of deep burial pits_deep burial pits capacity (kg/day)
                  </td>
                  <td colSpan={2} className="px-3 w-[50%]">
                    <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                      <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='depcp'
                          idText='txtdepcp'
                          onChange={onChangeHcfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.textDts2}
                          clrFnct={state.trigger2}
                          noofDecimals={3}
                          delayClose={1000}
                          placement="left"
                          ClssName=""
                          ToolTip={"Select Year to enable field"}
                           placeholder=" Enter No. of deep burial pits"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='depcpsec'
                          idText='txtdepcpsec'
                          onChange={onChangeHcfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          allowDecimal={true}
                          noofDecimals={3}
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.textDts2}
                          clrFnct={state.trigger2}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                           placeholder="Enter deep burial pits capacity (kg/day)"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>


            <WtrInput
              displayFormat={"3"}
              Label='Other capacity (Kg/day)'
              fldName='othrcp'
              idText='txtothrcp'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter other capacity (Kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"11.11"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Biomedical waste treated in incinerator (Kg/day)'
              fldName='inctrd'
              idText='txtinctrd'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter biomedical waste treated in incinerator (Kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"11.12"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Biomedical waste treated in autoclave/microwave (kg/day)'
              fldName='auttrd'
              idText='txtauttrd'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter biomedical waste treated in autoclave/microwave (kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              noofDecimals={3}
              sNo={"11.13"}
              ToolTip="Enter Number only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label=' Biomedical waste disposed of through Deep Burial pits (Kg/day)'
              fldName='deptrd'
              idText='txtdeptrd'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter Biomedical waste disposed of through Deep Burial pits (Kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"11.14"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Other treated (Kg/day)'
              fldName='othrtrd'
              idText='txtothrtrd'
              onChange={onChangeHcfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts2}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter other treated (Kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              noofDecimals={3}
              sNo={"11.15"}

              ToolTip="Enter Number only" ></WtrInput>
            {/* </table> */}
            {hideInState ? <>
              <div className="flex justify-center py-7">
                <div className="mr-4">
                  <Button
                    size="medium"
                    style={{ backgroundColor: "#3B71CA" , textTransform: "none"}}
                    variant="contained"
                    color="success"
                    disabled={!state.disableA}
                    startIcon={<SaveIcon />}
                    onClick={addHcfCptvClick}
                  >
                    Add details of other HCF
                  </Button>
                </div>
              </div> </> : <></>}


          </div>


        </div>

        <div className="w-full mt-6 overflow-auto">
          {(hcfCptvData && hcfCptvData.length) ?
            <>
              <Seperator heading={`Part-3: Information on HCF having captive treatment facilities (for the previous calendar Year ${year})`}></Seperator>
              <table className="mt-2">
                <tr className="py-3">
                  <th className="tableHdr border">Name and address of the health care facility</th>
                  <th className="tableHdr border" colSpan={6}>Quantity of BMW generation in (kg/day) </th>
                  <th className="tableHdr border" colSpan={4}>Total installed treatment capacity in (kg/day)</th>

                  <th className="tableHdr border" style={{ width: "14%" }}>Total biomedical waste treated and disposed by HCF in (kg/day)</th>

                  {hideInState && <th className="tableHdr border">Delete</th>}
                </tr>
                <tr className="bg-white">
                  <th className="tableHdr1 border"></th>
                  <th className="tableHdr1 border">Yellow</th>
                  <th className="tableHdr1 border">Red</th>
                  <th className="tableHdr1 border">Blue</th>
                  <th className="tableHdr1 border">White</th>
                  <th className="tableHdr1 border">Cytotoxic</th>
                  <th className="tableHdr1 border">Totalin (kg/day)</th>
                  <th className="tableHdr1 border">Incinerator</th>
                  <th className="tableHdr1 border">Autoclave</th>
                  <th className="tableHdr1 border">Deep burial</th>
                  <th className="tableHdr1 border">Any other</th>
                  <th className="tableHdr1 border"></th>
                  {hideInState && <th className="tableHdr1 border"></th>}
                </tr>

                {hcfCptvData.map((res: any) => (
                  <tr className="backGrey">
                    <td className="tableHdr border">{res.hcfcpt + "  add: " + res.hcfadd}</td>
                    <td className="tableHdr border">{res.wstylw}</td>
                    <td className="tableHdr border">{res.wstred}</td>
                    <td className="tableHdr border">{res.wstblu}</td>
                    <td className="tableHdr border">{res.wstwht}</td>
                    <td className="tableHdr border">{res.wstcyt}</td>
                    <td className="tableHdr border">{Number(Number(res.wstblu) + Number(res.wstred) + Number(res.wstylw) + Number(res.wstwht) + Number(res.wstcyt)).toFixed(3)}</td>
                    <td className="tableHdr border">{res.inccp}</td>
                    <td className="tableHdr border">{res.autcp}</td>
                    <td className="tableHdr border">{res.depcp}</td>
                    <td className="tableHdr border">{res.othrcp}</td>

                    <td className="tableHdr border">
                      <div className="flex justify-between">
                        <div className=""> Incinerator:</div>
                        <div className="">{res.inctrd}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className=" w-6/12"> Autoclave:</div>
                        <div className="">{res.auttrd}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className=""> Deep burial:</div>
                        <div className="">{res.deptrd}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="">Any other: </div>
                        <div className="Any other: ">{res.othrtrd}</div>
                      </div>

                    </td>

                    {hideInState && <td className="tableHdr border" onClick={() => deleteHcfCptvData(res.dstr)}>Delete</td>}
                  </tr>
                ))}


              </table>
            </>
            : <></>}


        </div>


        <div className="w-full mt-6 overflow-auto">

          <div className="mt-6" style={{ marginTop: '70px' }}>
            {year ? <> <Seperator heading={`Part-4: Information on HCF having captive treatment facilities (for the previous calendar Year ${year})`}></Seperator></> : <>
              <Seperator smallheading={year ? "" : "Please select year to enable input field"} heading={`Part-4: Information on HCF having captive treatment facilities (for the previous calendar Year ${year} )`}></Seperator>

            </>

            }
            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                     <tr className="py-3 bg-gray-100">
                       <th className="border p-3" scope="col">S. Number.</th>
                       <th className="border p-3" scope="col">Particulars</th>
                       <th className="border p-3" scope="col">Details</th>
                     </tr>

                   </thead> */}

            <tr>
              <td className="tableHdr1 px-3">12.1</td>
              <td className="tableHdr1 px-3">Name and address of the CBWTFs with contact person name and telephone number</td>
              <td></td>
            </tr>
            <WtrInput
              displayFormat={"3"}
              Label="Name of CBWTF"
              fldName='nmaddcbwtf'
              idText='txtnmaddcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={false}
              selectedValue={state.textDts3}
              maxLength={75}
              clrFnct={state.trigger2}
              blockNumbers={true}
              speaker={hideInState ? "Enter name of CBWTF" : ""}
              delayClose={1000}
              placement='right'
              ClssName=''
              sNo={"12.1.i"}

            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label="Address of  CBWTF"
              fldName='addresscbwtf'
              idText='txtaddresscbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              maxLength={100}
              validateFn='1[length]'
              allowNumber={false}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? "Enter Address of CBWTF" : ""}
              delayClose={1000}
              placement='right'

              ClssName=''
              sNo={"12.1.ii"}
            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label=' Contact person name'
              fldName='contcbwtf'
              idText='txtcontcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              maxLength={50}
              validateFn='1[length]'
              allowNumber={false}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              blockNumbers={true}
              speaker={hideInState ? 'Enter contact person name of CBWTF' : ""}
              delayClose={1000}
              placement='right'
              ClssName=''
              sNo={"12.1.iii"}

            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label='Telephone number '
              fldName='telphcbwtf'
              idText='txttelphcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='[mob]'
              allowNumber={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter telephone number' : ""}
              delayClose={1000}
              placement='right'
              ClssName=''

              sNo={"12.1.iv"}
            ></WtrInput>
            <tr>
              <td className="tableHdr1 px-3">12.2</td>
              <td className="tableHdr1 px-3">GPS coordinates</td>
              <td></td>
            </tr>
            <WtrInput
              displayFormat={"3"}
              Label='Latitude (units for GPS should be provided in decimal degrees)'
              fldName='gpscbwtf'
              idText='txtgpscbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='4[length]'
              allowNumber={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter latitude' : ""}
              allowDecimal={true}
              maxValue={40}
              minValue={20}
              delayClose={1000}
              sNo={"12.2.i"}
              placement='bottom'

              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Longitude  (units for GPS should be provided in decimal degrees)'
              fldName='gpslongcbwtf'
              idText='txtgpslongcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='4[length]'
              allowNumber={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              maxValue={80}
              minValue={50}
              speaker={hideInState ? 'Enter longitude' : ""}
              allowDecimal={true}
              delayClose={1000}
              sNo={"12.2.ii"}
              placement='bottom'

              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Coverage area (in Sq Km)'
              fldName='cvrcbwtf'
              idText='txtcvrcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter coverage area (in Sq Km)' : ""}
              delayClose={1000}
              minValue={0}
              maxValue={500}
              placement='left'
              sNo={"12.3"}
              ClssName=''

              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Name of the cities/areas covered by common biomedical waste treatment facilities'
              fldName='ctycbwtf'
              idText='txtctycbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={false}
              allowDecimal={false}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter name of the cities/ areas' : ""}
              sNo={"12.4"}
              delayClose={1000}
              unblockSpecialChars={true}
              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total number of HCF being covered'
              fldName='ttlhcfcbwtf'
              idText='txtttlhcfcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter total number of Health care' : ""}
              delayClose={1000}
              sNo={"12.5"}
              ClssName=''

              ToolTip="Enter Number only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total number of beds covered'
              fldName='ttlbdcbwtf'
              idText='txtttlbdcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter total number of beds coverd' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.6"}

              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total quantity of bioMedical waste collected from member HCF in (kg/day) '
              fldName='qntcbwtf'
              idText='txtqntcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter total quantity of bioMedical waste' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.7"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Incinerator capacity (kg/day)'
              fldName='inccpcbwtf'
              idText='txtinccpcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter incinerator capacity per day' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.8"}
              noofDecimals={3}
              ToolTip="Enter Number only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Plasma pyrolysis capacity (kg/day)'
              fldName='psmcbwtf'
              idText='txtpsmcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter plasma pyrolysis capacity per day' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.9"}
              noofDecimals={3}
              ToolTip="Enter Number only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Autoclave capacity (kg/day)'
              fldName='autocbwtf'
              idText='txtautocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter autoclave capacity (kg/day)' : ""}
              delayClose={1000}
              sNo={"12.10"}
              ClssName=''
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Hydroclave capacity (kg/day)'
              fldName='hydrcbwtf'
              idText='txthydrcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter hydroclave capacity per day' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.11"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Microwave capacity (kg/day)'
              fldName='micrpcbwtf'
              idText='txtmicrpcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter microwave capacity per day' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.12"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Shredder capacity (kg/day)'
              fldName='shrcbwtf'
              idText='txtshrcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter shredder capacity per day' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.13"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Sharps encapsulation or concrete pit Capacity (kg/day)'
              fldName='shrpcbwtf'
              idText='txtshrpcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter sharps encapsulation  or concrete pit Capacity per day' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.14"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Deep burial pits capacity (kg/day)'
              fldName='deepcbwtf'
              idText='txtdeepcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter deep burial pits  capacity per day' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.15"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Any other equipment capacity (kg/day)'
              fldName='othrcpcbwtf'
              idText='txtothrcpcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter any other equipment capacity per day' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.16"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Effluent treatment plant capacity (kg/day)'
              fldName='effcbwtf'
              idText='txteffcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter effluent treatment plant  capacity per day' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.17"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            <div className="border-b border-gray-200 pb-2 mt-2"></div>


            {/* ***************************************** */}



            {/* <WtrInput
              displayFormat={"3"}
              Label='No. of incinerators _total incineration capacity (kg/day) required 2 input boxes'
              fldName='inccpnocbwtf'
              idText='txtinccpnocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter No. of incinerators _total incineration capacity (kg/day) required 2 input boxes'}
              delayClose={1000}
              ClssName=''
              sNo={"12.18"}
              noofDecimals={3}
              ToolTip="Enter Number only" ></WtrInput> */}


            <table className="border-collapse w-full border-b border-gray-200 mb-6 mt-3">
              <tbody>
                <tr>
                  <td className="px-3 text-center whitespace-nowrap">12.18</td>
                  <td className="pr-[9rem] py-1 text-[rgb(2,1,52)] text-[14px] text-center whitespace-nowrap">
                    No. of incinerators _total incineration capacity (kg/day)
                  </td>
                  <td colSpan={2} className="px-3 w-6/12">
                    <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                      <span className="text-[rgb(2,1,52)] text-[14px] font-normal mr-3 ml-[-11px]">:</span>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="inccpnocbwtf"
                          idText="txtinccpnocbwtf"
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          noofDecimals={3}
                          delayClose={1000}
                          placement="left"
                          ClssName=""
                          ToolTip={"Select Year to enable field"}
                          placeholder="No. of incinerators (kg/day)"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="inccpnocbwtfsec"
                          idText="txtinccpnocbwtfsec"
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          allowDecimal={true}
                          noofDecimals={3}
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="total incineration capacity (kg/day)"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>




            {/* <WtrInput
              displayFormat={"3"}
              Label='No. of plasma pyrolysis _total plasma pyrolysis capacity (kg/day) required 2 input boxes'
              fldName='psmnocbwtf'
              idText='txtpsmnocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter No. of plasma pyrolysis _total plasma pyrolysis capacity (kg/day) required 2 input boxes'}
              delayClose={1000}
              ClssName=''
              sNo={"12.19"}
              noofDecimals={3}
              ToolTip="Enter Number only" ></WtrInput> */}

            {/* <table className="border-collapse w-full">
              <tbody>
                <tr>
                  <td className="px-3 text-center whitespace-nowrap">12.19</td>
                  <td className="pr-[5rem] py-1 text-[#020134] text-[14px] text-center whitespace-nowrap">
                    No. of plasma pyrolysis _total plasma pyrolysis capacity (kg/day)
                  </td>
                  <td className="px-3 w-3/12">
                    <WtrInput
                      displayFormat="1"
                      Label=""
                      fldName='psmnocbwtf'
                      idText='txtpsmnocbwtf'
                      onChange={onChangeCbwtfCptv}
                      dsabld={year && hideInState ? false : true}
                      callFnFocus=""
                      dsbKey={false}
                      validateFn="1[length]"
                      allowNumber={true}
                      allowDecimal={true}
                      selectedValue={state.textDts3}
                      clrFnct={state.trigger2}
                      noofDecimals={3}
                      delayClose={1000}
                      placement="left"
                      ClssName=""
                      ToolTip={"Select Year to enable field"}
                    />
                  </td>
                  <td className="px-3 w-3/12">
                    <WtrInput
                      displayFormat="1"
                      Label=""
                      fldName='psmnocbwtfsec'
                      idText='txtpsmnocbwtfsec'
                      onChange={onChangeCbwtfCptv}
                      dsabld={year && hideInState ? false : true}
                      callFnFocus=""
                      allowDecimal={true}
                      noofDecimals={3}
                      dsbKey={false}
                      validateFn="1[length]"
                      allowNumber={true}
                      selectedValue={state.textDts3}
                      clrFnct={state.trigger2}
                      delayClose={1000}
                      placement="right"
                      ClssName=""
                    />
                  </td>
                </tr>
              </tbody>
            </table> */}

            <table className="border-collapse w-full border-b border-gray-200 mb-6 mt-3">
              <tbody>
                <tr>
                  <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">12.19</td>
                  <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                    No. of plasma pyrolysis _total plasma pyrolysis capacity (kg/day)
                  </td>
                  <td colSpan={2} className="px-3 w-[50%]">
                    <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                      <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="psmnocbwtf"
                          idText="txtpsmnocbwtf"
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          noofDecimals={3}
                          delayClose={1000}
                          placement="left"
                          ClssName=""
                          ToolTip={"Select Year to enable field"}
                          placeholder=" No. of plasma pyrolysis (kg/day)"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="psmnocbwtfsec"
                          idText="txtpsmnocbwtfsec"
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          allowDecimal={true}
                          noofDecimals={3}
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder=" total plasma pyrolysis capacity (kg/day)"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>


            {/* <WtrInput
              displayFormat={"3"}
              Label='No. of autoclave _total autoclave capacity (kg/day) required 2 input boxes'
              fldName='autonocbwtf'
              idText='txtautonocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter No. of autoclave _total autoclave capacity (kg/day) required 2 input boxes'}
              delayClose={1000}
              sNo={"12.20"}
              ClssName=''
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput> */}




            <table className="border-collapse w-full border-b border-gray-200 mb-6 mt-3">
              <tbody>
                <tr>
                  <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">12.20</td>
                  <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                    No. of autoclave _total autoclave capacity (kg/day)
                  </td>
                  <td colSpan={2} className="px-3 w-[50%]">
                    <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                      <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='autonocbwtf'
                          idText='txtautonocbwtf'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          noofDecimals={3}
                          delayClose={1000}
                          placement="left"
                          ClssName=""
                          ToolTip={"Select Year to enable field"}
                          placeholder="No. of autoclave (kg/day)"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='autonocbwtfsec'
                          idText='txtautonocbwtfsec'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          allowDecimal={true}
                          noofDecimals={3}
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="total autoclave capacity (kg/day)"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* <WtrInput
              displayFormat={"3"}
              Label='No. of hydroclave _total hydroclave capacity (kg/day) required 2 input boxes'
              fldName='hydrnocbwtf'
              idText='txthydrnocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter No. of hydroclave _total hydroclave capacity (kg/day) required 2 input boxes'}
              delayClose={1000}
              ClssName=''
              sNo={"12.21"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput> */}

            <table className="border-collapse w-full border-b border-gray-200 mb-6 mt-3">
              <tbody>
                <tr>
                  <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">12.21</td>
                  <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                    No. of hydroclave _total hydroclave capacity (kg/day)
                  </td>
                  <td colSpan={2} className="px-3 w-[50%]">
                    <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                      <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='hydrnocbwtf'
                          idText='txthydrnocbwtf'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          noofDecimals={3}
                          delayClose={1000}
                          placement="left"
                          ClssName=""
                          ToolTip={"Select Year to enable field"}
                          placeholder="No. of hydroclave (kg/day)"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='hydrnocbwtfsec'
                          idText='txthydrnocbwtfsec'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          allowDecimal={true}
                          noofDecimals={3}
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="total hydroclave capacity (kg/day)"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>



            {/* <WtrInput
              displayFormat={"3"}
              Label='No. of microwave _total microwave capacity (kg/day) required 2 input boxes'
              fldName='micrpnocbwtf'
              idText='txtmicrpnocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter No. of microwave _total microwave capacity (kg/day) required 2 input boxes'}
              delayClose={1000}
              ClssName=''
              sNo={"12.22"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput> */}




            <table className="border-collapse w-full border-b border-gray-200 mb-6 mt-3">
              <tbody>
                <tr>
                  <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">12.22</td>
                  <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                    No. of microwave _total microwave capacity (kg/day)
                  </td>
                  <td colSpan={2} className="px-3 w-[50%]">
                    <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                      <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='micrpnocbwtf'
                          idText='txtmicrpnocbwtf'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          noofDecimals={3}
                          delayClose={1000}
                          placement="left"
                          ClssName=""
                          placeholder="No. of microwave (kg/day)"
                          ToolTip={"Select Year to enable field"}
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='micrpnocbwtfsec'
                          idText='txtmicrpnocbwtfsec'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          allowDecimal={true}
                          noofDecimals={3}
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="total microwave capacity (kg/day)"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* <WtrInput
              displayFormat={"3"}
              Label='No. of Shredder _total shredder capacity (kg/day) required 2 input boxesr'
              fldName='shrnocbwtf'
              idText='txtshrnocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter No. of Shredder _total shredder capacity (kg/day) required 2 input boxes'}
              delayClose={1000}
              ClssName=''
              sNo={"12.23"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput> */}



            <table className="border-collapse w-full  mb-6 mt-3">
              <tbody>
                <tr>
                  <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">12.23</td>
                  <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                    No. of Shredder _total shredder capacity (kg/day)
                  </td>
                  <td colSpan={2} className="px-3 w-[50%]">
                    <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                      <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='shrnocbwtf'
                          idText='txtshrnocbwtf'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          noofDecimals={3}
                          delayClose={1000}
                          placement="left"
                          ClssName=""
                          ToolTip={"Select Year to enable field"}
                          placeholder=" No. of Shredder (kg/day)"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='shrnocbwtfsec'
                          idText='txtshrnocbwtfsec'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          allowDecimal={true}
                          noofDecimals={3}
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="total Shredder capacity (kg/day)"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <WtrInput
              displayFormat={"3"}
              Label='Number of Ssarps encapsulation or concrete pit'
              fldName='shrpnocbwtf'
              idText='txtshrpnocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter number of sharps encapsulation or concrete pit' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.24"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>

            {/* <WtrInput
              displayFormat={"3"}
              Label='No. of incinerators _total incineration capacity (kg/day) required 2 input boxes'
              fldName='deepnocbwtf'
              idText='txtdeepnocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter No. of incinerators _total incineration capacity (kg/day) required 2 input boxes'}
              delayClose={1000}
              ClssName=''
              sNo={"12.25"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput> */}

            <div className="border-b border-gray-200 pb-2 mt-2"></div>

            <table className="border-collapse w-full border-b border-gray-200 mb-6 mt-3">
              <tbody>
                <tr>
                  <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">12.25</td>
                  <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                    No. of incinerators _total incineration capacity (kg/day)
                  </td>
                  <td colSpan={2} className="px-3 w-[50%]">
                    <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                      <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='deepnocbwtf'
                          idText='txtdeepnocbwtf'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          noofDecimals={3}
                          delayClose={1000}
                          placement="left"
                          ClssName=""
                          ToolTip={"Select Year to enable field"}
                          placeholder=" No. of incinerators (kg/day)"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='deepnocbwtfsec'
                          idText='txtdeepnocbwtfsec'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          allowDecimal={true}
                          noofDecimals={3}
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="total incineration capacity (kg/day)"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* <WtrInput
              displayFormat={"3"}
              Label='No. of equipment with Name _total capacity (kg/day) required 2 input boxes'
              fldName='othrcpnocbwtf'
              idText='txtothrcpnocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter No. of equipment with Name _total capacity (kg/day) required 2 input boxes'}
              delayClose={1000}
              ClssName=''
              sNo={"12.26"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput> */}


            <table className="border-collapse w-full border-b border-gray-200 mb-6 mt-3">
              <tbody>
                <tr>
                  <td className="pl-3 pr-2 text-left whitespace-nowrap w-[6%]">12.26</td>
                  <td className="py-1 text-[rgb(2,1,52)] text-[14px] text-left whitespace-nowrap w-[42%]">
                    No. of equipment with name _total capacity (kg/day)
                  </td>
                  <td colSpan={2} className="px-3 w-[50%]">
                    <div className="flex w-full border-b border-gray-200 pb-2 mt-4 items-center mb-3">
                      <span className="text-gray-500 text-[14px] font-normal mr-3 ml-[-8px]">:</span>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='othrcpnocbwtf'
                          idText='txtothrcpnocbwtf'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          noofDecimals={3}
                          delayClose={1000}
                          placement="left"
                          ClssName=""
                          ToolTip={"Select Year to enable field"}
                          placeholder="Enter no. of equipment with name"
                        />
                      </div>
                      <div className="w-1/2 px-2">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName='othrcpnocbwtfsec'
                          idText='txtothrcpnocbwtfsec'
                          onChange={onChangeCbwtfCptv}
                          dsabld={year && hideInState ? false : true}
                          callFnFocus=""
                          allowDecimal={true}
                          noofDecimals={3}
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.textDts3}
                          clrFnct={state.trigger2}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Enter total capacity (kg/day)"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>


            <WtrInput
              displayFormat={"3"}
              Label='Effluent treatment plant capacity (KLD)'
              fldName='effnocbwtf'
              idText='txteffnocbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter effluent treatment plant capacity (KLD)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.27"}
              noofDecimals={3}
              ToolTip="Enter Number only"></WtrInput>


            {/* ****************************************************** */}


            {/* <WtrInput
                   displayFormat={"3"}
                   Label='Biomedical waste treated in incinerators (Kg/day)'
                   fldName='inccpttlcbwtf'
                   idText='txtinccpttlcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Biomedical waste treated in incinerators (Kg/day)'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.28"}
                   noofDecimals={3}
                   ToolTip="Enter Number only" ></WtrInput> */}

            {/* <WtrInput
                   displayFormat={"3"}
                   Label='Plasma pyrolysis Total (kg/day)'
                   fldName='psmttlcbwtf'
                   idText='txtpsmttlcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Plasma PyrolysisTotal (kg/day)'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.29"}
                   noofDecimals={3}
                   ToolTip="Enter Number only" ></WtrInput>

                 <WtrInput
                   displayFormat={"3"}
                   Label='Autoclave Total (kg/day)'
                   fldName='autottlcbwtf'
                   idText='txtautottlcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Autoclave Total (kg/day)'}
                   delayClose={1000}
                   sNo={"12.30"}
                   ClssName=''
                   noofDecimals={3}
                   ToolTip="Enter Number only"></WtrInput>

                 <WtrInput
                   displayFormat={"3"}
                   Label='Hydroclave Total (kg/day)'
                   fldName='hydrttlcbwtf'
                   idText='txthydrttlcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter HydroclaveTotal (kg/day)'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.31"}
                   noofDecimals={3}
                   ToolTip="Enter Number only"></WtrInput>

                 <WtrInput
                   displayFormat={"3"}
                   Label='Microwave Total (kg/day)'
                   fldName='micrpttlcbwtf'
                   idText='txtmicrpttlcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter MicrowaveTotal (kg/day)'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.32"}
                   noofDecimals={3}
                   ToolTip="Enter Number only"></WtrInput>

                 <WtrInput
                   displayFormat={"3"}
                   Label='Shredder Total (kg/day)'
                   fldName='shrttlcbwtf'
                   idText='txtshrttlcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter ShredderTotal (kg/day)'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.33"}
                   noofDecimals={3}
                   ToolTip="Enter Number only"></WtrInput>

                 <WtrInput
                   displayFormat={"3"}
                   Label='Sharps encapsulation or concrete pit Total (kg/day)'
                   fldName='shrpttlcbwtf'
                   idText='txtshrpttlcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Sharps encapsulation  or concrete pitTotal (kg/day)'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.34"}
                   noofDecimals={3}
                   ToolTip="Enter Number only"></WtrInput>

                 <WtrInput
                   displayFormat={"3"}
                   Label='Deep burial Pits Total (kg/day)'
                   fldName='deepttlcbwtf'
                   idText='txtdeepttlcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Deep burial pits Total (kg/day)'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.35"}
                   noofDecimals={3}
                   ToolTip="Enter Number only"></WtrInput>

                 <WtrInput
                   displayFormat={"3"}
                   Label='Any other equipment Total (kg/day)'
                   fldName='othrcpttlcbwtf'
                   idText='txtothrcpttlcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Any other equipmentTotal (kg/day)'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.36"}
                   noofDecimals={3}
                   ToolTip="Enter Number only"></WtrInput>

                 <WtrInput
                   displayFormat={"3"}
                   Label='Effluent Treatment CBWTF  Total (kg/day)'
                   fldName='effttlcbwtf'
                   idText='txteffttlcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Effluent Treatment CBWTF Total (kg/day)'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.37"}
                   noofDecimals={3}
                   ToolTip="Enter Number only"></WtrInput>
      */}


            {/* <WtrInput
                   displayFormat={"3"}
                   Label='Incineration Ash'
                   fldName='ashcbwtf'
                   idText='txtashcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Incineration Ash'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.38"}
                   ToolTip="Enter Number only"></WtrInput> */}

            <WtrInput
              displayFormat={"3"}
              Label=' Biomedical waste treated in incinerators (Kg/day)'
              fldName='incqntycbwtf'
              idText='txtincqntycbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter biomedical waste treated in incinerators (Kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.28"}

              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Quantity of incineration ash disposed of (Kg/day)'
              fldName='incdispcbwtf'
              idText='txtincdispcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter quantity of incineration ash disposed of (Kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.29"}
              unblockSpecialChars={true}

              ToolTip="Enter Number only"></WtrInput>



            {/* <WtrInput
                   displayFormat={"3"}
                   Label='Sharps '
                   fldName='shpcbwtf'
                   idText='txtshpcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Sharps '}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.41"}
                   ToolTip="Enter Number only"></WtrInput> */}

            <WtrInput
              displayFormat={"3"}
              Label=' Quantity of sharp waste treated (kg/day)'
              fldName='shpqntycbwtf'
              idText='txtshpqntycbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter quantity of sharp waste treated (kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.30"}

              ToolTip="Enter Number only"></WtrInput>

            {/* <WtrInput
                   displayFormat={"3"}
                   Label='Sharps Disposed by'
                   fldName='shpdispcbwtf'
                   idText='txtshpdispcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Disposed by'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.41"}
                   unblockSpecialChars={true}
                   ToolTip="Enter Number only"></WtrInput> */}

            {/* <WtrInput
                   displayFormat={"3"}
                   Label='Plastics '
                   fldName='plscbwtf'
                   idText='txtplscbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Plastics '}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.44"}
                   ToolTip="Enter Number only"></WtrInput> */}

            <WtrInput
              displayFormat={"3"}
              Label='Quantity of plastic waste treated (Kg/day)'
              fldName='plsqntycbwtf'
              idText='txtplsqntycbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter quantity of plastic waste treated (Kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.31"}

              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Quantity of treated plastic waste sent to recycler (Kg/day)'
              fldName='plsdispcbwtf'
              idText='txtplsdispcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter Quantity of treated plastic waste sent to recycler (Kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.32"}
              unblockSpecialChars={true}
              ToolTip="Enter Number only"></WtrInput>
            {/* <WtrInput
                   displayFormat={"3"}
                   Label='ETP Sludge '
                   fldName='etpcbwtf'
                   idText='txtetpcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   allowNumber={true}
                   allowDecimal={true}
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter ETP Sludge '}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.47"}
                   ToolTip="Enter Number only"></WtrInput> */}

            <WtrInput
              displayFormat={"3"}
              Label=' Quantity of ETP sludge disposed of (Kg/day)'
              fldName='etpqntycbwtf'
              idText='txtetpqntycbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={hideInState ? 'Enter quantity of ETP sludge disposed of (Kg/day)' : ""}
              delayClose={1000}
              ClssName=''
              sNo={"12.33"}

              ToolTip="Enter Number only"></WtrInput>
          </div>

          {/* <WtrInput
                   displayFormat={"3"}
                   Label='ETP Sludge Disposed by'
                   fldName='etpdispcbwtf'
                   idText='txtetpdispcbwtf'
                   onChange={onChangeCbwtfCptv}
                   dsabld={year && hideInState ? false : true}
                   callFnFocus=''
                   dsbKey={false}
                   validateFn='1[length]'
                   selectedValue={state.textDts3}
                   clrFnct={state.trigger2}
                   speaker={'Enter Disposed by'}
                   delayClose={1000}
                   ClssName=''
                   sNo={"12.45"}
                   unblockSpecialChars={true}
                   ToolTip="Enter Number only"></WtrInput> */}

          {/* ****************************************************************** */}

          {/* </table> */}
          {hideInState ? <>
            <div className="flex justify-center py-7">
              <div className="mr-4">
                <Button
                  size="medium"
                  style={{ backgroundColor: "#3B71CA" , textTransform: "none"}}
                  variant="contained"
                  color="success"
                  disabled={!state.disableA}
                  startIcon={<SaveIcon />}
                  onClick={addCbwtfCptvClick}
                >
                  Add data
                </Button>
              </div>
            </div> </> : <></>
          }



        </div>

        <div className="w-full mt-6 overflow-auto">

          <div className="mt-6" style={{ marginTop: '70px' }}>
            <Seperator heading={`Part 4: Information on CBWTF and disposal facilities (for the previous calendar Year ${year})`}></Seperator>
          </div>
        </div>


        <div className="w-full max-w-screen-xl mx-auto p-4">
          <div className="overflow-hidden rounded-lg shadow-lg">
            {(cbwtfData && cbwtfData.length) ?
              <>

                <div className="overflow-x-auto">
                  <table className="mt-2 min-w-full">
                    <tr className="py-3">
                      <th className="tableHdr border" colSpan={4}>General information</th>
                      <th className="tableHdr border" colSpan={2}>GPS coordinates </th>
                      <th className="tableHdr border" >Coverage area in kms </th>

                      <th className="tableHdr border">Name of the cities/ areas covered by CBWTF</th>

                      <th className="tableHdr border">Total number of HCF being covered</th>
                      <th className="tableHdr border">Total number of beds covered</th>
                      <th className="tableHdr border" >Total Quantity of bioMedical waste collected from member HCF in (kg/day) </th>
                      <th className="tableHdr border" colSpan={3}>Capacity of treatment equipments installed  by CBWTFs </th>

                      <th className="tableHdr border" >Total bioMedical waste treated in (kg/day) </th>

                      <th className="tableHdr border">Method of disposal of treated wastes (incineration ash/sharps/plastics) </th>
                      {hideInState && <th className="tableHdr border">Delete</th>}
                    </tr>
                    <tr className="bg-white">
                      <th className="tableHdr1 border">Name</th>
                      <th className="tableHdr1 border">Address</th>
                      <th className="tableHdr1 border">Contact person name</th>
                      <th className="tableHdr1 border">Telephone number</th>
                      <th className="tableHdr1 border">Latitude</th>
                      <th className="tableHdr1 border">Longitude</th>
                      <th className="tableHdr1 border"></th>
                      <th className="tableHdr1 border"></th>
                      <th className="tableHdr1 border"></th>
                      <th className="tableHdr1 border"></th>
                      <th className="tableHdr1 border"></th>
                      <th className="tableHdr1 border">Equipment</th>
                      <th className="tableHdr1 border">Numbers</th>
                      <th className="tableHdr1 border">Total installed capacity (kg/day) </th>
                      <th className="tableHdr1 border"></th>
                      {hideInState && <th className="tableHdr1 border"></th>}
                    </tr>

                    {cbwtfData.map((res: any) => (
                      <tr className="backGrey">
                        <td className="tableHdr border" >{res.nmaddcbwtf}</td>
                        <td className="tableHdr border" >{res.addresscbwtf}</td>
                        <td className="tableHdr border" >{res.contcbwtf}</td>
                        <td className="tableHdr border" >{res.telphcbwtf}</td>
                        <td className="tableHdr border" >{res.gpscbwtf}</td>
                        <td className="tableHdr border" >{res.gpslongcbwtf}</td>
                        <td className="tableHdr border" >{res.cvrcbwtf}</td>
                        <td className="tableHdr border" >{res.ctycbwtf}</td>
                        <td className="tableHdr border" >{res.ttlhcfcbwtf}</td>
                        <td className="tableHdr border" >{res.ttlbdcbwtf}</td>
                        <td className="tableHdr border" >{res.qntcbwtf}</td>

                        <td className=" border">
                          <div className="equal-row "> Incinerator</div>
                          <div className="equal-row "> Plasma pyrolysis</div>
                          <div className="equal-row "> Autoclave</div>
                          <div className="equal-row ">Hydroclave</div>
                          <div className="equal-row "> Microwave</div>
                          <div className="equal-row "> Shredder</div>
                          <div className="equal-row "> Sharps encapsulation or concrete pit</div>
                          <div className="equal-row ">Deep burial pit</div>
                          <div className="equal-row "> Any other equipment</div>
                          <div className="equal-row "> Effluent treatment plant </div>
                          <div className="equal-row "> Sub-total </div>
                        </td>


                        <td className=" border">
                          <div className=" equal-row tableHr">{res.inccpcbwtf}</div>
                          {/* <div className=" equal-row tableHr">{res.plscbwtf} </div> */}
                          <div className=" equal-row tableHr">-</div>
                          <div className=" equal-row tableHr">{res.autocbwtf} </div>
                          <div className=" equal-row tableHr">{res.hydrcbwtf}</div>
                          <div className=" equal-row tableHr">{res.micrpcbwtf}</div>
                          <div className=" equal-row tableHr">{res.shrcbwtf}</div>
                          <div className=" equal-row tableHr">{res.shrpcbwtf} </div>
                          <div className=" equal-row tableHr">{res.deepcbwtf} </div>
                          <div className=" equal-row tableHr">{res.othrcpcbwtf}</div>
                          <div className=" equal-row tableHr">{res.effcbwtf}</div>
                          <div className=" equal-row tableHr">{Number(res.inccpcbwtf) + Number(res.autocbwtf)
                            + Number(res.hydrcbwtf) + Number(res.micrpcbwtf) + Number(res.shrcbwtf) + Number(res.shrpcbwtf) +
                            Number(res.deepcbwtf) + Number(res.othrcpcbwtf) + Number(res.effcbwtf)}</div>
                        </td>
                        <td className=" border">
                          <div className=" equal-row tableHr">{res.inccpnocbwtf}</div>
                          <div className=" equal-row tableHr">{res.psmnocbwtf} </div>
                          <div className=" equal-row tableHr">{res.autonocbwtf} </div>
                          <div className=" equal-row tableHr">{res.hydrnocbwtf}</div>
                          <div className=" equal-row tableHr">{res.micrpnocbwtf}</div>
                          <div className=" equal-row tableHr">{res.shrnocbwtf}</div>
                          <div className=" equal-row tableHr">{res.shrpnocbwtf} </div>
                          <div className=" equal-row tableHr">{res.deepnocbwtf} </div>
                          <div className=" equal-row tableHr">{res.othrcpnocbwtf}</div>
                          <div className=" equal-row tableHr">{res.effnocbwtf}</div>
                          <div className=" equal-row tableHr">{Number(res.inccpnocbwtf) + Number(res.psmnocbwtf) + Number(res.autonocbwtf)
                            + Number(res.hydrnocbwtf) + Number(res.micrpnocbwtf) + Number(res.shrnocbwtf) + Number(res.shrpnocbwtf) +
                            Number(res.deepnocbwtf) + Number(res.othrcpnocbwtf) + Number(res.effnocbwtf)}</div>
                        </td>
                        <td className=" border">
                          <div className=" equal-row tableHr">{res.inccpttlcbwtf}</div>
                          <div className=" equal-row tableHr">{res.psmttlcbwtf} </div>
                          <div className=" equal-row tableHr">{res.autottlcbwtf} </div>
                          <div className=" equal-row tableHr">{res.hydrttlcbwtf}</div>
                          <div className=" equal-row tableHr">{res.micrpttlcbwtf}</div>
                          <div className=" equal-row tableHr">{res.shrttlcbwtf}</div>
                          <div className=" equal-row tableHr">{res.shrpttlcbwtf} </div>
                          <div className=" equal-row tableHr">{res.deepttlcbwtf} </div>
                          <div className=" equal-row tableHr">{res.othrcpttlcbwtf}</div>
                          <div className=" equal-row tableHr">{res.effttlcbwtf}</div>
                          <div className=" equal-row tableHr">{Number(res.inccpttlcbwtf) + Number(res.psmttlcbwtf) + Number(res.autottlcbwtf)
                            + Number(res.hydrttlcbwtf) + Number(res.micrpttlcbwtf) + Number(res.shrttlcbwtf) + Number(res.shrpttlcbwtf) +
                            Number(res.deepttlcbwtf) + Number(res.othrcpttlcbwtf) + Number(res.effttlcbwtf)}</div>
                        </td>

                        <td className=" border">
                          <div className="equal-rowone">
                            <div className="flex justify-between">
                              <div className=""> Incineration ash: </div>
                              {/* <div className="">{res.ashcbwtf}</div> */}
                              <div className="">-</div>
                            </div>
                            <div className="flex justify-between">
                              <div className=""> Quantity:</div>
                              <div className="">{res.incqntycbwtf}</div>
                            </div><div className="flex justify-between">
                              <div className=""> Disposed by: </div>
                              <div className="">{res.incdispcbwtf}</div>
                            </div>
                          </div >
                          <div className="equal-rowone">
                            <div className="flex justify-between">
                              <div className="">Sharps: </div>
                              {/* <div className="">{res.shpcbwtf}</div> */}
                              <div className="">-</div>
                            </div>
                            <div className="flex justify-between">
                              <div className=""> Quantity:</div>
                              <div className="">{res.shpqntycbwtf}</div>
                            </div><div className="flex justify-between">
                              <div className=""> Disposed by: </div>
                              <div className="">{res.shpdispcbwtf}</div>
                            </div>
                          </div>

                          <div className="equal-rowtwo">
                            <div className="flex justify-between">
                              <div className="">Plastics: </div>
                              {/* <div className="">{res.plscbwtf}</div> */}
                              <div className="">- </div>
                            </div>
                            <div className="flex justify-between">
                              <div className=""> Quantity:</div>
                              <div className="">{res.plsqntycbwtf}</div>
                            </div><div className="flex justify-between">
                              <div className=""> Disposed by: </div>
                              <div className="">{res.plsdispcbwtf}</div>
                            </div>
                          </div>
                          <div className="equal-rowtwo">
                            <div className="flex justify-between">
                              <div className="">ETP sludge: </div>
                              {/* <div className="">{res.etpcbwtf}</div> */}
                              <div className="">-</div>
                            </div>
                            <div className="flex justify-between">
                              <div className=""> Quantity:</div>
                              <div className="">{res.etpqntycbwtf}</div>
                            </div><div className="flex justify-between">
                              <div className=""> Disposed by: </div>
                              <div className="">{res.etpdispcbwtf}</div>
                            </div>
                          </div>
                          <div className="equal-row">

                          </div>
                        </td>
                        {hideInState && <td className="tableHdr border" onClick={() => deleteCbwtfData(res.nmaddcbwtf)}>Delete</td>}

                      </tr>
                    ))}


                  </table>
                </div>
              </>
              : <></>
            }
          </div>
        </div>





        <div className="w-full mt-6 overflow-auto">
          <div className="mt-6" style={{ marginTop: '70px' }}>
            {/* <Seperator heading="Additional Information"></Seperator>
                 <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                     <tr className="py-3 bg-gray-100">
                       <th className="border p-3" scope="col">S. Number.</th>
                       <th className="border p-3" scope="col">Particulars</th>
                       <th className="border p-3" scope="col">Details</th>
                     </tr>
                   </thead> */}

            <WtrInput
              displayFormat={"3"}
              Label='Number of transportation vehicles used for collection of biomedical on daily basis by the CBWTF'
              speaker={hideInState ? 'Enter number of transportation vehicles used for collection of biomedical on daily basis by the CBWTF' : ""}
              fldName='ttlvhclcol'
              idText='ttlvhclcol'
              onChange={onChangeDts}
              dsabld={!hideInState || disabledFieldYearNotSelect()}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              maxValue={15}
              allowDecimal={false}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              delayClose={1000}
              placement='left'
              sNo={"12(A)"}

              ClssName=''
              ToolTip="Enter Number only"></WtrInput>



            <WtrInput
              displayFormat={"3"}
              Label="List of HCFs not having membership with the CBWTF and neither having captive treatment facilities"
              speaker={hideInState ? "Enter list of HCFs not having membership with the CBWTF and neither having captive treatment facilities" : ""}
              fldName='ttlhcfnomem'
              idText='txtttlhcfnomem'
              onChange={onChangeDts}
              dsabld={!hideInState || disabledFieldYearNotSelect()}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={false}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              delayClose={1000}
              placement='left'
              sNo={"12(B)"}
              ClssName=''

              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Number of trainings organised by the CBWTF operators"
              speaker={hideInState ? "Enter number of trainings organised by the CBWTF operators" : ""}
              fldName='ttltrg'
              idText='txtttltrg'
              onChange={onChangeDts}
              dsabld={!hideInState || disabledFieldYearNotSelect()}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={false}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              delayClose={1000}
              placement='left'
              sNo={"12(C)"}
              ClssName=''

              ToolTip="Enter Number only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Number of accidents reported to SPCB/PCC"
              speaker={hideInState ? "Enter number of accidents reported to SPCB/PCC" : ""}
              fldName='ttlnoacc'
              idText='ttlnoacc'
              onChange={onChangeDts}
              dsabld={!hideInState || disabledFieldYearNotSelect()}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={false}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              delayClose={1000}
              placement='left'
              sNo={"12(D)"}
              ClssName=''

              ToolTip="Enter Number only"></WtrInput>

            {/* </table> */}

          </div>
        </div>

        <div className="w-full mt-6 overflow-auto">
          {hideInState ? <>
            <div className="flex justify-center py-7">
              <div className="mr-4">
                <Button
                  size="medium"
                  style={{ backgroundColor: "#3B71CA" ,textTransform: "none"}}
                  variant="contained"
                  color="success"
                  disabled={!state.disableA || editdisabled}
                  startIcon={<SaveIcon />}
                  onClick={svClick}
                >
                  Submit
                </Button>
              </div>
              <div className="mr-4">
                <Button
                  size="medium"
                  style={{ color: "#3B71CA", backgroundColor: "#fff", textTransform: "none" }}
                  variant="contained"
                  color="success"
                  disabled={!state.disableA}
                  startIcon={<SaveIcon />}
                  onClick={clrFunct}
                >
                  Reset form
                </Button>
              </div>
            </div>
          </> : <></>}

        </div>



      </div>
    </div >

  );
}; export default React.memo(Stt_AuthorizationAndWaste);
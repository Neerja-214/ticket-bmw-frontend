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
    // new state 

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

    // ebd case 
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

interface SttDetails {
    stt: string;
}



const Stt_Consolidate = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [sttValue, setSttValue] = useState<string>("");
  const [rgdValue, setRgdValue] = useState<string>("");

  const [validationMsg, setValidationMsg] = useState('')
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [hideInState, sethideInState] = useState(getLvl() == 'STT' ? true : false)


  // const hideInState = getLvl() == 'STT' ? true : false;
  const [editaprvlVal, setEditAprvVal] = useState('')
  const hideInRgd =getLvl()=='RGD'?true:false;
  const hideInStt =getLvl()=='STT'?true:false;
  const hideInCpcb = getLvl() == 'CPCB' ? true : false;
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
    { fld: "tothcf", msg: "Enter total number of HCF", chck: "1[length]" },
    { fld: "totcbwtf", msg: "Enter total number of CBWTF", chck: "1[length]" },
    { fld: "totbdh", msg: "Enter Bedded Hospitals and Nursing Homes (bedded)", chck: "1[length]" },
    // ===========================================================================================

    { fld: "totcld", msg: "Enter total number of Clinics, Dispensaries", chck: "1[length]" },
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
    { fld: 'ttlcoem', msg: 'Enter Number of CBWTF that have installed OCMS', chck: '1[length]' },
    { fld: 'monsys', msg: 'Enter Number of Common Bio Medical Waste Treatment Facilities that have installed Continuous Online Emission Monitoring Systems' },

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
    { fld: 'ttlhcfnomem', msg: 'Enter List of Health Care Facilities not having membership with the CBWTF and neither having captive treatment facilities', chck: '1[length]' },
    { fld: 'ttltrg', msg: 'Enter Number of trainings organised by the Common BMW Treatment Facility operators', chck: '1[length]' },
    { fld: 'ttlnoacc', msg: 'Enter Number of Accidents reported by the Common Bio Medical Waste Treatment Facilities:', chck: '1[length]' },
    // ===========================================================================================
  ];

  const reqFldsDstr = [
    { fld: 'dstr', msg: 'Enter Name of District', chck: '1[length]' },
    { fld: 'gnrt', msg: 'Enter Biomedical Waste Generated Per Day', chck: '1[length]' },
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
    { fld: 'wstred', msg: 'Enter Biomedical Waste Red Per Day', chck: '1[length]' },
    { fld: 'wstylw', msg: 'Enter Biomedical Waste Yelow Per Day', chck: '1[length]' },
    { fld: 'wstwht', msg: 'Enter Biomedical Waste White Per Day', chck: '1[length]' },
    { fld: 'wstblu', msg: 'Enter Biomedical Waste Blue Per Day', chck: '1[length]' },
    { fld: 'wstcyt', msg: 'Enter Biomedical Waste Cytotoxic Per Day', chck: '1[length]' },
    { fld: 'inccp', msg: 'Enter Incinerator Capacity Per Day', chck: '1[length]' },
    { fld: 'autcp', msg: 'Enter AutoClave Capacity Per Day', chck: '1[length]' },
    { fld: 'depcp', msg: 'Enter Deep Burial Capacity Per Day', chck: '1[length]' },
    { fld: 'othrcp', msg: 'Enter Other Capacity Per Day', chck: '1[length]' },
    { fld: 'inctrd', msg: 'Enter Incinerator Treated Per Day', chck: '1[length]' },
    { fld: 'auttrd', msg: 'Enter AutoClave Treated Per Day', chck: '1[length]' },
    { fld: 'deptrd', msg: 'Enter Deep Treated Per Day', chck: '1[length]' },
    { fld: 'othrtrd', msg: 'Enter Other Treated Per Day', chck: '1[length]' }
  ];

  const reqsFldsCbwtf = [
    { fld: 'nmaddcbwtf', msg: 'Name and Address of the Common Bio Medical Waste Treatment Facilities', chck: '1[length]' },
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
    { fld: 'ttlhcfcbwtf', msg: 'Enter Total number of HCF being Coverd', chck: '1[length]' },
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
      setYear(getFldValue(data, 'dt_yearid').split('|')[0])
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
    let emptyfld = ["totvet", "totanh", "totpth", "totbld", "totcln", "totrsh", "totaysh", "totcns", "cbwtfcns", "ttlcoem", "wstath", "vlthcf", "vltcbtwf", "vltothr", "shwhcf", "shwcbtwf", "shwothr", "wrkspyr", "ocpinlq", "capin", "deepburpits", "trnorg", "biomwst", "anlrp", "pretr", "monsys", "ttlbmw", "nodstr"]
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
      showToaster(['Total Number of HCF applied for authorization could  be equal than Total Number of HCF granted authorization  and total Number of authorization rejected or total number of under Consideration  '], 'error');
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
      showToaster(['Add district details is Equal to number of districts mentioned'], 'error');
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

  const GetConsolidateList = (year:any) => {
    if(year){
        let who = sessionStorage.getItem('who')
        let lvl = sessionStorage.getItem('lvl')
        if (lvl == 'STT') {
            let sttDetails = sessionStorage.getItem('sttDetails')
            if (sttDetails) {
                const parsedSttDetails = JSON.parse(sttDetails) as SttDetails; // Parse and assert type
                who = parsedSttDetails.stt; // Access the stt property
            }
        }
        if (rgdValue) {
            who = rgdValue;
            lvl = "RGD"
        }
        if (sttValue) {
            who = sttValue;
            lvl = "STT"
        }

    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
    }, 800);
        let usrnm = getUsrnm();
        let cmpid = getCmpId();
        let payload: any = postLinux(lvl + '=' + who + "=" + year + "=" + usrnm + '=' + cmpid, 'show_consolidate_Data')
        return nrjAxiosRequestLinux("show_consolidated_info_HCF_CBWTF_AR", payload);
}
}


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


    if (hideInCpcb) {
      if (year) {

        if (dt.status !== "Failed") {
          dt = convertFldValuesToString(dt)
          dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
          let hcfCptvData = dataSvd.data['hcfCaptiveData']
          let cbwtfData = dataSvd.data['cbwtfData']
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
    queryKey: ["getConsolidatedata", year,rgdValue,sttValue],
    queryFn: () => GetConsolidateList(year),
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
          <div className="font-semibold" style={{ fontSize: '16px', color: "rgb(81, 52, 152)" }}>
            {/* <div className="font-semibold" style={{ color: '#009ED6' }}> */}
            {capitalizeTerms(props.heading)}
            <div className="text-sm text-black">
              {props.smallheading}
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
        showToaster(['Add district details is not add  greater than number of district'], 'error');
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
      let tempData = cbwtfData.filter((res: any) => (res.dstr != cbwtf))
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

    if (getLvl() !== "RGD") {
      let payload: any = {};
      if (rgdValue) {
          payload = postLinux(rgdValue, "sttrgd");
      } else {
          payload['cmpid'] = getCmpId() || "";
          payload['usrnm'] = getUsrnm() || "";

      }
      return nrjAxiosRequestBio('sttrgd', payload)

  }



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

  const getDataStateForRgd = (Stt: any) => {
    let payload: any = {};
    if (Stt) {
        payload = postLinux(Stt, "sttrgd");
    } else {
        payload['cmpid'] = getCmpId() || "";
        payload['usrnm'] = getUsrnm() || "";

    }
    return nrjAxiosRequestBio('sttrgd', payload)

};


  const getSttlistForRgd = async () => {
    let stt = getWho()
    if (stt) {
        try {
            let result = await getDataStateForRgd(stt)
            sttCombo(result);
        } catch (error) {
            console.error('Error fetching data:', error);
        }

    }


}

  useEffectOnce(() => {
    let lvl = sessionStorage.getItem('lvl')
  
    if (lvl == 'RGD') {
        getSttlistForRgd()
    }

})

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
    <div className="bg-white pb-12 pt-2">
      <div className="shadow rounded-lg">
        <div className="mx-7">
          <div style={{ textAlign: 'center', color: 'rgba(2, 1, 15, 0.5)' }}>
            <h4><span>CBWTF & HCF consolidated data</span></h4>
          </div>
          {/* <div className="state-header">
            <div className="marquee-container">
              <div
                className={`marquee ${isHovered ? 'paused' : ''}`}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <p className="marquee-content">
                  <h6 className="text-[20px] mt-2 inverted">Format for Submission of the Annual Report Information on Bio-medical Waste management (To be submitted
                    by the State Pollution Control Boards or Pollution Control Committees and Director General Armed Forces Medical
                    Services to Central Pollution Control Board on or before 31st July of every year for the period from January to December
                    of the preceding calendar year)</h6>
                </p>
              </div>
            </div>

          </div> */}
          <div className="mb-4">
            {/* <Seperator heading="Select From Dropdown"></Seperator> */}
          
              <div className='my-3 flex justify-end'>
                <Button
                  size="medium"
                  className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"

                  style={{ color: '#38a169', backgroundColor: "#fff", textTransform: "none" }}
                  variant="contained"
                  color="success"
                  onClick={() => { navigate(`/dashboardvb`) }}
                >
                  Back
                </Button>
                {/* <Button
                  size="medium"
                  className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"

                  style={{ color: '#38a169', backgroundColor: "#fff" }}
                  variant="contained"
                  color="success"
                  onClick={() => GetList()}
                  disabled={editdisabled}
                >
                  Allow Edit Access
                </Button> */}
              </div>
              {/* <div className='my-3 flex justify-end'>
                <Button
                  size="medium"
                  className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"

                  style={{ color: '#38a169', backgroundColor: "#fff" }}
                  variant="contained"
                  color="success"
                  onClick={() => GetList()}
                  disabled={editdisabled}
                >
                  Allow Edit Access
                </Button>
              </div> */}
           

            {/* <div className=" mt-4 grid grid-cols-3 gap-x-8 gap-y-4">
              <WtrRsSelect
                Label="Select year"
                speaker="Select year"
                fldName="dt_yearid"
                idText="txtdt_yearid"
                displayFormat={"1"}
                onChange={onChangeDts}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
                allwZero={"0"}
                fnctCall={false}
                dbCon=""
                typr=""
                loadOnDemand={loadOnDemand}
                dllName={""}
                fnctName={""}
                parms={""}
                allwSrch={true}
                delayClose={1000}
                disable={!hideInState}

              ></WtrRsSelect>
              {hideInState ? <>
              </> : <>
                <WtrRsSelect
                  Label="Regional Directorate"
                  fldName="rgdid"
                  idText="txtrgdid"
                  onChange={onChangeRgd}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  loadOnDemand={state.rgdCombo}
                  allwZero={"0"}
                  fnctCall={false}
                  dbCon={"1"}
                  typr={"1"}
                  dllName={""}
                  fnctName={""}
                  parms={'0'}
                  allwSrch={true}
                  speaker={"Select Regional Directorate"}
                  delayClose={1000}
                  placement="bottom"
                  displayFormat="1"
                  disable={!hideInState}
                ></WtrRsSelect>

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
                ></WtrRsSelect>
                {/* <WtrRsSelect
                  Label="Edit Approval"
                  speaker="Select Option"
                  fldName="edit_apprvlid"
                  idText="txtedit_apprvlid"
                  displayFormat={"1"}
                  onChange={onChangeDts}
                  selectedValue={state.textDts}
                  clrFnct={state.trigger}
                  allwZero={"0"}
                  fnctCall={false}
                  dbCon=""
                  typr=""
                  loadOnDemand={apprvlOption}
                  dllName={""}
                  fnctName={""}
                  parms={""}
                  allwSrch={true}
                  delayClose={1000}
                  disable={false}

                ></WtrRsSelect> 
              </>}



            </div> */}
            <div className=" mt-4 grid grid-cols-3 gap-x-8 gap-y-4">
              {/* <WtrRsSelect
                Label="Select year"
                speaker="Select year"
                fldName="dt_yearid"
                idText="txtdt_yearid"
                displayFormat={"1"}
                onChange={onChangeDts}
                selectedValue={state.textDts}
                clrFnct={state.trigger}
                allwZero={"0"}
                fnctCall={false}
                dbCon=""
                typr=""
                loadOnDemand={loadOnDemand}
                dllName={""}
                fnctName={""}
                parms={""}
                allwSrch={true}
                delayClose={1000}
                disable={false}

              ></WtrRsSelect> */}
                <div className="mt-4 my-4 pt-4">
                    {/* Flex container to align label and radio buttons in a single line */}
                    <div className="flex items-center">
                        {/* Label for the radio button group */}
                        <label className="font-bold text-lg text-gray-800 ">
                            Select year <span className="text-red-500"> *</span>
                        </label>

                        {/* Container for radio buttons in a single line */}
                        <div className="flex space-x-4 ml-4">
                            {years.map((year) => (
                                <div key={year} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`year-${year}`}
                                        name="year"
                                        value={year}
                                        checked={selectedYear === year} // Check the selected year
                                        onChange={() => onChangeYear(year)} // Call the handler on change
                                        className="mr-2"
                                        required
                                    />
                                    <label htmlFor={`year-${year}`} className="font-bold text-lg text-gray-800">{year}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             {/* {hideInCpcb &&  <WtrRsSelect
                  Label="Regional Directorate"
                  fldName="rgdid"
                  idText="txtrgdid"
                  onChange={onChangeRgd}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  loadOnDemand={state.rgdCombo}
                  allwZero={"0"}
                  fnctCall={false}
                  dbCon={"1"}
                  typr={"1"}
                  dllName={""}
                  fnctName={""}
                  parms={'0'}
                  allwSrch={true}
                  speaker={"Select Regional Directorate"}
                  delayClose={1000}
                  placement="bottom"
                  displayFormat="1"
                  disable={false}
                ></WtrRsSelect>} */}
              {(hideInCpcb || hideInRgd) && <WtrRsSelect
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
                  disable={false}
                ></WtrRsSelect>}
              </div>
          </div>
          <Seperator heading="Part-1 (Summary of information)"></Seperator>
          {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
          {/* <thead className="bg-gray-50">
              <tr className="py-3 bg-gray-100">
                <th className="border p-3" scope="col">S. Number</th>
                <th className="border p-3" scope="col">Particulars</th>
                <th className="border p-3" scope="col">Details</th>
              </tr>

            </thead> */}


          {/* <WtrInput
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
            speaker={"Enter Name of SPCB minimum 5 characters"}
            delayClose={1000}
            placement="right"
            ClssName=""
            ToolTip="Enter a Name without special character"
            sNo={"1.1"}

          ></WtrInput> */}


          {/* <WtrInput
            displayFormat={"3"}
            Label="Name of Nodal Officer"
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
            speaker={"Enter Name of Nodal Officer of minimum 5 character"}
            delayClose={1000}
            placement="bottom"
            ClssName=""
            ToolTip="Enter a Name without special character"
            sNo={"1.2"}

          ></WtrInput> */}

          {/* <WtrInput
            displayFormat={"3"}
            Label="Contact No. of Nodal Officer"
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
            speaker={"Enter Name of Nodal Officer"}
            delayClose={1000}
            placement="left"
            ClssName=""
            ToolTip="Enter whole numbers only"
            sNo={"1.3"}

          ></WtrInput> */}

          {/* <WtrInput
            displayFormat={"3"}
            Label="e-mail id of Nodal Officer"
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
            speaker={"Enter e-mail id of Nodal Officer"}
            delayClose={1000}
            ClssName=""
            sNo={"1.4"}

          ></WtrInput> */}

          <WtrInput
            displayFormat={"3"}
            Label="Total Number of Health Care Facilities"
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
            speaker={"Enter Total Number of HCF"}
            delayClose={1000}
            ClssName=""
            ToolTip="Enter whole numbers only"
            sNo={"1.1"}

          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Total Number of CBWTF"
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
            speaker={"Enter Total Number of CBWTF"}
            delayClose={1000}
            ClssName=""
            ToolTip="Enter whole numbers only"
            sNo={"1.2"}

          ></WtrInput>

          {/* </table> */}


          <div>
            <Seperator heading="Health Care Facilities Category Information"></Seperator>
            {/* <table className="table table-bordered min-w-full  border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. Number</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}

            <WtrInput
              displayFormat={"3"}
              Label="Bedded Hospitals and Nursing Homes (bedded)"
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
              speaker={"Enter Total Number of HCF"}
              delayClose={1000}
              ClssName=""
              ToolTip="Enter whole numbers only"
              sNo={"2.1"}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Total Clinical Dispensary"
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
              speaker={"Enter Total Number of Clinical Dispensary"}
              delayClose={1000}
              ClssName=""
              ToolTip="Enter whole numbers only"
              sNo={"2.2"}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Total Vetinary Institutions"
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
              ToolTip="Enter whole numbers only"
              sNo={"2.3"}
              speaker={"Enter Total Vetinary Institutions"}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Total Animal Houses"
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
              ToolTip="Enter whole numbers only"
              sNo={"2.4"}
              speaker={"Enter Total Animal Houses"}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Total Pathological laboratories"
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
              ToolTip="Enter whole numbers only"
              sNo={"2.5"}
              speaker={"Enter Total Pathological laboratories"}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Total Blood Bank"
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
              ToolTip="Enter whole numbers only"
              sNo={"2.6"}
              speaker={"Enter Total Blood Bank"}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Total Clinical Establishment"
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
              ToolTip="Enter whole numbers only"
              sNo={"2.7"}
              speaker={"Enter Clinical Establishment"}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Total Research Institution"
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
              ToolTip="Enter whole numbers only"
              sNo={"2.8"}
              speaker={"Enter Research Institution"}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Total Ayush Clinic"
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
              ToolTip="Enter whole numbers only"
              sNo={"2.9"}
              speaker={"Enter Total Ayush Clinic"}

            ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label="Total Number Beds"
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
              speaker={"Enter Total Number of Beds"}
              delayClose={1000}
              ClssName=""
              ToolTip="Enter whole numbers only"
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
              ToolTip="Enter whole numbers only"
              speaker={"Enter Number of occupiers installed liquid waste treatment facility"}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Number of occupiers constituted BMW management Committees'
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
              ToolTip="Enter whole numbers only"
              speaker={"Number of occupiers constituted BMW management Committees"}

            ></WtrInput>
            {/* </table> */}
          </div>

          {/* <div> */}
            {/* <Seperator heading="Authorization Status"></Seperator> */}
            {/*<table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
              <tr className="py-3 bg-gray-100">
                <th className="border p-3" scope="col">S. Number</th>
                <th className="border p-3" scope="col">Particulars</th>
                <th className="border p-3" scope="col">Details</th>
              </tr>

            </thead> */}

            {/* <WtrInput
              displayFormat="3"
              Label='Total Number of authorized HCF out of total HCF'
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
              speaker={'Total Number of authorized HCF out of total HCF'}
              delayClose={1000}
              placement='right'
              ToolTip="Enter whole numbers only"
              sNo={"3.1"}

            ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label='Total Number of unauthorized HCF out of total HCF'
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
              speaker={'Total Number of unauthorized HCF out of total HCF'}
              delayClose={1000}
              placement='right'
              ToolTip="Enter whole numbers only"
              sNo={"3.2"}

            ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label={`Total Number of HCF applied for authorization ${year ? `(${year})` : ''}`}
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
              speaker={'Enter total Number of HCF applied for authorization'}
              delayClose={1000}
              placement='right'
              ClssName=''
              ToolTip="Enter whole numbers only"
              sNo={"3.3"}

            ></WtrInput>


            <WtrInput
              displayFormat="3"
              Label={`Total Number of HCF's granted authorization ${year ? `(${year})` : ''}`}
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
              speaker={'Enter Total Number Authorized'}
              delayClose={1000}
              placement='bottom'
              ClssName=''
              ToolTip="Enter whole numbers only"
              sNo={"3.4"}

            ></WtrInput>

            <WtrInput
              Label={`Total Number Under Consideration ${year ? `(${year})` : ''}`}
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
              ToolTip="Enter whole numbers only"
              sNo={"3.5"}

              speaker={'Enter Total Number Under Consideration'}
            ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label={`Total Number of Application Rejected ${year ? `(${year})` : ''}`}
              speaker='Enter Total Number of Application Rejected'
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

              ToolTip="Enter whole numbers only"
            ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label={`Total Number of HCF in operation without Authorization ${year ? `(${year})` : ''}`}
              speaker="Total Number of HCF in operation without Authorization"
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

              ToolTip="Enter whole numbers only"
            ></WtrInput> */}
            {/* </table> */}
          {/* </div> */}

          <div>
            <Seperator heading=" Bio-medical Waste Informartion "></Seperator>
            { /* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. Number</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}

            <WtrInput
              displayFormat={"3"}
              Label='Quantity of BMW Generation in (kg/day)'
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
              speaker={'Enter Biomedical Waste Generated'}
              delayClose={1000}
              ClssName=''
              noofDecimals={3}
              sNo={"3.1"}

              ToolTip="please enclose District Wise BMW Generation as per Part-2"></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste generated from bedded hospital (kg/day)'
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
              speaker={'Enter Biomedical Waste Generated Bedded Hospital'}
              delayClose={1000}
              ClssName=''
              sNo={"3.2"}
              noofDecimals={3}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste Generated Non Bedded (kg/day)'
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
              speaker={'Enter Biomedical Waste Generated Non Bedded'}
              delayClose={1000}
              sNo={"3.3"}
              ClssName=''
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste Generated Other (kg/day)'
              speaker='Enter Total Biomedical Waste Generated Other (kg/day)'
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
              sNo={"3.4"}
              ToolTip="Enter whole numbers only"
              noofDecimals={3}
            ></WtrInput>
            {/* </table> */}
          </div>

          <div>
            <Seperator heading="Information of Captive Treatment Facility"></Seperator>
            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. Number</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}
            <WtrInput
              displayFormat="3"
              Label="Number of HCF's having captive treatment facilities"
              speaker="Enter Number of HCF's having captive treatment facilities"
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
              ToolTip="Enter whole numbers only"
              sNo={"4.1"}

              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label="Number of captive incinerators operated by HCF's"
              speaker="Enter Number of captive incinerators operated by HCF's"
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
              sNo={"4.2"}
              ClssName=''

              ToolTip="Enter whole numbers only"
            ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label='Total BMW treated in captive treatment facilities by HCF in (kg/day)'
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
              speaker={'Total BMW treated in captive treatment facilities by HCF in (kg/day)'}
              delayClose={1000}
              placement='right'
              ToolTip="Enter whole numbers only"
              sNo={"4.3"}
              noofDecimals={3}
              ClssName='' ></WtrInput>
            {/* <WtrInput
              displayFormat={"3"}
              Label='Number of captive incinerators complying to the norms'
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
              sNo={"4.4"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"

              speaker={'Enter Number of captive incinerators complying to the norms'}
            ></WtrInput> */}
            <WtrInput
              displayFormat={"3"}
              Label='Number of HCF having deep burial pits'
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
              sNo={"4.5"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Number of HCF having deep burial pits'}
            ></WtrInput>
            {/* </table> */}
          </div>

          <div>
            <Seperator heading={`Information of  Common Bio Waste Treatment Facilities`}></Seperator>
            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. Number</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}

            <WtrInput
              displayFormat={"3"}
              Label='Number of CBWTF having deep burial pits'
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
              sNo={"5.1"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              delayClose={1000}
              placement='right'
              speaker={'Enter Total CBWTF in Operation'}
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
              sNo={"5.1"}
              placement='right'
              ClssName=''
              ToolTip="Enter whole numbers only">
              </WtrInput> */}

            {/* <WtrInput
              displayFormat={"3"}
              Label='Total Number CBWTF under Construction'
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
              sNo={"5.2"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Total Number CBWTF under Construction'}

            ></WtrInput> */}

            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste Treated and Disposed through CBWTF (kg/day)'
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
              speaker={'Enter Biomedical Waste Treated and Disposed through CBWTF'}
              delayClose={1000}
              placement='left' ClssName=''
              sNo={"5.3"}
              noofDecimals={3}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label="Number of CBWTF's that have installed OCEMS"
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
              ToolTip="Enter whole numbers only"
              sNo={"5.4"}
              speaker={"Enter Number of CBWTF's that have installed OCEMS"}
            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label='Number of Common Bio Medical Waste Treatment Facilities that have installed Continuous OCEMS'
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
              sNo={"5.5"}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Number of Common Bio Medical Waste Treatment Facilities that have installed Continuous OCEMS'}

            ></WtrInput>
          </div>


          <div>
            <Seperator heading={`Biomedical Waste Treatment & Disposed `}></Seperator>


            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste Treated (This value is equal to the sum of points 4.3 and 5.3) '
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
              sNo={"6.1"}
              ToolTip="Enter numbers only"
              speaker={'Enter Total Biomedical Waste Treated'}
            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste Disposed by Authorized Recycler (kg/day)'
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
              sNo={"6.2"}
              ToolTip="Enter numbers only"
              speaker={'Enter Total Biomedical Waste Disposed by Authorized Recycler (Kg/day)'}
              noofDecimals={3}
            ></WtrInput>
          </div>
          {/* <div>
            <Seperator heading={`Violations and Action Taken `}></Seperator>
            <WtrInput
              displayFormat={"3"}
              Label='Total Number of Violations by HCF'
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
              ToolTip="Enter whole numbers only"
              speaker={'Enter Total Number of Violations by HCF'}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Number of Violations by CBWTF'
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
              speaker={'Enter Total Number of Violations by CBWTF'}
              ToolTip="Enter whole numbers only"

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Number of Violations by Others'
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
              ToolTip="Enter whole numbers only"
              speaker={'Enter Total Number of Violations by Others'}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Show cause notices/directions issued to defaulter HCF'
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
              ToolTip="Enter whole numbers only"
              speaker={'Enter Total Show cause notices/directions issued to defaulter HCF'}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Show cause notices/directions issued to defaulter CBWTF'
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
              ToolTip="Enter whole numbers only"
              speaker={'Enter Total Show cause notices/directions issued to defaulter CBWTF'}

            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Show cause notices/directions issued to Others defaulter'
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
              ToolTip="Enter whole numbers only"

              speaker={'Enter Total Show cause notices/directions issued to Others defaulter'}
            ></WtrInput>
          </div> */}

          <div>
            <Seperator heading={`Other Information`}></Seperator>
            <WtrInput
              displayFormat={"3"}
              Label='Number of workshops/trainings conducted during the year'
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
              sNo={"7.1"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"

              speaker={'Enter Number of workshops/trainings conducted during the year'}
            ></WtrInput>


            <WtrInput
              displayFormat={"3"}
              Label='Number of occupiers organised trainings'
              fldName='trnorg'
              idText='txttrnorg'
              onChange={onChangeDts}
              dsabld={!hideInState || disabledFieldYearNotSelect()}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              sNo={"7.2"}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Number of occupiers organised trainings'}

            ></WtrInput>


            <WtrInput
              displayFormat={"3"}
              Label='Number of occupiers submitted Annual Report for the previous calendar year'
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
              sNo={"7.3"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"

              speaker={'Enter Number of occupiers submitted Annual Report for the previous calendar year'}
            ></WtrInput>

            {/* <WtrInput
              displayFormat={"3"}
              Label='Number of occupiers practising pre-treatment of lab microbiology and Bio-technology waste'
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
              sNo={"7.4"}

              ToolTip="Enter whole numbers only"
              speaker={'Enter Number of occupiers practising pre-treatment of lab microbiology and Bio-technology waste'}
            ></WtrInput> */}
            {/* </table> */}
          </div>

          <div>
            {/* {year ? <><Seperator heading={`Part-2: District-wise Bio-medical Waste Generation (for the previous calendar year ${year})`}></Seperator>
            </> : <>
              <Seperator smallheading={year ? "" : "Please select year to enable input field"} heading={`Part-2: District-wise Bio-medical Waste Generation (for the previous calendar year ${year})`}> </Seperator>
            </>
            } */}
            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. Number</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}

            {/* <WtrInput
              displayFormat={"3"}
              Label='Number of District'
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
              speaker={'Enter Number  of District'}
              delayClose={1000}
              placement='right'

              sNo={"10.1"}
              ClssName=''
              ToolTip="Enter whole numbers only"
            ></WtrInput> */}
            {/* <WtrInput
              displayFormat={"3"}
              Label='Name of District'
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
              speaker={'Enter Name of District'}
              delayClose={1000}
              placement='right'
              blockNumbers={true}
              sNo={"10.2"}
              ClssName=''
              ToolTip={"Select Year to enable field"}
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Waste Generated (kg/day)'
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
              speaker={'Enter Biomedical Waste Generated Per Day'}
              sNo={"10.3"}
              delayClose={1000} placement='bottom' ClssName=''
              noofDecimals={3}
              ToolTip={"Select Year to enable field"}
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Incinerator Capacity (kg/day)'
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
              speaker={'Enter Incinerator Capacity (kg/day)'}
              sNo={"10.4"}
              noofDecimals={3}
              delayClose={1000} placement='left' ClssName=''
              ToolTip={"Select Year to enable field"}
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Autoclave Capacity (kg/day)'
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
              speaker={'Enter Autclave Capacity (kg/day)'}
              sNo={"10.5"}
              delayClose={1000} ClssName=''
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Deep Burial Capacity (kg/day)'
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
              speaker={'Enter Deep Capacity (kg/day)'}
              delayClose={1000} ClssName=''
              sNo={"10.6"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Any Other Capacity (kg/day)'
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
              speaker={''}
              sNo={"10.7"}
              noofDecimals={3}
              delayClose={1000} ClssName=''
              unblockSpecialChars={true}
              ToolTip="Enter numbers only" ></WtrInput> */}
            {/* </table> */}
            {/* {hideInState ? <>
              <div className="flex justify-center py-7">
                <div className="mr-4">
                  <Button
                    size="medium"
                    style={{ backgroundColor: "#3B71CA" }}
                    variant="contained"
                    color="success"
                    disabled={!state.disableA}
                    startIcon={<SaveIcon />}
                    onClick={addDstrClick}
                  >
                    Add Details of Other District
                  </Button>
                </div>
              </div>
            </> : <></>} */}


          </div>
          {/* {(districtBmwData && districtBmwData.length) ?
            <>
              <Seperator heading={`Part 2: District-wise Bio-medical Waste Generation (for the previous calendar year ${year})`}></Seperator>
              <table className="mt-2">
                <tr className="py-3">
                  <th className="tableHdr">District</th>
                  <th className="tableHdr">Waste Generated</th>
                  <th className="tableHdr">Incinerator Capacity</th>
                  <th className="tableHdr">Autoclave Capacity</th>
                  <th className="tableHdr">Deep Burial Capacity</th>
                  <th className="tableHdr">Any Other Capacity</th>
                  <th className="tableHdr">Delete</th>
                </tr>

                {districtBmwData.map((res: any) => (
                  <tr className="backGrey">
                    <td className="tableHdr">{res.dstr}</td>
                    <td className="tableHdr">{res.gnrt}</td>
                    <td className="tableHdr">{res.inccp}</td>
                    <td className="tableHdr">{res.autcp}</td>
                    <td className="tableHdr">{res.depcp}</td>
                    <td className="tableHdr">{res.othrcp}</td>
                    <td className="tableHdr" onClick={() => deleteDstrData(res.dstr)}>Delete</td>
                  </tr>
                ))}


              </table>
            </>
            : <></>} */}
          <div className="mt-6" style={{ marginTop: '70px' }}>
            {year ? <> <Seperator heading={`Part-3 : Information on Health Care Facilities having Captive Treatment Facilities (for the previous calendar Year ${year})`}></Seperator></> : <>
              <Seperator smallheading={year ? "" : "Please select year to enable input field"} heading={`Part-3 : Information on Health Care Facilities having Captive Treatment Facilities (for the previous calendar Year ${year})`}></Seperator>
            </>

            }

            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. Number</th>
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
              speaker={'Enter Name of Captive HCF'}
              delayClose={1000}
              placement='right'
              ClssName=''
              sNo={"8.1"}

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
              speaker={'Enter Address HCF'}
              delayClose={1000}
              sNo={"8.2"}
              placement='bottom'

              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Red Category Waste (Kg/day)'
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
              speaker={'Enter Biomedical Waste Red  (kg/Day)'}
              delayClose={1000}
              placement='left'
              sNo={"8.3"}
              ClssName=''
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Yellow Category Waste (Kg/day)'
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
              speaker={'Enter Biomedical Waste Yelow  (kg/Day)'}
              sNo={"8.4"}
              delayClose={1000}
              ToolTip="Enter numbers only"
              noofDecimals={3}
              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='White Category Waste (kg/day)'
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
              speaker={'Enter Biomedical Waste White (kg/Day)'}
              delayClose={1000}
              sNo={"8.5"}
              ClssName=''
              ToolTip="Enter numbers only"
              noofDecimals={3}
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Blue Category Waste (Kg/day)'
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
              speaker={'Enter Biomedical Waste Red (kg/Day)'}
              delayClose={1000}
              ClssName=''
              sNo={"8.6"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Cytotoxic Waste (Kg/day)'
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
              speaker={'Enter Biomedical Waste Red (kg/day)'}
              delayClose={1000}
              ClssName=''
              sNo={"8.7"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Incinerator Capacity (Kg/day)'
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
              speaker={'Enter AutoClave Capacity (kg/Day)'}
              delayClose={1000}
              ClssName=''
              sNo={"8.8"}
              noofDecimals={3}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Autoclave Capacity (kg/day)'
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
              speaker={'Enter AutoClave Capacity (Kg/day)'}
              delayClose={1000}
              ClssName=''
              sNo={"8.9"}
              noofDecimals={3}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label=' Number of Deep Burial Pits (kg/day)'
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
              speaker={'Enter Number of Deep Burial Pits (kg/day)'}
              delayClose={1000}
              sNo={"8.10"}
              ClssName=''
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Other Capacity (Kg/day)'
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
              speaker={'Enter Other Capacity (Kg/day)'}
              delayClose={1000}
              ClssName=''
              sNo={"8.11"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Treated in Incinerator (Kg/day)'
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
              speaker={'Enter Treated in Incinerator (Kg/day)'}
              delayClose={1000}
              ClssName=''
              sNo={"8.12"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label=' Treated in Autoclave/microwave (Kg/day)'
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
              speaker={'Enter Treated in Autoclave/microwave (Kg/day)'}
              delayClose={1000}
              ClssName=''
              noofDecimals={3}
              sNo={"8.13"}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Disposed of through Deep Burial Treated (Kg/day)'
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
              speaker={'Enter Disposed of through Deep Burial Treated (Kg/day)'}
              delayClose={1000}
              ClssName=''
              sNo={"8.14"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Other Treated (Kg/day)'
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
              speaker={'Enter Other Treated (Kg/day)'}
              delayClose={1000}
              ClssName=''
              noofDecimals={3}
              sNo={"8.15"}

              ToolTip="Enter numbers only" ></WtrInput>
            {/* </table> */}
            {/* {hideInState ? <>
              <div className="flex justify-center py-7">
                <div className="mr-4">
                  <Button
                    size="medium"
                    style={{ backgroundColor: "#3B71CA" }}
                    variant="contained"
                    color="success"
                    disabled={!state.disableA}
                    startIcon={<SaveIcon />}
                    onClick={addHcfCptvClick}
                  >
                    Add Details  of Other HCF
                  </Button>
                </div>
              </div> </> : <></>} */}


          </div>

          {(hcfCptvData && hcfCptvData.length) ?
            <>
              <Seperator heading={`Part-3 : Information on Health Care Facilities having Captive Treatment Facilities (for the previous calendar Year ${year})`}></Seperator>
              <table className="mt-2">
                <tr className="py-3">
                  <th className="tableHdr border">Name and address of the health care facility</th>
                  <th className="tableHdr border" colSpan={6}>Quantity of BMW generation in (kg/day) </th>
                  <th className="tableHdr border" colSpan={4}>Total installed treatment capacity in (kg/day)</th>

                  <th className="tableHdr border" style={{ width: "14%" }}>Total biomedical waste treated and disposed by health care facilities in (kg/day)</th>

                  {/* <th className="tableHdr border">Delete</th> */}
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
                  {/* <th className="tableHdr1 border"></th> */}
                </tr>

                {hcfCptvData.map((res: any) => (
                  <tr className="backGrey">
                    <td className="tableHdr border">{res.hcfcpt + "  add: " + res.hcfadd}</td>
                    <td className="tableHdr border">{res.wstylw}</td>
                    <td className="tableHdr border">{res.wstred}</td>
                    <td className="tableHdr border">{res.wstblu}</td>
                    <td className="tableHdr border">{res.wstwht}</td>
                    <td className="tableHdr border">{res.wstcyt}</td>
                    <td className="tableHdr border">{Number(Number(res.wstblu?res.wstblu:0) + Number(res.wstred?res.wstred:0) + Number(res.wstylw?res.wstylw:0) + Number(res.wstwht?res.wstwht:0) + Number(res.wstcyt?res.wstcyt:0)).toFixed(3)}</td>
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

                    {/* <td className="tableHdr border" onClick={() => deleteHcfCptvData(res.dstr)}>Delete</td> */}
                  </tr>
                ))}


              </table>
            </>
            : <></>}


          {/* ******************************************************************** */}



          <div className="mt-6" style={{ marginTop: '70px' }}>
            {year ? <> <Seperator heading={`Part-4: Information on Common Bio-Medical Waste Treatment and Disposal Facilities (for the previous calendar Year ${year})`}></Seperator></> : <>
              <Seperator smallheading={year ? "" : "Please select year to enable input field"} heading={`Part-4: Information on Common Bio-Medical Waste Treatment and Disposal Facilities (for the previous calendar Year ${year} )`}></Seperator>

            </>

            }
            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. Number</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}

            {/* <tr>
              <td className="tableHdr1 px-3">9.1</td>
              <td className="tableHdr1 px-3">Name and Address of the Common Bio Medical Waste Treatment
                Facilities with  contact person name and telephone number</td>
              <td></td>
            </tr> */}
            {/* <WtrInput
              displayFormat={"3"}
              Label='Name  Common Bio Medical Waste Treatment Facilities '
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
              speaker={'Enter Name of CBWTF'}
              delayClose={1000}
              placement='right'
              ClssName=''
              sNo={"i"}

            ></WtrInput> */}
            {/* <WtrInput
              displayFormat={"3"}
              Label='Address of the Common Bio Medical Waste Treatment Facilities '
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
              speaker={'Enter Address of CBWTF'}
              delayClose={1000}
              placement='right'

              ClssName=''
              sNo={"ii"}
            ></WtrInput> */}
            {/* <WtrInput
              displayFormat={"3"}
              Label=' Contact person Name'
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
              speaker={'Enter Contact person Name of CBWTF'}
              delayClose={1000}
              placement='right'
              ClssName=''
              sNo={"iii"}

            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label='Telephone Number '
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
              speaker={'Enter Telephone Number'}
              delayClose={1000}
              placement='right'
              ClssName=''

              sNo={"iv"}
            ></WtrInput>
            <tr>
              <td className="tableHdr1 px-3">9.2</td>
              <td className="tableHdr1 px-3">GPS Coordinates</td>
              <td></td>
            </tr>
            <WtrInput
              displayFormat={"3"}
              Label='Latitude (Units for GPS should be provided in decimal degrees)'
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
              speaker={'Enter Latitude'}
              allowDecimal={true}
              maxValue={40}
              minValue={20}
              delayClose={1000}
              sNo={"i"}
              placement='bottom'

              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Longitude (Units for GPS should be provided in decimal degrees)'
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
              speaker={'Enter Longitude'}
              allowDecimal={true}
              delayClose={1000}
              sNo={"ii"}
              placement='bottom'

              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Coverage Area in Sq Km'
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
              speaker={'Enter Coverage Area in KMS'}
              delayClose={1000}
              minValue={0}
              maxValue={500}
              placement='left'
              sNo={"9.3"}
              ClssName=''

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Name of the cities/ areas covered by Common BioMedical Waste Treatment Facilities'
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
              speaker={'Enter Name of the cities/ areas'}
              sNo={"9.4"}
              delayClose={1000}
              unblockSpecialChars={true}
              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total number of Health Care Facilities being covered'
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
              speaker={'Enter Total number of Health Care'}
              delayClose={1000}
              sNo={"9.5"}
              ClssName=''

              ToolTip="Enter numbers only" ></WtrInput>

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
              speaker={'Enter Total number of beds coverd'}
              delayClose={1000}
              ClssName=''
              sNo={"9.6"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Quantity of BioMedical Waste collected from member Health Care Facilities in (kg/day) '
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
              speaker={'Enter Total Quantity of BioMedical Waste'}
              delayClose={1000}
              ClssName=''
              sNo={"9.7"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput> */}

            <WtrInput
              displayFormat={"3"}
              Label='Incinerator Capacity (kg/day)'
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
              speaker={'Enter Incinerator Capacity Per Day'}
              delayClose={1000}
              ClssName=''
              sNo={"9.1"}
              noofDecimals={3}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Plasma pyrolysis Capacity (kg/day)'
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
              speaker={'Enter Plasma pyrolysis Capacity Per Day'}
              delayClose={1000}
              ClssName=''
              sNo={"9.2"}
              noofDecimals={3}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Autoclave Capacity (kg/day)'
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
              speaker={'Enter Autoclave Capacity (kg/day)'}
              delayClose={1000}
              sNo={"9.3"}
              ClssName=''
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Hydroclave Capacity (kg/day)'
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
              speaker={'Enter Hydroclave Capacity Per Day'}
              delayClose={1000}
              ClssName=''
              sNo={"9.4"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Microwave Capacity (kg/day)'
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
              speaker={'Enter Microwave Capacity Per Day'}
              delayClose={1000}
              ClssName=''
              sNo={"9.5"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Shredder Capacity (kg/day)'
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
              speaker={'Enter Shredder Capacity Per Day'}
              delayClose={1000}
              ClssName=''
              sNo={"9.6"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

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
              speaker={'Enter Sharps encapsulation  or concrete pit Capacity Per Day'}
              delayClose={1000}
              ClssName=''
              sNo={"9.7"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Deep burial Pits Capacity (kg/day)'
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
              speaker={'Enter Deep burial pits  Capacity Per Day'}
              delayClose={1000}
              ClssName=''
              sNo={"9.8"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Any other equipment Capacity (kg/day)'
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
              speaker={'Enter Any other equipment Capacity Per Day'}
              delayClose={1000}
              ClssName=''
              sNo={"9.9"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Effluent Treatment CBWTF  Capacity (kg/day)'
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
              speaker={'Enter Effluent Treatment CBWTF  Capacity Per Day'}
              delayClose={1000}
              ClssName=''
              sNo={"9.10"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>


            {/* ***************************************** */}



            <WtrInput
              displayFormat={"3"}
              Label='Incinerator Capacity number'
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
              speaker={'Enter Incinerator Number'}
              delayClose={1000}
              ClssName=''
              sNo={"9.11"}

              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Plasma pyrolysis Capacity number'
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
              speaker={'Enter Plasma pyrolysis Number'}
              delayClose={1000}
              ClssName=''
              sNo={"9.12"}

              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Autoclave Capacity number'
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
              speaker={'Enter Autoclave Capacity number'}
              delayClose={1000}
              sNo={"9.13"}
              ClssName=''

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Hydroclave Capacity number'
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
              speaker={'Enter Hydroclave Number'}
              delayClose={1000}
              ClssName=''
              sNo={"9.14"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Microwave Capacity number'
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
              speaker={'Enter Microwave Number'}
              delayClose={1000}
              ClssName=''
              sNo={"9.15"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Shredder Capacity number'
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
              speaker={'Enter Shredder Number'}
              delayClose={1000}
              ClssName=''
              sNo={"9.16"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Sharps encapsulation or concrete pit Capacity number'
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
              speaker={'Enter Sharps encapsulation  or concrete pit Number'}
              delayClose={1000}
              ClssName=''
              sNo={"9.17"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Deep burial Pits Capacity number'
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
              speaker={'Enter Deep burial pits  Number'}
              delayClose={1000}
              ClssName=''
              sNo={"9.18"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Any other equipment Capacity number'
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
              speaker={'Enter Any other equipment Number'}
              delayClose={1000}
              ClssName=''
              sNo={"9.19"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Effluent Treatment CBWTF  Capacity number'
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
              speaker={'Enter Effluent Treatment CBWTF  Number'}
              delayClose={1000}
              ClssName=''
              sNo={"9.20"}

              ToolTip="Enter numbers only"></WtrInput>


            {/* ****************************************************** */}


            <WtrInput
              displayFormat={"3"}
              Label='Incinerator Total (kg/day)'
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
              speaker={'Enter IncineratorTotal (kg/day)'}
              delayClose={1000}
              ClssName=''
              sNo={"9.21"}
              noofDecimals={3}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
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
              sNo={"9.22"}
              noofDecimals={3}
              ToolTip="Enter numbers only" ></WtrInput>

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
              sNo={"9.23"}
              ClssName=''
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"9.24"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"9.25"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"9.26"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"9.27"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"9.28"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"9.29"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"9.30"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>



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
              sNo={"9.38"}
              ToolTip="Enter numbers only"></WtrInput> */}

            <WtrInput
              displayFormat={"3"}
              Label='Incineration Quantity'
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
              speaker={'Enter Incineration Quantity'}
              delayClose={1000}
              ClssName=''
              sNo={"9.31"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Incineration Disposed by:'
              fldName='incdispcbwtf'
              idText='txtincdispcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter Disposed by:'}
              delayClose={1000}
              ClssName=''
              sNo={"9.32"}
              unblockSpecialChars={true}

              ToolTip="Enter numbers only"></WtrInput>



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
              sNo={"9.41"}
              ToolTip="Enter numbers only"></WtrInput> */}

            <WtrInput
              displayFormat={"3"}
              Label='Sharps Quantity'
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
              speaker={'Enter Sharps Quantity'}
              delayClose={1000}
              ClssName=''
              sNo={"9.33"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Sharps Disposed by:'
              fldName='shpdispcbwtf'
              idText='txtshpdispcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter Disposed by:'}
              delayClose={1000}
              ClssName=''
              sNo={"9.34"}
              unblockSpecialChars={true}
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"9.44"}
              ToolTip="Enter numbers only"></WtrInput> */}

            <WtrInput
              displayFormat={"3"}
              Label=' Plastics Quantity'
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
              speaker={'Enter Plastics Quantity'}
              delayClose={1000}
              ClssName=''
              sNo={"9.35"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Plastics Disposed by:'
              fldName='plsdispcbwtf'
              idText='txtplsdispcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter Disposed by:'}
              delayClose={1000}
              ClssName=''
              sNo={"9.36"}
              unblockSpecialChars={true}
              ToolTip="Enter numbers only"></WtrInput>
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
              sNo={"9.47"}
              ToolTip="Enter numbers only"></WtrInput> */}

            <WtrInput
              displayFormat={"3"}
              Label=' ETP Sludge Quantity'
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
              speaker={'Enter ETP Sludge Quantity'}
              delayClose={1000}
              ClssName=''
              sNo={"9.37"}

              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='ETP Sludge Disposed by:'
              fldName='etpdispcbwtf'
              idText='txtetpdispcbwtf'
              onChange={onChangeCbwtfCptv}
              dsabld={year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter Disposed by:'}
              delayClose={1000}
              ClssName=''
              sNo={"9.38"}
              unblockSpecialChars={true}
              ToolTip="Enter numbers only"></WtrInput>

            {/* ****************************************************************** */}

            {/* </table> */}
            {/* {hideInState ? <>
              <div className="flex justify-center py-7">
                <div className="mr-4">
                  <Button
                    size="medium"
                    style={{ backgroundColor: "#3B71CA" }}
                    variant="contained"
                    color="success"
                    disabled={!state.disableA}
                    startIcon={<SaveIcon />}
                    onClick={addCbwtfCptvClick}
                  >
                    Add Data
                  </Button>
                </div>
              </div> </> : <></>
            } */}

          </div>

          {(cbwtfData && cbwtfData.length) ?
            <>
              <Seperator heading={`Part 4: Information on Common Bio-Medical Waste Treatment and Disposal Facilities (for the previous calendar Year ${year})`}></Seperator>
              <div className="table-container">
              <table className="mt-2">
                <tr className="py-3">
                  <th className="tableHdr border" colSpan={4}>General information</th>
                  <th className="tableHdr border" colSpan={2}>GPS coordinates </th>
                  <th className="tableHdr border" >Coverage area in kms </th>

                  <th className="tableHdr border">Name of the cities/ areas covered by common bioMedical waste treatment facilities</th>

                  <th className="tableHdr border">Total number of health care facilities being covered</th>
                  <th className="tableHdr border">Total number of beds covered</th>
                  <th className="tableHdr border" >Total quantity of bio medical waste collected from member health care facilities in (kg/day) </th>
                  <th className="tableHdr border" colSpan={3}>Capacity of treatment equipments installed by common bio medicalWaste treatment facilities </th>

                  <th className="tableHdr border" >Total bioMedical waste treated in (kg/day) </th>

                  <th className="tableHdr border">Method of disposal of treated wastes (Incineration ash/sharps/plastics) </th>
                  {/* <th className="tableHdr border">Delete</th> */}
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
                  <th className="tableHdr1 border"></th>
                </tr>

                {cbwtfData.map((res: any) => (
                  <tr className="backGrey">
                    <td className="tableHdr border" >{res.nmaddcbwtf}</td>
                    <td className="tableHdr border" >{res.addresscbwtf}</td>
                    <td className="tableHdr border" >{res.contcbwtf}</td>
                    <td className="tableHdr border" >{res.telphcbwtf}</td>
                    <td className="tableHdr border" >{res.gpscbwtf}</td>
                    <td className="tableHdr border" >{res.gpslongcbwtf}</td>
                    <td className="tableHdr border"  >{res.cvrcbwtf}</td>
                    <td className="tableHdr border"  >{res.ctycbwtf}</td>
                    <td className="tableHdr border"  >{res.ttlhcfcbwtf}</td>
                    <td className="tableHdr border"  >{res.ttlbdcbwtf}</td>
                    <td className="tableHdr border"  >{res.qntcbwtf}</td>

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
                      <div className="equal-row "> Effluent treatment CBWTF </div>
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
                      <div className=" equal-row tableHr">{Number(res.inccpcbwtf?res.inccpcbwtf:0) + Number(res.autocbwtf?res.autocbwtf:0)
                        + Number(res.hydrcbwtf?res.hydrcbwtf:0) + Number(res.micrpcbwtf?res.micrpcbwtf:0) + Number(res.shrcbwtf?res.shrcbwtf:0) + Number(res.shrpcbwtf?res.shrpcbwtf:0) +
                        Number(res.deepcbwtf?res.deepcbwtf:0) + Number(res.othrcpcbwtf?res.othrcpcbwtf:0) + Number(res.effcbwtf?res.effcbwtf:0)}
                        </div>
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
                      <div className=" equal-row tableHr">{Number(res.inccpnocbwtf?res.inccpnocbwtf:0) + Number(res.psmnocbwtf?res.psmnocbwtf:0) + Number(res.autonocbwtf?res.autonocbwtf:0)
                        + Number(res.hydrnocbwtf?res.hydrnocbwtf:0) + Number(res.micrpnocbwtf?res.micrpnocbwtf:0) + Number(res.shrnocbwtf?res.shrnocbwtf:0) + Number(res.shrpnocbwtf?res.shrpnocbwtf:0) +
                        Number(res.deepnocbwtf?res.deepnocbwtf:0) + Number(res.othrcpnocbwtf?res.othrcpnocbwtf:0) + Number(res.effnocbwtf?res.effnocbwtf:0)}</div>
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
                      <div className=" equal-row tableHr">{Number(res.inccpttlcbwtf?res.inccpttlcbwtf:0) + Number(res.psmttlcbwtf?res.psmttlcbwtf:0) + Number(res.autottlcbwtf?res.autottlcbwtf:0)
                        + Number(res.hydrttlcbwtf?res.hydrttlcbwtf:0) + Number(res.micrpttlcbwtf?res.micrpttlcbwtf:0) + Number(res.shrttlcbwtf?res.shrttlcbwtf:0) + Number(res.shrpttlcbwtf?res.shrpttlcbwtf:0) +
                        Number(res.deepttlcbwtf?res.deepttlcbwtf:0) + Number(res.othrcpttlcbwtf?res.othrcpttlcbwtf:0) + Number(res.effttlcbwtf?res.effttlcbwtf:0)}</div>
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
                          <div className="">ETP Sludge: </div>
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
                    {/* <td className="tableHdr border" onClick={() => deleteCbwtfData(res.dstr)}>Delete</td> */}

                  </tr>
                ))}
          


              </table>
              </div>
            </>
            : <></>
          }



          <div className="mt-6" style={{ marginTop: '70px' }}>
            {/* <Seperator heading="Additional Information"></Seperator>
            <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. Number</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>
              </thead> */}

            {/* <WtrInput
              displayFormat={"3"}
              Label='Total Number of transportation vehicles used for collection of BMW on daily basis by the noCBWTF:'
              speaker='Enter Total Number of transportation vehicles used for collection of BMW on daily basis by the CBWTF:'
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
              sNo={"13.1"}

              ClssName=''
              ToolTip="Enter numbers only"></WtrInput>
 */}


            {/* <WtrInput
              displayFormat={"3"}
              Label="List of Health Care Facilities not having membership with the CBWTF and neither having captive treatment facilities:"
              speaker="Enter List of Health Care Facilities not having membership with the CBWTF and neither having captive treatment facilities:"
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
              sNo={"13.2"}
              ClssName=''

              ToolTip="Enter numbers only"></WtrInput> */}

            {/* <WtrInput
              displayFormat={"3"}
              Label="Number of trainings organised by the Common BMW Treatment Facility operators"
              speaker="Enter Number of trainings organised by the Common BMW Treatment Facility operators"
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
              sNo={"13.3"}
              ClssName=''

              ToolTip="Enter numbers only"></WtrInput> */}

            {/* <WtrInput
              displayFormat={"3"}
              Label="Number of Accidents reported by the Common Bio Medical Waste Treatment Facilities"
              speaker="Number of Accidents reported by the Common Bio Medical Waste Treatment Facilities"
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
              sNo={"13.4"}
              ClssName=''

              ToolTip="Enter numbers only"></WtrInput> */}

            {/* </table> */}
          </div>



        </div>
        {/* {hideInState ? <>
          <div className="flex justify-center py-7">
            <div className="mr-4">
              <Button
                size="medium"
                style={{ backgroundColor: "#3B71CA" }}
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
                style={{ color: "#3B71CA", backgroundColor: "#fff" }}
                variant="contained"
                color="success"
                disabled={!state.disableA}
                startIcon={<SaveIcon />}
                onClick={clrFunct}
              >
                Reset Form
              </Button>
            </div>
          </div>
        </> : <></>} */}

      </div>
    </div >
  );
}; export default React.memo(Stt_Consolidate);
import React, { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@mui/material";

import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  capitalize,
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
import { control_focus, getLvl, getWho } from "../../../utilities/cpcb";
import { nrjAxiosRequestBio, nrjAxiosRequestLinux } from "../../../Hooks/useNrjAxios";
import { getFldValue } from "../../../Hooks/useGetFldValue";
import WtrRsSelect from "../../../components/reusable/nw/WtrRsSelect";
import NrjRsDt from "../../../components/reusable/NrjRsDt";
import Control from "ol/control/Control";

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





const SttMonthlyReport = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [sttValue, setSttValue] = useState<string>("");
  const [rgdValue, setRgdValue] = useState<string>("");
  //for disable controls
  const [arrytab, setArryTab] = useState(new Array(4).fill(true));


  const hideInState = getLvl() == 'STT' ? true : false;

  const reqFlds = [
    { fld: 'dt_month', msg: 'Select Month ', chck: '1[length]' },
    { fld: "spcorg", msg: "Enter name of state organization", chck: "1[length]" },
    { fld: "spcnodf", msg: "Enter name of nodal officer", chck: "1[length]" },
    { fld: "nodfphn", msg: "Enter phone of nodal officer", chck: "[mob]" },
    { fld: "nodfeml", msg: "Enter Email of nodal officer", chck: "[email]" },
    { fld: "tothcf", msg: "Enter total number of HCF", chck: "1[length]" },
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
    { fld: "totbeds", msg: "Enter total no of beds", chck: "1[length]" },
    { fld: "ocpinlq", msg: "Enter Number of occupiers installed liquid waste treatment facility", chck: "1[length]" },
    { fld: "biomwst", msg: "Enter Number of occupiers constituted BMW management Committees", chck: "1[length]" },
    // ===========================================================================================

    { fld: 'ttlapp', msg: 'Enter Total no of HCF applied for authorization', chck: '1[length]' },
    { fld: 'ttlgrt', msg: 'Enter Total No Authorized HCF', chck: '1[length]' },
    { fld: 'totcns', msg: 'Enter Total No Under Consideration', chck: '1[length]' },
    { fld: 'totrej', msg: 'Enter Total No Applications Rejected', chck: '1[length]' },
    { fld: 'ttlwth', msg: 'Enter Total no of HCF in operation without authorization', chck: '1[length]' },

    { fld: 'ttlauthapp', msg: 'Enter Total No  of Auth HCF out of total HCF', chck: '1[length]' },
    { fld: 'ttlunauthapp', msg: 'Enter Total No  of Unauth HCF out of total HCF', chck: '1[length]' },
    // ===========================================================================================
    { fld: 'wstgnr', msg: 'Enter Quantity of BMW Generation (in (kg/day))', chck: '1[length]' },
    { fld: 'wstgnrbd', msg: 'Enter Biomedical Waste Generated Bedded Hospital', chck: '1[length]' },
    { fld: 'wstgnrnbd', msg: 'Enter Biomedical Waste Generated Non Bedded', chck: '1[length]' },
    { fld: 'wstgnroth', msg: 'Enter Biomedical Waste Treated and Disposed', chck: '1[length]' },
    // ===========================================================================================
    { fld: 'hcfcptv', msg: "Enter No. of HCFs having captive treatment facilities", chck: '1[length]' },
    { fld: 'hcfcptvopr', msg: 'Enter No of captive incinerators operated by HCFs', chck: '1[length]' },
    { fld: 'cptvwst', msg: 'Enter Total BMW treated by captive treatment facilities by HCF in (kg/day)', chck: '1[length]' },
    { fld: 'capin', msg: 'Enter Number of captive incinerators complying to the norms', chck: '1[length]' },
    { fld: 'deepburpits', msg: 'Enter No. of HCF having deep burial pits', chck: '1[length]' },
    // ===========================================================================================
    { fld: 'cbwtfopr', msg: 'Enter Total CBWTF in Operation', chck: '1[length]' },
    { fld: 'cbwtfcns', msg: 'Enter Total No CBWTF under Construction', chck: '1[length]' },
    { fld: 'wsttrt', msg: 'Enter Biomedical Waste Treated  and Disposed through CBWTF (Kg/day)', chck: '1[length]' },
    { fld: 'ttlcoem', msg: 'Enter No. of CBWTFs that have installed OCMS', chck: '1[length]' },
    { fld: 'monsys', msg: 'Enter Number of Common Bio Medical Waste Treatment Facilities that have installed Continuous Online Emission Monitoring Systems' },

    // ===========================================================================================

    { fld: 'ttlbmw', msg: 'Enter Total Biomedical Waste', chck: '1[length]' },
    { fld: 'wstath', msg: 'Enter Total Biomedical Waste Disposed by Authorized Recycler (Kg/day)', chck: '1[length]' },

    // ===========================================================================================
    { fld: 'vlthcf', msg: 'Enter Total no. of Violations by HCF', chck: '1[length]' },
    { fld: 'vltcbtwf', msg: 'Enter Total no. of Violations by CBWTF', chck: '1[length]' },
    { fld: 'vltothr', msg: 'Enter Total no. of Violations by Others', chck: '1[length]' },
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
    { fld: 'ashcbwtf', msg: 'Enter Ash Cbwtf', chck: '1[length]' },
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
    { fld: 'etpcbwtf', msg: 'Enter ETP Sludge ', chck: '1[length]' },
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
    { fld: 'plscbwtf', msg: 'Enter Plastic Cbwtf', chck: '1[length]' },
    { fld: 'plsdispcbwtf', msg: 'Enter Plastic Disposed by', chck: '1[length]' },
    { fld: 'plsqntycbwtf', msg: 'Enter  Plastic Quantity', chck: '1[length]' },
    { fld: 'psmcbwtf', msg: 'Enter Plasma pyrolysis  Capacity (kg/day)', chck: '1[length]' },
    { fld: 'psmnocbwtf', msg: 'Enter Plasma pyrolysis Capacity Number', chck: '1[length]' },
    { fld: 'psmttlcbwtf', msg: 'Enter Plasma pyrolysis Capacity Total (kg/day)', chck: '1[length]' },
    { fld: 'qntcbwtf', msg: 'Enter Total Quantity of Cbwtf', chck: '1[length]' },
    { fld: 'shpcbwtf', msg: 'Enter Sharps Cbwtf', chck: '1[length]' },
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


  useEffectOnce(() => {
    // let value1 = new Date().getFullYear()
    // setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}`)
    dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board` })
  })

  const GridLoaded = () => {
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
  };
  const onRowSelected = (data: string) => { };
  const [formDataGet, setFormData] = useState('')
  const [showMes,setShowMes]= useState('This value is equal to the sum of points 5.3 and 6.3.')
  const [bmwCaptiv,setBmwCaptive]=useState('')
  const [bmwst,setBmWst]=useState('')

  const onChangeDts = (data: string) => {
    let fldNme: any = utilities(2, data, "");
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    if (fldNme == 'dt_month') {
      setYear(getFldValue(data, 'dt_month'))
      let selectMonth=(getFldValue(data, 'dt_month'))
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_month][${selectMonth}=dt_month][${selectMonth}` })
    }
    let ttlbmw :number =0
   
    if(fldNme =='cptvwst'){
      setBmwCaptive(getFldValue(data, 'cptvwst'))
      ttlbmw=Number(getFldValue(data, 'cptvwst'))
      if(bmwst){
        ttlbmw = ttlbmw+Number(bmwst)
      }
    }
    if(fldNme =='wsttrt'){
      setBmWst(getFldValue(data, 'wsttrt'))  
      ttlbmw=Number(getFldValue(data, 'wsttrt'))
      if(bmwCaptiv){
        ttlbmw = ttlbmw+Number(bmwCaptiv)
      }
    }
    if(ttlbmw>0){
      dispatch({ type: ACTIONS.FORM_DATA, payload: 'ttlbmw]['+ttlbmw });
    }
    // const fieldsCheckDecimal = ['wstgnr', 'wstgnrbd', 'wstgnrnbd', 'wstgnroth', 'cptvwst', 'wsttrt', 'wstath'];
    // fieldsCheckDecimal.forEach(fld => {
    //   if (fldNme == fld) {
    //     const val = getFldValue(data, fld);
    //     // Check if value includes a decimal point
    //     if (val.includes('.')) {
    //       const parts = val.split('.');
    //       if (parts[1].length <= 3) {
    //         dispatch({ type: ACTIONS.FORM_DATA, payload: `${fld}][${val}` });
    //       } else {
    //         showToaster(['in (kg/day) after decimal  only 3 digit allow'], 'error');
    //         // remove last digit when user input  more than 3 digit
    //         const trimmedValue = `${parts[0]}.${parts[1].substring(0, 3)}`;
    //         dispatch({ type: ACTIONS.FORM_DATA, payload: `${fld}][${trimmedValue}` })
    //       }
    //     }
    //   }

    // });
   
  };

  const onChangeDstr = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA_DSTR, payload: data });
  };
  const [numberOfDistr, setNumberOfDistr] = useState('')

  const onChangeNoDstrn = (data: string) => {
    let fld: any = utilities(2, data, "");
    setNumberOfDistr(getFldValue(data, 'nodstr'))
    dispatch({ type: ACTIONS.FORM_DATA_NUMBER_OF_DSTR, payload: data });

  }

  const onChangeHcfCptv = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA_HCFCPTV, payload: data });
  };

  const onChangeCbwtfCptv = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA_CBWTF, payload: data });
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
    return nrjAxiosRequestLinux("AR_filing", formData)
  };

  const fillEmptyValue = (formData: any) => {
    let emptyfld = ["totvet", "totanh", "totpth", "totbld", "totcln", "totrsh", "totaysh", "totcns", "cbwtfcns", "ttlcoem", "wstath", "vlthcf", "vltcbtwf", "vltothr", "shwhcf", "shwcbtwf", "shwothr", "wrkspyr", "ocpinlq", "capin", "deepburpits", "trnorg", "biomwst", "anlrp", "pretr", "monsys"]
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
    let msg1: any = validForm(api1, reqFldsDstr);
    let msg2: any = validForm(api4, reqFldNumberDstr);
    let msg3: any = validForm(api2, reqsFldsHcfCptv);
    let msg4: any = validForm(api3, reqsFldsCbwtf);

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
      showToaster(['Total no of HCF applied for authorization could not be less than total no of authorization applied '], 'error');
      return;
    }
    if (Number(getFldValue(api, 'ttlapp')) == Number(getFldValue(api, 'ttlgrt')) + Number(getFldValue(api, 'totrej')) + Number(getFldValue(api, 'totcns'))) {
      showToaster(['Total no of HCF applied for authorization could  be equal than Total no. of HCF granted authorization  and total no of authorization rejected orctotal number of under Consideration  '], 'error');
      return;
    }
    if (Number(getFldValue(api, 'ttlapp')) - Number(getFldValue(api, 'totrej')) < 0) {
      showToaster(['Total no of applied authorization cannot be less than total no of authorization rejected '], 'error');
      return;
    }
    if (Number(getFldValue(api, 'ttlapp')) - Number(getFldValue(api, 'ttlwth')) < 0) {
      showToaster(['Total no of applied authorization cannot be less than total no of HCF in operation without autorization'], 'error');
      return;
    }
    if (Number(getFldValue(api, 'wstgnr')) == Number(getFldValue(api, 'wstgnrbd')) + Number(getFldValue(api, 'wstgnrnbd')) + Number(getFldValue(api, 'wstgnroth'))) {
      showToaster(['Quantity of BMW Generation (in (kg/day)) coulb be equal than Total Biomedical Waste Generated by Bedded Hospital and Total Biomedical Waste Generated by Non Bedded Hospital or Total Biomedical Waste Generated (Other) (kg/day)'], 'error');
      return;
    }
    if (Number(getFldValue(api, 'wstgnr')) - Number(getFldValue(api, 'wstgnrbd')) < 0) {
      showToaster(['Quantity of BMW Generation (in (kg/day)) cannot be less than Total Biomedical Waste Generated by Bedded Hospital'], 'error');
      return;
    }
    if (Number(getFldValue(api, 'wstgnr')) - Number(getFldValue(api, 'wstgnrnbd')) < 0) {
      showToaster(['Quantity of BMW Generation (in (kg/day)) cannot be less than Total Biomedical Waste Generated by Non Bedded Hospital'], 'error');
      return;
    }
    if (Number(getFldValue(api, 'wstgnr')) - Number(getFldValue(api, 'wstgnroth')) < 0) {
      showToaster(['Quantity of BMW Generation (in (kg/day)) cannot be less than Total Biomedical Waste Generated by Other'], 'error');
      return;
    }


    if (Number(getFldValue(api, 'ttlbmw')) == Number(getFldValue(api, 'cptvwst')) + Number(getFldValue(api, 'wsttrt'))) {
      showToaster(['Total Biomedical Waste could be  equal than sum of Total Biomedical Waste Treated and Disposed through CBWTF (kg/day) or Total BMW treated by captive treatment facilities by HCF in (kg/day) '], 'error');
      return;
    }
    if (Number(getFldValue(api4, 'nodstr')) > Number(districtBmwData.length)) {
      showToaster(['Add district details is Equal   number of district'], 'error');
      return;

    }


    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetch();
  };

  const svdQry = (data: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    let dt: any = GetResponseLnx(data);


    setArryTab(prevArray => {
      const newArray = [...prevArray];
      newArray[1] = false;
      return newArray;
    });

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

  useEffectOnce(() => {
    refetchGetData();
  });

  const GetSvData = (year: string) => {

    let who = getStateAbbreviation(capitalize(getWho()));
    let lvl = 'STT'
    if (sttValue) {
      who = sttValue;
      lvl = 'STT'
    } else if (rgdValue) {
      who = rgdValue;
      lvl = 'RGD'
    }
    dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board=dt_month][${year}=dt_month][${year}` })

    clrFunct();
    
    if (!hideInState) {
      let usrnm = getUsrnm();
      let cmpid = getCmpId();
      let payload: any = postLinux(lvl + '=' + who + "=" + year + "=state_mr=" + usrnm + '=' + cmpid, 'show_AR_filing')
      return nrjAxiosRequestLinux("show_AR_filing", payload);
    } else if (year) {
      let payload: any = postLinux('STT=' + who + "=" + year + "=state_mr=" + capitalize(getWho()) + " State Pollution Control Board", 'getSpcbAnnualReport')
      return nrjAxiosRequestLinux("get_AR_filing", payload);
    }
    else {
      clrFunct();
      dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board` })
    }
  };

  const ShowData = (dataSvd: any) => {
    let dt: any = GetResponseLnx(dataSvd);
    
    if (year) {
      
      if (dt.status !== "Failed") {
        dt = convertFldValuesToString(dt)
        dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
        let districtBmwData = dataSvd.data['districtData']
        let hcfCptvData = dataSvd.data['hcfCaptiveData']
        let cbwtfData = dataSvd.data['cbwtfData']
        
        setDistrictBmwData(districtBmwData);
        setHcfCptvData(hcfCptvData)
        setCbwtfData(cbwtfData)

      }
      else {
        clrFunct();
        dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board=dt_month][${year}=dt_month][${year}` })
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
    if (!hideInState && (rgdValue || sttValue)) {
      showToaster([dt.message], 'error')
    }
  };

  useEffect(() => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: `spcorg][${capitalize(getWho())} State Pollution Control Board` })
  }, [state.textDts])

  console.log(state.textDts)

  const { data: dataSvd, refetch: refetchGetData } = useQuery({
    queryKey: ["svOldannlauth1", year, rgdValue, sttValue],
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
    console.log('frmData', state.frmdata)
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
            {props.heading}
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
    if (msg && msg[0]) {
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
    let tempData = districtBmwData.filter((res: any) => (res.dstr != dstr))
    let localData = { who: getWho(), year: year, data: tempData }
    localStorage.setItem('districtData', JSON.stringify(localData))
    setDistrictBmwData(tempData);
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
    ashcbwtf: "",
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
    etpcbwtf: "",
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
    plscbwtf: "",
    plsdispcbwtf: "",
    plsqntycbwtf: "",
    psmcbwtf: "",
    psmnocbwtf: "",
    psmttlcbwtf: "",
    qntcbwtf: "",
    shpcbwtf: "",
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

        ashcbwtf: dataJson.ashcbwtf || "0",
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
        etpcbwtf: dataJson.etpcbwtf || "0",
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
        plscbwtf: dataJson.plscbwtf || "0",
        plsdispcbwtf: dataJson.plsdispcbwtf || "0",
        plsqntycbwtf: dataJson.plsqntycbwtf || "0",
        psmcbwtf: dataJson.psmcbwtf || "0",
        psmnocbwtf: dataJson.psmnocbwtf || "0",
        psmttlcbwtf: dataJson.psmttlcbwtf || "0",
        qntcbwtf: dataJson.qntcbwtf || "0",
        shpcbwtf: dataJson.shpcbwtf || "0",
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
        ashcbwtf: dataJson.ashcbwtf || "0",
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
        etpcbwtf: dataJson.etpcbwtf || "0",
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
        plscbwtf: dataJson.plscbwtf || "0",
        plsdispcbwtf: dataJson.plsdispcbwtf || "0",
        plsqntycbwtf: dataJson.plsqntycbwtf || "0",
        psmcbwtf: dataJson.psmcbwtf || "0",
        psmnocbwtf: dataJson.psmnocbwtf || "0",
        psmttlcbwtf: dataJson.psmttlcbwtf || "0",
        qntcbwtf: dataJson.qntcbwtf || "0",
        shpcbwtf: dataJson.shpcbwtf || "0",
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
    let tempData = hcfCptvData.filter((res: any) => (res.dstr != dstr))
    let localData = { who: getWho(), year: year, data: tempData }
    localStorage.setItem('hcfCptvData', JSON.stringify(localData))
    setHcfCptvData(tempData);
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
    let tempData = cbwtfData.filter((res: any) => (res.dstr != cbwtf))
    let localData = { who: getWho(), year: year, data: tempData }
    localStorage.setItem('cbwtfData', JSON.stringify(localData))
    setCbwtfData(tempData);
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

    // refetchB()
  }, [year])

  console.log(state.textDts)


  // useEffectOnce(() => { refetchB() })
  // const GetData = () => {
  //   // let dt = state.textDts2;

  //   // let dt_yearid = getFldValue(dt, "dt_yearid")

  //   let cmpid = getCmpId() || "";
  //   let usrnm = getUsrnm() || "";
  //   let ar_year = year;
  //   let what = 'state_ar';

  //   let who: string = sttValue;
  //   if (year) {
  //     let payload: any = postLinux(ar_year + '=' + usrnm + '=' + cmpid + '=' + what + '=' + 'STT' + '=' + who, 'get_AR_filing');
  //     return nrjAxiosRequestBio("get_AR_filing", payload);
  //   }
  // };

  // const ShowGetData = (data: any) => {

  //   if (data.data.status === 'Failed') {
  //     // showToaster([data.data.message], 'error');
  //     clrFunct()

  //   } else {
  //     let textDts = convertFldValuesToString(data.data);
  //     
  //     setFormData(textDts)
  //     dispatch({ type: ACTIONS.SETFORM_DATA, payload: textDts });
  //     // dispatch({ type: ACTIONS.FORM_DATA, payload:textDts })

  //     let districtBmwData = data.data['districtData']
  //     let hcfCptvData = data.data['hcfCaptiveData']
  //     setDistrictBmwData(districtBmwData);
  //     setHcfCptvData(hcfCptvData)
  //   }


  // }


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
          <h6 className="text-[14px] mt-2"> Annual Report Information on Bio-medical Waste management (to be submitted
            by the State Pollution Control Boards or Pollution Control Committees and Director General Armed Forces Medical
            Services to Central Pollution Control Board on or before 31st July of every year for the period from January to December
            of the preceding calendar year)</h6>
          <div className="mb-4">
            {/* <Seperator heading="Select From Dropdown"></Seperator> */}
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
              ></WtrRsSelect> */}
              <NrjRsDt
                format="MM-yyyy"
                fldName="dt_month"
                displayFormat="1"
                idText="txtdt_month"
                size="lg"
                Label="Select Month"
                selectedValue={state.frmData}
                onChange={onChangeDts}
                speaker={"Select Month"}
                disAbleNextAndCuurrentMonth={true}
                loadOnDemand={true}
              ></NrjRsDt>
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
                ></WtrRsSelect>
              </>}


            </div>
          </div>
          <Seperator heading="Part-1 (Summary of Information) "></Seperator>
          {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
          {/* <thead className="bg-gray-50">
              <tr className="py-3 bg-gray-100">
                <th className="border p-3" scope="col">S. No.</th>
                <th className="border p-3" scope="col">Particulars</th>
                <th className="border p-3" scope="col">Details</th>
              </tr>

            </thead> */}


          <WtrInput
            displayFormat={"3"}
            Label="Name of the Organisation"
            fldName="spcorg"
            idText="txtspcorg"
            onChange={onChangeDts}
            dsabld={true}
            //dsabld={()=> control_name("a", reqFlds)}
            //dsabld = {control_name("a", reqFlds)}
            callFnFocus=""
            dsbKey={false}
            validateFn="1[length]"
            blockNumbers={true}
            allowNumber={false}
            selectedValue={state.textDts}
            clrFnct={state.trigger}
            speaker={"Enter Name of State Organization minimum 5 characters"}
            delayClose={1000}
            placement="right"
            ClssName=""
            ToolTip="Enter a Name without special character"
            sNo={"1.1"}
          ></WtrInput>


          <WtrInput
            displayFormat={"3"}
            Label="Name of Nodal Officer"
            fldName="spcnodf"
            idText="txtspcnodf"
            onChange={onChangeDts}
            dsabld={!hideInState}
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
          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Contact No. of Nodal Officer"
            fldName="nodfphn"
            idText="txtnodfphn"
            onChange={onChangeDts}
            dsabld={!hideInState}
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
          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="e-mail id of Nodal Officer"
            fldName="nodfeml"
            idText="txtnodfeml"
            onChange={onChangeDts}
            dsabld={!hideInState}
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
          ></WtrInput>

          <WtrInput
            displayFormat={"3"}
            Label="Total No. of Health Care Facilities"
            fldName="tothcf"
            idText="txttothcf"
            onChange={onChangeDts}
            dsabld={!hideInState}
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
            sNo={"1.5"}
          ></WtrInput>

          {/* </table> */}


          <div>
            <Seperator heading="Health Care Facilities Category Information"></Seperator>
            {/* <table className="table table-bordered min-w-full  border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. No.</th>
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
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
              Label="Total No. Beds"
              fldName="totbeds"
              idText="txttotbeds"
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=""
              dsbKey={false}
              validateFn="1[length]"
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              speaker={"Enter Total No. of Beds"}
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
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
          <div>
            <Seperator heading="Authorizaton And Waste Information"></Seperator>
            {/*<table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
              <tr className="py-3 bg-gray-100">
                <th className="border p-3" scope="col">S. No.</th>
                <th className="border p-3" scope="col">Particulars</th>
                <th className="border p-3" scope="col">Details</th>
              </tr>

            </thead> */}

            <WtrInput
              displayFormat="3"
              Label='Total No. of authorized HCF out of total HCF'
              fldName='ttlauthapp'
              idText='txtttlauthapp'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn='1[length]'
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              speaker={'Total No. of authorized HCF out of total HCF'}
              delayClose={1000}
              placement='right'
              ToolTip="Enter whole numbers only"
              sNo={"3.1"}
            ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label='Total No. of unauthorized HCF out of total HCF'
              fldName='ttlunauthapp'
              idText='txtttlunauthapp'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn='1[length]'
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              speaker={'Total No. of unauthorized HCF out of total HCF'}
              delayClose={1000}
              placement='right'
              ToolTip="Enter whole numbers only"
              sNo={"3.2"}
            ></WtrInput>
            <WtrInput
              displayFormat="3"
              Label={`Total No. of HCF applied for authorization ${year ? `(${year})` : ''}`}
              fldName='ttlapp'
              idText='txtttlapp'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn='1[length]'
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              speaker={'Enter total No. of HCF applied for authorization'}
              delayClose={1000}
              placement='right'
              ToolTip="Enter whole numbers only"
              sNo={"3.3"}
              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label={`Total No. of HCF's granted authorization ${year ? `(${year})` : ''}`}
              fldName='ttlgrt'
              idText='txtttlgrt'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              Label={`Total No. Under Consideration ${year ? `(${year})` : ''}`}
              displayFormat="3"
              fldName='totcns'
              idText='txttotcns'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              sNo={"3.5"}
              speaker={'Enter Total No Under Consideration'}
            ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label={`Total No. of Application Rejected ${year ? `(${year})` : ''}`}
              speaker='Enter Total No. of Application Rejected'
              fldName='totrej'
              idText='txttotrej'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              Label={`Total No. of HCFs in operation without Authorization ${year ? `(${year})` : ''}`}
              speaker="Total No. of HCFs in operation without Authorization"
              fldName='ttlwth'
              idText='txtttlwth'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              sNo={"3.7"}
              ToolTip="Enter whole numbers only"
            ></WtrInput>
            {/* </table> */}
          </div>

          <div>
            <Seperator heading=" Bio-medical Waste Informartion "></Seperator>
            { /* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. No.</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}
            {/* <WtrInput
              displayFormat={"3"}
              Label={'Quantity of BMW Generation (in (kg/day))'}
              fldName='wstgnr'
              idText='txtwstgnr'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              sNo={"4.1"}
              ClssName=''
              ToolTip="please enclose District Wise BMW Generation as per Part-2">
            </WtrInput> */}

            <WtrInput
              displayFormat="3"
              Label={'Quantity of BMW Generation (in (kg/day))'}
              speaker={"Enter Biomedical Waste Generated"}
              fldName='wstgnr'
              idText='txtwstgnr'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              sNo={"4.1"}
              ToolTip="please enclose District Wise BMW Generation as per Part-2"
              noofDecimals={3}
            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label={'Total Biomedical Waste generated from bedded hospital (kg/day)'}
              fldName='wstgnrbd'
              idText='txtwstgnrbd'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              sNo={"4.2"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste Generated Non Bedded (kg/day)'
              fldName='wstgnrnbd'
              idText='txtwstgnrnbd'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              sNo={"4.3"}
              noofDecimals={3}
              ClssName=''
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste Generated (Other) (kg/day)'
              speaker='Enter Total Biomedical Waste Generated (Other) (kg/day)'
              fldName='wstgnroth'
              idText='txtwstgnroth'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              sNo={"4.4"}
              noofDecimals={3}
              ToolTip="Enter whole numbers only"
            ></WtrInput>
            {/* </table> */}
          </div>

          <div>
            <Seperator heading="Information of Captive Treatment Facility"></Seperator>
            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. No.</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}
            <WtrInput
              displayFormat="3"
              Label='No. of HCFs having captive treatment facilities'
              speaker='Enter no. of HCFs having captive treatment facilities'
              fldName='hcfcptv'
              idText='txthcfcptv'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              sNo={"5.1"}
              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label="No. of captive incinerators operated by HCFs"
              speaker="Enter No. of captive incinerators operated by HCFs"
              fldName='hcfcptvopr'
              idText='txthcfcptvopr'
              onChange={onChangeDts}
              dsabld={!hideInState && arrytab[2]}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn='1[length]'
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              delayClose={1000}
              placement='bottom'
              sNo={"5.2"}
              ClssName=''
              ToolTip="Enter whole numbers only"
            ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label='Total BMW treated in captive treatment facilities by HCF in (kg/day)'
              fldName='cptvwst'
              idText='txtcptvwst'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              sNo={"5.3"}
              noofDecimals={3}
              ClssName='' ></WtrInput>
            {/* </table> */}
            <WtrInput
              displayFormat={"3"}
              Label='Number of captive incinerators complying to the norms'
              fldName='capin'
              idText='txtcapin'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              sNo={"5.4"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Number of captive incinerators complying to the norms'}
            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label='No. of HCF having deep burial pits'
              fldName='deepburpits'
              idText='txtdeepburpits'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              sNo={"5.5"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              speaker={'Enter No. of HCF having deep burial pits'}
            ></WtrInput>
          </div>


          <div>
            <Seperator heading={`Information of  Common Bio Waste Treatment Facilities`}></Seperator>
            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. No.</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}
            <WtrInput
              displayFormat={"3"}
              Label='No. of CBWTF having deep burial pits'
              fldName='cbwtfopr'
              idText='txtcbwtfopr'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn='1[length]'
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              speaker={'Enter Total No. CBWTF in Operation'}
              delayClose={1000}
              sNo={"6.1"}
              placement='right' ClssName=''
              ToolTip="Enter whole numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total No. CBWTF under Construction'
              fldName='cbwtfcns'
              idText='txtcbwtfcns'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              sNo={"6.2"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Total No. CBWTF under Construction'}
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste Treated and Disposed of CBWTF (kg/day)'
              fldName='wsttrt'
              idText='txtwsttrt'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn='1[length]'
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              speaker={'Enter Biomedical Waste Treated'}
              delayClose={1000}
              placement='left' ClssName=''
              sNo={"6.3"}
              noofDecimals={3}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat="3"
              Label="No. of CBWTFs that have installed OCEMS"
              fldName='ttlcoem'
              idText='txtttlcoem'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              sNo={"6.4"}
              speaker={'Enter No. of CBWTFs that have installed OCEMS'}
            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label='Number of Common Bio Medical Waste Treatment Facilities that have installed Continuous OCEMS'
              fldName='monsys'
              idText='txtmonsys'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.frmData}
              clrFnct={state.trigger}
              sNo={"6.5"}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Number of Common Bio Medical Waste Treatment Facilities that have installed Continuous OCEMS'}
            ></WtrInput>
          </div>

          <div>
            <Seperator heading={`Biomedical Waste Treatment & Disposed `}></Seperator>


            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste (This value is equal to the sum of points 5.3 and 6.3)'
              fldName='ttlbmw'
              idText='txtwttlbmw'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              sNo={"7.1"}
              ToolTip="Enter numbers only"
              speaker={'Enter Total Biomedical Waste'}
            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label='Total Biomedical Waste Disposed by Authorized Recycler (Kg/day)'
              fldName='wstath'
              idText='txtwstath'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              sNo={"7.2"}
              noofDecimals={3}
              ToolTip="Enter numbers only"
              speaker={'Enter Total Biomedical Waste Disposed by Authorized Recycler (Kg/day)'}
            ></WtrInput>
          </div>

          <div>
            <Seperator heading={`Violations and Action Taken `}></Seperator>
            <WtrInput
              displayFormat={"3"}
              Label='Total No. of Violations by HCF'
              fldName='vlthcf'
              idText='txtvlthcf'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              sNo={"8.1"}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Total No. of Violations by HCF'}
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total No. of Violations by CBWTF'
              fldName='vltcbtwf'
              idText='txtvltcbtwf'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              sNo={"8.2"}
              clrFnct={state.trigger}
              speaker={'Enter Total No. of Violations by CBWTF'}
              ToolTip="Enter whole numbers only"
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total No. of Violations by Others'
              fldName='vltothr'
              idText='txtvltothr'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              sNo={"8.3"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Total No. of Violations by Others'}
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Show cause notices/directions issued to defaulter HCF'
              fldName='shwhcf'
              idText='txtshwhcf'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
              dsabld={!hideInState}
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
          </div>
          <div>
            <Seperator heading={`Other Information`}></Seperator>
            <WtrInput
              displayFormat={"3"}
              Label='Number of workshops/trainings conducted during the year'
              fldName='wrkspyr'
              idText='txtwrkspyr'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              sNo={"9.1"}
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
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              sNo={"9.2"}
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
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              sNo={"9.3"}
              clrFnct={state.trigger}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Number of occupiers submitted Annual Report for the previous calendar year'}
            ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Number of occupiers practising pre-treatment of lab microbiology and Bio-technology waste'
              fldName='pretr'
              idText='txtpretr'
              onChange={onChangeDts}
              dsabld={!hideInState}
              callFnFocus=''
              dsbKey={false}
              upprCase={false}
              validateFn=''
              allowNumber={true}
              selectedValue={state.textDts}
              clrFnct={state.trigger}
              sNo={"9.4"}
              ToolTip="Enter whole numbers only"
              speaker={'Enter Number of occupiers practising pre-treatment of lab microbiology and Bio-technology waste'}
            ></WtrInput>
            {/* </table> */}
          </div>

          <div>
            <Seperator heading="Part 2: District-wise bio-medical waste generation (for the previous calendar year ......) "></Seperator>
            {year ? <></> : <>
              <Seperator smallheading={year ? "" : "Please select year to enable input field"} heading={`Part 2: District-wise bio-medical waste generation (for the previous calendar year ${year})`}> </Seperator>
            </>
            }
            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. No.</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}

            <WtrInput
              displayFormat={"3"}
              Label='Number of District'
              fldName='nodstr'
              idText='txtnodstr'
              onChange={onChangeNoDstrn}
              dsabld={arrytab[1] && year && hideInState ? false : true}
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
            ></WtrInput>
            <WtrInput
              displayFormat={"3"}
              Label='Name of District'
              fldName='dstr'
              idText='txtdstr'
              onChange={onChangeDstr}
              dsabld={arrytab[1] && year && hideInState ? false : true}
              callFnFocus=''
              dsbKey={false}
              validateFn='1[length]'
              allowNumber={false}
              selectedValue={state.textDts1}
              clrFnct={state.trigger1}
              speaker={'Enter Name of District'}
              delayClose={1000}
              placement='right'
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
              noofDecimals={3}
              delayClose={1000} placement='bottom' ClssName=''
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
              noofDecimals={3}
              delayClose={1000} ClssName=''
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
              ToolTip="Enter numbers only" ></WtrInput>
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
                    onClick={addDstrClick}
                  >
                    Add data
                  </Button>
                </div>
              </div>
            </> : <></>}


          </div>
          {(districtBmwData && districtBmwData.length) ?
            <>
              <Seperator heading=""></Seperator>
              <table className="mt-2">
                <tr className="py-3">
                  <th className="tableHdr">District</th>
                  <th className="tableHdr">Waste generated</th>
                  <th className="tableHdr">Incinerator capacity</th>
                  <th className="tableHdr">Autoclave capacity</th>
                  <th className="tableHdr">Deep burial capacity</th>
                  <th className="tableHdr">Any other capacity</th>
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
            : <></>}
          <div className="mt-6" style={{ marginTop: '70px' }}>
            {year ? <></> : <>
              <Seperator smallheading={year ? "" : "Please select year to enable input field"} heading={`Part-3 : Information on Health Care Facilities having Captive Treatment Facilities (for the previous calendar Year ${year})`}></Seperator>
            </>

            }
            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. No.</th>
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
              speaker={'Enter Address HCF'}
              delayClose={1000}
              sNo={"11.2"}
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
              sNo={"11.3"}
              noofDecimals={3}
              ClssName=''
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
              speaker={'Enter Biomedical Waste Yelow Per Day'}
              sNo={"11.4"}
              delayClose={1000}
              noofDecimals={3}
              ToolTip="Enter numbers only"
              ClssName='' ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='White Category Waste (Kg/day)'
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
              noofDecimals={3}
              sNo={"11.5"}
              ClssName=''
              ToolTip="Enter numbers only" ></WtrInput>

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
              sNo={"11.6"}
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
              speaker={'Enter Biomedical Waste Red Per Day'}
              delayClose={1000}
              ClssName=''
              sNo={"11.7"}
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
              noofDecimals={3}
              sNo={"11.8"}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Autoclave Capacity (Kg/day)'
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
              noofDecimals={3}
              sNo={"11.9"}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Number of Deep Burial Pits (kg/day)'
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
              sNo={"11.10"}
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
              sNo={"11.11"}
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
              noofDecimals={3}
              sNo={"11.12"}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Treated in Autoclave/microwave (Kg/day)'
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
              sNo={"11.13"}
              noofDecimals={3}
              ToolTip="Enter numbers only" ></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label=' Disposed of through Deep Burial Treated (Kg/day)'
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
              speaker={'Enter  Disposed of through Deep Burial Treated (Kg/day)'}
              delayClose={1000}
              ClssName=''
              sNo={"11.14"}
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
              sNo={"11.15"}
              noofDecimals={3}
              ToolTip="Enter numbers only" ></WtrInput>
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
                    onClick={addHcfCptvClick}
                  >
                    Add details  of <ol></ol>other HCF
                  </Button>
                </div>
              </div> </> : <></>}


          </div>

          {(hcfCptvData && hcfCptvData.length) ?
            <>
              <Seperator heading="Part-3 : Information on Health Care Facilities having Captive Treatment Facilities (for the previous calendar Year .......) "></Seperator>
              <table className="mt-2">
                <tr className="py-3">
                  <th className="tableHdr border">Name and address of the health care facility</th>
                  <th className="tableHdr border" colSpan={6}>Quantity of BMW generation (in (kg/day)) </th>
                  <th className="tableHdr border" colSpan={4}>Total installed treatment capacity in (kg/day)</th>

                  <th className="tableHdr border" style={{ width: "14%" }}>Total biomedical waste treated and disposed by health care facilities in (kg/day)</th>

                  <th className="tableHdr border">Delete</th>
                </tr>
                <tr className="bg-white">
                  <th className="tableHdr1 border"></th>
                  <th className="tableHdr1 border">Yellow</th>
                  <th className="tableHdr1 border">Red</th>
                  <th className="tableHdr1 border">Blue</th>
                  <th className="tableHdr1 border">White</th>
                  <th className="tableHdr1 border">Cytotoxic</th>
                  <th className="tableHdr1 border">Total(in (kg/day))</th>
                  <th className="tableHdr1 border">Incinerator</th>
                  <th className="tableHdr1 border">Autoclave</th>
                  <th className="tableHdr1 border">Deep burial</th>
                  <th className="tableHdr1 border">Any other</th>
                  <th className="tableHdr1 border"></th>
                  <th className="tableHdr1 border"></th>
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
                        <div className=""> Deep Burial:</div>
                        <div className="">{res.deptrd}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="">Any other: </div>
                        <div className="Any other: ">{res.othrtrd}</div>
                      </div>

                    </td>

                    <td className="tableHdr border" onClick={() => deleteHcfCptvData(res.dstr)}>Delete</td>
                  </tr>
                ))}


              </table>
            </>
            : <></>}


          {/* ******************************************************************** */}



          <div className="mt-6" style={{ marginTop: '70px' }}>
            {year ? <></> : <>
              <Seperator smallheading={year ? "" : "Please select year to enable input field"} heading="Part 4: Information on Common Bio-Medical Waste Treatment and Disposal Facilities (for the previous calendar Year"></Seperator>

            </>

            }
            {/* <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. No.</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>

              </thead> */}
            <tr>
              <td className="tableHdr1 px-3">12.1</td>
              <td className="tableHdr1 px-3">Name and Address of the Common Bio Medical Waste Treatment
                Facilities with  contact person name and telephone number</td>
              <td></td>
            </tr>
            <WtrInput
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
            ></WtrInput>
            <WtrInput
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
              allowNumber={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              blockNumbers={false}
              speaker={'Enter Address of CBWTF'}
              delayClose={1000}
              placement='right'
              ClssName=''
              sNo={"ii"}
              unblockSpecialChars={true}
            ></WtrInput>
            <WtrInput
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
              <td className="tableHdr1 px-3">12.2</td>
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
              sNo={"12.3"}
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
              sNo={"12.4"}
              delayClose={1000}
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
              sNo={"12.5"}
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
              sNo={"12.6"}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label='Total Quantity of BioMedical Waste collected from member Health Care Facilities (in (Kg/day)) '
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
              sNo={"12.7"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"12.8"}
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
              sNo={"12.9"}
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
              sNo={"12.10"}
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
              sNo={"12.11"}
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
              sNo={"12.12"}
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
              sNo={"12.13"}
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
              sNo={"12.14"}
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
              noofDecimals={3}
              sNo={"12.15"}
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
              noofDecimals={3}
              sNo={"12.16"}
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
              sNo={"12.17"}
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
              sNo={"12.18"}
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
              sNo={"12.19"}
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
              sNo={"12.20"}
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
              sNo={"12.21"}
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
              sNo={"12.22"}
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
              sNo={"12.23"}
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
              sNo={"12.24"}
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
              sNo={"12.25"}
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
              sNo={"12.26"}
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
              sNo={"12.27"}
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
              sNo={"12.28"}
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
              sNo={"12.29"}
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
              sNo={"12.30"}
              noofDecimals={3}
              ClssName=''
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
              sNo={"12.31"}
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
              sNo={"12.32"}
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
              sNo={"12.33"}
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
              sNo={"12.34"}
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
              sNo={"12.35"}
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
              sNo={"12.36"}
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
              sNo={"12.37"}
              noofDecimals={3}
              ToolTip="Enter numbers only"></WtrInput>



            <WtrInput
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
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label=' Incineration Quantity'
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
              sNo={"12.39"}
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
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter Disposed by:'}
              delayClose={1000}
              ClssName=''
              sNo={"12.40"}
              ToolTip="Enter numbers only"></WtrInput>



            <WtrInput
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
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label=' Sharps Quantity'
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
              sNo={"12.42"}
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
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter Disposed by:'}
              delayClose={1000}
              ClssName=''
              sNo={"12.43"}
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
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
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"12.45"}
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
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter Disposed by:'}
              delayClose={1000}
              ClssName=''
              sNo={"12.46"}
              ToolTip="Enter numbers only"></WtrInput>




            <WtrInput
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
              ToolTip="Enter numbers only"></WtrInput>

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
              sNo={"12.48"}
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
              allowNumber={true}
              allowDecimal={true}
              selectedValue={state.textDts3}
              clrFnct={state.trigger2}
              speaker={'Enter Disposed by:'}
              delayClose={1000}
              ClssName=''
              sNo={"12.49"}
              ToolTip="Enter numbers only"></WtrInput>

            {/* ****************************************************************** */}

            {/* </table> */}
            {hideInState ? <>
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
            }

          </div>

          {(cbwtfData && cbwtfData.length) ?
            <>
              <Seperator heading="Part 4: Information on Common Bio-Medical Waste Treatment and Disposal Facilities (for the previous calendar Year"></Seperator>
              <table className="mt-2">
                <tr className="py-3">
                  <th className="tableHdr border" colSpan={4}>General Information</th>
                  <th className="tableHdr border" colSpan={2}>GPS  Coordinates </th>
                  <th className="tableHdr border" >Coverage Area in KMS </th>

                  <th className="tableHdr border">Name of the cities/ areas covered by Common BioMedical Waste Treatment Facilities</th>

                  <th className="tableHdr border">Total number of Health Care Facilities being covered</th>
                  <th className="tableHdr border">Total number of beds covered</th>
                  <th className="tableHdr border" >Total Quantity of BioMedical Waste collected from member Health Care Facilities (in (kg/day)) </th>
                  <th className="tableHdr border" colSpan={3}>Capacity of Treatment equipments installed  by Common Bio MedicalWaste Treatment Facilities </th>

                  <th className="tableHdr border" >Total BioMedical waste treated in (kg/day) </th>

                  <th className="tableHdr border">Method of Disposal of treated wastes (Incineration Ash/Sharps/Plastics) </th>
                  <th className="tableHdr border">Delete</th>
                </tr>
                <tr className="bg-white">
                  <th className="tableHdr1 border">Name</th>
                  <th className="tableHdr1 border">Address</th>
                  <th className="tableHdr1 border">Contact person Name</th>
                  <th className="tableHdr1 border">Telephone Number</th>
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
                    <td className="tableHdr border" rowSpan={11}>{res.cvrcbwtf}</td>
                    <td className="tableHdr border" rowSpan={11}>{res.ctycbwtf}</td>
                    <td className="tableHdr border" rowSpan={11}>{res.ttlhcfcbwtf}</td>
                    <td className="tableHdr border" rowSpan={11}>{res.ttlbdcbwtf}</td>
                    <td className="tableHdr border" rowSpan={11}>{res.qntcbwtf}</td>

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
                      <div className="equal-row "> Effluent Treatment CBWTF </div>
                      <div className="equal-row "> Sub-total </div>
                    </td>


                    <td className=" border">
                      <div className=" equal-row tableHr">{res.inccpcbwtf}</div>
                      <div className=" equal-row tableHr">{res.plscbwtf} </div>
                      <div className=" equal-row tableHr">{res.autocbwtf} </div>
                      <div className=" equal-row tableHr">{res.hydrcbwtf}</div>
                      <div className=" equal-row tableHr">{res.micrpcbwtf}</div>
                      <div className=" equal-row tableHr">{res.shrcbwtf}</div>
                      <div className=" equal-row tableHr">{res.shrpcbwtf} </div>
                      <div className=" equal-row tableHr">{res.deepcbwtf} </div>
                      <div className=" equal-row tableHr">{res.othrcpcbwtf}</div>
                      <div className=" equal-row tableHr">{res.effcbwtf}</div>
                      <div className=" equal-row tableHr">{Number(res.inccpcbwtf) + Number(res.plscbwtf) + Number(res.autocbwtf)
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
                          <div className=""> Incineration Ash: </div>
                          <div className="">{res.ashcbwtf}</div>
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
                          <div className="">{res.shpcbwtf}</div>
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
                          <div className="">{res.plscbwtf}</div>
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
                          <div className="">{res.etpcbwtf}</div>
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
                    <td className="tableHdr border" onClick={() => deleteCbwtfData(res.dstr)}>Delete</td>

                  </tr>
                ))}


              </table>
            </>
            : <></>
          }



          <div className="mt-6" style={{ marginTop: '70px' }}>
            {/* <Seperator heading="Additional Information"></Seperator>
            <table className="table table-bordered min-w-full border border-gray-200"> */}
            {/* <thead className="bg-gray-50">
                <tr className="py-3 bg-gray-100">
                  <th className="border p-3" scope="col">S. No.</th>
                  <th className="border p-3" scope="col">Particulars</th>
                  <th className="border p-3" scope="col">Details</th>
                </tr>
              </thead> */}

            <WtrInput
              displayFormat={"3"}
              Label='Total Number of transportation vehicles used for collection of BMW on daily basis by the noCBWTF:'
              speaker='Enter Total Number of transportation vehicles used for collection of BMW on daily basis by the CBWTF:'
              fldName='ttlvhclcol'
              idText='ttlvhclcol'
              onChange={onChangeDts}
              dsabld={!hideInState}
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



            <WtrInput
              displayFormat={"3"}
              Label="List of Health Care Facilities not having membership with the CBWTF and neither having captive treatment facilities:"
              speaker="Enter List of Health Care Facilities not having membership with the CBWTF and neither having captive treatment facilities:"
              fldName='ttlhcfnomem'
              idText='txtttlhcfnomem'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Number of trainings organised by the Common BMW Treatment Facility operators"
              speaker="Enter Number of trainings organised by the Common BMW Treatment Facility operators"
              fldName='ttltrg'
              idText='txtttltrg'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              ToolTip="Enter numbers only"></WtrInput>

            <WtrInput
              displayFormat={"3"}
              Label="Number of Accidents reported by the Common Bio Medical Waste Treatment Facilities"
              speaker="Number of Accidents reported by the Common Bio Medical Waste Treatment Facilities"
              fldName='ttlnoacc'
              idText='ttlnoacc'
              onChange={onChangeDts}
              dsabld={!hideInState}
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
              ToolTip="Enter numbers only"></WtrInput>

            {/* </table> */}
          </div>



        </div>
        {hideInState ? <>
          <div className="flex justify-center py-7">
            <div className="mr-4">
              <Button
                size="medium"
                style={{ backgroundColor: "#3B71CA" }}
                variant="contained"
                color="success"
                disabled={!state.disableA}
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
        </> : <></>}

      </div>
    </div >
  );
}; export default React.memo(SttMonthlyReport);
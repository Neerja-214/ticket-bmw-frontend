import React, { useEffect, useReducer, useState, useRef } from "react";
import '../../login/login.css'
import utilities, {
  cmboStrLrg,
  createGetApi,
  postLinux,
  convertFldValuesToJson,
  convertFldValuesToString,
  GetResponseLnx,
  getCmpId,
  getUsrnm,
  GetResponseWnds,
  getStateAbbreviation,
  capitalize,
  capitalizeTerms,

} from "../../utilities/utilities";

import { useQuery } from "@tanstack/react-query";
import { useEffectOnce } from "react-use";
import { nrjAxiosRequestBio, nrjAxiosRequestLinux, useNrjAxios } from "../../Hooks/useNrjAxios";
import WtrInput from "../../components/reusable/nw/WtrInput";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import SaveIcon from "@mui/icons-material/Save";
import { validForm } from "../../Hooks/validForm";
import { Toaster } from "../../components/reusable/Toaster";
import { Navigate, useNavigate } from "react-router-dom";

import {
  Button,
  SvgIcon,
} from "@mui/material";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import RefreshIcon from "@mui/icons-material/Refresh";
import Tooltip from "@mui/material/Tooltip";
import { useToaster } from "../../components/reusable/ToasterContext";
import { getLvl, getWho } from "../../utilities/cpcb";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import CbwtfHeader from "./CbwtfHeader";
import PdfIcon from '../../images/pdf-svgrepo-com.svg';
import DeleteIcon from '../../images/icons8-delete.svg';
import { error } from "console";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  SETFORM_DATAALL: "setfrmdataall",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  TRIGGER_FORMSLV: "trgfrmslv",
  TRIGGER_PINCD: "trgfrmpnc",
  FORM_DATASLV: "frmdataslv",
  SETSTATE: "sttsel",
  SETGID: "gd",
  DISABLE: "disable",
  NEWFRMDATA: "frmdatanw",
  SETCBWTFCOMBO: "setCbwtfCombo",
  SETSTATECOMBO: "setStateCombo",
  SETRGDCOMBO: "setRgdCombo",
  SET_PRO_STORAGE: 'setProStorage',

};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  triggerpnc: 0,
  triggerSlv: 0,
  triggerCmbo: 0,
  textDts: "",
  textDtsSlv: "",
  mainId: 0,
  errMsg: [],
  openDrwr: false,
  frmData: "",
  mainIdSlv: 0,
  frmDataSlv: "",
  gid: "",
  disableA: 1,
  disableB: 1,
  disableC: 1,
  cbwtfCombo: "",
  stateCombo: "",
  rgdCombo: "",
  provStorage: '',


};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  trigger: number;
  triggerpnc: number;
  triggerCmbo: number;
  triggerSlv: number;
  textDts: string;
  textDtsSlv: string;
  mainId: number;
  errMsg: any;
  openDrwr: boolean;
  frmData: string;
  gid: string;
  disableA: number,
  disableB: number,
  disableC: number,
  cbwtfCombo: string;
  stateCombo: string;
  rgdCombo: string;
  provStorage: string;

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
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.TRIGGER_GRID:
      newstate.triggerG = action.payload;
      return newstate;
    case ACTIONS.TRIGGER_FORM:
      newstate.trigger = action.payload;
      newstate.triggerpnc = action.payload;
      if (action.payload === 1) {
        newstate.textDts = "";
        newstate.frmData = "";
        newstate.mainId = 0;
        newstate.gid = "";
      }
      return newstate;
    case ACTIONS.TRIGGER_FORMSLV:
      newstate.trigger = action.payload;
      newstate.triggerpnc = action.payload;
      if (action.payload === 0) {
        newstate.frmData = "";
        newstate.mainId = 0;
        newstate.triggerpnc = 0;
        newstate.gid = "";
      }
      return newstate;
    case ACTIONS.NEWROWDATA:
      newstate.nwRow = action.payload;
      newstate.triggerG = 1;
      return newstate;
    case ACTIONS.RANDOM:
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.FORM_DATA:
      let dtaF: string = "";
      let fldNF: any = utilities(2, action.payload, "");
      if (newstate.textDts) {
        dtaF = newstate.textDts + "=";
        let d: any = utilities(1, dtaF, fldNF);
        if (d) {
          dtaF = d;
        } else {
          dtaF = "";
        }
      }
      dtaF += action.payload;
      newstate.textDts = dtaF;
      newstate.frmData = dtaF;
      return newstate;
    case ACTIONS.FORM_DATASLV:
      let dta: string = "";
      let fldN: any = utilities(2, action.payload, "");
      if (newstate.textDtsSlv) {
        dta = newstate.textDtsSlv + "=";
        let d: any = utilities(1, dta, fldN);
        if (d) {
          dta = d;
        } else {
          dta = "";
        }
      }
      dta += action.payload;
      newstate.textDtsSlv = dta;
      return newstate;
    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.SETFORM_DATAALL:
      newstate.frmData = action.payload;
      newstate.textDts = action.payload;
      let d: any = utilities(1, action.payload, "id");
      if (d) {
        newstate.mainId = Number(d);
      }
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
    case ACTIONS.TRIGGER_PINCD:
      newstate.triggerpnc = action.payload;
      return newstate;
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.SETSTATECOMBO:
      newstate.stateCombo = action.payload;
      return newstate;
    case ACTIONS.SETCBWTFCOMBO:
      newstate.cbwtfCombo = action.payload;
      return newstate;
    case ACTIONS.SETRGDCOMBO:
      newstate.rgdCombo = action.payload;
      return newstate;
    case ACTIONS.SET_PRO_STORAGE:
      newstate.provStorage = action.payload
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

interface Values {
  cpcbof: string;
  cntp: string;
}

interface FileData {
  flnm: string;
  flst: string;
}

interface State {
  textDts: string;
  [key: string]: any; // Add other properties as needed
}

const CbwtfAnnulRpt = () => {
  const initialValues: Values = { cpcbof: "", cntp: "" };
  const [state, dispatch] = useReducer(reducer, initialState);

  let pnc: string = "";
  // const [state, dispatch] = useReducer(reducer, initialState);
  console.log(state)
  const [cityList, setCityList] = useState("");
  const [selsttid, setSelSttid] = useState(-1);
  const [fltr, setFltr] = useState("")
  const [notFoundCbwtfFltr, setNotFoundCbwtfFltr] = useState<boolean>(false)
  const [sttValue, setSttValue] = useState<string>("");
  const [cbwtfValue, setCbwtfValue] = useState<string>("");
  const [rgdValue, setRgdValue] = useState<string>("");
  const navigate = useNavigate();
  const [arstatus, setArStatus] = useState('');
  const [datastatus, setDataStatus] = useState('');
  const [armessage, setArMessage] = useState('')
  const [year, setYear] = useState("");
  const [loadOnDemand, setLoadOnDemand] = useState("")
  const [pdfoption, setPdfOption] = useState('');
  const [sterilizationOptn, setsterilizationOptn] = useState('');
  const [pdfError, setPdfError] = useState<string>('');
  const [consentpdfError, setConsentPdfError] = useState<string>('');
  const [authpdfError, setAuthPdfError] = useState<string>('');
  const [fileData, setFileData] = useState<FileData[]>([]);
  const [fileAuth, setFileAuth] = useState<FileData[]>([]);
  const [showDeletePdf, setShowDeletePdf] = useState(false)
  const [showupldPdf, setShowUpldPdf] = useState(false)


  const [showConsentFileName, setShowConsentPdfFileName] = useState([])
  const [showAuthFileName, setShowAuthPdfFileName] = useState([])
  const [showConsentFilePath, setShowConsentPdfFilePath] = useState([])
  const [showAuthFilePath, setShowAuthPdfFilePath] = useState([])
  const [showDocFilePath, setShowDocPdfFilePath] = useState([])
  const [showDocFileName, setShowDocPdfFileName] = useState([])
  const [consentfileData, setConsentFileData] = useState<{ flnm: string, flst: string }[]>([]);
  const hideInCbwtf = getLvl() == 'CPCB' ? false : getLvl() == 'STT' ? false : getLvl() == 'RGD' ? false : true;
  const hideFieldInStt = getLvl() == 'STT' ? true : false;
  const hideFieldInCpcb = getLvl() == 'CPCB' ? true : false;
  const hideInRgd = getLvl() == 'RGD' ? true : false;
  const [selectedYear, setSelectedYear] = useState<number | string>(""); // Local state for selected year
  const [years, setYears] = useState<number[]>([]); // Store available years
  const [governmentCombo, setGovernmentCombo] = useState("")
  const [allFieldDisabled, setAllFieldDisabled] = useState(false)
  const [showAuthFile, setShowAuthFile] = useState([])
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [currentYear - 1, currentYear]; // Last 3 years
    setYears(yearList); // Set years in state
    setSelectedYear(""); // Set default selected year (two years ago)
  }, []);



  useEffectOnce(() => {
    // nonBeeded();
    getProStorage()
  })

  const getProStorage = () => {

    let i: number = 0;
    let provStorage: string = "";

    let ary: any = [{ id: 1, ctg: 'Cold storage' }, { id: 2, ctg: 'Any Other' },];
    let uniqueAry = new Map();

    if (Array.isArray(ary)) {
      ary.forEach((element: any) => {
        uniqueAry.set(element.id, element);
      });

      uniqueAry.forEach((value: any, keys: any) => {
        if (provStorage) {
          provStorage += "$^";
        }
        provStorage += "id][" + value["id"] + "=";
        provStorage += "txt][" + value["ctg"];
      })

      while (i < uniqueAry?.entries.length) {
        i += 1;
      }
    }
    dispatch({ type: ACTIONS.SET_PRO_STORAGE, payload: provStorage });
    return;

  };






  const reqFlds = [
    // { fld: 'dt_yearid', msg: 'select year', chck: '1[length]' },
    { fld: 'authnm', msg: 'Enter Name of Authorized Person', chck: '1[length]' },
    // { fld: 'cbwtfnm', msg: 'Enter Name of CBWTF', chck: '1[length]' },
    { fld: 'addc', chck: '1[length]', msg: 'Address for Correspondence ' },
    { fld: 'addf', chck: '1[length]', msg: 'Address of Facility' },
    { fld: 'eml', chck: '[email]', msg: 'Enter E-mail ID ' },
    { fld: 'telno', chck: '[mob]', msg: 'Enter Valid Telephone Number' },
    { fld: 'urlweb', chck: '1[length]', msg: 'Enter URl of Website ' },



    { fld: 'stsauth', chck: '1[length]', msg: 'Enter valid  Authorisation Number ' },
    { fld: 'authdt_exp', chck: '1[length]', msg: 'Enter valid expiry Date for Status of Authorisation under the Bio-Medical Waste . ' },
    { fld: 'dt_exp', chck: '1[length]', msg: 'Enter valid expiry Date for Status of Consents under Water Act and AirAct  ' },
    { fld: 'nohcf', chck: '1[length]', msg: 'Enter Number healthcare facilities covered by CBWTF' },
    { fld: 'nobeds', chck: '1[length]', msg: 'Enter Number of beds covered by CBWTF' },
    { fld: 'capcbwtf', chck: '1[length]', msg: 'Enter Installed treatment and disposal capacity of CBWTF (Kg/day) ' },
    { fld: 'qntybio', chck: '1[length]', msg: 'Enter Quantity of biomedical waste treated or disposed by CBWTF (Kg/day)' },
    { fld: 'ylwqnt', chck: '1[length]', msg: 'Enter Yellow Category' },
    { fld: 'redqnt', chck: '1[length]', msg: 'Enter Red Category' },
    { fld: 'whtqnt', chck: '1[length]', msg: 'Enter White Category' },
    { fld: 'blqnt', chck: '1[length]', msg: 'Enter Blue Category' },
    // { fld: 'slqnt', chck: '1[length]', msg: 'Enter General Solid Category' },

  ];

  useEffect(() => {
    // Function to determine if the calendar should be enabled orDisabled
    // when year change
    calendarDisabled()
  }, [year, arstatus, datastatus])

  const calendarDisabled = () => {
    // this function check   report status for temprory or final submit 
    // if final submit  than calander  Disabled other wise enabled
    // if ar already submit than  date select disabled
    if (year !== '') {
      if (arstatus === 'final_ar') {
        return true;
      }
      else {
        if (datastatus === 'Failed') {
          if (armessage == 'AR not submitted') {
            return false
          } else {
            return false
          }

        }

      }
    }
  }




  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  };

  const [capacityIncVldtion, setCapacityIncVldtion] = useState('')
  const [capacityPlaVldtion, setCapacityPlaVldtion] = useState('')
  const [capacityAutoVldtion, setCapacityAutoVldtion] = useState('')
  const [capacityHydroVldtion, setCapacityHydroVldtion] = useState('')
  const [capacityHydVldtion, setCapacityHydVldtion] = useState('')
  const [capacityShrVldtion, setCapacityShrVldtion] = useState('')
  const [capacityDeepVldtion, setCapacityDeepVldtion] = useState('')
  const [capacityAnyVldtion, setCapacityAnyVldtion] = useState('')
  const fieldValuesRef = useRef<{
    inccap: string,
    incanm: string,
    placap: string,
    plaanm: string,
    autoclcap: string,
    autoclanm: string,
    microcap: string,
    microanm: string,
    hydrcap: string,
    hydranm: string,
    shrcap: string,
    shranm: string,
    deepcap: string,
    deepanm: string,
    anyothrcap: string,
    anyothranm: string
  }>({
    inccap: "",
    incanm: "",
    placap: "",
    plaanm: "",
    autoclcap: "",
    autoclanm: "",
    microcap: "",
    microanm: "",
    hydrcap: "",
    hydranm: "",
    shrcap: "",
    shranm: "",
    deepcap: "",
    deepanm: "",
    anyothrcap: "",
    anyothranm: ""
  });



  const validateInccap = (data: string) => {
    let capacity = getFldValue(data, 'inccap');
    setCapacityIncVldtion(capacity);
    fieldValuesRef.current.inccap = capacity;
  };
  const validateIncanm = (data: string) => {
    let quantity = getFldValue(data, 'incanm'); // Assuming the same 'inccap' field for quantity
    if (Number(fieldValuesRef.current.inccap) < Number(quantity)) {
      showToaster(['Incinerators Quantity treated is not greater than capacity'], 'error');
      return false;
    }
    return true;
  };

  const validatePlacap = (data: string) => {
    let capacity = getFldValue(data, 'placap');
    setCapacityPlaVldtion(capacity);
    fieldValuesRef.current.placap = capacity;
  };
  const validatePlaanm = (data: string) => {
    let quantity = getFldValue(data, 'plaanm'); // Assuming the same 'inccap' field for quantity
    if (Number(fieldValuesRef.current.placap) < Number(quantity)) {
      showToaster(['Plasma pyrolysis Quantity treated is not greater than capacity'], 'error');
      return false;
    }
    return true;
  };

  const validateAutocap = (data: string) => {
    let capacity = getFldValue(data, 'autoclcap');
    setCapacityAutoVldtion(capacity);
    fieldValuesRef.current.autoclcap = capacity;
  };
  const validateAutoanm = (data: string) => {
    let quantity = getFldValue(data, 'autoclanm'); // Assuming the same 'inccap' field for quantity
    if (Number(fieldValuesRef.current.autoclcap) < Number(quantity)) {
      showToaster([' Autoclaves Quantity treated is not greater than capacity'], 'error');
      return false;
    }
    return true;
  };

  const validateMicrocap = (data: string) => {
    let capacity = getFldValue(data, 'microcap');
    setCapacityHydroVldtion(capacity);
    fieldValuesRef.current.microcap = capacity;
  };
  const validateMicroanm = (data: string) => {
    let quantity = getFldValue(data, 'microanm'); // Assuming the same 'inccap' field for quantity
    if (Number(fieldValuesRef.current.microcap) < Number(quantity)) {
      showToaster(['Microwave Quantity treated is not greater than capacity'], 'error');
      return false;
    }
    return true;
  };

  const validateHydcap = (data: string) => {
    let capacity = getFldValue(data, 'hydrcap');
    setCapacityHydVldtion(capacity);
    fieldValuesRef.current.hydrcap = capacity;
  };
  const validateHydanm = (data: string) => {
    let quantity = getFldValue(data, 'hydranm'); // Assuming the same 'inccap' field for quantity
    if (Number(fieldValuesRef.current.hydrcap) < Number(quantity)) {
      showToaster(['Hydroclave Quantity treated is not greater than capacity'], 'error');
      return false;
    }
    return true;
  };

  const validateShrcap = (data: string) => {
    let capacity = getFldValue(data, 'shrcap');
    setCapacityShrVldtion(capacity);
    fieldValuesRef.current.shrcap = capacity;
  };
  const validateShranm = (data: string) => {
    let quantity = getFldValue(data, 'shranm'); // Assuming the same 'inccap' field for quantity
    if (Number(fieldValuesRef.current.shrcap) < Number(quantity)) {
      showToaster(['Shredder Quantity treated is not greater than capacity'], 'error');
      return false;
    }
    return true;
  };

  const validateDeepcap = (data: string) => {
    let capacity = getFldValue(data, 'deepcap');
    setCapacityDeepVldtion(capacity);
    fieldValuesRef.current.deepcap = capacity;
  };
  const validateDeepanm = (data: string) => {
    let quantity = getFldValue(data, 'deepanm'); // Assuming the same 'inccap' field for quantity
    if (Number(fieldValuesRef.current.deepcap) < Number(quantity)) {
      showToaster(['Deep burial pits Quantity treated is not greater than capacity'], 'error');
      return false;
    }
    return true;
  };

  const validateAnyOthrcap = (data: string) => {
    let capacity = getFldValue(data, 'anyothrcap');
    setCapacityAnyVldtion(capacity);
    fieldValuesRef.current.anyothrcap = capacity;
  };
  const validateAnyOthranm = (data: string) => {
    let quantity = getFldValue(data, 'anyothranm'); // Assuming the same 'inccap' field for quantity
    if (Number(fieldValuesRef.current.anyothrcap) < Number(quantity)) {
      showToaster(['Any other treatment equipment Quantity treated is not greater than capacity'], 'error');
      return false;
    }
    return true;
  };

  const validationMap: { [key: string]: (data: string) => boolean | void } = {
    'inccap': validateInccap,
    'incanm': validateIncanm,
    'placap': validatePlacap,
    'plaanm': validatePlaanm,
    'autoclcap': validateAutocap,
    'autoclanm': validateAutoanm,
    'microcap': validateMicrocap,
    'microanm': validateMicroanm,
    'hydrcap': validateHydcap,
    'hydranm': validateHydanm,
    'shrcap': validateShrcap,
    'shranm': validateShranm,
    'deepcap': validateDeepcap,
    'deepanm': validateDeepanm,
    'anyothrcap': validateAnyOthrcap,
    'anyothranm': validateAnyOthranm,

  };


  const clearFieldValues = (): void => {
    fieldValuesRef.current = {
      inccap: "",
      incanm: "",
      placap: "",
      plaanm: "",
      autoclcap: "",
      autoclanm: "",
      microcap: "",
      microanm: "",
      hydrcap: "",
      hydranm: "",
      shrcap: "",
      shranm: "",
      deepcap: "",
      deepanm: "",
      anyothrcap: "",
      anyothranm: ""
    };
    setCapacityIncVldtion('')
    setCapacityPlaVldtion('')
    setCapacityAutoVldtion('')
    setCapacityHydroVldtion('')
    setCapacityHydVldtion('')
    setCapacityShrVldtion('')
    setCapacityDeepVldtion('')
    setCapacityAnyVldtion('')

  }


  const check_year_validation = (fld: string) => {
    if (fld !== 'dt_yearid' && state.textDts !== "" && fld !== 'authdt_exp' && fld !== 'dt_exp') {
      let vales = state.textDts.split("=");
      //  let vl=vales?vales.split("]["):'';
      vales.forEach((item: any) => {
        const [itemKey, itemValue] = item.split('][');
        if (itemKey === 'dt_yearid' && itemValue == '') {
          showToaster(['Please select the year first, then fill in the input field'], 'error')

        }
      })
    }

  }

  const onChangeYear = (year: number) => {
    setSelectedYear(year); // Update the local state with the selected year
    // You can also dispatch other actions if needed here
    let select_year_val: any = year
    setYear(select_year_val)
    if (select_year_val == '') {
      setYear('')
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
      setFileData([])
      setFileAuth([])
      setConsentFileData([])
    }
  };

  const [emissionValue, setEmission] = useState<boolean>(false)
  const [disPlasCapQua, setDisPlasCapQua] = useState(false)
  const [inc, setInc] = useState(false);
  const [anyothr, setAnyothr] = useState(false);
  const [chem, setChem] = useState(false);
  const [deep, setDeep] = useState(false);
  const [sharp, setSharp] = useState(false);
  const [needle, setNeedle] = useState(false);
  const [shra, setShra] = useState(false);
  const [hydra, setHydra] = useState(false);
  const [autocl, setAutocl] = useState(false);
  const [micro, setMicro] = useState(false);

  const onChangeDts = (data: string) => {
    let fld: any = utilities(2, data, "");
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });

    check_year_validation(fld)
    if (fld == 'dt_yearid') {
      let select_year_val: any = getFldValue(data, 'dt_yearid').split('|')[0]
      setYear(getFldValue(data, 'dt_yearid').split('|')[0]);
      dispatch({ type: ACTIONS.FORM_DATA, payload: `dt_yearid][${select_year_val}=dt_year][${select_year_val}` })
      if (select_year_val == '') {
        setYear('')
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
        setFileData([])
      }

    }
    if (fld == 'othrinfoid') {
      let val = getFldValue(data, 'othrinfoid').split('|')[1]
      dispatch({ type: ACTIONS.FORM_DATA, payload: `othrinfoid][${val}=othrinfo][${val}` })
      if (val && val == "Yes") {
        setShowUpldPdf(true)

      } else {
        setShowUpldPdf(false)
        setFileData([])
        setFileAuth([])
        setConsentFileData([])
      }
    }
    if (fld == 'onlemid') {
      let val = getFldValue(data, 'onlemid').split('|')[1]
      if (val == "Yes") {
        setEmission(true)
      } else {
        setEmission(false)
      }
    }

    // if (fld === 'pla') {
    //   let val = getFldValue(data, fld);
    //   setDisPlasCapQua(val === '0')
    // }
    // else if (fld === 'inc') {
    //   let val = getFldValue(data, fld);
    //   setInc(val === '0');
    // } else if (fld === 'anyothr') {
    //   let val = getFldValue(data, fld);
    //   setAnyothr(val === '0');
    // } else if (fld === 'chem') {
    //   let val = getFldValue(data, fld);
    //   setChem(val === '0');
    // } else if (fld === 'deep') {
    //   let val = getFldValue(data, fld);
    //   setDeep(val === '0');
    // } else if (fld === 'sharp') {
    //   let val = getFldValue(data, fld);
    //   setSharp(val === '0');
    // } else if (fld === 'needle') {
    //   let val = getFldValue(data, fld);
    //   setNeedle(val === '0');
    // } else if (fld === 'shr') {
    //   let val = getFldValue(data, fld);
    //   setShra(val === '0');
    // } else if (fld === 'hydr') {
    //   let val = getFldValue(data, fld);
    //   setHydra(val === '0');
    // } else if (fld === 'autocl') {
    //   let val = getFldValue(data, fld);
    //   setAutocl(val === '0');
    // }
    // else if (fld === 'micro') {
    //   let val = getFldValue(data, fld);
    //   setMicro(val === '0');
    // }

    const fieldSetters: Record<string, React.Dispatch<React.SetStateAction<boolean>>> = {
      pla: setDisPlasCapQua,
      inc: setInc,
      anyothr: setAnyothr,
      chem: setChem,
      deep: setDeep,
      sharp: setSharp,
      needle: setNeedle,
      shr: setShra,
      hydr: setHydra,
      autocl: setAutocl,
      micro: setMicro,
    };

    if (fld in fieldSetters) {
      fieldSetters[fld](getFldValue(data, fld) === '0');
    }


    if (validationMap[fld]) {
      const isValid = validationMap[fld](data);
      if (isValid === false) return;
    }

  };
  const GetGid = () => {
    let gd: string = state.gid;
    if (!gd) {
      let g: any = utilities("3", "", "");
      gd = g;
      dispatch({ type: ACTIONS.SETGID, payload: gd });
    }
    return gd;
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [formDataGet, setFormData] = useState('')

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const HandleSaveClick = () => {

    let formData: any = '';
    // if (formDataGet) {
    //   formData = formDataGet;
    // } else {
    formData = state.textDts;
    // }
    formData = convertFldValuesToJson(formData);

    formData['cmpid'] = getCmpId() || "";
    formData['usrnm'] = getUsrnm() || "";
    formData['ar_year'] = year ? year : '0';
    formData['what'] = 'cbwtf_ar';
    formData['dt_exp'] = formData['dt_exp'] ? formData['dt_exp'] : '0';
    formData['authdt_exp'] = formData['authdt_exp'] ? formData['dt_exp'] : '0';
    formData['dt_yearid'] = year ? year : '0';
    formData['dt_year'] = year ? year : '0';
    formData['ar_status'] = 'final_ar'

    formData['authnm'] = formData['authnm'] ? formData['authnm'] : 'NA';
    formData['cbwtfnm'] = formData['cbwtfnm'] ? formData['cbwtfnm'] : 'NA';
    formData['addc'] = formData['addc'] ? formData['addc'] : 'NA';
    formData['telno'] = formData['telno'] ? formData['telno'] : '0';
    formData['fxno'] = formData['fxno'] ? formData['fxno'] : '0';
    formData['eml'] = formData['eml'] ? formData['eml'] : 'NA';
    formData['urlweb'] = formData['urlweb'] ? formData['urlweb'] : 'NA';
    formData['gpscordlat'] = formData['gpscordlat'] ? formData['gpscordlat'] : 'NA';
    formData['gpscordlong'] = formData['gpscordlong'] ? formData['gpscordlong'] : 'NA';

    formData['ownhcfid'] = formData['ownhcfid'] ? formData['ownhcfid'] : '0';

    formData['ownh'] = formData['ownh'] ? formData['ownh'] : 'NA';
    formData['stsauth'] = formData['stsauth'] ? formData['stsauth'] : 'NA';
    formData['nohcf'] = formData['nohcf'] ? formData['nohcf'] : '0';
    formData['nobeds'] = formData['nobeds'] ? formData['nobeds'] : '0';
    formData['addf'] = formData['addf'] ? formData['addf'] : 'NA';
    formData['qntybio'] = formData['qntybio'] ? formData['qntybio'] : '0';

    formData['ylwqnt'] = formData['ylwqnt'] ? formData['ylwqnt'] : '0';
    formData['redqnt'] = formData['redqnt'] ? formData['redqnt'] : '0';
    formData['whtqnt'] = formData['whtqnt'] ? formData['whtqnt'] : '0';
    formData['blqnt'] = formData['blqnt'] ? formData['blqnt'] : '0';
    formData['slqnt'] = formData['slqnt'] ? formData['slqnt'] : 'NA';
    formData['size'] = formData['size'] ? formData['size'] : '0';
    formData['cap'] = formData['cap'] ? formData['cap'] : '0';

    formData['provid'] = formData['provid'] ? formData['provid'] : 'NA';
    formData['pla'] = formData['pla'] ? formData['pla'] : '0';
    formData['placap'] = formData['placap'] ? formData['placap'] : '0';
    formData['plaanm'] = formData['plaanm'] ? formData['plaanm'] : '0';
    formData['autocl'] = formData['autocl'] ? formData['autocl'] : '0';
    formData['autoclcap'] = formData['autoclcap'] ? formData['autoclcap'] : '0';
    formData['autoclanm'] = formData['autoclanm'] ? formData['autoclanm'] : '0';

    formData['inc'] = formData['inc'] ? formData['inc'] : '0';
    formData['inccap'] = formData['inccap'] ? formData['inccap'] : '0';
    formData['incanm'] = formData['incanm'] ? formData['incanm'] : '0';
    formData['hydr'] = formData['hydr'] ? formData['hydr'] : '0';
    formData['hydrcap'] = formData['hydrcap'] ? formData['hydrcap'] : '0';
    formData['hydranm'] = formData['hydranm'] ? formData['hydranm'] : '0';
    formData['shr'] = formData['shr'] ? formData['shr'] : '0';
    formData['shrcap'] = formData['shrcap'] ? formData['shrcap'] : '0';

    formData['shranm'] = formData['shranm'] ? formData['shranm'] : '0';
    formData['needle'] = formData['needle'] ? formData['needle'] : '0';
    formData['needleanm'] = formData['needleanm'] ? formData['needleanm'] : '0';
    formData['sharp'] = formData['sharp'] ? formData['sharp'] : '0';
    formData['sharpanm'] = formData['sharpanm'] ? formData['sharpanm'] : '0';
    formData['deep'] = formData['deep'] ? formData['deep'] : '0';
    formData['deepcap'] = formData['deepcap'] ? formData['deepcap'] : '0';
    formData['deepanm'] = formData['deepanm'] ? formData['deepanm'] : '0';

    formData['chem'] = formData['chem'] ? formData['chem'] : '0';
    formData['chemanm'] = formData['chemanm'] ? formData['chemanm'] : '0';
    formData['anyothr'] = formData['anyothr'] ? formData['anyothr'] : '0';
    formData['anyothrcap'] = formData['anyothrcap'] ? formData['anyothrcap'] : '0';
    formData['anyothranm'] = formData['anyothranm'] ? formData['anyothranm'] : '0';
    formData['recycle'] = formData['recycle'] ? formData['recycle'] : '0';
    formData['noveh'] = formData['noveh'] ? formData['noveh'] : '0';
    formData['incire'] = formData['incire'] ? formData['incire'] : '0';

    formData['inciredispo'] = formData['inciredispo'] ? formData['inciredispo'] : '0';
    // formData['ash'] = formData['ash'] ? formData['ash'] : '0';
    // formData['ashdispo'] = formData['ashdispo'] ? formData['ashdispo'] : '0';
    formData['etpsl'] = formData['etpsl'] ? formData['etpsl'] : '0';
    formData['etpsldispo'] = formData['etpsldispo'] ? formData['etpsldispo'] : '0';
    // formData['nmbio'] = formData['nmbio'] ? formData['nmbio'] : 'NA';
    // formData['lsthcf'] = formData['lsthcf'] ? formData['lsthcf'] : 'NA';
    formData['infobio'] = formData['infobio'] ? formData['infobio'] : 'NA';
    // formData['infofile'] =  selectedFile || 'NA';

    formData['train'] = formData['train'] ? formData['train'] : '0';
    formData['prstrain'] = formData['prstrain'] ? formData['prstrain'] : '0';
    formData['timeind'] = formData['timeind'] ? formData['timeind'] : '0';
    formData['notrain'] = formData['notrain'] ? formData['notrain'] : '0';
    formData['whrtarin'] = formData['whrtarin'] ? formData['whrtarin'] : 'NA';
    formData['otherinfo'] = formData['otherinfo'] ? formData['otherinfo'] : 'NA';
    formData['accd'] = formData['accd'] ? formData['accd'] : '0';
    formData['prsaff'] = formData['prsaff'] ? formData['prsaff'] : '0';
    formData['remedial'] = formData['remedial'] ? formData['remedial'] : 'NA';
    formData['ftlity'] = formData['ftlity'] ? formData['ftlity'] : 'NA';
    formData['stckmontg'] = formData['stckmontg'] ? formData['stckmontg'] : 'NA';
    formData['stdair'] = formData['stdair'] ? formData['stdair'] : 'NA';
    formData['onlemi'] = formData['onlemi'] ? formData['onlemi'] : 'NA';
    formData['frqcali'] = formData['frqcali'] ? formData['frqcali'] : 'NA';
    formData['onlemid'] = formData['onlemid'] ? formData['onlemid'] : '0';

    // formData['liqwst'] = formData['liqwst'] ? formData['liqwst'] : 'NA'; 
    formData['liqwstid'] = formData['liqwstid'] ? formData['liqwstid'] : 'NA';
    formData['trtefflnt'] = formData['trtefflnt'] ? formData['trtefflnt'] : 'NA';
    formData['notmettrtefflnt'] = formData['notmettrtefflnt'] ? formData['notmettrtefflnt'] : 'NA';
    formData['disimth'] = formData['disimth'] ? formData['disimth'] : 'NA';

    formData['ntmetstaid'] = formData['ntmetstaid'] ? formData['ntmetstaid'] : 'NA';
    formData['othrinfo'] = formData['othrinfo'] ? formData['othrinfo'] : 'No';
    formData['capcbwtf'] = formData['capcbwtf'] ? formData['capcbwtf'] : 'NA';
    formData['stscnstno'] = formData['stscnstno'] ? formData['stscnstno'] : 'NA';
    formData['docfiles'] = fileData ? fileData : [];
    formData['docfilesAuth'] = fileAuth ? fileAuth : []
    formData['docfilesConsent'] = consentfileData.map(({ flnm }) => ({
      flnm,
      doc_path: showConsentFilePath, // Adding doc_path
    }));
    // formData['docConsentpath'] =showConsentFilePath?showConsentFilePath:''
    // let payload: any = postLinux(formData, 'AR_filing');
    return nrjAxiosRequestBio("AR_filing", formData);

  };
  const [showMessage, setShowMessage] = useState<any>([])
  const { showToaster, hideToaster } = useToaster();

  const SaveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    // if (consentNumber === '') {
    //   showToaster(["Without the consent Number, you can't submit the annual report. Make sure to fill it in first"], 'error');
    //   return;
    // }
    if (consentNumber === '') {
      showToaster(["Without the consent Number, you can't submit the annual report. Make sure to fill it in first"], 'error');
      return;
    }

    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    for (const field in validationMap) {
      const isValid = validationMap[field](api);
      if (isValid === false) {
        showToaster(["In Captive Treatment (4.2), the quantity treated should not exceed the capacity."], 'error');
        return;
      }
    }

    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    refetch();
  };

  const svdQry = (data: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    let dt: any = GetResponseLnx(data);
    if (dt.status == 'Success') {
      showToaster([dt.message], 'success')
    }
    else {
      showToaster(['Something went wrong! please try again'], 'error')
    }
  };
  const { data, refetch } = useQuery({
    queryKey: state?.mainId ? ["svQry", state.mainId, state.rndm] : [],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });

  useEffect(() => {
    // if (!hideInCbwtf) {
    //   let data: any = sessionStorage.getItem('cbwtfAnnulRpt');

    //   if (data) {
    //     data = JSON.parse(data)
    //     const { docfiles, docfilesAuth,docfilesConsent, ...restData } = data;
    //     let _data = convertFldValuesToString(restData)
    //     dispatch({ type: ACTIONS.SETFORM_DATA, payload: _data });
    //     if (data.docfiles?.length) {
    //       setShowDeletePdf(false);
    //       setShowUpldPdf(true);
    //       const { doc_path, flnm } = data.docfilesConsent[0];
    //       setFileData(data.docfiles);
    //       setShowDocPdfFilePath(doc_path);
    //       setShowDocPdfFileName(flnm);
    //     }

    //     if (data.docfilesConsent?.length) {
    //       const { doc_path, flnm } =data.docfilesConsent[0];
    //       setShowConsentPdfFilePath(doc_path);
    //       setShowConsentPdfFileName(flnm);
    //     }

    //     if (data.docfilesAuth?.length) {
    //       const { doc_path, flnm } = data.docfilesAuth[0];
    //       setShowAuthPdfFilePath(doc_path);
    //       setShowAuthPdfFileName(flnm);
    //     }

    //   }
    // }
    if (!hideInCbwtf) {
      const data = sessionStorage.getItem('cbwtfAnnulRpt');

      if (data) {
        const parsedData = JSON.parse(data);
        const { docfiles, docfilesAuth, docfilesConsent, ...restData } = parsedData;

        dispatch({ type: ACTIONS.SETFORM_DATA, payload: convertFldValuesToString(restData) });

        const setPdfData = (docs: any[], setPath: Function, setName: Function) => {
          if (docs?.length) {
            const { doc_path, flnm } = docs[0];
            setPath(doc_path);
            setName(flnm);
          }
        };

        if (docfiles?.length) {
          setShowDeletePdf(false);
          setShowUpldPdf(true);
          setFileData(docfiles);
        }

        setPdfData(docfilesConsent, setShowConsentPdfFilePath, setShowConsentPdfFileName);
        setPdfData(docfilesAuth, setShowAuthPdfFilePath, setShowAuthPdfFileName);
        setPdfData(docfiles, setShowDocPdfFilePath, setShowDocPdfFileName);
      }
    }

    else {
      let data: any = localStorage.getItem('Cbwtflogindetails');
      if (data) {
        data = JSON.parse(data)
        if (data) {
          dispatch({ type: ACTIONS.SETFORM_DATA, payload: `cbwtfnm][${data.data['cbwtfnm']}` })
        }
        // dispatch({ type: ACTIONS.FORM_DATA, payload: `cbwtfnm][${data.data['cbwtfnm']}` })
      }
    }

  }, [year])

  useEffectOnce(() => {

    if (!hideInCbwtf) {
      let data: any = sessionStorage.getItem('cbwtfAnnulRpt');
      if (data) {
        data = JSON.parse(data)
        const { docfiles, ...restData } = data;
        let _data = convertFldValuesToString(restData)
        dispatch({ type: ACTIONS.SETFORM_DATA, payload: _data });
        setShowUpldPdf(true);
        setFileData(docfiles)
        // setHcfId(data.data.hcfid ? data.data.hcfid : '')

      }
    } else {
      let data: any = localStorage.getItem('Cbwtflogindetails');
      if (data) {
        data = JSON.parse(data)
        if (data) {
          dispatch({ type: ACTIONS.SETFORM_DATA, payload: `cbwtfnm][${data.data['cbwtfnm']}` })
        }
        // dispatch({ type: ACTIONS.FORM_DATA, payload: `cbwtfnm][${data.data['cbwtfnm']}` })
        setHcfId(data.data.cbwtfid ? data.data.cbwtfid : '')
      }
      refetchB()

    }
  })
  const GetData = (year: string) => {
    let cmpid = getCmpId() || "";
    let usrnm = getUsrnm() || "";
    let ar_year = year;
    let what = 'cbwtf_ar';
    // let lvl: string = sttValue ? sttValue : rgdValue;

    if (hideInCbwtf) {
      dispatch({ type: ACTIONS.FORM_DATA, payload: `dt_yearid][${year}` })
      if (ar_year) {
        let payload: any = postLinux(ar_year + '=' + usrnm + '=' + cmpid + '=' + what + '=' + 'CBWTF', 'get_AR_filing');
        return nrjAxiosRequestBio("get_AR_filing", payload);
      }
    }
  };


  const ShowData = (data: any) => {
    if (hideInCbwtf) {
      if (hideInCbwtf) {
        if (data.data.status === 'Failed') {
          setAllFieldDisabled(false)
          setShowUpldPdf(false)
          setArStatus('')
          setShowDeletePdf(false)
          // clrFunct()
          setDataStatus(data.data.status)
          setArMessage(data.data.message)
          setFileData([])
          setFileAuth([])
          setConsentFileData([])
          setShowConsentPdfFilePath([]);
          setShowConsentPdfFileName([]);
          setShowDocPdfFilePath([]);
          setShowDocPdfFileName([]);
          setShowAuthPdfFilePath([]);
          setShowAuthPdfFileName([]);
          dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_yearid][${year}=dt_year][${year}` })
          let uesrLoginData: any = localStorage.getItem('Cbwtflogindetails');
          if (uesrLoginData) {
            let loc_data = JSON.parse(uesrLoginData)
            if (loc_data) {
              dispatch({ type: ACTIONS.SETFORM_DATA, payload: `cbwtfnm][${loc_data.data['cbwtfnm']}` })
            }
            // dispatch({ type: ACTIONS.FORM_DATA, payload: `cbwtfnm][${data.data['cbwtfnm']}` })
          }
        }
        // else {
        //   let textDts = ''
        //   setAllFieldDisabled(true)
        //   if (data.data.docfiles && data.data.docfiles.length > 0) {
        //     setShowDeletePdf(false)
        //     setShowUpldPdf(true)
        //     const { docfiles, ...restData } = data.data;
        //     textDts = convertFldValuesToString(restData);
        //     setFormData(textDts)
        //     setFileData(data.data.docfiles)
        //   } if (data.data.docfilesConsent && data.data.docfilesConsent.length > 0) {
        //     const { docfilesConsent, ...restData } = data.data;
        //     textDts = convertFldValuesToString(restData);
        //     // setFormData(textDts)
        //     // setConsentFileData(docfilesConsent)
        //     setShowConsentPdfFilePath(docfilesConsent[0].doc_path)
        //     setShowConsentPdfFileName(docfilesConsent[0].flnm)
        //   }
        //   if (data.data.docfilesAuth && data.data.docfilesAuth.length > 0) {
        //     const { docfilesAuth, ...restData } = data.data;
        //     textDts = convertFldValuesToString(restData);
        //     setFormData(textDts)
        //     // setFileAuth(docfilesAuth)
        //     setShowAuthPdfFilePath(docfilesAuth[0].doc_path)
        //     setShowAuthPdfFileName(docfilesAuth[0].flnm)
        //   } else {
        //     setFileData([])
        //     setFileAuth([])
        //     setConsentFileData([])
        //     setShowUpldPdf(false)
        //     const { docfilesAuth, docfilesConsent, docfiles, ...restData } = data.data;
        //     textDts = convertFldValuesToString(restData);
        //   }
        //   setFileData([])
        //   setFileAuth([])
        //   setConsentFileData([])
        //   setShowUpldPdf(false)
        //   const { docfilesAuth, docfilesConsent, docfiles, ...restData } = data.data;
        //   textDts = convertFldValuesToString(restData);
        //   dispatch({ type: ACTIONS.SETFORM_DATA, payload: textDts });
        //   dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        // }

        else {
          setArStatus(data.data.ar_status)
          if (data.data.onlem && data.data.onlem == 'Yes') {
            setEmission(true)
          } else {
            setEmission(false)
          }


          setAllFieldDisabled(true);
          let textDts = convertFldValuesToString({ ...data.data, docfiles: undefined, docfilesConsent: undefined, docfilesAuth: undefined });

          if (data.data.docfiles?.length) {
            setShowDeletePdf(false);
            setShowUpldPdf(true);
            const { doc_path, flnm } = data.data.docfilesConsent[0];
            setFileData(data.data.docfiles);
            setShowDocPdfFilePath(doc_path);
            setShowDocPdfFileName(flnm);
          }

          if (data.data.docfilesConsent?.length) {
            const { doc_path, flnm } = data.data.docfilesConsent[0];
            setShowConsentPdfFilePath(doc_path);
            setShowConsentPdfFileName(flnm);
          }

          if (data.data.docfilesAuth?.length) {
            const { doc_path, flnm } = data.data.docfilesAuth[0];
            setShowAuthPdfFilePath(doc_path);
            setShowAuthPdfFileName(flnm);
          }

          setFormData(textDts);
          dispatch({ type: ACTIONS.SETFORM_DATA, payload: textDts });
          dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        }



      }
    }
  }

  // const { data: datab, refetch: refetchB } = useQuery({
  //   queryKey: ["getQryCbwtf", year, sttValue, cbwtfValue],
  //   queryFn: () => GetData(year),
  //   enabled: true,
  //   staleTime: 0,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  //   onSuccess: ShowData,
  // });
  const { data: datab, refetch: refetchB } = useQuery({
    queryKey: ["getQryCbwtf", year, sttValue, cbwtfValue],
    queryFn: () => GetData(year),
    enabled: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData
  });


  const clrFunct = () => {
    // dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    // setTimeout(() => {
    //   // console.log(state.frmData);
    //   // console.log(state.textDts);
    //   dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    // }, 1000)

    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    // setTimeout(()=>{
    //   dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });

    // },300)
    setShowDeletePdf(false)
    setFileData([])
    setFileAuth([])
    setConsentFileData([])
    setPdfError('')
    setConsentPdfError('')
    setAuthPdfError('')

  }



  const getCbwtf = (stateData: string, filter: string) => {
    //let api: string = getApiFromBiowaste("cbwtfregtdy");
    let payload: any = postLinux(getLvl() + '=' + getWho() + '=' + filter, 'cbwtflistDrp')
    if (stateData) {
      payload = postLinux('STT=' + stateData.split("|")[0] + '=' + filter, 'cbwtflistDrp');
    }
    setNotFoundCbwtfFltr(true);
    return nrjAxiosRequestBio('cbwtfnmlist', payload)
  };

  const getCbwtfSuccess = (datacbwtf: any) => {
    if (datacbwtf && datacbwtf.status == 200 && datacbwtf.data) {
      let i: number = 0;
      let strCmbo: string = "";
      if (datacbwtf.data && Array.isArray(datacbwtf.data) && datacbwtf.data.length) {
        while (i < datacbwtf.data.length) {
          if (strCmbo) {
            strCmbo += "$^";
          }
          strCmbo += "id][" + datacbwtf.data[i]["cbwtfid"] + "=";
          strCmbo += "txt][" + datacbwtf.data[i]["txt"];
          i += 1;
        }
        dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: strCmbo });
        setNotFoundCbwtfFltr(false);
        return;
      }
      else {
        dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: "" });
        setNotFoundCbwtfFltr(true);
      }
    }
  };


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


  const { data: datacbwtf, refetch: refetchcbwtf } = useQuery({
    queryKey: ["cbwtfcombobox", sttValue, fltr],
    queryFn: () => getCbwtf(sttValue, fltr),
    enabled: true,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: getCbwtfSuccess,
  });


  const onSearchDb = (fldnm: string, fltr: string) => {
    setFltr(fltr)
    setNotFoundCbwtfFltr(false);
  }

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

  const onChangeRgd = (data: string) => {

    // rgdid
    let fldN: any = utilities(2, data, "");
    if (fldN == 'rgdid') {
      setRgdValue(getFldValue(data, 'rgdid').split('|')[0])
    }
    if (fldN == 'sttid') {
      setSttValue(getFldValue(data, 'sttid').split('|')[0])
    }
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const onChangeCbwtf = (data: string) => {
    setCbwtfValue(getFldValue(data, 'cbwtfid').split('|')[0])
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };


  useEffectOnce(() => {
    let value1 = new Date().getFullYear()
    setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}`)
    setPdfOption("id][1=txt][Yes$^id][2=txt][No")
    setsterilizationOptn("id][1=txt][Yes$^id][2=txt][No")
    setGovernmentCombo("id][1=txt][Government$^id][2=txt][Private$^id][3=txt][SemiGovernment$^id][4=txt][Any Other")

  })

  const handlePdfFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      if (fileList.length > 4) {
        // showToaster(["Can Upload max 4 Files"], "error");
        setPdfError('The maximum Number of uploaded PDF files allowed is 4');
        return;
      }
      const totalSize = Array.from(fileList).reduce((acc, file) => acc + file.size, 0);
      const totalSizeInMB = totalSize / (1024 * 1024); // Convert bytes to MB
      if (totalSizeInMB > 4) {
        // showToaster(['Total file size should be less than 4 MB.'],"error")
        setPdfError('Total file size should be less than 4 MB.')
        return;
      }
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.type !== 'application/pdf') {
          setPdfError("Only Pdf File upload")
          return;
        }
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
          const base64String = e.target?.result as string;
          const existingFileIndex = fileData.findIndex((f) => f.flnm === file.name);
          if (existingFileIndex === -1) {
            setFileData((prevFileData) => [
              ...prevFileData,
              { flnm: file.name, flst: base64String },
            ]);
            setPdfError('')
          } else {
            setPdfError('File already uploaded not allow to upload duplicate file')
            return;
          }
        };
        fileReader.readAsDataURL(file);
        setShowDeletePdf(true)
      }
    }
  };

  const handleDeleteFile = (index: number) => {
    const updatedFiles = [...fileData];
    updatedFiles.splice(index, 1);
    setFileData(updatedFiles);
  };

  const handlePdfAuthFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    const fileList = fileInput.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0]; // Allow only one file

      if (file.type !== "application/pdf") {
        setAuthPdfError("Only PDF files are allowed.");
        return;
      }

      if (file.size / (1024 * 1024) > 4) {
        setAuthPdfError("File size should be less than 4 MB.");
        return;
      }

      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const base64String = e.target?.result as string;
        setFileAuth([{ flnm: file.name, flst: base64String }]); // Replace previous file
        setAuthPdfError("");

        // Reset file input to allow re-upload of the same file
        fileInput.value = "";
      };

      fileReader.readAsDataURL(file);
      setShowDeletePdf(true);
    }
  };





  const handleDeleteAuthFile = (fileName: string) => {
    const updatedFiles = [...fileAuth];
    const index = updatedFiles.findIndex(file => file.flnm === fileName);
    if (index !== -1) {
      updatedFiles.splice(index, 1);
    }
    setFileAuth(updatedFiles);
  };



  const Seperator = (props: any) => {
    return (
      <>
        <div className="mt-7">
          <div className="font-semibold" style={{ color: '#3657ac' }}>
            {/* <div className="font-semibold" style={{ color: '#009ED6' }}> */}
            {capitalizeTerms(props.heading)}
          </div>
          <div className="mt-2" style={{ border: '1px solid #86c6d9' }}>
          </div>
        </div>
      </>
    )
  }

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseOver = () => {
    setIsHovered(true);
  };

  const handleMouseOut = () => {
    setIsHovered(false);
  };

  function returnDisabled() {
    let disabeled: boolean = true
    if (captiveValue) {
      disabeled = false
      return disabeled
    } else {
      disabeled = true
      return disabeled
    }
  }

  const [captiveValue, setCaptiveValue] = useState<boolean>(false)
  const [isSameAsCBWTF, setIsSameAsCBWTF] = useState(false);
  const handleSameAddress = (checked: boolean) => {

    let value = ''
    if (checked) {
      value = getFldValue(state.textDts, 'addf')
      dispatch({ type: ACTIONS.FORM_DATA, payload: `addc][${value}` })

    } else {
      value = ' '
      dispatch({ type: ACTIONS.FORM_DATA, payload: `addc][${value}` })
    }
    setIsSameAsCBWTF(checked);
  }

  const handleConsentFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    const fileList = fileInput.files;
    const maxFileSizeKB = 250;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      if (file.type !== 'application/pdf') {
        setConsentPdfError('Only PDF files are allowed.');
        return;
      }

      // Check file size
      const fileSizeKB = file.size / 1024; // Convert bytes to KB
      if (fileSizeKB > maxFileSizeKB) {
        setConsentPdfError('File size should be up to 250 KB.');
        return;
      }

      const fileName = file.name;
      const fileNameRegex = /^[a-zA-Z0-9_.-]+\.pdf$/; // Valid file name pattern
      if (!fileNameRegex.test(fileName)) {
        setConsentPdfError('File name should not contain special characters, spaces, or multiple dots.');
        return;
      }

      // Check for duplicate files
      if (consentfileData.some((f) => f.flnm === file.name)) {
        setConsentPdfError('File already uploaded. Duplicate files are not allowed.');
        return;
      }

      // Reset error message if file is valid
      setConsentPdfError('');


      // Read file and convert to base64
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const base64String = e.target?.result as string;
        const cleanedBase64 = base64String.split(',')[1];

        setConsentFileData([{ flnm: file.name, flst: cleanedBase64 }]);

        // **Reset file input to allow re-uploading the same file**
        fileInput.value = "";
      };
      fileReader.readAsDataURL(file);
    }
  };


  const handleFileDelete = (fileName: string) => {
    setConsentFileData((prevFileData) => prevFileData.filter(file => file.flnm !== fileName));
  };

  const handleShowPdfClick = async (path: any) => {
    if (!path) return;

    let cmpid = getCmpId() || "";
    let usrnm = getUsrnm() || "";
    let payload = { cmpid, usrnm, doc_path: path };

    let data = await nrjAxiosRequestBio("get_AR_docfile", payload);
    if (data) {
      let base64 = data.data.flst;

      // Remove "data:application/pdf;base64," if it's already present
      const prefix = "data:application/pdf;base64,";
      if (base64.startsWith(prefix)) {
        base64 = base64.slice(prefix.length);
      }

      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <embed src="data:application/pdf;base64,${base64}" type="application/pdf" width="100%" height="100%" />
        `);
      } else {
        alert("Pop-up blocker may be preventing the PDF from opening. Please disable the pop-up blocker for this site.");
      }
    }
  };

  const [consentNumber, setConsentNumber] = useState<string>("")
  const [hcfId, setHcfId] = useState<string>("")
  const HandleValidateConsentClick = async () => {
    let consent_no = ''

    let api: string = state.textDts
    consent_no = getFldValue(api, 'stscnstno');
    let cmpid = getCmpId() || "";
    let usernm = getUsrnm() || "";
    let hcfid = hcfId ? hcfId : ''
    // let consent_no = consentNumber ? consentNumber : ''
    let st = "MP"

    let consent_files = ''
    let payload: any = postLinux(cmpid + '=' + usernm + '=' + hcfid + '=' + st + '=' + consent_no + '=' + consent_files, 'cbwtf_consent_update');
    payload['consent_files'] = consentfileData ? consentfileData : [];
    return nrjAxiosRequestBio("validate_and_store_cbwtf_consent", payload);
  };

  const svdValidate = (dataC: any) => {

    // refetchW();
    // dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    let dt: any = GetResponseLnx(dataC)
    if (dt.dt_exp) {

      const userConsentDetails = {
        consentNumber: dt.consent_no,
        consentFrmDate: dt.dt_app,
        consentToDate: dt.dt_exp,
        consentflnm: dt.flnm,
        consentflPath: dt.doc_path,

        // other fields...
      };

      localStorage.setItem('hcconsentdetails', JSON.stringify(userConsentDetails));
      showToaster(["Consent was successfully validated."], 'success');
      // dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_app][${dt.dt_app}=dt_exp][${dt.dt_exp}` })
      // dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_app][${dt.dt_app}=dt_exp][${dt.dt_exp}` })
      // dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt })
      if (dt.doc_path && dt.flnm) {
        setShowConsentPdfFilePath(dt.doc_path)
        setShowConsentPdfFileName(dt.flnm)
      } else {
        setShowConsentPdfFilePath([])
        setShowConsentPdfFileName([])
      }
      setConsentNumber(dt.consent_no ? dt.consent_no : '')
      // setConsentFromDt(dt.dt_app ? dt.dt_app : '')
      // setConsentToDt(dt.dt_exp ? dt.dt_exp : '')
      // // dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_app][${dt.dt_app}=dt_exp][${dt.dt_exp}` })
      // setConstDisbld(true)
      // setTimeout(() => {
      //     refetchHcfData();
      // },100)

    }
    else {
      if (dt.status == 'Failed')
        showToaster([dt.message], 'error')
      // setConsentFromDt('')
      // setConsentToDt('')
      setShowConsentPdfFilePath([])
      setShowConsentPdfFileName([])
      // setConsentFileData([])
      let val = ' '
      // dispatch({ type: ACTIONS.FORM_DATA, payload: `stscnstno][${val}` })
      // setConsentNumber('')
    }
  }

  const { data: consentData, refetch: consentValidate } = useQuery({
    queryKey: ['svValidate', state.mainId, state.rndm],
    queryFn: HandleValidateConsentClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdValidate,
  });



  const ClickConsentValidate = () => {
    const nobd: string = getFldValue(state.textDts, 'nobd');
    const hcfType: string = getFldValue(state.textDts, 'hcftypid');
    let api: string = state.textDts;
    let consent_no = getFldValue(api, 'stscnstno');

    // Check if consentNumber is provided
    if (!consent_no) {
      showToaster(["Enter Consent Number"], 'error')
      return;
    }

    // Convert nobd to a number
    const nobdValue = Number(nobd);

    if (nobd && nobdValue >= 30) {
      // Check if fileData is empty when nobd is 30 or above
      if (fileData.length === 0) {

        showToaster(["Please attach a PDF file."], 'error')
        return;
      } else {
        consentValidate();
      }
    }

    // If nobd is below 30 or if it is 30 or above and the file is attached, call consentValidate
    if (nobdValue < 30 && consent_no) {
      consentValidate();
    }
  };
  return (
    <>
      {/* <div className={`${hideInCbwtf ? 'overflow-y-auto h-screen bg-white' : 'bg-white'}`}> */}
      <div className={`${hideInCbwtf ? 'overflow-y-auto min-h-screen bg-white' : 'bg-white'} w-full max-w-screen-xl mx-auto overflow-x-hidden`}>
        {/* {hideInCbwtf ? <CbwtfHeader></CbwtfHeader> : <></>} */}
        {/*  */}
        <div className='px-3 pb-10 '>

          <div className="rounded" >
            {hideInCbwtf ? <></> : <>
              <div className='my-3 flex justify-end'>
                <Button
                  size="medium"
                  className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"

                  style={{ color: '#38a169', backgroundColor: "#fff", textTransform: "none" }}
                  variant="contained"
                  color="success"
                  onClick={() => { navigate(`/cbwtfAnnulrptcpcb`) }}
                >
                  Back
                </Button>
              </div>
            </>

            }
            <div style={{ textAlign: 'center', color: 'rgba(2, 1, 15, 0.5)' }}>
              <h4><span>Fill annual report as per
                BMWM rules, 2016</span></h4>
            </div>
            <div className="state-header">
              <div className="marquee-container">
                <div
                  className={`marquee ${isHovered ? 'paused' : ''}`}
                  onMouseOver={handleMouseOver}
                  onMouseOut={handleMouseOut}
                >
                  <p className="marquee-content">
                    <h6 className="text-[20px] mt-2 inverted">To be submitted to the prescribed authority on or before 30th
                      june every year for the period from january
                      to december of the preceding year, by the occupier of  common biomedical waste treatment facility (CBWTF)</h6>
                  </p>
                </div>
              </div>

            </div>
            <div className="mx-7 pt-5">

              <div className="mb-4 pb-4 mx-3">
                {/* <Seperator heading="Select From Dropdown"></Seperator> */}
                <div className=" mt-4 grid grid-cols-4 gap-x-8 gap-y-4">
                  {(!hideFieldInStt && !hideFieldInCpcb) &&
                    // <WtrRsSelect
                    //   Label="Select year"
                    //   speaker="Select year"
                    //   fldName="dt_yearid"
                    //   idText="txtdt_yearid"
                    //   displayFormat={"1"}
                    //   onChange={onChangeDts}
                    //   selectedValue={state.frmData}
                    //   clrFnct={state.trigger}
                    //   allwZero={"0"}
                    //   fnctCall={false}
                    //   dbCon=""
                    //   typr=""
                    //   dllName={""}
                    //   fnctName={""}
                    //   parms={""}
                    //   allwSrch={true}
                    //   delayClose={1000}
                    //   loadOnDemand={loadOnDemand}
                    // ></WtrRsSelect>
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


                  }

                  {/* {(hideInRgd || hideFieldInCpcb) &&
                    <WtrRsSelect
                      Label="Regional directorate"
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
                      delayClose={0}
                      placement="bottom"
                      displayFormat="1"
                      disable={!hideInCbwtf || allFieldDisabled}
                    ></WtrRsSelect>} */}

                  {(hideFieldInStt || hideFieldInCpcb || hideInRgd) &&
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
                      delayClose={0}
                      placement="bottom"
                      displayFormat="1"
                      disable={!hideInCbwtf || allFieldDisabled}
                    ></WtrRsSelect>}

                  {(hideFieldInStt || hideFieldInCpcb || hideInRgd) && <WtrRsSelect
                    Label={'CBWTF'}
                    displayFormat="1"
                    fldName="cbwtfid"
                    idText="txtcbwtfid"
                    onChange={onChangeCbwtf}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    allwZero={"0"}
                    fnctCall={false}
                    dbCon={""}
                    typr={""}
                    loadOnDemand={state.cbwtfCombo}
                    dllName={""}
                    fnctName={""}
                    parms={""}
                    forceDbSearch={true}
                    allwSrch={true}
                    speaker={"Select CBWTF"}
                    onSearchDb={onSearchDb}
                    disable={!hideInCbwtf || allFieldDisabled}
                    menuStyle={{ maxWidth: '400px', minWidth: '200px' }}
                  ></WtrRsSelect>}

                </div>
              </div>
              <table className="table table-bordered min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr className="py-3 bg-gray-100">
                    <th className="border" scope="col">S. number</th>
                    <th className="border" scope="col">Particulars</th>
                    <th className="border" scope="col">Details</th>
                  </tr>
                  <tr className="py-1">
                    <th className="border px-3" scope="col">1</th>
                    <th className="border text-left px-3" scope="col">Particulars of common biomedical waste treatment facility</th>
                    <th className="border" scope="col"></th>
                  </tr>
                </thead>
                <tbody>

                  <tr>
                    <td className="border px-3">1.1</td>
                    <td className="border px-3"> Name  of CBWTF<span className="text-red-600">*</span></td>
                    <td className="border px-3"><WtrInput
                      displayFormat="1"
                      Label=""
                      fldName="cbwtfnm"
                      idText="txtcbwtfnm"
                      onChange={onChangeDts}
                      dsabld={true}
                      callFnFocus=""
                      dsbKey={false}
                      validateFn="1[length]"
                      allowNumber={false}
                      unblockSpecialChars={true}
                      selectedValue={state.frmData}
                      clrFnct={state.trigger}
                      delayClose={1000}
                      placement="right"
                      ClssName=""
                      placeholder="Name  of CBWTF"
                    ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">1.2</td>
                    <td className="border px-3"> Address of CBWTF<span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="addf"
                        idText="txtaddf"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        // validateFn="1[length]"
                        allowNumber={false}
                        unblockSpecialChars={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        speaker={""}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Address of CBWTF"
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">1.3</td>
                    <td className="border px-3">
                      Address of correspondence<span className="text-red-600">*</span>
                      <label className="ml-2 flex items-center">
                        <input
                          type="checkbox"
                          className="mr-1"
                          checked={isSameAsCBWTF}
                          onChange={(e) => handleSameAddress(e.target.checked)}
                        />
                        <span>Same as address of CBWTF</span>
                      </label>
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="addc"
                        idText="txtaddc"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        placeholder="Address of correspondence"
                        unblockSpecialChars={true}
                      ></WtrInput></td>
                  </tr>



                  <tr>
                    <td className="border px-3">1.5 </td>
                    <td className="border px-3">
                      GPS coordinates of CBWTF  <span className="text-red-600">*</span>
                    </td>
                    <td className="border px-3">
                      <div className="flex gap-4">
                        <WtrInput
                          displayFormat="1"
                          Label="Latitude"
                          fldName="gpscordlat"
                          idText="txtgpscordlat"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled}
                          callFnFocus=""
                          dsbKey={false}
                          minValue={-1}
                          validateFn="[latitude]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placeholder="Latitude"
                        />
                        <WtrInput
                          displayFormat="1"
                          Label="Longitude"
                          fldName="gpscordlong"
                          idText="txtgpscordlong"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled}
                          callFnFocus=""
                          dsbKey={false}
                          minValue={-1}
                          validateFn="[longitude]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placeholder="Longitude"
                        />
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="border px-3">1.6</td>
                    <td className="border px-3"> URL of CBWTF website<span className="text-red-600">*</span> </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="urlweb"
                        idText="txturlweb"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        unblockSpecialChars={true}
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placeholder="URL of CBWTF website"
                      // speaker={"Enter URL of Website"}
                      ></WtrInput>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">1.7</td>
                    <td className="border px-3"> Name of authorized person <span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="authnm"
                        idText="txtauthnm"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Name of authorized person "
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">1.8</td>
                    <td className="border px-3">Contact number of
                      authorized person<span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="telno"
                        idText="txttelno"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="[mob]"
                        allowNumber={true}
                        ToolTip="Enter numbers only"
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placeholder="Contact number of
                      authorized person"
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">1.9</td>
                    <td className="border px-3">E-mail id for communication<span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=" "
                        fldName="eml"
                        idText="txteml"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="[email]"
                        unblockSpecialChars={true}
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placeholder="E-mail id for communication"
                      ></WtrInput>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">1.10</td>
                    <td className="border px-3">Fax number for
                      communication</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="fxno"
                        idText="txtfxno"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        allowNumber={true}
                        ToolTip="Enter numbers only"
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placeholder="Fax number for  communication"
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>
                  </tr>

                  <tr>
                    <td className="border px-3">1.11</td>
                    <td className="border px-3">Ownership of CBWTF<span className="text-red-600">*</span> </td>
                    <td className="border px-3 py-2">
                      <WtrRsSelect
                        displayFormat="1"
                        Label=""
                        fldName="ownhcfid"
                        idText="txtownhcfid"
                        onChange={onChangeDts}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        allwZero={"1"}
                        fnctCall={false}
                        dbCon={"shrtrm"}
                        typr={"589"}
                        dllName={""}
                        fnctName={""}
                        parms={""}
                        allwSrch={true}
                        speaker={""}
                        delayClose={1000}
                        disable={!hideInCbwtf || allFieldDisabled}
                        loadOnDemand={governmentCombo}
                      ></WtrRsSelect>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">1.12</td>
                    <td className="border px-3">Status of authorisation under BMWM rules, 2016 <span className="text-red-600">*</span> </td>
                    <td className="border px-3 py-2">
                      <WtrInput
                        displayFormat="1"
                        Label="Authorisation Number"
                        fldName="stsauth"
                        idText="txtstsauth"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        unblockSpecialChars={true}
                      ></WtrInput>
                      <div style={{ flex: 1, }}> {/* Second div */}

                        {/* {hideInCbwtf ?
                          <div style={{ marginTop: '6px', marginBottom: '4px' }}>
                            <label style={{ display: 'inline-block', padding: '9px 47px', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder', }}>Choose File
                              <input type="file" name='docfiles' onChange={handlePdfAuthFileChange} multiple disabled={!hideInCbwtf || allFieldDisabled} style={{ display: 'none' }} />
                            </label>
                            {authpdfError && <p style={{ color: 'red' }}>{authpdfError}</p>}
                            <div>
                              {fileAuth.map((file, index) => (
                                <div key={index} className="flex items-center mb-2">
                                  <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> 
                                  <span className="mr-2">{file.flnm}</span>
                                  {showDeletePdf &&
                                    <img className='deleImage' src={DeleteIcon} alt="Delete-Icon" onClick={() => handleDeleteAuthFile(index)} />}
                                </div>
                              ))}
                            </div>
                          </div> :
                          <div>
                            {showAuthFile.map((file, index) => (
                              <div key={index} className="flex items-center mb-2">
                                <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> 
                                <a
                                  href="#"
                                  onClick={() => handleShowPdfClick(file.doc_path)}
                                  style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                  {file.flnm}
                                </a>
                              </div>
                            ))}
                          </div>
                        } */}

                        {showAuthFileName.length > 0 ?
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                              src={PdfIcon}
                              alt="PDF Icon"
                              style={{ width: '24px', height: '24px', marginRight: '8px' }}
                            />
                            <a
                              href="#"
                              onClick={() => handleShowPdfClick(showAuthFilePath)}
                              style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                              {showAuthFileName}
                            </a>
                          </div> :
                          // <div style={{ marginTop: '6px', marginBottom: '4px' }}>
                          //   <label

                          //     className="block text-sm font-medium text-gray-700"
                          //     style={{ fontSize: "14px", color: "#020134" }}
                          //   >
                          //     Authorization Document Upload
                          //   </label>
                          //   <label style={{ display: 'inline-block', padding: '9px 47px', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder', }}>Choose File
                          //     <input type="file" name='docfiles' onChange={handlePdfAuthFileChange} multiple disabled={!hideInCbwtf || allFieldDisabled} style={{ display: 'none' }} />
                          //   </label>
                          //   {authpdfError && <p style={{ color: 'red' }}>{authpdfError}</p>}
                          //   <div>
                          //     {fileAuth.map((file, index) => (
                          //       <div key={index} className="flex items-center mb-2">
                          //         <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                          //         <span className="mr-2">{file.flnm}</span>
                          //         {showDeletePdf &&
                          //           <img className='deleImage' src={DeleteIcon} alt="Delete-Icon" onClick={() => handleDeleteAuthFile(index)} />}
                          //       </div>
                          //     ))}
                          //   </div>
                          // </div>
                          <div style={{ flex: 1, marginLeft: '5px' }}> {/* Second div */}
                            <div style={{ marginTop: '20px', marginBottom: '4px' }}>
                              {/* Title above the file upload */}

                              <label

                                className="block text-sm font-medium text-gray-700"
                                style={{ fontSize: "14px", color: "#020134" }}
                              >
                                Authorization document upload
                              </label>
                              <label style={{ display: 'inline-block', padding: '9px 47px', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder' }}>
                                <i className="fas fa-upload" style={{ marginRight: '8px', verticalAlign: 'middle' }}></i>
                                Attach document
                                <input type="file" name='authfiles' style={{ display: 'none' }} onChange={handlePdfAuthFileChange} multiple={false} disabled={!hideInCbwtf || allFieldDisabled} />
                              </label>
                              <br />
                              {authpdfError && <p style={{ color: 'red' }}>{authpdfError}</p>}
                            </div>

                            <div>
                              {/* {fileAuth.map((file: { flnm: string, flst: string }) => (
                                <div key={file.flnm} style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                  <img
                                    src={PdfIcon}
                                    alt="PDF Icon"
                                    style={{ width: '24px', height: '24px', marginRight: '8px' }}
                                  />
                                  <span>{file.flnm}</span>
                                  <button onClick={() => handleDeleteAuthFile(file.flnm)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <FontAwesomeIcon icon={faTrash} style={{ color: 'red', marginRight: '4px' }} />
                                    <span className="text-red-500">Delete</span>
                                  </button>
                                </div>
                              ))} */}
                              {fileAuth.map((file: { flnm: string, flst: string }) => (
                                <div
                                  key={file.flnm}
                                  className="flex items-center  mt-2 flex-wrap"
                                >
                                  {/* File Icon & Name */}
                                  <div className="flex items-center flex-1 min-w-0">
                                    <img src={PdfIcon} alt="PDF Icon" className="w-6 h-6 mr-2" />
                                    <span className="truncate max-w-[200px]">{file.flnm}</span>
                                  </div>

                                  {/* Delete Button */}
                                  <button
                                    onClick={() => handleDeleteAuthFile(file.flnm)}
                                    className="flex items-center text-red-500 hover:text-red-600 transition"
                                  >
                                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              ))}

                            </div>

                          </div>}
                      </div>
                      {year !== '' ? <NrjRsDt
                        format="dd-MMM-yyyy"
                        fldName="authdt_exp"
                        displayFormat="1"
                        idText="txtauthdt_exp"
                        size="lg"
                        Label="Valid up to"
                        selectedValue={state.frmData}
                        onChange={onChangeDts}
                        disAbleFor={true}
                        readOnly={calendarDisabled()}
                        shouldDisableFutureDates={true}
                      ></NrjRsDt> :
                        <NrjRsDt
                          format="dd-MMM-yyyy"
                          fldName="authdt_exp"
                          displayFormat="1"
                          idText="txtauthdt_exp"
                          size="lg"
                          Label="Valid up to"
                          selectedValue={state.frmData}
                          onChange={onChangeDts}
                          disAbleFor={true}
                          readOnly={true}
                        ></NrjRsDt>}

                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">1.13</td>
                    <td className="border px-3">Status of consents under Water act and air Act <span className="text-red-600">*</span> </td>
                    <td className="border px-3 py-2">
                    <WtrInput
                        displayFormat="1"
                        Label="Consent number"
                        fldName="stscnstno"
                        idText="txtstscnstno"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        speaker='Enter Valid Consent Number'

                      ></WtrInput>
                      {year !== '' ? <NrjRsDt
                        format="dd-MMM-yyyy"
                        fldName="dt_exp"
                        displayFormat="1"
                        idText="txtdt_exp"
                        size="lg"
                        Label="Valid up to"
                        selectedValue={state.frmData}
                        onChange={onChangeDts}
                        disAbleFor={true}
                        readOnly={calendarDisabled()}
                        shouldDisableFutureDates={true}
                      ></NrjRsDt> : <NrjRsDt
                        format="dd-MMM-yyyy"
                        fldName="dt_exp"
                        displayFormat="1"
                        idText="txtdt_exp"
                        size="lg"
                        Label="Valid up to"
                        selectedValue={state.frmData}
                        onChange={onChangeDts}
                        disAbleFor={true}
                        readOnly={true}
                      ></NrjRsDt>}
                      

                      <tr>
                        {showConsentFileName.length > 0 ?
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                              src={PdfIcon}
                              alt="PDF Icon"
                              style={{ width: '24px', height: '24px', marginRight: '8px' }}
                            />
                            <a
                              href="#"
                              onClick={() => handleShowPdfClick(showConsentFilePath)}
                              style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                              {showConsentFileName}
                            </a>
                          </div> :
                          <div style={{ flex: 1, marginLeft: '5px' }}> {/* Second div */}
                            <div style={{ marginTop: '20px', marginBottom: '4px' }}>
                              {/* Title above the file upload */}

                              <label

                                className="block text-sm font-medium text-gray-700"
                                style={{ fontSize: "14px", color: "#020134" }}
                              >
                                PCB Consent document upload
                              </label>
                              <label style={{ display: 'inline-block', padding: '9px 47px', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder' }}>
                                <i className="fas fa-upload" style={{ marginRight: '8px', verticalAlign: 'middle' }}></i>
                                Attach document
                                <input type="file" name='Consentfiles' style={{ display: 'none' }} onChange={handleConsentFileChange} multiple={false} disabled={!hideInCbwtf || allFieldDisabled} />
                              </label>
                              <br />
                              {consentpdfError && <p style={{ color: 'red' }}>{consentpdfError}</p>}
                            </div>

                            <div>
                              {consentfileData.map((file: { flnm: string, flst: string }) => (
                                <div key={file.flnm} style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                  <img
                                    src={PdfIcon}
                                    alt="PDF Icon"
                                    style={{ width: '24px', height: '24px', marginRight: '8px' }}
                                  />
                                  <span style={{ marginRight: 'auto' }}>{file.flnm}</span>
                                  <button onClick={() => handleFileDelete(file.flnm)} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <FontAwesomeIcon icon={faTrash} style={{ color: 'red', marginRight: '4px' }} />
                                    <span className="text-red-500">Delete</span>
                                  </button>
                                </div>
                              ))}
                            </div>

                          </div>}
                        {consentfileData && consentfileData.length > 0 && (
                          <div className="flex justify-start mt-6 mr-[0rem] sm:mr-0">
                            <Button
                              size="medium"
                              style={{ backgroundColor: "#34c3ff", textTransform: "none" }}
                              variant="contained"
                              color="success"
                              startIcon={<SaveIcon />}
                              onClick={ClickConsentValidate}
                              disabled={false}
                              className="whitespace-nowrap px-4"
                            >
                              Validate
                            </Button>
                          </div>
                        )}

                      </tr>
                    </td>
                  </tr>


                  {/* ***************** Details of CBWTF************ */}

                  <tr className="bg-gray-50">
                    <th className="border px-3  py-1">2</th>
                    <th className="border px-3  text-left">Details of CBWTF</th>
                    <th className="border px-3 text-left"></th>
                  </tr>
                  <tr>
                    <td className="border px-3">2.1</td>
                    <td className="border px-3">Number of healthcare facilities covered by CBWTF <span className="text-red-600">*</span></td>
                    <td className="border px-3"><WtrInput
                      displayFormat="1"
                      Label=""
                      fldName="nohcf"
                      idText="txtnohcf"
                      onChange={onChangeDts}
                      dsabld={!hideInCbwtf || allFieldDisabled}
                      callFnFocus=""
                      dsbKey={false}
                      validateFn="1[length]"
                      allowNumber={true}
                      selectedValue={state.frmData}
                      clrFnct={state.trigger}
                      delayClose={1000}
                      placement="right"
                      ClssName=""
                      placeholder="Number healthcare facilities covered by CBWTF"
                    ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">2.2</td>
                    <td className="border px-3">Number of beds covered by CBWTF <span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="nobeds"
                        idText="txtnobeds"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Number of beds covered by CBWTF"
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">2.3</td>
                    <td className="border px-3"> Installed treatment and disposal capacity of CBWTF (Kg/day)<span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="capcbwtf"
                        idText="txtcapcbwtf"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        placeholder="Installed treatment and disposal capacity of CBWTF (Kg/day)"
                        allowDecimal={true}
                        noofDecimals={3}
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">2.4</td>
                    <td className="border px-3">Quantity of biomedical waste treated or disposed by CBWTF (Kg/day)<span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="qntybio"
                        idText="txtqntybio"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        // validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Quantity of biomedical waste treated or disposed by CBWTF (Kg/day)"
                        // speaker={"Enter Number of Beds"}
                        allowDecimal={true}
                        noofDecimals={3}
                      ></WtrInput></td>
                  </tr>



                  {/* ***************** Quantity of waste generated or disposed in Kg per
annum (on monthly average basis) ************ */}

                  <tr className="bg-gray-50">
                    <th className="border px-3  py-1">3</th>
                    <th className="border px-3  text-left">Quantity of biomedical waste treated and disposed of in Kg/annum (on monthly average basis) </th>
                    <th className="border px-3 text-left"></th>
                  </tr>
                  <tr>
                    <td className="border px-3">3.1</td>
                    <td className="border px-3">Yellow category wates  <span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="ylwqnt"
                        idText="txtylwqnt"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Yellow category wates"
                        allowDecimal={true}
                        noofDecimals={3}
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">3.2</td>
                    <td className="border px-3">Red category wates <span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="redqnt"
                        idText="txtredqnt"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Red category wates"
                        allowDecimal={true}
                        noofDecimals={3}
                      ></WtrInput>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">3.3</td>
                    <td className="border px-3"> White category wates<span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="whtqnt"
                        idText="txtwhtqnt"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="White category wates"
                        allowDecimal={true}
                        noofDecimals={3}
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">3.4</td>
                    <td className="border px-3">Blue category wates<span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="blqnt"
                        idText="txtblqnt"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Blue category wates"
                        allowDecimal={true}
                        noofDecimals={3}
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>

                  </tr>
                  <tr>
                    <td className="border px-3">3.5</td>
                    <td className="border px-3">General solid waste</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="slqnt"
                        idText="txtslqnt"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="General Solid waste"
                        allowDecimal={true}
                        noofDecimals={3}
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>

                  </tr>


                  {/* ************************************5 Details of the Storage, treatment, transportation, processing and Disposal Facility 
 */}


                  <tr className="bg-gray-50">
                    <th className="border px-3  py-1">4</th>
                    <th className="border px-3  text-left"> Details of the Storage, treatment, transportation, processing and Disposal Facility
                    </th>
                    <th className="border px-3 text-left"></th>
                  </tr>
                  <tr>
                    <td className="border px-3">4.1</td>
                    <td className="border px-3">Details of the on-site storage facility <span className="text-red-600">*</span></td>
                    <td className="border px-3">
                      <tr>
                        <WtrInput
                          displayFormat="1"
                          Label="Size (sq mtr)"
                          fldName="size"
                          idText="txtsize"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput>
                      </tr>
                      <tr className=" px-3">
                        <WtrInput
                          displayFormat="1"
                          Label="Capacity (Kg)"
                          fldName="cap"
                          idText="txtcap"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput>
                      </tr>
                      <tr className=" px-3">
                        {/* <WtrInput
                          displayFormat="1"
                          Label="Provision of on-site storage : (cold storage or
                        any other provision)"
                          fldName="prov"
                          idText="txtprov"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled }
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput> */}
                        <WtrRsSelect
                          displayFormat={"1"}
                          Label="Provision for on-site storage"
                          fldName="provid"
                          idText="txtprovid"
                          onChange={onChangeDts}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          allwZero={"1"}
                          fnctCall={false}
                          dbCon={""}
                          typr={""}
                          dllName={""}
                          fnctName={""}
                          loadOnDemand={state.provStorage}
                          parms={""}
                          allwSrch={true}
                          delayClose={1000}
                          disable={!hideInCbwtf || allFieldDisabled}
                          speaker={"Provision for on-site storage"}
                        ></WtrRsSelect>
                      </tr>
                    </td>
                  </tr>
                  {/* <tr>
                    <td className="border px-3">4.2</td>
                    <td className="border px-3">Treatment and disposal
                    facilities</td>
                    <td className="border px-3"> </td>
                  </tr> */}

                  <tr className="bg-gray-50">
                    <th className="border px-3  py-3">4.2</th>
                    <th className="border px-3  text-left"> Treatment and disposal
                      facilitie
                    </th>
                    <th className="border px-3 text-left py-1">
                      <label>
                        <input
                          type='radio'
                          name='captiveOption'
                          checked={captiveValue}
                          onChange={() => setCaptiveValue(true)}

                        />
                        Yes
                      </label>
                      <label>
                        <input
                          type='radio'
                          name='captiveOption'
                          checked={!captiveValue}
                          onChange={() => setCaptiveValue(false)}

                        />
                        No
                      </label>
                    </th>
                  </tr>
                  <tr>
                    <td className="border px-3">(i)</td>
                    <td className="border px-3">Type of treatment equipment</td>
                    <td>
                      <tr>
                        <td className="px-3 w-3/12">Number of units </td>
                        <td className="px-3 w-3/12"> Capacity of equipment (Kg/day)</td>
                        <td className="px-3 w-3/12">Quantity of waste treated or disposed (in kg per annum)</td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">(ii)</td>
                    <td className="border px-3">Incinerators</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="inc"
                            idText="txtinc"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12">   <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="inccap"
                          idText="txtinccap"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || inc || returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="incanm"
                            idText="txtincanm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || inc || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>

                  <tr>
                    <td className="border px-3">(iii)</td>
                    <td className="border px-3">Plasma pyrolysis</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="pla"
                            idText="txtpla"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12">   <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="placap"
                          idText="txtplacap"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || disPlasCapQua || returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="plaanm"
                            idText="txtplaanm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || disPlasCapQua || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">(iv)</td>
                    <td className="border px-3">Autoclaves</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="autocl"
                            idText="txtautocl"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12">   <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="autoclcap"
                          idText="txtautoclcap"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || autocl || returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="autoclanm"
                            idText="txtautoclnm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || autocl || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">(v)</td>
                    <td className="border px-3">Microwave</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="micro"
                            idText="txtinc"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12">   <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="microcap"
                          idText="txtinccap"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || micro || returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="microanm"
                            idText="txtincanm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || micro || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">(vi)</td>
                    <td className="border px-3">Hydroclave</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="hydr"
                            idText="txthydr"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12">   <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="hydrcap"
                          idText="txthydrcap"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || hydra || returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="hydranm"
                            idText="txthydranm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || hydra || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">(vii)</td>
                    <td className="border px-3">Shredder</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="shr"
                            idText="txtshr"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12">   <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="shrcap"
                          idText="txtshrcap"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || shra || returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="shranm"
                            idText="txtshranm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || shra || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">(viii)</td>
                    <td className="border px-3">Needle tip cutter or destroyer</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="needle"
                            idText="txtneedle"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12 text-center">  - </td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="needleanm"
                            idText="txtneedleanm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || needle || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">(ix)</td>
                    <td className="border px-3">Sharps encapsulation or concrete pit</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="sharp"
                            idText="txtsharp"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12 text-center"> - </td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="sharpanm"
                            idText="txtsharpanm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || sharp || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">(x)</td>
                    <td className="border px-3">Deep burial pits</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="deep"
                            idText="txtdeep"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12">   <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="deepcap"
                          idText="txtdeepcap"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || deep || returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="deepanm"
                            idText="txtdeepanm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || deep || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">(xi)</td>
                    <td className="border px-3">Chemical disinfection</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="chem"
                            idText="txtchem"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12 text-center">  - </td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="chemanm"
                            idText="txtchemanm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || chem || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">(xii)</td>
                    <td className="border px-3">Any other treatment equipment</td>
                    <td className="px-3">
                      <tr className="px-3">
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="anyothr"
                            idText="txtanyothr"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </td>
                        <td className="px-3 w-3/12">   <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="anyothrcap"
                          idText="txtanyothrcap"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || anyothr || returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                        <td className="px-3 w-3/12 text-center">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="anyothranm"
                            idText="txtanyothranm"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || anyothr || returnDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={true}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            allowDecimal={true}
                            noofDecimals={3}
                          ></WtrInput>
                        </td>
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">4.3</td>
                    <td className="border px-3">Quantity of recyclable wastes
                      sold to authorized recyclers after
                      treatment in Kg/annum</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label="Recyclable category waste"
                        fldName="recycle"
                        idText="txtrecycle"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder='Recyclable  category waste'
                        allowDecimal={true}
                        noofDecimals={3}
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>

                  </tr>

                  <tr>
                    <td className="border px-3">4.4</td>
                    <td className="border px-3"> Number of vehicles used for collection
                      and transportation of biomedical
                      waste</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="noveh"
                        idText="txtnoveh"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder=" Number of vehicles used for collection
                  and transportation of biomedical
                  waste"
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">4.5</td>
                    <td className="border px-3">Details of incineration ash and
                      ETP sludge generated and disposed
                      during the treatment of wastes in Kg/annum</td>
                    <td className="border px-3">
                      <tr>
                        <td className="px-3"></td>
                        <td className="px-3">Quantity generated (kg/annum)</td>
                        <td className="px-3">Where disposed</td>
                      </tr>
                      <tr>
                        <td className="px-3">Incineration ash</td>
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="incire"
                          idText="txtincire"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="inciredispo"
                          idText="txtincire"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                      </tr>
                      {/* <tr>
                        <td className="px-3">Ash</td>
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="ash"
                          idText="txtash"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled }
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="ashdispo"
                          idText="txtash"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled }
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                      </tr> */}
                      <tr>
                        <td className="px-3">ETP sludge</td>
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="etpsl"
                          idText="txtetpsl"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput>
                        </td>
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="etpsldispo"
                          idText="txtetpsl"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                      </tr>
                    </td>
                  </tr>
                  {/* <tr>
                    <td className="border px-3">4.6</td>
                    <td className="border px-3"> Name of the Common BioMedical Waste Treatment Facility
                      Operator through which wastes are
                      disposed of </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="nmbio"
                        idText="txtnmbio"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled }
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Name of the Common BioMedical Waste Treatment Facility
                Operator through which wastes are disposed of"
                      ></WtrInput></td>
                  </tr> */}
                  {/* <tr>
                    <td className="border px-3">4.7</td>
                    <td className="border px-3">List of member HCF not handed
                      over bio-medical waste.</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="lsthcf"
                        idText="txtlsthcf"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled }
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        unblockSpecialChars={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="List of member HCF not handed
                  over bio-medical waste."
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>
                  </tr> */}

                  {/* ************************************************************************** */}

                  {/* <tr>
                    <td className="border px-3">5</td>
                    <td className="border px-3">Do you have bio-medical waste
                      management committee? If yes, attach
                      minutes of the meetings held during
                      the reporting period
                    </td>
                    <td className="border px-3">
                      <tr>
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="infobio"
                        idText="txtinfobio"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled }
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Do you have bio-medical waste
                  management committee? If yes, attach
                  minutes of the meetings held during
                  the reporting period"
                      speaker={"Enter Number of Beds"}
                      ></WtrInput>
                      </tr>

                      <tr>
                  <input type='file' onChange={handleFileChange} ></input>
                </tr>
                    </td>


                  </tr> */}

                  <tr className="bg-gray-50">
                    <th className="border px-3  py-1">5</th>
                    <th className="border px-3  text-left">Details trainings conducted on BMW </th>
                    <th className="border px-3 text-left"></th>
                  </tr>
                  <tr>
                    <td className="border px-3">5.1</td>
                    <td className="border px-3">Number of trainings conducted on
                      BMW management.</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="train"
                        idText="txttrain"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Number of trainings conducted on
                  BMW management"
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">5.2</td>
                    <td className="border px-3">Number of personnel trained</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="prstrain"
                        idText="txtprstrain"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Number of personnel trained"
                      ></WtrInput>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">5.3</td>
                    <td className="border px-3"> Number of personnel trained at
                      the time of induction</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="timeind"
                        idText="txttimeind"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Number of personnel trained at
                  the time of induction"
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">5.4</td>
                    <td className="border px-3">Number of personnel not
                      undergone any training so far </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="notrain"
                        idText="txtnotrain"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Number of personnel not
                  undergone any training so far"
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>

                  </tr>
                  <tr>
                    <td className="border px-3">5.5</td>
                    <td className="border px-3">Whether standard manual for
                      training is available?
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="whrtarin"
                        idText="txtwhrtarin"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Whether standard manual for training is available?"
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>

                  </tr>
                  <tr>
                    <td className="border px-3">5.6</td>
                    <td className="border px-3">Any other information
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="otherinfo"
                        idText="txtotherinfo"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Any other information"
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>

                  </tr>
                  {/* ************************************************************ */}

                  <tr className="bg-gray-50">
                    <th className="border px-3  py-1">6</th>
                    <th className="border px-3  text-left">Details of the accident occurred
                      during the year</th>
                    <th className="border px-3 text-left"></th>
                  </tr>
                  <tr>
                    <td className="border px-3">6.1</td>
                    <td className="border px-3">Number of accidents occurred</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="accd"
                        idText="txtaccd"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Number of accidents occurred."
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">6.2</td>
                    <td className="border px-3">Number of the persons affected</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="prsaff"
                        idText="txtprsaff"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Number of the persons affected"
                      ></WtrInput>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">6.3</td>
                    <td className="border px-3">Remedial action taken</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="remedial"
                        idText="txtremedial"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Remedial action taken"
                      ></WtrInput></td>
                  </tr>
                  <tr>
                    <td className="border px-3">6.4</td>
                    <td className="border px-3"> Any fatality occurred, Details </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="ftlity"
                        idText="txtftlity"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder=" Any fatality occurred, Details"
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>

                  </tr>
                  {/* *********************************************************************** */}
                  <tr className="bg-gray-50">
                    <th className="border px-3  py-1">7</th>
                    <th className="border px-3  text-left">Information related to stack monitoring</th>
                    <th className="border px-3 text-left"></th>
                  </tr>
                  <tr>
                    <td className="border px-3">7.1</td>
                    <td className="border px-3">Number of times stack monitoring was done during the year
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="stckmontg"
                        idText="txtstckmontg"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Number of times stack monitoring was done during the year"
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput>
                    </td>
                  </tr>

                  <tr>
                    <td className="border px-3">7.2</td>
                    <td className="border px-3">How many times in last year could not met the standards out of total no. of stack monitoring done during the year
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="stdair"
                        idText="txtstdair"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        // allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="How many times in last year could not met the standards out of total no. of stack monitoring done during the year"
                        // speaker={"Enter Number of Beds"}
                        unblockSpecialChars={true}
                      ></WtrInput></td>

                  </tr>
                  {/* <tr>
                    <td className="border px-3">7.2</td>
                    <td className="border px-3">Details of Continuous online emission
                      monitoring systems installed
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="onlemi"
                        idText="txtonlemi"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled }
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Details of Continuous online emission
                  monitoring systems installed"
                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td>

                  </tr> */}
                  <tr>
                    <td className="border px-3">7.3</td>
                    <td className="border px-3">Whether continuous online emission monitoring systems is installed
                    </td>

                    <td className="border px-3">
                      {/* <tr>
                        <th className="border px-3 text-left py-1">
                          <label>
                            <input
                              type='radio'
                              name='captiveOption'
                              checked={emissionValue}
                              onChange={() => setEmission(true)}

                            />
                            Yes
                          </label>
                          <label>
                            <input
                              type='radio'
                              name='captiveOption'
                              checked={!emissionValue}
                              onChange={() => setEmission(false)}

                            />
                            No
                          </label>
                        </th>
                      </tr> */}

                      <WtrRsSelect
                        displayFormat={"1"}
                        Label=""
                        fldName="onlemid"
                        idText="txtonlemid"
                        onChange={onChangeDts}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        fnctCall={false}
                        dbCon={"nodb"}
                        typr={""}
                        dllName={""}
                        fnctName={""}
                        parms={""}
                        allwSrch={false}
                        speaker={""}
                        loadOnDemand={sterilizationOptn}
                        delayClose={1000}
                        allwZero={"1"}
                        disable={!hideInCbwtf || allFieldDisabled}
                        placement="right"
                      ></WtrRsSelect>


                      {emissionValue &&

                        <tr><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="onlemi"
                          idText="txtonlemi"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf || allFieldDisabled}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Whether continuous online emission monitoring systems is installed"
                          // speaker={"Enter Number of Beds"}
                          unblockSpecialChars={true}
                        ></WtrInput>
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="frqcali"
                            idText="txtfrqcali"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf || allFieldDisabled}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            placeholder="frequency of calibration"
                            // speaker={"Enter Number of Beds"}
                            unblockSpecialChars={true}
                          ></WtrInput>

                        </tr>


                      }


                    </td>
                  </tr>

                  <tr>
                    <td className="border px-3">8</td>
                    <td className="border px-3">Liquid waste generated and
                      treatment methods in place
                    </td>
                    <td className="border px-3">
                      {/* <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="liqwst"
                        idText="txtliqwst"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled }
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                       
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Liquid waste generated and treatment methods in place"
                     
                        unblockSpecialChars={true}
                      ></WtrInput> */}

                      <WtrRsSelect
                        displayFormat={"1"}
                        Label=""
                        fldName="liqwstid"
                        idText="txtliqwstid"
                        onChange={onChangeDts}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        fnctCall={false}
                        dbCon={"nodb"}
                        typr={""}
                        dllName={""}
                        fnctName={""}
                        parms={""}
                        allwSrch={false}
                        speaker={""}
                        loadOnDemand={sterilizationOptn}
                        delayClose={1000}
                        allwZero={"1"}
                        disable={!hideInCbwtf || allFieldDisabled}
                        placement="right"
                      ></WtrRsSelect>

                    </td>

                  </tr>

                  <tr>
                    <td className="border px-3">8.1</td>
                    <td className="border px-3">Number of times treated effluent has been analysed during the year
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="trtefflnt"
                        idText="txttrtefflnt"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Number of times treated effluent has been analysed during the year"
                        // speaker={"Enter Number of Beds"}
                        unblockSpecialChars={true}
                      ></WtrInput>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">8.2</td>
                    <td className="border px-3">How many times in last year could not met the standards out of no. of times treated effluent has been analysed during the year
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="notmettrtefflnt"
                        idText="txtnotmettrtefflnt"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="How many times in last year could not met the standards out of no. of times treated effluent has been analysed during the year"
                        // speaker={"Enter Number of Beds"}
                        unblockSpecialChars={true}
                      ></WtrInput>
                    </td>
                  </tr>

                  <tr>
                    <td className="border px-3">9</td>
                    <td className="border px-3">Is the disinfection method or
                      sterilization meeting the log 4
                      standards?
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="disimth"
                        idText="txtdisimth"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Is the disinfection method or
                  sterilization meeting the log 4
                  standards? "
                        // speaker={"Enter Number of Beds"}
                        unblockSpecialChars={true}
                      ></WtrInput></td>

                  </tr>
                  <tr>
                    <td className="border px-3">9.1</td>
                    <td className="border px-3">How many times you have not met the standards in a year?
                    </td>
                    <td className="border px-3">
                      {/* <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="ntmetsta"
                        idText="txtntmetsta"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled }
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="How many times you have not met the standards in a year?"
                        // speaker={"Enter Number of Beds"}
                        unblockSpecialChars={true}
                      ></WtrInput> */}
                      <WtrRsSelect
                        displayFormat={"1"}
                        Label=""
                        fldName="ntmetstaid"
                        idText="txtntmetstaid"
                        onChange={onChangeDts}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        fnctCall={false}
                        dbCon={"nodb"}
                        typr={""}
                        dllName={""}
                        fnctName={""}
                        parms={""}
                        allwSrch={false}
                        speaker={""}
                        loadOnDemand={sterilizationOptn}
                        delayClose={1000}
                        allwZero={"1"}
                        disable={!hideInCbwtf || allFieldDisabled}
                        placement="right"
                      ></WtrRsSelect>
                    </td>
                  </tr>


                  <tr>
                    <td className="border px-3">10</td>
                    <td className="border px-3">Air pollution control devices attached with the incinerator
                    </td>
                    {/* <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="othrinfo"
                        idText="txtothrinfo"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf || allFieldDisabled }
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Any other relevant information"

                      // speaker={"Enter Number of Beds"}
                      ></WtrInput></td> */}
                    <td className="border px-3">
                      <div className="flex justify-between"> {/* Container div with flex justify-between */}
                        <div style={{ flex: 1, marginTop: '6px', marginBottom: '4px' }}> {/* First div */}
                          <WtrRsSelect
                            displayFormat={"1"}
                            Label=""
                            fldName="othrinfoid"
                            idText="txtothrinfoid"
                            onChange={onChangeDts}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            fnctCall={false}
                            dbCon={"nodb"}
                            typr={""}
                            dllName={""}
                            fnctName={""}
                            parms={""}
                            allwSrch={false}
                            speaker={""}
                            loadOnDemand={sterilizationOptn}
                            delayClose={1000}
                            allwZero={"1"}
                            disable={!hideInCbwtf || allFieldDisabled}
                            placement="right"
                          ></WtrRsSelect>
                        </div>
                        {showDocFilePath.length > 0 ?
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                              src={PdfIcon}
                              alt="PDF Icon"
                              style={{ width: '24px', height: '24px', marginRight: '8px' }}
                            />
                            <a
                              href="#"
                              onClick={() => handleShowPdfClick(showDocFilePath)}
                              style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                              {showDocFilePath}
                            </a>
                          </div> : <div style={{ flex: 1, marginLeft: '20px' }}> {/* Second div */}

                            {showupldPdf && (
                              <div style={{ marginTop: '6px', marginBottom: '4px' }}>
                                {hideInCbwtf && (<label style={{ display: 'inline-block', padding: '9px 47px', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder', }}>Choose File
                                  <input type="file" name='docfiles' onChange={handlePdfFileChange} multiple disabled={fileData.length >= 4} style={{ display: 'none' }} />
                                </label>)}
                                {pdfError && <p style={{ color: 'red' }}>{pdfError}</p>}
                                <div>
                                  {fileData.map((file, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                      <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {/* Adjust width, height, and margin as needed */}
                                      <span className="mr-2">{file.flnm}</span>
                                      {showDeletePdf &&
                                        <img className='deleImage' src={DeleteIcon} alt="Delete-Icon" onClick={() => handleDeleteFile(index)} />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>}

                      </div>
                    </td>

                  </tr>


                </tbody>
              </table >
              {hideInCbwtf ? <>
                <div className="flex justify-center py-7">
                  <div className="mr-4">
                    <Button
                      size="medium"
                      style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
                      variant="contained"
                      color="success"
                      disabled={!state.disableA}
                      startIcon={<SaveIcon />}
                      onClick={SaveClick}
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
              </> : <>
              </>}



            </div>
          </div>


        </div>
      </div>
    </>
  );
};

export default React.memo(CbwtfAnnulRpt);

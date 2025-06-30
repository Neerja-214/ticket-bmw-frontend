import React, { useEffect, useReducer, useState } from "react";
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

} from "../../utilities/utilities";

import { useQuery } from "@tanstack/react-query";
import { useEffectOnce } from "react-use";
import { nrjAxiosRequestBio, nrjAxiosRequestLinux, useNrjAxios } from "../../Hooks/useNrjAxios";
import WtrInput from "../../components/reusable/nw/WtrInput";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import SaveIcon from "@mui/icons-material/Save";
import { validForm } from "../../Hooks/validForm";
import { Toaster } from "../../components/reusable/Toaster";

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

const CbwtfMonthlyRpt = () => {
  const initialValues: Values = { cpcbof: "", cntp: "" };

  let pnc: string = "";
  const [state, dispatch] = useReducer(reducer, initialState);
  const [cityList, setCityList] = useState("");
  const [selsttid, setSelSttid] = useState(-1);
  const [fltr, setFltr] = useState("")
  const [notFoundCbwtfFltr, setNotFoundCbwtfFltr] = useState<boolean>(false)
  const [sttValue, setSttValue] = useState<string>("");
  const [cbwtfValue, setCbwtfValue] = useState<string>("");
  const [rgdValue, setRgdValue] = useState<string>("");


  const hideInCbwtf = getLvl() == 'CPCB' ? false : true;

  const reqFlds = [
    // { fld: 'dt_month', msg: 'select Month', chck: '1[length]' },
    { fld: 'authnm', msg: 'Enter Name of Authorized Person', chck: '1[length]' },
    { fld: 'cbwtfnm', msg: 'Enter Name of CBWTF', chck: '1[length]' },
    { fld: 'addc', chck: '1[length]', msg: 'Address for Correspondence ' },
    { fld: 'addf', chck: '1[length]', msg: 'Address of Facility' },
    { fld: 'eml', chck: '[email]', msg: 'Enter E-mail ID ' },
    { fld: 'telno', chck: '[mob]', msg: 'Enter Valid Telephone Number' },


    { fld: 'stsauth', chck: '1[length]', msg: 'Enter valid  Authorisation No. ' },
    { fld: 'authdt_exp', chck: '1[length]', msg: 'Enter valid expiry Date for Status of Authorisation under the Bio-Medical Waste . ' },
    { fld: 'dt_exp', chck: '1[length]', msg: 'Enter valid expiry Date for Status of Consents under Water Act and AirAct  ' },
    { fld: 'nohcf', chck: '1[length]', msg: 'Enter Number healthcare facilities covered by CBWTF' },
    { fld: 'nobeds', chck: '1[length]', msg: 'Enter No of beds covered by CBWTF' },
    { fld: 'capcbwtf', chck: '1[length]', msg: 'Enter Installed treatment and disposal capacity of CBWTF (Kg/day) ' },
    { fld: 'qntybio', chck: '1[length]', msg: 'Enter Quantity of biomedical waste treated or disposed by CBWTF (Kg/day)' },
    { fld: 'ylwqnt', chck: '1[length]', msg: 'Enter Yellow Category' },
    { fld: 'redqnt', chck: '1[length]', msg: 'Enter Red Category' },
    { fld: 'whtqnt', chck: '1[length]', msg: 'Enter White Category' },
    { fld: 'blqnt', chck: '1[length]', msg: 'Enter Blue Category' },
    // { fld: 'slqnt', chck: '1[length]', msg: 'Enter General Solid Category' },

  ];


  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  };

  const [month, setMonth] = useState("");


  //#############Function calls
  const onChangeDts = (data: string) => {
    let fld: any = utilities(2, data, "");
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    if (fld == 'dt_month') {
      setMonth(getFldValue(data, 'dt_month'))
      let selectMonth = (getFldValue(data, 'dt_month'))
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_month][${selectMonth}=dt_month][${selectMonth}` })
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
    formData['ar_year'] = formData['dt_month'] ? formData['dt_month'] : '0';
    formData['what'] = 'cbwtf_mr';
    formData['dt_exp'] = formData['dt_exp'] ? formData['dt_exp'] : '0';
    formData['authdt_exp'] = formData['authdt_exp'] ? formData['dt_exp'] : '0';
    formData['dt_month'] = formData['dt_month'] ? formData['dt_month'] : '0';
    formData['ar_status'] = 'final_mr'

    formData['authnm'] = formData['authnm'] ? formData['authnm'] : 'NA';
    formData['cbwtfnm'] = formData['cbwtfnm'] ? formData['cbwtfnm'] : 'NA';
    formData['addc'] = formData['addc'] ? formData['addc'] : 'NA';
    formData['telno'] = formData['telno'] ? formData['telno'] : '0';
    formData['fxno'] = formData['fxno'] ? formData['fxno'] : '0';
    formData['eml'] = formData['eml'] ? formData['eml'] : 'NA';
    formData['urlweb'] = formData['urlweb'] ? formData['urlweb'] : 'NA';
    formData['gpscordlat'] = formData['gpscordlat'] ? formData['gpscordlat'] : 'NA';
    formData['gpscordlong'] = formData['gpscordlong'] ? formData['gpscordlong'] : 'NA';

    formData['ownhcf'] = formData['ownhcf'] ? formData['ownhcf'] : '0';

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

    formData['prov'] = formData['prov'] ? formData['prov'] : 'NA';
    formData['pla'] = formData['pla'] ? formData['pla'] : '0';
    formData['placap'] = formData['placap'] ? formData['placap'] : '0';
    formData['plaanm'] = formData['plaanm'] ? formData['plaanm'] : '0';
    formData['autocl'] = formData['autocl'] ? formData['autocl'] : '0';
    formData['autoclcap'] = formData['autoclcap'] ? formData['autoclcap'] : '0';
    formData['autoclanm'] = formData['autoclanm'] ? formData['autoclanm'] : '0';
    formData['micro'] = formData['micro'] ? formData['micro'] : '0';
    formData['microcap'] = formData['microcap'] ? formData['microcap'] : '0';
    formData['microanm'] = formData['microanm'] ? formData['microanm'] : '0';

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
    formData['ash'] = formData['ash'] ? formData['ash'] : '0';
    formData['ashdispo'] = formData['ashdispo'] ? formData['ashdispo'] : '0';
    formData['etpsl'] = formData['etpsl'] ? formData['etpsl'] : '0';
    formData['etpsldispo'] = formData['etpsldispo'] ? formData['etpsldispo'] : '0';
    formData['nmbio'] = formData['nmbio'] ? formData['nmbio'] : 'NA';
    formData['lsthcf'] = formData['lsthcf'] ? formData['lsthcf'] : 'NA';
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

    formData['stdair'] = formData['stdair'] ? formData['stdair'] : 'NA';
    formData['onlemi'] = formData['onlemi'] ? formData['onlemi'] : 'NA';
    formData['liqwst'] = formData['liqwst'] ? formData['liqwst'] : 'NA';
    formData['disimth'] = formData['disimth'] ? formData['disimth'] : 'NA';
    formData['othrinfo'] = formData['othrinfo'] ? formData['othrinfo'] : 'NA';
    formData['capcbwtf'] = formData['capcbwtf'] ? formData['capcbwtf'] : 'NA';
    // let payload: any = postLinux(formData, 'AR_filing');
    return nrjAxiosRequestBio("AR_filing", formData);

  };
  const [showMessage, setShowMessage] = useState<any>([])
  const { showToaster, hideToaster } = useToaster();

  const SaveClick = () => {
    
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
  
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
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
    }
    else {
      showToaster(['Something went wrong! please try again'], 'error')
    }
  };
  const { data, refetch } = useQuery({
    queryKey: ["svQry", state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });

  useEffectOnce(() => {
    
    refetchB()
  })
  const GetData = () => {
    let cmpid = getCmpId() || "";
    let usrnm = getUsrnm() || "";
    let ar_year = month;
    let what = 'cbwtf_mr';
    let who = '';
    let lvl = 'CBWTF';
    if (cbwtfValue) {
      who = cbwtfValue;
      lvl = 'CBWTF';
    } else if (sttValue) {
      who = sttValue;
      lvl = 'STT'
    } else if (rgdValue) {
      who = rgdValue;
      lvl = 'RGD'
    }

    // let lvl: string = sttValue ? sttValue : rgdValue;
    
    if (!hideInCbwtf) {
      let usrnm = getUsrnm();
      let cmpid = getCmpId();
      let payload: any = postLinux(lvl + '=' + who + "=" + month + "=" + what + "=" + usrnm + '=' + cmpid, 'show_AR_filing')
      return nrjAxiosRequestLinux("show_AR_filing", payload);
    } else if (ar_year) {
      let payload: any = postLinux(ar_year + '=' + usrnm + '=' + cmpid + '=' + what + '=' + 'CBWTF' + '=' + who, 'get_AR_filing');
      return nrjAxiosRequestBio("get_AR_filing", payload);
    }

  };

  const ShowData = (data: any) => {
    // if (data.data.status === 'Failed') {
    //   showToaster([data.data.message], 'error');
    // } else {
    // if (Array.isArray(data.data)) {

    if (data.data.status === 'Failed') {
      clrFunct()
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_month][${month}=dt_month][${month}` })

    } else {
      let textDts = convertFldValuesToString(data.data);
      textDts += '=' + `dt_month][${month}=dt_month][${month}`
      setFormData(textDts)
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: textDts });
    }
    if (!hideInCbwtf && (rgdValue || sttValue || cbwtfValue)) {
      showToaster([data.data.message], 'error')
    }
  }

  const { data: datab, refetch: refetchB } = useQuery({
    queryKey: ["getQryCbwtf", month, sttValue, cbwtfValue],
    queryFn: GetData,
    enabled: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  const clrFunct = () => {
    // dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    // setTimeout(() => {
    //   // console.log(state.frmData);
    //   // console.log(state.textDts);
    //   dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    // }, 1000)

    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    }, 300)
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


  const [isDropdownOpen, setIsDropdownOpen] = useState<any>();


  function handleScroll() {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  }

  return (
    <>
      <div className={`${hideInCbwtf ? 'overflow-y-auto h-screen bg-white' : 'bg-white'}`} onScroll={handleScroll}>
        {hideInCbwtf ? <CbwtfHeader></CbwtfHeader> : <></>}
        {/*  */}
        <div className='px-3 pb-10 '>
          <div className="mx-7">
            <h6 className="text-[14px] mt-2" style={{ color: 'rgb(2 1 15 / 50%)' }}>To be submitted to the prescribed authority on or before 30th
              june every year for the period from January
              to December of the preceding year, by the occupier of  common bio-medical
              waste treatment facility (CBWTF)</h6>
            <div className="rounded" >

              <div className="mx-7 pt-5">
                <div className="mb-4 pb-4 mx-3">
                  {/* <Seperator heading="Select From Dropdown"></Seperator> */}
                  <div className=" mt-4 grid grid-cols-4 gap-x-8 gap-y-4">
                    {/* <WtrRsSelect
                      Label="Select year"
                      speaker="Select year"
                      fldName="dt_yearid"
                      idText="txtdt_yearid"
                      displayFormat={"1"}
                      onChange={onChangeDts}
                      selectedValue={state.frmData}
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
                    // isOpen={isDropdownOpen}
                    // handleDropdownOpen={handleDropdownOpen}
                    //  handleDropdownClose={handleDropdownClose}
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
                    {hideInCbwtf ? <>

                    </> :
                      <>

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
                          delayClose={0}
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
                          delayClose={0}
                          placement="bottom"
                          displayFormat="1"
                        ></WtrRsSelect>

                        <WtrRsSelect
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
                          menuStyle={{ maxWidth: '400px', minWidth: '200px' }}
                        ></WtrRsSelect>

                      </>

                    }

                  </div>
                </div>
                <table className="table table-bordered min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="py-3 bg-gray-100">
                      <th className="border py-3" scope="col">S. No.</th>
                      <th className="border" scope="col">Particulars</th>
                      <th className="border" scope="col">Details</th>
                    </tr>
                    <tr className="py-1">
                      <th className="border py-1" scope="col">1.</th>
                      <th className="border text-left px-3" scope="col">Particulars of Occupier</th>
                      <th className="border" scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-3">1.1</td>
                      <td className="border px-3"> Name of Authorized Person <span className="text-red-600">*</span></td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="authnm"
                          idText="txtauthnm"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Name of Authorized Person"
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">1.2</td>
                      <td className="border px-3"> Name  of CBWTF<span className="text-red-600">*</span></td>
                      <td className="border px-3"><WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="cbwtfnm"
                        idText="txtcbwtfnm"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf}
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
                      <td className="border px-3">1.3</td>
                      <td className="border px-3"> Address for Correspondence<span className="text-red-600">*</span></td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="addc"
                          idText="txtaddc"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          unblockSpecialChars={true}
                          placeholder="Address for Correspondence"
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">1.4</td>
                      <td className="border px-3"> Address of Facility<span className="text-red-600">*</span></td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="addf"
                          idText="txtaddf"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
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
                          placeholder="Address of Facility"
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">1.5</td>
                      <td className="border px-3">Tel. No<span className="text-red-600">*</span></td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="telno"
                          idText="txttelno"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          minValue={-1}
                          validateFn="[mob]"
                          allowNumber={true}
                          ToolTip="Enter numbers only"
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placeholder="Tel. No"
                        // speaker={"Enter No of Beds"}
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">1.6</td>
                      <td className="border px-3">Fax. No</td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="fxno"
                          idText="txtfxno"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          minValue={-1}
                          validateFn="1[length]"
                          allowNumber={true}
                          ToolTip="Enter numbers only"
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placeholder="Fax. No"
                        // speaker={"Enter No of Beds"}
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">1.7</td>
                      <td className="border px-3">E-mail ID<span className="text-red-600">*</span></td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=" "
                          fldName="eml"
                          idText="txteml"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          minValue={-1}
                          validateFn="[email]"
                          unblockSpecialChars={true}
                          allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placeholder="E-mail ID"
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">1.8</td>
                      <td className="border px-3"> URL of Website<span className=""></span> </td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="urlweb"
                          idText="txturlweb"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          minValue={-1}
                          validateFn="1[length]"
                          unblockSpecialChars={true}
                          allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placeholder="URL of Website"
                        ></WtrInput></td>
                    </tr>

                    <tr>
                      <td className="border px-3">1.9</td>
                      <td className="border px-3"> GPS coordinates of CBWTF (latitude)<span className="text-red-600">*</span> </td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="gpscordlat"
                          idText="txtgpscordlat"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          minValue={-1}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          allowDecimal={true}
                          placeholder="GPS coordinates of CBWTF "
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">1.10</td>
                      <td className="border px-3"> GPS coordinates of CBWTF (longitude)<span className="text-red-600">*</span> </td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="gpscordlong"
                          idText="txtgpscordlong"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          minValue={-1}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placeholder="GPS coordinates of CBWTF "
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">1.11</td>
                      <td className="border px-3">Ownership of CBWTF<span className="text-red-600">*</span> </td>
                      <td className="border px-3 py-2">
                        <WtrRsSelect
                          displayFormat="1"
                          Label=""
                          fldName="ownhcf"
                          idText="txtownhcf"
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
                          disable={!hideInCbwtf}
                        ></WtrRsSelect>
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-3">1.12</td>
                      <td className="border px-3">Status of Authorisation under the Bio-Medical Waste (management and Handling) Rules <span className="text-red-600">*</span> </td>
                      <td className="border px-3 py-2">
                        <WtrInput
                          displayFormat="1"
                          Label="Authorisation No."
                          fldName="stsauth"
                          idText="txtstsauth"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
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
                        <NrjRsDt
                          format="dd-MMM-yyyy"
                          fldName="authdt_exp"
                          displayFormat="1"
                          idText="txtauthdt_exp"
                          size="lg"
                          Label="Valid up to"
                          selectedValue={state.frmData}
                          onChange={onChangeDts}

                        ></NrjRsDt>
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-3">1.13</td>
                      <td className="border px-3">Status of Consents under Water Act and Air Act <span className="text-red-600">*</span> </td>
                      <td className="border px-3 py-2">
                        <NrjRsDt
                          format="dd-MMM-yyyy"
                          fldName="dt_exp"
                          displayFormat="1"
                          idText="txtdt_exp"
                          size="lg"
                          Label="Valid up to"
                          selectedValue={state.frmData}
                          onChange={onChangeDts}
                        ></NrjRsDt></td>
                    </tr>


                    {/* ***************** Details of CBWTF************ */}

                    <tr className="bg-gray-50">
                      <th className="border px-3  py-1">2</th>
                      <th className="border px-3  text-left">Details of CBWTF</th>
                      <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                      <td className="border px-3">2.1</td>
                      <td className="border px-3">Number healthcare facilities covered by CBWTF <span className="text-red-600">*</span></td>
                      <td className="border px-3"><WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="nohcf"
                        idText="txtnohcf"
                        onChange={onChangeDts}
                        dsabld={!hideInCbwtf}
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
                      <td className="border px-3">No of beds covered by CBWTF <span className="text-red-600">*</span></td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="nobeds"
                          idText="txtnobeds"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="No of beds covered by CBWTF"
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
                          dsabld={!hideInCbwtf}
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
                          dsabld={!hideInCbwtf}
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
                          allowDecimal={true}
                          noofDecimals={3}
                        // speaker={"Enter No of Beds"}
                        ></WtrInput></td>
                    </tr>



                    {/* ***************** Quantity of waste generated or disposed in Kg per
annum (on monthly average basis) ************ */}

                    <tr className="bg-gray-50">
                      <th className="border px-3  py-1">3</th>
                      <th className="border px-3  text-left">Quantity of waste generated or disposed in Kg/annum (on monthly average basis) </th>
                      <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                      <td className="border px-3">3.1</td>
                      <td className="border px-3">Yellow Category  <span className="text-red-600">*</span></td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="ylwqnt"
                          idText="txtylwqnt"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Yellow Category"
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">3.2</td>
                      <td className="border px-3">Red Category <span className="text-red-600">*</span></td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="redqnt"
                          idText="txtredqnt"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Red Category"
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput>
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-3">3.3</td>
                      <td className="border px-3"> White Category<span className="text-red-600">*</span></td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="whtqnt"
                          idText="txtwhtqnt"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="White Category"
                          allowDecimal={true}
                          noofDecimals={3}
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">3.4</td>
                      <td className="border px-3">Blue Category<span className="text-red-600">*</span></td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="blqnt"
                          idText="txtblqnt"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Blue Category"
                          allowDecimal={true}
                          noofDecimals={3}
                        // speaker={"Enter No of Beds"}
                        ></WtrInput></td>

                    </tr>
                    <tr>
                      <td className="border px-3">3.5</td>
                      <td className="border px-3">General Solid waste</td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="slqnt"
                          idText="txtslqnt"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
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
                        // speaker={"Enter No of Beds"}
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
                            dsabld={!hideInCbwtf}
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
                            Label="Capacity (kg)"
                            fldName="cap"
                            idText="txtcap"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf}
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
                            Label="Provision of on-site storage : (cold storage or
                        any other provision)"
                            fldName="prov"
                            idText="txtprov"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                          ></WtrInput>
                        </tr>
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-3">4.2</td>
                      <td className="border px-3">Disposal facilities</td>
                      <td className="border px-3"> </td>
                    </tr>
                    <tr>
                      <td className="border px-3">(i)</td>
                      <td className="border px-3">Type of treatment equipment</td>
                      <td>
                        <tr>
                          <td className="px-3 w-3/12">No of units </td>
                          <td className="px-3 w-3/12"> Capacity Kg/day</td>
                          <td className="px-3 w-3/12">Quantity treated or disposed in Kg/annum</td>
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
                              dsabld={!hideInCbwtf}
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
                            dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                            dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                            dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                              idText="txtmicro"
                              onChange={onChangeDts}
                              dsabld={!hideInCbwtf}
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
                            idText="txtmicrocap"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf}
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
                              idText="txtmicroanm"
                              onChange={onChangeDts}
                              dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                            dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                            dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                            dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                      <td className="border px-3">Chemical disinfection:</td>
                      <td className="px-3">
                        <tr className="px-3">
                          <td className="px-3 w-3/12">
                            <WtrInput
                              displayFormat="1"
                              Label=""
                              fldName="chem"
                              idText="txtchem"
                              onChange={onChangeDts}
                              dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                      <td className="border px-3">Any other treatment equipment:</td>
                      <td className="px-3">
                        <tr className="px-3">
                          <td className="px-3 w-3/12">
                            <WtrInput
                              displayFormat="1"
                              Label=""
                              fldName="anyothr"
                              idText="txtanyothr"
                              onChange={onChangeDts}
                              dsabld={!hideInCbwtf}
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
                            dsabld={!hideInCbwtf}
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
                              dsabld={!hideInCbwtf}
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
                          Label="Recyclable Category (like plastic, glass etc.)"
                          fldName="recycle"
                          idText="txtrecycle"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder='Recyclable Category (like plastic, glass etc.)'
                          allowDecimal={true}
                          noofDecimals={3}
                        // speaker={"Enter No of Beds"}
                        ></WtrInput></td>

                    </tr>

                    <tr>
                      <td className="border px-3">4.4</td>
                      <td className="border px-3"> No of vehicles used for collection
                        and transportation of biomedical
                        waste</td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="noveh"
                          idText="txtnoveh"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder=" No of vehicles used for collection
                  and transportation of biomedical
                  waste"
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">4.5</td>
                      <td className="border px-3">Details of incineration ash and
                        ETP sludge generated and disposed
                        during the treatment of wastes in Kg
                        per annum</td>
                      <td className="border px-3">
                        <tr>
                          <td className="px-3"></td>
                          <td className="px-3">Quantity generated</td>
                          <td className="px-3">Where disposed</td>
                        </tr>
                        <tr>
                          <td className="px-3">Incineration</td>
                          <td className="px-3"><WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="incire"
                            idText="txtincire"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf}
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
                            dsabld={!hideInCbwtf}
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
                        <tr>
                          <td className="px-3">Ash</td>
                          <td className="px-3"><WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="ash"
                            idText="txtash"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf}
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
                            dsabld={!hideInCbwtf}
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
                        </tr><tr>
                          <td className="px-3">ETP Sludge</td>
                          <td className="px-3"><WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="etpsl"
                            idText="txtetpsl"
                            onChange={onChangeDts}
                            dsabld={!hideInCbwtf}
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
                            dsabld={!hideInCbwtf}
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
                    <tr>
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
                          dsabld={!hideInCbwtf}
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
                    </tr>
                    <tr>
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
                          dsabld={!hideInCbwtf}
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
                        // speaker={"Enter No of Beds"}
                        ></WtrInput></td>
                    </tr>

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
                        dsabld={!hideInCbwtf}
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
                      speaker={"Enter No of Beds"}
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
                          dsabld={!hideInCbwtf}
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
                          dsabld={!hideInCbwtf}
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
                          dsabld={!hideInCbwtf}
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
                          dsabld={!hideInCbwtf}
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
                        // speaker={"Enter No of Beds"}
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
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Whether standard manual for
                  training is available?"
                        // speaker={"Enter No of Beds"}
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
                          dsabld={!hideInCbwtf}
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
                        // speaker={"Enter No of Beds"}
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
                      <td className="border px-3">Number of Accidents occurred</td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="accd"
                          idText="txtaccd"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Number of Accidents occurred."
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
                          dsabld={!hideInCbwtf}
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
                      <td className="border px-3">Remedial Action taken</td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="remedial"
                          idText="txtremedial"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Remedial Action taken"
                        ></WtrInput></td>
                    </tr>
                    <tr>
                      <td className="border px-3">6.4</td>
                      <td className="border px-3"> Any Fatality occurred, Details </td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="ftlity"
                          idText="txtftlity"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder=" Any Fatality occurred, Details"
                        // speaker={"Enter No of Beds"}
                        ></WtrInput></td>

                    </tr>
                    {/* *********************************************************************** */}

                    <tr>
                      <td className="border px-3">7.1</td>
                      <td className="border px-3">Are you meeting the standards of air
                        Pollution from the incinerator? How
                        many times in last year could not met
                        the standards?
                      </td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="stdair"
                          idText="txtstdair"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          // allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Are you meeting the standards of air
                  Pollution from the incinerator? How
                  many times in last year could not met
                  the standards?"
                          // speaker={"Enter No of Beds"}
                          unblockSpecialChars={true}
                        ></WtrInput></td>

                    </tr>


                    <tr>
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
                          dsabld={!hideInCbwtf}
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
                        // speaker={"Enter No of Beds"}
                        ></WtrInput></td>

                    </tr>

                    <tr>
                      <td className="border px-3">8</td>
                      <td className="border px-3">Liquid waste generated and treatment
                        methods in place. How many times
                        you have not met the standards in a
                        year?
                      </td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="liqwst"
                          idText="txtliqwst"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          // allowNumber={false}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                          placeholder="Liquid waste generated and treatment
                  methods in place. How many times
                  you have not met the standards in a
                  year?"
                          // speaker={"Enter No of Beds"}
                          unblockSpecialChars={true}
                        ></WtrInput></td>

                    </tr>

                    <tr>
                      <td className="border px-3">9</td>
                      <td className="border px-3">Is the disinfection method or
                        sterilization meeting the log 4
                        standards? How many times you have
                        not met the standards in a year?
                      </td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="disimth"
                          idText="txtdisimth"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
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
                  standards? How many times you have
                  not met the standards in a year?"
                          // speaker={"Enter No of Beds"}
                          unblockSpecialChars={true}
                        ></WtrInput></td>

                    </tr>


                    <tr>
                      <td className="border px-3">10</td>
                      <td className="border px-3">Any other relevant information
                      </td>
                      <td className="border px-3">
                        <WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="othrinfo"
                          idText="txtothrinfo"
                          onChange={onChangeDts}
                          dsabld={!hideInCbwtf}
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

                        // speaker={"Enter No of Beds"}
                        ></WtrInput></td>

                    </tr>


                  </tbody>
                </table >
                {hideInCbwtf ? <>
                  <div className="flex justify-center py-7">
                    <div className="mr-4">
                      <Button
                        size="medium"
                        style={{ backgroundColor: "#3B71CA" }}
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
                </> : <>
                </>}



              </div>
            </div>


          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(CbwtfMonthlyRpt);

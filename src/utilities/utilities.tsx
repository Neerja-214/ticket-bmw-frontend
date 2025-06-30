import { stringify } from "querystring";
import { OrganizeImportsMode } from "typescript";
import { decode as base64_decode, encode as base64_encode } from 'base-64';
import { useSelector } from "react-redux/es/hooks/useSelector";
import { UseMomentDateNmb } from "../Hooks/useMomentDtArry";
import { nrjAxiosRequest } from "../Hooks/useNrjAxios";

export const getCmpId = () => {
  let cmpid: string = sessionStorage.getItem("cmpid") || "";
  if (!cmpid) {
    return ""
  }
  //return base64_decode(cmpid);
  return cmpid;
}

export const GetCmpIdFormState = () => {
  const cmpId = useSelector((state: any) => state.login.cmpId);
  return cmpId;
}

export const setCmpId = (data: string) => {

  data = data ? data : "";
  if (data) {
    //sessionStorage.setItem("cmpid", base64_encode(data));
    sessionStorage.setItem("cmpid", data);
  }
}

export const getUsrId = () => {
  let cmpid: string = sessionStorage.getItem("usrid") || "";
  if (!cmpid) {
    return ""
  }
  return cmpid;
}

export const setUsrId = (data: string) => {
  data = data ? data : "";
  if (data) {
    sessionStorage.setItem("usrid", data);
  }

}

export const getDataFromSession = (name: string) => {
  let cmpid: string = sessionStorage.getItem(name) || "";
  return base64_decode(cmpid);
}

export const setDataInSession = (data: string, name: string) => {
  data = data ? data : "";
  sessionStorage.setItem(name, base64_encode(data));
}

export const formateWeightToThreeDcml = (ary: any[]) => {
  ary = ary.map((res: any) => {
    return { ...res, bluwt: Number(res.bluwt).toFixed(3), redwt: Number(res.redwt).toFixed(3), ylwwt: Number(res.ylwwt).toFixed(3), whtwt: Number(res.whtwt).toFixed(3), cytwt: Number(res.cytwt).toFixed(3) };
  })
  return ary;
}


const utilities = (Fnct: number | string, parmA: string, parmB: string) => {
  if (Fnct === 1) {
    return ChkExstData(parmA, parmB);
  } else if (Fnct === 2) {
    return GetFldName(parmA);
  } else if (Fnct === 3) {
    return Eguid();
  } else if (Fnct === 4 || Fnct === "GridSource") {
    return GridSrc(parmA);
  } else if (Fnct === 5 || Fnct === "GridCols") {
    return GridCols(parmA);
  } else if (Fnct === 7 || Fnct === "GetAPI") {
    return createGetApi(parmA, parmB);
  } else if (Fnct === 8 || Fnct === "CheckLogin") {
    return chkLgn(parmA);
  }
};

const ChkExstData = (curData: string, fldName: string) => {
  if (curData.indexOf(fldName + "][") > -1) {
    let fldar: string[] = curData.split("=");
    let bln: boolean = false;
    if (fldName.substring(fldName.length - 2) === "id") {
      bln = true;
    }
    for (let i = 0, j = fldar.length; i < j; i++) {
      if (
        fldar[i].indexOf(fldName + "][") == 0 ||
        fldar[i].indexOf("=" + fldName + "][") == 0
      ) {
        fldar[i] = "";
      }
      if (bln) {
        if (
          fldar[i].indexOf(fldName.substring(0, fldName.length - 2) + "][") ===
          0
        ) {
          fldar[i] = "";
        }
      }
    }
    let strFnl: string = "";
    for (let i = 0, j = fldar.length; i < j; i++) {
      if (fldar[i]) {
        if (strFnl.length > 0) {
          strFnl += "=";
        }
        strFnl += fldar[i];
      }
    }
    if (strFnl) {
      strFnl += "=";
    }

    return strFnl;
  }
  return curData;
};

export const GetFldName = (data: string) => {
  let strStr: string = data;
  let fldar: string[] = strStr.split("][");
  return fldar[0];
}

function Eguid() {
  let u: string = "",
    m = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
    i = 0,
    rb = (Math.random() * 0xffffffff) | 0;
  while (i++ < 36) {
    var c = m[i - 1],
      r = rb & 0xf,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    u += c === "-" || c === "4" ? c : v.toString(16);
    rb = i % 8 === 0 ? (Math.random() * 0xffffffff) | 0 : rb >> 4;
  }
  u = u.replaceAll("-", "");
  return u;
}

function GridSrc(GridFor: string) {
  if (GridFor === "PageLink") {
    return {
      datafields: [
        { name: "ProductName", type: "string" },
        { name: "QuantityPerUnit", type: "int" },
        { name: "UnitPrice", type: "float" },
        { name: "UnitsInStock", type: "float" },
        { name: "Discontinued", type: "bool" },
      ],
      datatype: "xml",
      id: "ProductID",
      record: "Product",
      root: "Products",
      url: "./../sampledata/products.xml",
    };
  }
}

function GridCols(GridFor: string) {
  if (GridFor === "PageLink") {
    const cellsrenderer = (
      row: number,
      columnfield: string,
      value: string | number,
      defaulthtml: string,
      columnproperties: any,
      rowdata: any
    ): string => {
      return "";
    };
    return [
      {
        text: "Product Name",
        columngroup: "ProductDetails",
        datafield: "ProductName",
        width: 250,
      },
      {
        text: "Quantity per Unit",
        columngroup: "ProductDetails",
        datafield: "QuantityPerUnit",
        cellsalign: "right",
        align: "right",
      },
      {
        text: "Unit Price",
        columngroup: "ProductDetails",
        datafield: "UnitPrice",
        align: "right",
        cellsalign: "right",
        cellsformat: "c2",
      },
      {
        text: "Units In Stock",
        datafield: "UnitsInStock",
        cellsalign: "right",
        cellsrenderer,
        width: 100,
      },
      {
        text: "Discontinued",
        columntype: "checkbox",
        datafield: "Discontinued",
        align: "center",
      },
    ];
  }
}

const sendRequest = async (params: string) => {
  const response = await fetch(params, {
    method: "GET",
  }).then();

  if (response.ok) {
    const body = await response.json();
    if (body) {
      if (body[0]) {
        if (body[0]["Data"]) {
          return body[0]["Data"];
        }
      }
    }
  }
};

function splt_getAtPos(fld: string, sep: string, ps: number) {
  let ech: string[] = fld.split(sep);
  if (ech && ech.length < ps) {
    return "";
  } else {
    if (ech && ech[ps]) {
      return ech[ps];
    } else {
      return "";
    }
  }
  return "";
}

const apiConfig: any = {
  "login": ["usrnm", "psw", "lgnlvl", "captcha", "uid"],
  "logout": ["usrnm", "cmpid"],
  "hcfCtgCnt": ["lvl", "who", "gid"],
  "dashboard": ["lvl", "who", "frmdt", "todt", "gid"],
  "cbwtfLst": ["lvl", "who", "val", "dtno", "gid"],
  "gridDisplay": ["lvl", "who", "val", "dtno", "gid"],
  "gridDisplaySearch": ["cbwtfid", "srch", "hcfnm"],
  "wstdata": ["lvl", "who", "dtno", "frmdt", "todt", "dtwise", "gid"],
  "hcfcount": ["lvl", "who", "gid"],
  "cbwtfdlyrep": ["lvl", "who", "dtno", "frmdt", "todt", "dtwise", "gid"],
  "hcfctgcnt": ["lvl", "who", "gid"],
  "bagcntprhr": ["lvl", "who", "dtno", "frmdt", "todt", "dtwise", "gid"],
  "getbigbags": ['lvl', 'who', 'dtno', 'frmdt', 'todt', 'dtwise', 'gid', "type"],
  // "serialnumber": ["lvl", "who", "dtno","frmdt","todt","dtwise", "gid"],
  "wastebagid": ["lvl", "who", "wstbgid"],
  "nonvisited": ['lvl', 'who', 'dtno', 'frmdt', 'todt', 'dtwise'],
  "findhcfmob": ["lvl", "who", "srch", "mob"],
  "misgeo": ['lvl', 'who', 'dtno', 'frmdt', 'todt', 'dtwise', 'gid'],
  "wastebagcrtincrt": ['lvl', 'who', 'todt', 'frmdt', 'dtwise', 'all_cbwtf'],
  "srchctyhcf": ["cty", "hcfnm", "val"],
  "cbwtftdy_datacount": ["lvl", "who", "dtno", "gid"],
  "show_GeoCtg_period": ["lvl", "who", "frmdt", "todt", "gid"],
  "show_wstbg_lvlby": ["lvl", "who", "dtno", "val", "scby", "gid"],
  "dashboadCbwtf": ["lvl", "lgntyp", "who", "frmdt", "todt"],
  "show_CitysAndHCFcntList": ["lvl", "ctg", "who", "val"],
  "mislabel": ["lvl", "who", "dtno", "frmdt", "todt", "dtwise", "gid"],
  "wronghcfcode": ["lvl", "who", "wrngCountOf", "dt"],
  "cbwtflistDrp": ["lvl", "who", "cbwtfnm"],
  "sttlistdrp": ["usrnm", "rgd"],
  "sttlistdrp2": ["usrnm"],
  "cbwtfSttRgdInfo": ["cbwtfid"],
  "hcf_signup": ["usrnm"],
  "hcf_indpnt_hcf": ["mob", "eml", "usrnm"],
  "create_independent_HCF": ["cmpid", "hcfcod", "usrnm", "hcfid", "hcfnm", "hcftyp", "addra", "addrb", "addrc", "cty", "pnc", "stt", "cntprsn", "phn", "mob", "eml", "nobd", "ltt", "lgt", "consent_no", "consent_file"],
  "hcf_signup_otp": ["mobotp", "emlotp", "usrnm", "signup_token"],
  "hcf_setpsw": ["psw", "usrnm", "signup_otpverified_token"],
  "hcf_login": ["usrnm", "psw", "captcha", "uid", "lgnlvl"],
  "cbwtf_signup": ["usrnm"],
  "cbwtf_signup_otp": ["mobotp", "emlotp", "usrnm", "signup_token"],
  "cbwtf_setpsw": ["usrnm", "psw", "signup_otpverified_token"],
  "cbwtf_login": ["usrnm", "psw", "captcha", "uid", "lgnlvl"],
  "hcf_report": ["reptyp", "usrnm", "dt_wst", "redwt", "ylwwt", "whtwt", "bluwt", "cytwt", "toatlwt", "redcnt", "ylwcnt", "whtcnt", "blucnt", "cytcnt", "totalcnt"],
  "show_monthly_rep": ["usrnm", "fyyear"],
  "show_daily_rep": ["usrnm", "dt_wst"],
  "display_cbwtf_data": ["lvl", "who", "dtno"],
  "getcity": ["lvl", "who", "cty"],
  "getCmnRs": ["datafr", "del", "fltr", "cmpid", "usrid"],
  // "saverecord":['what' , 'id' ,'usrname' , 'usr' , 'cmpid' , 'usrid'],
  "serialnumber": ["lvl", "who", "dtno", "frmdt", "todt", "dtwise", "gid"],
  "listwstdata2": ["lvl", "lgntyp", "who", 'frmdt', 'todt', 'dtwise', 'shrtby'],
  "getHcfVisited": ["dtno", "lvl", "who",],
  "show_CorrectBagsmry": ['lvl', 'who', 'dtno', 'frmdt', 'todt', 'dtwise', "gid"],
  "getCaptcha": ["uid"],
  "saverecord": ["what", "usernm", "oldpsw", "nwpsw"],
  "get_cpcb_details": ["lvl", "who", "what"],
  "get_login_cred": ["lvl", "who"],
  "sttrgd": ["rgd"],
  "stt_captiveInformation": ["lvl", "who", "year", "what"],
  "stt_wasteInformation": ["lvl", "who", "what"],
  "stt_listWasteInformation": ["lvl", "who", "month", "what"],
  "AR_filing": ['formData'],
  "stt_AuthorizationAndWaste": ["lvl", "who", "month", "what"],
  "stt_listAuthorizationAndWaste": ["lvl", "who", "fyyear", "what"],
  "get_AR_filing": ['ar_year', 'usrnm', 'cmpid', 'what', 'who'],
  "getSpcbAnnualReport": ["lvl", 'who', "ar_year", "what", "spcorg"],
  "saveContactDetails": ["nm", "eml", "mob", "subj", "des", "captcha", "uid"],
  'show_AR_filing': ['lvl', 'who', 'ar_year', 'what', 'usrnm', 'cmpid', 'stateedit'],
  'show_AR_filing_Hcf': ['lvl', 'who', 'ar_year', 'what', 'usrnm', 'cmpid', 'val'],
  'show_AR_filing_count': ['lvl', 'who', 'ar_year', 'what', 'usrnm', 'cmpid'],
  'show_vehicle_currentpoint': ['lvl', 'who', 'usrnm', 'dtno', 'vehicleno'],
  'show_vehicle_list': ['who', 'vehicleno'],
  //'show_cbwtf_currentpoint':['lvl', 'who', 'usrnm', 'cmpid', 'cbwtfid'],
  'show_cbwtf_currentpoint': ['cbwtfid'],
  'show_consolidate_Data': ['lvl', 'who', 'ar_year', 'usrnm', 'cmpid'],
  'hcfconsentlist': ['lvl', 'who', 'val'],
  'hcf_register_ind': ['lvl', 'who', 'val', 'usrnm', 'cmpid'],
  'hcf_consent_exprd': ['lvl', 'who', 'val', 'usrnm', 'cmpid'],
  'hcf_consent_update': ['cmpid', 'usrnm', 'hcfid', 'consent_no', 'consent_files'],
  'cbwtf_consent_update': ['cmpid', 'usrnm', 'cbwtfid', 'stt','consent_no', 'consent_files'],
}

export function capitalize(s: string) {
  let ech: string[] = s.split(' ');
  let res: string = "";
  ech.forEach((el: any) => {
    if (res) {
      res += ' ';
    }
    res += el[0].toUpperCase() + el.slice(1).toLowerCase();
  })
  return res
}

export const generateRandomAlphanumeric = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const generateRandomStringForPassword = (length: number) => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ9876543210';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export const generate10DigitRandomString = (length: number) => {
  const characters = '9876543210';  // Only digits are included for a 10-digit string
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export const decryptRandomStringPassword = (encryptedPassword: any) => {
  // Step 1: Decode the final Base64-encoded string
  const decodedString = atob(encryptedPassword);
  // Step 2: Remove the 25-character random prefix and suffix
  const strippedString = decodedString.slice(10, -25);

  // Step 3: Decode the Base64-encoded password
  const originalPassword = atob(strippedString);

  return originalPassword;
}


export async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password); // Convert string to Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-512', data); // Hash the data using SHA-512
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to array
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join(''); // Convert to hex
  return hashHex; // Return the hashed password as a hex string
}
export const postLinux = (cndt: string, callFor: string, isEncrypt?: boolean) => {
  let payload: any = {}
  let ech: string[];
  if (cndt.includes('|')) {
    
    ech = cndt.split('|');
  }
  else if (cndt.includes('=')) {
    ech = cndt.split('=');
  }
  else {
    ech = cndt.split('$');
  }
  const hst: string = window.location.hostname;
  let shouldEncryptAs: boolean = false;
  // payload decrypt for local host
  if (hst !== "localhost") {
    shouldEncryptAs = false
  } else {
    shouldEncryptAs = false
  }

  if (apiConfig[callFor] && ech.length) {
    for (let i = 0; i < ech.length; i++) {
      let apiConfigVal: string = apiConfig[callFor][i];
      // if (apiConfigVal.indexOf("signup_") > -1 || apiConfigVal.indexOf("consent_files")>-1) {
      //   shouldEncryptAs= true
      // }
      payload[apiConfigVal] = ech[i];

    }
  }


  if (sessionStorage.getItem('isLoggedOut')) {
    let base64Data = sessionStorage.getItem('isLoggedOut') || "";
    let jsonData = atob(base64Data)
    if (jsonData) {
      let data = JSON.parse(jsonData);
      if (data) payload['usrnm'] = data.usrnm;
    }
  }

  if (payload.psw && payload.signup_otpverified_token) {
    let nwpsw = btoa(payload.psw);
    let combinedString: string = ""
    const randomSuffix = generateRandomStringForPassword(25);
    const lastDigitsToken = payload.signup_otpverified_token.slice(0, 10);
    combinedString = lastDigitsToken + nwpsw + randomSuffix;
    // Encode the entire combined string in Base64 again
    payload.psw = btoa(combinedString);
  }

  if (payload.psw && !payload.signup_otpverified_token) {
    let nwpsw = btoa(payload.psw);
    let combinedString: string = ""
    const randomSuffix = generateRandomStringForPassword(25);
    if (payload.uid) {
      const storedUuid = payload.uid
      combinedString = storedUuid + nwpsw + randomSuffix;
    } else {
      // Generate a 10-digit random string
      const randomPrefix = generateRandomStringForPassword(10);
      combinedString = randomPrefix + nwpsw + randomSuffix;
    }
    // Encode the entire combined string in Base64 again
    payload.psw = btoa(combinedString);
  }


  payload['cmpid'] = getCmpId() || "";
  if (shouldEncryptAs) {
    payload['ky'] = generateRandomAlphanumeric(10)
    const jsonString = JSON.stringify(payload);
    let base64String: string = btoa(jsonString);
    const rndom = generateRandomAlphanumeric(3)
    base64String = base64String.replaceAll(rndom[0], '.')
    base64String = base64String.replaceAll(rndom[1], '_')
    base64String = base64String.replaceAll(rndom[2], '-')
    const finalString = rndom + base64String + generateRandomAlphanumeric(20);
    return { EncryptedParcel: finalString }
  }
  return payload;
}

export const getUsrnm = () => {
  if (sessionStorage.getItem('isLoggedOut')) {
    let base64Data = sessionStorage.getItem('isLoggedOut') || "";
    let jsonData = atob(base64Data)
    if (jsonData) {
      let data = JSON.parse(jsonData);
      if (data)
        return data.usrnm;
    }
    else return ""
  }
  else {
    return ""
  }
}

export const getPrintTextValue = (lvl: string, who: string, name?: string) => {
  let str: string = "Level : ";
  if (lvl == 'CPCB') {
    str += "CPCB | "
  }
  else if (lvl == 'RGD') {
    str += who + " REGIONAL DIRECOTRATE";
  }
  else if (lvl == 'STT') {
    str += "SPCB :" + getStateFullFormWho(who);
  }
  else if (lvl == 'CBWTF') {
    str += 'CBWTF : ' + name;
  }
  return str;
}


export const maskMail = (data: string) => {
  data = data.slice(6);
  return 'xxxxxx' + data;
}

export const maskNumber = (data: String) => {
  data = data.slice(6);
  return 'XXXXXX' + data;
}

export const createGetApi = (param: string, cndt: string) => {
  let msg: string = "";
  let ech: string[] = param.split("|");
  for (let i = 0, j = ech.length; i < j; i++) {
    if (ech && ech[i].indexOf("db=") === 0) {
      msg += splt_getAtPos(ech[i], "=", 1);
      break;
    }
  }
  msg += "=rowset=fnct=";
  for (let i = 0, j = ech.length; i < j; i++) {
    if (ech && ech[i].indexOf("dll=") === 0) {
      msg += splt_getAtPos(ech[i], "=", 1);
      msg += "=";
      break;
    }
  }

  for (let i = 0, j = ech.length; i < j; i++) {
    if (ech && ech[i].indexOf("fnct=") === 0) {
      msg += splt_getAtPos(ech[i], "=", 1);
      msg += "=";
      break;
    }
  }
  let svdcmp = getCmpId();
  if (!svdcmp) {
    svdcmp = "1";
  }
  msg += svdcmp + "=";
  svdcmp = getUsrId();
  if (!svdcmp) {
    svdcmp = "1";
  }
  msg += svdcmp + "=0=";
  ech = cndt.split("|");

  for (let i = 0, j = ech.length; i < j; i++) {
    if (ech && ech[i]) {
      msg += ech[i];
      msg += "=";
    }
  }
  msg = mdf(msg);
  msg = "https://www.thetaskmate.in/api/GetFldValue/" + msg;
  return msg;
};

export const mdf = (t: string) => {
  t = t.split(" ").join("xz");
  t = t.split(".").join("z2");
  t = t.split("::").join("z3");
  t = t.split(":").join("z4");
  t = t.split("\\").join("z5");
  t = t.split("/").join("z6");
  t = t.split("#").join("z7");
  t = t.split("<").join("L1T");
  t = t.split(">").join("G1T");
  t = t.split("-").join("z8");
  t = t.split("+").join("z9");
  t = t.split("&").join("q1");
  t = t.split("*").join("q2");
  t = t.split("%").join("q3");
  t = t.split("???").join("q4");
  t = t.split("??").join("q5");
  t = t.split("=").join("q6");
  t = t.split("|").join("q7");
  t = t.split("$").join("q8");
  t = t.split("[]").join("q9");
  t = t.split(",").join("x1");
  t = t.split("[").join("x2");
  t = t.split("]").join("x3");
  t = t.split("@").join("x4");
  t = t.split("!").join("qz");
  t = t.split("'").join("`");
  return t;
};

function chkLgn(parm: string) {
  let ech: string[] = parm.split("|");
  //104560|191548|Mayank Hospital|Yogesh|1|Admin||NeerjaAdmin|HospAd NrjLgn.tsx:61
  if (parm.indexOf("[new]") > -1) {
    let vl: string = splt_getAtPos(parm, "[new]", 1);
    let ary: any = dataStr_ToArray(vl);
    if (ary[0]["cmpid"] && ary[0]["cid"] && ary[0]["nm"]) {
      ary[0]["nm"] = ary[0]["nm"].replaceAll("_", " ");
      ary[0]["cmpnm"] = ary[0]["cmpnm"].replaceAll("_", " ");
      setCmpId(ary[0]["cmpid"]);
      setUsrId(ary[0]["cid"]);
      sessionStorage.setItem("cmpnm", ary[0]["cmpnm"]);
      sessionStorage.setItem("dsplnm", ary[0]["nm"]);
      sessionStorage.setItem("app", ary[0]["app"]);
      return "1";
    }
  } else {
    if (ech && ech[0] && ech[1]) {
      if (parseInt(ech[0]) > 0 && parseInt(ech[1]) > 0) {
        ech[2] = ech[2].replaceAll("_", " ");
        ech[3] = ech[3].replaceAll("_", " ");
        setCmpId(ech[0]);
        setUsrId(ech[1]);
        sessionStorage.setItem("cmpnm", ech[2]);
        sessionStorage.setItem("dsplnm", ech[3]);
        let hsp: string = "false"
        if (ech[5].indexOf("Hospital_Aggregrator") > -1) {
          const echExtended: string[] = ech[5].split('=');
          hsp = "true"
          sessionStorage.setItem("hospitalid", echExtended[0])
        }
        sessionStorage.setItem("isHospitalAggregator", hsp);
        return "1";
      }
    }
  }

  // sessionStorage.removeItem("cmpid");
  // sessionStorage.removeItem("usrid");
  // sessionStorage.removeItem("cmpnm");
  // sessionStorage.removeItem("dsplnm");
  return "0";
}

export const svLnxSrvr = (
  gid: string,
  fldVl: string,
  mid: string,
  dbcon: string,
  fldFl: string,
  mnId: string,
  tblPos: string | undefined
) => {
  fldVl += "=con][" + dbcon;
  fldVl += "=flnme][" + fldFl;
  if (mid) {
    fldVl += "=mid][" + mid;
  }

  if (mnId) {
    fldVl += "=id][" + mnId;
  }

  if (tblPos) {
    fldVl += "=tblpos][" + tblPos;
  }
  fldVl = mdf(fldVl);
  let msg: string = "vl=" + fldVl;
  msg += "&ctg=32";
  if (gid) {
    msg += "&gid=" + gid;
  } else {
    gid = Eguid();
    gid = gid.replaceAll("-", "");
    msg += "&gid=" + gid;
  }
  msg += "&usr=" + getUsrId();
  msg += "&cmp=" + getCmpId();

  msg = "https://www.amcservice.info/svxmlfgn.php?" + msg;
  return msg;
};

export function dataStr_ToArray(str: string) {
  if (!str) {
    return;
  }

  let ech: string[];
  let sep: string = "";
  if (str.indexOf("$^") > -1) {
    sep = "$^";
  } else if (str.indexOf("$]$") > -1) {
    sep = "$]$";
  } else {
    sep = "$^";
  }

  ech = str.split(sep);
  let Drpdwn = [];
  let rows = str.split("$^");
  for (var i = 0, j = rows.length; i < j; i++) {
    let ech = rows[i].split("=");
    let rw = [];
    for (var z = 0, y = ech.length; z < y; z++) {
      let fld = ech[z].split("][");
      let f: any = fld[0];
      rw[f] = fld[1];
    }
    let r = {};
    Object.assign(r, rw);

    Drpdwn.push(r);
  }

  return Drpdwn;
}

export function convertSv_Grid(data: string) {
  let ech = data.split("=");
  let rw = [];
  for (var z = 0, y = ech.length; z < y; z++) {
    let fld = ech[z].split("][");
    if (fld[0].indexOf("slv") === -1) {
      let f: any = fld[0];
      rw[f] = fld[1];
    }
  }
  let r = {};
  Object.assign(r, rw);
  return r;
}

export function chkReqFlds(fnlStr: string, reqFlds: []) {
  let ech: string[] = fnlStr.split("=");
  let msg: string = "";

  for (let z = 0, y = reqFlds.length; z < y; z++) {
    for (let i = 0, j = ech.length; i < j; i++) {
      let ps = ech[i].indexOf(reqFlds[z]["fld"] + "][");
      if (ps == 0) {
        let str: string = reqFlds[z]["fld"];
        if (ech[i].length - str.length == 2) {
          if (msg) {
            msg += "|";
          }
          msg += reqFlds[z]["msg"];
          break;
        }
      }
    }
  }
  for (let z = 0, y = reqFlds.length; z < y; z++) {
    let ps = fnlStr.indexOf(reqFlds[z]["fld"] + "][");
    if (ps > 0) {
      ps = fnlStr.indexOf("=" + reqFlds[z]["fld"] + "][");
    }
    if (ps == -1) {
      if (msg) {
        msg += "|";
      }
      msg += reqFlds[z]["msg"];
    }
  }
  return msg;
}
export const cmboStr = (
  con: string,
  typr: string,
  allwZero: string,
  fltr: string,
  useMid?: number
) => {
  let cmp: string = getCmpId() || "1";
  //  cmp = "352728";
  let usr: string = getUsrId() || "2";
  let msg: string =
    "https://www.thetaskmate.in/api/getFldvalue/nodb=rowset=fnct=x=a94=" +
    cmp +
    "=" +
    usr +
    "=a=" +
    con +
    "=" +
    typr +
    "=" +
    allwZero;
  if (useMid && useMid > 0) {
    msg += "=" + useMid;
  } else {
    msg += "=0";
  }

  msg += "=" + fltr;

  return msg;
};

export const cmboStr_fnct = (
  con: string,
  dll: string,
  fnctnm: string,
  parms: string
) => {
  ///api/GetFldValue/nodb=rowset=fnct=hospdll=fe=1=1=A=0=
  let cmp: string = getCmpId() || "1";
  let usr: string = getUsrId() || "2";
  let msg: string =
    "https://www.thetaskmate.in/api/getFldvalue/" +
    con +
    "=rowset=fnct=" +
    dll +
    "=" +
    fnctnm +
    "=" +
    cmp +
    "=" +
    usr +
    "=a=" +
    parms;
  return msg;
};

export const CheckIfEdt = (orgData: string, curData: string) => {
  if (orgData === "" || curData === "") {
    return true;
  }
  let orgE: any = orgData.split("=");
  let edtE: any = curData.split("=");
  let blnDif: boolean = false;
  for (let i = 0, j = orgE.length; i < j; i++) {
    let fld: string = orgE[i].split("][");
    for (let z = 0, y = edtE.length; z < y; z++) {
      if (edtE[z].indexOf(fld[0] + "][") === 0) {
        if (orgE[i] === edtE[z]) {
          break;
        } else {
          blnDif = true;
          return blnDif;
        }
      }
    }
  }
  return blnDif;
};

export const CallRoundOff = (amt: number) => {
  let nstr: string = amt.toFixed(2);
  let dc: any = nstr.split(".");
  if (dc && dc.length > 1 && dc[1]) {
    let nm: number = parseInt(dc[1]);

    if (nm > 50) {
      return (100 - nm) / 100;
    } else {
      return -nm / 100;
    }
  } else {
    return 0;
  }

  return 0;
};

export const CheckDataServr = (data: any, fnd: string) => {
  if (data && data.data && data.data[0] && data.data[0][fnd]) {
    return data.data[0][fnd];
  }
  return "";
};
export const cmboStrLrg = (
  con: string,
  typr: string,
  allwZero: string,
  fltr: string,
  useMid?: number
) => {
  let cmp: string = getCmpId() || "1";
  //  cmp = "352728";
  let usr: string = getUsrId() || "2";
  let msg: string =
    "https://www.thetaskmate.in/api/getFldvalue/nodb=rowset=fnct=x=a120=" +
    cmp +
    "=" +
    usr +
    "=a=" +
    con +
    "=" +
    typr +
    "=" +
    allwZero;
  if (useMid && useMid > 0) {
    msg += "=" + useMid;
  } else {
    msg += "=0";
  }

  msg += "=" + fltr;

  return msg;
};





export const RemoveFld = (data: string, fldNm: string) => {
  if (data) {
    let ary: any = data.split("=");
    let i: number = 0;
    while (i < ary.length) {
      if (ary[i]) {
        if (ary[i].indexOf(fldNm + '][') == 0) {
          ary[i] = "";
        }
      }
      i++;
    }
    i = 0;
    data = "";
    while (i < ary.length) {
      if (ary[i]) {
        if (data) {
          data += "="
        }

        data += ary[i];
      }
      i++;
    }
  }
  return data;
}

export const clrFldsExcptDrpDt = (data: string) => {
  return "";
  let ary: any = data.split("=");
  let i: number = 0;
  let skp: boolean = true
  while (i < ary.length) {
    skp = true
    if (ary[i]) {
      if (ary[i].indexOf("dt_") == 0) {

      } else if (ary[i].indexOf("tm_") == 0) {

      } else if (ary[i].indexOf("id][") > -1) {
        if (i + 1 < ary.length) {
          let fld: any = ary[i].split("][")
          if (fld && fld[0]) {
            fld[0] = fld[0].substring(0, fld[0].length - 2);
            if (fld[0]) {
              if (ary[i + 1].indexOf(fld[0] + '][') == 0) {

              } else {
                ary[i] = ""
                skp = false
              }
            } else {
              ary[i] = ""
              skp = false
            }

          }
        } else {
          ary[i] = ""
          skp = false
        }
      } else {
        ary[i] = ""
        skp = false
      }
    }
    if (skp) {
      i++
    }
    i++;
  }

  i = 0;
  let dt: string = "";
  while (i < ary.length) {
    if (ary[i]) {
      if (dt) {
        dt += "="
      }

      dt += ary[i];
    }
    i++;
  }

  return dt;
}
export const getApiFromBiowaste = (path: string) => {
  return 'https://biowaste.in/' + path;

}

export const getApiFromClinician = (path: string) => {
  return 'https://api.cliniciankhoj.com/' + path;

}

export const getApiFromSwachhtaabhiyan = (path: string) => {
  return 'https://api.swachhtaabhiyan.in/' + path;
}


export const ChangeCase = (data: any, flds: string) => {
  let fld: any = {}
  fld = flds.split("#")
  let i: number = 0;
  let ps: number = 0;
  while (i < data.length) {
    ps = 0;
    while (ps < fld.length) {
      if (data[i][fld[ps]]) {
        data[i][fld[ps]] = data[i][fld[ps]].toString().toUpperCase()
      }
      ps += 1;
    }

    i += 1;
  }

  return data;

}

export const GetResponseWnds = (data: any) => {
  if (data && data.data && data.data["Data"]) {
    return data.data["Data"];
  }
  if (data && data.data[0] && data.data[0]["Data"]) {
    return data.data[0]["Data"];
  }
  if (data && data.data && data.data["Status"]) {
    if (data.data['Status'] == "Success") {
      return ""
    }
    return data.data["Status"];
  }

  if (data && data.data[0] && data.data[0]["Status"]) {
    if (data.data[0]['Status'] == "Success") {
      return ""
    }
    return data.data[0]["Status"];
  }
  return "";
}
export const GetResponseLnx = (data: any) => {
  if (data && data.data) {
    return data.data;
  }
  else {
    return "";
  }
}

export const isValidArray = (ary: any) => {
  if (ary && ary[0]) {
    return true;
  }
  return false;
}

export const isReqFld = (req: any, fldNm: string) => {
  if (isValidArray(req)) {
    if (fldNm) {
      let i: number = 0;
      while (i < req.length) {
        if (req[i]['fld'] == fldNm) {
          return true;
        }
      }
    }
  }

  return false;
}

export const gridAddToolTipColumn = (ary: any, nwCol: string, msg: string, prfxClVl: string, pstFxClVl: string) => {
  let i: number = 0;
  let cnt: number = ary.length;
  let m: string = "";
  while (i < cnt) {
    m = "";
    if (prfxClVl) {
      if (ary[i][prfxClVl].length == 2) {
        m = getCategoryAbbreviation(ary[i][prfxClVl]) + " "
      } else {
        m = ary[i][prfxClVl] + " "
      }

    }
    m = m + msg;
    if (pstFxClVl) {
      if (ary[i][pstFxClVl].length == 2) {
        m += getCategoryAbbreviation(ary[i][prfxClVl]) + " "
      } else {
        m += ary[i][pstFxClVl] + " "
      }
    }
    ary[i][nwCol] = m
    i += 1;
  }

  return ary;
}

export const stateAbbreviation: { [key: string]: string } = {
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  "Assam": "AS",
  "Bihar": "BR",
  "Chattisgarh": "CG",
  "Goa": "GA",
  "Gujarat": "GJ",
  "Haryana": "HR",
  "Himachal Pradesh": "HP",
  "Jammu and Kashmir": "JK",
  "Jharkhand": "JH",
  "Karnataka": "KA",
  "Kerala": "KL",
  "Madhya Pradesh": "MP",
  "Maharashtra": "MH",
  "Manipur": "MN",
  "Meghalaya": "ML",
  "Mizoram": "MZ",
  "Nagaland": "NL",
  "Odisha": "OD",
  "Punjab": "PB",
  "Rajasthan": "RJ",
  "Sikkim": "SK",
  "Tamil Nadu": "TN",
  "Telangana": "TS",
  "Telengana": "TS",
  "Tripura": "TR",
  "Uttarakhand": "UK",
  "Uttar Pradesh": "UP",
  "West Bengal": "WB",
  "Andaman and Nicobar Island": "AN",
  "Chandigarh": "CH",
  "Dadra and Nagar Haveli": "DN",
  "Daman and Diu": "DD",
  "Delhi": "DL",
  "Lakshadweep": "LD",
  "Puducherry": "PY",
  "Ladakh": "ZZ",
  "Uttarpradesh": "UP"

}

export const getStateAbbreviation = (stateName: string) => {
  const abbreviation = stateAbbreviation[stateName];
  if (abbreviation) {
    return abbreviation;
  } else {
    return "State not found";
  }
};


export const catFromAbbreviation: { [key: string]: string } = {
  "BH": "Bedded Hospital",
  "CL": "Clinic",
  "PL": "Pathology Laboratory",
  "NH": "Nursing Home",
  "BB": "Blood Bank",
  "DI": "Dispensary",
  "AH": "Animal House",
  "VH": "Veterinary Hospital",
  "DH": "Dental Hospital",
  "FA": "Institutions / Schools / Companies etc With first Aid Facilitites",
  "HC": "Health Camp",
  "HO": "Homeopathy",
  "MH": "Mobile Hospital",
  "SI": "Siddha",
  "UN": "Unani",
  "YO": "Yoga"
}

export const getCategoryAbbreviation = (ctg: string) => {
  const abbreviation = catFromAbbreviation[ctg];
  if (abbreviation) {
    return abbreviation;
  } else {
    return "";
  }
};

export const getApplicationVersion = () => {
  return process.env.REACT_APP_VERSION || '2';
}

const stateFullFormForMap: { [key: string]: string } = {
  "AN": "Andaman & Nicobar Island",
  "AP": "Andhra Pradesh",
  "AR": "Arunachal Pradesh",
  "AS": "Assam",
  "BR": "Bihar",
  "CH": "Chandigarh",
  "CG": "Chhattisgarh",
  "DN": "Dadara & Nagar Haveli",
  "DD": "Daman & Diu",
  "DL": "Delhi",
  "GA": "Goa",
  "GJ": "Gujarat",
  "HR": "Haryana",
  "HP": "Himachal Pradesh",
  "JK": "Jammu & Kashmir",
  "JH": "Jharkhand",
  "KA": "Karnataka",
  "KL": "Kerala",
  "LD": "Lakshadweep",
  "MP": "Madhya Pradesh",
  "MH": "Maharashtra",
  "MN": "Manipur",
  "ML": "Meghalaya",
  "MZ": "Mizoram",
  "NL": "Nagaland",
  "OD": "Odisha",
  "PY": "Puducherry",
  "PB": "Punjab",
  "RJ": "Rajasthan",
  "SK": "Sikkim",
  "TN": "Tamil Nadu",
  "TS": "Telangana",
  "TR": "Tripura",
  "UP": "Uttar Pradesh",
  "UK": "Uttarakhand",
  "WB": "West Bengal",
}

const stateFullFormForWho: { [key: string]: string } = {
  "AN": "Anadaman and Nicobar Island",
  "AP": "Andhra Pradesh",
  "AR": "Arunachal Pradesh",
  "AS": "Assam",
  "BR": "Bihar",
  "CH": "Chandigarh",
  "CG": "Chattisgarh",
  "DN": "Dadar and Nagar Haveli",
  "DD": "Daman and Diu",
  "DL": "Delhi",
  "GA": "Goa",
  "GJ": "Gujarat",
  "HR": "Haryana",
  "HP": "Himachal Pradesh",
  "JK": "Jammu and Kashmir",
  "JH": "Jharkhand",
  "KA": "Karnataka",
  "KL": "Kerala",
  "LD": "Lakshadweep",
  "MP": "Madhya Pradesh",
  "MH": "Maharashtra",
  "MN": "Manipur",
  "ML": "Meghalaya",
  "MZ": "Mizoram",
  "NL": "Nagaland",
  "OD": "Orrisa",
  "PY": "Puducherry",
  "PB": "Punjab",
  "RJ": "Rajasthan",
  "SK": "Sikkim",
  "TN": "Tamil Nadu",
  "TS": "Telangana",
  "TR": "Tripura",
  "UP": "Uttar Pradesh",
  "UK": "Uttarakhand",
  "WB": "West Bengal",
}

export const getStateFullFormWho = (shortForm: any) => {
  const fullForm = stateFullFormForWho[shortForm];
  if (fullForm) {
    return fullForm;
  } else {
    return shortForm;
  }
};
export const getStateFullForm = (shortForm: any) => {
  const fullForm = stateFullFormForMap[shortForm];
  if (fullForm) {
    return fullForm;
  } else {
    return shortForm;
  }
};

export const showPrint = (data: any) => {
  let dt: string = GetResponseWnds(data)
  if (dt && dt.indexOf(".pdf") > -1) {
    window.open(dt, "_blank")
  }
}

export const TotalForTable = (arry: any, cols: string) => {
  let flds: any = cols.split("#")
  let i: number = 0
  let z: number = arry.length
  let totalarry: any = { 'lbl': 0, 'nolbl': 0 }
  let p: number = 0
  let q: number = flds.length
  // while (p <= q)
  // {
  //   totalarry[0][flds[p]] = 0
  //   p += 1
  // }
  while (i < z) {
    p = 0
    while (p < q) {
      totalarry[flds[p]] = Number(totalarry[flds[p]]) + Number(arry[i][flds[p]])
      p += 1
    }
    i += 1;
  }
  arry.push(totalarry)
  return arry
}

export const dateCheck30Days = (frmDate: any, toDate: any) => {
  let msg: string[] = [];

  if (frmDate && toDate) {
    let Tonumber = UseMomentDateNmb(toDate)
    let frmnumber = UseMomentDateNmb(frmDate)
    if (frmnumber <= Tonumber) {
      if (Tonumber - frmnumber >= 31) {
        msg.push('Invalid date selection. Please choose a date within the allowed range (31 days)');
      }
    } else {
      msg.push('Invalid date selection. Please choose a valid range');
    }
  } else {
    if (!frmDate) {
      msg.push('Select From date');
    }
    if (!toDate) {
      msg.push("Select To date");
    }
  }
  return msg;
}


export const passwordRegex = (password: any) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?])[A-Za-z\d@$!%*?]{8,}$/
  return passwordRegex.test(password)
}
export const labelRegex = (label: any) => {
  const labelRegex = /^[A-Za-z]{5}[0-9A-Za-z]{10}\d{5}$/
  return labelRegex.test(label)
}


export const tellWndsServer = (gid: string) => {
  return createGetApi("db=nodb|dll=x|fnct=a170", gid)
}
export const tellWndsServer2 = (gid: string) => {
  return createGetApi("db=nodb|dll=xrydll|fnct=a243", gid)
}




export const postLnxSrvr = (
  fldVl: string,
  mid: string,
  dbcon: string,
  fldFl: string,
  mnId: string,
  tblPos: string | undefined,

) => {
  fldVl += "=con][" + dbcon;
  fldVl += "=flnme][" + fldFl;
  if (mid) {
    fldVl += "=mid][" + mid;
  }

  if (mnId) {
    fldVl += "=id][" + mnId;
  }

  if (tblPos) {
    fldVl += "=tblpos][" + tblPos;
  }
  fldVl = mdf(fldVl);

  return fldVl;
};


export const getCntWtInNumbers = (data: any) => {
  return ({
    redcnt: (data.redcnt && !isNaN(Number(data.redcnt))) ? Number(data.redcnt) : 0,
    ylwcnt: (data.ylwcnt && !isNaN(Number(data.ylwcnt))) ? Number(data.ylwcnt) : 0,
    blucnt: (data.blucnt && !isNaN(Number(data.blucnt))) ? Number(data.blucnt) : 0,
    whtcnt: (data.whtcnt && !isNaN(Number(data.whtcnt))) ? Number(data.whtcnt) : 0,
    cytcnt: (data.cytcnt && !isNaN(Number(data.cytcnt))) ? Number(data.cytcnt) : 0,
    redwt: (data.redwt && !isNaN(Number(data.redwt))) ? Number(Number(data.redwt).toFixed(3)) : 0.000,
    ylwwt: (data.ylwwt && !isNaN(Number(data.ylwwt))) ? Number(Number(data.ylwwt).toFixed(3)) : 0.000,
    bluwt: (data.bluwt && !isNaN(Number(data.bluwt))) ? Number(Number(data.bluwt).toFixed(3)) : 0.000,
    whtwt: (data.whtwt && !isNaN(Number(data.whtwt))) ? Number(Number(data.whtwt).toFixed(3)) : 0.000,
    cytwt: (data.cytwt && !isNaN(Number(data.cytwt))) ? Number(Number(data.cytwt).toFixed(3)) : 0.000
  })
}

export const getCntWtInNumberBigBag = (data: any) => {

  const colorValues: any = {
    red: { cnt: 'redcnt', wt: 'redwt' },
    blu: { cnt: 'blucnt', wt: 'bluwt' },
    ylw: { cnt: 'ylwcnt', wt: 'ylwwt' },
    cyt: { cnt: 'cytcnt', wt: 'cytwt' },
    wht: { cnt: 'whtcnt', wt: 'whtwt' }
  }

  let colorwiseData = {
    ...data,
    redcnt: 0,
    ylwcnt: 0,
    blucnt: 0,
    whtcnt: 0,
    cytcnt: 0,
    redwt: 0.000,
    ylwwt: 0.000,
    bluwt: 0.000,
    whtwt: 0.000,
    cytwt: 0.000,
  }
  if (colorValues[data.clr]) {
    colorwiseData[colorValues[data.clr].cnt] = !isNaN(Number(data.bagcnt)) ? Number(data.bagcnt) : 0;
    colorwiseData[colorValues[data.clr].wt] = !isNaN(Number(data.wt)) ? Number(data.wt) : 0.000;
  }
  colorwiseData['ttlcnt'] = !isNaN(Number(data.bagcnt)) ? Number(data.bagcnt) : 0;
  colorwiseData['ttlwt'] = !isNaN(Number(data.wt)) ? Number(data.wt) : 0.000;
  return colorwiseData;
}



export const convertFldValuesToString = (jsonData: any) => {
  let str: string = "";
  for (let key of Object.keys(jsonData)) {
    if (str) {
      str += '=';
    }
    str += key + '][' + jsonData[key];
  }
  return str;
}

export const convertFldValuesToJson = (str: any) => {
  let jsonData: any = {}
  let ech: string[] = str.split("=");
  for (let el of ech) {
    if (el.includes('][')) {
      let keyValue = el.split('][');
      jsonData[keyValue[0]] = keyValue[1];
    }

  }
  return jsonData;
}

export const sortArrayByFieldOrder = (inputArray: any[], ...fields: any) => {
  let cnt: number = 0
  let i: number = 0;
  const sortedData = [...inputArray].sort((a, b) => {
    for (let field of fields) {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
    }
    return 0;
  });
  return sortedData;

}

export const clear_Multiple_Controls = (flds: string, data: string) => {
  let cntrls: any = [];
  cntrls = flds.split("#");
  let i = 0;
  let vales: any = [];
  vales = data.split("=");
  let j: number = 0;
  while (i < cntrls.length) {

    j = 0;
    while (j < vales.length) {
      if (vales[j].indexOf(cntrls[i] + "][") > -1) {
        vales[j] = "";
        continue;
      }
      j += 1;
    }
    i += 1
  }

  let fnl: string = "";
  i = 0;
  while (i < vales.length) {
    if (vales[i]) {
      if (fnl) {
        fnl += "=";
      }
      fnl += vales[i]
    }
    i += 1;
  }

  return fnl;
}

export const check_multiplesum_validation = (fld: string, data: string) => {
  let cntrl: any = fld.split('#');
  let total: number = 0.0
  if (cntrl) {
    let i = 0;
    let rcnt = cntrl.length;


    while (i < rcnt) {
      let val: string = fld_value(cntrl[i], data)
      if (val && !isNaN(Number(val))) {
        total = total + Number(val)
      }
      i += 1
    }
  }
  return total
}


export const fld_value = (fld: string, data: string) => {
  let vales: any = [];
  vales = data.split("=");
  let j: number = 0;



  while (j < vales.length) {
    if (vales[j].indexOf(fld + "][") > -1) {
      const parts = vales[j].split("][");
      if (parts.length > 1) {
        return parts[1] || '';
      } else {
        return '';
      }

    }
    j += 1;
  }

}

export const sortByFld = (data: any[], fldName: string) => {
  return [...data].sort((a, b) => a[fldName].localeCompare(b[fldName]));
};

export const trimField = (data: any[], fldName: string) => {
  return data.map(item => ({
    ...item,
    [fldName]: item[fldName]?.trim(), // Trims only if the field exists
  }));
};




// export const capitalizeTerms = (label: string) => {
//   if (!label || typeof label !== "string") return "";

//   const specialTerms: Record<string, string> = {
//     cbwtf: "CBWTF",
//     cbwtfs: "CBWTFs",
//     hcf: "HCF",
//     hcfs: "HCFs",
//     rd: "RD",
//     rds: "RDs",
//     spcb: "SPCB",
//     spcbs: "SPCBs",
//     bmwm: "BMWM",
//     "spcb/pcc": "SPCB/PCC",
//     "spcbs/pcc": "SPCBs/PCC",
//     "state/ut": "State/UT",
//     url: "URL",
//     "cbwtf-hcf": "CBWTF-HCF",
//     "spcb:": "SPCB:",
//     "cbwtf wise": "CBWTF wise",
//     "(cbwtf wise)": "(CBWTF wise)",
//     "dashboard": "Dashboard",
//     "From date": "From date",
//     "To date": "To date",
//     "Change password RDs": "Change password RDs",
//     "Change password SPCBs/PCC": "Change password SPCBs/PCC",
//     "Change password": "Change password",
//     "Current password": "Current password",
//     "New password": "New password",
//     "Board": "Board",
//     "Retype New password": "Retype new password",
//     "Old Password":"Old Password"
    
    
//   };

//   label = label.trim().toLowerCase();

//   if (label.length === 0) return "";

//   // Replace special terms by scanning for them inside the string
//   Object.keys(specialTerms).forEach((key) => {
//     const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // escape special regex chars
//     const regex = new RegExp(escapedKey, "gi"); // case-insensitive
//     label = label.replace(regex, specialTerms[key]);
//   });

//   // Capitalize only the first character of the final string
//   return label.charAt(0).toUpperCase() + label.slice(1);
// };


/**
 * Capitalizes special terms if matched exactly or within a sentence.
 * Ensures the first character of the final sentence is capitalized.
 */
export const capitalizeTerms = (label: string): string => {
  if (!label || typeof label !== "string") return "";

  // Special terms that should be replaced exactly as defined
  const specialTerms: Record<string, string> = {
    cbwtf: "CBWTF",
    cbwtfs: "CBWTFs",
    hcf: "HCF",
    hcfs: "HCFs",
    rd: "RD",
    rds: "RDs",
    spcb: "SPCB",
    spcbs: "SPCBs",
    bmwm: "BMWM",
    "spcb/pcc": "SPCB/PCC",
    "spcbs/pcc": "SPCBs/PCC",
    "state/ut": "State/UT",
    url: "URL",
    "cbwtf-hcf": "CBWTF-HCF",
    "spcb:": "SPCB:",
    "cbwtf wise": "CBWTF wise",
    "(cbwtf wise)": "(CBWTF wise)",
    dashboard: "Dashboard",
    "from date": "From date",
    "to date": "To date",
    "change password rds": "Change password RDs",
    "change password spcbs/pcc": "Change password SPCBs/PCC",
    "change password": "Change password",
    "current password": "Current password",
    "new password": "New password",
    board: "Board",
    "retype new password": "Retype new password",
    "old password": "Old password",
    "daily report of waste of cbwtfs": "Daily report of waste of CBWTFs",
    "incorrect data waste bags cbwtf report": "Incorrect data waste bags CBWTF report",
    "incorrect waste  bags cbwtf report": "Incorrect waste  bags CBWTF report",
    "bags distribution (cbwtf wise)": "Bags distribution (CBWTF wise)",
    cpcb: "CPCB",
    regarding: "regarding",
    coems: "COEMS"
  };

  const trimmed = label.trim();
  const lowerCased = trimmed.toLowerCase();

  // Step 1: Return immediately if there's an exact match
  if (specialTerms[lowerCased]) {
    return specialTerms[lowerCased];
  }

  let updated = lowerCased;

  // Step 2: Replace partial matches within the sentence
  for (const key in specialTerms) {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedKey}\\b`, "gi"); // word-boundary based match
    updated = updated.replace(regex, specialTerms[key]);
  }

  // Step 3: Capitalize the first character of the final string
  return updated.charAt(0).toUpperCase() + updated.slice(1);
};


export default utilities;

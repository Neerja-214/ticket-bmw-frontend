import React, { useEffect, useReducer, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, convertFldValuesToJson, convertFldValuesToString, createGetApi, dataStr_ToArray, getCmpId, getUsrId, getUsrnm, postLinux, postLnxSrvr, svLnxSrvr, tellWndsServer, tellWndsServer2 } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";

import { nrjAxios, nrjAxiosRequest, nrjAxiosRequestBio, useNrjAxios } from '../../Hooks/useNrjAxios';
import { Navigate, useNavigate } from "react-router-dom";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import WtrInput from '../../components/reusable/nw/WtrInput';
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect';
import { validForm } from '../../Hooks/validForm';
import { Toaster } from '../../components/reusable/Toaster';
import NrjRsDt from '../../components/reusable/NrjRsDt';
import SaveIcon from "@mui/icons-material/Save";
import { useEffectOnce } from 'react-use';
import HcfHeader from './HcfHeader';
import { useToaster } from '../../components/reusable/ToasterContext';
import { getLvl } from '../../utilities/cpcb';
import PdfIcon from '../../images/pdf-svgrepo-com.svg';


const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  SETGID: "gd",
  NEWFRMDATA: "frmdatanw",
  DISABLE: 'disable',
  SETNONBEDDED: "setNonBedded",
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  textDts: "",
  mainId: 0,
  errMsg: [],
  openDrwr: false,
  frmData: "",
  gid: "",
  nonBedded: ''
};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  trigger: number;
  textDts: string;
  mainId: number;
  errMsg: any;
  openDrwr: boolean;
  frmData: string;
  gid: string;
  nonBedded: string
};

type act = {
  type: string;
  payload: any;
};

const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.MAINID:
      newstate.mainId = action.payload;
      newstate.gid = "";
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
    case ACTIONS.NEWROWDATA:
      newstate.nwRow = action.payload;
      newstate.triggerG = 1;
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
      newstate.frmData = dta;
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
    case ACTIONS.SETGID:
      newstate.gid = action.payload;
      return newstate;
    case ACTIONS.SETNONBEDDED:
      newstate.nonBedded = action.payload;
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


interface FileObject {
  file: File;
  fileName: string;
}

interface FileData {
  flnm: string;
  flst: string;
}

interface MomFileData {
  flnm: string;
  flst: string;
}




const HcfMonthlyreport = () => {

  const [state, dispatch] = useReducer(reducer, initialState);
  const [gid, setGid] = useState('')
  const [showMessage, setShowMessage] = useState<any>({ message: [] })
  const hcfLoginId = true;
  const [formDataGet, setFormData] = useState('')
  const [captiveValue, setCaptiveValue] = useState<boolean>(false)
  const [governmentCombo, setGovernmentCombo] = useState("")
  const navigate = useNavigate();
  const [hcfTypeSelect, setHcfTypeSelect] = useState(true)
  const [showPdfFile, setShowPdfFile] = useState([])
  const [showMomPdfFile, setShowMomPdfFile] = useState([])

  const isHcfLogin = getLvl() == 'CPCB' ? false : true;

  const [files, setFiles] = useState<FileObject[]>([]);
  const [error, setError] = useState<string>('');
  const [fileData, setFileData] = useState<FileData[]>([]);

  const [momFiles, setMomFiles] = useState<FileObject[]>([]);
  const [momPdfError, setMomPdfError] = useState<string>('');
  const [momFileData, setMomFileData] = useState<MomFileData[]>([]);


  const isPDF = async (file: File): Promise<boolean> => {
    const reader = new FileReader();
    const buffer = await new Promise<Uint8Array>((resolve, reject) => {
      reader.onloadend = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };
      reader.readAsArrayBuffer(file.slice(0, 4)); // Read the first 4 bytes of the file
    });

    // Check if the buffer indicates a PDF file
    return (
      buffer[0] === 0x25 && // %
      buffer[1] === 0x50 && // P
      buffer[2] === 0x44 && // D
      buffer[3] === 0x46    // F
    );
  };

  const convertToBase64 = (file: File): Promise<{ base64: string; fileName: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve({ base64: reader.result, fileName: file.name });
        } else {
          reject(new Error('Failed to convert file to base64.'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };
      reader.readAsDataURL(file); // Read file as base64
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    let totalPDFSize = 0;
    const updatedFiles: FileObject[] = [];
    let isError = false;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];

      // Check if the file is a PDF
      try {
        if (!(await isPDF(file))) {
          setError('Please select only PDF files.');
          isError = true;
          break;
        }
      } catch (error) {
        console.error('Error checking if file is PDF:', error);
      }

      // Check if adding the current file exceeds the total size limit
      if (totalPDFSize + file.size > 2 * 1024 * 1024) {
        setError('Total size of PDF files exceeds the limit of 2MB.');
        isError = true;
        break;
      }

      // Check if the file with the same name or content already exists
      const { base64, fileName } = await convertToBase64(file);
      const existingFile = files.find(existing => existing.fileName === fileName || existing.file.name === fileName);
      if (existingFile && existingFile.file.size === file.size && existingFile.file.type === file.type) {
        setError(`File '${file.name}' already exists.`);
        isError = true;
        break;
      }

      updatedFiles.push({ file, fileName: file.name });
      totalPDFSize += file.size;

    }

    if (!isError) {
      setFiles([...files, ...updatedFiles]);
      setError('');
    }
  };

  const handleMomFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    let totalPDFSize = 0;
    const updatedFiles: FileObject[] = [];
    let isError = false;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];

      // Check if the file is a PDF
      try {
        if (!(await isPDF(file))) {
          setMomPdfError('Please select only PDF files.');
          isError = true;
          break;
        }
      } catch (error) {
        console.error('Error checking if file is PDF:', error);
      }

      // Check if adding the current file exceeds the total size limit
      if (totalPDFSize + file.size > 2 * 1024 * 1024) {
        setMomPdfError('Total size of PDF files exceeds the limit of 2MB.');
        isError = true;
        break;
      }

      // Check if the file with the same name or content already exists
      const { base64, fileName } = await convertToBase64(file);
      const existingFile = momFiles.find(existing => existing.fileName === fileName || existing.file.name === fileName);
      if (existingFile && existingFile.file.size === file.size && existingFile.file.type === file.type) {
        setMomPdfError(`File '${file.name}' already exists.`);
        isError = true;
        break;
      }
      updatedFiles.push({ file, fileName: file.name });
      totalPDFSize += file.size;
    }
    if (!isError) {
      setMomFiles([...momFiles, ...updatedFiles]);
      setMomPdfError('');
    }
  };

  useEffect(() => {
    checkPdfFileCount()
  }, [files, momFiles])

  function checkPdfFileCount() {
    if (files.length > 4) {
      setError('Maximum number of PDF files allowed is 4.');
    }
    if (momFiles.length > 4) {
      setMomPdfError('Maximum number of PDF files allowed is 4.')

    }
  }

  const extractBase64 = (dataUrl: string): string => {
    const base64Index = dataUrl.indexOf(';base64,');
    if (base64Index === -1) {
      throw new Error('Invalid data URL');
    }
    return dataUrl.slice(base64Index + 8);
  };

  const handleUpload = async () => {

    for (let i = 0; i < files.length; i++) {
      const { file } = files[i];
      try {
        const { base64, fileName } = await convertToBase64(file);
        setFileData(prevFileData => [...prevFileData, { flnm: fileName, flst: extractBase64(base64) }]);
      } catch (error) {
        console.error('Error converting file to base64:', error);
        setFileData([])
      }
    }
  };

  const handleUploadMomFile = async () => {
    for (let i = 0; i < momFiles.length; i++) {
      const { file } = momFiles[i];
      try {
        const { base64, fileName } = await convertToBase64(file);
        setMomFileData(prevFileData => [...prevFileData, { flnm: fileName, flst: extractBase64(base64) }]);
      } catch (error) {
        console.error('Error converting file to base64:', error);
        setMomFileData([])
      }
    }

  }

  const handleDeleteFile = (index: any) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleDeleteMomFile = (index: any) => {
    const updatedFiles = [...momFiles];
    updatedFiles.splice(index, 1);
    setMomFiles(updatedFiles);
  }


  const handleShowPdfClick = async (path: any) => {
    let pdfPath = path
    if (pdfPath) {
      let cmpid = getCmpId() || "";
      let usrnm = getUsrnm() || "";
      let payload: any = { cmpid: cmpid, usrnm: usrnm, doc_path: pdfPath }
      let data = await nrjAxiosRequestBio("get_AR_docfile", payload);
      if (data) {
        let base64 = data.data.flst
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`<embed src="data:application/pdf;base64,${base64}" type="application/pdf" width="100%" height="100%" />`);
        } else {
          alert('Pop-up blocker may be preventing the PDF from opening. Please disable the pop-up blocker for this site.');
        }
      }

    }

  }

  function returnDisabled() {
    let disabeled: boolean = true
    if (captiveValue && isHcfLogin) {
      disabeled = false
      return disabeled
    } else if (!isHcfLogin) {
      disabeled = false
      return disabeled
    } else {
      return disabeled
    }

  }

  const reqFlds = [


    { fld: 'authdt_exp', chck: '1[length]', msg: 'Enter Valid Date ' },
    { fld: 'dt_exp', chck: '1[length]', msg: 'Enter Valid Date ' },
    { fld: 'licdt_exp', chck: '1[length]', msg: 'Enter Valid Date ' },
    { fld: 'authnm', msg: 'Enter Name of Authorized Person', chck: '1[length]' },
    { fld: 'hcfnm', msg: 'Enter Name of HCF', chck: '1[length]' },
    { fld: 'addc', chck: '1[length]', msg: 'Address for Correspondence ' },
    { fld: 'addf', chck: '1[length]', msg: 'Address of Facility' },
    // { fld: 'urlweb', chck: '1[length]', msg: 'URL of Website' },
    { fld: 'gpscordlat', chck: '1[length]', msg: 'GPS coordinates of HCF' },
    { fld: 'gpscordlong', chck: '1[length]', msg: 'GPS coordinates of HCF' },
    { fld: 'ownhcf', chck: '1[length]', msg: 'Ownership of HCF' },
    { fld: 'telno', chck: '[mob]', msg: 'Enter Valid Tel. No' },
    // { fld: 'fxno', chck: '1[length]', msg: 'Enter Valid Fax. No' },
    { fld: 'eml', chck: '[email]', msg: 'Enter E-mail ID ' },
    { fld: 'stsauth', chck: '1[length]', msg: 'Enter Status of Authorization under' },
    { fld: 'dt_exp', chck: '1[length]', msg: 'Enter Status of Consents under Water Act and Air Act' },
    { fld: 'nobd', chck: '1[length]', msg: 'Enter No. of Beds' },
    // { fld: 'nonbdid', chck: '1[length]', msg: 'Non-bedded health care facility ' },
    { fld: 'nonbd', chck: '1[length]', msg: 'Non-bedded health care facility ' },
    { fld: 'licno', chck: '1[length]', msg: 'License number' },
    { fld: 'ylwqnt', chck: '1[length]', msg: 'Enter Yellow Category' },
    { fld: 'redqnt', chck: '1[length]', msg: 'Enter Red Category' },
    { fld: 'whtqnt', chck: '1[length]', msg: 'Enter White Category' },
    { fld: 'blqnt', chck: '1[length]', msg: 'Enter Blue Category' },
    { fld: 'slqnt', chck: '1[length]', msg: 'Enter General Solid Category' },

    // { fld: 'phn', chck: '[mob]', msg: 'Date of Expiry' },
  ];

  const getGid = () => {
    let g: any = utilities(3, "", "");
    dispatch({ type: ACTIONS.SETGID, payload: g });
    return g;
  };

  const [month, setMonth] = useState("");

  const [ownerHcfSelect, setOwnerHcfSelect] = useState('')


  const onChangeDts = (data: string) => {
    let fld: any = utilities(2, data, "");

    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    if (fld == 'dt_month') {
      setMonth(getFldValue(data, 'dt_month'))
    }


    if (fld == 'ownhcfid') {
      let hcf = getFldValue(data, 'ownhcfid').split('|')[1]
      setOwnerHcfSelect(hcf)
    }
  };


  const SaveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    showToaster(msg, 'error');

    if (msg && msg[0]) {
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    refetch();
  };

  const HandleSaveClick = () => {

    let formData: any = '';
    // if (formDataGet) {
    //     formData = formDataGet;
    // } else {
    formData = state.textDts;
    // }
    formData = convertFldValuesToJson(formData);

    formData['cmpid'] = getCmpId() || "";
    formData['usrnm'] = getUsrnm() || "";
    formData['ar_year'] = formData['dt_month'];
    formData['dt_month'] = formData['dt_month'] ? formData['dt_month'] : '0';
    formData['what'] = 'hcf_mr';
    formData['authnm'] = formData['authnm'] ? formData['authnm'] : 'NA';
    formData['hcfnm'] = formData['hcfnm'] ? formData['hcfnm'] : 'NA';
    formData['addc'] = formData['addc'] ? formData['addc'] : 'NA';
    formData['telno'] = formData['telno'] ? formData['telno'] : '0';
    formData['fxno'] = formData['fxno'] ? formData['fxno'] : '0';
    formData['eml'] = formData['eml'] ? formData['eml'] : 'NA';
    formData['urlweb'] = formData['urlweb'] ? formData['urlweb'] : 'NA';
    formData['gpscordlat'] = formData['gpscordlat'] ? formData['gpscordlat'] : 'NA';
    formData['gpscordlong'] = formData['gpscordlong'] ? formData['gpscordlong'] : 'NA';
    formData['ownhcfid'] = ownerHcfSelect == "Any Other" ? (formData['sltother'] ? formData['sltother'] : '0') : (formData['ownhcfid'] ? formData['ownhcfid'] : '0');
    formData['stsauth'] = formData['stsauth'] ? formData['stsauth'] : 'NA';
    formData['dt_exp'] = formData['dt_exp'] ? formData['dt_exp'] : '0';
    formData['authdt_exp'] = formData['authdt_exp'] ? formData['dt_exp'] : '0';
    formData['licdt_exp'] = formData['licdt_exp'] ? formData['licdt_exp'] : '0';
    formData['nobd'] = formData['nobd'] ? formData['nobd'] : '0';
    formData['licno'] = formData['licno'] ? formData['licno'] : '0';
    formData['nonbdid'] = formData['nonbdid'] ? formData['nonbdid'] : '0';
    formData['nonbd'] = formData['nonbd'] ? formData['nonbd'] : '';
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
    formData['recyclered'] = formData['recyclered'] ? formData['recyclered'] : '0';
    formData['recycleblue'] = formData['recycleblue'] ? formData['recycleblue'] : '0';
    formData['noveh'] = formData['noveh'] ? formData['noveh'] : '0';
    formData['incireash'] = formData['incireash'] ? formData['incireash'] : '0';

    formData['incireashdispo'] = formData['incireashdispo'] ? formData['incireashdispo'] : '0';
    // formData['ash'] = formData['ash'] ? formData['ash'] : '0';
    // formData['ashdispo'] = formData['ashdispo'] ? formData['ashdispo'] : '0';
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
    formData['stdairmet'] = formData['stdairmet'] ? formData['stdairmet'] : 'NA';
    formData['onlemi'] = formData['onlemi'] ? formData['onlemi'] : 'NA';
    formData['liqwst'] = formData['liqwst'] ? formData['liqwst'] : 'NA';
    formData['disimth'] = formData['disimth'] ? formData['disimth'] : 'NA';
    formData['othrinfo'] = formData['othrinfo'] ? formData['othrinfo'] : 'NA';
    formData['capcbwtf'] = formData['capcbwtf'] ? formData['capcbwtf'] : 'NA';
    formData['docfiles'] = fileData ? fileData : [];
    formData['docfiles_mom'] = momFileData ? momFileData : [];

    return nrjAxiosRequestBio("AR_filing", formData);

  };

  const svdQry = (data: any) => {
    // refetchW();
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    let dt: any = GetResponseLnx(data);
    if (dt.status == 'Success') {
      showToaster([dt.message], 'success')
    }
    else {
      showToaster([dt.message], 'error')
    }
  }

  const { showToaster, hideToaster } = useToaster();

  const { data, refetch } = useQuery({
    queryKey: ['svQry', state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  })

  useEffectOnce(() => {
    // refetchHcfData();
  })

  const clrFunct = () => {
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    // setTimeout(() => {
    //     dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    // }, 300)
  }

  useEffectOnce(() => {
    nonBeeded();
  })
  const nonBeeded = () => {

    let i: number = 0;
    let nonBedded: string = "";

    let ary: any = [{ id: 1, ctg: 'Clinic' }, { id: 2, ctg: 'Pathology Laboratory' }, { id: 3, ctg: 'Nursing Home' }, { id: 4, ctg: 'Blood Bank' },
    { id: 5, ctg: 'Dispensary' }, { id: 6, ctg: 'Animal House' }, { id: 7, ctg: 'Veterinary Hospital' }, { id: 8, ctg: 'Dental Hospital' },
    { id: 9, ctg: 'Institutions / Schools / Companies etc With first Aid Facilitites' }, { id: 10, ctg: 'Health Camp' },
    { id: 11, ctg: 'Homeopathy Hospital' }, { id: 12, ctg: 'Mobile Hospital' }, { id: 13, ctg: 'Siddha' }, { id: 14, ctg: 'Unani' },
    { id: 15, ctg: 'Yoga' }];
    let uniqueAry = new Map();

    if (Array.isArray(ary)) {
      ary.forEach((element: any) => {
        uniqueAry.set(element.id, element);
      });

      uniqueAry.forEach((value: any, keys: any) => {
        if (nonBedded) {
          nonBedded += "$^";
        }
        nonBedded += "id][" + value["id"] + "=";
        nonBedded += "txt][" + value["ctg"];
      })

      while (i < uniqueAry?.entries.length) {
        i += 1;
      }
    }
    dispatch({ type: ACTIONS.SETNONBEDDED, payload: nonBedded });
    return;

  };

  useEffectOnce(() => {
    let value1 = new Date()
    // setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}`)
    setGovernmentCombo("id][1=txt][Government$^id][2=txt][Private$^id][3=txt][SemiGovernment$^id][4=txt][Any Other")
  })

  const [hcfData, setHcfData] = useState<any>()
  useEffectOnce(() => {
    if (!isHcfLogin) {
      setHcfData(sessionStorage.getItem('hcfAnnlRpt'))
    } else {
      refetchB()
    }
  })
  const GetData = () => {

    let cmpid = getCmpId() || "";
    let usrnm = getUsrnm() || "";
    let what = 'hcf_mr';
    let userLoginDetails: any = localStorage.getItem('hcflogindetails')
    let data = JSON.parse(userLoginDetails);
    console.log(data.data['hcfnm'], "&&&&7")
    console.log("&&&&7", month)
    // dispatch({ type: ACTIONS.FORM_DATA, payload: `hcfnm][${data.data['hcfnm']}` })
    if (month) {
      let payload: any = postLinux(month + '=' + usrnm + '=' + cmpid + '=' + what, 'get_AR_filing');
      return nrjAxiosRequestBio("get_AR_filing", payload);
    }

  };

  const ShowData = (data: any) => {
    if (data.data.status === 'Failed') {
      clrFunct()
      let userLoginDetails: any = localStorage.getItem('hcflogindetails')
      let data_loc = JSON.parse(userLoginDetails);
      if (data && data.data && data.data['hcfnm']) {
        if (data.data['hcfnm'] == 'undefined') {
          data.data['hcfnm'] = data_loc.data['hcfnm']
        }
      } else {
        data.data['hcfnm'] = data_loc.data['hcfnm']
      }
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_month][${month}=dt_month][${month}=hcfnm][${data.data['hcfnm']}` })

      // console.log("showData before time",month)
      // setTimeout(() => {
      //   console.log("showData After time",month)
      //   dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_month][${month}=dt_month][${month}=hcfnm][${data.data['hcfnm']}` })
      // }, 500)

    } else if (hcfData) {
      let textDts = convertFldValuesToString(hcfData);
      setFormData(textDts)
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: textDts });
    } else {
      let textDts = convertFldValuesToString(data.data);
      if (data.docfiles) {
        setShowPdfFile(data.data.docfiles)

      } else if (data.docfiles_mom) {
        setShowMomPdfFile(data.data.docfiles_mom)
      }
      else {
        setShowPdfFile([])
        setShowMomPdfFile([])
      }
      setFormData(textDts)
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: textDts });
    }
  }

  const { data: datab, refetch: refetchB } = useQuery({
    queryKey: ["getQryHcf", month],
    queryFn: GetData,
    enabled: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });
  useEffectOnce(() => {

    let userLoginDetails: any = localStorage.getItem('hcflogindetails')
    let data = JSON.parse(userLoginDetails);
    if (data) {
      dispatch({ type: ACTIONS.FORM_DATA, payload: `hcfnm][${data.data['hcfnm']}` })
    }
  })

  // const [open, setOpen] = useState<any>();
  // function handleDropdownOpen() {
  //     setOpen(true);
  // }

  // function handleScroll() {
  //     setOpen(false);
  //     if (handleDropdownOpen) {
  //         handleDropdownOpen()
  //     }
  // }


  const Seperator = (props: any) => {
    return (
      <>
        <div className="mt-7">
          <div className="font-semibold" style={{ color: '#86c6d9' }}>
            {/* <div className="font-semibold" style={{ color: '#009ED6' }}> */}
            {props.heading}
          </div>
          <div className="mt-2" style={{ border: '1px solid #86c6d9' }}>
          </div>
        </div>
      </>
    )
  }

  // rgb(253 249 249 / 45%);

  return (
    <>
      <div className={`${isHcfLogin ? 'overflow-y-auto h-screen bg-white' : 'bg-white'}`}>
        {isHcfLogin ? <>
          <HcfHeader></HcfHeader>
        </> : <>
        </>

        }
        <div className='px-3 pb-10 '>
          <div className="mx-7">
            <h6 className="text-[14px] mt-2" style={{ color: 'rgb(2 1 15 / 50%)' }}>To be submitted to the prescribed authority on or before 30th
              june every year for the period from January
              to December of the preceding year, by the occupier of health care facility (HCF)</h6>

            <div className="rounded" >

              <div className="mb-4">
                {/* <Seperator heading="Select year"></Seperator> */}
                <div className=" mt-4 grid grid-cols-3 gap-x-8 gap-y-4">
                  <div className='w-9/12'>
                    {/* <WtrRsSelect
                                        Label="Select Month"
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
                    ></NrjRsDt>
                  </div>
                </div>
              </div>

              <div className="mx-7">
                <Seperator heading="Particulars of Occupier"></Seperator>

                <table className="table table-bordered min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="py-3 bg-gray-100">
                      <th className="border p-3" scope="col">S. No.</th>
                      <th className="border p-3" scope="col">Particulars</th>
                      <th className="border p-3" scope="col">Details</th>
                    </tr>

                  </thead>
                  <WtrInput
                    displayFormat={"4"}
                    sNo={"1.1"}
                    Label="Name of Authorized Person"
                    fldName="authnm"
                    idText="txtauthnm"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    unblockSpecialChars={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Name of Authorized Person"}
                    delayClose={1000}
                    placement="right"
                    ClssName=""
                  ></WtrInput>
                  <WtrInput
                    displayFormat={"4"}
                    sNo={"1.2"}
                    Label="Name of HCF"
                    fldName="hcfnm"
                    idText="txthcfnm"
                    onChange={onChangeDts}
                    dsabld={true}
                    callFnFocus=""
                    dsbKey={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Name of HCF"}
                    delayClose={1000}
                    placement="right"
                    ClssName=""
                  ></WtrInput>
                  <WtrInput
                    displayFormat={"4"}
                    sNo={"1.3"}
                    Label="Address for Correspondence"
                    fldName="addc"
                    idText="txtaddc"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    speaker={"Address for Correspondence"}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                  ></WtrInput>

                  <WtrInput
                    displayFormat={"4"}
                    sNo={"1.4"}
                    Label="Address of Facility"
                    fldName="addf"
                    idText="txtaddf"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}
                    // validateFn="1[length]"
                    allowNumber={false}
                    unblockSpecialChars={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Address of Facility"}
                    delayClose={1000}
                    placement="right"
                    ClssName=""
                  ></WtrInput>

                  <WtrInput
                    displayFormat={"4"}
                    sNo={"1.5"}
                    Label="URL of Website "
                    fldName="urlweb"
                    idText="txturlweb"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}
                    minValue={-1}
                    validateFn="1[length]"
                    unblockSpecialChars={true}
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    delayClose={1000}
                  // speaker={"URL of Website"}
                  ></WtrInput>
                  <WtrInput
                    displayFormat={"4"}
                    sNo={"1.6"}
                    Label="GPS coordinates of HCF (latitude) In Decimal"
                    fldName="gpscordlat"
                    idText="txtgpscordlat"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}
                    minValue={-1}
                    validateFn="1[length]"
                    allowNumber={true}
                    allowDecimal={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    delayClose={1000}
                    speaker={"GPS coordinates of HCF In Decimal"}
                  ></WtrInput>
                  <WtrInput
                    displayFormat={"4"}
                    sNo={"1.7"}
                    Label="GPS coordinates of HCF (longitude) In Decimal"
                    fldName="gpscordlong"
                    idText="txtgpscordlong"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}
                    minValue={-1}
                    validateFn="1[length]"
                    allowNumber={true}
                    allowDecimal={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    delayClose={1000}
                    speaker={"GPS coordinates of HCF In Decimal"}
                  ></WtrInput>
                  <WtrInput
                    displayFormat={"4"}
                    sNo={"1.8"}
                    Label="Tel. No"
                    fldName="telno"
                    idText="txttelno"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}
                    minValue={-1}
                    validateFn="[mob]"
                    allowNumber={true}
                    ToolTip="Enter numbers only"
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    delayClose={1000}
                    speaker={"Enter valid Tel. No"}
                  ></WtrInput>
                  <WtrInput
                    displayFormat={"4"}
                    sNo={"1.9"}
                    Label="Fax. No"
                    fldName="fxno"
                    idText="txtfxno"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}
                    minValue={-1}
                    validateFn="1[length]"
                    allowNumber={true}
                    ToolTip="Enter numbers only"
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    delayClose={1000}
                  // speaker={"Enter valid Fax No"}
                  ></WtrInput>
                  <WtrInput
                    displayFormat={"4"}
                    sNo={"1.10"}
                    Label="E-mail ID "
                    fldName="eml"
                    idText="txteml"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}
                    minValue={-1}
                    validateFn="[email]"
                    unblockSpecialChars={true}
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    delayClose={1000}
                    speaker={"Enter E-mail ID"}
                  ></WtrInput>
                  <tr>
                    <td className="border px-3 py-2">1.11</td>
                    <td className="border px-3 py-2">Ownership of HCF<span className="text-red-600">*</span></td>
                    <td className="border px-3 py-2">
                      <WtrRsSelect
                        displayFormat={"1"}
                        Label=""
                        fldName="ownhcfid"
                        idText="txtownhcfid"
                        onChange={onChangeDts}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        fnctCall={false}
                        dbCon={"nodb"}
                        typr={""}
                        dllName={""}
                        fnctName={""}
                        parms={""}
                        allwSrch={true}
                        speaker={""}
                        loadOnDemand={governmentCombo}
                        delayClose={1000}
                        allwZero={"1"}
                        disable={!isHcfLogin}
                      ></WtrRsSelect>
                      {ownerHcfSelect == 'Any Other' ? <WtrInput
                        displayFormat={"1"}
                        sNo={""}
                        Label=""
                        fldName="sltother"
                        idText="txtother"
                        onChange={onChangeDts}
                        dsabld={!isHcfLogin}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        unblockSpecialChars={true}
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        speaker={""}
                      ></WtrInput> : <></>}
                    </td>

                  </tr>

                  <tr>
                    <td className='border px-3'>1.12</td>
                    <td className='border px-3'>Status of Authorization under <span className="text-red-600">*</span> </td>
                    <td className='border px-3'>
                      <tr>
                        <WtrInput
                          displayFormat="1"
                          Label="Authorization No"
                          fldName="stsauth"
                          idText="txtstsauth"
                          onChange={onChangeDts}
                          dsabld={!isHcfLogin}
                          callFnFocus=""
                          dsbKey={false}
                          minValue={-1}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          speaker='Enter Valid Authorization No.'
                        ></WtrInput>
                      </tr>
                      <tr>
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
                      </tr>

                    </td>
                  </tr>
                  <tr>
                    <td className='border px-3'>1.13</td>
                    <td className='border px-3'>Status of Consents under Water Act and Air Act <span className="text-red-600">*</span></td>
                    <td className='border px-3'> <NrjRsDt
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

                </table>

                <Seperator heading="Type of Health Care Facility"></Seperator>

                <table className="table table-bordered min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr className="py-3 bg-gray-100">
                      <th className="border p-3" scope="col">S. No.</th>
                      <th className="border p-3" scope="col">Particulars</th>
                      <th className="border p-3" scope="col">Details</th>
                    </tr>

                  </thead>
                  <WtrInput
                    displayFormat={"4"}
                    sNo={"2.1"}
                    Label="No. of Beds"
                    fldName="nobd"
                    idText="txtnobd"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}

                    validateFn="1[length]"
                    allowNumber={true}
                    unblockSpecialChars={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"No. of Beds"}
                  ></WtrInput>
                  <tr>
                    <td className='border px-3 py-2'>2.2</td>
                    <td className='border px-3'>Non-bedded health care facility</td>
                    <td className='border px-3'>
                      <WtrRsSelect
                        displayFormat={"1"}
                        Label=""
                        fldName="nonbdid"
                        idText="txtnonbdid"
                        onChange={onChangeDts}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        allwZero={"1"}
                        fnctCall={false}
                        dbCon={""}
                        typr={""}
                        dllName={""}
                        fnctName={""}
                        loadOnDemand={state.nonBedded}
                        parms={""}
                        allwSrch={true}
                        // speaker={"Non-bedded health care facility"}
                        delayClose={1000}
                        disable={!isHcfLogin}
                      ></WtrRsSelect></td>
                  </tr>

                  <WtrInput
                    displayFormat={"4"}
                    sNo={"2.3"}
                    Label="License number"
                    fldName="licno"
                    idText="txtlicno"
                    onChange={onChangeDts}
                    dsabld={!isHcfLogin}
                    callFnFocus=""
                    dsbKey={false}
                    validateFn=""
                    allowNumber={false}
                    unblockSpecialChars={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker='License number '
                  ></WtrInput>
                  <tr>
                    <td className="border px-3 py-2">2.4</td>
                    <td className="border px-3">Date of Expiry</td>
                    <td className="border px-3"> <NrjRsDt
                      format="dd-MMM-yyyy"
                      fldName="licdt_exp"
                      displayFormat='1'
                      idText="txtlicdt_exp"
                      size="lg"
                      Label="Date of Expiry"
                      selectedValue={state.frmData}
                      onChange={onChangeDts}
                      speaker={"Date of Expiry"}
                    ></NrjRsDt></td>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border px-3  py-1">3</th>
                    <th className="border px-3  text-left">Quantity of waste generated or disposed in Kg/day (on monthly average basis) </th>
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
                        dsabld={!isHcfLogin}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Yellow Category"
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
                        dsabld={!isHcfLogin}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Red Category"
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
                        dsabld={!isHcfLogin}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="White Category"
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
                        dsabld={!isHcfLogin}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Blue Category"

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
                        dsabld={!isHcfLogin}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="General Solid waste"
                      // speaker={"Enter No of Beds"}
                      ></WtrInput></td>

                  </tr>



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
                          dsabld={false}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput>
                      </tr>
                      <tr className=" px-3">
                        <WtrInput
                          displayFormat="1"
                          Label="Capacity (kg)"
                          fldName="cap"
                          idText="txtcap"
                          onChange={onChangeDts}
                          dsabld={false}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          allowDecimal={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
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
                          dsabld={false}
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
                  <tr className="bg-gray-50">
                    <th className="border px-3  py-3"></th>
                    <th className="border px-3  text-left"> Captive Treatment
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
                            dsabld={returnDisabled()}
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
                          dsabld={returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="incanm"
                            idText="txtincanm"
                            onChange={onChangeDts}
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled()}
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
                          dsabld={returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="plaanm"
                            idText="txtplaanm"
                            onChange={onChangeDts}
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled()}
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
                          dsabld={returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="autoclanm"
                            idText="txtautoclnm"
                            onChange={onChangeDts}
                            dsabld={returnDisabled()}
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
                            fldName="inc"
                            idText="txtinc"
                            onChange={onChangeDts}
                            dsabld={returnDisabled()}
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
                          dsabld={returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="incanm"
                            idText="txtincanm"
                            onChange={onChangeDts}
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled()}
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
                          dsabld={returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="hydranm"
                            idText="txthydranm"
                            onChange={onChangeDts}
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled() || !captiveValue}
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
                          dsabld={returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="shranm"
                            idText="txtshranm"
                            onChange={onChangeDts}
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled() || !captiveValue}
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
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled()}
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
                          dsabld={returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                        <td className="px-3 w-3/12">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="deepanm"
                            idText="txtdeepanm"
                            onChange={onChangeDts}
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled()}
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
                            dsabld={returnDisabled()}
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
                          dsabld={returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                        <td className="px-3 w-3/12 text-center">
                          <WtrInput
                            displayFormat="1"
                            Label=""
                            fldName="anyothranm"
                            idText="txtanyothranm"
                            onChange={onChangeDts}
                            dsabld={returnDisabled()}
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
                      </tr>
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-3">4.3</td>
                    <td className="border px-3">Quantity of recyclable wastes
                      sold to authorized recyclers after
                      treatment in Kg/day.</td>
                    {/* <td className="border px-3">
                                       
                                            <WtrInput
                                                displayFormat="1"
                                                Label="Red Category (like plastic)"
                                                fldName="recyclered"
                                                idText="txtsize"
                                                onChange={onChangeDts}
                                                dsabld={false}
                                                callFnFocus=""
                                                dsbKey={false}
                                                validateFn="1[length]"
                                                allowNumber={true}
                                                allowDecimal={true}
                                                selectedValue={state.frmData}
                                                clrFnct={state.trigger}
                                                delayClose={1000}
                                                placement="right"
                                                ClssName=""
                                                placeholder="Red Category (like plastic)"
                                            ></WtrInput>
                                            </td>
                                       
                                        <td className="border px-3">
                                            <WtrInput
                                                displayFormat="1"
                                                Label="Blue Category (like glass)"
                                                fldName="recyleblue"
                                                idText="txtcap"
                                                onChange={onChangeDts}
                                                dsabld={false}
                                                callFnFocus=""
                                                dsbKey={false}
                                                validateFn="1[length]"
                                                allowNumber={true}
                                                selectedValue={state.frmData}
                                                clrFnct={state.trigger}
                                                delayClose={1000}
                                                placement="right"
                                                ClssName=""
                                                placeholder="Blue Category (like glass)"
                                            ></WtrInput>
                                        </td> */}

                    <td className="border px-3">

                      <WtrInput
                        displayFormat="1"
                        Label="Red Category (like plastic)"
                        fldName="recyclered"
                        idText="txtred"
                        onChange={onChangeDts}
                        dsabld={false}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Red Category (like plastic)"
                      ></WtrInput>


                      <WtrInput
                        displayFormat="1"
                        Label="Blue Category (like glass)"
                        fldName="recyleblue"
                        idText="txtblue"
                        onChange={onChangeDts}
                        dsabld={false}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Blue Category (like glass)"
                      ></WtrInput>

                    </td>


                  </tr>

                  {/* <tr>
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
                        dsabld={returnDisabled()}
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
                  </tr> */}
                  <tr>
                    <td className="border px-3">4.4</td>
                    <td className="border px-3">Details of incineration ash and
                      ETP sludge generated and disposed
                      during the treatment of wastes in Kg/annum </td>
                    <td className="border px-3">
                      <tr>
                        <td className="px-3"></td>
                        <td className="px-3">Quantity generated (kg/day)</td>
                        <td className="px-3">Where disposed</td>
                      </tr>
                      <tr>
                        <td className="px-3">Incineration Ash</td>
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="incireash"
                          idText="txtincireash"
                          onChange={onChangeDts}
                          dsabld={returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="incireashdispo"
                          idText="txtincire"
                          onChange={onChangeDts}
                          dsabld={returnDisabled()}
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
                          dsabld={returnDisabled()}
                          callFnFocus=""
                          dsbKey={false}
                          validateFn="1[length]"
                          allowNumber={true}
                          selectedValue={state.frmData}
                          clrFnct={state.trigger}
                          delayClose={1000}
                          placement="right"
                          ClssName=""
                        ></WtrInput></td>
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="ashdispo"
                          idText="txtash"
                          onChange={onChangeDts}
                          dsabld={returnDisabled()}
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
                        <td className="px-3">ETP Sludge</td>
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="etpsl"
                          idText="txtetpsl"
                          onChange={onChangeDts}
                          dsabld={returnDisabled()}
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
                        <td className="px-3"><WtrInput
                          displayFormat="1"
                          Label=""
                          fldName="etpsldispo"
                          idText="txtetpsl"
                          onChange={onChangeDts}
                          dsabld={returnDisabled()}
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
                    <td className="border px-3">4.5</td>
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
                        dsabld={returnDisabled()}
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
                  {/* <tr>
                    <td className="border px-3">4.6</td>
                    <td className="border px-3">List of member HCF not handed
                      over bio-medical waste.</td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="lsthcf"
                        idText="txtlsthcf"
                        onChange={onChangeDts}
                        dsabld={returnDisabled()}
                        unblockSpecialChars={true}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="List of member HCF not handed
                  over bio-medical waste."
                      // speaker={"Enter No of Beds"}
                      ></WtrInput></td>
                  </tr> */}

                  {/* ************************************************************************** */}

                  <tr>
                    <td className="border px-3">4.6</td>
                    <td className="border px-3">Do you have bio-medical waste
                      management committee? If yes, attach
                      minutes of the meetings held during
                      the reporting period
                    </td>
                    {/* <td className="border px-3">

                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="infobio"
                        idText="txtinfobio"
                        onChange={onChangeDts}
                        dsabld={!isHcfLogin}
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
                    
                      ></WtrInput>
                    </td> */}
                    {/* attached pdf mom */}

                    <td className="border px-3">
                      <div className="flex justify-between"> {/* Container div with flex justify-between */}
                        <div style={{ flex: 1 }}> {/* First div */}
                          <WtrInput
                            displayFormat="2"
                            Label=""
                            fldName="infobio"
                            idText="txtinfobio"
                            onChange={onChangeDts}
                            dsabld={!isHcfLogin}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={false}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="left"
                            ClssName=""
                            placeholder="Do you have bio-medical waste
                  management committee? If yes, attach
                  minutes of the meetings held during
                  the reporting period"
                          ></WtrInput>
                        </div>
                        <div style={{ flex: 1 }}> {/* Second div */}
                          {isHcfLogin == true ? (
                            <div style={{ marginTop: '5px' }}>
                              {showMomPdfFile.length == 0 && <input type="file" name='docfiles' onChange={handleMomFileChange} multiple />}
                              {momPdfError && <p style={{ color: 'red' }}>{momPdfError}</p>}
                              {momFiles.length > 0 && (
                                <div>
                                  {momFiles.map((file, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                      <span className="mr-2">{file.fileName}</span>
                                      <button
                                        className="px-2 py-1 rounded-md border border-red-500 bg-red-200 text-red-500 text-xs hover:bg-red-500 hover:text-white hover:shadow-md"
                                        onClick={() => handleDeleteMomFile(index)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {showMomPdfFile.length == 0 && <div style={{ marginTop: '5px' }}>
                                <button className="px-4 py-2 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-500 text-sm hover:-translate-y-1 transform transition duration-200 hover:shadow-md" onClick={handleUploadMomFile} disabled={files.filter(file => file.fileName.endsWith('.pdf')).length === 0}>
                                  Upload
                                </button>
                              </div>}
                              {showMomPdfFile.length > 0 && showMomPdfFile.map((file: any, index) =>
                                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                  <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                                  <a
                                    href="#"
                                    onClick={() => handleShowPdfClick(file.doc_path)}
                                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                                  >
                                    {file.flnm}
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              {showMomPdfFile.length > 0 && showMomPdfFile.map((file: any, index) =>
                                file == 'flnm_mom' ? (
                                  <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {/* Adjust width, height, and margin as needed */}
                                    <a
                                      href="#"
                                      onClick={() => handleShowPdfClick(file.doc_path)}
                                      style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                      {file.flnm}
                                    </a>
                                  </div>
                                ) : <p>No file</p>)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                  </tr>

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
                        dsabld={!isHcfLogin}
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
                        dsabld={!isHcfLogin}
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
                        dsabld={!isHcfLogin}
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
                        dsabld={!isHcfLogin}
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
                        dsabld={!isHcfLogin}
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
                        dsabld={!isHcfLogin}
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
                        dsabld={!isHcfLogin}
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
                        dsabld={!isHcfLogin}
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
                    <td className="border px-3">Remedial Action taken (Please attach details if any) </td>
                    <td className="border px-3">
                      <div className="flex justify-between"> {/* Container div with flex justify-between */}
                        <div style={{ flex: 1 }}> {/* First div */}
                          <WtrInput
                            displayFormat="2"
                            Label=""
                            fldName="remedial"
                            idText="txt_remedial"
                            onChange={onChangeDts}
                            dsabld={!isHcfLogin}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={false}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            delayClose={1000}
                            placement="left"
                            ClssName=""
                            placeholder="Number of the persons affected (Please attach details if any) "
                          ></WtrInput>
                        </div>
                        <div style={{ flex: 1 }}> {/* Second div */}
                          {isHcfLogin == true && showPdfFile.length == 0 ? (
                            <div style={{ marginTop: '5px' }}>
                              <input type="file" name='docfiles' onChange={handleFileChange} multiple />
                              {error && <p style={{ color: 'red' }}>{error}</p>}
                              {files.length > 0 && (
                                <div>
                                  {files.map((file, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                      <span className="mr-2">{file.fileName}</span>
                                      <button
                                        className="px-2 py-1 rounded-md border border-red-500 bg-red-200 text-red-500 text-xs hover:bg-red-500 hover:text-white hover:shadow-md"
                                        onClick={() => handleDeleteFile(index)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div style={{ marginTop: '5px' }}>
                                <button className="px-4 py-2 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-500 text-sm hover:-translate-y-1 transform transition duration-200 hover:shadow-md" onClick={handleUpload} disabled={files.filter(file => file.fileName.endsWith('.pdf')).length === 0}>
                                  Upload
                                </button>
                              </div>
                              {showPdfFile.map((file: any, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                  <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {/* Adjust width, height, and margin as needed */}
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
                          ) : (
                            <div>
                              {showPdfFile.map((file: any, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                  <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {/* Adjust width, height, and margin as needed */}
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
                          )}
                        </div>
                      </div>
                    </td>
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
                        dsabld={!isHcfLogin}
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
                    <td className="border px-3">7</td>
                    <td className="border px-3">Are you meeting the standards of air Pollution from the incinerator?
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="stdair"
                        idText="txtstdair"
                        onChange={onChangeDts}
                        dsabld={returnDisabled()}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Are you meeting the standards of air Pollution from the incinerator?"
                      // speaker={"Enter No of Beds"}
                      ></WtrInput></td>

                  </tr>

                  <tr>
                    <td className="border px-3">7.1</td>
                    <td className="border px-3">How many times in last year could not  the standards?
                    </td>
                    <td className="border px-3">
                      <WtrInput
                        displayFormat="1"
                        Label=""
                        fldName="stdairmet"
                        idText="txtstdairmet"
                        onChange={onChangeDts}
                        dsabld={returnDisabled()}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="How many times in last year could not met the standards?"
                      // speaker={"Enter No of Beds"}
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
                        dsabld={!isHcfLogin}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        placeholder="Details of Continuous online emission
                  monitoring systems installed"
                        // speaker={"Enter No of Beds"}
                        unblockSpecialChars={true}
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
                        dsabld={!isHcfLogin}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
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
                        dsabld={!isHcfLogin}
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
                        dsabld={!isHcfLogin}
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

                </table>

              </div>
              {isHcfLogin ? <>

                <div className="mr-4 flex justify-center mt-8">
                  <Button
                    size="medium"
                    style={{ backgroundColor: "#34c3ff", textTransform: "none"}}
                    variant="contained"
                    color="success"
                    // disabled={false}
                    startIcon={<SaveIcon />}
                    onClick={SaveClick}>
                    Submit
                  </Button>
                </div>
              </> : <></>}
            </div>
          </div>
        </div>
      </div>
    </>

  );
}

export default React.memo(HcfMonthlyreport);

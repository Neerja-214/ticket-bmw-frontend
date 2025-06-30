import React, { useEffect, useReducer, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseWnds, convertFldValuesToJson, convertFldValuesToString, createGetApi, dataStr_ToArray, getCmpId, getUsrId, postLnxSrvr, svLnxSrvr, tellWndsServer, tellWndsServer2, GetResponseLnx, getUsrnm, postLinux, capitalizeTerms } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";

import { nrjAxios, nrjAxiosRequest, useNrjAxios, nrjAxiosRequestBio } from '../../Hooks/useNrjAxios';
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
import PdfIcon from '../../images/pdf-svgrepo-com.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';


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

interface FileData {
    flnm: string;
    flst: string;
}


const HCFMaster = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    console.log(state)
    const [gid, setGid] = useState('')
    const [showMessage, setShowMessage] = useState<any>({ message: [] })
    const hcfLoginId = true;
    const [hcfTypeSelect, setHcfTypeSelect] = useState(false)
    const [consentLabel, setConsentLabel] = useState<string>("")
    const [consentVldfrmLabel, setConsenVldfrmtLabel] = useState<string>("Consent valid from")
    const [consentVldtoLabel, setConsenVldtotLabel] = useState<string>("Consent valid upto")
    const reqFlds = [
        { fld: 'hcfnm', msg: 'Select the Hospital / Lab', chck: '1[length]' },
        { fld: 'labelno', msg: 'Enter Label Number', chck: '1[length]' },
        { fld: 'addra', chck: '1[length]', msg: 'Enter Address I' },
        { fld: 'cty', chck: '1[length]', msg: 'Enter City' },
        { fld: 'stt', chck: '1[length]', msg: 'Enter State' },
        { fld: 'nobd', chck: '1[length]', msg: 'Enter No of Beds' },
        // { fld: 'ctg', chck: '1[length]', msg: 'Select Category' },
        { fld: 'pnc', chck: '6[length]', msg: 'Enter Pin Code' },
        { fld: 'hcfcod', chck: '5[length]', msg: 'Enter Pollution Board No' },
        { fld: 'cntprsn', chck: '5[length]', msg: 'Enter Contact person' },
        // { fld: 'ppl', chck: '1[length]', msg: 'Enter Entity' },
        { fld: 'mob', chck: '[mob]', msg: 'Enter Mobile' },
        { fld: 'phn', chck: '[mob]', msg: 'Enter Phone' },
        { fld: 'eml', chck: '[email]', msg: 'Enter E Mail' },
        // { fld: 'psw', chck: '[psw]', msg: 'Enter Password' },
        { fld: 'consent_no', chck: '1[length]', msg: 'Enter Consent number' },
    ];

    const reqFlds1 = [
        // { fld: 'psw', chck: '[psw]', msg: 'Enter Password' },
        { fld: 'consent_no', chck: '1[length]', msg: 'Enter Consent number' },
    ];

    const getGid = () => {
        let g: any = utilities(3, "", "");
        dispatch({ type: ACTIONS.SETGID, payload: g });
        return g;
    };


    function returnNumberOfBedDisabled() {
        let disabeled: boolean = false
        if (hcfTypeSelect) {
            disabeled = false
        } else {
            disabeled = true
            return disabeled
        }
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
        { id: 15, ctg: 'Yoga' }, { id: 16, ctg: 'Bedded Hospital' }];
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


    const [loadOnDemand, setLoadOnDemand] = useState("")
    useEffectOnce(() => {

        setLoadOnDemand("id][1=txt][Government$^id][2=txt][Private$^id][3=txt][SemiGovernment$^id][4=txt][Any Other")
    },)


    const onChangeDts = (data: string) => {
        let fld: any = utilities(2, data, "");
        if (fld == 'hcftypid') {
            let hcfType = (getFldValue(data, 'hcftypid').split('|')[1])
            if ((hcfType !== 'Bedded Hospital') && (hcfType !== 'Nursing Home')) {
                setConsentLabel("Authorization Number")
                setConsenVldfrmtLabel("Authorisation valid from")
                setConsenVldtotLabel("Authorisation valid up to")
                setHcfTypeSelect(false)
                dispatch({ type: ACTIONS.SETFORM_DATA, payload: `nobd][0` });
            } else {
                setHcfTypeSelect(true)
                setConsentLabel("Consent number")
                setConsenVldfrmtLabel("Consent valid from")
                setConsenVldtotLabel("Consent valid up to")
            }

        }
        if (fld == 'nobd') {
            let nobd = getFldValue(data, 'nobd')
            if (Number(nobd) < 30) {
                setConsentLabel("Authorization Number")
                setConsenVldfrmtLabel("Authorisation valid from")
                setConsenVldtotLabel("Authorisation valid up to")

            } else {
                setConsentLabel("Consent number")
                setConsenVldfrmtLabel("Consent valid from")
                setConsenVldtotLabel("Consent valid up to")

            }
        }
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const [hcfLoginDetails, setHcfLoginDetails] = useState<any>()
    const [hcfConsentDetails, setConsentLoginDetails] = useState<any>()
    const [pdfError, setPdfError] = useState('')
    const [fileData, setFileData] = useState<{ flnm: string, flst: string }[]>([]);
    const [hcfName, setHcfName] = useState<string>("")

    const [consentNumber, setConsentNumber] = useState<string>("")
    const [hcfId, setHcfId] = useState<string>("")
    const [consentdisbld, setConstDisbld] = useState<boolean>(false)
    const [showConsentFilePath, setShowConsentPdfFilePath] = useState([])
    const [showConsentFileName, setShowConsentPdfFileName] = useState([])


    const [consentFromDt, setConsentFromDt] = useState<string>("")
    const [consentToDt, setConsentToDt] = useState<string>("")


    // const HandleUpdateClick = async () => {
    //     let api: string = state.textDts;
    //     let cmpid = getCmpId() || "";
    //     let usernm = getUsrnm() || "";
    //     let hcfid = hcfId ? hcfId : ''
    //     let consent_no = getFldValue(api, 'consent_no')
    //     let consent_files = ''
    //     let payload: any = postLinux(cmpid + '=' + usernm + '=' + hcfid + '=' + consent_no + '=' + consent_files, 'hcf_consent_update');
    //     payload['consent_files'] = fileData ? fileData : [];
    //     return nrjAxiosRequestBio("update_hcf_consent", payload);

    // };


    const handleConsent = (e: any) => {
        setConsentNumber(e.target.value)
    }

    const HandleValidateConsentClick = async () => {
        let api: string = state.textDts;
        let cmpid = getCmpId() || "";
        let usernm = getUsrnm() || "";
        let hcfid = hcfId ? hcfId : ''
        let consent_no = consentNumber ? consentNumber : ''
        let consent_files = ''
        let payload: any = postLinux(cmpid + '=' + usernm + '=' + hcfid + '=' + consent_no + '=' + consent_files, 'hcf_consent_update');
        payload['consent_files'] = fileData ? fileData : [];
        return nrjAxiosRequestBio("update_hcf_consent", payload);
    };

    // const svdQry = (data: any) => {
    //     refetchW();
    // }
    // const svdQry = (data: any) => {
    //     console.log(data)
    //     // refetchW();
    //     dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    //     let dt: any = GetResponseLnx(data)
    //     if (dt.status == 'Success') {
    //         showToaster([dt.message], 'success');
    //     }
    //     else {
    //         showToaster([dt.message], 'error')
    //     }
    // }

    const svdValidate = (dataC: any) => {

        // refetchW();
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
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
            setConsentFromDt(dt.dt_app ? dt.dt_app : '')
            setConsentToDt(dt.dt_exp ? dt.dt_exp : '')
            // dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_app][${dt.dt_app}=dt_exp][${dt.dt_exp}` })
            setConstDisbld(true)
            setFileData([])
            // setTimeout(() => {
            //     refetchHcfData();
            // },100)

        }
        else {
            showToaster([dt.message], 'error')
            // setConsentFromDt('')
            // setConsentToDt('')
            setShowConsentPdfFilePath([])
            setShowConsentPdfFileName([])
            // setConsentNumber('')
        }
    }


    const duplicateMobile = () => {
        let mobileNo: string = getFldValue(state.textDts, 'phn')
        let api: string = createGetApi("db=nodb|dll=hospdll|fnct=bx", 'stt1082=0=' + mobileNo);
        return nrjAxios({ apiCall: api });
    }
    const { showToaster, hideToaster } = useToaster();
    // const duplicateMobileSuccess = (data: any) => {
    //     let dt: string = GetResponseWnds(data);
    //     if (dt) {
    //         if (dt.includes('id][') && getFldValue(dt, 'id')) {
    //             showToaster(['Duplicate Mobile No, Found another Hospital with same Mobile Number'], 'error')
    //         }
    //         else {
    //             refetchDuplicateMail();
    //         }
    //     }
    //     else {
    //         refetchDuplicateMail();
    //     }
    // }
    const duplicateEmail = () => {
        let email: string = getFldValue(state.textDts, 'eml')
        let api: string = createGetApi("db=nodb|dll=hospdll|fnct=bx", 'stt1084=0=' + email);
        return nrjAxios({ apiCall: api });
    }
    // const duplicateEmailSuccess = (data: any) => {
    //     let dt: any = GetResponseWnds(data);
    //     if (dt) {
    //         if (dt.includes('id][') && getFldValue(dt, 'id')) {
    //             showToaster(['Duplicate Email, Found another Hospital with same Email'], 'error')
    //         }
    //         else {
    //             refetch();
    //         }
    //     }
    //     else {
    //         refetch();
    //     }
    // }



    // const { data: dataMail, refetch: refetchDuplicateMail } = useQuery({
    //     queryKey: ['mailDuplicateCheck', state.textDts],
    //     queryFn: duplicateEmail,
    //     enabled: false,
    //     staleTime: Number.POSITIVE_INFINITY,
    //     refetchOnWindowFocus: false,
    //     refetchOnReconnect: false,
    //     onSuccess: duplicateEmailSuccess,
    // })

    const { data: dataCheck, refetch: checkDuplicate } = useQuery({
        queryKey: ['mobileDuplicateCheck', state.textDts],
        queryFn: duplicateMobile,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // onSuccess: duplicateMobileSuccess,
    })

    // const { data, refetch: updateData } = useQuery({
    //     queryKey: ['svQry', state.mainId, state.rndm],
    //     queryFn: HandleUpdateClick,
    //     enabled: false,
    //     staleTime: Number.POSITIVE_INFINITY,
    //     refetchOnWindowFocus: false,
    //     refetchOnReconnect: false,
    //     onSuccess: svdQry,
    // })

    const { data: consentData, refetch: consentValidate } = useQuery({
        queryKey: ['svValidate', state.mainId, state.rndm],
        queryFn: HandleValidateConsentClick,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: svdValidate,
    });




    // useEffect(() => {
    //     refetchHcfData();
    // }, [])

    useEffectOnce(() => {
        refetchHcfData();
    })

    useEffect(() => {
        let userConsentDetails = localStorage.getItem('hcconsentdetails');

        if (userConsentDetails) {
            refetchConsentData();
        }
    }, [])



    const SaveHcfData = () => {
        let api: string = state.textDts;
        let formData: any = '';
        formData = state.textDts;
        formData = convertFldValuesToJson(formData);


        let hcfcod = getFldValue(api, 'hcfcod')
        let hcfid = hcfId ? hcfId : ''
        let hcfnm = getFldValue(api, 'hcfnm')
        let hcftypid = getFldValue(api, 'hcftypid')
        let addra = getFldValue(api, 'addra')
        let addrb = getFldValue(api, 'addrb')
        let addrc = getFldValue(api, 'addrc')
        let cty = getFldValue(api, 'cty')
        let pnc = getFldValue(api, 'pnc')
        let stt = getFldValue(api, 'stt')
        let cntprsn = getFldValue(api, 'cntprsn')
        let phn = getFldValue(api, 'mob')
        let mob = getFldValue(api, 'mob')
        let eml = getFldValue(api, 'eml')
        let nobd = getFldValue(api, 'nobd')
        let ltt = getFldValue(api, 'ltt')
        let lgt = getFldValue(api, 'lgt')
        let consent_no = getFldValue(api, 'consent_no')
        let consent_files = ''
        let cmpid = getCmpId() || "";
        let usrnm = getUsrnm() || "";

        let key = cmpid + '=' + hcfcod + '=' + usrnm + '=' + hcfid + '=' + hcfnm + '=' + hcftypid + '=' + addra + '=' + addrb + '=' + addrc + '=' + cty + '=' + pnc + '=' + stt + '=' + cntprsn + '=' + phn + '=' + mob + '=' + eml + '=' + nobd + '=' + ltt + '=' + lgt + '=' + consent_no + '=' + consent_files
        let payload: any = postLinux(key, 'create_independent_HCF');
        payload['consent_files'] = fileData ? fileData : [];
        return nrjAxiosRequestBio("create_independent_HCF", payload);

    }

    const GetData = () => {

        let userLoginDetails: any = localStorage.getItem('hcflogindetails')
        setHcfLoginDetails(userLoginDetails);
        let _data = JSON.parse(userLoginDetails)
        // setHcfName(_data.data.hcfName ? _data.data.hcfName : '')
        // setConsentNumber(_data.data.consent_no ? _data.data.consent_no : '')
        // setHcfId(data.data.hcfid ? _data.data.hcfid : '')
        return _data
    };



    const GetConsentData = () => {

        let userConsentDetails = localStorage.getItem('hcconsentdetails');

        if (userConsentDetails) {
            // Parse the JSON string into an object
            userConsentDetails = JSON.parse(userConsentDetails);

        } else {
            console.log('No data found .');
        }
        return userConsentDetails
    };


    const ShowConsentDetails = (data: any) => {
        if (data) {
            if (Number(data.nobd) < 30) {
                setConsentLabel("Authorization Number")

                setConsenVldfrmtLabel("Authorisation valid from")
                setConsenVldtotLabel("Authorisation valid up to")

            } else {
                setConsentLabel("Consent number")
                setConsenVldfrmtLabel("Consent valid from")
                setConsenVldtotLabel("Consent valid up to")

            }
            setConstDisbld(true)
            setConsentNumber(data.consentNumber ? data.consentNumber : '')
            setShowConsentPdfFilePath(data.consentflPath ? data.consentflPath : [])
            setShowConsentPdfFileName(data.consentflnm ? data.consentflnm : [])
            setConsentFromDt(data.consentFrmDate ? data.consentFrmDate : '')
            setConsentToDt(data.consentToDate ? data.consentToDate : '')

        } else {
            setConsentNumber('')
            setShowConsentPdfFilePath([])
            setShowConsentPdfFileName([])
            setConsentFromDt('')
            setConsentToDt('')
        }

    };

    const ShowDataDetails = (data: any) => {

        if (data && data.data && data.data["status"]) {
            // let dt: string = data.data
            if (data.data.consent_no) {
                setConstDisbld(true)
            } else {
                setConstDisbld(false)
            }

            let dt: string = convertFldValuesToString(data.data);
            if (Number(data.data.nobd) < 30) {
                setConsentLabel("Authorization Number")
                setConsenVldfrmtLabel("Authorisation valid from")
                setConsenVldtotLabel("Authorisation valid up to")

            } else {
                setConsentLabel("Consent number")
                setConsenVldfrmtLabel("Consent valid from")
                setConsenVldtotLabel("Consent valid up to")
            }
            setHcfName(data.data.hcfnm ? data.data.hcfnm : '')
            setConsentNumber(data.data.consent_no ? data.data.consent_no : '')
            setHcfId(data.data.hcfid ? data.data.hcfid : '')
            dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt })
            if (data.data.doc_path && data.data.flnm) {
                setShowConsentPdfFilePath(data.data.doc_path)
                setShowConsentPdfFileName(data.data.flnm)
            } else {
                setShowConsentPdfFilePath([])
                setShowConsentPdfFileName([])
            }
            setConsentFromDt(data.data.dt_app ? data.data.dt_app : '');
            setConsentToDt(data.data.dt_exp ? data.data.dt_exp : '')
            dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt })
            // dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_app][${data.data.dt_app}=dt_exp][${data.data.dt_exp}` })
            //setFrmData(dt);
        }

    };

    const fldDisabled = () => {
        let disabled = false
        if (consentNumber !== '') {
            disabled = true
            return disabled

        } else {
            disabled = false
            return disabled
        }
    }
    const { data: datab, refetch: refetchHcfData } = useQuery({
        queryKey: ["getQry", hcfLoginDetails],
        queryFn: GetData,
        enabled: false,
        // staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowDataDetails,
    });

    const { data: dataCn, refetch: refetchConsentData } = useQuery({
        queryKey: ["getQryCn", hcfConsentDetails],
        queryFn: GetConsentData,
        enabled: false,
        // staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowConsentDetails,
    });

    const { data: dataS, refetch: saveData } = useQuery({
        queryKey: ["saveData"],
        queryFn: SaveHcfData,
        enabled: false,
        // staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowDataDetails,
    });

    const saveClick = () => {
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
        saveData()
    }

    const clrFunct = () => {
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
        }, 300)
    }

    const Wnd = () => {
        let g: string = gid;
        let api: string = tellWndsServer2(g);
        return useNrjAxios({ apiCall: api });
    };

    const svd = (dataW: any) => {
        let dt: string = GetResponseWnds(dataW);
        dt = getFldValue(dt, "id");
        if (Number(dt) > -1) {
            setShowMessage({
                message: ["Data Saved Successfully! Please wait while we redirect to login page"],
                type: "success",
            });
            setTimeout(() => {
                if (hcfLoginId) {
                    logout();
                }
            }, 4000)
        }
        else {
            setShowMessage({
                message: ["Something went wrong, Please try again"],
                type: "error",
            });
        }
        // dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
        // setTimeout(() => {
        //     dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
        // }, 300)
    };
    const { data: dataW, refetch: refetchW } = useQuery({
        queryKey: ["svWnd", gid],
        queryFn: Wnd,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: svd,
    });

    const navigate = useNavigate();

    const navigateToAr = () => {
        navigate('/hcfArAll');
    }


    const logout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login")
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        const maxFileSizeKB = 250;

        if (fileList && fileList.length > 0) {
            const file = fileList[0];

            if (file.type !== 'application/pdf') {
                setPdfError('Only PDF files are allowed.');
                return;
            }

            // Check file size
            const fileSizeKB = file.size / 1024; // Convert bytes to KB
            if (fileSizeKB > maxFileSizeKB) {
                setPdfError('File size should be upto 250 Kb.');
                return;
            }


            const fileName = file.name;
            const fileNameRegex = /^[a-zA-Z0-9_.-]+\.pdf$/; // Valid file name pattern
            if (!fileNameRegex.test(fileName)) {
                setPdfError('File name should not contain special characters, spaces, or multiple dots.');
                return;
            }

            // Check for duplicate files
            const existingFileIndex = fileData.findIndex((f) => f.flnm === file.name);
            if (existingFileIndex !== -1) {
                setPdfError('File already uploaded. Duplicate files are not allowed.');
                return;
            }

            // Reset error message if file is valid
            setPdfError('');

            if (fileData.length > 0) {
                setFileData([]); // Clear existing file data
            }


            // Read file and convert to base64
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const base64String = e.target?.result as string;
                const cleanedBase64 = base64String.split(',')[1];
                setFileData((prevFileData) => [
                    ...prevFileData,
                    { flnm: file.name, flst: cleanedBase64 },
                ]);
            };
            fileReader.readAsDataURL(file);
        }
    };

    const handleFileDelete = (fileName: string) => {
        setFileData((prevFileData) => prevFileData.filter(file => file.flnm !== fileName));
    };


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


    const ClickConsentValidate = () => {
        const nobd: string = getFldValue(state.textDts, 'nobd');
        const hcfType: string = getFldValue(state.textDts, 'hcftypid');


        // Check if consentNumber is provided
        if (!consentNumber) {
            showToaster(["Enter Consent number"], 'error')
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
        if (nobdValue < 30 && consentNumber) {
            consentValidate();
        }
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

    return (
        <>
            <div className='overflow-y-auto h-screen bg-white'>

                {/* <HcfHeader></HcfHeader> */}
                <div className='px-3 pb-10 '>

                    {/* {hcfLoginId ? <div className='flex py-4 justify-end'>

                <div className='mr-4'>
                    <Button
                        size="medium"
                        variant="outlined"
                        color="primary"
                        disabled={false}
                        onClick={navigateToAr}>
                        Go to Annual Report
                    </Button>
                </div>
                <div className='mr-4'>
                    <Button
                        size="medium"
                        style={{ backgroundColor: "#86c6d9" }}
                        variant="contained"
                        color="success"
                        disabled={false}
                        onClick={logout}>
                        Logout
                    </Button>
                </div>

            </div> : <></>} */}
                    <div className="rounded" >
                        {/* <div className="p-7 rounded text-black" style={{ background: 'linear-gradient(90.29deg, #86c6d9 0%, #aed6e0 100%)' }}>
                    <div className="text-2xl font-bold">Health Care Facility</div>
                    <div className="">please provide the requested information below</div>
                </div> */}
                        <div className="mx-7">
                            <Seperator heading="HCF details"></Seperator>
                            <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                                <WtrInput
                                    displayFormat="1"
                                    Label="HCF Name"
                                    fldName="hcfnm"
                                    idText="txthcfnm"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="5[length]"
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    // speaker={"Enter Name of HCF"}

                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>

                                <WtrInput displayFormat='1' Label='Label No' fldName='labelno' idText='txtlblno' onChange={onChangeDts} dsabld={fldDisabled()} callFnFocus='' dsbKey={false} upprCase={false} validateFn='[label]' allowNumber={false} selectedValue={state.frmData} clrFnct={state.trigger}
                                    //  speaker={'Enter Label No'}
                                    delayClose={1000} placement='left' ClssName='' ></WtrInput>

                                <WtrInput
                                    displayFormat="1"
                                    Label="SPCB Code"
                                    fldName="hcfcod"
                                    idText="txthcfcod"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="5[length]"
                                    maxLength={5}
                                    allowNumber={true}
                                    // speaker={"Enter SPCB Code"}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                ></WtrInput>

                                <WtrInput
                                    displayFormat="1"
                                    Label="CBWTF"
                                    fldName="cbwtfnm"
                                    idText="txtcbwtfnm"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    // validateFn="5[length]"
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    // speaker={"Enter Name of CBWTF"}

                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>





                                {/* <WtrInput
                                    displayFormat="1"
                                    Label="HCF Type"
                                    fldName="hcftypid"
                                    idText="txthcftyp"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="1[length]"
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                // speaker={"Select Type of HCF"}

                                ></WtrInput> */}

                                <WtrRsSelect
                                    displayFormat={"1"}
                                    Label="HCF Type"
                                    fldName="hcftypid"
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
                                    delayClose={1000}
                                    disable={fldDisabled()}
                                    speaker={"HCF Type bedded/Non-bedded"}
                                ></WtrRsSelect>

                                <WtrInput
                                    displayFormat="1"
                                    Label="No of Beds"
                                    fldName="nobd"
                                    idText="txtnobd"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled() || returnNumberOfBedDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    ToolTip="Enter numbers only"
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                // speaker={"Enter No of Beds"}

                                ></WtrInput>
                                <WtrInput
                                    displayFormat={"1"}
                                    Label="GPS coordinates of HCF (latitude)"
                                    fldName="ltt"
                                    idText="txtgpscordlat"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    allowDecimal={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    speaker={"GPS Lattitude of HCF"}
                                    gpsValidate={true}
                                    noofDecimals={6}
                                ></WtrInput>
                                <WtrInput
                                    displayFormat={"1"}
                                    Label="GPS coordinates of HCF (longitude)"
                                    fldName="lgt"
                                    idText="txtgpscordlong"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    allowDecimal={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    speaker={"GPS Longitude of HCF"}
                                    noofDecimals={6}
                                ></WtrInput>


                                {/* <WtrRsSelect
                            displayFormat="1"
                            Label="HCF Type"
                            fldName="hcftypid"
                            idText="txthcftyp"
                            onChange={onChangeDts}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            allwZero={"1"}
                            fnctCall={false}
                            dbCon={"shrtrm"}
                            typr={"633"}
                            dllName={""}
                            fnctName={""}
                            parms={""}
                            speaker={"Select Type of HCF"}
                            allwSrch={true}
                        ></WtrRsSelect> */}

                            </div>

                            <Seperator heading="Address Detail"></Seperator>

                            <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                                <WtrInput
                                    displayFormat="1"
                                    Label="Address I"
                                    fldName="addra"
                                    idText="txtaddra"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}

                                    validateFn="1[length]"
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                // speaker={"Enter Address"}

                                ></WtrInput>
                                <WtrInput
                                    displayFormat="1"
                                    Label="Address II"
                                    fldName="addrb"
                                    idText="txtaddrb"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}

                                    validateFn=""
                                    unblockSpecialChars={true}
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                ></WtrInput>
                                <WtrInput
                                    displayFormat="1"
                                    Label="Address III"
                                    fldName="addrc"
                                    idText="txtaddrc"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}

                                    validateFn=""
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                ></WtrInput>

                                {/* <WtrInput displayFormat='1' Label='District' fldName='dstr' idText='txtdstr' onChange={onChangeDts}dsabld={fldDisabled()} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={false} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput> */}

                                {/* <WtrInput displayFormat='1' Label='City' fldName='cty' idText='txtcty' onChange={onChangeDts}dsabld={fldDisabled()} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={false} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput> */}

                                {/* <WtrRsSelect
                            displayFormat="1"
                            Label="City"
                            fldName="cty"
                            idText="txtcty"
                            onChange={onChangeDts}
                            loadOnDemand={""}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            allwZero={"1"}
                            fnctCall={false}
                            dbCon={"shrtrm"}
                            typr={"790"}
                            dllName={""}
                            fnctName={""}
                            parms={""}
                            allwSrch={true}
                            speaker={"Select City"}
                        ></WtrRsSelect> */}

                                {/* <WtrRsSelect
                            displayFormat="1"
                            Label="State"
                            fldName="state"
                            idText="txtstate"
                            onChange={onChangeDts}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            allwZero={"1"}
                            fnctCall={false}
                            dbCon={"shrtrm"}
                            typr={"880"}
                            dllName={""}
                            fnctName={""}
                            parms={""}
                            allwSrch={true}
                            speaker={"Select the State"}
                            delayClose={1000}
                        ></WtrRsSelect> */}
                                <WtrInput
                                    displayFormat="1"
                                    Label="District"
                                    fldName="cty"
                                    idText="txtcty"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    maxLength={6}
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    ClssName=""
                                // speaker={"Select City"}

                                ></WtrInput>
                                <WtrInput
                                    displayFormat="1"
                                    Label="State/UT"
                                    fldName="stt"
                                    idText="txtstate"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    ClssName=""
                                // speaker={"Select the State"}

                                ></WtrInput>
                                <WtrInput
                                    displayFormat="1"
                                    Label="Pin Code"
                                    fldName="pnc"
                                    idText="txtpnc"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    maxLength={6}
                                    validateFn="[pincode]"
                                    allowNumber={true}
                                    ToolTip="Enter numbers only"
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    ClssName=""
                                // speaker={"Enter Pin Code"}

                                ></WtrInput>

                            </div>

                            <Seperator heading=" Details of PCB Consent"></Seperator>

                            <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                                {/* <WtrInput
                                    displayFormat="1"
                                    Label="Consent number" ToolTip="Enter Consent number"
                                    fldName="consent_no"
                                    idText="txtconsentno"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                   
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                   
                                    delayClose={1000}
                                    placement="right"
                                    blockNumbers={false}
                                    ClssName=""
                                    unblockSpecialChars={true}
                                ></WtrInput> */}

                                <div className="mt-1">
                                    <label
                                        htmlFor="consentconsentNumber"
                                        className="block text-sm font-medium text-gray-700"
                                        style={{ fontSize: "14px", color: "#020134" }}
                                    >
                                        {consentLabel ? consentLabel : "Consent number"}
                                    </label>

                                    <div className="input-container mt-2">
                                        <input
                                            type="text"
                                            id="consentFromDt"
                                            value={consentNumber} // Controlled input value
                                            disabled={consentdisbld}
                                            className="w-full max-w-2xl p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={consentLabel}
                                            onChange={handleConsent} // Handle input change
                                        />
                                    </div>
                                </div>

                                <div className="mt-1">
                                    <label
                                        htmlFor="consentToDt"
                                        className="block text-sm font-medium text-gray-700"
                                        style={{ fontSize: "14px", color: "#020134" }}
                                    >

                                        {consentVldfrmLabel}
                                    </label>

                                    <div className="input-container mt-2">
                                        <input
                                            type="text"
                                            id="consentFromDt"
                                            value={consentFromDt}
                                            disabled
                                            className="w-full max-w-2xl p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-0"
                                            placeholder="Disabled Input"
                                        />
                                    </div>
                                </div>

                                <div className="mt-1">
                                    <label
                                        htmlFor="consentFromDt"
                                        className="block text-sm font-medium text-gray-700"
                                        style={{ fontSize: "14px", color: "#020134" }}
                                    >
                                        {consentVldtoLabel}
                                    </label>

                                    <div className="input-container mt-2">
                                        <input
                                            type="text"
                                            value={consentToDt}
                                            disabled
                                            className="w-full max-w-2xl p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-0"
                                            placeholder="Disabled Input"
                                        />
                                    </div>
                                </div>

                                {/* {showConsentFileName.length > 0 && showConsentFilePath.length > 0 ? <div style={{ display: 'flex', alignItems: 'center' }}>
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
                                    <div style={{ flex: 1, marginLeft: '5px' }}> 
                                        <div style={{ marginTop: '20px', marginBottom: '4px' }}>
                                         

                                            <label

                                                className="block text-sm font-medium text-gray-700"
                                                style={{ fontSize: "14px", color: "#020134" }}
                                            >
                                                PCB Consent Document Upload
                                            </label>
                                            <label style={{ display: 'inline-block', padding: '9px 47px', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder' }}>
                                                <i className="fas fa-upload" style={{ marginRight: '8px', verticalAlign: 'middle' }}></i>
                                                Attach Document
                                                <input type="file" name='Consentfiles' style={{ display: 'none' }} onChange={handleFileChange} multiple={false} disabled={consentdisbld} />
                                            </label>
                                            <br />
                                            {pdfError && <p style={{ color: 'red' }}>{pdfError}</p>}
                                        </div>

                                        <div>
                                            {fileData.map((file) => (
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
                                {consentFromDt === '' && (
                                    <div className="flex justify-start mt-6 mr-[0rem] sm:mr-0">
                                        <Button
                                            size="medium"
                                            style={{ backgroundColor: "#34c3ff" }}
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
                                )} */}

                            </div>

                            <Seperator heading="Additional Detail"></Seperator>

                            <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                                <WtrInput
                                    displayFormat="1"
                                    Label="Contact person" ToolTip="Enter contact person name without special charecters"
                                    fldName="cntprsn"
                                    idText="txtcntprsnsn"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}

                                    validateFn="6[length]"
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    // speaker={"Enter Name of Contact person"}

                                    delayClose={1000}
                                    placement="right"
                                    blockNumbers={true}
                                    ClssName=""
                                ></WtrInput>

                                <WtrInput
                                    displayFormat="1"
                                    Label="Mobile Number of Contact person"
                                    fldName="mob"
                                    idText="txtmob"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}

                                    validateFn="[mob]"
                                    allowNumber={true}
                                    ToolTip="Enter numbers only"
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    // speaker={"Enter Mobile Number"}

                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>
                                {/* <WtrRsSelect
                            displayFormat="1"
                            Label="Entity"
                            fldName="pplid"
                            idText="txtpplid"
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
                        ></WtrRsSelect> */}
                                <WtrInput
                                    displayFormat="1"
                                    Label="Phone number of HCF"
                                    fldName="phn"
                                    idText="txtphn"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="[mob]"
                                    allowNumber={true}
                                    ToolTip="Enter numbers only"
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    // speaker={"Enter Mobile Number"}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>
                                <WtrInput
                                    displayFormat="1"
                                    Label="E-mail id of Contact person"
                                    fldName="eml"
                                    idText="txteml"
                                    onChange={onChangeDts}
                                    dsabld={fldDisabled()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    upprCase={false}
                                    validateFn="[email]"
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    unblockSpecialChars={true}
                                    delayClose={1000}
                                    // speaker={"Enter a valid email address"}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>
                                {/* <WtrInput
                            displayFormat="1"
                            Label="Password"
                            fldName="psw"
                            idText="txtpsw"
                            inputType="password"
                            onChange={onChangeDts}
                           dsabld={fldDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            unblockSpecialChars={true}
                            validateFn="[psw]"
                            ToolTip="Enter Password"
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            speaker={"Enter Password"}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                        ></WtrInput>
                        <WtrInput
                            displayFormat="1"
                            Label="Retype Password"
                            fldName="rpsw"
                            idText="txtpsw"
                            inputType="password"
                            onChange={onChangeDts}
                           dsabld={fldDisabled()}
                            callFnFocus=""
                            dsbKey={false}
                            unblockSpecialChars={true}
                            validateFn="[psw]"
                            ToolTip="Re-Enter Password"
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            speaker={"Enter Password"}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            showErrorMsgAbsolute={false}
                        ></WtrInput> */}
                            </div>


                            {/* <div className="flex py-3">
                        <div className="mr-4">
                            <Button
                                size="medium"
                                style={{ backgroundColor: "#86c6d9" }}
                                variant="contained"
                                color="success"
                                disabled={false}
                                startIcon={<SaveIcon />}
                                onClick={saveClick}>
                                Submit
                            </Button>
                        </div>
                        {hcfLoginId ? <div className="mr-4">
                            <Button
                                size="medium"
                                variant="outlined"
                                color="primary"
                                disabled={false}
                                onClick={navigateToAr}>
                                Go to Annual Report
                            </Button>
                        </div> : <></>}
                    </div> */}
                        </div>
                    </div>


                </div>
                {/* {(hcfName && hcfName !== '' || consentNumber == '') &&
                    <div className="mr-4 flex justify-center mt-8 space-x-4">
                        <Button
                            size="medium"
                            style={{ backgroundColor: "#34c3ff" }}
                            variant="contained"
                            color="success"
                            startIcon={<SaveIcon />}
                            onClick={updateClick}
                            disabled={false}
                        >
                            UPDATE
                        </Button>
                    </div>} */}
                {(hcfName == '') &&
                    <div className="mr-4 flex justify-center mt-8 space-x-4">
                        <Button
                            size="medium"
                            style={{ backgroundColor: "#34c3ff" , textTransform: "none"}}
                            variant="contained"
                            color="success"
                            startIcon={<SaveIcon />}
                            onClick={saveClick}
                            disabled={false}
                        >
                            Save
                        </Button>
                    </div>}
            </div>
        </>

    );
}; export default React.memo(HCFMaster);
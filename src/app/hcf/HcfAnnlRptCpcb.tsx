import React, { useReducer, useState } from 'react'
import axios from 'axios'
import { validForm } from '../../Hooks/validForm'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, getApiFromBiowaste, getCmpId, getStateFullFormWho, getUsrnm, postLinux, svLnxSrvr } from '../../utilities/utilities'
import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { nrjAxios, nrjAxiosRequest, nrjAxiosRequestBio, nrjAxiosRequestLinux, useNrjAxios } from '../../Hooks/useNrjAxios';
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import { Toaster } from '../../components/reusable/Toaster'
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry'
import LevelSelector from '../dshbrd/LevelSelector'
import { useToaster } from '../../components/reusable/ToasterContext'
import NrjAgBtn from "../../components/reusable/NrjAgBtn";
import { getLvl } from '../../utilities/cpcb'
import { getWho } from '../../utilities/cpcb'

import moment from "moment";
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect'
import { useEffectOnce } from 'react-use'
import { useNavigate } from 'react-router'
import { Button } from "@mui/material";

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
    SETCBWTFCOMBO: "setCbwtfCombo",
    SETSTATECOMBO: "setStateCombo",
    SETRGDCOMBO: "setRgdCombo",
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
    cbwtfCombo: "",
    stateCombo: "",
    rgdCombo: "",
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
    cbwtfCombo: string;
    stateCombo: string;
    rgdCombo: string;
};

type act = {
    type: string;
    payload: any;
};

interface SttDetails {
    stt: string;
}


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
            return newstate;

        case ACTIONS.SETFORM_DATA:
            newstate.frmData = action.payload;
            return newstate;
        case ACTIONS.CHECK_REQ:
            newstate.errMsg = action.payload;
            newstate.openDrwr = true;
            return newstate;
        case ACTIONS.CHECK_REQDONE:
            newstate.errMsg = [];
            newstate.openDrwr = false;
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
        case ACTIONS.SETGID:
            newstate.gid = action.payload;
            return newstate;
    }
};


const HcfAnnlRptCpcb = () => {

    const [loadOnDemand, setLoadOnDemand] = useState("")
    useEffectOnce(() => {
        let value1 = new Date().getFullYear()
        setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}`)
    })

    const [year, setYear] = useState("");
    const [notFoundCbwtfFltr, setNotFoundCbwtfFltr] = useState<boolean>(false)

    const [sttValue, setSttValue] = useState<string>("");
    const [cbwtfValue, setCbwtfValue] = useState<string>("");
    const [rgdValue, setRgdValue] = useState<string>("");
    const [fltr, setFltr] = useState("")

    //#############Constants for the State and other functions
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] })
    const [isLoading, setIsLoading] = useState("");
    const [value, setValue] = useState(0);
    const navigate = useNavigate();
    const [total, setTotal] = useState(0)
    const [totalAr, setTotalAr] = useState(0)

    const hideInStt = getLvl() == "STT" ? true : false
    const hideInCpcb = getLvl() == "CPCB" ? true : false
    const hideInRgd = getLvl() == "RGD" ? true : false
 const { showToaster, hideToaster } = useToaster();
    const getcbwtfListForStt = async () => {
        let who = getWho()
        let state: { [key: string]: string } = {
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
            "WB": "West Bengal"
        }

        let key: string | undefined;

        for (const k in state) {
            if (state[k].toLocaleLowerCase() === who.toLocaleLowerCase()) {
                key = k;
                break;
            }
        }

        if (key) {
            try {
                let result = await getCbwtf(key, fltr);
                getCbwtfSuccess(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }

        } else {
            console.log("State not found in the object.");
        }


    }


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
        if (lvl == 'STT') {
            getcbwtfListForStt()
        } if (lvl == 'RGD') {
            getSttlistForRgd()
        }

    })





    const reqFlds = [{}];
    const coldef = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'hcfnm', hide: false, width: 500, headerName: 'HCF name' },
        { field: 'authnm', hide: false, width: 500, headerName: 'Name of authorized person' },
    ];


    const GetDataValue = (data: string, fld: string) => {
        let vl: string = useGetFldValue(data, fld);
        return vl;
    }

    const GridLoaded = () => { };

    const rowData: any = [];
    const onRowSelected = (data: string) => {
        // sessionStorage.setItem('hcfAnnlRpt', data);
        // navigate("/hcfAnnlRptcbcp");
    };


    function getDataOnBack(sessionData: any, rgd: any, stt: any, cbwtf: any, totalCount: any) {
        setIsLoading("")
        if (Array.isArray(sessionData) && sessionData.length) {
            dispatch({ type: ACTIONS.NEWROWDATA, payload: sessionData });
            dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_yearid][${sessionData[0].dt_yearid}=dt_year][${sessionData[0].dt_year}=rgdid][${rgd}=rgd][${rgd}=sttid][${stt}=stt][${stt}=cbwtfid][${cbwtf}=cbwtf][${cbwtf}` })
            setTotal(totalCount.Total_AR_filed)
            setTotalAr(totalCount.Toatl_AR_have_to_be_filed)

        }
        else {
            if (rgdValue || sttValue) {
                showToaster(["No data received"],"error", );
            }
        }

    }

    useEffectOnce(() => {
        const selectData: any = sessionStorage.getItem('hcfData');
        const selectRgd: any = sessionStorage.getItem('selectRgd');
        const selectStt: any = sessionStorage.getItem('selectStt');
        const selectCbwtf: any = sessionStorage.getItem('selectCbwtf');
        const totalAr: any = sessionStorage.getItem('totalArcount');
        const totalCount: string = JSON.parse(totalAr)
        if (selectData) {
            const data: string = JSON.parse(selectData)
            getDataOnBack(data, '', '', '', totalCount)
        } if (selectRgd) {
            const data: string = JSON.parse(selectData)
            const rgd: string = JSON.parse(selectRgd)
            getDataOnBack(data, rgd, '', '', totalCount)
        }
        if (selectStt) {
            const data: string = JSON.parse(selectData)
            const stt: string = JSON.parse(selectStt)
            getDataOnBack(data, '', stt, '', totalCount)
        }
        if (selectCbwtf) {
            const data: string = JSON.parse(selectData)
            const cbwtf: string = JSON.parse(selectCbwtf)
            getDataOnBack(data, '', '', cbwtf, totalCount)
        }
        else {
            refetch()
            sessionStorage.removeItem('hcfData');
            sessionStorage.removeItem('selectRgd');
            sessionStorage.removeItem('selectStt');
            sessionStorage.removeItem('selectCbwtf');
            sessionStorage.removeItem('totalArcount');
            console.log('Session storage cleared on component mount');
        }
        const handleBeforeUnload = () => {
            sessionStorage.removeItem('hcfData');
            sessionStorage.removeItem('selectRgd');
            sessionStorage.removeItem('selectStt');
            sessionStorage.removeItem('selectCbwtf');
            sessionStorage.removeItem('totalArcount');

        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };

    })
    const onButtonClicked = (action: string, rw: any) => {
        if (action == "Details") {
            sessionStorage.setItem('hcfAnnlRpt', JSON.stringify(rw));
            navigate("/hcfAnnlRptcbcp");
        }
    };


    const GetList = () => {
        if (year == "") {
            setShowMessage({
                message: ["Please select a year."],
                type: "error",
            });
            return;
        }
        if (year) {
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
            if (cbwtfValue) {
                who = cbwtfValue;
                lvl = "CBWTF"
            }

            let usrnm = getUsrnm();
            let cmpid = getCmpId();
            setValue(0);
            setPrevTotalPages(0);
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
            setTimeout(function () {
                dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
            }, 800);
            let payload: any = postLinux(lvl + '=' + who + "=" + year + "=hcf_ar=" + usrnm + '=' + cmpid + '=' + '0', 'show_AR_filing_Hcf')
            return nrjAxiosRequestLinux("show_AR_filing", payload);
        }
    }

    function getTotalArReport() {
        if (year) {
            let who = sessionStorage.getItem('who')
            let lvl = sessionStorage.getItem('lvl')
            if (lvl == 'STT') {
                let sttDetails = sessionStorage.getItem('sttDetails')
                if (sttDetails) {
                    const parsedSttDetails = JSON.parse(sttDetails) as SttDetails; // Parse and assert type
                    who = parsedSttDetails.stt; // Access the stt property
                }
            }
            let usrnm = getUsrnm();
            let cmpid = getCmpId();
            // pass value api  lvl and who  by requirement

            if (rgdValue) {
                who = rgdValue;
                lvl = "RGD"
            }
            if (sttValue) {
                who = sttValue;
                lvl = "STT"
            }
            if (cbwtfValue) {
                who = cbwtfValue;
                lvl = "CBWTF"
            }

            let what = 'hcf_ar'
            let payload: any = postLinux(lvl + '=' + who + "=" + year + '=' + what + '=' + usrnm + '=' + cmpid + '=', 'show_AR_filing_count');
            return nrjAxiosRequestLinux("show_AR_filing_count", payload);

        }

    }

    const ShowData = (dataSvd1: any,) => {
        setIsLoading("")
        let dt: any = GetResponseLnx(dataSvd1);
        if (Array.isArray(dt) && dt.length) {
            setTimeout(function () {
                dispatch({ type: ACTIONS.NEWROWDATA, payload: dt });
            }, 300);
            sessionStorage.setItem('hcfData', JSON.stringify(dt));
            if (rgdValue) {
                sessionStorage.setItem('selectRgd', JSON.stringify(rgdValue));
            }
            if (sttValue) {
                sessionStorage.setItem('selectStt', JSON.stringify(sttValue));
            }
            if (cbwtfValue) {
                sessionStorage.setItem('selectCbwtf', JSON.stringify(cbwtfValue));
            }
        }
        else {
            if (sttValue || cbwtfValue) {
                showToaster(["No data received"],"error", );
            }
        }
    };

    const ShowDataTotal = (dataTotalSvdrgd: any) => {
        let dt: any = GetResponseLnx(dataTotalSvdrgd);
        if (dt.status == 'Success') {
            sessionStorage.setItem('totalArcount', JSON.stringify(dt));
            setTotal(dt.Total_AR_filed)
            setTotalAr(dt.Toatl_AR_have_to_be_filed)
        } else {
            setTotal(0);
            setTotalAr(0);
        }
    }



    const { data: dataListSvdyear, refetch: refetch } = useQuery({
        queryKey: ["getList"],
        queryFn: GetList,
        enabled: true,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });

    useEffectOnce(() => {
        refetch()
        setShowMessage({ message: [] })
    })

    function getListOnclick() {
        refetch()
        refetchTotalRGDRepoert()
    }



    // call api for total count report when rd,state or cbwtf select
    const { data: dataTotalSvdrgd, refetch: refetchTotalRGDRepoert } = useQuery({
        queryKey: ["rgdGettotal"],
        queryFn: getTotalArReport,
        enabled: true,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowDataTotal,
    });


    const [prevTotalPages, setPrevTotalPages] = useState(0);
    let prev = 0;

    const pagePagination = (data: any) => {
        console.log('pagination called');
        console.log(prev)

        let currentPage: number = data.api.paginationProxy.currentPage;
        let totalPages: number = data.api.paginationProxy.totalPages;
        if (totalPages - prevTotalPages > 0 && totalPages - currentPage <= 1) {
            setPrevTotalPages(data.api.paginationProxy.totalPages);
            console.log('data changed');

            if (!prev && data.api.paginationProxy.totalPages - prev > 0) {
                refetch();
            }
            prev = totalPages;
            //refetch();
        }
    };



    const getCbwtf = (stateData: string, filter: string) => {
        let who = sessionStorage.getItem('who')
        let lvl = sessionStorage.getItem('lvl')
        if (lvl == 'STT') {
            let sttDetails = sessionStorage.getItem('sttDetails')
            if (sttDetails) {
                const parsedSttDetails = JSON.parse(sttDetails) as SttDetails; // Parse and assert type
                who = parsedSttDetails.stt; // Access the stt property
            }

        }

        //let api: string = getApiFromBiowaste("cbwtfregtdy");
        let payload: any = postLinux(lvl + '=' + who + '=' + filter, 'cbwtflistDrp')
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

    const onSearchDb = (fldnm: string, fltr: string) => {
        setFltr(fltr)
        setNotFoundCbwtfFltr(false);
    }
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
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: getCbwtfSuccess,
    });


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

    const onChangeRgd = (data: string) => {
        // rgdid
        let fldN: any = utilities(2, data, "");
        if (fldN == 'rgdid') {
            setRgdValue(getFldValue(data, 'rgdid').split('|')[0])
            setSttValue('')
        }
        if (fldN == 'sttid') {
            setSttValue(getFldValue(data, 'sttid').split('|')[0])
            setCbwtfValue('')
        }
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const onChangeCbwtf = (data: string) => {
        setCbwtfValue(getFldValue(data, 'cbwtfid').split('|')[0])
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const onChangeDts = (data: string) => {
        let fld: any = utilities(2, data, "");
        if (fld == 'dt_yearid') {
            setYear(getFldValue(data, 'dt_yearid').split('|')[0])
            dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        }
    };


    return (
        <div className="bg-white">
           <div className=" font-semibold text-lg text-center ">{isLoading}</div>
            {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                <Toaster data={showMessage} className={''}></Toaster>
            </div> : <></>}

            <div className=" mt-4 grid grid-cols-3 gap-x-8 gap-y-4 my-4 pt-4">
                <WtrRsSelect
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
                ></WtrRsSelect>
                {/* {hideInCpcb && <WtrRsSelect
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
                    speaker={""}
                    delayClose={1000}
                    placement="bottom"
                    displayFormat="1"
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
                    speaker={""}
                    delayClose={1000}
                    placement="bottom"
                    displayFormat="1"
                ></WtrRsSelect>}

                {(hideInCpcb || hideInStt || hideInRgd) && <WtrRsSelect
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
                    speaker={""}
                    onSearchDb={onSearchDb}
                    menuStyle={{ maxWidth: '400px', minWidth: '200px' }}
                ></WtrRsSelect>}
                <div className="mt-4 flex px-2 items-center">

                    <div className="mr-2">
                        <Button
                            size="medium"
                            style={{ backgroundColor: "#3490dc", color: '#fff',textTransform: "none" }}
                            variant="contained"
                            color="success"
                            onClick={getListOnclick}
                            className="me-3"
                        >
                            Get list
                        </Button>
                    </div>

                </div>
            </div>

            <div className="border rounded-lg mt-3">
                <div className="p-3">
                    <div className="flex font-semibold">
                        Total AR filled : {total}
                    </div>
                </div>
            </div>
            <div className="border rounded-lg">
                <div className="p-3">
                    <div className="flex font-semibold">
                        Total AR have to be filed : {totalAr}
                    </div>
                </div>
            </div>
            {/* <div className=" font-semibold text-lg text-center ">{isLoading}</div> */}
            <div className="p-3 bg-white rounded-lg">
                <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    onButtonClicked={onButtonClicked}
                    showDataButton={"Details"}
                    colDef={coldef}
                    apiCall={""}
                    rowData={state.nwRow}
                    deleteButton={""}
                    newRowData={state.nwRow}
                    trigger={state.triggerG}
                    showPagination={true}
                    showTooltips={true}
                    // parentPaginationChanged={pagePagination}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    lvl={getLvl()}
                    who={getWho()}
                    sortBy={'clr'}
                ></NrjAgGrid>
            </div>
        </div>
    );
}; export default React.memo(HcfAnnlRptCpcb);
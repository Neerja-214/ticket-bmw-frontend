import { Button, Tooltip } from "@mui/material";
import CardHospitalDisplay from "../../components/reusable/CardHospitalDisplay";
import { useQuery } from "@tanstack/react-query";
import utilities, { GetResponseWnds, createGetApi, gridAddToolTipColumn, postLinux, GetResponseLnx, getCmpId, getUsrnm } from "../../utilities/utilities";
import React, { useEffect, useReducer, useState } from "react";
import { useEffectOnce } from "react-use";
import { nrjAxiosRequestBio, useNrjAxios } from "../../Hooks/useNrjAxios";
import WtrInput from "../../components/reusable/nw/WtrInput";
import { getFldValue } from "../../Hooks/useGetFldValue";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { act } from "react-dom/test-utils";
import { clrNAValue } from "../../utilities/cpcb";
import { Modal } from "rsuite";
import { Toaster } from "../../components/reusable/Toaster";
import { useToaster } from "../../components/reusable/ToasterContext";
import WtrRsSelect from "src/components/reusable/nw/WtrRsSelect";
import { getLvl, getWho, control_focus } from "../../utilities/cpcb";

const ACTIONS = {
    TRIGGER_GRID: "grdtrigger",
    NEWROWDATA: "newrow",
    TRIGGER_GRIDSRCH: "sgrdtrigger",
    NEWROWDATASRCH: "snewrow",
    RANDOM: "rndm",
    TRIGGER_FORM: "trgfrm",
    FORM_DATA: "frmdata",
    SETFORM_DATA: "setfrmdata",
    MAINID: "mnid",
    CHECK_REQ: "chckreq",
    CHECK_REQDONE: "chckreqdn",
    SETGID: "gd",
    SETFORMAT: "frmt",
    GRIDRECCNT: "grdreccnt",
    DISABLE: "disable",
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
    frmt: 0,
    grdcnt: 0,
    btnTxtA: "Previous",
    btnTxtB: "More",
    btnTxtC: "",
    disableA: 1,
    disableB: 1,
    disableC: 1,
    triggerSrch: 0,
    nwRowSrch: [],
    triggerHsp: 1,
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
    frmt: number;
    grdcnt: number;
    btnTxtA: string;
    btnTxtB: string;
    btnTxtC: string;
    disableA: number;
    disableB: number;
    disableC: number;
    triggerSrch: number;
    nwRowSrch: any;
    triggerHsp: number;
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
        case ACTIONS.MAINID:
            newstate.mainId = action.payload;
            return newstate;
        case ACTIONS.TRIGGER_GRID:
            newstate.triggerG = action.payload;
            return newstate;
        case ACTIONS.TRIGGER_GRIDSRCH:
            newstate.triggerSrch = action.payload;
            return newstate;
        case ACTIONS.SETFORMAT:
            newstate.frmt = action.payload;
            return newstate;
        case ACTIONS.GRIDRECCNT:
            newstate.grdcnt = action.payload;
            // if (action.payload == 0)
            // {
            //   newstate.grdcnt = 0
            // }
            return newstate;
        case ACTIONS.TRIGGER_FORM:
            newstate.trigger = action.payload;
            newstate.triggerHsp = action.payload;
            if (action.payload === 0) {
                newstate.textDts = "";
                newstate.frmData = "";
                newstate.mainId = 0;
            }
            return newstate;
        case ACTIONS.NEWROWDATA:
            newstate.triggerG += 10;
            if (action.payload) {
                if (action.payload.length > 0) {
                    newstate.grdcnt += action.payload.length;
                }
            }
            newstate.nwRow = action.payload;
            return newstate;
        case ACTIONS.NEWROWDATASRCH:
            newstate.triggerSrch = 1;
            newstate.nwRowSrch = action.payload;
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
            newstate.rndm += 1;
            return newstate;
        case ACTIONS.CHECK_REQ:
            newstate.errMsg = action.payload;
            newstate.openDrwr = true;
            return newstate;
        case ACTIONS.CHECK_REQDONE:
            newstate.errMsg = "";
            newstate.openDrwr = false;
            return newstate;
        case ACTIONS.SETGID:
            newstate.gid = action.payload;
            return newstate;
        case ACTIONS.DISABLE:
            if (action.payload == 1) {
                if (newstate.disableA == 1) {
                    newstate.disableA = 0;
                } else {
                    newstate.disableA = 1;
                }
                return newstate;
            } else if (action.payload == 2) {
                if (newstate.disableB == 1) {
                    newstate.disableB = 0;
                } else {
                    newstate.disableB = 1;
                }
                return newstate;
            }
            return newstate;
        case ACTIONS.SETRGDCOMBO:
            newstate.rgdCombo = action.payload;
            return newstate;
        case ACTIONS.SETSTATECOMBO:
            newstate.stateCombo = action.payload;
            return newstate;
    }
};

const HcfConsentList = (props: any) => {

    const [state, dispatch] = useReducer(reducer, initialState);
    const GridLoaded = () => { };
    const onButtonClicked = (action: string, rw: any) => { };
    const [gridData, setGridData] = useState<any[]>([]);
    const [curPageCount, setCurPageCount] = useState(0);
    const [actvPage, setActvPage] = useState(0);
    const [isLoading, setIsLoading] = useState("");
    const [lvl, setlvl] = useState("");
    const [who, setwho] = useState("");
    const [name, setname] = useState("");
    const [grdCnt, setGrdcnt] = useState(state.grdcnt)
    const [apiCall, setApiCall] = useState("")
    const [loadOnDemand, setLoadOnDemand] = useState("")
    const [showStaticMap, setShowStaticMap] = useState(true)
    const [sttValue, setSttValue] = useState<string>("");
    const [rgdValue, setRgdValue] = useState<string>("");


    const coldef: any[] = [
        {
            field: "hcfnm",
            width: 320,
            headerName: "Health care facility",
            tooltipField: 'hcfnm',
            filter: "agTextColumnFilter",
        },
        {
            field: "hcfcod",
            width: 150,
             headerName: "SPCB/PCC code",
            tooltipField: "tphcf",
            filter: "agTextColumnFilter",
        },
        {
            field: "cty",
            width: 200,
            headerName: "City",
        },
        {
            field: "cntprsn",
            width: 200,
            headerName: "Contact person",
            filter: "agTextColumnFilter",
        },
        {
            field: "phn",
            width: 150,
            headerName: "Mobile",
            filter: "agTextColumnFilter",
        },
        {
            field: "hcftyp",
            width: 150,
            headerName: "HCF type",
        },

        {
            field: "addra",
            width: 150,
            headerName: "Address I",
            tooltipField: 'addra',

        },
        {
            field: "addrb",
            width: 150,
            headerName: "Address II",
            tooltipField: 'addrb',

        },
        {
            field: "addrc",
            width: 150,
            headerName: "Address III",
            tooltipField: 'addrc',

        },
        {
            field: "stt",
            width: 100,
            headerName: "State/UT",
            hide: true,
        },
        {
            field: "rgd",
            width: 180,
           headerName: "Regional directorate",
            hide: true,
        },
        {
            field: "eml",
            width: 200,
            headerName: "Email",
            hide: true,
        },
        {
            field: "cnsntapplno",
            width: 180,
            headerName: "Consent application no.",
            hide: false,
        },
    ];

    const colDefPdf = [
        {
            field: "hcfnm",
            width: 320,
            headerName: "Health care facility",
            tooltipField: 'hcfnm',
            filter: "agTextColumnFilter",
        },
        {
            field: "hcfcod",
            width: 150,
             headerName: "SPCB/PCC code",
            tooltipField: "tphcf",
            filter: "agTextColumnFilter",
        },
        {
            field: "cty",
            width: 200,
            headerName: "City",
        },
        {
            field: "cntprsn",
            width: 200,
            headerName: "Contact person",
            filter: "agTextColumnFilter",
        },
        {
            field: "phn",
            width: 150,
            headerName: "Mobile",
            filter: "agTextColumnFilter",
        },
        {
            field: "hcftyp",
            width: 70,
            headerName: "HCF type",
        },

        {
            field: "addra",
            width: 150,
            headerName: "Address I",
            tooltipField: 'addra',

        },
        {
            field: "addrb",
            width: 150,
            headerName: "Address II",
            tooltipField: 'addrb',

        },
        {
            field: "addrc",
            width: 150,
            headerName: "Address III",
            tooltipField: 'addrc',

        },
        {
            field: "nobd",
            width: 150,
            headerName: "No of beds",
        },
        {
            field: "cnsntapplno",
            width: 180,
            headerName: "Consent application no.",
        },

    ]
    const hideInRgd = getLvl() == 'RGD' ? true : false;
    const hideInStt = getLvl() == 'STT' ? true : false;
    const hideInCpcb = getLvl() == 'CPCB' ? true : false;

    const pdfColWidth = ['15%', '10%', '5%', '10%', '10%', '5%', '10%', '10%', '10%', '10%']

    const printExcelHeader = ["HCF TYPE", "NO OF BEDS", "HCF", "CITY", "STATE", "REGIONAL DIRECTORATE", "CONTACT PERSON", "ADDRESS I", "ADDRESS II", "ADDRESS III", "PIN CODE"]
    const keyOrder: string[] = ['hcftyp', 'nobd', 'hcfnm', 'cty', 'stt', 'rgd', 'cntprsn', 'addra', 'addrb', 'addrc', 'pnc']
    const excelColWidth = [{ wch: 10 }, { wch: 10 }, { wch: 50 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }]
    const onRowSelected = (data: string) => {
        let ech: string[] = data.split("|");
        let tempData = {
            hcfnm: ech[0],
            hcfcod: ech[1],
            addra: ech[8],
            addrb: ech[9],
            addrc: ech[10],
            stt: ech[11],
            eml: ech[12],
            nobd: ech[13],
            bluscl: ech[15],
            andrapp: ech[16],
            rgd: ech[14],
            cty: ech[2],
            cntpr: ech[3],
            phn: ech[4],
            hcftyp: ech[5],
            lgt: ech[7],
            ltt: ech[6],
        };
        handleOpen(tempData);
    };

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

        let value1 = new Date().getFullYear()
        setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}`)
        let lvl = sessionStorage.getItem('lvl')

        if (lvl && lvl == 'RGD') {
            getSttlistForRgd()
        }
    })


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

    const GetDataRgd = () => {
        let payload: any = {};
        return nrjAxiosRequestBio('rgdlst', payload);
    };

    const getDataState = () => {

        let lvl = sessionStorage.getItem('lvl')
        if (lvl !== 'RGD') {
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




    const { data: datac, refetch: fetchRgd } = useQuery({
        queryKey: ["GetDataRgd"],
        queryFn: GetDataRgd,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: rgdCombo,
    });

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




    useEffectOnce(() => {
        if (getLvl() == "RGD") {
            fetchRgd();
        }

        if (getLvl() == "STT") {
            refetchHcfList()
        }
    })


    const [year, setYear] = useState('')


    const onChangeDts = (data: string) => {

        let fld: any = utilities(2, data, "");
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        if (fld == 'dt_yearid') {
            console.log("99999", data)
            setYear(getFldValue(data, 'dt_yearid').split('|')[0])
            setRgdValue("")
            setSttValue('')
        }
    };




    const { showToaster, hideToaster } = useToaster();

    const getBtnA = (data: any) => {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setGrdcnt(0)
        setTimeout(() => {
            refetchHcfList();
            setCurPageCount(0);
            setShowStaticMap(true)
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        }, 400);
    };

    const GetHCFConsentList = () => {

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

        const payload: any = postLinux(lvl + '=' + who + '=' + grdCnt, 'hcfconsentlist');
        return nrjAxiosRequestBio("hcf_consent_list", payload);
    };

    const staticMap = () => {

        window.open(
            "/bhuvanmap?pageNumber=" + actvPage + "&gid=" + state.gid,
            "_blank"
        );
    };

    const ShowHcfList = (data4: any) => {
        setIsLoading("");
        // let dt: string = GetResponseWnds(data4);
        if (Array.isArray(data4.data) && data4.data.length) {
            // let ary: any = dataStr_ToArray(dt);
            let ary: any[] = data4.data

            ary = clrNAValue(ary, state.grdcnt);
            if (!ary) {
                return;
            }
            ary = gridAddToolTipColumn(
                ary,
                "tphcf",
                " details of Geolocation",
                "hcfnm",
                "ltt"
            );
            if (ary) {
                setGrdcnt(grdCnt + ary.length)
            }
            // if (state.nwRow !== null) {
            //     ary = state.nwRow.concat(ary);
            // }

            dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
        }
        else {
            showToaster(["No data received"], "error");
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    };

    const { data: data4, refetch: refetchHcfList } = useQuery({
        queryKey: ["hcfconsentlist", lvl, who, year],
        queryFn: GetHCFConsentList,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowHcfList,
    });

    const parentPagination = (data: any) => {

        let pgCnt: number = data.api.paginationProxy.totalPages;
        let curPg: number = data.api.paginationProxy.currentPage;
        if (pgCnt) {
            if (pgCnt > 0) {
                setActvPage(curPg + 1);
                if (curPg) {
                    let ps: number = pgCnt - curPg;
                    if (ps <= 1 && curPageCount < pgCnt) {
                        refetchHcfList();
                        setCurPageCount(pgCnt);
                    }
                }
            }
        }
    };

    const [modelData, setModelData] = useState<any>({});
    const [open, setOpen] = useState(false);
    const [stabiliser, setStabiliser] = useState<boolean>(true);

    const handleOpen = (data: any) => {
        if (stabiliser) {
            setOpen(true);
            setModelData(data);
            setStabiliser(!stabiliser);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setStabiliser(!stabiliser);
    };

    const [open1, setOpen1] = useState(false);
    const [stabiliser1, setStabiliser1] = useState<boolean>(true);

    const handleOpen1 = (data: any) => {

        if (stabiliser) {
            dispatch({ type: ACTIONS.RANDOM, payload: 1 });
            setOpen1(true);
            setStabiliser1(!stabiliser1);
        }
    };

    const handleClose1 = () => {
        setOpen1(false);
        setStabiliser1(!stabiliser1);
        dispatch({ type: ACTIONS.TRIGGER_GRIDSRCH, payload: 5 });

    };
    let hsp: string = "";
    const searchName = () => {
        setShowStaticMap(false)
        hsp = getFldValue(state.textDts, "hsp");
        if (hsp) {
            if (hsp.length > 2) {
                refetchSearchHcf();
            }
        } else {
            dispatch({ type: ACTIONS.TRIGGER_GRIDSRCH, payload: 5 });
        }
    };
    const GetFilteredHcf = () => {
        let filter = { filterName: "", filterValue: hsp };

        // let api = createGetApi(
        //   "db=nodb|dll=x|fnct=a199",
        //   who + "=" + `${filter.filterValue}=0=`
        // );
        // return nrjAxios({ apiCall: api });

        const payload: any = postLinux(who + '=hcf=' + filter.filterValue, 'gridDisplaySearch');
        return nrjAxiosRequestBio("findInDB", payload);
    };

    const GetFilteredHcfSuccess = (data: any) => {
        // let dt: string = GetResponseWnds(data);

        if (data.data && data.data.data && Array.isArray(data.data.data)) {
            let ary: any[] = data.data.data;
            ary = clrNAValue(ary, 1);
            if (Array.isArray(ary)) {
                ary = gridAddToolTipColumn(
                    ary,
                    "tphcf",
                    " details of Geolocation",
                    "hcfnm",
                    "ltt"
                );
                ary = [...ary].sort((a, b) => a.cty.localeCompare(b.cty))
                ary = [...ary].sort((a, b) => a.hcfnm.localeCompare(b.hcfnm))
                setGridData(ary);
            }
            dispatch({ type: ACTIONS.NEWROWDATASRCH, payload: ary });
        }
    };

    const { data: data, refetch: refetchSearchHcf } = useQuery({
        queryKey: ["filteredHcff", state.rndm],
        queryFn: GetFilteredHcf,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: GetFilteredHcfSuccess,
    });

    const SvNotFnd = () => {
        let hcf: string = state.textDts;
        hcf = getFldValue(hcf, "hsp");
        if (hcf) {
            refetchSvNot();
        }
    };

    const SvNotSave = () => {
        let hcf: string = state.textDts;
        hcf = getFldValue(hcf, "hsp");
        let api: string = createGetApi(
            "db=nodb|dll=accdll|fnct=a290",
            who + "=" + hcf
        );
        return useNrjAxios({ apiCall: api });
    };

    const updtData = (dataN: any) => {
        let dt: string = GetResponseWnds(dataN);
        if (dt) {
        }
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
        setTimeout(function () {
            dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
        }, 250);
    };

    const { data: dataN, refetch: refetchSvNot } = useQuery({
        queryKey: ["svnotflnd", state.rndm],
        queryFn: SvNotSave,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: updtData,
    });



    const [filterParameter, setFilterParameter] = useState<any>(null)
    const getFilteredParameter = (data: any) => {
        setFilterParameter(data);
    }


    const onChangeRgd = (data: string) => {

        let fldN: any = utilities(2, data, "");
        if (fldN == 'rgdid') {
            setRgdValue(getFldValue(data, 'rgdid').split('|')[0])
        }
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
        dispatch({ type: ACTIONS.SETGID, payload: "" });
        setGrdcnt(0)
        setSttValue(getFldValue(data, 'sttid').split('|')[0])
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    // const getBtnA = () => {
    //     // const data = extractLvlWho();
    //     // props.getBtnA(data);
    //     refetchHcfList()
    // }


    return (
        <>
            <div className="bg-white p-1 pr-2 my-3 pb-2 rounded-lg" style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12)' }}>

                <div className="">
                    <div className="grid grid-cols-3 ml-1 flex items-end">
                        {/* <div className="mr-2 mb-2">
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
                                disable={false}

                            ></WtrRsSelect>
                        </div> */}
                        {/* <div className="mr-2 mb-2">
                            {hideInCpcb && <WtrRsSelect
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
                                // speaker={"Select Regional Directorate"}
                                delayClose={1000}
                                placement="bottom"
                                displayFormat="1"
                                disable={false}
                            ></WtrRsSelect>}
                        </div> */}
                        <div className="mr-2 mb-2 relative">
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
                                // speaker={"Select SPCB"}
                                delayClose={1000}
                                placement="bottom"
                                displayFormat="1"
                                disable={false}
                            ></WtrRsSelect>}
                        </div>
                    </div>

                </div>


            </div>

            <div className="bg-white px-4 pb-6">
                <div className="flex justify-between items-center">
                   <div className=" font-semibold text-lg text-center ">{isLoading}</div>
                    <div className="flex justify-center mt-4">

                        {lvl == 'CBWTF' && who != 'Select a CBWTF to get data' && <div className="mr-3">
                            <Tooltip
                                title={
                                    "Select the Regional directorate, state/UT and CBTWTF to get list of CBWTF"
                                }
                            >
                                <Button
                                    size="medium"
                                    style={{ backgroundColor: "#3490dc", textTransform: "none" }}
                                    variant="contained"
                                    color="success"
                                    className="me-3"
                                    onClick={handleOpen1}
                                >
                                    Search health care facility
                                </Button>
                            </Tooltip>
                        </div>}
                        {lvl == 'CBWTF' && state.gid && who != 'Select a CBWTF to get data' && showStaticMap && <div>
                            <Tooltip
                                title={
                                    "To view the location of  HCF on map, will show the location of HCF on current visible list"
                                }
                            >
                                <Button
                                    size="medium"
                                    style={{
                                        backgroundColor: "#38a169",
                                        transition: "background-color 0.3s, transform 0.3s",
                                    }}
                                    variant="contained"
                                    color="success"
                                    disabled={!state.disableC}
                                    onClick={staticMap}
                                >
                                    Static map
                                </Button>
                            </Tooltip>
                        </div>}
                    </div>
                </div>
                {getLvl() !== "STT" && <div className="mt-3 flex px-2 items-center">

                    <div className="mr-2">
                        <Button
                            size="medium"
                            style={{ backgroundColor: "#3490dc", color: '#fff' ,textTransform: "none"}}
                            variant="contained"
                            color="success"
                            onClick={getBtnA}
                            className="me-3"
                        >
                          Get list
                        </Button>
                    </div>
                </div>}




                <div
                    className="flex justify-center"
                ></div>

                <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    onButtonClicked={onButtonClicked}
                    colDef={coldef}
                    apiCall={""}
                    rowData={gridData}
                    deleteButton={""}
                    deleteFldNm={""}
                    showDataButton={""}
                    showApi={""}
                    showFldNm={""}
                    newRowOnTop={true}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    trigger={state.triggerG}
                    newRowData={state.nwRow}
                    // newRowData={GridAry.value}
                    showPagination={true}
                    showTooltips={true}
                    MyRoute="hcflstgrd"
                    appName="CPCB"
                    parentPaginationChanged={parentPagination}
                    getFilteredParameter={getFilteredParameter}
                    NoRecordEachCall={300}
                    showExport={true}
                    KeyOrder={keyOrder}
                    pageTitle={"List of HCF : "}
                    sortBy={'rgd'}
                    printExcelHeader={printExcelHeader}
                    exceColWidth={excelColWidth}
                    lvl={lvl}
                    who={who}
                    name={name}
                    colDefPdf={colDefPdf}
                    pdfColWidth={pdfColWidth}
                ></NrjAgGrid>
            </div>
            <h5 className="mt-10 px-10">Abbreviations:</h5>
            <div className=" grid grid-cols-4 px-10">

                <div> <span className="font-semibold"> BH : </span> <span> Bedded hospital </span> </div>
                <div> <span className="font-semibold"> CL : </span> <span> Clinic </span> </div>
                <div> <span className="font-semibold"> PL : </span> <span> Pathology laboratory </span> </div>
                <div> <span className="font-semibold"> NH : </span> <span> Nursing home </span> </div>
                <div> <span className="font-semibold"> BB : </span> <span> Blood bank </span> </div>
                <div> <span className="font-semibold"> DI : </span> <span> Dispensary </span> </div>
                <div> <span className="font-semibold"> AH : </span> <span> Animal house </span> </div>
                <div> <span className="font-semibold"> VH : </span> <span> Veterianry hospital </span> </div>
                <div> <span className="font-semibold"> DH : </span> <span> Dental hospital </span> </div>
                <div> <span className="font-semibold"> HC : </span> <span> Health camp </span> </div>
                <div> <span className="font-semibold"> HO : </span> <span> Homeopathy </span> </div>
                <div> <span className="font-semibold"> MH : </span> <span> Mobile hospital </span> </div>
                <div> <span className="font-semibold"> SI : </span> <span> Siddha </span> </div>
                <div> <span className="font-semibold"> UN : </span> <span> Unani </span> </div>
                <div> <span className="font-semibold"> YO : </span> <span> Yoga </span> </div>
                <div> <span className="font-semibold"> FA : </span> <span> Institutions / schools / companies etc with first Aid facilitites </span> </div>

            </div>
            {open && (
                <Modal open={open} size="sm" onClose={handleClose}>
                    <Modal.Header>
                        <Modal.Title>
                            <div className="font-semibold">
                                Health care facility information
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div
                            className="rounded-lg pb-3 px-[4rem]"
                            style={{ backgroundColor: "#fff" }}
                        >
                            <CardHospitalDisplay data={modelData} />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        {/* <Button variant="contained" color="success"  onClick={handleClose}>
                            Ok
                        </Button> */}
                        <Button onClick={handleClose} style={{ textTransform: "none"}}>Cancel</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {open1 && (
                <Modal open={open1} size="md" onClose={handleClose1}>
                    <Modal.Header>
                        <Modal.Title>
                            <div className="font-semibold">
                                Search for health care facility
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div
                            className="rounded-lg pb-3 px-[4rem]"
                            style={{ backgroundColor: "#f5f6fa" }}
                        >
                            <div className="flex justify-between items-center">
                                <WtrInput
                                    Label="HCF Name"
                                    fldName="hsp"
                                    idText="txthsp"
                                    onChange={onChangeDts}
                                    dsabld={false}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn=""
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.triggerHsp}
                                    ToolTip={"Enter Name of HCF"}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>
                                <div className="ml-2">
                                    <Button
                                        size="medium"
                                        className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                                        variant="contained"
                                        onClick={searchName}
                                        style={{ textTransform: "none"}}
                                    >
                                        Search
                                    </Button>
                                </div>
                                <div className="ml-2">
                                    {/* <Button
                    size="medium"
                    className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                    variant="contained"
                    onClick={SvNotFnd}
                  >
                    Add
                  </Button> */}
                                </div>
                            </div>
                            <div className="mt-2">
                                <NrjAgGrid
                                    onGridLoaded={GridLoaded}
                                    onRowSelected={onRowSelected}
                                    onButtonClicked={onButtonClicked}
                                    colDef={coldef}
                                    apiCall={""}
                                    rowData={gridData}
                                    deleteButton={""}
                                    deleteFldNm={""}
                                    showDataButton={""}
                                    showApi="cbwtfid"
                                    showFldNm={""}
                                    newRowOnTop={true}
                                    className="ag-theme-alpine-blue ag-theme-alpine"
                                    trigger={state.triggerSrch}
                                    newRowData={state.nwRowSrch}
                                    // newRowData={GridAry.value}
                                    showPagination={true}
                                    parentPaginationChanged={parentPagination}
                                    NoRecordEachCall={300}

                                ></NrjAgGrid>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleClose1} style={{ textTransform: "none"}}>Cancel</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};
export default React.memo(HcfConsentList);

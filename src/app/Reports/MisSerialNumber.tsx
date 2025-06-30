import React, { useEffect, useReducer, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import utilities, { ChangeCase, GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, getApiFromClinician, getApplicationVersion, getStateAbbreviation, getStateFullFormWho, gridAddToolTipColumn, postLinux, svLnxSrvr, trimField } from '../../utilities/utilities'
import { Button, SvgIcon, Tooltip } from "@mui/material";
import { validForm } from "../../Hooks/validForm";

import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { Navigate, useNavigate } from "react-router-dom";
import { useGetFldValue } from "../../Hooks/useGetFldValue";
import HdrDrp from "../HdrDrp";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios, useNrjAxios, nrjAxiosRequest, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import { Toaster } from "../../components/reusable/Toaster";
import { getLvl, getWho } from '../../utilities/cpcb';
import LevelSelector from '../dshbrd/LevelSelector';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CustomTabPanel from './CustomTabPanel';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { useToaster } from '../../components/reusable/ToasterContext';
import moment from "moment";
import { format } from 'date-fns'

const ACTIONS = {
    TRIGGER_GRID: "grdtrigger",
    NEWROWDATA: "newrow",
    NEWROWDATAB: "newrowB",
    RANDOM: "rndm",
    TRIGGER_FORM: "trgfrm",
    FORM_DATA: "frmdata",
    SETFORM_DATA: "setfrmdata",
    MAINID: "mnid",
    CHECK_REQ: "chckreq",
    CHECK_REQDONE: "chckreqdn",
    SETGID: "gd",
    NEWFRMDATA: "frmdatanw",
    DISABLE: "disable",
    FORM_DATA2: "formdata2",
    SETCOMBOSTRB: "cmbstrB",
    SETCOMBOSTRC: "cmbstrC",
};

const initialState = {
    triggerG: 0,
    nwRow: [],
    nwRowB: [],
    rndm: 0,
    trigger: 0,
    textDts: "",
    mainId: 0,
    errMsg: [],
    openDrwr: false,
    frmData: "",
    gid: "",
    disableA: 1,
    disableB: 1,
    disableC: 1,
    combostrB: "",
    combostrC: "",
};

type purBill = {
    triggerG: number;
    nwRow: any;
    nwRowB: any;
    rndm: number;
    trigger: number;
    textDts: string;
    mainId: number;
    errMsg: any;
    openDrwr: boolean;
    frmData: string;
    gid: string;
    disableA: number,
    disableB: number,
    disableC: number,
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
            newstate.triggerG += 10;
            return newstate;
        case ACTIONS.NEWROWDATAB:
            newstate.nwRowB = action.payload;
            newstate.triggerG += 10;
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
        case ACTIONS.FORM_DATA2:
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
        case ACTIONS.SETGID:
            newstate.gid = action.payload;
            return newstate;
        case ACTIONS.SETCOMBOSTRB:
            newstate.combostrB = action.payload;
            return newstate;
        case ACTIONS.SETCOMBOSTRC:
            newstate.combostrC = action.payload;
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

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


const MisSerialNumber = (props: any) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState("")
    const [state, dispatch] = useReducer(reducer, initialState);
    const [lvl, setLvl] = useState("");
    const [who, setWho] = useState("");
    const [total, setTotal] = useState(0)
    const [valueType, setValueType] = React.useState<number>(0);

    const valueFormatter = (params: any) => {
        console.log("Received value:", params?.value);
    
        if (!params?.value || typeof params.value !== "string") {
            console.warn("Invalid date value:", params?.value);
            return "-";
        }
    
        const dateSegments = params.value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g);
        console.log("Extracted date segments:", dateSegments);
    
        if (dateSegments && dateSegments.length > 0) {
            const date = new Date(dateSegments[0]);
            console.log("Parsed Date:", date);
    
            if (!isNaN(date.getTime())) {
                return format(date, "dd-MMM-yyyy");
            }
        }
    
        return "-";
    };
    
    const [coldef, setColdef] = useState<any[]>([{ field: 'id', hide: true, width: 0, headerName: '' },
    { field: 'cbwtfid', hide: true, width: 150, headerName: 'CBWTFID' },
    {
        field: "dt_rpt",
        hide: false,
        width: 150,
        headerName: "Date",
        filter: "agTextColumnFilter",
        // valueFormatter: (params: any) => {
        //     let dateSegments: any[] = [];
        //     dateSegments = params.value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g);
        //     let formattedDate = '';

        //     if (dateSegments) {
        //         for (let i = 0; i < dateSegments.length; i++) {
        //             const date = new Date(dateSegments[i]);
        //             if (!isNaN(date.getTime())) {
        //                 formattedDate = format(date, 'dd-MMM-yyyy');
        //                 break; // Stop processing after the first valid date is found
        //             }
        //         }
        //     }

        //     // Return the formatted date
        //     return formattedDate;

        // },
        valueFormatter: valueFormatter, // Use the fixed function
        
    },
    { field: 'cbwtfnm', hide: false, width: 320, headerName: 'Name of CBWTF', filter: 'agTextColumnFilter', tooltipShowDelay: 0, tooltipField: 'cbwtfnm', },
    { field: "dts", hide: true, width: 270, headerName: "Bags" },
    { field: "scnby", hide: false, width: 160, headerName: "Scan by" },
    { field: 'srno', hide: false, width: 260, headerName: 'Count (with serial number)' },
    { field: 'nosrno', hide: false, width: 280, headerName: 'Count (without serial number)' },
    { field: 'ttl', hide: false, width: 130, headerName: 'Total' }
    ])


    const colDefPdf = [
        { field: 'cbwtfnm', hide: false, width: 400, headerName: 'Name of CBWTF', filter: 'agTextColumnFilter', tooltipShowDelay: 0, tooltipField: 'cbwtfnm', },
        { field: "scnby", hide: false, width: 270, headerName: "Scan By" },
        { field: 'srno', hide: false, width: 290, headerName: 'Count (with serial number)' },
        { field: 'nosrno', hide: false, width: 290, headerName: 'CCount (without serial number' },
        { field: 'ttl', hide: false, width: 290, headerName: 'Total' }
    ]
    const pdfColWidth = ['20%', '15%', '20%', '20%', '15%']


    const excelColWidth = [{ wch: 50 }, { wch: 30 }, { wch: 30 }, { wch: 30 }]

    const [printExcelHeader, setPrintExcelHeader] = useState<any[]>([])
    const [keyOrder, setKeyOrder] = useState<any[]>([])

    useEffect(() => {
        let tempOne: any[] = [];
        let tempTwo: any[] = [];
        coldef.forEach((res: any) => {
            if (res.children) {
                let str = res.headerName + " ";
                res.children.forEach((element: any) => {
                    tempOne.push(element.field);
                    tempTwo.push(str + element.headerName)
                });
            }
            else if (!res['hide']) {
                tempOne.push(res.field);
                tempTwo.push(res.headerName)
            }
        })
        setPrintExcelHeader(tempTwo);
        setKeyOrder(tempOne)
    }, [coldef])



    const reqFlds: any = [];

    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const rowData: any[] = []
    const onRowSelected = (data: string) => { }
    const GridLoaded = () => { }
    const onButtonClicked = (action: string, rw: any) => { }
    const [summaryRowData, setSummaryRowData] = useState<any[]>([])
    const [detailedRowData, setDetailedRowData] = useState<any[]>([])

    let cbwtfid = ""
    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };
    const { showToaster, hideToaster } = useToaster();

    const svClick = () => {
        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
    
        if (msg && msg[0]) {
            showToaster(msg, 'error');
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
            }, 5000);
            return;
        }
        // if (who == 'Select a CBWTF to get data') {
        //     showToaster(['Select from the above dropdowns'], 'error');
        //     return;
        // }
        dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        setTimeout(() => {
            refetch();
            //refetch2();
        }, 400)
    };

    const getList = (type: number) => {
        setTotal(0)
        handleChange(undefined, 0);
        setIsLoading("Loading data...")
        let dateFrm = getFldValue(state.textDts, "dt_rptfrm")
        let dateTo = getFldValue(state.textDts, "dt_rptto")
        if (!dateFrm) {
            dateFrm = moment(Date.now()).format("DD-MMM-yyyy")

        } else if (!dateTo) {
            dateTo = moment(Date.now()).format("DD-MMM-yyyy")
        }
        let dtFrm = UseMomentDateNmb(dateFrm);
        let dtTo = UseMomentDateNmb(dateTo);
        let dtwise = true
        // let dt = UseMomentDateNmb(getFldValue(state.textDts, "dt_rpt"));
        let gid: any = utilities(3, "", "");
        let gd: string = gid
        // let api: string = "";
        dispatch({ type: ACTIONS.SETGID, payload: gd })
        let endpoint: string = "show_srnoCtg"
        if (type == 0) {

        }
        const payload: any = postLinux(lvl + '=' + who + '=' + "" + '=' + dtFrm + '=' + dtTo + '=' + dtwise + '=' + gd, 'serialnumber');
        return nrjAxiosRequestBio(endpoint, payload);

        // api = createGetApi("db=nodb|dll=xrydll|fnct=a204", dt + "=" + gd + "=" + lvl + '=' + who + "=" + type)
        // return nrjAxios({ apiCall: api })
    }

    const ShowData = (dataSvd1: any) => {
        setIsLoading("")
        // let dt: string = GetResponseWnds(dataSvd1);
        let dt: any = GetResponseLnx(dataSvd1);
        let ary: any = [];
        if (dt && Array.isArray(dt) && dt.length) {
            let total = 0
            ary = dt
            let tempSummary: any[] = [];
            let tempDetailed: any = {};
            let tempCbwtf = {
                "scnby": 'Operator',
                "srno": 0,
                "nosrno": 0,
                "dt_rpt": ""
            };
            let tempHcf = {
                "scnby": 'HCF',
                "srno": 0,
                "nosrno": 0,
                "dt_rpt": ""
            };
            let tempFct = {
                "scnby": 'CBWTF',
                "srno": 0,
                "nosrno": 0,
                "dt_rpt": ""
            };

            ary.forEach((res: any) => {

                if (lvl == 'CPCB') {
                    if (!tempDetailed[res.rgd]) {
                        tempDetailed[res.rgd] = [
                            { cbwtfnm: res.rgd, scnby: res.scnby, srno: res.srno, nosrno: res.nosrno }]
                    }
                    else {
                        let index = -1;
                        for (let i = 0; i < tempDetailed[res.rgd].length; i++) {
                            if (res.scnby == tempDetailed[res.rgd][i].scnby) {
                                index = i;
                            }
                        }
                        if (index >= 0) {
                            tempDetailed[res.rgd][index].srno = Number(tempDetailed[res.rgd][index].srno) + Number(res.srno);
                            tempDetailed[res.rgd][index].nosrno = Number(tempDetailed[res.rgd][index].nosrno) + Number(res.nosrno);
                            
                        }
                        else {
                            tempDetailed[res.rgd].push({ srno: res.srno, cbwtfnm: res.rgd, scnby: res.scnby, nosrno: res.nosrno })
                        }
                    }
                }
                else if (lvl == 'RGD') {
                    if (!tempDetailed[res.stt]) {
                        tempDetailed[res.stt] = [{ cbwtfnm: getStateFullFormWho(res.stt), scnby: res.scnby, srno: res.srno, nosrno: res.nosrno }]
                    }
                    else {
                        let index = -1;
                        for (let i = 0; i < tempDetailed[res.stt].length; i++) {
                            if (res.scnby == tempDetailed[res.stt][i].scnby) {
                                index = i;
                            }
                        }
                        if (index >= 0) {
                            tempDetailed[res.stt][index].srno += res.srno;
                            tempDetailed[res.stt][index].nosrno += res.nosrno;
                        }
                        else {
                            tempDetailed[res.stt].push({ srno: res.srno, cbwtfnm: getStateFullFormWho(res.stt), scnby: res.scnby, nosrno: res.nosrno })
                        }
                    }
                }
                else if (lvl == 'STT') {
                    if (!tempDetailed[res.cbwtfnm]) {
                        tempDetailed[res.cbwtfnm] = [{ cbwtfnm: res.cbwtfnm, scnby: res.scnby, srno: res.srno, nosrno: res.nosrno }]
                    }
                    else {
                        let index = -1;
                        for (let i = 0; i < tempDetailed[res.cbwtfnm].length; i++) {
                            if (res.scnby == tempDetailed[res.cbwtfnm][i].scnby) {
                                index = i;
                            }
                        }
                        if (index >= 0) {
                            tempDetailed[res.cbwtfnm][index].srno += res.srno;
                            tempDetailed[res.cbwtfnm][index].nosrno += res.nosrno;
                        }
                        else {
                            tempDetailed[res.cbwtfnm].push({ srno: res.srno, cbwtfnm: res.cbwtfnm, scnby: res.scnby, nosrno: res.nosrno })
                        }
                    }
                }
                if (res.scnby == 'cbwtf') {
                    tempCbwtf.srno = Number(tempCbwtf.srno) + Number(res.srno);
                    tempCbwtf.nosrno = Number(tempCbwtf.nosrno) + Number(res.nosrno);
                    tempCbwtf.dt_rpt += res.dt_rpt;

                }
                else if (res.scnby == 'hcf') {
                    tempHcf.srno = Number(tempHcf.srno) + Number(res.srno);
                    tempHcf.nosrno = Number(tempHcf.nosrno) + Number(res.nosrno);
                    tempHcf.dt_rpt += res.dt_rpt;
                }
                else {
                    // tempFct.srno += res.srno;
                    // tempFct.nosrno += res.nosrno;
                    tempFct.srno = Number(tempFct.srno) + Number(res.srno);
                    tempFct.nosrno = Number(tempFct.nosrno) + Number(res.nosrno);
                    tempFct.dt_rpt += res.dt_rpt;
                }
            })
            if (lvl == 'CPCB') {
                tempSummary = [{ ...tempCbwtf, cbwtfnm: 'CPCB' }, { ...tempFct, cbwtfnm: 'CPCB' }, { ...tempHcf, cbwtfnm: 'CPCB' }]
            }
            else if (lvl == 'STT') {
                tempSummary = [{ ...tempCbwtf, cbwtfnm: getStateFullFormWho(who) }, { ...tempFct, cbwtfnm: getStateFullFormWho(who) }, { ...tempHcf, cbwtfnm: getStateFullFormWho(who) }]
            }
            else if (lvl == 'RGD') {
                tempSummary = [{ ...tempCbwtf, cbwtfnm: who }, { ...tempFct, cbwtfnm: who }, { ...tempHcf, cbwtfnm: who }]
            }
            else {

                tempSummary = [{ ...tempCbwtf, cbwtfnm: ary[0].cbwtfnm }, { ...tempFct, cbwtfnm: ary[0].cbwtfnm }, { ...tempHcf, cbwtfnm: ary[0].cbwtfnm }]
            }
            let det: any[] = [];
            Object.values(tempDetailed).forEach((el: any) => {
                for (let e of el) {
                    det.push({ ...e, ttl: e.srno + e.nosrno, scnby: e.scnby == 'fct' ? 'At CBWTF' : e.scnby == 'cbwtf' ? 'Operator' : 'HCF' });
                }
            })
            if (Array.isArray(det) && det.length > 0) {
                det=trimField(det,"cbwtfnm")

                det = [...det].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
                tempSummary = [...tempSummary].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
              }
              
         
            
            setDetailedRowData(det)
            // setSummaryRowData(tempSummary.map((res: any) => {
            //     total += Number(res.nosrno) + Number(res.srno)
            //     return {
            //         ...res,
            //         ttl: res.srno + res.nosrno
            //     }
            // }));
            const temp = tempSummary.map((res: any) => {
                const ttl = Number(res.nosrno) + Number(res.srno);
                total += ttl;
                return {
                    ...res,
                    ttl
                };
            });
            setSummaryRowData(temp)
            dispatch({ type: ACTIONS.NEWROWDATAB, payload: det });
            dispatch({ type: ACTIONS.NEWROWDATA, payload: temp });
        
            setTotal(total);
        }
        else {
            showToaster([dt], 'error');
        }



    };

    const { data: dataSvd1, refetch: refetch } = useQuery({
        queryKey: ["svOldForm1", lvl, who],
        queryFn: () => getList(1),
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });






    const handleChange = (event: React.SyntheticEvent | undefined, newValue: number) => {
        setValueType(newValue);
        let updatedColdef = [...coldef];

        if (lvl == "RGD") {
            updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "RGD" } : { ...updatedColdef[3], headerName: "State/UT", }; // Update the headerName of the second element
            setColdef(updatedColdef);

        } else if (lvl.toUpperCase() == "STT") {
            updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[3], headerName: "CBWTF" }; // Update the headerName of the second element
            setColdef(updatedColdef);
        } else if (lvl == "CBWTF") {
            updatedColdef[3] = { ...updatedColdef[3], headerName: "CBWTF" };
            setColdef(updatedColdef);
        } else {
            updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "CPCB" } : { ...updatedColdef[3], headerName: "Board" };
            setColdef(updatedColdef);
        }
    };


    const cellClassRulesValues = [
        {
            cellName: 'dts',
            color: 'yellow-row',
            value: 'Yellow Bags',
            colorEntireRow: true
        },
        {
            cellName: 'dts',
            color: 'red-row',
            value: 'Red Bags',
            colorEntireRow: true
        },
        {
            cellName: 'dts',
            color: 'blue-row',
            value: 'Blue Bags',
            colorEntireRow: true
        },
        {
            cellName: 'dts',
            color: 'white-row',
            value: 'White Bag',
            colorEntireRow: true
        },
        {
            cellName: 'dts',
            color: 'cyt-row',
            value: 'Cytotoxic Bags',
            colorEntireRow: true
        },
        {
            cellName: 'dts',
            color: 'all-row',
            value: 'All Bags',
            colorEntireRow: true
        },
    ]

    const setLvlWhoData = (data: any) => {
        if (lvl == "CBWTF") {
            setValueType(0)
        }
        setTotal(0)
        setLvl(data.lvl);
        setWho(data.who);

        onChangeDts(data.dateFrom);
        onChangeDts(data.dateTo);
        setDetailedRowData([])
        setSummaryRowData([])
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
        let updatedColdef = [...coldef];
        if (data.lvl == "RGD") {
            updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "Board" } : { ...updatedColdef[3], headerName: "State/UT" }; // Update the headerName of the second element
            setColdef(updatedColdef);

        } else if (data.lvl.toUpperCase() == "STT") {
            updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[3], headerName: "CBWTF" }; // Update the headerName of the second element
            setColdef(updatedColdef);
        } else if (data.lvl == "CBWTF") {
            updatedColdef[3] = { ...updatedColdef[3], headerName: "CBWTF" };
            setColdef(updatedColdef);
        } else {
            updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "CPCB" } : { ...updatedColdef[3], headerName: "Board" }; // Update the headerName of the second element
            setColdef(updatedColdef);
        }
    }

    const PrintGeo = () => {
        let gid: string = state.gid;
        let api: string = createGetApi(
            "db=nodb|dll=dummy|fnct=dummy ",
            gid + "=" + who + "=" + lvl
        );
        return nrjAxios({ apiCall: api });
    };

    const showRpt = (dataPr: any) => {
        let dt: string = GetResponseWnds(dataPr);
        dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        if (dt && dt.indexOf(".pdf") > -1) {
            window.open(dataPr.data[0]["Data"], "_blank");
        } else {
            setShowMessage({
                message: ["Please try again after refreshing the page!"],
                type: "error",
            });
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    };


    const { data: dataPr, refetch: refetchPr } = useQuery({
        queryKey: ["prntlist", state.rndm],
        queryFn: PrintGeo,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: showRpt,
    });

    function printClick(data: any) {
        refetchPr();
    }


    useEffect(() => {
        let tempOne: any[] = [];
        let tempTwo: any[] = [];
        coldef.forEach((res: any) => {
            if (res.children) {
                let str = res.headerName + " ";
                res.children.forEach((element: any) => {
                    tempOne.push(element.field);
                    tempTwo.push(str + element.headerName)
                });
            }
            else if (!res['hide']) {
                tempOne.push(res.field);
                tempTwo.push(res.headerName)
            }
        })
        setPrintExcelHeader(tempTwo);
        setKeyOrder(tempOne)
    }, [coldef])



    return (
        <>
            <LevelSelector
                showCbwtf={false}
                // dateField={true}
                dateFieldFrom={true}
                dateFieldTo={true}
                levelSelectorData={setLvlWhoData}
                getListButton={true}
                getListOnclick={svClick}
                printButton={false}
                printButtonClick={printClick}
            ></LevelSelector>

            <div className="">
                <div className="shadow rounded-lg bg-white">
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={valueType} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="Summary" {...a11yProps(0)} />
                                {lvl !== "CBWTF" ?
                                    <Tab label="Details" {...a11yProps(1)} /> :
                                    null}

                            </Tabs>
                        </Box>
                        <CustomTabPanel value={valueType} index={0}>
                            {total ? <div className="border rounded-lg">
                                <div className="p-3">
                                    <div className="flex font-semibold">
                                        Total waste bags : {total}
                                    </div>
                                </div>
                            </div> : <></>}
                           <div className=" font-semibold text-lg text-center ">{isLoading}</div>
                            {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                                <Toaster data={showMessage} className={''}></Toaster>
                            </div> : <></>}

                            <NrjAgGrid
                                onButtonClicked={onButtonClicked}
                                onGridLoaded={GridLoaded}
                                onRowSelected={onRowSelected}
                                colDef={coldef}
                                apiCall={""}
                                rowData={summaryRowData}
                                deleteButton={""}
                                deleteFldNm={""}
                                showPagination={true}
                                hideSerialNo={true}
                                className="ag-theme-alpine-blue ag-theme-alpine"
                                cellClassRulesValues={cellClassRulesValues}
                                showExport={true}
                                pageTitle={"Summary of waste bags with and without serial number : "}
                                printExcelHeader={printExcelHeader}
                                exceColWidth={excelColWidth}
                                KeyOrder={keyOrder}
                                lvl={lvl}
                                who={who}
                                colDefPdf={colDefPdf}
                                pdfColWidth={pdfColWidth}
                                newRowData={state.nwRow}
                                trigger={state.triggerG}
                            ></NrjAgGrid>
                        </CustomTabPanel>
                        {lvl !== "CBWTF" ?
                            <CustomTabPanel value={valueType} index={1}>
                               <div className=" font-semibold text-lg text-center ">{isLoading}</div>
                                {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                                    <Toaster data={showMessage} className={''}></Toaster>
                                </div> : <></>}
                                <NrjAgGrid
                                    onButtonClicked={onButtonClicked}
                                    onGridLoaded={GridLoaded}
                                    onRowSelected={onRowSelected}
                                    // onCellEdited={OnCellEdited}
                                    colDef={coldef}
                                    apiCall={""}
                                    rowData={detailedRowData}
                                    deleteButton={""}
                                    deleteFldNm={""}
                                    showPagination={true}
                                    hideSerialNo={true}
                                    className="ag-theme-alpine-blue ag-theme-alpine"
                                    cellClassRulesValues={cellClassRulesValues}
                                    showExport={true}
                                    pageTitle={"Summary of waste bags with and without serial number "}
                                    printExcelHeader={printExcelHeader}
                                    exceColWidth={excelColWidth}
                                    KeyOrder={keyOrder}
                                    lvl={lvl}
                                    who={who}
                                    newRowData={state.nwRowB}
                                    trigger={state.triggerG}
                                ></NrjAgGrid>
                            </CustomTabPanel> : null}

                    </Box>
                </div>
            </div>
        </>

    );
}; export default React.memo(MisSerialNumber);

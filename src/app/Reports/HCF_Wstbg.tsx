import React, { useReducer, useState } from 'react'
import axios from 'axios'
import { validForm } from '../../Hooks/validForm'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, getApiFromBiowaste, getStateFullFormWho, postLinux, svLnxSrvr, trimField } from '../../utilities/utilities'
import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { nrjAxios, nrjAxiosRequest, nrjAxiosRequestBio, useNrjAxios } from '../../Hooks/useNrjAxios';
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import { Toaster } from '../../components/reusable/Toaster'
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry'
import LevelSelector from '../dshbrd/LevelSelector'
import { useToaster } from '../../components/reusable/ToasterContext'
import NrjAgBtn from "../../components/reusable/NrjAgBtn";
import { getLvl } from '../../utilities/cpcb'
import { getWho } from '../../utilities/cpcb'

import moment from "moment";

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
    NEWFRMDATA: "frmdatanw"
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
    }
};


const Hcf_Wstbg = () => {
    //#############Constants for the State and other functions
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] })
    const [isLoading, setIsLoading] = useState("");
    const [lvl, setLvl] = useState("");
    const [who, setWho] = useState("");
    const [value, setValue] = useState(0);
    const reqFlds = [{}];
    const coldef = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'hcfnm', hide: false, width: 200, headerName: 'HCF name', tooltipField: "hcfnm" },
        { field: 'state', hide: false, width: 130, headerName: 'State/UT' },
        { field: 'clr', hide: false, width: 100, headerName: 'Color' },
        { field: 'lblno', hide: false, width: 205, headerName: ' Barcode label number' },
        { field: 'wt', hide: false, width: 140, headerName: 'Weight (in kg)' },
        { field: 'scndis', hide: false, width: 180, headerName: 'Distance (in meter)' },
        
        //{ field: 'hcfcod', hide: false, width: 150, headerName: 'HCF Code' },
        //{ field: 'cbwtfnm', hide: false, width: 150, headerName: 'Name of CBWTF' },
        // { field: 'ltt', hide: false, width: 150, headerName: 'Latitude' },
        // { field: 'lgt', hide: false, width: 150, headerName: 'Longitude' },
        { field: 'scby', hide: false, width: 105, headerName: 'Scan by' },
        { field: 'bluscl', hide: false, width: 150, headerName: 'Bluetooth scale' },
        { field: 'srno', hide: false, width: 140, headerName: 'Serial number' },
        { field: 'blustr', hide: false, width: 200, headerName: 'Bluetooth string' },
     
        { field: 'ip_address', hide: false, width: 130, headerName: 'IP address' }
    ];

    const colDefPdf =[
        { field: 'clr', hide: false, width: 130, headerName: 'Color' },
        { field: 'lblno', hide: false, width: 210, headerName: 'Label number' },
        { field: 'wt', hide: false, width: 120, headerName: 'Weight' },
        { field: 'scndis', hide: false, width: 180, headerName: 'Distance (in meter)' },
        { field: 'hcfnm', hide: false, width: 240, headerName: 'HCF name', tooltipField: "hcfnm" },
        { field: 'scby', hide: false, width: 150, headerName: 'Scan by' },
        { field: 'bluscl', hide: false, width: 150, headerName: 'Bluetooth scale' },
        { field: 'srno', hide: false, width: 150, headerName: 'Serial Number' },
        { field: 'blustr', hide: false, width: 250, headerName: 'Bluetooth string' },
        { field: 'state', hide: false, width: 150, headerName: 'State/UT' },
        { field: 'ip_address', hide: false, width: 150, headerName: 'IP address' }
    ]

    const pdfColWidth=['10%','10%','5%','8%' ,'10%' ,'15%','5%','8%','8%','5%','5%']

    const coldefPrint = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'clr', hide: false, width: 130, headerName: 'Color' },
        { field: 'lblno', hide: false, width: 210, headerName: 'Label number' },
        { field: 'wt', hide: false, width: 120, headerName: 'Weight' },
        { field: 'scndis', hide: false, width: 180, headerName: 'Distance (in meter)' },
        { field: 'hcfnm', hide: false, width: 240, headerName: 'HCF name', tooltipField: "hcfnm" },
        //{ field: 'hcfcod', hide: false, width: 150, headerName: 'HCF Code' },
        //{ field: 'cbwtfnm', hide: false, width: 150, headerName: 'Name of CBWTF' },
        // { field: 'ltt', hide: false, width: 150, headerName: 'Latitude' },
        // { field: 'lgt', hide: false, width: 150, headerName: 'Longitude' },
        { field: 'scby', hide: false, width: 150,  headerName: 'Scan by' },
        { field: 'bluscl', hide: false, width: 150, headerName: 'Bluetooth scale' },
        { field: 'srno', hide: false, width: 150, headerName: 'Serial Number' },
        { field: 'blustr', hide: false, width: 250, headerName: 'Bluetooth string' },
        { field: 'state', hide: false, width: 150, headerName: 'State' },
        { field: 'ip_address', hide: false, width: 150, headerName: 'IP address' }];

        const printExcelHeader = ["Color","Label Number", "Weight", "Distance (in meter)", "HCF Name", "Scan By", "Bluetooth Scale", "Serial Number","Bluetooth String","State","IP Address"]
        const KeyOrder: string[] = ['clr','lblno','wt','scndis', 'hcfnm', 'scby','bluscl','srno','blustr','state','ip_address']
        const excelColWidth = [{wch: 30},{wch: 30},{wch: 30}, {wch: 30}, {wch: 30}, {wch: 30}, {wch: 30}, {wch: 30},{wch: 30}, {wch: 30}, {wch: 50}]

        
    // const cellClassRulesValues = [
    //     {
    //         cellName: 'clr',
    //         color: 'red-row',
    //         value: 'Red',
    //         colorEntireRow: true
    //     },
    //     {
    //         cellName: 'clr',
    //         color: 'yellow-row',
    //         value: 'Yellow',
    //         colorEntireRow: true
    //     },
    //     {
    //         cellName: 'clr',
    //         color: 'white-row',
    //         value: 'White',
    //         colorEntireRow: true
    //     },
    //     {
    //         cellName: 'clr',
    //         color: 'blue-row',
    //         value: 'Blue',
    //         colorEntireRow: true
    //     },
    //     {
    //         cellName: 'clr',
    //         color: 'cyt-row',
    //         value: 'Cytotoxic',
    //         colorEntireRow: true
    //     },
    // ]

    const cellClassRulesValues = [
        { cellName: 'clr', color: 'bg-red-100', value: 'Red', colorEntireRow: true },
        { cellName: 'clr', color: 'bg-yellow-100', value: 'Yellow', colorEntireRow: true },
        { cellName: 'clr', color: 'bg-white', value: 'White', colorEntireRow: true },
        { cellName: 'clr', color: 'bg-blue-200', value: 'Blue', colorEntireRow: true },
        { cellName: 'clr', color: 'bg-purple-100', value: 'Cytotoxic', colorEntireRow: true },
    ];


    const GetDataValue = (data: string, fld: string) => {
        let vl: string = useGetFldValue(data, fld);
        return vl;
    }

    const GridLoaded = () => { };

    const rowData: any = [];
    const onRowSelected = (data: string) => { };
    const onButtonClicked = (action: string, rw: any) => { };
    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };


    const color: any = {
        ylw: 'Yellow',
        red: "Red",
        blu: 'Blue',
        wht: 'White',
        cyt: 'Cytotoxic'
    }

    function getColor(data: string) {
        if (color[data]) {
            return color[data];
        }
        return "";
    }
    const { showToaster, hideToaster } = useToaster();
    const getClick = () => {
        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
        if (msg && msg[0]) {
            showToaster(msg, 'error')
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg })
            return;
        }
        setValue(0);
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
        setPrevTotalPages(0);
        dispatch({ type: ACTIONS.SETGID, payload: "" });
        setTimeout(() => {
            setIsLoading("Loading data...")
            refetch();
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 })
        }, 400)

    }

    const getGid = () => {
        let gd: string = state.gid;
        if (!gd) {
            let g: any = utilities(3, "", "");
            gd = g;
            dispatch({ type: ACTIONS.SETGID, payload: gd });
        }
        return gd;
    };

    const GetList = () => {
        // let api: string = getApiFromBiowaste('show_wstbg_lvlby');
        let dt = state.textDts
        const dateNow = UseMomentDateNmb(getFldValue(dt, "dt_rpt"));
        let gid: any = getGid();
        // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a253", lvl + '=' + who + '=' + dateNow + '=' + value + '=' + gid);
        // return nrjAxios({ apiCall: api })
        let payload: any = postLinux(lvl + '=' + who + '=' + dateNow + '=' + value + '=cbwtf=' + gid, 'show_wstbg_lvlby');
        return nrjAxiosRequestBio("show_wstbg_lvlby", payload);

    }
    const colorFullName: any = {
        red: "Red",
        ylw: "Yellow",
        cyt: "Cytotoxic",
        blu: "Blue",
        wht: "White"
    }
    const ShowData = (dataSvd1: any) => {
        setIsLoading("")
        let dt: any = GetResponseLnx(dataSvd1);
        if (Array.isArray(dt) && dt.length) {
            dt = dt.map((res: any) => {
                let scnby = "";
                if (res.scby == 'cbwtf') {
                    scnby = 'Operator'
                }
                else if (res.scby == "hcf") {
                    scnby = 'HCF';
                }
                else {
                    scnby = 'Plant'
                }
                let bluscl = (res.bluscl && res.bluscl == "1") ? 'Yes' : 'No';
                let blustr = (res.blustr && res.blustr != 'NA') ? res.blustr : 'Not Received'
                let clr: string = colorFullName[res.clr]
                // const wt = (res.wt && !isNaN(res.wt)) ? Math.round(Number(res.wt)) : 0;
                const wt = (res.wt && !isNaN(res.wt)) ? Number(res.wt).toFixed(3) : 0.000

                // let dis = (isNaN(res.scndis) || res.scndis === undefined) ? 'HCF Coordinates Not Recorded' :parseInt(res.scndis)
                const dis = (res.scndis && !isNaN(Number(res.scndis)) && Number(res.scndis) > 0) ? String(res.scndis) : 'HCF Coordinates Not Recorded';  
                return { ...res, scby: scnby, scndis: dis, wt: wt, bluscl: bluscl, blustr: blustr, clr: clr }
            })
            dt=trimField(dt,"hcfnm")
            dt = [...dt].sort((a, b) => a.hcfnm.localeCompare(b.hcfnm))
            setValue(value + dt.length);
            setTimeout(function () {
                dispatch({ type: ACTIONS.NEWROWDATA, payload: dt });
            }, 800);
        }
        else {
            showToaster(["No data received"],"error", );
        }


    };

    const { data: dataSvd1, refetch: refetch } = useQuery({
        queryKey: ["svOldForm1", lvl, who],
        queryFn: GetList,
        enabled: false,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });

    const setLvlWhoData = (data: any) => {
        setLvl(data.lvl);
        setWho(data.who);
        let levelValue = 'Level: '
        if (data.lvl == "RGD") {
            levelValue += data.who + " " + "REGIONAL DIRECTORATE"
        }
        else if (data.lvl == 'STT') {
            levelValue += "SPCB" + " " + getStateFullFormWho(data.who)
        }
        else if (data.lvl == 'CBWTF') {
            levelValue += 'CBWTF : ' + data.name
        }
        else {
            levelValue += 'CPCB'
        }
        let a = getPrependContentValue(levelValue);
        console.log(a)
        setPrependContent(a)

        onChangeDts(data.date);
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 })
        }, 400)
    }


    const GetPrnt = () => {
        setIsLoading("Loading Print..")
        let gid: string = state.gid;
        if (!gid) {
            showToaster(["populate the data in the grid"], 'error');
            return;
        }
        let api: string = createGetApi(
            "db=nodb|dll=chqdll|fnct=g123", lvl + '=' + who + "=" + gid
        );
        return nrjAxios({ apiCall: api });
    };

    const showPrnt = (dataC: any) => {
        setIsLoading("")
        let dt: string = GetResponseWnds(dataC);
        if (dt && dt.indexOf('.pdf') > -1) {
            window.open(dataC.data[0]["Data"], "_blank")
        } else {
            setShowMessage({
                message: ["Please try again after refreshing the page!"],
                type: "error",
            });
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    }

    const { data: dataP, refetch: refetchP } = useQuery({
        queryKey: ["getprint", lvl, who],
        queryFn: GetPrnt,
        enabled: false,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: showPrnt,
    });

    function printClick() {
        refetchP()
    }

    const [prevTotalPages, setPrevTotalPages] = useState(0);
    let prev = 0;

    const pagePagination = (data: any) => {
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
    const [prependContent, setPrependContent] = useState<any[]>([])


    const getPrependContentValue = (levelValue: string) => {
        return [
            [
                {
                    data: {
                        value: ' ',
                        type: "String",
                    },
                    mergeAcross: 3
                },
                {
                    data: {
                        value: 'Waste collection report: daily detailed',
                        type: "String",
                    },
                    mergeAcross: 3
                },
            ],
            [
                {
                    data: {
                        value: ' ',
                        type: "String",
                    },
                    mergeAcross: 3
                },
                {
                    data: {
                        value: levelValue,
                        type: "String",
                    },
                    mergeAcross: 5
                },
            ],
            [
                {
                    data: {
                        value: ' ',
                        type: "String",
                    },
                    mergeAcross: 3
                },
                {
                    data: {
                        value: 'Date: ' + moment(Date.now()).format("DD-MMM-yyyy"),
                        type: "String",
                    },
                    mergeAcross: 5
                },
            ],
            [],
        ]
    };


    return (
        <div className="">
            <LevelSelector
                showCbwtf={true}
                levelSelectorData={setLvlWhoData}
                getListButton={true}
                getListOnclick={getClick}
                printButton={false}
                printButtonClick={printClick}
                dateField={true}
            ></LevelSelector>
           <div className=" font-semibold text-lg text-center ">{isLoading}</div>
            {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                <Toaster data={showMessage} className={''}></Toaster>
            </div> : <></>}
            {/* <div className=" font-semibold text-lg text-center ">{isLoading}</div> */}
            <div className="flex justify-center bg-gray-100">

                <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    onButtonClicked={onButtonClicked}
                    colDef={coldef}
                    apiCall={""}
                    rowData={rowData}
                    deleteButton={""}
                    newRowData={state.nwRow}
                    showDataButton={""}
                    trigger={state.triggerG}
                    showPagination={true}
                    showTooltips={true}
                    cellClassRulesValues={cellClassRulesValues}
                    parentPaginationChanged={pagePagination}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    showExport={true}
                    prependContent={[]}
                    KeyOrder={KeyOrder}
                    lvl={getLvl()}
                    who={getWho()}
                    pageTitle={"Waste collection report: daily detailed"}
                    sortBy={'clr'}
                    printExcelHeader={printExcelHeader}
                    exceColWidth={excelColWidth}
                    pdfColWidth={pdfColWidth}
                    colDefPdf={colDefPdf}
                ></NrjAgGrid>
            </div>
        </div>
    );
}; export default React.memo(Hcf_Wstbg);
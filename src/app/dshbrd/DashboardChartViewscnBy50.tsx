import React, { useEffect, useReducer, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, dateCheck30Days, getApplicationVersion, getStateAbbreviation, postLinux, svLnxSrvr } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";
import { validForm } from "../../Hooks/validForm";
import { useNavigate } from "react-router-dom";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import { Toaster } from "../../components/reusable/Toaster";
import Chart from "react-google-charts";
import { getLvl, getWho } from "../../utilities/cpcb";
import HdrDrp from '../HdrDrp';
import LevelSelector from './LevelSelector';
import OnOffToggle from '../MIS/onOffToggle';
import DashboardChart from './DashboardChart';
import GraphDataTable from '../MIS/grapghDataTable';
import DashBoardClrGrph from '../MIS/DashBoardClrGrph';
import NrjChkbx from "../../components/reusable/NrjChkbx";
import LevelSelectorOne from './LevelSelectorOne';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { useToaster } from '../../components/reusable/ToasterContext';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

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
    DISABLE: "disable",
    FORM_DATA2: "formdata2",
    SETCOMBOSTRB: "cmbstrB",
    SETCOMBOSTRC: "cmbstrC",
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
    disableA: 1,
    disableB: 1,
    disableC: 1,
    combostrB: "",
    combostrC: "",
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


const DashboardChartViewscanBy50 = (props: any) => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(reducer, initialState);

    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const [isLoading, setIsLoading] = useState("")
    const [inputData, setInputData] = useState({ lvl: "", who: "", frmDate: "", toDate: "" })

    const [chrtDataCnt, setChrtDataCnt] = useState<any[]>([["Color", "Bags"], ["Yellow", 1], ["Red", 2], ["Cytotoxic", 3], ["Blue", 4], ["White", 2]])
    const [chrtDataWt, setChrtDataWt] = useState<any[]>([["Color", "Bags"], ["Yellow", 1], ["Red", 2], ["Cytotoxic", 3], ["Blue", 4], ["White", 1]])

    // const options = {
    //     colors: ["#AA336A", "#48cbbe", "#8FCE00"],
    //     title: "Bag Count From With in 50 m Meter Distance",
    //     is3D: true,
    //     sliceVisibilityThreshold: 0.000001,
    //     pieSliceTextStyle: {

    //         color: 'black',
    //     },
    //     legend: {
    //         textStyle: {
    //             color: 'black',
    //         },
    //         alignment: 'center',
    //     },
    // };
    const options2 = {
        colors: ["#AA336A", "#48cbbe", "#8FCE00"],
        title: "Bag Count From Above 50 Meter Distance",
        is3D: true,
        sliceVisibilityThreshold: 0.000001,
        pieSliceTextStyle: {

            color: 'black',
        },
        legend: {
            textStyle: {
                color: 'black',
            },
            alignment: 'center',
        },
    };
    const options3 = {
        colors: ["#AA336A", "#48cbbe", "#8FCE00"],
        title: "Bag Weight From With in 50 m Meter Distance",
        is3D: true,
        sliceVisibilityThreshold: 0.000001,
        pieSliceTextStyle: {

            color: 'black',
        },
        legend: {
            textStyle: {
                color: 'black',
            },
            alignment: 'center',
        },
    };

    const options4 = {
        colors: ["#AA336A", "#48cbbe", "#8FCE00"],
        title: "Bag Weight From Above 50 Meter Distance",
        is3D: true,
        sliceVisibilityThreshold: 0.000001,
        pieSliceTextStyle: {

            color: 'black',
        },
        legend: {
            textStyle: {
                color: 'black',
            },
            alignment: 'center',
        },
    };

    const GetGid = () => {
        let g: any = utilities(3, "", "");
        dispatch({ type: ACTIONS.SETGID, payload: g });
        return g;
    };


    const getData = () => {
        let gid = GetGid()
        let fromDate = UseMomentDateNmb(inputData.frmDate);
        let toDate = UseMomentDateNmb(inputData.toDate);
        let payload: any = postLinux(inputData.lvl + '=' + inputData.who + '=' + fromDate + '=' + toDate + '=' + gid, 'show_GeoCtg_period');
        return nrjAxiosRequestBio("show_GeoCtg_period", payload);
    };


    const populateGridFromResult = (tempData: any, genAry: any) => {
        Object.keys(tempData).forEach((element: any) => {
            if (genAry && genAry[element] && !isNaN(Number(genAry[element]))) {
                tempData[element].push(Number(Number(genAry[element]).toFixed(3)))
            }
            else {
                tempData[element].push(0)
            }
        });
        return tempData;
    }

    const sumWtAndCnt = (ary: any, data: any) => {
        if (ary && ary.redwt >= 0) {
            ary.ylwwt += data.ylwwt;
            ary.ylwcnt += data.ylwcnt;
            ary.redwt += data.redwt;
            ary.redcnt += data.redcnt;
            ary.whtwt += data.whtwt;
            ary.whtcnt += data.whtcnt;
            ary.bluwt += data.bluwt;
            ary.blucnt += data.blucnt;
            ary.cytwt += data.cytwt;
            ary.cytcnt += data.cytcnt
        }
        else {
            ary = data;
        }
    }

    const ShowData = (data1: any) => {

        setIsLoading("");

        let ary: any = GetResponseLnx(data1);
        if (ary && Array.isArray(ary)) {
            setChrtDataBlwWgtScnBy(ary)
            setChrtDataBlwScnByCnt(ary)
            setChrtDataAbvWgtScnBy(ary)
            setChrtDataAbvScnByCnt(ary)
            setIsLoading("");
            let tempCbwtfCor = {
                scnby: 'cbwtf',
                geoctg: "corgeono",
                ylwwt: 0,
                ylwcnt: 0,
                redwt: 0,
                redcnt: 0,
                whtwt: 0,
                whtcnt: 0,
                bluwt: 0,
                blucnt: 0,
                cytwt: 0,
                cytcnt: 0
            };
            let tempCbwtfWr = {
                scnby: 'cbwtf',
                geoctg: "incorgeono",
                ylwwt: 0,
                ylwcnt: 0,
                redwt: 0,
                redcnt: 0,
                whtwt: 0,
                whtcnt: 0,
                bluwt: 0,
                blucnt: 0,
                cytwt: 0,
                cytcnt: 0
            };
            let tempHcfCor = {
                scnby: 'hcf',
                geoctg: "corgeono",
                ylwwt: 0,
                ylwcnt: 0,
                redwt: 0,
                redcnt: 0,
                whtwt: 0,
                whtcnt: 0,
                bluwt: 0,
                blucnt: 0,
                cytwt: 0,
                cytcnt: 0
            }
            let tempHcfWr = {
                geoctg: "incorgeono",
                scnby: 'hcf',
                ylwwt: 0,
                ylwcnt: 0,
                redwt: 0,
                redcnt: 0,
                whtwt: 0,
                whtcnt: 0,
                bluwt: 0,
                blucnt: 0,
                cytwt: 0,
                cytcnt: 0
            }
            let tempFctCor = {
                scnby: 'fct',
                geoctg: "corgeono",
                ylwwt: 0,
                ylwcnt: 0,
                redwt: 0,
                redcnt: 0,
                whtwt: 0,
                whtcnt: 0,
                bluwt: 0,
                blucnt: 0,
                cytwt: 0,
                cytcnt: 0
            }
            let tempFctWr = {
                geoctg: "incorgeono",
                scnby: 'fct',
                ylwwt: 0,
                ylwcnt: 0,
                redwt: 0,
                redcnt: 0,
                whtwt: 0,
                whtcnt: 0,
                bluwt: 0,
                blucnt: 0,
                cytwt: 0,
                cytcnt: 0
            }
            for (const el of ary) {

                if (el.scnby == 'hcf') {
                    if (el.geoctg == 'corgeono') {
                        sumWtAndCnt(tempHcfCor, el)
                    }
                    else {
                        sumWtAndCnt(tempHcfWr, el)
                    }
                }
                else if (el.scnby == 'cbwtf') {
                    if (el.geoctg == 'corgeono') {
                        sumWtAndCnt(tempCbwtfCor, el)
                    }
                    else {
                        sumWtAndCnt(tempCbwtfWr, el)
                    }
                }
                else {
                    if (el.geoctg == 'corgeono') {
                        sumWtAndCnt(tempFctCor, el)
                    }
                    else {
                        sumWtAndCnt(tempFctWr, el)
                    }
                }
            }


            let tempGridWtData: any = { ...emptyGridWtData };
            let tempGridCntData: any = { ...emptyGridCntData };
            let tempGridAbvWtData: any = { ...emptyGridAbvWtData };
            let tempGridAbvCntData: any = { ...emptyGridAbvCntData };


            tempGridWtData = populateGridFromResult(tempGridWtData, tempHcfCor);
            tempGridCntData = populateGridFromResult(tempGridCntData, tempHcfCor);


            tempGridAbvWtData = populateGridFromResult(tempGridAbvWtData, tempHcfWr);
            tempGridAbvCntData = populateGridFromResult(tempGridAbvCntData, tempHcfWr);




            tempGridWtData = populateGridFromResult(tempGridWtData, tempCbwtfCor);
            tempGridCntData = populateGridFromResult(tempGridCntData, tempCbwtfCor);



            tempGridAbvWtData = populateGridFromResult(tempGridAbvWtData, tempCbwtfWr);
            tempGridAbvCntData = populateGridFromResult(tempGridAbvCntData, tempCbwtfWr);


            tempGridWtData = populateGridFromResult(tempGridWtData, tempFctCor);
            tempGridCntData = populateGridFromResult(tempGridCntData, tempFctCor);


            tempGridAbvWtData = populateGridFromResult(tempGridAbvWtData, tempFctWr);
            tempGridAbvCntData = populateGridFromResult(tempGridAbvCntData, tempFctWr);

            setChrtDataBlwWtScnBy(insertData(tempGridWtData, dataBelowWt, setDataBelowWt))
            setChrtDataBlwCntScnBy(insertData(tempGridCntData, dataBelowCnt, setDataBelowCnt))
            setChrtDataAbvWtScnBy(insertData(tempGridAbvWtData, dataAboveWt, setDataAboveWt))
            setChrtDataAbvCntScnBy(insertData(tempGridAbvCntData, dataAboveCnt, setDataAboveCnt))
        }
        else {
            showToaster(['No data received'], 'error');
        }

    };

    const { showToaster, hideToaster } = useToaster();
    const insertData = (jsonData: any, grid: any, setGrid: any) => {
        let tempData = [emptyHeading]
        Object.keys(jsonData).forEach(element => {
            tempData.push(jsonData[element])
            grid.push({ ...gridHelper[jsonData[element][0]], bags: Number(jsonData[element][1]), item1: Number(jsonData[element][2]), item2: Number(jsonData[element][3]) })
        });
        setGrid(grid);
        return tempData;
    }


    const { data, refetch } = useQuery({
        queryKey: ["dshbrd50barChart",],
        queryFn: getData,
        enabled: false,
        staleTime: 0,
        refetchInterval: 300000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });


    const svClick = () => {
        clearVariables()
        let msg: any = dateCheck30Days(inputData.frmDate, inputData.toDate)
        if (msg && msg[0]) {
            showToaster(msg, 'error');
            return;
        }
        setIsLoading("Loading data ...")
        refetch();

    };

    const emptyHeading: any[] = ['Color', 'Generated', 'Collected', 'Processed ']

    const setLvlWhoData = (data: any) => {
        setInputData({ lvl: data.lvl, who: data.who, frmDate: data.frmDate, toDate: data.toDate });
        clearVariables();
    }

    const clearVariables = () => {
        setDataAboveCnt([])
        setDataAboveWt([])
        setDataBelowCnt([])
        setDataBelowWt([])
        setChrtDataBlwWtScnBy([emptyHeading, ['Red', 0, 0, 0], ['Blue', 0, 0, 0], ['White', 0, 0, 0], ['Yellow', 0, 0, 0], ['Cytotoxic', 0, 0, 0]])
        setChrtDataBlwCntScnBy([emptyHeading, ['Red', 0, 0, 0], ['Blue', 0, 0, 0], ['White', 0, 0, 0], ['Yellow', 0, 0, 0], ['Cytotoxic', 0, 0, 0]])
        setChrtDataAbvWtScnBy([emptyHeading, ['Red', 0, 0, 0], ['Blue', 0, 0, 0], ['White', 0, 0, 0], ['Yellow', 0, 0, 0], ['Cytotoxic', 0, 0, 0]])
        setChrtDataAbvCntScnBy([emptyHeading, ['Red', 0, 0, 0], ['Blue', 0, 0, 0], ['White', 0, 0, 0], ['Yellow', 0, 0, 0], ['Cytotoxic', 0, 0, 0]])
        setChrtDataBlwWgtScnBy([])
        setChrtDataBlwScnByCnt([])
        setChrtDataAbvWgtScnBy([])
        setChrtDataAbvScnByCnt([])

    }
    const [toggleState, setToggleState] = useState(false);

    const handleToggleChange = (newState: any) => {
        setToggleState(newState);
    };

    const gridHelper: any = {
        'Red': { color: 'Red', parentClass: 'bg-red-700 ' },
        'Blue': { color: 'Blue', parentClass: 'bg-blue-700 ' },
        'Yellow': { color: 'Yellow', parentClass: 'bg-yellow-300 ' },
        'Cytotoxic': { color: 'Cytotoxic', parentClass: 'bg-yellow-500 ' },
        'White': { color: 'White', parentClass: 'bg-gray-100 ' }
    }

    const [dataAboveCnt, setDataAboveCnt]: any[] = useState<any[]>([]);
    const [dataAboveWt, setDataAboveWt]: any[] = useState<any[]>([]);
    const [dataBelowCnt, setDataBelowCnt]: any[] = useState<any[]>([]);
    const [dataBelowWt, setDataBelowWt]: any[] = useState<any[]>([]);

    const headingBelow30: any[] = [
        { col1: '  ', col2: 'Color', col3: 'Generated', col4: 'Collected', col5: 'Processed' }
    ]

    const [chrtDataBlwWtScnBy, setChrtDataBlwWtScnBy] = useState([emptyHeading])
    const [chrtDataBlwCntScnBy, setChrtDataBlwCntScnBy] = useState([emptyHeading])
    const [chrtDataAbvWtScnBy, setChrtDataAbvWtScnBy] = useState([emptyHeading])
    const [chrtDataAbvCntScnBy, setChrtDataAbvCntScnBy] = useState([emptyHeading])


    const [chrtDataBlwScnByWgt, setChrtDataBlwWgtScnBy] = useState<any[]>([])
    const [chrtDataBlwScnByCnt, setChrtDataBlwScnByCnt] = useState<any[]>([])
    const [chrtDataAbvScnByWgt, setChrtDataAbvWgtScnBy] = useState<any[]>([])
    const [chrtDataAbvScnByCnt, setChrtDataAbvScnByCnt] = useState<any[]>([])


    const lbl = ['Yellow', 'Red', 'White', 'Blue', 'Cytotoxic'];
    const labels = [...lbl]; // Use lbl array directly

    // Ensure deep copies to prevent mutations
    const filteredDataBelow = [...chrtDataBlwScnByWgt];
    const filteredDataBelowCnt = [...chrtDataBlwScnByCnt];
    const filteredDataAbove = [...chrtDataAbvScnByWgt];
    const filteredDataAboveCnt = [...chrtDataAbvScnByCnt];

    const processData = (filteredData: any[], scannedBy: string, geoWgtKeys: string[]) => {
        const filtered = filteredData.filter(item => item.scnby === scannedBy && geoWgtKeys.includes(item.geoctg));

        return filtered.map(item => [
            parseFloat((item.ylwwt || 0).toFixed(3)),
            parseFloat((item.redwt || 0).toFixed(3)),
            parseFloat((item.whtwt || 0).toFixed(3)),
            parseFloat((item.bluwt || 0).toFixed(3)),
            parseFloat((item.cytwt || 0).toFixed(3))
        ]);
    };

    const processDataCnt = (filteredData: any[], scannedBy: string, geoCntKeys: string[]) => {
        const filtered = filteredData.filter(item => item.scnby === scannedBy && geoCntKeys.includes(item.geoctg));



        return filtered.map(item => [
            parseFloat(item.ylwcnt) || 0,
            parseFloat(item.redcnt) || 0,
            parseFloat(item.whtcnt) || 0,
            parseFloat(item.blucnt) || 0,
            parseFloat(item.cytcnt) || 0
        ]);
    };

    // 🛠 Fix Transpose Data Function
    const transposeData = (data: any[][]) => {
        if (!Array.isArray(data) || data.length === 0) return [];

        const transposed = data[0].map((_, colIndex) => data.map(row => row[colIndex]));
        return transposed;
    };

    // Define geo filters
    const geoWgtKeysBelow = ["nogeo", "prtgeo", "wrngo"];
    const geoWgtAbove = ["corgeono"];

    // Generate processed data
    const generatedData = transposeData(processData(filteredDataBelow, 'hcf', geoWgtKeysBelow));
    const collectedData = transposeData(processData(filteredDataBelow, 'cbwtf', geoWgtKeysBelow));
    const processedData = transposeData(processData(filteredDataBelow, 'fct', geoWgtKeysBelow));

    const generatedDataCnt = transposeData(processDataCnt(filteredDataBelowCnt, 'hcf', geoWgtKeysBelow));
    const collectedDataCnt = transposeData(processDataCnt(filteredDataBelowCnt, 'cbwtf', geoWgtKeysBelow));
    const processedDataCnt = transposeData(processDataCnt(filteredDataBelowCnt, 'fct', geoWgtKeysBelow));

    const generatedDataAbv = transposeData(processData(filteredDataAbove, 'hcf', geoWgtAbove));
    const collectedDataAbv = transposeData(processData(filteredDataAbove, 'cbwtf', geoWgtAbove));
    const processedDataAbv = transposeData(processData(filteredDataAbove, 'fct', geoWgtAbove));

    const generatedDataCntAbv = transposeData(processDataCnt(filteredDataAboveCnt, 'hcf', geoWgtAbove));
    const collectedDataCntAbv = transposeData(processDataCnt(filteredDataAboveCnt, 'cbwtf', geoWgtAbove));
    const processedDataCntAbv = transposeData(processDataCnt(filteredDataAboveCnt, 'fct', geoWgtAbove));


    // Chart configuration with updated colors
    const chartDataBelow = {
        labels: labels,
        datasets: [
            {
                label: "Generated",
                data: generatedData,
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Collected",
                data: collectedData,
                backgroundColor: "rgba(255, 206, 86, 0.5)",
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 1,
            },
            {
                label: "Processed",
                data: processedData,
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "bottom" as const  // Fix applied here
            },
            title: {
                display: true,
                text: "Waste bag weight beyond 50 mtr"
            },
        },
        scales: {
            x: {
                title: { display: true, text: "Waste type" },
                ticks: { color: "#000" },
            },
            y: {
                title: { display: true, text: "Weight (in kg)" },
                beginAtZero: true,
                ticks: { color: "#000", stepSize: 10 },
            },
        },
    };

    const optionsBlwCnt = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "bottom" as const  // Fix applied here
            },
            title: {
                display: true,
                text: "Waste bag count beyond 50 mtr"
            },
        },
        scales: {
            x: {
                title: { display: true, text: "Waste type" },
                ticks: { color: "#000" },
            },
            y: {
                title: { display: true, text: "Count" },
                beginAtZero: true,
                ticks: { color: "#000", stepSize: 10 },
            },
        },
    };

    const chartDataBelowCnt = {
        labels: labels,
        datasets: [
            {
                label: "Generated",
                data: generatedDataCnt.map(d => d[0] + d[1]),
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Collected",
                data: collectedDataCnt.map(d => d[0] + d[1]),
                backgroundColor: "rgba(255, 206, 86, 0.5)",
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 1,
            },
            {
                label: "Processed",
                data: processedDataCnt.map(d => d[0] + d[1]),
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    };

    const optionsAbvWgt = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "bottom" as const  // Fix applied here
            },
            title: {
                display: true,
                text: "Waste bag weight within 50 mtr"
            },
        },
        scales: {
            x: {
                title: { display: true, text: "Waste type" },
                ticks: { color: "#000" },
            },
            y: {
                title: { display: true, text: "Weight (in kg)" },
                beginAtZero: true,
                ticks: { color: "#000", stepSize: 10 },
            },
        },
    };

    const chartDataAbvWgt = {
        labels: labels,
        datasets: [
            {
                label: "Generated",
                data: generatedDataAbv.map(d => {
                    const firstValue = Number(d[0]) || 0;  // Ensure first value is a number, default to 0
                    const secondValue = Number(d[1]) || 0; // Ensure second value exists, default to 0

                    // return firstValue + secondValue; // Sum both values
                    return parseFloat((firstValue + secondValue).toFixed(3)); 
                }),
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Collected",
                data: collectedDataAbv.map(d => {
                    const firstValue = Number(d[0]) || 0;
                    const secondValue = Number(d[1]) || 0;

                    // return firstValue + secondValue;
                    return parseFloat((firstValue + secondValue).toFixed(3)); 
                }),
                backgroundColor: "rgba(255, 206, 86, 0.5)",
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 1,
            },
            {
                label: "Processed",
                data: processedDataAbv.map(d => {
                    const firstValue = Number(d[0]) || 0;
                    const secondValue = Number(d[1]) || 0;

                    // return firstValue + secondValue;
                    return parseFloat((firstValue + secondValue).toFixed(3)); 
                }),
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    };


    const optionsAbvCnt = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "bottom" as const  // Fix applied here
            },
            title: {
                display: true,
                text: "Waste bag count within 50 Mtr"
            },
        },
        scales: {
            x: {
                title: { display: true, text: "Waste type" },
                ticks: { color: "#000" },
            },
            y: {
                title: { display: true, text: "Count" },
                beginAtZero: true,
                ticks: { color: "#000", stepSize: 10 },
            },
        },
    };

    const chartDataAbvCnt = {
        labels: labels,
        datasets: [
            {
                label: "Generated",
                data: generatedDataCntAbv.map(d => {
                    const firstValue = Number(d[0]) || 0;
                    const secondValue = Number(d[1]) || 0;

                    return firstValue + secondValue;
                }),
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Collected",
                data: collectedDataCntAbv.map(d => {
                    const firstValue = Number(d[0]) || 0;
                    const secondValue = Number(d[1]) || 0;

                    return firstValue + secondValue;
                }),
                backgroundColor: "rgba(255, 206, 86, 0.5)",
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 1,
            },
            {
                label: "Processed",
                data: processedDataCntAbv.map(d => {
                    const firstValue = Number(d[0]) || 0;
                    const secondValue = Number(d[1]) || 0;

                    return firstValue + secondValue;
                }),
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
        ],
    };


    const emptyGridWtData: any = {
        redwt: ['Red'],
        bluwt: ['Blue'],
        ylwwt: ['Yellow'],
        cytwt: ['Cytotoxic'],
        whtwt: ['White'],
    }
    const emptyGridAbvWtData: any = {
        redwt: ['Red'],
        bluwt: ['Blue'],
        ylwwt: ['Yellow'],
        cytwt: ['Cytotoxic'],
        whtwt: ['White'],
    }

    const emptyGridCntData: any = {
        redcnt: ['Red'],
        blucnt: ['Blue'],
        ylwcnt: ['Yellow'],
        cytcnt: ['Cytotoxic'],
        whtcnt: ['White'],
    }

    const emptyGridAbvCntData: any = {
        redcnt: ['Red'],
        blucnt: ['Blue'],
        ylwcnt: ['Yellow'],
        cytcnt: ['Cytotoxic'],
        whtcnt: ['White'],
    }

    const sum = (below: any[], above: any[], index: string) => {
        let s = 0;
        for (let i = 0; i < below.length && above.length; i++) {
            s += below[i][index] + above[i][index];
        }
        return s;
    }

    const PrntRep = () => {
        let gid: string = state.gid
        if (!gid) {
            showToaster(["populate the data in the grid first"], 'error');
            return;
        }
        let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g127", `20=${gid}`);
        return nrjAxios({ apiCall: api });
    };

    const ShowReprtt = (dataC: any) => {
        let dt: string = GetResponseWnds(dataC);
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        if (dt && dt.indexOf('.pdf') > -1) {
            window.open(dt, "_blank")
        }
        else {
            showToaster(["Please try again after refreshing the page!"], 'error')
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    }

    const { data: dataC, refetch: refetchP } = useQuery({
        queryKey: ['DashboardView50', state.gid],
        queryFn: PrntRep,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowReprtt,
    })

    const printClick = () => {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        refetchP()
    }

    return (
        <>
            <LevelSelectorOne
                showCbwtf={false}
                levelSelectorData={setLvlWhoData}
                dateField={true}
                getListButton={true}
                getListOnclick={svClick}
            ></LevelSelectorOne>

            <div className=" ">
                <div className=" shadow rounded-lg bg-white">
                    <div className=" font-semibold text-lg text-center ">{isLoading}</div>

                    {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                        <Toaster data={showMessage} className={''}></Toaster>
                    </div> : <></>}

                    <div className=' bg-gray-100 m-0 p-0'>
                        {/* <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 ">
                            <div className=" bg-white py-2 px-3  rounded shadow">
                                <h6 className="m-2">
                                    Generated
                                </h6>


                                <div className="flex m-2 justify-between">
                                    <div className="bg-blue-100 rounded p-2 px-4">
                                        <h5>
                                            {sum(dataBelowWt, dataAboveWt, 'bags').toFixed(3)}
                                            <span className="small text-[18px]"> Kg</span>
                                        </h5>

                                        </div>
                                    </div>
                                    <div className="bg-blue-100 rounded p-2 px-4">
                                        <h5>
                                            {sum(dataBelowCnt, dataAboveCnt, 'bags')}
                                            <span className="small text-[18px]"> Bags</span>
                                        </h5>
                                    </div>
                                </div>
                            </div>
                            <div className=" bg-white py-2 px-3  rounded shadow">
                                <h6 className="m-2">
                                    Collected
                                </h6>
                                <div className="flex m-2 justify-between">
                                    <div className="bg-blue-100 rounded p-2 px-4">
                                        <h5>
                                            {sum(dataBelowWt, dataAboveWt, 'item1').toFixed(3)}
                                            <span className="small text-[18px]"> Kg</span>
                                        </h5>
                                    </div>
                                    <div className="bg-blue-100 rounded p-2 px-4">
                                        <h5>
                                            {sum(dataBelowCnt, dataAboveCnt, 'item1')}
                                            <span className="small text-[18px]"> Bags</span>
                                        </h5>
                                    </div>
                                </div>
                            </div>
                            <div className=" bg-white py-2 px-3  rounded shadow">
                                <h6 className="m-2">
                                    Processed
                                </h6>
                                <div className="flex m-2 justify-between">
                                    <div className="bg-blue-100 rounded p-2 px-4">
                                        <h5>
                                            {sum(dataBelowWt, dataAboveWt, 'item2').toFixed(3)}
                                            <span className="small text-[18px]"> Kg</span>
                                        </h5>
                                    </div>
                                    <div className="bg-blue-100 rounded p-2 px-4">
                                        <h5>
                                            {sum(dataBelowCnt, dataAboveCnt, 'item2')}
                                            <span className="small text-[18px]"> Bags</span>
                                        </h5>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4">

                            <div className="bg-red-100 border border-2 py-4 px-3 text-center rounded-lg shadow min-h-[200px]">
                                <h5 className="mt-2 font-semibold">Generated</h5>
                                <div className="flex p-4 justify-center">
                                    <div className="w-full">
                                        <div className="bg-blue-50 rounded w-full px-4 p-2 mb-2">
                                            <h4>  {Math.round(sum(dataBelowWt, dataAboveWt, 'bags'))} <span className="font-semibold text-[24px]">Kg</span></h4>
                                        </div>
                                        <div className="bg-blue-50 rounded p-2 w-full px-4">
                                            <h4>    {sum(dataBelowCnt, dataAboveCnt, 'bags')} <span className="font-semibold text-[24px]">Bags</span></h4>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800 font-semibold">All HCFs</span>
                            </div>

                            <div className="bg-yellow-100 border border-2 py-4 px-3 text-center rounded-lg shadow min-h-[200px]">
                                <h5 className="mt-2 font-semibold">Collected</h5>
                                <div className="flex p-4 justify-center">
                                    <div className="w-full">
                                        <div className="bg-blue-50 rounded w-full px-4 p-2 mb-2">
                                            <h4>    {Math.round(sum(dataBelowWt, dataAboveWt, 'item1'))} <span className="font-semibold text-[24px]">Kg</span></h4>
                                        </div>
                                        <div className="bg-blue-50 rounded p-2 w-full px-4">
                                            <h4>  {sum(dataBelowCnt, dataAboveCnt, 'item1')} <span className="font-semibold text-[24px]">Bags</span></h4>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800 font-semibold">All HCFs</span>
                            </div>

                            <div className="bg-green-100 border border-2 py-4 px-3 text-center rounded-lg shadow min-h-[200px]">
                                <h5 className="mt-2 font-semibold">Processed</h5>
                                <div className="flex p-4 justify-center">
                                    <div className="w-full">
                                        <div className="bg-blue-50 rounded w-full px-4 p-2 mb-2">
                                            <h4>    {Math.round(sum(dataBelowWt, dataAboveWt, 'item2'))} <span className="font-semibold text-[24px]">Kg</span></h4>
                                        </div>
                                        <div className="bg-blue-50 rounded p-2 w-full px-4">
                                            <h4>    {sum(dataBelowCnt, dataAboveCnt, 'item2')} <span className="font-semibold text-[24px]">Bags</span></h4>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800 font-semibold">All HCFs</span>
                            </div>
                        </div>
                        <div className="flex text-[18px] justify-end my-3  p-1 shadow-lg">
                            <span className="">Kg</span>
                            <OnOffToggle onToggleChange={handleToggleChange} />
                            <span className="">Bags</span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4   ">
                            <div className=" bg-white py-2 px-3 col-span-2 rounded shadow">
                                <div className="flex justify-between m-2">
                                    {/* {toggleState ? (<>
                                        <h6>Total bag count from within 50 meter distance  </h6>
                                    </>) : <>
                                        <h6>Total bag weight from within 50 meter distance  </h6>
                                    </>} */}
                                    {toggleState ? (<>
                                        <h6>Total bag count from beyond 50 meter distance  </h6>
                                    </>) : <>
                                        <h6>Total bag weight from beyond 50 meter distance  </h6>
                                    </>}
                                </div>
                                <div className=" m-2 ">
                                    {toggleState ? (<>
                                        {/* <DashboardChart chrtType="ColumnChart" chrtHeight={400} chrtData={chrtDataBlwCntScnBy} chrtOptions={options}></DashboardChart> */}
                                        <div style={{ height: `400px` }}>
                                            <Bar
                                                data={chartDataBelowCnt}
                                                options={{ ...optionsBlwCnt, maintainAspectRatio: false }}
                                            />
                                        </div>
                                    </>) : <>
                                        {/* <DashboardChart chrtType="ColumnChart" chrtHeight={400} chrtData={chrtDataBlwWtScnBy} chrtOptions={options3}></DashboardChart> */}
                                        <div style={{ height: `400px` }}>
                                            <Bar
                                                data={chartDataBelow}
                                                options={{ ...options, maintainAspectRatio: false }}
                                            />
                                        </div>
                                    </>}
                                </div>

                            </div>
                            {/* <div className=" bg-white py-2 px-3  rounded shadow">
                                <div className="flex justify-between mx-2 my-2">
                                    <h6 className="">
                                        Summary table
                                    </h6>
                                </div>
                                <span className='text-[16px]'>Table: bag count</span><hr className='m-0' />
                                <div className="mb-3">
                                    <GraphDataTable data={dataAboveCnt} heading={headingBelow30} />
                                </div>
                                <span className='text-[16px]'>Table: bag weight</span><hr className='m-0' />
                                <div className="">
                                    <GraphDataTable data={dataAboveWt} heading={headingBelow30} />
                                </div>
                            </div> */}

                            <div className="bg-white py-2 px-3 rounded shadow">
                                <div className="flex justify-between mx-2 my-2">
                                    <h6>Summary table</h6>
                                </div>
                                <span className="text-[16px]">Table: bag count</span>
                                <hr className="m-0" />
                                <div className="mb-3 overflow-x-auto">
                                    <div className="min-w-full">
                                    <GraphDataTable data={dataAboveCnt} heading={headingBelow30} />
                                    </div>
                                </div>
                                <span className="text-[16px]">Table: bag weight</span>
                                <hr className="m-0" />
                                <div className="overflow-x-auto">
                                    <div className="min-w-full">
                                    <GraphDataTable data={dataAboveWt} heading={headingBelow30} />
                                    </div>
                                </div>
                            </div>

                        </div>


                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4   ">
                            <div className=" bg-white py-2 px-3 col-span-2 rounded shadow">
                                <div className="flex justify-between m-2">
                                    {/* {toggleState ? (<>
                                        <h6>Total bag count from beyond 50 meter distance  </h6>
                                    </>) : <>
                                        <h6>Total bag weight from beyond 50 meter distance  </h6>
                                    </>} */}
                                    {toggleState ? (<>
                                        <h6>Total bag count from within 50 meter distance  </h6>
                                    </>) : <>
                                        <h6>Total bag weight from within 50 meter distance  </h6>
                                    </>}
                                </div>


                                <div className="m-2 ">
                                    {toggleState ? (<>
                                        {/* <DashboardChart chrtType="ColumnChart" chrtHeight={400} chrtData={chrtDataAbvCntScnBy} chrtOptions={options2}></DashboardChart> */}
                                        <div style={{ height: `400px` }}>
                                            <Bar
                                                data={chartDataAbvCnt}
                                                options={{ ...optionsAbvCnt, maintainAspectRatio: false }}
                                            />
                                        </div>

                                    </>) : <>
                                        {/* <DashboardChart chrtType="ColumnChart" chrtHeight={400} chrtData={chrtDataAbvWtScnBy} chrtOptions={options4}></DashboardChart> */}
                                        <div style={{ height: `400px` }}>
                                            <Bar
                                                data={chartDataAbvWgt}
                                                options={{ ...optionsAbvWgt, maintainAspectRatio: false }}
                                            />
                                        </div>

                                    </>}

                                </div>
                                <div className="m-2 ">

                                </div>
                            </div>

                            <div className="bg-white py-2 px-3 rounded shadow">
                                <div className="flex justify-between mx-2 my-2">
                                    <h6>Summary table</h6>
                                </div>
                                <span className="text-[16px]">Table: bag count</span>
                                <hr className="m-0" />
                                <div className="mb-3 overflow-x-auto">
                                    <div className="min-w-full">
                                        <GraphDataTable data={dataBelowCnt} heading={headingBelow30} />
                                    </div>
                                </div>
                                <span className="text-[16px]">Table: bag weight</span>
                                <hr className="m-0" />
                                <div className="overflow-x-auto">
                                    <div className="min-w-full">
                                        <GraphDataTable data={dataBelowWt} heading={headingBelow30} />
                                    </div>
                                </div>
                            </div>



                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}; export default React.memo(DashboardChartViewscanBy50);
import React, { useEffect, useReducer, useState } from 'react'
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, dateCheck30Days, postLinux } from '../../utilities/utilities'
import { useNavigate } from "react-router-dom";
import { Toaster } from "../../components/reusable/Toaster";
import OnOffToggle from '../MIS/onOffToggle';
import DashboardChart from './DashboardChart';
import GraphDataTable from '../MIS/grapghDataTable';
import LevelSelectorOne from './LevelSelectorOne';
import { nrjAxios, nrjAxiosRequestBio } from '../../Hooks/useNrjAxios';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@mui/material';
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


const DashboardChartViewscanBy = (props: any) => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(reducer, initialState);

    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const [isLoading, setIsLoading] = useState("")
    const [inputData, setInputData] = useState({ lvl: "", who: "", frmDate: "", toDate: "" })

    const [chrtDataCnt, setChrtDataCnt] = useState<any[]>([["Color", "Bags"], ["Yellow", 1], ["Red", 2], ["Cytotoxic", 3], ["Blue", 4], ["White", 2]])
    const [chrtDataWt, setChrtDataWt] = useState<any[]>([["Color", "Bags"], ["Yellow", 1], ["Red", 2], ["Cytotoxic", 3], ["Blue", 4], ["White", 1]])

    // const options = {
    //     colors: ["#AA336A", "#48cbbe", "#8FCE00", "#87CEEB", "#F0F0F0"],
    //     title: "Bag Count From Below 30 Bedded Hospital",
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
        colors: ["#AA336A", "#48cbbe", "#8FCE00", "#87CEEB", "#F0F0F0"],
        //colors: ["#FFFF99", "#FF4435", "#FFC700", "#87CEEB", "#F0F0F0"],
        title: "Bag Count From Above 30 Bedded Hospital",
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
        colors: ["#AA336A", "#48cbbe", "#8FCE00", "#87CEEB", "#F0F0F0"],
        //colors: ["#FFFF99", "#FF4435", "#FFC700", "#87CEEB", "#F0F0F0"],
        title: "Bag Weight From Below 30 Bedded Hospital",
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
        colors: ["#AA336A", "#48cbbe", "#8FCE00", "#87CEEB", "#F0F0F0"],
        title: "Bag Weight From Above 30 Bedded Hospital",
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
        let fromDate: string = UseMomentDateNmb(inputData.frmDate);
        let toDate: string = UseMomentDateNmb(inputData.toDate);
        // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a248", inputData.lvl + '=' + inputData.who + '=all=' + fromDate + '=' + toDate + '=' + gid);
        // return nrjAxios({ apiCall: api });

        if (inputData.who) {
            if (inputData.who == "Select a CBWTF to get data") {

                inputData.who = "CENTRAL"
            }


            let payload: any = postLinux(inputData.who + '=' + inputData.who + '=' + fromDate + '=' + toDate + '=' + gid, 'dashboard');
            return nrjAxiosRequestBio("dshbrd_total_period", payload);

        }

    };


    const populateGridFromResult = (tempData: any, genAry: any) => {
        Object.keys(tempData).forEach((element: any) => {
            if (genAry) {
                tempData[element].push(Number(genAry[element]))
            }
            else {
                tempData[element].push(0)
            }
        });
        return tempData;
    }
    const { showToaster, hideToaster } = useToaster();
    const ShowData = (data1: any) => {
        setIsLoading("")
        let ary: string = GetResponseLnx(data1);
        let dt: any = ary
        let indexObject = {
            generatedBelow: -1,
            generatedAbove: -1,
            collectedBelow: -1,
            collectedAbove: -1,
            processedBelow: -1,
            processedAbove: -1
        }
        if (dt && Array.isArray(dt)) {
            console.log(dt)
            setChrtDataBlwWgtScnBy(dt)
            setChrtDataBlwScnByCnt(dt)
            setChrtDataAbvWgtScnBy(dt)
            setChrtDataAbvScnByCnt(dt)
            setIsLoading("");
            for (let i = 0; i < dt.length; i++) {
                if (dt[i].scnby == 'HCF') {
                    if (dt[i].bdctg == '2') {
                        indexObject.generatedAbove = i
                    }
                    else {
                        indexObject.generatedBelow = i
                    }
                }
                else if (dt[i].scnby == 'Supervisor') {
                    if (dt[i].bdctg == '2') {
                        indexObject.collectedAbove = i
                    }
                    else {
                        indexObject.collectedBelow = i
                    }
                }
                else if (dt[i].scnby == 'Plant') {
                    if (dt[i].bdctg == '2') {
                        indexObject.processedAbove = i
                    }
                    else {
                        indexObject.processedBelow = i
                    }
                }
            }
            let tempGridWtData: any = { ...emptyGridWtData };
            let tempGridCntData: any = { ...emptyGridCntData };
            let tempGridAbvWtData: any = { ...emptyGridAbvWtData };
            let tempGridAbvCntData: any = { ...emptyGridAbvCntData };
            if (indexObject.generatedBelow > -1) {
                let genBelowAry: any = dt[indexObject.generatedBelow]
                tempGridWtData = populateGridFromResult(tempGridWtData, genBelowAry);
                tempGridCntData = populateGridFromResult(tempGridCntData, genBelowAry);
            }
            else {
                tempGridWtData = populateGridFromResult(tempGridWtData, undefined);
                tempGridCntData = populateGridFromResult(tempGridCntData, undefined);
            }
            if (indexObject.generatedAbove > -1) {
                let genAboveAry: any = dt[indexObject.generatedAbove]
                tempGridAbvWtData = populateGridFromResult(tempGridAbvWtData, genAboveAry);
                tempGridAbvCntData = populateGridFromResult(tempGridAbvCntData, genAboveAry);
            }
            else {
                tempGridAbvWtData = populateGridFromResult(tempGridAbvWtData, undefined);
                tempGridAbvCntData = populateGridFromResult(tempGridAbvCntData, undefined);
            }


            if (indexObject.collectedBelow > -1) {
                let colBelowAry: any = dt[indexObject.collectedBelow]
                tempGridWtData = populateGridFromResult(tempGridWtData, colBelowAry);
                tempGridCntData = populateGridFromResult(tempGridCntData, colBelowAry);
            }
            else {
                tempGridWtData = populateGridFromResult(tempGridWtData, undefined);
                tempGridCntData = populateGridFromResult(tempGridCntData, undefined);
            }
            if (indexObject.collectedAbove > -1) {
                let colAboveAry: any = dt[indexObject.collectedAbove]
                tempGridAbvWtData = populateGridFromResult(tempGridAbvWtData, colAboveAry);
                tempGridAbvCntData = populateGridFromResult(tempGridAbvCntData, colAboveAry);
            }
            else {
                tempGridAbvWtData = populateGridFromResult(tempGridAbvWtData, undefined);
                tempGridAbvCntData = populateGridFromResult(tempGridAbvCntData, undefined);
            }

            if (indexObject.processedBelow > -1) {
                let proBelowAry: any = dt[indexObject.processedBelow]
                tempGridWtData = populateGridFromResult(tempGridWtData, proBelowAry);
                tempGridCntData = populateGridFromResult(tempGridCntData, proBelowAry);
            }
            else {
                tempGridWtData = populateGridFromResult(tempGridWtData, undefined);
                tempGridCntData = populateGridFromResult(tempGridCntData, undefined);
            }
            if (indexObject.processedAbove > -1) {
                let proAboveAry: any = dt[indexObject.processedAbove]
                tempGridAbvWtData = populateGridFromResult(tempGridAbvWtData, proAboveAry);
                tempGridAbvCntData = populateGridFromResult(tempGridAbvCntData, proAboveAry);
            }
            else {
                tempGridAbvWtData = populateGridFromResult(tempGridAbvWtData, undefined);
                tempGridAbvCntData = populateGridFromResult(tempGridAbvCntData, undefined);
            }
            setChrtDataBlwWtScnBy(insertData(tempGridWtData, dataBelowWt, setDataBelowWt))
            setChrtDataBlwCntScnBy(insertData(tempGridCntData, dataBelowCnt, setDataBelowCnt))
            setChrtDataAbvWtScnBy(insertData(tempGridAbvWtData, dataAboveWt, setDataAboveWt))
            setChrtDataAbvCntScnBy(insertData(tempGridAbvCntData, dataAboveCnt, setDataAboveCnt))
        }
        else {
            showToaster(['No data received'], 'error');
        }

    };


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
        queryKey: ["dshbrd30barChart",],
        queryFn: getData,
        enabled: false,
        staleTime: 0,
        refetchInterval: 300000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });


    const svClick = () => {
        clearVariables();
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
    const labels = [...lbl]; // Directly use lbl array as labels


    const filteredDataBelow = chrtDataBlwScnByWgt.filter(item => item.bdctg === 1);
    const filteredDataBelowCnt = chrtDataBlwScnByCnt.filter(item => item.bdctg === 1);

    const filteredDataAbove = chrtDataAbvScnByWgt.filter(item => item.bdctg === 2);
    const filteredDataAboveCnt = chrtDataAbvScnByCnt.filter(item => item.bdctg === 2);

    const processData = (filteredData: any[], scannedBy: string) =>
        filteredData
            .filter(item => item.scnby === scannedBy)
            .map(item => [
                parseFloat(String(item.ylwwt)) || 0,
                parseFloat(String(item.redwt)) || 0,
                parseFloat(String(item.whtwt)) || 0,
                parseFloat(String(item.bluwt)) || 0,
                parseFloat(String(item.cytwt)) || 0
            ]);

    const processDataCnt = (filteredData: any[], scannedBy: string) =>
        filteredData
            .filter(item => item.scnby === scannedBy)
            .map(item => [
                parseFloat(String(item.ylwcnt)) || 0,
                parseFloat(String(item.redcnt)) || 0,
                parseFloat(String(item.whtcnt)) || 0,
                parseFloat(String(item.blucnt)) || 0,
                parseFloat(String(item.cytcnt)) || 0
            ]);


    const transposeData = (data: any) =>
        data.length > 0 ? data[0].map((_: any, colIndex: number) => data.map((row: any) => row[colIndex])) : [];

    // Process data based on 'scnby' values
    const generatedData = transposeData(processData(filteredDataBelow, 'HCF'));
    const collectedData = transposeData(processData(filteredDataBelow, 'Supervisor'));
    const processedData = transposeData(processData(filteredDataBelow, 'Plant'));

    const generatedDataCnt = transposeData(processDataCnt(filteredDataBelowCnt, 'HCF'));
    const collectedDataCnt = transposeData(processDataCnt(filteredDataBelowCnt, 'Supervisor'));
    const processedDataCnt = transposeData(processDataCnt(filteredDataBelowCnt, 'Plant'));

    const generatedDataAbv = transposeData(processData(filteredDataAbove, 'HCF'));
    const collectedDataAbv = transposeData(processData(filteredDataAbove, 'Supervisor'));
    const processedDataAbv = transposeData(processData(filteredDataAbove, 'Plant'));

    const generatedDataCntAbv = transposeData(processDataCnt(filteredDataAboveCnt, 'HCF'));
    const collectedDataCntAbv = transposeData(processDataCnt(filteredDataAboveCnt, 'Supervisor'));
    const processedDataCntAbv = transposeData(processDataCnt(filteredDataAboveCnt, 'Plant'));

    // Chart configuration with updated colors
    const chartDataBelow = {
        labels: labels,
        datasets: [
            {
                label: "Generated",
                data: generatedData.map((d: number[]) => {
                    const firstValue = Number(d[0]) || 0;
                    const secondValue = Number(d[1]) || 0;

                    return parseFloat((firstValue + secondValue).toFixed(3));
                }),
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Collected",
                data: collectedData.map((d: number[]) => {
                    const firstValue = Number(d[0]) || 0;
                    const secondValue = Number(d[1]) || 0;

                    return parseFloat((firstValue + secondValue).toFixed(3));
                }),
                backgroundColor: "rgba(255, 206, 86, 0.5)",
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 1,
            },
            {
                label: "Processed",
                data: processedData.map((d: number[]) => {
                    const firstValue = Number(d[0]) || 0;
                    const secondValue = Number(d[1]) || 0;

                    return parseFloat((firstValue + secondValue).toFixed(3));
                }),
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
                text: "Waste bag below 30 bedded"
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
                text: "Waste bag below 30 bedded"
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
                data: generatedDataCnt.map((d: number[]) => {
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
                data: collectedDataCnt.map((d: number[]) => {
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
                data: processedDataCnt.map((d: number[]) => {
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
                text: "Waste bag above 30 bedded"
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
                data: generatedDataAbv.map((d: number[]) => {
                    const firstValue = Number(d[0]) || 0;
                    const secondValue = Number(d[1]) || 0;

                    return parseFloat((firstValue + secondValue).toFixed(3));
                }),
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Collected",
                data: collectedDataAbv.map((d: number[]) => {
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
                data: processedDataAbv.map((d: number[]) => {
                    const firstValue = Number(d[0]) || 0;
                    const secondValue = Number(d[1]) || 0;

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
                text: "Waste bag above 30 bedded"
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
                data: generatedDataCntAbv.map((d: number[]) => {
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
                data: collectedDataCntAbv.map((d: number[]) => {
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
                data: processedDataCntAbv.map((d: number[]) => {
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
        let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g127", `10=${gid}`);
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
                requireFldCbwtf={""}
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
                                            <h4>   {Math.round(sum(dataBelowWt, dataAboveWt, 'bags'))} <span className="font-semibold text-[24px]">Kg</span></h4>
                                        </div>
                                        <div className="bg-blue-50 rounded p-2 w-full px-4">
                                            <h4>   {sum(dataBelowCnt, dataAboveCnt, 'bags')} <span className="font-semibold text-[24px]">Bags</span></h4>
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
                                            <h4>   {Math.round(sum(dataBelowWt, dataAboveWt, 'item1'))} <span className="font-semibold text-[24px]">Kg</span></h4>
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
                                            <h4>   {Math.round(sum(dataBelowWt, dataAboveWt, 'item2'))} <span className="font-semibold text-[24px]">Kg</span></h4>
                                        </div>
                                        <div className="bg-blue-50 rounded p-2 w-full px-4">
                                            <h4>   {sum(dataBelowCnt, dataAboveCnt, 'item2')} <span className="font-semibold text-[24px]">Bags</span></h4>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800 font-semibold">All HCFs</span>
                            </div>
                        </div>
                        {/* <div className="flex text-[18px] justify-end my-3  p-1 shadow-lg">
                            <span className="">Kg</span>
                            <OnOffToggle onToggleChange={handleToggleChange} />
                            <span className="">Bags</span>
                        </div> */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4   ">
                            <div className=" bg-white py-2 px-3 col-span-2 rounded shadow">
                                <div className="flex justify-between items-center m-2">
                                    {toggleState ? (
                                        <h6>Total bag count from below 30 bedded hospitals</h6>
                                    ) : (
                                        <h6>Total bag weight from below 30 bedded hospitals</h6>
                                    )}
                                    <div className="flex items-center text-[18px] space-x-2 p-1">
                                        <span>Kg</span>
                                        <OnOffToggle onToggleChange={handleToggleChange} />
                                        <span>Bags</span>
                                    </div>
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
                                    <GraphDataTable data={dataBelowCnt} heading={headingBelow30} />
                                </div>
                                <span className='text-[16px]'>Table: bag weight</span><hr className='m-0' />
                                <div className="">
                                    <GraphDataTable data={dataBelowWt} heading={headingBelow30} />
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


                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4   ">
                            <div className=" bg-white py-2 px-3 col-span-2 rounded shadow">
                                <div className="flex justify-between m-2">
                                    {toggleState ? (<>
                                        <h6>Total bag count from above 30 bedded hospitals </h6>
                                    </>) : <>
                                        <h6>Total bag weight from above 30 bedded hospitals</h6>
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
                    </div>
                </div>
            </div>
        </>

    );
}; export default React.memo(DashboardChartViewscanBy);
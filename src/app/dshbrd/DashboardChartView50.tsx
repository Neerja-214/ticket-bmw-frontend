import React, { useEffect, useReducer, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, dateCheck30Days, getApplicationVersion, getStateAbbreviation, postLinux, svLnxSrvr } from '../../utilities/utilities'
import { useNavigate } from "react-router-dom";
import { Toaster } from "../../components/reusable/Toaster";
import OnOffToggle from '../MIS/onOffToggle';
import DashboardChart from './DashboardChart';
import GraphDataTable from '../MIS/grapghDataTable';
import LevelSelectorOne from './LevelSelectorOne';
import GraphDataTable2 from '../MIS/grapghDataTable2';
import { nrjAxios, nrjAxiosRequestBio } from '../../Hooks/useNrjAxios';
import { getFldValue } from '../../Hooks/useGetFldValue';
import { Button } from '@mui/material';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { useToaster } from '../../components/reusable/ToasterContext';
import { Doughnut, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);


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

type DoughnutDataType = {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        hoverOffset: number;
    }[];
};


const DashboardChartView50 = (props: any) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const [isLoading, setIsLoading] = useState("")
    const [inputData, setInputData] = useState({ lvl: "", who: "", frmDate: "", toDate: "" })

    const colorWtArray = { redwt: 'Red', bluwt: 'Blue', ylwwt: 'Yellow', cytwt: 'Cytotoxic', whtwt: 'White' }
    const colorCntArray = { redcnt: "Red", blucnt: "Blue", ylwcnt: 'Yellow', cytcnt: 'Cytotoxic', whtcnt: 'White' };
    const emptyArray = [["Color", "Bags"]]



    const [chrtDataGenBlwCnt, setChrtDataGenBlwCnt] = useState<any[]>(emptyArray)
    const [chrtDataGenBlwWt, setChrtDataGenBlwWt] = useState<any[]>(emptyArray)
    const [chrtDataGenAbvCnt, setChrtDataGenAbvCnt] = useState<any[]>(emptyArray)
    const [chrtDataGenAbvWt, setChrtDataGenAbvWt] = useState<any[]>(emptyArray)

    const [chrtDataProBlwCnt, setChrtDataProBlwCnt] = useState<any[]>(emptyArray)
    const [chrtDataProAbvCnt, setChrtDataProAbvCnt] = useState<any[]>(emptyArray)
    const [chrtDataProBlwWt, setChrtDataProBlwWt] = useState<any[]>(emptyArray)
    const [chrtDataProAbvWt, setChrtDataProAbvWt] = useState<any[]>(emptyArray)

    const [chrtDataColBlwCnt, setChrtDataColBlwCnt] = useState<any[]>(emptyArray)
    const [chrtDataColAbvCnt, setChrtDataColAbvCnt] = useState<any[]>(emptyArray)
    const [chrtDataColBlwWt, setChrtDataColBlwWt] = useState<any[]>(emptyArray)
    const [chrtDataColAbvWt, setChrtDataColAbvWt] = useState<any[]>(emptyArray)

    const [dgntGenDataAbv30, setDgntGenData] = useState<DoughnutDataType | null>(null);
    const [dgntGenDataCntAbv30, setDgntGenCntData] = useState<DoughnutDataType | null>(null);
    const [dgntGenDataAbvClct, setDgntGenDataAbvClct] = useState<DoughnutDataType | null>(null);
    const [dgntGenDataCntAbvClct, setDgntGenCntDataClct] = useState<DoughnutDataType | null>(null);
    const [dgntGenDataAbvPrcd, setDgntGenDataAbvPrcd] = useState<DoughnutDataType | null>(null);
    const [dgntGenDataCntAbvPrcd, setDgntGenCntDataPrcd] = useState<DoughnutDataType | null>(null);


    const [dgntGenDataBlw30, setDgntGenBlwData] = useState<DoughnutDataType | null>(null);
    const [dgntGenDataCntBlw30, setDgntGenCntBlwData] = useState<DoughnutDataType | null>(null);
    const [dgntGenDataBlwClct, setDgntGenDataBlwClct] = useState<DoughnutDataType | null>(null);
    const [dgntGenDataCntBlwClct, setDgntGenCntDataBlwClct] = useState<DoughnutDataType | null>(null);
    const [dgntGenDataBlwPrcd, setDgntGenDataBlwPrcd] = useState<DoughnutDataType | null>(null);
    const [dgntGenDataCntBlwPrcd, setDgntGenCntDataBlwPrcd] = useState<DoughnutDataType | null>(null);

    const options = {
        colors: ["#FF4435", "#87CEEB", "#FFFF99", "#FFC700", "#F0F0F0"],
        title: "Weights of bags scanned within 50 meter distance scanned",
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


    useEffect(() => {
        if (!chrtDataProBlwWt || chrtDataProBlwWt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataProBlwWt.find(row => row[0] === label);
            // return entry ? Number(entry[1]) || 0 : 0;
            return entry ? parseFloat(Number(entry[1]).toFixed(3)) : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenDataBlwPrcd(updatedData);
    }, [chrtDataProBlwWt]);



    useEffect(() => {
        if (!chrtDataProBlwCnt || chrtDataProBlwCnt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataProBlwCnt.find(row => row[0] === label);
            return entry ? Number(entry[1]) || 0 : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenCntDataBlwPrcd(updatedData);
    }, [chrtDataProBlwCnt]);



    useEffect(() => {
        if (!chrtDataColBlwWt || chrtDataColBlwWt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataColBlwWt.find(row => row[0] === label);
            // return entry ? Number(entry[1]) || 0 : 0;
            return entry ? parseFloat(Number(entry[1]).toFixed(3)) : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenDataBlwClct(updatedData);
    }, [chrtDataColBlwWt]);

    useEffect(() => {
        if (!chrtDataColBlwCnt || chrtDataColBlwCnt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataColBlwCnt.find(row => row[0] === label);
            return entry ? Number(entry[1]) || 0 : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenCntDataBlwClct(updatedData);
    }, [chrtDataColBlwCnt]);



    useEffect(() => {
        if (!chrtDataGenBlwCnt || chrtDataGenBlwCnt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataGenBlwCnt.find(row => row[0] === label);
            return entry ? Number(entry[1]) || 0 : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenCntBlwData(updatedData);
    }, [chrtDataGenBlwCnt]);


    useEffect(() => {
        if (!chrtDataGenBlwWt || chrtDataGenBlwWt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataGenBlwWt.find(row => row[0] === label);
            // return entry ? Number(entry[1]) || 0 : 0;
            return entry ? parseFloat(Number(entry[1]).toFixed(3)) : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenBlwData(updatedData);
    }, [chrtDataGenBlwWt]);




    useEffect(() => {
        if (!chrtDataGenAbvWt || chrtDataGenAbvWt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataGenAbvWt.find(row => row[0] === label);
            // return entry ? Number(entry[1]) || 0 : 0;
            return entry ? parseFloat(Number(entry[1]).toFixed(3)) : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenData(updatedData);
    }, [chrtDataGenAbvWt]);


    useEffect(() => {
        if (!chrtDataGenAbvCnt || chrtDataGenAbvCnt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataGenAbvCnt.find(row => row[0] === label);
            return entry ? Number(entry[1]) || 0 : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenCntData(updatedData);
    }, [chrtDataGenAbvCnt]);

    useEffect(() => {
        if (!chrtDataColAbvCnt || chrtDataColAbvCnt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataColAbvCnt.find(row => row[0] === label);
            return entry ? Number(entry[1]) || 0 : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenCntDataClct(updatedData);
    }, [chrtDataColAbvCnt]);

    useEffect(() => {
        if (!chrtDataColAbvWt || chrtDataColAbvWt.length <= 1) return;
        console.log(chrtDataColAbvWt)
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataColAbvWt.find(row => row[0] === label);
            return entry ? parseFloat(Number(entry[1]).toFixed(3)) : 0;
            // return entry ? Number(entry[1]) || 0 : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenDataAbvClct(updatedData);
    }, [chrtDataColAbvWt]);

    useEffect(() => {
        if (!chrtDataProAbvCnt || chrtDataProAbvCnt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataProAbvCnt.find(row => row[0] === label);
            return entry ? Number(entry[1]) || 0 : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenDataAbvPrcd(updatedData);
    }, [chrtDataProAbvCnt]);

    useEffect(() => {
        if (!chrtDataProAbvWt || chrtDataProAbvWt.length <= 1) return;
        const labelOrder = ["Yellow", "Red", "Cytotoxic", "Blue", "White"];
        const values = labelOrder.map(label => {
            const entry = chrtDataProAbvWt.find(row => row[0] === label);
            // return entry ? Number(entry[1]) || 0 : 0;
            return entry ? parseFloat(Number(entry[1]).toFixed(3)) : 0;
        });

        const updatedData: DoughnutDataType = {
            labels: labelOrder,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        "rgb(255, 205, 86)", // Yellow
                        "rgb(255, 99, 132)", // Red
                        "#CE93D8",           // Cytotoxic
                        "rgb(54, 162, 235)", // Blue
                        "#F1F8E9",           // White
                    ],
                    hoverOffset: 4,
                },
            ],
        };

        setDgntGenCntDataPrcd(updatedData);
    }, [chrtDataProAbvWt]);


    const GetGid = () => {
        let g: any = utilities(3, "", "");
        dispatch({ type: ACTIONS.SETGID, payload: g });
        return g;
    };


    const getData = () => {
        let gid = GetGid()
        // let fromDate: string = inputData.frmDate;
        // let toDate: string = inputData.toDate; //
        // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a249", inputData.lvl + '=' + inputData.who + '=1=' + fromDate + '=' + toDate + '=' + gid + '=1');
        // return nrjAxios({ apiCall: api });

        let fromDate = UseMomentDateNmb(inputData.frmDate);
        let toDate = UseMomentDateNmb(inputData.toDate);
        let payload: any = postLinux(inputData.lvl + '=' + inputData.who + '=' + fromDate + '=' + toDate + '=' + gid, 'show_GeoCtg_period');
        return nrjAxiosRequestBio("show_GeoCtg_period", payload);
    };
    const getDataFromResult = (genArray: any, colorArray: any) => {
        let tempArray: any[] = [];
        Object.keys(colorArray).forEach(element => {
            if (genArray && genArray[element] && !isNaN(Number(genArray[element]))) {
                tempArray.push([colorArray[element], Number(genArray[element])])
            }
            else {
                tempArray.push([colorArray[element], 0])
            }
        });
        return [...chrtDataGenBlwCnt, ...tempArray]
    }

    const populateGridFromResult = (tempData30: any, genAry: any) => {
        tempData30.forEach((element: any) => {
            if (genAry && genAry[element.id] && !isNaN(Number(genAry[element.id]))) {
                element.items.push(Number(Number(genAry[element.id]).toFixed(3)))
            }
            else {
                element.items.push(0)
            }
        });
        return tempData30;
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
        setIsLoading("")
        let ary: any = GetResponseLnx(data1);
        let dt: any[] = []
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
        dt = [tempHcfCor, tempHcfWr, tempCbwtfCor, tempCbwtfWr, tempFctCor, tempFctWr]

        let tempDataBelowAboveCnt = dataBelowAboveCnt;
        let tempDataBelowAboveWt = dataBelowAboveWt;

        setChrtDataGenBlwCnt(getDataFromResult(tempHcfCor, colorCntArray))
        setChrtDataGenBlwWt(getDataFromResult(tempHcfCor, colorWtArray))
        tempDataBelowAboveCnt = populateGridFromResult(tempDataBelowAboveCnt, tempHcfCor);
        tempDataBelowAboveWt = populateGridFromResult(tempDataBelowAboveWt, tempHcfCor);


        setChrtDataGenAbvCnt(getDataFromResult(tempHcfWr, colorCntArray))
        setChrtDataGenAbvWt(getDataFromResult(tempHcfWr, colorWtArray))
        tempDataBelowAboveCnt = populateGridFromResult(tempDataBelowAboveCnt, tempHcfWr);
        tempDataBelowAboveWt = populateGridFromResult(tempDataBelowAboveWt, tempHcfWr);


        setChrtDataColBlwCnt(getDataFromResult(tempCbwtfCor, colorCntArray))
        setChrtDataColBlwWt(getDataFromResult(tempCbwtfCor, colorWtArray))
        tempDataBelowAboveCnt = populateGridFromResult(tempDataBelowAboveCnt, tempCbwtfCor);
        tempDataBelowAboveWt = populateGridFromResult(tempDataBelowAboveWt, tempCbwtfCor);

        setChrtDataColAbvCnt(getDataFromResult(tempCbwtfWr, colorCntArray))
        setChrtDataColAbvWt(getDataFromResult(tempCbwtfWr, colorWtArray))
        tempDataBelowAboveCnt = populateGridFromResult(tempDataBelowAboveCnt, tempCbwtfWr);
        tempDataBelowAboveWt = populateGridFromResult(tempDataBelowAboveWt, tempCbwtfWr);


        setChrtDataProBlwCnt(getDataFromResult(tempFctCor, colorCntArray))
        setChrtDataProBlwWt(getDataFromResult(tempFctCor, colorWtArray))
        tempDataBelowAboveCnt = populateGridFromResult(tempDataBelowAboveCnt, tempFctCor);
        tempDataBelowAboveWt = populateGridFromResult(tempDataBelowAboveWt, tempFctCor);


        setChrtDataProAbvCnt(getDataFromResult(tempFctWr, colorCntArray))
        setChrtDataProAbvWt(getDataFromResult(tempFctWr, colorWtArray))
        tempDataBelowAboveCnt = populateGridFromResult(tempDataBelowAboveCnt, tempFctWr);
        tempDataBelowAboveWt = populateGridFromResult(tempDataBelowAboveWt, tempFctWr);

        setDataBelowAboveCnt(tempDataBelowAboveCnt);
        setDataBelowAboveWt(tempDataBelowAboveWt);

    };


    const { data, refetch } = useQuery({
        queryKey: ["dshbr50meter",],
        queryFn: getData,
        enabled: false,
        staleTime: 0,
        refetchInterval: 300000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });

    const { showToaster, hideToaster } = useToaster();
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




    const setLvlWhoData = (data: any) => {
        setInputData({ lvl: data.lvl, who: data.who, frmDate: data.frmDate, toDate: data.toDate });
        clearVariables();
    }

    const clearVariables = () => {
        setChrtDataGenBlwCnt(emptyArray)
        setChrtDataGenBlwWt(emptyArray)
        setChrtDataGenAbvCnt(emptyArray)
        setChrtDataGenAbvWt(emptyArray)
        setChrtDataProBlwCnt(emptyArray)
        setChrtDataProAbvCnt(emptyArray)
        setChrtDataProBlwWt(emptyArray)
        setChrtDataProAbvWt(emptyArray)
        setChrtDataColBlwCnt(emptyArray)
        setChrtDataColAbvCnt(emptyArray)
        setChrtDataColBlwWt(emptyArray)
        setChrtDataColAbvWt(emptyArray)
        setDataBelowAboveCnt(emptyGridData)
        setDataBelowAboveWt(emptyGridWtData)
        setDgntGenData(null)
        setDgntGenCntData(null)
        setDgntGenDataAbvClct(null)
        setDgntGenCntDataClct(null)
        setDgntGenDataAbvPrcd(null)
        setDgntGenCntDataPrcd(null)
        setDgntGenBlwData(null)
        setDgntGenCntBlwData(null)
        setDgntGenDataBlwClct(null)
        setDgntGenCntDataBlwClct(null)
        setDgntGenDataBlwPrcd(null)
        setDgntGenCntDataBlwPrcd(null)
    }

    const [toggleState, setToggleState] = useState(false);

    const handleToggleChange = (newState: any) => {
        setToggleState(newState);
    };

    const emptyGridData: any[] = [
        { id: 'redcnt', color: 'Red', parentClass: 'bg-red-700 ', items: [] },
        { id: 'blucnt', color: 'Blue', parentClass: 'bg-blue-700 ', items: [] },
        { id: 'ylwcnt', color: 'Yellow', parentClass: 'bg-yellow-300 ', items: [] },
        { id: 'cytcnt', color: 'Cytotoxic', parentClass: 'bg-yellow-500 ', items: [] },
        { id: 'whtcnt', color: 'White', parentClass: 'bg-gray-100 ', items: [] },
    ]
    const emptyGridWtData: any[] = [
        { id: 'redwt', color: 'Red', items: [], parentClass: 'bg-red-700 ' },
        { id: 'bluwt', color: 'Blue', items: [], parentClass: 'bg-blue-700 ' },
        { id: 'ylwwt', color: 'Yellow', items: [], parentClass: 'bg-yellow-300 ' },
        { id: 'cytwt', color: 'Cytotoxic', items: [], parentClass: 'bg-yellow-500 ' },
        { id: 'whtwt', color: 'White', items: [], parentClass: 'bg-gray-100' },
    ]

    const [dataBelowAboveCnt, setDataBelowAboveCnt] = useState<any[]>([
        { id: 'redcnt', color: 'Red', parentClass: 'bg-red-700 ', items: [] },
        { id: 'blucnt', color: 'Blue', parentClass: 'bg-blue-700 ', items: [] },
        { id: 'ylwcnt', color: 'Yellow', parentClass: 'bg-yellow-300 ', items: [] },
        { id: 'cytcnt', color: 'Cytotoxic', parentClass: 'bg-yellow-500 ', items: [] },
        { id: 'whtcnt', color: 'White', parentClass: 'bg-gray-100 ', items: [] },
    ]);

    const [dataBelowAboveWt, setDataBelowAboveWt] = useState<any[]>([
        { id: 'redwt', color: 'Red', items: [], parentClass: 'bg-red-700 ' },
        { id: 'bluwt', color: 'Blue', items: [], parentClass: 'bg-blue-700 ' },
        { id: 'ylwwt', color: 'Yellow', items: [], parentClass: 'bg-yellow-300 ' },
        { id: 'cytwt', color: 'Cytotoxic', items: [], parentClass: 'bg-yellow-500 ' },
        { id: 'whtwt', color: 'White', items: [], parentClass: 'bg-gray-100' },
    ]);

    const headingBelow = [
        { col1: ' ', col2: 'Color', col3: 'Within 50 mtr', col4: 'Beyond 50 mtr', col5: 'Within 50 mtr', col6: 'Beyond 50 mtr', col7: 'Within 50 mtr', col8: 'Beyond 50 mtr' },
    ]


    const sum = (grid: any[], below: number, above: number) => {
        let sum = 0;
        for (let i = 0; i < grid.length; i++) {
            let a = (grid[i].items[above] && !isNaN(grid[i].items[above])) ? grid[i].items[above] : 0;
            let b = (grid[i].items[below] && !isNaN(grid[i].items[below])) ? grid[i].items[below] : 0;
            sum += a + b
        }
        return sum;
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

    const chartOptionsAbvGen: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataAbv30 ? dgntGenDataAbv30.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const chartOptionsAbvGenCnt: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataCntAbv30 ? dgntGenDataCntAbv30.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const chartOptionsBlwGenCnt: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataCntBlw30 ? dgntGenDataCntBlw30.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const chartOptionsBlwClcCnt: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataCntBlwClct ? dgntGenDataCntBlwClct.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const chartOptionsBlwClcwgt: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataBlwClct ? dgntGenDataBlwClct.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const chartOptionsBlwPrcdwgt: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataBlwPrcd ? dgntGenDataBlwPrcd.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };



    const chartOptionsBlwPrcdCnt: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataCntBlwPrcd ? dgntGenDataCntBlwPrcd.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const chartOptionsBlwGenwgt: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataBlw30 ? dgntGenDataBlw30.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const chartOptionsAbvGenClct: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataAbvClct ? dgntGenDataAbvClct.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const chartOptionsAbvGenCntClct: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataCntAbvClct ? dgntGenDataCntAbvClct.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const chartOptionsAbvGenPrcd: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataAbvPrcd ? dgntGenDataAbvPrcd.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const chartOptionsAbvGenCntPrcd: ChartOptions<"doughnut"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top", // ✅ Only use "top" | "bottom" | "left" | "right" | "center"
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const value = tooltipItem.raw;
                        const total = dgntGenDataAbvPrcd ? dgntGenDataAbvPrcd.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
                        const percentage = ((Number(value) / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };


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
                <div className=" shadow rounded-lg ">
                    <div className=" font-semibold text-lg text-center ">{isLoading}</div>

                    {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                        <Toaster data={showMessage} className={''}></Toaster>
                    </div> : <></>}


                    {/* <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 ">
                        <div className=" bg-white py-2 px-3  rounded shadow">
                            <h6 className="m-2">
                                Generated
                            </h6>


                            <div className="flex m-2 justify-between">
                                <div className="bg-blue-100 rounded p-2 px-4">
                                    <h5>
                                        {sum(dataBelowAboveWt, 0,1).toFixed(3)}
                                        <span className="small text-[18px]"> (in kg)</span>
                                    </h5>

                                </div>
                                <div className="bg-blue-100 rounded p-2 px-4">
                                    <h5>
                                    {sum(dataBelowAboveCnt, 0,1)}
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
                                        {sum(dataBelowAboveWt, 2,3).toFixed(3)}
                                        <span className="small text-[18px]"> Kg</span>
                                    </h5>

                                </div>
                                <div className="bg-blue-100 rounded p-2 px-4">
                                    <h5>
                                    {sum(dataBelowAboveCnt, 2,3)}
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
                                        {sum(dataBelowAboveWt, 4, 5).toFixed(3)}
                                        <span className="small text-[18px]"> Kg</span>
                                    </h5>

                                </div>
                                <div className="bg-blue-100 rounded p-2 px-4">
                                    <h5>
                                    {sum(dataBelowAboveCnt, 4, 5)}
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
                                        <h4>   {Math.round(sum(dataBelowAboveWt, 0, 1))} <span className="font-semibold text-[24px]">Kg</span></h4>
                                    </div>
                                    <div className="bg-blue-50 rounded p-2 w-full px-4">
                                        <h4> {sum(dataBelowAboveCnt, 0, 1)} <span className="font-semibold text-[24px]">Bags</span></h4>
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
                                        <h4>   {Math.round(sum(dataBelowAboveWt, 2, 3))} <span className="font-semibold text-[24px]">Kg</span></h4>
                                    </div>
                                    <div className="bg-blue-50 rounded p-2 w-full px-4">
                                        <h4>  {sum(dataBelowAboveCnt, 2, 3)} <span className="font-semibold text-[24px]">Bags</span></h4>
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
                                        <h4>  {Math.round(sum(dataBelowAboveWt, 4, 5))} <span className="font-semibold text-[24px]">Kg</span></h4>
                                    </div>
                                    <div className="bg-blue-50 rounded p-2 w-full px-4">
                                        <h4>  {sum(dataBelowAboveCnt, 4, 5)} <span className="font-semibold text-[24px]">Bags</span></h4>
                                    </div>
                                </div>
                            </div>
                            <span className="text-sm text-gray-800 font-semibold">All HCFs</span>
                        </div>
                    </div>
                    {props.toggleState == undefined ? <div className="flex text-[18px] justify-end my-3 ">
                        <span className="">Kg</span>
                        <OnOffToggle onToggleChange={handleToggleChange} />
                        <span className="">Bags</span>
                    </div> : <></>}

                    <div className=' bg-gray-100 m-0 p-0'>

                        {/* * Below 50* */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-6 xl:gap-12 place-items-center">
                            <div className="bg-white py-4 px-6 rounded shadow w-full max-w-[470px] min-w-0 h-[500px] 
                            xl:max-w-[550px] xl:h-[560px] 
                            4k:max-w-[600px] 4k:h-[700px] flex flex-col items-center overflow-hidden">
                                <div className="text-center font-semibold m-2">Generated</div>
                                {/* <div className="text-center text-xs font-semibold m-2">
                                    {!toggleState ? 'Bag weight from within 50 mtr' : 'Bag count from within 50 mtr'}
                                </div> */}
                                <div className="flex justify-center w-full">
                                    <div className="chart-container 
                                    w-[280px] h-[280px] 
                                    md:w-[280px] md:h-[300px]  
                                    xl:w-[350px] xl:h-[380px]  
                                    2xl:w-[400px] 2xl:h-[420px]  
                                    4k:w-[500px] 4k:h-[500px]">
                                        {toggleState ? (<>
                                            {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataGenBlwWt} chrtOptions={{ ...options, title: "Count of bags scanned within 50 meter distance" }}></DashboardChart> */}
                                            {dgntGenDataCntBlw30 && <Doughnut data={dgntGenDataCntBlw30} options={chartOptionsBlwGenCnt} />}
                                        </>) : <>
                                            {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataGenBlwCnt} chrtOptions={{ ...options, title: "Weight of bags scanned within 50 meter distance" }}></DashboardChart> */}
                                            {dgntGenDataBlw30 && <Doughnut data={dgntGenDataBlw30} options={chartOptionsBlwGenwgt} />}

                                        </>}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800 font-semibold"> {toggleState ? (<>
                                    Total bag count from within 50 meter distance
                                </>) : <>
                                    Total bag weight from within 50 meter distance
                                </>}</span>
                            </div>



                            <div className="bg-white py-4 px-6 rounded shadow w-full max-w-[470px] min-w-0 h-[500px] 
                            xl:max-w-[550px] xl:h-[560px] 
                            4k:max-w-[600px] 4k:h-[700px] flex flex-col items-center overflow-hidden">
                                <div className="text-center font-semibold m-2">Collected</div>
                                {/* <div className="text-center text-xs font-semibold m-2">
                                    {!toggleState ? 'Bag weight from within 50 mtr' : 'Bag count from within 50 mtr'}
                                </div> */}
                                <div className="flex justify-center w-full">
                                    <div className="chart-container 
                                    w-[280px] h-[280px] 
                                    md:w-[280px] md:h-[300px]  
                                    xl:w-[350px] xl:h-[380px]  
                                    2xl:w-[400px] 2xl:h-[420px]  
                                    4k:w-[500px] 4k:h-[500px]">
                                        {toggleState ? (
                                            <>
                                                {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataColBlwWt} chrtOptions={{ ...options, title: "Count of bags scanned within 50 meter distance" }}></DashboardChart> */}
                                                {dgntGenDataCntBlwClct && <Doughnut data={dgntGenDataCntBlwClct} options={chartOptionsBlwClcCnt} />}


                                            </>) : <>
                                            {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataColBlwCnt} chrtOptions={{ ...options, title: "Weight of bags scanned within 50 meter distance" }}></DashboardChart> */}

                                            {dgntGenDataBlwClct && <Doughnut data={dgntGenDataBlwClct} options={chartOptionsBlwClcwgt} />}
                                        </>}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800 font-semibold"> {toggleState ? (<>
                                    Total bag count from within 50 meter distance
                                </>) : <>
                                    Total bag weight from within 50 meter distance
                                </>}</span>
                            </div>


                            {/* Chart 3 */}
                            <div className="bg-white py-4 px-6 rounded shadow w-full max-w-[470px] min-w-0 h-[500px] 
                            xl:max-w-[550px] xl:h-[560px] 
                            4k:max-w-[600px] 4k:h-[700px] flex flex-col items-center overflow-hidden">
                                <div className="text-center font-semibold m-2">Processed</div>
                                {/* <div className="text-center text-xs font-semibold m-2">
                                    {!toggleState ? 'Bag weight from within 50 mtr' : 'Bag count from within 50 mtr'}
                                </div> */}
                                <div className="flex justify-center w-full">
                                    <div className="chart-container 
                                    w-[280px] h-[280px] 
                                    md:w-[280px] md:h-[300px]  
                                    xl:w-[350px] xl:h-[380px]  
                                    2xl:w-[400px] 2xl:h-[420px]  
                                    4k:w-[500px] 4k:h-[500px]">
                                        {toggleState ? (
                                            <>
                                                {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataProBlwCnt} chrtOptions={{ ...options, title: "Count of bags scanned within 50 meter distance" }}></DashboardChart> */}
                                                {dgntGenDataCntBlwPrcd && <Doughnut data={dgntGenDataCntBlwPrcd} options={chartOptionsBlwPrcdCnt} />}

                                            </>) : <>
                                            {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataProBlwWt} chrtOptions={{ ...options, title: "Weights of bags scanned within 50 meter distance" }}></DashboardChart> */}
                                            {dgntGenDataBlwPrcd && <Doughnut data={dgntGenDataBlwPrcd} options={chartOptionsBlwPrcdwgt} />}

                                        </>}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800 font-semibold"> {toggleState ? (<>
                                    Total bag count from within 50 meter distance
                                </>) : <>
                                    Total bag weight from within 50 meter distance
                                </>}</span>
                            </div>

                        </div>

                        {/* * Above 50* */}

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-6 xl:gap-12 place-items-center">
                            <div className="bg-white py-4 px-6 rounded shadow w-full max-w-[470px] min-w-0 h-[500px] 
                            xl:max-w-[550px] xl:h-[560px] 
                            4k:max-w-[600px] 4k:h-[700px] flex flex-col items-center overflow-hidden">
                                <div className="text-center font-semibold m-2">Generated</div>
                                {/* <div className="text-center text-xs font-semibold m-2">
                                    {!toggleState ? 'Bag weight from beyond 50 mtr' : 'Bag count from beyond 50 mtr'}
                                </div> */}
                                <div className="flex justify-center w-full">
                                    <div className="chart-container 
                                    w-[280px] h-[280px] 
                                    md:w-[280px] md:h-[300px]  
                                    xl:w-[350px] xl:h-[380px]  
                                    2xl:w-[400px] 2xl:h-[420px]  
                                    4k:w-[500px] 4k:h-[500px]">
                                        {toggleState ? (<>
                                            {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataGenAbvCnt} chrtOptions={{ ...options, title: "Count of bags scanned outside of 50 meter distance" }}></DashboardChart> */}
                                            {dgntGenDataCntAbv30 && <Doughnut data={dgntGenDataCntAbv30} options={chartOptionsAbvGenCnt} />}
                                        </>) : <>
                                            {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataGenAbvWt} chrtOptions={{ ...options, title: "Weight of bags scanned outside of 50 meter distance" }}></DashboardChart> */}
                                            {dgntGenDataAbv30 && <Doughnut data={dgntGenDataAbv30} options={chartOptionsAbvGen} />}
                                        </>}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800 font-semibold"> {toggleState ? (<>
                                    Total bag count from beyond 50 meter distance
                                </>) : <>
                                    Total bag weight from beyond 50 meter distance
                                </>}</span>
                            </div>



                            <div className="bg-white py-4 px-6 rounded shadow w-full max-w-[470px] min-w-0 h-[500px] 
                            xl:max-w-[550px] xl:h-[560px] 
                            4k:max-w-[600px] 4k:h-[700px] flex flex-col items-center overflow-hidden">
                                <div className="text-center font-semibold m-2">Collected</div>
                                {/* <div className="text-center text-xs font-semibold m-2">
                                    {!toggleState ? 'Bag weight from beyond 50 mtr' : 'Bag count from beyond 50 mtr'}
                                </div>*/}
                                <div className="flex justify-center w-full"> 
                                    <div className="chart-container 
                                    w-[280px] h-[280px] 
                                    md:w-[280px] md:h-[300px]  
                                    xl:w-[350px] xl:h-[380px]  
                                    2xl:w-[400px] 2xl:h-[420px]  
                                    4k:w-[500px] 4k:h-[500px]">
                                        {toggleState ? (
                                            <>
                                                {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataColAbvWt} chrtOptions={{ ...options, title: "Count of bags scanned outside of 50 meter distance" }}></DashboardChart> */}
                                                {dgntGenDataAbvClct && <Doughnut data={dgntGenDataAbvClct} options={chartOptionsAbvGenClct} />}

                                            </>) : <>
                                            {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataColAbvCnt} chrtOptions={{ ...options, title: "Weight of bags scanned outside 50 meter distance" }}></DashboardChart> */}
                                            {dgntGenDataCntAbvClct && <Doughnut data={dgntGenDataCntAbvClct} options={chartOptionsAbvGenCntClct} />}

                                        </>}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800 font-semibold"> {toggleState ? (<>
                                    Total bag count from beyond 50 meter distance
                                </>) : <>
                                    Total bag weight from beyond 50 meter distance
                                </>}</span>
                            </div>


                            {/* Chart 3 */}
                            <div className="bg-white py-4 px-6 rounded shadow w-full max-w-[470px] min-w-0 h-[500px] 
                            xl:max-w-[550px] xl:h-[560px] 
                            4k:max-w-[600px] 4k:h-[700px] flex flex-col items-center overflow-hidden">
                                <div className="text-center font-semibold m-2">Processed</div>
                                {/* <div className="text-center text-xs font-semibold m-2">
                                    {!toggleState ? 'Bag weight from beyond 50 mtr' : 'Bag count from beyond 50 mtr'}
                                </div> */}
                                <div className="flex justify-center w-full">
                                    <div className="chart-container 
                                    w-[280px] h-[280px] 
                                    md:w-[280px] md:h-[300px]  
                                    xl:w-[350px] xl:h-[380px]  
                                    2xl:w-[400px] 2xl:h-[420px]  
                                    4k:w-[500px] 4k:h-[500px]">
                                        {toggleState ? (
                                            <>
                                                {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataProAbvWt} chrtOptions={{ ...options, title: "Count of bags scanned outside of 50 meter distance" }}></DashboardChart> */}
                                                {dgntGenDataAbvPrcd && <Doughnut data={dgntGenDataAbvPrcd} options={chartOptionsAbvGenPrcd} />}

                                            </>) : <>
                                            {/* <DashboardChart chrtType="PieChart" chrtHeight={300} chrtData={chrtDataProAbvCnt} chrtOptions={{ ...options, title: "Weight of bags scanned within 50 meter distance" }}></DashboardChart> */}
                                            {dgntGenDataCntAbvPrcd && <Doughnut data={dgntGenDataCntAbvPrcd} options={chartOptionsAbvGenCntPrcd} />}

                                        </>}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-800 font-semibold"> {toggleState ? (<>
                                    Total bag count from beyond 50 meter distance
                                </>) : <>
                                    Total bag weight from beyond 50 meter distance
                                </>}</span>
                            </div>

                        </div>




                        <div className=" mt-10 bg-white py-2 px-3  rounded shadow">
                            <div className="flex justify-between mx-2 my-4">
                                {toggleState ?
                                    <h6 className="">
                                        Count of bags collected as per scan by
                                    </h6>
                                    :
                                    <h6 className="">
                                        Weight of bags (in kg)
                                    </h6>
                                }


                            </div>
                            <div className="mx-2 flex justify-center items-center h-full">
                                {toggleState ? (<>

                                    <GraphDataTable2 data={dataBelowAboveCnt} heading={headingBelow} />


                                </>) : <>
                                    <GraphDataTable2 data={dataBelowAboveWt} heading={headingBelow} />
                                </>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}; export default React.memo(DashboardChartView50);
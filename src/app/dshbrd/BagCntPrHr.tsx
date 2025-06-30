import React, { useEffect, useReducer, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, getApplicationVersion, getStateAbbreviation, postLinux, svLnxSrvr } from '../../utilities/utilities'
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
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { useToaster } from '../../components/reusable/ToasterContext';
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ChartOptions } from "chart.js";

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


const BagCntPrHr = (props: any) => {
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(reducer, initialState);
    const [mainId, setMainId] = useState('')
    const [total, setTotal] = useState(0)
    const reqFlds = [{ fld: 'dt_rpt', msg: 'Select the Date', chck: 'length' }];

    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const [isLoading, setIsLoading] = useState("")
    const rowData: any[] = []
    const onRowSelected = (data: string) => { }
    const GridLoaded = () => { }
    const onButtonClicked = (action: string, rw: any) => { }

    const [lvl, setLvl] = useState("")
    const [who, setWho] = useState("")


    let cbwtfid = ""
    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
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
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        setTimeout(() => {
            refetch();
        }, 400)
    };




    const [chrtData, setChrtData] = useState<any[]>([["Hour", "Bag count by HCF", "Bag count by Operator", , "Bag count at CBWTF"], [1, 0, 0, 0], [2, 0, 0, 0], [3, 0, 0, 0], [4, 0, 0, 0], [5, 0, 0, 0], [6, 0, 0, 0], [7, 0, 0, 0], [8, 0, 0, 0], [9, 0, 0, 0], [10, 0, 0, 0], [11, 0, 0, 0], [12, 0, 0, 0], [13, 0, 0, 0], [14, 0, 0, 0], [15, 0, 0, 0], [16, 0, 0, 0], [17, 0, 0, 0], [18, 0, 0, 0], [19, 0, 0, 0], [20, 0, 0, 0], [21, 0, 0, 0], [22, 0, 0, 0], [23, 0, 0, 0], [24, 0, 0, 0]])
    const [chrtData2, setChrtData2] = useState<any[]>([["Hour", "Bag count by HCF", "Bag count by Operator", , "Bag count at CBWTF"], [1, 0, 0, 0], [2, 0, 0, 0], [3, 0, 0, 0], [4, 0, 0, 0], [5, 0, 0, 0], [6, 0, 0, 0], [7, 0, 0, 0], [8, 0, 0, 0], [9, 0, 0, 0], [10, 0, 0, 0], [11, 0, 0, 0], [12, 0, 0, 0], [13, 0, 0, 0], [14, 0, 0, 0], [15, 0, 0, 0], [16, 0, 0, 0], [17, 0, 0, 0], [18, 0, 0, 0], [19, 0, 0, 0], [20, 0, 0, 0], [21, 0, 0, 0], [22, 0, 0, 0], [23, 0, 0, 0], [24, 0, 0, 0]])
    const [currentLevel, setCurrentLevel] = useState('');
    const [drilllvlState, setDrillLvlState] = useState('');
    const UsegetList = () => {
        setTotal(0)
        setIsLoading("Loading data...")
        let dt = state.textDts
        let dt_rpt = UseMomentDateNmb(getFldValue(dt, "dt_rpt"));
        let gid: any = utilities(3, "", "")
        let gd: string = gid
        dispatch({ type: ACTIONS.SETGID, payload: gd })
        // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a183", lvl + "=" + who + "=" + dt_rpt + "=" + gd);
        // return nrjAxios({ apiCall: api })
        const payload: any = postLinux(lvl + '=' + who + '=' + dt_rpt + '=' + gd, 'bagcntprhr');
        return nrjAxiosRequestBio("show_BgPerHr", payload);
    }

    const ShowData = (dataSvd: any) => {
        setIsLoading("")

        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        let dataC: any = [
            [0, 0, 0, 0], [1, 0, 0, 0], [2, 0, 0, 0], [3, 0, 0, 0], [4, 0, 0, 0], [5, 0, 0, 0], [6, 0, 0, 0], [7, 0, 0, 0], [8, 0, 0, 0], [9, 0, 0, 0], [10, 0, 0, 0], [11, 0, 0, 0], [12, 0, 0, 0], [13, 0, 0, 0], [14, 0, 0, 0], [15, 0, 0, 0], [16, 0, 0, 0], [17, 0, 0, 0], [18, 0, 0, 0], [19, 0, 0, 0], [20, 0, 0, 0], [21, 0, 0, 0], [22, 0, 0, 0], [23, 0, 0, 0], [24, 0, 0, 0]
        ]
        let dt: any = GetResponseLnx(dataSvd);
        if (dt && Array.isArray(dt) && dt.length) {
            let ary: any[] = dt
            let total = 0
            ary.forEach((ech: any) => {
                total += Number(ech.bagcnthcf) + Number(ech.bagcntcbwtf) + Number(ech.bagcntfct)
            })
            setTotal(total)
            if (ary) {
                ary?.forEach((item: any) => {
                    dataC[item.hr][1] = dataC[item.hr][1] + Number(item.bagcnthcf);
                    dataC[item.hr][2] = dataC[item.hr][2] + Number(item.bagcntcbwtf);
                    dataC[item.hr][3] = dataC[item.hr][3] + Number(item.bagcntfct);
                });
            }

            if (total === 0) {
               showToaster(["No data received"], "error");
            }
        } else {
           showToaster(["No data received"], "error");
        }



        const data = [
            ["Hour", "Bag count by HCF", "Bag count by Operator", "Bag count at CBWTF"],
        ].concat(dataC)

        setChrtData(dt);
        setChrtData2(data)
        console.log(dataC)

    };

    const { data: dataSvd1, refetch: refetch } = useQuery({
        queryKey: ["getBagCntPrHr", state.mainId, state.rndm],
        queryFn: UsegetList,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });

    const clrFunct = () => {
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
        }, 100);
    };


    const options2 = {
        title: "Bag count by hour",
        curveType: "function",
        legend: { position: "bottom" },
    };
    const [chartType, setChartType] = useState<number>(1);
    // const changeChartType = (data: number) => {
    //     setChartType(data)
    // }

    const handleChartTypeChange = (chartType: any) => {
        setChartType(chartType);
    };


    const PrntRep = () => {
        let gid: string = state.gid
        // let lvl: string = "CPCB"; // sessionStorage.getItem('drilllvl') || sessionStorage.getItem('lvl')||'0';
        let dt = state.textDts
        let dt_rpt = getFldValue(dt, "dt_rpt");
        if (!gid) {
            showToaster(["populate the data in the grid"], 'error');
            return;
        }
        let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g120", `${gid}=${dt_rpt}=${lvl}`);
        return nrjAxios({ apiCall: api });
    };

    const ShowReprtt = (dataC: any) => {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        if (dataC && dataC.data && dataC.data[0] && dataC.data[0]["Data"]) {
            window.open(dataC.data[0]["Data"], "_blank")
        } else {
            setShowMessage({
                message: ["Please try again after refreshing the page!"],
                type: "error",
            });
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    }

    const { data: dataC, refetch: refetchC } = useQuery({
        queryKey: ['prntReports'],
        queryFn: PrntRep,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowReprtt,
    })
    function printClick() {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        refetchC()
    }

    const applicationVerion: string = getApplicationVersion();

    const setLvlWhoData = (data: any) => {
        setTotal(0)

        setLvl(data.lvl)
        setWho(data.who)
        onChangeDts(data.date)
        let dataC: any = [["Hour", "Bag count by HCF", "Bag count by Operator", "Bag count at CBWTF"],
        [0, 0, 0, 0], [1, 0, 0, 0], [2, 0, 0, 0], [3, 0, 0, 0], [4, 0, 0, 0], [5, 0, 0, 0], [6, 0, 0, 0], [7, 0, 0, 0], [8, 0, 0, 0], [9, 0, 0, 0], [10, 0, 0, 0], [11, 0, 0, 0], [12, 0, 0, 0], [13, 0, 0, 0], [14, 0, 0, 0], [15, 0, 0, 0], [16, 0, 0, 0], [17, 0, 0, 0], [18, 0, 0, 0], [19, 0, 0, 0], [20, 0, 0, 0], [21, 0, 0, 0], [22, 0, 0, 0], [23, 0, 0, 0], [24, 0, 0, 0]
        ]

        setChrtData(dataC);
        setChrtData2(dataC)
    }



    // const labels = chrtData.map(item => `${item.hr?item.hr:'00'}:00`);
    const labels = chrtData.map(item => {
        let hour = item.hr ? item.hr : 0; // Default to 00 if undefined
        let ampm = hour >= 12 ? "PM" : "AM";
        let formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12-hour format
        return `${hour}:00 ${ampm}`;
    });


    const data = {
        labels, // X-axis labels (Hours)
        datasets: [
            {
                label: "Bag count Operator",
                data: chrtData.map(item => item.bagcntcbwtf),
                backgroundColor: "rgba(255, 99, 132, 0.5)", // Red
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Bag count CBWTF",
                data: chrtData.map(item => item.bagcntfct),
                backgroundColor: "rgba(255, 206, 86, 0.5)", // Yellow
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 1,
            },
            {
                label: "Bag count HCF",
                data: chrtData.map(item => item.bagcnthcf),
                backgroundColor: "rgba(54, 162, 235, 0.5)", // Blue
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            }
        ],
    };

    // Chart Options


    const options: ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "bottom" as const, // ✅ Explicit assertion to avoid type error
            },
            title: {
                display: true,
                text: "Bag count by hour",
            },
        },
        scales: {
            x: {
                ticks: { color: "#4285F4" },
                title: { display: true, text: "Hour of day" },
            },
            y: {
                ticks: {
                    color: "#f44242",
                    stepSize: 1, // ✅ Ensures only whole numbers are displayed
                    callback: (value) => (Number.isInteger(value) ? value : null) // ✅ Hides decimals
                },
                title: { display: true, text: "Bag count by Hour" },
            },
        },
    };






    return (
        <>
            {applicationVerion == '1' && <>
                <div>
                    <HdrDrp hideHeader={false} formName=""></HdrDrp>
                </div>
                <span className="text-center text-bold mt-1 text-blue-600/75">
                    <h5>Bag Count Per Hour</h5>
                </span></>}

            <LevelSelector
                showCbwtf={false}
                levelSelectorData={setLvlWhoData}
                dateField={true}
                getListButton={true}
                getListOnclick={svClick}
                printButton={false}
                printButtonClick={printClick}
            ></LevelSelector>
            <div className="w-full max-h-screen  flex flex-col gap-4 p-4">
                {total ? (
                    <div className="border rounded-lg p-3 bg-white shadow">
                        <div className="font-semibold">Total waste bags: {total}</div>
                    </div>
                ) : null}

                <div className="bg-white rounded-lg shadow p-2">
                    <div className="font-semibold text-lg mb-2">{isLoading}</div>
                    <div className="flex justify-center pt-2 flex-wrap">
                        <div className="mr-4 fw-bold">
                            <label>
                                <input
                                    type="radio"
                                    name="chartType"
                                    value="1"
                                    checked={chartType === 1}
                                    onChange={() => handleChartTypeChange(1)}
                                />
                                <span className="px-2 text-red-600">Bar chart</span>
                            </label>
                        </div>
                        <div className="mr-4 fw-bold">
                            <label>
                                <input
                                    type="radio"
                                    name="chartType"
                                    value="2"
                                    checked={chartType === 2}
                                    onChange={() => handleChartTypeChange(2)}
                                />
                                <span className="px-2 text-red-600">Line chart</span>
                            </label>
                        </div>
                    </div>

                    {showMessage?.message?.length > 0 && (
                        <div className="py-2">
                            <Toaster data={showMessage} />
                        </div>
                    )}
                    <div className="flex flex-col gap-6 mt-4">
                        {/* BAR CHARTS */}
                        {chartType === 1 && chrtData?.length > 0 && (
                            <>
                                {/* Below 30 Bedded Bar Chart */}
                                <div className="w-full">
                                    {/* <h2 className="text-lg font-semibold text-gray-700 mb-2">Below 30 bedded</h2> */}
                                    <div className="h-[40vh]">
                                        <Bar
                                            data={data}
                                            options={{
                                                ...options,
                                                maintainAspectRatio: false,
                                                responsive: true
                                            }}
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>

                                {/* Above 30 Bedded Bar Chart */}
                                {/* <div className="w-full">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Above 30 bedded</h2>
                                    <div className="h-[40vh]">
                                        <Bar
                                            data={data}
                                            options={{
                                                ...options,
                                                maintainAspectRatio: false,
                                                responsive: true
                                            }}
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div> */}
                            </>
                        )}

                        {/* LINE CHARTS */}
                        {chartType === 2 && chrtData2?.length > 0 && (
                            <>
                                {/* Below 30 Bedded Line Chart */}
                                <div className="w-full">
                                    {/* <h2 className="text-lg font-semibold text-gray-700 mb-2">Below 30 bedded</h2> */}
                                    <div className="h-[40vh]">
                                        <Chart
                                            width="100%"
                                            height="100%"
                                            chartType="LineChart"
                                            loader={<div>Loading chart...</div>}
                                            data={chrtData2}
                                            options={{
                                                ...options2,
                                                chartArea: { width: '85%', height: '75%' }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Above 30 Bedded Line Chart */}
                                {/* <div className="w-full">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Above 30 bedded</h2>
                                    <div className="h-[40vh]">
                                        <Chart
                                            width="100%"
                                            height="100%"
                                            chartType="LineChart"
                                            loader={<div>Loading chart...</div>}
                                            data={chrtData2}
                                            options={{
                                                ...options2,
                                                chartArea: { width: '85%', height: '75%' }
                                            }}
                                        />
                                    </div>
                                </div> */}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </>

    );
}; export default React.memo(BagCntPrHr);
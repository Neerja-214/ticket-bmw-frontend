import React, { useReducer, useState, useEffect } from 'react'
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
import Chart from "react-google-charts";
import moment from "moment";
import { getLvl } from '../../utilities/cpcb'
import { getWho } from '../../utilities/cpcb'

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

const optionsb = {
    title: "Normalized Flag Ratios",
    is3D: true,
    sliceVisibilityThreshold: 0.000001,
    colors: ["#f1c40f", "#e74c3c", "#3498db", "#9b59b6", "#2ecc71"],
    pieSliceTextStyle: {
        color: 'black',
    },
    legend: {
        textStyle: {
            color: 'black',
        },
    },
};


const MisBagCntwthIncrt = () => {
    //#############Constants for the State and other functions
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] })
    const [isLoading, setIsLoading] = useState("");
    const [lvl, setLvl] = useState("");
    const [who, setWho] = useState("");
    const [value, setValue] = useState(0);
    const [chartData, setChartData] = useState<any[]>([]);
    const [showData, setShowData] = useState<any[]>([]);
     const [apiCount, setapiCount] = useState<boolean>(false);
    const reqFlds = [{}];
    const coldef = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'cbwtfnm', hide: false, width: 250, headerName: 'Name of CBWTF' },
        { field: 'incorrect_blnbigbag', hide: false, width: 160, headerName: 'Overweight bags' },
        { field: 'correct_blnbigbag', hide: true, width: 180, headerName: 'Underweight bags' },
        { field: 'incorrect_blustrflag', hide: false, width: 160, headerName: 'Invalid bluetooth' },
        { field: 'correct_blustrflag', hide: true, width: 160, headerName: 'Valid bluetooth' },
        { field: 'incorrect_geoflag', hide: false, width: 175, headerName: 'Invalid geolocation' },
        { field: 'correct_geoflag', hide: true, width: 180, headerName: 'Valid geolocation' },
        { field: 'incorrect_lblflag', hide: false, width: 185, headerName: 'Invalid label number' },
        { field: 'correct_lblflag', hide: true, width: 180, headerName: 'Valid label number' },
        { field: 'incorrect_scndflag', hide: false, width: 200, headerName: 'Duplicate serial number' },
        { field: 'correct_scndflag', hide: true, width: 180, headerName: 'Valid serial number' },
        { field: 'incorrect_srnoflag', hide: false, width: 160, headerName: 'No serial number' },
        { field: 'correct_srnoflag', hide: true, width: 180, headerName: 'Has serial number' },
        { field: 'normalizedFlagRatio', hide: false, width: 250, headerName: 'Normalized incorrect bags data' },
        { field: 'scby', hide: false, width: 110,  headerName: 'Scan by' },
    ];

    const colDefPdf = [
        { field: 'cbwtfnm', hide: false, width: 180, headerName: 'Name of CBWTF'},
        { field: 'incorrect_blnbigbag', hide: false, width: 210, headerName: 'Overweight bags' },
        { field: 'correct_blnbigbag', hide: false, width: 210, headerName: 'Underweight bags' },
        { field: 'incorrect_blustrflag', hide: false, width: 210, headerName: 'Invalid bluetooth'},
        { field: 'correct_blustrflag', hide: false, width: 210, headerName: 'Valid bluetooth' },
        { field: 'incorrect_geoflag', hide: false, width: 210, headerName: 'Invalid geolocation'},
        { field: 'correct_geoflag', hide: false, width: 210, headerName: 'Valid geolocation' },
        { field: 'incorrect_lblflag', hide: false, width: 210, headerName: 'Invalid label number' },
        { field: 'correct_lblflag', hide: false, width: 210, headerName: 'Valid label number'},
        { field: 'incorrect_scndflag', hide: false, width: 210, headerName: 'Duplicate serial number' },
        { field: 'correct_scndflag', hide: false, width: 210, headerName: 'Valid serial number' },
        { field: 'incorrect_srnoflag', hide: false, width: 210, headerName: 'No serial number' },
        { field: 'incorrect_srnoflag', hide: false, width: 210, headerName: 'Has serial number' },
        { field: 'normalizedFlagRatio', hide: false, width: 210, headerName: 'Normalized incorrect bag data' },
        { field: 'scby', hide: false, width: 150,  headerName: 'Scan by' },
    ]

    const pdfColWidth = ['6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%', '6%','6%', '6%', '6%', '6%', '6%', '6%']
    const printExcelHeader = ["Name Of CBWTF", "Overweight Bags","Underweight bags", "Invalid bluetooth","Valid Bluetooth", "Invalid Geo Location","Valid Geo Location", "InValid Label Number","Valid Label Number" ,"Duplicate Serial Number","Valid Serial Number", "No Serial Number","Has Serial Number", "Normalized Incorrect Bag Data", "Scan By"]
    const KeyOrder: string[] = ['cbwtfnm', 'incorrect_blnbigbag', 'correct_blnbigbag','incorrect_blustrflag', 'correct_blustrflag','incorrect_geoflag','correct_geoflag', 'incorrect_lblflag','correct_lblflag', 'incorrect_scndflag','correct_scndflag', 'incorrect_srnoflag','correct_srnoflag', 'normalizedFlagRatio', 'scby']
    const excelColWidth = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]

    const cellClassRulesValues = [
        {
            cellName: 'clr',
            color: 'red-row',
            value: 'Red',
            colorEntireRow: true
        },
        {
            cellName: 'clr',
            color: 'yellow-row',
            value: 'Yellow',
            colorEntireRow: true
        },
        {
            cellName: 'clr',
            color: 'white-row',
            value: 'White',
            colorEntireRow: true
        },
        {
            cellName: 'clr',
            color: 'blue-row',
            value: 'Blue',
            colorEntireRow: true
        },
        {
            cellName: 'clr',
            color: 'cyt-row',
            value: 'Cytotoxic',
            colorEntireRow: true
        },
    ]


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
        // let gid: any = utilities(3, "", "")
        // let gd: string = gid
        let select_cbwtf = "1"
        if (who === "Select a CBWTF to get data") {
            select_cbwtf = "0"

        }
        const payload: any = postLinux(lvl + '=' + who + '=' + dtTo + '=' + dtFrm + '=' + dtwise + "=" + select_cbwtf, 'wastebagcrtincrt');
        return nrjAxiosRequestBio("show_incorrect_wstbg_report", payload);

    }

    const colorFullName: any = {
        red: "Red",
        ylw: "Yellow",
        cyt: "Cytotoxic",
        blu: "Blue",
        wht: "White"
    }
    const ShowData = (dataSvd: any) => {
        setapiCount(true)
        setIsLoading("")
        let dt: any = GetResponseLnx(dataSvd);
        if (Array.isArray(dt) && dt.length && dt.length > 0 ) {
            const flatData = dt.flat();
            // List of flag types for calculation
            const flagTypes = [
                { correct: "correct_lblflag", incorrect: "incorrect_lblflag" },
                { correct: "correct_geoflag", incorrect: "incorrect_geoflag" },
                { correct: "correct_srnoflag", incorrect: "incorrect_srnoflag" },
                { correct: "correct_blustrflag", incorrect: "incorrect_blustrflag" },
                { correct: "correct_blnbigbag", incorrect: "incorrect_blnbigbag" },
                { correct: "correct_scndflag", incorrect: "incorrect_scndflag" }
            ];

            flatData.forEach((item: any) => {
                let itemRatioSum = 0;
                let incorrectFlagCount = 0;
                let totalRatioSum = 0;
                let incorrectItemCount = 0;
                // Calculate the ratio for each flag type
                flagTypes.forEach(({ correct, incorrect }) => {
                    const flagSum = item[correct] + item[incorrect];
                    let flagRatio = 0;
                    let count = 0

                    // If item[incorrect] is greater than 0, calculate the ratio
                    if (item[incorrect] > 0) {
                        flagRatio = flagSum > 0 ? (item[incorrect] / flagSum) * 100 : 0;
                        // Increment the count of incorrect flags
                    }
                    if (item.hasOwnProperty(incorrect)) {
                        count++;
                    }
                    item[`${incorrect}_Percntg`] = parseFloat(flagRatio.toFixed(2));

                    itemRatioSum += flagRatio;
                    incorrectFlagCount += count;
                });

                totalRatioSum += itemRatioSum;
                incorrectItemCount += incorrectFlagCount

                let normalizedItemRatio = 0;
                if (incorrectItemCount > 0) {
                    normalizedItemRatio = totalRatioSum / incorrectItemCount;
                }

                if (item.scby == 'cbwtf') {
                    item.scby = 'Operator'
                }
                else if (item.scby == "hcf") {
                    item.scby = 'HCF';
                }
                else {
                    item.scby = 'CBWTF'
                }
                // item.totalFlagRatio = parseFloat(totalRatio.toFixed(2));
                // item.incorrectFlagCount = incorrectFlagCount;
                item.normalizedFlagRatio = parseFloat(normalizedItemRatio.toFixed(2));
            });



            let sortData = flatData.sort((a: any, b: any) => b.normalizedFlagRatio - a.normalizedFlagRatio);
            sortData=trimField(sortData,"cbwtfnm")
            sortData = [...sortData].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
            setShowData(sortData)

            setTimeout(function () {
                dispatch({ type: ACTIONS.NEWROWDATA, payload: sortData });

            }, 800);
        }
        else {
            setShowData([])
            setIsLoading("")
            // setShowMessage({

            //     message: ["No data found"],
            //     type: "error",
            // });
            showToaster(["No data received"],"error", );
        }
    };


    const prepareChartData = () => {

        const preparedData = [
            ["Name", "incorrect Label Flag", "incorrect Geo Flag", "incorrect SRNO Flag", "incorrect Blustr Flag", "incorrect Blnbig Bag", "incorrect Scnd Flag"], // Header row
            ...showData.map(item => [
                item.cbwtfnm, // Name
                item.incorrect_lblflag_Percntg || 0, // Correct Label Flag Ratio
                item.incorrect_geoflag_Percntg || 0, // Correct Geo Flag Ratio
                item.incorrect_srnoflag_Percntg || 0, // Correct SRNO Flag Ratio
                item.incorrect_blustrflag_Percntg || 0, // Correct Blustr Flag Ratio
                item.incorrect_blnbigbag_Percntg || 0, // Correct Blnbig Bag Ratio
                item.incorrect_scndflag_Percntg || 0 // Correct Scnd Flag Ratio
            ])
        ];
        setChartData(preparedData);
    };

    useEffect(() => {
        if (showData.length > 0) {
            prepareChartData();
        }

    }, [showData]);

    const { data: dataSvd1, refetch: refetch } = useQuery({
        queryKey: ["svOldForm1", lvl, who],
        queryFn: GetList,
        enabled: false,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: (fetchedData) => {
            ShowData(fetchedData); // Use the fetched data passed to onSuccess
        },
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
        // if (totalPages - prevTotalPages > 0 && totalPages - currentPage <= 1) {
        //     setPrevTotalPages(data.api.paginationProxy.totalPages);
        //     console.log('data changed');

        //     if (!prev && data.api.paginationProxy.totalPages - prev > 0) {
        //         refetch();
        //     }
        //     prev = totalPages;
        //     //refetch();
        // }

        const shouldRefetch =
            totalPages - prevTotalPages > 0 &&
            totalPages - currentPage <= 1 &&
            (!prev || totalPages - prev > 0);

        if (shouldRefetch && !apiCount) {
            setPrevTotalPages(totalPages);
            console.log('data changed');
            refetch();
            prev = totalPages;
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
                        value: 'Waste collection In-correct Data',
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
                    pageTitle={"Waste collection In-correct Data "}
                    sortBy={'clr'}
                    printExcelHeader={printExcelHeader}
                    exceColWidth={excelColWidth}
                    pdfColWidth={pdfColWidth}
                    colDefPdf={colDefPdf}
                ></NrjAgGrid>
            </div>
            {/* <div className="flex justify-center mt-12">
                <div className="chart-container">
                    {chartData && chartData.length > 1 ? (
                        <Chart
                            chartType="PieChart"
                            width={"100%"}
                            height={"250px"}
                            data={chartData}
                            options={optionsb}
                        />
                    ) : (
                        <p>No data available for Chart</p>
                    )}
                </div>
            </div> */}
        </div>
    );
}; export default React.memo(MisBagCntwthIncrt);
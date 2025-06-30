import React, { useReducer, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, getApplicationVersion, getStateAbbreviation, getStateFullFormWho, postLinux, showPrint, svLnxSrvr, trimField } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";
import { validForm } from "../../Hooks/validForm";

import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { useNavigate } from "react-router-dom";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import HdrDrp from "../HdrDrp";
import { Toaster } from '../../components/reusable/Toaster';
import LevelSelector from './LevelSelector';
import { AcUnit } from '@mui/icons-material';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { useToaster } from '../../components/reusable/ToasterContext';
import moment from "moment";
import { format } from 'date-fns'


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


const BagCnthrGrid = (props: any) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState("")
    const [state, dispatch] = useReducer(reducer, initialState);
    const [lvl, setLvl] = useState("");
    const [who, setWho] = useState("");
    const [total, setTotal] = useState(0)
    const reqFlds = [{ fld: 'dt_rptfrm', msg: 'Select the From date', chck: 'length' }];
    const [coldef, setColdef] = useState([
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'hr', hide: false, width: 200, headerName: 'Hours' },
        {
            field: "dt_rpt",
            hide: false,
            width: 150,
            headerName: "Date",
            filter: "agTextColumnFilter",
            valueFormatter: (params: any) => {
                let dateSegments: any[] = [];
                dateSegments = params.value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g);
                let formattedDate = '';

                if (dateSegments) {
                    for (let i = 0; i < dateSegments.length; i++) {
                        const date = new Date(dateSegments[i]);
                        if (!isNaN(date.getTime())) {
                            formattedDate = format(date, 'dd-MMM-yyyy');
                            break; // Stop processing after the first valid date is found
                        }
                    }
                }

                // Return the formatted date
                return formattedDate;

            },
        },
        { field: 'bagcnthcf', hide: false, width: 200, headerName: 'Bag count by HCF' },
        { field: 'bagcntcbwtf', hide: false, width: 250, headerName: 'Bag count by Operator' },
        { field: 'bagcntfct', hide: false, width: 250, headerName: 'Bag count at CBWTF ' },
        { field: 'totalBagCount', hide: false, width: 200, headerName: 'Total bag count' }, // New column

    ]);

    const colDefPdf = [{ field: 'hr', hide: false, headerName: 'Hours' },
    { field: 'bagcnthcf', hide: false, width: 250, headerName: 'Bag count by HCF' },
    { field: 'bagcntcbwtf', hide: false, width: 250, headerName: 'Bag count by Operator' },
    { field: 'bagcntfct', hide: false, width: 250, headerName: 'Bag count at CBWTF ' },
    { field: 'totalBagCount', hide: false, width: 200, headerName: 'Total bag count' },
    ]
    const pdfColWidth = ['20%', '20%', '20%', '20%', '*']
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
                        value: 'Bag count per hour',
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


    const [showMessage, setShowMessage] = useState<any>({ message: [] });

    const rowData: any[] = []
    const onRowSelected = (data: string) => { }
    const GridLoaded = () => { }
    const onButtonClicked = (action: string, rw: any) => { }

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    };
    const { showToaster, hideToaster } = useToaster();
    const svClick = () => {
        setTotal(0)
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
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        getList().then((res: any) => {
            ShowData(res);
        })
    };
    // const [currentLevel, setCurrentLevel] = useState('');
    // const [drilllvlState, setDrillLvlState] = useState('');

    const getList = () => {
        setIsLoading("Loading data...");
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
        let gid: any = utilities(3, "", "")
        let gd: string = gid
        dispatch({ type: ACTIONS.SETGID, payload: gd })
        // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a183", lvl + "=" + who + "=" + dt_rpt + "=" + gd);
        // return nrjAxios({ apiCall: api })
        // const payload: any = postLinux(lvl + '=' + who + '=' + dt_rpt + '=' + gd, 'bagcntprhr');  
        const payload: any = postLinux(lvl + '=' + who + '=' + "" + '=' + dtFrm + '=' + dtTo + '=' + dtwise + '=' + gd, 'bagcntprhr');
        return nrjAxiosRequestBio("show_BgPerHr", payload);
    }

    const ShowData = (dataSvd: any) => {
        setIsLoading("")
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        let dt: any = GetResponseLnx(dataSvd);
        let ary: any[] = []

        if (dt && Array.isArray(dt) && dt.length) {
            ary = dt
            let total = 0
            ary.forEach((ech: any) => {
                total += Number(ech.bagcnthcf) + Number(ech.bagcntcbwtf) + Number(ech.bagcntfct)
            })
            setTotal(total)
        }
        ary = ary.map((row: any) => {
            return {
                ...row,
                hr: convertIntoHour(row.hr),
                totalBagCount: Number(row.bagcnthcf || 0) + Number(row.bagcntfct || 0) + Number(row.bagcntcbwtf || 0),
            };
        });
        if (dt == "" || dataSvd.data[0].Status == 'Failed') {
            showToaster([dt], 'error');
        }
        ary = trimField(ary, "hr")
        ary = [...ary].sort((a, b) => a.hr.localeCompare(b.hr))
        dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    };

    function convertIntoHour(dt: any) {
        let str: string = String(dt);
        if (str.length == 1) {
            str = '0' + str
        }
        str += ":00"
        return str;
    }


    const PrntRep = () => {
        let gid: string = state.gid
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
        let dt: string = GetResponseWnds(dataC)
        if (dt && dt.indexOf(".pdf") > -1) {
            window.open(dt, "_blank")
        } else {
            setShowMessage({
                message: ["Please try again after refreshing the page!"],
                type: "error",
            });
        }
        // showPrint(dataC)
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



    const setLvlWhoData = (data: any) => {
        setTotal(0)
        setLvl(data.lvl);
        setWho(data.who);

        onChangeDts(data.dateFrom);
        onChangeDts(data.dateTo);
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    }
    const applicationVerion: string = getApplicationVersion();

    const excelColWidth = [{ wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]

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
    }, [])


    return (
        <>

            <div className="">
                {applicationVerion == '1' && <> <div>
                    <HdrDrp hideHeader={false} formName=""></HdrDrp>
                </div>
                    <span className="text-left text-bold mt-3 text-blue-600/75">
                        <h5>Bag Count per Hour</h5>
                    </span></>}
                <LevelSelector
                    showCbwtf={false}
                    levelSelectorData={setLvlWhoData}
                    // dateField={true}
                    dateFieldFrom={true}
                    dateFieldTo={true}
                    getListButton={true}
                    getListOnclick={svClick}
                    printButton={false}
                    printButtonClick={printClick}
                ></LevelSelector>
                <div className="flex justify-start bg-gray-100">
                    {total ? (
                        <div className="border rounded-lg">
                            <div className="p-3 font-semibold text-left">
                                Total waste: {total}
                            </div>
                        </div>
                    ) : null}

                    <div className=" font-semibold text-lg text-center ">{isLoading}</div>

                    {showMessage && showMessage.message.length !== 0 && (
                        <div className="py-2">
                            <Toaster data={showMessage} className={""} />
                        </div>
                    )}
                </div>

                <div className="flex justify-center bg-gray-100">
                    <NrjAgGrid
                        onButtonClicked={onButtonClicked}
                        onGridLoaded={GridLoaded}
                        onRowSelected={onRowSelected}
                        colDef={coldef}
                        apiCall={""}
                        rowData={rowData}
                        deleteButton={""}
                        deleteFldNm={""}
                        newRowData={state.nwRow}
                        trigger={state.triggerG}
                        className="ag-theme-alpine-blue ag-theme-alpine"
                        showExport={true}
                        pageTitle={"Analyzing Waste Bag Scanning: Geolocation Accuracy Summary: "}
                        printExcelHeader={printExcelHeader}
                        exceColWidth={excelColWidth}
                        KeyOrder={keyOrder}
                        lvl={lvl}
                        who={who}
                        colDefPdf={colDefPdf}
                        pdfColWidth={pdfColWidth}
                    ></NrjAgGrid>
                </div>
            </div>
        </>

    );
}; export default React.memo(BagCnthrGrid);
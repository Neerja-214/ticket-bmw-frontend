import React, { useEffect, useReducer, useMemo, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import utilities, {
    GetResponseLnx,
    GetResponseWnds,
    createGetApi,
    getApplicationVersion,
    getStateFullFormWho,
    postLinux,
} from "../../utilities/utilities";
import { validForm } from "../../Hooks/validForm";

import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import HdrDrp from "../HdrDrp";
import { getFldValue } from "../../Hooks/useGetFldValue";
import {
    nrjAxios, nrjAxiosRequestBio
} from "../../Hooks/useNrjAxios";
import { Toaster } from "../../components/reusable/Toaster";
import LevelSelector from "../dshbrd/LevelSelector";
import { useNavigate } from "react-router";
import { UseMomentDateNmb } from "../../Hooks/useMomentDtArry";
import { useToaster } from "../../components/reusable/ToasterContext";
import moment from "moment";
import { getLvl, getWho } from "../../utilities/cpcb";
import {format} from 'date-fns'

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


const BagCountLbl = (props: any) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState("")
    const [state, dispatch] = useReducer(reducer, initialState);
    const [lvl, setLvl] = useState("");
    const [who, setWho] = useState("");
    const [total, setTotal] = useState(0)
    const reqFlds = [{ fld: 'dt_rptfrm', msg: 'Select the From date', chck: 'length' }];
    const [coldef, setColdef] = useState([
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'hr', hide: false, width: 250, headerName: 'Hours' },
        {
            field: "dt_rpt",
            hide: false,
            width: 150,
            headerName: "Date",
            filter: "agTextColumnFilter",
            valueFormatter: (params:any) => {
              let  dateSegments:any[]=[];
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
        { field: 'bagcnthcf', hide: false, width: 250, headerName: 'Bag count by HCF' },
        { field: 'bagcntcbwtf', hide: false, width: 250, headerName: 'Bag count by Operator' },
        { field: 'bagcntfct', hide: false, width: 250, headerName: 'Bag count at plant ' },
        { field: 'totalBagCount', hide: false, width: 200, headerName: 'Total bag count' }, // New column

    ]);

    const colDefPdf =[
        { field: 'hr', hide: false, width: 250, headerName: 'Hours' },
        { field: 'bagcnthcf', hide: false, width: 250, headerName: 'Bag count by HCF' },
        { field: 'bagcntcbwtf', hide: false, width: 250, headerName: 'Bag count by Operator' },
        { field: 'bagcntfct', hide: false, width: 250, headerName: 'Bag count at plant ' },
        { field: 'totalBagCount', hide: false, width: 200, headerName: 'Total bag count' },
    ]
const pdfColWidth =['15%','20%','20%','20%','15%']

    const [prependContent, setPrependContent] = useState<any[]>([])


    const getPrependContentValue = (levelValue: string) => {
        return [
            [

                {
                    data: {
                        value: 'Waste bag received at odd time i.e. from midnight to 8 AM and after 8 PM',
                        type: "String",
                    },
                    mergeAcross: 3
                },
            ],
            [

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
                        value: 'Date: ' + moment(Date.now()).format("DD-MMM-yyyy"),
                        type: "String",
                    },
                    mergeAcross: 5
                },
            ],
            [],
        ]
    };


    const printExcelHeader = ["Hours", "Bag count by HCF", "Bag count by Operator", "Bag count at plant", "Total bag count"]
    const KeyOrder: string[] = ['hr', 'bagcnthcf', 'bagcntcbwtf', 'bagcntfct', 'totalBagCount']
    const excelColWidth = [{ wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }]

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
    function convertIntoHour(dt:any){
        let str :string = String(dt);
        if(str.length == 1){
            str = '0' + str
        }
        str += ":00"
        return str;
    }

    const svClick = () => {
        setTotal(0)
        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
        showToaster(msg, 'error');
        if (msg && msg[0]) {
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
        const payload: any = postLinux(lvl + '=' + who + '=' + "" +'=' + dtFrm +'='+ dtTo + '='+ dtwise + '=' + gd, 'bagcntprhr');
        
        return nrjAxiosRequestBio("show_BgPerHr", payload);
    }

    const ShowData = (dataSvd: any) => {
        setIsLoading("")
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        let dt: any = GetResponseLnx(dataSvd);
        let ary: any[] = []
        if (dt && Array.isArray(dt) && dt.length) {
            ary = dt
            ary = ary.filter((row: any) => (Number(row.hr) >= 20 || Number(row.hr < 8)));
            let total = 0
            ary = ary.map((row: any) => {
                total += Number(row.bagcnthcf || 0) + Number(row.bagcntfct || 0) + Number(row.bagcntcbwtf || 0);
                return {
                    ...row,
                    hr: convertIntoHour(row.hr),
                    totalBagCount: Number(row.bagcnthcf || 0) + Number(row.bagcntfct || 0) + Number(row.bagcntcbwtf || 0),
                };
            });
            setTotal(total)
        } else {
            showToaster([dt], 'error');
        }
        
        dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    };






    const setLvlWhoData = (data: any) => {
        setTotal(0)
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
        onChangeDts(data.dateFrom);
        onChangeDts(data.dateTo);
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    }
    const applicationVerion: string = getApplicationVersion();


    return (
        <>

            <div className="">
                {applicationVerion == '1' && <> <div>
                    <HdrDrp hideHeader={false} formName=""></HdrDrp>
                </div>
                    <span className="text-center text-bold mt-3 text-blue-600/75">
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
                ></LevelSelector>
                <div className="shadow rounded-lg bg-white p-3">
                    {total ? <div className="border rounded-lg">
                        <div className="p-3">
                            <div className="flex font-semibold">
                                Total waste bags : {total}
                            </div>
                        </div>
                    </div> : <></>}
                    <div className=" font-semibold text-lg text-center ">{isLoading}</div>
                    {showMessage && showMessage.message.length != 0 ? (
                        <div className="py-2">
                            <Toaster data={showMessage} className={""}></Toaster>
                        </div>) : (<></>)}
                    <div>
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
                            prependContent={prependContent}
                            colDefPrint={coldef}
                            pageTitle={"Summarized Waste Bags Data : "}
                            printExcelHeader={printExcelHeader}
                            exceColWidth={excelColWidth}
                            KeyOrder={KeyOrder}
                            lvl={lvl}
                            who={who}
                            showExport={true}
                            pdfColWidth={pdfColWidth}
                            colDefPdf={colDefPdf}
                        ></NrjAgGrid>
                    </div>
                </div>
            </div>
        </>

    );
};
export default React.memo(BagCountLbl);

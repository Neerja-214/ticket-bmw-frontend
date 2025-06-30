import React, { useReducer, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, capitalize, createGetApi, dataStr_ToArray, dateCheck30Days, getApplicationVersion, getCntWtInNumbers, getStateAbbreviation, postLinux, showPrint, svLnxSrvr, trimField } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";
import { validForm } from "../../Hooks/validForm";

import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { useNavigate } from "react-router-dom";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios, nrjAxiosRequestBio, } from "../../Hooks/useNrjAxios";
import HdrDrp from "../HdrDrp";
import { Toaster } from '../../components/reusable/Toaster';
import LevelSelector from './LevelSelector';
import { AcUnit } from '@mui/icons-material';
import LevelSelectorOne from './LevelSelectorOne';
import { getLvl, getWho } from '../../utilities/cpcb';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { useToaster } from '../../components/reusable/ToasterContext';
import moment from "moment";
import { Console } from 'console';


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


const BagCbwtfScnBy = (props: any) => {
    //const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState("")
    const [state, setState] = useState({textDts: ""});
    const lvl : string = getLvl();
    const who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
   // const [total, setTotal] = useState(0)
    const coldef = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        
        // { field: 'frmdt', hide: false, width: 250, headerName: 'Form Date' },
        // { field: 'todt', hide: false, width: 250, headerName: 'To date' },
        { field: 'cbwtfnm', hide: false, width: 430, headerName: 'Name of CBWTF', tooltipField: 'smry', },
        { field: 'state', hide: false, width: 150, headerName: 'State/UT', tooltipField: 'smry', },
        {
            headerName: 'Scanned at (HCF)',
            children: [
                { field: 'ttlwthcf', hide: false, width: 140, headerName: 'Weight (in kg)' },
                { field: 'ttlcnthcf', hide: false, width: 120, headerName: 'Bags' },
            ],
        },
        {
            headerName: 'Scanned at (operator) ',
            children: [
                { field: 'ttlwtcbwtf', hide: false, width: 140, headerName: 'Weight (in kg)', },
                { field: 'ttlcntcbwtf', hide: false, width: 120, headerName: 'Bags' },
            ],
        },
        {
            headerName: 'Scanned at (plant)',
            children: [
                { field: 'ttlwtfct', hide: false, width: 140, headerName: 'Weight (in kg)' },
                { field: 'ttlcntfct', hide: false, width: 120, headerName: 'Bags' },
            ],
        },
        {
            headerName: 'Total',
            children: [
                { field: 'ttlwt', hide: false, width: 140, headerName: 'Weight (in kg)' },
                { field: 'ttlcnt', hide: false, width: 120, headerName: 'Bags' },
            ],
        },
        { field: 'smry', hide: true, width: 0, headerName: '' },
    ];

    const colDefPdf=[
        { field: 'cbwtfnm', hide: false, width: 500, headerName: 'Name of CBWTF', tooltipField: 'cbwtfnm', },
        { field: 'state', hide: false, width: 500, headerName: 'State', tooltipField: 'cbwtfnm', },
        {
            headerName: 'Generated (by 30 above HCF)',
            children: [
                { field: 'ttlwthcf', hide: false, width: 140, headerName: 'Weight (in kg)' },
                { field: 'ttlcnthcf', hide: false, width: 120, headerName: 'Bags' },
            ],
        },
        {
            headerName: 'Collected (By operator)',
            children: [
                { field: 'ttlwtcbwtf', hide: false, width: 140, headerName: 'Weight (in kg)', },
                { field: 'ttlcntcbwtf', hide: false, width: 120, headerName: 'Bags' },
            ],
        },
        {
            headerName: 'Proccessed (at plant)',
            children: [
                { field: 'ttlwtfct', hide: false, width: 140, headerName: 'Weight (in kg)' },
                { field: 'ttlcntfct', hide: false, width: 120, headerName: 'Bags' },
            ],
        },
        // {
        //     headerName: 'Total',
        //     children: [
        //         { field: 'ttlwt', hide: false, width: 140, headerName: 'Weight (in kg)' },
        //         { field: 'ttlcnt', hide: false, width: 120, headerName: 'Bags' },
        //     ],
        // },
    ]

    const pdfColWidth=['25%','15%','15%','15%','15%','15%']

    const printExcelHeader = ["Cbwtf ", "State", "Generated (By 30 above HCF) Kg/gms ", "Generated (By 30 above HCF) Bags", "Collected (By Operator) Kg/gms", "Collected (By Operator)Bags", "Proccessed (At plant)Kg/gms", 'Proccessed (At plant) Bags', 'Total Weight', 'Total Bags']
    const keyOrder: string[] = ['cbwtfnm', 'state', 'ttlwthcf', 'ttlcnthcf', 'ttlwtcbwtf', 'ttlcntcbwtf', 'ttlwtfct', 'ttlcntfct','ttlwt','ttlcnt']
    const excelColWidth = [{ wch: 50 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }]

   
    const [showMessage, setShowMessage] = useState<any>({ message: [] });

    const [rowData, setRowData] =  useState([])
    const onRowSelected = (data: string) => { }
    const GridLoaded = () => { }
    const onButtonClicked = (action: string, rw: any) => { }

    const onChangeDts = (data: string) => {
        let dta: string = "";
            let fldN: any = utilities(2, data, "");
            if (state.textDts) {
                dta = state.textDts + "=";
                let d: any = utilities(1, dta, fldN);
                if (d) {
                    dta = d;
                } else {
                    dta = "";
                }
            }
            dta += data;
            setState({...state, textDts: dta});
            //return newstate;
    };
    const { showToaster, hideToaster } = useToaster();
    const svClick = () => {
        //setTotal(0)
        let api: string = state.textDts;
        const dt_rpt = getFldValue(api, "dt_rpt");
        const dt_to = getFldValue(api, 'dt_to');
        let msg: any = dateCheck30Days(dt_rpt, dt_to)
       
        if (msg && msg[0]) {
            showToaster(msg, 'error');
            // dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            // setTimeout(function () {
            //     dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
            // }, 5000);
            // return;
        }
        // dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        // dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        // setTimeout(() => {
        //     dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        // })
        // dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        getList().then((res: any) => {
            ShowData(res);
        })
    };
    // const [currentLevel, setCurrentLevel] = useState('');
    // const [drilllvlState, setDrillLvlState] = useState('');

    const getList = () => {
        setIsLoading("Loading data...");
        let dt = state.textDts
        const frmdt = UseMomentDateNmb(getFldValue(dt, "dt_rpt"));
        const todt = UseMomentDateNmb(getFldValue(dt, 'dt_to'));
        let gid: any = utilities(3, "", "")
        let gd: string = gid
        const lvl: string = "ALLCBWTF"
        const lgntyp: string = getLvl();
        let payload: any = postLinux(lvl + '=' + lgntyp + '=' + who + '=' + frmdt + '=' + todt, 'dashboadCbwtf');

        return nrjAxiosRequestBio("dshbrd_total_period", payload);

    }

    const ShowData = (dataSvd: any) => {
        setIsLoading("")
        //dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        let dt: any = GetResponseLnx(dataSvd);
        let ary: any = dataSvd.data;
        if (Array.isArray(ary)) {
            let uniqueAry: any = {};
debugger
            ary.forEach((element: any) => {
                let data = getCntWtInNumbers(element)
                if (!uniqueAry[element.cbwtfnm]) {

                    uniqueAry[element.cbwtfnm] = [{ scnby: element.scnby,
                        state: element.state, ttlcnt: data.blucnt + data.cytcnt + data.redcnt + data.whtcnt + data.ylwcnt, ttlwt: data.bluwt + data.cytwt + data.redwt + data.whtwt + data.ylwwt }];
                }
                else {
                    let index = -1;
                    for (let i = 0; i < uniqueAry[element.cbwtfnm].length; i++) {
                        if (element.scnby == uniqueAry[element.cbwtfnm][i].scnby) {
                            index = i;
                            break;
                        }
                    }
                    if (index >= 0) {
                        uniqueAry[element.cbwtfnm][index] = {
                            ...uniqueAry[element.cbwtfnm][index],
                            ttlcnt: uniqueAry[element.cbwtfnm][index].ttlcnt + data.blucnt + data.cytcnt + data.redcnt + data.whtcnt + data.ylwcnt, ttlwt: uniqueAry[element.cbwtfnm][index].ttlwt + data.bluwt + data.cytwt + data.redwt + data.whtwt + data.ylwwt
                        }
                    }
                    else {
                        uniqueAry[element.cbwtfnm] = [...uniqueAry[element.cbwtfnm], { scnby: element.scnby,
                            state: element.state, ttlcnt: data.blucnt + data.cytcnt + data.redcnt + data.whtcnt + data.ylwcnt, ttlwt: data.bluwt + data.cytwt + data.redwt + data.whtwt + data.ylwwt }];
                    }
                }
            });

            let tempArray = Object.keys(uniqueAry).map((res:any)=>{
                let obj:any = {cbwtfnm: res}
                uniqueAry[res].forEach((e:any)=>{
                    obj['state'] = e.state
                    if(e.scnby == 'cbwtf'){
                        obj['ttlwtcbwtf'] = e.ttlwt;
                        obj['ttlcntcbwtf'] = e.ttlcnt;
                    }
                    else if(e.scnby == 'hcf'){
                        obj['ttlwthcf'] = e.ttlwt;
                        obj['ttlcnthcf'] = e.ttlcnt;
                    }
                    else if(e.scnby == 'fct'){
                        obj['ttlwtfct'] = e.ttlwt;
                        obj['ttlcntfct'] = e.ttlcnt;
                    }
                })
                return obj;
            })

            tempArray = tempArray.map((res: any) => {
                return {
                    ...res,  
                    ttlwthcf: (res.ttlwthcf && !isNaN(Number(res.ttlwthcf))) ? Number(res.ttlwthcf).toFixed(3) : '0.000',
                    ttlcnthcf: (res.ttlcnthcf && !isNaN(Number(res.ttlcnthcf))) ? Number(res.ttlcnthcf) : 0,
                    ttlwtcbwtf: (res.ttlwtcbwtf && !isNaN(Number(res.ttlwtcbwtf))) ? Number(res.ttlwtcbwtf).toFixed(3) : '0.000',
                    ttlcntcbwtf: (res.ttlcntcbwtf && !isNaN(Number(res.ttlcntcbwtf))) ? Number(res.ttlcntcbwtf): 0,
                    ttlwtfct: (res.ttlwtfct && !isNaN(Number(res.ttlwtfct))) ? Number(res.ttlwtfct).toFixed(3) : '0.000',
                    ttlcntfct: (res.ttlcntfct && !isNaN(Number(res.ttlcntfct))) ? Number(res.ttlcntfct) : 0
                }
            })
            ary = [...tempArray]
        }
        if (dt == "" || dataSvd.data[0].Status == 'Failed') {
           showToaster(["No data received"], "error");
        }

        ary = ary.map((res:any)=>{
            let smryhcf : any = (res.ttlcnthcf == 0) ? "No Bags Scanned by HCF" : "";
            let smrycbwtf : string = (res.ttlcntcbwtf == 0) ? "No Bags Scanned by Operator" : "";
            let smryfct : string = (res.ttlcntfct == 0) ? "No Bags Scanned at CBWTF" : "";
            let smry : string = [smryhcf, smrycbwtf, smryfct].filter(Boolean).join(", ");
            return {
                
                ...res,
                smry
                
            }
        })

        ary=trimField(ary,"cbwtfnm")
        ary = [...ary].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))


        const updatedArray = ary.map((item:any) => {
            const ttlwthcf = parseFloat(item.ttlwthcf) || 0;
            const ttlwtcbwtf = parseFloat(item.ttlwtcbwtf) || 0;
            const ttlwtfct = parseFloat(item.ttlwtfct) || 0;
          
            const ttlwt = Number(ttlwthcf + ttlwtcbwtf + ttlwtfct).toFixed(3);
          
            const ttlcnt = 
              (parseInt(item.ttlcnthcf) || 0) + 
              (parseInt(item.ttlcntcbwtf) || 0) + 
              (parseInt(item.ttlcntfct) || 0);
          
            return {
              ...item,
              ttlcnt,
              ttlwt
            };
          });
          
          

        setRowData(updatedArray)
        //dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    };



    return (
        <>

            <div className="">

                <div className="bg-white p-1 pr-2 my-3 pb-2 rounded-lg" style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12)' }}>
                    <div className="">

                        <div className="flex ">
                            <div className='mr-2 px-4'>
                                <NrjRsDt
                                    format="dd-MMM-yyyy"
                                    fldName="dt_rpt"
                                    displayFormat="1"
                                    idText="txtdt_rpt"
                                    size="lg"
                                    Label="From date"
                                    selectedValue={state.textDts}
                                    onChange={onChangeDts}
                                    speaker={"Select"}
                                ></NrjRsDt>
                            </div>

                            <div className='mr-2 px-4'>
                                <NrjRsDt
                                    format="dd-MMM-yyyy"
                                    fldName="dt_to"
                                    displayFormat="1"
                                    idText="txtdt_rpt"
                                    size="lg"
                                    Label="To date"
                                    selectedValue={state.textDts}
                                    onChange={onChangeDts}
                                    speaker={"Select"}
                                ></NrjRsDt>
                            </div>
                            <div className='flex mt-10'>
                                <div>
                                    <Button
                                        size="medium"
                                        style={{ backgroundColor: "#3490dc", color: '#fff',textTransform: "none" }}
                                        variant="contained"
                                        color="success"
                                        onClick={svClick}
                                        className="me-3"
                                    >
                                        Get list
                                    </Button>
                                </div>
                                <div className='mx-4'>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shadow rounded-lg bg-white p-3">
                    <div className=" font-semibold text-lg text-center ">{isLoading}</div>
                    {showMessage && showMessage.message.length != 0 ? (
                        <div className="py-2">
                            <Toaster data={showMessage} className={""}></Toaster>
                        </div>) : (<></>)}
                    <div>
                    <NrjAgGrid
                        onGridLoaded={GridLoaded}
                        onRowSelected={onRowSelected}
                        colDef={coldef}
                        apiCall={""}
                        rowData={rowData}
                        deleteButton={""}
                        deleteFldNm={""}
                        showPagination={true}
                        className="ag-theme-alpine-blue ag-theme-alpine"
                        // rowClassRulesValues={rowClassRulesValues}
                        // ratio={ratio}
                        //cellClassRulesValues={cellClassRulesValues}
                        showExport={true}
                        pageTitle={"Summary of waste bag with and without Label Count : "}
                        printExcelHeader={printExcelHeader}
                        exceColWidth={excelColWidth}
                        KeyOrder={keyOrder}
                        lvl={lvl}
                        who={who}
                        pdfColWidth={pdfColWidth}
                        colDefPdf={colDefPdf}
                ></NrjAgGrid>
                    </div>
                </div>
            </div>
        </>

    );
}; export default React.memo(BagCbwtfScnBy);
import React, { useReducer, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseWnds, capitalize, createGetApi, dataStr_ToArray, dateCheck30Days, getApplicationVersion, getStateAbbreviation, postLinux, showPrint, svLnxSrvr } from '../../utilities/utilities'
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
import LevelSelectorOne from './LevelSelectorOne';
import { getLvl, getWho } from '../../utilities/cpcb';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { useToaster } from '../../components/reusable/ToasterContext';


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


const BagCbwtf = (props: any) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState("")
    const [state, dispatch] = useReducer(reducer, initialState);
    let lvl: string = sessionStorage.getItem("lvl") || "CPCB";
    let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
    const [total, setTotal] = useState(0)
    const reqFlds = [{ fld: 'dt_rpt', msg: 'Select the Date', chck: 'length' }];
    const coldef = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        // { field: 'frmdt', hide: false, width: 250, headerName: 'Form Date' },
        // { field: 'todt', hide: false, width: 250, headerName: 'To date' },
        { field: 'cbwtfnm', hide: false, width: 500, headerName: 'Name of CBWTF' },
        { field: 'ttlwt', hide: false, width: 350, headerName: 'Total Bag Weight' },
        { field: 'ttlcnt', hide: false, width: 350, headerName: 'Total Bag Count' }, // New column
    ];

    const [showMessage, setShowMessage] = useState<any>({ message: [] });

    const rowData: any[] = []
    const onRowSelected = (data: string) => {
        if (data) {
            let ech: any = data.split("|")
            if (ech && ech.length > 2 && ech[0]) {
                sessionStorage.setItem("bagCbwtfid", ech[0])
                sessionStorage.setItem("bagCbwtfnm", ech[1])
                let dt = state.textDts
                const dt_rpt = getFldValue(dt, "dt_rpt");
                const dt_to = getFldValue(dt, 'dt_to');
                sessionStorage.setItem("bagCbwtfFrm", dt_rpt);
                sessionStorage.setItem("bagCbwtfTo", dt_to);
            }
            navigate("/bagCbwtfHcf");
        }
    };

    const GridLoaded = () => { }
    const onButtonClicked = (action: string, rw: any) => { }

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        })
    };
    const { showToaster, hideToaster } = useToaster();
    const svClick = () => {
        setTotal(0)
        let api: string = state.textDts;
        const dt_rpt = getFldValue(api, "dt_rpt");
        const dt_to = getFldValue(api, 'dt_to');
        let msg: any = dateCheck30Days(dt_rpt, dt_to)  
        showToaster( msg, 'error');
        if (msg && msg[0]) {
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
            }, 5000);
            return;
        }
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        })
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        getList().then((res: any) => {
            ShowData(res);
        })
    };
    // const [currentLevel, setCurrentLevel] = useState('');
    // const [drilllvlState, setDrillLvlState] = useState('');

    const getList = () => {
        // dll x a257, cbwtf, who, frmdt, todt, val=0, gid,
        setIsLoading("Loading data...");
        let dt = state.textDts
        const frmdt = UseMomentDateNmb(getFldValue(dt, "dt_rpt"));
        const todt =UseMomentDateNmb(getFldValue(dt, 'dt_to'));
        const lvl : string = "ALLCBWTF"
        const lgntyp: string = getLvl();
        const who: string = getWho();
        let gid: any = utilities(3, "", "")
        let gd: string = gid
        dispatch({ type: ACTIONS.SETGID, payload: gd })
        // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a251", dt_rpt + '=' + dt_to + '=' + lvl + '=' + who + '=0=' + gd);
        // return nrjAxios({ apiCall: api })

        let payload: any = postLinux(lvl + '=' + lgntyp + '=' + who + '=' +  frmdt + '=' + todt , 'dashboadCbwtf');

        return nrjAxiosRequestBio("dshbrd_total_period", payload);
    }

    

    const ShowData = (dataSvd: any) => {
        setIsLoading("")
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        let dt: string = GetResponseWnds(dataSvd);
        let ary: any = [];
        if (dt) {
            ary = dataStr_ToArray(dt);
            ary = ary.map((res: any) => {
                return { ...res, 
                    ttlwt: (res.ttlwt && !isNaN(Number(res.ttlwt))) ? Number(Number(res.ttlwt).toFixed(3)) : 0.000,
                    ttlcnt: (res.ttlcnt && !isNaN(Number(res.ttlcnt))) ? Number(Number(res.ttlcnt).toFixed(3)) : 0
                }
            })
        }
        if (dt == "" || dataSvd.data[0].Status == 'Failed') {
        showToaster(["No data received"], "error");
        }
        dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
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
                                    selectedValue={state.frmData}
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
                                    selectedValue={state.frmData}
                                    onChange={onChangeDts}
                                    speaker={"Select"}
                                ></NrjRsDt>
                            </div>
                            <div className='flex mt-10'>
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
                        ></NrjAgGrid>
                    </div>
                </div>
            </div>
        </>

    );
}; export default React.memo(BagCbwtf);
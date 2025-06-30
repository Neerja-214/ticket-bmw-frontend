import React, { useEffect, useReducer, useState } from 'react'
import { validForm } from '../../../Hooks/validForm';
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseWnds, createGetApi, getApplicationVersion, dataStr_ToArray, svLnxSrvr } from '../../../utilities/utilities';
import { Button } from "@mui/material";
import { nrjAxios } from '../../../Hooks/useNrjAxios';
import NrjRsDt from '../../../components/reusable/NrjRsDt';
import NrjAgGrid from '../../../components/reusable/NrjAgGrid';
import { getFldValue } from '../../../Hooks/useGetFldValue';
import { Toaster } from '../../../components/reusable/Toaster';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import GetAppIcon from '@mui/icons-material/GetApp';
import HdrDrp from '../../HdrDrp';
import LevelSelector from '../../dshbrd/LevelSelector';
import { useToaster } from '../../../components/reusable/ToasterContext';

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
    DISABLE: "disable"
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
        case ACTIONS.MAINID:
            newstate.mainId = action.payload;
            newstate.gid = ""
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
            newstate.triggerG += 10;
            return newstate;
        case ACTIONS.RANDOM:
            newstate.rndm += 1;
            return newstate;
        case ACTIONS.FORM_DATA:
            let dtaF: string = "";
            let fldNF: any = utilities(2, action.payload, "");
            if (newstate.textDts) {
                dtaF = newstate.textDts + "=";
                let d: any = utilities(1, dtaF, fldNF);
                if (d) {
                    dtaF = d;
                } else {
                    dtaF = "";
                }
            }
            dtaF += action.payload;
            newstate.textDts = dtaF;
            return newstate;
        case ACTIONS.SETFORM_DATA:
            newstate.frmData = action.payload;
            return newstate;
        case ACTIONS.CHECK_REQ:
            newstate.errMsg = action.payload;
            newstate.openDrwr = true;
            return newstate;
        case ACTIONS.CHECK_REQDONE:
            newstate.errMsg = "";
            newstate.openDrwr = false;
            return newstate;
        case ACTIONS.SETGID:
            newstate.gid = action.payload;
            return newstate;
        case ACTIONS.DISABLE:
            if (newstate.disableA == 1) {
                newstate.disableA = 0
            } else {
                newstate.disableA = 1
            }
            return newstate;
    }
};



const DailySummaryFactoryNotScn = () => {

    const [state, dispatch] = useReducer(reducer, initialState);
    const reqFlds = [{ fld: 'dt_rpt', msg: 'Enter Date', chck: '' }];
    const [showMessage, setShowMessage] = useState<any>({ message: [] })
    const [isLoading, setIsLoading] = useState("");
    const [lvl, setLvl] = useState("")
    const [who, setWho] = useState("")
    const [valueType, setValueType] = useState(0);
    const applicationVerion: string = getApplicationVersion();

    const [coldef, setColdef] = useState<any[]>([
        { field: "id", hide: true, width: 0, headerName: "" },
        { field: "hsp", hide: false, width: 300, headerName: "HCF" },
        { field: "cde", hide: true, width: 150, headerName: "SPCB/PCC code", },
        { field: "rtu", hide: false, width: 150, headerName: "Route" },
        { field: "ctg", hide: false, width: 200, headerName: "Category" },
        { field: "ltt", hide: false, width: 180, headerName: "Latitude" },
        { field: "lgnt", hide: false, width: 250, headerName: "Longitude" },
        { field: "cty", hide: false, width: 150, headerName: "City" },
    ]);

    const GridLoaded = () => { };
    const onRowSelected = (data: string) => { };
    const onButtonClicked = (action: string, rm: any) => { };
    const rowData = [{}];

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        }, 300)
    };

    const setLvlWhoData = (data: any) => {
        if (lvl == "cbwtf") {
            setValueType(0)
        }
        setLvl(data.lvl);
        setWho(data.who);
        onChangeDts(data.date)
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
        let updatedColdef = [...coldef];
        if (data.lvl == "RGD") {
            updatedColdef[2] = valueType == 0 ? { ...updatedColdef[2], headerName: "Board" } : { ...updatedColdef[2], headerName: "State/UT" }; // Update the headerName of the second element
            setColdef(updatedColdef);

        } else if (data.lvl.toUpperCase() == "STT") {
            updatedColdef[2] = valueType == 0 ? { ...updatedColdef[2], headerName: "State/UT" } : { ...updatedColdef[2], headerName: "CBWTF" }; // Update the headerName of the second element
            setColdef(updatedColdef);
        } else if (data.lvl == "CBWTF") {
            updatedColdef[2] = { ...updatedColdef[2], headerName: "CBWTF" };
            setColdef(updatedColdef);
        } else {
            updatedColdef[2] = valueType == 0 ? { ...updatedColdef[2], headerName: "CPCB" } : { ...updatedColdef[2], headerName: "Board" }; // Update the headerName of the second element
            setColdef(updatedColdef);
        }
    }
    const { showToaster, hideToaster } = useToaster();

    const getClick = () => {
        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
        showToaster( msg, 'error');
        if (msg && msg[0]) {
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
            }, 2500);
            return;
        }
        setIsLoading("Data loading...");
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        refetch();
    }

    const getData = () => {
        let dt = state.textDts;
        dt = getFldValue(dt, "dt")
        let api: string = createGetApi("db=nodb|dll=s|fnct=cat9", `${dt}=1`);
        return nrjAxios({ apiCall: api });
    };


    const populateGrid = (data: any) => {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        let dt: string = GetResponseWnds(data);
        if (dt) {
            setIsLoading("");
            let ary: any = dataStr_ToArray(dt);
            dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
        } else {
            setIsLoading("Data is not there at the moment, Inconvenience is regreted.")
            setTimeout(() => {
                setIsLoading("")
            }, 3000)
        }
    }

    const { data, refetch } = useQuery({
        queryKey: ['svQry', 'factoryNotScn', state.rndm],
        queryFn: getData,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: populateGrid,
    })


    const PrntRep = () => {
        let gid: string = state.gid
        if (!gid) {
            showToaster( ["populate the data in the grid"], 'error');
            return;
        }
        let api: string = createGetApi("db=nodb|dll=dummy|fnct=dummy", `${gid}=1`);
        return nrjAxios({ apiCall: api });
    };



    const ShowReprtt = (dataC: any) => {
        let dt: string = GetResponseWnds(dataC);
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        if (dt && dt.indexOf('.pdf') > -1) {
            window.open(dt, "_blank")
        }
        else {
            showToaster( ["Please try again after refreshing the page!"], 'error')
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    }

    const { data: dataC, refetch: refetchC } = useQuery({
        queryKey: ['prntRep', 'dailySmryFctNotScn', state.rndm],
        queryFn: PrntRep,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowReprtt,
    })


    const printClick = () => {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        refetchC()
    }


    return (
        <>
            {applicationVerion == '1' && <>  <div>
                <HdrDrp hideHeader={false} formName=""></HdrDrp>
            </div>
                <span className="text-center text-bold mt-3 text-blue-600/75">
                    <h5>Waste Collection Report: Daily Detailed</h5>
                </span></>}
            <LevelSelector
                showCbwtf={false}
                levelSelectorData={setLvlWhoData}
                dateField={true}
                getListButton={true}
                getListOnclick={getClick}
                printButton={printClick}
            ></LevelSelector>
            <div className="bg-white shadow rounded-lg px-4 pb-6 pt-3">
                <div className="absolute font-semibold text-lg mt-2">{isLoading}</div>
                {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                    <Toaster data={showMessage} className={''}></Toaster>
                </div> : <></>}
                <div className='my-7 py-3'>
                    <NrjAgGrid
                        onGridLoaded={GridLoaded}
                        onRowSelected={onRowSelected}
                        colDef={coldef}
                        // apiCall={"nodb=rowset=fnct=hospdll=102=cmpid=usrid=a=" + state.mainId + "=stm838=0="}
                        apiCall={""}
                        rowData={[]}
                        onButtonClicked={onButtonClicked}
                        className='ag-theme-alpine-blue ag-theme-alpine'
                        trigger={state.triggerG}
                        showPagination={true}
                        newRowData={state.nwRow}
                    ></NrjAgGrid>
                </div>
            </div>

        </>
    );
};
export default React.memo(DailySummaryFactoryNotScn);

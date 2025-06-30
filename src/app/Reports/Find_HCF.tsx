import React, { useReducer, useState, useEffect } from 'react'
import axios from 'axios'
import { validForm } from '../../Hooks/validForm'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, capitalize, clrFldsExcptDrpDt, createGetApi, dataStr_ToArray, getStateAbbreviation, postLinux, svLnxSrvr } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";
import WtrInput from '../../components/reusable/nw/WtrInput'
import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { nrjAxios, nrjAxiosRequestBio, useNrjAxios } from '../../Hooks/useNrjAxios';
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import { Toaster } from '../../components/reusable/Toaster'
import CardHospitalDisplay from '../../components/reusable/CardHospitalDisplay'
import { getLvl, getWho } from '../../utilities/cpcb'
import { useToaster } from '../../components/reusable/ToasterContext'

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

const Find_HCF = () => {
    //#############Constants for the State and other functions
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const [isLoading, setIsLoading] = useState("");
    const [data1, setData1] = useState<any>("");
    const [search, setSearch] = useState("");
    const [value, setValue] = useState("");
    const [buttonDsb, setButtonDsb] = useState(true);
    const reqFlds = [
        { fld: 'mob', msg: "Enter HCF's mobile number or E-Mail", chck: 'length' }];

    const coldef = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'mob', hide: false, width: 150, headerName: 'HCF Mobile Number' }];

    useEffect(() => {
        if (value !== "") {
            setButtonDsb(false)
        } else {
            setButtonDsb(true)
        }

    }, [value])

    const GridLoaded = () => { };

    const rowData: any = [];
    const onRowSelected = (data: string) => { };
    const onButtonClicked = (action: string, rw: any) => { };

    const GetDataValue = (data: string, fld: string) => {
        let vl: string = useGetFldValue(data, fld);
        return vl;
    }
    //#############Function calls
    const onChangeDts = (data: string) => {
        let fldN: any = utilities(2, data, "");
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        let dt = getFldValue(data, fldN);
        setValue(dt)
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const { showToaster, hideToaster } = useToaster();
    const getClick = () => {

        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
        if (msg && msg[0]) {
            showToaster(msg, 'error')
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg })
            return;
        }
        refetch();
    }
    const getList = () => {
        setIsLoading("Loading data...")
        // let gid: any = utilities(3, "", "")
        // let gd: string = gid


        let api: string = "";
        let srch = "hcf";
        let dt = state.textDts;
        let mob = getFldValue(dt, 'mob');
        let lvl: string = getLvl();
        let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();

        // api = createGetApi("db=nodb|dll=xrydll|fnct=a227",srch + '=' + mob + '=' + lvl + '=' + who)
        // return nrjAxios({ apiCall: api })
        const payload: any = postLinux(lvl + '=' + who + '=' + srch + '=' + mob, 'findhcfmob');
        return nrjAxiosRequestBio("findInDB", payload);
    }
    const ShowData = (dataSvd1: any) => {

        setIsLoading("")
        let dt: any = GetResponseLnx(dataSvd1);
        if (dt.data && Array.isArray(dt.data) && dt.data.length) {
            let ech: any = dt.data[0];
            setSearch("")
            setData1(ech)
        }
        else {
           showToaster(["No data received"], "error");
            setData1("")
        }
        // dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        // setTimeout(function () {
        //     dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
        // }, 800);
    };

    const { data: dataSvd1, refetch: refetch } = useQuery({
        queryKey: ["svOldForm1", state.mainId, state.rndm],
        queryFn: getList,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });


    const clrFunct = () => {
        let data: string = state.textDts;
        data = clrFldsExcptDrpDt(data)
        dispatch({ type: ACTIONS.NEWFRMDATA, payload: data })
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
        }, 300)
    }

    return (
        <div className='bg-white'>
            {/* <div className="py-5 px-5">
                <span>Enter Mobile No and Click On Get Button To Search HCF</span>
            </div> */}
            {/* <div className='grid grid-cols-2 lg:grid-cols-3 my-6' >
                <div>
                    <WtrInput
                        Label='HCF Mobile Number / E Mail'
                        fldName='mob'
                        idText='txtmob'
                        onChange={onChangeDts}
                        dsabld={false}
                        callFnFocus=''
                        dsbKey={false}
                        upprCase={false}
                        validateFn=''
                        unblockSpecialChars={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        speaker={'Enter Mobile Number/E Mail'}
                        delayClose={1000}
                        placement='right'
                        ClssName='' ></WtrInput>
                </div>
                <div className='flex justify-center' style={{ marginTop: "34px" }}>
                    <div className='mx-2'>
                        <Button
                            size="medium"
                            style={{
                                backgroundColor: !buttonDsb ? "#3490dc" : "#d3d3d3", // Gray for disabled
                                color: !buttonDsb ? "#fff" : "#a9a9a9", // Light gray text for disabled
                                cursor: !buttonDsb ? "pointer" : "not-allowed", // Show not-allowed cursor
                              }}
                            variant="contained"
                            color="success"
                            disabled={buttonDsb}
                            onClick={getClick}
                        >
                            Get
                        </Button>

                    </div>
                </div>
            </div> */}
            <div className="grid grid-cols-2 lg:grid-cols-3 my-6">
                <div className="flex items-center">
                    <WtrInput
                        Label="HCF Mobile Number / E Mail"
                        fldName="mob"
                        idText="txtmob"
                        onChange={onChangeDts}
                        dsabld={false}
                        callFnFocus=""
                        dsbKey={false}
                        upprCase={false}
                        validateFn=""
                        unblockSpecialChars={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        speaker="Enter Mobile Number/E Mail"
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                    />
                    <div className="ml-4">
                        <Button
                            size="medium"
                            style={{
                                backgroundColor: !buttonDsb ? "#3490dc" : "#d3d3d3", // Gray for disabled
                                color: !buttonDsb ? "#fff" : "#a9a9a9", // Light gray text for disabled
                                cursor: !buttonDsb ? "pointer" : "not-allowed", // Show not-allowed cursor
                                 textTransform: "none"
                            }}
                            variant="contained"
                            color="success"
                            disabled={buttonDsb}
                            onClick={getClick}
                        >
                            Get
                        </Button>
                    </div>
                </div>
            </div>

            <div className="absolute font-semibold text-lg">{isLoading}</div>
            {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                <Toaster data={showMessage} className={''}></Toaster>
            </div> : <></>}

            <div className="py-4 px-4">
                {data1 ? <div className='grid grid-cols-10'>
                    <div className='col-span-3'></div>
                    <div className='col-span-5'>
                        <CardHospitalDisplay data={data1}></CardHospitalDisplay>
                    </div>
                    <div className='col-span-3'></div>
                </div> : <div>{search}</div>
                }
                {/* <NrjAgGrid
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
                    // PageSize={20}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    deleteFldNm={"iddel"}
                ></NrjAgGrid> */}
            </div>
        </div>
    );
}; export default React.memo(Find_HCF);
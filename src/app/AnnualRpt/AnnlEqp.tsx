import React, { useEffect, useReducer, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Alert, Button, SvgIcon } from "@mui/material";
import utilities, {
    GetResponseWnds,
    createGetApi,
    dataStr_ToArray,
    clrFldsExcptDrpDt,
    svLnxSrvr,
    getApplicationVersion,
} from "../../utilities/utilities";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios } from "../../Hooks/useNrjAxios";
import { validForm } from "../../Hooks/validForm";
import WtrInput from "../../components/reusable/nw/WtrInput";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { Toaster } from "../../components/reusable/Toaster";
import { useNavigate } from "react-router";
import HdrDrp from "../HdrDrp";
import { useEffectOnce } from "react-use";

import RefreshIcon from "@mui/icons-material/Refresh";
import Tooltip from "@mui/material/Tooltip";
import { useSearchParams } from "react-router-dom";
import { useToaster } from "../../components/reusable/ToasterContext";

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
    DSBLDTEXT: "dsbld",
    DISABLE: "disable",
    NEWFRMDATA: "frmdatanw",
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
            newstate.textDts = action.payload;
            return newstate;
        case ACTIONS.CHECK_REQ:
            newstate.errMsg = action.payload;
            newstate.openDrwr = true;
            return newstate;
        case ACTIONS.CHECK_REQDONE:
            newstate.errMsg = [];
            newstate.openDrwr = false;
            return newstate;
        case ACTIONS.NEWFRMDATA:
            newstate.textDts = action.payload;
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

const AnnlEqp = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const isUppercase = sessionStorage.getItem('UpperCase') == '1' ? true : false;
    const navigate = useNavigate();
    //const reqFlds: any[] = [];
    const [searchParams, setSearchParams] = useSearchParams();
    const cbwtfnm = searchParams.get('name');
    const reqFlds = [
        { fld: "incncnt", msg: "Enter No of Incinerators", chck: "1[length]" },
        { fld: "incncpt", msg: "Enter Capacity of Incinerator Kg/Day", chck: "1[length]" },
        { fld: "incntrt", msg: "Enter Disposed by Incinerator Kg/Annum", chck: "1[length]" },
        { fld: "plspcnt", msg: "Enter No of Plasma Pyrolysisrolysis", chck: "1[length]" },
        { fld: "plspcpt", msg: "Enter Capacity of Plasma pyrolysis Kg/Day", chck: "1[length]" },
        { fld: "plsptrt", msg: "Enter Disposed by Plasma pyrolysis Kg/Annum", chck: "1[length]" },
        { fld: "atccnt", msg: "Enter No of Autoclaves", chck: "1[length]" },
        { fld: "atccpt", msg: "Enter Capacity of Autoclaves Kg/Day", chck: "1[length]" },
        { fld: "atctrt", msg: "Enter Disposed by Autoclaves Kg/Annum", chck: "1[length]" },
        { fld: "mcrcnt", msg: "Enter No of Microwave", chck: "1[length]" },
        { fld: "mcrcpt", msg: "Enter Capacity of Microwave Kg/Day", chck: "1[length]" },
        { fld: "mcrtrt", msg: "Enter Disposed by Microwave Kg/Annum", chck: "1[length]" },
        { fld: "hydcnt", msg: "Enter No of Hydroclav", chck: "1[length]" },
        { fld: "hydcpt", msg: "Enter Capacity of Hydroclave Kg/Day", chck: "1[length]" },
        { fld: "hydtrt", msg: "Enter Disposed by PHydroclave Kg/Annum|", chck: "1[length]" },
        { fld: "shrdcnt", msg: "Enter No of Shredder", chck: "1[length]" },
        { fld: "shrdcpt", msg: "Enter Capacity of Plasma pyrolysis Kg/Day|", chck: "1[length]" },
        { fld: "shrdtrt", msg: "Enter Disposed by Plasma pyrolysis Kg/Annum", chck: "1[length]" },
        { fld: "ndlcnt", msg: "Enter No of Needle tip cutters", chck: "1[length]" },
        { fld: "ndlcpt", msg: "Enter Capacity of Needle tip cutter Kg/Day", chck: "1[length]" },
        { fld: "ndltrt", msg: "Enter Disposed by Needle tip cutter Kg/Annum", chck: "1[length]" },
        { fld: "cnctcnt", msg: "Enter No of Encapsulation or Concrete pit", chck: "1[length]" },
        { fld: "cnctcpt", msg: "Enter Capacity of Encapsulation or Concrete pit Kg/Day", chck: "1[length]" },
        { fld: "cncttrt", msg: "Enter Disposed by Encapsulation or Concrete pit Kg/Annum", chck: "1[length]" },
        { fld: "dpbcnt", msg: "Enter No of Deep burial pitsal pits", chck: "1[length]" },
        { fld: "dpbcpt", msg: "Enter Capacity of Deep burial pits Kg/Day", chck: "1[length]" },
        { fld: "dbptrt", msg: "Enter Disposed by Deep burial pits Kg/Annum", chck: "1[length]" },
        { fld: "chmdcnt", msg: "Enter No of Chemical disinfection disinfection", chck: "1[length]" },
        { fld: "chmdcpt", msg: "Enter Capacity of Chemical disinfection Kg/Day", chck: "1[length]" },
        { fld: "chmdtrt", msg: "Enter Disposed by Chemical disinfection Kg/Annum", chck: "1[length]" }
    ];


    const GetDataValue = (data: string, fld: string) => {
        let vl: string = getFldValue(data, fld);
        return vl;
    };

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const HandleSaveClick = () => {
        let api: string = state.textDts;
        let mid = sessionStorage.getItem('annualRptCbwtfid') || '1';
        api = svLnxSrvr("", api, mid, "shrtrm", "cpc0cbwfequp", state.mainId, "");
        return nrjAxios({ apiCall: api });
    };
    const { showToaster, hideToaster } = useToaster();
    const svClick = () => {

        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
        showToaster( msg, 'error');
        if (msg && msg[0]) {
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
            }, 5000);
            return;
        }
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        refetch();
    };

    const svdQry = (data: any) => {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        let ech: any[];
        let rspnse: string = data.data.Status;
        if (rspnse) {
            ech = rspnse.split("][");
            if (ech && ech[0]) {

                if (rspnse.indexOf("id][") > -1) {
                    setShowMessage({
                        message: ["Data Saved Successfully"],
                        type: "success",
                    });
                }
                dispatch({ type: ACTIONS.MAINID, payload: Number(ech[1]) });

                dispatch({ type: ACTIONS.CHECK_REQ, payload: "Data Update" });
                setTimeout(function () {
                    dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
                }, 5000);
            }
        }

    };



    const { data, refetch } = useQuery({
        queryKey: ["svQryAnnlEqp", state.mainId, state.rndm],
        queryFn: HandleSaveClick,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: svdQry,
    });

    useEffectOnce(() => {
        let oldid: string = sessionStorage.getItem("annualRptCbwtfid") || "";
        if (oldid) {
            refetchOld();
        }
    });

    const GetSvData = () => {
        let oldid: string = sessionStorage.getItem("annualRptCbwtfid") || "";
        let api: string = createGetApi(
            "db=nodb|fnct=102|dll=hospdll",
            oldid + "=slm1003"
        );
        return nrjAxios({ apiCall: api });
    };

    const ShowData = (dataSvd: any) => {
        let dt: string = GetResponseWnds(dataSvd);
        if (dt) {
            dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
        }
    };

    const { data: dataSvd, refetch: refetchOld } = useQuery({
        queryKey: ["svOldForm4", state.mainId, state.rndm],
        queryFn: GetSvData,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });
    let ttl: string = sessionStorage.getItem("cbwtfnm") || "";

    const clrFunct = () => {
        let data: string = state.textDts;
        data = clrFldsExcptDrpDt(data);
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
            dispatch({ type: ACTIONS.NEWFRMDATA, payload: data });
        }, 300);
    };
  const applicationVerion: string = getApplicationVersion();
    
    return (
        <>
            <div className="bg-white">
                <div className="container-sm flex justify-end">
                {/* <Tooltip title="Click to clear the old data">

                    <Button variant="contained"
                        style={{ color: "#3B71CA", backgroundColor: "#fff" }}
                        onClick={clrFunct}
                    >
                        <SvgIcon component={RefreshIcon} />
                    </Button>
                    </Tooltip> */}
                </div>
                <div className="shadow rounded-lg mt-3">
                    <div className="py-5">
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:m-3 lg:m-5" >

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of Incinerators'
                                        fldName='incncnt'
                                        idText='txtincncnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}                                     
                                        speaker={'Enter No of Incinerators'}
                                        delayClose={1000}
                                        placement='right'
                                        ClssName=''
                                        ToolTip="Enter only numbers"
                                         ></WtrInput>
                                </div>
                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Incinerator Kg/Day'
                                        fldName='incncpt'
                                        idText='txtincncpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Capacity of Incinerator Kg/Day'}
                                        delayClose={1000}
                                        placement='bottom'
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Incinerator Kg/Annum'
                                        fldName='incntrt'
                                        idText='txtincntrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Disposed by Incinerator Kg/Annum'}
                                        delayClose={1000}
                                        placement='left' ClssName=''
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of Plasma pyrolysis'
                                        fldName='plspcnt'
                                        idText='txtplspcnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter No of Plasma pyrolysis'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Plasma pyrolysis Kg/Day'
                                        fldName='plspcpt'
                                        idText='txtplspcpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Capacity of Plasma pyrolysis Kg/Day'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Plasma pyrolysis Kg/Annum'
                                        fldName='plsptrt'
                                        idText='txtplsptrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Disposed by Plasma pyrolysis Kg/Annum'}
                                        delayClose={1000}
                                        ClssName=''
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of Autoclaves'
                                        fldName='atccnt'
                                        idText='txtatccnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter No of Autoclaves'}
                                        delayClose={1000}
                                        ClssName=''
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Autoclaves Kg/Day'
                                        fldName='atccpt'
                                        idText='txtatccpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Capacity of Autoclaves Kg/Day'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Autoclaves Kg/Annum'
                                        fldName='atctrt' idText='txtatctrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Disposed by Autoclaves Kg/Annum'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of Microwave'
                                        fldName='mcrcnt' idText='txtmcrcnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter No of Microwave'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Microwave Kg/Day'
                                        fldName='mcrcpt' idText='txtmcrcpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Capacity of Microwave Kg/Day'}
                                        delayClose={1000}
                                        ClssName=''
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Microwave Kg/Annum'
                                        fldName='mcrtrt' idText='txtmcrtrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Disposed by Microwave Kg/Annum'}
                                        delayClose={1000}
                                        ClssName=''                                        
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of Hydroclave'
                                        fldName='hydcnt' idText='txthydcnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter No of Hydroclave'}
                                        delayClose={1000}
                                        ClssName=''
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Hydroclave Kg/Day'
                                        fldName='hydcpt' idText='txthydcpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Capacity of Hydroclave Kg/Day'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Hydroclave Kg/Annum'
                                        fldName='hydtrt' idText='txthydtrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Disposed by PHydroclave Kg/Annum'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of Shredder'
                                        fldName='shrdcnt' idText='txtshrdcnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter No of Shredder'}
                                        delayClose={1000}
                                        ClssName=''
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Shredder Kg/Day'
                                        fldName='shrdcpt' idText='txtshrdcpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Capacity of Plasma pyrolysis Kg/Day'}
                                        delayClose={1000}
                                        ClssName=''                              
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Shredder Kg/Annum'
                                        fldName='shrdtrt' idText='txtshrdtrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Disposed by Plasma pyrolysis Kg/Annum'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of Needle Cutters'
                                        fldName='ndlcnt' idText='txtndlcnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter No of Needle tip cutter'}
                                        delayClose={1000}
                                        ClssName=''
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Needle tip cutter Kg/Day'
                                        fldName='ndlcpt' idText='txtndlcpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Capacity of Needle tip cutter Kg/Day'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Needle tip cutter Kg/Annum'
                                        fldName='ndltrt' idText='txtndltrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Disposed by Needle tip cutter Kg/Annum'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of Encapsulation or Concrete pit'
                                        fldName='cnctcnt' idText='txtcnctcnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter No of Encapsulation or Concrete pit'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Encapsulation or Concrete pit Kg/Day'
                                        fldName='cnctcpt'
                                        idText='txtcnctcpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'

                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Capacity of Encapsulation or Concrete pit Kg/Day'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Encapsulation or Concrete pit Kg/Annum'
                                        fldName='cncttrt'
                                        idText='txtcncttrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Disposed by Encapsulation or Concrete pit Kg/Annum'}
                                        delayClose={1000}
                                        ClssName=''
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of Deep burial pits'
                                        fldName='dpbcnt'
                                        idText='txtdpbcnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter No of Deep burial pits'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Deep burial pits Kg/Day'
                                        fldName='dpbcpt'
                                        idText='txtdpbcpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Capacity of Deep burial pits Kg/Day'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Deep burial pits Kg/Annum'
                                        fldName='dbptrt'
                                        idText='txtdbptrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Disposed by Deep burial pits Kg/Annum'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of  Chemical disinfection'
                                        fldName='chmdcnt'
                                        idText='txtchmdcnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter No of Chemical disinfection'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Chemical disinfection Kg/Day'
                                        fldName='chmdcpt'
                                        idText='txtchmdcpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Capacity of Chemical disinfection Kg/Day'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Chemical disinfection Kg/Annum'
                                        fldName='chmdtrt'
                                        idText='txtchmdtrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn='1[length]'
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={'Enter Disposed by Chemical disinfection Kg/Annum'}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='No of Any other treatment'
                                        fldName='othrcnt'
                                        idText='txtothrcnt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn=''
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        ClssName='' 
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Capacity of Plasma pyrolysis Kg/Day'
                                        fldName='othrcpt'
                                        idText='txtothrcpt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn=''
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        ClssName=''
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>

                                <div className="">
                                    <WtrInput
                                        displayFormat="1"
                                        Label='Disposed by Any other treatment Kg/Annum'
                                        fldName='othrtrt'
                                        idText='txtothrtrt'
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=''
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn=''
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        ClssName=''
                                        ToolTip="Enter only numbers"
                                        ></WtrInput>
                                </div>




                            </div>
                        </div>
                        {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                            <Toaster data={showMessage} className={''}></Toaster>
                        </div> : <></>}
                        <div className="flex justify-center py-7">
                            <div className="mr-4">
                                <Button
                                    size="medium"
                                    style={{ color: '#38a169', backgroundColor: "#fff",  textTransform: "none", }}
                                    className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                                    variant="contained"
                                    color="success"
                                    disabled={!state.disableA}
                                    onClick={() => { navigate(`/annlWstStrg`) }}
                                >
                                    Previous
                                </Button>
                            </div>
                            <div className="mr-4">
                                <Button
                                    size="medium"
                                    className="bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                                    variant="contained"
                                    disabled={!state.disableA}
                                    startIcon={<SaveIcon />}
                                    onClick={svClick}
                                    style={{  textTransform: "none", }}
                                >
                                    Submit
                                </Button>
                            </div>
                            <div className="mr-4">
                                <Tooltip title="Click to continue">
                                <Button
                                    size="medium"
                                    className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"

                                    style={{ color: '#38a169', backgroundColor: "#fff", textTransform: "none", }}
                                    variant="contained"
                                    color="success"
                                    disabled={!state.disableA}
                                    onClick={() => { navigate(`/annlMisc`) }}
                                >
                                    Next
                                </Button>
                                </Tooltip>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </>
    );
};
export default React.memo(AnnlEqp);
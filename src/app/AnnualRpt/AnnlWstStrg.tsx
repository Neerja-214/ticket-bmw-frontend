import React, { useEffect, useReducer, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Alert, Button, SvgIcon } from "@mui/material";
import utilities, {
    GetResponseWnds,
    createGetApi,
    clrFldsExcptDrpDt,
    dataStr_ToArray,
    svLnxSrvr,
    getApplicationVersion,
} from "../../utilities/utilities";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios } from "../../Hooks/useNrjAxios";
import { validForm } from "../../Hooks/validForm";
import WtrInput from "../../components/reusable/nw/WtrInput";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { Toaster } from "../../components/reusable/Toaster";
import NrjChkbx from "../../components/reusable/NrjChkbx";
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

const AnnlWstStrg = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const isUppercase = sessionStorage.getItem('UpperCase') == '1' ? true : false;
    const navigate = useNavigate();
    // const reqFlds: any[] = [];
    const [searchParams, setSearchParams] = useSearchParams();
    const cbwtfnm = searchParams.get('name');
    const reqFlds = [
        { fld: "strgsz", msg: "Enter Size of Storage", chck: "1[length]" },
        { fld: "strgcpc", msg: "Enter Capacity of Storage", chck: "1[length]" },
        { fld: "prvsn", msg: "Enter Provision  of Storage", chck: "1[length]" },
        { fld: "qtyrsld", msg: "Enter Quantity of Recyclable Waste Sold", chck: "1[length]" },
        { fld: "vhcls", msg: "Enter No of Vehicles", chck: "1[length]" },
        { fld: "qtyash", msg: "Enter Generated Incineration Ash", chck: "1[length]" },
        { fld: "ashdsp", msg: "Enter Location of disposal of Generated Incineration Ash", chck: "1[length]" },
        { fld: "qtysld", msg: "Enter Generated ETP Sludge", chck: "1[length]" },
        { fld: "slddsp", msg: "Enter Location of disposal of ETP Sludge", chck: "1[length]" },
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
        api = svLnxSrvr("", api, mid, "shrtrm", "cpc0cbwfanlstrg", state.mainId, "");
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
        if (state.disableB == 0) {
            dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        }
        if (state.disableA == 0) {
            dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        }
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
        queryKey: ["svQryAnnlWstStrg", state.mainId, state.rndm],
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
            oldid + "=stm962"
        );
        return nrjAxios({ apiCall: api });
    };

    const ShowData = (dataSvd: any) => {
        let dt: string = GetResponseWnds(dataSvd);
        if (dt) {
            dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
            dispatch({ type: ACTIONS.RANDOM, payload: 1 })
        } else {
            setTimeout(function () {
                refetchVhcl()
            }, 800)
            //Get Vehicle Count

        }
    };

    const { data: dataSvd, refetch: refetchOld } = useQuery({
        queryKey: ["svOldForm3", state.mainId, state.rndm],
        queryFn: GetSvData,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });

    const GetVhcl = () => {
        let oldid: string = sessionStorage.getItem("annualRptCbwtfid") || "";
        let api: string = createGetApi(
            "db=nodb|fnct=c278|dll=accdll",
            oldid
        );
        return nrjAxios({ apiCall: api });
    };

    const ShowVehcle = (datavhc: any) => {
        let dt: string = GetResponseWnds(datavhc);
        if (dt) {
            dt = "vhcls][" + dt
            dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
            dispatch({ type: ACTIONS.RANDOM, payload: 1 })
        }

    };

    const { data: datavhc, refetch: refetchVhcl } = useQuery({
        queryKey: ["svOldVhcl", state.rndm],
        queryFn: GetVhcl,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowVehcle,
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
            <div className="bg-white   ">
                {/* <div className="container-sm flex justify-end">
                    <Tooltip title="Click to clear the old data">
                    <Button variant="contained"
                        style={{ color: "#3B71CA", backgroundColor: "#fff" }}
                        onClick={clrFunct}
                    >
                        <SvgIcon component={RefreshIcon} />
                    </Button>
                    </Tooltip>
                </div> */}
                <div className="shadow rounded-lg mt-3">
                    <div className="py-5">
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:m-3 lg:m-5">
                                <div className="mb-1">
                                    <WtrInput
                                        displayFormat="1"
                                        Label="Size of Storage"
                                        fldName="strgsz"
                                        idText="txtstrgsz"
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=""
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn="1[length]"
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}

                                        speaker={"Enter Size of Storage"}
                                        delayClose={1000}
                                        ClssName=""
                                        ToolTip="Enter numbers with unit"
                                    ></WtrInput>
                                </div>

                                <div className="mb-1">
                                    <WtrInput
                                        displayFormat="1"
                                        Label="Capacity of Storage"
                                        fldName="strgcpc"
                                        idText="txtstrgcpc"
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=""

                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn="1[length]"
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={"Enter Capacity of Storage"}
                                        delayClose={1000}
                                        ClssName=""
                                        ToolTip="Enter numbers with unit"
                                    ></WtrInput>
                                </div>
                                <div className="mb-1">
                                    <WtrInput
                                        displayFormat="1"
                                        Label="Provision for Storage"
                                        fldName="prvsn"
                                        idText="txtprvsn"
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=""
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn="1[length]"
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={"Enter Provision of Storage"}
                                        delayClose={1000}
                                        ClssName=""
                                    ></WtrInput>
                                </div>
                                <div className="mb-1">
                                    <WtrInput
                                        displayFormat="1"
                                        Label="Recyclable Waste Sold (Kg/ annum)"
                                        fldName="qtyrsld"
                                        idText="txtqtyrsld"
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=""
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker="Enter Quantity of Recyclable Waste Sold"
                                        delayClose={1000}
                                        ToolTip="Enter numbers with decimals"
                                    ></WtrInput>
                                </div>
                                <div className="mb-1">
                                    <WtrInput
                                        displayFormat="1"
                                        Label="No of Vehicles"
                                        fldName="vhcls"
                                        idText="txtvhcls"
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=""
                                        dsbKey={false}
                                        allowNumber={true}
                                        upprCase={isUppercase}
                                        validateFn="1[length]"
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={"Enter No of Vehicles"}
                                        delayClose={1000}
                                        ClssName=""
                                    ></WtrInput>
                                </div>


                                <div className="mb-1">
                                    <WtrInput
                                        displayFormat="1"
                                        Label="Quantity of Incineration Ash (Kg /annum)"
                                        fldName="qtyash"
                                        idText="txtqtyash"
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=""
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn="1[length]"
                                        allowDecimal={true}
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={"Enter Generated Incineration Ash"}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        ToolTip="Enter numbers with decimals"
                                    ></WtrInput>
                                </div>
                                <div className="mb-1">
                                    <WtrInput
                                        displayFormat="1"
                                        Label="Incineration Ash Disposed At"
                                        fldName="ashdsp"
                                        idText="txtashdsp"
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=""
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn="1[length]"
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={"Enter Location of disposal of Generated Incineration Ash"}
                                        delayClose={1000}
                                        ClssName=""
                                    ></WtrInput>
                                </div>
                                <div className="mb-1">
                                    <WtrInput
                                        displayFormat="1"
                                        Label="Quantity of ETP Sludge(Kg /annum)"
                                        fldName="qtysld"
                                        idText="txtqtysld"
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=""
                                        dsbKey={false}
                                        allowNumber={true}
                                        upprCase={isUppercase}
                                        validateFn="1[length]"
                                        allowDecimal={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker={"Enter Generated ETP Sludge"}
                                        delayClose={1000}
                                        ClssName=""
                                    ></WtrInput>
                                </div>
                                <div className="mb-1">
                                    <WtrInput
                                        displayFormat="1"
                                        Label="ETP Sludge Disposed At"
                                        fldName="slddsp"
                                        idText="txtslddsp"
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=""
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        validateFn="1[length]"
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        speaker="Enter Location of disposal of ETP Sludge"
                                        delayClose={1000}
                                    ></WtrInput>
                                </div>

                                <div className="mb-1">
                                    <WtrInput
                                        displayFormat="1"
                                        Label="Name of HCF Not Handed over Waste"
                                        fldName="hcfnt"
                                        idText="txthcfnt"
                                        onChange={onChangeDts}
                                        dsabld={false}
                                        callFnFocus=""
                                        dsbKey={false}
                                        upprCase={isUppercase}
                                        unblockSpecialChars={true}
                                        validateFn=""
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        ClssName=""
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
                                    style={{ color: '#38a169', backgroundColor: "#fff" , textTransform: "none",}}
                                    variant="contained"
                                    color="success"
                                    className=" font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"

                                    // disabled={!state.disableA}
                                    onClick={() => { navigate(`/annlWstWt`) }}
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
                                    style={{textTransform: "none",}}
                                >
                                    Submit
                                </Button>
                            </div>
                            <div className="mr-4">
                                <Tooltip title="Click to continue">
                                <Button
                                    size="medium"
                                    style={{ color: '#38a169', backgroundColor: "#fff",textTransform: "none", }}
                                    variant="contained"
                                    color="success"
                                    className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                                    disabled={!state.disableB}
                                    onClick={() => { navigate(`/annlEqp`) }}
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
export default React.memo(AnnlWstStrg);
import { Button } from "@mui/material";
import React, { useEffect, useReducer, useState } from "react";
import { Modal, ButtonToolbar, Placeholder } from 'rsuite';
import SaveIcon from "@mui/icons-material/Save";
import NrjChkbx from "./NrjChkbx";
import utilities, { dataStr_ToArray, getApiFromClinician, svLnxSrvr } from "../../utilities/utilities";
import { nrjAxios, nrjAxiosRequest } from "../../Hooks/useNrjAxios";
import { useQuery } from "@tanstack/react-query";

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
    }
};

export default function DataCorrection(props: any) {
    const [modelData, setModelData] = useState<any>({});
    const [state, dispatch] = useReducer(reducer, initialState);

    const [res, setRes] = useState<any>([{
        "cbwtfnm": " CBWTF 1",
        "addra": "Line1",
        "addrb": "Line2",
        "addrc": "Line3",
        "cty": "Dewas",
        "pnc": "488011",
        "dist": "Ujjain",
        "stt": "MP",
        "contprnm": "Manager",
        "phn": "6985231088",
        "mob": "1234569877",
        "eml": "test@gmail.com",
        "fctltt": "90.00000",
        "fctlgt": "75.803574",
        "novhcl": "5",
        "licnopb": "12F5563"
    },
    {
        "cbwtfnm": " CBWTF 2",
        "addra": "Line1",
        "addrb": "Line2",
        "addrc": "Line3",
        "cty": "Dewas",
        "pnc": "488011",
        "dist": "Ujjain",
        "stt": "MP",
        "contprnm": "Manager",
        "phn": "6985231088",
        "mob": "1234569877",
        "eml": "test@gmail.com",
        "fctltt": "90.00000",
        "fctlgt": "75.803574",
        "novhcl": "5",
        "licnopb": "12ASF5563"
    }
    ]);

    const [open, setOpen] = useState(false);
    const [stabiliser, setStabiliser] = useState<boolean>(true);

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    function handleOpen(data: any) {
        if (stabiliser) {
            setOpen(true);
            setModelData(data);
            setStabiliser(!stabiliser);
        }
    }
    function handleClose() {
        setOpen(false);
        setStabiliser(!stabiliser);
    }

    function sendReq(data: any) {
        // console.log(data);
        refetchS();
    }
    function deleteReq(data: any) {
        // console.log(data);
        refetchD();
    }

    const sendData = () => {
        let checkboxData = state.textDts;
        let ech: string[] = checkboxData.split("=");
        let data1: any = {}
        for (let i = 0, j = ech.length; i < j; i++) {
            if (ech[i]) {
                let splitkey = ech[i].split("][")
                data1[splitkey[0]] = splitkey[1];
            }
            console.log(data1);
        }
        let api: string = getApiFromClinician('/dummy path');
        return nrjAxiosRequest(api, data1);
    };


    const showData = (data: any) => {
    };

    const { data: dataS, refetch: refetchS } = useQuery({
        queryKey: ["sendReq", state.textDts, state.mainId],
        queryFn: sendData,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: showData,
    });

    const delData = () => {
        let api: string = getApiFromClinician('dummy path');
        let data1 = {};
        return nrjAxiosRequest(api, data1);
    };


    const delSuccessData = (data: any) => {
    };
    const { data: datad, refetch: refetchD } = useQuery({
        queryKey: ["delReq", state.textDts, state.mainId],
        queryFn: delData,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: delSuccessData,
    });



    return (
        <>
            {res.map((data: any) => (
                <div key={data.licnopb} className='px-4 my-6 py-6 rounded-lg' style={{ backgroundColor: '#F5F6FA' }}>
                    <div className='grid lg:grid-cols-3 pb-3'>
                        <div className='flex items-center'>
                            <div className='ml-7 pl-7'>
                                <div className='text-black font-semibold py-2'>
                                    {data.cbwtfnm}
                                </div>
                                <div style={{ color: '#CFD3D4' }}>
                                    {data.licnopb}
                                </div>
                            </div>
                        </div>
                        <div>
                            <Button
                                size="medium"
                                style={{ backgroundColor: "#3B71CA" ,textTransform: "none"}}
                                variant="contained"
                                color="success"
                                startIcon={<SaveIcon />}
                                onClick={() => { handleOpen(data) }}>
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            {open && <Modal open={open} size="md" onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>
                        <div className="font-semibold">
                            Correction: {modelData.cbwtfnm}
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div className='mx-8 rounded-lg p-3 mt-4' style={{ backgroundColor: '#f5f6fa' }}>
                        <div className="p-4 grid grid-cols-2 gap-x-10 text-black font-semibold">
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    CBWTF:
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="cbwtfnm"
                                        idText="txtcbwtfnm"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    Address I :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="addra"
                                        idText="txtaddra"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    Address II :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="addrb"
                                        idText="txtaddrb"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    Address III:
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="addrc"
                                        idText="txtaddra"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    City :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="cty"
                                        idText="txtcty"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    Pin Code :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="pnc"
                                        idText="txtpnc"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    State :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="stt"
                                        idText="txtstt"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    Contact person Name :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="contprnm"
                                        idText="txtcontprnm"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    Phone :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="pnh"
                                        idText="txtphn"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    Mobile :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="mpb"
                                        idText="txtmob"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    Email :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="eml"
                                        idText="txteml"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    Lattitude :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="fctltt"
                                        idText="txtfctltt"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    Longitude :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="fctlgt"
                                        idText="txtfctlgt"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                            <div className="flex my-2 justify-around items-center">
                                <div className="pt-3 text-left">
                                    No of Vehicle :
                                </div>
                                <div className="">
                                    <NrjChkbx
                                        Label=""
                                        fldName="novhcl"
                                        idText="txtnovhcl"
                                        onChange={onChangeDts}
                                        clrFnct={state.trigger}
                                    ></NrjChkbx>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center py-7">
                            <div className="mr-4">
                                <Button
                                    size="medium"
                                    style={{ backgroundColor: "#3B71CA",textTransform: "none" }}
                                    variant="contained"
                                    color="success"
                                    onClick={() => { deleteReq(modelData) }}
                                >
                                    Delete
                                </Button>
                            </div>
                            <div>
                                <Button
                                    size="medium"
                                    style={{ backgroundColor: "#3B71CA",textTransform: "none" }}
                                    variant="contained"
                                    color="success"
                                    onClick={() => { sendReq(modelData) }}
                                >
                                    Copy licence no
                                </Button>
                            </div>
                            <div>
                                <Button
                                    size="medium"
                                    style={{ backgroundColor: "#3B71CA" ,textTransform: "none"}}
                                    variant="contained"
                                    color="success"
                                    onClick={() => { sendReq(modelData) }}
                                >
                                    Send request
                                </Button>
                            </div>

                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {/* <Button variant="contained" color="success"  onClick={handleClose}>
                            Ok
                        </Button> */}
                    <Button onClick={handleClose} style={{textTransform: "none"}}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>}
        </>

    )
}
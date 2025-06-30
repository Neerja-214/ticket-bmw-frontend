import React, { useEffect, useReducer, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import utilities, { ChangeCase, GetResponseWnds, createGetApi, dataStr_ToArray, getApplicationVersion, getStateAbbreviation, gridAddToolTipColumn, svLnxSrvr } from '../../utilities/utilities'
import { Button, SvgIcon, Tooltip } from "@mui/material";
import { validForm } from "../../Hooks/validForm";

import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { Navigate, useNavigate } from "react-router-dom";
import { useGetFldValue } from "../../Hooks/useGetFldValue";
import HdrDrp from "../HdrDrp";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios, useNrjAxios, nrjAxiosRequest } from "../../Hooks/useNrjAxios";
import { Toaster } from "../../components/reusable/Toaster";
import { getLvl, getWho } from '../../utilities/cpcb';
import LevelSelector from '../dshbrd/LevelSelector';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const ACTIONS = {
    TRIGGER_GRID: "grdtrigger",
    NEWROWDATA: "newrow",
    NEWROWDATAB: "newrowB",
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
    nwRowB: [],
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
    nwRowB: any;
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
            newstate.triggerG += 10;
            return newstate;
        case ACTIONS.NEWROWDATAB:
            newstate.nwRowB = action.payload;
            newstate.triggerG += 10;
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

const DisplaySupervisorDataCard = (props: any) => {

    const [data, setData] = useState(props.data || {});

    useEffect(() => {
        setData(props.data);
    }, [props.data])

    return (
        <>

            <Card className='mb-4 ' style={{
                backgroundColor: ' #E8EAFB'
            }}>
                <CardContent className='border bg-white rounded-3 m-2 overflow-auto'>

                    <div className="lg:flex justify-between bg-gray-100 align-items-center mb-3 px-3 rounded-pill">
                        <h4> {props.name}</h4>
                        {/* <div className='cursor-pointer text-primary flex'>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="blue"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12" y2="8" />
                            </svg>
                            <span className='ml-[2px]'> Details</span>
                        </div> */}
                    </div>
                    <div className="pl-3 mt-3 whitespace-nowrap">
                        <div className="flex justify-between my-3 items-end">
                            <h6 className='text-dark font-medium w-3/12'>Color</h6>
                            <h6 className='text-dark font-medium'>No. of bags</h6>
                            <h6 className='text-dark font-medium'>Weight (in kg)</h6>
                        </div>
                        <div className="flex justify-between my-3 items-end">
                            <h6 className='text-[#6c757d] font-medium w-3/12'>Red </h6>
                            <div className="w-fit bg-red-100 text-red-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">{props.data.redcnt}</div>
                            <div className="w-fit bg-red-100 text-red-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">{props.data.redwt}</div>
                        </div>
                        <div className="flex justify-between my-3 items-end">
                            <h6 className='text-[#6c757d] font-medium w-3/12'>Yellow </h6>
                            <div className="bg-yellow-100 text-yellow-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">{props.data.ylwcnt}</div>
                            <div className="bg-yellow-100 text-yellow-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">{props.data.ylwwt}</div>
                        </div>
                        <div className="flex justify-between my-3 items-end">
                            <h6 className='text-[#6c757d] font-medium w-3/12'>Blue </h6>
                            <div className="bg-blue-100 text-blue-800 text-sm font-semibold mr-2 me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-blue-400 border-blue-400">{props.data.blucnt}</div>
                            <div className="bg-blue-100 text-blue-800 text-sm font-semibold mr-2 me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-blue-400 border-blue-400">{props.data.bluwt}</div>
                        </div>
                        <div className="flex justify-between my-3 items-end">
                            <h6 className='text-[#6c757d] font-medium w-3/12'>White </h6>
                            <div className="bg-gray-100 text-gray-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">{props.data.whtcnt}</div>
                            <div className="bg-gray-100 text-gray-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">{props.data.whtwt}</div>
                        </div>
                        <div className="flex justify-between my-3 items-end">
                            <h6 className='text-[#6c757d] font-medium w-3/12'>Cytotoxic </h6>
                            <div className="bg-yellow-200 text-yellow-900 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">{props.data.cytcnt}</div>
                            <div className="bg-yellow-200 text-yellow-900 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">{props.data.cytwt}</div>
                        </div>
                    </div>
                   
                </CardContent>
            </Card>
        </>

    );
}; export default React.memo(DisplaySupervisorDataCard);

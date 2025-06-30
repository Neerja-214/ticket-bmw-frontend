import React, { useEffect, useReducer, useState } from 'react'
import { validForm } from '../../Hooks/validForm'
import { useQuery } from '@tanstack/react-query'
import utilities, { createGetApi, dataStr_ToArray, svLnxSrvr } from '../../utilities/utilities'
import { nrjAxios } from '../../Hooks/useNrjAxios'; import { getFldValue } from '../../Hooks/useGetFldValue';
import moment from 'moment';
import Button from '@mui/material/Button';
import NrjRsDt from '../../components/reusable/NrjRsDt';
import { Chart } from "react-google-charts";
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect';
import { Navigate, useNavigate, useNavigationType } from "react-router-dom";
import { useEffectOnce } from 'react-use';

import DatamapsIndia from 'react-datamaps-india'

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
    }
};

type HeatMap = {
    regionData: any,
    startColor: string,
    endColor: string,
    heatNameTitle: string,
    title: string,
}


const IndiaHeatMap = (props: any) => {
    const { regionData, startColor, endColor, heatNameTitle } = props;
    //const [data, setData] = useState<any[]>([{}])
    // console.log("startColor:", startColor);
    // console.log("endColor:", endColor);

    const [refreshKey, setRefreshKey] = useState(0);


    useEffect(() => {
        setRefreshKey((prevKey) => prevKey + 1);
    }, [props]);

    function hoverFunction(value: any) {
        // changeFillColor();
        return (
            <>
                <p>{value.value.name}</p>
                <p>{value.value.value}</p>
            </>
        )
    }


    function changeFillColor() {
        const elementsWithDataMaps = document.querySelectorAll('.datamap-state');
        //console.log("elementsWithDataMaps : ", elementsWithDataMaps)
        elementsWithDataMaps.forEach((element: any) => {
            //console.log("element : ", element)
            const fillStyle = window.getComputedStyle(element).getPropertyValue('fill');
            //console.log("fillStyle : ", fillStyle)
            if (fillStyle === 'rgb(245, 245, 248)') {
                element.style.fill = 'rgb(251, 249, 231)';
            }
        });
    }


    useEffect(() => {

        
        // Call the function initially and on every change in the component
        changeFillColor();

        // Optionally, add event listeners or other subscriptions here

        // Cleanup function if necessary
        return () => {
            // Any cleanup code here
        };
    });

    return (
        <>
            <div className='bg-white' >
                <div className='mt-3 '>
                    <div className='bg-white shadow-lg rounded-md vh-100'>
                        <div className='pt-2 px-2'>
                            <h5>
                                Heatmap : <span className='font-medium text-blue-700'> {heatNameTitle} </span>
                            </h5>

                        </div>
                        <div className='flex justify-center'>
                            <div className='w-3/5 relative' onMouseMove={changeFillColor}>
                                <DatamapsIndia
                                    key={refreshKey}
                                    regionData={regionData}
                                    hoverComponent={hoverFunction}
                                    mapLayout={{
                                        title: '',
                                        legendTitle: heatNameTitle,
                                        startColor: startColor,
                                        endColor: endColor,
                                        hoverTitle: 'Count',
                                        noDataColor: '#f5f5f8',
                                        borderColor: '#8D8D8D',
                                        hoverBorderColor: '#8D8D8D',
                                        hoverColor: 'rgb(251, 249, 231)',
                                        height: 300
                                    }}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default React.memo(IndiaHeatMap);
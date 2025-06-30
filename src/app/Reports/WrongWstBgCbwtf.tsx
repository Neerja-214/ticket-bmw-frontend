import React, { useEffect, useReducer, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, capitalize, createGetApi, dataStr_ToArray, getApplicationVersion, getStateAbbreviation, postLinux, svLnxSrvr, trimField } from '../../utilities/utilities'

import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { nrjAxiosRequest, nrjAxiosRequestBio, useNrjAxios } from '../../Hooks/useNrjAxios';
import { useGetFldValue } from "../../Hooks/useGetFldValue";
import HdrDrp from "../HdrDrp";
import { Toaster } from "../../components/reusable/Toaster";
import { getLvl, getWho } from '../../utilities/cpcb'
import moment from 'moment'
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry'
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
    NEWFRMDATA: "frmdatanw",
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

//const [state, dispatch] = useReducer(reducer, initialState);





const WrongWstBgCbwtf = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const coldef = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'cbwtfid', hide: true, width: 150, headerName: 'CBWTF ID' },
        { field: 'cbwtfnm', hide: false, width: 295, headerName: 'Name of CBWTF', filter: 'agTextColumnFilter', tooltipField: 'cbwtfnm', },
        { field: 'hcfnm', hide: true, width: 200, headerName: 'HCF', filter: 'agTextColumnFilter', tooltipField: 'cbwtfnm', },
        { field: 'state', hide: false, width: 200, headerName: 'State/UT' },
        { field: 'hcfcod', hide: false, width: 210, headerName: 'SPCB/PCC code' },
        { field: 'rgd', hide: false, width: 200, headerName: 'Regional directorate' },
        { field: 'cty', hide: true, width: 150, headerName: 'City' },
        { field: 'count', hide: false, width: 320, headerName: 'No. of times wrong SPCB/PCC code entered', tooltip: (params: { value: string; }) => "No. of times wrong SPCB/PCC code entered" + params.value }];


    const printExcelHeader = ["CBWTF", "State", "HCF", "SPCB Code", "Regional directorate", "No of attempts"]
    const KeyOrder: string[] = ['cbwtfnm', 'state', 'hcfnm', 'hcfcod', 'rgd', 'count']
    const excelColWidth = [{ wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }]

    const colDefPdf = [
        { field: 'cbwtfnm', hide: false, width: 400, headerName: 'CBWTF', filter: 'agTextColumnFilter', tooltipField: 'cbwtfnm', },
        { field: 'hcfnm', hide: false, width: 200, headerName: 'HCF' },
        { field: 'state', hide: false, width: 150, headerName: 'State/UT' },
        { field: 'hcfcod', hide: false, width: 220, headerName: 'SPCB/PCC code' },
        { field: 'rgd', hide: false, width: 250, headerName: 'Regional directorate' },
        { field: 'count', hide: false, width: 280, headerName: 'No. of times wrong SPCB/PCC code entered' }
    ]

    const pdfColWidth = ['25%', '20%', '20%', '20%', '10%', '10%']


    const { showToaster, hideToaster } = useToaster();

    const onRowSelected = (data: string) => {
        // alert(data)
    }

    const GridLoaded = () => {
    }
    const onButtonClicked = (action: string, rw: any) => {

    }


    useEffect(() => {
        refetchG()
    }, []);




    function populateGrid(data: any) {

        let dt: any = GetResponseLnx(data);
        if (dt && Array.isArray(dt) && dt.length) {
            let ary: any = dt;
            // dispatchGlobal(storeTableData(ary))
            if (ary && Array.isArray(ary)) {
                ary = trimField(ary, "cbwtfnm")
                ary = trimField(ary, "hcfnm")
                ary=trimField(ary,"rgd")
                //ary = ary.filter((res:any)=> (res.rgd != 'CHENNAI'))
                ary = [...ary].sort((a, b) => a.rgd.localeCompare(b.rgd))
                ary = [...ary].sort((a, b) => a.hcfnm.localeCompare(b.hcfnm))
                ary = [...ary].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))

                dispatch({ type: ACTIONS.NEWROWDATA, payload: ary })
            }
            setTimeout(function () {
                dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 })
            }, 500)
        }
        else {
            showToaster(['Did not find any wrong Health Care Facility Code'], 'error');
        }

        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    }

    const GetCbwtfWstList = () => {
        let lvl: string = getLvl() || "CPCB";
        let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
        let gd: any = utilities(3, "", "")
        let gid: string = gd
        let dt: string = UseMomentDateNmb(moment(Date.now()).format("DD-MMM-yyyy"));
        dispatch({ type: ACTIONS.SETGID, payload: gid })
        let payload: any = postLinux(lvl + '=' + who + '=hcfcod=' + dt, 'wronghcfcode');
        return nrjAxiosRequestBio("showWrngCountFile", payload);
    };

    const { data: data2, refetch: refetchG } = useQuery({
        queryKey: ["getQryWrongCbwtf"],
        queryFn: GetCbwtfWstList,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: populateGrid,
    });



    return (
        <>      
          <div className="flex justify-center bg-gray-100">
                <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    colDef={coldef}
                    apiCall={""}
                    rowData={[]}
                    deleteButton={""}
                    deleteFldNm={""}
                    showDataButton={''}
                    onButtonClicked={onButtonClicked}
                    showFldNm={'cbtwf'}
                    className='ag-theme-alpine-blue ag-theme-alpine'
                    trigger={state.triggerG}
                    showPagination={true}
                    newRowData={state.nwRow}
                    showExport={true}
                    prependContent={[]}
                    KeyOrder={KeyOrder}
                    lvl={getLvl()}
                    who={getWho()}
                    pageTitle={"No of attempts of HCF registration with wrong SPCB code : "}
                    sortBy={'cbwtfnm'}
                    printExcelHeader={printExcelHeader}
                    exceColWidth={excelColWidth}
                    pdfColWidth={pdfColWidth}
                    colDefPdf={colDefPdf}
                    widthSerialNoCol={100}
                ></NrjAgGrid>

            </div>

        </>

    );
}; export default React.memo(WrongWstBgCbwtf);
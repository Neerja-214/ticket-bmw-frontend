import React, { useReducer, useState } from 'react'
import axios from 'axios'
import { validForm } from '../../Hooks/validForm'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseWnds, clrFldsExcptDrpDt, createGetApi, dataStr_ToArray, getApiFromBiowaste, getStateFullForm, svLnxSrvr } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";

import WtrInput from '../../components/reusable/nw/WtrInput'
import { nrjAxios, nrjAxiosRequest, useNrjAxios } from '../../Hooks/useNrjAxios';
import { Navigate, useNavigate } from "react-router-dom";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import { Toaster } from '../../components/reusable/Toaster'
import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { useToaster } from '../../components/reusable/ToasterContext'
import { getLvl, getWho } from '../../utilities/cpcb'

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
const Srch_hcf = () => {
    //#############Constants for the State and other functions
    const [state, dispatch] = useReducer(reducer, initialState);
    const [mainId, setMainId] = useState(1);
    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const [isLoading, setIsLoading] = useState("");
    const [data1, setData1] = useState<any[]>();
    const [search, setSearch] = useState("Enter Cbwtf Pin , Mobile No, and HCF code and Click On Get Button To Search HCF");
    const reqFlds = [
        { fld: 'pnc', msg: 'Enter CBWTF Pin Code', chck: 'length' },
        { fld: 'mob', msg: 'Enter CBWTF Mobile', chck: 'length' },
        { fld: 'hcfcod', msg: 'Enter HCF Code ', chck: 'length' }
    ];
    const rowData: any[] = [];
    const onRowSelected = (data: string) => { };
    const GridLoaded = () => { };
    const onButtonClicked = (action: string, rw: any) => { };

    const coldef = [
        { field: "id", hide: true, width: 0, headerName: "" },
        { field: "hcfnm", hide: true, width: 250, headerName: "HCF name" },
        {
            field: "hcfcod",
            hide: false,
            width: 150,
            headerName: "HCF CODE",
            filter: "agTextColumnFilter",
        },
        { field: "addra", hide: false, width: 200, headerName: "Address" },
        { field: "addrb", hide: true, width: 180, headerName: "Address B" },
        { field: "addrc", hide: true, width: 150, headerName: "Address C" },
        { field: "stt", hide: false, width: 200, headerName: "State/UT" },
        { field: "eml", hide: false, width: 150, headerName: "Email" },
        { field: "nobd", hide: false, width: 180, headerName: "No of Beds" },
        { field: "bluscl", hide: false, width: 200, headerName: "Bluetooth Scale" },
        { field: "andrapp", hide: false, width: 150, headerName: "Android App" },
        { field: "rgd", hide: false, width: 180, headerName: "Rigional Directorate" },
        { field: "cty", hide: false, width: 200, headerName: "City" },
        { field: "cntprsn", hide: false, width: 180, headerName: "Contact person" },
        { field: "phn", hide: false, width: 200, headerName: "Mobile no." },
        { field: "hcftyp", hide: false, width: 150, headerName: "Category" },
        { field: "ltt", hide: false, width: 180, headerName: "Lattitude" },
        { field: "lgt", hide: false, width: 180, headerName: "Longitude" },
    ]

    const colDefPdf=[
        {
            field: "hcfcod",
            hide: false,
            width: 150,
            headerName: "HCF CODE",
            filter: "agTextColumnFilter",
        },
        { field: "addra", hide: false, width: 200, headerName: "Address" },
        { field: "stt", hide: false, width: 200, headerName: "State/UT" },
        { field: "eml", hide: false, width: 150, headerName: "Email" },
        { field: "nobd", hide: false, width: 180, headerName: "No of Beds" },
        { field: "bluscl", hide: false, width: 200, headerName: "Bluetooth Scale" },
        { field: "andrapp", hide: false, width: 150, headerName: "Android App" },
        { field: "rgd", hide: false, width: 180, headerName: "Rigional Directorate" },
        { field: "cty", hide: false, width: 200, headerName: "City" },
        { field: "cntprsn", hide: false, width: 180, headerName: "Contact person" },
        { field: "phn", hide: false, width: 200, headerName: "Mobile no." },
        { field: "hcftyp", hide: false, width: 150, headerName: "Category" },
        { field: "ltt", hide: false, width: 180, headerName: "Lattitude" },
        { field: "lgt", hide: false, width: 180, headerName: "Longitude" },
    
    ]

    const pdfColWidth=['10%','8%','5%','5%','7%','7%','10%','7%','5%','8%','5%','5%','5%','5%']

    const printExcelHeader = ["HCF CODE", "Address", "State","Email","No of Beds","Bluetooth Scale","Android App","Rigional Directorate","City","Contact person","Phone","Category","Lattitude","Longitude"]
  const KeyOrder: string[] = ['hcfcod','addra','stt','eml','nobd','bluscl','andrapp','rgd','cty','cntprsn','phn','hcftyp','ltt','lgt']
  const excelColWidth = [{ wch: 50 }, { wch: 30 }, { wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 },{ wch: 30 }]


    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };
    const { showToaster, hideToaster } = useToaster();

    const getClick = () => {
        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
        if (msg && msg[0]) {
            showToaster( msg, 'error')
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg })
            return;
        }
        setData1([])
        refetch();
    }
    const getList = () => {
        setIsLoading("Loading data...");
        let api: string = state.textDts;
        let pnc: string = getFldValue(api, "pnc")
        let mob: string = getFldValue(api, "mob")
        let hcf: string = getFldValue(api, "hcfcod")
        let endPoint: string = getApiFromBiowaste("hcfpncmob");
        let data1 = { pnc: pnc, mob: mob, hcfcod: hcf }
        return nrjAxiosRequest(endPoint, data1);
    }

    const ShowData = (dataSvd1: any) => {
        setIsLoading("")
        
        let ech: any = dataSvd1.data;
        let tempAry: any = [];
        let ary: any = [];
        if (Array.isArray(ech)) {
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
            setTimeout(function () {
                dispatch({ type: ACTIONS.NEWROWDATA, payload: ech });
            }, 800);
        } else{
        showToaster(["No data received"], "error");

        } 

        // ech.map((res:any) => {
        //     if (res) {
        //         let state:string = "";
        //         if(res["stt"]){
        //             state = getStateFullForm(res['stt']);
        //         }
        //     let tempData = {
        //       hcfnm: res["hcfnm"]??'',
        //       hcfcod: res["hcfcod"]??'',
        //       addra: res["addra"]??'',
        //       addrb: res["addrb"]??'',
        //       addrc: res["addrc"]??'',
        //       stt: state,
        //       eml: res["eml"]??'',
        //       nobd: res["nobd"]??'',
        //       bluscl: res["bluscl"]??'',
        //       andrapp: res["andrapp"]??'',
        //       rgd: res["rgd"]??'',
        //       cty: res["cty"]??'',
        //       cntpr: res["cntprsn"]??'',
        //       phn: res["phn"]??'',
        //       hcftyp: res["hcftyp"]??'',
        //       lgn: res["lgt"]??'',
        //       ltt: res["ltt"]??'',
        //     };
        //         setSearch("")
        //         tempAry.push(tempData)
        //     }else{
        //         showToaster( ['Did not find any Data'], 'success');
        //         setData1([])
        //     }
        // })

        //    setData1([tempAry]) 
        setMainId(mainId + 1)
    };

    const { data: dataSvd1, refetch: refetch } = useQuery({
        queryKey: ["svOldForm1", mainId],
        queryFn: getList,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
        // onError: ShowData
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
        <div className="bg-white   ">
            {/* <div>
          <HdrDrp hideHeader={false} formName=""></HdrDrp>
        </div> */}
            {/* <span className="text-center text-bold mt-3 text-blue-600/75">
          <h5>SEARCH HEALTH CARE FACITLIY</h5>
        </span> */}
            <div className='grid grid-cols-2 lg:grid-cols-3 my-6'>
                <div>
                    <WtrInput
                        Label='CBWTF Pin Code'
                        fldName='pnc'
                        idText='txtpnc'
                        onChange={onChangeDts}
                        dsabld={false}
                        callFnFocus=''
                        dsbKey={false}
                        upprCase={false}
                        validateFn='6[length]'
                        maxLength={6}
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        speaker={'Enter Pin Code'}
                        delayClose={1000}
                        placement='right'
                        ClssName='' ></WtrInput>
                </div>

                <div>
                    <WtrInput
                        Label='CBWTF Mobile'
                        fldName='mob'
                        idText='txtmob'
                        onChange={onChangeDts}
                        dsabld={false}
                        callFnFocus=''
                        dsbKey={false}
                        upprCase={false}
                        validateFn='10[mob]'
                        maxLength={10}
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        speaker={'Enter Mobile Number'}
                        delayClose={1000}
                        placement='bottom'
                        ClssName='' ></WtrInput>
                </div>

                <div>
                    <WtrInput
                        Label='HCF Code / Name'
                        fldName='hcfcod'
                        idText='txthcfcod'
                        onChange={onChangeDts}
                        dsabld={false}
                        callFnFocus=''
                        dsbKey={false}
                        upprCase={false}
                        validateFn=''
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        speaker={'Enter HCF Code ? Name'}
                        delayClose={1000}
                        placement='left'
                        ClssName='' ></WtrInput>
                </div>
            </div>
            <div className='flex justify-center' style={{ marginTop: "34px" }}>
                <div className='mx-2'>
                    <Button
                        size="medium"
                        style={{ backgroundColor: "#0F8EC6",textTransform: "none" }}
                        variant="contained"
                        color="success"
                        onClick={getClick}
                    >
                        Find
                    </Button>

                </div>
            </div>
            <div className="absolute font-semibold text-lg">{isLoading}</div>
            {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                <Toaster data={showMessage} className={''}></Toaster>
            </div> : <></>}
            <div className="py-4 px-4">
                {/* {data1 ? <div className='flex justify-center'>
                <div className='w-6/12'>
                <CardHospitalDisplay data ={data1}></CardHospitalDisplay>
                </div>
                </div>:<div>{search}</div>
                } */}
                <NrjAgGrid
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
                    // SerialNo={"cbwtfid"}
                    deleteFldNm={"iddel"}
                    showExport={true}
            prependContent={[]}
            KeyOrder={KeyOrder}
            lvl={getLvl()}
            who={getWho()}
            pageTitle={"Search health care facility by CBWTF information"}
            sortBy={'hcfcod'}
            printExcelHeader={printExcelHeader}
            exceColWidth={excelColWidth}
            pdfColWidth={pdfColWidth}
            colDefPdf={colDefPdf}
                ></NrjAgGrid>
            </div>
        </div>
    );
};
export default React.memo(Srch_hcf);
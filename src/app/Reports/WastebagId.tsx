import React, { useReducer, useState } from 'react'
import { validForm } from '../../Hooks/validForm'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, capitalize, clrFldsExcptDrpDt, createGetApi, dataStr_ToArray, getStateAbbreviation, postLinux, svLnxSrvr } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";
import WtrInput from '../../components/reusable/nw/WtrInput'
import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { nrjAxios, nrjAxiosRequestBio, useNrjAxios } from '../../Hooks/useNrjAxios';
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import { Toaster } from '../../components/reusable/Toaster'
import CardWasteBagDisplay from '../../components/reusable/CardWasteBagDisplay'
import { getLvl, getWho } from '../../utilities/cpcb';
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

const Wstbgid = () => {
    //#############Constants for the State and other functions
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const [isLoading , setIsLoading] = useState("");
    const [data1 , setData1] = useState<any>("");
    const [search , setSearch] = useState("Input Acknowledgement Id and Click on button to get the Data");
    const reqFlds = [
        { fld: 'wstbgid', msg: 'Enter Waste Bag label', chck: 'length' }];

   
    const GridLoaded = () => { };

    const rowData: any = [];
    const onButtonClicked = (action: string, rw: any) => { };
    const onRowSelected = (data: string) => {      };
   
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
        refetch();
    }
    const getList = () => {
        setIsLoading("Loading data...")
        
        let wstbg: string = state.textDts;
        wstbg = getFldValue(wstbg, "wstbgid")
        let api: string = "";
        let lvl : string = getLvl();
        let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
        // api = createGetApi("db=nodb|dll=xrydll|fnct=a229", wstbg + '=' + lvl + '=' + who)
        // return nrjAxios({ apiCall: api })
        const payload: any = postLinux(lvl + '=' + who + '='+ wstbg, 'wastebagid');  
        return nrjAxiosRequestBio("wstbgsrch", payload);
    }
    const ShowData = (dataSvd1: any) => {
        setIsLoading("")
        let dt: any = GetResponseLnx(dataSvd1);
        let ary: any = [];
        if (dt && dt.clr) {
            let ech: any= dt
        //     let tempData = {
        //   hcfnm: ech?.['hcfnm']??'',
        //   hcfcod: ech?.['hcfcod']??'',
        //   wt: ech?.['hcfcod']??'',
        //   clr: ech?.['clr']??'',
        //   scby: ech?.['scby']??'',
        //   state: ech?.['state']??'',
        //   rgd: ech?.['rgd']??'',
        //   cdt: ech?.['cdt']??'',
        //   ctm: ech?.['ctm']??'',
        //   msg: ech?.['msg']??'',
        //   srno: ech?.['srno']??'',
        //   lblno: ech?.['lblno']??'', 
        // };
            setSearch("")
            // ary = dataStr_ToArray(dt);
            setData1(ech)
        }
        else{
            setData1("")
        showToaster(["No data received"], "error");
        }
        // dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        // setTimeout(function () {
        //     dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
        // }, 800);

    };

    const { data: dataSvd1, refetch: refetch } = useQuery({
        queryKey: ["svOldForm1",state.mainId, state.rndm],
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
            <div className='grid grid-cols-2 lg:grid-cols-3 my-6' >
                <div>
                    <WtrInput
                        Label='Waste bag label'
                        fldName='wstbgid'
                        idText='txtwstbgid'
                        onChange={onChangeDts}
                        dsabld={false}
                        callFnFocus=''
                        dsbKey={false}
                        upprCase={false}
                        validateFn=''
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        speaker={'Enter Wast Bag Id'}
                        delayClose={1000}
                        placement='right'
                        ClssName='' ></WtrInput>
                </div>
                <div className='flex justify-center' style={{ marginTop: "34px" }}>
                    <div className='mx-2'>
                        <Button
                            size="medium"
                            style={{ backgroundColor: "#0F8EC6" ,textTransform: "none"}}
                            variant="contained"
                            color="success"
                            onClick={getClick}
                        >
                            Get
                        </Button>

                    </div>
                </div>
            </div>
            <div className=" font-semibold text-lg">{isLoading}</div>
            {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                <Toaster data={showMessage} className={''}></Toaster>
            </div> : <></>}
            <div className="py-4 px-4">
                {data1 ? <div className='grid grid-cols-10'>
                <div className='col-span-3'></div>
                    <div className='col-span-5'>
                    <CardWasteBagDisplay data ={data1}></CardWasteBagDisplay>
                    </div>
                    <div className='col-span-3'></div>
                </div>:<div></div>
                }
            </div>
        </div>
    );
}; export default React.memo(Wstbgid);
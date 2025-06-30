import React, { useReducer, useState ,useEffect,useRef} from 'react'
import axios from 'axios'
import { validForm } from '../../Hooks/validForm'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, getApiFromBiowaste, getCmpId, getStateFullFormWho, getUsrnm, postLinux, svLnxSrvr } from '../../utilities/utilities'
import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { nrjAxios, nrjAxiosRequest, nrjAxiosRequestBio, nrjAxiosRequestLinux, useNrjAxios } from '../../Hooks/useNrjAxios';
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import { Toaster } from '../../components/reusable/Toaster'
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry'
import LevelSelector from '../dshbrd/LevelSelector'
import { useToaster } from '../../components/reusable/ToasterContext'
import NrjAgBtn from "../../components/reusable/NrjAgBtn";
import { getLvl } from '../../utilities/cpcb'
import { getWho } from '../../utilities/cpcb'

import moment from "moment";
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect'
import { useEffectOnce } from 'react-use'
import { useNavigate } from 'react-router'
import NrjRsDt from '../../components/reusable/NrjRsDt';

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
    SETCBWTFCOMBO: "setCbwtfCombo",
    SETSTATECOMBO: "setStateCombo",
    SETRGDCOMBO: "setRgdCombo",
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
    cbwtfCombo: "",
    stateCombo: "",
    rgdCombo: "",
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
    cbwtfCombo: string;
    stateCombo: string;
    rgdCombo: string;
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
        case ACTIONS.SETSTATECOMBO:
            newstate.stateCombo = action.payload;
            return newstate;
        case ACTIONS.SETCBWTFCOMBO:
            newstate.cbwtfCombo = action.payload;
            return newstate;
        case ACTIONS.SETRGDCOMBO:
            newstate.rgdCombo = action.payload;
            return newstate;
        case ACTIONS.SETGID:
            newstate.gid = action.payload;
            return newstate;
    }
};


const HcfMonthlyRptCpcb = () => {

    const [loadOnDemand, setLoadOnDemand] = useState("")
    useEffectOnce(() => {
        let value1 = new Date().getFullYear()
        setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}`)
    })

    const [year, setYear] = useState("");

    const [sttValue, setSttValue] = useState<string>("");
    const [rgdValue, setRgdValue] = useState<string>("");
    const [fltr, setFltr] = useState("")
    const [who, setWho] = useState<string>("");
    const [lvl, setLvl] = useState<string>("");

    //#############Constants for the State and other functions
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] })
    const [isLoading, setIsLoading] = useState("");
    const [value, setValue] = useState(0);
    const navigate = useNavigate();
    const [cbwtfValue, setCbwtfValue] = useState<string>("");
    const [notFoundCbwtfFltr, setNotFoundCbwtfFltr] = useState<boolean>(false)

    function usePrevious(value:any) {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }

    const prevRgdValue = usePrevious(rgdValue);
    const prevStatusCode = usePrevious(sttValue);
    const prevCbwtfValue = usePrevious(cbwtfValue);
    const prevYearValue = usePrevious(year)


    const reqFlds = [{}];
    const coldef = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'spcnodf', hide: false, width: 500, headerName: 'Name of nodal officer' },
        { field: 'spcorg', hide: false, width: 500, headerName: 'Name of the organisation' },
    ];


    const GetDataValue = (data: string, fld: string) => {
        let vl: string = useGetFldValue(data, fld);
        return vl;
    }

    const GridLoaded = () => { };

    const rowData: any = [];
    const onRowSelected = (data: string) => {
    };
    const onButtonClicked = (action: string, rw: any) => {
        if (action == "Details") {
            
            sessionStorage.setItem('hcfMonthlyRpt', JSON.stringify(rw));
            navigate("/hcfMonthlyhRpt");
        }
    };
    const onChangeDts = (data: string) => {
        let fld: any = utilities(2, data, "");
        dispatch({ type: ACTIONS.FORM_DATA, payload: data })
        if (fld == 'dt_month') {
            setYear(getFldValue(data, 'dt_month'))
        }
    };


    const { showToaster, hideToaster } = useToaster();

    const getCbwtf = (stateData: string, filter: string) => {
        //let api: string = getApiFromBiowaste("cbwtfregtdy");
        let payload: any = postLinux(getLvl() + '=' + getWho() + '=' + filter, 'cbwtflistDrp')
        if (stateData) {
            payload = postLinux('STT=' + stateData.split("|")[0] + '=' + filter, 'cbwtflistDrp');
        }
        setNotFoundCbwtfFltr(true);
        return nrjAxiosRequestBio('cbwtfnmlist', payload)
    };

    
    const getCbwtfSuccess = (datacbwtf: any) => {
        if (datacbwtf && datacbwtf.status == 200 && datacbwtf.data) {
            let i: number = 0;
            let strCmbo: string = "";
            if (datacbwtf.data && Array.isArray(datacbwtf.data) && datacbwtf.data.length) {
                while (i < datacbwtf.data.length) {
                    if (strCmbo) {
                        strCmbo += "$^";
                    }
                    strCmbo += "id][" + datacbwtf.data[i]["cbwtfid"] + "=";
                    strCmbo += "txt][" + datacbwtf.data[i]["txt"];
                    i += 1;
                }
                dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: strCmbo });
                setNotFoundCbwtfFltr(false);
                return;
            }
            else {
                dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: "" });
                setNotFoundCbwtfFltr(true);
            }
        }
    };

    const { data: datacbwtf, refetch: refetchcbwtf } = useQuery({
        queryKey: ["cbwtfcombobox", sttValue, fltr],
        queryFn: () => getCbwtf(sttValue, fltr),
        enabled: true,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: getCbwtfSuccess,
    });

    const GetList = (sttValue:any, rgdValue:any, cbwtfValue:any, year:any, prevStatusCode:any, prevRgdValue:any, prevCbwtfValue:any,prevYearValue:any) => {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setTimeout(function () {
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        }, 800);
    
        let lvl;
        let who;
    
        if (( prevStatusCode !== sttValue) && (prevRgdValue === rgdValue) && (prevCbwtfValue === cbwtfValue) ) {
            // sttValue has changed, rgdValue remains unchanged
            who = sttValue;
            lvl = 'STT';
        }  if ((prevStatusCode === sttValue) &&(prevCbwtfValue === cbwtfValue) && ( prevRgdValue !== rgdValue) ) {
            // sttValue is truthy and hasn't changed, rgdValue has changed
            who = rgdValue;
            lvl = 'RGD';
        }  if ((prevStatusCode === sttValue) &&( prevRgdValue === rgdValue)&& ( prevCbwtfValue !== cbwtfValue)) {
            // sttValue is truthy and hasn't changed, cbwtfValue has changed
            who = cbwtfValue;
            lvl = 'CBWTF';
        }
       else{
       if(((year == prevYearValue) && (prevStatusCode =='' || prevStatusCode !=='') && ( prevCbwtfValue == '' || prevCbwtfValue !== '') && (rgdValue !==  prevRgdValue ))){
            who = rgdValue
            lvl = 'RGD';

        } if(rgdValue == '' && year !== prevYearValue ){
            who = 'CENTRAL';
            lvl = 'CPCB';
        }
    }
    
        let usrnm = getUsrnm();
        let cmpid = getCmpId();
        let payload = postLinux(lvl + '=' + who + "=" + year + "=hcf_mr=" + usrnm + '=' + cmpid, 'show_AR_filing')
        return nrjAxiosRequestLinux("show_AR_filing", payload);
    }
    


    const ShowData = (dataSvd1: any) => {
        
        setIsLoading("")
        let dt: any = GetResponseLnx(dataSvd1);
        if (Array.isArray(dt) && dt.length) {
            setTimeout(function () {
                dispatch({ type: ACTIONS.NEWROWDATA, payload: dt });
            }, 800);
        }
        else {
            if (rgdValue || sttValue) {
                showToaster(["No data received"],"error", );
            }
        }
    };

    const { data: dataSvd1, refetch: refetch } = useQuery({
        queryKey: ["svOldFormHcf", sttValue, rgdValue, year, cbwtfValue],
        queryFn: () => GetList(sttValue, rgdValue, cbwtfValue, year, prevStatusCode, prevRgdValue, prevCbwtfValue,prevYearValue),
        enabled: true,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false, 
        onSuccess: ShowData,
    });

    useEffectOnce(() => {
        refetch()
    })



    const GetDataRgd = () => {
        let payload: any = {};
        return nrjAxiosRequestBio('rgdlst', payload);
    };

    const rgdCombo = (datastt: any) => {
        if (datastt && datastt.status == 200 && datastt.data) {
            let i: number = 0;
            let strCmbo: string = "";
            let dt: any = GetResponseLnx(datastt);
            let ary: any = dt.data;
            while (Array.isArray(ary) && i < ary.length) {
                if (strCmbo) {
                    strCmbo += "$^";
                }
                strCmbo += "id][" + ary[i]["drpdwn"] + "=";
                strCmbo += "txt][" + ary[i]["drpdwn"];
                i += 1;
            }
            dispatch({ type: ACTIONS.SETRGDCOMBO, payload: strCmbo });
            return;
        }
    };


    const { data: datac, refetch: fetchRgd } = useQuery({
        queryKey: ["GetDataRgd"],
        queryFn: GetDataRgd,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: rgdCombo,
    });

    useEffectOnce(() => {
        fetchRgd();
    })



    const getDataState = () => {
        let payload: any = {};
        if (rgdValue) {
            payload = postLinux(rgdValue, "sttrgd");
        } else {
            payload['cmpid'] = getCmpId() || "";
            payload['usrnm'] = getUsrnm() || "";

        }
        return nrjAxiosRequestBio('sttrgd', payload)

    };

    const sttCombo = (datastt: any) => {
        if (datastt && datastt.status == 200 && datastt.data) {
            let i: number = 0;
            let sttCombo: string = "";
            let dt: string = GetResponseWnds(datastt);
            let ary: any = datastt.data.data;
            let uniqueAry = new Map();
            ary.forEach((element: any) => {
                uniqueAry.set(element.fltr, element);
            });

            uniqueAry.forEach((value: any, keys: any) => {
                if (sttCombo) {
                    sttCombo += "$^";
                }
                sttCombo += "id][" + value["fltr"] + "=";
                sttCombo += "txt][" + value["drpdwn"];
            })

            while (i < uniqueAry?.entries.length) {

                i += 1;
            }
            dispatch({ type: ACTIONS.SETSTATECOMBO, payload: sttCombo });
            return;
        }
    };

    const { data: data2, refetch: refetchState } = useQuery({
        queryKey: ["stateGet", rgdValue],
        queryFn: getDataState,
        enabled: true,
        retry: false,
        staleTime: 200,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: sttCombo
    });

    const onChangeRgd = (data: string) => {
        let fldN: any = utilities(2, data, "");
        if (fldN == 'rgdid') {
            setRgdValue(getFldValue(data, 'rgdid').split('|')[0])
        }
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const onChangeStt = (data: string) => {
        setSttValue(getFldValue(data, 'sttid').split('|')[0])
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const onChangeCbwtf = (data: string) => {
        setCbwtfValue(getFldValue(data, 'cbwtfid').split('|')[0])
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const onSearchDb = (fldnm: string, fltr: string) => {
        setFltr(fltr)
        setNotFoundCbwtfFltr(false);
    }


    return (
        <div className="bg-white">
           <div className=" font-semibold text-lg text-center ">{isLoading}</div>
            {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                <Toaster data={showMessage} className={''}></Toaster>
            </div> : <></>}

           
            <div className=" mt-4 grid grid-cols-3 gap-x-8 gap-y-4 my-4 pt-4">
                <NrjRsDt
                      format="MM-yyyy"
                      fldName="dt_month"
                      displayFormat="1"
                      idText="txtdt_month"
                      size="lg"
                      Label="Select Month"
                      selectedValue={state.frmData}
                      onChange={onChangeDts}
                      speaker={"Select Month"}
                    ></NrjRsDt>
                <WtrRsSelect
                    Label="Regional Directorate"
                    fldName="rgdid"
                    idText="txtrgdid"
                    onChange={onChangeRgd}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    loadOnDemand={state.rgdCombo}
                    allwZero={"0"}
                    fnctCall={false}
                    dbCon={"1"}
                    typr={"1"}
                    dllName={""}
                    fnctName={""}
                    parms={'0'}
                    allwSrch={true}
                    speaker={"Select Regional Directorate"}
                    delayClose={1000}
                    placement="bottom"
                    displayFormat="1"
                ></WtrRsSelect>

                <WtrRsSelect
                    Label="State/UT"
                    fldName="sttid"
                    idText="txtsttid"
                    onChange={onChangeStt}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    loadOnDemand={state.stateCombo}
                    allwZero={"0"}
                    fnctCall={true}
                    dbCon={"1"}
                    typr={"1"}
                    dllName={""}
                    fnctName={""}
                    parms={'0'}
                    allwSrch={true}
                    speaker={"Select SPCB"}
                    delayClose={1000}
                    placement="bottom"
                    displayFormat="1"
                ></WtrRsSelect>

                <WtrRsSelect
                    Label={'CBWTF'}
                    displayFormat="1"
                    fldName="cbwtfid"
                    idText="txtcbwtfid"
                    onChange={onChangeCbwtf}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    allwZero={"0"}
                    fnctCall={false}
                    dbCon={""}
                    typr={""}
                    loadOnDemand={state.cbwtfCombo}
                    dllName={""}
                    fnctName={""}
                    parms={""}
                    forceDbSearch={true}
                    allwSrch={true}
                    speaker={"Select CBWTF"}
                    onSearchDb={onSearchDb}
                    menuStyle={{ maxWidth: '400px', minWidth: '200px' }}
                ></WtrRsSelect>
            </div>

            {/* <div className=" font-semibold text-lg text-center ">{isLoading}</div> */}
            <div className="p-3 bg-white rounded-lg">
                <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    onButtonClicked={onButtonClicked}
                    showDataButton={"Details"}
                    colDef={coldef}
                    apiCall={""}
                    rowData={rowData}
                    deleteButton={""}
                    newRowData={state.nwRow}
                    trigger={state.triggerG}
                    showPagination={true}
                    showTooltips={true}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    lvl={getLvl()}
                    who={getWho()}
                    sortBy={'clr'}
                ></NrjAgGrid>
            </div>
        </div>
    );
}; export default React.memo(HcfMonthlyRptCpcb);
import React, { useEffect, useReducer, useState } from 'react'
import { validForm } from '../../../Hooks/validForm';
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseWnds, createGetApi, getApplicationVersion,dataStr_ToArray, svLnxSrvr } from '../../../utilities/utilities';
import { Button } from "@mui/material";
import { nrjAxios } from '../../../Hooks/useNrjAxios';
import NrjRsDt from '../../../components/reusable/NrjRsDt';
import NrjAgGrid from '../../../components/reusable/NrjAgGrid';
import { getFldValue } from '../../../Hooks/useGetFldValue';
import { Toaster } from '../../../components/reusable/Toaster';
import { useNavigate } from 'react-router-dom';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import GetAppIcon from '@mui/icons-material/GetApp';
import HdrDrp from '../../HdrDrp';
import LevelSelector from '../../dshbrd/LevelSelector';


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
    DISABLE:"disable"
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
    disableA : 1,
    disableB : 1,
    disableC : 1,
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
    disableA : number,
    disableB : number,
    disableC : number,
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
        case ACTIONS.DISABLE:
            if(newstate.disableA == 1){
                newstate.disableA = 0
            }else{
                newstate.disableA = 1
            }
            return newstate;
    }
};



const DailySummaryFactory = (props:{hideComp:boolean}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const reqFlds = [{ fld: 'dt_rpt', msg: 'Enter Date', chck: '' } ];
    const[showMessage, setShowMessage] = useState<any>({message:[]})    
    const [isLoading, setIsLoading] = useState("");
    const [lvl, setLvl] = useState("")
    const [who, setWho] = useState("")
    const [valueType, setValueType] = useState(0);

    const [coldef, setColdef] = useState<any[]>( [
        { field : 'id', hide : true, width:0, headerName : ''},
        { field : 'hcfid', hide : true, width:100, headerName : 'Center Id'},
        { field : 'hcf', hide : false, width:300, headerName : 'HCF'},
        // { field: 'nbd', hide: showFieldInColdef('shwbd'), width:160, headerName: 'No of Beds'},
        {
            headerName: 'HCF Total',
            children: [
                { field : 'tcnt', hide : props.hideComp, width:50, headerName : 'Bag'},
                { field : 'twt', hide : props.hideComp, width:75, headerName : 'Kg/gms'}
            ],
        },
        {
            headerName: 'CBWTF Total',
            children: [
                { field : 'tfcnt', hide : false, width:50, headerName : 'Bag'},
                { field : 'tfwt', hide : false, width:75, headerName : 'Kg/gms'}
            ],
        },
        {
            headerName: 'HCF Red',
            children: [
                { field : 'rcnt', hide : props.hideComp, width:50 ,headerName : 'Bag', cellStyle: {color:'white', 'backgroundColor': '#f87171'}},
                { field : 'rwt', hide : props.hideComp, width:75 ,headerName : 'Kg/gms', cellStyle: {color:'white', 'backgroundColor': '#f87171'}},
            ],
        },
        {
            headerName: 'HCF Yellow',
            children: [
                { field : 'ycnt', hide : props.hideComp, width:50, headerName : 'Bag',cellStyle: {color:'white', 'backgroundColor': '#fbbf24'}},
                { field : 'ywt', hide : props.hideComp, width:75, headerName : 'Kg/gms',cellStyle: {color:'white', 'backgroundColor': '#fbbf24'}}
            ],
        },
        {
            headerName: 'HCF White',
            children: [
                { field : 'wcnt', hide : props.hideComp, width:50, headerName : 'Bag'},
                { field : 'wwt', hide : props.hideComp, width:75, headerName : 'Kg/gms'}
            ],
        },
        {
            headerName: 'HCF Blue',
            children: [
                { field : 'bcnt', hide : props.hideComp, width:50, headerName : 'Bag', cellStyle: {color:'white', 'backgroundColor': '#3b82f6'}},
                { field : 'bwt', hide : props.hideComp, width:75, headerName : 'Kg/gms', cellStyle: {color:'white', 'backgroundColor': '#3b82f6'}}
            ],
        },
        {
            headerName: 'HCF Cytotoxic',
            children: [
                { field : 'ccnt', hide : props.hideComp, width:50, headerName : 'Bag', cellStyle: {color:'white', 'backgroundColor': '#f59e0b'}},
                { field : 'cwt', hide : props.hideComp, width:75, headerName : 'Kg/gms', cellStyle: {color:'white', 'backgroundColor': '#f59e0b'}}
            ],
        },
        {
            headerName: props.hideComp? 'CBWTF Red': 'Red',
            children: [
                { field : 'rfcnt', hide : false, width:50, headerName : 'Bag', cellStyle: {color:'white', 'backgroundColor': '#f87171'}},
                { field : 'rfwt', hide : false, width:75, headerName : 'Kg/gms', cellStyle: {color:'white', 'backgroundColor': '#f87171'}}
            ],
        },
        {
            headerName: props.hideComp? 'CBWTF Yellow': 'Yellow',
            children: [
                { field : 'yfcnt', hide : false, width:50, headerName : 'Bag',cellStyle: {color:'white', 'backgroundColor': '#fbbf24'}},
                { field : 'yfwt', hide : false, width:75, headerName : 'Kg/gms',cellStyle: {color:'white', 'backgroundColor': '#fbbf24'}}
            ],
        },
        {
            headerName: props.hideComp? 'CBWTF White' : 'White',
            children: [
                { field : 'wfcnt', hide : false, width:50, headerName : 'Bag'},
                { field : 'wfwt', hide : false, width:75, headerName : 'Kg/gms'}
            ],
        },
        {
            headerName: props.hideComp? 'CBWTF Blue' : 'Blue',
            children: [
                { field : 'bfcnt', hide : false, width:50, headerName : 'Bag', cellStyle: {color:'white', 'backgroundColor': '#3b82f6'}},
                { field : 'bfwt', hide : false, width:75, headerName : 'Kg/gms', cellStyle: {color:'white', 'backgroundColor': '#3b82f6'}}
            ],
        },
        {
            headerName: props.hideComp? 'CBWTF Cytotoxic' : 'Cytotoxic',
            children: [
                { field : 'cfcnt', hide : false, width:50, headerName : 'Bag', cellStyle: {color:'white', 'backgroundColor': '#f59e0b'}},
                { field : 'cfwt', hide : false, width:75, headerName : 'Kg/gms', cellStyle: {color:'white', 'backgroundColor': '#f59e0b'}}
            ],
        },
        { field : 'bsnt', hide : true, width:350, headerName : 'Bags sent to CPCB Server'},
        { field : 'bdst', hide : true, width:400, headerName : 'Bags scanned from correct distance'},
    ]);

    const GridLoaded = () => {};
    const onRowSelected = (data: string) => {
        // alert(data)
    };
    const applicationVerion: string = getApplicationVersion();

    const onButtonClicked = (action: string , rm:any) => {};
    const rowData = [{}];
    const navigate = useNavigate();
    
    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setTimeout(()=>{
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        },300)
    };
 

    const getGid = () => {
        let gd: string = state.gid;
        if (!gd) {
            let g: any = utilities(3, "", "");
            gd = g;
            dispatch({ type: ACTIONS.SETGID, payload: gd });
        }
        return gd;
    };

    const setLvlWhoData = (data: any) => {
        if (lvl == "cbwtf") {
          setValueType(0)
        }
        setLvl(data.lvl);
        setWho(data.who);
        onChangeDts(data.date)
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
        let updatedColdef = [...coldef];
        if (data.lvl == "RGD") {
          updatedColdef[2] = valueType == 0 ? { ...updatedColdef[2], headerName: "Board" } : { ...updatedColdef[2], headerName: "State/UT" }; // Update the headerName of the second element
          setColdef(updatedColdef);
    
        } else if (data.lvl.toUpperCase() == "STT") {
          updatedColdef[2] = valueType == 0 ? { ...updatedColdef[2], headerName: "State/UT" } : { ...updatedColdef[2], headerName: "CBWTF" }; // Update the headerName of the second element
          setColdef(updatedColdef);
        } else if (data.lvl == "CBWTF") {
          updatedColdef[2] = { ...updatedColdef[2], headerName: "CBWTF" };
          setColdef(updatedColdef);
        } else {
          updatedColdef[2] = valueType == 0 ? { ...updatedColdef[2], headerName: "CPCB" } : { ...updatedColdef[2], headerName: "Board" }; // Update the headerName of the second element
          setColdef(updatedColdef);
        }
      }

    const getClick = () => {
        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
        setShowMessage({message:msg,type:'error'});
        if (msg && msg[0]) {
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
            }, 2500);
            return;
        }
        setIsLoading("Data loading...");
        dispatch({type:ACTIONS.DISABLE,payload:1})
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        refetch();
    }

    const getData = () => {
        let gid  = getGid();
        dispatch({type: ACTIONS.SETGID, payload:gid})
        let dt = state.textDts;
        dt = getFldValue(dt,"dt")
        let api: string = createGetApi("db=nodb|dll=cntbkdll|fnct=c5", `${dt}=${gid}`);
        return nrjAxios({ apiCall: api });
    };


    const populateGrid = (data:any) => {
        dispatch({type:ACTIONS.DISABLE,payload:1})
        if (data && data.data && data.data[0] && data.data[0]["Data"]) {
            setIsLoading("");
            let dt: string = data.data[0]["Data"];
            let ary: any = dataStr_ToArray(dt);
            
            ary = ary.map((res: any) => {
                const bwt = res.bwt? Number(res.bwt).toFixed(3) : '0.000';
                const rwt = res.rwt? Number(res.rwt).toFixed(3) : '0.000';
                const ywt = res.ywt? Number(res.ywt).toFixed(3) : '0.000';
                const wwt = res.wwt? Number(res.wwt).toFixed(3) : '0.000';
                const cwt = res.cwt? Number(res.cwt).toFixed(3) : '0.000';
                const bfwt = res.bfwt? Number(res.bfwt).toFixed(3) : '0.000';
                const rfwt = res.rfwt? Number(res.rfwt).toFixed(3) : '0.000';
                const yfwt = res.yfwt? Number(res.yfwt).toFixed(3) : '0.000';
                const wfwt = res.wfwt? Number(res.wfwt).toFixed(3) : '0.000';
                const cfwt = res.cfwt? Number(res.cfwt).toFixed(3) : '0.000';
                const bcnt = res.bcnt? Number(res.bcnt) : 0;
                const rcnt = res.rcnt? Number(res.rcnt) : 0;
                const ycnt = res.ycnt? Number(res.ycnt) : 0;
                const wcnt = res.wcnt? Number(res.wcnt) : 0;
                const ccnt = res.ccnt? Number(res.ccnt) : 0;
                const bfcnt = res.bfcnt? Number(res.bfcnt) : 0;
                const rfcnt = res.rfcnt? Number(res.rfcnt) : 0;
                const yfcnt = res.yfcnt? Number(res.yfcnt) : 0;
                const wfcnt = res.wfcnt? Number(res.wfcnt) : 0;
                const cfcnt = res.cfcnt? Number(res.cfcnt) : 0;   
                const twt = (Number(cwt)+Number(wwt)+Number(bwt)+Number(ywt)+Number(rwt)).toFixed(3);
                const tcnt = rcnt + bcnt + wcnt + ccnt + ycnt; 
                const tfwt = (Number(cfwt)+Number(wfwt)+Number(bfwt)+Number(yfwt)+Number(rfwt)).toFixed(3);
                const tfcnt = rfcnt + bfcnt + wfcnt + cfcnt + yfcnt;             
                return { ...res, bwt, rwt, ywt, wwt, cwt, rcnt, bcnt,wcnt, ycnt, ccnt, bfwt, rfwt, yfwt, wfwt, cfwt, rfcnt, bfcnt,wfcnt, yfcnt, cfcnt, twt, tcnt, tfwt, tfcnt};
            })
            
            dispatch({ type: ACTIONS.RANDOM, payload: state.rndm+2});
            dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
          }else{
            setIsLoading("Data is not there at the moment, Inconvenience is regreted.")
            setTimeout(() => {
              setIsLoading("")
          },3000)
        }
    }
    
    const { data, refetch } = useQuery({
        queryKey: ['svQry','factory', state.rndm],
        queryFn: getData,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: populateGrid,
    })


    const PrntRep = () => {
        let gid : string = state.gid
        if(!gid){
            setShowMessage({message:["populate the data in the grid"],type:'error'});
            return;
        }
        let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g104", `${gid}=1`);
        return nrjAxios({ apiCall: api });
    };



    const ShowReprtt = (dataC : any)=>{
        let dt: string = GetResponseWnds(dataC);
        dispatch({type:ACTIONS.DISABLE,payload:1})
        if (dt && dt.indexOf('.pdf')>-1) {
            window.open(dt, "_blank")
        }
        else{
            setShowMessage({message:["Please try again after refreshing the page!"], type:'error'})
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    }

    const { data : dataC, refetch : refetchC } = useQuery({
        queryKey: ['prntRep','dailySmryFct', state.rndm],
        queryFn: PrntRep,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowReprtt,
    })

    
    const printClick = () => {   
        dispatch({type:ACTIONS.DISABLE,payload:1});
        refetchC()
    }


    return (
        <>
        {applicationVerion == '1' && <>  <div>
        <HdrDrp hideHeader={false} formName=""></HdrDrp>
      </div>
        <span className="text-center text-bold mt-3 text-blue-600/75">
          <h5>Waste Collection Report: Daily Detailed</h5>
        </span></>}
      <LevelSelector
        showCbwtf={false}
        levelSelectorData={setLvlWhoData}
        dateField={true}
        getListButton={true}
        getListOnclick={getClick}
        printButton={printClick}
      ></LevelSelector>
            <div className="absolute font-semibold text-lg mt-2">{isLoading}</div>
            {showMessage && showMessage.message.length != 0 ? <div className="py-2">
        <Toaster data={showMessage} className={''}></Toaster>
      </div>:<></>}
                <div className='my-7 py-3'>
                <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    colDef={coldef}
                    apiCall={"nodb=rowset=fnct=hospdll=102=cmpid=usrid=a=" + state.mainId + "=stm838=0="}
                    rowData={[]}
                    onButtonClicked={onButtonClicked}
                    className='ag-theme-alpine-blue ag-theme-alpine'
                    trigger={state.triggerG}
                    showPagination={true}
                    newRowData={state.nwRow}
                ></NrjAgGrid>
            </div>
        </>
    );
};
export default React.memo(DailySummaryFactory);

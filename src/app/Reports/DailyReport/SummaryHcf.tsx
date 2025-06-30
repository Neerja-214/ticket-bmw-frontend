import React, { useEffect, useReducer, useState } from 'react'
import { validForm } from '../../../Hooks/validForm';
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseWnds, createGetApi, dataStr_ToArray, getApplicationVersion, svLnxSrvr } from '../../../utilities/utilities';
import { Button } from "@mui/material";
import { nrjAxios } from '../../../Hooks/useNrjAxios';
import WtrRsSelect from '../../../components/reusable/nw/WtrRsSelect';
import NrjRsDt from '../../../components/reusable/NrjRsDt';
import NrjAgGrid from '../../../components/reusable/NrjAgGrid';
import { getFldValue } from '../../../Hooks/useGetFldValue';
import { Toaster } from '../../../components/reusable/Toaster';
import GetAppIcon from '@mui/icons-material/GetApp';
import HdrDrp from '../../HdrDrp';
import LevelSelector from '../../dshbrd/LevelSelector';
import { useToaster } from '../../../components/reusable/ToasterContext';


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
            newstate.disableA = action.payload
            return newstate;
    }
};



const DailySummaryRoute = (props: any) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const reqFlds = [{ fld: 'dt_rpt', msg: 'Enter Date', chck: '' }];
    const [showMessage, setShowMessage] = useState<any>({ message: [] })
    const [isLoading, setIsLoading] = useState("");
    const [lvl, setLvl] = useState("")
    const [who, setWho] = useState("")
    const [valueType, setValueType] = useState(0);
    const [rowData, setRowData] = useState<any[]>([]);
    const coldef2 = [
        { field: "id", hide: true, width: 0, headerName: "" },
        // { valueGetter: "hValueGetter", hide: false, width: 100, headerName: "" },
        { field: "dt", hide: false, width: 170, headerName: "Treatmant Date" },
        { field: "rtu", hide: false, width: 200, headerName: "Route Name", },
        { field: "icnt", hide: false, width: 200, headerName: "Incinerable waste count(Bags)" },
        { field: "iwt", hide: false, width: 200, headerName: "Incinerable waste Weight(Kgs)" },
        { field: "acnt", hide: false, width: 200, headerName: "Autociavable waste count(Bags)" },
        { field: "awt", hide: false, width: 200, headerName: "Autociavable waste Weight(Kgs)" },
        { field: "tcnt", hide: false, width: 200, headerName: "Total waste count(Bags)", },
        { field: "twt", hide: false, width: 200, headerName: "Total waste Weight(Kgs)" },
      ];

      const [coldef, setColdef] = useState<any[]>( [
        { field: "id", hide: true, width: 0, headerName: "" },
        // { valueGetter: "hValueGetter", hide: false, width: 100, headerName: "" },
        { field: "dt", hide: false, width: 140, headerName: "Collection Time" },
        { field: "cntr", hide: false, width: 140, headerName: "HCF name ", },
        { field: "cbwtf", hide: false, width: 110,  headerName: "SPCB/PCC Code" },
        { field: "rtu", hide: false, width: 80, headerName: "Route" },
        //{ field: "ctg", hide: false, width: 200, headerName: "HCF Type" },
        {
            headerName: 'Red',
            children: [
                { field: "rcnt", hide: false, width: 50, headerName: "Bag", cellStyle: { color: "black", backgroundColor: "#ffcccb" }, },
                { field: "rwt", hide: false, width: 75, headerName: "Kg/gms", cellStyle: { color: "black", backgroundColor: "#ffcccb" }, },
            ],
        },
        {
            headerName: 'Yellow',
            children: [
                { field: "ycnt", hide: false, width: 50, headerName: "Bag", cellStyle: { color: "black", backgroundColor: "#FDFD97" } },
                { field: "ywt", hide: false, width: 75, headerName: "Kg/gms", cellStyle: { color: "black", backgroundColor: "#FDFD97" } }
            ],
        },
       
        {
            headerName: 'Blue',
            children: [
                { field: "bcnt", hide: false, width: 50, headerName: "Bag", cellStyle: { color: "black", backgroundColor: "#ADD8E6" } },
                { field: "bwt", hide: false, width: 75, headerName: "Kg/gms", cellStyle: { color: "black", backgroundColor: "#ADD8E6" } }
            ],
        },

        {
            headerName: 'White',
            children: [
                { field: "wcnt", hide: false, width: 50, headerName: "Bag" },
                { field: "wwt", hide: false, width: 75, headerName: "Kg/gms" }
            ],
        },
        
        {
            headerName: 'Cytotoxic',
            children: [
                { field: "ccnt", hide: false, width: 50, headerName: "Bag", cellStyle: { color: "black", backgroundColor: "#FDFD97" } },
                { field: "cwt", hide: false, width: 75, headerName: "Kg/gms", cellStyle: { color: "black", backgroundColor: "#FDFD97" } }
            ],
        },
        
        {
            headerName: 'Covid',
            children: [
                { field: "cocnt", hide: false, width: 50, headerName: "Bag" },
                { field: "cowt", hide: false, width: 75, headerName: "Kg/gms" }
            ],
        },
       
        {
            headerName: 'Total',
            children: [
                { field: 'tcnt', hide: false, width: 50, headerName: 'Bag' },
                { field: 'twt', hide: false, width: 75, headerName: 'Kg/gms' },
            ],
        },
      ]);

    const [countTillNow, setCountTillNow] = useState<number>(250);
    const GridLoaded = () => { };
    const onRowSelected = (data: string) => { };
    const onButtonClicked = (action: string, rm: any) => { };
    const applicationVerion: string = getApplicationVersion();

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setRowData([]);
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        }, 300)
    };

    const GetGid = () => {
        let g: any = utilities(3, "", "");
        dispatch({ type: ACTIONS.SETGID, payload: g });
        return g;
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
      const { showToaster, hideToaster } = useToaster();

    const getClick = () => {
        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
        showToaster( msg, 'error');
        if (msg && msg[0]) {
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
            }, 2500);
            return;
        }
        setIsLoading("Data loading...");
        dispatch({ type: ACTIONS.DISABLE, payload: 0 })
        setCountTillNow(0);
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        refetch();
    }

    const GetData = () => {
        let gid  = GetGid();
        dispatch({type: ACTIONS.SETGID, payload:gid})
        let dt = state.textDts;
        dt = getFldValue(dt,"dt")

        let api: string = createGetApi("db=nodb|dll=cntbkdll|fnct=d1", `${dt}=${gid}=0`);
        return nrjAxios({ apiCall: api });
    };

    const populateGrid = (data: any) => {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        let dt: string = GetResponseWnds(data);
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        if (dt) {
          let date = state.textDts;
        date = getFldValue(date,"dt")
            setIsLoading("");
            let ary: any = dataStr_ToArray(dt);
            let summaryAry:any = {};
            for(let el of rowData){
              summaryAry[el.rtuid] = el;
            }
            let totalWeight = 0;
            ary = ary.map((res: any) => {
                totalWeight += Number(res.twt)
                const rtu: string = (res.rtu && (res.rtu == '0' || res.rtu == '1'))? 'Not Assigned': res.rtu;
                const bwt = (res.bwt && !isNaN(Number(res.bwt)))? Number(res.bwt) : 0;
                const rwt = (res.rwt && !isNaN(Number(res.rwt)))? Number(res.rwt) : 0;
                const ywt = (res.ywt && !isNaN(Number(res.ywt)))? Number(res.ywt) : 0;
                const wwt = (res.wwt && !isNaN(Number(res.wwt)))? Number(res.wwt) : 0;
                const cwt = (res.cwt && !isNaN(Number(res.cwt)))? Number(res.cwt) : 0;
                const bcnt = (res.bcnt && !isNaN(Number(res.bcnt)))?  Number(res.bcnt) : 0;
                const rcnt = (res.rcnt && !isNaN(Number(res.rcnt)))?  Number(res.rcnt) : 0;
                const ycnt = (res.ycnt && !isNaN(Number(res.ycnt)))?  Number(res.ycnt) : 0;
                const wcnt = (res.wcnt && !isNaN(Number(res.wcnt)))?  Number(res.wcnt) : 0;
                const ccnt = (res.ccnt && !isNaN(Number(res.ccnt)))?  Number(res.ccnt) : 0; 

                if(summaryAry[res.rtuid]){
                  
                    const addawt = Number(summaryAry[res.rtuid].awt) + Number(rwt) + Number(bwt);
                    const addiwt = Number(summaryAry[res.rtuid].iwt) + Number(cwt) + Number(ywt);
                    const addacnt = summaryAry[res.rtuid].acnt + rcnt + bcnt;
                    const addicnt = summaryAry[res.rtuid].icnt + ccnt + ycnt; 
                    summaryAry[res.rtuid] = { rtuid: res.rtuid, rtu: rtu, dt:date, awt:addawt.toFixed(3), iwt:addiwt.toFixed(3),  acnt:addacnt, icnt:addicnt, tcnt: addacnt + addicnt, twt:(addawt + addiwt).toFixed(3)};
                }
                else{

                    summaryAry[res.rtuid] = {rtuid: res.rtuid, rtu: rtu, dt:date, awt: (bwt+rwt).toFixed(3), iwt: (ywt+cwt).toFixed(3),  acnt: rcnt + bcnt, icnt: ycnt + ccnt, tcnt: rcnt+ bcnt + ycnt + ccnt, twt: (bwt + rwt + ywt + cwt).toFixed(3)};
                }
                console.log(summaryAry)
                return { ...res, rtu: rtu, dt: date, bwt: bwt.toFixed(3), rwt: rwt.toFixed(3), ywt: ywt.toFixed(3), wwt: wwt.toFixed(3), cwt: cwt.toFixed(3)};
            })
            console.log("totalWeight",totalWeight);
            let tempData = []
            for(let keys of Object.keys(summaryAry)){
                tempData.push(summaryAry[keys] )
            }
            setRowData(tempData);
            dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });

            if (ary && ary.length == 251) {
                setCountTillNow(countTillNow + Number(ary.length));
                setTimeout(()=>{
                    refetchS();
                },500)
            }
        } else {
            setIsLoading("Data is not there at the moment, Inconvenience is regreted.")
            setTimeout(() => {
                setIsLoading("")
            }, 3000)
        }
    }

    const GetDataSec = () => {
        let gid = state.gid
        let api: string = createGetApi("db=nodb|dll=cntbkdll|fnct=d2", `${gid}=${countTillNow}=250`);
        return nrjAxios({ apiCall: api });
    };


    const { data, refetch } = useQuery({
        queryKey: ['svQry', 'smry', state.mainId, state.rndm],
        queryFn: GetData,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: populateGrid,
    })

    const { data: data1, refetch: refetchS } = useQuery({
        queryKey: ['svQry', 'smry', state.mainId, state.rndm],
        queryFn: GetDataSec,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: populateGrid,
    })


    const PrntRep = () => {
        let gid: string = state.gid
        if (!gid) {
            showToaster( ["populate the data in the grid first"], 'error');
            return;
        }
        let dt: string = state.textDts;
        dt = getFldValue(dt, "dt")
        let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g103", `${gid}=1=1=${dt}`);
        return nrjAxios({ apiCall: api });
    };

    const ShowReprtt = (dataC: any) => {
        let dt: string = GetResponseWnds(dataC);
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        if (dt && dt.indexOf('.pdf') > -1) {
            window.open(dt, "_blank")
        }
        else {
            showToaster( ["Please try again after refreshing the page!"], 'error')
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    }

    const { data: dataC, refetch: refetchC } = useQuery({
        queryKey: ['prntRep', 'dailySmry', state.rndm],
        queryFn: PrntRep,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowReprtt,
    })


    const printClick = () => {
        dispatch({ type: ACTIONS.DISABLE, payload: 0 });
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
           <div className=" font-semibold text-lg text-center ">{isLoading}</div>
            {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                <Toaster data={showMessage} className={''}></Toaster>
            </div> : <></>}
            
            <div className=''>
                <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    colDef={coldef}
                    apiCall={""}
                    rowData={[]}
                    deleteFldNm={""}
                    onButtonClicked={onButtonClicked}
                    showPagination={true}
                    showFldNm={'cbtwf'}
                    className='ag-theme-alpine-blue ag-theme-alpine'
                    trigger={state.triggerG}
                    newRowData={state.nwRow}
                ></NrjAgGrid>
            </div>
            <div className="mt-5 text-lg font-semibold">
                Waste Received by Operator
            </div>
            <div>
                <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    colDef={coldef2}
                    apiCall={""}
                    rowData={rowData}
                    deleteFldNm={""}
                    onButtonClicked={onButtonClicked}
                    showPagination={true}
                    showFldNm={'cbtwf'}
                    className='ag-theme-alpine-blue ag-theme-alpine'
                    trigger={state.triggerG}
                    
                ></NrjAgGrid>
            </div>
        </>
    );
};
export default React.memo(DailySummaryRoute);

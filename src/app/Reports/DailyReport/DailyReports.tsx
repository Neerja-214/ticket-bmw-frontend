import React, { useEffect, useReducer, useState } from 'react'
import { validForm } from '../../../Hooks/validForm'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseWnds, createGetApi, dataStr_ToArray,   getApplicationVersion, getCmpId } from '../../../utilities/utilities'
import { nrjAxios, nrjAxiosRequest } from '../../../Hooks/useNrjAxios';
import NrjAgGrid from '../../../components/reusable/NrjAgGrid';
import { getFldValue } from '../../../Hooks/useGetFldValue';
import { Toaster } from '../../../components/reusable/Toaster';

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
            if (newstate.disableA == 1) {
                newstate.disableA = 0
            } else {
                newstate.disableA = 1
            }
            return newstate;
    }
};



const DailyReport = () => {
    const reqFlds = [{ fld: 'dt_rpt', msg: 'Enter Date', chck: '' }];
    const [showMessage, setShowMessage] = useState<any>({ message: [] })

    const [state, dispatch] = useReducer(reducer, initialState);
    const [lvl, setLvl] = useState("")
    const [who, setWho] = useState("")
    const [valueType, setValueType] = useState(0);
    const [isLoading, setIsLoading] = useState("");
    const [coldef, setColdef] = useState<any[]>([
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'cbwtf', hide: false, width: 100, headerName: 'SPCB Code' },
        { field: 'cntr', hide: false, width: 250, headerName: 'HCF' },
        { field: 'bdcnt', hide: true, width:160, headerName: 'No of Beds'},
        { field: 'dis', hide: false, width: 120, headerName: 'Distance(M) from HCF' },
        { field: 'wstid', hide: true, width: 200, headerName: 'Waste bag ID' },
        { field: 'lbln', hide: false, width: 200, headerName: 'Label number' },   
        {
            headerName: 'Red',
            children: [
                { field: 'rcnt', hide: false, width: 50, headerName: 'Bag', cellStyle: { color: 'black', 'backgroundColor': '#ffcccb' } },
                { field: 'rwt', hide: false, width: 75, headerName: 'Kg/gms', cellStyle: { color: 'black', 'backgroundColor': '#ffcccb' } },
            ],
        },
        {
            headerName: 'Yellow',
            children: [
                { field: 'ycnt', hide: false, width: 50, headerName: 'Bag', cellStyle: { color: 'black', 'backgroundColor': '#FDFD97' } },
                { field: 'ywt', hide: false, width: 75, headerName: 'Kg/gms', cellStyle: { color: 'black', 'backgroundColor': '#FDFD97' } }
            ],
        },
        {
            headerName: 'White',
            children: [
                { field: 'wcnt', hide: false, width: 50, headerName: 'Bag' },
                { field: 'wwt', hide: false, width: 75, headerName: 'Kg/gms' },
            ],
        },
        {
            headerName: 'Blue',
            children: [
                { field: 'bcnt', hide: false, width: 50, headerName: 'Bag', cellStyle: { color: 'black', 'backgroundColor': '#ADD8E6' } },
                { field: 'bwt', hide: false, width: 75, headerName: 'Kg/gms', cellStyle: { color: 'black', 'backgroundColor': '#ADD8E6' } }
            ],
        },
        {
            headerName: 'Cytotoxic',
            children: [
                { field: 'ccnt', hide: false, width: 50, headerName: 'Bag', cellStyle: { color: 'black', 'backgroundColor': '#FDFD97' } },
                { field: 'cwt', hide: false, width: 75, headerName: 'Kg/gms', cellStyle: { color: 'black', 'backgroundColor': '#FDFD97' } }
            ],
        },
        {
            headerName: 'Total',
            children: [
                { field: 'tcnt', hide: false, width: 60, headerName: 'Bag' },
                { field: 'twt', hide: false, width: 90, headerName: 'Kg/gms' },
            ],
        },
       
        { field: 'rsn', hide: true, width: 120, headerName: 'Reason' } 
        
    ]);

    const [countTillNow, setCountTillNow] = useState<number>(0);
    const GridLoaded = () => { };
    const onRowSelected = (data: string) => {
    };
    const onButtonClicked = (action: string, rm: any) => { };
    const applicationVerion: string = getApplicationVersion();

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        // dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        // dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        // setTimeout(() => {
        //   dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        // }, 300)
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
        if(state.disableA == 1){
            dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        }
        setCountTillNow(0);
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        refetch();
    }

    const getData = () => {
        let gid = GetGid();
        dispatch({ type: ACTIONS.SETGID, payload: gid })
        let dt = state.textDts;
        dt = getFldValue(dt, "dt")
        let ctg = state.textDts;
        ctg = getFldValue(dt, "ctgid")

        if (!ctg) {
            ctg = "0"
        } else {
            ctg = state.textDts;
            ctg = getFldValue(dt, "ctg")
            if (ctg.indexOf("Private") > -1) {
                ctg = "1";
            } else {
                ctg = "2"
            }
        }
        let api: string = createGetApi("db=nodb|dll=cntbkdll|fnct=dz", `${dt}=${gid}=${ctg}`);
        return nrjAxios({ apiCall: api });
    };


    const populateGrid = (data: any) => {
        if(state.disableA == 0){
            dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        let dt: string = GetResponseWnds(data);
        if (dt) {
            setIsLoading("");
            let ary: any = dataStr_ToArray(dt);
            ary = ary.map((res: any) => {
                const dis = (res.dis && !isNaN(Number(res.dis)) && Number(res.dis) > 0) ? String(res.dis) : 'Not Marked';  
                const bwt = res.bwt? Number(res.bwt).toFixed(3) : '0.000';
                const rwt = res.rwt? Number(res.rwt).toFixed(3) : '0.000';
                const ywt = res.ywt? Number(res.ywt).toFixed(3) : '0.000';
                const wwt = res.wwt? Number(res.wwt).toFixed(3) : '0.000';
                const cwt = res.cwt? Number(res.cwt).toFixed(3) : '0.000';
                const bcnt = res.bcnt? Number(res.bcnt) : 0;
                const rcnt = res.rcnt? Number(res.rcnt) : 0;
                const ycnt = res.ycnt? Number(res.ycnt) : 0;
                const wcnt = res.wcnt? Number(res.wcnt) : 0;
                const ccnt = res.ccnt? Number(res.ccnt) : 0;                
                return { ...res, dis, bwt, rwt, ywt, wwt, cwt, rcnt, bcnt,wcnt, ycnt, ccnt};
            })
            dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });

            // dispatchGlobal(storeTableData(ary))


            if (ary && ary.length == 250) {
                setCountTillNow(countTillNow + Number(ary.length));
                setTimeout(function () {
                    refetchB();
                    // refetch();
                }, 400)
            }
            setTimeout(function () {
                dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
            }, 250)

        } else {
            setIsLoading("Data is not there at the moment, Inconvenience is regreted.")
            setTimeout(() => {
                setIsLoading("")
            }, 3000)
        }
    }

    const { data, refetch } = useQuery({
        queryKey: ['svQry', state.mainId, state.rndm],
        queryFn: getData,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: populateGrid,
    })

    const GetDataSec = () => {
        let gid = state.gid
        let api: string = createGetApi("db=nodb|dll=cntbkdll|fnct=d2", `${gid}=${countTillNow}=250`);
        return nrjAxios({ apiCall: api });
    };

    const { data: dataB, refetch: refetchB } = useQuery({
        queryKey: ['nxtQry', state.rndm],
        queryFn: GetDataSec,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: populateGrid,
    })

    const PrntRep = () => {
        let gid: string = state.gid
        let dt: string = state.textDts
        dt = getFldValue(dt, "dt")
        if (!gid) {
            showToaster( ["populate the data in the grid"], 'error');
            return;
        }
        let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g103", `${gid}=0=0=${dt}=0`);
        return nrjAxios({ apiCall: api });
    };

    const ShowReprtt = (dataC: any) => {
        let dt: string = GetResponseWnds(dataC);

        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        if (dt && dt.indexOf('.pdf') > -1) {
            // dispatchGlobal(storePrintData(dt))
            window.open(dt, "_blank")
        }
        else {
            showToaster( ["Please try again after refreshing the page!"], 'error')
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    }

    const { data: dataC, refetch: refetchC } = useQuery({
        queryKey: ['prntReports'],
        queryFn: PrntRep,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowReprtt,
    })


    const printClick = () => {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        refetchC()
    }


    const ratio = [
        { maxNumber: 2, minNumber: 0, equalto: 0, color: 'red-row' },
        { maxNumber: 10, minNumber: 2, equalto: 2, color: 'yellow-row' },
        { maxNumber: 50, minNumber: 10, equalto: 10, color: 'blue-row' }
    ]

    return (
        <>
        {applicationVerion == '1' && <>  <div>
        <HdrDrp hideHeader={false} formName=""></HdrDrp>
      </div>
        <span className="text-center text-bold mt-3 text-blue-600/75">
          <h5>Waste collection report: daily detailed</h5>
        </span></>}
      <LevelSelector
        showCbwtf={false}
        levelSelectorData={setLvlWhoData}
        dateField={true}
        getListButton={true}
        getListOnclick={getClick}
        printButton={printClick}
      ></LevelSelector>
            
            <div className="absolute font-semibold text-lg">{isLoading}</div>
            {showMessage && showMessage.message.length != 0 ? <div className="relative py-2">
                <Toaster data={showMessage} className={''}></Toaster>
            </div> : <></>}
            <div className='my-7 py-4'>
                <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    colDef={coldef}
                    apiCall={""}
                    rowData={[]}
                    onButtonClicked={onButtonClicked}
                    showFldNm={'cbtwf'}
                    className='ag-theme-alpine-blue ag-theme-alpine'
                    trigger={state.triggerG}
                    showPagination={true}
                    newRowData={state.nwRow}
                //ratio={ratio}
                ></NrjAgGrid>
            </div>
        </>
    );
};
export default React.memo(DailyReport);

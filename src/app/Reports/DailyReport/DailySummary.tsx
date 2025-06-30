import React, { useReducer, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, SvgIcon } from "@mui/material";
import NrjAgGrid from '../../../components/reusable/NrjAgGrid';
import { Toaster } from '../../../components/reusable/Toaster';
import { getFldValue } from '../../../Hooks/useGetFldValue';
import NrjRsDt from '../../../components/reusable/NrjRsDt';
import WtrRsSelect from '../../../components/reusable/nw/WtrRsSelect';
import { useNavigate } from 'react-router';
import { validForm } from '../../../Hooks/validForm';
import { nrjAxios } from '../../../Hooks/useNrjAxios';
import utilities, { GetResponseWnds, createGetApi, dataStr_ToArray, getCntWtInNumbers } from '../../../utilities/utilities';
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
    NEWFRMDATA: "frmdatanw",
    DISABLE: "disable",
    FORM_DATA2: "formdata2",
    SETCOMBOSTRB: "cmbstrB",
    SETCOMBOSTRC: "cmbstrC",
    SETCBWTFCOMBO: "setCbwtfCombo",
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
    combostrB: "",
    combostrC: "",
    cbwtfCombo: "",
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
    cbwtfCombo: string;
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

            } else if (action.payload == 2) {
                if (newstate.disableB == 1) {
                    newstate.disableB = 0
                } else {
                    newstate.disableB = 1
                }
            }
            return newstate
        case ACTIONS.SETCBWTFCOMBO:
            newstate.cbwtfCombo = action.payload;
            return newstate;
    }
};


const DailySummary = (props: any) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState("")
    const [state, dispatch] = useReducer(reducer, initialState);
    let lvl: string = sessionStorage.getItem("lvl") || "CPCB";
    let who: string = sessionStorage.getItem("mainid") || '0';
    const [total, setTotal] = useState(0)
    const reqFlds = [
        { fld: 'dt_rpt', msg: 'Select From date', chck: '1[length]' },
    ];
    const coldef = [
        { field : 'id', hide : true, width:0, headerName : ''},
        { field : 'hcfcod', hide : false, width:100, headerName : 'SPCB Code'},
        { field : 'hcfnm', hide : false, width:250, headerName : 'HCF', tooltipField: 'hcfnm',},
        { field : 'scby', hide : false, width:150, headerName : 'Scan By'},
        { field : 'cty', hide : true, width:180, headerName : 'City'},
        {
            headerName: 'Red',
            children: [
                { field : 'redcnt', hide : false, width:70, headerName : 'Bag', cellStyle: {color:'black', 'background-color': '#ffcccb'}},
                { field : 'redwt', hide : false, width:100, headerName : 'Kg/gms', cellStyle: {color:'black', 'background-color': '#ffcccb'}},
            ],
        },
        {
            headerName: 'Yellow',
            children: [
                { field : 'ylwcnt', hide : false, width:70, headerName : 'Bag',cellStyle: {color:'black', 'background-color': '#FDFD97'}},
                { field : 'ylwwt', hide : false, width:100, headerName : 'Kg/gms',cellStyle: {color:'black', 'background-color': '#FDFD97'}}
            ],
        },
        {
            headerName: 'White',
            children: [
                { field : 'whtcnt', hide : false, width:70, headerName : 'Bag'},
                { field : 'whtwt', hide : false, width:100, headerName : 'Kg/gms'}
            ],
        },
        {
            headerName: 'Blue',
            children: [
                { field : 'blucnt', hide : false, width:70, headerName : 'Bag', cellStyle: {color:'black', 'background-color': '#ADD8E6'}},
                { field : 'bluwt', hide : false, width:100, headerName : 'Kg/gms', cellStyle: {color:'black', 'background-color': '#ADD8E6'}}
            ],
        },
        {
            headerName: 'Cytotoxic',
            children: [
                { field : 'cytcnt', hide : false, width:70, headerName : 'Bag', cellStyle: {color:'black', 'background-color': '#FDFD97'}},
                { field : 'cytwt', hide : false, width:100, headerName : 'Kg/gms', cellStyle: {color:'black', 'background-color': '#FDFD97'}}
            ],
        },
        {
            headerName: 'Total',
            children: [
                { field : 'totalcnt', hide : false, width:70, headerName : 'Bag'},
                { field : 'toatlwt', hide : false, width:100, headerName : 'Kg/gms'}
            ],
        },
    ];

    const [showMessage, setShowMessage] = useState<any>({ message: [] });

    const rowData: any[] = []
    const onRowSelected = (data: string) => {
    };
    const GridLoaded = () => { }
    const onButtonClicked = (action: string, rw: any) => { }

    useEffect(() => {
        const cbwtfid = sessionStorage.getItem('bagCbwtfid');
        const cbwtfnm = sessionStorage.getItem('bagCbwtfnm');
        if (cbwtfid) {
            dispatch({ type: ACTIONS.FORM_DATA, payload: `cbwtfid][${cbwtfid}=cbwtf][${cbwtfnm}` })
            getList();
        }
    }, [])

    const onChangeDts = (data: string) => {
        let fldN: any = utilities(2, data, "");
        if (fldN == 'cbwtfid') {
            sessionStorage.removeItem('bagCbwtfid');
        }
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    };
    const { showToaster, hideToaster } = useToaster();

    const svClick = () => {
        setTotal(0)
        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
        showToaster( msg, 'error');
        if (msg && msg[0]) {
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
            }, 5000);
            return;
        }
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        })
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        sessionStorage.removeItem('bagCbwtfid');
        getList();
    };


    const getList = () => {
        setIsLoading("Loading data...");
        let dt = state.textDts
        let dt_rpt: string = "";
        let dt_to: string = "";
        let cbwtfid: string = ""
        if (sessionStorage.getItem('bagCbwtfid')) {
            dt_rpt = sessionStorage.getItem("bagCbwtfFrm") || "0"
            dt_to = sessionStorage.getItem("bagCbwtfTo") || "0"
            cbwtfid = sessionStorage.getItem("bagCbwtfid") || "0";
        }
        else {
            dt_rpt = getFldValue(dt, "dt_rpt")
            dt_to = getFldValue(dt, 'dt_to');
            cbwtfid = getFldValue(dt, 'cbwtfid').split('|')[0]
        }

        let gid: any = utilities(3, "", "")
        let gd: string = gid
        dispatch({ type: ACTIONS.SETGID, payload: gd })
        let api: string = createGetApi("db=nodb|dll=x|fnct=a257", 'cbwtf=' + cbwtfid + '=' + dt_rpt + '=' + dt_to + '=' + '0' + '=' + gd);
        nrjAxios({ apiCall: api }).then((res: any) => {
            ShowData(res);
        })
    }
    const colorValues: any = {
        Red: { cnt: 'redcnt', wt: 'redwt' },
        Blue: { cnt: 'blucnt', wt: 'bluwt' },
        Yellow: { cnt: 'ylwcnt', wt: 'ylwwt' },
        Cytotoxic: { cnt: 'cytcnt', wt: 'cytwt' },
        White: { cnt: 'whtcnt', wt: 'whtwt' }
    }
    const ShowData = (dataSvd: any) => {

        setIsLoading("")
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        let dt: string = GetResponseWnds(dataSvd);
        let ary: any = [];
        if (dt) {
            ary = dataStr_ToArray(dt);
            let tempUniqueHcf: any = {};
            let temp:any = {}
            ary.forEach((res: any) => {  
                if (tempUniqueHcf[res.hcfcod]) {
                    temp[res.hcfcod].push(res);
                    let found: boolean = false;
                    tempUniqueHcf[res.hcfcod].map((el: any) => {
                        if (el.scby == res.scby) {
                            el[colorValues[res.clr].cnt] = Number(res.totalcnt);
                            el[colorValues[res.clr].wt] = Number(res.toatlwt);
                            found = true
                            return el;
                        }
                    })
                    if (!found) {
                        let clrdata: any = {}
                        clrdata = { ...res }
                        clrdata[colorValues[res.clr].cnt] = Number(res.totalcnt)
                        clrdata[colorValues[res.clr].wt] = Number(res.toatlwt)
                        tempUniqueHcf[res.hcfcod].push(clrdata)
                    }
                }
                else {
                    temp[res.hcfcod] = [res]
                    let data: any = {...res}
                    data[colorValues[res.clr].cnt] = Number(res.totalcnt);
                    data[colorValues[res.clr].wt] = Number(res.toatlwt);
                    tempUniqueHcf[res.hcfcod] = [data];
                }
            })
            let arr:any[] = [];
            let totalsum = 0;
            Object.keys(tempUniqueHcf).map((res)=>{
                tempUniqueHcf[res].forEach((el:any)=>{
                    let data = getCntWtInNumbers(el)
                    let ttlcnt = data.blucnt + data.redcnt + data.cytcnt + data.whtcnt + data.ylwcnt; 
                    let ele:any = {...el, ...data,  scby: el.scby == 'At Factory'? 'At plant': el.scby,
                    totalcnt : ttlcnt
                }
                totalsum += ttlcnt
                    arr.push(ele);
                })
               
            })
            console.log('total sum is ',totalsum);

            dispatch({ type: ACTIONS.NEWROWDATA, payload: arr });
        }
        if (dt == "" || dataSvd.data[0].Status == 'Failed') {
        showToaster(["No data received"], "error");
        }
        
    };

    // const { data, refetch: refetchTableData } = useQuery({
    //     queryKey: ["tableDataget", state.textDts ],
    //     queryFn: getList,
    //     enabled: false,
    //     retry: false,
    //     staleTime: 0,
    //     refetchOnWindowFocus: false,
    //     refetchOnReconnect: false,
    //     onSuccess: ShowData,
    // });

    const [fltr, setFltr] = useState("");
    const [warningText, setWarningText] = useState<string>("");
    const [notFoundCbwtfFltr, setNotFoundCbwtfFltr] = useState<boolean>(false)

    const onSearchDb = (fldnm: string, fltr: string) => {
        setFltr(fltr)
        setNotFoundCbwtfFltr(false);
    }

    const getCbwtf = (filter: string) => {
        let api: string = "";
        if (lvl == 'STT') {
            api = createGetApi("db=nodb|dll=x|fnct=a206", `STT=${who}`);
        }
        else if (lvl == 'RGD') {
            api = createGetApi("db=nodb|dll=x|fnct=a206", `RGD=${who}`);
        }
        else {
            api = createGetApi("db=nodb|dll=x|fnct=a206", "CPCB=Central Pollution Control Board");
        }
        if (filter) {
            api += "=" + filter
        }
        setWarningText('Please wait..');
        setNotFoundCbwtfFltr(true);

        return nrjAxios({ apiCall: api });
    };

    const getCbwtfSuccess = (datacbwtf: any) => {
        if (datacbwtf && datacbwtf.status == 200 && datacbwtf.data) {
            let i: number = 0;
            let strCmbo: string = "";
            if (datacbwtf.data && datacbwtf.data[0] && datacbwtf.data[0].Data && datacbwtf.data[0].Data.indexOf("][") > -1) {
                dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: datacbwtf.data[0].Data });
                setNotFoundCbwtfFltr(false);
                return;
            }
            else {
                setWarningText(`No CBWTF found with '${fltr}'`);
                setNotFoundCbwtfFltr(true);
            }
            while (i < datacbwtf.data.length) {
                if (strCmbo) {
                    strCmbo += "$^";
                }
                strCmbo += "id][" + datacbwtf.data[i]["cbwtfid"] + "=";
                strCmbo += "txt][" + datacbwtf.data[i]["cbwtfnm"];
                i += 1;
            }
            dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: strCmbo });
            return;
        }
    };


    const { data: datacbwtf, refetch: refetchcbwtf } = useQuery({
        queryKey: ["cbwtfcombobox", lvl, fltr],
        queryFn: () => getCbwtf(fltr),
        enabled: true,
        retry: false,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: getCbwtfSuccess,
    });





    return (
        <>

            <div className="">

                <div className="bg-white p-1 pr-2 my-3 pb-4 rounded-lg" style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12)' }}>
                    <div className="grid grid-cols-4">
                        <div className='mr-2 mt-[12px] px-4'>
                            <WtrRsSelect
                                Label={'CBWTF'}
                                displayFormat="1"
                                fldName="cbwtfid"
                                idText="txtcbwtfid"
                                onChange={onChangeDts}
                                selectedValue={state.textDts}
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
                                onSearchDb={onSearchDb}
                                menuStyle={{ maxWidth: '400px', minWidth: '200px' }}
                                drpPlacement={"rightStart"}
                            ></WtrRsSelect>
                            {(fltr && notFoundCbwtfFltr) ? <small className="ml-3 text-red-500 absolute">{warningText}</small> : <></>}
                        </div>
                        <div className='mr-2 px-4'>
                            <NrjRsDt
                                format="dd-MMM-yyyy"
                                fldName="dt_rpt"
                                displayFormat="1"
                                idText="txtdt_rpt"
                                size="lg"
                                Label="Date"
                                selectedValue={state.textDts}
                                onChange={onChangeDts}
                                speaker={"Select"}
                            ></NrjRsDt>
                        </div>
                        <div className='flex mt-10'>
                            <Button
                                size="medium"
                                style={{ backgroundColor: "#3490dc", color: '#fff',textTransform: "none"  }}
                                variant="contained"
                                color="success"
                                onClick={svClick}
                                className="me-3"
                            >
                                Get list
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="shadow rounded-lg bg-white p-3">
                    {/* {(sessionStorage.getItem('bagCbwtfid') || getFldValue(state.textDts, 'cbwtfid')) && <>
                        <div className="font-semibold text-lg p-2">
                            CBWTF: {getFldValue(state.textDts, 'cbwtfid') ? getFldValue(state.textDts, 'cbwtfid').split('|')[1] : sessionStorage.getItem('bagCbwtfnm')}
                            
                        </div>
                    </>} */}
                    <div className=" font-semibold text-lg text-center ">{isLoading}</div>
                    {showMessage && showMessage.message.length != 0 ? (
                        <div className="py-2">
                            <Toaster data={showMessage} className={""}></Toaster>
                        </div>) : (<></>)}
                    <div>
                        <NrjAgGrid
                            onButtonClicked={onButtonClicked}
                            onGridLoaded={GridLoaded}
                            onRowSelected={onRowSelected}
                            colDef={coldef}
                            apiCall={""}
                            rowData={rowData}
                            deleteButton={""}
                            deleteFldNm={""}
                            newRowData={state.nwRow}
                            trigger={state.triggerG}
                            showPagination={true}
                            className="ag-theme-alpine-blue ag-theme-alpine"
                        ></NrjAgGrid>
                    </div>
                </div>
            </div >
        </>

    );
}; export default React.memo(DailySummary);

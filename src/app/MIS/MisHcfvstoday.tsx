import React, { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import utilities, {
    GetResponseWnds,
    createGetApi,
    dataStr_ToArray
} from "../../utilities/utilities";
import { Button, Tooltip } from "@mui/material";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import {
    nrjAxios,
    useNrjAxios,
} from "../../Hooks/useNrjAxios";
import { Navigate, useNavigate } from "react-router-dom";
import HdrDrp from "../HdrDrp";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { getLvl,getWho, ttlMIS, ttlPrint } from "../../utilities/cpcb";
import { DateNmbToday } from "../../Hooks/useMomentDtArry";
import { useEffectOnce } from "react-use";
import { useToaster } from "../../components/reusable/ToasterContext";

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
    disableA: number;
    disableB: number;
    disableC: number;
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
                    newstate.disableA = 0;
                } else {
                    newstate.disableA = 1;
                }
                return newstate;
            } else if (action.payload == 2) {
                if (newstate.disableB == 1) {
                    newstate.disableB = 0;
                } else {
                    newstate.disableB = 1;
                }
                return newstate;
            }
    }
};

const Hcfvstoday = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const reqFlds = [{ fld: "dt", msg: "Enter Date", chck: "length" }];
    const [curPageCount, setCurPageCount] = useState(0);
    const [actvPage, setActvPage] = useState(0)
    const [countTillNow, setCountTillNow] = useState<number>(0);  
    const [cbwtfnm, setCBwtfnm] = useState<string>("");  
    const coldef = [
        { field: "id", hide: true, width: 0, headerName: "" },
        {
            field: "hcfnm",
            hide: false,
            width: 400,
            headerName: "HCF name",
            filter: "agTextColumnFilter",
        },
        {
            field: "hcfcod",
            hide: false,
            width: 100,
             headerName: "SPCB/PCC code",
            filter: "agTextColumnFilter",
        },
        { field: "nobd", hide: false, width: 100, headerName: "Number of beds" },
        {
            field: "hcftyp",
            hide: false,
            width: 100,
            headerName: "HCF type",
        },
        {
            field: "ltt",
            hide: false,
            width: 150,
            headerName: "Latitude",
        },
        { field: "lgt", hide: false, width: 180, headerName: "Longitude" },
        { field: "phn", hide: false, width: 180, headerName: "Mobile no." },

    ];

    // const [countTillNow, setCountTillNow] = useState<number>(250);
    const GridLoaded = () => { };
    const navigate = useNavigate();
    const onRowSelected = (data: string) => { };
    const onButtonClicked = (action: string, rm: any) => { };

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const GetGid = () => {
        let gd: string = state.gid;
        if (!gd) {
            let g: any = utilities(3, "", "");
            gd = g;
            dispatch({ type: ACTIONS.SETGID, payload: gd });
        }
        return gd;
    };
    const { showToaster, hideToaster } = useToaster();

    // const getClick = () => {
    //     let api: string = state.textDts;
    //     let msg: any = validForm(api, reqFlds);
    //     showToaster( msg, 'error');
    //     if (msg && msg[0]) {
    //         dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
    //         setTimeout(function () {
    //             dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
    //         }, 2500);
    //         return;
    //     }
    //     dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    //     refetch();
    // };
    // useEffect(() => {
    //     refetch();
    // }, [])
    const getData = () => {
        let gid = GetGid();
        dispatch({ type: ACTIONS.SETGID, payload: gid });
        let dt = state.textDts;
        dt = getFldValue(dt, "dt");
        let lvl: string = getLvl();
        let lvlfr: string = getWho();
        let api: string = createGetApi(
            "db=nodb|dll=x|fnct=a197",
            `${dt}=${lvl}=${lvlfr}=${gid}=0`
        );
        return nrjAxios({ apiCall: api });
    };

    function populateGrid(data: any) {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        let dt: string = GetResponseWnds(data);
        if (dt) {
            let ary: any = dataStr_ToArray(dt);
            dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
            setCountTillNow(countTillNow + Number(ary.length));
            dispatch({ type: ACTIONS.RANDOM, payload: 1 });
            setTimeout(function () {
                dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
            }, 1000);
        }
    }

    const { data, refetch } = useQuery({
        queryKey: ["svQry", state.mainId, state.rndm],
        queryFn: getData,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: populateGrid,
    });

    const GetCbwtf = () => {
        let gd : string = GetGid()
        
        let dtno : string = DateNmbToday();
        let cbwtfid : string = sessionStorage.getItem("hcfbdlst")||"1"
        let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a202", dtno + "=" + cbwtfid + "=" + gd );
        return nrjAxios({ apiCall: api });
    };

    const getCbwtfSUccess = (data: any) => {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        let dt: string = GetResponseWnds(data);
        if (dt) {
            let ary : any = dataStr_ToArray(dt)
            dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
            setCountTillNow(countTillNow + Number(ary.length));
        }
    };

    const { data: dataSvd2, refetch: refetchCbwtf } = useQuery({
        queryKey: ["getCbwtfIdVisited", state.mainId, state.rndm],
        queryFn: GetCbwtf,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: getCbwtfSUccess,
    });

    useEffectOnce(() => {
        let cbwfnm : string = sessionStorage.getItem("cbwtfnm")||""
        setCBwtfnm(cbwfnm)
        refetchCbwtf();
    });

    const PrntRep = () => {
        // let gid: any = utilities(3, "", "")
        // let gd: string = gid
        let gid: string = state.gid;
        if (!gid) {
            showToaster( ["populate the data in the grid"], 'error');
            return;
        }
        let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g115", `${gid}=0`);
        return nrjAxios({ apiCall: api });
    };

    const ShowReprtt = (dataC: any) => {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        if (dataC && dataC.data && dataC.data[0] && dataC.data[0]["Data"]) {
            window.open(dataC.data[0]["Data"], "_blank");
        }
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    };

    const { data: dataC, refetch: refetchC } = useQuery({
        queryKey: ["prntReports"],
        queryFn: PrntRep,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowReprtt,
    });

    function printClick() {
        dispatch({ type: ACTIONS.DISABLE, payload: 1 });
        refetchC();
    }

    const parentPagination = (data: any) => {
        let pgCnt: number = data.api.paginationProxy.totalPages;
        let curPg: number = data.api.paginationProxy.currentPage;
        if ((countTillNow % 250)==0){
            if (pgCnt) {
    
                if (pgCnt > 0) {
                  if (curPg) {
                    setActvPage(curPg + 1)
                    let ps: number = pgCnt - curPg;
                    if (ps <= 1 && curPageCount < pgCnt) {
                      refetchB()
                      setCurPageCount(pgCnt);
                    }
                  }
                }
              }
        }
        
      };


      const GetDataSec = () => {
        let gid : string  = state.gid
        let api: string = createGetApi("db=nodb|dll=cntbkdll|fnct=d2", `${gid}=${countTillNow}=250`);
        
        return useNrjAxios({ apiCall: api });
    };
    const repopulateGrid = (dataB: any) => {
        
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        let dt: string = GetResponseWnds(dataB);
        if (dt) {
            let ary : any = dataStr_ToArray(dt)
            dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
            setCountTillNow(countTillNow + Number(ary.length));
        }
    };
    
    const { data : dataB, refetch : refetchB } = useQuery({
        queryKey: ['svQry', state.mainId, state.rndm],
        queryFn: GetDataSec,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: repopulateGrid,
    })

    return (
        <>
            <div className="bg-white">
                <div>
                    <HdrDrp hideHeader={false}></HdrDrp>
                </div>
                <Tooltip title={"Count of HCF Visited by CBWTF"}>
                    <span className="text-center text-bold text-blue-600/75 my-4">
                        <h5>Count of HCF visited by {cbwtfnm}</h5>
                    </span>
                </Tooltip>
                <div className="flex flex-wrap items-center px-12 my-3">
                    <div className="flex-grow">
                    </div>
                    <div className="flex items-center">
                    <div className="">
                                <Button
                                    size="medium"
                                    style={{
                                        backgroundColor: "#3B71CA",
                                        color: "#fff",
                                        border: "1px solid #3B71CA",
                                    }}
                                    variant="contained"
                                    color="success"
                                    // disabled={!state.disableB}
                                    onClick={() => { }}
                                >
                                    HCF 
                                </Button>
                            </div>
                            <div className="mx-4">
                                <Button
                                    size="medium"
                                    style={{
                                        backgroundColor: "#3B71CA",
                                        color: "#fff",
                                        border: "1px solid #3B71CA",
                                    }}
                                    variant="contained"
                                    color="success"
                                    // disabled={!state.disableB}
                                    onClick={() => { }}
                                >
                                    CBWTF
                                </Button>
                            </div>
                            <div className="mr-4">
                                <Button
                                    size="medium"
                                    style={{
                                        backgroundColor: "#3B71CA",
                                        color: "#fff",
                                        border: "1px solid #3B71CA",
                                        textTransform: "none"
                                    }}
                                    variant="contained"
                                    color="success"
                                    // disabled={!state.disableB}
                                    onClick={() => {}}
                                >
                                    Vehical
                                </Button>
                            </div>
                        
                        <Tooltip title={ttlPrint()}>
                            <div className="">
                                <Button
                                    size="medium"
                                    style={{
                                        backgroundColor: "#ffff",
                                        color: "#3B71CA",
                                        border: "1px solid #3B71CA",
                                         textTransform: "none"
                                    }}
                                    variant="contained"
                                    color="success"
                                    onClick={printClick}
                                >
                                    Print
                                </Button>
                            </div>
                        </Tooltip>
                    </div>
                </div>

                <div className="flex justify-between px-12 mb-2 items-center">
                    {/* <div className="text-lg font-semibold">
                        Current Level : {sessionStorage.getItem("drillnm") || "CPCB"}
                    </div> */}
                    {/* <Button
                        size="medium"
                        style={{
                            backgroundColor: "#ffff",
                            color: "#3B71CA",
                            border: "1px solid #3B71CA",
                        }}
                        variant="contained"
                        color="success"
                        disabled={!state.disableB}
                        onClick={() => {
                            navigate("/drillRgd?path=hcfvsttoday");
                        }}
                    >
                        <span className="whitespace-nowrap">Change Data Level</span>
                    </Button> */}
                </div>

                <div className="flex justify-centre px-12">
                    <NrjAgGrid
                        onGridLoaded={GridLoaded}
                        onRowSelected={onRowSelected}
                        colDef={coldef}
                        apiCall={""}
                        newRowData={state.nwRow}
                        trigger={state.triggerG}
                        rowData={[]}
                        deleteButton={""}
                        deleteFldNm={""}
                        showPagination={true}
                        showDataButton={"Waste Bags"}
                        PageSize={20}
                        className="ag-theme-alpine-blue ag-theme-alpine"
                        parentPaginationChanged={parentPagination}
                        showApi={"hcfcod|hcfcod|hcfwstbg"}
                        showFldNm={"hcfwst"}
                        
                    ></NrjAgGrid>
                </div>
                <h5 className="mt-10 px-10">Abbreviations:</h5>
            <div className=" grid grid-cols-4 px-10">

                <div> <span className="font-semibold"> BH : </span> <span> Bedded Hospital </span> </div>
                <div> <span className="font-semibold"> CL : </span> <span> Clinic </span> </div>
                <div> <span className="font-semibold"> PL : </span> <span> Pathology Laboratory </span> </div>
                <div> <span className="font-semibold"> NH : </span> <span> Nursing Home </span> </div>
                <div> <span className="font-semibold"> BB : </span> <span> Blood Bank </span> </div>
                <div> <span className="font-semibold"> DI : </span> <span> Dispensary </span> </div>
                <div> <span className="font-semibold"> AH : </span> <span> Animal House </span> </div>
                <div> <span className="font-semibold"> VH : </span> <span> Veterianry Hospital </span> </div>
                <div> <span className="font-semibold"> DH : </span> <span> Dental Hospital </span> </div>
                <div> <span className="font-semibold"> HC : </span> <span> Health Camp </span> </div>
                <div> <span className="font-semibold"> HO : </span> <span> Homeopathy </span> </div>
                <div> <span className="font-semibold"> MH : </span> <span> Mobile Hospital </span> </div>
                <div> <span className="font-semibold"> SI : </span> <span> Siddha </span> </div>
                <div> <span className="font-semibold"> UN : </span> <span> Unani </span> </div>
                <div> <span className="font-semibold"> YO : </span> <span> Yoga </span> </div>
                <div> <span className="font-semibold"> FA : </span> <span> Institutions / Schools / Companies etc With first Aid Facilitites </span> </div>

            </div>
            </div>
        </>
    );
};
export default React.memo(Hcfvstoday);

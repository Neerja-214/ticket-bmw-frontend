import React, { useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEffectOnce } from "react-use";
import utilities, {
    GetResponseWnds,
    createGetApi,
    dataStr_ToArray,
    getApplicationVersion,
} from "../../utilities/utilities";
import { nrjAxios, nrjAxiosRequest } from "../../Hooks/useNrjAxios";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import HdrDrp from "../HdrDrp";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { useNavigate } from "react-router";

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
    DSBLDTEXT: "dsbld",
    DISABLE: "disable",
    ONLYFRMDATA: "onlfrm",
    NEWFRMDATA: "frmdatanw",
    FORM_DATA2: "formdata2",
};

const initialState = {
    triggerG: 0,
    nwRow: [],
    rndm: 0,
    trigger: 0,
    textDts: "dtid][01-Jan-2023=dt][2022-2023",
    mainId: 0,
    errMsg: [],
    frmData2: "",
    textDts2: "",
    openDrwr: false,
    frmData: "dtid][01-Jan-2023=dt][2022-2023",
    disableA: 1,
    disableB: 1,
    disableC: 1,
};

type purBill = {
    triggerG: number;
    nwRow: any;
    rndm: number;
    textDts2: string;
    trigger: number;
    textDts: string;
    mainId: number;
    errMsg: any;
    frmData2: string;
    openDrwr: boolean;
    frmData: string;
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
        case ACTIONS.ONLYFRMDATA:
            newstate.frmData = action.payload;
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
            newstate.textDts = action.payload;
            return newstate;
        case ACTIONS.CHECK_REQ:
            newstate.errMsg = action.payload;
            newstate.openDrwr = true;
            return newstate;
        case ACTIONS.CHECK_REQDONE:
            newstate.errMsg = [];
            newstate.openDrwr = false;
            return newstate;
        case ACTIONS.NEWFRMDATA:
            newstate.textDts = action.payload;
            return newstate;
        case ACTIONS.DISABLE:
            if (action.payload == 1) {
                if (newstate.disableA == 1) {
                    newstate.disableA = 0;
                }
                else {
                    newstate.disableA = 1;
                }
            }
            else if (action.payload == 2) {
                if (newstate.disableB == 1) {
                    newstate.disableB = 0;
                }
                else {
                    newstate.disableB = 1;
                }
            } else if (action.payload == 3) {
                if (newstate.disableC == 1) {
                    newstate.disableC = 0;
                }
                else {
                    newstate.disableC = 1;
                }
            }
            return newstate;
    }
};

const AllStateReport = () => {

    const [state, dispatch] = useReducer(reducer, initialState);
    const colDef = [{
        field: "stt",
        hidden: true,
        width: 500,
        headerName: "State/UT",
    }]
    const [states, setStates] = useState([
    ]);

    const onChangeDts2 = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA2, payload: data });
    };


    const getDataState = () => {
        let api: string = createGetApi("db=nodb|dll=hospdll|fnct=102", 'All State' + '=sll903'); // need to moodify api to get all state???????
        return nrjAxios({ apiCall: api })
      };
    
      const fillForm = (datastt: any) => {
        if (datastt && datastt.status == 200 && datastt.data) {
          let i: number = 0;
          let sttCombo: string = "";
          let dt: string = GetResponseWnds(datastt);
          let ary: any = dataStr_ToArray(dt);
          setStates(ary)
        }
      };


    const { data: dataCbwtf, refetch: refetchState } = useQuery({
        queryKey: ["getDataCbwtfList", state.mainId, state.rndm],
        queryFn: getDataState,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: fillForm,
    });

    useEffectOnce(() => {
        refetchState();
    })

    const navigate = useNavigate();
    const GridLoaded = () => { };
    const onRowSelected = (data: string) => {
    };

    const onButtonClicked = (action: string, rw: any) => {
        let dt = state.textDts;
        dt = getFldValue(state.textDts, 'dtid').split('|')[0];
        let sttid = rw.sttid;
        navigate(`/spcb_frst?id=${sttid}&dt=${dt}&name=${rw.stt}`)
    };

    const applicationVerion: string = getApplicationVersion();

    return (
        <>
            {applicationVerion == '1' && <> <div>
                <HdrDrp hideHeader={false}></HdrDrp>
            </div>
                <span className="text-center text-bold mt-3 text-blue-600/75">
                    <h5>Annual Report Form</h5>
                </span></>}


            <div className="grid grid-cols-3 mb-3 pb-3 pt-2 bg-white border rounded-lg">
                <WtrRsSelect
                    Label="Select year"
                    fldName="dtid"
                    idText="txtdtid"
                    onChange={onChangeDts2}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    allwZero={"0"}
                    fnctCall={true}
                    displayFormat="1"
                    dbCon=""
                    typr=""
                    loadOnDemand={"id][01-Jan-2023=txt][2022-2023$^id][01-Jan-2022=txt][2021-2022"}
                    //{"id][01-Jan-2001=txt][2000-2001$^id][01-Jan-2002=txt][2001-2002$^id][01-Jan-2003=txt][2002-2003$^id][01-Jan-2004=txt][2003-2004$^id][01-Jan-2005=txt][2004-2005$^id][01-Jan-2006=txt][2005-2006$^id][01-Jan-2007=txt][2006-2007$^id][01-Jan-2008=txt][2007-2008$^id][01-Jan-2009=txt][2008-2009$^id][01-Jan-2010=txt][2009-2010$^id][01-Jan-2011=txt][2010-2011$^id][01-Jan-2012=txt][2011-2012$^id][01-Jan-2013=txt][2012-2013$^id][01-Jan-2014=txt][2013-2014$^id][01-Jan-2015=txt][20014-2015$^id][01-Jan-2016=txt][2015-2016$^id][01-Jan-2017=txt][2016-2017$^id][01-Jan-2018=txt][2017-2018$^id][01-Jan-2019=txt][2018-2019$^id][01-Jan-2020=txt][2019-2020$^id][01-Jan-2021=txt][2020-2021$^id][01-Jan-2022=txt][2021-2022$^id][01-Jan-2023=txt][2022-2023$^id][01-Jan-2024=txt][2023-2024"}
                    dllName={"xrydll"}
                    fnctName={"a172"}
                    parms={""}
                    allwSrch={true}
                    speaker={"Select CBTF"}
                    delayClose={1000}
                ></WtrRsSelect>
            </div>

            <div className="bg-white border rounded-lg p-3">
                <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    onButtonClicked={onButtonClicked}
                    colDef={colDef}
                    apiCall={""}
                    rowData={states}
                    deleteButton={""}
                    deleteFldNm={""}
                    showDataButton={"See Report"}
                    showApi={""}
                    showFldNm={""}
                    newRowOnTop={false}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    trigger={state.triggerG}
                    newRowData={state.nwRow}
                    showPagination={true}
                ></NrjAgGrid>
            </div>
        </>
    );
};
export default React.memo(AllStateReport);

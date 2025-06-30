import React, { useEffect, useReducer, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, getCntWtInNumbers, getStateAbbreviation, gridAddToolTipColumn, postLinux, svLnxSrvr } from '../../utilities/utilities'
import { nrjAxios, nrjAxiosRequestBio, nrjAxiosRequestLinux } from "../../Hooks/useNrjAxios";
import { Toaster } from "../../components/reusable/Toaster";
import LevelSelector from '../dshbrd/LevelSelector';
import DisplayCbwtfDataCard from './DisplayCbwtfDataCard';
import DisplayGeoLocationDataCard from './DisplayGeoLocationDataCard';
import DisplaySerialNoDataCard from './DisplaySerialNoDataCard';
import DisplayLabelDataCard from './DisplayLabelDataCard';
import DisplayHcfDataCard from './DisplayHcfDataCard';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { getFldValue } from '../../Hooks/useGetFldValue';
import { useToaster } from '../../components/reusable/ToasterContext';

const ACTIONS = {
    TRIGGER_GRID: "grdtrigger",
    NEWROWDATA: "newrow",
    NEWROWDATAB: "newrowB",
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
};

const initialState = {
    triggerG: 0,
    nwRow: [],
    nwRowB: [],
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
};

type purBill = {
    triggerG: number;
    nwRow: any;
    nwRowB: any;
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
            newstate.triggerG += 10;
            return newstate;
        case ACTIONS.NEWROWDATAB:
            newstate.nwRowB = action.payload;
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

const DisplayDataCard = (props: any) => {
    const [isLoading, setIsLoading] = useState("")
    const [state, dispatch] = useReducer(reducer, initialState);
    const [lvl, setLvl] = useState("");
    const [who, setWho] = useState("");
    const [geoInfo, setGeoInfo] = useState({ geo: '0', nogeo: '0', prtlgeo: '0', wrnggeo: '0' });
    const { showToaster, hideToaster } = useToaster();
    const [cbwtfInfo, setCbwtfInfo] = useState<any>({ bedded: '0', nonbedded: '0', hcfcount: '0', vstd: 0, nvstd: 0 });
    const [isRoundFigure,setIsRoundFigure]=useState(true)

    const [serialNoInfo, setSerialNoInfo] = useState({
        srno: '0', nosrno: '0', redsrno: '0',
        rednosrno: '0',
        ylwsrno: '0',
        ylwnosrno: '0',
        blusrno: '0',
        blunosrno: '0',
        cytsrno: '0',
        cytnosrno: '0',
        whtsrno: '0',
        whtnosrno: '0',
    })
    const [labelInfo, setLabelInfo] = useState<any>({
        lbl: '0', nolbl: '0',
        redlbl: 0,
        ylwlbl: 0,
        blulbl: 0,
        cytlbl: 0,
        whtlbl: 0,
        rednolbl: 0,
        ylwnolbl: 0,
        blunolbl: 0,
        cytnolbl: 0,
        whtnolbl: 0
    })

    const [scnbyFct, setScnbyFct] = useState({ redcnt: 0, ylwcnt: 0, blucnt: 0, whtcnt: 0, cytcnt: 0, redwt: 0, ylwwt: 0, bluwt: 0, whtwt: 0, cytwt: 0 })
    const [scnbyHcf, setScnbyHcf] = useState({ redcnt: 0, ylwcnt: 0, blucnt: 0, whtcnt: 0, cytcnt: 0, redwt: 0, ylwwt: 0, bluwt: 0, whtwt: 0, cytwt: 0 })
    const [scnbySup, setScnbySup] = useState({ redcnt: 0, ylwcnt: 0, blucnt: 0, whtcnt: 0, cytcnt: 0, redwt: 0, ylwwt: 0, bluwt: 0, whtwt: 0, cytwt: 0 })


    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const svClick = () => {
        clearVariable();
        if (who == 'Select a CBWTF to get data') {
            showToaster(['Select from the above dropdowns'], 'error');
            return;
        }
        else if (lvl != 'CBWTF') {
            showToaster(['Select a CBWTF to get data'], 'error');
            return;
        }
        setTimeout(() => {
            refetch();
        }, 400)
    };

    const getList = () => {
        setIsLoading("Loading data...")
        // let api: string = createGetApi("db=nodb|dll=x|fnct=a238", `${lvl}=${who}`);
        // return nrjAxios({ apiCall: api });

        let dt = state.textDts
        let dtno = UseMomentDateNmb(getFldValue(dt, "dt_rpt"));
        let payload: any = postLinux(lvl + "=" + who + "=" + dtno, 'display_cbwtf_data');
        return nrjAxiosRequestBio("display_cbwtf_data", payload);
    }

    const ShowData = (dataSvd1: any) => {
        setIsLoading("")
        let dt: string = GetResponseLnx(dataSvd1);

        let ary: any = []
        if (dataSvd1.data) {
            let total = 0;
            // ary = dt.split('|=|');
            // ary = ary.map((res: any) => {
            //     return dataStr_ToArray(res);
            // })

            ary = dataSvd1.data

            let visited = ary[1][0].visitedcnt > ary[0][0].hcfcount ? ary[0][0].hcfcount : ary[1][0].visitedcnt
            let nonVisited = Number(ary[0][0].hcfcount) - Number(visited)

            setCbwtfInfo({
                bedded: ary[0][0].bedded ? ary[0][0].bedded : 0,
                nonbedded: ary[0][0].nonbedded ? ary[0][0].nonbedded : 0,
                hcfcount: ary[0][0].hcfcount ? ary[0][0].hcfcount : 0,
                vstd: visited ? visited : 0,
                nvstd: nonVisited ? nonVisited : 0
            })
            let geoLocation: any = {
                geo: 0,
                nogeo: 0,
                wrnggeo: 0,
                prtlgeo: 0
            }
            if (ary[5] && Array.isArray(ary[5]) && ary[5].length && Array.isArray(ary[5][0]) && ary[5][0].length) {
                ary[5][0].forEach((res: any) => {
                    geoLocation.geo += !isNaN(Number(res.corgeono)) ? Number(res.corgeono) : 0;
                    geoLocation.wrnggeo += !isNaN(Number(res.wrnggeo)) ? Number(res.wrnggeo) : 0;
                    geoLocation.prtlgeo += !isNaN(Number(res.prtlgeo)) ? Number(res.prtlgeo) : 0;
                    geoLocation.nogeo += !isNaN(Number(res.nogeo)) ? Number(res.nogeo) : 0;
                })
            }


            setGeoInfo({
                geo: geoLocation.geo,
                wrnggeo: geoLocation.wrnggeo,
                prtlgeo: geoLocation.prtlgeo,
                nogeo: geoLocation.nogeo
            })

            setSerialNoInfo({
                srno: ary[3][0].srno ? ary[3][0].srno : 0,
                redsrno: ary[3][0]?.redsrno ? ary[3][0].redsrno : 0,
                rednosrno: ary[3][0]?.rednosrno ? ary[3][0].rednosrno : 0,
                ylwsrno: ary[3][0]?.ylwsrno ? ary[3][0].ylwsrno : 0,
                ylwnosrno: ary[3][0]?.ylwnosrno ? ary[3][0].ylwnosrno : 0,
                blusrno: ary[3][0]?.blusrno ? ary[3][0].blusrno : 0,
                blunosrno: ary[3][0]?.blunosrno ? ary[3][0].blunosrno : 0,
                cytsrno: ary[3][0]?.cytsrno ? ary[3][0].cytsrno : 0,
                cytnosrno: ary[3][0]?.cytnosrno ? ary[3][0].cytnosrno : 0,
                whtsrno: ary[3][0]?.whtsrno ? ary[3][0].whtsrno : 0,
                whtnosrno: ary[3][0]?.whtnosrno ? ary[3][0].whtnosrno : 0,
                nosrno: ary[3][0]?.nosrno ? ary[3][0].nosrno : 0,
            })
            setLabelInfo({
                lbl: ary[4][0]?.lbl ? ary[4][0].lbl : 0,
                redlbl: ary[4][0]?.redlbl ? ary[4][0].redlbl : 0,
                ylwlbl: ary[4][0]?.ylwlbl ? ary[4][0].ylwlbl : 0,
                blulbl: ary[4][0]?.blulbl ? ary[4][0].blulbl : 0,
                cytlbl: ary[4][0]?.cytlbl ? ary[4][0].cytlbl : 0,
                whtlbl: ary[4][0]?.whtlbl ? ary[4][0].whtlbl : 0,
                nolbl: ary[4][0]?.nolbl ? ary[4][0]?.nolbl : 0,
                rednolbl: ary[4][0]?.rednolbl ? ary[4][0]?.rednolbl : 0,
                ylwnolbl: ary[4][0]?.ylwnolbl ? ary[4][0]?.ylwnolbl : 0,
                blunolbl: ary[4][0]?.blunolbl ? ary[4][0]?.blunolbl : 0,
                cytnolbl: ary[4][0]?.cytnolbl ? ary[4][0]?.cytnolbl : 0,
                whtnolbl: ary[4][0]?.whtnolbl ? ary[4][0]?.whtnolbl : 0,
            })

            let tempScanbySup = scnbySup
            let tempScanbyHcf = scnbyHcf
            let tempScanbyFct = scnbyFct

            tempScanbySup = {
                redcnt: (ary[6][0]?.redcnt ? Number(ary[6][0]?.redcnt) : 0) + (ary[6][1]?.redcnt ? Number(ary[6][1]?.redcnt) : 0),
                ylwcnt: (ary[6][0]?.ylwcnt ? Number(ary[6][0]?.ylwcnt) : 0) + (ary[6][1]?.ylwcnt ? Number(ary[6][1]?.ylwcnt) : 0),
                blucnt: (ary[6][0]?.blucnt ? Number(ary[6][0]?.blucnt) : 0) + (ary[6][1]?.blucnt ? Number(ary[6][1]?.blucnt) : 0),
                whtcnt: (ary[6][0]?.whtcnt ? Number(ary[6][0]?.whtcnt) : 0) + (ary[6][1]?.whtcnt ? Number(ary[6][1]?.whtcnt) : 0),
                cytcnt: (ary[6][0]?.cytcnt ? Number(ary[6][0]?.cytcnt) : 0) + (ary[6][1]?.cytcnt ? Number(ary[6][1]?.cytcnt) : 0),
                // redwt: (ary[6][0]?.redwt ? Number(ary[6][0]?.redwt) : 0) + (ary[6][1]?.redwt ? Number(ary[6][1]?.redwt) : 0),
                // ylwwt: (ary[6][0]?.ylwwt ? Number(ary[6][0]?.ylwwt) : 0) + (ary[6][1]?.ylwwt ? Number(ary[6][1]?.ylwwt) : 0),
                // bluwt: (ary[6][0]?.bluwt ? Number(ary[6][0]?.bluwt) : 0) + (ary[6][1]?.bluwt ? Number(ary[6][1]?.bluwt) : 0),
                // whtwt: (ary[6][0]?.whtwt ? Number(ary[6][0]?.whtwt) : 0) + (ary[6][1]?.whtwt ? Number(ary[6][1]?.whtwt) : 0),
                // cytwt: (ary[6][0]?.cytwt ? Number(ary[6][0]?.cytwt) : 0) + (ary[6][1]?.cytwt ? Number(ary[6][1]?.cytwt) : 0),
                redwt: Math.round((ary[6][0]?.redwt ? Number(ary[6][0]?.redwt) : 0) + (ary[6][1]?.redwt ? Number(ary[6][1]?.redwt) : 0)),
                ylwwt: Math.round((ary[6][0]?.ylwwt ? Number(ary[6][0]?.ylwwt) : 0) + (ary[6][1]?.ylwwt ? Number(ary[6][1]?.ylwwt) : 0)),
                bluwt: Math.round((ary[6][0]?.bluwt ? Number(ary[6][0]?.bluwt) : 0) + (ary[6][1]?.bluwt ? Number(ary[6][1]?.bluwt) : 0)),
                whtwt: Math.round((ary[6][0]?.whtwt ? Number(ary[6][0]?.whtwt) : 0) + (ary[6][1]?.whtwt ? Number(ary[6][1]?.whtwt) : 0)),
                cytwt: Math.round((ary[6][0]?.cytwt ? Number(ary[6][0]?.cytwt) : 0) + (ary[6][1]?.cytwt ? Number(ary[6][1]?.cytwt) : 0)),

            }

            tempScanbyHcf = {

                redcnt: (ary[6][2]?.redcnt ? Number(ary[6][2]?.redcnt) : 0) + (ary[6][3]?.redcnt ? Number(ary[6][3]?.redcnt) : 0),
                ylwcnt: (ary[6][2]?.ylwcnt ? Number(ary[6][2]?.ylwcnt) : 0) + (ary[6][3]?.ylwcnt ? Number(ary[6][3]?.ylwcnt) : 0),
                blucnt: (ary[6][2]?.blucnt ? Number(ary[6][2]?.blucnt) : 0) + (ary[6][3]?.blucnt ? Number(ary[6][3]?.blucnt) : 0),
                whtcnt: (ary[6][2]?.whtcnt ? Number(ary[6][2]?.whtcnt) : 0) + (ary[6][3]?.whtcnt ? Number(ary[6][3]?.whtcnt) : 0),
                cytcnt: (ary[6][2]?.cytcnt ? Number(ary[6][2]?.cytcnt) : 0) + (ary[6][3]?.cytcnt ? Number(ary[6][3]?.cytcnt) : 0),
                // redwt: (ary[6][2]?.redwt ? Number(ary[6][2]?.redwt) : 0) + (ary[6][3]?.redwt ? Number(ary[6][3]?.redwt) : 0),
                // ylwwt: (ary[6][2]?.ylwwt ? Number(ary[6][2]?.ylwwt) : 0) + (ary[6][3]?.ylwwt ? Number(ary[6][3]?.ylwwt) : 0),
                // bluwt: (ary[6][2]?.bluwt ? Number(ary[6][2]?.bluwt) : 0) + (ary[6][3]?.bluwt ? Number(ary[6][3]?.bluwt) : 0),
                // whtwt: (ary[6][2]?.whtwt ? Number(ary[6][2]?.whtwt) : 0) + (ary[6][3]?.whtwt ? Number(ary[6][3]?.whtwt) : 0),
                // cytwt: (ary[6][2]?.cytwt ? Number(ary[6][2]?.cytwt) : 0) + (ary[6][3]?.cytwt ? Number(ary[6][3]?.cytwt) : 0),
                redwt: Math.round((ary[6][2]?.redwt ? Number(ary[6][2]?.redwt) : 0) + (ary[6][3]?.redwt ? Number(ary[6][3]?.redwt) : 0)),
                ylwwt: Math.round((ary[6][2]?.ylwwt ? Number(ary[6][2]?.ylwwt) : 0) + (ary[6][3]?.ylwwt ? Number(ary[6][3]?.ylwwt) : 0)),
                bluwt: Math.round((ary[6][2]?.bluwt ? Number(ary[6][2]?.bluwt) : 0) + (ary[6][3]?.bluwt ? Number(ary[6][3]?.bluwt) : 0)),
                whtwt: Math.round((ary[6][2]?.whtwt ? Number(ary[6][2]?.whtwt) : 0) + (ary[6][3]?.whtwt ? Number(ary[6][3]?.whtwt) : 0)),
                cytwt: Math.round((ary[6][2]?.cytwt ? Number(ary[6][2]?.cytwt) : 0) + (ary[6][3]?.cytwt ? Number(ary[6][3]?.cytwt) : 0)),

            }

            tempScanbyFct = {
                redcnt: (ary[6][4]?.redcnt ? Number(ary[6][4]?.redcnt) : 0) + (ary[6][5]?.redcnt ? Number(ary[6][5]?.redcnt) : 0),
                ylwcnt: (ary[6][4]?.ylwcnt ? Number(ary[6][4]?.ylwcnt) : 0) + (ary[6][5]?.ylwcnt ? Number(ary[6][5]?.ylwcnt) : 0),
                blucnt: (ary[6][4]?.blucnt ? Number(ary[6][4]?.blucnt) : 0) + (ary[6][5]?.blucnt ? Number(ary[6][5]?.blucnt) : 0),
                whtcnt: (ary[6][4]?.whtcnt ? Number(ary[6][4]?.whtcnt) : 0) + (ary[6][5]?.whtcnt ? Number(ary[6][5]?.whtcnt) : 0),
                cytcnt: (ary[6][4]?.cytcnt ? Number(ary[6][4]?.cytcnt) : 0) + (ary[6][5]?.cytcnt ? Number(ary[6][5]?.cytcnt) : 0),
                // redwt: (ary[6][4]?.redwt?Number(ary[6][4]?.redwt):0) + (ary[6][5]?.redwt?Number(ary[6][5]?.redwt):0),
                // ylwwt: (ary[6][4]?.ylwwt?Number(ary[6][4]?.ylwwt):0) + (ary[6][5]?.ylwwt?Number(ary[6][5]?.ylwwt):0),                      
                // bluwt: (ary[6][4]?.bluwt?Number(ary[6][4]?.bluwt):0) + (ary[6][5]?.bluwt?Number(ary[6][5]?.bluwt):0),                     
                // whtwt: (ary[6][4]?.whtwt?Number(ary[6][4]?.whtwt):0) + (ary[6][5]?.whtwt?Number(ary[6][5]?.whtwt):0),                    
                // cytwt: (ary[6][4]?.cytwt?Number(ary[6][4]?.cytwt):0) + (ary[6][5]?.cytwt?Number(ary[6][5]?.cytwt):0),      
                redwt: Math.round((ary[6][4]?.redwt ? Number(ary[6][4]?.redwt) : 0) + (ary[6][5]?.redwt ? Number(ary[6][5]?.redwt) : 0)),
                ylwwt: Math.round((ary[6][4]?.ylwwt ? Number(ary[6][4]?.ylwwt) : 0) + (ary[6][5]?.ylwwt ? Number(ary[6][5]?.ylwwt) : 0)),
                bluwt: Math.round((ary[6][4]?.bluwt ? Number(ary[6][4]?.bluwt) : 0) + (ary[6][5]?.bluwt ? Number(ary[6][5]?.bluwt) : 0)),
                whtwt: Math.round((ary[6][4]?.whtwt ? Number(ary[6][4]?.whtwt) : 0) + (ary[6][5]?.whtwt ? Number(ary[6][5]?.whtwt) : 0)),
                cytwt: Math.round((ary[6][4]?.cytwt ? Number(ary[6][4]?.cytwt) : 0) + (ary[6][5]?.cytwt ? Number(ary[6][5]?.cytwt) : 0)),

            }

            // ary[0]?.map((res: any, i: number) => {

            //     console.log(tempScanbySup)
            //     if (res.scnby === "Supervisor") {
            //         let numData = getCntWtInNumbers(res);
            //         tempScanbySup = {
            //             redcnt: tempScanbySup.redcnt + numData.redcnt,  
            //             ylwcnt: tempScanbySup.ylwcnt + numData.ylwcnt,  
            //             blucnt: tempScanbySup.blucnt + numData.blucnt,    
            //             whtcnt: tempScanbySup.whtcnt + numData.whtcnt,    
            //             cytcnt: tempScanbySup.cytcnt + numData.cytcnt,    
            //             redwt: tempScanbySup.redwt + numData.redwt,   
            //             ylwwt: tempScanbySup.ylwwt + numData.ylwwt,                        
            //             bluwt: tempScanbySup.bluwt + numData.bluwt,                      
            //             whtwt: tempScanbySup.whtwt + numData.whtwt,                    
            //             cytwt: tempScanbySup.cytwt + numData.cytwt,              
            //         }
            //         console.log(tempScanbySup);
            //     } else if (res.scnby === "By HCF") {
            //         let numData = getCntWtInNumbers(res);
            //         tempScanbyHcf = {
            //             redcnt: tempScanbyHcf.redcnt + numData.redcnt, 
            //             ylwcnt: tempScanbyHcf.ylwcnt + numData.ylwcnt,
            //             blucnt: tempScanbyHcf.blucnt + numData.blucnt,
            //             whtcnt: tempScanbyHcf.whtcnt + numData.whtcnt,
            //             cytcnt: tempScanbyHcf.cytcnt + numData.cytcnt,
            //             redwt: tempScanbyHcf.redwt + numData.redwt,
            //             ylwwt: tempScanbyHcf.ylwwt + numData.ylwwt,                      
            //             bluwt: tempScanbyHcf.bluwt + numData.bluwt,                     
            //             whtwt: tempScanbyHcf.whtwt + numData.whtwt,                    
            //             cytwt: tempScanbyHcf.cytwt + numData.cytwt,              
            //         }
            //     } else if (res.scnby === "At Factory") {
            //         let numData = getCntWtInNumbers(res);
            //         tempScanbyFct = {
            //             redcnt: tempScanbyFct.redcnt + numData.redcnt, 
            //             ylwcnt: tempScanbyFct.ylwcnt + numData.ylwcnt,
            //             blucnt: tempScanbyFct.blucnt + numData.blucnt,
            //             whtcnt: tempScanbyFct.whtcnt + numData.whtcnt,
            //             cytcnt: tempScanbyFct.cytcnt + numData.cytcnt,
            //             redwt: tempScanbyFct.redwt + numData.redwt,
            //             ylwwt: tempScanbyFct.ylwwt + numData.ylwwt,                      
            //             bluwt: tempScanbyFct.bluwt + numData.bluwt,                     
            //             whtwt: tempScanbyFct.whtwt + numData.whtwt,                    
            //             cytwt: tempScanbyFct.cytwt + numData.cytwt,              
            //         }
            //     }

            // })
            setScnbyFct(tempScanbyFct);
            setScnbyHcf(tempScanbyHcf);
            setScnbySup(tempScanbySup);

        }
        if (dataSvd1.data[0].Status == 'Failed') {
           showToaster(["No data received"], "error");
        }
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setTimeout(function () {
            dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
        }, 800);
    };


    const { data: dataSvd1, refetch: refetch } = useQuery({
        queryKey: ["svOldForm1", lvl, who],
        queryFn: getList,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });

    const clearVariable = () => {
        setGeoInfo({ geo: '0', nogeo: '0', prtlgeo: '0', wrnggeo: '0' })
        setCbwtfInfo({ bedded: '0', nonbedded: '0', hcfcount: '0', vstd: 0, nvstd: 0 });
        setSerialNoInfo({
            srno: '0', nosrno: '0', redsrno: '0',
            rednosrno: '0',
            ylwsrno: '0',
            ylwnosrno: '0',
            blusrno: '0',
            blunosrno: '0',
            cytsrno: '0',
            cytnosrno: '0',
            whtsrno: '0',
            whtnosrno: '0',
        })
        setLabelInfo({
            lbl: '0', nolbl: '0', redlbl: 0,
            ylwlbl: 0,
            blulbl: 0,
            cytlbl: 0,
            whtlbl: 0,
            rednolbl: 0,
            ylwnolbl: 0,
            blunolbl: 0,
            cytnolbl: 0,
            whtnolbl: 0
        })
        setScnbyFct({ redcnt: 0, ylwcnt: 0, blucnt: 0, whtcnt: 0, cytcnt: 0, redwt: 0, ylwwt: 0, bluwt: 0, whtwt: 0, cytwt: 0 })
        setScnbyHcf({ redcnt: 0, ylwcnt: 0, blucnt: 0, whtcnt: 0, cytcnt: 0, redwt: 0, ylwwt: 0, bluwt: 0, whtwt: 0, cytwt: 0 })
        setScnbySup({ redcnt: 0, ylwcnt: 0, blucnt: 0, whtcnt: 0, cytcnt: 0, redwt: 0, ylwwt: 0, bluwt: 0, whtwt: 0, cytwt: 0 })

    }

    const setLvlWhoData = (data: any) => {
        setLvl(data.lvl);
        setWho(data.who);
        onChangeDts(data.date);
        clearVariable();
    }

    return (
        <>
            <div className="lg:px-4">
                <LevelSelector
                    dateField={true}
                    levelSelectorData={setLvlWhoData}
                    getListButton={true}
                    getListOnclick={svClick}
                    showToggleButton={false}
                    buttontext={"Get Data"}
                    requireCbwtf={true}
                ></LevelSelector>
            </div>

            <div className="lg:px-4">
                <div className="shadow rounded-lg bg-white">
                    <div className="font-semibold text-lg mb-2">{isLoading}</div>
                    <div className='mx-3  pt-3'>
                        <DisplayCbwtfDataCard data={cbwtfInfo}></DisplayCbwtfDataCard>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4 mb-4">
                        <div className='mx-3'>
                            <DisplayGeoLocationDataCard data={geoInfo}></DisplayGeoLocationDataCard>
                        </div>
                        <div className='mx-3'>
                            <DisplaySerialNoDataCard data={serialNoInfo}></DisplaySerialNoDataCard>
                        </div>
                        <div className='mx-3'>
                            <DisplayLabelDataCard data={labelInfo}></DisplayLabelDataCard>
                        </div>
                    </div>
                    <div>
                        <h6 className="text-1xl font-bold relative inline-block mx-3 mb-2">
                            Waste bag scanned at (HCF, during collection by operator, CBWTF)
                            {/* <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div> */}
                        </h6>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-4">
                        <div className='mx-3'>
                            <DisplayHcfDataCard name='HCF' data={scnbyHcf}></DisplayHcfDataCard>

                        </div>
                        <div className='mx-3'>
                            <DisplayHcfDataCard name='Operator' data={scnbySup}></DisplayHcfDataCard>
                        </div>
                        <div className='mx-3'>
                            <DisplayHcfDataCard name='CBWTF' data={scnbyFct}></DisplayHcfDataCard>
                        </div>
                    </div>
                </div>
            </div >
        </>

    );
}; export default React.memo(DisplayDataCard);


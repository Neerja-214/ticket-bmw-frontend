import React, { useEffect, useReducer, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, createGetApi, dataStr_ToArray, getApplicationVersion, getStateAbbreviation, getStateFullFormWho, gridAddToolTipColumn, postLinux, svLnxSrvr, trimField } from '../../utilities/utilities'
import { Box, Button, Tab, Tabs } from "@mui/material";
import { validForm } from "../../Hooks/validForm";

import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { useNavigate } from "react-router-dom";
import HdrDrp from "../HdrDrp";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios, nrjAxiosRequestBio, useNrjAxios } from "../../Hooks/useNrjAxios";
import { Toaster } from "../../components/reusable/Toaster";
import LevelSelector from '../dshbrd/LevelSelector';
import CustomTabPanel from './CustomTabPanel';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { useToaster } from '../../components/reusable/ToasterContext';
import moment from "moment";
import {parse, format, isValid} from 'date-fns'




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
    SETGIDTWO: 'setgid2'
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
    gid2:"",
    disableA: 0,
    disableB: 0,
    disableC: 0,
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
    gid2:string,
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
            newstate.triggerG = 1;
            return newstate;
        case ACTIONS.NEWROWDATAB:
            newstate.triggerG = 1;
            newstate.nwRowB = action.payload;
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
        case ACTIONS.SETGIDTWO:
            newstate.gid2 = action.payload;
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


const MisBagCntwthGeo = (props: any) => {
    const [lvl, setLvl] = useState("");
    const [who, setWho] = useState("");
    const [total , setTotal] = useState(0)
    const [state, dispatch] = useReducer(reducer, initialState);
    const [mainId, setMainId] = useState('')
    const [coldef, setColdef] = useState<any[]>([
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'cbwtfid', hide: true, width: 150, headerName: 'CBWTFID' },
        {
            field: "dt_rpt",
            hide: false,
            width: 150,
            headerName: "Date",
            filter: "agTextColumnFilter",
            valueFormatter: (params:any) => {
            
            //   let  dateSegments:any[]=[];
            //    dateSegments = params.value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g);
            //    let formattedDate = '';
          
            //    if (dateSegments) {
            //       for (let i = 0; i < dateSegments.length; i++) {
            //         const date = new Date(dateSegments[i]);
            //         if (!isNaN(date.getTime())) {
            //           formattedDate = format(date, 'dd-MMM-yyyy');
            //           break; // Stop processing after the first valid date is found
            //         }
            //       }
            //     }
              
            //     // Return the formatted date
            //     return formattedDate;



            // Extract the raw value from params
            const rawValue = params.value;
            // If no value is present, return an empty string
            if (!rawValue) return '';
            let parsedDate: Date | null = null;
            // 1. Try matching and parsing ISO-like datetime string (e.g., "2025-05-16T00:00:00")
            const isoMatch = rawValue.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            if (isoMatch) {
                parsedDate = new Date(isoMatch[0]); // Parse using native Date constructor
            }
            // 2. If ISO format didn't match or produced an invalid date,
            //    try parsing a custom "dd-MMM-yyyy" string (e.g., "16-May-2025")
            if (!parsedDate || isNaN(parsedDate.getTime())) {
                parsedDate = parse(rawValue, 'dd-MMM-yyyy', new Date());
            }
            // 3. If the parsed date is valid, format it as "dd-MMM-yyyy", else return empty string
            return isValid(parsedDate) ? format(parsedDate, 'dd-MMM-yyyy') : '';
               
            },
          },
        { field: 'cbwtfnm', hide: false, width: 280, headerName: 'Name of CBWTF', tooltipField: 'cbwtfnm', },
        { field: 'corgeono', hide: false, width: 160, headerName: 'Geolocation' },
        { field: 'nogeo', hide: false, width: 220, headerName: 'Geolocation not entered' },
        // { field: 'prtlgeo', hide: false, width: 200, headerName: 'Close To HCF' },
        { field: 'wrnggeo', hide: false, width: 200, headerName: 'Wrong geolocation' },
        {  field: 'ttl', hide: false, width: 130, headerName: 'Total' }
    ]) 

    const colDefPdf=[
        { field: 'cbwtfnm', hide: false, width: 250, headerName: 'Name of CBWTF', tooltipField: 'cbwtfnm', },
        { field: 'corgeono', hide: false, width: 200, headerName: 'Geolocation' },
        { field: 'nogeo', hide: false, width: 220, headerName: 'Geolocation not entered' },
        // { field: 'prtlgeo', hide: false, width: 200, headerName: 'Close To HCF' },
        { field: 'wrnggeo', hide: false, width: 220, headerName: 'Wrong geolocation' },
        {  field: 'ttl', hide: false, width: 200, headerName: 'Total' }
    ]
    
    const pdfColWidth=['20%','15%','20%','20%','15%']
  
  const coldefPrint = [
    { field: 'id', hide: true, width: 0, headerName: '' },
    { field: 'cbwtfid', hide: true, width: 150, headerName: 'CBWTFID' },
    { field: 'cbwtfnm', hide: false, width: 250, headerName: 'Name of CBWTF', tooltipField: 'cbwtfnm', },
    { field: 'corgeono', hide: false, width: 200, headerName: 'Geolocation' },
    { field: 'nogeo', hide: false, width: 220, headerName: 'Geolocation Not Entered' },
    { field: 'prtlgeo', hide: false, width: 200, headerName: 'Close To HCF' },
    { field: 'wrnggeo', hide: false, width: 220, headerName: 'Wrong Geolocation' },
  ]
    const reqFlds: any = [{fld:'dt_rptfrm',msg:"Select From date",chck: 'length'}];
    // const reqFlds = [{ fld: 'cbwtfid', msg: 'Select the Hospital / Lab', chck: 'length' }, { fld: 'cbwtfnm', msg: 'Enter Code', chck: 'length' }];
    const [summaryRowData, setSummaryRowData] = useState<any[]>([])
    const [detailedRowData, setDetailedRowData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState("")
    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const onRowSelected = (data: string) => { }
    const GridLoaded = () => { }
    const onButtonClicked = (action: string, rw: any) => {
        
     }

    const cellClassRulesValues = [
        {
            cellName: 'dts',
            color: 'bg-yellow-100',
            value: 'Yellow Bags',
            colorEntireRow: true
        },
        {
            cellName: 'dts',
            color: 'bg-red-100',
            value: 'Red Bags',
            colorEntireRow: true
        },
        {
            cellName: 'dts',
            color: 'bg-blue-200',
            value: 'Blue Bags',
            colorEntireRow: true
        },
        {
            cellName: 'dts',
            color: 'white-row',
            value: 'White Bag',
            colorEntireRow: true
        },
        {
            cellName: 'dts',
            color: 'bg-purple-100',
            value: 'Cytotoxic Bags',
            colorEntireRow: true
        },
        {
            cellName: 'dts',
            color: 'all-row',
            value: 'All Bags',
            colorEntireRow: true
        },
    ]

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        setSummaryRowData([])
        setDetailedRowData([])
        setTotal(0)
        setTimeout(function(){
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        },300)
    };
    const { showToaster, hideToaster } = useToaster();

    const svClick = () => {
        setTotal(0)
        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds);
      
        if (msg && msg[0]) {
            showToaster( msg, 'error');
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
            }, 5000);
            return;
        }
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        setTimeout(() => {
            refetch();
        }, 400)
    };
    const getList = (type:number) => {
        setIsLoading("Loading data...")
        handleChange(undefined, 0);

        let dateFrm = getFldValue(state.textDts, "dt_rptfrm")
        let dateTo = getFldValue(state.textDts, "dt_rptto")
        if (!dateFrm) {
            dateFrm = moment(Date.now()).format("DD-MMM-yyyy")
    
        } else if (!dateTo) {
            dateTo = moment(Date.now()).format("DD-MMM-yyyy")
        }
        let dtFrm = UseMomentDateNmb(dateFrm);
        let dtTo = UseMomentDateNmb(dateTo);
        let dtwise = true
        let gid: any = utilities(3, "", "")
        let gd: string = gid
        if(type == 2){
            dispatch({ type: ACTIONS.SETGID, payload: gd })
        }
        else{
            dispatch({ type: ACTIONS.SETGIDTWO, payload: gd })
        }
        const payload: any = postLinux(lvl + '=' + who + '=' + "" +'=' + dtFrm +'='+ dtTo + '='+ dtwise + '=' + gd, 'misgeo');
        return nrjAxiosRequestBio("show_GeoCnt", payload);

        // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a182", lvl + "=" + who + "=" + dt + '=' + gd + '=' + type)
        // return nrjAxios({ apiCall: api })
    }

    const ShowData = (dataSvd: any) => {
           
        setIsLoading("")
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        let dt: any = GetResponseLnx(dataSvd);
        if (dt && Array.isArray(dt) && dt.length > 0) {
            let detailedData: any[] = [];
            let summaryData: any[] = [];
            let total = 0;
        
            // Process each element (array) within dt separately
            dt.forEach((element: any[]) => {
                let tempDetailed: any = {};
                let tempCbwtf = {
                    "scnby": 'Operator',
                    "corgeono": 0,
                    "nogeo": 0,
                    "prtlgeo": 0,
                    "wrnggeo": 0,
                    "dt_rpt": 0
                };
        
                // Iterate over each object in the current element array
                element.forEach((res: any) => {
                    let groupKey = '';
        
                    // Determine the level (lvl) for grouping
                    if (lvl === 'CPCB') {
                        groupKey = res.rgd; // Use 'rgd' as the key for CPCB level
                    } else if (lvl === 'RGD') {
                        groupKey = res.stt; // Use 'stt' as the key for RGD level
                    } else if (lvl === 'STT') {
                        groupKey = res.cbwtfnm; // Use 'cbwtfnm' as the key for STT level
                    }
        
                    // Initialize tempDetailed entry if it doesn't exist
                    if (!tempDetailed[groupKey]) {
                        tempDetailed[groupKey] = {
                            cbwtfnm:   getStateFullFormWho(res.cbwtfnm) ,
                            scnby: res.scnby,
                            corgeono: 0,
                            prtlgeo: 0,
                            nogeo: 0,
                            wrnggeo: 0,
                            dt_rpt: res.dt_rpt
                        };
                    }
        
                    // Accumulate values for corgeono, prtlgeo, nogeo, wrnggeo
                    tempDetailed[groupKey].corgeono += res.corgeono;
                    tempDetailed[groupKey].prtlgeo += res.prtlgeo;
                    tempDetailed[groupKey].nogeo += res.nogeo;
                    tempDetailed[groupKey].wrnggeo += res.wrnggeo;
        
                    // Accumulate values for tempCbwtf
                    tempCbwtf.corgeono += res.corgeono;
                    tempCbwtf.prtlgeo += res.prtlgeo;
                    tempCbwtf.nogeo += res.nogeo;
                    tempCbwtf.wrnggeo += res.wrnggeo;
                    tempCbwtf.dt_rpt = res.dt_rpt; // Update date if needed for total calculation
        
                    // Calculate total for the current element
                    total += res.corgeono + res.prtlgeo + res.nogeo + res.wrnggeo;
                });
        
                // Generate tempSummary from tempDetailed for the current element
                let tempSummary: any[] = Object.values(tempDetailed).map((item: any) => ({
                    ...tempCbwtf,
                    cbwtfnm: item.cbwtfnm,
                    wrnggeo: item.wrnggeo + item.prtlgeo,
                    ttl: item.wrnggeo + item.prtlgeo + item.nogeo + item.corgeono,
                    dt_rpt: item.dt_rpt
                }));
        
                // Append tempDetailed and tempSummary for the current element to arrays
                detailedData.push(...Object.values(tempDetailed));
                summaryData.push(...tempSummary);
            });
        
            // Set states or perform further processing with detailedData, summaryData, and total
            detailedData = [...detailedData].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
            summaryData = [...summaryData].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
            setDetailedRowData(detailedData);
            setSummaryRowData(summaryData);
            setTotal(total);
        }
        

     else{
            showToaster( ["Data Not Found"], 'error');
        }
        setTimeout(function () {
            dispatch({ type: ACTIONS.NEWROWDATA, payload: dt });
        }, 800);
    };

    const { data: dataSvd1, refetch: refetch } = useQuery({
        queryKey: ["svOldForm1", state.rndm],
        queryFn: ()=>getList(1),
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });
    

    // const [Type, setType] = useState<number>(1);

    const applicationVerion: string = getApplicationVersion();

    const setLvlWhoData = (data: any) => {
        
        if (lvl == "CBWTF") {
            setValueType(0)
        }
        setTotal(0)
        setLvl(data.lvl);
        setWho(data.who);
        onChangeDts(data.dateFrom);
        onChangeDts(data.dateTo);
        setDetailedRowData([])
        setSummaryRowData([])
        let updatedColdef = [...coldef];
       
        if (lvl == "RGD") {
            updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "Board" } : { ...updatedColdef[3], headerName: "State/UT" }; // Update the headerName of the second element
            setColdef(updatedColdef);

        } else if (lvl.toUpperCase() == "STT") {
            updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[3], headerName: "Name OfCBWTF" }; // Update the headerName of the second element
            setColdef(updatedColdef);
        }
        else if (lvl == "CBWTF") {
            updatedColdef[3] = { ...updatedColdef[3], headerName: "Name Of CBWTF" };
            setColdef(updatedColdef);
        } 
        else {
            updatedColdef[3] = valueType == 0 ? { ...updatedColdef[3], headerName: "CPCB" } :  { ...updatedColdef[3], headerName: "Board" }// Update the headerName of the second element
            setColdef(updatedColdef);
        }
    }

const [valueType, setValueType] = useState(0);
  const handleChange = (event: React.SyntheticEvent | undefined, newValue: number) => {
    setValueType(newValue);
    let updatedColdef = [...coldef];
    if (lvl == "RGD") {
        updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "Board" } : { ...updatedColdef[3], headerName: "State/UT" }; // Update the headerName of the second element
        setColdef(updatedColdef);

    } else if (lvl.toUpperCase() == "STT") {
        updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "State/UT" } : { ...updatedColdef[3], headerName: "Name Of CBWTF" }; // Update the headerName of the second element
        setColdef(updatedColdef);
    }  else if (lvl == "CBWTF") {
        updatedColdef[3] = { ...updatedColdef[3], headerName: "Name Of CBWTF" };
        setColdef(updatedColdef);
    } else {
        updatedColdef[3] = newValue == 0 ? { ...updatedColdef[3], headerName: "CPCB" } : { ...updatedColdef[3], headerName: "Board" };
        setColdef(updatedColdef);
    }
  };

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  const PrintGeo = () => {
    let gid: string = state.gid;
    let api: string = createGetApi(
      "db=nodb|dll=chqdll|fnct=g127",`17=${gid}`);
    return nrjAxios({ apiCall: api });
  };

  const showRpt = (dataPr: any) => {
    let dt: string = GetResponseWnds(dataPr);
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    if (dt && dt.indexOf(".pdf") > -1) {
      window.open(dataPr.data[0]["Data"], "_blank");
    } else {
      showToaster( ["Please try again after refreshing the page!"],
        'error')
    }
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  };


  const { data: dataPr, refetch: refetchPr } = useQuery({
    queryKey: ["prntlist", state.rndm],
    queryFn: PrintGeo,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: showRpt,
  });

  const printClick = (data:any) => {
      refetchPr();
  }

  const excelColWidth = [{wch: 30},{wch: 30},{wch: 30}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20},{wch: 20}]

  const [printExcelHeader, setPrintExcelHeader] = useState<any[]>([])
  const [keyOrder, setKeyOrder] = useState<any[]>([])

  useEffect(()=>{
    let tempOne:any[] = [];
    let tempTwo:any[] = [];
    coldef.forEach((res:any)=>{
      if(res.children){
        let str = res.headerName  + " " ;
        res.children.forEach((element:any) => {
          tempOne.push(element.field);
          tempTwo.push(str + element.headerName)
        });
      }
      else if(!res['hide']){
        tempOne.push(res.field);
        tempTwo.push(res.headerName)
      }
    })
    setPrintExcelHeader(tempTwo);
    setKeyOrder(tempOne)
  },[coldef])

    return (
        <>
            <LevelSelector
                showCbwtf={false}
                levelSelectorData={setLvlWhoData}
                // dateField={true}
                dateFieldFrom={true}
                dateFieldTo={true}
                getListButton={true}
                getListOnclick={svClick}
                printButton={true}
                printButtonClick={printClick}
            ></LevelSelector>
            <div className="">
                <div className="bg-white shadow rounded-lg px-4 pb-6 pt-3">
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={valueType} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="Summary" {...a11yProps(0)} />
                                {lvl !== "CBWTF" ?
                                    <Tab label="Details" {...a11yProps(1)} /> :
                                    null}
                            </Tabs>
                        </Box>
                        <CustomTabPanel value={valueType} index={0}>
                            <div>
                                {total ? <div className="border rounded-lg">
                                <div className="p-3">
                                <div className="flex font-semibold">
                                    Total waste bags : {total}
                                </div>
                                </div>
                                </div> : <></>}
                                <div className="font-semibold text-lg mb-2">{isLoading}</div>
                                {showMessage && showMessage.message.length != 0 && <div className="py-2">
                                    <Toaster data={showMessage} className={''}></Toaster>
                                </div>}
                                <div className='mt-4'>
                                    <NrjAgGrid
                                        onButtonClicked={onButtonClicked}
                                        onGridLoaded={GridLoaded}
                                        onRowSelected={onRowSelected}
                                        // onCellEdited={OnCellEdited}
                                        colDef={coldef}
                                        apiCall={""}
                                        rowData={summaryRowData}
                                        deleteButton={""}
                                        deleteFldNm={""}
                                        trigger={state.triggerG}
                                        showPagination={true}
                                        className="ag-theme-alpine-blue ag-theme-alpine"
                                        cellClassRulesValues={cellClassRulesValues}
                                        showExport={true}
                                        pageTitle={"Analyzing Waste Bag Scanning: Geolocation Accuracy Summary : "}
                                        printExcelHeader={printExcelHeader}
                                        exceColWidth={excelColWidth}
                                        KeyOrder={keyOrder}
                                        lvl={lvl}
                                        who={who}
                                        colDefPdf={colDefPdf}
                                        pdfColWidth={pdfColWidth}
                                        widthSerialNoCol={100}
                                    ></NrjAgGrid>
                                </div>
                            </div>
                        </CustomTabPanel>
                        {lvl !== "CBWTF" ?
                        <CustomTabPanel value={valueType} index={1}>
                            <div>
                            {total ? <div className="border rounded-lg">
                                <div className="p-3">
                                <div className="flex font-semibold">
                                    Total waste bags : {total}
                                </div>
                                </div>
                                </div> : <></>}
                               <div className=" font-semibold text-lg text-center ">{isLoading}</div>
                                {showMessage && showMessage.message.length != 0 && <div className="py-2">
                                    <Toaster data={showMessage} className={''}></Toaster>
                                </div>}
                                <div className='mt-1'>
                                    <NrjAgGrid
                                        onButtonClicked={onButtonClicked}
                                        onGridLoaded={GridLoaded}
                                        onRowSelected={onRowSelected}
                                        // onCellEdited={OnCellEdited}
                                        colDef={coldef}
                                        apiCall={""}
                                        trigger={state.triggerG}
                                        rowData={detailedRowData}
                                        deleteButton={""}
                                        deleteFldNm={""}
                                        showPagination={true}
                                        className="ag-theme-alpine-blue ag-theme-alpine"
                                        cellClassRulesValues={cellClassRulesValues}
                                        showExport={true}
                                        pageTitle={"Analyzing Waste Bag Scanning: Geolocation Accuracy Summary: "}
                                        printExcelHeader={printExcelHeader}
                                        exceColWidth={excelColWidth}
                                        KeyOrder={keyOrder}
                                        widthSerialNoCol={100}
                                        lvl={lvl}
                                        who={who}
                                    ></NrjAgGrid>
                                </div>
                            </div>
                        </CustomTabPanel>: null}
                    </Box>
                </div>
            </div>
        </>
    );
}; export default React.memo(MisBagCntwthGeo);
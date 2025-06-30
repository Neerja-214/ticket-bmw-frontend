import React, { useReducer, useState } from "react";
import { Button, Tooltip } from "@mui/material";
import CardHospitalDisplay from "../../components/reusable/CardHospitalDisplay";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  getApplicationVersion,
  getStateFullFormWho,
  gridAddToolTipColumn,
  postLinux,
} from "../../utilities/utilities";
import {
    nrjAxios,
    nrjAxiosRequestBio,
    useNrjAxios,
  } from "../../Hooks/useNrjAxios";
  import WtrInput from "../../components/reusable/nw/WtrInput";
  import { getFldValue } from "../../Hooks/useGetFldValue";
  import NrjAgGrid from "../../components/reusable/NrjAgGrid";
  import { act } from "react-dom/test-utils";
  import HdrDrp from "../HdrDrp";
  
  import { clrNAValue } from "../../utilities/cpcb";
  import { Modal } from "rsuite";
  import { Toaster } from "../../components/reusable/Toaster";
  
  import LevelSelector from "../dshbrd/LevelSelector";
  import { useToaster } from "../../components/reusable/ToasterContext";
  import moment from "moment";
  
  const ACTIONS = {
    TRIGGER_GRID: "grdtrigger",
    NEWROWDATA: "newrow",
    TRIGGER_GRIDSRCH: "sgrdtrigger",
    NEWROWDATASRCH: "snewrow",
    RANDOM: "rndm",
    TRIGGER_FORM: "trgfrm",
    FORM_DATA: "frmdata",
    SETFORM_DATA: "setfrmdata",
    MAINID: "mnid",
    CHECK_REQ: "chckreq",
    CHECK_REQDONE: "chckreqdn",
    SETGID: "gd",
    SETFORMAT: "frmt",
    GRIDRECCNT: "grdreccnt",
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
    frmt: 0,
    grdcnt: 0,
    btnTxtA: "Previous",
    btnTxtB: "More",
    btnTxtC: "",
    disableA: 1,
    disableB: 1,
    disableC: 1,
    triggerSrch: 0,
    nwRowSrch: [],
    triggerHsp: 1,
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
    frmt: number;
    grdcnt: number;
    btnTxtA: string;
    btnTxtB: string;
    btnTxtC: string;
    disableA: number;
    disableB: number;
    disableC: number;
    triggerSrch: number;
    nwRowSrch: any;
    triggerHsp: number;
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
        return newstate;
      case ACTIONS.TRIGGER_GRID:
        newstate.triggerG = action.payload;
        return newstate;
      case ACTIONS.TRIGGER_GRIDSRCH:
        newstate.triggerSrch = action.payload;
        return newstate;
      case ACTIONS.SETFORMAT:
        newstate.frmt = action.payload;
        return newstate;
      case ACTIONS.GRIDRECCNT:
        newstate.grdcnt = action.payload;
        // if (action.payload == 0)
        // {
        //   newstate.grdcnt = 0
        // }
        return newstate;
      case ACTIONS.TRIGGER_FORM:
        newstate.trigger = action.payload;
        newstate.triggerHsp = action.payload;
        if (action.payload === 0) {
          newstate.textDts = "";
          newstate.frmData = "";
          newstate.mainId = 0;
        }
        return newstate;
      case ACTIONS.NEWROWDATA:
        newstate.triggerG += 10;
        if (action.payload) {
          if (action.payload.length > 0) {
            newstate.grdcnt += action.payload.length;
          }
        }
        newstate.nwRow = action.payload;
        return newstate;
      case ACTIONS.NEWROWDATASRCH:
        newstate.triggerSrch = 1;
        newstate.nwRowSrch = action.payload;
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
        newstate.rndm += 1;
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
        return newstate;
    }
  };

 const HcfListRegIndependent = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const GridLoaded = () => { };
    const onButtonClicked = (action: string, rw: any) => { };
    const [gridData, setGridData] = useState<any[]>([]);
    const [curPageCount, setCurPageCount] = useState(0);
    const [actvPage, setActvPage] = useState(0);
    const [showMessage, setShowMessage] = useState<any>({ message: [] });
    const [isLoading, setIsLoading] = useState("");
    const [lvl, setlvl] = useState("");
    const [who, setwho] = useState("");
    const [name, setname] = useState("");
    const [grdCnt, setGrdcnt] = useState(state.grdcnt)
    const coldef:any[] = [
      {
        field: "hcfnm",
        width: 320,
        headerName: "Health care facility",
        tooltipField: 'hcfnm',
        filter: "agTextColumnFilter",
      },
      {
        field: "hcfcod",
        width: 150,
         headerName: "SPCB/PCC code",
        tooltipField: "tphcf",
        filter: "agTextColumnFilter",
      },
      {
        field: "cty",
        width: 200,
        headerName: "City",
      },
      {
        field: "cntprsn",
        width: 200,
        headerName: "Contact person",
        filter: "agTextColumnFilter",
      },
      {
        field: "phn",
        width: 150,
        headerName: "Mobile",
        filter: "agTextColumnFilter",
      },
      {
        field: "hcftyp",
        width: 70,
        headerName: "HCF type",
      },
  
      {
        field: "addra",
        width: 150,
        headerName: "Address I",
        tooltipField: 'addra',
  
      },
      {
        field: "addrb",
        width: 150,
        headerName: "Address II",
        tooltipField: 'addrb',
  
      },
      {
        field: "addrc",
        width: 150,
        headerName: "Address III",
        tooltipField: 'addrc',
  
      },
      {
        field: "stt",
        width: 100,
        headerName: "State/UT",
        hide: true,
      },
      {
        field: "eml",
        width: 200,
        headerName: "Email",
        hide: true,
      },
      {
        field: "nobd",
        width: 150,
        headerName: "No of beds",
      },
      {
        field: "bluscl",
        width: 150,
        headerName: "Blutooth scale",
        hide: true,
      },
      {
        field: "andrapp",
        width: 150,
        headerName: "Android app",
        hide: true,
      },
      {
        field: "tphcf",
        width: 150,
        hide: true,
        headerName: "",
      },
      {
        field: "cnststs",
        width: 150,
        headerName: "Consent Status",
      },
      {
        field: "cnststs",
        width: 180,
        headerName: "Consent application no.",
      },
      {
        field: "cnstvldtfrm",
        width: 180,
        headerName: "Validity From Of Consent",
      },
  
      {
        field: "cnstvldtto",
        width: 180,
        headerName: "Validity From Of Consent",
      }
    ] ;
  
    const colDefPdf =[
      {
        field: "hcfnm",
        width: 320,
        headerName: "Health care facility",
        tooltipField: 'hcfnm',
        filter: "agTextColumnFilter",
      },
      {
        field: "hcfcod",
        width: 150,
         headerName: "SPCB/PCC code",
        tooltipField: "tphcf",
        filter: "agTextColumnFilter",
      },
      {
        field: "cty",
        width: 200,
        headerName: "City",
      },
      {
        field: "cntprsn",
        width: 200,
        headerName: "Contact person",
        filter: "agTextColumnFilter",
      },
      {
        field: "phn",
        width: 150,
        headerName: "Mobile",
        filter: "agTextColumnFilter",
      },
      {
        field: "hcftyp",
        width: 70,
        headerName: "HCF type",
      },
  
      {
        field: "addra",
        width: 150,
        headerName: "Address I",
        tooltipField: 'addra',
  
      },
      {
        field: "addrb",
        width: 150,
        headerName: "Address II",
        tooltipField: 'addrb',
  
      },
      {
        field: "addrc",
        width: 150,
        headerName: "Address III",
        tooltipField: 'addrc',
  
      },
      {
        field: "nobd",
        width: 150,
        headerName: "No of beds",
      },
      {
        field: "cnststs",
        width: 150,
        headerName: "Consent Status",
      },
      {
        field: "cnstappno",
        width: 180,
        headerName: "Consent application no.",
      },
      {
        field: "cnstvldtfrm",
        width: 180,
        headerName: "Validity From Of Consent",
      },
      
    ]
  
    const pdfColWidth = ['15%','10%' , '5%',  '10%','10%',  '5%','10%',  '10%','10%','10%']
  
    const printExcelHeader = ["HCF TYPE","NO OF BEDS","HCF","CITY","STATE","REGIONAL DIRECTORATE","CONTACT PERSON","ADDRESS I","ADDRESS II","ADDRESS III", "PIN CODE"]
    const keyOrder: string[] = ['hcftyp','nobd','hcfnm','cty', 'stt', 'rgd','cntprsn','addra', 'addrb', 'addrc', 'pnc']
    const excelColWidth = [{wch: 10},{wch: 10},{wch: 50}, {wch: 30}, {wch: 30}, {wch: 30}, {wch: 30}, {wch: 30}, {wch: 30}, {wch: 30}, {wch: 30}]
    const onRowSelected = (data: string) => {
      let ech: string[] = data.split("|");
      let tempData = {
        hcfnm: ech[0],
        hcfcod: ech[1],
        addra: ech[8],
        addrb: ech[9],
        addrc: ech[10],
        stt: ech[11],
        eml: ech[12],
        nobd: ech[13],
        bluscl: ech[15],
        andrapp: ech[16],
        rgd: ech[14],
        cty: ech[2],
        cntpr: ech[3],
        phn: ech[4],
        hcftyp: ech[5],
        lgt: ech[7],
        ltt: ech[6],
      };
      handleOpen(tempData);
    };
    
    const onChangeDts = (data: string) => {
      dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };
  
  
  
    
    const { showToaster, hideToaster } = useToaster();  
  
    const getBtnA = (data: any) => {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
      setGrdcnt(0)
      setTimeout(()=>{
        refetchHcfList();
        setCurPageCount(0);
        setShowStaticMap(true)
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      }, 400);
    };
  
    const GetHCFList = () => {
      setIsLoading("Loading data ...");
      let gid: string = "";
      let gd: any = utilities(3, "", "");
      gid = gd;
      dispatch({ type: ACTIONS.SETGID, payload: gid });
      console.log(grdCnt)
  
      let lvlModified :string = lvl
      if(lvlModified == 'CBWTF'){
        lvlModified = 'CBWTFID';
      }
      const payload: any = postLinux(lvlModified + '=' + who + '=' + grdCnt + '=' + 0 + '=' + gid, 'gridDisplay');
      return nrjAxiosRequestBio("hcfregtdy", payload);
    };
  
    const staticMap = () => {
  
      window.open(
        "/bhuvanmap?pageNumber=" + actvPage + "&gid=" + state.gid,
        "_blank"
      );
    };
  
    const ShowHcfList = (data4: any) => {
      setIsLoading("");
      // let dt: string = GetResponseWnds(data4);
      if (Array.isArray(data4.data) && data4.data.length) {
        // let ary: any = dataStr_ToArray(dt);
        let ary: any[] = data4.data
        
        ary = clrNAValue(ary, state.grdcnt);
        if (!ary) {
          return;
        }
        ary = gridAddToolTipColumn(
          ary,
          "tphcf",
          " details of Geolocation",
          "hcfnm",
          "ltt"
        );
        if (ary) {
          setGrdcnt(grdCnt + ary.length)
        }
        dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      }
      else {
        showToaster( ["Did not find any Data"], "error");
      }
      dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    };
  
    const { data: data4, refetch: refetchHcfList } = useQuery({
      queryKey: ["hcflist", lvl, who, state.rndm],
      queryFn: GetHCFList,
      enabled: false,
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      onSuccess: ShowHcfList,
    });
  
    const parentPagination = (data: any) => {
  
      let pgCnt: number = data.api.paginationProxy.totalPages;
      let curPg: number = data.api.paginationProxy.currentPage;
      if (pgCnt) {
        if (pgCnt > 0) {
          setActvPage(curPg + 1);
          if (curPg) {
            let ps: number = pgCnt - curPg;
            if (ps <= 1 && curPageCount < pgCnt) {
              refetchHcfList();
              setCurPageCount(pgCnt);
            }
          }
        }
      }
    };
  
    const [modelData, setModelData] = useState<any>({});
    const [open, setOpen] = useState(false);
    const [stabiliser, setStabiliser] = useState<boolean>(true);
  
    const handleOpen = (data: any) => {
      if (stabiliser) {
        setOpen(true);
        setModelData(data);
        setStabiliser(!stabiliser);
      }
    };
  
    const handleClose = () => {
      setOpen(false);
      setStabiliser(!stabiliser);
    };
  
    const [open1, setOpen1] = useState(false);
    const [stabiliser1, setStabiliser1] = useState<boolean>(true);
  
    const handleOpen1 = (data: any) => {
      
      if (stabiliser) {
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        setOpen1(true);
        setStabiliser1(!stabiliser1);
      }
    };
  
    const handleClose1 = () => {
      setOpen1(false);
      setStabiliser1(!stabiliser1);
      dispatch({ type: ACTIONS.TRIGGER_GRIDSRCH, payload: 5 });
  
    };
    let hsp: string = "";
    const searchName = () => {
      setShowStaticMap(false)
      hsp = getFldValue(state.textDts, "hsp");
      if (hsp) {
        if (hsp.length > 2) {
          refetchSearchHcf();
        }
      }else{
        dispatch({ type: ACTIONS.TRIGGER_GRIDSRCH, payload: 5 });
      }
    };
    const GetFilteredHcf = () => {
      let filter = { filterName: "", filterValue: hsp };
  
      // let api = createGetApi(
      //   "db=nodb|dll=x|fnct=a199",
      //   who + "=" + `${filter.filterValue}=0=`
      // );
      // return nrjAxios({ apiCall: api });
      
      const payload: any = postLinux(who + '=hcf=' + filter.filterValue, 'gridDisplaySearch');
      return nrjAxiosRequestBio("findInDB", payload);
    };
  
    const GetFilteredHcfSuccess = (data: any) => {
      // let dt: string = GetResponseWnds(data);
      
      if (data.data && data.data.data && Array.isArray(data.data.data)) {
        let ary: any[] = data.data.data;
        ary = clrNAValue(ary, 1);
        if (Array.isArray(ary)) {
          ary = gridAddToolTipColumn(
            ary,
            "tphcf",
            " details of Geolocation",
            "hcfnm",
            "ltt"
          );
          setGridData(ary);
        }
        dispatch({ type: ACTIONS.NEWROWDATASRCH, payload: ary });
      }
    };
  
    const { data: data, refetch: refetchSearchHcf } = useQuery({
      queryKey: ["filteredHcff", state.rndm],
      queryFn: GetFilteredHcf,
      enabled: false,
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      onSuccess: GetFilteredHcfSuccess,
    });
  
    const SvNotFnd = () => {
      let hcf: string = state.textDts;
      hcf = getFldValue(hcf, "hsp");
      if (hcf) {
        refetchSvNot();
      }
    };
  
    const SvNotSave = () => {
      let hcf: string = state.textDts;
      hcf = getFldValue(hcf, "hsp");
      let api: string = createGetApi(
        "db=nodb|dll=accdll|fnct=a290",
        who + "=" + hcf
      );
      return useNrjAxios({ apiCall: api });
    };
  
    const updtData = (dataN: any) => {
      let dt: string = GetResponseWnds(dataN);
      if (dt) {
      }
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
      }, 250);
    };
  
    const { data: dataN, refetch: refetchSvNot } = useQuery({
      queryKey: ["svnotflnd", state.rndm],
      queryFn: SvNotSave,
      enabled: false,
      staleTime: Number.POSITIVE_INFINITY,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      onSuccess: updtData,
    });
  
  
    const setLvlWhoData = (data: any) => {
      setlvl(data.lvl);
      setwho(data.who);
      setname(data.name);
      let levelValue = 'Level: '
      if(data.lvl == "RGD"){
        levelValue += data.who + " " + "REGIONAL DIRECTORATE"
      }
      else if(data.lvl == 'STT'){
        levelValue += "SPCB" + " " + getStateFullFormWho(data.who) 
      }
      else if(data.lvl == 'CBWTF'){
        levelValue += 'CBWTF : ' + data.name
      }
      else{
        levelValue += 'CPCB'
      }
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
      dispatch({ type: ACTIONS.SETGID, payload: "" });
      setGrdcnt(0)
      // dispatch({type : ACTIONS.GRIDRECCNT , payload : 0})
    };
  
    const [filterParameter, setFilterParameter] = useState<any>(null)
    const getFilteredParameter = (data: any) => {
      setFilterParameter(data);
    }
    const [showStaticMap, setShowStaticMap] = useState(true)
  
    return (
      <>
        <LevelSelector
          showCbwtf={true}
          levelSelectorData={setLvlWhoData}
          getListButton={true}
          getListOnclick={getBtnA}
          dateField={false}
        ></LevelSelector>
  
        <div className="bg-white px-4 pb-6">
          <div className="flex justify-between items-center">
           <div className=" font-semibold text-lg text-center ">{isLoading}</div>
            <div className="flex justify-center mt-4">
  
              {lvl == 'CBWTF' && who != 'Select a CBWTF to get data' && <div className="mr-3">
                <Tooltip
                  title={
                    "Select the Regional Directorate, State and CBTWTF to get list of CBWTF"
                  }
                >
                  <Button
                    size="medium"
                    style={{ backgroundColor: "#3490dc" , textTransform: "none"}}
                    variant="contained"
                    color="success"
                    className="me-3"
                    onClick={handleOpen1}
                  >
                    Search health care facility
                  </Button>
                </Tooltip>
              </div>}
              {lvl == 'CBWTF' && state.gid && who != 'Select a CBWTF to get data' && showStaticMap && <div>
                <Tooltip
                  title={
                    "To view the location of  HCF on map, will show the location of HCF on current visible list"
                  }
                >
                  <Button
                    size="medium"
                    style={{
                      backgroundColor: "#38a169",
                      transition: "background-color 0.3s, transform 0.3s",
                       textTransform: "none"
                    }}
                    variant="contained"
                    color="success"
                    disabled={!state.disableC}
                    onClick={staticMap}
                  >
                    Static map
                  </Button>
                </Tooltip>
              </div>}
            </div>
          </div>
  
          
  
          <div
            className="flex justify-center"
          ></div>
  
          <NrjAgGrid
            onGridLoaded={GridLoaded}
            onRowSelected={onRowSelected}
            onButtonClicked={onButtonClicked}
            colDef={coldef}
            apiCall={""}
            rowData={gridData}
            deleteButton={""}
            deleteFldNm={""}
            showDataButton={""}
            showApi={""}
            showFldNm={""}
            newRowOnTop={true}
            className="ag-theme-alpine-blue ag-theme-alpine"
            trigger={state.triggerG}
            newRowData={state.nwRow}
            // newRowData={GridAry.value}
            showPagination={true}
            showTooltips={true}
            MyRoute="hcflstgrd"
            appName="CPCB"
            parentPaginationChanged={parentPagination}
            getFilteredParameter={getFilteredParameter}
            NoRecordEachCall={300}
            showExport={true}
            KeyOrder={keyOrder}
            pageTitle={"List of HCF : "}
            sortBy={'rgd'}
            printExcelHeader={printExcelHeader}
            exceColWidth={excelColWidth}
            lvl={lvl}
            who={who}
            name={name}
            colDefPdf={colDefPdf}
            pdfColWidth={pdfColWidth}
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
        {open && (
          <Modal open={open} size="sm" onClose={handleClose}>
            <Modal.Header>
              <Modal.Title>
                <div className="font-semibold">
                  Health care facility information
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div
                className="rounded-lg pb-3 px-[4rem]"
                style={{ backgroundColor: "#fff" }}
              >
                <CardHospitalDisplay data={modelData} />
              </div>
            </Modal.Body>
            <Modal.Footer>
              {/* <Button variant="contained" color="success"  onClick={handleClose}>
                              Ok
                          </Button> */}
              <Button onClick={handleClose} style={{ textTransform: "none"}}>Cancel</Button>
            </Modal.Footer>
          </Modal>
        )}
  
        {open1 && (
          <Modal open={open1} size="md" onClose={handleClose1}>
            <Modal.Header>
              <Modal.Title>
                <div className="font-semibold">
                  Search for health care facility
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div
                className="rounded-lg pb-3 px-[4rem]"
                style={{ backgroundColor: "#f5f6fa" }}
              >
                <div className="flex justify-between items-center">
                  <WtrInput
                    Label="HCF Name"
                    fldName="hsp"
                    idText="txthsp"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    validateFn=""
                    allowNumber={false}
                    unblockSpecialChars={true}
                    selectedValue={state.frmData}
                    clrFnct={state.triggerHsp}
                    ToolTip={"Enter Name of HCF"}
                    delayClose={1000}
                    placement="right"
                    ClssName=""
                  ></WtrInput>
                  <div className="ml-2">
                    <Button
                      size="medium"
                      className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                      variant="contained"
                      onClick={searchName}
                      style={{ textTransform: "none"}}
                    >
                      Search
                    </Button>
                  </div>
                  <div className="ml-2">
                    {/* <Button
                      size="medium"
                      className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                      variant="contained"
                      onClick={SvNotFnd}
                    >
                      Add
                    </Button> */}
                  </div>
                </div>
                <div className="mt-2">
                  <NrjAgGrid
                    onGridLoaded={GridLoaded}
                    onRowSelected={onRowSelected}
                    onButtonClicked={onButtonClicked}
                    colDef={coldef}
                    apiCall={""}
                    rowData={gridData}
                    deleteButton={""}
                    deleteFldNm={""}
                    showDataButton={""}
                    showApi="cbwtfid"
                    showFldNm={""}
                    newRowOnTop={true}
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    trigger={state.triggerSrch}
                    newRowData={state.nwRowSrch}
                    // newRowData={GridAry.value}
                    showPagination={true}
                    parentPaginationChanged={parentPagination}
                    NoRecordEachCall={300}
                    
                  ></NrjAgGrid>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleClose1} style={{ textTransform: "none"}}>Cancel</Button>
            </Modal.Footer>
          </Modal>
        )}
      </>
    );
}
export default React.memo(HcfListRegIndependent);

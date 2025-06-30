import { Button } from "@mui/material";
import { Modal } from "rsuite";
import CardHospitalDisplay from "../../components/reusable/CardHospitalDisplay";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  getApiFromBiowaste,
  getApiFromClinician,
  getApplicationVersion,
  gridAddToolTipColumn,
  postLinux,
} from "../../utilities/utilities";
import React, { useEffect, useReducer, useState } from "react";
import { nrjAxios, nrjAxiosRequest, nrjAxiosRequestBio, useNrjAxios } from "../../Hooks/useNrjAxios";
import { getFldValue } from "../../Hooks/useGetFldValue";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { act } from "react-dom/test-utils";
import HdrDrp from "../HdrDrp";
import { useNavigate } from "react-router";
import { clrNAValue } from "../../utilities/cpcb";
import { stateAbbreviation, getCategoryAbbreviation } from "../../utilities/utilities";
import WtrInput from "../../components/reusable/nw/WtrInput";
import { Toaster } from "../../components/reusable/Toaster";
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
  SETFORMAT: "frmt",
  GRIDRECCNT: "grdreccnt",
  SETCOMBOSTR: "cmbstr",
  COMBOLABEL: "cmblabel",
  SETCOMBOSTRB: "cmbstrB",
  SETCOMBOSTRC: "cmbstrC",
  SETBUTTONTEXT: "btntxt",
  DISABLE: "disable",
  SHOW_LOCATION: "showLocation",
  TRIGGER_GRIDSRCH: "sgrdtrigger",
  NEWROWDATASRCH: "snewrow",
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
  combostr: "",
  cmbLabelA: "CBWTF",
  cmbLabelB: "",
  cmbLabelC: "",
  combostrB: "",
  combostrC: "",
  btnTxtA: "More",
  btnTxtB: "CBWTF / HCF",
  disableA: 1,
  disableB: 1,
  disableC: 1,
  showLocation: 0,
  triggerSrch: 0,
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
  combostr: string;
  cmbLabelA: string;
  cmbLabelB: string;
  cmbLabelC: string;
  combostrB: string;
  combostrC: string;
  btnTxtA: string;
  btnTxtB: string;
  disableA: number;
  disableB: number;
  disableC: number;
  showLocation: number;
  triggerSrch: number;
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
      if (action.payload == 5) {
        newstate.grdcnt = 0;
        newstate.nwRow = [];
      }
      return newstate;
    case ACTIONS.TRIGGER_GRIDSRCH:
      newstate.triggerSrch = action.payload;
      return newstate;
    case ACTIONS.NEWROWDATASRCH:
      newstate.triggerSrch = 1;
      newstate.nwRowSrch = action.payload;
      return newstate;
    case ACTIONS.SETBUTTONTEXT:
      if (action.payload == 1) {
        newstate.btnTextA = "Get list";
        newstate.btnTextB = "More..";
      }

      return newstate;
    case ACTIONS.COMBOLABEL:
      if (action.payload == 2) {
        newstate.cmbLabelA = "Regional Directorate";
        newstate.cmbLabelB = "State";
        newstate.cmbLabelC = "CBWTF";
      }
      return newstate;
    case ACTIONS.SETFORMAT:
      newstate.frmt = action.payload;
      return newstate;
    case ACTIONS.GRIDRECCNT:
      newstate.grdcnt = action.payload;
      return newstate;
    case ACTIONS.SETCOMBOSTR:
      newstate.combostr = action.payload;
      return newstate;
    case ACTIONS.SETCOMBOSTRB:
      newstate.combostrB = action.payload;
      return newstate;
    case ACTIONS.SETCOMBOSTRC:
      newstate.combostrC = action.payload;
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
      newstate.triggerG = 1;
      if (action.payload) {
        if (action.payload.length > 0) {
          newstate.grdcnt += action.payload.length;
        }
      }

      newstate.nwRow = action.payload;
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
      newstate.openDrwr = true;
      return newstate;
    case ACTIONS.CHECK_REQDONE:
      newstate.errMsg = "";
      newstate.openDrwr = false;
      return newstate;
    case ACTIONS.SETGID:
      newstate.gid = action.payload;
      return newstate;
    case ACTIONS.SHOW_LOCATION:
      newstate.showLocation = action.payload
      return newstate
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

const ListHCF = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const GridLoaded = () => { };
  const [curPage, setCurPage] = useState(0)
  const isUppercase = sessionStorage.getItem('UpperCase') == '1' ? true : false;


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
      nobd: ech[5],
      bluscl: ech[13],
      andrapp: ech[14],
      rgd: ech[15],
      cty: ech[2],
      cntpr: ech[3],
      phn: ech[4],
      hcftyp: getCategoryAbbreviation(ech[16]),
      lgn: ech[6],
      ltt: ech[7]
    };
    handleOpen(tempData);
  };

  const createReverseMapping = (abbreviationMap: { [key: string]: string }) => {
    const reverseMap: { [key: string]: string } = {};
    for (const state in abbreviationMap) {
      const abbreviation = abbreviationMap[state];
      reverseMap[abbreviation] = state;
    }
    return reverseMap;
  };
  const reverseStateAbbreviation = createReverseMapping(stateAbbreviation)

  const getStateNameByAbbreviation = (abbreviation: string): string | undefined => {
    return reverseStateAbbreviation[abbreviation];
  };
  const onButtonClicked = (action: string, rw: any) => { };
  const [inputData, setInputData] = useState(props.inputData);
  const [gridData, setGridData] = useState([]);
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };
  const [isLoading, setIsLoading] = useState("Loading Hospital Data ...");

  useEffect(() => {
    let gd: any = utilities(3, "", "");
    let gid: string = gd;
    dispatch({ type: ACTIONS.SETGID, payload: gid });
    // let srch: any = sessionStorage.getItem("srchhcf") || "";
    // if (!srch) {
    refetchFull();

    return;
    // }

    // srch = JSON.parse(srch);
    // ShowHcfList(srch);
  }, [props.path]);

  const GetList = () => {
    if (props.path == "hcflist") {
    } else if (props.path == "cbwtfregtdy") {
    }
  };

  const GetData = () => {
    let api: string = getApiFromBiowaste(props.path);
    let data1 = { val: gridData.length, ...inputData };
    if (props.path == "cbwtfregtdy") {
      data1 = {
        val: state.grdcnt.toString(),
        lvl: "CPCB",
        dtno: "0",
        who: "CPCB",
      };
    } else {
      return;
    }

    return nrjAxiosRequest(api, data1);
  };

  function populateGrid(data: any) {
    let dt: string = GetResponseWnds(data)
    if (dt) {
      if (props.path == "cbwtfregtdy") {
        let i: number = 0;
        while (i < data.data.length) {
          data.data[i]["cbwtfid"] = i + 1;
          i += 1;
        }
      }
      let ary: any = dataStr_ToArray(dt)
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      setIsLoading("");
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      }, 900);
      // setGridData(gridData.concat(data.data))
    } else {
      setIsLoading("Inconvenience is regreted, Data not found, check again..");
    }
  }

  const { data: data2, refetch: refetchG } = useQuery({
    queryKey: [
      "svQry",
      "ListHCF",
      props.path,
      props.inputData,
      gridData.length,
    ],
    queryFn: GetData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  });

  const prvPage = () => {
    navigate("/hcfcbwtf");
  };


  let ttl: string = "";
  let cls: string = "my-4 justify-between  flex ";
  let src: string = sessionStorage.getItem("srchhcf") || "";
  if (src) {
    ttl = "List of HCF (Search)";
    cls = " hidden ";
    // dispatch({type: ACTIONS.CHECK_REQ, payload:1})
  } else {
    if (props.path == "hcflist") {
      ttl = "All HCF under " + sessionStorage.getItem("cbwtfnm") || "";
    } else if (props.path == "hcfbd") {
      ttl = "Bedded HCF under " + sessionStorage.getItem("cbwtfnm") || "";
    } else if (props.path == "hcfnbd") {
      ttl =
        "Non Bedded HCF under " + sessionStorage.getItem("cbwtfnm") || "";
    }
  }

  const GetHCFList = () => {
    let lvl: string = "CBWTFID";
    let who: string = sessionStorage.getItem("hcfbdlst") || "1";
    let dtno = "0"; //0 for todays data and 1 for all
    let val: string = state.grdcnt.toString();
    let gid: string = state.gid;
    if (!gid) {
      let gd: any = utilities(3, "", "")
      gid = gd;
      dispatch({ type: ACTIONS.SETGID, payload: gid })
    }
    let api: string = ""

    // if (props.path == "hcflist") {
    //   api = createGetApi(
    //     "db=nodb|fnct=a193|dll=xrydll",
    //     lvl + "=" + dtno + "=" + who + "=" + val + "=" + gid + '=0'
    //   );
    // } else if (props.path == "hcfbd") {
    //   api = createGetApi(
    //     "db=nodb|fnct=a193|dll=xrydll",
    //     lvl + "=" + dtno + "=" + who + "=" + val + "=" + gid + '=BD'
    //   );
    // } else if (props.path == "hcfnbd") {
    //   api = createGetApi(
    //     "db=nodb|fnct=a193|dll=xrydll",
    //     lvl + "=" + dtno + "=" + who + "=" + val + "=" + gid + '=NB'
    //   );
    // }
    let lvlModified: string = lvl
    if (lvlModified == 'cbwtf') {
      lvlModified = 'CBWTFID';
    }

    const payload: any = postLinux(lvlModified + '=' + who + '=' + val + '=' + dtno + '=' + gid, 'gridDisplay');
    let endpoint = "hcfregtdy";
    if (props.path == "hcfnbd") {
      endpoint = "hcfregtdynb"
    }
    if (props.path == "hcfbd") {
      endpoint = "hcfregtdybh"
    }

    return nrjAxiosRequestBio(endpoint, payload);

    // return nrjAxios({ apiCall: api });

    // let data1 = {}
    // if (props.path == "hcflist") {
    //   let who: string = sessionStorage.getItem("hcfbdlst") || "1";
    //   data1 = {
    //     val: state.grdcnt.toString(),
    //     lvl: "CBWTFID",
    //     dtno: "0",
    //     who: who,
    //   }
    // } else if (props.path == "hcfbd") {
    //   let who: string = sessionStorage.getItem("hcfbdlst") || "1";
    //   who = who + ":BD"
    //   data1 = {
    //     val: state.grdcnt.toString(),
    //     lvl: "CBWTFID",
    //     dtno: "0",
    //     who: who,
    //   };
    // } else if (props.path == "hcfnbd") {
    //   let who: string = sessionStorage.getItem("hcfbdlst") || "1";
    //   who = who + ":NB"
    //   data1 = {
    //     val: state.grdcnt.toString(),
    //     lvl: "CBWTFID",
    //     dtno: "0",
    //     who: who,
    //   };
    // }
    // return nrjAxiosRequest("hcfregtdy", data1);
  };

  const ShowHcfList = (data4: any) => {
    // let dt: string = GetResponseWnds(data4)
    setIsLoading("");
    if (data4 && Array.isArray(data4.data) && data4.data.length) {
      let ary: any = data4.data
      let i: number = 0;
      ary = clrNAValue(ary, state.grdcnt)


      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      }, 900);
      dispatch({ type: ACTIONS.SHOW_LOCATION, payload: 1 });
      dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    }

  };

  // const { data: data4, refetch: refetchHcfList } = useQuery({
  //   queryKey: ["hcflist", inputData.lvl, state.nwRow.length],
  //   queryFn: GetHCFList,
  //   enabled: false,
  //   staleTime: Number.POSITIVE_INFINITY,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  //   onSuccess: ShowHcfList,
  // });

  const { data: dataFull, refetch: refetchFull } = useQuery({
    queryKey: ["hcflist", inputData.lvl, state.nwRow.length],
    queryFn: GetHCFList,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowHcfList,
  });

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
      setOpen1(true);
      setStabiliser1(!stabiliser1);
      dispatch({ type: ACTIONS.TRIGGER_GRIDSRCH, payload: 5 })
      setTimeout(() => {
        dispatch({ type: ACTIONS.TRIGGER_GRIDSRCH, payload: 0 })
      })
    }
  };

  const handleClose1 = () => {
    setOpen1(false);
    setStabiliser1(!stabiliser1);
  };
  const { showToaster, hideToaster } = useToaster();

  const [curpageCount, setCurpageCount] = useState(0)

  const getMore = (data: any) => {
    let pgCnt: number = data.api.paginationProxy.totalPages;
    let curPg: number = data.api.paginationProxy.currentPage;

    setCurPage(curPg + 1);
    if (pgCnt) {
      if ((pgCnt - curPg) <= 1 && curpageCount < pgCnt) {
        refetchFull()
        console.log("called for pagination")
        setCurpageCount(pgCnt);
      }
    }
  }



  let pcw: string = "";
  let phn: string = "";

  const GetFilteredHcf = () => {
    dispatch({ type: ACTIONS.TRIGGER_GRIDSRCH, payload: 5 })
    let filter = { filterName: "", filterValue: hsp };
    let cbwtfid: string = sessionStorage.getItem("hcfbdlst") || "1";
    if (pcw) {
      filter.filterName = "pcw";
      filter.filterValue = pcw;
    } else if (phn) {
      filter.filterName = "phn";
      filter.filterValue = phn;
    }
    // let api = createGetApi(
    //   "db=nodb|dll=x|fnct=a199",
    //   cbwtfid + "=" + `${filter.filterValue}=0=`
    // );
    // return nrjAxios({ apiCall: api });
    const payload: any = postLinux(cbwtfid + '=hcf=' + filter.filterValue, 'gridDisplaySearch');
    return nrjAxiosRequestBio("findInDB", payload);
  };

  const GetFilteredHcfSuccess = (data: any) => {
    // let dt: string = GetResponseWnds(data);
    let dt: any = GetResponseLnx(data);
    if (dt && Array.isArray(dt.data)) {
      let ary: any[] = dt.data
      ary = clrNAValue(ary, 1);
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
      dispatch({ type: ACTIONS.NEWROWDATASRCH, payload: ary });
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRIDSRCH, payload: 0 });
      }, 900);
    }
    else {
      showToaster(["No data received"], "error");
    }
  };

  const { data: dataH, refetch: refetchSearchHcf } = useQuery({
    queryKey: ["filteredHcff", inputData.lvl],
    queryFn: GetFilteredHcf,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: GetFilteredHcfSuccess,
  });


  let hsp: string = "";
  const searchName = () => {
    hsp = getFldValue(state.textDts, "hsp");
    if (hsp) {
      if (hsp.length > 2) {
        refetchSearchHcf();
      }
    }
  };

  const searchCode = () => {
    handleClose1()
    pcw = getFldValue(state.textDts, "pcw");
    refetchSearchHcf();
  }

  const searchMob = () => {
    handleClose1()
    phn = getFldValue(state.textDts, "phn");
    refetchSearchHcf();
  }

  const SvNotFnd = () => {
    let hcf: string = state.textDts;
    hcf = getFldValue(hcf, "hsp")
    if (hcf) {
      refetchSvNot()
    }

  }

  const SvNotSave = () => {
    let hcf: string = state.textDts;
    hcf = getFldValue(hcf, "hsp")
    let api: string = createGetApi("db=nodb|dll=accdll|fnct=a290", inputData.dtno + '=' + hcf)
    return useNrjAxios({ apiCall: api })
  }

  const updtData = (dataN: any) => {
    let dt: string = GetResponseWnds(dataN)
    if (dt) {

    }
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 })
    setTimeout(function () {
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 })
    }, 250)

  }

  const { data: dataN, refetch: refetchSvNot } = useQuery({
    queryKey: ["svnotflnd", state.rndm],
    queryFn: SvNotSave,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: updtData,
  });


  const applicationVersion: string = getApplicationVersion();
  return (
    <>
      {applicationVersion == '1' && <>
        <div>
          <HdrDrp hideHeader={false} formName={ttl}></HdrDrp>
          {/* <HdrDrp formName={ttl}></HdrDrp> */}
        </div>
        <span className="text-center text-normal text-blue-600/75 my-4">
          <h5>{ttl}</h5>
        </span>
      </>}
      <div className="bg-white shadow rounded-lg">


        <div className="px-4">
          <div className="col-span-1 flex justify-end">
            <div className="flex justify-center mt-4">
              <Button
                size="medium"
                className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                variant="contained"
                onClick={handleOpen1}
                style={{ textTransform: "none"}}
              >
                Search health care facility
              </Button>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                size="medium"
                className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                variant="contained"
                onClick={prvPage}
                style={{ textTransform: "none"}}
              >
                {state.btnTxtB}
              </Button>
              {state.showLocation ? <>
                <Button
                  size="medium"
                  style={{
                    backgroundColor: "#38a169",
                    transition: "background-color 0.3s, transform 0.3s",
                    textTransform: "none"
                  }}
                  variant="contained"
                  color="success"
                  disabled={!state.disableB}
                  onClick={() => navigate(`/bhuvanmap?pageNumber=${curPage}${'&'}gid=${state.gid}`)}
                >
                  See locations
                </Button></> : <></>}
            </div>
          </div>
          {showMessage && showMessage.message.length != 0 ? (
            <div className="py-2">
              <Toaster data={showMessage} className={""}></Toaster>
            </div>
          ) : (
            <></>
          )}
          {/* <div className="py-3">
            <i className="fa fa-info-circle text-blue-500" aria-hidden="true"></i> <span className="py-28 px-2 text-center font-normal text-center text-base text-lg">Click on the Name of HCF to Show the Details  of HCF Registred with CBWTF</span>
          </div> */}
          <div className="py-3">
            {!gridData.length && <h3>{isLoading}</h3>}
            <NrjAgGrid
              onGridLoaded={GridLoaded}
              onRowSelected={onRowSelected}
              onButtonClicked={onButtonClicked}
              colDef={props.cols}
              apiCall={""}
              rowData={[]}
              deleteButton={""}
              deleteFldNm={""}
              showDataButton={""}
              showApi={""}
              showFldNm={""}
              newRowOnTop={false}
              className="ag-theme-alpine-blue ag-theme-alpine"
              trigger={state.triggerG}
              newRowData={state.nwRow}
              showPagination={true}
              parentPaginationChanged={getMore}
              widthSerialNoCol={100}
            ></NrjAgGrid>
          </div>
        </div>
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
           
            <Button onClick={handleClose} style={{textTransform: "none"}}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      )}

      {open1 && (
       <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
       <div
         className="bg-white rounded-lg shadow-lg mx-auto p-4 
             max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] 
             max-h-[90vh] overflow-y-auto"
       >
            <Modal open={open1} size="lg" onClose={handleClose1} style={{ marginTop: "40px" }}>
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
                      Label="HCF name"
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
                        style={{textTransform: "none"}}
                      >
                        Search
                      </Button>
                    </div>
                    <div className="ml-2">
                      <Button
                        size="medium"
                        className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                        variant="contained"
                        onClick={SvNotFnd}
                        disabled={true}
                        style={{textTransform: "none"}}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  {showMessage && showMessage.message.length != 0 ? (
                    <div className="py-2">
                      <Toaster data={showMessage} className={""}></Toaster>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div>
                    <NrjAgGrid
                      onGridLoaded={GridLoaded}
                      onRowSelected={onRowSelected}
                      onButtonClicked={onButtonClicked}
                      colDef={props.cols}
                      apiCall={""}
                      rowData={gridData}
                      deleteButton={""}
                      deleteFldNm={""}
                      showDataButton={""}
                      showApi={""}
                      showFldNm={""}
                      newRowOnTop={true}
                      className="ag-theme-alpine-blue ag-theme-alpine"
                      trigger={state.triggerSrch}
                      newRowData={state.nwRowSrch}
                      showPagination={true}
                      parentPaginationChanged={getMore}
                      NoRecordEachCall={300}
                    ></NrjAgGrid>
                  </div>

                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={handleClose1} style={{textTransform: "none"}}>Cancel</Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      )}
    </>
  );
};
export default React.memo(ListHCF);

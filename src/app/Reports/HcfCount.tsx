import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  capitalize,
  createGetApi,
  dataStr_ToArray,
  getApiFromBiowaste,
  getApplicationVersion,
  getStateAbbreviation,
  gridAddToolTipColumn,
  postLinux,
  trimField,
} from "../../utilities/utilities";
import { useReducer, useState } from "react";
import {
  nrjAxios,
  nrjAxiosRequest,
  nrjAxiosRequestBio,
  nrjAxiosRequestLinux,
  useNrjAxios,
} from "../../Hooks/useNrjAxios";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import HdrDrp from "../HdrDrp";
import { getLvl, getMyName, getWho } from "../../utilities/cpcb";
import { useEffectOnce } from "react-use";
import { Button, Tooltip } from "@mui/material";
import { Toaster } from "../../components/reusable/Toaster";
import { useToaster } from "../../components/reusable/ToasterContext";
import moment from "moment";

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
      newstate.triggerG = 0;
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
      } else if (action.payload == 3) {
        if (newstate.disableC == 1) {
          newstate.disableC = 0
        } else {
          newstate.disableC = 1
        }
        return newstate
      }
      return newstate
  }
};

type MyData = {
  groupBy: string;
  mypage: number;
  cols: any[];
};
export default function HcfCount(props: MyData) {
  const [repType, setRepType] = useState(0)
  const [state, dispatch] = useReducer(reducer, initialState);
  const GridLoaded = () => { };

  const onRowSelected = (data: string) => {
    if (data) {
      let ech: any = data.split("|")
      if (ech && ech.length > 2 && ech[2]) {
        sessionStorage.setItem("cbwtfnm", ech[2])
      }
    }
  };

  const onButtonClicked = (action: string, rw: any) => { };
  const [listData, setListData] = useState<any[]>([]);
  const [gridData, setGridData] = useState<any[]>([]);

  const colDefPdf = [
    {
      field: "cbwtfnm",
      width: 300,
       headerName: "Name of CBWTF",
      tooltipField: "tphcf",
      filter: "agTextColumnFilter",
    },
    {
      field: "cty",
      hidden: false,
      width: 150,
      headerName: "City",
    },
    {
      field: "hcfcount",
      width: 140,
      headerName: "Total No. of HCF",
      tooltipField: "tphcf",
    },
    {
      field: "beds",
      width: 140,
      headerName: "Total beds",
    },
    {
      field: "bedded",
      width: 140,
      headerName: "Bedded HCF",
      tooltipField: "tpbd",
    },
    {
      field: "nonbedded",
      width: 140,
      headerName: "Non bedded HCF",
      tooltipField: "tpnobd",
    },
    {
      field: "state",
      width: 150,
      headerName: "State/UT",
    },
    {
      field: "rgd",
      width: 200,
     headerName: "Regional directorate"
    },
  ]

  const pdfColWidth = ['20%', '10%', '15%', '10%', '5%', '10%', '10%', '15%']
  const coldefPrint = [
    {
      field: "",
      width: 300,
       headerName: "Name of CBWTF",
      tooltipField: "tphcf",
      filter: "agTextColumnFilter",
    },
    {
      field: "",
      hidden: false,
      width: 150,
      headerName: "City",
    },
    {
      field: "",
      width: 150,
      headerName: "State/UT",
    },
    {
      field: "rgd",
      width: 200,
      headerName: "Regional directorate",
    },
    {
      field: "hcfcount",
      width: 180,
      headerName: "Health care facility",
      tooltipField: "tphcf",
    },
    {
      field: "beds",
      width: 200,
      headerName: "Total beds",
    },
    {
      field: "bedded",
      width: 200,
      headerName: "Bedded HCF",
      tooltipField: "tpbd",
    },
    {
      field: "nonbedded",
      width: 200,
      headerName: "Non bedded HCF",
      tooltipField: "tpnobd",
    },
  ]
  const printExcelHeader = [
    "CBWTF",
    "City",
    "State",
    "Regional Directorate",
    "Health Care Facility",
    "Total Beds",
    "Bedded HCF",
    "Non Bedded HCF"
  ]
  const keyOrder: string[] = ['cbwtfnm', 'cty', 'state', 'rgd', 'hcfcount', 'beds', 'bedded', 'nonbedded']
  const excelColWidth = [{ wch: 50 }, { wch: 30 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]
  const [isLoading, setIsLoading] = useState("");
  const [showMessage, setShowMessage] = useState<any>({ message: [] })

  useEffectOnce(() => {
    refetchG();
  })

  // const checkNewData = () => {
  //   let lvl: string = sessionStorage.getItem("lvl") || "CPCB";
  //   let lvlfr: string = sessionStorage.getItem("myname")?.toUpperCase() || "1";
  //   if (lvl == "CPCB") {
  //     lvlfr = "0";
  //   }
  //   let gd: string = GetGid();
  //   dispatch({ type: ACTIONS.SETGID, payload: gd });
  //   let api: string = ""
  //   return nrjAxios({ apiCall: api });
  // }

  // const checkNewDataSuccess = (data: any) => {
  //   let dt: string = GetResponseWnds(data);
  //   if (dt) {
  //     let ary: any = dataStr_ToArray(dt);
  //     dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
  //     //dispatchGlobal(storeTableData(ary));
  //     setTimeout(function () {
  //       dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
  //       dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  //     }, 900);
  //   }
  // }

  // const { data: dataNew, refetch: refetchCheckNewData } = useQuery({
  //   queryKey: ['CheckNewDatahcfCbwtf',],
  //   queryFn: checkNewData,
  //   enabled: false,
  //   staleTime: Number.POSITIVE_INFINITY,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  //   onSuccess: checkNewDataSuccess,
  // })


  // function groupItems(array: any[], property: string) {
  //   var reducer = function (groups: any, item: any) {
  //     var name = item[property];
  //     var group = groups[name] || (groups[name] = []);
  //     group.push(item);
  //     return groups;
  //   };
  //   return array.reduce(reducer, {});
  // }

  function updateList(data3: any) {
    //Need to Discuss
    if (data3 && data3.status == 200 && data3.data.length) {
      let ary = data3.data;
      if (props.groupBy == "cbwtfid") {
        let i: number = 0;
        let tempGridData: any[] = [];
        let j: number = 0;
        let cntr: number = 0;
        while (i < ary.length) {
          j = 0;
          while (j < listData.length) {
            if (listData[j]["cbwtfid"] == ary[i]["_id"]) {
              tempGridData.push({
                idsr: i + 1,
                cbwtfid: listData[j].cbwtfid,
                cbwtfnm: listData[j].cbwtfnm,
                stt: listData[j].stt,
                rgd: listData[j].rgd,
                beds: ary[i]["beds"],
                hcfcount: ary[i]["total"],
              });
              cntr = i + 1;
              break;
            }
            j += 1;
          }

          i += 1;
        }

        //Add CBWTF without Beds
        i = 0;
        let fnd: Boolean = false;
        while (i < listData.length) {
          j = 0;
          fnd = false;
          while (j < ary.length) {
            if (ary[j]["_id"] == listData[i]["cbwtfid"]) {
              fnd = true;
              break;
            }
            j += 1;
          }

          if (!fnd) {
            tempGridData.push({
              idsr: cntr,
              cbwtfid: listData[i].cbwtfid,
              cbwtfnm: listData[i].cbwtfnm,
              stt: listData[i].stt,
              rgd: listData[i].rgd,
              beds: 0,
              hcfcount: 0,
            });
            cntr += 1;
          }
          i += 1;
        }

        // setGridData(tempGridData);
        setIsLoading("");
        setListData(tempGridData);
        // dispatch({ type: ACTIONS.NEWROWDATA, payload: tempGridData });
        // dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 });
      } else if (props.groupBy == "rgd") {
        setIsLoading("");
        setListData(ary);
        // dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
        // dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 });
      } else if (props.groupBy == "stt") {
        setListData(ary);
      }
      refetchH();
    }
  }

  const GetDataCbwtf = () => {
    let api: string = getApiFromBiowaste("hcfCnt");
    let data1 = { lvl: "CBWTF" };
    if (props.groupBy == "rgd") {
      data1 = { lvl: "RGD" };
    } else if (props.groupBy == "stt") {
      data1 = { lvl: "STT" };
    }
    return nrjAxiosRequest(api, data1);
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

  const GetDataWnd = () => {
    setIsLoading("Loading data ...")
    // let api: string = getApiFromClinician("show_hcfcntFile");
    let lvl: string = getLvl() || "1";
    let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
    let gd: any = GetGid();
    // let api: string = createGetApi("db=nodb|dll=x|fnct=a164", gd + "=" + lvl + "=" + who);
    let payload: any = postLinux(lvl + '=' + who + '=' + gd, 'hcfcount');
    return nrjAxiosRequestBio("bdcntlvlby", payload);
    //return useNrjAxios({ apiCall: api });
  };

  const ShowGrid = (datawnd: any) => {
    setIsLoading("");
    // let dt: string = GetResponseWnds(datawnd);
    let ary: any = GetResponseLnx(datawnd);
    if (ary && Array.isArray(ary) && ary.length) {

      ary = ary.map((res: any) => {
        let hcfcount = (res.hcfcount && !isNaN(Number(res.hcfcount))) ? Number(res.hcfcount) : 0;
        let beds = (res.beds && !isNaN(Number(res.beds))) ? Number(res.beds) : 0;
        let bedded = (res.bedded && !isNaN(Number(res.bedded))) ? Number(res.bedded) : 0;
        let nonbedded = (res.nonbedded && !isNaN(Number(res.nonbedded))) ? Number(res.nonbedded) : 0;
        return { ...res, hcfcount: hcfcount, beds: beds, bedded: bedded, nonbedded: nonbedded }
      })
      ary = gridAddToolTipColumn(ary, "tphcf", "Click to see Heatlh Care Facilities registered under : ", "", "cbwtfnm");
      ary = gridAddToolTipColumn(ary, "tpbd", "Click to see Bedded Health Care Facilities under : ", "", "cbwtfnm");
      ary = gridAddToolTipColumn(ary, "tpnobd", "Click to see Non Bedded Health Care Facilities under : ", "", "cbwtfnm");
      ary=trimField(ary,"cbwtfnm")
      ary = [...ary].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      //dispatchGlobal(storeTableData(ary))
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 });
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      }, 800);
    }
    else {
      showToaster(['Did not find Data'], 'error');
    }
    // if (datawnd.data[0].bdcntfile.length) {
    //   let ary = datawnd.data[0].bdcntfile;
    //   ary = gridAddToolTipColumn(ary, "tphcf", "Click to see Heatlh Care Facilities registered under : ","", "cbwtfnm");
    //   ary = gridAddToolTipColumn(ary, "tpbd", "Click to see Bedded Health Care Facilities under : ","", "cbwtfnm");
    //   ary = gridAddToolTipColumn(ary, "tpnobd", "Click to see Non Bedded Health Care Facilities under : ","", "cbwtfnm");
    //   dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    //   dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 });
    //   setTimeout(function () {
    //     dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
    //   }, 800);
    // }
  };

  const GetDataLst = () => {
    let api: string = getApiFromBiowaste("hcfCntBed");
    let data1 = { lvl: "CBWTF" };
    if (props.groupBy == "rgd") {
      data1 = { lvl: "RGD" };
    } else if (props.groupBy == "stt") {
      data1 = { lvl: "STT" };
    }
    return nrjAxiosRequest(api, data1);
  };

  const FinalList = (data4: any) => {
    if (state.disableA == 0) {
      dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    }
    if (state.disableB == 0) {
      dispatch({ type: ACTIONS.DISABLE, payload: 2 })
    }
    if (state.disableC == 0) {
      dispatch({ type: ACTIONS.DISABLE, payload: 3 })
    }
    let dt = GetResponseWnds(data4)
    if (dt && dt.indexOf(".pdf") > -1) {
      window.open(dt, "_blank");
    } else {
      showToaster(["Please try again after refreshing the page!"],
        'error')
    }
    dispatch({ type: ACTIONS.RANDOM, payload: 1 })
  }


  const { data: data4, refetch: refetchH } = useQuery({
    queryKey: ["svQr", "gData", props.groupBy],
    queryFn: GetDataLst,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: FinalList,
  });

  const { data: data2, refetch: refetchG } = useQuery({
    queryKey: ["svQry", "gridDisplay", state.rndm],
    queryFn: GetDataWnd,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowGrid,
  });


  const PrntAll = () => {
    let gd: string = state.gid || "";
    let lvl: string = getLvl()
    if (lvl.indexOf("CPCB") > -1) {
      lvl = "cpcb"
    }
    let fltr: string = "0"
    if (repType == 1) {
      fltr = "REG"
    } else if (repType == 2) {
      fltr = "NOTREG"
    }
    let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g112", gd + "=" + fltr + '=' + lvl);
    return useNrjAxios({ apiCall: api });
  };



  const cellClassRulesValues = [
    {
      cellName: 'bedded',
      color: 'red-row',
      value: '0',
      colorEntireRow: true
    },
  ]

  const ratio = [
    { maxNumber: 2, minNumber: 0, equalto: 0, color: 'red-row' },
    { maxNumber: 10, minNumber: 2, equalto: 2, color: 'yellow-row' },
    { maxNumber: 50, minNumber: 10, equalto: 10, color: 'blue-row' }
  ]

  const levelValue: string = 'Level: ' + getLvl() == "CPCB" ? getWho() : getLvl() == "STT" ? "SPCB " + getWho() : getWho() + " " + "REGIONAL DIRECTORATE";

  const prependContent = [
    [
      {
        data: {
          value: 'List of CBWTF (Detailed Report)',
          type: "String",
        },
        mergeAcross: 3
      },
    ],
    [

      {
        data: {
          value: levelValue,
          type: "String",
        },
        mergeAcross: 5
      },
    ],
    [

      {
        data: {
          value: 'Date: ' + moment(Date.now()).format("DD-MMM-yyyy"),
          type: "String",
        },
        mergeAcross: 5
      },
    ],
    [],
  ]

  return (
    <>
      {/* <div className="bg-white">
        <div className="bg-white shadow rounded-lg px-4">
          <div className="absolute font-semibold text-lg">{isLoading}</div>
          {showMessage && showMessage.message.length != 0 ? <div className="py-2">
            <Toaster data={showMessage} className={''}></Toaster>
          </div> : <></>}
          <div className="py-1">
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
              showApi={
                "keyname][hcfbdlst=key][cbwtfid=path][hcflist=cellclicked][CBWTF$^keyname][hcfbdlst=key][cbwtfid=path][hcflist=cellclicked][Health Care Facility$^keyname][hcfbdlst=key][cbwtfid=path][hcfbd=cellclicked][Bedded HCF$^keyname][hcfbdlst=key][cbwtfid=path][hcfnbd=cellclicked][Non Bedded HCF"
              }
              showFldNm={""}
              trigger={state.triggerG}
              newRowData={state.nwRow}
              showPagination={true}
              showTooltips={true}
              className="ag-theme-alpine-blue ag-theme-alpine"
              ratio={ratio}
              MyRoute="hcfcbwtf"
              appName="CPCB"
              cellClassRulesValues={cellClassRulesValues}
              showExport={true}
              KeyOrder={keyOrder}
              pageTitle={"List of CBWTF (Detailed) : "}
              sortBy={'rgd'}
              printExcelHeader={printExcelHeader}
              exceColWidth={excelColWidth}
              lvl={getLvl()}
              who={getWho()}
              pdfColWidth={pdfColWidth}
              colDefPdf={colDefPdf}
            ></NrjAgGrid>
          </div>
        </div>

      </div> */}
       <div className="flex justify-center bg-gray-100">
        <div>
          {showMessage && showMessage.message.length != 0 ? (
            <div className="py-2">
              <Toaster data={showMessage} className={""}></Toaster>
            </div>
          ) : (
            <></>
          )}
        </div>

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
              showApi={
                "keyname][hcfbdlst=key][cbwtfid=path][hcflist=cellclicked][Name of CBWTF$^keyname][hcfbdlst=key][cbwtfid=path][hcflist=cellclicked][Health Care Facility$^keyname][hcfbdlst=key][cbwtfid=path][hcfbd=cellclicked][Bedded HCF$^keyname][hcfbdlst=key][cbwtfid=path][hcfnbd=cellclicked][Non bedded HCF"
              }
              showFldNm={""}
              trigger={state.triggerG}
              newRowData={state.nwRow}
              showPagination={true}
              showTooltips={true}
              className="ag-theme-alpine-blue ag-theme-alpine"
              // rowClassRulesValues={rowClassRulesValues}
              ratio={ratio}
              MyRoute="hcfcbwtf"
              appName="CPCB"
              cellClassRulesValues={cellClassRulesValues}
              showExport={true}
              KeyOrder={keyOrder}
              pageTitle={"List of CBWTF (Detailed) : "}
              sortBy={'rgd'}
              printExcelHeader={printExcelHeader}
              exceColWidth={excelColWidth}
              lvl={getLvl()}
              who={getWho()}
              pdfColWidth={pdfColWidth}
              colDefPdf={colDefPdf}
            ></NrjAgGrid>
      </div>
    </>
  );
}

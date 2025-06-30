import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  capitalize,
  createGetApi,
  dataStr_ToArray,
  getStateAbbreviation,
  gridAddToolTipColumn,
  postLinux,
  svLnxSrvr,
} from "../../utilities/utilities";
import { useEffect, useReducer, useState } from "react";
import {
  nrjAxios,
  nrjAxiosRequest,
  nrjAxiosRequestBio,
  useNrjAxios,
} from "../../Hooks/useNrjAxios";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import HdrDrp from "../HdrDrp";
import { getLvl, getMyName, getWho } from "../../utilities/cpcb";
import { getLCP } from "web-vitals";
import { escapeLeadingUnderscores } from "typescript";
import { useEffectOnce } from "react-use";
import { Tooltip } from "@mui/material";
import {
  storeGidData,
  storeTableData,
} from "../store/feature/Hcf_Cbwtf/hcfCbwtfSlice";
import { useDispatch } from "react-redux/es/hooks/useDispatch";
import { useSelector } from "react-redux";
import { Toaster } from "../../components/reusable/Toaster";
import WtrDate from "../../components/reusable/nw/WtrDate";
import { getFldValue } from "../../Hooks/useGetFldValue";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { UseMomentDateNmb } from "../../Hooks/useMomentDtArry";
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
      newstate.triggerG += 10;
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
      newstate.triggerG = 5;
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
      } else if (action.payload == 2) {
        if (newstate.disableC == 1) {
          newstate.disableC = 0;
        } else {
          newstate.disableC = 1;
        }
        return newstate;
      }
  }
};

type MyData = {
  cols: any[];
};
export default function BrdActvSmry(props: MyData) {
  const [repType, setRepType] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);
  const GridLoaded = () => {};

  const colDefPdf =[
    {
      field: "cbwtfnm",
      width: 400,
       headerName: "Name of CBWTF",
      tooltipField: 'cbwtfnm',
      filter: "agTextColumnFilter",
    },
    {
      field: "state",
      width: 250,
      headerName: "State/UT",
      filter: "agTextColumnFilter",
    },
    {
      field: "rgd",
      width: 250,
      headerName: "Regional directorate",
      filter: "agTextColumnFilter",
    },
    {
      field: "tdyhcf",
      width: 250,
      headerName: "HCF Registered Today",
      filter: "agTextColumnFilter",
    },
    {
      field: "tdybags",
      width: 250,
      headerName: "Waste Bags Received",
      filter: "agTextColumnFilter",
      headerTooltip: "Sum of bags collected from HCF's, Operator and CBWTF",
      tooltipField: "tdybagTool",
    },
  ]

  const pdfColWidth =['30%','15%','15%','15%','15%']
  const onRowSelected = (data: string) => {
    if (data) {
      let ech: any = data.split("|");
      if (ech && ech.length > 2 && ech[2]) {
        sessionStorage.setItem("cbwtfnm", ech[2]);
      }
    }
  };
  const onButtonClicked = (action: string, rw: any) => {};
  const [listData, setListData] = useState<any[]>([]);
  const [gridData, setGridData] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState("");
  const [showMessage, setShowMessage] = useState<any>({ message: [] });

  const getLst = () => {
    dispatch({type: ACTIONS.TRIGGER_GRID, payload:5})
    refetchG();
  };

  const GetGid = () => {
    let g: any = utilities(3, "", "");
    let gd: string = g;
    dispatch({ type: ACTIONS.SETGID, payload: gd });  
    return gd;
  };

  const GetDataWnd = () => {

    setIsLoading("Loading data ...");
    const lvl: string = sessionStorage.getItem("lvl") || "CPCB";
    let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
    const gd: any = GetGid();
    const dt: string = UseMomentDateNmb(getFldValue(state.textDts, "dt_rpt"));
    // const api: string = createGetApi(
    //   "db=nodb|dll=x|fnct=a210",
    //   gd + "=" + dt + "=" + lvl + "=" + who
    // );
    // return useNrjAxios({ apiCall: api });
    const payload: any = postLinux(lvl + '=' + who + '='+ dt + '=' + gd, "cbwtftdy_datacount");  
    return nrjAxiosRequestBio("cbwtftdy_datacount", payload);

  };

  const ShowGrid = (datawnd: any) => {
    setIsLoading("");
    let dt: any = GetResponseLnx(datawnd);
    if (dt && Array.isArray(dt) && dt.length) {
      let rowData:any[] = []
      let ary: any = dt
      if (ary && ary[0]){
        
        rowData = ary.map((res:any)=>{
          if(!isNaN(Number(res.tdybagsh)) && !isNaN(Number(res.tdybagsc)) && !isNaN(Number(res.tdybagsf))){
            return {...res, tdybags: Number(res.tdybagsh) + Number(res.tdybagsc) + Number(res.tdybagsf)}
          }
          else{
            return {...res, tdybags: 0}
          }
        })
         
        rowData = gridAddToolTipColumn(rowData, "tdybagTool", "Sum of bags collected from HCF's, Operator and CBWTF ", "", "");
        dispatch({ type: ACTIONS.SETGID, payload: "" });  
      }
      dispatch({ type: ACTIONS.NEWROWDATA, payload: rowData });
    }
  };

  const FinalList = (data4: any) => {
    let dt = GetResponseWnds(data4);
    if (dt) {
      window.open(dt, "_blank");
    }
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  };

  const { data: data2, refetch: refetchG } = useQuery({
    queryKey: ["svQry", "gridDisplay", state.rndm],
    queryFn: GetDataWnd,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowGrid,
  });

  const UpdtStates = (data5: any) => {
    // console.log(data5)
    if (data5 && data5.status == 200 && data5.data.data.length) {
      let ary: any = data5.data.data;
      let lst: any = listData;
      let i: number = 0;
      let j: number = 0;
      while (i < lst.length) {
        j = 0;
        while (j < ary.length) {
          if (ary[j]["fltr"] == lst[i]["_id"]) {
            lst[i]["_id"] = ary[j]["drpdwn"];
            break;
          }
          j += 1;
        }

        i += 1;
      }
      setIsLoading("");
      dispatch({ type: ACTIONS.NEWROWDATA, payload: lst });
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 });
    }
  };

  let ttl: string = "";
  ttl = "Activity on Portal";

  const PrntAll = () => {
    let gd: string = state.gid || "";
    let lvl: string = getLvl();
    if (lvl.indexOf("entral") > -1) {
      lvl = "cpcb";
    }
    let fltr: string = "0";
    if (repType == 1) {
      fltr = "REG";
    } else if (repType == 2) {
      fltr = "NOTREG";
    }
    let api: string = createGetApi(
      "db=nodb|dll=chqdll|fnct=g112",
      gd + "=" + fltr + "=" + lvl
    );
    return useNrjAxios({ apiCall: api });
  };

  const PrintAll = () => {
    setRepType(0);
    let gd: string = state.gid || "";
    if (!gd) {
      let gid: any = utilities(3, "", "");
      let gd: string = gid;
      dispatch({ type: ACTIONS.SETGID, payload: gd });
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });

    setTimeout(() => {
      if (gd) {
        refetchPrnt();
      }
    }, 500);
  };

  const PrintReg = () => {
    let gd: string = state.gid || "";
    setRepType(1);
    if (!gd) {
      let gid: any = utilities(3, "", "");
      let gd: string = gid;
      dispatch({ type: ACTIONS.SETGID, payload: gd });
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    setTimeout(() => {
      if (gd) {
        refetchPrnt();
      }
    }, 500);
  };
  const { showToaster, hideToaster } = useToaster();

  const PrintNonReg = () => {
    let rpt : string = state.gid
    if (rpt && rpt.indexOf(".pdf")>-1){
      window.open(rpt, "_blank")
    }else {
      showToaster( ["Please try again after refreshing the page!"],
        'error')
    }

  };

  const { data: dataprnt, refetch: refetchPrnt } = useQuery({
    queryKey: ["prntall", state.rndm],
    queryFn: PrntAll,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: FinalList,
  });

  // const parentPagination = (data: any) => {
  //   if (
  //     data.api.paginationProxy.totalPages -
  //       data.api.paginationProxy.currentPage <=
  //     1
  //   ) {
  //     refetchG()
  //   }
  // };

  const rowClassRulesValues = {
    numerator: "bedded",
    denominator: "nonbedded",
  };

  const cellClassRulesValues = [
    {
      cellName: "rgd",
      color: "yellow-row",
      value: "BENGALURU",
    },
    {
      cellName: "rgd",
      color: "blue-row",
      value: "BHOPAL",
    },
    {
      cellName: "rgd",
      color: "green-row",
      value: "PUNE",
    },
    {
      cellName: "stt",
      color: "grren-row",
      value: "MP",
    },
    {
      cellName: "stt",
      color: "orange-row",
      value: "MH",
    },
  ];

  const ratio = [
    { maxNumber: 2, minNumber: 0, equalto: 0, color: "red-row" },
    { maxNumber: 10, minNumber: 2, equalto: 2, color: "yellow-row" },
    { maxNumber: 50, minNumber: 10, equalto: 10, color: "blue-row" },
  ];

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    dispatch({ type: ACTIONS.SETGID, payload: "" });  
  };


      const printExcelHeader = ["CBWTF","State", "Regional Directorate", "HCF Registered Today", "Waste Bags Received", "Active Vehicles"]
      const KeyOrder: string[] = ['cbwtfnm','state','rgd','tdyhcf', 'tdybags', 'route',]
      const excelColWidth = [{wch: 50},{wch: 30},{wch: 30}, {wch: 30}, {wch: 30}, {wch: 30}]


  return (
    <>
      <div className="bg-white   ">
        {/* <div>
          <HdrDrp hideHeader={false} formName={""}></HdrDrp>
          
        </div>
        <Tooltip title="List of CBWTF Registere with summary of HCF registered with Bed Count">
          <span className="text-center text-bold mt-3 text-blue-600/75">
            <h5>{ttl}</h5>
          </span>
        </Tooltip> */}

        <div className="shadow rounded-lg">
          <div className="col-span-10 flex justify-end">
            <div className="mt-4">
              <Tooltip title="Select Date of Report">
                {/* <WtrDate
                  Label="Date"
                  fldName="dt_rpt"
                  idText="txtdt_rpt"
                  onChange={onChangeDts}
                  displayFormat="dd-MMM-yyyy"
                ></WtrDate> */}
                 <NrjRsDt
                    onChange={onChangeDts}
                    Label=""
                    idText="txtdt_rpt"
                    selectedValue={state.frmData}
                    fldName='dt_rpt'
                    speaker={"Enter Date of Expiry of Licence"}
                    
                  ></NrjRsDt>
              </Tooltip>
            </div>
            <div className="flex  mt-4">
              <Tooltip title="get List of CBWTF, who HAVE registered any HCF">
                <button
                  onClick={getLst}
                  className="mx-2 bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                >
                  Get Details
                </button>
              </Tooltip>
            </div>
          </div>
          <div className="absolute font-semibold text-lg">{isLoading}</div>
          {showMessage && showMessage.message.length != 0 ? (
            <div className="relative py-2">
              <Toaster data={showMessage} className={""}></Toaster>
            </div>
          ) : (
            <></>
          )}
          <div className="py-5">
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
              showFldNm={""}
              trigger={state.triggerG}
              newRowData={state.nwRow}
              showPagination={true}
              showTooltips={true}
              className="ag-theme-alpine-blue ag-theme-alpine"
              appName="CPCB"
              showExport={true}
              prependContent={[]}
              KeyOrder={KeyOrder}
              lvl={getLvl()}
              who={getWho()}
              pageTitle={"CBWTF daily activity snapshot for a date"}
              sortBy={'cbwtfnm'}
              printExcelHeader={printExcelHeader}
              exceColWidth={excelColWidth}
              pdfColWidth={pdfColWidth}
              colDefPdf={colDefPdf}
            ></NrjAgGrid>
          </div>
        </div>
      </div>
    </>
  );
}

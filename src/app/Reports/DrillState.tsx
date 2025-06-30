import { useQuery } from "@tanstack/react-query";
import utilities, { GetResponseWnds, createGetApi, dataStr_ToArray, getApiFromClinician } from "../../utilities/utilities";
import { useEffect, useReducer, useState } from "react";
import { nrjAxios, nrjAxiosRequest } from "../../Hooks/useNrjAxios";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import HdrDrp from "../HdrDrp";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@mui/material";

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
      } else if (action.payload == 2) {
        if (newstate.disableC == 1) {
          newstate.disableC = 0
        } else {
          newstate.disableC = 1
        }
        return newstate
      }
  }
};




export default function DrillState(props: any) {

  const [state, dispatch] = useReducer(reducer, initialState);
  const [gridData, setGridData] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState("Loading Data ...");
  const [rgnDr, setRgnDr] = useState('');
  const navigate = useNavigate();
  const colDef = [
    { field: "stt", width: 500, headerName: "State/UT"},
    { field: 'sttid', hide: true, width: 100, headerName: "sttid"},
    { field: "id", hide: true, width: 300, headerName: "id"},
    { field: "shrt", hide: true, width: 100, headerName: "shrt"},
  ]

  const GridLoaded = () => { };

  const onRowSelected = (data: string) => {
  };

  const onButtonClicked = (action: string, rw: any) => { 
    let path = searchParams.get("path") || '';
    if(action == 'Explore'){
      // console.log(rw.stt)
      // console.log(rw.state)
      sessionStorage.setItem('drillnm', rw.cpcbof);
      sessionStorage.setItem('drilllvl', 'STT');
      sessionStorage.setItem('drillfr', rw.shrt.replaceAll(' ','').toUpperCase())
      sessionStorage.setItem("drillid",rw.id);
      navigate('/'+ path);
    }
    else if(action == 'Go to lower level'){
      navigate(`/drillCbwtf?path=${path}&rgd=${rgnDr}&state=${rw.sttid}`)
    }
  };


  let rgd:string = ''; 

  useEffect(()=>{
    rgd = searchParams.get("rgd") || '';
    setRgnDr(rgd);
    refetchL();
  },[])

  const GetDataState = () => {
      let api : string = createGetApi("db=nodb|dll=hospdll|fnct=102", rgd+'=sll903' );
      return nrjAxios({apiCall : api})
  };

  const ShowGrid = (data:any) => {
    setIsLoading("");
    let dt : string = GetResponseWnds(data);
    if (dt) {
      let ary : any = dataStr_ToArray(dt)
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 });
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      }, 800);
    }
  };


  const { data:data, refetch: refetchL } = useQuery({
    queryKey: ["GetDataState", props.groupBy],
    queryFn: GetDataState,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowGrid,
  });

  const upperLevel = ()=>{
    
    let path = searchParams.get("path") || '';
    navigate(`/drillRgd?path=${path}`)
  }

  // const parentPagination = (data: any) => {
  //   if (
  //     data.api.paginationProxy.totalPages -
  //       data.api.paginationProxy.currentPage <=
  //     1
  //   ) {
  //     refetchL()
  //   }
  // };

  return (
    <>
      <div className="bg-white   ">
        <div>
          <HdrDrp hideHeader={false} formName={""}></HdrDrp>
        </div>
        <span className="text-center text-bold mt-3 text-blue-600/75">
          <h5>Regional Directorate</h5>
        </span>

        <div className="shadow rounded-lg">
        <div className="flex flex-wrap items-center  justify-between md:m-3">
                        <div className="flex-grow">
                        </div>
                        <div className="flex items-center">
                            <div className='mt-2'>
                                <Button
                                    size="medium"
                                    style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
                                    variant="contained"
                                    color="success"
                                    disabled={!state.disableB}
                                    onClick={upperLevel}
                                >
                                    Go to upper level
                                </Button>
                            </div>
                        </div>
                    </div>
        

          <div className="py-2">
            {!gridData.length && <h3>{isLoading}</h3>}
            <NrjAgGrid
              onGridLoaded={GridLoaded}
              onRowSelected={onRowSelected}
              onButtonClicked={onButtonClicked}
              colDef={colDef}
              apiCall={""}
              rowData={gridData}
              deleteButton={"Explore"}
              deleteFldNm={"Explore"}
              // showDataButton={"Go to lower level"}
              showApi={""}
              showFldNm={"Drill"}
              trigger={state.triggerG}
              newRowData={state.nwRow}
              showPagination={true}
              className="ag-theme-alpine-blue ag-theme-alpine"
            ></NrjAgGrid>
          </div>
        </div>
      </div>
    </>
  );
}
import React, { useReducer, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  svLnxSrvr,
} from "../../utilities/utilities";
import { Button, SvgIcon } from "@mui/material";
import { validForm } from "../../Hooks/validForm";

import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { useNrjAxios } from "../../Hooks/useNrjAxios";
import { Navigate, useNavigate } from "react-router-dom";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import HdrDrp from "../HdrDrp";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { useEffectOnce } from "react-use";

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

//const [state, dispatch] = useReducer(reducer, initialState);

const ListWrngHCFCode = () => {
  //#############Constants for the State and other functions
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mainId, setMainId] = useState("");
  const [textDts, setTextDts] = useState("");
  const reqFlds = [
    { fld: "lwrngHcf", msg: "Please Select a Date", chck: "length" },
  ];
  const coldef = [
    { field: "id", hide: true, width: 0, headerName: "" },
    {
      field: "cbwtf",
      hide: false,
      width: 150,
       headerName: "Name of CBWTF",
      filter: "agTextColumnFilter",
    },
    { field: "state", hide: false, width: 150, headerName: "State/UT" },
    { field: "cty", hide: false, width: 150, headerName: "City" },
    {
      field: "contprsn",
      hide: false,
      width: 150,
      headerName: "Contact person",
    },
    { field: "mob", hide: false, width: 150, headerName: "Mobile" },
    { field: "eml", hide: false, width: 150, headerName: "E Mail" },
    {
      field: "rgd",
      hide: false,
      width: 150,
      headerName: "Regional directorate",
    },
    { field: "hcfcod", hide: false, width: 150, headerName: "HCF Code" },
    { field: "count", hide: false, width: 150, headerName: "Count" },
  ];

  const rowData = [{ id: "1", dts: "ABC", lnk: "BBBBB" }];
  const onRowSelected = (data: string) => {
    // alert(data)
  };

  const GridLoaded = () => {};
  const onButtonClicked = (action: string, rw: any) => {};
  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  };
  //#############Function calls
  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };
  const HandleSaveClick = () => {
    let api: string = state.textDts;
    /* Uncomment for the new row in grid
        let ary : any = dataStr_ToArray(api);
        dispatch({type:ACTIONS.NEWROWDATA, payload : ary});
        setTimeout(function(){
          dispatch({type:ACTIONS.TRIGGER_GRID, payload : 0});
        },1500);
        */
    api = svLnxSrvr("", api, "", "shrtrm", "ha0incinrt", state.mainId, "");
    return useNrjAxios({ apiCall: api });
  };

  const SaveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    //console.log(msg)
    if (msg && msg[0]) {
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    refetch();
  };

  const svdQry = (data: any) => {
    // let ech: any[];
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });

    let dt: string = "";
    if (data && data.data && data.data["Status"]) {
      dt = data.data["Status"];
      let ech: string[] = dt.split("#");
      if (ech && ech[0]) {
        setMainId(ech[0]);
      }
    }
    // let str: string = GetResponseWnds(data)
    // if (str) {
    //     ech = str.split("#");
    //     if (ech && ech[0]) {
    //         if (Number(ech[0]) > -1) {

    //         }
    //         dispatch({ type: ACTIONS.MAINID, payload: Number(ech) });
    //         // setShowMessage({
    //         //     message: ["Data Saved Successfully"],
    //         //     type: "success",
    //         // });

    //         setTimeout(function () {
    //             dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
    //         }, 1000);
    //     }
    // }
  };

  const { data, refetch } = useQuery({
    queryKey: ["svQry", state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });

  const [frmData, setFrmData] = useState("");

  const GetData = () => {
    let gd: any = utilities(3, "", "");
    let gid: string = gd;
    dispatch({ type: ACTIONS.SETGID, payload: gid });
    let dt : string = state.textDts;
    if (dt){
        dt = getFldValue(data, "dt_wrn")
    }else {
        dt = "0"
    }
    let api: string = createGetApi("db=nodb|dll=x|fnct=a162", dt+ "=" + gid);
    // console.log(api)
    return useNrjAxios({ apiCall: api });
  };

  const ShowData = (datab: any) => {
    let dt: string = GetResponseWnds(data);
    if (dt) {
      let ary: any = dataStr_ToArray(dt);

      dispatch({ type: ACTIONS.SETFORM_DATA, payload: ary });
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      }, 1000);
    }
  };
  const { data: datab, refetch: refetchB } = useQuery({
    queryKey: ["getQry", state.rndm],
    queryFn: GetData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  // const parentPagination = (data: any) => {
  //     if (
  //       data.api.paginationProxy.totalPages -
  //         data.api.paginationProxy.currentPage <=
  //       1
  //     ) {
  //         refetchB()
  //     }
  //   };

  useEffectOnce(() => {
    refetchB();
  });
  return (
    <>
      <div className="bg-white   ">
        <div>
          <HdrDrp hideHeader={false}></HdrDrp>
        </div>
        <span className="text-center text-bold text-blue-600/75">
          <h5>List of Wrong HCF Code</h5>
        </span>
        <div className="shadow rounded-lg">
          <div className=" pt-4 my-4 flex justify-between ">
            <div className="d-flex">
              <div>
                <NrjRsDt
                  Label=""
                  fldName="dt_wrn"
                  idText="txtdt_wrn"
                  onChange={onChangeDts}
                  format={"yyyy-MM"}
                  speaker={"Please select a Date"}
                  delayClose={1000}
                  selectedValue={frmData}
                ></NrjRsDt>
              </div>
              <div>
                <Button
                  size="medium"
                  style={{ backgroundColor: "#0F8EC6",textTransform: "none" }}
                  variant="contained"
                  color="success"
                  disabled={!state.disableA}
                  onClick={SaveClick}
                  startIcon={false}
                  className="mx-4"
                >
                  Get
                </Button>
              </div>
            </div>
            <div className=" ">
              <Button
                size="medium"
                style={{ backgroundColor: "#0F8EC6",textTransform: "none" }}
                variant="contained"
                color="success"
                onClick={SaveClick}
                startIcon={false}
                disabled={!state.disableB}
              >
                Print
              </Button>
            </div>
          </div>
          <NrjAgGrid
            onButtonClicked={onButtonClicked}
            onGridLoaded={GridLoaded}
            onRowSelected={onRowSelected}
            colDef={coldef}
            apiCall={""}
            rowData={rowData}
            deleteButton={""}
            deleteFldNm={"iddel"}
            trigger={state.triggerG}
            newRowData={state.nwRow}
            showPagination={true}
            MyRoute="ListWrngHCFCode"
            appName="CPCB" 
            PageSize={20}
            className="ag-theme-alpine-blue ag-theme-alpine"
          ></NrjAgGrid>
        </div>
      </div>
    </>
  );
};
export default React.memo(ListWrngHCFCode);

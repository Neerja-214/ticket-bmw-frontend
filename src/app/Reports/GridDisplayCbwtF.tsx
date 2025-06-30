import {
  Button
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  ChangeCase,
  getApiFromBiowaste
} from "../../utilities/utilities";
import React, { useEffect, useReducer, useState } from "react";
import { nrjAxios, nrjAxiosRequest } from "../../Hooks/useNrjAxios";
import WtrInput from "../../components/reusable/nw/WtrInput";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import { getFldValue } from "../../Hooks/useGetFldValue";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { act } from "react-dom/test-utils";
import HdrDrp from "../HdrDrp";
import {getLvl} from "../../utilities/cpcb";
import {getWho} from "../../utilities/cpcb"
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
  frmt: 0,
  grdcnt: 0,
  combostr: "",
  cmbLabelA: "CBWTF",
  cmbLabelB: "",
  cmbLabelC: "",
  combostrB: "",
  combostrC: "",
  btnTxtA: "Previous",
  btnTxtB: "More",
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
  frmt: number;
  grdcnt: number;
  combostr: string;
  cmbLabelA: string;
  cmbLabelB: string;
  cmbLabelC: string;
  combostrB: string;
  combostrC: string;
  btnTxtA:string;
  btnTxtB:string;
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
      if (action.payload == 5){
        newstate.grdcnt =0;
        newstate.nwRow = [];
      }
      return newstate;
      case ACTIONS.SETBUTTONTEXT:
        if (action.payload == 1){
          newstate.btnTextA = "Get list"
          newstate.btnTextB = "More.."
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
        }else if (action.payload == 2) {
            if (newstate.disableC == 1) {
                newstate.disableC = 0
            } else {
                newstate.disableC = 1
            }
            return newstate
        }
  }
};

const GridDisplayCbwtF =(props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const GridLoaded = () => {};
  const onRowSelected = (data: string) => {};
  const onButtonClicked = (action: string, rw: any) => {
    
  };
  const [inputData, setInputData] = useState(props.inputData || {lvl:'CPCB', who:'CENTRAL'});
  const RgdList =
    "id][LUCKNOW=text][LUCKNOW$^id][PUNE=text][PUNE$^id][BHOPAL=text][BHOPAL$^id][CHANDIGARH=text][CHANDIGARH$^id][KOLKATA=text][KOLKATA$^id][SHILLONG=text][SHILLONG$^id][VADODRA=text][VADODRA$^id][CHENNAI=text][CHENNAI$^id][BENGALURU=text][BENGALURU";
  const stateList =
    "id][AP=text][Andhra Pradesh$^id][AR=text][Arunachal Pradesh$^id][AS=text][Assam$^id][BR=text][Bihar$^id][CG=text][Chattisgarh$^id][GA=text][Goa$^id][GJ=text][Gujarat$^id][HR=text][Haryana$^id][HP=text][Himachal Pradesh$^id][JK=text][Jammu and Kashmir$^id][JH=text][Jharkhand$^id][KA=text][Karnataka$^id][KL=text][Kerala$^id][MP=text][Madhya Pradesh$^id][MH=text][Maharashtra$^id][MN=text][Manipur$^id][ML=text][Meghalaya$^id][MZ=text][Mizoram$^id][NL=text][Nagaland";
  const [gridData, setGridData] = useState([]);

  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };

  const onChangelvl = (data: string) => {
    
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    // console.log(dt)

    setInputData({ ...inputData, lvl: dt });
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    setTimeout(function () {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      refetchStList()
    }, 1000);
  };
  const onChangewho = (data: string) => {
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    setInputData({ ...inputData, who: dt });
    setTimeout(function () {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      refetchcbwtf()
    }, 1000);
  };
  const onChangedt = (data: string) => {
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    setInputData({ ...inputData, dtno: dt });
  };

  const onChangecbwtfid = (data: string) => {
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    // console.log(dt)
    setInputData({ ...inputData, dtno: dt });
  };

  const [isLoading, setIsLoading] = useState("Loading Hospital Data ...");

  useEffect(() => {
    if (props.path == "hcfregtdy") {
      dispatch({ type: ACTIONS.SETFORMAT, payload: 2 });
      dispatch({ type: ACTIONS.COMBOLABEL, payload: 2 });
      dispatch({ type: ACTIONS.SETBUTTONTEXT, payload: 1 });
      dispatch({type: ACTIONS.TRIGGER_GRID, payload : 5})
      setTimeout(function(){
        dispatch({type: ACTIONS.TRIGGER_GRID, payload : 0})
      },900)
      refetchCmb();
      return;
    } else if (props.path == "cbwtfregtdy"){
      dispatch({ type: ACTIONS.SETFORMAT, payload: 0 });
      dispatch({ type: ACTIONS.COMBOLABEL, payload: 0 });
      dispatch({ type: ACTIONS.SETBUTTONTEXT, payload: 1 });
      refetchG();  
      dispatch({type: ACTIONS.TRIGGER_GRID, payload : 5})
      setTimeout(function(){
        dispatch({type: ACTIONS.TRIGGER_GRID, payload : 0})
      },900)
    }
    
    
  }, [props.path]);

  const GetList = () => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    if (props.path == "hcfregtdy") {
      refetchHcfList();
      return;
    }
  };

  const GetData = () => {
    let api: string = getApiFromBiowaste(props.path);
    let lvl = getLvl()
    let who = getWho()
    let data1 = { val: gridData.length, ...inputData };
    if (props.path == "cbwtfregtdy") {
      data1 = {
        val: state.grdcnt.toString(),
        lvl: lvl,
        dtno: "0",
        who: "CPCB",
      };
    } else {
      return;
    }

    return nrjAxiosRequest(api, data1);
  };

  const GetDataCombo = () => {
    let api: string = getApiFromBiowaste("rgdlst");
    setIsLoading("");
    let data1 = { val: gridData.length, ...inputData };
    if (props.path == "hcfregtdy") {
      data1 = {
        val: "0",
        lvl: "CPCB",
        dtno: "0",
        who: "CPCB",
      };
    }
    return nrjAxiosRequest(api, data1);
  };

  const cbwtCombo = (data3: any) => {
    if (data3 && data3.status == 200 && data3.data.data) {
      if (props.path == "hcfregtdy") {
        let i: number = 0;
        let strCmbo: string = "";
        while (i < data3.data.data.length) {
          if (strCmbo) {
            strCmbo += "$^";
          }
          let ps : number = i +1;
          strCmbo += "id][" + ps.toString() + "=";
          strCmbo += "txt][" + data3.data.data[i]["drpdwn"];
          i += 1;
        }
        dispatch({ type: ACTIONS.SETCOMBOSTR, payload: strCmbo });
        // console.log(strCmbo)
        return;
      }
    }
  };

  function populateGrid(data: any) {
    if (data && data.status == 200 && data.data) {
      if (props.path == "cbwtfregtdy") {
        let i: number = 0;
        while (i < data.data.length) {
          data.data[i]["cbwtfid"] = i + 1;
          if (data.data[i]['addra'] == "NA"){
            data.data[i]['addra'] = ""
          }
          if (data.data[i]['addrb'] == "NA"){
            data.data[i]['addrb'] = ""
          }
          if (data.data[i]['addrc'] == "NA"){
            data.data[i]['addrc'] = ""
          }
          data.data[i]["_id"] = ""
          
          i += 1;
        }
      }
      data.data = ChangeCase(data.data, "cbwtfnm#addra#addrb#addrc#cty#contprnm#state")
      // dispatch({ type: ACTIONS.NEWROWDATA, payload: data.data });
      setIsLoading("");
      
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 6 });
      setGridData(gridData.concat(data.data))
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      }, 900);
    } else {
      setIsLoading("Inconvenience is regreted, Data not found, check again..");
    }
  }

  const { data: data2, refetch: refetchG } = useQuery({
    queryKey: ["svQry", "gridDisplay", props.inputData, gridData.length],
    queryFn: GetData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  });

  const { data: data3, refetch: refetchCmb } = useQuery({
    queryKey: ["cmblst", props.path, gridData.length],
    queryFn: GetDataCombo,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: cbwtCombo,
  });

  const GetCBWTF = () => {
    let api: string = getApiFromBiowaste("cbwtfregtdy");
    setIsLoading("");
    let data1 = { val: gridData.length, ...inputData };
    if (props.path == "hcfregtdy") {
      let who : string = inputData.who;
      let ech:any[] =  who.split("|")
      who = ech[1]
      data1 = {
        val: "0",
        lvl: "STT",
        dtno: "0",
        who: who,
      };
    }
    return nrjAxiosRequest(api, data1);
  };

  const cmbocbwtf = (datacbwtf: any) => {
    if (datacbwtf && datacbwtf.status == 200 && datacbwtf.data) {
      if (props.path == "hcfregtdy") {
        let i: number = 0;
        let strCmbo: string = "";
        while (i < datacbwtf.data.length) {
          if (strCmbo) {
            strCmbo += "$^";
          }
          strCmbo += "id][" + datacbwtf.data[i]["cbwtfid"]  + "=";
          strCmbo += "txt][" + datacbwtf.data[i]["cbwtfnm"];
          i += 1;
        }
        dispatch({ type: ACTIONS.SETCOMBOSTRC, payload: strCmbo });
        
        return;
      }
    }
  };

  const { data: datacbwtf, refetch: refetchcbwtf } = useQuery({
    queryKey: ["cbwtf", inputData.who, inputData.lvl],
    queryFn: GetCBWTF,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: cmbocbwtf,
  });

  const getMoreData = () => {
    if (props.path == "hcfregtdy") {
      dispatch({type:ACTIONS.COMBOLABEL, payload:1})
      refetchHcfList();
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    refetchG();
  }

  const getBtnA = () => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    if (props.path == "hcfregtdy") {
      refetchHcfList();
      return;
    }
    
  }
  let ttl: string = "";
  if (props.path == "cbwtfregtdy") {
    ttl = "COMMON BIOMEDICAL WASTE TREATMENT FACILITY";
  } else if (props.path == "hcfregtdy") {
    ttl = "HEALTH CARE FACILITY";
  }

  const GetHCFList = () => {
    let api: string = getApiFromBiowaste("hcfregtdy");
    let data1 = { val: gridData.length, ...inputData };
    if (props.path == "hcfregtdy") {
      let who : string = inputData.dtno;
      let ech: any[] = who.split("|")
      who = ech[0]
      data1 = {
        val: state.grdcnt.toString(),
        lvl: "CBWTFID",
        dtno: "0",
        who: who,
      };
    }
    return nrjAxiosRequest(api, data1);
  };

  const GetSttList = () => {
    let api: string = getApiFromBiowaste("sttrgd");
    let data1 = { val: gridData.length, ...inputData };
    if (props.path == "hcfregtdy") {
      let strRgd : string = inputData.lvl;
      let dts : any[] = strRgd.split("|")
      strRgd = dts[1]
      data1 = {
        rgd: strRgd,
      };
    }
    return nrjAxiosRequest(api, data1);
  };

  const sttCombo = (datastt: any) => {
    if (datastt && datastt.status == 200 && datastt.data) {
      if (props.path == "hcfregtdy") {
        let i: number = 0;
        let strCmbo: string = "";
        while (i < datastt.data.data.length) {
          if (strCmbo) {
            strCmbo += "$^";
          }
          let ps : number = i +1;
          strCmbo += "id][" + ps.toString() + "=";
          strCmbo += "txt][" + datastt.data.data[i]["drpdwn"];
          i += 1;
        }
        dispatch({ type: ACTIONS.SETCOMBOSTRB, payload: strCmbo });
        
        return;
      }
    }
  };

  const ShowHcfList = (data4: any) => {
    console.log(data4);
    if (data4 && data4.status == 200 && data4.data) {
      if (props.path == "hcfregtdy") {
        let i: number = 0;

        while (i < data4.data.length) {
          data4.data[i]["cbwtfid"] = 1 + i + state.grdcnt;
          i += 1;
        }
        dispatch({ type: ACTIONS.NEWROWDATA, payload: data4.data });
        setTimeout(function(){
          dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        },900)
      }
    }
  };

  const { data: data4, refetch: refetchHcfList } = useQuery({
    queryKey: ["hcflist", inputData.lvl, state.nwRow.length],
    queryFn: GetHCFList,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowHcfList,
  });


  const { data: datastt, refetch: refetchStList } = useQuery({
    queryKey: ["sttlist", inputData.lvl ],
    queryFn: GetSttList,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: sttCombo,
  });

  return (
    <>
      <HdrDrp formName={ttl}></HdrDrp>
      <div style={{ margin: "3%" }}>
        <div className="grid grid-cols-3 ">
          <div className="">
            {state.frmt > 0 && (
              <>
                <WtrRsSelect
                  Label={state.cmbLabelA}
                  fldName="lvlid"
                  idText="txtlvlid"
                  onChange={onChangelvl}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  allwZero={"0"}
                  fnctCall={false}
                  dbCon={""}
                  typr={""}
                  loadOnDemand={state.combostr}
                  dllName={""}
                  fnctName={""}
                  parms={""}
                  allwSrch={false}
                ></WtrRsSelect>
              </>
            )}
          </div>
          <div className="">
            {state.frmt == 2 && (
              <>
                <WtrRsSelect
                     Label="Regional Directorate"
                  fldName="whoid"
                  idText="txtwhoid"
                  onChange={onChangewho}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  allwZero={"0"}
                  fnctCall={false}
                  dbCon={""}
                  typr={""}
                  loadOnDemand={state.combostrB}
                  dllName={""}
                  fnctName={""}
                  parms={""}
                  allwSrch={false}
                ></WtrRsSelect>
              </>
            )}
          </div>
          <div className="">
            {state.frmt == 2 && (
              <>
                <WtrRsSelect
                    Label="State"
                  fldName="cbwtfid"
                  idText="txtcbwtfid"
                  onChange={onChangecbwtfid}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  allwZero={"0"}
                  fnctCall={false}
                  dbCon={""}
                  typr={""}
                  loadOnDemand={state.combostrC}
                  dllName={""}
                  fnctName={""}
                  parms={""}
                  allwSrch={false}
                ></WtrRsSelect>
              </>
            )}
          </div>
          <div>
            <div className="mx-2 mt-1">
              {state.frmt == 1  && (
                <>
                  <Button
                    size="medium"
                    style={{ backgroundColor: "#3B71CA",textTransform: "none"}}
                    variant="contained"
                    color="success"
                    disabled={!state.disableC}
                    onClick={() => {
                      GetList();
                    }}
                  >
                    Get list
                  </Button>
                </>
              )}
            </div>
          </div>

          {state.frmt > 2 && (
            <>
              <WtrInput
                Label="CBWTF ID"
                fldName="cbwtfid"
                idText="txtcbwtfid"
                onChange={onChangecbwtfid}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn=""
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
              ></WtrInput>
            </>
          )}

          {/* {inputData.lvl == "RGD" && (
            <div className="mb-2">
              <WtrRsSelect
                Label="Who"
                fldName="whoid"
                idText="txtwhoid"
                onChange={onChangewho}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                allwZero={"0"}
                fnctCall={false}
                dbCon={""}
                typr={""}
                loadOnDemand={RgdList}
                dllName={""}
                fnctName={""}
                parms={""}
                allwSrch={true}
              ></WtrRsSelect>
            </div>
          )}
          {inputData.lvl == "STT" && (
            <div className="mb-2">
              <WtrRsSelect
                Label="Who"
                fldName="who"
                idText="txtwho"
                onChange={onChangewho}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                allwZero={"0"}
                fnctCall={false}
                dbCon={""}
                typr={""}
                loadOnDemand={stateList}
                dllName={""}
                fnctName={""}
                parms={""}
                allwSrch={true}
              ></WtrRsSelect>
            </div>
          )}

          <div className="mb-2">
            {state.frmt > 2 && (
              <>
                <WtrRsSelect
                  Label="Date"
                  fldName="dt"
                  idText="txtdt"
                  onChange={onChangedt}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  allwZero={"0"}
                  fnctCall={false}
                  dbCon={""}
                  typr={""}
                  loadOnDemand={"id][0=txt][All Data$^id][1=txt][Today's Data"}
                  dllName={""}
                  fnctName={""}
                  parms={""}
                  allwSrch={true}
                ></WtrRsSelect>
              </>
            )}
          </div> */}
        </div>
        <div
          className="flex justify-center"
          style={{ marginTop: "34px" }}
        ></div>
        <div className="my-4 flex justify-between">
          <Button
            size="medium"
            style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
            variant="contained"
            color="success"
            disabled={!state.disableA}

            onClick={getBtnA}
          >
            {state.btnTextA}
          </Button>
          {/* <Button
            size="medium"
            style={{ backgroundColor: "#3B71CA" }}
            variant="contained"
            color="success"
            disabled={!state.disableB}
            onClick={getMoreData}
          >
            {state.btnTextB}
          </Button> */}
        </div>
        {!gridData.length && <h3>{isLoading}</h3>}
        <NrjAgGrid
          onGridLoaded={GridLoaded}
          onRowSelected={onRowSelected}
          onButtonClicked={onButtonClicked}
          colDef={props.cols}
          apiCall={""}
          rowData={gridData}
          deleteFldNm={""}
          // showDataButton={"Modify"}
          showApi={""}
          showFldNm={""}
          newRowOnTop={false}
          // className="ag-theme-alpine-blue ag-theme-alpine"
          className="ag-theme-alpine-blue ag-theme-alpine"
          trigger={state.triggerG}
          newRowData={state.nwRow}
        ></NrjAgGrid>
      </div>
    </>
  );
}

export default  React.memo(GridDisplayCbwtF)
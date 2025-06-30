import React, { useEffect, useReducer, useState } from "react";
import { validForm } from "../../Hooks/validForm";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  capitalize,
  createGetApi,
  dataStr_ToArray,
  getStateAbbreviation,
  postLinux,
  trimField,
} from "../../utilities/utilities";
import { Button, SvgIcon, Typography } from "@mui/material";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { nrjAxiosRequestLinux, useNrjAxios, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import Hdr from "../Hdr";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import { useNavigate } from "react-router";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import { Toaster } from "../../components/reusable/Toaster";
import { getLvl, getWho } from "../../utilities/cpcb";
import { useToaster } from "../../components/reusable/ToasterContext";
import { useEffectOnce } from "react-use";
import { stringify } from "querystring";

const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chkrdn",
  DISABLE: "disable",
  SETRGDCOMBO: "setRgdCombo",



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
  disableA: 1,
  disableB: 1,
  disableC: 1,
  rgdCombo: "",

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
  disableA: number,
  disableB: number,
  disableC: number,
  rgdCombo: string
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
      newstate.nwRow = action.payload;
      newstate.triggerG = 1;
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.RANDOM:
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.FORM_DATA:
      let dtaF: string = "";
      let fldNF: any = utilities(2, action.payload, "");
      if (newstate.textDts) {
        dtaF = newstate.textDts + "=";
        let d: any = utilities(1, dtaF, fldNF);
        if (d) {
          dtaF = d;
        } else {
          dtaF = "";
        }
      }
      dtaF += action.payload;
      newstate.textDts = dtaF;
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
    case ACTIONS.SETRGDCOMBO:
      newstate.rgdCombo = action.payload;
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

//

const SttDirctrLst = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const who: string = getWho() == 'CENTRAL' ? '0' : getWho();
  const reqFlds = [
    { fld: "rgdid", msg: "Select Regional Directorate", chck: "length" },
  ];

  const coldef = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "cpcbof", hide: false, width: 230, headerName: "SPCB/PCC", filter: 'agTextColumnFilter' },
   
    // { field: "adrb", hide: true, width: 150, headerName: "Address" },
    // { field: "adrc", hide: true, width: 150, headerName: "Address" },
    // {
    //   field: "stt",
    //   hide: false,
    //   width: 150,
    //   headerName: "State/UT",
    // },
    // { field: "cntp", hide: false, width: 180, headerName: "Contact person" },
    { field: "cntp", hide: false, width: 230, headerName: "Name of nodal officer" },
    { field: "phn", hide: false, width: 150, headerName: "Phone number" },
    { field: "eml", hide: false, width: 250, headerName: "E-mail id" },
    { field: "pnc", hide: true, width: 150, headerName: "Pincode" },
    { field: "fullAddress", hide: false, width: 200, headerName: "Address of SPCB/PCC" },
   
  ];

  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const [isLoading, setIsLoading] = useState("");
  const [rgdValue, setRgdValue] = useState<string>("");



  const rowData: any = [];
  const onRowSelected = (data: string) => {
    // alert(data)
  };
  const onButtonClicked = (action: string, rw: any) => {
    if (rw) {
      let dt = JSON.stringify(rw);
      sessionStorage.setItem('sttDetails', dt)
      navigate("/stt", { state: { isEdit: true } });
    
    }

  }
  const GridLoaded = () => { };

  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  };
  useEffectOnce(() => {
    if (getLvl() === "RGD" ||  getLvl() === "CPCB") {
      refetch()
    }
    
  })
  useEffect(() => {
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
  },[rgdValue])

  const HandleSaveClick = () => {
    setIsLoading("Loding Data...")
    let lvl = sessionStorage.getItem("lvl") || "";
    let who = sessionStorage.getItem("who") || "";
    let what='STT_list'
    if (lvl == "CPCB") { 
      if (rgdValue) {
        lvl='RGD'
      }
      let api: string = state.textDts;
      api = GetDataValue(api, "rgdid");
      let vl: any = api.split("|")
      // api = createGetApi("dll=hospdll|fnct=102|db=nodb", vl[0] + "=sll903");
      // return useNrjAxios({ apiCall: api });
      who = vl[0];
    }
    if (lvl== "RGD") {
      lvl="RGD"
    }



    const payload: any = postLinux(lvl + '=' + who + '=' + what, "get_cpcb_details");
    return nrjAxiosRequestLinux("get_cpcb_details", payload);


  };
  const { showToaster, hideToaster } = useToaster();
  const GetStateBrd = () => {
    //Clear the Grid for the next load function
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    let api: string = state.textDts;
    // if (getLvl() == "CPCB") {
    //   let msg: any = validForm(api, reqFlds);
    //   showToaster(msg, 'error');
    //   //console.log(msg)
    //   if (msg && msg[0]) {
    //     dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
    //     setTimeout(function () {
    //       dispatch({ type: ACTIONS.CHECK_REQDONE, payload: msg });
    //     }, 2500);
    //     return;
    //   }
    // }

    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetch();
  };

  const svdQry = (data: any) => {
    setIsLoading("")
    if (state.disableA == 0) {
      dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    }

    let dt: string = "";
    if (data && data.data && data.data) {
      dt = data.data;

      // let ary: any = dataStr_ToArray(dt);
      let ary=trimField(data.data,"cpcbof")
      ary = [...ary].map(item => ({
        ...item, // Keep existing properties
        fullAddress: `${item.adra || ''} ${item.adrb || ''} ${item.adrc || ''}`.trim() // Concatenation
      }));
     ary= ary.sort((a, b) => a.cpcbof.localeCompare(b.cpcbof)) // Sorting by `cpcbof`
      
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      }, 2000);
    }
    else {
     showToaster(["No data received"], "error");
    }
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

  const AddContact = () => {
    sessionStorage.removeItem("sttDetails");
    navigate("/stt", { state: { isEdit: false } });
  };

  const Printstt = () => {
    let gid: string = state.gid;
    let api: string = createGetApi(
      "db=nodb|dll=dummy+|fnct=dummy", gid + "=");
    return useNrjAxios({ apiCall: api });
  };

  const showRpt = (dataPr: any) => {
    let dt: string = GetResponseWnds(dataPr);
    if (dt && dt.indexOf(".pdf") > -1) {
      window.open(dataPr.data[0]["Data"], "_blank");
    } else {
      showToaster(["Please try again after refreshing the page!"],
        'error')
    }
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  };

  const { data: dataPr, refetch: refetchPr } = useQuery({
    queryKey: ["prntlst", state.rndm],
    queryFn: Printstt,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: showRpt,
  });

  function printClick(data: any) {
    refetchPr();
  }


  const onChangeRgd = (data: string) => {
    setRgdValue(getFldValue(data, 'rgdid').split('|')[0])
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const GetDataRgd = () => {
    // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a245", 'CPCB=CENTRAL');
    // return nrjAxios({ apiCall: api })
    let payload: any = {};
    return nrjAxiosRequestBio('rgdlst', payload);
  };

  const rgdCombo = (datastt: any) => {
    if (datastt && datastt.status == 200 && datastt.data) {
      let i: number = 0;
      let strCmbo: string = "";
      let dt: any = GetResponseLnx(datastt);
      let ary: any = dt.data;
      while (Array.isArray(ary) && i < ary.length) {
        if (strCmbo) {
          strCmbo += "$^";
        }
        strCmbo += "id][" + ary[i]["drpdwn"] + "=";
        strCmbo += "txt][" + ary[i]["drpdwn"];
        i += 1;
      }
      dispatch({ type: ACTIONS.SETRGDCOMBO, payload: strCmbo });
      return;
    }
  };


  const { data: datac, refetch: fetchRgd } = useQuery({
    queryKey: ["GetDataRgd"],
    queryFn: GetDataRgd,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: rgdCombo,
  });

  useEffectOnce(() => {
    if (getLvl() === "CPCB") {
      fetchRgd();
    }
   
  })

  return (
    <>
      <div className="bg-white P-2">
        <div className="shadow rounded-lg">
          <div className="flex justify-between items-center">
            {/* <div className="mt-3 ml-4">
              {(getLvl() == 'CPCB') && <WtrRsSelect
                Label="Regional Directorate"
                fldName="rgdid"
                idText="txtrgdid"
                onChange={onChangeRgd}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                allwZero={"0"}
                fnctCall={false}
                dbCon={""}
                typr={""}
                loadOnDemand={state.rgdCombo}
                dllName={""}
                fnctName={""}
             
                parms={who}
                allwSrch={true}
                speaker={""}
                delayClose={1000}
                placement="bottom"
                displayFormat="1"
              ></WtrRsSelect>}
            </div> */}
            <div className="flex">
              {/* <div className="mr-2">
                <Button
                  disabled={!state.disableA}
                  className="mr-2"
                  onClick={GetStateBrd}
                  variant="contained"
                  size="medium"
                >
                  Get list
                </Button>
              </div> */}
              {/* <div className="mr-2">
                <Button
                  onClick={AddContact}
                  variant="contained"
                  size="medium"
                  startIcon={<RotateLeftIcon />}
                  className="mr-2"
                >
                  Add New
                </Button>
              </div> */}

              <div className="mr-4">
                {/* <Button
                onClick={printClick}
                variant="contained"
                size="medium">
                Print
              </Button> */}
              </div>
            </div>
          </div>
          <div className="absolute font-semibold text-lg mb-8 mx-11">{isLoading}</div>
          {showMessage && showMessage.message.length != 0 ? <div className="py-2">
            <Toaster data={showMessage} className={''}></Toaster>
          </div> : <></>}
         
        </div>
      </div>
      <div className="flex justify-center bg-gray-100">
            <NrjAgGrid
              onGridLoaded={GridLoaded}
              onRowSelected={onRowSelected}
              onButtonClicked={onButtonClicked}
              colDef={coldef}
              apiCall={""}
              rowData={rowData}
              trigger={state.triggerG}
              newRowData={state.nwRow}
              deleteButton={""}
              deleteFldNm={""}
              showDataButton={"Details/Edit"}
              showFldNm={"shwf"}
              className="ag-theme-alpine-blue ag-theme-alpine"
              ApiServer={"tsk"}
              MyRoute="ListWrngHCFCode"
              appName="sttdlst"
              showPagination={true}
            ></NrjAgGrid>
          </div>
    </>

  );
};

export default React.memo(SttDirctrLst);

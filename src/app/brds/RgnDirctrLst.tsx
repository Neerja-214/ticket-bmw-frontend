import React, { useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetResponseWnds, capitalize, createGetApi, getApplicationVersion, getStateAbbreviation, postLinux, svLnxSrvr, trimField } from "../../utilities/utilities";
import { Button } from "@mui/material";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { nrjAxios, nrjAxiosRequestLinux, useNrjAxios } from "../../Hooks/useNrjAxios";
import { Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "../../components/reusable/Toaster";
import { getLvl, getWho } from "../../utilities/cpcb";
import { useToaster } from "../../components/reusable/ToasterContext";
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
  CHECK_REQDONE: "chkrdn",
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
      return newstate;
    case ACTIONS.RANDOM:
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.FORM_DATA:
      newstate.textdts = action.payload;
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
  }
};


const RgnDirctrLst = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const navigate = useNavigate();

  const lvl: string = getLvl() == "CPCB" ? '0' : getLvl();
  let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();

  const reqFlds = [
    { fld: "cpcbof", msg: "Enter Name of Board", chck: "length" },
    { fld: "ctyid", msg: "Select the Frequency", chck: "number" },
    { fld: "sttid", msg: "Select the Frequency", chck: "number" },
  ];

  const coldef = [
    { field: "id", hide: true, width: 0, headerName: "" },
    // {
    //   field: "stt",
    //   hide: false,
    //   width: 150,
    //   headerName: "State/UT",
    // },
    { field: "cpcbof", hide: false, width: 215, headerName: "CPCB regional directorate", filter: 'agTextColumnFilter' },
    { field: "cntp", hide: false, width: 210, headerName: "Name of regional director" },
    // {
    //   field: "cty",
    //   hide: false,
    //   width: 115,
    //   headerName: "City",
    // },


    // {
    //   field: "mobcntp",
    //   hide: false,
    //   width: 180,
    //   headerName: "Contact person Mobile",
    // },
   
    { field: "phn", hide: false, width: 280, headerName: "Contact number of regional director" },
    { field: "eml", hide: false, width: 230, headerName: "E-mail id of regional director" },
    { field: "fullAddress", hide: false, width: 245, headerName: "Address of regional directorate" },
    { field: "adrb", hide: true, width: 150, headerName: "Address" },
    { field: "adrc", hide: true, width: 150, headerName: "Address" },
    { field: "pnc", hide: true, width: 150, headerName: "Pincode" },


  ];

  const rowData: any = [];
  const onRowSelected = (data: string) => { };
  const onButtonClicked = (action: string, rw: any) => {

    if (rw) {
      let dt = JSON.stringify(rw);
      sessionStorage.setItem("rgndId", dt)
      navigate("/rgnd", { state: { isEdit: true } });
    }

  }
  const GridLoaded = () => { };
  const HandleSaveClick = () => {
    // let api: string = state.textDts;
    // api = svLnxSrvr("", api, "", "shrtrm", "ha0incinrt", "", "");
    // return useNrjAxios({ apiCall: api });


    let lvl = '';
    if (getLvl() == "CPCB") {
      lvl = "CPCB"
    }
    if (getLvl() == "RD") {
      lvl = "RGD"
    }
    let who = '';
    let what = "RGD_list"

    const payload: any = postLinux(lvl + '=' + who + '=' + what, "get_cpcb_details");
    return nrjAxiosRequestLinux("get_cpcb_details", payload);


  };

  const svdQry = (data: any) => {
    let dt: string = "";
    if (data && data.data) {
      dt = data.data;
      // let ech: string[] = dt.split("#");
      // if (ech && ech[0]) {
      //   dispatch({ type: ACTIONS.MAINID, payload: Number(ech[0]) });
      // }
      if (dt) {
        let ary = trimField(data.data, "cpcbof")
        ary = [...ary].sort((a, b) => a.cpcbof.localeCompare(b.cpcbof)) // Sorting by `cpcbof`
        ary =ary.map(item => ({
          ...item, // Keep existing properties
          fullAddress: `${item.adra || ''} ${item.adrb || ''} ${item.adrc || ''}`.trim() // Concatenation
        }));
      
        dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      } else {
       showToaster(["No data received"], "error");
      }
    }
  };

  const { data, refetch } = useQuery({
    queryKey: ["RgnDidrctLst", state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });

  useEffectOnce(() => {
    refetch();
  });
  const GotoRd = () => {
    sessionStorage.removeItem("rgndId");
    navigate("/rgnd");
  };
  const { showToaster, hideToaster } = useToaster();
  const Printrgd = () => {
    let gid: string = state.gid;
    if (!gid) {
      showToaster(["populate the data in the grid"], 'error');
      return;
    }
    let api: string = createGetApi(
      "db=nodb|dll=dummy+|fnct=dummy", gid + "=");
    return nrjAxios({ apiCall: api });
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
    queryFn: Printrgd,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: showRpt,
  });

  function printClick(data: any) {
    refetchPr();
  }
  const applicationVerion: string = getApplicationVersion();

  return (
    <>
      <div className="bg-white P-2">
        <div className="shadow rounded-lg">
          <div className="flex justify-end">
            {/* <div className="mt-2 mx-2">
              <Button
                onClick={GotoRd}
                variant="contained"
                size="medium"
              >
                Add New
              </Button>
            </div> */}
            {/* <div className="mt-4 mx-2">
            <Button
              onClick={printClick}
              variant="contained"
              size="medium"
            >
              Print
            </Button>
            </div> */}
          </div>
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
          // showDataButton={"Details"}    
          showFldNm={"shwf"}
          showApi={"rddrct|dts|rgnd"}
          className="ag-theme-alpine-blue ag-theme-alpine"
          ApiServer={"tsk"}
          MyRoute="rgndlst"
          appName="CPCB"
          showPagination={true}
        ></NrjAgGrid>
      </div>
    </>
  );
};
export default React.memo(RgnDirctrLst);

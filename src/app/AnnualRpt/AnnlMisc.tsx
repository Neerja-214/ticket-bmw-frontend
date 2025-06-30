import React, { useEffect, useReducer, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Alert, Button, SvgIcon } from "@mui/material";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Modal, Steps } from "rsuite";
import { useEffectOnce } from "react-use";
import utilities, {
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  clrFldsExcptDrpDt,
  svLnxSrvr,
  getApplicationVersion,
} from "../../utilities/utilities";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios } from "../../Hooks/useNrjAxios";
import { validForm } from "../../Hooks/validForm";
import WtrInput from "../../components/reusable/nw/WtrInput";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { Toaster } from "../../components/reusable/Toaster";
import NrjChkbx from "../../components/reusable/NrjChkbx";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import HdrDrp from "../HdrDrp";

import RefreshIcon from "@mui/icons-material/Refresh";
import Tooltip from "@mui/material/Tooltip";
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
  DSBLDTEXT: "dsbld",
  DISABLE: "disable",
  NEWFRMDATA: "frmdatanw",

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
      newstate.textDts = action.payload;
      return newstate;
    case ACTIONS.CHECK_REQ:
      newstate.errMsg = action.payload;
      newstate.openDrwr = true;
      return newstate;
    case ACTIONS.CHECK_REQDONE:
      newstate.errMsg = [];
      newstate.openDrwr = false;
      return newstate;
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
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

const AnnlMisc = () => {
  //#############Constants for the State and other functions
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const isUppercase = sessionStorage.getItem("UpperCase") == "1" ? true : false;
  const reqFlds: any[] = [];
  const [searchParams, setSearchParams] = useSearchParams();
  const cbwtfnm = searchParams.get('name');
  const reqsFlds = [
    {
      fld: "wstmnc",
      msg: "Do you have Waste management Committee",
      chck: "1[length]",
    },
    { fld: "notrn", msg: "Enter No of Training Conducted", chck: "1[length]" },
    { fld: "noprs", msg: "Enter No of Person Trained", chck: "1[length]" },
    {
      fld: "noprind",
      msg: "Enter No of Person Trained at Induction",
      chck: "1[length]",
    },
    {
      fld: "nttrn",
      msg: "Enter No of Not Trained at Induction",
      chck: "1[length]",
    },
    {
      fld: "mnlavl",
      msg: "Enter Standard Manual is Available",
      chck: "1[length]",
    },
  ];

  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };
  const navigate = useNavigate();

  const HandleSaveClick = () => {
    let mid = sessionStorage.getItem("annualRptCbwtfid") || "1";
    let api: string = state.textDts;
    api = svLnxSrvr("", api, mid, "shrtrm", "cpc0cbwfanlmsc", state.mainId, "");
    return nrjAxios({ apiCall: api });
  };
  const { showToaster, hideToaster } = useToaster();
  const svClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    showToaster( msg, 'error');
    if (msg && msg[0]) {
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    refetch();
  };

  const svdQry = (data: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    let ech: any[];
    let rspnse: string = data.data.Status;
    if (rspnse) {

      ech = rspnse.split("][");
      sessionStorage.setItem("AnnlId", ech[1]);
      if (ech && ech[0]) {

        if (rspnse.indexOf("id][") > -1) {
          setShowMessage({
            message: ["Data Saved Successfully"],
            type: "success",
          });
        }
        dispatch({ type: ACTIONS.MAINID, payload: Number(ech[1]) });

        dispatch({ type: ACTIONS.CHECK_REQ, payload: "Data Update" });
        setTimeout(function () {
          dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
        }, 5000);
      }
    }

  };

  // const svdQry = (data: any) => {
  //   dispatch({ type: ACTIONS.DISABLE, payload: 1 });
  //   let ech: any[];
  //   let rspnse: string = data.data.Status
  //   if (rspnse) {
  //     ech = rspnse.split("#");
  //     if (ech && ech[0]) {
  //       if (ech[0].indexOf("id][") > -1) {
  //         setShowMessage({
  //           message: ["Data Saved Successfully"],
  //           type: "success",
  //         });
  //         ech[0] = GetDataValue(ech[0], "id");
  //       }
  //       dispatch({ type: ACTIONS.MAINID, payload: Number(ech[0]) });
  //       dispatch({ type: ACTIONS.CHECK_REQ, payload: "Data Update" });
  //       setTimeout(function () {
  //         dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
  //       }, 5000);
  //     }
  //   }
  // };

  const { data, refetch } = useQuery({
    queryKey: ["svQry", state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });

  useEffectOnce(() => {
    let oldid: string = sessionStorage.getItem("annualRptCbwtfid") || "";
    if (oldid) {
      refetchOld();
    }
  });

  const GetSvData = () => {
    let oldid: string = sessionStorage.getItem("annualRptCbwtfid") || "";
    let api: string = createGetApi(
      "db=nodb|fnct=102|dll=hospdll",
      oldid + "=stm969"
    );
    return nrjAxios({ apiCall: api });
  };

  const ShowData = (dataSvd: any) => {
    let dt: string = GetResponseWnds(dataSvd);
    if (dt) {
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
    }
  };

  const { data: dataSvd, refetch: refetchOld } = useQuery({
    queryKey: ["svOld", state.mainId, state.rndm],
    queryFn: GetSvData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });
  let ttl: string = sessionStorage.getItem("cbwtfnm") || "";

  const PrintRep = () => {
    let id: string = sessionStorage.getItem("annualRptCbwtfid") || "1";
    let api: string = createGetApi("db=nodb|dll=chqdll|fnct=g114", id);
    nrjAxios({ apiCall: api }).then((res: any) => {
      shwReport(res);
    })
  }

  const MakeRpt = () => {
    dispatch({ type: ACTIONS.RANDOM, payload: 1 })
    setTimeout(function () {
      refetchprnt()
    }, 700)

  }
  const shwReport = (dataprnt: any) => {
    let dt = GetResponseWnds(dataprnt);
    if (dt) {
      window.open(dt, "_blank");
    }
  }

  const { data: dataprnt, refetch: refetchprnt } = useQuery({
    queryKey: ["svPrint", state.rndm],
    queryFn: PrintRep,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: shwReport,
  });

  const clrFunct = () => {
    let data: string = state.textDts;
    data = clrFldsExcptDrpDt(data);
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
      dispatch({ type: ACTIONS.NEWFRMDATA, payload: data });
    }, 300);
  };
  const applicationVerion: string = getApplicationVersion();

  return (
    <>
      <div className="bg-white">
        <div className="flex container-sm justify-end mb-4">
          {/* <div className="mx-4">
            <Tooltip title="Click to clear the old data">

              <Button variant="contained"
                style={{ color: "#3B71CA", backgroundColor: "#fff" }}
                className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                onClick={clrFunct}
              >
                <SvgIcon component={RefreshIcon} />
              </Button>
            </Tooltip>
          </div> */}
          <div>
            <Tooltip title="Click to generate AR">
              <Button
                size="medium"
                className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                style={{ color: '#fff', backgroundColor: "#38a169" , textTransform: "none",}}
                variant="contained"
                color="success"
                onClick={MakeRpt}
              >
                <span className="whitespace-nowrap">Generate AR</span>
              </Button>
            </Tooltip>
          </div>
        </div>
        <div className="shadow rounded-lg">
          <div className="py-5">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:m-3 lg:m-5">
                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Waste management Comittee"
                    fldName="wstmnc"
                    idText="txtwstmnc"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Do you have Waste management Committee"}
                    delayClose={1000}
                    placement="right"
                    ClssName=""
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="No of Training Conducted"
                    fldName="notrn"
                    idText="txtnotrn"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Enter No of Training Conducted"}
                    delayClose={1000}
                    placement="bottom"
                    ClssName=""
                    ToolTip="Enter only numbers"
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="No of Person Trained"
                    fldName="noprs"
                    idText="txtnoprs"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Enter No of Person Trained"}
                    delayClose={1000}
                    placement="left"
                    ClssName=""
                    ToolTip="Enter whole numbers only"
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="No of Person Trained at Induction"
                    fldName="noprind"
                    idText="txtnoprind"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Enter No of Person Trained at Induction"}
                    delayClose={1000}
                    ClssName=""
                    ToolTip="Enter whole numbers only"
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="No of Person Not Trained at Induction"
                    fldName="nttrn"
                    idText="txtnttrn"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Enter No of Not Trained at Induction"}
                    delayClose={1000}
                    ClssName=""
                    ToolTip="Enter whole numbers only"
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Standard Manual Available"
                    fldName="mnlavl"
                    idText="txtmnlavl"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Enter Standard Manual is Available"}
                    delayClose={1000}
                    ClssName=""
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Other Information"
                    fldName="othr"
                    idText="txtothr"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="No of Accidents in Year"
                    fldName="noacd"
                    idText="txtnoacd"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    ToolTip="Enter whole numbers only"
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="No of Persons affected in Year"
                    fldName="noacdprs"
                    idText="txtnoacdprs"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    ToolTip="Enter whole numbers only"
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Remedial Action"
                    fldName="acdrmd"
                    idText="txtacdrmd"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Any Fatality in Accidents"
                    fldName="acdftl"
                    idText="txtacdftl"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Details of Air Pollution Standards"
                    fldName="apstn"
                    idText="txtapstn"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Liquid waste generated and treatment"
                    fldName="lqdgtr"
                    idText="txtlqdgtr"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Disinfection method is meeting Log 4"
                    fldName="dsmt"
                    idText="txtdsmt"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    ToolTip="Enter whole numbers only"
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Any other relevant information "
                    fldName="aoth"
                    idText="txtaoth"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                  ></WtrInput>
                </div>
              </div>
            </div>
            {showMessage && showMessage.message.length != 0 ? (
              <div className="py-2">
                <Toaster data={showMessage} className={""}></Toaster>
              </div>
            ) : (
              <></>
            )}
            <div className="flex justify-center py-7">
              <div className="mr-4">
                <Button
                  size="medium"
                  style={{ color: "#38a169", backgroundColor: "#fff" , textTransform: "none",}}
                  variant="contained"
                  className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                  disabled={!state.disableA}
                  onClick={() => {
                    navigate(`/annlEqp`);
                  }}
                >
                  Previous
                </Button>
              </div>
              <div className="mr-4">
                <Button
                  size="medium"
                  className="bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                  variant="contained"
                  disabled={!state.disableA}
                  startIcon={<SaveIcon />}
                  onClick={svClick}
                  style={{  textTransform: "none",}}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default React.memo(AnnlMisc);

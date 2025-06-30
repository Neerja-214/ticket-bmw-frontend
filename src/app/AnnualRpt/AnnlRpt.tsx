import React, { useReducer, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Button, SvgIcon } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffectOnce } from "react-use";
import utilities, {
  GetResponseWnds,
  capitalizeTerms,
  createGetApi,
  getApiFromClinician,
  getApplicationVersion,
  svLnxSrvr,
} from "../../utilities/utilities";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios, nrjAxiosRequest, useNrjAxios } from "../../Hooks/useNrjAxios";
import { validForm } from "../../Hooks/validForm";
import WtrInput from "../../components/reusable/nw/WtrInput";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import SaveIcon from "@mui/icons-material/Save";
import { Toaster } from "../../components/reusable/Toaster";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import HdrDrp from "../HdrDrp";
import "../../styles/common.css";
import { getLvl, getWho } from "../../utilities/cpcb";
import RefreshIcon from "@mui/icons-material/Refresh";
import Tooltip from "@mui/material/Tooltip";

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
  ONLYFRMDATA: "onlfrm",
  NEWFRMDATA: "frmdatanw",
  FORM_DATA2: "formdata2",
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  textDts: "",
  mainId: 0,
  errMsg: [],
  frmData2: "",
  textDts2: "",
  openDrwr: false,
  frmData: "",
  disableA: 1,
  disableB: 0,
  disableC: 1,
};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  textDts2: string;
  trigger: number;
  textDts: string;
  mainId: number;
  errMsg: any;
  frmData2: string;
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
    case ACTIONS.ONLYFRMDATA:
      newstate.frmData = action.payload;
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
    case ACTIONS.FORM_DATA2:
      let dta2: string = "";
      let fldN2: any = utilities(2, action.payload, "");
      if (newstate.textDts2) {
        dta2 = newstate.textDts2 + "=";
        let d: any = utilities(1, dta2, fldN2);
        if (d) {
          dta2 = d;
        } else {
          dta2 = "";
        }
      }
      dta2 += action.payload;
      newstate.textDts2 = dta2;
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
        //newstate.disableB = 1;
        if (newstate.disableB == 1) {
          newstate.disableB = 0;
        } else {
          newstate.disableB = 1;
        }
        return newstate;
      } else if (action.payload == 3) {
        if (newstate.disableC == 1) {
          newstate.disableC = 0;
        } else {
          newstate.disableC = 1;
        }
        return newstate;
      }
  }
};

const AnnlRpt = () => {

  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const isUppercase = sessionStorage.getItem("UpperCase") == "1" ? true : false;
  // const reqFlds:any[] = [];
  const reqFlds = [
    { fld: "cbwtfid", msg: "Select CBTWF", chck: "length" },
    { fld: "cntprsn", msg: "Enter Name of Person", chck: "1[length]" },
    { fld: "lcnno", msg: "Enter Licence No", chck: "1[length]" },
    {
      fld: "dt_exp",
      msg: "Enter Date of Expiry of Licence",
      chck: "number",
    },
    { fld: "hcfcnt", msg: "Number of HCF Covered", chck: "1[length]" },
    { fld: "cpcinst", msg: "Specify Installed Capacity", chck: "1[length]" },
    {
      fld: "trtwt",
      msg: "Specify the Treated / Disposed Weight",
      chck: "1[length]",
    },
  ];


  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };

  let cbwtfid = ""
  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const onChangeDts2 = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA2, payload: data });
  };

  const navigate = useNavigate();

  const nxtClick = () => {
    navigate("/annlwstwt");
  };
  const HandleSaveClick = () => {
    let api: string = state.textDts;
    api = svLnxSrvr("", api, "", "shrtrm", "cpc0cbwfanl", state.mainId, "");
    return useNrjAxios({ apiCall: api });
  };

  const svClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    setShowMessage({ message: msg, type: "error" });
    if (msg && msg[0]) {
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    setTimeout(() => {
      refetch();
    }, 400)

  };

  const svdQry = (data: any) => {
    if (state.disableB == 0) {
      dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    }
    if (state.disableA == 0) {
      dispatch({ type: ACTIONS.DISABLE, payload: 1 });
    }
    let ech: any[];
    let rspnse: string = data.data.Status;
    if (rspnse) {
      ech = rspnse.split("][");
      sessionStorage.setItem("annualRptCbwtfid", ech[1]);
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

  const { data, refetch } = useQuery({
    queryKey: ["svQryAnlRpts", state.mainId, state.rndm],
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
    } else {
      refetchCmp();
    }
  });

  const GetSvData = () => {
    let oldid: string = sessionStorage.getItem("annualRptCbwtfid") || "0";
    if (oldid) {
      dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    }

    let api: string = createGetApi(
      "db=nodb|fnct=102|dll=hospdll",
      oldid + "=sti977"
    );
    return nrjAxios({ apiCall: api });
  };

  const ShowData = (dataSvd: any) => {

    let dt: string = GetResponseWnds(dataSvd);
    if (dt) {
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
      let id: string = getFldValue(dt, "id");
      let cbwtfnm: string = getFldValue(dt, "cbwtfnm");
      if (id) {
        dispatch({ type: ACTIONS.MAINID, payload: Number(id) });
        sessionStorage.setItem("annualRptCbwtfid", id);
        sessionStorage.setItem("cbwtfnm", cbwtfnm);
      }
    } else {
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
      dispatch({ type: ACTIONS.RANDOM, payload: 1 });
      setTimeout(function () {

      }, 600);
    }
  };

  const { data: dataSvd, refetch: refetchOld } = useQuery({
    queryKey: ["svOldForm1", state.mainId, state.rndm],
    queryFn: GetSvData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  const GetCmpD = () => {
    let oldid: string = sessionStorage.getItem("annualRptCbwtfid") || "0";
    let api: string = createGetApi(
      "db=nodb|fnct=102|dll=hospdll",
      oldid + "=stc977"
    );
    return nrjAxios({ apiCall: api });
  };

  const ShowCData = (dataCmp: any) => {
    let dt: string = GetResponseWnds(dataCmp);
    if (dt) {
      if (!state.disableB) {
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
      }
      dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt });
      let id: string = getFldValue(dt, "id");
      if (id) {
        dispatch({ type: ACTIONS.MAINID, payload: Number(id) });
        sessionStorage.setItem("annualRptCbwtfid", id);
      }
    }
  };
  const { data: dataCmp, refetch: refetchCmp } = useQuery({
    queryKey: ["svOldCmp", state.mainId, state.rndm],
    queryFn: GetCmpD,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowCData,
  });


  const GetCreate = () => {
    let dt = state.textDts2;
    cbwtfid = getFldValue(dt, "cbwtfid").split('|')[0];
    let dt_rpt = getFldValue(dt, "dt_rpt")
    if (!dt_rpt) {
      setShowMessage({ message: ["Enter Date of Report"], type: 'error' });
    }
    let api: string = createGetApi("db=nodb|fnct=c276|dll=accdll", cbwtfid + "=" + dt_rpt);
    return nrjAxios({ apiCall: api });
  }

  const { data: dataSvd1, refetch: refetchOld1 } = useQuery({
    queryKey: ["svOldForm1", state.mainId, state.rndm],
    queryFn: GetCreate,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });


  const GetDataCbwtf = () => {
    let api: string = getApiFromClinician("show_hcfcntFile");
    let lvl: string = getLvl() || "1";
    let who: string = getWho() || "1";
    let data1 = { lvl: 'CPCB' }
    nrjAxiosRequest(api, data1).then((res: any) => {
      fillForm(res);
    })
  };

  const GetDataCbwtf2 = (data: any) => {
    let api: string = getApiFromClinician("findInDB");
    let lvl: string = getLvl() || "1";
    let who: string = getWho() || "1";
    let data1 = { srch: 'cbwtf', who: data };
    return nrjAxiosRequest(api, data1).then((res: any) => {
      fillForm(res);
    })
  };

  const fillForm = (data: any) => {
    let bdcnt = 0;
    let hcfcnt = 0;
    if (getLvl() == 'CPCB') {
      data.data.forEach((el: any) => {
        bdcnt = bdcnt + Number(el.beds)
        hcfcnt = hcfcnt + Number(el.hcfcount);
      });
    }
    else {
      if (data.data?.beds) bdcnt = data.data.beds;
      if (data.data?.hcfcount) hcfcnt = data.data.hcfcount;
    }
    if (bdcnt) dispatch({ type: ACTIONS.FORM_DATA, payload: `bdcnt][${bdcnt}` });
    if (hcfcnt) dispatch({ type: ACTIONS.FORM_DATA, payload: `hcfcnt][${hcfcnt}` });
  }

  const { data: dataCbwtf, refetch: refetchCbwtf } = useQuery({
    queryKey: ["getDataCbwtfccc", state.mainId, state.rndm],
    queryFn: GetDataCbwtf,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: fillForm,
  });

  // const { data: dataCbwtf2, refetch: refetchCbwtf2 } = useQuery({
  //   queryKey: ["getDataCbwtf2", state.mainId, state.rndm],
  //   queryFn: GetDataCbwtf2,
  //   enabled: false,
  //   staleTime: Number.POSITIVE_INFINITY,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  //   onSuccess: FillForm,
  // });

  const clrFunct = () => {
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    }, 100);
  };

  const Seperator = (props: any) => {
    return (
      <>
        <div className="mt-7">
          <div className="font-semibold" style={{ color: '#3657ac' }}>
            {/* <div className="font-semibold" style={{ color: '#009ED6' }}> */}
            {capitalizeTerms(props.heading)}
          </div>
          <div className="mt-2" style={{ border: '1px solid #86c6d9' }}>
          </div>
        </div>
      </>
    )
  }


  return (
    <>
      <div className="bg-white">
        {/* <div className="container-sm flex justify-end">
          <Tooltip title="Click to clear the old data">

            <Button variant="contained"
              style={{ color: "#3B71CA", backgroundColor: "#fff" }}
              onClick={clrFunct}
            >
              <SvgIcon component={RefreshIcon} />
            </Button>
          </Tooltip>
        </div> */}
        <div className="container-sm mt-3 shadow rounded-lg">
          <div className="py-5">
            <div>
              <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:m-3 lg:m-5">
                <div>
                  <WtrRsSelect

                    displayFormat="1"
                    Label="CBWTF"
                    fldName="cbwtfid"
                    idText="txtcbwtfid"
                    onChange={onChangeDts2}
                    selectedValue={"cbwtfid][1234=cbwtf][Atishay CBWTF"}
                    clrFnct={state.trigger}
                    allwZero={"0"}
                    fnctCall={true}
                    dbCon={"nodb"}
                    typr={"589"}
                    dllName={"xrydll"}
                    fnctName={"a172"}
                    parms={""}
                    allwSrch={true}
                    speaker={"Select CBTF"}
                    delayClose={1000}
                  ></WtrRsSelect>
                </div>

                <div>
                  <WtrRsSelect
                    displayFormat="1"
                    Label="Select year"
                    fldName="dt_rpt"
                    idText="txtdt_rpt"
                    onChange={onChangeDts2}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    allwZero={"0"}
                    fnctCall={true}
                    dbCon=""
                    typr=""
                    loadOnDemand={"id][01-Jan-2023=txt][2022-2023$^id][01-Jan-2022=txt][2021-2022"}
                    //{"id][01-Jan-2001=txt][2000-2001$^id][01-Jan-2002=txt][2001-2002$^id][01-Jan-2003=txt][2002-2003$^id][01-Jan-2004=txt][2003-2004$^id][01-Jan-2005=txt][2004-2005$^id][01-Jan-2006=txt][2005-2006$^id][01-Jan-2007=txt][2006-2007$^id][01-Jan-2008=txt][2007-2008$^id][01-Jan-2009=txt][2008-2009$^id][01-Jan-2010=txt][2009-2010$^id][01-Jan-2011=txt][2010-2011$^id][01-Jan-2012=txt][2011-2012$^id][01-Jan-2013=txt][2012-2013$^id][01-Jan-2014=txt][2013-2014$^id][01-Jan-2015=txt][20014-2015$^id][01-Jan-2016=txt][2015-2016$^id][01-Jan-2017=txt][2016-2017$^id][01-Jan-2018=txt][2017-2018$^id][01-Jan-2019=txt][2018-2019$^id][01-Jan-2020=txt][2019-2020$^id][01-Jan-2021=txt][2020-2021$^id][01-Jan-2022=txt][2021-2022$^id][01-Jan-2023=txt][2022-2023$^id][01-Jan-2024=txt][2023-2024"}
                    dllName={"xrydll"}
                    fnctName={"a172"}
                    parms={""}
                    allwSrch={true}
                    speaker={"Select CBTF"}
                    delayClose={1000}
                  ></WtrRsSelect>
                </div>

              </div>
              <Seperator heading=""></Seperator>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:m-3 lg:m-5">
                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="CONTACT PERSON"
                    fldName="cntprsn"
                    idText="txtcntprsn"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Enter Name of Person"}
                    delayClose={1000}
                    placement="right"
                    ClssName=""
                    ToolTip="Enter a Name without special character"
                  ></WtrInput>
                </div>

                {/* <div>
                  <WtrInput
                  displayFormat="1"  
                  Label="CBWTF"
                    fldName="cbwtfnm"
                    idText="txtcbwtfnm"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    unblockSpecialChars={true}
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Enter Name of Facility"}
                    delayClose={1000}
                    placement="bottom"
                    ClssName=""
                  ></WtrInput>
                </div> */}
                <div >
                  <WtrInput
                    displayFormat="1"
                    Label="Address I"
                    fldName="adra"
                    idText="txtadra"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={isUppercase}
                    validateFn="1[length]"
                    allowNumber={false}
                    unblockSpecialChars={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Enter Address"}
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Address II"
                    fldName="adrb"
                    idText="txtadrb"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={isUppercase}
                    validateFn=""
                    unblockSpecialChars={true}
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                  ></WtrInput>
                </div>
                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Address III"
                    fldName="adrc"
                    idText="txtadrc"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={isUppercase}
                    validateFn=""
                    unblockSpecialChars={true}
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                  ></WtrInput>
                </div>
                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="E Mail"
                    fldName="eml"
                    idText="txteml"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="[email]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    unblockSpecialChars={true}
                    delayClose={1000}
                    speaker={"Enter E Mail Address"}
                    placement="right"
                    ClssName=""
                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Web Site"
                    fldName="wbsit"
                    idText="txtwbsit"
                    onChange={onChangeDts}
                    unblockSpecialChars={true}
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
                    Label="Lattitude"
                    fldName="ltt"
                    idText="txtltt"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="[latitude]"
                    allowNumber={true}
                    allowDecimal={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    ToolTip="There should be atleast four digits after dot"

                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Longitude"
                    fldName="lgnt"
                    idText="txtlgnt"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="[longitude]"
                    allowNumber={true}
                    allowDecimal={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    ToolTip="There should be atleast four digits after dot"
                  ></WtrInput>
                </div>


                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Bed Count"
                    fldName="bdcnt"
                    idText="txtbdcnt"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    ToolTip="Enter Numbers only"

                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Licence No"
                    fldName="lcnno"
                    idText="txtlcnno"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    unblockSpecialChars={true}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Enter Licence No"}
                    delayClose={1000}
                    ClssName=""
                  ></WtrInput>
                </div>


                {/* <div className="mt-2 mb-4 ml-4">
                  <NrjRsDt
                    onChange={onChangeDts}
                    displayFormat="1"
                    Label="Date"
                    idText="txtdt_exp"
                    selectedValue={state.frmData}
                    fldName='dt_exp'
                    speaker={"Enter Date of Expiry of Licence"}
                    IAmRequired={reqFlds}
                  ></NrjRsDt>
                </div> */}
                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="No of HCF Covered"
                    fldName="hcfcnt"
                    idText="txthcfcnt"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Number of HCF Covered"}
                    delayClose={1000}
                    ClssName=""
                    ToolTip="Enter Numbers only"
                  ></WtrInput>
                </div>


                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Treatment & disposal capacity(Kg/day)"
                    fldName="cpcinst"
                    idText="txtcpcinst"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={true}
                    allowDecimal={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Specify Installed Capacity"}
                    delayClose={1000}
                    ClssName=""
                    ToolTip="Enter Numbers only"

                  ></WtrInput>
                </div>

                <div>
                  <WtrInput
                    displayFormat="1"
                    Label="Quantity of biomedical waste treated or disposed by CBMWTF (Kg/day)"
                    fldName="trtwt"
                    idText="txttrtwt"
                    onChange={onChangeDts}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn="1[length]"
                    allowNumber={true}
                    allowDecimal={true}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    speaker={"Specify the Treated / Disposed Weight"}
                    delayClose={1000}
                    ClssName=""
                    ToolTip="Enter Numbers only"

                  ></WtrInput>
                </div>
              </div>
            </div>
            {showMessage && showMessage.message.length != 0 ? (
              <div className="relative py-2">
                <Toaster data={showMessage} className={""}></Toaster>
              </div>
            ) : (
              <></>
            )}
            <div className="flex justify-center py-7">
              <div className="mr-4">
                <Button
                  size="medium"
                  className="bg-blue-500 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                  variant="contained"
                  disabled={!state.disableA}
                  startIcon={<SaveIcon />}
                  onClick={svClick}
                  style={{ textTransform: "none", }}
                >
                  Submit
                </Button>
              </div>
              <div className="mr-4">
                <Tooltip title="Click to continue">
                  <Button
                    size="medium"
                    className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                    style={{ color: "#38a169", backgroundColor: "#fff", textTransform: "none", }}
                    variant="contained"
                    //disabled={!state.disableB}
                    startIcon={<SaveIcon />}
                    onClick={() => {
                      navigate("/annlWstWt");
                    }}

                  >
                    Next
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default React.memo(AnnlRpt);
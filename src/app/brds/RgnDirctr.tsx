import React, { useEffect, useReducer, useState } from "react";
import { validForm } from "../../Hooks/validForm";
import { useQuery } from "@tanstack/react-query";
import SaveIcon from "@mui/icons-material/Save";
import utilities, {
  GetResponseLnx,
  clrFldsExcptDrpDt,
  cmboStrLrg,
  convertFldValuesToJson,
  convertFldValuesToString,
  createGetApi,
  getApplicationVersion,
  getCmpId,
  getUsrnm,
  postLinux,
  svLnxSrvr,
} from "../../utilities/utilities";
import {
  Button
} from "@mui/material";
import { nrjAxiosRequestBio, useNrjAxios } from "../../Hooks/useNrjAxios";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import { useEffectOnce } from "react-use";
import { act } from "react-dom/test-utils";
import WtrInput from "../../components/reusable/nw/WtrInput";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import axios from "axios";
import HdrDrp from "../HdrDrp";
import { Toaster } from "../../components/reusable/Toaster";
import { useLocation, useNavigate } from "react-router";
import { useToaster } from "../../components/reusable/ToasterContext";

const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  SETFORM_DATAALL: "setfrmdataall",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  TRIGGER_FORMSLV: "trgfrmslv",
  TRIGGER_PINCD: "trgfrmpnc",
  FORM_DATASLV: "frmdataslv",
  SETGID: "gd",
  CLEARALL: "clrallFrm",
  DISABLE: "disable",
  SETCITYCOMBO: "setCityCombo",
  SETSTATECOMBO: "setStateCombo",

};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  triggerSlv: 0,
  triggerCmbo: 0,
  triggerpnc: 0,
  textDts: "",
  textDtsSlv: "",
  mainId: 0,
  errMsg: [],
  openDrwr: false,
  frmData: "",
  mainIdSlv: 0,
  frmDataSlv: "",
  gid: "",
  disableA: 1,
  disableB: 1,
  disableC: 1,
  cityCombo: "",
  stateCombo: "",

};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  trigger: number;
  triggerpnc: number;
  triggerCmbo: number;
  triggerSlv: number;
  textDts: string;
  textDtsSlv: string;
  mainId: number;
  errMsg: any;
  openDrwr: boolean;
  frmData: string;
  gid: string;
  disableA: number,
  disableB: number,
  disableC: number,
  cityCombo: string,
  stateCombo: string

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
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.TRIGGER_GRID:
      newstate.triggerG = action.payload;
      return newstate;
    case ACTIONS.CLEARALL:
      newstate.triggerG = 5;
      newstate.trigger = 1;
      newstate.triggerpnc = 1;
      newstate.textDtsSlv = "";
      newstate.frmDataSlv = "";
      newstate.mainIdslv = 0;
      newstate.nwRow = [];
      return newstate;
    case ACTIONS.TRIGGER_FORM:
      newstate.trigger = action.payload;
      if (action.payload === 0) {
        newstate.textDts = "";
        newstate.frmData = "";
        newstate.mainId = 0;
        newstate.triggerpnc = 0;
        newstate.gid = "";
      }
      return newstate;
    case ACTIONS.TRIGGER_FORMSLV:
      newstate.trigger = action.payload;
      newstate.triggerpnc = action.payload;
      if (action.payload === 0) {
        newstate.textDts = clrFldsExcptDrpDt(newstate.textDts);
        newstate.frmData = "";
        newstate.mainId = 0;
        newstate.triggerpnc = 0;
        newstate.gid = "";
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
      console.log(dtaF);
      return newstate;
    case ACTIONS.SETFORM_DATAALL:
      newstate.frmData = action.payload;
      newstate.textDts = action.payload;
      let d: any = utilities(1, action.payload, "id");
      if (d) {
        newstate.mainId = Number(d);
      }
      return newstate;

    case ACTIONS.FORM_DATASLV:
      let dta: string = "";
      let fldN: any = utilities(2, action.payload, "");
      if (newstate.textDtsSlv) {
        dta = newstate.textDtsSlv + "=";
        let d: any = utilities(1, dta, fldN);
        if (d) {
          dta = d;
        } else {
          dta = "";
        }
      }
      dta += action.payload;
      newstate.textDtsSlv = dta;
      return newstate;
    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
      //newstate.textDts = action.payload;
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
    case ACTIONS.TRIGGER_PINCD:
      newstate.triggerpnc = action.payload;
      return newstate;
    case ACTIONS.SETCITYCOMBO:
      newstate.cityCombo = action.payload;
      return newstate;
    case ACTIONS.SETSTATECOMBO:
      newstate.stateCombo = action.payload;
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

interface Values {
  cpcbof: string;
  cntp: string;
}

const RgnDirctr = () => {

  let pnc: string = "";

  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [cityList, setCityList] = useState("");
  const [selsttid, setSelSttid] = useState(-1);
  const reqFlds = [
    { fld: "cpcbof", msg: "Enter Name of Regional Board", chck: "1[length]" },
    // { fld: "ctyid", msg: "Select City", chck: "1[length]" },
    // { fld: "sttid", msg: "Select State", chck: "1[length]" },
    { fld: "cntp", msg: "Enter Name of Contact person", chck: "1[length]" },
    // { fld: "dsgid", msg: "Select Designation", chck: "1[length]" },
  ];
  const location = useLocation();
  const isEdit = location.state?.isEdit || false; // Default to false if state is missing

  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  };
  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    let dta: string = "";

    if (data.indexOf("sttid][") === 0) {
      dta = GetDataValue(data, "sttid");
      if (dta.indexOf("|") > -1) {
        let m: string[] = dta.split("|");
        dta = m[0];
      }
      if (dta && Number(dta)) {
        setSelSttid(Number(dta));
        setTimeout(function () {
          refetchD();
        }, 900);
      }

      dta = "";
    } else if (data.indexOf("pnc") > -1) {
      pnc = GetDataValue(data, "pnc");
      // console.log(pnc + "Pin Code")
      if (pnc && pnc.length == 6) {
        setTimeout(function () {
          // refetchF();
        }, 900);
      }
    }
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

  const [showMessage, setShowMessage] = useState<any>([])


  const HandleSaveClick = () => {
    let formData: any = state.textDts;
    formData = convertFldValuesToJson(formData);
    formData['cmpid'] = getCmpId() || "";
    formData['usrnm'] = getUsrnm() || "";
    delete formData['_id']
    return nrjAxiosRequestBio("update_cpcb_details", formData)
  };
  const { showToaster, hideToaster } = useToaster();
  const SaveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);

    if (msg && msg[0]) {
      showToaster(msg, 'error');

      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })

    refetch();
  };

  const svdQry = (data: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    let dt: any = GetResponseLnx(data);
    if (dt.status == 'Success') {
      showToaster([dt.message], 'success')
    }
    else {
      showToaster(['Something went wrong! please try again'], 'error')
    }

  };

  const GetCity = () => {
    let msg: string = cmboStrLrg("shrtrm", "790", "1", "", selsttid);
    return useNrjAxios({ apiCall: msg });
  };

  const lstCity = (data: any) => {
    let dt: string = "";

    let d: [] = data;

    if (data.data[0]["Data"]) {
      dt = data.data[0]["Data"];
      let ech: string[] = dt.split("#");
      setCityList(ech[0]);
    }
  };

  const { data: dataD, refetch: refetchD } = useQuery({
    queryKey: ["distrcmbo", selsttid],
    queryFn: GetCity,
    enabled: false,
    // staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: lstCity,
  });

  const { data, refetch } = useQuery({
    queryKey: ["svQry", state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });


  // const GetData = () => {
  //   let id: string = state.mainId;
  //   let api: string = createGetApi(
  //     "db=nodb|dll=hospdll|fnct=102",
  //     id + "=sti844"
  //   );
  //   return useNrjAxios({ apiCall: api });
  // };

  // const ShowData = (data: any) => {
  //   if (data && data.data && data.data[0] && data.data[0]["Data"]) {
  //     let dt: string = data.data[0]["Data"];
  //     if (dt) {
  //       let id: string = GetDataValue(dt, "id");
  //       dispatch({ type: ACTIONS.MAINID, payload: Number(id) });
  //       // setTimeout(function () {
  //       //   //Call Contact list
  //       //   refetchE();
  //       // }, 500);
  //     }
  //     dispatch({ type: ACTIONS.SETFORM_DATAALL, payload: dt });
  //     //setFrmData(dt);
  //   }
  // };

  // const GetDataContact = () => {
  //   let api: string = createGetApi(
  //     "db=nodb|dll=hospdll|fnct=102",
  //     state.mainId + "=stm853"
  //   );
  //   return useNrjAxios({ apiCall: api });
  // };
  // const { data: datab, refetch: refetchB } = useQuery({
  //   queryKey: ["getSlvData", state.mainId, state.rndm],
  //   queryFn: GetData,
  //   enabled: false,
  //   staleTime: Number.POSITIVE_INFINITY,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  //   onSuccess: ShowData,
  // });

  // const GetState = () => {
  //   pnc = useGetFldValue(state.textDts, "pnc");
  //   let api: string = createGetApi("db=nodb|dll=x|fnct=a125", pnc + "=stt");
  //   // console.log(api);
  //   // console.log(state.textDts + "Before Call");
  //   return useNrjAxios({ apiCall: api });
  // };

  // const StateSel = (dataF: any) => {
  //   if (dataF && dataF.data && dataF.data[0] && dataF.data[0]["Data"]) {
  //     let dtf: string = dataF.data[0]["Data"];
  //     let m: string[] = dataF.data[0]["Data"].split("|");
  //     if (m && m.length > 1) {
  //       dtf = "sttid][" + m[0] + "=stt][" + m[1];
  //       dispatch({ type: ACTIONS.SETFORM_DATA, payload: dtf });
  //       dispatch({ type: ACTIONS.FORM_DATA, payload: dtf });
  //       dispatch({ type: ACTIONS.RANDOM, payload: 1 });

  //       setSelSttid(Number(m[0]));
  //       setTimeout(function () {
  //         refetchD();
  //       }, 900);
  //     }
  //   } else {
  //     // dispatch({ type: ACTIONS.TRIGGER_PINCD, payload: 1 });
  //     // setTimeout(function () {
  //     //   dispatch({ type: ACTIONS.TRIGGER_PINCD, payload: 0 });
  //     // }, 500);
  //   }
  // };

  // const { data: dataF, refetch: refetchF } = useQuery({
  //   queryKey: ["svpn", state.rndm],
  //   queryFn: GetState,
  //   enabled: false,
  //   staleTime: Number.POSITIVE_INFINITY,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  //   onSuccess: StateSel,
  // });

  // useEffectOnce(() => {
  //   
  //   let mnid: string = sessionStorage.getItem("rddrct") || "";
  //   if (!mnid) {
  //     let lvl: string = sessionStorage.getItem("lvl") || "0";
  //     if (lvl == "1") {
  //       mnid = sessionStorage.getItem("mainid") || "";
  //     }
  //   }
  //   if (!mnid) {
  //     return;
  //   }
  //   dispatch({ type: ACTIONS.MAINID, payload: Number(mnid) });
  //   setTimeout(function () {
  //     refetchB();
  //   }, 900);
  // });

  const [who, setWho] = useState("")
  const GetDataCity = () => {
    // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a245", 'CPCB=CENTRAL');
    // return nrjAxios({ apiCall: api })

    let wh = who;
    let payload: any = postLinux("RGD" + '=' + wh.toUpperCase() + "=" + fltr, 'getcity');
    return nrjAxiosRequestBio('srchcty', payload);
  }

  const cityCombo = (datastt: any) => {
    if (datastt && datastt.status == 200 && datastt.data) {
      let i: number = 0;
      let strCmbo: string = "";
      let ary: any = GetResponseLnx(datastt);
      if (Array.isArray(ary)) {
        setNotFoundCityFltr(false);
        while (Array.isArray(ary) && i < ary.length) {
          if (strCmbo) {
            strCmbo += "$^";
          }
          strCmbo += "id][" + ary[i]["txt"] + "=";
          strCmbo += "txt][" + ary[i]["txt"];
          i += 1;
        }

      }
      else {
        setNotFoundCityFltr(true);
      }
      dispatch({ type: ACTIONS.SETCITYCOMBO, payload: strCmbo });
      return;
    }
  };

  const [fltr, setFltr] = useState("")
  const [notFoundCityFltr, setNotFoundCityFltr] = useState<boolean>(false)

  const onSearchDb = (fldnm: string, fltr: string) => {
    setFltr(fltr)
    setNotFoundCityFltr(true);
  }


  const { data: data1, refetch: fetchCity } = useQuery({
    queryKey: ["GetDataRgd", fltr, who],
    queryFn: GetDataCity,
    enabled: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: cityCombo,
  });

  useEffectOnce(() => {
    fetchCity();
    refetchState()
  })

  useEffectOnce(() => {
    if (isEdit) {
      let data = JSON.parse(sessionStorage.getItem("rgndId") || '');
      if (data) {
        const { mobcntp, ...updatedData } = data;

        let dataArray = convertFldValuesToString(updatedData)
        
        let id: string = GetDataValue(dataArray, "id");
        let who: string = GetDataValue(dataArray, "cpcbof").split(' ')[0];
        setWho(who)
        dispatch({ type: ACTIONS.MAINID, payload: Number(id) });
        dispatch({ type: ACTIONS.SETFORM_DATAALL, payload: dataArray })
      }
    }

  });


  const getDataState = (params: any) => {

    const rgd: string = who || "";
    let payload: any = {}
    if (who) {
      const rgd: string = params.split("|")[1] ? params.split("|")[1] : "";
      payload = postLinux(rgd, "sttrgd");
    }
    else {
      payload['cmpid'] = getCmpId() || "";
      payload['usrnm'] = getUsrnm() || "";
    }
    return nrjAxiosRequestBio('sttrgd', payload)
    //return nrjAxiosRequestBio('sttrgd', payload)
  };

  const sttCombo = (datastt: any) => {

    if (datastt && datastt.status == 200 && datastt.data) {
      let i: number = 0;
      let sttCombo: string = "";
      let dt: any = GetResponseLnx(datastt);
      let ary: any = dt.data;
      let uniqueAry = new Map();

      if (Array.isArray(ary)) {
        ary.forEach((element: any) => {
          uniqueAry.set(element.fltr, element);
        });

        uniqueAry.forEach((value: any, keys: any) => {
          if (sttCombo) {
            sttCombo += "$^";
          }
          sttCombo += "id][" + value["fltr"] + "=";
          sttCombo += "txt][" + value["drpdwn"];
        })

        while (i < uniqueAry?.entries.length) {
          i += 1;
        }
      }
      dispatch({ type: ACTIONS.SETSTATECOMBO, payload: sttCombo });
      return;
    }
  };

  const { data: data2, refetch: refetchState } = useQuery({
    queryKey: ["stateGet", who],
    queryFn: () => getDataState(who),
    enabled: false,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: sttCombo
  });



  return (
    <>
  <div className="bg-white min-h-screen flex justify-center items-center">


    <div className="shadow rounded-md p-3 w-full"> 
          <div className="grid grid-cols-3 ms-5">
            <div className="mb-3">
              <WtrInput
                Label="CPCB regional directorate"
                fldName="cpcbof"
                idText="txtcpcbof"
                onChange={onChangeDts}
                dsabld={isEdit}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn=""
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={"Enter CPCB regional directorate"}
                delayClose={1000}
                placement="right"
                ClssName=""
                ToolTip="Enter Name CPCB regional directorate without special characters "
              ></WtrInput>
            </div>
            <div className="mb-3">
              <WtrInput
                Label="Name of regional director"
                fldName="cntp"
                idText="txtcntp"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn="1[length]"
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                delayClose={1000}
                speaker={"Enter Name of regional director"}
                placement="bottom"
                ToolTip="Enter name of regional director without special characters "
              ></WtrInput>
            </div>
            <div className="mb-3">
              <WtrInput
                Label="Contact number of regional director"
                fldName="phn"
                idText="txtphn"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn="[mob]"
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
              ></WtrInput>
            </div>
            <div className="mb-3">
              <WtrInput
                Label="E-mail id of regional director"
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
              ></WtrInput>
            </div>
            <div className="mb-3">
              <WtrInput
                Label="Address of regional directorate"
                fldName="adra"
                idText="txtadra"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn=""
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                unblockSpecialChars={true}
              ></WtrInput>
            </div>
            {/* <div className="mb-3">
              <WtrInput
                Label="Address II"
                fldName="adrb"
                idText="txtadrb"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn=""
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
              ></WtrInput>
            </div>
            <div className="mb-3">
              <WtrInput
                Label="Address III"
                fldName="adrc"
                idText="txtadrc"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn=""
                allowNumber={false}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
              ></WtrInput>
            </div> */}

            <div className="mb-3">
              <WtrInput
                Label="Pincode"
                fldName="pnc"
                idText="txtpnc"
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=""
                maxLength={6}
                dsbKey={false}
                upprCase={false}
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.triggerpnc}
              ></WtrInput>
            </div>

            {/* <div className="mb-3">
              <WtrRsSelect
                Label="State/UT"
                fldName="sttid"
                idText="txtsttid"
                onChange={onChangeDts}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                allwZero={"1"}
                fnctCall={false}
                dbCon={""}
                typr={""}
                dllName={""}
                loadOnDemand={state.stateCombo}
                fnctName={""}
                parms={""}
                allwSrch={true}
                speaker={"Select the State"}
                placement="bottom"
                delayClose={1000}
                disable={isEdit}
              ></WtrRsSelect>
            </div> */}

            {/* <div className="mb-3">
              <WtrRsSelect
                Label="City"
                fldName="ctyid"
                idText="txtctyid"
                onChange={onChangeDts}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                fnctCall={false}
                allwZero={"0"}
                loadOnDemand={state.cityCombo}
                onSearchDb={onSearchDb}
                dbCon={""}
                typr={""}
                dllName={""}
                fnctName={""}
                parms={""}
                allwSrch={true}
                speaker={"Select City"}
                IAmRequired={reqFlds}
                disable={isEdit}
              ></WtrRsSelect>
            </div> */}

          

            {/* <div className="mb-3">
              <WtrRsSelect
                Label="Designation "
                fldName="dsgid"
                idText="txtdsgid"
                onChange={onChangeDts}
                selectedValue={state.frmData}
                clrFnct={state.triggerCmbo}
                allwZero={"1"}
                fnctCall={false}
                dbCon={""}
                typr={""}
                dllName={""}
                fnctName={""}
                parms={""}
                allwSrch={true}
                speaker={""}
                delayClose={1000}
                placement="bottom"
              ></WtrRsSelect>
            </div> */}
            {/* <div className="mb-3">
              <WtrInput
                Label="Designation "
                fldName="dsgid"
                idText="txtdsgid"
                onChange={onChangeDts}
                selectedValue={state.frmData}
                dsabld={false}
                callFnFocus=""
                dsbKey={false}
                upprCase={false}
                validateFn="1[length]"
                allowNumber={false}
                clrFnct={state.trigger}
                delayClose={1000}
                speaker={"Enter Name of Designation"}
                placement="bottom"
                ToolTip="Enter name of Designation "
              ></WtrInput>
            </div> */}

        
          </div>

          <div className="flex justify-center py-7">
            <div className="mr-4">
              <Button
                size="medium"
                style={{ color: '#38a169', backgroundColor: "#fff" ,textTransform: "none",}}
                className="font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50"
                variant="contained"
                color="success"
                disabled={!state.disableA}
                onClick={() => { navigate('/rgndlst') }}
              >
                Previous
              </Button>
            </div>
            <div className="mr-4">
              <Button
                size="medium"
                style={{ backgroundColor: "#3B71CA",textTransform: "none", }}
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                disabled={!state.disableA}
                onClick={SaveClick}
              >
                Save
              </Button>
            </div>
          </div>

        </div>


      </div>
    </>
  );
};

export default React.memo(RgnDirctr);

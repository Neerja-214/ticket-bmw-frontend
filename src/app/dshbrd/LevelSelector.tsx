import React, { useEffect, useReducer, useState } from "react";
import utilities, { GetResponseLnx, GetResponseWnds, capitalize, capitalizeTerms, createGetApi, dataStr_ToArray, getApiFromBiowaste, getCmpId, getStateAbbreviation, getUsrnm, postLinux, trimField } from "../../utilities/utilities";
import { nrjAxios, nrjAxiosRequest, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import { useQuery } from "@tanstack/react-query";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { useEffectOnce } from "react-use";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { Button } from "@mui/material";
import OnOffToggle from "../MIS/onOffToggle";
import { getLvl, getWho } from "../../utilities/cpcb";
import { useToaster } from "../../components/reusable/ToasterContext";


const ACTIONS = {
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  FORM_DATA: "frmdata",
  SETFORM_DATA: "setfrmdata",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  SETRGDCOMBO: "setRgdCombo",
  SETSTATECOMBO: "setStateCombo",
  SETCBWTFCOMBO: "setCbwtfCombo",
};

const initialState = {
  rndm: 0,
  trigger: 0,
  textDts: "",
  frmData: "",
  rgdCombo: "",
  stateCombo: "",
  cbwtfCombo: ""
};

type purBill = {
  rndm: number;
  trigger: number;
  textDts: string;
  frmData: string;
  rgdCombo: string;
  stateCombo: string;
  cbwtfCombo: string;
};

type act = {
  type: string;
  payload: any;
};

const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.TRIGGER_FORM:
      newstate.trigger = action.payload;
      if (action.payload === 0) {
        newstate.textDts = "";
        newstate.frmData = "";
      }
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
      newstate.frmData = dta;
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
    case ACTIONS.SETRGDCOMBO:
      newstate.rgdCombo = action.payload;
      return newstate;
    case ACTIONS.SETSTATECOMBO:
      newstate.stateCombo = action.payload;
      return newstate;
    case ACTIONS.SETCBWTFCOMBO:
      newstate.cbwtfCombo = action.payload;
      return newstate;
  }
};

const LevelSelector = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [currentLevel, setCurrentLevel] = useState<string>("")
  const [fltr, setFltr] = useState("")
  const [notFoundCbwtfFltr, setNotFoundCbwtfFltr] = useState<boolean>(false)
  const cmpId: string = getCmpId();

  const [showToggleButton, setShowToggleButton] = useState<boolean>(sessionStorage.getItem("lvl") == 'CPCB' ? true : false);
  const [showDetailedCombo, setShowDetailedCombo] = useState<boolean>(false);
  const showRgd = sessionStorage.getItem('lvl') == 'RGD' ? true : false;
  const rgdId = showRgd ? getWho() : "";
  const showStt = sessionStorage.getItem('lvl') == 'STT' ? true : false;
  const sttId = showStt ? getStateAbbreviation(capitalize(getWho())) : "";
  const [inputData, setInputData] = useState({ rgd: showRgd ? `rgdid][${rgdId}=rgd][${getWho()}` : "", rgdValue: showRgd ? `${rgdId}|${getWho()}` : "", state: showStt ? `sttid][${sttId}=stt][${getWho()}` : "", stateValue: showStt ? `${sttId}|${getWho()}` : "", cbwtf: "", cbwtfValue: "", date: "", dateValue: "", dateFrom: "", dateValueFrom: "", dateTo: "", dateValueTo: "" });
  const [rgdOfCbwtf, setRgdOfCbwtf] = useState("");
  const [sttOfCbwtf, setSttOfCbwtf] = useState("");
  const [requireCbwtf, setReqiureCbwtf] = useState("");
  const [requireRd, setReqiureRd] = useState("");
  const [requireStt, setReqiureStt] = useState("");
  const [buttonDsb, setButtonDsb] = useState(true);
  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };
  const { showToaster, hideToaster } = useToaster();

  useEffect(() => {
    if (props.showToggleButton != undefined) {
      setShowToggleButton(props.showToggleButton)
    }
  }, [props.showToggleButton])

  useEffect(() => {
    const newStates = {
      requireCbwtf: props.requireCbwtf ? "Select" : "",
      requireRd: props.requireRd ? "Select" : "",
      requireStt: props.requireStt ? "Select" : ""
    };

    setReqiureCbwtf(newStates.requireCbwtf);
    setReqiureRd(newStates.requireRd);
    setReqiureStt(newStates.requireStt);
  }, [props.requireCbwtf, props.requireRd, props.requireStt]);

  useEffect(() => {
    console.log(inputData.cbwtfValue)
    if (sessionStorage.getItem("lvl") == 'CPCB') {
      setButtonDsb(false)
    } else {
      if (inputData.cbwtfValue !== "" || inputData.rgdValue !== "" || inputData.stateValue !== "") {
        setButtonDsb(false)
      } else {
        setButtonDsb(true)
      }
      
    }
   
  }, [inputData.cbwtfValue, inputData.rgdValue, inputData.stateValue])

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

  const { data: data1, refetch: fetchRgd } = useQuery({
    queryKey: ["GetDataRgd"],
    queryFn: GetDataRgd,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: rgdCombo,
  });

  useEffectOnce(() => {
    fetchRgd();
  })

  const onChangeRgd: (data: string) => void = (data) => {
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    setInputData({ ...inputData, rgd: data, rgdValue: dt, state: "", stateValue: "", cbwtf: "", cbwtfValue: "" });
  };

  const getDataState = (params: any) => {
    let payload: any = {}
    if (params) {
      const rgd: string = params.split("|")[1] ? params.split("|")[1] : "";
      payload = postLinux(rgd, "sttrgd");
    }
    else {
      payload['cmpid'] = getCmpId() || "";
      payload['usrnm'] = getUsrnm() || "";
    }
    return nrjAxiosRequestBio('sttrgd', payload)
  };

  const sttCombo = (datastt: any) => {
    if (datastt && datastt.status == 200 && datastt.data) {
      let i: number = 0;
      let sttCombo: string = "";
      let dt: any = GetResponseLnx(datastt);
      let ary: any = dt.data;
      if (Array.isArray(ary) && ary.length) {
        let uniqueAry = new Map();
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

  const { data: data2, refetch } = useQuery({
    queryKey: ["stateGet", inputData.rgdValue],
    queryFn: () => getDataState(inputData.rgdValue),
    enabled: true,
    retry: false,
    staleTime: 200,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: sttCombo
  });

  const onChangestate: (data: string) => void = (data) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    setInputData({ ...inputData, state: data, stateValue: dt, cbwtf: "", cbwtfValue: "" });
  };

  const onSearchDb = (fldnm: string, fltr: string) => {
    setFltr(fltr)
    setNotFoundCbwtfFltr(false);
  }
  const [warningText, setWarningText] = useState<string>("");

  const getCbwtf = (rgdData: string, stateData: string, filter: string) => {
    //let api: string = getApiFromBiowaste("cbwtfregtdy");
    let payload: any = postLinux(getLvl() + '=' + getWho() + '=' + filter, 'cbwtflistDrp')
    if (stateData) {
      payload = postLinux('STT=' + stateData.split("|")[0] + '=' + filter, 'cbwtflistDrp');
    }
    else if (rgdData) {
      payload = postLinux('RGD=' + rgdData.split("|")[1] + '=' + filter, 'cbwtflistDrp');
    }

    setWarningText('Please wait..');
    setNotFoundCbwtfFltr(true);
    return nrjAxiosRequestBio('cbwtfnmlist', payload)
  };

  const getCbwtfSuccess = (datacbwtf: any) => {
    if (datacbwtf && datacbwtf.status == 200 && datacbwtf.data) {
      let i: number = 0;
      let strCmbo: string = "";
      if (datacbwtf.data && Array.isArray(datacbwtf.data) && datacbwtf.data.length) {
        datacbwtf.data=trimField(datacbwtf.data,"cbwtfnm")
        const sortedData = datacbwtf.data.sort((a:any, b:any) => a.cbwtfnm.localeCompare(b.cbwtfnm));
        while (i < sortedData.length) {
          if (strCmbo) {
            strCmbo += "$^";
          }
          strCmbo += "id][" + sortedData[i]["cbwtfid"] + "=";
          strCmbo += "txt][" + sortedData[i]["txt"];
          i += 1;
        }
        dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: strCmbo });
        setNotFoundCbwtfFltr(false);
        return;
      }
      else {
        dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: "" });
        setWarningText(`No CBWTF found with '${fltr}'`);
        setNotFoundCbwtfFltr(true);
      }
    }
  };


  const { data: datacbwtf, refetch: refetchcbwtf } = useQuery({
    queryKey: ["cbwtfcombobox", inputData.rgdValue, inputData.stateValue, fltr],
    queryFn: () => getCbwtf(inputData.rgdValue, inputData.stateValue, fltr),
    enabled: true,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: getCbwtfSuccess,
  });



  const getCbwtfInf = (cbwtfData: string) => {
    if (cbwtfData) {
      // let api: string = createGetApi("db=nodb|dll=x|fnct=a231", cbwtfData);
      let payload: any = postLinux(cbwtfData.split('|')[0], 'cbwtfSttRgdInfo')
      return nrjAxiosRequestBio('getcbwtfdtls', payload);
    }
  };

  const getCbwtfInfSuccess = (datacbwtfInf: any) => {
    let dt: any = GetResponseLnx(datacbwtfInf);
    if (dt) {
      let rgd: string = dt.rgd || "";
      let stt: string = dt.state || "";
      if (rgd && stt) {
        setRgdOfCbwtf(rgd);
        setSttOfCbwtf(stt);
      }
      else {
        setRgdOfCbwtf("");
        setSttOfCbwtf("");
      }
    }
    else {
      setRgdOfCbwtf("");
      setSttOfCbwtf("");
    }
  };

  const { data: datacbwtfInf, refetch: refetchCbwtfInf } = useQuery({
    queryKey: ["cbwtfInfcombobox", inputData.cbwtfValue],
    queryFn: () => getCbwtfInf(inputData.cbwtfValue),
    enabled: true,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: getCbwtfInfSuccess,
  });

  const onChangecbwtfid = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    if (!dt) {
      setRgdOfCbwtf("");
      setSttOfCbwtf("");
    }
    setInputData({ ...inputData, cbwtf: data, cbwtfValue: dt });
  };

  const onChangeDate = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    setInputData({ ...inputData, date: data, dateValue: dt });
  }
  const onChangeDateFrom = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    setInputData({ ...inputData, dateFrom: data, dateValueFrom: dt });
  }
  const onChangeDateTo = (data: string) => {
    // dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    // let fldN: any = utilities(2, data, "");
    // let dt = GetDataValue(data, fldN);
    // setInputData({ ...inputData, dateTo: data, dateValueTo: dt });


    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    let frmdt = inputData.dateFrom.split('][')
    if (new Date(dt) < new Date(frmdt[1])) {
      showToaster(["To date cannot be before From date"], "error");
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
      return;
    }
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });

    setInputData({ ...inputData, dateTo: data, dateValueTo: dt });
  }

  const extractLvlWho = () => {
    let data: any = { date: inputData.date, dateFrom: inputData.dateFrom, dateTo: inputData.dateTo }
    if (inputData.cbwtfValue) {
      data = {
        ...data,
        lvl: 'CBWTF',
        who: inputData.cbwtfValue.split("|")[0],
        name: inputData.cbwtfValue.split("|")[1]
      }
      //setCurrentLevel(inputData.cbwtfValue.split("|")[1]);
    }
    else if (inputData.stateValue) {
      let ech = inputData.stateValue.split("|")[1];
      let state = getStateAbbreviation(capitalize(ech.replace(' State Board', '').replace(' Pollution Control Committee', '')));
      data = {
        ...data,
        lvl: 'STT',
        who: state
      }
      setCurrentLevel(ech);
    }
    else if (inputData.rgdValue) {
      let ech = inputData.rgdValue.split("|")[1];
      let rgd = ech.split(' ')[0]?.toUpperCase();
      data = {
        ...data,
        lvl: 'RGD',
        who: rgd
      }
      setCurrentLevel(ech)
    }
    else if (showDetailedCombo) {
      data = {
        ...data,
        lvl: 'CPCB',
        who: 'CENTRAL'
      }
      setCurrentLevel('CPCB')
    }
    else {
      data = {
        ...data,
        lvl: 'CPCB',
        who: 'Select a CBWTF to get data'
      }
      setCurrentLevel('CPCB')
    }

    return data;
  }

  useEffect(() => {
    const data = extractLvlWho();
    props.levelSelectorData(data);
  }, [inputData])

  const getListOnclick = () => {
    const data = extractLvlWho();
    props.getListOnclick(data);
  }


  const printOnclick = () => {
    const data = extractLvlWho();
    props.printButtonClick(data);
  }

  const toggleLvlSelector = () => {
    if (showRgd) {
      setInputData({ ...inputData, state: "", stateValue: "", cbwtf: "", cbwtfValue: "", date: "", dateValue: "", })
    }
    else {
      setInputData({ rgd: "", rgdValue: "", state: "", stateValue: "", cbwtf: "", cbwtfValue: "", date: "", dateValue: "", dateFrom: "", dateValueFrom: "", dateTo: "", dateValueTo: "" })

    }
    setShowDetailedCombo(!showDetailedCombo);
  }
  const [toggleState, setToggleState] = useState(false);
  const handleToggleChange = (newState: any) => {
    setToggleState(newState);
    toggleLvlSelector();
    setRgdOfCbwtf("");
    setSttOfCbwtf("");
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
  };

  return (
    // <div className="bg-white p-1 pr-2 my-3 pb-2 rounded-lg" style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12)' }}>

    //   <div className="flex mb-2 justify-between items-center">
    //     {showToggleButton && !showRgd ? (
    //       <div className="flex text-[16px] py-2">
    //         <span className="ml-1">CBWTF</span>
    //         <OnOffToggle onToggleChange={handleToggleChange} />
    //         <span className="ml-1">Detailed</span>
    //       </div>
    //     ) : (
    //       <div></div>
    //     )}

    //   </div>


    //     <div className="flex flex-wrap items-end gap-2 ml-1">

    //       {showDetailedCombo && !showRgd && <div className="mr-2 mb-2">
    //         <WtrRsSelect
    //           Label="Regional Directorate"
    //           displayFormat="1"
    //           fldName="rgdid"
    //           idText="txtrgdid"
    //           onChange={onChangeRgd}
    //           selectedValue={inputData.rgd}
    //           clrFnct={state.trigger}
    //           allwZero={"0"}
    //           fnctCall={false}
    //           dbCon={""}
    //           typr={""}
    //           loadOnDemand={state.rgdCombo}
    //           dllName={""}
    //           fnctName={""}
    //           parms={""}
    //           allwSrch={false}
    //           speaker={requireRd}
    //         ></WtrRsSelect>
    //       </div>}
    //       {(showDetailedCombo || showRgd) && <div className="mr-2 mb-2">
    //         <WtrRsSelect
    //           displayFormat="1"
    //           Label="State/UT"
    //           fldName="sttid"
    //           idText="txtsttid"
    //           onChange={onChangestate}
    //           selectedValue={inputData.state}
    //           clrFnct={state.trigger}
    //           allwZero={"0"}
    //           fnctCall={false}
    //           dbCon={""}
    //           typr={""}
    //           loadOnDemand={state.stateCombo}
    //           dllName={""}
    //           fnctName={""}
    //           parms={""}
    //           allwSrch={false}
    //           speaker={requireStt}
    //         ></WtrRsSelect>
    //       </div>}
    //       {(!showDetailedCombo || showRgd) &&
    //         <div className="mr-2 mb-2 relative">
    //           <WtrRsSelect
    //             Label={'CBWTF'}
    //             displayFormat="1"
    //             fldName="cbwtfid"
    //             idText="txtcbwtfid"
    //             onChange={onChangecbwtfid}
    //             selectedValue={inputData.cbwtf}
    //             clrFnct={state.trigger}
    //             allwZero={"0"}
    //             fnctCall={false}
    //             dbCon={""}
    //             typr={""}
    //             loadOnDemand={state.cbwtfCombo}
    //             dllName={""}
    //             fnctName={""}
    //             parms={""}
    //             forceDbSearch={true}
    //             allwSrch={true}
    //             onSearchDb={onSearchDb}
    //             menuStyle={{ maxWidth: '400px', minWidth: '200px' }}
    //             drpPlacement={showDetailedCombo ? "bottomEnd" : "rightStart"}
    //             speaker={requireCbwtf}
    //           ></WtrRsSelect>
    //           {(fltr && notFoundCbwtfFltr) ? <small className="ml-3 text-red-500 absolute">{warningText}</small> : <></>}
    //         </div>}

    //       {props.dateField && <div className='mr-2 mb-2 px-4'>
    //         <NrjRsDt
    //           format="dd-MMM-yyyy"
    //           fldName="dt_rpt"
    //           displayFormat="1"
    //           idText="txtdt_rpt"
    //           size="lg"
    //           Label="Date"
    //           selectedValue={inputData.date}
    //           onChange={onChangeDate}
    //           speaker={"Select"}
    //         ></NrjRsDt>
    //       </div>}
    //       {props.dateFieldFrom && <div className='mr-2 mb-2 px-4'>
    //         <NrjRsDt
    //           format="dd-MMM-yyyy"
    //           fldName="dt_rptfrm"
    //           displayFormat="1"
    //           idText="txtdt_rptfrm"
    //           size="lg"
    //           Label="From date"
    //           selectedValue={inputData.dateFrom}
    //           onChange={onChangeDateFrom}
    //           speaker={"Select"}
    //         ></NrjRsDt>
    //       </div>}
    //       {props.dateFieldTo && <div className='mr-2 mb-2 px-4'>
    //         <NrjRsDt
    //           format="dd-MMM-yyyy"
    //           fldName="dt_rptto"
    //           displayFormat="1"
    //           idText="txtdt_rptto"
    //           size="lg"
    //           Label="To date"
    //           selectedValue={inputData.dateTo}
    //           onChange={onChangeDateTo}
    //           speaker={"Select"}
    //           customDate={true}
    //         ></NrjRsDt>
    //       </div>}
    //       {props.dateFieldToForRange && <div className='mr-2 mb-2 px-4'>
    //         <NrjRsDt
    //           format="dd-MMM-yyyy"
    //           fldName="dt_rptto"
    //           displayFormat="1"
    //           idText="txtdt_rptto"
    //           size="lg"
    //           Label="To date"
    //           selectedValue={inputData.dateTo}
    //           onChange={onChangeDateTo}
    //           speaker={"Select"}
    //           customDate={true}
    //           shouldDisableCustomDate={true}
    //           fromDate={inputData.dateFrom}
    //         ></NrjRsDt>
    //       </div>}
    //       {!showDetailedCombo && rgdOfCbwtf && sttOfCbwtf && <div className="">
    //         <div className="bg-white px-2 py-1 rounded-lg border">
    //           <div className={`text-[18px] font-semibold whitespace-nowrap  ${props.dateField || props.dateFieldFrom || props.dateFieldTo ? ' text-end ' : 'text-center'} font-semibold whitespace-nowrap`}>
    //             RD: {rgdOfCbwtf} <br />
    //             State/UT : {sttOfCbwtf}
    //           </div>
    //         </div>
    //       </div>}

    //     </div>

    //     <div className="mt-3 flex px-2 items-center">

    //       {props.getListButton && <div className="mr-2">
    //         <Button
    //           size="medium"
    //           // style={{ backgroundColor: "#3490dc", color: '#fff' }}
    //           style={{
    //             backgroundColor: !buttonDsb ? "#3490dc" : "#d3d3d3", // Gray for disabled
    //             color: !buttonDsb ? "#fff" : "#a9a9a9", // Light gray text for disabled
    //             cursor: !buttonDsb ? "pointer" : "not-allowed", // Show not-allowed cursor
    //           }}
    //           variant="contained"
    //           color="success"
    //           onClick={getListOnclick}
    //           className="me-3"
    //           disabled={buttonDsb}
    //         >{props.buttontext ? props.buttontext : "Get list"}

    //         </Button>
    //       </div>}
    //       {false && <div className="mr-2">
    //         <Button
    //           size="medium"
    //           style={{
    //             backgroundColor: "#38a169",
    //             transition: "background-color 0.3s, transform 0.3s",
    //             color: '#fff'
    //           }}
    //           variant="contained"
    //           color="success"
    //           onClick={printOnclick}
    //           className="me-3">
    //           Print
    //         </Button>
    //       </div>}
    //     </div>



    // </div>

    <div className="bg-white p-1 pr-2 my-3 pb-2 rounded-lg" style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12)' }}>



      {/* 🔹 FLEX CONTAINER FOR ALL FIELDS IN A SINGLE ROW */}
      <div className="flex flex-wrap items-end gap-3 ml-1">

        <div className="flex mb-2 justify-between items-center">
          {showToggleButton && !showRgd ? (
            <div className="flex text-[16px] py-2">
              <span className="ml-1">CBWTF</span>
              <OnOffToggle onToggleChange={handleToggleChange} />
              <span className="ml-1">Detailed</span>
            </div>
          ) : (
            <div></div>
          )}
        </div>

        {/* {showDetailedCombo && !showRgd && (
          <div className="mb-2">
            <WtrRsSelect
              Label="Regional Directorate"
              displayFormat="1"
              fldName="rgdid"
              idText="txtrgdid"
              onChange={onChangeRgd}
              selectedValue={inputData.rgd}
              clrFnct={state.trigger}
              allwZero={"0"}
              fnctCall={false}
              dbCon={""}
              typr={""}
              loadOnDemand={state.rgdCombo}
              dllName={""}
              fnctName={""}
              parms={""}
              allwSrch={false}
              speaker={requireRd}
            />
          </div>
        )} */}

        {(showDetailedCombo || showRgd) && (
          <div className="mb-2">
            <WtrRsSelect
              Label="State/UT"
              displayFormat="1"
              fldName="sttid"
              idText="txtsttid"
              onChange={onChangestate}
              selectedValue={inputData.state}
              clrFnct={state.trigger}
              allwZero={"0"}
              fnctCall={false}
              dbCon={""}
              typr={""}
              loadOnDemand={state.stateCombo}
              dllName={""}
              fnctName={""}
              parms={""}
              allwSrch={false}
              speaker={requireStt}
            />
          </div>
        )}

        {(!showDetailedCombo || showRgd) && (
          <div className="mb-2 relative">
            <WtrRsSelect
              Label="CBWTF"
              displayFormat="1"
              fldName="cbwtfid"
              idText="txtcbwtfid"
              onChange={onChangecbwtfid}
              selectedValue={inputData.cbwtf}
              clrFnct={state.trigger}
              allwZero={"0"}
              fnctCall={false}
              dbCon={""}
              typr={""}
              loadOnDemand={state.cbwtfCombo}
              dllName={""}
              fnctName={""}
              parms={""}
              forceDbSearch={true}
              allwSrch={true}
              onSearchDb={onSearchDb}
              menuStyle={{ maxWidth: '400px', minWidth: '200px' }}
              drpPlacement={showDetailedCombo ? "bottomEnd" : "rightStart"}
              speaker={requireCbwtf}
            />
            {fltr && notFoundCbwtfFltr && (
              <small className="ml-3 text-red-500 absolute">{warningText}</small>
            )}
          </div>
        )}

        {props.dateField && (
          <div className="mb-2 px-4">
            <NrjRsDt
              format="dd-MMM-yyyy"
              fldName="dt_rpt"
              displayFormat="1"
              idText="txtdt_rpt"
              size="lg"
              Label="Date"
              selectedValue={inputData.date}
              onChange={onChangeDate}
              speaker={"Select"}
            />
          </div>
        )}

        {props.dateFieldFrom && (
          <div className="mb-2 px-4">
            <NrjRsDt
              format="dd-MMM-yyyy"
              fldName="dt_rptfrm"
              displayFormat="1"
              idText="txtdt_rptfrm"
              size="lg"
              Label="From date"
              selectedValue={inputData.dateFrom}
              onChange={onChangeDateFrom}
              speaker={"Select"}
            />
          </div>
        )}

        {props.dateFieldTo && (
          <div className="mb-2 px-4">
            <NrjRsDt
              format="dd-MMM-yyyy"
              fldName="dt_rptto"
              displayFormat="1"
              idText="txtdt_rptto"
              size="lg"
              Label="To date"
              selectedValue={inputData.dateTo}
              onChange={onChangeDateTo}
              speaker={"Select"}
              customDate={true}
            />
          </div>
        )}

        {props.dateFieldToForRange && (
          <div className="mb-2 px-4">
            <NrjRsDt
              format="dd-MMM-yyyy"
              fldName="dt_rptto"
              displayFormat="1"
              idText="txtdt_rptto"
              size="lg"
              Label="To date"
              selectedValue={inputData.dateTo}
              onChange={onChangeDateTo}
              speaker={"Select"}
              customDate={true}
              shouldDisableCustomDate={true}
              fromDate={inputData.dateFrom}
            />
          </div>
        )}

        {/* {!showDetailedCombo && rgdOfCbwtf && sttOfCbwtf && (
          <div className="bg-white px-2 py-1 rounded-lg border">
            <div className={`text-[18px] font-semibold whitespace-nowrap ${props.dateField || props.dateFieldFrom || props.dateFieldTo ? ' text-end ' : 'text-center'}`}>
              RD: {rgdOfCbwtf} <br />
              State/UT: {sttOfCbwtf}
            </div>
          </div>
        )} */}

        {props.getListButton && (
          <div className="mr-3 mb-2">
            <Button
              size="medium"
              style={{
                backgroundColor: !buttonDsb ? "#3490dc" : "#d3d3d3",
                color: !buttonDsb ? "#fff" : "#a9a9a9",
                cursor: !buttonDsb ? "pointer" : "not-allowed",
                textTransform: "none", 
              }}
              variant="contained"
              color="success"
              onClick={getListOnclick}
              className="me-3"
              disabled={buttonDsb}
            >
              {capitalizeTerms(props.buttontext ? props.buttontext : "Get list")}
            </Button>
          </div>
        )}

        {false && (
          <div className="mr-2">
            <Button
              size="medium"
              style={{
                backgroundColor: "#38a169",
                transition: "background-color 0.3s, transform 0.3s",
                color: '#fff',
                 textTransform: "none"
              }}
              variant="contained"
              color="success"
              onClick={printOnclick}
              className="me-3"
            >
              Print
            </Button>
          </div>
        )}
      </div>

    </div>

  );
};

export default React.memo(LevelSelector);



import React, { useEffect, useReducer, useState } from "react";
import utilities, { GetResponseLnx, GetResponseWnds, capitalize, createGetApi, dataStr_ToArray, getApiFromBiowaste, getCmpId, getStateAbbreviation, postLinux, trimField } from "../../utilities/utilities";
import { nrjAxios, nrjAxiosRequest, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import { useQuery } from "@tanstack/react-query";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { useEffectOnce } from "react-use";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { Button } from "@mui/material";
import OnOffToggle from "../MIS/onOffToggle";
import NrjChkbx from "../../components/reusable/NrjChkbx";
import { Modal } from "rsuite";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { Toaster } from "../../components/reusable/Toaster";
import { getLvl, getWho } from "../../utilities/cpcb";
import { UseMomentDateNmb } from "../../Hooks/useMomentDtArry";


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
  const [showDetailedCombo, setShowDetailedCombo] = useState<boolean>(props.showDetailedCombo ? true : false);
  const [showRequrdFld, setShowRequiredFld] = useState<string>(props.requireFldCbwtf ? "true" : "")
  const showRgd = sessionStorage.getItem('lvl') == 'RGD' ? true : false;
  const rgdId = showRgd ? getWho() : "";
  const showStt = sessionStorage.getItem('lvl') == 'STT' ? true : false;
  const sttId = showStt ? getStateAbbreviation(capitalize(getWho())) : "";
  const [inputData, setInputData] = useState({ rgd: showRgd ? `rgdid][${rgdId}=rgd][${getWho()}` : "", rgdValue: showRgd ? `${rgdId}|${getWho()}` : "", state: showStt ? `sttid][${sttId}=stt][${getWho()}` : "", stateValue: showStt ? `${sttId}|${getWho()}` : "", cbwtf: "", cbwtfValue: "", frmDate: "", toDate: "" });
  const [rgdOfCbwtf, setRgdOfCbwtf] = useState("");
  const [sttOfCbwtf, setSttOfCbwtf] = useState("");
  const GetDataValue = (data: string, fld: string) => {
    let vl: string = getFldValue(data, fld);
    return vl;
  };
  const [showMessage, setShowMessage] = useState<any>({ message: [] });

  useEffect(() => {
    if (props.showToggleButton != undefined) {
      setShowToggleButton(props.showToggleButton)
    }
    if (props.requireFld != undefined) {
      setShowRequiredFld(props.requireFld)

    }
  }, [props.showToggleButton, props.requireFld])

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

  const getDataState = (params: any, fltr: any) => {
    let payload: any = postLinux(getLvl() + '=' + getWho(), 'sttlistdrp')
    if (params) {
      payload = postLinux('RGD=' + params.split("|")[1], 'sttlistdrp');

    } else {
      payload = postLinux('RGD=' + params.split("|")[1], 'sttlistdrp2');
    }
    return nrjAxiosRequestBio('sttrgd', payload)

  };

  const sttCombo = (datastt: any) => {
    if (datastt && datastt.status == 200 && datastt.data) {
      let i: number = 0;
      let sttCombo: string = "";
      let dt: any = GetResponseLnx(datastt);
      let ary: any = dt.data;
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
      dispatch({ type: ACTIONS.SETSTATECOMBO, payload: sttCombo });
      return;
    }
  };

  const { data: data2, refetch } = useQuery({
    queryKey: ["stateGet", inputData.rgdValue],
    queryFn: () => getDataState(inputData.rgdValue, fltr),
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
  const getCbwtf = (rgdData: string, stateData: string, filter: string) => {
    let api: string = getApiFromBiowaste("cbwtfregtdy");
    let whoId = sessionStorage.getItem('mainid');
    let payload: any = postLinux(getLvl() + '=' + getWho() + '=' + filter, 'cbwtflistDrp')
    if (stateData) {
      payload = postLinux('STT=' + stateData.split("|")[0] + '=' + filter, 'cbwtflistDrp');
    }
    else if (rgdData) {
      payload = postLinux('RGD=' + rgdData.split("|")[1] + '=' + filter, 'cbwtflistDrp');
    }
    return nrjAxiosRequestBio('cbwtfnmlist', payload)
  };

  const getCbwtfSuccess = (datacbwtf: any) => {
    if (datacbwtf && datacbwtf.status == 200 && datacbwtf.data) {
      let i: number = 0;
      let strCmbo: string = "";
      if (datacbwtf.data && Array.isArray(datacbwtf.data) && datacbwtf.data.length) {
        datacbwtf.data = trimField(datacbwtf.data, "cbwtfnm")
        const sortedData = datacbwtf.data.sort((a: any, b: any) => a.cbwtfnm.localeCompare(b.cbwtfnm));
        while (i < sortedData.length) {
          if (strCmbo) {
            strCmbo += "$^";
          }
          strCmbo += "id][" + datacbwtf.data[i]["cbwtfid"] + "=";
          strCmbo += "txt][" + datacbwtf.data[i]["txt"];
          i += 1;
        }
        dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: strCmbo });
        setNotFoundCbwtfFltr(false);
        return;
      }
      else {
        dispatch({ type: ACTIONS.SETCBWTFCOMBO, payload: "" });
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
      let api: string = createGetApi("db=nodb|dll=x|fnct=a231", cbwtfData);
      return nrjAxios({ apiCall: api });
    }
  };

  const getCbwtfInfSuccess = (datacbwtfInf: any) => {
    let dt: any = GetResponseWnds(datacbwtfInf);
    if (dt) {
      let rgd: string = getFldValue(dt, 'rgd');
      let stt: string = getFldValue(dt, 'stt')
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


  const OnChangeToDate = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    setInputData((input: any) => ({ ...input, toDate: dt }));
  }
  const OnChangeFrmDate = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    let fldN: any = utilities(2, data, "");
    let dt = GetDataValue(data, fldN);
    setInputData((input: any) => ({ ...input, frmDate: dt }));
  }

  const extractLvlWho = () => {
    let data: any = { frmDate: inputData.frmDate, toDate: inputData.toDate }
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
      console.log(ech);
      let state = getStateAbbreviation(capitalize(ech.replace(' State Board', '').replace(' Pollution Control Committee', '')));
      console.log(state);
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
    console.log(data)
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
      setInputData({ ...inputData, state: "", stateValue: "", cbwtf: "", cbwtfValue: "" })
    }
    else {
      setInputData({ ...inputData, rgd: "", rgdValue: "", state: "", stateValue: "", cbwtf: "", cbwtfValue: "" })
    }
    setShowDetailedCombo(!showDetailedCombo);
  }
  const [toggleState, setToggleState] = useState(false);
  const handleToggleChange = (newState: any) => {
    setToggleState(newState);
    toggleLvlSelector();
    setRgdOfCbwtf("");
    setSttOfCbwtf("");
  };

  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
    refetchB()
  }

  const handleClose = () => {
    setOpen(false);
  };

  const [rowData, setRowData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState("")

  const GetData = () => {
    let gd: any = utilities(3, "", "");
    const data = extractLvlWho();
    setRowData([]);
    let payload: any = postLinux(data.who + '=' + data.who + '=' + 0 + '=' + 0 + '=' + gd, 'cbwtfLst');
    return nrjAxiosRequestBio("cbwtfregtdy", payload);
  };

  const ShowData = (data: any) => {
    if (Array.isArray(data.data) && data.data.length) {
      let ary: [] = data.data;
      setRowData(ary);
    }
    else {
      setShowMessage({ message: ['Did not find any Data'], type: 'error' });
    }
  };


  const { data: datab, refetch: refetchB } = useQuery({
    queryKey: [inputData.rgdValue, inputData.stateValue],
    queryFn: GetData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });


  return (
    <div className="bg-white p-1 pr-2 my-3 pb-2 rounded-lg" style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12)' }}>


      <div className="">
        <div className="grid grid-cols-3 flex items-end p-2">
          {showToggleButton && <div className="flex text-[16px] py-2 mr-3">
            <span className="ml-1">CBWTF</span>
            <OnOffToggle onToggleChange={handleToggleChange} />
            <span className="ml-1">Detailed</span>
          </div>}
          {/* {showDetailedCombo && !showRgd && !showStt && <div className="mr-3">
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
            ></WtrRsSelect>
          </div>} */}
          {(showDetailedCombo && !showStt) && <div className="mr-2">
            <WtrRsSelect
              displayFormat="1"
              Label="State"
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
            ></WtrRsSelect>
          </div>}
          {(!showDetailedCombo || showStt || showRgd) && <div className="mr-2">
            <WtrRsSelect
              Label={'CBWTF'}
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
              speaker={showRequrdFld}
            ></WtrRsSelect>
            {(fltr && notFoundCbwtfFltr) ? <small className="ml-3 text-red-500">No CBWTF found with '{fltr}'</small> : <></>}
          </div>}

          <div className="flex">
            <div className='mr-2 px-4'>
              <NrjRsDt
                format="dd-MMM-yyyy"
                fldName="frmDate"
                displayFormat="1"
                idText="txtdt_rpt"
                size="lg"
                Label="From date"
                selectedValue={inputData.frmDate}
                onChange={OnChangeFrmDate}
                speaker={"Select"}
              ></NrjRsDt>
            </div>

            <div className='mr-2 px-4'>
              <NrjRsDt
                format="dd-MMM-yyyy"
                fldName="toDate"
                displayFormat="1"
                idText="txtdt_rpt"
                size="lg"
                Label="To date"
                selectedValue={inputData.toDate}
                onChange={OnChangeToDate}
                speaker={"Select"}
              ></NrjRsDt>
            </div>
          </div>
          <div>
          </div>

          {/* {!showDetailedCombo && rgdOfCbwtf && sttOfCbwtf && <div className="">
            <div className="bg-white px-2 py-1 rounded-lg border">
              <div className={`text-[18px] ${props.dateField ? ' text-end ' : 'text-center'} font-semibold whitespace-nowrap`}>
                RD: {rgdOfCbwtf} <br />
                State/UT : {sttOfCbwtf}
              </div>
            </div>
          </div>} */}
          {props.getListButton && <div className="mr-2">
            <Button
              size="medium"
              style={{ backgroundColor: "#3490dc", color: '#fff',textTransform: "none" }}
              variant="contained"
              color="success"
              onClick={getListOnclick}
              className="me-3"
            >
              Get list
            </Button>
          </div>}
          {false && <div className="mr-2">
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
              className="me-3">
              Print
            </Button>
          </div>}
          {false && (inputData.rgdValue || inputData.stateValue) &&
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
              onClick={handleOpen}
              className="me-3">
              See CBWTF
            </Button>
          }
        </div>
      </div>
      <div>
        {open && (
          <Modal open={open} size="md" onClose={handleClose}>
            <Modal.Header>
              <Modal.Title>
                <div className="font-semibold">
                  <span>List of CBWTF</span>
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div
                className="mx-8 rounded-lg p-3 mt-4"
                style={{ backgroundColor: "#f5f6fa" }}
              >
                <div className="absolute font-semibold text-lg mx-4">{isLoading}</div>
                {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                  <Toaster data={showMessage} className={''}></Toaster>
                </div> : <></>}

                <NrjAgGrid
                  onGridLoaded={() => { }}
                  onRowSelected={() => { }}
                  onButtonClicked={() => { }}
                  colDef={[{
                    field: "cbwtfnm",
                    width: 700,
                     headerName: "Name of CBWTF",
                    tooltipField: 'cbwtfnm',
                  }]}
                  apiCall={""}
                  rowData={rowData}
                  deleteButton={""}
                  newRowData={state.nwRow}
                  trigger={state.triggerG}
                  showPagination={true}
                  showTooltips={true}
                  className="ag-theme-alpine-blue ag-theme-alpine"
                ></NrjAgGrid>
              </div>
            </Modal.Body>
            <Modal.Footer className='p-1 mx-8'>

            </Modal.Footer>
          </Modal>
        )}
      </div>


    </div>
  );
};

export default React.memo(LevelSelector);



import React, { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, SvgIcon } from "@mui/material";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  capitalize,
  convertFldValuesToJson,
  getCmpId,
  getStateAbbreviation,
  getUsrnm,
  postLinux,
  svLnxSrvr,
} from "../../../utilities/utilities";
import { validForm } from "../../../Hooks/validForm";
import WtrInput from "../../../components/reusable/nw/WtrInput";
import SaveIcon from "@mui/icons-material/Save";
import { useEffectOnce } from "react-use";
import { useSearchParams } from "react-router-dom";
import { useToaster } from "../../../components/reusable/ToasterContext";
import { getWho } from "../../../utilities/cpcb";
import { nrjAxiosRequestBio } from "../../../Hooks/useNrjAxios";
import { getFldValue } from "../../../Hooks/useGetFldValue";
import WtrRsSelect from "../../../components/reusable/nw/WtrRsSelect";
import NrjAgGrid from "../../../components/reusable/NrjAgGrid";

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
      newstate.gid = ""
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
      if (newstate.disableA == 1) {
        newstate.disableA = 0
      } else {
        newstate.disableA = 1
      }
      return newstate
  }
};


const Stt_CaptiveInformation = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const reqFlds = [
    { fld: 'dt_year', msg: 'Select Year', chck: '1[length]' },
    { fld: 'hcfcptv', msg: "Enter no. of HCFs having captive treatment facilities", chck: '1[length]' },
    { fld: 'hcfcptvopr', msg: 'Enter no of captive incinerators operated by HCFs', chck: '1[length]' },
    { fld: 'oprcbwtf', msg: 'Enter no of CBWTFs operational', chck: '1[length]' },
    { fld: 'constcbwtf', msg: 'Enter no of CBWTFs under Construction', chck: '1[length]' },
    { fld: 'deephcf', msg: 'Enter deep burial installed by HCFs', chck: '1[length]' },
    { fld: 'deepcbwtf', msg: 'Enter deep burial installed by CBWTFs', chck: '1[length]' },
  ];

  const coldef = [
    { field: 'id', hide: true, width: 0, headerName: '' },
    { field: 'dt_year', hide: false, width: 150, headerName: 'Select Year', chck: '1[length]' },
    { field: 'hcfcptv', hide: false, width: 280, headerName: "No. of HCFs having captive treatment facilities", chck: '1[length]' },
    { field: 'hcfcptvopr', hide: false, width: 280, headerName: 'No of captive incinerators operated by HCFs', chck: '1[length]' },
    { field: 'oprcbwtf', hide: false, width: 220, headerName: 'No of CBWTFs operational', chck: '1[length]' },
    { field: 'constcbwtf', hide: false, width: 230, headerName: 'No of CBWTFs under Construction', chck: '1[length]' },
    { field: 'deephcf', hide: false, width: 230, headerName: 'Deep burial installed by HCFs', chck: '1[length]' },
    { field: 'deepcbwtf', hide: false, width: 230, headerName: 'Deep burial installed by CBWTFs', chck: '1[length]' },
  ];



  const [year, setYear] = useState(String(new Date().getFullYear()));

  const GridLoaded = () => {
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
  };
  const onRowSelected = (data: string) => { };

  const onChangeDts = (data: string) => {
    let fld: any = utilities(2, data, "");
    if (fld == 'dt_yearid') {
      setYear(getFldValue(data, 'dt_yearid'))
    }
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const HandleSaveClick = () => {
    let formData: any = state.textDts;
    formData = convertFldValuesToJson(formData);
    formData['cmpid'] = getCmpId() || "";
    formData['usrnm'] = getUsrnm() || "";
    formData['sttnm'] = getStateAbbreviation(capitalize(getWho()));
    formData['sttname'] = capitalize(getWho());
    return nrjAxiosRequestBio("stt_postCaptiveInformation", formData)
  };

  const { showToaster, hideToaster } = useToaster();


  const svClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);

    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
      }, 5000);
      return;
    }

    if(Number(getFldValue(api, 'deepcbwtf')) > Number(getFldValue(api, 'oprcbwtf'))){
      showToaster(["Deep burial installed by CBWTFs cannot be greater than no of CBWTFs operational"], 'error');
      return;
    }
    else if(Number(getFldValue(api, 'deephcf')) > Number(getFldValue(api, 'hcfcptv'))){
      showToaster(["Deep burial installed by HCFs cannot be greater than No. of HCFs having captive treatment facilities"], 'error');
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
      refetchGetData()
    }
    else {
      showToaster(['Something went wrong! please try again'], 'error')
    }
  };


  const { data, refetch } = useQuery({
    queryKey: ["svQryCaptiveInformation1", state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  });

  useEffectOnce(() => {
    refetchGetData();
  });

  const GetSvData = (year: string) => {
    if (year) {
      let who: string = getStateAbbreviation(capitalize(getWho()));
      let payload: any = postLinux('STT=' + who + "=" + year + "=stt_captiveInformation", 'stt_captiveInformation')
      return nrjAxiosRequestBio("stt_captiveInformation", payload);
    }
    else {
      clrFunct();
      let who: string = getStateAbbreviation(capitalize(getWho()));
      let payload: any = postLinux('STT=' + who  + "=stt_listCaptiveInformation", 'stt_listCaptiveInformation')
      return nrjAxiosRequestBio("stt_captiveInformation", payload);
      
    }
  };

  let value1 = new Date().getFullYear()
  const loadOnDemand = `id][${value1 - 1}=txt][${value1 - 1}$^id][${value1}=txt][${value1}`
  //console.log(value1);
  const ShowData = (dataSvd: any) => {
    let dt: any = GetResponseLnx(dataSvd);
    if (Array.isArray(dt.data) && dt.data.length) {
      dispatch({ type: ACTIONS.NEWROWDATA, payload: dt });
    }
  };

  const { data: dataSvd, refetch: refetchGetData } = useQuery({
    queryKey: ["getCaptiveInformation", year],
    queryFn: () => GetSvData(year),
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  const clrFunct = () => {
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    }, 300)
  }

  const Seperator = (props: any) => {
    return (
      <>
        <div className="mt-7">
          <div className="font-semibold" style={{ color: '#86c6d9' }}>
            {/* <div className="font-semibold" style={{ color: '#009ED6' }}> */}
            {props.heading}
          </div>
          <div className="mt-2" style={{ border: '1px solid #86c6d9' }}>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="bg-white pb-12 pt-2">
     
      <div className="shadow rounded-lg">
        <div>

          {/* <div className="mt-3 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-6 mx-5">
            <div className="bg-white border border-2 py-2 px-3 text-center rounded-lg shadow">
              <div className="flex p-4 justify-center">
                <div className="w-full">
                  <div className="bg-blue-100 rounded w-full px-4 p-3 mb-2">
                    <h4 className="flex items-center justify-center">321<span className="font-normal ml-2 text-[14px]">HCFs having captive treatment facilities </span> </h4>
                  </div>
                  <div className="bg-blue-100 rounded w-full px-4 p-3 ">
                    <h4 className="flex items-center justify-center"> 123 <span className="font-normal ml-2 text-[14px]">Captive incinerators operated by HCFs</span> </h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-2 py-2 px-3 text-center rounded-lg shadow">
              <div className="flex p-4 justify-center">
                <div className="w-full">
                  <div className="bg-blue-100 rounded w-full px-4 p-3 mb-2">
                    <h4 className="flex items-center justify-center">321<span className="font-normal ml-2 text-[14px]">CBWTFs operational</span> </h4>
                  </div>
                  <div className="bg-blue-100 rounded w-full px-4 p-3 ">
                    <h4 className="flex items-center justify-center"> 123 <span className="font-normal ml-2 text-[14px]">CBWTFs under Construction</span> </h4>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-2 py-2 px-3 text-center rounded-lg shadow">
              <div className="flex p-4 justify-center">
                <div className="w-full">
                  <div className="bg-blue-100 rounded w-full px-4 p-3 mb-2">
                    <h4 className="flex items-center justify-center">321<span className="font-normal ml-2 text-[14px]">Deep burial installed by HCFs</span> </h4>
                  </div>
                  <div className="bg-blue-100 rounded w-full px-4 p-3 ">
                    <h4 className="flex items-center justify-center"> 123 <span className="font-normal ml-2 text-[14px]">Deep burial installed by CBWTFs</span> </h4>
                  </div>
                </div>
              </div>
            </div>

  </div> */}
          <div className="mx-7">
            <Seperator heading="Select Year"></Seperator>
            <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">

              <div className='w-9/12'>
                <WtrRsSelect
                  Label="Select year"
                  speaker="Select year"
                  fldName="dt_yearid"
                  idText="txtdt_yearid"
                  displayFormat={"1"}
                  onChange={onChangeDts}
                  selectedValue={state.frmData}
                  clrFnct={state.trigger}
                  allwZero={"0"}
                  fnctCall={false}
                  dbCon=""
                  typr=""
                  loadOnDemand={loadOnDemand}
                  dllName={""}
                  fnctName={""}
                  parms={""}
                  allwSrch={true}
                  delayClose={1000}
                ></WtrRsSelect>
              </div>
            </div>
          </div> 
          {/* <Seperator heading=""></Seperator> */}
          <div className="grid md:grid-cols-1 mt-3 lg:grid-cols-2 ">

            <div className="mb-1">
              <WtrInput
                Label='No. of HCFs having captive treatment facilities'
                speaker='Enter no. of HCFs having captive treatment facilities'
                fldName='hcfcptv'
                idText='txthcfcptv'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                delayClose={1000}
                placement='right'
                ToolTip="Enter whole numbers only"

                ClssName='' ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label="No of captive incinerators operated by HCFs"
                speaker="Enter No of captive incinerators operated by HCFs"
                fldName='hcfcptvopr'
                idText='txthcfcptvopr'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                delayClose={1000}
                placement='bottom'
                ClssName=''
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label="No of CBWTFs operational"
                speaker="Enter no of CBWTFs operational"
                fldName='oprcbwtf'
                idText='txtttlwth'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>


            <div className="mb-1">
              <WtrInput
                Label="No of CBWTFs under Construction"
                speaker="Enter no of CBWTFs under Construction"
                fldName='constcbwtf'
                idText='txtconstcbwtf'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>
            <div className="mb-1">
              <WtrInput
                Label="Deep burial installed by HCFs"
                speaker="Enter deep burial installed by HCFs"
                fldName='deephcf'
                idText='txtdeephcf'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label="Deep burial installed by CBWTFs"
                fldName='deepcbwtf'
                idText='txtdeepcbwtf'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker="Enter deep burial installed by CBWTFs"
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>

          </div>
        </div>
        <div className="flex justify-center py-7">
          <div className="mr-4">
            <Button
              size="medium"
              style={{ backgroundColor: "#3B71CA" , textTransform: "none"}}
              variant="contained"
              color="success"
              disabled={!state.disableA}
              startIcon={<SaveIcon />}
              onClick={svClick}
            >
              Submit
            </Button>
          </div>
          <div className="mr-4">
            <Button
              size="medium"
              style={{ color: "#3B71CA", backgroundColor: "#fff", textTransform: "none" }}
              variant="contained"
              color="success"
              disabled={!state.disableA}
              startIcon={<SaveIcon />}
              onClick={clrFunct}
            >
              Reset form
            </Button>
          </div>

        </div>

        <div
          className="w-11/12 justify-centre ml-10"
          style={{ marginLeft: "25px", marginTop: "25px" }}
        >
          <NrjAgGrid
            onGridLoaded={GridLoaded}
            onRowSelected={onRowSelected}
            colDef={coldef}
            apiCall={""}
            rowData={[]}
            showDataButton={''}
            showFldNm={'cbtwf'}
            className='ag-theme-alpine-blue ag-theme-alpine'
            trigger={state.triggerG}
            showPagination={true}
            newRowData={state.nwRow}
          ></NrjAgGrid>
        </div>
      </div>
    </div>
  );
}; export default React.memo(Stt_CaptiveInformation);

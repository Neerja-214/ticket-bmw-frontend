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
import { Toaster } from "../../../components/reusable/Toaster";
import { useNavigate } from "react-router";
import { useEffectOnce } from "react-use";
import { useSearchParams } from "react-router-dom";
import { useToaster } from "../../../components/reusable/ToasterContext";
import NrjRsDt from "../../../components/reusable/NrjRsDt";
import NrjAgGrid from "../../../components/reusable/NrjAgGrid";
import { getWho } from "../../../utilities/cpcb";
import { nrjAxiosRequestBio } from "../../../Hooks/useNrjAxios";
import { getFldValue } from "../../../Hooks/useGetFldValue";

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
//const [state, dispatch] = useReducer(reducer, initialState);





const Stt_AuthorizationDetails = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statenm = searchParams.get('name');
  //const reqFlds: any[] = [];
  const reqFlds = [
    { fld: 'dt_mnth', msg: 'Select Month', chck: '1[length]' },
    { fld: 'ttlapp', msg: 'Total no of HCF applied for authorization', chck: '1[length]' },
    { fld: 'ttlgrt', msg: 'Total No Authorized HCF', chck: '1[length]' },
    { fld: 'ttlwth', msg: 'Total no of HCF in operation without authorization', chck: '1[length]' },
  ];

  const coldef = [
    { field: 'id', hide: true, width: 0, headerName: '' },
    { fld: 'dt_mnth', hide: false, width:150, headerName: 'Month' },
    { field: 'ttlapp', hide: false, width: 350, headerName: 'Total no of HCF applied for authorization' },
    { field: 'ttlgrt', hide: false, width: 350, headerName: 'Total No Authorized HCF' },
    { field: 'ttlwth', hide: false, width: 350, headerName: 'Total no of HCF in operation without authorization' },
];



  const [month, setMonth] = useState("");
  const GridLoaded = () => {
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
  };
  const onRowSelected = (data: string) => { };

  const onChangeDts = (data: string) => {
    let fld: any = utilities(2, data, "");
      if (fld == 'dt_mnth') {
        setMonth(getFldValue(data, 'dt_mnth'))
      }
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };

  const HandleSaveClick = () => {
    let formData:any = state.textDts;
    formData = convertFldValuesToJson(formData);
    formData['cmpid'] = getCmpId()||"";
    formData['usrnm'] = getUsrnm()||"";
    formData['sttnm'] = getStateAbbreviation(capitalize(getWho()));
    formData['sttname'] = capitalize(getWho());
    //delete formData['_id']
    return nrjAxiosRequestBio("np", formData)
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

    // if(Number(getFldValue(api, 'ttlapp')) - Number(getFldValue(api, 'ttlgrt')) < 0){
    //     showToaster(['Total no of without authorization operated HCF should be lesser than total no '], 'error');
    // }


    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetch();
  };

  const svdQry = (data: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    let dt:any = GetResponseLnx(data);
    if(dt.status == 'Success'){
      showToaster([dt.message], 'success')
      refetchGetData()
    }
    else{
      showToaster(['Something went wrong! please try again'], 'error')
    }
  };


  const { data, refetch } = useQuery({
    queryKey: ["svQryAnnlcbwtf1", state.mainId, state.rndm],
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

  const GetSvData = (month:string) => {
    let who:string = getStateAbbreviation(capitalize(getWho()));
    if(month){
        let payload:any = postLinux('STT=' + who + "=" + month + "=stt_authorizationDetails", 'getAuthorizationDetails')
        return nrjAxiosRequestBio("stt_authorizationDetails", payload);
    }
    else{
        let payload:any = postLinux('STT=' + who + "=stt_listAuthorizationDetails", 'listAuthorizationDetails');
        clrFunct();
        return nrjAxiosRequestBio("stt_listAuthorizationDetails", payload);
    }
  };

  const ShowData = (dataSvd: any) => {
    let dt: any = GetResponseLnx(dataSvd);
    if (Array.isArray(dt.data) && dt.data.length) {
      dispatch({ type: ACTIONS.NEWROWDATA, payload: dt });
    }
  };

  const { data: dataSvd, refetch: refetchGetData } = useQuery({
    queryKey: ["svOldannlauth1", month],
    queryFn: ()=>GetSvData(month),
    enabled: true,
    staleTime: 0,
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
      <div className="shadow rounded-lg">
        <div>
          <div className="mx-7">
            <Seperator heading="Select Month"></Seperator>
            <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">

              <div className='w-9/12'>
                <NrjRsDt
                  format="MM-yyyy"
                  fldName="dt_mnth"
                  displayFormat="1"
                  idText="txtdt_mnth"
                  size="lg"
                  Label="Select Month"
                  selectedValue={state.frmData}
                  onChange={onChangeDts}
                  speaker={"Enter Date"}
                ></NrjRsDt>
              </div>
            </div>
          </div>
          <Seperator heading=""></Seperator>
          <div className="grid md:grid-cols-1 mt-3 lg:grid-cols-2 ">

            <div className="mb-1">
              <WtrInput
                Label='Total no of HCF applied for authorization'
                fldName='ttlapp'
                idText='txtttlapp'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter total no of HCF applied for authorization'}
                delayClose={1000}
                placement='right'
                ToolTip="Enter whole numbers only"

                ClssName='' ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label="Total no. of HCF's granted authorization"
                fldName='ttlgrt'
                idText='txtttlgrt'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn='1[length]'
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                speaker={'Enter Total Number Authorized'}
                delayClose={1000}
                placement='bottom'
                ClssName=''
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>

            <div className="mb-1">
              <WtrInput
                Label="Total no. of HCFs in operation without Authorization"
                speaker="Total no. of HCFs in operation without Authorization"
                fldName='ttlwth'
                idText='txtttlwth'
                onChange={onChangeDts}
                dsabld={false}
                callFnFocus=''
                dsbKey={false}
                upprCase={false}
                validateFn=''
                allowNumber={true}
                selectedValue={state.frmData}
                clrFnct={state.trigger}
                ToolTip="Enter whole numbers only"
              ></WtrInput>
            </div>

            

          </div>
        </div>


        {showMessage && showMessage.message.length != 0 ? <div className="py-2">
          <Toaster data={showMessage} className={''}></Toaster>
        </div> : <></>}
        <div className="flex justify-center py-7">
          <div className="mr-4">
            <Button
              size="medium"
              style={{ backgroundColor: "#3B71CA", textTransform: "none" }}
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
}; export default React.memo(Stt_AuthorizationDetails);

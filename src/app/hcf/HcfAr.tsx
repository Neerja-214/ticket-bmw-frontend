import React, { useEffect, useReducer, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetFldName, GetResponseWnds, convertFldValuesToJson, convertFldValuesToString, createGetApi, dataStr_ToArray, getCmpId, getUsrId, postLinux, postLnxSrvr, svLnxSrvr, tellWndsServer, tellWndsServer2 } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";

import { nrjAxiosRequest, nrjAxiosRequestBio, useNrjAxios } from '../../Hooks/useNrjAxios';
import { Navigate, useNavigate } from "react-router-dom";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import WtrInput from '../../components/reusable/nw/WtrInput';
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect';
import { validForm } from '../../Hooks/validForm';
import { Toaster } from '../../components/reusable/Toaster';
import NrjRsDt from '../../components/reusable/NrjRsDt';
import SaveIcon from "@mui/icons-material/Save";
import NrjAgGrid from '../../components/reusable/NrjAgGrid';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import moment from 'moment';
import HcfHeader from './HcfHeader';
import { useToaster } from '../../components/reusable/ToasterContext';

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
  NEWFRMDATA: "frmdatanw",
  DISABLE: 'disable'
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
};

type act = {
  type: string;
  payload: any;
};

const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.NEWFRMDATA:
      newstate.textDts = action.payload;
      return newstate;
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
      if (action.payload === 1) {
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
      }
  }
};


const HCFAr = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mainId, setMainId] = useState('')
  const [showMessage, setShowMessage] = useState<any>({ message: [] })

  const reqFlds = [
    { fld: 'dt_wst', msg: 'Enter Date', chck: 'length' },
    { fld: 'redwt', msg: 'Enter Red Weight', chck: 'length' },
    { fld: 'ylwwt', msg: 'Enter Yellow Weight', chck: 'length' },
    { fld: 'whtwt', msg: 'Enter WhiteWeight', chck: 'length' },
    { fld: 'bluwt', msg: 'Enter Blue Weight', chck: 'length' },
    { fld: 'cytwt', msg: 'Enter Cytotoxic Weight', chck: 'length' },
    { fld: 'redcnt', msg: 'Enter Red Count', chck: 'length' },
    { fld: 'ylwcnt', msg: 'Enter Yellow Count', chck: 'length' },
    { fld: 'whtcnt', msg: 'Enter White Count', chck: 'length' },
    { fld: 'blucnt', msg: 'Enter Blue Count', chck: 'length' },
    { fld: 'cytcnt', msg: 'Enter Cytotoxic Count', chck: 'length' }

  ];

  const coldef = [
    { field: 'id', hide: true, width: 0, headerName: '' },
    { field: 'dt_wst', hide: true, width: 180, headerName: 'Month' },
    { field: 'dt_str', hide: false, width: 180, headerName: 'Month' },
    {
      headerName: 'Red',
      children: [
        { field: 'redcnt', hide: false, width: 90, headerName: 'Bag', cellStyle: { color: 'black', 'background-color': '#ffcccb' } },
        { field: 'redwt', hide: false, width: 100, headerName: 'Kg/gms', cellStyle: { color: 'black', 'background-color': '#ffcccb' } },
      ],
    },
    {
      headerName: 'Yellow',
      children: [
        { field: 'ylwcnt', hide: false, width: 90, headerName: 'Bag', cellStyle: { color: 'black', 'background-color': '#FDFD97' } },
        { field: 'ylwwt', hide: false, width: 120, headerName: 'Kg/gms', cellStyle: { color: 'black', 'background-color': '#FDFD97' } }
      ],
    },
    {
      headerName: 'White',
      children: [
        { field: 'whtcnt', hide: false, width: 90, headerName: 'Bag' },
        { field: 'whtwt', hide: false, width: 120, headerName: 'Kg/gms' }
      ],
    },
    {
      headerName: 'Blue',
      children: [
        { field: 'blucnt', hide: false, width: 90, headerName: 'Bag', cellStyle: { color: 'black', 'background-color': '#ADD8E6' } },
        { field: 'bluwt', hide: false, width: 120, headerName: 'Kg/gms', cellStyle: { color: 'black', 'background-color': '#ADD8E6' } }
      ],
    },
    {
      headerName: 'Cytotoxic',
      children: [
        { field: 'cytcnt', hide: false, width: 90, headerName: 'Bag', cellStyle: { color: 'black', 'background-color': '#FDFD97' } },
        { field: 'cytwt', hide: false, width: 120, headerName: 'Kg/gms', cellStyle: { color: 'black', 'background-color': '#FDFD97' } }
      ],
    },
    {
      headerName: 'Total',
      children: [
        { field: 'totalcnt', hide: false, width: 70, headerName: 'Bag' },
        { field: 'toatlwt', hide: false, width: 120, headerName: 'Kg/gms' }
      ],
    },
  ];




  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  }

  const onRowSelected = (action: any, rw: any) => {
    setEditMainId(rw.id)
    let textDts = convertFldValuesToString(rw);
    dispatch({ type: ACTIONS.SETFORM_DATA, payload: textDts });
  }
  const getGid = () => {
    let g: any = utilities(3, "", "");
    //dispatch({ type: ACTIONS.SETGID, payload: g });
    return g;
  };

  const onChangeDts = (data: string) => {
    if (GetFldName(data) == 'dt_wst') {
      setEditMainId("");
      // dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
      // setTimeout(() => {
      //   dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
      //   dispatch({ type: ACTIONS.FORM_DATA, payload: data });
      // }, 300);

      dispatch({ type: ACTIONS.FORM_DATA, payload: data });
      refetchB();

    }
    else {
      dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    }
  };
  const { showToaster, hideToaster } = useToaster();
  const HandleSaveClick = () => {
    let api: string = state.textDts;
    let gd: string = getGid();
    // setGid(gd);
    let reptyp = 'Monthly';
    let usrnm = localStorage.getItem('hcfUserName');
    let dt_wst = getFldValue(state.textDts, 'dt_wst');
    let redwt = getFldValue(state.textDts, 'redwt') ? getFldValue(state.textDts, 'redwt') : 0;
    let ylwwt = getFldValue(state.textDts, 'ylwwt') ? getFldValue(state.textDts, 'ylwwt') : 0;
    let whtwt = getFldValue(state.textDts, 'whtwt') ? getFldValue(state.textDts, 'whtwt') : 0;
    let bluwt = getFldValue(state.textDts, 'bluwt') ? getFldValue(state.textDts, 'bluwt') : 0;
    let cytwt = getFldValue(state.textDts, 'cytwt') ? getFldValue(state.textDts, 'cytwt') : 0;
    let redcnt = getFldValue(state.textDts, 'redcnt') ? getFldValue(state.textDts, 'redcnt') : 0;
    let ylwcnt = getFldValue(state.textDts, 'ylwcnt') ? getFldValue(state.textDts, 'ylwcnt') : 0;
    let whtcnt = getFldValue(state.textDts, 'whtcnt') ? getFldValue(state.textDts, 'whtcnt') : 0;
    let blucnt = getFldValue(state.textDts, 'blucnt') ? getFldValue(state.textDts, 'blucnt') : 0;
    let cytcnt = getFldValue(state.textDts, 'cytcnt') ? getFldValue(state.textDts, 'cytcnt') : 0;
    let totalWtNumber = Number(redwt) + Number(ylwwt) + Number(whtwt) + Number(bluwt) + Number(cytwt);
    let toatlwt = totalWtNumber.toString()
    let totalcntNumber = Number(redcnt) + Number(ylwcnt) + Number(whtcnt) + Number(blucnt) + Number(cytcnt);
    let totalcnt = totalcntNumber.toString()
    if (redwt === "0" && ylwwt === "0" && whtwt === "0" && bluwt === "0" && cytwt === "0" &&
      redcnt === "0" && ylwcnt === "0" && whtcnt === "0" && blucnt === "0" && cytcnt === "0") {
      showToaster( ['All values cannot be zero. Please enter valid numbers.'], 'error');

    } else {
      let payload: any = postLinux(reptyp + "=" + usrnm + "=" + dt_wst + "=" + redwt + "=" + ylwwt + "=" + whtwt + "=" + bluwt + "=" + cytwt + "=" + toatlwt + "=" + redcnt + "=" + ylwcnt + "=" + whtcnt + "=" + blucnt + "=" + cytcnt + "=" + totalcnt, 'hcf_report');
      return nrjAxiosRequestBio("hcf_report", payload);
    }
  };

  const svdQry = (data: any) => {
    
    if (data.data.status == "Success") {
      refetchW();
    } else {
      setTimeout(() => {
        showToaster( [data.data.message], 'error');
      }, 3000)
    }
  }

  const [editMainId, setEditMainId] = useState<string>("")

  const saveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    showToaster( msg, 'error');
    let today = new Date()
    let dateStr: string = moment(today).format("DD-MMM-yyyy");
    let todayDate = UseMomentDateNmb(dateStr)
    let dt_wst = getFldValue(state.textDts, 'dt_wst');
    let NewDate = UseMomentDateNmb(dt_wst)
    if (NewDate > todayDate) {
      showToaster( ["Invalid date,you can only select dates up to today's date!!"], 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    if (msg && msg[0]) {
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }

    let dateData = getFldValue(state.textDts, 'dt_wst');
    let month = new Date(dateData)
    let found: boolean = false;
    rowData.forEach((res: any) => {
      let m = new Date(res.dt_wst);
      if (month.getMonth() == m.getMonth()) {
        found = true;
      }
    })
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    if (found && !editMainId) {
      showToaster( ['Please select another month. You already filled data for this month!'], 'error')
    }
    else {
      refetch();
    }

  }

  const { data, refetch } = useQuery({
    queryKey: ['HCFAr', state.textDts, editMainId],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,


  })

  const GetData = () => {
    let usrnm = localStorage.getItem('hcfUserName');;
    let fyyear = "2024-2025"
    let payload: any = postLinux(usrnm + "=" + fyyear, 'show_monthly_rep');
    return nrjAxiosRequestBio("show_monthly_rep", payload);
  };

  useEffect(() => {
    refetchB();
  }, [])

  const [rowData, setRowData] = useState<any[]>([])
  const ShowData = (data: any) => {
    if (data && data.data && Array.isArray(data.data) && data.data.length) {
      // let dt: any = GetResponseWnds(data.data);
      // if (dt) {
      //   dt = dataStr_ToArray(dt);
      //   if (Array.isArray(dt) && dt.length) {
      //     setRowData(dt);
      //   }
      // }

      let ary = data.data.map((res: any) => {
        return {
          ...res, dt_str: res.rep_mnthno
        }
      })
      // dispatch({type:ACTIONS.NEWROWDATA, payload : ary});
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
      setTimeout(function () {
        dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      }, 800);
    }
  };
  const { data: datab, refetch: refetchB } = useQuery({
    queryKey: ["getQry", state.mainId],
    queryFn: GetData,
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

  const Wnd = () => {
    let g: string = mainId;
    let api: string = tellWndsServer2(g);
    return useNrjAxios({ apiCall: api });
  };

  const svd = (dataW: any) => {
    
    let dt: string = GetResponseWnds(dataW);
    dt = getFldValue(dt, "id");
    if (Number(dt) > -1) {
      showToaster( ["Data Saved Successfully"],
        'success')

    }
    // let ary: any = dataStr_ToArray(state.textDts);
    // dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    }, 300);

    dispatch({ type: ACTIONS.MAINID, payload: 0 });
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  };
  const { data: dataW, refetch: refetchW } = useQuery({
    queryKey: ["svWnd", state.mainId, state.rndm],
    queryFn: Wnd,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svd,
  });

  const navigate = useNavigate();

  const navigateBack = () => {
    navigate('/hcfDetails');
  }

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login")
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
    <>
        <div className='overflow-y-auto h-screen bg-white'>

      <HcfHeader></HcfHeader>
      <div className='px-3 pb-10 '>
      {showMessage && showMessage.message.length != 0 ? <div className=" py-2">
            <Toaster data={showMessage} className={''}></Toaster>
          </div> : <></>}
        {/* <div className='flex py-4 justify-end'>
        <Button
          size="medium"
          style={{ backgroundColor: "#86c6d9" }}
          variant="contained"
          color="success"
          disabled={false}
          onClick={logout}>
          Logout
        </Button>
      </div> */}
        {/* <div className="rounded" style={{ boxShadow: '0px 0px 20px 0px #00000029' }}>
        <div className="p-7 rounded text-black" style={{ background: 'linear-gradient(90.29deg, #86c6d9 0%, #aed6e0 100%)' }}>
          <div className="text-2xl font-bold">Health Care Facility: Annual Report</div>
          <div className="">please provide the requested information below</div>
        </div> */}
        <div className="mx-7">
          <Seperator heading="Select Month"></Seperator>
          <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
            <div className='mb'>
              <NrjRsDt
                format="MM-yyyy"
                fldName="dt_wst"
                displayFormat="1"
                idText="txtdt_wst"
                size="lg"
                Label="Date of Waste"
                selectedValue={state.frmData}
                onChange={onChangeDts}
                speaker={"Enter Date"}
              ></NrjRsDt>
            </div>


          </div>

          <Seperator heading="Waste Bag Details"></Seperator>

          <div className=" mt-4 grid grid-cols-4 gap-x-8 gap-y-4">
            <WtrInput displayFormat='1' Label='Red Weight' fldName='redwt' allowDecimal={true} allowNumber={true} idText='txtredwt' onChange={onChangeDts} dsabld={false} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput>
            <WtrInput displayFormat='1' Label='Red Count' fldName='redcnt' allowNumber={true} idText='txtredcnt' onChange={onChangeDts} dsabld={false} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput>
            <WtrInput displayFormat='1' Label='Yellow Weight' fldName='ylwwt' idText='txtylwwt' allowDecimal={true} onChange={onChangeDts} dsabld={false} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={true} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput>
            <WtrInput displayFormat='1' Label='Yellow Count' fldName='ylwcnt' idText='txtylwcnt' onChange={onChangeDts} dsabld={false} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={true} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput>
            <WtrInput displayFormat='1' Label='White Weight' fldName='whtwt' idText='txtwhtwt' allowDecimal={true} onChange={onChangeDts} dsabld={false} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={true} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput>
            <WtrInput displayFormat='1' Label='White Count' fldName='whtcnt' idText='txtwhtcnt' onChange={onChangeDts} dsabld={false} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={true} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput>
            <WtrInput displayFormat='1' Label='Blue Weight' fldName='bluwt' idText='txtbluwt' allowDecimal={true} onChange={onChangeDts} dsabld={false} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={true} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput>
            <WtrInput displayFormat='1' Label='Blue Count' fldName='blucnt' idText='txtblucnt' onChange={onChangeDts} dsabld={false} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={true} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput>
            <WtrInput displayFormat='1' Label='Cytotoxic Weight' fldName='cytwt' idText='txtcytwt' allowDecimal={true} onChange={onChangeDts} dsabld={false} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={true} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput>
            <WtrInput displayFormat='1' Label='Cytotoxic Count' fldName='cytcnt' idText='txtcytcnt' onChange={onChangeDts} dsabld={false} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={true} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput>
          </div>

          {/* <Seperator heading="Additional Detail"></Seperator> */}


          
          <div className="flex mt-7 pt-7">


            <div className="mr-4 pb-5">
              <Button
                size="medium"
                style={{ backgroundColor: "#86c6d9", textTransform: "none" }}
                variant="contained"
                color="success"
                disabled={false}
                startIcon={<SaveIcon />}
                onClick={saveClick}>
                Submit
              </Button>
            </div>
            {/* <div className="mr-4 pb-5">
            <Button
              size="medium"
              variant="outlined"
              color="primary"
              disabled={false}
              onClick={navigateBack}>
              Go Back
            </Button>
          </div> */}


          </div>

          <div className='my-5 py-2'>
            <NrjAgGrid
              onGridLoaded={() => { }}
              onRowSelected={() => { }}
              colDef={coldef}
              apiCall={""}
              rowData={rowData}
              onButtonClicked={onRowSelected}
              showPagination={true}
              showFldNm={'cbtwf'}
              className='ag-theme-alpine'
              trigger={state.triggerG}
              newRowData={state.nwRow}
            ></NrjAgGrid>
          </div>
        </div>
        {/* </div> */}
      </div>
      </div>
    </>
  );
};
export default React.memo(HCFAr);
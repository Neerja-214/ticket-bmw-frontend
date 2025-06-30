import React, { useEffect, useReducer, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetFldName, GetResponseWnds, convertFldValuesToJson, convertFldValuesToString, createGetApi, dataStr_ToArray, getCmpId, getUsrId, postLinux, postLnxSrvr, svLnxSrvr, tellWndsServer, tellWndsServer2, trimField } from '../../utilities/utilities'
import { nrjAxiosRequest, nrjAxiosRequestBio, nrjAxiosRequestLinux, useNrjAxios } from '../../Hooks/useNrjAxios';
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import { Toaster } from '../../components/reusable/Toaster';
import NrjAgGrid from '../../components/reusable/NrjAgGrid';
import { getLvl } from '../../utilities/cpcb';
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
  DISABLE: 'disable',
  UPDATEVALUE: "updvl",
  NEWVALUE: "nwvl",

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
    case ACTIONS.UPDATEVALUE:
      newstate.rw = action.payload;
      return newstate;
    case ACTIONS.NEWVALUE:
      newstate.frmData = action.payload;
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


const HcfUnblockUser = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mainId, setMainId] = useState('')
  const [showMessage, setShowMessage] = useState<any>({ message: [] })
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading , setIsLoading] = useState("")

  const coldef = [
    { field: 'id', hide: true, width: 0, headerName: '' },
    { field: 'usrnm', hide: false, width: 200, headerName: 'User name' },
    //{ field: 'lckd', hide: false, width: 180, headerName: 'Locked' },
    { field: 'dt_lckd', hide: false, width: 200, headerName: 'Date locked' },
    //{ field: 'tm_zzz', hide: false, width: 200, headerName: 'Time Locked' },
    { field: 'unlckby', hide: false, width: 210, headerName: 'Unlocked by' },
    { field: 'dt_unlckd', hide: false, width: 210, headerName: 'Date unlocked' },
    { field: 'tm_unlckd', hide: false, width: 210, headerName: 'Time unlocked' },
  ];

  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  }

  const onRowSelected = (action: any, rw: any) => {
    
    let textDts = convertFldValuesToString(rw);
    dispatch({ type: ACTIONS.SETFORM_DATA, payload: textDts });
    if(action === 'Unblock User'){
      setUserName(rw.usrnm);
      setUserId(rw.id);
      setTimeout(function () {
        refetchU();
      }, 500);
    }
  }

  const OnCellEdited = (
    fld: string,
    rowdata: any,
    oldValue: string,
    newValue: string
  ) => {
    if (newValue) {
      
      // fldN = fld
      dispatch({ type: ACTIONS.UPDATEVALUE, payload: rowdata });
      dispatch({ type: ACTIONS.NEWVALUE, payload: newValue });
      setTimeout(function () {
        // refetch();
      }, 500);
    }
  };

  const getGid = () => {
    let g: any = utilities(3, "", "");
    //dispatch({ type: ACTIONS.SETGID, payload: g });
    return g;
  };

  const onChangeDts = (data: string) => {
    if (GetFldName(data) == 'dt_wst') {
      dispatch({ type: ACTIONS.FORM_DATA, payload: data });
      refetchB();
    }
    else {
      dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    }
  };


  const GetData = () => {
    setIsLoading("Loading data...")
    let datafr = 'stc1087';
    let del = 0;
    let fltr = 1;
    let usrid = getCmpId();
    let cmpid = getCmpId();
    let payload: any = postLinux(datafr + '=' + del + '=' + fltr + '=' + cmpid + '=' + usrid, 'getCmnRs');
    return nrjAxiosRequestBio("getCmnRs", payload);
  };
  const { showToaster, hideToaster } = useToaster();

  useEffect(() => {
    refetchB();
  }, [])

  const [rowData, setRowData] = useState<any[]>([ ])
  const ShowData = (data: any) => {
    setIsLoading("")
    
    if (data && data.data && Array.isArray(data.data) && data.data.length) {
      let ary = [...data.data]
      // dispatch({type:ACTIONS.NEWROWDATA, payload : ary});
      ary=trimField(ary,"usrnm")
      ary = [...ary].sort((a, b) => a.usrnm.localeCompare(b.usrnm))
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
      setTimeout(function () {
        dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      }, 800);
    }else{
  showToaster(["No data received"], "error");
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

  const UnblockUser = () => {
    setIsLoading("please wait...")
    let what  = 'unBlockUser';
    let id = userId
    let usrname  = userName
    let usr = getLvl();
    let usrid = getCmpId();
    let cmpid = getCmpId();
    let payload: any = postLinux(what + '=' + id + '=' + usrname + '=' + usr + '=' + cmpid + '=' + usrid, 'saverecord');
    return nrjAxiosRequestBio("saverecord", payload);
  }

  const RemoveUser = (data: any) => {
    refetchB()
    setIsLoading("");
    if(data == "1"){
      showToaster(["User ublocked successfully"] , 'success')
    }
    else{
      showToaster(["Something went wrong!"] , 'error')
    }
  }
  const { data: data, refetch: refetchU } = useQuery({
    queryKey: ["getQryU", state.mainId],
    queryFn: UnblockUser,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: RemoveUser,
  });
  

  return (
    <>
      
      <div className=''>
          <div className=" font-semibold text-lg mb-8 mx-11">{isLoading}</div>
        <div className="">
          <div className='my-5 py-2 lg:px-4'>
            <NrjAgGrid
              onGridLoaded={() => { }}
              onRowSelected={() => { }}
              colDef={coldef}
              apiCall={""}
              rowData={rowData}
              onCellEdited={OnCellEdited}
              onButtonClicked={onRowSelected}
              showPagination={true}
              showFldNm={'cbtwf'}
              className='ag-theme-alpine'
              trigger={state.triggerG}
              newRowData={state.nwRow}
              showDataButton={"Unblock user"}
            ></NrjAgGrid>
          </div>
        </div>
      </div>
    </>
  );
};
export default React.memo(HcfUnblockUser);
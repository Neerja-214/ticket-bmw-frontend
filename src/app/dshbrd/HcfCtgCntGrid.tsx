import React, { useEffect, useReducer, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, capitalize, createGetApi, dataStr_ToArray, getApplicationVersion, getStateAbbreviation, getStateFullFormWho, postLinux, svLnxSrvr, trimField } from '../../utilities/utilities'

import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { nrjAxiosRequest, nrjAxiosRequestBio, useNrjAxios } from '../../Hooks/useNrjAxios';
import { useGetFldValue } from "../../Hooks/useGetFldValue";
import HdrDrp from "../HdrDrp";
import { Toaster } from "../../components/reusable/Toaster";
import { getLvl, getWho } from '../../utilities/cpcb'
import moment from 'moment'
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry'
import { useToaster } from '../../components/reusable/ToasterContext'
import LevelSelector from './LevelSelector'

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
  DISABLE: "disable"

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
  gid: string;
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

//const [state, dispatch] = useReducer(reducer, initialState);





const HcfCtgCntGrid = () => {
  
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const [isLoading , setIsLoading] = useState("");
  const [total, setTotal] = useState(0);


  const coldef = [
    { colId: "id", field: "id", hide: true, width: 150, headerName: "", resizable: true },
    { colId: "fld1", field: "fld1", hide: false, width: 350, headerName: "Category", resizable: true },
    { colId: "cnt1", field: "cnt1", hide: false, width: 230, headerName: "Count", resizable: true },
    { colId: "sr1", field: "sr1", hide: false, width: 100, headerName: "Sr. No.", resizable: true },
    { colId: "fld2", field: "fld2", hide: false, width: 350, headerName: "Category", resizable: true },
    { colId: "cnt2", field: "cnt2", hide: false, width: 230, headerName: "Count", resizable: true },
  ];

  const colDefPdf =[
    { field: "fld1", hide: false, width: 400, headerName: "Category" },
    { field: "cnt1", hide: false, width: 240, headerName: "Count" },
    { field: "fld2", hide: false, width: 400, headerName: "Category" },
    { field: "cnt2", hide: false, width: 240, headerName: "Count" },
  ]

  const pdfColWidth = ['30%','15%' , '30%',  '15%',]

  



  const excelColWidth = [{wch: 30},{wch: 30},{wch: 30}, {wch: 20}]

  const printExcelHeader = ["Category", "Count", "Category", "Count",]
  const keyOrder: string[] = ['fld1', 'cnt1', 'fld2', 'cnt2']

  



  const { showToaster, hideToaster } = useToaster();

  const onRowSelected = (data: string) => {
    // alert(data)
  }

  const GridLoaded = () => {
  }
  const onButtonClicked = (action: string, rw: any) => {

  }

  const getPrependContentValue = (levelValue: string) => {
    return [
      [
        {
          data: {
            value: 'HCF category count',
            type: "String",
          },
          mergeAcross: 3
        },
      ],
      [
        {
          data: {
            value: levelValue,
            type: "String",
          },
          mergeAcross: 5
        },
      ],
      [
        {
          data: {
            value: 'Date: ' + moment(Date.now()).format("DD-MMM-yyyy"),
            type: "String",
          },
          mergeAcross: 5
        },
      ],
      [],
    ];
  }






  function populateGrid(data: any) {
    setIsLoading("")
    dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    let dt: any = GetResponseLnx(data);
    let ary: any = [];
    if(dt && dt.BH){
      ary = dt;
      ary = [
        {
          fld1: "Bedded Hospital",
          cnt1: Number(ary.BH),
          fld2: "Clinic",
          cnt2: Number(ary.CL),
        }, {
          fld1: "Pathology Laboratory",
          cnt1: Number(ary.PL),
          fld2: "Nursing Home",
          cnt2: Number(ary.NH),
        }, {
          fld1: "Blood Bank",
          cnt1: Number(ary.BB),
          fld2: "Dispensary",
          cnt2: Number(ary.DI),
        }, {
          fld1: "Animal House",
          cnt1: Number(ary.AH),
          fld2: "Veterinary Hospital",
          cnt2: Number(ary.VH),
        },
        {
          fld1: "Dental Hospital",
          cnt1: Number(ary.DH),
          fld2: "Institutions / Schools / Companies etc With first Aid Facilitites",
          cnt2: Number(ary.FA),
        }, {
          fld1: "Health Camp",
          cnt1: Number(ary.HC),
          fld2: "Homeopathy",
          cnt2: Number(ary.HO),
        }, {
          fld1: "Mobile Hospital",
          cnt1: Number(ary.MH),
          fld2: "Siddha",
          cnt2: Number(ary.SI),
        }, {
          fld1: "Unani",
          cnt1: Number(ary.UN),
          fld2: "Yoga",
          cnt2: Number(ary.YO),
        },
      ];
    } else if(dt && Array.isArray(dt) && dt.length && dt[0].BH){
      ary = dt[0];
      ary = [
        {
          fld1: "Bedded Hospital",
          cnt1: Number(ary.BH),
          fld2: "Clinic",
          cnt2: Number(ary.CL),
        }, {
          fld1: "Pathology Laboratory",
          cnt1: Number(ary.PL),
          fld2: "Nursing Home",
          cnt2: Number(ary.NH),
        }, {
          fld1: "Blood Bank",
          cnt1: Number(ary.BB),
          fld2: "Dispensary",
          cnt2: Number(ary.DI),
        }, {
          fld1: "Animal House",
          cnt1: Number(ary.AH),
          fld2: "Veterinary Hospital",
          cnt2: Number(ary.VH),
        },
        {
          fld1: "Dental Hospital",
          cnt1: Number(ary.DH),
          fld2: "Institutions / Schools / Companies etc With first Aid Facilitites",
          cnt2: Number(ary.FA),
        }, {
          fld1: "Health Camp",
          cnt1: Number(ary.HC),
          fld2: "Homeopathy",
          cnt2: Number(ary.HO),
        }, {
          fld1: "Mobile Hospital",
          cnt1: Number(ary.MH),
          fld2: "Siddha",
          cnt2: Number(ary.SI),
        }, {
          fld1: "Unani",
          cnt1: Number(ary.UN),
          fld2: "Yoga",
          cnt2: Number(ary.YO),
        },
      ];
    } else{
    showToaster(["No data received"], "error");
      }
    
    ary = trimField(ary, "fld1")
    ary=trimField(ary,"fld2")
    ary = ary.sort((a: any, b: any) => a.fld1.localeCompare(b.fld1));
    ary = ary.sort((a:any, b:any) => a.fld2.localeCompare(b.fld2));

    let arlength: number = ary.length;

    for (let i = 0; i < ary.length; i++){
      arlength =arlength+1
      ary[i]['sr1'] = arlength
    }
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
    setTimeout(function () {
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    }, 800);

  }

  const GetCbwtfWstList = () => {
    setIsLoading("Loading data...")
    setTotal(0);
    let gid: any = utilities(3, "", "");
    let gd: string = gid;
    dispatch({ type: ACTIONS.SETGID, payload: gd });
    // let api: string = createGetApi(
    //   "db=nodb|dll=xrydll|fnct=a185",
    //   levelWhoData.lvl + "=" + levelWhoData.who + "=" + gd
    // );
    // return nrjAxios({ apiCall: api });
    const payload: any = postLinux(levelWhoData.lvl + '=' + levelWhoData.who + '='+ gd,'hcfctgcnt');  
    return nrjAxiosRequestBio("show_hcfCtgCntFile", payload);
  };

  const { data: data2, refetch: refetchG } = useQuery({
    queryKey: ["getQryWrongCbwtf"],
    queryFn: GetCbwtfWstList,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  });

  const [levelWhoData, setLevelWhoData] = useState({ lvl: "CPCB", who: "CENTRAL" });

  const [prependContent, setPrependContent] = useState<any[]>([])

  const cellClassRulesValues = [
    {
      cellName: 'fld1',
      color: 'red-row',
      colorEntireRow: false
    },
    {
      cellName: 'fld2',
      color: 'red-row',
      colorEntireRow: false
    },
  ]



  const setLvlWhoData = (data: any) => {
    setLevelWhoData({ lvl: data.lvl, who: data.who })
    let levelValue = 'Level: '
    if (data.lvl == "RGD") {
      levelValue += data.who + " " + "REGIONAL DIRECTORATE"
    }
    else if (data.lvl == 'STT') {
      levelValue += "SPCB" + " " + getStateFullFormWho(data.who)
    }
    else if (data.lvl == 'CBWTF') {
      levelValue += 'CBWTF : ' + data.name
    }
    else {
      levelValue += 'CPCB'
    }
    let a = getPrependContentValue(levelValue);
    console.log(a)
    setPrependContent(a)



    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 })
    })
  }

  const getClick = () => {
    refetchG()
  }




  return (
    <>
      <LevelSelector
        showCbwtf={false}
        levelSelectorData={setLvlWhoData}
        getListButton={true}
        getListOnclick={getClick}
      ></LevelSelector>

      <div className="flex justify-center bg-gray-100">
        <div className="font-semibold text-lg ">{isLoading}</div>
        {showMessage && showMessage.message.length != 0 ? <div className="py-2">
          <Toaster data={showMessage} className={''}></Toaster>
        </div> : <></>}
        {total ? <div className="border rounded-lg mb-2">
          <div className="p-3">
            <div className="flex font-semibold">
              Total Health Care Units : {total}
            </div>
          </div>
        </div> : <></>}

        <NrjAgGrid
          onGridLoaded={GridLoaded}
          onRowSelected={onRowSelected}
          colDef={coldef}
          apiCall={""}
          rowData={[]}
          deleteButton={""}
          deleteFldNm={""}
          showDataButton={''}
          onButtonClicked={onButtonClicked}
          showFldNm={'cbtwf'}
          className='ag-theme-alpine-blue ag-theme-alpine'
          trigger={state.triggerG}
          showPagination={true}
          newRowData={state.nwRow}
          showExport={true}
          prependContent={[]}
          KeyOrder={keyOrder}
          lvl={getLvl()}
          who={getWho()}
          pageTitle={"HCF Category Count (Report View)"}
          printExcelHeader={printExcelHeader}
          exceColWidth={excelColWidth}
          pdfColWidth={pdfColWidth}
          colDefPdf={colDefPdf}
          widthSerialNoCol={100}
          // cellClassRulesValues={cellClassRulesValues}
        ></NrjAgGrid>

      </div>

    </>

  );
}; export default React.memo(HcfCtgCntGrid);
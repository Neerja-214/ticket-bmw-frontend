import React, { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  capitalize,
  catFromAbbreviation,
  createGetApi,
  dataStr_ToArray,
  getApplicationVersion,
  getStateAbbreviation,
  postLinux,
  svLnxSrvr,
} from "../../utilities/utilities";
import { Button, SvgIcon } from "@mui/material";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import { nrjAxios, nrjAxiosRequestBio, useNrjAxios } from "../../Hooks/useNrjAxios";
import { Navigate, useNavigate } from "react-router-dom";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import HdrDrp from "../HdrDrp";
import { useEffectOnce } from "react-use";
import { validForm } from "../../Hooks/validForm";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { getLvl, getWho } from "../../utilities/cpcb";
import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";
import WtrInput from "../../components/reusable/nw/WtrInput";
import { Toaster } from "../../components/reusable/Toaster";
import { useToaster } from "../../components/reusable/ToasterContext";
import { button } from "@material-tailwind/react";

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
  DISABLE: "disable",
  SETHSPCOMBO: "setHspCombo",
  SETCITYCOMBO: "setCityCombo"
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
  cityCombo: "",
  hspCombo: "string"
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
  cityCombo: string,
  hspCombo: string
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
      if (newstate.disableA == 1) {
        newstate.disableA = 0
      } else {
        newstate.disableA = 1
      }
      return newstate;
    case ACTIONS.SETHSPCOMBO:
      newstate.hspCombo = action.payload;
      return newstate;
    case ACTIONS.SETCITYCOMBO:
      newstate.cityCombo = action.payload;
      return newstate;
  }
};

const CityHcfList = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] })
  const reqFlds: any[] = [
    { fld: 'cityid', msg: 'Select City', chck: '1[length]' },
  ];
  const [buttonDsb, setButtonDsb] = useState(true);
  const coldef = [
    { field: "id", hide: true, width: 0, headerName: "" },
    { field: "hcfnm", hide: false, width: 330, headerName: "Health care facility", tooltipField: 'hcfnm' },
    { field: "hcftyp", hide: false, width: 150, headerName: "HCF Type" },
    { field: "nobd", hide: false, width: 150, headerName: "No of Beds" },
    { field: "andrapp", hide: false, width: 150, headerName: "Android App" },
    { field: "bluscl", hide: false, width: 150, headerName: "Bluetooth Scale" },
    { field: "pnc", hide: false, width: 150, headerName: "Pin Code" },
    { field: "addra", hide: false, width: 200, headerName: "Address I", tooltipField: 'addra' },
    { field: "addrb", hide: false, width: 190, headerName: "Address II", tooltipField: 'addrb' },
    { field: "addrc", hide: false, width: 150, headerName: "Address III", tooltipField: 'addrc', },

    { field: "cntprsn", hide: false, width: 150, headerName: "Contact person" },
    { field: "mob", hide: false, width: 150, headerName: "Mobile Number" },
    { field: "stt", hide: false, width: 150, headerName: "State/UT" },
    { field: "rgd", hide: true, width: 150, headerName: "Regional directorate" },
    { field: "ppl", hide: true, width: 150, headerName: "" },
    { field: "rtu", hide: true, width: 150, headerName: "" },

  ];

  const colDefPdf = [
    { field: "hcfnm", hide: false, width: 250, headerName: "Health care facility", tooltipField: 'hcfnm' },
    { field: "hcftyp", hide: false, width: 120, headerName: "HCF Type" },
    { field: "nobd", hide: false, width: 120, headerName: "No of Beds" },
    { field: "andrapp", hide: false, width: 150, headerName: "Android App" },
    { field: "bluscl", hide: false, width: 150, headerName: "Bluetooth Scale" },
    { field: "pnc", hide: false, width: 120, headerName: "Pin Code" },
    { field: "addra", hide: false, width: 200, headerName: "Address I", tooltipField: 'addra' },
    { field: "addrb", hide: false, width: 190, headerName: "Address II", tooltipField: 'addrb' },
    { field: "addrc", hide: false, width: 150, headerName: "Address III", tooltipField: 'addrc', },

    { field: "cntprsn", hide: false, width: 150, headerName: "Contact person" },
    { field: "mob", hide: false, width: 150, headerName: "Mobile Number" },
    { field: "stt", hide: false, width: 150, headerName: "State/UT" },
  ]

  const pdfColWidth = ['10%', '8%', '5%', '5%', '8%', '8%', '10%', '8%', '8%', '8%', '5%', '8%']

  const printExcelHeader = ["HCF ", "HCF Type", "No of Beds", "Android App", "Bluetooth Scale", "Pin Code", "Address I", "Address II", "Address III", "Contact person", "Mobile Number", "State"]
  const KeyOrder: string[] = ['hcfnm', 'hcftyp', 'nobd', 'andrapp', 'bluscl', 'pnc', 'addra', 'addrb', 'addrc', 'cntprsn', 'mob', 'stt']
  const excelColWidth = [{ wch: 50 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }]

  

  const [inputData, setInputData] = useState({ city: "", cityValue: "" });

  useEffect(() => {
    if (inputData.cityValue !=="") {
      setButtonDsb(false)
    } else {
      setButtonDsb(true)
    }
  
  },[inputData.cityValue])

  const [countTillNow, setCountTillNow] = useState<number>(250);
  const GridLoaded = () => { };
  const navigate = useNavigate();
  const onRowSelected = (data: string) => {
  };
  const onButtonClicked = (action: string, rm: any) => { };

  const lvl: string = getLvl();
  let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();

  const onChangeDts = (data: string) => {
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };



  const onChangeCity: (data: string) => void = (data) => {
    let fldN: any = utilities(2, data, "");
    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    let dt = getFldValue(data, fldN);
    setInputData({ ...inputData, city: data, cityValue: dt });
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
    setTimeout(() => {
      dispatch({ type: ACTIONS.NEWROWDATA, payload: [] });

    }, 300)


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

  const { showToaster, hideToaster } = useToaster();

  const getClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    setCountTillNow(0);
    
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 })
      refetch();
    }, 300)

  }

  const [isLoading, setIsLoading] = useState("")

  const getData = (cityValue: string) => {
    setIsLoading('Loading data..')
    let gid = GetGid();
    dispatch({ type: ACTIONS.SETGID, payload: gid })
    let dt = state.textDts;
    let search = getFldValue(dt, 'srch');
    const city: string = cityValue.split("|")[1] ? cityValue.split("|")[1] : "";
    // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a226", city + '=' + search);
    // return nrjAxios({ apiCall: api })
    const payload: any = postLinux(city + '=' + search + '=0', 'srchctyhcf');
    return nrjAxiosRequestBio("srchctyhcf", payload);
  };


  function populateGrid(data: any) {
    setIsLoading('')
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
    let dt: any = GetResponseLnx(data);
    if (dt && Array.isArray(dt) && dt.length) {
      let ary: any[] = dt
      if (ary && Array.isArray(ary)) {
        ary = ary.map(((res: any) => {
          return {
            ...res,
            //mob: res.mob == "NA" ? "" : res.mob,
            andrapp: res.andrapp == "1" ? "Yes" : "No",
            bluscl: res.mob == "1" ? "Yes" : "No"
          }
        }))
        ary = [...ary].sort((a, b) => a.hcfnm.localeCompare(b.hcfnm))
        dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 1 });
        if (ary && ary.length == 300) {
          setCountTillNow(countTillNow + Number(ary.length));
          setTimeout(function () {
            refetchB();
          }, 400)
        }
      }


    }
  }

  const { data, refetch } = useQuery({
    queryKey: ['svQry', inputData.cityValue, state.rndm],
    queryFn: () => getData(inputData.cityValue),
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  })

  const GetDataSec = () => {
    let gid = GetGid();
    let api: string = createGetApi("db=nodb|dll=dummy|fnct=d2", `${gid}=${countTillNow}=250`);
    return nrjAxios({ apiCall: api });
  };

  const { data: dataB, refetch: refetchB } = useQuery({
    queryKey: ['nxtQry', state.rndm],
    queryFn: GetDataSec,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  })


  const PrntRep = () => {
    let gid: string = state.gid
    if (!gid) {
      showToaster(["populate the data in the grid"], 'error');
      return;
    }
    let api: string = createGetApi("db=nodb|dll=dummy|fnct=dummy", `${gid}=0`);
    return nrjAxios({ apiCall: api });
  };

  const ShowReprtt = (dataC: any) => {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    if (dataC && dataC.data && dataC.data[0] && dataC.data[0]["Data"]) {
      window.open(dataC.data[0]["Data"], "_blank")
    } else {
      showToaster(["Please try again after refreshing the page!"],
        'error')
    }
    dispatch({ type: ACTIONS.RANDOM, payload: 1 });
  }

  const { data: dataC, refetch: refetchC } = useQuery({
    queryKey: ['prntReports'],
    queryFn: PrntRep,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowReprtt,
  })


  function printClick() {
    dispatch({ type: ACTIONS.DISABLE, payload: 1 })
    refetchC()
  }

  const GetDataCity = () => {
    // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a245", 'CPCB=CENTRAL');
    // return nrjAxios({ apiCall: api })
    let payload: any = postLinux(getLvl() + '=' + getWho() + "=" + fltr, 'getcity');
    return nrjAxiosRequestBio('srchcty', payload);
  };

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
    queryKey: ["GetDataRgd", fltr],
    queryFn: GetDataCity,
    enabled: true,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: cityCombo,
  });

  return (
    <>
      <div className="bg-white p-1 pr-2 my-3 pb-4 rounded-lg" style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12)' }}>
        <div className="flex items-center justify-between">
          <div className="flex">
            <div className="mr-2">
              <WtrRsSelect
                Label="City"
                fldName="cityid"
                idText="txtcityid"
                onChange={onChangeCity}
                selectedValue={inputData.city}
                clrFnct={state.trigger}
                allwZero={"0"}
                fnctCall={false}
                dbCon={""}
                typr={""}
                loadOnDemand={state.cityCombo}
                onSearchDb={onSearchDb}
                dllName={""}
                fnctName={""}
                parms={lvl + '=' + who + '='}
                allwSrch={true}
                speaker="Select City"
              ></WtrRsSelect>
              {/* {(fltr && notFoundCityFltr) ? <small className="ml-3 text-red-500">No city found with '{fltr}'</small>:<></>} */}
            </div>

            <div>
              <WtrInput
                Label="Name"
                fldName="srch"
                idText="txtsrch"
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
                delayClose={1000}
                placement="right"
                ClssName=""
              ></WtrInput>
            </div>
            <div className="flex items-center mt-2">
            <div className=''>
              <Button
                size="medium"
                style={{
                  backgroundColor: !buttonDsb ? "#3490dc" : "#d3d3d3", // Gray for disabled
                  color: !buttonDsb ? "#fff" : "#a9a9a9", // Light gray text for disabled
                  cursor: !buttonDsb ? "pointer" : "not-allowed", // Show not-allowed cursor
                  textTransform: "none",
                }}
                variant="contained"
                color="success"
                disabled={buttonDsb}
                onClick={getClick}
              >
                Get list
              </Button>
            </div>
          </div>
          </div>
        
        </div>

        {showMessage && showMessage.message.length != 0 ? <div className="relative py-2">
          <Toaster data={showMessage} className={''}></Toaster>
        </div> : <></>}
       <div className=" font-semibold text-lg text-center ">{isLoading}</div>

        <div className="flex justify-centre mt-2 px-12">
          <NrjAgGrid
            onGridLoaded={GridLoaded}
            onRowSelected={onRowSelected}
            colDef={coldef}
            apiCall={""}
            newRowData={state.nwRow}
            trigger={state.triggerG}
            rowData={[]}
            deleteButton={""}
            deleteFldNm={""}
            showPagination={true}
            className="ag-theme-alpine-blue ag-theme-alpine"
            showExport={true}
            prependContent={[]}
            KeyOrder={KeyOrder}
            lvl={getLvl()}
            who={getWho()}
            pageTitle={"Search HCF city wise"}
            sortBy={'hcfnm'}
            printExcelHeader={printExcelHeader}
            exceColWidth={excelColWidth}
            pdfColWidth={pdfColWidth}
            colDefPdf={colDefPdf}
            widthSerialNoCol={100}
          ></NrjAgGrid>
        </div>
        {/* <div className="py-28">
          <div className="grid grid-cols-8 gap-4">
            {Object.entries(catFromAbbreviation).map(([abbreviation, fullForm]) => (
              <span key={abbreviation} className="flex flex-col items-center p-2 border rounded-md">
                <strong>{abbreviation} : </strong>
                <span>{fullForm}</span>
              </span>
            ))}
          </div>
        </div> */}
        
      </div>
      <h5 className="mt-10 px-10">Abbreviations:</h5>
            <div className=" grid grid-cols-4 px-10">

                <div> <span className="font-semibold"> BH : </span> <span> Bedded Hospital </span> </div>
                <div> <span className="font-semibold"> CL : </span> <span> Clinic </span> </div>
                <div> <span className="font-semibold"> PL : </span> <span> Pathology Laboratory </span> </div>
                <div> <span className="font-semibold"> NH : </span> <span> Nursing Home </span> </div>
                <div> <span className="font-semibold"> BB : </span> <span> Blood Bank </span> </div>
                <div> <span className="font-semibold"> DI : </span> <span> Dispensary </span> </div>
                <div> <span className="font-semibold"> AH : </span> <span> Animal House </span> </div>
                <div> <span className="font-semibold"> VH : </span> <span> Veterianry Hospital </span> </div>
                <div> <span className="font-semibold"> DH : </span> <span> Dental Hospital </span> </div>
                <div> <span className="font-semibold"> HC : </span> <span> Health Camp </span> </div>
                <div> <span className="font-semibold"> HO : </span> <span> Homeopathy </span> </div>
                <div> <span className="font-semibold"> MH : </span> <span> Mobile Hospital </span> </div>
                <div> <span className="font-semibold"> SI : </span> <span> Siddha </span> </div>
                <div> <span className="font-semibold"> UN : </span> <span> Unani </span> </div>
                <div> <span className="font-semibold"> YO : </span> <span> Yoga </span> </div>
                <div> <span className="font-semibold"> FA : </span> <span> Institutions / Schools / Companies etc With first Aid Facilitites </span> </div>

            </div>
    </>
  );
};
export default React.memo(CityHcfList);

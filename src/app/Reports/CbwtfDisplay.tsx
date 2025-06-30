import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Keyboard, Pagination, Navigation } from 'swiper/modules';
import { Button, CardActions, CardContent, Typography } from '@mui/material';
import CardHospitalDisplay from '../../components/reusable/CardHospitalDisplay';
import { useQuery } from '@tanstack/react-query';
import utilities, { createGetApi, dataStr_ToArray, getApiFromBiowaste } from '../../utilities/utilities';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { nrjAxios, nrjAxiosRequest } from '../../Hooks/useNrjAxios';
import CardCbwtfDisplay from '../../components/reusable/CardCbwtfDisplay';


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
    case ACTIONS.MAINID:
      newstate.mainId = action.payload;
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
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.CHECK_REQ:
      newstate.errMsg = action.payload;
      newstate.openDrwr = true;
      return newstate;
    case ACTIONS.CHECK_REQDONE:
      newstate.errMsg = "";
      newstate.openDrwr = false;
      return newstate;
    case ACTIONS.SETGID:
      newstate.gid = action.payload;
      return newstate;
  }
};

export default function CbwtfDisplay() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [data, setData] = useState([{
    "cbwtfnm": "cbwtf 15",
    "addra": "Line1",
    "addrb": "Line2",
    "addrc": "Line3",
    "cty": "DB city 11",
    "pnc": "488010",
    "dist": "Bhopal",
    "stt": "MP",
    "contprnm": "Manager",
    "phn": "6985231040",
    "mob": "1234569801",
    "eml": "test@gmail.com",
    "fctltt": "90.00000",
    "fctlgt": "75.803574",
    "novhcl": "5",
    "licnopb": "12ASF5563",
    "ip_address": "127.0.0.1",
    "state": "Madhya Pradesh",
    "cbwtfid": 221,
    "lic": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    "rgd": "BHOPAL",
    "regdtno": "45139"
  },
  {
    "cbwtfnm": "cbwtf 15",
    "addra": "Line1",
    "addrb": "Line2",
    "addrc": "Line3",
    "cty": "DB city 11",
    "pnc": "488010",
    "dist": "Bhopal",
    "stt": "MP",
    "contprnm": "Manager",
    "phn": "6985231040",
    "mob": "1234569801",
    "eml": "test@gmail.com",
    "fctltt": "90.00000",
    "fctlgt": "75.803574",
    "novhcl": "5",
    "licnopb": "12ASF5563",
    "ip_address": "127.0.0.1",
    "state": "Madhya Pradesh",
    "cbwtfid": 221,
    "lic": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    "rgd": "BHOPAL",
    "regdtno": "45139"
  },
  {
    "cbwtfnm": "cbwtf 15",
    "addra": "Line1",
    "addrb": "Line2",
    "addrc": "Line3",
    "cty": "DB city 11",
    "pnc": "488010",
    "dist": "Bhopal",
    "stt": "MP",
    "contprnm": "Manager",
    "phn": "6985231040",
    "mob": "1234569801",
    "eml": "test@gmail.com",
    "fctltt": "90.00000",
    "fctlgt": "75.803574",
    "novhcl": "5",
    "licnopb": "12ASF5563",
    "ip_address": "127.0.0.1",
    "state": "Madhya Pradesh",
    "cbwtfid": 221,
    "lic": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    "rgd": "BHOPAL",
    "regdtno": "45139"
  },
  {
    "cbwtfnm": "cbwtf 15",
    "addra": "Line1",
    "addrb": "Line2",
    "addrc": "Line3",
    "cty": "DB city 11",
    "pnc": "488010",
    "dist": "Bhopal",
    "stt": "MP",
    "contprnm": "Manager",
    "phn": "6985231040",
    "mob": "1234569801",
    "eml": "test@gmail.com",
    "fctltt": "90.00000",
    "fctlgt": "75.803574",
    "novhcl": "5",
    "licnopb": "12ASF5563",
    "ip_address": "127.0.0.1",
    "state": "Madhya Pradesh",
    "cbwtfid": 221,
    "lic": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    "rgd": "BHOPAL",
    "regdtno": "45139"
  }
  ]);

  useEffect(()=>{
    
    
      refetchG();
    
  },[])


  const GetGid = () => {
    let gd: string = state.gid;
    if (!gd) {
      let g: any = utilities(3, "", "");
      gd = g;
      dispatch({ type: ACTIONS.SETGID, payload: gd });
    }
    return gd;
  };

  const GetData = () => {
    let gid = GetGid();
    let api: string = getApiFromBiowaste("cbwtfregtdy");
    // let data1 = {val:data.length, licno:'cc128c6e-76cf-4321-bc90-eed1eb60c150'};
    let data1 = {val:"0", lvl : "", who : ""};
    return nrjAxiosRequest(api, data1);
  };
  
  function populateGrid(data: any) {
    // console.log (data)
    if (data &&  data.data[0]) {
      let dt: any = data.data[0];
      //let ary: any = dataStr_ToArray(dt);
      // setData([...data, ...ary])
      setData([dt])
      //dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    }
  }

  const { data: data2, refetch: refetchG } = useQuery({
    queryKey: ["svQry", "hopsitalListDisplay", data.length],
    queryFn: GetData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  });

  
  function reachedEnd(data:any){
    refetchG()
    // console.log("reached end ",data);
  }
  return (
    <><div style={{ margin: '2%' }}>

      {/* {!data.length && <h3>Loading Hospital Data ...</h3>} */}
      
      <Swiper
        slidesPerView={3}
        spaceBetween={30}
        keyboard={{enabled: true}}
        navigation={true}
        modules={[Keyboard, Navigation]}
        onSwiper={(swiper) => console.log(swiper)}
        onSlideChange={() => console.log('slide change')}
        onReachEnd={(e) => {reachedEnd(e)}}
      >
        {data.map((res:any, index) => (
            <SwiperSlide key={res.id} virtualIndex={index}>
              <CardCbwtfDisplay data={res} />
            </SwiperSlide>
        ))}
      </Swiper>
    </div>
    </>
  );
}

import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Keyboard, Pagination, Navigation } from 'swiper/modules';
import { Button, CardActions, CardContent, Typography } from '@mui/material';
import CardWasteBagDisplay from '../../components/reusable/CardWasteBagDisplay';
import { useQuery } from '@tanstack/react-query';
import utilities, { createGetApi, dataStr_ToArray, getApiFromBiowaste } from '../../utilities/utilities';
import { useEffect, useReducer, useState } from 'react';
import { nrjAxios, nrjAxiosRequest } from '../../Hooks/useNrjAxios';
import HdrDrp from '../HdrDrp';
import { getLvl, getMyName, getWho } from "../../utilities/cpcb";


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

export default function WstbgDisplay() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [cardData, setCardData] = useState([

    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "ylw",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // },
    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "red",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // },
    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "wht",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // },
    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "blu",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // },
    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "red",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // },
    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "blu",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // },
    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "blu",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // },
    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "ylw",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // },
    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "wht",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // },
    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "blu",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // },
    // {
    //   "licno": "cc128c6e-76cf-4321-bc90-eed1eb60c150",
    //   "clr": "red",
    //   "hcfnm": "hwllo",
    //   "hcfcod": "98235",
    //   "wtkg": "80",
    //   "wtgm": "150",
    //   "lblno": "123456asc7890",
    //   "ltt": "41.753655",
    //   "lgt": "85.656877",
    //   "scby": "cbwtf",
    //   "bluscl": "0",
    //   "ip_address": "127.0.0.1",
    //   "wt": "80.150",
    //   "wstbgid": "6ba85a25-e417-48d2-909a-c0d370cd09ec",
    //   "cdt": "04-08-2023",
    //   "dtno": "45140",
    //   "ctm": "10:39:43 AM",
    //   "tmtonmb": "38383",
    //   "cbwtfid": 221,
    //   "stt": "MP",
    //   "cbwtfnm": "cbwtf 15"
    // }
  ]);
  const [isLoading, setIsLoading] = useState("Loading Hospital Data ...");


  useEffect(()=>{
    refetchG();
  },[])

const GetData = () => {
  let api: string = getApiFromBiowaste("wstbgtdy");
  let data1 = {lvl:'CPCB', cbwtfid:0, val:cardData.length, dtno:'', who:""};
  return nrjAxiosRequest(api, data1);
};

function populateGrid(data: any) {
  if (data && data.status==200 && data.data) {
    setCardData(cardData.concat(data.data))
  }
  else{
    setIsLoading("Data not received, check again after some time..")
  }
}

  const { data: data2, refetch: refetchG } = useQuery({
    queryKey: ["svQry", "hopsitalListDisplay"],
    queryFn: GetData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  });

  let ttl: string = "";
  ttl = "Waste Bags Collected under CBWTF";
  if (getLvl() == "RGD") {
    ttl = "Waste Bags Collected under " + getMyName();
  } else if (getLvl() == "STT") {
    ttl = "Waste Bags Collected";
  }

  
  function reachedEnd(data:any){
    // console.log("reached end ",data);
  }
  return (
    <>
    <HdrDrp formName={ttl}></HdrDrp>
    <div style={{ margin: '2%', marginTop:'5%' }}>
      {!cardData.length ? <h3>{isLoading}</h3>:
                  <div className='flex items-center justify-center rounded-lg p-3 mt-8'>
                        <div className='rounded-md bg-red-100 w-4 h-4'>
                        </div>
                        <div className='font-semibold py-1 px-2 mr-4'>
                            Red
                        </div>
                        <div className='rounded-md bg-blue-100 w-4 h-4'>
                        </div>
                        <div className='font-semibold py-1 px-2 mr-4'>
                            Blue
                        </div>
                        <div className='rounded-md bg-yellow-100 w-4 h-4'>
                        </div>
                        <div className='font-semibold py-1 px-2 mr-4'>
                            Yellow
                        </div>
                        <div className='rounded-md bg-white w-4 h-4'>
                        </div>
                        <div className='font-semibold py-1 px-2 mr-4'>
                            White
                        </div>
                        <div className='rounded-md bg-amber-100 w-4 h-4'>
                        </div>
                        <div className='font-semibold py-1 px-2'>
                            Cytotoxic Yellow
                        </div>
                    </div>}
      
      <Swiper
        slidesPerView={3}
        spaceBetween={30}
        keyboard={{enabled: true}}
        navigation={true}
        slidesPerGroup={3}
        modules={[Keyboard, Navigation]}
        // onSwiper={(swiper) => console.log(swiper)}
        // onSlideChange={() => console.log('slide change')}
        onReachEnd={(e) => {reachedEnd(e)}}
      >
        {cardData.map((res:any, index) => (
            <SwiperSlide key={res.licno} virtualIndex={index}>
              <CardWasteBagDisplay data={res}/>
            </SwiperSlide>
        ))}
      </Swiper>
    </div>
    </>
  );
}

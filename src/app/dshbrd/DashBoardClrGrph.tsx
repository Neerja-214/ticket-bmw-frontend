import React, { useReducer, useState } from "react";
import axios from "axios";
import { useEffectOnce } from "react-use";
import { useNavigate } from "react-router";
import HdrDrp from "../HdrDrp";
import Cyto from "../../app/assests/cyto.png";
import Chart from "react-google-charts";
import { useGetFldValue } from "../../Hooks/useGetFldValue";
import { getLvl } from "../../utilities/cpcb";
import { getWho } from "../../utilities/cpcb"
import { getApplicationVersion } from "../../utilities/utilities";

const ACTIONS = {
  SETSUMMARY: "grdtrigger",
  SETNAME: "nme",
  SETBUTTON: "btnlbl",
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  textDts: "",
  gnrtd: 0,
  ylwgnrtdcnt: 0,
  ylwgnrtdwt: 0,
  rdgnrtdcnt: 0,
  rdgnrtdwt: 0,
  blugnrtdcnt: 0,
  blugnrtdwt: 0,
  whtgnrtdcnt: 0,
  whtgnrtdwt: 0,
  cytgnrtdcnt: 0,
  cytgnrtdwt: 0,
  coltd: 0,
  ylwcltdcnt: 0,
  ylwcltdwt: 0,
  rdcltdcnt: 0,
  rdcltdwt: 0,
  blucltdcnt: 0,
  blucltdwt: 0,
  whtcltdcnt: 0,
  whtcltdwt: 0,
  cytcltdcnt: 0,
  cytcltdwt: 0,
  prcsd: 0,
  ylwprcdcnt: 0,
  ylwprcdwt: 0,
  rdprcdcnt: 0,
  rdprcdwt: 0,
  bluprcddcnt: 0,
  bluprcddwt: 0,
  whtprcdcnt: 0,
  whtprcdwt: 0,
  cytprcdcnt: 0,
  cytprcdwt: 0,
  hcfvst: 0,
  errapi: 0,
  gnrtcnt: 0,
  cltdcnt: 0,
  prsdcnt: 0,
  nme: "",
  btn: "CBWTF",
};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  trigger: number;
  textDts: string;
  gnrtd: number;
  ylwgnrtdcnt: number;
  ylwgnrtdwt: number;
  rdgnrtdcnt: number;
  rdgnrtdwt: number;
  blugnrtdcnt: number;
  blugnrtdwt: number;
  whtgnrtdcnt: number;
  whtgnrtdwt: number;
  cytgnrtdcnt: number;
  cytgnrtdwt: number;
  coltd: number;
  ylwcltdcnt: number;
  ylwcltdwt: number;
  rdcltdcnt: number;
  rdcltdwt: number;
  blucltdcnt: number;
  blucltdwt: number;
  whtcltdcnt: number;
  whtcltdwt: number;
  cytcltdcnt: number;
  cytcltdwt: number;
  prcsd: number;
  ylwprcdcnt: number;
  ylwprcdwt: number;
  rdprcdcnt: number;
  rdprcdwt: number;
  bluprcdcnt: number;
  bluprcdwt: number;
  whtprcdcnt: number;
  whtprcdwt: number;
  cytprcdcnt: number;
  cytprcddwt: number;
  hcfvst: number;
  errapi: number;
  gnrtcnt: number;
  cltdcnt: number;
  prsdcnt: number;
  nme: string;
  btn: string;
};

type act = {
  type: string;
  payload: any;
};


let indexObject = {
  generated: -1,
  collected: -1,
  processed: -1
}

const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.SETBUTTON:
      newstate.btn = "BAG WISE";
      return newstate;
    case ACTIONS.SETNAME:
      newstate.nme = action.payload;
      return newstate;
    case ACTIONS.SETSUMMARY:

      for (let i = 0; i < action.payload.data.length; i++) {
        if (action.payload.data[i].scnby == 'hcf') {
          indexObject.generated = i
        }
        else if (action.payload.data[i].scnby == 'cbwtf') {
          indexObject.collected = i
        }
        else if (action.payload.data[i].scnby == 'fct') {
          indexObject.processed = i
        }
      }

      if (indexObject.generated > -1) {
        newstate.ylwgnrtdcnt = Number(action.payload.data[indexObject.generated].ylwcnt);
        newstate.ylwgnrtdwt = Number(action.payload.data[indexObject.generated].ylwwt).toFixed(3);
        newstate.rdgnrtdcnt = action.payload.data[indexObject.generated].redcnt;
        newstate.rdgnrtdwt = action.payload.data[indexObject.generated].redwt;
        newstate.blugnrtdcnt = action.payload.data[indexObject.generated].blucnt;
        newstate.blugnrtdwt = action.payload.data[indexObject.generated].bluwt;
        newstate.whtgnrtdcnt = action.payload.data[indexObject.generated].whtcnt;
        newstate.whtgnrtdwt = action.payload.data[indexObject.generated].whtwt;
        newstate.cytgnrtdcnt = action.payload.data[indexObject.generated].cytcnt;
        newstate.cytgnrtdwt = action.payload.data[indexObject.generated].cytwt;
        newstate.gnrtd = (
          Number(action.payload.data[indexObject.generated].ylwwt) +
          Number(action.payload.data[indexObject.generated].redwt) +
          Number(action.payload.data[indexObject.generated].bluwt) +
          Number(action.payload.data[indexObject.generated].whtwt) +
          Number(action.payload.data[indexObject.generated].cytwt)
        ).toFixed(3);
        newstate.gnrtcnt = (
          Number(action.payload.data[indexObject.generated].ylwcnt) +
          Number(action.payload.data[indexObject.generated].redcnt) +
          Number(action.payload.data[indexObject.generated].blucnt) +
          Number(action.payload.data[indexObject.generated].whtcnt) +
          Number(action.payload.data[indexObject.generated].cytcnt)
        ).toFixed(0);

      }
      if (indexObject.collected > -1) {

        newstate.ylwcltdcnt = Number(action.payload.data[indexObject.collected].ylwcnt);
        newstate.ylwcltdwt = Number(action.payload.data[indexObject.collected].ylwwt).toFixed(3);
        newstate.rdcltdcnt = action.payload.data[indexObject.collected].redcnt;
        newstate.rdcltdwt = action.payload.data[indexObject.collected].redwt;
        newstate.blucltdcnt = action.payload.data[indexObject.collected].blucnt;
        newstate.blucltdwt = action.payload.data[indexObject.collected].bluwt;
        newstate.whtcltdcnt = action.payload.data[indexObject.collected].whtcnt;
        newstate.whtcltdwt = action.payload.data[indexObject.collected].whtwt;
        newstate.cytcltdcnt = action.payload.data[indexObject.collected].cytcnt;
        newstate.cytcltdwt = action.payload.data[indexObject.collected].cytwt;
        newstate.coltd = (
          Number(action.payload.data[indexObject.collected].ylwwt) +
          Number(action.payload.data[indexObject.collected].redwt) +
          Number(action.payload.data[indexObject.collected].bluwt) +
          Number(action.payload.data[indexObject.collected].whtwt) +
          Number(action.payload.data[indexObject.collected].cytwt)
        ).toFixed(3);
        newstate.cltdcnt = (
          Number(action.payload.data[indexObject.collected].ylwcnt) +
          Number(action.payload.data[indexObject.collected].redcnt) +
          Number(action.payload.data[indexObject.collected].blucnt) +
          Number(action.payload.data[indexObject.collected].whtcnt) +
          Number(action.payload.data[indexObject.collected].cytcnt)
        ).toFixed(0);
      }
      if (indexObject.processed > -1) {
        newstate.ylwprcdcnt = Number(action.payload.data[indexObject.processed].ylwcnt);
        newstate.ylwprcdwt = Number(action.payload.data[indexObject.processed].ylwwt).toFixed(3);
        newstate.rdprcdcnt = action.payload.data[indexObject.processed].redcnt;
        newstate.rdprcdwt = action.payload.data[indexObject.processed].redwt;
        newstate.bluprcdcnt = action.payload.data[indexObject.processed].blucnt;
        newstate.bluprcdwt = action.payload.data[indexObject.processed].bluwt;
        newstate.whtprcdcnt = action.payload.data[indexObject.processed].whtcnt;
        newstate.whtprcdwt = action.payload.data[indexObject.processed].whtwt;
        newstate.cytprcdcnt = action.payload.data[indexObject.processed].cytcnt;
        newstate.cytprcdwt = action.payload.data[indexObject.processed].cytwt;
        newstate.prcsd = (
          Number(action.payload.data[indexObject.processed].ylwwt) +
          Number(action.payload.data[indexObject.processed].redwt) +
          Number(action.payload.data[indexObject.processed].bluwt) +
          Number(action.payload.data[indexObject.processed].whtwt) +
          Number(action.payload.data[indexObject.processed].cytwt)
        ).toFixed(3);
        newstate.prsdcnt = (
          Number(action.payload.data[indexObject.processed].ylwcnt) +
          Number(action.payload.data[indexObject.processed].redcnt) +
          Number(action.payload.data[indexObject.processed].blucnt) +
          Number(action.payload.data[indexObject.processed].whtcnt) +
          Number(action.payload.data[indexObject.processed].cytcnt)
        ).toFixed(0);
      }







      newstate.hcfvst = Number(action.payload["hcfvisited"]).toFixed(0);
      let nm: string = sessionStorage.getItem("cbwtfnm") || "CPCB";
      if (nm == "CPCB") {
        newstate.hcfvst = 57;
      } else {
        newstate.hcfvst = 12;
      }
      newstate.errapi = Number(action.payload["wrngapi"]).toFixed(0);
      // newstate.ylwcltdcnt: 0,
      // newstate.ylwcltddwt: 0,
      // newstate.rdcltddcnt: 0,
      // newstate.rdcltddwt: 0,
      // newstate.blucltddcnt: 0,
      // newstate.blucltddwt: 0,
      // newstate.whtcltddcnt: 0,
      // newstate.whtcltddwt: 0,
      // newstate.cytcltddcnt: 0,
      // newstate.cytcltddwt: 0,
      // newstate.ylwprcdcnt: 0,
      // newstate.ylwprcddwt: 0,
      // newstate.rdprcddcnt: 0,
      // newstate.rdprcddwt: 0,
      // newstate.bluprcddcnt: 0,
      // newstate.bluprcddwt: 0,
      // newstate.whtprcddcnt: 0,
      // newstate.whtprcddwt: 0,
      // newstate.cytprcddcnt: 0,
      // newstate.cytprcddwt: 0,
      return newstate;
  }
};

const DashBoardClrGrph = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  let [time, reTime] = useState("");
  let [date, reDate] = useState("");
  const [showChart, setShowChart] = useState(true)
  let ctg: string = "";
  setTimeout(function () {
    let dt = new Date();
    reTime(dt.toLocaleTimeString());
    reDate(`${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()}`);
  }, 1000);

  const CbwtFlst = () => {
    let nm: string = sessionStorage.getItem("cbwtfnm") || "CPCB";

    if (nm == "CPCB") {
      navigate("/lstwst");
    } else {
      navigate("/bgws");
    }
  };

  const GetData = () => {
    const data = {
      dshbfr: "cpcb",
      lvl: "0",
    };

    let lvl = getLvl()
    let who = getWho()
    const todayData = {
      lvl: lvl,
      who: who
    };


    let mylvl: string = sessionStorage.getItem("cbtwflvl") || "";
    if (mylvl) {
      data.dshbfr = "cbwtf";
      data.lvl = mylvl;
    }
    axios
      .post("https://biowaste.in/total_wstbg_data", todayData)

      .then((response) => {

        dispatch({ type: ACTIONS.SETSUMMARY, payload: response.data });
      })
      .catch((err) => {
        console.log(err);
      });
  };

 
  const GetValuesCtg = (data: string) => {
    ctg = useGetFldValue(data, "scn");
    if (ctg == "1") {
      setShowChart(false)
      // setDataChrtb(dcb)
      setTimeout(function () {
        setShowChart(true)
      }, 900)
    } else if (ctg == "2") {
      setShowChart(false)
      setTimeout(function () {
        setShowChart(true)
      }, 900)
      // setDataChrtb(dbb)
    }
  };

  let datachrtP = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwprcdwt)],
    ["Red", Number(state.rdprcdwt)],
    ["Cytotoxic", Number(state.cytprcdwt)],
    ["Blue", Number(state.bluprcdwt)],
    ["White", Number(state.whtprcdwt)],
    
  ];

  let datachrtPb = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwprcdcnt)],
    ["Red", Number(state.rdprcdcnt)],
    ["Cytotoxic", Number(state.cytprcdcnt)],
    ["Blue", Number(state.bluprcdcnt)],
    ["White", Number(state.whtprcdcnt)],
    
  ];

  const onChangeDts = (data: string) => {
    if (data.indexOf("scn") > -1) {
      GetValuesCtg(data);
    }

    // setTimeout(function(){
    //   dispatch({type: ACTIONS.TRIGGER_GRID, payload: 0})
    //   // refetch()

    // },1500)
  };

  const options = {
    pieSliceTextStyle: {
      color: 'black',
    },
    legend: {
      textStyle: {
        color: 'black',
      },
    },
    colors: ["Yellow", "Red", "Yellow", "Blue", "White"],
    title: "Biomedical Waste Collection : Weight",
    is3D: true,
    sliceVisibilityThreshold: 0.000001,


  };
  const optionsb = {
    colors: ["Yellow", "red", "Yellow", "blue", "White"],
    title: "Biomedical Waste Collection : Bags",
    is3D: true,
    sliceVisibilityThreshold: 0.000001,
    pieSliceTextStyle: {
      color: 'black',
    },
    legend: {
      textStyle: {
        color: 'black',
      },
    },

  };

  // const [datachrt, setDataChrt] = useState([])
  // const [datachrtb, setDataChrtb] = useState([])
  let datachrt: any = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwgnrtdwt)],
    ["Red", Number(state.rdgnrtdwt)],
    ["Cytotoxic", Number(state.cytgnrtdwt)],
    ["Blue", Number(state.blugnrtdwt)],
    ["White", Number(state.whtgnrtdwt)],
    
  ];
  //setDataChrt(d)
  let datachrtb: any = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwgnrtdcnt)],
    ["Red", Number(state.rdgnrtdcnt)],
    ["Cytotoxic", Number(state.cytgnrtdcnt)],
    ["Blue", Number(state.blugnrtdcnt)],
    ["White", Number(state.whtgnrtdcnt)],
    
  ];

  let datachrtC = [
    ["Color", "Weight"],
    ["Yellow", Number(state.ylwcltdwt)],
    ["Red", Number(state.rdcltdwt)],
    ["Cytotoxic", Number(state.cytcltdwt)],
    ["Blue", Number(state.blucltdwt)],
    ["White", Number(state.whtcltdwt)],
    
  ];
  // setDataChrt(db)
  let datachrtCb = [
    ["Color", "Bags"],
    ["Yellow", Number(state.ylwcltdcnt)],
    ["Red", Number(state.rdcltdcnt)],
    ["Cytotoxic", Number(state.cytcltdcnt)],
    ["Blue", Number(state.blucltdcnt)],
    ["White", Number(state.whtcltdcnt)],
    
  ];

  //setDataChrtb(dc)
  useEffectOnce(() => {
    // refetch()
    // sessionStorage.removeItem("cbtwflvl")
    // sessionStorage.removeItem("cbwtfnm")
    let nm: string = sessionStorage.getItem("cbwtfnm") || "CPCB";

    if (nm == "CPCB") {
      dispatch({ type: ACTIONS.SETNAME, payload: nm });
    } else {
      dispatch({ type: ACTIONS.SETNAME, payload: nm });
      dispatch({ type: ACTIONS.SETBUTTON, payload: nm });
    }

    GetData();
  });

  const updWst = () => {
    // let ary : any;
    // ary = ['Yellow',state.ylw_gnrtdwt,state.ylw_cltdwt,state.ylw_prsdwt]
    // if (datachrt){
    //   setDataChrt(ary)
    // } else {
    //   setDataChrt(ary)
    // }
  };
  const applicationVerion: string = getApplicationVersion();


  return (
    <>
      <div className=" overflow-hidden">
      {applicationVerion == '1' && <> <div>
        <HdrDrp hideHeader={false} formName=""></HdrDrp>
      </div>

        <span className="text-center text-bold mt-3 text-blue-600/75">
          <h5>COMMON BIOMEDICAL WASTE TREATMENT FACITLIY</h5>
        </span> </>}
        <div className="container rounded-lg vh-100 w-full">
          <div className="flex items-center my-4 smallScreen">
            <div className="text-lg text-black font-semibold">Dashboard</div>
            <div className="md:flex-grow"></div>
            <div
              className="flex items-center rounded-lg py-3 px-5 bg-white"
              style={{ backgroundColor: "#f5f6fa" }}
            >
              <div className="rounded-md bg-red-700 w-4 h-4"></div>
              <div className="font-semibold py-1 px-2 mr-4">Red</div>
              <div className="rounded-md bg-blue-700 w-4 h-4"></div>
              <div className="font-semibold py-1 px-2 mr-4">Blue</div>
              <div className="rounded-md bg-yellow-300 w-4 h-4"></div>
              <div className="font-semibold py-1 px-2 mr-4">Yellow</div>
              <div className="rounded-md bg-white w-4 h-4"></div>
              <div className="font-semibold py-1 px-2 mr-4">White</div>
              <div className="rounded-md bg-yellow-500 w-4 h-4">
                <img src={Cyto} alt="C"></img>
              </div>
              <div className="font-semibold py-1 px-2">Cytotoxic Yellow</div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row lg:flex-row">
            <div className="flex-1 p-2">
              {showChart && (
                <div className="shadow bg-white  border-slate-200 d-flex justify-content-center">
                  <div className=" w-25 ">

                    <Chart
                      chartType="PieChart"
                      width={"100%"}
                      height={"250px"}
                      data={datachrt}
                      options={options}
                    ></Chart>
                    <div className="text-slate-400 text-lg font-bold text-center">Generated Weight</div>
                  </div>
                  <div className=" w-25 mx-lg-5">
                    <Chart
                      chartType="PieChart"
                      width={"100%"}
                      height={"250px"}
                      data={datachrtC}
                      options={options}
                    ></Chart>
                    <div className="text-orange-400 text-lg font-bold text-center">Collected Weight</div>

                  </div>
                  <div className=" w-25 ">
                    <Chart
                      chartType="PieChart"
                      width={"100%"}
                      height={"250px"}
                      data={datachrtP}
                      options={options}
                    ></Chart>
                    <div className="text-blue-400 text-lg font-bold text-center">Processed Weigth</div>

                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 p-2">
              {showChart && (
                <div className="shadow bg-white border-slate-200 d-flex justify-content-center">
                  <div className=" w-25 ">
                    <Chart
                      chartType="PieChart"
                      width={"100%"}
                      height={"250px"}
                      data={datachrtb}
                      options={optionsb}
                    ></Chart>
                    <div className="text-slate-400 text-lg font-bold text-center">No of Bags Generated</div>

                  </div>
                  <div className=" w-25 mx-lg-5">
                    <Chart
                      chartType="PieChart"
                      width={"100%"}
                      height={"250px"}
                      data={datachrtCb}
                      options={optionsb}
                    ></Chart>
                    <div className="text-orange-400 text-lg font-bold text-center">No of Bags Collected</div>

                  </div>
                  <div className=" w-25 ">
                    <Chart
                      chartType="PieChart"
                      width={"100%"}
                      height={"250px"}
                      data={datachrtPb}
                      options={optionsb}
                    ></Chart>
                    <div className="text-blue-400 text-lg font-bold text-center">No of Bags Processed</div>

                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </>
  );
};

export default React.memo(DashBoardClrGrph);

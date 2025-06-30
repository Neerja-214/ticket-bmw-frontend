import React, { useEffect, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  createGetApi,
  dataStr_ToArray,
  getApplicationVersion,
  postLinux,
} from "../../utilities/utilities";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  nrjAxios, nrjAxiosRequestBio
} from "../../Hooks/useNrjAxios";
import Chart from "react-google-charts";
import LevelSelector from "./LevelSelector";
import HdrDrp from "../HdrDrp";
import { Toaster } from "../../components/reusable/Toaster";
import { useToaster } from "../../components/reusable/ToasterContext";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale, // ✅ Register this for X-axis labels
  LinearScale, // ✅ Register this for Y-axis
  Title,
  Tooltip,
  Legend,
  ChartOptions, ArcElement
} from "chart.js";
import { title } from "process";
import { fontStyle } from "html2canvas/dist/types/css/property-descriptors/font-style";
import { Radio, Typography } from "@material-tailwind/react";
import { RadioButton } from "primereact/radiobutton";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

ChartJS.register(ArcElement, Tooltip, Legend);

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);
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
  FORM_DATA2: "formdata2",
  SETCOMBOSTRB: "cmbstrB",
  SETCOMBOSTRC: "cmbstrC",
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  textDts: "",
  mainId: 100,
  errMsg: [],
  openDrwr: false,
  frmData: "",
  gid: "",
  disableA: 1,
  disableB: 1,
  disableC: 1,
  combostrB: "",
  combostrC: "",
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
  disableA: number;
  disableB: number;
  disableC: number;
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
    case ACTIONS.FORM_DATA2:
      let dta2: string = "";
      let fldN2: any = utilities(2, action.payload, "");
      if (newstate.textDts2) {
        dta2 = newstate.textDts2 + "=";
        let d: any = utilities(1, dta2, fldN2);
        if (d) {
          dta2 = d;
        } else {
          dta2 = "";
        }
      }
      dta2 += action.payload;
      newstate.textDts2 = dta2;
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
    case ACTIONS.SETCOMBOSTRB:
      newstate.combostrB = action.payload;
      return newstate;
    case ACTIONS.SETCOMBOSTRC:
      newstate.combostrC = action.payload;
      return newstate;
    case ACTIONS.DISABLE:
      if (action.payload == 1) {
        if (newstate.disableA == 1) {
          newstate.disableA = 0;
        } else {
          newstate.disableA = 1;
        }
        return newstate;
      } else if (action.payload == 2) {
        if (newstate.disableB == 1) {
          newstate.disableB = 0;
        } else {
          newstate.disableB = 1;
        }
        return newstate;
      }
  }
};

const HcfCtgCnt = (props: any) => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showMessage, setShowMessage] = useState<any>({ message: [] });
  const [isLoading, setIsLoading] = useState("");
  const [levelWhoData, setLevelWhoData] = useState({ lvl: "CPCB", who: "CENTRAL" });
  const [total, setTotal] = useState(0);
  const emptyChartData: any[] = [
    ["Category", "HCF category Count"],
    ["Animal house", 0],
    ["Blood bank", 0],
    ["Bedded hospital", 0],
    ["Clinic", 0],
    ["Dental hospital", 0],
    ["Dispensary", 0],
    ["Institutions / schools / companies etc with first aid facilitites", 0],
    ["Health camp", 0],
    ["Homeopathy", 0],
    ["Mobile hospital", 0],
    ["Nursing home", 0],
    ["Pathology laboratory", 0],
    ["Siddha", 0],
    ["Unani", 0],
    ["Veterinary hospital", 0],
    ["Yoga", 0],
  ]

  const [chrtData, setChrtData] = useState<any[]>(emptyChartData);
  const [currentLevel, setCurrentLevel] = useState('');
  const [drilllvlState, setDrillLvlState] = useState('');

  const getList = () => {
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
    const payload: any = postLinux(levelWhoData.lvl + '=' + levelWhoData.who + '=' + gd, 'hcfctgcnt');
    return nrjAxiosRequestBio("show_hcfCtgCntFile", payload);
  };

  const ShowData = (data: any) => {
    setIsLoading("")
    dispatch({ type: ACTIONS.DISABLE, payload: 2 });
    let dt: any = GetResponseLnx(data);
    let ary: any;
    if (levelWhoData.lvl == 'CBWTF' && dt.BH >= 0) {
      ary = dt

      let totalHcf = 0;

      const dataG: any[] = [];
      const setOfData = [
        ["Category", "HCF count"],
        ["Bedded hospital", !isNaN(Number(ary.BH)) ? Number(ary.BH) : 0],
        ["Clinic", !isNaN(Number(ary.CL)) ? Number(ary.CL) : 0],
        ["Pathology laboratory", !isNaN(Number(ary.PL)) ? Number(ary.PL) : 0],
        ["Nursing home", !isNaN(Number(ary.NH)) ? Number(ary.NH) : 0],
        ["Blood bank", !isNaN(Number(ary.BB)) ? Number(ary.BB) : 0],
        ["Dispensary", !isNaN(Number(ary.DI)) ? Number(ary.DI) : 0],
        ["Animal house", !isNaN(Number(ary.AH)) ? Number(ary.AH) : 0],
        ["Veterinary hospital", !isNaN(Number(ary.VH)) ? Number(ary.VH) : 0],
        ["Dental hospital", !isNaN(Number(ary.DH)) ? Number(ary.DH) : 0],
        ["Institutions / schools / companies etc with first aid facilitites", !isNaN(Number(ary.FA)) ? Number(ary.FA) : 0],
        ["Health camp", !isNaN(Number(ary.HC)) ? Number(ary.HC) : 0],
        ["Homeopathy", !isNaN(Number(ary.HO)) ? Number(ary.HO) : 0],
        ["Mobile hospital", !isNaN(Number(ary.MH)) ? Number(ary.MH) : 0],
        ["Siddha", !isNaN(Number(ary.SI)) ? Number(ary.SI) : 0],
        ["Unani", !isNaN(Number(ary.UN)) ? Number(ary.UN) : 0],
        ["Yoga", !isNaN(Number(ary.YO)) ? Number(ary.YO) : 0],
      ];
      for (let i = 1; i < setOfData.length; i++) {
        totalHcf += Number(setOfData[i][1]);
      }

      setTotal(totalHcf);

      dataG.push(...setOfData);
      dispatch({ type: ACTIONS.RANDOM, payload: 1 });
      setChrtData(dataG);
      console.log(dataG)
    }
    else if (dt && Array.isArray(dt) && dt.length) {
      ary = dt
      let numbers = Object.values({ ...ary[0], regndtno: 0 });
      let totalHcf = 0;


      const dataG: any[] = [];
      const setOfData = [
        ["Category", "HCF count"],
        ["Bedded hospital", !isNaN(Number(ary[0].BH)) ? Number(ary[0].BH) : 0],
        ["Clinic", !isNaN(Number(ary[0].CL)) ? Number(ary[0].CL) : 0],
        ["Pathology laboratory", !isNaN(Number(ary[0].PL)) ? Number(ary[0].PL) : 0],
        ["Nursing home", !isNaN(Number(ary[0].NH)) ? Number(ary[0].NH) : 0],
        ["Blood bank", !isNaN(Number(ary[0].BB)) ? Number(ary[0].BB) : 0],
        ["Dispensary", !isNaN(Number(ary[0].DI)) ? Number(ary[0].DI) : 0],
        ["Animal house", !isNaN(Number(ary[0].AH)) ? Number(ary[0].AH) : 0],
        ["Veterinary hospital", !isNaN(Number(ary[0].VH)) ? Number(ary[0].VH) : 0],
        ["Dental hospital", !isNaN(Number(ary[0].DH)) ? Number(ary[0].DH) : 0],
        ["Institutions / schools / companies etc with first aid facilitites", !isNaN(Number(ary[0].FA)) ? Number(ary[0].FA) : 0],
        ["Health camp", !isNaN(Number(ary[0].HC)) ? Number(ary[0].HC) : 0],
        ["Homeopathy", !isNaN(Number(ary[0].HO)) ? Number(ary[0].HO) : 0],
        ["Mobile hospital", !isNaN(Number(ary[0].MH)) ? Number(ary[0].MH) : 0],
        ["Siddha", !isNaN(Number(ary[0].SI)) ? Number(ary[0].SI) : 0],
        ["Unani", !isNaN(Number(ary[0].UN)) ? Number(ary[0].UN) : 0],
        ["Yoga", !isNaN(Number(ary[0].YO)) ? Number(ary[0].YO) : 0],
      ];
      for (let i = 1; i < setOfData.length; i++) {
        totalHcf += Number(setOfData[i][1]);
      }
      setTotal(totalHcf);

      dataG.push(...setOfData);

      dispatch({ type: ACTIONS.RANDOM, payload: 1 });
      //Needs to be called so that tankquery will other wise not call again
      // });

      setChrtData(dataG);
    } else {
     showToaster(["No data received"], "error");

      const dataG: any[] = [];
      const setOfData = [
        ["Category", "HCF count"],
        ["Bedded hospital", 0],
        ["Clinic", 0],
        ["Pathology laboratory", 0],
        ["Nursing home", 0],
        ["Blood bank", 0],
        ["Dispensary", 0],
        ["Animal house", 0],
        ["Veterinary hospital", 0],
        ["Dental hospital", 0],
        ["Institutions / schools / companies etc with first aid facilitites", 0],
        ["Health camp", 0],
        ["Homeopathy", 0],
        ["Mobile hospital", 0],
        ["Siddha", 0],
        ["Unani", 0],
        ["Yoga", 0],
      ];

      dataG.push(...setOfData);
      setTotal(0);

      setChrtData(dataG);

    }


  };
  const { showToaster, hideToaster } = useToaster();
  const { data, refetch } = useQuery({
    queryKey: ['ctgcnt', levelWhoData],
    queryFn: getList,
    enabled: false,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });



  const options1 = {
    chart: {
      title: "HCF category Count",
    },
  };

  const options2 = {
    title: "HCF category Count",
    curveType: "function",
    legend: { position: "bottom" },
  };
  const options3 = {
    title: "HCF category Count",
    pieHole: 0.4,
    is3D: false,
  };

  const [chartType, setChartType] = useState<number>(1);

  const handleChartTypeChange = (chartType: any) => {
    setChartType(chartType);
  };


  const setLvlWhoData = (data: any) => {
    setTotal(0);

    setLevelWhoData({ lvl: data.lvl, who: data.who });
    setChrtData(emptyChartData)

  }
  const applicationVerion: string = getApplicationVersion();
  const getClick = () => {
    setTimeout(() => {
      refetch();
    }, 400);
  };



  // Mapping API response keys to dataset values



  // Extract values dynamically from API response

  const hcfData = chrtData; // Assuming chrtData contains the data you want to use
  const labels = hcfData.slice(1).map((item) => item[0]); // Extract category names
  const dataValues = hcfData.slice(1).map((item) => item[1]); // Extract counts

  const labelsDog = chrtData.slice(1).map(([category]) => category);
  const dataValuesDog = chrtData.slice(1).map(([_, count]) => count);
  const backgroundColors = [
    "#4d94db", // Darker Light Blue for Bedded Hospital
    "#e06679", "#6fa1d4", "#e6b96b", "#66c2ad", "#a380e6",
    "#e69566", "#e6c259", "#66cce6", "#bfbfbf", "#e07b78",
    "#7fa6cc", "#9bcc89", "#b87ebf", "#e6a35c", "#e6db66",
  ];
  

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      title: {
        display: true, 
        text: "HCF category count", 
        color: "black", 
        font: {
          size: 18, 
          weight: "bold",
        },
        padding: {
          bottom: 15, 
        },
      },
      legend: {
        position: "right" as const, 
        labels: {
          color: "black",
          font: {
            size: 14,
          },
          boxWidth: 40, // Adjusts box size
          padding: 5, // Reduces spacing
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const dataset = tooltipItem.dataset;
            const total = dataset.data.reduce((acc, val) => acc + (typeof val === "number" ? val : 0), 0);
            const value = tooltipItem.raw as number;
            const percentage = ((value / total) * 100).toFixed(2);

            // ✅ Correct way to access tooltipItem.label
            return `${tooltipItem.chart.data.labels?.[tooltipItem.dataIndex] || "Unknown"}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true, // Rotate animation
      animateScale: true, // Scale animation
    },
  };



  const dataDog = {
    labels: labelsDog,
    datasets: [
      {
        data: dataValuesDog,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        hoverOffset: 4
      },
    ],
  };


  const datahcf = {
    labels: labels, // X-axis categories
    datasets: [
      {
        label: "Hospital count",
        data: dataValues, // Y-axis values
        backgroundColor:backgroundColors,// Bar color
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
      title: {
        display: true,
        text: "Health care facility counts",
        font: {
          size: 20 as unknown as number, // TypeScript compatibility fix
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#4285F4",
          font: {
            size: 16 as unknown as number, // Ensure TypeScript compatibility
            weight: "bold",
          },
        },
        title: {
          display: true,
          text: "HCF type",
          color: "#000",
          font: {
            size: 18 as unknown as number,
            weight: "bold",
          },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 50,
          font: {
            size: 14 as unknown as number,
          },
        },
        title: {
          display: true,
          text: "HCF count",
          color: "#000",
          font: {
            size: 18 as unknown as number,
            weight: "bold",
          },
        },
      },
    },
  };



  return (
    <>

      <LevelSelector
        showCbwtf={false}
        levelSelectorData={setLvlWhoData}
        getListButton={true}
        getListOnclick={getClick}
      ></LevelSelector>
      <div className="flex justify-center px-1 sm:px-6 md:px-10 lg:px-10">
        <div className="shadow rounded-lg p-3 bg-white w-full max-w-[90%] md:max-w-[80%] lg:max-w-[100%]">
          <div className="font-semibold text-lg text-center">{isLoading}</div>

          {showMessage && showMessage.message.length !== 0 && (
            <div className="py-2">
              <Toaster data={showMessage} className="" />
            </div>
          )}

          {total && total > 0 && (
            <div className="border rounded-lg p-3 text-center font-semibold">
              Total health care units: {total}
            </div>
          )}

          {/* Chart Type Selection */}

          <div className="flex justify-center">
            <div className="flex flex-wrap gap-6">
              {/* Bar Chart */}
              <div className="flex items-center space-x-3">
                <RadioButton
                  className="w-6 h-6 rounded-full border border-gray-500 appearance-none focus:outline-none 
                       checked:bg-blue-500 checked:ring-4 checked:ring-blue-300 
                       hover:shadow-lg transition-all duration-300"
                  inputId="barChart"
                  name="chartType"
                  value="1"
                  onChange={() => handleChartTypeChange(1)}
                  checked={chartType === 1}
                />
                <label htmlFor="barChart" className="text-gray-700 dark:text-white/80 cursor-pointer">
                  Bar chart
                </label>
              </div>

              {/* Pie Chart */}
              <div className="flex items-center space-x-3">
                <RadioButton
                  className="w-6 h-6 rounded-full border border-gray-500 appearance-none focus:outline-none 
                       checked:bg-red-500 checked:ring-4 checked:ring-red-300 
                       hover:shadow-lg transition-all duration-300"
                  inputId="pieChart"
                  name="chartType"
                  value="3"
                  onChange={() => handleChartTypeChange(3)}
                  checked={chartType === 3}
                />
                <label htmlFor="pieChart" className="text-gray-700 dark:text-white/80 cursor-pointer">
                  Pie chart
                </label>
              </div>
            </div>
          </div>



          <div className="flex justify-center w-full">
            {chartType === 1 && (
              <div className="w-full h-[550px] sm:h-[300px] md:h-[400px] lg:h-[550px]">
                <Bar
                  data={datahcf}
                  options={{
                    ...options,
                    maintainAspectRatio: false,
                    responsive: true,
                  }}
                />
              </div>
            )}

            {chartType === 2 && (
              <Chart
                width="100%"
                height="auto"
                chartType="LineChart"
                loader={<div>Loading chart...</div>}
                data={chrtData}
                options={options2}
              />
            )}

            {chartType === 3 && (
              <div className="flex justify-center items-center w-full h-auto">
                <div className="w-[90vw] max-w-[500px] h-[90vw] max-h-[550px]">
                <Doughnut data={dataDog} options={chartOptions} />
              </div>
            </div>
            )}
          </div>

        </div>
      </div>

    </>
  );
};
export default React.memo(HcfCtgCnt);

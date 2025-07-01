import React, { useEffect, useState,startTransition  } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Loader } from "rsuite";
import "./App.css";
import "./styles/Nrjwtr.css";
import { NrjRequire } from "./utilities/NrjRequire";
import { useIdleTimer } from 'react-idle-timer'
import SwitchLayout from "./components/SwitchLayout";
import Footer from "./app/footer/Footer";
import { nrjAxiosRequestLinux } from "./Hooks/useNrjAxios";
import { postLinux } from "./utilities/utilities";
import { useQuery } from "@tanstack/react-query";
import { useToaster } from "./components/reusable/ToasterContext";


const LzIndiaHeatMapValue = React.lazy(() => import('./app/Reports/IndiaHeatMapValues'));

const LzNrjLgn = React.lazy(() => import("./login/NrjLogin"));
const LzRegistration = React.lazy(() => import("./registration/NrjRegistration"));
const LzLodgeComplaint = React.lazy(() => import("./registration/NrjLodgeComplaint"));
const LzAllTickets = React.lazy(() => import("./app/Tickets/AllTickets"));


const LzAllStateReport = React.lazy(() => import("./app/AnnualRpt/AllStateReport"));

const LzChangePasswordHcf = React.lazy(() => import("./app/login/ChangePasswodHcf"));
const LzChangePasswordCbwtf = React.lazy(() => import("./app/login/ChangepasswordCbwtf"));
//const LzChangePswSpcb =  React.lazy(() => import("./app/login/ChangePswSpcb"));
const LzChangePassword = React.lazy(() => import("./app/login/ChangePasswod"));
const LzCityHcfList = React.lazy(() => import("./app/MIS/CityHcfList"));
const LzRgDrct = React.lazy(() => import("./app/brds/RgnDirctr"));
const LzRgnDirtLst = React.lazy(() => import("./app/brds/RgnDirctrLst"));
const LzSttDircctrLst = React.lazy(() => import("./app/brds/SttDirctrLst"));
const LzStateBrd = React.lazy(() => import("./app/brds/StateBrd"));
const LzCpcbHo = React.lazy(() => import("./app/brds/CpchHoPg"));
const LzAnnlMisc = React.lazy(() => import("./app/AnnualRpt/AnnlMisc"));
const LzAnnlEqp = React.lazy(() => import("./app/AnnualRpt/AnnlEqp"));
const LzAnnlWstStrg = React.lazy(() => import("./app/AnnualRpt/AnnlWstStrg"));
const LzAnnlWstWt = React.lazy(() => import("./app/AnnualRpt/AnnlWstWt"));
const LzHcfNonVisited = React.lazy(() => import("./app/Reports/MisHcfNonVisited"));
const LzListCbwtfWstData = React.lazy(() => import("./app/Reports/ListCbwtfWstData"));
const LzHCFCnt = React.lazy(() => import("./app/Reports/HcfCount"));
const LzGridDisply = React.lazy(() => import("./app/Reports/GridDisplay"));
const LzCbwtfLstRep = React.lazy(() => import("./app/Reports/CbwtfLst"));
const LzBigBag = React.lazy(() => import("./app/Reports/BigBag"));
const LzWrongWstBgCbwtf = React.lazy(() => import("./app/Reports/WrongWstBgCbwtf"));
const LzListHCF = React.lazy(() => import("./app/Reports/ListHCF"));
// const LzStt_Annlauth = React.lazy(() => import("./app/AnnualRpt/State/Stt_Annlauth"));
// const LzStt_Annldstr = React.lazy(() => import("./app/AnnualRpt/State/Stt_Annldstr"));
// const LzStt_Annlcptv = React.lazy(() => import("./app/AnnualRpt/State/Stt_Annlcptv"));
// const LzAnnCbwtf = React.lazy(() => import("./app/AnnualRpt/State/Stt_Annlcbwtf"));
// const LzAnnlFrst = React.lazy(() => import("./app/AnnualRpt/State/Stt_Annlfrst"));
const LzAnnlRpt = React.lazy(() => import("./app/AnnualRpt/AnnlRpt"));
const LzNrjForgotPassword = React.lazy(() => import("./login/NrjForgotPassword"));
const LzMisBagcount = React.lazy(() => import("./app/Reports/MisBagCountLbl"));
const LzSerialNumber = React.lazy(() => import("./app/Reports/MisSerialNumber"));
const LzMisBagcntwthGeo = React.lazy(() => import("./app/Reports/MisBagCntwthGeo"));
const LzMisBagcntwthIncrt = React.lazy(() => import("./app/Reports/MisBagCntwthIncrt"));
const LzBagCntPrHr = React.lazy(() => import("./app/dshbrd/BagCntPrHr"));
const LzBagCntPrHrGrid = React.lazy(() => import("./app/dshbrd/bagCnthrGrid"));
const LzBhuvanMap = React.lazy(() => import("./app/Reports/BhuvanMap"));
const LzVechilceTrackingMap = React.lazy(() => import("./app/Reports/VehicleLocation"))
const LzGoogleMap = React.lazy(() => import("./app/Reports/GoogleMap"));
const LzHelpPage = React.lazy(() => import("./app/Reports/HelpPage"));
const LzClrHcfWst = React.lazy(() => import("./app/Reports/ClrHcfWst"));
const LzHcf_Wstbg = React.lazy(() => import("./app/Reports/HCF_Wstbg"));
const LzSrch_hcf = React.lazy(() => import("./app/Reports/Srch_hcf"));
const LzHcfctgCnt = React.lazy(() => import("./app/dshbrd/HcfCtgCnt"));
const LzHcfctgCntGrid = React.lazy(() => import("./app/dshbrd/HcfCtgCntGrid"));
const LzBrdActvSmry = React.lazy(() => import("./app/MIS/BrdActvSmry"));
const LzWstbgOdd = React.lazy(() => import("./app/Reports/WstbgOdd"));
const LzFind_HCF = React.lazy(() => import("./app/Reports/Find_HCF"));
const LzWstbgid = React.lazy(() => import("./app/Reports/WastebagId"));
const Lzcbwtfdlyrep = React.lazy(() => import("./app/Reports/cbwtfdlyrep"));
const LzDisplayDataCard = React.lazy(() => import("./app/Reports/DisplayDataCard"));
const LzDailyReports = React.lazy(() => import("./app/Reports/DailyReport/DailyReports"));
const LzBagWeightChart30 = React.lazy(() => import("./app/dshbrd/DashboardChartView30"));
const LzBagWeightChart50 = React.lazy(() => import("./app/dshbrd/DashboardChartView50"));
const LzBagWeightChart3050 = React.lazy(() => import("./app/dshbrd/DashboardChartView3050"));
const LzBagWeightChart3050Abv = React.lazy(() => import("./app/dshbrd/DashboardChartView3050Abv"));
const LzBagWeightChartScnBy = React.lazy(() => import("./app/dshbrd/DashboardChartViewscnBy"));
const LzBagWeightChartScnBy50 = React.lazy(() => import("./app/dshbrd/DashboardChartViewscnBy50"));
const LzBagWeightChartScnBy3050 = React.lazy(() => import("./app/dshbrd/DashboardChartViewscnBy3050"))
const LzBagWeightChartScnBy3050Abv = React.lazy(() => import("./app/dshbrd/DashboardChartViewscnBy3050Abv"));
const LzBagWeightChartDate = React.lazy(() => import("./app/dshbrd/DashBoardChartDate"));
const LzBagCbwtfScnBy = React.lazy(() => import("./app/dshbrd/bagCbwtfScnBy"));
const LzBagFactory = React.lazy(() => import("./app/dshbrd/bagFactory"));

const LzAuthorizationDetail = React.lazy(() => import("./app/AnnualRpt/State/Stt_AuthorizationDetail"));
const LzCaptiveInformation = React.lazy(() => import("./app/AnnualRpt/State/Stt_CaptiveInformation"));
const LzWasteInformation = React.lazy(() => import("./app/AnnualRpt/State/Stt_WasteInformation"));
const LzDashBoardNew = React.lazy(() => import("./app/dshbrd/DashBoardNew"));
const LzHcfUnblockUser = React.lazy(() => import("./app/Reports/HcfUnblockUser"));
const LzChangePswRgd = React.lazy(() => import("./app/login/changePswRgd"));
const LzChangePswSpcb = React.lazy(() => import("./app/login/changePswSbcb"));
const LzHcfSignup = React.lazy(() => import("./app/hcf/HcfSignup"));
const LzHcfRemark = React.lazy(() => import("./app/hcf/HcfRemark"));
const LzHospitalModified = React.lazy(() => import("./app/Reports/HospitalModified"));
const LzLoginFiles = React.lazy(() => import("./app/Reports/LoginFiles"));
const LzHcfMaster = React.lazy(() => import("./app/hcf/HcfMaster"));
const LzHcfAr = React.lazy(() => import("./app/hcf/HcfAr"));
const LzHcfArDaily = React.lazy(() => import("./app/hcf/HcfArDaily"));
const LzHcfCorrectedList = React.lazy(() => import("./app/Reports/HcfCorrectedList"));
const LzAuthorizationAndWaste = React.lazy(() => import("./app/AnnualRpt/State/Stt_AnnualReportForm"));
const LzAuthorizationAndConsoliDate = React.lazy(() => import('./app/AnnualRpt/State/Stt_ConsolidateData'))
const LzAuthorizationAndWasteCpcb = React.lazy(() => import("./app/AnnualRpt/State/stt_AnnlRptCpcb"));
const LzSttMonthlyRptCpcb = React.lazy(() => import("./app/AnnualRpt/State/Stt_MonthlyRptCpcb"));


const LzStateMonthlyReport = React.lazy(() => import("./app/AnnualRpt/State/SttMonthlyReport"));
const LzAuthorHcfRegiterIndpnt = React.lazy(() => import("./app/hcf/HcfRegisterIndpnt"));
const LzAuthorHcfConsentList = React.lazy(() => import("./app/hcf/HcfConsentList"));
const LzAuthorHcfConsentReport = React.lazy(() => import("./app/hcf/HcfConsentReport"));
const LzHcfAnnlPrt = React.lazy(() => import("./app/hcf/HcfAnnlRpt"));
 const LzHcfAnnlPrtFormTab = React.lazy(() => import("./app/hcf/HcfAnnlRptFormTab"))
// const LzHcfAnnlPrtFormTab = React.lazy(() => import("./app/hcf/HcfAnnlRptFormTab_copy"))
const LzHcfAnnlPrtCpcb = React.lazy(() => import("./app/hcf/HcfAnnlRptCpcb"))
const LzHcfMonthlyPrtCpcb = React.lazy(() => import("./app/hcf/HcfMonthlyRptCpcb"))
const LzHcfMonthlyReport = React.lazy(() => import('./app/hcf/HcfMonthlyReport'))
const LzHcfMonthlyReportFormTab = React.lazy(() => import('./app/hcf/HcfMonthlyRptFormTab'))
const LzCbwtfAnnulRpt = React.lazy(() => import("./app/dshbrd/CbwtfAnnulRpt"));
const LzCbwtfAnnulRptCpcb = React.lazy(() => import("./app/dshbrd/CbwtfAnnlRptCpcb"));
const LzCbwtfMonthlyRptCpcb = React.lazy(() => import("./app/dshbrd/CbwtfMonthlyRptcpcb"));
const LzCbwtfDetails = React.lazy(() => import("./app/dshbrd/CbwtfDetails"));
const LzCbwtfMonthlyRpt = React.lazy(() => import('./app/dshbrd/CbwtfMonthlyRpt'))


function App() {
  document.title = "CPCB";
  const [state, setState] = useState<string>('Active')
  const [count, setCount] = useState<number>(0)
  const [remaining, setRemaining] = useState<number>(0)
    const { showToaster, hideToaster } = useToaster();
  const navigate = useNavigate();
  function signout() {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  }

  const onIdle = () => {
    setState('Idle')
    signout();
  }

  const onActive = () => {
    setState('Active')
  }

  const onAction = () => {
    setCount(count + 1)
  }

  const { getRemainingTime } = useIdleTimer({
    onIdle,
    onActive,
    onAction,
    timeout: 1200000, //20 minute 
    throttle: 500
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000))
    }, 500)

    return () => {
      clearInterval(interval)
    }
  })

  const { data: dataC, refetch: refetchC } = useQuery({
          queryKey: ['logout'],
          queryFn: logoutApi,
          enabled: false,
          staleTime: Number.POSITIVE_INFINITY,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          onSuccess: logoutApiSuccess,
      })
  
      function logoutApi() {
  
          let base64Data = sessionStorage.getItem('isLoggedOut') || "";
          let jsonData = atob(base64Data)
          if (jsonData) {
              let data = JSON.parse(jsonData);
              let payload: any = postLinux('M/SSM110041DLCDG6042' + "=" + '22ffd3cb69804c3ba561aee92606f4bc', "logout");
              return nrjAxiosRequestLinux('logout', payload)
          } else {
              showToaster(["Please try again !!!"], 'error');
           
          }
  
  
      }
  
      function logoutApiSuccess(data: any) {
          localStorage.clear();
          sessionStorage.clear();
      }

  
  useEffect(() => {
    const handleUnload = () => {
      logoutApi();
    };

    // Add event listeners
    // window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    // Cleanup event listeners on component unmount
    return () => {
      // window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);


  const openHelpPage = () => {
    const pdfUrl = "pdfs/" + window.location.pathname.replace("/", "") + ".pdf";
    window.open(pdfUrl, "_blank");
  };


  return (


    <div
    style={{
      height: "100vh",          // Full viewport height
      overflowY: "auto",        // Only show scrollbar if content overflows
      display: "flex",          // Flexbox layout
      flexDirection: "column",  // Stack child elements vertically
      backgroundColor: "#F5F5F5", // Set background color
      margin: 0,                // Ensure no margin causes extra space
      padding: 0,               // Remove default padding
    }}
  >
        <React.Suspense fallback={<Loader size="lg" content="Loading..." />}>
      <Routes>
        <Route
          index
          // path="/login"
          element={
            
              <LzNrjLgn />
            
          }
        ></Route>

         <Route
          path="/register"
          element={<LzRegistration />}
        />

         <Route
          path="/registerComplaint"
          element={<LzLodgeComplaint />}
        />
        
         <Route
          path="/allTickets"
          element={<LzAllTickets />}
        />


        <Route
          path="/forgotPassword"
          element={
            
              <LzNrjForgotPassword />
            
          }
        ></Route>

        <Route
          path="/login"
          element={
            
              <LzNrjLgn />
            
          }
        ></Route>
        <Route
          path="/hcfMaster"
          element={
            
              <LzHcfSignup></LzHcfSignup>
            
          }
        ></Route>
        <Route
          path="/hcfAr"
          element={
            
              <LzHcfAr></LzHcfAr>
            
          }
        ></Route>
        <Route
          path="/hcfArDaily"
          element={
            
              <LzHcfArDaily></LzHcfArDaily>
            
          }
        ></Route>
        <Route
          path="/hcfAnnlRpt"
          element={
            
              <LzHcfAnnlPrt></LzHcfAnnlPrt>
            
          }
        ></Route>
        <Route
          path="/hcfRemark"
          element={
            
              <LzHcfRemark></LzHcfRemark>
            
          }
        ></Route>
        {/* <Route
          path="/ChangePasswordHcf"
          element={
            
              <LzChangePasswordHcf></LzChangePasswordHcf>
            
          }
        ></Route> */}


        <Route
          path="/cbwtfMonthlyRpt"
          element={
            
              <NrjRequire>
                <LzCbwtfMonthlyRpt />
              </NrjRequire>
            
          }
        ></Route>
        {/* <Route
          path="/cbwtfDtl"
          element={
            
              <NrjRequire>
                <LzCbwtfDetails />
              </NrjRequire>
            
          }
        ></Route> */}
        <Route
          path="/"
          element={
            <SwitchLayout />
          }>
          <Route
            path="/mapIndia"
            element={
              
                 <NrjRequire>
                  <LzIndiaHeatMapValue />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/ChangePasswordHcf"
            element={
              
                <LzChangePasswordHcf></LzChangePasswordHcf>
              
            }
          ></Route>
          <Route
            path="/ChangePasswordCbwtf"
            element={
              
                <LzChangePasswordCbwtf></LzChangePasswordCbwtf>
              
            }
          ></Route>
          <Route
            path="/cbwtfAnnulRpt"
            element={
              
                <NrjRequire>
                  <LzCbwtfAnnulRpt />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfDetails"
            element={
              
              <NrjRequire>
              <LzHcfMaster />
            </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfAnnlRptFormTab"
            element={
              
              
              <NrjRequire>
              <LzHcfAnnlPrtFormTab />
            </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/cbwtfDtl"
            element={
              
                <NrjRequire>
                  <LzCbwtfDetails />
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/cbwtfdspl"
            element={
              
                <NrjRequire>
                  <LzCbwtfLstRep></LzCbwtfLstRep>
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/hcflist"
            element={
              
                <NrjRequire>
                  <LzListHCF
                    path={"hcflist"}
                    inputData={{ lvl: "CPCB", who: "", dtno: "0" }}
                    cols={[
                      // {
                      //   field: "cbwtfid",
                      //   hidden: true,
                      //   width: 50,
                      //   headerName: "S No",
                      // },
                      {
                        field: "hcfnm",
                        width: 320,
                        headerName: "Health care facility",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "hcfcod",
                        width: 180,
                         headerName: "SPCB/PCC code",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "cty",
                        width: 100,
                        headerName: "City",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "cntprsn",
                        width: 180,
                        headerName: "Contact person",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "phn",
                        width: 120,
                        headerName: "Mobile",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "nobd",
                        width: 150,
                        headerName: "No of beds",
                      },
                      {
                        field: "ltt",
                        width: 150,
                        headerName: "Latitude",
                      },
                      {
                        field: "lgt",
                        width: 150,
                        headerName: "Longtitude",
                      },
                      {
                        field: "addra",
                        width: 150,
                        headerName: "Address I",
                      },
                      {
                        field: "addrb",
                        width: 150,
                        headerName: "Address II",
                      },
                      {
                        field: "addrc",
                        width: 150,
                        headerName: "Address III",
                      },
                    ]}
                  ></LzListHCF>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfbd"
            element={
              
                <NrjRequire>
                  <LzListHCF
                    path={"hcfbd"}
                    inputData={{ lvl: "CPCB", who: "", dtno: "0" }}
                    cols={[
                      // {
                      //   field: "cbwtfid",
                      //   hidden: true,
                      //   width: 50,
                      //   headerName: "S No",
                      // },
                      {
                        field: "hcfnm",
                        width: 320,
                        headerName: "Health care facility",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "hcfcod",
                        width: 180,
                         headerName: "SPCB/PCC code",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "cty",
                        width: 100,
                        headerName: "City",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "cntprsn",
                        width: 180,
                        headerName: "Contact person",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "phn",
                        width: 120,
                        headerName: "Mobile",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "nobd",
                        width: 150,
                        headerName: "No of beds",
                      },
                      {
                        field: "ltt",
                        width: 150,
                        headerName: "Latitude",
                      },
                      {
                        field: "lgt",
                        width: 150,
                        headerName: "Longtitude",
                      },
                      {
                        field: "addra",
                        width: 150,
                        headerName: "Address I",
                      },
                      {
                        field: "addrb",
                        width: 150,
                        headerName: "Address II",
                      },
                      {
                        field: "addrc",
                        width: 150,
                        headerName: "Address III",
                      },
                    ]}
                  ></LzListHCF>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bhuvanmap"
            element={
              
                <NrjRequire>
                  <LzBhuvanMap />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/vehicletrack_map"
            element={
              
                <NrjRequire>
                  <LzVechilceTrackingMap />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/googlemap"
            element={
              
                <NrjRequire>
                  <LzGoogleMap />
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/hcfnbd"
            element={
              
                <NrjRequire>
                  <LzListHCF
                    path={"hcfnbd"}
                    inputData={{ lvl: "CPCB", who: "", dtno: "0" }}
                    cols={[
                      // {
                      //   field: "cbwtfid",
                      //   hidden: true,
                      //   width: 50,
                      //   headerName: "S No",
                      // },
                      {
                        field: "hcfnm",
                        width: 320,
                        headerName: "Health care facility",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "hcfcod",
                        width: 100,
                         headerName: "SPCB/PCC code",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "cty",
                        width: 100,
                        headerName: "City",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "cntprsn",
                        width: 150,
                        headerName: "Contact person",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "phn",
                        width: 120,
                        headerName: "Mobile",
                      },
                      {
                        field: "hcftyp",
                        width: 70,
                        headerName: "HCF type",
                      },
                      {
                        field: "ltt",
                        width: 100,
                        headerName: "Latitude",
                      },
                      {
                        field: "lgt",
                        width: 100,
                        headerName: "Longtitude",
                      },
                      {
                        field: "addra",
                        width: 150,
                        headerName: "Address I",
                      },
                      {
                        field: "addrb",
                        width: 150,
                        headerName: "Address II",
                      },
                      {
                        field: "addrc",
                        width: 150,
                        headerName: "Address III",
                      },
                    ]}
                  ></LzListHCF>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcflstgrd"
            element={
              
                <NrjRequire>
                  <LzGridDisply
                    path={"hcfregtdy"}
                    inputData={{ lvl: "CPCB", who: "", dtno: "0" }}

                  ></LzGridDisply>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfcbwtf"
            element={
              
                <NrjRequire>
                  <LzHCFCnt
                    groupBy={"cbwtfid"}
                    mypage={1}
                    cols={[

                      {
                        field: "cbwtfnm",
                        width: 250,
                         headerName: "Name of CBWTF",
                        tooltipField: "tphcf",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "state",
                        width: 150,
                        headerName: "State/UT",
                      },
                      {
                        field: "cty",
                        hidden: false,
                        width: 130,
                        headerName: "City",
                      },
                      
                      {
                        field: "rgd",
                        width: 180,
                       headerName: "Regional directorate"
                      },
                      {
                        field: "hcfcount",
                        width: 170,
                        headerName: "Health care facility",
                        tooltipField: "tphcf",
                      },
                      {
                        field: "beds",
                        width: 130,
                        headerName: "Total beds",
                      },
                      {
                        field: "bedded",
                        width: 130,
                        headerName: "Bedded HCF",
                        tooltipField: "tpbd",
                      },
                      {
                        field: "nonbedded",
                        width: 160,
                        headerName: "Non bedded HCF",
                        tooltipField: "tpnobd",
                      },
                    
                      {
                        field: "tphcf",
                        width: 150,
                        hide: true,
                        headerName: "",
                      },
                      {
                        field: "tpbd",
                        width: 150,
                        hide: true,
                        headerName: "",
                      },
                      {
                        field: "tpnobd",
                        width: 150,
                        hide: true,
                        headerName: "",
                      },
                    ]}
                  ></LzHCFCnt>
                </NrjRequire>
              
            }
          ></Route>
          {/* can use this page to show details */}
          <Route
            path="/hcfrgd"
            element={
              
                <NrjRequire>
                  <LzHCFCnt
                    groupBy={"rgd"}
                    mypage={2}
                    cols={[
                      {
                        field: "idsr",
                        hidden: true,
                        width: 100,
                        headerName: "S No",
                      },
                      {
                        field: "_id",
                        width: 400,
                       headerName: "Regional directorate"
                      },
                      {
                        field: "bedded",
                        width: 220,
                        headerName: "Bedded HCF ",
                      },
                      {
                        field: "nonbedded",
                        width: 100,
                        headerName: "Non bedded HCF",
                      },
                      {
                        field: "hcfcount",
                        width: 250,
                        headerName: "Health care facility",
                      },
                      {
                        field: "beds",
                        width: 220,
                        headerName: "Total beds",
                      },
                    ]}
                  ></LzHCFCnt>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/ListWrngHCFCode"
            element={
              
                <LzWrongWstBgCbwtf />
              
            }
          ></Route>
          <Route
            path="/wstbgs"
            element={
              
                <NrjRequire>
                  <LzListCbwtfWstData />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/cntr"
            element={
              
                <NrjRequire>
                  <LzCpcbHo />
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/changePwd"
            element={
              
                <LzChangePassword />
              
            }
          ></Route>

          <Route
            path="/cityHcfSearch"
            element={
              
                <NrjRequire>
                  <LzCityHcfList />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/rgnd"
            element={
              
                <NrjRequire>
                  <LzRgDrct />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/rgndlst"
            element={
              
                <NrjRequire>
                  <LzRgnDirtLst />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/sttdlst"
            element={
              
                <NrjRequire>
                  <LzSttDircctrLst />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/stt"
            element={
              
                <NrjRequire>
                  <LzStateBrd />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfNonVisited"
            element={
              
                <NrjRequire>
                  <LzHcfNonVisited></LzHcfNonVisited>
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/bagCntPrHr"
            element={
              
                <NrjRequire>
                  <LzBagCntPrHr></LzBagCntPrHr>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagCntPrGrid"
            element={
              
                <NrjRequire>
                  <LzBagCntPrHrGrid></LzBagCntPrHrGrid>
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/bigBag"
            element={
              
                <NrjRequire>
                  <LzBigBag></LzBigBag>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagcntwthLbl"
            element={
              
                <NrjRequire>
                  <LzMisBagcount></LzMisBagcount>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagcntwthGeo"
            element={
              
                <NrjRequire>
                  <LzMisBagcntwthGeo></LzMisBagcntwthGeo>
                </NrjRequire>
              
            }
          ></Route>
           <Route
            path="/bagcntwthincrt"
            element={
              
                <NrjRequire>
                  <LzMisBagcntwthIncrt></LzMisBagcntwthIncrt>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/serialNumber"
            element={
              
                <NrjRequire>
                  <LzSerialNumber></LzSerialNumber>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/displayDataCard"
            element={
              
                <NrjRequire>
                  <LzDisplayDataCard></LzDisplayDataCard>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/HcfCrtList"
            element={
              
                <NrjRequire>
                  <LzHcfCorrectedList></LzHcfCorrectedList>
                </NrjRequire>
              
            }
          ></Route>


          <Route
            path="/HcfBlckusr"
            element={
              
                <NrjRequire>
                  <LzHcfUnblockUser></LzHcfUnblockUser>
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/bagWtCntChrt2"
            element={
              
                <NrjRequire>
                  <LzBagWeightChartScnBy></LzBagWeightChartScnBy>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagWtCntChrt3"
            element={
              
                <NrjRequire>
                  <LzBagWeightChartScnBy50></LzBagWeightChartScnBy50>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagWtCntChrt4"
            element={
              
                <NrjRequire>
                  <LzBagWeightChart30></LzBagWeightChart30>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagWtCntChrt5"
            element={
              
                <NrjRequire>
                  <LzBagWeightChart50></LzBagWeightChart50>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagWtCntChrt6"
            element={
              
                <NrjRequire>
                  <LzBagWeightChart3050></LzBagWeightChart3050>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagWtCntChrt7"
            element={
              
                <NrjRequire>
                  <LzBagWeightChart3050Abv></LzBagWeightChart3050Abv>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagWtCntChrt8"
            element={
              
                <NrjRequire>
                  <LzBagWeightChartScnBy3050></LzBagWeightChartScnBy3050>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagWtCntChrt9"
            element={
              
                <NrjRequire>
                  <LzBagWeightChartScnBy3050Abv></LzBagWeightChartScnBy3050Abv>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagWtCntChrt10"
            element={
              
                <NrjRequire>
                  <LzBagWeightChartDate></LzBagWeightChartDate>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagCbwtfScnBy"
            element={
              
                <NrjRequire>
                  <LzBagCbwtfScnBy></LzBagCbwtfScnBy>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/bagFactory"
            element={
              
                <NrjRequire>
                  <LzBagFactory></LzBagFactory>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/WstbgOdd"
            element={
              
                <NrjRequire>
                  <LzWstbgOdd />
                </NrjRequire>
              
            }
          ></Route>


          <Route
            path="/hcfCtgCnt"
            element={
              
                <NrjRequire>
                  <LzHcfctgCnt></LzHcfctgCnt>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfCtgGrid"
            element={
              
                <NrjRequire>
                  <LzHcfctgCntGrid></LzHcfctgCntGrid>
                </NrjRequire>
              
            }
          ></Route>


          <Route
            path="/helpPage"
            element={
              
                <NrjRequire>
                  <LzHelpPage></LzHelpPage>
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/hcf_wstbg"
            element={
              
                <NrjRequire>
                  <LzHcf_Wstbg></LzHcf_Wstbg>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/srch_hcf"
            element={
              
                <NrjRequire>
                  <LzSrch_hcf></LzSrch_hcf>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/find_hcf"
            element={
              
                <NrjRequire>
                  <LzFind_HCF></LzFind_HCF>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/wstbgid"
            element={
              
                <NrjRequire>
                  <LzWstbgid></LzWstbgid>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/changePwdRgd"
            element={
              
                <NrjRequire>
                  <LzChangePswRgd></LzChangePswRgd>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/changePwdSpcb"
            element={
              
                <NrjRequire>
                  <LzChangePswSpcb></LzChangePswSpcb>
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/cbwtfAnnulrptcp"
            element={
              
                <NrjRequire>
                  <LzCbwtfAnnulRpt />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/cbwtfAnnulrptcpcb"
            element={
              
                <NrjRequire>
                  <LzCbwtfAnnulRptCpcb />
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/cbwtfMonthlyrptcpcb"
            element={
              
                <NrjRequire>
                  <LzCbwtfMonthlyRptCpcb />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfAnnlRptcp"
            element={
              
                <NrjRequire>
                  <LzHcfAnnlPrtCpcb></LzHcfAnnlPrtCpcb>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfMonthlyRptcp"
            element={
              
                <NrjRequire>
                  <LzHcfMonthlyPrtCpcb></LzHcfMonthlyPrtCpcb>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfMonthlyhRpt"
            element={
              
                <NrjRequire>
                  <LzHcfMonthlyReport></LzHcfMonthlyReport>
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/hcfMonthlyhRptFromTab"
            element={
              
                <NrjRequire>
                  <LzHcfMonthlyReportFormTab></LzHcfMonthlyReportFormTab>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfAnnlRptcbcp"
            element={
              
                <LzHcfAnnlPrt></LzHcfAnnlPrt>
              
            }
          ></Route>
          <Route
            path="/cbwtfdlyrep"
            element={
              
                <NrjRequire>
                  <Lzcbwtfdlyrep></Lzcbwtfdlyrep>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/loginFiles"
            element={
              
                <NrjRequire>
                  <LzLoginFiles></LzLoginFiles>
                </NrjRequire>
              
            }
          ></Route> <Route
            path="/hospitalModified"
            element={
              
                <NrjRequire>
                  <LzHospitalModified></LzHospitalModified>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfwstbg"
            element={
              
                <NrjRequire>
                  <LzClrHcfWst></LzClrHcfWst>
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/dashboardvb"
            element={
              
                <NrjRequire>
                  <LzDashBoardNew />
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/dailyReport"
            element={
              
                <NrjRequire>
                  <LzDailyReports />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/spcb_authorizationDetails"
            element={
              
                <NrjRequire>
                  < LzAuthorizationDetail />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/spcb_authorizationAndWaste"
            element={
              
                <NrjRequire>
                  <LzAuthorizationAndWaste />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/spcb_authorizationAndconsolidate"
            element={
              
                <NrjRequire>
                  <LzAuthorizationAndConsoliDate />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/spcb_authorizationAndWasteCp"
            element={
              
                <NrjRequire>
                  <LzAuthorizationAndWasteCpcb />
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/spcb_sttMonthlyRptCpcb"
            element={
              
                <NrjRequire>
                  <LzSttMonthlyRptCpcb />
                </NrjRequire>
              
            }
          ></Route>

          <Route
            path="/stt_monthlyReport"
            element={
              
                <NrjRequire>
                  <LzStateMonthlyReport />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/spcb_captiveInformation"
            element={
              
                <NrjRequire>
                  < LzCaptiveInformation />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/spcb_wasteInformation"
            element={
              
                <NrjRequire>
                  < LzWasteInformation />
                </NrjRequire>
              
            }
          ></Route>




          <Route
            path="/actvrpt"
            element={
              
                <NrjRequire>
                  <LzBrdActvSmry

                    cols={[
                      {
                        field: "cbwtfid",
                        hide: true,
                        width: 50,
                        headerName: "S No",
                      },
                      {
                        field: "cbwtfnm",
                        width: 400,
                         headerName: "Name of CBWTF",
                        tooltipField: 'cbwtfnm',
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "state",
                        width: 250,
                        headerName: "State/UT",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "rgd",
                        width: 250,
                        headerName: "Regional directorate",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "tdyhcf",
                        width: 250,
                        headerName: "HCF Registered Today",
                        filter: "agTextColumnFilter",
                      },
                      {
                        field: "tdybags",
                        width: 250,
                        headerName: "Waste Bags Received",
                        filter: "agTextColumnFilter",
                        headerTooltip: "Sum of bags collected from HCF's, CBWTF and Operator",
                        tooltipField: "tdybagTool",
                      },
                      {
                        field: "route",
                        width: 120,
                        headerName: "Active Vehicles",
                        hide: true

                      }
                    ]}
                  ></LzBrdActvSmry>
                </NrjRequire>
              
            }
          ></Route>




          {/* <Route
            path="/spcb_cbwtf"
            element={
              
                <NrjRequire>
                  <LzAnnCbwtf></LzAnnCbwtf>
                </NrjRequire>
              
            }
          ></Route> */}
          <Route
            path="/allStateReport"
            element={
              
                <NrjRequire>
                  <LzAllStateReport></LzAllStateReport>
                </NrjRequire>
              
            }
          ></Route>
          {/* <Route
            path="/spcb_frst"
            element={
              
                <NrjRequire>
                  <LzAnnlFrst></LzAnnlFrst>
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/spcb_auth"
            element={
              
                <NrjRequire>
                  <LzStt_Annlauth />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/spcb_dstr"
            element={
              
                <NrjRequire>
                  <LzStt_Annldstr />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/spcb_hcfcptv"
            element={
              
                <NrjRequire>
                  <LzStt_Annlcptv />
                </NrjRequire>
              
            }
          ></Route> */}

          <Route
            path="/annlRpt"
            element={
              
                <NrjRequire>
                  <LzAnnlRpt />
                  {/* <LzAllAnnlReport></LzAllAnnlReport> */}
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/annlMisc"
            element={
              
                <NrjRequire>
                  <LzAnnlMisc />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/annlEqp"
            element={
              
                <NrjRequire>
                  <LzAnnlEqp />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/annlWstStrg"
            element={
              
                <NrjRequire>
                  <LzAnnlWstStrg />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/annlWstWt"
            element={
              
                <NrjRequire>
                  <LzAnnlWstWt />
                </NrjRequire>
              
            }
          ></Route>
          <Route
            path="/hcfregister_indepent"
            element={
              
                <LzAuthorHcfRegiterIndpnt></LzAuthorHcfRegiterIndpnt>
              
            }
          ></Route>
          <Route
            path="/hcfconsent_list"
            element={
              
                <LzAuthorHcfConsentList></LzAuthorHcfConsentList>
              
            }
          ></Route>
          <Route
            path="/hcfconsent_report"
            element={
              
                <LzAuthorHcfConsentReport></LzAuthorHcfConsentReport>
              
            }
          ></Route>

        </Route>
      </Routes>
      </React.Suspense>
      {/* <Tooltip title="Help" arrow>
        <IconButton
          color="primary"
          onClick={openHelpPage}
          sx={{
            position: "fixed",
            bottom: 40,
            right: 40,
            backgroundColor: "#007BFF",
            "&:hover": {
              backgroundColor: "#0056b3", // Change color on hover
            },
          }}
        >
          <HelpOutlineIcon style={{ color: "white" }} />
        </IconButton>
      </Tooltip> */}
    </div>
  );
}

export default React.memo(App);

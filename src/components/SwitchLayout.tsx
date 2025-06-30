import React, { useEffect } from 'react'
import { useState } from 'react';

import CustomSidebar from '../app/MIS/customSidebar'
import NewSidebar from '../app/MIS/NewSidebar'

import Topbar from '../app/MIS/topbar';

import { getApplicationVersion } from '../utilities/utilities';
import { getLvl, getWho } from '../utilities/cpcb';
import moment from 'moment';
import './switchLayout.css'
import DashboardLayoutBasic from 'src/app/MIS/DashboardLayoutBasic';

import HomeIcon from "@mui/icons-material/Home";
import ReportIcon from "@mui/icons-material/Assessment";
import LockIcon from "@mui/icons-material/Lock";
import { useLocation } from "react-router-dom"; // Import useLocation
import RoomRoundedIcon from '@mui/icons-material/RoomRounded';

const SwitchLayout = () => {
    const [pageTitle, setPageTitles] = useState("Dashboard")
    const applicationOne: string = getApplicationVersion();
    const hideInState = getLvl() == 'STT' ? true : false;
    const hideInRgd = getLvl() == 'RGD' ? true : false;
    const hideInCbwtf = getLvl() == 'CPCB' ? false : true;
    const hideInHcf = getLvl() == 'HCF' ? true : false
    const hideInCpcb = getLvl() == 'CPCB' ? true : false
    const location = useLocation(); // Get current route
    const [is_expired, setIsExpired] = useState(false);
    
    useEffect(() => {
    const expiredValue = sessionStorage.getItem('isExpired');
    if (expiredValue !== null && expiredValue === '1') {
    setIsExpired(true);
    }
    }, []);

    const dt = moment(new Date()).format("DD-MMM-yyyy");

    const otherpage = [
        { path: "/spcb_frst", description: "State annual report: Details" },
        { path: "/spcb_cbwtf", description: "State annual report: CBWTF" },
        { path: "/spcb_auth", description: "State: Authorization Details " },
        { path: "/spcb_dstr", description: "State annual report:  District " },
        { path: "/spcb_hcfcptv", description: "State annual report: HCF Captive " },
        { path: "/annlRpt", description: "Annual report form : CBWTF" },
        { path: "/annlWstWt", description: "Annual report form : CBWTF" },
        { path: "/annlWstStrg", description: "Annual report form : CBWTF" },
        { path: "/annlEqp", description: "Annual report form : CBWTF" },
        { path: "/annlMisc", description: "Annual report form : CBWTF" },
    ]

    const statisticsArrMenu = [
        { name: 'Bags distribution (CBWTF wise)', hide: false, path: "/bagWtCntChrt10", description: "Bags distribution (CBWTF wise)",icon: <HomeIcon /> },
        { name: 'Scan by Value', hide: true, path: "/bagWtCntChrt", description: "View details based on scan values",icon: <HomeIcon /> },
        { name: 'Bags Distribution Below/above 30 Beds HCF', hide: false, path: "/bagWtCntChrt4", description: "Bags distribution below/above 30 beds HCF", icon: <HomeIcon /> },
        { name: 'Bags distribution wrt Hospitals (Below/Above 30 Beds)', hide: false, path: "/bagWtCntChrt2", description: "Explore bags list below/above 30 beds HCF" ,icon: <HomeIcon />},
        { name: 'Bags Distribution Based Within/Beyond 50 Mtr', hide: false, path: "/bagWtCntChrt5", description: "Bags distribution based within/beyond 50 mtr", icon: <HomeIcon /> },
        { name: 'Bags distribution wrt Distance (Within/Beyond 50 Mtr)', hide: false, path: "/bagWtCntChrt3", description: "Check the list of bags based on distance within/beyond 50 meters" ,icon: <HomeIcon />},
       
        // { name: 'Bags distribution wrt Distance (Below/Above 50 Mtr) /(Below 30 Beds) - Pie Chart', hide: false, path: "/bagWtCntChrt6", description: "Bags distribution based on distance below/above 50 meters based below 30 beds" },
        // { name: 'Bags distribution wrt Distance (Below/Above 50 Mtr) /(Above 30 Beds) - Pie Chart', hide: false, path: "/bagWtCntChrt7", description: "Bags distribution based on distance below/above 50 meters based On above 30 beds" },
        // { name: 'Bags distribution wrt Distance (Below/Above 50 Mtr) /(Below 30 Beds) - Bar Chart', hide: false, path: "/bagWtCntChrt8", description: "Bags distribution based on distance below/above 50 meters based below 30 beds" },
        // { name: 'Bags distribution wrt Distance (Below/Above 50 Mtr) /(Above 30 Beds) - Bar Chart', hide: false, path: "/bagWtCntChrt9", description: "Bags distribution based on distance below/above 50 meters based on above 30 beds" },
    ]

    const bagsReport = [
        { name: 'Live Waste Bag Collection', hide: true, path: "/trckbmw", description: "Real time waste collection (from midnight)",icon: <HomeIcon /> },
        { name: 'CBWTF (Waste Bag details)', hide: false, path: "/wstbgs", description: `CBWTF (waste bag details) on date: ${dt}` ,icon: <HomeIcon />},
        // { name: 'List of Correct Waste Bags Recived ', hide: false, path: "/HcfCrtList", description: "List of HCF who sent Correct Info" },
        { name: 'Bag Weight Dashboard ', hide: true, path: "/bagWtChrt", description: "Bag weight from bedded / non bedded hospital",icon: <HomeIcon /> },
        // { name: 'Bag Count Dashboard', hide: false, path: "/bagCntChrt", description: "Bag count from bedded / Non bedded Hospital" },
        // { name: 'HCF Visited/Non Visited', hide: false, path: "/hcfNonVisited", description: "Count of HCF's visited/non-visited" },
      
        { name: 'Bags Above 25 Kg', hide: false, path: "/bigBag", description: "List of waste bag above 25 Kg " ,icon: <HomeIcon />},
        { name: 'Waste Bag GeoLocation', hide: false, path: "/bagcntwthGeo", description: "Analyzing waste bag scanning: geolocation accuracy summary" ,icon: <HomeIcon />},
        { name: 'Waste Bag Serial Number', hide: false, path: "/serialNumber", description: "Summary of waste bags with and without serial number",icon: <HomeIcon /> },
        { name: 'Waste Bag Label No', hide: false, path: "/bagcntwthLbl", description: "Summary of waste bag with and without label count",icon: <HomeIcon /> },
        // { name: 'Waste Bag Odd Time Bags', hide: false, path: "/WstbgOdd", description: "Waste bag received at odd time i.e. from midnight to 8 AM  and after 8 PM" },
        { name: "CBWTFs daily bags count", hide: false, path: '/bagCbwtfScnBy', description: "Summary of all waste bags",icon: <HomeIcon /> },
        // { name: "CBWTF bags at plant", hide: false, path: '/bagFactory', description: "CBWTF's daily bags count at plant level" },
        //{ name: 'Waste bag', hide: false, path: "/hcf_wstbg", description: "Search waste bags" },
        //{ name: "CBWTF's Daily Bags Count", hide: false, path: '/bagCbwtf', description: "CBWTF's Daily Bags Count" },
        //{ name: 'SPCB: Waste bag information', hide: !hideInState, path: "/spcb_wasteInformation", description: "SPCB: Waste bag information" },
        //{ name: "HCF's daily bags count", hide: false, path: '/bagCbwtfHcf', description: "HCF's daily bags count" },
        { name: 'Waste bag by label', hide: false, path: "/wstbgid", description: "Search by waste bag label", icon: <HomeIcon /> },
        { name: 'Bag Count Per Hour', hide: false, path: "/bagCntPrGrid", description: "Bag count per hour" ,icon: <HomeIcon />},
        { name: 'Bag Count Per Hour (Chart View)', hide: false, path: "/bagCntPrHr", description: "Bag count per hour (chart view)",icon: <HomeIcon /> },

    ]

    const operations = [
        // { name: 'CBWTF Info', hide: false, path: "/displayDataCard", description: "CBWTF information" },
        { name: 'Daily report of waste of CBWTFs', hide: false, path: "/cbwtfdlyrep", description: "Daily report of waste of CBWTFs" ,icon: <HomeIcon />},
        // { name: 'Logins Based On File ', hide: false, path: "/loginFiles", description: "List of logins based on file" },
        // { name: 'Hospital Modified ', hide: false, path: "/hospitalModified", description: " list of hospital modified" },
        // { name: 'Hcf Dashboard', hide: false, path: "/bagHcfChrt", description: "HCF Dashboard" },
        { name: 'SPCB: details', hide: !hideInState, path: "/stt", description: "SPCB: Details",icon: <HomeIcon /> },
        //{ name: 'SPCB: Authorization Form', hide: !hideInState, path: "/spcb_authorizationDetails", description: "SPCB: HCF Authorization Information" },
        // { name: 'SPCB: HCF-CBWTF Details Form', hide: !hideInState, path: "/spcb_captiveInformation", description: "SPCB: HCF-CBWTF Details Form" },
        { name: 'All state boards', hide: true, path: "/sttall", description: "All state boards" ,icon: <HomeIcon />},
        // { name: 'CBWTF Annual report', hide: false, path: "/annlrpt", description: "Annual report form : CBWTF" },
        // { name: 'HCF Category Count (Chart View)', hide: false, path: "/hcfCtgCnt", description: "HCF Categories (Chart View and Report View" },
        // { name: 'HCF Category Count', hide: false, path: "/hcfCtgGrid", description: "HCF category count" },
        { name: 'CBWTF information', hide: false, path: "/displayDataCard", description: "CBWTF information",icon: <HomeIcon />},

        //{ name: 'HCF Visited', hide: false, path: "/hcfNmbrVisited", description: "Count of Visited HCF" },
        // { name: 'Hcf Acknowledgment', hide: false, path: "/acknowledgmentHcf", description: "Count of Hcf who's Acknowledgment Recevied And Not Recevied" },
        // { name: 'Monthly HCF Status', hide: false, path: "/monthlyStatus", description: "Monthly status of Health Care Facility" },
        // { name: 'Acivity on portal', hide: false, path: "/actvrpt", description: "CBWTF daily activity snapshot for a date" },
        //{ name: 'Bedded Approximately  Ratio', hide: false, path: '/beddedRatio', description: "Ratio with respect to actual and expected value" },
        // { name: 'Search HCF', hide: false, path: "/srch_hcf", description: "Search health care facility by CBWTF information" },
        // { name: 'Count HCF', hide: hideInState, path: "/rgdHcfSearch", description: "Count of HCF in regional directorate" },
        // { name: 'PNU ', hide: false, path: "/hcfWasteData", description: "Count of HCF visited by cbwtf" },
        { name: 'Daily waste collection report', hide: false, path: "/hcf_wstbg", description: "Waste collection report: daily detailed",icon: <HomeIcon /> },
        //{ name: 'Daily Report: Summary', hide: false, path: "/dailysummary", description: "Waste collection report: daily summary" },
        // { name: 'Daily Report: Route Wise', hide: false, path: "/dailySummaryRoute", description: "Daily summary: route wise" },
        // { name: 'Daily Summary: Plant (Comparison)', hide: false, path: "/dailysummaryfactoryComp", description: "Waste bags scanned at HCF / Plant (comparison)" },
        // { name: 'Daily Summary: Plant', hide: false, path: "/dailysummaryfactory", description: "Waste bags scanned at plant" },
        // { name: 'Daily Summary: Plant not scan', hide: false, path: "/dailysummaryfactorynotscn", description: "Waste bags not scanned at plant" },
        { name: 'Incorrect data waste bags CBWTF report', hide: false, path: "/bagcntwthincrt", description: "Incorrect waste  bags CBWTF report" ,icon: <HomeIcon />},

        { name: 'Map', hide: hideInRgd || hideInState, path: '/mapIndia', description: "Heat map of India",icon: <HomeIcon /> },
    ]

    const mapMenu: any[] = [
        //    { name: 'Vehicle Tracking', hide: false, path: "/bhuvanmap", description: "Real-Time Tracking of Biomedical Waste Collection Vehicles" },
        { name: ' Vehicle tracking', hide: false, path: "/vehicletrack_map", description: "Live GPS monitoring for biomedical waste management",icon:<RoomRoundedIcon/> },
    ]

    const annualFormReport = [
        { name: 'SPCB: Annual Report Form', hide: !hideInCpcb, path: "/spcb_authorizationAndWasteCp", description: "Annual report form : SPCB",icon: <HomeIcon /> },
        { name: 'SPCB: Annual Report Fill Form', hide: !hideInState, path: "/spcb_authorizationAndWaste", description: "Annual report form : SPCB" ,icon: <HomeIcon />},
        { name: 'HCF Annual Report', hide: !hideInCpcb, path: "/hcfAnnlRptcp", description: "HCF Annual report form" ,icon: <HomeIcon />},
        // { name: 'BMW-- Anuual Report', path: "/bmwtAnnulRpt", description: "BMW list" },
        // { name: 'Annual Form (CBWTF)', hide: false, path: "/allAnnlRpt", description: "Annual Report : CBWTF's" },
        // { name: 'State Annual Report', hide: hideInState, path: "/allStateReport", description: "State Annual Reports" },
        // { name: 'Annual Report', hide: false, path: "/annualRepA", description: "" },
        { name: 'CBWTF Annual Report', hide: !hideInCpcb, path: "/cbwtfAnnulrptcpcb", description: "CBWTF Annual report form"  ,icon: <HomeIcon />},
        { name: 'CBWTF & HCF consolidated data', hide: !hideInCpcb, path: "/spcb_authorizationAndconsolidate", description: "CBWTF & HCF consolidated data"  ,icon: <HomeIcon />},

    ]

    const sttAnnualRpt = [
    
        { name: 'SPCB Annual Report', hide: !hideInState, path: "/spcb_authorizationAndWaste", description: "SPCB Annual Report Form",icon: <HomeIcon />},
        { name: 'CBWTF Annual Report', hide: !hideInState, path: "/cbwtfAnnulrptcpcb", description: "CBWTF Annual report form", icon: <HomeIcon /> },
        { name: 'HCF Annual Report', hide: !hideInState, path: "/hcfAnnlRptcp", description: "HCF Annual report form",icon: <HomeIcon /> },
        { name: 'CBWTF & HCF consolidated data', hide: !hideInState, path: "/spcb_authorizationAndconsolidate", description: "CBWTF & HCF consolidated data" ,icon: <HomeIcon />},

    ]
    // const monthlyFormReport=[
    //     { name: 'SPCB: Monthly Report', hide: !hideInState , path: "/stt_monthlyReport", description: "Monthly report form : SPCB" },
    //     { name: 'SPCB: Monthly Report', hide: hideInState || hideInRgd || hideInRgd , path: "/spcb_sttMonthlyRptCpcb", description: "Monthly report form : SPCB" },
    //     { name: 'HCF: Monthly Report', hide: hideInRgd || hideInState, path: "/hcfMonthlyRptcp", description: "Monthly report form : HCF" },
    //     { name: 'CBWTF: Monthly Report', hide: hideInCbwtf || hideInRgd || hideInState, path: "/cbwtfMonthlyrptcpcb", description: "Monthly report form : CBWTF" },
    //     { name: 'HCF Monthly Report Show Form', hide:  !hideInHcf || hideInRgd || hideInState || hideInCpcb, path: "/hcfMonthlyhRptFromTab", description: "HCF Monthly Report Form" },
    // ]

    const rgdAnnualRpt = [
        { name: 'SPCB Annual Report', hide: !hideInRgd, path: "/spcb_authorizationAndWasteCp", description: "SPCB Annual Report Form",icon: <HomeIcon /> },
        { name: 'CBWTF Annual Report', hide: !hideInRgd, path: "/cbwtfAnnulrptcpcb", description: "CBWTF Annual report form" ,icon: <HomeIcon />},
        { name: 'HCF Annual Report', hide: !hideInRgd, path: "/hcfAnnlRptcp", description: "HCF Annual report form",icon: <HomeIcon /> },
      
        { name: 'CBWTF & HCF consolidated data', hide: !hideInRgd, path: "/spcb_authorizationAndconsolidate", description: "CBWTF & HCF consolidated data",icon: <HomeIcon /> },


    ]

    const showProfile = [
        // { name: 'Profile', hide: false, path: "/cntr", description: "Details Of Head Office",icon: <HomeIcon /> },
        { name: 'Change password RDs', hide: hideInState || hideInRgd || hideInHcf || is_expired, path: "/changePwdRgd", description: "Change password RDs" ,icon: <HomeIcon />},
        { name: 'Change password SPCBs/PCC', hide: hideInState || hideInRgd || hideInHcf || is_expired, path: "/changePwdSpcb", description: "Change password SPCBs/PCC" ,icon: <HomeIcon />},
        { name: 'Change password', hide: false, path: "/changePwd", description: "Change password" ,icon: <HomeIcon />},
        { name: 'Block user list', hide: hideInRgd || hideInState || hideInHcf || is_expired, path: "/HcfBlckusr", description: "Blocked user list",icon: <HomeIcon /> },
    ]

    const profileDetails = [
        { name: 'Profile', hide: is_expired, path: "/cntr", description: "Details of head office",icon: <HomeIcon /> },
    ]

    const DirectoryArr = [
        { name: 'Regional directorate', hide: hideInState || hideInRgd, path: "/rgndlst", description: "List of regional directorate",icon: <HomeIcon />   },
        { name: 'SPCB/PCC', hide: hideInState, path: "/sttdlst", description: "List of state pollution control board" ,icon: <HomeIcon />  },
    ]

    const monitoringCBWTF = [
        { name: 'CBWTFs details', hide: false, path: "/cbwtfdspl", description: "Registered CBWTFs details",icon: <HomeIcon />  },
        // { name: 'CBWTF Information', hide: false, path: "/displayDataCard", description: "CBWTF Information" },
        { name: 'CBWTF-HCF', hide: false, path: "/hcfcbwtf", description: "CBWTF-HCF List" ,icon: <HomeIcon /> },
    ]

    const monitoringHCF = [
        // { name: 'Search HCF', hide: false, path: "/cityHcfSearch", description: "Search HCF city wise" },
        { name: 'HCF list', hide: false, path: "/hcflstgrd", description: "List of health care facility",icon: <HomeIcon /> },
        { name: 'HCF registration with wrong SPCB code', hide: false, path: "/ListWrngHCFCode", description: "HCF trying for registration with wrong SPCB code",icon: <HomeIcon /> },
        // { name: 'Find HCF (By Mobile)', hide: false, path: "/Find_HCF", description: "Search HCF by Mobile no / E Mail" },
        { name: "HCF not registered under CBWTF", hide: false, path: "/hcfregister_indepent", description: "HCF list not registered under CBWTF" ,icon: <HomeIcon />},
        // { name: "HCF Consent List", hide: false, path: "/hcfconsent_list", description: "HCF Consent List" },
        // { name: "HCF Consent Report", hide: false, path: "/hcfconsent_report", description: "HCF Consent Details Report" }
        { name: 'HCF category Count (chart view)', hide: false, path: "/hcfCtgCnt", description: "HCF categories (chart view)" ,icon: <HomeIcon />},
        { name: 'HCF category Count (report view)', hide: false, path: "/hcfCtgGrid", description: "HCF category count (report view)" ,icon: <HomeIcon />},
    ]

    const hcfLoginMenu = [
        { name: 'HCF details', hide: false, path: "/hcfDetails", description: "HCF details",icon: <HomeIcon /> },
        { name: 'Fill annual report as per BMWM rules, 2016', hide: !hideInHcf || hideInRgd || hideInState || hideInCpcb, path: "/hcfAnnlRptFormTab", description: "HCF annual report form",icon: <HomeIcon /> },
        { name: 'Change password', hide: false, path: "/ChangePasswordHcf", description: "HCF change password",icon: <HomeIcon /> },
    ]

    const hcfMenu: any[] = [
        //    { name: 'Vehicle Tracking', hide: false, path: "/bhuvanmap", description: "Real-Time Tracking of Biomedical Waste Collection Vehicles" },
        { name: 'HCF details', hide: false, path: "/hcfDetails", description: "HCF details" },
        { name: 'HCF Annual Report', hide: !hideInHcf || hideInRgd || hideInState || hideInCpcb, path: "/hcfAnnlRptFormTab", description: "HCF annual report form" },
    ]

    // const cbwtfMenu: any[] = [
    //     { name: 'CBWTF Details', hide: false, path: "/cbwtfDtl", description: "CBWTF Details" },
    //     { name: 'CBWTF Annual Report', hide: false, path: "/cbwtfAnnulRpt", description: "CBWTF Annual Report Form" },
    //     { name: 'Change Password', hide: false, path: "/ChangePasswordCbwtf", description: "CBWTF  Change Password" },
    // ]

    const cbwtfMenu = [
        { name: "CBWTF details", hide: false, path: "/cbwtfDtl", description: "CBWTF details", icon: <HomeIcon /> },
        { name: "CBWTF annual report", hide: false, path: "/cbwtfAnnulRpt", description: "CBWTF Annual Report", icon: <ReportIcon /> },
        { name: "Change password", hide: false, path: "/ChangePasswordCbwtf", description: "CBWTF Change Password", icon: <LockIcon /> },
    ];
    
    const dashboard = [
        { name: "dashboard", hide: false, path: "/dashboardvb", description: "dashboard", icon: <HomeIcon /> },
      ];


    useEffect(() => {
        let pathName = location.pathname;
        const menus = [
            annualFormReport, sttAnnualRpt, rgdAnnualRpt, showProfile, bagsReport,profileDetails,
            DirectoryArr, monitoringHCF, monitoringCBWTF, statisticsArrMenu, otherpage,
            cbwtfMenu, dashboard, hcfMenu, hcfLoginMenu, mapMenu, operations
        ];

        for (const menu of menus) {
            const foundItem = menu.find((res: any) => res.path === pathName);
            if (foundItem) {
                setPageTitles(foundItem.description);
                break; // Stop checking once found
            }
        }
    }, [location.pathname]); 


    return (
      
        <DashboardLayoutBasic
          cbwtfMenu={cbwtfMenu}
          setPageTitles={pageTitle}
          dashboard={dashboard}
          monitoringCBWTF={monitoringCBWTF}
          monitoringHCF={monitoringHCF}
          statisticsArrMenu={statisticsArrMenu}
          bagsReport={bagsReport}
          operations={operations}
          sttAnnualRpt={sttAnnualRpt}
          rgdAnnualRpt={rgdAnnualRpt}
          annualFormReport={annualFormReport}
          DirectoryArr={DirectoryArr}
          showProfile={showProfile}
          mapMenu={mapMenu}
        hcfLoginMenu={hcfLoginMenu}
        profileDetails={profileDetails}
        />
     
      
      
    )
}

export default React.memo(SwitchLayout)

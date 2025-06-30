import React, { useReducer, useState, useEffect } from 'react'
import axios from 'axios'
import { useEffectOnce } from 'react-use'
import { useNavigate } from 'react-router'
import { getFldValue, useGetFldValue } from '../../../Hooks/useGetFldValue';
import utilities, { GetResponseLnx, GetResponseWnds, getCmpId, getUsrnm, postLinux, trimField } from '../../../utilities/utilities';
import { useToaster } from '../../../components/reusable/ToasterContext';
import { nrjAxiosRequestBio, nrjAxiosRequestLinux } from '../../../Hooks/useNrjAxios';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from '../../../components/reusable/Toaster';
import WtrRsSelect from '../../../components/reusable/nw/WtrRsSelect';
import NrjAgGrid from '../../../components/reusable/NrjAgGrid';
import { getLvl, getWho } from '../../../utilities/cpcb';
import { Button } from "@mui/material";

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
    SETCBWTFCOMBO: "setCbwtfCombo",
    SETSTATECOMBO: "setStateCombo",
    SETRGDCOMBO: "setRgdCombo",
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
    cbwtfCombo: "",
    stateCombo: "",
    rgdCombo: "",
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
    cbwtfCombo: string;
    stateCombo: string;
    rgdCombo: string;
};

type act = {
    type: string;
    payload: any;
};

interface SttDetails {
    stt: string;
}

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
        case ACTIONS.SETSTATECOMBO:
            newstate.stateCombo = action.payload;
            return newstate;
        case ACTIONS.SETCBWTFCOMBO:
            newstate.cbwtfCombo = action.payload;
            return newstate;
        case ACTIONS.SETRGDCOMBO:
            newstate.rgdCombo = action.payload;
            return newstate;
        case ACTIONS.SETGID:
            newstate.gid = action.payload;
            return newstate;
    }
};

// Header titles for the Excel sheet columns to be printed
const printExcelHeader = [
    "Name of the State/UT", // Name of the State or Union Territory
    "Total no. of authorised HCFs out of total HCFs", // Number of Health Care Facilities (HCFs) that are authorized
    "Total no. of unauthorised HCFs out of total HCF", // Number of unauthorized HCFs
    "Total no. of HCFs granted authorization in year...", // HCFs authorized during the current year
    "Total no. of HCFs in operation without Authorization in year...", // HCFs operating without authorization in the current year
    "No. of HCFs utilizing CBWTFs", // HCFs that use Common Biomedical Waste Treatment Facilities (CBWTFs)
    "Total Quantity of BMW generated (kg/day)", // Biomedical waste generated daily in kg
    "Total Quantity of BMW Treated and Disposed (kg/day)", // Treated/disposed BMW per day
    "No. of HCFs having Captive Treatment Facilities", // HCFs with their own treatment facilities
    "No of Captive incinerators operated by HCFs", // Incinerators run by HCFs
    "CBWTFs Operational", // Number of operational CBWTFs
    "CBWTFs under Construction", // CBWTFs still being constructed
    "Deep burial installed by HCF - HCF", // Deep burial facilities by HCFs
    "Deep burial installed by CBWTFs - CBWTFs", // Deep burial by CBWTFs
    "Total Biomedical waste treated by captive treatment facilities by HCF (kg/day)", // BMW treated daily by captive units
    "Total Biomedical waste treated by CBWTFs (kg/day)", // BMW treated daily by CBWTFs
    "Total no. of HCFs & CBWTFs violating BMWM Rules, 2016", // Non-compliant facilities
    "Total No. of show cause notices/Directions issued to defaulter HCFs/CBWTFs", // Legal actions taken
    "No. of CBWTFs that have installed OCEMS" // Online monitoring system installed
];

const keyOrder: string[] = [
    'sttname',            // 2. Name of the State/UT
    'totbdh',             // 3. Total no. of Bedded Health Care Facilities (HCFs)
    'totalNonBedded',     // 4. Total no. of Non-bedded Health Care Facilities (HCFs)
    'tothcf',             // 5. Total no. Health Care Facilities (HCFs)
    'totalNoBeds',        // 6. Total no. of beds (again totbdh in your return)
    'ttlauthapp',         // 7. Total number of authorized HCFs
    'ttlunauthapp',       // 8. Total number of unauthorized HCFs
    'ttlgrt',             // 9. Total number of HCFs granted authorization (in 2023)
    'ttlwth',             // 10. Total number of HCFs in operation without authorization (in 2023)
    'ttlwth1',            // 11. No. of HCFs utilizing CBWTFs
    'wstgnr',             // 12. Total Quantity of generated (kg/day)
    'wstgnrbd',           // Total Quantity of BMW Covid-19 waste generated (kg/day)
    'wsttrt',             // 13. Total Quantity of BMW Treated and Disposed (kg/day)
    'hcfcptv',            // 14. Number of HCFs having Captive Treatment Facilities
    'hcfcptvopr',         // 15. Number of Captive Incinerators Operated by HCFs
    'oprcbwtf',           // 16. CBWTFs Operational
    'cbwtfcns',           // 17. CBWTFs under Construction
    'deepburpits',        // 18. Deep burial installed by HCFs
    'cbwtfopr',           // 19. Deep burial installed by CBWTFs
    'cptvwst',            // 20. Total BMW treated by captive treatment facilities (kg/day)
    'wsttrt',             // 21. Total BMW treated and disposed by CBWTFs (kg/day) — again wsttrt
    'totalViolatingRule', // 22. Total no. of HCFs & CBWTFs violating BMWM Rules, 2016
    'totalShowCause',     // 23. Total no. of show cause notices/directions issued
    'ttlcoem'             // 24. Number of CBWTFs that have installed COEMS
  ];
  
  

// Width configuration for each column in the Excel sheet, defined using `wch` (width in characters)
const excelColWidth = [
    { wch: 8 },   // S. No.
    { wch: 30 },  // Name of the State/UT
    { wch: 40 },  // Authorized HCFs
    { wch: 40 },  // Unauthorized HCFs
    { wch: 40 },  // HCFs granted auth
    { wch: 40 },  // HCFs without auth
    { wch: 30 },  // Using CBWTFs
    { wch: 30 },  // BMW generated
    { wch: 35 },  // BMW treated and disposed
    { wch: 30 },  // Captive treatment
    { wch: 30 },  // Captive incinerators
    { wch: 25 },  // CBWTFs operational
    { wch: 30 },  // CBWTFs under construction
    { wch: 20 },  // Deep burial by HCF
    { wch: 20 },  // Deep burial by CBWTF
    { wch: 45 },  // BMW treated by HCF
    { wch: 45 },  // BMW treated by CBWTFs
    { wch: 40 },  // Violating facilities
    { wch: 50 },  // Notices/Directions issued
    { wch: 40 }   // OCEMS installed
];




const SttAnnlRptCpcb = () => {

    const [loadOnDemand, setLoadOnDemand] = useState("")
    useEffectOnce(() => {
        let value1 = new Date().getFullYear()
        setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}`)
    })

    const [year, setYear] = useState("");

    const [sttValue, setSttValue] = useState<string>("");
    const [rgdValue, setRgdValue] = useState<string>("");
    const [fltr, setFltr] = useState("")

    const hideInStt = getLvl() == "STT" ? true : false
    const hideInCpcb = getLvl() == "CPCB" ? true : false
    const hideInRgd = getLvl() == "RGD" ? true : false

    //#############Constants for the State and other functions
    const [state, dispatch] = useReducer(reducer, initialState);
    const [showMessage, setShowMessage] = useState<any>({ message: [] })
    const [isLoading, setIsLoading] = useState("");
    const [value, setValue] = useState(0);
    const navigate = useNavigate();
     const { showToaster, hideToaster } = useToaster();

    const reqFlds = [{}];
    const coldef = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        // { field: 'spcnodf', hide: false, width: 450, headerName: 'Name of nodal officer' },
        // { field: 'spcorg', hide: false, width: 450, headerName: 'Name of the organisation' },
        { field: 'sttname', hide: false, width: 500, headerName: 'Name of SPCB/PCC' },
    ];


    const GetDataValue = (data: string, fld: string) => {
        let vl: string = useGetFldValue(data, fld);
        return vl;
    }

    const GridLoaded = () => { };

    const [rowData,seTRowData]=useState([])
    const onRowSelected = (data: string) => {
    };

    useEffect(() => {
        let lvl = sessionStorage.getItem('lvl')
        if (lvl == 'RGD') {
            getSttlistForRgd()
        }
    }, [])

    function getDataOnBack(sessionData: any, rgd: any, stt: any) {
        setIsLoading("")
        if (Array.isArray(sessionData) && sessionData.length) {
            dispatch({ type: ACTIONS.NEWROWDATA, payload: sessionData });
            dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_yearid][${sessionData[0].dt_yearid}=dt_year][${sessionData[0].dt_year}=rgdid][${rgd?rgd:""}=rgd][${rgd?rgd:""}=sttid][${stt?stt:""}=stt][${stt?stt:""}` })

        }
        else {
            if (rgdValue || sttValue) {
                  showToaster(["No data received"],"error", );;
            }
        }

    }

    useEffectOnce(() => {
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
        const selectData: any = sessionStorage.getItem('spcbData');
        const selectRgd: any = sessionStorage.getItem('selectRgd');
        const selectStt: any = sessionStorage.getItem('selectStt');

        if (selectData || selectRgd || selectStt) {
            const data = JSON.parse(selectData)
            const rgd = JSON.parse(selectRgd)
            const stt = JSON.parse(selectStt)
            getDataOnBack(data, rgd, stt)
        } else {
            refetch()
            sessionStorage.removeItem('spcbData');
            sessionStorage.removeItem('selectRgd');
            sessionStorage.removeItem('selectStt');
            console.log('Session storage cleared on component mount');
        }
        const handleBeforeUnload = () => {
            sessionStorage.removeItem('spcbData');
            sessionStorage.removeItem('selectRgd');
            sessionStorage.removeItem('selectStt');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };

    })

    const onButtonClicked = (action: string, rw: any) => {
        if (action == "Details") {
            sessionStorage.setItem('sttAnnlRpt', JSON.stringify(rw));
            navigate("/spcb_authorizationAndWaste");
        }
    };
    const onChangeDts = (data: string) => {
        let fld: any = utilities(2, data, "");
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        if (fld == 'dt_yearid') {
            let dt = getFldValue(data, 'dt_yearid').split('|')[0]
            setYear(dt)
            setRgdValue("")
            setSttValue('')

             // 👉 Clear rowData when year is cleared
        // if (!dt || dt === "0") {
        //       // Clear ag-Grid data
            
        //       setTimeout(function () {
        //           dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        //       }, 800);
              
        // }
        }
    };

    const getDataStateForRgd = (Stt: any) => {
       let payload: any = {};
       if (Stt) {
         payload = postLinux(Stt, "sttrgd");
       } else {
         payload['cmpid'] = getCmpId() || "";
         payload['usrnm'] = getUsrnm() || "";
   
       }
       return nrjAxiosRequestBio('sttrgd', payload)
   
     };


     const getSttlistForRgd = async () => {
        let stt = getWho()
        if (stt) {
          try {
            let result = await getDataStateForRgd(stt)
            sttCombo(result);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
    
        }
    
    
      }
    const GetList = () => {
        // if (year == "") {
        //     showToaster( ["Please select a year"],"error");
        //     return;
        // }
        if (year) {
            let who = sessionStorage.getItem('who')
            let lvl = sessionStorage.getItem('lvl')
            if (lvl == 'STT') {
                let sttDetails = sessionStorage.getItem('sttDetails')
                if (sttDetails) {
                    const parsedSttDetails = JSON.parse(sttDetails) as SttDetails; // Parse and assert type
                    who = parsedSttDetails.stt; // Access the stt property
                }
            }
            if (rgdValue) {
                who = rgdValue;
                lvl = "RGD"
            }
            if (sttValue) {
                who = sttValue;
                lvl = "STT"
            }

            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
            setTimeout(function () {
                dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
            }, 800);
            let usrnm = getUsrnm();
            let cmpid = getCmpId();
            let payload: any = postLinux(lvl + '=' + who + "=" + year + "=state_ar=" + usrnm + '=' + cmpid, 'show_AR_filing')
            return nrjAxiosRequestLinux("show_AR_filing", payload);
        }
    }





    function trimField(dataArray: any[], field: string) {
        return dataArray.map((item: any) => ({
            ...item,
            [field]: item[field]?.trim() || ""
        }));
    }
    const ShowDataForState = (dataSvdState: any) => {
        setIsLoading("")
        let dt: any = GetResponseLnx(dataSvdState);
        if (Array.isArray(dt) && dt.length >= 1) {

 
             // Grouped totals
            const groupedData: {
                [key: string]: {
                    grandTotal: number,
                    totalViolatingRule: number,
                    totalShowCause: number,
                    totalBeds: number; // ✅ Include this
                }
            } = {};

            // Group and calculate
            dt.forEach(item => {
                const stateName = item.sttname || 'Unknown State';
                if (!groupedData[stateName]) {
                    groupedData[stateName] = {
                        grandTotal: 0,
                        totalViolatingRule: 0,
                        totalShowCause: 0,
                        totalBeds: 0 // 👈 New field
                    };
                }

                const totcld = parseFloat(item.totcld) || 0;
                const totvet = parseFloat(item.totvet) || 0;
                const totanh = parseFloat(item.totanh) || 0;
                const totpth = parseFloat(item.totpth) || 0;
                const totbld = parseFloat(item.totbld) || 0;
                const totcln = parseFloat(item.totcln) || 0;
                const totrsh = parseFloat(item.totrsh) || 0;
                const totaysh = parseFloat(item.totaysh) || 0;
                const totbdh = parseFloat(item.totbdh) || 0; // 👈 Include this for total beds

                const total = totcld + totvet + totanh + totpth + totbld + totcln + totrsh + totaysh;

                const totalNoBeds = totbdh + total; // 👈 Total number of beds


                const vlthcf = parseFloat(item.vlthcf) || 0;
                const vltcbtwf = parseFloat(item.vltcbtwf) || 0;
                const shwhcf = parseFloat(item.shwhcf) || 0;
                const shwcbtwf = parseFloat(item.shwcbtwf) || 0;

                groupedData[stateName].grandTotal += total;
                groupedData[stateName].totalViolatingRule += (vlthcf + vltcbtwf);
                groupedData[stateName].totalShowCause += (shwhcf + shwcbtwf);
                groupedData[stateName].totalBeds += totalNoBeds; // 👈 Accumulate total beds
            });

            // If you want to attach group totals back to each row (optional)
            const updatedData = dt.map(obj => ({
                ...obj,
                totalNonBedded: groupedData[obj.sttname || 'Unknown State'].grandTotal,
                totalViolatingRule: groupedData[obj.sttname || 'Unknown State'].totalViolatingRule,
                totalShowCause: groupedData[obj.sttname || 'Unknown State'].totalShowCause,
                totalNoBeds: groupedData[obj.sttname || 'Unknown State'].totalBeds // 👈 Add to each row
            }));

            console.log(updatedData);
            //  ()
         
            dt[0].cbwtfData = trimField(dt[0].cbwtfData, "contcbwtf");

            // Sort the cbwtfData array based on contcbwtf
            dt[0].cbwtfData.sort((a:any, b:any) => a.contcbwtf.localeCompare(b.contcbwtf));
            setTimeout(function () {
                dispatch({ type: ACTIONS.NEWROWDATA, payload: updatedData });
            }, 800);
            sessionStorage.setItem('spcbData', JSON.stringify(updatedData));
            if (rgdValue || sttValue) {
                sessionStorage.setItem('selectRgd', JSON.stringify(rgdValue));
                sessionStorage.setItem('selectStt', JSON.stringify(sttValue));
            }
        }
        else {
            if (rgdValue || sttValue) {
                showToaster(["No data received"],"error", );
            }
        }
    };


    const { data: dataSvdState, refetch: refetch } = useQuery({
        queryKey: ["svOldFormHcf"],
        queryFn: GetList,
        enabled: true,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowDataForState,
    });

    function getListOnclick() {
        refetch()
    }


    // useEffectOnce(() => {
    //     refetch()
    //     setShowMessage({ message: [] })
    // })



    const GetDataRgd = () => {
        let payload: any = {};
        return nrjAxiosRequestBio('rgdlst', payload);
    };

    const rgdCombo = (datastt: any) => {
        if (datastt && datastt.status == 200 && datastt.data) {
            let i: number = 0;
            let strCmbo: string = "";
            let dt: any = GetResponseLnx(datastt);
            let ary: any = dt.data;
            while (Array.isArray(ary) && i < ary.length) {
                if (strCmbo) {
                    strCmbo += "$^";
                }
                strCmbo += "id][" + ary[i]["drpdwn"] + "=";
                strCmbo += "txt][" + ary[i]["drpdwn"];
                i += 1;
            }
            dispatch({ type: ACTIONS.SETRGDCOMBO, payload: strCmbo });
            return;
        }
    };


    const { data: datac, refetch: fetchRgd } = useQuery({
        queryKey: ["GetDataRgd"],
        queryFn: GetDataRgd,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: rgdCombo,
    });

    useEffectOnce(() => {
        fetchRgd();
    })



    const getDataState = () => {

        let lvl = sessionStorage.getItem('lvl')
        if (lvl !== 'RGD') {
            let payload: any = {};
            if (rgdValue) {
                payload = postLinux(rgdValue, "sttrgd");
            } else {
                payload['cmpid'] = getCmpId() || "";
                payload['usrnm'] = getUsrnm() || "";

            }
            return nrjAxiosRequestBio('sttrgd', payload)

        }


    };

    const sttCombo = (datastt: any) => {
        if (datastt && datastt.status == 200 && datastt.data) {
            let i: number = 0;
            let sttCombo: string = "";
            let dt: string = GetResponseWnds(datastt);
            let ary: any = datastt.data.data;
            let uniqueAry = new Map();
            ary.forEach((element: any) => {
                uniqueAry.set(element.fltr, element);
            });

            uniqueAry.forEach((value: any, keys: any) => {
                if (sttCombo) {
                    sttCombo += "$^";
                }
                sttCombo += "id][" + value["fltr"] + "=";
                sttCombo += "txt][" + value["drpdwn"];
            })

            while (i < uniqueAry?.entries.length) {

                i += 1;
            }
            dispatch({ type: ACTIONS.SETSTATECOMBO, payload: sttCombo });
            return;
        }
    };

    const { data: data2, refetch: refetchState } = useQuery({
        queryKey: ["stateGet", rgdValue],
        queryFn: getDataState,
        enabled: true,
        retry: false,
        staleTime: 200,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: sttCombo
    });

    const onChangeRgd = (data: string) => {
        // rgdid
        setRgdValue(getFldValue(data, 'rgdid').split('|')[0])
        setSttValue('')
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const onChangeStt = (data: string) => {
        // rgdid
        setSttValue(getFldValue(data, 'sttid').split('|')[0])
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };


    return (
        <>
            <div className="bg-white p-1">
                <div className="font-semibold text-lg text-center">{isLoading}</div>
                {showMessage && showMessage.message.length != 0 ? <div className="py-2">
                    <Toaster data={showMessage} className={''}></Toaster>
                </div> : <></>}

                {/* <div className=" mt-4 grid grid-cols-4 gap-x-8 gap-y-4 my-4 pt-4">
                    <WtrRsSelect
                        Label="Select year"
                        speaker="Select year"
                        fldName="dt_yearid"
                        idText="txtdt_yearid"
                        displayFormat={"1"}
                        onChange={onChangeDts}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        allwZero={"0"}
                        fnctCall={false}
                        dbCon=""
                        typr=""
                        loadOnDemand={loadOnDemand}
                        dllName={""}
                        fnctName={""}
                        parms={""}
                        allwSrch={true}
                        delayClose={1000}
                    ></WtrRsSelect>
                    {hideInCpcb && <WtrRsSelect
                        Label="Regional Directorate"
                        fldName="rgdid"
                        idText="txtrgdid"
                        onChange={onChangeRgd}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        loadOnDemand={state.rgdCombo}
                        allwZero={"0"}
                        fnctCall={false}
                        dbCon={"1"}
                        typr={"1"}
                        dllName={""}
                        fnctName={""}
                        parms={'0'}
                        allwSrch={true}
                        delayClose={1000}
                        placement="bottom"
                        displayFormat="1"
                    ></WtrRsSelect>}

                    {(hideInCpcb || hideInRgd) && <WtrRsSelect
                        Label="State/UT"
                        fldName="sttid"
                        idText="txtsttid"
                        onChange={onChangeStt}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        loadOnDemand={state.stateCombo}
                        allwZero={"0"}
                        fnctCall={true}
                        dbCon={"1"}
                        typr={"1"}
                        dllName={""}
                        fnctName={""}
                        parms={'0'}
                        allwSrch={true}
                        delayClose={1000}
                        placement="bottom"
                        displayFormat="1"
                    ></WtrRsSelect>}

                    <Button
                        size="medium"
                        style={{ backgroundColor: "#3490dc", color: '#fff' }}
                        variant="contained"
                        color="success"
                        onClick={getListOnclick}
                        className="me-3"
                    >
                        Get list
                    </Button>

                </div> */}

                <div className="mt-4 flex flex-wrap items-center gap-4 p-1">
                    <WtrRsSelect
                        Label="Select year"
                        speaker="Select year"
                        fldName="dt_yearid"
                        idText="txtdt_yearid"
                        displayFormat={"1"}
                        onChange={onChangeDts}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        allwZero={"0"}
                        fnctCall={false}
                        dbCon=""
                        typr=""
                        loadOnDemand={loadOnDemand}
                        dllName={""}
                        fnctName={""}
                        parms={""}
                        allwSrch={true}
                        delayClose={1000}

                    />
{/* 
                    {hideInCpcb && (
                        <WtrRsSelect
                            Label="Regional directorate"
                            fldName="rgdid"
                            idText="txtrgdid"
                            onChange={onChangeRgd}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            loadOnDemand={state.rgdCombo}
                            allwZero={"0"}
                            fnctCall={false}
                            dbCon={"1"}
                            typr={"1"}
                            dllName={""}
                            fnctName={""}
                            parms={"0"}
                            allwSrch={true}
                            delayClose={1000}
                            placement="bottom"
                            displayFormat="1"
                        />
                    )} */}

                    {(hideInCpcb || hideInRgd) && (
                        <WtrRsSelect
                            Label="State/UT"
                            fldName="sttid"
                            idText="txtsttid"
                            onChange={onChangeStt}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            loadOnDemand={state.stateCombo}
                            allwZero={"0"}
                            fnctCall={true}
                            dbCon={"1"}
                            typr={"1"}
                            dllName={""}
                            fnctName={""}
                            parms={"0"}
                            allwSrch={true}
                            delayClose={1000}
                            placement="bottom"
                            displayFormat="1"
                        />
                    )}

                    <Button
                        size="medium"
                        style={{ backgroundColor: "#3490dc", color: "#fff", textTransform: "none", }}
                        variant="contained"
                        color="success"
                        onClick={getListOnclick}
                        className="min-w-[150px] flex-shrink-0 mt-4"
                    >
                        Get list
                    </Button>
                </div>

            </div>

            <div className="flex justify-center bg-gray-100 mt-2">

                <NrjAgGrid
                    // Callback triggered once the grid is fully initialized
                    onGridLoaded={GridLoaded}
                    // Callback when a row is selected in the grid
                    onRowSelected={onRowSelected}
                    // Callback when a button (e.g., in a row) is clicked
                    onButtonClicked={onButtonClicked}
                    // Text for the row-level action button
                    showDataButton={"Details"}
                    // Column definitions for the ag-Grid
                    colDef={coldef}
                    // API call string or URL (empty in this case, assuming data is passed directly)
                    apiCall={""}
                    // The data to display in the grid rows
                    rowData={rowData}
                    // Text or flag for delete button functionality (disabled here with empty string)
                    deleteButton={""}
                    // New row data to be inserted into the grid
                    newRowData={state.nwRow}
                    // A trigger to re-render or refresh the grid, typically a boolean or timestamp
                    trigger={state.triggerG}
                    // Show pagination controls in the grid
                    showPagination={true}
                    // Enable tooltips on grid cells
                    showTooltips={true}
                    // CSS classes for grid styling (using ag-Grid Alpine Blue theme)
                    className="ag-theme-alpine-blue ag-theme-alpine"
                    // User level or role used to determine grid permissions or view
                    lvl={getLvl()}
                    // Identifies who is accessing or using the grid
                    who={getWho()}
                    // Default column to sort by (in this case, "clr")
                    sortBy={'clr'}
                    // Enable export to Excel button
                    showExportExcel={true}
                    // Headers to use when exporting to Excel
                    printExcelHeader={printExcelHeader}
                    // Column widths for Excel export
                    exceColWidth={excelColWidth}  // Note: likely a typo — should be `excelColWidth`
                    // Order of keys used for mapping data during Excel export
                    KeyOrder={keyOrder}
                />

            </div>
        </>

    );
}; export default React.memo(SttAnnlRptCpcb);
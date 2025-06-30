import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { validForm } from '../../Hooks/validForm'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, GetResponseWnds, capitalizeTerms, createGetApi, dataStr_ToArray, getCntWtInNumbers, getStateFullForm, postLinux, svLnxSrvr } from '../../utilities/utilities'
import { nrjAxios, nrjAxiosRequestBio } from '../../Hooks/useNrjAxios';
import Button from '@mui/material/Button';
import IndiaHeatMap from './IndiaHeatMap';
import { log } from 'console';
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
            newstate.gid = ""
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
            newstate.triggerG += 10;
            return newstate;
        case ACTIONS.RANDOM:
            newstate.rndm += 1;
            return newstate;
        case ACTIONS.FORM_DATA:
            let dtaF: string = "";
            let fldNF: any = utilities(2, action.payload, "");
            if (newstate.textDts) {
                dtaF = newstate.textDts + "=";
                let d: any = utilities(1, dtaF, fldNF);
                if (d) {
                    dtaF = d;
                } else {
                    dtaF = "";
                }
            }
            dtaF += action.payload;
            newstate.textDts = dtaF;
            return newstate;
        case ACTIONS.SETFORM_DATA:
            newstate.frmData = action.payload;
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



const IndiaHeatMapValues = (props: any) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const [selectedButton, setSelectedButton] = useState("Waste bags weight");
    const [regionData, setRegionData] = useState<any>({});
    const [startColor, setStartColor] = useState("#e29999");
    const [endColor, setEndColor] = useState("#c42121");
    const [api, setApi] = useState<any>(createGetApi(
        "db=nodb|dll=xrydll|fnct=a216", "0"))
    const [var1, setVar1] = useState(1)
    const buttonNames = [
        "Waste bags weight",
        "Waste bags count",
    ];
    const handleButtonClick = (buttonName: any) => {

        setRegionData([]);
        setStartColor("");
        setEndColor("");
        let gid: string = state.gid;
        if (!gid) {
            let gd: any = utilities(3, "", "");
            gid = gd;
            dispatch({ type: ACTIONS.SETGID, payload: gid });
        }
        setVar1(var1 + 1);

        setSelectedButton(buttonName);
        if (buttonName === 'Waste bags weight') {
            setApi("weight");
        } else if (buttonName === 'Waste bags count') {
            setApi("count");
        }
        setStartColor("#e29999");
        setEndColor("#c42121")
        // return nrjAxios({ apiCall: api });

    };
    const callApi = (api: string, var1: number) => {
        const lvl: string = "CPCB";
        const who: string = 'ALL'
        const payload: any = postLinux("ALL" + '=' + lvl + '=' + who + '=STT', 'listwstdata2');
        return nrjAxiosRequestBio("dshbrd", payload);
    }


    const { showToaster, hideToaster } = useToaster();

    function showList(data: any) {
        let dt: any = GetResponseLnx(data);
        let ary: any[] = []
        if (dt && Array.isArray(dt) && dt.length) {
            let tempArray: any = helperFunction(dt)
            let tempFinal: any = []

            tempArray.forEach((res: any) => {
                tempFinal.push({
                    ...res,
                    fltr: String(res.fltr).toUpperCase(),
                    color: String(res.fltr).toUpperCase(),
                    weight: Number(res.bluwt) + Number(res.redwt) + Number(res.whtwt) + Number(res.ylwwt) + Number(res.cytwt),
                    bags: Number(res.blucnt) + Number(res.redcnt) + Number(res.whtcnt) + Number(res.ylwcnt) + Number(res.cytcnt)
                })
            })
            const transformedData: any = {};


            if (selectedButton === "Waste bags count") {
                tempFinal.forEach((item: any) => {
                    const stateName = getStateFullForm(item.color);
                    const value = parseInt(item.bags);
                    transformedData[stateName] = {
                        value,
                    };
                });
            } else {
                tempFinal.forEach((item: any) => {
                    const stateName = getStateFullForm(item.color);
                    const value = parseInt(item.weight);
                    transformedData[stateName] = {
                        value,
                    };
                });
            }
            let dtt = {
                "Goa": {
                    "value": 856
                },
                "Chhattisgarh": {
                    "value": 771
                },
                "Telangana": {
                    "value": 7421
                },
                "Haryana": {
                    "value": 9126
                },
                "Delhi": {
                    "value": 8130
                },
                "Uttar Pradesh": {
                    "value": 2486
                },
                "Maharashtra": {
                    "value": 12354
                },
                "Uttarakhand": {
                    "value": 1154
                },
                "Tamil Nadu": {
                    "value": 624
                },
                "Sikkim": {
                    "value": 454
                },
                "Punjab": {
                    "value": 354
                },
                "Rajasthan": {
                    "value": 154
                },
                "Odisha": {
                    "value": 1354
                },
                "Madhya Pradesh": {
                    "value": 554
                },
                "Jharkhand": {
                    "value": 235
                },
                "Tripura": {
                    "value": 25
                },
                "Manipur": {
                    "value": 235
                }
            }
            setRegionData(transformedData);
        }
        else {
            setRegionData([])
            showToaster(['Did not find any data for detailed CBWTF tab'], 'error');
            setTimeout(() => {
                showToaster([], 'success');
            }, 5000)
        }
        return 1;

    }

    function helperFunction(dt: any) {
        let ary: any[] = dt
        let tempArray = new Map();
        ary.forEach((obj: any) => {
            if (obj.scnby === 'fct') {
                const key = obj.fltr.toLowerCase();
                let data = getCntWtInNumbers(obj);
                if (tempArray.has(key)) {
                    tempArray.set(key,
                        {
                            ...obj,
                            redwt: tempArray.get(key).redwt + data.redwt,
                            bluwt: tempArray.get(key).bluwt + data.bluwt,
                            ylwwt: tempArray.get(key).ylwwt + data.ylwwt,
                            whtwt: tempArray.get(key).whtwt + data.whtwt,
                            cytwt: tempArray.get(key).cytwt + data.cytwt,
                            blucnt: tempArray.get(key).blucnt + data.blucnt,
                            redcnt: tempArray.get(key).redcnt + data.redcnt,
                            ylwcnt: tempArray.get(key).ylwcnt + data.ylwcnt,
                            whtcnt: tempArray.get(key).whtcnt + data.whtcnt,
                            cytcnt: tempArray.get(key).cytcnt + data.cytcnt,
                        }
                    )
                }
                else {
                    tempArray.set(key,
                        {
                            ...obj,
                            redwt: data.redwt,
                            bluwt: data.bluwt,
                            ylwwt: data.ylwwt,
                            whtwt: data.whtwt,
                            cytwt: data.cytwt,
                            blucnt: data.blucnt,
                            redcnt: data.redcnt,
                            ylwcnt: data.ylwcnt,
                            whtcnt: data.whtcnt,
                            cytcnt: data.cytcnt,
                        }
                    )
                }
            }
        });
        return tempArray;
    }
    const { data: data, refetch } = useQuery({
        queryKey: ["maplist", api, var1],
        queryFn: () => callApi(api, var1),
        enabled: true,
        retry: false,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: showList,
    });
    console.log("selectedButton : ", regionData)

   
    return (

        <>
            <div className="flex border-bottom border-secondary">
                {buttonNames.map((buttonName) => (
                    <div key={buttonName}>
                        <Button
                            size="small"
                            style={{
                                backgroundColor: selectedButton === buttonName ? "#00A300" : "#f3f3f3",
                                color: "#000000",
                                border: "solid 1px #A4A3A3",
                                marginRight: '10px',
                                textTransform: "none", 
                            }}
                            variant="contained"
                            color="success"
                            onClick={() => handleButtonClick(buttonName)}
                            className={`mx-3 'bg-lime-600 text-white' : ""}`}
                        >
                            {capitalizeTerms(buttonName)}
                        </Button>
                    </div>
                ))}
            </div>
           

            <div className="bg-white">
                <IndiaHeatMap
                    title={selectedButton}
                    regionData={regionData}
                    startColor={startColor}
                    endColor={endColor}
                    heatNameTitle={selectedButton}
                    defaultColor="#f4cccc"
                />
            </div>
        </>

    );
};

export default React.memo(IndiaHeatMapValues);
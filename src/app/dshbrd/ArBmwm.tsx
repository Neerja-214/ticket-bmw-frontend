import React, { useReducer, useEffect, useState } from 'react'
import utilities, { GetResponseLnx, createGetApi, dataStr_ToArray, dateCheck30Days, getApplicationVersion, getCntWtInNumbers, getStateAbbreviation, postLinux, showPrint, svLnxSrvr } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";
import NrjAgGrid from '../../components/reusable/NrjAgGrid'
import { useNavigate } from "react-router-dom";
import NrjRsDt from "../../components/reusable/NrjRsDt";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { nrjAxios, nrjAxiosRequestBio } from "../../Hooks/useNrjAxios";
import { Toaster } from '../../components/reusable/Toaster';
import { getLvl, getWho } from '../../utilities/cpcb';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import { useToaster } from '../../components/reusable/ToasterContext';
import moment from "moment";

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
    mainId: 0,
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


const ArBmwm = (props: any) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState("")
    const [state, dispatch] = useReducer(reducer, initialState);
    const [lvl, setLvl] = useState(getLvl());
    const [who, setWho] = useState(getWho());
    const [total, setTotal] = useState(0)
    const reqFlds = [{ fld: 'dt_rpt', msg: 'Select the Date', chck: 'length' }];

    const coldef = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'cbwtfnm', hide: false, width: 200, headerName: 'Name of the State/UT', tooltipField: 'cbwtfnm'},
        { field: 'ttlbed', hide: false, width: 100, headerName: 'Total no. of Bedded Health Care Facilities (HCF)',headerClass: 'custom-header-class ag-header' },
        { field: 'ttlnonbd', hide: false, width: 100, headerName: 'Total no. of Non-Bedded Health Care Facilities (HCF)',headerClass: 'custom-header-class ag-header' },
        { field: 'ttlhcf', hide: false, width: 100, headerName: 'Total no. of Health Care Facilities (HCF)',headerClass: 'custom-header-class ag-header' },
        { field: 'ttlbd', hide: false, width: 100, headerName: 'Total no. of Beds',headerClass: 'custom-header-class ag-header' },
        {
            headerName: 'Authorization Status',
            children: [
              { field: 'redcnt', hide: false, width: 90, headerName: 'Total No. of HCF applied for Authorization', cellStyle: { color: 'black', 'background-color': '#ffcccb' },headerClass: 'custom-header-class ag-header' },
              { field: 'redcnt', hide: false, width: 90, headerName: 'Total No. of HCF granted for Authorization', cellStyle: { color: 'black', 'background-color': '#ffcccb' }, headerClass: 'custom-header-class ag-header' },
              { field: 'redcnt', hide: false, width: 90, headerName: 'Total No. of HCF in Operation without Authorization', cellStyle: { color: 'black', 'background-color': '#ffcccb' },headerClass: 'custom-header-class ag-header' },
            ],
          },


    ];

    const printExcelHeader = ["Cbwtf ", "Total Weight", "Total Count"]
    const KeyOrder: string[] = ['cbwtfnm', 'ttlwt', 'ttlcnt']
    const excelColWidth = [{ wch: 50 }, { wch: 30 }, { wch: 30 }]


    const coldefPrint = [
        { field: 'id', hide: true, width: 0, headerName: '' },
        { field: 'cbwtfnm', hide: false, width: 500, headerName: 'Name of CBWTF', tooltipField: 'cbwtfnm', },
        { field: 'ttlwt', hide: false, width: 350, headerName: 'Total Weight' },
        { field: 'ttlcnt', hide: false, width: 350, headerName: 'Total Count' },
    ]
    const prependContent = [
        [
          {
            data: {
              value: ' ',
              type: "String",
            },
          },
          {
            data: {
              value: 'CBWTF daily bags count at plant level',
              type: "String",
            },
            mergeAcross: 5
          },
        ],
        [
          {
            data: {
              value: ' ',
              type: "String",
            },
            mergeAcross: 5
          },
          {
            data: {
              value: 'Level: ' + getLvl() == "CPCB" ? getWho() : getLvl() == "STT" ? "SPCB " + getWho() : getWho() + " " + "REGIONAL DIRECTORATE",
              type: "String",
            },
            mergeAcross: 5
          },
        ],
        [
          {
            data: {
              value: ' ',
              type: "String",
            },
            mergeAcross: 5
          },
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

    const [showMessage, setShowMessage] = useState<any>({ message: [] });

    const rowData: any[] = []
    const onRowSelected = (data: string) => { }
    const GridLoaded = () => { }
    const onButtonClicked = (action: string, rw: any) => { }

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        })
    };
    const { showToaster, hideToaster } = useToaster();
    const svClick = () => {
        setTotal(0)
        let api: string = state.textDts;
        const dt_rpt = getFldValue(api, "dt_rpt");
        const dt_to = getFldValue(api, 'dt_to');
        let msg: any = dateCheck30Days(dt_rpt, dt_to)
        showToaster(msg, 'error');
        if (msg && msg[0]) {
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQDONE, payload: "" });
            }, 5000);
            return;
        }
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        })
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });
        getList().then((res: any) => {
            ShowData(res);
        })
    };
    // const [currentLevel, setCurrentLevel] = useState('');
    // const [drilllvlState, setDrillLvlState] = useState('');

    const getList = () => {
        setIsLoading("Loading data...");
        let dt = state.textDts
        const frmdt = UseMomentDateNmb(getFldValue(dt, "dt_rpt"));
        const todt = UseMomentDateNmb(getFldValue(dt, 'dt_to'));
        const lvl: string = "ALLCBWTF"
        const lgntyp: string = getLvl();
        const who: string = getWho();
        let gid: any = utilities(3, "", "")
        let gd: string = gid
        dispatch({ type: ACTIONS.SETGID, payload: gd })
        // let api: string = createGetApi("db=nodb|dll=xrydll|fnct=a251", dt_rpt + '=' + dt_to + '=' + lvl + '=' + who + '=' + '2');
        // return nrjAxios({ apiCall: api })
        let payload: any = postLinux(lvl + '=' + lgntyp + '=' + who + '=' + frmdt + '=' + todt, 'dummy');
        return nrjAxiosRequestBio("dummy", payload);
    }

    const ShowData = (dataSvd: any) => {
        setIsLoading("")
        dispatch({ type: ACTIONS.DISABLE, payload: 2 });
        let ary: any = [];
        let dt: any = GetResponseLnx(dataSvd);
        if (dt && Array.isArray(dt) && dt.length) {
            let tempArray: any = helperFunction(dt)
            let tempFinal: any = []

            tempArray.forEach((res: any) => {
                tempFinal.push({
                    ...res,
                    ttlwt: Number(res.bluwt) + Number(res.redwt) + Number(res.whtwt) + Number(res.ylwwt) + Number(res.cytwt),
                    ttlcnt: Number(res.blucnt) + Number(res.redcnt) + Number(res.whtcnt) + Number(res.ylwcnt) + Number(res.cytcnt)
                })
            })

            ary = tempFinal.map((res: any) => {
                return {
                    ...res,
                    redwt: Number(res.redwt).toFixed(3),
                    bluwt: Number(res.bluwt).toFixed(3),
                    ylwwt: Number(res.ylwwt).toFixed(3),
                    whtwt: Number(res.whtwt).toFixed(3),
                    cytwt: Number(res.cytwt).toFixed(3),
                }
            });

        }else{
           showToaster(["No data received"], "error");
        }
        dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
    };




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




    return (
        <>
            <div className="">
                <div className="bg-white p-1 pr-2 my-3 pb-2 rounded-lg" style={{ boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.12)' }}>
                    <div className="">

                        <div className="flex ">
                            <div className='mr-2 px-4'>
                                <NrjRsDt
                                    format="dd-MMM-yyyy"
                                    fldName="dt_rpt"
                                    displayFormat="1"
                                    idText="txtdt_rpt"
                                    size="lg"
                                    Label="From date"
                                    selectedValue={state.frmData}
                                    onChange={onChangeDts}
                                    speaker={"Select"}
                                ></NrjRsDt>
                            </div>

                            <div className='mr-2 px-4'>
                                <NrjRsDt
                                    format="dd-MMM-yyyy"
                                    fldName="dt_to"
                                    displayFormat="1"
                                    idText="txtdt_rpt"
                                    size="lg"
                                    Label="To date"
                                    selectedValue={state.frmData}
                                    onChange={onChangeDts}
                                    speaker={"Select"}
                                ></NrjRsDt>
                            </div>
                            <div className='flex mt-10'>
                                <Button
                                    size="medium"
                                    style={{ backgroundColor: "#3490dc", color: '#fff',textTransform: "none", }}
                                    variant="contained"
                                    color="success"
                                    onClick={svClick}
                                    className="me-3"
                                >
                                    Get list
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shadow rounded-lg bg-white p-3">
                    <div className=" font-semibold text-lg text-center ">{isLoading}</div>
                    {showMessage && showMessage.message.length != 0 ? (
                        <div className="py-2">
                            <Toaster data={showMessage} className={""}></Toaster>
                        </div>) : (<></>)}
                    <div>
                        <NrjAgGrid
                            onButtonClicked={onButtonClicked}
                            onGridLoaded={GridLoaded}
                            onRowSelected={onRowSelected}
                            colDef={coldef}
                            apiCall={""}
                            rowData={rowData}
                            deleteButton={""}
                            deleteFldNm={""}
                            newRowData={state.nwRow}
                            trigger={state.triggerG}
                            className="ag-theme-alpine-blue ag-theme-alpine"
                            showExport={true}
                            prependContent={[]}
                            KeyOrder={KeyOrder}
                            lvl={getLvl()}
                            who={getWho()}
                            pageTitle={"CBWTF's daily bags count at plant level"}
                            sortBy={'cbwtfnm'}
                            printExcelHeader={printExcelHeader}
                            exceColWidth={excelColWidth}
                        ></NrjAgGrid>
                    </div>
                </div>
            </div>
        </>

    );
}; export default React.memo(ArBmwm);
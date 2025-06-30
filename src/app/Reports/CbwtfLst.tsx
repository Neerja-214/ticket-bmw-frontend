import React, { useMemo, useReducer, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import utilities, {
  ChangeCase,
  GetResponseWnds,
  capitalize,
  createGetApi,
  dataStr_ToArray,
  getApiFromBiowaste,
  getApplicationVersion,
  getStateAbbreviation,
  gridAddToolTipColumn,
  maskMail,
  maskNumber,
  postLinux,
  trimField
} from "../../utilities/utilities";
import { Button } from "@mui/material";
import NrjAgGrid from "../../components/reusable/NrjAgGrid";
import {
  nrjAxios, nrjAxiosRequestBio
} from "../../Hooks/useNrjAxios";
import { Modal } from "rsuite";
import { useEffectOnce } from "react-use";
import NrjAgBtn from "../../components/reusable/NrjAgBtn";

import WtrInput from "../../components/reusable/nw/WtrInput";
import { clrNAValue, getLvl, getWho } from "../../utilities/cpcb";
import { Toaster } from "../../components/reusable/Toaster";
import HdrDrp from "../HdrDrp";
import trash from "../../images/dashboard/trash.png"
import { useToaster } from "../../components/reusable/ToasterContext";
import moment from "moment";
import { saveAs } from 'file-saver';
// import { writeXLSX, XLSX } from "xlsx";
import * as XLSX from 'xlsx';
import { Key, Today } from "@mui/icons-material";

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
  SETMODAL: "modal",
  CLOSEMODAL: "clsmodal",
  OPENMODAL: "opnmodal",
  DISABLE: "disable",
  SETGID: "setgid",
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
  grdcnt: 0,
  openModal: false,
  ModalData: [],
  disableA: 1,
  disableB: 1,
  disableC: 1,
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
  grdcnt: number;
  openModal: boolean;
  ModalData: any;
  disableA: number;
  disableB: number;
  disableC: number;
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
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.TRIGGER_GRID:
      newstate.triggerG = action.payload;
      return newstate;
    case ACTIONS.SETMODAL:
      newstate.ModalData = action.payload;
      newstate.openModal = true;
      return newstate;
    case ACTIONS.CLOSEMODAL:
      newstate.openModal = false;
      return newstate;
    case ACTIONS.OPENMODAL:
      newstate.openModal = true;
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
      newstate.gid = action.payload
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
      else if (action.payload == 3) {
        if (newstate.disableC == 1) {
          newstate.disableBC = 0;
        } else {
          newstate.disableC = 1;
        }
        return newstate;
      }
      return newstate
  }


};


const CbwtfLst = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const coldef = [
    {
      field: "dts",
      headerName: "Details",
      width: 100,
      hide: true,
      cellRenderer: NrjAgBtn,
      cellRendererParams: {
        showApi: "",
        buttonText: "Details",
        fldName: "dts",
        colId: "show",
      },
      tooltipField: "tpedt"

    },
    {
      field: "cbwtfnm",
      hide: false,
      width: 250,
      headerName: "Name of CBWTF",
      filter: "agTextColumnFilter",
      tooltipField: 'cbwtfnm',
      tooltip: (params: { value: string; }) => "Name of CBWTF : " + params.value,
    },
    { field: "state", hide: false, width: 150, headerName: "State/UT" },
    { field: "cty", hide: false, width: 120, headerName: "City" },
    { field: "rgd", hide: false, width: 180, headerName: "Regional directorate" },
    { field: "contprnm", hide: false, width: 150, headerName: "Contact person" },
    { field: "mob", hide: false, width: 120, headerName: "Mobile no.", tooltipField: 'mob' },
    { field: "eml", hide: false, width: 150, headerName: "Email id", tooltipField: 'eml' },
    { field: "addra", hide: false, width: 150, headerName: "Address I" },
    { field: "addrb", hide: false, width: 150, headerName: "Address II" },
    { field: "addrc", hide: false, width: 150, headerName: "Address III" },
    { field: "addrc", hide: false, width: 150, headerName: "Address III" },
    { field: "pnc", hide: false, width: 150, headerName: "Pin code" },
    { field: "dist", hide: false, width: 120, headerName: "District" },
    { field: "fctltt", hide: false, width: 120, headerName: "Latitude" },
    { field: "fctlgt", hide: false, width: 120, headerName: "Longitude" },
    { field: "tpedt", hide: true, width: 150, headerName: "" },
    { field: "lic", hide: true, width: 150, headerName: "" },
  ];

  const colDefPdf = [
    {
      field: "cbwtfnm",
      hide: false,
       headerName: "Name of CBWTF",
      filter: "agTextColumnFilter",
    },
    { field: "cty", hide: false, width: 150, headerName: "CITY" },
    { field: "state", hide: false, width: 150, headerName: "State/UT" },
    { field: "rgd", hide: false, width: 180, headerName: "Regional directorate" },
    { field: "contprnm", hide: false, width: 150, headerName: "CONTACT" },
    { field: "mob", hide: false, width: 150, headerName: "MOBILE", tooltipField: 'cbwtfnm' },
    { field: "eml", hide: false, width: 150, headerName: "E MAIL", tooltipField: 'cbwtfnm' },
    { field: "addr", hide: false, width: 150, headerName: "ADDRESS" },
  ]


  const pdfColWidth = ['15%', '10%', '10%', '10%', '10%', '10%', '10%', '*',]


  const printExcelHeader = ["CBWTF", "CITY", "STATE", "CONTACT PERSON", "ADDRESS", "ADDRESS II", "ADDRESS III", "PIN CODE", "EMAIL ID"]
  const KeyOrder: string[] = ['cbwtfnm', 'cty', 'state', 'contprnm', 'addra', 'addrb', 'addrc', 'pnc', 'eml']
  const excelColWidth = [{ wch: 50 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }]

  const [showMessage, setShowMessage] = useState<any>({ message: [] });

  const [filterParameter, setFilterParameter] = useState<any>(null)
  const [isLoading, setIsLoading] = useState("");
  const { showToaster, hideToaster } = useToaster();
  const rowData: [] = [];
  const onRowSelected = (data: string) => { };
  const onButtonClicked = (action: string, rw: any) => {
    // dispatch({ type: ACTIONS.SETMODAL, payload: rw });
    // setTimeout(function () {
    //   dispatch({ type: ACTIONS.OPENMODAL, payload: 1 });
    // }, 800);
  };

  const handleClose = () => {
    dispatch({ type: ACTIONS.CLOSEMODAL, payload: 0 });
  };
  const GridLoaded = () => { };
  const onChangeDts2 = (data: string) => { };
  const [dt, setDt] = useState<any>([])
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
    setIsLoading("Loading data ...")
    let lvl: string = getLvl();
    let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT' ? getStateAbbreviation(capitalize(getWho())) : getWho();
    let gd: string = GetGid();
    dispatch({ type: ACTIONS.SETGID, payload: gd });
    dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 5 });

    let payload: any = postLinux(lvl + '=' + who + '=' + 0 + '=' + 0 + '=' + gd, 'cbwtfLst', false);
    return nrjAxiosRequestBio("cbwtfregtdy", payload);
  };

  const rearng = (data: any, KeyOrder: string[]) => {
    let newData = [];
    let i: number = 0;
    while (i < data.length) {
      let rw: any = {};
      let j: number = 0;
      while (j < KeyOrder.length) {
        if (data[i][KeyOrder[j]]) {
          rw[KeyOrder[j]] = data[i][KeyOrder[j]]
        } else {
          rw[KeyOrder[j]] = ""
        }
        j += 1;
      }
      newData.push(rw);
      i += 1
    }
    const sortedArray = [...newData].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
    return sortedArray;
  }


  const ShowData = (data: any) => {
    setIsLoading("");
    if (Array.isArray(data.data) && data.data.length) {
      let ary = [];
      ary = data.data
      ary = clrNAValue(ary, 0);

      // ary = ary.map((res:any)=>{
      //   return {
      //     ...res,
      //     eml: maskMail(res.eml),
      //     mob: maskNumber(res.mob)
      //   }
      // })
      ary = ChangeCase(ary, "cbwtfnm#addra#addrb#addrc#cty#contprnm#state");
      ary = gridAddToolTipColumn(ary, "tpedt", "Click to Copy Licence No, E Mail or Delete :", "", "cbwtfnm")
      ary = [...ary].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))

      ary.sort((a: any, b: any) => {
        // First sort by rgd
        const rgdComparison = a.rgd.localeCompare(b.rgd);
        if (rgdComparison !== 0) {
          return rgdComparison; // Return comparison result for rgd
        }
        // If rgd is the same, sort by state
        return a.state.localeCompare(b.state); // Alphabetical order for state
      });;

      //   ary.sort((a : any, b : any) => {
      //     // First sort by rgd
      //     if (a.rgd !== b.rgd) {
      //         return a.rgd - b.rgd; // Ascending order for rgd
      //     }
      //     // If rgd is the same, sort by state
      //     return a.state.localeCompare(b.state); // Alphabetical order for state
      // });
      ary=trimField(ary,"cbwtfnm")
      ary = [...ary].sort((a, b) => a.cbwtfnm.localeCompare(b.cbwtfnm))
      let aryS: any[] = ary;

      setDt(aryS)
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      setTimeout(function () {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        dispatch({ type: ACTIONS.RANDOM, payload: 1 });

      }, 900);
    }
    else {
     showToaster(["No data received"], "error");
    }
  };


  //   const exportToExcel = () => {

  //     let dat : any = dt;
  //     dat = rearng(dat, KeyOrder);

  //     //const worksheet = XLSX.utils.sheet_to_json(data)
  //     const emptyRows = Array(6).fill({});
  //     const dataWithEmptyRows = emptyRows.concat(dat);
  //     const worksheet = XLSX.utils.json_to_sheet(dataWithEmptyRows,{ skipHeader: true });
  //     //  const worksheet = XLSX.utils.aoa_to_sheet(dt);
  //     worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
  //     XLSX.utils.sheet_add_aoa(worksheet, [["Central Pollution Control Board"]], {origin: "A1"});
  //     worksheet['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }];
  //     const today = new Date();
  //     const options :any = { day: '2-digit', month: 'short', year: 'numeric' };
  //     const dateString = today.toLocaleDateString('en-US', options)
  //     XLSX.utils.sheet_add_aoa(worksheet, [["List of CBWTF : " +  dateString]], {origin: "A2"});
  //     worksheet['!merges'] = [{ s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }];
  //     let lvl: string = getLvl();
  //     let who: string = lvl == 'CPCB' ? lvl : lvl == 'STT'? getStateAbbreviation(capitalize(getWho())) : getWho();
  //     XLSX.utils.sheet_add_aoa(worksheet, [[who]], {origin: "A3"});

  //     XLSX.utils.sheet_add_aoa(worksheet, [["CBWTF","Contact person", "Address", "Address", "Address", "City", "State", "Regional Directorate"]], {origin: "A5"});
  //     //  XLSX.utils.sheet_add_aoa(worksheet, [["                                    Word Summary"]], {origin: "A1"});

  //     //  XLSX.utils.sheet_add_aoa(worksheet, [["                                    Word Summary"]], {origin: "C1"});
  //     // XLSX.utils.encode_row(7).fontsize("18");
  // //      for (let i = 0; i <= 2; i++) {
  // //       const cell = XLSX.utils.encode_cell({ r: 0, c: i });
  // //       const cellRef = worksheet[cell];
  // // if (cellRef && cellRef.s) {
  // //   cellRef.s = {
  // //     ...cellRef.s,
  // //     alignment: { horizontal: 'center' },
  // //     font: { bold: true },

  // //   };
  // // } else {
  // //   worksheet[cell] = {
  // //     ...cellRef,
  // //     s: {
  // //       alignment: { horizontal: 'center' },
  // //       font: { bold: true },

  // //     }
  // //   };


  // //}

  //   //  }


  //     //  const headers = Object.keys(data[0]); // Assuming all objects in data have the same structure
  //     //  XLSX.utils.sheet_add_json(worksheet, [headers], { origin: 'A2' });


  //     //const worksheet = XLSX.utils.aoa_to_sheet(data);
  //     const workbook = XLSX.utils.book_new();



  //     worksheet['!cols'] = wscols;
  //     //  worksheet['E1'].s.font.sz = 20;
  //     //  worksheet['B1'].s.font.sz = 20;
  //     //  worksheet['C1'].s.font.sz = 20;

  //     // worksheet['A1'].s = {
  //     //   fill: {
  //     //     patternType: 'solid',
  //     //     fgColor: { rgb: 'FFFF00' } // Yellow color
  //     //   }
  //     // };
  //     // const cell_format = worksheet.add_format({'bold': true, 'italic': true})
  //     // worksheet.write(1,1,"A", {'bold': true, 'italic': true})
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  //     // worksheet.getRow(1).fill
  //     worksheet["!cols"][2] = {hidden:true}
  //     if (!worksheet['!rows']) worksheet['!rows'] = [];
  //     // worksheet['!rows'][5]   .font.sz = 30
  //     // worksheet.set_row(4, {'font_size': 30})
  //     // worksheet["rows"].fill = {
  //     //   type: "pattern",
  //     //   pattern: "darkVertical",
  //     //   fgColor: { argb: "FFFF00" },
  //     // };
  //     XLSX.writeFile(workbook, 'data.xlsx');
  //     // const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  //     // saveAs(blob, `${fileName}.xlsx`);
  //   };




  const { data: datab, refetch: refetchB } = useQuery({
    queryKey: ["getQry", state.mainId, state.rndm],
    queryFn: GetData,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: ShowData,
  });

  const DeleteCbwtf = () => {
    let api: string = getApiFromBiowaste("dltcbwtf");
    let flt: string = state.ModalData.cbwtfid;
    let data1: any = {
      licno: flt,
    };
    return nrjAxios({ apiCall: api, config: data1 });
  };

  const DataDel = (datac: any) => {
    if (datac && datac.status == 200 && datac.data) {
      handleClose3();
      showToaster(['CBWTF ' + state.ModalData.cbwtfnm + ' Deleted Successfully'], 'success')
    }
  };

  const DelCbwt = () => {
    refetchC();
  };
  const { data: datac, refetch: refetchC } = useQuery({
    queryKey: ["delQry", state.ModalData, state.rndm],
    queryFn: DeleteCbwtf,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: DataDel,
  });

  const cpyLic = () => {
    let c: string = "cpy][" + state.ModalData["lic"];
    dispatch({ type: ACTIONS.SETFORM_DATA, payload: c });
    let vl: string = state.ModalData["lic"];

  };

  const cpyEml = () => {
    let c: string = "cpy][" + state.ModalData["eml"];
    dispatch({ type: ACTIONS.SETFORM_DATA, payload: c });
    let vl: string = state.ModalData["lic"];

  };

  useEffectOnce(() => { refetchB() });

  const [open, setOpen] = React.useState(false);
  const handleOpen2 = () => {
    handleClose();
    setOpen(true);
  };

  const handleClose2 = () => {
    setOpen(false);
  };
  const [open3, setOpen3] = React.useState(false);
  const handleOpen3 = () => {
    handleClose2();
    setOpen3(true);
  };

  const handleClose3 = () => {
    setOpen3(false);
  };

  const openModel3 = () => {
    handleClose2();
    handleOpen3();
  }


  return (
    <>

      <div className="flex justify-center bg-gray-100">
        <div>
          {showMessage && showMessage.message.length != 0 ? (
            <div className="py-2">
              <Toaster data={showMessage} className={""}></Toaster>
            </div>
          ) : (
            <></>
          )}
         
        </div>
        

        <NrjAgGrid
          onGridLoaded={GridLoaded}
          onRowSelected={onRowSelected}
          onButtonClicked={onButtonClicked}
          colDef={coldef}
          apiCall={""}
          rowData={rowData}
          deleteButton={""}
          newRowData={state.nwRow}
          showDataButton={""}
          trigger={state.triggerG}
          showPagination={true}
          showTooltips={true}
          MyRoute="cbwtfdspl"
          appName="CPCB"
          className="ag-theme-alpine-blue ag-theme-alpine"
          showExport={true}
          prependContent={[]}
          KeyOrder={KeyOrder}
          lvl={getLvl()}
          who={getWho()}
          pageTitle={"List of CBWTF "}
          sortBy={'cbwtfnm'}
          printExcelHeader={printExcelHeader}
          exceColWidth={excelColWidth}
          colDefPdf={colDefPdf}
          pdfColWidth={pdfColWidth}
          widthSerialNoCol={100}
        ></NrjAgGrid>
      </div>

      <div>
        {state.openModal && (
          <Modal open={state.openModal} size="md" onClose={handleClose}>
            <Modal.Header>
              <Modal.Title>
                <div className="font-semibold">
                  Correction: {state.ModalData.cbwtfnm}
                </div>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div
                className="mx-8 rounded-lg p-3 mt-4"
                style={{ backgroundColor: "#f5f6fa" }}
              >
                <div className="flex justify-center py-7">
                  <div className="" style={{ visibility: "hidden" }}>
                    <Button
                      size="medium"
                      style={{ backgroundColor: "#3B71CA" , textTransform: "none"}}
                      variant="contained"
                      color="success"
                      onClick={cpyLic}
                    >
                      Copy licence no
                    </Button>
                  </div>
                  <div className="ml-4 mr-4">
                    <Button
                      size="medium"
                      style={{ backgroundColor: "#3B71CA" , textTransform: "none"}}
                      variant="contained"
                      color="success"
                      onClick={cpyEml}
                    >
                      Copy e-mail address
                    </Button>
                  </div>
                  <div className="mr-4">
                    <Button
                      size="medium"
                      style={{ backgroundColor: "#3B71CA" , textTransform: "none"}}
                      variant="contained"
                      color="success"
                      onClick={handleOpen2}

                    >
                      Delete CBWTF
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center py-7">
                  <WtrInput
                    Label="Copy"
                    fldName="cpy"
                    idText="txtcpy"
                    onChange={onChangeDts2}
                    dsabld={false}
                    callFnFocus=""
                    dsbKey={false}
                    upprCase={false}
                    validateFn=""
                    clrFnct={state.trigger}
                    allowNumber={false}
                    selectedValue={state.frmData}
                    speaker={""}
                    delayClose={1000}
                    ClssName=""
                  ></WtrInput>
                </div>
              </div>

            </Modal.Body>
            <Modal.Footer>
              {/* <Button variant="contained" color="success"  onClick={handleClose}>
                            Ok
                        </Button> */}
              <Button onClick={handleClose} style={{ textTransform: "none"}}>Cancel</Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>


      <div>
        <Modal size={'xs'} open={open} onClose={handleClose2}>
          <Modal.Header>
            <Modal.Title>Delete CBWTF</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-2">
            <span className="flex">
              <img src={trash} width={'20px'} className="mr-2" alt="Delete icon" />
              Are you sure you want to delete {state.ModalData.cbwtfnm}
            </span>

          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end">
              <div className="mx-2">
                <Button onClick={handleClose2} variant='outlined' color='primary' className="mr-2" style={{ textTransform: "none"}}>
                  Cancel
                </Button>
              </div>
              <div className="mx-2">
                <Button onClick={openModel3} variant='contained' color='warning' className="ml-2" style={{ textTransform: "none"}}>
                  Delete
                </Button>
              </div>
            </div>


          </Modal.Footer>
        </Modal>
      </div>
      <div>
        <Modal size={'md'} open={open3} onClose={handleClose3}>
          <Modal.Header>
            <Modal.Title className="font-semicold">Delete CBWTF</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="flex justify-center text-center mt-2 mb-4 font-semibold text-lg">
              Are you sure you want to delete {state.ModalData.cbwtfnm}
            </div>
            <div className="flex justify-center">
              <img src={trash} width={'60px'} alt="Delete icon" />
            </div>

          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end">
              <div className="mx-2">
                <Button onClick={DelCbwt} variant='contained' color='warning' className="mr-2" style={{ textTransform: "none"}} >
                  Delete
                </Button>
              </div>
              <div className="mx-2">
                <Button onClick={handleClose3} variant='outlined' color='primary' style={{ textTransform: "none"}} >
                  Cancel
                </Button>
              </div>


            </div>


          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};
export default React.memo(CbwtfLst);

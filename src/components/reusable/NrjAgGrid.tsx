import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePrevious } from "react-use";
import utilities, { capitalize, createGetApi, dataStr_ToArray, getCmpId, getPrintTextValue, getStateAbbreviation, getUsrId, mdf } from "../../utilities/utilities";
import { nrjAxios, nrjAxiosRequest } from "../../Hooks/useNrjAxios";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button, Tooltip } from "@mui/material";
import { Modal } from "rsuite";
import { exportToPDF } from "../../utilities/utilitiesPdfFile";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { CsvExportModule } from "@ag-grid-community/csv-export";
import NrjAgBtn from "./NrjAgBtn";
import "./NrjAgGrid.css";
// import * as XLSX from 'xlsx';
import { getLvl, getWho } from "../../utilities/cpcb";
import { AgGridReact } from "ag-grid-react"; // ✅ Must be from 'ag-grid-react'
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AiOutlineSearch } from "react-icons/ai";
import { RowStyle } from "ag-grid-community";
import * as XLSX from 'xlsx-js-style';



type AgGrid = {
  ratio?: { maxNumber: number, minNumber: number, equalto: number, color: string }[];
  rowClassRulesValues?: { numerator: any; denominator: any; } | undefined;
  cellClassRulesValues?: { color: string; cellName: any; value?: any; colorEntireRow?: boolean }[];

  colDef: {
    headerName: string;
    field?: string;
    width?: number;
    hidden?: boolean;
    cellStyle?: {};
    editable?: boolean;
    children?: any[];
    headerTooltip?: any;
    tooltipField?: any;
    cellClass?: any
  }[];
  rowData: any[];
  apiCall: string;
  onRowSelected: (data: string) => void;
  trigger?: number | 0;
  newRowData?: {}[];
  onGridAnswers?: (data: []) => void;
  onGridLoaded: () => void;
  deleteButton?: string;
  showDataButton?: string;
  showApi?: string;
  showFldNm?: string;
  deleteApi?: string;
  deleteFldNm?: string;
  queryOnLoad?: boolean;
  addButton?: string;
  addButtonApi?: string;
  addFldNm?: string;
  height?: number;
  width?: string;
  fontSize?: number;
  showPagination?: boolean;
  PageSize?: number;
  StaleTime?: number;
  onCellEdited?: (
    fld: string,
    rowdata: any,
    oldValue: string,
    newValue: string
  ) => void;
  newRowOnTop?: boolean;
  className?: string;
  rowHeight?: number;
  onCellClicked?: any;
  onButtonClicked?: (columnName: string, rowData: any) => void;
  triggerText?: string;
  paginationChanged?: any;
  ApiServer?: string;
  deleteId?: string;
  parentPaginationChanged?: (data: any) => void;
  showTooltips?: boolean
  NoRecordEachCall?: number
  MyRoute?: string,
  appName?: string,
  getFilteredParameter?: any,
  hideSerialNo?: boolean,
  widthSerialNoCol?: number,
  updateRowData?: any,
  gridApiPdf?: any
  prependContent?: any,
  showExport?: boolean,
  // veriable for export annual report to excel
  showExportExcel?: boolean,
  colDefPrint?: any,
  KeyOrder?: any,
  lvl?: any,
  who?: any,
  name?: any,
  sortBy?: any
  pageTitle?: any,
  exceColWidth?: any[],
  printExcelHeader?: String[],
  pdfColWidth?: any[],
  blockautoPagination?: boolean,
  pdfHeader?: any,
  colDefPdf?: {
    headerName: string;
    field?: string;
    width?: number;
    hidden?: boolean;
    cellStyle?: {};
    editable?: boolean;
    children?: any[];
    headerTooltip?: any;
    tooltipField?: any;
    cellClass?: any
  }[];
};

const NrjAgGrid = (props: AgGrid) => {

  const {
    onRowSelected,
    onGridAnswers,
    onGridLoaded,
    onCellEdited,
    onButtonClicked,
    parentPaginationChanged,
  } = props;
  const gridRef = useRef<AgGridReact>(null);
  const [rowData, setRowData] = useState(props.rowData);
  const [allData, setAllData] = useState<any>([]);
  const [gridApi, setGridApi] = useState(props.apiCall);
  const [wchApi, setWchApi] = useState(0);
  const prvApi = usePrevious(gridApi);
  const navigate = useNavigate();
  const [countTillNow, setCountTillNow] = useState(0);
  const [actvPage, setActvPage] = useState(0);
  const [colDefSeq, setColDefSeq] = useState<any[]>([])
  const [gridApiPdf, setGridApiPdf] = useState<any>(null)
  const [pgSize, setPgSize] = useState<number>(props.PageSize ? props.PageSize : 15)
  const serialNoGetter = (params: any) => {
    return params.node ? params.node.rowIndex + 1 : null;
  };
  const [columnState, setColumnState] = useState<any>(null);

  // const onColumnResized = (params: any) => {
  //   console.log('Column State:', params.columnApi.getColumnState());
  //   const newColumnState = params.columnApi.getColumnState();
  //   setColumnState(newColumnState);


  //   const updatedColDef = colDef.map((col: any) => {
  //     const resizedCol = newColumnState.find((c: any) => c.colId === col.field);
  //     if (resizedCol) {
  //       return { ...col, width: resizedCol.width };
  //     }
  //     return col;
  //   });

  //   setColdef(updatedColDef);
  // };


  // const onColumnResized = (params: any) => {
  //   console.log('Column State:', params.columnApi.getColumnState());

  //   // ✅ Use ref to store state to avoid excessive renders
  //   columnStateRef.current = params.columnApi.getColumnState();

  //   setColdef((prevColDef) => {
  //       if (!prevColDef) return prevColDef;

  //       const updatedColDef = prevColDef.map((col) => {
  //           const resizedCol = columnStateRef.current.find(
  //               (c) => c.colId === col.field
  //           );
  //           if (resizedCol) {
  //               return { ...col, width: resizedCol.width };
  //           }
  //           return col;
  //       });

  //       return updatedColDef;
  //   });
  // };

  //   const onColumnResized = (params: any) => {
  //     console.log('Column State:', params.columnApi.getColumnState());

  //     columnStateRef.current = params.columnApi.getColumnState();

  //     setColdef((prevColDef: any[]) => {
  //         if (!prevColDef) return prevColDef;

  //         const updateColumn = (col: any) => {
  //             // ✅ Find resized column in the state
  //             const resizedCol = columnStateRef.current.find(
  //                 (c) => c.colId === col.colId
  //             );
  //             if (resizedCol) {
  //                 return { ...col, width: resizedCol.width };
  //             }
  //             // ✅ Handle child columns recursively
  //             if (col.children) {
  //                 return {
  //                     ...col,
  //                     children: col.children.map(updateColumn),
  //                 };
  //             }
  //             return col;
  //         };

  //         return prevColDef.map(updateColumn);
  //     });
  // };


  const onColumnResized = (params: any) => {
    console.log('Column State:', params.columnApi.getColumnState());

    columnStateRef.current = params.columnApi.getColumnState();

    setColdef((prevColDef) => {
      if (!prevColDef) return prevColDef;

      const updateColumn = (col: any) => {
        // ✅ Find resized column in the state
        const resizedCol = columnStateRef.current.find(
          (c) => c.colId === col.colId
        );
        if (resizedCol) {
          return { ...col, width: resizedCol.width };
        }

        // ✅ Handle child columns recursively (if exists)
        if (col.children) {
          return {
            ...col,
            children: col.children.map(updateColumn),
          };
        }

        // ✅ Directly return for single columns (non-child)
        return col;
      };

      // ✅ Apply for both single and nested columns
      return prevColDef.map(updateColumn);
    });
  };





  const serialNo: any = {
    headerName: 'Sr. No.',
    maxWidth: props.widthSerialNoCol ? props.widthSerialNoCol : 90,
    valueGetter: serialNoGetter,
    hide: props.hideSerialNo ? true : false,
    filter: true
  };


  // const [colDef, setColdef] = useState([
  //   serialNo,
  //   ...(props.colDef || []).map((res: any) => {
  //     return {
  //       ...res,
  //       filter: true,
  //       resizable: true
  //     }
  //   })

  // ]);

  const [colDef, setColdef] = useState<any[]>([]);
  useEffect(() => {
    setColdef([
      serialNo,
      ...(props.colDef || []).map((res: any) => ({
        ...res,
        filter: true,
        resizable: true,
      })),
    ]);
  }, [props.colDef]); // ✅ Update when `props.colDef` changes
  const [fixedColDef, setFixedColdef] = useState([...colDef]);
  const [orderedColDef, setOrderedColdef] = useState([...colDef]);

  useEffect(() => {

    if (!props.MyRoute) {
      const tempColDef: any[] = [serialNo,
        ...(props.colDef || []).map((res: any) => {
          return {
            ...res,
            filter: true
          }
        })
      ]
      setColdef(tempColDef);
      setFixedColdef(tempColDef);
      setOrderedColdef(tempColDef);
    }
  }, [props.colDef])

  const [gridHeight, setGridHeight] = useState(15 * 20 + 56);

  useEffect(() => {
    if (pgSize) {
      setGridHeight(pgSize * 40 + 56); // Dynamically adjust height based on selected page size
    }
  }, [pgSize]);
  const grdSty = {
    paddingTop: props.showExport ? '15px' : 0,
    height: props.height ? props.height : 540,
    width: props.width ? props.width : "100%",
    fontsize: props.fontSize ? props.fontSize : 18,
  };



  useEffect(() => {
    if (props.triggerText == "preserve" && rowData.length) {
      setAllData(rowData);
    } else if (props.triggerText == "show") {
      if (allData && allData.length > 0) {
        setRowData(allData);
      }
    }
  }, [props.triggerText]);

  const addDelButton = (parms: string) => {
    let ttl: string[] = parms.split("|");
    let cdef: {};
    if (ttl && ttl.length > 2) {
      cdef = {
        field: ttl[2],
        headerName: ttl[0],
        width: 250,
        hide: false,

        cellRenderer: NrjAgBtn,
        cellRendererParams: {
          deleteApi: ttl[1],
          buttonText: ttl[0],
          fldName: ttl[2],
          colId: "delete",
        },
      };
      return cdef;
    }
  };

  useEffect(() => {
    if (props.rowData?.length) {
      setRowData(props.rowData);
    }
  }, [props.rowData]);

  useEffect(() => {
    if (props.newRowData?.length && Array.isArray(props.newRowData)) {
      let ontop: boolean = props.newRowOnTop ? props.newRowOnTop : false;
      if (ontop) {
        if (rowData && rowData.length > 0) {
          setRowData(props.newRowData.concat(rowData));
        } else {
          setRowData(props.newRowData);
        }
      } else {
        if (rowData && rowData.length > 0) {
          setRowData(rowData.concat(props.newRowData));
        } else {
          setRowData(props.newRowData);
        }
      }
      onGridLoaded();
    }
  }, [props.newRowData]);


  useEffect(() => {
    if (props.updateRowData && props.updateRowData.id != undefined) {
      setRowData(rowData.map((res: any) => {
        if (props.updateRowData.id == res.id) {
          return props.updateRowData;
        }
        else {
          return res;
        }
      }))
    }
  }, [props.updateRowData]);





  /****************************************************************************************************** */

  const addShowButton = (parms: string) => {
    let ttl: string[] = parms.split("|");
    let cdef: any;

    if (ttl && ttl.length > 2) {
      cdef = {
        field: ttl[2],
        headerName: ttl[0],
        width: 200,
        hide: false,
        cellRenderer: (params: any) => <NrjAgBtn {...params} />,
        cellRendererParams: {
          showApi: ttl[1],
          buttonText: ttl[0],
          fldName: ttl[2],
          colId: "show",
        },
      };
      console.log("✅ Generated Column:", cdef); // Debugging
      return cdef;
    }
  };


  const CallData = () => {
    let api: string = "";
    if (gridApi.indexOf("[lastid]") > -1) {
      api = gridApi.replace("[lastid]", `${countTillNow}`);
    } else {
      api = gridApi;
    }
    let wch: number = wchApi;
    if (wch > 0) {
      api = "";
      if (props.deleteApi) {
        api = props.deleteApi;
        api = api.replace("=id=", "=" + wch + "=");
      }
    }

    let cmpid: string = getCmpId() || "1";
    api = api.replace("cmpid", cmpid);
    cmpid = getUsrId() || "1";
    api = api.replace("usrid", cmpid);
    api = mdf(api);
    api = "/api/GetFldValue/" + api;
    return nrjAxios({ apiCall: api, whchServer: props.ApiServer });
  };
  const grd = (dta: any) => {

    let wch = wchApi;
    if (wch) {
      setWchApi(0);
      return;
    }
    if (dta) {
      let dt: string = dta.data[0]["Data"];
      if (dt) {
        data_grd(dt);
      }
    }
  };
  const { data, refetch, isLoading } = useQuery({
    queryKey: ["ListLink", props.apiCall],
    queryFn: CallData,
    enabled: props.queryOnLoad ? props.queryOnLoad : false,
    staleTime: props.StaleTime ? props.StaleTime : Number.POSITIVE_INFINITY,
    onSuccess: grd,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // const onGridReady = useCallback((params: any) => {
  //   setGridApiPdf(params.api);

  //   if (columnState) {
  //     // Restore the column state
  //     params.columnApi.setColumnState(columnState);
  //   }

  //   if (gridApi) {
  //     if (!props.queryOnLoad) {
  //       refetch();
  //     }
  //   }
  // }, [columnState]);
  const columnStateRef = useRef<any[]>([]);

  const onGridReady = useCallback((params: any) => {
    setGridApiPdf(params.api);

    if (columnStateRef.current.length > 0) {
      const adjustedColumnState = columnStateRef.current.map((col: any) => ({
        ...col,
        colId: col.colId || col.field, // Ensure consistent colId
      }));

      setTimeout(() => {
        params.columnApi.applyColumnState({
          state: adjustedColumnState,
          applyOrder: true,
        });
      }, 0);
    }

    if (gridApi && !props.queryOnLoad) {
      refetch();
    }
  }, [gridApi]);

  const data_grd = (datas: string) => {
    let dat = datas;
    if (dat) {
      let ary: any = dataStr_ToArray(dat);
      if (ary) {
        setCountTillNow(countTillNow + ary.length);
        setRowData(rowData.concat(ary));
      }
    }
  };

  const onSelectionChanged = () => {
    var selectedRows = gridRef.current!.api.getSelectedRows();
    var selectedRowsString = "";
    var maxToShow = 1;
    selectedRows.forEach(function (selectedRow: any, index: any) {
      if (index >= maxToShow) {
        return;
      }
      for (let i = 0, j = props.colDef.length; i < j; i++) {
        if (selectedRow[props.colDef[i].field || 0]) {
          selectedRowsString += selectedRow[props.colDef[i].field || 0] + "|";
        } else {
          selectedRowsString += "|";
        }
      }
      onRowSelected(selectedRowsString);
    });
  };

  useEffect(() => {
    if (props.trigger) {
      if (props.trigger == 3) {
        // Recall api for data of the grid
        if (props.apiCall) {
          setGridApi(props.apiCall);

          setTimeout(function () {
            if (wchApi === 0 && gridApi) {
              refetch();
            }
          }, 500);
        }
      } else if (props.trigger === 4) {
        //Download CSV Export
        gridRef.current!.api.exportDataAsCsv();
      } else if (props.trigger === 5) {

        //Download CSV Export
        setRowData([]);
      } else if (props.trigger === 6) {
        if (props.rowData) {
          setRowData(props.rowData);
        }
      } else if (props.trigger === 7) {
        if (props.deleteId ? props.deleteId : null) {
          let sliceIndex = -1;

          for (var i = 0; i < rowData.length; i++) {
            if (rowData[i]["id"] === props.deleteId) {
              sliceIndex = i;
              break;
            }
          }
          if (sliceIndex != -1) {
            setRowData(rowData.splice(sliceIndex, 1));
          }
        }
      }
    }
  }, [props.trigger, gridApi]);

  let blnAdd: boolean = false;
  if (props.deleteButton) {
    for (var i = 0, j = props.colDef.length; i < j; i++) {
      if (props.colDef[i]["headerName"] === props.deleteButton) {
        blnAdd = true;
        break;
      }
    }
    if (!blnAdd) {
      let cl: any = addDelButton(
        props.deleteButton + "|" + props.deleteApi + "|" + props.deleteFldNm
      );
      props.colDef.push(cl);
    }
  }

  blnAdd = false;
  if (props.showDataButton) {
    for (var i = 0, j = props.colDef.length; i < j; i++) {
      if (props.colDef[i]["headerName"] === props.showDataButton) {
        blnAdd = true;
        break;
      }
    }

    if (!blnAdd) {
      let cl: any = addShowButton(
        props.showDataButton + "|" + props.showApi + "|" + props.showFldNm
      );
      props.colDef.push(cl);
    }
  }

  const updateSerialNo = () => {
    let flag: boolean = true;
    for (let res of colDef) {
      if (res.headerName == 'Sr. No.') {
        flag = false;
        break;
      }
    }
    let serialNo: any = {
      headerName: 'Sr. No.',
      maxWidth: props.widthSerialNoCol ? props.widthSerialNoCol : 90,
      valueGetter: serialNoGetter,
    };
    if (!flag) {
      let tempColdef: any[] = [...colDef]
      tempColdef.splice(0, 1);
      setColdef([serialNo, ...tempColdef]);
    }
    else {
      setColdef([serialNo, ...colDef]);
    }

  }



  const onCellClicked = (params: any) => {
    let curFldDel: string = "";
    let cellclk: string = params["colDef"]["headerName"];
    let fieldName: string = params['colDef']["field"];
    let intWch: number = 0;
    if (props.deleteButton) {
      if (cellclk === props.deleteButton) {
        curFldDel = cellclk;
        intWch = 1;
      }
    }

    if (!curFldDel) {
      if (props.showDataButton) {
        if (cellclk === props.showDataButton) {
          curFldDel = cellclk;
          intWch = 2;
          if (onButtonClicked) {
            onButtonClicked(cellclk, rowData[params.rowIndex]);
          }
        }
      }
    }
    let vl: string = props.showApi ? props.showApi : "";
    let ary: any;
    if (intWch == 0) {
      if (vl) {
        if (vl.indexOf("key][") > -1) {
          ary = dataStr_ToArray(vl);
          let i: number = 0;
          while (i < ary.length) {
            if (ary[i]["cellclicked"]) {
              if (ary[i]["cellclicked"] == cellclk) {
                intWch = 2;
                break;
              }
            }
            i += 1;
          }
        }
      }
      else if (onButtonClicked) {
        onButtonClicked(cellclk, params.data);
      }
    }
    if (intWch === 1) {
      let rwid: any = params.data;

      let rwIId: number = parseInt(rwid["id"]);
      setWchApi(rwIId);
      if (onButtonClicked) {
        onButtonClicked(cellclk, params.data);
      }
      if (props.apiCall) {
        // rw.splice(params.rowIndex, 1);
        setRowData([]);
        setTimeout(function () {
          //setRowData(rowData);
          refetch();
        }, 300);
      }
    } else if (intWch === 2) {
      let rw: any = params.data;
      if (onButtonClicked) {
        onButtonClicked(cellclk, params.data);
      }

      if (vl) {
        if (vl.indexOf("key][") > -1) {
          //sample keyname][set this value to name of session item = key][Value to set = path][path for navigation
          //optional cellclicked][headername
          let i: number = 0;
          while (ary && i < ary.length) {
            if (ary[i]["cellclicked"]) {
              if (ary[i]["cellclicked"] == cellclk) {
                if (ary[i]["keyname"] && ary[i]["key"]) {
                  if (ary[i]["keyname"].indexOf('>') > -1 && ary[i]["key"].indexOf('>') > -1) {
                    // console.log(ary[i]["key"]);

                    let twoDataKeyName: string[] = ary[i]["keyname"].split(">");
                    let twoDataKey: string[] = ary[i]["key"].split(">");
                    twoDataKeyName.forEach((res: any, index: number) => {
                      twoDataKey[index] == "field"
                        ? sessionStorage.setItem(
                          twoDataKeyName[index],
                          fieldName
                        )
                        : sessionStorage.setItem(
                          twoDataKeyName[index],
                          rw[twoDataKey[index]]
                        );
                    });
                  } else {
                    sessionStorage.setItem(
                      ary[i]["keyname"],
                      rw[ary[i]["key"]]
                    );
                  }
                  if (ary[i]["path"]) {
                    navigate("/" + ary[i]["path"]);
                    break;
                  }
                }
              }
            }
            i += 1;
          }

        } else {
          let ech: string[] = vl.split("|");
          if (ech && ech.length > 2 && ech[1]) {
            let keyVl: any = rw[ech[1]];
            if (keyVl) {
              sessionStorage.setItem(ech[0], keyVl);
              if (ech[2]) {
                navigate("/" + ech[2]);
              }
            }
          }
        }
      }
    }
  };

  const onSortChanged = (parms: any) => {
    if (props.hideSerialNo ? props.hideSerialNo : false) {
      return;
    }
    updateSerialNo();
  }


  const CellEditingStopped = (event: any) => {
    if (event.valueChanged) {
      if (props.onCellEdited) {
        let ov: string = "";
        if (event.oldValue) {
          ov = event.oldValue;
        }

        let nv: string = "";
        if (event.newValue) {
          nv = event.newValue;
        }
        props.onCellEdited(event.colDef["field"], event.data, ov, nv);
      }
    }
  };

  const [prevTotalPages, setPrevTotalPages] = useState(0);
  const paginationChanged = (data: any) => {
    if (props.blockautoPagination ? props.blockautoPagination : false) {
      return;
    }
    if (props.apiCall?.length > 0) {
      let curPg: number = data.api.paginationProxy.currentPage;

      if (
        data.api.paginationProxy.totalPages - prevTotalPages > 0 &&
        data.api.paginationProxy.totalPages -
        data.api.paginationProxy.currentPage <=
        1
      ) {
        // console.log("pagination api called");
        if (parentPaginationChanged) {
          parentPaginationChanged(data)
          // console.log(data)
        }
        // console.log(data)
        setPrevTotalPages(data.api.paginationProxy.totalPages);
        setActvPage(curPg + 1);
        // refetch();
      }
    } else {
      if (parentPaginationChanged) {

        parentPaginationChanged(data)
      }

    }
  };


  const onBodyScroll = (data: any) => {

  }


  const cellclassValue = props.cellClassRulesValues || [];



  // colDef.forEach((col) => {
  //   const cellClassFunctions: any = [];
  //   for (const c of cellclassValue) {
  //     if (c.colorEntireRow) {
  //       cellClassFunctions.push((params: any) => {
  //         return params.data[c.cellName] === c.value ? c.color : '';
  //       });
  //     } else {
  //       if (col.field === c.cellName) {
  //         cellClassFunctions.push((params: any) => {
  //           return params.data[c.cellName] === c.value ? c.color : '';
  //         });
  //       }
  //     }
  //     if (c.value === '' || c.value === null || c.value === undefined) {
  //       if (col.field === c.cellName) {
  //         cellClassFunctions.push((params: any) => {
  //           return params.data[c.cellName] ? c.color : '';
  //         });
  //       }
  //     }
  //   }
  //   if (cellClassFunctions.length > 0) {
  //     col.cellClass = (params: any) => {
  //       for (const cellClassFunction of cellClassFunctions) {
  //         const cellClass = cellClassFunction(params);
  //         if (cellClass) {
  //           return cellClass;
  //         }
  //       }
  //       return '';
  //     };
  //   }
  // });

  // colDef.forEach((col) => {
  //   const cellClassFunctions: any = [];

  //   for (const c of cellclassValue) {
  //     if (c.colorEntireRow) {
  //       cellClassFunctions.push((params: any) => {
  //         // 🔹 Check if row is highlighted, and override color if needed
  //         if (highlightedRows.has(params.data?.cbwtfid) || 
  //             highlightedRows.has(params.data?.hcfnm) || 
  //             highlightedRows.has(params.data?.cnt1) || 
  //             highlightedRows.has(params.data?.cnt2) || 
  //           highlightedRows.has(params.data?.fld1) || 
  //           highlightedRows.has(params.data?.fld2) || 
  //           highlightedRows.has(params.data?.cbwtfnm) || 
  //             highlightedRows.has(params.data?.dt_rpt)) {
  //           return "rgb(169, 228, 252) !important"; // 🔥 Forced highlight color
  //         }

  //         return params.data[c.cellName] === c.value ? c.color : '';
  //       });
  //     } else {
  //       if (col.field === c.cellName) {
  //         cellClassFunctions.push((params: any) => {
  //           return params.data[c.cellName] === c.value ? c.color : '';
  //         });
  //       }
  //     }

  //     if (!c.value) {
  //       if (col.field === c.cellName) {
  //         cellClassFunctions.push((params: any) => {
  //           return params.data[c.cellName] ? c.color : '';
  //         });
  //       }
  //     }
  //   }

  //   if (cellClassFunctions.length > 0) {
  //     col.cellClass = (params: any) => {
  //       for (const cellClassFunction of cellClassFunctions) {
  //         const cellClass = cellClassFunction(params);
  //         if (cellClass) {
  //           return cellClass;
  //         }
  //       }
  //       return '';
  //     };
  //   }
  // });


  colDef.forEach((col) => {
    // ✅ Apply to parent columns
    col.cellClassRules = {
      "highlighted-cell": (params: any) => {
        if (!searchText.trim()) return false;
        return String(params.value).toLowerCase().includes(searchText.toLowerCase());
      },
    };
    // ✅ Apply to child columns with correct type
    if (col.children) {
      col.children.forEach((childCol: { field: string; cellClassRules?: any }) => {
        childCol.cellClassRules = {
          "highlighted-cell": (params: any) => {
            if (!searchText.trim()) return false;
            return String(params.value).toLowerCase().includes(searchText.toLowerCase());
          },
        };
      });
    }
  });





  const numerator = props.rowClassRulesValues?.numerator;
  const denominator = props.rowClassRulesValues?.denominator;
  const ratio = props.ratio || [];




  const getGid = () => {
    let g: any = utilities(3, "", "");
    return g;
  };

  const [open, setOpen] = useState(false);
  const [stabiliser, setStabiliser] = useState<boolean>(true);
  const [modelData, setModelData] = useState<any>({});

  const handleOpen = (data: any) => {
    if (stabiliser) {
      setOpen(true);
      setModelData(data);
      setStabiliser(!stabiliser);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStabiliser(!stabiliser);
  };

  const resetColDef = () => {
    let tempColDef: any[] = [serialNo, ...props.colDef?.map((res: any) => {
      return {
        ...res, filter: true
      }
    })]
    setColdef(tempColDef);
    setFixedColdef(tempColDef)
    setOrderedColdef(tempColDef);
    let seq = "";
    props.colDef.forEach((res: any) => {
      if (seq) {
        seq += ','
      }
      seq += res.field;
    })

    sendColDefSeq(seq).then((res: any) => {
      res = dataStr_ToArray(res);
      setColDefSeq(res);
    }).catch(((res: any) => { console.log(res) }))
    handleClose();
  }

  // useEffect(()=>{
  //   if(props.MyRoute && props.appName){
  //     fetchColdefSeq();
  //   }
  // },[props.MyRoute, props.appName])

  const fetchSeq = () => {
    let api = createGetApi("db=nodb|dll=s|fnct=c75", `${props.appName}=${props.MyRoute}`);
    return nrjAxios({ apiCall: api });
  }

  const fetchSeqSuccess = (coldef: any) => {
    if (coldef && coldef?.data[0]?.Data) {
      let sortOrder: any = dataStr_ToArray(coldef.data[0].Data);

      if (sortOrder && Array.isArray(sortOrder) && sortOrder.length) {
        sortOrder = sortOrder[0].cols ? sortOrder[0].cols.split(',') : [];
        let sortedArrayDeleted: any[] = []

        sortedArrayDeleted = sortArrayByFieldOrderDeleted(orderedColDef, sortOrder)
        setColdef(sortedArrayDeleted);
        setOrderedColdef(sortedArrayDeleted);

        let sortedArray = sortArrayByFieldOrder(orderedColDef, sortOrder);
        sortedArray = sortedArray.map((res: any) => {
          let flag = false;
          for (let i = 0; i < sortedArrayDeleted.length; i++) {
            if (res.field == sortedArrayDeleted[i].field) {
              flag = true;
              break;
            }
          }
          if (!flag) {
            return { ...res, filter: false }
          }
          else {
            return res;
          }

        })

        setFixedColdef(sortedArray);
      }
    }
  }

  const { data: coldef, refetch: fetchColdefSeq } = useQuery({
    queryKey: ["fetchcolDefSeq", props.MyRoute],
    queryFn: fetchSeq,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: fetchSeqSuccess,
  });

  const sendColDefSeq = (data: any) => {
    let dts: string = `route][${props.MyRoute}=cols][${data}=app][${props.appName}=flnme][cmn0grdstn=dll][s=fnct][c74`
    let body = {
      gid: getGid(),
      cmp: getCmpId(),
      usr: getUsrId(),
      dts: dts,
    };

    return nrjAxiosRequest("svfrm", body);
  };

  const changeColdef = (data: any) => {
    let tempList: any[] = [];
    setFixedColdef(fixedColDef.map((res: any) => {
      if (res.field == data) {
        if (!res.filter) {
          tempList.push(res);
        }
        return {
          ...res, filter: !res.filter
        }
      }
      if (res.filter) {
        tempList.push(res);
      }

      return res;
    }))

    setOrderedColdef(tempList);
  }

  const applyChanges = () => {
    setColdef(orderedColDef);
    let seq: string = "";
    orderedColDef.forEach((res: any) => {
      if (seq) {
        seq += ','
      }
      seq += res.field;
    })
    sendColDefSeq(seq).then((res: any) => {
      console.log("successfully saved sequence");
      res = dataStr_ToArray(res);
      setColDefSeq(res);
    }).catch(((res: any) => { console.log(res) }))
    handleClose();
  }

  const [sourceElement, setSourceElement] = useState<any>({})

  // const handleDragStart = (event: any) => {
  //   event.target.style.opacity = 0.5
  //   setSourceElement(event.target);
  //   event.dataTransfer.effectAllowed = 'move'
  // }

  /* do not trigger default event of item while passing (e.g. a link) */
  // const handleDragOver = (event: any) => {
  //   event.preventDefault()
  //   event.dataTransfer.dropEffect = 'move'
  // }

  // const handleDragEnter = (event: any) => {
  //   event.target.classList.add('over')
  // }

  // const handleDragLeave = (event: any) => {
  //   event.target.classList.remove('over')
  // }

  // const handleDrop = (event: any) => {
  //   /* prevent redirect in some browsers*/
  //   event.stopPropagation()

  //   /* only do something if the dropped on item is
  //   different to the dragged item*/
  //   if (sourceElement !== event.target) {

  //     /* remove dragged item from list */
  //     const list = orderedColDef.filter((item, i) => {
  //       return item.headerName !== sourceElement.outerText
  //     })

  //     /* this is the removed item */
  //     const removed = orderedColDef.filter((item, i) =>
  //       item.headerName === sourceElement.outerText)[0]
  //     /* insert removed item after this number. */
  //     let insertAt = Number(event.target.id)
  //     let tempList = []

  //     /* if dropped at last item, don't increase target id by +1.
  //        max-index is arr.length */
  //     if (insertAt >= list.length) {
  //       tempList = list.slice(0).concat(removed)
  //       setOrderedColdef(tempList)
  //       event.target.classList.remove('over')
  //     } else
  //       if ((insertAt < list.length)) {
  //         /* original list without removed item until the index it was removed at */
  //         tempList = list.slice(0, insertAt).concat(removed)

  //         /* add the remaining items to the list */
  //         const newList = tempList.concat(list.slice(
  //           insertAt))

  //         /* set state to display on page */
  //         setOrderedColdef(newList)
  //         event.target.classList.remove('over')
  //       }
  //   }
  //   else console.log('nothing happened')
  //   event.target.classList.remove('over')
  // }

  // const handleDragEnd = (event: any) => {
  //   event.target.style.opacity = 1
  // }

  useEffect(() => {
    if (Array.isArray(colDefSeq) && colDefSeq.length) {
      let tempColdefList: any[] = [];
      colDefSeq?.forEach((res: any) => {
        for (const el of orderedColDef) {
          if (el.field === res) {
            tempColdefList.push(el);
            break;
          }
        }
      })
      setOrderedColdef(tempColdefList);
    }
  }, [colDefSeq])


  function sortArrayByFieldOrder(inputArray: any[], sortOrder: any[]) {
    // Create a map to store the index of each field in the sortOrder array
    const fieldIndexMap: any = {};
    for (let i = 0; i < sortOrder.length; i++) {
      fieldIndexMap[sortOrder[i]] = i;
    }

    // Sort the inputArray based on the sortOrder
    inputArray.sort((a: any, b: any) => {
      const indexA: any = fieldIndexMap[a.field];
      const indexB: any = fieldIndexMap[b.field];

      if (indexA === undefined && indexB === undefined) {
        return 0;
      } else if (indexA === undefined) {
        // If field A is not found, move it to the end
        return 1;
      } else if (indexB === undefined) {
        // If field B is not found, move it to the end
        return -1;
      } else {
        // Compare based on their index in sortOrder
        return indexA - indexB;
      }
    });

    return inputArray;
  }

  function sortArrayByFieldOrderDeleted(inputArray: any, sortOrder: any) {
    // Create a map to store the index of each field in the sortOrder array
    const fieldIndexMap: any = {};
    for (let i = 0; i < sortOrder.length; i++) {
      fieldIndexMap[sortOrder[i]] = i;
    }

    // Filter out objects that don't have a matching field in sortOrder
    const filteredArray = inputArray.filter((item: any) => fieldIndexMap[item.field] !== undefined);

    // Sort the filteredArray based on the sortOrder
    filteredArray.sort((a: any, b: any) => {
      const indexA = fieldIndexMap[a.field];
      const indexB = fieldIndexMap[b.field];

      // Compare based on their index in sortOrder
      return indexA - indexB;
    });

    return filteredArray;
  }



  // const [highlightedRows, setHighlightedRows] = useState(new Set<string>());


  // const getFilterParameter = useCallback(() => {
  //   const api = gridRef.current?.api;
  //   if (!api) return;

  //   const filteredRowIds = new Set<string>();

  //   api.forEachNodeAfterFilter((node) => {
  //     if (node.data) {
  //       // ✅ Add both cbwtfid and hcfnm to highlightedRows
  //       if (node.data.cbwtfid) {
  //         filteredRowIds.add(String(node.data.cbwtfid)); // Ensure it's stored as a string
  //       }
  //       if (node.data.hcfnm) {
  //         filteredRowIds.add(node.data.hcfnm); // Store hospital name
  //       }
  //       if (node.data.cnt1) {
  //         filteredRowIds.add(node.data.cnt1); // Store hospital name
  //       }
  //       if (node.data.cnt2) {
  //         filteredRowIds.add(node.data.cnt2); // Store hospital name
  //       }
  //       if (node.data.fld1) {
  //         filteredRowIds.add(node.data.fld1); // Store hospital name
  //       }
  //       if (node.data.fld2) {
  //         filteredRowIds.add(node.data.fld2); // Store hospital name
  //       }
  //       if (node.data.dt_rpt) {
  //         filteredRowIds.add(node.data.dt_rpt);
  //       }
  //       if (node.data.cbwtfnm) {
  //         filteredRowIds.add(node.data.cbwtfnm);
  //       }

  //     }
  //   });

  //   const isFilterApplied = api.isAnyFilterPresent();
  //   // setHighlightedRows(isFilterApplied ? filteredRowIds : new Set());

  //   if (!isFilterApplied) {
  //     setHighlightedRows(new Set()); // ✅ Reset highlightedRows when filter is cleared
  //   } else {
  //     setHighlightedRows(isFilterApplied ? filteredRowIds : new Set());
  //   }

  //   // ✅ Ensure grid refresh to apply class rules
  //   api.refreshCells({ force: true });
  //   api.redrawRows(); // ✅ Ensures row class is updated
  // }, []);








  const [highlightedCells, setHighlightedCells] = useState(new Map<string, Set<string>>());

  const getFilterParameter = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) return;

    const filteredCellsMap = new Map<string, Set<string>>();

    api.forEachNodeAfterFilter((node) => {
      if (node.data) {
        Object.entries(node.data).forEach(([key, value]) => {
          if (value) {
            if (!filteredCellsMap.has(key)) {
              filteredCellsMap.set(key, new Set());
            }
            filteredCellsMap.get(key)?.add(String(value)); // Store only filtered values per column
          }
        });
      }
    });

    setHighlightedCells(filteredCellsMap);
    api.refreshCells({ force: true });
  }, []);







  const getValue = () => {
    return [
      [
        {
          data: {
            value: 'This is a dashboard report',
            type: "String",
          },
          mergeAcross: 5
        },
      ],

      [
        { data: { value: "For Date", type: "String" }, mergeAcross: 5 },
      ],
      [],
    ];
  };

  const getParams = () => ({
    prependContent: props.prependContent || getValue(),
    suppressQuotes: undefined,
    columnSeparator: undefined,
    fileName: "cpcb",
  });

  const onBtnExport = () => {

    let levelValue = getPrintTextValue(props.lvl, props.who, props.name) || "";
    exportToExcel(levelValue);
  }


  // Function to handle the export of the annual report to Excel
  const onBtnExport_sp = () => {
    // Get a formatted string based on the provided level, entity type, and name
    let levelValue = getPrintTextValue(props.lvl, props.who, props.name) || "";
    // Call the function to export data to Excel using the generated levelValue
    exportToExcel_sp(levelValue);
  }

  // const excelStyles = useMemo<ExcelStyle[]>(() => {
  //   return [
  //     {
  //       id: "header",
  //       font: {
  //         size: 14,
  //         bold: true,
  //         color: '#000',
  //       },
  //       alignment: {
  //         vertical: "Center",

  //       },
  //       interior: {
  //         color: "#bec0bf",

  //         pattern: "Solid",
  //         patternColor: undefined,
  //       },
  //       borders: {
  //         borderBottom: {
  //           color: "#000",
  //           lineStyle: "Continuous",
  //           weight: 1,
  //         },
  //         borderTop: {
  //           color: "#000",
  //           lineStyle: "Continuous",
  //           weight: 1,
  //         },
  //         borderRight: {
  //           color: "#000",
  //           lineStyle: "Continuous",
  //           weight: 1,
  //         }
  //       },
  //     },
  //     {
  //       id: "headerGroup",
  //       font: {
  //         bold: true,
  //       },
  //     },
  //     {
  //       id: "cpcbHeading",
  //       font:{
  //         size:30,
  //         bold:true
  //       },
  //       alignment:{
  //         horizontal:'Center',
  //         vertical: 'Center'
  //       },
  //       interior: {
  //         color: "#31adff",
  //         pattern: "Solid",
  //       },
  //     },
  //     {
  //       id: "subHeading",
  //       font:{
  //         size:22,
  //         bold:true
  //       },
  //       alignment:{
  //         horizontal:'Center',
  //         vertical: 'Center'
  //       },
  //     },
  //     {
  //       id: "subHeadingDate",
  //       font:{
  //         size:18,
  //         bold:true
  //       },
  //       alignment:{
  //         horizontal:'Center',
  //         vertical: 'Center'
  //       },
  //     },

  //   ];
  // }, []);


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
          if (data[i][KeyOrder[j]] == 0) {
            rw[KeyOrder[j]] = 0
          }
          else {
            rw[KeyOrder[j]] = ""
          }
        }
        j += 1;
      }
      newData.push(rw);
      i += 1
    }
    let sortedArray = []
    // if (props.sortBy) {
    //   sortedArray = [...newData].sort((a, b) => a[props.sortBy].localeCompare(b[props.sortBy]))
    // }
    if (props.sortBy) {
      sortedArray = [...newData].sort((a, b) => {
        const aValue = a[props.sortBy] || '';
        const bValue = b[props.sortBy] || '';
        return aValue.localeCompare(bValue);
      });
    }
    else {
      sortedArray = [...newData]
    }
    return sortedArray;
  }

  const exportToExcel = (levelValue: string) => {

    let dat: any = rowData;
    dat = rearng(dat, props.KeyOrder);

    //const worksheet = XLSX.utils.sheet_to_json(data)
    const emptyRows = Array(6).fill({});
    const dataWithEmptyRows = emptyRows.concat(dat);
    const worksheet = XLSX.utils.json_to_sheet(dataWithEmptyRows, { skipHeader: true });
    //  const worksheet = XLSX.utils.aoa_to_sheet(dt);
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
    XLSX.utils.sheet_add_aoa(worksheet, [["Central Pollution Control Board"]], { origin: "A1" });
    worksheet['!merges'] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }];
    const today = new Date();
    const options: any = { day: '2-digit', month: 'short', year: 'numeric' };
    const dateString = today.toLocaleDateString('en-US', options)
    XLSX.utils.sheet_add_aoa(worksheet, [[props.pageTitle + dateString]], { origin: "A2" });
    worksheet['!merges'] = [{ s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }];

    XLSX.utils.sheet_add_aoa(worksheet, [[levelValue]], { origin: "A3" });

    XLSX.utils.sheet_add_aoa(worksheet, [props.printExcelHeader || []], { origin: "A5" });
    //  XLSX.utils.sheet_add_aoa(worksheet, [["                                    Word Summary"]], {origin: "A1"});

    //  XLSX.utils.sheet_add_aoa(worksheet, [["                                    Word Summary"]], {origin: "C1"});
    // XLSX.utils.encode_row(7).fontsize("18");
    //      for (let i = 0; i <= 2; i++) {
    //       const cell = XLSX.utils.encode_cell({ r: 0, c: i });
    //       const cellRef = worksheet[cell];
    // if (cellRef && cellRef.s) {
    //   cellRef.s = {
    //     ...cellRef.s,
    //     alignment: { horizontal: 'center' },
    //     font: { bold: true },

    //   };
    // } else {
    //   worksheet[cell] = {
    //     ...cellRef,
    //     s: {
    //       alignment: { horizontal: 'center' },
    //       font: { bold: true },

    //     }
    //   };


    //}

    //  }


    //  const headers = Object.keys(data[0]); // Assuming all objects in data have the same structure
    //  XLSX.utils.sheet_add_json(worksheet, [headers], { origin: 'A2' });


    //const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();


    const wscols = props.exceColWidth || [
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 }
    ];

    worksheet['!cols'] = wscols;
    //  worksheet['E1'].s.font.sz = 20;
    //  worksheet['B1'].s.font.sz = 20;
    //  worksheet['C1'].s.font.sz = 20;

    // worksheet['A1'].s = {
    //   fill: {
    //     patternType: 'solid',
    //     fgColor: { rgb: 'FFFF00' } // Yellow color
    //   }
    // };
    // const cell_format = worksheet.add_format({'bold': true, 'italic': true})
    // worksheet.write(1,1,"A", {'bold': true, 'italic': true})
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    // worksheet.getRow(1).fill
    //worksheet["!cols"][2] = {hidden:true}
    if (!worksheet['!rows']) worksheet['!rows'] = [];
    // worksheet['!rows'][5]   .font.sz = 30
    // worksheet.set_row(4, {'font_size': 30})
    // worksheet["rows"].fill = {
    //   type: "pattern",
    //   pattern: "darkVertical",
    //   fgColor: { argb: "FFFF00" },
    // };
    const fileName = props.pageTitle ? props.pageTitle + ".xlsx" : "data.xlsx";

    XLSX.writeFile(workbook, fileName);
    // const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // saveAs(blob, `${fileName}.xlsx`);
  };


  const exportToExcel_sp = (levelValue: string) => {
    // Rearrange data
    let dat: any = rowData;
    if (rowData.length == 0) {
      return;
    }
    const data = rearng(dat, props.KeyOrder);

    // Header rows
    const headerRow1: string[] = [];
    const headerRow2: string[] = [];

    headerRow1[0] = 'Sno.';
    headerRow1[1] = 'Name of the State/UT';
    headerRow1[2] = 'Total no. of Bedded Health Care Facilities (HCFs)';
    headerRow1[3] = 'Total no. of Non-bedded Health Care Facilities (HCFs)';
    headerRow1[4] = 'Total no. Health Care Facilities (HCFs)';
    headerRow1[5] = 'Total no. of beds';
    headerRow1[6] = 'Authorization Status';
    headerRow1[10] = 'No. of HCFs utilizing CBWTFs';
    headerRow1[11] = 'Total Quantity of BMW generated (kg/day)';
    headerRow1[12] = 'Total Quantity of BMW Covid-19 waste generated (kg/day)';
    headerRow1[13] = 'Total Quantity of BMW Treated and Disposed (kg/day)';
    headerRow1[14] = 'Captive BMW Treatment Facilities Operated by HCFs';
    headerRow1[16] = 'Common Bio-medical Waste Treatment Facilities (CBWTFs)';
    headerRow1[18] = 'Deep burial installed by HCF & CBWTFs';
    headerRow1[20] = 'Total Biomedical waste treated by captive treatment facilities by HCF (Kg/day)';
    headerRow1[21] = 'Total Biomedical waste treated by CBWTFs (kg/day)';
    headerRow1[22] = 'Total no. of HCFs & CBWTFs violating BMWM Rules, 2016';
    headerRow1[23] = 'Total No. of show cause notices/Directions issued to defaulter HCFs/CBWTFs';
    headerRow1[24] = 'No. of CBWTFs that have installed COEMS';

    headerRow2[6] = 'Total no. of authorised HCFs out of total HCFs';
    headerRow2[7] = 'Total no. of unauthorised HCFs out of total HCFs';
    headerRow2[8] = 'Total no. of HCFs granted authorization in year…';
    headerRow2[9] = 'Total no. of HCFs in operation without Authorization in year…';
    headerRow2[14] = 'No. of HCFs having Captive Treatment Facilities';
    headerRow2[15] = 'No of Captive Incinerators Operated by HCFs';
    headerRow2[16] = 'CBWTFs Operational';
    headerRow2[17] = 'CBWTFs under Construction';
    headerRow2[18] = 'HCF';
    headerRow2[19] = 'CBWTFs';

    const headerData = [headerRow1, headerRow2];

    // Add Roman numerals as row 3
    const toRoman = (num: number): string => {
      const romanMap: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
      ];
      let result = '';
      for (const [value, numeral] of romanMap) {
        while (num >= value) {
          result += numeral;
          num -= value;
        }
      }
      return result;
    };

    const columnCount = 25;
    const romanRow = Array.from({ length: columnCount }, (_, i) => `${toRoman(i + 1)}.`);
    headerData.push(romanRow);

    const dataRows = data.map((item, index) => {
      return [
        index + 1,                                  //  1. Sno.
        item.sttname || '',                         //  2. Name of the State/UT 
        item.totbdh || 0 ,                          //  3. Total no. of  Bedded Health Care Facilities (HCFs)
        item.totalNonBedded  || 0 ,                 //  4. Total no. of  Non-bedded Health Care Facilities (HCFs) | 2.12 to 2.9
        item.tothcf || 0 ,                          //  5. Total no. Health Care Facilities (HCFs)
        item.totalNoBeds || 0 ,                          //  6. 2.1 to 2.9  
        item.ttlauthapp || 0 ,                      //  7. Authorization Status > 3.1 Total number of authorized HCFs out of total HCFs
        item.ttlunauthapp || 0 ,                    //  8. Authorization Status > 3.2 Total number of unauthorized HCFs out of total HCFs
        item.ttlgrt   || 0 ,                        //  9. Authorization Status > 3.4 Total number of HCFs granted authorization (in year 2023)
        item.ttlwth || 0 ,                          //  10. Authorization Status > 3.7 Total number of HCFs in operation without authorization (in year 2023)
        item.ttlwth1 || 0 ,                         //  11. No. of HCFs utilizing CBWTFs
        item.wstgnr  || 0 ,                         //  12. Total Quantity of generated (kg/day)
        item.wstgnrbd || 0 ,                        // Total Quantity of BMW Covid-19 waste generated (kg/day)
        item.wsttrt || 0 ,                          //  13. Total Quantity of BMW  Treated and Disposed (kg/day) | 6.4 Total biomedical waste treated and disposed of through CBWTFs (kg/day)
        item.hcfcptv || 0 ,                         //  14. Captive BMW Treatment Facilities Operated by HCFs > No. of HCFs having Captive Treatment Facilities | 5.1 In case HCFs are having captive treatment facility, provide information regarding the number of HCFs having captive treatment facilities
        item.hcfcptvopr || 0 ,                      //  15. Captive BMW Treatment Facilities Operated by HCFs > No of Captive Incinerators Operated by HCFs | 5.1.1Number of captive incinerators operated by HCFs
        item.oprcbwtf   || 0 ,                      //  16. Common Bio-medical Waste Treatment Facilities (CBWTFs) > > CCBWTFs Operational | 6.3 Number of CBWTFs having deep burial pits (deep burials are not allowed in CBWTFs) 
        item.cbwtfcns   || 0 ,                      //  17. Common Bio-medical Waste Treatment Facilities (CBWTFs) > > CBWTFs under Construction | 6.2 Number of CBWTFs under construction
        item.deepburpits || 0 ,                     //  18. Deep burial installed by HCF & CBWTFs > HCF | 5.1.3 Number of HCFs having deep burial pits
        item.cbwtfopr || 0 ,                        //  19. Deep burial installed by HCF & CBWTFs > CBWTFs | 6.3  Number of CBWTFs having deep burial pits (deep burials are not allowed in CBWTFs)
        item.cptvwst || 0 ,                         //  20. Total Biomedical waste treated by captive treatment facilities by HCF (Kg/day) |5.2 Total biomedical waste treated in captive treatment facilities (kg/day)
        item.wsttrt || 0 ,                          //  21. Total Biomedical waste treated by CBWTFs (kg/day) | 6.4 Total biomedical waste treated and disposed of through CBWTFs (kg/day)
        item.totalViolatingRule || 0,              //  22. Total no. of HCFs & CBWTFs violating BMWM Rules, 2016 | (vlthcf + vltcbtwf)
        item.totalShowCause || 0,                  //  23. Total No. of show cause notices/Directions issued to defaulter HCFs/CBWTFs | (shwhcf + shwcbtwf)
        item.ttlcoem || 0,                         //  22. No. of CBWTFs that have installed COEMS | 6.5 Number of CBWTFs installed COEMS       
      ];
    });

    const allData = headerData.concat(dataRows);

    const worksheet = XLSX.utils.aoa_to_sheet(allData);

    // Merge header cells
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
      { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },
      { s: { r: 0, c: 6 }, e: { r: 0, c: 9 } },
      { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } },
      { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } },
      { s: { r: 0, c: 12 }, e: { r: 1, c: 12 } },
      { s: { r: 0, c: 13 }, e: { r: 1, c: 13 } },
      { s: { r: 0, c: 14 }, e: { r: 0, c: 15 } },
      { s: { r: 0, c: 16 }, e: { r: 0, c: 17 } },
      { s: { r: 0, c: 18 }, e: { r: 0, c: 19 } },
      { s: { r: 0, c: 20 }, e: { r: 1, c: 20 } },
      { s: { r: 0, c: 21 }, e: { r: 1, c: 21 } },
      { s: { r: 0, c: 22 }, e: { r: 1, c: 22 } },
      { s: { r: 0, c: 23 }, e: { r: 1, c: 23 } },
      { s: { r: 0, c: 24 }, e: { r: 1, c: 24 } },
    ];

    worksheet['!freeze'] = {
      xSplit: 1,
      ySplit: 3,
      topLeftCell: 'B4',
      activePane: 'bottomRight',
    };

    worksheet['!rows'] = [
      { hpt: 80 },  // Row 1
      { hpt: 150 }, // Row 2
      { hpt: 30 }   // Row 3 (Roman numerals)
    ];

    // worksheet['!cols'] = Array.from({ length: columnCount }, () => ({ wch: 10 }));

    // Apply rotation style to all headers except column 2 (index 1)
    const rotatedHeaderStyle = {
      alignment: { textRotation: 90, vertical: 'center', horizontal: 'center' }
    };

    // Loop through all columns (excluding column 2, index 1)
    for (let col = 0; col < allData[0].length; col++) {
      if (col === 1) continue; // Skip column 2 (index 1)

      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = rotatedHeaderStyle;
    }

    // Set column width for all columns, skipping column 2 (index 1)
    worksheet['!cols'] = allData[0].map((_, index) => {
      // Skip column 2 (index 1) by giving it a normal width
      if (index === 1) {
        return { wch: 20 }; // Default width for column 2
      } else {
        return { wch: 7 }; // Narrow width for rotated columns
      }
    });

    // Style cells
    Object.keys(worksheet).forEach((cellRef) => {
      if (!cellRef.startsWith('!')) {
        const cell = worksheet[cellRef];
        const row = parseInt(cellRef.match(/\d+/)?.[0] || '0', 10);
        const col = cellRef.charCodeAt(0) - 65;

        // Row 1
        if (row === 1) {
          const verticalCols = [2, 3, 4, 5, 10, 11, 12, 13, 20, 21, 22, 23, 24];
          cell.s = {
            alignment: {
              textRotation: verticalCols.includes(col) ? 90 : 0,
              vertical: 'center',
              horizontal: 'center',
              wrapText: true,
            },
            font: { bold: true },
          };
        }

        // Row 2
        if (row === 2) {
          const verticalCols = [6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 19];
          cell.s = {
            alignment: {
              textRotation: verticalCols.includes(col) ? 90 : 0,
              vertical: 'center',
              horizontal: 'center',
              wrapText: true,
            },
            font: { bold: true },
          };
        }

        // Row 3 (Roman)
        if (row === 3) {
          cell.s = {
            alignment: {
              vertical: 'center',
              horizontal: 'center',
            },
            font: {
              bold: false,
              // color: { rgb: '0000FF' },
            }
          };
        }

        // Data rows
        if (row > 3) {
          cell.s = {
            alignment: {
              textRotation: 0,
              vertical: 'center',
              horizontal: 'center',
              wrapText: true,
            }
          };
        }
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AR Report');
    XLSX.writeFile(workbook, 'Annual_Report_Vertical.xlsx');
  };


  const onBtnPrint = () => {
    //
    // const coldefPdf =   [
    //     serialNo,
    //     ...(props.colDefPdf || []).map((res: any) => {
    //       return {
    //         ...res,
    //         filter: true
    //       }
    //     })

    //   ]
    exportToPDF(props.colDefPdf, rowData, props.pdfColWidth, props.pageTitle, props.lvl, props.who)
  }

  const onPageSizeChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    setPgSize(value);

  };






  // const defaultColDef = useMemo(() => {
  //   return {
  //     flex: 1,
  //     filter: "agSetColumnFilter", // Set Filter as default
  //     filterParams: {
  //       comparator: (a:any, b:any) => {
  //         const valA = a == null ? 0 : parseInt(a);
  //         const valB = b == null ? 0 : parseInt(b);
  //         if (valA === valB) return 0;
  //         return valA > valB ? 1 : -1;
  //       },
  //       suppressMiniFilter: false, // Enable the search field only
  //       suppressSelectAll: true, // Remove "Select All" option
  //       suppressFilterButton: true, // Hide "Apply" button
  //       closeOnApply: true, // Close filter popup after selection
  //       alwaysShowBothConditions: false, // Ensure only one input field is shown
  //       suppressAndOrCondition: true, // Remove "AND/OR" logic
  //     },
  //     sortable: true,
  //     resizable: true,
  //   };
  // }, []);

  const defaultColDef = {
    filter: 'agTextColumnFilter',
    filterParams: {
      // filterOptions: ['contains'], // Apply 'contains' logic internally
      // suppressFilterOptions: true, // Prevent dropdown from being shown or modified
      buttons: [], // Remove AND/OR and reset/apply buttons
      closeOnApply: true,
      suppressAndOrCondition: true,
      debounceMs: 200,
      filterPlaceholder: 'Filter', // Show 'Search...' placeholder text
      defaultOption: 'contains', // Use 'contains' as the default filter option
    },
    sortable: true,
    resizable: true,
  };





  const [searchText, setSearchText] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    gridRef.current?.api.setQuickFilter(value);
  };

  return (
    <div className="w-full flex flex-col px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10 bg-white shadow-lg rounded-lg">
      {props.showExport && (
        <div className="flex justify-between flex-wrap gap-2 mb-2">
          <div className="flex gap-2">
            <button
              onClick={onBtnPrint}
              className="flex items-center border border-black rounded-lg px-4 py-2 font-bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-pdf-fill text-red-500 mr-2" viewBox="0 0 16 16">
                <path d="M5.523 10.424q.21-.124.459-.238a8 8 0 0 1-.45.606c-.28.337-.498.516-.635.572l-.035.012a.3.3 0 0 1-.026-.044c-.056-.11-.054-.216.04-.36.106-.165.319-.354.647-.548m2.455-1.647q-.178.037-.356.078a21 21 0 0 0 .5-1.05 12 12 0 0 0 .51.858q-.326.048-.654.114m2.525.939a4 4 0 0 1-.435-.41q.344.007.612.054c.317.057.466.147.518.209a.1.1 0 0 1 .026.064.44.44 0 0 1-.06.2.3.3 0 0 1-.094.124.1.1 0 0 1-.069.015c-.09-.003-.258-.066-.498-.256M8.278 4.97c-.04.244-.108.524-.2.829a5 5 0 0 1-.089-.346c-.076-.353-.087-.63-.046-.822.038-.177.11-.248.196-.283a.5.5 0 0 1 .145-.04c.013.03.028.092.032.198q.008.183-.038.465z" />
                <path fillRule="evenodd" d="M4 0h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m.165 11.668c.09.18.23.343.438.419.207.075.412.04.58-.03.318-.13.635-.436.926-.786.333-.401.683-.927 1.021-1.51a11.6 11.6 0 0 1 1.997-.406c.3.383.61.713.91.95.28.22.603.403.934.417a.86.86 0 0 0 .51-.138c.155-.101.27-.247.354-.416.09-.181.145-.37.138-.563a.84.84 0 0 0-.2-.518c-.226-.27-.596-.4-.96-.465a5.8 5.8 0 0 0-1.335-.05 11 11 0 0 1-.98-1.686c.25-.66.437-1.284.52-1.794.036-.218.055-.426.048-.614a1.24 1.24 0 0 0-.127-.538.7.7 0 0 0-.477-.365c-.202-.043-.41 0-.601.077-.377.15-.576.47-.651.823-.073.34-.04.736.046 1.136.088.406.238.848.43 1.295a20 20 0 0 1-1.062 2.227 7.7 7.7 0 0 0-1.482.645c-.37.22-.699.48-.897.787-.21.326-.275.714-.08 1.103" />
              </svg>
              Export PDF
            </button>

            <button
              onClick={onBtnExport}
              className="flex items-center border border-black rounded-lg px-4 py-2 font-bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-arrow-down-fill text-green-500 mr-2" viewBox="0 0 16 16">
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m-1 4v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 11.293V7.5a.5.5 0 0 1 1 0" />
              </svg>
              Export excel
            </button>

          </div>
          <div className="relative w-56 sm:w-44 md:w-52 lg:w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearch}
              className="w-full p-2 pr-10 text-sm rounded-md border border-black bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <AiOutlineSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      )}


      {props.showExportExcel && ( // Conditionally render the export section if showExportExcel is true
        <div className="flex justify-between flex-wrap gap-2 mb-2"> {/* Container with flex layout for spacing */}

          <div className="flex gap-2"> {/* Inner container for button spacing */}

            <button
              onClick={onBtnExport_sp} // Call the export function when the button is clicked
              className="flex items-center border border-black rounded-lg px-4 py-2 font-bold" // Styling for the button
            >
              {/* SVG icon for visual representation of export/download */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-file-earmark-arrow-down-fill text-green-500 mr-2"
                viewBox="0 0 16 16"
              >
                <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1m-1 4v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 11.293V7.5a.5.5 0 0 1 1 0" />
              </svg>

              Export excel {/* Button label */}
            </button>

          </div>
        </div>
      )}


      <div className="flex-grow overflow-hidden">
        <div
          className="ag-theme-alpine w-full border-b border-gray-300"
          style={{ height: `${gridHeight}px`, minHeight: "450px", overflow: "auto" }}
        >
          <AgGridReact
            onGridReady={onGridReady}
            onCellClicked={onCellClicked}
            onCellEditingStopped={CellEditingStopped}
            rowSelection="single"
            ref={gridRef}
            columnDefs={colDef}
            rowData={rowData}
            onSelectionChanged={onSelectionChanged}
            pagination={props.showPagination ?? true}
            paginationPageSize={pgSize}
            onPaginationChanged={paginationChanged}
            className="ag-theme-alpine"
            rowHeight={props.rowHeight ?? 40}
            defaultColDef={defaultColDef}
            enableBrowserTooltips={props.showTooltips ?? false}
            onSortChanged={onSortChanged}
            onBodyScroll={onBodyScroll}
            // rowClassRules={rowClassRules}
            onFilterChanged={getFilterParameter}
            quickFilterText={searchText}
            onColumnResized={onColumnResized} // Add this line
            // getRowStyle={getRowStyle} 
            overlayNoRowsTemplate={`<span style="padding: 10px; display: block;">No rows to show</span>`}
          />
        </div>


        <div className="text-right mt-3">
          <label htmlFor="pageSizeSelect" className="mr-2 text-sm font-medium">Records per page:</label>
          <select
            id="pageSizeSelect"
            onChange={(e) => {
              const newSize = parseInt(e.target.value);
              setGridHeight(newSize * 40 + 56); // Adjust grid height dynamically
              onPageSizeChanged(e);
            }}
            className="border border-gray-400 p-1 rounded-md focus:ring-2 focus:ring-blue-400 text-sm"
          >
            <option value={15}>15</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>


  );

};

export default NrjAgGrid;

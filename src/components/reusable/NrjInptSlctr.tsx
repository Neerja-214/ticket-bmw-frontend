import React, { useState, useEffect, useCallback } from "react";
import { InputPicker } from "rsuite";
import axios from "axios";
import { Button } from "@mui/material";
import { usePrevious } from "react-use";
import { Tooltip, Whisper } from "rsuite";
import { TypeAttributes } from "rsuite/esm/@types/common";
import { toast } from 'react-toastify';
import utilities, {
  cmboStr,
  cmboStr_fnct,
  createGetApi,
  getCmpId,
  getUsrId,
} from "../../utilities/utilities";
import { useGetFldValue } from "../../Hooks/useGetFldValue";
import { ItemDataType } from "rsuite/esm/@types/common";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { useNrjAxios } from "../../Hooks/useNrjAxios";
import NrjIcons from "./icons/NrjIcons";

type NrjInputSelc = {
  onChange: (data: string) => void;
  Label: string;
  ClssName?: string;
  idText: string;
  selectedValue: string;
  fldName: string;
  clrFnct: number;
  typr: string;
  dbCon: string;
  allwZero: string;
  fnctCall?: boolean;
  dllName?: string;
  fnctName?: string;
  parms?: string;
  allwSrch?: boolean | true;
  delayClose?: number;
  placement?: TypeAttributes.Placement;
  speaker?: string;
  onBlurrSlctr?: () => void;
  loadOnDemand?: string | boolean;
  casscadingValue?: number;
  showAddButton?: boolean;
  disable?: boolean;
  onSearchDb?: (fldNm: string, fltr: string) => void;
  Icon?: string;
  IconSize?: string;
  IconColor?: string;
};
const NrjInptSlctr = (props: NrjInputSelc) => {
  const { onChange, selectedValue, fldName, onBlurrSlctr, onSearchDb } = props;
  const [text, setText] = useState("");
  const [tooltipOpen, settooltipOpen] = useState(false);
  const [apiCall, setApiCall] = useState("");
  const [defValue, setDefvalue] = useState("");
  const [frstLoad, setFirstLoad] = useState("");
  const prvApi = usePrevious(apiCall);
  // const [isSearch, setIsSearch] = useState(false);
  // const [fld, setfld] = useState("");
  const [drpdata, setDrpdata] = useState([]);
  const cmp: string = getCmpId() || "1";
  const usr: string = getUsrId() || "2";
  let fltr: string = "";
  let apiString: string = "";
  // const data = null;// = [];
  let style = { "z-index": "999" };

  const itmInList = (fnd: string) => {
    let lst = drpdata;
    fnd = fnd.toLowerCase();
    for (var i = 0, j = lst.length; i < j; i++) {
      let lstitm: string = lst[i]["txt"];
      if (lstitm) {
        lstitm = lstitm.toLowerCase();
        if (lstitm.indexOf(fnd) > -1) {
          return false;
        }
      }
    }
    return true;
  };

  const searchFltr = (fnd: string) => {
    if (props.allwSrch) {
      if (fnd) {
        if (itmInList(fnd)) {
          fltr = fnd;
          DbSrch()

          //dbSrch();
        }
      }
    }
  };
  const DbSrch = () => {
    // console.log("srch " + fltr)
    apiString = "";
    if (onSearchDb) {
      onSearchDb(props.fldName, fltr);
    }
    let msg: string = "";
    let csv: number; //= props.casscadingValue ? props.casscadingValue : 0;
    let c: any = props.casscadingValue;
    if (c) {
      csv = Number(c);
    } else {
      csv = 0;
    }

    if (props.fnctCall) {
      msg = cmboStr_fnct(
        props.dbCon,
        props.dllName ? props.dllName : "",
        props.fnctName ? props.fnctName : "",
        props.parms ? props.parms + fltr : fltr
      );
    } else if (csv === 0) {
      if (props.typr && props.dbCon && props.typr !== "1") {
        // console.log("search " + fltr)
        msg = cmboStr(props.dbCon, props.typr, props.allwZero, fltr);
      }
    } else if (csv > 0) {
      if (props.typr && props.dbCon && props.typr !== "1") {
        // console.log("search " + fltr)
        msg = cmboStr(props.dbCon, props.typr, props.allwZero, fltr, csv);
      }
    }

    if (msg) {
      apiString = msg;
      refetch()
    }
  };

  const CallQ = () => {
    return useNrjAxios({ apiCall: apiString })
  }

  const popCombo = (srvDta: any) => {
    if (!srvDta) {
      return;
    }
    // console.log("pop" , srvDta)
    if (typeof srvDta !== "string" && !srvDta.data[0]["Data"]) {
      return;
    }
    let str: string = "";
    if (typeof srvDta === "string") {
      str = srvDta;
      if (str.indexOf("][") === -1) {
        return;
      }
    } else {
      str = srvDta.data[0]["Data"];
    }

    if (str) {
      str = str.replace("#1", "");
    }

    if (str) {
      let frst: string = frstLoad;
      if (frst.length < 1) {
        setFirstLoad(str);
      }
      let cmbs = str.split("|=|");
      let itms = cmbs[0].split("$^");
      let Drpdwn = [];
      for (var i = 0, j = itms.length; i < j; i++) {
        let ech = itms[i].split("=");
        let id = ech[0].split("][");
        let vl = ech[1].split("][");
        let dat = {
          id: id[1],
          txt: vl[1],
        };
        if (dat.id && dat.txt) {
          Drpdwn.push(dat);
        }
      }
      const d: any = Drpdwn;
      setDrpdata(d);
    } else {
      //console.log("nodata");
    }
  };

  // useEffect(() => {
  //   dbSrch("");
  // }, [0]);

  const onChangeText = (value: string, event: any) => {
    // console.log(value)
    if (value) {
      setText(value);
      // console.log(event)
      let msg: string = "";
      for (let i = 0, j = drpdata.length; i < j; i++) {
        if (drpdata[i]["id"] === value) {
          msg = drpdata[i]["txt"];
          msg = "=" + fldName.substring(0, fldName.length - 2) + "][" + msg;
          break;
        }
      }
      onChange(fldName + "][" + value + msg);
    } else {
      setText("");
      onChange(fldName + "][");
    }
  };

  const onSelect = (value: string, item: ItemDataType, event: any) => {
    // console.log(value);
    // console.log(item["txt"]);
    // console.log(event);

    onChange(fldName + "][" + value);
    if (value) {
      settooltipOpen(false);
    }
  };
  const tltpClose = useCallback(() => {
    settooltipOpen(false);
  }, [tooltipOpen]);

  useEffect(() => {
    if (props.loadOnDemand) {
      popCombo(props.loadOnDemand);
    } else {
      if (props.casscadingValue ? props.casscadingValue : 0 === 0) {
        DbSrch();
      }
    }
  }, [0]);

  useEffect(() => {
    if (props.loadOnDemand) {
      popCombo(props.loadOnDemand);
    }
  }, [props.loadOnDemand]);

  useEffect(() => {
    if (props.casscadingValue ? props.casscadingValue : 0 > 1) {
      DbSrch();
    }
  }, [props.casscadingValue]);

  useEffect(() => {
    if (props.clrFnct) {
      if (props.clrFnct === 1) {
        if (props.allwSrch ? props.allwSrch : false) {
          setDrpdata([]);
        }
      } else if (props.clrFnct === 2) {
        let fr: string = frstLoad;
        if (fr.length > 5) {
          popCombo(fr);
        }
      }
    }
  }, [props.clrFnct]);

  const SetValue = () => {
    let vl: string = useGetFldValue(selectedValue, fldName);

    if (vl) {
      let ech: any = vl.split("|");
      let itm: any;
      itm = {
        id: ech[0],
        txt: ech[1],
      };
      let blnFnd: boolean = false;
      for (let i = 0, j = drpdata.length; i < j; i++) {
        if (drpdata[i]) {
          if (
            drpdata[i]["id"] === itm["id"] &&
            drpdata[i]["txt"] === itm["txt"]
          ) {
            blnFnd = true;
          }
        }
      }

      if (!blnFnd) {
        if (itm) {
          //drpdata.concat(itm)
          setDrpdata([]);
          setDrpdata(itm);
        }
      }
      //    setDefvalue(ech[1])
      setText(ech[0]);
      onChange(fldName + "][" + ech[0] + "=" + fldName.substring(0, fldName.length - 2) + "][" + ech[1]);
    }
  };

  // const SaveNewEntry = () => {
  //   if (fltr && fltr.length > 0) {
  //     if (itmInList(fltr)) {
  //       //Add the new item
  //       let msg: string = "https://www.thetaskmate.in/api/GetFldValue/";
  //     }
  //   }
  // };

  const onBlurr = (event: any) => {
    if (props.speaker) {
      if (props.delayClose) {
        if (!text) {
          settooltipOpen(true);
        } else {
          settooltipOpen(false);
        }
      }
    }
    if (onBlurrSlctr) {
      onBlurrSlctr();
    }
  };

  // Close the Speaker after delay of the set delayclose
  const onOpenSpkr = () => {
    if (props.delayClose) {
      setTimeout(function () {
        settooltipOpen(false);
      }, props.delayClose);
    }
  };
  useEffect(() => {
    SetValue();
  }, [selectedValue]);

  const errQ = (err: any) => {
    console.log(err);
  };

  const { data, refetch, isLoading } = useQuery({
    queryKey: [
      "Combo",
      props.typr,
      props.dbCon,
      fltr,
      props.fnctCall,
      props.casscadingValue,
    ],
    queryFn: CallQ,
    enabled: false,
    // staleTime: Number.POSITIVE_INFINITY,
    onSuccess: popCombo,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onError: errQ,
  });

  const AddMstrItem = () => {
    let api: string = "";
    api = createGetApi(
      "db=" + props.dbCon + "|dll=cntbkdll|fnct=e4",
      props.typr + "=" + fltr + "=1=0=0"
    );
    return useNrjAxios({ apiCall: api });
  };

  const addItem = () => {
    if (fltr && fltr.length > 0) {
      if (itmInList(fltr)) {
        refetchAdd();
      }
    }
  };

  const SaddItem = () => { };

  const { data: dataAdd, refetch: refetchAdd } = useQuery({
    queryKey: ["AddItem", fltr],
    queryFn: AddMstrItem,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    onSuccess: SaddItem,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const addB: boolean = props.showAddButton ? props.showAddButton : false;
  const dsbl: boolean = props.disable ? props.disable : false;
  if (!addB) {
    return (
      <div className="w-12/12">
        <div className="relative ml-11 h-8 ">
          <div>
            <Whisper
              open={tooltipOpen}
              onClose={tltpClose}
              delayClose={props.delayClose}
              trigger={"none"}
              onOpen={onOpenSpkr}
              placement={props.placement}
              speaker={
                <Tooltip style={{ backgroundColor: "red", fontSize: 12 }}>
                  {props.speaker}
                </Tooltip>
              }
            >
              <div className=" flex" style={{ marginTop: 2, height: 35, width: "99.1%" }}>

                {props.Icon ? (
                  <div style={{ width: "6%", border: "1px solid #31adff", padding: "4px", marginLeft: -15 }}>
                    <NrjIcons FillColor={props.IconColor ? props.IconColor : ""} Icon={props.Icon ? props.Icon : ""} Size={props.IconSize ? props.IconSize : ""} />
                  </div>
                ) : null}
                <div style={{ width: "110%" }}>
                  <InputPicker
                    size="md"
                    onBlur={onBlurr}
                    data={drpdata}
                    disabled={dsbl}
                    labelKey="txt"
                    valueKey="id"
                    onSearch={searchFltr}
                    onChange={onChangeText}
                    id={props.idText}
                    placeholder={props.Label}
                    cleanable={true}
                    value={text}
                    defaultValue={defValue}
                    onSelect={onSelect}
                    style={{
                      // borderColor: "#31adff",
                      width: "100%",
                      // marginLeft: -1,
                      borderStyle: "solid",
                      marginTop: -1,
                      borderWidth: 1,
                      borderRadius: 1
                    }}
                  />
                </div>

              </div>
            </Whisper>
            {/* </Whisper> */}
            {/* <InputPicker data={drpdata} labelKey='txt' valueKey='id' onSearch={searchFltr}  value={text}  onChange={onChangeText}   id={props.idText} className="block px-2.5 pb-2.5 h-9 text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer font-Roboto w-full" placeholder="Test "   /> */}
            {/* <label htmlFor={props.idText} className="absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-4 left-1">{props.Label}</label> */}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-12/12">
        <div className="relative ml-11 h-8 ">
          <div>
            <Whisper
              open={tooltipOpen}
              onClose={tltpClose}
              delayClose={props.delayClose}
              trigger={"none"}
              onOpen={onOpenSpkr}
              placement={props.placement}
              speaker={
                <Tooltip style={{ backgroundColor: "red", fontSize: 12 }}>
                  {props.speaker}
                </Tooltip>
              }
            >
              <div className="flex">
                <div style={{ marginTop: 2, height: 35, width: "85%" }}>
                  <InputPicker
                    size="lg"
                    onBlur={onBlurr}
                    data={drpdata}
                    labelKey="txt"
                    valueKey="id"
                    onSearch={searchFltr}
                    onChange={onChangeText}
                    id={props.idText}
                    placeholder={props.Label}
                    cleanable={true}
                    value={text}
                    defaultValue={defValue}
                    onSelect={onSelect}
                    style={{
                      borderColor: "blue",
                      width: "95%",
                      marginLeft: -10,
                      borderStyle: "solid",
                      marginTop: -7,
                      borderWidth: 1,
                    }}
                  />
                </div>
                <div style={{ width: "10%" }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={addItem}
                  >
                    +
                  </Button>
                </div>
              </div>
            </Whisper>
            {/* </Whisper> */}
            {/* <InputPicker data={drpdata} labelKey='txt' valueKey='id' onSearch={searchFltr}  value={text}  onChange={onChangeText}   id={props.idText} className="block px-2.5 pb-2.5 h-9 text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer font-Roboto w-full" placeholder="Test "   /> */}
            {/* <label htmlFor={props.idText} className="absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-4 left-1">{props.Label}</label> */}
          </div>
        </div>
      </div>
    );
  }
};
export default React.memo(NrjInptSlctr);

import React, { useState, useEffect, useCallback, CSSProperties, createRef, useRef } from "react";
import { InputPicker } from "rsuite";
import "./WtrRsSelect.css";
import { usePrevious } from "react-use";
import { TypeAttributes } from "rsuite/esm/@types/common";
import {
  capitalizeTerms,
  cmboStr,
  cmboStr_fnct,
  createGetApi,
  getCmpId,
  getUsrId,
  isReqFld,
  isValidArray,
} from "../../../utilities/utilities";
import { getFldValue } from "../../../Hooks/useGetFldValue";
import { ItemDataType } from "rsuite/esm/@types/common";
import { useQuery } from "@tanstack/react-query";
import { nrjAxios } from "../../../Hooks/useNrjAxios";
import { Tooltip } from "@mui/material";

type NrjInputSelc = {
  onChange: (data: string) => void;
  Label?: string;
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
  displayFormat?: string;
  size?: "lg" | "md" | "sm" | "xs" | undefined;
  IAmRequired?: any;
  ToolTip?: string;
  forceDbSearch?: boolean;
  menuStyle?: any;
  updateComboValue?: number | { id: string, txt: string }[];
  drpPlacement?: 'bottomStart' | 'bottomEnd' | 'topStart' | 'topEnd' | 'leftStart' | 'leftEnd' | 'rightStart' | 'rightEnd' | 'auto' | 'autoVerticalStart' | 'autoVerticalEnd' | 'autoHorizontalStart' | 'autoHorizontalEnd';
};
const WtrRsSelect = (props: NrjInputSelc) => {
  const { onChange, fldName, onBlurrSlctr, onSearchDb } = props;
  const [text, setText] = useState("");
  const [tooltipOpen, settooltipOpen] = useState(false);
  const [apiCall, setApiCall] = useState("");
  const [defValue, setDefvalue] = useState("");
  const [frstLoad, setFirstLoad] = useState("");
  const prvApi = usePrevious(apiCall);
  const size = props.size ? props.size : "lg";
  const [drpdata, setDrpdata] = useState<any>([]);
  const drpPlacement = props.drpPlacement ? props.drpPlacement : 'bottomStart'
  const scrollContainer = useRef(null);

  const cmp: string = getCmpId() || "1";
  const usr: string = getUsrId() || "2";
  let fltr: string = "";
  const [apiString, setApiString] = useState("");
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
      if (itmInList(fnd) || props.forceDbSearch) {
        fltr = fnd;
        DbSrch();
      }
    }
  };
  const DbSrch = () => {
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
    let parms = props.parms ? props.parms + fltr : fltr
    if (parms) {
      parms = parms.replaceAll('-', '!!');
    }
    if (props.fnctCall && props.dbCon != '1') {
      msg = cmboStr_fnct(
        props.dbCon,
        props.dllName ? props.dllName : "",
        props.fnctName ? props.fnctName : "",
        parms
      );
    } else if (csv === 0) {
      if (props.typr && props.dbCon && props.typr !== "1") {
        msg = cmboStr(props.dbCon, props.typr, props.allwZero, fltr);
      }
    } else if (csv > 0) {
      if (props.typr && props.dbCon && props.typr !== "1") {
        msg = cmboStr(props.dbCon, props.typr, props.allwZero, fltr, csv);
      }
    }

    if (msg && msg.length > 1) {
      setApiString(msg);
    }
  };

  useEffect(() => {
    if (apiString) {
      CallQ().then((res: any) => {
        popCombo(res);
      })
    }
  }, [apiString])

  const CallQ = () => {
    return nrjAxios({ apiCall: apiString });
  };

  const popCombo = (srvDta: any) => {
    if (!srvDta) {
      setDrpdata([])
      return;
    }
    if (typeof srvDta !== "string" && !srvDta.data[0]["Data"]) {
      setDrpdata([])
      return;
    }
    let str: string = "";
    if (typeof srvDta === "string") {
      str = srvDta;
      if (str.indexOf("][") === -1) {
        setDrpdata([])
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
    }
  };

  useEffect(() => {
    if (typeof (props.updateComboValue) == 'number' && props.updateComboValue) {
      DbSrch();
    }
    else if (Array.isArray(props.updateComboValue) && props.updateComboValue.length) {
      setDrpdata([...drpdata, ...props.updateComboValue])
    }
  }, [props.updateComboValue])

  const onChangeText = (value: string, event: any) => {
    if (value) {
      setText(value);
      let msg: string = "";
      let flag = false;
      for (let i = 0, j = drpdata.length; i < j; i++) {
        if (drpdata[i]["id"] === value) {
          msg = drpdata[i]["txt"];
          msg = "=" + fldName.substring(0, fldName.length - 2) + "][" + msg;
          flag = true
          break;
        }
      }
      if(flag){
        setText(value);
        onChange(fldName + "][" + value + msg);
      }
      else{
        setText("");
        onChange(fldName + "][");
      }
    } else {
      setText("");
      onChange(fldName + "][");
    }
  };

  const onSelect = (value: string, item: ItemDataType, event: any) => {
    //onChange(fldName + "][" + value);
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
  }, [props.loadOnDemand]);

  useEffect(()=>{
    if(drpdata){
      SetValue();
    }
  }, [drpdata])

  useEffect(() => {
    if (props.parms) {
      DbSrch();
    }
  }, [props.parms]);

  useEffect(() => {
    if (props.casscadingValue ? props.casscadingValue : 0 > 1) {
      DbSrch();
    }
  }, [props.casscadingValue]);

  useEffect(() => {
    if (props.clrFnct) {
      if (props.clrFnct === 1) {
        if (props.allwSrch ? props.allwSrch : false) {
          // setDrpdata([]);
          // setText("")
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
    let vl: string = getFldValue(props.selectedValue, fldName);
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
          setDrpdata(drpdata.concat(itm));
        }
      }
      setDefvalue(ech[1]);
      setText(ech[0]);
      // onChange(
      //   fldName +
      //     "][" +
      //     ech[0] +
      //     "=" +
      //     fldName.substring(0, fldName.length - 2) +
      //     "][" +
      //     ech[1]
      // );
    }
    else {
      setText("");
    }
  };

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
  }, [props.selectedValue]);

  const errQ = (err: any) => { };


  const AddMstrItem = () => {
    let api: string = "";
    api = createGetApi(
      "db=" + props.dbCon + "|dll=cntbkdll|fnct=e4",
      props.typr + "=" + fltr + "=1=0=0"
    );
    return nrjAxios({ apiCall: api });
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

  const getScrollContainer = () => {
    return scrollContainer.current || document.body; // Fallback to document.body if null
  };

  let dsply: string = props.displayFormat ? props.displayFormat : "2";
  const dsbl: boolean = props.disable ? props.disable : false;

  let rqFld: string = "";
  if (props.speaker ? props.speaker : "") {
    rqFld = "*";
  } else {
    if (isValidArray(props.IAmRequired))
      if (isReqFld(props.IAmRequired, props.fldName)) {
        rqFld = "*";
      }
  }
  if (dsply == "2") {
    return (
      <>
        <Tooltip title={props.ToolTip ? props.ToolTip : ""}>
          <div className="container">
            <div className="flex flex-col px-6">
              {props.Label && (
                <div className="pt-2 pb-1">
                  <label style={{ fontSize: "14px", color: "#020134" }}>
                     {capitalizeTerms(props.Label)}
                    <span className="astrict text-red-500">{rqFld}</span>
                  </label>
                </div>
              )}
               <div
                className="inputPickerWrapper relative" ref={scrollContainer}
                style={{ paddingTop: "2px", borderRadius: "6px" }}
              >
                <InputPicker
                  title={props.speaker ? props.speaker : ""}
                  size={size}
                  onBlur={onBlurr}
                  data={drpdata}
                  labelKey="txt"
                  disabled={dsbl}
                  valueKey="id"
                  onSearch={searchFltr}
                  onChange={onChangeText}
                  id={props.idText}
                  placeholder={props.Label}
                  cleanable={true}
                  value={text}
                  defaultValue={defValue}
                  onSelect={onSelect}
                  menuStyle={props.menuStyle}
                  className=""
                  placement={drpPlacement}
                />
              </div>
            </div>
          </div>
        </Tooltip>
      </>
    );
  } else if (dsply == "1") {
    return (
      <>
        <Tooltip title={props.ToolTip ? props.ToolTip : ""}>
          <div className="">
            <div className="flex flex-col">
              {props.Label && (
                <div className="">
                  <label style={{ fontSize: "14px", color: "rgb(2, 1, 15)" }}>
                  {capitalizeTerms(props.Label)}
                    <span className="astrict text-red-500">{rqFld}</span>
                  </label>
                </div>
              )}
              <div
                className="inputPickerWrapper1 relative"  ref={scrollContainer}
                style={{ paddingTop: "2px", borderRadius: "6px" }}
              >
                <InputPicker
                  size={size}
                  onBlur={onBlurr}
                  data={drpdata}
                  labelKey="txt"
                  valueKey="id"
                  disabled={dsbl}
                  onSearch={searchFltr}
                  onChange={onChangeText}
                  id={props.idText}
                  placeholder={props.Label}
                  cleanable={true}
                  value={text}
                  defaultValue={defValue}
                  onSelect={onSelect}
                  className="w-full"
                  menuStyle={props.menuStyle}
                  placement={drpPlacement}
                  container={getScrollContainer}
                  />
              </div>
            </div>
          </div>
        </Tooltip>
      </>
    );
  }

};
export default React.memo(WtrRsSelect);
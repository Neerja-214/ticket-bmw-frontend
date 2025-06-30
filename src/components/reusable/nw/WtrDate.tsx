import React, { useEffect, useState, useCallback } from "react";
import { DatePicker } from "rsuite";
import moment, { now } from "moment";
import { Tooltip, Whisper } from "rsuite";
import { TypeAttributes } from "rsuite/esm/@types/common";
import { getFldValue } from "../../../Hooks/useGetFldValue";
import { isReqFld, isValidArray } from "../../../utilities/utilities";
type NrjRdt = {
  onChange: (data: string) => void;
  Label?: string;
  ClssName?: string;
  idText: string;
  selectedValue?: string;
  fldName: string;
  delayClose?: number;
  placement?: TypeAttributes.Placement;
  speaker?: string;
  format?: string;
  clear?: number;
  displayFormat?: string;
  size?: "lg" | "md" | "sm" | "xs" | undefined;
  IAmRequired?: any;
  ToolTip?: string;
};
const WtrDate = (props: NrjRdt) => {
  const { onChange, selectedValue, fldName } = props;
  const [textDts, setTextDts] = useState<string>("");
  const [tooltipOpen, settooltipOpen] = useState(false);
  const size = props.size ? props.size : "lg";

  const onChangeText = (value: Date | null, event: any) => {
    if (value) {
      let str: string = moment(value).format("dd-MMM-yyyy");
      setTextDts(str);
      onChange(fldName + "][" + str);
    } else {
      setTextDts("");
      onChange(fldName + "][" + "");
    }
  };

  const tltpClose = useCallback(() => {
    settooltipOpen(false);
  }, [tooltipOpen]);

  const onBlurr = (event: any) => {
    if (props.speaker) {
      if (props.delayClose) {
        if (!event.target.value) {
          settooltipOpen(true);
        } else {
          settooltipOpen(false);
        }
      }
    }
  };

  const onOpen = () => {
    if (props.delayClose) {
      setTimeout(function () {
        settooltipOpen(false);
      }, props.delayClose);
    }
  };

  useEffect(() => {
    if (props.clear && props.clear === 1) {
      setTextDts("01-Apr-2000");
    }
  }, [props.clear]);

  useEffect(() => {
    let dt: string = getFldValue(props.selectedValue || "", fldName);
    if (dt) {
      if (!isNaN(Date.parse(dt))) {
        setTextDts(props.selectedValue ? props.selectedValue : "");
      }
    } else if (!isNaN(Date.parse(props.selectedValue || ""))) {
      setTextDts(props.selectedValue ? props.selectedValue : "");
    } else {
      setTextDts("");
    }
  }, [props.selectedValue]);

  let rqFld: string = "";
  if (props.speaker ? props.speaker : "") {
    rqFld = "*";
  } else {
    if (isValidArray(props.IAmRequired))
      if (isReqFld(props.IAmRequired, props.fldName)) {
        rqFld = "*";
      }
  }

  let dsply: string = props.displayFormat ? props.displayFormat : "2";
  const selectedDate = selectedValue
    ? new Date(Date.parse(selectedValue))
    : null;

  if (dsply == "1") {
    return (
      <>
        <Tooltip title={props.ToolTip ? props.ToolTip : ""}>
          <Whisper
            open={tooltipOpen}
            onClose={tltpClose}
            delayClose={props.delayClose}
            trigger={"none"}
            onOpen={onOpen}
            placement={props.placement}
            speaker={
              <Tooltip style={{ backgroundColor: "red", fontSize: 12 }}>
                {props.speaker}
              </Tooltip>
            }
          >
            <div className="w-full">
              {props.Label && (
                <div className="py-2 text-black">
                  {props.Label}
                  <span className="astrict">{rqFld}</span>
                </div>
              )}
              <DatePicker
                size={size}
                //value={selectedValue}
                //value={new Date(Date.parse(textDts))}
                value={textDts ? new Date(Date.parse(textDts)) : null}
                placeholder={props.Label}
                // value={}
                onChange={onChangeText}
                format={props.format ? props.format : "dd-MMM-yyyy"}
                onBlur={onBlurr}
                oneTap
                style={{ width: "100%" }}
              ></DatePicker>
            </div>
          </Whisper>
        </Tooltip>
      </>
    );
  } else if (dsply == "2") {
    return (
      <div className="w-11/12 container">
        <Tooltip title={props.ToolTip ? props.ToolTip : ""}>
          <div className="relative h-6 ">
            <Whisper
              open={tooltipOpen}
              onClose={tltpClose}
              delayClose={props.delayClose}
              trigger={"none"}
              onOpen={onOpen}
              placement={props.placement}
              speaker={
                <Tooltip style={{ backgroundColor: "red", fontSize: 12 }}>
                  {props.speaker}
                </Tooltip>
              }
            >
              <div className="w-11/12 mb-2">
                {props.Label && (
                  <div className="py-2 text-black">
                    {props.Label}
                    <span className="astrict text-red-500">{rqFld}</span>
                  </div>
                )}
                <DatePicker
                  size={size}
                  value={textDts ? new Date(Date.parse(textDts)) : null}
                  placeholder={props.Label}
                  // value={}
                  onChange={onChangeText}
                  format={props.format ? props.format : "dd-MMM-yyyy"}
                  onBlur={onBlurr}
                  oneTap
                  style={{ width: 300 }}
                ></DatePicker>
              </div>
            </Whisper>
          </div>
        </Tooltip>
      </div>
    );
  }
};
export default WtrDate;

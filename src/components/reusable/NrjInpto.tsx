import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useGetFldValue } from "../../Hooks/useGetFldValue";
import { Tooltip, Whisper } from "rsuite";
import { useQuery } from "@tanstack/react-query";
import { TypeAttributes } from "rsuite/esm/@types/common";
import { useNrjAxios } from "../../Hooks/useNrjAxios";
import NrjIcons from "./icons/NrjIcons";
import { getCmpId, getUsrId } from "../../utilities/utilities";

type NrjTextInput = {
  onChange: (data: string) => void;
  Label: string;
  ClssName?: string;
  idText: string;
  selectedValue: string;
  fldName: string;
  clrFnct: number;
  allowNumber?: boolean;
  placement?: TypeAttributes.Placement;
  speaker?: string;
  delayClose?: number;
  callFnFocus?: string;
  validateFn?: string;
  dsabld?: boolean | false;
  dsbKey?: boolean | false;
  upprCase?: boolean | false;
  raiseChangeAftrPrg?: boolean;
  blockDecimal?: boolean;
  maxLength?: number;
  sayThis?: string;
  onFailedValidation?: (msg: string, fldNm: string) => void;
  Icon?: string,
  IconColor?: string,
  IconSize?: string,
  inputType?: string,

};

export const NrjInpto = (props: NrjTextInput) => {
  const { onChange, fldName, onFailedValidation } = props;
  const [tooltipOpen, settooltipOpen] = useState(false);
  const [selVl, setSelVl] = useState(0);
  const [wchQry, setWchQry] = useState(1);
  const [text, setText] = useState("");

  const onChangeText = (event: any) => {
    if (props.dsbKey) {
      return;
    }
    let msg: string = "";
    msg = event.target.value;
    if (props.upprCase) {
      if (msg) {
        msg = msg.toUpperCase();
      }
      setText(msg);
    } else {
      setText(msg);
    }
    let vl: string = props.validateFn ? props.validateFn : "";
    if (!vl) {
      onChange(fldName + "][" + msg);
    } else if (vl.indexOf("[") == -1) {
      onChange(fldName + "][" + msg);
    }

    // onChange(fldName + "][" + msg);
  };

  const chkSelected = () => {
    if (props.selectedValue.indexOf(fldName + "][") > -1) {
      setSelVl(1);
      setTimeout(function () {
        setSelVl(0);
      }, 1000);
    }
  };

  useEffect(() => {
    if (props.selectedValue) {
      if (props.selectedValue.indexOf(fldName + "][") > -1) {
        SetValue();
      }
    }
  }, [props.selectedValue]);
  useEffect(() => {
    if (props.clrFnct) {
      onClearA();
    }
  }, [props.clrFnct]);

  const shwTooltip = useCallback(
    (event: any) => {
      onBlurr(event);
    },
    [tooltipOpen]
  );



  const onBlurr = (event: any) => {
    if (props.speaker && !event.target.value) {
      if (props.delayClose) {
        settooltipOpen(true);
      }
    } else {
      settooltipOpen(false);

      if (props.validateFn) {
        let fn: string = props.validateFn;
        if (fn.indexOf("[phone]") > -1) {
          CheckPhone(event.target.value, fn);
          return;
        } else if (fn.indexOf("[mob]") > -1) {
          CheckMobile(event.target.value, fn);
          return;
        } else if (fn.indexOf("[email]") > -1) {
          CheckEmail(event.target.value, fn);
          return;
        } else if (fn.indexOf("[phonestd]") > -1) {
          CheckPhoneStd(event.target.value, fn);
          return;
        } else if (fn.indexOf("[length]") > -1) {
          CheckLength(event.target.value, fn);
          return;
        } else if (fn.indexOf("cmpid") > 0) {
          setWchQry(2);
          setTimeout(function () {
            refetch();
          }, 500);
        }

      }
    }
    // if (props.speaker) {
    //   if (props.delayClose) {
    //     if (!event.target.value) {
    //       settooltipOpen(true);
    //     } else {
    //       settooltipOpen(false);
    //       if (props.validateFn) {
    //         let fn: string = props.validateFn;
    //         if (fn.indexOf("[phone]") > -1) {
    //           CheckPhone(event.target.value, fn);
    //           return;
    //         } else if (fn.indexOf("[mob]") > -1) {
    //           CheckMobile(event.target.value, fn);
    //           return;
    //         } else if (fn.indexOf("[email]") > -1) {
    //           CheckEmail(event.target.value, fn);
    //           return;
    //         } else if (fn.indexOf("[phonestd]") > -1) {
    //           CheckPhoneStd(event.target.value, fn);
    //           return;
    //         } else if (fn.indexOf("[length]") > -1) {
    //           CheckLength(event.target.value, fn);
    //           return;
    //         }
    //         setWchQry(2);
    //         setTimeout(function () {
    //           refetch();
    //         }, 500);
    //       }
    //     }
    //   }
    //}
  };

  const tltpClose = useCallback(() => {
    settooltipOpen(false);
  }, [tooltipOpen]);
  const onClearA = () => {
    setText("");
  };

  const onFocus = () => {
    if (props.callFnFocus) {
      if (props.callFnFocus.indexOf("myvl") > -1) {
        setText("2");
        return;
      }
      setWchQry(1);
      setTimeout(function () {
        refetch();
      }, 400);
    }
  };

  const SetValue = () => {
    let vl: string = useGetFldValue(props.selectedValue, fldName);
    if (props.raiseChangeAftrPrg ? props.raiseChangeAftrPrg : false) {
      onChange(fldName + "][" + vl);
    }

    if (vl) {
      setText(vl);
    }
  };

  const CallFn = () => {
    let fn: string = "";
    if (wchQry === 1) {
      if (props.callFnFocus) {
        fn = props.callFnFocus;
      }
    } else {
      if (props.validateFn) {
        fn = props.validateFn;
      }
    }
    fn = fn.replace("[txtvl]", text);

    let cmpid: string = getCmpId() || "1";
    fn = fn.replace("cmpid", cmpid);
    cmpid = getUsrId() || "1";
    fn = fn.replace("usrid", cmpid);
    fn = "https://www.thetaskmate.in/api/GetFldValue/" + fn;
    // return axios.get(fn);
    return useNrjAxios({ apiCall: fn });
  };

  const GetFValue = (vl: string) => {
    return useGetFldValue(vl, props.fldName);
  };
  const QryResult = (data: any) => {
    if (data) {
      let vl: string = data.data[0]["Data"];
      if (!vl) {
        vl = "";
      }
      if (vl.indexOf(props.fldName + "][") > -1) {
        vl = GetFValue(vl);
      }
      setText(vl);
      onChange(fldName + "][" + vl);
    }
  };
  const { data, refetch } = useQuery({
    queryKey: ["txtFn", text],
    queryFn: CallFn,
    enabled: false,
    onSuccess: QryResult,
  });
  const onOpn = () => {
    if (props.delayClose) {
      setTimeout(function () {
        settooltipOpen(false);
      }, props.delayClose);
    }
  };

  const onKeyDown = (e: any) => {
    if (props.allowNumber ? props.allowNumber : false) {
      const charCode = e.which ? e.which : e.keyCode;
      // console.log(charCode);
      let decKey: boolean = props.blockDecimal ? props.blockDecimal : false;
      if (!decKey) {
        if (
          charCode > 31 &&
          (charCode < 48 || charCode > 57) &&
          (charCode < 96 || charCode > 105) &&
          charCode !== 110 &&
          charCode !== 190
        ) {
          let str: string = e.target.value;
          str = str.substring(0, str.length - 1);
          setText(str);
        }
      } else {
        if (
          charCode > 31 &&
          (charCode < 48 || charCode > 57) &&
          (charCode < 96 || charCode > 105)
        ) {
          let str: string = e.target.value;
          str = str.substring(0, str.length - 1);
          setText(str);
        }
      }
    }

    let ln: number = props.maxLength ? props.maxLength : 0;
    if (ln > 0) {
      let str: string = e.target.value;
      if (str.length > ln) {
        str = str.substring(0, ln);
        setText(str);
      }
    }
  };

  const CheckPhone = (txt: string, msg: string) => {
    if (txt.length > 4 && txt.length < 11) {
      onChange(props.fldName + '][' + txt)
    } else {
      setText("");
      msg = msg.replace("[phone]", "");
      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
    }
  };
  const CheckPhoneStd = (txt: string, msg: string) => {
    if (txt.length === 11) {
      onChange(props.fldName + '][' + txt)
    } else {
      setText("");
      msg = msg.replace("[phonestd]", "");
      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
    }
  };

  const CheckMobile = (txt: string, msg: string) => {
    if (txt.length === 10) {
      onChange(props.fldName + '][' + txt)
    } else {
      setText("");
      msg = msg.replace("[mob]", "");
      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
    }
  };

  const CheckEmail = (txt: string, msg: string) => {
    let eml: boolean = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(txt);
    if (!eml) {
      setText("");
      msg = msg.replace("[email]", "");
      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
    } else {
      if (txt) {
        onChange(props.fldName + '][' + txt)
      }

    }
  };

  const CheckLength = (txt: string, msg: string) => {

    msg = msg.replace("[length]", "")
    let ln: number = Number(msg)
    if (txt.length >= ln) {
      setText(txt);
      onChange(props.fldName + '][' + txt)
    } else {
      setText("");
      msg = "Enter Minimum Charectors " + ln
      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
      onChange(props.fldName + '][')
    }



  };

  // let clsInput: string =
  //   "block px-2.5 pb-2.5 h-9 pt-4  text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer font-Roboto w-full";
  // let clsLbl: string =
  //   "absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-4 left-1";

  let clsInput: string = "block px-2.5 pb-2.5 h-9 pt-4  text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer font-Roboto w-full";
  let clsLbl: string = "absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-4 left-1";

  return (
    <div className="w-12/12 justify-center">
      <div className="relative ml-8  h-10" style={{ zIndex: 2 }}>
        <div className="reqDiv">
          <Whisper
            onOpen={onOpn}
            open={tooltipOpen}
            onClose={tltpClose}
            delayClose={props.delayClose}
            trigger={"none"}
            placement={props.placement}
            speaker={
              <Tooltip
                id={"ttl" + props.idText}
                style={{ backgroundColor: "red", fontSize: 12 }}
              >
                {props.speaker}
              </Tooltip>
            }
          >

            <div className="w-12/12 flex">

              {props.Icon ? (
                <div style={{ width: "5%", border: "1px solid #31adff", padding: "4px" }}>
                  <NrjIcons FillColor={props.IconColor ? props.IconColor : ""} Icon={props.Icon ? props.Icon : ""} Size={props.IconSize ? props.IconSize : ""} />
                </div>
              ) : null}
              <div style={{ width: "94%" }}>


                <input
                  // ref={inputRef}
                  type={props.inputType ? props.inputType : "text"}
                  name={props.fldName}
                  onBlur={shwTooltip}
                  onFocus={onFocus}
                  value={text}
                  onKeyUp={onKeyDown}
                  onChange={onChangeText}
                  id={props.idText}
                  disabled={props.dsabld}
                  className={clsInput}
                  placeholder=" "
                />

                <label htmlFor={props.idText} className={clsLbl} style={{ marginLeft: "30px" }}>
                  {props.Label}
                </label>
              </div>
            </div>

          </Whisper>
        </div>
      </div>
    </div>
  );
};
export default React.memo(NrjInpto);

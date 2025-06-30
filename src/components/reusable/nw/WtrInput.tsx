import { Input, InputGroup } from "rsuite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { getFldValue } from "../../../Hooks/useGetFldValue";

import { useQuery } from "@tanstack/react-query";
import { TypeAttributes } from "rsuite/esm/@types/common";
import { nrjAxios } from "../../../Hooks/useNrjAxios";
import NrjIcons from "./../icons/NrjIcons";
import utilities, {
  isValidArray,
  isReqFld,
  getCmpId,
  getUsrId,
  passwordRegex,
  labelRegex,
  decryptRandomStringPassword,
  capitalizeTerms,
} from "../../../utilities/utilities";
import Tooltip from "@mui/material/Tooltip";
import EyeIcon from '@rsuite/icons/legacy/Eye';
import EyeSlashIcon from '@rsuite/icons/legacy/EyeSlash';
import { useToaster } from '../../reusable/ToasterContext';
type NrjTextInput = {
  onChange: (data: string) => void;
  Label: string;
  ClssName?: string;
  idText?: string;
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
  dsbKey?: boolean | false; //can remove this prop
  upprCase?: boolean | false;
  raiseChangeAftrPrg?: boolean;
  maxLength?: number;
  onFailedValidation?: (msg: string, fldNm: string) => void;
  Icon?: string;
  IconColor?: string;
  IconSize?: string;
  inputType?: string;
  displayFormat?: string;
  onBlur?: any;
  unblockSpecialChars?: boolean;
  blockNumbers?: boolean;
  minValue?: number;
  maxValue?: number;
  allowDecimal?: boolean;
  IAmRequired?: any;
  ToolTip?: string;
  showErrorMsgAbsolute?: boolean;
  placeholder?: string;
  sNo?: string;
  noofDecimals?: number;
  gpsValidate?: boolean;
  fieldValidationMessage?: string
  showInputValidationMessage?: boolean;
  autoComplete?: string;
  ignoreCapitalise?: number;
};

const WtrInput = (props: NrjTextInput) => {
  const { onChange, fldName, onFailedValidation } = props;
  const [tooltipOpen, settooltipOpen] = useState(false);
  const [vldMsg, setVldMsg] = useState<any>(props.speaker);
  const [selVl, setSelVl] = useState(0);
  const [wchQry, setWchQry] = useState(1);
  const [text, setText] = useState("");
  const [validationMessage, showValidationMessage] = useState(false);
  const { showToaster, hideToaster } = useToaster();

  const blckChr = (e: any) => {
    const specialCharsRegex = /[!@#$%^&*(),?":/{}|<>]/;
    if (specialCharsRegex.test(e)) {
      return true;
    }
    return false;
  };


  function notNum(e: any) {
    const numberRegex = props.allowDecimal ? /^[0-9]*\.?[0-9]*$/ : /^\d+$/;
    const gpsValid = props.gpsValidate ? /^(\d{2})\.\d{4,}$/ : /^\d+$/

    if (numberRegex.test(e)) {
      // This splits the input string e into an array of substrings divided at the decimal point. 
      // For example, if e is "123.456", parts will be ["123", "456"].

      //If parts.length is less than 2, it means there is no decimal point in the input string, so it returns false. 
      // This means the input is valid as it doesn't have any decimal places to check against.

      // If the length of the decimal part (parts[1]) is less than or equal to the specified number of decimals (props.noofDecimals), 
      // it returns false, indicating the input is valid.
      // If the length of the decimal part exceeds the specified number of decimals, it returns true, 
      // indicating the input is invalid.
      if (props.noofDecimals) {
        let parts: any = e.split(".");
        if (parts.length < 2) {
          return false
        } else {
          if (parts[1]) {
            if (parts[1].length <= props.noofDecimals) {
              return false;
            } else {
              return true;
            }
          } else {
            return false;
          }
        }
      }
      return false;
    }
    if (gpsValid.test(e)) {
      return false;
    } else {
      return true;
    }

  }

  function isnum(e: any) {
    const numberRegex = /\d/;
    if (numberRegex.test(e)) {
      return true;
    }
    return false;
  }

  const onChangeText = (event: any) => {
    if (event && !props.unblockSpecialChars && blckChr(event)) {
      return;
    }
    if (event && props.allowNumber && notNum(event)) {
      return;
    }
    if (props.maxLength && event.length > props.maxLength) {
      return;
    }
    if (event && props.blockNumbers && isnum(event)) {
      return;
    }

    let msg: string = "";
    msg = event;
    if (props.upprCase) {
      if (msg) {
        msg = msg.toUpperCase();
      }
      setText(msg);
    } else {
      setText(msg);
    }
    let vl: string = props.validateFn ? props.validateFn : "";

    validate(msg);

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
      } else {
        setText('');
      }
      setVisible(false)
    } else {
      setText('');
    }
  }, [props.selectedValue]);

  useEffect(() => {
    if (props.clrFnct) {
      onClearA();
    }
  }, [props.clrFnct]);

  const shwTooltip = useCallback(
    (event: any) => {
      if (props.onBlur) {
        props.onBlur(event.target.value);
      }
      onBlurr(event);
    },
    [tooltipOpen]
  );

  const onBlurr = (event: any) => {
    let e: string = event.target.value;
    if (props.speaker && !e) {
      if (props.delayClose) {
        settooltipOpen(true);
      }
    } else {
      settooltipOpen(false);
      validate(e);
    }
  };

  const validate = (e: string) => {
    let fn: any = props.validateFn;
    if (fn) {
      if (fn.indexOf("[phone]") > -1) {
        CheckPhone(e, fn);
        return;
      } else if (fn.indexOf("[mob]") > -1) {
        CheckMobile(e, fn);
        return;
      } else if (fn.indexOf("[email]") > -1) {
        CheckEmail(e, fn);
        return;
      } else if (fn.indexOf("[phonestd]") > -1) {
        CheckPhoneStd(e, fn);
        return;
      } else if (fn.indexOf("[length]") > -1) {
        CheckLength(e, fn);
        return;
      } else if (fn.indexOf("[pincode]") > -1) {
        checkPincode(e, fn);
        return;
      } else if (fn.indexOf("[vhclno]") > -1) {
        checkVehicleNumber(e, fn);
        return;
      } else if (fn.indexOf("[latitude]") > -1) {
        CheckLatitude(e, fn);
        return;
      } else if (fn.indexOf("[longitude]") > -1) {
        CheckLongitude(e, fn);
        return;
      } else if (fn.indexOf("[psw]") > -1) {
        CheckPassword(e, fn);
        return;
      } else if (fn.indexOf("[label]") > -1) {
        CheckLabel(e, fn);
        return;
      } else if (fn.indexOf("cmpid") > 0) {
        setWchQry(2);
        setTimeout(function () {
          refetch();
        }, 500);
      }
    }
  };

  const tltpClose = useCallback(() => {
    settooltipOpen(false);
  }, [tooltipOpen]);
  const onClearA = () => {
    setText("");
  };

  const onFocus = () => {
    validate(text);
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
    let vl: string = getFldValue(props.selectedValue, fldName);
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
    if (fn.indexOf("api/") == -1) {
      fn = "api/GetFldValue/" + fn;
    }
    let pth: string =
      process.env.REACT_APP_URL || "https://www.thetaskmate.in/";
    fn = pth + fn;
    // return axios.get(fn);
    return nrjAxios({ apiCall: fn });
  };

  const GetFValue = (vl: string) => {
    return getFldValue(vl, props.fldName);
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
    queryKey: ["txtFn", text, props.Label],
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

  const rmvLastChr = (txt: string) => {
    if (txt) {
      txt = txt.substring(0, txt.length - 1);
      setText(txt);
    }
  };

  const chkMinMax = (txt: string) => {
    let nm: number = 0;
    if (txt) {
      nm = Number(txt);
    }

    if (props.minValue ? props.minValue : "") {
      let v: number = props.minValue ? props.minValue : 0;
      if (nm < v) {
        setText(v.toString());
        return;
      }
    }

    if (props.maxValue ? props.maxValue : "") {
      let v: number = props.maxValue ? props.maxValue : 0;
      if (nm > v) {
        setText(v.toString());
        return;
      }
    }
  };

  // const onKeyDown = (e: any) => {
  //   if(props.all                 wNumber? props.allowNumber : false){
  //     if ((e.which > 47 && e.which < 58)||e.which == 190 ||(e.which > 95 && e.which < 106) ||e.which == 110||e.which == 109){
  //         if (e.which == 190 || e.which == 110 || e.which == 109){
  //           if (e.target.value.indexOf(".")>-1){
  //             rmvLastChr(e.target.value)
  //             return
  //           }

  //         }
  //       } else {
  //         if (e.which == 190 || e.which == 110 || e.which == 109){

  //         }
  //       }
  //       chkMinMax(e.target.value)
  //   } else{
  //     rmvLastChr(e.target.value)
  //   }
  // }

  //   if (props.blockNumbers? props.blockNumbers : false){
  //     if ((e.which > 47 && e.which < 58)||e.which == 190){
  //       let str:string = e.target.value;
  //       str = str.substring(0, str.length - 1);
  //       setText(str);
  //     }
  //   }
  // }

  const CheckPhone = (txt: string, msg: string) => {
    if (txt.length > 4 && txt.length < 11) {
      onChange(props.fldName + "][" + txt);
    } else {
      setText(text);
      msg = msg.replace("[phone]", "");
      if (onFailedValidation) {
        showValidationMessage(true);
        onFailedValidation(msg, fldName);
      }
    }
  };

  const CheckPhoneStd = (txt: string, msg: string) => {
    if (txt.length === 11) {
      onChange(props.fldName + "][" + txt);
    } else {
      setText("");
      msg = msg.replace("[phonestd]", "");
      showValidationMessage(true);

      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
    }
  };

  const CheckMobile = (txt: string, msg: string) => {
    if (txt.length === 10) {
      onChange(props.fldName + "][" + txt);
      setVldMsg("");
    } else {
      if (txt.length > 10) {
        txt = txt.substring(0, 10);
        onChange(props.fldName + "][" + txt);
        setText(txt);
      } else {
        setVldMsg("Enter a valid Phone No");
        msg = msg.replace("[mob]", "");
        showValidationMessage(true);
        if (onFailedValidation) {
          onFailedValidation(msg, fldName);
        }
      }
    }
  };

  const CheckEmail = (txt: string, msg: string) => {
    let eml: boolean = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(txt);
    if (!eml) {
      msg = msg.replace("[email]", "");
      showValidationMessage(true);
      setVldMsg("Enter a valid Email Address");
      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
    } else {
      if (txt) {
        onChange(props.fldName + "][" + txt);
        setVldMsg("");
      }
    }
  };

  // const CheckLatitude = (txt: string, msg: string) => {
  //   //let ltt: boolean = /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/i.test(txt);
  //   let ltt: boolean = /^-?([0-8]?[0-9]|90)(\.[0-9]{1,10})$/i.test(txt);
  //   if (!ltt) {
  //     msg = msg.replace("[latitude]", "");
  //     showValidationMessage(true);
  //     setVldMsg("Enter a Valid Latitude");
  //     onChange(props.fldName + "][" + txt);
  //     if (onFailedValidation) {
  //       onFailedValidation(msg, fldName);
  //     }
  //   } else {
  //     if (txt) {
  //       onChange(props.fldName + "][" + txt);
  //       setVldMsg("");
  //       showValidationMessage(false);
  //     }
  //   }
  // };

  const CheckLatitude = (txt: string, msg: string) => {
    // Updated regex to allow only 1 or 2 decimal places
    let ltt: boolean = /^-?([0-8]?[0-9]|90)(\.[0-9]{1,2})?$/i.test(txt);

    if (!ltt) {
        msg = msg.replace("[latitude]", "");
        showValidationMessage(true);
        setVldMsg("Enter a valid latitude (up to 2 decimal places)");
        onChange(props.fldName + "][" + txt);

        if (onFailedValidation) {
            onFailedValidation(msg, props.fldName);
        }
    } else {
        if (txt) {
            onChange(props.fldName + "][" + txt);
            setVldMsg("");
            showValidationMessage(false);
        }
    }
};

  // const CheckLongitude = (txt: string, msg: string) => {
  //   let lgn: boolean = /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})$/i.test(
  //     txt
  //   );
  //   if (!lgn) {
  //     msg = msg.replace("[longitude]", "");
  //     showValidationMessage(true);
  //     setVldMsg("Enter a Valid longitude");
  //     onChange(props.fldName + "][" + txt);
  //     if (onFailedValidation) {
  //       onFailedValidation(msg, fldName);
  //     }
  //   } else {
  //     if (txt) {
  //       onChange(props.fldName + "][" + txt);
  //       setVldMsg("");
  //       showValidationMessage(false);
  //     }
  //   }
  // };

  const CheckLongitude = (txt: string, msg: string) => {
    // Updated regex to allow only 1 or 2 decimal places
    let ltt: boolean = /^-?([0-8]?[0-9]|90)(\.[0-9]{1,2})?$/i.test(txt);

    if (!ltt) {
        msg = msg.replace("[latitude]", "");
        showValidationMessage(true);
        setVldMsg("Enter a valid latitude (up to 2 decimal places)");
        onChange(props.fldName + "][" + txt);

        if (onFailedValidation) {
            onFailedValidation(msg, props.fldName);
        }
    } else {
        if (txt) {
            onChange(props.fldName + "][" + txt);
            setVldMsg("");
            showValidationMessage(false);
        }
    }
};
  const CheckPassword = (txt: string, msg: string) => {
    let pw: boolean = passwordRegex(txt);
    if (!pw) {
      msg = msg.replace("[longitude]", "");
      showValidationMessage(true);
      let message = <span>Enter a strong password<br />At least one lowercase alphabet <br /> At least one uppercase alphabet <br /> At least one Numeric digit<br /> At least one special character excluding '#' and '&' </span>
      setVldMsg(message);
      onChange(props.fldName + "][" + txt);
      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
    } else {
      if (txt) {
        onChange(props.fldName + "][" + txt);
        setVldMsg("");
        showValidationMessage(false);
      }
    }
  };

  const CheckLabel = (txt: string, msg: string) => {
    let pw: boolean = labelRegex(txt);
    if (!pw) {
      msg = msg.replace("[longitude]", "");
      showValidationMessage(true);
      setVldMsg("Enter a valid label, must be of 20 characters, first 5 must be alphabetic and last 5 must be numeric");
      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
    } else {
      if (txt) {
        onChange(props.fldName + "][" + txt);
        setVldMsg("");
        showValidationMessage(false);
      }
    }
  };

  const CheckLength = (txt: string, msg: string) => {
    msg = msg.replace("[length]", "");
    let ln: number = Number(msg);
    if (txt.length >= ln) {
      setText(txt);
      onChange(props.fldName + "][" + txt);
      setVldMsg("");
    } else {
      msg = "Enter Minimum Charectors " + ln;
      txt.length == 0 ? setVldMsg(props.speaker) : setVldMsg(msg);
      showValidationMessage(true);
      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
      onChange(props.fldName + "][");
    }
  };

  const checkPincode = (txt: string, msg: string) => {
    if (txt.length == 6) {
      setText(txt);
      onChange(props.fldName + "][" + txt);
      setVldMsg("");
    } else {
      if (txt.length > 6) {
        txt = txt.substring(0, 6);
        onChange(props.fldName + "][" + txt);
        setText(txt);
      } else {
        msg = "Invalid Pin code";
        // setText(txt)
        txt.length < 6 ? setVldMsg(props.speaker) : setVldMsg(msg);
        showValidationMessage(true);
        if (onFailedValidation) {
          onFailedValidation(msg, fldName);
        }
        onChange(props.fldName + "][");
      }
    }
  };

  const checkVehicleNumber = (txt: string, msg: string) => {
    let vhcl: boolean = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/i.test(txt);
    if (!vhcl) {
      msg = msg.replace("[]", "");
      showValidationMessage(true);
      setVldMsg("Enter a Valid Vehicle Number");
      if (onFailedValidation) {
        onFailedValidation(msg, fldName);
      }
    } else {
      if (txt) {
        onChange(props.fldName + "][" + txt);
        setVldMsg("");
        showValidationMessage(false);
      }
    }
  };

  function setFocus() {

  }

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
  const [visible, setVisible] = React.useState(false);


  //   function decodeBase64IfEncoded(psw: string): string {
  //     try {
  //         // Attempt to decode the Base64 string
  //         const decodedStr = atob(psw);

  //         // Check if the result is a valid decoded string
  //         // Optionally, validate further if needed
  //         return decodedStr;
  //     } catch (error) {
  //         // If decoding fails, return the original string
  //         return psw;
  //     }
  // }

  const handleChange = () => {
    if (props.fldName && props.fldName == "psw") {
      let encPassword: string = getFldValue(props.selectedValue, 'psw')

      if (encPassword) {
        // Decode the Base64-encoded password
        const realPassword = decryptRandomStringPassword(encPassword);
        setText(realPassword);
      }
    }

    setVisible(!visible);
  };

  


  if (dsply == "1") {
    return (
      <Tooltip title={props.ToolTip ? props.ToolTip : ""} arrow>
        <div>
          <div>
            <div className="relative">


              {/* <div className="py-1" style={{ fontSize: "14px", color: "#020134" }}>
                {props.Label}
                <span className={'astrict text-red-500'}>{rqFld}</span>
              </div> */}
              <div className="py-1" style={{ fontSize: "14px", color: "#020134" }}>
              {props.ignoreCapitalise === 1 ? props.Label : capitalizeTerms(props.Label)}
                <span className={'astrict text-red-500'}>{rqFld}</span>
              </div>
              <div className="mb-2 relative">
                <input type="password" style={{ display: 'none' }} autoComplete="new-password" />

                <Input
                  type={(props.inputType == 'password' && !visible) ? "password" : "text"}
                  name={props.fldName}
                  onBlur={shwTooltip}
                  onFocus={onFocus}
                  value={text}
                  title={props.ToolTip ? props.ToolTip : props.speaker || ""}
                  //onKeyUp={onKeyDown}
                  onChange={onChangeText}
                  disabled={props.dsabld}
                  placeholder={props.placeholder ? capitalizeTerms(props.placeholder) : capitalizeTerms(props.Label)}
                  className=""
                  style={{ height: "40px", margin: "unset" }}
                  autoComplete={props.inputType == 'password' ? "new-password" : ""}
                />
                {(props.inputType == 'password') ?
                  <div onClick={handleChange} className="absolute p-2 right-2 top-[2px]">
                    <>{visible ? <EyeIcon /> : <EyeSlashIcon />}</>
                  </div> : <></>}

              </div>

              {validationMessage && (
                <div
                  className={props.showErrorMsgAbsolute ? "absolute text-xs text-red-600" : " text-xs text-red-600"}
                >
                  {vldMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      </Tooltip>
    );
  }
  else if (dsply == "5") {
  const isPassword = props.inputType === "password";

  return (
    <div className="mb-2 relative">
<div className="py-1" style={{ fontSize: "14px", color: "#020134" }}>
              {props.ignoreCapitalise === 1 ? props.Label : capitalizeTerms(props.Label)}
                <span className={'astrict text-red-500'}>{rqFld}</span>
              </div>

      {/* Hidden autocomplete password input */}
      {isPassword && <input type="password" style={{ display: 'none' }} autoComplete="new-password" />}

      <Input
        type={isPassword && !visible ? "password" : "text"}
        name={props.fldName}
        onBlur={shwTooltip}
        onFocus={onFocus}
        value={text}
        onChange={onChangeText}
        disabled={props.dsabld}
        placeholder={capitalizeTerms(props.Label)}
        className="w-full"
        style={{ height: "40px", margin: "unset" }}
        title={props.ToolTip ? props.ToolTip : props.speaker || ""}
        autoComplete={isPassword ? "new-password" : ""}
      />

      {isPassword && (
        <div onClick={handleChange} className="absolute p-2 right-2 top-[25px] cursor-pointer text-gray-600">
          {visible ? <EyeIcon /> : <EyeSlashIcon />}
        </div>
      )}
      
              {validationMessage && (
                <div
                  className={props.showErrorMsgAbsolute ? "absolute text-xs text-red-600" : " text-xs text-red-600"}
                >
                  {vldMsg}
                </div>
              )}
    </div>
  );
}

  if (dsply == "4") {
    return (
      <>
        <tr>
          <td width="5%" className="border px-3 tableHdr1">{props.sNo}</td>
          <td width="45%" className="border px-3 tableHdr1" style={{ fontSize: "14px", color: "#020134" }}>
            {/* {props.Label} */}
            {props.ignoreCapitalise === 1 ? props.Label : capitalizeTerms(props.Label)}
            <span style={{ color: 'red' }}>{rqFld}</span>
          </td>
          <td width="50%" className="border px-3 tableHdr1">
            <div className="relative">
              <div className="relative">
                <Input
                  type={(props.inputType == 'password' && !visible) ? "password" : "text"}
                  name={props.fldName}
                  onBlur={shwTooltip}
                  onFocus={onFocus}
                  value={text}
                  title={props.ToolTip ? props.ToolTip : props.speaker || ""}
                  //onKeyUp={onKeyDown}
                  onChange={onChangeText}
                  disabled={props.dsabld}
                  placeholder={props.ignoreCapitalise === 1 ? props.Label : capitalizeTerms(props.Label)}
                  className=""
                  style={{ height: "40px", margin: "unset" }}
                />
                {(props.inputType == 'password') ?
                  <div onClick={handleChange} className="absolute p-2 right-2 top-[2px]">
                    <>{visible ? <EyeIcon /> : <EyeSlashIcon />}</>
                  </div> : <></>}

              </div>

              {validationMessage && (
                <div
                  className={props.showErrorMsgAbsolute ? "absolute text-xs text-red-600" : " text-xs text-red-600"}
                >
                  {vldMsg}
                </div>
              )}
            </div>
          </td>
        </tr>
      </>);
  }
  else if (dsply == "3") {
    return (
      <>
        <tr className="table min-w-full">
          <td width="5%" className=" px-3 tableHdr1">{props.sNo}</td>
          <td width="45%" className=" px-3 tableHdr1" style={{ fontSize: "14px", color: "#020134" }}>
            {/* {props.Label} */}
            {props.ignoreCapitalise === 1 ? props.Label : capitalizeTerms(props.Label)}
            <span className={'astrict text-red-600'}>{rqFld}</span>
          </td>
          <td>
            :
          </td>
          <td width="50%" className=" px-3 tableHdr1">
            <div className="relative">
              <div className="relative">
                <Input
                  type={(props.inputType == 'password' && !visible) ? "password" : "text"}
                  name={props.fldName}
                  onBlur={shwTooltip}
                  onFocus={onFocus}
                  value={text}
                  title={props.ToolTip ? props.ToolTip : props.speaker || ""}
                  //onKeyUp={onKeyDown}
                  onChange={onChangeText}
                  disabled={props.dsabld}
                  placeholder={props.ignoreCapitalise === 1 ? props.Label : capitalizeTerms(props.Label)} 
                  className=""
                  style={{ height: "40px", margin: "unset" }}
                />
                {props.showInputValidationMessage == true ? <p><span className="absolute text-xs text-red-600">{props.fieldValidationMessage}</span></p> : <></>}
                {(props.inputType == 'password') ?
                  <div onClick={handleChange} className="absolute p-2 right-2 top-[2px]">
                    <>{visible ? <EyeIcon /> : <EyeSlashIcon />}</>
                  </div> : <></>}

              </div>

              {validationMessage && (
                <div
                  className={props.showErrorMsgAbsolute ? "absolute text-xs text-red-600" : " text-xs text-red-600"}
                >
                  {props.ignoreCapitalise === 1 ? vldMsg : capitalizeTerms(vldMsg)}
                </div>
              )}
            </div>
          </td>
        </tr>
      </>);
  }
  else if (dsply == "2") {
    return (
      // <Tooltip title={props.ToolTip?props.ToolTip:""}>
      <div className="container mb-5">
        <div className="flex flex-col px-6 relative">
          <div className="w-12/12 py-2">
            <label style={{ fontSize: "14px", color: "#020134" }}>
              {/* {props.Label} */}
              {props.ignoreCapitalise === 1 ? props.Label : capitalizeTerms(props.Label)}
              <span className="astrict text-red-500">{rqFld}</span>
            </label>
          </div>
          <div className="w-9/12">
            <Input
              type={props.inputType ? props.inputType : "text"}
              name={props.fldName}
              size="lg"
              onBlur={shwTooltip}
              onFocus={onFocus}
              value={text}
              //onKeyUp={onKeyDown}
              onChange={onChangeText}
              disabled={props.dsabld}
              placeholder={props.ignoreCapitalise === 1 ? props.Label : capitalizeTerms(props.Label)}
              className=""
              title={props.ToolTip ? props.ToolTip : props.speaker || ""}

            />
          </div>
          {validationMessage && (
            <div
              className="text-xs text-red-600 absolute"
              style={{ bottom: "-20px" }}
            >
              {vldMsg}
            </div>
          )}
        </div>
      </div>
      // </Tooltip>
    );
  } else if (dsply == "3") {
    return (
      // <Tooltip title={props.ToolTip?props.ToolTip:""}>
      <div>
        <div className="py-1" style={{ fontSize: "14px", color: "#020134" }}>
          {/* {props.Label} */}
          {capitalizeTerms(props.Label)}
          <span className="astrict">{rqFld}</span>
        </div>

        <InputGroup>
          <InputGroup.Addon>+91 </InputGroup.Addon>
          <Input
            type={props.inputType ? props.inputType : "text"}
            name={props.fldName}
            onBlur={shwTooltip}
            onFocus={onFocus}
            value={text}
            onChange={onChangeText}
            disabled={props.dsabld}
            placeholder={capitalizeTerms(props.Label)}
            className=""
            title={props.ToolTip ? props.ToolTip : props.speaker || ""}
            style={{ height: "40px", margin: "unset" }}
          />
        </InputGroup>
      </div>
      // </Tooltip>
    );
  }
};

export default React.memo(WtrInput);

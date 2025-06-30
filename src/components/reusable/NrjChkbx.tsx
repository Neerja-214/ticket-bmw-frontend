import React, { useEffect, useState, useCallback } from "react";
import { Checkbox } from "rsuite";
type NrjChk = {
  onChange: (data: string) => void;
  Label: string;
  ClssName?: string;
  idText: string;
  selectedValue?: string;
  fldName: string;
  clrFnct?:number;
};
const NrjChkbx = (props: NrjChk) => {
  const { onChange, selectedValue, fldName } = props;
  const [chckd, setChckd] = useState(false);

  useEffect(()=>{
    let vl : string = props.selectedValue ? props.selectedValue : ""
    if (vl){
      if (vl.indexOf(fldName + '][')>-1){
        setChckd(true);
      }
    }
    
  },[props.selectedValue])

  
  useEffect(()=>{
    if (props.clrFnct?props.clrFnct: false){
      setChckd(false)
    }
  },[props.clrFnct])
  

  const onChangeText = (value: any | null, checked: any, event: any) => {
    if (!checked) {
      value = 0;
      setChckd(false);
    } else {
      setChckd(true);
      value = 1;
    }

    onChange(fldName + "][" + value);
  };

  return (
    <div className="w-9/12">
      <div className="relative ml-7 h-6">
        <div>
          <Checkbox
            checked={chckd}
            id={props.idText}
            onChange={onChangeText}
            className="block px-2.5 pb-2.5 h-10 text-sm text-gray-900 bg-transparent rounded-lg  border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer font-Roboto w-full"
            placeholder=" "
          >
            {props.Label}
          </Checkbox>
          {/* <label
            htmlFor={""}
            className="absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-4 left-1"
          >
            
          </label> */}
        </div>
      </div>
    </div>
  );
};

export default NrjChkbx;

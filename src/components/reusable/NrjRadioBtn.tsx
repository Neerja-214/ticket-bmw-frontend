import React, { useEffect, useState } from "react";
import { Radio } from "rsuite";
import { useGetFldValue } from "../../Hooks/useGetFldValue";

type NrjSProp = {
  name: string;
  segments: {
    label: string;
    value: string;
    // ref : any
  }[];
  onChange: (value: string) => void;
  defaultIndex: number;
  fldName?: string;
  selectedValue?: string;
};

const NrjRadioBtn = (props: NrjSProp) => {
  const [activeIndex, setActiveIndex] = useState(props.defaultIndex);
  const { onChange } = props;
  const onInputChange = (
    value: string,
    index: React.SetStateAction<number>
  ) => {
    setActiveIndex(index);

    onChange(props.fldName + "][" + value);
    // console.log (value )
  };

  useEffect(() => {
    let selv: number = 0;
    let f: string = props.selectedValue ? props.selectedValue : "0";
    selv = Number(f);
    setActiveIndex(selv);
    onChange(props.fldName + "][" + props.segments[0]['value']);
  }, [props.selectedValue]);

  const SetRBtn = (slctv : string)=>{
    
    const myElement = document.getElementById("myElement");
  }

  let cnt: Number = props.segments.length;
  let clsNm: string = "";
  let mrg: {} = { marginLeft: 0 };
  if (cnt === 2) {
    clsNm = "w-3/12";
    mrg = { marginLeft: 150 };
  } else if (cnt === 3) {
    clsNm = "w-3/12";
    mrg = { marginLeft: 125 };
  } else if (cnt === 4) {
    clsNm = "w-2/12";
    mrg = { marginLeft: 50 };
  } else if (cnt === 5) {
    clsNm = "w-2/12";
  } else {
    clsNm = "w-1/12";
  }
  return (
    <div>
      <div className="flex" style={mrg}>
        {props.segments.map((item, i) => (
          <div key={item.value} className={clsNm}>
            <Radio
              value={item.value}
              id={item.label}
              name={props.name}
              onChange={() => onInputChange(props.segments[i].value, i)}
              checked={i === activeIndex}
            >
              {item.label}
            </Radio>
            {/* <label htmlFor={item.label}>
            {item.label}
          </label> */}
          </div>
        ))}
      </div>
    </div>
  );
};
export default React.memo(NrjRadioBtn);

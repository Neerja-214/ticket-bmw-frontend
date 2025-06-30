import React, { useState, useEffect, useRef } from 'react'
import '../../styles/cntrl.css'

type NrjSProp = {
    name : string,
    segments : {
        label: string,
        value : string,
        // ref : any
    }[],
    onChange: (value: string) => void,
    defaultIndex :number,
    controlRef : any,
    fldName? : string
}

const NrjSegCntrl =(props : NrjSProp)=> {
    const [activeIndex, setActiveIndex] = useState(props.defaultIndex)
    const {onChange} = props
    const componentReady = props.controlRef;
    const onInputChange = (value: string, index: React.SetStateAction<number>) => {
        setActiveIndex(index);

        onChange(props.fldName +'][' + value);
        // console.log (value )
      }

      useEffect(() => {
        componentReady.current = true;
      }, []);

    //   useEffect(() => {
    //     const activeSegmentRef = props.segments[activeIndex].ref;
    //     let a = 1;
    //     const { offsetWidth, offsetLeft } = activeSegmentRef.current
    //     // const { offsetWidth, offsetLeft } = {100,10};
    //     const { style } = props.controlRef.current;
      
    //     // style.setProperty('--highlight-width', `${offsetWidth}px`);
    //     // style.setProperty('--highlight-x-pos', `${offsetLeft}px`);
    //   }, [activeIndex, props.onChange, props.segments]);
  return (
    <div className="controls-container" ref={props.controlRef} >
    <div className={`controls ${componentReady.current ? 'ready' : 'idle'}`}>
      {props.segments.map((item, i) => (
        <div
          key={item.value}
          className={`segment ${i === activeIndex ? 'active' : 'inactive'}`}
        //   ref={item.ref}
        >
          <input
            type="radio"
            value={item.value}
            id={item.label}
            name={props.name}
            onChange={() => onInputChange(props.segments[i].value, i)}
            checked={i === activeIndex}
          />
          <label htmlFor={item.label}>
            {item.label}
          </label>
        </div>
      ))}
    </div>
  </div>
  )
}

export default NrjSegCntrl
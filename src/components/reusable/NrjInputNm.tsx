import React, {useEffect, useState} from 'react'

type NrjTextInput = {
    onChange: (data: string)=>void,
    Label : string,
    ClssName? : string,
    idText : string,
    selectedValue: string,
    fldName : string,
    clrFnct : number,
     
}


const NrjInputNm = (props:NrjTextInput) => {
    const {onChange, selectedValue, fldName} = props
    const [text, setText] = useState("");
    const [fld, setfld] = useState("");
    const onChangeText = (event:any)=>{
      // console.log("a")
      const regex = new RegExp("^[1-9]\d*(\.\d+)?$");
      // console.log(event.target.value)
      // console.log(regex.test(event.target.value))
      if (regex.test(event.target.value)){
        setText(event.target.value);
        onChange(fldName + '][' + text)     
      }
        
    }
    
    const onBlur = ()=>{
      
    }
    if (selectedValue){
      setText(selectedValue);
    }
    useEffect(()=>{
      if (props.clrFnct){
        // console.log("1")
        onClearA();
       }},[props.clrFnct]
      )
    
    const onClearA = ()=>{
      setText("")
    }
   

  return (
    <div className='w-9/12'>
            <div className="relative ml-7 h-6">
                <input type="number"    value={text} onChange={onChangeText}    id={props.idText} className="block px-2.5 pb-2.5 h-9 pt-4  text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer font-Roboto w-full" placeholder=" "   />
                <label htmlFor={props.idText} className="absolute text-sm text-gray-400 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white  px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-90 peer-focus:-translate-y-4 left-1">{props.Label}</label>
            </div>
        </div>
  )
}


export default NrjInputNm
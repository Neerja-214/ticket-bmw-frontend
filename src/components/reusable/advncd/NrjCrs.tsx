import { Button } from "@mui/material";
import React, { useState } from "react";
import { Carousel } from "rsuite";
import "../../../styles/cntrl.css"


type NrjCrsl = {
  autPly: boolean;
  autTmr: number;
  imgList: string[];
  showCloseButton?:boolean;
  onClose : (close : boolean)=>void;
};
const NrjCrs = (props: NrjCrsl) => {
    const {onClose} = props;
    const [aPlay , setAPlay ] = useState(props.autPly)
    const [buttnText, setButtNText] = useState(props.autPly?"Stop" : "Start")
    const clckBtn = () =>{
        if (aPlay){
            setAPlay(false)
            setButtNText("Start")
        } else {
            setAPlay(true)
            setButtNText("Stop")
        }
        
    }

    const raiseClose = () =>{
      onClose(true)
    }
  return (
    <div>
    <div className="w-full flex justify-center"   >
      <Carousel   autoplay={aPlay} autoplayInterval={props.autTmr}>
        {props.imgList.map((eimg) => {
          return (
            <div className="items-center">
              <img src={eimg}></img>
            </div>
          );
        })}
      </Carousel>
    </div>
    <div className="flex justify-center space-x-5 mt-3">
      <div>
        <Button onClick={clckBtn} variant="contained">{buttnText}</Button>
        </div>
        <div>
        <Button onClick={raiseClose} variant="contained">Close</Button>
        {/* {props.showCloseButton?props.showCloseButton: false && (<> </>)} */}
        </div>
        
    </div>
    </div>
  );
};

export default NrjCrs;

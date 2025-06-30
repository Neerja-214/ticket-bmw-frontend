import { Button, Card } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";

type MyDts = {
  
  cbwtfnm: string;
  cty: string;
  dist: string;
  state: string;
  contprnm: string;
  phn: string;
  mob: string;
  eml: string;
  cbwtfid: string;
};

const CbwtfDts = (props: MyDts) => {
  const navigate = useNavigate()
  const ShwSmry = () => {
    sessionStorage.setItem("cbwtfnm", props.cbwtfnm)
      sessionStorage.setItem("cbtwflvl", props.cbwtfid)
      navigate("/dshnw")
  };

  const ShwBags = () => {
    sessionStorage.setItem("cbwtfnm", props.cbwtfnm)
      sessionStorage.setItem("cbtwflvl", props.cbwtfid)
      navigate("/bgws")
  };
  return (
    
    <div className="flex flex-col ">
      <div className='flex w-12/12 bgg-aliceblue border-solid rounded-lg border-2 border-gray-300 '>
        <div className="w-[calc(70%)]">
          <Card className="bg-aliceblue" elevation={10}>
            
          
          <div className="lft-[50px] w-full fntCnzl">
            <span className="text-2xl font-medium  text-gray-600 text-center">
              {props.cbwtfnm}
            </span>
          </div>
          <div className="w-full fntPoppin">
            <span className="font-medium text-gray-600 text-center">
              {props.contprnm}
            </span>
          </div>
          <div className="w-full fntPoppin">
            <span className="font-medium text-gray-600 text-center">
              {props.cty}
            </span>
          </div>
          <div className="w-full fntPoppin">
            <span className="font-medium text-gray-600 text-center">
              {props.state}
            </span>
          </div>
          <div className="w-full fntPoppin">
            <span className="font-medium text-gray-600 text-center">
              {props.mob}
            </span>
          </div>
          <div className="w-full fntPoppin">
            <span className="font-medium text-gray-600 text-center">
              {props.eml}
            </span>
          </div>
          </Card>
        </div>
      </div>
      
      <div className="grid w-8/12  items-center">
        <div className="grid grid-cols-6 row items-center justify-center content-center w-12/12 left-[calc(15%)] mt-3 mb-2">
          <div className="col-span-2"></div>
          <div><Button onClick={ShwSmry} variant="contained" style={{ textTransform: "none"}}>
            Summary
          </Button></div>
          <div><Button onClick={ShwBags} variant="contained" style={{ textTransform: "none"}}>
            Detailed
          </Button></div>
          <div></div>
          
          
        </div>
        
      </div>
      <div className="w-full">
        {/* <hr /> */}
      </div>
    </div>
  );
};

export default CbwtfDts;

import React from "react";

type hdrProps = {
  name?: string;
  cmpNm?: string;
  dsplNm?: string;
};

export const NrjHdr = (props: hdrProps) => {
  // bg-gradient-to-r from-slate-100 to-slate-200
  //bck-gry
  return (
    <div className="block max-h-fit w-11/12 mx-5 border-0.5 pb-4 rounded-lg my-7 border-gray-300 mt-1 bg-gradient-to-r from-slate-100 to-slate-200 ">
      <div className="flex  justify-center text-3xl font-Roboto pt-3 -ml-16 pb-3">
        <img src="https://www.amcservice.info/images/lgg.png" className="h-9" />
        <p style={{ whiteSpace: "normal" }}> </p> {props.name}
      </div>
      <div className="flex  justify-center text-xl font-Roboto pt-1 -ml-16 pb-1">
        {props.cmpNm} 
      </div>
    </div>
  );
  // : {props.dsplNm}
};
export default NrjHdr;

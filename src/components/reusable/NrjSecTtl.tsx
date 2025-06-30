import React from "react"
type hdrProps = {
    tittle : string
  }
  
  const NrjSecTtl = (props : hdrProps) => {
  
    return (
            <div className="flex max-h-fit w-11/12 mx-5 ml-14  pt-1 pb-2 mb-10 rounded-lg   mt-3">
              <div className="grid grid-cols-1">
                  <div className="w-fit">
                      <p className="text-2xl font-Roboto pt-2">{props.tittle}</p>
                  </div>
              </div>
          </div>
    )
  }
  export default NrjSecTtl
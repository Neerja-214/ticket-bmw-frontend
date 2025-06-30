import React from 'react'
type clrDts = {
    ClassNme?: string,
    TotalWt? : string,
    TotalCount? : string,
}

const  CpcbDshbrdClr = (props : clrDts) => {
  return (
    <>
        <div className={props.ClassNme}>
            <div>
                <span>{props.TotalWt}</span>
            </div>
            <div>
                <span>{props.TotalCount}</span>
            </div>
        </div>
    </>
  )
}

export default React.memo( CpcbDshbrdClr)
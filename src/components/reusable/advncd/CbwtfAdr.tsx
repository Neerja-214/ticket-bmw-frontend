import React from 'react'
import NrjMatTbl from '../NrjMatTbl'
import Hdr from '../../../app/Hdr'
type RegData = {
    cbwtf : string,
    tbl : any
    
}

//#a21caf
//#c4b5fd
const CbwtfAdr =(props : RegData)=> {
  return (
    <>
        
        <div style={{backgroundColor:'#c4b5fd', textAlign:'center', width:'80%',borderRadius:'10px', marginLeft:'10%' }}>
            <span className='fntCnzl' >{props.cbwtf} </span>
        </div>
        <div style={{width : '50%', marginLeft:'25%'}}>
        <NrjMatTbl className='cbwtTbl table tr' fields={['flda', 'fldb']} data={props.tbl} showHeader={false} headerString={['a', 'a']}></NrjMatTbl>
        </div>
        
    </>
  )
}

export default React.memo(CbwtfAdr)
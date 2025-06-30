// import React from 'react'

import moment from "moment";

export const useGetFldValue = (frmData : string, fldName : string) =>{
  if (!frmData){
    return "";
  }

  if (!fldName){
    return "";
  }
  let cmbVls : string = ""
  let cmbFld : string = "";
  if (fldName.substring(fldName.length-2)=="id"){
    cmbFld = fldName.substring(0,fldName.length-2);
  }
  let ech :string[] = frmData.split("=");
  for (let i =0, j = ech.length;i<j;i++){
    if (ech[i]){
        if (ech[i].indexOf(fldName + '][')==0){
            let vl : string[] = ech[i].split('][');
            if (vl && vl.length>1 && vl[1]){
                if (!cmbFld){
                    return vl[1];
                } else {
                  cmbVls = vl[1];
                }
                
            }
        }
    }
    
  }

  if (cmbFld){
    fldName = cmbFld;
    for (let i =0, j = ech.length;i<j;i++){
        if (ech[i]){
            if (ech[i].indexOf(fldName + '][')==0){
                let vl : string[] = ech[i].split('][');
                if (vl && vl.length>1 && vl[1]){
                        cmbVls += "|" + vl[1];
                        return cmbVls;
                    
                    
                }
            }
        }
        
      } 
  }
  if (!cmbVls && fldName.indexOf("dt_")==0){
    cmbVls = moment(Date.now()).format("DD-MMM-yyyy")
  }
  return cmbVls;
}

export const getFldValue = (frmData : string, fldName : string) =>{
  if (!frmData){
    return "";
  }

  if (!fldName){
    return "";
  }
  let cmbVls : string = ""
  let cmbFld : string = "";
  if (fldName.substring(fldName.length-2)=="id"){
    cmbFld = fldName.substring(0,fldName.length-2);
  }
  let ech :string[] = frmData.split("=");
  for (let i =0, j = ech.length;i<j;i++){
    if (ech[i]){
        if (ech[i].indexOf(fldName + '][')==0){
            let vl : string[] = ech[i].split('][');
            if (vl && vl.length>1 && vl[1]){
                if (!cmbFld){
                    return vl[1];
                } else {
                  cmbVls = vl[1];
                }
                
            }
        }
    }
    
  }

  if (cmbFld){
    fldName = cmbFld;
    for (let i =0, j = ech.length;i<j;i++){
        if (ech[i]){
            if (ech[i].indexOf(fldName + '][')==0){
                let vl : string[] = ech[i].split('][');
                if (vl && vl.length>1 && vl[1]){
                        cmbVls += "|" + vl[1];
                        return cmbVls;
                    
                    
                }
            }
        }
        
      } 
  }

  if (!cmbVls && fldName.indexOf("_year")==0){
    cmbVls = ""
  }
  return cmbVls;
}


import moment from 'moment';
import React from 'react'

export const  useMomentDtArry=(dte : string) =>{
  let ech : any = dte.split("-");
  if (ech[1]=== "Jan"){
    ech[1] = "0";
  } else if (ech[1]=== "Feb"){
    ech[1] = "1";
  } else if (ech[1]=== "Mar"){
    ech[1] = "2";
  } else if (ech[1]=== "Apr"){
    ech[1] = "3";
  } else if (ech[1]=== "May"){
    ech[1] = "4";
  } else if (ech[1]=== "Jun"){
    ech[1] = "5";
  } else if (ech[1]=== "Jul"){
    ech[1] = "6";
  } else if (ech[1]=== "Aug"){
    ech[1] = "7";
  } else if (ech[1]=== "Sep"){
    ech[1] = "8";
  } else if (ech[1]=== "Oct"){
    ech[1] = "9";
  } else if (ech[1]=== "Nov"){
    ech[1] = "10";
  } else if (ech[1]=== "Dec"){
    ech[1] = "11";
  }

  return [parseInt(ech[2]), parseInt(ech[1]), parseInt(ech[0])]
}

export const   UseMomentDateNmb=(dte : string) =>{
    let dtN :any  = moment( useMomentDtArry(dte));
    let dtF :any  = moment( [1900,0, 1]);
    return dtN.diff(dtF, 'days');
}

export const  useMomentDatefrmNmb=(dte : string) =>{
    let vl = moment([1900, 0, 1]).add(parseInt(dte), 'days')
    return moment(vl).format("DD-MMM-yyyy");
}

export const  DateNmbToday=() =>{
  let dtN :any  = moment();
  let dtF :any  = moment( [1900,0, 1]);
  return dtN.diff(dtF, 'days');
}

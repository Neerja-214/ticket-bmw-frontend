import { tab } from "@material-tailwind/react";
import { storeBrdData, storeLvlofcData, storeWhoData } from "../app/store/feature/Login/loginSlice";
import { getStateFullFormWho } from './utilities'
export const setConfiguration = (ary: any, dispatch: any) => {
    let nm: number = !isNaN(Number(ary[0]["lvl"])) ? Number(ary[0]["lvl"]) : ary[0]["lvl"];
    let wh: string = getStateFullFormWho(ary[0]["cpcblvl"]).toUpperCase();
    if (wh) {
        wh = wh.toUpperCase();
        sessionStorage.setItem("who", wh);
        dispatch(storeWhoData(wh));
    }
    sessionStorage.setItem("lvlofc", ary[0]["lvlofc"]);
    dispatch(storeLvlofcData(ary[0]["lvlofc"]))
    sessionStorage.setItem("brd", ary[0]["cpcbof"])
    dispatch(storeBrdData(ary[0]["cpcbof"]))
    
    if (nm == 100) {
        sessionStorage.setItem("lvl", 'CPCB');
        sessionStorage.setItem("myname", "Central Pollution Control Board");
        setTimeout(function () {
            return "/cntr";
        }, 800);
    } else if (nm == 1) {
        //Regional Directorate
        sessionStorage.setItem("lvl", 'RGD');
        //cpcbof][Pune Regional Directorate
        let who: string = ary[0]["cpcblvl"]
        if (who) {
            sessionStorage.setItem("myname", who);
        }
        setTimeout(function () {
            sessionStorage.setItem("rgndirct", ary[0]["usrid"]);
            return "/dashboardvb";
        }, 800);
    } else if (nm == 2) {
        //Regional Directorate
        sessionStorage.setItem("lvl", 'STT');
        //cpcbof][Pune Regional Directorate
        let who: string = ary[0]["cpcblvl"]
        if (who) {
            sessionStorage.setItem("myname", who);
        }
        setTimeout(function () {
            sessionStorage.setItem("sttid", ary[0]["usrid"]);
            return "/dashboardvb";
        }, 800);
    } else if (nm == 200) {
        //Regional Directorate
        sessionStorage.setItem("cbwtfrct", ary[0]["usrid"]);
        setTimeout(function () {
            return "/cbwtf";
        }, 800);
    }
    else {
        return ""
    }



}

export const getLvl = () => {
    return sessionStorage.getItem("lvl") || "";
}
export const getWho = () => {
    return sessionStorage.getItem("who") || "";
}
export const getLvlofc = () => {
    return sessionStorage.getItem("lvlofc") || "";
}

export const getRgndirct = () => {
    return sessionStorage.getItem("rgndirct") || "";
}

export const getCbwtfrct = () => {
    return sessionStorage.getItem("cbwtfrct") || "";
}

export const getMyName = () => {
    return sessionStorage.getItem("myname")?.toUpperCase() || "";
}

export const clrNAValue = (ary: any, cntr: number) => {
    let i: number = 0;
    while (i < ary.length) {
        // ary[i]["cbwtfid"] = i + 1 + cntr;
        if (ary[i]["addra"] == "NA") {
            ary[i]["addra"] = "";
        }
        if (ary[i]["addrb"] == "NA") {
            ary[i]["addrb"] = "";
        }
        if (ary[i]["addrc"] == "NA") {
            ary[i]["addrc"] = "";
        }
        ary[i]["_id"] = "";
        if (isNaN(Number(ary[i]['nobd'])) || Number(ary[i]['nobd']) <= 0) {
            ary[i]['nobd'] = '0'
        }
        else {
            ary[i]['nobd'] = String(ary[i]['nobd'])
        }
        ary[i]["stt"] = getStateFullFormWho(ary[i]['stt']);
        i += 1;
    }
    return ary;
}

export const ttlTipExplore = () => {
    return "To Change level of Heirachy for the Report, Can Choose From Regional Directorate, State, CBWTF";
}

export const ttlPrint = () => {
    return "Print the Details, Will Print only Once the Data is Visible";
}

export const ttlMIS = () => {
    return "Open List of MIS Reports";
}

// export const Correct_Clr_Scnby = (ary : any)=>{

//     // const updatedArray = ary.map((object: any) => {
//     //     if (object.hasOwnProperty('clr')) {
//     //       if (object.clr == 'red'){
//     //         object.clr = "Red"
//     //       }
//     //     } else if (object.hasOwnProperty('id')){
//     //         object.id = "1"
//     //     }

//     //     return object;
//     //   });

//     let i: number = 0;
//     let fieldNames : any[] = ary.map((object :any) => Object.keys(object));
//     let j : number = 0;
//     let vl : string = "";
//       while (i < ary.length) {

//         while ( j < fieldNames[i].length){
//             const fld : string = fieldNames[i][j]
//             console.log(fld)
//             vl = ary[i][fld];



//             if (vl == "ylw") {
//                 vl = "Yellow";
//                 ary[i][fld] = vl
//             } else if (vl == "red") {
//                 vl = "Red";
//                 ary[i][fld] = vl
//             } else if (vl == "blu") {
//                 vl = "Blue";
//                 ary[i][fld] = vl
//             }  else if (vl == "wht") {
//                 vl = "White";
//                 ary[i][fld] = vl
//             } else if (vl == "cyt") {
//                 vl = "Cytotoxic";
//                 ary[i][fld] = vl
//             } else if (vl == "hcf") {
//                 vl = "HCF";
//                 ary[i][fld] = vl
//             } else if (vl == "fct") {
//                 vl = "Factory";
//                 ary[i][fld] = vl
//             } else if (vl == "cbwtf") {
//                 vl = "Superivor";
//                 ary[i][fld] = vl
//             }

//             j+=1;
//         }

//         i += 1;
//       }
//       return ary;
// }

export const check_dsbl = (tabindex: number, tabArry: [], isCbtwf: boolean, forceDisable: number) : boolean => {
    if (forceDisable && forceDisable == 1) {
        return true;
    }
    if (isCbtwf) {
        return true;
    }

    if (tabArry.length > tabindex) {
        if (tabArry[tabindex] == 0) {
            return true;
        } else {
            return false;
        }

    }
    return false;
}

export const control_focus = (msg: string, reqFlds: any) => {
    for(let i =0; i<reqFlds.length;i++){
        if(msg == reqFlds[i]['msg']){
            let fld =reqFlds[i]['fld']
            let control = document.getElementsByName(fld);
            if (control && control.length > 0) {
                control[0].focus();
                break;
            }
        }
    }
}
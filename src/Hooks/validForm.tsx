const CheckPhone = (txt: string, msg: string) => {
  if (txt.length > 4 && txt.length < 11) {
    return true;
  } else {
    return false;
  }
};

const CheckPhoneStd = (txt: string, msg: string) => {
  if (txt.length === 11) {
    return true;
  } else {
    return false;
  }
};

const CheckMobile = (txt: string, msg: string) => {
  if (txt.length === 10) {
    return true;
  } else {
    return false
  }
};

const CheckEmail = (txt: string, msg: string) => {
  let eml: boolean = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(txt);
  if (!eml) {
    return false;
  } else {
    return true;
  }
};

const CheckLatitude = (txt: string, msg: string) => {
  //let ltt: boolean = /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/i.test(txt);
  let ltt: boolean = /^-?([0-8]?[0-9]|90)(\.[0-9]{1,10})$/i.test(txt);
  if (!ltt) {
    return false;
  } else {
    return true;
  }
};

const CheckLongitude = (txt: string, msg: string) => {
  let lgn: boolean = /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})$/i.test(
    txt
  );
  if (!lgn) {
    return false;
  } else {
    return true;
  }
};

const CheckLength = (txt: string, msg: string) => {
  msg = msg.replace("[length]", "");
  let ln: number = Number(msg);
  if (txt.length >= ln) {
    return true
  } else {
    return false;
  }
};

const checkPincode = (txt: string, msg: string) => {
  if (txt.length == 6) {
    return true;
  } else {
    return false;
  }
};

const checkVehicleNumber = (txt: string, msg: string) => {
  let vhcl: boolean = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/i.test(txt);
  if (!vhcl) {
    return false;
  } else {
    return true;
  }
};

const CheckPassword = (txt: string, msg: string) => {
  let pass: boolean = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?])[A-Za-z\d@$!%*?]{8,}$/i.test(txt);
  if (!pass) {
    return false;
  } else {
    return true;
  }
};

const CheckLabel = (txt: string, msg: string) => {
  let lbl: boolean = /^[A-Za-z]{5}[0-9A-Za-z]{10}\d{5}$/i.test(txt);
  if (!lbl) {
    return false;
  } else {
    return true;
  }
};


const validate = (e: string, validateFn: string) => {
  if (validateFn) {
    let fn: string = validateFn;
    if (fn.indexOf("[phone]") > -1) {
      return CheckPhone(e, fn);
    } else if (fn.indexOf("[mob]") > -1) {
      return CheckMobile(e, fn);
    } else if (fn.indexOf("[email]") > -1) {
      return CheckEmail(e, fn);
    } else if (fn.indexOf("[phonestd]") > -1) {
      return CheckPhoneStd(e, fn);
    } else if (fn.indexOf("[length]") > -1) {
      return CheckLength(e, fn);
    } else if (fn.indexOf("[pincode]") > -1) {
      return checkPincode(e, fn);
    } else if (fn.indexOf("[vhclno]") > -1) {
      return checkVehicleNumber(e, fn);
    } else if (fn.indexOf("[latitude]") > -1) {
      return CheckLatitude(e, fn);
    } else if (fn.indexOf("[longitude]") > -1) {
      return CheckLongitude(e, fn);
    } else if (fn.indexOf("[psw]") > -1) {
      return CheckPassword(e, fn);
    } else if (fn.indexOf("[label]") > -1) {
      return CheckLabel(e, fn);
    }
    else {
      return true;
    }
  }
  else {
    return true;
  }
};


export const validForm = (data: string, condts: any) => {
  let msg: string[] = new Array();
  //  if (!data){
  //    return msg;
  //  }
  for (var i = 0, j = condts.length; i < j; i++) {
    if (condts[i]['fld']) {
      let ech = data.split(condts[i]['fld'] + '][');
      if (ech.length > 1) {
        ech = ech[1].split("=");
        if (ech[0]) {
          if (validate(ech[0], condts[i]['chck'])) {

          }
          else {
            msg.push('Invalid : ' + condts[i]['msg']);
          }
        } else {
          msg.push(condts[i]['msg']);
        }
      } else {
        if (condts[i]['fld'].indexOf("dt_") < 0){
          msg.push(condts[i]['msg']);
        }
        
      }
    }
  }

  return msg;
}
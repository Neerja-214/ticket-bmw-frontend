import { useEffect, useReducer, useRef } from "react";
import { useState } from "react";
import { useQuery } from '@tanstack/react-query'
import { FiRefreshCcw } from "react-icons/fi";
import { useNavigate } from "react-router";
import utilities, {
  GetResponseLnx,
  createGetApi,
  dataStr_ToArray,
  generateRandomAlphanumeric,
  getCmpId,
  postLinux,
  setCmpId,
  setUsrId,
} from "../utilities/utilities";
import { Alert } from "@mui/material";
import { Toaster } from '../components/reusable/Toaster';
import { setConfiguration } from '../utilities/cpcb';
// import ministers from '../images/minister.jpeg'
import ministers from '../images/ministers.jpeg'
import br_ministers from '../images/bupendar_ministers.jpeg'
import modiji_ministers from '../images/modiji_ministers.jpeg'
import ar_ministers from '../images/Arpan_ministers.jpeg'
import modiji from '../images/new_minister_image.jpg'
import CPCB_Logo from '../images/CPCB_Logo.jpg'

import About_us from '../images/About_us_bg_img.jpg'
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importing the eye icon
// import pl from '../video/video_bmw.mp4'
// import incinerator1 from '../images/incinerator1.jpeg'
// import incinerator2 from '../images/incinerator2.jpeg'
import incinerator1 from '../images/incinerator_new1.jpg'
import incinerator2 from '../images/incinerator_new2.jpg'
// import incinerator3 from '../images/incinerator3.jpeg'
import plant_1 from '../images/plant_1.jpg'
import plant_2 from '../images/plant_2.jpg'
import plant_3 from '../images/plant_3.jpg'
import plant_4 from '../images/plant_4.jpg'
import plant_5 from '../images/plant_5.jpg'
import plant_6 from '../images/plant_6.jpg'
import plant_7 from '../images/plant_7.jpg'
import { useDispatch } from "react-redux/es/hooks/useDispatch";
import { nrjAxiosRequestBio, nrjAxiosRequestLinux } from "../Hooks/useNrjAxios";
import WtrInput from "../components/reusable/nw/WtrInput";
import { Button, SvgIcon } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { getFldValue, useGetFldValue } from "../Hooks/useGetFldValue";
import { validForm } from "../Hooks/validForm";
import { useToaster } from "../components/reusable/ToasterContext";
import { sign } from "crypto";
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Carousel from 'react-bootstrap/Carousel';
import { Password } from "@mui/icons-material";
import axios from "axios";


const ACTIONS = {
  TRIGGER_GRID: "grdtrigger",
  NEWROWDATA: "newrow",
  RANDOM: "rndm",
  TRIGGER_FORM: "trgfrm",
  GID: "frmdata",
  FORM_DATA: "setfrmda",
  SETFORM_DATA: "setfrmdata",
  MAINID: "mnid",
  CHECK_REQ: "chckreq",
  CHECK_REQDONE: "chckreqdn",
  DISABLEA: "disableA",
  DISABLEB: "disaableB"
};

const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
  trigger: 0,
  textDts: "",
  mainId: 0,
  errMsg: "",
  openDrwr: false,
  frmData: "",
  gid: "",
  disableA: 1,
  disableB: 1,
  disableC: 1,
};

type purBill = {
  triggerG: number;
  nwRow: any;
  rndm: number;
  trigger: number;
  textDts: string;
  mainId: number;
  errMsg: string;
  openDrwr: boolean;
  frmData: string;
  gid: string;
  disableA: number,
  disableB: number,
  disableC: number,
};

type act = {
  type: string;
  payload: any;
};

const reducer = (state: purBill, action: act) => {
  let newstate: any = { ...state };
  switch (action.type) {
    case ACTIONS.MAINID:
      newstate.mainId = action.payload;
      return newstate;
    case ACTIONS.TRIGGER_GRID:
      newstate.triggerG = action.payload;
      return newstate;
    case ACTIONS.TRIGGER_FORM:
      newstate.trigger = action.payload;
      if (action.payload === 0) {
        newstate.textDts = "";
        newstate.frmData = "";
        newstate.mainId = 0;
      }
      return newstate;
    case ACTIONS.NEWROWDATA:
      newstate.nwRow = action.payload;
      return newstate;
    case ACTIONS.RANDOM:
      newstate.rndm += 1;
      return newstate;
    case ACTIONS.GID:
      newstate.gid = action.payload;
      return newstate;
    case ACTIONS.FORM_DATA:
      let dtaF: string = "";
      let fldNF: any = utilities(2, action.payload, "");
      if (newstate.textDts) {
        dtaF = newstate.textDts + "=";
        let d: any = utilities(1, newstate.textDts + "=", fldNF);
        if (d) {
          dtaF = d;
        } else {
          dtaF = "";
        }
      }
      dtaF += action.payload;
      newstate.textDts = dtaF;
      //console.log(dtaF);
      return newstate;

    case ACTIONS.SETFORM_DATA:
      newstate.frmData = action.payload;
      return newstate;
    case ACTIONS.CHECK_REQ:
      newstate.errMsg = action.payload;
      newstate.openDrwr = true;
      return newstate;
    case ACTIONS.CHECK_REQDONE:
      newstate.errMsg = [];
      newstate.openDrwr = false;
      return newstate;
    case ACTIONS.DISABLEA:
      newstate.disableA = action.payload
      return newstate
    case ACTIONS.DISABLEB:
      newstate.disableB = action.payload
      return newstate
  }
};

const NrjLogin = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { showToaster, hideToaster } = useToaster();
  const [usrName, setusrName] = useState("");
  const [hcfLbl, setHcfLbl] = useState("");
  const [psw, setpsw] = useState("");
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState<any>({ message: "" })
  const dispatchGolbal = useDispatch();
  const [captcha, setCaptcha] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [uuid, setUuid] = useState("");
  const [selectedType, setSelectedType] = useState('CPCB');
  const [isHcfIndReg, setIsHcfReg] = useState(false)
  const [showOtpFld, setShowOtpFld] = useState(false)
  const [signuptoken, setSignUpToken] = useState<string>("");
  const isUppercase = sessionStorage.getItem("UpperCase") == "1" ? true : false;

  // const [videoCompleted, setVideoCompleted] = useState(false);
  // const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // const [isSlideshowActive, setIsSlideshowActive] = useState(true);
  const hst: string = window.location.hostname;

  const images = [incinerator1, incinerator2, plant_1, plant_2, plant_3, plant_4, plant_5, plant_6, plant_7];
  type FormData = {
    name: string;
    eml: string;
    subject: string;
    message: string;
  };

  type FormErrors = {
    name?: string;
    eml?: string;
    subject?: string;
    message?: string;
  };

  const [formData, setFormData] = useState<FormData>({ name: "", eml: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [charCount, setCharCount] = useState(0);
  const charLimit = 100;

// State to control visibility of the password expiry modal
const [showExpiryModal, setShowExpiryModal] = useState(false);
// State to store the message related to password expiry
const [expiryRemark, setExpiryRemark] = useState('');
// State to temporarily store navigation data until the user responds to the modal
const [pendingNavigation, setPendingNavigation] = useState<{ ary: any[], dispatchGolbal: any } | null>(null);
// State to track if the password is already expired (used for conditional logic in modal)
const [isExpired, setIsExpired] = useState(false);

  // const slideshowDuration = 3000;

  // const handleVideoEnd = () => {
  //   setVideoCompleted(true);
  //   setIsSlideshowActive(true);
  // };

  // useEffect(() => {
  //   let timer: NodeJS.Timeout | number | undefined;
  //   if (isSlideshowActive) {
  //     timer = setInterval(() => {
  //       setCurrentImageIndex((prevIndex) =>
  //         prevIndex === images.length - 1 ? 0 : prevIndex + 1
  //       );
  //     }, slideshowDuration);
  //   }

  //   // Restart video when slideshow is done
  //   if (currentImageIndex === images.length - 1 && isSlideshowActive) {
  //     setTimeout(() => {
  //       setIsSlideshowActive(false);
  //       setVideoCompleted(false);
  //       setCurrentImageIndex(0);
  //     }, slideshowDuration);
  //   }

  //   return () => {
  //     if (timer) {
  //       clearInterval(timer as NodeJS.Timeout);
  //     }
  //   };
  // }, [isSlideshowActive, currentImageIndex, images.length, slideshowDuration]);

  // const [currentIndex, setCurrentIndex] = useState(0);
  // const sliderRef = useRef<AwesomeSlider | null>(null);

  // // Set up interval to change slides automatically
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentIndex((prevIndex) =>
  //       prevIndex === images.length - 1 ? 0 : prevIndex + 1
  //     );
  //   }, 3000); // Change slide every 3 seconds

  //   return () => clearInterval(interval); // Clear interval on component unmount
  // }, [images.length]);

  // // Function to handle arrow clicks
  // const handleArrowClick = (direction: 'next' | 'prev') => {
  //   setCurrentIndex((prevIndex) => {
  //     if (direction === 'next') {
  //       return prevIndex === images.length - 1 ? 0 : prevIndex + 1;
  //     } else {
  //       return prevIndex === 0 ? images.length - 1 : prevIndex - 1;
  //     }
  //   });
  // };


  const [currentIndex, setCurrentIndex] = useState(0);

  // Set up interval to change slides automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [images.length]);



  const [otpverifiedtoken, setOtpVerifiedToken] = useState<string>("");
  const text = (url: any) => {
    return fetch(url).then(res => res.text());
  }

  const getGid = () => {
    let g: any = utilities(3, "", "");
    dispatch({ type: ACTIONS.GID, payload: g });
    return g;
  };


  useEffect(() => {
    setusrName('')
    setpsw('')
  }, [selectedType])

  useEffect(() => {

    sessionStorage.clear();
    if (hst.includes("103.174.102.113") || !hst.includes("localhost") || hst.includes("edocsahab.online")) {
      sessionStorage.setItem("fhddezeeaa", "1");
    } else {
      sessionStorage.setItem("fhddezeeaa", "0");
      sessionStorage.removeItem("fhddezeeaa");
    }
    reloadCaptcha();
    setusrName('')
    setpsw('')
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        // console.log("my ip address is from ipfi: ", data.ip);
      })
      .catch(error => {
        // console.error('Error fetching IP address:', error);
      });


    text('https://www.cloudflare.com/cdn-cgi/trace').then(data => {
      // let ipRegex = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/
      // let ip = data.match(ipRegex)[0];
      // console.log('getting ip from cloudflare', data);
    });

  }, [0]);




  const onChangeUsr = (event: any) => {
    setusrName(event.target.value);
  };

// Modified proceedToApp function to navigate based on user type
const proceedToApp = (ary?: any[], dispatchGolbal?: any) => {
  // If user data and dispatch function are provided, set global configuration
  if (ary && dispatchGolbal) {
    setConfiguration(ary, dispatchGolbal);
  }

  // Use setTimeout to defer navigation until after current event loop
  setTimeout(() => {
    // Navigate based on selected user type
    if (selectedType === "HCF") {
      // If user type is HCF, navigate to the annual report form tab
      navigate("/hcfAnnlRptFormTab");
    } else {
      // For all other user types, navigate to the default dashboard
      navigate("/dashboardvb");
    }
  }, 0);
};

  const onChangePsw = (event: any) => {
    setpsw(event.target.value);
  };
  const onChangeCaptcha = (event: any) => {
    setCaptcha(event.target.value);
  };

  const handleTypeChange = (event: any) => {
    setSelectedType(event.target.value);
    setIsNotHcfSignup(true);
    setPswDisable(false);
    setDisableOtp(false);
    setIsHcfReg(false)
    setShowOtpFld(false)
  };

  const loginEntity: any = {
    "CPCB": '1',
    "RD": '2',
    "SPCB": '3',
    "HCF": '4',
    "CBWTF": '5'
  }
  const ChkLgnHcf = () => {
    setIsNotHcfSignup(true);
  }
  const ChckLgn = async () => {
    dispatch({ type: ACTIONS.DISABLEA, payload: 0 });
    if (usrName && usrName.length > 0) {
      if (psw && psw.length > 0 && captcha) {
        if (selectedType === 'HCF') {
          let lgnlvl = '4'
          let payload: any = postLinux(usrName + "=" + psw + "=" + captcha + "=" + uuid + '=' + lgnlvl, 'hcf_login');
          nrjAxiosRequestBio("hcf_login", payload).then((res: any) => {
            let isloggedoutJson = {
              by: generateRandomAlphanumeric(10),
              usrnm: res.data.labelno ? res.data.labelno : usrName,
              ky: generateRandomAlphanumeric(10)
            }
            sessionStorage.setItem('isLoggedOut', btoa(JSON.stringify(isloggedoutJson)));
            dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
            if (res.data.status === 'Success') {
              if (selectedType == 'HCF') {
                sessionStorage.setItem("lvl", 'HCF');
                sessionStorage.setItem("who", res.data.hcfnm ? res.data.hcfnm : '')
                navigate("/hcfAnnlRptFormTab")
                localStorage.setItem('hcflogindetails', JSON.stringify(res));
                localStorage.setItem('hcfUserName', res.data.labelno)
                setCmpId(res.data.cmpid);
              }
            } else {
              sessionStorage.removeItem('isLoggedOut');
              showToaster([res.data.message], 'error');
              reloadCaptcha();
              setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQ, payload: "" });
              }, 1900);
            }
          }).catch((error: any) => {
            sessionStorage.removeItem('isLoggedOut')
            dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
          })
        } else if (selectedType === 'CBWTF') {
          let lgnlvl = '5'
          let payload: any = postLinux(usrName + "=" + psw + "=" + captcha + "=" + uuid + '=' + lgnlvl, 'cbwtf_login');
          nrjAxiosRequestBio("cbwtf_login", payload).then((res: any) => {
            dispatch({ type: ACTIONS.DISABLEA, payload: 1 });

            if (res.data.status === 'Success') {
              if (selectedType == 'CBWTF') {
                sessionStorage.setItem("lvl", 'CBWTF');
                sessionStorage.setItem("who", res.data.cbwtfnm ? res.data.cbwtfnm : '')
                navigate("/cbwtfAnnulRpt")
                localStorage.setItem('Cbwtflogindetails', JSON.stringify(res));
                localStorage.setItem('CbwtfUserName', res.data.usrnm)
                let isloggedoutJson = {
                  by: generateRandomAlphanumeric(10),
                  usrnm: res.data.usrnm,
                  ky: generateRandomAlphanumeric(10)
                }
                sessionStorage.setItem('isLoggedOut', btoa(JSON.stringify(isloggedoutJson)));
                setCmpId(res.data.cmpid);
              }
            } else {
              sessionStorage.removeItem('isLoggedOut')
              showToaster([res.data.message], 'error');
              reloadCaptcha();
              setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQ, payload: "" });
              }, 1900);
            }
          }).catch((error: any) => {
            sessionStorage.removeItem('isLoggedOut')
            dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
          })
        } else {
          const payload: any = postLinux(usrName + "|" + psw + "|" + loginEntity[selectedType] + "|" + captcha + "|" + uuid, 'login', true)
          nrjAxiosRequestLinux('check_Login', payload).then((res: any) => {
            let isloggedoutJson = {
              by: generateRandomAlphanumeric(10),
              usrnm: usrName,
              ky: generateRandomAlphanumeric(10)
            }
            sessionStorage.setItem('isLoggedOut', btoa(JSON.stringify(isloggedoutJson)));
            dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
            let ary: any[] = [res.data];
            if (ary && ary[0]["id"] && ary[0]["id"] != "0") {
              // setTimeout(() => {
              //   showToaster(["Successfully logged in"], "success");
              // }, 0);
              if (Number(ary[0]["id"]) > 100) {
                ary[0]["_cmp"] ? setCmpId(ary[0]["_cmp"]) : setCmpId(ary[0]["cmpid"]);
                ary[0]["_usr"] ? setUsrId(ary[0]["_usr"]) : setUsrId(ary[0]["usrid"]);
                // setCmpId(ary[0]["_cmp"]);
                // setUsrId(ary[0]["_usr"]);
                // }
                if (selectedType == 'SPCB') {
                  sessionStorage.setItem('sttDetails', JSON.stringify(ary[0]))
                }
                sessionStorage.setItem("mainid", ary[0]["id"]);
                sessionStorage.setItem("brd", ary[0]["cpcbof"])
                // let hst: string = window.location.href;
                // hst = hst.toLocaleLowerCase()
                if (!ary && Number(ary[0]["pswage"]) >= 150) {
                  navigate('/changePwd?login=false');
                }

                // This block was moved into the reusable proceedToApp function
                // Keeping it commented for reference only
                /*
                else {
                  // Previously, configuration and navigation were handled directly here
                  // Now replaced with a cleaner reusable function
                  // setConfiguration(ary, dispatchGolbal);
                  // setTimeout(() => {
                  //   if (selectedType === "HCF") {
                  //     navigate("/hcfAnnlRptFormTab");
                  //   } else {
                  //     navigate("/dashboardvb");
                  //   }
                  // }, 0);

                  // Replaced by:
                  proceedToApp(ary, dispatchGolbal);
                }
                */

                // Test case setup: manually set a static expiry remark for testing
                 // ary[0].expiry_remark = 'Your password will expire in 3 days. Please update it soon.';

                if (ary[0]?.expiry_remark?.toString().trim()) {
                  // If the expiry_remark is present and not just whitespace,
                  // we assume the password is about to expire and show a modal
                  setIsExpired(ary[0]?.is_expired); // Optional flag if needed for further conditions
                  if(ary[0]?.is_expired){
                    sessionStorage.setItem('isExpired', '1'); // Store in session storage if password is expired
                  }else{
                    sessionStorage.removeItem('isExpired'); // Remove if not expired
                  }
                  setExpiryRemark(ary[0]["expiry_remark"]); // Show the message in modal
                  setPendingNavigation({ ary, dispatchGolbal }); // Store context to continue after modal
                  setShowExpiryModal(true); // Trigger modal display
                } else {
                  // If no expiry warning is present, proceed normally
                  setTimeout(() => {
                    showToaster(["Successfully logged in"], "success"); // Show success message
                  }, 0);
                  proceedToApp(ary, dispatchGolbal); // Navigate to appropriate screen
                } 

              } else {
                sessionStorage.removeItem('isLoggedOut')
                showToaster(["Invalid Credentials / Error Login In"], 'error');
                dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
                setTimeout(function () {
                  dispatch({ type: ACTIONS.CHECK_REQ, payload: "" });
                }, 1900);
              }
            } else {
              setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQ, payload: "" });
              }, 1900);
              reloadCaptcha();
              sessionStorage.removeItem('isLoggedOut')
              setCaptcha("")
              dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
              showToaster([ary[0]["cpcbof"]], 'error');
            }
          }).catch((error: any) => {
            sessionStorage.removeItem('isLoggedOut');
            reloadCaptcha();
            setCaptcha("")
            dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
          })
        }
      } else {
        dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
        sessionStorage.removeItem('isLoggedOut')
        if (!psw && !captcha) {
          showToaster(["Please enter password and captcha"], 'error');
        }
        else if (!psw) {
          showToaster(["Please enter password value"], 'error');

        }
        else if (!captcha) {
          showToaster(["Please enter captcha value"], 'error');

        }
      }
    } else {
      setusrName('');
      setpsw('')
      sessionStorage.removeItem('isLoggedOut')
      dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
      showToaster(["Please enter username"], 'error');
    }
  };

  useEffect(() => {
    // login when click on Enter button
    const handleKeyDown = (event: any) => {
      console.log(isNotHcfSignup)
      if (event.key === "Enter" && selectedType !== "HCF") {
        ChckLgn();
      } else if (event.key === "Enter" && selectedType == "HCF") {
        searchClick()
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [usrName, Password, captcha, selectedType]);



  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const [chkHcfPass, setChkHcfPass] = useState(false)
  const chkPass = () => {
    setChkHcfPass(false);
    if (chkHcfPass) {

    } else {
      navigate('/hcfLgnDtls');
    }
  }

  const [isNotHcfSignup, setIsNotHcfSignup] = useState(true)
  const signUp = () => {
    setIsNotHcfSignup(false)
    // navigate('/hcfMaster');
  }

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false)

  const togglePassword = () => {
    setIsPasswordVisible(!isPasswordVisible);
  }

  ////****************************sign up HCf ******************************** */

  const [pswDisable, setPswDisable] = useState(false)
  const [disableOtp, setDisableOtp] = useState(false)


  const hcfLoginId = !isNaN(Number(sessionStorage.getItem('mainid'))) ? Number(sessionStorage.getItem('mainid')) : 0;
  const reqFlds = [
    { fld: 'psw', chck: '[psw]', msg: 'Enter Password' },
  ];

  const reqFlds1 = [
    { fld: 'hsp', msg: 'Select the Hospital / Lab', chck: '1[length]' },
  ];

  const reqFlds2 = [
    { fld: 'emailOtp', msg: 'Enter Email OTP', chck: '6[length]' },
    { fld: 'mobileOtp', chck: 'Enter Mobile OTP', msg: '6[length]' },
  ];

  const reqFlds3 = [
    { fld: 'emailindhcf', msg: 'Enter Email', chck: '6[length]' },
    { fld: 'mobileindhcf', chck: 'Enter Mobile', msg: '6[length]' },
  ];

  const GetDataValue = (data: string, fld: string) => {
    let vl: string = useGetFldValue(data, fld);
    return vl;
  }

  const [error, setError] = useState("");

  const onChangeDts = (data: string) => {

    dispatch({ type: ACTIONS.FORM_DATA, payload: data });
  };
  const searchHcfClick = () => {
    let api: string = state.textDts;
    let usrnm = getFldValue(api, 'hsp')
    if (selectedType === 'HCF') {
      let payload: any = postLinux(usrnm, 'hcf_signup');
      return nrjAxiosRequestBio("hcf_signup", payload);
    } else {
      let payload: any = postLinux(usrnm, 'cbwtf_signup');
      return nrjAxiosRequestBio("cbwtf_signup", payload);
    }
  }

  const sendIndpntHcfOtp = () => {
    let api: string = state.textDts;
    let usrnm = getFldValue(api, 'hsp')
    let mob = getFldValue(api, 'mobileindhcf')
    let eml = getFldValue(api, 'emailindhcf')
    if (selectedType === 'HCF') {
      let payload: any = postLinux(mob + '=' + eml + '=' + usrnm, 'hcf_indpnt_hcf');
      return nrjAxiosRequestBio("independent_hcf_signup", payload);
    }
    if (selectedType === 'CBWTF') {
      let payload: any = postLinux(mob + '=' + eml + '=' + usrnm, 'hcf_indpnt_hcf');
      return nrjAxiosRequestBio("cbwtf_signup_otp", payload);
    }

  }

  const srchQry = (data: any) => {
    setPswDisable(false);
    if (data && data.data.status === 'Success') {
      if (data.data.signup_token) {
        setSignUpToken(data.data.signup_token)
      } else {
        setSignUpToken('')
      }
      setDisableOtp(true);
      showToaster(["Please Enter Valid OTP send to your register email and mobile number.. "],
        'success')
      setIsHcfReg(false)
      setShowOtpFld(true)
    } else {
      if (data.data.message == 'HCF has not been registered via the CBWTF') {
        setDisableOtp(true);
        setIsHcfReg(true)
        setShowOtpFld(false)
      } else {
        showToaster([data.data.message],
          'error')
        setIsHcfReg(false)
        setShowOtpFld(false)
        setSignUpToken('')
      }
    }
  }

  const sendOtpQry = (data: any) => {
    if (data.data.status === 'Success') {
      if (data.data.signup_token) {
        setSignUpToken(data.data.signup_token)
      } else {
        setSignUpToken('')
      }

      setDisableOtp(true);
      setIsHcfReg(true)
      setShowOtpFld(true)
      showToaster(["Please Enter Valid OTP send to your email and mobile number.. "],
        'success')
    } else {
      showToaster([data.data.message], 'error');
      setIsHcfReg(true)
      setShowOtpFld(false)
      setSignUpToken('')
    }
  }

  const verifyOtpClick = () => {
    let api: string = state.textDts;
    let cmpId = getCmpId()
    let usrnm = getFldValue(api, 'hsp')
    let emlotp = getFldValue(api, 'emailOtp');
    let mobotp = getFldValue(api, 'mobileOtp')
    let signup_token: string = signuptoken;
    if (selectedType === 'HCF') {
      let payload: any = postLinux(mobotp + '=' + emlotp + '=' + usrnm + '=' + signup_token, 'hcf_signup_otp');
      return nrjAxiosRequestBio("hcf_signup_otp  ", payload);
    } else {
      console.log(signup_token,'singuptoken2');
      let payload: any = postLinux(mobotp + '=' + emlotp + '=' + usrnm + '=' + signup_token, 'cbwtf_signup_otp');
      return nrjAxiosRequestBio("cbwtf_signup_otp  ", payload);
    }
  }

  const vrfyQry = (data: any) => {
    if (data.data.status == 'Success') {
      setOtpVerifiedToken(data.data.signup_otpverified_token)
      showToaster([data.data.message],
        'success')
      setPswDisable(true);
      setShowOtpFld(false)
      setIsHcfReg(false)
    } else {
      showToaster([data.data.message],
        'error');
      setOtpVerifiedToken("")
      setShowOtpFld(true)
      setIsHcfReg(false);
      setPswDisable(false);
    }
  }

  const HandleSaveClick = () => {
    let api: string = state.textDts;
    let usrnm = getFldValue(api, 'hsp')
    let psw = getFldValue(api, 'psw');
    let signup_otpverified_token = otpverifiedtoken
    if (selectedType === 'HCF') {
      let payload: any = postLinux(psw + "=" + usrnm + '=' + signup_otpverified_token, 'hcf_setpsw');
      return nrjAxiosRequestBio("hcf_setpsw  ", payload);
    } else {
      let payload: any = postLinux(usrnm + '=' + psw + '=' + signup_otpverified_token , 'cbwtf_setpsw');
      return nrjAxiosRequestBio("cbwtf_setpsw  ", payload);
    }

  };

  const svdQry = (data: any) => {
    // refetchW();
    if (data.data.status === 'Success') {
      showToaster(["Password set successfully.. "],
        'success')
      setTimeout(() => {
        setIsNotHcfSignup(true)
        setIsHcfReg(false)
        setShowOtpFld(false)
        setPswDisable(false);
      }, 3000)
    } else {
      showToaster([data.data.message],
        'error')
    }

  }

  const sendOtpClick = () => {

    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds3);
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    dispatch({ type: ACTIONS.DISABLEA, payload: 1 })
    refetchIndhcf()

  }

  const verifyClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds2);
    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    dispatch({ type: ACTIONS.DISABLEA, payload: 1 })
    refetchO();
  }
  const searchClick = () => {

    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds1);

    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    dispatch({ type: ACTIONS.DISABLEA, payload: 1 })
    refetchS();

  }

  const saveClick = () => {
    let api: string = state.textDts;
    let msg: any = validForm(api, reqFlds);
    if (getFldValue(api, 'psw') != getFldValue(api, 'rpsw')) {
      showToaster(msg, 'error');
      msg.push("Passwords do not match!")
      setError("Password do not match");
    } else {
      setError("");
    }

    if (msg && msg[0]) {
      showToaster(msg, 'error');
      dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
      setTimeout(function () {
        dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
      }, 2500);
      return;
    }
    dispatch({ type: ACTIONS.DISABLEA, payload: 1 })
    refetch();
  }




  const { data, refetch } = useQuery({
    queryKey: ['svQryP', state.mainId, state.rndm],
    queryFn: HandleSaveClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: svdQry,
  })


  const { data: dataS, refetch: refetchS } = useQuery({
    queryKey: ['svQry', state.mainId, state.rndm],
    queryFn: searchHcfClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: srchQry,
  })

  const { data: dataIndHcf, refetch: refetchIndhcf } = useQuery({
    queryKey: ['sendotpQry', state.mainId, state.rndm],
    queryFn: sendIndpntHcfOtp,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: sendOtpQry,
  })

  const { data: dataO, refetch: refetchO } = useQuery({
    queryKey: ['vrfyQry', state.mainId, state.rndm],
    queryFn: verifyOtpClick,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: vrfyQry,
  })

  const clrFunct = () => {
    dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
    setTimeout(() => {
      dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    }, 300)
  }

  const navigateToAr = () => {
    navigate('/hcfAr');
  }

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login")
  }

  const reloadCaptcha = () => {
    let gid = getGid();
    let payload: any = postLinux(gid, 'getCaptcha')
    nrjAxiosRequestLinux('captcha', payload).then((res: any) => {
      let dt = GetResponseLnx(res);
      if (dt && dt.data && dt.data.image) {
        setCaptchaImage(dt.data.image)
        setUuid(dt.data.uuid);
      }
      else {
        showToaster(["Failed to load captcha"], 'error')
      }
    })
  }

  const labelHcfCbwtf = selectedType === 'HCF' ? 'Label Number' : 'User Name';
  const [inputCaptcha, setInputCaptcha] = useState("");

  // Function to generate a random captcha
  function generateCaptcha() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const validate = () => {
    let tempErrors: FormErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.eml.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) tempErrors.eml = "Invalid email format";
    if (!formData.subject.trim()) tempErrors.subject = "Subject is required";
    if (formData.message.length < 10) tempErrors.message = "Message must be at least 10 characters long";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateEmail = (email: string) => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors((prevErrors) => ({ ...prevErrors, eml: "Invalid email format" }));
    } else {
      setErrors((prevErrors) => {
        const { eml, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "message") {
      if (value.length <= 100) {
        setFormData({ ...formData, [name]: value });
        setCharCount(value.length);
      }
    } else {
      // Update other fields normally
      setFormData({ ...formData, [name]: value });
    }

    // Validate email if the field is "email"
    if (name === "eml") {
      validateEmail(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const response = await axios.post("https://biowaste.in/cpcb_contact_us", formData);
      if (response.status === 200 && response.data.message == "success") {
        showToaster(["Data save successfully. "], 'success');
        setFormData({ name: "", eml: "", subject: "", message: "" });
      } else {
        showToaster(["Submission failed! Please try again."], 'error');
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showToaster(["Something went wrong! Please try again."], "error");
    }
  };

  useEffect(() => {
    if (window.location.href.endsWith('.pdf')) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = '/assets/cpcblogo.png'; // Set your favicon path
    }
  }, []);

  const handleOpenPDF = () => {
    window.open('/pdf-viewer.html', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow bg-white">
          <input type="text" style={{ display: 'none' }} autoComplete="username" />
          <input type="password" style={{ display: 'none' }} autoComplete="new-password" />

          <header className="flex w-full items-center justify-between px-4 py-2 gap-x-2 md:gap-x-4">
            {/* Left Side Logos and Ministry Name */}
            <div className="flex items-center gap-x-2 md:gap-x-4 shrink-0">
              <img
                src="https://eprplastic.cpcb.gov.in/assets/images/header-images/right-header-image.png"
                alt="Logo 1"
                className="h-10 md:h-14 lg:h-16"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/en/9/9b/Ministry_of_Environment%2C_Forest_and_Climate_Change_%28MoEFCC%29_logo.webp"
                alt="Logo 2"
                className="h-10 md:h-14 lg:h-16"
              />
              <div className="flex flex-col items-start text-xs md:text-sm leading-tight">
                <span className="font-semibold md:text-left font-sans">
                  Ministry of Environment, Forest and Climate
                </span>
                <span className="font-semibold md:text-left font-sans">
                  Change Government of India
                </span>
              </div>
            </div>

            {/* Heading Name (Wraps in 3 lines at 1024px, Single Line at 1440px) */}
            <div className="text-center flex-1 max-w-[250px] sm:max-w-[380px] md:max-w-[450px] lg:max-w-[500px] xl:max-w-[650px] 2xl:max-w-full">
              <h1 className="text-xs md:text-md lg:text-lg font-semibold text-[#283593] leading-tight 
      lg:whitespace-normal 2xl:whitespace-nowrap">
                Centralised Bar Code System For Tracking of Biomedical Waste - CBST-BMW
              </h1>
            </div>

            {/* Right Side Logos */}
            <div className="flex items-center gap-x-2 md:gap-x-4 shrink-0">
              <img src={CPCB_Logo} alt="Logo 3" className="h-10 md:h-14 lg:h-16" />
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaR0MDuxr4P1nT7tcj-j7FLNCz3GyW_ioo6Q&s"
                alt="Logo 4"
                className="h-10 md:h-14 w-20 md:w-24"
              />
            </div>
          </header>
          <nav className="bg-[#283593] px-4 relative z-20">
            <ul className="flex flex-wrap justify-center gap-4 md:gap-8 py-3 text-white font-semibold text-sm md:text-base">
              <li className="cursor-pointer hover:underline">Home</li>
              <li className="cursor-pointer hover:underline">About Us</li>
              <li className="relative group cursor-pointer hover:underline">
                <div className="flex items-center">
                  Rules and Guidelines
                  <span className="ml-2 text-sm">&#9660;</span>
                </div>
                <ul className="absolute left-0 top-full bg-[#283593] text-white rounded-md shadow-lg w-48 z-30 hidden group-hover:block pl-0">
                  <li className="w-full block px-4 py-2 text-sm cursor-pointer hover:bg-white hover:text-[#283593]">
                    <a
                      href="https://cpcb.nic.in/uploads/Projects/Bio-Medical-Waste/Guidelines_for_Bar_Code_System_for_HCFs_and_CBWTFs.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-inherit  no-underline"
                    >
                     Guidelines for CBST-BMW
                    </a>
                  </li>
                </ul>
              </li>

              <li className="relative group cursor-pointer hover:underline">
                <div className="flex items-center">
                  User Manual
                  <span className="ml-2 text-sm">&#9660;</span>
                </div>
                <ul className="absolute left-0 top-full bg-[#283593] text-white rounded-md shadow-lg w-48 z-30 hidden group-hover:block pl-0">

                  <li className="w-full block px-4 py-2 text-sm cursor-pointer hover:bg-white hover:text-[#283593]">
                    <a
                      href="https://testing.barcodebmw.in/assets/CBST-BMW-Instruction-Manual_CPCB.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-inherit  no-underline"
                    >
                      CPCB
                    </a>
                  </li>
                  <li className="w-full block px-4 py-2 text-sm cursor-pointer hover:bg-white hover:text-[#283593]">
                    <a
                      href="https://testing.barcodebmw.in/assets/CBST-BMW-Instruction-Manual_RD.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-inherit  no-underline"
                    >
                      RD
                    </a>
                  </li>
                  <li className="w-full block px-4 py-2 text-sm cursor-pointer hover:bg-white hover:text-[#283593]">
                    <a
                      href="https://testing.barcodebmw.in/assets/CBST-BMW-Instruction-Manual_SPCB.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-inherit  no-underline"
                    >
                      SPCB/PCC
                    </a>
                  </li>
                  <li className="w-full block px-4 py-2 text-sm cursor-pointer hover:bg-white hover:text-[#283593]">
                    <a
                      href="https://testing.barcodebmw.in/assets/CBST-BMW-Instruction-Manual_HCF.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-inherit  no-underline"
                    >
                      HCF
                    </a>
                  </li>
                  <li className="w-full block px-4 py-2 text-sm cursor-pointer hover:bg-white hover:text-[#283593]">
                    <span
                      onClick={handleOpenPDF}
                      className="block w-full text-inherit no-underline cursor-pointer"
                    >
                      CBWTF
                    </span>
                  </li>
                </ul>
              </li>
              {/* <li className="cursor-pointer hover:underline">Contact Us</li> */}
              <li
                className="cursor-pointer hover:underline"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                Contact Us
              </li>
            </ul>
          </nav>
          {/* Marquee Line */}
          <div className="relative overflow-hidden bg-[#283593] py-3 z-10">
            <div className="absolute top-0 left-0 w-full h-full flex items-center">
              <div className="animate-marquee whitespace-nowrap text-white text-sm md:text-base font-semibold font-sans">
                Important Announcement: The Centralised Bar Code System for Tracking of Biomedical Waste (CBST-BMW) is now live!
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row justify-center items-center gap-6 px-6 py-1">
            {/* Left Grid (Paragraph & Image Slider) */}
            <div className="w-full lg:w-4/12 bg-white p-3 flex flex-col justify-start h-[500px] lg:h-auto overflow-hidden">
              <p className="text-xl mb-1 text-justify">
                Implementation  of Barcode System for tracking Biomedical Waste management from its generation to treatment.
                This initiative will ensure compliance with the Biomedical Waste management Rules-2016, enhance accountability,
                and safeguard public health and the environment.
              </p>

              <div className="carousel-container mt-4 flex-grow lg:flex-grow-0">
                <Carousel activeIndex={currentIndex} onSelect={(selectedIndex) => setCurrentIndex(selectedIndex)} interval={3000} fade>
                  {images.map((image, index) => (
                    <Carousel.Item key={index}>
                      <img
                        src={image}
                        className="d-block object-cover w-full h-[200px] lg:h-[250px] rounded-lg"
                        alt={`Slide ${index + 1}`}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
            </div>
            {/* Middle Grid (Image or Content) */}
            <div className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 xl:w-3/12 bg-white flex flex-col items-center justify-center  md:h-[550px] lg:h-[649px] xl:h-[550px] 2xl:h-[600px] 3xl:h-[650px] 4k:h-[700px] overflow-hidden">
              <img src={modiji} alt="Middle Section" className="h-[300px] md:h-[350px] lg:h-[618px] xl:h-[500px] 2xl:h-[500px] 3xl:h-[550px] 4k:h-[650px] w-auto rounded-lg" />
            </div>
            {/* Right Grid (User Input Form) */}
            {/* <div className="w-full lg:w-4/12 flex flex-col items-center justify-center p-6 rounded-3xl shadow-lg text-white bg-gradient-to-r from-[#a5aac8] to-[#3f51b5] md:h-[635px] lg:h-[600px] xl:h-[500px] 2xl:h-[500px] 3xl:h-[600px] 4k:h-[450px] overflow-hidden"> */}
            <div className="w-full lg:w-4/12 bg-white p-3 flex flex-col justify-start h-[500px] lg:h-auto min-h-[500px] rounded-3xl shadow-lg text-white bg-gradient-to-r from-[#a5aac8] to-[#3f51b5] overflow-hidden">
              <h2 className="text-xl font-semibold mb-4 text-center">User Login</h2>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {["CPCB", "RD", "SPCB", "HCF", "CBWTF"].map((role, index) => (
                  <div key={index} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="option"
                      className="mr-2"
                      value={role}
                      checked={selectedType === role}
                      onChange={handleTypeChange}
                    />
                    <label htmlFor={role}>{role}</label>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                {isNotHcfSignup ?
                  <form className="space-y-4 max-w-md w-full mx-auto p-4">
                    <div className="mt-1">
                      <label className="text-sm font-normal text-white !text-white">
                        {selectedType === 'HCF' ? 'Label Number' : 'User  Name'}
                      </label>
                      <div className="relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                        <input
                          type="text"
                          onChange={onChangeUsr}
                          name="email"
                          id="email"
                          onCopy={(e) => e.preventDefault()}
                          onPaste={(e) => e.preventDefault()}
                          autoComplete="off"
                          className="bg-white border border-gray-300 text-gray-900  sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pl-10"
                          placeholder={selectedType === 'HCF' ? 'Label Number' : 'User  Name'}
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="text-sm font-normal">Password</label>
                      <div className="relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          fill="currentColor"
                        >
                          <path d="M12 2C9.79 2 8 3.79 8 6v4H6v12h12V10h-2V6c0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2v4h-4V6c0-1.1.9-2 2-2zm-4 8h8v10H8V12zm4 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9-2-2-.9-2-2-2z" />
                        </svg>
                        <input
                          type={isPasswordVisible ? 'text' : 'password'}
                          onChange={onChangePsw}
                          name="password"
                          id="password"
                          onCopy={(e) => e.preventDefault()}
                          onPaste={(e) => e.preventDefault()}
                          autoComplete="new-password"
                          className="bg-white border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pl-10"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={togglePassword}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {isPasswordVisible ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="20"
                              height="20"
                              fill="currentColor"
                            >
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="20"
                              height="20"
                              fill="currentColor"
                            >
                              <path d="M12 6c-3.31 0-6.31 1.64-8.11 4.11L2 12l1.89 1.89C5.69 16.36 8.69 18 12 18c3.31 0 6.31-1.64 8.11-4.11L22 12l-1.89-1.89C18.31 7.64 15.31 6 12 6zm0 10c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM3.51 3.49 2.1 4.9l1.45 1.45C2.58 7.5 1.44 9.66 1 12c.46 2.34 1.58 4.5 2.55 5.65l1.42-1.42C3.57 15.08 2.54 13.07 2 12c.5-1.07 1.51-3.08 2.98-4.23L6.9 6.9 3.51 3.49zm17.98 0-1.42 1.42C20.49 8.92 21.5 10.93 22 12c-.46 2.34-1.58 4.5-2.55 5.65l1.42 1.42C21.42 18.5 22.54 16.34 23 14c-.46-2.34-1.58-4.5-2.55-5.65l-1.42 1.42C20.49 10.92 21.5 12.93 22 14c-.5 1.07-1.51 3.08-2.98 4.23L17.1 17.1l3.39 3.39 1.41-1.41z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-1">
                      <div className="grid grid-cols-2 gap-x-3">
                        <div className="py-5">
                          <input
                            type="text"
                            onChange={onChangeCaptcha}
                            name="captcha"
                            id="captcha"
                            value={captcha}
                            onCopy={(e) => e.preventDefault()}
                            onPaste={(e) => e.preventDefault()}
                            autoComplete="off"
                            className="bg-white border-0 border-gray-300 text-gray-900 sm:text-sm rounded-l-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            required
                            maxLength={6}
                          />
                        </div>
                        <div className="flex items-center">
                          <img src={captchaImage} alt="captcha" style={{ height: "50px", width: "250px" }} />
                          <svg
                            onClick={reloadCaptcha}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 30 30"
                            width="30"
                            height="30"
                            fill="white"
                            className="ml-1 cursor-pointer"
                          >
                            <path d="M 15 3 C 12.053086 3 9.3294211 4.0897803 7.2558594 5.8359375 A 1.0001 1.0001 0 1 0 8.5449219 7.3652344 C 10.27136 5.9113916 12.546914 5 15 5 C 20.226608 5 24.456683 8.9136179 24.951172 14 L 22 14 L 26 20 L 30 14 L 26.949219 14 C 26.441216 7.8348596 21.297943 3 15 3 z M 4.3007812 9 L 0.30078125 15 L 3 15 C 3 21.635519 8.3644809 27 15 27 C 17.946914 27 20.670579 25.91022 22.744141 24.164062 A 1.0001 1.0001 0 1 0 21.455078 22.634766 C 19.72864 24.088608 17.453086 25 15 25 C 9.4355191 25 5 20.564481 5 15 L 8.3007812 15 L 4.3007812 9 z"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {selectedType === 'HCF' || selectedType === 'CBWTF' ? (
                        <button
                          type="button"
                          disabled={!state.disableA}
                          onClick={signUp}
                          className="btn text-black focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center"
                          style={{ background: '#ECEFF1' }}
                        >
                          Sign Up
                        </button>
                      ) : null}

                      {!isNotHcfSignup ? (
                        <button
                          type="button"
                          color="primary"
                          disabled={!pswDisable}
                          onClick={saveClick}
                          style={{ background: '#0369A1' }}
                          className={`btn text-white mr-2 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800
                       ${!pswDisable ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          Submit
                        </button>
                      ) : null}


                      <button
                        type="button"
                        disabled={!state.disableA}
                        onClick={ChckLgn}
                        className="btn text-black hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center"
                        style={{ background: '#ECEFF1' }}
                      >
                        Sign In
                      </button>
                    </div>

                  </form> :
                  <div className="flex flex-col items-center justify-center p-1">
                    <form className="space-y-4 md:space-y-6" action="#">
                      <>
                        <div className="flex grid grid-cols-10 gap-x-8 gap-y-4">
                          <div className="col-span-8">
                            <WtrInput
                              displayFormat="1"
                              Label={labelHcfCbwtf}
                              fldName="hsp"
                              idText="txthsp"
                              onChange={onChangeDts}
                              dsabld={false}
                              callFnFocus=""
                              dsbKey={false}
                              validateFn="5[length]"
                              allowNumber={false}
                              unblockSpecialChars={true}
                              selectedValue={state.frmData}
                              clrFnct={state.trigger}
                              speaker={"Enter valid Input"}
                              upprCase={true}
                              delayClose={1000}
                              placement="right"
                              ClssName="bg-gray-50 border border-gray-300 text-white sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            ></WtrInput>
                          </div>
                          <div className=" mt-8 col-span-2">
                            <Button
                              size="medium"
                              style={{ backgroundColor: "#86c6d9" }}
                              variant="contained"
                              disabled={false}
                              onClick={searchClick}>
                              Search
                            </Button>
                          </div>
                        </div>

                        {isHcfIndReg &&
                          <div className="flex flex-col items-center justify-center p-1">
                            <div className="flex grid grid-cols-10 gap-x-8 gap-y-4 items-center">
                              <div className="col-span-4">
                                <WtrInput
                                  Label="Email"
                                  displayFormat="1"
                                  fldName="emailindhcf"
                                  idText="txtemailind"
                                  onChange={onChangeDts}
                                  dsabld={false}
                                  callFnFocus=""
                                  dsbKey={false}
                                  unblockSpecialChars={true}
                                  upprCase={isUppercase}
                                  validateFn="[email]"
                                  allowNumber={false}
                                  selectedValue={state.frmData}
                                  clrFnct={state.trigger}
                                  speaker={"Enter Email"}
                                  delayClose={1000}
                                  ClssName=""
                                  placement="right"
                                ></WtrInput>
                              </div>
                              <div className="col-span-4">
                                <WtrInput
                                  displayFormat="1"
                                  Label="Mobile"
                                  fldName="mobileindhcf"
                                  idText="txtmobileind"
                                  onChange={onChangeDts}
                                  dsabld={false}
                                  callFnFocus=""
                                  dsbKey={false}
                                  validateFn="[mob]"
                                  allowNumber={true}
                                  selectedValue={state.frmData}
                                  clrFnct={state.trigger}
                                  speaker={"Enter Mobile Number"}
                                  delayClose={1000}
                                  placement="right"
                                  ClssName=""
                                  minValue={-1}
                                ></WtrInput>
                              </div>
                              <div className='mt-6 col-span-2'>
                                <Button
                                  size="small"
                                  style={{
                                    backgroundColor: "#86c6d9",
                                    padding: "6px 12px", // Adjust padding to control height and width
                                    fontSize: "14px", // Adjust font size to keep text in a single line
                                    textTransform: "none", // Keep original text formatting
                                    whiteSpace: "nowrap" // Prevent text from wrapping
                                  }}
                                  variant="contained"
                                  color="success"
                                  disabled={!disableOtp}
                                  // startIcon={<SaveIcon />}
                                  onClick={sendOtpClick}>
                                  Send OTP
                                </Button>
                              </div>
                            </div>
                          </div>
                        }

                        {showOtpFld &&
                          <div className="flex flex-col items-center justify-center p-1">
                            <div className="flex grid grid-cols-10 gap-x-8 gap-y-4">
                              <div className="col-span-8">
                                <WtrInput
                                  displayFormat="1"
                                  Label="Email OTP"
                                  fldName="emailOtp"
                                  idText="txtemailOtp"
                                  onChange={onChangeDts}
                                  dsabld={!disableOtp}
                                  callFnFocus=""
                                  dsbKey={false}
                                  validateFn="6[length]"
                                  allowNumber={true}
                                  unblockSpecialChars={true}
                                  selectedValue={state.frmData}
                                  clrFnct={state.trigger}
                                  speaker={"Enter Email OTP"}
                                  upprCase={true}
                                  delayClose={1000}
                                  placement="right"
                                  ClssName=""
                                  maxLength={6}
                                ></WtrInput>
                              </div>
                              <div className="col-span-4">
                                <WtrInput
                                  displayFormat="1"
                                  Label="Mobile OTP"
                                  fldName="mobileOtp"
                                  idText="txtmobileOtp"
                                  onChange={onChangeDts}
                                  dsabld={!disableOtp}
                                  callFnFocus=""
                                  dsbKey={false}
                                  validateFn="6[length]"
                                  allowNumber={true}
                                  unblockSpecialChars={true}
                                  selectedValue={state.frmData}
                                  clrFnct={state.trigger}
                                  speaker={"Enter Mobile OTP"}
                                  upprCase={true}
                                  delayClose={1000}
                                  placement="right"
                                  ClssName=""
                                  maxLength={6}
                                ></WtrInput>
                              </div>
                              <div className='mt-7 col-span-1'>
                                <Button
                                  size="medium"
                                  style={{ backgroundColor: "#86c6d9" }}
                                  variant="contained"
                                  color="success"
                                  disabled={!disableOtp}
                                  // startIcon={<SaveIcon />}
                                  onClick={verifyClick}>
                                  Verify
                                </Button>
                              </div>
                            </div>
                          </div>}
                        <div>
                          {pswDisable ? <>
                            <div>
                              <WtrInput
                                displayFormat="5"
                                Label="Password"
                                fldName="psw"
                                idText="txtpsw"
                                inputType="password"
                                onChange={onChangeDts}
                                dsabld={!pswDisable}
                                callFnFocus=""
                                dsbKey={false}
                                unblockSpecialChars={true}
                                validateFn="[psw]"
                                ToolTip="Enter Password"
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                speaker={"Enter Password"}
                                delayClose={1000}
                                placement="right"
                                ignoreCapitalise = {1}
                                ClssName=""
                              ></WtrInput>
                              <WtrInput
                                displayFormat="5"
                                Label="Retype Password"
                                fldName="rpsw"
                                idText="txtpsw"
                                inputType="password"
                                onChange={onChangeDts}
                                dsabld={!pswDisable}
                                callFnFocus=""
                                dsbKey={false}
                                unblockSpecialChars={true}
                                validateFn="[psw]"
                                ToolTip="Re-Enter Password"
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                speaker={"Enter Password"}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                showErrorMsgAbsolute={false}
                              ></WtrInput>
                              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                            </div>
                          </> : <></>}

                        </div>
                      </>
                      <div className="flex my-4 justify-between items-center">
                        {false && <div>
                          <a
                            onClick={() => {
                              navigate('/forgotPassword');
                            }}
                            className="text-sm font-medium text-indigo-800	 hover:underline dark:text-primary-500"
                          >
                            Forgot password?
                          </a>
                        </div>}
                        <div>
                          {(selectedType === 'HCF' || selectedType === 'CBWTF') && isNotHcfSignup ? <button
                            type="button"
                            color="primary"
                            disabled={!state.disableA}
                            onClick={signUp}
                            style={{ background: '#0369A1' }}
                            className="btn text-white	mr-2 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                          >
                            Sign Up
                          </button> : <></>}
                          {!isNotHcfSignup ?
                            <button
                              type="button"
                              color="primary"
                              disabled={!pswDisable}
                              onClick={saveClick}
                              style={{ background: '#0369A1' }}
                              className="btn text-white	mr-2 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            >
                              Submit
                            </button>
                            : <></>}
                          <button
                            type="button"
                            disabled={!state.disableA}
                            onClick={ChkLgnHcf}
                            className="btn text-white hover:bg-sky-700	 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                            style={{ background: '#513498' }}
                          >
                            Sign In
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                }
              </div>
            </div>
          </div>
          <div
            className="w-full flex justify-center items-center min-h-[300px] sm:min-h-[250px] md:min-h-[350px] lg:min-h-[420px] xl:min-h-[500px] 2xl:min-h-[600px] 3xl:min-h-[700px] relative bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out"
            style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.80), rgba(255, 255, 255, 0.80)), url(${About_us})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}>
            <div className="absolute inset-0 bg-white opacity-40"></div>
            <div className="relative text-center px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">About CPCB</h2>
              <p className="text-lg text-gray-900 max-w-2xl mx-auto text-justify">
                The Central Pollution Control Board (CPCB), a statutory organization, was constituted in
                September 1974 under the Water (Prevention and Control of Pollution) Act, 1974. Further,
                CPCB was entrusted with the powers and functions under the Air (Prevention and Control of
                Pollution) Act, 1981.
              </p>
              <a href="https://cpcb.nic.in/" className="inline-block bg-blue-500 text-white no-underline hover:bg-blue-800 mt-6 py-3 px-6 rounded-lg text-lg font-semibold transition duration-300">
                Learn More
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col min-h-screen">
          <section id="contact" className="flex-grow w-full flex flex-col justify-center items-center p-4 md:p-8 bg-gray-100 pb-20">
            <div className="w-full max-w-8xl bg-gradient-to-r from-[#a5aac8] to-[#3f51b5] rounded-2xl shadow-lg p-6 md:p-8 flex flex-col items-center transition-all duration-500 my-10 md:my-16">
              <h2 className="text-2xl md:text-2xl font-bold text-center text-white mb-8">Do you have any Query?</h2>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 md:p-8 flex flex-col justify-center text-white drop-shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 drop-shadow-lg">Contact Us :</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <div className="grid grid-cols-2 gap-4 drop-shadow-lg w-full">
                        <div>
                          <span className="font-semibold block">Office :</span>
                          <span className="font-normal block">Parivesh Bhawan, East Arjun Nagar, Delhi-110032</span>
                        </div>
                        <div>
                          <span className="font-semibold block">Email :</span>
                          <span className="font-normal block break-all">bmw[dot]cpcb[at]gov[dot]in</span>
                        </div>
                      </div>

                      {/* <div className="flex items-center gap-1">
                        <p className="drop-shadow-lg">
                          <span className="font-semibold">Email :</span>
                          <br />
                          <span className="font-normal"> ewaste[dot]cpcb[at]gov[dot]in</span>
                        </p>
                      </div> */}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-3/4 ml-auto mr-0 md:w-2/3">
                  <h3 className="text-xl font-semibold mb-4 text-blue-900">Write to us:</h3>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    <input type="email" name="eml" placeholder="Email" value={formData.eml} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.eml && <p className="text-red-500 text-sm">{errors.eml}</p>}
                    <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                    <div>
                      <textarea
                        name="message"
                        placeholder="Message"
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                      <p className={`text-sm ${charCount === charLimit ? "text-red-500" : "text-gray-500"}`}>
                        {charCount}/{charLimit} characters
                      </p>
                      {charCount === charLimit && (
                        <p className="text-red-500 text-sm">Character limit reached!</p>
                      )}
                    </div>
                    {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
                    <button type="submit" className="w-1/3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Footer pushed to bottom */}
          <footer className="w-full text-center bg-gray-900 text-white py-4 mt-auto">
            <p className="text-sm">&copy; {new Date().getFullYear()} CPCB. All Rights Reserved.</p>
            <p className="text-sm mt-1">
              Contact:
              <a href="mailto:bmw.cpcb@gov.in" className="underline mx-1">bmw.cpcb@gov.in</a> |
              <a href="tel:01143102322" className="underline mx-1">011-43102322</a>
            </p>
          </footer>
        </div>
      </div>

    {showExpiryModal && (
  // Render the modal only when showExpiryModal is true
  <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000 // Ensure modal appears above all other elements
  }}>
      {/* Modal Content Container */}
      <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)' // Subtle shadow for depth
      }}>
          {/* Modal Header */}
          <h3 style={{ color: '#283593', marginTop: 0 }}>
              Password Expiry Notice
          </h3>

          {/* Dynamic Message from expiryRemark */}
          <p>{expiryRemark}</p>

          {/* Action Buttons Section */}
          <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '10px', 
              marginTop: '20px'
          }}>
              {/* "Change Password" button - always shown */}
              <button 
                  onClick={() => {
                      setShowExpiryModal(false); // Close modal
                       if (!isExpired) {
                            // Only configure and navigate if not expired
                            if (pendingNavigation?.ary && pendingNavigation?.dispatchGolbal) {
                                setConfiguration(pendingNavigation.ary, pendingNavigation.dispatchGolbal);
                            }
                            navigate('/changePwd'); // Navigate with login=true
                            } else {
                                // Navigate with login=false if expired
                                navigate('/changePwd');
                            }
                  }}
                  style={{ 
                      padding: '8px 16px',
                      background: '#283593',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                  }}
              >
                  Change Password
              </button>

              {/* "Remind Me Later" button - shown only if not expired and remark is non-empty */}
              {!isExpired && expiryRemark.trim() && (
                <button 
                    onClick={() => {
                        setShowExpiryModal(false); // Close modal
                        if (pendingNavigation) {
                            // Continue where user left off before modal
                            proceedToApp(pendingNavigation.ary, pendingNavigation.dispatchGolbal);
                        } else {
                            // Fallback in case navigation context is missing
                            proceedToApp();
                        }
                    }}
                    style={{ 
                        padding: '8px 16px',
                        background: '#e0e0e0',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Remind Me Later
                </button>
              )}
          </div>
      </div>
  </div>
)}

      <style>
        {`
    @keyframes marquee {
      from { transform: translateX(100%); }
      to { transform: translateX(-100%); }
    }
    .animate-marquee {
      display: inline-block;
      white-space: nowrap;
      animation: marquee 20s linear infinite;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }
  `}
      </style>
    </>
  );
};
export default NrjLogin;
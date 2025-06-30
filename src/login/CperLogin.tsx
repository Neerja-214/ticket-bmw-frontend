import { useEffect, useReducer } from "react";
import { useState } from "react";
import { useQuery } from '@tanstack/react-query'

import { useNavigate } from "react-router";
import utilities, {
    GetResponseLnx,
    createGetApi,
    dataStr_ToArray,
    generateRandomAlphanumeric,
    postLinux,
    setCmpId,
    setUsrId,
} from "../utilities/utilities";
import { Alert } from "@mui/material";
import { Toaster } from '../components/reusable/Toaster';
import { setConfiguration } from '../utilities/cpcb';
import ministers from '../images/ministers.jpeg'
import { useDispatch } from "react-redux/es/hooks/useDispatch";
import { nrjAxiosRequestBio, nrjAxiosRequestLinux } from "../Hooks/useNrjAxios";
import WtrInput from "../components/reusable/nw/WtrInput";
import { Button, SvgIcon } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { getFldValue, useGetFldValue } from "../Hooks/useGetFldValue";
import { validForm } from "../Hooks/validForm";
import { useToaster } from "../components/reusable/ToasterContext";
import { Carousel, IconButton } from "@material-tailwind/react";
import SimpleImageSlider from "react-simple-image-slider";
import './login.css'
import { Password } from "@mui/icons-material";
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

function CperLogin() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [isPWMRDropdownOpen, setPWMRDropdownOpen] = useState(false);
    const [isAboutEPRDropdownOpen, setAboutEPRDropdownOpen] = useState(false);
    const [isSOPDropdownOpen, setSOPDropdownOpen] = useState(false);
    const [isDownloadLinkDropdownOpen, setDownLOadLinkDropdownOpen] = useState(false);
    const { showToaster, hideToaster } = useToaster();
    const [usrName, setusrName] = useState("");
    const [hcfLbl, setHcfLbl] = useState("");
    const [psw, setpsw] = useState("");
    const navigate = useNavigate();
    const [showMessage, setShowMessage] = useState<any>({ message: "" })
    const dispatchGolbal = useDispatch();
    const [captcha, setCaptcha] = useState("");
    const [captchaImage, setCaptchaImage] = useState("");
    const [selectedType, setSelectedType] = useState('CPCB');
    const [uuid, setUuid] = useState("");
    const [contactName, setContactName] = useState("")
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [description, setDescription] = useState('')
    const [contactCaptcha, setContactCaptcha] = useState("");
    const [contactCaptchaImage, setContactCaptchaImage] = useState("")
    const [uuid2, setUuid2] = useState('')
    const [mobile, setMobile] = useState('')
    const [showValidEmail, setShowValidEmail] = useState(false)

    const text = (url: any) => {
        return fetch(url).then(res => res.text());
    }
    const getGid = () => {
        let g: any = utilities(3, "", "");
        dispatch({ type: ACTIONS.GID, payload: g });
        return g;
    };

    useEffect(() => {
        inputLoginFieldClear()
    }, [selectedType])

    useEffect(() => {
        reloadCaptcha();
        reloadContactCaptcha()
        sessionStorage.clear();
        inputLoginFieldClear();
        inputContactFieldClear();

        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                console.log("my ip address is from ipfi: ", data.ip);
            })
            .catch(error => {
                console.error('Error fetching IP address:', error);
            });


        text('https://www.cloudflare.com/cdn-cgi/trace').then(data => {
            // let ipRegex = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/
            // let ip = data.match(ipRegex)[0];
            console.log('getting ip from cloudflare', data);
        });

    }, [0]);


    const inputLoginFieldClear = () => {
        setCaptcha('')

    }

    const inputContactFieldClear = () => {
        setContactName('')
        setMobile('')
        setEmail('')
        setSubject('')
        setDescription('')
        setContactCaptcha('')
    }

    const onChangeUsr = (event: any) => {
        setusrName(event.target.value);
    };

    const onChangeContactName = (event: any) => {
        setContactName(event.target.value)

    }

    const onChangeEmail = (event: any) => {
        const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
        if (event.target.value.match(isValidEmail)) {
            setShowValidEmail(true);
            setEmail(event.target.value)
        } else {
            setShowValidEmail(false);
        }

    }

    const onChangeMobile = (event: any) => {
        setMobile(event.target.value)

    }

    const onChangeSubjet = (event: any) => {
        setSubject(event.target.value)

    }

    const onChangeDecription = (event: any) => {
        setDescription(event.target.value)

    }


    const onChangePsw = (event: any) => {
        setpsw(event.target.value);
    };
    const onChangeCaptcha = (event: any) => {
        setCaptcha(event.target.value);
    };

    const onChangeContactCaptcha = (event: any) => {
        setContactCaptcha(event.target.value)
    }

    const handleTypeChange = (event: any) => {
        setSelectedType(event.target.value);
        setIsNotHcfSignup(true);
    };


    const loginEntity: any = {
        "CPCB": '1',
        "RD": '2',
        "SPCB": '3',
        "HCF": '4'
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
                dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
                if (res.data.status === 'Success') {
                  if (selectedType == 'HCF') {
                    navigate("/hcfDetails")
                    localStorage.setItem('hcflogindetails', JSON.stringify(res));
                    localStorage.setItem('hcfUserName', res.data.labelno)
                    let isloggedoutJson = {
                      by: generateRandomAlphanumeric(10),
                      usrnm: res.data.labelno,
                      ky: generateRandomAlphanumeric(10)
                    }
                    sessionStorage.setItem('isLoggedOut', btoa(JSON.stringify(isloggedoutJson)));
                    setCmpId(res.data.cmpid);
                  }
                } else {
                  showToaster([res.data.message], 'error');
                  reloadCaptcha();
                  setTimeout(function () {
                    dispatch({ type: ACTIONS.CHECK_REQ, payload: "" });
                  }, 1900);
                }
              }).catch((error: any) => {
                dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
              })
            } else if (selectedType === 'CBWTF') {
              let lgnlvl = '5'
              let payload: any = postLinux(usrName + "=" + psw + "=" + captcha + "=" + uuid + '=' + lgnlvl, 'cbwtf_login');
              nrjAxiosRequestBio("cbwtf_login", payload).then((res: any) => {
                dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
                
                if (res.data.status === 'Success') {
                  if (selectedType == 'CBWTF') {
                    
                    navigate("/cbwtfDtl")
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
                    showToaster([res.data.message], 'error');
                    reloadCaptcha();
                  setTimeout(function () {
                    dispatch({ type: ACTIONS.CHECK_REQ, payload: "" });
                  }, 1900);
                }
              }).catch((error: any) => {
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
                  showToaster(["Succesfully logged in"], 'success');
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
    
                    else {
                      setConfiguration(ary, dispatchGolbal);
                      if (selectedType == 'HCF') {
                        navigate("/hcfMaster")
                      }
                      else {
                        navigate("/dashboardvb");
                      }
                    }
                  } else {
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
                  setCaptcha("")
                  dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
                  showToaster([ary[0]["cpcbof"]], 'error');
                }
              }).catch((error: any) => {
                reloadCaptcha();
                setCaptcha("")
                dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
              })
            }
          } else {
            dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
            if (!captcha) {
              showToaster(["Please enter captcha value"], 'error');
    
            } else {
              showToaster(["Please enter password"], 'error');
            }
          }
        } else {
          setusrName('');
          setpsw('')
          dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
          showToaster(["Please enter username"], 'error');
        }
      };
    const saveContact = () => {
        if ((contactName && contactName.length > 0) && (email && email.length > 0) && (mobile && mobile.length > 0) && (subject && subject.length > 0) && (description && description.length > 0)) {
            if (contactCaptcha) {
                refetchContact()
            }
        }

    }
    const onSubmitContactDetails = async () => {
        let payload: any = postLinux(contactName + '=' + email + '=' + mobile + '=' + subject + '=' + description + '=' + contactCaptcha + '=' + uuid2, 'saveContactDetails');
        dispatch({ type: ACTIONS.DISABLEA, payload: 0 });
        return nrjAxiosRequestBio('contact_us', payload);

    }


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


    const toggleDwonloadLInkDropdown = () => {
        setDownLOadLinkDropdownOpen(!isDownloadLinkDropdownOpen);

    }



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

    const GetDataValue = (data: string, fld: string) => {
        let vl: string = useGetFldValue(data, fld);
        return vl;
    }

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };
    const searchHcfClick = () => {
        let api: string = state.textDts;
        let usrnm = getFldValue(api, 'hsp')

        let payload: any = postLinux(usrnm, 'hcf_signup');
        return nrjAxiosRequestBio("hcf_signup", payload);
    }

    const srchQry = (data: any) => {
        if (data.data.status === 'Success') {
            setDisableOtp(true);
            showToaster(["Please Enter Valid OTP send to your register email and mobile number.. "],
                'success')
        } else {
            showToaster([data.data.message],
                'error')
        }
    }

    const verifyOtpClick = () => {
        let api: string = state.textDts;
        let usrnm = getFldValue(api, 'hsp')
        let emlotp = getFldValue(api, 'emailOtp');
        let mobotp = getFldValue(api, 'mobileOtp')

        let payload: any = postLinux(usrnm + '=' + emlotp + '=' + mobotp, 'hcf_signup_otp');
        return nrjAxiosRequestBio("hcf_signup_otp  ", payload);
    }

    const vrfyQry = (data: any) => {
        if (data.data.status === 'Success') {
            setPswDisable(true);
        } else {
            showToaster([data.data.message],
                'error')
        }
    }

    const HandleSaveClick = () => {
        let api: string = state.textDts;
        let usrnm = getFldValue(api, 'hsp')
        let psw = getFldValue(api, 'psw');

        let payload: any = postLinux(usrnm + '=' + psw, 'hcf_setpsw');
        return nrjAxiosRequestBio("hcf_setpsw  ", payload);
    };

    const svdQry = (data: any) => {
        // refetchW();
        if (data.data.status === 'Success') {
            showToaster(["Password set successfully.. "],
                'success')
            setTimeout(() => {
                setIsNotHcfSignup(true)
            }, 3000)
        } else {
            showToaster([data.data.message],
                'error')
        }

    }

    const verifyClick = () => {
        let api: string = state.textDts;
        let msg: any = validForm(api, reqFlds2);
        showToaster(msg, 'error');
        if (msg && msg[0]) {
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
        showToaster(msg, 'error');
        if (msg && msg[0]) {
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
            msg.push("Passwords do not match!")
        }
        showToaster(msg, 'error');
        if (msg && msg[0]) {
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


    const onSubmitContactDetailSuccess = (data: any) => {
        if (data.data.status == "Success") {
            inputContactFieldClear()
            showToaster(["Contact details save successfully"], 'success')
        } else {
            dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
            showToaster([data.data.message], 'error')
            setContactCaptcha('')
        }
    }
    const { data: contact, refetch: refetchContact } = useQuery({
        queryKey: ['svQry'],
        queryFn: onSubmitContactDetails,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: onSubmitContactDetailSuccess,
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
            console.log(res)
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

    function reloadContactCaptcha() {
        let gid = getGid();
        let payload: any = postLinux(gid, 'getCaptcha')
        nrjAxiosRequestLinux('captcha', payload).then((res: any) => {
            console.log(res)
            let dt = GetResponseLnx(res);
            if (dt && dt.data && dt.data.image) {
                setContactCaptchaImage(dt.data.image)
                setUuid2(dt.data.uuid);
            }
            else {
                showToaster(["Failed to load captcha"], 'error')
            }
        })
    }


    function renderHeader() {
        return (
            <header>
                <div className="mx-auto">
                    <div className="flex items-center pl-1">
                        <img
                            src="https://eprplastic.cpcb.gov.in/assets/images/header-images/left-header-image.png"
                            className="w-[120px] h-[69px] smallScreen"
                            alt="Left Header Image"
                        />
                        <div className="ml-5 text-sm sm:w-[350px] lg:text-base smallScreen">
                            <span className="sl:whitespace-nowrap">Ministry of Environment, Forest and Climate Change</span> Government of India
                        </div>

                        <div className="lg:w-6/12 md:w-5/12 sm:w-full xs:w-full text-center">
                            <div className="text-center">
                                <h3 className="font-bold whitespace-nowrap text-indigo-800">Central Pollution Control Board
                                </h3>
                            </div>
                        </div>
                        <div className="lg:w-2/12 md:w-2/12 sm:w-1/12 xs:w-1/12 pr-1 text-right smallScreen  midScreen grow">
                            <div className="flex justify-end">
                                <img
                                    src="https://eprplastic.cpcb.gov.in/assets/images/header-images/right-header-image.png"
                                    width="50"
                                    className="img"
                                    alt="Right Header Image"
                                />
                                <img
                                    src="https://eprplastic.cpcb.gov.in/assets/images/header-images/LifeLogo.jpeg"
                                    width="100"
                                    className="img mt-2"
                                    alt="Life Logo"
                                />
                            </div>
                        </div>
                    </div>
                    {rendernavbar()}
                </div>
            </header>
        )
    }


    function rendernavbar() {
        return (
            <div className="mx-auto flex gap-10 items-center text-base font-bold mt-1 py-1" style={{ background: '#086f1e' }}>
                <div className="flex items-center font-semibold text-white">
                    <div className="mx-4">
                        Home
                    </div>
                    <div className="mx-4">
                        About us
                    </div>
                    <div className="mx-4">
                        Contact us
                    </div>
                    <div className="mx-4 flex items-center relative" onMouseEnter={toggleDwonloadLInkDropdown} onMouseLeave={toggleDwonloadLInkDropdown} onClick={toggleDwonloadLInkDropdown}>
                        Download Links
                        <span className={"mx-1"}>
                            {isDownloadLinkDropdownOpen &&
                                <svg
                                    style={{ transform: 'rotate(180deg)' }}
                                    className="w-2.5 h-2.5"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 10 6"
                                >
                                    <path
                                        stroke="#fff"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 4 4 4-4"
                                    />
                                </svg>
                            }
                            {!isDownloadLinkDropdownOpen &&
                                <svg
                                    style={{ transform: 'rotate(180)' }}
                                    className="w-2.5 h-2.5"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 10 6"
                                >
                                    <path
                                        stroke="#fff"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 4 4 4-4"
                                    />
                                </svg>
                            }
                        </span>

                        {isDownloadLinkDropdownOpen && <div className="absolute top-[20px]" style={{ width: '200px' }}>
                            <div className="text-black mt-2 bg-slate-100 rounded-lg pt-2 px-4 border">
                                <ul>
                                    <li className="py-1 border-b hover:text-lg w-full"><a href="https://cpcb.nic.in/uploads/Projects/Bio-Medical-Waste/Guidelines_for_Bar_Code_System_for_HCFs_and_CBWTFs.pdf">Guidelines for Bar Code System</a></li>
                                </ul>
                            </div>
                        </div>}

                    </div>
                </div>
            </div>
        )
    }


    function renderLoginField() {
        return (
            <div className="flex md:px-12 lg:px-24">
                <div className="col-8 py-4 px-4 space-y-4 md:space-y-6 sm:p-8 bg-aliceblue w-full" style={{ width: '150%', padding: '20px', marginLeft: "-71px" }}> {/* Adjusted width and padding */}
                    <h1 className="text-center text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                        CBST-BMW : <span className="fw-normal text-blue-700"> {selectedType} </span>
                    </h1>

                    {isNotHcfSignup ? (
                        <>
                            <form className="space-y-4 md:space-y-6" action="#">
                                <div>
                                    <label
                                        htmlFor="usr"
                                        className="block mb-2 md:mb-0 md:mr-2 text-sm font-medium text-gray-900 dark:text-white inline-block" style={{ marginBottom: '20px' }}
                                    >
                                        Please enter Email Id and Password
                                    </label>
                                    <input
                                        type="text"
                                        onChange={onChangeUsr}
                                        value={usrName}
                                        name="email"
                                        id="email"
                                        onCopy={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        autoComplete="off"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder={selectedType == 'HCF' ? 'Label Number' : 'User Name'}
                                        required
                                        style={{ width: '135%', fontSize: '16px', padding: '10px' }}
                                    />
                                </div>

                                <div>

                                    <div className="flex items-center border rounded-lg" style={{ width: '135%', fontSize: '16px' }}>
                                        <input
                                            type={isPasswordVisible ? "text" : "password"}
                                            onChange={onChangePsw}
                                            name="password"
                                            id="password"
                                            value={psw}
                                            onCopy={(e) => e.preventDefault()}
                                            onPaste={(e) => e.preventDefault()}
                                            autoComplete="off"
                                            placeholder="Password"
                                            className="bg-white border-0 border-gray-300 text-gray-900 sm:text-sm rounded-l-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            required
                                        />
                                        <div className="bg-white rounded-r-lg py-[10px] px-2 border-gray-30 focus:ring-primary-600 focus:border-primary-6000 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onClick={togglePassword}>
                                            {isPasswordVisible ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-5 h-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-5 h-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="captcha"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Enter  Captcha
                                    </label>
                                    <div className="grid grid-cols-3 gap-x-3" style={{ width: "160%" }}>
                                        <div className="py-2">
                                            <input
                                                type={"text"}
                                                onChange={onChangeCaptcha}
                                                name="captcha"
                                                id="captcha"
                                                value={captcha}
                                                onCopy={(e) => e.preventDefault()}
                                                onPaste={(e) => e.preventDefault()}
                                                autoComplete="off"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-l-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <img src={captchaImage} alt="captcha image" style={{ height: "41px", width: "200px" }} />
                                            <svg onClick={reloadCaptcha} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" className="ml-1"><path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H352c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V80c0-17.7-14.3-32-32-32s-32 14.3-32 32v35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V432c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H160c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                {/* <div onClick={handleReCaptchaClick} style={{ marginTop: '40px' }}>
                    <ReCAPTCHA
                      key={reCaptchaKey}
                      sitekey="6Le1jnspAAAAAEez9peKOZhFV2XCY7tc8mSR3HQr"
                      onChange={handleVerify}
                    />
                  </div> */}
                                {(() => {
                                    if (state.errMsg) {
                                        return (
                                            <div className="col-md-12 mb-2">
                                                <Alert severity={"error"}>{state.errMsg}</Alert>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
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
                                        {selectedType === 'HCF' ? <button
                                            type="button"
                                            color="primary"
                                            disabled={!state.disableA}
                                            onClick={signUp}
                                            style={{ background: '#0369A1' }}
                                            className="btn text-white	mr-2 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                        >
                                            Sign Up
                                        </button> : <></>}

                                        <button
                                            type="button"
                                            disabled={!state.disableA}
                                            onClick={ChckLgn}
                                            className="btn text-white hover:bg-sky-700	 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                            style={{ background: '#513498' }}
                                        >
                                            Sign In
                                        </button>
                                    </div>
                                </div>

                            </form>
                        </>
                    ) : (
                        <>
                            <form className="space-y-4 md:space-y-6" action="#">
                                <>
                                    <div className="flex grid grid-cols-10 gap-x-8 gap-y-4">
                                        <div className="col-span-8">
                                            <WtrInput
                                                displayFormat="1"
                                                Label="label Number"
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
                                                speaker={"Enter HCF label Number"}
                                                upprCase={true}
                                                delayClose={1000}
                                                placement="right"
                                                ClssName=" bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            ></WtrInput>
                                        </div>
                                        <div className=" mt-8 col-span-2">
                                            <Button
                                                size="medium"
                                                style={{ backgroundColor: "#86c6d9" }}
                                                variant="contained"
                                                // color="success"
                                                disabled={false}
                                                // startIcon={<SaveIcon />}
                                                // className="btn text-white hover:bg-sky-700	 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                                onClick={searchClick}>
                                                Search
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex grid grid-cols-10 gap-x-8 gap-y-4">
                                            <div className="col-span-4">
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
                                    </div>
                                    <div>
                                        {pswDisable ? <>
                                            <div>
                                                <WtrInput
                                                    displayFormat="1"
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
                                                    ClssName=""
                                                ></WtrInput>
                                                <WtrInput
                                                    displayFormat="1"
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
                                            </div>
                                        </> : <></>}

                                    </div>
                                </>

                                {/* <div onClick={handleReCaptchaClick} style={{ marginTop: '40px' }}>
                    <ReCAPTCHA
                      key={reCaptchaKey}
                      sitekey="6Le1jnspAAAAAEez9peKOZhFV2XCY7tc8mSR3HQr"
                      onChange={handleVerify}
                    />
                  </div> */}
                                {/* {(() => {
                      if (state.errMsg) {
                        return (
                          <div className="col-md-12 mb-2">
                            <Alert severity={"error"}>{state.errMsg}</Alert>
                          </div>
                        );
                      }
                      return null;
                    })()} */}
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
                                        {selectedType === 'HCF' && isNotHcfSignup ? <button
                                            type="button"
                                            color="primary"
                                            disabled={!state.disableA}
                                            onClick={signUp}
                                            style={{ background: '#513498' }}
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
                                                style={{ background: '#513498' }}
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

                        </>
                    )}
                </div>
            </div >



        )
    }

    function renderContactUsDetails() {
        return (
            <div className="flex md:px-12 lg:px-24">
                <div className="col-8 py-4 px-4 space-y-4 md:space-y-6 sm:p-8 bg-aliceblue w-full">
                    <form className="space-y-5 md:space-y-6" action="#">
                        <>
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Name <span style={{ color: "red" }}>*</span>

                                </label>
                                <input
                                    type="text"
                                    onChange={onChangeContactName}
                                    name="name"
                                    id="name"
                                    value={contactName}
                                    onCopy={(e) => e.preventDefault()}
                                    onPaste={(e) => e.preventDefault()}
                                    autoComplete="off"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder='Enter Name'
                                    required
                                />
                            </div>

                            <div className="flex space-x-4"> {/* Flex container for email and mobile */}
                                <div style={{ flex: 1 }}>
                                    <label
                                        htmlFor="email"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Email <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <input
                                        type="email"
                                        onChange={onChangeEmail}
                                        name="email"
                                        id="email"
                                        value={email}
                                        onCopy={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        autoComplete="off"
                                        placeholder="Enter Email"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        required
                                    />
                                    {!showValidEmail && <span style={{ color: "red" }}>Please Enter Valid Email Id</span>}
                                </div>


                                <div style={{ flex: 1 }}>
                                    <label
                                        htmlFor="mobile"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Mobile <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        onChange={onChangeMobile}
                                        name="mobile"
                                        id="mobile"
                                        value={mobile}
                                        onCopy={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        autoComplete="off"
                                        placeholder="Enter Mobile Number"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        required
                                        max={10}
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="subject"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Subject <span style={{ color: "red" }}>*</span>
                                </label>
                                <div className="flex items-center border rounded-lg">
                                    <input
                                        type="text"
                                        onChange={onChangeSubjet}
                                        name="subject"
                                        id="subject"
                                        value={subject}
                                        onCopy={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        autoComplete="off"
                                        placeholder="Enter Subject"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        required
                                    />

                                </div>

                            </div>
                            <div>
                                <label
                                    htmlFor="description"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Description <span style={{ color: "red" }}>*</span>
                                </label>
                                <div className="flex items-center border rounded-lg">
                                    <input
                                        type="text"
                                        onChange={onChangeDecription}
                                        name="description"
                                        id="description"
                                        value={description}
                                        onCopy={(e) => e.preventDefault()}
                                        onPaste={(e) => e.preventDefault()}
                                        autoComplete="off"
                                        placeholder="Enter Description"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        required
                                    />
                                </div>

                            </div>
                            <div>
                                <label
                                    htmlFor="captcha"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                    Captcha
                                </label>
                                <div className="grid grid-cols-2 gap-x-3">
                                    <div className="py-2">
                                        <input
                                            type={"text"}
                                            onChange={onChangeContactCaptcha}
                                            name="captchaContact"
                                            id="captchaContact"
                                            value={contactCaptcha}
                                            onCopy={(e) => e.preventDefault()}
                                            onPaste={(e) => e.preventDefault()}
                                            autoComplete="off"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-l-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <img src={contactCaptchaImage} alt="contact captcha image" style={{ height: "40px", width: "200px" }} />
                                        <svg onClick={reloadContactCaptcha} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" className="ml-1"><path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H352c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V80c0-17.7-14.3-32-32-32s-32 14.3-32 32v35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V432c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H160c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex my-4 justify-between items-center">
                                <div>
                                    <button
                                        type="button"
                                        disabled={!state.disableA}
                                        onClick={saveContact}
                                        className="btn text-white hover:bg-sky-700	 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                                        style={{ background: '#51B7F8' }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </>
                    </form>
                </div>
            </div>

        )
    }

    function renderImage() {
        return (
            <div className="col-md-3 desktop p-3 centerlogo">
                <div className="circleimg" style={{ backgroundImage: "url('https://images.squarespace-cdn.com/content/v1/5bac99efb2cf79a76d80781d/07720c6a-8d15-4c71-9a75-479b8c3fcaee/Biomedical+Waste.png') " }}>
                </div>
            </div>
        )
    }


    function renderLoginTypeSelect() {
        return (
            <main className="flex-grow bg-gray-50">
                <div className="grid grid-cols-3 gap-3 flex justify-center border-2 ">
                    <div className="vertical-line">
                        <div className="flex justify-center border-2 font-semibold rounded-lg my-2 pt-2 pb-1">
                            <div className="md:mx-1 lg:mx-8">
                                <label className="text-[16px] fw-bold">
                                    <input className="mr-1" type="radio" name="option" value="CPCB" checked={selectedType === 'CPCB'}
                                        onChange={handleTypeChange} />
                                    CPCB
                                </label>
                            </div>
                            <div className="md:mx-1 lg:mx-8">
                                <label className="text-[16px] fw-bold">
                                    <input className="mr-1" type="radio" name="option" value="RD" checked={selectedType === 'RD'}
                                        onChange={handleTypeChange} />
                                    RD
                                </label>
                            </div><div className="md:mx-1 lg:mx-8">
                                <label className="text-[16px] fw-bold">
                                    <input className="mr-1" type="radio" name="option" value="SPCB" checked={selectedType === 'SPCB'}
                                        onChange={handleTypeChange} />
                                    SPCB
                                </label>
                            </div>

                            <div className="md:mx-1 lg:mx-8">
                                <label className="text-[16px] fw-bold">
                                    <input className="mr-1" type="radio" name="option" value="HCF" checked={selectedType === 'HCF'}
                                        onChange={handleTypeChange} />
                                    HCF
                                </label>
                            </div>
                            <div className="md:mx-1 lg:mx-8">
                                <label className="text-[16px] fw-bold">
                                    <input className="mr-1" type="radio" name="option" value="HCF" checked={selectedType === 'CBWTF'}
                                        onChange={handleTypeChange} />
                                    CBWTF
                                </label>
                            </div>
                        </div>
                        {renderLoginField()}
                    </div>
                    {renderImage()}
                    {renderImageBoxSlide()}

                </div>
            </main>

        )

    }


    function renderParagraph() {
        return (
            <div className="grey back border-2">
                <div className=" text-center py-5  h-150">
                    <h5 className=" text-center py-10 text-green-900 text-decoration" > EPR Portal for Plastic Packaging </h5>
                    <p className="text-left justify-center mx-auto pl-10" style={{ textAlign: 'justify', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '2.5rem', paddingRight: '2.5rem'}}>
                        Extended Producers Responsibility (EPR) regime is under implementation in Plastic Waste management Rules, 2016, according to which it is the responsibility of Producers, Importers and Brand-owners to ensure processing of their plastic packaging waste through recycling, re-use or end of life disposal (such asco-processing/Waste-to-energy/Plasticto-oil/roadmaking/industrial-composting).In order to streamline implementation process of EPR, the Ministry of Environment, Forest and Climate Change, Government of India, in its fourth Amendment to the Plastic Waste management Rules, dated February 16, 2022, notified ‘Guidelines on Extended Producer Responsibility for Plastic Packaging’ in the Schedule II of the Rules. As per these guidelines, Producers, Importers and Brand Owners (PIBOs) shall have to register through the online centralized portal developed by the Central Pollution Control Board (CPCB). Accordingly, this portal has been developed to register PIBOs who are operating in more than two States with CPCB and those operating in one or two States/UTs shall be registered with the concerned State Pollution Control Boards (SPCBs). PWPs shall also have to register with the concerned SPCB/PCC in accordance with the provisions of the Section 13(3) of the Plastic Waste management Rules, 2016 on this centralized portal developed by CPCB. The EPR Portal for Plastic Packaging provides provision for registration of PIBOs/ PWPS in accordance with the notified EPR Guidelines. The portal will help in improving accountability, traceability and transparency of fulfilment of EPR Obligations. The portal is planned to have seven modules, which allows registration of PWPs and PIBOs, issue certificates by PWPs & exchange of credits, allows real-time monitoring of transactions between PIBOs and PWPs, allows levy of environmental compensation and provides system generated reports and facilitates filing of annual returns for the stakeholders. Presently three modules of EPR portal “Registration of PIBOs”, “Registration of PWPs” and “Generation & Transfer of EPR Certificates” are operational. The remaining modules shall be integrated shortly.
                    </p>
                </div>
            </div>
        )
    }


    function renderImageBoxSlide() {

        const images = [
            { url: 'https://www.upsidecloudtechnologies.com/wastemanagement/images/bmw7.png' },
            { url: 'https://www.anmolhealthcare.org/images/Capture1.PNG' },
            { url: 'https://image.slidesharecdn.com/bio-medicalwastemanagement-230924112229-6caf7bc6/85/Bio-Medical-Waste-management-pptx-22-320.jpg' }
        ];

        return (

            <div className="col-md-3 desktop p-3">
                <SimpleImageSlider
                    width={480} // Adjust the width as needed
                    height={500} // Adjust the height as needed
                    images={images}
                    showBullets={true}
                    showNavs={true}
                    loop={true}
                    autoPlay={true}
                    autoPlayDelay={2} // Change autoPlayDelay to autoPlayInterval
                    startIndex={0} // Start from the first image
                    useGPURender={true}
                    navStyle={1}
                    navSize={50}
                    navMargin={20}
                    slideDuration={0.5}
                />
            </div>


        );
    }

    function renderNotfication() {
        return (
            <div className="col-md-12 px-0 mx-0 my-2 bg-green-800 text-white py-2 px-10 md:px-0" style={{ textAlign: "center", maxWidth: "100vw" }}>
                <h5 style={{ margin: "4px 0" }}></h5>
            </div>

        )

    }

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
        setIsHovered(true);
    };

    const handleMouseOut = () => {
        setIsHovered(false);
    };

    function renderSlidLine() {
        return (
            <div className="col-md-10 px-0 mx-0 my-2 bg-green-800 text-white">
                <div className="marquee-container">
                    <div
                        className={`marquee ${isHovered ? 'paused' : ''}`}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    >
                        <p className="marquee-content">
                           {/* Enter marque line */}
                          </p>
                    </div>
                </div>
            </div>


        )
    }


    function renderFooter() {

        const footerLogo = ['https://eprplastic.cpcb.gov.in/assets/images/footer-images/swachh-bharat1.png', 'https://eprplastic.cpcb.gov.in/assets/images/footer-images/digital-india-logo.png', 'https://eprplastic.cpcb.gov.in/assets/images/footer-images/data-gov-logo.png', 'https://eprplastic.cpcb.gov.in/assets/images/footer-images/data-gov-logo.png', 'https://eprplastic.cpcb.gov.in/assets/images/footer-images/mygov-footer-logo.png', 'https://eprplastic.cpcb.gov.in/assets/images/footer-images/Meity_logo.png', 'https://eprplastic.cpcb.gov.in/assets/images/footer-images/pm-india-logo.png', 'https://eprplastic.cpcb.gov.in/assets/images/footer-images/nic.jpg']
        return (
            <footer className="footer_main">
                <div className="col-12 m-0">
                    <div className="row bg-black pb-4">
                        <div className="col-md-12 pt-4 flex flex-wrap justify-center">
                            {footerLogo.map((image, index) => (
                                <div key={index} className="mx-14 my-6">
                                    <a href="https://swachhbharat.mygov.in/" target="_blank">
                                        <img src={image} alt="" className="max-h-5 w-auto mx-auto" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-md-12 pt-2 flex justify-between bg-black">

                    <div className="col-md-3 pt-3 flex flex-wrap justify-center">
                        <label className=" mx-3 my-6 text-white text-[16px] ">Help desk details:</label>
                    </div>

                    <div className="col-md-3  flex flex-wrap justify-center">
                        <ul className="mx-3 my-6" style={{ paddingLeft: '0px' }}>
                            <li className="text-white text-[16px] ">Contact us: <img height="20px" src="" /></li>
                        </ul>
                    </div>


                    <div className="col-md-4  flex flex-wrap justify-center">
                        <ul className="mx-4 my-6" style={{ paddingLeft: '0px' }}>
                            <li className="text-white text-[16px] ">Phone: <img src="" /></li>
                        </ul>
                    </div>


                    <div className="col-md-3 flex flex-wrap justify-center">
                        <ul className="mx-3 my-6" style={{ paddingLeft: '0px' }}>
                            <li className="text-white text-[16px] ">Useful Links: <a href="https://cpcb.nic.in/" target="_blank" className="text_underline text-white">www.cpcb.nic.in</a></li>
                        </ul>
                    </div>
                </div>
                <div className="col-12 m-0">
                    <div className="row bg-gray-800">

                        <p className="w-full px-3 mb-0 text-white text-center text-base py-4">
                            Copyright © 2024 - CPCB. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        )
    }



    function renderABoutAndContact() {
        return (
            <section className="contact-us bg-cover h-150 pt-4"  style={{ backgroundImage: `url(${require("../app/assests/loginimage.jpeg")})`, paddingBottom:'10px'  }}>
                <div className="container mx-auto h-100">
                    <div className="flex flex-wrap">
                        <div className="w-full md:w-1/2 px-4 md:pl-16 md:pr-16 mt-6 md:mt-0">
                            <div className="contact text-center md:text-justify">
                                <h5 className=" text-center text-3xl font-bold mb-4">About CPCB</h5>
                                <p className="text-lg text-gray-700 mb-4">
                                    The Central Pollution Control Board (CPCB), statutory organisation, was constituted in September, 1974 under the Water (Prevention and Control of Pollution) Act, 1974. Further, CPCB was entrusted with the powers and functions under the Air (Prevention and Control of Pollution) Act, 1981.
                                </p>
                                <div className="text-center">
                                    <a href="https://cpcb.nic.in/index.php" target="_blank" rel="noopener noreferrer" className="btn bg-green-600 text-white px-4 py-2 rounded-full inline-block hover:bg-green-700 transition duration-300">
                                        Learn More
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 px-4 md:pr-16 mt-6 md:mt-0">
                            <div id="contactform">
                                <h5 className="text-center text-3xl font-bold mb-4">Contact Us</h5>
                                {/* Add form submission success message or error handling here */}
                                {renderContactUsDetails()}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }




    return (
        <div className="flex flex-col min-h-screen bg-white w-full">
            {renderHeader()}
            {renderLoginTypeSelect()}
            {renderNotfication()}
            {renderSlidLine()}
            {/* {renderParagraph()} */}
            {renderABoutAndContact()}
            {renderFooter()}
        </div>

    );
}

export default CperLogin;

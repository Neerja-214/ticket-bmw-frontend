import React, { useReducer, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseWnds, capitalizeTerms, convertFldValuesToJson, createGetApi, dataStr_ToArray, getCmpId, getUsrId, postLinux, postLnxSrvr, svLnxSrvr, tellWndsServer, tellWndsServer2 } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";

import { nrjAxios, nrjAxiosRequest, nrjAxiosRequestBio, nrjAxiosRequestLinux, useNrjAxios } from '../../Hooks/useNrjAxios';
import { Navigate, useNavigate } from "react-router-dom";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import WtrInput from '../../components/reusable/nw/WtrInput';
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect';
import { validForm } from '../../Hooks/validForm';
import { Toaster } from '../../components/reusable/Toaster';
import NrjRsDt from '../../components/reusable/NrjRsDt';
import SaveIcon from "@mui/icons-material/Save";
import { useEffectOnce } from 'react-use';
import { useToaster } from '../../components/reusable/ToasterContext';


const ACTIONS = {
    TRIGGER_GRID: "grdtrigger",
    NEWROWDATA: "newrow",
    RANDOM: "rndm",
    TRIGGER_FORM: "trgfrm",
    FORM_DATA: "frmdata",
    SETFORM_DATA: "setfrmdata",
    MAINID: "mnid",
    CHECK_REQ: "chckreq",
    CHECK_REQDONE: "chckreqdn",
    SETGID: "gd",
    NEWFRMDATA: "frmdatanw",
    DISABLE: 'disable'
};

const initialState = {
    triggerG: 0,
    nwRow: [],
    rndm: 0,
    trigger: 0,
    textDts: "",
    mainId: 0,
    errMsg: [],
    openDrwr: false,
    frmData: "",
    gid: "",
};

type purBill = {
    triggerG: number;
    nwRow: any;
    rndm: number;
    trigger: number;
    textDts: string;
    mainId: number;
    errMsg: any;
    openDrwr: boolean;
    frmData: string;
    gid: string;
};

type act = {
    type: string;
    payload: any;
};

const reducer = (state: purBill, action: act) => {
    let newstate: any = { ...state };
    switch (action.type) {
        case ACTIONS.NEWFRMDATA:
            newstate.textDts = action.payload;
            return newstate;
        case ACTIONS.MAINID:
            newstate.mainId = action.payload;
            newstate.gid = "";
            newstate.rndm += 1;
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
            newstate.triggerG = 1;
            return newstate;
        case ACTIONS.RANDOM:
            newstate.rndm += 1;
            return newstate;
        case ACTIONS.FORM_DATA:
            let dta: string = "";
            let fldN: any = utilities(2, action.payload, "");
            if (newstate.textDts) {
                dta = newstate.textDts + "=";
                let d: any = utilities(1, dta, fldN);
                if (d) {
                    dta = d;
                } else {
                    dta = "";
                }
            }
            dta += action.payload;
            newstate.textDts = dta;
            newstate.frmData = dta;
            return newstate;
        case ACTIONS.SETFORM_DATA:
            newstate.frmData = action.payload;
            newstate.textDts = action.payload;
            return newstate;
        case ACTIONS.CHECK_REQ:
            newstate.errMsg = action.payload;
            newstate.openDrwr = true;
            return newstate;
        case ACTIONS.CHECK_REQDONE:
            newstate.errMsg = [];
            newstate.openDrwr = false;
            return newstate;
        case ACTIONS.SETGID:
            newstate.gid = action.payload;
            return newstate;
        case ACTIONS.DISABLE:
            if (action.payload == 1) {
                if (newstate.disableA == 1) {
                    newstate.disableA = 0
                } else {
                    newstate.disableA = 1
                }
                return newstate
            } else if (action.payload == 2) {
                if (newstate.disableB == 1) {
                    newstate.disableB = 0
                } else {
                    newstate.disableB = 1
                }
                return newstate
            }
    }
};


const HcfSignup = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [gid, setGid] = useState('')
    const [pswDisable, setPswDisable] = useState(false)
    const [disableOtp, setDisableOtp] = useState(false)
    const [signuptoken, setSignUpToken] = useState<string>("");
    const [signuptokenverify, setSignUpTokenVerify] = useState<string>("");

    const [showMessage, setShowMessage] = useState<any>({ message: [] })
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
    const getGid = () => {
        let g: any = utilities(3, "", "");
        dispatch({ type: ACTIONS.SETGID, payload: g });
        return g;
    };

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };
    const searchHcfClick = () => {
        let api: string = state.textDts;
        let gd: string = getGid();
        setGid(gd);
        let usrnm = getFldValue(api, 'hsp')

        let payload: any = postLinux(usrnm, 'hcf_signup');
        return nrjAxiosRequestBio("hcf_signup", payload);
    }

    const srchQry = (data: any) => {
        if (data.data.status === 'Success') {
            if (data.data.signup_token) {
                setSignUpToken(data.data.signup_token)
            }
            setDisableOtp(true);
            setShowMessage({
                message: ["Please Enter Valid OTP send to your register email and mobile number.. "],
                type: "success",
            });
        } else {
            setShowMessage({
                message: [data.data.message],
                type: "error",
            });
        }
    }

    const verifyOtpClick = () => {
        let api: string = state.textDts;
        let gd: string = getGid();
        setGid(gd);
        let usrnm = getFldValue(api, 'hsp')
        let emlotp = getFldValue(api, 'emailOtp');
        let mobotp = getFldValue(api, 'mobileOtp');
        let sing_up_token = signuptoken;
        let payload: any = postLinux(usrnm + '=' + emlotp + '=' + mobotp + "=" + signuptoken, 'hcf_signup_otp');
        return nrjAxiosRequestBio("hcf_signup_otp", payload);
    }

    const vrfyQry = (data: any) => {
        if (data.data.status === 'Success') {
            if (data.data.signup_otpverified_token) {
                setSignUpTokenVerify(data.data.signup_otpverified_token)
            }
            setPswDisable(true);
        } else {
            setShowMessage({
                message: [data.data.message],
                type: "error",
            });
        }
    }

    const HandleSaveClick = () => {
        let api: string = state.textDts;
        let gd: string = getGid();
        setGid(gd);

        let usrnm = getFldValue(api, 'hsp')
        let psw = getFldValue(api, 'psw');
        let sign_up_tokenVerify = signuptokenverify

        let payload: any = postLinux(usrnm + '=' + psw + '=' + sign_up_tokenVerify, 'hcf_setpsw');
        return nrjAxiosRequestBio("hcf_setpsw  ", payload);
    };

    const svdQry = (data: any) => {
        // refetchW();
        if (data.data.status === 'Success') {
            setShowMessage({
                message: ["Password set successfully.. "],
                type: "success",
            });
            setTimeout(() => {
                navigate("/login")
            }, 3000)
        } else {
            setShowMessage({
                message: [data.data.message],
                type: "error",
            });
        }

    }
    const { showToaster, hideToaster } = useToaster();
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
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
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
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
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
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
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


    const navigate = useNavigate();

    const navigateToAr = () => {
        navigate('/hcfAr');
    }


    const logout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login")
    }


    const Seperator = (props: any) => {


        return (
            <>
                <div className="mt-7">
                    <div className="font-semibold" style={{ color: '#3657ac' }}>
                        {/* <div className="font-semibold" style={{ color: '#009ED6' }}> */}
                        {capitalizeTerms(props.heading)}
                    </div>
                    <div className="mt-2" style={{ border: '1px solid #86c6d9' }}>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className='px-3'>
            <div className="rounded" style={{ boxShadow: '0px 0px 20px 0px #00000029' }}>
                <div className="p-7 rounded text-black" style={{ background: 'linear-gradient(90.29deg, #86c6d9 0%, #aed6e0 100%)' }}>
                    <div className="text-2xl font-bold">Health Care Facility</div>
                    <div className="">please provide the requested information below</div>
                </div>
                <div className="mx-7">
                    <Seperator heading="HCF Detail"></Seperator>
                    <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                        <WtrInput
                            displayFormat="1"
                            Label="User Name"
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
                            speaker={"Enter Name of HCF"}
                            upprCase={true}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                        ></WtrInput>
                        <div className='mt-8'>
                            <Button
                                size="medium"
                                style={{ backgroundColor: "#86c6d9", textTransform: "none" }}
                                variant="contained"
                                color="success"
                                disabled={false}
                                startIcon={<SaveIcon />}
                                onClick={searchClick}>
                                Search username
                            </Button>
                        </div>
                    </div>
                    {disableOtp ? <>
                        <Seperator heading="OTP"></Seperator>
                        <div className=" mt-4 grid grid-cols-3 gap-x-8 gap-y-4">
                            <WtrInput
                                displayFormat="1"
                                Label="Email Otp"
                                fldName="emailOtp"
                                idText="txtemailOtp"
                                onChange={onChangeDts}
                                dsabld={false}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="6[length]"
                                allowNumber={true}
                                unblockSpecialChars={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                speaker={"Enter Email Otp"}
                                upprCase={true}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                            ></WtrInput>
                            <WtrInput
                                displayFormat="1"
                                Label="Mobile Otp"
                                fldName="mobileOtp"
                                idText="txtmobileOtp"
                                onChange={onChangeDts}
                                dsabld={false}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="6[length]"
                                allowNumber={true}
                                unblockSpecialChars={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                speaker={"Enter Mobile Otp"}
                                upprCase={true}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                            ></WtrInput>
                            <div className='mt-8'>
                                <Button
                                    size="medium"
                                    style={{ backgroundColor: "#86c6d9", textTransform: "none"}}
                                    variant="contained"
                                    color="success"
                                    disabled={false}
                                    startIcon={<SaveIcon />}
                                    onClick={verifyClick}>
                                    Verify OTP
                                </Button>
                            </div>
                        </div>
                    </> : <></>}

                    {pswDisable ? <>
                        <Seperator heading="Additional Detail"></Seperator>

                        <div className=" mt-4 grid grid-cols-3 gap-x-8 gap-y-4">
                            <WtrInput
                                displayFormat="1"
                                Label="Password"
                                fldName="psw"
                                idText="txtpsw"
                                inputType="password"
                                onChange={onChangeDts}
                                dsabld={false}
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
                                dsabld={false}
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
                            <div className='mt-8'>
                                <Button
                                    size="medium"
                                    style={{ backgroundColor: "#86c6d9", textTransform: "none" }}
                                    variant="contained"
                                    color="success"
                                    disabled={false}
                                    startIcon={<SaveIcon />}
                                    onClick={saveClick}>
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </> : <></>}


                    {showMessage && showMessage.message.length != 0 ? <div className="mt-2">
                        <Toaster data={showMessage} className={''}></Toaster>
                    </div> : <></>}
                </div>
            </div>


        </div>


    );
}; export default React.memo(HcfSignup);
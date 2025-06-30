import React, { useEffect, useReducer, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseWnds, capitalizeTerms, convertFldValuesToJson, convertFldValuesToString, createGetApi, dataStr_ToArray, getCmpId, getUsrId, postLnxSrvr, svLnxSrvr, tellWndsServer, tellWndsServer2 } from '../../utilities/utilities'
import { Button, SvgIcon } from "@mui/material";

import { nrjAxios, nrjAxiosRequest, useNrjAxios } from '../../Hooks/useNrjAxios';
import { Navigate, useNavigate } from "react-router-dom";
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";
import WtrInput from '../../components/reusable/nw/WtrInput';
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect';
import { validForm } from '../../Hooks/validForm';
import { Toaster } from '../../components/reusable/Toaster';
import NrjRsDt from '../../components/reusable/NrjRsDt';
import SaveIcon from "@mui/icons-material/Save";
import { useEffectOnce } from 'react-use';
import HcfHeader from '../hcf/HcfHeader';
import { useToaster } from '../../components/reusable/ToasterContext';
import CbwtfHeader from './CbwtfHeader';


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


const CbwtfDetails = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const onChangeDts = (data: string) => {
        dispatch({ type: ACTIONS.FORM_DATA, payload: data });
    };

    const [cbwtfLoginDetails, setCbwtfLoginDetails] = useState<any>()

    useEffectOnce(() => {
        refetchHcfData();
    })

    const GetData = () => {

        let userLoginDetails: any = localStorage.getItem('Cbwtflogindetails')
        setCbwtfLoginDetails(userLoginDetails);
        return JSON.parse(userLoginDetails)
    };

    const ShowDataDetails = (data: any) => {

        if (data && data.data && data.data["status"]) {
            // let dt: string = data.data
            let dt: string = convertFldValuesToString(data.data);

            dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt })
            //setFrmData(dt);
        }
    };
    const { data: datab, refetch: refetchHcfData } = useQuery({
        queryKey: ["getQry", cbwtfLoginDetails],
        queryFn: GetData,
        enabled: false,
        // staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowDataDetails,
    });

    const clrFunct = () => {
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 1 });
        setTimeout(() => {
            dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
        }, 300)
    }


    const navigate = useNavigate();

    const navigateToAr = () => {
        navigate('/hcfArAll');
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
        <>
            <div className='overflow-y-auto h-screen bg-white'>

                {/* <CbwtfHeader></CbwtfHeader> */}
                <div className='px-3 pb-10 '>

                    {/* {hcfLoginId ? <div className='flex py-4 justify-end'>

                <div className='mr-4'>
                    <Button
                        size="medium"
                        variant="outlined"
                        color="primary"
                        disabled={false}
                        onClick={navigateToAr}>
                        Go to Annual Report
                    </Button>
                </div>
                <div className='mr-4'>
                    <Button
                        size="medium"
                        style={{ backgroundColor: "#86c6d9" }}
                        variant="contained"
                        color="success"
                        disabled={false}
                        onClick={logout}>
                        Logout
                    </Button>
                </div>

            </div> : <></>} */}
                    <div className="rounded" >
                        {/* <div className="p-7 rounded text-black" style={{ background: 'linear-gradient(90.29deg, #86c6d9 0%, #aed6e0 100%)' }}>
                    <div className="text-2xl font-bold">Health Care Facility</div>
                    <div className="">please provide the requested information below</div>
                </div> */}
                        <div className="mx-7">
                            <Seperator heading="Cbwtf details"></Seperator>
                            <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                                <WtrInput
                                    displayFormat="1"
                                    Label="CBWTF"
                                    fldName="cbwtfnm"
                                    idText="txtcbwtfnm"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="5[length]"
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    // speaker={"Enter Name of HCF"}

                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>

                                <WtrInput displayFormat='1' Label='User name' fldName='usrnm' idText='txtusrnm' onChange={onChangeDts} dsabld={true} callFnFocus='' dsbKey={false} upprCase={false} validateFn='[label]' allowNumber={false} selectedValue={state.frmData} clrFnct={state.trigger}
                                    //  speaker={'Enter Label No'}
                                    delayClose={1000} placement='left' ClssName='' ></WtrInput>

                                <WtrInput
                                    displayFormat="1"
                                    Label="Latitude"
                                    fldName="fctlgt"
                                    idText="txtfctlgt"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="5[length]"
                                    maxLength={5}
                                    allowNumber={true}
                                    // speaker={"Enter SPCB Code"}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                ></WtrInput>

                                <WtrInput
                                    displayFormat="1"
                                    Label="Longitude"
                                    fldName="fctltt"
                                    idText="txtfctltt"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    // validateFn="5[length]"
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    // speaker={"Enter Name of CBWTF"}

                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>

                                {/* <WtrRsSelect
                            displayFormat="1"
                            Label="HCF Type"
                            fldName="hcftyp"
                            idText="txthcftyp"
                            onChange={onChangeDts}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            allwZero={"1"}
                            fnctCall={false}
                            dbCon={"shrtrm"}
                            typr={"633"}
                            dllName={""}
                            fnctName={""}
                            parms={""}
                            speaker={"Select Type of HCF"}
                            allwSrch={true}
                        ></WtrRsSelect> */}

                            </div>

                            <Seperator heading="Address details"></Seperator>

                            <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                                <WtrInput
                                    displayFormat="1"
                                    Label="Address I"
                                    fldName="addra"
                                    idText="txtaddra"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}

                                    validateFn="1[length]"
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                // speaker={"Enter Address"}

                                ></WtrInput>
                                <WtrInput
                                    displayFormat="1"
                                    Label="Address II"
                                    fldName="addrb"
                                    idText="txtaddrb"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}

                                    validateFn=""
                                    unblockSpecialChars={true}
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                ></WtrInput>
                                <WtrInput
                                    displayFormat="1"
                                    Label="Address III"
                                    fldName="addrc"
                                    idText="txtaddrc"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}

                                    validateFn=""
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                ></WtrInput>

                                {/* <WtrInput displayFormat='1' Label='District' fldName='dstr' idText='txtdstr' onChange={onChangeDts} dsabld={true} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={false} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput> */}

                                {/* <WtrInput displayFormat='1' Label='City' fldName='cty' idText='txtcty' onChange={onChangeDts} dsabld={true} callFnFocus='' dsbKey={false} upprCase={false} validateFn='' allowNumber={false} selectedValue={state.frmData} clrFnct={state.trigger} ></WtrInput> */}

                                {/* <WtrRsSelect
                            displayFormat="1"
                            Label="City"
                            fldName="cty"
                            idText="txtcty"
                            onChange={onChangeDts}
                            loadOnDemand={""}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            allwZero={"1"}
                            fnctCall={false}
                            dbCon={"shrtrm"}
                            typr={"790"}
                            dllName={""}
                            fnctName={""}
                            parms={""}
                            allwSrch={true}
                            speaker={"Select City"}
                        ></WtrRsSelect> */}

                                {/* <WtrRsSelect
                            displayFormat="1"
                            Label="State"
                            fldName="state"
                            idText="txtstate"
                            onChange={onChangeDts}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            allwZero={"1"}
                            fnctCall={false}
                            dbCon={"shrtrm"}
                            typr={"880"}
                            dllName={""}
                            fnctName={""}
                            parms={""}
                            allwSrch={true}
                            speaker={"Select the State"}
                            delayClose={1000}
                        ></WtrRsSelect> */}
                                <WtrInput
                                    displayFormat="1"
                                    Label="City"
                                    fldName="cty"
                                    idText="txtcty"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    maxLength={6}
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    ClssName=""
                                // speaker={"Select City"}

                                ></WtrInput>
                                <WtrInput
                                    displayFormat="1"
                                    Label="District"
                                    fldName="dist"
                                    idText="txtdist"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    maxLength={6}
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    ClssName=""
                                // speaker={"Select City"}

                                ></WtrInput>
                                <WtrInput
                                    displayFormat="1"
                                    Label="State/UT"
                                    fldName="state"
                                    idText="txtstate"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    ClssName=""
                                // speaker={"Select the State"}

                                ></WtrInput>
                                {/* <WtrInput
                                    displayFormat="1"
                                    Label="Rigional Directory"
                                    fldName="rgd"
                                    idText="txtrgd"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    ClssName=""
                                // speaker={"Select the State"}

                                ></WtrInput> */}
                                <WtrInput
                                    displayFormat="1"
                                    Label="Pincode"
                                    fldName="pnc"
                                    idText="txtpnc"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    maxLength={6}
                                    validateFn="[pincode]"
                                    allowNumber={true}
                                    // ToolTip="Enter numbers only"
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    ClssName=""
                                // speaker={"Enter Pin Code"}

                                ></WtrInput>

                            </div>

                            <Seperator heading="Additional details"></Seperator>

                            <div className=" mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                                <WtrInput
                                    displayFormat="1"
                                    Label="Contact person"
                                    ToolTip="Enter contact person name without special charecters"
                                    fldName="contprnm"
                                    idText="txtcontprnm"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}

                                    validateFn="6[length]"
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    // speaker={"Enter Name of Contact person"}

                                    delayClose={1000}
                                    placement="right"
                                    blockNumbers={true}
                                    ClssName=""
                                ></WtrInput>

                                <WtrInput
                                    displayFormat="1"
                                    Label="Mobile number of contact person"
                                    fldName="mob"
                                    idText="txtmob"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}

                                    validateFn="[mob]"
                                    allowNumber={true}
                                    // ToolTip="Enter numbers only"
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    // speaker={"Enter Mobile Number"}

                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>
                                {/* <WtrRsSelect
                            displayFormat="1"
                            Label="Entity"
                            fldName="pplid"
                            idText="txtpplid"
                            onChange={onChangeDts}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            allwZero={"1"}
                            fnctCall={false}
                            dbCon={"shrtrm"}
                            typr={"589"}
                            dllName={""}
                            fnctName={""}
                            parms={""}
                            allwSrch={true}
                            speaker={""}
                            delayClose={1000}
                        ></WtrRsSelect> */}
                                <WtrInput
                                    displayFormat="1"
                                    Label="Phone number of CBWTF"
                                    fldName="phn"
                                    idText="txtphn"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="[mob]"
                                    allowNumber={true}
                                    // ToolTip="Enter numbers only"
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    // speaker={"Enter Mobile Number"}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>
                                <WtrInput
                                    displayFormat="1"
                                    Label="E-mail id of contact person"
                                    fldName="eml"
                                    idText="txteml"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    upprCase={false}
                                    validateFn="[email]"
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    unblockSpecialChars={true}
                                    delayClose={1000}
                                    // speaker={"Enter a valid email address"}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>
                                {/* <WtrInput
                            displayFormat="1"
                            Label="Password"
                            fldName="psw"
                            idText="txtpsw"
                            inputType="password"
                            onChange={onChangeDts}
                            dsabld={true}
                            callFnFocus=""
                            dsbKey={false}
                            unblockSpecialChars={true}
                            validateFn="[psw]"
                            // ToolTip="Enter Password"
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
                            dsabld={true}
                            callFnFocus=""
                            dsbKey={false}
                            unblockSpecialChars={true}
                            validateFn="[psw]"
                            // ToolTip="Re-Enter Password"
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                            speaker={"Enter Password"}
                            delayClose={1000}
                            placement="right"
                            ClssName=""
                            showErrorMsgAbsolute={false}
                        ></WtrInput> */}
                            </div>


                            {/* <div className="flex py-3">
                        <div className="mr-4">
                            <Button
                                size="medium"
                                style={{ backgroundColor: "#86c6d9" }}
                                variant="contained"
                                color="success"
                                disabled={false}
                                startIcon={<SaveIcon />}
                                onClick={saveClick}>
                                Submit
                            </Button>
                        </div>
                        {hcfLoginId ? <div className="mr-4">
                            <Button
                                size="medium"
                                variant="outlined"
                                color="primary"
                                disabled={false}
                                onClick={navigateToAr}>
                                Go to Annual Report
                            </Button>
                        </div> : <></>}
                    </div> */}
                        </div>
                    </div>


                </div>
            </div>
        </>

    );
}; export default React.memo(CbwtfDetails);
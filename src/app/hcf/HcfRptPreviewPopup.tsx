import React from 'react';
import './popup.css';
import NrjRsDt from '../../components/reusable/NrjRsDt';
import WtrInput from '../../components/reusable/nw/WtrInput';
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect';
import { Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PdfIcon from '../../images/pdf-svgrepo-com.svg';
import Cross from '../../images/cross.png';
import { capitalizeTerms, getCmpId, getUsrnm } from 'src/utilities/utilities';
import { nrjAxiosRequestBio } from 'src/Hooks/useNrjAxios';

interface PopupProps {
    onClosePopup: () => void;
    FinalSubmit: () => void;
    data: any;
    onEdit: () => void;
    otherData: any;
    heading: any;
}

const HcfRptPreviewPopup: React.FC<PopupProps> = ({ onClosePopup, FinalSubmit, data, onEdit, otherData, heading }) => {

    const onChangeDts = () => {
    }

    const handleShowPdfClick = async (path: any) => {
        if (!path) return;

        let cmpid = getCmpId() || "";
        let usrnm = getUsrnm() || "";
        let payload = { cmpid, usrnm, doc_path: path };

        let data = await nrjAxiosRequestBio("get_AR_docfile", payload);
        if (data) {
            let base64 = data.data.flst;

            // Remove "data:application/pdf;base64," if it's already present
            const prefix = "data:application/pdf;base64,";
            if (base64.startsWith(prefix)) {
                base64 = base64.slice(prefix.length);
            }

            const newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.write(`
             <embed src="data:application/pdf;base64,${base64}" type="application/pdf" width="100%" height="100%" />
           `);
            } else {
                alert("Pop-up blocker may be preventing the PDF from opening. Please disable the pop-up blocker for this site.");
            }
        }
    };

    const { captiveValue, showMomPdfFile, fileData, consentfileData, fileAuth, showConsentFileName, showConsentFilePath } = otherData;


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


    function renderFirstTable() {
        return (
            <>
                <Seperator heading="Particulars of Occupier"></Seperator>
                <table className="table table-bordered min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="py-3 bg-gray-100">
                            <th className="border p-3" scope="col">S. No.</th>
                            <th className="border p-3" scope="col">Particulars</th>
                            <th className="border p-3" scope="col">Details</th>
                        </tr>
                    </thead>
                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.1"}
                        Label="Name of health care facility"
                        fldName="hcfnm"
                        idText="txthcfnm"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                        speaker={"Name of health care facility"}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                    ></WtrInput>
                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.2"}
                        Label="Address of health care facility"
                        fldName="addf"
                        idText="txtaddf"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        // validateFn="1[length]"
                        allowNumber={false}
                        unblockSpecialChars={true}
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                        speaker={"Address of Facility"}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                    ></WtrInput>

                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.3"}
                        Label="Address of Correspondence"
                        fldName="addc"
                        idText="txtaddc"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        speaker={"Address of Correspondence"}
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                    ></WtrInput>

                    <tr>
                        <td className='border px-3'>1.5</td>
                        <td className='border px-3'>GPS Coordinates of
                            HCF<span className="text-red-600">*</span> </td>
                        <td className='border px-3'>
                            <tr>
                                <WtrInput
                                    displayFormat={"1"}
                                    Label="Latitude"
                                    fldName="gpscordlat"
                                    idText="txtgpscordlat"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    allowDecimal={true}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    delayClose={1000}
                                    speaker={"GPS coordinates of HCF"}
                                ></WtrInput>
                            </tr>
                            <tr>
                                <WtrInput
                                    displayFormat={"1"}
                                    Label="Longitude"
                                    fldName="gpscordlong"
                                    idText="txtgpscordlong"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    allowDecimal={true}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    delayClose={1000}
                                    speaker={"GPS coordinates of HCF"}
                                ></WtrInput>
                            </tr>

                        </td>
                    </tr>



                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.6"}
                        Label="URL of health care facilitys website "
                        fldName="urlweb"
                        idText="txturlweb"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        unblockSpecialChars={true}
                        allowNumber={false}
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                        delayClose={1000}
                    // speaker={"URL of Website"}
                    ></WtrInput>
                    {/* <WtrInput
                        displayFormat={"4"}
                        sNo={"1.6"}
                        Label="GPS coordinates of HCF (latitude)"
                        fldName="gpscordlat"
                        idText="txtgpscordlat"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                        delayClose={1000}
                        speaker={"GPS coordinates of HCF"}
                    ></WtrInput>
                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.7"}
                        Label="GPS coordinates of HCF (longitude)"
                        fldName="gpscordlong"
                        idText="txtgpscordlong"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                        delayClose={1000}
                        speaker={"GPS coordinates of HCF"}
                    ></WtrInput> */}

                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.7"}
                        Label="Name of authorized person"
                        fldName="authnm"
                        idText="txtauthnm"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        unblockSpecialChars={true}
                        blockNumbers={true}
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                        speaker={"Name of authorized person"}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                    ></WtrInput>
                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.8"}
                        Label="Contact number of authorized person"
                        fldName="telno"
                        idText="txttelno"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="[mob]"
                        allowNumber={true}
                        ToolTip="Enter numbers only"
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                        delayClose={1000}
                        speaker={"Enter valid Contact number"}
                    ></WtrInput>
                    {/* <WtrInput
                        displayFormat={"4"}
                        sNo={"1.9"}
                        Label="Fax. No"
                        fldName="fxno"
                        idText="txtfxno"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        allowNumber={true}
                        ToolTip="Enter numbers only"
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                        delayClose={1000}
                    // speaker={"Enter valid Fax No"}
                    ></WtrInput> */}
                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.9"}
                        Label="E-mail id for communication"
                        fldName="eml"
                        idText="txteml"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="[email]"
                        unblockSpecialChars={true}
                        allowNumber={false}
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                        delayClose={1000}
                        speaker={"Enter E-mail id for communication"}
                    ></WtrInput>
                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.10"}
                        Label="Fax number for communication"
                        fldName="fxno"
                        idText="txtfxno"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        allowNumber={true}
                        ToolTip="Enter numbers only"
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                        delayClose={1000}
                    // speaker={"Enter valid Fax No"}
                    ></WtrInput>
                    <tr>
                        <td className="border px-3 py-2">1.11</td>
                        <td className="border px-3 py-2">Ownership of HCF<span className="text-red-600">*</span></td>
                        <td className="border px-3 py-2">
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="ownhcfid"
                                idText="txtownhcfid"
                                onChange={onChangeDts}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                fnctCall={false}
                                dbCon={"nodb"}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                parms={""}
                                allwSrch={true}
                                speaker={""}
                                delayClose={1000}
                                allwZero={"1"}
                                disable={true}
                            ></WtrRsSelect>
                            <WtrInput
                                displayFormat={"1"}
                                sNo={""}
                                Label=""
                                fldName="sltother"
                                idText="txtother"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                minValue={-1}
                                unblockSpecialChars={true}
                                allowNumber={false}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                speaker={""}
                            ></WtrInput>
                        </td>

                    </tr>

                    <tr>
                        <td className='border px-3'>1.12</td>
                        <td className='border px-3'>Status of authorisation under BMWM rules, 2016 <span className="text-red-600">*</span> </td>
                        <td className='border px-3'>
                            <tr>
                                <WtrInput
                                    displayFormat="1"
                                    Label="Status of Authorisation under BMWM Rules, 2016"
                                    fldName="stsauth"
                                    idText="txtstsauth"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    placeholder='Enter valid authorisation number '
                                    delayClose={1000}
                                    speaker='Enter valid authorization No.'
                                ></WtrInput>
                            </tr>
                            <tr>
                                <div style={{ flex: 1 }}> {/* Second div */}

                                    <div style={{ marginTop: '5px' }}>
                                        {fileAuth.map((file: any, index: any) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                                <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {/* Adjust width, height, and margin as needed */}

                                                {file.flnm}

                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </tr>
                            <tr>
                                <NrjRsDt
                                    format="dd-MMM-yyyy"
                                    fldName="authdt_exp"
                                    displayFormat="1"
                                    idText="txtauthdt_exp"
                                    size="lg"
                                    Label="Valid up to"
                                    selectedValue={data.frmData}
                                    onChange={onChangeDts}
                                    readOnly={true}
                                ></NrjRsDt>
                            </tr>

                        </td>
                    </tr>
                    <tr>
                        <td className='border px-3'>1.13</td>
                        <td className='border px-3'>Add consent number<span className="text-red-600">*</span></td>
                        <td className='border px-3'>
                            <div className="mt-0">
                                <WtrInput
                                    displayFormat="1"
                                    Label="Consent number"
                                    fldName="stscnstno"
                                    idText="txtstscnstno"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="1[length]"
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    delayClose={1000}
                                    speaker='Enter Valid Consent Number'

                                ></WtrInput>
                            </div>
                            {/* <NrjRsDt
                                format="dd-MMM-yyyy"
                                fldName="dt_exp"
                                displayFormat="1"
                                idText="txtdt_exp"
                                size="lg"
                                Label="Valid up to"
                                selectedValue={data.frmData}
                                onChange={onChangeDts}
                                readOnly={true}

                            >
                            </NrjRsDt> */}
                            <NrjRsDt
                                format="dd-MMM-yyyy"
                                fldName="dt_exp"
                                displayFormat="1"
                                idText="txtdt_exp"
                                size="lg"
                                Label="Valid up to"
                                selectedValue={data.frmData}
                                onChange={onChangeDts}
                                disAbleFor={true}
                                readOnly={true}
                            ></NrjRsDt>
                            {/* <div style={{ flex: 1 }}> 

                                <div style={{ marginTop: '5px' }}>
                                    {consentfileData.map((file: any, index: any) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                            <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> 

                                            {file.flnm}

                                        </div>
                                    ))}
                                </div>

                            </div> */}

                            {showConsentFileName?.length && showConsentFilePath?.length ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <img
                                        src={PdfIcon}
                                        alt="PDF Icon"
                                        style={{ width: '24px', height: '24px' }}
                                    />
                                    <a
                                        href="javascript:void(0);"
                                        onClick={() => handleShowPdfClick(showConsentFilePath)}
                                        style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        {showConsentFileName}
                                    </a>
                                </div>
                            ) : null}


                        </td>

                    </tr>
                    <tr className="bg-gray-50">
                        <th className="border px-3 py-1 text-left">2</th>
                        <th className="border px-3  text-left"> Type of HCF
                        </th>
                        <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                        <td className='border px-3 py-2'>2.1</td>
                        {/* <td className='border px-3'>Non-bedded health care facility</td> */}
                        <td className='border px-3'>Bedded and non-bedded<span className="text-red-600">*</span></td>
                        <td className='border px-3'>
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="hcftypeid"
                                idText="txthcftypeid"
                                onChange={onChangeDts}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                allwZero={"1"}
                                fnctCall={false}
                                dbCon={""}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                // loadOnDemand={data.nonBedded}
                                parms={""}
                                allwSrch={true}
                                delayClose={1000}
                                disable={true}
                                speaker={"HCF Type bedded/Non-bedded"}
                            ></WtrRsSelect></td>
                    </tr>
                    <tr>
                        <td className='border px-3 py-2'>2.2</td>
                        {/* <td className='border px-3'>Non-bedded health care facility</td> */}
                        <td className='border px-3'>Non-bedded HCF<span className="text-red-600">*</span></td>
                        <td className='border px-3'>
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="nonbdid"
                                idText="txtnonbdid"
                                onChange={onChangeDts}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                allwZero={"1"}
                                fnctCall={false}
                                dbCon={""}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                loadOnDemand={data.nonBedded}
                                parms={""}
                                allwSrch={true}
                                delayClose={1000}
                                disable={true}
                                speaker={"HCF Type bedded/non-bedded"}
                            ></WtrRsSelect></td>
                    </tr>
                    <WtrInput
                        displayFormat={"4"}
                        sNo={"2.3"}
                        Label="Number of beds"
                        fldName="nobd"
                        idText="txtnobd"
                        onChange={onChangeDts}
                        dsabld={true}
                        callFnFocus=""
                        dsbKey={false}

                        validateFn="1[length]"
                        allowNumber={true}
                        unblockSpecialChars={true}
                        selectedValue={data.frmData}
                        clrFnct={data.trigger}
                    // speaker={"No. of Beds"}
                    ></WtrInput>

                    <tr>
                        <td className="border px-3 py-2">2.4</td>
                        <td className="border px-3">License number of health care facility</td>
                        <td className="border px-3">
                            <tr>
                                <WtrInput
                                    displayFormat={"1"}
                                    Label="License number of health care facility"
                                    fldName="licno"
                                    idText="txtlicno"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn=""
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    speaker='License number '
                                ></WtrInput>
                            </tr>

                            <tr>
                                <NrjRsDt
                                    format="dd-MMM-yyyy"
                                    fldName="licdt_exp"
                                    displayFormat='1'
                                    idText="txtlicdt_exp"
                                    size="lg"
                                    Label="License valid upto"
                                    selectedValue={data.frmData}
                                    onChange={onChangeDts}
                                    speaker={"License valid upto"}
                                    readOnly={true}
                                ></NrjRsDt>
                            </tr>

                        </td>

                    </tr>
                </table>
            </>
        )
    }

    function renderSecondTable() {
        return (
            <>
                <Seperator heading="Details of waste generation"></Seperator>
                <table className="table table-bordered min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="py-3 bg-gray-100">
                            <th className="border p-3" scope="col">S. No.</th>
                            <th className="border p-3" scope="col">Particulars</th>
                            <th className="border p-3" scope="col">Details</th>
                        </tr>

                    </thead>

                    <tr className="bg-gray-50">
                        <th className="border px-3  py-1">3</th>
                        <th className="border px-3  text-left">Quantity of waste generated in Kg/annum (on monthly average basis) </th>
                        <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                        <td className="border px-3">3.1</td>
                        <td className="border px-3">Yellow category waste <span className="text-red-600">*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="ylwqnt"
                                idText="txtylwqnt"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Yellow category waste "
                            ></WtrInput></td>
                    </tr>
                    <tr>
                        <td className="border px-3">3.2</td>
                        <td className="border px-3">Red category waste <span className="text-red-600">*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="redqnt"
                                idText="txtredqnt"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Red category waste "
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">3.3</td>
                        <td className="border px-3"> White category waste <span className="text-red-600">*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="whtqnt"
                                idText="txtwhtqnt"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="White category waste "
                            ></WtrInput></td>
                    </tr>
                    <tr>
                        <td className="border px-3">3.4</td>
                        <td className="border px-3">Blue category waste<span className="text-red-600">*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="blqnt"
                                idText="txtblqnt"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Blue category waste "

                            // speaker={"Enter No of Beds"}
                            ></WtrInput></td>

                    </tr>
                    <tr>
                        <td className="border px-3">3.5</td>
                        <td className="border px-3">General solid waste</td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="slqnt"
                                idText="txtslqnt"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="General solid waste"
                            // speaker={"Enter No of Beds"}
                            ></WtrInput></td>
                    </tr>
                    <tr className="bg-gray-50">
                        <th className="border px-3  py-1">4</th>
                        <th className="border px-3  text-left">  Details of the storage, treatment, transportation, processing and disposal facility
                        </th>
                        <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                        <td className="border px-3">4.1</td>
                        <td className="border px-3">Details of facility for the on-site storage of waste<span className="text-red-600">*</span></td>
                        <td className="border px-3">
                            <tr>
                                <WtrInput
                                    displayFormat="1"
                                    Label="Area (in sq. metres)"
                                    fldName="size"
                                    idText="txtsize"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    allowDecimal={true}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>
                            </tr>
                            <tr className=" px-3">
                                <WtrInput
                                    displayFormat="1"
                                    Label="Capacity (in Kg/day)"
                                    fldName="cap"
                                    idText="txtcap"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    allowDecimal={true}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>
                            </tr>
                            <tr className=" px-3">
                                {/* <WtrInput
                                    displayFormat="1"
                                    Label="Provision for on-site storage"
                                    fldName="prov"
                                    idText="txtprov"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput> */}
                                <WtrRsSelect
                                    displayFormat={"1"}
                                    Label="Provision for on-site storage"
                                    fldName="provid"
                                    idText="txtprovid"
                                    onChange={onChangeDts}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    allwZero={"1"}
                                    fnctCall={false}
                                    dbCon={""}
                                    typr={""}
                                    dllName={""}
                                    fnctName={""}
                                    loadOnDemand={data.provStorage}
                                    parms={""}
                                    allwSrch={true}
                                    delayClose={1000}
                                    disable={true}
                                    speaker={"Provision for on-site storage"}
                                ></WtrRsSelect>
                            </tr>
                        </td>
                    </tr>
                    <tr className="bg-gray-50">
                        <th className="border px-3  py-3"></th>
                        <th className="border px-3  text-left"> Whether HCF is having captive treatment facility
                        </th>
                        <th className="border px-3 text-left py-1">
                            <label>
                                <input
                                    type='radio'
                                    name='captiveOption'
                                    checked={captiveValue === true}
                                />
                                Yes
                            </label>
                            <label>
                                <input
                                    type='radio'
                                    name='captiveOption'
                                    checked={captiveValue === false}
                                />
                                No
                            </label>

                        </th>
                    </tr>
                    <tr>
                        <td className="border px-3">4.2</td>
                        <td className="border px-3">Disposal facilities</td>
                        <td className="border px-3"> </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(i)</td>
                        <td className="border px-3">Type of treatment equipment</td>
                        <td>
                            <tr>
                                <td className="px-3 w-3/12">Number of units </td>
                                <td className="px-3 w-3/12"> Capacity of equipment (Kg/day)</td>
                                <td className="px-3 w-3/12">Quantity of waste treated or disposed (in kg per annum)</td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(ii)</td>
                        <td className="border px-3">Incinerators</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="inc"
                                        idText="txtinc"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">   <WtrInput
                                    displayFormat="1"
                                    Label=""
                                    fldName="inccap"
                                    idText="txtinccap"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput></td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="incanm"
                                        idText="txtincanm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">(iii)</td>
                        <td className="border px-3">Plasma pyrolysis</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="pla"
                                        idText="txtpla"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="placap"
                                        idText="txtplacap"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="plaanm"
                                        idText="txtplaanm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(iv)</td>
                        <td className="border px-3">Autoclaves</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="autocl"
                                        idText="txtautocl"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="autoclcap"
                                        idText="txtautoclcap"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="autoclanm"
                                        idText="txtautoclnm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(v)</td>
                        <td className="border px-3">Microwave</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="inc"
                                        idText="txtinc"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="inccap"
                                        idText="txtinccap"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="incanm"
                                        idText="txtincanm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(vi)</td>
                        <td className="border px-3">Hydroclave</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="hydr"
                                        idText="txthydr"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="hydrcap"
                                        idText="txthydrcap"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="hydranm"
                                        idText="txthydranm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(vii)</td>
                        <td className="border px-3">Shredder</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="shr"
                                        idText="txtshr"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="shrcap"
                                        idText="txtshrcap"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="shranm"
                                        idText="txtshranm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(viii)</td>
                        <td className="border px-3">Needle tip cutter or destroyer</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="needle"
                                        idText="txtneedle"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12 text-center">  - </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="needleanm"
                                        idText="txtneedleanm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(ix)</td>
                        <td className="border px-3">Sharps encapsulation or concrete pit</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="sharp"
                                        idText="txtsharp"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12 text-center"> - </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="sharpanm"
                                        idText="txtsharpanm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(x)</td>
                        <td className="border px-3">Deep burial pits</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="deep"
                                        idText="txtdeep"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="deepcap"
                                        idText="txtdeepcap"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="deepanm"
                                        idText="txtdeepanm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(xi)</td>
                        <td className="border px-3">Chemical disinfection:</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="chem"
                                        idText="txtchem"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12 text-center">  - </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="chemanm"
                                        idText="txtchemanm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(xii)</td>
                        <td className="border px-3">Any other treatment equipment:</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="anyothr"
                                        idText="txtanyothr"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="anyothrcap"
                                        idText="txtanyothrcap"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12 text-center">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="anyothranm"
                                        idText="txtanyothranm"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">4.3</td>
                        <td className="border px-3">Quantity of recyclable wastes
                            sold to authorized recyclers after
                            treatment in Kg/annum</td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label="Red category waste"
                                fldName="recyclered"
                                idText="txtred"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Red category waste"
                            ></WtrInput>
                            <WtrInput
                                displayFormat="1"
                                Label="Blue category waste"
                                fldName="recyleblue"
                                idText="txtblue"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Blue category waste"
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">4.4</td>
                        <td className="border px-3">Details of incineration ash and ETP sludge generated and disposed during the treatment of wastes in Kg/annum</td>
                        <td className="border px-3">
                            <tr>
                                <td className="px-3"></td>
                                <td className="px-3">Quantity generated (kg/annum)</td>
                                <td className="px-3">Where disposed</td>
                            </tr>
                            <tr>
                                <td className="px-3">Incineration ash</td>
                                <td className="px-3">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="incire"
                                        idText="txtincire"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3"><WtrInput
                                    displayFormat="1"
                                    Label=""
                                    fldName="inciredispo"
                                    idText="txtincire"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    allowNumber={false}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput></td>
                            </tr>
                            <tr>
                                <td className="px-3">ETP sludge</td>
                                <td className="px-3"><WtrInput
                                    displayFormat="1"
                                    Label=""
                                    fldName="etpsl"
                                    idText="txtetpsl"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput>
                                </td>
                                <td className="px-3"><WtrInput
                                    displayFormat="1"
                                    Label=""
                                    fldName="etpsldispo"
                                    idText="txtetpsl"
                                    onChange={onChangeDts}
                                    dsabld={true}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    allowNumber={false}
                                    selectedValue={data.frmData}
                                    clrFnct={data.trigger}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                ></WtrInput></td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">4.5</td>
                        <td className="border px-3"> Name of the common bioMedical waste treatment facility
                            operator through which wastes are
                            disposed of </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="nmbio"
                                idText="txtnmbio"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder=" Name of the common bioMedical waste treatment facility
                            operator through which wastes are
                            disposed of "
                            ></WtrInput></td>
                    </tr>

                </table>
            </>
        )
    }

    function renderThirdTable() {
        return (
            <>
                <Seperator heading="Details of training and accident occured"></Seperator>
                <table className="table table-bordered min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="py-3 bg-gray-100">
                            <th className="border p-3" scope="col">S. No.</th>
                            <th className="border p-3" scope="col">Particulars</th>
                            <th className="border p-3" scope="col">Details</th>
                        </tr>

                    </thead>
                    <tr>
                        <td className="border px-3">4.6</td>
                        <td className="border px-3">Do you have bio-medical waste management committee? If yes, attach minutes of the meetings held during the reporting period
                        </td>
                        <td className="border px-3">
                            <div className="flex justify-between"> {/* Container div with flex justify-between */}
                                <div style={{ flex: 1 }}> {/* First div */}
                                    {/* <WtrInput
                                        displayFormat="2"
                                        Label=""
                                        fldName="infobio"
                                        idText="txt_infobio"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={false}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="left"
                                        ClssName=""
                                        placeholder="Do you have bio-medical waste
                                        management committee? If yes, attach
                                        minutes of the meetings held during
                                        the reporting period"
                                    ></WtrInput> */}
                                    <WtrRsSelect
                                        displayFormat={"1"}
                                        Label=""
                                        fldName="mngmntcomid"
                                        idText="txtmngmntcomidid"
                                        onChange={onChangeDts}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        fnctCall={false}
                                        dbCon={"nodb"}
                                        typr={""}
                                        dllName={""}
                                        fnctName={""}
                                        parms={""}
                                        allwSrch={false}
                                        speaker={""}
                                        // loadOnDemand={committeeOption}
                                        delayClose={1000}
                                        allwZero={"1"}
                                        disable={true}
                                        placement="right"
                                    ></WtrRsSelect>
                                </div>
                                <div style={{ flex: 1 }}> {/* Second div */}

                                    <div style={{ marginTop: '5px' }}>
                                        {showMomPdfFile.map((file: any, index: any) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                                <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {/* Adjust width, height, and margin as needed */}

                                                {file.flnm}

                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr className="bg-gray-50">
                        <th className="border px-3  py-1">5</th>
                        <th className="border px-3  text-left">Details trainings conducted on BMW </th>
                        <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                        <td className="border px-3">5.1</td>
                        <td className="border px-3">Number of trainings conducted on
                            BMW management.</td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="train"
                                idText="txttrain"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of trainings conducted on BMW management"
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">5.2</td>
                        <td className="border px-3">Number of personnel trained</td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="prstrain"
                                idText="txtprstrain"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of personnel trained"
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">5.3</td>
                        <td className="border px-3"> Number of personnel trained at
                            the time of induction</td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="timeind"
                                idText="txttimeind"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of personnel trained at the time of induction"
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">5.4</td>
                        <td className="border px-3">Number of personnel not undergone any training so far </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="notrain"
                                idText="txtnotrain"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of personnel not undergone any training so far"
                            // speaker={"Enter No of Beds"}
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">5.5</td>
                        <td className="border px-3">Whether standard manual for training is available?
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="whrtarin"
                                idText="txtwhrtarin"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Whether standard manual for training is available?"
                            // speaker={"Enter No of Beds"}
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">5.6</td>
                        <td className="border px-3">Any other information
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="otherinfo"
                                idText="txtotherinfo"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Any other information"
                            // speaker={"Enter No of Beds"}
                            ></WtrInput>
                        </td>
                    </tr>

                    <tr className="bg-gray-50">
                        <th className="border px-3  py-1">6</th>
                        <th className="border px-3  text-left">Details of the accident occurred during the year</th>
                        <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                        <td className="border px-3">6.1</td>
                        <td className="border px-3">Number of accidents occurred</td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="accd"
                                idText="txtaccd"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of accidents occurred."
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">6.2</td>
                        <td className="border px-3">Number of the persons affected</td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="prsaff"
                                idText="txtprsaff"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of the persons affected"
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">6.3</td>
                        <td className="border px-3">Remedial action taken (please attach details if any) </td>
                        <td className="border px-3">
                            <div className="flex justify-between"> {/* Container div with flex justify-between */}
                                <div style={{ flex: 1 }}> {/* First div */}
                                    <WtrInput
                                        displayFormat="2"
                                        Label=""
                                        fldName="remedial"
                                        idText="txt_remedial"
                                        onChange={onChangeDts}
                                        dsabld={true}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={false}
                                        selectedValue={data.frmData}
                                        clrFnct={data.trigger}
                                        delayClose={1000}
                                        placement="left"
                                        ClssName=""
                                        placeholder="Remedial action taken (please attach details if any)"
                                    ></WtrInput>
                                </div>
                                <div style={{ flex: 1 }}> {/* Second div */}

                                    <div style={{ marginTop: '5px' }}>
                                        {fileData.map((file: any, index: any) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                                <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {/* Adjust width, height, and margin as needed */}

                                                {file.flnm}

                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">6.4</td>
                        <td className="border px-3"> Any fatality occurred, details </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="ftlity"
                                idText="txtftlity"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder=" Any fatality occurred, details"
                            // speaker={"Enter No of Beds"}
                            ></WtrInput>
                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">7</td>
                        <td className="border px-3">Are you meeting the standards of air pollution from the incinerator?
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="stdair"
                                idText="txtstdair"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Are you meeting the standards of air pollution from the incinerator?"
                            // speaker={"Enter No of Beds"}
                            ></WtrInput>
                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">7.1</td>
                        <td className="border px-3">Number of times Stack monitoring was done during the year
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="stckmontg"
                                idText="txtstckmontg"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="How many times in last year could not met the standards?"
                            // speaker={"Enter No of Beds"}
                            ></WtrInput>
                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">7.2</td>
                        <td className="border px-3">How many times in last year could not met the standards out of total no. of stack monitoring done during the year
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="stdairmet"
                                idText="txtstdairmet"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="How many times in last year could not met the standards?"
                            // speaker={"Enter No of Beds"}
                            ></WtrInput>
                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">7.3</td>
                        <td className="border px-3">Whether continuous online emission monitoring systems is installed
                        </td>
                        <td className="border px-3">

                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="onlemid"
                                idText="txtonlemid"
                                onChange={onChangeDts}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                fnctCall={false}
                                dbCon={"nodb"}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                parms={""}
                                allwSrch={false}
                                speaker={""}
                                // loadOnDemand={sterilizationOptn}
                                delayClose={1000}
                                allwZero={"1"}
                                disable={true}
                                placement="right"
                            ></WtrRsSelect>

                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="onlemi"
                                idText="txtonlemi"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Whether continuous online emission monitoring systems is installed"
                                // speaker={"Enter No of Beds"}
                                unblockSpecialChars={true}
                            ></WtrInput>
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="frqcali"
                                idText="txtfrqcali"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="frequency of calibration"
                                // speaker={"Enter Number of Beds"}
                                unblockSpecialChars={true}
                            ></WtrInput>
                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">8</td>
                        <td className="border px-3">Liquid waste generated and treatment methods in place
                        </td>
                        <td className="border px-3">
                            {/* <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="liqwst"
                                idText="txtliqwst"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Liquid waste generated and treatment methods in place"
                                // speaker={"Enter No of Beds"}
                                unblockSpecialChars={true}
                            ></WtrInput> */}
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="liqwstid"
                                idText="txtliqwstid"
                                onChange={onChangeDts}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                fnctCall={false}
                                dbCon={"nodb"}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                parms={""}
                                allwSrch={false}
                                speaker={""}
                                // loadOnDemand={sterilizationOptn}
                                delayClose={1000}
                                allwZero={"1"}
                                disable={true}
                                placement="right"
                            ></WtrRsSelect>
                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">8.1</td>
                        <td className="border px-3">Number of times treated effluent has been analysed during the year
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="trtefflnt"
                                idText="txttrtefflnt"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of times treated effluent has been analysed during the year"
                                // speaker={"Enter Number of Beds"}
                                unblockSpecialChars={true}
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">8.2</td>
                        <td className="border px-3">How many times in last year could not met the standards out of no. of times treated effluent has been analysed during the year
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="notmettrtefflnt"
                                idText="txtnotmettrtefflnt"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="How many times in last year could not met the standards out of no. of times treated effluent has been analysed during the year"
                                // speaker={"Enter Number of Beds"}
                                unblockSpecialChars={true}
                            ></WtrInput>
                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">9</td>
                        <td className="border px-3">Is the disinfection method or sterilization meeting the log 4 standards?
                        </td>
                        <td className="border px-3">
                            {/* <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="disimth"
                                idText="txtdisimth"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Is the disinfection method or sterilization meeting the log 4 standards?"
                                // speaker={"Enter No of Beds"}
                                unblockSpecialChars={true}
                            ></WtrInput> */}
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="disimthid"
                                idText="txtdisimthid"
                                onChange={onChangeDts}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                fnctCall={false}
                                dbCon={"nodb"}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                parms={""}
                                allwSrch={false}
                                speaker={""}
                                // loadOnDemand={sterilizationOptn}
                                delayClose={1000}
                                allwZero={"1"}
                                disable={true}
                                placement="right"
                            ></WtrRsSelect>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">9.1</td>
                        <td className="border px-3">How many times you have not met the standards in a year?
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="ntmetsta"
                                idText="txtntmetsta"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="How many times you have not met the standards in a year?"
                                // speaker={"Enter Number of Beds"}
                                unblockSpecialChars={true}
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">10</td>
                        <td className="border px-3">Air pollution control devices attached with the incinerator
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="airplincid"
                                idText="txtairplincid"
                                onChange={onChangeDts}
                                dsabld={true}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={data.frmData}
                                clrFnct={data.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Air pollution control devices attached with the incinerator"
                            ></WtrInput>
                        </td>
                    </tr>
                </table>
            </>
        )
    }

    function closeAndEdit() {
        return (
            < div className="mr-4 flex justify-center mt-8" >
                <Button
                    size="medium"
                    style={{ backgroundColor: "#34c3ff",  textTransform: "none"}}
                    variant="contained"
                    color="success"
                    // disabled={false}
                    startIcon={<SaveIcon />}
                    onClick={onEdit}>
                    Edit
                </Button>

                <Button
                    size="medium"
                    style={{ backgroundColor: "#34c3ff", textTransform: "none" }}
                    variant="contained"
                    color="success"
                    // disabled={false}
                    startIcon={<SaveIcon />}
                    onClick={FinalSubmit}>
                    Final submit
                </Button>
            </div >
        )
    }
    return (
        <div className="popup-overlay">
            <div className="popup">
                <div className="scrollable-content">
                    <h3 style={{ textAlign: 'center' }}>{heading ? heading : ''}</h3>
                    <img src={Cross} alt="crossIcon" style={{ width: '24px', height: '24px', float: 'right', margin: '8px', cursor: 'pointer' }} onClick={onClosePopup} />
                    {renderFirstTable()}
                    {renderSecondTable()}
                    {renderThirdTable()}
                    {closeAndEdit()}
                </div>
            </div>
        </div>
    );
};

export default HcfRptPreviewPopup;

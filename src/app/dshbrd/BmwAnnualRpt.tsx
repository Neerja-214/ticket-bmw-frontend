import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './report.css'
import ReactToPrint from 'react-to-print';
import { getFldValue, useGetFldValue } from "../../Hooks/useGetFldValue";

import utilities, {
    cmboStrLrg,
    createGetApi,
    postLinux,
    convertFldValuesToJson,
    convertFldValuesToString,
    GetResponseLnx,
    getCmpId,
    getUsrnm,
    GetResponseWnds,
    getStateAbbreviation,
    capitalize,

} from "../../utilities/utilities";

import { useEffectOnce } from "react-use";

import WtrRsSelect from "../../components/reusable/nw/WtrRsSelect";



const Seperator = (props: any) => {
    return (
        <>
            <div className="mt-7">
                <div className="font-semibold" style={{ color: '#86c6d9' }}>
                    {/* <div className="font-semibold" style={{ color: '#009ED6' }}> */}
                    {props.heading}
                </div>
                <div className="mt-2" style={{ border: '1px solid #86c6d9' }}>
                </div>
            </div>
        </>
    )
}


const BmwAnnualRpt = () => {

    const [year, setYear] = useState("");

    const [loadOnDemand, setLoadOnDemand] = useState("")
    useEffectOnce(() => {
        let value1 = new Date().getFullYear()
        setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}$^id][${value1}=txt][${value1}`)
    })


    const onChangeDts = (data: string) => {
        let fld: any = utilities(2, data, "");
        if (fld == 'dt_yearid') {
            setYear(getFldValue(data, 'dt_yearid').split('|')[0])
        }
    };


    const downloadPdfFile = async () => {

        const input = document.querySelector('.box') as HTMLElement;

        if (input) {
            // Calculate the scaling factor based on the content and desired PDF size
            const scale = 1; // Adjust as needed

            // Options for html2canvas
            const options = {
                scale,
                scrollX: 0,
                scrollY: 0,
                useCORS: true,
                allowTaint: true,
            };

            // Generate canvas
            const canvas = await html2canvas(input, options);

            // Calculate PDF dimensions
            const pdfWidth = input.offsetWidth * scale;
            const pdfHeight = input.offsetHeight * scale;

            // Create PDF instance
            const pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]);

            // Add canvas image to PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Save PDF
            pdf.save('BmwAnnualRpt.pdf');
        }

    };


    function renderTableData() {
        return (
            <div className="box">
                <table style={{ border: "#060404", borderRadius: "1%" }}>
                    <thead>
                        <tr>
                            <th scope="col" rowSpan={2}>
                                S.No
                            </th>
                            <th rowSpan={2}>Name of State the State/UT</th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                Total no. of Bedded Health Care FacIlItIes (HCFs)
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                Total no. of Non bedded Health care FacIlItIes (HCFs)
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                Total no. of Health care FacIlItIes (HCFs)
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                Total no. of Beds
                            </th>
                            <th scope="col" colSpan={3}>
                                AuthorIzatIon status
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                No. of HCF's UtIlaIzatIon CBWTF's no. of HCF's
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                Total QunatIty of BMW generated (kg/day)
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                Total QunatIty of BMW Treated and DIsposed (kg/day)
                            </th>
                            <th scope="col" colSpan={2}>
                                CaptIve BMW Treatment FacIlItIes Operated by by the HCF's
                            </th>
                            <th scope="col" colSpan={2}>
                                Common BIo-MedIcal Waste Treatment BMW Treatment FacIlItIes
                                (CBWTF's)
                            </th>
                            <th scope="col" colSpan={2}>
                                Deep burIal Installed by HCF &amp; CBWTF's
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                Total BMW treated by CaptIve treatment FacIlItIes by HCF In Kg/day
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                Total BMW treated by CBWTF's
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                Total QunatIty of BMW Treated and DIsposed (kg/day)
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                Total No. of show cause notIces/DIrectIons Issued to defulter
                                HCF's/CBWTF's
                            </th>
                            <th className="vertIcal" scope="col" rowSpan={2}>
                                {" "}
                                No. of CBWTF's that have Installed COEMS
                            </th>
                        </tr>
                        <tr>
                            <th className="vertIcal" scope="col">
                                Total no. of HCF's applied for authoraizatIon
                            </th>
                            <th className="vertIcal" scope="col">
                                Total no. of HCF's granted authoraizatIon
                            </th>
                            <th className="vertIcal" scope="col">
                                Total no. of HCF's In operatIon wIthout authorIzatIon
                            </th>
                            <th className="vertIcal" scope="col">
                                No. of HCF's havIng captIve treatment FacIlItIes
                            </th>
                            <th className="vertIcal" scope="col">
                                No. of captIve Inclnerators Operated by HCF
                            </th>
                            <th className="vertIcal" scope="col">
                                CBWTFs OperatInals
                            </th>
                            <th className="vertIcal" scope="col">
                                CBWTFs under ConstructIon
                            </th>
                            <th className="vertIcal" scope="col">
                                HCF
                            </th>
                            <th className="vertIcal" scope="col">
                                CBWTFs{" "}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th scope="row">I</th>
                            <td>II</td>
                            <td>III</td>
                            <td>Iv</td>
                            <td>v</td>
                            <td>vI</td>
                            <td>vII</td>
                            <td>vIII</td>
                            <td>IX</td>
                            <td>X</td>
                            <td>XI</td>
                            <td>XII</td>
                            <td>XIII</td>
                            <td>XIV</td>
                            <td>XV</td>
                            <td>XVI</td>
                            <td>XVII</td>
                            <td>XVIII</td>
                            <td>XIX</td>
                            <td>XX</td>
                            <td>XXI</td>
                            <td>XXII</td>
                            <td>XXIII</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }

    function renderDownloadButton() {
        return (
            <button onClick={downloadPdfFile}>Download HTML</button>
        )
    }


    function renderYearSelect() {
        return (
            <div>
                <div className="mb-4 pb-4 mx-3">
                    <Seperator heading="Select From Dropdown"></Seperator>
                    <div className=" mt-4 grid grid-cols-3 gap-x-8 gap-y-4">
                        <WtrRsSelect
                            Label="Select year"
                            speaker="Select year"
                            fldName="dt_yearid"
                            idText="txtdt_yearid"
                            displayFormat={"1"}
                            onChange={onChangeDts}
                            selectedValue=""
                            clrFnct={0}
                            allwZero={"0"}
                            fnctCall={false}
                            dbCon=""
                            typr=""
                            loadOnDemand={loadOnDemand}
                            dllName={""}
                            fnctName={""}
                            parms={""}
                            allwSrch={true}
                            delayClose={1000}
                        ></WtrRsSelect>

                    </div>
                </div>
                <button>Submit</button>
            </div>

        )
    }


    return (
        <div>
            {renderYearSelect()}
            {renderTableData()}
            {renderDownloadButton()}
        </div>

    );
};

export default BmwAnnualRpt;

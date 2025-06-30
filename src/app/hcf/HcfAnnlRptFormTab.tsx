import React, { useEffect, useReducer, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import utilities, { GetResponseLnx, convertFldValuesToJson, convertFldValuesToString, getCmpId, getUsrnm, postLinux, clear_Multiple_Controls, check_multiplesum_validation, capitalizeTerms } from '../../utilities/utilities'
import { Button } from "@mui/material";
import { nrjAxiosRequestBio } from '../../Hooks/useNrjAxios';
import { getFldValue } from "../../Hooks/useGetFldValue";
import WtrInput from '../../components/reusable/nw/WtrInput';
import WtrRsSelect from '../../components/reusable/nw/WtrRsSelect';
import { validForm } from '../../Hooks/validForm';
import NrjRsDt from '../../components/reusable/NrjRsDt';
import SaveIcon from "@mui/icons-material/Save";
import { useEffectOnce } from 'react-use';
import HcfHeader from './HcfHeader';
import { useToaster } from '../../components/reusable/ToasterContext';
import { getLvl, control_focus } from '../../utilities/cpcb';
import PdfIcon from '../../images/pdf-svgrepo-com.svg';
import DeleteIcon from '../../images/icons8-delete.svg';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { styled } from '@mui/material/styles';
import Popup from './HcfRptPreviewPopup';
import { TabProps } from '@mui/material/Tab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PreviewIcon from '@mui/icons-material/Visibility';
import '../../login/login.css'
// add css for Tab when hover or select tab
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
const CustomTab = styled(Tab)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        borderRadius: '10px',
    },
    '& .MuiTab-wrapper': {
        fontSize: '1rem',
        fontWeight: 500,
        whiteSpace: 'nowrap', // Prevent text wrapping
        overflow: 'hidden', // Hide overflow text
        textOverflow: 'ellipsis', // Show ellipsis for overflow text
        textAlign: 'center', // Center align text
        wordBreak: 'break-word', // Break long words
    },
    '&.Mui-selected': {
        borderRadius: '10px',
        backgroundColor: theme.palette.action.hover,
    },
}));

const CustomTooltip = styled(Tooltip)(({ theme }) => ({
    width: '25%',
}));

interface CustomTabWithTooltipProps extends TabProps {
    title: string;
}

const CustomTabWithTooltip: React.FC<CustomTabWithTooltipProps> = ({ title, ...props }) => (
    <CustomTooltip title={title} arrow>
        <div>
            <CustomTab {...props} />
        </div>
    </CustomTooltip>
);
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
    DISABLE: 'disable',
    SETNONBEDDED: "setNonBedded",
    SET_PRO_STORAGE: 'setProStorage',
    SETYESNO_DATA: "setYesNodata",
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
    nonBedded: '',
    provStorage: '',
    optionYesNo: ''

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
    nonBedded: string;
    provStorage: string;
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
        case ACTIONS.SETYESNO_DATA:
            newstate.optionYesNo = action.payload
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
        case ACTIONS.SETNONBEDDED:
            newstate.nonBedded = action.payload;
            return newstate;
        case ACTIONS.SET_PRO_STORAGE:
            newstate.provStorage = action.payload
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

interface FileData {
    flnm: string;
    flst: string;
}

const HcfAnnlRptFormTab = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [formDataGet, setFormData] = useState('')
    const [captiveValue, setCaptiveValue] = useState<boolean>(false)
    const [emissionValue, setEmission] = useState<boolean>(false)
    const [governmentCombo, setGovernmentCombo] = useState("")
    const [committeeOption, setOptionComittee] = useState('')
    const [remedOption, setOptionRemed] = useState('')
    const [hcfTypeSelect, setHcfTypeSelect] = useState(false)
    const [error, setError] = useState<string>('');
    const [fileData, setFileData] = useState<FileData[]>([]);
    const [showMomPdfFile, setShowMomPdfFile] = useState<FileData[]>([]);
    const [momPdfError, setMomPdfError] = useState<string>('');
    const [isFirstTabActive, setIsFirstTabActive] = useState(true);
    const [isSecondTabActive, setIsSecondTabActive] = useState(false);
    const [isThirdTabActive, setIsThirdTabActive] = useState(false);
    const [tabValue, setTabValue] = React.useState('1');
    const [arrytab, setArryTab] = useState(new Array(3).fill(true));
    const [year, setYear] = useState("");
    const [ownerHcfSelect, setOwnerHcfSelect] = useState('')
    const isHcfLogin = getLvl() == 'CPCB' ? false : true;
    const [showPopup, setShowPopup] = useState(false);
    const [showDeletePdf, setShowDeletePdf] = useState(false)
    const [committeeVal, setCommitteeVal] = useState(false)
    const [remedVal, setRemedVal] = useState(false)
    const [arstatus, setArStatus] = useState('');
    const [datastatus, setDataStatus] = useState('');
    const [armessage, setArMessage] = useState('')
    const [checkConsentNo, setCheckConsentNo] = useState<string>('')
    const [sterilizationOptn, setsterilizationOptn] = useState('');

    const [selectedYear, setSelectedYear] = useState<number | string>(""); // Local state for selected year
    const [years, setYears] = useState<number[]>([]); // Store available years
    const [consentfileData, setConsentFileData] = useState<{ flnm: string, flst: string }[]>([]);
    const [showConsentFilePath, setShowConsentPdfFilePath] = useState([])
    const [showConsentFileName, setShowConsentPdfFileName] = useState([])
    const [optionHcfType, setOptionHcftype] = useState('')
    // useEffectOnce(() => {
    //     let value1 = new Date().getFullYear()
    //     setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}`)

    // })
    const [consentNumber, setConsentNumber] = useState<string>("")
    const [loadOnDemand, setLoadOnDemand] = useState("")
    const [consentpdfError, setConsentPdfError] = useState<string>('');

    const [fileAuth, setFileAuth] = useState<FileData[]>([]);
    const [authpdfError, setAuthPdfError] = useState<string>('');
    useEffectOnce(() => {
        let value1 = new Date().getFullYear()
        setLoadOnDemand(`id][${value1 - 2}=txt][${value1 - 2}$^id][${value1 - 1}=txt][${value1 - 1}`)
        setGovernmentCombo("id][1=txt][Government$^id][2=txt][Private$^id][3=txt][SemiGovernment$^id][4=txt][Any Other")
        setOptionComittee("id][1=txt][Yes$^id][2=txt][No")
        setOptionRemed("id][1=txt][Yes$^id][2=txt][No")
        setOptionHcftype("id][1=txt][Bedded$^id][2=txt][Non-bedded")
        setsterilizationOptn("id][1=txt][Yes$^id][2=txt][No")
    })


    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const yearList = [currentYear - 1, currentYear]; // Last 3 years
        setYears(yearList); // Set years in state
        setSelectedYear(""); // Set default selected year (two years ago)
    }, []);


    useEffect(() => {
        if (!captiveValue) {
            // clear the value of particular multiple field
            const Data = clear_Multiple_Controls('inc#inccap#incanm#pla#placap#plaanm#autocl#autoclcap#autoclanm#autoclanm#hydro#hydrocap#hydroanm#hydr#hydrcap#hydranm#shr#shrcap#shranm#needle#needleanm#sharp#sharpanm#deep#deepcap#deepanm#chem#chemanm#anyothr#anyothrcap#anyothranm', state.frmData)
            dispatch({ type: ACTIONS.SETFORM_DATA, payload: Data });
        }

    }, [captiveValue])


    const handlePreviewClick = () => {
        refetch()
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const finalSubmitOnPopup = () => {
        SaveClick()
    }

    const handleOnEditForm = () => {
        setIsFirstTabActive(true)
        setTabValue('1')
        setIsThirdTabActive(false)
        setShowPopup(false);
        window.scrollTo(0, window.scrollY);
    }



    const handleMomFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (fileList) {
            if (fileList.length > 4) {
                // showToaster(["Can Upload max 4 Files"], "error");
                setMomPdfError('The maximum Number of uploaded PDF files allowed is 4');
                return;
            }
            const totalSize = Array.from(fileList).reduce((acc, file) => acc + file.size, 0);
            const totalSizeInMB = totalSize / (1024 * 1024); // Convert bytes to MB
            if (totalSizeInMB > 4) {
                // showToaster(['Total file size should be less than 4 MB.'],"error")
                setMomPdfError('Total file size should be less than 4 MB.')
                return;
            }
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (file.type !== 'application/pdf') {
                    setMomPdfError("Only Pdf File upload")
                    return;
                }
                const fileReader = new FileReader();
                fileReader.onload = (e) => {
                    const base64String = e.target?.result as string;
                    const existingFileIndex = fileData.findIndex((f) => f.flnm === file.name);
                    if (existingFileIndex === -1) {
                        setShowMomPdfFile((prevFileData) => [
                            ...prevFileData,
                            { flnm: file.name, flst: base64String },
                        ]);
                    } else {
                        setMomPdfError('File already uploaded not allow to upload duplicate file')
                        return;
                    }
                };
                fileReader.readAsDataURL(file);
            }
        }
    };


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (fileList) {

            if (fileData.length > 4) {
                setError('The maximum Number of uploaded PDF files allowed is 4.')
                // showToaster(["The maximum Number of uploaded PDF files allowed is 4."], "error");
                return;
            }
            const totalSize = Array.from(fileList).reduce((acc, file) => acc + file.size, 0);
            const totalSizeInMB = totalSize / (1024 * 1024); // Convert bytes to MB
            if (totalSizeInMB > 4) {
                // showToaster(["Total file size should be less than 4 MB."], "error");
                setError('Total file size should be less than 4 MB.');
                return;
            }

            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                if (file.type !== 'application/pdf') {
                    setError("Only Pdf File upload")
                    return;
                }
                const fileReader = new FileReader();
                fileReader.onload = (e) => {
                    const base64String = e.target?.result as string;
                    const existingFileIndex = fileData.findIndex((f) => f.flnm === file.name);
                    if (existingFileIndex === -1) {
                        setFileData((prevFileData) => [
                            ...prevFileData,
                            { flnm: file.name, flst: base64String },
                        ]);
                    } else {
                        setError('File already uploaded not allow to upload duplicate file')
                        return;
                    }
                };
                fileReader.readAsDataURL(file);
            }
            setError('')

        }

    }





    const handleConsentFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileInput = event.target;
        const fileList = fileInput.files;
        const maxFileSizeKB = 250;

        if (fileList && fileList.length > 0) {
            const file = fileList[0];

            if (file.type !== 'application/pdf') {
                setConsentPdfError('Only PDF files are allowed.');
                return;
            }

            // Check file size
            const fileSizeKB = file.size / 1024; // Convert bytes to KB
            if (fileSizeKB > maxFileSizeKB) {
                setConsentPdfError('File size should be up to 250 KB.');
                return;
            }

            const fileName = file.name;
            const fileNameRegex = /^[a-zA-Z0-9_.-]+\.pdf$/; // Valid file name pattern
            if (!fileNameRegex.test(fileName)) {
                setConsentPdfError('File name should not contain special characters, spaces, or multiple dots.');
                return;
            }

            // Check for duplicate files
            if (consentfileData.some((f) => f.flnm === file.name)) {
                setConsentPdfError('File already uploaded. Duplicate files are not allowed.');
                return;
            }

            // Reset error message if file is valid
            setConsentPdfError('');

            // Clear existing file data before uploading new one
            setConsentFileData([]);

            // Read file and convert to base64
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const base64String = e.target?.result as string;
                const cleanedBase64 = base64String.split(',')[1];

                setConsentFileData([{ flnm: file.name, flst: cleanedBase64 }]);

                // **Reset file input to allow re-uploading the same file**
                fileInput.value = "";
            };
            fileReader.readAsDataURL(file);
        }
    };

    const handleFileConsentDelete = (fileName: string) => {
        setConsentFileData((prevFileData) => prevFileData.filter(file => file.flnm !== fileName));
    };

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
    const [hcfId, setHcfId] = useState<string>("")

    const HandleValidateConsentClick = async () => {
        let consent_no = ''

        let api: string = state.textDts;
        consent_no = getFldValue(api, 'stscnstno');
        let cmpid = getCmpId() || "";
        let usernm = getUsrnm() || "";
        let hcfid = hcfId ? hcfId : ''
        // let consent_no = consentNumber ? consentNumber : ''

        let consent_files = ''
        let payload: any = postLinux(cmpid + '=' + usernm + '=' + hcfid + '=' + consent_no + '=' + consent_files, 'hcf_consent_update');
        payload['consent_files'] = consentfileData ? consentfileData : [];
        return nrjAxiosRequestBio("update_hcf_consent", payload);
    };

    const svdValidate = (dataC: any) => {

        // refetchW();
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        let dt: any = GetResponseLnx(dataC)
        if (dt.dt_exp) {

            const userConsentDetails = {
                consentNumber: dt.consent_no,
                consentFrmDate: dt.dt_app,
                consentToDate: dt.dt_exp,
                consentflnm: dt.flnm,
                consentflPath: dt.doc_path,

                // other fields...
            };

            localStorage.setItem('hcconsentdetails', JSON.stringify(userConsentDetails));
            showToaster(["Consent was successfully validated."], 'success');
            // dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_app][${dt.dt_app}=dt_exp][${dt.dt_exp}` })
            // dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_app][${dt.dt_app}=dt_exp][${dt.dt_exp}` })
            // dispatch({ type: ACTIONS.SETFORM_DATA, payload: dt })
            if (dt.doc_path && dt.flnm) {
                setShowConsentPdfFilePath(dt.doc_path)
                setShowConsentPdfFileName(dt.flnm)
            } else {
                setShowConsentPdfFilePath([])
                setShowConsentPdfFileName([])
            }
            setConsentNumber(dt.consent_no ? dt.consent_no : '')
            // setConsentFromDt(dt.dt_app ? dt.dt_app : '')
            // setConsentToDt(dt.dt_exp ? dt.dt_exp : '')
            // // dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_app][${dt.dt_app}=dt_exp][${dt.dt_exp}` })
            // setConstDisbld(true)
            // setTimeout(() => {
            //     refetchHcfData();
            // },100)

        }
        else {
            if (dt.status == 'Failed')
                showToaster([dt.message], 'error')
            // setConsentFromDt('')
            // setConsentToDt('')
            setShowConsentPdfFilePath([])
            setShowConsentPdfFileName([])
            // setConsentFileData([])
            let val = ' '
            // dispatch({ type: ACTIONS.FORM_DATA, payload: `stscnstno][${val}` })
            // setConsentNumber('')
        }
    }

    const { data: consentData, refetch: consentValidate } = useQuery({
        queryKey: ['svValidate', state.mainId, state.rndm],
        queryFn: HandleValidateConsentClick,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: svdValidate,
    });




    const ClickConsentValidate = () => {
        let enterNobd: string = getFldValue(state.textDts, 'nobd');
        let api: string = state.textDts;
        let consent_no = getFldValue(api, 'stscnstno');
        // Check if consentNumber is provided
        if (!consent_no) {
            showToaster(["Enter Consent Number"], 'error')
            return;
        }

        // Convert nobd to a number
        const nobdValue = Number(enterNobd);

        if (consent_no && nobdValue >= 30) {
            // Check if fileData is empty when nobd is 30 or above
            if (fileData.length === 0) {

                showToaster(["Please attach a PDF file."], 'error')
                return;
            } else {
                consentValidate();
            }
        }

        // If nobd is below 30 or if it is 30 or above and the file is attached, call consentValidate
        if (nobdValue < 30 && consent_no) {
            consentValidate();
        }
    };

    useEffect(() => {
        checkPdfFileCount()
    }, [fileData, showMomPdfFile])

    function checkPdfFileCount() {
        if (showMomPdfFile.length > 4) {
            setMomPdfError('The maximum Number of uploaded PDF files allowed is 4.');
            // showToaster(["The maximum Number of uploaded PDF files allowed is 4."], "error");
            return;
        }
        if (fileData.length > 4) {
            setError('The maximum Number of uploaded PDF files allowed is 4.')
            // showToaster(["The maximum Number of uploaded PDF files allowed is 4."], "error");
            return;

        }
        else {
            setMomPdfError('')
            setError('')
        }
    }




    const handleDeleteMomFile = (index: number) => {
        const updatedFiles = [...showMomPdfFile];
        updatedFiles.splice(index, 1);
        setShowMomPdfFile(updatedFiles);
    };

    const handleDeleteFile = (index: number) => {
        const updatedFiles = [...fileData];
        updatedFiles.splice(index, 1);
        setFileData(updatedFiles);
    };


    function returnDisabled() {
        let disabeled: boolean = true
        if (captiveValue && isHcfLogin) {
            disabeled = false
            return disabeled
        } else if (!isHcfLogin) {
            disabeled = true
            return disabeled
        } else {
            return disabeled
        }
    }

    // function retutnDisabeledForVehicle() {
    //     let disabeled: boolean = false
    //     if (captiveValue && isHcfLogin) {
    //         disabeled = true
    //         return disabeled
    //     } else {
    //         disabeled = false
    //         return disabeled
    //     }
    // }

    function returnNumberOfBedDisabled() {
        let disabeled: boolean = false
        if (isHcfLogin) {
            disabeled = false
        } else {
            disabeled = true
            return disabeled
        }
    }

    const reqFldsForFirstTab = [
        { fld: 'authdt_exp', chck: '1[length]', msg: 'Enter Valid Date ' },
        { fld: 'dt_exp', chck: '1[length]', msg: 'Enter Valid Date ' },
        { fld: 'licdt_exp', chck: '1[length]', msg: 'Enter Valid Date ' },
        { fld: 'authnm', msg: 'Enter Name of Authorized Person', chck: '1[length]' },
        { fld: 'hcfnm', msg: 'Enter Name of HCF', chck: '1[length]' },
        { fld: 'addc', chck: '1[length]', msg: 'Address for Correspondence ' },
        { fld: 'addf', chck: '1[length]', msg: 'Address of Facility' },
        { fld: 'urlweb', chck: '1[length]', msg: 'Enter URL of Website' },
        { fld: 'gpscordlat', chck: '1[length]', msg: 'GPS coordinates of HCF' },
        { fld: 'gpscordlong', chck: '1[length]', msg: 'GPS coordinates of HCF' },
        { fld: 'ownhcf', chck: '1[length]', msg: 'Ownership of HCF' },
        { fld: 'telno', chck: '[mob]', msg: 'Enter Valid Tel. Number' },
        // { fld: 'fxno', chck: '1[length]', msg: 'Enter Valid Fax Number' },
        { fld: 'eml', chck: '[email]', msg: 'Enter E-mail ID ' },
        { fld: 'stsauth', chck: '1[length]', msg: 'Enter Status of Authorization under' },
        { fld: 'stscnstno', chck: '1[length]', msg: 'Enter Status of Consent Number' },
        { fld: 'dt_exp', chck: '1[length]', msg: 'Enter Status of Consents under Water Act and Air Act' },
        { fld: 'licno', chck: '1[length]', msg: 'Enter License Number of HCF' },
        { fld: 'nonbdid', chck: '1[length]', msg: 'Non-bedded health care facility ' },
        { fld: 'hcftypeid', chck: '1[length]', msg: 'Select HCF Type ' },

        // { fld: 'phn', chck: '[mob]', msg: 'Date of Expiry' },
    ];

    const reqFldsForSecondTab = [
        // { fld: 'nobd', chck: '1[length]', msg: 'Enter Number of Beds' },

        { fld: 'licno', chck: '1[length]', msg: 'License Number' },
        { fld: 'ylwqnt', chck: '1[length]', msg: 'Enter Yellow Category' },
        { fld: 'redqnt', chck: '1[length]', msg: 'Enter Red Category' },
        { fld: 'whtqnt', chck: '1[length]', msg: 'Enter White Category' },
        { fld: 'blqnt', chck: '1[length]', msg: 'Enter Blue Category' },
        { fld: 'slqnt', chck: '1[length]', msg: 'Enter General Solid Category' },




    ]
    const reqFldsForThirdTab = [
        // { fld: 'nobd', chck: '1[length]', msg: 'Enter Number of Beds' },
        { fld: 'mngmntcomid', chck: '1[length]', msg: 'Please select waste management committee option' },
        { fld: 'train', chck: '1[length]', msg: 'Enter number of trainings conducted on BMW management.' },
        { fld: 'prstrain', chck: '1[length]', msg: 'Enter number of Personnel Trained.' },
        { fld: 'timeind', chck: '1[length]', msg: 'Enter number of Personnel Trained at the time of induction.' },
        { fld: 'notrain', chck: '1[length]', msg: 'Enter number of personnel not undergone any training so far.' },
        { fld: 'whrtarin', chck: '1[length]', msg: 'Enter whether standard manual for training is available?.' },
        { fld: 'accd', chck: '1[length]', msg: 'Enter number of accidents occurred.' },
        { fld: 'prsaff', chck: '1[length]', msg: 'Enter number of the persons affected.' },
        { fld: 'remedialid', chck: '1[length]', msg: 'Enter Remedial action taken.' },
        { fld: 'ftlity', chck: '1[length]', msg: 'Enter any fatality occurred.' },
        { fld: 'onlemid', chck: '1[length]', msg: 'Enter stack monitoring.' },
        { fld: 'liqwstid', chck: '1[length]', msg: 'Enter liquid waste generated.' },
        { fld: 'trtefflnt', chck: '1[length]', msg: 'Enter number of times treated effluent.' },
        { fld: 'notmettrtefflnt', chck: '1[length]', msg: 'Enter could not met the standards out of no. of times treated effluent.' },
        { fld: 'disimthid', chck: '1[length]', msg: 'Enter disinfection method or sterilization meeting.' },
        { fld: 'ntmetsta', chck: '1[length]', msg: 'Enter have not met the standards in a year.' },
    ]


    const [capacityIncVldtion, setCapacityIncVldtion] = useState('')
    const [capacityPlaVldtion, setCapacityPlaVldtion] = useState('')
    const [capacityAutoVldtion, setCapacityAutoVldtion] = useState('')
    const [capacityHydroVldtion, setCapacityHydroVldtion] = useState('')
    const [capacityHydVldtion, setCapacityHydVldtion] = useState('')
    const [capacityShrVldtion, setCapacityShrVldtion] = useState('')
    const [capacityDeepVldtion, setCapacityDeepVldtion] = useState('')
    const [capacityAnyVldtion, setCapacityAnyVldtion] = useState('')
    const [pdfError, setPdfError] = useState('')
    const fieldValuesRef = useRef<{
        inccap: string,
        incanm: string,
        placap: string,
        plaanm: string,
        autoclcap: string,
        autoclanm: string,
        hydrocap: string,
        hydroanm: string,
        hydrcap: string,
        hydranm: string,
        shrcap: string,
        shranm: string,
        deepcap: string,
        deepanm: string,
        anyothrcap: string,
        anyothranm: string
    }>({
        inccap: "",
        incanm: "",
        placap: "",
        plaanm: "",
        autoclcap: "",
        autoclanm: "",
        hydrocap: "",
        hydroanm: "",
        hydrcap: "",
        hydranm: "",
        shrcap: "",
        shranm: "",
        deepcap: "",
        deepanm: "",
        anyothrcap: "",
        anyothranm: ""
    });



    const validateInccap = (data: string) => {
        let capacity = getFldValue(data, 'inccap');
        setCapacityIncVldtion(capacity);
        fieldValuesRef.current.inccap = capacity;
    };
    const validateIncanm = (data: string) => {
        let quantity = getFldValue(data, 'incanm'); // Assuming the same 'inccap' field for quantity
        if (Number(fieldValuesRef.current.inccap) < Number(quantity)) {
            showToaster(['Incinerators Quantity treated is not greater than capacity'], 'error');
            return false;
        }
        return true;
    };

    const validatePlacap = (data: string) => {
        let capacity = getFldValue(data, 'placap');
        setCapacityPlaVldtion(capacity);
        fieldValuesRef.current.placap = capacity;
    };
    const validatePlaanm = (data: string) => {
        let quantity = getFldValue(data, 'plaanm'); // Assuming the same 'inccap' field for quantity
        if (Number(fieldValuesRef.current.placap) < Number(quantity)) {
            showToaster(['Plasma pyrolysis Quantity treated is not greater than capacity'], 'error');
            return false;
        }
        return true;
    };

    const validateAutocap = (data: string) => {
        let capacity = getFldValue(data, 'autoclcap');
        setCapacityAutoVldtion(capacity);
        fieldValuesRef.current.autoclcap = capacity;
    };
    const validateAutoanm = (data: string) => {
        let quantity = getFldValue(data, 'autoclanm'); // Assuming the same 'inccap' field for quantity
        if (Number(fieldValuesRef.current.autoclcap) < Number(quantity)) {
            showToaster([' Autoclaves Quantity treated is not greater than capacity'], 'error');
            return false;
        }
        return true;
    };

    const validateHydrocap = (data: string) => {
        let capacity = getFldValue(data, 'hydrocap');
        setCapacityHydroVldtion(capacity);
        fieldValuesRef.current.hydrocap = capacity;
    };
    const validateHydroanm = (data: string) => {
        let quantity = getFldValue(data, 'hydroanm'); // Assuming the same 'inccap' field for quantity
        if (Number(fieldValuesRef.current.hydrocap) < Number(quantity)) {
            showToaster(['Microwave Quantity treated is not greater than capacity'], 'error');
            return false;
        }
        return true;
    };

    const validateHydcap = (data: string) => {
        let capacity = getFldValue(data, 'hydrcap');
        setCapacityHydVldtion(capacity);
        fieldValuesRef.current.hydrcap = capacity;
    };
    const validateHydanm = (data: string) => {
        let quantity = getFldValue(data, 'hydranm'); // Assuming the same 'inccap' field for quantity
        if (Number(fieldValuesRef.current.hydrcap) < Number(quantity)) {
            showToaster(['Hydroclave Quantity treated is not greater than capacity'], 'error');
            return false;
        }
        return true;
    };

    const validateShrcap = (data: string) => {
        let capacity = getFldValue(data, 'shrcap');
        setCapacityShrVldtion(capacity);
        fieldValuesRef.current.shrcap = capacity;
    };
    const validateShranm = (data: string) => {
        let quantity = getFldValue(data, 'shranm'); // Assuming the same 'inccap' field for quantity
        if (Number(fieldValuesRef.current.shrcap) < Number(quantity)) {
            showToaster(['Shredder Quantity treated is not greater than capacity'], 'error');
            return false;
        }
        return true;
    };

    const validateDeepcap = (data: string) => {
        let capacity = getFldValue(data, 'deepcap');
        setCapacityDeepVldtion(capacity);
        fieldValuesRef.current.deepcap = capacity;
    };
    const validateDeepanm = (data: string) => {
        let quantity = getFldValue(data, 'deepanm'); // Assuming the same 'inccap' field for quantity
        if (Number(fieldValuesRef.current.deepcap) < Number(quantity)) {
            showToaster(['Deep burial pits Quantity treated is not greater than capacity'], 'error');
            return false;
        }
        return true;
    };

    const validateAnyOthrcap = (data: string) => {
        let capacity = getFldValue(data, 'anyothrcap');
        setCapacityAnyVldtion(capacity);
        fieldValuesRef.current.anyothrcap = capacity;
    };
    const validateAnyOthranm = (data: string) => {
        let quantity = getFldValue(data, 'anyothranm'); // Assuming the same 'inccap' field for quantity
        if (Number(fieldValuesRef.current.anyothrcap) < Number(quantity)) {
            showToaster(['Any other treatment equipment Quantity treated is not greater than capacity'], 'error');
            return false;
        }
        return true;
    };

    const validationMap: { [key: string]: (data: string) => boolean | void } = {
        'inccap': validateInccap,
        'incanm': validateIncanm,
        'placap': validatePlacap,
        'plaanm': validatePlaanm,
        'autoclcap': validateAutocap,
        'autoclanm': validateAutoanm,
        'hydrocap': validateHydrocap,
        'hydroanm': validateHydroanm,
        'hydrcap': validateHydcap,
        'hydranm': validateHydanm,
        'shrcap': validateShrcap,
        'shranm': validateShranm,
        'deepcap': validateDeepcap,
        'deepanm': validateDeepanm,
        'anyothrcap': validateAnyOthrcap,
        'anyothranm': validateAnyOthranm,

    };


    const clearFieldValues = (): void => {
        fieldValuesRef.current = {
            inccap: "",
            incanm: "",
            placap: "",
            plaanm: "",
            autoclcap: "",
            autoclanm: "",
            hydrocap: "",
            hydroanm: "",
            hydrcap: "",
            hydranm: "",
            shrcap: "",
            shranm: "",
            deepcap: "",
            deepanm: "",
            anyothrcap: "",
            anyothranm: ""
        };
        setCapacityIncVldtion('')
        setCapacityPlaVldtion('')
        setCapacityAutoVldtion('')
        setCapacityHydroVldtion('')
        setCapacityHydVldtion('')
        setCapacityShrVldtion('')
        setCapacityDeepVldtion('')
        setCapacityAnyVldtion('')

    }


    const clearValOnNonCap = (state: any) => {

    }

    const onChangeYear = (year: number) => {
        setSelectedYear(year); // Update the local state with the selected year
        // You can also dispatch other actions if needed here
        let select_year_val: any = year
        setYear(select_year_val)
        if (select_year_val == '') {
            setYear('')
            dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
            setShowMomPdfFile([])
            setFileData([])
        }
    };
    const [disCapQua, setDisCapQua] = useState(true)
    const [showNonBedHcf, setShowNonbedHcf] = useState(false)

    const [disPlasCapQua, setDisPlasCapQua] = useState(false)
    const [inc, setInc] = useState(false);
    const [anyothr, setAnyothr] = useState(false);
    const [chem, setChem] = useState(false);
    const [deep, setDeep] = useState(false);
    const [sharp, setSharp] = useState(false);
    const [needle, setNeedle] = useState(false);
    const [shra, setShra] = useState(false);
    const [hydra, setHydra] = useState(false);
    const [autocl, setAutocl] = useState(false);
    const [micro, setMicro] = useState(false);

    const onChangeDts = (data: string) => {
        let fld: any = utilities(2, data, "");

        dispatch({ type: ACTIONS.FORM_DATA, payload: data });

        if (fld == 'dt_yearid') {
            let select_year_val: any = getFldValue(data, 'dt_yearid').split('|')[0]
            setYear(getFldValue(data, 'dt_yearid').split('|')[0])
            if (select_year_val == '') {
                setYear('')
                dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
                setShowMomPdfFile([])
                setFileData([])
            }
        }
        if (fld == 'ownhcfid') {
            let hcf = getFldValue(data, 'ownhcfid').split('|')[1]
            if (hcf == 'Any Other') {
                setOwnerHcfSelect(hcf)
            } else {
                setOwnerHcfSelect("")
            }

        }
        // if (fld == 'nonbdid') {
        //     let hcfType = (getFldValue(data, 'nonbdid').split('|')[1])
        //     if ((hcfType !== 'Bedded Hospital') && (hcfType !== 'Nursing Home')) {
        //         setHcfTypeSelect(false)
        //     } else {
        //         setHcfTypeSelect(true)
        //     }

        // }

        if (fld == 'hcftypeid') {
            let hcfType = (getFldValue(data, 'hcftypeid').split('|')[1])
            if ((hcfType !== 'Non-bedded')) {
                setShowNonbedHcf(false)
            } else {
                setShowNonbedHcf(true)

            }

        }
        if (fld == 'gpscordlat' || fld == 'gpscordlong') {
            let cordinatVal = getFldValue(data, 'gpscordlat')
            if (cordinatVal.includes('.')) {
                let partOne = cordinatVal.split('.')[0]
                if (partOne.length !== 2) {
                    showToaster(['Invalid input! Ensure no more than 2 digits before the decimal and up to 4 digits after the decimal like "13.7896".'], 'error')
                    return;
                }
            }

        }


        if (fld == 'mngmntcomid') {
            let val = getFldValue(data, 'mngmntcomid').split('|')[1]
            if (val && val == "Yes") {
                setCommitteeVal(true)
            } else {
                setCommitteeVal(false)
                setShowMomPdfFile([])
            }
        }
        if (fld == 'remedialid') {
            let val = getFldValue(data, 'remedialid').split('|')[1]
            if (val && val == "Yes") {
                setRemedVal(true)
            } else {
                setRemedVal(false)
                setFileData([])
            }
        }
        if (validationMap[fld]) {
            const isValid = validationMap[fld](data);
            if (isValid === false) return;
        }

        // if (fld === 'pla') {
        //     let val = getFldValue(data, fld);
        //     setDisPlasCapQua(val === '0')
        // }
        // else if (fld === 'inc') {
        //     let val = getFldValue(data, fld);
        //     setInc(val === '0');
        // } else if (fld === 'anyothr') {
        //     let val = getFldValue(data, fld);
        //     setAnyothr(val === '0');
        // } else if (fld === 'chem') {
        //     let val = getFldValue(data, fld);
        //     setChem(val === '0');
        // } else if (fld === 'deep') {
        //     let val = getFldValue(data, fld);
        //     setDeep(val === '0');
        // } else if (fld === 'sharp') {
        //     let val = getFldValue(data, fld);
        //     setSharp(val === '0');
        // } else if (fld === 'needle') {
        //     let val = getFldValue(data, fld);
        //     setNeedle(val === '0');
        // } else if (fld === 'shr') {
        //     let val = getFldValue(data, fld);
        //     setShra(val === '0');
        // } else if (fld === 'hydr') {
        //     let val = getFldValue(data, fld);
        //     setHydra(val === '0');
        // } else if (fld === 'autocl') {
        //     let val = getFldValue(data, fld);
        //     setAutocl(val === '0');
        // }
        // else if (fld === 'micro') {
        //     let val = getFldValue(data, fld);
        //     setMicro(val === '0');
        // }

        const fieldSetters: Record<string, React.Dispatch<React.SetStateAction<boolean>>> = {
            pla: setDisPlasCapQua,
            inc: setInc,
            anyothr: setAnyothr,
            chem: setChem,
            deep: setDeep,
            sharp: setSharp,
            needle: setNeedle,
            shr: setShra,
            hydr: setHydra,
            autocl: setAutocl,
            micro: setMicro,
        };

        if (fld in fieldSetters) {
            fieldSetters[fld](getFldValue(data, fld) === '0');
        }
        if (fld == 'onlemid') {
            let val = getFldValue(data, 'onlemid').split('|')[1]
            if (val == "Yes") {
                setEmission(true)
            } else {
                setEmission(false)
            }
        }


    };

    function checkQuantitAndGeneratedVal() {
        //this function check multiple fields sum validation
        let fieldOne: string = 'ylwqnt#redqnt#whtqnt#blqnt';
        let fieldTwo: string = 'incanm#plaanm#autoclanm#hydroanm#hydranm#shranm#sharpanm#deepanm#chemanm#anyothranm';
        let values: string = state.textDts ? state.textDts : ''
        if (!values.includes(data)) {
            let sumOne = check_multiplesum_validation(fieldOne, values)
            let sumTwo = check_multiplesum_validation(fieldTwo, values)
            if (sumOne && sumOne < sumTwo) {
                showToaster(['The quantity treated or disposed of cannot be greater than the quantity of waste generated.'], 'error');
                return
            }

        }

    }

    const SaveClick = () => {
        let api: string = state.textDts;
        let msg: string[] = [];

        if (consentNumber === '') {
            showToaster(["Without the consent Number, you can't submit the annual report. Make sure to fill it in first"], 'error');
            return;
        }
        for (const field in validationMap) {
            const isValid = validationMap[field](api);
            if (isValid === false) {
                showToaster(["In Captive Treatment (4.2), the quantity treated should not exceed the capacity."], 'error');
                return;
            }
        }

        if (tabValue == '1') {
            msg = validForm(api, reqFldsForFirstTab);
            showToaster(msg, 'error');
        }
        if (tabValue == '2') {
            msg = validForm(api, reqFldsForSecondTab);
            showToaster(msg, 'error');
        }
        if (tabValue == '3') {
            msg = validForm(api, reqFldsForThirdTab);
            showToaster(msg, 'error');
        }

        if (msg && msg[0]) {
            if (tabValue == '1') {
                control_focus(msg[0], reqFldsForFirstTab)
            }
            if (tabValue == '2') {
                control_focus(msg[0], reqFldsForSecondTab)
            }
            if (tabValue == '3') {
                control_focus(msg[0], reqFldsForThirdTab)
            }
            dispatch({ type: ACTIONS.CHECK_REQ, payload: msg });
            setTimeout(function () {
                dispatch({ type: ACTIONS.CHECK_REQDONE, payload: 1 });
            }, 2500);
            return;
        }
        // this function check multiple fields sum validation 
        checkQuantitAndGeneratedVal()
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        refetch();

    };





    const HandleSaveClick = async () => {

        // this code check multiple fields sum validation 
        checkQuantitAndGeneratedVal()
        let formData: any = '';
        formData = state.textDts;
        formData = convertFldValuesToJson(formData);
        if (formData['docfiles_mom'] == "" || formData['docfiles'] == "" || formData['consent_files'] == "" || formData['docfilesAuth'] == "") {
            formData['docfiles_mom'] = [];
            formData['docfiles'] = []
            formData['consent_files'] = [];
            formData['docfilesAuth'] = []
        }
        if (tabValue == "1") {
            formData['authnm'] = formData['authnm'] ? formData['authnm'] : 'NA';
            formData['hcfnm'] = formData['hcfnm'] ? formData['hcfnm'] : 'NA';
            formData['addc'] = formData['addc'] ? formData['addc'] : 'NA';
            formData['telno'] = formData['telno'] ? formData['telno'] : '0';
            formData['fxno'] = formData['fxno'] ? formData['fxno'] : '0';
            formData['eml'] = formData['eml'] ? formData['eml'] : 'NA';
            formData['urlweb'] = formData['urlweb'] ? formData['urlweb'] : 'NA';
            formData['gpscordlat'] = formData['gpscordlat'] ? formData['gpscordlat'] : 'NA';
            formData['gpscordlong'] = formData['gpscordlong'] ? formData['gpscordlong'] : 'NA';
            formData['ownhcfid'] = ownerHcfSelect == "Any Other" ? (formData['sltother'] ? formData['sltother'] : '0') : (formData['ownhcfid'] ? formData['ownhcfid'] : '0');
            formData['stsauth'] = formData['stsauth'] ? formData['stsauth'] : 'NA';
            formData['stscnstno'] = formData['stscnstno'] ? formData['stscnstno'] : 'NA';
            formData['dt_exp'] = formData['dt_exp'] ? formData['dt_exp'] : '0';
            formData['authdt_exp'] = formData['authdt_exp'] ? formData['dt_exp'] : '0';
            formData['licdt_exp'] = formData['licdt_exp'] ? formData['licdt_exp'] : '0';
            formData['nobd'] = formData['nobd'] ? formData['nobd'] : '0';
            formData['licno'] = formData['licno'] ? formData['licno'] : '0';
            formData['nonbdid'] = formData['nonbdid'] ? formData['nonbdid'] : '0';
            formData['hcftypeid'] = formData['hcftypeid'] ? formData['hcftypeid'] : '0';
            formData['docfilesAuth'] = fileAuth ? fileAuth : [];
            formData['consent_files'] = consentfileData ? consentfileData : [];
            formData['stscnstno'] = formData['stscnstno'] ? formData['stscnstno'] : '0';
        } if (tabValue == '2') {
            formData['authnm'] = formData['authnm'] ? formData['authnm'] : 'NA';
            formData['hcfnm'] = formData['hcfnm'] ? formData['hcfnm'] : 'NA';
            formData['addc'] = formData['addc'] ? formData['addc'] : 'NA';
            formData['telno'] = formData['telno'] ? formData['telno'] : '0';
            formData['fxno'] = formData['fxno'] ? formData['fxno'] : '0';
            formData['eml'] = formData['eml'] ? formData['eml'] : 'NA';
            formData['urlweb'] = formData['urlweb'] ? formData['urlweb'] : 'NA';
            formData['gpscordlat'] = formData['gpscordlat'] ? formData['gpscordlat'] : 'NA';
            formData['gpscordlong'] = formData['gpscordlong'] ? formData['gpscordlong'] : 'NA';
            formData['ownhcfid'] = ownerHcfSelect == "Any Other" ? (formData['sltother'] ? formData['sltother'] : '0') : (formData['ownhcfid'] ? formData['ownhcfid'] : '0');
            formData['stsauth'] = formData['stsauth'] ? formData['stsauth'] : 'NA';
            formData['stscnstno'] = formData['stscnstno'] ? formData['stscnstno'] : 'NA';
            formData['dt_exp'] = formData['dt_exp'] ? formData['dt_exp'] : '0';
            formData['authdt_exp'] = formData['authdt_exp'] ? formData['dt_exp'] : '0';
            formData['licdt_exp'] = formData['licdt_exp'] ? formData['licdt_exp'] : '0';
            formData['nobd'] = formData['nobd'] ? formData['nobd'] : '0';
            formData['licno'] = formData['licno'] ? formData['licno'] : '0';
            formData['nonbdid'] = formData['nonbdid'] ? formData['nonbdid'] : '0';
            formData['hcftypeid'] = formData['hcftypeid'] ? formData['hcftypeid'] : '0';
            formData['ylwqnt'] = formData['ylwqnt'] ? formData['ylwqnt'] : '0';
            formData['redqnt'] = formData['redqnt'] ? formData['redqnt'] : '0';
            formData['whtqnt'] = formData['whtqnt'] ? formData['whtqnt'] : '0';
            formData['blqnt'] = formData['blqnt'] ? formData['blqnt'] : '0';
            formData['slqnt'] = formData['slqnt'] ? formData['slqnt'] : 'NA';
            formData['size'] = formData['size'] ? formData['size'] : '0';
            formData['cap'] = formData['cap'] ? formData['cap'] : '0';
            formData['captiveOption'] = captiveValue ? captiveValue == true ? 1 : 0 : 0;

            formData['provid'] = formData['provid'] ? formData['provid'] : 'NA';
            formData['pla'] = formData['pla'] ? formData['pla'] : '0';
            formData['placap'] = formData['placap'] ? formData['placap'] : '0';
            formData['plaanm'] = formData['plaanm'] ? formData['plaanm'] : '0';
            formData['autocl'] = formData['autocl'] ? formData['autocl'] : '0';
            formData['autoclcap'] = formData['autoclcap'] ? formData['autoclcap'] : '0';
            formData['autoclanm'] = formData['autoclanm'] ? formData['autoclanm'] : '0';

            formData['inc'] = formData['inc'] ? formData['inc'] : '0';
            formData['inccap'] = formData['inccap'] ? formData['inccap'] : '0';
            formData['incanm'] = formData['incanm'] ? formData['incanm'] : '0';
            formData['hydr'] = formData['hydr'] ? formData['hydr'] : '0';
            formData['hydrcap'] = formData['hydrcap'] ? formData['hydrcap'] : '0';
            formData['hydranm'] = formData['hydranm'] ? formData['hydranm'] : '0';
            formData['shr'] = formData['shr'] ? formData['shr'] : '0';
            formData['shrcap'] = formData['shrcap'] ? formData['shrcap'] : '0';
            formData['hydro'] = formData['hydro'] ? formData['hydro'] : '0';
            formData['hydrocap'] = formData['hydrocap'] ? formData['hydrocap'] : '0';
            formData['hydroanm'] = formData['hydroanm'] ? formData['hydroanm'] : '0';

            formData['shranm'] = formData['shranm'] ? formData['shranm'] : '0';
            formData['needle'] = formData['needle'] ? formData['needle'] : '0';
            formData['needleanm'] = formData['needleanm'] ? formData['needleanm'] : '0';
            formData['sharp'] = formData['sharp'] ? formData['sharp'] : '0';
            formData['sharpanm'] = formData['sharpanm'] ? formData['sharpanm'] : '0';
            formData['deep'] = formData['deep'] ? formData['deep'] : '0';
            formData['deepcap'] = formData['deepcap'] ? formData['deepcap'] : '0';
            formData['deepanm'] = formData['deepanm'] ? formData['deepanm'] : '0';

            formData['chem'] = formData['chem'] ? formData['chem'] : '0';
            formData['chemanm'] = formData['chemanm'] ? formData['chemanm'] : '0';
            formData['anyothr'] = formData['anyothr'] ? formData['anyothr'] : '0';
            formData['anyothrcap'] = formData['anyothrcap'] ? formData['anyothrcap'] : '0';
            formData['anyothranm'] = formData['anyothranm'] ? formData['anyothranm'] : '0';
            formData['recyclered'] = formData['recyclered'] ? formData['recyclered'] : '0';
            formData['recycleblue'] = formData['recycleblue'] ? formData['recycleblue'] : '0';
            // formData['noveh'] = formData['noveh'] ? formData['noveh'] : '0';
            formData['incire'] = formData['incire'] ? formData['incire'] : '0';

            formData['inciredispo'] = formData['inciredispo'] ? formData['inciredispo'] : '0';
            // formData['ash'] = formData['ash'] ? formData['ash'] : '0';
            // formData['ashdispo'] = formData['ashdispo'] ? formData['ashdispo'] : '0';
            formData['etpsl'] = formData['etpsl'] ? formData['etpsl'] : '0';
            formData['etpsldispo'] = formData['etpsldispo'] ? formData['etpsldispo'] : '0';
            formData['nmbio'] = formData['nmbio'] ? formData['nmbio'] : 'NA';
            // formData['lsthcf'] = formData['lsthcf'] ? formData['lsthcf'] : 'NA';
            // formData['mngmntcomid'] = formData['mngmntcomid'] ? formData['mngmntcomid'] : 'NA';
            formData['docfiles_mom'] = showMomPdfFile ? showMomPdfFile : [];
            formData['docfilesAuth'] = fileAuth ? fileAuth : []
            formData['consent_files'] = consentfileData ? consentfileData : [];
            formData['stscnstno'] = formData['stscnstno'] ? formData['stscnstno'] : '0';
        }
        if (tabValue == '3') {

            formData['authnm'] = formData['authnm'] ? formData['authnm'] : 'NA';
            formData['hcfnm'] = formData['hcfnm'] ? formData['hcfnm'] : 'NA';
            formData['addc'] = formData['addc'] ? formData['addc'] : 'NA';
            formData['telno'] = formData['telno'] ? formData['telno'] : '0';
            formData['fxno'] = formData['fxno'] ? formData['fxno'] : '0';
            formData['eml'] = formData['eml'] ? formData['eml'] : 'NA';
            formData['urlweb'] = formData['urlweb'] ? formData['urlweb'] : 'NA';
            formData['gpscordlat'] = formData['gpscordlat'] ? formData['gpscordlat'] : 'NA';
            formData['gpscordlong'] = formData['gpscordlong'] ? formData['gpscordlong'] : 'NA';
            formData['ownhcfid'] = ownerHcfSelect == "Any Other" ? (formData['sltother'] ? formData['sltother'] : '0') : (formData['ownhcfid'] ? formData['ownhcfid'] : '0');
            formData['stsauth'] = formData['stsauth'] ? formData['stsauth'] : 'NA';
            formData['stscnstno'] = formData['stscnstno'] ? formData['stscnstno'] : 'NA';
            formData['dt_exp'] = formData['dt_exp'] ? formData['dt_exp'] : '0';
            formData['authdt_exp'] = formData['authdt_exp'] ? formData['dt_exp'] : '0';
            formData['licdt_exp'] = formData['licdt_exp'] ? formData['licdt_exp'] : '0';
            formData['nobd'] = formData['nobd'] ? formData['nobd'] : '0';
            formData['licno'] = formData['licno'] ? formData['licno'] : '0';
            formData['nonbdid'] = formData['nonbdid'] ? formData['nonbdid'] : '0';
            formData['hcftypeid'] = formData['hcftypeid'] ? formData['hcftypeid'] : '0';
            formData['ylwqnt'] = formData['ylwqnt'] ? formData['ylwqnt'] : '0';
            formData['redqnt'] = formData['redqnt'] ? formData['redqnt'] : '0';
            formData['whtqnt'] = formData['whtqnt'] ? formData['whtqnt'] : '0';
            formData['blqnt'] = formData['blqnt'] ? formData['blqnt'] : '0';
            formData['slqnt'] = formData['slqnt'] ? formData['slqnt'] : 'NA';
            formData['size'] = formData['size'] ? formData['size'] : '0';
            formData['cap'] = formData['cap'] ? formData['cap'] : '0';

            formData['prov'] = formData['prov'] ? formData['prov'] : 'NA';
            formData['pla'] = formData['pla'] ? formData['pla'] : '0';
            formData['placap'] = formData['placap'] ? formData['placap'] : '0';
            formData['plaanm'] = formData['plaanm'] ? formData['plaanm'] : '0';
            formData['autocl'] = formData['autocl'] ? formData['autocl'] : '0';
            formData['autoclcap'] = formData['autoclcap'] ? formData['autoclcap'] : '0';
            formData['autoclanm'] = formData['autoclanm'] ? formData['autoclanm'] : '0';
            formData['captiveOption'] = captiveValue ? captiveValue == true ? 1 : 0 : 0;


            formData['inc'] = formData['inc'] ? formData['inc'] : '0';
            formData['inccap'] = formData['inccap'] ? formData['inccap'] : '0';
            formData['incanm'] = formData['incanm'] ? formData['incanm'] : '0';
            formData['hydr'] = formData['hydr'] ? formData['hydr'] : '0';
            formData['hydrcap'] = formData['hydrcap'] ? formData['hydrcap'] : '0';
            formData['hydranm'] = formData['hydranm'] ? formData['hydranm'] : '0';
            formData['shr'] = formData['shr'] ? formData['shr'] : '0';
            formData['shrcap'] = formData['shrcap'] ? formData['shrcap'] : '0';

            formData['shranm'] = formData['shranm'] ? formData['shranm'] : '0';
            formData['needle'] = formData['needle'] ? formData['needle'] : '0';
            formData['needleanm'] = formData['needleanm'] ? formData['needleanm'] : '0';
            formData['sharp'] = formData['sharp'] ? formData['sharp'] : '0';
            formData['sharpanm'] = formData['sharpanm'] ? formData['sharpanm'] : '0';
            formData['deep'] = formData['deep'] ? formData['deep'] : '0';
            formData['deepcap'] = formData['deepcap'] ? formData['deepcap'] : '0';
            formData['deepanm'] = formData['deepanm'] ? formData['deepanm'] : '0';

            formData['chem'] = formData['chem'] ? formData['chem'] : '0';
            formData['chemanm'] = formData['chemanm'] ? formData['chemanm'] : '0';
            formData['anyothr'] = formData['anyothr'] ? formData['anyothr'] : '0';
            formData['anyothrcap'] = formData['anyothrcap'] ? formData['anyothrcap'] : '0';
            formData['anyothranm'] = formData['anyothranm'] ? formData['anyothranm'] : '0';
            formData['recyclered'] = formData['recyclered'] ? formData['recyclered'] : '0';
            formData['recycleblue'] = formData['recycleblue'] ? formData['recycleblue'] : '0';
            // formData['noveh'] = formData['noveh'] ? formData['noveh'] : '0';
            formData['incire'] = formData['incire'] ? formData['incire'] : '0';

            formData['inciredispo'] = formData['inciredispo'] ? formData['inciredispo'] : '0';
            // formData['ash'] = formData['ash'] ? formData['ash'] : '0';
            // formData['ashdispo'] = formData['ashdispo'] ? formData['ashdispo'] : '0';
            formData['etpsl'] = formData['etpsl'] ? formData['etpsl'] : '0';
            formData['etpsldispo'] = formData['etpsldispo'] ? formData['etpsldispo'] : '0';
            formData['nmbio'] = formData['nmbio'] ? formData['nmbio'] : 'NA';
            // formData['lsthcf'] = formData['lsthcf'] ? formData['lsthcf'] : 'NA';
            formData['mngmntcomid'] = formData['mngmntcomid'] ? formData['mngmntcomid'] : 'NA';
            formData['docfiles_mom'] = showMomPdfFile ? showMomPdfFile : [];
            formData['train'] = formData['train'] ? formData['train'] : '0';
            formData['prstrain'] = formData['prstrain'] ? formData['prstrain'] : '0';
            formData['timeind'] = formData['timeind'] ? formData['timeind'] : '0';
            formData['notrain'] = formData['notrain'] ? formData['notrain'] : '0';
            formData['whrtarin'] = formData['whrtarin'] ? formData['whrtarin'] : 'NA';
            formData['otherinfo'] = formData['otherinfo'] ? formData['otherinfo'] : 'NA';
            formData['accd'] = formData['accd'] ? formData['accd'] : '0';
            formData['prsaff'] = formData['prsaff'] ? formData['prsaff'] : '0';
            formData['remedialid'] = formData['remedialid'] ? formData['remedialid'] : 'No';
            formData['ftlity'] = formData['ftlity'] ? formData['ftlity'] : 'NA';
            formData['stdair'] = formData['stdair'] ? formData['stdair'] : 'NA';
            formData['stckmontg'] = formData['stckmontg'] ? formData['stckmontg'] : 'NA';
            formData['stdairmet'] = formData['stdairmet'] ? formData['stdairmet'] : 'NA';
            formData['onlemi'] = formData['onlemi'] ? formData['onlemi'] : 'NA';
            formData['onlemid'] = formData['onlemid'] ? formData['onlemid'] : '0';
            formData['frqcali'] = formData['frqcali'] ? formData['frqcali'] : '0';
            formData['liqwstid'] = formData['liqwstid'] ? formData['liqwstid'] : '0';
            formData['trtefflnt'] = formData['trtefflnt'] ? formData['trtefflnt'] : 'NA';
            formData['notmettrtefflnt'] = formData['notmettrtefflnt'] ? formData['notmettrtefflnt'] : 'NA';
            formData['disimthid'] = formData['disimthid'] ? formData['disimthid'] : '0';
            formData['airplincid'] = formData['airplincid'] ? formData['airplincid'] : '0';
            formData['ntmetsta'] = formData['ntmetsta'] ? formData['ntmetsta'] : 'NA';
            formData['capcbwtf'] = formData['capcbwtf'] ? formData['capcbwtf'] : 'NA';
            formData['docfiles'] = fileData ? fileData : [];
            formData['docfilesAuth'] = fileAuth ? fileAuth : []
            formData['consent_files'] = consentfileData ? consentfileData : [];
            formData['stscnstno'] = formData['stscnstno'] ? formData['stscnstno'] : '0';

        }
        if (showPopup && tabValue == '3') {
            formData['ar_status'] = 'final_ar'
        } else {
            formData['ar_status'] = tabValue ? ((tabValue === '1' || tabValue === '2' || tabValue === '3') ? 'temp_ar' : 'final_ar') : '';
        }
        formData['cmpid'] = getCmpId() || "";
        formData['usrnm'] = getUsrnm() || "";
        formData['ar_year'] = year;
        formData['what'] = 'hcf_ar';
        return nrjAxiosRequestBio("AR_filing", formData);
    };


    const secondTabEnabeled = () => {
        setArryTab(prevArray => {
            const newArray = [...prevArray];
            newArray[1] = false;
            return newArray;
        });
    }


    const ThirdTabEnabeled = () => {
        setArryTab(prevArray => {
            const newArray = [...prevArray];
            newArray[2] = false;
            return newArray;
        });
    }

    const allFieldDisabeled = () => {
        setArryTab(prevArray => {
            const newArray = [...prevArray];
            newArray[0] = true;
            newArray[1] = true;
            newArray[2] = true;
            return newArray;
        });
    }

    const allFieldEnabeled = () => {
        setArryTab(prevArray => {
            const newArray = [...prevArray];
            newArray[0] = false;
            newArray[1] = false;
            newArray[2] = false;
            return newArray;
        });
    }


    const svdQry = (data: any) => {
        // refetchW();
        dispatch({ type: ACTIONS.DISABLE, payload: 1 })
        let dt: any = GetResponseLnx(data)
        if (dt.status == 'Success') {
            showToaster([dt.message], 'success');
            if (dt.message == 'AR saved temporarily') {
                if (tabValue == '1') {
                    secondTabEnabeled()
                    setIsSecondTabActive(true)
                    setIsThirdTabActive(false)
                    setIsFirstTabActive(false)
                    setTabValue('2')
                } if (tabValue == '2') {
                    ThirdTabEnabeled()
                    setIsThirdTabActive(true)
                    setIsSecondTabActive(false)
                    setIsFirstTabActive(false)
                    setTabValue('3')
                }
                if (tabValue == '3') {
                    setTimeout(() => {
                        setShowPopup(true);
                    }, 500);
                } else {
                    setShowPopup(false);
                }
            }
            if (dt.message == 'AR Successfully submitted') {
                setShowPopup(false);
                allFieldDisabeled()
                setShowDeletePdf(false)
            }
        }
        else {
            showToaster([dt.message], 'error')
            allFieldDisabeled();
            setShowDeletePdf(false);
        }
    }

    const { showToaster, hideToaster } = useToaster();

    const { data, refetch } = useQuery({
        queryKey: ['svQry', state.mainId, state.rndm],
        queryFn: HandleSaveClick,
        enabled: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: svdQry,
    })

    const clrFunct = () => {
        dispatch({ type: ACTIONS.TRIGGER_FORM, payload: 0 });
    }

    useEffectOnce(() => {
        nonBeeded();
        getProStorage()
    })


    const nonBeeded = () => {

        let i: number = 0;
        let nonBedded: string = "";

        let ary: any = [{ id: 1, ctg: 'Clinic' }, { id: 2, ctg: 'Pathology Laboratory' },
        // { id: 3, ctg: 'Nursing Home' },
        { id: 4, ctg: 'Blood Bank' },
        { id: 5, ctg: 'Dispensary' }, { id: 6, ctg: 'Animal House' }, { id: 7, ctg: 'Veterinary Hospital' }, { id: 8, ctg: 'Dental Hospital' },
        { id: 9, ctg: 'Institutions / Schools / Companies etc With first Aid Facilitites' }, { id: 10, ctg: 'Health Camp' },
        { id: 11, ctg: 'Homeopathy Hospital' }, { id: 12, ctg: 'Mobile Hospital' }, { id: 13, ctg: 'Siddha' }, { id: 14, ctg: 'Unani' },
        { id: 15, ctg: 'Yoga' },
            // { id: 16, ctg: 'Bedded Hospital' }
        ];
        let uniqueAry = new Map();

        if (Array.isArray(ary)) {
            ary.forEach((element: any) => {
                uniqueAry.set(element.id, element);
            });

            uniqueAry.forEach((value: any, keys: any) => {
                if (nonBedded) {
                    nonBedded += "$^";
                }
                nonBedded += "id][" + value["id"] + "=";
                nonBedded += "txt][" + value["ctg"];
            })

            while (i < uniqueAry?.entries.length) {
                i += 1;
            }
        }
        dispatch({ type: ACTIONS.SETNONBEDDED, payload: nonBedded });
        return;

    };



    const getProStorage = () => {

        let i: number = 0;
        let provStorage: string = "";

        let ary: any = [{ id: 1, ctg: 'Cold storage' }, { id: 2, ctg: 'Any Other' },];
        let uniqueAry = new Map();

        if (Array.isArray(ary)) {
            ary.forEach((element: any) => {
                uniqueAry.set(element.id, element);
            });

            uniqueAry.forEach((value: any, keys: any) => {
                if (provStorage) {
                    provStorage += "$^";
                }
                provStorage += "id][" + value["id"] + "=";
                provStorage += "txt][" + value["ctg"];
            })

            while (i < uniqueAry?.entries.length) {
                i += 1;
            }
        }
        dispatch({ type: ACTIONS.SET_PRO_STORAGE, payload: provStorage });
        return;

    };


    const [hcfData, setHcfData] = useState<any>()
    useEffectOnce(() => {
        if (!isHcfLogin) {
            let data: any = sessionStorage.getItem('hcfAnnlRpt');
            if (data) {
                data = JSON.parse(data)
                setFileData(data.docfiles)
                setShowMomPdfFile(data.docfiles_mom)
                let _data = convertFldValuesToString(data)

                dispatch({ type: ACTIONS.SETFORM_DATA, payload: _data });
            }
        } else {
            refetchB()
        }
    })
    const GetData = () => {
        if (isHcfLogin && year) {
            let cmpid = getCmpId() || "";
            let usrnm = getUsrnm() || "";
            let ar_year = year;
            let what = 'hcf_ar';
            let userLoginDetails: any = localStorage.getItem('hcflogindetails')
            let data = JSON.parse(userLoginDetails);
            setCheckConsentNo(data.data['consent_no'] ? data.data['consent_no'] : '')
            console.log(data)
            dispatch({ type: ACTIONS.FORM_DATA, payload: `hcfnm][${data.data['hcfnm']}` })
            if (year) {
                let payload: any = postLinux(ar_year + '=' + usrnm + '=' + cmpid + '=' + what, 'get_AR_filing');
                return nrjAxiosRequestBio("get_AR_filing", payload);
            }
        }
    };


    const calendarDisabled = () => {
        // this function check   report status for temprory or final submit 
        // if final submit  than calander  Disabled other wise enabled
        // if ar already submit than  date select disabled
        if (year !== '') {
            if (arstatus === 'temp_ar') {
                return false;
            }
            if (arstatus === 'final_ar') {
                return true;
            }
            else {
                if (datastatus === 'Failed') {
                    if (armessage == 'AR not submitted') {
                        return false
                    } else {
                        return false
                    }

                }

            }
        }
    }

    const saveButtonDisabled = () => {

        if (datastatus === 'Failed') {
            return false

        } else {
            if (arstatus == 'temp_ar') {
                return false
            } else {
                return true
            }

        }

    }


    useEffect(() => {
        // Function to determine if the calendar should be enabled or Disabled
        // when year change
        calendarDisabled()
        // this function  is when save button enabled or Disabled
        // if AR is finaly submit save button  Disabled otherwise enabled
        saveButtonDisabled()
    }, [year, arstatus, datastatus])

    const ShowData = (data: any) => {
        if (isHcfLogin) {
            if (data.data.status === 'Failed') {
                setDataStatus(data.data.status)
                setArMessage(data.data.message)
                setArStatus('')
                clrFunct()
                setFileData([])
                setShowMomPdfFile([])
                setShowDeletePdf(true)
                allFieldEnabeled()
                let userLoginDetails: any = localStorage.getItem('hcflogindetails')
                let data_loc = JSON.parse(userLoginDetails);
                if (data && data.data && data.data['hcfnm']) {
                    if (data.data['hcfnm'] == 'undefined') {
                        data.data['hcfnm'] = data_loc.data['hcfnm']
                    }
                } else {
                    data.data['hcfnm'] = data_loc.data['hcfnm']
                }

                dispatch({ type: ACTIONS.SETFORM_DATA, payload: `dt_yearid][${year}=dt_year][${year}=hcfnm][${data.data['hcfnm']}` })


            } else if (hcfData) {
                let textDts = convertFldValuesToString(hcfData);
                setFormData(textDts)
                dispatch({ type: ACTIONS.SETFORM_DATA, payload: textDts });

            } else {
                if (data.data.ar_status == 'temp_ar') {
                    setArStatus(data.data.ar_status)
                    if (data.data.captiveOption && data.data.captiveOption == 0) {
                        setCaptiveValue(false)
                    } else {
                        setCaptiveValue(true)
                    }
                    allFieldEnabeled()
                    setShowDeletePdf(true)
                    setArStatus(data.data.ar_status)
                    setArMessage('')
                } else {
                    if (data.data.captiveOption && data.data.captiveOption == 0) {
                        setCaptiveValue(false)
                    } else {
                        setCaptiveValue(true)
                    }
                    allFieldDisabeled();
                    setShowDeletePdf(false)
                    setArStatus(data.data.ar_status)
                    setArMessage('')
                }
                let textDts = ''
                if (data.data.docfiles) {
                    const { docfiles, ...restData } = data.data;
                    textDts = convertFldValuesToString(restData);
                    setFormData(textDts)
                    setFileData(data.data.docfiles)
                } if (data.data.docfiles_mom) {
                    const { docfiles_mom, ...restData } = data.data;
                    textDts = convertFldValuesToString(restData);
                    setFormData(textDts)
                    setShowMomPdfFile(data.data.docfiles_mom)
                } else {
                    textDts = convertFldValuesToString(data.data);
                    setFormData(textDts)
                    setShowMomPdfFile([])
                    setFileData([])
                }
                dispatch({ type: ACTIONS.SETFORM_DATA, payload: textDts });
            }
        }
    }

    const { data: datab, refetch: refetchB } = useQuery({
        queryKey: ["getQryHcf", year],
        queryFn: GetData,
        enabled: true,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        onSuccess: ShowData,
    });
    useEffectOnce(() => {
        if (isHcfLogin) {
            let userLoginDetails: any = localStorage.getItem('hcflogindetails')
            let data = JSON.parse(userLoginDetails);
            if (data) {
                dispatch({ type: ACTIONS.FORM_DATA, payload: `hcfnm][${data.data['hcfnm']}` })
                setHcfId(data.data.hcfid ? data.data.hcfid : '')
            }
        }

    })


    const handleOnTabChange = (event: React.SyntheticEvent, newValue: string) => {
        if (newValue == '1') {

            setIsFirstTabActive(true);
            setIsSecondTabActive(false);
            setIsThirdTabActive(false);
        }
        if (newValue == '2') {
            setIsSecondTabActive(true);
            setIsFirstTabActive(false);
            setIsThirdTabActive(false);
        }
        if (newValue == '3') {
            setIsThirdTabActive(true);
            setIsFirstTabActive(false);
            setIsSecondTabActive(false);
        }
        setTabValue(newValue);
    };

    const handleOnNext = (newValue: string) => {
        if (newValue === '1') {
            setIsFirstTabActive(false);
            setIsSecondTabActive(true);
            setIsThirdTabActive(false);
            setTabValue('2');
        } else if (newValue === '2') {
            setIsSecondTabActive(false);
            setIsThirdTabActive(true);
            setIsFirstTabActive(false);
            setTabValue('3');
        }
    };

    const handleOnBack = (newValue: string) => {
        if (newValue == '3') {
            setIsFirstTabActive(false);
            setIsSecondTabActive(true);
            setIsThirdTabActive(false);
            setTabValue('2')
        }
        else if (newValue == '2') {
            setIsSecondTabActive(false);
            setIsFirstTabActive(true);
            setIsThirdTabActive(false);
            setTabValue('1')
        }
    };


    function disabledFieldYearNotSelect() {
        let disabel = false
        if (year !== '') {
            disabel = false
            return disabel
        } else {
            disabel = true
            return disabel
        }
    }

    useEffect(() => {
        disabledFieldYearNotSelect()
    }, [year, tabValue])

    const hadleSelectSameAdd = (e: any) => {
        let value = ''
        if (e.target.checked) {
            value = getFldValue(state.textDts, 'addf')
            dispatch({ type: ACTIONS.FORM_DATA, payload: `addc][${value}` })

        } else {
            value = ' '
            dispatch({ type: ACTIONS.FORM_DATA, payload: `addc][${value}` })
        }
    }

    const handlePdfAuthFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileInput = event.target;
        const fileList = fileInput.files;

        if (fileList && fileList.length > 0) {
            const file = fileList[0]; // Allow only one file

            if (file.type !== "application/pdf") {
                setAuthPdfError("Only PDF files are allowed.");
                return;
            }

            if (file.size / (1024 * 1024) > 4) {
                setAuthPdfError("File size should be less than 4 MB.");
                return;
            }

            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                const base64String = e.target?.result as string;
                setFileAuth([{ flnm: file.name, flst: base64String }]); // Replace previous file
                setAuthPdfError("");

                // Reset file input to allow re-upload of the same file
                fileInput.value = "";
            };

            fileReader.readAsDataURL(file);
            setShowDeletePdf(true);
        }
    };

    const handleDeleteAuthFile = (index: number) => {
        const updatedFiles = [...fileAuth];
        updatedFiles.splice(index, 1);
        setFileAuth(updatedFiles);
    };


    function renderFirstTab() {
        return (
            <>
                <Seperator heading="Particulars of Occupier"></Seperator>
                <table className="table table-bordered min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="py-3 bg-gray-100">
                            <th className="border p-3 py-0.5" scope="col">S. Number</th>
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
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
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
                        dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                        callFnFocus=""
                        dsbKey={false}
                        // validateFn="1[length]"
                        allowNumber={false}
                        unblockSpecialChars={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        speaker={"Enter Address of health care facility"}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                    ></WtrInput>


                    {/* <WtrInput
                            displayFormat={"4"}
                            sNo={"1.3"}
                            Label="Address of correspondence"
                            fldName="addc"
                            idText="txtaddc"
                            onChange={onChangeDts}
                            dsabld={!isHcfLogin || arrytab[0] || disabledFieldYearNotSelect()}
                            callFnFocus=""
                            dsbKey={false}
                            validateFn="1[length]"
                            allowNumber={false}
                            speaker={"Address of correspondence"}
                            selectedValue={state.frmData}
                            clrFnct={state.trigger}
                    ></WtrInput> */}

                    <tr>
                        <td className='border px-3'>1.3</td>
                        <td className='border px-3'>Address of correspondence
                            HCF<span style={{ color: 'red' }}>*</span>
                            <label className="ml-2 flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-1"
                                    id="sameAsHcfAddress"
                                    onChange={(e: any) => hadleSelectSameAdd(e)}
                                />
                                <span>Same as address of HCF</span>
                            </label></td>
                        <td className="border px-3">
                            <div className="w-full">
                                <WtrInput
                                    displayFormat={"1"}
                                    Label="Address of correspondence HCF"
                                    fldName="addc"
                                    idText="txtaddc"
                                    onChange={onChangeDts}
                                    dsabld={!isHcfLogin || arrytab[0] || disabledFieldYearNotSelect()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    allowNumber={false}
                                    speaker={"Address of correspondence"}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                />
                            </div>
                        </td>

                    </tr>






                    {/* <WtrInput
                        displayFormat={"4"}
                        sNo={"1.6"}
                        Label="GPS coordinates of HCF (latitude)"
                        fldName="gpscordlat"
                        idText="txtgpscordlat"
                        onChange={onChangeDts}
                        dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        speaker={"GPS coordinates of HCF"}
                        gpsValidate={true}
                        noofDecimals={6}
                    ></WtrInput>
                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.7"}
                        Label="GPS coordinates of HCF (longitude)"
                        fldName="gpscordlong"
                        idText="txtgpscordlong"
                        onChange={onChangeDts}
                        dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        allowNumber={true}
                        allowDecimal={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        speaker={"GPS coordinates of HCF"}
                        noofDecimals={6}
                    ></WtrInput> */}
                    <tr>
                        <td className='border px-3'>1.5</td>
                        <td className='border px-3'>GPS Coordinates of
                            HCF<span style={{ color: 'red' }}>*</span> </td>
                        <td className='border px-3'>
                            <tr>
                                <WtrInput
                                    displayFormat={"1"}
                                    Label="Latitude"
                                    fldName="gpscordlat"
                                    idText="txtgpscordlat"
                                    onChange={onChangeDts}
                                    dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="[latitude]"
                                    allowNumber={true}
                                    allowDecimal={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    speaker={""}
                                    gpsValidate={true}
                                    noofDecimals={6}
                                ></WtrInput>
                            </tr>
                            <tr>
                                <WtrInput
                                    displayFormat={"1"}
                                    Label="Longitude)"
                                    fldName="gpscordlong"
                                    idText="txtgpscordlong"
                                    onChange={onChangeDts}
                                    dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="[longitude]"
                                    allowNumber={true}
                                    allowDecimal={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    speaker={""}
                                    noofDecimals={6}
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
                        dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        unblockSpecialChars={true}
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        speaker={" Enter URL of health care facilitys website"}
                    ></WtrInput>

                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.7"}
                        Label="Name of authorized person"
                        fldName="authnm"
                        idText="txtauthnm"
                        onChange={onChangeDts}
                        dsabld={!isHcfLogin || arrytab[0] || disabledFieldYearNotSelect()}
                        callFnFocus=""
                        dsbKey={false}
                        validateFn="1[length]"
                        allowNumber={false}
                        unblockSpecialChars={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        speaker={"Name of authorized person"}
                        delayClose={1000}
                        placement="right"
                        ClssName=""
                        blockNumbers={true}
                    ></WtrInput>

                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.8"}
                        Label="Contact number of authorized person"
                        fldName="telno"
                        idText="txttelno"
                        onChange={onChangeDts}
                        dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="[mob]"
                        allowNumber={true}
                        ToolTip="Enter numbers only"
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        speaker={"Enter valid Contact number"}
                    ></WtrInput>

                    <WtrInput
                        displayFormat={"4"}
                        sNo={"1.9"}
                        Label="E-mail id for communication"
                        fldName="eml"
                        idText="txteml"
                        onChange={onChangeDts}
                        dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="[email]"
                        unblockSpecialChars={true}
                        allowNumber={false}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
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
                        dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        allowNumber={true}
                        ToolTip="Enter numbers only"
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                    // speaker={"Enter valid Fax Number"}
                    ></WtrInput>
                    <tr>
                        <td className="border px-3 py-2">1.11</td>
                        <td className="border px-3 py-2">Ownership of HCF<span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3 py-2">
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="ownhcfid"
                                idText="txtownhcfid"
                                onChange={onChangeDts}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                fnctCall={false}
                                dbCon={"nodb"}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                parms={""}
                                allwSrch={true}
                                speaker={""}
                                loadOnDemand={governmentCombo}
                                delayClose={1000}
                                allwZero={"1"}
                                disable={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                            ></WtrRsSelect>
                            {ownerHcfSelect == 'Any Other' ? <WtrInput
                                displayFormat={"1"}
                                sNo={""}
                                Label=""
                                fldName="sltother"
                                idText="txtother"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                                callFnFocus=""
                                dsbKey={false}
                                minValue={-1}
                                unblockSpecialChars={false}
                                allowNumber={false}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                speaker={""}
                                blockNumbers={true}
                            ></WtrInput> : <></>}
                        </td>

                    </tr>

                    <tr>
                        <td className='border px-3'>1.12</td>
                        <td className='border px-3'>Status of authorisation under BMWM rules, 2016 <span style={{ color: 'red' }}>*</span> </td>
                        <td className='border px-3'>
                            <tr>
                                <WtrInput
                                    displayFormat="1"
                                    Label="Status of authorisation under BMWM rules, 2016"
                                    fldName="stsauth"
                                    idText="txtstsauth"
                                    onChange={onChangeDts}
                                    dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                                    callFnFocus=""
                                    dsbKey={false}
                                    minValue={-1}
                                    validateFn="1[length]"
                                    placeholder='Enter valid authorisation number '
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    speaker='Enter Valid authorization number'

                                ></WtrInput>
                            </tr>
                            <tr>
                                {year !== '' ? <NrjRsDt
                                    format="dd-MMM-yyyy"
                                    fldName="authdt_exp"
                                    displayFormat="1"
                                    idText="txtauthdt_exp"
                                    size="lg"
                                    Label="Valid up to"
                                    selectedValue={state.frmData}
                                    onChange={onChangeDts}
                                    disAbleFor={true}
                                    readOnly={calendarDisabled()}
                                    shouldDisableFutureDates={true}
                                ></NrjRsDt> :
                                    <NrjRsDt
                                        format="dd-MMM-yyyy"
                                        fldName="authdt_exp"
                                        displayFormat="1"
                                        idText="txtauthdt_exp"
                                        size="lg"
                                        Label="Valid up to"
                                        selectedValue={state.frmData}
                                        onChange={onChangeDts}
                                        disAbleFor={true}
                                        readOnly={true}
                                    ></NrjRsDt>}
                            </tr>
                            <tr>
                                <div style={{ flex: 1, }}> {/* Second div */}
                                    <label

                                        className="block text-sm font-medium text-gray-700"
                                        style={{ fontSize: "14px", color: "#020134" }}
                                    >
                                        Authorization document  upload
                                    </label>
                                    <div style={{ marginTop: '6px', marginBottom: '4px' }}>
                                        {/* {isHcfLogin && (<label style={{ display: 'inline-block', padding: '9px 47px', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder', }}>Choose File
                                            <input type="file" name='docfiles' onChange={handlePdfAuthFileChange} multiple disabled={!isHcfLogin} style={{ display: 'none' }} />
                                        </label>)} */}
                                        {isHcfLogin && <label style={{ display: 'inline-block', padding: '9px 47px', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder' }}>
                                            <i className="fas fa-upload" style={{ marginRight: '8px', verticalAlign: 'middle' }}></i>
                                            Attach document
                                            <input type="file" name='docfiles' onChange={handlePdfAuthFileChange} multiple disabled={!isHcfLogin} style={{ display: 'none' }} />
                                        </label>}
                                        {authpdfError && <p style={{ color: 'red' }}>{authpdfError}</p>}
                                        <div>
                                            {fileAuth.map((file, index) => (
                                                <div key={index} className="flex items-center mb-2">
                                                    <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {/* Adjust width, height, and margin as needed */}
                                                    <span className="mr-2">{file.flnm}</span>
                                                    {showDeletePdf &&
                                                        <img className='deleImage' src={DeleteIcon} alt="Delete-Icon" onClick={() => handleDeleteAuthFile(index)} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </tr>

                        </td>
                    </tr>
                    <tr>
                        <td className='border px-3'>1.13</td>
                        <td className='border px-3'>Status of consents under water act and air
                            Act<span style={{ color: 'red' }}>*</span></td>
                        <td className='border px-3'>
                            <WtrInput
                                displayFormat="1"
                                Label="Consent number"
                                fldName="stscnstno"
                                idText="txtstscnstno"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                                callFnFocus=""
                                dsbKey={false}
                                minValue={-1}
                                validateFn="1[length]"
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                speaker='Enter Valid Consent Number'

                            ></WtrInput>

                            {year !== '' ? <NrjRsDt
                                format="dd-MMM-yyyy"
                                fldName="dt_exp"
                                displayFormat="1"
                                idText="txtdt_exp"
                                size="lg"
                                Label="Valid up to"
                                selectedValue={state.frmData}
                                onChange={onChangeDts}
                                disAbleFor={true}
                                readOnly={calendarDisabled()}
                                shouldDisableFutureDates={true}
                            ></NrjRsDt> : <NrjRsDt
                                format="dd-MMM-yyyy"
                                fldName="dt_exp"
                                displayFormat="1"
                                idText="txtdt_exp"
                                size="lg"
                                Label="Valid up to"
                                selectedValue={state.frmData}
                                onChange={onChangeDts}
                                disAbleFor={true}
                                readOnly={true}
                            ></NrjRsDt>}
                            <div className="mt-0">

                                {/* <div className="input-container mt-2">
                                        <input
                                            type="text"
                                            id="consentFromDt"
                                            value={consentNumber} // Controlled input value
                                            disabled={consentdisbld}
                                            className="w-full max-w-2xl p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={consentLabel}
                                            onChange={handleConsent} // Handle input change
                                        />
                                    </div> */}
                            </div>
                            <tr>
                                {showConsentFileName.length > 0 && showConsentFilePath.length > 0 ?
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            src={PdfIcon}
                                            alt="PDF Icon"
                                            style={{ width: '24px', height: '24px', marginRight: '8px' }}
                                        />
                                        <a
                                            href="#"
                                            onClick={() => handleShowPdfClick(showConsentFilePath)}
                                            style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                                        >
                                            {showConsentFileName}
                                        </a>
                                    </div> :
                                    <div style={{ flex: 1, marginLeft: '5px' }}> {/* Second div */}
                                        <div style={{ marginTop: '20px', marginBottom: '4px' }}>
                                            {/* Title above the file upload */}

                                            <label

                                                className="block text-sm font-medium text-gray-700"
                                                style={{ fontSize: "14px", color: "#020134" }}
                                            >
                                                PCB consent document upload
                                            </label>
                                            <label style={{ display: 'inline-block', padding: '9px 47px', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder' }}>
                                                <i className="fas fa-upload" style={{ marginRight: '8px', verticalAlign: 'middle' }}></i>
                                                Attach document
                                                <input type="file" name='Consentfiles' style={{ display: 'none' }} onChange={handleConsentFileChange} multiple={false} />
                                            </label>
                                            <br />
                                            {consentpdfError && <p style={{ color: 'red' }}>{consentpdfError}</p>}
                                        </div>

                                        <div>
                                            {consentfileData.map((file: { flnm: string, flst: string }) => (
                                                <div key={file.flnm} style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                                                    <img
                                                        src={PdfIcon}
                                                        alt="PDF Icon"
                                                        style={{ width: '24px', height: '24px', marginRight: '8px' }}
                                                    />
                                                    <span style={{ marginRight: 'auto' }}>{file.flnm}</span>
                                                    <button onClick={() => handleFileConsentDelete(file.flnm)} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                        <FontAwesomeIcon icon={faTrash} style={{ color: 'red', marginRight: '4px' }} />
                                                        <span className="text-red-500">Delete</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                    </div>}

                                {consentfileData && consentfileData.length > 0 && <div className="flex justify-start mt-6 mr-[0rem] sm:mr-0">
                                    <Button
                                        size="medium"
                                        style={{ backgroundColor: "#34c3ff", textTransform: "none" }}
                                        variant="contained"
                                        color="success"
                                        startIcon={<SaveIcon />}
                                        onClick={ClickConsentValidate}
                                        disabled={false}
                                        className="whitespace-nowrap px-4"
                                    >
                                        Validate
                                    </Button>
                                </div>
                                }
                            </tr>
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
                        <td className='border px-3'>Bedded and non-bedded<span style={{ color: 'red' }}>*</span></td>
                        <td className='border px-3'>
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="hcftypeid"
                                idText="txthcftypeid"
                                onChange={onChangeDts}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                allwZero={"1"}
                                fnctCall={false}
                                dbCon={""}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                loadOnDemand={optionHcfType}
                                parms={""}
                                allwSrch={true}
                                delayClose={1000}
                                disable={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                                speaker={"HCF type bedded/Non-bedded"}
                            ></WtrRsSelect>
                        </td>
                    </tr>
                    {showNonBedHcf && <tr>
                        <td className='border px-3 py-2'>2.2</td>
                        {/* <td className='border px-3'>Non-bedded health care facility</td> */}
                        <td className='border px-3 text-red-600'>Non-bedded HCF<span style={{ color: 'red' }}>*</span></td>
                        <td className='border px-3'>
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="nonbdid"
                                idText="txtnonbdid"
                                onChange={onChangeDts}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                allwZero={"1"}
                                fnctCall={false}
                                dbCon={""}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                loadOnDemand={state.nonBedded}
                                parms={""}
                                allwSrch={true}
                                delayClose={1000}
                                disable={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                                speaker={"HCF type bedded/Non-bedded"}
                            ></WtrRsSelect>
                        </td>
                    </tr>}
                    {/* <tr>
                        <td className='border px-3 py-2'>2.2</td>
                 
                        <td className='border px-3'>Bedded and non-bedded<span className="text-red-600">*</span></td>
                        <td className='border px-3'>
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="nonbdid"
                                idText="txtnonbdid"
                                onChange={onChangeDts}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                allwZero={"1"}
                                fnctCall={false}
                                dbCon={""}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                loadOnDemand={state.nonBedded}
                                parms={""}
                                allwSrch={true}
                                delayClose={1000}
                                disable={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                                speaker={"HCF type bedded/non-bedded"}
                            ></WtrRsSelect>
                        </td>
                    </tr> */}
                    <WtrInput
                        displayFormat={"4"}
                        sNo={"2.3"}
                        Label="Number of beds"
                        fldName="nobd"
                        idText="txtnobd"
                        onChange={onChangeDts}
                        dsabld={returnNumberOfBedDisabled() || disabledFieldYearNotSelect() || arrytab[0] || showNonBedHcf}
                        callFnFocus=""
                        dsbKey={false}
                        minValue={-1}
                        validateFn="1[length]"
                        allowNumber={true}
                        selectedValue={state.frmData}
                        clrFnct={state.trigger}
                        delayClose={1000}
                        // speaker={"Number of Beds"}
                        gpsValidate={true}
                        noofDecimals={6}
                    ></WtrInput>

                    {/* <tr>
                        <td className="border px-3 py-2">2.4</td>
                        <td className="border px-3">License number of health care facility</td>
                        <td className="border px-3">
                            <tr>
                                <WtrInput
                                    displayFormat={"4"}
                                   
                                    Label="License number of health care facility"
                                    fldName="licno"
                                    idText="txtlicno"
                                    onChange={onChangeDts}
                                    dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn=""
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    speaker='License number of health care facility '
                                ></WtrInput>
                            </tr>
                            <tr>
                            {year !== '' ? <NrjRsDt
                                format="dd-MMM-yyyy"
                                fldName="licdt_exp"
                                displayFormat='1'
                                idText="txtlicdt_exp"
                                size="lg"
                                Label="Date of Expiry"
                                selectedValue={state.frmData}
                                onChange={onChangeDts}
                                speaker={"Date of Expiry"}
                                disAbleFor={true}
                                readOnly={calendarDisabled()}
                                shouldDisableFutureDates={true}
                            ></NrjRsDt> : <NrjRsDt
                                format="dd-MMM-yyyy"
                                fldName="licdt_exp"
                                displayFormat='1'
                                idText="txtlicdt_exp"
                                size="lg"
                                Label="Date of Expiry"
                                selectedValue={state.frmData}
                                onChange={onChangeDts}
                                speaker={"Date of Expiry"}
                                disAbleFor={true}
                                readOnly={true}
                                ></NrjRsDt>}
                        </tr></td>
                    </tr> */}

                    <tr>
                        <td className="border px-3 py-2">2.4</td>
                        <td className="border px-3">License number of health care facility<span style={{ color: 'red' }}>*</span></td>
                        <td className='border px-3'>
                            <tr>

                                <WtrInput
                                    displayFormat="1"
                                    Label="License number of health care facility"
                                    fldName="licno"
                                    idText="txtlicno"
                                    onChange={onChangeDts}
                                    dsabld={!isHcfLogin || disabledFieldYearNotSelect() || arrytab[0]}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn=""
                                    allowNumber={false}
                                    unblockSpecialChars={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    speaker='License number of health care facility '
                                ></WtrInput>
                            </tr>
                            <tr>
                                {year !== '' ? <NrjRsDt
                                    format="dd-MMM-yyyy"
                                    fldName="licdt_exp"
                                    displayFormat='1'
                                    idText="txtlicdt_exp"
                                    size="lg"
                                    Label="License valid upto"
                                    selectedValue={state.frmData}
                                    onChange={onChangeDts}
                                    speaker={"Date of Expiry"}
                                    disAbleFor={true}
                                    readOnly={calendarDisabled()}
                                    shouldDisableFutureDates={true}
                                ></NrjRsDt> : <NrjRsDt
                                    format="dd-MMM-yyyy"
                                    fldName="licdt_exp"
                                    displayFormat='1'
                                    idText="txtlicdt_exp"
                                    size="lg"
                                    Label="License valid upto"
                                    selectedValue={state.frmData}
                                    onChange={onChangeDts}
                                    speaker={"Date of Expiry"}
                                    disAbleFor={true}
                                    readOnly={true}
                                ></NrjRsDt>}
                            </tr>

                        </td>
                    </tr>
                </table>
            </>
        )
    }


    function renderSecondTab() {
        return (
            <>
                <Seperator heading="Details of waste generation"></Seperator>
                <table className="table table-bordered min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="py-3 bg-gray-100">
                            <th className="border p-3 py-0.5" scope="col">S. number</th>
                            <th className="border p-3" scope="col">Particulars</th>
                            <th className="border p-3" scope="col">Details</th>
                        </tr>
                    </thead>

                    <tr>
                        <th className="border px-3 py-1 text-left">3</th>
                        <th className="border px-3  text-left">Quantity of waste generated in Kg/annum (on monthly average basis) </th>
                        <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                        <td className="border px-3">3.1</td>
                        <td className="border px-3">Yellow category waste  <span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="ylwqnt"
                                idText="txtylwqnt"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Yellow category waste "
                                noofDecimals={3}
                            ></WtrInput></td>
                    </tr>
                    <tr>
                        <td className="border px-3">3.2</td>
                        <td className="border px-3">Red category waste  <span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="redqnt"
                                idText="txtredqnt"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Red category waste "
                                noofDecimals={3}
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">3.3</td>
                        <td className="border px-3"> White category waste <span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="whtqnt"
                                idText="txtwhtqnt"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="White category waste "
                                noofDecimals={3}
                            ></WtrInput></td>
                    </tr>
                    <tr>
                        <td className="border px-3">3.4</td>
                        <td className="border px-3">Blue category waste <span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="blqnt"
                                idText="txtblqnt"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Blue category waste "
                                noofDecimals={3}
                            // speaker={"Enter Number of Beds"}
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
                                dsabld={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="General solid waste"
                                noofDecimals={3}
                            // speaker={"Enter Number of Beds"}
                            ></WtrInput></td>
                    </tr>
                    <tr className="bg-gray-50">
                        <th className="border px-3 py-1 text-left   ">4</th>
                        <th className="border px-3  text-left">  Details of the storage, treatment, transportation, processing and disposal facility
                        </th>
                        <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                        <td className="border px-3">4.1</td>
                        <td className="border px-3">Details of facility for the on-site storage of waste<span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">

                            <WtrInput
                                displayFormat="1"
                                Label="Area (in sq. metres)"
                                fldName="size"
                                idText="txtsize"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                            ></WtrInput>


                            <WtrInput
                                displayFormat="1"
                                Label="Capacity (in kg/day)"
                                fldName="cap"
                                idText="txtcap"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                noofDecimals={3}
                            ></WtrInput>


                            {/* <WtrInput
                                displayFormat="1"
                                // Label="Provision of on-site storage : (cold storage or any other provision)"
                                Label="Provision for on-site storage"
                                fldName="prov"
                                idText="txtprov"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
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
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                allwZero={"1"}
                                fnctCall={false}
                                dbCon={""}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                loadOnDemand={state.provStorage}
                                parms={""}
                                allwSrch={true}
                                delayClose={1000}
                                disable={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                speaker={"Provision for on-site storage"}
                            ></WtrRsSelect>

                        </td>
                    </tr>
                    <tr className="bg-gray-50">
                        <th className="border px-3  py-3">4.2</th>
                        <th className="border px-3  text-left"> Whether HCF is having captive treatment facility
                        </th>
                        <th className="border px-3 text-left py-1">
                            <label>
                                <input
                                    type='radio'
                                    name='captiveOption'
                                    checked={captiveValue}
                                    onChange={() => setCaptiveValue(true)}
                                    disabled={saveButtonDisabled()}
                                />
                                Yes
                            </label>
                            <label>
                                <input
                                    type='radio'
                                    name='captiveOption'
                                    checked={!captiveValue}
                                    onChange={() => setCaptiveValue(false)}
                                    disabled={saveButtonDisabled()}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                    dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || inc}
                                    callFnFocus=""
                                    allowDecimal={true}
                                    noofDecimals={3}
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
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
                                        allowDecimal={true}
                                        noofDecimals={3}
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || inc}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || disPlasCapQua}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        allowDecimal={true}
                                        noofDecimals={3}
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="plaanm"
                                        idText="txtplaanm"
                                        onChange={onChangeDts}
                                        allowDecimal={true}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || disPlasCapQua}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        noofDecimals={3}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        allowDecimal={true}
                                        noofDecimals={3}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || autocl}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        allowDecimal={true}
                                        noofDecimals={3}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || autocl}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        fldName="hydro"
                                        idText="txthydro"
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="hydrocap"
                                        idText="txtinccap"
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || micro}
                                        callFnFocus=""
                                        allowDecimal={true}
                                        noofDecimals={3}
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="hydroanm"
                                        idText="txtincanm"
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || micro}
                                        callFnFocus=""
                                        dsbKey={false}
                                        allowDecimal={true}
                                        noofDecimals={3}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || hydra}
                                        callFnFocus=""
                                        allowDecimal={true}
                                        noofDecimals={3}
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || hydra}
                                        callFnFocus=""
                                        allowDecimal={true}
                                        noofDecimals={3}
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || !captiveValue || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || shra}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        allowDecimal={true}
                                        noofDecimals={3}
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="shranm"
                                        idText="txtshranm"
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || shra}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        allowDecimal={true}
                                        noofDecimals={3}
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
                                        dsabld={returnDisabled() || !captiveValue || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || needle}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        allowDecimal={true}
                                        noofDecimals={3}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || needle}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        allowDecimal={true}
                                        noofDecimals={3}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || deep}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        allowDecimal={true}
                                        noofDecimals={3}
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="deepanm"
                                        idText="txtdeepanm"
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || deep}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        allowDecimal={true}
                                        noofDecimals={3}
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(xi)</td>
                        <td className="border px-3">Chemical disinfection</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="chem"
                                        idText="txtchem"
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || chem}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        allowDecimal={true}
                                        noofDecimals={3}
                                    ></WtrInput>
                                </td>
                            </tr>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">(xii)</td>
                        <td className="border px-3">Any other treatment equipment</td>
                        <td className="px-3">
                            <tr className="px-3">
                                <td className="px-3 w-3/12">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="anyothr"
                                        idText="txtanyothr"
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || anyothr}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        allowDecimal={true}
                                        noofDecimals={3}
                                    ></WtrInput>
                                </td>
                                <td className="px-3 w-3/12 text-center">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="anyothranm"
                                        idText="txtanyothranm"
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect() || anyothr}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                        allowDecimal={true}
                                        noofDecimals={3}
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
                                dsabld={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Red category waste"
                                noofDecimals={3}
                            ></WtrInput>
                            <WtrInput
                                displayFormat="1"
                                Label="Blue category waste"
                                fldName="recyleblue"
                                idText="txtblue"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                allowDecimal={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Blue category waste"
                                noofDecimals={3}
                            ></WtrInput>
                        </td>
                    </tr>
                    {/* {!captiveValue && <tr>
                        <td className="border px-3">4.4</td>
                        <td className="border px-3"> Number of vehicles used for collection
                            and transportation of biomedical
                            waste</td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="noveh"
                                idText="txtnoveh"
                                onChange={onChangeDts}
                                dsabld={retutnDisabeledForVehicle() || arrytab[1]}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of vehicles used for collection and transportation of biomedical waste"
                            ></WtrInput>
                        </td>
                    </tr>} */}
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
                                        dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        allowDecimal={true}
                                        noofDecimals={3}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
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
                                    dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    allowNumber={false}
                                    blockNumbers={true}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                    unblockSpecialChars={true}
                                ></WtrInput></td>
                            </tr>
                            {/* <tr>
                                <td className="px-3">Ash</td>
                                <td className="px-3">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="ash"
                                        idText="txtash"
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[1]}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={true}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                                <td className="px-3">
                                    <WtrInput
                                        displayFormat="1"
                                        Label=""
                                        fldName="ashdispo"
                                        idText="txtash"
                                        onChange={onChangeDts}
                                        dsabld={returnDisabled() || arrytab[2]}
                                        callFnFocus=""
                                        dsbKey={false}
                                        validateFn="1[length]"
                                        allowNumber={false}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        delayClose={1000}
                                        placement="right"
                                        ClssName=""
                                    ></WtrInput>
                                </td>
                            </tr> */}
                            <tr>
                                <td className="px-3">ETP sludge</td>
                                <td className="px-3"><WtrInput
                                    displayFormat="1"
                                    Label=""
                                    fldName="etpsl"
                                    idText="txtetpsl"
                                    onChange={onChangeDts}
                                    dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    validateFn="1[length]"
                                    allowNumber={true}
                                    allowDecimal={true}
                                    noofDecimals={3}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
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
                                    dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                    callFnFocus=""
                                    dsbKey={false}
                                    blockNumbers={true}
                                    validateFn="1[length]"
                                    allowNumber={false}
                                    selectedValue={state.frmData}
                                    clrFnct={state.trigger}
                                    delayClose={1000}
                                    placement="right"
                                    ClssName=""
                                    unblockSpecialChars={true}
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
                                dsabld={returnDisabled() || arrytab[1] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Name of the common bioMedical waste treatment facility
                            operator through which wastes are
                            disposed of"
                            ></WtrInput></td>
                    </tr>

                    {/* <tr>
                    <td className="border px-3">4.7</td>
                    <td className="border px-3">List of member HCF not handed
                    over bio-medical waste.</td>
                    <td className="border px-3">
                    <WtrInput
                    displayFormat="1"
                    Label=""
                    fldName="lsthcf"
                    idText="txtlsthcf"
                    onChange={onChangeDts}
                    dsabld={returnDisabled()}
                    unblockSpecialChars={true}
                    callFnFocus=""
                    dsbKey={false}
                    validateFn="1[length]"
                    allowNumber={false}
                    selectedValue={state.frmData}
                    clrFnct={state.trigger}
                    delayClose={1000}
                    placement="right"
                    ClssName=""
                    placeholder="List of member HCF not handed
                    over bio-medical waste."
                    // speaker={"Enter Number of Beds"}
                    ></WtrInput></td>
                    </tr> */}
                </table>

            </>
        )
    }

    function renderThirdTab() {
        return (
            <>
                <Seperator heading="Details of training and accident occured"></Seperator>
                <table className="table table-bordered min-w-full border border-gray-200">
                    <tr className="py-3 bg-gray-100">
                        <th className="border p-3 w-1/12" scope="col">S. Number</th>  {/* Reduced width */}
                        <th className="border p-3 w-5/12" scope="col">Particulars</th>
                        <th className="border p-3 w-5/12" scope="col">Details</th>
                    </tr>
                    <tr>
                        <td className="border px-3 w-1/12">4.6</td>

                        <td className="border px-3 w-5/12 whitespace-normal break-words text-wrap">
                            Do you have bio-medical waste management committee? If yes, attach minutes of the meetings held during the reporting period
                            <span style={{ color: 'red' }}>*</span>
                        </td>



                        <td className="border px-3 w-5/12">
                            <div className="flex justify-between"> {/* Container div with flex justify-between */}
                                <div style={{ flex: 1, marginTop: '6px', marginBottom: '4px' }}> {/* First div */}
                                    {/* <WtrRsSelect
                                        displayFormat={"1"}
                                        Label=""
                                        fldName="infobioid"
                                        idText="txtinfobioid"
                                        onChange={onChangeDts}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        fnctCall={false}
                                        dbCon={"nodb"}
                                        typr={""}
                                        dllName={""}
                                        fnctName={""}
                                        parms={""}
                                        allwSrch={false}
                                        speaker={""}
                                        loadOnDemand={committeeOption}
                                        delayClose={1000}
                                        allwZero={"1"}
                                        disable={!isHcfLogin || arrytab[1] || disabledFieldYearNotSelect()}
                                    ></WtrRsSelect> */}
                                    <WtrRsSelect
                                        displayFormat={"1"}
                                        Label=""
                                        fldName="mngmntcomid"
                                        idText="txtmngmntcomidid"
                                        onChange={onChangeDts}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        fnctCall={false}
                                        dbCon={"nodb"}
                                        typr={""}
                                        dllName={""}
                                        fnctName={""}
                                        parms={""}
                                        allwSrch={false}
                                        speaker={""}
                                        loadOnDemand={committeeOption}
                                        delayClose={1000}
                                        allwZero={"1"}
                                        disable={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                        placement="right"
                                    ></WtrRsSelect>
                                </div>
                                <div style={{ flex: 1, marginLeft: '20px' }}> {/* Second div */}
                                    {isHcfLogin == true && committeeVal && (
                                        <div style={{ marginTop: '6px', marginBottom: '4px' }}>
                                            <label style={{ display: 'inline-block', padding: '9px 47px', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder', }}>Choose File
                                                <input type="file" name='docmomfiles' onChange={handleMomFileChange} multiple disabled={disabledFieldYearNotSelect() || arrytab[1] || showMomPdfFile.length >= 4} style={{ display: 'none' }} />
                                            </label>
                                            {momPdfError && <p style={{ color: 'red' }}>{momPdfError}</p>}
                                            <div>
                                                {showMomPdfFile.map((file, index) => (
                                                    <div key={index} className="flex items-center mb-2">
                                                        <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {/* Adjust width, height, and margin as needed */}
                                                        <span className="mr-2">{file.flnm}</span>
                                                        {showDeletePdf &&
                                                            <img className='deleImage' src={DeleteIcon} alt="Delete-Icon" onClick={() => handleDeleteMomFile(index)} />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr className="bg-gray-50">
                        <th className="border px-3 py-1 text-left">5</th>
                        <th className="border px-3  text-left">Details trainings conducted on BMW </th>
                        <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                        <td className="border px-3">5.1</td>
                        <td className="border px-3">Number of trainings conducted on
                            BMW management. <span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="train"
                                idText="txttrain"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of trainings conducted on BMW management"
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">5.2</td>
                        <td className="border px-3">Number of personnel trained<span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="prstrain"
                                idText="txtprstrain"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
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
                            the time of induction<span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="timeind"
                                idText="txttimeind"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of personnel trained at the time of induction"
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">5.4</td>
                        <td className="border px-3">Number of personnel not undergone any training so far<span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="notrain"
                                idText="txtnotrain"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of personnel not undergone any training so far"
                            // speaker={"Enter Number of Beds"}
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">5.5</td>
                        <td className="border px-3">Whether standard manual for training is available?<span style={{ color: 'red' }}>*</span>
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="whrtarin"
                                idText="txtwhrtarin"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Whether standard manual for training is available?"
                            // speaker={"Enter Number of Beds"}
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
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Any other information"
                            // speaker={"Enter Number of Beds"}
                            ></WtrInput>
                        </td>
                    </tr>

                    <tr className="bg-gray-50">
                        <th className="border px-3 py-1 text-left">6</th>
                        <th className="border px-3  text-left">Details of the accident occurred during the year</th>
                        <th className="border px-3 text-left"></th>
                    </tr>
                    <tr>
                        <td className="border px-3">6.1</td>
                        <td className="border px-3">Number of accidents occurred<span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="accd"
                                idText="txtaccd"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of Accidents occurred."
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">6.2</td>
                        <td className="border px-3">Number of the persons affected<span style={{ color: 'red' }}>*</span></td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="prsaff"
                                idText="txtprsaff"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={true}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of the persons affected"
                            ></WtrInput>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">6.3</td>
                        <td className="border px-3">Remedial action taken (please attach details if any) <span style={{ color: 'red' }}>*</span> </td>
                        <td className="border px-3">
                            <div className="flex justify-between"> {/* Container div with flex justify-between */}
                                <div style={{ flex: 1, marginTop: '6px', marginBottom: '4px' }}> {/* First div */}
                                    <WtrRsSelect
                                        displayFormat={"1"}
                                        Label=""
                                        fldName="remedialid"
                                        idText="txt_remedialid"
                                        onChange={onChangeDts}
                                        selectedValue={state.frmData}
                                        clrFnct={state.trigger}
                                        fnctCall={false}
                                        typr={""}
                                        dllName={""}
                                        fnctName={""}
                                        parms={""}
                                        allwSrch={false}
                                        speaker={""}
                                        loadOnDemand={remedOption}
                                        delayClose={1000}
                                        allwZero={"1"}
                                        dbCon='dbCon'
                                        disable={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                    ></WtrRsSelect>
                                </div>
                                <div style={{ flex: 1, marginLeft: '20px' }}> {/* Second div */}
                                    {isHcfLogin == true && remedVal && (
                                        <div style={{ marginTop: '6px', marginBottom: '4px' }}>
                                            <label style={{ display: 'inline-block', padding: '9px 47p', backgroundColor: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', borderBlockColor: 'ActiveBorder' }}>Choose File
                                                <input type="file" name='docfiles' onChange={handleFileChange} multiple disabled={disabledFieldYearNotSelect() || arrytab[2] || fileData.length >= 4} style={{ display: 'none' }} />
                                            </label>
                                            {error && <p style={{ color: 'red' }}>{error}</p>}
                                            <div>
                                                {fileData.map((file, index) => (
                                                    <div key={index} className="flex items-center mb-2">
                                                        <img src={PdfIcon} alt="PDF Icon" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {/* Adjust width, height, and margin as needed */}
                                                        <span className="mr-2">{file.flnm}</span>
                                                        {showDeletePdf && <img className='deleImage' src={DeleteIcon} alt="Delete-Icon" onClick={() => handleDeleteFile(index)} />}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* <div style={{ marginTop: '5px' }}>
                                                <button className="px-4 py-2 rounded-md border border-neutral-300 bg-neutral-100 text-neutral-500 text-sm hover:-translate-y-1 transform transition duration-200 hover:shadow-md" onClick={handleUploadMomFile} disabled={showMomPdfFile.filter(file => file.flnm.endsWith('.pdf')).length === 0}>
                                                    Upload
                                                </button>
                                            </div> */}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className="border px-3">6.4</td>
                        <td className="border px-3"> Any fatality occurred, details <span style={{ color: 'red' }}>*</span> </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="ftlity"
                                idText="txtftlity"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder=" Any Fatality occurred, Details"
                            // speaker={"Enter Number of Beds"}
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
                                dsabld={returnDisabled() || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Are you meeting the standards of air Pollution from the incinerator?"
                            // speaker={"Enter Number of Beds"}
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
                                dsabld={returnDisabled() || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Number of times Stack monitoring was done during the year"
                            // speaker={"Enter Number of Beds"}
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
                                dsabld={returnDisabled() || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="How many times in last year could not met the standards out of total no. of stack monitoring done during the year"
                            // speaker={"Enter Number of Beds"}
                            ></WtrInput>
                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">7.3</td>
                        <td className="border px-3">Whether continuous online emission monitoring systems is installed<span style={{ color: 'red' }}>*</span>
                        </td>

                        <td className="border px-3">
                            {/* <tr>
                                <th className="border px-3 text-left py-1">
                                    <label>
                                        <input
                                            type='radio'
                                            name='captiveOption'
                                            checked={emissionValue}
                                            onChange={() => setEmission(true)}
                                            disabled={saveButtonDisabled()}
                                        />
                                        Yes
                                    </label>
                                    <label>
                                        <input
                                            type='radio'
                                            name='captiveOption'
                                            checked={!emissionValue}
                                            onChange={() => setEmission(false)}
                                            disabled={saveButtonDisabled()}
                                        />
                                        No
                                    </label>
                                </th>
                            </tr> */}
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="onlemid"
                                idText="txtonlemid"
                                onChange={onChangeDts}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                fnctCall={false}
                                dbCon={"nodb"}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                parms={""}
                                allwSrch={false}
                                speaker={""}
                                loadOnDemand={sterilizationOptn}
                                delayClose={1000}
                                allwZero={"1"}
                                disable={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                placement="right"
                            ></WtrRsSelect>

                            <tr>
                                {emissionValue && (
                                    <td className="w-full px-3">
                                        <WtrInput
                                            displayFormat="1"
                                            Label=""
                                            fldName="onlemi"
                                            idText="txtonlemi"
                                            onChange={onChangeDts}
                                            dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                            callFnFocus=""
                                            dsbKey={false}
                                            validateFn="1[length]"
                                            selectedValue={state.frmData}
                                            clrFnct={state.trigger}
                                            delayClose={1000}
                                            placement="right"
                                            ClssName="w-full"  // Ensure input is full width
                                            placeholder="Whether continuous online emission monitoring systems is installed"
                                            unblockSpecialChars={true}
                                        />
                                        <WtrInput
                                            displayFormat="1"
                                            Label=""
                                            fldName="frqcali"
                                            idText="txtfrqcali"
                                            onChange={onChangeDts}
                                            dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                            callFnFocus=""
                                            dsbKey={false}
                                            validateFn="1[length]"
                                            selectedValue={state.frmData}
                                            clrFnct={state.trigger}
                                            delayClose={1000}
                                            placement="right"
                                            ClssName=""
                                            placeholder="frequency of calibration"
                                            // speaker={"Enter Number of Beds"}
                                            unblockSpecialChars={true}
                                        ></WtrInput>
                                    </td>
                                )}
                            </tr>


                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">8</td>
                        <td className="border px-3">Liquid waste generated and treatment methods in place
                            <span style={{ color: 'red' }}>*</span>
                        </td>
                        <td className="border px-3">
                            {/* <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="liqwst"
                                idText="txtliqwst"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Liquid waste generated and treatment methods in place"
                              
                                unblockSpecialChars={true}
                            ></WtrInput> */}
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="liqwstid"
                                idText="txtliqwstid"
                                onChange={onChangeDts}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                fnctCall={false}
                                dbCon={"nodb"}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                parms={""}
                                allwSrch={false}
                                speaker={""}
                                loadOnDemand={sterilizationOptn}
                                delayClose={1000}
                                allwZero={"1"}
                                disable={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                placement="right"
                            ></WtrRsSelect>
                        </td>
                    </tr>


                    <tr>
                        <td className="border px-3">8.1</td>
                        <td className="border px-3">Number of times treated effluent has been analysed during the year
                            <span style={{ color: 'red' }}>*</span>
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="trtefflnt"
                                idText="txttrtefflnt"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
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
                        <span style={{ color: 'red' }}>*</span>
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="notmettrtefflnt"
                                idText="txtnotmettrtefflnt"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
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
                            <span style={{ color: 'red' }}>*</span>
                        </td>
                        <td className="border px-3">
                            {/* <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="disimth"
                                idText="txtdisimth"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Is the disinfection method or sterilization meeting the log 4 standards?"
                              
                                unblockSpecialChars={true}
                            ></WtrInput> */}

                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="disimthid"
                                idText="txtdisimthid"
                                onChange={onChangeDts}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                fnctCall={false}
                                dbCon={"nodb"}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                parms={""}
                                allwSrch={false}
                                speaker={""}
                                loadOnDemand={sterilizationOptn}
                                delayClose={1000}
                                allwZero={"1"}
                                disable={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                placement="right"
                            ></WtrRsSelect>
                        </td>
                    </tr>

                    <tr>
                        <td className="border px-3">9.1</td>
                        <td className="border px-3">How many times you have not met the standards in a year?
                            <span style={{ color: 'red' }}>*</span>
                        </td>
                        <td className="border px-3">
                            <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="ntmetsta"
                                idText="txtntmetsta"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
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
                            {/* <WtrInput
                                displayFormat="1"
                                Label=""
                                fldName="othrinfo"
                                idText="txtothrinfo"
                                onChange={onChangeDts}
                                dsabld={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect()}
                                callFnFocus=""
                                dsbKey={false}
                                validateFn="1[length]"
                                allowNumber={false}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                delayClose={1000}
                                placement="right"
                                ClssName=""
                                placeholder="Air pollution control devices attached with the incinerator"
                            // speaker={"Enter Number of Beds"}
                            ></WtrInput> */}
                            <WtrRsSelect
                                displayFormat={"1"}
                                Label=""
                                fldName="airplincid"
                                idText="txtairplincid"
                                onChange={onChangeDts}
                                selectedValue={state.frmData}
                                clrFnct={state.trigger}
                                fnctCall={false}
                                dbCon={"nodb"}
                                typr={""}
                                dllName={""}
                                fnctName={""}
                                parms={""}
                                allwSrch={false}
                                speaker={""}
                                loadOnDemand={sterilizationOptn}
                                delayClose={1000}
                                allwZero={"1"}
                                disable={!isHcfLogin || arrytab[2] || disabledFieldYearNotSelect() || returnDisabled()}
                                placement="right"
                            ></WtrRsSelect>
                        </td>
                    </tr>
                </table>
            </>
        )
    }

    function renderTabs() {
        return (
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleOnTabChange} aria-label="lab API tabs example" style={{ width: '100%' }}>
                            <CustomTab style={{ flex: 1, width: '33%', textAlign: 'center' }} label="Basic Details" value="1" />
                            <CustomTabWithTooltip style={{ width: '100%' }} label="Waste Generation And Treatment" value="2" title="Waste Generation And Treatment" />
                            <CustomTab style={{ flex: 1, width: '33%', textAlign: 'center' }} label="Additional Information" value="3" />
                        </TabList>
                    </Box>
                    <div className="mx-7">
                        <TabPanel value="1">
                            {isFirstTabActive && renderFirstTab()}
                        </TabPanel>
                        <TabPanel value="2">
                            {isSecondTabActive && renderSecondTab()}
                        </TabPanel>
                        <TabPanel value="3">{isThirdTabActive && renderThirdTab()}</TabPanel>
                    </div>
                </TabContext>
            </Box>
        )
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

    function rendeYearSelect() {
        return (
            // <div className="mb-4">
            //     <div className=" mt-4 grid grid-cols-3 gap-x-8 gap-y-4">
            //         <div className='w-9/12'>
            //             <WtrRsSelect
            //                 Label="Select year"
            //                 speaker="Select year"
            //                 // fldName="dt_yearid"
            //                 // idText="txtdt_yearid"
            //                 fldName="dt_yearid"
            //                 idText="txtdt_yearid"
            //                 displayFormat={"1"}
            //                 onChange={onChangeDts}
            //                 selectedValue={state.frmData}
            //                 clrFnct={state.trigger}
            //                 allwZero={"0"}
            //                 fnctCall={false}
            //                 dbCon=""
            //                 typr=""
            //                 dllName={""}
            //                 fnctName={""}
            //                 parms={""}
            //                 allwSrch={true}
            //                 delayClose={1000}
            //                 loadOnDemand={loadOnDemand}
            //             ></WtrRsSelect>
            //         </div>
            //     </div>
            // </div>
            <>
                {/* <div className="mt-4 my-4 pt-4">
                    {years.map((year) => (
                        <div key={year} className="flex items-center mb-4">
                            <input
                                type="radio"
                                id={`year-${year}`}
                                name="year"
                                value={year}
                                checked={selectedYear === year} // Check the selected year
                                onChange={() => onChangeYear(year)} // Call the handler on change
                                className="mr-2"
                            />
                            <label htmlFor={`year-${year}`}>{year}</label>
                        </div>
                    ))}
                </div>


 */}

                <div className="mt-4 my-4 pt-4">
                    {/* Flex container to align label and radio buttons in a single line */}
                    <div className="flex items-center">
                        {/* Label for the radio button group */}
                        <label className="font-bold text-lg text-gray-800 ">
                            Select year <span className="text-red-500"> *</span>
                        </label>

                        {/* Container for radio buttons in a single line */}
                        <div className="flex space-x-4 ml-4">
                            {years.map((year) => (
                                <div key={year} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`year-${year}`}
                                        name="year"
                                        value={year}
                                        checked={selectedYear === year} // Check the selected year
                                        onChange={() => onChangeYear(year)} // Call the handler on change
                                        className="mr-2"
                                        required
                                    />
                                    <label htmlFor={`year-${year}`} className="font-bold text-lg text-gray-800">{year}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


            </>
        )
    }

    const renderFinalSubmitForm = () => {
        return (
            <>
                {isHcfLogin ? (
                    <div className="mr-4 flex justify-center mt-8 space-x-4">
                        {(isSecondTabActive || isThirdTabActive) && (
                            <Button
                                size="medium"
                                style={{ backgroundColor: "#34c3ff", textTransform: "none" }}
                                variant="contained"
                                color="success"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => handleOnBack(tabValue)}
                            >
                                Back
                            </Button>
                        )}
                        {(isFirstTabActive || isSecondTabActive) && (
                            <Button
                                size="medium"
                                style={{ backgroundColor: "#34c3ff" , textTransform: "none"}}
                                variant="contained"
                                color="success"
                                startIcon={<SaveIcon />}
                                onClick={SaveClick}
                                disabled={saveButtonDisabled()}
                            >
                                Save and next
                            </Button>
                        )}
                        {isThirdTabActive && (
                            <Button
                                size="medium"
                                style={{ backgroundColor: "#34c3ff", textTransform: "none" }}
                                variant="contained"
                                color="success"
                                endIcon={<PreviewIcon />}
                                onClick={handlePreviewClick}
                                disabled={saveButtonDisabled()}
                            >
                                Save & preview
                            </Button>
                        )}
                        {(isFirstTabActive || isSecondTabActive) && (
                            <Button
                                size="medium"
                                style={{ backgroundColor: "#34c3ff", textTransform: "none" }}
                                variant="contained"
                                color="success"
                                endIcon={<ArrowForwardIcon />} // Added next arrow
                                onClick={() => handleOnNext(tabValue)}
                            >
                            next
                            </Button>
                        )}
                    </div>
                ) : (
                    <></>
                )}
            </>
        );
    };

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
        setIsHovered(true);
    };

    const handleMouseOut = () => {
        setIsHovered(false);
    };

    return (
        <>
            {/* <div className={`${isHcfLogin ? 'overflow-y-hidden h-screen bg-white' : 'bg-white'} w-full max-w-screen-xl`}>

              
                <div className='px-3 pb-10 '>
                    <div className="mx-7">
                        <div style={{ textAlign: 'center', color: 'rgba(2, 1, 15, 0.5)' }}>
                            <h4><span>HCF ANNUAL REPORT</span></h4>
                        </div>
                        <div className="state-header">
                            <div className="marquee-container">
                                <div
                                    className={`marquee ${isHovered ? 'paused' : ''}`}
                                    onMouseOver={handleMouseOver}
                                    onMouseOut={handleMouseOut}
                                >
                                    <p className="marquee-content">
                                        <h6 className="text-[20px] mt-2 inverted">To be submitted to the prescribed authority on or before 30th
                                            june every year for the period from January
                                            to December of the preceding year, by the occupier of health care facility (HCF)</h6>
                                    </p>
                                </div>
                            </div>

                        </div>
                        <div className="rounded" >
                            {rendeYearSelect()}
                            {showPopup && <Popup onClosePopup={handleClosePopup} FinalSubmit={finalSubmitOnPopup} data={state} onEdit={handleOnEditForm} otherData={{ captiveValue, showMomPdfFile, fileData }} heading={"HCF Annual Report"} />}
                            {renderTabs()}
                            {renderFinalSubmitForm()}
                        </div>
                    </div>
                </div>
            </div> */}

            <div className={`${isHcfLogin ? 'overflow-y-auto min-h-screen bg-white' : 'bg-white'} w-full max-w-screen-2xl mx-auto overflow-x-hidden`}>
                <div className="px-3 pb-10">
                    <div className="mx-4"> {/* Reduced margin */}

                        {/* Heading */}
                        <div className="text-center text-gray-600">
                            <h4><span>Fill annual report as per BMWM rules, 2016</span></h4>
                        </div>

                        {/* Marquee Section */}
                        <div className="state-header overflow-hidden">
                            <div className="marquee-container">
                                <div
                                    className={`marquee ${isHovered ? 'paused' : ''}`}
                                    onMouseOver={handleMouseOver}
                                    onMouseOut={handleMouseOut}
                                >
                                    <h6 className="text-[20px] mt-2 text-gray-800 whitespace-nowrap">
                                        To be submitted to the prescribed authority on or before 30th june every year for the period
                                        from january to december of the preceding year, by the occupier of health care facility (HCF).
                                    </h6>
                                </div>
                            </div>
                        </div>


                        {/* Main Content */}
                        <div className="rounded">
                            {rendeYearSelect()}
                            {showPopup && (
                                <Popup
                                    onClosePopup={handleClosePopup}
                                    FinalSubmit={finalSubmitOnPopup}
                                    data={state}
                                    onEdit={handleOnEditForm}
                                    otherData={{ captiveValue, showMomPdfFile, fileData, consentfileData, fileAuth, showConsentFileName, showConsentFilePath }}
                                    heading="Fill Annual Report as per BMWM Rules, 2016"
                                />
                            )}
                            {renderTabs()}
                            {renderFinalSubmitForm()}
                        </div>

                    </div>
                </div>
            </div>


        </>
    );

};
export default React.memo(HcfAnnlRptFormTab);
//New Side bar //
import React, { useState } from 'react'
import logo1 from "../../app/assests/cpcblogo.png";
import { useNavigate } from "react-router";
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { getLvl } from "../../utilities/cpcb";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import BubbleChartRoundedIcon from "@mui/icons-material/BubbleChartRounded";
import SettingsApplicationsRoundedIcon from "@mui/icons-material/SettingsApplicationsRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import KeyIcon from '@mui/icons-material/Key';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import PreviewRoundedIcon from '@mui/icons-material/PreviewRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import PlaylistAddCheckTwoToneIcon from '@mui/icons-material/PlaylistAddCheckTwoTone';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
import FindInPageRoundedIcon from '@mui/icons-material/FindInPageRounded';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import PinDropIcon from '@mui/icons-material/PinDrop';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PasswordIcon from '@mui/icons-material/Password';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import './sidebar.css'
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Report {
    name: string;
    path: string;
    description: string;
    hide: boolean;
}


const NewSidebar = (props: any) => {

    const navigate = useNavigate();
    const setPageTitle = props.setPageTitle;
    const [openMonitor, setOpenMonitor] = useState(false);
    const [openOperation, setOpenOperation] = useState(false);
    const [openAnnualReports, setOpenAnnualReports] = useState(false);
    const [openDirectory, setOpenDirectory] = useState(false);
    const [openAdmin, setOpenAdmin] = useState(false);
    const [openMap, setOpenMap] = useState(false);
    const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
    const navigateToPage = (data: string, description: any,) => {
        navigate(data);
        setPageTitle(description);
        if (description == 'Dashboard') {
            setSelectedMenuItem(description)
        }
        // props.toggleSideNavOff();
    };

    const liElementClicked = (path: string, description: string, name: string) => {
        if (navigateToPage) {
            navigateToPage(path, description)
        }
        setSelectedMenuItem(name);
    }

    const toggleMenu = (menuName: string) => {
        setOpenMonitor(menuName === 'overview' ? !openMonitor : false);
        setOpenOperation(menuName === 'operation' ? !openOperation : false);
        setOpenAnnualReports(menuName === 'annualReports' ? !openAnnualReports : false);
        setOpenDirectory(menuName === 'directory' ? !openDirectory : false);
        setOpenAdmin(menuName === 'admin' ? !openAdmin : false);
        setOpenMap(menuName === 'map' ? !openMap : false);
    };

    const renderDashboardMenu = () => {
        return (
            // <div className="menu-item" >
                <MenuItem icon={<GridViewRoundedIcon />} onClick={() => navigateToPage("/dashboardvb", "Dashboard")} className={
                    selectedMenuItem === 'Dashboard'
                        ? 'active-menu-item'
                        : 'default-menu-item-text'
                }> <span className="default-menu-item-text">Dashboard</span>  </MenuItem>
            // </div>
        )
    }

    const renderDirectoryItems = (directoryArr: any[], keyword: string, icon: React.ReactNode) => {
        return directoryArr
            .filter((res: any) => res.name.includes(keyword))
            .map((res: any) => (
                !res.hide && (
                    <div className="menu-item" key={res.name}>
                        <MenuItem icon={icon} key={res.name} onClick={() => liElementClicked(res.path, res.description, res.name)}
                            className={
                                selectedMenuItem === res.name
                                    ? 'active-menu-item'
                                    : 'default-menu-item-text'
                            }>
                            <span className="default-menu-item-text">{res.name}</span>
                        </MenuItem>
                    </div>
                )
            ));
    };

    const renderDirectoryMenu = () => {
        return (
            <SubMenu
                label="Directory"
                icon={<ReceiptRoundedIcon />}
                onClick={() => toggleMenu('directory')}
                open={openDirectory}
            >
                {openDirectory && renderDirectoryItems(props.DirectoryArr, "RD", <TimelineRoundedIcon />)}
                {openDirectory && renderDirectoryItems(props.DirectoryArr, "SPCB", <BubbleChartRoundedIcon />)}
            </SubMenu>
        );
    };

    const renderStaticsItems = (statisticsArrMenu: any[]) => {
        return statisticsArrMenu
            .map((res: any) => (
                !res.hide && (
                    <div className="menu-item" key={res.name}>
                        <MenuItem icon={null} onClick={() => liElementClicked(res.path, res.description, res.name)}
                            className={
                                selectedMenuItem === res.name
                                    ? 'active-menu-item'
                                    : 'default-menu-item-text'
                            }>
                            <span className="default-menu-item-text">{res.name}</span>
                        </MenuItem>
                    </div>
                )
            ));
    }

    const renderBagReportsItems = (bagsReportsItems: any[]) => {
        return bagsReportsItems
            .map((res: any) => (
                !res.hide && (
                    <div className="menu-item" key={res.name}>
                        <MenuItem icon={<RestoreFromTrashIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                            className={
                                selectedMenuItem === res.name
                                    ? 'active-menu-item'
                                    : 'default-menu-item-text'
                            }>
                            <span className="default-menu-item-text">{res.name}</span>
                            {/* <span className="full-menu-item-text">{res.name}</span> */}
                        </MenuItem>
                    </div>
                )
            ))
    }

    const renderOpertaionMenu = (operationMenu: any[]) => {
        return operationMenu
            .map((res: any) => (
                !res.hide && (
                    <div className="menu-item" key={res.name}>
                        <MenuItem icon={<AssessmentRoundedIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                            className={
                                selectedMenuItem === res.name
                                    ? 'active-menu-item'
                                    : 'default-menu-item-text'
                            }>
                            <span className="default-menu-item-text">{res.name}</span>

                        </MenuItem>
                    </div>
                )
            ))
    }

    const renderOperationMenu = () => {
        return (
            <SubMenu label="Operations" icon={<SettingsApplicationsRoundedIcon />}
                open={openOperation}
                onClick={() => toggleMenu('operation')}
            >
                {openOperation && renderOpertaionMenu(props.operations)}
                <SubMenu label='Bags Report' icon={<RestoreFromTrashIcon />}>
                    {openOperation && renderBagReportsItems(props.bagsReport)}
                </SubMenu>
                <SubMenu label="Statistics" icon={<TrendingUpIcon />}>
                    {openOperation && renderStaticsItems(props.statisticsArrMenu)}
                </SubMenu>
            </SubMenu>
        )
    }

    const renderMonitoringMenu = () => {
        return (
            <SubMenu label="Overview" icon={<PreviewRoundedIcon />} onClick={() => toggleMenu('overview')} open={openMonitor}>
                {openMonitor && <SubMenu label="CBWTF" icon={<SettingsApplicationsRoundedIcon />}>
                    {renderMonitoringItems(props.monitoringCBWTF, [
                        { keyword: "CBWTFs Details", icon: <FormatListBulletedRoundedIcon /> },
                        { keyword: "CBWTF Info", icon: <FeedRoundedIcon /> },
                        { keyword: "HCF-CBWTF", icon: <MedicationRoundedIcon /> }
                    ])}
                </SubMenu>}
                {openMonitor && <SubMenu label="HCF" icon={<SettingsApplicationsRoundedIcon />}>
                    {renderMonitoringItems(props.monitoringHCF, [
                        // { keyword: "Search HCF", icon: <ManageSearchIcon /> },
                        // { keyword: "Find HCF (By Mobile)", icon: <FindInPageRoundedIcon /> },
                        { keyword: "HCF Registration with Wrong SPCB Code", icon: <RuleRoundedIcon /> },
                        { keyword: "HCF List", icon: <FormatListBulletedRoundedIcon /> },
                        { keyword: "Not registered under CBWTF", icon: <PlaylistAddCheckTwoToneIcon /> },
                        { keyword: "HCF Consent List", icon: <PlaylistAddCheckTwoToneIcon /> },
                        { keyword: "HCF Consent Report", icon: <PlaylistAddCheckTwoToneIcon /> },
                        { keyword: "HCF Category Count (Chart View)", icon: <AssessmentRoundedIcon /> },
                        { keyword: "HCF Category Count (Report View)", icon: <AssessmentRoundedIcon /> },
                        
                    ])}
                </SubMenu>}
            </SubMenu>
        )
    }

    const renderMonitoringItems = (reports: any[], items: { keyword: string, icon: React.ReactNode }[]) => {
        return items.map(({ keyword, icon }) => (
            reports
                .filter((res: any) => res.name.includes(keyword))
                .map((res: any) => (
                    !res.hide && (
                        <div className="menu-item" key={res.name}>
                            <MenuItem icon={icon} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                className={
                                    selectedMenuItem === res.name
                                        ? 'active-menu-item'
                                        : 'default-menu-item-text'
                                }>
                                <span className="default-menu-item-text">{res.name}</span>
                                {/* <span className="full-menu-item-text">{res.name}</span> */}
                            </MenuItem>
                        </div>
                    )
                ))
        ));
    };


    const renderARSubMenu = (reports: Report[], label: string, keywords: string[]) => {
        return (
            <SubMenu label={label} icon={<EventAvailableRoundedIcon />}>
                {keywords.map(keyword =>
                    reports
                        .filter(res => res.name.includes(keyword))
                        .map((res) => (
                            res.hide ? null : (
                                <div className="menu-item" key={res.name}>
                                    <MenuItem icon={<DateRangeRoundedIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                        className={
                                            selectedMenuItem === res.name
                                                ? 'active-menu-item'
                                                : 'default-menu-item-text'
                                        }>
                                        <span className="default-menu-item-text">{res.name}</span>
                                        {/* <span className="full-menu-item-text">{res.name}</span> */}
                                    </MenuItem>
                                </div>
                            )
                        ))
                )}
            </SubMenu>
        );
    };

    const renderAnnualReportsSpcb = () => {
        return (
            <>  <SubMenu label={"Annual Reports"} icon={<EventAvailableRoundedIcon />} onClick={() => toggleMenu('annualReports')}
                open={openAnnualReports}>
                {openAnnualReports && renderARSubMenu(props.sttAnnualRpt, "ANNUAL", ["SPCB Annual Report", "HCF Annual Report", "CBWTF Annual Report", "CBWTF & HCF consolidated data"])}
                {/* {openAnnualReports && renderARSubMenu(props.monthlyFormReport, "MONTHLY", ["SPCB: Monthly Report", "HCF: Monthly Report", "CBWTF: Monthly Report", "HCF Monthly Report Show Form"])} */}
            </SubMenu>
            </>

        )
    }


    const renderAnnualReportsRgd = () => {
        return (
            <>  <SubMenu label={"Annual Reports"} icon={<EventAvailableRoundedIcon />} onClick={() => toggleMenu('annualReports')}
                open={openAnnualReports}>
                {openAnnualReports && renderARSubMenu(props.rgdAnnualRpt, "ANNUAL", ["SPCB Annual Report", "HCF Annual Report", "CBWTF Annual Report", "CBWTF & HCF consolidated data"])}
                {/* {openAnnualReports && renderARSubMenu(props.monthlyFormReport, "MONTHLY", ["SPCB: Monthly Report", "HCF: Monthly Report", "CBWTF: Monthly Report", "HCF Monthly Report Show Form"])} */}
            </SubMenu>
            </>

        )
    }


    const renderAnnualReports = () => {
        return (
            <>  <SubMenu label={"Annual Reports"} icon={<EventAvailableRoundedIcon />} onClick={() => toggleMenu('annualReports')}
                open={openAnnualReports}>
                {openAnnualReports && renderARSubMenu(props.annualFormReport, "ANNUAL", ["SPCB: Annual Report Form", "HCF Annual Report", "CBWTF Annual Report", "CBWTF & HCF consolidated data"])}
                {/* "CBWTF & HCF consolidated data"  name add for menu shaoe consolidate data*/}
                {/* {openAnnualReports && renderARSubMenu(props.monthlyFormReport, "MONTHLY", ["SPCB: Monthly Report", "HCF: Monthly Report", "CBWTF: Monthly Report", "HCF Monthly Report Show Form"])} */}
            </SubMenu>
            </>
        )
    }

    const renderAdminMenu = () => {
        return (
            <SubMenu label="Admin" icon={<AdminPanelSettingsRoundedIcon />} onClick={() => toggleMenu('admin')}
                open={openAdmin}>
                {openAdmin && props.showProfile.map((res: any) => {
                    if (res.hide) return null;
                    if (res.name.includes("Profile")) {
                        return (
                            <MenuItem icon={<AccountCircleRoundedIcon />} key={res.name} onClick={() => liElementClicked(res.path, res.description, res.name)}>
                                Profile
                            </MenuItem>
                        );
                    }
                    if (res.hide) return null;
                    if (res.name.includes("Change Password") && !res.name.includes("RDs") && !res.name.includes("SPCBs")) {
                        return (
                            <div className="menu-item" key={res.name}>
                                <MenuItem icon={<KeyIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                    className={
                                        selectedMenuItem === res.name
                                            ? 'active-menu-item'
                                            : 'default-menu-item-text'
                                    }>
                                    <span className="default-menu-item-text">{res.name}</span>
                                    {/* <span className="full-menu-item-text">{res.name}</span> */}
                                </MenuItem>
                            </div>

                        );
                    }
                    if (res.hide) return null;
                    if (res.name.includes("Change Password RDs") && !res.name.includes("SPCBs")) {
                        return (
                            <div className="menu-item" key={res.name}>
                                <MenuItem icon={<KeyIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                    className={
                                        selectedMenuItem === res.name
                                            ? 'active-menu-item'
                                            : 'default-menu-item-text'
                                    }>
                                    <span className="default-menu-item-text">{res.name}</span>
                                    {/* <span className="full-menu-item-text">{res.name}</span> */}
                                </MenuItem>
                            </div>
                        );
                    }
                    if (res.hide) return null;
                    if (res.name.includes("Change Password SPCBs") && !res.name.includes("RDs")) {
                        return (
                            <div className="menu-item" key={res.name}>
                                <MenuItem icon={<KeyIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                    className={
                                        selectedMenuItem === res.name
                                            ? 'active-menu-item'
                                            : 'default-menu-item-text'
                                    }>
                                    <span className="default-menu-item-text">{res.name}</span>
                                    {/* <span className="full-menu-item-text">{res.name}</span> */}
                                </MenuItem>
                            </div>
                        );
                    }
                    if (res.hide) return null;
                    if (res.name.includes("Block User List")) {
                        return (
                            <div className="menu-item" key={res.name}>
                                <MenuItem icon={<KeyIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                    className={
                                        selectedMenuItem === res.name
                                            ? 'active-menu-item'
                                            : 'default-menu-item-text'
                                    }>
                                    <span className="default-menu-item-text">{res.name}</span>
                                    {/* <span className="full-menu-item-text">{res.name}</span> */}
                                </MenuItem>
                            </div>
                        );
                    }
                    return null;
                })}
            </SubMenu>
        )
    }

    function renderMapMenu() {
        return (
            <SubMenu label="Map" icon={<TravelExploreIcon />} onClick={() => toggleMenu('map')}
                open={openMap}>
                {openMap && props.mapMenu.map((res: any) => {
                    if (res.hide) return null;
                    if (res.name.includes("Vehicle Tracking")) {
                        return (
                            <div className="menu-item" key={res.name}>
                                <MenuItem icon={<PinDropIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                    className={
                                        selectedMenuItem === res.name
                                            ? 'active-menu-item'
                                            : 'default-menu-item-text'
                                    }>
                                    <span className="default-menu-item-text">{res.name}</span>
                                    {/* <span className="full-menu-item-text">{res.name}</span> */}
                                </MenuItem>
                            </div>
                        );
                    }
                    return null;
                })}
            </SubMenu>
        )
    }

    function renderHCFLoginMenu() {
        return (
            <>
                {props.hcfMenu.map((res: any) => {
                    if (res.hide) return null;
                    if (res.name.includes("HCF")) {
                        return (
                            <div className="menu-item" key={res.name}>
                                <MenuItem icon={<AssessmentIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                    className={
                                        selectedMenuItem === res.name
                                            ? 'active-menu-item'
                                            : 'default-menu-item-text'
                                    }>
                                    <span className="default-menu-item-text">{res.name}</span>
                                    {/* <span className="full-menu-item-text">{res.name}</span> */}
                                </MenuItem>
                            </div>
                        );
                    }
                    return null;
                })}
            </>
        )
    }

    function renderHCFLoginAccMenu() {
        return (
            <>
                {props.hcfLoginMenu.map((res: any) => {
                    if (res.hide) return null;
                    if (res.name.includes("Change Password")) {
                        return (
                            <div className="menu-item" key={res.name}>
                                <MenuItem icon={<PasswordIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                    className={
                                        selectedMenuItem === res.name
                                            ? 'active-menu-item'
                                            : 'default-menu-item-text'
                                    }>
                                    <span className="default-menu-item-text">{res.name}</span>
                                    {/* <span className="full-menu-item-text">{res.name}</span> */}
                                </MenuItem>
                            </div>
                        );
                    }
                    return null;
                })}
            </>
        )
    }

    function renderCBWTFLoginMenu() {
        return (
            <>
                {props.cbwtfMenu.map((res: any) => {
                    if (res.hide) return null;
                    if (res.name.includes("CBWTF")) {
                        return (
                            <div className="menu-item" key={res.name}>
                                <MenuItem icon={<AccountBoxIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                    className={
                                        selectedMenuItem === res.name
                                            ? 'active-menu-item'
                                            : 'default-menu-item-text'
                                    }>
                                    <span className="default-menu-item-text">{res.name}</span>
                                    {/* <span className="full-menu-item-text">{res.name}</span> */}
                                </MenuItem>
                            </div>
                        );
                    }
                    if (res.hide) return null;
                    if (res.name.includes("CBWTF Annual Report")) {
                        return (
                            <div className="menu-item" key={res.name}>
                                <MenuItem icon={<PinDropIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                    className={
                                        selectedMenuItem === res.name
                                            ? 'active-menu-item'
                                            : 'default-menu-item-text'
                                    }>
                                    <span className="default-menu-item-text">{res.name}</span>
                                    {/* <span className="full-menu-item-text">{res.name}</span> */}
                                </MenuItem>
                            </div>
                        );
                    }
                    return null;
                })}
            </>
        )
    }

    function renderCBWTFLoginAccMenu() {
        return (
            <>
                {props.cbwtfMenu.map((res: any) => {
                    if (res.hide) return null;
                    if (res.name.includes("Change")) {
                        return (
                            <div className="menu-item" key={res.name}>
                                <MenuItem icon={<PasswordIcon />} onClick={() => liElementClicked(res.path, res.description, res.name)}
                                    className={
                                        selectedMenuItem === res.name
                                            ? 'active-menu-item'
                                            : 'default-menu-item-text'
                                    }>
                                    <span className="default-menu-item-text">{res.name}</span>
                                    {/* <span className="full-menu-item-text">{res.name}</span> */}
                                </MenuItem>
                            </div>
                        );
                    }
                    return null;
                })}
            </>
        )
    }


    return (
        <div style={{ display: "flex", height: "100vh" }} >
            <div className="sidebar-container">
                <Sidebar className="app">
                    <Menu>
                        <div className="menu1 flex items-center justify-between w-full px-4 sm:px-6">
                            <div className="flex items-center">
                                <img src={logo1} alt="Logo" className="w-8 h-8 mr-2" />
                                <span className="text-black font-semibold text-sm sm:text-base">
                                    Central Pollution Control Board
                                </span>
                            </div>
                            <button
                                onClick={props.toggleSideNavOff}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                                className="ml-auto sm:ml-4"
                            >
                                <i
                                    className="fa fa-chevron-left"
                                    style={{ fontSize: '15px', color: 'black' }}
                                    aria-hidden="true"
                                ></i>
                            </button>
                        </div>

                        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderDashboardMenu()}
                        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderMonitoringMenu()}
                        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderOperationMenu()}
                        {(getLvl() == 'CPCB') && renderAnnualReports()}
                        {(getLvl() == 'STT') && renderAnnualReportsSpcb()}
                        {(getLvl() == 'RGD') && renderAnnualReportsRgd()}
                        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF' && (getLvl() !== 'STT')) && renderDirectoryMenu()}
                        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderAdminMenu()}
                        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderMapMenu()}
                        {(getLvl() == 'HCF' && getLvl() !== 'CBWTF') && renderHCFLoginMenu()}
                        {(getLvl() == 'HCF' && getLvl() !== 'CBWTF') && renderHCFLoginAccMenu()}
                        {(getLvl() == 'CBWTF' && getLvl() !== 'HCF') && renderCBWTFLoginMenu()}
                        {(getLvl() == 'CBWTF' && getLvl() !== 'HCF') && renderCBWTFLoginAccMenu()}
                    </Menu>
                </Sidebar>
            </div>
        </div>
    );
};
export default NewSidebar;
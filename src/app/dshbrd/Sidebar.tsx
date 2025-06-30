import React from "react";
import avtar from './images/faces/face1.jpg'

const Sidebar=()=>{
    return (
        <nav className="sidebar sidebar-offcanvas" id="sidebar">
            <ul className="nav">
                <li className="nav-item nav-profile">
                    <a href="#" className="nav-link">
                        <div className="nav-profile-image">
                            <img src={avtar} alt="profile"/>
                            <span className="login-status online"/>

                        </div>
                        <div className="nav-profile-text d-flex flex-column">
                            <span className="font-weight-bold mb-2">Sandeep Singh</span>
                            <span className="text-[#6c757d] text-small">Project Manager</span>
                        </div>
                        <i className="mdi mdi-bookmark-check text-success nav-profile-badge"/>
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/">
                        <span className="menu-title">Dashboard</span>
                        <i className="mdi mdi-home menu-icon"/>
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-bs-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
                        <span className="menu-title">Central Pollution Board</span>
                        <i className="menu-arrow"/>
                        <i className="mdi mdi-crosshairs-gps menu-icon"/>
                    </a>
                    <div className="collapse" id="ui-basic">
                        <ul className="nav flex-column sub-menu">
                            <li className="nav-item"> <a className="nav-link" href="/">Add Stock</a></li>
                            <li className="nav-item"> <a className="nav-link" href="/">Available Stock</a></li>
                        </ul>
                    </div>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/">
                        <span className="menu-title">Regional Directorate</span>
                        <i className="mdi mdi-contacts menu-icon"/>
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/">
                        <span className="menu-title">State Board</span>
                        <i className="mdi mdi-format-list-bulleted menu-icon"/>
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/">
                        <span className="menu-title">Incinerator</span>
                        <i className="mdi mdi-chart-bar menu-icon"/>
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/">
                        <span className="menu-title">Customer Report</span>
                        <i className="mdi mdi-table-large menu-icon"/>
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" data-bs-toggle="collapse" href="#general-pages" aria-expanded="false" aria-controls="general-pages">
                        <span className="menu-title">Setting</span>
                        <i className="menu-arrow"/>
                        <i className="mdi mdi-medical-bag menu-icon"/>
                    </a>
                    <div className="collapse" id="general-pages">
                        <ul className="nav flex-column sub-menu">
                            <li className="nav-item"> <a className="nav-link" href="/"> Change Password</a></li>
                            <li className="nav-item"> <a className="nav-link" href="/"> Set GST rate </a></li>
                            
                        </ul>
                    </div>
                </li>

            </ul>
        </nav>
    )
};

export  default Sidebar;
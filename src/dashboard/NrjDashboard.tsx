import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FiRefreshCcw } from "react-icons/fi";
import { Button, SvgIcon } from "@mui/material";
import CPCB_Logo from '../images/CPCB_Logo.jpg'
import { nrjAxiosRequestLinux } from "../Hooks/useNrjAxios"; 
import utilities, {
  GetResponseLnx,
  GetResponseWnds,
  capitalize,
  capitalizeTerms,
  convertFldValuesToJson,
  convertFldValuesToString,
  getCmpId,
  getStateAbbreviation,
  getUsrnm,
  postLinux,
} from "../utilities/utilities";

import { 
  FiHome, 
  FiList, 
  FiAlertCircle, 
  FiCornerUpLeft,
  FiSettings,
  FiUsers,
  FiFileText,
  FiLogOut,
  FiGrid
} from "react-icons/fi";



const Dashboard = () => {
  const navigate = useNavigate();


  const [userRole] = useState("Admin"); // In a real app, this would come from auth context

  const handleLogout = () => {
    // Clear session/local storage
    sessionStorage.removeItem("isLoggedOut");
    // Redirect to login
    navigate("/login");
  };


  const [activeMenu, setActiveMenu] = useState("Dashboard");

   const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    unassigned: 0,
    revertedToHelpDesk: 0,
    withOfficers: 0,
    revertedToDivision: 0,
    underReview: 0,
    closed: 0
  });

  const [departmentStats, setDepartmentStats] = useState([
    { name: "DH LJPC - II", count: 0 },
    { name: "DHIT", count: 0 },
    { name: "Type Not Defined", count: 0 }
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Example API call - adjust to your actual endpoint
        const payload = {
          // Your payload structure here
        //   gid: utilities(3, "", ""),
          cmd: "getDashboardStats"
        };

        const response = await nrjAxiosRequestLinux('dashboard', payload);
        const data = GetResponseLnx(response); // Assuming you have this helper

        if (data && data.success) {
          setStats({
            unassigned: data.unassigned || 0,
            revertedToHelpDesk: data.revertedToHelpDesk || 0,
            withOfficers: data.withOfficers || 0,
            revertedToDivision: data.revertedToDivision || 0,
            underReview: data.underReview || 0,
            closed: data.closed || 0
          });

          setDepartmentStats(data.departments || [
            { name: "DH LJPC - II", count: 0 },
            { name: "DHIT", count: 0 },
            { name: "Type Not Defined", count: 0 }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Stats remain at 0 if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const refreshData = async () => {
    // Same implementation as fetchDashboardData
    // You might want to extract this to a separate function
  };

  const handleMenuClick = (menuItem: string) => {
    setActiveMenu(menuItem);
    // In a real app, this would navigate to different pages or load different data
    console.log(`Navigating to ${menuItem}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header (same as login) */}
      <header className="flex w-full items-center justify-between px-4 py-2 gap-x-2 md:gap-x-4 bg-white shadow-md">
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
            <span className="font-semibold md:text-left font-sans">Change Government of India</span>
          </div>
        </div>
        <div className="text-center flex-1 max-w-[250px] sm:max-w-[380px] md:max-w-[450px] lg:max-w-[500px] xl:max-w-[650px] 2xl:max-w-full">
          <span className="text-xs md:text-md lg:text-lg font-semibold text-[#283593] leading-tight lg:whitespace-normal 2xl:whitespace-nowrap">
            Centralised Bar Code System For Tracking of Biomedical Waste - CBST-BMW
          </span>
        </div>
        <div className="flex items-center gap-x-2 md:gap-x-4 shrink-0">
          <img src={CPCB_Logo} alt="CPCB Logo" className="h-10 md:h-14 lg:h-16" />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaR0MDuxr4P1nT7tcj-j7FLNCz3GyW_ioo6Q&s"
            alt="Logo 4"
            className="h-10 md:h-14 w-20 md:w-24"
          />
        </div>
      </header>




        {/* NEW: Top Menu Bar */}
    <div className="bg-blue-500 text-white px-4 py-2 shadow-md">
  <div className="container mx-auto flex justify-between items-center">
    <div className="flex space-x-4">
      <button 
        onClick={() => navigate("/dashboard")}
        className="flex items-center hover:bg-blue-700 px-3 py-1 rounded transition-colors"
      >
        <FiHome className="mr-2" />
        Home
      </button>
    </div>
    
    <div className="flex items-center space-x-4">
      <span className="text-sm">
        Logged in as: <span className="font-semibold">{userRole}</span>
      </span>
      <button
        onClick={handleLogout}
        className="flex items-center bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
      >
        <FiLogOut className="mr-2" />
        Logout
      </button>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-black text-white p-4 shadow-lg">
          <h2 className="text-xl font-bold mb-6 ml-8">Ticket Tracker</h2>
          
          {/* <nav>
            <ul className="space-y-2">
              {["Dashboard", "All Tickets", "Open Tickets", "Reverted Tickets"].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeMenu === item ? 'bg-blue-500' : 'hover:bg-blue-500'}`}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav> */}


          <nav>
            <ul className="space-y-2">
                {[
                { name: "Dashboard", icon: <FiGrid className="mr-3" /> },
                { name: "All Tickets", icon: <FiList className="mr-3" /> },
                { name: "Open Tickets", icon: <FiAlertCircle className="mr-3" /> },
                { name: "Reverted Tickets", icon: <FiCornerUpLeft className="mr-3" /> },
                // { name: "User Management", icon: <FiUsers className="mr-3" /> },
                // { name: "Reports", icon: <FiFileText className="mr-3" /> },
                // { name: "Settings", icon: <FiSettings className="mr-3" /> }
                ].map((item) => (
                <li key={item.name}>
                    <button
                    onClick={() => handleMenuClick(item.name)}
                    className={`w-full flex items-center text-left px-4 py-3 rounded-lg transition-colors ${
                        activeMenu === item.name 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-300 hover:bg-blue-500 hover:text-white'
                    }`}
                    >
                    {item.icon}
                    {item.name}
                    </button>
                </li>
                ))}
            </ul>
            </nav>

          

        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            {/* <button 
              onClick={refreshData}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCcw />
              Refresh
            </button> */}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard 
              title="UNASSIGNED TICKETS" 
              value={stats.unassigned} 
              bgColor="bg-red-100" 
              textColor="text-red-800"
            />
            <StatCard 
              title="REVERTED TO HELP DESK" 
              value={stats.revertedToHelpDesk} 
              bgColor="bg-yellow-100" 
              textColor="text-yellow-800"
            />
            <StatCard 
              title="TICKETS WITH OFFICERS" 
              value={stats.withOfficers} 
              bgColor="bg-blue-100" 
              textColor="text-blue-800"
            />
            <StatCard 
              title="REVERTED TO DIVISION" 
              value={stats.revertedToDivision} 
              bgColor="bg-purple-100" 
              textColor="text-purple-800"
            />
            <StatCard 
              title="TICKETS UNDER REVIEW" 
              value={stats.underReview} 
              bgColor="bg-green-100" 
              textColor="text-green-800"
            />
            <StatCard 
              title="CLOSED TICKETS" 
              value={stats.closed} 
              bgColor="bg-gray-100" 
              textColor="text-gray-800"
            />
          </div>

          {/* Department-wise Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Department-Wise</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departmentStats.map((dept, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard Component for reusable stat blocks
const StatCard = ({ title, value, bgColor, textColor }: { title: string, value: number, bgColor: string, textColor: string }) => {
  return (
    <div className={`${bgColor} p-6 rounded-lg shadow-sm`}>
      <div className={`text-4xl font-bold mb-2 ${textColor}`}>{value}</div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
    </div>
  );
};

export default Dashboard;
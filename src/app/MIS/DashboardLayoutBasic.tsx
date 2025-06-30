import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import BlockIcon from '@mui/icons-material/Block';
import BusinessIcon from '@mui/icons-material/Business';
import { getLvl } from "src/utilities/cpcb";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import overview from 'src/app/assests/overview (1).png';
import bags_reports from 'src/app/assests/bags_reports.png';
import analytics from 'src/app/assests/analytics.png';
import operation from 'src/app/assests/system-integration.png';
import reports from 'src/app/assests/report.png';
import directory from 'src/app/assests/directory.png';
import admin from 'src/app/assests/administrator.png';
import map from 'src/app/assests/location.png';
import user from 'src/app/assests/user2.png';
import dashboardicon from 'src/app/assests/dashboard.png';
import { Avatar, Menu, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { capitalizeTerms, postLinux } from "src/utilities/utilities";
import { nrjAxiosRequestLinux } from "src/Hooks/useNrjAxios";
import { useToaster } from "src/components/reusable/ToasterContext";
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
// Drawer and AppBar styles remain unchanged
const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  })
);

interface DashboardLayoutBasicProps {
  cbwtfMenu: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  dashboard: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  monitoringCBWTF: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  monitoringHCF: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  operations: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  bagsReport: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  statisticsArrMenu: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  annualFormReport: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  sttAnnualRpt: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  rgdAnnualRpt: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  DirectoryArr: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  showProfile: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  profileDetails: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  mapMenu: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  hcfLoginMenu: { name: string; hide: boolean; path: string; description: string; icon: JSX.Element }[];
  setPageTitles: string;
}

const DashboardLayoutBasic: React.FC<DashboardLayoutBasicProps> = ({
  cbwtfMenu,
  setPageTitles,
  dashboard,
  monitoringCBWTF,
  monitoringHCF,
  bagsReport,
  operations,
  statisticsArrMenu,
  annualFormReport,
  rgdAnnualRpt,
  sttAnnualRpt,
  DirectoryArr,
  showProfile,
  profileDetails,
  mapMenu,
  hcfLoginMenu,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState<string | null>(location.pathname);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const openMenu = Boolean(anchorEl);

  type MenuKeys = 'overview' | 'cbwtf' | 'hcf' | 'operations' | 'bagsreports' | 'statistics' | 'annualrepotrs' | 'annual' | 'directory' | 'admin' | 'map' | 'hcflogin' | 'cbwtflogin';

  const [menuState, setMenuState] = useState<Record<MenuKeys, boolean>>({
    overview: false,
    cbwtf: false,
    hcf: false,
    operations: false,
    bagsreports: false,
    statistics: false,
    annualrepotrs: false,
    annual: false,
    directory: false,
    admin: false,
    map: false,
    hcflogin: false,
    cbwtflogin: false,
  });

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setAdminMenuOpen(false);
  };

  const handleLogout = () => {
    handleMenuClose();
    setAnchorEl(null); // Close the menu
    refetchC();
  };

  const handleGotoProfile = (path: string) => {
    setAnchorEl(null); // Close the menu
    navigate(path)
  }

  const handleAdminMenuClick = () => {
    setAdminMenuOpen(!adminMenuOpen); // Toggle the Admin submenu visibility
  };

  const { showToaster } = useToaster();

  const { refetch: refetchC } = useQuery({
    queryKey: ['logout'],
    queryFn: logoutApi,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: logoutApiSuccess,
  });

  const [is_expired, setIsExpired] = useState(false);
      
      useEffect(() => {
      const expiredValue = sessionStorage.getItem('isExpired');
      if (expiredValue !== null && expiredValue === '1') {
      setIsExpired(true);
      }
      }, []);

  function logoutApi() {
    let base64Data = sessionStorage.getItem('isLoggedOut') || "";
    let jsonData = atob(base64Data);
    if (jsonData) {
      let data = JSON.parse(jsonData);
      let payload: any = postLinux('M/SSM110041DLCDG6042' + "=" + '22ffd3cb69804c3ba561aee92606f4bc', "logout");
      return nrjAxiosRequestLinux('logout', payload);
    } else {
      showToaster(["Please try again !!!"], 'error');
    }
  }

  function logoutApiSuccess(data: any) {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  }

  useEffect(() => {
    setSelectedMenu(location.pathname); // Update selected menu on route change
  }, [location.pathname]);

  useEffect(() => {
    if (!open) {
      setMenuState({
        overview: false,
        cbwtf: false,
        hcf: false,
        operations: false,
        bagsreports: false,
        statistics: false,
        annualrepotrs: false,
        annual: false,
        directory: false,
        admin: false,
        map: false,
        hcflogin: false,
        cbwtflogin: false,
      });
    } else if (selectedMenu) {
      setMenuState((prev) => ({
        ...prev,
        overview: monitoringCBWTF.some((item) => item.path === selectedMenu) ||
          monitoringHCF.some((item) => item.path === selectedMenu),
        cbwtf: monitoringCBWTF.some((item) => item.path === selectedMenu),
        hcf: monitoringHCF.some((item) => item.path === selectedMenu),
        operations: operations.some((item) => item.path === selectedMenu),
        bagsreports: bagsReport.some((item) => item.path === selectedMenu),
        statistics: statisticsArrMenu.some((item) => item.path === selectedMenu),
        annualrepotrs: annualFormReport.some((item) => item.path === selectedMenu) ||
          rgdAnnualRpt.some((item) => item.path === selectedMenu) ||
          sttAnnualRpt.some((item) => item.path === selectedMenu),
        annual: annualFormReport.some((item) => item.path === selectedMenu) ||
          rgdAnnualRpt.some((item) => item.path === selectedMenu) ||
          sttAnnualRpt.some((item) => item.path === selectedMenu),
        directory: DirectoryArr.some((item) => item.path === selectedMenu),
        admin: showProfile.some((item) => item.path === selectedMenu),
        map: mapMenu.some((item) => item.path === selectedMenu),
        hcflogin: hcfLoginMenu.some((item) => item.path === selectedMenu),
        cbwtflogin: cbwtfMenu.some((item) => item.path === selectedMenu),
      }));
    }
  }, [open, selectedMenu]);

  const toggleMenu = (menu: MenuKeys) => {
    setMenuState((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const getHighlight = (isActive: boolean) => ({
    bgcolor: isActive ? "rgba(19, 114, 215, 0.4) !important" : "transparent",
    color: isActive ? "black" : "#333",
    "&:hover": {
      bgcolor: "rgba(8, 52, 100, 0.83)",
      color: "white",
    },
    borderRadius: "6px",
    fontWeight: isActive ? "bold" : "normal",
    padding: open ? "8px 16px" : "8px",
  });

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const renderDashboardMenu = () => (
    <List>
      {dashboard.filter((item) => !item.hide).map((item, index) => {
        const isSelected = location.pathname === item.path;

        return (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              onClick={() => {
                if (!open) {
                  handleDrawerOpen();
                } else {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }
              }}
              sx={getHighlight(isSelected)}
            >
              <ListItemIcon
                sx={{
                  minWidth: open ? "auto" : "56px",
                  justifyContent: open ? "flex-start" : "center",
                  display: "flex",
                  mr: open ? 2 : 0,
                  color: isSelected ? "rgba(19, 114, 215, 0.8)" : "black",
                }}
              >
                <img
                  src={dashboardicon}
                  alt="dashboard"
                  style={{
                    filter: isSelected
                      ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                      : "none",
                  }}
                />
              </ListItemIcon>
              {open && <ListItemText primary={capitalizeTerms(item.name)} />}
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  const handleHomeClickHCF = () => {
    if (getLvl() == "HCF") {
      navigate('/hcfAnnlRptFormTab'); // Change the path as needed
    } else {
      navigate('/cbwtfAnnulRpt'); // Change the path as needed
    }

  };


  const renderOverviewMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("overview");
            }
          }}
          sx={getHighlight(
            location.pathname.includes("overview") ||
            monitoringCBWTF.some((item) => item.path === location.pathname) ||
            monitoringHCF.some((item) => item.path === location.pathname)
          )}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color:
                location.pathname.includes("overview") ||
                  monitoringCBWTF.some((item) => item.path === location.pathname) ||
                  monitoringHCF.some((item) => item.path === location.pathname)
                  ? "rgba(19, 114, 215, 0.8)"
                  : "black",
            }}
          >
            <img
              src={overview}
              alt="overview"
              style={{
                filter:
                  location.pathname.includes("overview") ||
                    monitoringCBWTF.some((item) => item.path === location.pathname) ||
                    monitoringHCF.some((item) => item.path === location.pathname)
                    ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                    : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="Overview" />}
          {open && (menuState.overview ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.overview && open && (
        <>
          <List sx={{ pl: 4 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => toggleMenu("cbwtf")}
                sx={getHighlight(monitoringCBWTF.some((item) => item.path === location.pathname))}
              >
                <ListItemText primary="CBWTF" />
                {menuState.cbwtf ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            {menuState.cbwtf && (
              <List sx={{ pl: 4 }}>
                {monitoringCBWTF.filter((item) => !item.hide).map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        setSelectedMenu(item.path);
                        handleDrawerClose();
                      }}
                      sx={getHighlight(location.pathname === item.path || location.pathname === "hcflist")}
                    >
                      <div
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        <ListItemText primary={capitalizeTerms(item.name)} /></div>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </List>
          <List sx={{ pl: 4 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => toggleMenu("hcf")}
                sx={getHighlight(monitoringHCF.some((item) => item.path === location.pathname))}
              >
                <ListItemText primary="HCF" />
                {menuState.hcf ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            {menuState.hcf && (
              <List sx={{ pl: 4 }}>
                {monitoringHCF.filter((item) => !item.hide).map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(item.path);
                        setSelectedMenu(item.path);
                        handleDrawerClose();
                      }}
                      sx={getHighlight(location.pathname === item.path)}
                    >
                      <div
                        style={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        <ListItemText primary={capitalizeTerms(item.name)} /></div>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </List>
        </>
      )}
    </List>
  );

  const renderOperationsmenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("operations");
            }
          }}
          sx={getHighlight(operations.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: operations.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={operation}
              alt="operations"
              style={{
                filter: operations.some((item: any) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="Operation" />}
          {open && (menuState.operations ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.operations && open && (
        <List sx={{ pl: 4 }}>
          {operations.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  {/* <ListItemText primary={item.name} /></div> */}
                  <ListItemText primary={capitalizeTerms(item.name)} /></div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );


  const renderBagsReportMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("bagsreports");
            }
          }}
          sx={getHighlight(bagsReport.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: bagsReport.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={bags_reports}
              alt="bags_reports"
              style={{
                filter: bagsReport.some((item) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="Bags report" />}
          {open && (menuState.bagsreports ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.bagsreports && open && (
        <List sx={{ pl: 4 }}>
          {bagsReport.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  <ListItemText primary={capitalizeTerms(item.name)} /></div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );

  const renderStatisticsReportMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("statistics");
            }
          }}
          sx={getHighlight(statisticsArrMenu.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: statisticsArrMenu.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={analytics}
              alt="analytics"
              style={{
                filter: statisticsArrMenu.some((item) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="Statistics" />}
          {open && (menuState.statistics ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.statistics && open && (
        <List sx={{ pl: 4 }}>
          {statisticsArrMenu.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  <ListItemText primary={capitalizeTerms(item.name)} /></div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );

  const renderAnnualReportMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("annualrepotrs");
            }
          }}
          sx={getHighlight(annualFormReport.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: annualFormReport.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={reports}
              alt="reports"
              style={{
                filter: annualFormReport.some((item) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="Annual reports" />}
          {open && (menuState.annualrepotrs ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.annualrepotrs && open && (
        <List sx={{ pl: 4 }}>
          {annualFormReport.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  <ListItemText primary={capitalizeTerms(item.name)} /></div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );

  const renderRgdAnnualReportMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("annualrepotrs");
            }
          }}
          sx={getHighlight(rgdAnnualRpt.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: rgdAnnualRpt.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={reports}
              alt="analytics"
              style={{
                filter: rgdAnnualRpt.some((item) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="Annual reports" />}
          {open && (menuState.annualrepotrs ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.annualrepotrs && open && (
        <List sx={{ pl: 4 }}>
          {rgdAnnualRpt.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  <ListItemText primary={capitalizeTerms(item.name)} /></div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );

  const renderSttAnnualReportMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("annualrepotrs");
            }
          }}
          sx={getHighlight(sttAnnualRpt.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: sttAnnualRpt.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={reports}
              alt="analytics"
              style={{
                filter: sttAnnualRpt.some((item) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="Annual reports" />}
          {open && (menuState.annualrepotrs ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.annualrepotrs && open && (
        <List sx={{ pl: 4 }}>
          {sttAnnualRpt.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  <ListItemText primary={capitalizeTerms(item.name)} /></div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );

  const renderDirectoryMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("directory");
            }
          }}
          sx={getHighlight(DirectoryArr.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: DirectoryArr.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={directory}
              alt="directory"
              style={{
                filter: DirectoryArr.some((item) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="Directory" />}
          {open && (menuState.directory ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.directory && open && (
        <List sx={{ pl: 4 }}>
          {DirectoryArr.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  <ListItemText primary={capitalizeTerms(item.name)} /></div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );

  const renderAdminMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("admin");
            }
          }}
          sx={getHighlight(showProfile.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: showProfile.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={admin}
              alt="admin"
              style={{
                filter: showProfile.some((item) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="Admin" />}
          {open && (menuState.admin ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.admin && open && (
        <List sx={{ pl: 4 }}>
          {showProfile.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  <ListItemText primary={capitalizeTerms(item.name)} /></div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );

  const renderMapMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("map");
            }
          }}
          sx={getHighlight(mapMenu.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: mapMenu.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={map}
              alt="map"
              style={{
                filter: mapMenu.some((item) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="Map" />}
          {open && (menuState.map ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.map && open && (
        <List sx={{ pl: 4 }}>
          {mapMenu.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  <ListItemText primary={capitalizeTerms(item.name)} /></div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );

  const renderHCFLoginMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("hcflogin");
            }
          }}
          sx={getHighlight(hcfLoginMenu.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: hcfLoginMenu.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={reports}
              alt="reports"
              style={{
                filter: hcfLoginMenu.some((item) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {/* {open && <ListItemText primary="HCF details" />} */}
          {/* {open && (menuState.hcflogin ? <ExpandLess /> : <ExpandMore />)} */}
        </ListItemButton>
      </ListItem>

      {menuState.hcflogin && open && (
        <List sx={{ pl: 4 }}>
          {hcfLoginMenu.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  {item.name == "Fill Annual Report as per BMWM Rules, 2016" && <ListItemText primary={item.name} />}</div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );





  const renderCBWTFLoginMenu = () => (
    <List>
      <ListItem disablePadding sx={{ display: "block" }}>
        <ListItemButton
          onClick={() => {
            if (!open) {
              handleDrawerOpen();
            } else {
              toggleMenu("cbwtflogin");
            }
          }}
          sx={getHighlight(cbwtfMenu.some((item) => item.path === location.pathname))}
        >
          <ListItemIcon
            sx={{
              minWidth: open ? "auto" : "56px",
              justifyContent: open ? "flex-start" : "center",
              display: "flex",
              mr: open ? 2 : 0,
              color: cbwtfMenu.some((item) => item.path === location.pathname)
                ? "rgba(19, 114, 215, 0.8)"
                : "black",
            }}
          >
            <img
              src={reports}
              alt="reports"
              style={{
                filter: cbwtfMenu.some((item) => item.path === location.pathname)
                  ? "brightness(0) saturate(100%) invert(31%) sepia(85%) saturate(572%) hue-rotate(194deg) brightness(95%) contrast(88%)"
                  : "none",
              }}
            />
          </ListItemIcon>
          {open && <ListItemText primary="CBWTF Details" />}
          {open && (menuState.cbwtflogin ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      {menuState.cbwtflogin && open && (
        <List sx={{ pl: 4 }}>
          {cbwtfMenu.filter((item) => !item.hide).map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setSelectedMenu(item.path);
                  handleDrawerClose();
                }}
                sx={getHighlight(location.pathname === item.path)}
              > <div
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                }}
              >
                  <ListItemText primary={capitalizeTerms(item.name)} /></div>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </List>
  );

  // const capitalizeTerms = (label: string) => {
  //   const specialTerms = ['CBWTF', 'HCF', 'RD','CBWTFs','SPCB','RDs','SPCBs','SPCB/PCC','SPCBs/PCC'];

  //   return label
  //     .toLowerCase()
  //     .replace(/(^\w{1})|(\.\s*\w{1})/g, (match) => match.toUpperCase())
  //     .replace(new RegExp(`\\b(${specialTerms.join('|')})\\b`, 'gi'), (match) => match.toUpperCase());
  // };



  const getIcon = (name: string) => {
    if (name === "HCF details" || name === "CBWTF details") return <BusinessIcon sx={{ mr: 1 }} />;
    if (name === "Change password") return <LockIcon sx={{ mr: 1 }} />;
    if (name === "Change password RDs") return <LockIcon sx={{ mr: 1 }} />
    if (name === "Change password SPCBs/PCC") return <LockIcon sx={{ mr: 1 }} />
    if (name === "Sign out") return <LogoutIcon sx={{ mr: 1 }} />;
    if (name === "Block User List") return <BlockIcon sx={{ mr: 1 }} />;
    if (name === "Admin") return <AdminPanelSettingsIcon sx={{ mr: 1 }} />;
    return <AccountCircleIcon sx={{ mr: 1 }} />;
  };

  const getFilteredMenuItems = () => {
    const level = getLvl();
    if (level === "HCF") return hcfLoginMenu.filter(item => !item.hide && item.name !== "Fill annual report as per BMWM rules, 2016");
    if (level === "CBWTF") return cbwtfMenu.filter(item => !item.hide && item.name !== "CBWTF annual report");
    return profileDetails.filter(item => !item.hide);
  };

  const menuItems = getFilteredMenuItems();






  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          {getLvl() === "HCF" || getLvl() === "CBWTF" ? (
            <IconButton
              color="inherit"
              aria-label="go to home"
              onClick={handleHomeClickHCF}
              edge="start"
              sx={{
                ml: 0,
                transition: "transform 0.3s ease", // Smooth transition without shadow
                "&:hover": {
                  transform: "scale(1.2) rotate(10deg)", // Scale and rotate effect on hover
                  color: "white", // Change icon color to white
                  backgroundColor: "transparent", // Remove background color on hover
                  boxShadow: "none", // Remove any shadow effect
                },
              }}
            >
              <HomeIcon sx={{ fontSize: 40, mr: 3 }} />
            </IconButton>

          ) : (
             // Check if is_expired is false
            !is_expired && (
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={() => (open ? handleDrawerClose() : handleDrawerOpen())}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
             )
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>

            {capitalizeTerms(setPageTitles)}
          </Typography>


          <Box>
            <IconButton
              onClick={handleMenuClick} sx={{ ml: 2, p: 0, transition: "transform 0.3s ease-in-out", "&:hover": { transform: "scale(1.15) rotate(5deg)", }, }}>
              <Avatar src={user} alt="Profile"
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  border: "3px solid transparent",
                  background: "linear-gradient(white, white) padding-box, linear-gradient(135deg,rgb(26, 99, 225),hsl(218, 76.70%, 48.80%)) border-box",
                  boxShadow: "0px 4px 15px rgba(66, 26, 152, 0.3)",
                  transition: "all 0.4s ease-in-out",
                  position: "relative", "&:hover": {
                    boxShadow: "0px 10px 20px rgba(37, 117, 252, 0.6)",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: "-3px",
                    left: "-3px",
                    right: "-3px",
                    bottom: "-3px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ff9a9e, #fad0c4, #fad0c4)",
                    zIndex: -1,
                    filter: "blur(8px)", // Glow effect
                    transition: "opacity 0.4s ease-in-out",
                    opacity: 0,
                  },
                  "&:hover::after": {
                    opacity: 1, // Glow appears on hover
                  },
                }}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {/* {menuItems.map((item) => (
                <MenuItem key={item.name} onClick={() => handleGotoProfile(item.path)}>
                  {getIcon(item.name)}
                  <span style={{ marginLeft: 8 }}>{capitalizeTerms(item.name)}</span>
                </MenuItem>
              ))} */}

              {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF' && !is_expired) &&  (
                <div key="admin-menu">
                  <MenuItem onClick={handleAdminMenuClick}>
                    {getIcon("Admin")} Admin
                  </MenuItem>
                  {adminMenuOpen && (
                    showProfile.filter(i => !i.hide).map(subItem => (
                      <MenuItem key={subItem.name} onClick={() => handleGotoProfile(subItem.path)}>
                        {getIcon(subItem.name)}
                        <span style={{ marginLeft: 8 }}>{capitalizeTerms(subItem.name)}</span>
                      </MenuItem>
                    ))
                  )}
                </div>
              )}

              {menuItems.map((item) => (
                <MenuItem key={item.name} onClick={() => handleGotoProfile(item.path)}>
                  {getIcon(item.name)}
                  <span style={{ marginLeft: 8 }}>{capitalizeTerms(item.name)}</span>
                </MenuItem>
              ))}



              <MenuItem onClick={handleLogout}>
                {getIcon("Sign out")}
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      {!is_expired && (
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.5rem", color: "#283593", textAlign: "center", width: "100%" }}>
                CBST-BMW
              </Typography>
            </Box>
          </Box>
        </DrawerHeader>
        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderDashboardMenu()}
        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderOverviewMenu()}
        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderOperationsmenu()}
        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderBagsReportMenu()}
        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderStatisticsReportMenu()}
        {(getLvl() == 'CPCB') && renderAnnualReportMenu()}
        {(getLvl() == 'RGD') && renderRgdAnnualReportMenu()}
        {(getLvl() == 'STT') && renderSttAnnualReportMenu()}
        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF' && (getLvl() !== 'STT')) && renderDirectoryMenu()}
        {/* {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderAdminMenu()}*/}
        {(getLvl() !== 'HCF' && getLvl() !== 'CBWTF') && renderMapMenu()} 
        {/* {(getLvl() == 'HCF' && getLvl() !== 'CBWTF') && renderHCFLoginMenu()} */}
        {/* {(getLvl() == 'CBWTF' && getLvl() !== 'HCF') && renderCBWTFLoginMenu()} */}
        {/* Add other render functions here */}
      </Drawer>
      )}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayoutBasic;
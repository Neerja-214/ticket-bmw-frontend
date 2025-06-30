import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router";
import { FiRefreshCcw } from "react-icons/fi";
import { Button, SvgIcon } from "@mui/material";
import utilities, {
  GetResponseLnx,
  postLinux,
  generateRandomAlphanumeric,
  setCmpId,
  setUsrId,
} from "../utilities/utilities";
import { useToaster } from "../components/reusable/ToasterContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { nrjAxiosRequestBio, nrjAxiosRequestLinux } from "../Hooks/useNrjAxios";
import CPCB_Logo from '../images/CPCB_Logo.jpg'

// Define action types
const ACTIONS = {
  DISABLEA: "disableA",
};

// Define initial state
const initialState = {
  disableA: 1,
};

type State = {
  disableA: number;
};

type Action = {
  type: string;
  payload: any;
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case ACTIONS.DISABLEA:
      return { ...state, disableA: action.payload };
    default:
      return state;
  }
};

const NrjLogin = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { showToaster } = useToaster();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [uuid, setUuid] = useState("");
  const [selectedType, setSelectedType] = useState("Admin");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const getGid = () => {
    let g: any = utilities(3, "", "");
    return g;
  };

  const reloadCaptcha = () => {
    let gid = getGid();
    let payload: any = postLinux(gid, 'getCaptcha')
    nrjAxiosRequestLinux('captcha', payload).then((res: any) => {
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

  useEffect(() => {
    reloadCaptcha();
  }, []);

  const onChangeEmail = (event: any) => {
    setEmail(event.target.value);
  };

  const onChangePassword = (event: any) => {
    setPassword(event.target.value);
  };

  const onChangeCaptcha = (event: any) => {
    setCaptcha(event.target.value);
  };

  const handleTypeChange = (event: any) => {
    setSelectedType(event.target.value);
  };

  const togglePassword = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const ChckLgn = () => {
    dispatch({ type: ACTIONS.DISABLEA, payload: 0 });
    if (email && email.length > 0) {
      if (password && password.length > 0 && captcha) {
        let payload: any = postLinux(
          email + "|" + password + "|" + (selectedType === "Admin" ? "1" : "2") + "|" + captcha + "|" + uuid,
          "login",
          true
        );
        const result = utilities(0, "check_Login", payload);
        if (result) {
          // Log the result to debug
          console.log("Utilities result for login:", result);
          (result as unknown as Promise<any>).then((res: any) => {
            let isloggedoutJson = {
              by: generateRandomAlphanumeric(10),
              usrnm: email,
              ky: generateRandomAlphanumeric(10),
            };
            sessionStorage.setItem("isLoggedOut", btoa(JSON.stringify(isloggedoutJson)));
            dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
            let ary: any[] = [res.data];
            if (ary && ary[0]["id"] && ary[0]["id"] != "0") {
              if (Number(ary[0]["id"]) > 100) {
                ary[0]["_cmp"] ? setCmpId(ary[0]["_cmp"]) : setCmpId(ary[0]["cmpid"]);
                ary[0]["_usr"] ? setUsrId(ary[0]["_usr"]) : setUsrId(ary[0]["usrid"]);
                sessionStorage.setItem("mainid", ary[0]["id"]);
                sessionStorage.setItem("brd", ary[0]["cpcbof"]);
                if (!ary && Number(ary[0]["pswage"]) >= 150) {
                  navigate("/changePwd?login=false");
                } else {
                  setTimeout(() => {
                    showToaster(["Successfully logged in"], "success");
                  }, 0);
                  navigate("/dashboardvb");
                }
              } else {
                sessionStorage.removeItem("isLoggedOut");
                showToaster(["Invalid Credentials / Error Login In"], "error");
                dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
                setTimeout(() => {
                  dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
                }, 1900);
              }
            } else {
              setTimeout(() => {
                dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
              }, 1900);
              reloadCaptcha();
              sessionStorage.removeItem("isLoggedOut");
              setCaptcha("");
              dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
              showToaster([ary[0]["cpcbof"]], "error");
            }
          }).catch((error) => {
            console.error("Login error:", error);
            sessionStorage.removeItem("isLoggedOut");
            reloadCaptcha();
            setCaptcha("");
            dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
          });
        } else {
          console.error("Utilities returned undefined for login");
          showToaster(["Failed to initialize login request"], "error");
          dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
        }
      } else {
        dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
        sessionStorage.removeItem("isLoggedOut");
        if (!password && !captcha) {
          showToaster(["Please enter password and captcha"], "error");
        } else if (!password) {
          showToaster(["Please enter password value"], "error");
        } else if (!captcha) {
          showToaster(["Please enter captcha value"], "error");
        }
      }
    } else {
      setEmail("");
      setPassword("");
      sessionStorage.removeItem("isLoggedOut");
      dispatch({ type: ACTIONS.DISABLEA, payload: 1 });
      showToaster(["Please enter email"], "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-900 relative overflow-hidden">
      {/* Header (same as original) */}
      <header className="flex w-full items-center justify-between px-4 py-2 gap-x-2 md:gap-x-4 bg-white">
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

      {/* Background Symbols */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-32 h-32 bg-blue-300 rounded-full opacity-30 animate-blob top-1/4 left-1/4"></div>
        <div className="absolute w-40 h-40 bg-blue-400 rounded-full opacity-30 animate-blob animation-delay-2000 top-1/3 right-1/4"></div>
        <div className="absolute w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-blob animation-delay-4000 bottom-1/4 left-1/3"></div>
      </div>

      {/* Glass Login Form */}
      <div className="flex justify-center items-center min-h-screen relative z-10">
        <div className="bg-gray-200 bg-opacity-20 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full max-w-md mx-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white">BMW Ticketing</h2>
            <h3 className="text-lg font-medium text-white">Login</h3>
          </div>
          <div className="flex justify-center">
            {["Admin", "User"].map((role) => (
              <div key={role} className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedType === role}
                  onChange={handleTypeChange}
                  className="mr-2 text-white"
                />
                <label className="text-white">{role}</label>
              </div>
            ))}
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white">Email</label>
              <input
                type="email"
                value={email}
                onChange={onChangeEmail}
                className="mt-1 p-2 w-full border rounded-lg bg-transparent text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="username@gmail.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Password</label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={onChangePassword}
                  className="mt-1 p-2 w-full border rounded-lg bg-transparent text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-200"
                >
                  {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Captcha</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={captcha}
                  onChange={onChangeCaptcha}
                  className="mt-1 p-2 w-2/3 border rounded-lg bg-transparent text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                  maxLength={6}
                />
                <img src={captchaImage} alt="captcha" className="h-10 w-1/3" />
                <FiRefreshCcw
                  onClick={reloadCaptcha}
                  className="cursor-pointer text-white"
                  size={24}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={ChckLgn}
              disabled={!state.disableA}
              className="w-full py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>

      <style>
        {`
          @keyframes blob {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(20px, 20px) scale(1.1); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .animate-blob {
            animation: blob 15s infinite;
          }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}
      </style>
    </div>
  );
};

export default NrjLogin;
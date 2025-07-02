import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { useToaster } from "../components/reusable/ToasterContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import CPCB_Logo from '../images/CPCB_Logo.jpg';
import { genericPostAPI } from "../services/apiService"; // Import your generic API function

const Registration = () => {
  const { showToaster } = useToaster();
  const [formData, setFormData] = useState({
    // companyName: "",
    role: "CBWTF",
    eprNumber: "",
    fullName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    entityName: "",
    state: ""
  });

    const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };


  interface SignupPayload {
  nme: string;
  eml: string;
  mobile_no: string;
  role: string;
  state: string;
  what_fnct: string;
  company_name?: string;
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

      if (!passwordRegex.test(formData.password)) {
        showToaster([
          "Password must be at least 6 characters and include uppercase, lowercase, and a number"
        ], "error");
        return;
      }
    
    if (formData.password !== formData.confirmPassword) {
      showToaster(["Passwords do not match"], "error");
      return;
    }
    
    // !formData.companyName ||
    if ( !formData.fullName || !formData.email || !formData.contactNumber) {
      showToaster(["Please fill all required fields"], "error");
      return;
    }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showToaster(["Please enter a valid email address"], "error");
        return;
      }

    if (!/^\d{10}$/.test(formData.contactNumber)) {
      showToaster(["Enter a valid 10-digit contact number"], "error");
      return;
    }


    // Password strength check (at least 6 characters, can customize more)
  if (formData.password.length < 6) {
    showToaster(["Password must be at least 6 characters"], "error");
    return;
  }

  // Entity name required for CBWTF or HCF
  const role = formData.role.toLowerCase();
  if ((role === "cbwtf" || role === "hcf") && !formData.entityName.trim()) {
    showToaster([`${formData.role} Name is required`], "error");
    return;
  }
    
    console.log("Form submitted:", formData);
    // showToaster(["Registration successful"], "success");

    const payload: SignupPayload  = {
    nme: formData.fullName, // 👈 Use full name as "User Name"
    eml: formData.email,
    mobile_no: formData.contactNumber,
    // company_name: formData.companyName,
    role: formData.role.toLowerCase(),
    state: formData.state,
    what_fnct: "bmwticket_ticket_tracker_signup"
  };

  if(formData.role.toLowerCase() === "cbwtf" || formData.role.toLowerCase() === "hcf") {
    payload.company_name = formData.entityName; // 👈 Use entity name for CBWTF/HCF
  }

    // console.log("payload:", payload);
    // return;


    setIsSubmitting(true); // 🔒 Disable button

   try {
    const result = await genericPostAPI("bmw/myApp", payload);

    if (result.status === "success") {
      showToaster(["Registration successful"], "success");

      // Reset form
      setFormData({
        role: "CBWTF",
        eprNumber: "",
        fullName: "",
        email: "",
        contactNumber: "",
        password: "",
        confirmPassword: "",
        entityName: "",
        state: ""
      });
    } else {
      showToaster([result.message || "Something went wrong"], "error");
    }
  } catch (error: any) {
    console.error("API error:", error);
    showToaster(["Failed to register. Please try again later."], "error");
  } finally {
    setIsSubmitting(false); // 🔓 Enable button
  }


};
    
  //   setFormData({
  //     companyName: "",
  //     role: "CBWTF",
  //     eprNumber: "",
  //     fullName: "",
  //     email: "",
  //     contactNumber: "",
  //     password: "",
  //     confirmPassword: "",
  //     entityName: "",  // ✅ reset field
  //     state: ""        // ✅ reset field
  //   });
  // };

  // state field added

  const fallbackStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal"
  ];

  const [states, setStates] = useState<string[]>(fallbackStates);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch("https://your-api-url.com/statelist");
        const data = await response.json();
        if (Array.isArray(data.states)) {
          setStates(data.states);
        } else {
          console.warn("Invalid state list from API, using fallback.");
        }
      } catch (error) {
        console.error("Failed to fetch state list, using fallback:", error);
      }
    };
    fetchStates();
  }, []);

  const fallbackRoles = ["CBWTF", "HCF", "SPCB", "RD", "CPCB"];
  const [roles, setRoles] = useState<string[]>(fallbackRoles);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("https://your-api-url.com/roles");
        const data = await response.json();
        if (Array.isArray(data.roles)) {
          setRoles(data.roles);
        } else {
          console.warn("Invalid role list from API, using fallback.");
        }
      } catch (error) {
        console.error("Failed to fetch role list, using fallback:", error);
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-blue-900 relative overflow-y-auto">
      {/* Header */}
      <header className="flex w-full items-center justify-between px-4 py-2 gap-x-2 md:gap-x-4 bg-white z-10">
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
            <span className="font-semibold md:text-left font-sans">
              Change Government of India
            </span>
          </div>
        </div>
        <div className="text-center flex-1 max-w-[250px] sm:max-w-[380px] md:max-w-[450px] lg:max-w-[500px] xl:max-w-[650px] 2xl:max-w-full">
          <span className="text-xs md:text-md lg:text-lg font-semibold leading-tight lg:whitespace-normal 2xl:whitespace-nowrap">
            Centralised Bar Code System For Tracking of Biomedical Waste - CBST-BMW
          </span>
        </div>
        <div className="flex items-center gap-x-2 md:gap-x-4 shrink-0">
          <img src={CPCB_Logo} alt="CPCB Logo" className="h-10 md:h-14 lg:h-16" />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbni:ANd9GcSaR0MDuxr4P1nT7tcj-j7FLNCz3GyW_ioo6Q&s"
            alt="Logo 4"
            className="h-10 md:h-14 w-20 md:w-24"
          />
        </div>
      </header>

      {/* Background Symbols */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-32 h-32 bg-blue-300 rounded-full opacity-30 animate-blob top-1/6 left-1/4"></div>
        <div className="absolute w-40 h-40 bg-blue-400 rounded-full opacity-30 animate-blob animation-delay-2000 top-1/8 right-1/8"></div>
        <div className="absolute w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-blob animation-delay-4000 bottom-1/4 right-2/4"></div>
      </div>

      {/* Registration Form Section */}
      <div className="flex-grow flex justify-center items-center pt-16 pb-8">
        <div className="bg-gray-200 bg-opacity-20 backdrop-blur-sm p-4 rounded-2xl shadow-lg w-full max-w-xl mx-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-white">Registration</h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* User Name */}
            {/* <div>
              <label className="block text-xs font-medium text-white mb-1">User Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                placeholder="Provide the User name"
                required
              />
            </div> */}

            {/* Role and Registration Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1">Select your role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-lg bg-white bg-opacity-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                >
                  {roles.map((role) => (
                    <option className="text-black" key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Registration Number</label>
                <input
                  type="text"
                  name="eprNumber"
                  value={formData.eprNumber}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  placeholder="Type your Registration No here"
                />
              </div>
            </div>

            {/* State Dropdown */}
            <div>
              <label className="block text-xs font-medium text-white mb-1">Select State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                required
              >
                <option value="">-- Select State --</option>
                {states.map((state) => (
                  <option className="text-black" key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Conditional CBWTF Name / HCF Name */}
            {(formData.role === "CBWTF" || formData.role === "HCF") && (
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  {formData.role === "CBWTF" ? "CBWTF Name" : "HCF Name"}
                </label>
                <input
                  type="text"
                  name="entityName"
                  value={formData.entityName}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  placeholder={`Enter ${formData.role === "CBWTF" ? "CBWTF" : "HCF"} Name`}
                  required
                />
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-white mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                placeholder="Full Name"
                required
              />
            </div>

            {/* Email and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1">Registered Email Id</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                  placeholder="test_CPCBHO"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Registered Contact Number</label>
                <div className="flex">
                  <span className="mt-1 p-2 border rounded-l-lg bg-gray-700 text-white flex items-center text-sm">+91</span>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-r-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                    placeholder="XXXXX XXXXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white mb-1">Password</label>
                <div className="relative">
                  <input
                    type={isPasswordVisible ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300"
                  >
                    {isPasswordVisible ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                    placeholder="Set your Password here"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300"
                  >
                     {isConfirmPasswordVisible ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium mt-4 disabled:opacity-50"
              disabled={isSubmitting}
           >
             {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default Registration;
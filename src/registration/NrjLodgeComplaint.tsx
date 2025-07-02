import { useState } from "react";
import { Button } from "@mui/material";
import { useToaster } from "../components/reusable/ToasterContext";
import CPCB_Logo from '../images/CPCB_Logo.jpg';
import { useEffect } from "react";
const LodgeComplaint = () => {
  const { showToaster } = useToaster();
  const [formData, setFormData] = useState({
    email: "",
    file: null as File | null,
    image_1: "", // base64 string for image
    stt: "MP", // example state
    issueType: "",
    description: "",
    what_fnct: "bmwticket_raise_compaint"
  });


  useEffect(() => {
  const fetchStates = async () => {
    try {
      const res = await fetch("https://example.com/api/states"); // replace with real API
      const data = await res.json();
      
      if (Array.isArray(data) && data.length) {
        // Replace static with dynamic states if available
        setStateList(data.map((item: any) => ({
          code: item.code || item.stateCode || item.id,
          name: item.name || item.stateName
        })));
      }
    } catch (error) {
      console.warn("Failed to fetch states, using static list.");
    }
  };

  fetchStates();
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 

  const [stateList, setStateList] = useState([
  { code: "MP", name: "Madhya Pradesh" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "MH", name: "Maharashtra" }
]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  if (!formData.email || !formData.issueType) {
    showToaster(["Please fill all required fields"], "error");
    return;
  }

  await submitToAPI();

  setFormData({
    email: "",
    file: null,
    image_1: "",
    issueType: "",
    description: "",
    stt: "MP",
    what_fnct: "bmwticket_raise_compaint"
  });
  };


const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const validTypes = ["application/pdf", "image/png", "image/jpeg"];

    if (!validTypes.includes(file.type)) {
      showToaster(["Only PDF or Image files (PNG, JPEG) are allowed"], "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        file,
        image_1: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  }
};


const submitToAPI = async () => {
  const payload = {
    email: formData.email,
    issue_type: formData.issueType,
    description: formData.description,
    image_1: formData.image_1,
    // image_2: formData.image_2,
    stt: formData.stt,
    what_fnct: formData.what_fnct
  };


  // console.log("Submitting payload:", payload);
  // return
  try {
    const response = await fetch("https://bmwapp.barcodebmw.in/bmw/myApp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.status === "success") {
      showToaster([data.message], "success");
      console.log("Ticket ID:", data.result[0]);
    } else {
      showToaster([data.message || "Failed to raise complaint"], "error");
    }
  } catch (err) {
    console.error(err);
    showToaster(["Something went wrong while submitting the complaint."], "error");
  }
};





  return (
    <div className="flex flex-col min-h-screen bg-blue-900 relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-2 gap-x-2 md:gap-x-4 bg-white shadow-md">
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

      {/* Complaint Form Section */}
      <div className="flex justify-center items-center min-h-screen pt-40 relative z-10 overflow-y-auto">
        <div className="bg-gray-200 bg-opacity-20 backdrop-blur-sm p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-4 my-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Generate Support Ticket</h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Id */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email Id</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 p-3 w-full border rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Enter your registered email"
                required
              />
            </div>



            <div>
              <label className="block text-sm font-medium text-white mb-2">
               State
              </label>
           <select
              name="stt"
              value={formData.stt}
              onChange={handleChange}
              className="mt-1 p-3 w-full border rounded-lg bg-white bg-opacity-10  focus:outline-none focus:ring-2 focus:ring-blue-300 "
            >
              <option value="MP">Madhya Pradesh</option>
              <option value="UP">Uttar Pradesh</option>
              <option value="MH">Maharashtra</option>
              {/* Add more states as needed */}
            </select>
           </div>

            {/* Issue Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select the Issue from the following
              </label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                className="mt-1 p-3 w-full border rounded-lg bg-white bg-opacity-10  focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              >
                <option value="" disabled>Select an issue</option>
                <option value="Sign up Issues">Sign up Issues</option>
                <option value="Login Issues">Login Issues</option>
                <option value="Registration Apis Issues">Registration Apis Issues</option>
                <option value="Annual Report Issues">Annual Report Issues</option>
                <option value="Lost Credentials">Lost Credentials</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Issue Description */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Issue:
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 p-3 w-full border rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[120px]"
                placeholder="Elaborate your issue here..."
              />
            </div>

              {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Upload Screenshots of the Issue (Only .pdf)
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Choose File
                  </span>
                  <input
                    type="file"
                    accept=".pdf, image/png, image/jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-white">
                  {formData.file ? formData.file.name : "No file chosen"}
                </span>
              </div>
            </div>



            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium mt-6 transition-colors"
            >
              Generate Ticket
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

export default LodgeComplaint;
// import { useEffect, useState } from "react";

// type Tst = {
//   data: any,
//   className?: string
// };

// export const Toaster = (props: Tst) => {
//   let cls: string = props.className ? props.className : "";
//   const [showMessage, setShowMessage] = useState<boolean>(false);
//   const [className, setClassName] = useState<string>(
//     "border rounded-lg pl-4 pr-1 pb-3 pt-1 absolute top-[6px] right-[6px] w-[300px]" + cls
//   );
//   const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     if (props.data && props.data.message.length > 0) {
//       setShowMessage(true);
//     }
//   }, [props.data]);

//   const closeToaster = () => {
//     setShowMessage(false);
//     if (timer) clearTimeout(timer);
//   };

//   useEffect(() => {
//     if (showMessage) {
//       const newTimer = setTimeout(() => {
//         setShowMessage(false);
//       }, 5000);
//       setTimer(newTimer);
//     }

//     return () => {
//       if (timer) clearTimeout(timer);
//     };
//   }, [showMessage]);

//   const handleMouseEnter = () => {
//     console.log("A")
//     if (timer) clearTimeout(timer);
//   };

//   const handleMouseLeave = () => {
//     const newTimer = setTimeout(() => {
//       setShowMessage(false);
//     }, 5000);
//     setTimer(newTimer);
//   };

//   return (
//     <>
//       {showMessage && props.data && props.data.message.length && props.data.type == "error" && (
//         <div
//           className={"border-red-600 text-white drop-shadow-2xl " + className}
//           onClick={closeToaster}
//           onMouseEnter={handleMouseEnter}
//           onMouseLeave={handleMouseLeave}
//           onMouseMove={handleMouseEnter}
//           style={{
//             textAlign: "center",
//             zIndex: "1001",
//             backgroundColor: "#C4261A",
//           }}
//         >
//           <div className="flex justify-end">
//             <div className="hover:border hover:border-black rounded-lg">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="20"
//                 height="20"
//                 fill="#fff"
//                 className="bi bi-x hover:fill-[#000]"
//                 viewBox="0 0 16 16"
//               >
//                 <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
//               </svg>
//             </div>
//           </div>
//           <div>
//             <ul className="flex justify-center align-center">
//               <div>
//                 {props.data.message.map((res: any, index: number) => (
//                   // <li key={res} className="text-white">
//                   //   {index + 1} : {res}
//                   // </li>
//                   <li key={res} className="text-white">
//                     {res}
//                   </li>
//                 ))}
//               </div>
//             </ul>
//           </div>
//         </div>
//       )}
//       {showMessage && (props.data.message.length || props.data.message.message) && props.data.type == "success" && (
//         <div
//           className={"border-green-600 text-white font-semibold drop-shadow-2xl " + className}
//           style={{
//             backgroundColor: "#28a745",
//             zIndex: "1001",
//             textAlign: "center",
//           }}
//           onMouseEnter={handleMouseEnter}
//           onMouseLeave={handleMouseLeave}
//           onMouseMove={handleMouseEnter}
//         >
//           <div className="flex justify-end">
//             <div className="hover:border hover:border-black rounded-lg" onClick={closeToaster}>
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="20"
//                 height="20"
//                 fill="#fff"
//                 className="bi bi-x hover:fill-[#000]"
//                 viewBox="0 0 16 16"
//               >
//                 <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
//               </svg>
//             </div>
//           </div>
//           <div>
//             <ul className="">
//               {props.data.message.map((res: any, index: number) => (
//                 // <li key={res}>
//                 //   {index + 1} : {res}
//                 // </li>
//                 <li key={res}>
//                  {res}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

import Swal from "sweetalert2";
import { useEffect } from "react";

type Tst = {
  data: {
    message: string[] | string;
    type: "success" | "error";
  };
  className?: string;
};

export const Toaster = (props: Tst) => {
  let cls: string = props.className ? props.className : "";

  useEffect(() => {
    if (props.data && props.data.message.length > 0) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: props.data.type === "error" ? "error" : "success",
        title: Array.isArray(props.data.message)
          ? props.data.message.join("\n")
          : props.data.message,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        background: props.data.type === "error" ? "#C4261A" : "#28a745",
        iconColor: "#fff",
        color: "#fff",
        customClass: {
          popup: `shadow-md rounded-lg p-2 ${cls}`,
          title: "text-white font-semibold text-sm",
        },
      });
    }
  }, [props.data]);

  return null; // No need to render anything, Swal handles the toast
};

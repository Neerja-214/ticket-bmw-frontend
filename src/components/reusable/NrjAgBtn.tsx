// import React from 'react';
// import axios from 'axios';

// const NrjAgBtn = (props: any) => {
//   console.log(props)

//   // const cellValue = props.valueFormatted ? props.valueFormatted : props.value;
//   //   let clsName :  string = props.className ? props.className  : "";


//   return (
//     <div className="flex justify-center items-center h-full">
//       <button
//         onClick={() => console.log("Button clicked", props)}
//         className={props.className ? props.className : "bg-blue-800 text-white w-24 h-8 rounded-lg hover:bg-blue-900 transition duration-300"}
//       >
//         {props.buttonText || "Click Me"}
//       </button>
//     </div>



//   );
// };

// export default NrjAgBtn;
// export default  (props: any) => {
//   const cellValue = props.valueFormatted ? props.valueFormatted : props.value;
//   let clsName :  string = props.className ? props.className  : "";
//   const buttonClicked = () => {
     
      
//   };

//   const delt = (delApi : string)=>{
     
//   }


//   return (
//     <span>
//       <button onClick={() => buttonClicked()} className={clsName}>{props.buttonText}</button>
//     </span>
//   );
// };

const NrjAgBtn = (props: any) => {
 

  return (
    // <span>
    //   <button onClick={() => console.log("Button Clicked", props)} className={props.className ? props.className : "btn"}>
    //     {props.buttonText || "Click Me"}
    //   </button>
    // </span>
    <div className="flex justify-center items-center h-full">
       <button
         onClick={() => console.log("Button clicked", props)}
         className={props.className ? props.className : "bg-blue-800 text-white w-24 h-8 rounded-lg hover:bg-blue-900 transition duration-300"}
       >
         {props.buttonText || "Click me"}
       </button>
     </div>
  );
};

export default NrjAgBtn;  // ✅ Explicitly named export
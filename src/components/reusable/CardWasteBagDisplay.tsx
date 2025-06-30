import React, { useReducer, useState } from 'react'

const CardWasteBagDisplay = (props:any)=> {
  const [showAddress, setShowFullAddress] =useState(false);
  const colors:any = {
    ylw:{color: "#fef9c3", bcolor:"#eab308"}, red:{color:"#fee2e2", bcolor:"#dc2626"}, blu:{color:"#dbeafe", bcolor:"#1d4ed8"}, wht:{color:"#E7EEF7", bcolor:"#fff"}, cyt:{color:"#ffedd5", bcolor:"#ea580c"}
  }
  const style={
    backgroundColor: `${colors[props.data.clr].color}`,
    borderBottom: `12px solid ${colors[props.data.clr].bcolor}`,
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 5px 0px'
  }

  return (
    <>
    <div className='py-7'>

    <div className='pt-6 px-6 pb-4 rounded-xl' style={style}>
            <div className='flex text-xs items-center text-left text-slate-500'>
                <div className='w-5/12'>
                  Date : {props.data.cdt}
                </div>
                <div className='w-2/12 flex items-center justify-center'>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M11.299 7.75C11.1673 7.52199 10.978 7.33265 10.75 7.20101C10.5219 7.06937 10.2633 7.00007 10 7.00007C9.73671 7.00007 9.47805 7.06937 9.25003 7.20101C9.02201 7.33265 8.83266 7.52199 8.701 7.75L8.249 8.532C8.21565 8.58889 8.19388 8.65181 8.18495 8.71714C8.17602 8.78247 8.1801 8.84892 8.19695 8.91267C8.21381 8.97642 8.2431 9.03621 8.28316 9.08859C8.32321 9.14097 8.37323 9.18491 8.43034 9.21788C8.48744 9.25085 8.5505 9.2722 8.61589 9.2807C8.68128 9.2892 8.74771 9.28468 8.81135 9.26741C8.87498 9.25013 8.93457 9.22044 8.98669 9.18003C9.0388 9.13963 9.08241 9.08932 9.115 9.032L9.567 8.25C9.61089 8.174 9.674 8.11088 9.75001 8.067C9.82602 8.02312 9.91224 8.00002 10 8.00002C10.0878 8.00002 10.174 8.02312 10.25 8.067C10.326 8.11088 10.3891 8.174 10.433 8.25L10.884 9.032C10.9503 9.14697 11.0596 9.2309 11.1877 9.26531C11.3159 9.29972 11.4525 9.28181 11.5675 9.2155C11.6825 9.1492 11.7664 9.03994 11.8008 8.91175C11.8352 8.78357 11.8173 8.64697 11.751 8.532L11.299 7.75ZM12.165 11.25L12.057 11.064C11.9907 10.949 11.9728 10.8124 12.0072 10.6842C12.0416 10.5561 12.1255 10.4468 12.2405 10.3805C12.3555 10.3142 12.4921 10.2963 12.6203 10.3307C12.7484 10.3651 12.8577 10.449 12.924 10.564L13.031 10.75C13.1627 10.978 13.232 11.2367 13.232 11.5C13.232 11.7633 13.1627 12.022 13.031 12.25C12.8994 12.478 12.71 12.6674 12.482 12.799C12.254 12.9307 11.9953 13 11.732 13H11C10.8674 13 10.7402 12.9473 10.6464 12.8536C10.5527 12.7598 10.5 12.6326 10.5 12.5C10.5 12.3674 10.5527 12.2402 10.6464 12.1464C10.7402 12.0527 10.8674 12 11 12H11.732C11.8198 12 11.906 11.9769 11.982 11.933C12.058 11.8891 12.1211 11.826 12.165 11.75C12.2089 11.674 12.232 11.5878 12.232 11.5C12.232 11.4122 12.2089 11.326 12.165 11.25ZM9 12C9.13261 12 9.25979 12.0527 9.35355 12.1464C9.44732 12.2402 9.5 12.3674 9.5 12.5C9.5 12.6326 9.44732 12.7598 9.35355 12.8536C9.25979 12.9473 9.13261 13 9 13H8.268C8.00461 13.0002 7.74583 12.931 7.51766 12.7994C7.2895 12.6678 7.10001 12.4785 6.96824 12.2504C6.83647 12.0224 6.76708 11.7636 6.76704 11.5002C6.767 11.2369 6.83631 10.9781 6.968 10.75L7.076 10.564C7.14278 10.4501 7.25189 10.3672 7.37954 10.3335C7.50719 10.2997 7.643 10.3178 7.75735 10.3839C7.87169 10.4499 7.95528 10.5584 7.98987 10.6859C8.02447 10.8133 8.00726 10.9492 7.942 11.064L7.835 11.25C7.79112 11.326 7.76801 11.4122 7.76801 11.5C7.76801 11.5878 7.79111 11.674 7.835 11.75C7.87888 11.826 7.942 11.8891 8.018 11.933C8.09401 11.9769 8.18023 12 8.268 12H9ZM15.914 2.586C16.2891 2.96099 16.4999 3.46961 16.5 4V4.56L15.17 16.23C15.1133 16.7196 14.8778 17.1711 14.5087 17.4978C14.1396 17.8244 13.6629 18.0033 13.17 18H6.85C6.35711 18.0033 5.88037 17.8244 5.51127 17.4978C5.14216 17.1711 4.90667 16.7196 4.85 16.23L3.5 4.56V4C3.5 3.46957 3.71071 2.96086 4.08579 2.58579C4.46086 2.21071 4.96957 2 5.5 2H14.5C15.0304 2.00011 15.539 2.2109 15.914 2.586ZM14.5 3H5.5C5.23478 3 4.98043 3.10536 4.79289 3.29289C4.60536 3.48043 4.5 3.73478 4.5 4H15.5C15.5 3.73478 15.3946 3.48043 15.2071 3.29289C15.0196 3.10536 14.7652 3 14.5 3ZM13.83 16.747C14.015 16.5828 14.1326 16.3558 14.16 16.11L15.44 5H4.56L5.84 16.11C5.86719 16.3557 5.98443 16.5827 6.16911 16.747C6.35378 16.9114 6.59279 17.0015 6.84 17H13.16C13.4069 17.0013 13.6456 16.9112 13.83 16.747Z" fill="black"/>
                </svg>
                </div>
                <div className='w-5/12 text-right'>
                  Time : {props.data.ctm}
                </div>
            </div>



            <div className='my-4 border border-stone-300'>
            </div>



            {/***************************************************** */}



            <div className='flex mt-5 justify-between'>
                <div className='text-xs text-left text-slate-500'>
                  Hospital name
                </div>
              <div className='text-xs text-slate-500'>
                Weight (in kg)
              </div>
            </div>

            {/************************** */}





            <div className='pt-1  flex justify-between'>
              <div className='text-base w-9/12 text-left font-semibold text-black'>
                {props.data.hcfnm}
              </div>
              <div className='text-base text-black font-semibold'>
                {props.data.wt}
              </div>
            </div>


            {/**************************************************** */}



            {/**************************************************** */}


            <div className='lg:flex mt-8 mb-4 justify-between w-11/12'>
              <div>
                <div className='text-xs text-left text-slate-500'>
                  scan by
                </div>
                <div className='text-sm text-left py-1 text-black font-semibold'>
                  {props.data.scby == 'fct' ? 'At CBWTF' : props.data.scby == 'cbwtf' ? 'Operator': 'HCF' }
                </div>
              </div>
              <div>
                <div className='text-xs text-left text-slate-500'>
                  CBWTF
                </div>
                <div className='text-sm text-left py-1 text-black font-semibold'>
                  {props.data.cbwtfnm}
                </div>
              </div>
              <div>
                <div className='text-xs text-left text-slate-500'>
                  State/UT
                </div>
                <div className='text-sm text-left py-1 text-black font-semibold'>
                  {props.data.stt}
                </div>
              </div>
            </div>


            <div className='my-4 border border-stone-300'>
            </div>


            <div className='lg:flex justify-between w-11/12'>
              <div>
                <div className='text-xs text-left text-slate-500'>
                  Label no.
                </div>
                <div className='text-xs font-semibold py-2 text-left text-slate-500'>
                   {props.data.lblno}
                </div>
              </div>
              <div>
                <div className='text-xs  text-left text-slate-500'>
                  Location
                </div>
                <div className='text-xs py-2 text-left text-slate-500'>
                  {Number(props.data.ltt).toFixed(2)}, {Number(props.data.lgt).toFixed(2)}
                </div>
              </div>
              <div>
                <div className='text-xs text-left text-slate-500'>
                  Bluetooth scan
                </div>
                <div className={`text-xs py-2 text-left py-1 text-${props.data.bluscl? 'lime':'red'} font-semibold`}>
                  {props.data.bluscl != '0'?'YES':'NO'}
                </div>
              </div>
            </div>


          </div>
    </div>
    </>
  )
}
export default React.memo(CardWasteBagDisplay);
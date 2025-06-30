import React, { useEffect, useState, useCallback, useRef } from "react";
import { DatePicker } from "rsuite";
import moment, { now } from "moment";
import { Tooltip, Whisper } from "rsuite";
import { TypeAttributes } from "rsuite/esm/@types/common";
import { capitalizeTerms, isReqFld, isValidArray } from "../../utilities/utilities";
import { getFldValue } from "../../Hooks/useGetFldValue";
import { useToaster } from '../../components/reusable/ToasterContext';
// import isBefore from 'date-fns/isBefore';
import { isAfter } from 'date-fns';
type NrjRdt = {
  onChange: (data: string) => void;
  Label?: string;
  ClssName?: string;
  idText: string;
  selectedValue?: string;
  fldName: string;
  delayClose?: number;
  placement?: TypeAttributes.Placement;
  speaker?: string;
  format?: string;
  clear?: number;
  displayFormat?: string;
  size?: 'lg' | 'md' | 'sm' | 'xs' | undefined;
  IAmRequired?: any;
  disAbleFor?: boolean;
  readOnly?: boolean | false;
  disAbleNextAndCuurrentMonth?: boolean
  loadOnDemand?: string | boolean;
  dsabld?: boolean | false;
  shouldDisableFutureDates?: boolean | false;
  shouldDisableCustomDate?: boolean;
  customDate?: boolean | false;
  fromDate?: string
};
const NrjRsDt = (props: NrjRdt) => {
  const { onChange, selectedValue, fldName } = props;
  const [textDts, setTextDts] = useState<string>("")
  const [value, setValue] = React.useState(new Date())
  const [tooltipOpen, settooltipOpen] = useState(false);
  const size = props.size ? props.size : 'lg';
  const scrollContainer = useRef(null);




  useEffect(() => {
    if (props.loadOnDemand) {
      const today = new Date();
      const previousMonth = moment(today).subtract(1, 'months'); // Subtract one month from today's date

      let str: string = moment(previousMonth).format("DD-MMM-yyyy");
      setTextDts(str);
      setValue(previousMonth.toDate()); // Set value to the previous month's date
      onChange(fldName + "][" + str);
    }
  }, [props.loadOnDemand]);


  const { showToaster, hideToaster } = useToaster();
  const onChangeText = (value: Date | null, event: any) => {
    if (value && (props.disAbleFor || props.disAbleNextAndCuurrentMonth)) {

      if (props.disAbleFor) {
        const today = new Date();
        const valueMoment = moment(value);
        const todayMoment = moment(today);
        if (valueMoment.isSameOrAfter(todayMoment, 'day')) {
          // Check if selected date is today or after today
          let str: string = moment(value).format("DD-MMM-yyyy");
          setTextDts(str);
          setValue(value);
          onChange(fldName + "][" + str);
        } else {
          showToaster(["The date cannot be select before the current date."], "error");
          const today = new Date();
          let str = moment(today).format("DD-MMM-yyyy");
          setTextDts(str);
          setValue(today); // Corrected this line to set today's date
          onChange(fldName + "][" + str);
        }
      } if (props.disAbleNextAndCuurrentMonth) {
        const today = new Date();
        if (value.getMonth() < today.getMonth()) {
          let str: string = moment(value).format("DD-MMM-yyyy");
          setTextDts(str);
          setValue(value);
          onChange(fldName + "][" + str);
        } else {
          const today = new Date();
          const previousMonth = moment(today).subtract(1, 'months'); // Subtract one month from today's date

          let str: string = moment(previousMonth).format("DD-MMM-yyyy");
          setTextDts(str);
          setValue(value);
          onChange(fldName + "][" + str);
          showToaster(["select previous months, not the current or next month."], "error");
        }

      }
      // set current date
    } else {
      let str: string = moment(value).format("DD-MMM-yyyy");
      if (!value) {
        const today = new Date();
        let str = moment(today).format("DD-MMM-yyyy");
        setTextDts(str);
        setValue(today); // Corrected this line to set today's date
        onChange(fldName + "][" + str);
      } else {
        setTextDts(str);
        setValue(value);
        onChange(fldName + "][" + str);

      }
    }
  };

  // const shouldDisableDate = (date: any) => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0); // Set time to the start of the day
  //   return date < today;
  // };
  const disableFutureDates = (date: Date) => {
    return isAfter(date, new Date());
  };


  const disableDatesAfter7Days = (date: any, fromDate: any) => {
    if (!fromDate) return false;
    let frmdt = fromDate.split('][')
    const maxDate = new Date(frmdt[1]);
    maxDate.setDate(maxDate.getDate() + 6);
    return date > maxDate;
  };


  // const disableFutureDates = (date:any) => {
  //   const today = new Date();
  //   const maxDate = new Date();
  //   maxDate.setDate(today.getDate() + 7); // Set the max date to 7 days from today

  //   // Disable dates outside of the 7-day range or future dates
  // console.log(date > maxDate || date > today)
  //   return date > maxDate || date > today;
  // };



  const tltpClose = useCallback(() => {
    settooltipOpen(false);
  }, [tooltipOpen]);

  const onBlurr = (event: any) => {
    if (props.speaker) {
      if (props.delayClose) {
        if (!event.target.value) {
          settooltipOpen(true);
        } else {
          settooltipOpen(false);
        }
      }
    }
  };

  const onOpen = () => {
    if (props.delayClose) {
      setTimeout(function () {
        settooltipOpen(false);
      }, props.delayClose);
    }
  };


  useEffect(() => {
    if (props.clear && props.clear === 1) {
      setTextDts("01-Apr-2000")
    }
  }, [props.clear])

  useEffect(() => {
    let dt: string = getFldValue(props.selectedValue || '', fldName);
    if (fldName == 'dt_rptfrm') {
      sessionStorage.setItem('from_date', dt)
    }
    if (dt) {
      let dte: Date = new Date(dt)
      setValue(dte)
      if (!isNaN(Date.parse(dt))) {
        setTextDts(dt);
      }
    }
    else if (!isNaN(Date.parse(props.selectedValue || ''))) {
      setTextDts(props.selectedValue ? props.selectedValue : "");
    }
    else {
      onChangeText(null, null);
    }
  }, [props.selectedValue, fldName])

  const getScrollContainer = () => {
    return scrollContainer.current || document.body; // Fallback to document.body if null
  };

  let rqFld: string = "";
  if (props.speaker ? props.speaker : "") {
    rqFld = "*"
  } else {
    if (isValidArray(props.IAmRequired))
      if (isReqFld(props.IAmRequired, props.fldName)) {
        rqFld = "*"
      }
  }


  let dsply: string = props.displayFormat ? props.displayFormat : "2";
  const selectedDate = selectedValue ? new Date(Date.parse(selectedValue)) : null;

  const preventInteraction = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };
  // Normalize label first



  if (dsply == "1") {
    return (
      <>

        <Whisper
          open={tooltipOpen}
          onClose={tltpClose}
          delayClose={props.delayClose}
          trigger={"none"}
          onOpen={onOpen}
          placement={props.placement}
          speaker={
            <Tooltip style={{ backgroundColor: "red", fontSize: 12 }}>
              {props.speaker}
            </Tooltip>
          }
        >
          <div className="w-full">

            {/* {props.Label && (
              <div className="pt-2 pb-3 text-black">
                {props.Label.toLowerCase() === "from date"
                  ? "From date"
                  : props.Label.toLowerCase() === "to date"
                    ? "To date"
                    : capitalizeTerms(props.Label)}
                <span className="astrict text-red-500">{rqFld}</span>
              </div>
            )}  */}
            {/* {props.Label?.toLowerCase() === "from date" &&
            <div className="pt-2 pb-3 text-black !normal-case">From date
            <span className="astrict text-red-500">{rqFld}</span>
              </div>}
              {props.Label?.toLowerCase() === "to date" &&
            <div className="pt-2 pb-3 text-black">To date
            <span className="astrict text-red-500">{rqFld}</span>
            </div>} */}
            {props.Label?.toLowerCase() === "from date" ? <div className=" mt-3 mb-3 ml-3 flex text-[16px]">
              <>
                From date
                <span className="astrict text-red-500">{rqFld}</span>
              </>
            </div>:props.Label?.toLowerCase() === "to date"?<div className=" mt-3 mb-3 ml-3 flex text-[16px]">
              <>
                To date
                <span className="astrict text-red-500">{rqFld}</span>
              </>
            </div>:<div className=" mt-3 mb-3 ml-3 flex text-[16px]">
              <>
               { capitalizeTerms(props.Label || "")}
                <span className="astrict text-red-500">{rqFld}</span>
              </>
            </div>}
            {/* {props.Label?.toLowerCase() === "to date" && <div className=" mt-3 mb-3 ml-3 flex text-[16px]">
              <>
                To date
                <span className="astrict text-red-500">{rqFld}</span>
              </>
            </div>} */}
          
            {props.readOnly ?
              <div className="relative" ref={scrollContainer} style={{ marginTop: "-14px" }}>
                <DatePicker
                  size={size}
                  value={textDts ? new Date(Date.parse(textDts)) : new Date()}
                  placeholder={capitalizeTerms(props.Label || "")}
                  onChange={onChangeText}
                  format={props.format ? props.format : "dd-MMM-yyyy"}
                  onBlur={onBlurr}
                  oneTap
                  style={{ width: 300, pointerEvents: 'none' }}
                  onClick={preventInteraction}
                  onKeyDown={(e: any) => e.preventDefault()}
                  container={getScrollContainer}
                  disabled
                  defaultValue={new Date()}
                  shouldDisableDate={!props.shouldDisableFutureDates ? disableFutureDates : undefined}

                />
              </div> :
              <div className="relative" ref={scrollContainer} style={{ marginTop: "-14px" }}>
                <DatePicker
                  size={size}
                  value={textDts ? new Date(Date.parse(textDts)) : new Date()}
                  placeholder={props.Label}
                  onChange={onChangeText}
                  format={props.format ? props.format : "dd-MMM-yyyy"}
                  onBlur={onBlurr}
                  oneTap
                  style={{ width: '100%' }}
                  container={getScrollContainer}
                  // shouldDisableDate={!props.shouldDisableFutureDates ? disableFutureDates : undefined}
                  // shouldDisableDate={props.shouldDisableCustomDate ? disableFutureDates : undefined}
                  shouldDisableDate={props.shouldDisableCustomDate
                    ? (date) => {
                      // Disable dates based on custom logic (7 days after 'fromDate')
                      const isDisabledAfter7Days = disableDatesAfter7Days(date, props.fromDate);

                      // Disable future dates if the `disableFutureDates` condition is true
                      const isFutureDateDisabled = !props.shouldDisableFutureDates && date > new Date();

                      // Return true if either condition is met, otherwise false
                      return isDisabledAfter7Days || isFutureDateDisabled || false; // Always returns true or false
                    }
                    : (date) => {
                      // If props.shouldDisableCustomDate is false, only call disableFutureDates
                      return !props.shouldDisableFutureDates && date > new Date() || false; // Always returns true or false
                    }
                  }

                ></DatePicker>
              </div>}
          </div>
        </Whisper>


      </>
    )
  }
  else if (dsply == '2') {
    return (
      <div className="container">
        <div className="relative h-6 ">
          <Whisper
            open={tooltipOpen}
            onClose={tltpClose}
            delayClose={props.delayClose}
            trigger={"none"}
            onOpen={onOpen}
            placement={props.placement}
            speaker={
              <Tooltip style={{ backgroundColor: "red", fontSize: 12 }}>
                {props.speaker}
              </Tooltip>
            }
          >


            <div className="mb-2 relative" ref={scrollContainer}>
              {props.Label && <div className="pt-2 pb-3 text-black">
                {capitalizeTerms(props.Label)}
                <span className="astrict text-red-500">{rqFld}</span>
              </div>}
              {props.readOnly ?
                <DatePicker
                  size={size}
                  value={textDts ? new Date(Date.parse(textDts)) : new Date()}
                  placeholder={props.Label}
                  onChange={onChangeText}
                  format={props.format ? props.format : "dd-MMM-yyyy"}
                  onBlur={onBlurr}
                  style={{ width: 300, pointerEvents: 'none' }} // Disable pointer events
                  onClick={preventInteraction} // Prevent click events
                  onKeyDown={(e: any) => e.preventDefault()}
                  shouldDisableDate={!props.shouldDisableFutureDates ? disableFutureDates : undefined}
                ></DatePicker> : <DatePicker
                  size={size}
                  value={textDts ? new Date(Date.parse(textDts)) : new Date()}
                  placeholder={props.Label}
                  onChange={onChangeText}
                  format={props.format ? props.format : "dd-MMM-yyyy"}
                  onBlur={onBlurr}
                  oneTap
                  style={{ width: 300 }}
                  shouldDisableDate={!props.shouldDisableFutureDates ? disableFutureDates : undefined}
                ></DatePicker>}
            </div>
          </Whisper>
        </div>
      </div>
    )
  }

};
export default NrjRsDt;

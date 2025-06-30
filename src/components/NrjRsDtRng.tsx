import { DateRangePicker, Stack } from 'rsuite';
import React from 'react';
import subDays from 'date-fns/subDays';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import addDays from 'date-fns/addDays';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import addMonths from 'date-fns/addMonths';
import { useMomentDatefrmNmb,  UseMomentDateNmb } from '../Hooks/useMomentDtArry';
import moment from 'moment';
//const { allowedMaxDays, allowedDays, allowedRange, beforeToday, afterToday, combine } = DateRangePicker;
const predefinedRanges = [
    {
        label: 'Today',
        value: [new Date()],
        
        //placement: 'left'
      }
    //   ,{
    //   label: 'Today',
    //   value: [new Date(), new Date()],
      
    //   placement: 'left'
    // },
    // {
    //   label: 'Yesterday',
    //   value: [addDays(new Date(), -1), addDays(new Date(), -1)],
    //   placement: 'left'
    // },
    // {
    //   label: 'This week',
    //   value: [startOfWeek(new Date()), endOfWeek(new Date())],
    //   placement: 'left'
    // },
    // {
    //   label: 'Last 7 days',
    //   value: [subDays(new Date(), 6), new Date()],
    //   placement: 'left'
    // },
    // {
    //   label: 'Last 30 days',
    //   value: [subDays(new Date(), 29), new Date()],
    //   placement: 'left'
    // },
    // {
    //   label: 'This month',
    //   value: [startOfMonth(new Date()), new Date()],
    //   placement: 'left'
    // },
    // {
    //   label: 'Last month',
    //   value: [startOfMonth(addMonths(new Date(), -1)), endOfMonth(addMonths(new Date(), -1))],
    //   placement: 'left'
    // },
    // {
    //   label: 'This year',
    //   value: [new Date(new Date().getFullYear(), 0, 1), new Date()],
    //   placement: 'left'
    // },
    // {
    //   label: 'Last year',
    //   value: [new Date(new Date().getFullYear() - 1, 0, 1), new Date(new Date().getFullYear(), 0, 0)],
    //   placement: 'left'
    // },
    // {
    //   label: 'All time',
    //   value: [new Date(new Date().getFullYear() - 1, 0, 1), new Date()],
    //   placement: 'left'
    // },
    // {
    //   label: 'Last week',
    //   closeOverlay: false,
    //   value: (value: never[]) => {
    //     const [start = new Date()] = value || [];
    //     return [
    //       addDays(startOfWeek(start, { weekStartsOn: 0 }), -7),
    //       addDays(endOfWeek(start, { weekStartsOn: 0 }), -7)
    //     ];
    //   },
    //   appearance: 'default'
    // },
    // {
    //   label: 'Next week',
    //   closeOverlay: false,
    //   value: (value: never[]) => {
    //     const [start = new Date()] = value || [];
    //     return [
    //       addDays(startOfWeek(start, { weekStartsOn: 0 }), 7),
    //       addDays(endOfWeek(start, { weekStartsOn: 0 }), 7)
    //     ];
    //   },
    //   appearance: 'default'
    // }
  ];

  type NrjDtRng = {
    onChange: (data: string) => void;
  }
const NrjRsDtRng = (props:NrjDtRng) => {
    const { onChange } = props;
    const ChangeV = (value : any)=>{
        // console.log(value)
        // if (value == null){
        //     return ;
        // }
        let dtF : string = moment(value[0]).format("DD-MMM-YYYY");
        let dtE : string = moment(value[1]).format("DD-MMM-YYYY");
        dtF =  UseMomentDateNmb(dtF) ;
        dtE =  UseMomentDateNmb(dtE) ;
        // console.log(dtF)
        // console.log(dtE)
        onChange (dtF + "_" + dtE)
        // console.log(dtF + "_" + dtE)
    }
  return (
    
    <div>
        <DateRangePicker 
        //   ranges={predefinedRanges}
        onChange={ChangeV}
        format="dd-MMM-yyyy"
        block
        
        ></DateRangePicker>
    </div>
  )
}

export default React.memo(NrjRsDtRng)
import { Padding } from '@mui/icons-material';
import React from 'react';
interface DataItem {
    color?: string;
    item1?: Number;
    item2?: Number;
    item3?: Number;
    item4?: Number;
    item5?: Number;
    item6?: Number;
    weight?: Number;
    bags?: Number;
    percent?: Number;
    parentClass?: string;
   

}
interface HeadingItem {
    col1?: string;
    col2?: string;
    col3?: string;
    col4?: string;
    col5?: string;
    col6?: string;
    col7?: string;
    col8?: string;
    col9?: string;
}
interface DataTableProps {
    data: DataItem[];
    heading?: HeadingItem[]
}
const GraphDataTable2: React.FC<DataTableProps> = ({ data , heading}) => {
    return (
        <table className='container' >
            <thead>
                {heading?.map((item: any, index: any) => (
                    <>
                    <tr>
                        <td colSpan={2} align='center'></td>
                        <td colSpan={2} align='center'>
                            <h6 className='pr-20'>
                                Generated
                            </h6>
                        </td>
                        <td colSpan={2} align='center'>
                            <h6 className='pr-20'>
                                Collected
                            </h6>
                        </td>
                        <td colSpan={2} align='center'>
                            <h6 className='pr-20'>
                                Processed
                            </h6>
                        </td>

                    </tr>
                    <tr key={index} className='small'>
                        {item.col1 ?
                            <td style={{ padding: "8px" }}>
                                <div className={`${item.col1} rounded-md w-4 h-4`}>

                                </div>
                            </td>
                            : null}
                        {item.col2 ?
                            <td className="ps-1 font-bold">{item.col2}</td>
                            : null}
                        {item.col3 ?
                            <td className='px-2 font-bold'>{item.col3}</td>
                            : null}
                        {item.col4 ?
                            <td className='px-2 font-bold'>{item.col4}</td>
                            : null}
                        {item.col5 ?
                            <td className='px-2 font-bold'>{item.col5}</td>
                            : null}
                        {item.col6 ?
                            <td className='px-2 font-bold'>{item.col6}</td>
                            : null}

                        {item.col7 ?
                            <td className='px-2 font-bold'>{item.col7}</td>
                            : null}
                        {item.col8 ?
                            <td className='px-2 font-bold'>{item.col8}</td>
                            : null}
                    </tr>
                    </>
                ))}
            </thead>
            <tbody>
                {data.map((item: any, index: any) => (
                    <tr key={index} className='small'>
                        {item.parentClass ?
                            <td style={{ padding: "8px" }}>
                                <div className={`${item.parentClass} rounded-md w-4 h-4`}>

                                </div>
                            </td>
                            : null}
                        {item.color ?
                            <td className="ps-1">{item.color}</td>
                            : null}
                        {item.weight ?
                            <td className='px-2'>{item.weight}</td>
                            : null}
                        {item.bags ?
                            <td className='px-2'>{item.bags}</td>
                            : null}
                        {item.items.map((res:any)=>{
                            return(<td className='px-2'>{res}</td>)
                        })}
                           
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default GraphDataTable2;

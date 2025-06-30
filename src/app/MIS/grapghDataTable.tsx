import { Button } from '@mui/material';
import React from 'react';
import { Tooltip as ReactTooltip, Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
interface DataItem {
    color?: string;
    item1?: any;
    item2?: any;
    weight?: any;
    bags?: any;
    percent?: any;
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
}
interface DataTableProps {
    data: DataItem[];
    heading?: HeadingItem[]
    tooltipmsg?: string
}
const GraphDataTable: React.FC<DataTableProps> = ({ data, heading, tooltipmsg }) => {
    console.log(data,heading)
    return (
        <>
            <table className='container' data-tip={`Parent Class: ${tooltipmsg}`}>
                <thead>
                    {heading?.map((item: any, index: any) => (
                        <tr key={index} className="small py-2">
                            {item.col1 ? (
                                <td className="text-center align-middle px-2 py-3">
                                    <div className={`${item.col1} rounded-md w-4 h-4`}></div>
                                </td>
                            ) : null}
                            {item.col2 ? (
                                <td className="text-center align-middle px-2 py-3 font-bold">{item.col2}</td>
                            ) : null}
                            {item.col3 ? (
                                <td className="text-center align-middle px-2 py-3 font-bold">{item.col3}</td>
                            ) : null}
                            {item.col4 ? (
                                <td className="text-center align-middle px-2 py-3 font-bold">{item.col4}</td>
                            ) : null}
                            {item.col5 ? (
                                <td className="text-center align-middle px-2 py-3 font-bold">{item.col5}</td>
                            ) : null}
                            {item.col6 ? (
                                <td className="text-center align-middle px-2 font-bold">{item.col6}</td>
                            ) : null}
                            {/* {item.percent ? (
                                <td className="text-center align-middle px-2 font-bold">({item.col7})</td>
                            ) : null} */}
                        </tr>
                    ))}
                </thead>

                <tbody className="pt-3">
                    {data.map((item: any, index: any) => (
                        <tr key={index} className="small border-t">
                            {item.parentClass !== undefined ? (
                                <td className="text-center align-middle px-2 py-2">
                                    <div className={`${item.parentClass} rounded-md w-4 h-4`}></div>
                                </td>
                            ) : null}
                            {item.color !== undefined ? (
                                <td className="text-center align-middle px-2 py-2">{item.color}</td>
                            ) : null}
                            {item.weight !== undefined ? (
                                <td className="text-center align-middle px-2 py-2">{Number(item.weight).toFixed(3)}</td>
                            ) : null}
                            {item.bags !== undefined ? (
                                <td className="text-center align-middle px-2 py-2">{item.bags}</td>
                            ) : null}
                            {item.item1 !== undefined ? (
                                <td className="text-center align-middle px-2 py-2">{item.item1}</td>
                            ) : null}
                            {item.item2 !== undefined ? (
                                <td className="text-center align-middle px-2 py-2">{item.item2}</td>
                            ) : null}
                            {/* {item.percent !== undefined ? (
                                <td className="text-center align-middle px-2 py-2" style={{ color: item.percent >= 0 ? 'green' : 'red' }}>
                                    ({item.percent})
                                </td>
                            ) : null} */}
                        </tr>
                    ))}
                </tbody>

            </table>


        </>
    );
};

export default GraphDataTable;

import { width } from '@mui/system';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


const getHeaderToExport = (gridApi: any) => {
  const columns = gridApi;
  return columns.map((column: any) => {
    
    let headerName = ''
    const { field } = column;
    headerName = column.headerName ? column.headerName : field;
    const headerNameUppercase =
      headerName[0].toUpperCase() + headerName.slice(1);
    const headerCell = {
      text: headerNameUppercase,
      bold: true,
      margin: [0, 12, 0, 0],
    };
    return headerCell;
  });
};

const getRowsToExport = (gridApi: any, rowData: any) => {

  const columns = gridApi;
  const getCellToExport = (column: any, rowData: any) => {
    
    if (column.field === 'addr') {
      return {
        text: `${rowData['addra']} ${rowData['addrb']}  ${rowData['addrb']}`, // Concatenate content of col1 and col2
        style: column.cellStyle
      };
    } else {
      return {
        text: rowData[column.field] ?? '',
        style: column.cellStyle,
      }
    }
  }

  //   {
  //   text: rowData[column.field] ?? '',
  //   style: column.cellStyle,
  // });
  const rowsToExport: any = [];
  rowData.forEach((node: any) => {
    const rowToExport = columns.map((column: any) => getCellToExport(column, node));

    rowsToExport.push(rowToExport);
  })
  
  return rowsToExport;
};

// Row colors
const HEADER_ROW_COLOR = '#f8f8f8';
const EVEN_ROW_COLOR = '#fcfcfc';
const ODD_ROW_COLOR = '#fff';

const PDF_INNER_BORDER_COLOR = '#dde2eb';
const PDF_OUTER_BORDER_COLOR = '#babfc7';

const createLayout = (numberOfHeaderRows: any) => ({
  fillColor: (rowIndex: any) => {
    if (rowIndex < numberOfHeaderRows) {
      return HEADER_ROW_COLOR;
    }
    return rowIndex % 2 === 0 ? EVEN_ROW_COLOR : ODD_ROW_COLOR;
  },
  //vLineHeight not used here.
  vLineWidth: (rowIndex: any, node: any) =>
    rowIndex === 0 || rowIndex === node.table.widths.length ? 1 : 0,
  hLineColor: (rowIndex: any, node: any) =>
    rowIndex === 0 || rowIndex === node.table.body.length
      ? PDF_OUTER_BORDER_COLOR
      : PDF_INNER_BORDER_COLOR,
  vLineColor: (rowIndex: any, node: any) =>
    rowIndex === 0 || rowIndex === node.table.widths.length
      ? PDF_OUTER_BORDER_COLOR
      : PDF_INNER_BORDER_COLOR,
});

const getDocument = (gridApi: any, rowData: any, widths: any, pdfHeader: any) => {
  const columns = gridApi;
  const headerRow = getHeaderToExport(gridApi);
  const rows = getRowsToExport(gridApi, rowData);
  const currentDate = new Date().toLocaleDateString('en-US', { timeZone: 'UTC' });
  var tempImageUrl = 'data:image/png;base64,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'
  
  const pdfHeaderImg ='data:image/png;base64,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'

  var docDefinition: TDocumentDefinitions = {
    pageOrientation: 'landscape',
    content: [
      {
        table: {
          widths: ['*', 'auto'], // Use '*' for the first column to take up remaining space
          body: [
            [
              {
                image: tempImageUrl,
                width: 40,
                alignment: 'left',
                border: [false, false, false, false]
              },
              {
                text: `Date of Report: ${currentDate}`, margin: [0, 10],
                style: 'subheader',
                border: [false, false, false, false]

              },
            ]
          ]
        }
      },
      {
        text: getLvl() ? `Level : ${getLvl()} ` : '',
        style: 'subheader'
      },
      {
        text: getWho() ? `Who : ${getWho()} ` : '',
        style: 'subheader'
      },

      {
        table: {
          headerRows: 1,
          widths: widths ? widths : `${100 / columns.length}%`,
          body: [headerRow, ...rows],
          heights: (rowIndex: any) => (rowIndex === 0 ? 40 : 15),
        },
        layout: createLayout(1),
      },

    ],
    header: function (currentPage, pageCount) {
      // return {
      //   text: `${pdfHeader} : page` + currentPage + ' of ' + pageCount, alignment: 'center', margin: [30, 20, 0, 0], fontSize: 18, color: 'blue', bold: true
      // };
      return {
        text: `${pdfHeader}`, alignment: 'center', margin: [30, 20, 0, 0], fontSize: 18, color: 'blue', bold: true
      };
    },
    // header: function (currentPage, pageCount) {
    //   return {
    //     margin: [0, 20, 0, 0], // Top margin for the entire header
    //     stack: [
    //       {
    //         image: pdfHeaderImg,
    //         width: 100, // Adjust the width as needed
    //         alignment: 'center', // Center the image
    //         margin: [0, 0, 0, 10], // Margin below the image
    //       },
    //       {
    //         text: `${pdfHeader}`, 
    //         alignment: 'center', // Center the text
    //         fontSize: 18, 
    //         color: 'blue', 
    //         bold: true,
    //         margin: [0, 0, 0, 20] // Margin below the header text
    //       },
    //       {
    //         columns: [
    //           {
    //             text: `Date of Report: ${currentDate}`,
    //             alignment: 'left',
    //             margin: [10, 0, 0, 0], // Left margin for the text
    //             style: 'subheader'
    //           },
    //           {
    //             image: tempImageUrl,
    //             width: 40, // Set the width of the tempImageUrl
    //             alignment: 'right', // Align the image to the right
    //             margin: [0, 0, 10, 0] // Right margin for spacing
    //           }
    //         ]
    //       }
    //     ]
    //   };
    // },
    
    footer: function (currentPage: any, pageCount: any) {
      return {
        table: {
          widths: ['*', 'auto'],
          body: [
            [
              {
                text: `Date of Print ${currentDate}`,
                fontSize: 13,
                // alignment: 'left',
                margin: [0, 20, 0, 0],
                color: 'blue',
                border: [false, false, false, false]
              },
              {
                text: `Page ${currentPage} of ${pageCount}`,
                fontSize: 13,
                // alignment: 'right',
                margin: [0, 20, 0, 0],
                color: 'blue',
                border: [false, false, false, false]
              },
            ]
          ]
        }
      };

    },
    background: function (currentPage: any, pageSize: any) {
      return {
        stack: [
          // {
          //   absolutePosition: { x: 40, y: 40 },
          //   text: 'Hello Header Here',
          //   fontSize: 18,
          //   bold: true
          // },
          {
            canvas: [
              {
                type: 'line',
                x1: 40,
                y1: pageSize.height - 40,
                x2: pageSize.width - 40,
                y2: pageSize.height - 40,
                lineWidth: 1,
                lineColor: '#FFFFFF'
              }
            ]
          },
          //   {
          //   table: {
          //     widths: ['*', 'auto'], 
          //     body: [
          //       [
          //         {
          //           text: `Date of Print ${currentDate}`,
          //           fontSize: 13,
          //           // alignment: 'left',
          //           margin: [30,0,0,5],
          //           color:'blue',
          //           border: [false, false, false, false]
          //         },
          //         {
          //           text: `Page ${currentPage}`,
          //           fontSize: 13,
          //           // alignment: 'right',
          //           margin: [0,5,30,0],
          //           color:'blue',
          //           border: [false, false, false, false] 
          //         },

          //       ]
          //     ]
          //   }
          // }
        ],
        margin: [0, 0, 0, 10]
      };
    },
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 13,
        bold: false,
        margin: [10, 0, 0, 0]
      },
      headerStyle: {
        fontSize: 12,
        bold: true,
        alignment: 'center'
      }
    },
    pageMargins: [10, 60, 10, 60],
  }
  return docDefinition;


};

const getLvl = () => {
  return sessionStorage.getItem("lvlPdf") || "";
}
const getWho = () => {
  return sessionStorage.getItem("whoPdf") || "";
}


export const exportToPDF = (gridApi: any, rowData: any, widths: any, pdfHeader: any, lvl: any, who: any) => {
  rowData = rowData.map((res: any, index: number) => {
    return {
      srno: index + 1,
      ...res
    }
  });
  gridApi = [{ "field": "srno", width: 150, "hide": false, "headerName": "S.No", "filter": "agTextColumnFilter" }, ...gridApi];
  if (Array.isArray(widths)) {
    widths = ['5%', ...widths]
  }

  const doc = getDocument(gridApi, rowData, widths, pdfHeader);
  sessionStorage.setItem("lvlPdf", lvl);
  sessionStorage.setItem("whoPdf", who);

  pdfMake.createPdf(doc).download(pdfHeader);
};





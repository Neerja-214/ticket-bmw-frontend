import React, { useEffect, useReducer } from 'react';
import { useQuery } from '@tanstack/react-query';
import NrjAgGrid from '../../components/reusable/NrjAgGrid'; // Adjust path
import { useToaster } from '../../components/reusable/ToasterContext'; // Adjust path
import { nrjAxiosRequest } from '../../Hooks/useNrjAxios'; // Adjust path
import { getLvl, getWho } from '../../utilities/cpcb'; // Adjust path
import moment from 'moment';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry'; // Adjust path
import CPCB_Logo from '../../images/CPCB_Logo.jpg'; // Adjust path

// Reducer actions
const ACTIONS = {
  TRIGGER_GRID: 'grdtrigger',
  NEWROWDATA: 'newrow',
  RANDOM: 'rndm',
};

// Initial state
const initialState = {
  triggerG: 0,
  nwRow: [],
  rndm: 0,
};

type TicketState = {
  triggerG: number;
  nwRow: any[];
  rndm: number;
};

type Action = {
  type: string;
  payload: any;
};

// Reducer function
const reducer = (state: TicketState, action: Action) => {
  let newState: TicketState = { ...state };
  switch (action.type) {
    case ACTIONS.TRIGGER_GRID:
      newState.triggerG = action.payload;
      return newState;
    case ACTIONS.NEWROWDATA:
      newState.nwRow = action.payload;
      newState.triggerG = 1;
      return newState;
    case ACTIONS.RANDOM:
      newState.rndm += 1;
      return newState;
    default:
      return state;
  }
};

// Custom button renderer for Actions column
const CustomButtonRenderer = (params: any) => {
  return (
    <div className="flex gap-2">
      {params.buttons.map((btn: any) => (
        <button
          key={btn.colId}
          onClick={() => params.clicked(btn.buttonText, params.data)}
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm"
        >
          {btn.buttonText}
        </button>
      ))}
    </div>
  );
};

// Column definitions for the grid
const coldef = [
  { field: 'ticketId', headerName: 'Ticket ID', width: 150, filter: 'agTextColumnFilter', tooltipField: 'ticketId' },
  { field: 'issueType', headerName: 'Issue Type', width: 200, filter: 'agTextColumnFilter', tooltipField: 'issueType' },
  { field: 'generatedOn', headerName: 'Generated On', width: 180, filter: 'agTextColumnFilter', tooltipField: 'generatedOn' },
  { field: 'reviewedOn', headerName: 'Reviewed On', width: 180, filter: 'agTextColumnFilter', tooltipField: 'reviewedOn' },
  { field: 'reviewedBy', headerName: 'Reviewed By', width: 200, filter: 'agTextColumnFilter', tooltipField: 'reviewedBy' },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 250,
    cellRenderer: CustomButtonRenderer,
    cellRendererParams: {
      buttons: [
        { buttonText: 'View Ticket', colId: 'viewTicket', showApi: 'view|ticketId|[ticketId]' },
        { buttonText: 'Ticket Trail', colId: 'ticketTrail', showApi: 'trail|ticketId|[ticketId]' },
      ],
    },
  },
];

// Excel export configuration
const printExcelHeader = ['Ticket ID', 'Issue Type', 'Generated On', 'Reviewed On', 'Reviewed By'];
const keyOrder = ['ticketId', 'issueType', 'generatedOn', 'reviewedOn', 'reviewedBy'];
const excelColWidth = [
  { wch: 20 },
  { wch: 30 },
  { wch: 25 },
  { wch: 25 },
  { wch: 30 },
];

// PDF export configuration
const colDefPdf = [
  { field: 'ticketId', headerName: 'Ticket ID', width: 150, filter: 'agTextColumnFilter', tooltipField: 'ticketId' },
  { field: 'issueType', headerName: 'Issue Type', width: 200, filter: 'agTextColumnFilter', tooltipField: 'issueType' },
  { field: 'generatedOn', headerName: 'Generated On', width: 180, filter: 'agTextColumnFilter', tooltipField: 'generatedOn' },
  { field: 'reviewedOn', headerName: 'Reviewed On', width: 180, filter: 'agTextColumnFilter', tooltipField: 'reviewedOn' },
  { field: 'reviewedBy', headerName: 'Reviewed By', width: 200, filter: 'agTextColumnFilter', tooltipField: 'reviewedBy' },
];
const pdfColWidth = ['20%', '25%', '20%', '20%', '15%'];

// Dummy data for the grid
const dummyData = [
  {
    ticketId: 'TCK001',
    issueType: 'System Error',
    generatedOn: '01-Jul-2025',
    reviewedOn: '02-Jul-2025',
    reviewedBy: 'John Doe',
  },
  {
    ticketId: 'TCK002',
    issueType: 'Access Issue',
    generatedOn: '01-Jul-2025',
    reviewedOn: '',
    reviewedBy: '',
  },
  {
    ticketId: 'TCK003',
    issueType: 'Data Discrepancy',
    generatedOn: '30-Jun-2025',
    reviewedOn: '01-Jul-2025',
    reviewedBy: 'Jane Smith',
  },
];

const AllTickets: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { showToaster } = useToaster();

  // Mock data fetching function
  const fetchTickets = async () => {
    const lvl = getLvl() || 'CPCB';
    const who = getWho();
    const dt = UseMomentDateNmb(moment(Date.now()).format('DD-MMM-yyyy'));
    const payload = {
      lvl,
      who,
      date: dt,
    };
    return { data: dummyData };
    // Uncomment for actual API
    // return nrjAxiosRequest('getTickets', payload);
  };

  // Process fetched data
  const populateGrid = (data: any) => {
    let dt = data?.data || dummyData;
    if (dt && Array.isArray(dt)) {
      const ary = [...dt].sort((a, b) => a.ticketId.localeCompare(b.ticketId));
      dispatch({ type: ACTIONS.NEWROWDATA, payload: ary });
      setTimeout(() => {
        dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
      }, 500);
    } else {
      showToaster(['No ticket data found'], 'error');
    }
  };

  // Tanstack Query for data fetching
  const { refetch } = useQuery({
    queryKey: ['getTickets'],
    queryFn: fetchTickets,
    enabled: false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: populateGrid,
  });

  // Fetch data on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Grid event handlers
  const onGridLoaded = () => {
    console.log('Grid loaded');
  };

  const onRowSelected = (data: string) => {
    console.log('Selected row:', data);
  };

  const onButtonClicked = (action: string, rowData: any) => {
    if (action === 'View Ticket') {
      console.log('View Ticket clicked for:', rowData.ticketId);
    } else if (action === 'Ticket Trail') {
      console.log('Ticket Trail clicked for:', rowData.ticketId);
    }
  };

  return (
    <div className="flex flex-col bg-blue-900 relative overflow-hidden min-h-screen">
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
            <span className="font-semibold md:text-left font-sans">Change Government of India</span>
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
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaR0MDuxr4P1nT7tcj-j7FLNCz3GyW_ioo6Q&s"
            alt="Logo 4"
            className="h-10 md:h-14 w-20 md:w-24"
          />
        </div>
      </header>

      {/* Background Symbols */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-32 h-32 bg-blue-300 rounded-full opacity-30 animate-blob top-1/6 left-1/4"></div>
        <div className="absolute w-40 h-40 bg-blue-400 rounded-full opacity-30 animate-blob animation-delay-2000 top-1/8 right-1/8"></div>
        <div className="absolute w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-blob animation-delay-4000 bottom-1/4 right-0"></div>
      </div>

      {/* Grid Section */}
      <div className="flex-grow flex justify-center items-center pt-16 pb-8">
        <div className="bg-gray-200 bg-opacity-20 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full max-w-5xl mx-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white">All Tickets</h2>
          </div>
          <NrjAgGrid
            onGridLoaded={onGridLoaded}
            onRowSelected={onRowSelected}
            onButtonClicked={onButtonClicked}
            colDef={coldef}
            apiCall={''}
            rowData={[]}
            trigger={state.triggerG}
            newRowData={state.nwRow}
            showPagination={true}
            showTooltips={true}
            className="ag-theme-alpine-blue ag-theme-alpine"
            lvl={getLvl()}
            who={getWho()}
            sortBy={'ticketId'}
            showExport={true}
            showExportExcel={true}
            exceColWidth={excelColWidth}
            KeyOrder={keyOrder}
            pageTitle={'All Tickets Report: '}
            colDefPdf={colDefPdf}
            pdfColWidth={pdfColWidth}
            widthSerialNoCol={100}
          />
        </div>
      </div>

      {/* Blob Animation Styles */}
      <style>
        {`
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
        `}
      </style>
    </div>
  );
};

export default React.memo(AllTickets);
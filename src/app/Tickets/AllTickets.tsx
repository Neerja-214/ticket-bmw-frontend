import React, { useEffect, useReducer, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import NrjAgGrid from '../../components/reusable/NrjAgGrid';
import { useToaster } from '../../components/reusable/ToasterContext';
import { nrjAxiosRequest } from '../../Hooks/useNrjAxios';
import { getLvl, getWho } from '../../utilities/cpcb';
import moment from 'moment';
import { UseMomentDateNmb } from '../../Hooks/useMomentDtArry';
import CPCB_Logo from '../../images/CPCB_Logo.jpg';
import { Modal, Button, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { genericPostAPI } from 'src/services/apiService';

// Define type for ticket data
type TicketData = {
  ticketId: string;
  issueType: string;
  generatedOn: string;
  reviewedOn: string;
  reviewedBy: string;
  complainantName: string;
  complainantEmail: string;
  complainantPhone: string;
  closedDate: string;
  issue: string;
  screenshots: string[];
  ticketStatus: string;
  assignedTo: string;
};

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
  nwRow: TicketData[];
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
          onClick={() => params.onButtonClicked(btn.buttonText, params.data as TicketData)}
          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm"
        >
          {btn.buttonText}
        </button>
      ))}
    </div>
  );
};

// Dummy data for the grid
const dummyData: TicketData[] = [
  {
    ticketId: 'TCK001',
    issueType: 'System Error',
    generatedOn: '01-Jul-2025',
    reviewedOn: '02-Jul-2025',
    reviewedBy: 'John Doe',
    complainantName: 'Alice Johnson',
    complainantEmail: 'alice.johnson@example.com',
    complainantPhone: '+91 9876543210',
    closedDate: '03-Jul-2025',
    issue: 'Application crashed during data upload.',
    screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
    ticketStatus: 'Closed',
    assignedTo: 'John Doe',
  },
  {
    ticketId: 'TCK002',
    issueType: 'Access Issue',
    generatedOn: '01-Jul-2025',
    reviewedOn: '',
    reviewedBy: '',
    complainantName: 'Bob Smith',
    complainantEmail: 'bob.smith@example.com',
    complainantPhone: '+91 9123456789',
    closedDate: '',
    issue: 'User unable to login with valid credentials.',
    screenshots: ['screenshot3.jpg'],
    ticketStatus: 'Open',
    assignedTo: '',
  },
  {
    ticketId: 'TCK003',
    issueType: 'Data Discrepancy',
    generatedOn: '30-Jun-2025',
    reviewedOn: '01-Jul-2025',
    reviewedBy: 'Jane Smith',
    complainantName: 'Carol White',
    complainantEmail: 'carol.white@example.com',
    complainantPhone: '+91 9988776655',
    closedDate: '02-Jul-2025',
    issue: 'Incorrect data displayed in report.',
    screenshots: ['screenshot4.jpg'],
    ticketStatus: 'Closed',
    assignedTo: 'Jane Smith',
  },
];

// Static data for ticket trail
const dummyTrailData = [
  {
    date: '01-Jul-2025 10:00 AM',
    status: 'OPEN',
    details: 'Ticket created by Alice Johnson.',
  },
  {
    date: '02-Jul-2025 09:00 AM',
    status: 'REVIEWING',
    details: 'Ticket assigned to John Doe for review.',
  },
  {
    date: '02-Jul-2025 03:00 PM',
    status: 'PROGRESS',
    details: 'Investigation started, issue identified as server timeout.',
  },
  {
    date: '03-Jul-2025 11:00 AM',
    status: 'CLOSED',
    details: 'Issue resolved by updating server configuration.',
  },
];

// Mock officers list for Assign to dropdown
const officers = ['John Doe', 'Jane Smith', 'Michael Brown', ''];

const AllTickets: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { showToaster } = useToaster();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [trailModalOpen, setTrailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [showFullTrail, setShowFullTrail] = useState(false);

  // Column definitions for the grid
  const coldef = [
    { field: 'ticketId', headerName: 'Ticket ID', width: 150, filter: 'agTextColumnFilter', tooltipField: 'ticketId' },
    { field: 'issueType', headerName: 'Issue Type', width: 200, filter: 'agTextColumnFilter', tooltipField: 'issueType' },
    { field: 'generatedOn', headerName: 'Generated On', type: 'date', width: 180, filter: 'agTextColumnFilter', tooltipField: 'generatedOn' },
    { field: 'reviewedOn', headerName: 'Reviewed On', width: 180, filter: 'agTextColumnFilter', tooltipField: 'reviewedOn' },
    { field: 'reviewedBy', headerName: 'Reviewed By', width: 200, filter: 'agTextColumnFilter', tooltipField: 'reviewedBy' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 400,
      cellRenderer: CustomButtonRenderer,
      cellRendererParams: (params: any) => ({
        onButtonClicked: (buttonText: string, data: TicketData) => onButtonClicked(buttonText, data),
        buttons: [
          { buttonText: 'View Ticket', colId: 'viewTicket', showApi: 'view|ticketId|[ticketId]' },
          { buttonText: 'Ticket Trail', colId: 'ticketTrail', showApi: 'trail|ticketId|[ticketId]' },
          { buttonText: 'Assign Officer', colId: 'assignOfficer', showApi: 'assign|ticketId|[ticketId]' },
        ],
      }),
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

  // Mock data fetching function for grid
  const fetchTickets = async () => {
    // const lvl = getLvl() || 'CPCB';
    // const who = getWho();
    // const dt = UseMomentDateNmb(moment(Date.now()).format('DD-MMM-yyyy'));
    // const payload = {
    //   lvl,
    //   who,
    //   date: dt,
    // };
    // return { data: dummyData };
    // Uncomment for actual API
    // return nrjAxiosRequest('getTickets', payload);

      const payload = {
      rgd: "",
      stt: "",
      email: "",
      status: "",
      ticket_id: "CBSTBMW1",
      what_fnct: "bmwticket_show_tickets"
    };

    try {
      const data = await genericPostAPI("bmw/myApp", payload);
      if (data?.status === "success") {
        const result = data.result || [];
        const formatted = result.map((item: any) => ({
          ticketId: item.ticket_id || '',
          issueType: item.issue_type || '',
          generatedOn: moment(item.created_on?.$date).format("DD-MMM-YYYY") || '',
          reviewedOn: moment(item.updated_on?.$date).format("DD-MMM-YYYY") || '',
          reviewedBy: item?.assigned_to?.[1]?.assigned_to || '',
          complainantName: item.email?.split("@")[0] || '',
          complainantEmail: item.email || '',
          complainantPhone: '', // Not available in response
          closedDate: '', // Not provided
          issue: item.description || '',
          screenshots: [item.image || ''],
          ticketStatus: item.status || '',
          assignedTo: item.assigned_to?.[1]?.assigned_to || '',
        }));
        dispatch({ type: ACTIONS.NEWROWDATA, payload: formatted });
        setTimeout(() => {
          dispatch({ type: ACTIONS.TRIGGER_GRID, payload: 0 });
        }, 500);
      } else {
        showToaster([data?.message || "Failed to load tickets"], "error");
      }
    } catch (err: any) {
      console.error("API Error:", err);
      showToaster([err?.message || "Failed to fetch ticket data"], "error");
    }
  
  };

  // Mock API for fetching ticket details
  const fetchTicketDetails = async (ticketId: string): Promise<TicketData | null> => {
    const ticket = dummyData.find((t) => t.ticketId === ticketId);
    return ticket || null;
    // Uncomment for actual API
    // const response = await nrjAxiosRequest('viewTicket', { ticketId });
    // return response.data || null;
  };

  // Mock API for fetching ticket trail
  const fetchTicketTrail = async (ticketId: string) => {
    // Simulate API call
    return dummyTrailData;
    // Uncomment for actual API
    // return nrjAxiosRequest('ticketTrail', { ticketId });
  };

  // Process fetched data for grid
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

  const onButtonClicked = async (action: string, rowData: TicketData) => {
    if (action === 'View Ticket') {
      const ticketDetails = await fetchTicketDetails(rowData.ticketId);
      setSelectedTicket(ticketDetails);
      setViewModalOpen(true);
    } else if (action === 'Ticket Trail') {
      const ticketDetails = await fetchTicketDetails(rowData.ticketId);
      setSelectedTicket(ticketDetails);
      setTrailModalOpen(true);
    } else if (action === 'Assign Officer') {
      const ticketDetails = await fetchTicketDetails(rowData.ticketId);
      setSelectedTicket(ticketDetails);
      setAssignModalOpen(true);
    }
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedTicket(null);
  };

  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedTicket(null);
  };

  const handleCloseTrailModal = () => {
    setTrailModalOpen(false);
    setSelectedTicket(null);
    setShowFullTrail(false);
  };

  // const handleUpdateAssign = () => {
  //   console.log('Update clicked for:', selectedTicket?.ticketId, 'Assigned to:', selectedTicket?.assignedTo);
  //   showToaster(['Assignment updated successfully'], 'success');
  //   setAssignModalOpen(false);
  //   setSelectedTicket(null);
  // };

  const handleUpdateAssign = async () => {
  // if (!selectedTicket) return;

  const payload =

  {
  "ticket_id": "CBSTBMW1",
  "assigned_to": "Atishay CPCB",
  "assigned_by": "admin_user",
  "comment": "Assigning to atishay for data verification",
  "document_path": "sdfghjkl",
  "what_fnct":"bmwticket_assign_ticket"
}
  
  // {
  //   ticket_id: selectedTicket.ticketId,
  //   assigned_to: selectedTicket.assignedTo || 'Atishay CPCB', // fallback value if needed
  //   assigned_by: 'admin_user', // adjust based on actual login/session
  //   comment: `Assigning to ${selectedTicket.assignedTo} for data verification`,
  //   document_path: 'sdfghjkl', // replace with actual document path if dynamic
  //   what_fnct: 'bmwticket_assign_ticket',
  // };

  try {
    const res = await genericPostAPI('bmw/myApp', payload);

    if (res?.status === 'success') {
      showToaster([res.message || 'Ticket assigned successfully'], 'success');
      setAssignModalOpen(false);
      setSelectedTicket(null);
      refetch(); // Refresh grid data if needed
    } else {
      showToaster([res?.message || 'Failed to assign ticket'], 'error');
    }
  } catch (err: any) {
    console.error('Assignment Error:', err);
    showToaster([err?.message || 'Assignment failed due to server error'], 'error');
  }
};


  const handleViewFullTrail = async () => {
    setShowFullTrail(true);
    // Fetch trail data (using static data for now)
    const trailData = await fetchTicketTrail(selectedTicket?.ticketId || '');
    console.log('Fetched trail data:', trailData);
  };

  // Determine the index of the current status
  const statusOrder = ['OPEN', 'REVIEWING', 'PROGRESS', 'CLOSED'];
  const currentStatusIndex = selectedTicket?.ticketStatus
    ? statusOrder.indexOf(selectedTicket.ticketStatus.toUpperCase())
    : -1;

  return (
    <div className="flex flex-col bg-blue-900 relative overflow-y-auto min-h-screen">
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
            src="https://encrypted-tbn0.gstatic.com/images?q=tbni:ANd9GcSaR0MDuxr4P1nT7tcj-j7FLNCz3GyW_ioo6Q&s"
            alt="Logo 4"
            className="h-10 md:h-14 w-20 md:w-24"
          />
        </div>
      </header>

      {/* Background Symbols */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-32 h-32 bg-blue-300 rounded-full opacity-30 animate-blob top-1/6 left-1/4"></div>
        <div className="absolute w-40 h-40 bg-blue-400 rounded-full opacity-30 animate-blob animation-delay-2000 top-1/8 right-1/8"></div>
        <div className="absolute w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-blob animation-delay-4000 bottom-1/4 right-2/4"></div>
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
            exceColWidth={excelColWidth}
            KeyOrder={keyOrder}
            pageTitle={'All Tickets Report: '}
            colDefPdf={colDefPdf}
            pdfColWidth={pdfColWidth}
            widthSerialNoCol={100}
          />
        </div>
      </div>

      {/* View Ticket Modal */}
      <Modal open={viewModalOpen} onClose={handleCloseViewModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Ticket ID: {selectedTicket?.ticketId || 'N/A'}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Complainant Name:</Typography>
              <Typography variant="body1">{selectedTicket?.complainantName || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Complainant Email ID:</Typography>
              <Typography variant="body1">{selectedTicket?.complainantEmail || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Complainant Phone:</Typography>
              <Typography variant="body1">{selectedTicket?.complainantPhone || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Generated On:</Typography>
              <Typography variant="body1">{selectedTicket?.generatedOn || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Closed Date:</Typography>
              <Typography variant="body1">{selectedTicket?.closedDate || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Issue Type:</Typography>
              <Typography variant="body1">{selectedTicket?.issueType || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Issue:</Typography>
              <Typography variant="body1" sx={{ maxWidth: '60%' }}>{selectedTicket?.issue || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Screenshots:</Typography>
              <Typography variant="body1">{selectedTicket?.screenshots?.join(', ') || 'No screenshots available'}</Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => {
                setViewModalOpen(false);
                setTrailModalOpen(true);
              }}
            >
              View Trail
            </Button>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseViewModal} style={{ textTransform: 'none' }}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Assign Officer Modal */}
      <Modal open={assignModalOpen} onClose={handleCloseAssignModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 500 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Ticket ID: {selectedTicket?.ticketId || 'N/A'}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Ticket Status:</Typography>
              <Typography variant="body1">{selectedTicket?.ticketStatus || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Generated On:</Typography>
              <Typography variant="body1">{selectedTicket?.generatedOn || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Issue:</Typography>
              <Typography variant="body1" sx={{ maxWidth: '60%' }}>{selectedTicket?.issue || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Issue Type:</Typography>
              <Typography variant="body1">{selectedTicket?.issueType || 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Assign to:</Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="assign-to-label">Assign to</InputLabel>
                <Select
                  labelId="assign-to-label"
                  value={selectedTicket?.assignedTo || ''}
                  label="Assign to"
                  disabled
                >
                  {officers.map((officer) => (
                    <MenuItem key={officer} value={officer}>
                      {officer || 'Unassigned'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={handleCloseAssignModal} style={{ textTransform: 'none' }}>
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateAssign}
              style={{ textTransform: 'none' }}
            >
              Update
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Ticket Trail Modal */}
      <Modal open={trailModalOpen} onClose={handleCloseTrailModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 600 },
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Ticket Trail: {selectedTicket?.ticketId || 'N/A'}
          </Typography>
          <Box sx={{ mt: 2 }}>
            {/* Stepper */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, position: 'relative' }}>
              {statusOrder.map((status, index) => (
                <Box key={status} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: index <= currentStatusIndex && currentStatusIndex !== -1 ? '#b45309' : '#000000',
                      animation: index === currentStatusIndex && currentStatusIndex !== -1 ? 'pulse 1.5s infinite' : 'none',
                      mb: 1,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: index <= currentStatusIndex && currentStatusIndex !== -1 ? '#b45309' : '#000000' }}>
                    {status}
                  </Typography>
                </Box>
              ))}
              {/* Connecting Lines */}
              {statusOrder.slice(0, -1).map((_, index) => (
                <Box
                  key={`line-${index}`}
                  sx={{
                    position: 'absolute',
                    top: 5,
                    left: `${(index + 0.5) * (100 / statusOrder.length)}%`,
                    width: `${100 / statusOrder.length}%`,
                    height: 2,
                    backgroundColor: index < currentStatusIndex && currentStatusIndex !== -1 ? '#b45309' : '#000000',
                    zIndex: 0,
                  }}
                />
              ))}
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleViewFullTrail}
              sx={{ mb: 2 }}
              style={{ textTransform: 'none' }}
            >
              View Full Details
            </Button>
            {showFullTrail && (
              <Box sx={{ mt: 2 }}>
                {dummyTrailData.map((trail, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                        }}
                      />
                      {index < dummyTrailData.length - 1 && (
                        <Box
                          sx={{
                            width: 2,
                            flex: 1,
                            backgroundColor: 'grey.400',
                            height: 60,
                          }}
                        />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {trail.date}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {trail.status}
                      </Typography>
                      <Typography variant="body2">{trail.details}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseTrailModal} style={{ textTransform: 'none' }}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Styles */}
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
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default React.memo(AllTickets);
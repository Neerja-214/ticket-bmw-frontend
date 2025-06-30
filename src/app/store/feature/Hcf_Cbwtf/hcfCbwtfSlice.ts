import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import axios from 'axios'

// Define a type for the slice state
interface hcf_cbwtfState {
  tableData: any[],
  status: 'loading' | 'succeeded' | 'failed' | '',
  frmData: string,
  error: string | undefined,
  gid : string,
  prntRep : string,
}

// Define the initial state using that type
const initialState: hcf_cbwtfState = {
  tableData: [],
  frmData: "",
  gid : "",
  prntRep : "",
  status: "",
  error: "", 
}

/****************************************************** Code of dynamic Actions definition *********************************************** */

// export const fetchSomeData = createAsyncThunk('hcf_cbwtf/fetchSomeData', async () => {
//     try {
//       const response = await axios.get('your-api-endpoint-here');
//       return response.data; // Assuming the response data is what you want to store in the state
//     } catch (error) {
//       throw error;
//     }
//   });
  
export const hcf_cbwtfSlice = createSlice({
  name: 'hcf_cbwtf',
  initialState,
  reducers: {
    storeTableData: (state, action: PayloadAction<any>) => {
      state.tableData = action.payload
    },
    appendTableData: (state, action: PayloadAction<any>) => {
        state.tableData = [...state.tableData, ...action.payload]
    },
    storeFormData: (state, action: PayloadAction<any>) => {
        state.frmData = action.payload 
        state.tableData = [];
        state.prntRep = "";
        state.gid = "";
    },
    storeGidData: (state, action: PayloadAction<any>) => {
      state.gid = action.payload 
    },
    storePrintData: (state, action: PayloadAction<any>) => {
      state.prntRep = action.payload 
    },
    clearStateAll: (state) => {
      state.gid = ""
      state.frmData = ""
      state.tableData = []
      state.prntRep = ""
    },
  },

  extraReducers: (builder) => {
    /****************************************************** Code of dynamic Actions *********************************************** */
    // builder
    //   .addCase(fetchSomeData.pending, (state) => {
    //     state.status = 'loading';
    //   })
    //   .addCase(fetchSomeData.fulfilled, (state, action) => {
    //     state.status = 'succeeded';
    //     state.value = action.payload;
    //   })
    //   .addCase(fetchSomeData.rejected, (state, action) => {
    //     state.status = 'failed';
    //     state.error = action.error?.message;
    //   });
  },

})

export const { storeTableData, storeFormData, appendTableData,storeGidData,storePrintData,clearStateAll } = hcf_cbwtfSlice.actions

export const selectTableData = (state: RootState) => state.hcf_cbwtf.tableData
export const selectFormData = (state: RootState) => state.hcf_cbwtf.frmData
export const selectGidData= (state: RootState) => state.hcf_cbwtf.gid
export const selectPrintReport= (state: RootState) => state.hcf_cbwtf.prntRep

export default  hcf_cbwtfSlice.reducer
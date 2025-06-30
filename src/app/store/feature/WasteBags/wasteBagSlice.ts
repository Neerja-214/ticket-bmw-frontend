import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import axios from 'axios'

// Define a type for the slice state
interface wasteBagState {
  tableData: any[],
  status: 'loading' | 'succeeded' | 'failed' | '',
  frmData: string,
  error: string | undefined,
  gid : string,
  prntRep : string,
}

// Define the initial state using that type
const initialState: wasteBagState = {
  tableData: [],
  frmData: "",
  gid : "",
  prntRep : "",
  status: "",
  error: "", 
}

/****************************************************** Code of dynamic Actions definition *********************************************** */

// export const fetchSomeData = createAsyncThunk('wasteBag/fetchSomeData', async () => {
//     try {
//       const response = await axios.get('your-api-endpoint-here');
//       return response.data; // Assuming the response data is what you want to store in the state
//     } catch (error) {
//       throw error;
//     }
//   });
  
export const wasteBagSlice = createSlice({
  name: 'wasteBag',
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

export const { storeTableData, storeFormData, appendTableData,storeGidData,storePrintData,clearStateAll } = wasteBagSlice.actions

export const selectTableData = (state: RootState) => state.wasteBag.tableData
export const selectFormData = (state: RootState) => state.wasteBag.frmData
export const selectGidData= (state: RootState) => state.wasteBag.gid
export const selectPrintReport= (state: RootState) => state.wasteBag.prntRep

export default wasteBagSlice.reducer
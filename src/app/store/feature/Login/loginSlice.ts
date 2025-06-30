import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'
import axios from 'axios'

// Define a type for the slice state
interface loginState {
  cmpId: string,
  usrId: string,
  mainId: string
  brd: string,
  who: string,
  lvlofc: string,
  lvl: string, 
  rgndirct: string,
  sttid: string,
  cbwtfrct: string,
}

// Define the initial state using that type
const initialState: loginState = {
  cmpId: "asdkjfhjas",
  usrId: "",
  mainId: "",
  brd: "",
  who: "",
  lvlofc: "",
  lvl: "",
  rgndirct: "",
  sttid: "",
  cbwtfrct: "",
}

/****************************************************** Code of dynamic Actions definition *********************************************** */
// export const fetchSomeData = createAsyncThunk('login/fetchSomeData', async () => {
//     try {
//       const response = await axios.get('your-api-endpoint-here');
//       return response.data; // Assuming the response data is what you want to store in the state
//     } catch (error) {
//       throw error;
//     }
//   });
  
export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    storeCmpIdData: (state, action: PayloadAction<any>) => {
      state.cmpId =  action.payload
    },
    storeUsrIdData: (state, action: PayloadAction<any>) => {
      state.usrId =  action.payload
    },
    storeMainIdData: (state, action: PayloadAction<any>) => {
      state.mainId =  action.payload
    },
    storeBrdData: (state, action: PayloadAction<any>) => {
      state.brd =  action.payload
    },
    storeWhoData: (state, action: PayloadAction<any>) => {
      state.who =  action.payload
    },
    storeLvlofcData: (state, action: PayloadAction<any>) => {
      state.cmpId =  action.payload
    },
    storeLvlData: (state, action: PayloadAction<any>) => {
      state.cmpId =  action.payload
    },
    storeRgndirctData: (state, action: PayloadAction<any>) => {
      state.rgndirct =  action.payload
    },
    storeSttidData: (state, action: PayloadAction<any>) => {
      state.sttid =  action.payload
    },
    storeCbwtfrctData: (state, action: PayloadAction<any>) => {
      state.cbwtfrct =  action.payload
    },
    clearStateAll: (state) => {
      state.cmpId = ""
      state.usrId = ""
      state.mainId = ""
      state.brd = ""
      state.who = ""
      state.lvlofc = ""
      state.lvl = ""
      state.rgndirct = ""
      state.sttid = ""
      state.cbwtfrct = ""
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

export const { storeCmpIdData, storeUsrIdData, storeMainIdData, storeBrdData, storeWhoData, storeLvlofcData, storeLvlData, storeRgndirctData, storeSttidData, storeCbwtfrctData, clearStateAll } = loginSlice.actions

export const selectCmpIdData = (state: RootState) => state.login.cmpId
export const selectUsrIdData = (state: RootState) => state.login.usrId
export const selectMainIdData = (state: RootState) => state.login.mainId
export const selectBrdData = (state: RootState) => state.login.brd
export const selectWhoData = (state: RootState) => state.login.who
export const selectLvlofcData = (state: RootState) => state.login.lvlofc
export const selectLvlData = (state: RootState) => state.login.cmpId
export const selectRgndirctData = (state: RootState) => state.login.cmpId
export const selectSttidData = (state: RootState) => state.login.cmpId
export const selectCbwtfrctData = (state: RootState) => state.login.cmpId

export default loginSlice.reducer
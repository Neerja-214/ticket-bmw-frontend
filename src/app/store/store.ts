import { Reducer, combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import wasteBagReducer from './feature/WasteBags/wasteBagSlice';
import loginReducer from './feature/Login/loginSlice';
import cbwtfListReducer from './feature/CbwtfList/cbwtfListSlice';
import hcf_cbwtfReducer from './feature/Hcf_Cbwtf/hcfCbwtfSlice';
import wrongHcfCodeReducer from './feature/WrongHcfCode/wrongHcfCodeSlice'
import hcfListReducer from './feature/HcfList/hcfListSlice'


const persistConfig = {
  key: 'root', // key for the root of the storage
  storage, // specify the storage mechanism
};

const rootReducer = combineReducers({
  wasteBag: wasteBagReducer,
  login: loginReducer,
  cbwtfList: cbwtfListReducer,
  hcf_cbwtf: hcf_cbwtfReducer,
  wrongHcfCode: wrongHcfCodeReducer,
  hcfList: hcfListReducer,
  // Add more slice reducers as needed
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer
});

export const persistor = persistStore(store); 

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
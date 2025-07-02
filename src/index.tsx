import React from 'react';
import ReactDOM from 'react-dom/client';
//delted css files
import './index.css';
import './styles/common.css'
import '@fortawesome/fontawesome-free/css/all.min.css';

import App from './App';
import reportWebVitals from './reportWebVitals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import "rsuite/dist/rsuite.min.css";
import "rsuite/dist/rsuite.css";
import 'ag-grid-community/styles/ag-grid.css';
import { persistor, store } from './app/store/store'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { ToasterProvider } from './components/reusable/ToasterContext';
import { ProSidebarProvider } from "react-pro-sidebar";
import 'bootstrap/dist/css/bootstrap.min.css';
import "primereact/resources/themes/lara-light-blue/theme.css"; // Or any other theme
import "primereact/resources/primereact.min.css"; 
import "primeicons/primeicons.css";




const queryClient = new QueryClient()



//change version of application
sessionStorage.setItem('version', '2');



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient} >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <ToasterProvider>
            <ProSidebarProvider>
              <App />
              </ProSidebarProvider>
            </ToasterProvider>
          </BrowserRouter>
        </PersistGate>
      </Provider>
      {/* <ReactQueryDevtools initialIsOpen={false}/> */}
    </QueryClientProvider>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
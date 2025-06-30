import React, { useContext, useState } from 'react';

export type ContextTypes = {
  value: { cmpid: number; usrid:number; cmpn : string; dsplynm: string } | null;
  setValue: (x: any) => any;
}

export const GlobalContext = React.createContext<ContextTypes>({
  value: null,
  setValue: () => {},
});

interface PropTypes {
  children: React.ReactNode;
}

export const GlobalContextProvider = ({ children }: PropTypes) => {
  const [value, setValue] = useState<{ cmpid: number; usrid:number; cmpn : string; dsplynm: string, db : string  } | null>(null);
  return (
    <GlobalContext.Provider
      value={{
        value,
        setValue,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

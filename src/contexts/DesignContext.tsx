import React, { createContext, useContext, useState } from 'react';

type DesignVariant = 1 | 2;

interface DesignContextValue {
  variant: DesignVariant;
  setVariant: (v: DesignVariant) => void;
}

const DesignContext = createContext<DesignContextValue>({
  variant: 1,
  setVariant: () => {},
});

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<DesignVariant>(1);
  return (
    <DesignContext.Provider value={{ variant, setVariant }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  return useContext(DesignContext);
}

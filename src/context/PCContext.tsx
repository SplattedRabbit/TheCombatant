import React, { createContext, useContext, ReactNode } from 'react';
import type { Combatant } from '../types/combat';

interface PCContextType {
  pc: Combatant;
}

const PCContext = createContext<PCContextType | undefined>(undefined);

interface PCProviderProps {
  pc: Combatant;
  children: ReactNode;
}

export const PCProvider: React.FC<PCProviderProps> = ({ pc, children }) => {
  return <PCContext.Provider value={{ pc }}>{children}</PCContext.Provider>;
};

export const usePC = (): Combatant => {
  const context = useContext(PCContext);
  if (!context) {
    throw new Error('usePC must be used within a PCProvider');
  }
  return context.pc;
};

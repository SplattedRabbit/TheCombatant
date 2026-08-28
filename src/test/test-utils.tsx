import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { DialogProvider } from '../context/DialogContext';

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return <DialogProvider>{children}</DialogProvider>;
};

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';

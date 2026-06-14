/**
 * @module    PCCompanionWrapper
 * @summary   Wrapper-Komponente für das Tierbegleiter- und Vertrauten-Sheet.
 * @exports   PCCompanionWrapper
 * @reads     pc
 * @depends   React, CompanionSheet, FamiliarSheet
 */

import React from 'react';
import { CompanionSheet } from './companion/CompanionSheet';
import { FamiliarSheet } from './companion/FamiliarSheet';

interface PCCompanionWrapperProps {
  pc: any;
  type: 'companion' | 'familiar';
  onUpdate: () => void;
}

export const PCCompanionWrapper: React.FC<PCCompanionWrapperProps> = ({ pc, type, onUpdate }) => {
  return type === 'companion' ? (
    <CompanionSheet pc={pc} onUpdate={onUpdate} />
  ) : (
    <FamiliarSheet pc={pc} onUpdate={onUpdate} />
  );
};


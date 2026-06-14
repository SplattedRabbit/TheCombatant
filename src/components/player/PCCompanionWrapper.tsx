/**
 * @module    PCCompanionWrapper
 * @summary   Wrapper-Komponente für das Tierbegleiter- und Vertrauten-Sheet. Nutzt dangerouslySetInnerHTML und die Vanilla bindEvents-Aufrufe.
 * @exports   PCCompanionWrapper
 * @reads     pc
 * @depends   React, @core/ui/components/CompanionSheet.js, @core/ui/components/FamiliarSheet.js
 */

import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { CompanionSheet } from '@core/ui/components/CompanionSheet.js';
// @ts-ignore
import { FamiliarSheet } from '@core/ui/components/FamiliarSheet.js';

interface PCCompanionWrapperProps {
  pc: any;
  type: 'companion' | 'familiar';
  onUpdate: () => void;
}

export const PCCompanionWrapper: React.FC<PCCompanionWrapperProps> = ({ pc, type, onUpdate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const html = type === 'companion' ? CompanionSheet.render(pc) : FamiliarSheet.render(pc);

  useEffect(() => {
    if (containerRef.current) {
      if (type === 'companion') {
        CompanionSheet.bindEvents(pc, containerRef.current, onUpdate);
      } else {
        FamiliarSheet.bindEvents(pc, containerRef.current, onUpdate);
      }
    }
  }, [pc, type, onUpdate]);

  return (
    <div
      ref={containerRef}
      className="companion-panel-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

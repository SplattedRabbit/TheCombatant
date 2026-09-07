import React, { useState } from 'react';
import { CombatState } from '@core/state.js';
import { uiRegistry } from '@core/ui/ui-shared.js';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { checkPrerequisites } from '@core/rules/RulesFeats.js';
import { SKILLS_REGISTRY } from '@core/data/skills-data.js';
import { FeatScrollParchment } from './feats/FeatScrollParchment.tsx';
import { FeatScrollActions } from './feats/FeatScrollActions.tsx';

interface FeatScrollDialogProps {
  feat: any;
  pc: any;
  isLearned: boolean;
  option?: string;
  onClose: () => void;
  onRefresh: () => void;
}

function translateAppEffect(text: string): string {
  return text || 'No automatic stat changes';
}

export const FeatScrollDialog: React.FC<FeatScrollDialogProps> = ({
  feat,
  pc,
  isLearned,
  option = '',
  onClose,
  onRefresh
}) => {
  const categoryEn =
    (
      { combat: 'Combat Feat', metamagic: 'Metamagic Feat', item_creation: 'Item Creation Feat', general: 'General Feat' } as Record<string, string>
    )[feat.category] || 'General Feat';

  const currentPC = (CombatState && typeof CombatState.getActivePC === 'function' ? CombatState.getActivePC() : null) || pc;
  const activeFeatsList = currentPC.feats || [];

  const { met, details: prereqsDetails } = checkPrerequisites(feat, currentPC);

  const autoFeats = typeof currentPC.getAutomaticFeats === 'function' ? currentPC.getAutomaticFeats() : [];
  const autoFeatObj = autoFeats.find((af: any) => af.id === feat.id);
  const isAutomatic = !!autoFeatObj;
  const isActuallyLearned = isLearned || activeFeatsList.some((f: any) => f.id === feat.id) || isAutomatic;

  const isStackable = feat.specialRaw && feat.specialRaw.toLowerCase().includes('multiple times');
  const learnedInstances = activeFeatsList.filter((f: any) => f.id === feat.id);

  let optionsList: string[] = [];
  if (feat.hasOption && (!isLearned || isStackable)) {
    if (feat.optionType === 'weapon') {
      optionsList = [
        'Longsword', 'Shortsword', 'Dagger', 'Greatsword', 'Composite Bow', 'Longbow',
        'Unarmed Strike', 'Quarterstaff', 'Kama', 'Nunchaku', 'Sai', 'Shuriken',
        'Siangham', 'Crossbow', 'Halberd', 'Morningstar', 'Battleaxe'
      ];
    } else if (feat.optionType === 'school') {
      optionsList = [
        'Abjuration', 'Conjuration', 'Divination', 'Evocation', 'Illusion',
        'Necromancy', 'Transmutation', 'Enchantment'
      ];
    } else if (feat.optionType === 'skill') {
      optionsList = Object.keys(SKILLS_REGISTRY).map((key) => {
        return key
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      });
      optionsList.sort((a, b) => a.localeCompare(b));
    }
  }

  const learnedOptions = learnedInstances.map((inst: any) => inst.option).filter(Boolean);
  const filteredOptions = optionsList.filter((o) => !learnedOptions.includes(o));

  const [selectedOption, setSelectedOption] = useState<string>(
    filteredOptions.length > 0 ? filteredOptions[0] : ''
  );

  const handleLearn = () => {
    const optToLearn = feat.hasOption ? selectedOption : '';
    const result = CombatState.addPCFeat(feat.id, optToLearn);
    if (result && !result.success) {
      showCustomAlert('Prerequisites Missing', result.error.replace(/\n/g, '<br>'), 'Understood', '🔒');
      return;
    }
    onClose();
    if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
      uiRegistry.renderPlayerScreen();
    }
  };

  const handleUnlearn = () => {
    CombatState.removePCFeat(feat.id, option);
    onClose();
    if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
      uiRegistry.renderPlayerScreen();
    }
  };

  const handleRemoveInstance = (instOption: string) => {
    CombatState.removePCFeat(feat.id, instOption);
    onRefresh();
    if (uiRegistry && typeof uiRegistry.renderPlayerScreen === 'function') {
      uiRegistry.renderPlayerScreen();
    }
  };

  const isLearnBlocked = !met;

  return (
    <div
      id="featScrollOverlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(18, 11, 5, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="custom-scroll-box"
        style={{
          background: 'var(--p)',
          border: '2px solid var(--pb)',
          borderRadius: '4px',
          padding: '14px 18px',
          width: '540px',
          maxWidth: '92vw',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(200,169,110,0.1)',
          fontFamily: 'var(--font-title)',
          textAlign: 'center',
          position: 'relative',
          transform: 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ position: 'absolute', inset: '3px', border: '0.5px dashed rgba(200, 169, 110, 0.3)', pointerEvents: 'none', borderRadius: '2px' }} />

        {/* Parchment Content */}
        <FeatScrollParchment
          feat={feat}
          categoryEn={categoryEn}
          met={met}
          prereqsDetails={prereqsDetails}
          isLearned={isLearned}
          isStackable={isStackable}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          filteredOptions={filteredOptions}
          learnedInstances={learnedInstances}
          onRemoveInstance={handleRemoveInstance}
          translateAppEffect={translateAppEffect}
        />

        {/* Action Footer */}
        <FeatScrollActions
          isActuallyLearned={isActuallyLearned}
          isStackable={isStackable}
          isLearnBlocked={isLearnBlocked}
          isAutomatic={isAutomatic}
          autoFeatObj={autoFeatObj}
          onLearn={handleLearn}
          onUnlearn={handleUnlearn}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

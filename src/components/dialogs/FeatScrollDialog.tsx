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
  if (!text) return text;
  let t = text;
  t = t.replace(/maximale Trefferpunkte/g, 'maximum Hit Points');
  t = t.replace(/\(stapelbar\)/g, '(stacks)');
  t = t.replace(/auf Zähigkeits-Rettungswurf/g, 'to Fortitude saves');
  t = t.replace(/auf Reflex-Rettungswurf/g, 'to Reflex saves');
  t = t.replace(/auf Willens-Rettungswurf/g, 'to Will saves');
  t = t.replace(/auf Willens-Rettungs-Wurf/g, 'to Will saves');
  t = t.replace(/auf Rettungswurf/g, 'to saves');
  t = t.replace(/Ladungen pro Tag für "Untote vertreiben"/g, 'turn undead attempts per day');
  t = t.replace(/Ladungen pro Tag für "Bardisches Lied"/g, 'bardic music uses per day');
  t = t.replace(/auf Rettungswurf-SG der gewählten Magieschule/g, 'to save DCs of selected school');
  t = t.replace(/Zusätzlich \+1 auf Rettungswurf-SG der gewählten Schule/g, '+1 to save DCs of selected school (stacks)');
  t = t.replace(/auf Zauberresistenz-Überwindungswürfe/g, 'to caster level checks to overcome spell resistance');
  t = t.replace(/Zusätzlich \+2 auf Zauberresistenz-Überwindungswürfe/g, '+2 to caster level checks to overcome spell resistance (stacks)');
  t = t.replace(/Konzentration beim defensiven Zaubern/g, 'Concentration checks when casting defensively');
  t = t.replace(/Erlaubt Zaubern in Tiergestalt/g, 'Allows casting spells in wild shape');
  t = t.replace(/Keine Standard-Materialkomponenten nötig \(<1 GM\)/g, 'No standard material components needed (<1 gp)');
  t = t.replace(/Einige Zauber ohne Zauberbuch vorbereiten/g, 'Prepare some spells without spellbook');
  t = t.replace(/Renn-Geschwindigkeit/g, 'run speed');
  t = t.replace(/Weitsprung/g, 'running jumps');
  t = t.replace(/Erlaubt Fährtensuche via Überleben/g, 'Allows tracking using Survival');
  t = t.replace(/auf Zähigkeitsprüfungen gegen Erschöpfung\/Umwelt/g, 'to Fortitude saves/checks against exhaustion/environments');
  t = t.replace(/Handlungsfähig bei -1 bis -9 TP/g, 'Act normally at -1 to -9 HP');
  t = t.replace(/Schaltet Gefährten\/Gefolgsleute frei/g, 'Unlocks cohort and followers');
  t = t.replace(/Kein Angriffs-Malus durch leichte Rüstung/g, 'No attack penalty for wearing light armor');
  t = t.replace(/Kein Angriffs-Malus durch mittelschwere Rüstung/g, 'No attack penalty for wearing medium armor');
  t = t.replace(/Kein Angriffs-Malus durch schwere Rüstung/g, 'No attack penalty for wearing heavy armor');
  t = t.replace(/Kein Angriffs-Malus durch Schilde/g, 'No attack penalty for shields');
  t = t.replace(/Kein Angriffs-Malus durch Turmschilde/g, 'No attack penalty for tower shields');
  t = t.replace(/Kein Malus bei einfachen Waffen/g, 'No penalty for simple weapons');
  t = t.replace(/Kein Malus bei der gewählten Kriegswaffe/g, 'No penalty for selected martial weapon');
  t = t.replace(/auf Springen und Akrobatik/g, 'to Jump and Tumble');
  t = t.replace(/auf Balance und Entfesselungskunst/g, 'to Balance and Escape Artist');
  t = t.replace(/auf Lauschen und Entdecken/g, 'to Listen and Spot');
  t = t.replace(/auf Mit Tieren umgehen und Reiten/g, 'to Handle Animal and Ride');
  t = t.replace(/auf Klettern und Schwimmen/g, 'to Climb and Swim');
  t = t.replace(/auf Verkleiden und Fälschen/g, 'to Disguise and Forgery');
  t = t.replace(/auf Taschendiebstahl und Seilbenutzung/g, 'to Sleight of Hand and Use Rope');
  t = t.replace(/Tränke brauen freigeschaltet \(ab Caster-Lvl 3\)/g, 'Brew Potions unlocked (Caster level 3)');
  t = t.replace(/Schriftrollen schreiben freigeschaltet/g, 'Scribe Scrolls unlocked');
  t = t.replace(/Zauberstäbe herstellen freigeschaltet \(ab Caster-Lvl 5\)/g, 'Craft Wands unlocked (Caster level 5)');
  t = t.replace(/Waffen\/Rüstungen herstellen freigeschaltet \(ab Caster-Lvl 5\)/g, 'Craft Arms & Armor unlocked (Caster level 5)');
  t = t.replace(/Wundersame Gegenstände herstellen freigeschaltet \(ab Caster-Lvl 3\)/g, 'Craft Wondrous Items unlocked (Caster level 3)');
  t = t.replace(/Zepter herstellen freigeschaltet \(ab Caster-Lvl 9\)/g, 'Craft Rods unlocked (Caster level 9)');
  t = t.replace(/Stecken herstellen freigeschaltet \(ab Caster-Lvl 12\)/g, 'Craft Staffs unlocked (Caster level 12)');
  t = t.replace(/Ringe schmieden freigeschaltet \(ab Caster-Lvl 12\)/g, 'Craft Rings unlocked (Caster level 12)');
  t = t.replace(/Zaubergrade Slot-Erhöhung/g, 'spell slot level increase');
  t = t.replace(/Zaubergrad Slot-Erhöhung/g, 'spell slot level increase');
  t = t.replace(/Freie Slot-Erhöhung für SG-Steigerung/g, 'Free slot increase for DC increase');
  
  t = t.replace(/freigeschaltet/gi, 'unlocked');
  t = t.replace(/ab Caster-Lvl/gi, 'from Caster level');
  t = t.replace(/pro Tag für/gi, 'per day for');
  t = t.replace(/auf/gi, 'to');
  t = t.replace(/oder/gi, 'or');
  t = t.replace(/benötigt/gi, 'required');
  return t;
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

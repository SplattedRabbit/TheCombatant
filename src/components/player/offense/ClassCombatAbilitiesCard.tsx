/**
 * @module    ClassCombatAbilitiesCard
 * @summary   Stances & Special Class Powers hub for continuous combat states (Barbarian Rage, Monk Flurry & Stunning Fist, Bardic Music, Assassin Death Attack, Breath Weapon, Favored Enemy).
 * @exports   ClassCombatAbilitiesCard
 * @reads     pc.classes, pc.dailyAbilities, pc.isRaging, pc.isFlurrying, pc.isBardInspireActive
 * @depends   React, src/components/shared/BaseCard, src/components/player/offense/stances/*
 */

import React, { useState } from 'react';
import { BaseCard } from '../../shared/BaseCard';
import { FavoredEnemyDialog } from '../../dialogs/BaseDialogs';
import { RageStanceSection } from './stances/RageStanceSection';
import { MonkStanceSection } from './stances/MonkStanceSection';
import { BardicMusicSection } from './stances/BardicMusicSection';
import { SpecialPowersSection } from './stances/SpecialPowersSection';
import { FavoredEnemySection } from './stances/FavoredEnemySection';

interface ClassCombatAbilitiesCardProps {
  pc: any;
}

export const ClassCombatAbilitiesCard: React.FC<ClassCombatAbilitiesCardProps> = ({ pc }) => {
  const [isFavoredEnemyDialogOpen, setIsFavoredEnemyDialogOpen] = useState(false);
  const activeClasses = Array.isArray(pc.classes) ? pc.classes : [];

  const barbarianClass = activeClasses.find((c: any) => c.classType === 'barbarian');
  const barbarianLvl = barbarianClass ? barbarianClass.level : 0;

  const monkClass = activeClasses.find((c: any) => c.classType === 'monk');
  const monkLvl = monkClass ? monkClass.level : 0;

  const bardClass = activeClasses.find((c: any) => c.classType === 'bard');
  const bardLvl = bardClass ? bardClass.level : 0;

  const assassinClass = activeClasses.find((c: any) => c.classType === 'assassin');
  const assassinLvl = assassinClass ? assassinClass.level : 0;

  const battleTricksterClass = activeClasses.find((c: any) => c.classType === 'battle_trickster');
  const battleTricksterLvl = battleTricksterClass ? battleTricksterClass.level : 0;

  const dragonDiscipleClass = activeClasses.find((c: any) => c.classType === 'dragon_disciple');
  const dragonDiscipleLvl = dragonDiscipleClass ? dragonDiscipleClass.level : 0;

  const rangerClass = activeClasses.find((c: any) => c.classType === 'ranger');
  const rangerLvl = rangerClass ? rangerClass.level : 0;

  const rageAbility = Array.isArray(pc.dailyAbilities)
    ? pc.dailyAbilities.find((a: any) => a.name === "Kampfrausch (Rage)" || a.name === "Rage" || a.name?.includes("Rage"))
    : null;
  const favoredEnemyBonus = typeof pc.getFavoredEnemyBonus === 'function' ? pc.getFavoredEnemyBonus() : 0;

  const hasAnyStances =
    barbarianLvl > 0 ||
    !!rageAbility ||
    monkLvl > 0 ||
    bardLvl > 0 ||
    assassinLvl > 0 ||
    battleTricksterLvl >= 3 ||
    dragonDiscipleLvl >= 3 ||
    rangerLvl > 0 ||
    favoredEnemyBonus > 0;

  // If no sustained stances/powers, return null so we don't clutter the view
  if (!hasAnyStances) {
    return null;
  }

  return (
    <>
      <BaseCard title="🥋 Stances &amp; Class Powers">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <RageStanceSection pc={pc} barbarianLvl={barbarianLvl} />
          <MonkStanceSection pc={pc} monkLvl={monkLvl} />
          <BardicMusicSection pc={pc} bardLvl={bardLvl} />
          <SpecialPowersSection
            pc={pc}
            assassinLvl={assassinLvl}
            battleTricksterLvl={battleTricksterLvl}
            dragonDiscipleLvl={dragonDiscipleLvl}
          />
          <FavoredEnemySection
            pc={pc}
            rangerLvl={rangerLvl}
            onOpenDialog={() => setIsFavoredEnemyDialogOpen(true)}
          />
        </div>
      </BaseCard>

      {isFavoredEnemyDialogOpen && (
        <FavoredEnemyDialog
          isOpen={isFavoredEnemyDialogOpen}
          onClose={() => setIsFavoredEnemyDialogOpen(false)}
          pc={pc}
        />
      )}
    </>
  );
};

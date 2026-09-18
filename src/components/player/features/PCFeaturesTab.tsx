/**
 * @module    PCFeaturesTab
 * @summary   Modern, unified 3-zone presentation of character class features, daily combat actions, and companions.
 */

import React, { useState, useMemo } from 'react';
import { CombatState } from '@core/state.js';
import { showCustomConfirm } from '@core/ui/components/dialogs.js';
import { PCCompanionWrapper } from './PCCompanionWrapper';
import { usePC } from '../../../context/PCContext';

import { getAllUnifiedFeatures } from './helpers/featureRegistry';
import { QuickCombatDashboard } from './QuickCombatDashboard';
import { FeaturesFilterBar, FeatureCategoryFilter } from './FeaturesFilterBar';
import { UnifiedFeatureCard } from './UnifiedFeatureCard';
import { CompanionMiniStatusWidget } from './CompanionMiniStatusWidget';
import { RulesInspectorDrawer } from './RulesInspectorDrawer';
import { WizardSpecializationDialog, DragonTotemDialog, FavoredEnemyDialog, DialogOverlay } from '../../dialogs/BaseDialogs';
import { ClericFeaturesCard } from './ClericFeaturesCard';
import { ClassACFSelector } from './ClassACFSelector';
import { showCustomAlert } from '@core/ui/components/dialogs.js';
import { getAblMod } from '../attributeHelper.ts';

export const PCFeaturesTab: React.FC = () => {
  const pc = usePC();
  const [, setTick] = useState(0);
  const triggerRender = () => setTick(t => t + 1);
  const [isSpecDialogOpen, setIsSpecDialogOpen] = useState(false);
  const [isTotemDialogOpen, setIsTotemDialogOpen] = useState(false);
  const [isFavoredEnemyDialogOpen, setIsFavoredEnemyDialogOpen] = useState(false);

  const [isACFModalOpen, setIsACFModalOpen] = useState(false);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const activeACFs: string[] = Array.isArray(pc.acfs) ? pc.acfs : [];
  const hasDragonShaman = hasClasses && pc.classes.some((c: { classType: string; level?: number }) => c.classType === 'dragon_shaman');

  // Check if Animal Companion is available
  const isCompanionReplaced = activeACFs.includes('ranger_distracting_attack') || 
                              activeACFs.includes('ranger_spiritual_guide') || 
                              activeACFs.includes('druid_shapeshift');
  
  const hasDruid = hasClasses && pc.classes.some((c: any) => c.classType === 'druid');
  const rangerClass = hasClasses ? pc.classes.find((c: any) => c.classType === 'ranger') : null;
  const hasRangerClass = !!rangerClass;
  const hasRanger = hasClasses && pc.classes.some((c: any) => c.classType === 'ranger' && (c.level || 0) >= 4);
  const hasCleric = hasClasses && pc.classes.some((c: any) => c.classType === 'cleric');
  const hasCompanion = !isCompanionReplaced && ((hasDruid || hasRanger) || (pc.companionType && pc.companionType !== 'none'));

  // Check if Familiar is available
  const isFamiliarReplaced = activeACFs.includes('wizard_immediate_magic') || 
                             activeACFs.includes('sorcerer_metamagic_specialist') || 
                             activeACFs.includes('hexblade_dark_companion');

  const hasWizard = hasClasses && pc.classes.some((c: any) => c.classType === 'wizard');
  const hasSorcerer = hasClasses && pc.classes.some((c: any) => c.classType === 'sorcerer');
  const hasHexblade = hasClasses && pc.classes.some((c: any) => c.classType === 'hexblade' && (c.level || 0) >= 4);
  const hasFamiliar = !isFamiliarReplaced && ((hasWizard || hasSorcerer || hasHexblade) || (pc.familiarType && pc.familiarType !== 'none'));

  const hasCompanionOrFamiliar = hasCompanion || hasFamiliar;

  // Active sub-tab state: 'features' | 'companion' | 'familiar'
  const [activeTab, setActiveTab] = useState<'features' | 'companion' | 'familiar'>('features');

  // Search and Category Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FeatureCategoryFilter>('all');

  // Unified Features Extraction
  const allFeatures = useMemo(() => {
    return getAllUnifiedFeatures(pc);
  }, [pc]);

  // Selected feature for Rules Inspector
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  // Filtered features
  const filteredFeatures = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list = allFeatures.filter((f) => {
      if (activeFilter !== 'all' && f.category !== activeFilter) return false;
      if (q) {
        const matchName = f.name.toLowerCase().includes(q);
        const matchSource = f.source.toLowerCase().includes(q);
        const matchSummary = f.summary.toLowerCase().includes(q);
        const matchRules = (f.rawRules || '').toLowerCase().includes(q);
        if (!matchName && !matchSource && !matchSummary && !matchRules) return false;
      }
      return true;
    });

    // Ensure specialist school is ALWAYS at the very top
    list.sort((a, b) => {
      if (a.id === 'wizard_specialization') return -1;
      if (b.id === 'wizard_specialization') return 1;
      return 0;
    });

    return list;
  }, [allFeatures, searchQuery, activeFilter]);

  // Counts by category
  const filterCounts = useMemo(() => {
    const counts: Record<FeatureCategoryFilter, number> = {
      all: allFeatures.length,
      combat: 0,
      daily: 0,
      passive: 0,
      aura: 0,
      'spell-like': 0,
    };
    allFeatures.forEach((f) => {
      if (counts[f.category] !== undefined) {
        counts[f.category] += 1;
      }
    });
    return counts;
  }, [allFeatures]);

  const selectedFeature = useMemo(() => {
    if (selectedFeatureId) {
      return allFeatures.find((f) => f.id === selectedFeatureId) || null;
    }
    return filteredFeatures[0] || null;
  }, [selectedFeatureId, allFeatures, filteredFeatures]);

  const handleNewDayReset = () => {
    showCustomConfirm(
      'New Day Reset 🌅',
      'Do you want to reset all daily abilities, spent spells, and resources for a new adventuring day?',
      () => {
        CombatState.resetDailyResources();
        triggerRender();
      }
    );
  };

  const handleRollWildEmpathy = () => {
    if (!rangerClass) return;
    const rLvl = rangerClass.level || 1;
    const chaMod = getAblMod(pc.cha || 10);
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + rLvl + chaMod;
    const sign = chaMod >= 0 ? `+${chaMod}` : `${chaMod}`;
    showCustomAlert(
      'Wild Empathy Check 🐾',
      `<div style="text-align:center; font-size:12px; line-height:1.5;">
        <div style="font-size:24px; font-weight:bold; color:var(--red); margin-bottom:6px;">${total}</div>
        <div><strong>d20 Roll:</strong> ${d20}</div>
        <div><strong>Ranger Level:</strong> +${rLvl}</div>
        <div><strong>Charisma Modifier:</strong> ${sign}</div>
        <div style="margin-top:8px; font-size:10px; font-style:italic; color:var(--inkm);">
          Functions like Diplomacy to influence an animal's attitude. Domestic animals start indifferent, wild animals start unfriendly.
        </div>
      </div>`,
      'Done',
      '🐾'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box', minHeight: '520px', width: '100%' }}>
      {/* Top Header Bar with Sub-Tabs and New Day Reset */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--pb)', paddingBottom: '4px', marginBottom: '2px' }}>
        {/* Sub-Navigation Tabs */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`btn ${activeTab === 'features' ? 'btn-p' : ''}`}
            style={{
              fontSize: '9.5px',
              padding: '2px 8px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
            }}
          >
            ⚔️ Class Features
          </button>

          {hasCompanionOrFamiliar && (
            <>
              {hasCompanion && (
                <button
                  type="button"
                  onClick={() => setActiveTab('companion')}
                  className={`btn ${activeTab === 'companion' ? 'btn-p' : ''}`}
                  style={{
                    fontSize: '9.5px',
                    padding: '2px 8px',
                    fontFamily: 'var(--font-title)',
                    fontWeight: 'bold',
                  }}
                >
                  🐾 Companions &amp; Familiars
                </button>
              )}

              {hasFamiliar && !hasCompanion && (
                <button
                  type="button"
                  onClick={() => setActiveTab('familiar')}
                  className={`btn ${activeTab === 'familiar' ? 'btn-p' : ''}`}
                  style={{
                    fontSize: '9.5px',
                    padding: '2px 8px',
                    fontFamily: 'var(--font-title)',
                    fontWeight: 'bold',
                  }}
                >
                  🦇 Companions &amp; Familiars
                </button>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {/* Class ACFs Button */}
          {hasClasses && (
            <button
              type="button"
              onClick={() => setIsACFModalOpen(true)}
              className="btn btn-s"
              style={{
                fontSize: '8px',
                padding: '2px 8px',
                fontFamily: 'var(--font-title)',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                lineHeight: 1,
              }}
              title="Configure Alternative Class Features"
            >
              <span>🎭</span> Class ACFs {activeACFs.length > 0 && `(${activeACFs.length})`}
            </button>
          )}

          {/* New Day Reset Button */}
          <button
            onClick={handleNewDayReset}
            className="btn btn-new-day"
            style={{
              fontSize: '8px',
              padding: '2px 8px',
              fontFamily: 'var(--font-title)',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)',
              color: 'white',
              border: '0.5px solid var(--red)',
              borderRadius: '2px',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            title="Restore daily abilities"
          >
            New Day Reset 🌅
          </button>
        </div>
      </div>

      {/* VIEW 1: FULL-WIDTH COMPANION SHEET */}
      {activeTab === 'companion' && hasCompanion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {hasCompanion && hasFamiliar && (
            <div style={{ display: 'flex', gap: '4px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '4px' }}>
              <button
                type="button"
                className="btn btn-p"
                style={{ fontSize: '8.5px', padding: '2px 6px' }}
              >
                🐾 Animal Companion / Mount
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('familiar')}
                className="btn"
                style={{ fontSize: '8.5px', padding: '2px 6px' }}
              >
                🦇 Familiar
              </button>
            </div>
          )}
          <PCCompanionWrapper
            pc={pc}
            type="companion"
            onUpdate={triggerRender}
          />
        </div>
      )}

      {/* VIEW 2: FULL-WIDTH FAMILIAR SHEET */}
      {activeTab === 'familiar' && hasFamiliar && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {hasCompanion && hasFamiliar && (
            <div style={{ display: 'flex', gap: '4px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '4px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('companion')}
                className="btn"
                style={{ fontSize: '8.5px', padding: '2px 6px' }}
              >
                🐾 Animal Companion / Mount
              </button>
              <button
                type="button"
                className="btn btn-p"
                style={{ fontSize: '8.5px', padding: '2px 6px' }}
              >
                🦇 Familiar
              </button>
            </div>
          )}
          <PCCompanionWrapper
            pc={pc}
            type="familiar"
            onUpdate={triggerRender}
          />
        </div>
      )}

      {/* VIEW 3: CLASS FEATURES MAIN HUB */}
      {activeTab === 'features' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* ZONE 1: Quick Combat Actions & Daily Resources Bar */}
          <QuickCombatDashboard pc={pc} onUpdate={triggerRender} />

          {/* ZONE 2: Search & Category Filter Bar */}
          <FeaturesFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={filterCounts}
          />

          {/* ZONE 3: 2-Column Responsive Workspace */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px', alignItems: 'start' }}>
            {/* Left Column: Unified Feature Cards List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                maxHeight: '460px',
                overflowY: 'auto',
                paddingRight: '3px',
              }}
              className="pc-scroll-features"
            >
              {hasCleric && (
                <ClericFeaturesCard pc={pc} level={pc.classes.find((c: any) => c.classType === 'cleric')?.level || 1} />
              )}

              {filteredFeatures.length === 0 ? (
                <div
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: 'var(--inkl)',
                    fontSize: '10px',
                    fontStyle: 'italic',
                    background: 'rgba(200, 169, 110, 0.08)',
                    border: '0.5px dashed var(--pb)',
                    borderRadius: '3px',
                  }}
                >
                  No features found matching the current search or filter.
                </div>
              ) : (
                filteredFeatures.map((feat) => (
                  <UnifiedFeatureCard
                    key={feat.id}
                    feature={feat}
                    isSelected={selectedFeature?.id === feat.id}
                    onSelect={() => setSelectedFeatureId(feat.id)}
                  />
                ))
              )}
            </div>

            {/* Right Column: Companion Mini-Widget + RAW Rules Inspector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Companion Status Widget (if character has companion or familiar) */}
              {hasCompanion && (
                <CompanionMiniStatusWidget
                  pc={pc}
                  type="companion"
                  onOpenFullSheet={() => setActiveTab('companion')}
                />
              )}

              {hasFamiliar && !hasCompanion && (
                <CompanionMiniStatusWidget
                  pc={pc}
                  type="familiar"
                  onOpenFullSheet={() => setActiveTab('familiar')}
                />
              )}

              <RulesInspectorDrawer
                feature={selectedFeature}
                onConfigureSpecialization={hasWizard ? () => setIsSpecDialogOpen(true) : undefined}
                onConfigureTotem={hasDragonShaman ? () => setIsTotemDialogOpen(true) : undefined}
                onConfigureFavoredEnemy={hasRangerClass ? () => setIsFavoredEnemyDialogOpen(true) : undefined}
                onSelectCombatStyle={hasRangerClass ? (style) => {
                  CombatState.updatePCField('rangerCombatStyle', style);
                  triggerRender();
                } : undefined}
                currentCombatStyle={pc.rangerCombatStyle || 'none'}
                onRollWildEmpathy={hasRangerClass ? handleRollWildEmpathy : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Wizard Specialization & Prohibited Schools Dialog */}
      {hasWizard && (
        <WizardSpecializationDialog
          pc={pc}
          isOpen={isSpecDialogOpen}
          onClose={() => {
            setIsSpecDialogOpen(false);
            triggerRender();
          }}
        />
      )}

      {/* Dragon Shaman Totem Selection Dialog */}
      {hasDragonShaman && (
        <DragonTotemDialog
          pc={pc}
          isOpen={isTotemDialogOpen}
          onClose={() => {
            setIsTotemDialogOpen(false);
            triggerRender();
          }}
        />
      )}

      {/* Ranger Favored Enemy Dialog */}
      {hasRangerClass && (
        <FavoredEnemyDialog
          pc={pc}
          isOpen={isFavoredEnemyDialogOpen}
          onClose={() => {
            setIsFavoredEnemyDialogOpen(false);
            triggerRender();
          }}
        />
      )}

      {/* Class ACF Selector Modal */}
      {isACFModalOpen && (
        <DialogOverlay onClose={() => setIsACFModalOpen(false)} width={540} id="acfSelectionModal">
          <div style={{ borderBottom: '1px solid var(--pb)', paddingBottom: '8px', marginBottom: '12px', textAlign: 'left' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--red)', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎭</span> Alternative Class Features (ACFs)
            </h3>
            <span style={{ fontSize: '9.5px', color: 'var(--inkm)', fontStyle: 'italic', fontFamily: 'var(--font-body)', display: 'block', marginTop: '3px' }}>
              Swap base class abilities for alternative archetypes (D&amp;D 3.5e RAW).
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '65vh', overflowY: 'auto', textAlign: 'left' }}>
            {Array.isArray(pc.classes) && pc.classes.map((c: any) => (
              <div key={c.classType} style={{ background: 'rgba(0,0,0,0.02)', border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '6px 8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--red)', fontFamily: 'var(--font-title)', textTransform: 'capitalize', marginBottom: '2px' }}>
                  {c.classType} (Level {c.level || 1})
                </div>
                <ClassACFSelector pc={pc} classKey={c.classType} level={c.level || 1} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid var(--pb)', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setIsACFModalOpen(false);
                triggerRender();
              }}
              className="btn btn-p"
              style={{ padding: '5px 16px', fontSize: '10px', fontFamily: 'var(--font-title)', fontWeight: 'bold' }}
            >
              Done
            </button>
          </div>
        </DialogOverlay>
      )}
    </div>
  );
};

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
import { WizardSpecializationDialog } from '../../dialogs/BaseDialogs';

export const PCFeaturesTab: React.FC = () => {
  const pc = usePC();
  const [, setTick] = useState(0);
  const triggerRender = () => setTick(t => t + 1);
  const [isSpecDialogOpen, setIsSpecDialogOpen] = useState(false);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const activeACFs: string[] = Array.isArray(pc.acfs) ? pc.acfs : [];

  // Check if Animal Companion is available
  const isCompanionReplaced = activeACFs.includes('ranger_distracting_attack') || 
                              activeACFs.includes('ranger_spiritual_guide') || 
                              activeACFs.includes('druid_shapeshift');
  
  const hasDruid = hasClasses && pc.classes.some((c: any) => c.classType === 'druid');
  const hasRanger = hasClasses && pc.classes.some((c: any) => c.classType === 'ranger' && (c.level || 0) >= 4);
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
    showCustomConfirm("A New Day! 🌅", "Would you like to restore all spent spell slots and daily class features and begin a new day?", () => {
      CombatState.resetDailyResources();
      triggerRender();
    });
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

              {/* RAW Rules Inspector Drawer */}
              <RulesInspectorDrawer
                feature={selectedFeature}
                onConfigureSpecialization={hasWizard ? () => setIsSpecDialogOpen(true) : undefined}
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
    </div>
  );
};

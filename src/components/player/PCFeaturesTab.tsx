/**
 * @module    PCFeaturesTab
 * @summary   Rendert Klassen-Features, Volksmerkmale und Begleiter/Vertrauten-Sheets für den Features-Reiter.
 * @exports   PCFeaturesTab
 * @reads     pc.classes, pc.race, pc.companionType, pc.familiarType, pc.dailyAbilities
 * @stateOps  CombatState.resetDailyResources
 * @depends   React, @core/state.js, @core/ui/components/player/ClassFeaturesRegistry.js, @core/ui/components/dialogs.js, PCCompanionWrapper
 */

import React, { useState, useEffect } from 'react';
// @ts-ignore
import { CombatState } from '@core/state.js';
// @ts-ignore
import { CLASS_FEATURE_REGISTRY } from '@core/ui/components/player/ClassFeaturesRegistry.js';
// @ts-ignore
import { showCustomConfirm } from '@core/ui/components/dialogs.js';
import { PCCompanionWrapper } from './PCCompanionWrapper';

interface PCFeaturesTabProps {
  pc: any;
}

export const PCFeaturesTab: React.FC<PCFeaturesTabProps> = ({ pc }) => {
  const [, setTick] = useState(0);
  const triggerRender = () => setTick(t => t + 1);

  const hasClasses = Array.isArray(pc.classes) && pc.classes.length > 0;
  const hasCompanion = (hasClasses && pc.classes.some((c: any) => ['druid', 'ranger'].includes(c.classType))) || (pc.companionType && pc.companionType !== 'none');
  const hasFamiliar = (hasClasses && pc.classes.some((c: any) => ['wizard', 'sorcerer'].includes(c.classType))) || (pc.familiarType && pc.familiarType !== 'none');

  const [activeSubTab, setActiveSubTab] = useState<'companion' | 'familiar'>('companion');

  // Adjust active tab based on what is available
  useEffect(() => {
    if (hasCompanion && hasFamiliar) {
      // Keep activeSubTab as is
    } else if (hasCompanion) {
      setActiveSubTab('companion');
    } else if (hasFamiliar) {
      setActiveSubTab('familiar');
    }
  }, [hasCompanion, hasFamiliar]);

  const activeComponents = CLASS_FEATURE_REGISTRY.filter((comp: any) => comp.isEligible(pc));

  const handleNewDayReset = () => {
    showCustomConfirm("Ein neuer Tag! 🌅", "Möchtest du alle verbrauchten Zauberslots und täglichen Klassenfähigkeiten wiederherstellen und einen neuen Tag beginnen?", () => {
      activeComponents.forEach((comp: any) => {
        const clsInfo = pc.classes ? pc.classes.find((c: any) => c.classType === comp.classKey) : null;
        const level = clsInfo ? clsInfo.level : 1;
        comp.onNewDay(pc, level);
      });

      CombatState.resetDailyResources();
    });
  };

  // Racial Features Card
  const race = (pc.race || 'human').toLowerCase();
  const raceNames: Record<string, string> = { human: 'Mensch', elf: 'Elf', dwarf: 'Zwerg', gnome: 'Gnom', halfling: 'Halbling', half_elf: 'Halbelf', half_orc: 'Halbork' };
  const raceName = raceNames[race] || 'Mensch';

  const getRacialTraitsHtml = () => {
    if (race === 'human') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Zusätzliches Talent:</strong> 1 zusätzliches Talent auf Stufe 1.</li>
          <li><strong>Zusätzliche Skillpunkte:</strong> +4 Skillpunkte auf Stufe 1, +1 auf jeder weiteren Stufe.</li>
        </ul>
      );
    } else if (race === 'dwarf') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Attributsmodifikationen:</strong> +2 Konstitution, -2 Charisma (bereits eingerechnet).</li>
          <li><strong>Dunkelsicht (Darkvision):</strong> Kann im Dunkeln bis zu 60 Fuß weit sehen.</li>
          <li><strong>Fester Stand (Stability):</strong> +4 auf Würfe zur Abwehr von Ansturm (Bull Rush) oder Niederwerfen (Trip).</li>
          <li><strong>Volksboni gegen Gift/Zauber:</strong> +2 Rettungswurf-Bonus gegen Gifte, Zauber und zauberähnliche Effekte.</li>
          <li><strong>Steingefühl (Stonecunning):</strong> +2 auf Suchen-Würfe bezüglich ungewöhnlicher Steinarbeiten.</li>
          <li><strong>Rüstungsresistenz:</strong> Bewegungsrate wird durch schwere Rüstung oder schwere Last nicht reduziert.</li>
        </ul>
      );
    } else if (race === 'elf') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Attributsmodifikationen:</strong> +2 Geschicklichkeit, -2 Konstitution (bereits eingerechnet).</li>
          <li><strong>Immunitäten:</strong> Immun gegen magische Schlafeffekte.</li>
          <li><strong>Volksboni gegen Verzauberung:</strong> +2 Rettungswurf-Bonus gegen Verzauberungszauber oder -effekte.</li>
          <li><strong>Geschärfte Sinne:</strong> +2 Volksbonus auf Suchen, Entdecken und Lauschen (bereits eingerechnet).</li>
          <li><strong>Umgang mit Waffen:</strong> Automatisch geübt mit Langschwert, Rapier, Langbogen und Kurzbogen.</li>
        </ul>
      );
    } else if (race === 'gnome') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Attributsmodifikationen:</strong> +2 Konstitution, -2 Stärke (bereits eingerechnet).</li>
          <li><strong>Größenkategorie Klein:</strong> +1 Größenbonus auf RK, +1 Größenbonus auf Angriffswürfe, +4 auf Verstecken (bereits eingerechnet).</li>
          <li><strong>Volksboni gegen Illusion:</strong> +2 Rettungswurf-Bonus gegen Illusionen.</li>
          <li><strong>Ausweichen gegen Riesen:</strong> +4 Ausweichbonus auf RK gegen Gegner der Kategorie Riese.</li>
          <li><strong>Geschärfte Sinne:</strong> +2 Volksbonus auf Lauschen und Handwerk (Alchemie).</li>
        </ul>
      );
    } else if (race === 'halfling') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Attributsmodifikationen:</strong> +2 Geschicklichkeit, -2 Stärke (bereits eingerechnet).</li>
          <li><strong>Größenkategorie Klein:</strong> +1 Größenbonus auf RK, +1 Größenbonus auf Angriffswürfe, +4 auf Verstecken (bereits eingerechnet).</li>
          <li><strong>Glückspilz:</strong> +1 Volksbonus auf alle Rettungswürfe (bereits eingerechnet).</li>
          <li><strong>Furchtlosigkeit:</strong> +2 Moralbonus auf Rettungswürfe gegen Furcht.</li>
          <li><strong>Geschärfte Sinne:</strong> +2 Volksbonus auf Klettern, Springen, Lauschen und Leise bewegen (bereits eingerechnet).</li>
        </ul>
      );
    } else if (race === 'half_elf') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Immunitäten:</strong> Immun gegen magische Schlafeffekte, +2 Rettungswurf-Bonus gegen Verzauberungszauber oder -effekte.</li>
          <li><strong>Geschärfte Sinne:</strong> +1 Volksbonus auf Lauschen, Entdecken und Suchen (bereits eingerechnet).</li>
          <li><strong>Diplomatisches Geschick:</strong> +2 Volksbonus auf Diplomatie und Informationen sammeln (bereits eingerechnet).</li>
          <li><strong>Elbisches Blut:</strong> Gilt in allen Belangen als Elf.</li>
        </ul>
      );
    } else if (race === 'half_orc') {
      return (
        <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '9px', fontFamily: "'Crimson Text', serif", lineHeight: 1.3, color: 'var(--inkm)' }}>
          <li><strong>Attributsmodifikationen:</strong> +2 Stärke, -2 Intelligenz, -2 Charisma (bereits eingerechnet).</li>
          <li><strong>Dunkelsicht (Darkvision):</strong> Kann im Dunkeln bis zu 60 Fuß weit sehen.</li>
          <li><strong>Orkisches Blut:</strong> Gilt in allen Belangen als Ork.</li>
        </ul>
      );
    }
    return null;
  };

  // Callback Ref to bind feature DOM events dynamically
  const bindFeatureRef = (comp: any, level: number) => (el: HTMLDivElement | null) => {
    if (el) {
      comp.bindEvents(pc, level, el, triggerRender);
    }
  };

  const hasCompanionOrFamiliar = hasCompanion || hasFamiliar;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', height: '100%', boxSizing: 'border-box' }}>
      {/* Left Column: Class Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '0.5px solid rgba(200, 169, 110, 0.2)', paddingRight: '8px' }}>
        <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid var(--pb)', paddingBottom: '2px', marginBottom: '4px' }}>
          <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>
            ⚔️ Klassen-Features
          </span>
          <button
            onClick={handleNewDayReset}
            className="btn btn-new-day"
            style={{ fontSize: '8px', padding: '2px 8px', fontFamily: "'IM Fell English SC', serif", fontWeight: 'bold', background: 'linear-gradient(135deg, #c8a96e, #9a7a2e)', color: 'white', border: '0.5px solid var(--red)', borderRadius: '2px', cursor: 'pointer', lineHeight: 1 }}
            title="Tägliche Fähigkeiten wiederherstellen"
          >
            Tagesreset 🌅
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '380px', overflowY: 'auto', paddingRight: '2px' }} className="pc-scroll-features">
          {/* Racial traits */}
          <div style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '6px 8px', background: 'rgba(200, 169, 110, 0.03)', marginBottom: '6px', display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)', paddingBottom: '2px' }}>
              <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>
                🧬 Volksmerkmale: {raceName}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {getRacialTraitsHtml()}
            </div>
          </div>

          {/* Active classes features */}
          {activeComponents.map((comp: any) => {
            const clsInfo = pc.classes ? pc.classes.find((c: any) => c.classType === comp.classKey) : null;
            const level = clsInfo ? clsInfo.level : 1;
            const htmlContent = comp.render(pc, level);

            return (
              <div
                key={comp.classKey}
                ref={bindFeatureRef(comp, level)}
                className="feature-comp-wrapper"
                data-class={comp.classKey}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            );
          })}
        </div>
      </div>

      {/* Right Column: Companions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10px', color: 'var(--red)', fontWeight: 'bold', borderBottom: '0.5px solid var(--pb)', paddingBottom: '2px', marginBottom: '4px' }}>
          🐾 Begleiter &amp; Vertraute
        </div>

        {hasCompanionOrFamiliar ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {hasCompanion && hasFamiliar && (
              <div style={{ display: 'flex', gap: '3px', borderBottom: '0.5px solid var(--pb)', paddingBottom: '3.5px', marginBottom: '6px' }}>
                <button
                  onClick={() => setActiveSubTab('companion')}
                  className={`btn ${activeSubTab === 'companion' ? 'btn-p' : ''}`}
                  style={{ fontSize: '8px', padding: '2px 6px' }}
                >
                  🐾 Tierbegleiter
                </button>
                <button
                  onClick={() => setActiveSubTab('familiar')}
                  className={`btn ${activeSubTab === 'familiar' ? 'btn-p' : ''}`}
                  style={{ fontSize: '8px', padding: '2px 6px' }}
                >
                  🦇 Vertrauter
                </button>
              </div>
            )}

            <PCCompanionWrapper
              pc={pc}
              type={activeSubTab}
              onUpdate={triggerRender}
            />
          </div>
        ) : (
          <div style={{ fontSize: '9px', color: 'var(--inkl)', fontStyle: 'italic', textAlign: 'center', padding: '35px 10px', background: 'rgba(0,0,0,0.02)', border: '0.5px dashed var(--pb)', borderRadius: '2px' }}>
            🐾 Kein aktiver Tierbegleiter oder Vertrauter.
          </div>
        )}
      </div>
    </div>
  );
};

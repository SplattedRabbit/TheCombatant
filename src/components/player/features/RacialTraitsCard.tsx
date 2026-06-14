import React from 'react';

interface RacialTraitsCardProps {
  pc: any;
}

export const RacialTraitsCard: React.FC<RacialTraitsCardProps> = ({ pc }) => {
  const race = (pc.race || 'human').toLowerCase();
  const raceNames: Record<string, string> = {
    human: 'Mensch',
    elf: 'Elf',
    dwarf: 'Zwerg',
    gnome: 'Gnom',
    halfling: 'Halbling',
    half_elf: 'Halbelf',
    half_orc: 'Halbork'
  };
  const raceName = raceNames[race] || 'Mensch';

  const getRacialTraitsContent = () => {
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

  return (
    <div style={{ border: '0.5px solid var(--pb)', borderRadius: '3px', padding: '6px 8px', background: 'rgba(200, 169, 110, 0.03)', marginBottom: '6px', display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(200, 169, 110, 0.2)', paddingBottom: '2px' }}>
        <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: '10px', fontWeight: 'bold', color: 'var(--red)' }}>
          🧬 Volksmerkmale: {raceName}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {getRacialTraitsContent()}
      </div>
    </div>
  );
};

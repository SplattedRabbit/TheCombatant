import { showCustomAlert } from '@core/ui/components/dialogs.js';

/**
 * Zeigt einen Dialog mit einer detaillierten Erläuterung des ausgewählten D&D 3.5-Attributs an.
 * @param key Attributs-Kürzel ('str' | 'dex' | 'con' | 'int' | 'wis' | 'cha')
 */
export const showAttributeExplanation = (key: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha') => {
  const explanations = {
    str: {
      title: 'Stärke (STR)',
      icon: '💪',
      desc: 'Macht:\nBestimmt die körperliche Kraft deines Charakters. Sie ist besonders wichtig für Kämpfer, Barbaren, Paladine, Waldläufer und Mönche, da sie direkt deren Kampfkraft beeinflusst.\n\nBeeinflusst:\n• Nahkampfangriffs- und Schadenswürfe\n• Schadenswürfe mit Wurfwaffen\n• Schaden mit Zweihandwaffen (1.5-facher Stärkebonus)\n• Fertigkeiten: Klettern (Climb), Springen (Jump), Schwimmen (Swim)\n• Tragfähigkeit (Tragkraft) deines Charakters'
    },
    dex: {
      title: 'Geschicklichkeit (DEX)',
      icon: '🏹',
      desc: 'Macht:\nBestimmt Flinkheit, Reflexe, Gleichgewicht und Zielsicherheit. Sie ist das wichtigste Attribut für Schurken und Fernkämpfer.\n\nBeeinflusst:\n• Fernkampfangriffswürfe und Initiativewürfe\n• Rüstungsklasse (RK) - erschwert es Gegnern, dich zu treffen\n• Reflex-Rettungswürfe (Ausweichen vor Zaubern/Fallen)\n• Fertigkeiten: Leise bewegen, Verstecken, Schlösser öffnen, Akrobatik, Taschendiebstahl'
    },
    con: {
      title: 'Konstitution (CON)',
      icon: '🛡️',
      desc: 'Macht:\nRepräsentiert Gesundheit, Ausdauer und Zähigkeit. Sie ist für alle Klassen gleichermaßen wichtig, da sie das Überleben im Kampf sichert.\n\nBeeinflusst:\n• Zusätzliche Trefferpunkte (TP) pro Trefferwürfel/Stufe\n• Zähigkeits-Rettungswürfe (Widerstand gegen Gift, Krankheit, Lähmung)\n• Fertigkeit: Konzentration (wichtig für Zauberwirker unter Beschuss)'
    },
    int: {
      title: 'Intelligenz (INT)',
      icon: '🧠',
      desc: 'Macht:\nSpiegelt mentale Schärfe, Lernfähigkeit und Gedächtnis wider. Wichtig für Magier und Charaktere, die viele Fertigkeiten nutzen wollen.\n\nBeeinflusst:\n• Anzahl der Fertigkeitspunkte bei der Erstellung (x4 auf Stufe 1) und bei jedem Stufenaufstieg\n• Höchster Zaubergrad und Schwierigkeitsgrad (SG) für Magier-Zauber\n• Fertigkeiten: Wissen (alle), Suchen, Sprachen sprechen, Handwerk, Appretieren'
    },
    wis: {
      title: 'Weisheit (WIS)',
      icon: '👁️',
      desc: 'Macht:\nBeschreibt Intuition, Willenskraft, Wahrnehmung und Urteilsvermögen. Wichtig für Kleriker, Druiden, Waldläufer und Mönche.\n\nBeeinflusst:\n• Willens-Rettungswürfe (Widerstand gegen Gedankenkontrolle und Illusionen)\n• Höchster Zaubergrad und Schwierigkeitsgrad (SG) für Kleriker-, Druiden- und Waldläufer-Zauber\n• Fertigkeiten: Lauschen, Entdecken, Motiv erkennen, Heilen, Überlebenskunst'
    },
    cha: {
      title: 'Charisma (CHA)',
      icon: '👑',
      desc: 'Macht:\nMisst Ausstrahlung, Persönlichkeit, Überzeugungskraft und Führungsstärke. Wichtig für Hexenmeister, Barden und Paladine.\n\nBeeinflusst:\n• Höchster Zaubergrad und Schwierigkeitsgrad (SG) für Hexenmeister- und Barden-Zauber\n• Proben zum Vertreiben von Untoten (Kleriker & Paladine)\n• Fertigkeiten: Bluffen, Diplomatie, Einschüchtern, Motivieren, Tiersprache'
    }
  };
  const info = explanations[key];
  // @ts-ignore
  showCustomAlert(info.title, info.desc, 'Verstanden', info.icon);
};

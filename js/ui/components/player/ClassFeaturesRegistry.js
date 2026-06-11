import { GeneralFeatures } from '../class-features/GeneralFeatures.js';
import { BarbarianFeatures } from '../class-features/BarbarianFeatures.js';
import { BardFeatures } from '../class-features/BardFeatures.js';
import { PaladinFeatures } from '../class-features/PaladinFeatures.js';
import { ClericFeatures } from '../class-features/ClericFeatures.js';
import { MonkFeatures } from '../class-features/MonkFeatures.js';
import { RogueFeatures } from '../class-features/RogueFeatures.js';
import { DruidFeatures } from '../class-features/DruidFeatures.js';
import { RangerFeatures } from '../class-features/RangerFeatures.js';
import { WizardFeatures } from '../class-features/WizardFeatures.js';
import { SorcererFeatures } from '../class-features/SorcererFeatures.js';

export const CLASS_FEATURE_REGISTRY = [
  new GeneralFeatures(),
  new BarbarianFeatures(),
  new BardFeatures(),
  new PaladinFeatures(),
  new ClericFeatures(),
  new MonkFeatures(),
  new RogueFeatures(),
  new DruidFeatures(),
  new RangerFeatures(),
  new WizardFeatures(),
  new SorcererFeatures()
];

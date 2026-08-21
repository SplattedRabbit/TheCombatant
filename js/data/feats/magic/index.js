import { MAGIC_FEATS_REGISTRY_PHB } from './phb.js';
import { MAGIC_FEATS_REGISTRY_PHB2 } from './phb2.js';
import { MAGIC_FEATS_REGISTRY_CA } from './ca.js';
import { MAGIC_FEATS_REGISTRY_CS } from './cs.js';

export const MAGIC_FEATS_REGISTRY = {
  ...MAGIC_FEATS_REGISTRY_PHB,
  ...MAGIC_FEATS_REGISTRY_PHB2,
  ...MAGIC_FEATS_REGISTRY_CA,
  ...MAGIC_FEATS_REGISTRY_CS
};

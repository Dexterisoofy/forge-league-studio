import { BIRDS_REPTILES_ICONS } from './birdsReptiles';
import {
  ICON_CATEGORIES,
  type IconCategory,
  type IconColors,
  type IconDefinition,
} from './helpers';
import { MULTI_SPORT_ICONS } from './multiSport';
import { MYTHIC_SCIFI_ICONS } from './mythicScifi';
import { OBJECTS_ELEMENTS_ICONS } from './objectsElements';
import { PREDATORS_MAMMALS_ICONS } from './predatorsMammals';

export type { IconCategory, IconColors, IconDefinition };
export { ICON_CATEGORIES };

/**
 * 136 distinct multi-path vector mascot & sports icons organized across 5 categories.
 */
export const ICONS: IconDefinition[] = [
  ...PREDATORS_MAMMALS_ICONS,
  ...BIRDS_REPTILES_ICONS,
  ...MYTHIC_SCIFI_ICONS,
  ...OBJECTS_ELEMENTS_ICONS,
  ...MULTI_SPORT_ICONS,
];

export function getIconById(id: string): IconDefinition {
  return ICONS.find((i) => i.id === id) ?? ICONS[0];
}

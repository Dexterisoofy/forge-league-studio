import type { LogoConfig } from '../../types';
import { getPaletteById, normalizeHex } from './palettes';

/**
 * Generates a canonical Logo DNA fingerprint string combining all structural
 * layers and color palette identity.
 */
export function computeLogoDna(
  config: Pick<
    LogoConfig,
    'shieldId' | 'patternId' | 'iconId' | 'accentId' | 'bannerId' | 'paletteId' | 'primary' | 'secondary' | 'trim'
  >
): string {
  const preset = getPaletteById(config.paletteId);
  const p = normalizeHex(config.primary);
  const s = normalizeHex(config.secondary);
  const t = normalizeHex(config.trim);

  const isPresetExact =
    preset &&
    normalizeHex(preset.primary) === p &&
    normalizeHex(preset.secondary) === s &&
    normalizeHex(preset.trim) === t;

  const paletteToken = isPresetExact ? preset.id : `CUSTOM:${p}-${s}-${t}`;

  return `SH:${config.shieldId}|PT:${config.patternId}|IC:${config.iconId}|AC:${config.accentId}|BN:${config.bannerId}|PL:${paletteToken}`;
}

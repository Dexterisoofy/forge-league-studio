import type { LogoConfig } from '../../types';
import { getAccentById } from './accents';
import { getBannerById } from './banners';
import { getIconById } from './icons';
import { getContrastColor } from './palettes';
import { getPatternById } from './patterns';
import { getShieldById } from './shields';

let fallbackCounter = 0;

/**
 * Builds a complete, standalone, scalable <svg> string for a team logo.
 * Uses scoped <defs> IDs so multiple crests on one page never collide.
 */
export function buildLogoSvgString(config: LogoConfig, uniqueIdPrefix?: string): string {
  const prefix = (uniqueIdPrefix ?? `fl-${++fallbackCounter}`).replace(/[^a-zA-Z0-9_-]/g, '');
  const shield = getShieldById(config.shieldId);
  const pattern = getPatternById(config.patternId);
  const icon = getIconById(config.iconId);
  const accent = getAccentById(config.accentId);
  const banner = getBannerById(config.bannerId);

  const clipId = `clip-${prefix}`;
  const sheenId = `sheen-${prefix}`;
  const shadowId = `shadow-${prefix}`;

  const contrast = getContrastColor(config.primary);
  const iconFill = contrast === '#ffffff' ? '#f8fafc' : '#1e293b';
  const iconStroke = config.secondary;
  const iconMarkup = icon.render({
    fill: iconFill,
    accent: config.trim,
    stroke: iconStroke,
    contrast,
  });

  const scale = shield.iconScale;
  const iconTranslateX = 100 - 50 * scale;
  const iconTranslateY = shield.centerY - 50 * scale;

  const patternMarkup = pattern.render(config.primary, config.secondary, config.trim);
  const behindAccent = accent.renderBehind(config.trim, config.secondary);
  const frontAccent = accent.renderFront(config.trim, config.secondary, shield.innerPath);
  const bannerMarkup = banner.render(
    config.monogramText,
    config.primary,
    config.secondary,
    config.trim
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="100%" height="100%" role="img" aria-label="Team Crest">
  <defs>
    <clipPath id="${clipId}">
      <path d="${shield.path}" />
    </clipPath>
    <linearGradient id="${sheenId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
      <stop offset="48%" stop-color="#ffffff" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.22" />
    </linearGradient>
    <filter id="${shadowId}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.45" />
    </filter>
  </defs>

  <g>${behindAccent}</g>

  <g clip-path="url(#${clipId})">
    ${patternMarkup}
    <path d="${shield.path}" fill="url(#${sheenId})" />
  </g>

  <path d="${shield.path}" fill="none" stroke="${config.trim}" stroke-width="5.5" stroke-linejoin="round" />
  <path d="${shield.path}" fill="none" stroke="${config.secondary}" stroke-width="1.8" stroke-linejoin="round" />

  ${frontAccent}

  <g transform="translate(${iconTranslateX.toFixed(2)} ${iconTranslateY.toFixed(2)}) scale(${scale})" filter="url(#${shadowId})">
    ${iconMarkup}
  </g>

  <g filter="url(#${shadowId})">
    ${bannerMarkup}
  </g>
</svg>`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadLogoAsSvg(config: LogoConfig, filename: string): void {
  const svgString = buildLogoSvgString(config, 'export-svg');
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(blob, filename.endsWith('.svg') ? filename : `${filename}.svg`);
}

export function downloadLogoAsPng(
  config: LogoConfig,
  filename: string,
  scale = 4
): Promise<void> {
  return new Promise((resolve, reject) => {
    const svgString = buildLogoSvgString(config, 'export-png');
    const width = 200 * scale;
    const height = 220 * scale;
    const svgWithSize = svgString
      .replace('width="100%"', `width="${width}"`)
      .replace('height="100%"', `height="${height}"`);

    const blob = new Blob([svgWithSize], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not initialize canvas 2D context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          reject(new Error('PNG export failed'));
          return;
        }
        triggerDownload(pngBlob, filename.endsWith('.png') ? filename : `${filename}.png`);
        resolve();
      }, 'image/png');
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

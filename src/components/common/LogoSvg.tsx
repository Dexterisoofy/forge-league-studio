import React, { useId, useMemo } from 'react';
import { buildLogoSvgString } from '../../engine/svg-logo/renderLogoSvg';
import type { LogoConfig } from '../../types';

interface LogoSvgProps {
  config: LogoConfig;
  className?: string;
  size?: number;
}

export const LogoSvg: React.FC<LogoSvgProps> = ({ config, className = '', size }) => {
  const reactId = useId();
  const svgMarkup = useMemo(
    () => buildLogoSvgString(config, reactId),
    [config, reactId]
  );

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={size ? { width: size, height: Math.round(size * 1.1) } : undefined}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
};

import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);
export const primaryColor = fullConfig.theme.colors.primary?.DEFAULT || '#161676';
export const foregroundColor = fullConfig.theme.colors.primary?.foreground;

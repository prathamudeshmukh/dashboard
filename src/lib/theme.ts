// Theme configuration for Templify

export const themeColors = {
  primary: '#161676',
  secondary: '#05b7fe',
  navy: '#151d50',
  lightGray: '#eefaff',
  gray: '#f5f5f5',
};

export const fontFamily = {
  sans: 'var(--font-inter-tight)',
};

// Helper function to convert hex to hsl for CSS variables
export function hexToHSL(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, '');

  // Parse the hex values
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255;
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255;
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255;

  // Find the min and max values to compute the lightness
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // Calculate the lightness
  let l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    // Calculate the saturation
    s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);

    // Calculate the hue
    if (max === r) {
      h = ((g - b) / (max - min)) % 6;
    } else if (max === g) {
      h = (b - r) / (max - min) + 2;
    } else {
      h = (r - g) / (max - min) + 4;
    }

    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  // Round the values
  h = Math.round(h);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

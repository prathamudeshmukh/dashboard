/**
 * Generates a secure webhook secret
 * @returns A webhook secret in the format whsec_<hex_string>
 */
export const generateWebhookSecret = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return `whsec_${Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')}`;
};

/**
 * Validates if a URL is valid for webhook configuration
 * @param url - The URL to validate
 * @returns true if the URL is valid (starts with http:// or https://)
 */
export const isValidWebhookUrl = (url: string): boolean => {
  const trimmedUrl = url.trim();
  return trimmedUrl !== '' && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'));
};

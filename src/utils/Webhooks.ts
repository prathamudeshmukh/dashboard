/**
 * Validates if a URL is valid for webhook configuration
 * @param url - The URL to validate
 * @returns true if the URL is valid (starts with http:// or https://)
 */
export const isValidWebhookUrl = (url: string): boolean => {
  const trimmedUrl = url.trim();
  return trimmedUrl !== '' && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'));
};

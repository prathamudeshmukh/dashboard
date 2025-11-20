// libs/utils/generateApiKeys.ts
import CryptoJS from 'crypto-js';

export const generateWebhookSecret = () => {
  return `whsec_${CryptoJS.lib.WordArray.random(32).toString()}`;
};

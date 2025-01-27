import CryptoJS from 'crypto-js';

import { encrypt } from './crypto';

export const generateApiKeys = () => {
  const clientSecret = `cs_${CryptoJS.lib.WordArray.random(32).toString()}`;
  return encrypt(clientSecret);
};

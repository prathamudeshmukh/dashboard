import crypto from 'node:crypto';

import { encrypt } from './crypto';

export const generateApiKeys = () => {
  const clientId = `cid_${crypto.randomBytes(16).toString('hex')}`;
  const clientSecret = `cs_${crypto.randomBytes(32).toString('hex')}`;

  // Encrypt the client secret before storing
  const encryptedSecret = encrypt(clientSecret);

  return { clientId, clientSecret, encryptedSecret };
};

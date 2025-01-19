import crypto from 'node:crypto';

import bcrypt from 'bcrypt';

const generateApiKeys = async () => {
  const clientSecret = `sec_${crypto.randomBytes(32).toString('hex')}`;
  const hashedSecret = await bcrypt.hash(clientSecret, 10);

  return { clientSecret, hashedSecret };
};

export default generateApiKeys;

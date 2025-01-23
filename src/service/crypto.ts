import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes (64 hex characters)
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher with key and iv
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv,
  );

  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return iv + encrypted (iv is needed for decryption)
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  // Split iv and encrypted text
  const [ivHex, encryptedHex] = encryptedText?.split(':');

  // Convert iv back to Buffer
  const iv = Buffer.from(ivHex as string, 'hex');

  // Create decipher
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv,
  );

  // Decrypt the text
  let decrypted = decipher.update(encryptedHex as string, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string; // 32 bytes (64 hex characters)

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY is missing. Check your .env configuration.');
}

export function encrypt(text: string): string {
  if (!text) {
    throw new Error('encrypt(): text is undefined or empty');
  }
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY as string).toString();
  } catch (error) {
    console.error('[Encrypt Error]', error);
    throw new Error('Encryption failed');
  }
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error('decrypt(): encryptedText is undefined or empty');
  }
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY as string);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('[Decrypt Error]', error);
    throw new Error('Decryption failed');
  }
}

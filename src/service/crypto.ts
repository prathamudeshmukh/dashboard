import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes (64 hex characters)

export function encrypt(text: string): string {
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    throw new Error(`Encryption error: ${error}`);
  }
}

export function decrypt(encryptedText: string): string {
  try {
    return CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error(`Decryption error: ${error}`);
  }
}

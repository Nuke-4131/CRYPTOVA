/**
 * Client-side AES-256-GCM encryption.
 *
 * A backend replacement should use KMS/HSM-managed keys and return an
 * authenticated package without exposing password-derived keys to the browser.
 */

export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png'
];

export function sanitizeFileName(fileName = 'file') {
  return fileName.split(/[\\/]/).pop().replace(/[^a-zA-Z0-9._ -]/g, '_').replace(/\.\.+/g, '.').slice(0, 180) || 'file';
}

export function validateFile(file, { packageFile = false } = {}) {
  if (!file) throw new Error('No file selected.');
  if (file.size > MAX_FILE_SIZE) throw new Error('This file is larger than the 100 MB limit.');
  const extensionAllowed = packageFile ? /\.crypt$/i.test(file.name) : /\.(pdf|zip|json|docx|xlsx|txt|jpe?g|png)$/i.test(file.name);
  const typeAllowed = !file.type || ALLOWED_FILE_TYPES.includes(file.type) || packageFile;
  if (!extensionAllowed || !typeAllowed) throw new Error(packageFile ? 'Select a .crypt protected package.' : 'This file type is not supported. Use PDF, DOCX, XLSX, ZIP, JSON, TXT, JPG or PNG.');
  return true;
}

const toBase64 = (bytes) => {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
};

const fromBase64 = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

const deriveKey = async (password, salt) => {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
};

export async function encryptFile(file, password) {
  validateFile(file);
  if (!password) throw new Error('Enter your protection password before encrypting.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, await file.arrayBuffer());
  const packageData = {
    version: 1, algorithm: 'AES-256-GCM', kdf: 'PBKDF2-SHA-256', iterations: 100000,
    salt: toBase64(salt), iv: toBase64(iv), originalName: sanitizeFileName(file.name),
    originalType: file.type || 'application/octet-stream', ciphertext: toBase64(new Uint8Array(ciphertext))
  };
  return {
    ok: true,
    encryptedFileName: `${sanitizeFileName(file.name).replace(/\.[^/.]+$/, '')}.crypt`,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    algorithm: 'AES-256-GCM',
    integrity: 'Authenticated',
    createdAt: new Date().toISOString(),
    blob: new Blob([JSON.stringify(packageData)], { type: 'application/vnd.cryptova.package+json' })
  };
}

export async function readEncryptedPackage(file) {
  validateFile(file, { packageFile: true });
  try {
    return JSON.parse(await file.text());
  } catch {
    throw new Error('The protected package format is invalid.');
  }
}

export async function deriveDecryptionKey(password, packageData) {
  return deriveKey(password, fromBase64(packageData.salt));
}

export { fromBase64, toBase64 };

/**
 * Verifies a client-side package before decryption.
 * A backend replacement should perform format, authentication-tag, and
 * integrity checks server-side and return structured failure reasons.
 */
import { deriveDecryptionKey, fromBase64, readEncryptedPackage, validateFile } from './encryptionService.js';

/** Backend replacement: verify package metadata and authentication server-side, returning structured check results. */
export async function verifyPackage(file, password) {
  try {
    validateFile(file, { packageFile: true });
    const packageData = await readEncryptedPackage(file);
    if (!password) return { ok: false, status: 'AUTHENTICATION_REQUIRED', failedCheck: 'authentication', message: 'Enter the protection password to authenticate this package.' };
    if (packageData.algorithm !== 'AES-256-GCM' || !packageData.salt || !packageData.iv || !packageData.ciphertext) {
      return { ok: false, status: 'FORMAT_FAILED', failedCheck: 'format', message: 'The protected package format is invalid or incomplete.' };
    }
    const key = await deriveDecryptionKey(password, packageData);
    try {
      await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(packageData.iv) }, key, fromBase64(packageData.ciphertext));
    } catch {
      return { ok: false, status: 'AUTHENTICATION_FAILED', failedCheck: 'authentication', message: 'The password is incorrect or the authentication tag is invalid.' };
    }
    return { ok: true, status: 'VERIFIED', checks: { format: true, authentication: true, integrity: true }, packageData, message: 'Format, authentication, and integrity checks passed.' };
  } catch (error) {
    return { ok: false, status: 'FORMAT_FAILED', failedCheck: 'format', message: error.message || 'The protected package format is invalid.' };
  }
}

/** Backend replacement: decrypt through a server/KMS boundary and stream the authorized plaintext. */
export async function decryptFile(file, password, verification) {
  if (!verification?.ok || !verification.checks?.format || !verification.checks?.authentication || !verification.checks?.integrity) {
    throw new Error('Decryption is blocked until format, authentication, and integrity checks pass.');
  }
  const packageData = verification.packageData || await readEncryptedPackage(file);
  const key = await deriveDecryptionKey(password, packageData);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(packageData.iv) }, key, fromBase64(packageData.ciphertext));
  return { ok: true, decryptedFileName: packageData.originalName, fileType: packageData.originalType, blob: new Blob([plaintext], { type: packageData.originalType }) };
}

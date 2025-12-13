export function isFileExpired(uploadedAt: Date, expiryTime: number): boolean {
  const now = new Date();
  const difference = (now.getTime() - uploadedAt.getTime()) / (1000 * 60 * 60);
  return difference > expiryTime;
}

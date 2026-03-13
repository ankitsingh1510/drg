const decryptToken = (token: string | null) => {
  if (!token) return null;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload ? (isTokenValid(payload) ? payload : null) : null;
};

const isTokenValid = (payload: any) => {
  return payload && payload.exp && Date.now() < payload.exp * 1000;
};

export { decryptToken, isTokenValid };

export const formatDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export function calculateCRC32C(bytes: Uint8Array): string {
  const CRC32C_POLYNOMIAL = 0x82f63b78;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ CRC32C_POLYNOMIAL : crc >>> 1;
    }
    table[i] = crc;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  crc = crc ^ 0xffffffff;
  const crcBytes = new Uint8Array([(crc >>> 24) & 0xff, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff]);
  return Array.from(crcBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

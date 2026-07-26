/** Extract complete GT06 frames (7878…0d0a) from a TCP byte stream. */

export function isGt06Buffer(data: Buffer): boolean {
  return data.length >= 2 && data[0] === 0x78 && data[1] === 0x78;
}

export function extractGt06Frames(buffer: Buffer): {
  frames: Buffer[];
  rest: Buffer;
} {
  const frames: Buffer[] = [];
  let offset = 0;

  while (offset + 5 <= buffer.length) {
    if (buffer[offset] !== 0x78 || buffer[offset + 1] !== 0x78) {
      break;
    }

    const payloadLength = buffer[offset + 2];
    const frameLength = payloadLength + 5;

    if (offset + frameLength > buffer.length) {
      break;
    }

    frames.push(buffer.subarray(offset, offset + frameLength));
    offset += frameLength;
  }

  return { frames, rest: buffer.subarray(offset) };
}

export function imeiToString(imei: number | string | null | undefined): string {
  if (imei == null) return '';
  return String(imei);
}

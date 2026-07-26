import { extractGt06Frames, isGt06Buffer } from './gt06-frame.util';
import { Gt06ConnectionHandler } from './gt06.handler';

const loginFrame = Buffer.from('78780d01012345678901234500018cdd0d0a', 'hex');
const locationFrame = Buffer.from(
  '78781f1211071403362aca0543ec4f00ff976e021549010603e6b500e7590074763d0d0a',
  'hex',
);

describe('gt06-frame.util', () => {
  it('detects GT06 binary', () => {
    expect(isGt06Buffer(loginFrame)).toBe(true);
    expect(isGt06Buffer(Buffer.from('{"imei":"1"}'))).toBe(false);
  });

  it('extracts full frames from a stream buffer', () => {
    const combined = Buffer.concat([loginFrame, locationFrame]);
    const { frames, rest } = extractGt06Frames(combined);
    expect(frames).toHaveLength(2);
    expect(rest.length).toBe(0);
  });

  it('buffers incomplete frames', () => {
    const partial = loginFrame.subarray(0, 6);
    const { frames, rest } = extractGt06Frames(partial);
    expect(frames).toHaveLength(0);
    expect(rest.length).toBe(6);
  });
});

describe('Gt06ConnectionHandler', () => {
  it('responds to login and parses location', () => {
    const handler = new Gt06ConnectionHandler();

    const login = handler.handleFrame(loginFrame);
    expect(login.response).toBeDefined();
    expect(login.locations).toHaveLength(0);

    const location = handler.handleFrame(locationFrame);
    expect(location.locations).toHaveLength(1);
    expect(location.locations[0]?.lat).toBeCloseTo(49.076382, 4);
    expect(location.locations[0]?.lng).toBeCloseTo(9.305803, 4);
    expect(location.locations[0]?.imei).toBe('123456789012345');
  });
});

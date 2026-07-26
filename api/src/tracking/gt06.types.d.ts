declare module 'gt06' {
  export type Gt06Event = {
    number: number;
    string: string;
  };

  export type Gt06ParsedMessage = {
    event?: Gt06Event;
    imei?: number;
    lat?: number;
    lon?: number;
    speed?: number;
    course?: number;
    gpsPositioned?: boolean;
    expectsResponse?: boolean;
    responseMsg?: Buffer;
    parseTime?: number;
  };

  export default class Gt06 {
    msgBuffer: Gt06ParsedMessage[];
    imei: number | null;
    expectsResponse: boolean;
    responseMsg: Buffer | undefined;
    parse(data: Buffer): void;
    clearMsgBuffer(): void;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export type OsrmRouteResult = {
  distanceText: string;
  durationText: string;
  durationMinutes: number;
  source: 'osrm';
};

type OsrmRouteResponse = {
  routes?: Array<{ distance: number; duration: number }>;
};

@Injectable()
export class OsrmService {
  constructor(private config: ConfigService) {}

  async getRoute(
    fromLng: number,
    fromLat: number,
    toLng: number,
    toLat: number,
  ): Promise<OsrmRouteResult | null> {
    const baseUrl =
      this.config.get<string>('app.osrmBaseUrl') ??
      'https://router.project-osrm.org';
    const url = `${baseUrl}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;

    try {
      const { data } = await axios.get<OsrmRouteResponse>(url, {
        timeout: 5000,
      });
      const route = data.routes?.[0];
      if (!route) return null;

      const km = route.distance / 1000;
      const minutes = Math.ceil(route.duration / 60);
      return {
        distanceText:
          km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(route.distance)} m`,
        durationText: `${minutes} mins`,
        durationMinutes: minutes,
        source: 'osrm',
      };
    } catch {
      return null;
    }
  }
}

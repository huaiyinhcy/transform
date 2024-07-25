export type Proj = 'merc' | 'wgs84' | 'gcj02' | 'bd09';
export type Lng = number;
export type Lat = number;
export type LngLat = [Lng, Lat];

export interface Opts {
    lng: Lng;
    lat: Lat;
    proj: Proj;
}

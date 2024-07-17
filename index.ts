import * as turf from '@turf/turf';

type Proj = 'merc' | 'wgs84' | 'gcj02' | 'bd09';
type Lng = number;
type Lat = number;
type LngLat = [Lng, Lat];

interface Opts {
    lng: Lng;
    lat: Lat;
    proj: Proj;
}

const PI = Math.PI;
const AXIS = 6378245.0;
const OFFSET = 0.00669342162296594323;
const X_PI = (PI * 3000) / 180;

function outOfChina([lng, lat]: LngLat): boolean {
    if (lng < 72.004 || lng > 137.8347) return true;
    return lat < 0.8293 || lat > 55.8271;
}

function delta([wgLng, wgLat]: LngLat): LngLat {
    let dLat = transformLat(wgLng - 105.0, wgLat - 35.0);
    let dLon = transformLng(wgLng - 105.0, wgLat - 35.0);
    const radLat = (wgLat / 180.0) * PI;
    let magic = Math.sin(radLat);
    magic = 1 - OFFSET * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / (((AXIS * (1 - OFFSET)) / (magic * sqrtMagic)) * PI);
    dLon = (dLon * 180.0) / ((AXIS / sqrtMagic) * Math.cos(radLat) * PI);
    return [dLon, dLat];
}

function transformLat(x: number, y: number) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
    ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
    return ret;
}

function transformLng(x: number, y: number) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
    ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
    return ret;
}

export default class Point {
    lng: Lng;
    lat: Lat;
    proj: Proj;

    merc = {
        toWgs84: (lngLat: LngLat): LngLat =>
            turf.toMercator(turf.point(lngLat)).geometry.coordinates as LngLat,
        toGcj02: (lngLat: LngLat): LngLat => this.wgs84.toGcj02(this.merc.toWgs84(lngLat)),
        toBd09: (lngLat: LngLat): LngLat => this.gcj02.toBd09(this.merc.toGcj02(lngLat))
    };
    wgs84 = {
        toMerc: (lngLat: LngLat): LngLat =>
            turf.toWgs84(turf.point(lngLat)).geometry.coordinates as LngLat,
        toGcj02: ([lng, lat]: LngLat): LngLat => {
            if (!outOfChina([lng, lat])) {
                const [dLng, dLat] = delta([lng, lat]);
                lng += dLng;
                lat += dLat;
            }
            return [lng, lat];
        },
        toBd09: (lngLat: LngLat): LngLat => this.gcj02.toBd09(this.wgs84.toGcj02(lngLat))
    };
    gcj02 = {
        toMerc: (lngLat: LngLat): LngLat => this.wgs84.toMerc(this.gcj02.toWgs84(lngLat)),
        toWgs84: ([lng, lat]: LngLat): LngLat => {
            if (!outOfChina([lng, lat])) {
                const [dLng, dLat] = delta([lng, lat]);
                lng -= dLng;
                lat -= dLat;
            }
            return [lng, lat];
        },
        toBd09: ([lng, lat]: LngLat): LngLat => {
            let x = lng;
            let y = lat;
            const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
            const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
            x = z * Math.cos(theta) + 0.0065;
            y = z * Math.sin(theta) + 0.006;
            return [x, y];
        }
    };
    bd09 = {
        toMerc: (lngLat: LngLat): LngLat => this.wgs84.toMerc(this.bd09.toWgs84(lngLat)),
        toGcj02: ([lng, lat]: LngLat): LngLat => {
            let x = lng - 0.0065;
            let y = lat - 0.006;
            const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
            const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
            x = z * Math.cos(theta);
            y = z * Math.sin(theta);
            return [x, y];
        },
        toWgs84: (lngLat: LngLat): LngLat => this.gcj02.toWgs84(this.bd09.toGcj02(lngLat))
    };

    constructor({ lng, lat, proj }: Opts) {
        this.lng = lng;
        this.lat = lat;
        this.proj = proj;
    }

    toMerc() {
        if (this.proj === 'merc') {
            console.warn('坐标系无变化，返回原对象');
            return this;
        }
        const [lng, lat] = this[this.proj].toMerc([this.lng, this.lat]);
        return new Point({ lng, lat, proj: 'merc' });
    }

    toWgs84() {
        if (this.proj === 'wgs84') {
            console.warn('坐标系无变化，返回原对象');
            return this;
        }
        const [lng, lat] = this[this.proj].toWgs84([this.lng, this.lat]);
        return new Point({ lng, lat, proj: 'wgs84' });
    }

    toGcj02() {
        if (this.proj === 'gcj02') {
            console.warn('坐标系无变化，返回原对象');
            return this;
        }
        const [lng, lat] = this[this.proj].toGcj02([this.lng, this.lat]);
        return new Point({ lng, lat, proj: 'gcj02' });
    }

    toBd09() {
        if (this.proj === 'bd09') {
            console.warn('坐标系无变化，返回原对象');
            return this;
        }
        const [lng, lat] = this[this.proj].toBd09([this.lng, this.lat]);
        return new Point({ lng, lat, proj: 'bd09' });
    }

    getProj(): Proj {
        return this.proj;
    }

    getLngLat(): LngLat {
        return [this.lng, this.lat];
    }

    toString(): string {
        return this.getLngLat().join(',');
    }
}

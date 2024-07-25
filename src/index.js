"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var turf_1 = require("@turf/turf");
var PI = Math.PI;
var AXIS = 6378245.0;
var OFFSET = 0.00669342162296594323;
var X_PI = (PI * 3000) / 180;
function outOfChina(_a) {
    var lng = _a[0], lat = _a[1];
    if (lng < 72.004 || lng > 137.8347)
        return true;
    return lat < 0.8293 || lat > 55.8271;
}
function delta(_a) {
    var wgLng = _a[0], wgLat = _a[1];
    var dLat = transformLat(wgLng - 105.0, wgLat - 35.0);
    var dLon = transformLng(wgLng - 105.0, wgLat - 35.0);
    var radLat = (wgLat / 180.0) * PI;
    var magic = Math.sin(radLat);
    magic = 1 - OFFSET * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / (((AXIS * (1 - OFFSET)) / (magic * sqrtMagic)) * PI);
    dLon = (dLon * 180.0) / ((AXIS / sqrtMagic) * Math.cos(radLat) * PI);
    return [dLon, dLat];
}
function transformLat(x, y) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
    ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
    return ret;
}
function transformLng(x, y) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
    ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
    return ret;
}
var merc = {
    toWgs84: function (lngLat) {
        return (0, turf_1.toWgs84)((0, turf_1.point)(lngLat)).geometry.coordinates;
    }
};
var wgs84 = {
    toMerc: function (lngLat) {
        return (0, turf_1.toMercator)((0, turf_1.point)(lngLat)).geometry.coordinates;
    },
    toGcj02: function (_a) {
        var lng = _a[0], lat = _a[1];
        if (!outOfChina([lng, lat])) {
            var _b = delta([lng, lat]), dLng = _b[0], dLat = _b[1];
            lng += dLng;
            lat += dLat;
        }
        return [lng, lat];
    }
};
var gcj02 = {
    toWgs84: function (_a) {
        var lng = _a[0], lat = _a[1];
        if (!outOfChina([lng, lat])) {
            var _b = delta([lng, lat]), dLng = _b[0], dLat = _b[1];
            lng -= dLng;
            lat -= dLat;
        }
        return [lng, lat];
    },
    toBd09: function (_a) {
        var lng = _a[0], lat = _a[1];
        var x = lng;
        var y = lat;
        var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
        var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
        x = z * Math.cos(theta) + 0.0065;
        y = z * Math.sin(theta) + 0.006;
        return [x, y];
    }
};
var bd09 = {
    toGcj02: function (_a) {
        var lng = _a[0], lat = _a[1];
        var x = lng - 0.0065;
        var y = lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
        x = z * Math.cos(theta);
        y = z * Math.sin(theta);
        return [x, y];
    }
};
merc.toGcj02 = function (lngLat) { return wgs84.toGcj02(merc.toWgs84(lngLat)); };
merc.toBd09 = function (lngLat) { return gcj02.toBd09(merc.toGcj02(lngLat)); };
gcj02.toMerc = function (lngLat) { return wgs84.toMerc(gcj02.toWgs84(lngLat)); };
wgs84.toBd09 = function (lngLat) { return gcj02.toBd09(wgs84.toGcj02(lngLat)); };
bd09.toWgs84 = function (lngLat) { return gcj02.toWgs84(bd09.toGcj02(lngLat)); };
bd09.toMerc = function (lngLat) { return wgs84.toMerc(bd09.toWgs84(lngLat)); };
var transformFun = {
    merc: merc,
    wgs84: wgs84,
    gcj02: gcj02,
    bd09: bd09
};
var Point = /** @class */ (function () {
    function Point(_a) {
        var lng = _a.lng, lat = _a.lat, proj = _a.proj;
        this.lng = lng;
        this.lat = lat;
        this.proj = proj;
    }
    Point.prototype.toMerc = function () {
        if (this.proj === 'merc') {
            console.warn('坐标系无变化，返回原对象');
            return this;
        }
        var _a = transformFun[this.proj].toMerc([this.lng, this.lat]), lng = _a[0], lat = _a[1];
        return new Point({ lng: lng, lat: lat, proj: 'merc' });
    };
    Point.prototype.toWgs84 = function () {
        if (this.proj === 'wgs84') {
            console.warn('坐标系无变化，返回原对象');
            return this;
        }
        var _a = transformFun[this.proj].toWgs84([this.lng, this.lat]), lng = _a[0], lat = _a[1];
        return new Point({ lng: lng, lat: lat, proj: 'wgs84' });
    };
    Point.prototype.toGcj02 = function () {
        if (this.proj === 'gcj02') {
            console.warn('坐标系无变化，返回原对象');
            return this;
        }
        var _a = transformFun[this.proj].toGcj02([this.lng, this.lat]), lng = _a[0], lat = _a[1];
        return new Point({ lng: lng, lat: lat, proj: 'gcj02' });
    };
    Point.prototype.toBd09 = function () {
        if (this.proj === 'bd09') {
            console.warn('坐标系无变化，返回原对象');
            return this;
        }
        var _a = transformFun[this.proj].toBd09([this.lng, this.lat]), lng = _a[0], lat = _a[1];
        return new Point({ lng: lng, lat: lat, proj: 'bd09' });
    };
    Point.prototype.getProj = function () {
        return this.proj;
    };
    Point.prototype.getLngLat = function () {
        return [this.lng, this.lat];
    };
    Point.prototype.toString = function () {
        return this.getLngLat().join(',');
    };
    Point.transform = function (lngLat, from, to) {
        var _a, _b;
        var _to = "to".concat(to[0].toLocaleUpperCase() + to.slice(1));
        try {
            return (_b = (_a = transformFun === null || transformFun === void 0 ? void 0 : transformFun[from]) === null || _a === void 0 ? void 0 : _a[_to]) === null || _b === void 0 ? void 0 : _b.call(_a, lngLat);
        }
        catch (e) {
            throw new Error("\u8BF7\u786E\u8BA4\u53C2\u6570\u662F\u5426\u6B63\u786E lngLat:".concat(lngLat, " from:").concat(from, " to:").concat(to));
        }
    };
    return Point;
}());
exports.default = Point;
console.log(Point.transform([120, 30], 'wgs84', 'merc'));

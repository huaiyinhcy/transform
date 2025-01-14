import { Point, transform } from '../src';

const wgs84 = new Point({ lng: 120, lat: 30, proj: 'wgs84' });
//120,30
console.log(wgs84.toString());

const gcj02 = wgs84.toGcj02();
// 120.00466044559735,29.997534331696095
console.log(gcj02.toString());

const bd09 = gcj02.toBd09();
// 120.011070620552,30.00388305551278
console.log(bd09.toString());

const merc = bd09.toMerc();
// 13358337.546193171,3503547.9663472036
console.log(merc.toString());

// [ 13358338.895192828, 3503549.843504374 ]
console.log(transform([120, 30], 'wgs84', 'merc'));

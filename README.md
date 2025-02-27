### 安装

```bash
npm i @huaiyinhcy/transform
```

### 如何使用

```javascript
import { Point, transform } from './index.ts';

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
```

### 你可以通过坐标拾取网站测试坐标点的偏移误差

-   高德地图坐标拾取

```http request
https://lbs.amap.com/tools/picker
```

-   百度地图坐标拾取

```http request
https://api.map.baidu.com/lbsapi/getpoint/index.html
```

### 仓库

```http request
https://github.com/huaiyinhcy/transform.git
```

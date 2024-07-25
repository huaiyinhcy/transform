### 安装

```bash
npm i @huaiyinhcy/transform
```

### 如何使用

```javascript
import Point from '@huaiyinhcy/transform';

const pointWgs84 = new Point({ lng: 116.397428, lat: 39.90923, proj: 'wgs84' });

const lngLat = pointWgs84.getLngLat();

const proj = pointWgs84.getProj();

const string = pointWgs84.toString();

const pointMerc = pointWgs84.toMerc();

//高德坐标
const pointGcj02 = pointWgs84.toGcj02();

//百度坐标
const pointBd09 = pointWgs84.toBd09();

//也可以直接使用静态方法
Point.transform([116.397428, 39.90923], 'wgs84', 'merc');
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

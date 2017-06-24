# webgis
可以在openlayers上面实现点击出要素,显示地图信息
## 登录功能
## 数据库使用的是postgresql
## session利用express的session，后续可能会使用postgre数据库的相关模块
## 记录用户行为
## ajax请求


一部分用的是原生js，后面因为界面问题，引入了bootstrap，索性就用jquery发送请求了

git clone之后，执行npm install 就可以在本地运行这个程序


## 代码重构
之前有一部分请求还是需要刷新才能看到效果，这一次，通过一些openlayers的api，实现了局部刷新

一部分的后端接口进行合并

将一些读取json数据的请求改为直接从数据库中读取

添加了favicon.icon
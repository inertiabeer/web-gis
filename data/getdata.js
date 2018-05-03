var pg = require('pg');
var Pool = require('pg').Pool;
var fs=require('fs');
var config = {
    host: '47.94.226.150',
    user: 'postgres',
    password: '986619667',
    database: 'gis',
}; //连接池的配置
var pool = new Pool(config) //新建一个连接池
pool.query('SELECT *,(ST_AsGeoJSON(geom)) FROM res2_4m', function (err, result) {
    if (err) {
        console.log(err);
    }
    fs.writeFile('point.json',JSON.stringify(result),function(err){
        if(err)
        {
            console.log("error point");
        }
    })
});
pool.query('SELECT * FROM  user_3', function (err, result) {
    if (err) {
        console.log(err);
    }
    fs.writeFile('action_3.json', JSON.stringify(result), function (err) {
        if (err) {
            console.log("error point");
        }
    })
});
pool.query('SELECT * FROM  public.user', function (err, result) {
    if (err) {
        console.log(err);
    }
    fs.writeFile('users.json', JSON.stringify(result), function (err) {
        if (err) {
            console.log("error point");
        }
    })
});
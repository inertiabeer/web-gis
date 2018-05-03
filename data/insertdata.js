const fs = require('fs');

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'local';
MongoClient.connect(url, function (err, client) {
    var db = client.db(dbName);
    var collection = db.collection('point');
    fs.readFile("point.json", "utf8", function (err, result) {
        if (err) {
            console.log(err);
        }
        let pointarr=[];
        result=JSON.parse(result);
        result.rows.forEach(function (item, index) { //数据库中叫做imgpath

            let point = {
                id: item.res2_4m_,
                name: item.name,
                imgpath: item.imgpath,
                geometry: JSON.parse(item.st_asgeojson)

            }
            pointarr.push(point);
        });
        collection.remove({},false,function(err,result){
            collection.insertMany(pointarr, function (err, result) {
                if (err) {
                    console.log(err);
                }
                console.log("插入点数据");
                collection.find({}).toArray(function (err, docs) {
                    console.log(docs.length);
                });
            })
        })
    });
    fs.readFile("country.json", "utf8", function (err, result) {
        if (err) {
            console.log(err);
        }
        var collection1 = db.collection('country');
        result=JSON.parse(result);
        let temp=JSON.parse(JSON.stringify(result.features));
        console.log(temp.length);
        collection1.remove({}, false, function (err, result) {
            collection1.insertMany(temp, function (err, result) {
                if (err) {
                    console.log(err);
                }
                console.log("插入城市数据");
                collection1.find({}).toArray(function (err, docs) {
                    console.log(docs.length);
                });
            })
        })
    });
});
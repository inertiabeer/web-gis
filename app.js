var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var session = require('express-session');
var formidable = require('formidable');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var moment = require('moment');

var server = require('http').createServer(app);
var pg = require('pg');
var Pool = require('pg').Pool;
var config = {
	host: '47.94.226.150',
	user: 'postgres',
	password: '986619667',
	database: 'gis',
}; //连接池的配置
var pool = new Pool(config) //新建一个连接池
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'local';
MongoClient.connect(url, function (err, client) {

});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser('key'));
app.use(session({
	secret: 'key',
	resave: false,
	saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'img')));
var pointsnum;
var postcode_arr
app.get('/', function (req, res) {

	if (req.session.user) {
		var user = req.session.user;
		var name = user.name;
		res.sendFile(__dirname + '/views/index.html');
	} else {
		res.redirect("/userlog");
	}

});

app.get('/userlog', function (req, res) {
	res.sendFile(__dirname + '/views/login.html');

})
app.post("/country", function (req, res) {
	MongoClient.connect(url, function (err, client) {
		var db = client.db(dbName);
		var collection = db.collection('country');
		collection.find({}).toArray(function (err, result) {
			res.send(JSON.stringify(result));
		});
	});
})
app.post('/geojson', function (req, res) {
	var pointarr = [];
	postcode_arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	MongoClient.connect(url, function (err, client) {
		var db = client.db(dbName);
		var collection = db.collection('point');
		//其实是调用find方法
		//还可以调用find({'a':3}) 找到a=3的记录
		collection.find({}).toArray(function (err, result) {

			if (err) {
				console.log(err);
			}
			res.send(JSON.stringify(result));

		});
	});


});
app.post('/query', function (req, res) {
	var point = req.body.queryPoint;
	var addsql = "INSERT INTO user_" + req.session.user.username + "(action,time) VALUES('queryed " + point + "','" + moment().format('YYYY-MM-DD HH:mm:ss') + "')";
	pool.query(addsql, function (err, result) {
		if (err)
			console.log(err);
	});
	MongoClient.connect(url, function (err, client) {
		var db = client.db(dbName);
		var collection = db.collection('point');
		//其实是调用find方法
		//还可以调用find({'a':3}) 找到a=3的记录
		collection.findOne({
			name: point
		}, function (err, result) {

			if (err) {
				console.log(err);
				res.send('error');
			} else if (result == {}) {
				res.send('n');
			} else {
				console.log(result);
				var data = {
					imgpath: result.imgpath,
					point: result.geometry
				}

				res.send(JSON.stringify(data));
			};

		});
	});

});
app.post('/upload', function (req, res) {
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.uploadDir = "./img";
	form.keepExtensions = true;
	form.parse(req, function (err, fields, files) {
		var point = JSON.parse(fields.point);
		var addsql = "INSERT INTO user_" + req.session.user.username + "(action,time) VALUES('uploaded " + fields.name + "','" + moment().format('YYYY-MM-DD HH:mm:ss') + "')";
		pool.query(addsql, function (err, result) {
			if (err)
				console.log(err);
		})

		if (files.img) {
			var path = JSON.parse(JSON.stringify(files.img)).path;
			var uploadsql = "INSERT INTO res2_4m (imgpath,res2_4m_,name,geom) VALUES ('" + path + "'," + (pointsnum + 1) + ",'" + fields.name + "'," + "st_GeomFromGeoJSON('" + fields.point + "')" + ")";
			console.log(uploadsql);
			pool.query(uploadsql, function (err, result) {
				if (err) {
					console.log(err);
				}
				var img = {
					id: (pointsnum + 1),
					img: path
				}
				res.send(JSON.stringify(img));



			})


		} else {
			var uploadsql = "INSERT INTO res2_4m (res2_4m_,name,geom) VALUES (" + (pointsnum + 1) + ",'" + fields.name + "'," + "st_GeomFromGeoJSON('" + fields.point + "')" + ")";
			console.log(uploadsql);



			pool.query(uploadsql, function (err, result) {
				if (err) {
					console.log(err);
				}
				res.send(JSON.stringify(pointsnum + 1));



			})
		}


	})




});
app.post('/displayname', function (req, res) {
	console.log(req.session.user);
	res.send(req.session.user.username);
});
app.post('/useraction', function (req, res) {
	let sql = "SELECT * FROM  user_" + req.session.user.username;
	pool.query(sql, function (err, result) {
		if (err) {
			console.log(err);
		}
		console.log(result);
		var actions = [];
		result.rows.forEach(function (item, index) {
			actions.push(item);
		})
		console.log(actions);
		res.send(JSON.stringify(actions));
	})
})
app.post('/delete', function (req, res) {
	console.log(req.body);
	var addsql = "INSERT INTO user_" + req.session.user.username + "(action,time) VALUES('deleted" + req.body.deletePoint + "','" + moment().format('YYYY-MM-DD HH:mm:ss') + "')";
	pool.query(addsql, function (err, result) {
		if (err)
			console.log(err);
	})
	var point_id;
	MongoClient.connect(url, function (err, client) {
		var db = client.db(dbName);
		var collection = db.collection('point');
		collection.deleteOne({
			name: req.body.deletePoint
		}, function (err, result) {
			if (err) {
				console.log(err);
			} else {
				res.send(JSON.stringify(result.id));
			}
		})
	});



})

app.post('/login', function (req, res) {
	console.log(req.body);
	var sql = "SELECT userpassword FROM public.user WHERE username='" + req.body.username + "'";
	console.log(sql);
	pool.query(sql, function (err, result) {
		if (err) {
			console.log(err);
		}
		if (result.rows[0] === undefined) {
			res.send('不存在此用户名')
		} else if (result.rows[0].userpassword == req.body.password) {
			var user = {
				username: req.body.username,
				password: req.body.password
			}
			req.session.user = user;
			res.send('y');



		} else {
			res.send('用户名与密码不匹配');
		}


	})

});
app.post('/logout', function (req, res) {
	req.session.destroy(function (err) {
		if (err) {
			console.log(err);
		}
		console.log(1);
	})

	console.log(2);
	res.send('y');
})
app.post('/logup', function (req, res) {
	console.log(req.body);
	var sql = "INSERT INTO public.user (username,userpassword) VALUES ('" + req.body.username + "', '" + req.body.password + "')";
	console.log(sql);
	var user_table = "CREATE TABLE user_" + req.body.username + "(action VARCHAR, time VARCHAR)";
	console.log(user_table);
	pool.query(user_table, function (err, result) {
		if (err) {
			console.log(err);
		}


	});


	pool.query(sql, function (err, result) {
		if (err) {
			console.log(err);
			res.send('error');
		} else {

			console.log(result);
			res.send('成功插入');
		}
	})
});
app.post('/echart', function (req, res) {
	res.send(JSON.stringify(postcode_arr));
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

server.listen(4000, function (err) {
	if (err) {
		console.log(err);
	} else {
		console.log("成功启动");
	}

});
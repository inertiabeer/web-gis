var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var pg = require('pg');
var Pool = require('pg').Pool;
var session=require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var moment=require('moment');

var server = require('http').createServer(app);
var config = {
	host: '47.94.226.150',
	user: 'postgres',
	password: '986619667',
	database: 'gis',
}; //连接池的配置
var pool = new Pool(config) //新建一个连接池

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
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
var pointsnum;

app.get('/', function(req, res) {

	pool.query('SELECT *,(ST_AsGeoJSON(geom)) FROM res2_4m', function(err, result) {
		if (err) {
			console.log(err);
		}

		pointsnum =result.rows[result.rows.length-1].res2_4m_;//这里使得结果的id比前一个加上1
		if(req.session.user)
		{
			var user=req.session.user;
			var name=user.name;
			// res.render('getgeo.jade');
			res.sendFile(__dirname + '/views/ex1.html');
		}
		else
		{
			res.redirect("/userlog");
		}


		
	});
});

app.get('/userlog', function(req, res) {
	res.sendFile(__dirname + '/views/login.html');

})
app.use('/users', users);
app.post('/geojson', function(req, res) {
	let pointarr = [];
	pool.query('SELECT *,(ST_AsGeoJSON(geom)) FROM res2_4m', function(err, result) {
		if (err) {
			console.log(err);
		}
		result.rows.forEach(function(item, index) {
			let point = {
				id: item.res2_4m_,
				name: item.name,
				geometry: JSON.parse(item.st_asgeojson)

			}
			pointarr.push(point);
		})
		res.send(JSON.stringify(pointarr));
	});
});
app.post('/query', function(req, res) {
	console.log(req.body.queryPoint);
	var point = req.body.queryPoint;
	var addsql="INSERT INTO user_"+req.session.user.username+"(action,time) VALUES('queryed "+point+"','"+moment().format('YYYY-MM-DD HH:mm:ss')+"')";
	pool.query(addsql,function(err,result){
		if(err)
			console.log(err);
	})


	console.log(point);
	var querysql="SELECT *,(ST_AsGeoJSON(geom)) from res2_4m where name='"+point+"'";
	pool.query(querysql,function(err,result){
		if(err)
		{	console.log(err);
			res.send('error');
		}
		else if(result.rows[0]==undefined) 
		{
			res.send('n');
		}
		else
		{
			res.send(result.rows[0].st_asgeojson);
		}
			
		



	})
});
app.post('/upload', function(req, res) {
	console.log(req.body);
	var geoPoint = JSON.stringify(req.body.point);
	var addsql="INSERT INTO user_"+req.session.user.username+"(action,time) VALUES('uploaded"+req.body.name+"','"+moment().format('YYYY-MM-DD HH:mm:ss')+"')";
	pool.query(addsql,function(err,result){
		if(err)
			console.log(err);
	})
	// var uploadsql="INSERT INTO res2_4m (res2_4m_,name,geom) VALUES ("+(pointsnum+1)+","+req.body.name+","+"st_transform(st_geomfromtext(POINT "+"("+req.body.point.coordinates[0]+" "+req.body.point.coordinates[1]+")"+",900913),4326)"+")"+")";
	var uploadsql = "INSERT INTO res2_4m (res2_4m_,name,geom) VALUES (" + (pointsnum + 1) + ",'" + req.body.name + "'," + "st_GeomFromGeoJSON('" + geoPoint + "')" + ")";
	console.log(uploadsql);
	pool.query(uploadsql, function(err, result) {
		if (err) {
			console.log(err);
		}
		res.send(JSON.stringify(pointsnum + 1));



	})

});
app.post('/displayname',function(req,res){
	console.log(req.session.user);
	res.send(req.session.user.username);
});
app.post('/useraction',function(req,res){
	let sql="SELECT * FROM  user_"+req.session.user.username;
	pool.query(sql,function(err,result){
		if(err)
		{
			console.log(err);
		}
		console.log(result);
		var actions=[];
		result.rows.forEach(function(item,index){
			actions.push(item);
		})
		console.log(actions);
		res.send(JSON.stringify(actions));
	})
})
app.post('/delete', function(req, res) {
	console.log(req.body);
	var addsql="INSERT INTO user_"+req.session.user.username+"(action,time) VALUES('deleted"+req.body.deletePoint+"','"+moment().format('YYYY-MM-DD HH:mm:ss')+"')";
	pool.query(addsql,function(err,result){
		if(err)
			console.log(err);
	})
	var point_id;
	new Promise(get_ID).then(function(id){
	var deletesql = "DELETE FROM res2_4m WHERE name = '" + req.body.deletePoint + "'";
	console.log(deletesql);
	pool.query(deletesql, function(err, result) {
		if (err) {
			console.log(err);


		}
		console.log(id);
		console.log(point_id);
		res.send(JSON.stringify(id));
	})

	},function(err){
		res.send(err);
	})

	function get_ID(resolve,reject){
	var querysql="SELECT res2_4m_,(ST_AsGeoJSON(geom)) from res2_4m where name='"+req.body.deletePoint+"'";
	pool.query(querysql,function(err,result){
		if(err)
		{	console.log(err);
			reject(err);
		}
		else
		{
			console.log(result.rows[0]);
			if(result.rows[0]==undefined)
			{
				reject('n');
			}
			else{
			point_id=result.rows[0].res2_4m_;
			resolve(point_id);
		}
			
		}


	})
    };

})
// app.post('/delbar', function(req, res) {
// 	let pointarr = [];
// 	pool.query('SELECT *,(ST_AsGeoJSON(geom)) FROM res2_4m', function(err, result) {
// 		if (err) {
// 			console.log(err);
// 		}
// 		result.rows.forEach(function(item, index) {
// 			let point = {
// 				id: item.res2_4m_,
// 				name: item.name
// 			}
// 			pointarr.push(point);
// 		})
// 		res.send(JSON.stringify(pointarr));
// 	});
// });
app.post('/login', function(req, res) {
	console.log(req.body);
	var sql="SELECT userpassword FROM public.user WHERE username='"+req.body.username+"'";
	console.log(sql);
	pool.query(sql,function(err,result){
		if(err)
		{
			console.log(err);
		}
		console.log(result.rows[0].userpassword);
		if(result.rows[0].userpassword==req.body.password)
		{
			var user={
				username:req.body.username,
				password:req.body.password
			}
			req.session.user=user;
			res.send('y');



		}


	})

})
app.post('/logout',function(req,res){
	req.session.destroy(function(err)
	{if(err)
		{console.log(err);}
		console.log(1);
	})

		console.log(2);
		res.send('y');
	})
app.post('/logup', function(req, res) {
	console.log(req.body);
	var sql = "INSERT INTO public.user (username,userpassword) VALUES ('"+req.body.username+"', '"+ req.body.password + "')";
	console.log(sql);
	var user_table="CREATE TABLE user_"+req.body.username+"(action VARCHAR, time VARCHAR)";
	console.log(user_table);
	pool.query(user_table,function(err,result){
			if(err)
			{
				console.log(err);
			}


		});


	pool.query(sql, function(err, result) {
		if (err) {
			console.log(err);
			res.send('error');
		}
		else{

		console.log(result);
		res.send('成功插入');
	}
	})
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

server.listen(4000);

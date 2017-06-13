var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var mongoose=require('mongoose');
// var dbURL='mongodb://localhost:27017/map';
// var db=mongoose.connect(dbURL);
// var model=require('./model.js');

var index = require('./routes/index');
var users = require('./routes/users');
var fs = require('fs');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server); //引入nodejs的socket模块
io.on('connection', function(socket) {
	console.log('连接上');
	socket.on('client', function(content) {
		console.log(content);
		socket.emit('server', content);
		socket.broadcast.emit('server', content);
	})
})

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
app.use(cookieParser());
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'img')))

app.get('/', function(req, res) {

	res.render('index');


});
app.post('/data',function(req,res){
	fs.readFile('./data/all.json','utf8',function(err,data){
		if(err)
		{
			console.log(err);
		}
		var fea_c=JSON.parse(data);
		var features=fea_c.features;
		res.send(JSON.stringify(features));

	})
})
app.get('/map',function(req,res){
	res.sendFile(__dirname+'/wumap.html');
});
app.use('/users', users);
app.use('/post', function(req, res) {
	var thename = req.body.thename;
	
	fs.readFile('./data/all.json', 'utf8', function(err, data) {
		if (err) {
			console.log(err);
		}
		var fea_s = JSON.parse(data);
		var pointList=fea_s.features;
		
		for (var i = 0; i < pointList.length; i++) {
			if (pointList[i].properties.name== thename) {
				
				res.send(JSON.stringify(pointList[i]));
			
			};
		}
		



	});



});
app.post('/count', function(req, res) {
	var chartarr = [0, 0, 0];
	fs.readFile('./data/schools.json', 'utf8', function(err, data) {
		if (err) {
			console.log(err);
		}
		var schoolList = JSON.parse(data);
		function sortName(a,b)
		{
			return b.schoolname - a.schoolname;
		}
		schoolList=schoolList.sort(sortName);
		console.log(schoolList);
		var schoolnames=[];
		for (var i = 0; i < schoolList.length; i++) {
			if(schoolnames.indexOf(schoolList[i].schoolname)>=0)
			{
				continue;

			}
			else
			{
			schoolnames.push(schoolList[i].schoolname);
			var type = schoolList[i].schooltype;
			if (type == 1) {
				chartarr[0]++;

			} else if (type == 2) {
				chartarr[1]++;
			} else if (type == 3) {
				chartarr[2]++;
			}

			}



		}
		res.send(JSON.stringify(chartarr));



	});
})
app.post('/upload', function(req, res) {


	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.uploadDir = __dirname + "/img";
	form.keepExtensions = true;


	form.parse(req, function(err, fields, files) {
		var path = JSON.parse(JSON.stringify(files.img)).path;
		
		
		var props = fields;
		props.path = path;//point.cityname, point.img,point.pinyin,point.describe,point.latlog


		// var newdata=new model(
		// {
  //   schoolname:school.schoolname,
  //   schooltype:school.schooltype,
  //   spot:school.spot,
  //   describe:school.describe,
  //   latlog:school.latlog,
  //   path:school.path

		// })
		// newdata.save(function(err, data) {
		// 				if (err)
		// 					console.log(err);
		// 				else {
		// 					console.log('success');


		// 				}
		// 			})
		
		fs.readFile('./data/all.json', 'utf8', function(err, data) {
			if (err) {
				console.log(err);
			}
			var featureC = JSON.parse(data);
			var citylist=featureC.features;
			var corrArr=props.latlog.split(',');
			var point={
			type:"Feature",
			id:"points."+parseInt(citylist.length+1),
			geometry:{
				type:"Point",
				coordinates:[parseFloat(corrArr[0]),parseFloat(corrArr[1])],

			},
			geometry_name:'geom',
			properties:{
				area:0,
				perimeter:0,
				res2_4m_:parseInt(citylist.length)+1,
				pinyin:props.pinyin,
				name:props.cityname,
				img:props.path,
				describe:props.describe


			}
			
		};
			citylist.push(point);
			fs.writeFile('./data/all.json', JSON.stringify(featureC), 'utf-8', function(err, data) {
				if (err) {
					console.log(err);
				}
				console.log("success");
				res.redirect('/');
			})



		});


		// fs.appendFile('./data/schools.json', JSON.stringify(school), 'utf-8', function() {
		// 	console.log("success");
		// 	res.redirect('/');
		// })



	});


})
app.get('/upload', function(req, res) {
	res.redirect('/');
})

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

server.listen(3000);

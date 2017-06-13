/**
 * Created by mac01 on 17/3/17.
 */

var windowsArr = [];
var marker = [];
var map;
var centerPoint = {};


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        document.write("Geolocation is not supported by this browser.");
    }


}

function showPosition(position) {
    centerPoint.lat = position.coords.latitude;
    centerPoint.lon = position.coords.longitude;
    AMap.convertFrom([centerPoint.lon, centerPoint.lat], "gps", function(status, result) {
        console.log("result=" + result.locations);
        var rst = result.locations.toString();
        var arr = rst.split(',');


        map.setCenter([arr[0], arr[1]]);

    });

    console.log(centerPoint);
}
getLocation();

map = new AMap.Map("mapContainer", {
    resizeEnable: true,
    center: [114.3554655, 30.53066300], //地图中心点
    zoom: 18, //地图显示的缩放级别
    keyboardEnable: false
});

AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], function() {
    map.addControl(new AMap.ToolBar());
    map.addControl(new AMap.Scale());



});
//ui实例
AMap.plugin('AMap.Geolocation', function() {
    geolocation = new AMap.Geolocation({
        enableHighAccuracy: true, //是否使用高精度定位，默认:true
        timeout: 10000, //超过10秒后停止定位，默认：无穷大
        maximumAge: 0, //定位结果缓存0毫秒，默认：0
        convert: true, //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
        showButton: true, //显示定位按钮，默认：true
        buttonPosition: 'LB', //定位按钮停靠位置，默认：'LB'，左下角
        buttonOffset: new AMap.Pixel(10, 20), //定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        showMarker: true, //定位成功后在定位到的位置显示点标记，默认：true
        showCircle: true, //定位成功后用圆圈表示定位精度范围，默认：true
        panToLocation: true, //定位成功后将定位到的位置作为地图中心点，默认：true
        zoomToAccuracy: true //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
    });


    map.addControl(geolocation);
    AMap.event.addListener(geolocation, 'complete', function(result) {

    }); //返回定位信息
    AMap.event.addListener(geolocation, 'error', onError);
});

if (map != 'undefined') {
    getLocation();
}

function upload() {
    var overlay = document.getElementById('overlay');
    overlay.classList.add('md-overlay');
    var uploadForm = document.querySelector('#uploadForm');
    uploadForm.classList.add('uploadForm');
    var submit = document.getElementById('submit');
    submit.addEventListener('click', function() {
        overlay.classList.remove('md-overlay');
        uploadForm.classList.remove('uploadForm');

    });
    var latlog = document.getElementById('latlog');
    latlog.value = map.getCenter();



};

function selector() {
    var overlay = document.getElementById('overlay');
    overlay.classList.add('md-overlay');
    var selector = document.getElementById('selector');
    selector.classList.add('uploadForm');



};

function dis_chart() {
    var overlay = document.getElementById('overlay');
    overlay.classList.add('md-overlay');
    var warper = document.getElementById('warper');
    warper.classList.add('uploadForm','chart_w');
    var chart = document.getElementById('chart');
    chart.classList.add('chart');
    chart.style.display = "block";
    if (window.XMLHttpRequest) {
        xmlhttp1 = new XMLHttpRequest();
    }
    xmlhttp1.onreadystatechange = function() {
        if (xmlhttp1.readyState == 4 && xmlhttp1.status == 200) {
            var data = xmlhttp1.responseText;
            var arr = JSON.parse(data);
            console.log(arr);
            var myChart = echarts.init(document.getElementById('chart'));

            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: '高校类型分布'
                },
                tooltip: {},
                legend: {
                    data: ['数量']
                },
                xAxis: {
                    data: ["综合性", "理工类", "文科类"]
                },
                yAxis: {},
                series: [{
                    name: '学校类型',
                    type: 'bar',
                    data: arr,
                }]
            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);


        }

    }
    xmlhttp1.open('POST', '/count', true);
    xmlhttp1.send();
}

function getschool() {
    var schoolname = document.getElementById('schoolname').value;
    if (schoolname == '') {
        alert('不能为空，请重新输入')
    }

    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    }
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var data = xmlhttp.responseText;
            var point = JSON.parse(data);


        

            let arr = point.geometry.coordinates;
            
            // var i=0;
            // // let markername='marker'+i;
            // // let infoname='infoWindow'+i;
            // // let openFun='openInfoWin'+i;



            map.setCenter([arr[0], arr[1]]);
            // i++;
            AMapUI.loadUI(['overlay/SimpleInfoWindow'], function(SimpleInfoWindow) {
                 var marker = new AMap.Marker({
                    map: map,
                    zIndex: 9999999,
                    position: [arr[0], arr[1]]
                });
                 if(point.properties.img)
                 {
                    let imgsrc = point.properties.img.split('/img/')[1];
                    var infowindow = new SimpleInfoWindow({

                    infoTitle: '<strong>' + point.properties.name + '</strong>',
                    infoBody: '<img src=http://localhost:3000/img/' + imgsrc + '><p class="my-desc"><strong>' + point.properties.describe + '</strong> </p>',

                    //基点指向marker的头部位置
                    offset: new AMap.Pixel(0, -31)
                });

                 }
                 else
                 {
                    var infowindow = new SimpleInfoWindow({

                    infoTitle: '<strong>' + point.properties.name + '</strong>',
                    infoBody: '<p class="my-desc"><strong>' + point.properties.describe + '</strong> </p>',

                    //基点指向marker的头部位置
                    offset: new AMap.Pixel(0, -31)
                })

                 }


                map.setZoom(13);


             function open(){
                    infowindow.open(map, marker.getPosition());

                }
                open();
                //marker 点击时打开
                AMap.event.addListener(marker, 'click', function() {
                    open();
                });
            })

            


        }
    }
    xmlhttp.open('POST', '/post', true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("thename=" + schoolname);
    var selector = document.getElementById('selector');
    selector.classList.toggle('uploadForm');
    var overlay = document.getElementById('overlay');
    overlay.classList.toggle('md-overlay');

}

function cancel(event) {
    console.log(event.target);
    event.target.parentNode.classList.remove('uploadForm','chart_w');
    var overlay = document.getElementById('overlay');
    overlay.classList.remove('md-overlay');
    var chart = document.getElementById('chart');
    chart.style.display = "none";

}
var getdata=new XMLHttpRequest;
getdata.onreadystatechange=function(){
    if(getdata.readyState==4&&getdata.status==200)
    {
        var data=getdata.responseText;
        var features=JSON.parse(data);
            for(let obj of features)
            {
            let arr = obj.geometry.coordinates;
            // let imgsrc = obj.path.split('/img/')[1];
 




            // map.setCenter([arr[0], arr[1]]);
           
            AMapUI.loadUI(['overlay/SimpleInfoWindow'], function(SimpleInfoWindow) {
                 var marker = new AMap.Marker({
                    map: map,
                    zIndex: 9999999,
                    position: [arr[0], arr[1]]
                });
                 if(obj.properties.img)
                 {
                    let imgsrc = obj.properties.img.split('/img/')[1];

                var infowindow = new SimpleInfoWindow({

                    infoTitle: '<strong>' + obj.properties.name + '</strong>',
                    infoBody: '<img src=http://localhost:3000/img/' + imgsrc + '><p class="my-desc"><strong>' + obj.properties.describe + '</strong> </p>',

                    //基点指向marker的头部位置
                    offset: new AMap.Pixel(0, -31)
                });
                 }
                 else
                 {
                var infowindow = new SimpleInfoWindow({

                    infoTitle: '<strong>' + obj.properties.name + '</strong>',
                    infoBody: '<p class="my-desc"><strong>' + obj.properties.describe + '</strong> </p>',

                    //基点指向marker的头部位置
                    offset: new AMap.Pixel(0, -31)
                });
                 }



             function open(){
                    infowindow.open(map, marker.getPosition());
                }
                open();
                //marker 点击时打开
                AMap.event.addListener(marker, 'click', function() {
                    open();
                });
            })

            }




    }
}
getdata.open('POST','/data',true);
getdata.send();

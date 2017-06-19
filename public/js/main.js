      var raster = new ol.layer.Tile({
            source: new ol.source.OSM()
      });
      var vector = new ol.layer.Vector({
            source: new ol.source.Vector({
                  url: '2.json',
                  format: new ol.format.GeoJSON(),
                  wrapX: false
            })
      });


      var container = document.getElementById('popup');
      var content = document.getElementById('popup-content');
      var closer = document.getElementById('popup-closer');
      var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }
      }));
      closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
      };//添加一个遮罩层


      var map = new ol.Map({
            layers: [raster, vector],
            overlays:[overlay],
            target: 'map',
            view: new ol.View({
                  center: [117.117942810059, 29.1951675415039],
                  projection: "EPSG:4326",
                  zoom: 4
            })
      });
      map.on('singleclick', function(evt) {
        var coordinate = evt.coordinate;
        var pixel = map.getEventPixel(evt.originalEvent);
        var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
                return feature;
            });//判断当前单击处是否有要素，捕获到要素时弹出popup
        if (feature !== undefined) 
        {
            console.log(feature);
        }
        var hdms = ol.coordinate.toStringHDMS(
            coordinate);


        content.innerHTML = '<div style="background-color: white"><p>You clicked here:</p><code>' + hdms +
            '</code><p>城市名称：'+feature.O.name+'  ID:'+feature.O.res2_4m_+'</p></div>';
        overlay.setPosition(coordinate);
      });



      /**
       * Handle change event.
       */
      document.getElementById('upload').onclick = function() //上传函数
            {
                  var moka = map.getView().getCenter();

                  var data = {};
                  data.name = document.getElementById('name').value;
                  if (data.name == '') {
                        alert('不能为空，请重新输入')
                  }
                  data.point = {
                        type: 'Point',
                        coordinates: moka
                  }
                  var xmlhttp = new XMLHttpRequest;
                  xmlhttp.onreadystatechange = function() {
                        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                              console.log('上传成功')
                        }
                  }
                  xmlhttp.open('POST', '/upload', true);
                  xmlhttp.setRequestHeader("Content-type", "application/json");
                  xmlhttp.send(JSON.stringify(data));
            }

      function m_delete() { //删除函数
            console.log('hello');
            var xmlhttp2 = new XMLHttpRequest;
            var del_point = document.getElementById('delete').value;
            if (del_point == '') {
                  alert('不能为空，请重新输入')
            }
            console.log(del_point);
            xmlhttp2.onreadystatechange = function() {
                  if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
                        console.log('成功');

                  }


            }
            xmlhttp2.open('POST', '/delete', true);
            xmlhttp2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp2.send("deletePoint=" + del_point);
      };

      function m_query() { //查询函数
            var xmlhttp3 = new XMLHttpRequest;
            var queryPoint = document.getElementById('query').value;
            if (queryPoint == '') {
                  alert('不能为空，请重新输入')
            }
            xmlhttp3.onreadystatechange = function() {
                  if (xmlhttp3.readyState == 4 && xmlhttp3.status == 200) {
                        var data = xmlhttp3.responseText;
                        var point = JSON.parse(data);
                        console.log(point.properties.PINYIN);
                        var point_c = point.geometry.coordinates;
                        map.getView().setZoom(11);
                        map.getView().setCenter(point_c);
                        console.log(point);
                  }
            }
            xmlhttp3.open('POST', '/query', true);
            xmlhttp3.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp3.send("queryPoint=" + queryPoint);
      };





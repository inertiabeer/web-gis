      var raster = new ol.layer.Tile({
        source: new ol.source.OSM()
      });


      var container = document.getElementById('popup');
      var content = document.getElementById('popup-content');
      var closer = document.getElementById('popup-closer');
      var overlay = new ol.Overlay( /** @type {olx.OverlayOptions} */ ({
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
      }; //添加一个遮罩层


      var map = new ol.Map({
        layers: [raster],
        overlays: [overlay],
        target: 'map',
        view: new ol.View({
          center: [117.117942810059, 29.1951675415039],
          projection: "EPSG:4326",
          zoom: 4
        })
      });
      map.addControl(new ol.control.OverviewMap());
      map.addControl(new ol.control.FullScreen());
      map.addControl(new ol.control.Rotate());
      map.on('singleclick', function(evt) {
        var coordinate = evt.coordinate;
        var pixel = map.getEventPixel(evt.originalEvent);
        var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
          return feature;
        }); //判断当前单击处是否有要素，捕获到要素时弹出popup
        var hdms = ol.coordinate.toStringHDMS(coordinate);
        if (feature !== undefined) {
          console.log(feature);
          content.innerHTML = '<div style="background-color: white"><p>You clicked here:</p><code>' + hdms +
            '</code><p>城市名称：' + feature.O.name + '  ID:' + feature.a + '</p></div>';

        } else {
          content.innerHTML = '<div style="background-color: white"><p>You clicked here:</p><code>' + hdms +
            '</code></div>';

        }



        overlay.setPosition(coordinate);
      });



      document.getElementById('upload').onclick = function() //上传函数
        {
          var moka = map.getView().getCenter();

          var data = {};
          data.name = document.getElementById('name').value;
          if (data.name == '') {
            alert('不能为空，请重新输入')
          } else {
            data.point = {
              type: 'Point',
              coordinates: moka
            }
            var xmlhttp = new XMLHttpRequest;
            xmlhttp.onreadystatechange = function() {
              if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                console.log('上传成功');
                var id=xmlhttp.responseText;
                var feature=new ol.Feature({
                  geometry:new ol.geom.Point(moka),
                  name:data.name
                })
                feature.a=id;
                vec_source.addFeature(feature);
                var hdms = ol.coordinate.toStringHDMS(moka);
          content.innerHTML = '<div style="background-color: white"><p>You uploaded here:</p><code>' + hdms +
            '</code><p>城市名称：' + feature.O.name + '  ID:' + feature.a + '</p></div>';
                 overlay.setPosition(moka);

                 delbar();



              }
            }
            xmlhttp.open('POST', '/upload', true);
            xmlhttp.setRequestHeader("Content-type", "application/json");
            xmlhttp.send(JSON.stringify(data));
          }
        }

      function m_delete() { //删除函数
        console.log('hello');
        var xmlhttp2 = new XMLHttpRequest;
        var del_point = document.getElementById('delete').value;
        if (del_point == '') {
          alert('不能为空，请重新输入')
        } else {
          console.log(del_point);
          xmlhttp2.onreadystatechange = function() {
            if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
                  console.log('成功');
              var result=xmlhttp2.responseText;
              if(result=='n')
              {
                alert('没有这座城市');
              }
              else{
              vec_source.removeFeature(vec_source.getFeatureById(result));
               delbar();
             }


            }


          }
          xmlhttp2.open('POST', '/delete', true);
          xmlhttp2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xmlhttp2.send("deletePoint=" + del_point);
        }
      };

      function m_query() { //查询函数
        var xmlhttp3 = new XMLHttpRequest;
        var queryPoint = document.getElementById('query').value;
        if (queryPoint == '') {
          alert('不能为空，请重新输入')
        } else {
          xmlhttp3.onreadystatechange = function() {
            if (xmlhttp3.readyState == 4 && xmlhttp3.status == 200) {
              var data = xmlhttp3.responseText;
              if(data=='n')
              {
                alert('找不到这座城市')
              }
              else
              {
              console.log(data);
              var point = JSON.parse(data);
              var point_c = point.coordinates;
              map.getView().setZoom(11);
              map.getView().setCenter(point_c);
                var hdms = ol.coordinate.toStringHDMS(point_c);
                content.innerHTML='<div style="background-color: white"><p>你刚才查询了 城市名称：'+queryPoint+'</p><code>' + hdms +
                 '</code></div>';
                 overlay.setPosition(point_c);

              console.log(point);
              }
            }
          }
          xmlhttp3.open('POST', '/query', true);
          xmlhttp3.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xmlhttp3.send("queryPoint=" + queryPoint);
        }
      };
      document.getElementById('map').onmousemove = function() {
        document.getElementById('point').value = map.getView().getCenter();
      }
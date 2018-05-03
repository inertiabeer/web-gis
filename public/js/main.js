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
      closer.onclick = function () {
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
      map.addControl(new ol.control.OverviewMap({
        view: new ol.View({
          center: [117.117942810059, 29.1951675415039],
          projection: "EPSG:4326"
        })
      }));
      map.addControl(new ol.control.FullScreen());
      map.addControl(new ol.control.Rotate());
      map.on('singleclick', function (evt) {
        var coordinate = evt.coordinate;
        var pixel = map.getEventPixel(evt.originalEvent);
        var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
          return feature;
        }); //判断当前单击处是否有要素，捕获到要素时弹出popup
        var hdms = ol.coordinate.toStringHDMS(coordinate);
        if (feature !== undefined) {
          console.log(feature);
          if (feature.path) {
            content.innerHTML = '<div class="img" style="background-color: white"><p>You uploaded here:</p><code>' + hdms +
              '</code><p>城市名称：' + feature.O.name + '  ID:' + feature.a + '</p><img src=./' + feature.path + '></div>';

          } else {
            content.innerHTML = '<div style="background-color: white"><p>You clicked here:</p><code>' + hdms +
              '</code><p>城市名称：' + feature.O.name + '  ID:' + feature.a + '</p></div>';
          }

        } else {
          content.innerHTML = '<div style="background-color: white"><p>You clicked here:</p><code>' + hdms +
            '</code></div>';

        }



        overlay.setPosition(coordinate);
      });

      //发一个ajax请求，渲染面要素
      var vector;
      var vec_source = new ol.source.Vector();
      $.ajax({
        url: "/country",
        type: "POST",
        success: function (result) {
          var temp = {
            "type": "FeatureCollection",
            "features": []
          };
          temp.features = JSON.parse(result);
          var json_vector = new ol.layer.Vector({
            source: new ol.source.Vector({
              features: new ol.format.GeoJSON().readFeatures(temp)
            })
          });
          map.addLayer(json_vector);

          $.post('/geojson', function (data, status) {
            var arr = JSON.parse(data);
            arr.forEach(function (item, index) {
              if (item.imgpath) {
                var feature = new ol.Feature({
                  geometry: new ol.geom.Point(item.geometry.coordinates),
                  name: item.name,
                  id: item.id,
                  imgpath: item.imgpath
                });
                feature.path = item.imgpath.split('/')[1];

              } else {
                var feature = new ol.Feature({
                  geometry: new ol.geom.Point(item.geometry.coordinates),
                  name: item.name,
                  id: item.id
                });

              }


              feature.a = item.id;

              vec_source.addFeature(feature);



            })
            vector = new ol.layer.Vector({
              source: vec_source,

            });
            map.addLayer(vector);

          })

        }
      })






      document.getElementById('upload').onclick = function () //上传函数
      {
        var moka = map.getView().getCenter();


        var name = document.getElementById('name').value;
        if (name == '') {
          alert('不能为空，请重新输入')
        } else {
          var point = {
            type: 'Point',
            coordinates: moka
          }

          var data = new FormData();
          data.append('point', JSON.stringify(point));
          data.append('img', document.getElementById('img').files[0]);
          data.append('name', name);

          var xmlhttp = new XMLHttpRequest;
          xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
              console.log('上传成功');





              var id = JSON.parse(xmlhttp.responseText);
              var feature = new ol.Feature({
                geometry: new ol.geom.Point(moka),
                name: name
              })
              var hdms = ol.coordinate.toStringHDMS(moka); //这里是对经纬度进行转换

              if (id.img) //这里进行判断如果有img属性就是可以加图片
              {
                feature.a = id.id;



                var path = id.img;
                path = path.split('/')[1];
                console.log(path);
                feature.path = path;
                content.innerHTML = '<div class="img" style="background-color: white"><p>You uploaded here:</p><code>' + hdms +
                  '</code><p>城市名称：' + feature.O.name + '  ID:' + feature.a + '</p><img src=./' + path + '></div>';



              } else {
                feature.a = id;
                content.innerHTML = '<div style="background-color: white"><p>You uploaded here:</p><code>' + hdms +
                  '</code><p>城市名称：' + feature.O.name + '  ID:' + feature.a + '</p></div>';


              }
              vec_source.addFeature(feature);


              overlay.setPosition(moka);

              delbar();



            }
          }
          xmlhttp.open('POST', '/upload', true);
          // xmlhttp.setRequestHeader("Content-type", "multipart/form-data");
          xmlhttp.send(data);
        }
      }

      function m_delete() { //删除函数
        var xmlhttp2 = new XMLHttpRequest;
        var del_point = document.getElementById('delete').value;
        if (del_point == '') {
          alert('不能为空，请重新输入')
        } else {
          console.log(del_point);
          xmlhttp2.onreadystatechange = function () {
            if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
              console.log('成功');
              var result = xmlhttp2.responseText;
              if (result == 'n') {
                alert('没有这座城市');
              } else {
                vec_source.removeFeature(vec_source.getFeatureById(result));
                delbar();
              }
              document.getElementById('delete').value="";


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
          xmlhttp3.onreadystatechange = function () {
            if (xmlhttp3.readyState == 4 && xmlhttp3.status == 200) {
              var data = xmlhttp3.responseText;
              if (data == 'n') {
                alert('找不到这座城市')
              } else {
                console.log(data);
                var city = JSON.parse(data);
                console.log(city);
                var point = city.point;
                var point_c = point.coordinates;

                // map.getView().setZoom(11);
                map.getView().setCenter(point_c);
                var hdms = ol.coordinate.toStringHDMS(point_c);
                if (city.imgpath) {
                  var path = city.imgpath.split('/')[1];

                  content.innerHTML = '<div class="img" style="background-color: white"><p>You queryed :</p><code>' + hdms +
                    '</code><p>城市名称：' + queryPoint + '</p><img src=./' + path + '></div>';

                } else {
                  content.innerHTML = '<div style="background-color: white"><p>你刚才查询了 城市名称：' + queryPoint + '</p><code>' + hdms +
                    '</code></div>';
                }
                overlay.setPosition(point_c);

                document.getElementById('query').value="";
              }
            }
          }
          xmlhttp3.open('POST', '/query', true);
          xmlhttp3.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xmlhttp3.send("queryPoint=" + queryPoint);
        }
      };
      document.getElementById('map').onmousemove = function () {
        document.getElementById('point').value = map.getView().getCenter();
      }
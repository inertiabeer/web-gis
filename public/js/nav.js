$(".dropdown-toggle").click(function(){
	$.post('/useraction',function(data,status){
		var actions=JSON.parse(data);
		 $('.dropdown-menu').empty();
		actions.forEach(function(item,index){
			let li='<li><a href="#">you '+item.action+' in '+item.time+'</a></li>';

			$('.dropdown-menu').append(li);
		})
		

	})
});
$(".logout").click(function(){
	$.post('/logout',function(data,status){
		if('y'===data)
		{
			history.go(0);
		}

	})
})
$.post('/displayname',function(data,status){
	$('#display_name').find('a').html("<span class='glyphicon glyphicon-user' aria-hidden='true'></span>&nbspWelcome "+data);
})


var vec_source=new ol.source.Vector();
      $.post('/geojson',function(data,status){
        let arr=JSON.parse(data);
        arr.forEach(function(item,index){
        	if(item.imgpath)
        	{
        		var feature=new ol.Feature({
            geometry:new ol.geom.Point(item.geometry.coordinates),
            name:item.name,
            id:item.id,
            imgpath:item.imgpath
            });
        	feature.path=item.imgpath.split('/')[1];

        	}
        	else{
        	var feature=new ol.Feature({
            geometry:new ol.geom.Point(item.geometry.coordinates),
            name:item.name,
            id:item.id
            });

        	}


          feature.a=item.id;

          vec_source.addFeature(feature);
         


        })
      var vector = new ol.layer.Vector({
        source:vec_source
      });
      map.addLayer(vector);

      })


var mapbox=document.getElementById('map');
mapbox.ondragenter = ignoreDrag;
mapbox.ondragover = ignoreDrag;
mapbox.ondrop = drop;
function ignoreDrag(e) {

      e.stopPropagation();
      e.preventDefault();
}
function drop(e)
{
	e.stopPropagation();
	e.preventDefault();
	var data=e.dataTransfer;
	var files=data.files;
	handle(files);
}

function handle(files)
{
	console.log(files);
	var jsonfile=files[0];
	if(jsonfile.name.indexOf('json')>=0)
	{
		console.log('是json文件')
	}
	var reader=new FileReader();
	reader.readAsText(jsonfile,'utf-8');
	reader.onload=function()
	{
	 var json=this.result;
	 console.log('上传');
	 var json_vector = new ol.layer.Vector({
        source: new ol.source.Vector({
        	features:new ol.format.GeoJSON().readFeatures(json)
        })
      });
	 map.addLayer(json_vector);

	}


}
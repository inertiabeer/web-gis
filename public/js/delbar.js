
function delbar(){
var xmlhttp4=new XMLHttpRequest;
xmlhttp4.onreadystatechange=function()
{
	if(xmlhttp4.readyState==4&&xmlhttp4.status==200)
	{
		var pointarr=JSON.parse(xmlhttp4.responseText);
		console.log(pointarr.length);
        $('#table').empty();
		pointarr.forEach(function(item,index){    
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        var td2 = document.createElement("td");
        var td3 = document.createElement("td");
        tr.onmouseover=function(){this.style.color='#FF4A08';};
        tr.onmouseout=function(){this.style.color='#fff';};
        td1.innerHTML=item.id;
        td2.innerHTML=item.name;
        td3.innerHTML="<a href='javascript:;'  onclick='de(this)'>删除</a>";
        var tab=document.getElementById("table");
        tab.appendChild(tr);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        
        
		})
	}
}

xmlhttp4.open('POST','/geojson',true);
xmlhttp4.send();
}
delbar();
var deletePointArr=[];
function de(obj)
{
	     var tr=obj.parentNode.parentNode;
	     var point_id=tr.firstElementChild.innerHTML;
	     var point_name=tr.firstElementChild.nextElementSibling.innerHTML;
	     console.log(point_name);
	     deletePointArr.push(point_id);
                      vec_source.removeFeature(vec_source.getFeatureById(point_id));
         tr.parentNode.removeChild(tr);
         console.log(deletePointArr);
         var xmlhttp2=new XMLHttpRequest;
            xmlhttp2.open('POST', '/delete', true);
            xmlhttp2.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp2.send("deletePoint=" + point_name);


}
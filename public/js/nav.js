$(".dropdown-toggle").click(function(){
	$.post('/useraction',function(data,status){
		var actions=JSON.parse(data);
		 $('.dropdown-menu').empty();
		actions.forEach(function(item,index){
			var li='<li><a href="#">you '+item.action+' in '+item.time+'</a></li>';

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
	$('#display_name').find('a').html("<span aria-hidden='true'></span><i class='icon'>&#xe975;</i>&nbsp;&nbsp;"+data);
})
var leftflag=true;
var rightflag=true;
function up()
{
  $('#navigate').hide(1000,function(){
map.updateSize();

  });
}
function down()
{
    $('#navigate').show(1000,function(){
map.updateSize();

  });
}
function re_width()
{//解决浮点型运算的错误
  var width=document.getElementById('map').style.width;
        var rewidth=width.toString().substr(0,4);
        document.getElementById('map').style.width=Math.round(rewidth)+'%';

}
function left()
{
  if(leftflag)
  {leftflag=false;
//这里出现了浮点型运算错误
    $('#sidebar').hide(1000,function(){
      $('#map').animate({width:'+=20%',height:'+=120px'},100,function(){
       
        re_width();
        map.updateSize();

      })
    });


  }
  else
  {leftflag=true;

    
      $('#map').animate({width:'-=20%',height:'-=120px'},100,function(){

        $('#sidebar').show(1000,function(){
            re_width();
            map.updateSize();
        });
      });
   
  }

}
function right()
{

   if(rightflag)
  {rightflag=false;
    
    
        
        $('#delbar').hide(1000,function(){
            $('#map').animate({width:'+=20%',height:'+=120px'},100,function(){
           re_width();
           map.updateSize();

            });
        });
    
    


  }
  else
  {rightflag=true;

    
      $('#map').animate({width:'-=20%',height:'-=120px'},100,function(){
        $('#delbar').show(1000,function(){
        re_width();
         map.updateSize();
        });

      })
    
  }
}
var x_distance,y_distance;
function drag(event)
{
    $('.board').css('visibility',"hidden");
    if(x_distance===undefined&&y_distance===undefined)
    {
        x_distance= event.pageX-document.getElementsByClassName("board")[0].offsetLeft;

        y_distance=event.pageY-document.getElementsByClassName("board")[0].offsetTop;

    }


  if(event.pageY!==0&&event.pageX!==0){
      $('.board').css('top',event.pageY-y_distance);
      $('.board').css('left',event.pageX-x_distance);
  }
 //这是控制台的拖动程序



}
var dragFlag=false;
function mousedown(event)
{

    console.log(event.pageX);
    dragFlag=true;
    var board=document.getElementsByClassName("board")[0];
    x_distance= event.pageX-board.offsetLeft;

    y_distance=event.pageY-board.offsetTop;


}
function mouseup(event)
{
    dragFlag=false;
}
function mousemove(event)
{
    if(dragFlag&&event.pageY!==0&&event.pageX!==0){
        $('.board').css('top',event.pageY-y_distance);
        $('.board').css('left',event.pageX-x_distance);
    }
}
function dragend(event)
{
    event.stopPropagation();
    event.preventDefault();
    $('.board').css('visibility',"visible");
    x_distance=undefined;
    y_distance=undefined;
}
function remove_chart()
{

$('.chart').hide(1000,function(){
  $('#overlay').hide(1000,function(){}
    )
})

}

function showEchart()
{
  var overlay = document.getElementById('overlay');
  if(overlay.style.display=='none')
  {
  $('#overlay').show(1000,function(){
  $('.chart').show(1000,function(){});
  })
  }
  else
  {
    overlay.classList.add('md-overlay');
    var chart=document.createElement('div');
    chart.classList.add('chart');
    chart.setAttribute('draggable','true');
    chart.setAttribute('ondragend','remove_chart()');
    overlay.appendChild(chart);
    var myChart = echarts.init(document.getElementsByClassName('chart')[0]);
    

    $.post('/echart',function(data,status){
      var postcode_arr=JSON.parse(data);
      var areas=[];
      postcode_arr.forEach(function(item,index){
        if(item!=0)
        {
          areas.push(item);
        }
      });

      var option = {
                title: {
                    text: '城市区域分布(拖动表格消失)'
                },
                tooltip: {},
                legend: {
                    data: ['城市数量']
                },
                xAxis: {
                    data: ["东北", "华南", "东南","华中","华南","西南","西北"]
                },
                yAxis: {},
                series: [{
                    name: '区域城市数量',
                    type: 'bar',
                    data: areas,
                }]
            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);


    })}


}


 


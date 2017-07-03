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
var leftflag=true;
var rightflag=true;
function up()
{
  $('#navigate').hide(1000,function(){


  });
}
function down()
{
    $('#navigate').show(1000,function(){


  });
}
function left()
{
  if(leftflag)
  {leftflag=false;

    $('#sidebar').hide(1000,function(){
      $('#map').animate({width:'+=20%',height:'+=120px'},100,function(){
       
       
            // var width= $('#map').css('width');
            // var height=$('#map').css('height');
            // map.setSize([width,height]);
            // map.render();
            map.updateSize();

      })
    });


  }
  else
  {leftflag=true;

    
      $('#map').animate({width:'-=20%',height:'-=120px'},100,function(){

        $('#sidebar').show(1000,function(){
        
            // var width= $('#map').css('width');
            // var height=$('#map').css('height');
            // map.setSize([width,height]);
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
           // var width= $('#map').css('width');
           //  var height=$('#map').css('height');
           //  map.setSize([width,height]);
           map.updateSize();

            });
        });
    
    


  }
  else
  {rightflag=true;

    
      $('#map').animate({width:'-=20%',height:'-=120px'},100,function(){
        $('#delbar').show(1000,function(){
        
         map.updateSize();
        });

      })
    
  }
}
function drag(event)
{
  console.log(event.pageX);
  if(event.pageY!=0&&event.pageX!=0){
     $('.board').css('top',event.pageY);
   $('.board').css('left',event.pageX);
  }
 



}


 


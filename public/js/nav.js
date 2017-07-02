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
function left()
{
  if(leftflag)
  {leftflag=false;
    $('#sidebar').hide(1000,function(){
      $('#map').animate({width:'+=20%',height:'+=120px'},100,function(){
       

      })
    });


  }
  else
  {leftflag=true;

    
      $('#map').animate({width:'-=20%',height:'-=120px'},100,function(){

        $('#sidebar').show(1000,function(){});
      });
   
  }

}
function right()
{

   if(rightflag)
  {rightflag=false;
    
    
        
        $('#delbar').hide(1000,function(){
            $('#map').animate({width:'+=20%',height:'+=120px'},100,function(){});
        });
    
    


  }
  else
  {rightflag=true;

    
      $('#map').animate({width:'-=20%',height:'-=120px'},100,function(){
        $('#delbar').show(1000,function(){});

      })
    
  }
}


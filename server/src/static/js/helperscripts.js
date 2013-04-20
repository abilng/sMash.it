function init()
{
	$( "#accordion" ).accordion({heightStyle: "content",collapsible: "true"});
    $('button.mybutton').draggable({cancel:false, 
    								revert:false, 
    								appendTo: "#editorcontainer", 
    								helper:'clone',
    								zIndex: 25,
    								scroll:false,
    								start:function(e,ui){$(ui.helper).addClass("ui-draggable-helper");} });
    $('div.workbench').droppable({accept: 'button.mybutton',
    							  drop: function(ev,ui){
    							  	var pos=$(ui.helper).position();
    							  	//$(this).find("p").html("position left : " + parseInt(pos.left) + " top : " + parseInt(pos.top));
    							  	insertDiv(this,pos);
    							  }
    							});
}

function insertDiv(element,pos){
	var htmlstring = '<div class="widget" id="w'+parseInt(pos.left)+parseInt(pos.top)+'" style="position:fixed; left:'+parseInt(pos.left)+'px; top:'+parseInt(pos.top)+'px;">'
						+'<div class="widget-head">'
						+'<b>title</b>'
						+'<a class="close" href="#" onclick="closeWidget.call(this)"></a>'
						+'</div>'
						+'<div class="widget-content" style="display: block;">'
						+'<p>this is a test widget</p>'
						+'<p>yes this is one</p>'
						+'</div>'
					   +'</div> ';
	element.innerHTML += htmlstring;
}

function closeWidget(){
	//$(this).parentNode.parentNode.animate({opacity: 0});
	//alert("hi" + $(this).parents("div").parents("div").attr('id'));
	var ele = $(this).parents("div").parents("div").attr('id');
	$("#"+ele).remove();
}
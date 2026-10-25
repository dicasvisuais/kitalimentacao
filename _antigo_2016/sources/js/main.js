$(document).ready(function () {
	$('.navbar-toggle').click(function(){
		var icone = $(this).find('span.glyphicon');
		if(icone.hasClass('glyphicon-menu-hamburger')){
			icone.removeClass('glyphicon-menu-hamburger');
			icone.addClass('glyphicon-remove');
			$(this).addClass('active');
		} else {
			icone.removeClass('glyphicon-remove');
			icone.addClass('glyphicon-menu-hamburger');
			$(this).removeClass('active');
		}
	});
	
	if ($.isSm() || $.isMd() || $.isLg() ) {
		var newHeight = $('#rowContent').height();
		//window.alert(newHeight);
		$('.bannerWrapper').css('min-height', newHeight);
	}
	function blinker() {
	    $('.blink').fadeOut(500);
	    $('.blink').fadeIn(500); 
	}
	var intervalo = setInterval(blinker, 1000);

	$(window).scroll(function(){
	  if($(this).scrollTop() > 100){
	    $('.seta').fadeOut(500);
	    clearInterval(intervalo);
	  }
	});
});

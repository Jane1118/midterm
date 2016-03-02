/* -----------------------------------------------------------------------------------------------------------------

	PLACEHOLDERISE
	
	[ ] Check compatibility with actual placeholder and mask xxxx-xxxx-x type things
	[ ] Add plugin options for customising classes like .gform_validation_container and .gfield_required
	[ ] "(required)" text to append placeholder
	
	Alternative approach: http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html


	FIXED
	[x] Form failure overrites user's form data. BAD!!!!!
	
----------------------------------------------------------------------------------------------------------------- */

(function($) {

	// plugin definition
	$.fn.placeholderise = function(options) {
	
		//console.log(this);
				
		this.find('label').each(function(){
			
			var $label = $(this),
				$input = $("#" + $label.attr("for") ); // "for" attribute indicates corresponding input id.
				value = $input.val();
								

			// IGNORE HONEYPOTS
			// SKIP UNWANTED INPUTS (Things that sholdn't have placeholders)
			if ( 
				$label.parent().hasClass("gform_validation_container") ||
				$input.is('input[type="checkbox"]') ||
				$input.is('input[type="password"]')
			){
				return false; // ... or the form won't submit. Gosh!
			}
			


/*
			if ( $input.is('input[type="checkbox"]') || $input.is('input[type="password"]') ){
				return false;
			}
*/


			// HIDE LABEL
			$label.css("display","none"); // Yeah, I know...
			
			
			// SET LABEL TEXT
			if ( $label.children().length ){
				var labelText = $label.clone().children().remove().end().text();
				// ^ Remove any spans -- like <span class="required">*</span> -- or other elements from label.
			} else {
				var labelText = $label.text();
			}
			

			// REQUIRED INPUTS
			// [+] Add a class so we can style them to look "required"
			if ( $label.children(".gfield_required").length || $input.attr("aria-required") == "true" || $label.next(".required").length ){
				$input.addClass("required-input");				
				// Append the placeholder text
				//labelText = labelText + " (required)"; // optional
			}
			
			// Remove twentyeleven theme comment required span.
			$label.next(".required").css("display","none");
			

			
			// Set label as input value
			if ( value == "" || value == labelText ){
				$input.val(labelText).addClass("hasPlaceholder");
			}

			$input
				.attr("data-placeholder", labelText)
				.focusout(function(){
					// Set label as placeholder value
					var value = $(this).val();
					if ( value == "" || value == labelText ){
						$input.val(labelText).addClass("hasPlaceholder");
					}
				})
				.focusin(function(){
					// Clear the form for the user
					var value = $(this).attr("value");
					if ( value == labelText ){
						$input.val("").removeClass("hasPlaceholder");
					}
				});
						
			
			
		});	

		
		// SUBMIT
		this.submit(function(){
			
			$(this).find(".hasPlaceholder").each(function(){
				currentValue = $(this).val(),
				placeholder  = $(this).attr("data-placeholder");
				
				if ( currentValue == "" || currentValue == placeholder ) {
					$(this).val("");
			    }
			    // consider a timout here to put the values back, so if the form doesn't submit we're ok still...?
			    // In most cases form submission failure reloads the form (and this function) again anyway.
			});
			
			
		});
		
		
		// And just for IE6 kicks
		this.find('input').not('input[type=image], input[type=submit]').addClass('input-type-text');
		this.find('input[type=image]').addClass('input-type-image');
		this.find('input[type=submit]').addClass('input-type-submit');
	
	};
/*
	// private function for debugging
	function debug($obj) {
	if (window.console && window.console.log)
		window.console.log('hilight selection count: ' + $obj.size());
	};
*/
})(jQuery);




















//	Last updated: 7/2/12
/* -----------------------------------------------------------------------------------------------------------------


	MOBILE NAVIGATION
	=================
	
-	Creates a select option dropdown from your navigation.
		
-	It's then up to you to hide and show your menus via media-queries or whatever.

-	Menu links with class "current" or who have parents with classes "current_page_item" (the WP default) 
	are preselected in the dropdown options. Otherwise the first nav item is selected. 
	
-	UPDATE: Now handles submenus! 
	Uses em dashes to indicate parent-child heirarchy.
	
	
	To Do
	-----
	[ ] Option for *heading* like "Navigation" as the first select?
	[ ] Options for naming, current page class etc.
		But wait until it's gone into production a few times to see if I'll actually ever use 
		such options. 
	[x] handle sub-menus?

	
----------------------------------------------------------------------------------------------------------------- */



(function($) {

	// plugin definition
	$.fn.mobileNavigation = function(destination) {
	
		//console.log(this);
		
		var $nav = this,
			$destination = $(destination),
			output = '';
			

		// Log Error if no destination given. 
		if ( ! $destination.length ){
			// console.log('mobileNavigation says: You have to tell me a valid selector for the destination.');
			// console.log('For example: $("your_nav_selector").mobileNavigation("#selector_for_mobile_nav_destination");');
			return false;
		}
			
		
		String.repeat = function(string, num){ 
			return new Array(parseInt(num) + 1).join(string); 
			// http://stackoverflow.com/questions/202605/repeat-string-javascript#comment3790806_202627
			// Call it like this: String.repeat('My string', 20)
		};
		
		function stringRepeat (string, num){
			var output = '';
			for(i = 0; i < num; i++){
				output += string;
			}
			return output;
		}

		
		$nav.find("a").each(function(){
			
			var $a = $(this),
				$selected = ''; //( $a.hasClass("current") || $a.parent("li").hasClass("current_page_item") ) ? 'selected="selected"' : "",
				depth = parseInt( $a.parentsUntil( $nav, "ul" ).length ) - 1, 
				prefix = depth > 0 ? stringRepeat('&mdash;', depth) + ' ' : "" ; // 
				
			output += '<option ' + $selected + ' value="' + $a.attr("href") + '">' + prefix + $a.text() + " " + '</option>';				
			
		});	
		
		// Clear the destination of any html
		
		//$destination.html("");
		
		// Create our new nav and select event and just toss it in the destination.
		$mobileNav = $('<select id="mobile-navigation">' + '<option selected="selected">Navigation...</option>' + output + '</select>')
//		$mobileNav = $('<select id="mobile-navigation">' + output + '</select>')
			.prependTo($destination)
			.change(function() {
				window.location = $(this).find("option:selected").val();
			}
		);
		
	
	};

})(jQuery);







/* -----------------------------------------------------------------------------------------------------------------

	Slides
	
	
	USE:
	====
	
	.slideClass {}
	
----------------------------------------------------------------------------------------------------------------- */

(function($) {

	// plugin definition
	$.fn.whitSlides = function( options ) {
	
		
		var defaults = {
	      'slideClass'        	: 'slide',
	      'currentClass' 		: 'current',
	      'transitionSpeed'		: 1200,
	      'timeDelay'			: 3000
	    };
	    
		var opts = $.extend(defaults, options);
		
		var $slider = this;
		if ( ! $slider.length ){ return false; }
		
		
		if ( $slider.find("."+opts.slideClass).length ){
			// we've already set our current class in CSS
		} else {
			$slider.find("."+opts.slideClass).first().addClass(currentClass);
		}
		


		function nextSlide(){
			
			var $currentSlide = $slider.find("."+opts.currentClass).first();
			var	$nextSlide = $currentSlide.next("."+opts.slideClass).length ? $currentSlide.next("."+opts.slideClass) : $slider.find("."+opts.slideClass).first();
			
			// Hide all slides that aren't about to be animated.
			$slider.find("."+opts.slideClass).not($currentSlide).not($nextSlide).css({
				"visibility" : "hidden",
				"z-index" : 0
			});
			
			// Prepare next slide for animation
			
			$nextSlide.css({ 'opacity' : 0, 'visibility' : 'visible', 'z-index' : 3 });
			// hide it and put it "on top"
			$currentSlide.css({ 'z-index' : 2 });
			// put it second from the top.
			
			
			
			$nextSlide.animate({'opacity' : 1 }, opts.transitionSpeed, function(){
				$slider.find("."+opts.currentClass).removeClass(opts.currentClass);
				$(this).addClass(opts.currentClass);
				
				// custom use, this slider only
				if ( $slider.attr("id") == "feature-slider" ){ $slider.find("img.scale").css("display","none"); }
			});
			$currentSlide.animate({'opacity' : 0 }, opts.transitionSpeed );
			
		}



/*
		// # This also works
		//	 May be useful when a longer delay is required before starting.
		
		var timer;
		function repeat(){
		
		    // reset timer  
		    clearTimeout(timer);
				    
		    // my thing I want done every x second
		    nextSlide();
		    
		    // start timer
		    timer = setTimeout(repeat, time);
		    
		} 
		
		window.setTimeout(repeat, time);
*/



		var timer;		
		function do_slides()
		{
		    nextSlide();
		}
		timer = setInterval( do_slides , opts.timeDelay );
		
	
	};
})(jQuery);



























































































jQuery(document).ready(function($) {

	
	$('form').not('.searchform').placeholderise(); // Must apply to the form itself, otherwise the form sbumit function won't work.
	
/*
	$(document).bind('gform_page_loaded', function(event, form_id, page_number){
		$('#gform_3').placeholderise();
    });
*/
















	//$("#your_nav_selector").mobileNavigation("#selector_for_mobile_nav_destination");		
	$("#standard-navigation").mobileNavigation("#mobile-navigation-area");	
	
	
	
	
	/* ---------------------------------------------------
		Search popup
														*/
	var $popUp = $("#search-popup"),
		$searchIcon = $("#popup-trigger"),
		$input = $popUp.find(".s");
		
		// Think of a way to avoid the chrome appearing in IOS
	
	$searchIcon.removeAttr("href");
	
	$searchIcon.click(
		function(e){
			e.preventDefault();
			
			if ( ! $(this).hasClass("popped") ){
				
				$(this).addClass("popped"); 
				
				$popUp.stop().css({
					'opacity' : 0,
					'display' : 'block'
				}).animate({
					'opacity' : 1
				}, 300 );
				
				$input.focus();

			} else {
			
				$popUp.stop().animate({
					'opacity' : 0
				}, 300, function(){
					$(this).css({'display' : 'none'})
					$searchIcon.removeClass("popped");
				});
			
			}
			
		}
	); 

	
	$input.focusout(function(){

		$popUp.stop().animate({
			'opacity' : 0
		}, 300, function(){
			$(this).css({'display' : 'none'});
			$searchIcon.removeClass("popped");
		});
			
	});











	








	/* -----------------------------------------------------------------------------------------------------------------
	
		Email Spam
			
	----------------------------------------------------------------------------------------------------------------- */

	function formatMail(){
		
		$(".format-mail").each(function(){
			
			var name = $(this).attr("data-name");
			var url = $(this).attr("data-url");
			
			$(this).html('<a href="mailto:'+name+'@'+url+'">'+name+'@'+url+'</a>');
			
		});
	}
	formatMail();





	var $featureSlider = $("#feature-slider"),
		URIbase = $featureSlider.attr("data-uri");
	
	
	$featureSlider.append('<img class="slide" src="'+URIbase+'/images/content/feature-gown_alt.jpg" alt="" /><img class="slide" src="'+URIbase+'/images/content/feature-pen_alt.jpg" alt="" /><img class="slide" src="'+URIbase+'/images/content/feature.jpg" alt="" />');




}); //end ready


jQuery(window).load(function($) {
	//initialize after images are loaded
	
	
	// INITIALISE SLIDERS
	
	jQuery("#feature-slider").whitSlides({
		'timeDelay' : 6000
	});
	
	jQuery(".slides").whitSlides();

});













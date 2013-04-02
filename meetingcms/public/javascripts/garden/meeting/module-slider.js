/**
*
* @author: niko
* @date: 2012.11.05
* @info: slider
* 	new Slider( config )
* 	config = {
*		slider
*		auto
*		controllList
*		navPrev
*		navNext
*		interval
*		type	
*		gap	
*       touch
* 	}	
*
*
**/

define(function(require, exports, module) {

	var $ = require('jquery');
	     
	function Slider( conf ) {

		var _slider        = conf.slider,
			_wrap          = conf.wrap || _slider.parent(),
			_item          = _slider.find('.item'),
			_auto          = conf.auto || false,
			_controllList  = conf.controllList || [],
			_controllItem  = null,
			_navPrev       = conf.navPrev,
			_navNext       = conf.navNext,
			_interval      = conf.interval || 5000,
			_gap           = conf.gap || 960,
			_first         = _item.eq(0),
			_current       = _first,
			_size          = _item.size(),
			_type          = conf.type || 'fade',
			_COUNT         = 0,
			_timmer        = 0,
			_left          = parseInt(_slider.css('left')) || 0,
			_newLeft       = _left,
			_sumWidth      = 0,
			_touch         = conf.touch || false,
			_touchMoveLeft = conf.touchMoveLeft || _wrap.width(),
			_callbackin    = function(){},
			_callbackout   = function(){};

		function init ( callbackin, callbackout ) {
			var html = '',
				i = 0;

			_callbackin = callbackin;
			_callbackout = callbackout;

			if ( !_item[0] ) {
				return;
			}
			//init the nav controll list
			if ( _controllList[0] ) {
				html = ''; 						
				for ( i = 0; i < _size; i++ ) {
					html += '<li class="item" index="' + i + '"></li>';
				}
				_controllList.html( html );
				_controllItem = _controllList.find('.item');
				_controllItem.eq(_COUNT).addClass('active');
			}
			if ( !_touch ) {
				if ( _type === 'fade' ) {
					slide();
				} else if ( _type === 'glide' ) {
					glide();
				}
			} else {
				touchSlider();
			}
		}

		//Touch Type
		//needed css3
		function touchInit() {
			var width = 0,
				height = _item.eq(_COUNT).height();

			_item.each(function(index, item){
				width += $(item).outerWidth(true);
			})
			_sumWidth = width;
			_slider.css('width', _sumWidth + 'px');
			_wrap.css('height', height + 'px');

		}
		function touchSlider () {
			var oldPos = 0,
				newPos = 0;

			//init
			touchInit();

			//touch event
			_slider.bind('touchstart', function(e) {
				e.preventDefault();

                var touches = e.originalEvent.touches? e.originalEvent.touches[0] : undefined;
               	newPos = oldPos = (touches ? touches.pageX : e.clientX);
			});
			_slider.bind('touchmove', function(e) {
				e.preventDefault();

                var touches = e.originalEvent.touches? e.originalEvent.touches[0] : undefined;
               	newPos = (touches ? touches.pageX : e.clientX);
			});
			_slider.bind('touchend', function(e) {
				e.preventDefault();
				var left = parseInt(_slider.css('left')),
					height = 300;

				if ( (newPos-oldPos)>0 ) {
					//from left to right
					left += _touchMoveLeft;

					if ( left>=0 ) {
						left = 0;
					}	
				} else {
					//from right to left 
					left -= _touchMoveLeft;

					if ( -left > _sumWidth-_touchMoveLeft ) {
						left = -(_sumWidth-_touchMoveLeft);
					}
				}

				_COUNT = Math.floor((-left)/_touchMoveLeft);
				height = _item.eq(_COUNT).height();

				if ( _controllList[0] ) {
					_controllItem.removeClass('active').eq(_COUNT).addClass('active');
				}

				_slider.css('left', left + 'px');
				_wrap.css('height', height + 'px');
			});

			//ControllList Event	
			if ( _controllList ) {
				touchControllList();
			}
		}

		function touchControllList () {
			_controllItem.bind('click', function(){
				var index = $(this).attr('index'),
					left = -(index * _touchMoveLeft),
					height = _item.eq(index).height();

				_COUNT = index;

				_controllItem.removeClass('active').eq(_COUNT).addClass('active');
				_wrap.css('height', height + 'px');
				_slider.css('left', left + 'px');
			});
		}

		//Slider Type
		function slide () {
			_current.show();

			//controll nav event
			if ( _navPrev && _navNext ) {
				_navNext.bind('click', function(){
					fadeNext();
				});
				_navPrev.bind('click', function(){
					fadePrev();
				});
			}

			//controll nav list event 
			if ( _controllList[0] ) {
				_controllItem.bind('click', function() {
					if ( !$(this).hasClass('active') ) {
						controllNav(this);
					}
				});
			}
			if ( _auto ) {
				autoFade();
			}
		}

		//change Controll List
		function updateControllList (old, _COUNT) {
			_controllItem.eq(old).removeClass('active');
			_controllItem.eq(_COUNT).addClass('active');
		}

		//fade prev & hide other
		function fadePrev () {
			var old = _COUNT;
			if ( _COUNT <= 0 ) {
				_COUNT = _size-1;	
			} else {
				_COUNT--;
			}		
			fadeChange(old, _COUNT);
			if ( _controllList[0] ) {
				updateControllList(old, _COUNT);
			}
		}

		//fade next & hide other
		function fadeNext () {
			var old = _COUNT;
			if ( _COUNT >= _size-1 ) {
				_COUNT = 0;	
			} else {
				_COUNT++;
			}		
			fadeChange(old, _COUNT);
			if ( _controllList[0] ) {
				updateControllList(old, _COUNT);
			}
		}

		/* fade change function */
		function fadeChange (old, current) {

			var oldItem = _item.eq(old),
				currentItem = _item.eq(current),
				height = oldItem.height();

			_slider.css('height', height);

			oldItem.stop().fadeOut(200, function(){

				oldItem.removeClass('active');	
				if ( _callbackout ) {
					_callbackout(this);	
				}

				currentItem.stop().fadeIn(200, function(){
					currentItem.addClass('active');	

					_slider.animate({
						'height': currentItem.height() + 'px'
					}, 200);

					if ( _callbackin ) {
						_callbackin(this);
					}

				});

			});	
		}	

		/* controll nav function */
		function controllNav ( that ) {
			var index = that.getAttribute('index'),
				old = _COUNT;
			_COUNT = index;

			_controllItem.eq(old).removeClass('active');
			$(that).addClass('active');

			fadeChange(old, index);
		}

		/* auto fade */
		function autoFade () {
			_timmer = setInterval( fadeNext, _interval );
		}

		//Glide Type
		function glide () {
			var width = 0;
			_item.each(function(index, item){
				width += $(item).outerWidth(true);
			})
			_sumWidth = width;
			_slider.css('width', width + 'px');

			//controll nav event
			if ( _navPrev && _navNext ) {
				_navNext.bind('click', function(){
					glideNext();
				});
				_navPrev.bind('click', function(){
					glidePrev();
				});
			}
		}

		function glideNext () {
			_newLeft -= _gap;
			if ( _newLeft <= -_sumWidth+_gap ) {
				_newLeft = -_sumWidth+_gap;
			}
			glideChange( _newLeft );
		}

		function glidePrev () {
			_newLeft += _gap;
			if ( _newLeft >= _left ) {
				_newLeft = _left;
			}
			glideChange( _newLeft ); 
		}

		function glideChange ( left ) {
			_slider.animate({
				'left': left + 'px'
			}, 'slow', 'swing');
		}

		return {
			init: init
		}
	}

	module.exports = Slider

});
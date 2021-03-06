define(function(){	
  /*
   Author Zhangyh 
   Create Date:2015.07.13
   
   *       options 参数设置 
   *elementName   元素名称包括class和id
   *autoDuration  自动播放滚动持续时间
   *intervalTime  自动滚动播放间隔时间
   *aspectRatio   宽高比（为自适应高度设置的参数）
   */
   
  //window.MUI = {}; 
  MUI.createCarousel = function(options){
	  var targets = document.querySelectorAll(options.elementName); 
	  for(var i = 0; i<targets.length; i++){
		var $this = targets[i]; 
		$this.createCarousel ?
	    console.log($this.id+'轮播图你他妈已经调用过了') :
	    $this.createCarousel = new createCarousel($this, options);
	  } 
  }
   
  function createCarousel(element, options){
	//定义全局变量
	var startPos, 
		movePos, 
		distance, 
		startTime, 
		endTime, 
		speed, 
		restTime, 
		actv, 
		next,
		prev,
		atvDot,
		nextState = null,
		aspectRatio = null,
		inner,
		dotContainer,
		allDots = [],
		tarWidth,
		allItem,
		allItemNum = 0,
		first,
		last,
		situationOne = false,
		situationTwo = false,
		//接受传入参数作为全局变量
		tar = element, 
		intervalTime = options.intervalTime || 3000,
		autoDuration = options.autoDuration || 600,
		aspectRatio = options.aspectRatio || null;
		
		//为每个被绑定的元素设置独一无二的定时器
		tar.resetTimer = tar.autoTimer = null;
	
	//获取下一个节点
	function getNextsibling(n){  
	  var x = n.nextSibling;  
	  if(x == null) return null;  
	  while (x && x.nodeType!=1){  
		 x = x.nextSibling;  
	   }  
	  return x;  
	} 
	
	//获取上一个节点
	function getPrevioussibling(n){  
	  var x = n.previousSibling;  
	  if(x == null) return null;  
	  while (x && x.nodeType!=1){  
		x = x.previousSibling;  
	  }  
	  return x;  
	} 
	
	//获取节点的索引值
	function getElemIndex(current, obj){ 
	  for (var i = 0, length = obj.length; i<length; i++) { 
		if (obj[i] == current) { 
		  return i; 
		} 
	  } 
	}
	
	//重置为默认并激活对应的节点
	function resetClass(dir){
	   actv.className = next.className = prev.className = 'item'; 
	   if(dir == 'p'){ 
		  prev.className = 'item active'; 
	   }else if(dir == 'n'){
		  next.className = 'item active'; 	
	   }
	}
	
	//捕获触摸事件
	function xpos(e) {
	  // touch event
	  if (e.targetTouches && (e.targetTouches.length >= 1)) {
		  return e.targetTouches[0].clientX;
	  }
	  // mouse event
	  return e.clientX;
	}
	
	//阻止默认事件 
	function preventDefaultEvnet(ev){
	  ev.preventDefault();
	  ev.stopPropagation();
	  return false;
	}
	
	//获取下一个和上一个元素
	function getPrevNext(actv){
	   prev = getPrevioussibling(actv);
	   prev ? null : prev = last;
	   prev.className = 'item prev';
	   
	   next = getNextsibling(actv);
	   next ? null : next = first;
	   next.className = 'item next';
	}
	
	//移动动画设定
	function translate(elem, distance, transition, duration, animateFn){
	   var string = '', 
	   dur = duration || 200,  
	   aFn = animateFn || 'ease-out';
	   transition && (string = '-webkit-transition:-webkit-transform '+aFn+' '+dur+'ms; transition:-webkit-transform '+aFn+' '+dur+'ms;');   
	   elem.setAttribute('style','-webkit-transform:translate3d('+distance+'px,0,0); '+string);   
	}
	
	//激活下一个圆点
	function activeNextDot(dir){
	  if(dir == 'p'){ 
		var nextElem = prev
	  }else if(dir == 'n'){
		var nextElem = next	
	  }else{
		return false;
	  }
	  atvDot.className = 'item';
	  var atvIndex = getElemIndex(nextElem, allItem);
	  situationTwo && (atvIndex = atvIndex%2);  
	  allDots[atvIndex].className = 'item active';
	}
	
	//单次播放
	function oneSlide(){
	   actv = tar.querySelector('.active');	 
	   getPrevNext(actv);
	   atvDot = dotContainer.querySelector('i.active'),
	   activeNextDot('n'); 
	   translate(inner, tarWidth*(-1), true, autoDuration, 'ease-in-out');
	   tar.resetTimer && clearTimeout(tar.resetTimer);
	   tar.resetTimer = setTimeout(function(){ //动画结束后重置
		 inner.removeAttribute('style');
		 resetClass('n');
	   },autoDuration);
	}
	
	//自动循环播放
	function autoPlayer(){
	  tar.autoTimer && clearTimeout(tar.autoTimer); 
	  tar.autoTimer = setTimeout(function(){
		oneSlide();  
		autoPlayer();
	  },intervalTime); 
	}
	
	//延时执行部分
	 function delayFn(nextState, restTime){
	   tar.resetTimer && clearTimeout(tar.resetTimer); 	 
	   tar.resetTimer = setTimeout(function(){ //动画结束后重置
		 inner.removeAttribute('style');  
		 resetClass(nextState);  
		 distance = 0;
	   },restTime);
	 }
	 
	//获取所有节点并保存到变量中
	function getAllNode(){
	   tarWidth = tar.offsetWidth,
	   dotContainer = tar.querySelector('.dots');
	   inner = tar.querySelector('.inner');
	   allItem = inner.querySelectorAll('div');
	   first = inner.querySelector('div.item:first-child');
	   last = inner.querySelector('div.item:last-child');
	   allItemNum = allItem.length;
	   //对轮播图仅有1页和2页的情况特殊处理
	   if(allItemNum == 1){ 
	       //单页不进行滚动
		   first.style.display="block";
		   situationOne = true;
		   return false;
	   }else if(allItemNum == 2){
		 for(var i=0; i<2; i++){
		   var newNode = inner.querySelectorAll('div')[i].cloneNode(true);
		   newNode.className = 'item';
		   inner.appendChild(newNode);
		 } 
		 //节点发生变化后需要重新获取
         allItem = inner.querySelectorAll('div');
	     last = inner.querySelector('div.item:last-child');
	     allItemNum = 4;
		 situationTwo = true;
	   }
	}
	
	//按宽高比初始化高度
	function setWrapHeight(){
	  if(aspectRatio) tar.style.height = tarWidth*aspectRatio+'px';
	}
	
	//初始化小圆点
	function buildDots(){
	  dotContainer.innerHTML = '';	
	  var dotNum = 0;	
	  situationTwo ? (dotNum = 2) : (dotNum = allItemNum);
	  for(var i = 0; i<dotNum; i++){
		var t = document.createElement('i');
		allDots[i] = t,
		(i == 0) && (t.className = 'active');
		dotContainer.appendChild(t);
	  }
	  dotContainer.style.width = dotNum*12 + 'px';
	  dotContainer.style.marginLeft = dotNum*(-6) + 'px'; 
	}
	
	//touchstart触发方法
	function tStartFn(e){
	   //每次触发初始化参数
	   atvDot = dotContainer.querySelector('i.active');
	   tar.resetTimer && clearTimeout(tar.resetTimer);
	   tar.autoTimer && clearInterval(tar.autoTimer); 
	   speed = 0; 
	   restTime = 0;
	   distance = 0;
	   //如果有正在执行的滚动
	   if(nextState){
		 inner.removeAttribute('style');  
		 resetClass(nextState);  
		 activeNextDot(nextState); 
		 nextState = null;
	   } 
	   startTime = (new Date).getTime();
	   startPos = xpos(e);
	   actv = tar.querySelector('.active');	 
	   getPrevNext(actv);
	}
	
	//touchmove触发方法
	function tMoveFn(e){
	   movePos = xpos(e);
	   distance = movePos - startPos;
	   translate(inner, distance, false);
	   //preventDefaultEvnet(e);
	}
	
	//touchend触发方法
	function tEndFn(e){
	   endTime = (new Date).getTime();
	   speed = Math.abs(distance/(endTime - startTime)); 
	   restTime = (tarWidth - distance)/speed;
	   (restTime > 500) && (restTime = 500);
	   
	   //判断手指抬起时移动的方向和位置
	   var minMove = tarWidth/4;
	   var arvDist = 0;
	   if(distance>minMove || distance<minMove*(-1)){
   
		 distance>0 ? (nextState = 'p') && (arvDist=tarWidth) : (nextState = 'n') && (arvDist=tarWidth*(-1));
		 activeNextDot(nextState); 
		 translate(inner, arvDist, true, restTime);
		 delayFn(nextState, restTime);
		 
	   }else{ 
		 translate(inner, 0, true, 300);
		 tar.resetTimer = setTimeout(function(){
		   inner.removeAttribute('style');
		   distance = 0;
		 },300);
	   }
	   autoPlayer();
	   //preventDefaultEvnet(e);
	}
	
	//初始化绑定和调用所有方法
	function init(){
	  getAllNode();
	  if(situationOne){
		return false;
	  }
	  setWrapHeight();  
	  buildDots();
	  autoPlayer(); 
	  tar.addEventListener('touchstart', function(e){
		  if(Device.os == "android" && location.href.indexOf("index/index/index")>0){
			  var opt = {
					type:"2",
					callback:"curView.refresh()"
			  };
			  Client.dragRefresh(opt);
		  }
		  tStartFn(e);
	  }, false);
	  tar.addEventListener('touchmove', function(e){tMoveFn(e)}, false);
	  tar.addEventListener('touchend', function(e){
		  if(Device.os == "android" && location.href.indexOf("index/index/index")>0){
			  var opt = {
					callback:"curView.refresh()"
			  };
			  Client.dragRefresh(opt);
		  }
		  tEndFn(e);
	  }, false);
	}
	init();
  }
})
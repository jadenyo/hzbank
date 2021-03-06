define(function(require, exports, module){
	require("scripts/components/base64.js");
	require("jquery.qrcode");
	var share1Tpl = require("text!../template/share1.html");
	
	var faceToFaceView = module.exports = ItemView.extend({
		
		events : {
			"click #share" : "share",
			"click #shareCode" : "shareCode",
			"click #faceToFace" : "faceToFace",
			"click #queryFriends" : "queryFriends"
		},
		
		template : share1Tpl,
		
		initialize : function(){
		    var pageTest = {
				  	title:'邀请好友',
					leftButton:{
						name : '返回',
						func :'curView.goBack()'
					},
					rightButton:{
						name : ''
					}
			 };
			Client.initPageTitle(pageTest);
			
			var codeUnNew = MUI.Cache.get("codeUnNew");
			if(!codeUnNew || !codeUnNew.data){
				$("#dot").addClass("right-top-dot");
			}
			
			this.name = App.storage.get("UserInfo").customerNameCN;
		    var recommendNum = App.storage.get("recommendNum");
		    
		    if(recommendNum){
		    	var num = recommendNum.split("");
				for(var i=0;i<num.length;i++){
					$('.code span').eq(i).text(num[i]);
				}
		    	Client.hideWaitPanel(1);
		    }else if(Utils.checkSession()){
		    	this.createRecommedNUM();
		    }else{
		    	Client.hideWaitPanel(1);
		    }
		    
		   
		   
		    
		},
		
		share : function(){
			var dataStr = "code="+(App.storage.get("recommendNum")||"")+"&name="+(this.name||"");
			dataStr = Base64.encode(dataStr);
			var opt={
					imageUrl:"",
					title:"杭银直销",
					url: basePath + "/"+ App.storage.get("param").url+"?"+dataStr,
					content:"杭州直销银行突破传统实体网点的经营模式，只需通过互联网即可完成账户注册，享受多元化的金融服务，快来体验吧。"
				};
			Client.share(opt);
		},
		
		faceToFace : function(){
			var dataStr = "code="+(App.storage.get("recommendNum")||"")+"&name="+(this.name||"");
			dataStr = Base64.encode(dataStr);
			var url = basePath +"/"+ App.storage.get("param").url+"?"+dataStr;
			if($("#shareCode").css("display")=="none"){
				$("#shareCode").show();
			}else{
				$("#shareCode").hide();
			}
			if($("#code").find("canvas")){
				$("canvas").remove();
			}
			//生成二维码
			$("#code").qrcode({         
	          	 render : "canvas",    	
	           	 text : url,    	
	          	 width : "230",         
	             height : "230",        
	             background : "#ffffff",
	             foreground : "#000000",
	             src: 'logo_bmm.png'
			});
			$("#dot").removeClass("right-top-dot");
			MUI.Cache.save("codeUnNew", true);
		},
		
		shareCode : function(){
			 if($("#shareCode").css("display")=="none"){	
					$("#shareCode").show();
			 }else{
					$("#shareCode").hide();
			 }
		},
		
		queryFriends : function(){
			App.navigate("anymore/anymoreCtl/queryFriends");
		},
		
		
		createRecommedNUM:function(){
			var param = {
			};
			Ajax({url:"/userSetting/createRandomNUm",data:param, success:function(data){
				if(MUI.isEmpty(data.errorCode)){
					var recommendNum = data.cd.RecommendNum;
					if(recommendNum){
						App.storage.set("recommendNum",recommendNum);
						var num = recommendNum.split("");
						for(var i=0;i<num.length;i++){
							$('.code span').eq(i).text(num[i]);
						}
					}
				}else if(data.errorCode == "EBLN0000"){
					//游客无邀请码
				}else{
					Utils.alertinfo(data.errorMessage);
				}
				Client.hideWaitPanel(1);
			}});
		},
		
		
		goBack : function(){
			Client.menuOpt("5");
			App.back();
		}
	
	});
});

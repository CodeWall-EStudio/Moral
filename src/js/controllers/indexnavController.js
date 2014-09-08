angular.module('dy.controllers.indexnav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'	
	])
	.controller('indexnavController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService',function(Root,Scope,$location,Util,Mgrade,Student){
			console.log('load indexnavcontroller');

			Root.nowMonth;
			Root.defMonth;

			Root.showRecode = function(){

			}

			Root.getMode = function(){
				return $location.search()['mode'] || false;
			}
			//切换模块
			Root.switchMode = function(mode){
                if(mode !== Scope.getMode()){
                    $location.search('mode', mode);
                    resetQuota();
                    Root.$emit('status.student.quotacheng');
                }
			}	

			function resetQuota(){
				_.each(Root.quotaList,function(item){
					delete item.now;
				});
				Root.allScore = 0;
			}

			//退出登录
			Root.quitLogin = function(){

			}		

		}
	]).controller('termController',[//学期信息
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			console.log('load termController');

			Root.nowDate = +new Date();
			// Root.nowMonth = new Date().getMonth()+1;

			Root.nowTrem = {
				name : '2014 下学期',
				id : 1,
				month : [7,8,9,10,11],
				nowmonth : Root.nowMonth,
				status : true,
				endtime : 1407590174026,
				starttime : 1407590174026
			};
		}
	]);
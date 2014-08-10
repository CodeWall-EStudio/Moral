angular.module('dy.controllers.indexnav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'	
	])
	.controller('indexnavController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService',function(Root,Scope,$location,Util,Mgrade,Student){
			console.log('load indexnavcontroller');

			Root.User = {
				nick : '测试用户家长',
				name : 'testuser',
				auth : 1,
				type : 'teacher',
				allrecord : 50
			}

			Root.showRecode = function(){

			}

			Root.getMode = function(){
				return $location.search()['mode'];
			}

			Root.switchMode = function(mode){
                if(mode !== Scope.getMode()){
                    $location.search('mode', mode);
                }
			}	

			//退出登录
			Root.quitLogin = function(){

			}				

		}
	]).controller('termController',[//学期信息
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			console.log('load termController');

			Root.nowDate = +new Date();

			Root.nowTrem = {
				name : '2014 下学期',
				id : 1,
				month : [7,8,9,10,11],
				nowmonth : 10,
				status : true,
				endtime : 1407590174026,
				starttime : 1407590174026
			};
		}
	]);
angular.module('dy.controllers.managenav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'	
	])
	.controller('mNavController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService',function(Root,Scope,$location,Util,Mgrade,User){
			console.log('load managenavcontroller');

			var nowUser = {};

			Root.User = {
				nick : '测试用户',
				name : 'testuser',
				auth : 15
			}

			function hideAll(){
				$('.content-controller').hide();
				$('.content-header').hide();
			}

			Root.getMode = function(){
				return $location.search()['mode'];
			}

			Root.switchMode = function(mode){
                if(mode !== Root.getMode()){
                    $location.search('mode', mode);
                }
			}					

			Scope.authManage = function(){

			}

			Scope.quitManage = function(){

			}
		}
	]);
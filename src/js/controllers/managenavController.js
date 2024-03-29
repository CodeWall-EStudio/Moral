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
				//console.log($location.search()['mode']);
				return $location.search()['mode'] || false;
			}

			Root.switchMode = function(mode){
				if(mode === 'record' && Root.nowMonth === 0){
					alert('你还没有选择月份');
					return;
				}
                if(mode !== Root.getMode()){
                    $location.search('mode', mode);
                }
			}	

			// Scope.authManage = function(){

			// }

			// Scope.quitManage = function(){

			// }
		}
	]);
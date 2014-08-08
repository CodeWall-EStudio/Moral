angular.module('dy.controllers.managenav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.user'	
	])
	.controller('mNavController',[
		'$rootScope', '$scope','Util','mGradeService','userService',function(Root,Scope,Util,Mgrade,User){
			console.log('load managenavcontroller');

			function hideAll(){
				$('.content-controller').hide();
				$('.content-header').hide();
			}

			Scope.studentShow = function(){
				hideAll();
				$('.user-controller').show();
				$('.user-header').show();
				console.log(1);
			}

			Scope.teacherShow = function(){
				hideAll();
				$('.teacher-controller').show();
				$('.teacher-header').show();
				console.log(2);
			}

			Scope.quotaShow = function(){
				hideAll();
				$('.quota-controller').show();
				$('.quota-header').show();
				console.log(3);
			}						

		}
	]);
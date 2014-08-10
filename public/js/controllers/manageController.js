angular.module('dy.controllers.manage',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'	
	])
	.controller('manageController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService',function(Root,Scope,$location,Util,Mgrade,User){
			console.log('load managenavcontroller');

			var nowUser = {};

			Root.User = {
				nick : '测试用户',
				name : 'testuser',
				auth : 15
			}

		}
	]);
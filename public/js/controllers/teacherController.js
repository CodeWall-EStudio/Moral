angular.module('dy.controllers.teacher',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.teacher'	
	])
	.controller('teacherController',[
		'$rootScope', '$scope','Util','mGradeService','teacherService',function(Root,Scope,Util,Mgrade,Teacher){
			console.log('load teachercontroller');

			var teacherList = []

			for(var i = 0;i<10;i++){
				teacherList.push({
					name : '老师'+i,
					nick : '昵称'+i,
					grade : i,
					class : 2
				});
			}

			Scope.teacherList = teacherList;

		}
	]);
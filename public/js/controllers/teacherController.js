angular.module('dy.controllers.teacher',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.teacher'	
	])
	.controller('teacherController',[
		'$rootScope', '$scope','Util','mGradeService','teacherService',function(Root,Scope,Util,Mgrade,Teacher){
			console.log('load teachercontroller');

			if(!Util.cookie.get('skey')){
				//window.location.href="/teacher/login";
				return;
			}

			Root.isTeacher = true;
			Root.Teacher = {};

			Teacher.getTeacherInfo();
			//Student.getStudentList();
		}
	]);
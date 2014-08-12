angular.module('dy.controllers.manage',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student',
        'dy.services.teacher'	
	])
	.controller('manageController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService','teacherService',function(Root,Scope,$location,Util,Mgrade,Student,Teacher){
			console.log('load managecontroller');

			if(!Util.cookie.get('skey')){
				//window.location.href="/teacher/login";
				//return;
			}

			Root.Teacher = {};

			Teacher.getTeacherInfo();			
			console.log(Root.Teacher,Teacher);

		}
	]);
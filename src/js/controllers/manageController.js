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

			//console.log('skey',Util.cookie.get('skey'),Util.cookie.get('role'));
			if(Util.cookie.get('role') !== 'teacher'){
				//window.location.href="/teacher/login";
				//return;
			}

			Root.isManage = true;
			Root.Teacher = {};

			Teacher.getTeacherInfo();			
			console.log(Root.Teacher,Teacher);

		}
	]);
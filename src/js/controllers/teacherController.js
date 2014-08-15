angular.module('dy.controllers.teacher',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.teacher'	
	])
	.controller('teacherController',[
		'$rootScope', '$scope','Util','mGradeService','teacherService',function(Root,Scope,Util,Mgrade,Teacher){
			console.log('load teachercontroller');

			if(Util.cookie.get('role') !== 'teacher'){
				// window.location.href="/teacher/login";
				// return;
			}

			if(Root.isManage){
				return;
			}

			Root.isTeacher = true;
			Root.Teacher = {};

			//学生列表拉完了.继续拉分数
			Root.$on('status.student.loaded',function(){

			});

			Teacher.getTeacherInfo();
			//Student.getStudentList();
		}
	]);
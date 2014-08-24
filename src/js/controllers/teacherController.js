angular.module('dy.controllers.teacher',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.teacher',	
        'dy.services.student',
	])
	.controller('teacherController',[
		'$rootScope', '$scope','$location','Util','mGradeService','teacherService','studentService',function(Root,Scope,Location,Util,Mgrade,Teacher){
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


			var url = Location.absUrl();
			var fn = function(){};
			if(url.indexOf('teacher.html') > 0){
				Root.teacherPage = true;
			}
			Teacher.getTeacherInfo();
			//Student.getStudentList();
		}
	]);
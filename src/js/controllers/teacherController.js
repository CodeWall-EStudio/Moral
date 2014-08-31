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
				//return;
			}

			Root.isTeacher = true;
			Root.Teacher = {};
			Root.teacherMap = {};
			Root.teacherList = [];

			//学生列表拉完了.继续拉分数
			Root.$on('status.student.loaded',function(){

			});

			//学期已经 加载 
			Root.$on('status.term.load.teacher',function(){
				var param = {
					term : Root.Term._id
				}
				Teacher.getTeacherList(param);
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
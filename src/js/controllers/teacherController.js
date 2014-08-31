angular.module('dy.controllers.teacher',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.teacher',	
        'dy.services.student',
	])
	.controller('teacherController',[
		'$rootScope', '$scope','$location','Util','mGradeService','teacherService','studentService',function(Root,Scope,Location,Util,Mgrade,Teacher,Student){
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

			Root.$on('status.student.load',function(){
				Student.filterStudentByTeacher();
			});

			//老师资料拉完了.继续拉分数
			Root.$on('status.teacher.load',function(){
				Mgrade.getTermList();
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
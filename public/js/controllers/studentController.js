angular.module('dy.controllers.student',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'	
	])
	.controller('studentController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService','CMD_SET_QUOTA',
			function(Root,Scope,Location,Util,Mgrade,Student,CMD_SET_QUOTA){
			console.log('load studentcontroller');
			//sm = list 显示学生列表
			//sm = info 显示学生个人资料
			//sm = recode 显示自评说明

			Scope.SelectdGrade = {};
			Scope.SelectdClass = {};

			Root.myInfo = {};

			var userList = {};
			var gradeList = [];

			Root.rStudent = {};
			Root.studentList = {};
			Root.nowStudent = {};


			function resetData(){
				// Scope.name = '';
				// Scope.cmis = '';
			}
		
			Root.selectStudent = function(id){
				Root.nowStudent = Root.studentList[id];
			}

			Scope.createUser = function(){
				//resetData();
				$('#userZone .div-form').show();
			}	

			Scope.saveStudent = function(){
				 //student: {"id":"230126200703240579","name":"白益昊","number":"0108021141901019","grade":1,"class":1,"pid":22709,"sex":1}
				Root.nowStudent.grade = Scope.SelectdGrade.id;
				Root.nowStudent.class = Scope.SelectdClass.id;
				var param = {
					number : Root.nowStudent.number,
					name : Root.nowStudent.name,
					id : Root.nowStudent.id,
					grade : Root.nowStudent.grade,
					class : Root.nowStudent.class,
					pid : 1000,
					sex : Root.nowStudent.sex
				}
				Student.createStudent({
					student : JSON.stringify(param)
				});

			}

			Root.hasStudent = function(){
				return !$.isEmptyObject(Root.nowStudent);
			}

			Root.$on(CMD_SET_QUOTA,function(e,d){
				console.log(d.id,d.num);
			});


			Student.getStudentList();
			
			var url = Location.absUrl();
			if(url.indexOf('student.html') > 0){
				Student.getStudentInfo();
			}

		}
	]);
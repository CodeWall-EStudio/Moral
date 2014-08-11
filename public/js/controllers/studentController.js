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

			var userList = {};
			var gradeList = [];

			Root.studentList = {};
			Root.nowStudent = {};

			console.log(Root.nowStudent);

			// for(var i = 0;i<10;i++){
			// 	userList[i] = {
			// 		name : '姓名'+i,
			// 		nick : '昵称'+i,
			// 		cid : i,
			// 		sex : '男',
			// 		grade : 1,
			// 		class : Math.round(Math.random()*10),
			// 		record : Math.round(Math.random()*100)
			// 	};
			// }

			function resetData(){
				// Scope.name = '';
				// Scope.cmis = '';
			}
		

			Scope.changeUser = function(id){
				console.log(1);
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
					id : Root.nowStudent.cid,
					name : Root.nowStudent.name,
					grade : Root.nowStudent.grade,
					class : Root.nowStudent.class,
					pid : 1000,
					sex : Root.nowStudent.sex
				}
				Student.createStudent({
					student : JSON.stringify(param)
				});

			}

			Root.$on(CMD_SET_QUOTA,function(e,d){
				console.log(d.id,d.num);
			});


			Student.getStudentList();
			Student.getStudentInfo();

		}
	]);
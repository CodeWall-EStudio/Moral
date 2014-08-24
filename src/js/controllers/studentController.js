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
			var url = Location.absUrl();

			console.log('skey',Util.cookie.get('skey'),Util.cookie.get('role'));
			if(url.indexOf('student.html') > 0 && Util.cookie.get('role') !== 'student'){
				// window.location.href="/student/login";
				// return;
			}			
			//sm = list 显示学生列表
			//sm = info 显示学生个人资料
			//sm = recode 显示自评说明

			//Scope.SelectdGrade = {};
			//Scope.SelectdClass = {};

			Root.myInfo = {};
			Root.studentTerm = false;

			var userList = {};
			var gradeList = [];

			Root.rStudent = {};
			Root.studentList = {};
			Root.nowStudent = {};

			Scope.order = {
				name : 1,
				id : 0,
				sex : 0,
				grade : 0,
				class : 0,
				score : 0
			};

			function resetData(){
				// Scope.name = '';
				// Scope.cmis = '';
			}

			Root.changeStudent = function(id){
				Root.nowStudent = {};
				var st = Root.studentList[id];
				$.extend(Root.nowStudent,st);				
			}
		
			Root.selectStudent = function(id){
				Root.nowStudent = {};
				var st = Root.studentList[id];
				$.extend(Root.nowStudent,st);
				Root.nowStudent.total = {};
				Root.nowStudent.score = {};
				var param = {
					term : Root.Term._id,
					student : Root.nowStudent._id,
					month : Root.nowMonth
				}
				Student.getScore(param);
				Root.$emit('status.student.change',true);
			}

			Scope.resetStudent = function(){
				Root.nowStudent = {};
			}

			Scope.createUser = function(){
				//resetData();
				Root.nowStudent = {};
				$('#userZone .div-form').show();
			}	

			Scope.saveStudent = function(){
				 //student: {"id":"230126200703240579","name":"白益昊","number":"0108021141901019","grade":1,"class":1,"pid":22709,"sex":1}
				//Root.nowStudent.grade = Scope.SelectdGrade.id;
				//Root.nowStudent.class = Scope.SelectdClass.id;

				var param = {
					number : Root.nowStudent.number,
					name : Root.nowStudent.name,
					id : Root.nowStudent.id,
					grade : Root.nowStudent.grade,
					class : Root.nowStudent.class,
					pid : 1000,
					sex : Root.nowStudent.sex,
					_id : Root.nowStudent._id
				}
				Student.createStudent({
					student : JSON.stringify(param)
				});

			}

			Root.hasStudent = function(){
				return !$.isEmptyObject(Root.nowStudent);
			}

			Root.orderStudent = function(type){
				Scope.order[type] = Scope.order[type]?0:1;
				Student.orderByStudent(type,Scope.order[type]);
			}

			Root.returnStudentList = function(){
				Root.nowStudent = {};
			}

			Root.$on(CMD_SET_QUOTA,function(e,d){
				//console.log(d.id,d.num);
			});		
			
			var url = Location.absUrl();
			var fn = function(){};
			if(url.indexOf('student.html') > 0){
				
				if(!Util.cookie.get('skey')){
					// window.location.href="/student/login";
					// return;
				}				
				Student.getStudentInfo(null,function(d){
					if(d.code !== 0){
						console.log('拉数据失败');
						Root.studentTerm = false;
//top-nav .scores').remove();
					}
				});
			//如果是老师或管理,需要再把分数拉一下.
			}else{
				fn = function(data){
					Root.$emit('status.student.loaded',true);
				}
				Student.getStudentList(null,fn);
			}


		}
	]);
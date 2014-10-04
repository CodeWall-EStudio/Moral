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
			//$.cookie('test-month',null);

			//console.log('skey',Util.cookie.get('skey'),Util.cookie.get('role'));
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
			Root.studentMap = {};
			Root.studentMonth = 0;
			Root.firstMonth = {};

			var userList = {};
			var gradeList = [];

			Root.rStudent = {};
			Root.studentList = {};
			Root.studentMap = {};
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

			Root.selectStudentMonth = function(id){
				if(id >= Root.myInfo.defMonth && !(Root.myInfo.defMonth < 2 && id > 9)){
					return;
				}				
				// var first = Root.myInfo.term.months[0];
				// console.log(id,first.s);
				// if(id>first.s){
					Root.studentMonth = id;	
					Root.$emit('status.myinfo.load');
				//}
			}

			Root.changeStudent = function(id){
				Root.nowStudent = {};
				var st = Root.studentMap[id];
				$.extend(Root.nowStudent,st);				
			}
			
			//选中一个学生
			Root.selectStudent = function(id){
				var month = Root.nowMonth;
				if(Root.getMode() === 'record'){
					month = Root.defMonth==1?12:Root.defMonth-1;
				}
				Root.nowStudent = {};
				var st = Root.studentMap[id];
				$.extend(Root.nowStudent,st);
				Root.nowStudent.totals = {};
				Root.nowStudent.score = {};
				Root.nowStudent.nums = {};
				var param = {
					term : Root.Term._id,
					student : Root.nowStudent._id,
					month : month
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

			Root.orderStudentScore = function(type){
				if(Root.Teacher.authority<3){
					return;
				}
				Scope.order['score'] = Scope.order['score']?0:1;
				Student.orderByStudentScore(Scope.order['score']);
			}			

			Root.returnStudentList = function(){
				Root.nowStudent = {};
			}

			Root.$on(CMD_SET_QUOTA,function(e,d){
				//console.log(d.id,d.num);
			});		

			Root.$on('status.month.change',function(){
				if(Root.nowStudent && Root.nowStudent._id){
					var month = Root.nowMonth;

					if(!Root.nowStudent.score[month]){
						var param = {
							term : Root.Term._id,
							student : Root.nowStudent._id,
							month : month
						}
						Student.getScore(param);
						Root.$emit('status.student.change',true);	
					}
				
				}
			});			

			Root.$on('status.quota.load',function(e,d){
				if(!$.isEmptyObject(Root.myInfo)){
					var param = {
						term : Root.myInfo.term._id,
						month : Root.nowMonth,
						student : Root.myInfo._id
					}
					//Student.getScore(param);
				}
			});

			//老师页.等有学期之后再拉.
			Root.$on('status.term.load.student',function(){
				fn = function(data){
					Root.$emit('status.student.loaded',true);
				}
				Student.getStudentList({
					term : Root.Term._id
				},fn);
			});		

			//学生页,直接拉
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
					}
				});
			}

		}
	]);
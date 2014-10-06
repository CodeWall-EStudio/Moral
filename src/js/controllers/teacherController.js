angular.module('dy.controllers.teacher',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.teacher',	
        'dy.services.student',
        'dy.services.quota'
	])
	.controller('teacherController',[
		'$rootScope', '$scope','$location','Util','mGradeService','teacherService','studentService','quotaService',function(Root,Scope,Location,Util,Mgrade,Teacher,Student,Quota){
			console.log('load teachercontroller');
			//$.cookie('test-month',null);

			if(Util.cookie.get('role') !== 'teacher'){
				window.location.href="/teacher/login";
				return;
			}

			if(Root.isManage){
				//return;
			}

			Root.nowDate = new Date();

			Root.isTeacher = true;
			Root.Teacher = {};
			Root.teacherMap = {};
			Root.teacherList = [];
			Root.teacherAuthList = [];
			Root.teacherGrade = {};

			//Root.defScore = {};

			Root.hadSelf = [];
			Root.hadParent = [];
			Root.hadTeacher = [];
			Root.hadList = [];
			Root.noSelf = 0;
			Root.noParent = 0;
			Root.noTeacher = 0;
			Root.panelTit = '';

			Root.getScoreNum = function(){
				var num = 0;
				_.each(Root.nowScore,function(item){
					num++;
				});
				return num;
			}

			Root.getStudentMonth = function(){
				if(Root.getMode() === 'record'){
					return Root.getDefMonth(Root.defMonth);
				}else{
					return Root.nowMonth;
				}
			}

			Root.showNoList = function(type){
				var list;
				switch(type){
					case 'self':
						list = Root.hadSelf;
						Root.panelTit = '未自评学生';
						break;
					case 'parent':
						Root.panelTit = '未家长评价的学生';
						list = Root.hadParent;
						break;
					case 'teacher':
						Root.panelTit = '未老师评价的学生';
						list = Root.hadTeacher;
						break;
				}
				Student.noScore(list);
				$('#noScoreModal').modal('show');
			}

			Root.$on('status.grade.change',function(){
				var param = {
					term : Root.Term._id,
					month : Root.nowMonth
				}
				if(Root.nowGrade !== '所有' && Root.nowGrade){
					param.grade = Root.nowGrade;
				}
				if(Root.nowClass !== '所有' && Root.nowClass){
					param.class = Root.nowClass;	
				}
				Quota.getScores(param);
			});

			Root.$on('status.student.load',function(){
				Student.filterStudentByTeacher();
			});

			//老师资料拉完了.继续拉分数
			Root.$on('status.teacher.load',function(){
				Mgrade.getTermList();				
			});

			Root.$on('status.filter.student',function(){
				var month = 0;
				var mode = Root.getMode();
					month = Root.nowMonth;
				if(mode === 'record'){
					month = Root.getDefMonth(Root.defMonth);
				}
				var param = {
					term : Root.Term._id,
					month : month//Root.nowMonth==12?1:Root.nowMonth-1
				}				
				if(Root.Teacher.auth >= 2){
					Quota.getScores(param);
					return;
				}
				Quota.getScores(param);
			});

			//学期已经 加载 
			Root.$on('status.term.load.teacher',function(){
				if(Root.Teacher.auth>=2){
					var param = {
						term : Root.Term._id
					}
					Teacher.getTeacherList(param);
					Teacher.getTeacherAuth();
				}
				var param = {
					term : Root.Term._id,
					month : Root.nowMonth
				}
				//
			});	

			var url = Location.absUrl();
			var fn = function(){};
			if(url.indexOf('teacher.html') > 0){
				Root.teacherPage = true;
				Teacher.getTeacherInfo();
			}
			
			//Student.getStudentList();
		}
	]);
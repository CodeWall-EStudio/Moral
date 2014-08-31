angular.module('dy.controllers.managehandernav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student',
        'dy.services.teacher',
	])
	.controller('mHeaderNavController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService','teacherService',function(Root,Scope,Location,Util,Mgrade,Student,Teacher){
			console.log('load mheadercontroller');
			var gradeList = [];
			var classList = [];
			

			for(var i = 0;i<6;i++){
				gradeList.push(i+1);
			}

			for(var i = 0;i<15;i++){
				classList.push(i+1);
			}	

			Root.nowGrade = '所有';
			Root.nowClass = '所有';
			// Root.nowGrade = 1;
			// Root.nowClass = 1;

			Root.nowMonth = new Date().getMonth()+1;
			Root.nowDay = 0;
			Scope.searchKeyWord = '';

			//Root.termList = {};
			Root.gradeList = gradeList;
			Root.classList = classList;

			Scope.selectTerm = function(id){
				Root.Term = Root.termList[id];
				changeScore();
			}
			
			//变更年级
			Scope.changeGrade = function(id){
				Root.nowGrade = id || '所有';
				Student.filterStudent(Root.nowGrade,Root.nowClass);
				Teacher.filterTeacher(Root.nowGrade,Root.nowClass);
				changeScore();
			}

			//变更班级
			Scope.changeClass = function(id){
				Root.nowClass = id || '所有';
				Student.filterStudent(Root.nowGrade,Root.nowClass);
				Teacher.filterTeacher(Root.nowGrade,Root.nowClass);
				changeScore();
			}

			Scope.selectMonth = function(month){
				Root.nowMonth = month;
				changeScore();				
			};

			//变更年级
			Scope.changeGradeTeacher = function(id){
				Root.nowGrade = id || '所有';
			}

			//变更班级
			Scope.changeClassTeacher = function(id){
				Root.nowClass = id || '所有';
			}	

			function changeScore(){
			}		

			//搜索
			Scope.startSearch = function(e,d){
				Student.searchStudent(Scope.searchKeyWord);
			}

			Scope.getNowMonth = function(){
				return new Date().getMonth();
			}

			var url = Location.absUrl();
			var fn = function(){};

			Root.$on('status.term.load.mh',function(){
				var obj = {
					term : Root.Term._id
				}				
				var tid,grade,cls,month;
				if(Root.nowGrade !== '所有'){
					obj.grade = Root.nowGrade;
				}
				if(Root.nowClass !== '所有'){
					obj.class = Root.nowClass;
				}
				if(Root.nowMonth){
					obj.month = Root.month;
				}
				Student.getScore(obj);
			});

			if(url.indexOf('teacher.html') > 0){
				//Mgrade.getTermList();
			}
			//
		}
	]);
angular.module('dy.controllers.managehandernav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'
	])
	.controller('mHeaderNavController',[
		'$rootScope', '$scope','Util','mGradeService','studentService',function(Root,Scope,Util,Mgrade,Student){
			console.log('load mheadercontroller');
			var gradeList = [];
			var classList = [];
			

			for(var i = 0;i<6;i++){
				gradeList.push({
					name : (i+1)+'年级',
					id :　i+1
				});
			}

			for(var i = 0;i<15;i++){
				classList.push({
					name : (i+1)+'班级',
					id :　i+1
				});
			}	

			Root.nowGrade = 1;
			Root.nowClass = 1;
			Root.nowMonth = 0;
			Scope.searchKeyWord = '';

			Root.termList = {};
			Root.gradeList = gradeList;
			Root.classList = classList;

			Scope.selectTerm = function(id){
				Root.Term = Root.termList[id];
			}
			
			//变更年级
			Scope.changeGrade = function(id){
				Root.nowGrade = id;
				Student.selectGrade(id);
			}

			//变更班级
			Scope.changeClass = function(id){
				Root.nowClass = id;
				Student.selectClass(id);
			}

			//搜索
			Scope.startSearch = function(e,d){
				Student.searchStudent(Scope.searchKeyWord);
			}

			Scope.getNowMonth = function(){
				return new Date().getMonth();
			}

			Scope.selectMonth = function(month){
				Root.nowMonth = month;
			};

			Mgrade.getTermList();
		}
	]);
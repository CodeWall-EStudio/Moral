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
			var keyword = '';
			

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

			Root.termList = {};
			Root.gradeList = gradeList;
			Root.classList = classList;


			// Scope.keyword = keyword;
			

			//变更年级
			Scope.changeGrade = function(id){
				Root.nowGrade = id;
				Student.selectGrade(id);
			}

			//变更班级
			Scope.changeClass = function(id){
				console.log(i);
				Root.nowClass = id;
				Student.selectClass(id);
			}

			//搜索
			Scope.startSearch = function(e,d){
				console.log(e,d);
			}

			Mgrade.getTermList();
		}
	]);
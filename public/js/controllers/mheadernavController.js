angular.module('dy.controllers.managehandernav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'	
	])
	.controller('mHeaderNavController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			console.log('load mheadercontroller');
			var gradeList = [];
			var classList = [];
			var keyword = '';
			

			for(var i = 0;i<6;i++){
				gradeList.push({
					name : (i+1)+'年级',
					id :　i
				});
			}

			for(var i = 0;i<15;i++){
				classList.push({
					name : (i+1)+'班级',
					id :　i
				});
			}	



			Root.gradeList = gradeList;
			Root.classList = classList;
			Root.termList = {};
			// Scope.keyword = keyword;
			

			//变更年级
			Scope.changeGrade = function(id){
				console.log(id);
			}

			//变更班级
			Scope.changeClass = function(id){

			}

			//搜索
			Scope.startSearch = function(e,d){
				console.log(e,d);
			}

			Mgrade.getTermList();
		}
	]);
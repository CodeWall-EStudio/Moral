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
			

			for(var i = 0;i<4;i++){
				gradeList.push({
					name : '年级'+i,
					id :　i
				});
			}

			for(var i = 0;i<4;i++){
				classList.push({
					name : '班级'+i,
					id :　i
				});
			}	



			Scope.gradeList = gradeList;
			Scope.classList = classList;
			Scope.keyword = keyword;
			

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


			Mgrade.getGradeList();
		}
	]);
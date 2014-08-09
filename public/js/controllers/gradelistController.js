angular.module('dy.controllers.mgradelist',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'	
	])
	.controller('mgradelistController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			Root.gradeList = {};
			Root.termList = {}; //年级

			Root.nowGrade = {
				name : 'test garde',
				id : 1
			};
			Root.nowTerm = {
				name : 'test term',
				id : 1,
				month : [8,9,10,11,12]
			};	
			Root.nowClass = {
				name : 'test 班级',
				id : 1
			}

			var termList = {};
			var gradeList = {};
			var classList = {};
			for(var i = 0;i<7;i++){
				gradeList[i] = {
					name : '年级'+i,
					id :　i
				};
			}
			for(var i = 0;i<4;i++){
				classList[i] = {
					name : '班级'+i,
					id :　i
				};
			}
			for(var i = 0;i<7;i++){
				gradeList[i] = {
					name : '年级'+i,
					id :　i
				};
			}			
			Root.gradeList = gradeList;	
			Root.termList = termList;	
			Root.classList = classList;	

			Root.showGrade = function(){

			}

			Root.setActiveGrade = function(){

			}

			Root.closeGrade = function(){

			}

			Scope.selectTerm = function(id){
				Root.nowTerm = Root.termList[id];
			}

			Scope.selectGrade = function(id){
				Root.nowGrade = Root.gradeList[id];
			}

			Scope.selectMonth = function(id){
				console.log(id);
			}
		}
	]);

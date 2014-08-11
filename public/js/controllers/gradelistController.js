angular.module('dy.controllers.mgradelist',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'	
	])
	.controller('mgradelistController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			Root.gradeList = {};

			Root.showGrade = function(){

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

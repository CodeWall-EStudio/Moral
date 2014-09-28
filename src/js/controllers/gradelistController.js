angular.module('dy.controllers.mgradelist',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'
	])
	.controller('mgradelistController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			console.log('load mgradelistcontroller')
			Root.termList = {};
			Root.Term = {};
			Root.nowTerm = {};

			Root.showGrade = function(id){
				Root.Term = Root.termList[id];
				Root.$emit('status.grade.change',id);

				Root.$emit('status.term.load.mh');
				Root.$emit('status.term.load.teacher');
				Root.$emit('status.term.load.student');
				Root.$emit('status.term.load.quota');				
			}

			Scope.selectTerm = function(id){
				//Root.nowTerm = Root.termList[id];
			}

			Scope.selectGrade = function(id){
				//Root.nowGrade = Root.gradeList[id];
			}

			Scope.selectMonth = function(id){
				console.log(id);
			}

			//Mgrade.getTermList();
		}
	]);

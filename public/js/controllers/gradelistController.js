angular.module('dy.controllers.mgradelist',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'	
	])
	.controller('mgradelistController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			Root.grade = {};


			Root.showGrade = function(){

			}

			Root.setActiveGrade = function(){

			}

			Root.closeGrade = function(){

			}


		}
	]);
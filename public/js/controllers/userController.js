angular.module('dy.controllers.user',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.user'	
	])
	.controller('userController',[
		'$rootScope', '$scope','Util','mGradeService','userService',function(Root,Scope,Util,Mgrade,User){
			console.log('load usercontroller');

			var userList = [];
			var gradeList = [];

			for(var i = 0;i<10;i++){
				userList.push({
					name : '姓名'+i,
					cid : i,
					sex : '男',
					grade : 1,
					class : 1
				});
			}

			function resetData(){
				Scope.name = '';
				Scope.cmis = '';
			}

			Scope.userList = userList;

			Scope.changeUser = function(){
				console.log(1);
			}	

			Scope.createUser = function(){
				resetData();
				$('#userZone .div-form').show();
			}	

			Scope.saveUser = function(){
				$('#userZone .div-form').hide();
			}

		}
	]);
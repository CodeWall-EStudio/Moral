angular.module('dy.controllers.quota',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.quota'	
	])
	.controller('quotaController',[
		'$rootScope', '$scope','Util','mGradeService','quotaService',function(Root,Scope,Util,Mgrade,Quota){
			console.log('load quotacontroller');

			var userList = [];

			for(var i = 0;i<10;i++){
				userList.push({
					name : '姓名'+i,
					cid : i,
					sex : '男',
					grade : 1,
					class : 1
				});
			}

			Scope.userList = userList;

			Scope.changeUser = function(){
				console.log(1);
			}		

		}
	]);
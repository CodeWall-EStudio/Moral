angular.module('dy.controllers.student',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'	
	])
	.controller('studentController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService','CMD_SET_QUOTA',
			function(Root,Scope,Location,Util,Mgrade,User,CMD_SET_QUOTA){
			console.log('load studentcontroller');
			//sm = list 显示学生列表
			//sm = info 显示学生个人资料
			//sm = recode 显示自评说明

			var userList = {};
			var gradeList = [];

			for(var i = 0;i<10;i++){
				userList[i] = {
					name : '姓名'+i,
					nick : '昵称'+i,
					cid : i,
					sex : '男',
					grade : 1,
					class : Math.round(Math.random()*10),
					record : Math.round(Math.random()*100)
				};
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

			Root.$on(CMD_SET_QUOTA,function(e,d){
				console.log(d.id,d.num);
			});

		}
	]);
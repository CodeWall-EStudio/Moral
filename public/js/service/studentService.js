angular.module('dy.services.student', [
        'dy.constants',
        'dy.services.utils'	
	])
	.service('studentService', [
		'$rootScope','$location','$http','Util',function(Root,location,Http,Util){

			var cgi = {
				gradelist : '', //拉学期列表
				creategrade : '', //创建学期
				onegrade : ''     //一个学期的信息
			};

			//拉学生列表
			function getUserList(param,success,error){

			};

			//拉学生个人信息
			function getUserInfo(param,success,error){

				// $http.get(BACKEND_SERVER + '/studentInfo', {responseType:'json', params:params})
				// 	.success(function(data,status){

				// 	})
				// 	.error(function(data,status){

				// 	});
				// console.log(12345);
				Root.User = {
				    id: 'dsgi3252436k;l143245',
				    name: '测试学生',
				    number: 50,   //学生证号码
				    grade:  1,  
				    class: 2,
				    pid:   30,    //没用到
				    sex: 1
				}
			};

			function getUser(){
				return Root.User;
			}

			return {
				getUserList : getUserList,
				getUserInfo : getUserInfo,
				getUser : getUser
			}

		}
	]);
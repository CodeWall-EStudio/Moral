angular.module('dy.services.login', [
        'dy.constants',
        'dy.services.utils'	
	])
	.service('Login', [
		'$rootScope','$location','$http','Util',function(Root,location,Http,Util){


			//拉学生列表
			function studentLogin(param,success,error){
				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(param);
				Http.get('/student/login?_='+ts,
					body,
					{
						responseType:'json',
						headers: {'Content-Type': 'application/x-www-form-urlencoded'}
					})
					.success(function(data,status){
						console.log('学生登录成功!', data);
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});
			};

			return {
				studentLogin : studentLogin
			}

		}
	]);
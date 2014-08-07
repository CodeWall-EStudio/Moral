angular.module('dy.services.teacherlogin',[
        'dy.constants',
        'dy.services.utils'	
	])
	.service('tLoginServer', [
		'$rootScope', '$http','Util',
		function($rootScope,$http,util){

			var url = 'http://dand.71xiaoxue.com:80/sso.web/validate?service=http://t1.codewalle.com/teacherlogin.html&ticket=';

			console.log(url);

			function getTeacher(param,success,error){
				var turl = url + param;
                $http.get(turl, {responseType:'json'})
                    .success(function(data, status){
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                        console.error('[ActivityService] FAIL TO FETCH ACTIVITY CONFIGURATIONS');
                        if(error) error(data, status);
                    });
			}

			/**/
			return {
				getTeacher : getTeacher
			}

		}
	]);
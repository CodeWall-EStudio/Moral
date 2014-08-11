angular.module('dy.services.mgrade', [
        'dy.constants',
        'dy.services.utils'	
	])
	.service('mGradeService', [
		'$rootScope','$location','$http','Util',function(Root,location,Http,Util){

			var cgi = {
				gradelist : '', //拉学期列表
				creategrade : '', //创建学期
				onegrade : ''     //一个学期的信息
			};

			function getGradeList(param,success,error){

			};


			function createTerm(param,success,error){
				var ts = new Date().getTime();

				var body = Util.object.toUrlencodedString(param);
				console.log(param,body);
				Http.post('/teacher/term?_=' + ts,
                        param,
                        {
                            responseType: 'json',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }					
					)
                    .success(function(data, status){
                        console.log('[mGradeService] term config =', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                        console.error('[ActivityService] FAIL TO FETCH ACTIVITY CONFIGURATIONS');
                        if(error) error(data, status);
                    });				
			}

			function modifyTerm(param,success,error){
				
			}			


			return {
				getGradeList : getGradeList,
				createTerm : createTerm,
				modifyTerm : modifyTerm
			}

		}
	]);


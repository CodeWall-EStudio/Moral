angular.module('dy.services.teacher', [
        'dy.constants',
        'dy.services.utils'	
	])
	.service('teacherService', [
		'$rootScope','$location','$http','Util',function(Root,location,Http,Util){

			function getTeacherInfo(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						Root.Teacher = data.teacher.info;
						//conventStudent(data.student);
						console.log('拉老师资料成功!', data,Root.Teacher);
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});
			}


			return {
				getTeacherInfo : getTeacherInfo
			}

		}
	]);
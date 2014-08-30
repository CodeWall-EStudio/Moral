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
						console.log('拉老师资料成功!', data);
						//老师资料加载完成
						Root.$emit('status.teacher.load');
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});
			}

			function getTeacherList(param,success,error){
				Http.get('/teacher?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						Root.Teacher = data.teacher.info
						Root.Teacher.grade = data.relationship[0].grade;
						Root.Teacher.class = data.relationship[0].class;
						console.log(Root.Teacher);
						console.log('拉老师列表成功! ', data);
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});				
			}


			return {
				getTeacherInfo : getTeacherInfo,
				getTeacherList : getTeacherList
			}

		}
	]);
angular.module('dy.services.teacher', [
        'dy.constants',
        'dy.services.utils'	
	])
	.service('teacherService', [
		'$rootScope','$location','$http','Util',function(Root,location,Http,Util){

			function convertTeacher(list){

			}

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
				var ts = new Date().getTime();
				Http.get('/teacher/teacherlist?_='+ts,{responseType:'json',params:param})
					.success(function(data,status){
						if(data.code === 0){
							Root.teacherList = data.teacher;
							convertTeacher(data.teacher);
							console.log('拉老师列表成功!', data);
						}else{
							Root.$emit('msg.codeshow',data.code);
						}
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});				
			};


			return {
				getTeacherInfo : getTeacherInfo,
				getTeacherList : getTeacherList
			}

		}
	]);
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

			return {
				getGradeList : getGradeList
			}

		}
	]);
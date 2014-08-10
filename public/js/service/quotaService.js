angular.module('dy.services.quota', [
        'dy.constants',
        'dy.services.utils'	
	])
	.service('quotaService', [
		'$rootScope','$location','$http','Util',function(Root,location,Http,Util){

			var cgi = {
				gradelist : '', //拉学期列表
				creategrade : '', //创建学期
				onegrade : ''     //一个学期的信息
			};

			function getQuotaList(param,success,error){
				var quotaList = {};

				for(var i = 0;i<10;i++){
					length++;
/*
    order: Number,
    name:  String,
    score:   Number,
    desc: String,
    term: String
*/					
					quotaList[i+100] = {
						id : i+100,
						name : '指标'+i,
						no : i,
						now : 0,
						desc : '指标说明说明说明说明说明说明说明说明说明说明'
					};
				}				
				Root.quotaList = quotaList;
			};

			function getStudentQuota(param,success,error){


			}


			return {
				getQuotaList : getQuotaList
			}

		}
	]);
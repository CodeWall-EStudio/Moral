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

			function conventQuota(data){
				if(!Root.quotaList){
					Root.quotaList = {};
				}
				for(var i in data){
					data[i].id = data[i]._id;
					Root.quotaList[data[i]._id] = data[i];
				}
			}

			function getQuotaList(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher/indicator?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						conventQuota(data.indicator);
						console.log('拉指标列表成功!', data);
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});				
			};

			function getStudentQuota(param,success,error){

			};

			function createQuota(param,success,error){
				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(param);
				Http.post('/teacher/indicator?_=' + ts,
                        body,
                        {
                            responseType: 'json',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }					
					)
                    .success(function(data, status){
                    	if(data.error === 'ok' || data.error === 0){
                    		if(!Root.quotaList){
                    			Root.quotaList = {};
                    		}
                    		//Root.quotaList.push(param.term);
                    	}
                        console.log('[quotaService] quota crate suc =', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                        if(error) error(data, status);
                    });				
			};

			function modifyQuota(param,success,error){

			}


			return {
				getQuotaList : getQuotaList,
				createQuota : createQuota,
				modifyQuota : modifyQuota
			}

		}
	]);
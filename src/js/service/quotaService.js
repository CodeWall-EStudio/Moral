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
				//if(!Root.quotaList){
					Root.quotaList = {};
				//}
				Root.defScore = {};
				for(var i in data){
					data[i].id = data[i]._id;
					Root.defScore[data[i]._id] = {
						self : 0,
						parent : 0,
						teacher: 0
					};
					Root.quotaList[data[i]._id] = data[i];
				}
			}

			function getQuotaList(params,success,error){
				var ts = new Date().getTime();
				params = params || {};
				Http.get('/teacher/indicator?_='+ts,{responseType:'json',params:params})
					.success(function(data,status){
						if(data.code === 0){
							conventQuota(data.indicator);
							console.log('拉指标列表成功!', data);
						}else{
                            Root.$emit('msg.codeshow',data.code);
                        }
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
                        Root.$emit('msg.codeshow',data.code);
                    	if(data.code === 0){
                    		if(!Root.quotaList){
                    			Root.quotaList = {};
                    		}
                    		var d = JSON.parse(param.indicator);
                    		d._id = data.id;
                    		Root.quotaList[data.id] = d;
                    		Root.nowQuota = {};
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
				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(param);
				Http.post('/teacher/indicator/modify?_=' + ts,
                        body,
                        {
                            responseType: 'json',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }					
					)
                    .success(function(data, status){
                        Root.$emit('msg.codeshow',data.code);
                    	if(data.code === 0){
                    		if(!Root.quotaList){
                    			Root.quotaList = {};
                    		}
                    		var d = JSON.parse(param.indicator);
                    		console.log(d,data.id);
                    		d._id = data.id;
                    		Root.quotaList[data.id] = d;
                    		Root.nowQuota = {};
                    		//Root.quotaList.push(param.term);
                    	}
                        console.log('[quotaService] quota modify suc =', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                        if(error) error(data, status);
                    });
			}

			function saveStudentQuota(param,success,error){
				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(param);
				Http.post('/teacher/score?_=' + ts,
                        body,
                        {
                            responseType: 'json',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }					
					)
                    .success(function(data, status){
                        Root.$emit('msg.codeshow',data.code);
                    	if(data.code === 0){
                    		param._id = data.id;
                    		//Root.quotaList[data.id] = param;
                    		Root.nowQuota = {};
                    		//Root.quotaList.push(param.term);
                    	}
                        console.log('[quotaService] quota crate suc =', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                        if(error) error(data, status);
                    });					
			} 

			function delQuota(params,success,error){
				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(params);
				Http.post('/teacher/indicator/delete?_=' + ts,
                        body,
                        {
                            responseType: 'json',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }					
					)
                    .success(function(data, status){
                        Root.$emit('msg.codeshow',data.code);
                    	if(data.code === 0){
                    		delete Root.quotaList[params.id];
                    		Root.nowQuota = {};
                    		//Root.quotaList.push(param.term);
                    	}

                        console.log('[quotaService] quota delete suc =', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                        if(error) error(data, status);
                    });	
			}

            function orderByQuota(type,order){
                var sort = _.sortBy(Root.quotaList,function(item){
                    if(order){
                        return -item[type];
                    }else{
                        return +item[type];
                    }
                });
                Root.quotaList = sort;
            }


			return {
				getQuotaList : getQuotaList,
				createQuota : createQuota,
				modifyQuota : modifyQuota,
				saveStudentQuota : saveStudentQuota,
				delQuota : delQuota,
                orderByQuota : orderByQuota
			}

		}
	]);
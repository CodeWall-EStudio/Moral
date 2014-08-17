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

			function conventTerm(data){
				if(!Root.termList){
					Root.termList = {};
				}
				if(!Root.Term){
					Root.Term = {};
				}
				var first = false;
				var no = 0;
				for(var i in data){
					data[i].id = data[i]._id;
					Root.termList[data[i]._id] = data[i];
					if(data[i].active && !first){
						first = true;
						no = i;
					}
				}
				if(data[no]){
					Root.Term = data[no];
				}
			}

			function getTermList(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher/term?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						conventTerm(data.term);
						console.log('拉学期列表成功!', data);
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});
			};			


			function createTerm(param,success,error){
				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(param);
				Http.post('/teacher/term?_=' + ts,
                        body,
                        {
                            responseType: 'json',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }					
					)
                    .success(function(data, status){
                    	if(data.code === 0){
                    		var tdata = JSON.parse(param.term);
                    		tdata._id = data.id;
                    		Root.termList[data.id] = tdata;
                    		if(Root.Term._id === data.id){
                    			Root.Term = tdata;
                    		}
                    	}
                        console.log('[mGradeService] term config =', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                    	//需要加上失败的逻辑
                        if(error) error(data, status);
                    });				
			}


			function modifyTerm(param,success,error){
				console.log('modify term');
				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(param);
				Http.post('/teacher/term/modify?_=' + ts,
                        body,
                        {
                            responseType: 'json',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }					
					)
                    .success(function(data, status){
                    	if(data.code === 0){
                    		param._id = data.id;
                    		Root.termList[data.id] = param;
                    	}
                        console.log('[mGradeService] term config =', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                    	//需要加上失败的逻辑
                        if(error) error(data, status);
                    });					
			}		

			function changeTermAct(id){
				_.map(Root.termList,function(item){
					if(item._id !== id){
						item.active = false;
					}
				});
			}

			//激活学期
			function setActTerm(param,success,error){
				console.log('modify term');
				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(param);
				Http.post('/teacher/term/setact?_=' + ts,
                        body,
                        {
                            responseType: 'json',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }					
					)
                    .success(function(data, status){
						var d = Root.termList[param.id];
                    	if(data.code === 0){
                    		d.active = param.active;
                    		if(d.active){
                    			changeTermAct(param.id);
                    		}
                    	}else{
                    		d.active = param.active?false:true;
                    	}
                    	Root.termList[param.id] = d;
                        console.log('[mGradeService] term set act config =', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                    	//需要加上失败的逻辑
                        if(error) error(data, status);
                    });					
			}	


			return {
				getTermList : getTermList,
				createTerm : createTerm,
				modifyTerm : modifyTerm,
				setActTerm : setActTerm
			}

		}
	]);


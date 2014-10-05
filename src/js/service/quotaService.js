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
					Root.quotaList = [];
                    Root.quotaMap = {};
				//}
				Root.defScore = {};
                Root.quotaList = data;
				for(var i in data){
					data[i].id = data[i]._id;
					Root.defScore[data[i]._id] = {
						self : 0,
						parent : 0,
						teacher: 0
					};
                    var obj = {};
                    _.extend(obj,data[i]);
					//Root.quotaList[data[i]._id] = data[i];
                    Root.quotaMap[obj._id] = obj;
				}
                orderByQuota('order');
			}

            //去指标列表
			function getQuotaList(params,success,error){
				var ts = new Date().getTime();
				params = params || {};
				Http.get('/teacher/indicator?_='+ts,{responseType:'json',params:params})
					.success(function(data,status){
						if(data.code === 0){
							conventQuota(data.indicator);
							console.log('拉指标列表成功!', data);
                            Root.$emit('status.quota.load',data.code);
						}else{
                            Root.$emit('msg.codeshow',data.code);
                        }
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});				
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
                    		Root.quotaMap[data.id] = d;
                            Root.quotaList.push(d);
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

            function updateQuota(obj){
                _.each(Root.quotaList,function(item){
                    if(item._id === obj._id){
                        _.extend(item,obj);
                    }
                });
            }

            //修改指标
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
                    		d._id = data.id;
                            Root.quotaMap[data.id] = d;
                            updateQuota(d);
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

            function updateStudentData(param){
                var pd = JSON.parse(param.score);
                var obj = pd.scores;
                //学生
                if(Root.myInfo._id){
                    var ot = Root.myInfo.total[pd.month] || 0;
                    Root.myInfo.total[pd.month] = pd.total;
                    Root.myInfo.total[0] += pd.total - ot;
                    _.each(obj,function(item){
                        if(!Root.myInfo.score[pd.month]){
                            Root.myInfo.score[pd.month] = {};
                        }
                        if(!Root.myInfo.score[pd.month][item.indicator]){
                            Root.myInfo.score[pd.month][item.indicator] = {
                                self : 0,
                                parent : 0,
                                teacher : 0
                            }
                        }
                        var os = Root.myInfo.score[pd.month][item.indicator].self || 0,
                            op = Root.myInfo.score[pd.month][item.indicator].parent || 0,
                            ott = Root.myInfo.score[pd.month][item.indicator].teacher || 0;
                        Root.myInfo.score[pd.month][item.indicator] = {
                            self : item.self,
                            teacher : item.teacher,
                            parent : item.parent
                        }
                        if(!Root.myInfo.score[0][item.indicator]){
                            Root.myInfo.score[0][item.indicator] = {
                                self : item.self,
                                parent : item.parent,
                                teacher : item.teacher
                            };

                        }else{
                            Root.myInfo.score[0][item.indicator].self += item.self - os;
                            Root.myInfo.score[0][item.indicator].parent += item.parent - op;
                            Root.myInfo.score[0][item.indicator].teacher += item.teacher - ott;                            
                        }
                    });
                                        //console.log(Root.myInfo);

                //老师
                }else{
                    var ot = Root.studentMap[pd.student].total;
                    //Root.studentMap[pd.student].total = pd.total;
                    if(!Root.studentMap[pd.student].totals[pd.month]){
                        Root.studentMap[pd.student].totals[pd.month] = pd.total;
                    }else{
                        Root.studentMap[pd.student].totals[pd.month] = pd.total;
                    }
                    Root.studentMap[0] += pd.total - ot;
                    var num = 0;
                    _.each(obj.scores,function(item){
                        num++;
                        if(!Root.studentMap[pd.student].score[pd.month]){
                            Root.studentMap[pd.student].score[pd.month] = {};
                        }
                        if(!Root.studentMap[pd.student].score[pd.month][item.indicator]){
                            Root.studentMap[pd.student].score[pd.month][item.indicator] = {
                                self : 0,
                                parent : 0,
                                teacher : 0
                            }
                        }
                        var os = Root.studentMap[pd.student].score[pd.month][item.indicator].self || 0,
                            op = Root.studentMap[pd.student].score[pd.month][item.indicator].parent || 0,
                            ott = Root.studentMap[pd.student].score[pd.month][item.indicator].teacher || 0;


                        Root.studentMap[pd.student].score[pd.month][item.indicator] = {
                            self : item.self,
                            teacher : item.teacher,
                            parent : item.parent
                        }
                        if(!Root.studentMap[pd.student].score[0]){
                            Root.studentMap[pd.student].score[0] = {};
                        }
                        if(!Root.studentMap[pd.student][0][item.indicator]){
                            Root.studentMap[pd.student][0][item.indicator] = {
                                self : item.self,
                                parent : item.parent,
                                teacher : item.teacher
                            };

                        }else{
                            Root.studentMap[pd.student].score[0][item.indicator].self += item.self - os;
                            Root.studentMap[pd.student].score[0][item.indicator].parent += item.parent - op;
                            Root.studentMap[pd.student].score[0][item.indicator].teacher += item.teacher - ott;
                        }

                        try{
                            if(!Root.nowStudent.score){
                                Root.nowStudent.score = {};
                            }
                            if(!Root.nowStudent.score[pd.month]){
                                Root.nowStudent.score[pd.month] = {};
                            }     
                        Root.nowStudent.score[pd.month][item.indicator] = {
                            self : item.self,
                            teacher : item.teacher,
                            parent : item.parent
                        }   
                        }catch(e){
                        }                     
                    });  
                    var obj = _.findWhere(Root.studentList,{_id : pd.student});
                    var nobj = {};
                        $.extend(nobj,Root.studentMap[pd.student]);
                        obj = nobj;
                        //obj = Root.studentMap[pd.student];
                    //console.log(Root.studentMap[pd.student],obj);

                }
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
                            //更新分数
                            updateStudentData(param);
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
                    		delete Root.quotaMap[params.id];

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
            //更新学生总分
            function updateStudentScore(item){
                var obj = _.findWhere(Root.studentList,{_id : item.student});
                if(!obj){
                    return;
                }
                if(!obj.totals){
                    obj.totals = {};
                }
                var month = Root.nowMonth;
                if(Root.getMode() === 'record'){
                    month = Root.getDefMonth(Root.defMonth);
                }
                obj.totals[month] = item.total;
            }

            function convertScore(data){
                if(Root.myInfo._id){
                    var max = _.max(data,function(item){
                        return item.total;
                    });
                    Root.myInfo.max[Root.nowMonth] = max.total;
                }else{
                   for(var i in data){
                        if(!Root.studentMap[data[i].student]){
                            delete data[i];
                        }else{
                            updateStudentScore(data[i]);
                        }
                    }
                    
                    var max = _.max(data,function(item){
                        return item.total;
                    });
                    var min = _.min(data,function(item){
                        return item.total;
                    });

                    Root.maxStudent = max;
                    Root.minStudent = min;   

                    if(Root.Teacher.authority === 3){
                        Root.studentList = _.sortBy(Root.studentList,function(item){
                            if(item.totals && item.totals[Root.nowMonth]){
                                return -item.totals[Root.nowMonth];
                            }
                        });
                        _.each(Root.studentList,function(item,idx){
                            if(!item.nos){
                                item.nos = {};
                            }
                            item.nos[Root.nowMonth] = idx+1;
                            $.extend(Root.studentMap[item._id],item);
                        });
                        //console.log(Root.studentList);
                    }
                }

            }

            //拉评分列表
            function getScores(params,success,error){
                var ts = new Date().getTime();
                params = params || {};
                Http.get('/teacher/scores?_='+ts,{responseType:'json',params:params})
                    .success(function(data,status){
                        if(data.code === 0){
                            Root.scoreMap = data.score;
                            getScoreStatus();
                            convertScore(data.score);
                            console.log('拉学生分数列表成功!', data);
                        }else{
                            Root.$emit('msg.codeshow',data.code);
                        }
                        if(success) success(data, status);
                    })
                    .error(function(data,status){
                        if(error) error(data, status);
                    }); 
            }

            function getScoreStatus(){
                Root.studentScoreList = [];                
                _.each(Root.scoreMap,function(item,idx){
                    var otmp = _.find(Root.studentList,function(obj){
                        return obj._id === item.student;
                    });
                    if(otmp){
                        //otmp.totals = item.total;
                        Root.studentScoreList.push(item);
                    }
                });
                Root.scoreStatus = {
                    have : Root.studentScoreList.length
                }

                var th = 0,
                    mh = 0,
                    ph = 0;
                Root.hadTeacher = [];
                Root.hadSelf = [];
                Root.hadParent = [];
                _.each(Root.studentScoreList,function(item){
                    var l = item.scores.length;
                    _.each(item.scores,function(obj){
                        if(obj.teacher){
                            Root.hadTeacher.push(item.student);
                        }
                        if(obj.self){
                            Root.hadSelf.push(item.student);   
                        }
                        if(obj.self){
                            Root.hadParent.push(item.student);   
                        }                        
                    });
                });
                Root.hadTeacher = _.uniq(Root.hadTeacher);
                Root.hadParent = _.uniq(Root.hadParent);
                Root.hadSelf = _.uniq(Root.hadSelf);
                Root.scoreStatus.self = Root.studentList.length - Root.hadSelf.length;
                Root.scoreStatus.parent = Root.studentList.length -  Root.hadParent.length;
                Root.scoreStatus.teacher = Root.studentList.length - Root.hadTeacher.length;
            }


			return {
				getQuotaList : getQuotaList,
				createQuota : createQuota,
				modifyQuota : modifyQuota,
				saveStudentQuota : saveStudentQuota,
				delQuota : delQuota,
                orderByQuota : orderByQuota,
                getScores : getScores
			}

		}
	]);
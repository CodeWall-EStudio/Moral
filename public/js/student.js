angular.module('dy.constants', [])
	.constant('CMD_SAVE_QUOTA','cmd.save.quota')// 保存分数
	.constant('CMD_SET_QUOTA', 'cmd.set.quota');//设置分数
angular.module('dy.services.utils', [])
    .service('Util', [
        function(){
            var api = {
                object: {
                    toUrlencodedString: function(object){
                        return _.map(object, function(value, key){
                            return encodeURIComponent(key) + '=' + encodeURIComponent(value);
                        }).join('&');
                    }
                },
                getParameter : function(name) {
                  var r = new RegExp('(\\?|#|&)' + name + '=([^&#]*)(&|#|$)'), m = location.href.match(r);
                  return decodeURIComponent(!m ? '' : m[2]);
                },
                cookie: {
                    /**
                     * get cookie
                     * @param {String} name
                     * @returns {String} cookie value
                     */
                    get: function(name){
                        var items = document.cookie.split('; '),
                            cookies = _.reduce(items, function(result, item){
                                var kv = item.split('=');
                                result[kv[0]] = kv[1];
                                return result;
                            }, {});
                        //console.log('[UtilsService] cookies=', cookies);
                        return cookies[name];
                    },
                    set : function(name,val,option){
                        var cookieValue = null;
                        if (document.cookie && document.cookie != '') {
                            var cookies = document.cookie.split(';');
                            for (var i = 0; i < cookies.length; i++) {
                                var cookie = $.trim(cookies[i]);
                                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                    break;
                                }
                            }
                        }
                        return cookieValue;                        
                    }
                },
                time: {
                    timezoneOffset: (new Date()).getTimezoneOffset(),

                    /**
                     * convert date into datetime-local input value
                     * @param {Date} [date]
                     * @param {Boolean} [includeSeconds]
                     * @returns {String} 2014-02-22T01:39:00
                     */
                    dateToDatetimePickerValue: function(date, includeSeconds){
                        if(!date) date = new Date();
                        //toISOString 會得出一個中央時區既時間（timezone=0），我地呢度算上時區，最後得出一個本地的時間
                        date.setMinutes(date.getMinutes() - api.time.timezoneOffset);
                        if(!includeSeconds){
                            date.setSeconds(0);
                            date.setMilliseconds(0);
                        }
                        return date.toISOString().split('.')[0];
                    },

                    /**
                     * convert datetime-local input value to timestamp
                     * @param {String} value
                     * @returns {number}
                     */
                    datetimePickerValueToTs: function (value){
                        if(value){
                            var tail = (value.split(':').length < 3) ? ':00.000Z' : '.000Z';
                            var result = Date.parse(value + tail) + api.time.timezoneOffset * 60 * 1000;
                            console.log(value, result, new Date(result));
                            return result;
                        }
                        return 0;
                    }
                }
            };

            return api;
        }
    ]);
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

			//判断是否可以评价
			function checkMonth(month,tm){
				var ret = false;
				_.each(tm,function(item,idx){
					if(month === item.e){
						ret = true;
					}
				});
				//console.log(month);
				//return true;
				return ret;
			}

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
					if(data[i].status === 1 && !first){
						first = true;
						no = i;
					}
				}
				if(data[no]){
					Root.Term = data[no];
					setTimeout(function(){
						Root.$emit('status.term.load.mh');
						Root.$emit('status.term.load.teacher');
						Root.$emit('status.term.load.student');
						Root.$emit('status.term.load.quota');
					},500);

				}

				if(checkMonth(Root.nowMonth,Root.Term.months) && Root.nowDay <= Root.Term.day){
					Root.studentTerm = true;
				}				
			}

			function getTermList(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher/term?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						if(data.code === 0){
							conventTerm(data.term);
							Root.nowMonth = data.nowmonth;
							Root.defMonth = data.nowmonth;
							Root.nowDay = data.day;
							console.log('拉学期列表成功!', data);
						}else{
							Root.$emit('msg.codeshow',data.code);
						}
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
                    	Root.$emit('msg.codeshow',data.code);
                    	Root.$emit('status.grade.created');
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
                    	                    	Root.$emit('status.grade.created');

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
                    	Root.$emit('msg.codeshow',data.code);
                    	Root.$emit('status.grade.created');
                    	if(data.code === 0){
                    		param._id = data.id;
                    		Root.termList[data.id] = param;
                    	}
                        console.log('[mGradeService] term config =', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                    	                    	Root.$emit('status.grade.created');
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
                    	Root.$emit('msg.codeshow',data.code);
                    	Root.$emit('status.grade.created');
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
                    	                    	Root.$emit('status.grade.created');
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


angular.module('dy.services.student', [
        'dy.constants',
        'dy.services.utils'	
	])
	.service('studentService', [
		'$rootScope','$location','$http','Util',function(Root,location,Http,Util){

			var sList = [];
			var sMap = {};
			var defScore = false;//默认的评分

			function conventStudent(data){
				_.each(data,function(item){
					var obj = {};
					_.extend(obj,item);
					Root.studentMap[obj._id] = obj;
				});
			}

			//拉学生列表
			function getStudentList(param,success,error){
				if(window.localStorage.getItem('student')){
					var list  = JSON.parse(window.localStorage.getItem('student'));
					Root.studentList = list;
					sList = JSON.parse(window.localStorage.getItem('student'));
					conventStudent(list);
					//sMap = list;
					console.log('拉缓存学生列表成功!');
					if(success) success(list);
					//return;
				}

				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(param);

				Http.get('/teacher/student?_='+ts+'&term='+param.term,null,{responseType:'json'})
					.success(function(data,status){
						//conventStudent(data.student);
						if(data.code === 0){
							Root.studentList = data.student;
							sList = data.student;
							Root.studentMap = data.studentList;
							window.localStorage.setItem('student',JSON.stringify(sList));
							console.log('拉学生列表成功!', data);
							Root.$emit('status.student.load');
						}else{
							Root.$emit('msg.codeshow',data.code);
						}
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});
			};

			//判断是否可以评价
			function checkMonth(month,tm){
				var ret = false;
				_.each(tm,function(item,idx){
					if(month === item.e){
						ret = true;
					}
				});
				//return true;
				return ret;
			}

			function setZeroMonth(){
				var t = 0;
				var tp = {}
				_.each(Root.myInfo.total,function(item){
					t += item;
				});
				_.each(Root.myInfo.score,function(item){
					_.each(item,function(obj,idx){
						if(!tp[idx]){
							tp[idx] = {
								self : 0,
								parent : 0,
								teacher : 0
							}
						}
						tp[idx].self += obj.self;
						tp[idx].parent += obj.parent;
						tp[idx].teacher += obj.teacher;
					});
				});
				Root.myInfo.score[0] = tp;
				Root.myInfo.total[0] = t;
			}

			//拉学生个人信息
			function getStudentInfo(param,success,error){

				Http.get('/student/essential', {responseType:'json'})
					.success(function(data,status){
						if(data.code === 0){
							Root.myInfo = data.user || {};
							Root.myInfo.score = data.score || [];
							Root.myInfo.total = data.total || 0;
							Root.myInfo.hadscore = data.hadscore;
							Root.myInfo.nowMonth = data.nowmonth;
							Root.myInfo.defMonth = data.nowmonth;

							Root.myInfo.term = data.term;
							Root.myInfo.quota = data.quota;
							Root.myInfo.allscore = 15* data.indicator.length*data.term.months.length;

							var total = 0;
							_.each(data.total,function(item){
								total += item;
							});
							Root.myInfo.totalScore = total;
							Root.myInfo.max = {};
							Root.myInfo.pre = total/Root.myInfo.allscore*100;

							Root.nowMonth = data.nowmonth;
							Root.studentMonth = data.nowmonth;

							Root.nowDay = data.day;
							if(data.term && checkMonth(data.nowmonth,data.term.months) && data.day <= data.term.day){
								Root.studentTerm = true;
							}
							Root.Term = data.term;
							setZeroMonth();
							Root.$emit('status.myinfo.load');
							Root.$emit('status.student.quotacheng');
							console.log('拉取学生资料成功',data);
						}else{
							Root.Term  = false;
							Root.$emit('msg.codeshow',data.code);
						}
						if(success){
							success(data);
						}
					})
					.error(function(data,status){
						console.log(data);
					});
			};


			//转成map
			function convertScore(data){
				var teacher = {},
					parent = {},
					self = {};

				_.map(data,function(data,idx){

				});
			}

			//计算一个月的评分
			function convertOneScore(data){
				if(!data){
					return;
				}
				var tmp = {};
				var list = {};
				var total = 0;
				$.extend(list,Root.defScore);
				var num = 0;
				//先确保每个指标都保存了.
				_.map(data.scores,function(item,idx){
					num++;
					list[item.indicator] = {
						self : item.self || 0,
						parent : item.parent || 0,
						teacher : item.teacher || 0
					};
					total += list[item.indicator].self + list[item.indicator].teacher + list[item.indicator].parent;
				});

				return {
					list : list,
					total : total,
					num : num
				}
			}

			//拉单个学生评分
			function getScore(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher/score?_='+ts,
					{
						responseType:'json',
						params : param
					})
					.success(function(data,status){
						if(data.code === 0){
							//按学期拉的分数
							if(!param.student){
								convertScore(data.score);
							}else{
								if(data.score.length === 0){

									//if(!Root.nowStudent.score){
										Root.nowStudent.score[param.month] = Root.defScore;
										Root.nowStudent.total[param.month] = 0;
										Root.nowStudent.nums[param.month] = 0;
									//}
									return;
								}
								var score = convertOneScore(data.score[0]);
								if(Root.nowStudent._id === data.score[0].student){
									//Root.nowStudent.scorelist[Root.nowMonth] = score;
									Root.nowStudent.score[param.month] = score.list;
									Root.nowStudent.total[param.month] = score.total;
									Root.nowStudent.nums[param.month] = score.num;
								}
								Root.$emit('status.student.scoreload')
							}

							console.log('获取学生评分成功!',data,Root.nowStudent);
						}else{
								//Root.nowStudent.scorelist[Root.nowMonth] = Root.defScore;
								Root.nowStudent.score[Root.nowMonth] = 0;	
								Root.$emit('msg.codeshow',data.code);
						}
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});			
			}

			//拉学生评分列表
			function getScoreList(param,success,error){
				Http.get('/teacher/score?_='+ts,
					{
						responseType:'json'
					})
					.success(function(data,status){
						if(data.code === 0){
							console.log('获取学生评分成功!',data);
						}else{
							Root.$emit('msg.codeshow',data.code);
						}
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});	
			}

			function getStudent(){
				return Root.User;
			}

			function updateStudent(obj){
				_.each(Root.studentList,function(item){
					if(item._id === obj._id){
						_.extend(item,obj);
					}
				});
			}

			//添加学生
			function createStudent(param,success,error){
				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(param);
				Http.post('/teacher/student?_=' + ts,
                        body,
                        {
                            responseType: 'json',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }					
					)
                    .success(function(data, status){
                    	Root.$emit('msg.codeshow',data.code);
                    	if(data.error === 'ok' || data.code === 0){
                    		var student = JSON.parse(param.student);
                    		//student.id = data.id;
                    		if(!student._id){
	                    		student._id = data.id;
	                    		Root.studentList.push(student);                    			
                    		}else{
                    			updateStudent(student);
                    		}
                    		Root.studentMap[data.id] = student;
                    		window.localStorage.setItem('student',JSON.stringify(Root.studentList));
                    		Root.nowStudent = {};
                    		//Root.quotaList.push(param.term);
                    	}
                        console.log('添加学生成功!', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                        if(error) error(data, status);
                    });	
			}

			function checkGrade(item){
				var ret = false;
				_.each(Root.teacherGrade,function(obj){
					if(obj.g === item.grade && obj.c === item.class){
						ret = true;
						return true;
					}
				});
				return ret;
			}

			function filterStudentByTeacher(){
				if(Root.Teacher.auth){
					Root.$emit('status.filter.student');
					return;
				}
				var list = [];
				_.each(Root.studentMap,function(item,idx){
					var ret = checkGrade(item);
					if(ret){
						list.push(item);
					}else{
						delete Root.studentMap[idx];
					}
				});
				//console.log(Root.studentMap,list);
				Root.studentList = list;
				Root.$emit('status.filter.student');
				/*_.filter(sList,function(item){
					return _.indexOf(Root.gradeList,item.grade) >= 0 && _.indexOf(Root.classList,item.class) >= 0
				});
				*/
			}

			//选择一个指定学期的学生
			function filterStudent(gid,cid){
				var list = {};

				if(gid === '所有'){
					gid = 0;
				}
				if(cid === '所有'){
					cid = 0;
				}

				if(!gid && !cid){
					//$.extend(list,sList);
					Root.studentList = [];
					// if(Root.Teacher.authority===3){
					// 	var sort = {};
					// 	$.extend(sort,Root.studentMap);
					// 	_.sortBy(sort,function(item){
					// 		if(order){
					// 			return -item[type];
					// 		}else{
					// 			return +item[type];
					// 		}
					// 	});						
					// }
					_.each(Root.studentMap,function(item){
						Root.studentList.push(item);
					});
					//Root.studentList = sList;
					return;
				}else{
					_.each(sList,function(item){
						if(gid && cid){
							Root.studentList = _.filter(sList,function(item){
								return item.grade===gid && item.class===cid;
							});
						}else if(gid){
							Root.studentList = _.filter(sList,function(item){
								return item.grade===gid;
							});
						}else{
							Root.studentList = _.filter(sList,function(item){
								return item.class===cid;
							});
						}
					});
				}
			}


			function orderByStudentScore(order){
				var sort = _.sortBy(Root.studentList,function(item){
					if(item.totals && item.totals[Root.nowMonth]){
						if(order){
							return -item.totals[Root.nowMonth];
						}else{
							return +item.totals[Root.nowMonth];
						}
					}

				});
				Root.studentList = sort;
			}

			//按类型降序排列学生
			function orderByStudent(type,order){
				var num = 0;
				var sort = _.sortBy(Root.studentList,function(item){
					// if(num===0){
					// 	console.log(-parseInt(item[type]));
					// }
					// num++
					if(order){
						return -item[type];
					}else{
						return +item[type];
					}
					
				});
				Root.studentList = sort;
			}

			//搜索学生
			function searchStudent(key){
				//console.log(Root.nowGrade,Root.nowClass);
				if(key == ''){
					return;
				}
				
				Root.studentList = _.filter(Root.studentMap,function(item){
					return item.name.indexOf(key)>=0
				});				
			}

			function noScore(list){
				Root.noList = _.filter(Root.studentList,function(item){
					return $.inArray(item._id,list) <0;
				});
			}

			return {
				createStudent : createStudent, //添加学生
				getStudentList : getStudentList, //拉学生列表
				getStudentInfo : getStudentInfo, //拉当前登录学生信息
				getStudent : getStudent,         //
				filterStudent : filterStudent,		//
				orderByStudent : orderByStudent,
				orderByStudentScore : orderByStudentScore,
				searchStudent : searchStudent,
				getScore : getScore,
				getScoreList : getScoreList,
				filterStudentByTeacher : filterStudentByTeacher,
				noScore : noScore
			}

		}
	]);
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
                    Root.myInfo.total = pd.total;
                    _.each(obj,function(item){
                        Root.myInfo.score[item.indicator] = {
                            self : item.self,
                            teacher : item.teacher,
                            parent : item.parent
                        }
                    });
                //老师
                }else{

                    Root.studentMap[pd.student].total = pd.total;
                    var num = 0;
                    _.each(obj.scores,function(item){
                        num++;
                        Root.studentMap[pd.student].score[item.indicator] = {
                            self : item.self,
                            teacher : item.teacher,
                            parent : item.parent
                        }
                    });                    
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

            function updateStudentScore(item){
                var obj = _.findWhere(Root.studentList,{_id : item.student});
                if(!obj.totals){
                    obj.totals = {};
                }
                obj.totals[Root.nowMonth] = item.total;
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
angular.module('dy.controllers.msg',[])
	.controller('msgController',['$rootScope', '$scope',function (Root,Scope) {
		console.log('load msgcontroller');
		// body...
		Messenger().options = {
		    extraClasses: 'messenger-fixed messenger-on-bottom',
		    theme: 'flat'
		}

		var msg = {
			0 : '操作成功!',
			1001 : '您还没有登录!',
			1004 : '没有找到资源!',
			1010 : '您没有查看该资源的权限!',
			1011 : '参数出错啦!',
			1013 : '出错啦',
			1014 : '同名啦,请修改名称!',
			1015 : '已经归档啦!',
			1016 : '该资源不能删除',
			1017 : '该目录下还有其他文件，无法删除!',
			1041 : '用户名或密码错误!',
			1043 : '用户不存在!',
			1050 : '时间交叉了!'			
		}

		Root.$on('msg.codeshow',function(e,code){
			var obj = {
				'message' : msg[code]
			}
			if(parseInt(code)){
				obj.type = 'error'
			}

			Messenger().post(obj);	
		});

		Root.$emit('msg.codeshow',0);

	}]);
angular.module('dy.controllers.mgradelist',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'
	])
	.controller('mgradelistController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			console.log('load mgradelistcontroller')
			Root.termList = {};
			Root.Term = {};
			Root.nowTerm = {};

			Root.showGrade = function(id){
				Root.Term = Root.termList[id];
				Root.$emit('status.grade.change',id);

			}

			Scope.selectTerm = function(id){
				//Root.nowTerm = Root.termList[id];
			}

			Scope.selectGrade = function(id){
				//Root.nowGrade = Root.gradeList[id];
			}

			Scope.selectMonth = function(id){
				console.log(id);
			}

			//Mgrade.getTermList();
		}
	]);

angular.module('dy.controllers.indexnav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'	
	])
	.controller('indexnavController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService',function(Root,Scope,$location,Util,Mgrade,Student){
			console.log('load indexnavcontroller');

			Root.nowMonth;
			Root.defMonth;

			Root.showRecode = function(){

			}

			Root.getMode = function(){
				return $location.search()['mode'] || false;
			}
			//切换模块
			Root.switchMode = function(mode){
                if(mode !== Scope.getMode()){
                    $location.search('mode', mode);
                    resetQuota();
                    Root.$emit('status.student.quotacheng');
                }
			}	

			function resetQuota(){
				_.each(Root.quotaList,function(item){
					delete item.now;
				});
				Root.allScore = 0;
			}

			//退出登录
			Root.quitLogin = function(){

			}		

		}
	]).controller('termController',[//学期信息
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			console.log('load termController');

			Root.nowDate = +new Date();
			// Root.nowMonth = new Date().getMonth()+1;

			Root.nowTrem = {
				name : '2014 下学期',
				id : 1,
				month : [7,8,9,10,11],
				nowmonth : Root.nowMonth,
				status : true,
				endtime : 1407590174026,
				starttime : 1407590174026
			};
		}
	]);
angular.module('dy.controllers.student',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'	
	])
	.controller('studentController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService','CMD_SET_QUOTA',
			function(Root,Scope,Location,Util,Mgrade,Student,CMD_SET_QUOTA){
			console.log('load studentcontroller');
			var url = Location.absUrl();

			//console.log('skey',Util.cookie.get('skey'),Util.cookie.get('role'));
			if(url.indexOf('student.html') > 0 && Util.cookie.get('role') !== 'student'){
				// window.location.href="/student/login";
				// return;
			}			
			//sm = list 显示学生列表
			//sm = info 显示学生个人资料
			//sm = recode 显示自评说明

			//Scope.SelectdGrade = {};
			//Scope.SelectdClass = {};

			Root.myInfo = {};
			Root.studentTerm = false;
			Root.studentMap = {};
			Root.studentMonth = 0;
			Root.firstMonth = {};

			var userList = {};
			var gradeList = [];

			Root.rStudent = {};
			Root.studentList = {};
			Root.studentMap = {};
			Root.nowStudent = {};

			Scope.order = {
				name : 1,
				id : 0,
				sex : 0,
				grade : 0,
				class : 0,
				score : 0
			};

			function resetData(){
				// Scope.name = '';
				// Scope.cmis = '';
			}

			Root.selectStudentMonth = function(id){
				// var first = Root.myInfo.term.months[0];
				// console.log(id,first.s);
				// if(id>first.s){
					Root.studentMonth = id;	
					Root.$emit('status.myinfo.load');
				//}
			}

			Root.changeStudent = function(id){
				Root.nowStudent = {};
				var st = Root.studentMap[id];
				$.extend(Root.nowStudent,st);				
			}
			
			//选中一个学生
			Root.selectStudent = function(id){
				var month = Root.nowMonth;
				if(Root.getMode() === 'record'){
					month = Root.defMonth-1;
				}

				Root.nowStudent = {};
				var st = Root.studentMap[id];
				$.extend(Root.nowStudent,st);
				Root.nowStudent.total = {};
				Root.nowStudent.score = {};
				Root.nowStudent.nums = {};
				var param = {
					term : Root.Term._id,
					student : Root.nowStudent._id,
					month : month
				}
				Student.getScore(param);
				Root.$emit('status.student.change',true);
			}

			Scope.resetStudent = function(){
				Root.nowStudent = {};
			}

			Scope.createUser = function(){
				//resetData();
				Root.nowStudent = {};
				$('#userZone .div-form').show();
			}	

			Scope.saveStudent = function(){
				 //student: {"id":"230126200703240579","name":"白益昊","number":"0108021141901019","grade":1,"class":1,"pid":22709,"sex":1}
				//Root.nowStudent.grade = Scope.SelectdGrade.id;
				//Root.nowStudent.class = Scope.SelectdClass.id;

				var param = {
					number : Root.nowStudent.number,
					name : Root.nowStudent.name,
					id : Root.nowStudent.id,
					grade : Root.nowStudent.grade,
					class : Root.nowStudent.class,
					pid : 1000,
					sex : Root.nowStudent.sex,
					_id : Root.nowStudent._id
				}
				Student.createStudent({
					student : JSON.stringify(param)
				});

			}

			Root.hasStudent = function(){
				return !$.isEmptyObject(Root.nowStudent);
			}

			Root.orderStudent = function(type){
				Scope.order[type] = Scope.order[type]?0:1;
				Student.orderByStudent(type,Scope.order[type]);
			}

			Root.orderStudentScore = function(type){
				if(Root.Teacher.authority<3){
					return;
				}
				Scope.order['score'] = Scope.order['score']?0:1;
				Student.orderByStudentScore(Scope.order['score']);
			}			

			Root.returnStudentList = function(){
				Root.nowStudent = {};
			}

			Root.$on(CMD_SET_QUOTA,function(e,d){
				//console.log(d.id,d.num);
			});		

			Root.$on('status.quota.load',function(e,d){
				if(!$.isEmptyObject(Root.myInfo)){
					var param = {
						term : Root.myInfo.term._id,
						month : Root.nowMonth,
						student : Root.myInfo._id
					}
					//Student.getScore(param);
				}
			});

			//老师页.等有学期之后再拉.
			Root.$on('status.term.load.student',function(){
				fn = function(data){
					Root.$emit('status.student.loaded',true);
				}
				Student.getStudentList({
					term : Root.Term._id
				},fn);
			});		

			//学生页,直接拉
			var url = Location.absUrl();
			var fn = function(){};
			if(url.indexOf('student.html') > 0){
				
				if(!Util.cookie.get('skey')){
					// window.location.href="/student/login";
					// return;
				}			
				Student.getStudentInfo(null,function(d){
					if(d.code !== 0){
						console.log('拉数据失败');
						Root.studentTerm = false;
					}
				});
			}

		}
	]);
angular.module('dy.controllers.quota',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.quota'	
	])
	.controller('quotaController',[
		'$rootScope',
		'$scope',
		'Util',
		'mGradeService',
		'quotaService',
		'CMD_SET_QUOTA',
		'CMD_SAVE_QUOTA'
		,function(Root,Scope,Util,Mgrade,Quota,CMD_SET_QUOTA,CMD_SAVE_QUOTA){
			console.log('load quotacontroller');

			var length = 0;//指标个数
			var allRecord = 0;//总分
			var nowRecord = {};//当前指标打分列表

			Root.quotaList = []; //指标列表
			Root.quotaMap = {};
			Root.nowQuota = {}; //当前指标
			Root.nowScore = {}; //当前评分
			Root.defScore = false; //默认的评分指标
			Root.studentScoreList = [];
			Root.scoreStatus = {};//评分状态
			Root.scoreMap = {};
			Root.maxStudent = {}; //最高分
			Root.minStudent = {}; //最低分

			function getEqua(){
				var aRec = 0;
				var num = 0;
				for(var i in nowRecord){
					aRec += nowRecord[i];
					num++;
				}
				return aRec;
			}

			//后台变更指标
			Scope.changeQuota = function(id){
				Root.nowQuota = Root.quotaMap[id];
			}	

			//后台创建指标
			Scope.createQuota = function(){
				Root.nowQuota = {};
			};	

			Scope.resetQuota = function(){
				Root.nowQuota = {};
			};

			Scope.order = {
				name : 0,
				order : 0,
				desc : 0
			};

			//排序
			Scope.orderQuota = function(type){
				Scope.order[type] = Scope.order[type]?0:1;
				Quota.orderByQuota(type,Scope.order[type]);
			}

			//后台保存指标
			Scope.saveQuota = function(){
				var param = {
					order : Root.nowQuota.order,
					name : Root.nowQuota.name,
					order : Root.nowQuota.order,
					desc : Root.nowQuota.desc,
					score : 5//Root.nowQuota.score
				}
				if(Root.nowQuota._id){
					Quota.modifyQuota({
						id : Root.nowQuota._id,
						term : Root.Term._id,
						indicator : JSON.stringify(param)
					});
				}else{
					Quota.createQuota({
						term : Root.Term._id,
						indicator : JSON.stringify(param)
					});
				}
			}

			//后台删除指标
			Scope.delQuota = function(){
				Quota.delQuota({
					id : Root.nowQuota._id
				});
			}			

			//取学生本月的分数.并记总数
			function getStudentNewQuota(type){
				var list = [];
				var total = 0;
				var score;
				if(Root.nowStudent._id){
					score = Root.nowStudent.score[Root.defMonth-1] || {};
				}else{
					score = Root.myInfo.score[Root.myInfo.defMonth-1];
				}
				// console.log(score);
				_.each(Root.nowScore,function(item,idx){
					var self,parent,teacher;
					if($.isEmptyObject(score) || !score[idx]){
						self = 0;
						parent = 0;
						teacher = 0;
					}else{
						self = score[idx].self || 0;
						parent = score[idx].parent || 0;
						teacher = score[idx].teacher || 0;
					}
					
					var obj = {
						indicator:idx,
						self : self,
						parent : parent,
						teacher : teacher
					}
					obj[type]  = item
					total += obj.self + obj.parent+ obj.teacher;
					list.push(obj);
				});
				return {
					total : total,
					list : list
				};
			}

			//计算分数
			function getScoreList(data){
				var list = [];
				for(var i in data){
					list.push(data[i]);
				}
				return list;
			}

			//给学生打分
			Scope.saveStudentQuota = function(){
				//不能对整个学期打分
				if(!Root.nowMonth){
					return;
				}
				//老师打分
				var sid,tid,year,month

				var month = Root.defMonth || Root.myInfo.defMonth;

				var param = {
					//month : Root.nowMonth-1 || new Date().getMonth(),
					month : month-1,
					scores : Scope.allScore
				};
				if(!$.isEmptyObject(Root.nowStudent)){
					param.student = Root.nowStudent._id;
					param.term = Root.Term._id;
					param.year = Root.Term.year;
				}else if(Root.myInfo._id){
					param.student = Root.myInfo._id;
					param.term = Root.myInfo.term._id;
					param.year = Root.myInfo.term.year;
				}else{
					alert('还没有选择学生!');
					return;
				}
				param.total = 0;
				// var param = {
				// 	teacherScores : getScoreList(Root.nowScore)
				// }		
				var sp,type;
				if(Root.isTeacher){
					type = 'teacher';
				}else if(Root.getMode() === 'parent'){
					type = 'parent';
				}else{
					type = 'self';
				}
				sp = getStudentNewQuota(type);
				param.scores = sp.list;
				param.total = sp.total;
				// console.log(param);
				// return;
				// console.log(Root.nowStudent);
				//return;
				Quota.saveStudentQuota({
					score : JSON.stringify(param)
				});
			}

			//重置学生分数
			Scope.resetStudentQuota = function(){
				Scope.allScore = 0;
				for(var i in Root.quotaMap){
					Root.quotaMap[i].now = 0;
				}
			}

			//打分.这里记录id和分数
			//通知设置了分数
			Scope.setStudentQuota = function(id,num,old){

				nowRecord[id] = num;
				Root.quotaMap[id].now = num;
				Root.nowScore[id] = num;
				// //这里有问题..要修改下.
				Scope.allScore -=old;
				Scope.allScore += num;
				Root.$emit(CMD_SET_QUOTA,{ 
					id : id,
					num : num
				});
			}

			Root.$on('status.student.scoreload',function(){

				//Scope.allScore = Root.nowStudent.total[Root.scoreMonth];
				_.each(Root.nowStudent.score[Root.scoreMonth],function(item,idx){
					Root.nowScore[idx] = item.teacher;
					Scope.allScore += item.teacher; 
				});
			});

			Root.$on('status.grade.change',function(){
				//重新拉学期单指标
				Quota.getQuotaList({
					term : Root.Term._id
				});
			})

			//学生变动
			Root.$on('status.student.change',function(){
				Root.nowScore = {};
				Scope.resetStudentQuota();
			});

			function getOneScores(type){
				var total = 0;	
				if(Root.myInfo.score[Root.myInfo.defMonth-1]){
					_.each(Root.myInfo.score[Root.myInfo.defMonth-1],function(item,idx){
						Root.nowScore[idx] = item[type];
						total += item[type];
					});
				}else{
					Root.nowScore = {};
				}
				Scope.allScore = total;

			}


			Root.$on('status.student.quotacheng',function(){
				Scope.allScore = 0;
				//家长
				if(Root.getMode() === 'parent'){
					getOneScores('parent');
				//学生
				}else if(Root.getMode() === 'self'){
					getOneScores('self');
				}
			});

			Root.$on('status.myinfo.load',function(){
				var param = {
					term : Root.Term._id
				}
				Quota.getQuotaList(param);

				var param = {
					term : Root.Term._id,
					grade : Root.myInfo.grade,
					class : Root.myInfo.class,
					month : Root.studentMonth
				}
				console.log(Root.myInfo)
				Quota.getScores(param);
			});

			Root.$on('status.term.load.quota',function(){
				var param = {
					term : Root.Term._id
				}
				Quota.getQuotaList(param);
			});			
		}
	]);
;(function(){
    angular.module('student', [
        'dy.controllers.mgradelist', //年级列表
        'dy.controllers.msg',
        'dy.controllers.student', //学生
        'dy.controllers.indexnav', //导航条
        'dy.controllers.quota'//指标
    ]);
})();
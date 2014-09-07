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
							Root.myInfo.pre = total/Root.myInfo.allscore*100;
							Root.nowMonth = data.nowmonth;
							Root.studentMonth = data.nowmonth;

							Root.nowDay = data.day;
							if(data.term && checkMonth(data.nowmonth,data.term.months) && data.day <= data.term.day){
								Root.studentTerm = true;
							}
							Root.Term = data.term;
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


			//按类型降序排列学生
			function orderByStudent(type,order){
				var sort = _.sortBy(Root.studentList,function(item){
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
				searchStudent : searchStudent,
				getScore : getScore,
				getScoreList : getScoreList,
				filterStudentByTeacher : filterStudentByTeacher,
				noScore : noScore
			}

		}
	]);
angular.module('dy.services.teacher', [
        'dy.constants',
        'dy.services.utils'	
	])
	.service('teacherService', [
		'$rootScope','$location','$http','Util',function(Root,location,Http,Util){

			var tList = [];
			function convertTeacher(list){
				_.each(list,function(item){
					var obj = {};
					_.extend(obj,item);
					Root.teacherMap[obj._id] = obj;					
				});
			}

			function getTeacherGrade(glist){
				_.each(glist,function(item){
					var key = item.grade+'|'+item.class
					Root.teacherGrade[key] = {
						g : item.grade,
						c : item.class
					};
					// Root.gradeList.push(item.class);
				});
			}

			function getTeacherInfo(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						Root.Teacher = data.teacher;
						Root.Teacher.auth = data.teacher.authority;
						if(!Root.Teacher.auth){
							var gclist = getTeacherGrade(data.relationship);
						}
						// Root.gradeList = gclist.grade;
						// Root.classList = gclist.clist;
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
							tList = data.teacher;
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
			}


			function filterTeacher(gid,cid){
				var list = {};
				if(gid === '所有'){
					gid = 0;
				}
				if(cid === '所有'){
					cid = 0;
				}

				if(!gid && !cid){
					return;
				}else{
					_.each(tList,function(item){
						if(gid && cid){
							Root.teacherList = _.filter(tList,function(item){
								return item.grade===gid && item.class===cid;
							});
						}else if(gid){
							Root.teacherList = _.filter(tList,function(item){
								return item.grade===gid;
							});
						}else{
							Root.teacherList = _.filter(tList,function(item){
								return item.class===cid;
							});
						}
					});
				}
			}

			function updateTeacher(param,success,error){
				var ts = new Date().getTime();
				var body = Util.object.toUrlencodedString(param);
				Http.post('/teacher/teacher?_=' + ts,
                        body,
                        {
                            responseType: 'json',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }
					)
					.success(function(data,status){
						if(data.code === 0){
							var teacher = JSON.parse(param.teacher);
							_.each(Root.teacherAuthList,function(item){
								if(item.id === teacher.id){
									item.authority = teacher.authority;
								}
							});
							console.log('更新老师资料成功!', data);
						}else{
							Root.$emit('msg.codeshow',data.code);
						}
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});	
			}

			function getTeacherAuth(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher/list?_='+ts,{responseType:'json'})
					.success(function(data,status){
						if(data.code === 0){
							tList = data.teacher;
							Root.teacherAuthList = data.teacher;
							console.log('拉老师权限列表成功!', data);
						}else{
							Root.$emit('msg.codeshow',data.code);
						}
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});					
			}

			return {
				getTeacherInfo : getTeacherInfo,
				getTeacherList : getTeacherList,
				getTeacherAuth : getTeacherAuth,
				updateTeacher : updateTeacher,
				filterTeacher : filterTeacher
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

angular.module('dy.controllers.manage',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student',
        'dy.services.teacher'	
	])
	.controller('manageController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService','teacherService',function(Root,Scope,$location,Util,Mgrade,Student,Teacher){
			console.log('load managecontroller');

			//console.log('skey',Util.cookie.get('skey'),Util.cookie.get('role'));
			if(Util.cookie.get('role') !== 'teacher'){
				//window.location.href="/teacher/login";
				//return;
			}

			Root.setAuth = function(id,auth){
				console.log(id,auth);
				var param = {
					id : id,
					authority : auth
				};

				Teacher.updateTeacher({
					teacher : JSON.stringify(param)
				});
			}

			Root.isManage = true;
			//Root.Teacher = {};

			Teacher.getTeacherInfo();			

		}
	]);
angular.module('dy.controllers.managenav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'	
	])
	.controller('mNavController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService',function(Root,Scope,$location,Util,Mgrade,User){
			console.log('load managenavcontroller');

			var nowUser = {};

			Root.User = {
				nick : '测试用户',
				name : 'testuser',
				auth : 15
			}

			function hideAll(){
				$('.content-controller').hide();
				$('.content-header').hide();
			}

			Root.getMode = function(){
				return $location.search()['mode'];
			}

			Root.switchMode = function(mode){
				if(mode === 'record' && Root.nowMonth === 0){
					alert('你还没有选择月份');
					return;
				}
                if(mode !== Root.getMode()){
                    $location.search('mode', mode);
                }
			}					

			// Scope.authManage = function(){

			// }

			// Scope.quitManage = function(){

			// }
		}
	]);
angular.module('dy.controllers.managehandernav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student',
        'dy.services.teacher',
	])
	.controller('mHeaderNavController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService','teacherService',function(Root,Scope,Location,Util,Mgrade,Student,Teacher){
			console.log('load mheadercontroller');
			var gradeList = [];
			var classList = [];
			

			for(var i = 0;i<6;i++){
				gradeList.push(i+1);
			}

			for(var i = 0;i<15;i++){
				classList.push(i+1);
			}	

			Root.nowGrade = '所有';
			Root.nowClass = '所有';
			// Root.nowGrade = 1;
			// Root.nowClass = 1;

			Root.nowMonth = new Date().getMonth()+1;
			Root.scoreMonth = new Date().getMonth();
			Root.defMonth = 0;
			Root.nowDay = 0;
			Scope.searchKeyWord = '';

			//Root.termList = {};
			Root.gradeList = gradeList;
			Root.classList = classList;

			Scope.selectTerm = function(id){
				Root.Term = Root.termList[id];
				changeScore();
			}
			
			//变更年级
			Scope.changeGrade = function(id){
				Root.nowGrade = id || '所有';
				Student.filterStudent(Root.nowGrade,Root.nowClass);
				Teacher.filterTeacher(Root.nowGrade,Root.nowClass);
				Root.$emit('status.grade.change');
				changeScore();
			}

			//变更班级
			Scope.changeClass = function(id){
				Root.nowClass = id || '所有';
				Student.filterStudent(Root.nowGrade,Root.nowClass);
				Teacher.filterTeacher(Root.nowGrade,Root.nowClass);
				Root.$emit('status.grade.change');
				changeScore();
			}

			Scope.changeGradeClass = function(gid,cid){
				Root.nowGrade = gid;
				Root.nowClass = cid;
				Student.filterStudent(Root.nowGrade,Root.nowClass);
				Teacher.filterTeacher(Root.nowGrade,Root.nowClass);
				Root.$emit('status.grade.change');

				if(!gid){
					Root.nowGrade = '所有';	
				}
				if(!cid){
					Root.nowClass = '所有';	
				}				

				changeScore();
			}

			Scope.selectMonths = function(month){
				Root.nowMonth = month;
				Root.$emit('status.filter.student');
			};

			//变更年级
			Scope.changeGradeTeacher = function(id){
				Root.nowGrade = id || '所有';
			}

			//变更班级
			Scope.changeClassTeacher = function(id){
				Root.nowClass = id || '所有';
			}	

			function changeScore(){
			}		

			//搜索
			Scope.startSearch = function(e,d){
				Student.searchStudent(Scope.searchKeyWord);
			}

			Scope.getNowMonth = function(){
				return new Date().getMonth();
			}

			var url = Location.absUrl();
			var fn = function(){};

			Root.$on('status.term.load.mh',function(){
				var obj = {
					term : Root.Term._id
				}				
				var tid,grade,cls,month;
				if(Root.nowGrade !== '所有'){
					obj.grade = Root.nowGrade;
				}
				if(Root.nowClass !== '所有'){
					obj.class = Root.nowClass;
				}
				if(Root.nowMonth){
					obj.month = Root.month;
				}
				if(Root.Teacher.auth===3){
					Student.getScore(obj);
				}
			});

			if(url.indexOf('teacher.html') > 0){
				//Mgrade.getTermList();
			}
			//
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
angular.module('dy.controllers.teacher',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.teacher',	
        'dy.services.student',
        'dy.services.quota'
	])
	.controller('teacherController',[
		'$rootScope', '$scope','$location','Util','mGradeService','teacherService','studentService','quotaService',function(Root,Scope,Location,Util,Mgrade,Teacher,Student,Quota){
			console.log('load teachercontroller');
			

			if(Util.cookie.get('role') !== 'teacher'){
				window.location.href="/teacher/login";
				return;
			}

			if(Root.isManage){
				//return;
			}

			Root.nowDate = new Date();

			Root.isTeacher = true;
			Root.Teacher = {};
			Root.teacherMap = {};
			Root.teacherList = [];
			Root.teacherAuthList = [];
			Root.teacherGrade = {};

			//Root.defScore = {};

			Root.hadSelf = [];
			Root.hadParent = [];
			Root.hadTeacher = [];
			Root.hadList = [];
			Root.noSelf = 0;
			Root.noParent = 0;
			Root.noTeacher = 0;
			Root.panelTit = '';

			Root.getScoreNum = function(){
				var num = 0;
				_.each(Root.nowScore,function(item){
					num++;
				});
				return num;
			}

			Root.showNoList = function(type){
				var list;
				switch(type){
					case 'self':
						list = Root.hadSelf;
						Root.panelTit = '未自评学生';
						break;
					case 'parent':
						Root.panelTit = '未家长评价的学生';
						list = Root.hadParent;
						break;
					case 'teacher':
						Root.panelTit = '未老师评价的学生';
						list = Root.hadTeacher;
						break;
				}
				Student.noScore(list);
				$('#noScoreModal').modal('show');
			}

			Root.$on('status.grade.change',function(){
				var param = {
					term : Root.Term._id,
					month : Root.nowMonth
				}
				if(Root.nowGrade !== '所有'){
					param.grade = Root.nowGrade;
				}
				if(Root.nowClass !== '所有'){
					param.class = Root.nowClass;	
				}		
				Quota.getScores(param);
			});

			Root.$on('status.student.load',function(){
				Student.filterStudentByTeacher();
			});

			//老师资料拉完了.继续拉分数
			Root.$on('status.teacher.load',function(){
				Mgrade.getTermList();				
			});

			Root.$on('status.filter.student',function(){
				var param = {
					term : Root.Term._id,
					month : Root.nowMonth
				}				
				if(Root.Teacher.auth === 3){
					Quota.getScores(param);
					return;
				}

				Quota.getScores(param);
			});

			//学期已经 加载 
			Root.$on('status.term.load.teacher',function(){
				if(Root.Teacher.auth===3){
					var param = {
						term : Root.Term._id
					}
					Teacher.getTeacherList(param);
					Teacher.getTeacherAuth();
				}
				var param = {
					term : Root.Term._id,
					month : Root.nowMonth
				}
				//
			});	

			var url = Location.absUrl();
			var fn = function(){};
			if(url.indexOf('teacher.html') > 0){
				Root.teacherPage = true;
				Teacher.getTeacherInfo();
			}
			
			//Student.getStudentList();
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
			Scope.setStudentQuota = function(id,num){

				nowRecord[id] = num;
				Root.quotaMap[id].now = num;
				Root.nowScore[id] = num;
				// //这里有问题..要修改下.
				Scope.allScore = getEqua();
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
			});

			Root.$on('status.term.load.quota',function(){
				var param = {
					term : Root.Term._id
				}
				Quota.getQuotaList(param);
			});			
		}
	]);
angular.module('dy.controllers.gradepanel',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'	
	])
	.directive("fileread", [function () {
	    return {
	        scope: {
	            fileread: "="
	        },
	        link: function (scope, element, attributes) {
	        	console.log(scope,element,attributes);
	            element.bind("change", function (changeEvent) {
	                scope.$apply(function () {
	                	console.log(changeEvent);
	                    scope.fileread = changeEvent.target.files[0];
	                    // or all selected files:
	                    // scope.fileread = changeEvent.target.files;
	                });
	            });
	        }
	    }
	}])
	.controller('GradePanelController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){

			var selectMonth = [];
			var defMonthLength = 4;
			var selectMonth = [];

			window.uploadTeacher = function(){
				$('#teacherFrom').submit();
			}

			window.uploadStudent = function(){
				$('#studentFrom').submit();
			}

			window.uploadQuota = function(){
				$('#quotaFrom').submit();
			}

			function checkMonth(idx){

				var list = $('#gradePanelModal .select-month li');
				selectMonth = [];
				list.each(function(i){
					if(i >= idx-1 && i < idx+defMonthLength-1){
						$(this).addClass('active').removeClass('disabled').removeAttr('title');
						selectMonth.push({
							's' : i+1>12?1:i+1,
							'e' : i+2>12?1:i+2
						});						
					}else{
						$(this).removeClass('active').addClass('disabled').removeAttr('title');
					}
					if(!Root.Term.months){
						Root.Term.months = {};
					}
				});
				if(selectMonth.length < defMonthLength){
					var l = defMonthLength - selectMonth.length;
					for(var i = 0;i<l;i++){
						selectMonth.push({
							s : i+1,
							e : i+2
						});
						list.eq(i).addClass('active').removeClass('disabled').attr('title','下一年');
					}
				}
				Root.nowTerm.months = selectMonth;
			}

			Root.createGrade = function(e){
				var target = $(e.target);
				var type = target.attr('data-type');			
				if(type === 'create'){
					Root.$emit('create.grade.show');
				}
			}

			Root.showGradePanel = function(e){
				$("#gradePanelModal").modal('show');
			}

			Root.hideGradePanel = function(e){
				$("#gradePanelModal").modal('hide');
			}			

			Scope.monthSelect = function(e){
				var target = $(e.target),
					val = target.data('value');

				checkMonth(val);
			}

			Root.importTeacher = function(){
			}

			Scope.handleConfirmBtnClick = function(){
				if(Root.Term._id){
					Scope.createTerm();
				}else{
					Scope.createTerm();
				}
			}

			Scope.createTerm = function(){
				if(!Root.nowTerm.name || (Root.nowTerm.name && Root.nowTerm.name === '')){
					alert('学期名称必填');
					return;
				}
				if(!Root.nowTerm.day ){
					alert('还没有选结束日期');
					return;
				}				

				if($.isEmptyObject(Root.nowTerm.months)){
					alert('还没有选择月份!')
					return;
				}
				var param = {
					name : Root.nowTerm.name,
					status : Root.nowTerm.status || 0,
					year : new Date().getFullYear(),
					day : Root.nowTerm.day,
					months : Root.nowTerm.months
				}
				if(Root.nowTerm._id){
					param._id = Root.nowTerm._id;
					param.active = Root.nowTerm.active;
				}
				Mgrade.createTerm({
					term : JSON.stringify(param)
				});
				Root.hideGradePanel();
			}

			Root.modifyTerm = function(id){
				Root.Term = Root.termList[id];
				Root.nowTerm = {};
				$.extend(Root.nowTerm,Root.Term);
				Root.$emit('create.grade.show',true);
			}			

			Root.setActiveTerm = function(id){
				var param = Root.termList[id];
				Mgrade.setActTerm({
					id : param._id,
					status : 1
				});
				console.log(param);
			}

			Root.closeTerm = function(id,type){
				var param = Root.termList[id];
				var status = type || 0;
				param.active = false;
				Mgrade.setActTerm({
					id : param._id,
					status : type
				});
			}			

			Root.$on('status.grade.created',function(e,d){
				$('#gradePanelModal .select-month li').removeClass('active').removeClass('disabled').removeAttr('title');

			});

			Scope.checkTremMonth = function(month){
				if($.inArray(month,selectMonth)>=0){
					return true;
				}
				return false;
			}


			Root.$on('create.grade.show',function(e,d){
				if(!d){
					Scope.panelTitle = '新建学期';
					Root.nowTerm = {};
					selectMonth = [];
				}else{
					Scope.panelTitle = '修改学期';
					_.each(Root.nowTerm.months,function(item){
						selectMonth.push(item.s);
					});
				}
				Scope.confirmBtnTitle = '保存';
				Scope.cancelBtnTitle = '取消';

				var list = [];
				var month = [];
				for(var i = 1;i<32;i++){
					list.push(i);
				}
				for(var i = 1;i<13;i++){
					month.push(i);
				}


				$('#gradePanelModal .select-month li').removeClass('disabled').removeClass('active').removeAttr('title');
				Scope.daylist = list;
				Scope.monthlist = month;

				Root.showGradePanel();
			});


		}
	]);
;(function(){
    angular.module('manage', [
        'dy.controllers.mgradelist', //年级列表
        'dy.controllers.msg',
        'dy.controllers.managenav', //导航条
        'dy.controllers.manage', //授权管理
        'dy.controllers.managehandernav', //导航条
        'dy.controllers.student', //学生
        'dy.controllers.teacher',//老师
        'dy.controllers.quota',//指标
        'dy.controllers.gradepanel' //年级
    ]);
})();
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
						if(data.code === 0){
							conventTerm(data.term);
							console.log('拉学期列表成功!', data);
						}else{
							Root.$emit('msg.showcode',data.code);
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
                    	Root.$emit('msg.showcode',data.code);
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
                    	Root.$emit('msg.showcode',data.code);
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
                    	Root.$emit('msg.codeshow',data.code);
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
				for(var i in data){
					data[i].nsex = data[i].sex?'男':'女';
					Root.studentList[data[i]._id] = data[i];
					sList[data[i]._id] = data[i];
				}

			}

			//拉学生列表
			function getStudentList(param,success,error){
				if(window.localStorage.getItem('student')){
					var list  = JSON.parse(window.localStorage.getItem('student'));
					Root.studentList = list;
					sMap = list;
					console.log('拉缓存学生列表成功!',list);
					if(success) success(list);
					return;
				}

				var ts = new Date().getTime();
				Http.get('/teacher/student?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						//conventStudent(data.student);
						if(data.code === 0){
							Root.studentList = data.studentList;
							sList = data.student;
							sMap = data.studentList;
							window.localStorage.setItem('student',JSON.stringify(sMap));
							console.log('拉学生列表成功!', data);
						}else{
							Root.$emit('msg.showcode',data.code);
						}
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});
			};

			//拉学生个人信息
			function getStudentInfo(param,success,error){

				Http.get('/student/essential', {responseType:'json'})
					.success(function(data,status){
						if(data.code === 0){
							Root.myInfo = data.user;
							Root.myInfo.score = data.score;
							Root.myInfo.all = data.all;
							Root.myInfo.term = data.term;
							Root.myInfo.quota = data.quota;
							if(data.term){
								Root.studentTerm = true;
							}
							Root.Term = data.term;
							console.log(Root.myInfo);
							console.log('拉取学生资料成功',data);
						}else{
							Root.Term  = false;
							Root.$emit('msg.showcode',data.code);
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
				var tmp = _.max([data.selfScores,data.parentScores,data.teacherScores],function(list){
					return list.length;
				})
				var list = {};
				//先确保每个指标都保存了.
				_.map(tmp,function(item,idx){
					list[item.indicator] = {
						self : 0,
						parent : 0,
						teacher : 0
					};
				});

				_.each(data.selfScores,function(item,idx){
					list[item.indicator].self = item.score;
				});

				_.each(data.parentScores,function(item,idx){
					list[item.indicator].parent = item.score;
				});
				_.each(data.teacherScores,function(item,idx){
					list[item.indicator].teacher = item.score;
				});
				return list;
			}


			//拉学生评分
			function getScore(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher/score?_='+ts,
					{
						responseType:'json',
						params : param
					})
					.success(function(data,status){
						if(data.code === 0){
							if(data.score.length === 0){
								Root.nowStudent.scorelist[Root.nowMonth] = Root.defScore;
								Root.nowStudent.score[Root.nowMonth] = 0;								
								return;
							}
							var score = convertOneScore(data.score[0]);

							if(Root.nowStudent.id === data.score[0].student){
								Root.nowStudent.scorelist[Root.nowMonth] = score;
								Root.nowStudent.score[Root.nowMonth] = data.score[0].scores;
							}
							console.log('获取学生评分成功!',data);
						}else{
								Root.nowStudent.scorelist[Root.nowMonth] = Root.defScore;
								Root.nowStudent.score[Root.nowMonth] = 0;	
								Root.$emit('msg.showcode',data.code);
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
							Root.$emit('msg.showcode',data.code);
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
                    	Root.$emit('msg.showcode',data.code);
                    	if(data.error === 'ok' || data.code === 0){
                    		var student = JSON.parse(param.student);
                    		student.id = data.id;
                    		student._id = data.id;
                    		Root.studentList[data.id] = student;
                    		sMap[data.id] = student;
                    		window.localStorage.setItem('student',JSON.stringify(sMap));
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
					$.extend(list,sMap);
					Root.studentList = list;
					return;
				}else{
					_.each(sMap,function(item){
						if(gid && cid){
							Root.studentList = _.filter(sMap,function(item){
								return item.grade===gid && item.class===cid;
							});
						}else if(gid){
							Root.studentList = _.filter(sMap,function(item){
								return item.grade===gid;
							});
						}else{
							Root.studentList = _.filter(sMap,function(item){
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
					Root.studentList = sMap;
				}
				var list = sMap;
				_.map(list,function(item,idx){
					if(item.name.indexOf(key) < 0){
						delete Root.studentList[item._id];
					}
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
				getScoreList : getScoreList
			}

		}
	]);
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
						//conventStudent(data.student);
						console.log('拉老师资料成功!', data);
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});
			}

			function getTeacherList(param,success,error){
				Http.get('/teacher?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						Root.Teacher = data.teacher.info;
						//conventStudent(data.student);
						console.log('拉老师资料成功!', data);
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
                            Root.$emit('msg.showcode',data.code);
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
                        Root.$emit('msg.showcode',data.code);
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
                        Root.$emit('msg.showcode',data.code);
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
                        Root.$emit('msg.showcode',data.code);
                    	if(data.code === 0){
                    		param._id = data.id;
                    		Root.quotaList[data.id] = param;
                    		console.log(param);
                    		Root.nowQuota = {};
                    		//Root.quotaList.push(param.term);
                    	}
                    	console.log(Root.quotaList);

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
                        Root.$emit('msg.showcode',data.code);
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

			Mgrade.getTermList();
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

			Root.isManage = true;
			Root.Teacher = {};

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
        'dy.services.student'
	])
	.controller('mHeaderNavController',[
		'$rootScope', '$scope','Util','mGradeService','studentService',function(Root,Scope,Util,Mgrade,Student){
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

			Root.nowMonth = 0;
			Scope.searchKeyWord = '';

			//Root.termList = {};
			Root.gradeList = gradeList;
			Root.classList = classList;

			Scope.selectTerm = function(id){
				Root.Term = Root.termList[id];
			}
			
			//变更年级
			Scope.changeGrade = function(id){
				Root.nowGrade = id || '所有';
				Student.filterStudent(Root.nowGrade,Root.nowClass);
			}

			//变更班级
			Scope.changeClass = function(id){
				Root.nowClass = id || '所有';
				Student.filterStudent(Root.nowGrade,Root.nowClass);
			}

			//变更年级
			Scope.changeGradeTeacher = function(id){
				Root.nowGrade = id || '所有';
			}

			//变更班级
			Scope.changeClassTeacher = function(id){
				Root.nowClass = id || '所有';
			}			

			//搜索
			Scope.startSearch = function(e,d){
				Student.searchStudent(Scope.searchKeyWord);
			}

			Scope.getNowMonth = function(){
				return new Date().getMonth();
			}

			Scope.selectMonth = function(month){
				Root.nowMonth = month;
			};

			//Mgrade.getTermList();
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

			console.log('skey',Util.cookie.get('skey'),Util.cookie.get('role'));
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

			var userList = {};
			var gradeList = [];

			Root.rStudent = {};
			Root.studentList = {};
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
		
			Root.selectStudent = function(id){
				Root.nowStudent = {};
				var st = Root.studentList[id];
				$.extend(Root.nowStudent,st);
				Root.nowStudent.scorelist = {};
				Root.nowStudent.score = {};
				var param = {
					term : Root.Term._id,
					student : Root.nowStudent.id,
					month : Root.nowMonth
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

			Root.$on(CMD_SET_QUOTA,function(e,d){
				//console.log(d.id,d.num);
			});		
			
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
//top-nav .scores').remove();
					}
				});
			//如果是老师或管理,需要再把分数拉一下.
			}else{
				fn = function(data){
					Root.$emit('status.student.loaded',true);
				}
				Student.getStudentList(null,fn);
			}


		}
	]);
angular.module('dy.controllers.teacher',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.teacher'	
	])
	.controller('teacherController',[
		'$rootScope', '$scope','Util','mGradeService','teacherService',function(Root,Scope,Util,Mgrade,Teacher){
			console.log('load teachercontroller');

			if(Util.cookie.get('role') !== 'teacher'){
				// window.location.href="/teacher/login";
				// return;
			}

			if(Root.isManage){
				return;
			}

			Root.isTeacher = true;
			Root.Teacher = {};

			//学生列表拉完了.继续拉分数
			Root.$on('status.student.loaded',function(){

			});

			Teacher.getTeacherInfo();
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

			Root.quotaList = {}; //指标列表
			Root.nowQuota = {}; //当前指标
			Root.nowScore = {}; //当前评分
			Root.defScore = false; //默认的评分指标

			function getEqua(){
				var aRec = 0;
				var num = 0;
				for(var i in nowRecord){
					aRec += nowRecord[i];
					num++;
				}
				return aRec;
			}

			function getScoreList(data){
				var list = [];
				for(var i in data){
					list.push(data[i]);
				}
				return list;
			}

			//后台变更指标
			Scope.changeQuota = function(id){
				Root.nowQuota = Root.quotaList[id];
			}	

			//后台创建指标
			Scope.createQuota = function(){
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

			//给学生打分
			Scope.saveStudentQuota = function(){
				//老师打分
				var sid,tid,year,month
				var param = {
					month : Root.nowMonth || new Date().getMonth()+1,
					scores : Scope.allScore
				};
				console.log(Root.myInfo);
				if(!$.isEmptyObject(Root.nowStudent)){
					param.student = Root.nowStudent.id;
					param.term = Root.Term._id;
					param.year = Root.Term.year;
				}else{
					param.student = Root.myInfo.id;
					param.term = Root.myInfo.term._id;
					param.year = Root.myInfo.term.year;
				}
				// var param = {
				// 	teacherScores : getScoreList(Root.nowScore)
				// }		
				//console.log(Root.nowScore);		
				if(Root.isTeacher){
					param.teacherScores = getScoreList(Root.nowScore);
				}else if(Root.getMode() === 'parent'){
				//家长打分
					param.parentScores = getScoreList(Root.nowScore);
				}else{
				//学生打分
					param.selfScores	 = getScoreList(Root.nowScore);
				}
				console.log(param);
				Quota.saveStudentQuota({
					score : JSON.stringify(param)
				});
			}

			//重置学生分数
			Scope.resetStudentQuota = function(){
				Scope.allScore = 0;
				for(var i in Root.quotaList){
					Root.quotaList[i].now = 0;
				}
			}

			//打分.这里记录id和分数
			//通知设置了分数
			Scope.setStudentQuota = function(id,num){

				nowRecord[id] = num;
				Root.quotaList[id].now = num;
				Root.nowScore[id] = {
					indicator : id,
					score : num
				};

				//console.log(Root.nowScore);
				// //这里有问题..要修改下.
				Scope.allScore = getEqua();

				Root.$emit(CMD_SET_QUOTA,{ 
					id : id,
					num : num
				});
			}

			Root.$on('status.grade.change',function(){
				//重新拉学期单指标
				Quota.getQuotaList({
					term : Root.Term._id
				});
			})

			Root.$on('status.student.change',function(){
				Root.nowScore = {};
				Scope.resetStudentQuota();
			});

			Quota.getQuotaList();
		}
	]);
angular.module('dy.controllers.gradepanel',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'	
	])
	.controller('GradePanelController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){

			var selectMonth = [];
			var defMonthLength = 5

			function checkMonth(idx){
				var list = $('#gradePanelModal .select-month li');
				list.each(function(i){
					if(i >= idx-1 && i < idx+defMonthLength-1){
						$(this).addClass('active').removeClass('disabled');
						selectMonth.push({
							's' : i+1>12?1:i+1,
							'e' : i+2>12?1:i+2
						});						
					}else{
						$(this).removeClass('active').addClass('disabled');

					}
					if(!Root.Term.months){
						Root.Term.months = {};
					}
					Root.Term.months = selectMonth;
				});
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

			Scope.checkTremMonth = function(month){
				if(Root.Term && Root.Term.months){
					var ret = false;
					for(var i in Root.Term.months){
						if(month === Root.Term.months[i].s){
							return true;
						}
					}
					return true;

				}else{
					return false;
				}
			}


			Scope.handleConfirmBtnClick = function(){
				if(Root.Term._id){
					Scope.createTerm();
				}else{
					Scope.createTerm();
				}
			}

			Scope.createTerm = function(){
				var param = {
					name : Root.nowTerm.name,
					active : false,
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
					active : true
				});
				console.log(param);
			}

			Root.closeTerm = function(id){
				var param = Root.termList[id];
				param.active = false;
				Mgrade.setActTerm({
					id : param._id,
					active : false
				});
			}			



			Root.$on('create.grade.show',function(e,d){
				if(!d){
					Scope.panelTitle = '新建学期';
					Root.nowTerm = {};
				}else{
					Scope.panelTitle = '修改学期';
				}
				Scope.confirmBtnTitle = '保存';
				Scope.cancelBtnTitle = '取消';

				var list = [];
				var month = [];
				for(var i = 1;i<31;i++){
					list.push(i);
				}
				for(var i = 1;i<13;i++){
					month.push(i);
				}

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
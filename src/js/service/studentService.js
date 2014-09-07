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
							Root.studentMonth = data.nowmonth-1;

							Root.nowDay = data.day;
							if(data.term && checkMonth(data.nowmonth,data.term.months) && data.day <= data.term.day){
								Root.studentTerm = true;
							}
							Root.Term = data.term;
							Root.$emit('status.myinfo.load');
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
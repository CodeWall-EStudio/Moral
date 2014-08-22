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
							Root.myInfo = data.user || {};
							Root.myInfo.score = data.score || [];
							Root.myInfo.total = data.total || 0;
							Root.myInfo.term = data.term;
							Root.myInfo.quota = data.quota;
							Root.myInfo.allscore = 15* data.indicator.length;
							Root.myInfo.pre = data.total/Root.myInfo.allscore*100;
							if(data.term){
								Root.studentTerm = true;
							}
							Root.Term = data.term;
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
				var tmp = {};
				var list = {};
				var total = 0;
				//先确保每个指标都保存了.
				_.map(data.scores,function(item,idx){
					list[item.indicator] = {
						self : item.self || 0,
						parent : item.parent || 0,
						teacher : item.teacher || 0
					};
					total += list[item.indicator].self + list[item.indicator].teacher + list[item.indicator].parent;
				});
				return {
					list : list,
					total : total
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
							if(data.score.length === 0){
								if(!Root.nowStudent.score){
									Root.nowStudent.score = {};
									Root.nowStudent.total = {};
								}
								return;
							}
							var score = convertOneScore(data.score[0]);
							if(Root.nowStudent._id === data.score[0].student){
								//Root.nowStudent.scorelist[Root.nowMonth] = score;
								Root.nowStudent.score[Root.nowMonth] = score.list;
								Root.nowStudent.total[Root.nowMonth] = score.total;
							}
							console.log('获取学生评分成功!',data,Root.nowStudent);
						}else{
								//Root.nowStudent.scorelist[Root.nowMonth] = Root.defScore;
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
					return;
				}
				
				Root.studentList = _.filter(sMap,function(item){
					return item.name.indexOf(key)>=0
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
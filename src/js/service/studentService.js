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
						Root.studentList = data.studentList;
						sList = data.student;
						sMap = data.studentList;
						window.localStorage.setItem('student',JSON.stringify(sMap));

						console.log('拉学生列表成功!', data);
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
			function selectGrade(id){
				var list = sMap;
				if(Root.nowClass !== '所有'){
					list = Root.studentList;
				}

				var i = 0;
				_.map(list,function(item,idx){
					if(item.grade !== id){
						i++;
						delete Root.studentList[idx];
					}
				});
				//console.log(Root.studentList);
			}

			//选择一个指定班级的学生
			function selectClass(id){
				var list = sMap;
				if(Root.nowGrade !== '所有'){
					list = Root.studentList;
				}

				_.map(list,function(item,idx){
					if(item.class !== id){
						delete Root.studentList[idx];
					}
				});
			}

			//按类型降序排列学生
			function orderByStudent(type){
				console.log(type);
				var sort = _.sortBy(Root.studentList,function(item){
					return -item[type];
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
				selectGrade : selectGrade,		//
				selectClass : selectClass,
				orderByStudent : orderByStudent,
				searchStudent : searchStudent,
				getScore : getScore,
				getScoreList : getScoreList
			}

		}
	]);
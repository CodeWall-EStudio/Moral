angular.module('dy.services.student', [
        'dy.constants',
        'dy.services.utils'	
	])
	.service('studentService', [
		'$rootScope','$location','$http','Util',function(Root,location,Http,Util){

			var sList = [];
			var sMap = {};

			function conventStudent(data){
				for(var i in data){
					data[i].cid = data[i].id;
					data[i].id = data[i]._id;
					data[i].nsex = data[i].sex?'男':'女';
					Root.studentList[data[i]._id] = data[i];
					sList[data[i]._id] = data[i];
				}

			}

			//拉学生列表
			function getStudentList(param,success,error){
				if(window.localStorage.getItem('student')){
					console.log('拉缓存学生列表成功!');
					var list  = JSON.parse(window.localStorage.getItem('student'));
					Root.studentList = list;
					sMap = list;
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
							Root.myInfo.term = data.term;
							Root.myInfo.quota = data.quota;
							console.log('拉取学生资料成功',data);
						}else{

						}
					})
					.error(function(data,status){

					});
			};

			function getStudent(){
				return Root.User;
			}

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
                    	console.log(data);
                    	if(data.error === 'ok' || data.code === 0){
                    		var student = JSON.parse(param.student);
                    		student.id = data.id;
                    		student._id = data.id;
                    		Root.studentList[data.id] = student;
                    		//Root.quotaList.push(param.term);
                    	}
                        console.log('添加学生成功!', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                        if(error) error(data, status);
                    });	
			}

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
				console.log(Root.studentList);
			}

			return {
				createStudent : createStudent,
				getStudentList : getStudentList,
				getStudentInfo : getStudentInfo,
				getStudent : getStudent,
				selectGrade : selectGrade,
				selectClass : selectClass
			}

		}
	]);
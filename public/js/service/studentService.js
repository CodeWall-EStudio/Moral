angular.module('dy.services.student', [
        'dy.constants',
        'dy.services.utils'	
	])
	.service('studentService', [
		'$rootScope','$location','$http','Util',function(Root,location,Http,Util){

			var cgi = {
				gradelist : '', //拉学期列表
				creategrade : '', //创建学期
				onegrade : ''     //一个学期的信息
			};

			function conventStudent(data){
				for(var i in data){
					data[i].cid = data[i].id;
					data[i].id = data[i]._id;
					Root.studentList[data[i]._id] = data[i];
				}
			}

			//拉学生列表
			function getStudentList(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher/student?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						conventStudent(data.student);
						console.log('拉学生列表成功!', data);
						if(success) success(data, status);
					})
					.error(function(data,status){
						if(error) error(data, status);
					});
			};

			//拉学生个人信息
			function getStudentInfo(param,success,error){

				// $http.get(BACKEND_SERVER + '/studentInfo', {responseType:'json', params:params})
				// 	.success(function(data,status){

				// 	})
				// 	.error(function(data,status){

				// 	});
				// console.log(12345);
				Root.User = {
				    id: 'dsgi3252436k;l143245',
				    name: '测试学生',
				    number: 50,   //学生证号码
				    grade:  1,  
				    class: 2,
				    pid:   30,    //没用到
				    sex: 1
				}
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

			return {
				createStudent : createStudent,
				getStudentList : getStudentList,
				getStudentInfo : getStudentInfo,
				getStudent : getStudent
			}

		}
	]);
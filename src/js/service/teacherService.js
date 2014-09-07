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
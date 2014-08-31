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
				var grade = [];
				var clist = [];
				_.each(glist,function(item){
					grade.push(item.grade);
					clist.push(item.class);
					// Root.gradeList.push(item.class);
				});
				grade = _.uniq(_.sortBy(grade));
				clist = _.uniq(_.sortBy(clist));
				return {
					grade : grade,
					class : clist
				}
			}

			function getTeacherInfo(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						Root.Teacher = data.teacher.info;
						var gclist = getTeacherGrade(data.relationship);
						Root.gradeList = gclist.grade;
						Root.classList = gclist.class;
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
							Root.studentList = _.filter(tList,function(item){
								return item.grade===gid;
							});
						}else{
							Root.studentList = _.filter(tList,function(item){
								return item.class===cid;
							});
						}
					});
				}
			}

			return {
				getTeacherInfo : getTeacherInfo,
				getTeacherList : getTeacherList,
				filterTeacher : filterTeacher
			}

		}
	]);
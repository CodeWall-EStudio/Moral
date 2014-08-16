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
				Root.Term = data[no];
			}

			function getTermList(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher/term?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						conventTerm(data.term);
						console.log('拉学期列表成功!', data);
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
                    	if(data.error === 'ok' || data.error === 0){
                    		Root.termList.push(param.term);
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
				
			}			


			return {
				getTermList : getTermList,
				createTerm : createTerm,
				modifyTerm : modifyTerm
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
							Root.myInfo.term = data.term;
							Root.myInfo.quota = data.quota;
							console.log('拉取学生资料成功',data);
						}else{

						}
					})
					.error(function(data,status){

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
				if(!Root.quotaList){
					Root.quotaList = {};
				}
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

			function getQuotaList(param,success,error){
				var ts = new Date().getTime();
				Http.get('/teacher/indicator?_='+ts,null,{responseType:'json'})
					.success(function(data,status){
						conventQuota(data.indicator);
						console.log('拉指标列表成功!', data);
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
                    	if(data.error === 'ok' || data.error === 0){
                    		if(!Root.quotaList){
                    			Root.quotaList = {};
                    		}
                    		var quota = JSON.parse(param.indicator);
                    		quota._id = data.id;
                    		quota.id = data.id;
                    		Root.quotaList[data.id] = quota;
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
                    	console.log(data);
                    	if(data.error === 'ok' || data.error === 0){

                    		//Root.quotaList.push(param.term);
                    	}
                        console.log('[quotaService] quota crate suc =', data);
                        if(success) success(data, status);
                    })
                    .error(function(data, status){
                        if(error) error(data, status);
                    });					
			}


			return {
				getQuotaList : getQuotaList,
				createQuota : createQuota,
				modifyQuota : modifyQuota,
				saveStudentQuota : saveStudentQuota
			}

		}
	]);
angular.module('dy.controllers.mgradelist',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'	
	])
	.controller('mgradelistController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			Root.gradeList = {};

			Root.showGrade = function(){

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

			Scope.authManage = function(){

			}

			Scope.quitManage = function(){

			}
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
				gradeList.push({
					name : (i+1)+'年级',
					id :　i+1
				});
			}

			for(var i = 0;i<15;i++){
				classList.push({
					name : (i+1)+'班级',
					id :　i+1
				});
			}	

			Root.nowGrade = 1;
			Root.nowClass = 1;
			Root.nowMonth = 0;
			Scope.searchKeyWord = '';

			Root.termList = {};
			Root.gradeList = gradeList;
			Root.classList = classList;

			Scope.selectTerm = function(id){
				Root.Term = Root.termList[id];
			}
			
			//变更年级
			Scope.changeGrade = function(id){
				Root.nowGrade = id;
				Student.selectGrade(id);
			}

			//变更班级
			Scope.changeClass = function(id){
				Root.nowClass = id;
				Student.selectClass(id);
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

			Mgrade.getTermList();
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

			Scope.SelectdGrade = {};
			Scope.SelectdClass = {};

			Root.myInfo = {};

			var userList = {};
			var gradeList = [];

			Root.rStudent = {};
			Root.studentList = {};
			Root.nowStudent = {};


			function resetData(){
				// Scope.name = '';
				// Scope.cmis = '';
			}
		
			Root.selectStudent = function(id){
				Root.nowStudent = Root.studentList[id];
				Root.nowStudent.scorelist = {};
				Root.nowStudent.score = {};
				//console.log(Root.Term._id,Root.nowStudent._id);
				var param = {
					term : Root.Term._id,
					student : Root.nowStudent.id,
					month : Root.nowMonth
				}
				Student.getScore(param);
				Root.$emit('status.student.change',true);
			}

			Scope.createUser = function(){
				//resetData();
				$('#userZone .div-form').show();
			}	

			Scope.saveStudent = function(){
				 //student: {"id":"230126200703240579","name":"白益昊","number":"0108021141901019","grade":1,"class":1,"pid":22709,"sex":1}
				Root.nowStudent.grade = Scope.SelectdGrade.id;
				Root.nowStudent.class = Scope.SelectdClass.id;
				var param = {
					number : Root.nowStudent.number,
					name : Root.nowStudent.name,
					id : Root.nowStudent.id,
					grade : Root.nowStudent.grade,
					class : Root.nowStudent.class,
					pid : 1000,
					sex : Root.nowStudent.sex
				}
				Student.createStudent({
					student : JSON.stringify(param)
				});

			}

			Root.hasStudent = function(){
				return !$.isEmptyObject(Root.nowStudent);
			}

			Root.orderStudent = function(type){
				Student.orderByStudent(type);
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
				Student.getStudentInfo();
			//如果是老师,需要再把分数拉一下.
			}else if(url.indexOf('teacher.html') > 0){
				fn = function(data){
					Root.$emit('status.student.loaded',true);
				};
			}

			Student.getStudentList(null,fn);

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
			Scope.changeQuota = function(idx){
			}	

			//后台创建指标
			Scope.createQuota = function(){
			}	

			//后台保存指标
			Scope.saveQuota = function(){
				var param = {
					name : Root.nowQuota.name,
					order : Root.nowQuota.order,
					desc : Root.nowQuota.desc,
					score : Root.nowQuota.score
				}
				if(Root.nowQuota._id){
					Quota.createQuota({
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
				console.log(nowQuota);
			}			

			//给学生打分
			Scope.saveStudentQuota = function(){
				//老师打分
				var sid,tid,year,month;
				if(Root.Term){
					sid = Root.nowStudent.id;
					tid = Root.Term._id;
					year = Root.Term.year;
					month = Root.nowMonth;
				}else{
					sid = Root.myInfo.id
					tid = Root.myInfo.term._id;
					year = Root.myInfo.term.year;
					month = Root.nowMonth;
				}
				var param = {
					student : sid,
					term : tid,
					year : year,
					month : month,
					scores : Scope.allScore,
					teacherScores : getScoreList(Root.nowScore)
				}				
				if(Root.isTeacher){
					param.teacherScores = getScoreList(Root.nowScore);
				}else if(Root.getMode() === 'parent'){
				//家长打分
					param.parentScores = getScoreList(Root.nowScore);
				}else{
				//学生打分
					param.selfScores	 = getScoreList(Root.nowScore);
				}
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
			var defMonthLength = 5;

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
					name : Root.Term.name,
					active : false,
					year : new Date().getFullYear(),
					day : Root.Term.day,
					months : Root.Term.months
				}
				if(Root.Term._id){
					
				}
				Mgrade.createTerm({
					term : JSON.stringify(param)
				});
				Root.hideGradePanel();
			}

			Root.modifyTerm = function(id){
				Root.Term = Root.termList[id];
				Root.$emit('create.grade.show',true);
			}			

			Root.setActiveTerm = function(id){
				var param = Root.termList[id];
				param.active = true;
				Mgrade.createTerm({
					term : JSON.stringify(param)
				});
			}

			Root.closeTerm = function(id){
				var param = Root.termList[id];
				param.active = false;
				Mgrade.createTerm({
					term : JSON.stringify(param)
				});
			}			



			Root.$on('create.grade.show',function(e,d){
				if(!d){
					Scope.panelTitle = '新建学期';
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
        'dy.controllers.managenav', //导航条
        'dy.controllers.manage', //授权管理
        'dy.controllers.managehandernav', //导航条
        'dy.controllers.student', //学生
        'dy.controllers.teacher',//老师
        'dy.controllers.quota',//指标
        'dy.controllers.gradepanel' //年级
    ]);
})();
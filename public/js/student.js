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

angular.module('dy.controllers.indexnav',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade',
        'dy.services.student'	
	])
	.controller('indexnavController',[
		'$rootScope', '$scope','$location','Util','mGradeService','studentService',function(Root,Scope,$location,Util,Mgrade,Student){
			console.log('load indexnavcontroller');

			Root.showRecode = function(){

			}

			Root.getMode = function(){
				return $location.search()['mode'];
			}

			Root.switchMode = function(mode){
                if(mode !== Scope.getMode()){
                    $location.search('mode', mode);
                }
			}	

			//退出登录
			Root.quitLogin = function(){

			}		

		}
	]).controller('termController',[//学期信息
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){
			console.log('load termController');

			Root.nowDate = +new Date();

			Root.nowTrem = {
				name : '2014 下学期',
				id : 1,
				month : [7,8,9,10,11],
				nowmonth : 10,
				status : true,
				endtime : 1407590174026,
				starttime : 1407590174026
			};
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
				window.location.href="/student/login";
				return;
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
					window.location.href="/student/login";
					return;
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
				console.log(Root.nowQuota);
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
;(function(){
    angular.module('student', [
        'dy.controllers.mgradelist', //年级列表
        'dy.controllers.student', //学生
        'dy.controllers.indexnav', //导航条
        'dy.controllers.quota'//指标
    ]);
})();
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

			Root.quotaList = []; //指标列表
			Root.quotaMap = {};
			Root.nowQuota = {}; //当前指标
			Root.nowScore = {}; //当前评分
			Root.defScore = false; //默认的评分指标
			Root.studentScoreList = [];
			Root.scoreStatus = {};//评分状态
			Root.scoreMap = {};
			Root.maxStudent = {}; //最高分
			Root.minStudent = {}; //最低分

			function getEqua(){
				var aRec = 0;
				var num = 0;
				for(var i in nowRecord){
					aRec += nowRecord[i];
					num++;
				}
				return aRec;
			}

			//后台变更指标
			Scope.changeQuota = function(id){
				Root.nowQuota = Root.quotaMap[id];
			}	

			//后台创建指标
			Scope.createQuota = function(){
				Root.nowQuota = {};
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

			//取学生本月的分数.并记总数
			function getStudentNewQuota(type){
				var list = [];
				var total = 0;
				var score;
				
				if(Root.nowStudent && Root.nowStudent._id){
					var month = Root.defMonth;
					score = Root.nowStudent.score[month===1?12:month-1] || {};
				}else{
					var month = Root.myInfo.defMonth;
					score = Root.myInfo.score[month===1?12:month-1];
				}
				_.each(Root.nowScore,function(item,idx){
					if(idx!=='total'){
						var self,parent,teacher;
						if($.isEmptyObject(score) || !score[idx]){
							self = 0;
							parent = 0;
							teacher = 0;
						}else{
							self = score[idx].self || 0;
							parent = score[idx].parent || 0;
							teacher = score[idx].teacher || 0;
						}
						
						var obj = {
							indicator:idx,
							self : self,
							parent : parent,
							teacher : teacher
						}
						obj[type]  = item
						//if(Root.nowStudent && Root.nowStudent._id){
						//	total += obj.self + obj.parent;
						//}else{
							total += obj.self + obj.parent+ obj.teacher;
						//}
						list.push(obj);
					}
				});
				if(Root.nowStudent && Root.nowStudent._id){
					//total += Scope.allScore;
				}
				return {
					total : total,
					list : list
				};
			}

			//计算分数
			function getScoreList(data){
				var list = [];
				for(var i in data){
					list.push(data[i]);
				}
				return list;
			}

			//给学生打分
			Scope.saveStudentQuota = function(){
				//console.log(Root.defMonth);
				//不能对整个学期打分
				if(!Root.defMonth){
					return;
				}
				//老师打分
				var sid,tid,year,month

				var month = Root.defMonth || Root.myInfo.defMonth;
				month == 1?month=13:month;

				var param = {
					//month : Root.nowMonth-1 || new Date().getMonth(),
					month : month-1,
					scores : Scope.allScore
				};
				if(!$.isEmptyObject(Root.nowStudent)){
					param.student = Root.nowStudent._id;
					param.term = Root.Term._id;
					param.year = Root.Term.year;
				}else if(Root.myInfo._id){
					param.student = Root.myInfo._id;
					param.term = Root.myInfo.term._id;
					param.year = Root.myInfo.term.year;
				}else{
					alert('还没有选择学生!');
					return;
				}
				param.total = 0;
				// var param = {
				// 	teacherScores : getScoreList(Root.nowScore)
				// }		
				var sp,type;
				if(Root.isTeacher){
					type = 'teacher';
				}else if(Root.getMode() === 'parent'){
					type = 'parent';
				}else{
					type = 'self';
				}
				sp = getStudentNewQuota(type);
				param.scores = sp.list;
				param.total = sp.total;
				// console.log(Root.nowStudent);
				Quota.saveStudentQuota({
					score : JSON.stringify(param)
				});
			}

			//重置学生分数
			Scope.resetStudentQuota = function(){
				if(Root.myInfo._id){
					Scope.allScore = 0;
				}else{
					Scope.allScore = Root.quotaList.length *5;
				}
				for(var i in Root.quotaMap){
					Root.quotaMap[i].now = 0;
				}
			}

			//打分.这里记录id和分数
			//通知设置了分数
			Scope.setStudentQuota = function(id,num,old){
				old = old || 0;
				nowRecord[id] = num;
				/*
				if(Root.nowStudent){
					console.log(Root.nowStudent,Root.nowStudent.score,Root.nowStudent.totals);
				}else{
				*/	
					Root.quotaMap[id].now = num;
					Root.nowScore[id] = num;
					// //这里有问题..要修改下.
					Scope.allScore -=old;
					Scope.allScore += num;
					Root.$emit(CMD_SET_QUOTA,{ 
						id : id,
						num : num
					});					
				//}

			}

			Root.$on('status.student.scoreload',function(){
				var month = Root.nowMonth;
				if(Root.getMode() === 'record'){
					month = Root.defMonth-1;
				}
				//Scope.allScore = Root.nowStudent.total[Root.scoreMonth];
				_.each(Root.nowStudent.score[month],function(item,idx){
					if(idx != 'undefined'){
					Root.nowScore[idx] = item.teacher;
					Scope.allScore -= (5-item.teacher);
					}else{
					} 
				});
			});

			Root.$on('status.grade.change',function(){
				//重新拉学期单指标
				Quota.getQuotaList({
					term : Root.Term._id
				});
			})

			//学生变动
			Root.$on('status.student.change',function(){
				Root.nowScore = {
					total : Root.quotaList.length * 5
				};
				Scope.allScore = Root.quotaList.length *5;
				_.each(Root.quotaList,function(item){
					Root.nowScore[item._id] = 5;
				});
				Scope.resetStudentQuota();
			});

			function getOneScores(type){
				var total = 0;	
				var month = Root.myInfo.defMonth===1?12:Root.myInfo.defMonth-1;
				if(Root.myInfo.score[month]){
					_.each(Root.myInfo.score[month],function(item,idx){
						Root.nowScore[idx] = item[type];
						total += item[type];
					});
				}else{
					Root.nowScore = {};
				}
				Scope.allScore = total;
			}	


			Root.$on('status.student.quotacheng',function(){
				Scope.allScore = 0
				if(Root.getMode() === 'parent'){
					getOneScores('parent');
				//学生
				}else if(Root.getMode() === 'self'){
					getOneScores('self');
				}else if(Root.getMode() === 'record'){
					if(!Root.myInfo._id){
						Root.$emit('status.filter.student');
					}
				}else{
					if(!Root.myInfo._id){
						Root.$emit('status.filter.student');
					}					
				}
			});

			Root.$on('status.myinfo.load',function(){
				var param = {
					term : Root.Term._id
				}
				Quota.getQuotaList(param);

				var param = {
					term : Root.Term._id,
					grade : Root.myInfo.grade,
					class : Root.myInfo.class,
					month : Root.studentMonth
				}
				Quota.getScores(param);
			});

			Root.$on('status.term.load.quota',function(){
				var param = {
					term : Root.Term._id
				}
				Quota.getQuotaList(param);
			});			
		}
	]);
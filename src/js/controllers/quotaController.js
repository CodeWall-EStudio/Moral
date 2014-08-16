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
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

			var quotaList = {};
			var nowQuota = {};
			var length = 0;//指标个数
			var allRecord = 0;//总分
			var nowRecord = {};//当前指标打分列表

			for(var i = 0;i<10;i++){
				length++;
				quotaList[i+100] = {
					id : i+100,
					name : '指标'+i,
					no : i,
					now : 0,
					info : '说明说明说明说明说明说明说明说明说明说明'
				};
			}

			Scope.quotaList = quotaList;
			Scope.nowQuota = nowQuota;
			Scope.equaRecord = 0;

			function getEqua(){
				var aRec = 0;
				var num = 0;
				for(var i in nowRecord){
					aRec += nowRecord[i];
					num++;
				}
				return aRec/num;
			}

			//后台变更指标
			Scope.changeQuota = function(idx){
				console.log(idx);
				Scope.nowQuota = quotaList[idx];
			}	

			//后台创建指标
			Scope.createQuota = function(){

			}	

			//后台保存指标
			Scope.saveQuota = function(){
				console.log(nowQuota);
			}

			//后台删除指标
			Scope.delQuota = function(){
				console.log(nowQuota);
			}			

			//给学生打分
			Scope.saveStudentQuota = function(){

				Root.$emit(CMD_SAVE_QUOTA,nowRecord);
			}

			//重置学生分数
			Scope.resetStudentQuota = function(){
				Scope.equaRecord = 0;
				for(var i in Scope.quotaList){
					Scope.quotaList[i].now = 0;
				}
			}

			//打分.这里记录id和分数
			//通知设置了分数
			Scope.setStudentQuota = function(id,num){

				nowRecord[id] = num;
				console.log(id,num);
				Scope.quotaList[id].now = num;

				//这里有问题..要修改下.
				Scope.equaRecord = getEqua();

				Root.$emit(CMD_SET_QUOTA,{ 
					id : id,
					num : num
				});
			}
		}
	]);
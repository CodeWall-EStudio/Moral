angular.module('dy.controllers.gradepanel',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'	
	])
	.controller('GradePanelController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){

			var selectMonth = [];
			var defMonthLength = 5

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
					if(!Root.Term.months){
						Root.Term.months = {};
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
					name : Root.nowTerm.name,
					active : false,
					year : new Date().getFullYear(),
					day : Root.nowTerm.day,
					months : Root.nowTerm.months
				}
				if(Root.nowTerm._id){
					param._id = Root.nowTerm._id;
					param.active = Root.nowTerm.active;
				}
				Mgrade.createTerm({
					term : JSON.stringify(param)
				});
				Root.hideGradePanel();
			}

			Root.modifyTerm = function(id){
				Root.Term = Root.termList[id];
				Root.nowTerm = {};
				$.extend(Root.nowTerm,Root.Term);
				Root.$emit('create.grade.show',true);
			}			

			Root.setActiveTerm = function(id){
				var param = Root.termList[id];
				Mgrade.setActTerm({
					id : param._id,
					active : true
				});
				console.log(param);
			}

			Root.closeTerm = function(id){
				var param = Root.termList[id];
				param.active = false;
				Mgrade.setActTerm({
					id : param._id,
					active : false
				});
			}			



			Root.$on('create.grade.show',function(e,d){
				if(!d){
					Scope.panelTitle = '新建学期';
					Root.nowTerm = {};
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
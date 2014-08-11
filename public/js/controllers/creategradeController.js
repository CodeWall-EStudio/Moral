angular.module('dy.controllers.gradepanel',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'	
	])
	.controller('GradePanelController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){

			var selectMonth = [];
			var defMonthLength = 5;
			Root.Term = {};

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
				if(Root.Term.id){
					Scope.modifyTerm();
				}else{
					Scope.createTerm();
				}
			}

			/* term: {"name":"2014-2015学年度 第一学期","active": false, "year": 2014, "day": 15, "months":[{"s":9,"e":10}, {"s":10, "e":11}, {"s":11, "e":12}, {"s":12, "e":1}]}*/
			Scope.createTerm = function(){
				var param = {
					name : Root.Term.name,
					active : true,
					year : new Date().getFullYear(),
					day : Root.Term.day,
					months : Root.Term.months
				}
				Mgrade.createTerm({
					term : param
				});
			}

			Scope.modifyTerm = function(){
				var param = {
					name : Root.name,
					active : Root.Term.name,
					year : new Date().getFullYear(),
					day : Root.Term.day,
					months : Root.Term.months
				}
				Mgrade.modifyTerm(param);
			}

			Root.$on('create.grade.show',function(e,d){

				Scope.panelTitle = '新建学期';
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
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
					//console.log(list[i],dom);
					if(i >= idx-1 && i < idx+defMonthLength-1){
						$(this).addClass('active').removeClass('disabled');
					}else{
						$(this).removeClass('active').addClass('disabled');
						selectMonth.push(i+1);
					}
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
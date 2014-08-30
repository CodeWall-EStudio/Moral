angular.module('dy.controllers.gradepanel',[
        'dy.constants',
        'dy.services.utils',
        'dy.services.mgrade'	
	])
	.directive("fileread", [function () {
	    return {
	        scope: {
	            fileread: "="
	        },
	        link: function (scope, element, attributes) {
	        	console.log(scope,element,attributes);
	            element.bind("change", function (changeEvent) {
	                scope.$apply(function () {
	                	console.log(changeEvent);
	                    scope.fileread = changeEvent.target.files[0];
	                    // or all selected files:
	                    // scope.fileread = changeEvent.target.files;
	                });
	            });
	        }
	    }
	}])
	.controller('GradePanelController',[
		'$rootScope', '$scope','Util','mGradeService',function(Root,Scope,Util,Mgrade){

			var selectMonth = [];
			var defMonthLength = 4;
			var selectMonth = [];

			window.uploadTeacher = function(){
				$('#teacherFrom').submit();
			}

			window.uploadStudent = function(){
				$('#studentFrom').submit();
			}

			window.uploadQuota = function(){
				$('#quotaFrom').submit();
			}

			function checkMonth(idx){

				var list = $('#gradePanelModal .select-month li');
				selectMonth = [];
				list.each(function(i){
					if(i >= idx-1 && i < idx+defMonthLength-1){
						$(this).addClass('active').removeClass('disabled').removeAttr('title');
						selectMonth.push({
							's' : i+1>12?1:i+1,
							'e' : i+2>12?1:i+2
						});						
					}else{
						$(this).removeClass('active').addClass('disabled').removeAttr('title');
					}
					if(!Root.Term.months){
						Root.Term.months = {};
					}
				});
				if(selectMonth.length < defMonthLength){
					var l = defMonthLength - selectMonth.length;
					for(var i = 0;i<l;i++){
						selectMonth.push({
							s : i+1,
							e : i+2
						});
						list.eq(i).addClass('active').removeClass('disabled').attr('title','下一年');
					}
				}
				Root.nowTerm.months = selectMonth;
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

			Root.importTeacher = function(){
			}

			Scope.handleConfirmBtnClick = function(){
				if(Root.Term._id){
					Scope.createTerm();
				}else{
					Scope.createTerm();
				}
			}

			Scope.createTerm = function(){
				if(!Root.nowTerm.name || (Root.nowTerm.name && Root.nowTerm.name === '')){
					alert('学期名称必填');
					return;
				}
				if(!Root.nowTerm.day ){
					alert('还没有选结束日期');
					return;
				}				

				if($.isEmptyObject(Root.nowTerm.months)){
					alert('还没有选择月份!')
					return;
				}
				var param = {
					name : Root.nowTerm.name,
					status : Root.nowTerm.status || 0,
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
					status : 1
				});
				console.log(param);
			}

			Root.closeTerm = function(id,type){
				var param = Root.termList[id];
				var status = type || 0;
				param.active = false;
				Mgrade.setActTerm({
					id : param._id,
					status : type
				});
			}			

			Root.$on('status.grade.created',function(e,d){
				$('#gradePanelModal .select-month li').removeClass('active').removeClass('disabled').removeAttr('title');

			});

			Scope.checkTremMonth = function(month){
				if($.inArray(month,selectMonth)>=0){
					return true;
				}
				return false;
			}


			Root.$on('create.grade.show',function(e,d){
				if(!d){
					Scope.panelTitle = '新建学期';
					Root.nowTerm = {};
					selectMonth = [];
				}else{
					Scope.panelTitle = '修改学期';
					_.each(Root.nowTerm.months,function(item){
						selectMonth.push(item.s);
					});
				}
				Scope.confirmBtnTitle = '保存';
				Scope.cancelBtnTitle = '取消';

				var list = [];
				var month = [];
				for(var i = 1;i<32;i++){
					list.push(i);
				}
				for(var i = 1;i<13;i++){
					month.push(i);
				}


				$('#gradePanelModal .select-month li').removeClass('disabled').removeClass('active').removeAttr('title');
				Scope.daylist = list;
				Scope.monthlist = month;

				Root.showGradePanel();
			});


		}
	]);
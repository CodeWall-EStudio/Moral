/*
http://dand.71xiaoxue.com:80/sso.web
/lohin?service=回调地址
/logout
/validate?ticket=登陆拿到的ticket&service=回调地址
*/
angular.module('dy.controllers.loginSSO', [
        'dy.constants',
        'dy.services.utils',
        'dy.services.teacherlogin'
    ])
    .controller('LoginSSOController', [
    	'$rootScope', '$scope','Util','tLoginServer',function($rootScope,$scope,util,tlogin){
    		var skey = util.cookie.get('skey');

    		var ticket = util.getParameter('ticket');

    		console.log(tlogin);
			//console.log(skey,ticket);
    		if(typeof skey !== 'undefined' || ticket){
    			tlogin.getTeacher(ticket);
    		}else{
    			var url = 'http://t1.codewalle.com/teacherlogin.html';
    			window.location.href = 'http://dand.71xiaoxue.com:80/sso.web/login?service='+url;
    		}
    		console.log(skey);
    		
    	}
    ]);
/*
http://dand.71xiaoxue.com:80/sso.web
/lohin?service=回调地址
/logout
/validate?ticket=登陆拿到的ticket&service=回调地址
*/
angular.module('dy.controllers.loginUin', [
        'dy.constants',
        'dy.services.utils'
    ])
    .controller('loginUinController', [
    	'$rootScope', '$scope','Util',function($rootScope,$scope,util){
    		$scope.skey = util.cookie.get('skey');
    		console.log($scope.skey);
    		
    	}
    ]);
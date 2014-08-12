/*
http://dand.71xiaoxue.com:80/sso.web
/lohin?service=回调地址
/logout
/validate?ticket=登陆拿到的ticket&service=回调地址
*/
angular.module('dy.controllers.loginUin', [
        'dy.constants',
        'dy.services.utils',
        'dy.services.login'
    ])
    .controller('loginUinController', [
    	'$rootScope', '$scope','Util','Login',function(Root,Scope,Util,Login){
    		Scope.skey = Util.cookie.get('skey');

            Scope.username = '';
            Scope.pwd = '';

            Scope.loginStudent = function(){
                var param = {
                    id : Scope.username,
                    number : Scope.pwd
                }
                //console.log(param);
                Login.studentLogin(param);
            }
            
    		console.log(Scope.skey);
    		
    	}
    ]);
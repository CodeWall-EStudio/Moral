;(function(){
    angular.module('manage', [
        'dy.controllers.mgradelist', //年级列表
        'dy.controllers.managenav', //导航条
        'dy.controllers.managehandernav', //导航条
        'dy.controllers.user', //用户
        'dy.controllers.teacher',//用户
        'dy.controllers.quota',//用户
        'dy.controllers.gradepanel' //创建年级
    ]);
})();
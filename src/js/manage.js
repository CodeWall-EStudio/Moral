;(function(){
    angular.module('manage', [
        'dy.controllers.mgradelist', //年级列表
        'dy.controllers.msg',
        'dy.controllers.managenav', //导航条
        'dy.controllers.manage', //授权管理
        'dy.controllers.managehandernav', //导航条
        'dy.controllers.student', //学生
        'dy.controllers.teacher',//老师
        'dy.controllers.quota',//指标
        'dy.controllers.gradepanel' //年级
    ]);
})();
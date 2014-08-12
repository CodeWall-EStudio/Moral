;(function(){
    angular.module('teacher', [
        'dy.controllers.mgradelist', //年级列表
        'dy.controllers.indexnav', //导航条
        'dy.controllers.managehandernav', //学期
        'dy.controllers.student',//学生
        'dy.controllers.teacher',//老师
        'dy.controllers.quota'//指标
    ]);
})();
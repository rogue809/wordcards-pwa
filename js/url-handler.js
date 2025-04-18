// 处理URL参数，支持从PWA快捷方式直接启动特定功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    // 根据参数执行相应操作
    if (action) {
        // 延迟执行以确保应用已完全加载
        setTimeout(() => {
            switch(action) {
                case 'study':
                    // 启动学习模式
                    document.getElementById('study-btn').click();
                    break;
                    
                case 'create':
                    // 打开创建卡片模态框
                    document.getElementById('create-card-btn').click();
                    break;
            }
        }, 500);
    }
});
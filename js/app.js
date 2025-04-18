// 定义数据库名称和版本
const DB_NAME = 'WordscardsDB';
const DB_VERSION = 1;
let db;

// 初始化事件处理
document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据库
    initDatabase();
    
    // 初始化下拉菜单事件
    initDropdowns();
    
    // 初始化标签切换
    initTabs();
    
    // 初始化其他按钮事件
    initButtons();
});

// 初始化数据库
function initDatabase() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    // 创建数据库结构
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        
        // 创建卡片存储
        if (!db.objectStoreNames.contains('cards')) {
            const cardsStore = db.createObjectStore('cards', { keyPath: 'id', autoIncrement: true });
            cardsStore.createIndex('category1', 'category1', { multiEntry: false });
            cardsStore.createIndex('category2', 'category2', { multiEntry: false });
            cardsStore.createIndex('category3', 'category3', { multiEntry: false });
            cardsStore.createIndex('category4', 'category4', { multiEntry: false });
            cardsStore.createIndex('difficulty', 'difficulty', { multiEntry: false });
            cardsStore.createIndex('studyCount', 'studyCount', { multiEntry: false });
        }
        
        // 创建学习日志存储
        if (!db.objectStoreNames.contains('logs')) {
            const logsStore = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
            // 确保我们有备注字段（notes）
        }
    };
    
    // 数据库打开成功
    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('数据库连接成功');
        
        // 初始化应用
        initApp();
    };
    
    // 数据库打开失败
    request.onerror = function(event) {
        console.error('数据库连接失败:', event.target.error);
        showToast('数据库连接失败，请刷新页面重试', 'error');
    };
}

// 显示提示信息
function showToast(message, type = 'info') {
    // 检查是否已存在toast元素
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    
    // 设置类型样式
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// 初始化应用
function initApp() {
    // 加载卡片
    loadCards();
    
    // 加载日志
    loadLogs();
    
    // 初始化过滤器
    initFilters();
}

// 初始化下拉菜单
function initDropdowns() {
    // 为所有下拉按钮添加点击事件
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');
    
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            
            // 关闭所有其他下拉菜单
            const allDropdowns = document.querySelectorAll('.dropdown-content');
            allDropdowns.forEach(dropdown => {
                if (dropdown !== this.nextElementSibling) {
                    dropdown.classList.remove('show');
                }
            });
            
            // 切换当前下拉菜单
            const dropdownContent = this.nextElementSibling;
            dropdownContent.classList.toggle('show');
        });
    });
    
    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', function(e) {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            if (!e.target.closest('.dropdown-container')) {
                dropdown.classList.remove('show');
            }
        });
    });
    
    // 为下拉菜单中的按钮添加事件
    const actionBtns = document.querySelectorAll('.dropdown-actions button');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            
            const dropdown = this.closest('.dropdown-content');
            const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
            
            if (this.classList.contains('select-all')) {
                checkboxes.forEach(cb => cb.checked = true);
            } else if (this.classList.contains('deselect-all')) {
                checkboxes.forEach(cb => cb.checked = false);
            } else if (this.classList.contains('invert-selection')) {
                checkboxes.forEach(cb => cb.checked = !cb.checked);
            }
            
            // 触发过滤器更新
            updateFilters();
        });
    });
    
    // 为复选框添加更改事件
    const checkboxes = document.querySelectorAll('.dropdown-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            updateFilters();
        });
    });
}

// 初始化标签切换
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的active类
            tabs.forEach(t => t.classList.remove('active'));
            
            // 为当前标签添加active类
            this.classList.add('active');
            
            // 获取对应内容ID
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(`${tabId}-tab`);
            
            // 隐藏所有内容
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 显示对应内容
            tabContent.classList.add('active');
        });
    });
}

// 初始化按钮事件
function initButtons() {
    // 创建卡片按钮
    const createCardBtn = document.getElementById('create-card-btn');
    if (createCardBtn) {
        createCardBtn.addEventListener('click', function() {
            openCardModal();
        });
    }
    
    // 关闭卡片模态框
    const closeCardModal = document.getElementById('close-card-modal');
    if (closeCardModal) {
        closeCardModal.addEventListener('click', function() {
            document.getElementById('card-modal').style.display = 'none';
        });
    }
    
    // 导出按钮
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportData();
        });
    }
    
    // 导入按钮
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            document.getElementById('import-modal').style.display = 'block';
        });
    }
    
    // 关闭导入模态框
    const closeImportModal = document.getElementById('close-import-modal');
    if (closeImportModal) {
        closeImportModal.addEventListener('click', function() {
            document.getElementById('import-modal').style.display = 'none';
        });
    }
    
    // 学习按钮
    const studyBtn = document.getElementById('study-btn');
    if (studyBtn) {
        studyBtn.addEventListener('click', function() {
            startStudyMode();
        });
    }
    
    // 关闭学习模式
    const closeStudyBtn = document.getElementById('close-study-btn');
    if (closeStudyBtn) {
        closeStudyBtn.addEventListener('click', function() {
            document.getElementById('study-container').style.display = 'none';
        });
    }
    
    // 翻转卡片
    const flipBtn = document.getElementById('flip-btn');
    if (flipBtn) {
        flipBtn.addEventListener('click', function() {
            flipStudyCard();
        });
    }
    
    // 下一张卡片
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            nextStudyCard();
        });
    }
    
    // 添加图片按钮
    const frontImageBtn = document.getElementById('front-image-btn');
    const backImageBtn = document.getElementById('back-image-btn');
    
    if (frontImageBtn) {
        frontImageBtn.addEventListener('click', function() {
            document.getElementById('front-image-input').click();
        });
    }
    
    if (backImageBtn) {
        backImageBtn.addEventListener('click', function() {
            document.getElementById('back-image-input').click();
        });
    }
    
    // 导入文件选择
    const importFile = document.getElementById('import-file');
    if (importFile) {
        importFile.addEventListener('change', function() {
            handleImportFileChange();
        });
    }
    
    // 导入提交
    const importSubmit = document.getElementById('import-submit');
    if (importSubmit) {
        importSubmit.addEventListener('click', function() {
            importData();
        });
    }
    
    // 卡片表单提交
    const cardForm = document.getElementById('card-form');
    if (cardForm) {
        cardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCard();
        });
    }

    // 正反调整按钮
    const swapContentBtn = document.getElementById('swap-content-btn');
    if (swapContentBtn) {
        swapContentBtn.addEventListener('click', function() {
            swapCardContent();
        });
    }
    
    // 关闭日志编辑模态框
    const closeLogEditModal = document.getElementById('close-log-edit-modal');
    if (closeLogEditModal) {
        closeLogEditModal.addEventListener('click', function() {
            document.getElementById('log-edit-modal').style.display = 'none';
        });
    }
    
    // 日志编辑表单提交
    const logEditForm = document.getElementById('log-edit-form');
    if (logEditForm) {
        logEditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveLogEdit();
        });
    }
    
    // 添加键盘快捷键
    document.addEventListener('keydown', function(e) {
        // 学习模式快捷键
        if (document.getElementById('study-container').style.display === 'block') {
            if (e.key === ' ' || e.key === 'Enter') {
                // 空格或回车键 - 翻转/下一张
                e.preventDefault();
                
                if (document.getElementById('flip-btn').style.display !== 'none') {
                    flipStudyCard();
                } else if (document.getElementById('next-btn').style.display !== 'none') {
                    nextStudyCard();
                }
            }
            
            if (e.key === 'Escape') {
                // ESC键 - 关闭学习模式
                document.getElementById('study-container').style.display = 'none';
            }
        }
        
        // 模态框快捷键
        if (document.getElementById('card-modal').style.display === 'block' || 
            document.getElementById('import-modal').style.display === 'block' ||
            document.getElementById('log-edit-modal').style.display === 'block') {
            if (e.key === 'Escape') {
                // ESC键 - 关闭模态框
                document.getElementById('card-modal').style.display = 'none';
                document.getElementById('import-modal').style.display = 'none';
                document.getElementById('log-edit-modal').style.display = 'none';
            }
        }
    });
}

// 加载卡片
function loadCards(filters = {}) {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = '<div style="text-align: center; padding: 20px;">加载中...</div>';
    
    const transaction = db.transaction(['cards'], 'readonly');
    const cardsStore = transaction.objectStore('cards');
    const request = cardsStore.getAll();
    
    request.onsuccess = function(event) {
        let cards = event.target.result;
        
        // 应用过滤器
        if (filters.category1 && filters.category1.length > 0) {
            cards = cards.filter(card => filters.category1.includes(card.category1) || !card.category1);
        }
        if (filters.category2 && filters.category2.length > 0) {
            cards = cards.filter(card => filters.category2.includes(card.category2) || !card.category2);
        }
        if (filters.category3 && filters.category3.length > 0) {
            cards = cards.filter(card => filters.category3.includes(card.category3) || !card.category3);
        }
        if (filters.category4 && filters.category4.length > 0) {
            cards = cards.filter(card => filters.category4.includes(card.category4) || !card.category4);
        }
        if (filters.difficulty && filters.difficulty.length > 0) {
            cards = cards.filter(card => filters.difficulty.includes(card.difficulty));
        }
        if (filters.studyCount && filters.studyCount.length > 0) {
            cards = cards.filter(card => {
                const count = card.studyCount || 0;
                return filters.studyCount.some(rangeStr => {
                    if (rangeStr === '0') return count === 0;
                    if (rangeStr === '1') return count === 1;
                    if (rangeStr === '2') return count === 2;
                    if (rangeStr === '3') return count === 3;
                    if (rangeStr === '4') return count === 4;
                    if (rangeStr === '5') return count === 5;
                    if (rangeStr === '6-10') return count >= 6 && count <= 10;
                    if (rangeStr === '10+') return count > 10;
                    return false;
                });
            });
        }
        
        // 渲染卡片
        renderCards(cards);
    };
    
    request.onerror = function(event) {
        console.error('加载卡片失败:', event.target.error);
        cardContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">加载卡片失败</div>';
        showToast('加载卡片失败', 'error');
    };
}

// 渲染卡片
function renderCards(cards) {
    const cardContainer = document.getElementById('card-container');
    
    if (cards.length === 0) {
        cardContainer.innerHTML = '<div style="text-align: center; padding: 20px;">没有找到匹配的卡片</div>';
        return;
    }
    
    cardContainer.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <div class="card-front">${card.front}</div>
            <div class="card-info">
                分类: ${card.category1 || '-'} > ${card.category2 || '-'} > ${card.category3 || '-'} > ${card.category4 || '-'}<br>
                难度: ${card.difficulty || 'C'}<br>
                学习次数: ${card.studyCount || 0}
            </div>
            <div class="card-actions">
                <button class="btn btn-primary btn-view" data-id="${card.id}">查看</button>
                <button class="btn btn-secondary btn-edit" data-id="${card.id}">编辑</button>
                <button class="btn btn-danger btn-delete" data-id="${card.id}">删除</button>
            </div>
        `;
        
        // 添加事件监听
        cardContainer.appendChild(cardElement);
        
        // 查看按钮
        cardElement.querySelector('.btn-view').addEventListener('click', function() {
            viewCard(card.id);
        });
        
        // 编辑按钮
        cardElement.querySelector('.btn-edit').addEventListener('click', function() {
            editCard(card.id);
        });
        
        // 删除按钮
        cardElement.querySelector('.btn-delete').addEventListener('click', function() {
            deleteCard(card.id);
        });
    });
}

// 加载日志
function loadLogs() {
    const logsContainer = document.getElementById('logs-container');
    logsContainer.innerHTML = '<div style="text-align: center; padding: 20px;">加载中...</div>';
    
    const transaction = db.transaction(['logs'], 'readonly');
    const logsStore = transaction.objectStore('logs');
    const request = logsStore.getAll();
    
    request.onsuccess = function(event) {
        const logs = event.target.result;
        
        if (logs.length === 0) {
            logsContainer.innerHTML = '<div style="text-align: center; padding: 20px;">暂无学习日志</div>';
            return;
        }
        
        logsContainer.innerHTML = '';
        
        // 按日期降序排序
        logs.sort((a, b) => b.date - a.date);
        
        logs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = 'log-item';
            
            const date = new Date(log.date);
            const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            // 构建难度统计HTML
            let difficultyHtml = '';
            if (log.difficultyCounts) {
                difficultyHtml = `
                    <div class="log-difficulty">
                        <strong>难度统计:</strong>
                        SS级: ${log.difficultyCounts.SS || 0},
                        S级: ${log.difficultyCounts.S || 0},
                        A级: ${log.difficultyCounts.A || 0},
                        B级: ${log.difficultyCounts.B || 0},
                        C级: ${log.difficultyCounts.C || 0}
                    </div>
                `;
            }
            
            // 构建过滤器HTML
            let filtersHtml = '';
            if (log.filters) {
                // 以更可读的方式格式化过滤器
                const formattedFilters = [];
                
                // 处理分类过滤器
                for (let i = 1; i <= 4; i++) {
                    const key = `category${i}`;
                    if (log.filters[key] && log.filters[key].length > 0) {
                        formattedFilters.push(`${i}级分类: ${log.filters[key].join(', ')}`);
                    }
                }
                
                // 处理难度过滤器
                if (log.filters.difficulty && log.filters.difficulty.length > 0) {
                    formattedFilters.push(`难度: ${log.filters.difficulty.join(', ')}`);
                }
                
                // 处理学习次数过滤器
                if (log.filters.studyCount && log.filters.studyCount.length > 0) {
                    formattedFilters.push(`学习次数: ${log.filters.studyCount.join(', ')}`);
                }
                
                if (formattedFilters.length > 0) {
                    filtersHtml = `
                        <div class="log-filters">
                            <strong>过滤条件:</strong> ${formattedFilters.join(' | ')}
                        </div>
                    `;
                }
            }
            
            // 添加备注HTML
            let notesHtml = '';
            if (log.notes) {
                notesHtml = `
                    <div class="log-notes">
                        <strong>备注:</strong> ${log.notes}
                    </div>
                `;
            }
            
            // 添加操作按钮
            const actionsHtml = `
                <div class="log-actions">
                    <button class="btn btn-secondary btn-sm btn-edit-log" data-id="${log.id}">编辑</button>
                    <button class="btn btn-danger btn-sm btn-delete-log" data-id="${log.id}">删除</button>
                </div>
            `;
            
            logElement.innerHTML = `
                <div class="log-date">${dateStr}</div>
                <div class="log-details">
                    学习了 ${log.count} 张卡片
                    ${difficultyHtml}
                    ${filtersHtml}
                    ${notesHtml}
                </div>
                ${actionsHtml}
            `;
            
            logsContainer.appendChild(logElement);
            
            // 添加按钮事件监听
            logElement.querySelector('.btn-edit-log').addEventListener('click', function() {
                editLog(log.id);
            });
            
            logElement.querySelector('.btn-delete-log').addEventListener('click', function() {
                deleteLog(log.id);
            });
        });
    };
    
    request.onerror = function(event) {
        console.error('加载日志失败:', event.target.error);
        logsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">加载日志失败</div>';
        showToast('加载日志失败', 'error');
    };
}

// 编辑日志
function editLog(id) {
    const transaction = db.transaction(['logs'], 'readonly');
    const logsStore = transaction.objectStore('logs');
    const request = logsStore.get(id);
    
    request.onsuccess = function(event) {
        const log = event.target.result;
        
        // 填充表单
        document.getElementById('log-edit-id').value = log.id;
        document.getElementById('log-edit-notes').value = log.notes || '';
        
        // 显示模态框
        document.getElementById('log-edit-modal').style.display = 'block';
    };
    
    request.onerror = function(event) {
        console.error('获取日志失败:', event.target.error);
        showToast('获取日志失败', 'error');
    };
}

// 保存日志编辑
function saveLogEdit() {
    const id = parseInt(document.getElementById('log-edit-id').value);
    const notes = document.getElementById('log-edit-notes').value;
    
    const transaction = db.transaction(['logs'], 'readwrite');
    const logsStore = transaction.objectStore('logs');
    
    // 获取当前日志
    const request = logsStore.get(id);
    
    request.onsuccess = function(event) {
        const log = event.target.result;
        
        // 更新备注
        log.notes = notes;
        
        // 保存更新
        const updateRequest = logsStore.put(log);
        
        updateRequest.onsuccess = function() {
            // 关闭模态框
            document.getElementById('log-edit-modal').style.display = 'none';
            
            // 重新加载日志
            loadLogs();
            
            showToast('日志更新成功', 'success');
        };
        
        updateRequest.onerror = function(event) {
            console.error('更新日志失败:', event.target.error);
            showToast('更新日志失败', 'error');
        };
    };
    
    request.onerror = function(event) {
        console.error('获取日志失败:', event.target.error);
        showToast('获取日志失败', 'error');
    };
}

// 删除日志
function deleteLog(id) {
    if (confirm('确定要删除这条日志记录吗？')) {
        const transaction = db.transaction(['logs'], 'readwrite');
        const logsStore = transaction.objectStore('logs');
        
        const request = logsStore.delete(id);
        
        request.onsuccess = function() {
            // 重新加载日志
            loadLogs();
            showToast('日志删除成功', 'success');
        };
        
        request.onerror = function(event) {
            console.error('删除日志失败:', event.target.error);
            showToast('删除日志失败', 'error');
        };
    }
}

// 初始化过滤器
function initFilters() {
    // 获取所有不同的分类
    const transaction = db.transaction(['cards'], 'readonly');
    const cardsStore = transaction.objectStore('cards');
    const request = cardsStore.getAll();
    
    request.onsuccess = function(event) {
        const cards = event.target.result;
        
        // 获取分类列表
        const categories1 = [...new Set(cards.map(card => card.category1).filter(Boolean))];
        const categories2 = [...new Set(cards.map(card => card.category2).filter(Boolean))];
        const categories3 = [...new Set(cards.map(card => card.category3).filter(Boolean))];
        const categories4 = [...new Set(cards.map(card => card.category4).filter(Boolean))];
        
        // 填充下拉菜单
        fillDropdown('category1', categories1);
        fillDropdown('category2', categories2);
        fillDropdown('category3', categories3);
        fillDropdown('category4', categories4);
        
        // 填充分类列表（用于创建/编辑卡片）
        fillDatalist('category1-list', categories1);
        fillDatalist('category2-list', categories2);
        fillDatalist('category3-list', categories3);
        fillDatalist('category4-list', categories4);
    };
}

// 填充下拉菜单
function fillDropdown(filterName, values) {
    const dropdown = document.querySelector(`.dropdown-container[data-filter="${filterName}"] .dropdown-content`);
    
    // 清除现有选项（保留操作按钮）
    const actions = dropdown.querySelector('.dropdown-actions');
    dropdown.innerHTML = '';
    dropdown.appendChild(actions);
    
    // 添加选项
    values.forEach(value => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        
        const id = `${filterName}-${value.replace(/\s+/g, '-')}`;
        
        item.innerHTML = `
            <input type="checkbox" id="${id}" value="${value}">
            <label for="${id}">${value}</label>
        `;
        
        dropdown.insertBefore(item, actions);
        
        // 添加更改事件
        const checkbox = item.querySelector('input');
        checkbox.addEventListener('change', function() {
            updateFilters();
        });
    });
}

// 填充datalist
function fillDatalist(listId, values) {
    const datalist = document.getElementById(listId);
    if (!datalist) return;
    
    datalist.innerHTML = '';
    
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        datalist.appendChild(option);
    });
}

// 更新过滤器
function updateFilters() {
    const filters = {};
    
    // 获取所有过滤器的值
    document.querySelectorAll('.dropdown-container').forEach(container => {
        const filterName = container.getAttribute('data-filter');
        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkboxes.length > 0) {
            filters[filterName] = Array.from(checkboxes).map(cb => cb.value);
        }
    });
    
    // 应用过滤器
    loadCards(filters);
}

// 打开卡片模态框（创建模式）
function openCardModal() {
    // 重置表单
    document.getElementById('card-form').reset();
    document.getElementById('card-id').value = '';
    document.getElementById('card-modal-title').textContent = '创建新卡片';
    document.getElementById('front-image-preview').innerHTML = '';
    document.getElementById('back-image-preview').innerHTML = '';
    
    // 显示模态框
    document.getElementById('card-modal').style.display = 'block';
}

// 查看卡片
function viewCard(id) {
    const transaction = db.transaction(['cards'], 'readonly');
    const cardsStore = transaction.objectStore('cards');
    const request = cardsStore.get(id);
    
    request.onsuccess = function(event) {
        const card = event.target.result;
        
        // 打开编辑模式但禁用输入
        editCard(id, true);
    };
}

// 编辑卡片
function editCard(id, viewOnly = false) {
    const transaction = db.transaction(['cards'], 'readonly');
    const cardsStore = transaction.objectStore('cards');
    const request = cardsStore.get(id);
    
    request.onsuccess = function(event) {
        const card = event.target.result;
        
        // 填充表单
        document.getElementById('card-id').value = card.id;
        document.getElementById('card-front').value = card.front;
        document.getElementById('card-back').value = card.back;
        document.getElementById('category1').value = card.category1 || '';
        document.getElementById('category2').value = card.category2 || '';
        document.getElementById('category3').value = card.category3 || '';
        document.getElementById('category4').value = card.category4 || '';
        
        // 设置难度
        const difficultyRadio = document.querySelector(`.difficulty-radio[value="${card.difficulty || 'C'}"]`);
        if (difficultyRadio) difficultyRadio.checked = true;
        
        // 显示图片预览（如果有）
        document.getElementById('front-image-preview').innerHTML = '';
        document.getElementById('back-image-preview').innerHTML = '';
        
        if (card.frontImage) {
            const imgElement = document.createElement('img');
            imgElement.src = card.frontImage;
            imgElement.className = 'image-preview';
            document.getElementById('front-image-preview').appendChild(imgElement);
        }
        
        if (card.backImage) {
            const imgElement = document.createElement('img');
            imgElement.src = card.backImage;
            imgElement.className = 'image-preview';
            document.getElementById('back-image-preview').appendChild(imgElement);
        }
        
        // 更新标题
        document.getElementById('card-modal-title').textContent = viewOnly ? '查看卡片' : '编辑卡片';
        
        // 如果是仅查看模式，禁用所有输入
        if (viewOnly) {
            const inputs = document.querySelectorAll('#card-form input, #card-form textarea, #card-form button');
            inputs.forEach(input => {
                if (input.id !== 'close-card-modal') {
                    input.disabled = true;
                }
            });
        } else {
            // 确保所有输入都启用
            const inputs = document.querySelectorAll('#card-form input, #card-form textarea, #card-form button');
            inputs.forEach(input => {
                input.disabled = false;
            });
        }
        
        // 显示模态框
        document.getElementById('card-modal').style.display = 'block';
    };
}

// 删除卡片
function deleteCard(id) {
    if (confirm('确定要删除这张卡片吗？')) {
        const transaction = db.transaction(['cards'], 'readwrite');
        const cardsStore = transaction.objectStore('cards');
        const request = cardsStore.delete(id);
        
        request.onsuccess = function() {
            // 重新加载卡片
            loadCards();
            showToast('卡片删除成功', 'success');
        };
        
        request.onerror = function(event) {
            console.error('删除卡片失败:', event.target.error);
            showToast('删除卡片失败', 'error');
        };
    }
}

// 保存卡片
function saveCard() {
    // 获取表单数据
    const id = document.getElementById('card-id').value;
    const front = document.getElementById('card-front').value;
    const back = document.getElementById('card-back').value;
    const category1 = document.getElementById('category1').value;
    const category2 = document.getElementById('category2').value;
    const category3 = document.getElementById('category3').value;
    const category4 = document.getElementById('category4').value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    
    // 获取图片数据
    const frontImagePreview = document.getElementById('front-image-preview');
    const backImagePreview = document.getElementById('back-image-preview');
    
    let frontImage = null;
    let backImage = null;
    
    if (frontImagePreview.querySelector('img')) {
        frontImage = frontImagePreview.querySelector('img').src;
    }
    
    if (backImagePreview.querySelector('img')) {
        backImage = backImagePreview.querySelector('img').src;
    }
    
    // 创建卡片对象
    const card = {
        front,
        back,
        category1,
        category2,
        category3,
        category4,
        difficulty,
        frontImage,
        backImage
    };
    
    // 如果是编辑模式，添加ID和保留原来的学习信息
    if (id) {
        card.id = parseInt(id);
        
        // 获取原卡片以保留学习信息
        const transaction = db.transaction(['cards'], 'readonly');
        const cardsStore = transaction.objectStore('cards');
        const request = cardsStore.get(parseInt(id));
        
        request.onsuccess = function(event) {
            const originalCard = event.target.result;
            
            // 保留学习信息
            card.lastStudied = originalCard.lastStudied;
            card.studyCount = originalCard.studyCount || 0;
            
            // 保存更新后的卡片
            saveCardToDatabase(card);
        };
        
        request.onerror = function(event) {
            console.error('获取原卡片失败:', event.target.error);
            showToast('获取原卡片失败', 'error');
        };
    } else {
        // 新卡片，设置初始学习信息
        card.lastStudied = null;
        card.studyCount = 0;
        
        // 直接保存新卡片
        saveCardToDatabase(card);
    }
}

// 保存卡片到数据库
function saveCardToDatabase(card) {
    const transaction = db.transaction(['cards'], 'readwrite');
    const cardsStore = transaction.objectStore('cards');
    
    let request;
    if (card.id) {
        request = cardsStore.put(card);
    } else {
        request = cardsStore.add(card);
    }
    
    request.onsuccess = function() {
        // 关闭模态框
        document.getElementById('card-modal').style.display = 'none';
        
        // 重新加载卡片
        loadCards();
        
        // 重新初始化过滤器
        initFilters();
        
        showToast('卡片保存成功', 'success');
    };
    
    request.onerror = function(event) {
        console.error('保存卡片失败:', event.target.error);
        showToast('保存卡片失败', 'error');
    };
}

// 交换卡片正反面内容
function swapCardContent() {
    // 获取正面和反面的文本内容
    const frontText = document.getElementById('card-front').value;
    const backText = document.getElementById('card-back').value;
    
    // 交换文本内容
    document.getElementById('card-front').value = backText;
    document.getElementById('card-back').value = frontText;
    
    // 获取正面和反面的图片预览元素
    const frontPreview = document.getElementById('front-image-preview');
    const backPreview = document.getElementById('back-image-preview');
    
    // 保存图片内容
    const frontImageHTML = frontPreview.innerHTML;
    const backImageHTML = backPreview.innerHTML;
    
    // 交换图片内容
    frontPreview.innerHTML = backImageHTML;
    backPreview.innerHTML = frontImageHTML;
    
    // 通知用户
    showToast('卡片正反面内容已调整', 'success');
}

// 开始学习模式
function startStudyMode() {
    // 获取过滤后的卡片
    const transaction = db.transaction(['cards'], 'readonly');
    const cardsStore = transaction.objectStore('cards');
    const request = cardsStore.getAll();
    
    request.onsuccess = function(event) {
        let cards = event.target.result;
        
        // 应用当前过滤器
        const filters = {};
        document.querySelectorAll('.dropdown-container').forEach(container => {
            const filterName = container.getAttribute('data-filter');
            const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
            
            if (checkboxes.length > 0) {
                filters[filterName] = Array.from(checkboxes).map(cb => cb.value);
            }
        });
        
        // 应用过滤器
        if (filters.category1 && filters.category1.length > 0) {
            cards = cards.filter(card => filters.category1.includes(card.category1) || !card.category1);
        }
        if (filters.category2 && filters.category2.length > 0) {
            cards = cards.filter(card => filters.category2.includes(card.category2) || !card.category2);
        }
        if (filters.category3 && filters.category3.length > 0) {
            cards = cards.filter(card => filters.category3.includes(card.category3) || !card.category3);
        }
        if (filters.category4 && filters.category4.length > 0) {
            cards = cards.filter(card => filters.category4.includes(card.category4) || !card.category4);
        }
        if (filters.difficulty && filters.difficulty.length > 0) {
            cards = cards.filter(card => filters.difficulty.includes(card.difficulty));
        }
        if (filters.studyCount && filters.studyCount.length > 0) {
            cards = cards.filter(card => {
                const count = card.studyCount || 0;
                return filters.studyCount.some(rangeStr => {
                    if (rangeStr === '0') return count === 0;
                    if (rangeStr === '1') return count === 1;
                    if (rangeStr === '2') return count === 2;
                    if (rangeStr === '3') return count === 3;
                    if (rangeStr === '4') return count === 4;
                    if (rangeStr === '5') return count === 5;
                    if (rangeStr === '6-10') return count >= 6 && count <= 10;
                    if (rangeStr === '10+') return count > 10;
                    return false;
                });
            });
        }
        
        if (cards.length === 0) {
            showToast('没有找到匹配的卡片', 'error');
            return;
        }
        
        // 随机排序卡片
        shuffleArray(cards);
        
        // 存储学习状态
        window.studyState = {
            cards,
            currentIndex: 0,
            studiedCount: 0,
            filters
        };
        
        // 显示第一张卡片
        showStudyCard();
        
        // 更新统计信息
        updateStudyStats();
        
        // 显示学习模式
        document.getElementById('study-container').style.display = 'block';
    };
}

// 显示学习卡片
function showStudyCard() {
    const state = window.studyState;
    
    if (state.currentIndex >= state.cards.length) {
        // 学习完成
        showToast('已学习完所有卡片', 'success');
        
        // 记录学习日志
        saveStudyLog();
        
        // 关闭学习模式
        document.getElementById('study-container').style.display = 'none';
        
        // 重新加载卡片以显示更新后的学习次数
        loadCards();
        return;
    }
    
    const card = state.cards[state.currentIndex];
    
    // 显示卡片正面
    const frontElement = document.getElementById('study-front');
    frontElement.innerHTML = card.front;
    frontElement.style.display = 'flex';
    
    // 添加图片（如果有）
    if (card.frontImage) {
        const imgElement = document.createElement('img');
        imgElement.src = card.frontImage;
        imgElement.style.maxWidth = '100%';
        imgElement.style.maxHeight = '200px';
        imgElement.style.marginTop = '10px';
        frontElement.appendChild(imgElement);
    }
    
    // 隐藏卡片反面
    const backElement = document.getElementById('study-back');
    backElement.style.display = 'none';
    backElement.innerHTML = card.back;
    
    // 添加图片（如果有）
    if (card.backImage) {
        const imgElement = document.createElement('img');
        imgElement.src = card.backImage;
        imgElement.style.maxWidth = '100%';
        imgElement.style.maxHeight = '200px';
        imgElement.style.marginTop = '10px';
        backElement.appendChild(imgElement);
    }
    
    // 隐藏难度选择和下一步按钮
    document.getElementById('study-difficulty-container').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    
    // 显示翻转按钮
    document.getElementById('flip-btn').style.display = 'inline-block';
    
    // 设置当前难度
    const difficultyRadio = document.querySelector(`input[name="study-difficulty"][value="${card.difficulty}"]`);
    if (difficultyRadio) difficultyRadio.checked = true;
}

// 翻转学习卡片
function flipStudyCard() {
    const frontElement = document.getElementById('study-front');
    const backElement = document.getElementById('study-back');
    
    if (frontElement.style.display === 'flex') {
        // 翻转到背面
        frontElement.style.display = 'none';
        backElement.style.display = 'flex';
        
        // 显示难度选择和下一步按钮
        document.getElementById('study-difficulty-container').style.display = 'block';
        document.getElementById('next-btn').style.display = 'inline-block';
        
        // 隐藏翻转按钮
        document.getElementById('flip-btn').style.display = 'none';
    } else {
        // 翻转到正面
        frontElement.style.display = 'flex';
        backElement.style.display = 'none';
        
        // 隐藏难度选择和下一步按钮
        document.getElementById('study-difficulty-container').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
        
        // 显示翻转按钮
        document.getElementById('flip-btn').style.display = 'inline-block';
    }
}

// 下一张学习卡片
function nextStudyCard() {
    const state = window.studyState;
    const card = state.cards[state.currentIndex];
    
    // 获取更新后的难度
    const newDifficulty = document.querySelector('input[name="study-difficulty"]:checked').value;
    
    // 更新本地状态中的卡片难度
    card.difficulty = newDifficulty;
    
    // 更新数据库中的卡片
    const transaction = db.transaction(['cards'], 'readwrite');
    const cardsStore = transaction.objectStore('cards');
    
    const request = cardsStore.get(card.id);
    request.onsuccess = function(event) {
        const cardToUpdate = event.target.result;
        
        // 更新难度
        cardToUpdate.difficulty = newDifficulty;
        
        // 更新学习次数和时间
        cardToUpdate.studyCount = (cardToUpdate.studyCount || 0) + 1;
        cardToUpdate.lastStudied = Date.now();
        
        // 保存更新
        const updateRequest = cardsStore.put(cardToUpdate);
        
        updateRequest.onerror = function(event) {
            console.error('更新卡片失败:', event.target.error);
            showToast('更新卡片失败', 'error');
        };
    };
    
    request.onerror = function(event) {
        console.error('获取卡片失败:', event.target.error);
        showToast('获取卡片失败', 'error');
    };
    
    // 更新计数
    state.studiedCount++;
    state.currentIndex++;
    
    // 显示下一张卡片
    showStudyCard();
    
    // 更新统计信息
    updateStudyStats();
}

// 更新学习统计信息
function updateStudyStats() {
    const state = window.studyState;
    
    // 更新进度
    document.getElementById('study-progress').textContent = `已学习：${state.studiedCount} / ${state.cards.length}`;
    
    // 更新难度统计
    const difficultyCounts = {
        SS: 0,
        S: 0,
        A: 0,
        B: 0,
        C: 0
    };
    
    state.cards.forEach(card => {
        if (difficultyCounts[card.difficulty]) {
            difficultyCounts[card.difficulty]++;
        } else {
            difficultyCounts.C++;
        }
    });
    
    document.getElementById('count-SS').textContent = difficultyCounts.SS;
    document.getElementById('count-S').textContent = difficultyCounts.S;
    document.getElementById('count-A').textContent = difficultyCounts.A;
    document.getElementById('count-B').textContent = difficultyCounts.B;
    document.getElementById('count-C').textContent = difficultyCounts.C;
}

// 保存学习日志
function saveStudyLog() {
    const state = window.studyState;
    
    // 计算不同难度的卡片数量
    const difficultyCounts = {
        SS: 0,
        S: 0,
        A: 0,
        B: 0,
        C: 0
    };
    
    // 只计算实际学习过的卡片
    for (let i = 0; i < state.studiedCount; i++) {
        if (i < state.cards.length) {
            const card = state.cards[i];
            if (difficultyCounts[card.difficulty]) {
                difficultyCounts[card.difficulty]++;
            } else {
                difficultyCounts.C++; // 如果难度未设置，默认为C
            }
        }
    }
    
    // 创建更详细的日志对象
    const log = {
        date: Date.now(),
        count: state.studiedCount,
        difficultyCounts: difficultyCounts,
        filters: state.filters,
        notes: "" // 添加备注字段，初始为空
    };
    
    const transaction = db.transaction(['logs'], 'readwrite');
    const logsStore = transaction.objectStore('logs');
    logsStore.add(log);
    
    // 在事务完成后重新加载日志和卡片
    transaction.oncomplete = function() {
        loadLogs();
        loadCards(); // 重新加载卡片以显示更新后的学习次数
    };
}

// 导出数据
function exportData() {
    const transaction = db.transaction(['cards', 'logs'], 'readonly');
    const cardsStore = transaction.objectStore('cards');
    const logsStore = transaction.objectStore('logs');
    
    const cardRequest = cardsStore.getAll();
    const logRequest = logsStore.getAll();
    
    Promise.all([
        new Promise(resolve => {
            cardRequest.onsuccess = function(event) {
                resolve(event.target.result);
            };
        }),
        new Promise(resolve => {
            logRequest.onsuccess = function(event) {
                resolve(event.target.result);
            };
        })
    ]).then(([cards, logs]) => {
        const exportData = {
            cards,
            logs,
            exportDate: Date.now()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const dataUrl = URL.createObjectURL(dataBlob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = `wordcards_export_${new Date().toISOString().split('T')[0]}.json`;
        downloadLink.click();
        
        URL.revokeObjectURL(dataUrl);
        
        showToast('数据导出成功', 'success');
    }).catch(error => {
        console.error('导出数据失败:', error);
        showToast('导出数据失败', 'error');
    });
}

// 处理导入文件变更
function handleImportFileChange() {
    const fileInput = document.getElementById('import-file');
    const fileNameElement = document.getElementById('import-file-name');
    const importButton = document.getElementById('import-submit');
    const errorElement = document.getElementById('import-error');
    const successElement = document.getElementById('import-success');
    
    // 重置状态
    errorElement.style.display = 'none';
    successElement.style.display = 'none';
    
    if (fileInput.files.length > 0) {
        fileNameElement.textContent = `选择的文件: ${fileInput.files[0].name}`;
        importButton.disabled = false;
    } else {
        fileNameElement.textContent = '';
        importButton.disabled = true;
    }
}

// 导入数据
function importData() {
    const fileInput = document.getElementById('import-file');
    const replaceExisting = document.getElementById('import-replace').checked;
    const errorElement = document.getElementById('import-error');
    const successElement = document.getElementById('import-success');
    
    // 重置状态
    errorElement.style.display = 'none';
    successElement.style.display = 'none';
    
    if (fileInput.files.length === 0) {
        errorElement.textContent = '请选择文件';
        errorElement.style.display = 'block';
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const importData = JSON.parse(event.target.result);
            
            if (!importData.cards || !Array.isArray(importData.cards)) {
                throw new Error('导入文件格式不正确');
            }
            
            // 导入数据
            const transaction = db.transaction(['cards', 'logs'], 'readwrite');
            const cardsStore = transaction.objectStore('cards');
            const logsStore = transaction.objectStore('logs');
            
            // 清除现有数据（如果选择替换）
            if (replaceExisting) {
                cardsStore.clear();
                logsStore.clear();
            }
            
            // 导入卡片
            let importedCardCount = 0;
            importData.cards.forEach(card => {
                // 移除ID（避免冲突，除非是替换模式）
                if (!replaceExisting && card.id !== undefined) {
                    delete card.id;
                }
                
                cardsStore.add(card);
                importedCardCount++;
            });
            
            // 导入日志（如果有）
            let importedLogCount = 0;
            if (importData.logs && Array.isArray(importData.logs)) {
                importData.logs.forEach(log => {
                    // 移除ID（避免冲突，除非是替换模式）
                    if (!replaceExisting && log.id !== undefined) {
                        delete log.id;
                    }
                    
                    logsStore.add(log);
                    importedLogCount++;
                });
            }
            
            transaction.oncomplete = function() {
                successElement.textContent = `成功导入 ${importedCardCount} 张卡片和 ${importedLogCount} 条日志`;
                successElement.style.display = 'block';
                
                // 重新加载数据
                loadCards();
                loadLogs();
                initFilters();
                
                showToast('数据导入成功', 'success');
            };
            
            transaction.onerror = function(error) {
                errorElement.textContent = `导入失败: ${error.target.error}`;
                errorElement.style.display = 'block';
                showToast('数据导入失败', 'error');
            };
        } catch (error) {
            errorElement.textContent = `解析文件失败: ${error.message}`;
            errorElement.style.display = 'block';
            showToast('解析文件失败', 'error');
        }
    };
    
    reader.onerror = function() {
        errorElement.textContent = '读取文件失败';
        errorElement.style.display = 'block';
        showToast('读取文件失败', 'error');
    };
    
    reader.readAsText(file);
}

// 图片处理相关
document.getElementById('front-image-input').addEventListener('change', function(event) {
    handleImageUpload(event, 'front-image-preview');
});

document.getElementById('back-image-input').addEventListener('change', function(event) {
    handleImageUpload(event, 'back-image-preview');
});

function handleImageUpload(event, previewId) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件大小 (限制为2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('图片大小不能超过2MB', 'error');
        return;
    }
    
    // 压缩图片
    compressImage(file, function(compressedDataUrl) {
        const preview = document.getElementById(previewId);
        preview.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = compressedDataUrl;
        img.className = 'image-preview';
        preview.appendChild(img);
    });
}

// 压缩图片
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // 计算新的尺寸，保持宽高比
            let width = img.width;
            let height = img.height;
            const maxDimension = 800; // 设置图片最大尺寸
            
            if (width > height && width > maxDimension) {
                height = Math.round(height * maxDimension / width);
                width = maxDimension;
            } else if (height > maxDimension) {
                width = Math.round(width * maxDimension / height);
                height = maxDimension;
            }
            
            // 创建canvas进行压缩
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 将canvas转换为DataURL，控制质量
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 工具函数 - 随机打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 添加触摸事件支持
document.addEventListener('DOMContentLoaded', function() {
    // 添加对触摸滑动的支持（用于学习模式中的翻页）
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    const studyCardElement = document.querySelector('.study-card');
    
    if (studyCardElement) {
        studyCardElement.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, false);
        
        studyCardElement.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, false);
    }
    
    function handleSwipe() {
        // 计算水平和垂直移动距离
        const horizontalDiff = touchEndX - touchStartX;
        const verticalDiff = touchEndY - touchStartY;
        
        // 判断是否为水平滑动（水平移动距离大于垂直移动距离）
        if (Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
            // 只有在学习模式开启时才处理滑动
            if (document.getElementById('study-container').style.display === 'block') {
                if (horizontalDiff > 50) {
                    // 向右滑动 - 返回上一张卡片（如果有实现的话）
                    // 此处可添加返回上一张卡片的功能
                } else if (horizontalDiff < -50) {
                    // 向左滑动 - 下一张卡片（如果已翻转）
                    if (document.getElementById('next-btn').style.display !== 'none') {
                        nextStudyCard();
                    } else {
                        // 尚未翻转卡片，则翻转
                        flipStudyCard();
                    }
                }
            }
        }
    }
    
    // 添加双击事件（用于学习模式中的翻转）
    if (studyCardElement) {
        let lastTap = 0;
        studyCardElement.addEventListener('click', function(e) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                // 双击事件
                if (document.getElementById('study-container').style.display === 'block') {
                    // 如果已翻转且显示下一步按钮，则进入下一张
                    if (document.getElementById('next-btn').style.display !== 'none') {
                        nextStudyCard();
                    } else {
                        // 否则翻转卡片
                        flipStudyCard();
                    }
                }
                e.preventDefault();
            }
            lastTap = currentTime;
        });
    }
});

// 添加CSS的toast样式
const style = document.createElement('style');
style.textContent = `
    #toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 20px;
        border-radius: 4px;
        font-size: 1rem;
        z-index: 1001;
        display: none;
        transition: all 0.3s ease;
        max-width: 90%;
        text-align: center;
    }
    
    #toast.info {
        background-color: #3498db;
        color: white;
    }
    
    #toast.success {
        background-color: #2ecc71;
        color: white;
    }
    
    #toast.error {
        background-color: #e74c3c;
        color: white;
    }
`;
document.head.appendChild(style);
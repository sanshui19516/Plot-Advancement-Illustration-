// ============================================================
// 加载器：玩家可自己切换国内/国际
// 加载：SJ.js（事件控制器）、SJ1.js（CG热更新）、SJ2.js（CG插图切换）
// ============================================================

// 从浏览器缓存读取用户的选择，默认国内
let USE_CN = localStorage.getItem('ZXZ_USE_CN');
if (USE_CN === null) {
    USE_CN = 'true';
}
USE_CN = USE_CN === 'true';

// 根据选择决定基础URL
const BASE_URL = USE_CN 
    ? 'https://testingcf.jsdelivr.net/gh/sanshui19516/Plot-Advancement-Illustration-@main/%E3%82%AB%E3%83%A9%E3%83%95%E3%83%AB%E3%81%AA%E8%91%89%EF%BC%9A%E5%8F%AA%E6%98%AF%E5%85%84%E5%A6%B9%E7%9A%84%E6%97%A5%E5%B8%B8/%E8%84%9A%E6%9C%AC/' 
    : 'https://cdn.jsdelivr.net/gh/sanshui19516/Plot-Advancement-Illustration-@main/%E3%82%AB%E3%83%A9%E3%83%95%E3%83%AB%E3%81%AA%E8%91%89%EF%BC%9A%E5%8F%AA%E6%98%AF%E5%85%84%E5%A6%B9%E7%9A%84%E6%97%A5%E5%B8%B8/%E8%84%9A%E6%9C%AC/';

// 动态加载功能脚本
import(BASE_URL + 'SJ.js');    // 事件控制器
import(BASE_URL + 'SJ1.js');   // CG热更新
import(BASE_URL + 'SJ2.js');   // CG插图切换

console.log('[加载器] 当前使用 ' + (USE_CN ? '国内' : '国际') + ' 版本');

// ============================================================
// 检测是否刚切换过节点（用于刷新后显示提示）
// ============================================================
const justSwitched = localStorage.getItem('ZXZ_JUST_SWITCHED');
if (justSwitched) {
    const label = justSwitched === 'cn' ? '🇨🇳 国内节点' : '🌍 国际节点';
    toastr.success('✅ 已切换到 ' + label + '，页面已刷新', '', { timeOut: 3000 });
    localStorage.removeItem('ZXZ_JUST_SWITCHED');
}

// ============================================================
// 切换按钮（单击切换节点）
// ============================================================

const storyName = '只是兄妹';
const switchBtnName = '🌐 切换节点（' + storyName + '）';

setTimeout(() => {
    try {
        let buttons = getScriptButtons();
        if (!buttons.some(b => b.name === switchBtnName)) {
            buttons = buttons.filter(b => b.name !== switchBtnName);
            buttons.push({ name: switchBtnName, visible: true });
            replaceScriptButtons(buttons);
            console.log('[加载器] 切换按钮注册成功: ' + switchBtnName);
        }
    } catch (e) {
        console.error('[加载器] 切换按钮注册失败:', e);
    }
}, 1500);

eventOn(getButtonEvent(switchBtnName), () => {
    const current = localStorage.getItem('ZXZ_USE_CN') !== 'false';
    const next = !current;
    const label = next ? 'cn' : 'global';
    
    localStorage.setItem('ZXZ_USE_CN', next ? 'true' : 'false');
    localStorage.setItem('ZXZ_JUST_SWITCHED', label);
    
    toastr.info('已切换到 ' + (next ? '🇨🇳 国内节点' : '🌍 国际节点') + '，正在刷新...', '', { timeOut: 1500 });
    
    setTimeout(() => {
        if (window.top) {
            window.top.location.reload();
        } else {
            window.location.reload();
        }
    }, 1500);
});

// ============================================================
// 隐藏按钮（双击隐藏所有按钮）
// ============================================================

const hideBtnName = '🔒 隐藏';

setTimeout(() => {
    try {
        let buttons = getScriptButtons();
        if (!buttons.some(b => b.name === hideBtnName)) {
            buttons = buttons.filter(b => b.name !== hideBtnName);
            buttons.push({ name: hideBtnName, visible: true });
            replaceScriptButtons(buttons);
            console.log('[加载器] 隐藏按钮注册成功');
        }
    } catch (e) {
        console.error('[加载器] 隐藏按钮注册失败:', e);
    }
}, 2000);

let hideClickCount = 0;
let hideTimer = null;

eventOn(getButtonEvent(hideBtnName), () => {
    hideClickCount++;
    
    if (hideClickCount === 1) {
        hideTimer = setTimeout(() => {
            hideClickCount = 0;
            clearTimeout(hideTimer);
            hideTimer = null;
        }, 500);
    } else if (hideClickCount >= 2) {
        clearTimeout(hideTimer);
        hideTimer = null;
        hideClickCount = 0;
        
        try {
            const btns = getScriptButtons();
            const hiddenButtons = btns.map(b => {
                return { ...b, visible: false };
            });
            replaceScriptButtons(hiddenButtons);
            toastr.info('🔒 所有按钮已隐藏', '双击「隐藏」按钮触发', { timeOut: 2000 });
            console.log('[加载器] 所有按钮已隐藏');
        } catch (e) {
            console.error('[加载器] 隐藏按钮失败:', e);
        }
    }
});

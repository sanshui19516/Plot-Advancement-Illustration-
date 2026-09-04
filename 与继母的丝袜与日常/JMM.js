// ============================================================
// 加载器：玩家可自己切换国内/国际
// 加载：JM1.js（剧情推进自动触发）、JM2.js（插图CG切换）、JM3.js（CG更新）
// ============================================================

// 从浏览器缓存读取用户的选择，默认国内
let USE_CN = localStorage.getItem('ZXZ_USE_CN');
if (USE_CN === null) {
    USE_CN = 'true';
}
USE_CN = USE_CN === 'true';

// 根据选择决定基础URL
const BASE_URL = USE_CN 
    ? 'https://testingcf.jsdelivr.net/gh/sanshui19516/Plot-Advancement-Illustration-@main/%E4%B8%8E%E7%BB%A7%E6%AF%8D%E7%9A%84%E4%B8%9D%E8%A2%9C%E4%B8%8E%E6%97%A5%E5%B8%B8/' 
    : 'https://cdn.jsdelivr.net/gh/sanshui19516/Plot-Advancement-Illustration-@main/%E4%B8%8E%E7%BB%A7%E6%AF%8D%E7%9A%84%E4%B8%9D%E8%A2%9C%E4%B8%8E%E6%97%A5%E5%B8%B8/';

// 动态加载功能脚本
import(BASE_URL + 'JM1.js');   // 【剧情推进】自动触发-与继母的丝袜与日常
import(BASE_URL + 'JM2.js');   // 插图CG切换
import(BASE_URL + 'JM3.js');   // 【与继母的丝袜与日常CG更新】手动注入版-原生弹窗版＋通知弹窗

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
// 切换按钮
// ============================================================

const buttons = getScriptButtons();
if (!buttons.some(b => b.name === '🌐 切换节点')) {
    replaceScriptButtons([...buttons, { name: '🌐 切换节点', visible: true }]);
}

eventOn(getButtonEvent('🌐 切换节点'), () => {
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

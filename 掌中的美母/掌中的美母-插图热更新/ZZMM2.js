// ============================================================
// 【掌中的美母】节点切换器 · 核心控制脚本
// 功能：启动弹窗选择节点 → 切换对应正则组开关（互斥）
// 作用域：角色卡局部正则
// 配色：金色系
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // ★ 配置区
    // ============================================================
    var CONFIG = {
        storyName: '掌中的美母',

        // 国内组正则名称（完全匹配）
        cnRegexNames: [
            '欢迎光临/N',
            '三年的水/作者介绍/N',
            '三年的水/开场白图片/N',
            '选项/带图/N',
            '选项/不带图/N',
            '状态栏/N'
        ],

        // 国外组正则名称（完全匹配）
        globalRegexNames: [
            '欢迎光临/G',
            '三年的水/作者介绍/G',
            '三年的水/开场白图片/G',
            '选项/带图/G',
            '选项/不带图/G',
            '状态栏/G'
        ],

        // localStorage 键名
        nodeKey: 'zhangzhongmeimu_node_choice',       // 'cn' | 'global'
        wizardShownKey: 'zhangzhongmeimu_wizard_shown'
    };

    // ============================================================
    // ★ 视觉配置
    // ============================================================
    var BG_COLOR = 'rgba(30, 22, 15, 0.88)';   // 纯色深金棕背景
    var BG_COLOR_LIGHT = 'rgba(45, 34, 22, 0.92)';

    var COLORS = {
        primary: 'hsl(43, 70%, 62%)',           // 主金色
        secondary: 'hsl(38, 50%, 52%)',         // 辅金色
        accent: 'hsl(45, 75%, 58%)',            // 强调金
        text: 'hsl(43, 25%, 90%)',              // 正文色
        textMuted: 'rgba(200, 180, 140, 0.45)',
        border: 'rgba(220, 180, 100, 0.15)'
    };

    var TEXTS = {
        title: '请选择节点使用',
        question: '请选择节点',
        footer: '记住这个很重要，请谨慎选择，如若选择错误请新建聊天即弹窗可再次生效',
        btnCn: '🇨🇳 国内-使用',
        btnGlobal: '🌍 国外-使用'
    };

    var AVATAR_IMAGE = 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E5%BC%B9%E7%AA%97.png';
    var NOTIF_IMAGE = 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E5%BC%B9%E7%AA%97.png';

    // ============================================================
    // 日志
    // ============================================================
    function log(msg) {
        console.log('[' + CONFIG.storyName + '·节点切换] ' + msg);
    }

    // ============================================================
    // Toast 提示
    // ============================================================
    function showToast(text) {
        if (typeof toastr !== 'undefined') {
            toastr.success(text, '', { timeOut: 3000 });
        } else {
            log(text);
        }
    }

    // ============================================================
    // 状态管理
    // ============================================================
    function getNodeChoice() {
        try { return localStorage.getItem(CONFIG.nodeKey) || null; } catch (e) { return null; }
    }
    function setNodeChoice(node) {
        try { localStorage.setItem(CONFIG.nodeKey, node); } catch (e) {}
    }
    function hasShownWizard() {
        try { return localStorage.getItem(CONFIG.wizardShownKey) === 'true'; } catch (e) { return false; }
    }
    function markWizardShown() {
        try { localStorage.setItem(CONFIG.wizardShownKey, 'true'); } catch (e) {}
    }
    function clearWizardShown() {
        try { localStorage.removeItem(CONFIG.wizardShownKey); } catch (e) {}
    }

    // ============================================================
    // ★ 核心：切换正则组（互斥）
    // ============================================================
    function switchRegexGroup(targetNode) {
        log('开始切换正则组 → ' + (targetNode === 'cn' ? '国内' : '国外'));

        try {
            if (typeof getTavernRegexes !== 'function' || typeof replaceTavernRegexes !== 'function') {
                log('⚠️ 正则 API 不可用');
                showToast('⚠️ 正则 API 不可用');
                return false;
            }

            // 优先局部正则
            var regexes = getTavernRegexes({ scope: 'character' });
            var scope = 'character';

            if (!regexes || regexes.length === 0) {
                regexes = getTavernRegexes({ scope: 'global' });
                scope = 'global';
            }

            if (!regexes || regexes.length === 0) {
                log('⚠️ 未找到任何正则脚本');
                showToast('⚠️ 未找到任何正则脚本');
                return false;
            }

            var cnHit = 0, globalHit = 0;

            for (var i = 0; i < regexes.length; i++) {
                var r = regexes[i];
                var name = r.script_name || r.name || r.scriptName || '';

                // 国内组
                if (CONFIG.cnRegexNames.indexOf(name) !== -1) {
                    r.enabled = (targetNode === 'cn');
                    if (targetNode === 'cn') cnHit++;
                }
                // 国外组
                else if (CONFIG.globalRegexNames.indexOf(name) !== -1) {
                    r.enabled = (targetNode === 'global');
                    if (targetNode === 'global') globalHit++;
                }
            }

            replaceTavernRegexes(regexes, { scope: scope });

            log('✅ 切换完成 | 国内启用 ' + cnHit + ' / 国外启用 ' + globalHit + '（scope: ' + scope + '）');
            return true;

        } catch (e) {
            log('❌ 切换失败: ' + e.message);
            showToast('❌ 切换失败: ' + e.message);
            return false;
        }
    }

    // ============================================================
    // ★ 毛玻璃通知
    // ============================================================
    function showGlassNotification(title, subtitle) {
        try {
            var topDoc = document;
            try {
                if (window.parent && window.parent.document) {
                    topDoc = window.parent.document;
                }
            } catch (e) {}

            var old = topDoc.querySelector('.zzmm-notif-custom');
            if (old) old.remove();

            var notif = topDoc.createElement('div');
            notif.className = 'zzmm-notif-custom';
            notif.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 999999;
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 14px 18px 14px 14px;
                max-width: 420px;
                width: calc(100% - 32px);
                background: rgba(40, 28, 15, 0.82);
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                border: 1px solid rgba(220, 180, 100, 0.18);
                border-radius: 16px;
                box-shadow: 0 12px 48px rgba(0,0,0,0.55);
                font-family: 'Georgia', 'Times New Roman', serif;
                box-sizing: border-box;
                animation: zzmmPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                opacity: 0;
                transform: scale(0.5);
            `;

            notif.innerHTML = `
                <div style="flex-shrink:0;width:48px;height:48px;border-radius:12px;overflow:hidden;border:1px solid rgba(220,180,100,0.15);background:rgba(60,45,25,0.3);">
                    <img src="${NOTIF_IMAGE}" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>
                <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;">
                    <div style="font-size:0.9rem;font-weight:700;color:${COLORS.primary};letter-spacing:1px;">${title}</div>
                    <div style="font-size:0.68rem;color:rgba(200,180,140,0.55);letter-spacing:0.5px;font-style:italic;">${subtitle || '点击关闭'}</div>
                </div>
                <button style="flex-shrink:0;width:22px;height:22px;border:none;background:rgba(220,180,100,0.08);border-radius:50%;color:rgba(200,180,140,0.35);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;font-family:inherit;">✕</button>
            `;

            if (!topDoc.getElementById('zzmm-notif-keyframes')) {
                var style = topDoc.createElement('style');
                style.id = 'zzmm-notif-keyframes';
                style.textContent = `
                    @keyframes zzmmPopIn {
                        0% { opacity: 0; transform: translateX(-50%) scale(0.4); }
                        60% { opacity: 1; transform: translateX(-50%) scale(1.04); }
                        100% { opacity: 1; transform: translateX(-50%) scale(1); }
                    }
                    @keyframes zzmmPopOut {
                        0% { opacity: 1; transform: translateX(-50%) scale(1); }
                        100% { opacity: 0; transform: translateX(-50%) scale(0.6); }
                    }
                    .zzmm-notif-custom.exiting {
                        animation: zzmmPopOut 0.5s cubic-bezier(0.76, 0, 0.24, 1) forwards !important;
                    }
                `;
                topDoc.head.appendChild(style);
            }

            notif.querySelector('button').addEventListener('click', function(e) {
                e.stopPropagation();
                notif.classList.add('exiting');
                setTimeout(function() { if (notif.parentNode) notif.remove(); }, 500);
            });

            notif.addEventListener('click', function(e) {
                if (e.target === this || e.target.closest('div')) {
                    notif.classList.add('exiting');
                    setTimeout(function() { if (notif.parentNode) notif.remove(); }, 500);
                }
            });

            topDoc.body.appendChild(notif);

            setTimeout(function() {
                if (notif.parentNode) {
                    notif.classList.add('exiting');
                    setTimeout(function() { if (notif.parentNode) notif.remove(); }, 500);
                }
            }, 3200);

        } catch (e) {
            if (typeof toastr !== 'undefined') {
                toastr.info(title, '', { timeOut: 3000 });
            }
        }
    }

    // ============================================================
    // ★ 判断是否为空聊天
    // ============================================================
    function isNewEmptyChat() {
        try {
            if (typeof getChatMessages !== 'function') return false;
            var messages = getChatMessages(-1);
            if (!messages || messages.length === 0) return true;
            for (var i = 0; i < messages.length; i++) {
                if (messages[i] && messages[i].is_user === true) return false;
            }
            return true;
        } catch (e) { return false; }
    }

    // ============================================================
    // ★ 弹窗逻辑（防重复锁）
    // ============================================================
    var isPopupShowing = false;

    function showWizardPopup() {
        if (hasShownWizard()) {
            log('向导已显示过，跳过弹窗');
            return;
        }
        if (isPopupShowing) {
            log('已有弹窗正在显示，跳过');
            return;
        }

        log('弹出节点选择向导...');

        if (typeof SillyTavern === 'undefined' || typeof SillyTavern.callGenericPopup !== 'function') {
            log('⚠️ SillyTavern API 不可用');
            return;
        }

        isPopupShowing = true;

        var html = `
            <div style="
                text-align: center;
                padding: 24px 20px;
                background: ${BG_COLOR};
                border-radius: 14px;
                backdrop-filter: blur(6px);
                -webkit-backdrop-filter: blur(6px);
                border: 1px solid ${COLORS.border};
            ">
                <!-- ★ 圆形头像 ★ -->
                <div style="
                    margin: 0 auto 14px auto;
                    width: 76px;
                    height: 76px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 2px solid ${COLORS.primary}30;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
                ">
                    <img src="${AVATAR_IMAGE}" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>

                <!-- 标题 -->
                <div style="
                    font-size: 18px;
                    font-weight: 700;
                    color: ${COLORS.primary};
                    letter-spacing: 6px;
                    text-shadow: 0 2px 12px rgba(0,0,0,0.9);
                    margin-bottom: 8px;
                ">
                    ${TEXTS.title}
                </div>

                <!-- 装饰分割线 -->
                <div style="height:1px;background:${COLORS.primary}20;margin:8px 0 14px;"></div>

                <!-- 副标题（询问） -->
                <div style="
                    font-size: 14px;
                    color: ${COLORS.text};
                    line-height: 1.8;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.85);
                    margin-bottom: 12px;
                ">
                    ${TEXTS.question}
                </div>

                <!-- 底部提示 -->
                <div style="
                    font-size: 11px;
                    color: ${COLORS.textMuted};
                    border-top: 1px solid ${COLORS.border};
                    padding-top: 10px;
                    text-shadow: 0 1px 6px rgba(0,0,0,0.8);
                    line-height: 1.7;
                ">
                    ${TEXTS.footer}
                </div>
            </div>
        `;

        SillyTavern.callGenericPopup(
            html,
            SillyTavern.POPUP_TYPE.CONFIRM,
            '',
            {
                okButton: TEXTS.btnCn,
                cancelButton: TEXTS.btnGlobal
            }
        ).then(function(result) {
            isPopupShowing = false;

            if (result === SillyTavern.POPUP_RESULT.AFFIRMATIVE) {
                // 用户选择：国内
                log('用户选择「国内节点」');
                setNodeChoice('cn');
                markWizardShown();
                var ok = switchRegexGroup('cn');
                if (ok) {
                    showGlassNotification(
                        '✅ 节点已切换',
                        '当前使用 🇨🇳 国内节点，界面正则已生效'
                    );
                }
            } else {
                // 用户选择：国外
                log('用户选择「国外节点」');
                setNodeChoice('global');
                markWizardShown();
                var ok2 = switchRegexGroup('global');
                if (ok2) {
                    showGlassNotification(
                        '✅ 节点已切换',
                        '当前使用 🌍 国外节点，界面正则已生效'
                    );
                }
            }
        }).catch(function(err) {
            isPopupShowing = false;
            log('弹窗关闭: ' + err.message);
        });
    }

    // ============================================================
    // ★ 监听 CHAT_CHANGED（新建空聊天时重置弹窗）
    // ============================================================
    function setupChatChangedListener() {
        if (typeof eventOn !== 'function' || typeof tavern_events === 'undefined') {
            log('⚠️ eventOn 或 tavern_events 不可用');
            return;
        }

        var currentChatId = null;
        try {
            if (typeof SillyTavern !== 'undefined' && SillyTavern.getCurrentChatId) {
                currentChatId = SillyTavern.getCurrentChatId();
            }
        } catch (e) {}

        eventOn(tavern_events.CHAT_CHANGED, function(chat_id) {
            if (currentChatId !== chat_id) {
                currentChatId = chat_id;

                setTimeout(function() {
                    if (isNewEmptyChat()) {
                        log('✅ 检测到新建空聊天，重置向导状态');
                        clearWizardShown();

                        if (!hasShownWizard()) {
                            showWizardPopup();
                        }
                    }
                }, 600);
            }
        });

        log('✅ CHAT_CHANGED 监听已注册');
    }

    // ============================================================
    // ★ 手动 API（调试用）
    // ============================================================
    window.resetZZMMNodeWizard = function() {
        clearWizardShown();
        isPopupShowing = false;
        showToast('✅ 已重置，将重新弹窗');
        setTimeout(function() {
            if (!hasShownWizard()) showWizardPopup();
        }, 500);
    };

    window.forceZZMMNodeWizard = function() {
        clearWizardShown();
        isPopupShowing = false;
        setTimeout(function() {
            showWizardPopup();
        }, 300);
    };

    window.switchZZMMNode = function(node) {
        if (node !== 'cn' && node !== 'global') {
            showToast('❌ 参数必须是 "cn" 或 "global"');
            return;
        }
        setNodeChoice(node);
        markWizardShown();
        var ok = switchRegexGroup(node);
        if (ok) {
            showGlassNotification(
                '✅ 节点已切换',
                '当前使用 ' + (node === 'cn' ? '🇨🇳 国内节点' : '🌍 国外节点') + '，界面正则已生效'
            );
        }
    };

    // ============================================================
    // ★ 初始化
    // ============================================================
    function init() {
        log('开始初始化...');
        log('当前节点选择: ' + (getNodeChoice() || '未选择'));
        log('向导已显示: ' + hasShownWizard());

        setupChatChangedListener();

        // 已有节点选择 → 直接同步正则状态，不弹窗
        var savedNode = getNodeChoice();
        if (savedNode) {
            log('检测到已保存节点，静默同步正则状态');
            switchRegexGroup(savedNode);
            markWizardShown();
            return;
        }

        // 未选择过 → 检查是否需要弹窗
        if (hasShownWizard()) {
            log('向导已显示过，跳过');
            return;
        }

        setTimeout(showWizardPopup, 800);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 500);
        });
    }

    // ============================================================
    // ★ 暴露 API
    // ============================================================
    window.__ZZMMNodeSwitcher = {
        reset: window.resetZZMMNodeWizard,
        forceShow: window.forceZZMMNodeWizard,
        switchTo: window.switchZZMMNode,
        getChoice: getNodeChoice
    };

    log('✅ ' + CONFIG.storyName + ' 节点切换器脚本已加载完成');

})();

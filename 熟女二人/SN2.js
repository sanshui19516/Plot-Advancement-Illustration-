// ============================================================
// 【熟女双人的夜恋CG更新】手动注入版-原生弹窗版＋通知弹窗
// 功能：脚本启动时自动弹窗（无圆形头像），玩家选择国内或国外节点更新
//       更新成功后显示毛玻璃通知
// 版本：v4.2（弹窗酒红金边美化版）
// ============================================================

(function() {
    'use strict';

    // ─── ⚠️ 配置区域 ────────────────────────────────────────────────
    var CONFIG = {
        worldbookName: '熟女双人的夜恋',
        entryUids: {
            sfw: 7,
            nsfw: 5,
            rules: 8
        },
        cnUrls: {
            sfw: 'https://testingcf.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E7%86%9F%E5%A5%B3%E5%8F%8C%E4%BA%BA%E7%9A%84%E5%A4%9C%E6%81%8B/SFW.txt',
            nsfw: 'https://testingcf.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E7%86%9F%E5%A5%B3%E5%8F%8C%E4%BA%BA%E7%9A%84%E5%A4%9C%E6%81%8B/NSFW.txt',
            rules: 'https://testingcf.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E7%86%9F%E5%A5%B3%E5%8F%8C%E4%BA%BA%E7%9A%84%E5%A4%9C%E6%81%8B/rules.txt'
        },
        globalUrls: {
            sfw: 'https://cdn.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E7%86%9F%E5%A5%B3%E5%8F%8C%E4%BA%BA%E7%9A%84%E5%A4%9C%E6%81%8B/SFW.txt',
            nsfw: 'https://cdn.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E7%86%9F%E5%A5%B3%E5%8F%8C%E4%BA%BA%E7%9A%84%E5%A4%9C%E6%81%8B/NSFW.txt',
            rules: 'https://cdn.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E7%86%9F%E5%A5%B3%E5%8F%8C%E4%BA%BA%E7%9A%84%E5%A4%9C%E6%81%8B/rules.txt'
        },
        popup: {
            title: '熟女双人的夜恋CG更新',
            question: '请选择更新节点：',
            subtext: 'CG更新',
            footer: '🇨🇳 如果在中国境内，请使用国内更新。🌍 如果您位于美国、西班牙、韩国、澳大利亚等国家，请使用国外更新。',
            btnCn: '🏞️ 国内-更新',
            btnGlobal: '🌍 国外-更新'
        },
        bgImage: 'https://cdn.jsdelivr.net/gh/sanshui19516/CG@main/%E7%86%9F%E5%A5%B3%E4%BA%8C%E4%BA%BA/ZTL1.jpg',
        notifImage: 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E5%BC%B9%E7%AA%97.png',
        wizardShownKey: 'shunv_shuangren_cg_update_wizard_shown'
    };
    // ─── 配置结束 ──────────────────────────────────────────────────

    // ─── 毛玻璃通知函数 ────────────────────────────────────────────
    function showGlassNotification(title, subtitle) {
        try {
            var topDoc = document;
            try {
                if (window.parent && window.parent.document) {
                    topDoc = window.parent.document;
                }
            } catch (e) {}

            var old = topDoc.querySelector('.rw-notif-custom');
            if (old) old.remove();

            var notif = topDoc.createElement('div');
            notif.className = 'rw-notif-custom';
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
                background: rgba(30, 22, 30, 0.78);
                backdrop-filter: blur(24px);
                -webkit-backdrop-filter: blur(24px);
                border: 1px solid rgba(200, 170, 190, 0.12);
                border-radius: 16px;
                box-shadow: 0 12px 48px rgba(0,0,0,0.55);
                font-family: 'Georgia', 'Times New Roman', serif;
                box-sizing: border-box;
                animation: rwPopIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                opacity: 0;
                transform: scale(0.5);
            `;

            notif.innerHTML = `
                <div style="flex-shrink:0;width:48px;height:48px;border-radius:12px;overflow:hidden;border:1px solid rgba(200,170,190,0.08);background:rgba(60,40,55,0.3);">
                    <img src="${CONFIG.notifImage}" style="width:100%;height:100%;object-fit:cover;display:block;">
                </div>
                <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:1px;">
                    <div style="font-size:0.9rem;font-weight:700;color:#f0e6ec;letter-spacing:1px;">${title}</div>
                    <div style="font-size:0.68rem;color:rgba(200,180,195,0.5);letter-spacing:0.5px;font-style:italic;">${subtitle || '点击关闭'}</div>
                </div>
                <button style="flex-shrink:0;width:22px;height:22px;border:none;background:rgba(200,170,190,0.05);border-radius:50%;color:rgba(200,180,195,0.25);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;font-family:inherit;">✕</button>
            `;

            if (!topDoc.getElementById('rw-notif-keyframes')) {
                var style = topDoc.createElement('style');
                style.id = 'rw-notif-keyframes';
                style.textContent = `
                    @keyframes rwPopIn {
                        0% { opacity: 0; transform: translateX(-50%) scale(0.4); }
                        60% { opacity: 1; transform: translateX(-50%) scale(1.04); }
                        100% { opacity: 1; transform: translateX(-50%) scale(1); }
                    }
                    @keyframes rwPopOut {
                        0% { opacity: 1; transform: translateX(-50%) scale(1); }
                        100% { opacity: 0; transform: translateX(-50%) scale(0.6); }
                    }
                    .rw-notif-custom.exiting {
                        animation: rwPopOut 0.5s cubic-bezier(0.76, 0, 0.24, 1) forwards !important;
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
            }, 3000);

        } catch (e) {
            if (typeof toastr !== 'undefined') {
                toastr.info(title, '', { timeOut: 3000 });
            }
        }
    }

    // ─── Toast 提示 ──────────────────────────────────────────────────
    function showToast(text) {
        if (typeof toastr !== 'undefined') {
            toastr.success(text, '', { timeOut: 3000 });
        } else {
            console.log('[熟女双人的夜恋CG更新] ' + text);
        }
    }

    function log(msg) { console.log('[熟女双人的夜恋CG更新] ' + msg); }

    function hasShownWizard() {
        try { return localStorage.getItem(CONFIG.wizardShownKey) === 'true'; } catch (e) { return false; }
    }
    function markWizardShown() {
        try { localStorage.setItem(CONFIG.wizardShownKey, 'true'); } catch (e) {}
    }
    function clearWizardShown() {
        try { localStorage.removeItem(CONFIG.wizardShownKey); } catch (e) {}
    }

    async function fetchRemoteContent(url, name) {
        try {
            var response = await fetch(url + '?t=' + Date.now());
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return await response.text();
        } catch (e) {
            log('❌ ' + name + ' 拉取失败: ' + e.message);
            return null;
        }
    }

    async function performUpdate(region) {
        var urls, regionName;
        if (region === 'cn') {
            urls = CONFIG.cnUrls;
            regionName = '国内节点';
        } else if (region === 'global') {
            urls = CONFIG.globalUrls;
            regionName = '国外节点';
        } else {
            showToast('❌ 未知更新节点');
            return;
        }

        log('开始执行更新（' + regionName + '）...');
        showToast('🔄 正在从' + regionName + '拉取...');

        var sfw = await fetchRemoteContent(urls.sfw, 'SFW');
        var nsfw = await fetchRemoteContent(urls.nsfw, 'NSFW');
        var rules = await fetchRemoteContent(urls.rules, '规则');

        if (!sfw || !nsfw || !rules) {
            showToast('❌ 拉取失败，请检查网络');
            return;
        }

        if (typeof TavernHelper === 'undefined' || typeof TavernHelper.getWorldbook !== 'function') {
            showToast('❌ TavernHelper 不可用');
            return;
        }

        var wb = await TavernHelper.getWorldbook(CONFIG.worldbookName);
        if (!wb) {
            showToast('❌ 未找到世界书');
            return;
        }

        var updated = [];
        for (var i = 0; i < wb.length; i++) {
            var entry = wb[i];
            var uid = entry.uid || entry.id || entry.index || '';
            if (uid === CONFIG.entryUids.sfw) {
                entry.content = sfw;
                updated.push('SFW(7)');
            } else if (uid === CONFIG.entryUids.nsfw) {
                entry.content = nsfw;
                updated.push('NSFW(5)');
            } else if (uid === CONFIG.entryUids.rules) {
                entry.content = rules;
                updated.push('规则(8)');
            }
        }

        if (updated.length === 0) {
            showToast('❌ 未找到匹配的 UID');
            return;
        }

        await TavernHelper.replaceWorldbook(CONFIG.worldbookName, wb);
        if (typeof TavernHelper.builtin?.reloadEditor === 'function') {
            TavernHelper.builtin.reloadEditor(CONFIG.worldbookName);
        }

        log('✅ 更新成功: ' + updated.join(', '));
        showGlassNotification(
            '✅ 最新插图CG已更新完成',
            '请关注创作者，每一个点赞即是激励。此卡作者：三年的水，敬请期待更多精彩故事！'
        );
        markWizardShown();
    }

    // ─── 判断是否为新建空聊天 ────────────────────────────────────
    function isNewEmptyChat() {
        try {
            var messages = getChatMessages(-1);
            if (!messages || messages.length === 0) return true;
            for (var i = 0; i < messages.length; i++) {
                if (messages[i] && messages[i].is_user === true) return false;
            }
            return true;
        } catch (e) { return false; }
    }

    // ─── 监听 CHAT_CHANGED（新建聊天重新弹窗） ───────────────────
    function setupChatChangedListener() {
        if (typeof eventOn !== 'function' || typeof tavern_events === 'undefined') {
            log('⚠️ eventOn 不可用');
            return;
        }
        var currentChatId = null;
        eventOn(tavern_events.CHAT_CHANGED, function(chat_id) {
            if (currentChatId !== chat_id) {
                currentChatId = chat_id;
                setTimeout(function() {
                    if (isNewEmptyChat()) {
                        log('✅ 检测到新建空聊天，重置向导状态');
                        clearWizardShown();
                        if (!hasShownWizard()) {
                            log('准备显示启动向导（新建空聊天）');
                            showWizardPopup();
                        }
                    }
                }, 600);
            }
        });
        log('✅ CHAT_CHANGED 监听已注册');
    }

    // ─── 弹窗逻辑（酒红金边 · 夜色风） ────────────────────────────
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

        log('弹出启动向导...');

        if (typeof SillyTavern === 'undefined' || typeof SillyTavern.callGenericPopup !== 'function') {
            log('⚠️ SillyTavern API 不可用');
            return;
        }

        isPopupShowing = true;

        var html = `
            <div style="
                position: relative;
                text-align: center;
                padding: 30px 24px 24px;
                border-radius: 14px;
                overflow: hidden;
                background: linear-gradient(160deg, rgba(48, 14, 24, 0.94), rgba(22, 8, 14, 0.96));
                border: 1px solid rgba(214, 168, 118, 0.35);
                box-shadow: 0 16px 48px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(214, 168, 118, 0.06);
            ">
                <!-- 背景图（低透明度融入） -->
                <div style="position:absolute; inset:0; background-image:url('${CONFIG.bgImage}'); background-size:cover; background-position:center; opacity:0.18; pointer-events:none;"></div>
                <!-- 顶部金线 -->
                <div style="position:absolute; top:10px; left:24px; right:24px; height:1px; background:linear-gradient(90deg, transparent, rgba(214,168,118,0.6), transparent); pointer-events:none;"></div>
                <!-- 底部金线 -->
                <div style="position:absolute; bottom:10px; left:24px; right:24px; height:1px; background:linear-gradient(90deg, transparent, rgba(214,168,118,0.6), transparent); pointer-events:none;"></div>
                <!-- 四角金线装饰 -->
                <div style="position:absolute; top:7px; left:7px; width:14px; height:14px; border-top:1px solid rgba(214,168,118,0.7); border-left:1px solid rgba(214,168,118,0.7); pointer-events:none;"></div>
                <div style="position:absolute; top:7px; right:7px; width:14px; height:14px; border-top:1px solid rgba(214,168,118,0.7); border-right:1px solid rgba(214,168,118,0.7); pointer-events:none;"></div>
                <div style="position:absolute; bottom:7px; left:7px; width:14px; height:14px; border-bottom:1px solid rgba(214,168,118,0.7); border-left:1px solid rgba(214,168,118,0.7); pointer-events:none;"></div>
                <div style="position:absolute; bottom:7px; right:7px; width:14px; height:14px; border-bottom:1px solid rgba(214,168,118,0.7); border-right:1px solid rgba(214,168,118,0.7); pointer-events:none;"></div>

                <!-- 内容 -->
                <div style="position:relative; z-index:2;">
                    <!-- 顶部装饰 -->
                    <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:10px;">
                        <span style="display:inline-block; width:30px; height:1px; background:linear-gradient(90deg, transparent, rgba(214,168,118,0.65));"></span>
                        <span style="font-size:11px; color:rgba(214,168,118,0.8); letter-spacing:6px;">✦</span>
                        <span style="display:inline-block; width:30px; height:1px; background:linear-gradient(90deg, rgba(214,168,118,0.65), transparent);"></span>
                    </div>

                    <!-- 标题 -->
                    <div style="
                        font-family: 'Noto Serif SC', 'Songti SC', Georgia, serif;
                        font-size: 19px;
                        font-weight: 700;
                        color: #e8c9a0;
                        letter-spacing: 4px;
                        text-shadow: 0 2px 14px rgba(0,0,0,0.85), 0 0 24px rgba(214,168,118,0.25);
                    ">
                        ${CONFIG.popup.title}
                    </div>

                    <!-- 分割线 -->
                    <div style="height:1px; background:linear-gradient(90deg, transparent, rgba(214,168,118,0.35), transparent); margin:14px 0 16px;"></div>

                    <!-- 询问文本 -->
                    <div style="
                        font-size: 14px;
                        color: #e8ddd4;
                        line-height: 1.8;
                        margin-bottom: 8px;
                        text-shadow: 0 1px 6px rgba(0,0,0,0.75);
                    ">
                        ${CONFIG.popup.question}
                    </div>

                    <!-- 副标题 -->
                    <div style="
                        font-size: 12px;
                        color: rgba(220, 200, 185, 0.8);
                        margin-bottom: 18px;
                        text-shadow: 0 1px 6px rgba(0,0,0,0.6);
                    ">
                        ${CONFIG.popup.subtext}
                    </div>

                    <!-- 底部提示 -->
                    <div style="
                        font-size: 11px;
                        color: rgba(214, 168, 118, 0.55);
                        border-top: 1px solid rgba(214,168,118,0.12);
                        padding-top: 10px;
                        line-height: 1.6;
                        text-shadow: 0 1px 4px rgba(0,0,0,0.7);
                    ">
                        ${CONFIG.popup.footer}
                    </div>
                </div>
            </div>
        `;

        SillyTavern.callGenericPopup(
            html,
            SillyTavern.POPUP_TYPE.CONFIRM,
            '',
            {
                okButton: CONFIG.popup.btnCn,
                cancelButton: CONFIG.popup.btnGlobal
            }
        ).then(function(result) {
            isPopupShowing = false;
            if (result === SillyTavern.POPUP_RESULT.AFFIRMATIVE) {
                log('用户点击「' + CONFIG.popup.btnCn + '」');
                markWizardShown();
                performUpdate('cn');
            } else {
                log('用户点击「' + CONFIG.popup.btnGlobal + '」');
                markWizardShown();
                performUpdate('global');
            }
        }).catch(function(err) {
            isPopupShowing = false;
            log('弹窗关闭: ' + err.message);
        });
    }

    // ─── 手动 API（调试用） ──────────────────────────────────────
    window.resetShunvShuangrenCGUpdate = function() {
        clearWizardShown();
        isPopupShowing = false;
        showToast('✅ 已重置');
        setTimeout(function() {
            if (!hasShownWizard()) {
                showWizardPopup();
            }
        }, 500);
    };

    window.forceShunvShuangrenCGUpdate = function() {
        clearWizardShown();
        isPopupShowing = false;
        showWizardPopup();
    };

    // ─── 启动 ──────────────────────────────────────────────────────
    function init() {
        log('脚本已加载（熟女双人的夜恋CG更新 v4.2 - 酒红金边版）');
        setupChatChangedListener();
        if (hasShownWizard()) {
            log('向导已显示过，跳过弹窗');
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

    log('✅ 熟女双人的夜恋CG更新脚本（v4.2）已加载');

})();

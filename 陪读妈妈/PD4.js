// ============================================================
// 【陪读妈妈CG更新】最终版 · 带图标
// 功能：加载时自动弹窗，国内/国外二选一更新
// 版本：3.3（更新成功提示改为毛玻璃通知）
// ============================================================

(function() {
    'use strict';

    var CONFIG = {
        worldbookName: '为了让我考上高校，妈妈成为了我的性处理肉便器母狗',
        entryUids: { sfw: 7, nsfw: 5, rules: 8 },
        cnUrls: {
            sfw: 'https://testingcf.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E4%B8%BA%E4%BA%86%E8%AE%A9%E6%88%91%E8%80%83%E4%B8%8A%E9%AB%98%E6%A0%A1%EF%BC%8C%E9%99%AA%E8%AF%BB%E6%AF%8D%E4%BA%B2%E6%88%90%E4%B8%BA%E4%BA%86%E6%88%91%E7%9A%84%E6%80%A7%E5%A4%84%E7%90%86%E8%82%89%E4%BE%BF%E5%99%A8%E6%AF%8D%E7%8B%97/SFW.txt',
            nsfw: 'https://testingcf.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E4%B8%BA%E4%BA%86%E8%AE%A9%E6%88%91%E8%80%83%E4%B8%8A%E9%AB%98%E6%A0%A1%EF%BC%8C%E9%99%AA%E8%AF%BB%E6%AF%8D%E4%BA%B2%E6%88%90%E4%B8%BA%E4%BA%86%E6%88%91%E7%9A%84%E6%80%A7%E5%A4%84%E7%90%86%E8%82%89%E4%BE%BF%E5%99%A8%E6%AF%8D%E7%8B%97/NSFW.txt',
            rules: 'https://testingcf.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E4%B8%BA%E4%BA%86%E8%AE%A9%E6%88%91%E8%80%83%E4%B8%8A%E9%AB%98%E6%A0%A1%EF%BC%8C%E9%99%AA%E8%AF%BB%E6%AF%8D%E4%BA%B2%E6%88%90%E4%B8%BA%E4%BA%86%E6%88%91%E7%9A%84%E6%80%A7%E5%A4%84%E7%90%86%E8%82%89%E4%BE%BF%E5%99%A8%E6%AF%8D%E7%8B%97/rules.txt'
        },
        globalUrls: {
            sfw: 'https://cdn.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E4%B8%BA%E4%BA%86%E8%AE%A9%E6%88%91%E8%80%83%E4%B8%8A%E9%AB%98%E6%A0%A1%EF%BC%8C%E9%99%AA%E8%AF%BB%E6%AF%8D%E4%BA%B2%E6%88%90%E4%B8%BA%E4%BA%86%E6%88%91%E7%9A%84%E6%80%A7%E5%A4%84%E7%90%86%E8%82%89%E4%BE%BF%E5%99%A8%E6%AF%8D%E7%8B%97/SFW.txt',
            nsfw: 'https://cdn.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E4%B8%BA%E4%BA%86%E8%AE%A9%E6%88%91%E8%80%83%E4%B8%8A%E9%AB%98%E6%A0%A1%EF%BC%8C%E9%99%AA%E8%AF%BB%E6%AF%8D%E4%BA%B2%E6%88%90%E4%B8%BA%E4%BA%86%E6%88%91%E7%9A%84%E6%80%A7%E5%A4%84%E7%90%86%E8%82%89%E4%BE%BF%E5%99%A8%E6%AF%8D%E7%8B%97/NSFW.txt',
            rules: 'https://cdn.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E4%B8%BA%E4%BA%86%E8%AE%A9%E6%88%91%E8%80%83%E4%B8%8A%E9%AB%98%E6%A0%A1%EF%BC%8C%E9%99%AA%E8%AF%BB%E6%AF%8D%E4%BA%B2%E6%88%90%E4%B8%BA%E4%BA%86%E6%88%91%E7%9A%84%E6%80%A7%E5%A4%84%E7%90%86%E8%82%89%E4%BE%BF%E5%99%A8%E6%AF%8D%E7%8B%97/rules.txt'
        },
        popup: {
            title: '陪读妈妈CG更新',
            question: '请选择更新节点：',
            subtext: '更新后将覆写 SFW、NSFW 和规则三个条目',
            btnCn: '🏞️ 国内-更新',
            btnGlobal: '🌍 国外-更新'
        },
        bgImage: 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E7%8E%8B%E6%98%A5%E9%A3%8E%E7%8A%B6%E6%80%81%E6%A0%8F.png',
        wizardShownKey: 'peidu_mama_cg_update_wizard_shown_final'
    };

    // ─── 毛玻璃通知图片 ────────────────────────────────────────────
    var NOTIF_IMAGE = 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E5%BC%B9%E7%AA%97.png';

    // ─── 毛玻璃通知函数（仅用于更新成功提示） ──────────────────
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
                    <img src="${NOTIF_IMAGE}" style="width:100%;height:100%;object-fit:cover;display:block;">
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

    function log(msg) { console.log('[陪读妈妈CG更新] ' + msg); }
    function showToast(text) {
        if (typeof toastr !== 'undefined') {
            toastr.success(text, '', { timeOut: 3000 });
        } else { log(text); }
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
        // ★ 只有这里使用毛玻璃通知 ★
        showGlassNotification(
            '✅ 最新插图CG已更新完成',
            '请关注作者：三年的水，期待更多精彩故事！'
        );
        markWizardShown();
    }

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
                text-align: center;
                padding: 24px 20px;
                background-image: url('${CONFIG.bgImage}');
                background-size: cover;
                background-position: center;
                background-blend-mode: overlay;
                background-color: rgba(30, 25, 22, 0.65);
                border-radius: 12px;
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
            ">
                <div style="
                    font-size: 18px;
                    font-weight: 700;
                    color: #f0d8b0;
                    letter-spacing: 6px;
                    text-shadow: 0 2px 12px rgba(0,0,0,0.9);
                ">
                    ${CONFIG.popup.title}
                </div>
                <div style="height:1px;background:rgba(180,140,100,0.08);margin:12px 0 16px;"></div>
                <div style="
                    font-size: 14px;
                    color: #f0e6d8;
                    line-height: 1.8;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.85);
                ">
                    ${CONFIG.popup.question}
                </div>
                <div style="
                    font-size: 12px;
                    color: rgba(220, 200, 185, 0.85);
                    margin: 6px 0 12px;
                    text-shadow: 0 2px 8px rgba(0,0,0,0.7);
                ">
                    ${CONFIG.popup.subtext}
                </div>
                <div style="
                    font-size: 11px;
                    color: rgba(220, 200, 185, 0.5);
                    border-top: 1px solid rgba(255,255,255,0.04);
                    padding-top: 8px;
                    text-shadow: 0 1px 6px rgba(0,0,0,0.8);
                ">
                    选择任一节点开始更新
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
                log('用户点击「国内-更新」');
                markWizardShown();
                performUpdate('cn');
            } else {
                log('用户点击「国外-更新」');
                markWizardShown();
                performUpdate('global');
            }
        }).catch(function(err) {
            isPopupShowing = false;
            log('弹窗关闭: ' + err.message);
        });
    }

    function init() {
        log('脚本已加载（最终版 v3.3）');
        setupChatChangedListener();
        if (hasShownWizard()) {
            log('向导已显示过，跳过弹窗');
            return;
        }
        setTimeout(showWizardPopup, 800);
    }

    window.resetPeiduMamaCGUpdate = function() {
        clearWizardShown();
        isPopupShowing = false;
        showToast('✅ 已重置');
        setTimeout(function() {
            if (!hasShownWizard()) {
                showWizardPopup();
            }
        }, 500);
    };

    window.forcePeiduMamaCGUpdate = function() {
        clearWizardShown();
        isPopupShowing = false;
        showWizardPopup();
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 500);
        });
    }

    log('✅ 陪读妈妈CG更新脚本（最终版 v3.3）已加载');

})();

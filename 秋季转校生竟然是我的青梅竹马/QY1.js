// ============================================================
// 物理开关_事件触发器 (链式解锁版)
// 世界书：秋季转校生竟然是我的青梅竹马
// 事件链：转校生登场 → 同桌第一天 → ... → 海边旅行
// ============================================================

(async () => {
    'use strict';
    await waitGlobalInitialized('Mvu');

    // ────────── 配置 ──────────────────────────────────────────
    const WORLD_BOOK_NAME = '秋季转校生竟然是我的青梅竹马';

    // ─── 19个事件按顺序排列（链式解锁） ──────────────────────
    const EVENT_CHAIN = [
        '转校生登场',
        '同桌第一天',
        '身份认出',
        '一起写作业',
        '被炉下碰手',
        '情书误会',
        '星宫冷战',
        '小公园对质',
        '互相告白',
        '第一次牵手',
        '第一次接吻',
        '定亲坦白',
        '回家确认定亲',
        '第一次亲密',
        '事后依靠',
        '公开日常',
        '正式提及未来',
        '订婚',
        '海边旅行'
    ];

    // 所有事件的条目名称映射：事件_${变量名}
    // 例如：事件_转校生登场

    // ────────── 扁平→嵌套工具 ──────────────────────────────
    function unflatten(flat) {
        if (!flat || typeof flat !== 'object') return {};
        if (Object.keys(flat).some(k => !k.includes('.'))) return flat;
        const result = {};
        for (const [key, val] of Object.entries(flat)) {
            const parts = key.split('.');
            let cur = result;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!cur[parts[i]]) cur[parts[i]] = {};
                cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = val;
        }
        return result;
    }

    // ────────── 判断事件是否已完成 ──────────────────────────
    function isEventCompleted(vars, eventName) {
        const path = `stat_data.事件.${eventName}`;
        const val = _.get(vars, path);

        // 情书误会是枚举类型：'未发生' | '已发生' | '已解释'
        if (eventName === '情书误会') {
            return val === '已解释';
        }

        // 其他事件都是 boolean
        return val === true;
    }

    // ────────── 获取当前楼层变量 ────────────────────────────
    function getStatData() {
        try {
            const ctx = typeof SillyTavern !== 'undefined' ? SillyTavern.getContext() : null;
            const latestIndex = ctx && ctx.chat ? ctx.chat.length - 1 : null;
            if (latestIndex !== null && latestIndex >= 0) {
                const result = getVariables({ type: 'message', message_id: latestIndex });
                const raw = _.get(result, 'stat_data', {});
                return unflatten(raw);
            }
            return {};
        } catch (e) { return {}; }
    }

    // ────────── 获取当前楼层变量（用于MVU监听） ──────────────
    function getStatDataFromVars(vars) {
        const raw = _.get(vars, 'stat_data', {});
        return unflatten(raw);
    }

    // ────────── Toast提示 ────────────────────────────────────
    function showToast(msg) {
        try {
            if (typeof toastr !== 'undefined') {
                toastr.success(msg, '', { timeOut: 2500 });
            }
        } catch (e) {}
    }

    // ────────── 核心：更新世界书条目状态 ────────────────────
    let lastVarHash = '';

    async function updateEventEntries(vars) {
        try {
            const statData = vars?.stat_data ? unflatten(vars.stat_data) : vars;

            // 防抖：避免无效更新
            const currentHash = JSON.stringify(statData);
            if (currentHash === lastVarHash) return;
            lastVarHash = currentHash;

            // 获取世界书
            const worldbook = await TavernHelper.getWorldbook(WORLD_BOOK_NAME);
            if (!worldbook) {
                console.warn('[事件触发器] 未找到世界书:', WORLD_BOOK_NAME);
                return;
            }

            let hasChange = false;
            let newlyCompleted = null;

            const updated = worldbook.map(entry => {
                // 检查这个条目是否在事件链中
                const eventName = EVENT_CHAIN.find(name => entry.name === `事件_${name}`);
                if (!eventName) return entry;

                const currentIdx = EVENT_CHAIN.indexOf(eventName);
                let shouldEnable = false;
                let reason = '';

                if (currentIdx === 0) {
                    // 第一个事件：未完成时启用
                    const completed = isEventCompleted(statData, eventName);
                    shouldEnable = !completed;
                    reason = shouldEnable ? '第一个事件，等待触发' : '已完成，关闭';
                } else {
                    const prevEventName = EVENT_CHAIN[currentIdx - 1];
                    const prevCompleted = isEventCompleted(statData, prevEventName);
                    const currentCompleted = isEventCompleted(statData, eventName);
                    shouldEnable = prevCompleted && !currentCompleted;

                    if (shouldEnable && prevCompleted && !currentCompleted) {
                        newlyCompleted = prevEventName;
                    }

                    reason = shouldEnable ? `前置事件已完成，等待触发 ${eventName}` :
                             currentCompleted ? `${eventName} 已完成，关闭` :
                             `前置事件未完成，保持关闭`;
                }

                if (entry.enabled !== shouldEnable) {
                    entry.enabled = shouldEnable;
                    hasChange = true;
                    console.log(`[事件触发器] ${entry.name} → ${shouldEnable ? '✅ 开启' : '❌ 关闭'} (${reason})`);
                }
                return entry;
            });

            if (hasChange) {
                await TavernHelper.replaceWorldbook(WORLD_BOOK_NAME, updated);

                // 如果有新完成的事件，显示提示
                if (newlyCompleted) {
                    const eventNames = {
                        '转校生登场': '📚 转校生登场',
                        '同桌第一天': '📖 同桌第一天',
                        '身份认出': '🔍 身份认出',
                        '一起写作业': '✏️ 一起写作业',
                        '被炉下碰手': '🤝 被炉下碰手',
                        '情书误会': '💌 情书误会',
                        '星宫冷战': '❄️ 星宫冷战',
                        '小公园对质': '🌳 小公园对质',
                        '互相告白': '💕 互相告白',
                        '第一次牵手': '👫 第一次牵手',
                        '第一次接吻': '💋 第一次接吻',
                        '定亲坦白': '💍 定亲坦白',
                        '回家确认定亲': '🏠 回家确认定亲',
                        '第一次亲密': '🌙 第一次亲密',
                        '事后依靠': '🛌 事后依靠',
                        '公开日常': '☀️ 公开日常',
                        '正式提及未来': '📅 正式提及未来',
                        '订婚': '💎 订婚',
                        '海边旅行': '🌊 海边旅行'
                    };
                    const displayName = eventNames[newlyCompleted] || newlyCompleted;
                    showToast(`✅ ${displayName} 已解锁！`);
                }

                // 刷新世界书编辑器
                if (typeof TavernHelper.builtin?.reloadEditor === 'function') {
                    TavernHelper.builtin.reloadEditor(WORLD_BOOK_NAME);
                }

                console.log('[事件触发器] ✅ 世界书已更新');
            }
        } catch (e) {
            console.error('[事件触发器] 更新失败:', e);
        }
    }

    // ────────── 轮询检测（兼容伪同层变量） ──────────────────
    let pollingTimer = null;

    function startPolling() {
        if (pollingTimer) clearInterval(pollingTimer);
        pollingTimer = setInterval(async () => {
            try {
                const statData = getStatData();
                await updateEventEntries(statData);
            } catch (e) {
                // 静默忽略轮询错误
            }
        }, 2000);
    }

    function stopPolling() {
        if (pollingTimer) {
            clearInterval(pollingTimer);
            pollingTimer = null;
        }
    }

    // ────────── MVU事件监听 ──────────────────────────────────
    let mvuListener = null;

    function initMvuListener() {
        try {
            if (typeof eventOn !== 'undefined' && typeof Mvu !== 'undefined') {
                mvuListener = eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, async (newVars) => {
                    const statData = getStatDataFromVars(newVars);
                    await updateEventEntries(statData);
                });
                console.log('[事件触发器] ✅ MVU 事件监听已注册');
            } else {
                console.warn('[事件触发器] MVU 不可用，仅使用轮询');
            }
        } catch (e) {
            console.warn('[事件触发器] MVU 监听注册失败:', e);
        }
    }

    // ────────── 强制初始化同步 ──────────────────────────────
    async function forceSync() {
        try {
            const statData = getStatData();
            await updateEventEntries(statData);
            console.log('[事件触发器] ✅ 初始化完成');
        } catch (e) {
            console.error('[事件触发器] 初始化失败:', e);
        }
    }

    // ────────── 启动 ──────────────────────────────────────────
    $(async () => {
        try {
            // 检查世界书是否存在
            const wb = await TavernHelper.getWorldbook(WORLD_BOOK_NAME);
            if (!wb) {
                console.error('[事件触发器] ❌ 未找到世界书:', WORLD_BOOK_NAME);
                return;
            }

            // 检查事件条目是否存在
            const firstEntry = wb.find(e => e.name === '事件_转校生登场');
            if (!firstEntry) {
                console.warn('[事件触发器] ⚠️ 未找到事件条目，请确认条目命名格式为 "事件_${变量名}"');
            } else {
                console.log('[事件触发器] ✅ 找到事件条目，开始监听');
            }

            // 启动轮询
            startPolling();

            // 注册MVU监听
            initMvuListener();

            // 初始同步
            await forceSync();

            console.log(`[事件触发器] 已加载，共 ${EVENT_CHAIN.length} 个事件，世界书: ${WORLD_BOOK_NAME}`);
        } catch (e) {
            console.error('[事件触发器] 启动失败:', e);
        }
    });

    // ────────── 卸载清理 ──────────────────────────────────────
    $(window).on('pagehide', function() {
        stopPolling();
        if (mvuListener && typeof mvuListener === 'function') {
            try { mvuListener(); } catch (e) {}
        }
        console.log('[事件触发器] 已卸载');
    });

})();
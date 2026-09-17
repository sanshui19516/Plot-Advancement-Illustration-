// ============================================================
// 事件触发器 · 长须川兄妹
// ============================================================

(async () => {
  'use strict';
  await waitGlobalInitialized('Mvu');

  const WORLD_BOOK_NAME = '长须川兄妹';

  // 扁平→嵌套工具函数
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

  // ─── 事件链（按顺序解锁） ────────────────────────────────
  const EVENT_CHAIN = [
    '开场早晨',
    '校服与早餐',
    '一起出门',
    '教室日常',
    '放学游戏',
    '热饮默契',
    '睡前检查',
    '镜中对视',
    '感冒摸额头',
    '停电夜晚',
    '旧卫衣',
    '靠肩睡着',
    '毛巾包头',
    '游戏超时',
    '生气锁门',
    '洗衣事件',
    '童年的梦',
    '哥哥的疲惫',
    '浴袍意外',
    '摔倒接住',
    '班上的女生',
    '有人追彩叶',
    '像一对',
    '母亲视频',
    '情绪顶点',
    '称呼改变',
    '名字习惯化',
    '第一次牵手',
    '第一次接吻',
    '身体关系',
    '沉沦日常',
    '讨论未来',
    '考虑结婚',
    '结局氛围'
  ];

  // ─── 判断事件是否已完成 ──────────────────────────────────
  function isEventCompleted(vars, eventName) {
    const val = _.get(vars, `stat_data.事件.${eventName}`);
    return val === true;
  }

  // ─── 构建事件配置 ─────────────────────────────────────────
  const EVENT_CONFIGS = {};
  EVENT_CHAIN.forEach((eventName, idx) => {
    const entryName = `事件_${eventName}`;
    if (idx === 0) {
      // 第一个事件：未完成时启用
      EVENT_CONFIGS[entryName] = {
        condition: (vars) => !isEventCompleted(vars, eventName)
      };
    } else {
      // 后续事件：前置完成 && 当前未完成
      const prevName = EVENT_CHAIN[idx - 1];
      EVENT_CONFIGS[entryName] = {
        condition: (vars) => {
          const prevDone = isEventCompleted(vars, prevName);
          const currentDone = isEventCompleted(vars, eventName);
          return prevDone === true && !currentDone;
        }
      };
    }
  });

  let lastVarHash = '';

  async function updateEventEntries(vars) {
    try {
      const rawStat = vars?.stat_data || vars;
      const statData = unflatten(rawStat);
      const currentHash = JSON.stringify(statData);
      if (currentHash === lastVarHash) return;
      lastVarHash = currentHash;

      const worldbook = await TavernHelper.getWorldbook(WORLD_BOOK_NAME);
      let hasChange = false;
      const updated = worldbook.map(entry => {
        const config = EVENT_CONFIGS[entry.name];
        if (config) {
          const shouldEnable = config.condition({ stat_data: statData });
          if (entry.enabled !== shouldEnable) {
            entry.enabled = shouldEnable;
            hasChange = true;
            console.log(`[事件触发器] ${entry.name} → ${shouldEnable ? '开启' : '关闭'}`);
          }
        }
        return entry;
      });
      if (hasChange) {
        await TavernHelper.replaceWorldbook(WORLD_BOOK_NAME, updated);
        console.log('[事件触发器] ✅ 世界书已更新');
      }
    } catch (e) {
      console.error('[事件触发器] 更新失败:', e);
    }
  }

  // 轮询
  setInterval(async () => {
    try {
      const ctx = typeof SillyTavern !== 'undefined' ? SillyTavern.getContext() : null;
      const latestIndex = ctx && ctx.chat ? ctx.chat.length - 1 : null;
      if (latestIndex !== null && latestIndex >= 0) {
        const result = getVariables({ type: 'message', message_id: latestIndex });
        const statData = _.get(result, 'stat_data', {});
        await updateEventEntries(statData);
      }
    } catch (e) {}
  }, 1500);

  // 初始化
  $(async () => {
    try {
      const ctx = typeof SillyTavern !== 'undefined' ? SillyTavern.getContext() : null;
      const latestIndex = ctx && ctx.chat ? ctx.chat.length - 1 : null;
      if (latestIndex !== null && latestIndex >= 0) {
        const result = getVariables({ type: 'message', message_id: latestIndex });
        const statData = _.get(result, 'stat_data', {});
        await updateEventEntries(statData);
        console.log('[事件触发器] 初始化完成，轮询已启动');
      }
    } catch (e) {
      console.error('[事件触发器] 初始化失败:', e);
    }
  });
})();
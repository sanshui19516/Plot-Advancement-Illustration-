// ============================================================
// 事件触发器 · 熟女双人的夜恋
// 监听MVU变量变化，自动开关20个事件条目的 enabled 状态
// 前缀：night_
// ============================================================

(async () => {
  'use strict';
  await waitGlobalInitialized('Mvu');

  const WORLD_BOOK_NAME = '熟女双人的夜恋';

  // ────────── 扁平→嵌套工具（兼容伪同层变量） ──────────
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

  // ────────── 角色关系阶段列表（用于判断阶段高低） ──────────
  const LINZHIXIA_STAGES = [
    '标准母子距离，道德感强',
    '夜袭后察觉异样，开始偷偷看',
    '身体记忆发酵，道德感松动',
    '主动或半主动发生关系',
    '小女人姿态与母亲身份并存'
  ];

  const JIANGTANG_STAGES = [
    '把{{user}}当弟弟，玩笑为主',
    '被温柔击中，开始卡壳',
    '用更大的玩笑盖住心跳',
    '关系确认，开始吃醋',
    '占有欲上升，闹小脾气'
  ];

  // ────────── 工具函数 ──────────

  // 安全读取嵌套字段（statData 为嵌套对象）
  function getStat(statData, path, defaultValue = undefined) {
    const val = _.get(statData, path);
    return val === undefined ? defaultValue : val;
  }

  // 判断事件是否已完成
  function isEventDone(statData, eventName) {
    return getStat(statData, '事件.' + eventName, false) === true;
  }

  // 获取角色关系阶段的排名（1-5，未知返回1）
  function stageRank(stageName, stageList) {
    if (!stageName || typeof stageName !== 'string') return 1;
    const idx = stageList.findIndex(s => stageName.indexOf(s) !== -1 || s.indexOf(stageName) !== -1);
    return idx >= 0 ? idx + 1 : 1;
  }

  // 时段/场景快捷判断
  const isNight = (t) => t === '深夜';
  const isEvening = (t) => t === '傍晚';
  const isMorningNoon = (t) => t === '上午' || t === '正午';
  const isHomeLiving = (s) => s === '林芝夏家客厅';

  // ────────── 事件条件配置 ──────────
  // 键 = 世界书条目名称（与 comment 字段完全一致）
  // 值 = condition 函数，返回 true 则启用条目
  const EVENT_CONFIGS = {

    // ========== 第一批：日常建立 ==========

    '事件_江棠串门': {
      condition: (v) => {
        const time = getStat(v, '世界.时段');
        const scene = getStat(v, '世界.当前场景');
        return (isEvening(time) || isNight(time)) && isHomeLiving(scene)
          && !isEventDone(v, '江棠串门');
      }
    },

    '事件_江棠调戏': {
      condition: (v) => {
        const done1 = isEventDone(v, '江棠串门');
        const favor = getStat(v, '江棠.好感度', 0);
        return done1 && favor >= 10 && !isEventDone(v, '江棠调戏');
      }
    },

    '事件_林芝夏的呵斥': {
      condition: (v) => {
        const done2 = isEventDone(v, '江棠调戏');
        return done2 && !isEventDone(v, '林芝夏的呵斥');
      }
    },

    '事件_三人的餐桌': {
      condition: (v) => {
        const done1 = isEventDone(v, '江棠串门');
        const time = getStat(v, '世界.时段');
        return done1 && (isEvening(time) || time === '正午')
          && !isEventDone(v, '三人的餐桌');
      }
    },

    '事件_送江棠回隔壁': {
      condition: (v) => {
        const done1 = isEventDone(v, '江棠串门');
        const time = getStat(v, '世界.时段');
        return done1 && isNight(time) && !isEventDone(v, '送江棠回隔壁');
      }
    },

    // ========== 第二批：转折与越界 ==========

    '事件_江棠的愣神': {
      condition: (v) => {
        const done2 = isEventDone(v, '江棠调戏');
        const favor = getStat(v, '江棠.好感度', 0);
        return done2 && favor >= 30 && !isEventDone(v, '江棠的愣神');
      }
    },

    '事件_江棠夜袭': {
      condition: (v) => {
        const done6 = isEventDone(v, '江棠的愣神');
        const time = getStat(v, '世界.时段');
        const scene = getStat(v, '世界.当前场景');
        const favor = getStat(v, '江棠.好感度', 0);
        return done6 && isNight(time) && scene === '{{user}}的房间'
          && favor >= 50 && !isEventDone(v, '江棠夜袭');
      }
    },

    '事件_夜袭后回隔壁': {
      condition: (v) => {
        const done7 = isEventDone(v, '江棠夜袭');
        return done7 && !isEventDone(v, '夜袭后回隔壁');
      }
    },

    '事件_白天的不自然': {
      condition: (v) => {
        const done7 = isEventDone(v, '江棠夜袭');
        const time = getStat(v, '世界.时段');
        return done7 && isMorningNoon(time)
          && !isEventDone(v, '白天的不自然');
      }
    },

    '事件_林芝夏的察觉': {
      condition: (v) => {
        const done7 = isEventDone(v, '江棠夜袭');
        const favor = getStat(v, '林芝夏.好感度', 0);
        return done7 && favor >= 20 && !isEventDone(v, '林芝夏的察觉');
      }
    },

    // ========== 第三批：各自推进 ==========

    '事件_林芝夏的偷偷看': {
      condition: (v) => {
        const done10 = isEventDone(v, '林芝夏的察觉');
        const desire = getStat(v, '林芝夏.欲望值', 0);
        return done10 && desire >= 20 && !isEventDone(v, '林芝夏的偷偷看');
      }
    },

    '事件_江棠的吃醋': {
      condition: (v) => {
        const done7 = isEventDone(v, '江棠夜袭');
        const favor = getStat(v, '江棠.好感度', 0);
        const lzxDesire = getStat(v, '林芝夏.欲望值', 0);
        return done7 && favor >= 60 && lzxDesire >= 20
          && !isEventDone(v, '江棠的吃醋');
      }
    },

    '事件_林芝夏的身体记忆': {
      condition: (v) => {
        const done10 = isEventDone(v, '林芝夏的察觉');
        const morality = getStat(v, '林芝夏.道德值', 100);
        return done10 && morality <= 60 && !isEventDone(v, '林芝夏的身体记忆');
      }
    },

    '事件_{{user}}的混乱': {
      condition: (v) => {
        const done7 = isEventDone(v, '江棠夜袭');
        const chaos = getStat(v, 'user.混乱度', 0);
        return done7 && chaos >= 30 && !isEventDone(v, '{{user}}的混乱');
      }
    },

    // ========== 第四批：林芝夏破局 ==========

    '事件_林芝夏的动摇': {
      condition: (v) => {
        const done13 = isEventDone(v, '林芝夏的身体记忆');
        const desire = getStat(v, '林芝夏.欲望值', 0);
        const morality = getStat(v, '林芝夏.道德值', 100);
        return done13 && desire >= 50 && morality <= 40
          && !isEventDone(v, '林芝夏的动摇');
      }
    },

    '事件_林芝夏夜袭': {
      condition: (v) => {
        const done15 = isEventDone(v, '林芝夏的动摇');
        const time = getStat(v, '世界.时段');
        const scene = getStat(v, '世界.当前场景');
        return done15 && isNight(time) && scene === '{{user}}的房间'
          && !isEventDone(v, '林芝夏夜袭');
      }
    },

    '事件_事后别扭': {
      condition: (v) => {
        const done16 = isEventDone(v, '林芝夏夜袭');
        const time = getStat(v, '世界.时段');
        return done16 && isMorningNoon(time)
          && !isEventDone(v, '事后别扭');
      }
    },

    // ========== 第五批：确认与后续 ==========

    '事件_江棠线的确认': {
      condition: (v) => {
        const lzxStage = stageRank(getStat(v, '林芝夏.关系阶段'), LINZHIXIA_STAGES);
        const jtStage = stageRank(getStat(v, '江棠.关系阶段'), JIANGTANG_STAGES);
        const jtFavor = getStat(v, '江棠.好感度', 0);
        return lzxStage <= 3 && jtStage >= 4 && jtFavor >= 80
          && !isEventDone(v, '江棠线的确认');
      }
    },

    '事件_林芝夏线的确认': {
      condition: (v) => {
        const lzxStage = stageRank(getStat(v, '林芝夏.关系阶段'), LINZHIXIA_STAGES);
        const jtStage = stageRank(getStat(v, '江棠.关系阶段'), JIANGTANG_STAGES);
        const lzxFavor = getStat(v, '林芝夏.好感度', 0);
        return jtStage <= 3 && lzxStage >= 4 && lzxFavor >= 80
          && !isEventDone(v, '林芝夏线的确认');
      }
    },

    '事件_三人平衡': {
      condition: (v) => {
        const lzxStage = stageRank(getStat(v, '林芝夏.关系阶段'), LINZHIXIA_STAGES);
        const jtStage = stageRank(getStat(v, '江棠.关系阶段'), JIANGTANG_STAGES);
        return lzxStage >= 4 && jtStage >= 4
          && !isEventDone(v, '三人平衡');
      }
    }

  };

  // ────────── 核心执行逻辑 ──────────

  let lastVarHash = '';

  async function updateEventEntries(vars) {
    try {
      // 统一转成嵌套结构
      const rawStat = vars?.stat_data || vars || {};
      const statData = unflatten(rawStat);

      // 哈希去重，避免重复更新
      const currentHash = JSON.stringify(statData);
      if (currentHash === lastVarHash) return;
      lastVarHash = currentHash;

      const worldbook = await TavernHelper.getWorldbook(WORLD_BOOK_NAME);
      if (!worldbook) {
        console.warn('[事件触发器] 未找到世界书:', WORLD_BOOK_NAME);
        return;
      }

      let hasChange = false;
      const updated = worldbook.map(entry => {
        const config = EVENT_CONFIGS[entry.name];
        if (config) {
          const shouldEnable = config.condition(statData);
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
        if (typeof TavernHelper.builtin?.reloadEditor === 'function') {
          TavernHelper.builtin.reloadEditor(WORLD_BOOK_NAME);
        }
        console.log('[事件触发器] ✅ 世界书已更新');
      }
    } catch (e) {
      console.error('[事件触发器] 更新失败:', e);
    }
  }

  // ────────── 监听 MVU 变量变化 ──────────

  try {
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, async (newVars) => {
      await updateEventEntries(newVars);
    });
    console.log('[事件触发器] MVU 事件监听已注册');
  } catch (e) {
    console.warn('[事件触发器] MVU 监听注册失败:', e);
  }

  // ────────── 轮询（兼容伪同层变量） ──────────

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

  // ────────── 初始化 ──────────

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

  // ────────── 卸载清理 ──────────

  $(window).on('pagehide', function () {
    console.log('[事件触发器] 已卸载');
  });

})();

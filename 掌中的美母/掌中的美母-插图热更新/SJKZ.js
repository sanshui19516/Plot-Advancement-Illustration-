// ============================================================
// 事件控制器 · 掌中的美母
// 功能：监听MVU变量变化，根据章节完成状态，自动开关世界书章节条目
// ============================================================

(async () => {
  'use strict';

  // 等待 MVU 初始化
  await waitGlobalInitialized('Mvu');

  // ============================================================
  // 一、配置区域
  // ============================================================

  // 世界书名称（硬编码）
  const WORLD_BOOK_NAME = '掌中的美母';

  // 章节条目名称列表（按顺序，从第1章到第120章）
  const CHAPTER_ENTRY_NAMES = [
    '第1章_计划开始_事件',
    '第2章_周依依_事件',
    '第3章_同性恋_事件',
    '第4章_转机_事件',
    '第5章_和妈妈一起睡_事件',
    '第6章_再次按摩_事件',
    '第7章_得寸进尺_事件',
    '第8章_离家_事件',
    '第9章_开苞_事件',
    '第10章_梅开二度_事件',
    '第11章_姐姐_事件',
    '第12章_回家_事件',
    '第13章_谈心_事件',
    '第14章_缠绵的夜_事件',
    '第15章_丝袜足交_事件',
    '第16章_达摩克里斯之剑_事件',
    '第17章_爸爸回家_事件',
    '第18章_平地起风_事件',
    '第19章_拉扯之间_事件',
    '第20章_背德的序曲_事件',
    '第21章_淫靡的演出_事件',
    '第22章_暧昧的间奏_事件',
    '第23章_骤雨中的高潮_事件',
    '第24章_妈妈的反击_事件',
    '第25章_不能碰我_事件',
    '第26章_打屁股_事件',
    '第27章_深喉射精_事件',
    '第28章_还有下一次_事件',
    '第29章_回家日常_事件',
    '第30章_父前淫母_事件',
    '第31章_厕所激情_事件',
    '第32章_住校伊始_事件',
    '第33章_文爱调教_事件',
    '第34章_妈妈的小秘密_事件',
    '第35章_玩具_事件',
    '第36章_再次深喉_事件',
    '第37章_初尝肛交_事件',
    '第38章_事件',
    '第39章_事件',
    '第40章_事件',
    '第41章_小日常_事件',
    '第42章_餐厅足交_事件',
    '第43章_爱_事件',
    '第44章_欲_事件',
    '第45章_乱_事件',
    '第46章_事件',
    '第47章_事件',
    '第48章_事件',
    '第49章_听话的妈妈_事件',
    '第50章_夜色_事件',
    '第51章_事件',
    '第52章_事件',
    '第53章_事件',
    '第54章_事件',
    '第55章_事件',
    '第56章_事件',
    '第57章_事件',
    '第58章_事件',
    '第59章_事件',
    '第60章_事件',
    '第61章_事件',
    '第62章_事件',
    '第63章_事件',
    '第64章_事件',
    '第65章_事件',
    '第66章_一日谈之跳蛋_事件',
    '第67章_一日谈之拍摄_事件',
    '第68章_一日谈之母狗_事件',
    '第69章_一日谈之出门_事件',
    '第70章_一日谈之漫展_事件',
    '第71章_厕所_事件',
    '第72章_洗干净_事件',
    '第73章_项圈_事件',
    '第74章_遛狗_事件',
    '第75章_填满_事件',
    '第76章_母亲的回忆_番外一_事件',
    '第77章_母亲的回忆_番外二_事件',
    '第78章_母亲的回忆_番外三_事件',
    '第79章_母亲的回忆_番外四_事件',
    '第80章_日常_事件',
    '第81章_事件',
    '第82章_事件',
    '第83章_事件',
    '第84章_事件',
    '第85章_事件',
    '第86章_事件',
    '第87章_事件',
    '第88章_事件',
    '第89章_事件',
    '第90章_事件',
    '第91章_事件',
    '第92章_事件',
    '第93章_事件',
    '第94章_事件',
    '第95章_事件',
    '第96章_事件',
    '第97章_事件',
    '第98章_事件',
    '第99章_事件',
    '第100章_事件',
    '第101章_事件',
    '第102章_事件',
    '第103章_事件',
    '第104章_事件',
    '第105章_事件',
    '第106章_事件',
    '第107章_事件',
    '第108章_事件',
    '第109章_事件',
    '第110章_主奴契约_事件',
    '第111章_主奴契约_事件',
    '第112章_事件',
    '第113章_事件',
    '第114章_事件',
    '第115章_事件',
    '第116章_事件',
    '第117章_事件',
    '第118章_事件',
    '第119章_事件',
    '第120章_大结局_事件',
  ];

  // ============================================================
  // 二、工具函数
  // ============================================================

  // 扁平化对象转嵌套对象（兼容 MVU 变量可能的扁平存储）
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

  // 变量哈希（用于判断变量是否变化）
  let lastVarHash = '';

  // ============================================================
  // 三、核心逻辑：根据变量状态，更新章节条目开关
  // ============================================================

  async function updateChapterEntries(vars) {
    try {
      // 1. 确保使用嵌套结构
      const rawStat = vars?.stat_data || vars;
      const statData = unflatten(rawStat);

      // 2. 计算变量哈希，判断是否需要执行
      const currentHash = JSON.stringify(statData?.事件?.章节 || {});
      if (currentHash === lastVarHash) return;
      lastVarHash = currentHash;

      // 3. 从第1章开始依次查找，找到第一个未完成的章节
      let currentChapterIndex = -1;
      for (let i = 0; i < CHAPTER_ENTRY_NAMES.length; i++) {
        const chapterKey = `第${i + 1}章`;
        const completed = _.get(statData, `事件.章节.${chapterKey}`) || false;
        if (!completed) {
          currentChapterIndex = i;
          break;
        }
      }

      // 4. 如果所有章节都完成，最后启用第120章
      if (currentChapterIndex === -1) {
        currentChapterIndex = CHAPTER_ENTRY_NAMES.length - 1;
      }

      console.log(`[事件控制器] 当前应该启用的章节：第${currentChapterIndex + 1}章`);

      // 5. 获取世界书
      const worldbook = await TavernHelper.getWorldbook(WORLD_BOOK_NAME);

      // 6. 遍历世界书条目，按章节顺序设置 enabled 状态
      let hasChange = false;
      const updated = worldbook.map(entry => {
        const entryIndex = CHAPTER_ENTRY_NAMES.indexOf(entry.name);
        if (entryIndex !== -1) {
          // 是章节条目
          const shouldEnable = entryIndex === currentChapterIndex;
          if (entry.enabled !== shouldEnable) {
            entry.enabled = shouldEnable;
            hasChange = true;
            console.log(`[事件控制器] ${entry.name} → ${shouldEnable ? '开启' : '关闭'}`);
          }
        }
        return entry;
      });

      // 7. 如果有变化，写回世界书
      if (hasChange) {
        await TavernHelper.replaceWorldbook(WORLD_BOOK_NAME, updated);
        console.log('[事件控制器] ✅ 世界书已更新');
      }

      // 8. 可选：刷新世界书编辑器显示
      if (typeof TavernHelper.builtin?.reloadEditor === 'function') {
        TavernHelper.builtin.reloadEditor(WORLD_BOOK_NAME);
      }
    } catch (e) {
      console.error('[事件控制器] 更新失败:', e);
    }
  }

  // ============================================================
  // 四、监听 MVU 变量变化
  // ============================================================

  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, async (newVars) => {
    await updateChapterEntries(newVars);
  });

  // ============================================================
  // 五、轮询兜底（每2秒检查一次）
  // ============================================================

  setInterval(async () => {
    try {
      const ctx = typeof SillyTavern !== 'undefined' ? SillyTavern.getContext() : null;
      const latestIndex = ctx && ctx.chat ? ctx.chat.length - 1 : null;
      if (latestIndex !== null && latestIndex >= 0) {
        const result = getVariables({ type: 'message', message_id: latestIndex });
        const statData = _.get(result, 'stat_data', {});
        await updateChapterEntries(statData);
      }
    } catch (e) {
      // 静默失败，不中断
    }
  }, 2000);

  // ============================================================
  // 六、初始化同步
  // ============================================================

  $(async () => {
    try {
      console.log('[事件控制器] 开始初始化同步...');

      const ctx = typeof SillyTavern !== 'undefined' ? SillyTavern.getContext() : null;
      const latestIndex = ctx && ctx.chat ? ctx.chat.length - 1 : null;

      if (latestIndex !== null && latestIndex >= 0) {
        const result = getVariables({ type: 'message', message_id: latestIndex });
        const statData = _.get(result, 'stat_data', {});
        await updateChapterEntries(statData);
        console.log('[事件控制器] 初始化完成，轮询已启动');
      } else {
        console.log('[事件控制器] 无聊天记录，跳过初始化');
      }
    } catch (e) {
      console.error('[事件控制器] 初始化失败:', e);
    }
  });

  // ============================================================
  // 七、脚本卸载时清理（可选）
  // ============================================================

  $(window).on('pagehide', function () {
    console.log('[事件控制器] 已卸载');
  });
})();

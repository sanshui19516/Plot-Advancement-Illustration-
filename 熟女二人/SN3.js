// ============================================================
// 一键切换插图正则 · 毛玻璃通知版
// ============================================================

const NOTIF_IMAGE = 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E5%BC%B9%E7%AA%97.png';

const modes = {
  pc: {
    icon: '💻',
    name: '电脑插图适配模式',
    regexes: ['0.[SFW插图]电脑适配', '0.[NSFW插图]电脑适配']
  },
  mobile: {
    icon: '📱',
    name: '手机插图适配模式',
    regexes: ['1.[SFW插图]手机适配', '1.[NSFW插图]手机适配']
  }
};

// ─── 毛玻璃通知 ──────────────────────────────────────────────

function showGlassNotification(title, subtitle) {
  try {
    // 获取顶层文档
    let topDoc = document;
    try {
      if (window.parent && window.parent.document) {
        topDoc = window.parent.document;
      }
    } catch (e) {}

    // 移除旧通知
    const old = topDoc.querySelector('.rw-notif-custom');
    if (old) old.remove();

    // 创建通知
    const notif = topDoc.createElement('div');
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

    // 注入关键帧动画（如果不存在）
    if (!topDoc.getElementById('rw-notif-keyframes')) {
      const style = topDoc.createElement('style');
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

    // 关闭按钮
    notif.querySelector('button').addEventListener('click', function(e) {
      e.stopPropagation();
      notif.classList.add('exiting');
      setTimeout(function() { if (notif.parentNode) notif.remove(); }, 500);
    });

    // 点击通知本身关闭
    notif.addEventListener('click', function(e) {
      if (e.target === this || e.target.closest('div')) {
        notif.classList.add('exiting');
        setTimeout(function() { if (notif.parentNode) notif.remove(); }, 500);
      }
    });

    topDoc.body.appendChild(notif);

    // 3秒后自动关闭
    setTimeout(function() {
      if (notif.parentNode) {
        notif.classList.add('exiting');
        setTimeout(function() { if (notif.parentNode) notif.remove(); }, 500);
      }
    }, 3000);

  } catch (e) {
    console.warn('[弹窗] 显示失败:', e);
    // 降级方案：用 toastr
    toastr.info(title, '', { timeOut: 3000 });
  }
}

// ─── 切换逻辑 ──────────────────────────────────────────────

const allRegexes = Object.values(modes).flatMap(m => m.regexes);
let isSwitching = false;

function getCurrentMode() {
  const regexes = getTavernRegexes({ scope: 'character' });
  for (const [modeKey, mode] of Object.entries(modes)) {
    if (mode.regexes.every(function(name) {
      return regexes.find(function(r) { return r.script_name === name && r.enabled; });
    })) {
      return modeKey;
    }
  }
  return 'pc';
}

function updateButtons() {
  const current = getCurrentMode();
  const buttons = [];
  for (const [key, mode] of Object.entries(modes)) {
    if (key !== current) {
      buttons.push({ name: mode.icon + ' ' + mode.name, visible: true });
    }
  }
  buttons.push({ name: '当前: ' + modes[current].icon, visible: true });
  replaceScriptButtons(getScriptId(), buttons);
}

function registerEvents() {
  for (const [modeKey, mode] of Object.entries(modes)) {
    eventOnButton(mode.icon + ' ' + mode.name, function() {
      (function(modeKey) {
        if (!modes[modeKey]) return;
        if (getCurrentMode() === modeKey) {
          showGlassNotification('当前已是 ' + modes[modeKey].name, '无需切换');
          return;
        }

        SillyTavern.callGenericPopup(
          '<div style="text-align:center;"><p>确定要切换到 <strong>' + modes[modeKey].name + '</strong> 吗？</p><p style="color:#888;font-size:0.9em;margin-top:10px;">切换后将重新加载聊天</p></div>',
          SillyTavern.POPUP_TYPE.CONFIRM,
          '',
          { okButton: '确定切换', cancelButton: '取消' }
        ).then(function(confirmed) {
          if (confirmed === SillyTavern.POPUP_RESULT.AFFIRMATIVE) {
            try {
              isSwitching = true;
              const regexes = getTavernRegexes({ scope: 'character' });
              const targetRegexes = modes[modeKey].regexes;
              regexes.forEach(function(r) {
                if (allRegexes.indexOf(r.script_name) !== -1) {
                  r.enabled = targetRegexes.indexOf(r.script_name) !== -1;
                }
              });
              replaceTavernRegexes(regexes, { scope: 'character' }).then(function() {
                setTimeout(function() {
                  showGlassNotification('已切换至 ' + modes[modeKey].name, '点击任意处关闭');
                  updateButtons();
                  setTimeout(function() {
                    SillyTavern.reloadCurrentChat();
                  }, 1500);
                }, 500);
              });
            } catch (err) {
              toastr.error('切换失败: ' + err.message, '', { timeOut: 3000 });
              console.error('正则切换错误:', err);
            } finally {
              isSwitching = false;
            }
          } else {
            showGlassNotification('已取消切换', '');
          }
        });
      })(modeKey);
    });
  }
  eventOnButton(/^当前:/, function() {
    const current = getCurrentMode();
    const regexes = getTavernRegexes({ scope: 'character' });
    let msg = '当前模式: ' + modes[current].name + '\n\n';
    for (const [key, mode] of Object.entries(modes)) {
      msg += mode.name + '正则状态:\n';
      mode.regexes.forEach(function(name) {
        const r = regexes.find(function(r) { return r.script_name === name; });
        msg += '  ' + name + ': ' + (r && r.enabled ? '✅ 启用' : '❌ 禁用') + '\n';
      });
      msg += '\n';
    }
    alert(msg);
  });
  eventOn(tavern_events.CHAT_CHANGED, function() {
    if (!isSwitching) setTimeout(updateButtons, modes.delays ? modes.delays.updateButtons : 500);
  });
}

// ─── 启动 ──────────────────────────────────────────────────

$(function() {
  console.log('[一键切换插图正则] 脚本已加载');
  updateButtons();
  registerEvents();
  showGlassNotification('插图切换器已就绪', '点击 💻 或 📱 切换模式');
});

$(window).on('pagehide', function() {
  console.log('[一键切换插图正则] 脚本已卸载');
});

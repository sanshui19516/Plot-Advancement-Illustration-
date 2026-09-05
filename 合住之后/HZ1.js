(function() {
  console.log('✅ 纸媒介自动渲染脚本已启动');

  // 扫描并渲染（用你已验证过的逻辑）
  function scanAndRender() {
    const doc = window.parent.document;
    const blocks = doc.querySelectorAll('pre code');
    let found = false;

    blocks.forEach(block => {
      const match = block.className.match(/language-(Diary|Postcard|Sticky|Mirror)/);
      if (!match) return;
      const lang = match[1];

      const raw = block.textContent || '';
      if (!raw.trim()) return;

      let data;
      try { data = JSON.parse(raw); }
      catch(e) { return; }

      const 内容 = data.内容 || data.text || '';
      if (!内容) return;

      const pre = block.closest('pre');
      if (!pre) return;

      let html = '';
      const 署名 = data.署名 || data.from || '';

      if (lang === 'Diary') {
        const 日期 = data.日期 || '';
        html = `<div style="background:url('https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E4%BF%A1%E4%BB%B6.jpg') center/cover;padding:28px 30px;border-radius:6px;margin:8px 0;color:#3c3328;font-size:16px;line-height:2;white-space:pre-wrap;font-family:'KaiTi','楷体',serif;">
          <div style="font-size:12px;color:#8a7a6a;text-align:right;border-bottom:1px solid rgba(160,140,120,0.2);padding-bottom:8px;margin-bottom:12px;font-family:monospace;">📖 日记</div>
          ${日期 ? `<div style="font-size:12px;color:#8a7a6a;margin-bottom:8px;">${日期}</div>` : ''}
          ${内容.replace(/\n/g, '<br>')}
        </div>`;
      } else if (lang === 'Postcard') {
        html = `<div style="background:url('https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E6%98%8E%E4%BF%A1%E7%89%87.jpg') center/cover;padding:28px 30px;border-radius:6px;margin:8px 0;color:#3a3530;font-size:16px;line-height:2;white-space:pre-wrap;font-family:'KaiTi','楷体',serif;">
          <div style="font-size:11px;color:#7a6a5a;text-align:right;border-bottom:1px solid rgba(170,155,140,0.15);padding-bottom:8px;margin-bottom:12px;font-family:monospace;">🏷 明信片</div>
          ${内容.replace(/\n/g, '<br>')}
          ${署名 ? `<div style="text-align:right;margin-top:12px;font-size:12px;color:#7a6a5a;">—— ${署名}</div>` : ''}
        </div>`;
      } else if (lang === 'Sticky') {
        html = `<div style="background:url('https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E5%86%B0%E7%AE%B1%E8%B4%B4.jpg') center/cover;padding:18px 22px;border-radius:4px;min-height:60px;max-width:280px;margin:8px auto;color:#3a3530;font-size:14px;line-height:1.8;white-space:pre-wrap;font-family:'KaiTi','楷体',serif;position:relative;">
          <div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);font-size:16px;">🧲</div>
          ${内容.replace(/\n/g, '<br>')}
        </div>`;
      } else if (lang === 'Mirror') {
        html = `<div style="background:url('https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E6%B5%B4%E5%AE%A4%E9%95%9C%E5%AD%90.jpg') center/cover;padding:28px 30px;border-radius:10px;margin:8px 0;color:rgba(255,255,255,0.80);font-size:28px;line-height:1.6;text-align:center;letter-spacing:8px;font-family:'KaiTi','楷体',serif;">
          <div style="font-size:10px;color:rgba(255,255,255,0.15);text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:8px;margin-bottom:12px;font-family:monospace;">⏱ 镜面</div>
          ${内容.replace(/\n/g, '<br>')}
        </div>`;
      }

      if (html) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        pre.parentNode.replaceChild(wrapper.firstElementChild, pre);
        found = true;
        console.log('✅ 纸媒介渲染完成:', lang);
      }
    });

    return found;
  }

  // 暴露给全局（方便手动测试）
  window.纸媒扫描 = scanAndRender;

  // 首次启动：延迟1秒后开始扫描
  setTimeout(() => {
    scanAndRender();
  }, 1000);

  // 持续扫描：每2秒扫描一次，持续30秒
  let count = 0;
  const maxAttempts = 15;
  const timer = setInterval(() => {
    count++;
    const found = scanAndRender();
    if (found || count >= maxAttempts) {
      clearInterval(timer);
      if (found) console.log('✅ 渲染成功，停止轮询');
      else console.log('⏱ 轮询结束');
    }
  }, 2000);

  console.log('✅ 纸媒介渲染脚本已启动（轮询模式）');
})();
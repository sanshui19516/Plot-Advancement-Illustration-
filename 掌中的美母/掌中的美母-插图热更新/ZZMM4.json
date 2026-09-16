// ============================================================
// 【掌中的美母】远程正则加载器
// 功能：从 CDN 拉取 JSON，自动注入/更新到局部正则
// 远程链接：https://cdn.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E6%8E%8C%E4%B8%AD%E7%9A%84%E7%BE%8E%E6%AF%8D/ZZMM.json
// 作用域：character（局部，绑定当前角色卡）
// ============================================================

(function() {
    'use strict';

    // ============================================================
    // ★ 配置区
    // ============================================================
    var REMOTE_JSON_URL = 'https://cdn.jsdelivr.net/gh/sanshui19516/Hot-Update-World-Book-Illustrations@main/%E6%8E%8C%E4%B8%AD%E7%9A%84%E7%BE%8E%E6%AF%8D/ZZMM.json';
    var SCOPE = 'character';   // 'character' = 局部，'global' = 全局
    var STORY_NAME = '掌中的美母';

    // ============================================================
    // 工具函数
    // ============================================================
    function log(msg) {
        console.log('[' + STORY_NAME + '·正则加载器] ' + msg);
    }

    function genUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function sleep(ms) {
        return new Promise(function(r) { setTimeout(r, ms); });
    }

    // ============================================================
    // ★ 核心：导出格式 → 内部格式
    // ============================================================
    function convertToInternal(src) {
        var internal = {
            id: src.id || genUUID(),
            script_name: src.scriptName || src.script_name || '',
            enabled: !(src.disabled === true),   // disabled 反转
            find_regex: src.findRegex || src.find_regex || '',
            trim_strings: src.trimStrings || src.trim_strings || [],
            replace_string: src.replaceString || src.replace_string || '',
            source: {
                user_input: false,
                ai_output: false,
                slash_command: false,
                world_info: false
            },
            destination: {
                display: false,
                prompt: false
            },
            run_on_edit: src.runOnEdit === true || src.run_on_edit === true,
            min_depth: (src.minDepth !== undefined) ? src.minDepth : (src.min_depth !== undefined ? src.min_depth : null),
            max_depth: (src.maxDepth !== undefined) ? src.maxDepth : (src.max_depth !== undefined ? src.max_depth : null),
            scope: SCOPE
        };

        // placement → source
        var p = src.placement;
        if (Array.isArray(p)) {
            if (p.indexOf(1) !== -1) internal.source.user_input = true;
            if (p.indexOf(2) !== -1) internal.source.ai_output = true;
            if (p.indexOf(3) !== -1) internal.source.slash_command = true;
            if (p.indexOf(4) !== -1) internal.source.world_info = true;
        }

        // markdownOnly / promptOnly → destination
        if (src.markdownOnly === true) internal.destination.display = true;
        if (src.promptOnly === true) internal.destination.prompt = true;
        if (src.markdownOnly === undefined && src.promptOnly === undefined) {
            internal.destination.display = true;
        }

        return internal;
    }

    // ============================================================
    // ★ 核心：拉取并注入
    // ============================================================
    async function loadRemoteRegexes() {
        try {
            log('═══════════════════════════════════');
            log('开始拉取远程正则...');

            var resp = await fetch(REMOTE_JSON_URL + '?t=' + Date.now());
            if (!resp.ok) throw new Error('HTTP ' + resp.status);

            var remoteList = await resp.json();
            if (!Array.isArray(remoteList)) {
                log('⚠️ 远程 JSON 不是数组格式');
                return;
            }
            log('远程共 ' + remoteList.length + ' 条');

            // 格式转换
            var converted = [];
            for (var c = 0; c < remoteList.length; c++) {
                var item = convertToInternal(remoteList[c]);
                converted.push(item);
                log('🔧 转换: "' + item.script_name + '"');
                log('   enabled: ' + item.enabled + ' | source: ' + JSON.stringify(item.source));
            }

            // 读出当前
            var currentList = getTavernRegexes({ scope: SCOPE }) || [];
            log('本地当前共 ' + currentList.length + ' 条');

            var added = [];
            var updated = [];

            for (var i = 0; i < converted.length; i++) {
                var remote = converted[i];
                var rname = remote.script_name;

                var exists = null;
                for (var j = 0; j < currentList.length; j++) {
                    if ((currentList[j].script_name || '') === rname) {
                        exists = currentList[j];
                        break;
                    }
                }

                if (exists) {
                    var keepId = exists.id;
                    for (var k in remote) exists[k] = remote[k];
                    exists.id = keepId;
                    updated.push(rname);
                    log('🔄 更新: ' + rname);
                } else {
                    currentList.push(remote);
                    added.push(rname);
                    log('➕ 新增: ' + rname);
                }
            }

            log('准备写入 ' + currentList.length + ' 条...');
            await replaceTavernRegexes(currentList, { scope: SCOPE });
            log('✅ 写入完成');

            try {
                if (typeof TavernHelper !== 'undefined' &&
                    TavernHelper.builtin &&
                    TavernHelper.builtin.saveSettings) {
                    await TavernHelper.builtin.saveSettings();
                    log('✅ 设置已保存');
                }
            } catch (e) {}

            await sleep(800);
            var verify = getTavernRegexes({ scope: SCOPE }) || [];
            log('📊 验证：写入后共 ' + verify.length + ' 条');

            if (typeof toastr !== 'undefined') {
                toastr.success(
                    '✅ 远程正则加载完成：新增 ' + added.length + ' 条，更新 ' + updated.length + ' 条',
                    '',
                    { timeOut: 3000 }
                );
            }

        } catch (e) {
            log('❌ 失败: ' + e.message);
            console.error(e);
            if (typeof toastr !== 'undefined') {
                toastr.error('❌ 远程正则加载失败: ' + e.message, '', { timeOut: 4000 });
            }
        }
    }

    // ============================================================
    // 等 API 就绪后执行
    // ============================================================
    function init() {
        if (typeof getTavernRegexes !== 'function') {
            log('API 未就绪，1 秒后重试...');
            setTimeout(init, 1000);
            return;
        }
        setTimeout(loadRemoteRegexes, 800);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(init, 1000);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 1000);
        });
    }

    // 手动重载入口
    window.reloadZZMMRegexes = loadRemoteRegexes;

    log('✅ 脚本已加载，准备拉取远程正则');

})();

// ============================================================
// 剧情推进 · 自动触发脚本
// 监听消息，自动添加 【剧情推进】 标记
// 适配角色卡：与继母的丝袜与日常
// ============================================================

async function onMessageReceived(message_id) {
    console.log('[剧情推进] 收到新消息，ID:', message_id);

    try {
        const lastMessages = getChatMessages(-1);
        if (!lastMessages || lastMessages.length === 0) {
            console.warn('[剧情推进] 未获取到消息');
            return;
        }

        const lastMessage = lastMessages[0];
        if (!lastMessage || !lastMessage.message) return;

        // 检查是否已包含触发标记
        if (lastMessage.message.includes('【剧情推进】')) {
            console.log('[剧情推进] 消息已包含触发标记，跳过');
            return;
        }

        // 检查是否包含 step_data（说明是剧情推进执行的结果）
        if (lastMessage.message.includes('step_data')) {
            console.log('[剧情推进] 检测到 step_data，添加触发标记');
            const updatedMessage = lastMessage.message + '\n\n【剧情推进】';
            await setChatMessages([
                { message_id: lastMessage.message_id, message: updatedMessage }
            ]);
            console.log('[剧情推进] ✅ 已添加触发标记');
            return;
        }

        // 检查是否包含美咲或{{user}}的关键对话（可选触发，默认注释）
        // if (lastMessage.message.includes('美咲') || lastMessage.message.includes('继母')) {
        //     console.log('[剧情推进] 检测到关键对话，添加触发标记');
        //     const updatedMessage = lastMessage.message + '\n\n【剧情推进】';
        //     await setChatMessages([
        //         { message_id: lastMessage.message_id, message: updatedMessage }
        //     ]);
        // }

    } catch (error) {
        console.error('[剧情推进] 处理消息出错:', error);
    }
}

$(document).ready(function () {
    console.log('[剧情推进] 脚本已加载，监听 message_received 事件');
    eventOn(tavern_events.MESSAGE_RECEIVED, onMessageReceived);
});
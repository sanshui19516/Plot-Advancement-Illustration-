// ============================================================
// 秋季转校生 · 枫叶地图（性能优化 + 手机适配 + 悬浮人物修复）
// ============================================================

(async () => {
    'use strict';

    console.log('[枫叶地图] 脚本开始加载...');

    await waitGlobalInitialized('Mvu');

    const isMobile = window.innerWidth < 640;

    const ALL_SCENES = [
        '公寓客厅', '卧室', '书房', '被炉', '公寓厨房', '公寓阳台', '公寓走廊/电梯',
        '教室', '学校图书馆', '学校食堂', '学校走廊', '校园小道', '自行车棚', '鞋柜前',
        '咖啡厅', '家庭餐馆', '超市', '街角便利店', '自动贩卖机前', '公交站',
        '海边', '小公园', '回家路上', '天台', '深夜街道', '公园长椅', '樱花小路'
    ];

    const GRID_DATA = {
        '0,0': '自行车棚', '0,1': '校园小道', '0,2': '教室', '0,3': '学校走廊', '0,4': '鞋柜前',
        '1,0': '学校食堂', '1,1': '学校图书馆', '1,2': '天台', '1,3': '咖啡厅', '1,4': '家庭餐馆',
        '2,0': '公园长椅', '2,1': '小公园', '2,2': '公寓客厅', '2,3': '被炉', '2,4': '公寓厨房',
        '3,0': '回家路上', '3,1': '樱花小路', '3,2': '公寓阳台', '3,3': '卧室', '3,4': '书房',
        '4,0': '深夜街道', '4,1': '公交站', '4,2': '超市', '4,3': '海边', '4,4': '街角便利店',
    };

    const FLOATING_NODES = [
        { id: '自动贩卖机前', row: -0.5, col: 4.5 },
        { id: '公园长椅', row: 4.5, col: -0.5 },
    ];

    function getNodePos(row, col) {
        const spacing = isMobile ? 70 : 100;
        const offsetX = isMobile ? 40 : 60;
        const offsetY = isMobile ? 35 : 50;
        return { x: offsetX + col * spacing, y: offsetY + row * spacing };
    }

    const SCENE_DETAILS = {
        '公寓客厅': { desc: '城市东侧住宅区的温馨两居室。深灰色的布艺沙发是两个人经常窝着聊天的地方，茶几上总是放着几本摊开的课本和一支笔。台灯的光线柔软而温暖，在深色的桌面上晕开一片暖黄色的光晕。' },
        '卧室': { desc: '小小的卧室，一张单人床靠墙放着，床单是浅色带细碎花纹的那种。枕头旁边放着一本读到一半的书。' },
        '书房': { desc: '书房是整间公寓里最安静的地方。深色的书桌上堆着几本参考书和写了一半的草稿纸，台灯的角度总是偏着她那一侧。' },
        '被炉': { desc: '冬天的时候，被炉是家里最暖和的地方。桌面不大，刚好够放下两杯热茶、一叠作业本和几支笔。棉被下的腿偶尔会碰到一起。' },
        '公寓厨房': { desc: '厨房不大，灶台和操作台之间的距离只够两个人侧身通过。窗户朝东，早晨的阳光会斜斜地照进来。' },
        '公寓阳台': { desc: '阳台不大，两把藤编椅占了大半空间，中间放着一张小小的矮桌。能看到远处整座城市的轮廓。' },
        '公寓走廊/电梯': { desc: '公寓楼的走廊不算宽，铺着浅灰色的瓷砖。电梯老旧的按键面板上能看到细密的划痕。' },
        '教室': { desc: '午后的阳光从南侧的窗户斜斜地照进来，在木质地板上拉出长长的光影。课桌排列成整齐的六行，空气里漂浮着细小的尘埃。' },
        '学校图书馆': { desc: '图书馆在二楼走廊的尽头，门是厚实的木门。书架排成整齐的行列，从地板延伸到天花板。' },
        '学校食堂': { desc: '食堂在一楼，靠南的那一侧有一排落地窗，午间的阳光会把整片餐桌都照得明亮。' },
        '学校走廊': { desc: '走廊很长，两旁的窗户让光在午后就变成倾斜的。墙壁上贴着几张旧海报，脚步声在地砖上回响。' },
        '校园小道': { desc: '连接教学楼和校门的那条路两侧种满了银杏树。秋天的时候叶子变成一片均匀的金黄色。' },
        '自行车棚': { desc: '自行车棚在教学楼侧面，铁皮顶棚在秋天泛着一层薄薄的凉意。自行车排列得还算整齐。' },
        '鞋柜前': { desc: '教学楼一楼的玄关处，两排深色的木质鞋柜沿着走廊两侧排列。放学的时候这里总是最热闹的地方。' },
        '咖啡厅': { desc: '藏在一栋老楼街角的咖啡厅。下午的时候阳光会透过落地玻璃窗斜斜地照进来，在木桌面上拉出一片温暖的光斑。' },
        '家庭餐馆': { desc: '街角的家庭餐馆开了有些年头了。门口的招牌被晒得有些褪色，但里面的暖黄色灯光依旧让人安心。' },
        '超市': { desc: '公寓附近的超市不算大，灯光是明亮的白色。空气中混杂着蔬菜的湿润气息和面包房的甜香。' },
        '街角便利店': { desc: '公寓楼下的便利店不大，亮着白色的灯。她有时候会来买一瓶茶或一杯冰淇淋。' },
        '自动贩卖机前': { desc: '自动贩卖机在路边亮着白色的光。她站在贩卖机前，看着里面排列整齐的瓶装饮料。' },
        '公交站': { desc: '公交站台不大，候车的长椅是铁的，坐上去有一种凉意。她站在站台的边缘，看着公交车来的方向。' },
        '海边': { desc: '海离城市有一个小时的车程。沙滩不算细，但踩上去是柔软的。夕阳把整片海面染成橙红色，浪尖上的光像碎掉的琉璃。' },
        '小公园': { desc: '小公园藏在两栋居民楼之间。几棵半旧的榕树、一条绕过草坪的石板小径、一张被阳光晒得有些褪色的长椅。' },
        '回家路上': { desc: '从学校到公寓的那条路不算长，沿路种着银杏树。秋天的时候叶子铺满人行道，踩上去会有细碎的声响。' },
        '天台': { desc: '天台不大，地面铺着老旧的防水层。能看到远处整座城市的轮廓，居民区的窗户一格一格地亮着暖黄色的灯。' },
        '深夜街道': { desc: '深夜的街道，路灯把行道树的影子拉得很长。偶尔有一辆出租车从远处驶过，车灯扫过路面又消失。' },
        '公园长椅': { desc: '公园深处的那张长椅被一棵老树遮住了一半的阳光。椅子的木条被晒得有些发白，坐上去的时候有一种温热的触感。' },
        '樱花小路': { desc: '公寓楼下那条种满樱花树的小路，在春天的某个时刻被染成浅粉色。花瓣从枝头飘落的时候是极慢的。' },
    };

    const SCENE_IMAGES = {
        '书房': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E4%B9%A6%E6%88%BF.jpg',
        '公交站': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%85%AC%E4%BA%A4%E7%AB%99.jpg',
        '公园长椅': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%85%AC%E5%9B%AD%E9%95%BF%E6%A4%85.jpg',
        '公寓厨房': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%85%AC%E5%AF%93%E5%8E%A8%E6%88%BF.jpg',
        '公寓客厅': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%85%AC%E5%AF%93%E5%AE%A2%E5%8E%85.jpg',
        '公寓走廊/电梯': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%85%AC%E5%AF%93%E8%B5%B0%E5%BB%8A.jpg',
        '公寓阳台': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%85%AC%E5%AF%93%E9%98%B3%E5%8F%B0.jpg',
        '卧室': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%8D%A7%E5%AE%A4.jpg',
        '咖啡厅': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%92%96%E5%95%A1%E5%8E%85.jpg',
        '回家路上': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%9B%9E%E5%AE%B6%E8%B7%AF%E4%B8%8A.jpg',
        '天台': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%A4%A9%E5%8F%B0.jpg',
        '学校图书馆': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%AD%A6%E6%A0%A1%E5%9B%BE%E4%B9%A6%E9%A6%86.jpg',
        '学校走廊': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%AD%A6%E6%A0%A1%E8%B5%B0%E5%BB%8A.jpg',
        '学校食堂': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%AD%A6%E6%A0%A1%E9%A3%9F%E5%A0%82.jpg',
        '家庭餐馆': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%AE%B6%E5%BA%AD%E9%A4%90%E9%A6%86.jpg',
        '小公园': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%B0%8F%E5%85%AC%E5%9B%AD.jpg',
        '教室': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E6%95%99%E5%AE%A4.jpg',
        '校园小道': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E6%A0%A1%E5%9B%AD%E5%B0%8F%E9%81%93.jpg',
        '樱花小路': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E6%A8%B1%E8%8A%B1%E5%B0%8F%E8%B7%AF.jpg',
        '海边': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E6%B5%B7%E8%BE%B9.jpg',
        '深夜街道': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E6%B7%B1%E5%A4%9C%E8%A1%97%E9%81%93.jpg',
        '自动贩卖机前': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E8%87%AA%E5%8A%A8%E8%B4%A9%E5%8D%96%E6%9C%BA%E5%89%8D.jpg',
        '自行车棚': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E8%87%AA%E8%A1%8C%E8%BD%A6%E6%A3%9A.jpg',
        '街角便利店': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E8%A1%97%E8%A7%92%E4%BE%BF%E5%88%A9%E5%BA%97.jpg',
        '被炉': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E8%A2%AB%E7%82%89.jpg',
        '超市': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E8%B6%85%E5%B8%82.jpg',
        '鞋柜前': 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E9%9E%8B%E6%9F%9C%E5%89%8D.jpg',
    };

    function getConnections() {
        const conns = [];
        const gridMap = {};
        for (const [key, val] of Object.entries(GRID_DATA)) {
            gridMap[val] = key.split(',').map(Number);
        }

        const resEdges = [
            ['公寓客厅', '被炉'], ['公寓客厅', '公寓厨房'], ['公寓客厅', '公寓阳台'],
            ['公寓客厅', '卧室'], ['卧室', '书房'], ['公寓厨房', '公寓阳台'],
            ['公寓走廊/电梯', '公寓客厅']
        ];
        resEdges.forEach(([a, b]) => { if (gridMap[a] && gridMap[b]) conns.push([a, b]); });

        const schEdges = [
            ['教室', '学校走廊'], ['教室', '校园小道'], ['教室', '学校图书馆'],
            ['学校图书馆', '学校食堂'], ['学校走廊', '鞋柜前'], ['校园小道', '自行车棚']
        ];
        schEdges.forEach(([a, b]) => { if (gridMap[a] && gridMap[b]) conns.push([a, b]); });

        const comEdges = [
            ['咖啡厅', '家庭餐馆'], ['咖啡厅', '超市'],
            ['超市', '街角便利店'], ['街角便利店', '自动贩卖机前'],
            ['公交站', '超市']
        ];
        comEdges.forEach(([a, b]) => { if (gridMap[a] && gridMap[b]) conns.push([a, b]); });

        const outEdges = [
            ['海边', '小公园'], ['海边', '回家路上'],
            ['小公园', '回家路上'], ['回家路上', '天台'],
            ['回家路上', '公园长椅'], ['天台', '深夜街道'],
            ['深夜街道', '公园长椅'], ['樱花小路', '小公园']
        ];
        outEdges.forEach(([a, b]) => { if (gridMap[a] && gridMap[b]) conns.push([a, b]); });

        const crossEdges = [
            ['公寓客厅', '回家路上'], ['公寓客厅', '小公园'],
            ['公寓厨房', '超市'], ['教室', '校园小道'],
            ['咖啡厅', '学校图书馆'], ['海边', '深夜街道']
        ];
        crossEdges.forEach(([a, b]) => { if (gridMap[a] && gridMap[b]) conns.push([a, b]); });

        return conns;
    }

    let currentScene = '公寓客厅';
    let isMounted = false;
    let panelElement = null;
    let pagesWrapper = null;
    let pageL1 = null;
    let pageZ1 = null;
    let pageZ2 = null;
    let currentPage = 0;
    let renderPending = false;

    function fetchCurrentScene() {
        try {
            const allVars = typeof getAllVariables === 'function' ? getAllVariables() : {};
            const data = allVars.stat_data || {};
            const scene = data.世界?.当前场景;
            if (scene && ALL_SCENES.includes(scene)) {
                currentScene = scene;
                if (typeof window.__updateMapLocation === 'function') {
                    window.__updateMapLocation(scene);
                }
            }
        } catch (_) {}
    }

    function showToast(msg) {
        try {
            if (typeof toastr !== 'undefined') toastr.success(msg, '', { timeOut: 2000 });
        } catch (_) {}
        console.log('[枫叶地图] ' + msg);
    }

    function getTopDoc() {
        try {
            if (window.parent && window.parent.document) return window.parent.document;
        } catch (_) {}
            return document;
    }

    function scheduleRender(fn) {
        if (renderPending) return;
        renderPending = true;
        requestAnimationFrame(() => {
            renderPending = false;
            fn();
        });
    }

    function openDetail(sceneName) {
        const topDoc = getTopDoc();
        let detailOverlay = topDoc.getElementById('mapDetailOverlay');
        if (!detailOverlay) {
            detailOverlay = topDoc.createElement('div');
            detailOverlay.id = 'mapDetailOverlay';
            detailOverlay.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 999999;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                font-family: "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;
            `;
            detailOverlay.innerHTML = `
                <div style="
                    max-width: 480px;
                    width: 90vw;
                    max-height: 80vh;
                    background: hsla(30,20%,12%,0.95);
                    backdrop-filter: blur(32px);
                    -webkit-backdrop-filter: blur(32px);
                    border-radius: 24px;
                    border: 1px solid hsla(25,60%,45%,0.12);
                    box-shadow: 0 32px 80px rgba(0,0,0,0.7);
                    padding: 24px 24px 20px;
                    transform: scale(0.95) translateY(12px);
                    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease;
                    opacity: 0;
                    overflow-y: auto;
                    position: relative;
                " id="detailCard">
                    <button style="
                        position: absolute;
                        top: 12px;
                        right: 12px;
                        width: 32px;
                        height: 32px;
                        border: none;
                        background: hsla(0,0%,100%,0.04);
                        border-radius: 50%;
                        color: hsla(30,20%,50%,0.4);
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        z-index: 10;
                    " id="detailCloseBtn">✕</button>
                    <div id="detailContent"></div>
                </div>
            `;
            topDoc.body.appendChild(detailOverlay);

            detailOverlay.addEventListener('click', function(e) {
                if (e.target === this) closeDetail();
            });
            const closeBtn = detailOverlay.querySelector('#detailCloseBtn');
            if (closeBtn) closeBtn.addEventListener('click', closeDetail);
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') closeDetail();
            });
        }

        const content = detailOverlay.querySelector('#detailContent');
        const detail = SCENE_DETAILS[sceneName] || { desc: '暂无描述' };
        const img = SCENE_IMAGES[sceneName] || '';

        content.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:14px;">
                ${img ? `<div style="width:100%;height:180px;border-radius:16px;overflow:hidden;background:hsla(0,0%,0%,0.2);border:1px solid hsla(0,0%,100%,0.04);flex-shrink:0;">
                    <img src="${img}" alt="${sceneName}" style="width:100%;height:100%;object-fit:cover;display:block;" />
                </div>` : ''}
                <div style="font-size:22px;font-weight:700;color:hsl(25,70%,60%);font-family:'ZSFT-ga','Georgia',serif;letter-spacing:2px;">${sceneName}</div>
                <div style="font-size:13px;line-height:1.8;color:hsla(0,0%,100%,0.75);">${detail.desc}</div>
                <button style="width:100%;padding:10px 20px;border:1px solid hsla(0,0%,100%,0.06);border-radius:12px;background:transparent;color:hsla(0,0%,100%,0.4);font-weight:500;font-size:14px;cursor:pointer;transition:all 0.3s ease;font-family:inherit;margin-top:4px;" id="detailCloseBtn2">关闭</button>
            </div>
        `;

        detailOverlay.style.opacity = '1';
        detailOverlay.style.pointerEvents = 'auto';
        const card = detailOverlay.querySelector('#detailCard');
        if (card) {
            card.style.transform = 'scale(1) translateY(0)';
            card.style.opacity = '1';
        }

        const closeBtn2 = detailOverlay.querySelector('#detailCloseBtn2');
        if (closeBtn2) closeBtn2.addEventListener('click', closeDetail);
    }

    function closeDetail() {
        const topDoc = getTopDoc();
        const overlay = topDoc.getElementById('mapDetailOverlay');
        if (!overlay) return;
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        const card = overlay.querySelector('#detailCard');
        if (card) {
            card.style.transform = 'scale(0.95) translateY(12px)';
            card.style.opacity = '0';
        }
    }

    function renderL1() {
        if (!pageL1) return;
        const img = SCENE_IMAGES[currentScene] || '';
        const detail = SCENE_DETAILS[currentScene] || { desc: '暂无描述' };

        const imgHeight = isMobile ? '160px' : '240px';
        const titleSize = isMobile ? '18px' : '20px';

        pageL1.innerHTML = `
            <div style="display:flex;flex-direction:column;height:100%;padding:2px 2px 4px;gap:6px;">
                <div style="
                    height:${imgHeight};
                    border-radius:14px;
                    overflow:hidden;
                    background:hsla(0,0%,0%,0.2);
                    border:1px solid hsla(0,0%,100%,0.04);
                    position:relative;
                    flex-shrink:0;
                ">
                    ${img ? `<img src="${img}" alt="${currentScene}" style="width:100%;height:100%;object-fit:cover;display:block;" />` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:hsla(0,0%,100%,0.06);font-size:14px;">暂无图片</div>'}
                </div>
                <div style="display:flex;flex-direction:column;gap:2px;padding:0 2px;">
                    <div style="font-size:${titleSize};font-weight:700;color:hsl(25,70%,60%);font-family:'ZSFT-ga','Georgia',serif;letter-spacing:1px;">${currentScene}</div>
                    <div style="font-size:${isMobile ? '11px' : '12px'};line-height:1.5;color:hsla(0,0%,100%,0.55);max-height:${isMobile ? '40px' : '52px'};overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${detail.desc}</div>
                </div>
            </div>
        `;
        if (typeof window.__updateMapLocation === 'function') {
            window.__updateMapLocation(currentScene);
        }
    }

    function renderZ1() {
        if (!pageZ1) return;

        const conns = getConnections();
        const posMap = {};
        const spacing = isMobile ? 70 : 100;
        const offsetX = isMobile ? 40 : 60;
        const offsetY = isMobile ? 35 : 50;
        const nodeSize = isMobile ? 32 : 48;
        const imgSize = isMobile ? 24 : 36;

        for (const [key, name] of Object.entries(GRID_DATA)) {
            const [r, c] = key.split(',').map(Number);
            posMap[name] = { x: offsetX + c * spacing, y: offsetY + r * spacing };
        }

        let svgPaths = '';
        for (const [a, b] of conns) {
            if (posMap[a] && posMap[b]) {
                const p1 = posMap[a];
                const p2 = posMap[b];
                const isCurrentA = (a === currentScene);
                const isCurrentB = (b === currentScene);
                const strokeColor = (isCurrentA || isCurrentB) ? 'hsla(25,70%,55%,0.4)' : 'hsla(30,20%,40%,0.15)';
                const strokeWidth = (isCurrentA || isCurrentB) ? '2' : '1.5';
                svgPaths += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" opacity="${(isCurrentA || isCurrentB) ? '0.5' : '0.2'}"/>`;
            }
        }

        let gridHtml = '';
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                const key = r + ',' + c;
                const name = GRID_DATA[key] || '';
                const pos = { x: offsetX + c * spacing, y: offsetY + r * spacing };
                const isCurrent = (name === currentScene);
                const hasImage = SCENE_IMAGES[name] || false;

                if (name) {
                    const half = nodeSize / 2;
                    gridHtml += `
                        <div style="
                            position: absolute;
                            left: ${pos.x - half}px;
                            top: ${pos.y - half}px;
                            width: ${nodeSize}px;
                            height: ${nodeSize}px;
                            border-radius: 50%;
                            background: ${isCurrent ? 'hsla(25,70%,55%,0.15)' : 'hsla(0,0%,100%,0.03)'};
                            border: 2px solid ${isCurrent ? 'hsl(25,70%,55%)' : 'hsla(0,0%,100%,0.06)'};
                            box-shadow: ${isCurrent ? '0 0 20px hsla(25,70%,50%,0.12)' : 'none'};
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;
                            transition: all 0.25s ease;
                            z-index: ${isCurrent ? '5' : '2'};
                            ${isCurrent ? 'transform: scale(1.06);' : ''}
                        " data-scene="${name}" class="map-node-dot">
                            ${hasImage ? `<img src="${SCENE_IMAGES[name]}" style="width:${imgSize}px;height:${imgSize}px;border-radius:50%;object-fit:cover;opacity:${isCurrent ? '1' : '0.5'};" />` : `<span style="font-size:${isMobile ? '5px' : '6px'};color:hsla(0,0%,100%,0.2);">${name.slice(0, 2)}</span>`}
                            ${isCurrent ? `<div style="position:absolute;inset:-3px;border-radius:50%;border:1px solid hsla(25,70%,50%,0.15);animation:pulseRing 2s ease-in-out infinite;"></div>` : ''}
                        </div>
                    `;
                }
            }
        }

        const floatSize = isMobile ? 30 : 40;
        const floatImgSize = isMobile ? 22 : 30;
        const floatNodesHtml = FLOATING_NODES.map(node => {
            const pos = { x: offsetX + node.col * spacing, y: offsetY + node.row * spacing };
            const isCurrent = (node.id === currentScene);
            const hasImage = SCENE_IMAGES[node.id] || false;
            const half = floatSize / 2;
            return `
                <div style="
                    position: absolute;
                    left: ${pos.x - half}px;
                    top: ${pos.y - half}px;
                    width: ${floatSize}px;
                    height: ${floatSize}px;
                    border-radius: 50%;
                    background: ${isCurrent ? 'hsla(25,70%,55%,0.12)' : 'hsla(0,0%,100%,0.02)'};
                    border: 2px dashed ${isCurrent ? 'hsl(25,70%,55%)' : 'hsla(0,0%,100%,0.04)'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    z-index: ${isCurrent ? '4' : '1'};
                    ${isCurrent ? 'transform: scale(1.06);' : ''}
                " data-scene="${node.id}" class="map-node-dot">
                    ${hasImage ? `<img src="${SCENE_IMAGES[node.id]}" style="width:${floatImgSize}px;height:${floatImgSize}px;border-radius:50%;object-fit:cover;opacity:${isCurrent ? '1' : '0.4'};" />` : `<span style="font-size:${isMobile ? '5px' : '6px'};color:hsla(0,0%,100%,0.15);">${node.id.slice(0, 2)}</span>`}
                </div>
            `;
        }).join('');

        const canvasWidth = offsetX + 5 * spacing + 40;
        const canvasHeight = offsetY + 5 * spacing + 40;

        pageZ1.innerHTML = `
            <div style="position:relative;width:100%;height:100%;min-height:${isMobile ? '280px' : '360px'};padding:2px 2px 4px;">
                <div style="position:relative;width:100%;height:100%;min-height:${isMobile ? '260px' : '340px'};background:hsla(0,0%,0%,0.12);border-radius:14px;border:1px solid hsla(0,0%,100%,0.04);overflow:auto;padding:4px;">
                    <div style="position:relative;width:${canvasWidth}px;height:${canvasHeight}px;margin:0 auto;">
                        <svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;">
                            ${svgPaths}
                            ${(() => {
                                const curPos = posMap[currentScene];
                                if (curPos) {
                                    return `<circle cx="${curPos.x}" cy="${curPos.y}" r="${isMobile ? '20' : '30'}" fill="hsla(25,70%,50%,0.04)" pointer-events="none"/>`;
                                }
                                return '';
                            })()}
                        </svg>
                        <div style="position:relative;width:100%;height:100%;z-index:2;">
                            ${gridHtml}
                            ${floatNodesHtml}
                        </div>
                    </div>
                    <div style="position:absolute;bottom:4px;right:8px;z-index:3;display:flex;gap:8px;font-size:${isMobile ? '7px' : '9px'};color:hsla(0,0%,100%,0.15);background:hsla(0,0%,0%,0.2);padding:2px 10px;border-radius:6px;">
                        <span>● 当前位置</span>
                        <span style="color:hsla(0,0%,100%,0.06);">|</span>
                        <span style="color:hsla(0,0%,100%,0.10);">点击查看详情</span>
                    </div>
                </div>
                <style>
                    @keyframes pulseRing {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.3); }
                    }
                    .map-node-dot:hover {
                        transform: scale(1.10) !important;
                        border-color: hsla(25,70%,55%,0.3) !important;
                        z-index: 10 !important;
                    }
                </style>
            </div>
        `;

        pageZ1.querySelectorAll('.map-node-dot').forEach(el => {
            el.addEventListener('click', function() {
                const scene = this.dataset.scene;
                if (scene) openDetail(scene);
            });
        });

        if (typeof window.__updateMapLocation === 'function') {
            window.__updateMapLocation(currentScene);
        }
    }

    function renderZ2() {
        if (!pageZ2) return;

        const regionIcons = {
            residence: `<svg viewBox="0 0 24 24" style="width:${isMobile ? '14px' : '18px'};height:${isMobile ? '14px' : '18px'};stroke:hsl(25,60%,45%);fill:none;stroke-width:1.8;"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3"/><path d="M16 21h3a1 1 0 001-1V10"/><rect x="9" y="15" width="6" height="6" rx="1"/></svg>`,
            school: `<svg viewBox="0 0 24 24" style="width:${isMobile ? '14px' : '18px'};height:${isMobile ? '14px' : '18px'};stroke:hsl(220,40%,55%);fill:none;stroke-width:1.8;"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
            commercial: `<svg viewBox="0 0 24 24" style="width:${isMobile ? '14px' : '18px'};height:${isMobile ? '14px' : '18px'};stroke:hsl(40,70%,55%);fill:none;stroke-width:1.8;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>`,
            outdoor: `<svg viewBox="0 0 24 24" style="width:${isMobile ? '14px' : '18px'};height:${isMobile ? '14px' : '18px'};stroke:hsl(160,30%,50%);fill:none;stroke-width:1.8;"><path d="M3 15.5c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3"/><path d="M3 11.5c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3"/><path d="M3 19.5c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3"/></svg>`
        };

        const regionData = {
            residence: {
                label: '住宅区',
                scenes: ['公寓客厅', '卧室', '书房', '被炉', '公寓厨房', '公寓阳台', '公寓走廊/电梯']
            },
            school: {
                label: '学校区',
                scenes: ['教室', '学校图书馆', '学校食堂', '学校走廊', '校园小道', '自行车棚', '鞋柜前']
            },
            commercial: {
                label: '商业街道',
                scenes: ['咖啡厅', '家庭餐馆', '超市', '街角便利店', '自动贩卖机前', '公交站']
            },
            outdoor: {
                label: '海滨户外',
                scenes: ['海边', '小公园', '回家路上', '天台', '深夜街道', '公园长椅', '樱花小路']
            }
        };

        const accentColors = {
            residence: 'hsl(25,70%,55%)',
            school: 'hsl(220,40%,55%)',
            commercial: 'hsl(40,70%,55%)',
            outdoor: 'hsl(160,30%,50%)'
        };

        let html = '';

        for (const [regionKey, region] of Object.entries(regionData)) {
            const scenes = region.scenes;
            const accent = accentColors[regionKey] || 'hsl(25,70%,55%)';
            const padding = isMobile ? '10px 10px 8px' : '14px 14px 12px';
            const labelSize = isMobile ? '10px' : '11px';

            html += `<div style="background:hsla(30,20%,15%,0.4);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:${isMobile ? '14px' : '18px'};padding:${padding};border:1px solid hsla(25,60%,45%,0.05);transition:all 0.4s ease;position:relative;overflow:hidden;min-height:${isMobile ? '80px' : '120px'};">`;
            html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:${isMobile ? '6px' : '10px'};padding-bottom:${isMobile ? '4px' : '6px'};border-bottom:1px solid hsla(25,60%,45%,0.04);">`;
            html += `<span style="width:${isMobile ? '18px' : '22px'};height:${isMobile ? '18px' : '22px'};flex-shrink:0;display:flex;align-items:center;justify-content:center;">${regionIcons[regionKey] || ''}</span>`;
            html += `<span style="font-size:${labelSize};font-weight:600;letter-spacing:${isMobile ? '1px' : '2px'};color:hsla(25,60%,55%,0.5);text-transform:uppercase;font-family:'Inter',sans-serif;">${region.label} <span style="color:${accent};font-weight:700;">·</span></span>`;
            html += `</div>`;
            html += `<div style="display:flex;flex-wrap:wrap;gap:${isMobile ? '4px 6px' : '6px 8px'};align-items:flex-start;">`;

            for (const name of scenes) {
                const isCurrent = (name === currentScene);
                const img = SCENE_IMAGES[name] || '';
                let w, h;
                if (isMobile) {
                    if (['公寓客厅', '教室', '海边'].includes(name)) { w = '52px';
                        h = '38px'; } else if (['被炉', '小公园', '咖啡厅', '回家路上', '天台', '学校图书馆', '家庭餐馆'].includes(name)) { w = '40px';
                        h = '40px'; } else { w = '32px';
                        h = '32px'; }
                } else {
                    if (['公寓客厅', '教室', '海边'].includes(name)) { w = '76px';
                        h = '54px'; } else if (['被炉', '小公园', '咖啡厅', '回家路上', '天台', '学校图书馆', '家庭餐馆'].includes(name)) { w = '56px';
                        h = '56px'; } else { w = '44px';
                        h = '44px'; }
                }
                const labelSize2 = isMobile ? (w === '52px' ? '9px' : (w === '40px' ? '8px' : '7px')) : (w === '76px' ? '11px' : (w === '56px' ? '9px' : '8px'));

                html += `<div style="display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;transition:all 0.25s ease;border-radius:${isMobile ? '8px' : '12px'};padding:${isMobile ? '3px 3px 2px' : '6px 6px 4px'};background:${isCurrent ? 'hsla(25,70%,50%,0.04)' : 'hsla(0,0%,100%,0.02)'};border:1px solid ${isCurrent ? 'hsla(25,70%,55%,0.2)' : 'transparent'};position:relative;gap:2px;flex-shrink:0;" data-scene="${name}">`;
                html += `<div style="border-radius:6px;overflow:hidden;background:hsla(0,0%,0%,0.2);border:1px solid ${isCurrent ? 'hsl(25,70%,55%)' : 'hsla(0,0%,100%,0.04)'};transition:all 0.25s ease;flex-shrink:0;position:relative;width:${w};height:${h};">`;
                if (img) html += `<img src="${img}" alt="${name}" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy" />`;
                html += `</div>`;
                html += `<span style="font-size:${labelSize2};font-weight:${isCurrent ? '600' : '500'};color:${isCurrent ? 'hsl(25,70%,60%)' : 'hsla(30,20%,60%,0.7)'};letter-spacing:0.2px;text-align:center;line-height:1.1;max-width:${w};word-break:break-all;">${name}</span>`;
                html += `</div>`;
            }

            html += `</div></div>`;
        }

        pageZ2.innerHTML = html;

        pageZ2.querySelectorAll('[data-scene]').forEach(el => {
            el.addEventListener('click', function() {
                const scene = this.dataset.scene;
                if (scene) openDetail(scene);
            });
        });

        if (typeof window.__updateMapLocation === 'function') {
            window.__updateMapLocation(currentScene);
        }
    }

    function goToPage(index) {
        currentPage = index;
        if (!pagesWrapper) return;

        pagesWrapper.style.transform = `translateX(-${index * 100}%)`;

        const dots = document.querySelectorAll('.page-dot');
        dots.forEach((dot, i) => {
            dot.style.background = i === index ? 'hsl(25,70%,55%)' : 'hsla(0,0%,100%,0.15)';
            dot.style.width = i === index ? (isMobile ? '18px' : '24px') : (isMobile ? '6px' : '8px');
        });

        scheduleRender(() => {
            if (index === 0) renderL1();
            else if (index === 1) renderZ1();
            else if (index === 2) renderZ2();
        });

        if (typeof window.__updateMapLocation === 'function') {
            window.__updateMapLocation(currentScene);
        }
    }

    function buildUI() {
        console.log('[枫叶地图] buildUI 开始构建...');
        const topDoc = getTopDoc();

        const oldPanel = topDoc.getElementById('map-system-panel');
        if (oldPanel) oldPanel.remove();

        function getAvailableHeight() {
            const vv = window.visualViewport;
            if (vv) return vv.height;
            return window.innerHeight || topDoc.documentElement.clientHeight || 700;
        }

        const panel = topDoc.createElement('div');
        panel.id = 'map-system-panel';
        panel.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            height: 100dvh;
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;
            background: hsla(30, 15%, 6%, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            opacity: 0;
            transition: opacity 0.5s cubic-bezier(0.34, 1.0, 0.64, 1);
            pointer-events: auto;
            padding: ${isMobile ? '6px' : '8px'};
            box-sizing: border-box;
            overflow: hidden;
        `;

        const availHeight = getAvailableHeight();
        const maxCardHeight = isMobile ? 620 : 820;

        const card = topDoc.createElement('div');
        card.id = 'mapCard';
        card.style.cssText = `
            max-width: 960px;
            width: 100%;
            height: ${Math.min(availHeight - (isMobile ? 12 : 16), maxCardHeight)}px;
            max-height: ${isMobile ? '94dvh' : '92dvh'};
            background: hsla(30, 20%, 12%, 0.75);
            backdrop-filter: blur(32px);
            -webkit-backdrop-filter: blur(32px);
            border-radius: ${isMobile ? '20px' : '32px'};
            border: 1px solid hsla(25, 60%, 45%, 0.12);
            box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px hsla(25,60%,45%,0.04) inset, 0 0 80px hsla(25,70%,50%,0.04);
            padding: ${isMobile ? '10px 10px 8px' : '16px 16px 12px'};
            position: relative;
            overflow: hidden;
            transform: scale(0.95) translateY(12px);
            transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
            opacity: 0;
            display: flex;
            flex-direction: column;
            pointer-events: auto;
            box-sizing: border-box;
        `;
        panel.appendChild(card);

        const resizeHandler = function() {
            const newHeight = getAvailableHeight();
            const cardEl = document.getElementById('mapCard');
            if (cardEl) {
                cardEl.style.height = Math.min(newHeight - (isMobile ? 12 : 16), maxCardHeight) + 'px';
            }
        };
        window.addEventListener('resize', resizeHandler);
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', resizeHandler);
        }
        panel._resizeHandler = resizeHandler;

        const bgDeco = topDoc.createElement('div');
        bgDeco.style.cssText = `
            position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: 0.06;
            background-image: repeating-linear-gradient(45deg, transparent, transparent 80px, hsla(25,70%,50%,0.02) 80px, hsla(25,70%,50%,0.02) 81px), repeating-linear-gradient(-45deg, transparent, transparent 80px, hsla(40,80%,55%,0.015) 80px, hsla(40,80%,55%,0.015) 81px);
        `;
        card.appendChild(bgDeco);

        const bgGrad = topDoc.createElement('div');
        bgGrad.style.cssText = `
            position: absolute; inset: 0; pointer-events: none; z-index: 0;
            background: radial-gradient(ellipse at 20% 80%, hsla(25,70%,50%,0.04), transparent 50%), radial-gradient(ellipse at 80% 20%, hsla(10,60%,45%,0.03), transparent 40%);
        `;
        card.appendChild(bgGrad);

        const bgImg = topDoc.createElement('div');
        bgImg.style.cssText = `
            position: absolute; inset: 0; z-index: 0; opacity: 0.25;
            background-image: url('https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E5%9C%B0%E5%9B%BE%E8%83%8C%E6%99%AF.jpg');
            background-size: cover; background-position: center; background-repeat: no-repeat;
            border-radius: 20px; filter: blur(2px) saturate(0.6); pointer-events: none;
        `;
        card.appendChild(bgImg);

        const content = topDoc.createElement('div');
        content.style.cssText = 'position:relative;z-index:1;display:flex;flex-direction:column;height:100%;min-height:0;';
        card.appendChild(content);

        const header = topDoc.createElement('div');
        header.style.cssText = `
            display: flex; justify-content: space-between; align-items: center;
            padding-bottom: ${isMobile ? '6px' : '10px'};
            border-bottom: 1px solid hsla(25,60%,45%,0.08);
            flex-shrink: 0; gap: ${isMobile ? '6px' : '8px'};
            flex-wrap: wrap;
            min-height: ${isMobile ? '32px' : '44px'};
        `;
        content.appendChild(header);

        const titleWrap = topDoc.createElement('div');
        titleWrap.style.cssText = 'display:flex;align-items:center;gap:6px;flex-shrink:1;min-width:0;';
        header.appendChild(titleWrap);

        const title3D = topDoc.createElement('div');
        title3D.style.cssText = 'position:relative;z-index:2;display:inline-block;padding:0 2px;';
        titleWrap.appendChild(title3D);

        const fontSize = isMobile ? '16px' : '22px';
        const charHeight = isMobile ? '24px' : '32px';
        const words = topDoc.createElement('div');
        words.style.cssText = `
            font-family: 'ZSFT-ga','Georgia','Times New Roman',serif;
            font-size: ${fontSize}; font-weight: 400; letter-spacing: 0px;
            color: hsl(25,70%,60%); text-transform: uppercase;
            display: flex; flex-wrap: wrap; gap: ${isMobile ? '1px 2px' : '1px 4px'};
            justify-content: center; align-items: center;
        `;
        title3D.appendChild(words);

        const chars = ['秋', '季', '转', '校', '·', '枫', '叶', '地', '图'];
        chars.forEach((ch, i) => {
            const line = topDoc.createElement('div');
            const leftOffset = isMobile ? Math.floor(i * 2) : i * 3;
            const transformStyle = isMobile ?
                (i % 2 === 0 ? 'skew(8deg, -4deg) scaleY(0.9)' : 'skew(-3deg, -6deg) scaleY(1.0)') :
                (i % 2 === 0 ? 'skew(10deg, -6deg) scaleY(0.9)' : 'skew(-4deg, -8deg) scaleY(1.05)');
            line.style.cssText = `
                height: ${charHeight}; overflow: hidden; position: relative; display: inline-block;
                padding: 0 1px; transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
                flex-shrink: 0; cursor: default; left: ${leftOffset}px;
                transform: ${transformStyle};
            `;
            const p = topDoc.createElement('p');
            p.textContent = ch;
            const color = (i === 4 || i === 8) ? 'hsl(25,50%,35%)' : 'hsl(25,70%,60%)';
            const fontWeight = (i === 4 || i === 8) ? '300' : '400';
            p.style.cssText = `
                height: ${charHeight}; line-height: ${charHeight}; padding: 0 1px; margin: 0;
                transition: all 0.45s cubic-bezier(0.34,1.56,0.64,1);
                transform: translate3d(0,0,0); vertical-align: top; white-space: nowrap;
                font-size: inherit;
                color: ${color};
                font-weight: ${fontWeight};
                text-shadow: 0 0 40px hsla(25,70%,50%,0.06);
                letter-spacing: ${i === 4 ? '2px' : '0'};
            `;
            line.appendChild(p);
            words.appendChild(line);
        });

        const rightGroup = topDoc.createElement('div');
        rightGroup.style.cssText = 'display:flex;align-items:center;gap:6px;flex-shrink:0;';
        header.appendChild(rightGroup);

        const locSpan = topDoc.createElement('span');
        locSpan.id = 'mapCurrentLocation';
        locSpan.style.cssText = `
            font-size: ${isMobile ? '9px' : '11px'};
            color: hsl(25,70%,55%); font-weight: 500;
            letter-spacing: 0.2px; padding: ${isMobile ? '2px 8px' : '3px 10px'};
            border-radius: 6px;
            background: hsla(25,70%,50%,0.06);
            border: 1px solid hsla(25,60%,45%,0.06);
            white-space: nowrap;
        `;
        locSpan.textContent = '📍 ' + currentScene;
        rightGroup.appendChild(locSpan);

        window.__updateMapLocation = function(sceneName) {
            const el = document.getElementById('mapCurrentLocation');
            if (el) el.textContent = '📍 ' + (sceneName || currentScene);
        };

        const closeBtn = topDoc.createElement('button');
        closeBtn.id = 'mapCloseBtn';
        closeBtn.style.cssText = `
            width: ${isMobile ? '26px' : '30px'};
            height: ${isMobile ? '26px' : '30px'};
            border: none;
            background: hsla(0,0%,100%,0.04);
            border-radius: 50%;
            color: hsla(30,20%,50%,0.4);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        `;
        closeBtn.innerHTML = `<svg viewBox="0 0 24 24" style="width:${isMobile ? '13px' : '15px'};height:${isMobile ? '13px' : '15px'};stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        rightGroup.appendChild(closeBtn);

        const pageContainer = topDoc.createElement('div');
        pageContainer.style.cssText = `flex:1;overflow:hidden;position:relative;z-index:1;min-height:0;margin-top:${isMobile ? '4px' : '6px'};`;
        content.appendChild(pageContainer);

        pagesWrapper = topDoc.createElement('div');
        pagesWrapper.id = 'pagesWrapper';
        pagesWrapper.style.cssText = 'display:flex;height:100%;transition:transform 0.4s cubic-bezier(0.34,1.0,0.64,1);transform:translateX(0%);';
        pageContainer.appendChild(pagesWrapper);

        pageL1 = topDoc.createElement('div');
        pageL1.id = 'pageL1';
        pageL1.style.cssText = `flex:0 0 100%;overflow-y:auto;padding:${isMobile ? '2px 2px 2px' : '2px 2px 4px'};`;
        pagesWrapper.appendChild(pageL1);

        pageZ1 = topDoc.createElement('div');
        pageZ1.id = 'pageZ1';
        pageZ1.style.cssText = `flex:0 0 100%;overflow-y:auto;padding:${isMobile ? '2px 2px 2px' : '2px 2px 4px'};`;
        pagesWrapper.appendChild(pageZ1);

        pageZ2 = topDoc.createElement('div');
        pageZ2.id = 'pageZ2';
        pageZ2.style.cssText = `flex:0 0 100%;overflow-y:auto;padding:${isMobile ? '2px 2px 2px' : '2px 2px 4px'};`;
        pagesWrapper.appendChild(pageZ2);

        const bottomNav = topDoc.createElement('div');
        bottomNav.style.cssText = `
            display: flex; justify-content: center; align-items: center;
            gap: ${isMobile ? '10px' : '14px'};
            padding-top: ${isMobile ? '6px' : '8px'};
            flex-shrink: 0;
            z-index: 2; position: relative;
        `;
        content.appendChild(bottomNav);

        const prevBtn = topDoc.createElement('button');
        prevBtn.id = 'prevPageBtn';
        prevBtn.style.cssText = `
            background: hsla(0,0%,100%,0.04);
            border: 1px solid hsla(0,0%,100%,0.06);
            border-radius: 50%;
            color: hsla(0,0%,100%,0.3);
            cursor: pointer;
            padding: ${isMobile ? '2px 8px' : '4px 10px'};
            transition: all 0.3s ease;
            font-size: ${isMobile ? '14px' : '18px'};
            width: ${isMobile ? '28px' : '32px'};
            height: ${isMobile ? '28px' : '32px'};
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        prevBtn.textContent = '‹';
        bottomNav.appendChild(prevBtn);

        const dotWrap = topDoc.createElement('div');
        dotWrap.style.cssText = `display:flex;gap:${isMobile ? '6px' : '8px'};align-items:center;`;
        bottomNav.appendChild(dotWrap);

        for (let i = 0; i < 3; i++) {
            const dot = topDoc.createElement('span');
            dot.className = 'page-dot';
            dot.style.cssText = `
                width: ${i === 0 ? (isMobile ? '16px' : '22px') : (isMobile ? '5px' : '7px')};
                height: ${isMobile ? '4px' : '5px'};
                border-radius: 4px;
                background: ${i === 0 ? 'hsl(25,70%,55%)' : 'hsla(0,0%,100%,0.15)'};
                transition: all 0.3s ease;
                cursor: pointer;
            `;
            dotWrap.appendChild(dot);
        }

        const nextBtn = topDoc.createElement('button');
        nextBtn.id = 'nextPageBtn';
        nextBtn.style.cssText = `
            background: hsla(0,0%,100%,0.04);
            border: 1px solid hsla(0,0%,100%,0.06);
            border-radius: 50%;
            color: hsla(0,0%,100%,0.3);
            cursor: pointer;
            padding: ${isMobile ? '2px 8px' : '4px 10px'};
            transition: all 0.3s ease;
            font-size: ${isMobile ? '14px' : '18px'};
            width: ${isMobile ? '28px' : '32px'};
            height: ${isMobile ? '28px' : '32px'};
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        nextBtn.textContent = '›';
        bottomNav.appendChild(nextBtn);

        // ─── 两个悬浮人物（手机端也显示，只是缩小） ──────────────

        const floatCharLeft = topDoc.createElement('div');
        floatCharLeft.style.cssText = `
            position: absolute;
            left: ${isMobile ? '6px' : '10px'};
            top: ${isMobile ? '52px' : '64px'};
            z-index: 10;
            width: ${isMobile ? '48px' : '72px'};
            height: auto;
            pointer-events: none;
            opacity: ${isMobile ? '0.3' : '0.4'};
            animation: floatChar 4s ease-in-out infinite;
            filter: drop-shadow(0 8px 32px rgba(0,0,0,0.3));
            animation-delay: 0.5s;
        `;
        const charImgLeft = topDoc.createElement('img');
        charImgLeft.src = 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E6%82%AC%E6%B5%AE%E4%BA%BA%E7%89%A9.png';
        charImgLeft.alt = '星宫';
        charImgLeft.style.cssText = 'width:100%;height:auto;display:block;';
        floatCharLeft.appendChild(charImgLeft);
        card.appendChild(floatCharLeft);

        const floatCharRight = topDoc.createElement('div');
        floatCharRight.style.cssText = `
            position: absolute;
            right: ${isMobile ? '6px' : '10px'};
            bottom: ${isMobile ? '6px' : '10px'};
            z-index: 10;
            width: ${isMobile ? '72px' : '200px'};
            height: auto;
            pointer-events: none;
            opacity: ${isMobile ? '0.5' : '0.7'};
            animation: floatChar 4s ease-in-out infinite;
            filter: drop-shadow(0 8px 32px rgba(0,0,0,0.3));
            animation-delay: 0s;
        `;
        const charImgRight = topDoc.createElement('img');
        charImgRight.src = 'https://testingcf.jsdelivr.net/gh/sanshui19516/CG@main/%E8%BD%AC%E6%A0%A1%E7%94%9F/%E5%9C%B0%E5%9B%BE/%E5%9C%B0%E5%9B%BE-%E6%82%AC%E6%B5%AE%E4%BA%BA%E7%89%A9.png';
        charImgRight.alt = '星宫';
        charImgRight.style.cssText = 'width:100%;height:auto;display:block;';
        floatCharRight.appendChild(charImgRight);
        card.appendChild(floatCharRight);

        if (!topDoc.getElementById('map-float-anim')) {
            const animStyle = topDoc.createElement('style');
            animStyle.id = 'map-float-anim';
            animStyle.textContent = `
                @keyframes floatChar { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
                [data-scene]:hover { transform: translateY(-2px) !important; }
                .page-dot:hover { opacity: 0.7; }
                #prevPageBtn:hover, #nextPageBtn:hover {
                    background: hsla(0,0%,100%,0.08);
                    border-color: hsla(0,0%,100%,0.12);
                    color: hsla(0,0%,100%,0.6);
                }
                .map-node-dot { touch-action: manipulation; }
            `;
            topDoc.head.appendChild(animStyle);
        }

        topDoc.body.appendChild(panel);
        panelElement = panel;

        closeBtn.addEventListener('click', closeMap);
        panel.addEventListener('click', function(e) { if (e.target === this) closeMap(); });
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && isMounted) closeMap(); });

        prevBtn.addEventListener('click', function() { if (currentPage > 0) goToPage(currentPage - 1); });
        nextBtn.addEventListener('click', function() { if (currentPage < 2) goToPage(currentPage + 1); });

        document.querySelectorAll('.page-dot').forEach((dot, i) => {
            dot.addEventListener('click', function() { if (currentPage !== i) goToPage(i); });
        });

        let touchStartX = 0, touchEndX = 0;
        pagesWrapper.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        pagesWrapper.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > (isMobile ? 30 : 40)) {
                if (diff > 0 && currentPage < 2) goToPage(currentPage + 1);
                else if (diff < 0 && currentPage > 0) goToPage(currentPage - 1);
            }
        }, { passive: true });

        setTimeout(() => {
            panel.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
            card.style.opacity = '1';
        }, 50);

        setTimeout(() => {
            renderL1();
            renderZ1();
            renderZ2();
            goToPage(0);
        }, 100);

        console.log('[枫叶地图] buildUI 完成');
    }

    function openMap() {
        fetchCurrentScene();
        if (isMounted && panelElement) {
            panelElement.style.opacity = '1';
            const card = panelElement.querySelector('#mapCard');
            if (card) { card.style.transform = 'scale(1) translateY(0)';
                card.style.opacity = '1'; }
            renderL1();
            renderZ1();
            renderZ2();
            goToPage(0);
            return;
        }
        buildUI();
        isMounted = true;
        document.body.style.overflow = 'hidden';
    }

    function closeMap() {
        closeDetail();
        if (panelElement) {
            panelElement.style.opacity = '0';
            const card = panelElement.querySelector('#mapCard');
            if (card) { card.style.transform = 'scale(0.95) translateY(12px)';
                card.style.opacity = '0'; }
            setTimeout(() => {
                if (panelElement && panelElement.parentNode) {
                    panelElement.parentNode.removeChild(panelElement);
                }
                if (panelElement && panelElement._resizeHandler) {
                    window.removeEventListener('resize', panelElement._resizeHandler);
                    if (window.visualViewport) {
                        window.visualViewport.removeEventListener('resize', panelElement._resizeHandler);
                    }
                }
                panelElement = null;
                pagesWrapper = null;
                pageL1 = null;
                pageZ1 = null;
                pageZ2 = null;
                isMounted = false;
                document.body.style.overflow = '';
                delete window.__updateMapLocation;
            }, 400);
        } else {
            isMounted = false;
            document.body.style.overflow = '';
        }
    }

    function toggleMap() {
        if (isMounted) closeMap();
        else openMap();
    }

    function registerButton() {
        try {
            const btnName = '🍁 枫叶地图';
            const buttons = typeof getScriptButtons === 'function' ? getScriptButtons() : [];
            if (!buttons.some(b => b.name === btnName)) {
                if (typeof replaceScriptButtons === 'function') {
                    replaceScriptButtons([...buttons, { name: btnName, visible: true }]);
                }
            }
            const evt = typeof getButtonEvent === 'function' ? getButtonEvent(btnName) : null;
            if (evt && typeof eventOn === 'function') {
                eventOn(evt, toggleMap);
            } else {
                window.__mapToggle = toggleMap;
            }
        } catch (e) {
            console.warn('[枫叶地图] 按钮注册失败:', e);
            window.__mapToggle = toggleMap;
        }
    }

    function startPolling() {
        setInterval(function() {
            if (isMounted) {
                const old = currentScene;
                fetchCurrentScene();
                if (currentScene !== old) {
                    renderL1();
                    renderZ1();
                    renderZ2();
                    if (typeof window.__updateMapLocation === 'function') {
                        window.__updateMapLocation(currentScene);
                    }
                }
            }
        }, 3000);
    }

    $(function() {
        fetchCurrentScene();
        registerButton();
        startPolling();
        console.log('[枫叶地图] 已加载（性能优化+手机适配+悬浮人物显示），三页模式，共 ' + ALL_SCENES.length + ' 个场景');
    });

})();
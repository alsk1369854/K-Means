import CanvasUtil from './modules/CanvasUtil'
import LoadingBar from './modules/LoadingBar'
import KMeans from './modules/KMeans'

/**
 * @description 程式進入點，管控畫面選染與事件觸發
 * @author alsk1369854@gmail.com
 */
(() => {

    // 聚類點的顏色清單
    const COLOR_0 = '#669cd1'
    const COLOR_1 = '#cca3bb'
    const COLOR_2 = '#95bfb2'
    const COLOR_3 = '#d6b27c'
    const COLOR_4 = '#9e826c'
    const COLOR_LIST = [COLOR_0, COLOR_1, COLOR_2, COLOR_3, COLOR_4]

    // K Value 標籤
    const kValueTag = document.getElementById('kValue')
    // 最佳距離顯示標籤
    const totalSquareDeviationValueTag = document.getElementById('totalSquareDeviationValue')
    // 總城市數顯示標籤
    const totalCityValueTag = document.getElementById('totalCityValue')
    let cityAmount = 0
    // 運行時間標籤
    const runTimeValueTag = document.getElementById('runTimeValue');
    // 是否慢速運行標籤
    const slowValueTag = document.getElementById('slowValue');
    // 存儲要走訪的城市
    let cityList = []
    // 執行伐
    let isRun = false

    // 存儲正在運作的演算物件
    let km = null;

    const updateTotalCityValue = () => {
        cityAmount = cityList.length
        totalCityValueTag.innerHTML = cityAmount
    }

    // 綁定在畫布中的點擊事件
    CanvasUtil.getTag().addEventListener('mouseup', event => {
        if (isRun) return
        // 在點擊的 x y 座標
        const { offsetX: x, offsetY: y } = event
        // 將點擊座標加入 pointList 中
        cityList.push([x, y])
        // 清空畫布
        CanvasUtil.clearCanvas()
        // 在畫布中劃出點擊點
        for (let i = 0; i < cityList.length; i++) {
            const { [0]: x, [1]: y } = cityList[i]
            CanvasUtil.drawHollowPoint(x, y)
        }
        // 更新總城市數
        updateTotalCityValue()
    })

    // 綁定隨機位址點擊事件
    const randomPositionBtn = document.getElementById('randomPositionBtn')
    randomPositionBtn.addEventListener('click', event => {
        if (isRun) return
        const randomPositionAmount = document.getElementById('randomPositionAmount').value
        for (let i = 0; i < randomPositionAmount; i++) {
            // 隨機x y軸
            const x = Math.random() * (CanvasUtil.getWidth() - 30) + 15
            const y = Math.random() * (CanvasUtil.getHeight() - 30) + 15
            // 將點擊座標加入 pointList 中
            cityList.push([x, y])
        }
        // 清空畫布
        CanvasUtil.clearCanvas()
        // 在畫布中劃出點擊點
        for (let i = 0; i < cityList.length; i++) {
            const { [0]: x, [1]: y } = cityList[i]
            CanvasUtil.drawHollowPoint(x, y)
        }
        // 更新總城市數
        updateTotalCityValue()
    })

    // 綁定計算最點路徑按鈕點擊事件
    const calculateShortestPathBtn = document.getElementById('calculateShortestPathBtn');
    calculateShortestPathBtn.addEventListener('click', event => {
        if (cityList.length <= 0 || isRun) return
        // 更新執行伐
        isRun = true
        // 初始化路程與執行時間
        totalSquareDeviationValueTag.innerHTML = 0
        runTimeValueTag.innerHTML = 0

        // 創建 K-means 算法
        km = new KMeans(kValueTag.value, cityList);
        // 設定是否為慢數執行(為配合觀察使用)
        km.isSlow = slowValueTag.checked;

        km.done = () => {
            // 取得計算後的數據
            const totalSquareDeviation = km.getTotalSquareDeviation()
            const runTime = km.getRunTime()
            const kPositionList = km.getKPositionList()
            const attributionList = km.getAttributionList()

            // 設定畫面顯示數值
            totalSquareDeviationValueTag.innerHTML = totalSquareDeviation.toFixed(2)
            runTimeValueTag.innerHTML = runTime

            // 清空畫布
            CanvasUtil.clearCanvas()
            for (let i = 0; i < kPositionList.length; i++) {
                // 畫每個歸類點到此聚類的點
                attributionList[i].map(position => {
                    const { [0]: x, [1]: y } = position
                    CanvasUtil.drawHollowPoint(x, y, COLOR_LIST[i])
                })
                // 畫聚類核心
                const { [0]: x, [1]: y } = kPositionList[i]
                CanvasUtil.drawFilledPoint(x, y, COLOR_LIST[i])
            }
            // 轉換運行狀態
            isRun = false
        }
        // 開始計算 (是個非同步方法)
        km.start()
    })

    // 綁定重置按鈕點擊事件
    const resetBtn = document.getElementById('resetBtn')
    resetBtn.addEventListener('click', event => {
        // if (isRun) return
        km.delete()
        km = null
        isRun = false

        // 清空畫布
        CanvasUtil.clearCanvas();
        // 初始畫讀條
        LoadingBar.setPersent(0);
        // 清空已標記的點
        cityList = [];
        // 更新總城市數
        updateTotalCityValue()
        // 更新最佳路徑距離
        totalSquareDeviationValueTag.innerHTML = 0
        runTimeValueTag.innerHTML = 0
    })

    // 監聽 Slow 切換
    slowValueTag.addEventListener('click', event => {
        if (km === null) return
        km.isSlow = slowValueTag.checked;
    })
})()
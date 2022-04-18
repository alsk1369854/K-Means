import LoadingBar from './LoadingBar'
import CanvasUtil from './CanvasUtil'

/**
 * @author alsk1369854@gmail.com
 */
export default class KMeans {
    /**
     * 
     * @param {*} K type :Number 
     * @param {*} PositionList typeof :Array<[x:Number,y:Number]> 
     */
    constructor(K, positionList) {
        
        // Start 用於存儲顯示解果（可刪） ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
        this.demoKPositionListAll = []
        this.demoAttributionListAll = []
        this.demoTotalSquareDeviationAll = []
        // End 用於存儲顯示解果（可刪） ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

        // 可變參數
        this.MaxIterations = 100 // 最大回合數

        // 基礎設置
        this.K = K;
        this.positionList = [...positionList]
        this.positionLength = this.positionList.length

        // 所有未分類集合的邊界座標
        this.MAX_X = 0
        this.MAX_Y = 0
        this.MIN_X = 0
        this.MIN_Y = 0
        this.findMaxAndMinXY()

        // 存儲每個聚類核心位置
        this.kPositionList = []
        this.initializeKPositionList()

        // 存儲每一輪被分類點歸屬於哪個聚類核心
        this.attributionList = []
        this.initializeAttributionList()

        // 存算法執行狀態
        this.STATE_NEW = 'NEW' // 尚未執行 start()
        this.STATE_RUNNING = 'RUNNING' // 執行 start(), 正在進行計算
        this.STATE_DONE = 'DONE' // 計算完畢
        this.STATE_DELETE = 'DELETE' // 刪除
        this.state = this.NEW

        // 存儲執行時間
        this.runTime = 0

        // 存儲總平方偏差
        this.totalSquareDeviation = 0

        // 存儲運算執行伐
        this.isDelete = false
    }

    getKPositionList() {
        return this.kPositionList
    }
    getAttributionList() {
        return this.attributionList
    }
    getState() {
        return this.state
    }
    getRunTime() {
        return this.runTime
    }
    getTotalSquareDeviation() {
        return this.totalSquareDeviation
    }
    delete() {
        this.isDelete = true
        this.state = this.STATE_DELETE
    }

    // 找出所有點的極限位置
    findMaxAndMinXY() {
        let MaxX = Number.MIN_SAFE_INTEGER
        let MaxY = Number.MIN_SAFE_INTEGER
        let MinX = Number.MAX_SAFE_INTEGER
        let MinY = Number.MAX_SAFE_INTEGER
        this.positionList.map(postion => {
            const { [0]: x, [1]: y } = postion
            if (x > MaxX) MaxX = x
            if (y > MaxY) MaxY = y
            if (x < MinX) MinX = x
            if (y < MinY) MinY = y
        })
        this.MAX_X = MaxX
        this.MAX_Y = MaxY
        this.MIN_X = MinX
        this.MIN_Y = MinY
    }

    // 初始化K座標
    initializeKPositionList() {
        for (let i = 0; i < this.K; i++) {
            const x = Math.random() * (this.MAX_X - this.MIN_X) + 1 + this.MIN_X
            const y = Math.random() * (this.MAX_Y - this.MIN_Y) + 1 + this.MIN_Y
            this.kPositionList.push([x, y])
        }
    }

    // 初始化歸屬清單
    initializeAttributionList() {
        this.attributionList = []
        for (let i = 0; i < this.K; i++) {
            this.attributionList.push([])
        }
    }

    // 機算兩點間的距離
    claculateTheDistanceBetweenTwoOption(positionOne, positionTwo) {
        const { [0]: oneX, [1]: oneY } = positionOne
        const { [0]: twoX, [1]: twoY } = positionTwo
        return Math.sqrt(Math.pow(twoX - oneX, 2) + Math.pow(twoY - oneY, 2))
    }

    // Just Sleep
    sleep(sleepTime) {
        return new Promise(r => setTimeout(r, sleepTime))
    }

    // 開始計算
    async start() {
        // 更改生命週期裝態為計算中
        this.state = this.STATE_RUNNING
        // 初始化執行時間，計算開始的時間
        const startTime = new Date()

        // 紀錄上一次的總平方偏差(用於判斷算法是否收斂了)
        let preveiusTotalSquareDeviation = Number.MIN_SAFE_INTEGER

        while (this.MaxIterations-- > 0) {
            // 計算已被刪除直接跳出計算
            if (this.isDelete) return
            // 驗算法已收斂跳出迴圈
            if (this.totalSquareDeviation === preveiusTotalSquareDeviation) break
            // 更新上一次的總平方偏差
            preveiusTotalSquareDeviation = this.totalSquareDeviation
            // 重置總平方偏差
            this.totalSquareDeviation = 0
            // 重置歸屬清單
            this.initializeAttributionList()

            // 計算每個點的歸屬
            this.positionList.map(position => {
                // 初始化歸屬點位
                let attributionIndex = 999;
                // 初始話最小點為差
                let minDistance = Number.MAX_SAFE_INTEGER;
                // 計算與每個核心的距離
                for (let i = 0; i < this.kPositionList.length; i++) {
                    const distance = this.claculateTheDistanceBetweenTwoOption(this.kPositionList[i], position)
                    // 如果找出最短距離的核心
                    if (distance < minDistance) {
                        minDistance = distance
                        attributionIndex = i
                    }
                }
                this.totalSquareDeviation += minDistance
                // 添加歸屬點為到核心下
                this.attributionList[attributionIndex].push(position)
            })

            // 計算新的核心位置
            for (let i = 0; i < this.kPositionList.length; i++) {
                // 計算單個核心歸屬的 X Y 總和 return [numX, numY]
                const sumXY = this.attributionList[i].reduce((previousValue, currentValue) => {
                    previousValue[0] += currentValue[0]
                    previousValue[1] += currentValue[1]
                    return previousValue
                }, [0, 0])
                // 被歸屬到核心的點總數
                const kListLength = this.attributionList[i].length
                // 重新定位核心
                this.kPositionList[i] = [sumXY[0] / kListLength, sumXY[1] / kListLength]
            }

            // Start 用於存儲顯示解果（可刪） ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
            this.demoKPositionListAll.push([...this.kPositionList])
            this.demoAttributionListAll.push([...this.attributionList])
            this.demoTotalSquareDeviationAll.push(this.totalSquareDeviation)
            // End 用於存儲顯示解果（可刪） ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
        }
        // Start 畫每回合計算解果 (可刪) ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝ 
        const COLOR_0 = '#669cd1'
        const COLOR_1 = '#cca3bb'
        const COLOR_2 = '#95bfb2'
        const COLOR_3 = '#d6b27c'
        const COLOR_4 = '#9e826c'
        const COLOR_LIST = [COLOR_0, COLOR_1, COLOR_2, COLOR_3, COLOR_4]
        const totalSquareDeviationValueTag = document.getElementById('totalSquareDeviationValue')
        // 總回合數
        const MaxPersent = this.demoKPositionListAll.length;
        // 每回合解果
        for (let i = 0; i < MaxPersent; i++) {
            // 被刪了就直接跳出
            if (this.isDelete) return
            CanvasUtil.clearCanvas()
            this.demoKPositionListAll[i].map((kPosition, j) => {
                // 畫每個歸類點到此聚類的點
                this.demoAttributionListAll[i][j].map(subPosition => {
                    const { [0]: x, [1]: y } = subPosition
                    CanvasUtil.drawHollowPoint(x, y, COLOR_LIST[j])
                })
                // 畫聚類核心
                const { [0]: x, [1]: y } = kPosition
                CanvasUtil.drawFilledPoint(x, y, COLOR_LIST[j])
            })
            // 更新讀條
            const newPercent = Math.floor((i + 1) / MaxPersent * 100)
            LoadingBar.setPersent(newPercent)
            // 更新這回合的平方和
            totalSquareDeviationValueTag.innerHTML = this.demoTotalSquareDeviationAll[i].toFixed(2)
            await this.sleep(1)
            // 慢速運行
            if (this.isSlow) {
                await this.sleep(500)
            }
        }
        // End 畫每回合計算解果 (可刪) ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝ 

        // 計算結束時間
        const endTime = new Date()
        this.runTime = Math.round((endTime - startTime) / 1000)
        // 運行完成機算後的回調函數
        this.done()
        // 更改生命週期裝態為完成計算
        this.state = this.STATE_DONE
    }

    /**
     * @description 演算法計算完成後自動呼叫，透過改寫此函數來設定結果的顯示
     */
    done() { }

}
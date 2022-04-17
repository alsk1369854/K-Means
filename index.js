(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var _CanvasUtil = require('./modules/CanvasUtil');

var _CanvasUtil2 = _interopRequireDefault(_CanvasUtil);

var _LoadingBar = require('./modules/LoadingBar');

var _LoadingBar2 = _interopRequireDefault(_LoadingBar);

var _KMeans = require('./modules/KMeans');

var _KMeans2 = _interopRequireDefault(_KMeans);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @description 程式進入點，管控畫面選染與事件觸發
 * @author alsk1369854@gmail.com
 */
(function () {

    // 聚類點的顏色清單
    var COLOR_0 = '#669cd1';
    var COLOR_1 = '#cca3bb';
    var COLOR_2 = '#95bfb2';
    var COLOR_3 = '#d6b27c';
    var COLOR_4 = '#9e826c';
    var COLOR_LIST = [COLOR_0, COLOR_1, COLOR_2, COLOR_3, COLOR_4];

    // K Value 標籤
    var kValueTag = document.getElementById('kValue');
    // 最佳距離顯示標籤
    var totalSquareDeviationValueTag = document.getElementById('totalSquareDeviationValue');
    // 總城市數顯示標籤
    var totalCityValueTag = document.getElementById('totalCityValue');
    var cityAmount = 0;
    // 運行時間標籤
    var runTimeValueTag = document.getElementById('runTimeValue');
    // 是否慢速運行標籤
    var slowValueTag = document.getElementById('slowValue');
    console.log([slowValueTag]);
    // 存儲要走訪的城市
    var cityList = [];
    // 執行伐
    var isRun = false;

    var updateTotalCityValue = function updateTotalCityValue() {
        cityAmount = cityList.length;
        totalCityValueTag.innerHTML = cityAmount;
    };

    // 綁定在畫布中的點擊事件
    _CanvasUtil2.default.getTag().addEventListener('mouseup', function (event) {
        if (isRun) return;
        // 在點擊的 x y 座標
        var x = event.offsetX,
            y = event.offsetY;
        // 將點擊座標加入 pointList 中

        cityList.push([x, y]);
        // 清空畫布
        _CanvasUtil2.default.clearCanvas();
        // 在畫布中劃出點擊點
        for (var i = 0; i < cityList.length; i++) {
            var _cityList$i = cityList[i],
                _x = _cityList$i[0],
                _y = _cityList$i[1];

            _CanvasUtil2.default.drawHollowPoint(_x, _y);
        }
        // 更新總城市數
        updateTotalCityValue();
    });

    // 綁定隨機位址點擊事件
    var randomPositionBtn = document.getElementById('randomPositionBtn');
    randomPositionBtn.addEventListener('click', function (event) {
        if (isRun) return;
        var randomPositionAmount = document.getElementById('randomPositionAmount').value;
        for (var i = 0; i < randomPositionAmount; i++) {
            // 隨機x y軸
            var x = Math.random() * (_CanvasUtil2.default.getWidth() - 30) + 15;
            var y = Math.random() * (_CanvasUtil2.default.getHeight() - 30) + 15;
            // 將點擊座標加入 pointList 中
            cityList.push([x, y]);
        }
        // 清空畫布
        _CanvasUtil2.default.clearCanvas();
        // 在畫布中劃出點擊點
        for (var _i = 0; _i < cityList.length; _i++) {
            var _cityList$_i = cityList[_i],
                _x2 = _cityList$_i[0],
                _y2 = _cityList$_i[1];

            _CanvasUtil2.default.drawHollowPoint(_x2, _y2);
        }
        // 更新總城市數
        updateTotalCityValue();
    });

    // 綁定計算最點路徑按鈕點擊事件
    var calculateShortestPathBtn = document.getElementById('calculateShortestPathBtn');
    calculateShortestPathBtn.addEventListener('click', function (event) {
        if (cityList.length <= 0 || isRun) return;
        // 更新執行伐
        isRun = true;
        // 初始化路程與執行時間
        totalSquareDeviationValueTag.innerHTML = 0;
        runTimeValueTag.innerHTML = 0;

        // 創建 K-means 算法
        var km = new _KMeans2.default(kValueTag.value, cityList);
        // 設定是否為慢數執行(為配合觀察使用)
        km.isSlow = slowValueTag.checked;

        km.done = function () {
            // 取得計算後的數據
            var totalSquareDeviation = km.getTotalSquareDeviation();
            var runTime = km.getRunTime();
            var kPositionList = km.getKPositionList();
            var attributionList = km.getAttributionList();

            // 設定畫面顯示數值
            totalSquareDeviationValueTag.innerHTML = totalSquareDeviation.toFixed(2);
            runTimeValueTag.innerHTML = runTime;

            // 清空畫布
            _CanvasUtil2.default.clearCanvas();

            var _loop = function _loop(i) {
                // 畫每個歸類點到此聚類的點
                attributionList[i].map(function (position) {
                    var x = position[0],
                        y = position[1];

                    _CanvasUtil2.default.drawHollowPoint(x, y, COLOR_LIST[i]);
                });
                // 畫聚類核心
                var _kPositionList$i = kPositionList[i],
                    x = _kPositionList$i[0],
                    y = _kPositionList$i[1];

                _CanvasUtil2.default.drawFilledPoint(x, y, COLOR_LIST[i]);
            };

            for (var i = 0; i < kPositionList.length; i++) {
                _loop(i);
            }
            // 轉換運行狀態
            isRun = false;
        };
        // 開始計算 (是個非同步方法)
        km.start();
    });

    // 綁定重置按鈕點擊事件
    var resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', function (event) {
        if (isRun) return;
        // 清空畫布
        _CanvasUtil2.default.clearCanvas();
        // 初始畫讀條
        _LoadingBar2.default.setPersent(0);
        // 清空已標記的點
        cityList = [];
        // 更新總城市數
        updateTotalCityValue();
        // 更新最佳路徑距離
        totalSquareDeviationValueTag.innerHTML = 0;
        runTimeValueTag.innerHTML = 0;
    });
})();
},{"./modules/CanvasUtil":2,"./modules/KMeans":3,"./modules/LoadingBar":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @description 畫布操作工具
 * @author alsk1369854@gmail.com
 */
var CanvasUtil = function () {
    function CanvasUtil() {
        _classCallCheck(this, CanvasUtil);

        // 創建畫布操作工具
        this.canvasTag = document.getElementById('canvas');
        if (window.screen.width <= 450) {
            // phone
            this.canvasTag.width = Math.floor(window.screen.width * 0.95);
            this.canvasTag.height = Math.floor(window.screen.width * 0.95);
        } else if (window.screen.width <= 900) {
            // ipad
            this.canvasTag.width = Math.floor(window.screen.width * 0.85);
            this.canvasTag.height = Math.floor(window.screen.width * 0.85);
        } else {
            // PC
            this.canvasTag.width = 800;
            this.canvasTag.height = 400;
        }

        this.DEFAULT_POINT_COLOR = "#334f96";
        this.DEFAULT_LINE_COLOR = "#86a0e3";

        this.ctx = this.canvasTag.getContext('2d');
    }

    _createClass(CanvasUtil, [{
        key: "getTag",
        value: function getTag() {
            return this.canvasTag;
        }
    }, {
        key: "setWidth",
        value: function setWidth(newWidth) {
            this.canvasTag.width = newWidth;
        }
    }, {
        key: "setHeight",
        value: function setHeight(newHeight) {
            this.canvasTag.height = newHeight;
        }
    }, {
        key: "getWidth",
        value: function getWidth() {
            return this.canvasTag.width;
        }
    }, {
        key: "getHeight",
        value: function getHeight() {
            return this.canvasTag.height;
        }
    }, {
        key: "getContext2D",
        value: function getContext2D() {
            return this.ctx;
        }

        // 清空畫布

    }, {
        key: "clearCanvas",
        value: function clearCanvas() {
            this.ctx.clearRect(0, 0, this.canvasTag.width, this.canvasTag.height);
        }

        // 畫點

    }, {
        key: "drawPoint",
        value: function drawPoint(x, y) {
            this.ctx.strokeStyle = this.DEFAULT_LINE_COLOR;
            this.ctx.fillStyle = this.DEFAULT_POINT_COLOR;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 7, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.fill();
        }

        // 畫空心點

    }, {
        key: "drawHollowPoint",
        value: function drawHollowPoint(x, y, color) {
            this.ctx.strokeStyle = color === undefined ? this.DEFAULT_LINE_COLOR : color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.stroke();
            // this.ctx.fill();
        }

        // 畫實心點

    }, {
        key: "drawFilledPoint",
        value: function drawFilledPoint(x, y, color) {
            this.ctx.strokeStyle = "rgba(0,0,0,0)";
            this.ctx.fillStyle = color === undefined ? this.DEFAULT_LINE_COLOR : color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 7, 0, 2 * Math.PI);
            this.ctx.stroke();
            this.ctx.fill();
        }

        // 畫線

    }, {
        key: "drawLine",
        value: function drawLine(startPosition, endPosition) {
            var startX = startPosition[0],
                startY = startPosition[1];
            var endX = endPosition[0],
                endY = endPosition[1];

            this.ctx.strokeStyle = this.DEFAULT_LINE_COLOR;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
    }]);

    return CanvasUtil;
}();

exports.default = new CanvasUtil();
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _LoadingBar = require('./LoadingBar');

var _LoadingBar2 = _interopRequireDefault(_LoadingBar);

var _CanvasUtil = require('./CanvasUtil');

var _CanvasUtil2 = _interopRequireDefault(_CanvasUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @author alsk1369854@gmail.com
 */
var KMeans = function () {
    /**
     * 
     * @param {*} K type :Number 
     * @param {*} PositionList typeof :Array<[x:Number,y:Number]> 
     */
    function KMeans(K, positionList) {
        _classCallCheck(this, KMeans);

        // 可變參數
        this.MaxIterations = 100; // 最大回合數

        this.claculateMaxIterations = Math.floor(Math.pow(positionList.length, 0.5) * Math.pow(K, 0.5) / 2);
        this.MaxIterations = this.claculateMaxIterations; // 最大回合數

        // 基礎設置
        this.K = K;
        this.positionList = [].concat(_toConsumableArray(positionList));
        this.positionLength = this.positionList.length;

        // 所有未分類集合的邊界座標
        this.MAX_X = 0;
        this.MAX_Y = 0;
        this.MIN_X = 0;
        this.MIN_Y = 0;
        this.findMaxAndMinXY();

        // 存儲每個聚類核心位置
        this.kPositionList = [];
        this.initializeKPositionList();

        // 存儲每一輪被分類點歸屬於哪個聚類核心
        this.attributionList = [];
        this.initializeAttributionList();

        // 存算法執行狀態
        this.STATE_NEW = 'NEW'; // 尚未執行 start()
        this.STATE_RUNNING = 'RUNNING'; // 執行 start(), 正在進行計算
        this.STATE_DONE = 'DONE'; // 計算完畢
        this.state = this.NEW;

        // 存儲執行時間
        this.runTime = 0;

        // 存儲總平方偏差
        this.totalSquareDeviation = 0;
    }

    _createClass(KMeans, [{
        key: 'getKPositionList',
        value: function getKPositionList() {
            return this.kPositionList;
        }
    }, {
        key: 'getAttributionList',
        value: function getAttributionList() {
            return this.attributionList;
        }
    }, {
        key: 'getState',
        value: function getState() {
            return this.state;
        }
    }, {
        key: 'getRunTime',
        value: function getRunTime() {
            return this.runTime;
        }
    }, {
        key: 'getTotalSquareDeviation',
        value: function getTotalSquareDeviation() {
            return this.totalSquareDeviation;
        }

        // 找出所有點的極限位置

    }, {
        key: 'findMaxAndMinXY',
        value: function findMaxAndMinXY() {
            var MaxX = Number.MIN_SAFE_INTEGER;
            var MaxY = Number.MIN_SAFE_INTEGER;
            var MinX = Number.MAX_SAFE_INTEGER;
            var MinY = Number.MAX_SAFE_INTEGER;
            this.positionList.map(function (postion) {
                var x = postion[0],
                    y = postion[1];

                if (x > MaxX) MaxX = x;
                if (y > MaxY) MaxY = y;
                if (x < MinX) MinX = x;
                if (y < MinY) MinY = y;
            });
            this.MAX_X = MaxX;
            this.MAX_Y = MaxY;
            this.MIN_X = MinX;
            this.MIN_Y = MinY;
        }

        // 初始化K座標

    }, {
        key: 'initializeKPositionList',
        value: function initializeKPositionList() {
            for (var i = 0; i < this.K; i++) {
                var x = Math.random() * (this.MAX_X - this.MIN_X) + 1 + this.MIN_X;
                var y = Math.random() * (this.MAX_Y - this.MIN_Y) + 1 + this.MIN_Y;
                this.kPositionList.push([x, y]);
            }
        }

        // 初始化歸屬清單

    }, {
        key: 'initializeAttributionList',
        value: function initializeAttributionList() {
            this.attributionList = [];
            for (var i = 0; i < this.K; i++) {
                this.attributionList.push([]);
            }
        }

        // 機算兩點間的距離

    }, {
        key: 'claculateTheDistanceBetweenTwoOption',
        value: function claculateTheDistanceBetweenTwoOption(positionOne, positionTwo) {
            var oneX = positionOne[0],
                oneY = positionOne[1];
            var twoX = positionTwo[0],
                twoY = positionTwo[1];

            return Math.sqrt(Math.pow(twoX - oneX, 2) + Math.pow(twoY - oneY, 2));
        }

        // Just Sleep

    }, {
        key: 'sleep',
        value: function sleep(sleepTime) {
            return new Promise(function (r) {
                return setTimeout(r, sleepTime);
            });
        }

        // 開始計算

    }, {
        key: 'start',
        value: async function start() {
            var _this = this;

            // 更改生命週期裝態為計算中
            this.state = this.STATE_RUNNING;
            // 初始化執行時間，計算開始的時間
            var startTime = new Date();

            // 紀錄上一次的總平方偏差(用於判斷算法是否收斂了)
            var preveiusTotalSquareDeviation = Number.MIN_SAFE_INTEGER;

            var _loop = async function _loop() {
                // 驗算法已收斂跳出迴圈
                if (_this.totalSquareDeviation === preveiusTotalSquareDeviation) return 'break';
                // 更新上一次的總平方偏差
                preveiusTotalSquareDeviation = _this.totalSquareDeviation;
                // 重置總平方偏差
                _this.totalSquareDeviation = 0;
                // 重置歸屬清單
                _this.initializeAttributionList();

                // 計算每個點的歸屬
                _this.positionList.map(function (position) {
                    // 初始化歸屬點位
                    var attributionIndex = 999;
                    // 初始話最小點為差
                    var minDistance = Number.MAX_SAFE_INTEGER;
                    // 計算與每個核心的距離
                    for (var i = 0; i < _this.kPositionList.length; i++) {
                        var distance = _this.claculateTheDistanceBetweenTwoOption(_this.kPositionList[i], position);
                        // 如果找出最短距離的核心
                        if (distance < minDistance) {
                            minDistance = distance;
                            attributionIndex = i;
                        }
                    }
                    _this.totalSquareDeviation += minDistance;
                    // 添加歸屬點為到核心下
                    _this.attributionList[attributionIndex].push(position);
                });

                // 計算新的核心位置
                for (var i = 0; i < _this.kPositionList.length; i++) {
                    // 計算單個核心歸屬的 X Y 總和 return [numX, numY]
                    var sumXY = _this.attributionList[i].reduce(function (previousValue, currentValue) {
                        previousValue[0] += currentValue[0];
                        previousValue[1] += currentValue[1];
                        return previousValue;
                    }, [0, 0]);
                    // 被歸屬到核心的點總數
                    var kListLength = _this.attributionList[i].length;
                    // 重新定位核心
                    _this.kPositionList[i] = [sumXY[0] / kListLength, sumXY[1] / kListLength];
                }

                // Start 讀條更新 (可刪) ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
                var newPercent = Math.floor((_this.claculateMaxIterations - _this.MaxIterations) / _this.claculateMaxIterations * 100);
                _LoadingBar2.default.setPersent(newPercent);
                await _this.sleep(1);
                // Start 讀條更新 (可刪) ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

                // Start 畫當前計算解果 (可刪) ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
                var COLOR_0 = '#669cd1';
                var COLOR_1 = '#cca3bb';
                var COLOR_2 = '#95bfb2';
                var COLOR_3 = '#d6b27c';
                var COLOR_4 = '#9e826c';
                var COLOR_LIST = [COLOR_0, COLOR_1, COLOR_2, COLOR_3, COLOR_4];
                // 清空畫布
                _CanvasUtil2.default.clearCanvas();

                var _loop2 = function _loop2(_i) {
                    // 畫每個歸類點到此聚類的點
                    _this.attributionList[_i].map(function (position) {
                        var x = position[0],
                            y = position[1];

                        _CanvasUtil2.default.drawHollowPoint(x, y, COLOR_LIST[_i]);
                    });
                    // 畫聚類核心
                    var _kPositionList$_i = _this.kPositionList[_i],
                        x = _kPositionList$_i[0],
                        y = _kPositionList$_i[1];

                    _CanvasUtil2.default.drawFilledPoint(x, y, COLOR_LIST[_i]);
                };

                for (var _i = 0; _i < _this.kPositionList.length; _i++) {
                    _loop2(_i);
                }
                if (_this.isSlow) {
                    await _this.sleep(500);
                }
                // End 畫當前計算解果 (可刪)  ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
            };

            while (this.MaxIterations-- > 0) {
                var _ret = await _loop();

                if (_ret === 'break') break;
            }
            // Start 讀條更新 (可刪) ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
            _LoadingBar2.default.setPersent(100);
            // Start 讀條更新 (可刪) ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

            // 計算結束時間
            var endTime = new Date();
            this.runTime = Math.round((endTime - startTime) / 1000);
            // 運行完成機算後的回調函數
            this.done();
            // 更改生命週期裝態為完成計算
            this.state = this.STATE_DONE;
        }

        /**
         * @description 演算法計算完成後自動呼叫，透過改寫此函數來設定結果的顯示
         */

    }, {
        key: 'done',
        value: function done() {}
    }]);

    return KMeans;
}();

exports.default = KMeans;
},{"./CanvasUtil":2,"./LoadingBar":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @description 畫面讀條操作工具
 * @author alsk1369854@gmail.com
 */
var LoadingBar = function () {
    function LoadingBar() {
        _classCallCheck(this, LoadingBar);

        this.loadingBarTag = document.getElementById('loadingBar');
        this.loadingPercentTag = document.getElementById('loadingPercent');
        this.loadingLineTag = document.getElementById('loadingLine');
    }

    _createClass(LoadingBar, [{
        key: 'setPersent',
        value: function setPersent(newPercent) {
            this.loadingPercentTag.innerHTML = newPercent;
            this.loadingLineTag.style.width = newPercent + '%';

            // const copyPercentBarTag = this.loadingPercentBarTag.cloneNode()
            // const copyLineTag = this.loadingLineTag.cloneNode()
            // this.loadingPercentTag.innerHTML = newPercent
            // copyLineTag.style.width = `${newPercent}%`

            // var fragment = document.createDocumentFragment();
            // fragment.appendChild(copyPercentBarTag)
            // fragment.appendChild(copyLineTag)

            // this.loadingBarTag.removeChild(this.loadingPercentBarTag)
            // this.loadingBarTag.removeChild(this.loadingLineTag)
            // this.loadingBarTag.appendChild(fragment)

            // this.loadingPercentBarTag = copyPercentBarTag
            // this.loadingLineTag = copyLineTag
        }
    }]);

    return LoadingBar;
}();

exports.default = new LoadingBar();
},{}]},{},[1]);

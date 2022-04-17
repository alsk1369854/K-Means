/**
 * @description 畫面讀條操作工具
 * @author alsk1369854@gmail.com
 */
class LoadingBar {
    constructor() {
        this.loadingBarTag = document.getElementById('loadingBar')
        this.loadingPercentTag = document.getElementById('loadingPercent')
        this.loadingLineTag = document.getElementById('loadingLine')
    }

    setPersent(newPercent){
        this.loadingPercentTag.innerHTML = newPercent
        this.loadingLineTag.style.width = `${newPercent}%`

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
}
export default new LoadingBar()
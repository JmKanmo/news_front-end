import {DataModel} from "../DataModel.js";

/**
 * TODO 설계 후에, 지속적 수정 필요
 */
export class News extends DataModel {

    constructor(news) {
        super(news);
        this.dataKeys = Object.keys(this);

        this.dataKeys.forEach(keyName => {
            switch (keyName) {
                default:
                    this[keyName] = this.setStringByKey(keyName);
                    break;
            }
        });
    }
}
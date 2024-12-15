import MainController from "../MainController.js";

export default class NewsController extends MainController {
    constructor() {
        super();
        this.REQ_PATH = API_PATH.NEWS;
    }

    init() {
    }
}
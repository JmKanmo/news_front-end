/**
 * 기본 레이아웃 템플릿 경로
 * @type {object}
 */
const TEMPLATE_LAYOUT = Object.freeze({
    NAV: './src/template/layout/nav-tpl.html',
    MENU: './src/template/layout/mainMenu-tpl.html',
    CONTENT: './src/template/layout/content-tpl.html',
    FOOTER: './src/template/layout/footer-tpl.html',
});

const TEMPLATAE_INFO = Object.freeze({
    LIST: './src/template/menu/dataTableList-tlp.html',//공통으로 사용'
    VIEW: './src/template/menu/view-default-tpl.html',//공통으로 사용
});

export {
    TEMPLATE_LAYOUT,
    TEMPLATAE_INFO
};
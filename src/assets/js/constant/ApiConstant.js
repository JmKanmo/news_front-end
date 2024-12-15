const API_PATH = Object.freeze({
    URL: (location.origin === 'https://www.zlzzlz-resource.info:8600/news') ?
        'https://www.zlzzlz-resource.info:8600/news' : // 운영
        'http://localhost:8500/news' // 로컬
    ,

    NEWS: { // 뉴스

    },

    AUTH: { // 인증

    },

    PAGINATION: { // 페이지네이션
        CLIENT_SIDE: 'clientSide',
        SERVER_SIDE: 'serverSide',
        URL: 'pagination'
    }
});

export {API_PATH}
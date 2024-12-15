const AppInfoPrint = () => {
    const appInfo = {
        name: 'News Web (Front-End)',
        version: null,
        date: null,
        author: 'jmkanmo',
        history: [// m : minor , c : critical
            /*
            '1.00.0000'|'2024.12.15'|'1차 커밋'
            */
            {
                v: '1.00.0000', d: '2024.12.15', m: [
                    '[뉴스 웹사이트:1.00.0000] : 1차 커밋'
                ]
            }
        ]
    }

    console.info("████████████████████████████████████████████████████████████████████████████████████");
    console.info("███    ███ ███████ ██    ██ ███████     ██     ██      ██████  ██████  ██      ██████ ");
    console.info("████  ████ ██      ██    ██ ██          ████   ██      ██   ██ ██   ██ ██      ██   ██");
    console.info("██ ████ ██ █████   ██    ██ █████       ██ ██  ██      ██   ██ ██████  ██      ██████ ");
    console.info("██  ██  ██ ██       ██  ██  ██          ██  ██ ██      ██   ██ ██   ██ ██      ██   ██");
    console.info("██      ██ ███████   ████   ███████     ██   ████      ██████  ██   ██ ███████ ██████ ");
    console.info("████████████████████████████████████████████████████████████████████████████████████");

    try {
        Object.keys(appInfo).forEach((keyName, idx, arr) => {

            const version = appInfo.history[appInfo.history.length - 1].v;
            if (keyName === 'history') {
                console.info(`[${keyName}] ====================================================================================`);
                const history = appInfo[keyName].pop();
                if (typeof history.m === 'object' && history.m?.length) {
                    history.m.forEach((msg) => {
                        if (msg.indexOf(version) >= 0) {
                            console.log(`%c|| memo : ${msg}`, "color:red;font-weight:bold");
                        } else {
                            console.log(`|| memo : ${msg}`);
                        }
                    })
                } else {
                    console.info(`|| memo : ${history.m}`);
                }
                console.info(`=============================================================================================`);
            } else if (keyName === 'version') {
                console.info(`[${keyName}] : ${version}`);
            } else if (keyName === 'date') {
                console.info(`[${keyName}] : ${appInfo.history[appInfo.history.length - 1].d}`);
            } else {
                console.info(`[${keyName}] : ${appInfo[keyName]}`);
            }
        });
    } catch (excp) {
        console.error(excp);
    }
}

const fetch = require('node-fetch');
const puppeteer = require('puppeteer');
const config = require('./config');
const scrapeScoreboard = require('./scripts/scrape-scoreboard');
const login = require('./scripts/login');

if (!process.argv[2] || parseInt(process.argv[2], 10) === 'NaN') {
    throw('Week number required');
}

const week = process.argv[2];

async function run() {
    const browser = await puppeteer.launch({
        // headless: false
    });

    const page = await browser.newPage();

    await page.goto(`http://games.espn.com/ffl/signin?redir=http%3A%2F%2Fgames.espn.com%2Fffl%2Fscoreboard%3FleagueId%3D${config.leagueId}%26matchupPeriodId%3D${week}`);

    const mainFrame = page.mainFrame();

    let loginFrame = null;

    for (let frame of mainFrame.childFrames()) {
        if (frame.url().match('https://cdn.registerdisney.go.com')) {
            loginFrame = frame;
        }
    }

    if (loginFrame) {
        const loggedIn = await loginFrame.evaluate(login, config.username, config.password);

        const navigation = await page.waitForNavigation();

        if (navigation.url.match('scoreboard')) {
            const results = await page.evaluate(scrapeScoreboard, week);

            console.log(results);

            const payload = {
                emojii: config.slack.emojii,
                username: config.slack.username,
                text: results
            };

            // Send to Slack
            fetch(config.slack.hookUrl, {
                method: 'POST',
                body: JSON.stringify(payload)
            })
                .then((res) => res)
                .then((data) => {
                    browser.close();
                    process.exitCode = 0;
                })
                .catch((e) => {
                    browser.close();
                    process.exitCode = 1;
                })
        }
    } else {
        browser.close();
        process.exitCode = 1;
    }
}

try {
    run();
} catch(e) {
    throw(e);
    process.exitCode = 1;
}
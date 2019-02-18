const Tokio = require('tokio');
const puppeteer = require('puppeteer');
var fs = require('fs');

function getPages(pageNumber) {
    return new Promise(function (resolve, reject) {
        let arr = [];
        const tokio = new Tokio({
            url: 'https://www.olx.ua/uk/elektronika/kompyutery-i-komplektuyuschie/?page=' + pageNumber
        });
        tokio.fetch().then(html => {
            const $ = tokio.query(html);
            $('.lheight22 a').each(function () {
                var link = $(this).attr('href');
                arr.push({
                    "link": link
                });
            });
            resolve(arr);
        });
    });
}

function getInfo(url) {
    return new Promise(async function (resolve, reject) {
        resolve(scrape(url));
    });
}

let scrape = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        await page.goto(url.link);
        await page.click('.link-phone');

    } catch (error) {
        browser.close();
        let res = {
            title: "title",
            phone: "phone",
            price: "price"
        }
        return res;
    }
    await page.waitFor(300);
    const result = await page.evaluate(() => {
        let title = document.querySelector('h1').innerText;
        let phone = document.querySelector('.link-phone').innerText;
        let price = document.querySelector('.price-label strong').innerText;
        let res = {
            title: title,
            phone: phone,
            price: price
        }
        return res;
    });

    browser.close();
    return result;
};


async function main() {
    var urls = []
    for (let pageNumber = 1; pageNumber <= 6; pageNumber++) {
        urls.push(await getPages(pageNumber));
    }
    let infos = [];
    for (let i = 0; i < urls.length; i++) {
        for (let j = 0; j < urls[i].length; j++) {
            infos.push(await getInfo(urls[i][j]));
            console.log(`arr ${j} - ${infos[j]}`);
        }
    }
    fs.writeFileSync('output.json', JSON.stringify(infos))
    console.log("Done");
}

main();
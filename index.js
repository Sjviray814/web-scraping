import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import Character from './Character.js';
import PreCharacter from './PreCharacter.js'

async function getData(){
    const browser = await puppeteer.launch();
    
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://genshin-impact.fandom.com/wiki/Wishes/History');
    const pageData = await page.evaluate(() => {
        return {
            html: document.documentElement.innerHTML,
            width: document.documentElement.clientWidth,
        };
    });

    

    const $ = cheerio.load(pageData.html);


    const banners = [];
    // $(".sortable").first().children("tbody").children("tr").children("td").children('a').each(function(){
    //     $(this).text() ? banners.push($(this).text()) : null;
    // });


    $(".sortable").first().children("tbody").children("tr").each(function(i, tr){
        let title = '';
        let characters = [];

        // FOR FIRST TD:
        if($(tr).children("td").children('a').text()){
            title = $(tr).children("td").children('a').text();
        } 

        // FOR SECOND TD:
        if($(tr).children("td").children('.mobileHide')){
            // $(tr).children("td").children('.mobileHide').each(function(k, td){
            //     $(td).children('a').text() ? characters.push($(td).children('a').text()) : null;
            // })
            $(tr).children("td").children('.card_5').each(function(k, card_5){
                characters.push(
                    new PreCharacter(
                        $(card_5).children('.card_image').children('a').attr('title'),
                        5,
                        $(card_5).children('.card_image').children('a').children('img').attr('data-src')
                    )
                )
            })
            $(tr).children("td").children('.card_4').each(function(k, card_4){
                characters.push(
                    new PreCharacter(
                        $(card_4).children('.card_image').children('a').attr('title'),
                        4,
                        $(card_4).children('.card_image').children('a').children('img').attr('data-src')
                    )
                )
            })
        }


        banners.push({
            title,
            characters
        })

    });

    await browser.close();

    console.log(banners);
};

getData().then(banners => {
    let characterMap = new Map();
    for(let banner of banners){
        let bannerTitle = banner.title.split(' ')
        bannerTitle.pop();
        bannerTitle = bannerTitle.join(' ')
        let bannerDate = banner.title.split(' ').at(-1);
        for(let precharacter of banner.characters){
            let currentName = precharacter.name;
            if(characterMap.has(currentName)){
                characterMap.get(currentName).addBanner(bannerTitle, bannerDate);
            }
            else{
                characterMap.set(currentName, new Character(currentName, precharacter.rarity, precharacter.url));
                characterMap.get(currentName).addBanner(bannerTitle, bannerDate);
            }
        }
    }
    let characterObjects = [];
    for(let [key,value] of characterMap){
        value.findLatestBanner();

        // Checks if the latest banner date is actually a date and not '2.8'
        if(value.latestBannerDate.length > 5){
            characterObjects.push({
                'name': value.name,
                'latestBannerDate': value.latestBannerDate,
                'rarity': value.rarity,
                'url': value.url
            });
        }
    }
    characterObjects.sort((a, b) => (a.latestBannerDate > b.latestBannerDate) ? 1 : -1);
    console.log(characterObjects);
})

export default class Character{
    constructor(name, rarity, url){
        this.name = name;
        this.banners = [];
        this.latestBannerDate = '';
        this.rarity = rarity;
        this.url = url;
    }
    addBanner(title, date){
        this.banners.push({
            'title': title,
            'date': date
    })
    }
    findLatestBanner(){
        let latestBanner = {}
        for(let banner of this.banners){
            if(!latestBanner.date){
                latestBanner = banner;
            } 
            if(banner.date > latestBanner.date){
                latestBanner = banner;
            }
        }
        this.latestBannerDate = latestBanner.date;
    }
}
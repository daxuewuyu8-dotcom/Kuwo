/******** 智能识别版 final.js ********/

let body = $response.body;
let url = $request.url;

// 根据请求 URL 判断 App
let app = "";
if (/kuwo/.test(url)) app = "kuwo";
else if (/music\.163/.test(url)) app = "netease";
else if (/qqmusic/.test(url)) app = "qqmusic";

// 广告规则和 VIP 字段
const adRules = {
    "kuwo": ["ad","ads","advert","banner","splash","promotion"],
    "netease": ["ad","ads","promotion","banner"],
    "qqmusic": ["ad","ads","banner","promotion"]
};
const vipRules = {
    "kuwo": ["vip","isVip","vipLevel","vipType"],
    "netease": ["vip","isVip","vipLevel"],
    "qqmusic": ["vip","isVip","vipLevel","vipType"]
};

function safeParse(str){ try{return JSON.parse(str);}catch{return null;} }
function safeStringify(obj){ try{return JSON.stringify(obj);}catch{return "";} }

function process(obj){
    if(!obj || typeof obj!=="object") return;
    let ads = adRules[app] || [];
    let vips = vipRules[app] || [];
    for(let k in obj){
        let lower = k.toLowerCase();
        if(ads.some(x=>lower.includes(x))) delete obj[k];
        if(vips.some(x=>lower.includes(x))) obj[k] = true;
        if(typeof obj[k]==="object") process(obj[k]);
    }
}

let obj = safeParse(body);
if(obj){
    process(obj);

    // 用户接口加 VIP 标识
    if(/user|profile/.test(url)) {
        obj.isVip = true;
        obj.vip = 1;
    }

    // 广告接口直接清空
    if(/advert|ad/.test(url)) obj={};

    body = safeStringify(obj);
}

$done({body});
var storageKey = '_historyofclosedtabs_';
var urlsCache = {urls:{},length:0};
var urlsOfLastClosedWindow = [];

chrome.tabs.query({},function(tabs){
    for(var i = 0;i < tabs.length;i++){
        if(!tabs[i].pinned){
            urlsCache.urls[tabs[i].id] = tabs[i].url;
            urlsCache.length++;
        }
    }
});

chrome.storage.local.get(storageKey,function(items){
    if(items[storageKey]!=undefined&&items[storageKey].length>0){
        chrome.browserAction.setBadgeBackgroundColor({color: [208, 0, 24, 255]});
        chrome.browserAction.setBadgeText({text: items[storageKey].length.toString()});
    }
});

chrome.browserAction.onClicked.addListener(function(){
    chrome.storage.local.get(storageKey,function(items){
        if(items[storageKey]!=undefined){
            for(var i = items[storageKey].length-1;i>=0;i--){
                chrome.tabs.create({url:items[storageKey][i]});
            }
            chrome.storage.local.remove(storageKey);
            chrome.browserAction.setBadgeText({text: ""});
        }
    });
});

chrome.tabs.onRemoved.addListener(function(tid,info){
    if(info.isWindowClosing===true){
        if(urlsCache.urls[tid]!=undefined){
            urlsOfLastClosedWindow.push(urlsCache.urls[tid]);
            chrome.browserAction.setBadgeBackgroundColor({color: [208, 0, 24, 255]});
            chrome.browserAction.setBadgeText({text: urlsOfLastClosedWindow.length.toString()});
        }
    }
});

chrome.tabs.onCreated.addListener(function(tab){
    if(!tab.pinned){
        urlsCache.urls[tab.id] = tab.url;
        urlsCache.length +=1;
    }
});

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,newtab){
    if(!newtab.pinned){
        urlsCache.urls[tabId] = newtab.url;
    }else{
       if(urlsCache.urls[tabId]!=undefined){
            delete urlsCache.urls[tabId];
       }
    }
});

chrome.windows.onRemoved.addListener(function(){
    if(urlsOfLastClosedWindow.length > 0){
        var storageData = {};
        storageData[storageKey] = urlsOfLastClosedWindow;
        chrome.storage.local.set(storageData,function(s){
            urlsOfLastClosedWindow = [];
            //console.log(storageData);
        });
    }
});
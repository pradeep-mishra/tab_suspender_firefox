let tabs = { };
let timeoutCount = 5000;

browser.storage.local.get("timeoutCount").then(function(i){
	console.log('timeoutCount is', i.timeoutCount);
	timeoutCount = Number(i.timeoutCount);
});


browser.tabs.onCreated.addListener(function(tab){
	console.log('added tab', tab.id);
	if(!tabs[tab.id]){
		tabs[tab.id] = { };	
	}
	tabs[tab.id].tab = tab;
});

browser.tabs.onRemoved.addListener(function(tabId){
	if(tabs[tabId] && tabs[tabId].timeout){
		try{
			clearTimeout(tabs[tabId].timeout);
		}catch(e){
		}
	}
	tabs[tabId] = { };
	console.log('removed tabId', tabId);
});

browser.tabs.onActivated.addListener(function(tab){
	//tabs[i] = null;
	console.log('activated tab', tab.tabId);

	if(tabs[tab.tabId] && tabs[tab.tabId].timeout){
		try{
			clearTimeout(tabs[tab.tabId].timeout);
		}catch(e){
		}
		tabs[tab.tabId].timeout = null;
	}

	if(tab.previousTabId){

		console.log('adding timeout for suspending tab', tab.previousTabId);	

		if(!tabs[tab.previousTabId]){
			tabs[tab.previousTabId] = { };
		}
		tabs[tab.previousTabId].timeout = setTimeout(function(tabId){
			console.log('suspened tab', tabId);
			browser.tabs.discard(tabId);
		}, timeoutCount,tab.previousTabId);

	}	

})
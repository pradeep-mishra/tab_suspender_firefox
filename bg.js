let tabs = {};
let timeoutCount = 300000;
let suspendApp = "false";
let audible = "false";
let pinned = "false";
let whitelisted = "";

async function loadScript() {

	//var themeInfo = await browser.theme.getCurrent();
	//console.log('themeInfo', themeInfo)
	//let activeTab = await getCurrentTabId();
	//console.log('activeTab', activeTab)
	let currentWindow = await browser.windows.getLastFocused();
/*
	browser.theme.update({
		colors: {
			frame: '#fff',
			backgroundtext: '#000',
		}
	});
*/

	browser.storage.onChanged.addListener(function (i) {
		if (i.timeoutCount) {
			//console.log('timecount changed');
			timeoutCount = Number(i.timeoutCount.newValue);
		} else if (i.suspendApp) {
			//console.log('i.suspendApp', i.suspendApp)
			suspendApp = i.suspendApp.newValue == "true" ? "true" : "false";
			//console.log('suspendApp', suspendApp);
		} else if (i.audible) {
			audible = i.audible.newValue == "true" ? "true" : "false";
		} else if (i.pinned) {
			pinned = i.pinned.newValue == "true" ? "true" : "false";
		}
		else if (i.whitelisted) {
			whitelisted = i.whitelisted.newValue ;
			//console.log('whitelisted list updated')
		}
	});

	browser.storage.local.get("whitelisted").then(function (i) {
		if (i && i.whitelisted) {
			whitelisted = i.whitelisted ;
		}
	});

	browser.storage.local.get("timeoutCount").then(async function (i) {
		if (i && i.timeoutCount) {
			//console.log('timecount changed');
			timeoutCount = Number(i.timeoutCount);
		}
		var tabs = await browser.tabs.query({});
		tabs.forEach(async (tab) => {
			//console.log('tab.id', tab.id)
			if (!tabs[tab.id]) {
				tabs[tab.id] = {};
			}
			tabs[tab.id].tab = {
				id: tab.id,
				pinned: tab.pinned,
				audible: tab.audible
			};
			if (tab.active == true) {
				return true;
			}
			//console.log('tabs[tab.id].tab', tabs[tab.id].tab)
			setDiscardTimer(tab.id, tab.id);
		})
	});

	browser.storage.local.get("suspendApp").then(function (i) {
		if (i && i.suspendApp) {
			//console.log('timecount changed');
			suspendApp = i.suspendApp == "true" ? "true" : "false";
		}
	});

	browser.storage.local.get("audible").then(function (i) {
		if (i && i.audible) {
			//console.log('timecount changed');
			audible = i.audible == "true" ? "true" : "false";
		}
	});

	browser.storage.local.get("pinned").then(function (i) {
		if (i && i.pinned) {
			pinned = i.pinned == "true" ? "true" : "false";
		}
	});

	





	browser.tabs.onCreated.addListener(function (tab) {
		//console.log('added tab', tab.id);
		if (!tabs[tab.id]) {
			tabs[tab.id] = {};
		}
		tabs[tab.id].tab = tab;
	});

	browser.tabs.onRemoved.addListener(function (tabId) {
		if (tabs[tabId] && tabs[tabId].timeout) {
			try {
				clearTimeout(tabs[tabId].timeout);
			} catch (e) {}
		}
		tabs[tabId] = {};
		//console.log('removed tabId', tabId);
	});

	browser.tabs.onActivated.addListener(async function (tab) {
		//tabs[i] = null;
		//console.log('activated tab', tab.tabId);
		setDiscardTimer(tab.tabId, tab.previousTabId);
	});
}

async function setDiscardTimer(tabId, previousTabId) {
	if (tabs[tabId] && tabs[tabId].timeout) {
		try {
			clearTimeout(tabs[tabId].timeout);
		} catch (e) {}
		tabs[tabId].timeout = null;
	}

	if (suspendApp == "true") {
		return true;
	}

	if (previousTabId) {

		let isLive = await getTabValue(previousTabId, "live");
		if (isLive == "1") {
			return true;
		}

		let tabInfo = await browser.tabs.get(previousTabId);
		//console.log('previousTabId', previousTabId)
		//console.log('tabInfo', tabInfo)
		//console.log('pinned', pinned, tabInfo.pinned);
		//console.log('audible', audible, tabInfo.audible);

		if (audible == "true" && tabInfo && tabInfo.audible) {
			//console.log('tab is audible so cannot be discarded');
			return true;
		}
		if (pinned == "true" && tabInfo && tabInfo.pinned) {
			//console.log('tab is pinned so cannot be discarded');
			return true;
		}

		let thisHost = (new URL(document.URL)).host;
		if (whitelisted && whitelisted.includes(thisHost)) {
			//console.log('tab is whitelisted so cannot be discarded');
			return true;
		}

		//console.log('tab', previousTabId, 'will be suspnded after', (timeoutCount / 1000), 'seconds');

		if (!tabs[previousTabId]) {
			tabs[previousTabId] = {};
		}
		tabs[previousTabId].timeout = setTimeout(async function (tId) {
			if (suspendApp == "true") {
				return true;
			}
			//console.log('suspened tab', tabId);
			browser.tabs.discard(tId);
		}, timeoutCount, previousTabId);
	}
}

async function getCurrentTabId() {
	let tabArray = await browser.tabs.query({
		currentWindow: true,
		active: true
	});
	return tabArray[0].id;
}

async function getTabValue(tabId, key) {
	return await browser.sessions.getTabValue(tabId, key);
}

loadScript();
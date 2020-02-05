let tabs = {};
let timeoutCount = 300000;
let suspendApp = "false";

async function loadScript() {

	browser.storage.onChanged.addListener(function (i) {
		if (i.timeoutCount) {
			//console.log('timecount changed');
			timeoutCount = Number(i.timeoutCount.newValue);
		} else if (i.suspendApp) {
			//console.log('i.suspendApp', i.suspendApp)
			suspendApp = i.suspendApp.newValue == "true" ? "true" : "false";
			//console.log('suspendApp', suspendApp);
		}
	});

	browser.storage.local.get("timeoutCount").then(async function (i) {
		if (i && i.timeoutCount) {
			//console.log('timecount changed');
			timeoutCount = Number(i.timeoutCount);
		}
		var tabs = await browser.tabs.query({});
		tabs.forEach(async (tab) => {
			if (tab.active == true) {
				return true;
			}
			setDiscardTimer(tab.id, tab.id);
		})
	});

	browser.storage.local.get("suspendApp").then(function (i) {
		if (i && i.suspendApp) {
			//console.log('timecount changed');
			suspendApp = i.suspendApp == "true" ? "true" : "false";
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

	//console.log('suspendApp is', suspendApp)

	if (suspendApp == "true") {
		return true;
	}

	if (previousTabId) {

		let isLive = await getTabValue(previousTabId, "live");
		//console.log('isLive', isLive);

		if (isLive == "1") {
			//console.log('previous tab', previousTabId, 'is live can bee suspended');
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
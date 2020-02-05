async function loadScript() {
	let elmTimeoutSelect = document.getElementById("timeout_select");
	let elmSuspendAll = document.getElementById("suspend_all");
	let elmCurrentTab = document.getElementById("current_tab");

	let tabArray = await browser.tabs.query({
		currentWindow: true,
		active: true
	});
	let currentTabId = tabArray[0].id;
	//console.log('currentTabId', currentTabId);

	elmTimeoutSelect.addEventListener('change', function (e) {
		var elm = e.target;
		//console.log('changed to', elm.value);
		browser.storage.local.set({
			timeoutCount: elm.value
		});
	});

	elmCurrentTab.addEventListener('change', async function (e) {
		var elm = e.target;
		if (elm.checked == true) {
			browser.sessions.setTabValue(currentTabId, "live", "1");
			//console.log('setting tab seesion key live to 1');
		} else {
			browser.sessions.setTabValue(currentTabId, "live", "0");
			//console.log('setting tab seesion key live to 0');
		}
	});

	elmSuspendAll.addEventListener('change', function (e) {
		var elm = e.target;
		//console.log('changed to', elm.value);
		let val = "false";
		if (elm.checked == true) {
			val = "true";
		}
		//console.log('elm.checked', elm.checked)
		//console.log('sending suspend app val', val)
		browser.storage.local.set({
			suspendApp: val
		});
	});


	browser.storage.local.get("timeoutCount").then(function (i) {
		//console.log('ii', i)
		if (i && i.timeoutCount) {
			elmTimeoutSelect.value = i.timeoutCount;
		}
	});

	browser.storage.local.get("suspendApp").then(function (i) {
		if (i && i.suspendApp) {
			elmSuspendAll.checked = i.suspendApp == "true" ? true : false;;
		}
	});

	let liveVal = await getTabValue(currentTabId, "live");
	//console.log('current tab is live', liveVal);
	if (liveVal == "1") {
		elmCurrentTab.checked = true;
	}
}

async function getTabValue(tabId, key) {
	return await browser.sessions.getTabValue(tabId, key);
}

loadScript();
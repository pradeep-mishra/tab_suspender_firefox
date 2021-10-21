async function loadScript() {
	let elmTimeoutValue = document.getElementById("timeout_value");
	let elmTimeoutUnit = document.getElementById("timeout_unit");
	let elmSuspendAll = document.getElementById("suspend_all");
	let elmCurrentTab = document.getElementById("current_tab");
	let elmAudibleTab = document.getElementById("audible_tabs");
	let elmPinnedTab = document.getElementById("pinned_tabs");
	let elmWhitelistTab = document.getElementById("whitelist_tab");

	function detectUnit(value) {
		// const units = [1000, 60000, 3600000, 86400000]
		const units = Array.prototype.map.call(elmTimeoutUnit.children, optionElm => parseInt(optionElm.value, 10))
		units.sort((a,b) => a-b)
		let result = 1000
		for (const unit of units) {
			if (value % unit === 0) {
				result = unit
			} else {
				return result
			}
		}
		return  result
	}

	let tabArray = await browser.tabs.query({
		currentWindow: true,
		active: true
	});
	let currentTabId = tabArray[0].id;
	//console.log('currentTabId', tabArray[0]);

	elmWhitelistTab.addEventListener('change', function (e) {
		var elm = e.target;
		//console.log('changed to', elm.value, elm.checked);
		if (elm.checked == true) {
			browser.storage.local.get("whitelisted").then(function (i) {
				if (i) {
					browser.tabs.query({currentWindow: true, active: true})
					.then((tabs) => {
						let url = tabs[0].url;
						let whitelisted = i.whitelisted || "" ;
						//console.log('whl', whitelisted);
						let host =  String((new URL(url)).host);
						if(whitelisted.includes(host)){
							//console.log('not adding coz already there');
							return true;
						}
						whitelisted = whitelisted +  host + ';';
						//console.log('full ist is', whitelisted);
						browser.storage.local.set({
							whitelisted: whitelisted
						});
						//console.log('document.URL', url)
						//console.log(host , 'added in whitelist');
						//browser.storage.local.set({whitelisted:""})
					});
				}
			});

		}else{
			browser.storage.local.get("whitelisted").then(function (i) {
				if (i) {
					browser.tabs.query({currentWindow: true, active: true})
					.then((tabs) => {
						let url = tabs[0].url;
						let host =  String((new URL(url)).host);
						let whitelisted = i.whitelisted || "" ;
						//console.log('before', whitelisted);
						whitelisted = whitelisted.replace(host + ';','');
						browser.storage.local.set({
							whitelisted: whitelisted
						});
						//console.log(host , 'removed from whitelist');
						//console.log('full ist now', whitelisted);
					});
				}
			});
		}

	});

	elmPinnedTab.addEventListener('change', function (e) {
		var elm = e.target;
		//console.log('changed to', elm.value);
		let val = "false";
		if (elm.checked == true) {
			val = "true"
		}
		browser.storage.local.set({
			pinned: val
		});
	});

	elmAudibleTab.addEventListener('change', function (e) {
		var elm = e.target;
		//console.log('changed to', elm.value);
		let val = "false";
		if (elm.checked == true) {
			val = "true"
		}
		browser.storage.local.set({
			audible: val
		});
	});

	function updateTimeoutCount(e) {
		const unit = parseInt(elmTimeoutUnit.value, 10) || 60000
		const value = parseInt(elmTimeoutValue.value, 10) || 5
		browser.storage.local.set({
			timeoutCount: value * unit
		});
	}

	elmTimeoutUnit.addEventListener('change', updateTimeoutCount);
	elmTimeoutValue.addEventListener('change', updateTimeoutCount);

	elmCurrentTab.addEventListener('change', async function (e) {
		var elm = e.target;
		if (elm.checked == true) {
			browser.sessions.setTabValue(currentTabId, "live", "1");
			//console.log('setting tab session key live to 1');
		} else {
			browser.sessions.setTabValue(currentTabId, "live", "0");
			//console.log('setting tab session key live to 0');
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


	browser.storage.local.get("whitelisted").then(function (i) {
		//console.log('ii', i)
		if (i && i.whitelisted) {
			//console.log('full ist', i.whitelisted);
			browser.tabs.query({currentWindow: true, active: true})
			.then((tabs) => {
				let url = tabs[0].url;
				let host =  String((new URL(url)).host);
				if(i.whitelisted.includes(host)){
					elmWhitelistTab.checked = true;
					//console.log('tab is whitelisted', i.whitelisted);
				}
			});
		}
	});

	browser.storage.local.get("timeoutCount").then(function (i) {
		if (!i || !i.timeoutCount) {
			return;
		}
		const timeoutCount = i.timeoutCount
		const unit = detectUnit(timeoutCount)
		const value = timeoutCount/unit

		elmTimeoutUnit.value = unit
		elmTimeoutValue.value = value
	});

	browser.storage.local.get("suspendApp").then(function (i) {
		if (i && i.suspendApp) {
			elmSuspendAll.checked = i.suspendApp == "true" ? true : false;;
		}
	});

	browser.storage.local.get("audible").then(function (i) {
		if (i && i.audible) {
			elmAudibleTab.checked = i.audible == "true" ? true : false;;
		}
	});

	browser.storage.local.get("pinned").then(function (i) {
		if (i && i.pinned) {
			elmPinnedTab.checked = i.pinned == "true" ? true : false;;
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

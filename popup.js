async function loadScript() {
	let elmTimeoutSelect = document.getElementById("timeout_select");
	let elmSuspendAll = document.getElementById("suspend_all");
	let elmCurrentTab = document.getElementById("current_tab");
	let elmAudibleTab = document.getElementById("audible_tabs");
	let elmPinnedTab = document.getElementById("pinned_tabs");
	let elmWhitelistTab = document.getElementById("whitelist_tab");

	let elmWhitelistArrow = document.getElementById("whitelist_arrow");
	let elmWhitelistDiv = document.getElementById("whitelist_div");
	

	let eAppTitle = document.getElementById("app_title");
	let eSuspendAfter = document.getElementById("suspend_after");
	let eDoNotSuspendThis = document.getElementById("do_not_suspend_this");
	let eAddToWhitelist = document.getElementById("add_to_whitelist");
	let eIgnoreAudible = document.getElementById("ignore_audible");
	let eIgnorePinned = document.getElementById("ignore_pinned");
	let eDisableApp = document.getElementById("disable_app");


	eAppTitle.innerText = browser.i18n.getMessage("appTitle");
	eSuspendAfter.innerText = browser.i18n.getMessage("suspendAfter");
	eDoNotSuspendThis.innerText = browser.i18n.getMessage("doNotSuspendThisTab");
	eAddToWhitelist.innerText = browser.i18n.getMessage("addThisToWhitelist");
	eIgnoreAudible.innerText = browser.i18n.getMessage("ignoreAudible");
	eIgnorePinned.innerText = browser.i18n.getMessage("ignorePinned");
	eDisableApp.innerText = browser.i18n.getMessage("disableTabSuspender");

	let tabArray = await browser.tabs.query({
		currentWindow: true,
		active: true
	});
	let currentTabId = tabArray[0].id;
	//console.log('currentTabId', tabArray[0]);

	// whitelist accordion
	elmWhitelistArrow.addEventListener('click', function(e){
		if(elmWhitelistDiv.classList.contains('hidden')){
			elmWhitelistArrow.classList.remove('arrow-down');
			elmWhitelistArrow.classList.add('arrow-up');
			elmWhitelistDiv.classList.remove('hidden');

		}else{
			elmWhitelistDiv.classList.add('hidden')
			elmWhitelistArrow.classList.remove('arrow-up');
			elmWhitelistArrow.classList.add('arrow-down');
		}
	})


	elmWhitelistTab.addEventListener('change', function (e) {
		var elm = e.target;
		//console.log('changed to', elm.value, elm.checked);
		if (elm.checked == true) {
			browser.storage.local.get("whitelisted").then(function (i) {
				if (i) {
					browser.tabs.query({ currentWindow: true, active: true })
						.then((tabs) => {
							let url = tabs[0].url;
							let whitelisted = i.whitelisted || "";
							//console.log('whl', whitelisted);
							let host = String((new URL(url)).host);
							if (whitelisted.includes(host)) {
								//console.log('not adding coz already there');
								return true;
							}
							whitelisted = whitelisted + host + ';';
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

		} else {
			browser.storage.local.get("whitelisted").then(function (i) {
				if (i) {
					browser.tabs.query({ currentWindow: true, active: true })
						.then((tabs) => {
							let url = tabs[0].url;
							let host = String((new URL(url)).host);
							let whitelisted = i.whitelisted || "";
							//console.log('before', whitelisted);
							whitelisted = whitelisted.replace(host + ';', '');
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
			elmWhitelistDiv.innerHTML = getWhitelistDivContents(i.whitelisted);
			browser.tabs.query({ currentWindow: true, active: true })
				.then((tabs) => {
					let url = tabs[0].url;
					let host = String((new URL(url)).host);
					if (i.whitelisted.includes(host)) {
						elmWhitelistTab.checked = true;
						//console.log('tab is whitelisted', i.whitelisted);
					}
				});		
			setTimeout(addClickOnWhitelistDelete,50)	
		}
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

	function onWhitelistDelete(e){
		let host = e.target.getAttribute('data-host')
		if(host && host.trim()){
			browser.storage.local.get("whitelisted").then(function (i) {
				//console.log('ii', i)
				if (i && i.whitelisted && i.whitelisted.includes(host.trim() + ';')) {
					let whitelisted = i.whitelisted.replace(host.trim() + ';', '');
					browser.storage.local.set({
						whitelisted: whitelisted
					});
					elmWhitelistDiv.innerHTML = getWhitelistDivContents(whitelisted);
					setTimeout(addClickOnWhitelistDelete,100)
				}
			});
		}	
	}

	function addClickOnWhitelistDelete(){
		let elements = document.getElementsByClassName('whitelist-del-icon')
			Array.from(elements).forEach(function(element) {
				element.addEventListener('click', onWhitelistDelete);
			});
	}


}

async function getTabValue(tabId, key) {
	return await browser.sessions.getTabValue(tabId, key);
}



function getWhitelistDivContents(whitelist){
	let content = '<ul>'
	if(whitelist){
		const hosts = whitelist.split(';').filter((i)=>i.trim())
		for(let i=0;i<hosts.length;i++){
			content += `<li>
										<span class="whitelist-item-title">${hosts[i]}</span>
										<span data-host="${hosts[i]}" style="float:right" class="whitelist-del-icon" >
											<svg data-host="${hosts[i]}" width="12" height="12" viewBox="0 0 12 12" fill="none" class="" name="Delete">
												<path data-host="${hosts[i]}" d="M1.5 7v3.5c0 .825.675 1.5 1.5 1.5h6c.825 0 1.5-.675 1.5-1.5V7h-9zM9 3V2 1a1 1 0 00-1-1H4a1 1 0 00-1 1v2H0v2h12V3H9zM7 3H5V2h2v1z" fill="#718096"></path>
											</svg>
										</span>
									</li>`
		}
	}
	content += '</ul>'
	return content;
}

loadScript();
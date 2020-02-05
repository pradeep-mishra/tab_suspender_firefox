


document.getElementById("timeout_select").addEventListener('change',function(e){
	var elm = e.target;
	console.log('changed to', elm.value);
	browser.storage.local.set({
	  timeoutCount:  elm.value
	});
});

browser.storage.local.get("timeoutCount").then(function(i){
	document.getElementById("timeout_select").value = i.timeoutCount;
});
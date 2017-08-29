var openTabs = new Map();
var openURLs = new Map(); // js Map doesn't have "containsValue" so gotta do a reverse mapping as well.
//thought it might but since it doesn't, could use a named array too. openTabs[url] = id

/*
	rundown:
	1. log opening tab into openTabs array/object/whatever it is
	2. before opening a link, compare it to openTabs
	3. if it exists in openTabs, then:
		-get current tab index
		-move opened link onto index+1 tabs
		-close the tab that was supposed to open
		-modify the openTabs to reflect the new tabId's
	4. if it doesn't exist, goto 1.
*/
function checker(event){
	// console.log("check", event);
	let url = event.url;

	if (openTabs.has(url)) {

		//remove asap to avoid flickering tab bar
		browser.tabs.remove(event.tabId);

		var gettingActiveTab = browser.tabs.get(event.sourceTabId); // could use tabs.getCurrent() too

		gettingActiveTab.then((activeTabInfo) => {			

			browser.tabs.move(openTabs.get(url), {
				index: activeTabInfo.index+1,// the spot to move the opened tab to
			});

		}, (err) => console.error("gettingActiveTab err", err));

	} 
}

function addToOpen(event){
	// Not opening a tab but just going into a page. Need to remove the old URL from the lists
	if(openURLs.has(event.tabId)){
		// If you open a new page you are closing the old one but that doesn't trigger tabs.onRemoved, because it is not a tab closing of course.
		let url = openURLs.get(event.tabId);
		openTabs.delete(url); // Delete the key/value pair that held the "old URL -> old tabId". Next it'll get replaced by "new URL->old tabId"
	}
	openTabs.set(event.url, event.tabId);

	//overwrites, np.
	openURLs.set(event.tabId, event.url);
}

function closedTab(tabId){
	if (openURLs.has(tabId)) {
		let url = openURLs.get(tabId);
		openTabs.delete(url);
		openURLs.delete(tabId);
	}
}

browser.webNavigation.onCreatedNavigationTarget.addListener(checker);
browser.tabs.onRemoved.addListener(closedTab);
browser.webNavigation.onCompleted.addListener(addToOpen)


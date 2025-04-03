import cp from "chrome-promise";
import * as bookmarks from "./bookmarks.js";

chrome.tabs.onCreated.addListener(async (tab) => {
  if (!tab.id) return; // Early return if no tab ID

  // Listen for when the tab's status changes to 'complete'
  chrome.tabs.onUpdated.addListener(function onTabUpdated(updatedTabId, changeInfo, updatedTab) {
    // Make sure the updated tab is the one we just created
    if (updatedTabId !== tab.id) return; // Ignore other tabs
    if (changeInfo.status !== "complete") return; // Ignore if not fully loaded
    console.log("Tab fully loaded:", updatedTab);

    if (updatedTab.url && updatedTab.url.includes("chrome://new")) {
      const bookmark = bookmarks.pick();
      if (!bookmark) return;
      cp.tabs.update(updatedTab.id!, { url: bookmark.url });
    }

    chrome.tabs.onUpdated.removeListener(onTabUpdated);
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  chrome.runtime.openOptionsPage();
});
// Update list for all bookmarks changes
chrome.bookmarks.onCreated.addListener(bookmarks.load);
chrome.bookmarks.onChanged.addListener(bookmarks.load);
chrome.bookmarks.onMoved.addListener(bookmarks.load);
chrome.bookmarks.onRemoved.addListener(bookmarks.load);
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.bookmarks) {
    await bookmarks.load();
  }
});

bookmarks.load();
chrome.runtime.onMessage.addListener(async (request, sender, reply) => {
  if (request.type === "loadBookmark") {
    reply();
    const bookmark = bookmarks.pick();
    if (!sender?.tab?.id) {
      return;
    }
    if (bookmark) {
      await cp.tabs.update(sender.tab.id, {
        url: bookmark.url
      });
    } else {
      // In case we don't have a bookmark to use, we redirect to default newtab page
      await cp.tabs.update(sender.tab.id, { url: "chrome-search://local-ntp/local-ntp.html" });
    }
  }
});

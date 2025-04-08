import cp from "chrome-promise";
import * as bookmarks from "./bookmarks.js";

chrome.tabs.onCreated.addListener(async (tab) => {
  if (!tab.id) return; // Early return if no tab ID

  // Listen for when the tab's status changes to 'complete'
  chrome.tabs.onUpdated.addListener(function onTabUpdated(updatedTabId, changeInfo, updatedTab) {
    // Make sure the updated tab is the one we just created
    if (updatedTabId !== tab.id) return; // Ignore other tabs
    if (changeInfo.status !== "complete") return; // Ignore if not fully loaded

    if (
      // chrome and brave
      updatedTab.url === "chrome://newtab/" ||
      // vivaldi
      updatedTab.url?.includes("chrome://vivaldi-webui/startpage?") ||
      // opera
      updatedTab.url?.includes("chrome://startpageshared/")
    ) {
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

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== "install") return;

  const tree = await chrome.bookmarks.getTree();
  const allBookmarkIds: string[] = [];

  function collectIds(nodes: chrome.bookmarks.BookmarkTreeNode[]) {
    for (const node of nodes) {
      if (node.url) {
        allBookmarkIds.push(node.id);
      }
      if (node.children) {
        collectIds(node.children);
      }
    }
  }

  collectIds(tree);

  await chrome.storage.local.set({
    bookmarks: allBookmarkIds,
    visited: []
  });

  console.log(`Random Bookmark initialized with ${allBookmarkIds.length} selected bookmarks`);
});

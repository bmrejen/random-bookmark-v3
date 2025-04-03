import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

import { Tree } from "antd";
import "antd/es/tree/style";

import { FileOutlined, FolderOutlined } from "@ant-design/icons";
import "antd/dist/antd.js";
import { Spin, Input, Select } from "antd";
import cp from "chrome-promise";
import "./options.css";

const truncate = (str: string, options = { length: 60 }) => {
  if (str.length <= options.length) {
    return str;
  }
  return str.slice(0, options.length) + "...";
};

function faviconURL(u) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "32");
  return url.toString();
}

function renderTree(tree: chrome.bookmarks.BookmarkTreeNode[]): React.ReactNode[] {
  return tree
    .filter((i) => i)
    .map((node) => {
      if (node.children) {
        if (!node.title && !node.url) {
          return renderTree(node.children);
        }

        return (
          <Tree.TreeNode
            title={truncate(node.title, { length: 60 })}
            key={node.id}
            icon={<FolderOutlined />}
          >
            {renderTree(node.children)}
          </Tree.TreeNode>
        );
      }

      const icon = node.url ? (
        <img src={faviconURL(node.url)} alt="Favicon" style={{ width: 16, height: 16 }} />
      ) : (
        <FileOutlined />
      );

      return (
        <Tree.TreeNode
          selectable={false}
          title={<a href={node.url}>{truncate(node.title, { length: 60 })}</a>}
          key={node.id}
          icon={icon}
          style={{ display: "flex" }}
        />
      );
    });
}
const Application = () => {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [tree, setTree] = useState<chrome.bookmarks.BookmarkTreeNode[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([cp.bookmarks.getTree(), cp.storage.local.get({ bookmarks: [] })])
      .then(([tree, { bookmarks }]) => {
        setSelected(bookmarks);
        setTree(tree);
      })
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "1em" }}>
      {loading && (
        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Spin size="large" />
        </div>
      )}
      {!loading && (
        <>
          <h1>Random Bookmark Options:</h1>
          <p>
            This extension will redirect to one of the selected bookmarks when you open a new tab.
          </p>
          <h4>Active bookmarks</h4>
          <Tree
            checkable
            selectable={false}
            defaultCheckedKeys={selected}
            onCheck={async (selected) => {
              try {
                await cp.storage.local.set({
                  bookmarks: selected
                });
              } catch (error) {
                console.error(error);
              }
            }}
            showIcon
          >
            {renderTree(tree)}
          </Tree>
        </>
      )}
    </div>
  );
};

const MOUNT_NODE = document.getElementById("root");
if (!MOUNT_NODE) throw new Error("no root element found");
const root = ReactDOM.createRoot(MOUNT_NODE);
root.render(<Application />);

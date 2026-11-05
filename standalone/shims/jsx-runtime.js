// 新しい JSX の書き方を、UMD 版 React の createElement に読み替える
const React = window.React;
function jsx(type, props, key) {
  return React.createElement(type, key === undefined ? props : { ...props, key });
}
module.exports = { jsx, jsxs: jsx, Fragment: React.Fragment };

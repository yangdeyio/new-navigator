import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { parseBookmarksHtml, looksLikeBookmarksHtml } from '../src/utils/bookmarkHtml.js'

globalThis.DOMParser = class {
  parseFromString(html) {
    return new JSDOM(html).window.document
  }
}

const CHROME_EXPORT = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
  <DT><H3 ADD_DATE="1700000000">书签栏</H3>
  <DL><p>
    <DT><A HREF="https://example.com/" ADD_DATE="1700000000">根层级的链接</A>
    <DT><H3>学习</H3>
    <DL><p>
      <DT><A HREF="https://developer.mozilla.org/">MDN 文档</A>
    </DL><p>
    <DT><H3>购物</H3>
    <DL><p>
      <DT><A HREF="https://www.taobao.com/">淘宝</A>
      <DT><A HREF="javascript:void(0)">书签脚本</A>
    </DL><p>
  </DL><p>
</DL><p>`

test('parseBookmarksHtml maps folder names to categories', () => {
  const items = parseBookmarksHtml(CHROME_EXPORT)
  const 书签栏 = items.filter((i) => i.category === '书签栏')
  const 学习 = items.filter((i) => i.category === '学习')
  const 购物 = items.filter((i) => i.category === '购物')

  assert.equal(items.length, 4)
  // 书签栏根下的直属链接归入"书签栏"这个文件夹名
  assert.deepEqual(书签栏.map((i) => i.value), ['根层级的链接'])
  assert.deepEqual(学习.map((i) => i.value), ['MDN 文档'])
  assert.deepEqual(购物.map((i) => i.href), ['https://www.taobao.com/', 'javascript:void(0)'])
})

test('parseBookmarksHtml puts links outside any folder into 未分类', () => {
  const html = `<DL><p>
    <DT><A HREF="https://loose.com/">游离在文件夹外的链接</A>
    <DT><H3>工作</H3>
    <DL><p>
      <DT><A HREF="https://gitlab.com/">GitLab</A>
    </DL><p>
  </DL><p>`
  const items = parseBookmarksHtml(html)
  const loose = items.find((i) => i.href === 'https://loose.com/')
  assert.equal(loose.category, '未分类')
  assert.equal(items.find((i) => i.href === 'https://gitlab.com/').category, '工作')
})

test('parseBookmarksHtml handles DL as sibling of DT (alternate export format)', () => {
  const html = `<DL><p>
    <DT><H3>工作</H3>
    <DL><p>
      <DT><A HREF="https://gitlab.com/">GitLab</A>
    </DL><p>
  </DL><p>`
  const items = parseBookmarksHtml(html)
  assert.deepEqual(items, [{ category: '工作', href: 'https://gitlab.com/', value: 'GitLab' }])
})

test('parseBookmarksHtml returns empty array for HTML without bookmarks', () => {
  assert.deepEqual(parseBookmarksHtml('<html><body><p>nothing</p></body></html>'), [])
})

test('looksLikeBookmarksHtml distinguishes bookmark HTML from JSON', () => {
  assert.equal(looksLikeBookmarksHtml(CHROME_EXPORT), true)
  assert.equal(looksLikeBookmarksHtml('{"bookmarks":[]}'), false)
})

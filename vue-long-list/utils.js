export function getScrollTop(elem) {
  return 'scrollTop' in elem ? elem.scrollTop : elem.pageYOffset
}

export function getScroller (elem) {
  while (
    (elem = elem.parentNode) &&
    elem.tagName !== 'BODY' &&
    elem !== window
  ) {
    const { overflowY } = window.getComputedStyle(elem)

    if (overflowY === 'scroll' || overflowY === 'auto') {
      return elem
    }
  }
  return window
}

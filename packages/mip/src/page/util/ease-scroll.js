import {raf} from './dom'

export function scrollTop (height, { duration = 500, scroller = window } = {}) {
  let top = height
  let scrollTop = 0
  let $scrollPosition = document.querySelector('#mip-page-scroll-position')
  if ($scrollPosition) {
    scrollTop = -$scrollPosition.getBoundingClientRect().top
  } else {
    scrollTop = document.body.scrollTop || document.documentElement.scrollTop
  }

  if (top === scrollTop) {
    return Promise.resolve()
  }

  let rest = top - scrollTop
  let sign = rest > 0

  return new Promise(resolve => {
    transition(
      duration,
      t => {
        let delta = Math.ceil(t * rest)
        let toScroll = delta + scrollTop

        if ((sign && toScroll >= top) ||
          (!sign && toScroll <= top)
        ) {
          scroll(top, scroller)
          return false
        }

        scroll(toScroll, scroller)
        return true
      },
      () => {
        // 防止滚动过程没滚到位
        scroll(top, scroller)
        resolve()
      }
    )
  })
}

function transition (duration, step, callback) {
  let start = Date.now()

  raf(loop)

  function loop () {
    let now = Date.now() - start

    if (step(bezier(now, 0, 1, duration))) {
      raf(loop)
    } else {
      callback()
    }
  }
}

function bezier (t, b, c, d) {
  return 1.0042954579734844 * Math.exp(
      -6.4041738958415664 * Math.exp(-7.2908241330981340 * t / d)
  ) * c + b
}

function scroll (top, scroller = window) {
  if (scroller === window) {
    window.scrollTo(0, top)
  } else {
    scroller.scrollTop = top
  }
}

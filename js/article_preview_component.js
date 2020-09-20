(function(gsap, Popper, window, document) {

const ARTICLE_SELECTOR = ".article"

const SHARE_BUBBLE_SELECTOR = '.share-bubble'

const OPEN_SHARE_SELECTOR = '.open-share'
const CLOSE_SHARE_SELECTOR = '.close-share'

const SHARE_BUBBLE_INNER_SELECTOR = '.share-bubble__inner'
const SHARE_BUBBLE_CONTENT_SELECTOR = '.share-bubble__content'

const AUTHOR_SUBSECTION_SELECTOR = '.author-subsection'

const ANIMATION_DURATION = .2

const BORDER_RADIUS = '50px'

const SHARE_BUBBLE_OPENED = true
const SHARE_BUBBLE_CLOSED = false



function get_content_width (element) {
  const styles = getComputedStyle(element)

  return ( element.clientWidth
         - parseFloat(styles.paddingLeft)
         - parseFloat(styles.paddingRight)
         )
}



function get_content_height (element) {
  const styles = getComputedStyle(element)

  return ( element.clientHeight
         - parseFloat(styles.paddingTop)
         - parseFloat(styles.paddingBottom)
         )
}



/*
 * Assumptions:
 *   we assume that the ".share-bubble__inner" height and width are
 *   both set to zero.
 */
function open_share_bubble (articleComponent) {
  if (gsap === "undefined") {
    alert('I need gsap')
    return SHARE_BUBBLE_CLOSED
  }

  const shareBubble =
    articleComponent.querySelector(SHARE_BUBBLE_SELECTOR)
  const shareBubbleContent =
    articleComponent.querySelector(SHARE_BUBBLE_CONTENT_SELECTOR)
  const shareBubbleInner =
    articleComponent.querySelector(SHARE_BUBBLE_INNER_SELECTOR)
  const authorSubsection =
    articleComponent.querySelector(AUTHOR_SUBSECTION_SELECTOR)

  const timeline = gsap.timeline()
  timeline
    .set( shareBubble
        , { position: 'relative'
          }
        )
    .set( shareBubbleContent
        , { width:      authorSubsection.clientWidth
          , height:     authorSubsection.clientHeight
          , boxSizing: 'border-box'
          }
        )
    .set( authorSubsection
        , { position: 'absolute'
          }
        )
    .set( shareBubbleInner
        , { borderBottomRightRadius: BORDER_RADIUS }
        )
    .to( shareBubbleInner
       , { duration: ANIMATION_DURATION
         , ease:     'none'
         , width:    '100%'
         , height:   '100%'
         }
       )
    .to( shareBubbleInner
       , { duration:                ANIMATION_DURATION
         , borderBottomRightRadius: '0px'
         }
       )

  return SHARE_BUBBLE_OPENED
}



function close_share_bubble (articleComponent) {
  if (gsap === "undefined") {
    alert('I need gsap')
    return SHARE_BUBBLE_CLOSED
  }

  const shareBubble =
    articleComponent.querySelector(SHARE_BUBBLE_SELECTOR)
  const shareBubbleInner =
    articleComponent.querySelector(SHARE_BUBBLE_INNER_SELECTOR)
  const authorSubsection =
    articleComponent.querySelector(AUTHOR_SUBSECTION_SELECTOR)

  const timeline = gsap.timeline()
  timeline
    .to( shareBubbleInner
       , { duration:                ANIMATION_DURATION
         , borderBottomRightRadius: BORDER_RADIUS
         }
       )
    .to( shareBubbleInner
       , { duration: ANIMATION_DURATION
         , ease:     'none'
         , width:    '0%'
         , height:   '0%'
         }
       )
    .set( authorSubsection
        , { position: 'relative'
          }
        )
    .set( shareBubble
        , { position: 'absolute'
          }
        )

  return SHARE_BUBBLE_CLOSED
}



function open_share_bubble_popover
( articleComponent 
, set_popper_instance
) {
  if (Popper === "undefined") {
    console.log("I need Popper")
    return SHARE_BUBBLE_CLOSED
  }

  const shareBubble =
    articleComponent.querySelector(SHARE_BUBBLE_SELECTOR)
  const shareBubbleContent =
    articleComponent.querySelector(SHARE_BUBBLE_CONTENT_SELECTOR)
  const openShare =
    articleComponent.querySelector(OPEN_SHARE_SELECTOR)

  const modifiers =
    [ { name: 'offset'
      , options: { offset: [0, 10] }
      }
    ]

  const animate = () => {
    const timeline = gsap.timeline()
    timeline
      .set( shareBubble , { zIndex: 2 } )
      .from( shareBubble
           , { duration: ANIMATION_DURATION
             , scale: .1
             }
           )
  }

  set_popper_instance(
    Popper.createPopper
      ( openShare
      , shareBubble
      , { modifiers: modifiers
        , onFirstUpdate: animate
        }
      )
  )

  return SHARE_BUBBLE_OPENED
}



function close_share_bubble_popover 
(
  articleComponent
, popperInstance
, set_popper_instance
) {
  if (Popper === "undefined") {
    console.log("I need Popper")
    return SHARE_BUBBLE_OPENED
  }

  if (popperInstance) {
    const shareBubble =
      articleComponent.querySelector(SHARE_BUBBLE_SELECTOR)
    const timeline = gsap.timeline()
    timeline
      .to( shareBubble
         , { duration: ANIMATION_DURATION
           , scale: .1
           , onComplete: () => popperInstance.destroy()
           }
         )
      .set( shareBubble
          , { zIndex: 0 
            , clearProps: 'transform'
            }
          )
  }


  set_popper_instance(null)

  return SHARE_BUBBLE_CLOSED
}



function setupHandlers() {
  const articles = document.querySelectorAll(ARTICLE_SELECTOR)

  Array.prototype.forEach.call(articles, (article) => {
    const openShare = article.querySelector(OPEN_SHARE_SELECTOR)
    const closeShare = article.querySelector(CLOSE_SHARE_SELECTOR)

    let popperInstance = null
    let shareBubbleToggled = SHARE_BUBBLE_CLOSED

    const set_popper_instance = (instance) => popperInstance = instance

    const openShareBubble = 
      window.matchMedia('(min-width: 768px)').matches
        ? () => open_share_bubble_popover(article, set_popper_instance )
        : () => open_share_bubble(article)

    const closeShareBubble = 
      window.matchMedia('(min-width: 768px)').matches
        ? () => close_share_bubble_popover( article
                                          , popperInstance
                                          , set_popper_instance
                                          )
        : () => close_share_bubble(article)

    const toggleShareBubble = () => {
      if (shareBubbleToggled) {
        shareBubbleToggled = 
          window.matchMedia('(min-width: 768px)').matches
            ? close_share_bubble_popover
                ( article
                , popperInstance
                , set_popper_instance
                )
            : close_share_bubble(article)
      } else {
        shareBubbleToggled =
          window.matchMedia('(min-width: 768px)').matches
            ? open_share_bubble_popover(article, set_popper_instance )
            : open_share_bubble(article)
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      openShare.addEventListener('click', toggleShareBubble)
      closeShare.addEventListener('click', toggleShareBubble)
    })
  })
}


setupHandlers()
})( gsap, Popper, window, document )

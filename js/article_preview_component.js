(function(gsap, document) {
  const ARTICLE_SELECTOR = ".article"

  const SHARE_BUBBLE_SELECTOR = '.share-bubble'

  const OPEN_SHARE_SELECTOR = '.open-share'
  const CLOSE_SHARE_SELECTOR = '.close-share'

  const SHARE_BUBBLE_INNER_SELECTOR = '.share-bubble__inner'
  const SHARE_BUBBLE_CONTENT_SELECTOR = '.share-bubble__content'

  const AUTHOR_SUBSECTION_SELECTOR = '.author-subsection'

  const ANIMATION_DURATION = .25

  const BORDER_RADIUS = '50px'



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
    if (!gsap) {
      alert('I need gsap')
      return null
    }

    const shareBubble =
      articleComponent.querySelector(SHARE_BUBBLE_SELECTOR)
    const shareBubbleContent =
      articleComponent.querySelector(SHARE_BUBBLE_CONTENT_SELECTOR)
    const shareBubbleInner =
      articleComponent.querySelector(SHARE_BUBBLE_INNER_SELECTOR)

    const timeline = gsap.timeline()
    timeline.set( shareBubble
                , { zIndex: 2
                  }
                )
            .set( shareBubbleContent
                , { width:      get_content_width(shareBubble)
                  , height:     get_content_height(shareBubble)
                  , boxSizing: 'border-box'
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
  }



  function close_share_bubble (articleComponent) {
    if (!gsap) {
      alert('I need gsap')
      return null
    }

    const shareBubble =
      articleComponent.querySelector(SHARE_BUBBLE_SELECTOR)
    const shareBubbleInner =
      articleComponent.querySelector(SHARE_BUBBLE_INNER_SELECTOR)

    const timeline = gsap.timeline()
    timeline.to( shareBubbleInner
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
            .set( shareBubble
                , { zIndex: 0 }
                )
  }



  function setupHandlers() {
    const articles = document.querySelectorAll(ARTICLE_SELECTOR)

    Array.prototype.forEach.call(articles, (article) => {
      const openShare = article.querySelector(OPEN_SHARE_SELECTOR)
      const closeShare = article.querySelector(CLOSE_SHARE_SELECTOR)

      const handleOpen = ()=>open_share_bubble(article)
      const handleClose = ()=>close_share_bubble(article)

      document.addEventListener('DOMContentLoaded', () => {
        openShare.addEventListener('click', handleOpen)
        closeShare.addEventListener('click', handleClose)
      })
    })
  }


  setupHandlers()
})( gsap, document )

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

const ACTION_TOGGLE_SHARE_BUBBLE = 1
const ACTION_UPDATE_POPPER_INSTANCE = 2


const controller = (window, init, update, view, gsap) => {
  const UPDATE_EVENT_NAME = 'article_preview_update'

  const send_message = (message) => {
    const updateEvent =
      new CustomEvent( UPDATE_EVENT_NAME
                     , { detail: message }
                     )
    window.dispatchEvent(updateEvent)
  }

  let model = init()
  window.addEventListener
    ( UPDATE_EVENT_NAME
    , (e) => { 
        model = update(e.detail, model)
        const { message, viewObject } = view(model)
        if (message) { send_message(message) }
      }
    )

  return send_message
}



const article_component = (articleElement) => (
  { openShare: articleElement.querySelector(OPEN_SHARE_SELECTOR)
  , shareBubble: articleElement.querySelector(SHARE_BUBBLE_SELECTOR)
  , shareBubbleContent:
      articleElement.querySelector(SHARE_BUBBLE_CONTENT_SELECTOR)
  , shareBubbleInner:
      articleElement.querySelector(SHARE_BUBBLE_INNER_SELECTOR)
  , authorSubsection:
      articleElement.querySelector(AUTHOR_SUBSECTION_SELECTOR)
  }
)



const init = () => (
  { bubbleToggled:  SHARE_BUBBLE_CLOSED
  , popperInstance: null
  , isMobile: window.matchMedia('(max-width: 767px)').matches
  }
)



const update =
( { messageName
  , messageArgs
}
, model
) => {
  switch (messageName) {
    case ACTION_TOGGLE_SHARE_BUBBLE:
      const [ articleElement ] = messageArgs
      const { bubbleToggled, _, __ } = model
      return bubbleToggled
               ? close_share_bubble(model, articleElement)
               : open_share_bubble(model, articleElement)
      break;

    case ACTION_UPDATE_POPPER_INSTANCE:
      const [ newPopperInstance ] = messageArgs
      return update_popper_instance(model, newPopperInstance)
      break;
  }
}



const open_share_bubble =
( { _
  , popperInstance
  , isMobile
  }
, articleElement
) => (
  { bubbleToggled:  SHARE_BUBBLE_OPENED
  , popperInstance: popperInstance
  , isMobile:       isMobile
  }
)



const close_share_bubble =
( { _
  , popperInstance
  , isMobile
  }
, articleElement
) => (
  { bubbleToggled:  SHARE_BUBBLE_CLOSED
  , popperInstance: popperInstance
  , isMobile:       isMobile
  }
)



const update_popper_instance =
( { bubbleToggled
  , _
  , isMobile
  }
, popperInstance
) => (
  { bubbleToggled:  bubbleToggled
  , isMobile:       isMobile
  , popperInstance: popperInstance
  }
)



const view =
( { bubbleToggled
  , popperInstance
  , isMobile
  }
, { openShare
  , shareBubble
  , shareBubbleContent
  , shareBubbleInner
  , authorSubsection
  }
, gsapTimeline
) => (
  (bubbleToggled && isMobile) ?
    open_mobile_view
      ( shareBubble
      , shareBubbleInner
      , shareBubbleContent
      , authorSubsection
      , gsapTimeline
      ) :

  (bubbleToggled && !isMobile) ?
    open_desktop_view
      ( openShare
      , shareBubble
      , popperInstance
      , gsapTimeline 
      ) :

  (!bubbleToggled && isMobile) ?
    close_mobile_view
      ( shareBubble
      , shareBubbleInner
      , authorSubsection
      , gsapTimeline
      )

  : close_desktop_view
      ( shareBubble
      , popperInstance
      , gsapTimeline
      )
)



const open_desktop_view =
( openShare
, shareBubble
, popperInstance
, gsapTimeline 
) => {
  if (popperInstance) {
    return { message: null
           , viewObject: null
           }
  }

  let view = null
  const animate = () => {
    view =
      gsapTimeline
        .set( shareBubble , { zIndex: 2 } )
        .from( shareBubble
             , { duration: ANIMATION_DURATION
               , scale: .1
               }
             )
  }

  let newPopperInstance =
    Popper.createPopper
      ( openShare
      , shareBubble
      , { modifiers:
            [ { name: 'offset' 
              , options: { offset: [0, 10] } 
              } 
            ]
        , onFirstUpdate: animate
        }
      )

  return { message: { messageName: ACTION_UPDATE_POPPER_INSTANCE
                    , messageArgs: [ newPopperInstance ]
                    }
         , viewObject: view
         }
}



const close_mobile_view =
( shareBubble
, shareBubbleInner
, authorSubsection
, gsapTimeline
) => (
  { message: null
  , viewObject:
      gsapTimeline
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
        .set(authorSubsection, { position: 'relative' })
        .set(shareBubble, { position: 'absolute' })
  }
)



const open_mobile_view =
( shareBubble
, shareBubbleInner
, shareBubbleContent
, authorSubsection
, gsapTimeline
) => (
  { message: null
  , viewObject:
      gsapTimeline
        .set(shareBubble, { position: 'relative' })
        .set( shareBubbleContent
            , { width:  authorSubsection.clientWidth
              , height: authorSubsection.clientHeight
              }
            )
        .set( shareBubbleInner
            , { borderBottomRightRadius: BORDER_RADIUS }
            )
        .set(authorSubsection, { position: 'absolute' })
        .to( shareBubbleInner
           , { duration: ANIMATION_DURATION
             , ease:     'none'
             , width:    '100%'
             , height:   '100%'
             , borderBottomRightRadius: '0px'
             }
           )
  }
)



const close_desktop_view =
( shareBubble
, popperInstance
, gsapTimeline
) => {
  if (!popperInstance) {
    return { message: null
           , viewObject: null
           }
  }

  const viewObject =
    gsapTimeline
      .to( shareBubble
         , { duration: ANIMATION_DURATION
           , scale: .1
           , onComplete: () => popperInstance.destroy()
           }
         )
      .set(shareBubble, { zIndex: 0, clearProps: 'transform' })

  return { message: { messageName: ACTION_UPDATE_POPPER_INSTANCE
                   , messageArgs: [ null ]
                   }
         , viewObject: view
         }
}



const mains = () => {
  const articles = document.querySelectorAll(ARTICLE_SELECTOR)

  Array.prototype.forEach.call(articles, (article) => {
    const openShare = article.querySelector(OPEN_SHARE_SELECTOR)
    const closeShare = article.querySelector(CLOSE_SHARE_SELECTOR)


    const send_message =
      controller 
        ( window
        , init
        , update
        , (model) => (
            view
              ( model
              , article_component(article)
              , gsap.timeline()
              )
          )
        , gsap
        )

    const toggleShareBubble = () => (
      send_message
        ( { messageName: ACTION_TOGGLE_SHARE_BUBBLE
          , messageArgs: [ article ]
          }
        )
    )

    document.addEventListener('DOMContentLoaded', () => {
      openShare.addEventListener('click', toggleShareBubble)
      closeShare.addEventListener('click', toggleShareBubble)
    })
  })
}


mains()
})( gsap, Popper, window, document )


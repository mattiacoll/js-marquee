function byClass(selClass, parent = document) {
  return parent.getElementsByClassName(selClass);
}
function query(selector, parent = document) {
  return parent.querySelector(selector);
}
function queryAll(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

function forEachHTML(els, fn, scope) {
  for (let i = 0, numEls = els.length; i < numEls; i++) fn.call(scope, els[i], i);
}

function addClass(el, ...classes) {
  if (el.length === undefined) addClassEl(el, ...classes);else {
    forEachHTML(el, currEl => {
      addClassEl(currEl, ...classes);
    });
  }

  function addClassEl(elem, ...remClass) {
    remClass.forEach(singleClass => {
      elem.classList.add(singleClass);
    });
  }
}

function addEvent(el, ev, fn, opts) {
  el.addEventListener(ev, fn, opts);
}
function removeEvent(el, ev, fn, opts) {
  el.removeEventListener(ev, fn, opts);
}

function getAttr(el, attr) {
  return el.getAttribute(attr);
}
function setAttr(el, attr, val) {
  el.setAttribute(attr, val);
}
function remAttr(el, attr) {
  el.removeAttribute(attr);
}

const defOpts = {
  css3easing:       'linear',
  delayBeforeStart: 1000,
  direction:        'left',
  duplicated:       false,
  duration:         5000,
  easing:           'linear',
  gap:              20,
  pauseOnHover:     false,
  speed:            0,
  startVisible:     false,
};

/**
 * Vanilla js marquee based on jQuery.marquee
 * https://github.com/aamirafridi/jQuery.Marquee
 */
class marquee {

  /**
   * Constructor
   *
   * @param {Element} el - Element
   * @param {Object} opts - the options
   */
  constructor( el, opts ) {

    if ( typeof el === 'undefined' )
      throw new Error( 'el cannot be undefined' );

    if ( typeof el === 'string' )
      throw new Error( 'el cannot be just a selector' );

    if ( el === null )
      throw new Error( 'el cannot be null' );

    opts = {
      ...defOpts,
      ...opts,
    };

    this._loopCount = 3;

    // Check for data-option since they have top priority
    for ( const option in defOpts ) {

      let currData = getAttr( el, `data-${defOpts[option]}` );

      if ( currData !== null && currData !== '' ) {

        if ( currData === 'true' || currData === 'false' )
          currData = Boolean( currData );

        opts[option] = currData;

      }

    }

    // Reintroduce speed as an option. It calculates duration as a factor of the container width
    // measured in pixels per second.
    if ( opts.speed )
      opts.duration = parseInt( el.clientWidth ) / opts.speed * 1000;

    // no gap if not duplicated
    opts.gap = opts.duplicated ? parseInt( opts.gap ) : 0;

    // wrap inner content into a div
    el.innerHTML = `<div class="js-marquee">${el.innerHTML}</div>`;

    // Make a copy of the element
    const marq = byClass( 'js-marquee', el )[0];

    marq.style.marginRight = `${opts.gap}px`;
    marq.style.float       = 'left';

    if ( opts.duplicated )
      el.appendChild( marq.cloneNode( true ) );

    // wrap both inner elements into one div
    el.innerHTML = `<div style="width:100000px" class="js-marquee-wrapper">${el.innerHTML}</div>`;

    // Save the reference of the wrapper
    const marqWrap = byClass( 'js-marquee-wrapper', el )[0],
      vertical     = ( opts.direction === 'up' || opts.direction === 'down' );

    this._marqWrap = marqWrap;

    // If direction is up or down, get the height of main element
    if ( vertical ) {

      const contHeight = el.clientHeight;
      this._contHeight = contHeight;

      remAttr( marqWrap, 'style' );

      el.style.clientHeight = `${contHeight}px`;

      const marqs = byClass( 'js-marquee', el ),
        marqNums  = marqs.length - 1;

      // Change the CSS for js-marquee element
      forEachHTML( marqs, ( currEl, ind ) => {

        currEl.style.float        = 'none';
        currEl.style.marginRight  = '0px';

        // Remove bottom margin from 2nd element if duplicated
        if ( opts.duplicated && ind === marqNums )
          currEl.style.marginBottom = '0px';
        else
          currEl.style.marginBottom = `${opts.gap}px`;

      });

      const elHeight = parseInt( marqs[0].clientHeight + opts.gap );

      this._elHeight = el_elHeight;

      // adjust the animation duration according to the text length
      if ( opts.startVisible && !opts.duplicated ) {
        // Compute the complete animation duration and save it for later reference
        // formula is to: (Height of the text node + height of the main container / Height of the main container) * duration;
        this._completeDuration = ( elHeight + contHeight) / parseInt( contHeight ) * opts.duration;
        opts.duration = elHeight / parseInt( contHeight ) * opts.duration;
      } else // formula is to: (Height of the text node + height of the main container / Height of the main container) * duration;
        opts.duration = elHeight / parseInt( contHeight ) / parseInt( contHeight ) * opts.duration;

    } else {

      // Save the width of the each element so we can use it in animation
      const elWidth = parseInt( byClass( 'js-marquee', el )[0].clientWidth + opts.gap ),
        contWidth   = el.clientWidth;

      this._contWidth = contWidth;
      this._elWidth   = elWidth;

      // adjust the animation duration according to the text length
      if ( opts.startVisible && !opts.duplicated ) {
        // Compute the complete animation duration and save it for later reference
        // formula is to: (Width of the text node + width of the main container / Width of the main container) * duration;
        this._completeDuration = ( elWidth + contWidth) / parseInt( contWidth ) * opts.duration;
        // (Width of the text node / width of the main container) * duration
        opts.duration = elWidth / parseInt( contWidth ) * opts.duration;
      } else // formula is to: (Width of the text node + width of the main container / Width of the main container) * duration;
        opts.duration = ( elWidth + parseInt( contWidth ) ) / parseInt( contWidth ) * opts.duration;
    }


    // if duplicated then reduce the duration
    if ( opts.duplicated )
      opts.duration = opts.duration / 2;

    this._opts = opts;

    const animationName = 'marqueeAnimation-' + Math.floor( Math.random() * 10000000 ),
      animStr           = `${animationName} ${opts.duration / 1000}s ${opts.delayBeforeStart / 1000}s infinite ${opts.css3easing}`;

    this._animName = animationName;
    this._animStr = animStr;

    // if duplicated option is set to true than position the wrapper
    if ( opts.duplicated ) {

      if ( vertical ) {

        if ( opts.startVisible )
          this._marqWrap.style.transform = 'translateY(0px)';
        else
          this._marqWrap.style.transform = `translateY(${opts.direction === 'up' ? this._contHeight : ( -1 * ( ( this._elHeight * 2 ) - opts.gap ) ) }px)`;

      } else {

        if ( opts.startVisible )
          this._marqWrap.style.transform = 'translateX(0px)';
        else
          this._marqWrap.style.transform = `translateX(${opts.direction === 'left' ? this._contWidth : ( -1 * ( ( this._elWidth * 2 ) - opts.gap ) ) }px)`;

      }

      // If the text starts out visible we can skip the two initial loops
      if ( !opts.startVisible )
        this._loopCount = 1;

    } else if ( opts.startVisible ) {

      // We only have two different loops if marquee is duplicated and starts visible
      this._loopCount = 2;

    } else {
      if ( vertical )
        this._repositionVert();
      else
        this._repositionHor();
    }

    this.el = el;

    addEvent( this.el, 'pause', this.pause.bind( this ) );
    addEvent( this.el, 'resume', this.resume.bind( this ) );

    if ( opts.pauseOnHover ) {

      addEvent( this.el, 'mouseover', this.pause.bind( this ) );
      addEvent( this.el, 'mouseout', this.resume.bind( this ) );

    }

    /**
     * Method for animation end event
     */
    this._animEnd = () => {
      this._animate( vertical );
      this.el.dispatchEvent( new CustomEvent( 'finished' ) );
    };

    this._animate( vertical );

  }

  /**
   * Animation of the marquee
   *
   * @param {Boolean} vertical - Vertical direction
   */
  _animate( vertical = false ) {

    const opts = this._opts;

    if ( opts.duplicated ) {

      // When duplicated, the first loop will be scroll longer so double the duration
      if ( this._loopCount === 1 ) {

        let duration = opts.duration;

        if ( vertical )
          duration = ( opts.direction === 'up' ) ? duration + ( this._contHeight / ( this._elHeight / duration ) ) : duration * 2;
        else
          duration = ( opts.direction === 'left' ) ? duration + ( this._contWidth / ( this._elWidth / duration ) ) : duration * 2;

        this._animStr = `${this._animName} ${duration / 1000}s ${opts.delayBeforeStart / 1000}s ${opts.css3easing}`;

      // On 2nd loop things back to normal, normal duration for the rest of animations
      } else if ( this._loopCount === 2 ) {
        this._animName = `${this._animName}0`;
        this._animStr = `${this._animName} ${opts.duration / 1000}s 0s infinite ${opts.css3easing}`;
      }

      this._loopCount++;

    }

    let animationCss = '';

    if ( vertical ) {
      if ( opts.duplicated ) {

        // Adjust the starting point of animation only when first loops finishes
        if ( this._loopCount > 2 )
          this._marqWrap.style.transform = `translateY(${( opts.direction === 'up' ) ? 0 : -1 * this._elHeight}px)`;

        animationCss = `translateY(${( opts.direction === 'up' ) ? -1 * this._elHeight : 0 }px)`;

      } else if ( opts.startVisible ) {

        // This loop moves the marquee out of the container
        if ( this._loopCount === 2 ) {

          // Adjust the css3 animation as well
          this._animStr = `${this._animName} ${opts.duration / 1000}s ${opts.delayBeforeStart / 1000}s ${opts.css3easing}`;
          animationCss = `translateY(${( opts.direction === 'up' ) ? -1 * this._elHeight : this._contHeight }px)`;

          this._loopCount++;

        } else if ( this._loopCount === 3 ) {

          this._animName = `${this._animName}0`;
          this._animStr = `${this._animName} ${this._completeDuration / 1000}s 0s infinite ${opts.css3easing}`;
          this._repositionVert();

        }

      } else {

        this._repositionVert();
        animationCss = `translateY(${( opts.direction === 'up' ) ? -1 * this._marqWrap.clientHeight : this._contHeight}px)`;

      }
    } else {
      if ( opts.duplicated ) {

        // Adjust the starting point of animation only when first loops finishes
        if ( this._loopCount > 2 )
          this._marqWrap.style.transform = `translateX(${( opts.direction === 'left' ) ? 0 : -1 * this._elWidth}px)`;

        animationCss = `translateX(${( opts.direction === 'left' ) ? -1 * this._elWidth : 0 }px)`;

      } else if ( opts.startVisible ) {

        // This loop moves the marquee out of the container
        if ( this._loopCount === 2 ) {

          // Adjust the css3 animation as well
          this._animStr = `${this._animName} ${opts.duration / 1000}s ${opts.delayBeforeStart / 1000}s ${opts.css3easing}`;
          animationCss = `translateX(${( opts.direction === 'left' ) ? -1 * this._elWidth : this._contWidth }px)`;

          this._loopCount++;

        } else if ( this._loopCount === 3 ) {

          // Adjust the animation
          this._animName = `${this._animName}0`;
          this._animStr = `${this._animName} ${opts.duration / 1000}s 0s infinite ${opts.css3easing}`;
          this._repositionHor();

        }

      } else {
        this._repositionHor();
        animationCss = `translateX(${( opts.direction === 'left' ) ? -1 * this._elWidth : this._contHeight}px)`;
      }
    }

    // fire event
    this.el.dispatchEvent( new CustomEvent( 'beforeStarting' ) );

    // Append animation
    this._marqWrap.style.animation = this._animStr;

    const keyFrameCss = `@keyframes ${this._animName} {
      100% {
        transform: ${animationCss};
      }
    }`;

    const styles = queryAll( 'style', this._marqWrap );

    if ( styles.length )
      styles[styles.length - 1].innerHTML = keyFrameCss;
    else if ( byClass( 'marq-wrap-style' ).length )
      byClass( 'marq-wrap-style' )[0].innerHTML = keyFrameCss;
    else {

      const styleEl = document.createElement( 'style' );
      addClass( styleEl, 'marq-wrap-style' );
      styleEl.innerHTML = keyFrameCss;

      query( 'head' ).appendChild( styleEl );

    }

    // Animation iteration event
    addEvent( this._marqWrap, 'animationiteration', this._animIter.bind( this ), {
      once: true,
    });

    // Animation stopped
    addEvent( this._marqWrap, 'animationend', this._animEnd.bind( this ), {
      once: true,
    });

    this._status === 'running';
    setAttr( this.el, 'data-runningStatus', 'resumed' );

  }

  /**
   * Event fired on Animation iteration
   */
  _animIter() {
    this.el.dispatchEvent( new CustomEvent( 'finished' ) );
  }

  /**
   * Reposition the Wrapper vertically
   */
  _repositionVert() {
    this._marqWrap.style.transform = `translateY(${ this._opts.direction === 'up' ? this._contHeight : ( this._elHeight * -1 ) }px)`;
  }

  /**
   * Reposition the Wrapper horizontally
   */
  _repositionHor() {
    this._marqWrap.style.transform = `translateX(${ this._opts.direction === 'left' ? this._contWidth : ( this._elWidth * -1 ) }px)`;
  }

  /**
   * Pause the animation
   */
  pause() {
    this._marqWrap.style.animationPlayState = 'paused';
    this._status = 'paused';

    setAttr( this.el, 'data-runningStatus', 'paused' );
    this.el.dispatchEvent( new CustomEvent( 'paused' ) );
  }

  /**
   * Resume the animation
   */
  resume() {
    this._marqWrap.style.animationPlayState = 'running';
    this._status = 'running';

    setAttr( this.el, 'data-runningStatus', 'resumed' );
    this.el.dispatchEvent( new CustomEvent( 'resumed' ) );
  }

  /**
   * Toggle animation playing status
   */
  toggle() {

    if ( this._status === 'paused' )
      this.resume();
    else if ( this._status === 'running' )
      this.pause();

  }

  /**
   * Destorys the instance and removes events
   */
  destroy() {

    removeEvent( this.el, 'pause', this.pause.bind( this ) );
    removeEvent( this.el, 'resume', this.resume.bind( this ) );

    if ( this._opts.pauseOnHover ) {

      removeEvent( this.el, 'mouseover', this.pause.bind( this ) );
      removeEvent( this.el, 'mouseout', this.resume.bind( this ) );

    }

    removeEvent( this._marqWrap, 'animationiteration', this._animIter.bind( this ), {
      once: true,
    });

    removeEvent( this._marqWrap, 'animationend', this._animEnd.bind( this ), {
      once: true,
    });

  }

}

export default marquee;
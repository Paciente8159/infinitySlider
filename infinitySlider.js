"use strict";

function infinitySlider(options) {
  this.options = this.defaultOptions(options);
  this.transition = new transitionJS({
    transitionDuration: this.options.transitionTime,
    transitionEasing: this.options.transitionEasing,
    renderFrame: this.render.bind(this),
  });
  this.index = 0;
  this.motion = 0;
  this.slider = document.querySelector(this.options.sliderSelector);

  this.slides = document.querySelectorAll(
    this.options.sliderSelector + ">" + this.options.slideSelector
  );

  //no slides nothing to do
  if (!this.slides) {
    return;
  }

  if (this.options.enableSlideLoop) {
    for (var i = 0; i < this.slides.length; i++) {
      this.slider.insertBefore(this.slides[i].cloneNode(true), this.slides[0]);
    }
  }

  this.slides = document.querySelectorAll(
    this.options.sliderSelector + ">" + this.options.slideSelector
  );

  this.activeSlide = this.slides[0];
  if (this.activeSlide) {
    this.activeSlide.classList.add(this.options.slideActiveClassName);
  }

  this.lastframe = 0;
  this.slidesoffsets = new Array(this.slides.length);
  var mid_point = this.options.enableSlideLoop
    ? this.slides.length / 2
    : this.slides.length;
  for (var i = 0; i < this.slides.length; i++) {
    var j = i % this.slides.length;
    j = j < mid_point ? j : (j % mid_point) - mid_point;
    this.slidesoffsets[i] = j;
  }

  this.slidesdots = document.querySelectorAll(
    this.options.sliderSelector + ">" + this.options.dotSelector
  );

  if (this.slidesdots.length) {
    this.activeDot = this.slidesdots[0];
    if (this.activeDot) {
      this.activeDot.classList.add(this.options.dotActiveClassName);
    }
  }

  if (this.options.debug) {
    var perc = 100;
    var param = "";
    switch (this.options.transformationFunc) {
      case "translateX":
        perc /= this.slides.length;
        param = "width:" + perc + "%;margin-left:auto;margin-right:auto;";
        break;
      case "translateY":
        perc /= this.slides.length;
        param = "height:" + perc + "%;margin-top:auto;margin-bottom:auto;";
        break;
      default:
        perc /= this.slides.length;
        param = "width:" + perc + "%;margin-left:auto;margin-right:auto;";
        perc /= this.slides.length;
        param += "height:" + perc + "%;margin-top:auto;margin-bottom:auto;";
    }

    this.slider.style.cssText = "position:relative;overflow:visible;" + param;
  }

  this.render(1, 1);
  this.autoplayInterval = null;
  this.startAutoPlay();
}

infinitySlider.prototype.normIndex = function (i) {
  if (i < 0) {
    return this.slides.length - i;
  }

  if (i > this.slides.length - 1) {
    return i - this.slides.length;
  }

  return i;
};

infinitySlider.prototype.render = function (realposition, frameposition) {
  var f = this.options.transformationFunc;
  var o = this.options.transformationOffset;
  var m = 100 * this.options.transformationMult;
  var u = this.options.transformationUnits;

  var mid_point = this.options.enableSlideLoop
    ? this.slides.length / 2
    : this.slides.length;

  for (var i = 0; i != this.slides.length; i++) {
    var offset = this.slidesoffsets[i] - this.motion * frameposition;
    if (offset > mid_point) {
      offset -= this.slides.length;
    } else if (this.slidesoffsets[i] < -mid_point) {
      offset += this.slides.length;
    }

    this.slides[i].style.zIndex = -Math.round(Math.abs(offset));
    var k = offset + o;
    if (typeof f === "string") {
      this.slides[i].style.transform = f + "(" + k * m + u + ")";
    } else {
      f(this.slides[i], k, frameposition);
    }

    if (frameposition >= 1) {
      this.slidesoffsets[i] = offset;
    }
  }

  this.lastframe = frameposition;

  if (frameposition >= 1) {
    this.index += this.motion;
    this.index = this.index % this.slides.length;
    this.motion = 0;
    this.lastframe = 0;
    this.updateActiveClasses();
    for (var i = 0; i != this.slides.length; i++) {
      this.slides[i].style.zIndex = 0;
    }

    if (this.options.onAfterSlideChange) {
      this.options.onAfterSlideChange(this.index);
    }
  }
};

infinitySlider.prototype.getDotIndex = function (element) {
  for (var i = 0; i < this.slidesdots.length; i++) {
    if (this.slidesdots[i] === element) {
      return this.index < this.slidesdots.length
        ? i
        : i + this.slidesdots.length;
    }
  }

  return -1;
};

infinitySlider.prototype.getSlideIndex = function (element) {
  for (var i = 0; i < this.slides.length; i++) {
    if (this.slides[i] === element) {
      return i;
    }
  }

  return -1;
};

infinitySlider.prototype.activateSlide = function (element) {
  var selected = this.getDotIndex(element);
  if (selected < 0) {
    selected = this.getSlideIndex(element);
    if (selected < 0) {
      return;
    }
  }

  this.goTo(selected);
};

infinitySlider.prototype.startAutoPlay = function () {
  if (this.options.autoplay) {
    this.autoplayInterval = setInterval(
      function () {
        this.motion++;
        this.transition.startTransition();
      }.bind(this),
      this.options.autoplayTime
    );
  }
};

infinitySlider.prototype.stopAutoPlay = function () {
  if (this.options.autoplay) {
    clearInterval(this.autoplayInterval);
  }
};

infinitySlider.prototype.updateActiveClasses = function () {
  if (this.activeSlide) {
    this.activeSlide.classList.remove(this.options.slideActiveClassName);
  }
  this.activeSlide = this.slides[Math.round(this.index)];
  if (this.activeSlide) {
    this.activeSlide.classList.add(this.options.slideActiveClassName);
  }

  if (this.slidesdots.length) {
    if (this.activeDot) {
      this.activeDot.classList.remove(this.options.dotActiveClassName);
    }
    this.activeDot = this.slidesdots[this.index % this.slidesdots.length];
    if (this.activeDot) {
      this.activeDot.classList.add(this.options.dotActiveClassName);
    }
  }
};

infinitySlider.prototype.next = function () {
  this.stopAutoPlay();
  this.motion++;
  if (this.options.onBeforeSlideChange) {
    this.options.onBeforeSlideChange(this.index, this.motion);
  }
  this.transition.startTransition();
  this.startAutoPlay();
};

infinitySlider.prototype.prev = function () {
  this.stopAutoPlay();
  this.motion--;
  if (this.options.onBeforeSlideChange) {
    this.options.onBeforeSlideChange(this.index, this.motion);
  }
  this.transition.startTransition();
  this.startAutoPlay();
};

infinitySlider.prototype.goTo = function (index) {
  this.stopAutoPlay();
  this.motion = index - this.index;
  if (
    this.options.enableSlideLoop &&
    Math.abs(this.motion) > this.slides.length / 2
  ) {
    this.motion =
      this.motion < 0
        ? this.slides.length + this.motion
        : -(this.slides.length - this.motion);
  }

  if (this.options.onBeforeSlideChange) {
    this.options.onBeforeSlideChange(this.index, this.motion);
  }
  this.transition.startTransition();
  this.startAutoPlay();
};

infinitySlider.prototype.jumpTo = function (index) {
  this.stopAutoPlay();
  var max_slides = this.options.enableSlideLoop
    ? this.slides.length / 2
    : this.slides.length;
  if (!this.options.enableSlideLoop) {
    if (index >= max_slides || index < 0) {
      return;
    }
  }
  this.motion += index - this.index;
  this.transition.startTransition();
  this.startAutoPlay();
};

infinitySlider.prototype.getAt = function (index) {
  return this.slides[index % this.slides.length];
};

infinitySlider.prototype.getIndex = function () {
  return this.index;
};

infinitySlider.prototype.defaultOptions = function (options) {
  var fulloptions = {
    /**
     * selectors
     */
    sliderSelector: ".slider",
    slideSelector: ".slide",
    dotSelector: ".slidedot",
    slideActiveClassName: "slide-active",
    dotActiveClassName: "dot-active",
    /**
     * autoplay and transformations
     */
    transitionTime: 500,
    transitionEasing: "easeInOutCubic",
    autoplay: false,
    autoplayTime: 5000,
    transformationOffset: 0,
    transformationFunc: "translateX",
    transformationMult: 1,
    transformationUnits: "%",
    /**
     * functionalities
     */
    enableSlideLoop: false,
    /**
     * Callbacks
     */
    onBeforeSlideChange: null,
    onAfterSlideChange: null,
  };

  Object.getOwnPropertyNames(options).forEach(function (element) {
    Object.defineProperty(fulloptions, element, {
      value: options[element],
      writable: true,
    });
  });

  return fulloptions;
};

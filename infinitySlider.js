"use strict";

function infinitySlider(options) {
  this.options = this.defaultOptions(options);
  this.transition = new transitionJS({
    transitionDuration: this.options.transitionTime,
    transitionEasing: this.options.transitionEasing,
    renderFrame: this.render.bind(this),
  });

  this.index = 0;
  this.targetindex = 0;
  this.renderindex;

  this.slider = document.querySelector(this.options.sliderSelector);

  //no slider nothing to do
  if (!this.slider) {
    return;
  }

  this.slides = this.slider.querySelectorAll(this.options.slideSelector);

  //no slides nothing to do
  if (!this.slides) {
    return;
  }

  if (this.options.enableSlideLoop) {
    for (var i = 0; i < this.slides.length; i++) {
      this.slider.insertBefore(this.slides[i].cloneNode(true), this.slides[0]);
    }
  }

  this.slides = this.slider.querySelectorAll(this.options.slideSelector);

  this.activeSlide = this.slides[0];
  if (this.activeSlide) {
    this.activeSlide.classList.add(this.options.slideActiveClassName);
  }

  this.slidesdots = this.slider.querySelectorAll(this.options.dotSelector);

  if (this.slidesdots.length) {
    for (var i = 0; i < this.slidesdots.length; i++) {
      var element = this.slidesdots[i];
      element.addEventListener("click", this.activateSlide.bind(this), false);
    }
    this.activeDot = this.slidesdots[0];
    if (this.activeDot) {
      this.activeDot.classList.add(this.options.dotActiveClassName);
    }
  }

  if (this.options.debug) {
    this.slider.parentElement.style.perspective = "500px";
    this.slider.style.transform = "translateZ(-1000px) rotateY(35deg)";
  }

  //this does a silent rendering of the slides and place them instantly at their final (initial) position
  this.render(1, 1);
  this.autoplayInterval = null;
  this.startAutoPlay();
}

infinitySlider.prototype.normIndex = function (i) {
  while (i < 0) {
    i += this.slides.length;
  }

  while (i > this.slides.length - 1) {
    i -= this.slides.length;
  }

  return i;
};

infinitySlider.prototype.render = function (realposition, frameposition) {
  var f = this.options.transformationFunc;
  var o = this.options.transformationOffset;
  var m = 100 * this.options.transformationMult;
  var u = this.options.transformationUnits;
  var curpos = this.calcMotion() * frameposition + o;

  this.offsetRenderIndex(curpos);
  var offsets = this.getOffsetMap();

  var mid_point = this.options.enableSlideLoop
    ? this.slides.length / 2
    : this.slides.length;

  for (var i = 0; i != this.slides.length; i++) {
    if (typeof f === "string") {
      this.slides[i].style.transform = f + "(" + offsets[i] * m + u + ")";
    } else {
      f(this.slides[i], offsets[i], frameposition);
    }
  }

  curpos = Math.round(curpos);

  if (frameposition >= 1) {
    this.index = this.targetindex;
    this.renderindex = this.targetindex;
    this.updateActiveClasses();
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

infinitySlider.prototype.activateSlide = function (e) {
  var element = e.srcElement;
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
        this.index = this.renderindex;
        this.targetindex = this.normIndex(this.targetindex + 1);
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
  if (!this.options.enableSlideLoop) {
    if (this.index >= this.slides.length - 1) {
      return;
    }
  }

  this.stopAutoPlay();
  this.index = this.renderindex;
  this.targetindex = this.normIndex(
    this.targetindex + this.options.transformationJump
  );
  if (this.options.onBeforeSlideChange) {
    this.options.onBeforeSlideChange(this.index, this.calcMotion());
  }
  this.transition.startTransition();
  this.startAutoPlay();
};

infinitySlider.prototype.prev = function () {
  if (!this.options.enableSlideLoop) {
    if (this.index <= 0) {
      return;
    }
  }

  this.stopAutoPlay();
  this.index = this.renderindex;
  this.targetindex = this.normIndex(
    this.targetindex - this.options.transformationJump
  );
  if (this.options.onBeforeSlideChange) {
    this.options.onBeforeSlideChange(this.index, this.calcMotion());
  }
  this.transition.startTransition();
  this.startAutoPlay();
};

infinitySlider.prototype.goTo = function (index) {
  this.stopAutoPlay();
  this.index = this.renderindex;
  this.targetindex = this.normIndex(index);

  if (this.options.onBeforeSlideChange) {
    this.options.onBeforeSlideChange(this.index, this.calcMotion());
  }
  this.transition.startTransition();
  this.startAutoPlay();
};

infinitySlider.prototype.getAt = function (index) {
  while (index < 0) {
    index += this.slides.length;
  }
  return this.slides[index % this.slides.length];
};

infinitySlider.prototype.dotGetAt = function (index) {
  while (index < 0) {
    index += this.slidesdots.length;
  }
  return this.slidesdots[index % this.slidesdots.length];
};

infinitySlider.prototype.getIndex = function () {
  return this.index;
};

infinitySlider.prototype.offsetRenderIndex = function (offset) {
  this.renderindex = this.index + offset;

  if (this.renderindex > this.slides.length) {
    this.renderindex -= this.slides.length;
  } else if (this.renderindex < 0) {
    this.renderindex += this.slides.length;
  }
};

infinitySlider.prototype.getOffsetMap = function () {
  var mid_point = this.options.enableSlideLoop
    ? this.slides.length / 2
    : this.slides.length;
  var offsets = new Array(this.slides.length);
  for (var i = 0; i < this.slides.length; i++) {
    offsets[i] = i - this.renderindex;
    if (offsets[i] > mid_point) {
      offsets[i] += -this.slides.length;
    } else if (offsets[i] < -mid_point) {
      offsets[i] += this.slides.length;
    }
  }

  return offsets;
};

infinitySlider.prototype.calcMotion = function () {
  var motion = this.targetindex - this.index;
  var mid_point = this.options.enableSlideLoop
    ? this.slides.length / 2
    : this.slides.length;

  if (motion > mid_point) {
    return motion - this.slides.length;
  } else if (motion < -mid_point) {
    return motion + this.slides.length;
  }

  return motion;
};

infinitySlider.prototype.addSlide = function (
  newslide,
  newdot = null,
  insertAt = -1
) {
  if (!newslide || !this.slider) {
    return;
  }

  //index of first slide/dot
  insertAt = this.enableSlideLoop
    ? insertAt % (this.slides.length / 2)
    : insertAt % this.slides.length;

  //loop is active so a duplicate node must be added in the middle of the loop
  if (this.enableSlideLoop) {
    var endslide = this.slides[insertAt + this.slides.length / 2];
    this.slider.insertBefore(newslide, endslide);
  }

  var refslide = insertAt >= 0 ? this.slides[insertAt] : null;
  this.slider.insertBefore(newslide, refslide);
  //rebuild array
  this.slides = this.slider.querySelectorAll(this.options.slideSelector);

  if (newdot) {
    var refdot = insertAt >= 0 ? this.slidesdots[insertAt] : null;
    this.slidesdots.insertBefore(newslide, refdot);
    //rebuild array
    this.slidesdots = this.slider.querySelectorAll(this.options.dotSelector);
  }

  //re-render frames
  this.render(1, 1);
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
    transformationJump: 1,
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

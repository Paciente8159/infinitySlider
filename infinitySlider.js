"use strict";

function infinitySlider(options) {
  this.options = this.defaultOptions(options);
  this.index = 0;
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

  this.slidesdots = document.querySelectorAll(
    this.options.sliderSelector + ">" + this.options.dotSelector
  );

  this.activeDot = this.slidesdots[0];
  if (this.activeDot) {
    this.activeDot.classList.add(this.options.dotActiveClassName);
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
    }

    this.slider.style.cssText = "position:relative;overflow:visible;" + param;
  }

  this.enableAnimations();
  this.rearangeLoop(0);
  this.autoplayInterval = null;
  this.startAutoPlay();
}

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
        this.index++;
        this.index = this.index < this.slides.length ? this.index : 0;
        this.rearangeLoop(1);
      }.bind(this),
      this.options.autoplayTime * 1000
    );
  }
};

infinitySlider.prototype.stopAutoPlay = function () {
  if (this.options.autoplay) {
    clearInterval(this.autoplayInterval);
  }
};

infinitySlider.prototype.enableAnimations = function () {
  for (var i = 0; i < this.slides.length; i++) {
    this.slides[i].style.transition = ""/*
      "transform " +
      this.options.transitionTime +
      "s " +
      this.options.transitionEasing*/;
  }
};

infinitySlider.prototype.disableAnimations = function () {
  for (var i = 0; i < this.slides.length; i++) {
    this.slides[i].style.transition = "initial";
  }
};

infinitySlider.prototype.sendSlidesToBack = function () {
  for (var i = 0; i < this.slides.length; i++) {
    if (i != this.index) {
      this.slides[i].style.zIndex = -1;
    }
  }
};

infinitySlider.prototype.rearangeLoop = function (dir, imediate) {
  var f = this.options.transformationFunc;
  var o = this.options.transformationOffset;
  var m = 100 * this.options.transformationMult;
  var u = this.options.transformationUnits;

  var previndex = this.index - dir;
  var amount = Math.abs(dir);
  previndex = previndex < this.slides.length ? previndex : 0;
  previndex = previndex < 0 ? this.slides.length - 1 : previndex;
  var loop = Math.ceil(this.slides.length / 2);
  loop = this.slides.length % 2 ? loop : loop + 1;
  var next = previndex;
  var prev = previndex;

  this.disableAnimations();
  this.slides[previndex].style.zIndex = -1;
  if (this.options.enableSlideLoop) {
    for (var i = 1; i < loop; i++) {
      next++;
      next = next < this.slides.length ? next : 0;
      prev--;
      prev = prev < 0 ? this.slides.length - 1 : prev;

      this.slides[next].style.zIndex = dir >= 0 ? -1 : -2;
      this.slides[prev].style.zIndex = dir >= 0 ? -2 : -1;

      //slides are doubled so next==prev
      if (i >= loop - amount && dir >= 0) {
        this.slides[prev].style.zIndex = -3;
      }

      //slides are doubled so next==prev
      if (i >= loop - (amount + 1) && dir < 0) {
        this.slides[next].style.zIndex = -3;
      }
    }
  }

  this.slides[this.index].style.zIndex = 0;
  if (!imediate) {
    this.enableAnimations();
  }
  var next = this.index;
  var prev = this.index;
  if (this.options.enableSlideLoop) {
    this.slides[this.index].style.transform = f + "(" + o * m + u + ")";
    for (var i = 1; i < loop; i++) {
      next++;
      next = next < this.slides.length ? next : 0;
      prev--;
      prev = prev < 0 ? this.slides.length - 1 : prev;

      this.slides[next].style.transform = f + "(" + (i + o) * m + u + ")";
      this.slides[prev].style.transform = f + "(" + (-i + o) * m + u + ")";
    }
  } else {
    for (var i = 0; i < this.slides.length; i++) {
      var j = i - this.index;
      this.slides[i].style.transform = f + "(" + (j + o) * m + u + ")";
    }
  }
  this.updateActiveClasses();

  if(this.options.onSlideChange){
    this.options.onSlideChange(this.index);
  }
};

infinitySlider.prototype.updateActiveClasses = function () {
  this.activeSlide.classList.remove(this.options.slideActiveClassName);
  this.activeSlide = this.slides[this.index];
  this.activeSlide.classList.add(this.options.slideActiveClassName);

  if (this.activeDot) {
    this.activeDot.classList.remove(this.options.dotActiveClassName);
    this.activeDot = this.slidesdots[this.index % this.slidesdots.length];
    this.activeDot.classList.add(this.options.dotActiveClassName);
  }
};

infinitySlider.prototype.next = function () {
  this.stopAutoPlay();
  var max_slides = this.options.enableSlideLoop
    ? this.slides.length / 2
    : this.slides.length;

  if (this.index < max_slides - 1 || this.options.enableSlideLoop) {
    this.index++;
  }
  this.index = this.index < this.slides.length ? this.index : 0;
  this.rearangeLoop(1);
  this.startAutoPlay();
};

infinitySlider.prototype.prev = function () {
  this.stopAutoPlay();
  if (this.index != 0 || this.options.enableSlideLoop) {
    this.index--;
  }
  this.index = this.index < 0 ? this.slides.length - 1 : this.index;
  this.rearangeLoop(-1);
  this.startAutoPlay();
};

infinitySlider.prototype.goTo = function (index) {
  this.stopAutoPlay();
  var max_slides = this.options.enableSlideLoop
    ? this.slides.length / 2
    : this.slides.length;
  if (!this.options.enableSlideLoop) {
    if (index >= max_slides || index < 0) {
      return;
    }
  }
  var motion = index - this.index;
  //this.prepLoop(motion);
  this.index = index;
  this.rearangeLoop(motion);
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
  var motion = index - this.index;
  //this.prepLoop(motion);
  this.index = index;
  this.rearangeLoop(motion,true);
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
    autoplay: false,
    autoplayTime: 5,
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
    onSlideChange: null,
  };

  Object.getOwnPropertyNames(options).forEach(function (element) {
    Object.defineProperty(fulloptions, element, {
      value: options[element],
      writable: true,
    });
  });

  return fulloptions;
};

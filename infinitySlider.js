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

  for (var i = 0; i < this.slides.length; i++) {
    this.slider.appendChild(this.slides[i].cloneNode(true));
  }

  this.slides = document.querySelectorAll(
    this.options.sliderSelector + ">" + this.options.slideSelector
  );

  this.activeSlide = this.slides[0];
  if (this.activeSlide) {
    this.activeSlide.classList.add(this.options.slideActiveSelector);
  }

  this.slidesdots = document.querySelectorAll(
    this.options.sliderSelector + ">" + this.options.dotSelector
  );

  this.activeDot = this.slidesdots[0];
  if (this.activeDot) {
    this.activeDot.classList.add(this.options.dotActiveSelector);
  }

  this.enableAnimations();
  this.rearangeLoop(0);

  this.autoplayInterval = null;
  this.startAutoPlay();

  if (this.options.debug) {
    var perc = 100 / this.slides.length;
    this.slider.style.cssText =
      "width:" +
      perc +
      "%;margin-left:auto;margin-right:auto;position:relative;overflow:visible;";
  }
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

  this.goto(selected);
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
    this.slides[i].style.transition =
      "transform " +
      this.options.transitionTime +
      "s " +
      this.options.transitionEasing;
  }
};

infinitySlider.prototype.disableAnimations = function () {
  for (var i = 0; i < this.slides.length; i++) {
    this.slides[i].style.transitionTime = "";
  }
};

infinitySlider.prototype.sendSlidesToBack = function () {
  for (var i = 0; i < this.slides.length; i++) {
    if (i != this.index) {
      this.slides[i].style.zIndex = -1;
    }
  }
};

infinitySlider.prototype.rearangeLoop = function (dir) {

  var f = this.options.transformationFunc;
  var o =  this.options.transformationOffset;
  var m = this.options.transformationStep;
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
  for (var i = 1; i < loop; i++) {
    next++;
    next = next < this.slides.length ? next : 0;
    prev--;
    prev = prev < 0 ? this.slides.length - 1 : prev;

    this.slides[next].style.zIndex = (dir >= 0) ? -1 : -2;
    this.slides[prev].style.zIndex = (dir >= 0) ? -2 : -1;

    //slides are doubled so next==prev
    if(i>=loop-amount && dir >= 0)
    {
      this.slides[prev].style.zIndex = -3;
    }

    //slides are doubled so next==prev
    if(i>=loop-(amount+1) && dir < 0)
    {
      this.slides[next].style.zIndex = -3;
    }
  }

  this.slides[this.index].style.zIndex = 0;
  this.enableAnimations();

  var next = this.index;
  var prev = this.index;
  this.slides[this.index].style.transform = f + "(" + o * m +  u +")";
  
  for (var i = 1; i < loop; i++) {
    next++;
    next = next < this.slides.length ? next : 0;
    prev--;
    prev = prev < 0 ? this.slides.length - 1 : prev;

    this.slides[next].style.transform = f + "(" + (i + o) * m +  u +")";
    this.slides[prev].style.transform = f + "(" + (-i + o) * m +  u +")";
  }

  this.updateActiveClasses();
};

infinitySlider.prototype.updateActiveClasses = function () {

  this.activeSlide.classList.remove(this.options.slideActiveSelector);
  this.activeSlide = this.slidesdots[this.index];
  this.activeSlide.classList.add(this.options.slideActiveSelector);

  if (this.activeDot) {
    this.activeDot.classList.remove(this.options.dotActiveSelector);
    this.activeDot = this.slidesdots[this.index % this.slidesdots.length];
    this.activeDot.classList.add(this.options.dotActiveSelector);
  }
};

infinitySlider.prototype.next = function () {
  this.stopAutoPlay();
  this.index++;
  this.index = this.index < this.slides.length ? this.index : 0;
  this.rearangeLoop(1);
  this.startAutoPlay();
};

infinitySlider.prototype.prev = function () {
  this.stopAutoPlay();
  this.index--;
  this.index = this.index < 0 ? this.slides.length - 1 : this.index;
  this.rearangeLoop(-1);
  this.startAutoPlay();
};

infinitySlider.prototype.goto = function (index) {
  this.stopAutoPlay();
  var motion = index - this.index;
  //this.prepLoop(motion);
  this.index = index;
  this.rearangeLoop(motion);
  this.startAutoPlay();
};

infinitySlider.prototype.defaultOptions = function (options) {
  var fulloptions = {
    /**
     * selectors
     */
    sliderSelector: ".slider",
    slideSelector: ".slide",
    dotSelector: ".slidedot",
    slideActiveSelector: ".slide-active",
    dotActiveSelector: ".dot-active",
    /**
     * transitions and animations
     */
    transitionTime: 0.5,
    transitionEasing: "ease-in-out",
    autoplay: true,
    autoplayTime: 5,
    transformationOffset: 0,
    transformationFunc: "translateX",
    transformationStep: 100,
    transformationUnits: "%",
  };

  Object.getOwnPropertyNames(options).forEach(function (element) {
    Object.defineProperty(fulloptions, element, {
      value: options[element],
      writable: true,
    });
  });

  return fulloptions;
};

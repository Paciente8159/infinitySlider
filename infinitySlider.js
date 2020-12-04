"use strict";

function infinitySlider(options) {
  this.options = this.defaultOptions(options);
  this.index = 0;
  this.slider = document.querySelector(this.options.sliderSelector);
  this.slides = document.querySelectorAll(
    this.options.sliderSelector + ">" + this.options.slideSelector
  );
  //no slides nothing to do
  if(!this.slides)
  {
    return;
  }

  this.slidesdots = document.querySelectorAll(
    this.options.sliderSelector + ">" + this.options.dotSelector
  );
  
  this.activeDot = this.slidesdots[0];
  if(this.activeDot){
    this.activeDot.classList.add("active");
  }

  this.enableAnimations();
  this.rearangeLoop();

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
      return i;
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
      function(){
        this.index++;
        this.index = this.index < this.slides.length ? this.index : 0;
        this.rearangeLoop();
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
    this.slides[i].style.zIndex = -this.slides.length;
  }
};

infinitySlider.prototype.rearangeLoop = function () {
  var loop = Math.ceil(this.slides.length / 2);
  loop = ((this.slides.length % 2)) ? loop : loop + 1;
  var next = this.index;
  var prev = this.index;

  this.slides[this.index].style.transform = "translateX(0%)";
  this.slides[this.index].style.zIndex = -1;
  
  document.querySelectorAll(
    this.options.sliderSelector + ">" + this.options.dotSelector + ".active"
  ).forEach(function(element){
    element
  });
  for (var i = 1; i < loop; i++) {
    next++;
    next = next < this.slides.length ? next : 0;
    prev--;
    prev = prev < 0 ? this.slides.length - 1 : prev;

    this.slides[next].style.transform = "translateX(" + i * 100 + "%)";
    this.slides[next].style.zIndex = -i - 1;
    this.slides[prev].style.transform = "translateX(" + -i * 100 + "%)";
    this.slides[prev].style.zIndex = -i - 1;
  }

  this.updateDots();
};

infinitySlider.prototype.updateDots = function (){
  if(this.activeDot){
    this.activeDot.classList.remove("active");
    this.activeDot = this.slidesdots[this.index];
    this.activeDot.classList.add("active");
  }
};

infinitySlider.prototype.next = function () {
  this.stopAutoPlay();
  this.index++;
  this.index = this.index < this.slides.length ? this.index : 0;
  this.rearangeLoop();
  this.startAutoPlay();
};

infinitySlider.prototype.prev = function () {
  this.stopAutoPlay();
  this.index--;
  this.index = this.index < 0 ? this.slides.length - 1 : this.index;
  this.rearangeLoop();
  this.startAutoPlay();
};

infinitySlider.prototype.goto = function (index) {
  this.stopAutoPlay();
  var diff = index - this.index;
  var dir = Math.sign(diff);
  diff = Math.abs(diff);

  //if not shortest route invert dir
  if (diff * 2 >= this.slides.length) {
    diff = this.slides.length - diff;
    dir = -dir;
  }

  diff++;
  this.disableAnimations();
  this.sendSlidesToBack();

  for (
    var i = this.slides.length + this.index, j = 0;
    j < diff;
    i += dir, j++
  ) {
    var k = i < this.slides.length ? i : i % this.slides.length;
    this.slides[k].style.transform = "translateX(" + dir * j * 100 + "%)";
    this.slides[k].style.zIndex = -1;
  }

  this.enableAnimations();

  for (
    var i = this.slides.length + this.index, j = diff - 1;
    j >= 0;
    i += dir, j--
  ) {
    var k = i < this.slides.length ? i : i % this.slides.length;
    this.slides[k].style.transform = "translateX(" + -dir * j * 100 + "%)";
  }

  this.index = index;
  this.updateDots();

  setTimeout(
    this.rearangeLoop.bind(this),
    Math.max(
      this.options.transitionTime * 1000,
      this.options.autoplayTime * 500
    )
  );

  this.startAutoPlay();
};

infinitySlider.prototype.defaultOptions = function (options) {
  var fulloptions = {
    sliderSelector: ".slider",
    slideSelector: ".slide",
    dotSelector: ".slidedot",
    transitionTime: 0.5,
    transitionEasing: "ease-in-out",
    autoplay: true,
    autoplayTime: 5,
  };

  Object.getOwnPropertyNames(options).forEach(function (element) {
    Object.defineProperty(fulloptions, element, {
      value: options[element],
      writable: true,
    });
  });

  return fulloptions;
};

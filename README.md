# infinitySlider

A js library to create and control an slider/carousel element. This library only provides the sliding mechanics for the slider so any styling and css can be done and shoud be done by the user.

## infinitySlider options

infinitySlider has the following option

- Selectors
  - sliderSelector - `Type: string (default .slider)` This is the querySelector for the slider element.
  - slideSelector - `Type: string (default .slide)` This is the querySelector for the slide elements.
  - dotSelector - `Type: string (default .slidedot)` This is the querySelector for the dot controls (optional).
  - slideActiveClassName - `Type: string (default slide-active)` This is the class that will be added to a slide when it is active.
  - dotActiveClassName - `Type: string (default dot-active)` This is the class that will be added to a dot control when it is active.
- Autoplay and transformations
  - autoplay - `Type: boolean (default false)` This enables or disables autoplay.
  - autoplayTime - `Type: number (default 5)` This is the number of seconds between each slide transition.
  - transformationOffset - `Type: number (default 0)` This is an offset aplied to the slides position. A value a one represents 100% (one slide offset). 0.5 represents 50% slide offset.
  - transformationFunc - `Type: string (default translateX)` This is CSS transform effect to be applied.
  - transformationMult - `Type: number (default 100)` This is the corresponding multiplier to be aplied. The transformation will be calculated from 0 to 1. This multiplier will be used in conjuntion with the transformationUnits options to calculate the effect variation. For example to make a full X translation with a transformationFunc with value translateX, a transformationMult of 100 and a transformationUnits of '%' should be used (100% is a full translation of a slide). For a rotate transform transformationFunc rotate, a transformationMult of 360 and a transformationUnits of 'deg' should be used (360deg is a full rotation of a slide).
  - transformationUnits - `Type: string (default %)` Chech the previous description.
- Functionalities
  - enableSlideLoop - `Type: boolean (default false)` This enables/improves slide looping effect by modifind the DOM adding a clone of the slides structure to the loop.
  - debug - `Type: boolean (default false)` This enables debugging option to see the effect running (zoom out the slides inside the slider).
- Callbacks
  - onSlideChange - `Type: function (default null)` If defined this function will be called after the transition has ended.

## infinitySlider exemples

You can check the demos dir with some working demos

### create a minimalistic slider

The slider is any html element and the slides should all the child elements with the proper selector. An example using the default selectors would be:

```html
<div id="myslider" class="slider">
  <div id="myslide1" class="slide"></div>
  <div id="myslide2" class="slide"></div>
  <div id="myslide3" class="slide"></div>
  <div id="myslide4" class="slide"></div>
  <div id="myslide5" class="slide"></div>
  <div id="myslide6" class="slide"></div>
</div>
```

and the script for this would be

```js
var slider = null;
document.addEventListener("DOMContentLoaded", function (event) {
  slider = new infinitySlider({});
});
```

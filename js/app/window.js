define(['domReady!'], function(document) {
  var windows = {
    help: null,
    pause: null,
    inventory: null
  };

  const WindowPrototype = {
    open() {
      for (var win2 in windows) {
        windows[win2].close();
      }
      this.element.classList.add('active');
    },
    close() {
      this.element.classList.remove('active');
    }
  };

  function make_hide_function(element) {
    return function() {
      element.style.display = "none";
    };
  }

  function Window(element) {
    var close_button = document.getElementById(element.id + "-close");
    close_button.addEventListener(
      'click', make_hide_function(element), false
      );
    this.element = element;
    this.close_button = close_button;
  }

  Window.prototype = WindowPrototype;

  var exports = {Window};

  // Load windows.
  for (var win in windows) {
    const element = document.getElementById("xwin-" + win);
    windows[win] = new Window(element);
    exports[win] = windows[win];
  }

  return exports;
});

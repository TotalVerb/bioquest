define(function() {
  const WindowPrototype = {
    open() {
      for (var win2 in res.windows) {
        res.windows[win2].close();
      }
      this.element.style.display = "block";
    },
    close() {
      this.element.style.display = "none";
    }
  };

  function make_hide_function(element) {
    return function() {
      element.style.display = "none";
    };
  }

  function make_window_object(element) {
    var close_button = document.getElementById(element.id + "-close");
    close_button.addEventListener(
      'click', make_hide_function(element), false
      );
    return Object.create(WindowPrototype, {
      element: {
        writeable: false,
        configurable: false,
        value: element
      },
      close_button: {
        writeable: false,
        configurable: false,
        value: close_button
      }
    });
  }

  return {make_window_object};
});

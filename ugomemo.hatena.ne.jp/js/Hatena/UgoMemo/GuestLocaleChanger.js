(function() {
    var container = Ten.querySelector('#header-locale-selector');
    var button = Ten.querySelector('#header-locale-selector .header-dropdown');
    var panel = Ten.querySelector('#header-locale-selector .header-window');

    if (!container) return;
    if (!button) return;
    if (!panel) return;

    var showing = false;

    new Ten.Observer(button, 'onclick', function(event) {
        try {
            if (showing) return;
            container.style.position = 'relative';
            panel.style.position = 'absolute';
            panel.style.display = 'block';
            panel.style.top = 33;
            panel.style.right = 0;
            showing = true;
            event.stop();
        } catch(error) {
        };
    });

    new Ten.Observer(document.body, 'onclick', function(event) {
        try {
            if (!showing) return;
            var target = event.target;
            while (target.parentNode) {
                if (Ten.DOM.hasClassName(target, 'header-window')) return;
                target = target.parentNode;
            }
            panel.style.display = 'none';
            showing = false;
        } catch(error) {
        };
    });
})();

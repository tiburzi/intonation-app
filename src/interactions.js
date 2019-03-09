function Interactions () {
    var two = null;
};

Interactions.init = function(_two) {
    this.two = _two;
}

// Interactivity code from https://two.js.org/examples/advanced-anchors.html
Interactions.add = function(shape) {

    var offset = shape.parent.translation; //translation relative to parent (ie if in group, where coordinates of a child are relative to the parent)
    var localClickPos = {x: 0, y: 0};
    var dragDist = 0; //differentiate a click from a drag (and give the user a bit of buffer) by measuring the distance the mouse moves during a mousedown-mouseup interval
    
    var correctE = function(e) {
        // Correct e to account for TWO's offset and scaling in the window
        var SVGscale = $(Interactions.two.renderer.domElement).height() / Interactions.two.height;
        var SVGorigin = $('#main-container')[0].getBoundingClientRect();
        e.clientX -= SVGorigin.left;
        e.clientX /= SVGscale;
        e.clientY -= SVGorigin.top;
        e.clientY /= SVGscale;
    }
    
    var drag = function(e) {
        e.preventDefault();
        correctE(e);
        dragDist += 1;
        
        //Call the shape's dragging method, if it has one
        if (typeof shape.onDrag === 'function') {shape.onDrag(e, offset, localClickPos);}
    };
    var touchDrag = function(e) {
      e.preventDefault();
      var touch = e.originalEvent.changedTouches[0];
      drag({
        preventDefault: _.identity,
        clientX: touch.pageX,
        clientY: touch.pageY
      });
      return false;
    };
    var dragStart = function(e) {
        e.preventDefault();
        correctE(e);
        localClickPos = {x: e.clientX-shape.translation.x, y: e.clientY-shape.translation.y};
        dragDist = 0;
        $(window)
            .bind('mousemove', drag)
            .bind('mouseup', dragEnd);
        
        //Call the shape's mouse click method, if it has one
        if (typeof shape.onMouseDown === 'function') {shape.onMouseDown(e, offset, localClickPos);}
    };
    var touchStart = function(e) {
        e.preventDefault();
        var touch = e.originalEvent.changedTouches[0];
        correctE(e);
        localClickPos = {x: touch.pageX-shape.translation.x, y: touch.pageY-shape.translation.y}
        dragDist = 0;
        $(window)
            .bind('touchmove', touchDrag)
            .bind('touchend', touchEnd);
        return false;
        
        //Call the shape's mouse click method, if it has one
        if (typeof shape.onMouseDown === 'function') {shape.onMouseDown(e, offset, localClickPos);}
    };
    var dragEnd = function(e) {
        e.preventDefault();
        correctE(e);
        $(window)
            .unbind('mousemove', drag)
            .unbind('mouseup', dragEnd);
        
        //Call the shape's click release method, if it has one
        if (typeof shape.onMouseUp === 'function') {shape.onMouseUp(e, offset, localClickPos);}
        if (dragDist < 5) {if (typeof shape.onClick === 'function') {shape.onClick(e, offset, localClickPos);}}
    };
    var touchEnd = function(e) {
        e.preventDefault();
        correctE(e);
        $(window)
            .unbind('touchmove', touchDrag)
            .unbind('touchend', touchEnd);
        
        //Call the shape's click release method, if it has one
        if (typeof shape.onMouseUp === 'function') {shape.onMouseUp(e, offset, localClickPos);}
        if (dragDist < 5) {if (typeof shape.onClick === 'function') {shape.onClick(e, offset, localClickPos);}}
        
        return false; //<--- anyone know why this returns false?
    };
    var enter = function(e) {
        correctE(e);
        e.preventDefault();
        
        //Call the shape's mouse enter method, if it has one
        if (typeof shape.onMouseEnter === 'function') {shape.onMouseEnter(e, offset, localClickPos);}
    };
    var leave = function(e) {
        correctE(e);
        e.preventDefault();
        
        //Call the shape's mouse leave method, if it has one
        if (typeof shape.onMouseLeave === 'function') {shape.onMouseLeave(e, offset, localClickPos);}
    };
    var hover = function(e) {
        correctE(e);
        e.preventDefault();
        
        //Call the shape's mouse move method, if it has one
        if (typeof shape.onMouseHover === 'function') {shape.onMouseHover(e, offset, localClickPos);}
    };

    Interactions.two.update(); // Need to call this before attempting to touch the SVG so that Twojs will actually create it

    $(shape._renderer.elem)
        .css({
            'cursor': 'pointer',
        })
        .bind('mousedown', dragStart)
        .bind('mouseup', dragEnd)
        .bind('touchstart', touchStart)
        .bind('mouseenter', enter)
        .bind('mouseleave', leave)
        .bind('mouseover', hover);

    $(shape._renderer.elem).dblclick(function(e){
        e.preventDefault();
        correctE(e);
        if (typeof shape.onDoubleClick === 'function') {shape.onDoubleClick(e,shape);}
    });
    
    // Define global mouse events
    document.addEventListener('mousemove', function(e) {
        e.preventDefault();
        correctE(e);
        dragDist += 1;
        if (typeof shape.onGlobalMouseMove === 'function') {shape.onGlobalMouseMove(e);}
    });
    document.addEventListener('mouseup', function(e) {
        e.preventDefault();
        correctE(e);
        if (typeof shape.onGlobalMouseUp === 'function') {shape.onGlobalMouseUp(e);}
        if (!dragDist < 5) {if (typeof shape.onGlobalClick === 'function') {shape.onGlobalClick(e);}}
    });
    document.addEventListener('mousedown', function(e) {
        e.preventDefault();
        correctE(e);
        dragDist = 0;
        if (typeof shape.onGlobalMouseDown === 'function') {shape.onGlobalMouseDown(e);}
    });
}

Interactions.addHoverScale = function(shape) {
    shape.clicked = false;
    shape.hoverOver = false;
    console.log(1);

    shape.onMouseEnter = function(e) {
        if (!shape.hoverOver && !shape.clicked) {
            TweenHelper.tweenToScale(shape, 1.2, 200);
            shape.hoverOver = true;
        }
    }
    shape.onMouseLeave = function(e) {
        if (shape.hoverOver && !shape.clicked) {
            TweenHelper.tweenToScale(shape, 1, 200);
            shape.hoverOver = false;
        }
    }
}
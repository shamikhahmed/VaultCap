'use strict';
/* VirtualList — lightweight scroll windowing for long lists */

const VirtualList = {
  /**
   * @param {HTMLElement} container - scrollable element (overflow-y:auto)
   * @param {Array} items
   * @param {number} rowHeight - fixed row height in px
   * @param {function(item, index): string} renderRow - returns HTML for one row
   */
  render(container, items, rowHeight, renderRow) {
    if (!container || !Array.isArray(items) || typeof renderRow !== 'function') return;

    const rowH = Math.max(24, Number(rowHeight) || 48);
    const list = items;
    const totalH = list.length * rowH;

    container.style.overflowY = 'auto';
    container.style.position = container.style.position || 'relative';

    let viewport = container.querySelector('.vl-viewport');
    if (!viewport) {
      container.innerHTML = '';
      viewport = document.createElement('div');
      viewport.className = 'vl-viewport';
      viewport.style.position = 'relative';
      viewport.style.width = '100%';
      container.appendChild(viewport);
    }

    viewport.style.height = totalH + 'px';

    let pool = container._vlPool;
    if (!pool) {
      pool = document.createElement('div');
      pool.className = 'vl-pool';
      pool.style.position = 'absolute';
      pool.style.left = '0';
      pool.style.right = '0';
      pool.style.top = '0';
      viewport.appendChild(pool);
      container._vlPool = pool;
    }

    const paint = () => {
      const scrollTop = container.scrollTop || 0;
      const viewH = container.clientHeight || 400;
      const start = Math.max(0, Math.floor(scrollTop / rowH) - 2);
      const end = Math.min(list.length, Math.ceil((scrollTop + viewH) / rowH) + 2);
      pool.style.transform = 'translateY(' + (start * rowH) + 'px)';

      let html = '';
      for (let i = start; i < end; i++) {
        html += '<div class="vl-row" style="height:' + rowH + 'px;box-sizing:border-box" data-idx="' + i + '">'
          + renderRow(list[i], i) + '</div>';
      }
      pool.innerHTML = html;
    };

    if (container._vlScroll) {
      container.removeEventListener('scroll', container._vlScroll);
    }
    container._vlScroll = paint;
    container.addEventListener('scroll', paint, { passive: true });

    if (container._vlResize && typeof ResizeObserver !== 'undefined') {
      container._vlResize.disconnect();
    }
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(paint);
      ro.observe(container);
      container._vlResize = ro;
    }

    paint();
  },

  destroy(container) {
    if (!container) return;
    if (container._vlScroll) {
      container.removeEventListener('scroll', container._vlScroll);
      container._vlScroll = null;
    }
    if (container._vlResize) {
      container._vlResize.disconnect();
      container._vlResize = null;
    }
    container._vlPool = null;
  },
};

window.VirtualList = VirtualList;

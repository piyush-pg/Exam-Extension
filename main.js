(function() {
  const STORAGE_KEY = "mouse-block-enabled-7874031313"; // must be unique to extension and match background.js
  const LAYER_ID = "mouse-block-9474875377"; // must be unique to extension
  const LAYER_CSS = `position: fixed !important;
    inset: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    z-index: 2147483647 !important;
    transform: none !important;
    cursor: not-allowed !important;`;

  /**
   * @param {Event} e
   */
  const blockEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * @param {string} id
   * @returns {HTMLElement}
   */
  const createLayer = (id) => {
    const layer = document.createElement("div");
    layer.id = id;

    layer.insertAdjacentHTML('afterbegin', `<style>
      #${id} {
        ${LAYER_CSS}
      }

      #${id} ~ * {
        z-index: 0 !important;
      }
    </style>`);

    layer.onclick = blockEvent;
    layer.oncontextmenu = blockEvent;
    layer.onmousedown = blockEvent;
    layer.onmouseup = blockEvent;
    layer.onmouseover = blockEvent;
    layer.onwheel = blockEvent;
    return layer;
  };

  /**
   * @param {string} id
   * @returns {HTMLElement}
   */
  const getLayer = (id) => document.getElementById(id) || createLayer(id);

  /**
   *
   * @param {HTMLElement} layer
   * @returns {boolean}
   */
  const isLayerActive = (layer) => document.body.contains(layer);

  /**
   * @param {HTMLElement} layer
   * @param {boolean=} active
   * @returns {void}
   */
  const toggleLayer = (layer, active) => {
    const currentlyActive = isLayerActive(layer);

    let shouldActivateLayer = !currentlyActive;

    if (typeof active === "boolean") {
      shouldActivateLayer = active;
    }

    if (shouldActivateLayer === currentlyActive) return;

    if (shouldActivateLayer) {
      document.body.append(layer);
    } else {
      layer.remove();
    }
  };

  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const layer = getLayer(LAYER_ID);
    toggleLayer(layer, result[STORAGE_KEY]);
  });
}());

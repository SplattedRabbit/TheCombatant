// Tests/setup.js - Global Browser Environment Mock for Node.js Testing

globalThis.window = {
  location: {
    reload() {
      // Mock reload
    }
  },
  addEventListener() {},
  removeEventListener() {},
  onerror: null,
  onunhandledrejection: null
};

// Create a helper mock element generator
const createMockElement = (tagName = 'div') => {
  return {
    tagName: tagName.toUpperCase(),
    id: '',
    className: '',
    _style: {
      setProperty() {},
      display: 'block',
      opacity: '0'
    },
    get style() {
      return this._style;
    },
    set style(val) {
      if (typeof val === 'string') {
        const parts = val.split(';');
        parts.forEach(p => {
          const colon = p.indexOf(':');
          if (colon > -1) {
            const propName = p.slice(0, colon).trim();
            const propVal = p.slice(colon + 1).trim();
            const camelName = propName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            this._style[camelName] = propVal;
          }
        });
      } else {
        Object.assign(this._style, val);
      }
    },
    textContent: '',
    value: '',
    parentElement: null,
    children: [],
    dataset: {},
    appendChild(child) {
      if (child) {
        child.parentElement = this;
        this.children.push(child);
      }
      return child;
    },
    removeChild(child) {
      this.children = this.children.filter(c => c !== child);
      return child;
    },
    remove() {
      if (this.parentElement) {
        this.parentElement.removeChild(this);
      }
    },
    querySelector(selector) {
      if (!this._queries) this._queries = {};
      if (!this._queries[selector]) {
        this._queries[selector] = createMockElement();
        this._queries[selector].parentElement = this;
        if (selector === '.pc-prompt-input') {
          this._queries[selector].value = '5';
        }
      }
      return this._queries[selector];
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
    removeEventListener() {},
    focus() {},
    select() {},
    getBoundingClientRect() {
      return { top: 0, left: 0, width: 0, height: 0 };
    },
    click() {
      if (typeof this.onclick === 'function') {
        this.onclick({ target: this, preventDefault() {}, stopPropagation() {} });
      }
    },
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() { return false; }
    }
  };
};

const mockBody = createMockElement('body');
globalThis.document = {
  activeElement: null,
  body: mockBody,
  getElementById(id) {
    const el = createMockElement();
    el.id = id;
    return el;
  },
  querySelector(selector) {
    const el = createMockElement();
    if (selector.startsWith('.')) {
      el.className = selector.slice(1);
    }
    return el;
  },
  querySelectorAll() {
    return [];
  },
  createElement(tagName) {
    return createMockElement(tagName);
  },
  addEventListener() {},
  removeEventListener() {}
};

Object.defineProperty(globalThis, 'navigator', {
  value: {
    onLine: true,
    serviceWorker: {
      register() {
        return Promise.resolve({ scope: '/' });
      }
    }
  },
  writable: true,
  configurable: true
});

globalThis.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

globalThis.Peer = class MockPeer {
  constructor(id, options) {
    this.id = id || 'mock-peer-id';
    this.options = options;
  }
  on(event, callback) {
    // Save callbacks if needed
  }
  connect(peerId) {
    return {
      peer: peerId,
      open: true,
      on() {},
      send() {}
    };
  }
  destroy() {}
};

// Global setup for CombatSpells registry in tests
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CombatSpells } from '../js/spells.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const books = ['phb', 'phb2', 'ca', 'cs'];
books.forEach(book => {
  const spellsPath = path.resolve(__dirname, `../data/spells-${book}.json`);
  if (fs.existsSync(spellsPath)) {
    const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf8'));
    Object.keys(spellsData).forEach(spellKey => {
      spellsData[spellKey].source = book;
    });
    Object.assign(CombatSpells.REGISTRY, spellsData);
  }
});

// Mock dynamic UI shared registry functions
import { uiRegistry } from '../js/ui/ui-shared.js';
uiRegistry.renderPlayerScreen = () => {};
uiRegistry.renderAll = () => {};
uiRegistry.renderInitBar = () => {};
uiRegistry.renderConc = () => {};


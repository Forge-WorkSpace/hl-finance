/* Lucide-style inline SVG icons (1.5px stroke, round caps) */
(function () {
  const P = (d) => d;
  // each icon = array of <path>/<elements> JSX via React.createElement
  const h = React.createElement;
  const paths = {
    'layout-dashboard': ['rect:3,3,7,9;1', 'rect:14,3,7,5;1', 'rect:14,12,7,9;1', 'rect:3,16,7,5;1'],
    users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'circle:9,7,4', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
    package: ['m7.5 4.27 9 5.15', 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z', 'm3.3 7 8.7 5 8.7-5', 'M12 22V12'],
    'file-text': ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M10 9H8', 'M16 13H8', 'M16 17H8'],
    'bar-chart-3': ['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
    settings: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'circle:12,12,3'],
    'log-out': ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
    'receipt-text': ['M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z', 'M14 8H8', 'M16 12H8', 'M13 16H8'],
    'circle-check': ['circle:12,12,10', 'm9 12 2 2 4-4'],
    'trending-up': ['M22 7 13.5 15.5 8.5 10.5 2 17', 'M16 7h6v6'],
    wallet: ['M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 1-1 1v-4', 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4'],
    search: ['circle:11,11,8', 'm21 21-4.3-4.3'],
    bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
    'help-circle': ['circle:12,12,10', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3', 'M12 17h.01'],
    plus: ['M5 12h14', 'M12 5v14'],
    pencil: ['M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497Z', 'm15 5 4 4'],
    eye: ['M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0', 'circle:12,12,3'],
    gift: ['rect:3,8,18,4;1', 'M12 8v13', 'M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7', 'M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5'],
    'chevron-down': ['m6 9 6 6 6-6'],
    'chevron-right': ['m9 18 6-6-6-6'],
    x: ['M18 6 6 18', 'M6 6l12 12'],
    'trash-2': ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M10 11v6', 'M14 11v6'],
    calendar: ['M8 2v4', 'M16 2v4', 'rect:3,4,18,18;2', 'M3 10h18'],
    'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
    download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'],
    'alert-circle': ['circle:12,12,10', 'M12 8v4', 'M12 16h.01'],
    'check': ['M20 6 9 17l-5-5'],
    'lock': ['rect:3,11,18,11;2', 'M7 11V7a5 5 0 0 1 10 0v4'],
    'mail': ['M22 7 13.03 12.7a1.94 1.94 0 0 1-2.06 0L2 7', 'rect:2,4,20,16;2'],
    'inbox': ['M22 12h-6l-2 3h-4l-2-3H2', 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'],
    'tag': ['M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z', 'circle:7.5,7.5,0.5'],
    'sticky-note': ['M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11l5-5V5a2 2 0 0 0-2-2', 'M15 3v4a2 2 0 0 0 2 2h4'],
    'menu': ['M4 12h16', 'M4 6h16', 'M4 18h16'],
  };

  function renderParts(name) {
    const list = paths[name];
    if (!list) return [h('circle', { key: 'q', cx: 12, cy: 12, r: 9 })];
    return list.map((seg, i) => {
      if (seg.startsWith('rect:')) {
        const m = seg.slice(5).split(';');
        const [x, y, w, ht] = m[0].split(',').map(Number);
        const rx = m[1] ? Number(m[1]) : 0;
        return h('rect', { key: i, x, y, width: w, height: ht, rx });
      }
      if (seg.startsWith('circle:')) {
        const [cx, cy, r] = seg.slice(7).split(',').map(Number);
        return h('circle', { key: i, cx, cy, r });
      }
      return h('path', { key: i, d: seg });
    });
  }

  function Icon({ name, size = 20, className = '', style = {}, strokeWidth = 1.75 }) {
    return h('svg', {
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
      className, style, 'aria-hidden': true,
    }, renderParts(name));
  }

  window.Icon = Icon;
})();

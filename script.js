document.addEventListener('DOMContentLoaded', function () {

  // ============================================================
  // Co-author Network (vis.js)
  // ============================================================
  const container = document.getElementById('coauthor-graph');

  if (container && typeof vis !== 'undefined') {

    function buildColors() {
      const light = document.documentElement.classList.contains('light');
      return {
        coauthor: {
          color: {
            background: light ? '#dde8f5' : '#161b22',
            border:     light ? '#9bbde0' : '#21262d',
            highlight:  { background: light ? '#c8daf0' : '#1c2128', border: light ? '#0969da' : '#4f8ef7' },
            hover:      { background: light ? '#c8daf0' : '#1c2128', border: light ? '#0969da' : '#4f8ef7' }
          },
          font: { color: light ? '#1f2328' : '#8b949e', size: 12, face: 'Inter, sans-serif' }
        },
        luca: {
          color: {
            background: light ? '#0969da' : '#2d5aa8',
            border:     light ? '#0550ae' : '#4f8ef7',
            highlight:  { background: light ? '#1a7fe8' : '#3d6ab8', border: light ? '#0969da' : '#6aa3ff' },
            hover:      { background: light ? '#1a7fe8' : '#3d6ab8', border: light ? '#0969da' : '#6aa3ff' }
          },
          font: { color: '#ffffff', size: 14, face: 'Inter, sans-serif', bold: true }
        },
        edge: {
          color:     light ? '#9bbde0' : '#21262d',
          hover:     light ? '#0969da' : '#4f8ef7',
          highlight: light ? '#0969da' : '#4f8ef7'
        }
      };
    }

    const c = buildColors();

    const nodes = new vis.DataSet([
      { id: 0, label: 'Luca Kämmer',    size: 28, shape: 'dot', color: c.luca.color,      font: c.luca.font },
      { id: 1, label: 'Kreyenmeier P.', size: 18, shape: 'dot', color: c.coauthor.color,  font: c.coauthor.font },
      { id: 2, label: 'Fooken J.',       size: 14, shape: 'dot', color: c.coauthor.color,  font: c.coauthor.font },
      { id: 3, label: 'Spering M.',      size: 14, shape: 'dot', color: c.coauthor.color,  font: c.coauthor.font },
      { id: 4, label: 'Kroell L.',       size: 12, shape: 'dot', color: c.coauthor.color,  font: c.coauthor.font },
      { id: 5, label: 'Knapen T.',       size: 12, shape: 'dot', color: c.coauthor.color,  font: c.coauthor.font },
      { id: 6, label: 'Rolfs M.',        size: 16, shape: 'dot', color: c.coauthor.color,  font: c.coauthor.font },
      { id: 7, label: 'Hebart M.',       size: 18, shape: 'dot', color: c.coauthor.color,  font: c.coauthor.font },
      { id: 8, label: 'Kroner A.',       size: 12, shape: 'dot', color: c.coauthor.color,  font: c.coauthor.font }
    ]);

    function edgeColor(ec) {
      return { color: ec.color, hover: ec.hover, highlight: ec.highlight, inherit: false };
    }

    const edges = new vis.DataSet([
      { id: 'e0',  from: 0, to: 7, width: 3,   smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e1',  from: 0, to: 6, width: 2,   smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e2',  from: 0, to: 4, width: 2,   smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e3',  from: 0, to: 5, width: 2,   smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e4',  from: 0, to: 1, width: 2,   smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e5',  from: 0, to: 2, width: 2,   smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e6',  from: 0, to: 3, width: 2,   smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e7',  from: 0, to: 8, width: 1,   smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e8',  from: 1, to: 2, dashes: true, width: 0.8, smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e9',  from: 1, to: 3, dashes: true, width: 0.8, smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e10', from: 2, to: 3, dashes: true, width: 0.8, smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e11', from: 4, to: 5, dashes: true, width: 0.8, smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e12', from: 4, to: 6, dashes: true, width: 0.8, smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e13', from: 4, to: 7, dashes: true, width: 0.8, smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e14', from: 5, to: 6, dashes: true, width: 0.8, smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e15', from: 5, to: 7, dashes: true, width: 0.8, smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e16', from: 6, to: 7, dashes: true, width: 0.8, smooth: { type: 'continuous' }, color: edgeColor(c.edge) },
      { id: 'e17', from: 7, to: 8, dashes: true, width: 0.8, smooth: { type: 'continuous' }, color: edgeColor(c.edge) }
    ]);

    const options = {
      nodes: {
        shape: 'dot',
        borderWidth: 2,
        borderWidthSelected: 3
      },
      edges: {
        smooth: { type: 'continuous' }
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -4000,
          centralGravity: 0.6,
          springLength: 80,
          springConstant: 0.06,
          damping: 0.12,
          avoidOverlap: 0.3
        },
        stabilization: { iterations: 250, fit: true }
      },
      interaction: {
        hover: true,
        tooltipDelay: 150,
        hideEdgesOnDrag: false,
        zoomView: true,
        dragView: true
      },
      layout: {
        improvedLayout: true
      }
    };

    new vis.Network(container, { nodes, edges }, options);

    // Update node/edge colors when theme class changes
    new MutationObserver(function () {
      const nc = buildColors();
      nodes.update([
        { id: 0, color: nc.luca.color,     font: nc.luca.font },
        { id: 1, color: nc.coauthor.color, font: nc.coauthor.font },
        { id: 2, color: nc.coauthor.color, font: nc.coauthor.font },
        { id: 3, color: nc.coauthor.color, font: nc.coauthor.font },
        { id: 4, color: nc.coauthor.color, font: nc.coauthor.font },
        { id: 5, color: nc.coauthor.color, font: nc.coauthor.font },
        { id: 6, color: nc.coauthor.color, font: nc.coauthor.font },
        { id: 7, color: nc.coauthor.color, font: nc.coauthor.font },
        { id: 8, color: nc.coauthor.color, font: nc.coauthor.font }
      ]);
      const ec = edgeColor(nc.edge);
      edges.update(edges.getIds().map(function (id) {
        return { id: id, color: ec };
      }));
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

});

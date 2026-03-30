document.addEventListener('DOMContentLoaded', function () {

  // ============================================================
  // Co-author Network (vis.js)
  // ============================================================
  const container = document.getElementById('coauthor-graph');

  if (container && typeof vis !== 'undefined') {

    const coauthorStyle = {
      color: {
        background: '#161b22',
        border: '#21262d',
        highlight: { background: '#1c2128', border: '#4f8ef7' },
        hover:      { background: '#1c2128', border: '#4f8ef7' }
      },
      font: { color: '#8b949e', size: 12, face: 'Inter, sans-serif' },
      shape: 'dot'
    };

    const nodes = new vis.DataSet([
      {
        id: 0,
        label: 'Luca Kämmer',
        size: 28,
        color: {
          background: '#2d5aa8',
          border: '#4f8ef7',
          highlight: { background: '#3d6ab8', border: '#6aa3ff' },
          hover:      { background: '#3d6ab8', border: '#6aa3ff' }
        },
        font: { color: '#e6edf3', size: 14, face: 'Inter, sans-serif', bold: true },
        shape: 'dot'
      },
      { id: 1, label: 'Kreyenmeier P.', size: 18, ...coauthorStyle },
      { id: 2, label: 'Fooken J.',       size: 14, ...coauthorStyle },
      { id: 3, label: 'Spering M.',      size: 14, ...coauthorStyle },
      { id: 4, label: 'Kroell L.',       size: 12, ...coauthorStyle },
      { id: 5, label: 'Knapen T.',       size: 12, ...coauthorStyle },
      { id: 6, label: 'Rolfs M.',        size: 16, ...coauthorStyle },
      { id: 7, label: 'Hebart M.',       size: 18, ...coauthorStyle }
    ]);

    const edgeDefaults = {
      color: { color: '#21262d', hover: '#4f8ef7', highlight: '#4f8ef7', inherit: false },
      smooth: { type: 'continuous' }
    };

    const edges = new vis.DataSet([
      // Luca — co-author edges (solid, thicker = more shared work)
      { from: 0, to: 7, width: 2.5, ...edgeDefaults },  // Hebart: supervisor
      { from: 0, to: 6, width: 2,   ...edgeDefaults },  // Rolfs: close collaborator
      { from: 0, to: 1, width: 2,   ...edgeDefaults },  // Kreyenmeier: 2 shared pubs
      { from: 0, to: 2, width: 1.5, ...edgeDefaults },  // Fooken
      { from: 0, to: 3, width: 1.5, ...edgeDefaults },  // Spering
      { from: 0, to: 4, width: 1,   ...edgeDefaults },  // Kroell
      { from: 0, to: 5, width: 1,   ...edgeDefaults },  // Knapen

      // Inter-co-author edges (dashed, lighter)
      { from: 1, to: 2, dashes: true, width: 0.8, ...edgeDefaults },
      { from: 1, to: 3, dashes: true, width: 0.8, ...edgeDefaults },
      { from: 2, to: 3, dashes: true, width: 0.8, ...edgeDefaults },
      { from: 4, to: 6, dashes: true, width: 0.8, ...edgeDefaults },
      { from: 5, to: 6, dashes: true, width: 0.8, ...edgeDefaults },
      { from: 6, to: 7, dashes: true, width: 1,   ...edgeDefaults }
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
          gravitationalConstant: -6000,
          centralGravity: 0.35,
          springLength: 130,
          springConstant: 0.04,
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
  }

});

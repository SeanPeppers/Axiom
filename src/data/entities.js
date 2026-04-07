export const ENTITIES = [
  {
    id: 'data-node',
    label: 'Data Node',
    abbr: 'DN',
    shape: 'square',
    colors: {
      fill: '#1e1b4b',
      stroke: '#6366f1',
      glow: '#6366f1',
      text: '#a5b4fc',
      dimText: 'rgba(165,180,252,0.35)',
    },
  },
  {
    id: 'firewall',
    label: 'Firewall',
    abbr: 'FW',
    shape: 'hexagon',
    colors: {
      fill: '#022c22',
      stroke: '#10b981',
      glow: '#10b981',
      text: '#6ee7b7',
      dimText: 'rgba(110,231,183,0.35)',
    },
  },
  {
    id: 'router',
    label: 'Router',
    abbr: 'RT',
    shape: 'circle',
    colors: {
      fill: '#2e1065',
      stroke: '#8b5cf6',
      glow: '#8b5cf6',
      text: '#c4b5fd',
      dimText: 'rgba(196,181,253,0.35)',
    },
  },
  {
    id: 'virus',
    label: 'Virus',
    abbr: 'VX',
    shape: 'triangle',
    colors: {
      fill: '#3b0a0a',
      stroke: '#ef4444',
      glow: '#ef4444',
      text: '#fca5a5',
      dimText: 'rgba(252,165,165,0.35)',
    },
  },
]

export const getEntity = (id) => ENTITIES.find((e) => e.id === id)

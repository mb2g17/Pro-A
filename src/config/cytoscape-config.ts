const myConfig: object = {
    style: [
        { // State
            selector: 'node',
            style: {
                'background-color': '#666',
                'content': 'data(displayName)',
                'min-zoomed-font-size': '9px'
            },
        },
        { // Selected state
            selector: ':selected',
            style: {
                'background-color': '#933',
                'color': '#F00'
            }
        },
        { // Initial state
            selector: '.initial-node',
            style: {
                'background-color': '#00f',
                'content': 'data(displayName)',
            },
        },
        { // Final state
            selector: '.final-node',
            style: {
                'background-color': '#666',
                'border-width': 4,
                'content': 'data(displayName)',
            },
        },
        { // Highlighted state
            selector: '.highlighted-node',
            style: {
                'background-color': '#ff0',
            },
        },
        { // Edge handle
            selector: '.eh-handle',
            style: {
                'background-color': 'red',
                'width': 12,
                'height': 12,
                'shape': 'ellipse',
                'overlay-opacity': 0,
                'border-width': 12,
                'border-opacity': 0,
                'label': '',
            },
        },
        { // Hovering over a state, edge handle
            selector: '.eh-hover',
            style: {
                'background-color': 'red',
            },
        },
        { // Making a transition, source state
            selector: '.eh-source',
            style: {
                'border-width': 2,
                'border-color': 'red',
            },
        },
        { // Making a transition, target state
            selector: '.eh-target',
            style: {
                'border-width': 2,
                'border-color': 'red',
            },
        },
        { // Making a transition, arrow
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
                'background-color': 'red',
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red',
            },
        },
        { // Transition
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#ccc',
                'content': 'data(label)',

                'curve-style': 'bezier',
                'target-arrow-color': '#eee',
                'target-arrow-shape': 'triangle',
                'arrow-scale': 1,

                'loop-direction': '-45deg',
                'loop-sweep': '90deg',

                'min-zoomed-font-size': '9px'

                //'control-point-step-size': '70px',
            },
        },
        { // Parent (state fold node)
            selector: '.parent',
            style: {
                'background-color': '#50b8f8',
                'border-width': 1,
                'border-color': 'black'
            }
        },
        { // Parent (state fold node)
            selector: '.parent:selected',
            style: {
                'background-color': '#5099f8',
            }
        },
        { // Parent (collapsed)
            selector: '.cy-expand-collapse-collapsed-node',
            style: {
                'border-width': 1,
                'border-color': 'black'
            }
        }
    ],
    layout: {
        name: 'grid',
        rows: 1,
    },

    wheelSensitivity: 0.15,
    minZoom: 0.1,
    maxZoom: 10,
    pixelRatio: 1,
    hideEdgesOnViewport: true,
    textureOnViewport: true,
};

export default myConfig;

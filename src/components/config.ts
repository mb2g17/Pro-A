const myConfig: object = {
    style: [
        { // State
            selector: 'node',
            style: {
                'background-color': '#666',
                'content': 'data(name)',
            },
        },
        { // Initial state
            selector: '.initial-node',
            style: {
                'background-color': '#00f',
                'content': 'data(id)',
            },
        },
        { // Final state
            selector: '.final-node',
            style: {
                'border-width': 4,
                'content': 'data(id)',
            },
        },
        {
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
        {
            selector: '.eh-hover',
            style: {
                'background-color': 'red',
            },
        },
        {
            selector: '.eh-source',
            style: {
                'border-width': 2,
                'border-color': 'red',
            },
        },
        {
            selector: '.eh-target',
            style: {
                'border-width': 2,
                'border-color': 'red',
            },
        },
        {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
                'background-color': 'red',
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red',
            },
        },
        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#ccc',
                'content': 'data(label)',

                'curve-style': 'bezier',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle',
                'arrow-scale': 2,
            },
        },
    ],
    layout: {
        name: 'grid',
        rows: 1,
    },
};

export default myConfig;

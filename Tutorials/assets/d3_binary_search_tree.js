
const node_radius = 10;

class D3BinarySearchTree {

    constructor(container, width, height, margins={x:10, y:10}) {
        this.container = container;
        this.width = width;
        this.height = height;
        this.margins = margins;

        this.treemap = d3.tree()
                         .size([width, height]);
        this.root = null;

        const selCon = d3.select(this.container);
        this.svg = selCon.append('svg')
                         .attr('id', 'bst_svg')
                         .attr('viewBox', [0, 0,
                                           this.width,
                                           this.height]);
        this.svg.append('g')
                .classed('bst_link', true);
        this.svg.append('g')
                .classed('bst_node', true);

    }

    setTree(tree) {
        let i = -1;
        this.root = d3.hierarchy(tree.root, function(d) {
            if (d.value === -1)
                return;

            d.nodeId = ++i;
            d.children = [];

            if (d.left)
                d.children.push(d.left);
            else
                d.children.push(new BSTNode(-1));

            if (d.right)
                d.children.push(d.right);
            else
                d.children.push(new BSTNode(-1));

            return d.children;
        });

        this.treemap(this.root);
    }

    update(data) {

        this.clear();
        this.setTree(data);

        // Links
        d3.select('#bst_svg g.bst_link')
            .selectAll('line.bst_link')
            .data(this.root.links())
            .join(
                enter => enter.append('line')
                    .classed('bst_link', function(d) {
                        return d.target.data.value > -1; })
                    .classed('bst_link_hidden', function(d) {
                        return d.target.data.value === -1; })
            )
            .attr('x1', function(d) {return d.source.x;})
            .attr('y1', function(d) {return d.source.y + (1.5 * node_radius);})
            .attr('x2', function(d) {return d.target.x;})
            .attr('y2', function(d) {return d.target.y + (1.5 * node_radius);});

        // Nodes
        d3.select('#bst_svg g.bst_node')
            .selectAll('circle.bst_node')
            .data(this.root.descendants())
            .join( (enter) => {
                const g = enter.append('g')
                    .attr('id', function(d) { return "bst_node_" + d.data.nodeId; })
                    .classed('bst_node', function(d) {
                        return d.data.value > -1; })
                    .classed('bst_node_hidden', function(d) {
                        return d.data.value === -1; })
                    .classed('bst_node_non_root', true)
                    .attr("transform", function(d){
                        return "translate(" + d.x + "," + (d.y + (1.5 * node_radius)) + ")";
                    });

                g.append('circle')
                    .classed('bst_node', function(d) {
                        return d.data.value > -1; })
                    .classed('bst_node_hidden', function(d) {
                        return d.data.value === -1; })
                    .attr('r', node_radius);

                g.append('text')
                    .classed('bst_node', function(d) {
                        return d.data.value > -1; })
                    .classed('bst_node_hidden', function(d) {
                        return d.data.value === -1; })
                    .attr("dy", ".35em")
                    .attr("text-anchor", "middle")
                    .text(function(d){ return d.data.value; })

                return g;
            });
    }

    findNode(value, root=this.root) {
        if (!root)
            return null;
        else if (root.data.value === value)
            return root;
        else if (value < root.data.value)
            return this.findNode(value, root.data.left ? root.children[0] : null);
        else
            return this.findNode(value, root.data.right ? root.children[1] : null);
    } // findNode

    createTempNode(container, value) {
        const svg = d3.select(container);

        const temp = svg.append('g')
            .attr('id', 'bst_node_temp')
            .classed('bst_node', true)
            .classed('bst_node_non_root', true);

        temp.append('circle')
            .classed('bst_node', true)
            .classed('bst_node_non_root', true)
            .attr('r', node_radius)

        temp.append('text')
            .classed('bst_node', true)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(value);

        this.moveTempNode({
            x: node_radius + 2,
            y: node_radius + 2
        });

        return temp;
    } // createTempNode

    moveTempNode(coordinates) {
        const tNode = d3.select('#bst_node_temp');

        tNode.transition()
            .duration(750)
            .attr('transform', "translate(" + coordinates.x + "," + coordinates.y + ")");
    } // moveTempNode

    moveTempToNode(value) {
        const pNode = this.findNode(value);

        this.moveTempNode({
            x: pNode.x - 2.5 * node_radius,
            y: pNode.y + node_radius * 1.5} );
    } // moveTempNodeToLeft


    removeTempNode() {
        const tNode = d3.select('#bst_node_temp');
        tNode.remove();
    }

    clear() {
        this.root = null;
        const svg = d3.select('#bst_svg');
        svg.select("g.bst_link").selectAll("*").remove();
        svg.select("g.bst_node").selectAll("*").remove();
    }

}




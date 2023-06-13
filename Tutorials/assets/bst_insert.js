
class BstInsert {

    Steps = {
        InsertDone: -1,
        InsertCall: 0,
        IfRootNull: 1,
        RootAssign: 2,
        IfValueLess: 3,
        InsertLeft: 4,
        InsertRight: 6,
        ReturnRoot: 7
    }

    LightSteelBlue = '#b0c4de';
    Gold = '#ffd700';

    constructor(container, width, height, margins={x:10, y:10}) {

        this.container = container;
        this.width = width;
        this.height = height;
        this.margins = margins;

        this.numbers = [6,9,3,4,7,8,1,15,5];
        this.index = 0;
        this.debug = [];
        this.debug.push({
            step: this.Steps.InsertCall,
            value: this.numbers[this.index],
            root: null,
            depth: 0,
            refresh: false,
            returning: false
        });
        //this.index++;

        this.tree = new BinarySearchTree();
        this.treeMap = new D3BinarySearchTree('#bst_canvas', width, height);

        this.addMainCode(this.numbers, "#bst_main_canvas", {width: 400, height: 120});

        this.temp = null;
        this.nextBlock = null;
        this.debugVariables = null;
        this.addInsertCode();
    }

    addMainCode(numbers, container, dimensions) {
        const mainCon = d3.select(container);
        const mainSvg = mainCon.append('svg')
            .attr('id', 'bst_main_svg')
            .attr('viewBox', [0, 0,
                dimensions.width,
                dimensions.height]);

        const mainCode = [
            `int main() {`,
            `   BSTree tree;`,
            `   int values[] = {${numbers}}`,
            `   for (auto i : values) {`,
            `      tree->root = tree.insert(new Node(i), tree->root);`,
            `   }`,
            `   return 0;`,
            `}`
        ];

        const mainText = mainSvg.append('text')
            .attr('id', 'bst_main_code')
            .classed('bst_code', true);

        for (let i = 0; i < mainCode.length; i++) {
            mainText
                .append('tspan')
                .classed('bst_code', true)
                .attr('id', 'bst_main_code_' + i)
                .attr('x', '0')
                .attr('dy', '1.2em')
                .text(mainCode[i]);
        }


    } // addMainCode

    addInsertCode() {

        const codeCon = d3.select(this.container);

        const svg = codeCon.append('svg')
            .attr('id', 'bst_code_svg')
            .attr('viewBox', [0, 0,
                this.width,
                this.height]);

        this.nextBlock = svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 200)
            .attr('height', 10)
            .attr('fill', this.LightSteelBlue);

        const insertCode = [
            'Node insert(Node* node, Node* root) {',
            '   if (!root)',
            '      root = node;',
            '   else if (node->value <= root->value)',
            '      root->left = insert(node, root->left);',
            '   else',
            '      root->right = insert(node, root->right);',
            '   return root;',
            '}'
        ];

        const code = svg.append('text')
            .attr('id', 'bst_ins_code')
            .classed('bst_code', true);

        for (let i = 0; i < insertCode.length; i++) {
            code
                .append('tspan')
                .classed('bst_code', true)
                .attr('id', 'bst_ins_code_' + i)
                .attr('x', '0')
                .attr('dy', '1.2em')
                .text(insertCode[i]);
        }

        this.debugVariables = svg.append('text')
            .attr('id', 'bst_ins_vars')
            .classed('bst_code_vars', true)
            .attr('x', 0)
            .attr('dy', '0.9em');

    } // addInsertCode


    updateCodeDescription(text) {
        d3.select('#bst_code_desc')
            .html(text);
    } // updateCodeDescription

    step() {
        let next = this.debug.pop();

        const line = next.step;
        let vars = '', comments = '';
        let subtree = next.root;

        if (next.step !== this.Steps.InsertDone) {

            this.setRootBackground(next.root ? next.root : subtree);

            switch(next.step) {
                case this.Steps.InsertCall:
                    if (!this.temp && next.depth === 0) {
                        next.value = this.numbers[this.index];
                        this.index++;
                        this.temp = this.treeMap.createTempNode('#bst_svg', next.value);
                        if (next.root)
                            comments = `The <span class="bst_code_param">insert</span> method is called from <span class="bst_code_param">main</span> with the <span class="bst_code_param">node</span> parameter set to a <span class="bst_code_param">new Node(${next.value})</span> pointer for the next integer in the values list. The <span class="bst_code_param">tree->root</span> is passed to the <span class="bst_code_param">root</span> parameter to insert from the top of the tree.`;
                        else
                            comments = `The first call to <span class="bst_code_param">insert</span> from <span class="bst_code_param">main</span> passes the 1st integer in the <span class="bst_code_param">values</span> list as a <span class="bst_code_param">new Node(${next.value})</span> pointer to the <span class="bst_code_param">node</span> parameter, and <span class="bst_code_param">null</span> to the <span class="bst_code_param">root</span> parameter since the tree is empty.`;
                    }
                    else {
                        const prev = this.debug[this.debug.length - 1];
                        let subtreeSide = 'left';
                        if (prev.step === this.Steps.InsertRight)
                            subtreeSide = 'right';
                        comments = `The insert method is being called recursively to insert <span class="bst_code_param">node</span> value <span class="bst_code_param">${next.value}</span> to the ${subtreeSide} of subtree <span class="bst_code_param">root</span> value <span class="bst_code_param">${prev.root}</span>.`;

                    }
                    vars = `node(${next.value}) root(${next.root? next.root : 'null'})`;
                    next.step = this.Steps.IfRootNull;
                    break;

                case this.Steps.IfRootNull:
                    vars = `root(${next.root? next.root : 'null'})`;
                    comments = `If the <span class="bst_code_param">root</span> parameter is <span class="bst_code_param">null</span>, then the tree has been traversed to the spot where the <span class="bst_code_param">node</span> should be inserted, otherwise the tree needs to be traversed more.`;
                    if (!this.temp && next.depth === 0) {
                        next.value = this.numbers[this.index];
                        this.index++;
                        this.temp = this.treeMap.createTempNode('#bst_svg', next.value);
                    }

                    if (!next.root)
                        next.step = this.Steps.RootAssign;
                    else
                        next.step = this.Steps.IfValueLess;
                    break;

                case this.Steps.RootAssign:
                    vars = `root(${next.root? next.root : 'null'}) node(${next.value})`;
                    comments = `Since parameter <span class="bst_code_param">root</span> is null, the <span class="bst_code_param">node</span> parameter is added to the tree by assigning it to the local <span class="bst_code_param">root</span> parameter. `;
                    const node = this.tree.insert(new BSTNode(next.value), this.tree.root);
                    if (!this.tree.root) {
                        this.tree.root = node;
                        comments += `This is part of the first call to <span class="bst_code_param">insert</span>, so the local <span class="bst_code_param">root</span> parameter will be returned to <span class="bst_code_param">main</span> and assigned to <span class="bst_code_param">tree->root</span>.`;
                    }
                    else {
                        const prev = this.debug[this.debug.length - 1];
                        let subtreeSide = 'left';
                        if (prev.step === this.Steps.InsertRight)
                            subtreeSide = 'right';
                        comments += `This is part of a recursive call to <span class="bst_code_param">insert</span>, so the <span class="bst_code_param">root</span> parameter will be returned and placed to the ${subtreeSide} side of the parent node with value <span class="bst_code_param">${prev.root}</span>.`;
                    }
                    next.root = next.value;
                    this.temp = null;
                    next.step = this.Steps.ReturnRoot;
                    next.refresh = true;
                    break;

                case this.Steps.IfValueLess:
                    vars = `node(${next.value}) root(${next.root? next.root : 'null'})`;
                    comments = `The <span class="bst_code_param">root</span> parameter is not null, so the tree needs to be traversed more to locate where to place the new <span class="bst_code_param">node</span>. `;
                    comments += `If the <span class="bst_code_param">node</span> value is less than (or equal) to the current subtree <span class="bst_code_param">root</span>, then the node must be inserted to the left, else to the right. `;
                    this.treeMap.moveTempToNode(next.root);
                    if (next.value <= next.root)
                        next.step = this.Steps.InsertLeft;
                    else
                        next.step = this.Steps.InsertRight;
                    break;

                case this.Steps.InsertLeft:
                    if (!next.returning) {
                        const node = this.tree.findNode(next.root, this.tree.root);
                        vars = `node(${next.value}) root->left(${node.left ? node.left.value : 'null'})`;
                        comments = `Since <span class="bst_code_param">node</span> with value <span class="bst_code_param">${next.value}</span> is less than (or equal to) the current subtree <span class="bst_code_param">root</span> value <span class="bst_code_param">${next.root}</span>, `;
                        comments += `the <span class="bst_code_param">insert</span> method is called recursively with <span class="bst_code_param">node</span> and <span class="bst_code_param">root->left</span> to insert the node on the left side of this subtree.`;
                        this.debug.push({
                            step: this.Steps.InsertLeft,
                            value: next.value,
                            root: next.root,
                            left: node.left ? node.left.value : null,
                            depth: next.depth,
                            refresh: next.refresh,
                            returning: true
                        });
                        next.step = this.Steps.InsertCall;
                        next.root = null;
                        if (node)
                            next.root = node.left ? node.left.value : null;
                        //this.setRootBackground(next.root ? next.root : subtree);
                        next.depth += 1;
                    }
                    else {
                        vars = `root(${next.root})->left(${next.left ? next.left : 'null'}) *Node(${next.left ? next.left : next.value})`;
                        if (next.left)
                            comments = `Returning from recursive call to insert on the left side of the current subtree re-attaches <span class="bst_code_param">node</span> with value <span class="bst_code_param">${next.left}</span>. to this subtree's <span class="bst_code_param">root->left</span> pointer.`;
                        else
                            comments = `The new <span class="bst_code_param">node</span> with value <span class="bst_code_param">${next.value}</span> is assigned to the <span class="bst_code_param">left</span> pointer of subtree <span class="bst_code_param">root</span> with value <span class="bst_code_param">${next.root}</span>.`;
                        next.step = this.Steps.ReturnRoot;
                        subtree = next.root;
                        next.returning = next.depth > 0;
                    }
                    break;

                case this.Steps.InsertRight:
                    if (!next.returning) {
                        const node = this.tree.findNode(next.root, this.tree.root);
                        vars = `node(${next.value}) root->right(${node.right? node.right.value: 'null'})`;
                        comments = `Since <span class="bst_code_param">node</span> with value <span class="bst_code_param">${next.value}</span> is greater than the current subtree <span class="bst_code_param">root</span> value <span class="bst_code_param">${next.root}</span>, `;
                        comments += `the <span class="bst_code_param">insert</span> method is called recursively with <span class="bst_code_param">node</span> and <span class="bst_code_param">root->right</span> to insert the node on the right side of this subtree.`;
                        this.debug.push({
                            step: this.Steps.InsertRight,
                            value: next.value,
                            root: next.root,
                            right: node.right? node.right.value : null,
                            depth: next.depth,
                            refresh: next.refresh,
                            returning: true
                        });
                        next.step = this.Steps.InsertCall;
                        next.root = null;
                        if (node)
                            next.root = node.right ? node.right.value : null;
                        next.depth += 1;
                    }
                    else {
                        vars = `root(${next.root})->right(${next.right ? next.right : 'null'}) *Node(${next.right ? next.right : next.value})`;
                        if (next.right)
                            comments = `Returning from recursive call to <span class="bst_code_param">insert</span> on the right side of the current subtree re-attaches <span class="bst_code_param">node</span> with value <span class="bst_code_param">${next.right}</span>. to this subtree's <span class="bst_code_param">root->right</span> pointer.`;
                        else
                            comments = `The new <span class="bst_code_param">node</span> with value <span class="bst_code_param">${next.value}</span> is assigned to the <span class="bst_code_param">right</span> pointer of subtree <span class="bst_code_param">root</span> with value <span class="bst_code_param">${next.root}</span>.`;
                        next.step = this.Steps.ReturnRoot;
                        subtree = next.root;
                        next.returning = next.depth > 0;
                    }
                    break;

                case this.Steps.ReturnRoot:
                    vars = `root(${next.root})`;
                    if (next.refresh) {
                        this.treeMap.update(this.tree);
                        this.treeMap.removeTempNode();
                        next.refresh = false;
                    }
                    this.setRootBackground(subtree);
                    if (this.debug.length) {
                        next = this.debug.pop();
                        let subtreeSide = 'left';
                        if (next.step === this.Steps.InsertRight)
                            subtreeSide = 'right';
                        comments = `Return from call to <span class="bst_code_param">insert</span> from recursive call passing in parent node's (<span class="bst_code_param">root</span> with value <span class="bst_code_param">${next.root}</span>) <span class="bst_code_param">${subtreeSide}</span> pointer.`;
                    }
                    else {

                        if (this.index === this.numbers.length) {
                            next.step = this.Steps.InsertDone;
                            comments = `This is the final return to <span class="bst_code_param">main</span> from a call to <span class="bst_code_param">insert</span> which sets <span class="bst_code_param">tree->root</span> to the same <span class="bst_code_param">root</span> with value <span class="bst_code_param">${next.root}</span>.`;
                        }
                        else {
                            next.step = this.Steps.InsertCall;
                            comments = `Return to <span class="bst_code_param">main</span> from a call to <span class="bst_code_param">insert</span> sets <span class="bst_code_param">tree->root</span> to <span class="bst_code_param">*Node</span> with value <span class="bst_code_param">${next.root}</span>`;
                        }
                    }
                    break;
            } // switch

            this.debug.push(next);
        } // done

        this.moveNextBlock(line, vars);
        this.updateCodeDescription(comments);


    } // step


    setRootBackground(root) {
        d3.select('#bst_svg g.bst_node')
            .selectAll('g')
            .classed('bst_node_root', function(d) {
                return d.data.value === root
            })
            .classed('bst_node_non_root', function(d) {
                return d.data.value !== root
            })
            .selectAll('circle')
            .classed('bst_node_root', function(d) {
                return d.data.value === root
            })
            .classed('bst_node_non_root', function(d) {
                return d.data.value !== root
            });
    }

    moveNextBlock(line, vars) {

        if (line >= 0) {
            const tsBBox = document.getElementById('bst_ins_code_' + line).getBBox();
            this.nextBlock.attr('width', tsBBox.width)
                .attr('height', tsBBox.height)
                .attr('fill', this.Gold);

            this.nextBlock.transition()
                .duration(500)
                .attr('transform', "translate(" + tsBBox.x + "," + tsBBox.y + ")");


            this.debugVariables.text(vars);
            this.debugVariables.transition()
                .duration(500)
                .attr('transform', "translate(" + (tsBBox.x + tsBBox.width + 5) + "," + tsBBox.y + ")");
        }
        else { // done, turn off next block
            this.nextBlock.attr('fill', this.LightSteelBlue);
            $("#bst_node_next").text('Done');
            $("#bst_node_next").prop("disabled", true)
        }


    } // moveNextBlock

}
class BSTNode {
    constructor(value){
        this.value = value;
        this.parent = null;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor(){
        this.root = null;
    }

    // Insert Node
    insert(node, root, parent=this.root){

        if (!root) {
            root = node;
            root.parent = parent;
        }
        else if (node.value <= root.value) {
            root.left = this.insert(node, root.left, root);
        }
        else {
            root.right = this.insert(node, root.right, root);
        }

        return root;
    }

    findNode(value, root) {
        if (!root)
            return null;

        if (value === root.value)
            return root;
        else if (value < root.value)
            return this.findNode(value, root.left)
        else
            return this.findNode(value, root.right);
    }

}

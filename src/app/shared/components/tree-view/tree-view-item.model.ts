export class TreeViewItemModel {
  private _id: string;
  private _label: string;
  private _icon?: string;
  private _children: TreeViewItemModel[] = [];
  private _parent?: TreeViewItemModel;
  public checked: boolean = false;

  isVisible: boolean = true;
  isExpanded: boolean = false;
  data?: any;

  constructor(
    id: string,
    label: string,
    icon?: string,
    parent?: TreeViewItemModel
  ) {
    this._id = id;
    this._label = label;
    this._icon = icon;
    this._parent = parent;
  }

  get id() {
    return this._id;
  }

  get label() {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get icon() {
    return this._icon;
  }

  get children() {
    return this._children;
  }

  get isRoot() {
    return this._parent ? false : true;
  }

  get isLeaf() {
    return this._children.length == 0;
  }

  get hasChild() {
    return this._children.length > 0;
  }

  get level() {
    let level = 0;
    let ancestor = this._parent;

    while (ancestor) {
      ancestor = ancestor._parent;
      ++level;
    }

    return level;
  }

  add(item: TreeViewItemModel) {
    this._children.push(item);
    item._parent = this;
  }

  find(id: string): TreeViewItemModel | undefined {
    if (this._id === id) {
      return this;
    }

    for (const item of this._children) {
      const result = item.find(id);
      if (result) {
        return result;
      }
    }

    return undefined;
  }

  clear() {
    this._children = [];
  }

  expandAll() {
    this.isExpanded = true;
    for (const item of this._children) {
      item.expandAll();
    }
  }

  collapseAll() {
    this.isExpanded = false;
    for (const item of this._children) {
      item.expandAll();
    }
  }

  printTree() {
    if (this.isRoot) {
      console.log('Root');
    } else {
      console.log('>'.repeat(this.level) + this.id + ':' + this.label);
    }

    for (const item of this._children) {
      item.printTree();
    }
  }

  traverse(callback: (item: TreeViewItemModel) => void) {
    callback(this);
    for (const item of this._children) {
      item.traverse(callback);
    }
  }

  traverseInverse(callback: (item: TreeViewItemModel) => void) {
    let ancestor = this._parent;

    while (ancestor) {
      callback(ancestor);
      ancestor = ancestor._parent;
    }
  }

  remove(id: string) {
    let child = this.find(id);
    if (!child) {
      console.debug(`Child with id ${id} does not exists`);
      return;
    }

    const parent = child._parent;
    if (!parent) {
      console.debug(`Can not remove child without parent`);
      return;
    }

    parent._children = parent._children.filter((e) => e.id !== id);
    child._parent = undefined;
    child = undefined;
  }
}

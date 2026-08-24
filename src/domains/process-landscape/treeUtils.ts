import type { ProcessElement } from './types'

export interface TreeNode extends ProcessElement {
  children: TreeNode[]
}

/** Build a nested tree from a flat adjacency list, linked by id ↔ parentId. */
export function buildTree(elements: ProcessElement[]): TreeNode[] {
  const nodes = new Map<string, TreeNode>()
  elements.forEach(e => nodes.set(e.id, { ...e, children: [] }))

  const roots: TreeNode[] = []
  nodes.forEach(node => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

/** Depth-first flatten back to a flat list, dropping the children arrays. */
export function flattenTree(roots: TreeNode[]): ProcessElement[] {
  const out: ProcessElement[] = []
  const walk = (nodes: TreeNode[]) => {
    nodes.forEach(node => {
      const { children, ...element } = node
      out.push(element)
      walk(children)
    })
  }
  walk(roots)
  return out
}

/**
 * Recompute display code (hierarchyId), level, childCount and parentId for the
 * whole tree. Stable `id` is never touched. parentId is re-derived from the
 * parent node's id. Display rule matches existing codes: depth 1 → "1.0",
 * deeper → parentCode without trailing ".0" + ".n" (e.g. "1.1", "1.1.1").
 */
export function renumberTree(roots: TreeNode[]): TreeNode[] {
  const walk = (nodes: TreeNode[], depth: number, parentCode: string, parentId: string | null): TreeNode[] =>
    nodes.map((node, idx) => {
      const code = depth === 1
        ? `${idx + 1}.0`
        : `${parentCode.replace(/\.0$/, '')}.${idx + 1}`
      const children = walk(node.children, depth + 1, code, node.id)
      return {
        ...node,
        hierarchyId: code,
        level: depth as TreeNode['level'],
        parentId,
        childCount: children.length,
        children,
      }
    })
  return walk(roots, 1, '', null)
}

/** Deep clone of a tree (for undo snapshots). */
export function cloneTree(roots: TreeNode[]): TreeNode[] {
  return roots.map(node => ({ ...node, children: cloneTree(node.children) }))
}

/** Find a node by id, returning it with its sibling array and index. */
export function findNode(
  roots: TreeNode[],
  id: string,
): { node: TreeNode; siblings: TreeNode[]; index: number } | null {
  const search = (nodes: TreeNode[]): { node: TreeNode; siblings: TreeNode[]; index: number } | null => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) return { node: nodes[i], siblings: nodes, index: i }
      const found = search(nodes[i].children)
      if (found) return found
    }
    return null
  }
  return search(roots)
}

/** Remove a node by id (mutates the passed tree in place) and return it. */
export function removeNode(roots: TreeNode[], id: string): TreeNode | null {
  const search = (nodes: TreeNode[]): TreeNode | null => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        const [removed] = nodes.splice(i, 1)
        return removed
      }
      const found = search(nodes[i].children)
      if (found) return found
    }
    return null
  }
  return search(roots)
}

/** Total number of descendants below a node (excludes the node itself). */
export function countDescendants(node: TreeNode): number {
  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0)
}

/**
 * Filter the tree to nodes matching the query by name / hierarchyId / description.
 * A node is kept if it matches or any of its descendants match (ancestors preserved).
 */
export function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes
  const matches = (node: TreeNode) =>
    node.name.toLowerCase().includes(q) ||
    node.hierarchyId.toLowerCase().includes(q) ||
    node.description.toLowerCase().includes(q)

  const walk = (list: TreeNode[]): TreeNode[] =>
    list.reduce<TreeNode[]>((acc, node) => {
      const filteredChildren = walk(node.children)
      if (matches(node) || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren })
      }
      return acc
    }, [])
  return walk(nodes)
}

/** Swap a node with its previous/next sibling. Returns a new tree. */
export function moveNode(roots: TreeNode[], id: string, dir: 'up' | 'down'): TreeNode[] {
  const next = cloneTree(roots)
  const found = findNode(next, id)
  if (!found) return roots
  const { siblings, index } = found
  const target = dir === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= siblings.length) return roots
  ;[siblings[index], siblings[target]] = [siblings[target], siblings[index]]
  return next
}

/** Make a node a child of its previous sibling. Returns a new tree. */
export function indentNode(roots: TreeNode[], id: string): TreeNode[] {
  const next = cloneTree(roots)
  const found = findNode(next, id)
  if (!found || found.index === 0) return roots
  const { siblings, index } = found
  const [node] = siblings.splice(index, 1)
  const newParent = siblings[index - 1]
  newParent.children.push(node)
  return next
}

/** Make a node a sibling of its parent (one level up). Returns a new tree. */
export function outdentNode(roots: TreeNode[], id: string): TreeNode[] {
  const next = cloneTree(roots)

  const search = (
    nodes: TreeNode[],
    parent: TreeNode | null,
    grandparent: TreeNode | null,
  ): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        if (!parent) return false // already at root, cannot outdent
        const container = grandparent ? grandparent.children : next
        const parentIndex = container.indexOf(parent)
        const [node] = nodes.splice(i, 1)
        container.splice(parentIndex + 1, 0, node)
        return true
      }
      if (search(nodes[i].children, nodes[i], parent)) return true
    }
    return false
  }

  return search(next, null, null) ? next : roots
}

/**
 * Move a node to a position before or after another node anywhere in the tree.
 * Prevents dropping a node onto itself or one of its own descendants.
 */
export function reorderNode(
  roots: TreeNode[],
  dragId: string,
  targetId: string,
  position: 'before' | 'after',
): TreeNode[] {
  if (dragId === targetId) return roots
  const next = cloneTree(roots)

  // Locate drag node — needed to detect descendant cycles
  const dragFound = findNode(next, dragId)
  if (!dragFound) return roots

  // Prevent dropping into own subtree
  if (findNode([dragFound.node], targetId)) return roots

  const dragSiblings = dragFound.siblings
  const dragIndex = dragFound.index
  const dragNode = dragFound.node

  // Find target
  const targetFound = findNode(next, targetId)
  if (!targetFound) return roots

  const targetSiblings = targetFound.siblings
  let targetIndex = targetFound.index

  // Detach the dragged node
  dragSiblings.splice(dragIndex, 1)

  // If dragged and target are in the same array and dragged came before target,
  // the target's index shifted down by 1
  if (dragSiblings === targetSiblings && dragIndex < targetIndex) {
    targetIndex -= 1
  }

  const insertAt = position === 'before' ? targetIndex : targetIndex + 1
  targetSiblings.splice(insertAt, 0, dragNode)

  return next
}

/** Create a fresh element with target-required defaults and a stable unique id. */
export function createElement(name: string, parentId: string | null, level: number): ProcessElement {
  return {
    id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    hierarchyId: '',
    name,
    description: '',
    level: Math.min(Math.max(level, 1), 5) as ProcessElement['level'],
    parentId,
    processType: 'Operating',
    status: 'Draft',
    ownerId: '',
    assetCount: 0,
    childCount: 0,
  }
}

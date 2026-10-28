import { readFileSync, statSync } from 'node:fs'
import console from 'node:console'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { parse } from 'yaml'

const requiredModels = new Map([
  ['coordinator', 'gpt-6.1-sol'], ['recon', 'gpt-6-luna'],
  ['design_system', 'gpt-6.1-terra'], ['booking_flow', 'gpt-6.1-sol'],
  ['visual_qa', 'gpt-6-astra'],
])
const requiredEdges = new Set([
  'coordinator:recon', 'recon:design_system', 'recon:booking_flow',
  'design_system:visual_qa', 'booking_flow:visual_qa',
])
const projectRoot = fileURLToPath(new URL('../', import.meta.url))

function contains(parent, child) {
  const path = relative(parent, child)
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
}

function validate(path) {
  const graph = parse(readFileSync(path, 'utf8'))
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) throw Error('nodes and edges must be arrays')
  const ids = new Set()
  const ownership = new Set()
  for (const node of graph.nodes) {
    if (!node || typeof node.id !== 'string' || ids.has(node.id)) throw Error('missing or duplicate node ID')
    ids.add(node.id)
    if (!requiredModels.has(node.id) || requiredModels.get(node.id) !== node.model) throw Error(`unknown node or model: ${node.id}`)
    if (typeof node.prompt !== 'string' || isAbsolute(node.prompt)) throw Error(`invalid prompt: ${node.id}`)
    const root = dirname(path)
    const prompt = resolve(root, node.prompt)
    if (!prompt.startsWith(root + sep) || !statSync(prompt).isFile()) throw Error(`missing prompt: ${node.id}`)
    if (!Array.isArray(node.owns) || node.owns.length === 0) throw Error(`missing ownership: ${node.id}`)
    for (const entry of node.owns) {
      if (typeof entry !== 'string' || !entry || isAbsolute(entry)) throw Error(`invalid ownership: ${node.id}`)
      const normalized = resolve(projectRoot, entry)
      if (!contains(projectRoot, normalized)) throw Error(`invalid ownership: ${entry}`)
      if ([...ownership].some((owned) => contains(owned, normalized) || contains(normalized, owned))) throw Error(`overlapping ownership: ${entry}`)
      ownership.add(normalized)
    }
  }
  if (ids.size !== requiredModels.size || [...requiredModels.keys()].some((id) => !ids.has(id))) throw Error('missing required nodes')
  const seen = new Set()
  const outgoing = new Map([...ids].map((id) => [id, []]))
  const indegree = new Map([...ids].map((id) => [id, 0]))
  for (const edge of graph.edges) {
    if (!edge || !ids.has(edge.from) || !ids.has(edge.to)) throw Error('unknown dependency')
    const key = `${edge.from}:${edge.to}`
    if (seen.has(key)) throw Error(`duplicate edge: ${key}`)
    seen.add(key)
    outgoing.get(edge.from).push(edge.to)
    indegree.set(edge.to, indegree.get(edge.to) + 1)
  }
  const ready = [...ids].filter((id) => indegree.get(id) === 0)
  const order = []
  while (ready.length) {
    const id = ready.shift()
    order.push(id)
    for (const next of outgoing.get(id)) {
      indegree.set(next, indegree.get(next) - 1)
      if (indegree.get(next) === 0) ready.push(next)
    }
  }
  if (order.length !== ids.size) throw Error('cyclic execution dependencies')
  if (seen.size !== requiredEdges.size || [...requiredEdges].some((edge) => !seen.has(edge))) throw Error('execution edges do not match the required graph')
  if (graph.feedback !== undefined) {
    if (!Array.isArray(graph.feedback)) throw Error('feedback must be an array')
    for (const edge of graph.feedback) if (!edge || !ids.has(edge.from) || !ids.has(edge.to)) throw Error('unknown feedback node')
  }
  return order
}

try {
  const path = resolve(process.argv[2] ?? fileURLToPath(new URL('../agents/graph.yaml', import.meta.url)))
  console.log(`Execution order: ${validate(path).join(' → ')}`)
} catch (error) {
  console.error(`Agent graph invalid: ${error.message}`)
  process.exitCode = 1
}

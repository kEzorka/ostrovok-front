import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const validator = resolve('scripts/validate-agent-graph.mjs')
const directories: string[] = []
const nodes = [
  { id: 'coordinator', model: 'gpt-6.1-sol', prompt: 'prompts/coordinator.md', owns: ['coordination/'] },
  { id: 'recon', model: 'gpt-6-luna', prompt: 'prompts/recon.md', owns: ['inventory/'] },
  { id: 'design_system', model: 'gpt-6.1-terra', prompt: 'prompts/design.md', owns: ['design/'] },
  { id: 'booking_flow', model: 'gpt-6.1-sol', prompt: 'prompts/booking.md', owns: ['booking/'] },
  { id: 'visual_qa', model: 'gpt-6-astra', prompt: 'prompts/qa.md', owns: ['qa/'] },
]
const edges = [
  { from: 'coordinator', to: 'recon' },
  { from: 'recon', to: 'design_system' },
  { from: 'recon', to: 'booking_flow' },
  { from: 'design_system', to: 'visual_qa' },
  { from: 'booking_flow', to: 'visual_qa' },
]

function runGraph(graph: unknown, missingPrompt = false) {
  const dir = mkdtempSync(join(tmpdir(), 'agent-graph-'))
  directories.push(dir)
  mkdirSync(join(dir, 'prompts'))
  for (const node of nodes) {
    if (!missingPrompt || node.id !== 'recon') writeFileSync(join(dir, node.prompt), 'prompt')
  }
  const path = join(dir, 'graph.yaml')
  writeFileSync(path, JSON.stringify(graph)) // JSON is a valid YAML document.
  return spawnSync(process.execPath, [validator, path], { encoding: 'utf8' })
}

afterEach(() => {
  for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('agent graph validator', () => {
  it('accepts a valid graph and prints dependency order', () => {
    const result = runGraph({ nodes, edges })
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/coordinator.*recon.*(?:design_system.*booking_flow|booking_flow.*design_system).*visual_qa/s)
  })

  it('validates the repository graph', () => {
    expect(() => execFileSync(process.execPath, [validator])).not.toThrow()
  })

  it.each([
    ['duplicate IDs', { nodes: [...nodes, nodes[0]], edges }],
    ['missing required node', { nodes: nodes.slice(0, 4), edges }],
    ['unsupported model', { nodes: nodes.map((n) => n.id === 'recon' ? { ...n, model: 'unknown' } : n), edges }],
    ['missing edge', { nodes, edges: edges.slice(1) }],
    ['extra edge', { nodes, edges: [...edges, { from: 'coordinator', to: 'visual_qa' }] }],
    ['unknown dependency', { nodes, edges: [...edges, { from: 'unknown', to: 'recon' }] }],
    ['execution cycle', { nodes, edges: [...edges, { from: 'visual_qa', to: 'recon' }] }],
    ['duplicate ownership', { nodes: nodes.map((n) => n.id === 'recon' ? { ...n, owns: ['coordination/'] } : n), edges }],
    ['overlapping ownership', { nodes: nodes.map((n) => n.id === 'recon' ? { ...n, owns: ['coordination/nested/'] } : n), edges }],
  ])('rejects %s', (_name, graph) => {
    expect(runGraph(graph).status).not.toBe(0)
  })

  it('rejects missing prompt files', () => {
    expect(runGraph({ nodes, edges }, true).status).not.toBe(0)
  })
})

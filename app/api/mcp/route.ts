import {NextResponse} from 'next/server';
import {findPrestoDrivers, getPrestoOverview, PrestoAIError, requirePrestoAIAdmin} from '../../../lib/presto-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const tools = [
  {
    name: 'presto_overview',
    description: 'Read current PRESTO driver and equipment summary. Does not include orders or payment transactions.',
    inputSchema: {type: 'object', properties: {}, additionalProperties: false},
    annotations: {readOnlyHint: true, destructiveHint: false, openWorldHint: false}
  },
  {
    name: 'presto_find_drivers',
    description: 'Search up to ten approved PRESTO driver records by name or numeric ID. Returns no phone or payment account numbers.',
    inputSchema: {type: 'object', properties: {query: {type: 'string', minLength: 1, maxLength: 80}, limit: {type: 'integer', minimum: 1, maximum: 10}}, required: ['query'], additionalProperties: false},
    annotations: {readOnlyHint: true, destructiveHint: false, openWorldHint: false}
  }
];
function response(value: unknown, status = 200, extra: Record<string,string> = {}) {
  return NextResponse.json(value, {status, headers: {'Cache-Control': 'no-store', ...extra}});
}
function challenge() {
  const site = (process.env.PRESTO_MCP_ORIGIN || '').replace(/\/$/, '');
  return response({error: 'Authorization required'}, 401, {
    'WWW-Authenticate': 'Bearer resource_metadata="' + site + '/.well-known/oauth-protected-resource"'
  });
}
export async function POST(request: Request) {
  if (process.env.PRESTO_MCP_ENABLED !== 'true' || !process.env.PRESTO_MCP_ORIGIN || !process.env.PRESTO_MCP_OAUTH_ISSUER) {
    return response({error: 'PRESTO MCP is not enabled.'}, 503);
  }
  let auth: Awaited<ReturnType<typeof requirePrestoAIAdmin>>;
  try { auth = await requirePrestoAIAdmin(request); }
  catch (error) {
    if (error instanceof PrestoAIError && error.status === 401) return challenge();
    return response({error: error instanceof Error ? error.message : 'Forbidden'}, error instanceof PrestoAIError ? error.status : 500);
  }
  const raw = await request.text();
  if (raw.length > 8192) return response({error: 'Request too large'}, 413);
  let rpc: {jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string,unknown>};
  try {rpc = JSON.parse(raw);} catch {return response({jsonrpc: '2.0', id: null, error: {code: -32700, message: 'Parse error'}}, 400);}
  if (!rpc || rpc.jsonrpc !== '2.0' || typeof rpc.method !== 'string') {
    return response({jsonrpc: '2.0', id: rpc?.id ?? null, error: {code: -32600, message: 'Invalid JSON-RPC request'}}, 400);
  }
  if (rpc.id === undefined) return new Response(null, {status: 202});
  const ok = (result: unknown) => response({jsonrpc: '2.0', id: rpc.id, result});
  const fail = (code: number, message: string) => response({jsonrpc: '2.0', id: rpc.id, error: {code, message}});
  if (rpc.method === 'initialize') return ok({
    protocolVersion: '2025-06-18',
    capabilities: {tools: {listChanged: false}},
    serverInfo: {name: 'presto-operations', version: '0.1.0'}
  });
  if (rpc.method === 'ping') return ok({});
  if (rpc.method === 'tools/list') return ok({tools});
  if (rpc.method === 'tools/call') {
    const name = rpc.params?.name;
    const args = rpc.params?.arguments ?? {};
    if (!args || typeof args !== 'object' || Array.isArray(args)) return fail(-32602, 'Invalid arguments');
    try {
      let data: unknown;
      if (name === 'presto_overview') data = await getPrestoOverview(auth.client);
      else if (name === 'presto_find_drivers') {
        const item = args as Record<string,unknown>;
        if (typeof item.query !== 'string' || !item.query.trim() || item.query.length > 80 ||
          (item.limit !== undefined && (typeof item.limit !== 'number' || !Number.isInteger(item.limit) || item.limit < 1 || item.limit > 10))) {
          return fail(-32602, 'Invalid search arguments');
        }
        data = await findPrestoDrivers(auth.client, item.query, item.limit === undefined ? 10 : Number(item.limit));
      } else return fail(-32601, 'Unknown tool');
      return ok({content: [{type: 'text', text: JSON.stringify(data)}], isError: false});
    } catch {
      return ok({content: [{type: 'text', text: 'PRESTO records could not be read.'}], isError: true});
    }
  }
  return fail(-32601, 'Unknown method');
}
export async function GET() {return response({error: 'Streamable HTTP POST is required.'}, 405, {Allow: 'POST'});}

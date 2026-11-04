import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

// OAuth is only announced after the PRESTO owner enables and configures it.
export async function GET() {
  const site = process.env.PRESTO_MCP_ORIGIN;
  const issuer = process.env.PRESTO_MCP_OAUTH_ISSUER;
  if (process.env.PRESTO_MCP_ENABLED !== 'true' || !site || !issuer) {
    return NextResponse.json({error: 'MCP OAuth is not configured.'}, {status: 503});
  }
  return NextResponse.json({
    resource: site.replace(/\/$/, '') + '/api/mcp',
    authorization_servers: [issuer],
    scopes_supported: ['openid', 'email'],
    resource_documentation: site.replace(/\/$/, '') + '/PRESTO_AI_SETUP_AR.md'
  }, {headers: {'Cache-Control': 'no-store'}});
}

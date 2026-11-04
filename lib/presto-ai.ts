import {createClient, type SupabaseClient} from '@supabase/supabase-js';

export class PrestoAIError extends Error {
  constructor(message: string, public status = 403) { super(message); }
}

export async function requirePrestoAIAdmin(request: Request): Promise<{client: SupabaseClient; userId: string}> {
  const raw = request.headers.get('authorization') || '';
  const match = /^Bearer ([^\s]+)$/.exec(raw);
  if (!match) throw new PrestoAIError('Authentication required.', 401);
  const url = process.env.NEXT_PUBLIC_PRESTO_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_PRESTO_SUPABASE_KEY;
  if (!url || !key) throw new PrestoAIError('PRESTO database is not configured.', 503);
  // Never use the Supabase service-role key: all reads remain bound to the user's RLS.
  const client = createClient(url, key, {
    auth: {persistSession: false, autoRefreshToken: false},
    global: {headers: {Authorization: 'Bearer ' + match[1]}}
  });
  const {data: identity, error: identityError} = await client.auth.getUser(match[1]);
  if (identityError || !identity.user || identity.user.is_anonymous) {
    throw new PrestoAIError('Invalid session.', 401);
  }
  // Fail closed. Ordinary PRESTO signup alone never grants AI access.
  const {data: admin, error: permissionError} = await client.from('presto_admins')
    .select('user_id').eq('user_id', identity.user.id).maybeSingle();
  if (permissionError || !admin) throw new PrestoAIError('AI access is reserved for approved PRESTO administrators.', 403);
  return {client, userId: identity.user.id};
}

type Driver = {
  id: number; name: string; bag: boolean; shirt: boolean; verified: boolean;
  bankily: boolean; masrvi: boolean; sedad: boolean; click: boolean;
};

export async function getPrestoOverview(client: SupabaseClient) {
  const records: Driver[] = [];
  for (let start = 0; start < 5000; start += 1000) {
    const {data, error} = await client.from('presto_drivers')
      .select('id,name,bag,shirt,verified,bankily,masrvi,sedad,click')
      .order('id', {ascending: true}).range(start, start + 999);
    if (error) throw new PrestoAIError('Unable to read PRESTO records.', 502);
    records.push(...(data || []) as Driver[]);
    if ((data || []).length < 1000) break;
    if (start === 4000) throw new PrestoAIError('Dataset exceeds the safe reporting limit.', 413);
  }
  const hasPayment = (d: Driver) => d.bankily || d.masrvi || d.sedad || d.click;
  return {
    drivers: records.length,
    bagsDelivered: records.filter(d => d.bag).length,
    shirtsDelivered: records.filter(d => d.shirt).length,
    verifiedFiles: records.filter(d => d.verified).length,
    fullyEquippedAndVerified: records.filter(d => d.bag && d.shirt && d.verified && hasPayment(d)).length,
    missingPaymentMethod: records.filter(d => !hasPayment(d)).length,
    paymentMethods: {
      bankily: records.filter(d => d.bankily).length,
      masrvi: records.filter(d => d.masrvi).length,
      sedad: records.filter(d => d.sedad).length,
      click: records.filter(d => d.click).length
    }
  };
}

/** Return minimum necessary fields. Never expose phone or mobile-money account numbers. */
export async function findPrestoDrivers(client: SupabaseClient, term: string, requestedLimit = 10) {
  const query = term.trim().slice(0, 80).replace(/[%_,()]/g, '');
  if (!query) return [];
  const limit = Math.max(1, Math.min(10, Math.floor(requestedLimit) || 10));
  const select = 'id,name,bag,shirt,verified';
  const result = /^\d{1,10}$/.test(query)
    ? await client.from('presto_drivers').select(select).eq('id', Number(query)).limit(limit)
    : await client.from('presto_drivers').select(select).ilike('name', '%' + query + '%').order('id').limit(limit);
  if (result.error) throw new PrestoAIError('Unable to search PRESTO records.', 502);
  return result.data || [];
}

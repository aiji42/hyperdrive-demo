import { Client } from 'pg';

export interface Env {
	HYPERDRIVE: Hyperdrive;
	DATABASE_URL: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const pathname = new URL(request.url).pathname;
		if (!pathname.match(/^\/(normal|hyperdrive)/)) return new Response(null, { status: 404 });

		const client = new Client(pathname.includes('hyperdrive') ? { connectionString: env.HYPERDRIVE.connectionString } : env.DATABASE_URL);

		const results: number[] = [];
		while (results.length < 10) {
			const startTime = performance.now();

			if (results.length < 1) await client.connect();

			await client.query({ text: `SELECT * FROM users LIMIT 50` });

			const endTime = performance.now();

			results.push(endTime - startTime);
		}

		ctx.waitUntil(client.end());

		return Response.json(results.map((n) => `${n}ms`));
	},
};

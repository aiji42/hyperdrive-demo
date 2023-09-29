import { Client } from 'pg';

export interface Env {
	HYPERDRIVE: Hyperdrive;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		if (new URL(request.url).pathname !== '/') return new Response(null);

		// If you use connection without hyperdrive
		// const client = new Client('postgres://use:password@host:port/database?sslmode=require');

		const client = new Client({ connectionString: env.HYPERDRIVE.connectionString });

		const bench = async (needConnect: boolean) => {
			const startTime = performance.now();

			if (needConnect) await client.connect();

			await client.query({ text: 'SELECT * FROM users LIMIT 50' });

			const endTime = performance.now();

			return endTime - startTime;
		};

		const results = [];
		while (results.length < 10) {
			results.push(await bench(results.length === 0));
		}

		ctx.waitUntil(client.end());

		return Response.json(results.map((n) => `${n}ms`));
	},
};

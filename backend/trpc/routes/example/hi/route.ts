import { publicProcedure } from '../../../trpc';

const hiProcedure = publicProcedure.query(() => {
  return {
    greeting: 'Hello from tRPC!',
    timestamp: new Date().toISOString(),
  };
});

export default hiProcedure;
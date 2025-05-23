import { router } from './trpc';
import hiProcedure from './routes/example/hi/route';
import getThreadsProcedure from './routes/messages/getThreads/route';
import getMessagesProcedure from './routes/messages/getMessages/route';
import sendMessageProcedure from './routes/messages/sendMessage/route';
import markAsReadProcedure from './routes/messages/markAsRead/route';
import requestPasswordResetProcedure from './routes/auth/requestPasswordReset/route';
import resetPasswordProcedure from './routes/auth/resetPassword/route';
import trainersRouter from './routes/trainers/route';

// Create the router with better error handling
export const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  messages: router({
    getThreads: getThreadsProcedure,
    getMessages: getMessagesProcedure,
    sendMessage: sendMessageProcedure,
    markAsRead: markAsReadProcedure,
  }),
  auth: router({
    requestPasswordReset: requestPasswordResetProcedure,
    resetPassword: resetPasswordProcedure,
  }),
  trainers: router({
    registerTrainer: trainersRouter.registerTrainer,
    getAllTrainers: trainersRouter.getAllTrainers,
  }),
});

export type AppRouter = typeof appRouter;
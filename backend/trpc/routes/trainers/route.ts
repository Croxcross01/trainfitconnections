import { publicProcedure } from '../../trpc';
import { z } from 'zod';

// In-memory trainers array for demo (replace with DB in production)
const trainers: any[] = [];

export const registerTrainerProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      profileImage: z.string().optional(),
      bio: z.string().optional(),
      specialties: z.array(z.string()).optional(),
      certifications: z.array(z.any()).optional(),
      location: z.any().optional(),
      hourlyRate: z.number().optional(),
      // Add other fields as needed
    })
  )
  .mutation(async ({ input }) => {
    // Add to in-memory array (replace with DB logic)
    trainers.push({ ...input, createdAt: new Date().toISOString() });
    return { success: true };
  });

export const getAllTrainersProcedure = publicProcedure.query(async () => {
  // Return all trainers (replace with DB logic)
  return trainers;
});

export default {
  registerTrainer: registerTrainerProcedure,
  getAllTrainers: getAllTrainersProcedure,
};

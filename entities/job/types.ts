import { z } from "zod";

export const remoteModeSchema = z.enum(["onsite", "hybrid", "remote"]);
export const experienceLevelSchema = z.enum(["intern", "junior", "mid", "senior"]);
export const educationLevelSchema = z.enum(["none", "college", "bachelor", "master_plus"]);
export const userJobStatusSchema = z.enum(["default", "to_review", "applied", "ignored"]);
export const sortOptionSchema = z.enum(["latest", "salary_desc", "salary_asc"]);
export const postedWithinSchema = z.enum(["1d", "3d", "7d", "14d", "30d"]);

export const jobPostingSchema = z.object({
  id: z.string(),
  title: z.string(),
  companyName: z.string(),
  city: z.string(),
  remoteMode: remoteModeSchema,
  salaryMin: z.number(),
  salaryMax: z.number(),
  experienceLevel: experienceLevelSchema,
  educationLevel: educationLevelSchema,
  tags: z.array(z.string()),
  postedAt: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string().url(),
  description: z.object({
    responsibilities: z.array(z.string()),
    requirements: z.array(z.string()),
    bonuses: z.array(z.string()).optional(),
  }),
  companyProfile: z
    .object({
      size: z.string().optional(),
      industry: z.string().optional(),
      stage: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
});

export const userJobStateSchema = z.object({
  jobId: z.string(),
  saved: z.boolean(),
  status: userJobStatusSchema,
  note: z.string().optional(),
  updatedAt: z.string(),
});

export const jobSearchParamsSchema = z.object({
  keyword: z.string().optional(),
  city: z.array(z.string()).optional(),
  remoteMode: z.array(remoteModeSchema).optional(),
  experienceLevel: z.array(experienceLevelSchema).optional(),
  educationLevel: z.array(educationLevelSchema).optional(),
  salaryRange: z.tuple([z.number(), z.number()]).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: sortOptionSchema.optional(),
  postedWithin: postedWithinSchema.optional(),
});

export type RemoteMode = z.infer<typeof remoteModeSchema>;
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;
export type EducationLevel = z.infer<typeof educationLevelSchema>;
export type UserJobStatus = z.infer<typeof userJobStatusSchema>;
export type SortOption = z.infer<typeof sortOptionSchema>;
export type PostedWithin = z.infer<typeof postedWithinSchema>;
export type JobPosting = z.infer<typeof jobPostingSchema>;
export type UserJobState = z.infer<typeof userJobStateSchema>;
export type JobSearchParams = z.infer<typeof jobSearchParamsSchema>;

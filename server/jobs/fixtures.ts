import { mockJobs } from "@/mocks/jobs";

export const manualFixtureJobs = mockJobs;

export const greenhouseFixtureJobs = mockJobs.slice(0, 28).map((job, index) => ({
  ghId: `gh-${index + 1}`,
  title: job.title,
  company: job.companyName,
  location: job.city,
  remote: job.remoteMode,
  compensation: `${job.salaryMin}-${job.salaryMax}`,
  tags: job.tags,
  postedAt: job.postedAt,
  jobUrl: `https://boards.greenhouse.io/${job.companyName.toLowerCase().replace(/\s+/g, "")}/jobs/${index + 1}`,
  responsibilities: job.description.responsibilities,
  requirements: job.description.requirements,
  bonuses: job.description.bonuses,
  companyProfile: job.companyProfile,
  experienceLevel: job.experienceLevel,
  educationLevel: job.educationLevel,
}));

export const leverFixtureJobs = mockJobs.slice(18, 46).map((job, index) => ({
  leverId: `lv-${index + 1}`,
  text: job.title,
  organization: job.companyName,
  categories: {
    location: job.city,
    commitment: job.remoteMode,
  },
  salaryRange: {
    min: job.salaryMin,
    max: job.salaryMax,
  },
  tags: job.tags,
  applyUrl: `https://jobs.lever.co/${job.companyName.toLowerCase().replace(/\s+/g, "")}/${index + 1}`,
  createdAt: job.postedAt,
  sections: {
    responsibilities: job.description.responsibilities,
    requirements: job.description.requirements,
    bonuses: job.description.bonuses,
  },
  profile: job.companyProfile,
  experienceLevel: job.experienceLevel,
  educationLevel: job.educationLevel,
}));

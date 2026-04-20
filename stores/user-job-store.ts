"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { type UserJobState, type UserJobStatus } from "@/entities/job/types";

type UserJobStateMap = Record<string, UserJobState>;

type StoreState = {
  states: UserJobStateMap;
  toggleSaved: (jobId: string) => void;
  setStatus: (jobId: string, status: UserJobStatus) => void;
  setNote: (jobId: string, note: string) => void;
  resetState: (jobId: string) => void;
};

function nextState(current: UserJobState | undefined, jobId: string): UserJobState {
  return (
    current ?? {
      jobId,
      saved: false,
      status: "default",
      note: "",
      updatedAt: new Date().toISOString(),
    }
  );
}

export const useUserJobStore = create<StoreState>()(
  persist(
    (set) => ({
      states: {},
      toggleSaved: (jobId) =>
        set((state) => {
          const current = nextState(state.states[jobId], jobId);
          return {
            states: {
              ...state.states,
              [jobId]: {
                ...current,
                saved: !current.saved,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      setStatus: (jobId, status) =>
        set((state) => {
          const current = nextState(state.states[jobId], jobId);
          return {
            states: {
              ...state.states,
              [jobId]: {
                ...current,
                status,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      setNote: (jobId, note) =>
        set((state) => {
          const current = nextState(state.states[jobId], jobId);
          return {
            states: {
              ...state.states,
              [jobId]: {
                ...current,
                note,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      resetState: (jobId) =>
        set((state) => ({
          states: {
            ...state.states,
            [jobId]: {
              jobId,
              saved: false,
              status: "default",
              note: "",
              updatedAt: new Date().toISOString(),
            },
          },
        })),
    }),
    {
      name: "job-radar-user-state",
    },
  ),
);

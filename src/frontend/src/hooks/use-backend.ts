import {
  type ClaimInput,
  type ClaimStatus,
  type ManagementCode,
  type ReportEdit,
  type ReportId,
  type ReportInput,
  type ReportKind,
  type ReportQuery,
  type ReportStatus,
  type ReturnCode,
  createActor,
} from "@/backend";
import { unwrapResult } from "@/lib/backend-client";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const REPORT_KEYS = {
  all: ["reports"] as const,
  list: (query: ReportQuery) => ["reports", "list", query] as const,
  detail: (id: ReportId) => ["reports", "detail", id.toString()] as const,
  mine: (code: ManagementCode) => ["reports", "mine", code] as const,
};

const MATCH_KEYS = {
  all: ["matches"] as const,
  forReport: (id: ReportId) => ["matches", "report", id.toString()] as const,
  detail: (id: bigint) => ["matches", "detail", id.toString()] as const,
};

const CLAIM_KEYS = {
  forReport: (id: ReportId) => ["claims", "report", id.toString()] as const,
  admin: (status: ClaimStatus | null) => ["claims", "admin", status] as const,
};

const AUDIT_KEYS = {
  list: (page: bigint, pageSize: bigint) =>
    ["audit", page.toString(), pageSize.toString()] as const,
};

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export function useReport(id: ReportId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: REPORT_KEYS.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getReport(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useReports(query: ReportQuery) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: REPORT_KEYS.list(query),
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.listReports(query);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyReports(code: ManagementCode | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: REPORT_KEYS.mine(code ?? ""),
    queryFn: async () => {
      if (!actor || !code) return [];
      return actor.listMyReports(code);
    },
    enabled: !!actor && !isFetching && !!code,
  });
}

export function useMatchesForReport(id: ReportId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: MATCH_KEYS.forReport(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return [];
      return actor.listMatchesForReport(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useMatches() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: MATCH_KEYS.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMatches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMatch(id: bigint | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: MATCH_KEYS.detail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getMatch(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useClaimsForReport(id: ReportId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: CLAIM_KEYS.forReport(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === undefined) return [];
      return actor.listClaimsForReport(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useAdminClaims(status: ClaimStatus | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: CLAIM_KEYS.admin(status),
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminListClaims(status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAudit(page: bigint, pageSize: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: AUDIT_KEYS.list(page, pageSize),
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.adminListAudit(page, pageSize);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

export function useSubmitReport() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReportInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return unwrapResult(await actor.submitReport(input));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REPORT_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: MATCH_KEYS.all });
    },
  });
}

export function useEditReport() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: ReportId;
      code: ManagementCode;
      edit: ReportEdit;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return unwrapResult(
        await actor.editReport(vars.id, vars.code, vars.edit),
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REPORT_KEYS.all });
    },
  });
}

export function useWithdrawReport() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: ReportId; code: ManagementCode }) => {
      if (!actor) throw new Error("Backend is not ready");
      unwrapResult(await actor.withdrawReport(vars.id, vars.code));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REPORT_KEYS.all });
    },
  });
}

export function useFileClaim() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClaimInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return unwrapResult(await actor.fileClaim(input));
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: CLAIM_KEYS.forReport(variables.reportId),
      });
      void queryClient.invalidateQueries({ queryKey: ["claims", "admin"] });
    },
  });
}

export function useVerifyReturnCode() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: ReturnCode) => {
      if (!actor) throw new Error("Backend is not ready");
      return unwrapResult(await actor.verifyReturnCode(code));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REPORT_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: ["claims", "admin"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Admin writes                                                        */
/* ------------------------------------------------------------------ */

export function useAdminSetReportStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: ReportId; status: ReportStatus }) => {
      if (!actor) throw new Error("Backend is not ready");
      unwrapResult(await actor.adminSetReportStatus(vars.id, vars.status));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REPORT_KEYS.all });
      void queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

export function useAdminApproveClaim() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: bigint; note: string | null }) => {
      if (!actor) throw new Error("Backend is not ready");
      return unwrapResult(await actor.adminApproveClaim(vars.id, vars.note));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["claims", "admin"] });
      void queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

export function useAdminRejectClaim() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: bigint; note: string | null }) => {
      if (!actor) throw new Error("Backend is not ready");
      return unwrapResult(await actor.adminRejectClaim(vars.id, vars.note));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["claims", "admin"] });
      void queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

export function useAdminDisputeClaim() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: bigint; note: string | null }) => {
      if (!actor) throw new Error("Backend is not ready");
      return unwrapResult(await actor.adminDisputeClaim(vars.id, vars.note));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["claims", "admin"] });
      void queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
  });
}

export type { ReportKind };

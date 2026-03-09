import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AlertRuleInput } from '@/lib/schemas';
import {
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
} from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateAlertRuleMutation(): ReturnType<typeof useMutation<void, Error, AlertRuleInput>> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAlertRule,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.alertRules() });
        },
    });
}

export function useUpdateAlertRuleMutation(): ReturnType<typeof useMutation<void, Error, { id: string; rule: Partial<AlertRuleInput> }>> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, rule }: { id: string; rule: Partial<AlertRuleInput> }) =>
            updateAlertRule(id, rule),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.alertRules() });
        },
    });
}

export function useDeleteAlertRuleMutation(): ReturnType<typeof useMutation<void, Error, string>> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAlertRule,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.alertRules() });
        },
    });
}

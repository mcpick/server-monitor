import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ServerRegistration } from '@/lib/schemas';
import {
    createServer,
    deleteServer,
    regenerateServerToken,
} from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useCreateServerMutation(): ReturnType<typeof useMutation<ServerRegistration, Error, string>> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createServer,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.servers() });
        },
    });
}

export function useDeleteServerMutation(): ReturnType<typeof useMutation<void, Error, string>> {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteServer,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.servers() });
        },
    });
}

export function useRegenerateServerTokenMutation(): ReturnType<typeof useMutation<{ token: string }, Error, string>> {
    return useMutation({
        mutationFn: regenerateServerToken,
    });
}

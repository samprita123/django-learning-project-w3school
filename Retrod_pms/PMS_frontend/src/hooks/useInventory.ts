import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, InventoryUnit } from "../services/api/inventory";
import { toast } from "sonner";

export const inventoryKeys = {
  all: ["inventoryUnits"] as const,
  detail: (id: string) => ["inventoryUnits", id] as const,
};

export const useInventoryUnitsQuery = () =>
  useQuery({
    queryKey: inventoryKeys.all,
    queryFn: inventoryApi.getInventoryUnits,
  });

export const useInventoryUnitQuery = (id: string) =>
  useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryApi.getInventoryUnit(id),
    enabled: !!id,
  });

export const useUpdateInventoryUnitMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryUnit> }) =>
      inventoryApi.updateInventoryUnit(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
      toast.success("Unit updated successfully");
    },
    onError: () => {
      toast.error("Failed to update unit");
    },
  });
};

export const usePatchInventoryUnitMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryUnit> }) =>
      inventoryApi.patchInventoryUnit(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
    },
    onError: () => {
      toast.error("Failed to update unit");
    },
  });
};

export const useDeleteInventoryUnitMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteInventoryUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success("Unit deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete unit");
    },
  });
};

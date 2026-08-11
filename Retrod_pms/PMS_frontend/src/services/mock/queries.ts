import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { waitlistApi, groupBlocksApi } from "@/services/api/reservations";
import {
  dataKeys,
  fetchReservations,
  fetchReservation,
  fetchArrivalsToday,
  fetchDeparturesToday,
  fetchHousekeepingRooms,
  fetchRevenueTrend,
  fetchOtaBreakdown,
  fetchRoomStatusDonut,
  fetchActivityFeed,
  fetchOccupancyByType,
  fetchRevenueKpis,
  fetchDashboardAlerts,
  fetchForecast7d,
  fetchAvailabilityMatrix,
  fetchRateCalendar,
  fetchRestrictions,
  fetchGuests,
  fetchWaitlist,
  fetchGroupBlocks,
  saveGroupBlock,
  fetchWorkOrders,
  saveWorkOrder,
  updateWorkOrderStatus,
  fetchOpsTasks,
  saveOpsTasks,
  updateOpsTask,
  fetchGuestServiceRequests,
  fetchOtaMappings,
  fetchOtaSyncLogs,
  fetchPricingRules,
  fetchCorporateAccounts,
  fetchOnlineCheckIns,
  fetchCommThreads,
  fetchLoyaltyMembers,
  fetchRegistrationCards,
  fetchLostFoundItems,
  saveLostFoundItem,
  fetchFeedbackEntries,
  fetchBookingPromos,
  fetchPackageProducts,
  fetchAddOnProducts,
  fetchConciergeRequests,
  fetchTransportTrips,
  fetchActivitySlots,
  fetchPortfolioProperties,
  fetchAIRevenueDashboard,
  fetchMealPlans,
  fetchRatePlans,
  saveRatePlans,
  fetchRatePlanVersions,
  appendRatePlanVersion,
  fetchRatePlanPolicies,
  fetchHotelPackages,
  fetchPackageItems,
  fetchOccupancyPricingRules,
  fetchTaxComponents,
  saveTaxComponents,
  fetchTaxGroups,
  saveTaxGroups,
  fetchTaxAssignments,
  saveTaxAssignments,
  fetchAvailabilityCells,
  saveAvailabilityCells,
  fetchFrontDeskWorkflowReservations,
  fetchFrontDeskArrivalQueue,
  fetchFrontDeskCheckoutQueue,
  fetchWebsiteBuilderWorkspace,
  saveWebsiteBuilderWorkspace,
  fetchWebsiteBuilderApprovals,
  saveWebsiteBuilderApprovals,
  fetchWebsiteBuilderPublishHistory,
  saveWebsiteBuilderPublishHistory,
} from "@/services/mock/data-layer";

export const useReservationsQuery = () =>
  useQuery({ queryKey: dataKeys.reservations, queryFn: fetchReservations });
export const useReservationQuery = (id: string) =>
  useQuery({ queryKey: ["data", "reservation", id], queryFn: () => fetchReservation(id) });
export const useArrivalsTodayQuery = () =>
  useQuery({ queryKey: dataKeys.arrivalsToday, queryFn: fetchArrivalsToday });
export const useDeparturesTodayQuery = () =>
  useQuery({ queryKey: dataKeys.departuresToday, queryFn: fetchDeparturesToday });
export const useHousekeepingRoomsQuery = () =>
  useQuery({ queryKey: dataKeys.housekeepingRooms, queryFn: fetchHousekeepingRooms });
export const useRevenueTrendQuery = () =>
  useQuery({ queryKey: dataKeys.revenueTrend, queryFn: fetchRevenueTrend });
export const useOtaBreakdownQuery = () =>
  useQuery({ queryKey: dataKeys.otaBreakdown, queryFn: fetchOtaBreakdown });
export const useRoomStatusDonutQuery = () =>
  useQuery({ queryKey: dataKeys.roomStatusDonut, queryFn: fetchRoomStatusDonut });
export const useActivityFeedQuery = () =>
  useQuery({ queryKey: dataKeys.activityFeed, queryFn: fetchActivityFeed });
export const useOccupancyByTypeQuery = () =>
  useQuery({ queryKey: dataKeys.occupancyByType, queryFn: fetchOccupancyByType });
export const useRevenueKpisQuery = () =>
  useQuery({ queryKey: dataKeys.revenueKpis, queryFn: fetchRevenueKpis });
export const useDashboardAlertsQuery = () =>
  useQuery({ queryKey: dataKeys.dashboardAlerts, queryFn: fetchDashboardAlerts });
export const useForecast7dQuery = () =>
  useQuery({ queryKey: dataKeys.forecast7d, queryFn: fetchForecast7d });
export const useAvailabilityMatrixQuery = () =>
  useQuery({ queryKey: dataKeys.availabilityMatrix, queryFn: fetchAvailabilityMatrix });
export const useRateCalendarQuery = () =>
  useQuery({ queryKey: dataKeys.rateCalendar, queryFn: fetchRateCalendar });
export const useRestrictionsQuery = () =>
  useQuery({ queryKey: dataKeys.restrictions, queryFn: fetchRestrictions });
export const useGuestsQuery = () => useQuery({ queryKey: dataKeys.guests, queryFn: fetchGuests });
export const useWaitlistQuery = () =>
  useQuery({
    queryKey: ["waitlist", "api"],
    queryFn: () => waitlistApi.getAll(),
    staleTime: 30_000,
  });

export const useAddToWaitlistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: waitlistApi.addToWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
};

export const useConvertWaitlistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => waitlistApi.convertEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });
};
export const useGroupBlocksQuery = () =>
  useQuery({
    queryKey: ["group-blocks"],
    queryFn: async () => {
      const res = await groupBlocksApi.getAll();
      return res.results || res || [];
    }
  });

export const useSaveGroupBlockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id?: string; data: any }) => {
      if (payload.id) {
        return groupBlocksApi.update(payload.id, payload.data);
      }
      return groupBlocksApi.create(payload.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-blocks"] });
    },
  });
};
export const useWorkOrdersQuery = () =>
  useQuery({ queryKey: dataKeys.workOrders, queryFn: fetchWorkOrders });

export const useSaveWorkOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveWorkOrder,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.workOrders, data);
    },
  });
};

export const useUpdateWorkOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateWorkOrderStatus(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.workOrders, data);
    },
  });
};

export const useOpsTasksQuery = () =>
  useQuery({ queryKey: dataKeys.opsTasks, queryFn: fetchOpsTasks });
export const useGuestServiceRequestsQuery = () =>
  useQuery({ queryKey: dataKeys.guestServiceRequests, queryFn: fetchGuestServiceRequests });
export const useOtaMappingsQuery = () =>
  useQuery({ queryKey: dataKeys.otaMappings, queryFn: fetchOtaMappings });
export const useOtaSyncLogsQuery = () =>
  useQuery({ queryKey: dataKeys.otaSyncLogs, queryFn: fetchOtaSyncLogs });
export const usePricingRulesQuery = () =>
  useQuery({ queryKey: dataKeys.pricingRules, queryFn: fetchPricingRules });
export const useCorporateAccountsQuery = () =>
  useQuery({ queryKey: dataKeys.corporateAccounts, queryFn: fetchCorporateAccounts });
export const useOnlineCheckInsQuery = () =>
  useQuery({ queryKey: dataKeys.onlineCheckIns, queryFn: fetchOnlineCheckIns });
export const useCommThreadsQuery = () =>
  useQuery({ queryKey: dataKeys.commThreads, queryFn: fetchCommThreads });
export const useLoyaltyMembersQuery = () =>
  useQuery({ queryKey: dataKeys.loyaltyMembers, queryFn: fetchLoyaltyMembers });
export const useRegistrationCardsQuery = () =>
  useQuery({ queryKey: dataKeys.registrationCards, queryFn: fetchRegistrationCards });
export const useLostFoundItemsQuery = () =>
  useQuery({ queryKey: dataKeys.lostFoundItems, queryFn: fetchLostFoundItems });

export const useSaveLostFoundItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveLostFoundItem,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.lostFoundItems, data);
    },
  });
};
export const useFeedbackEntriesQuery = () =>
  useQuery({ queryKey: dataKeys.feedbackEntries, queryFn: fetchFeedbackEntries });
export const useBookingPromosQuery = () =>
  useQuery({ queryKey: dataKeys.bookingPromos, queryFn: fetchBookingPromos });
export const usePackageProductsQuery = () =>
  useQuery({ queryKey: dataKeys.packageProducts, queryFn: fetchPackageProducts });
export const useAddOnProductsQuery = () =>
  useQuery({ queryKey: dataKeys.addOnProducts, queryFn: fetchAddOnProducts });
export const useConciergeRequestsQuery = () =>
  useQuery({ queryKey: dataKeys.conciergeRequests, queryFn: fetchConciergeRequests });
export const useTransportTripsQuery = () =>
  useQuery({ queryKey: dataKeys.transportTrips, queryFn: fetchTransportTrips });
export const useActivitySlotsQuery = () =>
  useQuery({ queryKey: dataKeys.activitySlots, queryFn: fetchActivitySlots });
export const usePortfolioPropertiesQuery = () =>
  useQuery({ queryKey: dataKeys.portfolioProperties, queryFn: fetchPortfolioProperties });
export const useAIRevenueDashboardQuery = () =>
  useQuery({
    queryKey: dataKeys.aiRevenueDashboard,
    queryFn: fetchAIRevenueDashboard,
    refetchInterval: 15000,
  });
export const useMealPlansQuery = () =>
  useQuery({ queryKey: dataKeys.mealPlans, queryFn: fetchMealPlans });
export const useRatePlansQuery = () =>
  useQuery({ queryKey: dataKeys.ratePlans, queryFn: fetchRatePlans });

export const useSaveRatePlansMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveRatePlans,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.ratePlans, data);
    },
  });
};

export const useRatePlanVersionsQuery = () =>
  useQuery({ queryKey: dataKeys.ratePlanVersions, queryFn: fetchRatePlanVersions });

export const useAppendRatePlanVersionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: appendRatePlanVersion,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.ratePlanVersions, data);
    },
  });
};
export const useRatePlanPoliciesQuery = () =>
  useQuery({ queryKey: dataKeys.ratePlanPolicies, queryFn: fetchRatePlanPolicies });
export const useHotelPackagesQuery = () =>
  useQuery({ queryKey: dataKeys.hotelPackages, queryFn: fetchHotelPackages });
export const usePackageItemsQuery = () =>
  useQuery({ queryKey: dataKeys.packageItems, queryFn: fetchPackageItems });
export const useOccupancyPricingRulesQuery = () =>
  useQuery({
    queryKey: dataKeys.occupancyPricingRules,
    queryFn: fetchOccupancyPricingRules,
  });

export const useTaxComponentsQuery = () =>
  useQuery({ queryKey: dataKeys.taxComponents, queryFn: fetchTaxComponents });

export const useSaveTaxComponentsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveTaxComponents,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.taxComponents, data);
    },
  });
};

export const useTaxGroupsQuery = () =>
  useQuery({ queryKey: dataKeys.taxGroups, queryFn: fetchTaxGroups });

export const useSaveTaxGroupsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveTaxGroups,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.taxGroups, data);
    },
  });
};

export const useTaxAssignmentsQuery = () =>
  useQuery({ queryKey: dataKeys.taxAssignments, queryFn: fetchTaxAssignments });

export const useSaveTaxAssignmentsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveTaxAssignments,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.taxAssignments, data);
    },
  });
};

export const useAvailabilityCellsQuery = () =>
  useQuery({ queryKey: dataKeys.availabilityCells, queryFn: fetchAvailabilityCells });

export const useSaveAvailabilityCellsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAvailabilityCells,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.availabilityCells, data);
    },
  });
};

export const useFrontDeskWorkflowReservationsQuery = () =>
  useQuery({
    queryKey: dataKeys.frontDeskWorkflowReservations,
    queryFn: fetchFrontDeskWorkflowReservations,
  });
export const useFrontDeskArrivalQueueQuery = () =>
  useQuery({
    queryKey: dataKeys.frontDeskArrivalQueue,
    queryFn: fetchFrontDeskArrivalQueue,
  });
export const useFrontDeskCheckoutQueueQuery = () =>
  useQuery({
    queryKey: dataKeys.frontDeskCheckoutQueue,
    queryFn: fetchFrontDeskCheckoutQueue,
  });

export const useWebsiteBuilderWorkspaceQuery = () =>
  useQuery({
    queryKey: dataKeys.websiteBuilderWorkspace,
    queryFn: fetchWebsiteBuilderWorkspace,
  });

export const useWebsiteBuilderApprovalsQuery = () =>
  useQuery({
    queryKey: dataKeys.websiteBuilderApprovals,
    queryFn: fetchWebsiteBuilderApprovals,
  });

export const useWebsiteBuilderPublishHistoryQuery = () =>
  useQuery({
    queryKey: dataKeys.websiteBuilderPublishHistory,
    queryFn: fetchWebsiteBuilderPublishHistory,
  });

export const useSaveWebsiteBuilderWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveWebsiteBuilderWorkspace,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.websiteBuilderWorkspace, data);
    },
  });
};

export const useSaveOpsTasksMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveOpsTasks,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.opsTasks, data);
    },
  });
};

export const useUpdateOpsTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateOpsTask(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.opsTasks, data);
    },
  });
};

export const useSaveWebsiteBuilderApprovalsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveWebsiteBuilderApprovals,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.websiteBuilderApprovals, data);
    },
  });
};

export const useSaveWebsiteBuilderPublishHistoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveWebsiteBuilderPublishHistory,
    onSuccess: (data) => {
      queryClient.setQueryData(dataKeys.websiteBuilderPublishHistory, data);
    },
  });
};

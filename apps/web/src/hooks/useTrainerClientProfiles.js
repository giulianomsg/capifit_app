import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTrainerClientProfiles,
  createTrainerClientProfile,
  updateTrainerClientProfile,
  deleteTrainerClientProfile
} from '../lib/api';

export const trainerClientProfilesKeys = {
  all: ['trainer-client-profiles'],
  list: (params) => [...trainerClientProfilesKeys.all, params]
};

export const useTrainerClientProfiles = (params) => {
  return useQuery({
    queryKey: trainerClientProfilesKeys.list(params),
    queryFn: () => fetchTrainerClientProfiles(params),
    keepPreviousData: true
  });
};

export const useCreateTrainerClientProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrainerClientProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerClientProfilesKeys.all });
    }
  });
};

export const useUpdateTrainerClientProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTrainerClientProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerClientProfilesKeys.all });
    }
  });
};

export const useDeleteTrainerClientProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTrainerClientProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainerClientProfilesKeys.all });
    }
  });
};

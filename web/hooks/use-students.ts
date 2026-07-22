'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/student.service';
import { toast } from 'sonner';

export function useStudents(page = 1) {
  return useQuery({ queryKey: ['students', page], queryFn: () => studentService.list(page) });
}

export function useStudentMutations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success('Created');
    },
  });
}

// Copyright 2023 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { z } from 'zod';
import { useMemo } from 'react';
import { resourceIdValidationSchema } from '@perses-dev/plugin-system';
import { useDashboardList } from '../model/dashboard-client';
import { generateMetadataName } from '../utils/metadata';

const dashboardNameValidationSchema = z.string().nonempty('Required').max(75, 'Must be 75 or fewer characters long');

export const createDashboardDialogValidationSchema = z.object({
  projectName: resourceIdValidationSchema,
  dashboardName: dashboardNameValidationSchema,
});
export type CreateDashboardValidationType = z.infer<typeof createDashboardDialogValidationSchema>;

export const renameDashboardDialogValidationSchema = z.object({
  dashboardName: dashboardNameValidationSchema,
});
export type RenameDashboardValidationType = z.infer<typeof renameDashboardDialogValidationSchema>;

export function useDashboardValidationSchema(projectName?: string) {
  const dashboards = useDashboardList(projectName);

  return useMemo(() => {
    return createDashboardDialogValidationSchema.refine(
      (schema) => {
        return (
          (dashboards.data ?? []).filter(
            (dashboard) =>
              dashboard.metadata.project === schema.projectName &&
              dashboard.metadata.name === generateMetadataName(schema.dashboardName)
          ).length === 0
        );
      },
      (schema) => ({
        message: `Dashboard name '${schema.dashboardName}' already exists in '${schema.projectName}' project!`,
        path: ['dashboardName'],
      })
    );
  }, [dashboards.data]);
}

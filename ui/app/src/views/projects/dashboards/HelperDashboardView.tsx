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

import { Box } from '@mui/material';
import { ExternalVariableDefinition, OnSaveDashboard, ViewDashboard } from '@perses-dev/dashboards';
import { ErrorAlert, ErrorBoundary } from '@perses-dev/components';
import { PluginRegistry } from '@perses-dev/plugin-system';
import { DashboardResource, getDashboardDisplayName } from '@perses-dev/core';
import { useEffect, useMemo, useState } from 'react';
import { bundledPluginLoader } from '../../../model/bundled-plugins';
import AppBreadcrumbs from '../../../components/AppBreadcrumbs';
import { CachedDatasourceAPI, HTTPDatasourceAPI } from '../../../model/datasource-api';
import { buildGlobalVariableDefinition, buildProjectVariableDefinition } from '../../../utils/variables';
import { useVariableList } from '../../../model/variable-client';
import { useGlobalVariableList } from '../../../model/global-variable-client';

export interface GenericDashboardViewProps {
  dashboardResource: DashboardResource;
  onSave?: OnSaveDashboard;
  onDiscard?: (entity: DashboardResource) => void;
  isReadonly: boolean;
  isEditing: boolean;
  isCreating?: boolean;
}

/**
 * The View for displaying a Dashboard.
 */
export function HelperDashboardView(props: GenericDashboardViewProps) {
  const { dashboardResource, onSave, onDiscard, isReadonly, isEditing, isCreating } = props;

  const [datasourceApi] = useState(() => new CachedDatasourceAPI(new HTTPDatasourceAPI()));
  useEffect(() => {
    // warm up the caching of the datasources
    datasourceApi.listDatasources(dashboardResource.metadata.project);
    datasourceApi.listGlobalDatasources();
  }, [datasourceApi, dashboardResource]);

  // Collect the Project variables and setup external variables from it
  const { data: globalVars, isLoading: isLoadingGlobalVars } = useGlobalVariableList();
  const { data: projectVars, isLoading: isLoadingProjectVars } = useVariableList(dashboardResource.metadata.project);
  const externalVariableDefinitions: ExternalVariableDefinition[] | undefined = useMemo(
    () => [
      buildProjectVariableDefinition(dashboardResource.metadata.project, projectVars ?? []),
      buildGlobalVariableDefinition(globalVars ?? []),
    ],
    [dashboardResource, projectVars, globalVars]
  );

  if (isLoadingProjectVars || isLoadingGlobalVars) return null;

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        overflow: 'hidden',
      }}
    >
      <ErrorBoundary FallbackComponent={ErrorAlert}>
        <PluginRegistry
          pluginLoader={bundledPluginLoader}
          defaultPluginKinds={{
            Panel: 'TimeSeriesChart',
            TimeSeriesQuery: 'PrometheusTimeSeriesQuery',
          }}
        >
          <ErrorBoundary FallbackComponent={ErrorAlert}>
            <ViewDashboard
              dashboardResource={dashboardResource}
              datasourceApi={datasourceApi}
              externalVariableDefinitions={externalVariableDefinitions}
              dashboardTitleComponent={
                <AppBreadcrumbs
                  dashboardName={getDashboardDisplayName(dashboardResource)}
                  projectName={dashboardResource.metadata.project}
                />
              }
              emptyDashboardProps={{
                additionalText: 'In order to save this dashboard, you need to add at least one panel!',
              }}
              onSave={onSave}
              onDiscard={onDiscard}
              initialVariableIsSticky={true}
              isReadonly={isReadonly}
              isEditing={isEditing}
              isCreating={isCreating}
            />
          </ErrorBoundary>
        </PluginRegistry>
      </ErrorBoundary>
    </Box>
  );
}

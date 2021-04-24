// Copyright 2021 Amadeus s.a.s
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

package v1

import (
	"net/url"

	"github.com/perses/perses/pkg/client/perseshttp"
)

type ClientInterface interface {
	RESTClient() *perseshttp.RESTClient
	Datasource() DatasourceInterface
	Project() ProjectInterface
	PrometheusRule(project string) PrometheusRuleInterface
	User() UserInterface
}

type client struct {
	ClientInterface
	restClient *perseshttp.RESTClient
}

func NewWithClient(restClient *perseshttp.RESTClient) ClientInterface {
	return &client{
		restClient: restClient,
	}
}

func (c *client) RESTClient() *perseshttp.RESTClient {
	return c.restClient
}

func (c *client) Datasource() DatasourceInterface {
	return newDatasource(c.restClient)
}

func (c *client) Project() ProjectInterface {
	return newProject(c.restClient)
}

func (c *client) PrometheusRule(project string) PrometheusRuleInterface {
	return newPrometheusRule(c.restClient, project)
}

func (c *client) User() UserInterface {
	return newUser(c.restClient)
}

type query struct {
	name string
}

func (q *query) GetValues() url.Values {
	values := make(url.Values)
	if len(q.name) > 0 {
		values["name"] = []string{q.name}
	}
	return values
}

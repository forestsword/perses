# Configuration]

Perses is configured via command-line flags and a configuration file

## Flags available

```bash
  -config string
        Path to the yaml configuration file for the api. Configuration can be overridden when using the environment variable
  -log.level string
        log level. Possible value: panic, fatal, error, warning, info, debug, trace (default "info")
  -log.method-trace
        include the calling method as a field in the log. Can be useful to see immediately where the log comes from
  -web.hide-port
        If true, it won t be print on stdout the port listened to receive the HTTP request
  -web.listen-address string
        The address to listen on for HTTP requests, web interface and telemetry. (default ":8080")
  -web.telemetry-path string
        Path under which to expose metrics. (default "/metrics")
```

Example:

```bash
perses --config=./config.yaml --log.method-trace
```

## Configuration File

This service can be configured using a yaml file or the environment variable.

Note: you can use both, environment variable will override the yaml configuration.

```yaml
database:
  file: # the configuration when you want to use the filesystem as a database. Note that you can configure it using the flags, which gives you the choice to not create a configuration file just for that.
    folder: "/path/to/the/database/storage" # It's the path where the file will be read/ stored
    extension: "yaml" # The extension of the files read / stored. "yaml" or "json" are the only extension accepted. Yaml is the default one
```

Note: to have the corresponding environment variable you just have to contact all previous key in the yaml and put it in
uppercase. Every environment variable for this config are prefixed by `PERSES`

For example, the environment variable corresponding to the file extension of the file DB would be:

```bash
PERSES_DATABASE_FILE_EXTENSION=yaml
```

### Definition

The file is written in YAML format, defined by the scheme described below. Brackets indicate that a parameter is optional.

Generic placeholders are defined as follows:

* `<boolean>`: a boolean that can take the values `true` or `false`
* `<duration>`: a duration matching the regular expression `((([0-9]+)y)?(([0-9]+)w)?(([0-9]+)d)?(([0-9]+)h)?(([0-9]+)m)?(([0-9]+)s)?(([0-9]+)ms)?|0)`, e.g. `1d`, `1h30m`, `5m`, `10s`
* `<filename>`: a valid path in the current working directory
* `<path>`: a valid URL path
* `<int>`: an integer value
* `<secret>`: a regular string that is a secret, such as a password
* `<string>`: a regular string

```yaml
  # A flag that will disable any HTTP POST, PUT and DELETE endpoint in the API.
  # It will also change the UI to reflect this config, by removing any action button and will prevent the access to a form.
  [ readonly: <boolean> | default = false ]

  # It is activating or deactivating the permission verification on each endpoint.
  # When it is true, you will need a valid JWT token to contact most of the endpoints exposed by the API
  [ activate_permission: <boolean> | default = true ]

  # The secret key used to encrypt and decrypt sensitive data stored in the database such as any data in the Secret and GlobalSecret object.
  # Note that if it is not provided, it will be generated. 
  # When Perses is used in a multi instance mode, you should provide the key, otherwise, each instance will have a different key 
  # and therefore won't be able to decrypt what the other is encrypting.
  # Also note that the key must be at least 32 bytes long.
  [ encryption_key: <secret> ]

  # The path to the file containing the secret key.
  [ encryption_key_file: <filename> ]

  # Database configuration 
  database: <database_config>

  # The configuration to access the CUE schemas
  [ schemas: <schemas_config> ]

  # A list of dashboards you would like to display in the UI home page
  important_dashboards:
    - [ <dashboard_selector_config> ]

  # The markdown content to be displayed on the UI home page
  [ information: <string> ]
```

### `<database_config>`

```yaml
  # Config in case you want to use a file DB.
  # Prefer the SQL config in case you are running multiple Perses instances.
  [ file: <database_file_config> ]
  
  # The SQL config
  [ sql: <database_sql_config> ]
```

#### `<database_file_config>`

```yaml
  # The path to the folder containing the database
  folder: <path>

  # The file extension and so the file format used when storing and reading data from/to the database
  [ extension: <string> | default = yaml ]
```

#### `<database_sql_config>`

```yaml
  # TLS configuration.
  [ tls_config: <tls_config> ]

  # Username used for the connection
  [ user: <secret> ]

  # The password associated to the user. Mandatory if the user is set
  [ password: <secret> ]

  # The path to a file containing a password
  [ password_file: <filename> ]

  # Network type. For example "tcp"
  [ net: <string> ]

  # The network address. If set then `net` is mandatory. Example: "localhost:3306"
  [ addr: <secret> ]

  # Database name
  [ db_name: <string> ]
  [ collation: <string> ]

  # Max packet size allowed
  [ max_allowed_packet: <int> ]

  # Server public key name
  [ server_pub_key: <string> ]

  # Dial timeout
  [ timeout: <duration> ]

  # I/O read timeout
  [ read_timeout: <duration> ]

  # I/O write timeout
  [ write_timeout: <duration> ]

  # Allow all files to be used with LOAD DATA LOCAL INFILE
  [ allow_all_files: <boolean> | default = false ]

  # Allows the cleartext client side plugin
  [ allow_cleartext_passwords: <boolean> | default = false ]

  # Allows fallback to unencrypted connection if server does not support TLS
  [ allow_fallback_to_plaintext: <boolean> | default = false ]

  # Allows the native password authentication method
  [ allow_native_passwords: <boolean> | default = false ]

  # Allows the old insecure password method
  [ allow_old_passwords: <boolean> | default = false ]

  # Check connections for liveness before using them
  [ check_conn_liveness: <boolean> | default = false ]

  # Return number of matching rows instead of rows changed
  [ client_found_rows: <boolean> | default = false ]

  # Prepend table alias to column names
  [ columns_with_alias: <boolean> | default = false ]

  # Interpolate placeholders into query string
  [ interpolate_params: <boolean> | default = false ]

  # Allow multiple statements in one query
  [ multi_statements: <boolean> | default = false ]

  # Parse time values to time.Time
  [ parse_time: <boolean> | default = false ]

  # Reject read-only connections
  [ reject_read_only: <boolean> | default = false ]
```

### `<schemas_config>`

```yaml
    # Path to the Cue schemas of the panels
  [ panels_path: <path> | default = "schemas/panels" ]

  # Path to the Cue schemas of the queries
  [ queries_path: <path> | default = "schemas/queries" ]

  # Path to the Cue schemas of the datasources
  [ datasources_path: <path> | default = "schemas/datasources" ]

  # Path to the Cue schemas of the variables
  [ variables_path: <path> | default = "schemas/variables" ]

  # The refresh interval of the cue schemas regardless their paths
  [ interval: <duration> | default = 1h ]
```

### `<tls_config>`

A `tls_config` allows configuring TLS connections.

```yaml
# CA certificate to validate API server certificate with. At most one of ca and ca_file is allowed.
[ ca: <string> ]
[ ca_file: <filename> ]

# Certificate and key for client cert authentication to the server.
# At most one of cert and cert_file is allowed.
# At most one of key and key_file is allowed.
[ cert: <string> ]
[ cert_file: <filename> ]
[ key: <secret> ]
[ key_file: <filename> ]

# ServerName extension to indicate the name of the server.
# https://tools.ietf.org/html/rfc4366#section-3.1
[ server_name: <string> ]

# Disable validation of the server certificate.
[ insecure_skip_verify: <boolean> ]

# Minimum acceptable TLS version. Accepted values: TLS10 (TLS 1.0), TLS11 (TLS
# 1.1), TLS12 (TLS 1.2), TLS13 (TLS 1.3).
# If unset, Prometheus will use Go default minimum version, which is TLS 1.2.
# See MinVersion in https://pkg.go.dev/crypto/tls#Config.
[ min_version: <string> ]
# Maximum acceptable TLS version. Accepted values: TLS10 (TLS 1.0), TLS11 (TLS
# 1.1), TLS12 (TLS 1.2), TLS13 (TLS 1.3).
# If unset, Prometheus will use Go default maximum version, which is TLS 1.3.
# See MaxVersion in https://pkg.go.dev/crypto/tls#Config.
[ max_version: <string> ]
```

### `<dashboard_selector_config>`

```yaml
  # The project name (dashboard.metadata.project)
  project: <string>

  # The dashboard name (dashboard.metadata.name)
  dashboard: <string>
```

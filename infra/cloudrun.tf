terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ── Cloud Run service (multi-container with Datadog sidecar) ─────────────────
resource "google_cloud_run_service" "fourdoorai" {
  name     = var.service_name
  location = var.region

  template {
    metadata {
      annotations = {
        # Sidecar must be ready before the main app starts.
        "run.googleapis.com/container-dependencies" = jsonencode({
          main-app = ["datadog-agent"]
        })
      }
      labels = {
        service = var.service_name
        env     = var.environment
      }
    }

    spec {
      # ── Shared volume (in-memory) for log forwarding ──────────────────────
      # The main app writes logs to /shared-volume/logs/*.log;
      # the Datadog sidecar tails them via DD_SERVERLESS_LOG_PATH.
      volumes {
        name = "shared-volume"
        empty_dir {
          medium = "Memory"
        }
      }

      # ── Main application container ────────────────────────────────────────
      containers {
        name  = "main-app"
        image = var.container_image

        # Cloud Run routes inbound HTTPS to this port.
        # server.ts listens on PORT (default 3000).
        ports {
          container_port = 3000
        }

        volume_mounts {
          name       = "shared-volume"
          mount_path = "/shared-volume"
        }

        startup_probe {
          tcp_socket {
            port = 3000
          }
          initial_delay_seconds = 0
          period_seconds        = 10
          failure_threshold     = 3
          timeout_seconds       = 1
        }

        # ── Unified Service Tagging ─────────────────────────────────────────
        env {
          name  = "DD_SERVICE"
          value = var.service_name
        }
        env {
          name  = "DD_ENV"
          value = var.environment
        }
        env {
          name  = "DD_VERSION"
          value = var.app_version
        }

        # ── Datadog transport ───────────────────────────────────────────────
        # Point dd-trace at the local Datadog agent running in the sidecar.
        # src/lib/datadog.ts checks DD_TRACE_AGENT_URL: when set it uses
        # agent mode (agentlessEnabled: false) instead of HTTPS agentless.
        # The sidecar runs the trace endpoint on localhost:8126 by default.
        env {
          name  = "DD_TRACE_AGENT_URL"
          value = "http://localhost:8126"
        }
        env {
          name  = "DD_SITE"
          value = "datadoghq.eu"
        }
        env {
          name  = "DD_LLMOBS_ML_APP"
          value = "fourdoorai"
        }
        # NOTE: Do NOT set NODE_OPTIONS=--require dd-trace/init here.
        # server.ts already imports ./src/lib/datadog.js as its first line,
        # which initialises dd-trace with LLMObs config. Using --require would
        # initialise dd-trace before that module loads, bypassing the LLMObs
        # configuration and breaking LLM Observability traces.

        resources {
          limits = {
            memory = "512Mi"
            cpu    = "1"
          }
        }
      }

      # ── Datadog sidecar (serverless-init as local agent) ──────────────────
      containers {
        name  = "datadog-agent"
        image = "gcr.io/datadoghq/serverless-init:latest"

        volume_mounts {
          name       = "shared-volume"
          mount_path = "/shared-volume"
        }

        startup_probe {
          tcp_socket {
            # DD_HEALTH_PORT below — must not conflict with main-app port 3000.
            port = 3001
          }
          initial_delay_seconds = 0
          period_seconds        = 10
          failure_threshold     = 3
          timeout_seconds       = 1
        }

        env {
          name  = "DD_SITE"
          value = "datadoghq.eu"
        }
        env {
          name  = "DD_API_KEY"
          value = var.dd_api_key   # injected from terraform.tfvars or TF_VAR_dd_api_key
        }
        env {
          name  = "DD_SERVICE"
          value = var.service_name
        }
        env {
          name  = "DD_ENV"
          value = var.environment
        }
        env {
          name  = "DD_VERSION"
          value = var.app_version
        }
        # Tail log files written by the main container to the shared volume.
        # Leading slash is required — the original template was missing it.
        env {
          name  = "DD_SERVERLESS_LOG_PATH"
          value = "/shared-volume/logs/*.log"
        }
        env {
          name  = "DD_LOGS_INJECTION"
          value = "true"
        }
        env {
          name  = "DD_LOG_LEVEL"
          value = "warn"   # set to "debug" only temporarily for troubleshooting
        }
        # Health check port for the sidecar itself.
        # Must differ from main-app port (3000) to avoid a bind conflict.
        env {
          name  = "DD_HEALTH_PORT"
          value = "3001"
        }

        resources {
          limits = {
            memory = "256Mi"
            cpu    = "0.5"
          }
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  # Required for multi-container (sidecar) support.
  metadata {
    annotations = {
      "run.googleapis.com/launch-stage" = "BETA"
    }
  }
}

# ── Public access ─────────────────────────────────────────────────────────────
# Remove this resource and add Cloud IAP or VPC-SC if the service is not
# intended to be publicly accessible.
resource "google_cloud_run_service_iam_member" "invoker" {
  service  = google_cloud_run_service.fourdoorai.name
  location = google_cloud_run_service.fourdoorai.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ── Outputs ───────────────────────────────────────────────────────────────────
output "service_url" {
  description = "Public URL of the deployed Cloud Run service"
  value       = google_cloud_run_service.fourdoorai.status[0].url
}

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run"
  type        = string
  default     = "europe-west1"
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "fourdoorai"
}

variable "container_image" {
  description = "Fully-qualified container image for the main app (e.g. gcr.io/my-project/fourdoorai:v1.2.3)"
  type        = string
}

variable "app_version" {
  description = "Application version tag (used for DD_VERSION unified service tagging)"
  type        = string
  default     = "latest"
}

variable "environment" {
  description = "Deployment environment (e.g. staging, production)"
  type        = string
  default     = "staging"
}

# ── Sensitive ────────────────────────────────────────────────────────────────
# Store the actual value in terraform.tfvars (gitignored) or pass via:
#   TF_VAR_dd_api_key=<key> terraform apply
variable "dd_api_key" {
  description = "Datadog API key for the EU region. Never hardcode — set in terraform.tfvars or via TF_VAR_dd_api_key env var."
  type        = string
  sensitive   = true
}

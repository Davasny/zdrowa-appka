variable "image" {
  type = string
}

job "zdrowappka" {
  type = "service"

  datacenters = ["*"]
  namespace   = "zdrowappka"

  group "zdrowappka" {
    count = 1

    task "zdrowappka" {
      driver = "docker"

      config {
        image        = var.image
        ports        = ["frontend"]
        network_mode = "bridge2"
      }

      resources {
        memory = 1024
      }

      env {
        STORAGE_FILE_PATH = "/mnt/data/jobsStorage.json"
      }

      template {
        data        = <<EOF
ZDROFIT_USERNAME={{ with nomadVar "nomad/jobs/zdrowappka" }}{{ .ZDROFIT_USERNAME }}{{ end }}
ZDROFIT_PASSWORD={{ with nomadVar "nomad/jobs/zdrowappka" }}{{ .ZDROFIT_PASSWORD }}{{ end }}
EOF
        destination = "local/.env"
        env         = true
      }

      volume_mount {
        volume      = "zdrowappka"
        destination = "/mnt/data"
        read_only   = false
      }
    }

    network {
      port "frontend" {
        to     = 3000
        static = 4002
      }
    }

    restart {
      attempts = 3
      delay    = "15s"
      mode     = "delay"
      interval = "5m"
    }

    update {
      max_parallel      = 1
      min_healthy_time  = "10s"
      healthy_deadline  = "5m"
      progress_deadline = "1h"
      stagger           = "20s"
    }

    volume "zdrowappka" {
      type      = "host"
      source    = "zdrowappka"
      read_only = false
    }
  }
}

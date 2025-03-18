terraform {
  required_providers {
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "1.10.0"
    }
  }
  
  backend "s3" {
    bucket = "terraform-state-${var.project_name}"
    key    = "mongodb/terraform.tfstate"
    region = "ap-northeast-2"
  }
}

provider "mongodbatlas" {
  public_key  = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}

resource "mongodbatlas_project" "golf_simulator" {
  name   = var.project_name
  org_id = var.mongodb_atlas_org_id
}

resource "mongodbatlas_cluster" "cluster" {
  project_id = mongodbatlas_project.golf_simulator.id
  name       = "${var.project_name}-cluster"
  
  provider_name               = "TENANT"
  backing_provider_name       = "AWS"
  provider_region_name        = "AP_NORTHEAST_2"
  provider_instance_size_name = "M0" # 무료 티어
  
  mongo_db_major_version = "5.0"
  auto_scaling_disk_gb_enabled = false
}

resource "mongodbatlas_database_user" "db_user" {
  project_id = mongodbatlas_project.golf_simulator.id
  
  username           = var.db_username
  password           = var.db_password
  auth_database_name = "admin"
  
  roles {
    role_name     = "readWrite"
    database_name = var.db_name
  }
}

resource "mongodbatlas_project_ip_access_list" "ip_access_list" {
  project_id = mongodbatlas_project.golf_simulator.id
  cidr_block = "0.0.0.0/0" # 모든 IP 허용 (개발용)
  comment    = "Allow access from anywhere"
}

output "connection_string" {
  value       = "mongodb+srv://${var.db_username}:${var.db_password}@${mongodbatlas_cluster.cluster.connection_strings[0].standard}/${var.db_name}?retryWrites=true&w=majority"
  sensitive   = true
  description = "MongoDB 연결 문자열"
} 
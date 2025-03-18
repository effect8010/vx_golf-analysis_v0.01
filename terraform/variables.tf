variable "mongodb_atlas_public_key" {
  type        = string
  description = "MongoDB Atlas API 공개 키"
  sensitive   = true
}

variable "mongodb_atlas_private_key" {
  type        = string
  description = "MongoDB Atlas API 개인 키"
  sensitive   = true
}

variable "mongodb_atlas_org_id" {
  type        = string
  description = "MongoDB Atlas 조직 ID"
}

variable "project_name" {
  type        = string
  description = "프로젝트 이름"
  default     = "golf-simulator"
}

variable "db_username" {
  type        = string
  description = "MongoDB 사용자 이름"
  default     = "golf_admin"
}

variable "db_password" {
  type        = string
  description = "MongoDB 비밀번호"
  sensitive   = true
}

variable "db_name" {
  type        = string
  description = "데이터베이스 이름"
  default     = "golf_simulator"
} 
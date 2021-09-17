variable "aws_access_key" {
  description = "AWS access key"
}

variable "aws_secret_key" {
  description = "AWS secret key"
}

variable "ssh_key_name" {
  description = "ssh key name"
}

variable "subnet_id" {
  description = "Internal sublet id"
}

variable "private_key" {
  description = "SSH key to connect to runner instance"
}

variable "region" {
  default = "us-west-2"
}

variable "ssh_user_name" {
  default = "ec2-user"
}

variable "instance_type" {
  default = "t2.medium"
}

variable "tag_name" {
  description = "Your user name tag value"
  default = "yb-qa"
}

variable "base_image_id" {
  default = "ami-0c2d06d50ce30b442"
}

variable "vpc_id" {
  description = "Private VPC ID"
}

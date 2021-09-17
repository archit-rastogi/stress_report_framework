output "load_client_ips" {
  value = aws_instance.service.private_ip
}

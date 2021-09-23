
resource "aws_security_group" "report_security" {
  name = "Report service security group"

  vpc_id = var.vpc_id

  ingress {
    description = "SSH access from everywhere"
    cidr_blocks = ["0.0.0.0/0"]
    protocol = "tcp"
    from_port = 22
    to_port = 22
  }

  ingress {
    description = "Frontend"
    cidr_blocks = ["0.0.0.0/0"]
    protocol = "tcp"
    from_port = 80
    to_port = 80
  }

  ingress {
    description = "Report receive"
    cidr_blocks = ["0.0.0.0/0"]
    protocol = "tcp"
    from_port = 9999
    to_port = 9999
  }

  ingress {
    description = "Files"
    cidr_blocks = ["0.0.0.0/0"]
    protocol = "tcp"
    from_port = 9998
    to_port = 9998
  }

  ingress {
    description = "DB YSQL"
    cidr_blocks = ["0.0.0.0/0"]
    protocol = "tcp"
    from_port = 5433
    to_port = 5433
  }

  egress {
    description = "Allow all egress tcp traffic"
    cidr_blocks = ["0.0.0.0/0"]
    protocol    = "tcp"
    from_port   = 0
    to_port     = 65535
  }

  egress {
    description = "Allow all egress udp traffic"
    cidr_blocks = ["0.0.0.0/0"]
    protocol    = "udp"
    from_port   = 0
    to_port     = 65535
  }

  tags = {
    Name = var.tag_name
  }
}

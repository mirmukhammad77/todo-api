output "api_url" {
  value = "http://${aws_lb.api.dns_name}"
}

output "instance_id" {
  value = aws_instance.api.id
}

output "private_ip" {
  value = aws_instance.api.private_ip
}

output "table_name" {
  value = aws_dynamodb_table.todos.name
}
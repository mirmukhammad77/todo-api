resource "aws_iam_role" "ec2" {
  name_prefix = "todo-api-ec2-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Principal = {
        Service = "ec2.amazonaws.com"
      }

      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "dynamodb" {
  name = "todo-table-access"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect   = "Allow"
      Action   = local.todo_actions
      Resource = aws_dynamodb_table.todos.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role = aws_iam_role.ec2.name

  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2" {
  name_prefix = "todo-api-"
  role        = aws_iam_role.ec2.name
}
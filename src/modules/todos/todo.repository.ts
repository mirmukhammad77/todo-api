import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoArgs {
  title: string;
}

export interface UpdateTodoArgs {
  title?: string;
  completed?: boolean;
}

export interface ListTodosArgs {
  limit?: number;
  cursor?: string;
}

export interface TodosPage {
  items: Todo[];
  nextCursor: string | null;
}

@Injectable()
export class TodoRepository implements OnModuleDestroy {
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(config: ConfigService) {
    this.tableName = config.getOrThrow<string>('DYNAMODB_TABLE_NAME');

    this.client = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: config.getOrThrow<string>('AWS_REGION'),
      }),
    );
  }

  async create(args: CreateTodoArgs): Promise<Todo> {
    const now = new Date().toISOString();

    const todo: Todo = {
      id: randomUUID(),
      title: args.title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: todo,
        ConditionExpression: 'attribute_not_exists(id)',
      }),
    );

    return todo;
  }

  async findAll(args: ListTodosArgs = {}): Promise<TodosPage> {
    const limit = args.limit ?? 10;

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestException(
        'Limit must be an integer between 1 and 100',
      );
    }

    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        Limit: limit,
        ExclusiveStartKey: args.cursor
          ? { id: args.cursor }
          : undefined,
      }),
    );

    return {
      items: (result.Items ?? []) as Todo[],
      nextCursor: result.LastEvaluatedKey
        ? (result.LastEvaluatedKey.id as string)
        : null,
    };
  }

  async findById(id: string): Promise<Todo | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
        ConsistentRead: true,
      }),
    );

    return result.Item ? (result.Item as Todo) : null;
  }

  async update(id: string, args: UpdateTodoArgs): Promise<Todo> {
    if (args.title === undefined && args.completed === undefined) {
      throw new BadRequestException(
        'Provide a title or completed value',
      );
    }

    const updates = ['#updatedAt = :updatedAt'];

    const names: Record<string, string> = {
      '#updatedAt': 'updatedAt',
    };

    const values: Record<string, string | boolean> = {
      ':updatedAt': new Date().toISOString(),
    };

    if (args.title !== undefined) {
      updates.push('#title = :title');
      names['#title'] = 'title';
      values[':title'] = args.title;
    }

    if (args.completed !== undefined) {
      updates.push('#completed = :completed');
      names['#completed'] = 'completed';
      values[':completed'] = args.completed;
    }

    try {
      const result = await this.client.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { id },
          UpdateExpression: `SET ${updates.join(', ')}`,
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
          ConditionExpression: 'attribute_exists(id)',
          ReturnValues: 'ALL_NEW',
        }),
      );

      return result.Attributes as Todo;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new NotFoundException('Todo not found');
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { id },
          ConditionExpression: 'attribute_exists(id)',
        }),
      );
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        throw new NotFoundException('Todo not found');
      }

      throw error;
    }
  }

  onModuleDestroy(): void {
    this.client.destroy();
  }
}
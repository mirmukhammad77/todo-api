import { Injectable, NotFoundException } from '@nestjs/common';
import {
  TodoRepository,
  type CreateTodoArgs,
  type ListTodosArgs,
  type Todo,
  type TodosPage,
  type UpdateTodoArgs,
} from './todo.repository.js';

@Injectable()
export class TodosService {
  constructor(private readonly todosRepository: TodoRepository) {}

  async create(args: CreateTodoArgs): Promise<Todo> {
    return this.todosRepository.create(args);
  }

  async findAll(args: ListTodosArgs = {}): Promise<TodosPage> {
    return this.todosRepository.findAll(args);
  }

  async findById(id: string): Promise<Todo> {
    const todo = await this.todosRepository.findById(id);

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async update(id: string, args: UpdateTodoArgs): Promise<Todo> {
    return this.todosRepository.update(id, args);
  }

  async delete(id: string): Promise<void> {
    await this.todosRepository.delete(id);
  }
}
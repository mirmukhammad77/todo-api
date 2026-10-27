import { Module } from "@nestjs/common";
import { TodoRepository } from "./todo.repository.js";
import { TodosController } from "./todo.controller.js";
import { TodosService } from "./todo.service.js";

@Module({
    imports: [],
    controllers: [TodosController],
    providers: [TodosService, TodoRepository],
})
export class TodosModule{}
